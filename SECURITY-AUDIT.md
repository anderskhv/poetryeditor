# Security Audit Report — Poetry Editor

**Date:** 2026-03-20
**Auditor:** Claude (automated static analysis)
**Scope:** Full codebase at `/Users/andershvelplund/Documents/Projects/poetry-editor/`
**Methodology:** Static code analysis, configuration review, dependency inspection

---

## Executive Summary

The audit found **2 Critical**, **3 High**, **3 Medium**, and **3 Low** severity issues. The most urgent finding is that the `.env` file containing live API keys (including the Supabase service role key and Anthropic API key) is present on disk and, although listed in `.gitignore`, appears to have been committed to git history previously. The second critical finding is that the Anthropic API key is exposed to every browser visitor via Vite's `VITE_` prefix environment variable inlining.

---

## Findings

### CRITICAL-1: Supabase Service Role Key in `.env` File

**Severity:** Critical
**File:** `.env` (line 3)

The `.env` file contains `SUPABASE_SERVICE_ROLE_KEY` -- a key that **bypasses all Row Level Security policies**. If this key has ever been committed to git, or if this file is accessible through any deployment artifact, an attacker gains full read/write access to the entire Supabase database, including all user data, poems, analytics, and auth tables.

The key is currently:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbWl4eXRvdXJpYmN2cXFnc2pvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIs...
```

This key is used by `supabase/run-migrations.js` and `scripts/cleanup-duplicates.ts` -- both server-side scripts. It is NOT referenced in client-side code (good), but its presence in `.env` alongside `VITE_` variables is dangerous.

**Fix:**
1. **Rotate the service role key immediately** via the Supabase dashboard (Settings > API).
2. Store the service role key in a separate `.env.local` or `.env.server` file that is NOT alongside client env vars.
3. Verify it was never committed to git: `git log --all --full-history -p -- .env | grep SERVICE_ROLE`
4. If it was committed, the key is compromised regardless of `.gitignore` -- rotation is mandatory.

---

### CRITICAL-2: Anthropic API Key Exposed to All Browser Visitors

**Severity:** Critical
**Files:** `.env` (line 5), `src/utils/editorApi.ts`, `src/utils/editorAgents.ts`, `src/utils/editorialAgents.ts`, `src/utils/llmAnalysis.ts`

The Anthropic API key is stored as `VITE_ANTHROPIC_API_KEY`. Vite inlines all `VITE_`-prefixed environment variables into the client-side JavaScript bundle at build time. This means:

- Every visitor to poetryeditor.com can open DevTools, search the JS bundle, and extract the API key.
- Anyone with the key can make unlimited Anthropic API calls billed to Anders's account.
- The usage cap system (guest $0.50, registered $5.00) is client-side only and trivially bypassed.

The key is used as a fallback when users don't provide their own key:
```typescript
// src/utils/editorApi.ts:19-24
function resolveApiKey(): string | null {
  const userKey = getLocalApiKey();
  if (userKey) return userKey;
  const envKey = import.meta.env.VITE_ANTHROPIC_API_KEY;  // Baked into JS bundle
  if (envKey) return envKey;
  return null;
}
```

**Fix:**
1. **Rotate the Anthropic API key immediately** at console.anthropic.com.
2. Remove `VITE_ANTHROPIC_API_KEY` from `.env` entirely.
3. Implement a server-side proxy (Supabase Edge Function or Cloudflare Worker) that:
   - Receives requests from the client
   - Validates the user session
   - Enforces usage caps server-side
   - Forwards the request to Anthropic with the API key
   - Returns the response
4. Until a proxy exists, require users to supply their own API key (the current `getLocalApiKey()` flow).

---

### HIGH-1: `dangerouslySetInnerHTML` Without Sanitization (XSS Risk)

**Severity:** High
**Files:**
- `src/pages/EditorialReport.tsx` (lines 436, 449-450, 458-459, 479-480, 495-496, 541-542, 555-556)
- `src/components/editor/EditorMessage.tsx` (lines 105, 156)
- `src/components/editor/ReportChat.tsx` (lines 174-175)

Multiple components render AI-generated content via `dangerouslySetInnerHTML` using custom markdown-to-HTML converters (`renderEditorialMarkdown`, `renderMarkdown`) that do NOT sanitize or escape HTML before rendering.

The `renderEditorialMarkdown` function in `EditorialReport.tsx` applies markdown formatting (bold, italic, code) via regex replacement but **never escapes HTML entities first**. If Claude's response contains `<script>`, `<img onerror=...>`, or other HTML, it will be rendered as live DOM.

The `renderMarkdown` function in `EditorMessage.tsx` has the same issue.

**Attack vector:** While the AI response is the primary source and not directly user-controlled, there are scenarios where this matters:
- If an attacker crafts poem text that, when analyzed by Claude, causes Claude to echo HTML tags in its response.
- The `ReportChat.tsx` renders `msg.content` directly -- if any message content is loaded from Supabase (which it could be in conversation history), an XSS vector exists via database-stored payloads.

**Mitigating factor:** `SharedCollection.tsx` correctly uses `escapeHtml()` before markdown processing, proving the pattern is known -- it's just inconsistently applied.

**Fix:**
1. Install DOMPurify: `npm install dompurify @types/dompurify`
2. Sanitize all HTML before passing to `dangerouslySetInnerHTML`:
   ```typescript
   import DOMPurify from 'dompurify';
   dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderEditorialMarkdown(text)) }}
   ```
3. Alternatively, add `escapeHtml()` as the first step in `renderEditorialMarkdown` and `renderMarkdown`, before any markdown-to-HTML conversion (same pattern as `SharedCollection.tsx`).

---

### HIGH-2: Client-Side Usage Caps Are Trivially Bypassable

**Severity:** High
**File:** `src/utils/usageTracking.ts`

The freemium usage cap system stores guest usage in localStorage and checks caps client-side:

```typescript
const GUEST_USAGE_KEY = 'editor:guest-usage';
// Guest cap check
export function isGuestCapExceeded(): boolean {
  return getGuestRemainingCents() <= 0;
}
```

Any user can:
1. Clear localStorage to reset their usage counter.
2. Open an incognito window for fresh usage.
3. Directly call the Anthropic API with the exposed key (see CRITICAL-2), bypassing caps entirely.

Even for registered users, the cap check happens client-side before the API call. The Supabase usage recording happens after the call succeeds, meaning a user who modifies the client code can skip recording entirely.

**Fix:**
This is fundamentally tied to CRITICAL-2. Server-side enforcement of caps is the only real solution. A proxy that checks usage before forwarding to Anthropic would solve both issues.

---

### HIGH-3: API Key Stored in localStorage

**Severity:** High
**File:** `src/utils/editorStorage.ts` (lines 216-228)

User-provided API keys are stored in plain text in localStorage under `editor:apiKey`:

```typescript
export function saveLocalApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE, key);
}
```

Any XSS vulnerability (see HIGH-1) can exfiltrate this key. Any browser extension with `storage` permissions can read it. Any script injected via a compromised CDN (e.g., Google Fonts) could access it.

**Fix:**
1. At minimum, display a clear warning to users that their API key is stored in the browser.
2. Ideally, use a server-side session to store the key (e.g., encrypted in a Supabase table, retrieved via authenticated session).
3. If localStorage must be used, consider encrypting the key with a user-derived passphrase (though this is defense-in-depth, not a complete fix).

---

### MEDIUM-1: `anthropic-dangerous-direct-browser-access` Header

**Severity:** Medium
**Files:** `src/utils/editorApi.ts` (lines 52, 175), `src/utils/editorAgents.ts` (lines 62, 108), `src/utils/editorialAgents.ts` (lines 71, 117), `src/utils/llmAnalysis.ts` (line 104)

The app uses `anthropic-dangerous-direct-browser-access: true` to make direct browser-to-Anthropic API calls. Anthropic explicitly names this header "dangerous" because:

1. It requires the API key to be present in the browser (see CRITICAL-2).
2. CORS is relaxed to allow the call, expanding the attack surface.
3. It's intended for prototyping, not production.

**Fix:** Replace with a server-side proxy (same fix as CRITICAL-2). The header exists because there's no backend -- adding one eliminates the need for it.

---

### MEDIUM-2: No Content Security Policy (CSP) Headers

**Severity:** Medium
**File:** `index.html` (no CSP meta tag), no server-side CSP headers configured

The application has no Content Security Policy. This means:
- If an XSS vulnerability is exploited, there are no restrictions on what scripts can execute.
- Inline scripts, external script loading, and data exfiltration are all unrestricted.

**Fix:** Add CSP headers via Cloudflare Pages `_headers` file:
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://api.anthropic.com https://api.datamuse.com; img-src 'self' data:; frame-ancestors 'none'
```

---

### MEDIUM-3: Password Policy Weak (6 characters minimum)

**Severity:** Medium
**File:** `src/pages/ResetPassword.tsx` (line 33)

The password reset page enforces only a 6-character minimum:
```typescript
if (password.length < 6) {
  setError('Password must be at least 6 characters');
```

The sign-up form (`AuthModal.tsx`) delegates to Supabase's default, which is also 6 characters.

**Fix:** Increase minimum to 8 characters. Consider adding complexity requirements or using Supabase's password strength settings.

---

### LOW-1: Share Token Predictability

**Severity:** Low
**File:** `src/utils/sharedCollections.ts` (lines 53-58)

The share token generation has a fallback that uses `Math.random()`:
```typescript
const generateToken = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '');
  }
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
};
```

The `crypto.randomUUID()` path is cryptographically secure and is used in all modern browsers. The fallback using `Math.random()` is not cryptographically secure, but this fallback would only trigger in very old environments.

**Fix:** The primary path is fine. For defense-in-depth, replace the fallback with `crypto.getRandomValues()` which has broader support than `randomUUID` but is still cryptographically secure.

---

### LOW-2: Missing Rate Limiting on Authentication

**Severity:** Low
**Files:** `src/components/AuthModal.tsx`

There is no client-side rate limiting on login attempts. Supabase has built-in rate limiting on its auth endpoints, so this is partially mitigated, but adding client-side throttling would reduce unnecessary API calls.

**Fix:** Add a simple debounce/cooldown after failed login attempts (e.g., 2-second delay after 3 failures).

---

### LOW-3: `.env` File in `.gitignore` But Potentially in Git History

**Severity:** Low (if never committed) / Critical (if committed)
**File:** `.gitignore` (line 32)

The `.env` file is listed in `.gitignore`, which prevents future commits. However, I could not verify via static analysis whether it was committed in past history. Given the memory file mentions "API key rotation -- URGENT. Keys exposed in chat", there is strong reason to believe keys have been exposed.

**Fix:** Run `git log --all --full-history -- .env` to check if the file was ever committed. If so, all keys in it are compromised and must be rotated immediately.

---

## What's Done Well

1. **Row Level Security (RLS):** All Supabase tables have RLS enabled with proper `auth.uid() = user_id` policies. Users cannot access other users' data through Supabase.

2. **HTML escaping in SharedCollection:** The public-facing shared collection page correctly uses `escapeHtml()` before rendering user content. This is the correct pattern.

3. **No eval/Function usage:** No `eval()`, `new Function()`, or `document.write()` found anywhere in the codebase.

4. **No SQL injection risk:** All Supabase queries use the client library's parameterized query builder (`.eq()`, `.insert()`, etc.), not raw SQL strings. The RPC calls also use parameterized inputs.

5. **PDF export is safe:** The custom PDF generator properly escapes special characters via `pdfEscapeStr()`.

6. **ZIP export uses sanitized filenames:** `collectionExport.ts` strips dangerous characters from filenames before creating ZIP entries.

7. **Service role key not in client code:** `SUPABASE_SERVICE_ROLE_KEY` is only referenced in server-side scripts (`run-migrations.js`, `cleanup-duplicates.ts`), never in `src/`.

8. **SEO/JSON-LD sanitization:** `SEOHead.tsx` sanitizes JSON-LD structured data before rendering.

---

## Priority Action Items

| Priority | Finding | Action |
|----------|---------|--------|
| 1 | CRITICAL-2 | Rotate Anthropic API key. Remove `VITE_ANTHROPIC_API_KEY` from `.env`. |
| 2 | CRITICAL-1 | Rotate Supabase service role key. Move to separate env file. |
| 3 | CRITICAL-1/LOW-3 | Check git history for committed `.env`: `git log --all -- .env` |
| 4 | HIGH-1 | Add DOMPurify or escapeHtml to all `dangerouslySetInnerHTML` usage. |
| 5 | CRITICAL-2/HIGH-2 | Build a server-side proxy (Cloudflare Worker) for Anthropic API calls with server-side cap enforcement. |
| 6 | HIGH-3 | Warn users about localStorage API key storage. |
| 7 | MEDIUM-2 | Add CSP headers via Cloudflare Pages `_headers` file. |
| 8 | MEDIUM-3 | Increase password minimum to 8 characters. |

Items 1-3 should be done immediately. Items 4-6 should be done before any marketing push or traffic increase. Items 7-8 are standard hardening.

---

## Note on Architecture

The fundamental architectural issue is the lack of a backend/proxy layer. The app makes browser-direct calls to both Supabase (acceptable with anon key + RLS) and Anthropic (not acceptable -- exposes the API key and makes caps unenforceable). Adding a Cloudflare Worker or Supabase Edge Function as a proxy would resolve CRITICAL-2, HIGH-2, HIGH-3, and MEDIUM-1 simultaneously.
