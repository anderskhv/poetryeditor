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

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately – don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes – don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests – then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

---

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

---

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
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
