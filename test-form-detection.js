/**
 * Manual test runner for form detection
 * Run with: node test-form-detection.js
 */

const { testPoems } = require('./dist/utils/__tests__/formDetector.test.js');
const { detectPoetricForm } = require('./dist/utils/formDetector.js');

console.log('='.repeat(80));
console.log('POETIC FORM DETECTION TEST SUITE');
console.log('='.repeat(80));

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

const failures = [];

testPoems.forEach((poem, index) => {
  totalTests++;
  const result = detectPoetricForm(poem.text);

  const passed = result.form === poem.expectedForm &&
                 (result.fit === 'high' || result.fit === 'medium');

  if (passed) {
    passedTests++;
    console.log(`\n✓ TEST ${index + 1} PASSED: ${poem.title} by ${poem.author}`);
  } else {
    failedTests++;
    console.log(`\n✗ TEST ${index + 1} FAILED: ${poem.title} by ${poem.author}`);
    failures.push({
      poem,
      result
    });
  }

  console.log(`  Expected: ${poem.expectedForm} (${poem.expectedFit} fit)`);
  console.log(`  Got:      ${result.form} (${result.fit} fit)`);

  if (result.actualPattern) {
    console.log(`  Pattern:  ${result.actualPattern}`);
  }

  if (result.issues && result.issues.length > 0) {
    console.log(`  Issues:`);
    result.issues.forEach(issue => {
      console.log(`    - ${issue}`);
    });
  }
});

console.log('\n' + '='.repeat(80));
console.log('TEST SUMMARY');
console.log('='.repeat(80));
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed:      ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
console.log(`Failed:      ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);

if (failures.length > 0) {
  console.log('\n' + '='.repeat(80));
  console.log('FAILURES DETAILS');
  console.log('='.repeat(80));

  failures.forEach(({ poem, result }, index) => {
    console.log(`\n${index + 1}. ${poem.title} by ${poem.author}`);
    console.log(`   Expected: ${poem.expectedForm}`);
    console.log(`   Got:      ${result.form}`);
    console.log(`   Pattern:  ${result.actualPattern || 'N/A'}`);
    console.log(`\n   Text:`);
    const lines = poem.text.split('\n');
    lines.forEach((line, i) => {
      console.log(`   ${i+1}. ${line}`);
    });
  });
}

process.exit(failedTests > 0 ? 1 : 0);
