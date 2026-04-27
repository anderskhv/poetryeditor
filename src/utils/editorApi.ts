/**
 * Editor API — direct Anthropic API integration with streaming.
 *
 * No SDK dependency. Uses fetch + ReadableStream for minimal bundle impact.
 * Models: Sonnet 4.5 for coaching, Haiku 4.5 for cheap extraction tasks.
 */

import type { StreamCallbacks, TokenUsage } from '../types/editor';
import { getLocalApiKey } from './editorStorage';
import { ANTHROPIC_PROXY_URL, getProxyHeaders, NO_AUTH_MESSAGE } from './anthropicClient';

const COACHING_MODEL = 'claude-sonnet-4-5-20250929';
const EXTRACTION_MODEL = 'claude-haiku-4-5-20251001';

/**
 * Send a coaching message with streaming response.
 */
export async function streamCoachingMessage(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
  maxTokens?: number,
): Promise<void> {
  const headers = await getProxyHeaders();
  if (!headers) {
    callbacks.onError(new Error(NO_AUTH_MESSAGE));
    return;
  }

  let fullResponse = '';

  try {
    const response = await fetch(ANTHROPIC_PROXY_URL, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify({
        model: COACHING_MODEL,
        max_tokens: maxTokens || 4096,
        stream: true,
        system: [
          {
            type: 'text',
            text: systemPrompt,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
      signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      if (response.status === 401) {
        callbacks.onError(new Error(NO_AUTH_MESSAGE));
      } else if (response.status === 402) {
        callbacks.onError(new Error('You\'ve used your free messages. Create a free account to keep using the AI editor.'));
      } else if (response.status === 429) {
        callbacks.onError(new Error(errorBody.includes('cap_exceeded')
          ? 'Monthly cap reached. Add your own Anthropic API key in Editor settings to keep going.'
          : 'Rate limited. Please wait a moment and try again.'));
      } else if (response.status === 400 && errorBody.includes('content filtering')) {
        callbacks.onError(new Error('The response was blocked by a content filter. This can happen with poems that touch on intense themes. Try asking about specific poems or aspects of the collection instead of generating a full report at once.'));
      } else {
        callbacks.onError(new Error(`API error (${response.status}): ${errorBody.slice(0, 200)}`));
      }
      return;
    }

    // Stream SSE response
    const reader = response.body?.getReader();
    if (!reader) {
      callbacks.onError(new Error('No response stream available.'));
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let inputTokens = 0;
    let outputTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events from buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const event = JSON.parse(data);

          if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
            const token = event.delta.text;
            fullResponse += token;
            callbacks.onToken(token);
          } else if (event.type === 'message_start' && event.message?.usage) {
            // Input tokens come in message_start
            inputTokens = event.message.usage.input_tokens || 0;
          } else if (event.type === 'message_delta' && event.usage) {
            // Output tokens come in message_delta at end of stream
            outputTokens = event.usage.output_tokens || 0;
          } else if (event.type === 'message_stop') {
            // Stream complete — emit usage
            if (callbacks.onUsage && (inputTokens > 0 || outputTokens > 0)) {
              callbacks.onUsage({ model: COACHING_MODEL, inputTokens, outputTokens });
            }
          } else if (event.type === 'error') {
            callbacks.onError(new Error(event.error?.message || 'Stream error'));
            return;
          }
        } catch {
          // Skip unparseable lines
        }
      }
    }

    callbacks.onDone(fullResponse);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      callbacks.onDone(fullResponse); // Aborted — deliver partial response
      return;
    }
    callbacks.onError(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Non-streaming call for extraction tasks (Haiku — cheap and fast).
 */
// Global callback for tracking extraction usage (set by useEditorChat)
let _onExtractionUsage: ((usage: TokenUsage) => void) | null = null;

export function setExtractionUsageCallback(cb: ((usage: TokenUsage) => void) | null): void {
  _onExtractionUsage = cb;
}

export async function callExtractionModel(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const headers = await getProxyHeaders();
  if (!headers) throw new Error(NO_AUTH_MESSAGE);

  const response = await fetch(ANTHROPIC_PROXY_URL, {
    method: 'POST',
      credentials: 'include',
    headers,
    body: JSON.stringify({
      model: EXTRACTION_MODEL,
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Extraction API error (${response.status}): ${errorBody.slice(0, 200)}`);
  }

  const result = await response.json();

  // Report usage if callback is set
  if (_onExtractionUsage && result.usage) {
    _onExtractionUsage({
      model: EXTRACTION_MODEL,
      inputTokens: result.usage.input_tokens || 0,
      outputTokens: result.usage.output_tokens || 0,
    });
  }

  return result.content?.[0]?.text || '';
}

/**
 * Extract learnings from a recent conversation using Haiku.
 */
export async function extractLearnings(
  extractionPrompt: string,
): Promise<Array<{ insight: string }>> {
  try {
    const raw = await callExtractionModel(
      'You extract factual observations about poets from conversations. Return ONLY valid JSON arrays.',
      extractionPrompt,
    );

    // Parse JSON from response — handle markdown code blocks
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item: unknown): item is { insight: string } =>
        typeof item === 'object' && item !== null && 'insight' in item && typeof (item as { insight: unknown }).insight === 'string',
    );
  } catch (err) {
    console.error('Learning extraction failed:', err);
    return [];
  }
}

/**
 * Regenerate the poet's summary using Haiku.
 */
export async function regenerateSummary(summaryPrompt: string): Promise<string> {
  try {
    return await callExtractionModel(
      'You write concise poet profiles. Return only the summary text, no JSON or markdown.',
      summaryPrompt,
    );
  } catch (err) {
    console.error('Summary regeneration failed:', err);
    return '';
  }
}

/**
 * Extract conversation summary from recent messages using Haiku.
 */
export async function extractConversationSummary(summaryPrompt: string): Promise<string> {
  try {
    return await callExtractionModel(
      'You write concise conversation summaries. Return only the summary text, no JSON or markdown.',
      summaryPrompt,
    );
  } catch (err) {
    console.error('Conversation summary extraction failed:', err);
    return '';
  }
}

/**
 * Returns true if the user has a BYOK (bring-your-own-key) configured.
 * The platform Anthropic key now lives server-side and is gated by Supabase
 * auth — signed-in users can chat without a BYOK.
 */
export function hasByokKey(): boolean {
  return getLocalApiKey() !== null;
}
