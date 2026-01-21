import nlp from 'compromise';
import { WordInfo, POSCategory } from '../types';
import { countSyllables } from './syllableCounter';

// Poetry-specific overrides - words that need special handling beyond standard NLP
const POETIC_OVERRIDES = new Map<string, POSCategory>([
  // Archaic pronouns (not in modern NLP libraries)
  ['thee', 'Pronoun'],
  ['thou', 'Pronoun'],
  ['thy', 'Pronoun'],
  ['thine', 'Pronoun'],
  ['thyself', 'Pronoun'],
  ['ye', 'Pronoun'],

  // Archaic verbs
  ['hath', 'Verb'],
  ['doth', 'Verb'],
  ['art', 'Verb'],
  ['wert', 'Verb'],
  ['shalt', 'Verb'],
  ['wouldst', 'Verb'],
  ['couldst', 'Verb'],

  // Archaic prepositions/conjunctions
  ['unto', 'Preposition'],
  ['whilst', 'Conjunction'],
  ['ere', 'Conjunction'],

  // Modal verbs that compromise.js sometimes misses
  ['can', 'Verb'],
  ['could', 'Verb'],
  ['may', 'Verb'],
  ['might', 'Verb'],
  ['must', 'Verb'],
  ['shall', 'Verb'],
  ['should', 'Verb'],
  ['will', 'Verb'],
  ['would', 'Verb'],

  // Poetry-specific participial adjectives that should always be adjectives
  ['frozen', 'Adjective'],
  ['broken', 'Adjective'],
  ['forgotten', 'Adjective'],
  ['beloved', 'Adjective'],
  ['blessed', 'Adjective'],

  // -ly words that are adjectives, not adverbs
  ['lovely', 'Adjective'],
  ['lonely', 'Adjective'],
  ['holy', 'Adjective'],
  ['chilly', 'Adjective'],
  ['silly', 'Adjective'],
  ['comely', 'Adjective'],
  ['goodly', 'Adjective'],

]);

/**
 * Map compromise.js tags to our POSCategory types
 */
function mapCompromiseTag(doc: any): POSCategory {
  // Check each POS category in priority order
  if (doc.match('#Verb').found) return 'Verb';
  if (doc.match('#Adjective').found) return 'Adjective';
  if (doc.match('#Noun').found) return 'Noun';
  if (doc.match('#Adverb').found) return 'Adverb';
  if (doc.match('#Pronoun').found) return 'Pronoun';
  if (doc.match('#Preposition').found) return 'Preposition';
  if (doc.match('#Conjunction').found) return 'Conjunction';
  if (doc.match('#Article').found) return 'Article';

  // Default to Noun for unknown words
  return 'Noun';
}

/**
 * Determine the part of speech for a word using compromise.js with context
 */
function getPOS(word: string, sentence: string, wordIndex: number): POSCategory {
  const lower = word.toLowerCase();

  // 1. Check poetry-specific overrides first
  if (POETIC_OVERRIDES.has(lower)) {
    return POETIC_OVERRIDES.get(lower)!;
  }

  // 2. Handle hyphenated compound adjectives (common in poetry)
  // Includes regular hyphen, en-dash, and em-dash
  if (lower.includes('-') || lower.includes('\u2013') || lower.includes('\u2014')) {
    return 'Adjective';
  }

  // 3. Use compromise.js with full sentence context
  const doc = nlp(sentence);
  const terms = doc.terms().out('array');

  // Find the matching term by position
  if (wordIndex < terms.length) {
    const termDoc = doc.terms().eq(wordIndex);
    return mapCompromiseTag(termDoc);
  }

  // Fallback to single word analysis
  return mapCompromiseTag(nlp(word));
}

/**
 * Analyze text and extract word information with POS tags
 */
export function analyzeText(text: string): WordInfo[] {
  const words: WordInfo[] = [];
  const lines = text.split('\n');

  let globalOffset = 0;

  lines.forEach((line, lineIndex) => {
    // Use regex with matchAll to get exact positions of each word
    const wordRegex = /[a-zA-Z]+(?:[''\u2019][a-zA-Z]+|[-\u2013\u2014][a-zA-Z]+)?/g;
    const matches = Array.from(line.matchAll(wordRegex));

    // Analyze the entire line for context
    matches.forEach((match, wordIndex) => {
      const word = match[0];
      const startOffset = match.index!;
      const endOffset = startOffset + word.length;

      words.push({
        word,
        pos: getPOS(word, line, wordIndex),
        syllables: countSyllables(word),
        lineIndex,
        startOffset: globalOffset + startOffset,
        endOffset: globalOffset + endOffset,
      });
    });

    globalOffset += line.length + 1; // +1 for newline
  });

  return words;
}

/**
 * Get POS distribution counts
 */
export function getPOSDistribution(words: WordInfo[]): Record<string, number> {
  const distribution: Record<string, number> = {
    Noun: 0,
    Verb: 0,
    Adjective: 0,
    Adverb: 0,
    Pronoun: 0,
    Conjunction: 0,
    Preposition: 0,
    Article: 0,
    Other: 0,
  };

  words.forEach(word => {
    distribution[word.pos] = (distribution[word.pos] || 0) + 1;
  });

  return distribution;
}

/**
 * Get words by line for analysis
 */
export function getWordsByLine(words: WordInfo[]): WordInfo[][] {
  const byLine: WordInfo[][] = [];

  words.forEach(word => {
    if (!byLine[word.lineIndex]) {
      byLine[word.lineIndex] = [];
    }
    byLine[word.lineIndex].push(word);
  });

  return byLine;
}
