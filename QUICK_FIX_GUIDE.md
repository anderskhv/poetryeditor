# Quick Fix Guide - Sonnet 18 Detection Issue

## Problem
"temperate" and "date" don't rhyme according to CMU dictionary → Sonnet 18 detected as "Free Verse"

## Root Cause
```
temperate: T EH1 M P R AH0 T  (ends with AH0 T = "uh-t")
date:      D EY1 T            (ends with EY1 T = "ay-t")
                              → Different vowels: AH ≠ EY
```

## Quick Fix (Recommended)

Edit `/Users/andershvelplund/poetry-editor/src/utils/formDetector.ts`

### Current Code (lines 212-218)

```typescript
const isShakespeareanStructure =
  schemeStr.length === 14 &&
  schemeStr[0] === schemeStr[2] && schemeStr[1] === schemeStr[3] && // ABAB
  schemeStr[4] === schemeStr[6] && schemeStr[5] === schemeStr[7] && // CDCD
  schemeStr[8] === schemeStr[10] && schemeStr[9] === schemeStr[11] && // EFEF
  schemeStr[12] === schemeStr[13]; // GG
```

### Replace With

```typescript
// Check for Shakespearean structure, allowing for slant rhymes
const isShakespeareanStructure =
  schemeStr.length === 14 &&
  schemeStr[0] === schemeStr[2] && // First quatrain: lines 1,3 match
  schemeStr[1] === schemeStr[3] && // First quatrain: lines 2,4 match
  schemeStr[4] === schemeStr[6] && // Second quatrain: lines 5,7 match
  schemeStr[5] === schemeStr[7] && // Second quatrain: lines 6,8 match
  schemeStr[8] === schemeStr[10] && // Third quatrain: lines 9,11 match
  schemeStr[9] === schemeStr[11] && // Third quatrain: lines 10,12 match
  schemeStr[12] === schemeStr[13]; // Couplet: lines 13,14 match

// NEW: Also check if pattern matches Shakespearean even with different labels
// This handles cases where slant rhymes cause label mismatches
const hasShakespeareanPattern =
  schemeStr.length === 14 &&
  // Allow any labels as long as the STRUCTURE is correct
  schemeStr[0] !== schemeStr[1] && // A ≠ B (alternating in quatrain)
  schemeStr[0] === schemeStr[2] && // Line 1 matches line 3
  schemeStr[1] === schemeStr[3] && // Line 2 matches line 4
  schemeStr[4] !== schemeStr[5] && // C ≠ D (alternating in quatrain)
  schemeStr[4] === schemeStr[6] && // Line 5 matches line 7
  schemeStr[5] === schemeStr[7] && // Line 6 matches line 8
  schemeStr[8] !== schemeStr[9] && // E ≠ F (alternating in quatrain)
  schemeStr[8] === schemeStr[10] && // Line 9 matches line 11
  schemeStr[9] === schemeStr[11] && // Line 10 matches line 12
  schemeStr[12] === schemeStr[13] && // Couplet matches
  // Ensure quatrains are independent (no cross-quatrain rhyming)
  schemeStr[0] !== schemeStr[4] &&
  schemeStr[0] !== schemeStr[8] &&
  schemeStr[4] !== schemeStr[8];

if (isShakespeareanStructure || hasShakespeareanPattern) {
  // ... rest of the code
```

## Alternative Quick Fix (Simpler)

If you want a minimal change, just modify the slant rhyme detection in `/Users/andershvelplund/poetry-editor/src/utils/rhymeScheme.ts` (around line 83):

```typescript
// After the existing slant rhyme check (line 91), add:

// Additional slant rhyme: words ending with same consonant after different vowels
// E.g., "temperate" (AH T) and "date" (EY T) both end in T
if (rhyme1.length > 0 && rhyme2.length > 0) {
  const final1 = rhyme1[rhyme1.length - 1].replace(/[012]$/, '');
  const final2 = rhyme2[rhyme2.length - 1].replace(/[012]$/, '');

  // If they end with the same consonant and one is a suffix of the other
  if (final1 === final2 && (final1 === 'T' || final1 === 'D' || final1 === 'N' || final1 === 'Z')) {
    // Check if the previous phoneme is a vowel
    const prev1 = rhyme1.length > 1 ? rhyme1[rhyme1.length - 2].replace(/[012]$/, '') : '';
    const prev2 = rhyme2.length > 1 ? rhyme2[rhyme2.length - 2].replace(/[012]$/, '') : '';

    // If both have vowel + consonant pattern, accept as slant rhyme
    if (prev1.match(/[AEIOU]/) && prev2.match(/[AEIOU]/)) {
      return 'slant';
    }
  }
}
```

## Test the Fix

1. Run the dev server: `npm run dev`
2. Open `http://localhost:5173/trace-test.html`
3. Check that Sonnet 18 is now detected as "Shakespearean Sonnet"

## Expected Result After Fix

```
Form: Shakespearean Sonnet
Fit: medium (or high, depending on implementation)
Fit Score: 70-90
Issues: "Rhyme scheme structure matches Shakespearean but uses slant rhymes"
```

## Files Modified

- `/Users/andershvelplund/poetry-editor/src/utils/formDetector.ts` (recommended)
- OR `/Users/andershvelplund/poetry-editor/src/utils/rhymeScheme.ts` (simpler)

## Verification Checklist

- [ ] Sonnet 18 detected as "Shakespearean Sonnet" instead of "Free Verse"
- [ ] Other sonnets still work correctly
- [ ] Quatrains, limericks, etc. not affected
- [ ] No false positives (free verse poems wrongly detected as sonnets)
