/**
 * Advanced rhythm analysis utilities
 */

/**
 * Analyze rhythm variation pattern in the poem
 * Returns descriptive categories, not judgmental scores
 */
export function analyzeRhythmVariation(syllableCounts: number[]): {
  category: string;
  explanation: string;
  outlierLines: Array<{ lineNumber: number; syllableCount: number }>;
  medianSyllableCount: number;
} {
  const nonEmptyLines = syllableCounts.filter(c => c > 0);

  if (nonEmptyLines.length === 0) {
    return {
      category: 'No data',
      explanation: 'Not enough lines to analyze',
      outlierLines: [],
      medianSyllableCount: 0
    };
  }

  // Calculate median
  const sortedCounts = [...nonEmptyLines].sort((a, b) => a - b);
  const median = sortedCounts.length % 2 === 0
    ? (sortedCounts[sortedCounts.length / 2 - 1] + sortedCounts[sortedCounts.length / 2]) / 2
    : sortedCounts[Math.floor(sortedCounts.length / 2)];

  // Count unique syllable counts
  const uniqueCounts = new Set(nonEmptyLines);
  const uniqueLineLengths = uniqueCounts.size;

  // Calculate variance
  const average = nonEmptyLines.reduce((sum, count) => sum + count, 0) / nonEmptyLines.length;
  const variance = nonEmptyLines.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / nonEmptyLines.length;
  const stdDev = Math.sqrt(variance);

  let category: string;
  let explanation: string;

  if (uniqueLineLengths === 1) {
    category = 'Perfectly Uniform';
    explanation = 'All lines have identical syllable counts. Common in traditional forms like sonnets, haiku, and ballads.';
  } else if (stdDev < 1.5) {
    category = 'Highly Consistent';
    explanation = 'Minimal variation between lines. Typical of structured poetry with occasional substitutions.';
  } else if (stdDev < 3) {
    category = 'Moderately Varied';
    explanation = 'Mix of longer and shorter lines, common in odes and free verse with structure.';
  } else if (stdDev < 5) {
    category = 'Highly Varied';
    explanation = 'Significant diversity in line lengths. Free verse style with intentional rhythm changes.';
  } else {
    category = 'Experimental';
    explanation = 'Extreme variation in line lengths. Stream of consciousness or highly experimental form.';
  }

  // Find outlier lines (lines that deviate more than 15% from median)
  const outlierLines: Array<{ lineNumber: number; syllableCount: number }> = [];
  let actualLineNumber = 0;
  syllableCounts.forEach((count, index) => {
    if (count > 0) {
      const percentageVariation = median > 0 ? Math.abs((count - median) / median) * 100 : 0;
      if (percentageVariation > 15) {
        outlierLines.push({
          lineNumber: index + 1, // 1-indexed for display
          syllableCount: count
        });
      }
      actualLineNumber++;
    }
  });

  return {
    category,
    explanation,
    outlierLines,
    medianSyllableCount: Math.round(median)
  };
}

/**
 * Analyze line length consistency (in words, not syllables)
 * Shows outlier lines similar to syllable violations
 */
export function analyzeLineLengthConsistency(text: string): {
  averageWords: number;
  medianWords: number;
  consistency: string;
  outlierLines: Array<{ lineNumber: number; wordCount: number }>;
  allLines: Array<{ lineNumber: number; wordCount: number }>;
  totalLines: number;
} {
  const lines = text.split('\n');

  if (lines.filter(line => line.trim().length > 0).length === 0) {
    return {
      averageWords: 0,
      medianWords: 0,
      consistency: 'No data',
      outlierLines: [],
      allLines: [],
      totalLines: 0
    };
  }

  // Count words per line (including empty lines for proper indexing)
  const allLines: Array<{ lineNumber: number; wordCount: number }> = [];
  const wordCountsForCalc: number[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.length > 0) {
      const words = trimmed.split(/\s+/);
      const wordCount = words.filter(w => w.length > 0).length;
      allLines.push({
        lineNumber: index + 1, // 1-indexed for display
        wordCount
      });
      wordCountsForCalc.push(wordCount);
    }
  });

  // Calculate average
  const total = wordCountsForCalc.reduce((sum, count) => sum + count, 0);
  const average = total / wordCountsForCalc.length;

  // Calculate median
  const sortedCounts = [...wordCountsForCalc].sort((a, b) => a - b);
  const median = sortedCounts.length % 2 === 0
    ? (sortedCounts[sortedCounts.length / 2 - 1] + sortedCounts[sortedCounts.length / 2]) / 2
    : sortedCounts[Math.floor(sortedCounts.length / 2)];

  // Find outliers (lines that deviate >2 words from median)
  const outlierLines = allLines.filter(line => Math.abs(line.wordCount - median) > 2);

  // Determine consistency label
  const stdDev = Math.sqrt(
    wordCountsForCalc.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / wordCountsForCalc.length
  );

  let consistency: string;
  if (stdDev < 1) {
    consistency = 'Very Consistent';
  } else if (stdDev < 2) {
    consistency = 'Consistent';
  } else if (stdDev < 3) {
    consistency = 'Moderately Varied';
  } else if (stdDev < 5) {
    consistency = 'Varied';
  } else {
    consistency = 'Highly Varied';
  }

  return {
    averageWords: Math.round(average * 10) / 10,
    medianWords: Math.round(median),
    consistency,
    outlierLines,
    allLines,
    totalLines: allLines.length
  };
}

/**
 * Analyze punctuation patterns in the poem
 * Provides educational context about the effects
 */
export function analyzePunctuationPatterns(text: string): {
  endStopCount: number;
  enjambmentCount: number;
  enjambmentPercentage: number;
  pattern: string;
  effect: string;
  enjambedLines: number[];
  commaCount: number;
  questionCount: number;
  exclamationCount: number;
  dashCount: number;
  semicolonCount: number;
  colonCount: number;
} {
  const lines = text.split('\n');
  const nonEmptyLines = lines.filter(line => line.trim().length > 0);

  if (nonEmptyLines.length === 0) {
    return {
      endStopCount: 0,
      enjambmentCount: 0,
      enjambmentPercentage: 0,
      pattern: 'No data',
      effect: '',
      enjambedLines: [],
      commaCount: 0,
      questionCount: 0,
      exclamationCount: 0,
      dashCount: 0,
      semicolonCount: 0,
      colonCount: 0
    };
  }

  let endStopCount = 0;
  let enjambmentCount = 0;
  const enjambedLines: number[] = [];
  let commaCount = 0;
  let questionCount = 0;
  let exclamationCount = 0;
  let dashCount = 0;
  let semicolonCount = 0;
  let colonCount = 0;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return;

    // Count specific punctuation
    commaCount += (trimmed.match(/,/g) || []).length;
    questionCount += (trimmed.match(/\?/g) || []).length;
    exclamationCount += (trimmed.match(/!/g) || []).length;
    dashCount += (trimmed.match(/[—–-]{1,}/g) || []).length;
    semicolonCount += (trimmed.match(/;/g) || []).length;
    colonCount += (trimmed.match(/:/g) || []).length;

    // Check if line ends with end-stop punctuation
    if (trimmed.match(/[.!?;:]$/)) {
      endStopCount++;
    } else {
      // Line doesn't end with punctuation = enjambment
      enjambmentCount++;
      enjambedLines.push(index + 1); // 1-indexed for display
    }
  });

  const enjambmentPercentage = nonEmptyLines.length > 0
    ? Math.round((enjambmentCount / nonEmptyLines.length) * 100)
    : 0;

  // Determine pattern and effect
  let pattern: string;
  let effect: string;

  if (enjambmentPercentage > 70) {
    pattern = 'Heavy Enjambment';
    effect = 'Creates flowing momentum and urgency. Lines spill into each other, building energy.';
  } else if (enjambmentPercentage > 40) {
    pattern = 'Mixed Flow';
    effect = 'Balances flowing movement with deliberate pauses. Varied pacing keeps reader engaged.';
  } else if (enjambmentPercentage > 20) {
    pattern = 'Mostly End-Stopped';
    effect = 'Creates clear pauses and emphasis at line breaks. Each line feels complete.';
  } else {
    pattern = 'Fully End-Stopped';
    effect = 'Strong emphasis on each line ending. Creates formal, measured rhythm.';
  }

  return {
    endStopCount,
    enjambmentCount,
    enjambmentPercentage,
    pattern,
    effect,
    enjambedLines,
    commaCount,
    questionCount,
    exclamationCount,
    dashCount,
    semicolonCount,
    colonCount
  };
}
