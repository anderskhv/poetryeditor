# Current Status — 2026-03-10

## Just Completed
- [x] Editorial Report System overhaul (full pipeline: preflight → 3 editors → debate → synthesis)
- [x] Collection title + section name inline editing (double-click to rename)
- [x] Edit affordance fix: pencil icon on hover for editable titles/sections
- [x] CLAUDE.md + lessons.md comprehensive update for Claude Code transition

## Pending (needs manual action)
- [x] **Git push**: pushed to remote.
- [x] **Supabase migration**: `editor_preflight_answers` and `editor_reports` tables confirmed live.
- [ ] **Test editorial report pipeline end-to-end**: The full pipeline (preflight → editors → debate → synthesis) has been built but not tested with real API calls. Need to verify with a collection that has poems.

## Known Issues
- **Empty sections hidden**: `CollectionView.tsx` line 533 skips sections with 0 poems. Users can't see or rename empty sections.
- **CollectionPanel commented out**: Local collection sidebar in `App.tsx` (~line 1585) is fully implemented but commented out with "not ready for release". All props including rename are wired up.
- **editorial-report-mockup.html**: Design artifact in repo root, gitignored but still on disk. Can be deleted when no longer needed for reference.

## Security Audit Findings (2026-03-20) — PRIORITY

**Critical:**
- [ ] **Rotate Anthropic API key** — `VITE_` prefix bakes it into client JS bundle. Every visitor can extract it. Rename to `ANTHROPIC_API_KEY` and proxy server-side.
- [ ] **Rotate Supabase service role key** — sitting in `.env` alongside client vars. Bypasses ALL RLS.

**High:**
- [x] **Sanitize dangerouslySetInnerHTML** — extracted `escapeHtml` to shared utility, applied to EditorMessage, EditorialReport, ReportChat. Deduplicated copies in SharedCollection and App.
- [ ] **Server-side usage caps** — current $0.50/$5 caps are client-side localStorage only, trivially bypassable. Move to Supabase.
- [ ] **Encrypt stored API keys** — user-provided API keys in plain text localStorage, exfiltrable via XSS.

**Medium:**
- [ ] Add Content Security Policy headers
- [ ] Remove `anthropic-dangerous-direct-browser-access` — build server-side proxy
- [ ] Increase minimum password length (currently 6 chars)

Full report: `SECURITY-AUDIT.md`

---

## Next Up (from roadmap)
- LLM-Enhanced Analysis (Phase 2) — use Haiku to post-process client-side analysis for registered users
- Consider shipping CollectionPanel when ready
