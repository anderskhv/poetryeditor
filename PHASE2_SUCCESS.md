# Phase II Success Criteria (Offline Synonyms)

## Success Criteria
1. Offline synonym coverage
   - For each test word, at least 2 expected synonyms are returned from the local dictionary.
2. Offline antonym coverage
   - For each test word with antonyms, at least 1 expected antonym is returned.
3. Zero external calls
   - Synonym, antonym, and hyponym lookups are satisfied without Datamuse.

## Phase II Test Set
Synonym expectations:
- happy -> joyful, glad, cheerful
- sad -> sorrowful, gloomy
- love -> adore, cherish
- big -> large, huge
- small -> tiny, little
- fast -> quick, swift
- slow -> sluggish, unhurried
- bright -> radiant, luminous
- dark -> gloomy, shadowy
- cold -> chilly, icy

Antonym expectations:
- happy -> sad
- love -> hate
- big -> small
- fast -> slow
- bright -> dark
