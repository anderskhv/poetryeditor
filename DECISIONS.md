| Date | Decision | Category | Escalated? | Reasoning |
| 2026-08-20 | Cloud poem load keys on user id + poem id; never apply server text over a dirty local draft | architecture | No | Live typing vanished after Saving…; load effect depended on `user` object identity and always `setText(server)` |
| 2026-08-20 | Word lookup is right-click / modifier / long-press; left-click places caret | design | No | Specified in the live walk; poets could not click into a line |
| 2026-08-20 | Phone first paint is the writing surface; coach and poems nav start closed ≤900px | design | No | Full-screen side panel was the first thing at ~390px |
| 2026-08-20 | File → New Cancel keeps the draft; never blank a cloud poem in place | design | No | Guest New wiped without a keep-draft Cancel; emptying a cloud buffer would autosave "" |
| 2026-08-20 | `/my-collections` served from SPA `200.html`; `/collections` redirects | deploy | No | Hard refresh served public/404.html; in-app fetch could hang with no timeout |
