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
}

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const PRICING: Record<string, { in: number; out: number }> = {
  'claude-sonnet-4-5-20250929': { in: 300, out: 1500 },
  'claude-haiku-4-5-20251001': { in: 80, out: 400 },
};

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

function jsonError(status: number, message: string, code?: string): Response {
  return new Response(JSON.stringify({ error: { type: code || 'proxy_error', message } }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
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

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  const { request, env, waitUntil } = context;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError(400, 'Invalid JSON body');
  }

  const model = typeof body.model === 'string' ? body.model : '';
  const isStream = body.stream === true;

  // ── Decide auth mode ──

  const byok = request.headers.get('x-byok-key');
  const auth = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  let apiKey: string;
  let userId: string | null = null;
  let trackPlatformUsage = false;

  if (byok) {
    apiKey = byok;
  } else {
    if (!env.ANTHROPIC_API_KEY) {
      return jsonError(500, 'Server is not configured with an Anthropic API key.', 'misconfigured');
    }
    if (!auth) {
      return jsonError(
        401,
        'Sign in to use the AI editor, or add your own Anthropic API key in Editor settings.',
        'auth_required',
      );
    }

    userId = await getUserId(env, auth);
    if (!userId) {
      return jsonError(401, 'Your session has expired. Please sign in again.', 'invalid_session');
    }

    const admin = await isAdmin(env, userId);
    if (!admin) {
      const used = await getMonthlyUsedCents(env, userId);
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

  if (!upstream.ok) {
    const errBody = await upstream.text().catch(() => '');
    return new Response(errBody || JSON.stringify({ error: { message: 'Upstream error' } }), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (isStream) {
    if (!upstream.body) {
      return jsonError(502, 'No upstream stream');
    }

    if (trackPlatformUsage && userId) {
      const [a, b] = upstream.body.tee();
      waitUntil(trackStreamingUsage(b, model, userId, env));
      return new Response(a, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
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

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
