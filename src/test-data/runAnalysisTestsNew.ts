/**
 * Test runner that uses actual TypeScript analysis functions
 * Run with: npx ts-node --esm src/test-data/runAnalysisTestsNew.ts
 * Or via Vite: import and run in browser console
 */

import { detectRhymeScheme, assessRhymeQuality } from '../utils/rhymeScheme';
import { analyzeSoundPatterns } from '../utils/soundPatterns';
import { countSyllables, getSyllableCounts } from '../utils/syllableCounter';

// Test poems with expected results
const testPoems = [
  // Villanelle test - "The Hours Return"
  {
    id: 'villanelle-1',
    title: 'The Hours Return',
    content: `Do not go gentle into that good night,
Old age should burn and rave at close of day;
Rage, rage against the dying of the light.

Though wise men at their end know dark is right,
Because their words had forked no lightning they
Do not go gentle into that good night.

Good men, the last wave by, crying how bright
Their frail deeds might have danced in a green bay,
Rage, rage against the dying of the light.`,
    expectedRhymePattern: 'ABA', // Villanelle pattern
    form: 'Villanelle'
  },
  // Limerick test
  {
    id: 'limerick-1',
    title: 'The Programmer',
    content: `A programmer worked through the night,
His code was a glorious sight,
He tested and planned,
With keyboard in hand,
Till everything worked just right.`,
    expectedRhymePattern: 'AABBA',
    form: 'Limerick'
  },
  // Haiku test
  {
    id: 'haiku-1',
    title: 'Spring Morning',
    content: `Cherry blossoms fall
Soft petals on still water
Morning light breaks through`,
    expectedSyllables: [5, 7, 5],
    form: 'Haiku'
  },
  // Near-rhyme test (Rome/foam/home)
  {
    id: 'near-rhyme-1',
    title: 'Wanderer',
    content: `I wandered far from Rome,
Across the salty foam,
Until I found my home.`,
    expectedRhymePattern: 'AAA',
    form: 'Free Verse'
  }
];

export function runAnalysisTests() {
  console.log('='.repeat(80));
  console.log('POETRY ANALYSIS TEST RESULTS (Using Actual TypeScript Functions)');
  console.log('='.repeat(80));
  console.log('');

  const results = {
    rhymeScheme: { total: 0, passed: 0, failed: 0, issues: [] as string[] },
    haiku: { total: 0, passed: 0, failed: 0, issues: [] as string[] },
    soundPatterns: { avgAlliteration: 0, avgAssonance: 0, avgConsonance: 0 }
  };

  let totalSoundPatternPoems = 0;

  for (const poem of testPoems) {
    console.log(`\nTesting: ${poem.title} (${poem.form})`);
    console.log('-'.repeat(40));

    // Test rhyme scheme
    if (poem.expectedRhymePattern) {
      results.rhymeScheme.total++;
      const rhymeResult = detectRhymeScheme(poem.content);
      const detectedPattern = rhymeResult.schemePattern.join('');

      // For villanelles, check if the refrain pattern is detected
      let passed = false;
      if (poem.form === 'Villanelle') {
        // Check if lines 1 and 3 have the same rhyme label (A)
        // and line 2 has a different label (B)
        const firstThreeLabels = rhymeResult.schemePattern.slice(0, 3);
        passed = firstThreeLabels[0] === firstThreeLabels[2] &&
                 firstThreeLabels[0] !== firstThreeLabels[1];
        console.log(`  Rhyme scheme: ${detectedPattern.substring(0, 9)}...`);
        console.log(`  First tercet: ${firstThreeLabels.join('')} (expected ABA pattern)`);
      } else {
        passed = detectedPattern === poem.expectedRhymePattern;
        console.log(`  Rhyme scheme: ${detectedPattern}`);
        console.log(`  Expected: ${poem.expectedRhymePattern}`);
      }

      if (passed) {
        results.rhymeScheme.passed++;
        console.log(`  ✓ PASSED`);
      } else {
        results.rhymeScheme.failed++;
        results.rhymeScheme.issues.push(`${poem.title}: expected ${poem.expectedRhymePattern}, got ${detectedPattern}`);
        console.log(`  ✗ FAILED`);
      }
    }

    // Test haiku syllables
    if (poem.expectedSyllables) {
      results.haiku.total++;
      const syllableCounts = getSyllableCounts(poem.content);
      const nonEmptyCounts = syllableCounts.filter(c => c > 0);

      console.log(`  Syllables: ${nonEmptyCounts.join('-')}`);
      console.log(`  Expected: ${poem.expectedSyllables.join('-')}`);

      const passed = nonEmptyCounts.length === poem.expectedSyllables.length &&
                     nonEmptyCounts.every((c, i) => Math.abs(c - poem.expectedSyllables![i]) <= 1);

      if (passed) {
        results.haiku.passed++;
        console.log(`  ✓ PASSED`);
      } else {
        results.haiku.failed++;
        results.haiku.issues.push(`${poem.title}: got ${nonEmptyCounts.join('-')}, expected ${poem.expectedSyllables.join('-')}`);
        console.log(`  ✗ FAILED`);
      }
    }

    // Test sound patterns
    const soundPatterns = analyzeSoundPatterns(poem.content);
    totalSoundPatternPoems++;
    results.soundPatterns.avgAlliteration += soundPatterns.alliterations.length;
    results.soundPatterns.avgAssonance += soundPatterns.assonances.length;
    results.soundPatterns.avgConsonance += soundPatterns.consonances.length;

    console.log(`  Alliteration: ${soundPatterns.alliterations.length}`);
    console.log(`  Assonance: ${soundPatterns.assonances.length}`);
    console.log(`  Consonance: ${soundPatterns.consonances.length}`);
  }

  // Calculate averages
  if (totalSoundPatternPoems > 0) {
    results.soundPatterns.avgAlliteration /= totalSoundPatternPoems;
    results.soundPatterns.avgAssonance /= totalSoundPatternPoems;
    results.soundPatterns.avgConsonance /= totalSoundPatternPoems;
  }

  // Print summary
  console.log('\n');
  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));

  console.log('\nRhyme Scheme Detection:');
  console.log(`  Total: ${results.rhymeScheme.total}`);
  console.log(`  Passed: ${results.rhymeScheme.passed}`);
  console.log(`  Failed: ${results.rhymeScheme.failed}`);
  console.log(`  Pass Rate: ${(results.rhymeScheme.passed / results.rhymeScheme.total * 100).toFixed(1)}%`);
  if (results.rhymeScheme.issues.length > 0) {
    console.log('  Issues:');
    results.rhymeScheme.issues.forEach(issue => console.log(`    - ${issue}`));
  }

  console.log('\nHaiku Detection:');
  console.log(`  Total: ${results.haiku.total}`);
  console.log(`  Passed: ${results.haiku.passed}`);
  console.log(`  Failed: ${results.haiku.failed}`);
  console.log(`  Pass Rate: ${(results.haiku.passed / results.haiku.total * 100).toFixed(1)}%`);
  if (results.haiku.issues.length > 0) {
    console.log('  Issues:');
    results.haiku.issues.forEach(issue => console.log(`    - ${issue}`));
  }

  console.log('\nSound Patterns (averages per poem):');
  console.log(`  Alliteration: ${results.soundPatterns.avgAlliteration.toFixed(2)}`);
  console.log(`  Assonance: ${results.soundPatterns.avgAssonance.toFixed(2)}`);
  console.log(`  Consonance: ${results.soundPatterns.avgConsonance.toFixed(2)}`);

  if (results.soundPatterns.avgConsonance > 10) {
    console.log('  ⚠️  HIGH CONSONANCE - may need further filtering');
  } else {
    console.log('  ✓ Consonance levels acceptable (3+ word threshold working)');
  }

  console.log('\n');
  console.log('='.repeat(80));
  console.log('END OF TEST REPORT');
  console.log('='.repeat(80));

  return results;
}

// Test specific rhyme pairs
export function testRhymePairs() {
  console.log('\nRhyme Pair Tests:');
  console.log('-'.repeat(40));

  const pairs = [
    ['Rome', 'foam', 'should rhyme (near-rhyme)'],
    ['Rome', 'home', 'should rhyme (near-rhyme)'],
    ['night', 'light', 'should rhyme (perfect)'],
    ['night', 'right', 'should rhyme (perfect)'],
    ['day', 'they', 'should rhyme (perfect)'],
    ['sight', 'night', 'should rhyme (perfect)'],
  ];

  for (const [word1, word2, expected] of pairs) {
    const quality = assessRhymeQuality(word1, word2);
    console.log(`  ${word1} / ${word2}: ${quality} (${expected})`);
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).runAnalysisTests = runAnalysisTests;
  (window as any).testRhymePairs = testRhymePairs;
}

// Auto-run when executed directly
runAnalysisTests();
testRhymePairs();
