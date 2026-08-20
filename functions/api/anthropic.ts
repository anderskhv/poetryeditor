/**
 * Anthropic API proxy — Cloudflare Pages Function.
 *
 * Holds the platform Anthropic key as a server-side secret. Browser code calls
 * this endpoint instead of api.anthropic.com directly, so the key is never
 * shipped to the client.
 *
 * Auth modes:
 * - BYOK: client sends `x-byok-key`. We forward as `x-api-key`. No auth, no
 *   cap, no usage tracking — the user is paying their own bill.
 * - Platform: client sends `Authorization: Bearer <supabase access token>`.
 *   We verify with Supabase, check admin/cap, use the platform key, and
 *   record usage in `editor_usage`.
 *
 * Streaming and non-streaming requests are both passed through. For streaming
 * requests, the response body is tee'd so we can pass tokens to the client
 * while a background task parses the SSE stream for usage accounting.
 */

interface Env {
  ANTHROPIC_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  /** Random 32+ byte string used to HMAC-sign the guest chat counter cookie. */
  GUEST_COOKIE_SECRET: string;
}

const GUEST_COOKIE_NAME = 'pe_guest';
const GUEST_FREE_CHATS = 3;

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const PRICING: Record<string, { in: number; out: number }> = {
  'claude-sonnet-4-5-20250929': { in: 300, out: 1500 },
  'claude-haiku-4-5-20251001': { in: 80, out: 400 },
};

const ALLOWED_MODELS = new Set(Object.keys(PRICING));
const MAX_REQUEST_BYTES = 400_000;
const MAX_OUTPUT_TOKENS = 4096;
const MAX_MESSAGES = 40;
const REGISTERED_CAP_CENTS = 500;

function calcCostCents(model: string, inputTokens: number, outputTokens: number): number {
  const p = PRICING[model];
  if (!p) return 0;
  const cost = (inputTokens / 1_000_000) * p.in + (outputTokens / 1_000_000) * p.out;
  return Math.round(cost * 100) / 100;
}

function monthKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function jsonError(status: number, message: string, code?: string, extraHeaders?: Record<string, string>): Response {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (extraHeaders) Object.assign(headers, extraHeaders);
  return new Response(JSON.stringify({ error: { type: code || 'proxy_error', message } }), {
    status,
    headers,
  });
}

// ── Guest cookie (HMAC-signed counter) ──

async function hmacSign(value: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function readGuestCount(req: Request, secret: string): Promise<number> {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${GUEST_COOKIE_NAME}=([^;]+)`));
  if (!match) return 0;
  const [countStr, sig] = decodeURIComponent(match[1]).split('.');
  if (!countStr || !sig) return 0;
  const expected = await hmacSign(countStr, secret);
  if (expected !== sig) return 0;
  const n = parseInt(countStr, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

async function buildGuestCookie(count: number, secret: string): Promise<string> {
  const sig = await hmacSign(String(count), secret);
  const value = encodeURIComponent(`${count}.${sig}`);
  // 30 days. HttpOnly so JS can't read or trivially overwrite. SameSite=Lax for normal nav.
  return `${GUEST_COOKIE_NAME}=${value}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`;
}

async function getUserId(env: Env, accessToken: string): Promise<string | null> {
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });
  if (!res.ok) return null;
  const user = (await res.json()) as { id?: string };
  return user.id ?? null;
}

async function isAdmin(env: Env, userId: string): Promise<boolean> {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/site_admins?user_id=eq.${userId}&select=user_id`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  );
  if (!res.ok) return false;
  const rows = (await res.json()) as unknown[];
  return rows.length > 0;
}

async function getMonthlyUsedCents(env: Env, userId: string): Promise<number> {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/editor_usage?user_id=eq.${userId}&month_key=eq.${monthKey()}&select=cost_cents`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  );
  if (!res.ok) return 0;
  const rows = (await res.json()) as Array<{ cost_cents: number | string }>;
  return rows.reduce((s, r) => s + Number(r.cost_cents), 0);
}

async function recordUsage(
  env: Env,
  userId: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
): Promise<void> {
  if (inputTokens === 0 && outputTokens === 0) return;
  const cost = calcCostCents(model, inputTokens, outputTokens);
  const m = monthKey();

  const headers = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  };

  const existingRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/editor_usage?user_id=eq.${userId}&month_key=eq.${m}&select=id,cost_cents,input_tokens,output_tokens`,
    { headers },
  );
  if (!existingRes.ok) return;
  const existing = (await existingRes.json()) as Array<{
    id: string;
    cost_cents: number | string;
    input_tokens: number;
    output_tokens: number;
  }>;

  if (existing.length > 0) {
    const row = existing[0];
    await fetch(`${env.SUPABASE_URL}/rest/v1/editor_usage?id=eq.${row.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        cost_cents: Number(row.cost_cents) + cost,
        input_tokens: row.input_tokens + inputTokens,
        output_tokens: row.output_tokens + outputTokens,
        updated_at: new Date().toISOString(),
      }),
    });
  } else {
    await fetch(`${env.SUPABASE_URL}/rest/v1/editor_usage`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user_id: userId,
        month_key: m,
        model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_cents: cost,
      }),
    });
  }
}

async function trackStreamingUsage(
  stream: ReadableStream<Uint8Array>,
  model: string,
  userId: string,
  env: Env,
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
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
          const ev = JSON.parse(data);
          if (ev.type === 'message_start' && ev.message?.usage) {
            inputTokens = ev.message.usage.input_tokens || 0;
          } else if (ev.type === 'message_delta' && ev.usage) {
            outputTokens = ev.usage.output_tokens || outputTokens;
          }
        } catch {
          // skip
        }
      }
    }
  } catch {
    // ignore stream parsing errors — best-effort accounting
  }

  await recordUsage(env, userId, model, inputTokens, outputTokens);
}

interface PagesContext {
  request: Request;
  env: Env;
  waitUntil: (p: Promise<unknown>) => void;
}

const handler = async (context: PagesContext): Promise<Response> => {
  const { request, env, waitUntil } = context;

  const contentLength = Number(request.headers.get('content-length') || '0');
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return jsonError(413, 'Request is too large. Please send a shorter poem or smaller context.', 'request_too_large');
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError(400, 'Invalid JSON body');
  }

  const model = typeof body.model === 'string' ? body.model : '';
  if (!ALLOWED_MODELS.has(model)) {
    return jsonError(400, 'Unsupported model for Poetry Editor.', 'unsupported_model');
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonError(400, 'Missing messages.', 'invalid_messages');
  }
  if (messages.length > MAX_MESSAGES) {
    return jsonError(400, 'Conversation is too long. Start a new thread or reduce context.', 'too_many_messages');
  }

  const requestedMaxTokens = Number(body.max_tokens);
  if (!Number.isFinite(requestedMaxTokens) || requestedMaxTokens < 1) {
    return jsonError(400, 'Missing max_tokens.', 'invalid_max_tokens');
  }
  body.max_tokens = Math.min(Math.floor(requestedMaxTokens), MAX_OUTPUT_TOKENS);

  const isStream = body.stream === true;

  // ── Decide auth mode ──

  const byok = request.headers.get('x-byok-key');
  const auth = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  let apiKey: string;
  let userId: string | null = null;
  let trackPlatformUsage = false;
  let guestNewCount: number | null = null;

  if (byok) {
    apiKey = byok;
  } else {
    if (!env.ANTHROPIC_API_KEY) {
      return jsonError(500, 'Server is not configured with an Anthropic API key.', 'misconfigured');
    }
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return jsonError(
        500,
        'Server is missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Cloudflare Pages env.',
        'misconfigured',
      );
    }

    if (auth) {
      // ── Signed-in user ──
      try {
        userId = await getUserId(env, auth);
      } catch {
        return jsonError(502, 'Could not reach Supabase to verify your session.', 'auth_upstream');
      }
      if (!userId) {
        return jsonError(401, 'Your session has expired. Please sign in again.', 'invalid_session');
      }

      let admin = false;
      try {
        admin = await isAdmin(env, userId);
      } catch {
        admin = false;
      }
      if (!admin) {
        let used = 0;
        try {
          used = await getMonthlyUsedCents(env, userId);
        } catch {
          used = 0;
        }
        if (used >= REGISTERED_CAP_CENTS) {
          return jsonError(
            429,
            'Monthly cap reached. Add your own Anthropic API key in Editor settings to keep going.',
            'cap_exceeded',
          );
        }
      }

      apiKey = env.ANTHROPIC_API_KEY;
      trackPlatformUsage = true;
    } else {
      // ── Guest: limit to GUEST_FREE_CHATS via HMAC-signed cookie ──
      if (!env.GUEST_COOKIE_SECRET) {
        return jsonError(
          500,
          'Server is missing GUEST_COOKIE_SECRET. Sign in to use the AI editor, or add your own Anthropic API key.',
          'misconfigured',
        );
      }
      const count = await readGuestCount(request, env.GUEST_COOKIE_SECRET);
      if (count >= GUEST_FREE_CHATS) {
        return jsonError(
          402,
          `You've used your ${GUEST_FREE_CHATS} free messages. Create a free account to keep going.`,
          'guest_cap_reached',
        );
      }
      guestNewCount = count + 1;
      apiKey = env.ANTHROPIC_API_KEY;
    }
  }

  // ── Forward to Anthropic ──

  const upstream = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify(body),
  });

  // Build a Set-Cookie header for guest responses if we incremented the counter.
  const guestCookie = guestNewCount !== null
    ? await buildGuestCookie(guestNewCount, env.GUEST_COOKIE_SECRET)
    : null;

  if (!upstream.ok) {
    const errBody = await upstream.text().catch(() => '');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (guestCookie) headers['Set-Cookie'] = guestCookie;

    // Translate upstream auth failure on a BYOK request into a clear,
    // typed error so the client can prompt to replace/remove the saved key
    // instead of showing the generic "please sign in" copy.
    if (upstream.status === 401 && byok) {
      return new Response(
        JSON.stringify({
          error: {
            type: 'byok_rejected',
            message: 'Your saved Anthropic API key was rejected. Open Editor settings to remove or replace it.',
          },
        }),
        { status: 401, headers },
      );
    }

    return new Response(errBody || JSON.stringify({ error: { message: 'Upstream error' } }), {
      status: upstream.status,
      headers,
    });
  }

  if (isStream) {
    if (!upstream.body) {
      return jsonError(502, 'No upstream stream');
    }

    const streamHeaders: Record<string, string> = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    };
    if (guestCookie) streamHeaders['Set-Cookie'] = guestCookie;

    if (trackPlatformUsage && userId) {
      const [a, b] = upstream.body.tee();
      waitUntil(trackStreamingUsage(b, model, userId, env));
      return new Response(a, { status: 200, headers: streamHeaders });
    }

    return new Response(upstream.body, { status: 200, headers: streamHeaders });
  }

  // Non-streaming: parse for usage tracking
  const result = (await upstream.json()) as {
    usage?: { input_tokens?: number; output_tokens?: number };
  };

  if (trackPlatformUsage && userId && result.usage) {
    const it = result.usage.input_tokens || 0;
    const ot = result.usage.output_tokens || 0;
    waitUntil(recordUsage(env, userId, model, it, ot));
  }

  const respHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
  if (guestCookie) respHeaders['Set-Cookie'] = guestCookie;
  return new Response(JSON.stringify(result), { status: 200, headers: respHeaders });
};

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  try {
    return await handler(context);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return jsonError(500, `Proxy error: ${message}`, 'proxy_exception');
  }
};
