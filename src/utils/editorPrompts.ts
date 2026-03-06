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
  otherDiscussions?: Array<{ poemTitle: string; summary: string }>,
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

  // Build discussions section if available
  const discussionsSection = otherDiscussions && otherDiscussions.length > 0
    ? `\nRECENT DISCUSSIONS ABOUT OTHER POEMS:\n${otherDiscussions.map(d => `- "${d.poemTitle}": ${d.summary}`).join('\n')}\n`
    : '';

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
${analysisSection}${collectionSection}${discussionsSection}
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
    const section = p.sectionName != null && p.sectionName !== '' ? p.sectionName : '(no section)';
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
 * Build the conversation summary extraction prompt (used with Haiku for cheap extraction).
 */
export function buildConversationSummaryPrompt(
  recentMessages: Array<{ role: string; content: string }>,
  poemTitle: string,
): string {
  const conversationText = recentMessages
    .map(m => `${m.role === 'user' ? 'Poet' : 'Editor'}: ${m.content}`)
    .join('\n\n');

  return `Summarize the key discussion points about "${poemTitle}" from this conversation in 1-3 sentences. Focus on:
- What was discussed about the poem
- Any revision plans mentioned
- Specific feedback or suggestions given

Return ONLY the summary text, no JSON or markdown.

CONVERSATION:
${conversationText}`;
}

/**
 * Build the collection-level analysis prompt.
 */
export function buildCollectionAnalysisPrompt(
  profile: PoetProfile,
  collection: CollectionContext,
  _otherDiscussions?: Array<{ poemTitle: string; summary: string }>,
): string {
  const profileSection = profile.summary
    ? `\nABOUT THIS POET:\n${profile.summary}\n`
    : profile.onboardingCompleted
      ? buildProfileFromOnboarding(profile)
      : '\nThis is a new poet — you don\'t know them yet. Be curious, ask questions.\n';

  // Build all poems (no current poem exclusion)
  const sections = new Map<string, string[]>();
  for (const p of collection.poems) {
    const section = p.sectionName != null && p.sectionName !== '' ? p.sectionName : '(no section)';
    if (!sections.has(section)) sections.set(section, []);
    sections.get(section)!.push(`  - "${p.title}"`);
  }

  let titleIndex = '';
  for (const [section, titles] of sections) {
    if (section === '(no section)') {
      titleIndex += titles.join('\n') + '\n';
    } else {
      titleIndex += `[${section}]\n${titles.join('\n')}\n`;
    }
  }

  // Build full poem texts
  let totalChars = 0;
  const includedPoems: string[] = [];
  const skippedPoems: string[] = [];

  for (const p of collection.poems) {
    const poemBlock = `=== "${p.title}" ===\n${p.content}\n`;
    if (totalChars + poemBlock.length <= COLLECTION_CHAR_BUDGET) {
      includedPoems.push(poemBlock);
      totalChars += poemBlock.length;
    } else {
      skippedPoems.push(p.title);
    }
  }

  let collectionSection = `\nCOLLECTION: "${collection.collectionName}" (${collection.poems.length} poems total)

POEM INDEX:
${titleIndex}`;

  if (includedPoems.length > 0) {
    collectionSection += `\nALL POEMS IN COLLECTION:\n\n${includedPoems.join('\n')}\n`;
  }

  if (skippedPoems.length > 0) {
    collectionSection += `\n(${skippedPoems.length} additional poems not shown due to length: ${skippedPoems.map(t => `"${t}"`).join(', ')})\n`;
  }

  return `You are a top-tier poetry editor producing a full editorial report on a manuscript. Be blunt in the way a good editor is blunt: the manuscript may be strong, but the work now is precision, consistency, and removing anything that interrupts the spell.

This is a STANDALONE editorial report. Do not reference any previous conversations or chats. Produce a clean, self-contained document.
${profileSection}
${collectionSection}

YOUR EDITORIAL REPORT MUST FOLLOW THIS STRUCTURE:

**1. OPENING EDITORIAL STATEMENT** (2-3 sentences)
Your honest, direct assessment of where this collection stands. What is working at the macro level. What the remaining editorial work is. Be specific — no generic praise.

**2. SECTION-BY-SECTION SPINE ANALYSIS**
If the collection has sections/chapters, analyze each one:
- **What is this section trying to do?** State the section's apparent purpose, theme, or emotional arc.
- **Does it succeed?** Be honest. If you're not sure what a section is doing, say so — "I'm not entirely sure what holds these together" is more useful than guessing.
- **Section rating: X/10** with a one-sentence justification
- **Specific concerns** — what is working, what isn't, what feels out of place within this section
If there are no sections, skip this and go straight to per-poem notes.

**3. PER-POEM EDITORIAL NOTES** (for every poem in the collection)
For EACH poem, provide:
- **Rating: X/10** — with a one-sentence justification
- **What it achieves** — one sentence on what the poem does well
- **Line-edit targets** — quote the specific line, explain the issue, then give 2-3 concrete alternative wordings. Format: *"quoted line"* — [issue]. Alternatives: "option A" / "option B" / "option C"
- **Editorial decision** — if you would cut, keep, rewrite, or expand, say so and say why. If you are uncertain, say so explicitly: "I'm not sure about this — it could go either way because..."

Do not skip poems. Every poem gets a section.

**4. GLOBAL FIXES** (issues across the whole manuscript)
List recurring problems: consistency issues, repeated imagery that weakens, tonal shifts that don't work, formatting or punctuation patterns that need cleanup. Be specific with examples.

**5. SEQUENCING & ARC**
Comment on the ordering of poems. Does the arc work? Are there poems that should be moved, or gaps where something is missing? If you would reorder, give a concrete suggestion.

**6. QUESTIONS FOR THE POET** (2-4 genuine questions)
List things you are genuinely uncertain about or want the poet's input on. These should be real editorial questions, not rhetorical ones:
- Places where the poem could go two different directions and you want to know the poet's intent
- Sections where you're not sure you understand the meaning and want clarification
- Strategic choices (audience, tone, ordering) that depend on the poet's vision
Frame them as: "I'd want to understand..." or "Before I'd commit to cutting X, I'd want to know..."

**7. WHAT TO DO NEXT** (numbered priority list)
End with a concrete, numbered to-do list of 5-8 actions, ordered by priority. Each item should be specific and actionable: "Rewrite the opening of X until the meter sings" not "Consider revising X."

TONE & APPROACH:
- Be direct and honest. Praise only with specific justification.
- When you are uncertain, say so. Offer the poet a genuine choice between alternatives.
- Quote the poet's own words when critiquing — show, don't just tell.
- Use **bold** for emphasis and *italics* for quoted lines.
- Do NOT soften criticism with filler ("great collection", "wonderful work") unless you mean it specifically.

CRITICAL GROUNDING RULES:
- You may ONLY reference poems whose full text appears in this prompt. The poems provided above are the COMPLETE set.
- Use EXACT titles as listed. Do not add numbers, prefixes, or modify titles in any way.
- When quoting lines from poems, quote ONLY text that literally appears in the poem text provided above.
- If the poet asks about a poem you don't have text for, say you don't have access to it.
- NEVER fabricate, paraphrase, or guess poem content. If it's not in this prompt, you don't know it.`;
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
