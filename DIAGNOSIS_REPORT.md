# Sonnet 18 Rhyme Scheme Detection - Diagnosis Report

## Executive Summary

Shakespeare's Sonnet 18 is incorrectly detected as "Free Verse" instead of "Shakespearean Sonnet". The root cause is that the word pair **"temperate" (line 2) and "date" (line 4) do not rhyme** according to modern CMU dictionary phonetics, which breaks the ABAB pattern detection in the first quatrain.

## Problem Analysis

### Expected vs Actual Behavior

**Expected:**
- Form: Shakespearean Sonnet
- Rhyme scheme: ABAB CDCD EFEF GG
- Line 2 ("temperate") should rhyme with Line 4 ("date")

**Actual:**
- Form: Free Verse
- Rhyme scheme: ABACDEDEFGFGHH (predicted)
- Line 2 and Line 4 are assigned different labels (B vs C)

## Root Cause: Phonetic Mismatch

### CMU Dictionary Pronunciations

```
temperate: T EH1 M P R AH0 T
date:      D EY1 T
```

### Why They Don't Rhyme (According to the Algorithm)

1. **Different rhyming parts:**
   - "temperate" (stressed on first syllable TEM-per-ate):
     - Last stressed vowel: EH1 (at position 1)
     - Rhyming part: `[EH1, M, P, R, AH0, T]` - **6 phonemes**
   - "date" (single stressed syllable):
     - Last stressed vowel: EY1 (at position 1)
     - Rhyming part: `[EY1, T]` - **2 phonemes**

2. **Length mismatch:** 6 phonemes vs 2 phonemes
   - Perfect rhyme check requires equal lengths → FAILS

3. **Different final sounds:**
   - Last 2 phonemes of "temperate": `AH0 T` (unstressed "uh-t")
   - Last 2 phonemes of "date": `EY1 T` (stressed "ay-t")
   - Vowels don't match: AH ≠ EY → Slant rhyme check FAILS

4. **Result:** `assessRhymeQuality("temperate", "date")` returns `'none'`

## Impact on Detection Chain

### Step 1: Line-by-line Rhyme Scheme Detection

```
Line 1: "day" → Assigned 'A' (first word)
Line 2: "temperate" → Doesn't rhyme with "day" → Assigned 'B'
Line 3: "may" → Rhymes with "day" → Assigned 'A' ✓
Line 4: "date" → Doesn't rhyme with "day", "temperate", or "may" → Assigned 'C' ✗
```

**Predicted full pattern:** `A B A C D E D E F G F G H H`
- Should be: `A B A B C D C D E F E F G G`

### Step 2: Shakespearean Structure Check

The `detectSonnet()` function in `/Users/andershvelplund/poetry-editor/src/utils/formDetector.ts` (lines 212-218) checks for structural pattern:

```typescript
const isShakespeareanStructure =
  schemeStr.length === 14 &&
  schemeStr[0] === schemeStr[2] &&   // A === A ✓
  schemeStr[1] === schemeStr[3] &&   // B === C ✗ FAILS HERE
  schemeStr[4] === schemeStr[6] &&   // D === D ✓
  schemeStr[5] === schemeStr[7] &&   // E === E ✓
  schemeStr[8] === schemeStr[10] &&  // F === F ✓
  schemeStr[9] === schemeStr[11] &&  // G === G ✓
  schemeStr[12] === schemeStr[13];   // H === H ✓
```

**Result:** The check fails at `schemeStr[1] === schemeStr[3]` because B ≠ C.

### Step 3: Form Classification

Since the Shakespearean structure check fails, the function falls through to line 273-279:

```typescript
// It's 14 lines but doesn't match a known sonnet pattern - treat as Free Verse
return {
  form: 'Free Verse',
  fit: 'low',
  fitScore: 20,
  description: '14 lines detected but does not match any traditional sonnet form',
  issues: [`Rhyme scheme ${schemeStr} does not match Shakespearean...`]
};
```

## Historical Context

**Important:** In Shakespeare's era and in poetic tradition, "temperate" and "date" were considered an acceptable rhyme pair. This could be due to:

1. **Historical pronunciation differences:** English pronunciation has changed significantly since the 16th century
2. **Poetic license:** Slant rhymes and near-rhymes were (and still are) acceptable in formal poetry
3. **Stress patterns:** Poets often used feminine rhymes (multi-syllable rhymes) more flexibly

The CMU dictionary represents **modern American English pronunciation**, which doesn't account for these historical variations.

## Test Files Created

I've created the following test files to help diagnose and verify the issue:

1. **`/Users/andershvelplund/poetry-editor/test-sonnet-diagnosis.ts`**
   - Comprehensive TypeScript test script
   - Tests `assessRhymeQuality()`, `detectRhymeScheme()`, and `detectPoetricForm()`
   - Outputs detailed analysis of each rhyme pair
   - Shows why the structural check fails

2. **`/Users/andershvelplund/poetry-editor/trace-test.html`**
   - Interactive HTML diagnostic page
   - Can be opened in the browser via Vite dev server
   - Shows step-by-step breakdown with color coding
   - Displays phonetic data and rhyme quality for each pair

3. **`/Users/andershvelplund/poetry-editor/manual-diagnosis.md`**
   - Manual trace through the algorithm logic
   - Shows predicted output at each step
   - Explains the phonetic mismatches

## Recommended Solutions

### Option 1: Improve Slant Rhyme Detection (Quick Fix)

Modify the `assessRhymeQuality()` function to be more lenient with slant rhymes:

```typescript
// In rhymeScheme.ts, around line 83-91
// Add a check for final consonant matching even if vowels differ
const finalConsonant1 = rhyme1[rhyme1.length - 1].replace(/[012]$/, '');
const finalConsonant2 = rhyme2[rhyme2.length - 1].replace(/[012]$/, '');

// If final consonants match and both end with a similar pattern, accept as slant
if (finalConsonant1 === finalConsonant2 && finalConsonant1.match(/[TDZN]$/)) {
  // Both end with same stop consonant (T, D, Z, N, etc.)
  return 'slant';
}
```

**Pros:** Simple, targeted fix
**Cons:** May create false positives; doesn't address the structural issue

### Option 2: Prioritize Structural Pattern Matching (Recommended)

Modify `detectSonnet()` to use a more sophisticated matching algorithm:

```typescript
// Instead of requiring exact label matching, check if the pattern
// STRUCTURE is correct, allowing for some rhyme imperfections

function matchesShakespeareanStructure(pattern: string[], qualities: string[]): boolean {
  if (pattern.length !== 14) return false;

  // Check if rhyme positions match (allowing slant rhymes)
  const matches = (i: number, j: number) => {
    return pattern[i] === pattern[j] &&
           (qualities[j] === 'perfect' || qualities[j] === 'slant');
  };

  return (
    matches(0, 2) &&    // ABAB
    matches(1, 3) &&    // (allow slant rhyme here)
    matches(4, 6) &&    // CDCD
    matches(5, 7) &&
    matches(8, 10) &&   // EFEF
    matches(9, 11) &&
    matches(12, 13)     // GG
  );
}
```

**Pros:** More robust, accounts for historical/poetic variations
**Cons:** More complex logic

### Option 3: Add Historical/Poetic Rhyme Pairs Database

Create a whitelist of known poetic rhyme pairs that are historically accepted:

```typescript
const HISTORICAL_RHYMES = new Map([
  ['temperate', new Set(['date', 'fate', 'state'])],
  // ... more historical pairs
]);

function assessRhymeQuality(word1, word2) {
  // ... existing logic ...

  // Check historical rhyme pairs
  if (HISTORICAL_RHYMES.get(word1)?.has(word2) ||
      HISTORICAL_RHYMES.get(word2)?.has(word1)) {
    return 'slant';
  }

  return 'none';
}
```

**Pros:** Accurate for known classical poetry
**Cons:** Requires maintaining a database; not scalable

### Option 4: Use Fit Scores Instead of Binary Pass/Fail (Best Long-term)

Modify the form detection to use a **scoring system** rather than binary matching:

```typescript
function detectSonnet(syllableCounts, schemeStr) {
  let fitScore = 100;
  const issues = [];

  // Award points for structural match (even with imperfect rhymes)
  const structureScore = calculateStructuralMatch(schemeStr);
  fitScore = structureScore;

  // Deduct points for non-rhyming pairs
  // Award partial credit for slant rhymes

  if (structureScore >= 80) {
    return {
      form: 'Shakespearean Sonnet',
      fit: structureScore >= 90 ? 'high' : 'medium',
      fitScore: structureScore,
      // ...
    };
  }
}
```

**Pros:** Most flexible, allows for gradual assessment
**Cons:** Requires redesigning the scoring system

## Immediate Action Items

1. **Verify the diagnosis** by running the test files:
   ```bash
   # Start dev server
   npm run dev

   # Open browser to http://localhost:5173/trace-test.html
   ```

2. **Choose a fix strategy** based on your requirements:
   - Quick fix: Option 1 (improve slant rhyme detection)
   - Robust fix: Option 2 (structural pattern matching)
   - Long-term: Option 4 (fit scoring system)

3. **Test with other sonnets** to ensure the fix doesn't break other patterns

## Files to Modify

1. **`/Users/andershvelplund/poetry-editor/src/utils/rhymeScheme.ts`**
   - Function: `assessRhymeQuality()` (lines 62-102)
   - Add more lenient slant rhyme detection

2. **`/Users/andershvelplund/poetry-editor/src/utils/formDetector.ts`**
   - Function: `detectSonnet()` (lines 194-280)
   - Improve structural pattern matching logic
   - Use rhyme quality information when checking structure

## Conclusion

The algorithm is working **correctly according to modern phonetics**, but it fails to account for:
- Historical pronunciation changes
- Poetic license in classical works
- The importance of structural patterns over perfect phonetic matching

The fix should prioritize **structural pattern recognition** while being tolerant of slant rhymes in well-established poetic forms like sonnets.
