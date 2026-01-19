/**
 * Direct test of getSyllableCount
 */

import { getSyllableCount, getLexicalStress } from '../poemMeterClassifier';
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

const testWords = ['widening', 'heaven', 'evening', 'gyre', 'our', 'miles', 'disobedience'];

loadDictionary().then(() => {
  console.log('Direct getSyllableCount tests:');
  console.log('-'.repeat(50));
  for (const word of testWords) {
    const count = getSyllableCount(word);
    const stress = getLexicalStress(word);
    const stressStr = stress.map(s => s ? '/' : 'u').join('');
    console.log(`${word.padEnd(20)} -> ${count} syl, stress: ${stressStr} (${stress.length})`);
  }
});
