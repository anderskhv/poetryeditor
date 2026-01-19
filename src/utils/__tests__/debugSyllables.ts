/**
 * Debug script to test syllable counting
 */

import { injectDictionary, Pronunciation, getStressPattern } from '../cmuDict';
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

const testWords = [
  'widening',
  'heaven',
  'evening',
  'gyre',
  'our',
  'miles',
  'fire',
  'hour',
  'disobedience',
  'impediments',
  'falconer',
];

loadDictionary().then(() => {
  console.log('Word syllable analysis:');
  console.log('-'.repeat(50));

  for (const word of testWords) {
    const cmuStress = getStressPattern(word);
    console.log(`${word.padEnd(20)} CMU: [${cmuStress.join(',')}] (${cmuStress.length} syl)`);
  }
});
