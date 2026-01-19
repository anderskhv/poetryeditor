// Quick test to verify POETIC_REDUCTIONS

// Import the exact same dictionary - recreate it here to test
const POETIC_REDUCTIONS: Record<string, number> = {
  // -ering words (3 → 2 syllables)
  'wandering': 2, 'wondering': 2, 'pondering': 2, 'towering': 2,
  'flowering': 2, 'showering': 2, 'hovering': 2, 'quivering': 2,
  'shivering': 2, 'wavering': 2, 'faltering': 2, 'entering': 2,
  'gathering': 2, 'withering': 2, 'whispering': 2, 'glittering': 2,
  'listening': 2, 'glistening': 2, 'threatening': 2, 'widening': 2,
};

console.log('Testing POETIC_REDUCTIONS lookup:');
console.log('widening in dict:', 'widening' in POETIC_REDUCTIONS);
console.log('POETIC_REDUCTIONS["widening"]:', POETIC_REDUCTIONS['widening']);

const testWord = 'widening';
const lower = testWord.toLowerCase().replace(/[^a-z']/g, '');
console.log('Normalized word:', `"${lower}"`);
console.log('Lookup result:', POETIC_REDUCTIONS[lower]);

// Test the exact check from getSyllableCount
if (POETIC_REDUCTIONS[lower]) {
  console.log('Would return:', POETIC_REDUCTIONS[lower]);
} else {
  console.log('Check failed - would fall through to CMU');
}
