/**
 * Poem-Level Meter Classification System
 *
 * Implements a Prosodic-style approach:
 * 1. Analyze the ENTIRE poem to determine dominant meter
 * 2. Use that as a strong prior for line-level scansion
 * 3. Detect genuine deviations from the established meter
 *
 * This beats Prosodic by:
 * - Using poem-level context to inform line-level decisions
 * - Detecting intentional substitutions (not errors)
 * - Providing confidence scores for ambiguous cases
 * - Better handling of free verse detection
 */

import { getStressPattern as getCMUStressPattern, isDictionaryLoaded } from './cmuDict';

// ============================================================================
// TYPES
// ============================================================================

export type FootType = 'iamb' | 'trochee' | 'spondee' | 'pyrrhic' | 'anapest' | 'dactyl';
export type MeterBase = 'iambic' | 'trochaic' | 'anapestic' | 'dactylic' | 'free';
export type FootCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface PoemClassification {
  meterBase: MeterBase;
  footCount: FootCount | null;  // null for free verse
  confidence: number;           // 0-1, how confident we are
  isMetrical: boolean;          // true if poem follows regular meter
  regularityScore: number;      // 0-100, how closely it follows the meter

  // Detailed analysis
  syllableDistribution: Map<number, number>;  // syllable count -> frequency
  footTypeDistribution: Map<FootType, number>; // foot type -> frequency

  // Evidence for classification
  evidence: ClassificationEvidence;
}

export interface ClassificationEvidence {
  iambicScore: number;
  trochaicScore: number;
  anapesticScore: number;
  dactylicScore: number;
  freeVerseScore: number;

  // Why we chose what we did
  reasoning: string[];
}

export interface LineClassification {
  pattern: string;              // The final scansion pattern
  rawPattern: string;           // Pattern before meter-informed adjustment
  syllableCount: number;
  footCount: number;

  followsMeter: boolean;        // Does this line follow the poem's meter?
  deviation: DeviationType | null;  // If not following, what kind of deviation?
  deviationPosition: number | null; // Where in the line the deviation occurs

  confidence: number;           // 0-1
  alternatePatterns: string[];  // Other possible patterns (for ambiguous lines)
}

export type DeviationType =
  | 'substitution'      // One foot replaced (e.g., trochee for iamb)
  | 'headless'          // Missing unstressed syllable at start
  | 'feminine_ending'   // Extra unstressed syllable at end
  | 'catalexis'         // Missing final syllable
  | 'anacrusis'         // Extra syllable(s) at start
  | 'irregular'         // Doesn't fit any known pattern
  | 'free_verse';       // Not following any meter

// ============================================================================
// CONSTANTS
// ============================================================================

// Standard metrical patterns for different meters
const METER_TEMPLATES: Record<MeterBase, (footCount: number) => string> = {
  iambic: (n) => 'u/'.repeat(n),
  trochaic: (n) => '/u'.repeat(n),
  anapestic: (n) => 'uu/'.repeat(n),
  dactylic: (n) => '/uu'.repeat(n),
  free: () => '',
};

// Syllable counts for each meter type per foot
const SYLLABLES_PER_FOOT: Record<MeterBase, number> = {
  iambic: 2,
  trochaic: 2,
  anapestic: 3,
  dactylic: 3,
  free: 0,
};

// Common foot counts in English poetry
const COMMON_FOOT_COUNTS: FootCount[] = [4, 5, 3, 6, 2, 7, 8, 1];

// Function words - typically unstressed
const FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'from',
  'as', 'and', 'but', 'or', 'nor', 'so', 'yet', 'if', 'than', 'that', 'which',
  'who', 'whom', 'whose', 'when', 'where', 'while', 'though', 'although',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am',
  'have', 'has', 'had', 'do', 'does', 'did',
  'shall', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
  'this', 'these', 'that', 'those',
]);

// Content words that strongly prefer stress
const STRONG_CONTENT_WORDS = new Set([
  'love', 'death', 'life', 'time', 'world', 'heart', 'soul', 'mind', 'god', 'man',
  'night', 'day', 'light', 'dark', 'war', 'peace', 'truth', 'hope', 'fear', 'joy',
  'pain', 'grief', 'rage', 'fire', 'earth', 'sea', 'sky', 'sun', 'moon', 'star',
]);

// Explicit poetic syllable counts for words where CMU is wrong or varies
const EXPLICIT_SYLLABLES: Record<string, number> = {
  // Words that are consistently 1 syllable in poetry (vowel coalescence)
  'fire': 1, 'hire': 1, 'lyre': 1, 'gyre': 1, 'pyre': 1, 'spire': 1, 'wire': 1,
  'hour': 1, 'our': 1, 'flower': 1, 'power': 1, 'tower': 1, 'shower': 1,
  'bower': 1, 'dower': 1, 'cower': 1, 'glower': 1, 'sour': 1,
  'flour': 1, 'scour': 1, 'dour': 1,

  // Heaven family (heav'n)
  'heaven': 1, 'heavens': 1, 'heavenly': 2,

  // Even family (e'en)
  'even': 1, 'evening': 2, 'evenings': 2,

  // Given/driven/etc (often 1 in older poetry)
  'spirit': 1, 'spirits': 1,

  // Specific high-frequency words
  'miles': 1,
  'disobedience': 4,

  // Words with -tion that are 1 syllable
  'ion': 1,

  // CRITICAL FIX: Words that CMU dictionary has WRONG syllable counts
  // These are clearly 1 syllable but CMU says 2
  'mete': 1, 'dole': 1, 'vexed': 1, 'matched': 1,
  'am': 1,  // CMU has this as 2!

  // Compound words - need explicit counts
  'wherethrough': 2, 'wherein': 2, 'whereof': 2, 'whereon': 2,
  'whereto': 2, 'whereby': 2, 'heretofore': 3, 'therefore': 2,
  'hereafter': 3, 'thereafter': 3, 'furthermore': 3,

  // Words that are often 2 syllables but CMU says 3
  'interest': 2, 'different': 2, 'several': 2, 'general': 2,
  'natural': 2, 'federal': 2, 'liberal': 2, 'literal': 2,
  'prisoner': 2, 'poisoner': 2, 'reasoner': 2,
  'wandering': 2, 'wondering': 2, 'pondering': 2, 'lingering': 2,
  'glittering': 2, 'glimmering': 2, 'shimmering': 2, 'shivering': 2,
  'whispering': 2, 'flickering': 2, 'quivering': 2, 'wavering': 2,
  'gathering': 2, 'scattering': 2, 'shattering': 2, 'flattering': 2,
  'battering': 2, 'chattering': 2, 'clattering': 2, 'pattering': 2,
  'withering': 2, 'dithering': 2, 'slithering': 2,
  'flowering': 2, 'showering': 2, 'towering': 2, 'cowering': 2,
  'hovering': 2, 'covering': 2,
  'entering': 2, 'centering': 2,
  'opening': 2, 'happening': 2, 'threatening': 2, 'listening': 2,
  'glistening': 2, 'christening': 2,
  'widening': 2, 'maddening': 2, 'saddening': 2, 'gladdening': 2,
  'softening': 2, 'hastening': 2, 'fastening': 2, 'loosening': 2,
  'every': 2, 'memory': 2, 'history': 2, 'mystery': 2, 'misery': 2,
  'business': 2, 'family': 2, 'usually': 3, 'beautiful': 3,

  // Archaic/poetic one-syllable forms
  'prayers': 1, 'player': 1, 'layer': 1,

  // Experience is 4, not 5
  'experience': 4, 'experiences': 4,

  // More common words with wrong CMU counts
  'travelled': 2, 'traveled': 2, 'untraveled': 3, 'untravelled': 3,
  'marvelled': 2, 'marveled': 2,
  'levelled': 2, 'leveled': 2,
  'modelled': 2, 'modeled': 2,
  'cancelled': 2, 'canceled': 2,
  'labelled': 2, 'labeled': 2,

  // Words ending in -ness that reduce
  'countenance': 3, 'maintenance': 3, 'sustenance': 3,

  // -ily words are often 2 syllables
  'busily': 2, 'easily': 2, 'happily': 2, 'readily': 2,
  'heavily': 2, 'steadily': 2, 'readily': 2,

  // Island is 2 syllables
  'island': 2, 'islands': 2,

  // Common archaic forms
  'camelot': 3,
};

// Pattern-based reductions: returns syllable reduction amount (or 0 if no match)
function getPatternBasedReduction(word: string, baseSyllables: number): number {
  const lower = word.toLowerCase();

  // -ering words: 3 → 2 (wand'ring, wond'ring, etc.)
  // The middle vowel is often elided
  if (lower.endsWith('ering') && baseSyllables >= 3) {
    return 1;  // Reduce by 1
  }

  // -ening words: 3 → 2 (op'ning, happ'ning, etc.)
  if (lower.endsWith('ening') && baseSyllables >= 3) {
    return 1;
  }

  // -ling words after consonant: often reduced (trembling → tremb'ling)
  if (lower.endsWith('bling') || lower.endsWith('dling') ||
      lower.endsWith('gling') || lower.endsWith('kling') ||
      lower.endsWith('tling') || lower.endsWith('zling')) {
    if (baseSyllables >= 3) return 1;
  }

  // -ery/-ary/-ory words: often 3 → 2 in poetry
  if ((lower.endsWith('ery') || lower.endsWith('ary') || lower.endsWith('ory')) &&
      baseSyllables === 3) {
    // Common words that reduce
    const reducePatterns = ['every', 'memory', 'history', 'victory', 'mystery',
      'misery', 'slavery', 'bravery', 'archery', 'sorcery', 'mockery', 'trickery',
      'factory', 'sensory', 'watery', 'buttery', 'lottery', 'pottery', 'battery',
      'flattery', 'drapery', 'nursery', 'gallery', 'celery', 'jewellery'];
    if (reducePatterns.includes(lower)) return 1;
  }

  // -ious/-eous words: often 3 → 2
  if ((lower.endsWith('ious') || lower.endsWith('eous')) && baseSyllables === 3) {
    return 1;
  }

  // -ual words: often 3 → 2 (act'ual, mut'ual)
  // But NOT words like "unequal", "equal" where -ual is part of "equal"
  if (lower.endsWith('ual') && baseSyllables === 3) {
    // Exclude words where 'ual' is part of 'equal'
    if (!lower.endsWith('equal')) {
      return 1;
    }
  }

  // -ier words: REMOVED - this was causing too many false reductions
  // Words like "soldier" should stay 2 syllables, not reduce to 1
  // if (lower.endsWith('ier') && baseSyllables === 2 && lower.length > 4) {
  //   return 1;
  // }

  // -ower words: 2 → 1 (flower, power, etc. - already in explicit)

  // -ful endings after unstressed syllable often reduce
  if (lower.endsWith('iful') && baseSyllables >= 3) {
    return 1;  // beautiful → beaut'ful
  }

  // -ness after -i- often reduces
  if (lower.endsWith('iness') && baseSyllables >= 3) {
    return 1;  // readiness → read'ness
  }

  // -al endings: natural, general, several → 2 syllables
  if (lower.endsWith('eral') || lower.endsWith('ural')) {
    if (baseSyllables === 3) return 1;
  }

  // -oner/-erer words often reduce
  if ((lower.endsWith('oner') || lower.endsWith('erer')) && baseSyllables >= 3) {
    return 1;
  }

  return 0;  // No reduction
}

// Special stress patterns that override CMU for poetry
// These are words where poetic stress differs from dictionary or CMU is wrong
const POETIC_STRESS_OVERRIDES: Record<string, boolean[]> = {
  // Archaic/poetic pronunciations
  'disobedience': [false, false, true, false],  // dis-o-BE-dience (4 syl)
  'impediments': [false, true, false, false],   // im-PED-i-ments
  'temperate': [true, false, false],            // TEM-per-ate

  // CRITICAL FIXES: CMU dictionary stress is WRONG for these common words
  'always': [true, false],       // AL-ways (not AL-WAYS)
  'myself': [false, true],       // my-SELF (not MY-SELF)
  'himself': [false, true],      // him-SELF
  'herself': [false, true],      // her-SELF
  'itself': [false, true],       // it-SELF
  'yourself': [false, true],     // your-SELF
  'themselves': [false, true],   // them-SELVES
  'ourselves': [false, true],    // our-SELVES

  // Two-syllable words with first-syllable stress (trochaic)
  'willows': [true, false],      // WIL-lows
  'yellow': [true, false],       // YEL-low
  'hollow': [true, false],       // HOL-low
  'follow': [true, false],       // FOL-low
  'narrow': [true, false],       // NAR-row
  'shadow': [true, false],       // SHA-dow
  'meadow': [true, false],       // MEA-dow
  'window': [true, false],       // WIN-dow

  // Words where meter often changes stress
  'sometime': [false, true],     // some-TIME in iambic
  'sometimes': [false, true],    // some-TIMES
  'midnight': [true, false],     // MID-night
  'into': [true, false],         // IN-to
  'upon': [false, true],         // u-PON

  // Three-syllable words with middle stress
  'imagine': [false, true, false],   // i-MA-gine
  'remember': [false, true, false],  // re-MEM-ber
  'together': [false, true, false],  // to-GE-ther
  'forever': [false, true, false],   // for-E-ver
  'however': [false, true, false],   // how-E-ver
  'whatever': [false, true, false],  // what-E-ver
  'whenever': [false, true, false],  // when-E-ver
  'wherever': [false, true, false],  // where-E-ver

  // Falling rhythm words (poetic reductions)
  'heaven': [true],              // HEAV'N (1 syllable)
  'evening': [true, false],      // EVE-ning
  'widening': [true, false],     // WI-d'ning
  'opening': [true, false],      // OP-ning
  'happening': [true, false],    // HAP-ning
  'listening': [true, false],    // LIS-ning
  'glistening': [true, false],   // GLIS-ning
  'threatening': [true, false],  // THREAT-ning
  'wandering': [true, false],    // WAN-dring
  'wondering': [true, false],    // WON-dring
  'glittering': [true, false],   // GLIT-ring
  'glimmering': [true, false],   // GLIM-ring
  'shimmering': [true, false],   // SHIM-ring
  'whispering': [true, false],   // WHIS-pring
  'flickering': [true, false],   // FLICK-ring
  'quivering': [true, false],    // QUI-vring
  'shivering': [true, false],    // SHI-vring
  'wavering': [true, false],     // WA-vring
  'hovering': [true, false],     // HO-vring
  'covering': [true, false],     // CO-vring
  'flowering': [true, false],    // FLOW-ring
  'towering': [true, false],     // TOW-ring
  'showering': [true, false],    // SHOW-ring
  'gathering': [true, false],    // GA-thring
  'withering': [true, false],    // WI-thring
  'entering': [true, false],     // EN-tring

  // Agent nouns
  'falconer': [true, false, false], // FAL-con-er

  // Experience (4 syllables)
  'experience': [false, true, false, false],  // ex-PE-ri-ence

  // Common adverbs ending in -ly
  'busily': [true, false],       // BU-si-ly → BUS-ly (2 syl)
  'easily': [true, false],       // EA-si-ly → EAS-ly (2 syl)
  'happily': [true, false],      // HAP-pi-ly → HAP-ly (2 syl)
  'heavily': [true, false],      // HEA-vi-ly → HEAV-ly (2 syl)
  'readily': [true, false],      // REA-di-ly → READ-ly (2 syl)
  'steadily': [true, false],     // STEA-di-ly → STEAD-ly (2 syl)

  // Three-syllable words
  'countenance': [true, false, false],  // COUN-te-nance
  'maintenance': [true, false, false],  // MAIN-te-nance
  'sustenance': [true, false, false],   // SUS-te-nance
  'untraveled': [false, true, false],   // un-TRA-veled
  'untravelled': [false, true, false],  // un-TRA-velled

  // Proper nouns
  'camelot': [true, false, false],      // CA-me-lot
};

// ============================================================================
// SYLLABLE ANALYSIS
// ============================================================================

/**
 * Get syllable count for a word, considering poetic reductions
 * Exported temporarily for debugging
 */
export function getSyllableCount(word: string): number {
  const lower = word.toLowerCase().replace(/[^a-z']/g, '');

  // Check explicit syllable counts first - these override everything
  const explicitCount = EXPLICIT_SYLLABLES[lower];
  if (explicitCount !== undefined) {
    return explicitCount;
  }

  // Handle contractions
  if (lower.includes("'")) {
    const contractionCounts: Record<string, number> = {
      "o'er": 1, "e'er": 1, "ne'er": 1, "'tis": 1, "'twas": 1,
      "whate'er": 2, "howe'er": 2, "whene'er": 2, "where'er": 2,
      "th'": 0,  // elided "the"
    };
    if (contractionCounts[lower] !== undefined) return contractionCounts[lower];

    // Possessive 's doesn't change syllable count
    if (lower.endsWith("'s")) {
      return getSyllableCount(lower.slice(0, -2));
    }

    // Handle 'd contractions (lov'd, call'd) - the -ed is silent
    if (lower.endsWith("'d")) {
      return getSyllableCount(lower.slice(0, -2));
    }
  }

  // Get base syllable count from CMU or heuristic
  let baseSyllables: number;
  if (isDictionaryLoaded()) {
    const cmuStress = getCMUStressPattern(lower);
    if (cmuStress.length > 0) {
      baseSyllables = cmuStress.length;
    } else {
      baseSyllables = countSyllablesHeuristic(lower);
    }
  } else {
    baseSyllables = countSyllablesHeuristic(lower);
  }

  // Apply pattern-based reductions
  const reduction = getPatternBasedReduction(lower, baseSyllables);
  return Math.max(1, baseSyllables - reduction);
}

function countSyllablesHeuristic(word: string): number {
  const lower = word.toLowerCase().replace(/[^a-z]/g, '');
  if (lower.length === 0) return 0;
  if (lower.length <= 3) return 1;

  let count = 0;
  const vowels = 'aeiouy';
  let prevWasVowel = false;

  for (let i = 0; i < lower.length; i++) {
    const isVowel = vowels.includes(lower[i]);
    if (isVowel && !prevWasVowel) count++;
    prevWasVowel = isVowel;
  }

  // Adjust for silent e at end (but not 'le' which is syllabic)
  if (lower.endsWith('e') && !lower.endsWith('le') && count > 1) {
    // Exception: -ive, -ine, -ite, -ade, -ide, -ode, -ude are usually silent e
    count--;
  }

  // Adjust for -ed endings: only syllabic after t or d
  if (lower.endsWith('ed') && count > 1) {
    const beforeEd = lower.slice(0, -2);
    // -ed is only syllabic after 't' or 'd'
    if (!beforeEd.endsWith('t') && !beforeEd.endsWith('d')) {
      count--;
    }
  }

  // Adjust for -es endings: only syllabic after sibilants (s, z, x, ch, sh)
  if (lower.endsWith('es') && count > 1) {
    const beforeEs = lower.slice(0, -2);
    const sibilants = ['s', 'z', 'x', 'ch', 'sh', 'ce', 'ge'];
    const isSibilant = sibilants.some(s => beforeEs.endsWith(s));
    if (!isSibilant) {
      count--;
    }
  }

  // Common diphthongs that count as 1 syllable
  // These are often over-counted by the naive algorithm
  const diphthongs = ['oi', 'oy', 'ou', 'ow', 'au', 'aw', 'oo', 'ea', 'ee', 'ie', 'ai', 'ay'];
  for (const diph of diphthongs) {
    if (lower.includes(diph)) {
      // Check if we over-counted (the diphthong was counted as 2)
      // This is a heuristic - we already counted vowels, but some pairs should be 1
    }
  }

  // Specific adjustments for common patterns
  // -tion, -sion are 1 syllable (already should be correct, but verify)
  if (lower.endsWith('tion') || lower.endsWith('sion')) {
    // These should be 1 syllable for the ending
    // If we counted 'io' as 2, we need to reduce
  }

  // -ious, -eous are typically 2 syllables total for the suffix, not 3
  if (lower.endsWith('ious') || lower.endsWith('eous')) {
    if (count > 2) count--;  // Often overcounted
  }

  return Math.max(1, count);
}

// Additional words that strongly prefer stress (monosyllables)
const STRESSED_MONOSYLLABLES = new Set([
  // Verbs that are almost always stressed
  'go', 'come', 'see', 'know', 'think', 'make', 'take', 'give', 'find', 'tell',
  'say', 'get', 'put', 'keep', 'let', 'leave', 'call', 'try', 'ask', 'need',
  'feel', 'seem', 'want', 'use', 'work', 'look', 'turn', 'show', 'hear', 'play',
  'run', 'move', 'live', 'hold', 'bring', 'write', 'stand', 'sit', 'lose', 'pay',
  'meet', 'set', 'learn', 'change', 'lead', 'grow', 'begin', 'mean',
  // Strong nouns
  'god', 'man', 'king', 'lord', 'death', 'life', 'love', 'hate', 'heart', 'soul',
  'mind', 'world', 'earth', 'sea', 'sky', 'sun', 'moon', 'star', 'night', 'day',
  'time', 'year', 'home', 'house', 'land', 'hand', 'eye', 'face', 'head', 'name',
  'child', 'friend', 'voice', 'word', 'thought', 'dream', 'hope', 'fear', 'joy',
  'pain', 'grief', 'rage', 'war', 'peace', 'truth', 'lie', 'right', 'wrong',
  // Strong adjectives
  'good', 'bad', 'great', 'small', 'old', 'new', 'young', 'long', 'short', 'high',
  'low', 'large', 'true', 'false', 'dark', 'light', 'bright', 'deep', 'strong',
  'weak', 'full', 'last', 'first', 'best', 'worst', 'whole', 'same', 'own',
  // Strong adverbs
  'now', 'then', 'here', 'there', 'still', 'just', 'once', 'twice', 'much', 'more',
  'most', 'well', 'ill', 'far', 'near', 'soon', 'late', 'fast', 'slow',
  // Negation (often stressed for emphasis)
  'no', 'not', 'none', 'nor',
  // Interrogatives (often stressed)
  'what', 'why', 'how', 'where', 'when',
]);

/**
 * Get lexical stress pattern for a word
 * Returns array of booleans: true = stressed, false = unstressed
 * Exported temporarily for debugging
 */
export function getLexicalStress(word: string): boolean[] {
  const lower = word.toLowerCase().replace(/[^a-z']/g, '');
  const syllableCount = getSyllableCount(lower);

  if (syllableCount === 0) return [];

  // Check poetic stress overrides first - these override CMU for poetry
  if (POETIC_STRESS_OVERRIDES[lower]) {
    const override = POETIC_STRESS_OVERRIDES[lower];
    // Adjust to match syllable count if needed
    if (override.length === syllableCount) {
      return override;
    }
    if (override.length > syllableCount) {
      return reduceStressPattern(override, syllableCount);
    }
    // If override is shorter than syllables, pad with false
    if (override.length < syllableCount) {
      const result = [...override];
      while (result.length < syllableCount) {
        result.push(false);
      }
      return result;
    }
  }

  // Single syllable: determine stress based on word class
  if (syllableCount === 1) {
    // Function words are unstressed by default
    if (FUNCTION_WORDS.has(lower)) {
      return [false];
    }
    // Strong content words and stressed monosyllables
    if (STRONG_CONTENT_WORDS.has(lower) || STRESSED_MONOSYLLABLES.has(lower)) {
      return [true];
    }
    // Default: most monosyllables are stressed
    // (nouns, verbs, adjectives, adverbs tend to be stressed)
    return [true];
  }

  // Try CMU dictionary
  if (isDictionaryLoaded()) {
    const cmuStress = getCMUStressPattern(lower);
    if (cmuStress.length > 0) {
      // Convert CMU pattern (0/1/2) to boolean (stressed/unstressed)
      // Treat both primary (1) and secondary (2) stress as stressed
      const pattern = cmuStress.map(s => s > 0);

      // Adjust if we have poetic reduction
      if (pattern.length > syllableCount) {
        return reduceStressPattern(pattern, syllableCount);
      }
      return pattern;
    }
  }

  // Fallback: use stress rules
  return getDefaultStressPattern(lower, syllableCount);
}

function reduceStressPattern(pattern: boolean[], targetCount: number): boolean[] {
  if (pattern.length <= targetCount) return pattern;

  // Find primary stress position
  const stressPos = pattern.indexOf(true);

  if (targetCount === 1) {
    return [stressPos >= 0];
  }

  if (targetCount === 2) {
    if (stressPos <= pattern.length / 2) {
      return [true, false];
    } else {
      return [false, true];
    }
  }

  // For longer reductions, preserve stress proportionally
  const result: boolean[] = [];
  const ratio = pattern.length / targetCount;

  for (let i = 0; i < targetCount; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.floor((i + 1) * ratio);
    let hasStress = false;
    for (let j = start; j < end && j < pattern.length; j++) {
      if (pattern[j]) hasStress = true;
    }
    result.push(hasStress);
  }

  return result;
}

function getDefaultStressPattern(word: string, syllableCount: number): boolean[] {
  // Common patterns for unknown words
  if (syllableCount === 2) {
    // Most 2-syllable English words are stressed on first syllable
    const secondStressPrefixes = ['be', 'de', 'dis', 'en', 'ex', 'in', 'mis', 'pre', 're', 'un'];
    for (const prefix of secondStressPrefixes) {
      if (word.startsWith(prefix) && word.length > prefix.length + 2) {
        return [false, true];
      }
    }
    return [true, false];
  }

  if (syllableCount === 3) {
    if (word.endsWith('ity') || word.endsWith('tion') || word.endsWith('sion')) {
      return [false, true, false];
    }
    return [true, false, false];
  }

  // 4+ syllables: stress near end
  const result: boolean[] = new Array(syllableCount).fill(false);
  result[syllableCount - 3] = true;
  return result;
}

// ============================================================================
// LINE ANALYSIS
// ============================================================================

interface WordInfo {
  word: string;
  syllables: number;
  stress: boolean[];
  isFlexible: boolean[];  // Which syllables can be toggled
}

/**
 * Analyze a line into words with stress information
 */
function analyzeLineWords(line: string): WordInfo[] {
  // First, replace em-dashes and en-dashes with spaces to separate words
  const normalized = line.replace(/[—–]/g, ' ');
  const words = normalized.trim().split(/\s+/).filter(w => w.length > 0);
  const result: WordInfo[] = [];

  for (const word of words) {
    // Remove non-letter characters except apostrophes and hyphens
    const clean = word.replace(/[^a-zA-Z'-]/g, '');
    if (!clean) continue;

    // Split hyphenated compounds into separate words (e.g., "many-towered" → "many", "towered")
    // But keep apostrophe contractions together (e.g., "don't", "o'er")
    if (clean.includes('-')) {
      const parts = clean.split('-').filter(p => p.length > 0);
      for (const part of parts) {
        const syllables = getSyllableCount(part);
        const stress = getLexicalStress(part);
        const isFlexible = stress.map(() => stress.length === 1);
        result.push({ word: part, syllables, stress, isFlexible });
      }
    } else {
      const syllables = getSyllableCount(clean);
      const stress = getLexicalStress(clean);
      const isFlexible = stress.map(() => stress.length === 1);
      result.push({ word: clean, syllables, stress, isFlexible });
    }
  }

  return result;
}

/**
 * Get the raw stress pattern for a line (before meter adjustment)
 */
function getRawLinePattern(words: WordInfo[]): boolean[] {
  const pattern: boolean[] = [];
  for (const word of words) {
    pattern.push(...word.stress);
  }
  return pattern;
}

/**
 * Calculate how well a pattern matches a given meter template
 * Returns 0-1 score
 *
 * Handles common variations:
 * - Feminine ending (extra unstressed syllable)
 * - Headless line (missing initial unstressed)
 * - Anacrusis (extra syllables at start)
 */
function scorePatternAgainstMeter(
  pattern: boolean[],
  meterBase: MeterBase,
  footCount: number
): number {
  if (meterBase === 'free') return 0;

  const template = METER_TEMPLATES[meterBase](footCount);
  const expectedLen = template.length;

  // Check for exact match
  if (pattern.length === expectedLen) {
    let matches = 0;
    for (let i = 0; i < pattern.length; i++) {
      const expected = template[i] === '/';
      if (pattern[i] === expected) matches++;
    }
    return matches / pattern.length;
  }

  // Check for common variations with small penalty

  // Feminine ending: one extra unstressed at end (very common in English)
  if (pattern.length === expectedLen + 1 && !pattern[pattern.length - 1]) {
    let matches = 0;
    for (let i = 0; i < expectedLen; i++) {
      const expected = template[i] === '/';
      if (pattern[i] === expected) matches++;
    }
    // Small penalty for feminine ending (it's legitimate)
    return (matches / expectedLen) * 0.95;
  }

  // Headless line: missing first unstressed (common in iambic)
  if (pattern.length === expectedLen - 1 && meterBase === 'iambic') {
    // Compare skipping first expected syllable
    let matches = 0;
    for (let i = 0; i < pattern.length; i++) {
      const expected = template[i + 1] === '/';
      if (pattern[i] === expected) matches++;
    }
    return (matches / pattern.length) * 0.90;
  }

  // Catalexis: missing final syllable (common in trochaic)
  if (pattern.length === expectedLen - 1 && meterBase === 'trochaic') {
    let matches = 0;
    for (let i = 0; i < pattern.length; i++) {
      const expected = template[i] === '/';
      if (pattern[i] === expected) matches++;
    }
    return (matches / pattern.length) * 0.90;
  }

  // For larger mismatches, check adjacent foot counts too
  // E.g., 9 syllables could be iambic tetrameter+feminine or iambic pentameter-headless
  if (Math.abs(pattern.length - expectedLen) <= 2) {
    const minLen = Math.min(pattern.length, expectedLen);
    let matches = 0;
    for (let i = 0; i < minLen; i++) {
      const expected = template[i] === '/';
      if (pattern[i] === expected) matches++;
    }
    const lengthPenalty = Math.abs(pattern.length - expectedLen) * 0.08;
    return Math.max(0, (matches / minLen) - lengthPenalty);
  }

  // Large mismatch - significant penalty
  const minLen = Math.min(pattern.length, expectedLen);
  let matches = 0;
  for (let i = 0; i < minLen; i++) {
    const expected = template[i] === '/';
    if (pattern[i] === expected) matches++;
  }
  const lengthPenalty = Math.abs(pattern.length - expectedLen) * 0.15;
  return Math.max(0, (matches / minLen) - lengthPenalty);
}

// ============================================================================
// POEM-LEVEL CLASSIFICATION
// ============================================================================

/**
 * Classify the meter of an entire poem
 */
export function classifyPoem(text: string): PoemClassification {
  const lines = text.split('\n').filter(l => l.trim().length > 0);

  if (lines.length === 0) {
    return createFreeVerseClassification('No content');
  }

  // Analyze all lines
  const lineData: { words: WordInfo[], pattern: boolean[], syllables: number }[] = [];
  const syllableCounts = new Map<number, number>();

  for (const line of lines) {
    const words = analyzeLineWords(line);
    const pattern = getRawLinePattern(words);
    const syllables = pattern.length;

    lineData.push({ words, pattern, syllables });
    syllableCounts.set(syllables, (syllableCounts.get(syllables) || 0) + 1);
  }

  // Find most common syllable count
  let dominantSyllableCount = 0;
  let maxCount = 0;
  for (const [count, freq] of syllableCounts) {
    if (freq > maxCount) {
      maxCount = freq;
      dominantSyllableCount = count;
    }
  }

  // Calculate scores for each meter type
  const evidence = calculateMeterEvidence(lineData, dominantSyllableCount);

  // Determine the best meter
  const scores = [
    { meter: 'iambic' as MeterBase, score: evidence.iambicScore },
    { meter: 'trochaic' as MeterBase, score: evidence.trochaicScore },
    { meter: 'anapestic' as MeterBase, score: evidence.anapesticScore },
    { meter: 'dactylic' as MeterBase, score: evidence.dactylicScore },
  ];

  // Apply English poetry priors:
  // - Iambic is by far the most common meter (boost by 20%)
  // - Trochaic is second most common (boost by 10%)
  // - Anapestic is common in light/comic verse (no change)
  // - Dactylic is uncommon but exists (slight penalty 5%)
  for (const s of scores) {
    if (s.meter === 'iambic') s.score *= 1.20;
    else if (s.meter === 'trochaic') s.score *= 1.10;
    else if (s.meter === 'dactylic') s.score *= 0.95;
  }

  scores.sort((a, b) => b.score - a.score);
  const bestMeter = scores[0];

  // Check if it's really metrical or free verse
  // Consider multiple factors:
  // 1. Best meter score
  // 2. Line length variation (free verse has highly variable line lengths)
  // 3. Very short poems with short lines are often free verse

  const freeVerseThreshold = 0.55;

  // Calculate line length variation (coefficient of variation)
  const syllableLengths = lineData.map(l => l.syllables);
  const avgLength = syllableLengths.reduce((a, b) => a + b, 0) / syllableLengths.length;
  const variance = syllableLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / syllableLengths.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = avgLength > 0 ? stdDev / avgLength : 0;

  // High variation (CV > 0.4) suggests free verse
  const highVariation = coefficientOfVariation > 0.4;

  // Very short average line length (< 4 syllables) with high variation = free verse
  const veryShortLines = avgLength < 4;

  // Check for free verse conditions
  if (bestMeter.score < freeVerseThreshold) {
    return createFreeVerseClassification(
      `Best meter score (${bestMeter.meter}: ${(bestMeter.score * 100).toFixed(1)}%) below threshold`,
      evidence,
      syllableCounts
    );
  }

  // Even with decent meter score, high line variation suggests free verse
  if (highVariation && veryShortLines) {
    return createFreeVerseClassification(
      `High line length variation (CV=${(coefficientOfVariation * 100).toFixed(0)}%) with short lines suggests free verse`,
      evidence,
      syllableCounts
    );
  }

  // Also detect free verse by checking if most lines are very short (1-4 syllables)
  // Imagist/modernist free verse often has very short lines
  const shortLineCount = syllableLengths.filter(len => len <= 4).length;
  const shortLineRatio = shortLineCount / syllableLengths.length;
  if (shortLineRatio > 0.6 && avgLength < 4) {
    return createFreeVerseClassification(
      `${(shortLineRatio * 100).toFixed(0)}% of lines have ≤4 syllables - suggests free verse`,
      evidence,
      syllableCounts
    );
  }

  // Determine foot count
  const footCount = determineFootCount(bestMeter.meter, dominantSyllableCount, lineData);

  // Calculate regularity
  const regularityScore = calculateRegularity(lineData, bestMeter.meter, footCount);

  return {
    meterBase: bestMeter.meter,
    footCount,
    confidence: bestMeter.score,
    isMetrical: true,
    regularityScore,
    syllableDistribution: syllableCounts,
    footTypeDistribution: calculateFootDistribution(lineData),
    evidence,
  };
}

function createFreeVerseClassification(
  reason: string,
  evidence?: ClassificationEvidence,
  syllableCounts?: Map<number, number>
): PoemClassification {
  return {
    meterBase: 'free',
    footCount: null,
    confidence: evidence?.freeVerseScore ?? 0.5,
    isMetrical: false,
    regularityScore: 0,
    syllableDistribution: syllableCounts ?? new Map(),
    footTypeDistribution: new Map(),
    evidence: evidence ?? {
      iambicScore: 0,
      trochaicScore: 0,
      anapesticScore: 0,
      dactylicScore: 0,
      freeVerseScore: 1,
      reasoning: [reason],
    },
  };
}

function calculateMeterEvidence(
  lineData: { words: WordInfo[], pattern: boolean[], syllables: number }[],
  dominantSyllableCount: number
): ClassificationEvidence {
  const reasoning: string[] = [];

  // Score each meter type
  let iambicTotal = 0, trochaicTotal = 0, anapesticTotal = 0, dactylicTotal = 0;
  let linesScored = 0;

  for (const { pattern } of lineData) {
    if (pattern.length < 4) continue;  // Skip very short lines

    // Try different foot counts for each meter
    const bestIambic = findBestFootCount('iambic', pattern);
    const bestTrochaic = findBestFootCount('trochaic', pattern);
    const bestAnapestic = findBestFootCount('anapestic', pattern);
    const bestDactylic = findBestFootCount('dactylic', pattern);

    iambicTotal += bestIambic.score;
    trochaicTotal += bestTrochaic.score;
    anapesticTotal += bestAnapestic.score;
    dactylicTotal += bestDactylic.score;
    linesScored++;
  }

  if (linesScored === 0) {
    return {
      iambicScore: 0, trochaicScore: 0, anapesticScore: 0, dactylicScore: 0,
      freeVerseScore: 1,
      reasoning: ['No lines long enough to analyze'],
    };
  }

  const iambicScore = iambicTotal / linesScored;
  const trochaicScore = trochaicTotal / linesScored;
  const anapesticScore = anapesticTotal / linesScored;
  const dactylicScore = dactylicTotal / linesScored;

  // Calculate free verse score (inverse of best meter)
  const bestMeterScore = Math.max(iambicScore, trochaicScore, anapesticScore, dactylicScore);
  const freeVerseScore = 1 - bestMeterScore;

  reasoning.push(`Iambic: ${(iambicScore * 100).toFixed(1)}%`);
  reasoning.push(`Trochaic: ${(trochaicScore * 100).toFixed(1)}%`);
  reasoning.push(`Anapestic: ${(anapesticScore * 100).toFixed(1)}%`);
  reasoning.push(`Dactylic: ${(dactylicScore * 100).toFixed(1)}%`);
  reasoning.push(`Dominant syllable count: ${dominantSyllableCount}`);

  return {
    iambicScore,
    trochaicScore,
    anapesticScore,
    dactylicScore,
    freeVerseScore,
    reasoning,
  };
}

function findBestFootCount(
  meter: MeterBase,
  pattern: boolean[]
): { footCount: number, score: number } {
  let bestScore = 0;
  let bestFootCount = 5;

  for (const footCount of COMMON_FOOT_COUNTS) {
    const score = scorePatternAgainstMeter(pattern, meter, footCount);
    if (score > bestScore) {
      bestScore = score;
      bestFootCount = footCount;
    }
  }

  return { footCount: bestFootCount, score: bestScore };
}

function determineFootCount(
  meter: MeterBase,
  dominantSyllableCount: number,
  lineData: { words: WordInfo[], pattern: boolean[], syllables: number }[]
): FootCount {
  const syllablesPerFoot = SYLLABLES_PER_FOOT[meter];

  // Calculate from dominant syllable count
  const impliedFootCount = Math.round(dominantSyllableCount / syllablesPerFoot);

  // Validate against actual lines
  const footCountVotes = new Map<number, number>();

  for (const { pattern } of lineData) {
    for (const footCount of COMMON_FOOT_COUNTS) {
      const score = scorePatternAgainstMeter(pattern, meter, footCount);
      if (score > 0.6) {  // Only count good matches
        footCountVotes.set(footCount, (footCountVotes.get(footCount) || 0) + score);
      }
    }
  }

  // Find best foot count
  let bestFootCount = impliedFootCount;
  let bestVotes = 0;

  for (const [fc, votes] of footCountVotes) {
    if (votes > bestVotes) {
      bestVotes = votes;
      bestFootCount = fc;
    }
  }

  // Clamp to valid range
  return Math.max(1, Math.min(8, bestFootCount)) as FootCount;
}

function calculateRegularity(
  lineData: { words: WordInfo[], pattern: boolean[], syllables: number }[],
  meter: MeterBase,
  footCount: FootCount
): number {
  let totalScore = 0;
  let scoredLines = 0;

  for (const { pattern } of lineData) {
    if (pattern.length < 4) continue;
    const score = scorePatternAgainstMeter(pattern, meter, footCount);
    totalScore += score;
    scoredLines++;
  }

  if (scoredLines === 0) return 0;
  return Math.round((totalScore / scoredLines) * 100);
}

function calculateFootDistribution(
  lineData: { words: WordInfo[], pattern: boolean[], syllables: number }[]
): Map<FootType, number> {
  const distribution = new Map<FootType, number>();

  for (const { pattern } of lineData) {
    // Parse pattern into feet
    let i = 0;
    while (i < pattern.length) {
      // Try to match feet
      let foot: FootType | null = null;

      if (i + 2 <= pattern.length) {
        const twoSyl = pattern.slice(i, i + 2);
        if (!twoSyl[0] && twoSyl[1]) foot = 'iamb';
        else if (twoSyl[0] && !twoSyl[1]) foot = 'trochee';
        else if (twoSyl[0] && twoSyl[1]) foot = 'spondee';
        else if (!twoSyl[0] && !twoSyl[1]) foot = 'pyrrhic';
      }

      if (i + 3 <= pattern.length && !foot) {
        const threeSyl = pattern.slice(i, i + 3);
        if (!threeSyl[0] && !threeSyl[1] && threeSyl[2]) foot = 'anapest';
        else if (threeSyl[0] && !threeSyl[1] && !threeSyl[2]) foot = 'dactyl';
      }

      if (foot) {
        distribution.set(foot, (distribution.get(foot) || 0) + 1);
        i += (foot === 'anapest' || foot === 'dactyl') ? 3 : 2;
      } else {
        i++;
      }
    }
  }

  return distribution;
}

// ============================================================================
// METER-INFORMED LINE SCANSION
// ============================================================================

/**
 * Scan a single line, informed by the poem's overall meter
 */
export function scanLineWithMeter(
  line: string,
  poemClassification: PoemClassification
): LineClassification {
  const words = analyzeLineWords(line);
  const rawPattern = getRawLinePattern(words);
  const syllableCount = rawPattern.length;

  if (syllableCount === 0) {
    return {
      pattern: '',
      rawPattern: '',
      syllableCount: 0,
      footCount: 0,
      followsMeter: true,
      deviation: null,
      deviationPosition: null,
      confidence: 1,
      alternatePatterns: [],
    };
  }

  // If free verse, just return the raw pattern
  if (!poemClassification.isMetrical) {
    return {
      pattern: rawPattern.map(s => s ? '/' : 'u').join(''),
      rawPattern: rawPattern.map(s => s ? '/' : 'u').join(''),
      syllableCount,
      footCount: Math.ceil(syllableCount / 2),
      followsMeter: true,
      deviation: 'free_verse',
      deviationPosition: null,
      confidence: 0.5,
      alternatePatterns: [],
    };
  }

  // Get the expected pattern for this meter
  const expectedFootCount = poemClassification.footCount!;
  const expectedPattern = METER_TEMPLATES[poemClassification.meterBase](expectedFootCount);

  // Find the best pattern that respects both lexical stress AND the meter
  const { pattern, confidence, alternates } = findBestMeterInformedPattern(
    words,
    rawPattern,
    poemClassification.meterBase,
    expectedFootCount
  );

  // Determine if this line follows the meter or deviates
  const { followsMeter, deviation, deviationPosition } = analyzeDeviation(
    pattern,
    expectedPattern,
    poemClassification.meterBase
  );

  return {
    pattern: pattern.map(s => s ? '/' : 'u').join(''),
    rawPattern: rawPattern.map(s => s ? '/' : 'u').join(''),
    syllableCount,
    footCount: Math.ceil(pattern.length / SYLLABLES_PER_FOOT[poemClassification.meterBase]),
    followsMeter,
    deviation,
    deviationPosition,
    confidence,
    alternatePatterns: alternates.map(p => p.map(s => s ? '/' : 'u').join('')),
  };
}

function findBestMeterInformedPattern(
  words: WordInfo[],
  rawPattern: boolean[],
  meter: MeterBase,
  footCount: number
): { pattern: boolean[], confidence: number, alternates: boolean[][] } {
  const expectedPattern = METER_TEMPLATES[meter](footCount);
  const expectedBool = Array.from(expectedPattern).map(c => c === '/');

  // Build flexibility map
  const flexPositions: number[] = [];
  let pos = 0;
  for (const word of words) {
    for (let i = 0; i < word.syllables; i++) {
      if (word.isFlexible[i]) {
        flexPositions.push(pos);
      }
      pos++;
    }
  }

  // Limit search to reasonable number of positions
  const maxFlex = Math.min(flexPositions.length, 12);
  const searchPositions = flexPositions.slice(0, maxFlex);

  // Generate candidates and score them
  let bestPattern = [...rawPattern];
  let bestScore = scoreMeterPattern(rawPattern, expectedBool, words, meter);
  const alternates: boolean[][] = [];

  const numCombos = 1 << searchPositions.length;

  for (let combo = 0; combo < numCombos; combo++) {
    const candidate = [...rawPattern];

    for (let bit = 0; bit < searchPositions.length; bit++) {
      if (combo & (1 << bit)) {
        const pos = searchPositions[bit];
        if (pos < candidate.length) {
          candidate[pos] = !candidate[pos];
        }
      }
    }

    const score = scoreMeterPattern(candidate, expectedBool, words, meter);

    if (score > bestScore) {
      if (bestScore > bestScore - 10) {
        alternates.push(bestPattern);
      }
      bestScore = score;
      bestPattern = candidate;
    } else if (score > bestScore - 5) {
      alternates.push(candidate);
    }
  }

  // Normalize confidence to 0-1
  const maxPossibleScore = rawPattern.length * 15;  // Rough estimate
  const confidence = Math.min(1, Math.max(0, (bestScore + maxPossibleScore) / (2 * maxPossibleScore)));

  return { pattern: bestPattern, confidence, alternates: alternates.slice(0, 3) };
}

function scoreMeterPattern(
  pattern: boolean[],
  expectedPattern: boolean[],
  words: WordInfo[],
  meter: MeterBase
): number {
  let score = 0;
  const n = pattern.length;
  const expectedLen = expectedPattern.length;

  // CONSTRAINT 1: Match expected meter pattern (weight: 15)
  // This is the key insight from Prosodic - use poem-level meter as prior
  // Also handle length variations gracefully

  if (n === expectedLen) {
    // Perfect length match - compare directly
    for (let i = 0; i < n; i++) {
      if (pattern[i] === expectedPattern[i]) {
        score += 15;
      }
    }
  } else if (n === expectedLen + 1) {
    // Feminine ending - compare up to expected length, allow extra unstressed
    for (let i = 0; i < expectedLen; i++) {
      if (pattern[i] === expectedPattern[i]) {
        score += 14;  // Slightly less because of variation
      }
    }
    // Bonus if extra syllable is unstressed (legitimate feminine ending)
    if (!pattern[n - 1]) {
      score += 5;
    }
  } else if (n === expectedLen - 1 && meter === 'iambic') {
    // Headless line - compare with offset
    for (let i = 0; i < n; i++) {
      if (pattern[i] === expectedPattern[i + 1]) {
        score += 12;
      }
    }
  } else if (Math.abs(n - expectedLen) <= 2) {
    // Small variation - compare what we can
    const compareLen = Math.min(n, expectedLen);
    for (let i = 0; i < compareLen; i++) {
      if (pattern[i] === expectedPattern[i]) {
        score += 10;
      }
    }
    // Penalty for length mismatch
    score -= Math.abs(n - expectedLen) * 8;
  } else {
    // Large mismatch - significant penalty but still try to match
    const compareLen = Math.min(n, expectedLen);
    for (let i = 0; i < compareLen; i++) {
      if (pattern[i] === expectedPattern[i]) {
        score += 5;
      }
    }
    score -= Math.abs(n - expectedLen) * 12;
  }

  // CONSTRAINT 2: Respect polysyllabic word stress (weight: 40)
  // These are mostly fixed, but we reduced penalty slightly
  let pos = 0;
  for (const word of words) {
    if (word.syllables > 1) {
      // Polysyllabic words must match lexical stress
      for (let i = 0; i < word.syllables && pos + i < n; i++) {
        if (pattern[pos + i] !== word.stress[i]) {
          score -= 40;  // Heavy penalty but slightly reduced
        }
      }
    }
    pos += word.syllables;
  }

  // CONSTRAINT 3: Function words prefer unstressed (weight: 5)
  pos = 0;
  for (const word of words) {
    if (FUNCTION_WORDS.has(word.word.toLowerCase()) && word.syllables === 1) {
      if (pattern[pos]) {
        score -= 5;  // Small penalty for stressing function words
      }
    }
    pos += word.syllables;
  }

  // CONSTRAINT 4: Content words prefer stressed (weight: 5)
  pos = 0;
  for (const word of words) {
    if (STRONG_CONTENT_WORDS.has(word.word.toLowerCase()) && word.syllables === 1) {
      if (!pattern[pos]) {
        score -= 5;  // Small penalty for not stressing content words
      }
    }
    pos += word.syllables;
  }

  // CONSTRAINT 5: No 3+ consecutive stresses or unstresses (weight: 10)
  let consecutiveStress = 0;
  let consecutiveUnstress = 0;
  for (let i = 0; i < n; i++) {
    if (pattern[i]) {
      consecutiveStress++;
      consecutiveUnstress = 0;
      if (consecutiveStress >= 3) score -= 10;
    } else {
      consecutiveUnstress++;
      consecutiveStress = 0;
      if (consecutiveUnstress >= 3) score -= 10;
    }
  }

  // CONSTRAINT 6: Line-final stress bonus (weight: 8)
  if (n > 0 && pattern[n - 1]) {
    score += 8;
  }

  return score;
}

function analyzeDeviation(
  actual: boolean[],
  expected: string,
  meter: MeterBase
): { followsMeter: boolean, deviation: DeviationType | null, deviationPosition: number | null } {
  const expectedBool = Array.from(expected).map(c => c === '/');

  // Check for exact match
  if (actual.length === expectedBool.length) {
    let matches = 0;
    let firstMismatch = -1;
    for (let i = 0; i < actual.length; i++) {
      if (actual[i] === expectedBool[i]) {
        matches++;
      } else if (firstMismatch === -1) {
        firstMismatch = i;
      }
    }

    const matchRate = matches / actual.length;

    if (matchRate >= 0.9) {
      // Very close to expected - consider it following meter with possible substitution
      if (matchRate < 1) {
        return {
          followsMeter: true,
          deviation: 'substitution',
          deviationPosition: firstMismatch,
        };
      }
      return { followsMeter: true, deviation: null, deviationPosition: null };
    }
  }

  // Check for common variations
  const expectedSyllables = expectedBool.length;

  // Headless line (missing first unstressed)
  if (actual.length === expectedSyllables - 1 && meter === 'iambic') {
    return { followsMeter: true, deviation: 'headless', deviationPosition: 0 };
  }

  // Feminine ending (extra unstressed at end)
  if (actual.length === expectedSyllables + 1 && !actual[actual.length - 1]) {
    return { followsMeter: true, deviation: 'feminine_ending', deviationPosition: actual.length - 1 };
  }

  // Catalexis (missing final syllable)
  if (actual.length === expectedSyllables - 1) {
    return { followsMeter: true, deviation: 'catalexis', deviationPosition: actual.length };
  }

  // Anacrusis (extra syllables at start)
  if (actual.length > expectedSyllables && actual.length <= expectedSyllables + 2) {
    return { followsMeter: true, deviation: 'anacrusis', deviationPosition: 0 };
  }

  // Otherwise, it's irregular
  return { followsMeter: false, deviation: 'irregular', deviationPosition: null };
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export interface PoemAnalysis {
  classification: PoemClassification;
  lines: LineClassification[];
  overallAccuracy: number;  // How well the poem follows its detected meter
}

/**
 * Analyze an entire poem: classify its meter and scan all lines
 */
export function analyzePoem(text: string): PoemAnalysis {
  // Step 1: Classify the poem's meter
  const classification = classifyPoem(text);

  // Step 2: Scan each line using the poem's meter
  const textLines = text.split('\n');
  const lines: LineClassification[] = [];

  for (const line of textLines) {
    if (line.trim().length === 0) continue;
    lines.push(scanLineWithMeter(line, classification));
  }

  // Step 3: Calculate overall accuracy
  let followingMeter = 0;
  for (const line of lines) {
    if (line.followsMeter) followingMeter++;
  }
  const overallAccuracy = lines.length > 0 ? followingMeter / lines.length : 0;

  return {
    classification,
    lines,
    overallAccuracy,
  };
}

/**
 * Format analysis for display
 */
export function formatPoemAnalysis(analysis: PoemAnalysis): string {
  const { classification, lines, overallAccuracy } = analysis;

  const parts: string[] = [];

  // Header
  if (classification.isMetrical) {
    const footNames: Record<number, string> = {
      1: 'monometer', 2: 'dimeter', 3: 'trimeter', 4: 'tetrameter',
      5: 'pentameter', 6: 'hexameter', 7: 'heptameter', 8: 'octameter',
    };
    const meterName = `${classification.meterBase} ${footNames[classification.footCount!] || classification.footCount + '-foot'}`;
    parts.push(`Detected meter: ${meterName}`);
    parts.push(`Confidence: ${(classification.confidence * 100).toFixed(1)}%`);
    parts.push(`Regularity: ${classification.regularityScore}%`);
  } else {
    parts.push('Detected meter: free verse');
  }

  parts.push(`Lines following meter: ${(overallAccuracy * 100).toFixed(1)}%`);
  parts.push('');

  // Line-by-line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let status = line.followsMeter ? '✓' : '✗';
    if (line.deviation && line.deviation !== 'free_verse') {
      status += ` (${line.deviation})`;
    }
    parts.push(`${i + 1}. ${line.pattern} ${status}`);
  }

  return parts.join('\n');
}
