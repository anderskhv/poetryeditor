# Homepage voice: writing tool, not AI feedback (2026-08-20)

## Plan
1. [x] Replace homepage/editor chrome title, subtitle, and SEO description
2. [x] Align tool-page layout subtitle; leave poem/learn/tool H1s, coach, save, `_redirects` alone
3. [x] Update prerender homepage strings generated from the same copy
4. [ ] lint / tsc / existing tests
5. [ ] PR, do not merge

## Copy
- Title: `Poetry Editor`
- Subtitle: `A writing tool for poets`
- Description: `Poetry Editor is a writing tool for poets. It shows the rhythm, meter, and diction of the draft you are writing, and you can ask for a reading when you want one.`

---

# Fix live editor UX failures (2026-08-20)

## Plan
1. [x] Trace typing revert: cloud load effect depends on `user` object identity and `setText(server)` clobbers dirty drafts
2. [x] Trace click-to-type: PoetryEditor `onMouseDown` opens WordPopup on every word
3. [x] Trace mobile first screen: `isPanelOpen` defaults true; at ≤900px the side panel is `position: fixed` full viewport
4. [x] Trace File → New: Cancel falls through to discard; cloud path can save empty text
5. [x] Trace /my-collections: 404.html served on refresh; `_redirects` points unknown routes at prerendered `index.html` not `200.html`; fetch can hang with no timeout/error
6. [x] Implement guards + wire into App / PoetryEditor / collections / redirects
7. [x] Add unit tests (no Anthropic, no live network)
8. [x] lint / tsc / test / build
9. [x] PR, do not merge

## Review
- Typing revert: cloud load keyed on `user` object and always `setText(server)`. Now keys on `user.id`, refuses dirty overwrite, autosave only when title/body changed.
- Click-to-type: ordinary click/tap places caret; lookup is right-click, modifier+click, or 500ms long-press.
- Mobile first paint: coach panel and poems nav default closed at ≤900px.
- File → New: Cancel keeps the draft. Cloud poems are never blanked in place.
- `/my-collections`: `_redirects` is `/* /index.html 200` (c4b02ed baseline) plus `/collections` 302. Never rewrite to `/200.html`. Prerender writes `my-collections.html` as the SPA shell.

## Follow-up 2026-08-20 (live model persist)
- [x] Persist Monaco `getValue()` + title input, not React `text` / `poemTitle`
- [x] Saved only when the flush response matches the live model
- [x] Never write title `""` over a known title
- [x] Burst + 3s idle + reload keeps the full line; already-set title is kept
- Do not merge until Anders re-walks live
