/**
 * Tense Consistency Checker
 * Detects past, present, and future tense usage and flags inconsistencies
 */

import nlp from 'compromise';

export interface TenseInstance {
  verb: string;
  tense: 'past' | 'present' | 'future';
  lineIndex: number;
  context: string; // surrounding words for context
  startOffset: number;
  endOffset: number;
}

export interface TenseAnalysis {
  instances: TenseInstance[];
  dominantTense: 'past' | 'present' | 'future' | 'mixed';
  pastCount: number;
  presentCount: number;
  futureCount: number;
  isConsistent: boolean;
  inconsistentLines: number[]; // lines that deviate from dominant tense
  consistency: 'consistent' | 'mostly consistent' | 'mixed';
}

/**
 * Analyze tense usage in the text
 */
export function analyzeTense(text: string): TenseAnalysis {
  const lines = text.split('\n');
  const instances: TenseInstance[] = [];

  let pastCount = 0;
  let presentCount = 0;
  let futureCount = 0;

  // Track character offset as we process lines
  let lineStartOffset = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const trimmed = line.trim();

    if (!trimmed) {
      // Move to next line (add line length + newline character)
      lineStartOffset += line.length + 1;
      continue;
    }

    const doc = nlp(trimmed);

    // Get all verbs with their tense
    doc.verbs().forEach((verb: any) => {
      const verbText = verb.text();
      const json = verb.json()[0];

      if (!json || !json.terms || json.terms.length === 0) return;

      const tags = json.terms[0].tags || [];

      let tense: 'past' | 'present' | 'future' | null = null;

      // Check for future tense (will/shall + verb)
      if (tags.includes('FutureTense') || verbText.toLowerCase().startsWith('will ') || verbText.toLowerCase().startsWith('shall ')) {
        tense = 'future';
        futureCount++;
      }
      // Check for past tense
      else if (tags.includes('PastTense')) {
        tense = 'past';
        pastCount++;
      }
      // Check for present tense
      else if (tags.includes('PresentTense') || tags.includes('Infinitive')) {
        tense = 'present';
        presentCount++;
      }

      if (tense) {
        // Get surrounding context
        const words = trimmed.split(/\s+/);
        const verbWords = verbText.toLowerCase().split(/\s+/);
        const verbIndex = words.findIndex(w => verbWords.includes(w.toLowerCase().replace(/[^\w]/g, '')));
        const start = Math.max(0, verbIndex - 2);
        const end = Math.min(words.length, verbIndex + 3);
        const context = words.slice(start, end).join(' ');

        // Calculate character offset within the original line
        // Find the verb text in the original line (case-insensitive search)
        const verbLower = verbText.toLowerCase();
        const lineLower = line.toLowerCase();
        const verbPosInLine = lineLower.indexOf(verbLower);

        let startOffset = lineStartOffset;
        let endOffset = lineStartOffset + verbText.length;

        if (verbPosInLine !== -1) {
          startOffset = lineStartOffset + verbPosInLine;
          endOffset = startOffset + verbText.length;
        }

        instances.push({
          verb: verbText,
          tense,
          lineIndex,
          context,
          startOffset,
          endOffset,
        });
      }
    });

    // Move to next line (add line length + newline character)
    lineStartOffset += line.length + 1;
  }

  // Determine dominant tense
  const total = pastCount + presentCount + futureCount;
  let dominantTense: 'past' | 'present' | 'future' | 'mixed' = 'mixed';

  if (total > 0) {
    if (pastCount > presentCount && pastCount > futureCount) {
      dominantTense = 'past';
    } else if (presentCount > pastCount && presentCount > futureCount) {
      dominantTense = 'present';
    } else if (futureCount > pastCount && futureCount > presentCount) {
      dominantTense = 'future';
    }
  }

  // Find inconsistent lines (lines that deviate from dominant tense)
  const inconsistentLines: number[] = [];

  if (dominantTense !== 'mixed') {
    const linesTenses = new Map<number, Set<string>>();

    for (const instance of instances) {
      if (!linesTenses.has(instance.lineIndex)) {
        linesTenses.set(instance.lineIndex, new Set());
      }
      linesTenses.get(instance.lineIndex)!.add(instance.tense);
    }

    for (const [lineIndex, tenses] of linesTenses) {
      // If line has verbs not matching dominant tense
      if (!tenses.has(dominantTense) || tenses.size > 1) {
        if (!inconsistentLines.includes(lineIndex)) {
          inconsistentLines.push(lineIndex);
        }
      }
    }
  }

  // Determine consistency level
  let consistency: 'consistent' | 'mostly consistent' | 'mixed' = 'consistent';
  const dominantCount = dominantTense === 'past' ? pastCount :
                        dominantTense === 'present' ? presentCount :
                        dominantTense === 'future' ? futureCount : 0;

  if (total > 0) {
    const dominantPercentage = (dominantCount / total) * 100;

    if (dominantPercentage >= 90) {
      consistency = 'consistent';
    } else if (dominantPercentage >= 70) {
      consistency = 'mostly consistent';
    } else {
      consistency = 'mixed';
    }
  }

  return {
    instances,
    dominantTense,
    pastCount,
    presentCount,
    futureCount,
    isConsistent: consistency === 'consistent',
    inconsistentLines: inconsistentLines.sort((a, b) => a - b),
    consistency,
  };
}

/**
 * Get a human-readable summary of tense analysis
 */
export function getTenseSummary(analysis: TenseAnalysis): string {
  if (analysis.instances.length === 0) {
    return 'No verbs detected';
  }

  const parts: string[] = [];

  if (analysis.dominantTense !== 'mixed') {
    parts.push(`Primarily ${analysis.dominantTense} tense`);
  } else {
    parts.push('Mixed tenses');
  }

  if (analysis.inconsistentLines.length > 0) {
    parts.push(`${analysis.inconsistentLines.length} line(s) deviate`);
  }

  return parts.join(' - ');
}
