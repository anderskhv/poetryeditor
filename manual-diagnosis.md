# Manual Diagnosis of Sonnet 18 Rhyme Scheme Detection

## Phonetic Data from CMU Dictionary

Based on CMU dictionary lookups:

```
day:       D EY1
may:       M EY1
temperate: T EH1 M P R AH0 T
date:      D EY1 T
shines:    SH AY1 N Z
declines:  D IH0 K L AY1 N Z
dimmed:    D IH1 M D
untrimmed: [NOT IN DICT - fallback to "trimmed"] T R IH1 M D
fade:      F EY1 D
shade:     SH EY1 D
ow'st:     [NOT IN DICT - needs analysis]
grow'st:   [NOT IN DICT - needs analysis]
see:       S IY1
thee:      DH IY1
```

## Expected Rhyme Scheme: ABABCDCDEFEFGG

Line 1: "day" (D EY1) - A
Line 2: "temperate" (T EH1 M P R AH0 T) - B
Line 3: "may" (M EY1) - A (rhymes with "day")
Line 4: "date" (D EY1 T) - B (should rhyme with "temperate")
...

## Analysis of "temperate" vs "date" Rhyme

### Step 1: Get Rhyming Parts

**temperate:** T EH1 M P R AH0 T
- Last stressed vowel: EH1 (at index 1)
- Rhyming part: [EH1, M, P, R, AH0, T] - **6 phonemes**

**date:** D EY1 T
- Last stressed vowel: EY1 (at index 1)
- Rhyming part: [EY1, T] - **2 phonemes**

### Step 2: Check Perfect Rhyme

```typescript
if (rhyme1.length === rhyme2.length) {
  // 6 !== 2, so this check FAILS
}
```

Perfect rhyme check **FAILS** because lengths don't match (6 vs 2).

### Step 3: Check Slant Rhyme (last 2 phonemes)

```typescript
// Get last 2 phonemes and remove stress markers
const end1 = rhyme1.slice(-2).map(p => p.replace(/[012]$/, '')).join(' ');
const end2 = rhyme2.slice(-2).map(p => p.replace(/[012]$/, '')).join(' ');

// temperate: slice(-2) of [EH1, M, P, R, AH0, T] = [AH0, T] → "AH T"
// date: slice(-2) of [EY1, T] = [EY1, T] → "EY T"

if (end1 && end2 && end1 === end2 && rhyme1.length >= 2 && rhyme2.length >= 2) {
  return 'slant';
}

// "AH T" !== "EY T", so this check FAILS
```

Slant rhyme check **FAILS** because last 2 phonemes don't match.

### Step 4: Check Single Phoneme Match

```typescript
if (rhyme1.length === rhyme2.length && rhyme1.length === 1) {
  // 6 !== 2, so this check FAILS
}
```

Single phoneme check **FAILS** because lengths don't match.

### Conclusion

**Result: 'none'**

The algorithm returns 'none' for the "temperate" vs "date" pair, even though they historically rhyme as a slant rhyme. The issue is:

1. "temperate" has stress on the FIRST syllable (TEM-per-ate): EH1
2. The rhyming part from EH1 onwards is: [EH1, M, P, R, AH0, T]
3. "date" has stress on its only syllable: [EY1, T]
4. The last syllables don't phonetically match: "-erate" (AH0 T) vs "-ate" (EY1 T)

## Why This Is Happening

The issue is that **"temperate" and "date" are NOT a perfect phonetic rhyme** according to the CMU dictionary:
- "temperate" ends with the unstressed syllable "-rate" (R AH0 T)
- "date" is stressed "-date" (EY1 T)

The vowel sounds are different:
- AH0 (unstressed "uh" sound)
- EY1 (stressed "ay" sound)

This is why the algorithm correctly identifies this as NOT a rhyme.

## Impact on Rhyme Scheme Detection

Let me trace through what `detectRhymeScheme` would produce:

### Line-by-line Processing:

```
Line 1: "day" (D EY1)
  - First word, assign 'A'
  - Pattern: [A]

Line 2: "temperate" (T EH1 M P R AH0 T)
  - Check against "day": assessRhymeQuality("temperate", "day")
    - day rhyme part: [EY1] (1 phoneme)
    - temperate rhyme part: [EH1, M, P, R, AH0, T] (6 phonemes)
    - Lengths don't match, check slant: [AH0, T] vs [EY1] - can't get 2 from [EY1]
    - Result: 'none'
  - No match, assign 'B'
  - Pattern: [A, B]

Line 3: "may" (M EY1)
  - Check against "day": assessRhymeQuality("may", "day")
    - may rhyme part: [EY1]
    - day rhyme part: [EY1]
    - Perfect match! Result: 'perfect'
  - Matches line 1, assign 'A'
  - Pattern: [A, B, A]

Line 4: "date" (D EY1 T)
  - Check against "day": assessRhymeQuality("date", "day")
    - date rhyme part: [EY1, T]
    - day rhyme part: [EY1]
    - Lengths don't match (2 vs 1)
    - Check slant: date's last 2 = [EY1, T] → "EY T", day's last 2 = can't get 2
    - Result: 'none'
  - Check against "temperate": assessRhymeQuality("date", "temperate")
    - date rhyme part: [EY1, T]
    - temperate rhyme part: [EH1, M, P, R, AH0, T]
    - Lengths don't match
    - Check slant: "EY T" vs "AH T"
    - Result: 'none'
  - Check against "may": assessRhymeQuality("date", "may")
    - date rhyme part: [EY1, T]
    - may rhyme part: [EY1]
    - Lengths don't match (2 vs 1)
    - Result: 'none'
  - No match, assign 'C'
  - Pattern: [A, B, A, C]
```

## Expected Full Pattern Prediction

Continuing this logic:
- Line 5 "shines": D
- Line 6 "dimmed": E
- Line 7 "declines": D (rhymes with "shines")
- Line 8 "untrimmed": E (should rhyme with "dimmed" if detected correctly)
- Line 9 "fade": F
- Line 10 "ow'st": G (likely won't find rhyme)
- Line 11 "shade": F (rhymes with "fade")
- Line 12 "grow'st": G (should rhyme with "ow'st" if detected)
- Line 13 "see": H
- Line 14 "thee": H (rhymes with "see")

**Predicted Pattern: A B A C D E D E F G F G H H**

This does NOT match the Shakespearean pattern ABABCDCDEFEFGG because:
- Position 3 (line 4): Expected 'B', got 'C'

## Root Cause

The root cause is that **"temperate" and "date" don't actually rhyme phonetically** according to CMU dictionary pronunciations:

- "temperate": TEM-per-ate (stress on first syllable, ends with unstressed AH0 T)
- "date": DATE (stress on only syllable, ends with EY1 T)

The vowel sounds in the final syllables are completely different (AH vs EY).

## What About the Shakespearean Structure Check?

Even if the pattern is A B A C D E D E F G F G H H, let's check if the structural pattern matching would catch it:

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

**The structural check FAILS at position 1 === 3**, because 'B' !== 'C'.

This causes the function to NOT recognize it as a Shakespearean sonnet structure, and it falls through to the "Free Verse" case.

## The Real Issue

The issue is that the CMU dictionary pronunciation for "temperate" does NOT rhyme with "date" phonetically. However, in Shakespeare's time and in poetic tradition, these words were considered to rhyme (likely as a slant rhyme or due to different pronunciation).

The algorithm is working correctly based on modern phonetics, but it's not accounting for:
1. Historical pronunciation differences
2. Poetic license / slant rhymes in traditional forms
3. The structural pattern should have priority over perfect phonetic matching

## Recommended Fix

The fix should be in the `detectSonnet` function in `formDetector.ts`. Instead of requiring exact rhyme matching, it should:

1. **Use structural pattern matching FIRST** for well-known forms like sonnets
2. **Allow for slant rhymes** when checking if the structure matches
3. **Report the fit quality** based on whether rhymes are perfect, slant, or missing

The key is on line 212-218 of formDetector.ts - the structural check is there but it requires EXACT letter matching. What we need is to be more lenient and check if the pattern has the RIGHT STRUCTURE even if some rhymes are imperfect.
