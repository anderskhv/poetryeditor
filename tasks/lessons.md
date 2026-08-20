# Lessons Learned

## 2026-02-01: useEffect with async operations and unstable dependencies

**Bug**: Poems were inserted 3x into database during upload.

**Root Cause**: `useEffect` in `CollectionView.tsx` had `createManyPoems` in its dependency array. This function reference changed when poems state updated, causing the effect to re-run before `processingUpload` state update propagated (React state updates are async).

**Pattern to Avoid**:
```javascript
// BAD: State-based guard with unstable function dependencies
const [processing, setProcessing] = useState(false);
useEffect(() => {
  if (processing) return; // Race condition - state update is async
  setProcessing(true);
  doAsyncWork();
}, [unstableFunctionReference]); // Function changes, effect re-runs before state updates
```

**Fix**:
```javascript
// GOOD: Ref-based guard (synchronous) + clear trigger state immediately
const processingRef = useRef(false);
useEffect(() => {
  if (processingRef.current) return; // Sync check - no race condition
  processingRef.current = true;

  // Clear the trigger state BEFORE async work
  navigate(path, { replace: true, state: {} });

  doAsyncWork().finally(() => {
    processingRef.current = false;
  });
}, [dependencies]);
```

**Rule**: When guarding against duplicate effect executions with async operations, use a ref (synchronous) instead of state (asynchronous). Clear trigger conditions (like navigation state) immediately, not after the async work completes.

## 2026-03-10: Always show the plan before building

**Mistake**: Jumped straight into writing code for the editorial report overhaul without showing the user the plan first. Built PreFlightForm, editorialAgents, and started wiring up App.tsx before the user had approved anything.

**User feedback**: "I think we thought we agreed that you would show me the plan and then you would build it."

**Fix**: For non-trivial features (3+ steps or architectural decisions):
1. Enter plan mode
2. For UI features: create an HTML mockup showing the design
3. Present the plan/mockup to the user
4. Iterate on feedback (expect 2-3 rounds for UI)
5. Only after approval: start building

**Rule**: Never build production code for a major feature without plan approval. For UI features, mockups are mandatory. Budget 2-3 mockup iterations before coding.

## 2026-03-10: Generalist editors, not specialists

**Context**: Original editorial report design had 3 specialist editors (craft, thematic, structural). User rejected this.

**User feedback**: "Not sure we should have specialized coaches, actually think they should all know all the craft, so the debates are not 'structure says this' 'meaning says that' — but more two great editors with differing perspectives."

**Rule**: The 3 AI editors must be generalists with different sensibilities/perspectives, NOT domain specialists. Each knows the full craft. Their differences are in temperament (precision vs emotional truth vs architecture), not knowledge.

## 2026-03-10: Visual consistency matters — no mixed styling

**Context**: PreFlightForm had grey backgrounds on some textareas and white on others.

**User feedback**: Called this out specifically across 2 review rounds. "Inconsistent text field styling between sections."

**Rule**: All form fields of the same type must have identical visual treatment. No mixing grey/white backgrounds. When in doubt, make everything white with consistent borders.

## 2026-03-10: Kill features decisively when told to

**Context**: Quality matrix (radar chart showing poem scores) was proposed, iterated on, and then killed.

**User feedback**: "Let's kill the chart. It's too cute."

**Rule**: When the user says to remove something, remove it completely — don't try to save a modified version. "Too cute" means the feature is over-designed for the context.

## 2026-03-10: React hooks must be called before early returns

**Bug**: `useMemo` for `reportHtml` was placed after early returns in `EditorialReport.tsx`, violating React's rules of hooks.

**Fix**: Move all hooks (useState, useMemo, useCallback, useEffect) above any conditional `return` statements. Compute derived values unconditionally, even if they won't be used in every render path.

**Rule**: Always declare all hooks at the top of the component, before any early returns or conditional rendering logic.

## 2026-03-10: Section ordering requires explicit sort

**Context**: `buildCollectionAnalysisPrompt` uses a Map that iterates in insertion order without guaranteeing section `sort_order`.

**Fix**: Pre-sort poems by `sectionOrder → poemOrder` before passing to any analysis function. The `toEditorialPoems()` helper in `useEditorialReport.ts` does this correctly.

**Rule**: Never assume Map/object iteration order matches display order. Always explicitly sort by `sort_order`/`order` fields when building manuscript-order data.

## 2026-03-10: Interactive elements must look interactive

**Bug**: User couldn't rename collection titles or section headings despite double-click-to-rename being fully implemented. They said "it doesn't look like something I can change."

**Root Cause**: The only visual affordance was changing `border-bottom-style` from `solid` to `dashed` on hover — a nearly invisible change on a light grey border. The `title="Double-click to rename"` tooltip only appears after hovering for ~1 second, which users don't do on text they think is static.

**Fix**: Added a pencil icon (✎) via `<span className="edit-hint">` that fades in on hover with `color: transparent → #999` transition.

**Rule**: Any element that accepts interaction but looks like static text MUST have an obvious hover affordance. A subtle border change is not enough. Use visible icons, color changes, or underlines that are clearly distinct from the default state. Test by asking: "Would a new user discover this without being told?"

## 2026-03-10: Empty sections are hidden and unreachable

**Issue**: In `CollectionView.tsx`, sections with zero poems are skipped entirely (`if (sectionPoems.length === 0) return null`). This means users can't see, rename, or interact with empty sections.

**Status**: Known limitation, not yet fixed. If section management becomes important, empty sections need to render with at least a heading and an "add poem" affordance.

## 2026-03-10: Sandbox environment blocks npm and git push

**Context**: Cowork mode (Claude desktop app) runs in a sandboxed Linux VM that blocks outbound HTTP to npm registry and GitHub. This means `npm install`, `npx tsc`, `npm run build`, and `git push` all fail with HTTP 403.

**Workaround**: Do manual type verification via code review. Commit locally and tell the user to `git push origin main` from their own terminal. The Cloudflare Pages build will catch any real build errors on push.

## 2026-03-10: Cloud vs local collection data — always check which is active

**Bug**: "Create Editorial Report" showed "No poems in this collection" even though the user had many poems. The editorial report hook was using `collection.poems` from the local `useCollection()` hook, which is empty when the user is editing a cloud collection.

**Root Cause**: App.tsx has two collection systems: local (localStorage via `useCollection`) and cloud (Supabase via `useCollections/useSections/usePoems`). The editorial report was hardcoded to use local data. When editing a cloud poem (`cloudPoemCollectionId` is set), the local collection is empty.

**Fix**: Check `cloudPoemCollectionId` to determine which system is active. Store full `CollectionPoem[]` and `CollectionSection[]` from the cloud fetch (not just the simplified `{ title, content, sectionName }` array). Pass the correct data to `useEditorialReport` and `PreFlightForm`.

**Rule**: Any feature that operates on "the current collection" must check whether the user is in cloud mode or local mode. Use `cloudPoemCollectionId` as the discriminator. Never assume `collection` from `useCollection()` has the active data.

## 2026-03-10: Navigation state snapshots async data — guard against stale state

**Bug**: Even after fixing cloud vs local detection, "Create Editorial Report" still showed "No poems in this collection." The cloud data was being passed correctly in code, but the `useEffect` that fetches cloud poems hadn't completed when the user clicked the button.

**Root Cause**: React Router's `navigate(path, { state })` snapshots state at call time. If `cloudCollectionFullPoems` is still `[]` because the fetch is in-flight, navigation state permanently contains `poems: []`. The EditorialReport page mounts with empty poems and can never recover.

**Fix**: Three-level guard:
1. Track `isLoadingCloudCollection` flag — disable button while loading
2. Check `reportPoems.length === 0` before navigating — abort if data missing
3. Validate `locationState.poems.length > 0` on the receiving page — don't start generation without poems

**Rule**: Never pass async-fetched state to `navigate()` without verifying it has loaded. Navigation state is a snapshot — there's no way to update it after navigation. Always add a loading flag for async fetches and check it before any action that depends on the data.

## 2026-03-10: Test, test, test — verify fixes by re-tracing the full flow

**Mistake**: First fix for the editorial report bug (using cloud data instead of local) was deployed without verifying it actually worked. The fix was conceptually correct but missed the timing issue because it wasn't tested against the actual user flow.

**Rule**: After fixing a bug, trace the entire flow from trigger to result with the fix applied. Don't just verify the changed lines — verify the data at every handoff point. Use subagents for thorough verification when the flow spans multiple files. Especially critical for async data flows where timing matters.

## 2026-03-10: Verify Supabase column names against the actual schema

**Bug**: Added a Supabase query selecting `status` from the `poems` table, but the table doesn't have a `status` column. The query failed silently (error caught and logged), leaving `cloudCollectionFullPoems` as `[]`. All downstream guards saw empty data and blocked the action — making the "Create Editorial Report" button appear to do nothing.

**Root Cause**: Assumed the database schema matched the TypeScript type (`CollectionPoem` has a `status` field, but that's a local-only concept from `useCollection` — not a Supabase column). Never checked the actual `Poem` interface in `types/database.ts`.

**Fix**: Removed `status` from the SELECT. Default to `'draft'` in the mapped data.

**Rule**: Before adding columns to a Supabase `.select()`, check `types/database.ts` for the actual table interface. The `Poem` type (database) and `CollectionPoem` type (local) have different fields. Local-only fields like `status` don't exist in the database. Silent failures in Supabase queries (inside try/catch) are especially dangerous — they leave state empty with no user-visible error.

## 2026-08-20: Persist the live editor model, not a React snapshot

**Bug**: After the single-flight queue (570f875), a live walk still lost the last 4 letters of a line (`counsel` → `cou`) and blanked the title. The on-screen badge showed the full line and "Saved"; hard reload restored the prefix.

**Root Cause**: `setDraft` / `persist` wrote React `text` / `poemTitle` (or `activePoem*Ref`) captured by the debounce. Monaco already had more characters. "Saved" flipped when that stale write returned, not when the cloud row matched the buffer the poet sees.

**Rule**: Cloud save must read `editor.getValue()` and the title input at write time. After the last keystroke, flush that model. Do not show Saved until the committed snapshot matches the live model. Never persist title `""` over a known title. Do not "fix" this by only delaying the badge.
