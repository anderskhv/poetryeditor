/**
 * Test new poem classifier against the 550-line contemporary poetry corpus
 */

import { classifyPoem, scanLineWithMeter, PoemClassification } from '../poemMeterClassifier';
import { injectDictionary, Pronunciation } from '../cmuDict';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Import the test data from the contemporary poetry file
// We'll duplicate the key parts here for simplicity

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface AnnotatedLine {
  line: string;
  expectedPattern: string;
  source: string;
}

// A representative subset of the contemporary poems (condensed for testing)
const TEST_POEMS: Record<string, AnnotatedLine[]> = {
  'Frost - Road Not Taken': [
    { line: "Two roads diverged in a yellow wood,", expectedPattern: "u/u/u/u/u", source: "Frost - Road Not Taken" },
    { line: "And sorry I could not travel both", expectedPattern: "u/uu/u/u/", source: "Frost - Road Not Taken" },
    { line: "And be one traveler, long I stood", expectedPattern: "u/u/uu/u/", source: "Frost - Road Not Taken" },
    { line: "And looked down one as far as I could", expectedPattern: "u/u/u/uu/", source: "Frost - Road Not Taken" },
    { line: "To where it bent in the undergrowth;", expectedPattern: "u/u/u/u/u", source: "Frost - Road Not Taken" },
    { line: "Then took the other, as just as fair,", expectedPattern: "u/u/uu/u/", source: "Frost - Road Not Taken" },
    { line: "And having perhaps the better claim,", expectedPattern: "u/u/uu/u/", source: "Frost - Road Not Taken" },
    { line: "Because it was grassy and wanted wear;", expectedPattern: "u/u/u/u/u/", source: "Frost - Road Not Taken" },
    { line: "Though as for that the passing there", expectedPattern: "u/u/u/uu/", source: "Frost - Road Not Taken" },
    { line: "Had worn them really about the same,", expectedPattern: "u/u/uu/u/", source: "Frost - Road Not Taken" },
  ],
  'Frost - Stopping by Woods': [
    { line: "Whose woods these are I think I know.", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },
    { line: "His house is in the village though;", expectedPattern: "u/u/uu/u/", source: "Frost - Stopping by Woods" },
    { line: "He will not see me stopping here", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },
    { line: "To watch his woods fill up with snow.", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },
    { line: "My little horse must think it queer", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },
    { line: "To stop without a farmhouse near", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },
    { line: "Between the woods and frozen lake", expectedPattern: "u/u/u/u/", source: "Frost - Stopping by Woods" },
    { line: "The darkest evening of the year.", expectedPattern: "u/u/uuu/", source: "Frost - Stopping by Woods" },
  ],
  'Dylan Thomas - Do Not Go Gentle': [
    { line: "Do not go gentle into that good night,", expectedPattern: "u/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
    { line: "Old age should burn and rave at close of day;", expectedPattern: "u/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
    { line: "Rage, rage against the dying of the light.", expectedPattern: "/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
    { line: "Though wise men at their end know dark is right,", expectedPattern: "u/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
    { line: "Because their words had forked no lightning they", expectedPattern: "u/u/u/u/uu/", source: "Thomas - Do Not Go Gentle" },
    { line: "Good men, the last wave by, crying how bright", expectedPattern: "u/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
    { line: "Their frail deeds might have danced in a green bay,", expectedPattern: "u/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
    { line: "Wild men who caught and sang the sun in flight,", expectedPattern: "u/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
    { line: "And learn, too late, they grieved it on its way,", expectedPattern: "u/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
    { line: "Grave men, near death, who see with blinding sight", expectedPattern: "u/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
    { line: "Blind eyes could blaze like meteors and be gay,", expectedPattern: "u/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
    { line: "And you, my father, there on the sad height,", expectedPattern: "u/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
    { line: "Curse, bless, me now with your fierce tears, I pray.", expectedPattern: "/u/u/u/u/", source: "Thomas - Do Not Go Gentle" },
  ],
  'Yeats - Second Coming': [
    { line: "Turning and turning in the widening gyre", expectedPattern: "/u/u/u/u/", source: "Yeats - Second Coming" },
    { line: "The falcon cannot hear the falconer;", expectedPattern: "u/u/u/u/u/", source: "Yeats - Second Coming" },
    { line: "Things fall apart; the centre cannot hold;", expectedPattern: "u/u/u/u/u/", source: "Yeats - Second Coming" },
    { line: "Mere anarchy is loosed upon the world,", expectedPattern: "u/u/u/u/u/", source: "Yeats - Second Coming" },
    { line: "The blood-dimmed tide is loosed, and everywhere", expectedPattern: "u/u/u/u/u/", source: "Yeats - Second Coming" },
    { line: "The ceremony of innocence is drowned;", expectedPattern: "u/uuu/uu/", source: "Yeats - Second Coming" },
    { line: "The best lack all conviction, while the worst", expectedPattern: "u/u/u/u/u/", source: "Yeats - Second Coming" },
    { line: "Are full of passionate intensity.", expectedPattern: "u/u/u/u/u", source: "Yeats - Second Coming" },
  ],
  'Eliot - Prufrock': [
    { line: "Let us go then, you and I,", expectedPattern: "u/u/u/u", source: "Eliot - Prufrock" },
    { line: "When the evening is spread out against the sky", expectedPattern: "u/u/u/u/u/", source: "Eliot - Prufrock" },
    { line: "Like a patient etherized upon a table;", expectedPattern: "uu/uu/u/u/u", source: "Eliot - Prufrock" },
    { line: "Let us go, through certain half-deserted streets,", expectedPattern: "u/u/u/u/u/", source: "Eliot - Prufrock" },
    { line: "The muttering retreats", expectedPattern: "u/u/u/", source: "Eliot - Prufrock" },
    { line: "Of restless nights in one-night cheap hotels", expectedPattern: "u/u/u/u/u/", source: "Eliot - Prufrock" },
    { line: "And sawdust restaurants with oyster-shells:", expectedPattern: "u/u/u/u/u/", source: "Eliot - Prufrock" },
    { line: "Streets that follow like a tedious argument", expectedPattern: "/u/u/u/uu/u", source: "Eliot - Prufrock" },
  ],
  'Hughes - Harlem': [
    { line: "What happens to a dream deferred?", expectedPattern: "u/u/u/u/", source: "Hughes - Harlem" },
    { line: "Does it dry up", expectedPattern: "/u/u", source: "Hughes - Harlem" },
    { line: "like a raisin in the sun?", expectedPattern: "uu/uu/", source: "Hughes - Harlem" },
    { line: "Or fester like a sore—", expectedPattern: "u/uu/", source: "Hughes - Harlem" },
    { line: "And then run?", expectedPattern: "u/u", source: "Hughes - Harlem" },
    { line: "Does it stink like rotten meat?", expectedPattern: "/u/u/u/", source: "Hughes - Harlem" },
    { line: "Or crust and sugar over—", expectedPattern: "u/u/u/u", source: "Hughes - Harlem" },
    { line: "like a syrupy sweet?", expectedPattern: "uu/u/", source: "Hughes - Harlem" },
    { line: "Maybe it just sags", expectedPattern: "/uu/", source: "Hughes - Harlem" },
    { line: "like a heavy load.", expectedPattern: "uu/u/", source: "Hughes - Harlem" },
    { line: "Or does it explode?", expectedPattern: "u/uu/", source: "Hughes - Harlem" },
  ],
  'Williams - Red Wheelbarrow': [
    { line: "so much depends", expectedPattern: "u/u/", source: "Williams - Red Wheelbarrow" },
    { line: "upon", expectedPattern: "u/", source: "Williams - Red Wheelbarrow" },
    { line: "a red wheel", expectedPattern: "u//", source: "Williams - Red Wheelbarrow" },
    { line: "barrow", expectedPattern: "/u", source: "Williams - Red Wheelbarrow" },
    { line: "glazed with rain", expectedPattern: "/u/", source: "Williams - Red Wheelbarrow" },
    { line: "water", expectedPattern: "/u", source: "Williams - Red Wheelbarrow" },
    { line: "beside the white", expectedPattern: "u/u/", source: "Williams - Red Wheelbarrow" },
    { line: "chickens", expectedPattern: "/u", source: "Williams - Red Wheelbarrow" },
  ],
  'Angelou - Still I Rise': [
    { line: "You may write me down in history", expectedPattern: "u/u/u/u/u", source: "Angelou - Still I Rise" },
    { line: "With your bitter, twisted lies,", expectedPattern: "u/u/u/", source: "Angelou - Still I Rise" },
    { line: "You may trod me in the very dirt", expectedPattern: "u/u/u/u/", source: "Angelou - Still I Rise" },
    { line: "But still, like dust, I'll rise.", expectedPattern: "u/u/u/", source: "Angelou - Still I Rise" },
    { line: "Does my sassiness upset you?", expectedPattern: "/u/u/u/u", source: "Angelou - Still I Rise" },
    { line: "Why are you beset with gloom?", expectedPattern: "/uu/u/", source: "Angelou - Still I Rise" },
    { line: "'Cause I walk like I've got oil wells", expectedPattern: "u/u/u/u/", source: "Angelou - Still I Rise" },
    { line: "Pumping in my living room.", expectedPattern: "/u/u/u/", source: "Angelou - Still I Rise" },
  ],
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

function runTests() {
  console.log('='.repeat(80));
  console.log('NEW CLASSIFIER VS CONTEMPORARY POETRY');
  console.log('='.repeat(80));
  console.log();

  let totalLines = 0;
  let totalExact = 0;
  let totalSyllable = 0;
  let totalPartial = 0;

  const results: { poem: string, exact: number, syllable: number, partial: number, total: number, meter: string }[] = [];

  for (const [poemName, lines] of Object.entries(TEST_POEMS)) {
    // Classify the poem
    const fullText = lines.map(l => l.line).join('\n');
    const classification = classifyPoem(fullText);

    let poemExact = 0;
    let poemSyllable = 0;
    let poemPartial = 0;

    for (const { line, expectedPattern } of lines) {
      const result = scanLineWithMeter(line, classification);
      const actualPattern = result.pattern;

      if (actualPattern === expectedPattern) {
        poemExact++;
      }

      if (actualPattern.length === expectedPattern.length) {
        poemSyllable++;
      }

      // Partial match
      const minLen = Math.min(actualPattern.length, expectedPattern.length);
      let matches = 0;
      for (let i = 0; i < minLen; i++) {
        if (actualPattern[i] === expectedPattern[i]) matches++;
      }
      const maxLen = Math.max(actualPattern.length, expectedPattern.length);
      poemPartial += maxLen > 0 ? matches / maxLen : 0;
    }

    const poemTotal = lines.length;
    totalLines += poemTotal;
    totalExact += poemExact;
    totalSyllable += poemSyllable;
    totalPartial += poemPartial;

    const footNames: Record<number, string> = {
      1: 'mono', 2: 'di', 3: 'tri', 4: 'tetra', 5: 'penta', 6: 'hexa', 7: 'hepta', 8: 'octa',
    };
    const meterName = classification.isMetrical
      ? `${classification.meterBase} ${footNames[classification.footCount!] || classification.footCount}meter`
      : 'free verse';

    results.push({
      poem: poemName,
      exact: poemExact,
      syllable: poemSyllable,
      partial: poemPartial / poemTotal,
      total: poemTotal,
      meter: meterName,
    });
  }

  // Print results by poem
  console.log('RESULTS BY POEM:');
  console.log('-'.repeat(80));
  console.log('Poem'.padEnd(35) + 'Meter'.padEnd(20) + 'Exact'.padStart(8) + 'Syl'.padStart(8) + 'Partial'.padStart(10));
  console.log('-'.repeat(80));

  for (const r of results) {
    const exactPct = `${r.exact}/${r.total}`;
    const sylPct = `${r.syllable}/${r.total}`;
    const partialPct = `${(r.partial * 100).toFixed(0)}%`;
    console.log(r.poem.padEnd(35) + r.meter.padEnd(20) + exactPct.padStart(8) + sylPct.padStart(8) + partialPct.padStart(10));
  }

  console.log('-'.repeat(80));
  console.log();

  // Overall results
  console.log('OVERALL:');
  console.log(`Total lines:        ${totalLines}`);
  console.log(`Exact matches:      ${totalExact} (${(totalExact / totalLines * 100).toFixed(1)}%)`);
  console.log(`Syllable matches:   ${totalSyllable} (${(totalSyllable / totalLines * 100).toFixed(1)}%)`);
  console.log(`Avg partial match:  ${(totalPartial / totalLines * 100).toFixed(1)}%`);
  console.log('='.repeat(80));
}

// Main
loadDictionary().then(() => {
  runTests();
});
