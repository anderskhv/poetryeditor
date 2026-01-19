import { WordInfo } from '../types';

/**
 * Word repetition analysis result
 */
export interface RepetitionResult {
  word: string;
  count: number;
  positions: number[]; // Line numbers where the word appears
}

/**
 * Common function words to exclude from repetition analysis
 * (articles, common pronouns, common prepositions, common conjunctions)
 */
const FUNCTION_WORDS = new Set([
  // Articles
  'a', 'an', 'the',
  // Common pronouns
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
  'this', 'that', 'these', 'those',
  // Common prepositions
  'in', 'on', 'at', 'by', 'for', 'with', 'from', 'to', 'of', 'about', 'as',
  // Common conjunctions
  'and', 'or', 'but', 'so', 'yet', 'nor',
  // Common verbs
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am',
  'have', 'has', 'had', 'do', 'does', 'did',
]);

/**
 * Analyze word repetition in the text
 * Returns words that appear 3+ times (excluding common function words)
 */
export function analyzeRepetition(words: WordInfo[]): RepetitionResult[] {
  const wordCounts = new Map<string, { count: number; positions: number[] }>();

  words.forEach(word => {
    const lower = word.word.toLowerCase();

    // Skip function words
    if (FUNCTION_WORDS.has(lower)) {
      return;
    }

    if (!wordCounts.has(lower)) {
      wordCounts.set(lower, { count: 0, positions: [] });
    }

    const data = wordCounts.get(lower)!;
    data.count++;
    // Store 1-indexed line numbers for display
    if (!data.positions.includes(word.lineIndex + 1)) {
      data.positions.push(word.lineIndex + 1);
    }
  });

  // Filter to words that appear 3+ times and sort by count (descending)
  const results: RepetitionResult[] = [];
  wordCounts.forEach((data, word) => {
    if (data.count >= 3) {
      results.push({
        word,
        count: data.count,
        positions: data.positions.sort((a, b) => a - b),
      });
    }
  });

  // Sort by count (descending), then alphabetically
  return results.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.word.localeCompare(b.word);
  });
}
