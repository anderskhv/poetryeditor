# Security Incident — Anthropic API Key Exposure

**Date discovered:** 2026-04-27
**Severity:** Critical (financial — direct billing exposure)
**Status:** Discovered, not yet remediated
**Project:** poetry-editor (poetryeditor.com)

---

## One-line summary

The Anthropic API key is shipped in plaintext inside the public JavaScript bundle served by poetryeditor.com. Anyone with a browser (or a scraper) can extract it and bill calls to our Anthropic account.

---

## What happened

1. The project's Anthropic API key is stored in `.env` as `VITE_ANTHROPIC_API_KEY`.
2. **Vite treats any env var prefixed with `VITE_` as a "client-safe" var and inlines it into the bundled JavaScript at build time.** This is a documented Vite feature, not a bug — but it is a footgun when the var is actually a secret.
3. The editor chat and editorial report code (`src/utils/editorApi.ts`, `editorAgents.ts`, `editorialAgents.ts`, `llmAnalysis.ts`) reads the key with `import.meta.env.VITE_ANTHROPIC_API_KEY` and calls `api.anthropic.com` directly from the browser using the `anthropic-dangerous-direct-browser-access: true` header.
4. The result: the production bundle at `https://poetryeditor.com/assets/index-*.js` contains the literal string `sk-ant-api03-...`.

## Evidence (reproduction)

```bash
# Find the bundle URL from the homepage:
curl -s https://poetryeditor.com | grep -oE 'src="[^"]*\.js"'

# Then grep the bundle for an Anthropic key:
curl -s https://poetryeditor.com/assets/index-CL7BsTAq.js | grep -oE 'sk-ant-[a-zA-Z0-9_-]{20,}' | head -3
```

When run today, this returned the live key (truncated for this doc): `sk-ant-api03-q1faK...`. Multiple matches in the bundle (the key is referenced from each of the four files above).

## Impact

- **Anyone in the world** who has visited poetryeditor.com — or any automated GitHub/web scraper looking for `sk-ant-` patterns — can extract the key and use it to call `api.anthropic.com` billed to our account, with no rate limit beyond Anthropic's own.
- **None of these calls show up in our Supabase tables** (`editor_messages`, `editor_usage`, etc.) because they bypass our app entirely. Our usage dashboard will show ~$0 while the Anthropic bill climbs.
- This is consistent with the observed symptom: today's Anthropic spend is way up, but Supabase shows zero activity since 2026-04-25 (last real user message). Whatever is consuming budget is not going through our app.
- Anders's previously-suspected "Claude Design agent" is almost certainly NOT the culprit — this is a public-internet leak, not an internal misuse.

## Why this shipped

The architecture decision — "make the editor cheap and zero-infrastructure by calling Anthropic directly from the browser" — implicitly accepted that a key would ship to the client. The `anthropic-dangerous-direct-browser-access` header is Anthropic's explicit warning that this pattern is for prototypes/internal tools, not for public products. We treated it as production-ready.

Mitigations we *do* have (admin-vs-registered caps, per-month $5 cap in Supabase, localStorage caps for guests) are all client-side enforced and assume the caller is using our app. They do nothing against a direct API caller using our key.

---

## ⚠️ Checklist to audit your OTHER projects

Run all of these against any project that uses Anthropic (or OpenAI, or any paid API). If any check returns a hit, you have the same vulnerability.

### 1. Grep for the dangerous pattern in source

```bash
# In each project root:
grep -rn "VITE_.*API_KEY\|NEXT_PUBLIC_.*API_KEY\|REACT_APP_.*API_KEY\|EXPO_PUBLIC_.*API_KEY" src/ app/ pages/ 2>/dev/null
grep -rn "anthropic-dangerous-direct-browser-access\|dangerouslyAllowBrowser" . 2>/dev/null
grep -rn "import.meta.env.VITE_.*KEY\|process.env.NEXT_PUBLIC_.*KEY" . 2>/dev/null
```

**Red flags:**
- Any env var named `*_API_KEY` with a "public client" prefix (`VITE_`, `NEXT_PUBLIC_`, `REACT_APP_`, `EXPO_PUBLIC_`, `PUBLIC_`).
- The string `dangerouslyAllowBrowser: true` (Anthropic SDK) or `anthropic-dangerous-direct-browser-access: true` (raw fetch).
- Direct calls to `api.anthropic.com` or `api.openai.com` from code that runs in `src/` (browser code).

### 2. Probe the live site

For each deployed project, replace `<site>` and run:

```bash
# Find the JS bundle(s):
curl -s https://<site> | grep -oE 'src="[^"]*\.js"'

# Then for each bundle URL:
curl -s https://<site>/assets/<bundle>.js | grep -oE 'sk-ant-[a-zA-Z0-9_-]{20,}' | head -3
curl -s https://<site>/assets/<bundle>.js | grep -oE 'sk-[a-zA-Z0-9]{40,}'        # OpenAI
curl -s https://<site>/assets/<bundle>.js | grep -oE 'AIza[0-9A-Za-z_-]{35}'        # Google
```

**Any output means the key is public.** Revoke immediately.

### 3. Check what's bundled by build, not by intent

It is not enough to ask "did I think this was a server-only key?". The build tool decides. The rule:

| Framework | Variables shipped to client |
|---|---|
| Vite | anything starting with `VITE_` |
| Next.js | anything starting with `NEXT_PUBLIC_` |
| Create React App | anything starting with `REACT_APP_` |
| Expo / React Native web | anything starting with `EXPO_PUBLIC_` |
| SvelteKit | `$env/static/public` and `$env/dynamic/public` |
| Astro | anything starting with `PUBLIC_` |

**If a secret has one of those prefixes, it is in the bundle. There is no exception.**

### 4. Projects to check (Anders's portfolio)

Based on the org chart in `~/Documents/CLAUDE.md`:

- [ ] **poetry-editor** — confirmed leaked (this incident)
- [ ] **Sojourners** — vanilla JS, no build step. Unlikely to use Anthropic at all but verify no key is hard-coded.
- [ ] **Tinct** — React + Vite + Claude API per the project notes. **High priority — same stack, same risk pattern.**
- [ ] **Bible Synthesis** — verify if any code/scripts.
- [ ] **Hearing Care (Alex)** — verify.
- [ ] Any books/scripts that call APIs (e.g., research helpers).

---

## Immediate actions (in order)

1. **Revoke the leaked key.** console.anthropic.com → Settings → API Keys → find `sk-ant-api03-q1faK...` → Revoke. This stops the bleeding instantly.
2. **Note the damage.** Anthropic console → Usage tab → check today's and this week's spend. Screenshot for records.
3. **Audit other projects** using the checklist above before issuing any new key — otherwise the new key may immediately leak from another product.
4. **Communicate to real users only if needed.** If the editor breaks for them after revocation, post a short status note ("Editor temporarily down for a security fix, back within X hours"). Do not detail the leak publicly.

## Permanent fix (separate task)

Move all Anthropic calls server-side. Recommended for poetry-editor: a Cloudflare Worker (we already deploy on Cloudflare Pages, so adding a Worker is one config away). The Worker holds the key as a Cloudflare secret, the browser calls our Worker, the Worker calls Anthropic. Caps and admin checks move into the Worker so they cannot be bypassed by editing localStorage. After this is in place:

- Drop the `VITE_` prefix from the env var name (call it `ANTHROPIC_API_KEY`) so it can never accidentally land in the client bundle again.
- Remove the `anthropic-dangerous-direct-browser-access` header from all client code.
- Delete the `getLocalApiKey()` "bring your own key" path *or* keep it explicitly for power users (they're billing themselves, so it's fine for them to keep their key in localStorage on their own browser).

I'll draft this in a follow-up once you've confirmed the audit results from the other projects.

---

## Lessons (for `tasks/lessons.md` after resolution)

- **The `*_PUBLIC` / `VITE_` / `NEXT_PUBLIC_` prefix is a contract**: the variable WILL be in the client bundle. Never use these prefixes for anything that isn't safe to print on a billboard.
- **`anthropic-dangerous-direct-browser-access: true` is a smell.** It is Anthropic telling us "you are about to do something only acceptable for an internal tool." Treat it as a TODO marker, not an architecture.
- **Client-side enforced caps are theater** when the underlying credential is exposed. Caps must be enforced where the credential lives — i.e., server-side.
- **Add a build-time check.** Before merging, scan the built `dist/` for any `sk-ant-`, `sk-`, `AIza`, etc. patterns and fail the build if found. This would have caught the issue immediately. (Will add as part of the permanent fix.)
