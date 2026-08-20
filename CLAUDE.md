# Claude Code Instructions for Poetry Editor

## Organization

This project is part of Anders's portfolio, managed by `claude.md` (Group CEO) at the Documents root. This CLAUDE.md is the project CEO — it owns this project end-to-end.

**IMPORTANT: You are a project CEO, NOT the Group CEO.** Do NOT run the session protocol from the root claude.md (no Garmin sync, no calendar check, no morning check-in, no time tracking). That is handled by the Group CEO in the root Documents folder. You focus only on this project's code and tasks.

**Functional experts available on request** (load when needed):
- `../../agents/design.md` — UX/UI standards, visual consistency, house design language
- `../../agents/marketing.md` — Growth strategy, positioning, launch planning
- `../../agents/deutsch.md` + `../../agents/deutsch-condensed.md` — David Deutsch philosophical advisor

**Screenshots folder:** `../../Screenshots/` — Anders drops screenshots here for review. Use the Read tool to view them (it handles images natively). When asked to "check the screenshot" or "look at this", check this folder for the latest files.

When Anders says "consult the design lead" or "what would marketing say?", load the relevant file.

---

## API Cost Rule — HARD BAN

**ZERO Anthropic API spend during development. No exceptions.**

All content generation — poem analyses, editorial content, synonym enrichment, any text produced by Claude — must happen through the CLI conversation and be written to files. **Never** run scripts or code that calls `api.anthropic.com` during development.

The API key (`VITE_ANTHROPIC_API_KEY`) exists **ONLY** for production user-facing features: the AI poetry coach and editorial reports triggered by real users after deployment. Development-time content generation through API calls burns budget that funds the entire operation.

**If you need Claude to generate content:** do it in the CLI conversation, then write the result to a file. This is how Sojourners generated 21 event summaries, 33 character bios, and 12 era rewrites — all through CLI, zero API cost.

**Violating this rule is a firing offense for the CEO.**

---

## Auto-Documentation Rule

**Automatically update this file** when making decisions during conversations. When we settle on a UI pattern, architecture choice, formatting convention, or project standard, append it to the Decisions Log at the bottom. Use judgment - log things useful for future sessions, skip trivial one-off choices.

---

## Decision Logging

Every time you encounter a decision that requires Anders's input — or that you *choose* to escalate rather than handle yourself — log it to `DECISIONS.md` in this project root.

Format (append a new row each time):

| Date | Decision | Category | Escalated? | Reasoning |

**Categories:** `architecture`, `design`, `content`, `deploy`, `delete`, `scope`, `external`, `spend`

**Rules:**
- Log BEFORE asking Anders. The act of logging forces you to articulate what you need and why.
- If you decide something yourself within your existing permissions, still log it as `Escalated? No` — we want to see the full decision landscape, not just escalations.
- One line per decision. Keep it tight.
- "Reasoning" = why you escalated (or why you felt safe deciding alone).

This log will be reviewed weekly by Group CEO and Anders to tune your autonomy level.

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
- `EditorChat`: AI coaching chat sidebar (right panel in main editor)
- `PreFlightForm`: Modal questionnaire before editorial report generation
- `CollectionPanel`: Sidebar for managing poem collections (currently commented out in App.tsx)

### AI Editor Architecture

The AI editor has two systems: per-poem coaching (chat) and collection-level editorial reports.

**Per-Poem Coaching** (`EditorChat` + `useEditorChat`):
- Rendered in the right sidebar of the main editor
- Uses Claude Sonnet 4.5 for streaming responses
- Manages conversations per poem or per collection
- Budget tracking via `usageTracking.ts`
- Memory system via `useEditorMemory` (learnings, settings, summaries)
- Multi-agent orchestrator in `editorAgents.ts` (dispatches to specialist sub-agents)

**Editorial Report System** (`EditorialReport` page + `useEditorialReport` hook):
- Full pipeline for collection-level editorial assessment
- Flow: PreFlightForm → Progress → Report Page
- Pre-flight questionnaire: ambition, section purposes, readiness, report style (qualitative/quantitative+rankings), harshness slider (0-100)
- Pipeline (all in `editorialAgents.ts`): spine analysis → 3 parallel editors → compare notes → debate → per-poem assessments → Sonnet synthesis
- 3 generalist editors (NOT specialists) — all know all the craft but have different sensibilities:
  - Editor A: precision and economy
  - Editor B: emotional truth and risk-taking
  - Editor C: architecture and reader experience
- Debate protocol: identify disagreements → 2-3 rounds → optional poet input → 2 more rounds → genuine disagreement
- Report page: split view (report left, chat sidebar right — sidebar is placeholder)
- Per-poem cards with colored status dots (green=done, amber=edit, grey=draft, red=rough)
- Poet input textareas on every section, debate topic, and poem assessment

**API Configuration:**
- Uses `anthropic-dangerous-direct-browser-access` header for browser-direct API calls
- Models: Haiku 4.5 for parallel analysis, Sonnet 4.5 for streaming synthesis
- API key: stored in localStorage (`editor:apiKey`) or env var (`VITE_ANTHROPIC_API_KEY`)
- SSE streaming for Sonnet calls

**Database (Supabase):**
- `editor_preflight_answers`: persists pre-flight answers per user+collection
- `editor_reports`: stores full report data as JSONB columns
- `editor_conversations`, `editor_sessions`, `editor_learnings`, `editor_settings`: coaching memory
- Migration: `supabase/migrations/20260310_editorial_reports.sql`
- Guest users fall back to localStorage with `editor:` prefix

**Collection Management:**
- Local collections via `useCollection` hook (localStorage-backed)
- Cloud collections via `useCollections` + `useSections` + `usePoems` hooks (Supabase-backed)
- Collection title and section names are editable (double-click to rename)
- `CollectionPanel` is currently commented out in App.tsx (not ready for release)
- `CollectionView` page handles cloud collections at `/my-collections/:id`

## Code Style

- TypeScript strict mode
- React functional components with hooks
- CSS in separate `.css` files (not CSS modules, just co-located CSS)
- No emojis unless requested

---

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately. Don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user, update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff your behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes. Don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests. Then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

### 7. Task Management
1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

---

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Guessiness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

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

**[Auth UI 2026-02-02]**: Replaced Supabase Auth UI with custom forms.

- Removed `@supabase/auth-ui-react` dependency
- Custom `AuthModal` component with three views: `sign_in`, `sign_up`, `forgot_password`
- Uses native Supabase methods: `signInWithPassword()`, `signUp()`, `resetPasswordForEmail()`
- Styling matches site design (CSS variables, serif headings, etc.)

**[Password Reset Flow 2026-02-02]**: Created dedicated `/reset-password` page.

- Route: `/reset-password` in `src/router.tsx`
- Component: `src/pages/ResetPassword.tsx`
- Handles Supabase recovery link callback (parses `#access_token=...&type=recovery` from URL hash)
- Uses `supabase.auth.updateUser({ password })` to set new password
- Shows informational message if accessed without token
- Redirects to home after successful reset

**[Multi-Agent Editor 2026-03-10]**: Shipped multi-agent AI editor with orchestrator, memory system, perspective controls, and guardrails.

- `editorAgents.ts`: orchestrator dispatches to specialist sub-agents (craft, thematic, structural)
- `useEditorMemory`: persistent memory across sessions (learnings, settings, conversation summaries)
- `EditorSettings`: per-poem perspective and harshness controls
- Usage tracking with tiered caps (guest $0.50, registered $5, admin unlimited)

**[Editorial Report System 2026-03-10]**: Complete overhaul of editorial reports.

Key design decisions made through 3 rounds of HTML mockup iteration with the user:

- **3 generalist editors, NOT specialists**: All editors know all the craft. Debates should be "two great editors with differing perspectives" not "structure says this, meaning says that." Each has a different sensibility (precision vs emotional truth vs architecture).
- **Black and white design**: Matches poetryeditor.com. Libre Baskerville serif for headings. No colors except status dots on poem cards.
- **All form fields visually identical**: White textareas, no grey backgrounds anywhere. User was very specific about visual consistency.
- **No quality matrix**: Was proposed and approved initially, but user killed it: "let's kill the chart. It's too cute."
- **No tonal arc/spine visualization**: User said "I don't like the tonal arc from warm to cool." Report starts with "What We See" instead.
- **Harshness slider**: Added at user's request. Scale from supportive (0) to harsh (100), default middle.
- **Report style option**: "Qualitative" vs "Quantitative + rankings" (not just "Quantitative").
- **Progress phases**: Must reflect actual pipeline — each editor reads independently → compare to ambitions → compare notes → debate → build assessments → write letter.
- **Poet input everywhere**: Every section editorial, debate topic, and poem assessment gets a textarea for the poet's own notes.
- **Chat sidebar**: Pinned to viewport height beside the report, not at the bottom.
- **Pre-flight answers persist**: Saved per collection so returning users don't re-fill.

Files created:
- `src/components/editor/PreFlightForm.tsx` + `.css`
- `src/utils/editorialAgents.ts` (~893 lines)
- `src/hooks/useEditorialReport.ts`
- `src/pages/EditorialReport.tsx` + `.css` (complete rewrite)
- `supabase/migrations/20260310_editorial_reports.sql`

**[Collection Editing 2026-03-10]**: Added inline editing for collection titles and section names.

- Double-click to rename (both CollectionPanel and CollectionView)
- `useCollection.renameCollection()` for local collections
- `useSections.renameSection()` for cloud collections
- Supabase `collections.update()` for cloud collection titles
- Visual feedback: pencil icon (✎) appears on hover next to editable titles
- Previous approach (dashed underline on hover) was too subtle — user couldn't tell anything was editable

**[Process Lesson 2026-03-10]**: Always show the plan before building.

- User explicitly said: "I think we agreed you would show me the plan and then you would build it"
- For any non-trivial feature: create an HTML mockup first, iterate on feedback, THEN build
- The editorial report went through 3 rounds of mockup iteration before any code was written
- This saved massive rework — many design decisions changed during mockup review

**[UX Discoverability 2026-03-10]**: Edit affordances must be visible, not just functional.

- Double-click-to-rename on collection titles and section headings was invisible to the user
- A CSS-only `border-bottom-style: dashed` on hover was too subtle — user said "it doesn't look like something I can change"
- Fixed by adding a pencil icon (✎) that fades in on hover via `.edit-hint` span
- Pattern: any interactive element that looks like static text needs an obvious hover state (icon, color change, or underline)
- The `title="Double-click to rename"` tooltip is a fallback, not a primary affordance

**[Pending: Supabase Migration]**: `supabase/migrations/20260310_editorial_reports.sql` still needs to be applied.

- Creates `editor_preflight_answers` and `editor_reports` tables
- Without this, authenticated users won't get editorial report persistence (falls back to localStorage)
- Run via Supabase CLI or dashboard

**[Pending: CollectionPanel]**: The local collection sidebar (`CollectionPanel`) is commented out in `App.tsx`.

- All the code is implemented and ready (including section rename, drag/drop, etc.)
- Commented out with note "not ready for release"
- When ready to ship: uncomment the block in App.tsx (~line 1585-1617)
- Props are already wired up including `onRenameCollection` and `onRenameSection`

**[Bug Fix: Editorial Report Race Condition 2026-03-10]**: "No poems in this collection" error when creating editorial report from cloud collection.

Root cause: `cloudCollectionFullPoems` is fetched asynchronously in a `useEffect` but user can click "Create Editorial Report" before the fetch completes. The empty array gets baked into React Router navigation state and can never be corrected.

Fix: Three-level guard system:
1. `isLoadingCloudCollection` flag — button click prevented while loading
2. `reportPoems.length === 0` check — PreFlightForm submit blocked if poems empty
3. `locationState.poems.length > 0` check — EditorialReport page won't start generation without poems

Pattern: Any action that depends on async-fetched state must guard against the state being stale/empty. Navigation state snapshots data at navigation time — if the source is still loading, the snapshot will be empty.

**[Editor UX 2026-08-20]**: Live walk of signed-in cloud poems after c4b02ed showed five poet-facing failures.

- Cloud load must key on `user.id` + poem id, never the `user` object. Never `setText(server)` over a dirty local draft.
- Autosave must not enter "Saving…" or write unless title/body actually changed.
- Ordinary click/tap places a caret. Word lookup is right-click, modifier+click, or long-press.
- Narrow viewports default the coach panel and poems sidebar closed so the writing surface is first paint.
- File → New: Cancel keeps the draft. Never blank a cloud poem in place (autosave would write empty content).
- `/my-collections` is an SPA route. Pages fallback is `/* /index.html 200` (c4b02ed baseline). Never rewrite to `/200.html` — pretty-URLs 308-loop to `/200`. Prerender writes `my-collections.html` as the SPA shell. `/collections` 302s here.

---

## Autonomy Framework

**Pre-authorized (just do it):**
- Git commits — if build passes and tests pass, commit
- Git push — if commit is clean, push to remote
- Bug fixes and code corrections — just fix them
- Running and acting on test results — fix what fails
- Content updates within established patterns (poem analysis files, UI copy)
- Prioritization between backlog items
- Routine refactoring that doesn't change behavior

**Still escalate:**
- Deleting features or components (reducing scope)
- Changing the editorial debate protocol or AI agent architecture
- Supabase schema changes or migrations
- Spending money (API calls beyond normal dev/test, services)
- New external dependencies
- Changes to the freemium pricing model or usage caps
- Show mockups before building UI-heavy features (this IS the escalation)

**The rule:** If the backlog says do it, the tests pass, and the pattern is established — execute and report results. Don't ask.

---

# Collaboration Preferences

- Default to pushing changes to Git unless I explicitly say otherwise.
- Do thorough planning and testing of changes (UX/UI and backend) before pushing.
- **Show mockups before building**: For UI-heavy features, create an HTML mockup and iterate on feedback before writing production code. The user wants to see and approve the design first.
- **Plan before code**: Enter plan mode for non-trivial tasks. Show the plan. Get approval. Then build.
- **Don't ask unnecessary questions**: Be autonomous on routine decisions. The user prefers momentum over permission-seeking.
- **The user (Anders) is the product owner**: He has strong opinions about UX, visual consistency, and editorial philosophy. Respect his design instincts — when he says "kill it", kill it immediately.
- **Deep root-cause analysis before fixing**: Don't patch symptoms. Trace the full data flow from trigger to error. Use subagents for thorough investigation. Verify fixes by re-tracing the same flow with the fix applied. The user expects "test, test, test" before committing.
