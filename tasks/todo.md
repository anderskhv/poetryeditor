# Current Status — 2026-03-10

## Just Completed
- [x] Editorial Report System overhaul (full pipeline: preflight → 3 editors → debate → synthesis)
- [x] Collection title + section name inline editing (double-click to rename)
- [x] Edit affordance fix: pencil icon on hover for editable titles/sections
- [x] CLAUDE.md + lessons.md comprehensive update for Claude Code transition

## Pending (needs manual action)
- [ ] **Git push**: 3 local commits ahead of remote. Run `git push origin main` from terminal.
- [ ] **Supabase migration**: Run `supabase/migrations/20260310_editorial_reports.sql` to create `editor_preflight_answers` and `editor_reports` tables. Without this, authenticated users fall back to localStorage for report persistence.
- [ ] **Test editorial report pipeline end-to-end**: The full pipeline (preflight → editors → debate → synthesis) has been built but not tested with real API calls. Need to verify with a collection that has poems.

## Known Issues
- **Empty sections hidden**: `CollectionView.tsx` line 533 skips sections with 0 poems. Users can't see or rename empty sections.
- **CollectionPanel commented out**: Local collection sidebar in `App.tsx` (~line 1585) is fully implemented but commented out with "not ready for release". All props including rename are wired up.
- **editorial-report-mockup.html**: Design artifact in repo root, gitignored but still on disk. Can be deleted when no longer needed for reference.

## Next Up (from roadmap)
- LLM-Enhanced Analysis (Phase 2) — use Haiku to post-process client-side analysis for registered users
- Consider shipping CollectionPanel when ready
