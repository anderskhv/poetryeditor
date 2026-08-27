# Collection rename on the list and inside the book (2026-08-22)

## Plan
1. [x] Confirm live rename was hover/double-click only on the book H1, and missing on the shelf
2. [x] Add a labeled Rename control next to the collection H1; keep double-click as a shortcut
3. [x] Add labeled Rename on each My Collections card via `updateCollection`
4. [x] Shared Enter/blur save and Escape cancel; empty or unchanged names cancel
5. [x] Source tests plus `nextCollectionName` unit tests
6. [x] lint / tsc / existing tests
7. [x] PR, do not merge (https://github.com/anderskhv/poetryeditor/pull/12)

## Review
- Collection page: H1 stays the real title. Rename is a labeled button. Persist still uses `handleRenameCollection` / supabase `collections.update`.
- Shelf: each card has labeled Rename. Save updates the card through `useCollections.updateCollection`.
- Touch: 44px labeled controls. No hover-only pencil on the collection title.

---

# Homepage voice: writing tool, not AI feedback (2026-08-20)

## Plan
1. [x] Replace homepage/editor chrome title, subtitle, and SEO description
2. [x] Align tool-page layout subtitle; leave poem/learn/tool H1s, coach, save, `_redirects` alone
3. [x] Update prerender homepage strings generated from the same copy
4. [x] lint / tsc / existing tests
5. [x] PR, do not merge

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

## Follow-up 2026-08-21 (collection URL hard refresh)
- [x] Re-trace live `/my-collections/:id` 404 after #9 (946d66c)
- [x] Confirm catch-all is dead: `/widget` and unknown paths also serve 404.html
- [x] `public/_routes.json` include `/api/*` only so Functions do not skip `_redirects`
- [x] Do not emit `my-collections.html` or `my-collections/index.html`
- [x] Rewrite `/my-collections` and `/my-collections/*` to `/index.html`; keep `/* /index.html 200`; no `200.html`
- [x] `/collections/:id` still keeps the id
- Do not merge until Anders re-walks the bookmarked collection URL
- [x] Rebase onto 440e929 after #6/#7
- [ ] Preview of `_routes.json`-only fix still 404ed `:id` — ship Functions middleware
