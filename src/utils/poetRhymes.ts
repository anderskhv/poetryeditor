/**
 * Poet-facing rhyme lookup shared with the /rhymes quality pipeline.
 *
 * Source: local CMU phoneme index (same matcher as Rhyme Dictionary).
 * Defaults hide clichés and non-words / proper-noun junk.
 * Does not call Datamuse — topic search on /rhymes is the only Datamuse path.
 */

import nlp from 'compromise';
import { getFrequencyRank } from '../data/wordFrequency';
import {
  getNearRhymesOffline,
  getPerfectRhymesOffline,
  getRhymePhonemes,
  getSpellingRhymesOffline,
  getSyllableCount,
  isDictionaryLoaded,
  loadCMUDictionary,
} from './cmuDict';
import { getRhymeOriginalityScore } from './rhymeCliches';
import type { RhymeWord } from './rhymeApi';
import { wordsWithWordnetSenses } from './wordnetSenses';

export type PoetRhymeKind = 'perfect' | 'near';

export interface PoetRhymeOptions {
  kind?: PoetRhymeKind;
  /** Match /rhymes "Hide clichés" (originality < 35). Default true for the editor. */
  hideCliches?: boolean;
  /** Drop CMU phonetic junk and names that are not real English lemmas. Default true. */
  hideNonWords?: boolean;
}

/** Same threshold RhymeDictionary uses for `isCliche`. */
export const CLICHE_ORIGINALITY_THRESHOLD = 35;

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'at', 'by', 'from',
  'is', 'am', 'are', 'be', 'was', 'were', 'been', 'being', 'i', 'me', 'my', 'you',
  'your', 'yours', 'we', 'us', 'our', 'he', 'him', 'his', 'she', 'her', 'it', 'its',
  'they', 'them', 'their', 'this', 'that', 'these', 'those',
]);

let lexiconCache: Set<string> | null = null;

function getCompromiseLexicon(): Set<string> {
  if (lexiconCache) return lexiconCache;
  const model = nlp.model() as { one?: { lexicon?: Record<string, unknown> } };
  const lex = model.one?.lexicon ?? {};
  lexiconCache = new Set(Object.keys(lex).map((key) => key.toLowerCase()));
  return lexiconCache;
}

function calculateRhymeQuality(sourcePhonemes: string[] | null, targetWord: string): number {
  if (!sourcePhonemes) return 0;
  const targetPhonemes = getRhymePhonemes(targetWord);
  if (!targetPhonemes) return 0;

  if (sourcePhonemes.length === targetPhonemes.length) {
    let matches = 0;
    for (let i = 0; i < sourcePhonemes.length; i++) {
      if (sourcePhonemes[i] === targetPhonemes[i]) matches += 1;
    }
    return matches / sourcePhonemes.length;
  }

  const minLen = Math.min(sourcePhonemes.length, targetPhonemes.length);
  let matches = 0;
  for (let i = 0; i < minLen; i++) {
    const p1 = sourcePhonemes[sourcePhonemes.length - 1 - i];
    const p2 = targetPhonemes[targetPhonemes.length - 1 - i];
    if (p1 === p2) matches += 1;
  }
  const lengthPenalty = minLen / Math.max(sourcePhonemes.length, targetPhonemes.length);
  return (matches / minLen) * lengthPenalty;
}

function isStructurallyValidWord(word: string): boolean {
  const trimmed = word.trim();
  if (!trimmed || trimmed.startsWith("'")) return false;
  const normalized = trimmed.toLowerCase();
  if (normalized.length < 3) return false;
  if (STOPWORDS.has(normalized)) return false;
  if (!/^[a-z]+(?:-[a-z]+)?$/.test(normalized)) return false;
  if (!/[aeiouy]/.test(normalized)) return false;
  return true;
}

/** Fast local signals: frequency list or Compromise lexicon. */
export function isQuickKnownEnglishWord(word: string): boolean {
  const normalized = word.toLowerCase();
  if (getFrequencyRank(normalized) !== Infinity) return true;
  return getCompromiseLexicon().has(normalized);
}

async function keepUsableEnglishWords(words: string[]): Promise<string[]> {
  const structural = words.filter(isStructurallyValidWord);
  const unverified = structural.filter((word) => !isQuickKnownEnglishWord(word));
  if (unverified.length === 0) return structural;

  const wordnetHits = await wordsWithWordnetSenses(unverified);
  return structural.filter((word) => isQuickKnownEnglishWord(word) || wordnetHits.has(word.toLowerCase()));
}

function sortPoetRhymes(rhymes: RhymeWord[]): RhymeWord[] {
  return [...rhymes].sort((a, b) => {
    const qualityDiff = (b.rhymeQuality || 0) - (a.rhymeQuality || 0);
    if (Math.abs(qualityDiff) > 0.1) return qualityDiff;
    const freqA = getFrequencyRank(a.word);
    const freqB = getFrequencyRank(b.word);
    if (freqA !== freqB) return freqA - freqB;
    return a.word.localeCompare(b.word);
  });
}

function toRhymeWord(
  candidate: string,
  sourcePhonemes: string[] | null,
  rhymeType: RhymeWord['rhymeType']
): RhymeWord {
  const rank = getFrequencyRank(candidate);
  const rhymeQuality = calculateRhymeQuality(sourcePhonemes, candidate);
  return {
    word: candidate,
    score: Number.isFinite(rank) ? Math.max(100, 10000 - rank) : 100,
    numSyllables: getSyllableCount(candidate),
    rhymeQuality,
    partsOfSpeech: [],
    rhymeType,
  };
}

function passesNearPhonemeFilter(sourceWord: string, candidate: string, sourcePhonemes: string[] | null): boolean {
  if (!sourcePhonemes) return true;
  const rhyme = getRhymePhonemes(candidate);
  if (!rhyme || rhyme.length < 2 || sourcePhonemes.length < 2) return false;

  const targetVowel = sourcePhonemes[0]?.replace(/[012]$/, '') || null;
  const candidateVowel = rhyme[0]?.replace(/[012]$/, '');
  if (targetVowel && candidateVowel !== targetVowel) return false;

  const targetSyllables = getSyllableCount(sourceWord);
  if (Math.abs(getSyllableCount(candidate) - targetSyllables) > 1) return false;

  const minLen = Math.min(sourcePhonemes.length, rhyme.length);
  let tailMatches = 0;
  for (let i = 1; i <= minLen; i += 1) {
    if (sourcePhonemes[sourcePhonemes.length - i] === rhyme[rhyme.length - i]) {
      tailMatches += 1;
    }
  }
  const requiredMatches = minLen >= 3 ? 2 : 1;
  if (tailMatches < requiredMatches) return false;
  return calculateRhymeQuality(sourcePhonemes, candidate) >= 0.45;
}

function collectOfflineCandidates(word: string, kind: PoetRhymeKind): string[] {
  const normalized = word.trim().toLowerCase();
  if (kind === 'perfect') {
    return getPerfectRhymesOffline(normalized, Number.POSITIVE_INFINITY).filter((candidate) => candidate !== normalized);
  }

  // Do not slice the raw OW/IY/... bucket. An alphabetical cap drops late
  // words like "widow" before quality filters can keep them.
  const near = getNearRhymesOffline(normalized, Number.POSITIVE_INFINITY);
  const spelling = near.length < 20 ? getSpellingRhymesOffline(normalized, Number.POSITIVE_INFINITY) : [];
  return Array.from(new Set([...near, ...spelling])).filter((candidate) => candidate !== normalized);
}

/**
 * Local CMU/phoneme rhyme list with /rhymes ranking and editor defaults.
 */
export async function getPoetRhymes(word: string, options: PoetRhymeOptions = {}): Promise<RhymeWord[]> {
  const kind = options.kind ?? 'perfect';
  const hideCliches = options.hideCliches !== false;
  const hideNonWords = options.hideNonWords !== false;
  const normalized = word.trim().toLowerCase();
  if (!normalized) return [];

  if (!isDictionaryLoaded()) {
    await loadCMUDictionary();
  }

  const sourcePhonemes = getRhymePhonemes(normalized);
  let candidates = collectOfflineCandidates(normalized, kind);

  if (kind === 'near') {
    candidates = candidates.filter((candidate) => passesNearPhonemeFilter(normalized, candidate, sourcePhonemes));
  }

  if (hideNonWords) {
    candidates = await keepUsableEnglishWords(candidates);
  } else {
    candidates = candidates.filter(isStructurallyValidWord);
  }

  if (hideCliches) {
    candidates = candidates.filter(
      (candidate) => getRhymeOriginalityScore(normalized, candidate) >= CLICHE_ORIGINALITY_THRESHOLD
    );
  }

  const rhymeType: RhymeWord['rhymeType'] = kind === 'perfect' ? 'perfect' : 'near';
  return sortPoetRhymes(
    candidates.map((candidate) => toRhymeWord(candidate, sourcePhonemes, rhymeType))
  );
}

/** Strict perfect rhymes for the editor Rhymes tab. Local CMU only. */
export async function getEditorRhymes(word: string): Promise<RhymeWord[]> {
  return getPoetRhymes(word, { kind: 'perfect', hideCliches: true, hideNonWords: true });
}

/** Near/slant rhymes for the editor Near Rhymes tab. Same filters as perfect. */
export async function getEditorNearRhymes(word: string): Promise<RhymeWord[]> {
  return getPoetRhymes(word, { kind: 'near', hideCliches: true, hideNonWords: true });
}
