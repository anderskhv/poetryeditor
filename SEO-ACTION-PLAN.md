# Poetry Editor — SEO Action Plan

**Created:** 2026-03-19
**Status:** Draft for Anders's review
**Context:** Data-driven analysis of GSC + site analytics. Technical SEO is excellent (8.5/10). The problems are domain authority and conversion.

---

## The Data (as of March 17)

### Google Search Console (7 days: Mar 10-14)
- **360 impressions, 1 click, 0.3% CTR**
- **Average position: 50.9** (page 5 — invisible)
- Position trend improving: 50.9 → 46.5 → 52.4 → 46.6 → **37.3**
- All synonym queries rank position 60-77 (behind Thesaurus.com, Merriam-Webster, etc.)
- Homepage: 17 impressions, position **81.3**

### Google Search Console (28 days: Feb 17 - Mar 16)
- **8 total clicks** — ALL on ultra-obscure rhyme words:
  - `/rhymes/gwozdz` — position 1 (no competition)
  - `/rhymes/emmins` — position 1
  - `/rhymes/poltorak` — position 1
  - `/rhymes/forein` — position 1
  - `/rhymes/lashbrook` — position 1
  - `/rhymes/socci` — position 1
  - `/rhymes/sowter` — position 4
  - `/rhymes/dermot` — position 9
- **Sonnet 130 page**: 36 impressions, position **86** (behind SparkNotes, LitCharts, etc.)
- **Homepage**: 29 impressions, position **70.4**

### Site Analytics (7 days)
- 194 human pageviews, 59 sessions
- **155 from Denmark (80%) = Anders**
- **Real external traffic: ~39 pageviews/week (~6/day)**
- Referrers: 156 direct, 13 DuckDuckGo, 11 Bing, 3 Google, 1 Qwant
- Top non-Anders pages: `/synonyms/unique`, `/synonyms/beautiful`, `/synonyms/indeterminable`
- Bot: Googlebot 813/week (actively crawling), Applebot 11,159, Bingbot 41

---

## Root Cause Analysis

### Why Google won't rank us

**It's not technical.** Google crawls 813 pages/week. Sitemaps submitted. Structured data present. Pre-rendering works.

**It's domain authority.** poetryeditor.com is a new domain with zero backlinks competing against:
- Thesaurus.com (DA 90+, millions of backlinks) for synonym queries
- RhymeZone.com (DA 70+) for rhyme queries
- SparkNotes/LitCharts (DA 80+) for poem analysis queries
- Merriam-Webster (DA 90+) for word-related queries

**Proof:** The ONLY queries where we rank #1 are words so obscure that no competitor has a page for them (gwozdz, poltorak, socci). The moment we compete with established sites, we're position 50-80.

### Why no signups

Two separate problems:
1. **Almost no external visitors to convert** — 6/day is too few for any conversion rate to matter
2. **Utility page visitors have no conversion path** — someone searching "affected synonym" wants the answer, not an account. There's no bridge from utility pages to the editor.

### The positive signals

- Position trend is improving (50.9 → 37.3 over 5 days)
- Google IS actively crawling (813 bot visits/week)
- The long-tail rhyme strategy works — position 1 for obscure words
- DuckDuckGo (13 visits/week) and Bing (11) are already sending traffic
- One rhyme query ("attention rhyming words") hit position **24** — almost page 2

---

## Strategy: Three Paths to Google Breakthrough

### Path 1: Win the long tail (already working — accelerate it) ⭐

**The math:** 16,000 rhyme/synonym pages exist. Currently ~8 get clicks/month from obscure words at position 1. If Google gradually trusts more pages (which it's doing), this scales naturally.

**Key insight from data:** Rhyme pages for rare/unique words rank immediately (#1). Common word pages (art, attention) rank 24-50. This gap will close as domain authority builds.

**Actions:**
| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 1 | **Find all position 10-30 queries in GSC** — these are closest to page 1. "attention rhyming words" at position 24 needs one push to break through. | Low | High |
| 2 | **Enrich those specific pages** — add usage examples, poetry context, "poems that use this rhyme." Make them better than RhymeZone's bare list. | Medium | High |
| 3 | **Cross-link aggressively** — every rhyme page links to related synonyms, every synonym page links to rhymes. Build topical clusters. | Medium | High |

**Timeline:** Already happening passively. Active optimization could push 10-20 pages to page 1 within 4-8 weeks.

### Path 2: Build domain authority (the hard lever)

**This is the only way to move competitive queries from position 50 to page 1.**

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 4 | **Product Hunt launch** — "Poetry Editor: Offline NLP analysis for poets." The technical angle (no API calls, CMU pronouncing dictionary, offline-first) is genuinely novel and HN/PH audiences appreciate it. One good launch = 20-50 backlinks. | Medium | **Very High** |
| 5 | **Hacker News "Show HN"** — same angle. The offline NLP engine story is interesting to developers. | Low | High |
| 6 | **"Best poetry tools 2026" outreach** — find 10-15 listicle articles, email authors with a blurb. Each inclusion = 1 high-quality backlink. | Medium | High |
| 7 | **Reddit** — genuine contributions to r/poetry, r/writing when someone asks for tools. Not spam. | Low | Medium |
| 8 | **Twitter tool links** — link to specific pages (`/rhymes/love`, `/syllables`, `/poems/ozymandias`), not homepage. | Low | Low-Med |
| 9 | **Writing community directories** — NaNoWriMo resource lists, university creative writing pages, poetry foundation links. | Medium | Medium |

**Timeline:** PH/HN launch could happen within 2 weeks. Backlink effects take 4-8 weeks to show in rankings.

### Path 3: Convert the traffic you DO get

**Even 6 visitors/day can produce signups if the funnel exists.**

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 10 | **CTA on utility pages** — bottom of every rhyme/synonym result: "Want to write a poem with these? Try the editor →" | Low | Medium |
| 11 | **"Save your work" prompt** — after 2+ minutes in the editor or 50+ words typed as guest: "Create a free account to save your poems." | Medium | High |
| 12 | **Show account value** — landing page section: what you get with an account (cloud saves, AI coaching, editorial reports, collections). Currently invisible. | Low | Medium |
| 13 | **Related poems on poem pages** — "If you liked Ozymandias, read Ode on a Grecian Urn." Keeps people on-site, increases pages/session. | Low | Medium |
| 14 | **Expand learn pages to 1,500+ words** — "How to write a haiku" etc. These have less competition than synonym queries. | Medium | High |

---

## Priority Sequence

### This week (before Into Infinity deadline takes over)
- **#1** — Mine GSC for position 10-30 queries (takes 15 minutes, high value)
- **#10** — CTA on utility pages (tell Poetry Editor CEO to build)
- **#12** — Account value section on landing page

### March-April (authority building sprint)
- **#4** — Product Hunt launch (prepare the listing)
- **#5** — Hacker News Show HN
- **#6** — Outreach to "best poetry tools" articles
- **#3** — Cross-link rhyme ↔ synonym pages
- **#7** — Start Reddit presence

### April-May (conversion + content)
- **#11** — Save your work prompt
- **#2** — Enrich top-performing pages with richer content
- **#14** — Expand learn pages
- **#13** — Related poems

### Ongoing
- **#8** — Twitter links to tool pages (whenever posting)
- **#9** — Directory submissions (batch once)

---

## Success Metrics

| Metric | Current | 4-week target | Summer target |
|--------|---------|---------------|---------------|
| Google impressions/week | 360 | 1,000 | 5,000 |
| Google clicks/week | 1 | 10 | 50+ |
| Average position (all queries) | 50.9 | 35 | 20 |
| Queries on page 1 (position 1-10) | ~8 (obscure) | 20 | 50+ |
| External visitors/day | 6 | 15 | 50+ |
| User signups (total) | 0 | 5 | 25+ |
| Backlinks (referring domains) | 0 | 10 | 30+ |

---

## Tomorrow Morning: GSC Deep Dive

When we run the monitoring scripts, specifically check:
1. **Total indexed pages** — how many of 16,000+ has Google actually indexed?
2. **"Discovered but not indexed" count** — if high, authority problem confirmed
3. **Full query list** — find ALL position 10-30 queries (these are the breakthrough candidates)
4. **Page-level data** — which page types rank best? (rhymes vs synonyms vs poems vs learn)
5. **Crawl errors** — any 404s or soft errors?
