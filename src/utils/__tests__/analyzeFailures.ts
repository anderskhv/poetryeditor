/**
 * Detailed failure analysis to identify improvement opportunities
 */

import { classifyPoem, scanLineWithMeter, PoemClassification } from '../poemMeterClassifier';
import { injectDictionary, Pronunciation, getStressPattern } from '../cmuDict';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface AnnotatedLine {
  line: string;
  expectedPattern: string;
  source: string;
}

// Comprehensive test data covering various failure modes
const TEST_DATA: AnnotatedLine[] = [
  // IAMBIC PENTAMETER - Shakespeare
  { line: "Shall I compare thee to a summer's day?", expectedPattern: "u/u/u/u/u/", source: "Shakespeare 18" },
  { line: "Thou art more lovely and more temperate:", expectedPattern: "u/u/uu/u/u/", source: "Shakespeare 18" },
  { line: "Rough winds do shake the darling buds of May,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare 18" },
  { line: "And summer's lease hath all too short a date:", expectedPattern: "u/u/u/u/u/", source: "Shakespeare 18" },
  { line: "Sometime too hot the eye of heaven shines,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare 18" },
  { line: "And often is his gold complexion dimm'd;", expectedPattern: "u/u/u/u/u/", source: "Shakespeare 18" },
  { line: "Let me not to the marriage of true minds", expectedPattern: "u/u/u/u/u/", source: "Shakespeare 116" },
  { line: "Admit impediments. Love is not love", expectedPattern: "u/u/u/u/u/", source: "Shakespeare 116" },
  { line: "Which alters when it alteration finds,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare 116" },
  { line: "Or bends with the remover to remove.", expectedPattern: "u/u/u/u/u/", source: "Shakespeare 116" },

  // IAMBIC PENTAMETER - Milton
  { line: "Of Man's first disobedience, and the fruit", expectedPattern: "u/u/u/u/u/", source: "Milton" },
  { line: "Of that forbidden tree whose mortal taste", expectedPattern: "u/u/u/u/u/", source: "Milton" },
  { line: "Brought death into the World, and all our woe,", expectedPattern: "u/u/u/u/u/", source: "Milton" },

  // IAMBIC TETRAMETER - Frost
  { line: "Two roads diverged in a yellow wood,", expectedPattern: "u/u/u/u/u", source: "Frost Road" },
  { line: "And sorry I could not travel both", expectedPattern: "u/uu/u/u/", source: "Frost Road" },
  { line: "Whose woods these are I think I know.", expectedPattern: "u/u/u/u/", source: "Frost Stopping" },
  { line: "His house is in the village though;", expectedPattern: "u/u/u/u/", source: "Frost Stopping" },
  { line: "He will not see me stopping here", expectedPattern: "u/u/u/u/", source: "Frost Stopping" },
  { line: "To watch his woods fill up with snow.", expectedPattern: "u/u/u/u/", source: "Frost Stopping" },

  // TROCHAIC - Poe
  { line: "Once upon a midnight dreary, while I pondered, weak and weary,", expectedPattern: "/u/u/u/u/u/u/u/u", source: "Poe Raven" },

  // DYLAN THOMAS - Villanelle
  { line: "Do not go gentle into that good night,", expectedPattern: "u/u/u/u/u/", source: "Thomas" },
  { line: "Old age should burn and rave at close of day;", expectedPattern: "u/u/u/u/u/", source: "Thomas" },
  { line: "Rage, rage against the dying of the light.", expectedPattern: "/u/u/u/u/", source: "Thomas" },

  // YEATS
  { line: "Turning and turning in the widening gyre", expectedPattern: "/u/u/u/u/", source: "Yeats" },
  { line: "The falcon cannot hear the falconer;", expectedPattern: "u/u/u/u/u/", source: "Yeats" },
  { line: "Things fall apart; the centre cannot hold;", expectedPattern: "u/u/u/u/u/", source: "Yeats" },

  // PROBLEMATIC LINES - identified from previous tests
  { line: "And looked down one as far as I could", expectedPattern: "u/u/u/uu/", source: "Frost Road" },
  { line: "Then took the other, as just as fair,", expectedPattern: "u/u/uu/u/", source: "Frost Road" },
  { line: "The darkest evening of the year.", expectedPattern: "u/u/uuu/", source: "Frost Stopping" },
  { line: "And miles to go before I sleep,", expectedPattern: "u/u/u/u/", source: "Frost Stopping" },
];

async function loadDictionary(): Promise<void> {
  const possiblePaths = [
    './public/cmudict.dict',
    '../../../public/cmudict.dict',
    join(__dirname, '../../../../public/cmudict.dict'),
  ];

  let dictText: string | null = null;

  for (const path of possiblePaths) {
    try {
      if (existsSync(path)) {
        dictText = readFileSync(path, 'utf-8');
        break;
      }
    } catch {
      continue;
    }
  }

  if (!dictText) {
    console.error('Could not find CMU dictionary!');
    return;
  }

  const dictionary = new Map<string, Pronunciation[]>();
  const lines = dictText.split('\n');

  for (const line of lines) {
    if (line.startsWith(';;;') || !line.trim()) continue;

    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;

    const word = parts[0];
    const phones = parts.slice(1);
    const baseWord = word.replace(/\(\d+\)$/, '').toLowerCase();

    const stresses: number[] = [];
    for (const phone of phones) {
      const match = phone.match(/[012]$/);
      if (match) {
        stresses.push(parseInt(match[0]));
      }
    }

    const pronunciation: Pronunciation = { word: baseWord, phones, stresses };

    if (!dictionary.has(baseWord)) {
      dictionary.set(baseWord, []);
    }
    dictionary.get(baseWord)!.push(pronunciation);
  }

  injectDictionary(dictionary);
}

interface FailureAnalysis {
  line: string;
  expected: string;
  actual: string;
  source: string;
  failureType: string;
  details: string[];
  wordAnalysis: { word: string; cmuStress: string; usedStress: string; syllables: number }[];
}

function analyzeWord(word: string): { cmuStress: string; syllables: number } {
  const clean = word.toLowerCase().replace(/[^a-z']/g, '');
  const stress = getStressPattern(clean);
  return {
    cmuStress: stress.length > 0 ? stress.map(s => s > 0 ? '/' : 'u').join('') : '?',
    syllables: stress.length || 1,
  };
}

function categorizeFailure(expected: string, actual: string, line: string): { type: string; details: string[] } {
  const details: string[] = [];

  // Length mismatch
  if (expected.length !== actual.length) {
    const diff = actual.length - expected.length;
    details.push(`Syllable count: expected ${expected.length}, got ${actual.length} (${diff > 0 ? '+' : ''}${diff})`);
    return { type: 'syllable_count', details };
  }

  // Find specific mismatches
  const mismatches: number[] = [];
  for (let i = 0; i < expected.length; i++) {
    if (expected[i] !== actual[i]) {
      mismatches.push(i);
    }
  }

  if (mismatches.length === 0) {
    return { type: 'none', details: ['Perfect match'] };
  }

  // Analyze mismatch positions
  const words = line.toLowerCase().split(/\s+/);
  let pos = 0;
  const wordPositions: { word: string; start: number; end: number }[] = [];

  for (const word of words) {
    const clean = word.replace(/[^a-z']/g, '');
    const stress = getStressPattern(clean);
    const sylCount = stress.length || 1;
    wordPositions.push({ word: clean, start: pos, end: pos + sylCount - 1 });
    pos += sylCount;
  }

  // Find which words have mismatches
  const mismatchedWords: string[] = [];
  for (const mismatchPos of mismatches) {
    for (const wp of wordPositions) {
      if (mismatchPos >= wp.start && mismatchPos <= wp.end) {
        if (!mismatchedWords.includes(wp.word)) {
          mismatchedWords.push(wp.word);
          const expectedStress = expected.slice(wp.start, wp.end + 1);
          const actualStress = actual.slice(wp.start, wp.end + 1);
          details.push(`"${wp.word}": expected ${expectedStress}, got ${actualStress}`);
        }
      }
    }
  }

  // Categorize
  const functionWords = ['the', 'a', 'an', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'and', 'but', 'or', 'i', 'my', 'your', 'his', 'her', 'as', 'is', 'it', 'that', 'this'];
  const hasFunctionWordIssue = mismatchedWords.some(w => functionWords.includes(w));

  if (hasFunctionWordIssue) {
    return { type: 'function_word', details };
  }

  // Check for polysyllabic stress issues
  const hasPolysyllabicIssue = mismatchedWords.some(w => {
    const stress = getStressPattern(w);
    return stress.length > 1;
  });

  if (hasPolysyllabicIssue) {
    return { type: 'polysyllabic_stress', details };
  }

  return { type: 'monosyllable_stress', details };
}

function runAnalysis() {
  console.log('='.repeat(100));
  console.log('DETAILED FAILURE ANALYSIS FOR ACCURACY IMPROVEMENT');
  console.log('='.repeat(100));
  console.log();

  // Group by source and classify
  const sources = new Map<string, AnnotatedLine[]>();
  for (const item of TEST_DATA) {
    if (!sources.has(item.source)) {
      sources.set(item.source, []);
    }
    sources.get(item.source)!.push(item);
  }

  const failures: FailureAnalysis[] = [];
  const failureTypes: Record<string, number> = {};
  let totalLines = 0;
  let exactMatches = 0;

  for (const [source, lines] of sources) {
    const fullText = lines.map(l => l.line).join('\n');
    const classification = classifyPoem(fullText);

    for (const { line, expectedPattern } of lines) {
      totalLines++;
      const result = scanLineWithMeter(line, classification);
      const actualPattern = result.pattern;

      if (actualPattern === expectedPattern) {
        exactMatches++;
        continue;
      }

      const { type, details } = categorizeFailure(expectedPattern, actualPattern, line);
      failureTypes[type] = (failureTypes[type] || 0) + 1;

      // Word-by-word analysis
      const words = line.split(/\s+/);
      const wordAnalysis: { word: string; cmuStress: string; usedStress: string; syllables: number }[] = [];

      let patternPos = 0;
      for (const word of words) {
        const clean = word.replace(/[^a-zA-Z']/g, '');
        if (!clean) continue;

        const analysis = analyzeWord(clean);
        const usedStress = actualPattern.slice(patternPos, patternPos + analysis.syllables);
        wordAnalysis.push({
          word: clean,
          cmuStress: analysis.cmuStress,
          usedStress,
          syllables: analysis.syllables,
        });
        patternPos += analysis.syllables;
      }

      failures.push({
        line,
        expected: expectedPattern,
        actual: actualPattern,
        source,
        failureType: type,
        details,
        wordAnalysis,
      });
    }
  }

  // Print summary
  console.log('SUMMARY:');
  console.log('-'.repeat(60));
  console.log(`Total lines: ${totalLines}`);
  console.log(`Exact matches: ${exactMatches} (${(exactMatches / totalLines * 100).toFixed(1)}%)`);
  console.log(`Failures: ${failures.length}`);
  console.log();

  console.log('FAILURE TYPES:');
  console.log('-'.repeat(60));
  const sortedTypes = Object.entries(failureTypes).sort((a, b) => b[1] - a[1]);
  for (const [type, count] of sortedTypes) {
    const pct = (count / failures.length * 100).toFixed(1);
    console.log(`  ${type.padEnd(25)} ${count.toString().padStart(3)} (${pct}%)`);
  }
  console.log();

  // Detailed failure analysis
  console.log('DETAILED FAILURES:');
  console.log('='.repeat(100));

  for (const failure of failures) {
    console.log();
    console.log(`Line: "${failure.line}"`);
    console.log(`Source: ${failure.source}`);
    console.log(`Expected: ${failure.expected}`);
    console.log(`Actual:   ${failure.actual}`);
    console.log(`Type: ${failure.failureType}`);

    // Show character-by-character comparison
    let comparison = '          ';
    for (let i = 0; i < Math.max(failure.expected.length, failure.actual.length); i++) {
      if (i < failure.expected.length && i < failure.actual.length) {
        comparison += failure.expected[i] === failure.actual[i] ? ' ' : 'X';
      } else {
        comparison += 'X';
      }
    }
    console.log(comparison);

    console.log('Details:');
    for (const detail of failure.details) {
      console.log(`  - ${detail}`);
    }

    console.log('Word analysis:');
    for (const wa of failure.wordAnalysis) {
      const match = wa.cmuStress === wa.usedStress ? '✓' : '✗';
      console.log(`  ${match} "${wa.word}": CMU=${wa.cmuStress}, used=${wa.usedStress}, syl=${wa.syllables}`);
    }
    console.log('-'.repeat(100));
  }

  // RECOMMENDATIONS
  console.log();
  console.log('='.repeat(100));
  console.log('RECOMMENDATIONS FOR IMPROVEMENT');
  console.log('='.repeat(100));
  console.log();

  if (failureTypes['syllable_count'] > 0) {
    console.log('1. SYLLABLE COUNT ISSUES:');
    console.log('   - Review poetic syllable reductions (contractions, elisions)');
    console.log('   - Check CMU dictionary coverage for archaic/poetic words');
    console.log('   - Add more entries to POETIC_REDUCTIONS dictionary');
    console.log();
  }

  if (failureTypes['function_word'] > 0) {
    console.log('2. FUNCTION WORD STRESS ISSUES:');
    console.log('   - Function words should generally be unstressed');
    console.log('   - BUT they can be stressed for emphasis or at line boundaries');
    console.log('   - Consider position in foot: initial position may allow stress');
    console.log();
  }

  if (failureTypes['monosyllable_stress'] > 0) {
    console.log('3. MONOSYLLABLE STRESS ISSUES:');
    console.log('   - Monosyllables are metrically flexible');
    console.log('   - Should be assigned based on metrical context');
    console.log('   - Content words prefer stress, function words prefer unstress');
    console.log();
  }

  if (failureTypes['polysyllabic_stress'] > 0) {
    console.log('4. POLYSYLLABIC STRESS ISSUES:');
    console.log('   - These should follow dictionary stress patterns');
    console.log('   - Check if CMU dictionary entry is being used correctly');
    console.log('   - Some words have secondary stress that matters for meter');
    console.log();
  }
}

// Main
loadDictionary().then(() => {
  runAnalysis();
});
