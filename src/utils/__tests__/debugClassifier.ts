/**
 * Debug script to test the new classifier internals
 */

import { classifyPoem, scanLineWithMeter } from '../poemMeterClassifier';
import { injectDictionary, Pronunciation } from '../cmuDict';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const testLines = [
  'Turning and turning in the widening gyre',
  'The darkest evening of the year.',
  'And miles to go before I sleep,',
  'Sometime too hot the eye of heaven shines,',
  'Of Man\'s first disobedience, and the fruit',
];

loadDictionary().then(() => {
  // Create a fake iambic pentameter classification
  const classification = classifyPoem(testLines.join('\n'));

  console.log('Poem classification:', classification.meterBase, classification.footCount);
  console.log();

  for (const line of testLines) {
    const result = scanLineWithMeter(line, classification);
    console.log(`Line: "${line}"`);
    console.log(`Pattern: ${result.pattern} (${result.syllableCount} syl)`);
    console.log(`Raw:     ${result.rawPattern}`);
    console.log();
  }
});
