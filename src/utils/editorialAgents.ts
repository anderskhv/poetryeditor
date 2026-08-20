/**
 * Editorial Agents — AI pipeline for collection-level editorial reports.
 *
 * Architecture:
 * 1. Spine Analysis: blind reading + ambition comparison (2 Haiku calls)
 * 2. Editors: 3 parallel generalist editors (3 Haiku calls)
 * 3. Debate: identify disagreements, run debate rounds (Haiku calls per round)
 * 4. Section Editorials: synthesize per-section (1 Haiku per section)
 * 5. Per-Poem Assessments: batch synthesis of all per-poem notes (1 Haiku per 5-poem batch)
 * 6. Synthesis: full Sonnet stream of the editorial report
 */

import type {
  PreFlightAnswers,
  SpineAnalysis,
  EditorId,
  EditorReading,
  DebateRound,
  DebateStatus,
  PoemAssessment,
  SectionEditorial,
  StreamCallbacks,
  TokenUsage,
} from '../types/editor';
import type { PoemStatus } from '../types/collection';
import { ANTHROPIC_PROXY_URL, getProxyHeaders, describeProxyError } from './anthropicClient';

const SONNET_MODEL = 'claude-sonnet-4-5-20250929';
/** Parallel editor calls */
const EDITOR_MODEL = SONNET_MODEL;

// ── Data Types ──

export interface EditorialPoemData {
  id: string;
  title: string;
  content: string;
  sectionName: string | null;
  status: PoemStatus;
  sortOrder: number;
}

/** Non-streaming call to a model (used for Haiku calls) */
async function callEditor(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 2048,
  signal?: AbortSignal,
): Promise<{ text: string; usage: { inputTokens: number; outputTokens: number } }> {
  const headers = await getProxyHeaders();

  const response = await fetch(ANTHROPIC_PROXY_URL, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({
      model: EDITOR_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(describeProxyError(response.status, errorBody));
  }

  const result = await response.json();
  return {
    text: result.content?.[0]?.text || '',
    usage: {
      inputTokens: result.usage?.input_tokens || 0,
      outputTokens: result.usage?.output_tokens || 0,
    },
  };
}

/** Streaming call to Sonnet */
export async function streamSonnet(
  systemPrompt: string,
  userMessage: string,
  callbacks: StreamCallbacks,
  maxTokens: number = 4096,
  signal?: AbortSignal,
): Promise<void> {
  const headers = await getProxyHeaders();

  const response = await fetch(ANTHROPIC_PROXY_URL, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({
      model: SONNET_MODEL,
      max_tokens: maxTokens,
      stream: true,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userMessage }],
    }),
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    callbacks.onError(new Error(describeProxyError(response.status, errorBody)));
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError(new Error('No response stream available.'));
    return;
  }

  const decoder = new TextDecoder();
  let fullResponse = '';
  let buffer = '';
  let inputTokens = 0;
  let outputTokens = 0;

  try {
    let isReading = true;
    while (isReading) {
      const { done, value } = await reader.read();
      if (done) {
        isReading = false;
        continue;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const event = JSON.parse(data);
          if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
            fullResponse += event.delta.text;
            callbacks.onToken(event.delta.text);
          } else if (event.type === 'message_start' && event.message?.usage) {
            inputTokens = event.message.usage.input_tokens || 0;
          } else if (event.type === 'message_delta' && event.usage) {
            outputTokens = event.usage.output_tokens || 0;
          } else if (event.type === 'message_stop') {
            if (callbacks.onUsage && (inputTokens > 0 || outputTokens > 0)) {
              callbacks.onUsage({ model: SONNET_MODEL, inputTokens, outputTokens });
            }
          } else if (event.type === 'error') {
            callbacks.onError(new Error(event.error?.message || 'Stream error'));
            return;
          }
        } catch {
          // Skip unparseable
        }
      }
    }
    callbacks.onDone(fullResponse);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      callbacks.onDone(fullResponse);
      return;
    }
    callbacks.onError(err instanceof Error ? err : new Error(String(err)));
  }
}

// ── Key remapping helpers ──

/**
 * Remap editor response keys (poem numbers like "1", "2" or titles) back to real UUIDs.
 * Editors see poems as [1] "Title" but we need UUID keys for downstream lookups.
 */
function remapPoemKeys(
  obj: Record<string, string>,
  poems: EditorialPoemData[],
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const resolved = resolvePoemId(key, poems);
    if (resolved) {
      result[resolved] = value;
    }
  }
  return result;
}

/**
 * Resolve a key that might be a number ("1"), a title ("Descend"), or already a UUID.
 */
function resolvePoemId(key: string, poems: EditorialPoemData[]): string | null {
  // Already a UUID?
  const directMatch = poems.find(p => p.id === key);
  if (directMatch) return directMatch.id;

  // Number key? (1-indexed as shown to editors)
  const num = parseInt(key, 10);
  if (!isNaN(num) && num >= 1 && num <= poems.length) {
    return poems[num - 1].id;
  }

  // Title match (case-insensitive, trimmed)
  const normalized = key.trim().toLowerCase();
  const titleMatch = poems.find(p => p.title.trim().toLowerCase() === normalized);
  if (titleMatch) return titleMatch.id;

  return null;
}

/**
 * Remap an array of poem references (numbers/titles) to UUIDs.
 */
function remapPoemArray(arr: string[], poems: EditorialPoemData[]): string[] {
  return arr
    .map(key => resolvePoemId(key, poems))
    .filter((id): id is string => id !== null);
}

/**
 * Fuzzy match section name from editor output to actual section names.
 */
function resolveSectionName(key: string, poems: EditorialPoemData[]): string {
  const sectionNames = new Set(poems.map(p => p.sectionName).filter(Boolean) as string[]);
  // Exact match
  if (sectionNames.has(key)) return key;
  // Case-insensitive trimmed
  const normalized = key.trim().toLowerCase();
  for (const name of sectionNames) {
    if (name.trim().toLowerCase() === normalized) return name;
  }
  return key; // Return as-is if no match
}

function remapSectionKeys(
  obj: Record<string, string>,
  poems: EditorialPoemData[],
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[resolveSectionName(key, poems)] = value;
  }
  return result;
}

// ── Exported Functions ──

/**
 * Run spine analysis: blind reading + ambition comparison.
 * Two Haiku calls in sequence.
 */
export async function runSpineAnalysis(
  poems: EditorialPoemData[],
  preFlightAnswers: PreFlightAnswers,
  onUsage?: (u: TokenUsage) => void,
  signal?: AbortSignal,
): Promise<SpineAnalysis> {
  try {
    // Step 1: Blind reading
    const poemList = poems
      .map((p, idx) => `${idx + 1}. "${p.title}"${p.sectionName ? ` [${p.sectionName}]` : ''}\n${p.content}`)
      .join('\n\n---\n\n');

    const blindPrompt = `You are reading a poetry collection cold, without any context about the poet's intentions.

Read these poems in order and describe what spine holds them together. What is the collection about? What's the emotional throughline? What voice emerges?

Write in prose, 400-600 words. Be direct and specific. When referring to poems, use their EXACT titles in quotes — do not paraphrase or rename them.

COLLECTION:
${poemList}`;

    const blindResult = await callEditor(
      'You are a sensitive, perceptive poetry reader. You read collections whole, finding the coherence within them.',
      blindPrompt,
      2048,
      signal,
    );

    if (onUsage) {
      onUsage({ model: EDITOR_MODEL, inputTokens: blindResult.usage.inputTokens, outputTokens: blindResult.usage.outputTokens });
    }

    const blindReading = blindResult.text;

    if (signal?.aborted) throw new Error('Aborted');

    // Step 2: Ambition comparison
    const ambitionPrompt = `You just read a collection and identified this as its spine:

---
${blindReading}
---

Now, the poet has stated this is what they're trying to do:

"${preFlightAnswers.collectionAmbition}"

Compare these. Where do your blind reading and the poet's stated ambition align? Where do they diverge? What did you see that the poet might not have realized? What is the poet aiming for that doesn't yet come through?

Write in prose, 400-600 words. Be warm and direct.`;

    const ambitionResult = await callEditor(
      'You are comparing what a reader sees in a collection with what the poet intended. Be fair and generous but honest.',
      ambitionPrompt,
      2048,
      signal,
    );

    if (onUsage) {
      onUsage({ model: EDITOR_MODEL, inputTokens: ambitionResult.usage.inputTokens, outputTokens: ambitionResult.usage.outputTokens });
    }

    return {
      blindReading,
      ambitionComparison: ambitionResult.text,
    };
  } catch (err) {
    if (err instanceof Error && err.message === 'Aborted') throw err;
    console.error('Spine analysis failed:', err);
    throw err;
  }
}

/**
 * Run 3 parallel generalist editors.
 * Each editor reads all poems and returns structured analysis.
 */
export async function runEditors(
  poems: EditorialPoemData[],
  spineAnalysis: SpineAnalysis,
  preFlightAnswers: PreFlightAnswers,
  onUsage?: (u: TokenUsage) => void,
  onEditorComplete?: (editorId: EditorId) => void,
  signal?: AbortSignal,
): Promise<EditorReading[]> {
  const poemList = poems
    .map((p, idx) => `[${idx + 1}] "${p.title}"${p.sectionName ? ` [${p.sectionName}]` : ''} (${p.status})\n${p.content}`)
    .join('\n\n---\n\n');

  const editorPrompts = {
    editor_a: {
      persona: 'You are a close reader who values precision and economy. You notice when a word is wrong, when a line break isn\'t earning its keep, when an image overreaches. You believe poems should do more with less.',
      editorId: 'editor_a' as EditorId,
    },
    editor_b: {
      persona: 'You are a reader who values emotional truth and risk-taking. You notice when a poem is playing it safe, when the poet is hiding behind craft instead of saying the hard thing. You believe poems should make you feel something you didn\'t expect.',
      editorId: 'editor_b' as EditorId,
    },
    editor_c: {
      persona: 'You are a reader who values architecture and the reader\'s experience. You notice when a collection\'s pacing falters, when a poem is in the wrong place, when a section doesn\'t earn its position. You believe a collection is more than the sum of its poems. You evaluate each poem\'s function in the sequence, not just its standalone quality — a weaker poem doing essential transitional or thematic work between its neighbors is not a cut candidate.',
      editorId: 'editor_c' as EditorId,
    },
  };

  const harshnessNote = `The poet has set the feedback dial to ${preFlightAnswers.harshness}/100 where 0=very supportive and 100=very harsh. Calibrate your directness accordingly.`;

  const editorPromises = Object.values(editorPrompts).map(({ persona, editorId }) =>
    (async () => {
      try {
        const systemPrompt = `${persona}

You are reading a poetry collection. You know all the craft — rhythm, imagery, form, voice, structure. You assess everything: craft quality, emotional resonance, the poem's fit in the collection, its draft stage readiness.

${harshnessNote}

READING PRINCIPLES:
1. Register shifts may be intentional. Before flagging voice inconsistency, ask whether the shift serves a structural or argumentative function in the collection. A poem that risks a different register on purpose isn't losing control of its tone.
2. Recognize formal repetition devices (anaphora, refrain, litany) as intentional. Evaluate whether each iteration earns its place — does it add or shift something? — rather than counting and saying "too many."
3. A collection needs range. Distinguish "this poem fails at what it attempts" from "this poem attempts something different from the dominant mode." The second isn't a flaw. Help the poet succeed in the register they chose, don't redirect them to a different one.
4. Before recommending a cut, model the gap: what does this poem do between the poems surrounding it? What would the reader lose in the arc? Default to "revise" over "cut" unless the poem is genuinely redundant. "Rough but essential" is a valid category.
5. When a poem draws on references, frameworks, or allusions you can't fully parse, say so explicitly. Flag that your feedback may not apply if you're missing context. Epistemic humility over false confidence.
6. Check whether poems end on images or conclusions. When a final line tells the reader what to think rather than showing them something to see, it almost always weakens the landing. Flag concluding-rather-than-landing as a pattern risk.
7. Evaluate whether formal choices enact the poem's content. Does the structure perform what the poem is about? A poem about drowning in tidy stanzas is a missed opportunity. Punctuation, whitespace, lineation, and typography are meaning-carrying choices — evaluate them as such.
8. Evaluate titles as part of collection architecture, not just labels. Does the title orient the reader in the arc? Does it do work the first line doesn't already do?
9. When a poem's lineation fights its momentum — when energy is propulsive and narrative rather than lyrical and imagistic — suggest prose poem as an alternative form.
10. When a poem argues a thesis, check whether it holds genuine tension or merely illustrates a conclusion. Does the poem give the opposing force its due? Poems that hold genuine tension resist neat endings. A poem about rigidity that only shows rigidity as bad isn't holding tension — it's illustrating.

IMPORTANT: Use poem NUMBERS (1, 2, 3...) as keys in perPoemNotes, strongestPoems, and weakestPoems — matching the [N] numbers in the poem list. Use section names exactly as shown in brackets. When referring to poems in your overallAnalysis text, use their EXACT titles in quotes — do not paraphrase or rename them.

Provide your reading as JSON with this exact structure:
{
  "overallAnalysis": "string, 200-400 words on the collection as a whole",
  "sectionNotes": { "Section Name": "string, analysis of this section", ... },
  "perPoemNotes": { "1": "string, 100-200 words: your take on this poem — strengths, weaknesses, its role in the collection, and specific lines that need editing with what you'd change", "2": "...", ... },
  "strongestPoems": ["1", "3"],
  "weakestPoems": ["5"],
  "recommendations": ["string, actionable suggestion", ...]
}

Return ONLY valid JSON, no markdown or formatting.`;

        const userMessage = `You have read our blind spine analysis and know what the poet is trying to do. Here is the context:

BLIND READING:
${spineAnalysis.blindReading}

POET'S AMBITION:
${preFlightAnswers.collectionAmbition}

ADDITIONAL CONTEXT:
${preFlightAnswers.additionalContext || '(none)'}

Now here is the full collection. Read it carefully and provide your structured editorial reading.

COLLECTION (${poems.length} poems):
${poemList}`;

        const result = await callEditor(systemPrompt, userMessage, 8192, signal);

        if (onUsage) {
          onUsage({ model: EDITOR_MODEL, inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens });
        }

        // Parse JSON response
        let parsed: Partial<EditorReading> = {};
        try {
          const jsonStr = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          parsed = JSON.parse(jsonStr);
        } catch (parseErr) {
          console.error(`${editorId} JSON parse failed:`, parseErr);
          parsed = {
            overallAnalysis: result.text,
            sectionNotes: {},
            perPoemNotes: {},
            strongestPoems: [],
            weakestPoems: [],
            recommendations: [],
          };
        }

        // Remap numeric/title keys back to real UUIDs
        const reading: EditorReading = {
          editorId,
          overallAnalysis: parsed.overallAnalysis || '',
          sectionNotes: remapSectionKeys(parsed.sectionNotes || {}, poems),
          perPoemNotes: remapPoemKeys(parsed.perPoemNotes || {}, poems),
          strongestPoems: remapPoemArray(
            Array.isArray(parsed.strongestPoems) ? parsed.strongestPoems : [],
            poems,
          ),
          weakestPoems: remapPoemArray(
            Array.isArray(parsed.weakestPoems) ? parsed.weakestPoems : [],
            poems,
          ),
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        };

        if (onEditorComplete) {
          onEditorComplete(editorId);
        }

        return reading;
      } catch (err) {
        console.error(`${editorId} failed:`, err);
        if (onEditorComplete) {
          onEditorComplete(editorId);
        }
        // Return stub result on failure
        return {
          editorId,
          overallAnalysis: '',
          sectionNotes: {},
          perPoemNotes: {},
          strongestPoems: [],
          weakestPoems: [],
          recommendations: [],
        };
      }
    })(),
  );

  const results = await Promise.allSettled(editorPromises);
  return results
    .filter((r): r is PromiseFulfilledResult<EditorReading> => r.status === 'fulfilled')
    .map(r => r.value);
}

/**
 * Identify disagreements and run debate rounds.
 */
export async function runDebate(
  editorReadings: EditorReading[],
  spineAnalysis: SpineAnalysis,
  onUsage?: (u: TokenUsage) => void,
  signal?: AbortSignal,
  poems?: EditorialPoemData[],
): Promise<DebateRound[]> {
  // Identify disagreement topics
  const topics = identifyDisagreements(editorReadings, poems);
  if (topics.length === 0) {
    return [];
  }

  const debateRounds: DebateRound[] = [];
  let roundNumber = 1;

  // Run 2-3 rounds per topic
  for (const topic of topics) {
    const roundsPerTopic = Math.min(3, Math.max(2, Math.ceil(editorReadings.length / 2)));

    for (let i = 0; i < roundsPerTopic; i++) {
      if (signal?.aborted) throw new Error('Aborted');

      try {
        // Build positions from previous rounds or initial
        const previousRounds = debateRounds.filter(r => r.topic === topic);
        const positionsContext = previousRounds.length > 0
          ? `Previous rounds on this topic:\n${previousRounds.map(r => r.positions.map(p => `${p.editorId}: ${p.position}`).join('\n')).join('\n\n')}`
          : `Initial positions:`;

        const systemPrompt = `You are synthesizing editorial positions on a specific topic about a poetry collection. You are fair, analytical, and help editors understand where they agree and disagree.

Return a JSON array of positions, one per editor:
[
  { "editorId": "editor_a", "position": "string, 100-200 words" },
  { "editorId": "editor_b", "position": "string, 100-200 words" },
  { "editorId": "editor_c", "position": "string, 100-200 words" }
]

Return ONLY valid JSON.`;

        const userMessage = `Topic: "${topic}"

${positionsContext}

Re-examine this topic. Have any editors shifted? Where is actual agreement? Where is genuine disagreement?`;

        const result = await callEditor(systemPrompt, userMessage, 2048, signal);

        if (onUsage) {
          onUsage({ model: EDITOR_MODEL, inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens });
        }

        // Parse positions
        let positions = [];
        try {
          const jsonStr = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          positions = JSON.parse(jsonStr);
          if (!Array.isArray(positions)) positions = [];
        } catch {
          positions = [];
        }

        // Determine consensus
        let status: DebateStatus = 'genuine_disagreement';
        if (positions.length === editorReadings.length) {
          const positionTexts = positions.map(p => p.position?.slice(0, 50) || '');
          const uniquePositions = new Set(positionTexts);
          if (uniquePositions.size === 1) {
            status = 'consensus';
          }
        }

        debateRounds.push({
          roundNumber,
          topic,
          positions: positions.length > 0 ? positions : editorReadings.map(e => ({ editorId: e.editorId, position: '' })),
          status,
        });

        roundNumber++;
      } catch (err) {
        console.error(`Debate round failed for topic "${topic}":`, err);
      }
    }
  }

  return debateRounds;
}

/**
 * Continue debate with poet input.
 */
export async function continueDebateWithPoetInput(
  existingRounds: DebateRound[],
  poetInputs: Record<string, string>,
  editorReadings: EditorReading[],
  onUsage?: (u: TokenUsage) => void,
  signal?: AbortSignal,
): Promise<DebateRound[]> {
  const newRounds: DebateRound[] = [];
  let roundNumber = existingRounds.length + 1;

  for (const topic of Object.keys(poetInputs)) {
    if (signal?.aborted) throw new Error('Aborted');

    try {
      const previousRounds = existingRounds.filter(r => r.topic === topic);
      const previousContext = previousRounds.length > 0
        ? previousRounds.map(r => r.positions.map(p => `${p.editorId}: ${p.position}`).join('\n')).join('\n\n')
        : '';

      const systemPrompt = `You are helping editors respond to a poet's perspective on a debate topic.

Return a JSON array of updated positions:
[
  { "editorId": "editor_a", "position": "string, considering the poet's input" },
  { "editorId": "editor_b", "position": "string, considering the poet's input" },
  { "editorId": "editor_c", "position": "string, considering the poet's input" }
]

Return ONLY valid JSON.`;

      const userMessage = `Topic: "${topic}"

The poet says: "${poetInputs[topic]}"

Previous discussion:
${previousContext}

In light of the poet's input, what do the editors now think? Return updated positions.`;

      const result = await callEditor(systemPrompt, userMessage, 2048, signal);

      if (onUsage) {
        onUsage({ model: EDITOR_MODEL, inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens });
      }

      let positions = [];
      try {
        const jsonStr = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        positions = JSON.parse(jsonStr);
        if (!Array.isArray(positions)) positions = [];
      } catch {
        positions = [];
      }

      newRounds.push({
        roundNumber,
        topic,
        positions: positions.length > 0 ? positions : editorReadings.map(e => ({ editorId: e.editorId, position: '' })),
        status: 'genuine_disagreement',
        poetInput: poetInputs[topic],
      });

      roundNumber++;
    } catch (err) {
      console.error(`Poet input round failed for topic "${topic}":`, err);
    }
  }

  return newRounds;
}

/**
 * Build section-level editorial summaries.
 */
export async function buildSectionEditorials(
  poems: EditorialPoemData[],
  editorReadings: EditorReading[],
  spineAnalysis: SpineAnalysis,
  preFlightAnswers: PreFlightAnswers,
  onUsage?: (u: TokenUsage) => void,
  signal?: AbortSignal,
): Promise<SectionEditorial[]> {
  // Collect unique sections
  const sectionsSet = new Set(poems.map(p => p.sectionName || '(unsectioned)'));
  const sections = Array.from(sectionsSet);

  const editorials: SectionEditorial[] = [];

  for (const sectionName of sections) {
    if (signal?.aborted) throw new Error('Aborted');

    try {
      // Collect all editors' notes for this section
      const allNotes = editorReadings
        .map(e => `${e.editorId}: ${e.sectionNotes[sectionName] || '(no specific notes)'}`)
        .join('\n\n');

      const systemPrompt = `You are synthesizing three editors' notes on a single section of a poetry collection. Your job is to extract:
1. What all three editors agree on
2. Where they diverge
3. A consensus summary

Return JSON:
{
  "sharedAnalysis": "string, 200-300 words on points of agreement",
  "editorNotes": [
    { "editorId": "editor_a", "note": "string, where this editor diverges or adds unique insight" },
    ...
  ],
  "consensus": "string, 100-200 words summarizing the section's strengths and directions"
}

Return ONLY valid JSON.`;

      const userMessage = `Section: "${sectionName}"

Editors' notes on this section:
${allNotes}

Synthesize. What's the shared view? Where do editors differ? What's the consensus direction?`;

      const result = await callEditor(systemPrompt, userMessage, 2048, signal);

      if (onUsage) {
        onUsage({ model: EDITOR_MODEL, inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens });
      }

      let parsed = { sharedAnalysis: '', editorNotes: [], consensus: '' };
      try {
        const jsonStr = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsed = JSON.parse(jsonStr);
      } catch {
        parsed = { sharedAnalysis: result.text, editorNotes: [], consensus: '' };
      }

      editorials.push({
        sectionName,
        sharedAnalysis: parsed.sharedAnalysis || '',
        editorNotes: Array.isArray(parsed.editorNotes) ? parsed.editorNotes : [],
        consensus: parsed.consensus || '',
      });
    } catch (err) {
      console.error(`Section editorial failed for "${sectionName}":`, err);
    }
  }

  return editorials;
}

/**
 * Build per-poem assessments in batches.
 */
export async function buildPerPoemAssessments(
  poems: EditorialPoemData[],
  editorReadings: EditorReading[],
  spineAnalysis: SpineAnalysis,
  onUsage?: (u: TokenUsage) => void,
  signal?: AbortSignal,
): Promise<PoemAssessment[]> {
  const assessments: PoemAssessment[] = [];
  const batchSize = 5;

  for (let i = 0; i < poems.length; i += batchSize) {
    if (signal?.aborted) throw new Error('Aborted');

    const batch = poems.slice(i, i + batchSize);

    try {
      // Compile all editors' notes for this batch (use poem number + title for LLM, not UUID)
      const batchContext = batch
        .map((poem, batchIdx) => {
          const poemNumber = i + batchIdx + 1;
          const notes = editorReadings
            .map(e => `${e.editorId}: ${e.perPoemNotes[poem.id] || '(no specific note)'}`)
            .join('; ');
          return `[${poemNumber}] "${poem.title}" (status=${poem.status}): ${notes}`;
        })
        .join('\n\n');

      const systemPrompt = `You are synthesizing three editors' assessments of poems in a collection. For each poem, produce a unified assessment that PRESERVES each editor's individual perspective alongside the consensus.

For each poem, capture:
- Readiness level (rough/draft/edit/done/ready_for_submission)
- Strengths (array of specific strengths)
- Weaknesses (array of specific areas needing work)
- Line edits: specific lines that need work, with the original text and a suggested revision or note on what to fix
- Each editor's individual take (preserved verbatim or close to it — the poet wants to see where editors differ, not just the averaged view)
- Collection role (how this poem serves the collection)
- Suggestions for next level (actionable next steps)
- Assessor consensus (strong/mixed/weak based on editor agreement)
- Is flagged (strongest/weakest/null based on multi-editor consensus)

IMPORTANT: A line should NOT appear in both strengths and weaknesses. If editors disagree on a line, put it in the editor notes, not in both lists.

Return JSON array:
[
  {
    "poemId": "string",
    "poemTitle": "string",
    "readinessLevel": "string",
    "strengths": ["string", ...],
    "weaknesses": ["string", ...],
    "lineEdits": [
      { "line": "original line text", "suggestion": "what to change and why" },
      ...
    ],
    "editorNotes": {
      "editor_a": "string — this editor's individual take",
      "editor_b": "string — this editor's individual take",
      "editor_c": "string — this editor's individual take"
    },
    "collectionRole": "string",
    "suggestionsForNextLevel": ["string", ...],
    "assessorConsensus": "strong|mixed|weak",
    "isFlagged": null|"strongest"|"weakest",
    "flagReason": "string or null"
  },
  ...
]

Return ONLY valid JSON.`;

      const userMessage = `Assess these poems based on the editors' notes:

${batchContext}

Provide unified assessments for each poem.`;

      const result = await callEditor(systemPrompt, userMessage, 8192, signal);

      if (onUsage) {
        onUsage({ model: EDITOR_MODEL, inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens });
      }

      let parsed = [];
      try {
        const jsonStr = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsed = JSON.parse(jsonStr);
        if (!Array.isArray(parsed)) parsed = [];
      } catch {
        parsed = [];
      }

      // Add status from original poem — match by ID, number, or title
      for (const item of parsed) {
        if (item && typeof item === 'object') {
          // Try direct ID match first, then resolve via number/title
          let poem = batch.find(p => p.id === item.poemId);
          if (!poem && item.poemId) {
            const resolved = resolvePoemId(item.poemId, poems);
            if (resolved) poem = batch.find(p => p.id === resolved);
          }
          // Fallback: match by title
          if (!poem && item.poemTitle) {
            const titleNorm = item.poemTitle.trim().toLowerCase();
            poem = batch.find(p => p.title.trim().toLowerCase() === titleNorm);
          }
          // Last resort: match by position in batch
          if (!poem && parsed.length === batch.length) {
            const idx = parsed.indexOf(item);
            if (idx >= 0 && idx < batch.length) poem = batch[idx];
          }

          if (poem) {
            assessments.push({
              poemId: poem.id,
              poemTitle: item.poemTitle || poem.title,
              poemStatus: poem.status,
              sectionName: poem.sectionName,
              readinessLevel: item.readinessLevel || '',
              strengths: Array.isArray(item.strengths) ? item.strengths : [],
              weaknesses: Array.isArray(item.weaknesses) ? item.weaknesses : [],
              lineEdits: Array.isArray(item.lineEdits) ? item.lineEdits : [],
              editorNotes: item.editorNotes && typeof item.editorNotes === 'object' ? item.editorNotes : undefined,
              collectionRole: item.collectionRole || '',
              suggestionsForNextLevel: Array.isArray(item.suggestionsForNextLevel) ? item.suggestionsForNextLevel : [],
              assessorConsensus: (item.assessorConsensus || 'weak') as 'strong' | 'mixed' | 'weak',
              isFlagged: item.isFlagged || null,
              flagReason: item.flagReason,
            });
          }
        }
      }
    } catch (err) {
      console.error(`Per-poem assessments batch failed (poems ${i}-${i + batchSize}):`, err);
    }
  }

  return assessments;
}

/**
 * Synthesize the full editorial report in streaming prose.
 */
export async function synthesizeReport(
  spineAnalysis: SpineAnalysis,
  editorReadings: EditorReading[],
  sectionEditorials: SectionEditorial[],
  debateLog: DebateRound[],
  poemAssessments: PoemAssessment[],
  preFlightAnswers: PreFlightAnswers,
  poems: EditorialPoemData[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  // Build context for the synthesis prompt
  const editorialSummaries = editorReadings
    .map(e => `${e.editorId}: ${e.overallAnalysis}`)
    .join('\n\n---\n\n');

  const sectionSummaries = sectionEditorials
    .map(s => `SECTION: ${s.sectionName}\n${s.sharedAnalysis}`)
    .join('\n\n---\n\n');

  const debateSummary = debateLog.length > 0
    ? `Debate topics:\n${debateLog.map(d => `- "${d.topic}": ${d.status}`).join('\n')}`
    : '(no major disagreements)';

  const assessmentSummary = poemAssessments
    .map(a => `"${a.poemTitle}" (${a.readinessLevel}): ${a.assessorConsensus} consensus`)
    .join('\n');

  // Provide exact poem titles so the LLM never invents or paraphrases them
  const exactPoemList = poems
    .map((p, i) => `${i + 1}. "${p.title}"`)
    .join('\n');

  const systemPrompt = `You are writing an editorial letter for a poetry collection. You have access to:
- A blind spine analysis of what holds the collection together
- Three independent editors' readings (each with their sensibilities)
- Section-by-section editorial analysis
- Per-poem assessments
- Any debate on key topics

Write warm, direct prose. This is a letter, not a checklist. Use paragraphs. Address the poet directly. The tone should be encouraging but honest, calibrated to their feedback preferences.

CRITICAL: When referring to poems, use their EXACT titles from the list below. Do NOT paraphrase, abbreviate, or invent poem titles. Always put poem titles in quotes.

Structure:
1. **What We See** (2-3 paragraphs) — the collection's voice, what's strong, what it's trying to do
2. **Section by Section** (1-2 paragraphs per section) — prose analysis without structured lists
3. **The Arc** (2-3 paragraphs) — how the collection moves, pacing, transitions
4. **Address any specific questions** the poet asked in additionalContext

Do NOT repeat the editor disagreements as lists. Those will be rendered separately as interactive UI. Instead, synthesize them into prose insight.

Do NOT invent words, metaphors, or imagery that do not appear in the poems. Stay grounded in what was actually written.`;

  const userMessage = `EXACT POEM TITLES (use these verbatim — do not rename or paraphrase):
${exactPoemList}

SPINE ANALYSIS:
${spineAnalysis.blindReading}

POET'S AMBITION:
${preFlightAnswers.collectionAmbition}

POET'S SELF-ASSESSMENT:
${preFlightAnswers.readinessSelfAssessment}

ADDITIONAL CONTEXT:
${preFlightAnswers.additionalContext || '(none)'}

EDITORS' READINGS:
${editorialSummaries}

SECTION ANALYSIS:
${sectionSummaries}

DEBATE SUMMARY:
${debateSummary}

POEM ASSESSMENTS:
${assessmentSummary}

Write the editorial letter now. Be warm, direct, specific. Reference actual poems by their exact titles in quotes. Help the poet see their collection clearly.`;

  await streamSonnet(systemPrompt, userMessage, callbacks, 16384, signal);
}

// ── Helper Functions ──

/**
 * Identify disagreement topics from editors' readings.
 */
function identifyDisagreements(editorReadings: EditorReading[], poems?: EditorialPoemData[]): string[] {
  if (editorReadings.length < 2) return [];

  const topics: string[] = [];
  const poemMap = new Map(poems?.map(p => [p.id, p.title]) || []);

  // Find poems where editors disagree on strongest/weakest
  const strongestCounts = new Map<string, number>();
  const weakestCounts = new Map<string, number>();

  for (const reading of editorReadings) {
    for (const poemId of reading.strongestPoems) {
      strongestCounts.set(poemId, (strongestCounts.get(poemId) || 0) + 1);
    }
    for (const poemId of reading.weakestPoems) {
      weakestCounts.set(poemId, (weakestCounts.get(poemId) || 0) + 1);
    }
  }

  // If a poem is flagged as strongest by one editor and weakest by another, that's a topic
  for (const [poemId] of strongestCounts) {
    if (weakestCounts.get(poemId)) {
      const title = poemMap.get(poemId) || poemId;
      topics.push(`"${title}" — is it among the strongest or does it need work?`);
    }
  }

  // Collect general recommendation topics
  const recommendations = new Map<string, number>();
  for (const reading of editorReadings) {
    for (const rec of reading.recommendations) {
      const key = rec.slice(0, 50); // Rough key
      recommendations.set(key, (recommendations.get(key) || 0) + 1);
    }
  }

  // If recommendations diverge, add a topic
  if (recommendations.size > editorReadings.length) {
    topics.push('Overall revision direction and priorities');
  }

  return topics.slice(0, 3); // Limit to 3 debate topics
}
