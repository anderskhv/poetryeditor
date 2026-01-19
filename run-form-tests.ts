/**
 * Standalone test runner for form detection
 * This tests the algorithm against classic poems
 */

import { detectPoetricForm } from './src/utils/formDetector';

interface TestPoem {
  title: string;
  author: string;
  text: string;
  expectedForm: string;
  expectedFit: 'high' | 'medium' | 'low';
}

const testPoems: TestPoem[] = [
  // ===== SHAKESPEARE'S SONNET 18 (The problematic one) =====
  {
    title: 'Sonnet 18',
    author: 'William Shakespeare',
    expectedForm: 'Shakespearean Sonnet',
    expectedFit: 'high',
    text: `Shall I compare thee to a summer's day?
Thou art more lovely and more temperate:
Rough winds do shake the darling buds of May,
And summer's lease hath all too short a date:
Sometime too hot the eye of heaven shines,
And often is his gold complexion dimmed,
And every fair from fair sometime declines,
By chance, or nature's changing course untrimmed:
But thy eternal summer shall not fade,
Nor lose possession of that fair thou ow'st,
Nor shall death brag thou wand'rest in his shade,
When in eternal lines to time thou grow'st,
So long as men can breathe, or eyes can see,
So long lives this, and this gives life to thee.`
  },
  // ===== MORE SHAKESPEAREAN SONNETS =====
  {
    title: 'Sonnet 29',
    author: 'William Shakespeare',
    expectedForm: 'Shakespearean Sonnet',
    expectedFit: 'high',
    text: `When in disgrace with fortune and men's eyes
I all alone beweep my outcast state,
And trouble deaf heaven with my bootless cries,
And look upon myself, and curse my fate,
Wishing me like to one more rich in hope,
Featured like him, like him with friends possessed,
Desiring this man's art, and that man's scope,
With what I most enjoy contented least;
Yet in these thoughts my self almost despising,
Haply I think on thee, and then my state,
Like to the lark at break of day arising
From sullen earth, sings hymns at heaven's gate;
For thy sweet love remembered such wealth brings
That then I scorn to change my state with kings.`
  },
  {
    title: 'Sonnet 116',
    author: 'William Shakespeare',
    expectedForm: 'Shakespearean Sonnet',
    expectedFit: 'high',
    text: `Let me not to the marriage of true minds
Admit impediments. Love is not love
Which alters when it alteration finds,
Or bends with the remover to remove:
O no! it is an ever-fixed mark
That looks on tempests and is never shaken;
It is the star to every wandering bark,
Whose worth's unknown, although his height be taken.
Love's not Time's fool, though rosy lips and cheeks
Within his bending sickle's compass come:
Love alters not with his brief hours and weeks,
But bears it out even to the edge of doom.
If this be error and upon me proved,
I never writ, nor no man ever loved.`
  },
  // ===== HAIKUS =====
  {
    title: 'The Old Pond',
    author: 'Matsuo Basho',
    expectedForm: 'Haiku',
    expectedFit: 'high',
    text: `An old silent pond
A frog jumps into the pond
Splash! Silence again`
  },
  // ===== LIMERICKS =====
  {
    title: 'There was an Old Man with a beard',
    author: 'Edward Lear',
    expectedForm: 'Limerick',
    expectedFit: 'high',
    text: `There was an Old Man with a beard,
Who said, "It is just as I feared!
Two Owls and a Hen,
Four Larks and a Wren,
Have all built their nests in my beard!"`
  }
];

console.log('='.repeat(80));
console.log('POETIC FORM DETECTION TEST SUITE');
console.log('='.repeat(80));

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

const failures: Array<{ poem: TestPoem, result: any }> = [];

testPoems.forEach((poem, index) => {
  totalTests++;
  const result = detectPoetricForm(poem.text);

  const formMatches = result.form === poem.expectedForm;
  const fitAcceptable = result.fit === 'high' || result.fit === 'medium';
  const passed = formMatches && fitAcceptable;

  if (passed) {
    passedTests++;
    console.log(`\n✓ TEST ${index + 1} PASSED: ${poem.title} by ${poem.author}`);
  } else {
    failedTests++;
    console.log(`\n✗ TEST ${index + 1} FAILED: ${poem.title} by ${poem.author}`);
    failures.push({ poem, result });
  }

  console.log(`  Expected: ${poem.expectedForm} (${poem.expectedFit} fit)`);
  console.log(`  Got:      ${result.form} (${result.fit} fit)`);

  if (result.actualPattern) {
    console.log(`  Pattern:  ${result.actualPattern}`);
  }

  if (result.fitScore !== undefined) {
    console.log(`  Fit Score: ${result.fitScore}/100`);
  }

  if (result.issues && result.issues.length > 0) {
    console.log(`  Issues:`);
    result.issues.forEach((issue: string) => {
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
  console.log('FAILURE ANALYSIS');
  console.log('='.repeat(80));

  failures.forEach(({ poem, result }, index) => {
    console.log(`\n${index + 1}. ${poem.title} by ${poem.author}`);
    console.log(`   Expected: ${poem.expectedForm}`);
    console.log(`   Got:      ${result.form}`);
    console.log(`   Pattern:  ${result.actualPattern || 'N/A'}`);
    console.log(`   Description: ${result.description || 'N/A'}`);
  });
}
