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
