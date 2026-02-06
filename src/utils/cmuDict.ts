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
let rhymeIndexCache: {
  perfect: Map<string, string[]>;
  near: Map<string, string[]>;
  spelling: Map<string, string[]>;
} | null = null;

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
      rhymeIndexCache = null;
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

    const word = parts[0];
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
  rhymeIndexCache = null;
}

/**
 * Get syllables by splitting the word approximately based on syllable count
 * Uses the CMU dictionary stress pattern as the source of truth for syllable count
 */
export function getSyllables(word: string): string[] {
  const pronunciations = getPronunciations(word);
  if (pronunciations.length === 0) return estimateSyllables(word);

  // Prefer the pronunciation with the most syllables (better for poetry)
  const sorted = [...pronunciations].sort((a, b) => b.stresses.length - a.stresses.length);
  const phones = sorted[0].phones;
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
 * Get all words from the dictionary (for autocomplete)
 */
export function getDictionaryWords(): string[] {
  if (!dictionaryCache) return [];
  return Array.from(dictionaryCache.keys());
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
 * Get the rhyming portion of a word (from stressed vowel to end)
 * This is used to determine rhyme quality
 */
export function getRhymePhonemes(word: string): string[] | null {
  const pronunciations = getPronunciations(word);
  if (pronunciations.length === 0) return null;

  // Use the first (most common) pronunciation
  const phones = pronunciations[0].phones;

  // Find the last stressed vowel (stress 1 or 2)
  // For rhyming, we typically use the last stressed syllable
  let lastStressIndex = -1;
  for (let i = phones.length - 1; i >= 0; i--) {
    const phone = phones[i];
    // Vowels end with 0, 1, or 2 (stress markers)
    if (/[12]$/.test(phone)) {
      lastStressIndex = i;
      break;
    }
  }

  // If no stressed vowel found, use the last vowel
  if (lastStressIndex === -1) {
    for (let i = phones.length - 1; i >= 0; i--) {
      if (/[012]$/.test(phones[i])) {
        lastStressIndex = i;
        break;
      }
    }
  }

  if (lastStressIndex === -1) return null;

  // Return phonemes from the stressed vowel to the end (normalized without stress numbers)
  return phones.slice(lastStressIndex).map(p => p.replace(/[012]$/, ''));
}

function getRhymeKeyFromPhones(phones: string[]): string | null {
  let lastStressIndex = -1;
  for (let i = phones.length - 1; i >= 0; i--) {
    if (/[12]$/.test(phones[i])) {
      lastStressIndex = i;
      break;
    }
  }
  if (lastStressIndex === -1) {
    for (let i = phones.length - 1; i >= 0; i--) {
      if (/[012]$/.test(phones[i])) {
        lastStressIndex = i;
        break;
      }
    }
  }
  if (lastStressIndex === -1) return null;
  return phones.slice(lastStressIndex).map(p => p.replace(/[012]$/, '')).join('-');
}

function getNearKeyFromPhones(phones: string[]): string | null {
  for (let i = phones.length - 1; i >= 0; i--) {
    if (/[012]$/.test(phones[i])) {
      return phones[i].replace(/[012]$/, '');
    }
  }
  return null;
}

function getSpellingRhymeKey(word: string): string | null {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (cleaned.length < 3) return null;
  const vowelMatch = cleaned.match(/([aeiouy]+[^aeiouy]*)$/);
  if (vowelMatch) return vowelMatch[1];
  return cleaned.slice(-3);
}

function buildRhymeIndex() {
  if (!dictionaryCache) {
    return {
      perfect: new Map<string, string[]>(),
      near: new Map<string, string[]>(),
      spelling: new Map<string, string[]>(),
    };
  }

  const perfect = new Map<string, string[]>();
  const near = new Map<string, string[]>();
  const spelling = new Map<string, string[]>();

  for (const [word, pronunciations] of dictionaryCache.entries()) {
    if (!pronunciations || pronunciations.length === 0) continue;
    const best = [...pronunciations].sort((a, b) => b.stresses.length - a.stresses.length)[0];
    const perfectKey = getRhymeKeyFromPhones(best.phones);
    const nearKey = getNearKeyFromPhones(best.phones);
    const spellingKey = getSpellingRhymeKey(word);

    if (perfectKey) {
      const list = perfect.get(perfectKey) ?? [];
      list.push(word);
      perfect.set(perfectKey, list);
    }

    if (nearKey) {
      const list = near.get(nearKey) ?? [];
      list.push(word);
      near.set(nearKey, list);
    }

    if (spellingKey) {
      const list = spelling.get(spellingKey) ?? [];
      list.push(word);
      spelling.set(spellingKey, list);
    }
  }

  return { perfect, near, spelling };
}

function ensureRhymeIndex() {
  if (!rhymeIndexCache) {
    rhymeIndexCache = buildRhymeIndex();
  }
  return rhymeIndexCache;
}

export function getPerfectRhymesOffline(word: string, limit = 200): string[] {
  const pronunciations = getPronunciations(word);
  if (pronunciations.length === 0) return [];
  const best = [...pronunciations].sort((a, b) => b.stresses.length - a.stresses.length)[0];
  const key = getRhymeKeyFromPhones(best.phones);
  if (!key) return [];
  const { perfect } = ensureRhymeIndex();
  const results = perfect.get(key) ?? [];
  return results.filter(w => w !== word).slice(0, limit);
}

export function getNearRhymesOffline(word: string, limit = 200): string[] {
  const pronunciations = getPronunciations(word);
  if (pronunciations.length === 0) return [];
  const best = [...pronunciations].sort((a, b) => b.stresses.length - a.stresses.length)[0];
  const nearKey = getNearKeyFromPhones(best.phones);
  if (!nearKey) return [];
  const { near } = ensureRhymeIndex();
  const results = near.get(nearKey) ?? [];
  return results.filter(w => w !== word).slice(0, limit);
}

export function getSpellingRhymesOffline(word: string, limit = 200): string[] {
  const key = getSpellingRhymeKey(word);
  if (!key) return [];
  const { spelling } = ensureRhymeIndex();
  const results = spelling.get(key) ?? [];
  return results.filter(w => w !== word).slice(0, limit);
}

export function estimateSyllableCount(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleaned) return 0;

  const vowels = 'aeiouy';
  let count = 0;
  let prevWasVowel = false;

  for (let i = 0; i < cleaned.length; i++) {
    const isVowel = vowels.includes(cleaned[i]);
    if (isVowel && !prevWasVowel) {
      count += 1;
    }
    prevWasVowel = isVowel;
  }

  if (cleaned.endsWith('e') && !cleaned.endsWith('le') && count > 1) {
    count -= 1;
  }

  if (cleaned.startsWith('y')) {
    count = Math.max(1, count);
  }

  const splitPairs = cleaned.match(/(ia|io|eo|ua|ui|iu|ya|yo|ye)/g);
  if (splitPairs) {
    count += splitPairs.length;
  }

  return Math.max(1, count);
}

export function getSyllableCount(word: string): number {
  const stresses = getStressPattern(word);
  if (stresses.length > 0) return stresses.length;
  return estimateSyllableCount(word);
}

export function estimateSyllables(word: string): string[] {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleaned) return [];
  const vowels = 'aeiouy';
  const syllables: string[] = [];
  let current = '';

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const isVowel = vowels.includes(char);
    const nextIsVowel = i < cleaned.length - 1 && vowels.includes(cleaned[i + 1]);
    current += char;
    if (isVowel && !nextIsVowel) {
      syllables.push(current);
      current = '';
    }
  }

  if (current) {
    if (syllables.length === 0) {
      syllables.push(current);
    } else {
      syllables[syllables.length - 1] += current;
    }
  }

  if (syllables.length > 1 && syllables[syllables.length - 1] === 'e' && !cleaned.endsWith('le')) {
    syllables.pop();
  }

  const splitPatterns = /(ia|io|eo|ua|ui|iu|ya|yo|ye)/;
  const expanded: string[] = [];
  for (const syl of syllables) {
    const match = syl.match(splitPatterns);
    if (match && syl.length > 2) {
      const idx = syl.indexOf(match[0]);
      const left = syl.slice(0, idx + 1);
      const right = syl.slice(idx + 1);
      if (left) expanded.push(left);
      if (right) expanded.push(right);
    } else {
      expanded.push(syl);
    }
  }

  return expanded;
}

/**
 * Calculate rhyme quality score between two words
 * Returns a number from 0 to 1, where 1 is a perfect rhyme
 */
export function calculateRhymeQuality(word1: string, word2: string): number {
  const rhyme1 = getRhymePhonemes(word1);
  const rhyme2 = getRhymePhonemes(word2);

  if (!rhyme1 || !rhyme2) return 0;

  // Perfect rhyme: all phonemes from stressed vowel match exactly
  if (rhyme1.length === rhyme2.length) {
    let matches = 0;
    for (let i = 0; i < rhyme1.length; i++) {
      if (rhyme1[i] === rhyme2[i]) matches++;
    }
    return matches / rhyme1.length;
  }

  // Different lengths: compare from the end (the most important part for rhyming)
  const minLen = Math.min(rhyme1.length, rhyme2.length);
  let matches = 0;
  for (let i = 0; i < minLen; i++) {
    const p1 = rhyme1[rhyme1.length - 1 - i];
    const p2 = rhyme2[rhyme2.length - 1 - i];
    if (p1 === p2) matches++;
  }

  // Penalize length difference
  const lengthPenalty = minLen / Math.max(rhyme1.length, rhyme2.length);
  return (matches / minLen) * lengthPenalty;
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
