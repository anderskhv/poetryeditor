/**
 * Scansion Analyzer
 * Analyzes metrical stress patterns at the syllable level
 * Identifies iambs, trochees, dactyls, anapests, and spondees
 *
 * KEY INSIGHT: Poetic scansion differs from linguistic pronunciation:
 * 1. Words are often contracted (wandering → wand'ring = 2 syllables)
 * 2. Function words (the, a, I, my) are unstressed by default
 * 3. Context matters: meter detection biases ambiguous words
 * 4. All monosyllables are metrically flexible
 */

import { getStressPattern as getCMUStressPattern, isDictionaryLoaded, getSyllables as getCMUSyllables } from './cmuDict';

// CMU Pronouncing Dictionary style stress patterns
// 0 = unstressed, 1 = primary stress, 2 = secondary stress
// For simplicity, we'll use: u = unstressed, / = stressed

export interface SyllableInfo {
  text: string;
  stressed: boolean;
}

export interface WordScansion {
  word: string;
  syllables: SyllableInfo[];
  stressPattern: string; // e.g., "u/" for iamb, "/u" for trochee
}

export interface LineScansion {
  lineIndex: number;
  text: string;
  words: WordScansion[];
  fullPattern: string; // e.g., "u/u/u/u/u/" for iambic pentameter
  feet: string[]; // e.g., ["iamb", "iamb", "iamb", "iamb", "iamb"]
  meterType: string; // e.g., "iambic pentameter"
  isRegular: boolean;
}

export interface ScansionAnalysis {
  lines: LineScansion[];
  dominantMeter: string;
  regularityScore: number; // 0-100
}

export interface StressedSyllableInstance {
  text: string;
  startOffset: number;
  endOffset: number;
  stressed: boolean;
}

// Common stress patterns for English words
// Based on linguistic rules and common patterns
// In metrical poetry, function words are typically unstressed
const STRESS_EXCEPTIONS: Record<string, string> = {
  // Personal pronouns - in metrical context, typically unstressed
  // (they CAN be stressed for emphasis, but default to unstressed in scansion)
  'i': 'u',
  'you': 'u',
  'he': 'u',
  'she': 'u',
  'we': 'u',
  'they': 'u',
  'it': 'u',
  'me': 'u',
  'him': 'u',
  'her': 'u',
  'us': 'u',
  'them': 'u',
  'thee': 'u',
  'thou': 'u',
  'thy': 'u',
  'my': 'u',
  'mine': 'u',
  'your': 'u',
  'his': 'u',
  'our': 'u',
  'their': 'u',

  // Articles and prepositions (typically unstressed)
  'a': 'u',
  'an': 'u',
  'the': 'u',
  'to': 'u',
  'of': 'u',
  'in': 'u',
  'on': 'u',
  'at': 'u',
  'by': 'u',
  'for': 'u',
  'with': 'u',
  'from': 'u',
  'as': 'u',
  'through': 'u',
  'than': 'u',
  'like': 'u',

  // Conjunctions (typically unstressed)
  'and': 'u',
  'but': 'u',
  'or': 'u',
  'nor': 'u',
  'so': 'u',
  'yet': 'u',
  'that': 'u',
  'which': 'u',
  'who': 'u',
  'whom': 'u',
  'whose': 'u',
  'if': 'u',
  'when': 'u',
  'where': 'u',
  'while': 'u',
  'though': 'u',
  'although': 'u/',
  'because': 'u/',

  // Auxiliary verbs (typically unstressed)
  'is': 'u',
  'are': 'u',
  'was': 'u',
  'were': 'u',
  'be': 'u',
  'been': 'u',
  'being': '/u',
  'am': 'u',
  'have': 'u',
  'has': 'u',
  'had': 'u',
  'do': 'u',
  'does': 'u',
  'did': 'u',

  // Question words when not interrogative - stressed
  'what': '/',
  'how': '/',
  'why': '/',

  // Negation - stressed
  'not': '/',
  'no': '/',
  'none': '/',
  'never': '/u',

  // Common single-syllable content words
  'shall': 'u',
  'will': 'u',
  'would': 'u',
  'could': 'u',
  'should': 'u',
  'may': 'u',
  'might': 'u',
  'must': 'u',
  'can': 'u',
  'day': '/',
  'night': '/',
  'light': '/',
  'soft': '/',
  'tell': '/',
  'once': '/',
  'cloud': '/',
  'love': '/',
  'life': '/',
  'death': '/',
  'heart': '/',
  'soul': '/',
  'mind': '/',
  'man': '/',
  'world': '/',
  'time': '/',

  // Common two-syllable words with known stress
  'compare': 'u/',
  'upon': 'u/',
  'about': 'u/',
  'above': 'u/',
  'across': 'u/',
  'after': '/u',
  'again': 'u/',
  'against': 'u/',
  'along': 'u/',
  'among': 'u/',
  'around': 'u/',
  'away': 'u/',
  'before': 'u/',
  'behind': 'u/',
  'below': 'u/',
  'beneath': 'u/',
  'beside': 'u/',
  'between': 'u/',
  'beyond': 'u/',
  'over': '/u',
  'under': '/u',
  'into': '/u',
  'onto': '/u',
  'within': 'u/',
  'without': 'u/',
  'ever': '/u',
  'always': '/u',
  'only': '/u',
  'also': '/u',
  'even': '/u',
  'often': '/u',
  'seldom': '/u',
  'begin': 'u/',
  'become': 'u/',
  'believe': 'u/',
  'belong': 'u/',
  'return': 'u/',
  'remain': 'u/',
  'repeat': 'u/',
  'receive': 'u/',
  'remove': 'u/',
  'reply': 'u/',
  'report': 'u/',
  'request': 'u/',
  'require': 'u/',
  'silent': '/u',
  'silence': '/u',
  'moment': '/u',
  'morning': '/u',
  'evening': '/u',
  'water': '/u',
  'father': '/u',
  'mother': '/u',
  'brother': '/u',
  'sister': '/u',
  'daughter': '/u',
  'beauty': '/u',
  'nature': '/u',
  'garden': '/u',
  'window': '/u',
  'shadow': '/u',
  'yellow': '/u',
  'follow': '/u',
  'sorrow': '/u',
  'borrow': '/u',
  'morrow': '/u',
  'narrow': '/u',

  // Three-syllable words
  'beautiful': '/uu',
  'wonderful': '/uu',
  'terrible': '/uu',
  'horrible': '/uu',
  'miserable': '/uuu',
  'remember': 'u/u',
  'forgotten': 'u/u',
  'together': 'u/u',
  'forever': 'u/u',
  'however': 'u/u',
  'whatever': 'u/u',
  'whenever': 'u/u',
  'wherever': 'u/u',
  'imagine': 'u/u',
  'important': 'u/u',
  'tomorrow': 'u/u',
  'already': 'u/u',
  'another': 'u/u',
  'continue': 'u/u',
  'suddenly': '/uu',
  'quietly': '/uu',
  'slowly': '/u',
  'quickly': '/u',
  'gently': '/u',
  'softly': '/u',
  'darkly': '/u',
  'brightly': '/u',
  'lightly': '/u',

  // Four-syllable words
  'desperately': '/uuu',
  'disparately': '/uuu',
  'separately': '/uuu',
  'accurately': '/uuu',
  'fortunately': '/uuu',
  'ultimately': '/uuu',
  'certainly': '/uu',
  'definitely': '/uuu',
  'absolutely': 'u/uu',
  'immediately': 'u/uuu',

  // Additional words that commonly appear in poetry
  'sometime': 'u/',       // some-TIME not SOME-time
  'upon': 'u/',
  'within': 'u/',
  'ago': 'u/',
  'today': 'u/',
  'tonight': 'u/',
  'himself': 'u/',
  'herself': 'u/',
  'itself': 'u/',
  'ourselves': 'u/',
  'themselves': 'u/',
};

/**
 * POETIC SYLLABLE REDUCTIONS
 *
 * In poetry, many words are pronounced with fewer syllables than in speech.
 * This is called "syncopation" or "elision". Common patterns:
 * - -ering → -ring (wandering → wand'ring)
 * - -ery/-ary → -ry (every → ev'ry)
 * - -ower → -owr (flower → flow'r)
 * - -aven/-even → one syllable (heaven → heav'n)
 * - -ion after a vowel can reduce (marriage = 2 not 3)
 */
const POETIC_SYLLABLE_COUNT: Record<string, number> = {
  // -ering → -ring (wandering → wand'ring = 2 syllables)
  'wandering': 2, 'wondering': 2, 'pondering': 2, 'towering': 2,
  'flowering': 2, 'showering': 2, 'hovering': 2, 'quivering': 2,
  'shivering': 2, 'wavering': 2, 'faltering': 2, 'entering': 2,
  'uttering': 2, 'muttering': 2, 'scattering': 2, 'flattering': 2,
  'battering': 2, 'chattering': 2, 'glittering': 2, 'shattering': 2,
  'gathering': 2, 'withering': 2, 'slithering': 2, 'smothering': 2,
  'mothering': 2, 'fathering': 2, 'bothering': 2, 'feathering': 2,
  'tethering': 2, 'weathering': 2, 'whispering': 2, 'blistering': 2,
  'listening': 2, 'glistening': 2, 'christening': 2, 'threatening': 2,
  'reckoning': 2, 'beckoning': 2, 'happening': 2, 'opening': 2,
  'deepening': 2, 'ripening': 2, 'sharpening': 2, 'darkening': 2,
  'wakening': 2, 'slackening': 2, 'quickening': 2, 'thickening': 2,
  'sickening': 2, 'blackening': 2, 'sweetening': 2,
  'hastening': 2, 'fastening': 2,
  'lightening': 2, 'frightening': 2, 'brightening': 2, 'tightening': 2,
  'lengthening': 2, 'strengthening': 2,

  // -ery/-ary → 2 syllables (every → ev'ry)
  'every': 2, 'memory': 2, 'history': 2, 'victory': 2,
  'mystery': 2, 'misery': 2, 'slavery': 2, 'bravery': 2,
  'archery': 2, 'butchery': 2, 'cutlery': 2, 'battery': 2,
  'flattery': 2, 'lottery': 2, 'pottery': 2, 'watery': 2,
  'knavery': 2, 'savagery': 2, 'imagery': 2,
  'scenery': 2, 'greenery': 2, 'machinery': 3, 'refinery': 3,

  // -ion after vowel = 2 syllables (not 3)
  'marriage': 2, 'carriage': 2, 'marriageable': 3,

  // Words that reduce in poetry
  'spirit': 1, 'spirits': 1,
  'natural': 2, 'general': 2, 'several': 2, 'federal': 2, 'liberal': 2,
  'different': 2, 'difference': 2, 'interest': 2, 'interested': 3,
  'business': 2, 'easiness': 3, 'happiness': 3,
  'beautiful': 2, 'bountiful': 2, 'dutiful': 2, 'pitiful': 2,
  'merciful': 2, 'plentiful': 2, 'fanciful': 2, 'peaceful': 2,


  // -ual → 1 syllable
  'actual': 2, 'mutual': 2, 'usual': 2, 'casual': 2,
  'gradual': 2, 'manual': 2, 'annual': 2, 'visual': 2,

  // -ious/-eous → 1-2 syllables depending
  'glorious': 2, 'curious': 2, 'furious': 2, 'serious': 2,
  'various': 2, 'previous': 2, 'obvious': 2, 'envious': 2,
  'tedious': 2, 'hideous': 2, 'studious': 2,

  // -tion words that are 2 syllables not 3
  'passion': 2, 'fashion': 2, 'nation': 2, 'station': 2,
  'patient': 2, 'ancient': 2,

  // -ion/-tion words that reduce by 1 syllable in poetry
  // These are pronounced with -ion as one syllable
  'complexion': 2,     // com-PLEX-ion → com-PLEXION (2)
  'possession': 2,     // pos-SES-sion → pos-SSESSION (2)
  'impression': 2,     // im-PRES-sion → im-PRESSION (2)
  'expression': 2,     // ex-PRES-sion → ex-PRESSION (2)
  'confession': 2,     // con-FES-sion → con-FESSION (2)
  'profession': 2,     // pro-FES-sion → pro-FESSION (2)
  'succession': 2,     // suc-CES-sion → suc-CESSION (2)
  'procession': 2,     // pro-CES-sion → pro-CESSION (2)
  'occasion': 2,       // oc-CA-sion → oc-CASION (2)

  // -ation words that are 3 syllables (not 4) in verse
  'alteration': 3,     // al-ter-A-tion → al-ter-ATION (3)
  'meditation': 3,
  'adoration': 3,
  'admiration': 3,
  'inspiration': 3,
  'aspiration': 3,
  'separation': 3,
  'preparation': 3,
  'declaration': 3,
  'celebration': 3,
  'desolation': 3,
  'observation': 3,
  'compensation': 3,
  'contemplation': 3,
  'lamentation': 3,
  'generation': 3,
  'moderation': 3,
  'operation': 3,
  'reputation': 3,

  // -iment/-ement words
  'impediments': 3,    // im-PED-i-ments → im-PED-ments (3)
  'impediment': 3,
  'compliments': 2,
  'compliment': 2,
  'instruments': 2,
  'instrument': 2,
  'ornament': 2,
  'ornaments': 2,
  'sacrament': 2,
  'sacraments': 2,
  'temperament': 3,

};

/**
 * APOSTROPHE CONTRACTION HANDLING
 *
 * Words with apostrophes in poetry indicate syllable elision:
 * - wand'ring = 2 syllables (wandering without middle syllable)
 * - heav'n = 1 syllable (heaven contracted)
 * - o'er = 1 syllable (over contracted)
 * - e'er = 1 syllable (ever contracted)
 *
 * BUT possessive 's does NOT reduce syllables:
 * - summer's = 2 syllables (same as "summer")
 * - king's = 1 syllable (same as "king")
 *
 * Rule: only count apostrophes that replace vowels (not possessive 's)
 */
function getApostropheAdjustedSyllables(word: string): number | null {
  // Check if word contains apostrophe
  if (!word.includes("'")) return null;

  const lower = word.toLowerCase();

  // IMPORTANT: Possessive 's does NOT indicate syllable reduction
  // Words like "summer's", "king's", "love's" have the same syllable count as base
  if (lower.match(/'s$/)) {
    // This is a possessive - return null to use normal CMU lookup
    // The CMU dictionary handles possessives correctly (e.g., "summer's" = 2 syllables)
    return null;
  }

  // Common contracted forms with known counts
  const knownContractions: Record<string, number> = {
    "o'er": 1,
    "e'er": 1,
    "ne'er": 1,
    "e'en": 1,
    "'tis": 1,
    "'twas": 1,
    "'twill": 1,
    "'gainst": 1,
    "'mongst": 1,
    "t'other": 2,
    "whe'er": 1,
    "whate'er": 2,
    "whoe'er": 2,
    "howe'er": 2,
    "whene'er": 2,
    "where'er": 2,
  };

  if (knownContractions[lower]) {
    return knownContractions[lower];
  }

  // For other contractions like "wand'rest", "heav'n", "ow'st":
  // The apostrophe typically indicates one syllable was dropped
  // Count vowel groups in the word, but treat apostrophe as a removed vowel
  const withoutApostrophe = lower.replace(/'/g, '');

  // If it ends in 'st or similar archaic endings, handle specially
  if (lower.match(/'st$/)) {
    // Word like "ow'st" (owest), "grow'st" (growest)
    // The base word before 'st was probably 2 syllables, now 1
    const base = lower.replace(/'st$/, '');
    const baseSyllables = countSyllablesBasic(base);
    return baseSyllables; // The 'st doesn't add a syllable
  }

  // For words like "wand'ring" - the apostrophe marks a dropped syllable
  // Compare to what the word would be without apostrophe
  const normalCount = countSyllablesBasic(withoutApostrophe);
  const apostropheCount = (lower.match(/'/g) || []).length;

  // Each apostrophe typically represents one dropped vowel sound
  return Math.max(1, normalCount - apostropheCount);
}

function countSyllablesBasic(word: string): number {
  const lower = word.toLowerCase().replace(/[^a-z]/g, '');
  if (lower.length === 0) return 0;
  if (lower.length <= 3) return 1;

  let count = 0;
  const vowels = 'aeiouy';
  let prevWasVowel = false;

  for (let i = 0; i < lower.length; i++) {
    const isVowel = vowels.includes(lower[i]);
    if (isVowel && !prevWasVowel) {
      count++;
    }
    prevWasVowel = isVowel;
  }

  if (lower.endsWith('e') && !lower.endsWith('le') && count > 1) {
    count--;
  }

  if (lower.endsWith('ed') && !lower.endsWith('ted') && !lower.endsWith('ded') && count > 1) {
    count--;
  }

  return Math.max(1, count);
}

/**
 * Get poetic syllable count for a word
 * Returns the poetic (reduced) count if known, otherwise null
 */
function getPoeticSyllableCount(word: string): number | null {
  const lower = word.toLowerCase().replace(/[^a-z']/g, '');

  // First check apostrophe contractions (highest priority)
  const apostropheCount = getApostropheAdjustedSyllables(lower);
  if (apostropheCount !== null) {
    return apostropheCount;
  }

  // Then check our known poetic reductions
  return POETIC_SYLLABLE_COUNT[lower] ?? null;
}

/**
 * Split a word into N syllables proportionally
 * Used when we know the poetic syllable count differs from linguistic count
 */
function splitWordIntoNSyllables(word: string, n: number): string[] {
  const clean = word.replace(/[^a-zA-Z']/g, '');
  if (n === 1) return [clean];
  if (n >= clean.length) {
    // Can't have more syllables than letters, just return chars
    return clean.split('');
  }

  // Try to split intelligently at consonant clusters
  const vowels = 'aeiouyAEIOUY';
  const result: string[] = [];

  // Find vowel positions (these are syllable nuclei)
  const vowelPositions: number[] = [];
  let prevWasVowel = false;
  for (let i = 0; i < clean.length; i++) {
    const isVowel = vowels.includes(clean[i]);
    if (isVowel && !prevWasVowel) {
      vowelPositions.push(i);
    }
    prevWasVowel = isVowel;
  }

  // If we have exactly n vowel groups, split at consonant boundaries
  if (vowelPositions.length >= n) {
    // Pick n vowel positions to use as nuclei
    const selectedVowels: number[] = [];
    const step = vowelPositions.length / n;
    for (let i = 0; i < n; i++) {
      const idx = Math.min(Math.floor(i * step), vowelPositions.length - 1);
      selectedVowels.push(vowelPositions[idx]);
    }

    // Now split at boundaries between selected vowels
    for (let i = 0; i < n; i++) {
      let start = i === 0 ? 0 : selectedVowels[i];
      // Back up to include leading consonants
      if (i > 0) {
        while (start > 0 && !vowels.includes(clean[start - 1])) {
          start--;
        }
        // But don't go past the previous syllable's vowel
        const prevEnd = result.length > 0 ? clean.indexOf(result[result.length - 1]) + result[result.length - 1].length : 0;
        start = Math.max(start, prevEnd);
      }

      let end = i === n - 1 ? clean.length : selectedVowels[i + 1];
      // Back up to split at consonant cluster
      if (i < n - 1) {
        while (end > start && !vowels.includes(clean[end - 1])) {
          end--;
        }
        // Include some trailing consonants
        while (end < clean.length && !vowels.includes(clean[end])) {
          end++;
          if (end < clean.length && vowels.includes(clean[end])) {
            // Found next vowel, back up one
            end--;
            break;
          }
        }
      }

      result.push(clean.slice(start, end));
    }

    // Verify we got all letters
    const joined = result.join('');
    if (joined !== clean) {
      // Fallback to proportional split
      return splitProportionally(clean, n);
    }
    return result;
  }

  // Fallback: split proportionally
  return splitProportionally(clean, n);
}

function splitProportionally(word: string, n: number): string[] {
  const result: string[] = [];
  const chunkSize = Math.ceil(word.length / n);
  for (let i = 0; i < word.length; i += chunkSize) {
    result.push(word.slice(i, Math.min(i + chunkSize, word.length)));
  }
  // Ensure we have exactly n parts
  while (result.length > n && result.length > 1) {
    // Merge last two
    const last = result.pop()!;
    result[result.length - 1] += last;
  }
  return result;
}

/**
 * Count syllables in a word using linguistic rules
 */
function countSyllables(word: string): number {
  const lower = word.toLowerCase().replace(/[^a-z]/g, '');
  if (lower.length === 0) return 0;
  if (lower.length <= 3) return 1;

  let count = 0;
  const vowels = 'aeiouy';
  let prevWasVowel = false;

  for (let i = 0; i < lower.length; i++) {
    const isVowel = vowels.includes(lower[i]);
    if (isVowel && !prevWasVowel) {
      count++;
    }
    prevWasVowel = isVowel;
  }

  // Adjust for silent e
  if (lower.endsWith('e') && !lower.endsWith('le') && count > 1) {
    count--;
  }

  // Adjust for -ed endings (often silent)
  if (lower.endsWith('ed') && !lower.endsWith('ted') && !lower.endsWith('ded') && count > 1) {
    count--;
  }

  // Minimum 1 syllable
  return Math.max(1, count);
}

/**
 * Convert CMU stress pattern (number[]) to scansion pattern string
 * CMU: 0 = unstressed, 1 = primary stress, 2 = secondary stress
 * Scansion: u = unstressed, / = stressed (any stress > 0)
 */
function cmuToScansionPattern(cmuPattern: number[]): string {
  return cmuPattern.map(s => s > 0 ? '/' : 'u').join('');
}

/**
 * Reduce a stress pattern to a target number of syllables
 * Preserves the primary stress position, merges adjacent syllables
 *
 * Strategy: Remove unstressed syllables preferentially, keeping stressed ones
 * Example: "/uu" (3 syl) → "/u" (2 syl) - keep the stress, merge the us
 * Example: "u/u" (3 syl) → "u/" (2 syl) - keep the stress at end
 */
function reducePatternToSyllables(pattern: string, targetCount: number): string {
  if (pattern.length <= targetCount) return pattern;

  // Find position of primary stress (first '/')
  const stressPos = pattern.indexOf('/');

  if (targetCount === 1) {
    // Single syllable - return stressed if there was any stress
    return stressPos >= 0 ? '/' : 'u';
  }

  if (targetCount === 2) {
    // Two syllables - common case
    if (stressPos === 0) {
      // Stress on first syllable: /xxx → /u
      return '/u';
    } else if (stressPos === pattern.length - 1) {
      // Stress on last syllable: xxxх/ → u/
      return 'u/';
    } else {
      // Stress in middle - decide based on position
      // For words like "ev-er-y" (/uu) → "ev-ry" (/u)
      if (stressPos <= pattern.length / 2) {
        return '/u';
      } else {
        return 'u/';
      }
    }
  }

  // For longer reductions, preserve stress position proportionally
  const result: string[] = [];
  const ratio = pattern.length / targetCount;

  for (let i = 0; i < targetCount; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.floor((i + 1) * ratio);
    // Check if any syllable in this range is stressed
    let hasStress = false;
    for (let j = start; j < end; j++) {
      if (pattern[j] === '/') {
        hasStress = true;
        break;
      }
    }
    result.push(hasStress ? '/' : 'u');
  }

  return result.join('');
}

/**
 * Get stress pattern for a word
 * Priority: 1) Manual exceptions (for metrical adjustments)
 *           2) CMU dictionary with poetic syllable adjustment
 *           3) Heuristic rules (fallback for unknown words)
 */
function getWordStressPattern(word: string): string {
  const lower = word.toLowerCase().replace(/[^a-z']/g, '');

  // Check manual exceptions first - these override CMU for metrical reasons
  // (e.g., function words that are linguistically stressed but metrically unstressed)
  if (STRESS_EXCEPTIONS[lower]) {
    return STRESS_EXCEPTIONS[lower];
  }

  // Check for poetic syllable reduction
  const poeticCount = getPoeticSyllableCount(lower);

  // Try CMU dictionary - but adjust for poetic syllable count
  if (isDictionaryLoaded()) {
    const cmuPattern = getCMUStressPattern(lower);
    if (cmuPattern.length > 0) {
      let pattern = cmuToScansionPattern(cmuPattern);

      // If we have a poetic syllable count that's less than CMU's count,
      // we need to reduce the pattern
      if (poeticCount !== null && poeticCount < pattern.length) {
        pattern = reducePatternToSyllables(pattern, poeticCount);
      }

      return pattern;
    }
  }

  // Fallback to heuristic rules for words not in CMU dictionary
  // Use poetic syllable count if available
  const syllableCount = poeticCount ?? countSyllables(lower);

  if (syllableCount === 1) {
    // Single syllable - check if it's a function word
    const functionWords = ['a', 'an', 'the', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'from', 'as', 'and', 'but', 'or', 'nor', 'so', 'yet', 'if', 'than'];
    if (functionWords.includes(lower)) {
      return 'u';
    }
    return '/'; // Most single-syllable content words are stressed
  }

  if (syllableCount === 2) {
    // Apply common English stress rules for 2-syllable words

    // Verbs often have stress on second syllable
    const verbPrefixes = ['be', 'de', 'dis', 'en', 'ex', 'in', 'mis', 'pre', 're', 'un'];
    for (const prefix of verbPrefixes) {
      if (lower.startsWith(prefix) && lower.length > prefix.length + 2) {
        return 'u/';
      }
    }

    // Nouns/adjectives often have stress on first syllable
    // Words ending in -er, -or, -ly, -ful, -less, -ness, -ment typically stress first syllable
    const firstStressEndings = ['er', 'or', 'ly', 'ful', 'less', 'ness', 'ment', 'dom', 'ship', 'ward', 'ow', 'ey', 'y'];
    for (const ending of firstStressEndings) {
      if (lower.endsWith(ending)) {
        return '/u';
      }
    }

    // Default: stress on first syllable (more common in English)
    return '/u';
  }

  if (syllableCount === 3) {
    // Three syllables - check common patterns

    // Words ending in -ity, -tion, -sion stress the syllable before
    if (lower.endsWith('ity') || lower.endsWith('tion') || lower.endsWith('sion')) {
      return 'u/u';
    }

    // Words ending in -ly usually keep original stress + unstressed -ly
    if (lower.endsWith('ly')) {
      return '/uu';
    }

    // Words ending in -ful, -less, -ness
    if (lower.endsWith('ful') || lower.endsWith('less') || lower.endsWith('ness')) {
      return '/uu';
    }

    // Default pattern
    return 'u/u';
  }

  // Four or more syllables
  if (syllableCount === 4) {
    if (lower.endsWith('tion') || lower.endsWith('sion')) {
      return 'uu/u';
    }
    // Words ending in -ly (like desperately, separately, accurately)
    // typically have primary stress on first syllable
    if (lower.endsWith('ly')) {
      return '/uuu';
    }
    // Words ending in -ately (like fortunately, ultimately)
    if (lower.endsWith('ately')) {
      return '/uuu';
    }
    return 'u/uu';
  }

  // Default for longer words: alternate with stress near end
  const pattern = [];
  for (let i = 0; i < syllableCount; i++) {
    // Stress typically falls 2-3 syllables from end
    if (i === syllableCount - 3 || i === syllableCount - 1) {
      pattern.push('/');
    } else {
      pattern.push('u');
    }
  }
  return pattern.join('');
}

// Known syllable breakdowns for common words
const SYLLABLE_OVERRIDES: Record<string, string[]> = {
  'wandered': ['wan', 'dered'],
  'lonely': ['lone', 'ly'],
  'slowly': ['slow', 'ly'],
  'quickly': ['quick', 'ly'],
  'softly': ['soft', 'ly'],
  'gently': ['gent', 'ly'],
  'quietly': ['qui', 'et', 'ly'],
  'suddenly': ['sud', 'den', 'ly'],
  'beautiful': ['beau', 'ti', 'ful'],
  'wonderful': ['won', 'der', 'ful'],
  'terrible': ['ter', 'ri', 'ble'],
  'horrible': ['hor', 'ri', 'ble'],
  'miserable': ['mis', 'er', 'a', 'ble'],
  'remember': ['re', 'mem', 'ber'],
  'forgotten': ['for', 'got', 'ten'],
  'together': ['to', 'geth', 'er'],
  'forever': ['for', 'ev', 'er'],
  'however': ['how', 'ev', 'er'],
  'whatever': ['what', 'ev', 'er'],
  'whenever': ['when', 'ev', 'er'],
  'wherever': ['where', 'ev', 'er'],
  'compare': ['com', 'pare'],
  'summer': ['sum', 'mer'],
  'summers': ['sum', 'mers'],
  'window': ['win', 'dow'],
  'shadow': ['sha', 'dow'],
  'yellow': ['yel', 'low'],
  'follow': ['fol', 'low'],
  'sorrow': ['sor', 'row'],
  'borrow': ['bor', 'row'],
  'morrow': ['mor', 'row'],
  'narrow': ['nar', 'row'],
  'fading': ['fad', 'ing'],
  'walking': ['walk', 'ing'],
  'talking': ['talk', 'ing'],
  'thinking': ['think', 'ing'],
  'waiting': ['wait', 'ing'],
  'deeply': ['deep', 'ly'],
  'really': ['real', 'ly'],
  'fully': ['ful', 'ly'],
  'painfully': ['pain', 'ful', 'ly'],
  'desperately': ['des', 'per', 'ate', 'ly'],
  'disparately': ['dis', 'par', 'ate', 'ly'],
  'separately': ['sep', 'ar', 'ate', 'ly'],
  'accurately': ['ac', 'cur', 'ate', 'ly'],
  'fortunately': ['for', 'tun', 'ate', 'ly'],
  'ultimately': ['ul', 'tim', 'ate', 'ly'],
  'definitely': ['def', 'in', 'ite', 'ly'],
  'absolutely': ['ab', 'so', 'lute', 'ly'],
  'immediately': ['im', 'me', 'di', 'ate', 'ly'],
  'yonder': ['yon', 'der'],
  'under': ['un', 'der'],
  'over': ['o', 'ver'],
  'question': ['ques', 'tion'],
  'midnight': ['mid', 'night'],
  'dreary': ['drear', 'y'],
  'weary': ['wear', 'y'],
  'mournful': ['mourn', 'ful'],
  'numbers': ['num', 'bers'],
  'about': ['a', 'bout'],
  'upon': ['u', 'pon'],
  'words': ['words'],
  'through': ['through'],
  'light': ['light'],
  'night': ['night'],
  'write': ['write'],
  'came': ['came'],
  'quite': ['quite'],
  'thought': ['thought'],
  'while': ['while'],
  'breaks': ['breaks'],
};

/**
 * Break a word into syllables
 * Priority: 1) Manual overrides
 *           2) Poetic syllable count (reduces words like "wandering" to 2 syl)
 *           3) CMU dictionary syllable count
 *           4) Heuristic syllable counting
 */
function splitIntoSyllables(word: string): string[] {
  const lower = word.toLowerCase().replace(/[^a-z']/g, '');

  // Check manual overrides first
  if (SYLLABLE_OVERRIDES[lower]) {
    return SYLLABLE_OVERRIDES[lower];
  }

  // Check for poetic syllable reduction
  const poeticCount = getPoeticSyllableCount(lower);

  // If we have a poetic count, split the word proportionally
  if (poeticCount !== null) {
    return splitWordIntoNSyllables(lower, poeticCount);
  }

  // Try CMU dictionary for accurate syllable count
  if (isDictionaryLoaded()) {
    const cmuSyllables = getCMUSyllables(lower);
    if (cmuSyllables.length > 0) {
      return cmuSyllables;
    }
  }

  // Fallback to heuristic counting
  const syllableCount = countSyllables(lower);

  if (syllableCount === 1) {
    return [word.replace(/[^a-zA-Z]/g, '')];
  }

  // Continue with heuristic syllable splitting...

  // Improved syllable splitting following English rules
  const vowels = 'aeiouy';
  const syllables: string[] = [];
  let current = '';

  // Find vowel nuclei positions
  const vowelPositions: number[] = [];
  let prevWasVowel = false;
  for (let i = 0; i < lower.length; i++) {
    const isVowel = vowels.includes(lower[i]);
    if (isVowel && !prevWasVowel) {
      vowelPositions.push(i);
    }
    prevWasVowel = isVowel;
  }

  // If we have correct number of vowel groups, use them as nuclei
  if (vowelPositions.length === syllableCount) {
    // Divide by vowel positions
    syllables.length = 0;
    for (let i = 0; i < vowelPositions.length; i++) {
      let start: number;
      let end: number;

      if (i === 0) {
        start = 0;
      } else {
        // Find split point between this vowel group and previous
        const prevVowelEnd = vowelPositions[i - 1];
        let j = prevVowelEnd + 1;
        while (j < lower.length && vowels.includes(lower[j])) j++;
        const consonantStart = j;
        const consonantEnd = vowelPositions[i];
        const numConsonants = consonantEnd - consonantStart;

        if (numConsonants <= 1) {
          start = consonantStart;
        } else {
          // Split consonant cluster
          start = consonantStart + Math.floor(numConsonants / 2);
        }
      }

      if (i === vowelPositions.length - 1) {
        end = lower.length;
      } else {
        // Will be determined by next iteration
        end = lower.length;
      }

      if (i === vowelPositions.length - 1) {
        syllables.push(lower.slice(start));
      } else {
        // Placeholder, will be adjusted
        const nextVowel = vowelPositions[i + 1];
        let j = vowelPositions[i] + 1;
        while (j < lower.length && vowels.includes(lower[j])) j++;
        const consonantStart = j;
        const numConsonants = nextVowel - consonantStart;

        if (numConsonants <= 1) {
          end = consonantStart;
        } else {
          end = consonantStart + Math.ceil(numConsonants / 2);
        }
        syllables.push(lower.slice(start, end));
      }
    }

    return syllables;
  }

  // Fallback: simple splitting
  current = '';
  let vowelsSeen = 0;
  prevWasVowel = false;

  for (let i = 0; i < lower.length; i++) {
    const char = lower[i];
    const isVowel = vowels.includes(char);

    current += char;

    if (isVowel && !prevWasVowel) {
      vowelsSeen++;

      // Check if we should end this syllable
      if (vowelsSeen < syllableCount && i < lower.length - 2) {
        // Look ahead for consonant + vowel
        let j = i + 1;
        while (j < lower.length && vowels.includes(lower[j])) j++;

        if (j < lower.length - 1 && vowels.includes(lower[j + 1])) {
          // End syllable after current consonant cluster
          while (j < lower.length && !vowels.includes(lower[j])) {
            j++;
            if (j < lower.length && vowels.includes(lower[j])) {
              // Split before this consonant or in middle of cluster
              const splitAt = Math.max(i + 1, j - 1);
              syllables.push(current + lower.slice(i + 1, splitAt));
              current = lower.slice(splitAt, j);
              i = j - 1;
              break;
            }
          }
        }
      }
    }
    prevWasVowel = isVowel;
  }

  if (current && !syllables.includes(current)) {
    syllables.push(current);
  }

  // Final adjustment if count is wrong
  if (syllables.length !== syllableCount) {
    // Just divide evenly as last resort
    const result: string[] = [];
    const chunkSize = Math.ceil(lower.length / syllableCount);
    for (let i = 0; i < lower.length; i += chunkSize) {
      result.push(lower.slice(i, Math.min(i + chunkSize, lower.length)));
    }
    return result.slice(0, syllableCount);
  }

  return syllables;
}

/**
 * Analyze a single word's scansion
 */
function analyzeWord(word: string): WordScansion {
  const cleanWord = word.replace(/[^a-zA-Z'-]/g, '');
  if (!cleanWord) {
    return { word, syllables: [], stressPattern: '' };
  }

  const stressPattern = getWordStressPattern(cleanWord);
  const syllableTexts = splitIntoSyllables(cleanWord);

  const syllables: SyllableInfo[] = syllableTexts.map((text, i) => ({
    text,
    stressed: stressPattern[i] === '/',
  }));

  return {
    word: cleanWord,
    syllables,
    stressPattern,
  };
}

/**
 * Standard metrical patterns for comparison
 * These are the "famous" meters we want to match against
 * Only exact or very close matches should be tagged
 */
const STANDARD_METERS: Record<string, { pattern: string; name: string; minMatch: number }> = {
  // Iambic meters (u/u/u/...)
  'iambic_pentameter': { pattern: 'u/u/u/u/u/', name: 'iambic pentameter', minMatch: 0.9 },
  'iambic_tetrameter': { pattern: 'u/u/u/u/', name: 'iambic tetrameter', minMatch: 0.9 },
  'iambic_trimeter': { pattern: 'u/u/u/', name: 'iambic trimeter', minMatch: 0.9 },
  'iambic_hexameter': { pattern: 'u/u/u/u/u/u/', name: 'iambic hexameter', minMatch: 0.9 },

  // Trochaic meters (/u/u/u...)
  'trochaic_tetrameter': { pattern: '/u/u/u/u', name: 'trochaic tetrameter', minMatch: 0.9 },
  'trochaic_pentameter': { pattern: '/u/u/u/u/u', name: 'trochaic pentameter', minMatch: 0.9 },
  'trochaic_trimeter': { pattern: '/u/u/u', name: 'trochaic trimeter', minMatch: 0.9 },
  // Trochaic tetrameter catalectic (common - drops final unstressed) - e.g., "The Raven"
  'trochaic_tetrameter_cat': { pattern: '/u/u/u/', name: 'trochaic tetrameter catalectic', minMatch: 0.9 },

  // Anapestic meters (uu/uu/...)
  'anapestic_tetrameter': { pattern: 'uu/uu/uu/uu/', name: 'anapestic tetrameter', minMatch: 0.85 },
  'anapestic_trimeter': { pattern: 'uu/uu/uu/', name: 'anapestic trimeter', minMatch: 0.85 },

  // Dactylic meters (/uu/uu...)
  'dactylic_hexameter': { pattern: '/uu/uu/uu/uu/uu/u', name: 'dactylic hexameter', minMatch: 0.8 },
  'dactylic_tetrameter': { pattern: '/uu/uu/uu/uu', name: 'dactylic tetrameter', minMatch: 0.85 },

  // Common ballad meter (alternating tetrameter/trimeter)
  'common_meter_long': { pattern: 'u/u/u/u/', name: 'common meter (long)', minMatch: 0.9 },
  'common_meter_short': { pattern: 'u/u/u/', name: 'common meter (short)', minMatch: 0.9 },
};

/**
 * Calculate how closely a pattern matches a standard meter
 * Returns a value from 0 to 1 (1 = perfect match)
 */
function calculateMeterMatch(pattern: string, standardPattern: string): number {
  if (pattern.length !== standardPattern.length) {
    // Length mismatch - check if off by 1 (catalectic lines are common)
    if (Math.abs(pattern.length - standardPattern.length) === 1) {
      // Try matching with the shorter length
      const minLen = Math.min(pattern.length, standardPattern.length);
      let matches = 0;
      for (let i = 0; i < minLen; i++) {
        if (pattern[i] === standardPattern[i]) matches++;
      }
      // Slight penalty for length mismatch
      return (matches / minLen) * 0.95;
    }
    return 0; // Too different in length
  }

  let matches = 0;
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === standardPattern[i]) matches++;
  }
  return matches / pattern.length;
}

/**
 * Find the best matching standard meter for a pattern
 * Returns the meter name only if it's a very close match, otherwise null
 */
function findBestMeterMatch(pattern: string): string | null {
  if (pattern.length < 4) return null; // Too short to meaningfully classify

  let bestMatch: { name: string; score: number; minMatch: number } | null = null;

  for (const [, meter] of Object.entries(STANDARD_METERS)) {
    const score = calculateMeterMatch(pattern, meter.pattern);
    if (score >= meter.minMatch) {
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { name: meter.name, score, minMatch: meter.minMatch };
      }
    }
  }

  return bestMatch ? bestMatch.name : null;
}

/**
 * Identify metrical feet from a stress pattern
 */
function identifyFeet(pattern: string): { feet: string[], meterType: string } {
  const feet: string[] = [];

  // Look for patterns of 2-3 syllables
  let i = 0;
  while (i < pattern.length) {
    // Try to match common feet
    const remaining = pattern.slice(i);

    if (remaining.startsWith('u/')) {
      feet.push('iamb');
      i += 2;
    } else if (remaining.startsWith('/u')) {
      feet.push('trochee');
      i += 2;
    } else if (remaining.startsWith('//')) {
      feet.push('spondee');
      i += 2;
    } else if (remaining.startsWith('uu')) {
      feet.push('pyrrhic');
      i += 2;
    } else if (remaining.startsWith('uu/')) {
      feet.push('anapest');
      i += 3;
    } else if (remaining.startsWith('/uu')) {
      feet.push('dactyl');
      i += 3;
    } else {
      // Single syllable left
      i++;
    }
  }

  // Try to find a matching standard meter
  // Only tag if it's a very close match to a famous meter pattern
  const matchedMeter = findBestMeterMatch(pattern);

  // Return the matched meter name, or empty string if no close match
  return { feet, meterType: matchedMeter || '' };
}

// Words that can be promoted/demoted in metrical context
// These are typically function words or words with flexible stress
const PROMOTABLE_WORDS = new Set([
  'i', 'you', 'he', 'she', 'we', 'they', 'it', 'me', 'him', 'her', 'us', 'them',
  'thee', 'thou', 'thy', 'my', 'mine', 'your', 'his', 'our', 'their',
  'shall', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
  'is', 'are', 'was', 'were', 'be', 'been', 'am', 'have', 'has', 'had',
  'do', 'does', 'did', 'a', 'an', 'the', 'to', 'of', 'in', 'on', 'at', 'by',
  'for', 'with', 'from', 'as', 'and', 'but', 'or', 'nor', 'so', 'yet',
  'that', 'which', 'who', 'whom', 'if', 'when', 'where', 'while', 'though',
  // Adverbs that can be demoted
  'too', 'so', 'just', 'quite', 'very', 'much', 'more', 'most', 'well',
  // Other flexible words
  'all', 'some', 'no', 'not', 'now', 'then', 'here', 'there',
]);

// Words that strongly resist being stressed (articles, prepositions)
const RESIST_STRESS = new Set([
  'a', 'an', 'the', 'of', 'to', 'and', 'in', 'that', 'is', 'it',
]);

// Words that strongly resist being unstressed (content words)
const RESIST_UNSTRESS = new Set([
  'love', 'death', 'life', 'time', 'world', 'heart', 'soul', 'mind',
  'god', 'man', 'night', 'day', 'light', 'dark', 'war', 'peace',
]);

interface SyllableMetadata {
  word: string;
  syllableIndex: number;  // Position within word (0 = first syllable)
  totalSyllables: number; // Total syllables in word
  lexicalStress: boolean; // What the dictionary says
  promotable: boolean;    // Can be promoted to stressed
  demotable: boolean;     // Can be demoted to unstressed
  resistStress: boolean;  // Strongly prefers unstressed
  resistUnstress: boolean; // Strongly prefers stressed
}

/**
 * Constraint-based metrical parsing
 *
 * This implements a simplified version of Optimality Theory for scansion:
 * 1. Generate candidate patterns by toggling "flexible" syllables
 * 2. Score each candidate against metrical constraints
 * 3. Return the highest-scoring (most natural) pattern
 *
 * KEY INSIGHT: ALL monosyllables are metrically flexible in poetry.
 * Even "big" content words can be unstressed if meter demands it.
 * Only polysyllabic words have fixed stress patterns.
 *
 * Key constraints (in priority order):
 * - LEXICAL: Don't violate polysyllabic word stress (highest priority)
 * - ALTERNATION: Prefer alternating stress patterns (the heart of English meter)
 * - RESIST: Some words strongly prefer stressed/unstressed
 * - NO-CLASH: Avoid 3+ consecutive stressed
 * - NO-LAPSE: Avoid 3+ consecutive unstressed
 * - IAMBIC-BIAS: Prefer iambic (u/) over trochaic (/u) patterns
 */
function applyMetricalSmoothing(wordScansions: WordScansion[]): string {
  // Build syllable metadata array
  const syllables: SyllableMetadata[] = [];

  for (const ws of wordScansions) {
    const wordLower = ws.word.toLowerCase().replace(/[^a-z]/g, '');
    const resistsStress = RESIST_STRESS.has(wordLower);
    const resistsUnstress = RESIST_UNSTRESS.has(wordLower);
    const isExplicitlyPromotable = PROMOTABLE_WORDS.has(wordLower);

    for (let i = 0; i < ws.syllables.length; i++) {
      const isMonosyllable = ws.syllables.length === 1;

      syllables.push({
        word: ws.word,
        syllableIndex: i,
        totalSyllables: ws.syllables.length,
        lexicalStress: ws.syllables[i].stressed,
        // KEY CHANGE: ALL monosyllables are flexible, not just function words
        // Polysyllabic words have fixed stress on their stressed syllable
        promotable: isMonosyllable,
        demotable: isMonosyllable,
        // But some words have strong preferences
        resistStress: resistsStress && isMonosyllable,
        resistUnstress: resistsUnstress && isMonosyllable,
      });
    }
  }

  if (syllables.length === 0) return '';

  // Identify which positions are "flexible" (can be toggled)
  const flexiblePositions: number[] = [];
  for (let i = 0; i < syllables.length; i++) {
    if (syllables[i].promotable || syllables[i].demotable) {
      flexiblePositions.push(i);
    }
  }

  // If too many flexible positions, prioritize positions that would improve alternation
  // or positions with explicitly promotable words
  let searchPositions = flexiblePositions;
  if (flexiblePositions.length > 10) {
    // Prioritize: positions where current pattern breaks alternation
    const basePattern = syllables.map(s => s.lexicalStress);
    const breakingAlternation: number[] = [];
    const other: number[] = [];

    for (const pos of flexiblePositions) {
      const prev = pos > 0 ? basePattern[pos - 1] : null;
      const next = pos < basePattern.length - 1 ? basePattern[pos + 1] : null;
      const current = basePattern[pos];

      // This position breaks alternation if it matches its neighbor
      const breaksWithPrev = prev !== null && prev === current;
      const breaksWithNext = next !== null && next === current;

      if (breaksWithPrev || breaksWithNext) {
        breakingAlternation.push(pos);
      } else {
        other.push(pos);
      }
    }

    // Prioritize positions that break alternation
    searchPositions = [...breakingAlternation.slice(0, 8), ...other.slice(0, 8 - breakingAlternation.length)];
  }

  const maxFlexible = Math.min(searchPositions.length, 10);
  searchPositions = searchPositions.slice(0, maxFlexible);

  // Generate and score candidate patterns
  let bestPattern = syllables.map(s => s.lexicalStress);
  let bestScore = scorePattern(bestPattern, syllables);

  // Try all combinations of flexible positions (2^n combinations)
  const numCombinations = 1 << searchPositions.length;

  for (let combo = 0; combo < numCombinations; combo++) {
    // Create candidate pattern
    const candidate = syllables.map(s => s.lexicalStress);

    // Apply this combination's toggles
    for (let bit = 0; bit < searchPositions.length; bit++) {
      if (combo & (1 << bit)) {
        const pos = searchPositions[bit];
        candidate[pos] = !candidate[pos];
      }
    }

    const score = scorePattern(candidate, syllables);
    if (score > bestScore) {
      bestScore = score;
      bestPattern = candidate;
    }
  }

  return bestPattern.map(s => s ? '/' : 'u').join('');
}

/**
 * Score a stress pattern against metrical constraints
 * Higher score = better (more natural) pattern
 */
function scorePattern(pattern: boolean[], syllables: SyllableMetadata[]): number {
  let score = 0;
  const n = pattern.length;

  // CONSTRAINT 1: LEXICAL (weight: 100)
  // Never violate stress in polysyllabic words
  for (let i = 0; i < n; i++) {
    const syl = syllables[i];
    if (syl.totalSyllables > 1) {
      // Polysyllabic word - stress pattern is fixed
      if (pattern[i] !== syl.lexicalStress) {
        score -= 100; // Heavy penalty
      }
    }
  }

  // CONSTRAINT 2: RESIST preferences (weight: 30)
  for (let i = 0; i < n; i++) {
    const syl = syllables[i];
    if (syl.resistStress && pattern[i]) {
      score -= 30; // Penalty for stressing "the", "a", etc.
    }
    if (syl.resistUnstress && !pattern[i]) {
      score -= 30; // Penalty for not stressing "love", "death", etc.
    }
  }

  // CONSTRAINT 3: NO-LAPSE (weight: 20)
  // Penalize 3+ consecutive unstressed syllables
  let unstressedRun = 0;
  for (let i = 0; i < n; i++) {
    if (!pattern[i]) {
      unstressedRun++;
      if (unstressedRun >= 3) {
        score -= 20;
      }
    } else {
      unstressedRun = 0;
    }
  }

  // CONSTRAINT 4: NO-CLASH (weight: 10)
  // Penalize 3+ consecutive stressed syllables (2 is okay = spondee)
  let stressedRun = 0;
  for (let i = 0; i < n; i++) {
    if (pattern[i]) {
      stressedRun++;
      if (stressedRun >= 3) {
        score -= 10;
      }
    } else {
      stressedRun = 0;
    }
  }

  // CONSTRAINT 5: ALTERNATION BONUS (weight: 8)
  // Reward alternating patterns (the core of English meter)
  for (let i = 1; i < n; i++) {
    if (pattern[i] !== pattern[i - 1]) {
      score += 8; // Bonus for alternation
    }
  }

  // CONSTRAINT 6: IAMBIC BIAS (weight: 10)
  // Strong preference for iambic (u/) in English verse
  // This is crucial - most English poetry is iambic
  for (let i = 0; i < n - 1; i += 2) {
    if (!pattern[i] && pattern[i + 1]) {
      score += 10; // Iambic pair: u/
    } else if (pattern[i] && !pattern[i + 1]) {
      score += 2; // Trochaic pair: /u (less preferred)
    }
  }

  // CONSTRAINT 7: LINE-END STRESS (weight: 12)
  // English verse strongly prefers stressed final syllables
  if (n > 0 && pattern[n - 1]) {
    score += 12;
  }

  // CONSTRAINT 8: IAMBIC PENTAMETER BONUS (weight: 50)
  // If we have exactly 10 syllables, VERY strongly prefer the standard pattern
  // This is the most common meter in English poetry (Shakespeare, Milton, etc.)
  if (n === 10) {
    // Standard iambic pentameter: u/u/u/u/u/
    const standardIP = [false, true, false, true, false, true, false, true, false, true];
    let ipMatches = 0;
    for (let i = 0; i < 10; i++) {
      if (pattern[i] === standardIP[i]) ipMatches++;
    }
    // Give HUGE bonus for matching the standard pattern
    // 10 matches = perfect iambic pentameter = +50 points
    score += ipMatches * 5;

    // Extra bonus for perfect match
    if (ipMatches === 10) {
      score += 20;
    }
  }

  // CONSTRAINT 9: REGULAR FOOT COUNT (weight: 5)
  // Prefer patterns that divide evenly into feet (especially pentameter)
  const stressCount = pattern.filter(s => s).length;
  if (stressCount >= 4 && stressCount <= 6 && n >= 8 && n <= 12) {
    // Looks like pentameter range
    score += 5;
  }

  return score;
}

/**
 * Analyze a single line's scansion
 */
function analyzeLine(line: string, lineIndex: number): LineScansion {
  const words = line.trim().split(/\s+/).filter(w => w.length > 0);
  const wordScansions = words.map(analyzeWord).filter(w => w.syllables.length > 0);

  // Apply metrical smoothing to get a more natural pattern
  const fullPattern = applyMetricalSmoothing(wordScansions);

  // Update word scansions to match smoothed pattern
  let patternIndex = 0;
  for (const ws of wordScansions) {
    for (let i = 0; i < ws.syllables.length; i++) {
      if (patternIndex < fullPattern.length) {
        ws.syllables[i].stressed = fullPattern[patternIndex] === '/';
        patternIndex++;
      }
    }
    // Update word's stress pattern
    ws.stressPattern = ws.syllables.map(s => s.stressed ? '/' : 'u').join('');
  }

  // Identify feet and meter
  const { feet, meterType } = identifyFeet(fullPattern);

  // A line is "regular" if it matches a known standard meter
  // (meterType is non-empty only when we have a close match)
  const isRegular = meterType !== '';

  return {
    lineIndex,
    text: line,
    words: wordScansions,
    fullPattern,
    feet,
    meterType,
    isRegular,
  };
}

/**
 * Analyze scansion for the entire text
 */
export function analyzeScansion(text: string): ScansionAnalysis {
  const lines = text.split('\n');
  const scannedLines: LineScansion[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    scannedLines.push(analyzeLine(line, i));
  }

  // Determine dominant meter across all lines
  const meterCounts: Record<string, number> = {};
  let regularCount = 0;

  for (const line of scannedLines) {
    if (line.meterType) {
      meterCounts[line.meterType] = (meterCounts[line.meterType] || 0) + 1;
    }
    if (line.isRegular) {
      regularCount++;
    }
  }

  let dominantMeter = 'free verse';
  let maxCount = 0;
  for (const [meter, count] of Object.entries(meterCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantMeter = meter;
    }
  }

  const regularityScore = scannedLines.length > 0
    ? Math.round((regularCount / scannedLines.length) * 100)
    : 0;

  return {
    lines: scannedLines,
    dominantMeter,
    regularityScore,
  };
}

/**
 * Format a stress pattern for display
 * Returns pattern with / for stressed and u for unstressed
 */
export function formatStressPattern(pattern: string): string {
  return pattern;
}

/**
 * Get styled syllables for display
 * Returns array of { text, stressed } for rendering
 */
export function getStyledSyllables(line: LineScansion): Array<{ text: string; stressed: boolean; isSpace: boolean }> {
  const result: Array<{ text: string; stressed: boolean; isSpace: boolean }> = [];

  for (let i = 0; i < line.words.length; i++) {
    const word = line.words[i];

    for (const syllable of word.syllables) {
      result.push({
        text: syllable.text,
        stressed: syllable.stressed,
        isSpace: false,
      });
    }

    // Add space between words
    if (i < line.words.length - 1) {
      result.push({
        text: ' ',
        stressed: false,
        isSpace: true,
      });
    }
  }

  return result;
}

/**
 * Get all syllable instances with their character offsets for editor highlighting
 * Returns stressed syllables that can be highlighted in the editor
 */
export function getScansionInstances(text: string, filterLineIndex?: number): StressedSyllableInstance[] {
  const instances: StressedSyllableInstance[] = [];
  const lines = text.split('\n');
  let lineStartOffset = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const trimmed = line.trim();

    if (!trimmed) {
      lineStartOffset += line.length + 1;
      continue;
    }

    // Skip lines that don't match the filter (if filter is provided)
    if (filterLineIndex !== undefined && lineIndex !== filterLineIndex) {
      lineStartOffset += line.length + 1;
      continue;
    }

    // Analyze this line's scansion
    const lineScansion = analyzeLine(trimmed, lineIndex);

    // Find word positions in the original line
    let searchPos = 0;
    for (const wordScansion of lineScansion.words) {
      // Find where this word starts in the line
      const wordLower = wordScansion.word.toLowerCase();
      const lineFromSearch = line.slice(searchPos).toLowerCase();
      const wordPosInRemainder = lineFromSearch.indexOf(wordLower);

      if (wordPosInRemainder === -1) continue;

      const wordStartInLine = searchPos + wordPosInRemainder;
      const wordStart = lineStartOffset + wordStartInLine;

      // Calculate syllable positions within the word
      let syllableOffset = 0;
      for (const syllable of wordScansion.syllables) {
        const syllableStart = wordStart + syllableOffset;
        const syllableEnd = syllableStart + syllable.text.length;

        instances.push({
          text: syllable.text,
          startOffset: syllableStart,
          endOffset: syllableEnd,
          stressed: syllable.stressed,
        });

        syllableOffset += syllable.text.length;
      }

      // Move search position past this word
      searchPos = wordStartInLine + wordScansion.word.length;
    }

    lineStartOffset += line.length + 1;
  }

  return instances;
}
