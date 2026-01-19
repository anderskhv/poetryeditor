/**
 * Rhyme scheme detection and analysis
 */

import { getPronunciations } from './cmuDict';

/**
 * Get the last word from a line of text
 */
function getLastWord(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return '';

  // Remove trailing punctuation
  const withoutPunctuation = trimmed.replace(/[.,!?;:'")\]}>—–-]+$/, '');

  // Get the last word
  const words = withoutPunctuation.split(/\s+/);
  const lastWord = words[words.length - 1];

  return lastWord.toLowerCase();
}

/**
 * Approximate the rhyming part based on English spelling patterns
 * Used as fallback when word isn't in CMU dictionary
 */
function approximateRhymingPart(word: string): string[] {
  const lower = word.toLowerCase();

  // Common rhyming endings
  // -ay/-ey/-eigh (long A sound)
  if (lower.match(/(ay|ey|eigh|ae)$/)) return ['EY1'];

  // -ee/-ea/-ie (long E sound)
  if (lower.match(/(ee|ea|ie)$/)) return ['IY1'];

  // -y ending (often long E sound)
  if (lower.match(/[^aeiou]y$/)) return ['IY1'];

  // -ow/-ough (long O sound)
  if (lower.match(/(ow|ough|oe|eau)$/)) return ['OW1'];

  // -ue/-ew/-oo (long OO sound)
  if (lower.match(/(ue|ew|oo|ou)$/)) return ['UW1'];

  // -ade/-aid (AY + D)
  if (lower.match(/(ade|aid|ayed)$/)) return ['EY1', 'D'];

  // -ate (AY + T)
  if (lower.match(/ate$/)) return ['EY1', 'T'];

  // -ine/-ign (AY + N)
  if (lower.match(/(ine|ign|ined)$/)) return ['AY1', 'N'];

  // -ight (AY + T)
  if (lower.match(/ight$/)) return ['AY1', 'T'];

  // -ound/-own (OW + N + D or OW + N)
  if (lower.match(/ound$/)) return ['AW1', 'N', 'D'];
  if (lower.match(/own$/)) return ['OW1', 'N'];

  // Default: use last 2-3 characters as rough approximation
  if (lower.length >= 3) {
    return [lower.slice(-3).toUpperCase()];
  }
  return [lower.toUpperCase()];
}

/**
 * Get the rhyming part of a word using CMU dictionary
 * Returns the phonemes from the last stressed vowel onwards
 */
function getRhymingPart(word: string): string[] {
  const pronunciations = getPronunciations(word);

  if (pronunciations.length === 0) {
    // Fallback to phonetic approximation if word not in dictionary
    // This handles basic English spelling patterns
    return approximateRhymingPart(word);
  }

  // Use the first pronunciation
  const pron = pronunciations[0];
  const phones = pron.phones;

  // Find the last stressed vowel (stress 1 or 2)
  let lastStressedIndex = -1;
  for (let i = phones.length - 1; i >= 0; i--) {
    if (phones[i].match(/[12]$/)) {
      lastStressedIndex = i;
      break;
    }
  }

  if (lastStressedIndex === -1) {
    // No stressed vowel found, use the whole pronunciation
    return phones;
  }

  // Return phonemes from the last stressed vowel onwards
  return phones.slice(lastStressedIndex);
}

/**
 * Assess the rhyme quality between two words
 * Returns 'perfect', 'slant', or 'none'
 */
export function assessRhymeQuality(word1: string, word2: string): 'perfect' | 'slant' | 'none' {
  if (!word1 || !word2) return 'none';
  if (word1 === word2) return 'none'; // Same word doesn't count as rhyme

  const rhyme1 = getRhymingPart(word1);
  const rhyme2 = getRhymingPart(word2);

  // Perfect rhyme: all phonemes from last stressed vowel match
  if (rhyme1.length === rhyme2.length) {
    let perfectMatch = true;
    for (let i = 0; i < rhyme1.length; i++) {
      const phone1 = rhyme1[i].replace(/[012]$/, '');
      const phone2 = rhyme2[i].replace(/[012]$/, '');
      if (phone1 !== phone2) {
        perfectMatch = false;
        break;
      }
    }
    if (perfectMatch) return 'perfect';
  }

  // Slant rhyme detection - multiple strategies

  // Strategy 1: Match final consonant(s) after vowel
  // Examples: "temperate" (...AH0 T) and "date" (EY1 T) both end in T
  const lastPhone1 = rhyme1[rhyme1.length - 1]?.replace(/[012]$/, '');
  const lastPhone2 = rhyme2[rhyme2.length - 1]?.replace(/[012]$/, '');

  // If final consonants match, check if there's sufficient vowel similarity
  if (lastPhone1 === lastPhone2 && lastPhone1 && !lastPhone1.match(/^[AEIOU]/)) {
    // Final consonant matches - check if the rhyming parts are similar enough
    // Get vowel sounds
    const vowel1 = rhyme1.find(p => p.match(/^[AEIOU]/))?.replace(/[012]$/, '');
    const vowel2 = rhyme2.find(p => p.replace(/[012]$/, ''));

    if (vowel1 && vowel2) {
      // Similar vowels (AH/EH/AE, IH/IY, etc.) with same consonant = slant rhyme
      const vowelGroups = [
        ['AH', 'EH', 'AE', 'EY'],  // Mid-low vowels
        ['IH', 'IY'],               // High-front vowels (removed EY - too different)
        ['UH', 'UW', 'OW'],         // Back vowels
        ['AO', 'OW', 'AW'],         // Low-back vowels
      ];

      const sameGroup = vowelGroups.some(group =>
        group.includes(vowel1) && group.includes(vowel2)
      );

      if (sameGroup || vowel1 === vowel2) {
        return 'slant';
      }
    }

    // If vowels differ significantly AND there are multiple intervening consonants,
    // this is NOT a good rhyme (e.g., "fade" (EY D) vs "dimmed" (IH M D))
    // Only accept if the rhyming parts are very similar in structure
    const consonantsBetween1 = rhyme1.slice(1, -1).filter(p => !p.match(/^[AEIOU]/)).length;
    const consonantsBetween2 = rhyme2.slice(1, -1).filter(p => !p.match(/^[AEIOU]/)).length;

    // If structure differs (e.g., one has M between vowel and final D), reject
    if (consonantsBetween1 !== consonantsBetween2) {
      return 'none';
    }

    // Very weak slant rhyme - only accept if structures are identical
    if (rhyme1.length === rhyme2.length && rhyme1.length === 2) {
      // Simple structure like (vowel + consonant) - may be acceptable
      return 'slant';
    }

    return 'none';
  }

  // Strategy 2: Match final 2 phonemes (traditional slant rhyme)
  const end1 = rhyme1.slice(-2).map(p => p.replace(/[012]$/, '')).join(' ');
  const end2 = rhyme2.slice(-2).map(p => p.replace(/[012]$/, '')).join(' ');

  if (end1 && end2 && end1 === end2 && rhyme1.length >= 2 && rhyme2.length >= 2) {
    return 'slant';
  }

  // Strategy 3: Single phoneme match for short words
  if (rhyme1.length === rhyme2.length && rhyme1.length === 1) {
    const phone1 = rhyme1[0].replace(/[012]$/, '');
    const phone2 = rhyme2[0].replace(/[012]$/, '');
    if (phone1 === phone2) return 'slant';
  }

  return 'none';
}

/**
 * Check if two words rhyme using CMU dictionary phonetics
 * Returns true if they share the same ending sounds (perfect or slant rhyme)
 */
function doWordsRhyme(word1: string, word2: string): boolean {
  const quality = assessRhymeQuality(word1, word2);
  return quality === 'perfect' || quality === 'slant';
}

/**
 * Detect the rhyme scheme of a poem
 * Returns an object with the scheme pattern and line-by-line rhyme labels
 */
export function detectRhymeScheme(text: string): {
  scheme: string;
  schemePattern: string[];
  lineEndWords: string[];
  rhymeGroups: Map<string, number[]>;
  rhymeQualities: ('perfect' | 'slant' | 'none')[]; // Quality of rhyme for each line
} {
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    return {
      scheme: 'No rhyme scheme detected',
      schemePattern: [],
      lineEndWords: [],
      rhymeGroups: new Map(),
      rhymeQualities: [],
    };
  }

  // Get last word of each line
  const lineEndWords = lines.map(line => getLastWord(line));

  // Build rhyme scheme pattern
  const schemePattern: string[] = [];
  const rhymeQualities: ('perfect' | 'slant' | 'none')[] = [];
  const rhymeGroups = new Map<string, number[]>(); // Maps rhyme label to line numbers
  let currentLabel = 'A';

  for (let i = 0; i < lineEndWords.length; i++) {
    const word = lineEndWords[i];

    if (!word) {
      schemePattern.push('X'); // No rhyme (empty line or no word)
      rhymeQualities.push('none');
      continue;
    }

    // Check if this word rhymes with any previous word
    let foundRhyme = false;
    let rhymeQuality: 'perfect' | 'slant' | 'none' = 'none';

    for (let j = 0; j < i; j++) {
      const prevWord = lineEndWords[j];
      const quality = assessRhymeQuality(word, prevWord);

      if (quality === 'perfect' || quality === 'slant') {
        const label = schemePattern[j];
        schemePattern.push(label);
        rhymeQuality = quality;

        // Add to rhyme group
        if (!rhymeGroups.has(label)) {
          rhymeGroups.set(label, []);
        }
        rhymeGroups.get(label)!.push(i + 1); // 1-indexed line numbers

        foundRhyme = true;
        break;
      }
    }

    if (!foundRhyme) {
      // New rhyme sound - assign new label
      schemePattern.push(currentLabel);
      rhymeQualities.push('perfect'); // First of its kind is "perfect" by default

      // Initialize rhyme group with this line
      rhymeGroups.set(currentLabel, [i + 1]);

      // Move to next letter
      currentLabel = String.fromCharCode(currentLabel.charCodeAt(0) + 1);
    } else {
      rhymeQualities.push(rhymeQuality);
    }
  }

  // Identify the overall scheme pattern
  const scheme = identifySchemeType(schemePattern, lines.length);

  return {
    scheme,
    schemePattern,
    lineEndWords,
    rhymeGroups,
    rhymeQualities,
  };
}

/**
 * Evaluate how well the actual rhyme scheme matches an expected pattern
 * Returns 'perfect', 'slant', or 'none' for each line based on compliance
 */
export function evaluateRhymeCompliance(
  actualPattern: string[],
  expectedPattern: string,
  rhymeQualities: ('perfect' | 'slant' | 'none')[]
): ('perfect' | 'slant' | 'none')[] {
  const expectedArr = expectedPattern.replace(/\s/g, '').split('');
  const compliance: ('perfect' | 'slant' | 'none')[] = [];

  for (let i = 0; i < actualPattern.length; i++) {
    // If we don't have an expected pattern for this line, mark as 'none'
    if (i >= expectedArr.length) {
      compliance.push('none');
      continue;
    }

    const actualLabel = actualPattern[i];
    const expectedLabel = expectedArr[i];

    // Check if the label matches
    if (actualLabel === expectedLabel) {
      // Label matches - use the rhyme quality (perfect or slant)
      compliance.push(rhymeQualities[i]);
    } else {
      // Label doesn't match - rhyme scheme is wrong
      compliance.push('none');
    }
  }

  return compliance;
}

/**
 * Identify the type of rhyme scheme based on the pattern
 */
function identifySchemeType(pattern: string[], totalLines: number): string {
  if (pattern.length === 0) return 'No rhyme scheme';

  const schemeStr = pattern.join('');

  // Check for common patterns

  // Couplets (AA BB CC...)
  if (/^(AA)+$/.test(schemeStr)) {
    return 'Couplets (AA BB...)';
  }

  // Alternate rhyme (ABAB...)
  if (/^(ABAB)+$/.test(schemeStr)) {
    return 'Alternate Rhyme (ABAB)';
  }

  // Enclosed rhyme (ABBA)
  if (/^(ABBA)+$/.test(schemeStr)) {
    return 'Enclosed Rhyme (ABBA)';
  }

  // Monorhyme (AAAA...)
  if (/^A+$/.test(schemeStr)) {
    return 'Monorhyme (AAAA...)';
  }

  // Terza rima (ABA BCB CDC...)
  if (/^ABA(BCB)*(CDC)*$/.test(schemeStr)) {
    return 'Terza Rima (ABA BCB CDC)';
  }

  // Quatrain variations
  if (totalLines === 4) {
    if (schemeStr === 'ABAB') return 'Quatrain - Alternate (ABAB)';
    if (schemeStr === 'ABBA') return 'Quatrain - Enclosed (ABBA)';
    if (schemeStr === 'AABB') return 'Quatrain - Couplet (AABB)';
  }

  // Limerick (AABBA)
  if (schemeStr === 'AABBA') {
    return 'Limerick (AABBA)';
  }

  // Sonnet patterns
  if (totalLines === 14) {
    if (schemeStr === 'ABBAABBACDCDCD') return 'Petrarchan Sonnet';
    if (schemeStr === 'ABBAABBACDECDE') return 'Petrarchan Sonnet (variant)';
    if (schemeStr === 'ABABCDCDEFEFGG') return 'Shakespearean Sonnet';
  }

  // Check for free verse (mostly unique endings)
  const uniqueLabels = new Set(pattern.filter(p => p !== 'X'));
  if (uniqueLabels.size === pattern.filter(p => p !== 'X').length) {
    return 'Free Verse (No rhyme)';
  }

  // Mixed or irregular
  return `Mixed Rhyme Scheme (${schemeStr})`;
}
