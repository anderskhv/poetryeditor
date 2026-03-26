# Poetry Editor — Launch Plan

**Date:** 2026-03-20 (Friday)
**Goal:** Get Poetry Editor in front of real people — poets, developers, writers
**Time required:** ~2-3 hours spread across the day

---

## Pre-Launch Checklist

- [ ] Run monitoring scripts — fresh baseline
- [ ] Smoke test: rhyme finder, syllable counter, haiku checker, poem pages, signup flow
- [ ] Quick mobile check on key pages (HN/Reddit traffic skews mobile)
- [ ] Record a 30-second screen capture of the editor in action — write a few lines, watch the analysis light up
- [ ] URLs to have ready:
  - `poetryeditor.com` (homepage)
  - `poetryeditor.com/rhymes` (rhyme finder)
  - `poetryeditor.com/syllables` (syllable counter)
  - `poetryeditor.com/poems/ozymandias` (poem analysis example)
  - `poetryeditor.com/haiku-checker`

---

## Channel 1: Hacker News — "Show HN"

**When:** Friday ~3pm CET (9am EST — peak HN)
**Effort:** Low | **Impact:** High

**Title:**
> Show HN: Poetry Editor – Browser-based NLP for poets (offline, no API calls)

**Post:**
> I left my job as SVP at a billion-dollar software company to become a poet. One of the first things I noticed: there is no serious tool for writing poetry. You get notepad apps with a calligraphy font, or AI tools that want to write the poem for you.
>
> So I built one. Poetry Editor runs real-time NLP analysis in your browser — syllable counting, stress patterns, meter detection, rhyme finding — all client-side using the CMU Pronouncing Dictionary. Your poems never leave your machine.
>
> The technical bits:
> - Custom NLP pipeline in TypeScript: POS tagging, phoneme analysis, stress detection, meter classification
> - CMU Pronouncing Dictionary for phoneme-based rhyme matching (not just string comparison)
> - 16,000+ pre-rendered reference pages (rhymes and synonyms) for programmatic SEO
> - AI coaching via Claude when you want a second opinion, but the core analysis is fully offline
> - React 18 + Vite + Monaco Editor
>
> I use it daily to write my own collection, which I'm submitting to my editor this week. Free, no account needed.
>
> https://poetryeditor.com

**Why this works for you specifically:** You're not pretending to be a startup founder marketing a product. You're a poet who built the tool he needed. The SVP→poet transition is unusual enough that people will click. And HN genuinely appreciates offline-first architecture and "no unnecessary API calls."

---

## Channel 2: Twitter/X (@FallibleMusings)

**When:** Friday morning
**Effort:** Low | **Impact:** Medium-High (your audience already resonates with your voice)

Your strongest tweet ever was the Magnus Carlsen / fun criterion one (2,713 likes). That worked because it was a real idea, not a product pitch. Same energy here.

**Thread:**

**Tweet 1:**
> Every poetry app I've tried does one of two things:
>
> 1. Gives you a blank page with a nice font
> 2. Offers to write the poem for you
>
> Neither helps you become a better poet.
>
> So I built something different.
>
> poetryeditor.com

**Tweet 2:**
> I wanted to SEE what I'd written. Not be told what to write.
>
> How many syllables in this line? Where do the stresses fall? What's the meter doing? Which words rhyme with "covenant" when I need one at the end of a stanza?
>
> These are craft questions. They have answers. A tool should surface them.

**Tweet 3:**
> The entire analysis runs in your browser. No API calls. No data sent anywhere.
>
> It uses the CMU Pronouncing Dictionary — the same phoneme database linguists use — to find rhymes, count syllables, and detect stress patterns.
>
> Your poems stay on your machine unless you choose otherwise.

**Tweet 4:**
> I'm on sabbatical writing a poetry collection. I use this every day. It's free, no account required for the core tools.
>
> Try it on Shelley's Ozymandias and watch the analysis unfold:
> poetryeditor.com/poems/ozymandias
>
> Or just open a blank page and write:
> poetryeditor.com

**Optional Tweet 5 (if it's going well — the Deutsch connection):**
> The philosophy behind the tool is David Deutsch's idea that genuine progress comes from better explanations, not more authority.
>
> A poetry tool shouldn't tell you your poem is "good" or "bad." It should help you see what's actually there — so YOU can decide what to do about it.

**Note:** Tweet 5 bridges your existing @FallibleMusings audience (Deutsch followers) to the tool. It's the thread that makes this unmistakably yours, not a generic launch.

---

## Channel 3: LinkedIn

**When:** Friday morning
**Effort:** Low | **Impact:** Medium

This is your strongest channel for the personal story. Your network is full of ex-McKinsey, ex-corporate people who are fascinated/terrified by the idea of leaving.

**Post:**
> Eight months ago I left my SVP role at Jabra to become a poet.
>
> People asked — reasonably — what that actually means. What do you DO all day?
>
> Among other things: I built a poetry editor.
>
> Not because I wanted to start a company. Because the tools available to poets are embarrassingly bad. You get a text box with a calligraphy font, or an AI that offers to write the poem for you. Neither helps you learn the craft.
>
> Poetry Editor analyzes your writing in real time — syllable counts, stress patterns, meter, rhyme schemes — all running locally in your browser, no data sent anywhere. It includes a rhyme finder, synonym tool, syllable counter, and form-specific checkers for haiku and sonnets.
>
> I use it every day to write my own collection, which I'm submitting to my editor this week.
>
> It's free. No account needed. Built it because I needed it.
>
> poetryeditor.com
>
> The sabbatical continues. The poem continues. The fun continues.

**Why this works:** It's honest. It's not "I'm disrupting the $X billion poetry market." It's "I left, I write, I built a tool, here it is." Your LinkedIn network will share it because the subtext — "someone actually did the thing I fantasize about" — is irresistible.

---

## Channel 4: Reddit

**When:** Spread across Friday — one post per hour, not all at once
**Effort:** Low | **Impact:** Medium

### r/poetry
**Title:** "I'm a poet who built a free editor with real-time rhyme, meter, and syllable analysis — would love feedback from this community"

**Body:** Honest. You write poetry. You're submitting a collection this week. You built this tool for yourself and now it's free for anyone. Ask what features poets actually want. Link to a poem analysis page as a demo. *Don't* list features like a product page.

### r/writing
**Title:** "Free rhyme finder and syllable counter built specifically for poets and songwriters"

**Body:** Short and useful. "I write poetry and got tired of using three different websites for rhymes, synonyms, and syllable counts. Built one tool that does all three. Here it is." Link to `/rhymes` and `/syllables`.

### r/SideProject
**Title:** "I left my corporate SVP job, became a poet, and built the tool I wished existed"

**Body:** The journey. The fun criterion. The tech stack. The honest GSC numbers (360 impressions, position 50, 6 real visitors/day). Developers love transparent data about what actually happens when you launch something.

### r/poetrywriting
**Title:** "Made a free haiku checker and sonnet checker — checks syllable counts and form rules automatically"

**Body:** Two lines. Link to `/haiku-checker` and `/sonnet-checker`. Done.

---

## Channel 5: Indie Hackers

**When:** Friday
**Effort:** Low | **Impact:** Low-Medium

**Angle:** "I'm not trying to build a startup. I'm a poet who built a tool." Indie Hackers loves the anti-hustle narrative, and your fun criterion philosophy is the opposite of growth hacking. Be honest about the mission — help people find their poetic voice, not monetize them.

---

## Channel 6: dev.to Article (slow burn)

**When:** This weekend or early next week
**Effort:** Medium | **Impact:** Medium (evergreen backlink)

**Title:** "I pre-rendered 16,000 pages for programmatic SEO — here's what Google actually did"

**Content:** The technical SEO story with real data. 16,000 rhyme/synonym pages, Cloudflare Pages, pre-render script, CMU dictionary pipeline. Share the actual GSC numbers — 360 impressions, average position 50, clicks only on obscure words where you rank #1. Developers eat this up. Honest data about SEO is rare.

This article will rank on Google itself and generate backlinks for months.

---

## Channel 7: Product Hunt

**When:** ⭐ Hold for Tuesday March 24 (highest-traffic day)
**Effort:** Medium | **Impact:** Very High

**Tagline:** "A poetry editor that helps you see what you've written"

**Description:**
> Most poetry tools either give you a blank page or offer to write the poem for you. Poetry Editor does neither. It analyzes your work in real time — syllable counts, stress patterns, rhyme schemes, meter — so you can see the structure of what you've actually written.
>
> Everything runs in your browser. No API calls for analysis. No data leaves your machine.
>
> Built by a poet, for poets. I left my tech career to write poetry, built this tool because nothing like it existed, and now use it daily to write my own collection.
>
> Free. No account needed. 55 analyzed classic poems included.

**Maker comment:**
> I'm Anders — former SVP at Jabra, now a poet on sabbatical. I built this because I kept Alt-tabbing between five different websites while writing: one for rhymes, one for synonyms, one for syllable counts, one for reading my draft, one for looking up what iambic pentameter actually means.
>
> The AI coaching feature exists for when you want a second opinion. But the philosophy is Deutsch-ian: the tool should help you see clearly, not tell you what to think. Assessment as observation, never judgment.

**Prepare this weekend:**
- [ ] 4-5 screenshots (editor view, rhyme finder results, poem analysis, AI coach, mobile view)
- [ ] The screen recording/GIF from the checklist
- [ ] Ask 5-10 people to upvote on launch day (your Twitter followers, a few friends)

---

## Channel 8: Direct Outreach (next week)

**When:** Monday-Wednesday next week
**Effort:** Medium | **Impact:** High (quality backlinks)

- [ ] Find 10 "best poetry tools" articles via Google — email authors with a 2-sentence pitch + screenshot
- [ ] Email Poets & Writers (pw.org) — they maintain resource lists for working poets
- [ ] Contact 3 creative writing professors — "free tool for your students, no account needed, no data collection"
- [ ] Reach out to Logan at Conjecture Institute — not for Poetry Editor directly, but the connection could lead to a mention in Deutsch-adjacent circles

---

## Day Schedule

| Time | Action |
|------|--------|
| 9:00-10:00 | **Writing block** (non-negotiable — Into Infinity is due TODAY) |
| 10:00 | Run monitoring, smoke test, prepare screen recording |
| 10:30 | Post Twitter thread |
| 10:45 | Post LinkedIn |
| 11:00 | Post r/poetry |
| 12:00 | Post r/writing |
| 13:00 | Post r/SideProject |
| 14:00 | Post r/poetrywriting |
| 15:00 | Post Show HN (9am EST) |
| 15:00+ | Monitor and respond to every comment |
| Evening | Post Indie Hackers if energy permits |

**Into Infinity note:** March 19 was the submission deadline to Ceridwen. If that happened today or is happening tomorrow morning, the writing block takes absolute priority. The launch can shift to afternoon or even Monday. A good poem matters more than a launch day.

---

## What Makes This Launch Yours

The generic version of this plan would say "highlight your unique value proposition" and "leverage your personal brand." Here's what's actually true about you and this tool:

1. **You actually use it.** Every day. To write real poems. That you're submitting to a real editor this week. This isn't a side project you built and abandoned — it's your daily writing environment.

2. **You left a billion-dollar P&L to write poetry.** That's the story. Not "serial entrepreneur builds SaaS." The tool is proof that the transition is real, not a LinkedIn fantasy.

3. **The fun criterion is the philosophy of the tool.** Assessment as observation, never judgment. The tool doesn't tell you your poem is good or bad. It shows you what's there — syllables, stresses, rhymes — and you decide. That's Deutsch applied to creative software.

4. **You're reluctant to monetize it.** "Barriers to access conflict with mission." The tool is free because the mission is to help people find their poetic voice. That's not marketing — it's what you actually believe. Say it.

5. **Your @FallibleMusings audience already trusts your voice.** The Deutsch/Popper/fallibilism angle connects the tool to your existing intellectual platform. Tweet 5 in the thread above is the bridge.

6. **The "no API calls" thing isn't a feature — it's a stance.** In a world where every tool wants to phone home, yours doesn't. That matters to poets (privacy of drafts) and developers (architecture choice) for different reasons.

Don't perform enthusiasm. Don't use exclamation marks. Write the way you write on Twitter — declarative, direct, a little combative, grounded in something real.

---

## Expected Outcomes (honest)

| Scenario | Visitors | Signups | Backlinks |
|----------|----------|---------|-----------|
| **HN front page** (best case) | 5,000-15,000 | 50-200 | 20-50 |
| **HN page 2-3** (likely) | 500-2,000 | 10-30 | 5-15 |
| **HN no traction** | 50-100 | 1-5 | 1-3 |
| **PH top 5** (Tue) | 3,000-8,000 | 30-100 | 15-30 |
| **Reddit combined** | 200-1,000 | 5-20 | 2-5 |
| **Twitter thread** | 500-2,000 | 5-15 | 3-8 |
| **LinkedIn** | 200-500 | 2-5 | 1-2 |

Even modest results would 10x your current 6 visitors/day and generate the first backlinks that unlock Google rankings.

---

## One Decision

**Do you want to launch HN + Reddit + Twitter + LinkedIn tomorrow (Friday) and hold Product Hunt for Tuesday?**

That gives you two distinct waves. Friday is the organic/authentic push. Tuesday is the more structured PH launch with better screenshots and a weekend to prepare.
