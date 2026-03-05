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
