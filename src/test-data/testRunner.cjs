/**
 * Simple test runner that can execute in Node.js
 * Run with: node src/test-data/testRunner.cjs
 */

const fs = require('fs');
const path = require('path');

// Read the test poems file
const testPoemsPath = path.join(__dirname, 'testPoems.ts');
const testPoemsContent = fs.readFileSync(testPoemsPath, 'utf-8');

// Extract poems using regex (simplified extraction)
const poemMatches = testPoemsContent.matchAll(/id:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?content:\s*`([\s\S]*?)`[\s\S]*?expectedForm:\s*'([^']*)'[\s\S]*?tags:\s*\[([^\]]*)\]/g);

const poems = [];
for (const match of testPoemsContent.matchAll(/\{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*content:\s*`([\s\S]*?)`,/g)) {
  const id = match[1];
  const title = match[2];
  const content = match[3];

  // Extract tags if present
  const tagsMatch = testPoemsContent.slice(match.index).match(/tags:\s*\[([^\]]*)\]/);
  const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim().replace(/'/g, '')) : [];

  // Extract expectedForm if present
  const formMatch = testPoemsContent.slice(match.index, match.index + 1000).match(/expectedForm:\s*'([^']*)'/);
  const expectedForm = formMatch ? formMatch[1] : null;

  // Extract expectedMeter if present
  const meterMatch = testPoemsContent.slice(match.index, match.index + 1000).match(/expectedMeter:\s*'([^']*)'/);
  const expectedMeter = meterMatch ? meterMatch[1] : null;

  // Extract expectedRhymeScheme if present
  const rhymeMatch = testPoemsContent.slice(match.index, match.index + 1000).match(/expectedRhymeScheme:\s*'([^']*)'/);
  const expectedRhymeScheme = rhymeMatch ? rhymeMatch[1] : null;

  poems.push({
    id,
    title,
    content,
    tags,
    expectedForm,
    expectedMeter,
    expectedRhymeScheme,
    lineCount: content.split('\n').filter(l => l.trim()).length
  });
}

// Summary
console.log('=' .repeat(80));
console.log('POETRY TEST DATASET SUMMARY');
console.log('=' .repeat(80));
console.log('');
console.log('Total poems:', poems.length);
console.log('Total poetry lines:', poems.reduce((sum, p) => sum + p.lineCount, 0));
console.log('');

// Breakdown by form
console.log('POEMS BY EXPECTED FORM:');
const formCounts = {};
poems.forEach(p => {
  const form = p.expectedForm || 'Not specified';
  formCounts[form] = (formCounts[form] || 0) + 1;
});
Object.entries(formCounts).sort((a, b) => b[1] - a[1]).forEach(([form, count]) => {
  console.log(`  ${form}: ${count}`);
});
console.log('');

// Breakdown by tags
console.log('POEMS BY TAG (top 20):');
const tagCounts = {};
poems.forEach(p => {
  p.tags.forEach(tag => {
    if (tag && tag.length > 0) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  });
});
Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([tag, count]) => {
  console.log(`  ${tag}: ${count}`);
});
console.log('');

// Sample poems for each form
console.log('SAMPLE POEMS:');
console.log('-'.repeat(80));

const forms = ['Shakespearean Sonnet', 'Haiku', 'Free Verse', 'Villanelle', 'Ballad', 'Limerick'];
forms.forEach(form => {
  const samples = poems.filter(p => p.expectedForm === form).slice(0, 2);
  if (samples.length > 0) {
    console.log(`\n${form}:`);
    samples.forEach(p => {
      console.log(`  - ${p.title} (${p.lineCount} lines)`);
    });
  }
});

// Check for testing coverage
console.log('\n');
console.log('TESTING COVERAGE ANALYSIS:');
console.log('-'.repeat(80));

const testablePoems = poems.filter(p => p.expectedForm || p.expectedMeter || p.expectedRhymeScheme);
console.log(`Poems with expected form/meter/rhyme: ${testablePoems.length}/${poems.length}`);

const poemsWithRhymeScheme = poems.filter(p => p.expectedRhymeScheme);
console.log(`Poems with expected rhyme scheme: ${poemsWithRhymeScheme.length}`);

const poemsWithMeter = poems.filter(p => p.expectedMeter);
console.log(`Poems with expected meter: ${poemsWithMeter.length}`);

const soundPatternPoems = poems.filter(p =>
  p.tags.includes('alliteration') ||
  p.tags.includes('assonance') ||
  p.tags.includes('consonance') ||
  p.tags.includes('sound-patterns')
);
console.log(`Poems tagged for sound pattern testing: ${soundPatternPoems.length}`);

const internalRhymePoems = poems.filter(p => p.tags.includes('internal-rhyme'));
console.log(`Poems tagged for internal rhyme testing: ${internalRhymePoems.length}`);

const edgeCasePoems = poems.filter(p => p.tags.includes('edge-case'));
console.log(`Edge case poems: ${edgeCasePoems.length}`);

console.log('\n');
console.log('=' .repeat(80));
console.log('END OF DATASET SUMMARY');
console.log('=' .repeat(80));

// Save detailed data to JSON for further analysis
const outputPath = path.join(__dirname, 'testPoemsAnalysis.json');
fs.writeFileSync(outputPath, JSON.stringify({
  summary: {
    totalPoems: poems.length,
    totalLines: poems.reduce((sum, p) => sum + p.lineCount, 0),
    formCounts,
    tagCounts
  },
  poems: poems.map(p => ({
    id: p.id,
    title: p.title,
    lineCount: p.lineCount,
    tags: p.tags,
    expectedForm: p.expectedForm,
    expectedMeter: p.expectedMeter,
    expectedRhymeScheme: p.expectedRhymeScheme
  }))
}, null, 2));

console.log(`\nDetailed analysis saved to: ${outputPath}`);
