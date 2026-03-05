/**
 * Editor Prompts — system prompts for the Socratic poetry coach.
 *
 * Two prompt types:
 * 1. Coaching prompt: main conversation with the poet
 * 2. Learning extraction prompt: cheap Haiku call to extract insights
 */

import type { PoetProfile, AnalysisContext } from '../types/editor';

export interface CollectionPoemForPrompt {
  title: string;
  content: string;
  sectionName: string | null; // null = root level
}

export interface CollectionContext {
  poems: CollectionPoemForPrompt[];
  collectionName: string;
}

// Rough character budget for collection context in the system prompt.
// Sonnet 4.5 has a 200k token context; we want to leave plenty of room
// for conversation history. ~40k chars ≈ ~10k tokens is a safe budget.
const COLLECTION_CHAR_BUDGET = 40_000;

/**
 * Build the coaching system prompt for the main editor conversation.
 */
export function buildCoachingPrompt(
  profile: PoetProfile,
  poemTitle: string,
  poemText: string,
  analysis?: AnalysisContext,
  collection?: CollectionContext,
): string {
  const profileSection = profile.summary
    ? `\nABOUT THIS POET:\n${profile.summary}\n`
    : profile.onboardingCompleted
      ? buildProfileFromOnboarding(profile)
      : '\nThis is a new poet — you don\'t know them yet. Be curious, ask questions.\n';

  const analysisSection = analysis
    ? `\nTECHNICAL ANALYSIS (reference naturally, don't lead with):\nForm: ${analysis.form}\nMeter: ${analysis.meter}\nRhyme scheme: ${analysis.rhymeScheme}\nCliches found: ${analysis.clicheCount}\nAbstract/concrete balance: ${analysis.abstractConcreteRatio}\n${analysis.summaryItems.length > 0 ? 'Coaching notes: ' + analysis.summaryItems.join(' ') : ''}\n`
    : '';

  // Build collection context
  const collectionSection = buildCollectionSection(collection, poemTitle);

  const { directness, tone } = profile.feedbackStyle;

  return `You are a Socratic poetry editor — a thoughtful, experienced reader who helps poets discover what they're trying to say. You never impose your voice on the work. You are not an AI assistant giving generic praise. You are a specific, opinionated reader with taste.

Your approach:
- Give specific, craft-focused observations about what's working and what isn't
- When something isn't working, explain what you see and why it matters
- Only suggest rewrites when explicitly asked — frame as "what if" inspiration, not prescription
- If the poet's instinct conflicts with "the rules," explore both sides
- Reference past conversations naturally when relevant
- If the technical analysis and your reading disagree, explain both perspectives
- Think about the poem's internal logic, not just surface technique
- When referencing other poems in the collection, use their EXACT title as listed

The subtext of everything you do: help this poet find their own voice. Fight the gravity of generic "good poem" language. Find the human inside, the voice inside the human.
${profileSection}
CURRENT POEM: "${poemTitle}"
---
${poemText}
---
${analysisSection}${collectionSection}
FEEDBACK STYLE: ${directness}, ${tone}
${directness === 'gentle' ? 'Be warm and encouraging. Lead with what works. Frame suggestions as questions.' : ''}${directness === 'direct' ? 'Be straightforward and honest. The poet wants real critique, not hand-holding.' : ''}${directness === 'balanced' ? 'Balance honesty with encouragement. Be direct about issues but frame them constructively.' : ''}
${tone === 'challenging' ? 'Push the poet. Ask hard questions. Don\'t let them settle for easy answers.' : ''}${tone === 'encouraging' ? 'Be supportive. Celebrate progress. Frame challenges as opportunities.' : ''}

RESPONSE FORMAT:
- Use **bold** for emphasis and *italics* for quoted phrases from the poem
- Keep responses concise — a few focused observations, not an essay
- If the poem is short, your response should be short too
- End with a brief "Potential next steps:" section (2-3 short suggestions the poet might explore) — but don't frame them as questions or options to pick from. Just plant seeds.
- Never use phrases like "great poem" or "I love this" without specific justification
- Use the poet's own words when pointing to specific moments
- You can disagree with the technical analysis if your reading differs — explain why
- DON'T end by asking the poet a question. Let them come to you.

CRITICAL GROUNDING RULES:
- You may ONLY reference poems whose full text appears in this prompt. The poems provided above are the COMPLETE set.
- Use EXACT titles as listed. Do not add numbers, prefixes, or modify titles in any way.
- When quoting lines from poems, quote ONLY text that literally appears in the poem text provided above.
- If the poet asks about a poem you don't have text for, say you don't have access to it.
- NEVER fabricate, paraphrase, or guess poem content. If it's not in this prompt, you don't know it.`;
}

/**
 * Build the collection section of the prompt, respecting size budget.
 */
function buildCollectionSection(
  collection: CollectionContext | undefined,
  currentPoemTitle: string,
): string {
  if (!collection || collection.poems.length <= 1) return '';

  // Filter out the current poem (match by title only — content may be stale)
  const otherPoems = collection.poems.filter(p => p.title !== currentPoemTitle);
  if (otherPoems.length === 0) return '';

  // Build title index (no numbering — just titles grouped by section)
  const sections = new Map<string, string[]>();
  for (const p of collection.poems) {
    const section = p.sectionName || '(no section)';
    if (!sections.has(section)) sections.set(section, []);
    const marker = p.title === currentPoemTitle ? ' ← CURRENT' : '';
    sections.get(section)!.push(`  - "${p.title}"${marker}`);
  }

  let titleIndex = '';
  for (const [section, titles] of sections) {
    if (section === '(no section)') {
      titleIndex += titles.join('\n') + '\n';
    } else {
      titleIndex += `[${section}]\n${titles.join('\n')}\n`;
    }
  }

  // Build full poem texts, respecting the character budget
  let totalChars = 0;
  const includedPoems: string[] = [];
  const skippedPoems: string[] = [];

  for (const p of otherPoems) {
    const poemBlock = `=== "${p.title}" ===\n${p.content}\n`;
    if (totalChars + poemBlock.length <= COLLECTION_CHAR_BUDGET) {
      includedPoems.push(poemBlock);
      totalChars += poemBlock.length;
    } else {
      skippedPoems.push(p.title);
    }
  }

  let result = `\nCOLLECTION: "${collection.collectionName}" (${collection.poems.length} poems total)

POEM INDEX:
${titleIndex}
The poet is currently focused on "${currentPoemTitle}". You have access to the other poems in their collection below. Reference them by their EXACT title when relevant.\n`;

  if (includedPoems.length > 0) {
    result += `\nOTHER POEMS IN COLLECTION:\n\n${includedPoems.join('\n')}\n`;
  }

  if (skippedPoems.length > 0) {
    result += `\n(${skippedPoems.length} additional poems not shown due to length: ${skippedPoems.map(t => `"${t}"`).join(', ')})\n`;
  }

  return result;
}

function buildProfileFromOnboarding(profile: PoetProfile): string {
  const d = profile.onboardingData;
  const parts: string[] = ['\nABOUT THIS POET (from onboarding):'];
  if (d.goals) parts.push(`Goals: ${d.goals}`);
  if (d.influences) parts.push(`Influences: ${d.influences}`);
  if (d.favoritPoets) parts.push(`Favorite poets: ${d.favoritPoets}`);
  if (d.workingOn) parts.push(`Currently working on: ${d.workingOn}`);
  if (d.additionalContext) parts.push(`Additional context: ${d.additionalContext}`);
  return parts.join('\n') + '\n';
}

/**
 * Build the learning extraction prompt (used with Haiku for cheap extraction).
 */
export function buildLearningExtractionPrompt(
  existingSummary: string,
  recentMessages: Array<{ role: string; content: string }>,
): string {
  const conversationText = recentMessages
    .map(m => `${m.role === 'user' ? 'Poet' : 'Editor'}: ${m.content}`)
    .join('\n\n');

  return `Extract 1-3 NEW factual observations about this poet from the conversation below. Only genuinely new insights not already covered by existing knowledge. Focus on:
- What they care about in their poetry
- Stylistic preferences or tendencies
- What they're working on or struggling with
- Their relationship with specific techniques or forms
- Their voice, themes, or aesthetic

Return ONLY a JSON array. If nothing new was learned, return an empty array.
Format: [{"insight": "string"}]

EXISTING KNOWLEDGE:
${existingSummary || 'No existing knowledge yet.'}

RECENT CONVERSATION:
${conversationText}`;
}

/**
 * Build the summary regeneration prompt (used periodically to compact learnings).
 */
export function buildSummaryPrompt(
  onboardingData: PoetProfile['onboardingData'],
  learnings: PoetProfile['learnings'],
): string {
  const onboardingParts: string[] = [];
  if (onboardingData.goals) onboardingParts.push(`Goals: ${onboardingData.goals}`);
  if (onboardingData.influences) onboardingParts.push(`Influences: ${onboardingData.influences}`);
  if (onboardingData.favoritPoets) onboardingParts.push(`Favorite poets: ${onboardingData.favoritPoets}`);
  if (onboardingData.workingOn) onboardingParts.push(`Working on: ${onboardingData.workingOn}`);
  if (onboardingData.additionalContext) onboardingParts.push(`Additional: ${onboardingData.additionalContext}`);

  const learningsList = learnings
    .map(l => `- ${l.insight} (${l.date.slice(0, 10)})`)
    .join('\n');

  return `Write a concise 2-4 sentence summary of everything known about this poet. This summary will be included in every coaching prompt, so it should be compact and useful. Write in second person ("you").

ONBOARDING:
${onboardingParts.join('\n') || 'No onboarding data.'}

ACCUMULATED OBSERVATIONS (${learnings.length} total):
${learningsList || 'None yet.'}

Write the summary now. Be specific, not generic.`;
}
