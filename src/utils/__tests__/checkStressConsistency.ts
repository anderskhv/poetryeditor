/**
 * Script to check for stress pattern inconsistencies between
 * CMU dictionary and scansion analyzer.
 *
 * Run with: npx tsx src/utils/__tests__/checkStressConsistency.ts
 *
 * The CMU dictionary uses: 0 = unstressed, 1 = primary stress, 2 = secondary stress
 * The scansion analyzer uses: u = unstressed, / = stressed
 */

// Scansion analyzer patterns (from STRESS_EXCEPTIONS in scansionAnalyzer.ts)
const SCANSION_PATTERNS: Record<string, string> = {
  // Personal pronouns
  'i': 'u', 'you': 'u', 'he': 'u', 'she': 'u', 'we': 'u', 'they': 'u',
  'it': 'u', 'me': 'u', 'him': 'u', 'her': 'u', 'us': 'u', 'them': 'u',
  'thee': 'u', 'thou': 'u', 'thy': 'u', 'my': 'u', 'mine': 'u',
  'your': 'u', 'his': 'u', 'our': 'u', 'their': 'u',

  // Articles and prepositions
  'a': 'u', 'an': 'u', 'the': 'u', 'to': 'u', 'of': 'u', 'in': 'u',
  'on': 'u', 'at': 'u', 'by': 'u', 'for': 'u', 'with': 'u', 'from': 'u',
  'as': 'u', 'through': 'u', 'than': 'u', 'like': 'u',

  // Conjunctions
  'and': 'u', 'but': 'u', 'or': 'u', 'nor': 'u', 'so': 'u', 'yet': 'u',
  'that': 'u', 'which': 'u', 'who': 'u', 'whom': 'u', 'whose': 'u',
  'if': 'u', 'when': 'u', 'where': 'u', 'while': 'u', 'though': 'u',
  'although': 'u/', 'because': 'u/',

  // Auxiliary verbs
  'is': 'u', 'are': 'u', 'was': 'u', 'were': 'u', 'be': 'u', 'been': 'u',
  'being': '/u', 'am': 'u', 'have': 'u', 'has': 'u', 'had': 'u',
  'do': 'u', 'does': 'u', 'did': 'u',

  // Question words when not interrogative
  'what': '/', 'how': '/', 'why': '/',

  // Negation
  'not': '/', 'no': '/', 'none': '/', 'never': '/u',

  // Modal verbs
  'shall': 'u', 'will': 'u', 'would': 'u', 'could': 'u', 'should': 'u',
  'may': 'u', 'might': 'u', 'must': 'u', 'can': 'u',

  // Content words
  'day': '/', 'night': '/', 'light': '/', 'soft': '/', 'tell': '/',
  'once': '/', 'cloud': '/', 'love': '/', 'life': '/', 'death': '/',
  'heart': '/', 'soul': '/', 'mind': '/', 'man': '/', 'world': '/', 'time': '/',

  // Two-syllable with stress on second (iambic)
  'compare': 'u/', 'upon': 'u/', 'about': 'u/', 'above': 'u/', 'across': 'u/',
  'after': '/u', 'again': 'u/', 'against': 'u/', 'along': 'u/', 'among': 'u/',
  'around': 'u/', 'away': 'u/', 'before': 'u/', 'behind': 'u/', 'below': 'u/',
  'beneath': 'u/', 'beside': 'u/', 'between': 'u/', 'beyond': 'u/',
  'over': '/u', 'under': '/u', 'into': '/u', 'onto': '/u',
  'within': 'u/', 'without': 'u/',
  'ever': '/u', 'always': '/u', 'only': '/u', 'also': '/u', 'even': '/u',
  'often': '/u', 'seldom': '/u',
  'begin': 'u/', 'become': 'u/', 'believe': 'u/', 'belong': 'u/',
  'return': 'u/', 'remain': 'u/', 'repeat': 'u/', 'receive': 'u/',
  'remove': 'u/', 'reply': 'u/', 'report': 'u/', 'request': 'u/', 'require': 'u/',
  'silent': '/u', 'silence': '/u', 'moment': '/u', 'morning': '/u', 'evening': '/u',
  'water': '/u', 'father': '/u', 'mother': '/u', 'brother': '/u', 'sister': '/u',
  'daughter': '/u', 'beauty': '/u', 'nature': '/u', 'garden': '/u', 'window': '/u',
  'shadow': '/u', 'yellow': '/u', 'follow': '/u', 'sorrow': '/u', 'borrow': '/u',
  'morrow': '/u', 'narrow': '/u',

  // Three-syllable words
  'beautiful': '/uu', 'wonderful': '/uu', 'terrible': '/uu', 'horrible': '/uu',
  'miserable': '/uuu',
  'remember': 'u/u', 'forgotten': 'u/u', 'together': 'u/u', 'forever': 'u/u',
  'however': 'u/u', 'whatever': 'u/u', 'whenever': 'u/u', 'wherever': 'u/u',
  'imagine': 'u/u', 'important': 'u/u', 'tomorrow': 'u/u', 'already': 'u/u',
  'another': 'u/u', 'continue': 'u/u',
  'suddenly': '/uu', 'quietly': '/uu',
  'slowly': '/u', 'quickly': '/u', 'gently': '/u', 'softly': '/u',
  'darkly': '/u', 'brightly': '/u', 'lightly': '/u',
};

// CMU dictionary stress patterns (standard linguistic data)
// 0 = unstressed, 1 = primary stress, 2 = secondary stress
const CMU_PATTERNS: Record<string, number[]> = {
  // Single syllable words - all have stress
  'i': [1], 'you': [1], 'he': [1], 'she': [1], 'we': [1], 'they': [1],
  'it': [1], 'me': [1], 'him': [1], 'her': [1], 'us': [1], 'them': [1],
  'thee': [1], 'thou': [1], 'thy': [1], 'my': [1], 'mine': [1],
  'your': [1], 'his': [1], 'our': [1], 'their': [1],
  'a': [0], 'an': [0], 'the': [0], 'to': [1], 'of': [1], 'in': [1],
  'on': [1], 'at': [1], 'by': [1], 'for': [1], 'with': [1], 'from': [1],
  'as': [1], 'through': [1], 'than': [1], 'like': [1],
  'and': [1], 'but': [1], 'or': [1], 'nor': [1], 'so': [1], 'yet': [1],
  'that': [1], 'which': [1], 'who': [1], 'whom': [1], 'whose': [1],
  'if': [1], 'when': [1], 'where': [1], 'while': [1], 'though': [1],
  'is': [1], 'are': [1], 'was': [1], 'were': [1], 'be': [1], 'been': [1],
  'am': [1], 'have': [1], 'has': [1], 'had': [1],
  'do': [1], 'does': [1], 'did': [1],
  'what': [1], 'how': [1], 'why': [1],
  'not': [1], 'no': [1], 'none': [1],
  'shall': [1], 'will': [1], 'would': [1], 'could': [1], 'should': [1],
  'may': [1], 'might': [1], 'must': [1], 'can': [1],
  'day': [1], 'night': [1], 'light': [1], 'soft': [1], 'tell': [1],
  'once': [1], 'cloud': [1], 'love': [1], 'life': [1], 'death': [1],
  'heart': [1], 'soul': [1], 'mind': [1], 'man': [1], 'world': [1], 'time': [1],

  // Two-syllable words
  'although': [2, 1], 'because': [0, 1],
  'being': [1, 0],
  'never': [1, 0],
  'compare': [0, 1], 'upon': [0, 1], 'about': [0, 1], 'above': [0, 1], 'across': [0, 1],
  'after': [1, 0], 'again': [0, 1], 'against': [0, 1], 'along': [0, 1], 'among': [0, 1],
  'around': [0, 1], 'away': [0, 1], 'before': [0, 1], 'behind': [0, 1], 'below': [0, 1],
  'beneath': [0, 1], 'beside': [0, 1], 'between': [0, 1], 'beyond': [0, 1],
  'over': [1, 0], 'under': [1, 0], 'into': [1, 0], 'onto': [1, 0],
  'within': [0, 1], 'without': [0, 1],
  'ever': [1, 0], 'always': [1, 0], 'only': [1, 0], 'also': [1, 0], 'even': [1, 0],
  'often': [1, 0], 'seldom': [1, 0],
  'begin': [0, 1], 'become': [0, 1], 'believe': [0, 1], 'belong': [0, 1],
  'return': [0, 1], 'remain': [0, 1], 'repeat': [0, 1], 'receive': [0, 1],
  'remove': [0, 1], 'reply': [0, 1], 'report': [0, 1], 'request': [0, 1], 'require': [0, 1],
  'silent': [1, 0], 'silence': [1, 0], 'moment': [1, 0], 'morning': [1, 0], 'evening': [1, 0],
  'water': [1, 0], 'father': [1, 0], 'mother': [1, 0], 'brother': [1, 0], 'sister': [1, 0],
  'daughter': [1, 0], 'beauty': [1, 0], 'nature': [1, 0], 'garden': [1, 0], 'window': [1, 0],
  'shadow': [1, 0], 'yellow': [1, 0], 'follow': [1, 0], 'sorrow': [1, 0], 'borrow': [1, 0],
  'morrow': [1, 0], 'narrow': [1, 0],
  'slowly': [1, 0], 'quickly': [1, 0], 'gently': [1, 0], 'softly': [1, 0],
  'darkly': [1, 0], 'brightly': [1, 0], 'lightly': [1, 0],

  // Three-syllable words
  'beautiful': [1, 0, 0], 'wonderful': [1, 0, 0], 'terrible': [1, 0, 0], 'horrible': [1, 0, 0],
  'remember': [0, 1, 0], 'forgotten': [0, 1, 0], 'together': [0, 1, 0], 'forever': [0, 1, 0],
  'however': [2, 1, 0], 'whatever': [0, 1, 0], 'whenever': [0, 1, 0], 'wherever': [0, 1, 0],
  'imagine': [0, 1, 0], 'important': [0, 1, 0], 'tomorrow': [0, 1, 0], 'already': [2, 1, 0],
  'another': [0, 1, 0], 'continue': [0, 1, 0],
  'suddenly': [1, 0, 0], 'quietly': [1, 0, 0],

  // Four-syllable words
  'miserable': [1, 0, 0, 0],
};

interface Inconsistency {
  word: string;
  cmuPattern: number[];
  scansionPattern: string;
  cmuAsScansion: string;
  reason: string;
}

function cmuToScansion(cmuPattern: number[]): string {
  return cmuPattern.map(s => s > 0 ? '/' : 'u').join('');
}

function checkConsistency(): void {
  const inconsistencies: Inconsistency[] = [];
  const intentionalDifferences: Inconsistency[] = [];

  console.log('='.repeat(70));
  console.log('STRESS PATTERN CONSISTENCY CHECK');
  console.log('CMU Dictionary vs Scansion Analyzer');
  console.log('='.repeat(70));
  console.log();

  for (const word of Object.keys(SCANSION_PATTERNS)) {
    const scansionPattern = SCANSION_PATTERNS[word];
    const cmuPattern = CMU_PATTERNS[word];

    if (!cmuPattern) {
      continue; // Skip words not in our CMU data
    }

    const cmuAsScansion = cmuToScansion(cmuPattern);

    // Check syllable count
    if (cmuPattern.length !== scansionPattern.length) {
      inconsistencies.push({
        word,
        cmuPattern,
        scansionPattern,
        cmuAsScansion,
        reason: `Syllable count mismatch: CMU=${cmuPattern.length}, Scansion=${scansionPattern.length}`,
      });
      continue;
    }

    // Check stress positions
    let hasStressDifference = false;
    for (let i = 0; i < cmuPattern.length; i++) {
      const cmuStressed = cmuPattern[i] > 0;
      const scansionStressed = scansionPattern[i] === '/';
      if (cmuStressed !== scansionStressed) {
        hasStressDifference = true;
        break;
      }
    }

    if (hasStressDifference) {
      // Determine if this is intentional (function words treated as unstressed in poetry)
      const isFunctionWord = ['i', 'you', 'he', 'she', 'we', 'they', 'it', 'me', 'him', 'her',
        'us', 'them', 'thee', 'thou', 'thy', 'my', 'mine', 'your', 'his', 'our', 'their',
        'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'from', 'as', 'through', 'than',
        'and', 'but', 'or', 'nor', 'so', 'yet', 'that', 'which', 'who', 'whom', 'whose',
        'if', 'when', 'where', 'while', 'though', 'is', 'are', 'was', 'were', 'be', 'been',
        'am', 'have', 'has', 'had', 'do', 'does', 'did', 'shall', 'will', 'would', 'could',
        'should', 'may', 'might', 'must', 'can', 'like'].includes(word);

      if (isFunctionWord && cmuPattern.length === 1 && scansionPattern === 'u') {
        intentionalDifferences.push({
          word,
          cmuPattern,
          scansionPattern,
          cmuAsScansion,
          reason: 'Function word - intentionally unstressed in metrical poetry',
        });
      } else {
        inconsistencies.push({
          word,
          cmuPattern,
          scansionPattern,
          cmuAsScansion,
          reason: `Stress mismatch: CMU="${cmuAsScansion}", Scansion="${scansionPattern}"`,
        });
      }
    }
  }

  // Report results
  if (inconsistencies.length > 0) {
    console.log('INCONSISTENCIES FOUND (potential bugs):');
    console.log('-'.repeat(70));
    for (const inc of inconsistencies) {
      console.log(`  "${inc.word}"`);
      console.log(`    CMU:      [${inc.cmuPattern.join(',')}] -> "${inc.cmuAsScansion}"`);
      console.log(`    Scansion: "${inc.scansionPattern}"`);
      console.log(`    Issue:    ${inc.reason}`);
      console.log();
    }
  } else {
    console.log('No inconsistencies found (excluding intentional differences).');
    console.log();
  }

  if (intentionalDifferences.length > 0) {
    console.log();
    console.log('INTENTIONAL DIFFERENCES (function words):');
    console.log('-'.repeat(70));
    console.log('These words are single-syllable but treated as unstressed in poetry:');
    const funcWords = intentionalDifferences.map(d => d.word).sort();
    console.log(`  ${funcWords.join(', ')}`);
    console.log();
    console.log('This is by design: in metrical poetry, function words like pronouns,');
    console.log('prepositions, and auxiliary verbs typically receive less stress.');
  }

  console.log();
  console.log('='.repeat(70));
  console.log(`Summary: ${inconsistencies.length} potential issues, ${intentionalDifferences.length} intentional differences`);
  console.log('='.repeat(70));
}

// Run the check
checkConsistency();
