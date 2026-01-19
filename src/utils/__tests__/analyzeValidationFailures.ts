/**
 * Detailed analysis of validation set failures
 */

import { classifyPoem, scanLineWithMeter, getSyllableCount, getLexicalStress } from '../poemMeterClassifier';
import { injectDictionary, Pronunciation } from '../cmuDict';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Sample of problematic lines for deep analysis
const problemLines = [
  // Syllable count wrong - need to understand why
  { text: "Matched with an aged wife, I mete and dole", expected: "u/u/u/u/u/", poet: "Tennyson" },
  { text: "Vexed the dim sea. I am become a name", expected: "/u/uu/u/u/", poet: "Tennyson" },
  { text: "I am a part of all that I have met", expected: "u/u/u/u/u/", poet: "Tennyson" },
  { text: "Yet all experience is an arch wherethrough", expected: "/uu/u/u/u/", poet: "Tennyson" },
  { text: "That's my last Duchess painted on the wall", expected: "/u/u/u/u/u/", poet: "Browning" },
  { text: "Fra Pandolf by design, for never read", expected: "u/uu/u/u/", poet: "Browning" },

  // Stress pattern wrong but syllables correct
  { text: "For always roaming with a hungry heart", expected: "u/u/u/u/u/", poet: "Tennyson" },
  { text: "Myself not least, but honored of them all", expected: "u/u/u/u/u/", poet: "Tennyson" },
  { text: "Willows whiten, aspens quiver", expected: "/u/u/u/u", poet: "Tennyson" },
  { text: "Long fields of barley and of rye", expected: "/uu/u/u/", poet: "Tennyson" },

  // Modern poets - fundamentally harder
  { text: "I imagine this midnight moment's forest", expected: "u/u/u/u/u/u", poet: "Hughes" },
  { text: "Something else is alive", expected: "/u/u/u/", poet: "Hughes" },
];

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

function analyzeWord(word: string): void {
  const clean = word.replace(/[^a-zA-Z'-]/g, '');
  const syllables = getSyllableCount(clean);
  const stress = getLexicalStress(clean);
  const stressStr = stress.map(s => s ? '/' : 'u').join('');
  console.log(`  "${clean}": ${syllables} syl, stress: ${stressStr}`);
}

function analyzeLine(line: string, expected: string): void {
  const words = line.split(/\s+/);
  console.log(`\nLine: "${line}"`);
  console.log(`Expected: ${expected} (${expected.replace(/[^u\/]/g, '').length} syl)`);

  // Analyze each word
  console.log('Words:');
  let totalSyl = 0;
  for (const word of words) {
    const clean = word.replace(/[^a-zA-Z'-]/g, '');
    if (!clean) continue;
    const syllables = getSyllableCount(clean);
    const stress = getLexicalStress(clean);
    const stressStr = stress.map(s => s ? '/' : 'u').join('');
    console.log(`  "${clean}": ${syllables} syl, stress: ${stressStr}`);
    totalSyl += syllables;
  }
  console.log(`Total syllables: ${totalSyl}`);

  // Get actual scan
  const fakeClass = {
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

  const result = scanLineWithMeter(line, fakeClass);
  console.log(`Actual:   ${result.pattern} (${result.syllableCount} syl)`);
}

async function main() {
  await loadDictionary();

  console.log('='.repeat(70));
  console.log('DETAILED FAILURE ANALYSIS');
  console.log('='.repeat(70));

  // Specific word analysis
  console.log('\n--- PROBLEMATIC WORDS ---');
  const problemWords = [
    'aged',      // Should be 2 in poetry (a-ged)
    'become',    // 2 syllables
    'experience', // 4 syllables
    'wherethrough', // compound
    'always',    // 2 syllables, but stress?
    'roaming',   // 2 syllables
    'myself',    // 2 syllables
    'honored',   // 2 syllables
    'willows',   // 2 syllables
    'whiten',    // 2 syllables
    'aspens',    // 2 syllables
    'quiver',    // 2 syllables
    'barley',    // 2 syllables
    'imagine',   // 3 syllables
    'midnight',  // 2 syllables
    'moments',   // 2 syllables
    'forest',    // 2 syllables
    'something', // 2 syllables
    'alive',     // 2 syllables
  ];

  for (const word of problemWords) {
    analyzeWord(word);
  }

  console.log('\n--- LINE-BY-LINE ANALYSIS ---');
  for (const { text, expected, poet } of problemLines) {
    console.log(`\n[${poet}]`);
    analyzeLine(text, expected);
  }
}

main().catch(console.error);
