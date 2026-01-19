/**
 * Test script for the new poem-level meter classifier
 */

import { analyzePoem, classifyPoem } from '../poemMeterClassifier';
import { injectDictionary, Pronunciation } from '../cmuDict';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test poems with known meters
const TEST_POEMS = {
  // Shakespeare Sonnet 18 - iambic pentameter
  shakespeareSonnet18: {
    text: `Shall I compare thee to a summer's day?
Thou art more lovely and more temperate:
Rough winds do shake the darling buds of May,
And summer's lease hath all too short a date:
Sometime too hot the eye of heaven shines,
And often is his gold complexion dimm'd;
And every fair from fair sometime declines,
By chance, or nature's changing course untrimm'd;
But thy eternal summer shall not fade,
Nor lose possession of that fair thou ow'st;
Nor shall death brag thou wander'st in his shade,
When in eternal lines to time thou grow'st:
So long as men can breathe, or eyes can see,
So long lives this, and this gives life to thee.`,
    expectedMeter: 'iambic',
    expectedFeet: 5,
  },

  // Robert Frost - The Road Not Taken - iambic tetrameter
  frostRoadNotTaken: {
    text: `Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;`,
    expectedMeter: 'iambic',
    expectedFeet: 4,
  },

  // Edgar Allan Poe - The Raven (excerpt) - trochaic octameter
  poeRaven: {
    text: `Once upon a midnight dreary, while I pondered, weak and weary,
Over many a quaint and curious volume of forgotten lore—
While I nodded, nearly napping, suddenly there came a tapping,
As of some one gently rapping, rapping at my chamber door.`,
    expectedMeter: 'trochaic',
    expectedFeet: 8,
  },

  // Byron - The Destruction of Sennacherib - anapestic tetrameter
  byronSennacherib: {
    text: `The Assyrian came down like the wolf on the fold,
And his cohorts were gleaming in purple and gold;
And the sheen of their spears was like stars on the sea,
When the blue wave rolls nightly on deep Galilee.`,
    expectedMeter: 'anapestic',
    expectedFeet: 4,
  },

  // Longfellow - Evangeline (excerpt) - dactylic hexameter
  longfellowEvangeline: {
    text: `This is the forest primeval. The murmuring pines and the hemlocks,
Bearded with moss, and in garments green, indistinct in the twilight,
Stand like Druids of eld, with voices sad and prophetic,
Stand like harpers hoar, with beards that rest on their bosoms.`,
    expectedMeter: 'dactylic',
    expectedFeet: 6,
  },

  // Free verse - William Carlos Williams
  wcwRedWheelbarrow: {
    text: `so much depends
upon
a red wheel
barrow
glazed with rain
water
beside the white
chickens`,
    expectedMeter: 'free',
    expectedFeet: null,
  },
};

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

  // Parse into the correct Map<string, Pronunciation[]> format
  const dictionary = new Map<string, Pronunciation[]>();
  const lines = dictText.split('\n');

  for (const line of lines) {
    if (line.startsWith(';;;') || !line.trim()) continue;

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

    if (!dictionary.has(baseWord)) {
      dictionary.set(baseWord, []);
    }
    dictionary.get(baseWord)!.push(pronunciation);
  }

  injectDictionary(dictionary);
  console.log(`CMU dictionary loaded: ${dictionary.size} entries\n`);
}

function runTests() {
  console.log('=' .repeat(80));
  console.log('POEM METER CLASSIFIER TESTS');
  console.log('=' .repeat(80));
  console.log();

  let passed = 0;
  let failed = 0;

  for (const [name, poem] of Object.entries(TEST_POEMS)) {
    console.log(`\nTesting: ${name}`);
    console.log('-'.repeat(60));

    const classification = classifyPoem(poem.text);
    const analysis = analyzePoem(poem.text);

    // Check meter base
    const meterMatch = classification.meterBase === poem.expectedMeter;

    // Check foot count (if applicable)
    const feetMatch = poem.expectedFeet === null
      ? classification.footCount === null
      : classification.footCount === poem.expectedFeet;

    const testPassed = meterMatch && feetMatch;

    if (testPassed) {
      passed++;
      console.log(`✓ PASSED`);
    } else {
      failed++;
      console.log(`✗ FAILED`);
    }

    console.log(`  Expected: ${poem.expectedMeter} ${poem.expectedFeet ?? 'free'}`);
    console.log(`  Got:      ${classification.meterBase} ${classification.footCount ?? 'free'}`);
    console.log(`  Confidence: ${(classification.confidence * 100).toFixed(1)}%`);
    console.log(`  Regularity: ${classification.regularityScore}%`);

    // Show line-by-line for failed tests
    if (!testPassed) {
      console.log('\n  Evidence:');
      for (const reason of classification.evidence.reasoning) {
        console.log(`    - ${reason}`);
      }

      console.log('\n  First 4 lines:');
      for (let i = 0; i < Math.min(4, analysis.lines.length); i++) {
        const line = analysis.lines[i];
        console.log(`    ${line.pattern} (${line.syllableCount} syl)`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  console.log('='.repeat(80));
}

// Main
loadDictionary().then(() => {
  runTests();
});
