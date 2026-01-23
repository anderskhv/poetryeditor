/**
 * Rhyme and synonym fetching using Datamuse API
 * https://www.datamuse.com/api/
 */

import nlp from 'compromise';
import { getRhymePhonemes } from './cmuDict';

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

/**
 * Fetch words that rhyme with the given word (perfect rhymes only)
 * Sorts by phonetic rhyme quality, putting true perfect rhymes first
 */
export async function fetchRhymes(word: string): Promise<RhymeWord[]> {
  try {
    console.log(`Fetching perfect rhymes for: ${word}`);

    // Add md=p to get parts of speech metadata
    const response = await fetch(
      `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&md=p&max=50`,
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }
    );

    if (!response.ok) {
      console.error(`Rhyme API response not OK: ${response.status} ${response.statusText}`);
      throw new Error('Failed to fetch rhymes');
    }

    const data = await response.json();
    console.log(`Received ${data.length} perfect rhymes for "${word}"`);

    // Get source word phonemes once, then reuse for all comparisons
    const sourcePhonemes = getRhymePhonemes(word);

    // Calculate rhyme quality for each word using CMU dictionary phonetics
    // Also extract parts of speech from tags
    const rhymesWithQuality = data.map((item: any) => {
      // Extract parts of speech from tags (e.g., ["n", "v"])
      const partsOfSpeech = item.tags?.filter((tag: string) =>
        ['n', 'v', 'adj', 'adv', 'u', 'prop'].includes(tag)
      ) || [];

      return {
        word: item.word,
        score: item.score || 0,
        numSyllables: item.numSyllables,
        rhymeQuality: calculateRhymeQualityFast(sourcePhonemes, item.word),
        partsOfSpeech,
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

    // First try near rhymes endpoint with parts of speech metadata
    const nearResponse = await fetch(
      `https://api.datamuse.com/words?rel_nry=${encodeURIComponent(word)}&md=p&max=100`,
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }
    );

    if (!nearResponse.ok) {
      console.error(`Near rhyme API response not OK: ${nearResponse.status} ${nearResponse.statusText}`);
      throw new Error('Failed to fetch near rhymes');
    }

    let nearData = await nearResponse.json();
    console.log(`Received ${nearData.length} near rhymes for "${word}"`);

    // If no near rhymes found, try sounds-like as fallback
    if (nearData.length === 0) {
      console.log(`No near rhymes found, trying sounds-like fallback for: ${word}`);
      const slResponse = await fetch(
        `https://api.datamuse.com/words?sl=${encodeURIComponent(word)}&md=p&max=100`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (slResponse.ok) {
        const slData = await slResponse.json();
        // Filter out exact matches and homophones (score 100)
        nearData = slData.filter((item: any) =>
          item.word.toLowerCase() !== word.toLowerCase() && item.score < 100
        );
        console.log(`Received ${nearData.length} sounds-like words for "${word}"`);
      }
    }

    return nearData.map((item: any) => {
      // Extract parts of speech from tags
      const partsOfSpeech = item.tags?.filter((tag: string) =>
        ['n', 'v', 'adj', 'adv', 'u', 'prop'].includes(tag)
      ) || [];

      return {
        word: item.word,
        score: item.score || 0,
        numSyllables: item.numSyllables,
        partsOfSpeech,
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
    // Use the word as-is - Datamuse API returns correctly inflected forms
    // (e.g., searching "desperately" returns "badly", not "bad")
    console.log(`Fetching synonyms for: ${word}`);

    // Use "means like" endpoint which is more semantically focused than rel_syn
    const response = await fetch(
      `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&md=p&max=50`,
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }
    );

    if (!response.ok) {
      console.error(`Synonym API response not OK: ${response.status} ${response.statusText}`);
      throw new Error('Failed to fetch synonyms');
    }

    const data = await response.json();
    console.log(`Received ${data.length} similar meaning words for "${word}"`);

    // Log top scores to understand the distribution
    if (data.length > 0) {
      const topScores = data.slice(0, 10).map((item: any) => `${item.word}:${item.score}`);
      console.log(`Top scores: ${topScores.join(', ')}`);
    }

    // Filter by score tiers and primary_rel tag:
    // - Primary synonyms: score >= 40,000,000 OR has "results_type:primary_rel" tag
    // - Secondary synonyms: score >= 29,500,000 (mid-tier)
    // This eliminates weak associations while keeping good secondary matches
    const filtered = data.filter((item: any) => {
      const score = item.score || 0;
      const isPrimary = item.tags?.includes('results_type:primary_rel');

      // Keep if it's a primary result OR has a high score (40M+) OR decent mid-tier (29.5M+)
      return isPrimary || score >= 40000000 || score >= 29500000;
    });
    console.log(`Filtered to ${filtered.length} quality synonyms (primary + high/mid scores)`);

    // Return synonyms in base form (don't try to transform them)
    return filtered.map((item: any) => ({
      word: item.word,
      score: item.score || 0,
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
    const response = await fetch(
      `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=15`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch similar words');
    }

    const data = await response.json();
    return data.map((item: any) => ({
      word: item.word,
      score: item.score || 0,
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
    console.log(`Fetching antonyms for: ${word}`);

    const response = await fetch(
      `https://api.datamuse.com/words?rel_ant=${encodeURIComponent(word)}&max=20`,
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }
    );

    if (!response.ok) {
      console.error(`Antonym API response not OK: ${response.status} ${response.statusText}`);
      throw new Error('Failed to fetch antonyms');
    }

    const data = await response.json();
    console.log(`Received ${data.length} antonyms for "${word}"`);

    return data.map((item: any) => ({
      word: item.word,
      score: item.score || 0,
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
    console.log(`Fetching concrete examples for: ${word}`);

    // Primary: try hyponyms (specific types/instances)
    const hyponymResponse = await fetch(
      `https://api.datamuse.com/words?rel_gen=${encodeURIComponent(word)}&max=100`,
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }
    );

    if (!hyponymResponse.ok) {
      console.error(`Imagery API response not OK: ${hyponymResponse.status} ${hyponymResponse.statusText}`);
      throw new Error('Failed to fetch concrete examples');
    }

    const hyponymData = await hyponymResponse.json();
    console.log(`Received ${hyponymData.length} hyponyms for "${word}"`);

    // If we got good results, return them
    if (hyponymData.length >= 5) {
      return hyponymData.map((item: any) => ({
        word: item.word,
        score: item.score || 0,
      }));
    }

    // Fallback 1: For adjectives/descriptors, try "nouns described by this adjective"
    // rel_jjb returns nouns that are often described by the adjective
    const jjbResponse = await fetch(
      `https://api.datamuse.com/words?rel_jjb=${encodeURIComponent(word)}&max=50`,
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }
    );

    if (jjbResponse.ok) {
      const jjbData = await jjbResponse.json();
      console.log(`Received ${jjbData.length} nouns described by "${word}"`);

      if (jjbData.length >= 3) {
        // Combine hyponyms with described nouns
        const combined = [
          ...hyponymData.map((item: any) => ({ word: item.word, score: item.score || 0 })),
          ...jjbData.map((item: any) => ({ word: item.word, score: item.score || 0 }))
        ];
        // Remove duplicates
        const seen = new Set<string>();
        return combined.filter(item => {
          if (seen.has(item.word)) return false;
          seen.add(item.word);
          return true;
        });
      }
    }

    // Fallback 2: Try "means like" for semantic associations
    const mlResponse = await fetch(
      `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=50`,
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }
    );

    if (mlResponse.ok) {
      const mlData = await mlResponse.json();
      console.log(`Received ${mlData.length} semantically related words for "${word}"`);

      // Combine all results
      const combined = [
        ...hyponymData.map((item: any) => ({ word: item.word, score: item.score || 0 })),
        ...mlData.slice(0, 30).map((item: any) => ({ word: item.word, score: item.score || 0 }))
      ];
      // Remove duplicates and the original word
      const seen = new Set<string>();
      seen.add(word.toLowerCase());
      return combined.filter(item => {
        const lower = item.word.toLowerCase();
        if (seen.has(lower)) return false;
        seen.add(lower);
        return true;
      });
    }

    // Return whatever hyponyms we got
    return hyponymData.map((item: any) => ({
      word: item.word,
      score: item.score || 0,
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
    console.log(`Fetching general categories for: ${word}`);

    const response = await fetch(
      `https://api.datamuse.com/words?rel_spc=${encodeURIComponent(word)}&max=20`,
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }
    );

    if (!response.ok) {
      console.error(`Hypernym API response not OK: ${response.status} ${response.statusText}`);
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    console.log(`Received ${data.length} general categories for "${word}"`);

    return data.map((item: any) => ({
      word: item.word,
      score: item.score || 0,
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
