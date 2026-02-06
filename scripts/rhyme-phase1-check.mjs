import fs from 'fs';
import path from 'path';

const dictPath = path.resolve('public', 'cmudict.dict');
const text = fs.readFileSync(dictPath, 'utf8');

function parseCMUDict(textContent) {
  const dict = new Map();
  const lines = textContent.split('\n');

  for (const line of lines) {
    if (line.startsWith(';;;') || line.trim().length === 0) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;
    const rawWord = parts[0];
    const phones = parts.slice(1);
    const baseWord = rawWord.replace(/\(\d+\)$/, '').toLowerCase();
    const stresses = [];
    for (const phone of phones) {
      const match = phone.match(/[012]$/);
      if (match) stresses.push(parseInt(match[0], 10));
    }
    const entry = { word: baseWord, phones, stresses };
    if (!dict.has(baseWord)) dict.set(baseWord, []);
    dict.get(baseWord).push(entry);
  }
  return dict;
}

function getBestPronunciation(prons) {
  return [...prons].sort((a, b) => b.stresses.length - a.stresses.length)[0];
}

function getRhymeKeyFromPhones(phones) {
  let lastStressIndex = -1;
  for (let i = phones.length - 1; i >= 0; i--) {
    if (/[12]$/.test(phones[i])) {
      lastStressIndex = i;
      break;
    }
  }
  if (lastStressIndex === -1) {
    for (let i = phones.length - 1; i >= 0; i--) {
      if (/[012]$/.test(phones[i])) {
        lastStressIndex = i;
        break;
      }
    }
  }
  if (lastStressIndex === -1) return null;
  return phones.slice(lastStressIndex).map(p => p.replace(/[012]$/, '')).join('-');
}

function estimateSyllableCount(word) {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleaned) return 0;
  const vowels = 'aeiouy';
  let count = 0;
  let prevWasVowel = false;

  for (let i = 0; i < cleaned.length; i++) {
    const isVowel = vowels.includes(cleaned[i]);
    if (isVowel && !prevWasVowel) count += 1;
    prevWasVowel = isVowel;
  }

  if (cleaned.endsWith('e') && !cleaned.endsWith('le') && count > 1) count -= 1;
  const splitPairs = cleaned.match(/(ia|io|eo|ua|ui|iu|ya|yo|ye)/g);
  if (splitPairs) count += splitPairs.length;
  return Math.max(1, count);
}

function getSyllableCount(dict, word) {
  const prons = dict.get(word);
  if (!prons || prons.length === 0) return estimateSyllableCount(word);
  return getBestPronunciation(prons).stresses.length;
}

function buildRhymeIndex(dict) {
  const perfect = new Map();
  for (const [word, prons] of dict.entries()) {
    const best = getBestPronunciation(prons);
    const key = getRhymeKeyFromPhones(best.phones);
    if (!key) continue;
    const list = perfect.get(key) ?? [];
    list.push(word);
    perfect.set(key, list);
  }
  return perfect;
}

const dict = parseCMUDict(text);
const perfectIndex = buildRhymeIndex(dict);

const rhymeTests = [
  { word: 'time', expect: ['dime', 'lime', 'chime', 'rhyme'] },
  { word: 'light', expect: ['night', 'sight', 'bright'] },
  { word: 'moon', expect: ['tune', 'soon', 'loon'] },
  { word: 'love', expect: ['dove', 'glove', 'above'] },
  { word: 'cold', expect: ['bold', 'told', 'fold'] },
  { word: 'nation', expect: ['station', 'relation', 'creation'] },
  { word: 'flower', expect: ['power', 'shower', 'tower'] },
  { word: 'ocean', expect: ['motion', 'notion', 'lotion'] },
  { word: 'story', expect: ['glory', 'gory', 'allegory'] },
];

const syllableTests = [
  { word: 'cat', count: 1 },
  { word: 'love', count: 1 },
  { word: 'banana', count: 3 },
  { word: 'beautiful', count: 3 },
  { word: 'poetry', count: 3 },
  { word: 'forever', count: 3 },
  { word: 'memory', count: 3 },
  { word: 'tomorrow', count: 3 },
];

const fallbackTests = [
  { word: 'blorfle', count: 2 },
  { word: 'snorple', count: 2 },
  { word: 'flarion', count: 3 },
];

let rhymePass = 0;
for (const test of rhymeTests) {
  const prons = dict.get(test.word);
  const best = prons ? getBestPronunciation(prons) : null;
  const key = best ? getRhymeKeyFromPhones(best.phones) : null;
  const results = key ? (perfectIndex.get(key) ?? []) : [];
  const hits = test.expect.filter(w => results.includes(w));
  const passed = hits.length >= 3;
  if (passed) rhymePass += 1;
  console.log(`RHYME ${test.word}: ${hits.length}/${test.expect.length} -> ${passed ? 'PASS' : 'FAIL'}`);
}

let syllableCorrect = 0;
for (const test of syllableTests) {
  const count = getSyllableCount(dict, test.word);
  const passed = count === test.count;
  if (passed) syllableCorrect += 1;
  console.log(`SYLL ${test.word}: ${count} (expected ${test.count}) -> ${passed ? 'PASS' : 'FAIL'}`);
}

let fallbackCorrect = 0;
for (const test of fallbackTests) {
  const count = estimateSyllableCount(test.word);
  const passed = count === test.count;
  if (passed) fallbackCorrect += 1;
  console.log(`FALLBACK ${test.word}: ${count} (expected ${test.count}) -> ${passed ? 'PASS' : 'FAIL'}`);
}

const rhymeSuccess = rhymePass === rhymeTests.length;
const syllableRate = syllableCorrect / syllableTests.length;
const fallbackRate = fallbackCorrect / fallbackTests.length;

console.log('\nSUMMARY');
console.log(`Rhyme tests: ${rhymePass}/${rhymeTests.length} ${rhymeSuccess ? 'PASS' : 'FAIL'}`);
console.log(`Syllable accuracy: ${(syllableRate * 100).toFixed(1)}%`);
console.log(`Fallback accuracy: ${(fallbackRate * 100).toFixed(1)}%`);

if (!rhymeSuccess || syllableRate < 0.9 || fallbackRate < 0.9) {
  process.exit(1);
}
