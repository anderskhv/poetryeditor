/**
 * Test suite for Phrase Cliche Detection
 *
 * Tests detection accuracy with various poems - both cliche-heavy and original
 */

import { detectCliches, analyzeCliches } from './phraseClicheDetector';

// Test poems with known cliches
const CLICHE_HEAVY_POEM = `
Love at First Sight

My heart skipped a beat when I saw you there,
Love at first sight, beyond compare.
Like a moth to a flame, I was drawn to your light,
Through the darkest hour and dead of night.

Time stood still as our eyes did meet,
My heart of gold began to beat.
Against all odds, we found our way,
Seize the day, that's what they say.

Now I'm walking on air, over the moon,
Our love a perfect tune.
Forever and ever, written in the stars,
No matter how near or how far.

In the nick of time, you came to me,
Set my caged bird spirit free.
With blood, sweat, and tears we'll fight,
Our eternal flame burning bright.
`;

const MODERATELY_CLICHE_POEM = `
Autumn Walk

The leaves are falling, red and gold,
A story that has long been told.
I walk beneath the autumn trees,
And feel the gentle, cooling breeze.

The sun sets low upon the hill,
As evening shadows grow more still.
I think of you across the miles,
Remembering your warming smiles.

Time moves on, as seasons change,
Through familiar and through strange.
Yet in my heart, you still remain,
Through joy and through the gentle rain.
`;

const ORIGINAL_POEM = `
Cartography of Scars

The surgeon's blade traced longitude
across terrain of pale geography—
each suture a meridian marking
where the body's continents shifted.

I learned to read these raised white lines
like Braille beneath my fingertips,
a tactile memoir written
in the dermis's private alphabet.

Healing is not erasure
but accumulation: the skin remembers
every incision, every violation,
catalogs each wound in tissue and time.

Now I stand before the mirror,
mapping this atlas of survival,
each scar a coordinate proving
I was here, I am here, I remain.
`;

const EDGE_CASE_POEM = `
The Rose

I saw a rose, blood red and bright,
Beneath the pale moon's silver light.
Its petals fell like silent tears,
Counting out the passing years.

But this was no crimson rose of love,
Nor symbol sent from realms above.
Just a flower, nothing more,
Growing by my kitchen door.
`;

interface TestResult {
  poemName: string;
  clichesFound: number;
  strongCount: number;
  moderateCount: number;
  mildCount: number;
  originalityScore: number;
  expectedRange: { min: number; max: number };
  passed: boolean;
  detailedResults: string[];
}

function runTest(poemName: string, text: string, expectedMin: number, expectedMax: number): TestResult {
  const analysis = analyzeCliches(text);
  const passed = analysis.totalClichesFound >= expectedMin && analysis.totalClichesFound <= expectedMax;

  const detailedResults: string[] = [];

  if (analysis.strongCliches.length > 0) {
    detailedResults.push('Strong cliches:');
    analysis.strongCliches.forEach(c => {
      detailedResults.push(`  - "${c.phrase}" (${c.category}, line ${c.lineNumber}, conf: ${(c.confidence * 100).toFixed(0)}%)`);
    });
  }

  if (analysis.moderateCliches.length > 0) {
    detailedResults.push('Moderate cliches:');
    analysis.moderateCliches.forEach(c => {
      detailedResults.push(`  - "${c.phrase}" (${c.category}, line ${c.lineNumber}, conf: ${(c.confidence * 100).toFixed(0)}%)`);
    });
  }

  if (analysis.mildCliches.length > 0) {
    detailedResults.push('Mild cliches:');
    analysis.mildCliches.forEach(c => {
      detailedResults.push(`  - "${c.phrase}" (${c.category}, line ${c.lineNumber}, conf: ${(c.confidence * 100).toFixed(0)}%)`);
    });
  }

  return {
    poemName,
    clichesFound: analysis.totalClichesFound,
    strongCount: analysis.strongCliches.length,
    moderateCount: analysis.moderateCliches.length,
    mildCount: analysis.mildCliches.length,
    originalityScore: analysis.overallScore,
    expectedRange: { min: expectedMin, max: expectedMax },
    passed,
    detailedResults
  };
}

export function runClicheDetectionTests(): void {
  console.log('='.repeat(60));
  console.log('CLICHE DETECTION TEST SUITE');
  console.log('='.repeat(60));
  console.log('');

  const results: TestResult[] = [
    // Heavy cliche poem should find many (10-20+)
    runTest('Cliche-Heavy Poem', CLICHE_HEAVY_POEM, 10, 30),

    // Moderately cliche poem should find some (3-8)
    runTest('Moderately Cliche Poem', MODERATELY_CLICHE_POEM, 2, 10),

    // Original poem should find very few (0-2)
    runTest('Original Poem', ORIGINAL_POEM, 0, 3),

    // Edge case - has "rose" phrases but used non-cliche
    runTest('Edge Case Poem', EDGE_CASE_POEM, 1, 6),
  ];

  let passedCount = 0;

  for (const result of results) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📝 ${result.poemName}`);
    console.log(`${'─'.repeat(50)}`);
    console.log(`Cliches found: ${result.clichesFound} (expected ${result.expectedRange.min}-${result.expectedRange.max})`);
    console.log(`  Strong: ${result.strongCount}`);
    console.log(`  Moderate: ${result.moderateCount}`);
    console.log(`  Mild: ${result.mildCount}`);
    console.log(`Originality score: ${result.originalityScore}%`);
    console.log(`Result: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);

    if (result.detailedResults.length > 0) {
      console.log('\nDetailed findings:');
      result.detailedResults.forEach(line => console.log(line));
    }

    if (result.passed) passedCount++;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`SUMMARY: ${passedCount}/${results.length} tests passed`);
  console.log(`${'='.repeat(60)}`);
}

// Test specific phrase detection
export function testSpecificPhrases(): void {
  console.log('\n');
  console.log('='.repeat(60));
  console.log('SPECIFIC PHRASE DETECTION TESTS');
  console.log('='.repeat(60));

  const testCases = [
    { text: 'My heart skipped a beat', expected: 1, phrase: 'heart skipped a beat' },
    { text: 'Love at first sight is magical', expected: 1, phrase: 'love at first sight' },
    { text: 'We walked on air together', expected: 1, phrase: 'walking on air' },
    { text: 'Time stood still that day', expected: 1, phrase: 'time stood still' },
    { text: 'She has a heart of gold', expected: 1, phrase: 'heart of gold' },
    { text: 'The sun rose over the hill', expected: 0, phrase: 'none' }, // Not a cliche
    { text: 'She carefully opened the door', expected: 0, phrase: 'none' }, // Not a cliche
    { text: 'My broken heart still aches', expected: 1, phrase: 'broken heart' },
    { text: 'Tears of joy streamed down', expected: 1, phrase: 'tears of joy' },
    { text: 'Against all odds we won', expected: 1, phrase: 'against all odds' },
  ];

  let passed = 0;
  for (const tc of testCases) {
    const detected = detectCliches(tc.text);
    const success = detected.length === tc.expected;
    console.log(`${success ? '✅' : '❌'} "${tc.text}"`);
    console.log(`   Expected: ${tc.expected} cliche(s), Found: ${detected.length}`);
    if (detected.length > 0) {
      detected.forEach(d => console.log(`   → Detected: "${d.matchedCliche}" (${d.category})`));
    }
    if (success) passed++;
  }

  console.log(`\nPassed: ${passed}/${testCases.length}`);
}

// Auto-run when executed
if (typeof window !== 'undefined') {
  (window as any).runClicheDetectionTests = runClicheDetectionTests;
  (window as any).testSpecificPhrases = testSpecificPhrases;
}

// Run tests
console.log('Running cliche detection tests...\n');
runClicheDetectionTests();
testSpecificPhrases();
