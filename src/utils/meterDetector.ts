import { MeterPattern } from '../types';
import { getSyllableCounts } from './syllableCounter';
import { analyzeTextStress, detectMeterFromStress } from './stressAnalyzer';
import { isDictionaryLoaded } from './cmuDict';

// Common meter patterns in poetry
const METER_PATTERNS: MeterPattern[] = [
  {
    name: 'Iambic Pentameter',
    pattern: ['unstressed', 'stressed'],
    description: '10 syllables per line (5 iambs: da-DUM da-DUM da-DUM da-DUM da-DUM)',
  },
  {
    name: 'Iambic Tetrameter',
    pattern: ['unstressed', 'stressed'],
    description: '8 syllables per line (4 iambs: da-DUM da-DUM da-DUM da-DUM)',
  },
  {
    name: 'Iambic Trimeter',
    pattern: ['unstressed', 'stressed'],
    description: '6 syllables per line (3 iambs: da-DUM da-DUM da-DUM)',
  },
  {
    name: 'Trochaic Tetrameter',
    pattern: ['stressed', 'unstressed'],
    description: '8 syllables per line (4 trochees: DUM-da DUM-da DUM-da DUM-da)',
  },
  {
    name: 'Trochaic Trimeter',
    pattern: ['stressed', 'unstressed'],
    description: '6 syllables per line (3 trochees: DUM-da DUM-da DUM-da)',
  },
  {
    name: 'Anapestic Tetrameter',
    pattern: ['unstressed', 'unstressed', 'stressed'],
    description: '12 syllables per line (4 anapests: da-da-DUM da-da-DUM da-da-DUM da-da-DUM)',
  },
  {
    name: 'Anapestic Trimeter',
    pattern: ['unstressed', 'unstressed', 'stressed'],
    description: '9 syllables per line (3 anapests: da-da-DUM da-da-DUM da-da-DUM)',
  },
  {
    name: 'Dactylic Hexameter',
    pattern: ['stressed', 'unstressed', 'unstressed'],
    description: '17-18 syllables per line (6 dactyls: DUM-da-da DUM-da-da...)',
  },
  {
    name: 'Dactylic Tetrameter',
    pattern: ['stressed', 'unstressed', 'unstressed'],
    description: '12 syllables per line (4 dactyls: DUM-da-da DUM-da-da DUM-da-da DUM-da-da)',
  },
];

/**
 * Detect the dominant meter pattern in the text
 * Uses CMU dictionary for stress patterns if available, otherwise falls back to syllable counting
 */
export function detectMeter(text: string): string {
  if (!text || text.trim().length === 0) {
    return 'No text to analyze';
  }

  // If CMU dictionary is loaded, use stress pattern analysis
  if (isDictionaryLoaded()) {
    return detectMeterWithStress(text);
  }

  // Fallback to syllable-based detection
  return detectMeterBySyllables(text);
}

/**
 * Detect meter using actual stress patterns from CMU dictionary
 */
function detectMeterWithStress(text: string): string {
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    return 'No text to analyze';
  }

  const stressAnalyses = analyzeTextStress(text);
  const nonEmptyAnalyses = stressAnalyses.filter(a => a.stresses.length > 0);

  if (nonEmptyAnalyses.length === 0) {
    return 'No text to analyze';
  }

  // Detect meter for each line
  const meterDetections = nonEmptyAnalyses.map(analysis =>
    detectMeterFromStress(analysis.stresses)
  );

  // Find most common meter
  const meterFrequency: Record<string, number> = {};
  meterDetections.forEach(meter => {
    meterFrequency[meter] = (meterFrequency[meter] || 0) + 1;
  });

  const sortedMeters = Object.entries(meterFrequency)
    .sort((a, b) => b[1] - a[1]);

  const dominantMeter = sortedMeters[0][0];
  const consistency = sortedMeters[0][1] / meterDetections.length;

  // Check for unknown words
  const hasUnknownWords = nonEmptyAnalyses.some(a => a.hasUnknownWords);

  let result = dominantMeter;

  if (consistency < 0.5) {
    result = `Mixed or Free Verse`;
  } else if (consistency < 0.8) {
    result = `${dominantMeter} (with variations)`;
  }

  if (hasUnknownWords) {
    result += ' (some words unknown)';
  }

  return result;
}

/**
 * Fallback: Detect meter based on syllable counts only
 */
function detectMeterBySyllables(text: string): string {
  const syllableCounts = getSyllableCounts(text);
  const nonEmptyLines = syllableCounts.filter(count => count > 0);

  if (nonEmptyLines.length === 0) {
    return 'No text to analyze';
  }

  // Calculate most common syllable count
  const countFrequency: Record<number, number> = {};
  nonEmptyLines.forEach(count => {
    countFrequency[count] = (countFrequency[count] || 0) + 1;
  });

  const mostCommonCount = parseInt(
    Object.entries(countFrequency)
      .sort((a, b) => b[1] - a[1])[0][0]
  );

  const consistency = countFrequency[mostCommonCount] / nonEmptyLines.length;

  // Detect meter based on syllable count patterns
  let detectedMeter = detectMeterByPattern(mostCommonCount);

  // Add consistency note
  if (consistency < 0.5) {
    return `Mixed or Free Verse (varying syllable counts)`;
  } else if (consistency < 0.8) {
    return `${detectedMeter} (with variations)`;
  } else {
    return detectedMeter;
  }
}

/**
 * Detect specific meter pattern based on syllable counts
 */
function detectMeterByPattern(commonCount: number): string {
  // Check for specific meters based on syllable count
  switch (commonCount) {
    case 10:
      return 'Iambic Pentameter';
    case 8:
      // Could be iambic or trochaic tetrameter
      return 'Iambic Tetrameter';
    case 6:
      return 'Iambic Trimeter';
    case 12:
      // Could be anapestic tetrameter or dactylic tetrameter
      return 'Anapestic or Dactylic Tetrameter';
    case 9:
      return 'Anapestic Trimeter';
    case 14:
      return 'Iambic Heptameter (Fourteener)';
    case 7:
      return 'Heptasyllabic (7 syllables per line)';
    case 5:
      return 'Pentasyllabic (5 syllables per line)';
    case 17:
    case 18:
      return 'Dactylic Hexameter';
    default:
      if (commonCount >= 15) {
        return `Long-line meter (${commonCount} syllables per line)`;
      } else if (commonCount <= 3) {
        return `Short-line meter (${commonCount} syllables per line)`;
      }
      return `Regular meter (${commonCount} syllables per line)`;
  }
}

/**
 * Check if text follows a haiku pattern (5-7-5)
 */
export function isHaiku(text: string): boolean {
  const syllableCounts = getSyllableCounts(text);
  const nonEmptyLines = syllableCounts.filter(count => count > 0);

  return nonEmptyLines.length === 3 &&
    nonEmptyLines[0] === 5 &&
    nonEmptyLines[1] === 7 &&
    nonEmptyLines[2] === 5;
}

/**
 * Analyze meter consistency
 */
export function analyzeMeterConsistency(text: string): {
  isConsistent: boolean;
  variance: number;
  averageSyllables: number;
} {
  const syllableCounts = getSyllableCounts(text);
  const nonEmptyLines = syllableCounts.filter(count => count > 0);

  if (nonEmptyLines.length === 0) {
    return { isConsistent: false, variance: 0, averageSyllables: 0 };
  }

  const average = nonEmptyLines.reduce((sum, count) => sum + count, 0) / nonEmptyLines.length;
  const variance = nonEmptyLines.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / nonEmptyLines.length;

  return {
    isConsistent: variance < 2, // Low variance means consistent
    variance: Math.round(variance * 100) / 100,
    averageSyllables: Math.round(average * 10) / 10,
  };
}

/**
 * Get detailed meter information
 */
export function getMeterInfo(meterName: string): MeterPattern | undefined {
  return METER_PATTERNS.find(pattern => pattern.name === meterName);
}
