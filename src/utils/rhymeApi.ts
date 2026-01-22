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

    const response = await fetch(
      `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&max=50`,
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
    const rhymesWithQuality = data.map((item: any) => ({
      word: item.word,
      score: item.score || 0,
      numSyllables: item.numSyllables,
      rhymeQuality: calculateRhymeQualityFast(sourcePhonemes, item.word),
    }));

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
 */
export async function fetchNearAndSlantRhymes(word: string): Promise<RhymeWord[]> {
  try {
    console.log(`Fetching near rhymes and slant rhymes for: ${word}`);

    // Fetch near rhymes
    const nearResponse = await fetch(
      `https://api.datamuse.com/words?rel_nry=${encodeURIComponent(word)}&max=100`,
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }
    );

    if (!nearResponse.ok) {
      console.error(`Near rhyme API response not OK: ${nearResponse.status} ${nearResponse.statusText}`);
      throw new Error('Failed to fetch near rhymes');
    }

    const nearData = await nearResponse.json();
    console.log(`Received ${nearData.length} near/slant rhymes for "${word}"`);

    // Datamuse API's rel_nry endpoint already includes slant rhymes
    // (words that share similar sounds but not perfect rhymes)
    return nearData.map((item: any) => ({
      word: item.word,
      score: item.score || 0,
      numSyllables: item.numSyllables,
    }));
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
