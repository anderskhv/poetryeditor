# Fix live editor UX failures (2026-08-20)

## Plan
1. [x] Trace typing revert: cloud load effect depends on `user` object identity and `setText(server)` clobbers dirty drafts
2. [x] Trace click-to-type: PoetryEditor `onMouseDown` opens WordPopup on every word
3. [x] Trace mobile first screen: `isPanelOpen` defaults true; at ≤900px the side panel is `position: fixed` full viewport
4. [x] Trace File → New: Cancel falls through to discard; cloud path can save empty text
5. [x] Trace /my-collections: 404.html served on refresh; `_redirects` points unknown routes at prerendered `index.html` not `200.html`; fetch can hang with no timeout/error
6. [x] Implement guards + wire into App / PoetryEditor / collections / redirects
7. [x] Add unit tests (no Anthropic, no live network)
8. [x] lint / tsc / test (build next)
9. [ ] PR, do not merge

## Review
- Typing revert: cloud load keyed on `user` object and always `setText(server)`. Now keys on `user.id`, refuses dirty overwrite, autosave only when title/body changed.
- Click-to-type: ordinary click/tap places caret; lookup is right-click, modifier+click, or 500ms long-press.
- Mobile first paint: coach panel and poems nav default closed at ≤900px.
- File → New: Cancel keeps the draft. Cloud poems are never blanked in place.
- `/my-collections`: `_redirects` + prerender SPA shells serve `200.html`; `/collections` redirects; fetch has timeout + error + retry.
