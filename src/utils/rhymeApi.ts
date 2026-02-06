/**
 * Rhyme and synonym fetching using Datamuse API
 * https://www.datamuse.com/api/
 */

import nlp from 'compromise';
import { getRhymePhonemes, getPerfectRhymesOffline, getNearRhymesOffline, getSpellingRhymesOffline, getSyllableCount, isDictionaryLoaded, loadCMUDictionary } from './cmuDict';
import offlineSynonyms from '../data/offlineSynonyms.json';

/**
 * Fast rhyme quality calculation - reuses source phonemes
 */
function calculateRhymeQualityFast(sourcePhonemes: string[] | null, targetWord: string): number {
  if (!sourcePhonemes) return 0;

  const targetPhonemes = getRhymePhonemes(targetWord);
  if (!targetPhonemes) return 0;

  // Perfect rhyme: all phonemes from stressed vowel match exactly
  if (sourcePhonemes.length === targetPhonemes.length) {
    let matches = 0;
    for (let i = 0; i < sourcePhonemes.length; i++) {
      if (sourcePhonemes[i] === targetPhonemes[i]) matches++;
    }
    return matches / sourcePhonemes.length;
  }

  // Different lengths: compare from the end
  const minLen = Math.min(sourcePhonemes.length, targetPhonemes.length);
  let matches = 0;
  for (let i = 0; i < minLen; i++) {
    const p1 = sourcePhonemes[sourcePhonemes.length - 1 - i];
    const p2 = targetPhonemes[targetPhonemes.length - 1 - i];
    if (p1 === p2) matches++;
  }

  const lengthPenalty = minLen / Math.max(sourcePhonemes.length, targetPhonemes.length);
  return (matches / minLen) * lengthPenalty;
}

export interface RhymeWord {
  word: string;
  score: number;
  numSyllables?: number;
  rhymeQuality?: number; // 0-1, calculated from phonetic comparison
  partsOfSpeech?: string[]; // e.g., ['n', 'v'] for noun/verb
}

export interface SynonymWord {
  word: string;
  score: number;
}

type OfflineSynonymEntry = {
  synonyms: string[];
  antonyms?: string[];
  hyponyms?: string[];
};

function getOfflineSynonymEntry(word: string): OfflineSynonymEntry | undefined {
  const normalized = word.toLowerCase();
  return (offlineSynonyms as Record<string, OfflineSynonymEntry>)[normalized];
}

export function getWordVariants(word: string, partsOfSpeech: string[] = []): string[] {
  const variants = new Set<string>();
  const lower = word.toLowerCase();
  const posSet = new Set(partsOfSpeech);

  const addVariant = (value?: string) => {
    if (!value) return;
    const trimmed = value.trim().toLowerCase();
    if (!trimmed || trimmed === lower) return;
    variants.add(trimmed);
  };

  if (posSet.has('v') || posSet.size === 0) {
    const verbDoc = nlp(word).verbs();
    const conjugations = verbDoc.conjugate();
    if (conjugations.length > 0) {
      const forms = conjugations[0] as Record<string, string>;
      Object.values(forms).forEach(addVariant);
    } else {
      addVariant(verbDoc.toPastTense().text());
      addVariant(verbDoc.toPresentTense().text());
      addVariant(verbDoc.toGerund().text());
    }
  }

  if (posSet.has('n')) {
    const plural = nlp(word).nouns().toPlural().text();
    addVariant(plural);
  }

  return Array.from(variants);
}

/**
 * Fetch words that rhyme with the given word (perfect rhymes only)
 * Sorts by phonetic rhyme quality, putting true perfect rhymes first
 */
export async function fetchRhymes(word: string): Promise<RhymeWord[]> {
  try {
    console.log(`Fetching perfect rhymes for: ${word}`);

    if (!isDictionaryLoaded()) {
      await loadCMUDictionary();
    }

    const sourcePhonemes = getRhymePhonemes(word);
    const offlineRhymes = getPerfectRhymesOffline(word, 200);
    console.log(`Received ${offlineRhymes.length} offline perfect rhymes for "${word}"`);

    const rhymesWithQuality = offlineRhymes.map((rhymeWord) => {
      const score = Math.max(100, 5000 - rhymeWord.length * 100);
      return {
        word: rhymeWord,
        score,
        numSyllables: getSyllableCount(rhymeWord),
        rhymeQuality: calculateRhymeQualityFast(sourcePhonemes, rhymeWord),
        partsOfSpeech: [],
      };
    });

    // Sort by rhyme quality (perfect rhymes first), then by original API score
    rhymesWithQuality.sort((a: RhymeWord, b: RhymeWord) => {
      // Primary sort: rhyme quality (higher is better)
      const qualityDiff = (b.rhymeQuality || 0) - (a.rhymeQuality || 0);
      if (Math.abs(qualityDiff) > 0.1) return qualityDiff;
      // Secondary sort: original API score (higher is more common)
      return b.score - a.score;
    });

    return rhymesWithQuality;
  } catch (error) {
    console.error('Error fetching rhymes:', error);
    return [];
  }
}

/**
 * Fetch near rhymes and slant rhymes (combined)
 * Uses rel_nry first, falls back to sounds-like (sl) if empty
 */
export async function fetchNearAndSlantRhymes(word: string): Promise<RhymeWord[]> {
  try {
    console.log(`Fetching near rhymes and slant rhymes for: ${word}`);

    if (!isDictionaryLoaded()) {
      await loadCMUDictionary();
    }

    const nearRhymes = getNearRhymesOffline(word, 200);
    const spellingRhymes = getSpellingRhymesOffline(word, 200);
    const combined = Array.from(new Set([...nearRhymes, ...spellingRhymes]))
      .filter(rhyme => rhyme !== word);

    console.log(`Received ${combined.length} offline near/slant rhymes for "${word}"`);

    return combined.map((rhymeWord) => {
      const score = Math.max(100, 4000 - rhymeWord.length * 80);
      return {
        word: rhymeWord,
        score,
        numSyllables: getSyllableCount(rhymeWord),
        partsOfSpeech: [],
      };
    });
  } catch (error) {
    console.error('Error fetching near/slant rhymes:', error);
    return [];
  }
}

/**
 * Lemmatization - convert word to base/infinitive form
 * Uses simple suffix stripping since we just need the base for API lookup
 */
function lemmatize(word: string): string {
  const lower = word.toLowerCase();

  // Strip -ing suffix (drowning -> drown)
  if (lower.endsWith('ing') && lower.length > 4) {
    const base = lower.slice(0, -3);
    // Handle doubled consonants (running -> run, but drowning -> drown stays as is)
    if (base.length >= 2 &&
        base[base.length - 1] === base[base.length - 2] &&
        base.length <= 4) {
      return base.slice(0, -1);
    }
    return base;
  }

  // Strip -ed suffix (walked -> walk)
  if (lower.endsWith('ed') && lower.length > 3) {
    const base = lower.slice(0, -2);
    // Handle doubled consonants (stopped -> stop)
    if (base.length >= 2 &&
        base[base.length - 1] === base[base.length - 2] &&
        base.length <= 4) {
      return base.slice(0, -1);
    }
    // Try removing just 'd' if it ends in 'e' (glanced -> glance)
    if (!lower.endsWith('eed')) {
      return base;
    }
  }

  // Strip -s suffix for verbs/nouns (walks -> walk, cats -> cat)
  if (lower.endsWith('es') && lower.length > 3) {
    return lower.slice(0, -2);
  }
  if (lower.endsWith('s') && lower.length > 2 && !lower.endsWith('ss')) {
    return lower.slice(0, -1);
  }

  // Strip -ly suffix for adverbs (quickly -> quick)
  if (lower.endsWith('ly') && lower.length > 4) {
    return lower.slice(0, -2);
  }

  return lower;
}

/**
 * Detect the suffix/form of the original word
 */
function detectWordForm(word: string): { type: string; suffix: string } | null {
  const lower = word.toLowerCase();

  // Verb forms
  if (lower.endsWith('ing')) return { type: 'verb', suffix: 'ing' };
  if (lower.endsWith('ed')) return { type: 'verb', suffix: 'ed' };
  if (lower.endsWith('s') && !lower.endsWith('ss')) return { type: 'verb', suffix: 's' };

  // Noun plurals
  if (lower.endsWith('es')) return { type: 'noun', suffix: 'es' };
  if (lower.endsWith('s')) return { type: 'noun', suffix: 's' };

  return null;
}

/**
 * Apply the same form/conjugation from originalWord to synonymWord
 * E.g., if originalWord is "drowning", transform "submerge" to "submerging"
 */
function applyWordForm(synonymWord: string, originalWord: string): string {
  const wordForm = detectWordForm(originalWord);
  if (!wordForm) return synonymWord; // No transformation needed

  const synDoc = nlp(synonymWord);

  if (wordForm.type === 'verb') {
    if (wordForm.suffix === 'ing') {
      // Try to get gerund form
      const gerund = synDoc.verbs().toGerund().text();
      if (gerund && gerund !== synonymWord) return gerund;

      // Fallback: simple concatenation
      if (synonymWord.endsWith('e')) {
        return synonymWord.slice(0, -1) + 'ing';
      }
      return synonymWord + 'ing';
    }

    if (wordForm.suffix === 'ed') {
      // Try to get past tense
      const past = synDoc.verbs().toPastTense().text();
      if (past && past !== synonymWord) return past;

      // Fallback: simple concatenation
      if (synonymWord.endsWith('e')) {
        return synonymWord + 'd';
      }
      return synonymWord + 'ed';
    }

    if (wordForm.suffix === 's') {
      // Try to get present tense (3rd person)
      const present = synDoc.verbs().toPresentTense().text();
      if (present && present !== synonymWord) return present;

      // Fallback: simple concatenation
      if (synonymWord.match(/[sxz]$|[cs]h$/)) {
        return synonymWord + 'es';
      }
      return synonymWord + 's';
    }
  }

  if (wordForm.type === 'noun' && (wordForm.suffix === 's' || wordForm.suffix === 'es')) {
    // Try to get plural form
    const plural = synDoc.nouns().toPlural().text();
    if (plural && plural !== synonymWord) return plural;

    // Fallback: simple concatenation
    if (synonymWord.match(/[sxz]$|[cs]h$/)) {
      return synonymWord + 'es';
    }
    return synonymWord + 's';
  }

  // Default: return unchanged
  return synonymWord;
}

/**
 * Fetch synonyms for the given word
 */
export async function fetchSynonyms(word: string): Promise<SynonymWord[]> {
  try {
    console.log(`Fetching offline synonyms for: ${word}`);
    const entry = getOfflineSynonymEntry(word);
    if (!entry || entry.synonyms.length === 0) return [];
    return entry.synonyms.map((synonym, idx) => ({
      word: synonym,
      score: 1000 - idx * 10,
    }));
  } catch (error) {
    console.error('Error fetching synonyms:', error);
    return [];
  }
}

/**
 * Fetch words with similar meaning (broader than synonyms)
 */
export async function fetchSimilarWords(word: string): Promise<SynonymWord[]> {
  try {
    const entry = getOfflineSynonymEntry(word);
    if (!entry || entry.synonyms.length === 0) return [];
    return entry.synonyms.slice(0, 15).map((synonym, idx) => ({
      word: synonym,
      score: 1000 - idx * 10,
    }));
  } catch (error) {
    console.error('Error fetching similar words:', error);
    return [];
  }
}

/**
 * Fetch antonyms (words with opposite meaning)
 */
export async function fetchAntonyms(word: string): Promise<SynonymWord[]> {
  try {
    console.log(`Fetching offline antonyms for: ${word}`);
    const entry = getOfflineSynonymEntry(word);
    if (!entry || !entry.antonyms || entry.antonyms.length === 0) return [];
    return entry.antonyms.map((antonym, idx) => ({
      word: antonym,
      score: 1000 - idx * 10,
    }));
  } catch (error) {
    console.error('Error fetching antonyms:', error);
    return [];
  }
}

export interface ImageryWord {
  word: string;
  score: number;
}

/**
 * Fetch hyponyms (more specific/concrete examples)
 * Uses Datamuse rel_gen endpoint which returns specific types/instances
 * e.g., "tree" → "oak", "willow", "birch", "palm"
 * e.g., "bird" → "sparrow", "hawk", "parrot", "hen"
 *
 * For adjectives and other words without hyponyms, falls back to:
 * 1. rel_jjb (adjectives used to describe nouns) for nouns
 * 2. ml (means like) for semantic associations
 *
 * Note: Despite the name "rel_gen" (more general), Datamuse returns
 * words that are hyponyms (more specific instances) of the query word.
 */
export async function fetchHyponyms(word: string): Promise<ImageryWord[]> {
  try {
    console.log(`Fetching offline hyponyms for: ${word}`);
    const entry = getOfflineSynonymEntry(word);
    if (!entry || !entry.hyponyms || entry.hyponyms.length === 0) return [];
    return entry.hyponyms.map((item, idx) => ({
      word: item,
      score: 1000 - idx * 10,
    }));
  } catch (error) {
    console.error('Error fetching concrete examples:', error);
    return [];
  }
}

/**
 * Fetch hypernyms (more general/abstract categories)
 * Uses Datamuse rel_spc endpoint which returns generalizations
 * e.g., "oak" → "tree", "plant"
 *
 * Note: Despite the name "rel_spc" (more specific), Datamuse returns
 * words that are hypernyms (more general categories) of the query word.
 */
export async function fetchHypernyms(word: string): Promise<ImageryWord[]> {
  try {
    console.log(`Fetching offline hypernyms for: ${word}`);
    return [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
