/**
 * Rhyme and synonym fetching using Datamuse API
 * https://www.datamuse.com/api/
 */

import nlp from 'compromise';
import { getRhymePhonemes, getPerfectRhymesOffline, getNearRhymesOffline, getSpellingRhymesOffline, getSyllableCount, isDictionaryLoaded, loadCMUDictionary } from './cmuDict';
import offlineSynonyms from '../data/offlineSynonyms.json';
import { getWordnetSenses, type WordnetSensePayload } from './wordnetSenses';

const DATAMUSE_ENABLED = true;
const DATAMUSE_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const DATAMUSE_RATE_LIMIT_PER_MINUTE = 60;
const datamuseMemoryCache = new Map<string, { ts: number; data: any }>();

function getCachedDatamuse(key: string) {
  const inMemory = datamuseMemoryCache.get(key);
  if (inMemory && Date.now() - inMemory.ts < DATAMUSE_CACHE_TTL_MS) return inMemory.data;
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(`datamuse:${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts < DATAMUSE_CACHE_TTL_MS) {
      datamuseMemoryCache.set(key, parsed);
      return parsed.data;
    }
  } catch (error) {
    console.warn('Datamuse cache read failed', error);
  }
  return null;
}

function setCachedDatamuse(key: string, data: any) {
  const payload = { ts: Date.now(), data };
  datamuseMemoryCache.set(key, payload);
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`datamuse:${key}`, JSON.stringify(payload));
  } catch (error) {
    console.warn('Datamuse cache write failed', error);
  }
}

function canUseDatamuse() {
  if (!DATAMUSE_ENABLED || typeof window === 'undefined') return DATAMUSE_ENABLED;
  try {
    const raw = window.localStorage.getItem('datamuse:timestamps');
    const now = Date.now();
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    const recent = timestamps.filter(ts => now - ts < 60000);
    if (recent.length >= DATAMUSE_RATE_LIMIT_PER_MINUTE) return false;
    recent.push(now);
    window.localStorage.setItem('datamuse:timestamps', JSON.stringify(recent));
    return true;
  } catch (error) {
    console.warn('Datamuse rate limit check failed', error);
    return true;
  }
}

async function fetchDatamuseJson(url: string, cacheKey: string) {
  const cached = getCachedDatamuse(cacheKey);
  if (cached) return cached;
  if (!canUseDatamuse()) return [];
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) return [];
  const data = await response.json();
  setCachedDatamuse(cacheKey, data);
  return data;
}

export async function fetchRhymesWithTopic(word: string, topic: string): Promise<RhymeWord[]> {
  if (!topic.trim()) return [];
  const data = await fetchDatamuseJson(
    `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&ml=${encodeURIComponent(topic)}&md=sp&max=100`,
    `rel_rhy:${word}:topic:${topic}`
  );
  return data.map((item: any) => ({
    word: item.word,
    score: item.score || 0,
    numSyllables: item.numSyllables || getSyllableCount(item.word),
    partsOfSpeech: item.tags?.filter((tag: string) =>
      ['n', 'v', 'adj', 'adv', 'u', 'prop'].includes(tag)
    ) || [],
    rhymeType: 'perfect',
  }));
}

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
  rhymeType?: 'perfect' | 'near' | 'slant' | 'spelling';
}

export interface SynonymWord {
  word: string;
  score: number;
}

export interface SynonymSense {
  gloss: string;
  pos?: string;
  synonyms: SynonymWord[];
  source: 'wordnet' | 'fallback' | 'datamuse';
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

    const rhymesWithQuality: RhymeWord[] = offlineRhymes.map((rhymeWord) => {
      const score = Math.max(100, 5000 - rhymeWord.length * 100);
      return {
        word: rhymeWord,
        score,
        numSyllables: getSyllableCount(rhymeWord),
        rhymeQuality: calculateRhymeQualityFast(sourcePhonemes, rhymeWord),
        partsOfSpeech: [],
      };
    });

    const shouldFallback = rhymesWithQuality.length < 25;
    if (shouldFallback) {
      const data = await fetchDatamuseJson(
        `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&md=p&max=100`,
        `rel_rhy:${word}`
      );
      const fallback: RhymeWord[] = data.map((item: any) => {
        const partsOfSpeech = item.tags?.filter((tag: string) =>
          ['n', 'v', 'adj', 'adv', 'u', 'prop'].includes(tag)
        ) || [];
        return {
          word: item.word,
          score: item.score || 0,
          numSyllables: item.numSyllables || getSyllableCount(item.word),
          rhymeQuality: calculateRhymeQualityFast(sourcePhonemes, item.word),
          partsOfSpeech,
        };
      });
      const merged = new Map<string, RhymeWord>();
      [...rhymesWithQuality, ...fallback].forEach(item => {
        if (!merged.has(item.word)) merged.set(item.word, item);
      });
      rhymesWithQuality.length = 0;
      rhymesWithQuality.push(...merged.values());
    }

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

    const stopwords = new Set([
      'a', 'an', 'the', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'at', 'by', 'from',
      'is', 'am', 'are', 'be', 'was', 'were', 'been', 'being', 'i', 'me', 'my', 'you',
      'your', 'yours', 'we', 'us', 'our', 'he', 'him', 'his', 'she', 'her', 'it', 'its',
      'they', 'them', 'their', 'this', 'that', 'these', 'those',
    ]);

    const isValidNearRhyme = (candidate: string) => {
      const trimmed = candidate.trim();
      if (!trimmed) return false;
      if (trimmed.startsWith("'")) return false;
      const normalized = trimmed.toLowerCase();
      if (normalized.length < 3) return false;
      if (stopwords.has(normalized)) return false;
      if (!/^[a-zA-Z-]+$/.test(trimmed)) return false;
      if (!/[aeiouy]/i.test(trimmed)) return false;
      return true;
    };

    const targetRhyme = getRhymePhonemes(word);
    const targetVowel = targetRhyme?.[0]?.replace(/[012]$/, '') || null;
    const targetSyllables = getSyllableCount(word);

    const matchesTargetVowel = (candidate: string) => {
      if (!targetVowel) return true;
      const rhyme = getRhymePhonemes(candidate);
      const vowel = rhyme?.[0]?.replace(/[012]$/, '');
      return vowel === targetVowel;
    };

    const getTailMatchCount = (target: string[], candidate: string[]) => {
      const minLen = Math.min(target.length, candidate.length);
      let matches = 0;
      for (let i = 1; i <= minLen; i += 1) {
        if (target[target.length - i] === candidate[candidate.length - i]) {
          matches += 1;
        }
      }
      return { matches, minLen };
    };

    const passesPhonemeFilter = (candidate: string) => {
      if (!targetRhyme) return true;
      const rhyme = getRhymePhonemes(candidate);
      if (!rhyme) return false;
      if (rhyme.length < 2 || targetRhyme.length < 2) return false;
      const { matches, minLen } = getTailMatchCount(targetRhyme, rhyme);
      const requiredMatches = minLen >= 3 ? 2 : 1;
      if (matches < requiredMatches) return false;
      const quality = calculateRhymeQualityFast(targetRhyme, candidate);
      return quality >= 0.45;
    };

    const matchesSyllables = (candidate: string) => {
      const syllables = getSyllableCount(candidate);
      return Math.abs(syllables - targetSyllables) <= 1;
    };

    const nearRhymes = getNearRhymesOffline(word, 200);
    const spellingRhymes = nearRhymes.length < 20 ? getSpellingRhymesOffline(word, 120) : [];
    const combined = Array.from(new Set([...nearRhymes, ...spellingRhymes]))
      .filter(rhyme => rhyme !== word)
      .filter(isValidNearRhyme)
      .filter(matchesTargetVowel)
      .filter(matchesSyllables)
      .filter(passesPhonemeFilter);

    console.log(`Received ${combined.length} offline near/slant rhymes for "${word}"`);

    let results: RhymeWord[] = combined.map((rhymeWord) => {
      const score = Math.max(100, 4000 - rhymeWord.length * 80);
      const rhymeQuality = targetRhyme ? calculateRhymeQualityFast(targetRhyme, rhymeWord) : 0;
      return {
        word: rhymeWord,
        score,
        numSyllables: getSyllableCount(rhymeWord),
        rhymeQuality,
        partsOfSpeech: [],
      };
    });

    if (results.length < 40) {
      const data = await fetchDatamuseJson(
        `https://api.datamuse.com/words?rel_nry=${encodeURIComponent(word)}&md=p&max=120`,
        `rel_nry:${word}`
      );
      const fallback: RhymeWord[] = data.map((item: any) => {
        const partsOfSpeech = item.tags?.filter((tag: string) =>
          ['n', 'v', 'adj', 'adv', 'u', 'prop'].includes(tag)
        ) || [];
        return {
          word: item.word,
          score: item.score || 0,
          numSyllables: item.numSyllables || getSyllableCount(item.word),
          partsOfSpeech,
        };
      });
      const merged = new Map<string, RhymeWord>();
      [...results, ...fallback].forEach(item => {
        if (!merged.has(item.word)) merged.set(item.word, item);
      });
      results = Array.from(merged.values())
        .filter(rhyme => isValidNearRhyme(rhyme.word))
        .filter(rhyme => matchesTargetVowel(rhyme.word))
        .filter(rhyme => matchesSyllables(rhyme.word))
        .filter(rhyme => passesPhonemeFilter(rhyme.word))
        .map((rhyme) => ({
          ...rhyme,
          rhymeQuality: targetRhyme ? calculateRhymeQualityFast(targetRhyme, rhyme.word) : 0,
        }));
    }

    results.sort((a, b) => {
      const qualityDiff = (b.rhymeQuality || 0) - (a.rhymeQuality || 0);
      if (Math.abs(qualityDiff) > 0.05) return qualityDiff;
      return b.score - a.score;
    });

    return results;
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
function detectWordForm(word: string, posHint?: string): { type: string; suffix: string } | null {
  const lower = word.toLowerCase();
  const doc = nlp(lower);
  const isVerb = posHint ? posHint.startsWith('v') : doc.verbs().length > 0;
  const isNoun = posHint ? posHint.startsWith('n') : doc.nouns().length > 0;

  // Verb forms (only if we actually see a verb)
  if (lower.endsWith('ing') && isVerb) return { type: 'verb', suffix: 'ing' };
  if (lower.endsWith('ed') && isVerb) return { type: 'verb', suffix: 'ed' };
  if (lower.endsWith('s') && !lower.endsWith('ss') && isVerb) return { type: 'verb', suffix: 's' };

  // Noun plurals (only if we actually see a noun)
  if (lower.endsWith('es') && isNoun) return { type: 'noun', suffix: 'es' };
  if (lower.endsWith('s') && isNoun) return { type: 'noun', suffix: 's' };

  return null;
}

/**
 * Apply the same form/conjugation from originalWord to synonymWord
 * E.g., if originalWord is "drowning", transform "submerge" to "submerging"
 */
function applyWordForm(synonymWord: string, originalWord: string, posHint?: string): string {
  const wordForm = detectWordForm(originalWord, posHint);
  if (!wordForm) return synonymWord; // No transformation needed

  const synDoc = nlp(synonymWord);
  const normalizeVerbOutput = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return '';
    const parts = trimmed.split(/\s+/);
    return parts[parts.length - 1];
  };
  const irregularPast = new Set(['done']);

  if (wordForm.type === 'verb') {
    if (wordForm.suffix === 'ing') {
      if (synonymWord.endsWith('ing')) return synonymWord;
      // Try to get gerund form
      const gerund = normalizeVerbOutput(synDoc.verbs().toGerund().text());
      if (gerund && gerund !== synonymWord) return gerund;

      // Fallback: simple concatenation
      if (synonymWord.endsWith('e')) {
        return synonymWord.slice(0, -1) + 'ing';
      }
      return synonymWord + 'ing';
    }

    if (wordForm.suffix === 'ed') {
      if (synonymWord.endsWith('ed')) return synonymWord;
      if (irregularPast.has(synonymWord)) return synonymWord;
      const conjugations = synDoc.verbs().conjugate();
      const isPast = conjugations.some(conj =>
        Object.entries(conj).some(([key, value]) =>
          key.toLowerCase().includes('past') && value === synonymWord
        )
      );
      if (isPast) return synonymWord;
      // Try to get past tense
      const past = normalizeVerbOutput(synDoc.verbs().toPastTense().text());
      if (past && past !== synonymWord) return past;

      // Fallback: simple concatenation
      if (synonymWord.endsWith('e')) {
        return synonymWord + 'd';
      }
      return synonymWord + 'ed';
    }

    if (wordForm.suffix === 's') {
      // Try to get present tense (3rd person)
      const present = normalizeVerbOutput(synDoc.verbs().toPresentTense().text());
      if (present && present !== synonymWord) return present;

      // Fallback: simple concatenation
      if (synonymWord.match(/[sxz]$|[cs]h$/)) {
        return synonymWord + 'es';
      }
      return synonymWord + 's';
    }
  }

  if (wordForm.type === 'noun' && (wordForm.suffix === 's' || wordForm.suffix === 'es')) {
    if (synonymWord.endsWith(wordForm.suffix)) return synonymWord;
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
async function fetchSynonymsFlat(word: string): Promise<SynonymWord[]> {
  console.log(`Fetching offline synonyms for: ${word}`);
  const entry = getOfflineSynonymEntry(word);
  const offline = entry?.synonyms?.map((synonym, idx) => ({
    word: synonym,
    score: 1000 - idx * 10,
  })) || [];

  if (offline.length >= 6) return offline;

  const data = await fetchDatamuseJson(
    `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&md=p&max=50`,
    `ml:${word}`
  );
  const fallback = data.map((item: any) => ({
    word: item.word,
    score: item.score || 0,
  }));

  const merged = new Map<string, SynonymWord>();
  [...offline, ...fallback].forEach(item => {
    if (!merged.has(item.word)) merged.set(item.word, item);
  });

  return Array.from(merged.values());
}

async function fetchDatamuseSynonyms(word: string): Promise<SynonymWord[]> {
  const stopwords = new Set(['a', 'an', 'the', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'at', 'by', 'from']);
  const data = await fetchDatamuseJson(
    `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&md=p&max=60`,
    `rel_syn:${word}`
  );
  return data
    .map((item: any, idx: number) => ({
      word: item.word,
      score: (item.score || 0) + (60 - idx) * 5,
    }))
    .filter((item: SynonymWord) => item.word && item.word.length > 2 && !stopwords.has(item.word.toLowerCase()));
}

async function fetchDatamuseRelated(word: string): Promise<SynonymWord[]> {
  const stopwords = new Set(['a', 'an', 'the', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'at', 'by', 'from']);
  const data = await fetchDatamuseJson(
    `https://api.datamuse.com/words?rel_trg=${encodeURIComponent(word)}&md=p&max=60`,
    `rel_trg:${word}`
  );
  return data
    .map((item: any, idx: number) => ({
      word: item.word,
      score: (item.score || 0) + (60 - idx) * 3,
    }))
    .filter((item: SynonymWord) => item.word && item.word.length > 2 && !stopwords.has(item.word.toLowerCase()));
}

function mapWordnetToSenses(payload: WordnetSensePayload[]): SynonymSense[] {
  return payload.map((sense) => ({
    gloss: sense.gloss,
    pos: sense.pos,
    synonyms: sense.synonyms,
    source: 'wordnet',
  }));
}

export async function fetchSynonymSenses(word: string): Promise<SynonymSense[]> {
  try {
    const candidateWords: string[] = [];
    const normalized = word.trim().toLowerCase();
    if (normalized) {
      candidateWords.push(normalized);

      if (normalized.endsWith('ies') && normalized.length > 3) {
        candidateWords.push(`${normalized.slice(0, -3)}y`);
      }

      if (normalized.endsWith('ing') && normalized.length > 4) {
        const base = normalized.slice(0, -3);
        candidateWords.push(base);
        if (!base.endsWith('e')) {
          candidateWords.push(`${base}e`);
        }
        if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
          candidateWords.push(base.slice(0, -1));
        }
      }

      if (normalized.endsWith('ed') && normalized.length > 3) {
        const base = normalized.slice(0, -2);
        candidateWords.push(base);
        if (!base.endsWith('e')) {
          candidateWords.push(`${base}e`);
        }
      }

      if (normalized.endsWith('s') && normalized.length > 2) {
        const base = normalized.endsWith('es') ? normalized.slice(0, -2) : normalized.slice(0, -1);
        candidateWords.push(base);
      }

      const verbLemma = nlp(normalized).verbs().toInfinitive().text().trim();
      if (verbLemma && verbLemma !== normalized) {
        candidateWords.push(verbLemma.toLowerCase());
      }
    }

    const uniqueCandidates = Array.from(new Set(candidateWords)).filter(Boolean);
    const wordnetSensesByKey = new Map<string, SynonymSense>();
    const wordnetCandidates: string[] = [];

    for (const candidate of uniqueCandidates) {
      const wordnet = await getWordnetSenses(candidate);
      if (!wordnet || wordnet.length === 0) continue;
      wordnetCandidates.push(candidate);
      for (const sense of mapWordnetToSenses(wordnet)) {
        const key = `${sense.gloss}::${sense.pos || ''}`;
        const existing = wordnetSensesByKey.get(key);
        if (!existing) {
          wordnetSensesByKey.set(key, {
            ...sense,
            synonyms: [...sense.synonyms],
          });
        } else {
          const merged = new Map<string, SynonymWord>();
          [...existing.synonyms, ...sense.synonyms].forEach((syn) => {
            const prev = merged.get(syn.word);
            if (!prev || syn.score > prev.score) {
              merged.set(syn.word, syn);
            }
          });
          existing.synonyms = Array.from(merged.values());
        }
      }
    }

    const applyFormToSenses = (senses: SynonymSense[]) => {
      return senses.map((sense) => {
        const wordForm = detectWordForm(word, sense.pos);
        if (!wordForm) return sense;
        const merged = new Map<string, SynonymWord>();
        sense.synonyms.forEach((syn) => {
          const adjusted = applyWordForm(syn.word, word, sense.pos);
          const existing = merged.get(adjusted);
          if (!existing || syn.score > existing.score) {
            merged.set(adjusted, { word: adjusted, score: syn.score });
          }
        });
        return {
          ...sense,
          synonyms: Array.from(merged.values()),
        };
      });
    };

    if (wordnetSensesByKey.size > 0) {
      const senses = applyFormToSenses(
        Array.from(wordnetSensesByKey.values()).map((sense) => ({
          ...sense,
          synonyms: [...sense.synonyms].sort((a, b) => b.score - a.score),
        }))
      );
      const totalSynonyms = senses.reduce((sum, sense) => sum + sense.synonyms.length, 0);
      if (totalSynonyms < 6) {
        const datamuseCandidates = Array.from(new Set([normalized, ...wordnetCandidates])).filter(Boolean);
        const [datamuseSyn, datamuseRelated] = await Promise.all([
          Promise.all(datamuseCandidates.map(fetchDatamuseSynonyms)).then((sets) => sets.flat()),
          Promise.all(datamuseCandidates.map(fetchDatamuseRelated)).then((sets) => sets.flat()),
        ]);
        const seenSyn = new Set(
          senses.flatMap(sense => sense.synonyms.map(syn => syn.word))
        );
        const extraSynonyms = datamuseSyn.filter(item => !seenSyn.has(item.word));
        const related = datamuseRelated.filter(item => !seenSyn.has(item.word));
        if (extraSynonyms.length > 0) {
          senses.push({
            gloss: 'Related meanings',
            pos: 'verb',
            synonyms: applyFormToSenses([
              {
                gloss: 'Related meanings',
                pos: 'verb',
                synonyms: extraSynonyms,
                source: 'datamuse',
              },
            ])[0].synonyms,
            source: 'datamuse',
          });
        }
        if (related.length > 0) {
          senses.push({
            gloss: 'Related words',
            pos: 'verb',
            synonyms: applyFormToSenses([
              {
                gloss: 'Related words',
                pos: 'verb',
                synonyms: related,
                source: 'datamuse',
              },
            ])[0].synonyms,
            source: 'datamuse',
          });
        }
      }
      return senses;
    }

    const fallbackSynonyms = await fetchSynonymsFlat(word);
    if (fallbackSynonyms.length === 0) return [];
    return applyFormToSenses([
      {
        gloss: 'General meaning',
        synonyms: fallbackSynonyms,
        source: 'fallback',
      },
    ]);
  } catch (error) {
    console.error('Error fetching synonym senses:', error);
    return [];
  }
}

export async function fetchSynonyms(word: string): Promise<SynonymWord[]> {
  try {
    const senses = await fetchSynonymSenses(word);
    const merged = new Map<string, SynonymWord>();
    senses.forEach((sense) => {
      sense.synonyms.forEach((syn) => {
        if (!merged.has(syn.word) || merged.get(syn.word)!.score < syn.score) {
          merged.set(syn.word, syn);
        }
      });
    });
    return Array.from(merged.values()).sort((a, b) => b.score - a.score);
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
    const offline = entry?.synonyms?.slice(0, 15).map((synonym, idx) => ({
      word: synonym,
      score: 1000 - idx * 10,
    })) || [];

    if (offline.length >= 10) return offline;

    const data = await fetchDatamuseJson(
      `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=15`,
      `ml:short:${word}`
    );
    const fallback = data.map((item: any) => ({
      word: item.word,
      score: item.score || 0,
    }));
    const merged = new Map<string, SynonymWord>();
    [...offline, ...fallback].forEach(item => {
      if (!merged.has(item.word)) merged.set(item.word, item);
    });
    return Array.from(merged.values());
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
    const offline = entry?.antonyms?.map((antonym, idx) => ({
      word: antonym,
      score: 1000 - idx * 10,
    })) || [];

    if (offline.length >= 4) return offline;

    const data = await fetchDatamuseJson(
      `https://api.datamuse.com/words?rel_ant=${encodeURIComponent(word)}&max=20`,
      `rel_ant:${word}`
    );
    const fallback = data.map((item: any) => ({
      word: item.word,
      score: item.score || 0,
    }));
    const merged = new Map<string, SynonymWord>();
    [...offline, ...fallback].forEach(item => {
      if (!merged.has(item.word)) merged.set(item.word, item);
    });
    return Array.from(merged.values());
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
    const offline = entry?.hyponyms?.map((item, idx) => ({
      word: item,
      score: 1000 - idx * 10,
    })) || [];

    if (offline.length >= 4) return offline;

    const data = await fetchDatamuseJson(
      `https://api.datamuse.com/words?rel_gen=${encodeURIComponent(word)}&max=50`,
      `rel_gen:${word}`
    );
    const fallback = data.map((item: any) => ({
      word: item.word,
      score: item.score || 0,
    }));
    const merged = new Map<string, ImageryWord>();
    [...offline, ...fallback].forEach(item => {
      if (!merged.has(item.word)) merged.set(item.word, item);
    });
    return Array.from(merged.values());
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
