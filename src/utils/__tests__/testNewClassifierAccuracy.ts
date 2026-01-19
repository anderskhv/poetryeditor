/**
 * Comprehensive accuracy test for the new poem-level meter classifier
 * Tests against both classical and contemporary poetry
 */

import { analyzePoem, classifyPoem, scanLineWithMeter, PoemClassification } from '../poemMeterClassifier';
import { injectDictionary, Pronunciation } from '../cmuDict';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// CLASSICAL POETRY TEST DATA
// ============================================================================

interface AnnotatedLine {
  line: string;
  expectedPattern: string;
  source: string;
}

const CLASSICAL_POEMS: AnnotatedLine[] = [
  // Shakespeare Sonnet 18 - iambic pentameter
  { line: "Shall I compare thee to a summer's day?", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "Thou art more lovely and more temperate:", expectedPattern: "u/u/uu/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "Rough winds do shake the darling buds of May,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "And summer's lease hath all too short a date:", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "Sometime too hot the eye of heaven shines,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "And often is his gold complexion dimm'd;", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "And every fair from fair sometime declines,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "By chance, or nature's changing course untrimm'd;", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "But thy eternal summer shall not fade,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 18" },
  { line: "Nor lose possession of that fair thou ow'st;", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 18" },

  // Shakespeare Sonnet 116 - iambic pentameter
  { line: "Let me not to the marriage of true minds", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 116" },
  { line: "Admit impediments. Love is not love", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 116" },
  { line: "Which alters when it alteration finds,", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 116" },
  { line: "Or bends with the remover to remove.", expectedPattern: "u/u/u/u/u/", source: "Shakespeare Sonnet 116" },

  // Milton - Paradise Lost - iambic pentameter (blank verse)
  { line: "Of Man's first disobedience, and the fruit", expectedPattern: "u/u/u/u/u/", source: "Milton Paradise Lost" },
  { line: "Of that forbidden tree whose mortal taste", expectedPattern: "u/u/u/u/u/", source: "Milton Paradise Lost" },
  { line: "Brought death into the World, and all our woe,", expectedPattern: "u/u/u/u/u/", source: "Milton Paradise Lost" },
  { line: "With loss of Eden, till one greater Man", expectedPattern: "u/u/u/u/u/", source: "Milton Paradise Lost" },

  // Keats - Ode to a Nightingale - iambic pentameter
  { line: "My heart aches, and a drowsy numbness pains", expectedPattern: "u/u/u/u/u/", source: "Keats Nightingale" },
  { line: "My sense, as though of hemlock I had drunk,", expectedPattern: "u/u/u/u/u/", source: "Keats Nightingale" },
  { line: "Or emptied some dull opiate to the drains", expectedPattern: "u/u/u/u/u/", source: "Keats Nightingale" },
  { line: "One minute past, and Lethe-wards had sunk:", expectedPattern: "u/u/u/u/u/", source: "Keats Nightingale" },

  // Byron - Don Juan - iambic pentameter
  { line: "I want a hero: an uncommon want,", expectedPattern: "u/u/u/u/u/", source: "Byron Don Juan" },
  { line: "When every year and month sends forth a new one,", expectedPattern: "u/u/u/u/u/u", source: "Byron Don Juan" },
  { line: "Till, after cloying the gazettes with cant,", expectedPattern: "u/u/u/u/u/", source: "Byron Don Juan" },
  { line: "The age discovers he is not the true one;", expectedPattern: "u/u/u/u/u/u", source: "Byron Don Juan" },

  // Poe - The Raven - trochaic octameter
  { line: "Once upon a midnight dreary, while I pondered, weak and weary,", expectedPattern: "/u/u/u/u/u/u/u/u", source: "Poe Raven" },
  { line: "Over many a quaint and curious volume of forgotten lore—", expectedPattern: "/u/u/u/u/u/u/u/", source: "Poe Raven" },

  // Wordsworth - I Wandered Lonely as a Cloud - iambic tetrameter
  { line: "I wandered lonely as a cloud", expectedPattern: "u/u/uu/", source: "Wordsworth Daffodils" },
  { line: "That floats on high o'er vales and hills,", expectedPattern: "u/u/u/u/", source: "Wordsworth Daffodils" },
  { line: "When all at once I saw a crowd,", expectedPattern: "u/u/u/u/", source: "Wordsworth Daffodils" },
  { line: "A host, of golden daffodils;", expectedPattern: "u/u/u/u/", source: "Wordsworth Daffodils" },
];

// ============================================================================
// CONTEMPORARY POETRY TEST DATA (subset)
// ============================================================================

const CONTEMPORARY_POEMS: AnnotatedLine[] = [
  // Robert Frost - The Road Not Taken - iambic tetrameter with variations
  { line: "Two roads diverged in a yellow wood,", expectedPattern: "u/u/u/u/u", source: "Frost Road" },
  { line: "And sorry I could not travel both", expectedPattern: "u/uu/u/u/", source: "Frost Road" },
  { line: "And be one traveler, long I stood", expectedPattern: "u/u/uu/u/", source: "Frost Road" },
  { line: "And looked down one as far as I could", expectedPattern: "u/u/u/uu/", source: "Frost Road" },

  // Frost - Stopping by Woods - iambic tetrameter
  { line: "Whose woods these are I think I know.", expectedPattern: "u/u/u/u/", source: "Frost Stopping" },
  { line: "His house is in the village though;", expectedPattern: "u/u/u/u/", source: "Frost Stopping" },
  { line: "He will not see me stopping here", expectedPattern: "u/u/u/u/", source: "Frost Stopping" },
  { line: "To watch his woods fill up with snow.", expectedPattern: "u/u/u/u/", source: "Frost Stopping" },

  // Dylan Thomas - Do Not Go Gentle - iambic pentameter (villanelle)
  { line: "Do not go gentle into that good night,", expectedPattern: "u/u/u/u/u/", source: "Thomas Gentle" },
  { line: "Old age should burn and rave at close of day;", expectedPattern: "u/u/u/u/u/", source: "Thomas Gentle" },
  { line: "Rage, rage against the dying of the light.", expectedPattern: "/u/u/u/u/", source: "Thomas Gentle" },

  // Yeats - The Second Coming - loose iambic pentameter
  { line: "Turning and turning in the widening gyre", expectedPattern: "/u/u/u/u/", source: "Yeats Second Coming" },
  { line: "The falcon cannot hear the falconer;", expectedPattern: "u/u/u/u/u/", source: "Yeats Second Coming" },
  { line: "Things fall apart; the centre cannot hold;", expectedPattern: "u/u/u/u/u/", source: "Yeats Second Coming" },

  // Langston Hughes - Harlem - free verse with rhythmic patterns
  { line: "What happens to a dream deferred?", expectedPattern: "u/u/u/u/", source: "Hughes Harlem" },
  { line: "Does it dry up", expectedPattern: "/u/u", source: "Hughes Harlem" },
  { line: "like a raisin in the sun?", expectedPattern: "uu/uu/", source: "Hughes Harlem" },
];

// ============================================================================
// TEST RUNNER
// ============================================================================

async function loadDictionary(): Promise<void> {
  console.log('Loading CMU dictionary...');

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
        console.log(`Found dictionary at: ${path}`);
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

    let word = parts[0];
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
  console.log(`CMU dictionary loaded: ${dictionary.size} entries\n`);
}

function testLineAccuracy(
  lines: AnnotatedLine[],
  poemClassifications: Map<string, PoemClassification>,
  label: string
): { exactMatch: number, syllableMatch: number, partialAvg: number, total: number } {
  let exactMatch = 0;
  let syllableMatch = 0;
  let partialTotal = 0;

  for (const { line, expectedPattern, source } of lines) {
    // Get or create poem classification for this source
    let classification = poemClassifications.get(source);
    if (!classification) {
      // Create a minimal classification
      classification = {
        meterBase: 'iambic',
        footCount: 5,
        confidence: 0.7,
        isMetrical: true,
        regularityScore: 70,
        syllableDistribution: new Map(),
        footTypeDistribution: new Map(),
        evidence: {
          iambicScore: 0.7,
          trochaicScore: 0.3,
          anapesticScore: 0.2,
          dactylicScore: 0.2,
          freeVerseScore: 0.3,
          reasoning: [],
        },
      };
    }

    const result = scanLineWithMeter(line, classification);
    const actualPattern = result.pattern;

    // Check exact match
    if (actualPattern === expectedPattern) {
      exactMatch++;
    }

    // Check syllable count match
    if (actualPattern.length === expectedPattern.length) {
      syllableMatch++;
    }

    // Calculate partial match
    const minLen = Math.min(actualPattern.length, expectedPattern.length);
    let matches = 0;
    for (let i = 0; i < minLen; i++) {
      if (actualPattern[i] === expectedPattern[i]) matches++;
    }
    const maxLen = Math.max(actualPattern.length, expectedPattern.length);
    partialTotal += maxLen > 0 ? matches / maxLen : 0;
  }

  const total = lines.length;
  return {
    exactMatch,
    syllableMatch,
    partialAvg: partialTotal / total,
    total,
  };
}

function runAccuracyTests() {
  console.log('='.repeat(80));
  console.log('NEW POEM CLASSIFIER ACCURACY TESTS');
  console.log('='.repeat(80));
  console.log();

  // Build poem classifications from full poems
  const poemClassifications = new Map<string, PoemClassification>();

  // Shakespeare Sonnet 18
  const sonnet18Text = CLASSICAL_POEMS
    .filter(l => l.source === 'Shakespeare Sonnet 18')
    .map(l => l.line)
    .join('\n');
  poemClassifications.set('Shakespeare Sonnet 18', classifyPoem(sonnet18Text));

  // Shakespeare Sonnet 116
  const sonnet116Text = CLASSICAL_POEMS
    .filter(l => l.source === 'Shakespeare Sonnet 116')
    .map(l => l.line)
    .join('\n');
  poemClassifications.set('Shakespeare Sonnet 116', classifyPoem(sonnet116Text));

  // Group other poems
  const sources = new Set(CLASSICAL_POEMS.map(l => l.source));
  for (const source of sources) {
    if (!poemClassifications.has(source)) {
      const text = CLASSICAL_POEMS.filter(l => l.source === source).map(l => l.line).join('\n');
      poemClassifications.set(source, classifyPoem(text));
    }
  }

  // Add contemporary poem classifications
  const contempSources = new Set(CONTEMPORARY_POEMS.map(l => l.source));
  for (const source of contempSources) {
    const text = CONTEMPORARY_POEMS.filter(l => l.source === source).map(l => l.line).join('\n');
    poemClassifications.set(source, classifyPoem(text));
  }

  // Run classical tests
  console.log('CLASSICAL POETRY RESULTS:');
  console.log('-'.repeat(60));
  const classicalResults = testLineAccuracy(CLASSICAL_POEMS, poemClassifications, 'Classical');
  console.log(`Total lines:        ${classicalResults.total}`);
  console.log(`Exact matches:      ${classicalResults.exactMatch} (${(classicalResults.exactMatch / classicalResults.total * 100).toFixed(1)}%)`);
  console.log(`Syllable matches:   ${classicalResults.syllableMatch} (${(classicalResults.syllableMatch / classicalResults.total * 100).toFixed(1)}%)`);
  console.log(`Avg partial match:  ${(classicalResults.partialAvg * 100).toFixed(1)}%`);
  console.log();

  // Run contemporary tests
  console.log('CONTEMPORARY POETRY RESULTS:');
  console.log('-'.repeat(60));
  const contemporaryResults = testLineAccuracy(CONTEMPORARY_POEMS, poemClassifications, 'Contemporary');
  console.log(`Total lines:        ${contemporaryResults.total}`);
  console.log(`Exact matches:      ${contemporaryResults.exactMatch} (${(contemporaryResults.exactMatch / contemporaryResults.total * 100).toFixed(1)}%)`);
  console.log(`Syllable matches:   ${contemporaryResults.syllableMatch} (${(contemporaryResults.syllableMatch / contemporaryResults.total * 100).toFixed(1)}%)`);
  console.log(`Avg partial match:  ${(contemporaryResults.partialAvg * 100).toFixed(1)}%`);
  console.log();

  // Show poem-level classification results
  console.log('POEM-LEVEL CLASSIFICATIONS:');
  console.log('-'.repeat(60));
  for (const [source, classification] of poemClassifications) {
    const footNames: Record<number, string> = {
      1: 'mono', 2: 'di', 3: 'tri', 4: 'tetra', 5: 'penta', 6: 'hexa', 7: 'hepta', 8: 'octa',
    };
    const footName = classification.footCount ? footNames[classification.footCount] + 'meter' : 'n/a';
    const meter = classification.isMetrical
      ? `${classification.meterBase} ${footName}`
      : 'free verse';
    console.log(`${source.padEnd(30)} ${meter.padEnd(25)} (${(classification.confidence * 100).toFixed(0)}%)`);
  }

  console.log();
  console.log('='.repeat(80));
  const totalLines = classicalResults.total + contemporaryResults.total;
  const totalExact = classicalResults.exactMatch + contemporaryResults.exactMatch;
  const totalSyllable = classicalResults.syllableMatch + contemporaryResults.syllableMatch;
  const avgPartial = (classicalResults.partialAvg * classicalResults.total + contemporaryResults.partialAvg * contemporaryResults.total) / totalLines;

  console.log('OVERALL RESULTS:');
  console.log(`Total lines:        ${totalLines}`);
  console.log(`Exact matches:      ${totalExact} (${(totalExact / totalLines * 100).toFixed(1)}%)`);
  console.log(`Syllable matches:   ${totalSyllable} (${(totalSyllable / totalLines * 100).toFixed(1)}%)`);
  console.log(`Avg partial match:  ${(avgPartial * 100).toFixed(1)}%`);
  console.log('='.repeat(80));
}

// Main
loadDictionary().then(() => {
  runAccuracyTests();
});
