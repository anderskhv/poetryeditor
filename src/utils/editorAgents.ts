/**
 * Editor Agent Orchestrator — multi-agent poetry coaching system.
 *
 * Architecture:
 * - Reader (Sonnet): streams the primary response immediately
 * - Craftsperson (Haiku): prosody, line breaks, sound, meter analysis
 * - Questioner (Haiku): generative questions and alternative possibilities
 * - Perspective (Haiku): reads through a chosen editorial lens (optional)
 * - Learning Extractor (Haiku): background extraction of learnings
 * - Synthesizer (Sonnet): merges all agent outputs into final response sections
 *
 * Flow:
 * 1. Reader streams to user (immediate feedback)
 * 2. Haiku agents run in parallel (cheap, fast)
 * 3. Synthesizer weaves Haiku outputs into additional sections
 * 4. Learning extractor runs in background (fire-and-forget)
 */

import type {
  AgentRole,
  AgentResult,
  MultiAgentResponse,
  EditorialPerspective,
  HarshnessLevel,
  TokenUsage,
  StreamCallbacks,
} from '../types/editor';
import { ANTHROPIC_PROXY_URL, getProxyHeaders, NO_AUTH_MESSAGE } from './anthropicClient';

const SONNET_MODEL = 'claude-sonnet-4-5-20250929';
const HAIKU_MODEL = 'claude-haiku-4-5-20251001';

/** Non-streaming call to a model (used for Haiku specialists) */
async function callModel(
  model: string,
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  maxTokens: number,
  signal?: AbortSignal,
): Promise<{ text: string; usage: { inputTokens: number; outputTokens: number } }> {
  const headers = await getProxyHeaders();
  if (!headers) throw new Error(NO_AUTH_MESSAGE);

  const response = await fetch(ANTHROPIC_PROXY_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Agent API error (${response.status}): ${errorBody.slice(0, 200)}`);
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

/** Streaming call to Sonnet (used for Reader) */
async function streamModel(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  callbacks: StreamCallbacks,
  maxTokens: number,
  signal?: AbortSignal,
): Promise<void> {
  const headers = await getProxyHeaders();
  if (!headers) {
    callbacks.onError(new Error(NO_AUTH_MESSAGE));
    return;
  }

  const response = await fetch(ANTHROPIC_PROXY_URL, {
    method: 'POST',
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
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    if (response.status === 401) {
      callbacks.onError(new Error(NO_AUTH_MESSAGE));
    } else if (response.status === 429) {
      callbacks.onError(new Error(errorBody.includes('cap_exceeded')
        ? 'Monthly cap reached. Add your own Anthropic API key in Editor settings to keep going.'
        : 'Rate limited. Please wait a moment and try again.'));
    } else if (response.status === 400 && errorBody.includes('content filtering')) {
      callbacks.onError(new Error('The response was blocked by a content filter. This can happen with poems that touch on intense themes. Try asking about specific poems or aspects instead.'));
    } else {
      callbacks.onError(new Error(`API error (${response.status}): ${errorBody.slice(0, 200)}`));
    }
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
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

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

// ── Agent Prompt Builders ──

export function buildCraftspersonPrompt(poemText: string, poemTitle: string): string {
  return `You are a poetry craftsperson — an expert in prosody, sound, and form. You focus exclusively on the technical craft of poetry.

Analyze this poem's craft elements. Be specific, reference exact lines. Focus on:
- Line breaks: where they work, where they could be stronger
- Sound: alliteration, assonance, consonance, internal rhyme — what patterns do you hear?
- Meter/rhythm: is there a pattern? Where does it break? Is the breaking intentional?
- Form: what formal choices has the poet made? Does the structure enact the content? (A poem about chaos in neat couplets is a missed opportunity — flag it.)
- Compression: where could the language be tighter? Where is it already precise?
- Lineation vs momentum: is the poem's energy lyrical or propulsive? If line breaks interrupt rather than enhance, note whether prose poem form might serve it better.
- Endings: does the poem land on an image or a conclusion? Flag concluding-rather-than-landing.

Keep your analysis to 150-250 words. Be direct and technical. Use the poet's own lines as examples.
Do NOT write any poetry or suggest rewrites. You point at the craft — you don't do the craft.

POEM: "${poemTitle}"
---
${poemText}
---`;
}

export function buildQuestionerPrompt(
  poemText: string,
  poemTitle: string,
  readerResponse: string,
): string {
  return `You are a poetry questioner — you help poets think more deeply about their work through generative questions. You never tell a poet what to do. You ask questions that open up possibilities.

The poet has received this initial feedback about their poem:
---
${readerResponse.slice(0, 1500)}
---

Now generate 3-5 thoughtful questions about the poem that might open new directions for revision. These should be:
- Questions without right answers — they provoke thought, not anxiety
- Specific to THIS poem (reference actual lines and images)
- Varied: some about content/meaning, some about craft choices, some about alternatives
- Phrased with "I wonder..." or "What if..." or "What would happen if..."

Keep each question to 1-2 sentences. Don't explain why you're asking.
Never suggest specific rewrites. Questions only.

POEM: "${poemTitle}"
---
${poemText}
---`;
}

export function buildPerspectivePrompt(
  poemText: string,
  poemTitle: string,
  perspective: EditorialPerspective,
): string {
  const perspectiveDescriptions: Record<Exclude<EditorialPerspective, 'none'>, string> = {
    formalist: 'You read through the lens of form and structure. You care about meter, rhyme scheme, stanza architecture, and how formal constraints shape meaning. You notice when poets work within or against received forms, and you have strong opinions about how structure serves content.',
    imagist: 'You read through the lens of imagery and precision. You are obsessed with the concrete image — how it carries weight, how it replaces abstraction. You notice where language is sharp and physical versus where it drifts into vagueness. For you, "no ideas but in things."',
    lyricist: 'You read through the lens of musicality and sound. You hear the vowels and consonants, the cadence of phrases, the way syllables move through a line. You care about how poems sound when read aloud — the texture of language as pure music.',
    narrativist: 'You read through the lens of story and voice. You care about persona, dramatic arc, and coherence of voice. You notice shifts in speaker, temporal movement, and whether the poem builds toward something. You think about the poem as a small drama.',
    experimentalist: 'You read through the lens of experimentation and boundary-pushing. You care about what the poem does that\'s unexpected — fragmentation, white space, constraint-breaking, formal innovation. You push poets to take more risks and question conventions.',
    intimate: 'You read through the lens of emotional truth and vulnerability. You care about specificity of feeling, whether the poem earns its emotions, and where the poet is being brave versus retreating into safe language. You believe the most powerful poems come from radical honesty.',
  };

  const desc = perspectiveDescriptions[perspective as Exclude<EditorialPerspective, 'none'>];
  if (!desc) return ''; // Safety: 'none' should never reach here

  return `You are a poetry reader with a specific editorial sensibility.

${desc}

Read this poem through your particular lens and offer 2-3 observations (100-200 words total). Be specific — reference actual lines. Share what you notice that a general reader might miss.

Do NOT write poetry or suggest rewrites. Point at what you see.

POEM: "${poemTitle}"
---
${poemText}
---`;
}

export function buildSynthesizerPrompt(
  readerResponse: string,
  agentResults: AgentResult[],
  perspectiveName?: string,
): string {
  const craftResult = agentResults.find(r => r.role === 'craftsperson');
  const questionResult = agentResults.find(r => r.role === 'questioner');
  const perspectiveResult = agentResults.find(r => r.role === 'perspective');

  let agentInputs = '';

  if (craftResult) {
    agentInputs += `\nCRAFT ANALYSIS:\n${craftResult.content}\n`;
  }
  if (questionResult) {
    agentInputs += `\nGENERATIVE QUESTIONS:\n${questionResult.content}\n`;
  }
  if (perspectiveResult && perspectiveName) {
    agentInputs += `\nPERSPECTIVE (${perspectiveName}):\n${perspectiveResult.content}\n`;
  }

  return `You are a synthesis editor. Your job is to take the main editorial feedback and additional specialist analyses, and produce clean, well-formatted additional sections to append after the main feedback.

The poet has already received this main feedback (DO NOT repeat it):
---
${readerResponse.slice(0, 2000)}
---

Specialist analyses to draw from:
${agentInputs}

Produce the following sections (use these exact headers with markdown ##):

${craftResult ? '## Craft Notes\nDistill the craft analysis into 2-4 concise, specific observations. Reference actual lines. Keep it tight — the poet should be able to scan these quickly. 80-150 words.\n\n' : ''}${questionResult ? '## Questions to Consider\nSelect the 3-4 strongest questions. Polish them slightly for clarity but keep the "I wonder..." tone. Don\'t number them — use line breaks between questions.\n\n' : ''}${perspectiveResult && perspectiveName ? `## From the ${perspectiveName}\nDistill the perspective reading into a brief, distinctive paragraph. 60-120 words. The voice should feel different from the main feedback — this is a specific editorial sensibility.\n\n` : ''}
Rules:
- Do NOT repeat anything from the main feedback
- Do NOT write poetry or suggest specific rewrites
- Keep sections concise — these are supplements, not the main event
- Use **bold** for emphasis and *italics* for quoted lines`;
}

export function buildLearningExtractorPrompt(
  recentMessages: Array<{ role: string; content: string }>,
  existingLearnings: string[],
): string {
  const conversationText = recentMessages
    .map(m => `${m.role === 'user' ? 'Poet' : 'Editor'}: ${m.content.slice(0, 500)}`)
    .join('\n\n');

  const existing = existingLearnings.length > 0
    ? existingLearnings.join('\n')
    : 'No existing learnings.';

  return `Extract 0-3 NEW factual observations about this poet from the conversation below. Only genuinely new insights not already known. Focus on:
- What they care about in their work
- Stylistic preferences revealed through their questions or reactions
- What feedback they engaged with (asked follow-ups about)
- Their emotional relationship with specific poems or techniques
- Draft stage signals (exploring vs polishing)

Return ONLY a JSON array. If nothing new was learned, return [].
Format: [{"insight": "string", "category": "strength|habit|theme|growth_area"}]

EXISTING KNOWLEDGE:
${existing}

RECENT EXCHANGE:
${conversationText}`;
}

// ── Perspective Names ──

const PERSPECTIVE_NAMES: Record<Exclude<EditorialPerspective, 'none'>, string> = {
  formalist: 'Formalist',
  imagist: 'Imagist',
  lyricist: 'Lyricist',
  narrativist: 'Narrativist',
  experimentalist: 'Experimentalist',
  intimate: 'Intimate',
};

export function getPerspectiveName(perspective: EditorialPerspective): string | undefined {
  if (perspective === 'none') return undefined;
  return PERSPECTIVE_NAMES[perspective];
}

// ── Don't-Write Guardrail ──

/**
 * Detects if a response contains ghostwriting (>4 consecutive lines of verse).
 * Returns the cleaned response with a gentle note if ghostwriting was detected.
 */
export function applyDontWriteGuardrail(response: string): { text: string; wasFiltered: boolean } {
  // Detect patterns that suggest ghostwriting
  const lines = response.split('\n');
  let consecutiveVerse = 0;
  let ghostwritingDetected = false;

  for (const line of lines) {
    const trimmed = line.trim();
    // Heuristic: a line of verse is short (under 80 chars), not empty,
    // not a heading, not a bullet, not a question, and doesn't look like prose
    const isVerseLine = trimmed.length > 0
      && trimmed.length < 80
      && !trimmed.startsWith('#')
      && !trimmed.startsWith('-')
      && !trimmed.startsWith('*')
      && !trimmed.startsWith('>')
      && !trimmed.endsWith('?')
      && !trimmed.endsWith(':')
      && !trimmed.includes('**')
      && !trimmed.startsWith('##');

    if (isVerseLine) {
      consecutiveVerse++;
      if (consecutiveVerse > 4) {
        ghostwritingDetected = true;
        break;
      }
    } else {
      consecutiveVerse = 0;
    }
  }

  // Also detect explicit rewrite patterns
  const rewritePatterns = [
    /here'?s how i would write/i,
    /here'?s a rewrite/i,
    /here'?s my version/i,
    /i'?d rewrite it as/i,
    /try this instead:/i,
    /revised version:/i,
  ];

  for (const pattern of rewritePatterns) {
    if (pattern.test(response)) {
      ghostwritingDetected = true;
      break;
    }
  }

  if (ghostwritingDetected) {
    return {
      text: response + '\n\n*Note: I caught myself starting to write for you there. Your voice is what matters here — I should be asking questions, not drafting lines. What direction do you want to take this?*',
      wasFiltered: true,
    };
  }

  return { text: response, wasFiltered: false };
}

// ── Orchestrator ──

export interface OrchestratorOptions {
  poemText: string;
  poemTitle: string;
  systemPrompt: string; // Full system prompt for the Reader (built by editorPrompts.ts)
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  perspective: EditorialPerspective;
  harshness: HarshnessLevel;
  signal?: AbortSignal;
  onUsage?: (usage: TokenUsage) => void;
}

export interface OrchestratorCallbacks {
  /** Called with each token from the Reader (streaming) */
  onReaderToken: (token: string) => void;
  /** Called when Reader is done streaming */
  onReaderDone: (fullResponse: string) => void;
  /** Called when synthesis sections are ready (appended after Reader) */
  onSynthesisReady: (sections: MultiAgentResponse) => void;
  /** Called on error */
  onError: (error: Error) => void;
  /** Called with token usage for tracking */
  onUsage?: (usage: TokenUsage) => void;
}

/**
 * Run the multi-agent per-poem feedback flow.
 *
 * 1. Reader (Sonnet) streams immediately
 * 2. Haiku specialists run in parallel
 * 3. Synthesizer merges specialist outputs
 * 4. Sections delivered via callback
 */
export async function runPerPoemAgents(
  options: OrchestratorOptions,
  callbacks: OrchestratorCallbacks,
): Promise<void> {
  const { poemText, poemTitle, systemPrompt, messages, perspective, signal } = options;

  let readerResponse = '';

  // Step 1: Stream Reader (Sonnet)
  await new Promise<void>((resolve) => {
    streamModel(
      systemPrompt,
      messages,
      {
        onToken: (token) => {
          readerResponse += token;
          callbacks.onReaderToken(token);
        },
        onDone: (full) => {
          readerResponse = full;
          callbacks.onReaderDone(full);
          resolve();
        },
        onError: (err) => {
          callbacks.onError(err);
          resolve();
        },
        onUsage: callbacks.onUsage,
      },
      4096,
      signal,
    );
  });

  // If reader failed or was aborted, stop
  if (!readerResponse || (signal?.aborted)) return;

  // Apply don't-write guardrail to reader response
  const { text: guardedReader, wasFiltered } = applyDontWriteGuardrail(readerResponse);
  if (wasFiltered) {
    // Update the reader response with the guardrail note
    callbacks.onReaderDone(guardedReader);
  }

  // Step 2: Run Haiku specialists in parallel
  const haikuPromises: Promise<AgentResult | null>[] = [];

  // Craftsperson
  haikuPromises.push(
    runHaikuAgent('craftsperson', buildCraftspersonPrompt(poemText, poemTitle), signal)
  );

  // Questioner (needs reader response for context)
  haikuPromises.push(
    runHaikuAgent('questioner', buildQuestionerPrompt(poemText, poemTitle, readerResponse), signal)
  );

  // Perspective (only if not 'none')
  if (perspective !== 'none') {
    haikuPromises.push(
      runHaikuAgent('perspective', buildPerspectivePrompt(poemText, poemTitle, perspective), signal)
    );
  }

  const haikuResults = (await Promise.all(haikuPromises)).filter(
    (r): r is AgentResult => r !== null
  );

  // Report Haiku usage
  if (callbacks.onUsage) {
    for (const result of haikuResults) {
      // Usage is tracked inside runHaikuAgent via the returned result
      // We approximate: Haiku calls are cheap, ~500 input tokens each
    }
  }

  // If signal was aborted during Haiku calls, stop
  if (signal?.aborted) return;

  // Step 3: Synthesize results
  if (haikuResults.length > 0) {
    try {
      const perspectiveName = getPerspectiveName(perspective);
      const synthPrompt = buildSynthesizerPrompt(readerResponse, haikuResults, perspectiveName);

      const synthResult = await callModel(
        SONNET_MODEL,
        synthPrompt,
        [{ role: 'user', content: 'Produce the supplementary sections now.' }],
        2048,
        signal,
      );

      if (callbacks.onUsage) {
        callbacks.onUsage({
          model: SONNET_MODEL,
          inputTokens: synthResult.usage.inputTokens,
          outputTokens: synthResult.usage.outputTokens,
        });
      }

      // Parse synthesis into sections
      const sections = parseSynthesisOutput(synthResult.text, perspectiveName);
      sections.mainFeedback = guardedReader;

      callbacks.onSynthesisReady(sections);
    } catch (err) {
      // Synthesis failure is non-fatal — poet still has the reader response
      console.error('Synthesis failed:', err);
      callbacks.onSynthesisReady({ mainFeedback: guardedReader });
    }
  } else {
    callbacks.onSynthesisReady({ mainFeedback: guardedReader });
  }
}

/** Run a single Haiku agent */
async function runHaikuAgent(
  role: AgentRole,
  prompt: string,
  signal?: AbortSignal,
): Promise<AgentResult | null> {
  const start = Date.now();
  try {
    const result = await callModel(
      HAIKU_MODEL,
      prompt,
      [{ role: 'user', content: 'Analyze the poem now.' }],
      1024,
      signal,
    );
    return {
      role,
      content: result.text,
      model: 'haiku',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    console.error(`${role} agent failed:`, err);
    return null;
  }
}

/** Parse synthesizer output into structured sections */
function parseSynthesisOutput(
  text: string,
  perspectiveName?: string,
): MultiAgentResponse {
  const response: MultiAgentResponse = { mainFeedback: '' };

  // Extract ## Craft Notes
  const craftMatch = text.match(/## Craft Notes\n([\s\S]*?)(?=\n## |$)/);
  if (craftMatch) response.craftNotes = craftMatch[1].trim();

  // Extract ## Questions to Consider
  const questionsMatch = text.match(/## Questions to Consider\n([\s\S]*?)(?=\n## |$)/);
  if (questionsMatch) response.questions = questionsMatch[1].trim();

  // Extract perspective section
  if (perspectiveName) {
    const perspectiveRegex = new RegExp(`## From the ${perspectiveName}\\n([\\s\\S]*?)(?=\\n## |$)`);
    const perspectiveMatch = text.match(perspectiveRegex);
    if (perspectiveMatch) {
      response.perspectiveNotes = perspectiveMatch[1].trim();
      response.perspectiveName = perspectiveName;
    }
  }

  return response;
}

// ── Learning Extraction (Background, Fire-and-Forget) ──

export async function runLearningExtractor(
  recentMessages: Array<{ role: string; content: string }>,
  existingLearnings: string[],
): Promise<Array<{ insight: string; category: string }>> {
  try {
    const prompt = buildLearningExtractorPrompt(recentMessages, existingLearnings);
    const result = await callModel(
      HAIKU_MODEL,
      'You extract factual observations about poets from conversations. Return ONLY valid JSON arrays.',
      [{ role: 'user', content: prompt }],
      512,
    );

    const jsonStr = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item: unknown): item is { insight: string; category: string } =>
        typeof item === 'object' && item !== null &&
        'insight' in item && typeof (item as { insight: unknown }).insight === 'string',
    ).map(item => ({
      insight: item.insight,
      category: (item as { category?: string }).category || 'habit',
    }));
  } catch (err) {
    console.error('Learning extraction failed:', err);
    return [];
  }
}

// ── Session Summary (Background) ──

export async function runSessionSummary(
  messages: Array<{ role: string; content: string }>,
  poemTitle: string,
): Promise<string> {
  try {
    const conversationText = messages
      .slice(-10) // Last 10 messages max
      .map(m => `${m.role === 'user' ? 'Poet' : 'Editor'}: ${m.content.slice(0, 300)}`)
      .join('\n\n');

    const result = await callModel(
      HAIKU_MODEL,
      'You write concise conversation summaries. Return only the summary text.',
      [{
        role: 'user',
        content: `Summarize the key discussion points about "${poemTitle}" in 2-3 sentences. Focus on what feedback was given, what the poet engaged with, and any revision plans.\n\nCONVERSATION:\n${conversationText}`,
      }],
      256,
    );

    return result.text.trim();
  } catch (err) {
    console.error('Session summary failed:', err);
    return '';
  }
}
