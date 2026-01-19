/**
 * Defines which aspects of poetry each form constrains
 */

export interface FormConstraints {
  lineCount?: number; // Exact number of lines required
  meter?: boolean; // Whether meter is constrained
  syllablePattern?: boolean; // Whether syllable count pattern is constrained
  rhymeScheme?: boolean; // Whether rhyme scheme is constrained
  stanzaStructure?: boolean; // Whether stanza structure is constrained
  lineLength?: boolean; // Whether line length is constrained
}

/**
 * Get the constraints for a specific poetic form
 */
export function getFormConstraints(form: string): FormConstraints {
  switch (form) {
    case 'Shakespearean Sonnet':
    case 'Petrarchan Sonnet':
    case 'Spenserian Sonnet':
      return {
        lineCount: 14,
        meter: true, // Iambic pentameter (10 syllables)
        syllablePattern: true, // 10 syllables per line
        rhymeScheme: true,
        stanzaStructure: false,
        lineLength: false,
      };

    case 'Haiku':
      return {
        lineCount: 3,
        meter: false,
        syllablePattern: true, // 5-7-5 pattern
        rhymeScheme: false,
        stanzaStructure: false,
        lineLength: false,
      };

    case 'Limerick':
      return {
        lineCount: 5,
        meter: true, // Anapestic meter
        syllablePattern: true, // Lines 1,2,5: 7-10 syllables; Lines 3,4: 5-7 syllables
        rhymeScheme: true, // AABBA
        stanzaStructure: false,
        lineLength: false,
      };

    case 'Villanelle':
      return {
        lineCount: 19,
        meter: false,
        syllablePattern: false,
        rhymeScheme: true, // ABA ABA ABA ABA ABA ABAA
        stanzaStructure: true, // Five tercets + one quatrain
        lineLength: false,
      };

    case 'Ballad Stanza':
      return {
        lineCount: undefined, // Multiples of 4
        meter: true, // Often alternating tetrameter/trimeter
        syllablePattern: false,
        rhymeScheme: true, // ABCB or ABAB
        stanzaStructure: true, // 4-line stanzas
        lineLength: false,
      };

    case 'Terza Rima':
      return {
        lineCount: undefined, // Variable
        meter: true, // Often iambic pentameter
        syllablePattern: false,
        rhymeScheme: true, // ABA BCB CDC...
        stanzaStructure: true, // Tercets (3-line stanzas)
        lineLength: false,
      };

    case 'Blank Verse':
      return {
        lineCount: undefined, // Variable
        meter: true, // Unrhymed iambic pentameter
        syllablePattern: true, // 10 syllables per line
        rhymeScheme: false, // No rhyme
        stanzaStructure: false,
        lineLength: false,
      };

    case 'Tanka':
      return {
        lineCount: 5,
        meter: false,
        syllablePattern: true, // 5-7-5-7-7 pattern
        rhymeScheme: false,
        stanzaStructure: false,
        lineLength: false,
      };

    case 'Cinquain':
      return {
        lineCount: 5,
        meter: false,
        syllablePattern: true, // 2-4-6-8-2 pattern
        rhymeScheme: false,
        stanzaStructure: false,
        lineLength: false,
      };

    case 'Pantoum':
      return {
        lineCount: undefined, // Variable, multiples of 4
        meter: false,
        syllablePattern: false,
        rhymeScheme: true, // ABAB repeating
        stanzaStructure: true, // Quatrains with line repetition
        lineLength: false,
      };

    case 'Ottava Rima':
      return {
        lineCount: undefined, // Multiples of 8
        meter: true, // Iambic pentameter
        syllablePattern: true, // 10 syllables per line
        rhymeScheme: true, // ABABABCC
        stanzaStructure: true, // 8-line stanzas
        lineLength: false,
      };

    case 'Free Verse':
    default:
      return {
        lineCount: undefined,
        meter: false,
        syllablePattern: false,
        rhymeScheme: false,
        stanzaStructure: false,
        lineLength: false,
      };
  }
}

/**
 * Check if a specific aspect is constrained by the form
 */
export function isConstrained(form: string, aspect: keyof FormConstraints): boolean {
  const constraints = getFormConstraints(form);
  return Boolean(constraints[aspect]);
}

/**
 * Get a human-readable description of the constraint
 */
export function getConstraintDescription(form: string, aspect: keyof FormConstraints): string | null {
  const constraints = getFormConstraints(form);

  if (!constraints[aspect]) return null;

  switch (aspect) {
    case 'lineCount':
      return constraints.lineCount ? `Requires ${constraints.lineCount} lines` : null;

    case 'meter':
      if (form.includes('Sonnet')) return 'Iambic pentameter (10 syllables)';
      if (form === 'Blank Verse') return 'Unrhymed iambic pentameter';
      if (form === 'Limerick') return 'Anapestic meter';
      if (form === 'Terza Rima') return 'Often iambic pentameter';
      if (form === 'Ottava Rima') return 'Iambic pentameter';
      if (form === 'Ballad Stanza') return 'Alternating meter';
      return 'Meter constrained';

    case 'syllablePattern':
      if (form === 'Haiku') return '5-7-5 syllable pattern';
      if (form === 'Tanka') return '5-7-5-7-7 syllable pattern';
      if (form === 'Cinquain') return '2-4-6-8-2 syllable pattern';
      if (form.includes('Sonnet')) return '10 syllables per line';
      if (form === 'Blank Verse') return '10 syllables per line';
      if (form === 'Ottava Rima') return '10 syllables per line';
      if (form === 'Limerick') return 'Lines 1,2,5: 7-10 syllables; Lines 3,4: 5-7 syllables';
      return 'Syllable pattern constrained';

    case 'rhymeScheme':
      if (form === 'Shakespearean Sonnet') return 'ABAB CDCD EFEF GG';
      if (form === 'Petrarchan Sonnet') return 'ABBAABBA + sestet';
      if (form === 'Spenserian Sonnet') return 'ABAB BCBC CDCD EE';
      if (form === 'Limerick') return 'AABBA';
      if (form === 'Villanelle') return 'ABA ABA ABA ABA ABA ABAA';
      if (form === 'Pantoum') return 'ABAB (repeating lines)';
      if (form === 'Ottava Rima') return 'ABABABCC';
      if (form === 'Ballad Stanza') return 'ABCB or ABAB';
      if (form === 'Terza Rima') return 'ABA BCB CDC...';
      return 'Rhyme scheme constrained';

    case 'stanzaStructure':
      if (form === 'Villanelle') return 'Five tercets + one quatrain';
      if (form === 'Pantoum') return 'Quatrains with repeating lines';
      if (form === 'Ottava Rima') return '8-line stanzas';
      if (form === 'Ballad Stanza') return '4-line stanzas';
      if (form === 'Terza Rima') return 'Tercets (3-line stanzas)';
      return 'Stanza structure constrained';

    default:
      return null;
  }
}

/**
 * Evaluate how well the poem meets a specific constraint
 * Returns 'perfect', 'good', 'poor', or 'none'
 */
export function evaluateConstraint(
  form: string,
  aspect: keyof FormConstraints,
  poemData: {
    lineCount: number;
    fitScore?: number;
    fit?: 'high' | 'medium' | 'low' | 'none';
  }
): 'perfect' | 'good' | 'poor' | 'none' {
  const constraints = getFormConstraints(form);

  // If this aspect isn't constrained, return 'none'
  if (!constraints[aspect]) return 'none';

  switch (aspect) {
    case 'lineCount':
      if (!constraints.lineCount) return 'none';
      if (poemData.lineCount === constraints.lineCount) return 'perfect';
      // Close but not exact
      const diff = Math.abs(poemData.lineCount - constraints.lineCount);
      if (diff <= 2) return 'poor';
      return 'poor';

    case 'meter':
    case 'syllablePattern':
    case 'rhymeScheme':
    case 'stanzaStructure':
      // Use the fit score from form detection
      if (!poemData.fitScore && !poemData.fit) return 'poor';

      if (poemData.fit === 'high' || (poemData.fitScore && poemData.fitScore >= 95)) {
        return 'perfect';
      } else if (poemData.fit === 'medium' || (poemData.fitScore && poemData.fitScore >= 70)) {
        return 'good';
      } else if (poemData.fit === 'low' || (poemData.fitScore && poemData.fitScore >= 40)) {
        return 'poor';
      }
      return 'poor';

    default:
      return 'none';
  }
}
