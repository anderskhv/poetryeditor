/**
 * Improved rhyme scheme detection
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

  // -and/-anned (AE + N + D) - hand, band, stand, planned, banned, canned
  // Must come before -ed pattern to avoid planned being matched as -ed
  if (lower.match(/(and|anned)$/)) return ['AE1', 'N', 'D'];

  // -end (EH + N + D) - end, spend, blend
  if (lower.match(/end$/)) return ['EH1', 'N', 'D'];

  // -ind/-ined (AY + N + D) - mind, find, kind, signed, lined
  if (lower.match(/(ind|ined)$/)) return ['AY1', 'N', 'D'];

  // -ead (short E sound like dead, bread, dread)
  if (lower.match(/ead$/)) return ['EH1', 'D'];

  // -ed (short E + D like bed, red, fed) - but not -and/-anned/-ind/-end words
  if (lower.match(/[^aeiou]ed$/) && !lower.match(/(anned|ined|end)$/)) return ['EH1', 'D'];

  // --- Additional patterns for better limerick/near-rhyme detection ---

  // -ome/-oam/-oom (long O + M) - Rome, foam, home, roam, dome
  if (lower.match(/(ome|oam)$/)) return ['OW1', 'M'];
  if (lower.match(/oom$/)) return ['UW1', 'M'];

  // -air/-are/-ear (EH + R) - chair, care, bare, rare, fair
  if (lower.match(/(air|are|ear)$/)) return ['EH1', 'R'];

  // -eer/-ear (IY + R) - beer, deer, hear, clear, near
  if (lower.match(/(eer|ere)$/)) return ['IY1', 'R'];

  // -ore/-oar/-our (AO + R) - more, shore, roar, pour
  if (lower.match(/(ore|oar|our)$/)) return ['AO1', 'R'];

  // -ire/-yre (AY + R) - fire, hire, tire, lyre
  if (lower.match(/(ire|yre)$/)) return ['AY1', 'R'];

  // -ue/-ew/-oo variations for rhyming - true, blue, new, few, do, who
  if (lower.match(/(rue|lue|ue|ew)$/)) return ['UW1'];
  if (lower === 'do' || lower === 'who' || lower === 'two' || lower === 'through') return ['UW1'];

  // -tion/-sion (SH + AH + N) - nation, motion, fusion
  if (lower.match(/(tion|sion)$/)) return ['SH', 'AH0', 'N'];

  // -ious/-eous (IY + AH + S) - precious, curious
  if (lower.match(/(ious|eous)$/)) return ['IY0', 'AH0', 'S'];

  // -ble (B + AH + L) - table, able, trouble
  if (lower.match(/ble$/)) return ['B', 'AH0', 'L'];

  // -ple (P + AH + L) - apple, simple
  if (lower.match(/ple$/)) return ['P', 'AH0', 'L'];

  // -tle (T + AH + L) - little, battle
  if (lower.match(/tle$/)) return ['T', 'AH0', 'L'];

  // -ck (K) - rock, lock, back, black
  if (lower.match(/ck$/)) return ['AH1', 'K'];

  // -ass/-ass (AE + S) - class, pass, grass, mass
  if (lower.match(/ass$/)) return ['AE1', 'S'];

  // -ess (EH + S) - dress, mess, press
  if (lower.match(/ess$/)) return ['EH1', 'S'];

  // -iss/-iss (IH + S) - miss, kiss, bliss
  if (lower.match(/iss$/)) return ['IH1', 'S'];

  // -oss (AO + S) - boss, loss, cross
  if (lower.match(/oss$/)) return ['AO1', 'S'];

  // -uss (AH + S) - fuss, bus, plus
  if (lower.match(/uss$/)) return ['AH1', 'S'];

  // -ent (EH + N + T) - bent, spent, went
  if (lower.match(/ent$/)) return ['EH1', 'N', 'T'];

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
 * Check for common historical/eye rhymes that were perfect in earlier English
 * but are now only visual rhymes
 */
function isHistoricalRhyme(word1: string, word2: string): boolean {
  const w1 = word1.toLowerCase();
  const w2 = word2.toLowerCase();

  // Common Shakespearean-era rhymes that no longer work in modern pronunciation
  const historicalPairs = [
    // -ove rhymes (love/prove/move/remove/dove/etc.)
    ['love', 'prove'], ['love', 'move'], ['love', 'remove'], ['love', 'dove'],
    ['prove', 'move'], ['prove', 'remove'], ['move', 'remove'],

    // -ome rhymes (come/home/dome/tomb/etc.)
    ['come', 'dome'], ['come', 'home'], ['come', 'tomb'],

    // -oom/-ome rhymes (doom/come, room/home, etc.)
    ['doom', 'come'], ['room', 'home'], ['gloom', 'come'],

    // -ough variations
    ['though', 'through'], ['bough', 'through'],

    // -ear variations
    ['hear', 'bear'], ['tear', 'were'],

    // Common eye rhymes
    ['cough', 'bough'], ['love', 'move']
  ];

  // Check if this pair or its reverse is in the historical list
  return historicalPairs.some(([a, b]) =>
    (w1 === a && w2 === b) || (w1 === b && w2 === a) ||
    w1.endsWith(a) && w2.endsWith(b) || (w1.endsWith(b) && w2.endsWith(a))
  );
}

/**
 * Helper to strip stress markers from phonemes for comparison
 */
function stripStress(phone: string): string {
  return phone.replace(/[012]$/, '');
}

/**
 * Helper to check if a phoneme is a vowel
 */
function isVowel(phone: string): boolean {
  return /^[AEIOU]/.test(stripStress(phone));
}

/**
 * Get the stressed vowel from a rhyming part (first vowel, which has the stress)
 */
function getStressedVowel(rhymePart: string[]): string | null {
  for (const phone of rhymePart) {
    if (isVowel(phone)) {
      return stripStress(phone);
    }
  }
  return null;
}

/**
 * Check if shorter rhyming part matches the end of a longer one
 * This handles cases like curse [ER1, S] matching reimburse [ER1, S]
 * even when the full rhyming parts have different lengths
 */
function checkSuffixMatch(shorter: string[], longer: string[]): boolean {
  if (shorter.length === 0) return false;

  // Get the suffix of the longer part that matches the length of the shorter part
  const suffix = longer.slice(-shorter.length);

  // Compare each phoneme (ignoring stress)
  for (let i = 0; i < shorter.length; i++) {
    if (stripStress(shorter[i]) !== stripStress(suffix[i])) {
      return false;
    }
  }
  return true;
}

/**
 * Assess the rhyme quality between two words
 * Returns 'perfect', 'slant', or 'none'
 */
export function assessRhymeQuality(word1: string, word2: string): 'perfect' | 'slant' | 'none' {
  if (!word1 || !word2) return 'none';
  if (word1 === word2) return 'none'; // Same word doesn't count as rhyme

  // Check for historical rhymes first
  if (isHistoricalRhyme(word1, word2)) {
    return 'slant'; // Historical rhymes are treated as slant rhymes
  }

  const rhyme1 = getRhymingPart(word1);
  const rhyme2 = getRhymingPart(word2);

  // Perfect rhyme: all phonemes from last stressed vowel match
  if (rhyme1.length === rhyme2.length) {
    let perfectMatch = true;
    for (let i = 0; i < rhyme1.length; i++) {
      if (stripStress(rhyme1[i]) !== stripStress(rhyme2[i])) {
        perfectMatch = false;
        break;
      }
    }
    if (perfectMatch) return 'perfect';
  }

  // Check for suffix matching when lengths differ
  // This handles cases like curse [ER1, S] vs reimburse [ER1, S]
  // where the rhyming parts are actually the same
  if (rhyme1.length !== rhyme2.length) {
    const [shorter, longer] = rhyme1.length < rhyme2.length
      ? [rhyme1, rhyme2]
      : [rhyme2, rhyme1];

    // If the shorter part completely matches the end of the longer part,
    // it's a perfect rhyme (e.g., curse/reimburse)
    if (checkSuffixMatch(shorter, longer)) {
      return 'perfect';
    }
  }

  // Slant rhyme detection
  const lastPhone1 = stripStress(rhyme1[rhyme1.length - 1] || '');
  const lastPhone2 = stripStress(rhyme2[rhyme2.length - 1] || '');

  // Must have matching final consonant to be a slant rhyme
  if (lastPhone1 !== lastPhone2 || !lastPhone1 || isVowel(lastPhone1)) {
    // Final phones don't match or are vowels - check strategy 2
    // Strategy 2: Match final 2 phonemes (traditional slant rhyme)
    // BUT: For longer rhyming parts (4+ phonemes), require more than just 2 matching
    // to avoid false positives like revel/ungrateful
    const end1 = rhyme1.slice(-2).map(p => stripStress(p)).join(' ');
    const end2 = rhyme2.slice(-2).map(p => stripStress(p)).join(' ');

    if (end1 && end2 && end1 === end2 && rhyme1.length >= 2 && rhyme2.length >= 2) {
      // Additional check for longer words: require matching stressed vowels
      // This prevents "revel" [EH1, V, AH0, L] from matching "ungrateful" [EY1, T, F, AH0, L]
      // just because they both end in [AH, L]
      const maxLen = Math.max(rhyme1.length, rhyme2.length);
      if (maxLen >= 4) {
        const stressedVowel1 = getStressedVowel(rhyme1);
        const stressedVowel2 = getStressedVowel(rhyme2);

        // For multi-syllable words, stressed vowels must match or be closely related
        if (stressedVowel1 && stressedVowel2 && stressedVowel1 !== stressedVowel2) {
          // Check if vowels are in a similar phonetic group
          const slantVowelGroups = [
            ['AH', 'EH'],    // Schwa and short-e
            ['IH', 'IY'],    // Short-i and long-e
            ['UH', 'UW'],    // Short-u and long-oo
          ];
          const vowelsRelated = slantVowelGroups.some(group =>
            group.includes(stressedVowel1) && group.includes(stressedVowel2)
          );
          if (!vowelsRelated) {
            return 'none';
          }
        }
      }
      return 'slant';
    }

    // Strategy 3: Single phoneme match for short words
    if (rhyme1.length === rhyme2.length && rhyme1.length === 1) {
      if (stripStress(rhyme1[0]) === stripStress(rhyme2[0])) return 'slant';
    }

    return 'none';
  }

  // Final consonant matches - check if it's a good slant rhyme
  // Get the vowel before the final consonant
  const finalVowel1 = rhyme1.length >= 2 ? stripStress(rhyme1[rhyme1.length - 2]) : null;
  const finalVowel2 = rhyme2.length >= 2 ? stripStress(rhyme2[rhyme2.length - 2]) : null;

  if (!finalVowel1 || !finalVowel2) {
    return 'none';
  }

  // Check if both end with vowel + consonant pattern
  const v1IsVowel = isVowel(finalVowel1);
  const v2IsVowel = isVowel(finalVowel2);

  // For multi-syllable words (3+ phonemes in rhyming part), require matching stressed vowels
  // This prevents "revel" [EH1, V, AH0, L] from matching "ungrateful" [EY1, T, F, AH0, L]
  // just because both end in consonant L
  const maxLen = Math.max(rhyme1.length, rhyme2.length);
  if (maxLen >= 3) {
    const stressedVowel1 = getStressedVowel(rhyme1);
    const stressedVowel2 = getStressedVowel(rhyme2);

    if (stressedVowel1 && stressedVowel2 && stressedVowel1 !== stressedVowel2) {
      // Check if vowels are closely related (valid slant rhyme)
      const slantVowelGroups = [
        ['AH', 'EH'],    // Schwa and short-e
        ['IH', 'IY'],    // Short-i and long-e
        ['UH', 'UW'],    // Short-u and long-oo
        ['AE', 'EH'],    // Short-a and short-e (near vowels)
      ];
      const vowelsRelated = slantVowelGroups.some(group =>
        group.includes(stressedVowel1) && group.includes(stressedVowel2)
      );

      // For multi-syllable words, stressed vowels must be related to rhyme
      // Exception: very different length words (like "temperate" vs "date")
      // can still be historical/Shakespearean slant rhymes
      if (!vowelsRelated && Math.abs(rhyme1.length - rhyme2.length) < 3) {
        return 'none';
      }
    }
  }

  if (v1IsVowel && v2IsVowel) {
    // Both have final vowel + consonant
    // Check if the vowels are in similar phonetic groups
    const vowelGroups = [
      ['AH', 'EH', 'AE', 'EY'],  // -ate, -et endings
      ['IH', 'IY'],               // -it, -eat endings
      ['UH', 'UW', 'OW'],         // -oot, -ow endings
      ['AO', 'OW', 'AW'],         // -aw, -ought endings
    ];

    const sameGroup = vowelGroups.some(group =>
      group.includes(finalVowel1) && group.includes(finalVowel2)
    );

    if (sameGroup || finalVowel1 === finalVowel2) {
      return 'slant';
    }

    // Historical rhyme exception: if one word is much longer (like "temperate" vs "date"),
    // accept as slant rhyme even if vowels differ
    // This handles Shakespearean-era pronunciation differences
    if (Math.abs(rhyme1.length - rhyme2.length) >= 3) {
      return 'slant';
    }
  }

  // Check if both have the same structure (prevents "fade" matching "dimmed")
  const isSimple1 = rhyme1.length === 2 && v1IsVowel;  // vowel + consonant
  const isSimple2 = rhyme2.length === 2 && v2IsVowel;

  if (isSimple1 !== isSimple2) {
    // One is simple, one is complex - not a good match
    return 'none';
  }

  if (isSimple1 && isSimple2) {
    // Both are simple V+C but vowels don't match - reject
    return 'none';
  }

  // For complex patterns (like gold=OW1-L-D vs ground=AW1-N-D), require more similarity
  // They need to have matching vowel sounds to be considered slant rhymes
  // Find the first vowel in each rhyming part
  const vowel1 = getStressedVowel(rhyme1);
  const vowel2 = getStressedVowel(rhyme2);

  if (!vowel1 || !vowel2) {
    return 'none';
  }

  // Vowels must match exactly or be in the same acoustic group for slant rhyme
  if (vowel1 === vowel2) {
    return 'slant';
  }

  // Be strict: only allow slant rhymes for closely related vowels
  // OW (as in "gold") and AW (as in "ground") sound different, so don't group them
  const strictVowelGroups = [
    ['AH', 'EH'],    // Schwa-like sounds
    ['IH', 'IY'],    // Short-i and long-e (similar)
    ['UH', 'UW'],    // Short-u and long-oo
  ];

  const strictSameGroup = strictVowelGroups.some(group =>
    group.includes(vowel1) && group.includes(vowel2)
  );

  if (strictSameGroup) {
    return 'slant';
  }

  return 'none';
}

/**
 * Check if two words rhyme using CMU dictionary phonetics
 * Returns true if they share the same ending sounds (perfect or slant rhyme)
 * @internal Used by internal logic, exported assessRhymeQuality is preferred
 */
function _doWordsRhyme(word1: string, word2: string): boolean {
  const quality = assessRhymeQuality(word1, word2);
  return quality === 'perfect' || quality === 'slant';
}

/**
 * Normalize a line for comparison (lowercase, trim, remove punctuation)
 */
function normalizeLine(line: string): string {
  return line
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'")\]}>—–-]+$/, '')
    .replace(/^[['"({<—–-]+/, '');
}

/**
 * Check if two lines are identical or near-identical (refrains)
 * This is important for villanelle detection where repeating lines should rhyme with themselves
 * @internal Used internally, detectRefrains is the main API
 */
function _areLinesIdentical(line1: string, line2: string): boolean {
  const norm1 = normalizeLine(line1);
  const norm2 = normalizeLine(line2);
  return norm1 === norm2;
}

/**
 * Detect refrain lines (repeated lines) in the poem
 * Returns a map of normalized line content to array of line indices
 */
function detectRefrains(lines: string[]): Map<string, number[]> {
  const lineOccurrences = new Map<string, number[]>();

  lines.forEach((line, index) => {
    if (!line.trim()) return;
    const normalized = normalizeLine(line);
    if (!normalized) return;

    if (!lineOccurrences.has(normalized)) {
      lineOccurrences.set(normalized, []);
    }
    lineOccurrences.get(normalized)!.push(index);
  });

  // Only return lines that appear more than once (actual refrains)
  const refrains = new Map<string, number[]>();
  for (const [content, indices] of lineOccurrences) {
    if (indices.length > 1) {
      refrains.set(content, indices);
    }
  }

  return refrains;
}

/**
 * Detect the rhyme scheme of a poem
 * Returns an object with the scheme pattern and line-by-line rhyme labels
 */
export function detectRhymeScheme(text: string): {
  scheme: string;
  schemePattern: string[];
  lineEndWords: string[];
  lineNumbers: number[]; // Original line numbers (1-indexed, accounting for blank lines)
  rhymeGroups: Map<string, number[]>;
  rhymeQualities: ('perfect' | 'slant' | 'none')[]; // Quality of rhyme for each line
} {
  // Keep ALL lines to preserve line numbers that match the editor
  const allLines = text.split('\n');

  // Create arrays that map to non-empty lines but track original line numbers
  const nonEmptyLineData: { line: string; originalLineNumber: number }[] = [];
  allLines.forEach((line, index) => {
    if (line.trim().length > 0) {
      nonEmptyLineData.push({ line, originalLineNumber: index + 1 }); // 1-indexed
    }
  });

  if (nonEmptyLineData.length === 0) {
    return {
      scheme: 'No rhyme scheme detected',
      schemePattern: [],
      lineEndWords: [],
      lineNumbers: [],
      rhymeGroups: new Map(),
      rhymeQualities: [],
    };
  }

  // Get last word of each non-empty line
  const lineEndWords = nonEmptyLineData.map(data => getLastWord(data.line));

  // Detect refrains (repeated lines) - important for villanelles
  // Build a map from line index to the first occurrence of that refrain
  const refrains = detectRefrains(nonEmptyLineData.map(d => d.line));
  const refrainFirstOccurrence = new Map<number, number>(); // maps line index to first occurrence index

  for (const [, indices] of refrains) {
    // For each refrain group, map all occurrences to the first one
    const firstIndex = indices[0];
    for (const idx of indices) {
      if (idx !== firstIndex) {
        refrainFirstOccurrence.set(idx, firstIndex);
      }
    }
  }

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

    // Check if this line is a refrain (identical to a previous line)
    // If so, it automatically gets the same rhyme label as its first occurrence
    const refrainFirstIdx = refrainFirstOccurrence.get(i);
    if (refrainFirstIdx !== undefined && schemePattern[refrainFirstIdx]) {
      const label = schemePattern[refrainFirstIdx];
      schemePattern.push(label);
      // Refrains are perfect rhymes with themselves (identical lines)
      rhymeQualities.push('perfect');

      // Update the first occurrence to perfect if it was 'none'
      if (rhymeQualities[refrainFirstIdx] === 'none') {
        rhymeQualities[refrainFirstIdx] = 'perfect';
      }

      // Add to rhyme group
      if (!rhymeGroups.has(label)) {
        rhymeGroups.set(label, []);
      }
      rhymeGroups.get(label)!.push(nonEmptyLineData[i].originalLineNumber);
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

        // Update the quality of the first word in this rhyme pair if it was 'none'
        // (This happens when we find the first matching rhyme for a word)
        if (rhymeQualities[j] === 'none') {
          rhymeQualities[j] = quality;
        }

        // Add to rhyme group using ORIGINAL line number (accounts for blank lines)
        if (!rhymeGroups.has(label)) {
          rhymeGroups.set(label, []);
        }
        rhymeGroups.get(label)!.push(nonEmptyLineData[i].originalLineNumber);

        foundRhyme = true;
        break;
      }
    }

    if (!foundRhyme) {
      // New rhyme sound - assign new label
      schemePattern.push(currentLabel);
      // Mark as 'none' for now - will be upgraded to 'perfect' or 'slant'
      // when another word rhymes with this one
      rhymeQualities.push('none');

      // Initialize rhyme group with this line using ORIGINAL line number
      rhymeGroups.set(currentLabel, [nonEmptyLineData[i].originalLineNumber]);

      // Move to next letter
      currentLabel = String.fromCharCode(currentLabel.charCodeAt(0) + 1);
    } else {
      rhymeQualities.push(rhymeQuality);
    }
  }

  // Identify the overall scheme pattern
  const scheme = identifySchemeType(schemePattern, nonEmptyLineData.length);

  // Extract original line numbers for each entry
  const lineNumbers = nonEmptyLineData.map(data => data.originalLineNumber);

  return {
    scheme,
    schemePattern,
    lineEndWords,
    lineNumbers,
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

/**
 * Extract significant words from a line that might be involved in internal rhymes
 * Focus on words before punctuation breaks (commas, dashes, colons, semicolons, question marks)
 */
function extractInternalRhymeWords(line: string, lineNumber: number): { word: string; lineNumber: number }[] {
  const words: { word: string; lineNumber: number }[] = [];

  // Split on punctuation that typically indicates a phrase break
  // Include the word before each break point
  const breakPattern = /(\w+)(?=[.,;:!?\-—–]+\s|[.,;:!?\-—–]+$)/g;
  let match;

  while ((match = breakPattern.exec(line)) !== null) {
    const word = match[1].toLowerCase();
    // Skip common function words that don't typically participate in intentional internal rhymes
    const skipWords = ['the', 'and', 'but', 'for', 'are', 'was', 'were', 'has', 'had', 'have', 'is', 'it', 'as', 'at', 'to', 'of', 'in', 'or', 'be', 'so', 'no', 'if', 'an', 'by', 'do', 'we', 'he', 'me'];
    if (word.length >= 2 && !skipWords.includes(word)) {
      words.push({ word, lineNumber });
    }
  }

  return words;
}

/**
 * Detect internal rhymes - words that rhyme within lines or across lines
 * but are not at line endings
 */
export interface InternalRhyme {
  word1: string;
  word2: string;
  line1: number;
  line2: number;
  quality: 'perfect' | 'slant';
}

export function detectInternalRhymes(text: string): InternalRhyme[] {
  const maxLineDistance = 4;
  const lines = text.split('\n');
  const internalRhymes: InternalRhyme[] = [];

  // Collect all internal words (words before punctuation breaks)
  const internalWords: { word: string; lineNumber: number }[] = [];

  lines.forEach((line, index) => {
    if (line.trim()) {
      const wordsFromLine = extractInternalRhymeWords(line, index + 1);
      internalWords.push(...wordsFromLine);
    }
  });

  // Also get end words for cross-matching
  const endWords: { word: string; lineNumber: number }[] = [];
  lines.forEach((line, index) => {
    if (line.trim()) {
      const endWord = getLastWord(line);
      if (endWord) {
        endWords.push({ word: endWord, lineNumber: index + 1 });
      }
    }
  });

  // Check internal words against each other
  // For internal rhymes, we're stricter - only perfect rhymes to avoid noise
  for (let i = 0; i < internalWords.length; i++) {
    for (let j = i + 1; j < internalWords.length; j++) {
      // Skip if same word
      if (internalWords[i].word === internalWords[j].word) continue;
      if (Math.abs(internalWords[i].lineNumber - internalWords[j].lineNumber) > maxLineDistance) continue;

      const quality = assessRhymeQuality(internalWords[i].word, internalWords[j].word);
      // Only include perfect rhymes for internal-to-internal comparisons
      if (quality === 'perfect') {
        internalRhymes.push({
          word1: internalWords[i].word,
          word2: internalWords[j].word,
          line1: internalWords[i].lineNumber,
          line2: internalWords[j].lineNumber,
          quality,
        });
      }
    }
  }

  // Check internal words against end words (cross rhymes)
  for (const internal of internalWords) {
    for (const end of endWords) {
      // Skip if same line or same word
      if (internal.lineNumber === end.lineNumber) continue;
      if (internal.word === end.word) continue;
      if (Math.abs(internal.lineNumber - end.lineNumber) > maxLineDistance) continue;

      const quality = assessRhymeQuality(internal.word, end.word);
      // Only include perfect rhymes for internal-to-end comparisons
      if (quality === 'perfect') {
        // Check if this rhyme pair already exists (from end-rhyme detection)
        const alreadyExists = internalRhymes.some(
          r => (r.word1 === internal.word && r.word2 === end.word) ||
               (r.word1 === end.word && r.word2 === internal.word)
        );
        if (!alreadyExists) {
          internalRhymes.push({
            word1: internal.word,
            word2: end.word,
            line1: internal.lineNumber,
            line2: end.lineNumber,
            quality,
          });
        }
      }
    }
  }

  // Sort by line number
  internalRhymes.sort((a, b) => a.line1 - b.line1 || a.line2 - b.line2);

  return internalRhymes;
}
