# Poetry Editor — Session State

## Last session: 2026-03-16 (Sunday, afternoon)

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
