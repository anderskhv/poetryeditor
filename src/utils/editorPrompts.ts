/**
 * Editor Prompts — system prompts for the Socratic poetry coach.
 *
 * Two prompt types:
 * 1. Coaching prompt: main conversation with the poet
 * 2. Learning extraction prompt: cheap Haiku call to extract insights
 */

import type { PoetProfile, AnalysisContext } from '../types/editor';

export interface CollectionContext {
  poems: Array<{ title: string; content: string }>;
  collectionName: string;
}

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

  // Build collection context — include other poems so the editor can reference them
  let collectionSection = '';
  if (collection && collection.poems.length > 1) {
    const otherPoems = collection.poems
      .filter(p => p.title !== poemTitle || p.content !== poemText)
      .map(p => `### ${p.title}\n${p.content}`)
      .join('\n\n---\n\n');

    if (otherPoems) {
      collectionSection = `\nCOLLECTION: "${collection.collectionName}" (${collection.poems.length} poems total)\nThe poet is currently focused on "${poemTitle}" but you have access to their full collection. Reference other poems naturally when relevant — for themes, patterns, progression, contradictions, or when the poet asks.\n\nOTHER POEMS IN COLLECTION:\n${otherPoems}\n`;
    }
  }

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
- When referencing other poems in the collection, be specific about connections

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
- DON'T end by asking the poet a question. Let them come to you.`;
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
