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
npm run dev      # Start dev server
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

*No decisions logged yet.*
