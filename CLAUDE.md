# Claude Code Instructions for Poetry Editor

## Auto-Documentation Rule

**Automatically update this file** when making decisions during conversations. When we settle on a UI pattern, architecture choice, formatting convention, or project standard, append it to the Decisions Log at the bottom. Use judgment - log things useful for future sessions, skip trivial one-off choices.

---

## Tech Stack

- **Framework**: React 18 + TypeScript (strict mode)
- **Build**: Vite 5
- **Routing**: React Router DOM v7
- **Editor**: Monaco Editor (@monaco-editor/react)
- **Testing**: Playwright (e2e)
- **NLP**: Compromise.js (for text analysis)
- **Other**: dnd-kit (drag/drop), JSZip, react-helmet-async

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # TypeScript check + production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```

## Deployment

- **Host**: Cloudflare Pages
- **Project**: `poetry-editor`
- **Live URL**: https://poetryeditor.com
- **Deploy method**: Auto-deploy on push to `main`
- **Build output**: `dist/` (Vite default)

**To deploy**: Just push to main. Cloudflare handles the rest.

```bash
git push origin main
```

## Folder Structure

```
src/
├── components/    # Reusable UI components
├── data/          # Static data (poems, etc.)
│   └── poems/     # Poem analysis files (*.ts)
├── hooks/         # Custom React hooks
├── pages/         # Route-level page components
├── types/         # TypeScript type definitions
├── utils/         # Helper functions
├── test-data/     # Test fixtures
├── App.tsx        # Main app component
├── router.tsx     # Route definitions
└── main.tsx       # Entry point
```

## Copyright & Content Guidelines

**Only use public domain works.** For poetry:
- Works published before 1928 (US public domain)
- Authors who died 70+ years ago (most international)
- Explicitly verify public domain status before including

**Work in small batches.** Don't generate large volumes of content at once:
- Create 5-10 files per batch, then pause
- Avoid triggering rate limits or content filters
- Smaller requests are more reliable

**No copyright infringement.** When in doubt:
- Use older classical works
- Paraphrase rather than quote extensively
- Cite sources clearly

## Error Handling & Resilience

**Never stop on errors.** When encountering any of these, work around them and continue:

- **API errors**: Retry, use alternative approaches, or skip and continue with other tasks
- **Build errors**: Fix them inline and keep going
- **Type errors**: Fix immediately without asking
- **File not found**: Create the file or find the correct path
- **Network issues**: Retry or work offline where possible

If a specific task fails repeatedly (3+ attempts), note it briefly and move on to the next task. Return to failed tasks later if time permits.

## External API Restrictions

**DO NOT call external APIs** unless explicitly requested. This project has experienced blocking issues from repeated API calls that cause loops where Claude gets stuck retrying the same failed request.

**Specifically avoid:**
- WebFetch to external poetry databases or text sources
- Any API that requires authentication or has rate limits
- Repeated calls to the same endpoint when it fails

**When you need poem text:**
- Use local files in `src/data/poems/`
- Ask the user to provide the text
- Reference Project Gutenberg URLs for the user to fetch manually

**If you hit a blocking error:**
1. STOP immediately - do not retry
2. Report the error to the user
3. Ask for alternative instructions
4. Do NOT loop on the same request

**Content Filter Errors (400 "Output blocked by content filtering policy"):**
This happens when adding poem texts with dark themes (death, despair, violence). Classic poems like Poe, war poetry, etc. can trigger this even though they're legitimate literature.
- Do NOT retry - it will keep failing
- Ask the user to add the poem text manually
- Or adjust the analysis to match existing truncated text instead of expanding it

## Working Style

- **Be autonomous**: Don't ask for permission on routine decisions
- **Batch work**: When creating many similar files, do them in parallel where possible
- **Keep momentum**: Complete the requested task fully before stopping
- **Fix as you go**: If you notice issues while working, fix them without asking

## Project-Specific Notes

### Poem Analysis Files
Location: `src/data/poems/`
Format: See existing files like `shakespeare-sonnet-18.ts` for structure
Export: All poems must be added to `src/data/poems/index.ts`

**Consistency Check (REQUIRED):** After adding or editing any poem, verify:
1. The `text` field contains the COMPLETE poem (count lines)
2. The `lineByLine` commentary references only lines that exist in the text
3. Literary device examples quote text that actually appears in the poem
4. The `overview` doesn't reference content missing from the text

Run this check manually by comparing line counts and searching for quoted phrases.

### Key Components
- `PoetryEditor`: Main editor component with Monaco
- `AnalysisPanel`: Technical analysis (rhythm, rhymes, style, originality)
- `Layout`: Shared header/footer for tool pages
- `PoemPage`: Individual poem analysis pages at `/poems/:slug`

## Code Style

- TypeScript strict mode
- React functional components with hooks
- CSS in separate `.css` files (not CSS modules, just co-located CSS)
- No emojis unless requested

---

## Decisions Log

<!-- Append new decisions here as they're made during conversations -->
<!-- Format: **[Category]**: Description of the decision and rationale -->

**[Content Audit 2026-01-28]**: Cleaned up poem database to ensure all poems are complete.

**Policy decision**: Only include poems with full text. Excerpts removed because:
- Analysis can't properly cover partial poems
- Content filters block adding full text for some poems (dark themes trigger filters)
- Better to have fewer complete poems than many incomplete ones

**Poems expanded to full text (kept)**:
- `arnold-dover-beach.ts` - 37 lines
- `frost-nothing-gold.ts` - 8 lines
- `frost-stopping-by-woods.ts` - 16 lines
- `henley-invictus.ts` - 16 lines
- `shelley-mutability.ts` - Fixed duplication bug

**Excerpt poems DELETED (15 total)**:
- `keats-ode-nightingale.ts`, `keats-ode-grecian-urn.ts`, `keats-autumn.ts`
- `wordsworth-tintern-abbey.ts`
- `shelley-ode-west-wind.ts`, `shelley-skylark.ts`, `shelley-mont-blanc.ts`
- `poe-raven.ts`
- `eliot-prufrock.ts`
- `thayer-casey-at-the-bat.ts`
- `coleridge-kubla-khan.ts`
- `donne-no-man-is-an-island.ts`
- `kipling-if.ts`
- `tennyson-charge-light-brigade.ts`
- `lazarus-new-colossus.ts`

**Final count**: 55 complete poems remain.

**[Process]**: Added mandatory consistency check for poem files and external API restrictions to prevent blocking loops.
