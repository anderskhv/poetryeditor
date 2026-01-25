import { useMemo, useRef, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { getDictionaryWords, isDictionaryLoaded } from '../utils/cmuDict';

interface UseAutocompleteOptions {
  maxResults?: number;
  minQueryLength?: number;
  debounceMs?: number;
}

/**
 * Hook for autocomplete suggestions from the CMU dictionary
 */
export function useAutocomplete(
  query: string,
  options: UseAutocompleteOptions = {}
): { suggestions: string[] } {
  const {
    maxResults = 8,
    minQueryLength = 2,
    debounceMs = 100,
  } = options;

  const debouncedQuery = useDebounce(query, debounceMs);

  // Cache the word list to avoid recreating it on every render
  const wordsRef = useRef<string[] | null>(null);

  useEffect(() => {
    if (isDictionaryLoaded() && !wordsRef.current) {
      wordsRef.current = getDictionaryWords();
    }
  }, [debouncedQuery]); // Check when query changes (dictionary may have loaded)

  const suggestions = useMemo(() => {
    const trimmedQuery = debouncedQuery.trim().toLowerCase();

    if (trimmedQuery.length < minQueryLength) {
      return [];
    }

    if (!isDictionaryLoaded()) {
      return [];
    }

    // Get words from cache or fresh
    const words = wordsRef.current || getDictionaryWords();
    if (!wordsRef.current) {
      wordsRef.current = words;
    }

    // Prefix match with scoring
    const matches: { word: string; score: number }[] = [];

    for (const word of words) {
      if (word.startsWith(trimmedQuery)) {
        // Exact match scores highest, then prefer shorter words
        const score = word === trimmedQuery ? 1000 : 100 - word.length;
        matches.push({ word, score });

        // Early exit once we have enough candidates
        if (matches.length >= maxResults * 5) break;
      }
    }

    // Sort by score (exact match first, then shorter words)
    matches.sort((a, b) => b.score - a.score);

    return matches.slice(0, maxResults).map(m => m.word);
  }, [debouncedQuery, maxResults, minQueryLength]);

  return { suggestions };
}
