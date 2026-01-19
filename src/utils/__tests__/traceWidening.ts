/**
 * Trace exactly what happens with 'widening'
 */

// First, let's re-import the actual module and trace
import * as classifier from '../poemMeterClassifier';

// The module doesn't export getSyllableCount, so let's trace the full flow
import { injectDictionary, Pronunciation } from '../cmuDict';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadDictionary(): Promise<void> {
  const possiblePaths = [
    './public/cmudict.dict',
    join(__dirname, '../../../../public/cmudict.dict'),
  ];

  let dictText: string | null = null;
  for (const path of possiblePaths) {
    try {
      if (existsSync(path)) {
        dictText = readFileSync(path, 'utf-8');
        break;
      }
    } catch { continue; }
  }

  if (!dictText) return;

  const dictionary = new Map<string, Pronunciation[]>();
  for (const line of dictText.split('\n')) {
    if (line.startsWith(';;;') || !line.trim()) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;
    const word = parts[0];
    const phones = parts.slice(1);
    const baseWord = word.replace(/\(\d+\)$/, '').toLowerCase();
    const stresses: number[] = [];
    for (const phone of phones) {
      const match = phone.match(/[012]$/);
      if (match) stresses.push(parseInt(match[0]));
    }
    if (!dictionary.has(baseWord)) dictionary.set(baseWord, []);
    dictionary.get(baseWord)!.push({ word: baseWord, phones, stresses });
  }
  injectDictionary(dictionary);
}

loadDictionary().then(() => {
  // Test just the widening line
  const line = "Turning and turning in the widening gyre";

  const fakeClassification = {
    meterBase: 'iambic' as const,
    footCount: 5 as const,
    confidence: 0.9,
    isMetrical: true,
    regularityScore: 90,
    syllableDistribution: new Map(),
    footTypeDistribution: new Map(),
    evidence: {
      iambicScore: 0.9,
      trochaicScore: 0.1,
      anapesticScore: 0.1,
      dactylicScore: 0.1,
      freeVerseScore: 0.1,
      reasoning: [],
    },
  };

  const result = classifier.scanLineWithMeter(line, fakeClassification);
  console.log('Line:', line);
  console.log('Pattern:', result.pattern);
  console.log('Syllables:', result.syllableCount);

  // Now let's split the line and see what we get for each word
  const words = line.split(/\s+/);
  console.log('\nWords:');
  for (const word of words) {
    // We can't call getSyllableCount directly, but we can infer from output
    console.log(`  ${word}`);
  }
});
