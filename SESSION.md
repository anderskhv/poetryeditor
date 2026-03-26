# Poetry Editor — Session State

## Last session: 2026-03-25 (Wednesday)

### What happened — Privacy, Email, Security, First Users

**First real users discovered!** Two poets signed up organically:
- `jempoetry@icloud.com` (Mar 11) — advanced, Dunbar-influenced, 10 conversations, 148 messages, 8 poems. Found via DuckDuckGo. Inactive since Mar 13.
- `nemorian@live.com` (Mar 24) — intermediate, Tolkien/Chesterton-influenced, 16 conversations, 61 messages. Found via Bing. Active overnight.

**Infrastructure completed (from Group CEO window):**
1. **Supabase RLS audit** — all tables confirmed secure. `_migrations` table had RLS disabled, now fixed.
2. **Resend email setup** — domain verified, DNS records added in Cloudflare (MX + TXT on `send` subdomain, DKIM). Supabase SMTP configured to send from `noreply@poetryeditor.com` via Resend.
3. **Email templates** — 6 branded HTML templates created in `supabase/email-templates/`, matching Poetry Editor's warm paper aesthetic. Pasted into Supabase dashboard.
4. **Privacy policy** — `/privacy-policy.html` deployed. Plain English, GDPR-compliant. Covers data storage, Anthropic processing, user rights.
5. **Signup consent flow** — AuthModal now has two checkboxes: required privacy policy agreement + optional founder email contact. Consent stored in Supabase user metadata.
6. **GDPR user management script** — `monitoring/gdpr-user-manage.js` handles export and delete for any user.
7. **User activity monitoring** — `monitoring/user-activity.js` added to morning routine. Shows signups, activity levels, onboarding profiles.
8. **Anthropic API credits** — topped up + auto-reload enabled.

**Still needs doing (CEO tasks):**
- [ ] Set up `contact@poetryeditor.com` forwarding in Cloudflare Email Routing
- [ ] Set up Fastmail identity for reply-as `contact@poetryeditor.com`
- [ ] Email jempoetry — personal founder outreach (after contact email is set up)
- [ ] Verify signup flow works end-to-end with new checkboxes (test with a fresh account)

---

## Previous session: 2026-03-20 (Friday, afternoon)

### What happened — GSC Review & Next Week Planning

Reviewed Google Search Console 3-month performance screenshot:
- 14 clicks / 4.27k impressions / 0.3% CTR / 51.9 avg position
- Impressions trending up, average position improving — SEO groundwork from Mar 16 is paying off
- CTR will unlock once pages break into top 20

SEO-ACTION-PLAN.md, LAUNCH-PLAN.md, and OUTREACH.md were created on Mar 19 (previous session).

**Next week goal:** Get ALL sites live. Build a launch plan for each. Focus on Tinct.

### Immediate next steps (Monday)
1. [ ] GSC deep dive — run the analysis outlined in SEO-ACTION-PLAN.md
2. [ ] Deploy latest changes (push to main)
3. [ ] Start executing launch plan (was scheduled for Mar 20-24, push to next week)
4. [ ] Build launch plans for Sojourners and Tinct

---

## Previous session: 2026-03-16 (Sunday, afternoon)

### What happened — Rhyme & Synonym Quality + SEO Overhaul

Major SEO and content quality overhaul across 6 phases:

**Phase 1: Offline Synonym Database**
- New `scripts/build-wordnet-synonyms.mjs` — compiles WordNet (553 JSON files) + CMU dict into offline synonyms
- `src/data/offlineSynonyms.json` expanded from 112 → 19,457 entries (174x increase)

**Phase 2: Enriched Pre-rendered HTML**
- `scripts/prerender.mjs` — major rewrite of rhyme/synonym HTML generators
- Rhyme pages now contain actual rhyme lists grouped by syllable count, IPA pronunciation, cross-links
- Synonym pages now contain WordNet senses with glosses/definitions
- JSON-LD `numberOfItems` fixed (was 0 on every page, now actual counts)
- `itemListElement` populated with real data for rich snippets
- Cross-links between rhyme ↔ synonym pages

**Phase 3: Sitemap Alignment**
- `scripts/generate-sitemaps.mjs` — trimmed from 25k to 8k per type (matching Cloudflare pre-render limit)
- Words sorted by priority: synonym-rich words first, then by length
- All common poetry words (love, heart, time, night, dream, etc.) now included
- Added all learn pages to main sitemap

**Phase 4: Rhyme Quality Improvements**
- `src/utils/cmuDict.ts` — added `getIPAPronunciation()` (e.g., "love" → "/lʌv/")
- `src/data/wordFrequency.ts` — new file with 2,000 word frequency ranks
- `src/utils/rhymeApi.ts` — rhyme results now sorted by word frequency (common words first)
- `src/pages/RhymeWord.tsx` — pronunciation display added to word info section

**Phase 5: Synonym Quality (partial)**
- WordNet sense definitions rendered in pre-rendered HTML
- Inline definitions show in static pages (not yet in client-side Thesaurus.tsx)

**Phase 6: 7 New Learn Pages**
- LearnVillanelle, LearnPantoum, LearnOde, LearnElegy, LearnBallad, LearnSlantRhyme, LearnAvoidingCliches
- All pre-rendered with SEO metadata, added to router.tsx and homepage

**Key metrics:**
- Offline synonym entries: 112 → 19,457
- JSON-LD numberOfItems: 0 → actual counts
- Learn pages: 4 → 11
- Sitemap URLs: ~50k → ~16k (all with substantive HTML)
- Build: 16,153 pages pre-rendered, TypeScript 0 errors

### What's NOT done (from the plan)

**Phase 4 remaining:**
- [ ] Pronunciation display on rhyme results (each result word) — currently only the searched word shows IPA
- [ ] Consonance matching as separate near-rhyme category

**Phase 5 remaining:**
- [ ] Inline definitions in client-side Thesaurus.tsx (currently only in pre-rendered HTML)
- [ ] Register/formality indicators (formal/informal/poetic/archaic)
- [ ] Expand `wordEnhancements.ts` from 104 → 500 entries with poetry quotes

**Not started:**
- [ ] Run `npm run build && git push` to deploy (currently only local)
- [ ] Verify Google Search Console picks up enriched pages after deploy
- [ ] Monitor indexing of new learn pages

### Immediate next steps
1. [ ] Deploy: push to main (Cloudflare auto-deploys)
2. [ ] Verify a few pre-rendered pages in production (view source on live site)
3. [ ] Submit updated sitemap to Google Search Console
4. [ ] Expand wordEnhancements.ts with more poetry quotes (Phase 5 remaining)
5. [ ] Add inline definitions to client-side Thesaurus.tsx

### Still pending from previous sessions
- [ ] Add the 16 blocked poems (Anders provides texts)
- [ ] Second batch of ~50 more poems toward 200 target
- [ ] Apply editorial report migration to Supabase
- [ ] Test Playwright QA script
- [ ] Write BACKLOG.md
- [ ] Fix analytics SQL

### Files changed this session
- `scripts/build-wordnet-synonyms.mjs` — NEW
- `scripts/prerender.mjs` — major changes (CMU dict loading, enriched HTML generators)
- `scripts/generate-sitemaps.mjs` — trimmed limits, priority sorting, learn pages added
- `src/data/offlineSynonyms.json` — expanded 112 → 19,457 entries
- `src/data/wordFrequency.ts` — NEW (2,000 word frequency ranks)
- `src/utils/cmuDict.ts` — added IPA pronunciation
- `src/utils/rhymeApi.ts` — frequency-based sorting
- `src/pages/RhymeWord.tsx` — pronunciation display
- `src/router.tsx` — 7 new learn page routes
- `src/pages/learn/Learn*.tsx` — 7 new learn page components
- `public/sitemap-*.xml` — regenerated with trimmed limits
