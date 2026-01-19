/**
 * Poetic form detection
 * Detects specific poetry forms like sonnets, haikus, limericks, villanelles, etc.
 */

import { getSyllableCounts } from './syllableCounter';
import { detectRhymeScheme } from './rhymeScheme';

export interface DetectedForm {
  form: string;
  fit: 'high' | 'medium' | 'low' | 'none'; // How well the poem fits the form
  expectedPattern?: string;
  actualPattern?: string;
  issues?: string[];
  description?: string;
  fitScore?: number; // 0-100 score
}

/**
 * Detect the poetic form of the given text
 */
export function detectPoetricForm(text: string): DetectedForm {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const lineCount = lines.length;

  if (lineCount === 0) {
    return {
      form: 'Free Verse',
      fit: 'none',
      description: 'Not enough content to determine form'
    };
  }

  const syllableCounts = getSyllableCounts(text);
  const rhymeScheme = detectRhymeScheme(text);
  const schemeStr = rhymeScheme.schemePattern.join('');

  // Check for Haiku
  if (lineCount === 3) {
    return detectHaiku(syllableCounts);
  }

  // Check for Limerick
  if (lineCount === 5) {
    return detectLimerick(syllableCounts, schemeStr);
  }

  // Check for Sonnet (14 lines)
  if (lineCount === 14) {
    return detectSonnet(syllableCounts, schemeStr);
  }

  // Check for Villanelle (19 lines)
  if (lineCount === 19) {
    const villanelleResult = detectVillanelle(schemeStr);
    if (villanelleResult.fit !== 'none') {
      return villanelleResult;
    }
  }

  // Check for Terza Rima (variable length, typically 9+ lines)
  if (lineCount >= 9) {
    const terzaResult = detectTerzaRima(schemeStr);
    if (terzaResult.fit !== 'none') {
      return terzaResult;
    }
  }

  // Check for Ballad Stanza (multiples of 4 lines)
  if (lineCount >= 4 && lineCount % 4 === 0) {
    const balladResult = detectBallad(schemeStr, lineCount);
    if (balladResult.fit !== 'none') {
      return balladResult;
    }
  }

  // Default to Free Verse
  return {
    form: 'Free Verse',
    fit: 'high',
    description: 'No specific form detected - likely free verse or experimental form'
  };
}

/**
 * Evaluate how well a poem fits a specific form
 * This is useful when the user manually selects a form
 */
export function evaluateFormFit(text: string, targetForm: string): DetectedForm {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const lineCount = lines.length;
  const syllableCounts = getSyllableCounts(text);
  const rhymeScheme = detectRhymeScheme(text);
  const schemeStr = rhymeScheme.schemePattern.join('');

  // Evaluate based on the target form
  switch (targetForm) {
    case 'Haiku':
      if (lineCount === 3) {
        return detectHaiku(syllableCounts);
      }
      return {
        form: 'Haiku',
        fit: 'none',
        issues: [`Expected 3 lines, found ${lineCount}`],
        description: 'Traditional Japanese haiku form: 3 lines with 5-7-5 syllable pattern'
      };

    case 'Limerick':
      if (lineCount === 5) {
        return detectLimerick(syllableCounts, schemeStr);
      }
      return {
        form: 'Limerick',
        fit: 'none',
        issues: [`Expected 5 lines, found ${lineCount}`],
        description: 'Five-line humorous poem with AABBA rhyme scheme'
      };

    case 'Shakespearean Sonnet':
    case 'Petrarchan Sonnet':
    case 'Spenserian Sonnet':
      if (lineCount === 14) {
        return detectSonnet(syllableCounts, schemeStr);
      }
      return {
        form: targetForm,
        fit: 'none',
        issues: [`Expected 14 lines, found ${lineCount}`],
        description: 'Sonnets require exactly 14 lines'
      };

    case 'Villanelle':
      if (lineCount === 19) {
        return detectVillanelle(schemeStr);
      }
      return {
        form: 'Villanelle',
        fit: 'none',
        issues: [`Expected 19 lines, found ${lineCount}`],
        description: 'Villanelle: 19-line form with specific rhyme and refrain pattern'
      };

    case 'Ballad Stanza':
      return detectBallad(schemeStr, lineCount);

    case 'Terza Rima':
      if (lineCount >= 9) {
        return detectTerzaRima(schemeStr);
      }
      return {
        form: 'Terza Rima',
        fit: 'none',
        issues: [`Expected at least 9 lines, found ${lineCount}`],
        description: 'Terza Rima: interlocking ABA BCB CDC... rhyme scheme'
      };

    case 'Blank Verse':
      return detectBlankVerse(syllableCounts, schemeStr);

    case 'Tanka':
      if (lineCount === 5) {
        return detectTanka(syllableCounts);
      }
      return {
        form: 'Tanka',
        fit: 'none',
        issues: [`Expected 5 lines, found ${lineCount}`],
        description: 'Traditional Japanese tanka form: 5 lines with 5-7-5-7-7 syllable pattern'
      };

    case 'Cinquain':
      if (lineCount === 5) {
        return detectCinquain(syllableCounts);
      }
      return {
        form: 'Cinquain',
        fit: 'none',
        issues: [`Expected 5 lines, found ${lineCount}`],
        description: 'Cinquain: 5 lines with 2-4-6-8-2 syllable pattern'
      };

    case 'Pantoum':
      if (lineCount >= 8 && lineCount % 4 === 0) {
        return detectPantoum(schemeStr, lineCount);
      }
      return {
        form: 'Pantoum',
        fit: 'none',
        issues: [`Expected at least 8 lines in quatrains, found ${lineCount}`],
        description: 'Pantoum: quatrains with ABAB rhyme and repeating lines'
      };

    case 'Ottava Rima':
      if (lineCount >= 8 && lineCount % 8 === 0) {
        return detectOttavaRima(schemeStr, syllableCounts, lineCount);
      }
      return {
        form: 'Ottava Rima',
        fit: 'none',
        issues: [`Expected multiples of 8 lines, found ${lineCount}`],
        description: 'Ottava Rima: 8-line stanzas with ABABABCC rhyme scheme'
      };

    case 'Free Verse':
      return {
        form: 'Free Verse',
        fit: 'high',
        description: 'Free verse has no specific requirements'
      };

    default:
      return {
        form: targetForm,
        fit: 'none',
        description: `Cannot evaluate fit for ${targetForm}`
      };
  }
}

/**
 * Detect if the poem is a Haiku
 */
function detectHaiku(syllableCounts: number[]): DetectedForm {
  const expected = [5, 7, 5];
  const issues: string[] = [];

  if (syllableCounts.length !== 3) {
    return {
      form: 'Haiku',
      fit: 'low',
      description: 'Has 3 lines but syllable pattern does not match traditional haiku (5-7-5)',
      issues: ['Expected 3 lines with 5-7-5 syllable pattern']
    };
  }

  for (let i = 0; i < 3; i++) {
    if (syllableCounts[i] !== expected[i]) {
      issues.push(`Line ${i + 1}: has ${syllableCounts[i]} syllables, expected ${expected[i]}`);
    }
  }

  if (issues.length === 0) {
    return {
      form: 'Haiku',
      fit: 'high',
      description: 'Traditional Japanese haiku form: 3 lines with 5-7-5 syllable pattern'
    };
  }

  return {
    form: 'Haiku',
    fit: 'medium',
    description: 'Has 3 lines but syllable pattern deviates from traditional haiku (5-7-5)',
    issues
  };
}

/**
 * Detect if the poem is a Limerick
 */
function detectLimerick(syllableCounts: number[], schemeStr: string): DetectedForm {
  const issues: string[] = [];

  // Check rhyme scheme (should be AABBA)
  if (schemeStr !== 'AABBA') {
    issues.push(`Rhyme scheme is ${schemeStr}, expected AABBA`);
  }

  // Check syllable patterns
  // Lines 1, 2, 5 should have 7-10 syllables (A rhyme - longer lines)
  // Lines 3, 4 should have 5-7 syllables (B rhyme - shorter lines)
  const expectedLong = [0, 1, 4]; // Indices of long lines
  const expectedShort = [2, 3]; // Indices of short lines

  for (const i of expectedLong) {
    if (syllableCounts[i] < 7 || syllableCounts[i] > 10) {
      issues.push(`Line ${i + 1}: has ${syllableCounts[i]} syllables, expected 7-10`);
    }
  }

  for (const i of expectedShort) {
    if (syllableCounts[i] < 5 || syllableCounts[i] > 7) {
      issues.push(`Line ${i + 1}: has ${syllableCounts[i]} syllables, expected 5-7`);
    }
  }

  if (issues.length === 0) {
    return {
      form: 'Limerick',
      fit: 'high',
      description: 'Five-line humorous poem with AABBA rhyme scheme'
    };
  }

  if (issues.length <= 2) {
    return {
      form: 'Limerick',
      fit: 'medium',
      description: 'Has 5 lines but deviates slightly from traditional limerick pattern',
      issues
    };
  }

  return {
    form: 'Limerick',
    fit: 'low',
    description: 'Has 5 lines but does not match traditional limerick pattern',
    issues
  };
}

/**
 * Detect if the poem is a Sonnet (Shakespearean, Petrarchan, or Spenserian)
 */
function detectSonnet(syllableCounts: number[], schemeStr: string): DetectedForm {
  const issues: string[] = [];

  // Check for Shakespearean Sonnet (ABABCDCDEFEFGG)
  // Method 1: Check exact structural matching (works when all rhymes are detected)
  const isShakespeareanExact =
    schemeStr.length === 14 &&
    schemeStr[0] === schemeStr[2] && schemeStr[1] === schemeStr[3] && // ABAB
    schemeStr[4] === schemeStr[6] && schemeStr[5] === schemeStr[7] && // CDCD
    schemeStr[8] === schemeStr[10] && schemeStr[9] === schemeStr[11] && // EFEF
    schemeStr[12] === schemeStr[13]; // GG

  // Method 2: Check structural pattern even if letters don't match perfectly
  // This handles cases where some rhymes aren't detected (e.g., historical pronunciation)
  let structuralMatches = 0;
  if (schemeStr.length === 14) {
    // Q1: Lines 1,3 rhyme AND lines 2,4 rhyme (ABAB pattern)
    if (schemeStr[0] === schemeStr[2] && schemeStr[1] === schemeStr[3]) structuralMatches++;
    // Q2: Lines 5,7 rhyme AND lines 6,8 rhyme (CDCD pattern)
    if (schemeStr[4] === schemeStr[6] && schemeStr[5] === schemeStr[7]) structuralMatches++;
    // Q3: Lines 9,11 rhyme AND lines 10,12 rhyme (EFEF pattern)
    if (schemeStr[8] === schemeStr[10] && schemeStr[9] === schemeStr[11]) structuralMatches++;
    // Couplet: Lines 13,14 rhyme (GG)
    if (schemeStr[12] === schemeStr[13]) structuralMatches++;

    // Additionally check that quatrains use alternating pattern (not AABB or ABBA)
    const q1Alternates = schemeStr[0] !== schemeStr[1];
    const q2Alternates = schemeStr[4] !== schemeStr[5];
    const q3Alternates = schemeStr[8] !== schemeStr[9];
    if (q1Alternates && q2Alternates && q3Alternates) structuralMatches++;
  }

  // If 4 or 5 out of 5 structural rules match, it's likely a Shakespearean sonnet
  const isShakespeareanStructure = isShakespeareanExact || structuralMatches >= 4;

  if (isShakespeareanStructure) {
    let fitScore = 100;

    // Count imperfect rhymes (positions where structure matches but letters differ)
    let imperfectRhymes = 0;
    if (!isShakespeareanExact && structuralMatches >= 4) {
      // Check each quatrain for letter mismatches
      const positions = [
        [0, 2], [1, 3], // Q1
        [4, 6], [5, 7], // Q2
        [8, 10], [9, 11], // Q3
        [12, 13] // Couplet
      ];

      for (const [i, j] of positions) {
        if (schemeStr[i] !== schemeStr[j]) {
          imperfectRhymes++;
        }
      }

      // Penalize 15 points per imperfect rhyme
      fitScore -= imperfectRhymes * 15;

      if (imperfectRhymes > 0) {
        issues.push(`Rhyme scheme structure matches Shakespearean pattern with ${imperfectRhymes} imperfect rhyme(s)`);
      }
    }

    const fit = fitScore >= 95 ? 'high' : fitScore >= 70 ? 'medium' : 'low';

    return {
      form: 'Shakespearean Sonnet',
      fit,
      fitScore,
      description: 'Shakespearean sonnet: 14 lines, ABAB CDCD EFEF GG rhyme scheme',
      expectedPattern: 'ABABCDCDEFEFGG',
      actualPattern: schemeStr,
      issues: issues.length > 0 ? issues : undefined
    };
  }

  // Check for Petrarchan Sonnet (ABBAABBA + CDECDE/CDCDCD/etc)
  const octavePatternExact = schemeStr.slice(0, 8) === 'ABBAABBA';

  // Structural octave check (allowing imperfect rhymes)
  let octaveStructural = false;
  if (schemeStr.length >= 8) {
    const isEnclosed1 = schemeStr[0] === schemeStr[3] && schemeStr[1] === schemeStr[2];
    const isEnclosed2 = schemeStr[4] === schemeStr[7] && schemeStr[5] === schemeStr[6];
    octaveStructural = isEnclosed1 && isEnclosed2;
  }

  const isPetrarchanOctave = octavePatternExact || octaveStructural;

  if (isPetrarchanOctave) {
    const sestet = schemeStr.slice(8);
    const validSestets = ['CDECDE', 'CDCDCD', 'CDDCEE', 'CDDCDC', 'CDEDCE'];
    const isSestetValid = validSestets.includes(sestet);

    let fitScore = 100;

    if (!octavePatternExact) {
      fitScore -= 15;
      issues.push('Octave has enclosed rhyme structure but with imperfect rhymes');
    }

    if (!isSestetValid) {
      fitScore -= 25;
      issues.push(`Sestet pattern ${sestet} is non-standard (expected CDECDE, CDCDCD, etc.)`);
    }

    const fit = fitScore >= 95 ? 'high' : fitScore >= 70 ? 'medium' : 'low';

    return {
      form: 'Petrarchan Sonnet',
      fit,
      fitScore,
      description: 'Petrarchan sonnet: 14 lines, ABBAABBA octave + variable sestet',
      expectedPattern: 'ABBAABBA + sestet',
      actualPattern: schemeStr,
      issues: issues.length > 0 ? issues : undefined
    };
  }

  // Check for Spenserian Sonnet (ABABBCBCCDCDEE)
  if (schemeStr === 'ABABBCBCCDCDEE') {
    return {
      form: 'Spenserian Sonnet',
      fit: 'high',
      description: 'Spenserian sonnet: 14 lines, ABAB BCBC CDCD EE rhyme scheme',
      expectedPattern: 'ABABBCBCCDCDEE',
      actualPattern: schemeStr
    };
  }

  // Has 14 lines but doesn't match any known sonnet pattern
  return {
    form: 'Sonnet (Unknown type)',
    fit: 'low',
    description: 'Has 14 lines but rhyme scheme does not match Shakespearean, Petrarchan, or Spenserian patterns',
    expectedPattern: 'ABABCDCDEFEFGG or ABBAABBACDECDE or ABABBCBCCDCDEE',
    actualPattern: schemeStr,
    issues: ['Rhyme scheme does not match any known sonnet form']
  };
}

/**
 * Detect if the poem is a Terza Rima
 */
function detectTerzaRima(schemeStr: string): DetectedForm {
  // Terza Rima pattern: ABA BCB CDC DED... (possibly ending with a couplet)
  // The middle rhyme of each tercet becomes the outer rhyme of the next tercet

  if (schemeStr.length < 9) {
    return {
      form: 'Unknown',
      fit: 'none'
    };
  }

  const issues: string[] = [];
  let matchedTercets = 0;
  let totalTercets = 0;

  // Check tercets (groups of 3)
  for (let i = 0; i + 2 < schemeStr.length; i += 3) {
    totalTercets++;
    const tercet = schemeStr.slice(i, i + 3);

    // ABA pattern: first and third lines rhyme, second is different
    const isABA = tercet[0] === tercet[2] && tercet[0] !== tercet[1];

    if (isABA) {
      matchedTercets++;

      // Check interlocking: the B rhyme should match the next tercet's A rhyme
      if (i + 3 < schemeStr.length) {
        const nextTercetFirstLine = schemeStr[i + 3];
        if (tercet[1] !== nextTercetFirstLine) {
          issues.push(`Tercet ${totalTercets} doesn't interlock properly with next tercet`);
        }
      }
    } else {
      issues.push(`Tercet ${totalTercets} (${tercet}) doesn't follow ABA pattern`);
    }
  }

  // If we have a remainder (1-2 lines), it might be a couplet ending
  const remainder = schemeStr.length % 3;
  if (remainder === 2) {
    // Check if it's a couplet (YY pattern)
    const couplet = schemeStr.slice(-2);
    if (couplet[0] === couplet[1]) {
      // Valid ending couplet
    } else {
      issues.push('Final couplet does not rhyme');
    }
  } else if (remainder === 1) {
    issues.push('Odd number of lines - terza rima typically ends with a couplet or completes tercets');
  }

  const matchRatio = totalTercets > 0 ? matchedTercets / totalTercets : 0;

  if (matchRatio >= 0.9 && issues.length === 0) {
    return {
      form: 'Terza Rima',
      fit: 'high',
      description: 'Terza Rima: interlocking tercets with ABA BCB CDC... rhyme scheme',
      expectedPattern: 'ABA BCB CDC...',
      actualPattern: schemeStr
    };
  }

  if (matchRatio >= 0.7) {
    return {
      form: 'Terza Rima',
      fit: 'medium',
      description: 'Follows terza rima pattern with some deviations',
      expectedPattern: 'ABA BCB CDC...',
      actualPattern: schemeStr,
      issues
    };
  }

  return {
    form: 'Unknown',
    fit: 'none'
  };
}

/**
 * Detect if the poem is a Villanelle
 */
function detectVillanelle(schemeStr: string): DetectedForm {
  // Villanelle: 19 lines, ABA ABA ABA ABA ABA ABAA
  // Five tercets (ABA) followed by a quatrain (ABAA)

  if (schemeStr.length !== 19) {
    return {
      form: 'Unknown',
      fit: 'none'
    };
  }

  const expectedPattern = 'ABAABA ABAABA ABAABA';
  const issues: string[] = [];

  // Check the pattern: should be mostly A and B rhymes
  // A positions: 0,2,3,5,6,8,9,11,12,14,15,17,18 (13 positions)
  // B positions: 1,4,7,10,13,16 (6 positions)

  const expectedA = [0, 2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18];
  const expectedB = [1, 4, 7, 10, 13, 16];

  // Find the most common rhyme at A positions
  const aRhymes: { [key: string]: number } = {};
  for (const i of expectedA) {
    const rhyme = schemeStr[i];
    aRhymes[rhyme] = (aRhymes[rhyme] || 0) + 1;
  }
  const mostCommonA = Object.entries(aRhymes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'A';

  // Find the most common rhyme at B positions
  const bRhymes: { [key: string]: number } = {};
  for (const i of expectedB) {
    const rhyme = schemeStr[i];
    bRhymes[rhyme] = (bRhymes[rhyme] || 0) + 1;
  }
  const mostCommonB = Object.entries(bRhymes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'B';

  // Count how many A and B positions actually match
  let aMatches = 0;
  let bMatches = 0;

  for (const i of expectedA) {
    if (schemeStr[i] === mostCommonA) aMatches++;
  }

  for (const i of expectedB) {
    if (schemeStr[i] === mostCommonB) bMatches++;
  }

  const aMatchPercent = (aMatches / expectedA.length) * 100;
  const bMatchPercent = (bMatches / expectedB.length) * 100;

  // If at least 70% of both A and B positions match, consider it a villanelle
  if (aMatchPercent >= 70 && bMatchPercent >= 70) {
    const avgMatchPercent = (aMatchPercent + bMatchPercent) / 2;
    let fitScore = Math.round(avgMatchPercent);

    if (aMatches < expectedA.length) {
      const missing = expectedA.length - aMatches;
      issues.push(`${missing} A-rhyme position(s) don't match the pattern`);
    }

    if (bMatches < expectedB.length) {
      const missing = expectedB.length - bMatches;
      issues.push(`${missing} B-rhyme position(s) don't match the pattern`);
    }

    const fit = fitScore >= 95 ? 'high' : fitScore >= 70 ? 'medium' : 'low';

    return {
      form: 'Villanelle',
      fit,
      fitScore,
      description: 'Villanelle: 19 lines with ABA ABA ABA ABA ABA ABAA rhyme scheme',
      expectedPattern: 'ABA ABA ABA ABA ABA ABAA',
      actualPattern: schemeStr,
      issues: issues.length > 0 ? issues : undefined
    };
  }

  return {
    form: 'Unknown',
    fit: 'none'
  };
}

/**
 * Detect if the poem is a Ballad Stanza
 */
function detectBallad(schemeStr: string, lineCount: number): DetectedForm {
  // Ballad stanza: Typically ABCB or ABAB pattern repeated in 4-line stanzas

  if (lineCount < 4 || lineCount % 4 !== 0) {
    return {
      form: 'Unknown',
      fit: 'none'
    };
  }

  // Check for ABCB pattern repeated
  const abcbPattern = /^(ABCB)+$/;
  if (abcbPattern.test(schemeStr)) {
    return {
      form: 'Ballad Stanza',
      fit: 'high',
      description: 'Traditional ballad form with ABCB rhyme scheme in four-line stanzas',
      expectedPattern: 'ABCB (repeated)',
      actualPattern: schemeStr
    };
  }

  // Check for ABAB pattern repeated
  const ababPattern = /^(ABAB)+$/;
  if (ababPattern.test(schemeStr)) {
    return {
      form: 'Ballad Stanza (Alternate)',
      fit: 'high',
      description: 'Ballad-style poem with ABAB rhyme scheme in four-line stanzas',
      expectedPattern: 'ABAB (repeated)',
      actualPattern: schemeStr
    };
  }

  return {
    form: 'Unknown',
    fit: 'none'
  };
}

/**
 * Detect if the poem is Blank Verse (unrhymed iambic pentameter)
 */
function detectBlankVerse(syllableCounts: number[], schemeStr: string): DetectedForm {
  const issues: string[] = [];

  // Check if there's no rhyme scheme (all lines should be different letters)
  const uniqueRhymes = new Set(schemeStr.split('')).size;
  const hasRhyme = uniqueRhymes < schemeStr.length;

  if (hasRhyme) {
    issues.push('Blank verse should not have rhyme');
  }

  // Check if most lines have 10 syllables (iambic pentameter)
  const pentameterLines = syllableCounts.filter(count => count === 10).length;
  const pentameterRatio = syllableCounts.length > 0 ? pentameterLines / syllableCounts.length : 0;

  if (pentameterRatio < 0.7) {
    issues.push(`Only ${Math.round(pentameterRatio * 100)}% of lines have 10 syllables (expected 70%+ for iambic pentameter)`);
  }

  const fitScore = Math.round(pentameterRatio * 100 * (hasRhyme ? 0.5 : 1));
  const fit = fitScore >= 95 ? 'high' : fitScore >= 70 ? 'medium' : 'low';

  return {
    form: 'Blank Verse',
    fit,
    fitScore,
    description: 'Blank verse: unrhymed iambic pentameter (10 syllables per line)',
    issues: issues.length > 0 ? issues : undefined
  };
}

/**
 * Detect if the poem is a Tanka
 */
function detectTanka(syllableCounts: number[]): DetectedForm {
  const expected = [5, 7, 5, 7, 7];
  const issues: string[] = [];

  if (syllableCounts.length !== 5) {
    return {
      form: 'Tanka',
      fit: 'low',
      description: 'Has 5 lines but syllable pattern does not match traditional tanka (5-7-5-7-7)',
      issues: ['Expected 5 lines with 5-7-5-7-7 syllable pattern']
    };
  }

  for (let i = 0; i < 5; i++) {
    if (syllableCounts[i] !== expected[i]) {
      issues.push(`Line ${i + 1}: has ${syllableCounts[i]} syllables, expected ${expected[i]}`);
    }
  }

  if (issues.length === 0) {
    return {
      form: 'Tanka',
      fit: 'high',
      fitScore: 100,
      description: 'Traditional Japanese tanka form: 5 lines with 5-7-5-7-7 syllable pattern'
    };
  }

  const fitScore = Math.round(((5 - issues.length) / 5) * 100);
  const fit = fitScore >= 70 ? 'medium' : 'low';

  return {
    form: 'Tanka',
    fit,
    fitScore,
    description: 'Has 5 lines but syllable pattern deviates from traditional tanka (5-7-5-7-7)',
    issues
  };
}

/**
 * Detect if the poem is a Cinquain
 */
function detectCinquain(syllableCounts: number[]): DetectedForm {
  const expected = [2, 4, 6, 8, 2];
  const issues: string[] = [];

  if (syllableCounts.length !== 5) {
    return {
      form: 'Cinquain',
      fit: 'low',
      description: 'Has 5 lines but syllable pattern does not match cinquain (2-4-6-8-2)',
      issues: ['Expected 5 lines with 2-4-6-8-2 syllable pattern']
    };
  }

  for (let i = 0; i < 5; i++) {
    if (syllableCounts[i] !== expected[i]) {
      issues.push(`Line ${i + 1}: has ${syllableCounts[i]} syllables, expected ${expected[i]}`);
    }
  }

  if (issues.length === 0) {
    return {
      form: 'Cinquain',
      fit: 'high',
      fitScore: 100,
      description: 'Cinquain: 5 lines with 2-4-6-8-2 syllable pattern'
    };
  }

  const fitScore = Math.round(((5 - issues.length) / 5) * 100);
  const fit = fitScore >= 70 ? 'medium' : 'low';

  return {
    form: 'Cinquain',
    fit,
    fitScore,
    description: 'Has 5 lines but syllable pattern deviates from cinquain (2-4-6-8-2)',
    issues
  };
}

/**
 * Detect if the poem is a Pantoum
 */
function detectPantoum(schemeStr: string, lineCount: number): DetectedForm {
  // Pantoum has ABAB rhyme scheme repeated
  // Note: True pantoums also repeat lines, which we can't easily detect from rhyme scheme alone
  const issues: string[] = [];

  // Check if it follows ABAB pattern repeated
  const ababPattern = /^(ABAB)+$/;
  if (!ababPattern.test(schemeStr)) {
    issues.push(`Rhyme scheme ${schemeStr} doesn't follow ABAB pattern`);
  }

  if (issues.length === 0) {
    return {
      form: 'Pantoum',
      fit: 'medium', // Medium because we can't verify line repetition
      fitScore: 75,
      description: 'Pantoum-style poem with ABAB rhyme scheme (note: true pantoums also repeat specific lines)',
      expectedPattern: 'ABAB (repeated)',
      actualPattern: schemeStr
    };
  }

  return {
    form: 'Pantoum',
    fit: 'low',
    fitScore: 40,
    description: 'Has quatrains but doesn\'t match pantoum ABAB rhyme pattern',
    issues
  };
}

/**
 * Detect if the poem is Ottava Rima
 */
function detectOttavaRima(schemeStr: string, syllableCounts: number[], lineCount: number): DetectedForm {
  // Ottava Rima: 8-line stanzas with ABABABCC rhyme scheme
  const issues: string[] = [];
  const stanzaCount = lineCount / 8;

  // Check rhyme scheme for each stanza
  let matchingStanzas = 0;
  for (let s = 0; s < stanzaCount; s++) {
    const stanzaScheme = schemeStr.slice(s * 8, (s + 1) * 8);

    // Check ABABABCC pattern
    const isOttava =
      stanzaScheme[0] === stanzaScheme[2] && stanzaScheme[0] === stanzaScheme[4] && // AAA pattern
      stanzaScheme[1] === stanzaScheme[3] && stanzaScheme[1] === stanzaScheme[5] && // BBB pattern
      stanzaScheme[6] === stanzaScheme[7] && // CC couplet
      stanzaScheme[0] !== stanzaScheme[1] && // A ≠ B
      stanzaScheme[0] !== stanzaScheme[6]; // A ≠ C

    if (isOttava) {
      matchingStanzas++;
    } else {
      issues.push(`Stanza ${s + 1} doesn't match ABABABCC pattern (found: ${stanzaScheme})`);
    }
  }

  // Check iambic pentameter (10 syllables per line)
  const pentameterLines = syllableCounts.filter(count => count === 10).length;
  const pentameterRatio = syllableCounts.length > 0 ? pentameterLines / syllableCounts.length : 0;

  if (pentameterRatio < 0.7) {
    issues.push(`Only ${Math.round(pentameterRatio * 100)}% of lines have 10 syllables (iambic pentameter)`);
  }

  const stanzaMatchRatio = matchingStanzas / stanzaCount;
  const fitScore = Math.round(stanzaMatchRatio * pentameterRatio * 100);
  const fit = fitScore >= 95 ? 'high' : fitScore >= 70 ? 'medium' : 'low';

  return {
    form: 'Ottava Rima',
    fit,
    fitScore,
    description: 'Ottava Rima: 8-line stanzas with ABABABCC rhyme scheme and iambic pentameter',
    expectedPattern: 'ABABABCC (repeated)',
    actualPattern: schemeStr,
    issues: issues.length > 0 ? issues : undefined
  };
}
