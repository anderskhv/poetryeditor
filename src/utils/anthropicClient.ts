/**
 * Client-side helper for calling our Anthropic proxy at /api/anthropic.
 *
 * The platform Anthropic API key lives only on the server (Cloudflare Pages
 * Function env). The client never sees it. Two auth paths:
 *
 * - BYOK: user-provided key from localStorage → sent as `x-byok-key`
 * - Platform: Supabase access token → sent as `Authorization: Bearer <jwt>`
 */

import { supabase } from '../lib/supabase';
import { getLocalApiKey } from './editorStorage';

export const ANTHROPIC_PROXY_URL = '/api/anthropic';

/**
 * Build headers for the proxy call.
 *
 * Always returns a header set — guests are allowed (the proxy enforces a
 * small free-message quota via signed cookie). Auth header / BYOK header
 * are added when available.
 */
export async function getProxyHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const byok = getLocalApiKey();
  if (byok) {
    headers['x-byok-key'] = byok;
    return headers;
  }

  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/** Always send the guest cookie back so the server can enforce the free quota. */
export const PROXY_FETCH_OPTS: RequestInit = { credentials: 'include' };

/** Friendly fallback message — used only if Supabase client is missing entirely. */
export const NO_AUTH_MESSAGE =
  'Sign in to use the AI editor, or add your own Anthropic API key in Editor settings.';

const BYOK_REJECTED_MESSAGE =
  'Your saved Anthropic API key was rejected. Open Editor settings to remove or replace it.';

/**
 * Map a non-OK proxy response body to a user-facing error message.
 * Recognises the typed errors emitted by /api/anthropic
 * (byok_rejected, invalid_session, auth_required, cap_exceeded, guest_cap_reached)
 * and falls back to a status-based message.
 */
export function describeProxyError(status: number, body: string): string {
  let typed: string | undefined;
  let typedMessage: string | undefined;
  try {
    const parsed = JSON.parse(body) as { error?: { type?: string; message?: string } };
    typed = parsed?.error?.type;
    typedMessage = parsed?.error?.message;
  } catch {
    // body wasn't JSON — fall back to status mapping
  }

  if (typed === 'byok_rejected') return BYOK_REJECTED_MESSAGE;
  if (typed === 'invalid_session') return typedMessage || 'Your session has expired. Please sign in again.';
  if (typed === 'auth_required') return typedMessage || NO_AUTH_MESSAGE;
  if (typed === 'cap_exceeded') return typedMessage || 'Monthly cap reached. Add your own Anthropic API key in Editor settings to keep going.';
  if (typed === 'guest_cap_reached') return typedMessage || 'You\'ve used your free messages. Create a free account to keep going.';
  if (typed === 'misconfigured') return 'The AI editor is temporarily unavailable. Please try again in a few minutes.';

  if (status === 401) return NO_AUTH_MESSAGE;
  if (status === 402) return 'You\'ve used your free messages. Create a free account to keep going.';
  if (status === 429) return 'Rate limited. Please wait a moment and try again.';
  if (body.includes('content filtering')) {
    return 'The response was blocked by a content filter. Try a different question or rephrase.';
  }
  return typedMessage || `Editor error (${status}). Please try again.`;
}
