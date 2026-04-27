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
 * Build headers for the proxy call. Returns null if there is no auth available
 * at all (no BYOK and no signed-in user) — the caller should surface a sign-in
 * prompt rather than make the request.
 */
export async function getProxyHeaders(): Promise<Record<string, string> | null> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const byok = getLocalApiKey();
  if (byok) {
    headers['x-byok-key'] = byok;
    return headers;
  }

  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return null;

  headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/** Friendly fallback message when no auth is available. */
export const NO_AUTH_MESSAGE =
  'Sign in to use the AI editor, or add your own Anthropic API key in Editor settings.';
