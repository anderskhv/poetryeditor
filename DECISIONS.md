| Date | Decision | Category | Escalated? | Reasoning |
| 2026-08-21 | Keep `/collections/:id` on the same book via `/my-collections/:id`; never drop the id | deploy | No | Live walk landed on the shelf; Cloudflare splat and the SPA redirect both discarded `:id` |
| 2026-08-21 | Collection drag uses handle-only draggables, section droppables, and a ghost overlay | architecture | No | Sortable-per-section plus a 6px pointer sensor never moved cards; empty-section copy was a lie |
| 2026-08-21 | Version snapshots write only after the open poem is loaded, and the list filters by `poem_id` | architecture | No | Switching poems could snapshot the previous buffer onto the next id; cards then showed another poem's body |
| 2026-08-21 | Child writes bump `collections.updated_at`; shelf cards show relative time and poem count | design | No | Same-day work was invisible because only a calendar date was shown and `updated_at` stayed stale |
| 2026-08-21 | Collection delete is always visible on coarse/touch; poem delete is a labeled control | design | No | Hover-only `×` was unreachable at 390px; the 28px poem `×` sat next to Versions |
| 2026-08-20 | Cloud poem load keys on user id + poem id; never apply server text over a dirty local draft | architecture | No | Live typing vanished after Saving…; load effect depended on `user` object identity and always `setText(server)` |
| 2026-08-20 | Word lookup is right-click / modifier / long-press; left-click places caret | design | No | Specified in the live walk; poets could not click into a line |
| 2026-08-20 | Phone first paint is the writing surface; coach and poems nav start closed ≤900px | design | No | Full-screen side panel was the first thing at ~390px |
| 2026-08-20 | File → New Cancel keeps the draft; never blank a cloud poem in place | design | No | Guest New wiped without a keep-draft Cancel; emptying a cloud buffer would autosave "" |
| 2026-08-20 | `/my-collections` served from SPA `200.html`; `/collections` redirects | deploy | No | Hard refresh served public/404.html; in-app fetch could hang with no timeout |
| 2026-08-20 | Revert `_redirects` to `/* /index.html 200`. Never rewrite to `/200.html` | deploy | No | Production outage: Pages pretty-URLs turned `/200.html` into `/200` and 308-looped every URL |
| 2026-08-20 | Cloud autosave is single-flight and always persists the latest draft | architecture | No | Saved badge after Enter + a new line still left only `the` on the server; a stale in-flight update won |
| 2026-08-20 | Persist Monaco `getValue()` + title input; Saved only when cloud matches the model; never write title `""` | architecture | No | After 570f875, Saved showed the full line while reload restored a 4-letter prefix and blanked the title |
