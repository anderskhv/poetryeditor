/**
 * CMU Pronouncing Dictionary utilities
 * Handles loading and querying the CMU dictionary for stress patterns
 */

export interface Pronunciation {
  word: string;
  phones: string[];
  stresses: number[]; // 0 = no stress, 1 = primary, 2 = secondary
}

let dictionaryCache: Map<string, Pronunciation[]> | null = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

/**
 * Load the CMU dictionary from the public folder
 */
export async function loadCMUDictionary(): Promise<void> {
  if (dictionaryCache) {
    return; // Already loaded
  }

  if (isLoading && loadPromise) {
    return loadPromise; // Wait for existing load
  }

  isLoading = true;
  loadPromise = (async () => {
    try {
      const response = await fetch('/cmudict.dict');
      const text = await response.text();
      dictionaryCache = parseCMUDict(text);
      isLoading = false;
    } catch (error) {
      console.error('Failed to load CMU dictionary:', error);
      isLoading = false;
      throw error;
    }
  })();

  return loadPromise;
}

/**
 * Parse the CMU dictionary text format
 */
function parseCMUDict(text: string): Map<string, Pronunciation[]> {
  const dict = new Map<string, Pronunciation[]>();
  const lines = text.split('\n');

  for (const line of lines) {
    // Skip comments and empty lines
    if (line.startsWith(';;;') || line.trim().length === 0) {
      continue;
    }

    // Parse line format: WORD  P H O N E1 P H O N E2
    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;

    let word = parts[0];
    const phones = parts.slice(1);

    // Handle word variants (e.g., "WORD(2)")
    const baseWord = word.replace(/\(\d+\)$/, '').toLowerCase();

    // Extract stress pattern from phones
    const stresses: number[] = [];
    for (const phone of phones) {
      const match = phone.match(/[012]$/);
      if (match) {
        stresses.push(parseInt(match[0]));
      }
    }

    const pronunciation: Pronunciation = {
      word: baseWord,
      phones,
      stresses,
    };

    if (!dict.has(baseWord)) {
      dict.set(baseWord, []);
    }
    dict.get(baseWord)!.push(pronunciation);
  }

  return dict;
}

/**
 * Get pronunciations for a word
 */
export function getPronunciations(word: string): Pronunciation[] {
  if (!dictionaryCache) {
    console.warn('CMU dictionary not loaded yet');
    return [];
  }

  const normalized = word.toLowerCase().replace(/[^a-z'-]/g, '');
  let result = dictionaryCache.get(normalized);

  // If not found, try some common transformations
  if (!result || result.length === 0) {
    // Handle contractions and archaic forms (e.g., "ow'st" -> "owest")
    const withoutApostrophe = normalized.replace(/'/g, '');
    result = dictionaryCache.get(withoutApostrophe);

    // Handle compound words with un- prefix
    if (!result || result.length === 0) {
      if (normalized.startsWith('un')) {
        const baseWord = normalized.slice(2);
        const basePron = dictionaryCache.get(baseWord);
        if (basePron && basePron.length > 0) {
          // Construct pronunciation by adding "UN" prefix
          // UN is typically AH0 N
          const unPhones = ['AH0', 'N'];
          const newPron: Pronunciation = {
            word: normalized,
            phones: [...unPhones, ...basePron[0].phones],
            stresses: [0, ...basePron[0].stresses]
          };
          return [newPron];
        }
      }
    }
  }

  return result || [];
}

/**
 * Get stress pattern for a word
 * Prefers pronunciations with more syllables (better for poetry)
 */
export function getStressPattern(word: string): number[] {
  const pronunciations = getPronunciations(word);
  if (pronunciations.length === 0) return [];

  // For poetry, prefer the pronunciation with the most syllables
  const sorted = [...pronunciations].sort((a, b) => b.stresses.length - a.stresses.length);
  return sorted[0].stresses;
}

/**
 * Get all stress patterns for a word (for words with multiple pronunciations)
 */
export function getAllStressPatterns(word: string): number[][] {
  const pronunciations = getPronunciations(word);
  return pronunciations.map(p => p.stresses);
}

/**
 * Inject a pre-loaded dictionary (for testing purposes)
 */
export function injectDictionary(dict: Map<string, Pronunciation[]>): void {
  dictionaryCache = dict;
}

/**
 * Get syllables by splitting the word approximately based on syllable count
 * Uses the CMU dictionary stress pattern as the source of truth for syllable count
 */
export function getSyllables(word: string): string[] {
  const pronunciations = getPronunciations(word);
  if (pronunciations.length === 0) return [];

  // Prefer the pronunciation with the most syllables (better for poetry)
  const sorted = [...pronunciations].sort((a, b) => b.stresses.length - a.stresses.length);
  const phones = sorted[0].phones;
  const stresses = sorted[0].stresses;

  // Build syllables from phonemes
  const syllables: string[] = [];
  let currentPhonemes: string[] = [];

  for (let i = 0; i < phones.length; i++) {
    const phone = phones[i];
    currentPhonemes.push(phone);

    // Vowel phonemes end with stress markers (0, 1, or 2)
    if (/[012]$/.test(phone)) {
      // This phoneme is a vowel, marks a syllable boundary
      syllables.push(currentPhonemes.join(' '));
      currentPhonemes = [];
    }
  }

  // Add any remaining consonants to last syllable
  if (currentPhonemes.length > 0 && syllables.length > 0) {
    syllables[syllables.length - 1] += ' ' + currentPhonemes.join(' ');
  }

  // Now we have phoneme-based syllables
  // Try to map them back to the original word's letters
  // This is approximate - just split the word proportionally
  const lowerWord = word.toLowerCase();
  const charPerSyllable = lowerWord.length / syllables.length;
  const letterSyllables: string[] = [];

  for (let i = 0; i < syllables.length; i++) {
    const start = Math.floor(i * charPerSyllable);
    const end = i === syllables.length - 1 ? lowerWord.length : Math.floor((i + 1) * charPerSyllable);
    letterSyllables.push(lowerWord.substring(start, end));
  }

  return letterSyllables.map((syl, idx) => {
    // Preserve original capitalization
    if (idx === 0 && word[0] === word[0].toUpperCase()) {
      return syl.charAt(0).toUpperCase() + syl.slice(1);
    }
    return syl;
  });
}

/**
 * Check if the dictionary is loaded
 */
export function isDictionaryLoaded(): boolean {
  return dictionaryCache !== null;
}

/**
 * Get syllable count from stress pattern
 */
export function getSyllableCountFromStress(stresses: number[]): number {
  return stresses.length;
}

/**
 * Convert stress pattern to readable string
 * 0 = unstressed (u), 1 = primary stress ('), 2 = secondary stress (,)
 */
export function stressPatternToString(stresses: number[]): string {
  return stresses.map(s => {
    if (s === 1) return "'";
    if (s === 2) return ",";
    return "u";
  }).join('');
}


/**
 * Detect if a sequence of words follows a specific metrical pattern
 */
export function matchesMeterPattern(
  words: string[],
  pattern: number[]
): { matches: boolean; confidence: number } {
  const stresses: number[] = [];

  for (const word of words) {
    const wordStresses = getStressPattern(word);
    if (wordStresses.length === 0) {
      // Unknown word - can't determine pattern
      return { matches: false, confidence: 0 };
    }
    stresses.push(...wordStresses);
  }

  if (stresses.length !== pattern.length) {
    return { matches: false, confidence: 0 };
  }

  let matches = 0;
  for (let i = 0; i < stresses.length; i++) {
    if (stresses[i] === pattern[i]) {
      matches++;
    }
  }

  const confidence = matches / stresses.length;
  return {
    matches: confidence > 0.8, // 80% match threshold
    confidence,
  };
}
