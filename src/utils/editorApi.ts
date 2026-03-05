/**
 * Editor API — direct Anthropic API integration with streaming.
 *
 * No SDK dependency. Uses fetch + ReadableStream for minimal bundle impact.
 * Models: Sonnet 4.5 for coaching, Haiku 4.5 for cheap extraction tasks.
 */

import type { StreamCallbacks } from '../types/editor';
import { getLocalApiKey } from './editorStorage';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const COACHING_MODEL = 'claude-sonnet-4-5-20250929';
const EXTRACTION_MODEL = 'claude-haiku-4-5-20251001';
const ANTHROPIC_VERSION = '2023-06-01';

/**
 * Resolve the API key: user's stored key → env default.
 */
function resolveApiKey(): string | null {
  const userKey = getLocalApiKey();
  if (userKey) return userKey;
  const envKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (envKey) return envKey;
  return null;
}

/**
 * Send a coaching message with streaming response.
 */
export async function streamCoachingMessage(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    callbacks.onError(new Error('No API key configured. Add your Anthropic API key in Editor settings.'));
    return;
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: COACHING_MODEL,
        max_tokens: 1024,
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
        callbacks.onError(new Error('Invalid API key. Check your Anthropic API key in Editor settings.'));
      } else if (response.status === 429) {
        callbacks.onError(new Error('Rate limited. Please wait a moment and try again.'));
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
    let fullResponse = '';
    let buffer = '';

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
          } else if (event.type === 'message_stop') {
            // Stream complete
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
      callbacks.onDone(callbacks.toString()); // Aborted — not an error
      return;
    }
    callbacks.onError(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Non-streaming call for extraction tasks (Haiku — cheap and fast).
 */
export async function callExtractionModel(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const apiKey = resolveApiKey();
  if (!apiKey) throw new Error('No API key configured.');

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
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
 * Check if an API key is available.
 */
export function hasApiKey(): boolean {
  return resolveApiKey() !== null;
}
