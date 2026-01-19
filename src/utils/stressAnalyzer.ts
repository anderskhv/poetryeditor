/**
 * Stress pattern analysis for poetry
 * Uses CMU dictionary to analyze actual stress patterns
 */

import { getStressPattern, getSyllableCountFromStress, stressPatternToString } from './cmuDict';

export interface LineStressAnalysis {
  line: string;
  words: string[];
  stresses: number[];
  stressString: string; // Visual representation like "'u'u'u'u'u"
  syllableCount: number;
  hasUnknownWords: boolean;
  unknownWords: string[];
}

export interface StressVisualization {
  text: string;
  stress: number; // 0, 1, or 2
  isUnknown: boolean;
}

/**
 * Analyze stress pattern for a single line
 */
export function analyzeLineStress(line: string): LineStressAnalysis {
  const words = line
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 0)
    .map(w => w.replace(/[^a-z'-]/g, '')); // Keep hyphens and apostrophes

  const stresses: number[] = [];
  const unknownWords: string[] = [];

  for (const word of words) {
    if (!word) continue;

    // Handle hyphenated words
    const parts = word.split('-').filter(p => p.length > 0);

    for (const part of parts) {
      const wordStresses = getStressPattern(part);

      if (wordStresses.length === 0) {
        unknownWords.push(part);
        // For unknown words, assume single syllable with stress
        stresses.push(1);
      } else {
        stresses.push(...wordStresses);
      }
    }
  }

  return {
    line,
    words,
    stresses,
    stressString: stressPatternToString(stresses),
    syllableCount: stresses.length,
    hasUnknownWords: unknownWords.length > 0,
    unknownWords,
  };
}

/**
 * Analyze stress patterns for all lines in text
 */
export function analyzeTextStress(text: string): LineStressAnalysis[] {
  const lines = text.split('\n');
  return lines.map(line => analyzeLineStress(line));
}

/**
 * Create visualization data for a line with stress markers
 */
export function createStressVisualization(line: string): StressVisualization[] {
  const analysis = analyzeLineStress(line);
  const result: StressVisualization[] = [];

  let stressIndex = 0;
  let currentWord = '';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (/[a-zA-Z'-]/.test(char)) {
      currentWord += char;
    } else {
      // End of word
      if (currentWord.length > 0) {
        const wordStresses = getStressPattern(currentWord.toLowerCase().replace(/[^a-z'-]/g, ''));

        if (wordStresses.length === 0) {
          // Unknown word - mark all characters as unknown with default stress
          for (const c of currentWord) {
            result.push({ text: c, stress: 1, isUnknown: true });
          }
          stressIndex++;
        } else {
          // Distribute stresses across word characters
          const charsPerSyllable = Math.ceil(currentWord.length / wordStresses.length);
          let charIndex = 0;

          for (let si = 0; si < wordStresses.length; si++) {
            const syllableChars = Math.min(charsPerSyllable, currentWord.length - charIndex);
            for (let j = 0; j < syllableChars; j++) {
              result.push({
                text: currentWord[charIndex],
                stress: wordStresses[si],
                isUnknown: false,
              });
              charIndex++;
            }
            stressIndex++;
          }

          // Handle any remaining characters
          while (charIndex < currentWord.length) {
            result.push({
              text: currentWord[charIndex],
              stress: 0,
              isUnknown: false,
            });
            charIndex++;
          }
        }

        currentWord = '';
      }

      // Add non-word character
      result.push({ text: char, stress: 0, isUnknown: false });
    }
  }

  // Handle last word if line doesn't end with space
  if (currentWord.length > 0) {
    const wordStresses = getStressPattern(currentWord.toLowerCase().replace(/[^a-z'-]/g, ''));

    if (wordStresses.length === 0) {
      for (const c of currentWord) {
        result.push({ text: c, stress: 1, isUnknown: true });
      }
    } else {
      const charsPerSyllable = Math.ceil(currentWord.length / wordStresses.length);
      let charIndex = 0;

      for (let si = 0; si < wordStresses.length; si++) {
        const syllableChars = Math.min(charsPerSyllable, currentWord.length - charIndex);
        for (let j = 0; j < syllableChars; j++) {
          result.push({
            text: currentWord[charIndex],
            stress: wordStresses[si],
            isUnknown: false,
          });
          charIndex++;
        }
      }

      while (charIndex < currentWord.length) {
        result.push({
          text: currentWord[charIndex],
          stress: 0,
          isUnknown: false,
        });
        charIndex++;
      }
    }
  }

  return result;
}

/**
 * Detect meter type from stress pattern
 */
export function detectMeterFromStress(stresses: number[]): string {
  if (stresses.length === 0) return 'Unknown';

  // Check for iambic (unstressed-stressed pattern)
  let iambicScore = 0;
  for (let i = 0; i < stresses.length - 1; i += 2) {
    if (stresses[i] === 0 && stresses[i + 1] >= 1) iambicScore++;
  }

  // Check for trochaic (stressed-unstressed pattern)
  let trochaicScore = 0;
  for (let i = 0; i < stresses.length - 1; i += 2) {
    if (stresses[i] >= 1 && stresses[i + 1] === 0) trochaicScore++;
  }

  // Check for anapestic (unstressed-unstressed-stressed)
  let anapesticScore = 0;
  for (let i = 0; i < stresses.length - 2; i += 3) {
    if (stresses[i] === 0 && stresses[i + 1] === 0 && stresses[i + 2] >= 1) {
      anapesticScore++;
    }
  }

  // Check for dactylic (stressed-unstressed-unstressed)
  let dactylicScore = 0;
  for (let i = 0; i < stresses.length - 2; i += 3) {
    if (stresses[i] >= 1 && stresses[i + 1] === 0 && stresses[i + 2] === 0) {
      dactylicScore++;
    }
  }

  const maxScore = Math.max(iambicScore, trochaicScore, anapesticScore, dactylicScore);

  if (maxScore === 0) return 'Free verse or irregular';

  let meterType = '';
  if (maxScore === iambicScore) meterType = 'Iambic';
  else if (maxScore === trochaicScore) meterType = 'Trochaic';
  else if (maxScore === anapesticScore) meterType = 'Anapestic';
  else if (maxScore === dactylicScore) meterType = 'Dactylic';

  // Determine meter length
  const feet = Math.round(stresses.length / (meterType === 'Iambic' || meterType === 'Trochaic' ? 2 : 3));

  const lengthNames: { [key: number]: string } = {
    1: 'Monometer',
    2: 'Dimeter',
    3: 'Trimeter',
    4: 'Tetrameter',
    5: 'Pentameter',
    6: 'Hexameter',
    7: 'Heptameter',
    8: 'Octameter',
  };

  const length = lengthNames[feet] || `${feet}-meter`;

  return `${meterType} ${length}`;
}
