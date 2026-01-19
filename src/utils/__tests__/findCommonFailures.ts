/**
 * Find common patterns in validation failures
 */

import { classifyPoem, scanLineWithMeter, getSyllableCount, getLexicalStress } from '../poemMeterClassifier';
import { injectDictionary, Pronunciation } from '../cmuDict';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the validation set
import { validationLines } from './validationTestSet';

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

function normalizePattern(pattern: string): string {
  return pattern.replace(/[^u\/]/g, '');
}

async function main() {
  await loadDictionary();

  // Group lines by poem for classification
  const poemGroups = new Map<string, typeof validationLines>();
  for (const line of validationLines) {
    const key = `${line.poet}:${line.poem}`;
    if (!poemGroups.has(key)) poemGroups.set(key, []);
    poemGroups.get(key)!.push(line);
  }

  // Track word-level failures
  const wordSyllableErrors = new Map<string, { expected: number, actual: number, count: number }>();
  const wordStressErrors = new Map<string, { expected: string, actual: string, count: number }>();

  // Test each poem group
  for (const [poemKey, lines] of poemGroups) {
    const poemText = lines.map(l => l.text).join('\n');
    const classification = classifyPoem(poemText);

    for (const line of lines) {
      const result = scanLineWithMeter(line.text, classification);
      const actualPattern = normalizePattern(result.pattern);
      const expectedPattern = normalizePattern(line.expectedPattern);

      if (actualPattern === expectedPattern) continue;  // Skip successes

      // Analyze word by word
      const words = line.text.split(/\s+/);
      let expectedPos = 0;
      let actualPos = 0;

      for (const word of words) {
        const clean = word.replace(/[^a-zA-Z'-]/g, '');
        if (!clean) continue;

        const actualSyl = getSyllableCount(clean);
        const actualStress = getLexicalStress(clean);
        const actualStressStr = actualStress.map(s => s ? '/' : 'u').join('');

        // Figure out expected syllable count from pattern
        // This is tricky because we don't have word-level annotation
        // But we can detect obvious mismatches

        const lower = clean.toLowerCase();

        // Track if this word might be causing issues
        if (actualSyl !== actualStress.length) {
          console.log(`MISMATCH: ${clean} - syllables=${actualSyl}, stress length=${actualStress.length}`);
        }

        actualPos += actualSyl;
      }
    }
  }

  // Now let's look at specific failure categories
  console.log('\n=== ANALYZING SPECIFIC FAILURE PATTERNS ===\n');

  // Find lines where syllable count is off by exactly 1
  let syllableOffByOne = 0;
  let syllableOffByMore = 0;
  let stressOnly = 0;

  for (const [poemKey, lines] of poemGroups) {
    const poemText = lines.map(l => l.text).join('\n');
    const classification = classifyPoem(poemText);

    for (const line of lines) {
      const result = scanLineWithMeter(line.text, classification);
      const actualPattern = normalizePattern(result.pattern);
      const expectedPattern = normalizePattern(line.expectedPattern);

      if (actualPattern === expectedPattern) continue;

      const diff = Math.abs(actualPattern.length - expectedPattern.length);
      if (diff === 0) {
        stressOnly++;
      } else if (diff === 1) {
        syllableOffByOne++;
      } else {
        syllableOffByMore++;
      }
    }
  }

  console.log(`Stress-only errors: ${stressOnly}`);
  console.log(`Syllable off by 1: ${syllableOffByOne}`);
  console.log(`Syllable off by 2+: ${syllableOffByMore}`);

  // Find the most common words in failed lines
  const wordFrequency = new Map<string, number>();

  for (const [poemKey, lines] of poemGroups) {
    const poemText = lines.map(l => l.text).join('\n');
    const classification = classifyPoem(poemText);

    for (const line of lines) {
      const result = scanLineWithMeter(line.text, classification);
      const actualPattern = normalizePattern(result.pattern);
      const expectedPattern = normalizePattern(line.expectedPattern);

      if (actualPattern === expectedPattern) continue;

      // Count words in failed lines
      const words = line.text.split(/\s+/);
      for (const word of words) {
        const clean = word.replace(/[^a-zA-Z'-]/g, '').toLowerCase();
        if (!clean || clean.length < 3) continue;
        wordFrequency.set(clean, (wordFrequency.get(clean) || 0) + 1);
      }
    }
  }

  // Sort by frequency
  const sortedWords = [...wordFrequency.entries()].sort((a, b) => b[1] - a[1]);
  console.log('\nMost common words in failed lines:');
  for (const [word, count] of sortedWords.slice(0, 30)) {
    const syl = getSyllableCount(word);
    const stress = getLexicalStress(word).map(s => s ? '/' : 'u').join('');
    console.log(`  ${word.padEnd(15)} (${count}x) - ${syl} syl, ${stress}`);
  }
}

main().catch(console.error);
