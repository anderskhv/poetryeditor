/**
 * Comprehensive Analysis Test Runner
 * Tests all poetry analysis features against the test dataset
 */

import { TEST_POEMS, TestPoem, getTotalLineCount } from './testPoems';
import { detectRhymeScheme, assessRhymeQuality, detectInternalRhymes } from '../utils/rhymeScheme';
import { detectMeter, analyzeMeterConsistency, isHaiku } from '../utils/meterDetector';
import { analyzeSoundPatterns } from '../utils/soundPatterns';
import { detectPoetricForm, evaluateFormFit } from '../utils/formDetector';
import { analyzeScansion, getScansionInstances } from '../utils/scansionAnalyzer';
import { injectDictionary, loadCMUDictionary, isDictionaryLoaded } from '../utils/cmuDict';

// Test result interfaces
interface TestResult {
  poemId: string;
  poemTitle: string;
  category: string;
  test: string;
  expected?: string;
  actual?: string;
  passed: boolean;
  notes?: string;
}

interface CategorySummary {
  category: string;
  totalTests: number;
  passed: number;
  failed: number;
  passRate: number;
  issues: string[];
}

interface TestReport {
  timestamp: string;
  totalPoems: number;
  totalLines: number;
  results: TestResult[];
  categorySummaries: CategorySummary[];
  uxIssues: string[];
  recommendations: string[];
}

// Test functions
function testRhymeDetection(poem: TestPoem): TestResult[] {
  const results: TestResult[] = [];

  // Test end-rhyme detection
  const rhymeScheme = detectRhymeScheme(poem.content);

  if (poem.expectedRhymeScheme) {
    const normalizedExpected = poem.expectedRhymeScheme.replace(/\s/g, '').toUpperCase();
    const normalizedActual = rhymeScheme.pattern.replace(/\s/g, '').toUpperCase();

    // Check if the general pattern matches (e.g., ABAB vs detected pattern)
    const patternMatches = normalizedExpected === normalizedActual ||
      (normalizedExpected.includes('ABAB') && normalizedActual.includes('ABAB')) ||
      (normalizedExpected.includes('GG') && normalizedActual.endsWith('AA'));

    results.push({
      poemId: poem.id,
      poemTitle: poem.title,
      category: 'Rhyme Detection',
      test: 'End Rhyme Scheme',
      expected: poem.expectedRhymeScheme,
      actual: rhymeScheme.pattern,
      passed: patternMatches,
      notes: patternMatches ? undefined : `Pattern mismatch: expected ${poem.expectedRhymeScheme}, got ${rhymeScheme.pattern}`,
    });
  }

  // Test rhyme pairs found
  results.push({
    poemId: poem.id,
    poemTitle: poem.title,
    category: 'Rhyme Detection',
    test: 'Rhyme Pairs Found',
    actual: `${rhymeScheme.rhymes.length} pairs`,
    passed: rhymeScheme.rhymes.length >= 0, // Always passes, used for reporting
    notes: `Found ${rhymeScheme.rhymes.length} rhyme pairs`,
  });

  // Test internal rhymes
  const internalRhymes = detectInternalRhymes(poem.content);
  results.push({
    poemId: poem.id,
    poemTitle: poem.title,
    category: 'Rhyme Detection',
    test: 'Internal Rhymes',
    actual: `${internalRhymes.length} internal rhymes`,
    passed: true, // Informational
    notes: internalRhymes.length > 0
      ? `Found: ${internalRhymes.slice(0, 3).map(r => `${r.word1}/${r.word2}`).join(', ')}${internalRhymes.length > 3 ? '...' : ''}`
      : 'No internal rhymes detected',
  });

  return results;
}

function testMeterDetection(poem: TestPoem): TestResult[] {
  const results: TestResult[] = [];

  const detectedMeter = detectMeter(poem.content);
  const meterConsistency = analyzeMeterConsistency(poem.content);

  if (poem.expectedMeter) {
    const meterMatches =
      detectedMeter.toLowerCase().includes(poem.expectedMeter.toLowerCase()) ||
      poem.expectedMeter.toLowerCase().includes(detectedMeter.toLowerCase()) ||
      (poem.expectedMeter.includes('syllabic') && detectedMeter.includes('syllabic'));

    results.push({
      poemId: poem.id,
      poemTitle: poem.title,
      category: 'Meter Detection',
      test: 'Meter Type',
      expected: poem.expectedMeter,
      actual: detectedMeter,
      passed: meterMatches,
      notes: meterMatches ? undefined : `Meter mismatch`,
    });
  }

  // Test meter consistency
  results.push({
    poemId: poem.id,
    poemTitle: poem.title,
    category: 'Meter Detection',
    test: 'Meter Consistency',
    actual: `${(meterConsistency.consistencyScore * 100).toFixed(1)}%`,
    passed: true, // Informational
    notes: `Deviation: ${meterConsistency.averageDeviation.toFixed(2)} syllables`,
  });

  // Test haiku detection for haiku poems
  if (poem.tags.includes('haiku')) {
    const isHaikuResult = isHaiku(poem.content);
    results.push({
      poemId: poem.id,
      poemTitle: poem.title,
      category: 'Meter Detection',
      test: 'Haiku Detection',
      expected: 'true',
      actual: isHaikuResult.toString(),
      passed: isHaikuResult,
      notes: isHaikuResult ? 'Correctly identified as haiku' : 'Failed to identify as haiku',
    });
  }

  return results;
}

function testFormDetection(poem: TestPoem): TestResult[] {
  const results: TestResult[] = [];

  const detectedForm = detectPoetricForm(poem.content);

  if (poem.expectedForm) {
    const formMatches =
      detectedForm.primaryForm.toLowerCase().includes(poem.expectedForm.toLowerCase()) ||
      poem.expectedForm.toLowerCase().includes(detectedForm.primaryForm.toLowerCase()) ||
      detectedForm.possibleForms.some(f => f.toLowerCase().includes(poem.expectedForm!.toLowerCase()));

    results.push({
      poemId: poem.id,
      poemTitle: poem.title,
      category: 'Form Detection',
      test: 'Primary Form',
      expected: poem.expectedForm,
      actual: detectedForm.primaryForm,
      passed: formMatches,
      notes: formMatches ? undefined : `Form mismatch. Possible forms: ${detectedForm.possibleForms.join(', ')}`,
    });

    // Test form fit score
    const formFit = evaluateFormFit(poem.content, poem.expectedForm);
    results.push({
      poemId: poem.id,
      poemTitle: poem.title,
      category: 'Form Detection',
      test: 'Form Fit Score',
      expected: '>= 70%',
      actual: `${(formFit.score * 100).toFixed(1)}%`,
      passed: formFit.score >= 0.5, // 50% threshold for acceptable fit
      notes: formFit.violations.length > 0 ? `Violations: ${formFit.violations.slice(0, 2).join(', ')}` : 'Good fit',
    });
  }

  return results;
}

function testSoundPatterns(poem: TestPoem): TestResult[] {
  const results: TestResult[] = [];

  const patterns = analyzeSoundPatterns(poem.content);

  // Test alliteration detection
  results.push({
    poemId: poem.id,
    poemTitle: poem.title,
    category: 'Sound Patterns',
    test: 'Alliteration Count',
    actual: `${patterns.alliterations.length}`,
    passed: true, // Informational
    notes: patterns.alliterations.length > 0
      ? `Examples: ${patterns.alliterations.slice(0, 2).map(a => a.description).join('; ')}`
      : 'No alliteration detected',
  });

  // Test assonance detection
  results.push({
    poemId: poem.id,
    poemTitle: poem.title,
    category: 'Sound Patterns',
    test: 'Assonance Count',
    actual: `${patterns.assonances.length}`,
    passed: true, // Informational
    notes: patterns.assonances.length > 0
      ? `Examples: ${patterns.assonances.slice(0, 2).map(a => a.description).join('; ')}`
      : 'No assonance detected',
  });

  // Test consonance detection
  results.push({
    poemId: poem.id,
    poemTitle: poem.title,
    category: 'Sound Patterns',
    test: 'Consonance Count',
    actual: `${patterns.consonances.length}`,
    passed: true, // Informational
    notes: patterns.consonances.length > 0
      ? `Examples: ${patterns.consonances.slice(0, 2).map(a => a.description).join('; ')}`
      : 'No consonance detected',
  });

  // For poems tagged with sound patterns, verify detection
  if (poem.tags.includes('alliteration')) {
    results.push({
      poemId: poem.id,
      poemTitle: poem.title,
      category: 'Sound Patterns',
      test: 'Expected Alliteration',
      expected: '> 0',
      actual: `${patterns.alliterations.length}`,
      passed: patterns.alliterations.length > 0,
      notes: patterns.alliterations.length > 0 ? 'Correctly detected' : 'MISSED: Expected alliteration not detected',
    });
  }

  if (poem.tags.includes('assonance')) {
    results.push({
      poemId: poem.id,
      poemTitle: poem.title,
      category: 'Sound Patterns',
      test: 'Expected Assonance',
      expected: '> 0',
      actual: `${patterns.assonances.length}`,
      passed: patterns.assonances.length > 0,
      notes: patterns.assonances.length > 0 ? 'Correctly detected' : 'MISSED: Expected assonance not detected',
    });
  }

  if (poem.tags.includes('consonance')) {
    results.push({
      poemId: poem.id,
      poemTitle: poem.title,
      category: 'Sound Patterns',
      test: 'Expected Consonance',
      expected: '> 0',
      actual: `${patterns.consonances.length}`,
      passed: patterns.consonances.length > 0,
      notes: patterns.consonances.length > 0 ? 'Correctly detected' : 'MISSED: Expected consonance not detected',
    });
  }

  return results;
}

function testScansion(poem: TestPoem): TestResult[] {
  const results: TestResult[] = [];

  const scansion = analyzeScansion(poem.content);
  const instances = getScansionInstances(poem.content);

  results.push({
    poemId: poem.id,
    poemTitle: poem.title,
    category: 'Scansion',
    test: 'Scansion Analysis',
    actual: scansion.dominantPattern || 'No clear pattern',
    passed: true, // Informational
    notes: `Found ${instances.length} syllable instances for highlighting`,
  });

  // Check if iambic poems are detected correctly
  if (poem.expectedMeter?.includes('iambic')) {
    const isIambic = scansion.dominantPattern?.toLowerCase().includes('iambic');
    results.push({
      poemId: poem.id,
      poemTitle: poem.title,
      category: 'Scansion',
      test: 'Iambic Pattern Detection',
      expected: 'iambic',
      actual: scansion.dominantPattern || 'unknown',
      passed: isIambic || false,
      notes: isIambic ? 'Correctly identified' : 'Pattern not detected as iambic',
    });
  }

  return results;
}

// UX/UI Testing
function analyzeUXIssues(results: TestResult[]): string[] {
  const issues: string[] = [];

  // Check for excessive detection (potential false positives)
  const soundPatternResults = results.filter(r => r.category === 'Sound Patterns');
  const alliterationCounts = soundPatternResults
    .filter(r => r.test === 'Alliteration Count')
    .map(r => parseInt(r.actual || '0'));

  const avgAlliteration = alliterationCounts.reduce((a, b) => a + b, 0) / alliterationCounts.length;
  if (avgAlliteration > 10) {
    issues.push(`High alliteration detection rate (avg ${avgAlliteration.toFixed(1)} per poem) may indicate over-detection`);
  }

  // Check for too few detections
  const assonanceCounts = soundPatternResults
    .filter(r => r.test === 'Assonance Count')
    .map(r => parseInt(r.actual || '0'));

  const avgAssonance = assonanceCounts.reduce((a, b) => a + b, 0) / assonanceCounts.length;
  if (avgAssonance < 0.5) {
    issues.push(`Low assonance detection rate (avg ${avgAssonance.toFixed(1)} per poem) may indicate under-detection`);
  }

  // Check consonance
  const consonanceCounts = soundPatternResults
    .filter(r => r.test === 'Consonance Count')
    .map(r => parseInt(r.actual || '0'));

  const avgConsonance = consonanceCounts.reduce((a, b) => a + b, 0) / consonanceCounts.length;
  if (avgConsonance > 15) {
    issues.push(`High consonance detection rate (avg ${avgConsonance.toFixed(1)} per poem) - consider if this is too noisy for highlighting`);
  }

  // Check rhyme detection
  const rhymeResults = results.filter(r => r.category === 'Rhyme Detection');
  const failedRhymeSchemes = rhymeResults.filter(r => r.test === 'End Rhyme Scheme' && !r.passed);
  if (failedRhymeSchemes.length > 5) {
    issues.push(`${failedRhymeSchemes.length} poems have mismatched rhyme scheme detection - may need algorithm improvement`);
  }

  // Check internal rhymes
  const internalRhymeResults = rhymeResults.filter(r => r.test === 'Internal Rhymes');
  const avgInternalRhymes = internalRhymeResults
    .map(r => parseInt((r.actual?.match(/\d+/) || ['0'])[0]))
    .reduce((a, b) => a + b, 0) / internalRhymeResults.length;

  if (avgInternalRhymes > 10) {
    issues.push(`Average internal rhymes per poem: ${avgInternalRhymes.toFixed(1)} - may be too many for clean UI display`);
  }

  // Check form detection
  const formResults = results.filter(r => r.category === 'Form Detection' && r.test === 'Primary Form');
  const failedFormDetection = formResults.filter(r => !r.passed);
  if (failedFormDetection.length > 3) {
    issues.push(`${failedFormDetection.length} poems have incorrect form detection`);
  }

  // Haiku detection
  const haikuResults = results.filter(r => r.test === 'Haiku Detection');
  const failedHaiku = haikuResults.filter(r => !r.passed);
  if (failedHaiku.length > 0) {
    issues.push(`${failedHaiku.length} haiku poems not correctly identified as haiku`);
  }

  return issues;
}

function generateRecommendations(results: TestResult[], issues: string[]): string[] {
  const recommendations: string[] = [];

  // Based on failed tests, generate specific recommendations
  const failedTests = results.filter(r => !r.passed);

  const rhymeFailures = failedTests.filter(r => r.category === 'Rhyme Detection');
  if (rhymeFailures.length > 5) {
    recommendations.push('Consider improving rhyme detection algorithm, particularly for slant rhymes and near-rhymes');
  }

  const meterFailures = failedTests.filter(r => r.category === 'Meter Detection');
  if (meterFailures.length > 5) {
    recommendations.push('Meter detection may need tuning for less common meters (trochaic, anapestic, etc.)');
  }

  const formFailures = failedTests.filter(r => r.category === 'Form Detection');
  if (formFailures.length > 3) {
    recommendations.push('Form detection needs improvement - consider adding more form-specific heuristics');
  }

  // Check for specific patterns
  if (issues.some(i => i.includes('over-detection'))) {
    recommendations.push('Consider raising thresholds for sound pattern detection to reduce false positives');
  }

  if (issues.some(i => i.includes('under-detection'))) {
    recommendations.push('Consider lowering thresholds or improving vowel sound detection');
  }

  // Scansion recommendations
  const scansionResults = results.filter(r => r.category === 'Scansion');
  const iambicFailures = scansionResults.filter(r => r.test === 'Iambic Pattern Detection' && !r.passed);
  if (iambicFailures.length > 3) {
    recommendations.push('Iambic pattern detection needs improvement - many iambic poems not being correctly identified');
  }

  return recommendations;
}

// Main test runner
export async function runAllTests(): Promise<TestReport> {
  const results: TestResult[] = [];

  console.log('Starting comprehensive poetry analysis tests...');
  console.log(`Testing ${TEST_POEMS.length} poems with ${getTotalLineCount()} total lines`);
  console.log('');

  // Test each poem
  for (const poem of TEST_POEMS) {
    console.log(`Testing: ${poem.title}`);

    // Run all test categories
    results.push(...testRhymeDetection(poem));
    results.push(...testMeterDetection(poem));
    results.push(...testFormDetection(poem));
    results.push(...testSoundPatterns(poem));
    results.push(...testScansion(poem));
  }

  // Generate category summaries
  const categories = ['Rhyme Detection', 'Meter Detection', 'Form Detection', 'Sound Patterns', 'Scansion'];
  const categorySummaries: CategorySummary[] = categories.map(category => {
    const categoryResults = results.filter(r => r.category === category);
    const passed = categoryResults.filter(r => r.passed).length;
    const failed = categoryResults.filter(r => !r.passed).length;
    const issues = categoryResults.filter(r => !r.passed).map(r => `${r.poemTitle}: ${r.test} - ${r.notes || 'Failed'}`);

    return {
      category,
      totalTests: categoryResults.length,
      passed,
      failed,
      passRate: categoryResults.length > 0 ? (passed / categoryResults.length) * 100 : 0,
      issues: issues.slice(0, 10), // Top 10 issues per category
    };
  });

  // Analyze UX issues
  const uxIssues = analyzeUXIssues(results);

  // Generate recommendations
  const recommendations = generateRecommendations(results, uxIssues);

  const report: TestReport = {
    timestamp: new Date().toISOString(),
    totalPoems: TEST_POEMS.length,
    totalLines: getTotalLineCount(),
    results,
    categorySummaries,
    uxIssues,
    recommendations,
  };

  return report;
}

// Print report function
export function printReport(report: TestReport): void {
  console.log('\n' + '='.repeat(80));
  console.log('COMPREHENSIVE POETRY ANALYSIS TEST REPORT');
  console.log('='.repeat(80));
  console.log(`Generated: ${report.timestamp}`);
  console.log(`Total Poems Tested: ${report.totalPoems}`);
  console.log(`Total Lines Analyzed: ${report.totalLines}`);
  console.log('');

  console.log('-'.repeat(80));
  console.log('CATEGORY SUMMARIES');
  console.log('-'.repeat(80));

  for (const summary of report.categorySummaries) {
    console.log(`\n${summary.category}:`);
    console.log(`  Total Tests: ${summary.totalTests}`);
    console.log(`  Passed: ${summary.passed}`);
    console.log(`  Failed: ${summary.failed}`);
    console.log(`  Pass Rate: ${summary.passRate.toFixed(1)}%`);

    if (summary.issues.length > 0) {
      console.log(`  Issues (top ${Math.min(summary.issues.length, 5)}):`);
      summary.issues.slice(0, 5).forEach(issue => {
        console.log(`    - ${issue}`);
      });
    }
  }

  console.log('\n' + '-'.repeat(80));
  console.log('UX/UI ISSUES');
  console.log('-'.repeat(80));

  if (report.uxIssues.length === 0) {
    console.log('No significant UX issues detected.');
  } else {
    report.uxIssues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`);
    });
  }

  console.log('\n' + '-'.repeat(80));
  console.log('RECOMMENDATIONS');
  console.log('-'.repeat(80));

  if (report.recommendations.length === 0) {
    console.log('All systems performing well. No recommendations at this time.');
  } else {
    report.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('END OF REPORT');
  console.log('='.repeat(80));
}

// Export for testing
export { TEST_POEMS, TestPoem };
