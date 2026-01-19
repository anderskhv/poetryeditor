/**
 * Generate scansion notation for lines of poetry
 * Uses / for stressed syllables and ˘ for unstressed syllables
 */

import { analyzeTextStress } from './stressAnalyzer';
import { getStressPattern } from './cmuDict';

export interface ScansionLine {
  lineNumber: number;
  scansionMarks: string; // String of / and ˘ characters aligned with syllables
}

/**
 * Generate scansion notation for all lines in text
 */
export function generateScansion(text: string): ScansionLine[] {
  const lines = text.split('\n');
  const stressAnalyses = analyzeTextStress(text);
  const result: ScansionLine[] = [];

  lines.forEach((line, lineIndex) => {
    if (line.trim().length === 0 || lineIndex >= stressAnalyses.length) {
      return;
    }

    const analysis = stressAnalyses[lineIndex];
    let scansionMarks = '';
    let charOffset = 0;

    for (const word of analysis.words) {
      if (!word) continue;

      // Find word position in original line
      const wordStart = line.toLowerCase().indexOf(word, charOffset);
      if (wordStart === -1) continue;

      // Add spaces to align with word start position
      while (scansionMarks.length < wordStart) {
        scansionMarks += ' ';
      }

      // Get stress pattern for this word
      const wordStresses = getStressPattern(word);

      if (wordStresses.length > 0) {
        // Add stress marks with spacing
        for (let i = 0; i < wordStresses.length; i++) {
          const stress = wordStresses[i];
          // Use / for any stress (primary or secondary), ˘ for unstressed
          const mark = (stress >= 1) ? '/' : '˘';
          scansionMarks += mark;

          // Add space after each mark except the last one in the word
          if (i < wordStresses.length - 1) {
            scansionMarks += ' ';
          }
        }

        // Add spacing after the word (1-2 spaces)
        scansionMarks += '  ';
      }

      charOffset = wordStart + word.length;
    }

    result.push({
      lineNumber: lineIndex,
      scansionMarks: scansionMarks.trimEnd(),
    });
  });

  return result;
}
