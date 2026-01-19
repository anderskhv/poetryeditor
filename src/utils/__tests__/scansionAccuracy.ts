/**
 * Scansion Accuracy Test Suite
 *
 * Tests our scansion analyzer against a corpus of 100+ lines with
 * expert-annotated stress patterns from classic English poetry.
 *
 * Annotation format:
 * - u = unstressed syllable
 * - / = stressed syllable
 *
 * Run with: npx tsx src/utils/__tests__/scansionAccuracy.ts
 */

// We need to load the CMU dictionary first
import { injectDictionary, isDictionaryLoaded, type Pronunciation } from '../cmuDict';
import { analyzeScansion } from '../scansionAnalyzer';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Parse the CMU dictionary text format (for CLI loading)
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

interface AnnotatedLine {
  line: string;
  expectedPattern: string;
  source: string;
  notes?: string;
}

/**
 * Corpus of lines with expert-annotated scansion patterns
 * Sources: classic poetry with well-established metrical analysis
 *
 * Key: We normalize patterns to match syllable count, so "u/" means
 * the word has 2 syllables: first unstressed, second stressed.
 */
const annotatedCorpus: AnnotatedLine[] = [
  // ========== SHAKESPEARE SONNETS (Iambic Pentameter) ==========
  // Sonnet 18
  { line: "Shall I compare thee to a summer's day?", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "Thou art more lovely and more temperate:", expectedPattern: "u/u/uu/u/u", source: "Shakespeare Sonnet 18" },
  { line: "Rough winds do shake the darling buds of May,", expectedPattern: "/uu/u/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "And summer's lease hath all too short a date:", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "Sometime too hot the eye of heaven shines,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "And often is his gold complexion dimmed,", expectedPattern: "u/uu/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "And every fair from fair sometime declines,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "By chance, or nature's changing course untrimmed:", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "But thy eternal summer shall not fade,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "Nor lose possession of that fair thou ow'st,", expectedPattern: "u/u/uu/u/", source: "Shakespeare Sonnet 18" },
  { line: "Nor shall death brag thou wand'rest in his shade,", expectedPattern: "u//u/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "When in eternal lines to time thou grow'st,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "So long as men can breathe, or eyes can see,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "So long lives this, and this gives life to thee.", expectedPattern: "u//uu/u/u/", source: "Shakespeare Sonnet 18" },

  // Sonnet 116 (iambic pentameter = 10 syllables per line)
  { line: "Let me not to the marriage of true minds", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 116" },
  { line: "Admit impediments. Love is not love", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 116" },
  { line: "Which alters when it alteration finds,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 116" },
  { line: "Or bends with the remover to remove:", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 116" },
  { line: "O no! it is an ever-fixed mark", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 116" },
  { line: "That looks on tempests and is never shaken;", expectedPattern: "u/u/u/u/u/u", source: "Shakespeare Sonnet 116" },
  { line: "It is the star to every wandering bark,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 116" },
  { line: "Love's not Time's fool, though rosy lips and cheeks", expectedPattern: "//u/u/u/u/", source: "Shakespeare Sonnet 116" },
  { line: "Within his bending sickle's compass come:", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 116" },
  { line: "Love alters not with his brief hours and weeks,", expectedPattern: "/u/u/u/u/u/", source: "Shakespeare Sonnet 116" },
  { line: "But bears it out even to the edge of doom.", expectedPattern: "u/u/u/u/u/u", source: "Shakespeare Sonnet 116" },
  { line: "If this be error and upon me proved,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 116" },
  { line: "I never writ, nor no man ever loved.", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 116" },

  // Sonnet 29
  { line: "When in disgrace with fortune and men's eyes", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 29" },
  { line: "I all alone beweep my outcast state,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 29" },
  { line: "And trouble deaf heaven with my bootless cries,", expectedPattern: "u/u/u/uu/u/", source: "Shakespeare Sonnet 29" },
  { line: "And look upon myself, and curse my fate,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 29" },
  { line: "Wishing me like to one more rich in hope,", expectedPattern: "/uu/u/u/u/", source: "Shakespeare Sonnet 29" },
  { line: "Featured like him, like him with friends possessed,", expectedPattern: "/uu/u/u/u/", source: "Shakespeare Sonnet 29" },
  { line: "Desiring this man's art, and that man's scope,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 29" },
  { line: "With what I most enjoy contented least;", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 29" },
  { line: "Yet in these thoughts my self almost despising,", expectedPattern: "u/u/u/u/u/u", source: "Shakespeare Sonnet 29" },
  { line: "Haply I think on thee, and then my state,", expectedPattern: "/uu/u/u/u/", source: "Shakespeare Sonnet 29" },
  { line: "Like to the lark at break of day arising", expectedPattern: "/uu/u/u/u/u", source: "Shakespeare Sonnet 29" },
  { line: "From sullen earth, sings hymns at heaven's gate;", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 29" },
  { line: "For thy sweet love remembered such wealth brings", expectedPattern: "u/u/u/uu/u/", source: "Shakespeare Sonnet 29" },
  { line: "That then I scorn to change my state with kings.", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 29" },

  // ========== MILTON - Paradise Lost (Blank Verse Iambic Pentameter = 10 syllables) ==========
  { line: "Of Man's first disobedience, and the fruit", expectedPattern: "u/u/u/u/u/", source: "Milton Paradise Lost" },
  { line: "Of that forbidden tree whose mortal taste", expectedPattern: "u/u/u/u/u/", source: "Milton Paradise Lost" },
  { line: "Brought death into the World, and all our woe,", expectedPattern: "/u/u/u/u/u/", source: "Milton Paradise Lost" },
  { line: "With loss of Eden, till one greater Man", expectedPattern: "u/u/u/u/u/", source: "Milton Paradise Lost" },
  { line: "Restore us, and regain the blissful seat,", expectedPattern: "u/u/u/u/u/", source: "Milton Paradise Lost" },
  { line: "Sing, Heavenly Muse, that, on the secret top", expectedPattern: "/u/u/u/u/u/", source: "Milton Paradise Lost" },
  { line: "Of Oreb, or of Sinai, didst inspire", expectedPattern: "u/u/u/u/u/", source: "Milton Paradise Lost" },
  { line: "That shepherd who first taught the chosen seed", expectedPattern: "u/u/u/u/u/", source: "Milton Paradise Lost" },

  // ========== POE - The Raven (Trochaic Octameter) ==========
  { line: "Once upon a midnight dreary, while I pondered, weak and weary,", expectedPattern: "/uu/u/u/uu/u/u/u", source: "Poe The Raven" },
  { line: "Over many a quaint and curious volume of forgotten lore—", expectedPattern: "/u/uu/u/u/uu/u/", source: "Poe The Raven" },
  { line: "While I nodded, nearly napping, suddenly there came a tapping,", expectedPattern: "/u/u/u/uu/uu/u/u", source: "Poe The Raven" },
  { line: "As of some one gently rapping, rapping at my chamber door.", expectedPattern: "/u/u/u/u/uu/u/", source: "Poe The Raven" },
  { line: "Deep into that darkness peering, long I stood there wondering, fearing,", expectedPattern: "/uu/u/u/u/u/u/u/u", source: "Poe The Raven" },
  { line: "Doubting, dreaming dreams no mortal ever dared to dream before;", expectedPattern: "/u/u/u/u/u/u/u/", source: "Poe The Raven" },
  { line: "But the silence was unbroken, and the stillness gave no token,", expectedPattern: "/u/u/u/u/u/u/u/u", source: "Poe The Raven" },
  { line: "And the only word there spoken was the whispered word, \"Lenore?\"", expectedPattern: "/u/u/u/u/u/u/u/", source: "Poe The Raven" },

  // ========== WORDSWORTH - I Wandered Lonely as a Cloud (Iambic Tetrameter) ==========
  { line: "I wandered lonely as a cloud", expectedPattern: "u/u/uu/", source: "Wordsworth Daffodils" },
  { line: "That floats on high o'er vales and hills,", expectedPattern: "u/u/u/u/", source: "Wordsworth Daffodils" },
  { line: "When all at once I saw a crowd,", expectedPattern: "u/u/u/u/", source: "Wordsworth Daffodils" },
  { line: "A host, of golden daffodils;", expectedPattern: "u/u/u/u/", source: "Wordsworth Daffodils" },
  { line: "Beside the lake, beneath the trees,", expectedPattern: "u/u/u/u/", source: "Wordsworth Daffodils" },
  { line: "Fluttering and dancing in the breeze.", expectedPattern: "/uu/uu/u/", source: "Wordsworth Daffodils" },
  { line: "Continuous as the stars that shine", expectedPattern: "u/uuu/u/", source: "Wordsworth Daffodils" },
  { line: "And twinkle on the milky way,", expectedPattern: "u/uu/u/", source: "Wordsworth Daffodils" },

  // ========== DYLAN THOMAS - Do Not Go Gentle (Villanelle - Iambic Pentameter = 10 syllables) ==========
  { line: "Do not go gentle into that good night,", expectedPattern: "u/u/u/u/u/", source: "Thomas Villanelle" },
  { line: "Old age should burn and rave at close of day;", expectedPattern: "u/u/u/u/u/", source: "Thomas Villanelle" },
  { line: "Rage, rage against the dying of the light.", expectedPattern: "//u/u/u/u/", source: "Thomas Villanelle" },
  { line: "Though wise men at their end know dark is right,", expectedPattern: "u/u/u/u/u/", source: "Thomas Villanelle" },
  { line: "Because their words had forked no lightning they", expectedPattern: "u/u/u/u/u/", source: "Thomas Villanelle" },
  { line: "Good men, the last wave by, crying how bright", expectedPattern: "//u/u/u/u/", source: "Thomas Villanelle" },
  { line: "Their frail deeds might have danced in a green bay,", expectedPattern: "u/u/u/u/u/", source: "Thomas Villanelle" },
  { line: "Wild men who caught and sang the sun in flight,", expectedPattern: "//u/u/u/u/", source: "Thomas Villanelle" },
  { line: "And learn, too late, they grieved it on its way,", expectedPattern: "u/u/u/u/u/", source: "Thomas Villanelle" },
  { line: "Grave men, near death, who see with blinding sight", expectedPattern: "//u/u/u/u/", source: "Thomas Villanelle" },
  { line: "Blind eyes could blaze like meteors and be gay,", expectedPattern: "//u/u/u/u/", source: "Thomas Villanelle" },

  // ========== KEATS - Ode to a Nightingale (Iambic Pentameter = 10 syllables) ==========
  { line: "My heart aches, and a drowsy numbness pains", expectedPattern: "u/u/u/u/u/", source: "Keats Nightingale" },
  { line: "My sense, as though of hemlock I had drunk,", expectedPattern: "u/u/u/u/u/", source: "Keats Nightingale" },
  { line: "Or emptied some dull opiate to the drains", expectedPattern: "u/u/u/u/u/", source: "Keats Nightingale" },
  { line: "One minute past, and Lethe-wards had sunk:", expectedPattern: "u/u/u/u/u/", source: "Keats Nightingale" },
  { line: "'Tis not through envy of thy happy lot,", expectedPattern: "u/u/u/u/u/", source: "Keats Nightingale" },
  { line: "But being too happy in thine happiness,—", expectedPattern: "u/u/u/u/u/", source: "Keats Nightingale" },
  { line: "That thou, light-wingèd Dryad of the trees,", expectedPattern: "u/u/u/u/u/", source: "Keats Nightingale" },
  { line: "In some melodious plot", expectedPattern: "u/u/u/", source: "Keats Nightingale" },

  // ========== FROST - The Road Not Taken (Iambic Tetrameter) ==========
  { line: "Two roads diverged in a yellow wood,", expectedPattern: "u/u/uu/u/", source: "Frost Roads" },
  { line: "And sorry I could not travel both", expectedPattern: "u/uu/u/u/", source: "Frost Roads" },
  { line: "And be one traveler, long I stood", expectedPattern: "u/u/uu/u/", source: "Frost Roads" },
  { line: "And looked down one as far as I could", expectedPattern: "u/u/uu/u/", source: "Frost Roads" },
  { line: "To where it bent in the undergrowth;", expectedPattern: "u/u/uu/u/", source: "Frost Roads" },
  { line: "Then took the other, as just as fair,", expectedPattern: "u/u/uu/u/", source: "Frost Roads" },
  { line: "And having perhaps the better claim,", expectedPattern: "u/u/uu/u/", source: "Frost Roads" },
  { line: "Because it was grassy and wanted wear;", expectedPattern: "u/u/u/uu/u/", source: "Frost Roads" },
  { line: "I shall be telling this with a sigh", expectedPattern: "u/u/uu/u/", source: "Frost Roads" },
  { line: "Somewhere ages and ages hence:", expectedPattern: "u//uu/u/", source: "Frost Roads" },

  // ========== DICKINSON - Because I could not stop for Death (Common Meter) ==========
  { line: "Because I could not stop for Death –", expectedPattern: "u/u/u/u/", source: "Dickinson Death" },
  { line: "He kindly stopped for me –", expectedPattern: "u/u/u/", source: "Dickinson Death" },
  { line: "The Carriage held but just Ourselves –", expectedPattern: "u/u/u/u/", source: "Dickinson Death" },
  { line: "And Immortality.", expectedPattern: "uu/u/", source: "Dickinson Death" },
  { line: "We slowly drove – He knew no haste", expectedPattern: "u/u/u/u/", source: "Dickinson Death" },
  { line: "And I had put away", expectedPattern: "u/u/u/", source: "Dickinson Death" },
  { line: "My labor and my leisure too,", expectedPattern: "u/uu/u/", source: "Dickinson Death" },
  { line: "For His Civility –", expectedPattern: "u/u/u/", source: "Dickinson Death" },

  // ========== TENNYSON - The Charge of the Light Brigade (Dactylic Dimeter) ==========
  { line: "Half a league, half a league,", expectedPattern: "/uu/uu/", source: "Tennyson Light Brigade" },
  { line: "Half a league onward,", expectedPattern: "/uu/u", source: "Tennyson Light Brigade" },
  { line: "All in the valley of Death", expectedPattern: "/uu/uuu/", source: "Tennyson Light Brigade" },
  { line: "Rode the six hundred.", expectedPattern: "/u/u/u", source: "Tennyson Light Brigade" },
  { line: "\"Forward, the Light Brigade!\"", expectedPattern: "/uu/u/", source: "Tennyson Light Brigade" },
  { line: "\"Charge for the guns!\" he said.", expectedPattern: "/uu/u/", source: "Tennyson Light Brigade" },
  { line: "Into the valley of Death", expectedPattern: "/uu/uuu/", source: "Tennyson Light Brigade" },
  { line: "Rode the six hundred.", expectedPattern: "/u/u/u", source: "Tennyson Light Brigade" },

  // ========== BROWNING - My Last Duchess (Iambic Pentameter) ==========
  { line: "That's my last Duchess painted on the wall,", expectedPattern: "/u//u/uu/", source: "Browning Duchess" },
  { line: "Looking as if she were alive. I call", expectedPattern: "/uu/u/u/u/", source: "Browning Duchess" },
  { line: "That piece a wonder, now; Fra Pandolf's hands", expectedPattern: "u/u/u/u/u/", source: "Browning Duchess" },
  { line: "Worked busily a day, and there she stands.", expectedPattern: "//uu/u/u/", source: "Browning Duchess" },
  { line: "Will't please you sit and look at her? I said", expectedPattern: "u/u/u/u/u/", source: "Browning Duchess" },
  { line: "\"Fra Pandolf\" by design, for never read", expectedPattern: "u/uu/u/u/", source: "Browning Duchess" },
  { line: "Strangers like you that pictured countenance,", expectedPattern: "/uu/u/u/u", source: "Browning Duchess" },
  { line: "The depth and passion of its earnest glance,", expectedPattern: "u/u/uu/u/", source: "Browning Duchess" },

  // ========== COLERIDGE - Kubla Khan (Mixed meter, mostly iambic) ==========
  { line: "In Xanadu did Kubla Khan", expectedPattern: "u/uu/u/", source: "Coleridge Kubla Khan" },
  { line: "A stately pleasure-dome decree:", expectedPattern: "u/u/u/u/", source: "Coleridge Kubla Khan" },
  { line: "Where Alph, the sacred river, ran", expectedPattern: "u/u/u/u/", source: "Coleridge Kubla Khan" },
  { line: "Through caverns measureless to man", expectedPattern: "u/u/uuu/", source: "Coleridge Kubla Khan" },
  { line: "Down to a sunless sea.", expectedPattern: "/uu/u/", source: "Coleridge Kubla Khan" },
  { line: "So twice five miles of fertile ground", expectedPattern: "u/u/u/u/", source: "Coleridge Kubla Khan" },
  { line: "With walls and towers were girdled round:", expectedPattern: "u/u/u/u/", source: "Coleridge Kubla Khan" },

  // ========== SINGLE WORD TESTS (known stress patterns) ==========
  { line: "compare", expectedPattern: "u/", source: "Single word test", notes: "verb, 2nd syllable stressed" },
  { line: "record", expectedPattern: "/u", source: "Single word test", notes: "noun form" },
  { line: "record", expectedPattern: "u/", source: "Single word test - verb", notes: "verb form - AMBIGUOUS" },
  { line: "beautiful", expectedPattern: "/uu", source: "Single word test" },
  { line: "desperately", expectedPattern: "/uuu", source: "Single word test" },
  { line: "remember", expectedPattern: "u/u", source: "Single word test" },
  { line: "forever", expectedPattern: "u/u", source: "Single word test" },
  { line: "photography", expectedPattern: "u/uu", source: "Single word test" },
  { line: "photographer", expectedPattern: "u/uu", source: "Single word test" },
  { line: "photographic", expectedPattern: "/u/u", source: "Single word test" },
];

interface TestResult {
  line: string;
  source: string;
  expected: string;
  actual: string;
  match: boolean;
  syllableCountMatch: boolean;
  partialMatch: number; // 0-1, percentage of syllables that match
  notes?: string;
}

interface AccuracyReport {
  totalLines: number;
  exactMatches: number;
  exactMatchRate: number;
  syllableCountMatches: number;
  syllableCountMatchRate: number;
  averagePartialMatch: number;
  results: TestResult[];
  failurePatterns: Map<string, number>;
  bySource: Map<string, { total: number; matches: number }>;
}

function calculatePartialMatch(expected: string, actual: string): number {
  if (expected.length === 0 || actual.length === 0) return 0;

  // Pad the shorter one
  const maxLen = Math.max(expected.length, actual.length);
  const e = expected.padEnd(maxLen, '?');
  const a = actual.padEnd(maxLen, '?');

  let matches = 0;
  for (let i = 0; i < maxLen; i++) {
    if (e[i] === a[i]) matches++;
  }

  return matches / maxLen;
}

function categorizeFailure(expected: string, actual: string, line: string): string {
  // Identify what kind of error this is
  if (expected.length !== actual.length) {
    return `syllable_count_mismatch (expected ${expected.length}, got ${actual.length})`;
  }

  // Check for specific patterns
  const words = line.toLowerCase().split(/\s+/);

  // Check for heteronym issues (record, object, etc.)
  const heteronyms = ['record', 'object', 'present', 'conduct', 'contract', 'desert',
                      'produce', 'project', 'rebel', 'refuse', 'subject', 'suspect'];
  for (const word of words) {
    if (heteronyms.includes(word.replace(/[^a-z]/g, ''))) {
      return `heteronym_ambiguity (${word})`;
    }
  }

  // Check for function word stress differences
  const functionWords = ['the', 'a', 'an', 'to', 'of', 'in', 'on', 'at', 'by', 'for',
                         'with', 'and', 'but', 'or', 'as', 'if', 'i', 'you', 'he', 'she',
                         'we', 'they', 'it', 'my', 'your', 'his', 'her', 'our', 'their'];
  let hasFunctionWordDiff = false;
  let pos = 0;
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (functionWords.includes(cleanWord) && pos < expected.length && pos < actual.length) {
      if (expected[pos] !== actual[pos]) {
        hasFunctionWordDiff = true;
        break;
      }
    }
    // This is approximate - we don't have exact syllable counts here
    pos += Math.max(1, cleanWord.length > 3 ? 2 : 1);
  }

  if (hasFunctionWordDiff) {
    return 'function_word_stress';
  }

  // Check for compound word issues
  if (line.includes('-')) {
    return 'compound_word';
  }

  // Check for archaic/poetic words
  const archaicWords = ['thee', 'thou', 'thy', 'doth', 'hath', 'whilst', 'tis', 'twas'];
  for (const word of words) {
    if (archaicWords.includes(word.replace(/[^a-z\']/g, ''))) {
      return 'archaic_word';
    }
  }

  return 'general_stress_error';
}

async function runAccuracyTest(): Promise<AccuracyReport> {
  const results: TestResult[] = [];
  const failurePatterns = new Map<string, number>();
  const bySource = new Map<string, { total: number; matches: number }>();

  console.log('Running scansion accuracy test...\n');
  console.log(`Testing ${annotatedCorpus.length} annotated lines\n`);

  for (const item of annotatedCorpus) {
    const analysis = analyzeScansion(item.line);
    const actualPattern = analysis.lines[0]?.fullPattern || '';

    const match = actualPattern === item.expectedPattern;
    const syllableCountMatch = actualPattern.length === item.expectedPattern.length;
    const partialMatch = calculatePartialMatch(item.expectedPattern, actualPattern);

    const result: TestResult = {
      line: item.line,
      source: item.source,
      expected: item.expectedPattern,
      actual: actualPattern,
      match,
      syllableCountMatch,
      partialMatch,
      notes: item.notes,
    };

    results.push(result);

    // Track by source
    if (!bySource.has(item.source)) {
      bySource.set(item.source, { total: 0, matches: 0 });
    }
    const sourceStats = bySource.get(item.source)!;
    sourceStats.total++;
    if (match) sourceStats.matches++;

    // Track failure patterns
    if (!match) {
      const failureType = categorizeFailure(item.expectedPattern, actualPattern, item.line);
      failurePatterns.set(failureType, (failurePatterns.get(failureType) || 0) + 1);
    }
  }

  const exactMatches = results.filter(r => r.match).length;
  const syllableCountMatches = results.filter(r => r.syllableCountMatch).length;
  const averagePartialMatch = results.reduce((sum, r) => sum + r.partialMatch, 0) / results.length;

  return {
    totalLines: results.length,
    exactMatches,
    exactMatchRate: exactMatches / results.length,
    syllableCountMatches,
    syllableCountMatchRate: syllableCountMatches / results.length,
    averagePartialMatch,
    results,
    failurePatterns,
    bySource,
  };
}

function printReport(report: AccuracyReport): void {
  console.log('='.repeat(80));
  console.log('SCANSION ACCURACY REPORT');
  console.log('='.repeat(80));
  console.log();

  console.log('OVERALL METRICS:');
  console.log('-'.repeat(40));
  console.log(`Total lines tested:        ${report.totalLines}`);
  console.log(`Exact matches:             ${report.exactMatches} (${(report.exactMatchRate * 100).toFixed(1)}%)`);
  console.log(`Syllable count matches:    ${report.syllableCountMatches} (${(report.syllableCountMatchRate * 100).toFixed(1)}%)`);
  console.log(`Average partial match:     ${(report.averagePartialMatch * 100).toFixed(1)}%`);
  console.log();

  console.log('ACCURACY BY SOURCE:');
  console.log('-'.repeat(40));
  const sortedSources = Array.from(report.bySource.entries())
    .sort((a, b) => a[1].matches / a[1].total - b[1].matches / b[1].total);

  for (const [source, stats] of sortedSources) {
    const rate = (stats.matches / stats.total * 100).toFixed(0);
    const bar = '█'.repeat(Math.round(stats.matches / stats.total * 20));
    console.log(`${source.padEnd(30)} ${stats.matches}/${stats.total} (${rate.padStart(3)}%) ${bar}`);
  }
  console.log();

  console.log('FAILURE PATTERN ANALYSIS:');
  console.log('-'.repeat(40));
  const sortedFailures = Array.from(report.failurePatterns.entries())
    .sort((a, b) => b[1] - a[1]);

  for (const [pattern, count] of sortedFailures) {
    const percentage = (count / (report.totalLines - report.exactMatches) * 100).toFixed(1);
    console.log(`${pattern.padEnd(45)} ${count} (${percentage}% of failures)`);
  }
  console.log();

  console.log('SAMPLE FAILURES (first 20):');
  console.log('-'.repeat(80));
  const failures = report.results.filter(r => !r.match).slice(0, 20);

  for (const failure of failures) {
    console.log(`Line:     "${failure.line}"`);
    console.log(`Source:   ${failure.source}`);
    console.log(`Expected: ${failure.expected}`);
    console.log(`Actual:   ${failure.actual}`);
    console.log(`Match:    ${(failure.partialMatch * 100).toFixed(0)}%`);
    if (failure.notes) console.log(`Notes:    ${failure.notes}`);
    console.log();
  }

  console.log('='.repeat(80));
  console.log('RECOMMENDATIONS:');
  console.log('='.repeat(80));

  // Analyze what improvements would help most
  const syllableCountErrors = report.totalLines - report.syllableCountMatches;
  const stressErrors = report.syllableCountMatches - report.exactMatches;

  console.log();
  console.log(`1. Syllable counting errors: ${syllableCountErrors} lines`);
  console.log(`   - These are fundamental errors where we're splitting words incorrectly`);
  console.log(`   - Consider improving CMU dictionary coverage or syllable heuristics`);
  console.log();
  console.log(`2. Stress assignment errors (correct syllable count): ${stressErrors} lines`);
  console.log(`   - These are the main target for POS tagging improvements`);
  console.log();

  // Check if heteronyms are a significant issue
  const heteronymErrors = report.failurePatterns.get('heteronym_ambiguity') || 0;
  if (heteronymErrors > 0) {
    console.log(`3. Heteronym ambiguity: ${heteronymErrors} failures`);
    console.log(`   - Words like "record", "object" need context to determine stress`);
    console.log(`   - POS tagging would help distinguish noun vs verb forms`);
    console.log();
  }

  const functionWordErrors = report.failurePatterns.get('function_word_stress') || 0;
  if (functionWordErrors > 0) {
    console.log(`4. Function word stress: ${functionWordErrors} failures`);
    console.log(`   - Words like "the", "I", "my" can be stressed or unstressed in meter`);
    console.log(`   - Current constraint system may need tuning`);
    console.log();
  }
}

async function main() {
  // Load CMU dictionary first - try multiple possible locations
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'cmudict.dict'),
    path.join(process.cwd(), 'public', 'cmudict.txt'),
    path.join(process.cwd(), 'cmudict.dict'),
  ];

  console.log('Loading CMU dictionary...');
  let loaded = false;
  for (const dictPath of possiblePaths) {
    if (fs.existsSync(dictPath)) {
      console.log(`Found dictionary at: ${dictPath}`);
      const dictContent = fs.readFileSync(dictPath, 'utf-8');
      const dict = parseCMUDict(dictContent);
      injectDictionary(dict);
      console.log(`CMU dictionary loaded: ${isDictionaryLoaded()} (${dict.size} entries)`);
      loaded = true;
      break;
    }
  }
  if (!loaded) {
    console.log('Warning: CMU dictionary not found, using heuristics only');
    console.log('Searched paths:', possiblePaths.join(', '));
  }
  console.log();

  const report = await runAccuracyTest();
  printReport(report);

  // Write detailed results to file
  const outputPath = path.join(process.cwd(), 'scansion-accuracy-report.json');
  const jsonReport = {
    timestamp: new Date().toISOString(),
    metrics: {
      totalLines: report.totalLines,
      exactMatches: report.exactMatches,
      exactMatchRate: report.exactMatchRate,
      syllableCountMatches: report.syllableCountMatches,
      syllableCountMatchRate: report.syllableCountMatchRate,
      averagePartialMatch: report.averagePartialMatch,
    },
    failurePatterns: Object.fromEntries(report.failurePatterns),
    bySource: Object.fromEntries(
      Array.from(report.bySource.entries()).map(([k, v]) => [k, v])
    ),
    results: report.results,
  };

  fs.writeFileSync(outputPath, JSON.stringify(jsonReport, null, 2));
  console.log(`\nDetailed results written to: ${outputPath}`);
}

main().catch(console.error);
