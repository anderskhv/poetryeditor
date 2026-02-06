# Phase I Success Criteria (Rhyme + Syllable Depth)

## Success Criteria
1. Perfect rhyme coverage
   - For each test word, at least 3 of the expected perfect rhymes appear.
2. Syllable count accuracy
   - At least 90% of the known-word syllable tests match expected counts.
3. Fallback syllable estimator
   - Returns a count >= 1 for unknown words and matches expected counts on the fallback test set.
4. Offline operation
   - Rhyme and syllable results are computed without external API calls once the CMU dictionary is loaded.

## Phase I Test Set
Perfect rhyme expectations:
- time -> dime, lime, chime, rhyme
- light -> night, sight, bright
- moon -> tune, soon, loon
- love -> dove, glove, above
- cold -> bold, told, fold

Syllable count expectations (known words):
- cat: 1
- love: 1
- banana: 3
- beautiful: 3
- poetry: 3
- forever: 3
- memory: 3
- tomorrow: 3

Fallback syllable expectations (unknown words):
- blorfle: 2
- snorple: 2
- flarion: 3
