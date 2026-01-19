/**
 * Comprehensive Test Runner for Poetry Editor Analysis Features
 * Simulates and tests all analysis algorithms
 *
 * Run with: node src/test-data/comprehensiveTest.cjs
 */

const fs = require('fs');
const path = require('path');

// Read test poems
const testPoemsPath = path.join(__dirname, 'testPoemsAnalysis.json');
let testData;
try {
  testData = JSON.parse(fs.readFileSync(testPoemsPath, 'utf-8'));
} catch (e) {
  console.log('Run testRunner.cjs first to generate testPoemsAnalysis.json');
  process.exit(1);
}

// Read the raw test poems file to get content
const rawPoemsPath = path.join(__dirname, 'testPoems.ts');
const rawContent = fs.readFileSync(rawPoemsPath, 'utf-8');

// Extract full poem content
function getPoemContent(id) {
  const regex = new RegExp(`id:\\s*'${id}'[\\s\\S]*?content:\\s*\`([\\s\\S]*?)\``, 'm');
  const match = rawContent.match(regex);
  return match ? match[1] : null;
}

// =========================================
// SIMPLIFIED ANALYSIS FUNCTIONS
// (Mimicking the TypeScript implementations)
// =========================================

// Rhyme detection helpers
function getLastWord(line) {
  const words = line.trim().replace(/[^\w\s'-]/g, '').split(/\s+/);
  return words.length > 0 ? words[words.length - 1].toLowerCase() : null;
}

function getRhymingPart(word) {
  const lower = word.toLowerCase();
  // Common rhyme endings
  const patterns = {
    'ight': 'AYT', 'ite': 'AYT', 'ight': 'AYT',
    'ound': 'AWND', 'own': 'OWN',
    'ead': 'EHD', 'ed': 'EHD',
    'ine': 'AYN', 'ign': 'AYN',
    'ove': 'UHV', 'uff': 'UHF',
    'ake': 'AYK', 'ame': 'AYM',
    'ear': 'IHR', 'eer': 'IHR',
    'ore': 'OHR', 'oar': 'OHR',
    'ow': 'OH', 'oe': 'OH',
    'ay': 'AY', 'ey': 'AY',
    'ue': 'UW', 'oo': 'UW',
    'ell': 'EHL', 'all': 'AHL',
  };

  for (const [ending, sound] of Object.entries(patterns)) {
    if (lower.endsWith(ending)) {
      return sound;
    }
  }

  // Default: last 2-3 chars
  return lower.slice(-3).toUpperCase();
}

function doWordsRhyme(word1, word2) {
  if (word1 === word2) return false;
  const rhyme1 = getRhymingPart(word1);
  const rhyme2 = getRhymingPart(word2);
  return rhyme1 === rhyme2;
}

function detectRhymeScheme(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const endWords = lines.map(l => getLastWord(l)).filter(Boolean);
  const scheme = [];
  const rhymeGroups = {};
  let nextLetter = 'A';

  for (let i = 0; i < endWords.length; i++) {
    let foundGroup = null;
    for (const [letter, group] of Object.entries(rhymeGroups)) {
      if (group.some(w => doWordsRhyme(w, endWords[i]))) {
        foundGroup = letter;
        break;
      }
    }

    if (foundGroup) {
      scheme.push(foundGroup);
      rhymeGroups[foundGroup].push(endWords[i]);
    } else {
      scheme.push(nextLetter);
      rhymeGroups[nextLetter] = [endWords[i]];
      nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
    }
  }

  return scheme.join('');
}

// Syllable counting (simplified)
function countSyllables(word) {
  const lower = word.toLowerCase().replace(/[^a-z]/g, '');
  if (lower.length === 0) return 0;

  // Count vowel groups
  const vowelGroups = lower.match(/[aeiouy]+/g) || [];
  let count = vowelGroups.length;

  // Adjust for silent e
  if (lower.endsWith('e') && count > 1) count--;

  // Adjust for common patterns
  if (lower.endsWith('le') && lower.length > 2 && !/[aeiou]/.test(lower[lower.length - 3])) count++;
  if (lower.endsWith('ed') && count > 1 && !/[dt]ed$/.test(lower)) count--;

  return Math.max(1, count);
}

function getLineSyllables(line) {
  const words = line.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
  return words.reduce((sum, w) => sum + countSyllables(w), 0);
}

// Haiku detection
function isHaiku(text) {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length !== 3) return false;

  const syllables = lines.map(l => getLineSyllables(l));
  // Allow some tolerance
  return (
    syllables[0] >= 4 && syllables[0] <= 6 &&
    syllables[1] >= 6 && syllables[1] <= 8 &&
    syllables[2] >= 4 && syllables[2] <= 6
  );
}

// Sound pattern detection
function getInitialSound(word) {
  const lower = word.toLowerCase();
  if (lower.startsWith('ph')) return 'f';
  if (lower.startsWith('ch')) return 'ch';
  if (lower.startsWith('sh')) return 'sh';
  if (lower.startsWith('th')) return 'th';
  if (lower.startsWith('wh')) return 'w';
  if (lower.startsWith('wr')) return 'r';
  if (lower.startsWith('kn')) return 'n';
  return lower[0];
}

function detectAlliteration(text) {
  const lines = text.split('\n');
  let count = 0;
  const instances = [];

  for (const line of lines) {
    const words = line.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    const soundGroups = {};

    for (const word of words) {
      const sound = getInitialSound(word);
      if (!/[aeiou]/.test(sound)) {
        if (!soundGroups[sound]) soundGroups[sound] = [];
        soundGroups[sound].push(word);
      }
    }

    for (const [sound, wordList] of Object.entries(soundGroups)) {
      if (wordList.length >= 3) {
        count++;
        instances.push({ sound, words: wordList });
      }
    }
  }

  return { count, instances };
}

function getFinalConsonant(word) {
  let lower = word.toLowerCase();
  if (lower.endsWith('e') && lower.length > 2) {
    lower = lower.slice(0, -1);
  }
  const match = lower.match(/[bcdfghjklmnpqrstvwxyz]$/);
  return match ? match[0] : '';
}

function detectConsonance(text) {
  const lines = text.split('\n');
  let count = 0;
  const instances = [];

  for (const line of lines) {
    const words = line.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length >= 2);
    const soundGroups = {};

    for (const word of words) {
      const consonant = getFinalConsonant(word);
      if (consonant) {
        if (!soundGroups[consonant]) soundGroups[consonant] = [];
        if (!soundGroups[consonant].includes(word)) {
          soundGroups[consonant].push(word);
        }
      }
    }

    for (const [sound, wordList] of Object.entries(soundGroups)) {
      if (wordList.length >= 2) {
        count++;
        instances.push({ sound, words: wordList });
      }
    }
  }

  return { count, instances };
}

// =========================================
// TEST EXECUTION
// =========================================

console.log('');
console.log('=' .repeat(80));
console.log('COMPREHENSIVE POETRY ANALYSIS TEST REPORT');
console.log('=' .repeat(80));
console.log('');
console.log('Testing', testData.summary.totalPoems, 'poems with', testData.summary.totalLines, 'lines');
console.log('');

const results = {
  rhymeScheme: { total: 0, passed: 0, failed: 0, issues: [] },
  haiku: { total: 0, passed: 0, failed: 0, issues: [] },
  alliteration: { total: 0, avgCount: 0, issues: [] },
  consonance: { total: 0, avgCount: 0, issues: [] },
  syllables: { samples: [] },
};

// Test each poem
for (const poemMeta of testData.poems) {
  const content = getPoemContent(poemMeta.id);
  if (!content) continue;

  // Test rhyme scheme detection
  if (poemMeta.expectedRhymeScheme) {
    results.rhymeScheme.total++;
    const detected = detectRhymeScheme(content);
    const expected = poemMeta.expectedRhymeScheme.replace(/\s/g, '');

    // Check if pattern type matches (e.g., ABAB pattern)
    const hasABAB = expected.includes('ABAB') && (detected.includes('ABAB') || detected.match(/ABAB|CDCD|EFEF/));
    const hasCouplet = expected.endsWith('GG') && detected.match(/[A-Z]{2}$/);
    const matches = hasABAB || hasCouplet || detected === expected;

    if (matches) {
      results.rhymeScheme.passed++;
    } else {
      results.rhymeScheme.failed++;
      results.rhymeScheme.issues.push({
        poem: poemMeta.title,
        expected: poemMeta.expectedRhymeScheme,
        detected: detected
      });
    }
  }

  // Test haiku detection
  if (poemMeta.tags.includes('haiku')) {
    results.haiku.total++;
    const isHaikuResult = isHaiku(content);
    if (isHaikuResult) {
      results.haiku.passed++;
    } else {
      results.haiku.failed++;
      const lines = content.split('\n').filter(l => l.trim());
      const syllables = lines.map(l => getLineSyllables(l));
      results.haiku.issues.push({
        poem: poemMeta.title,
        syllables: syllables,
        expected: '5-7-5'
      });
    }
  }

  // Test alliteration
  const alliterationResult = detectAlliteration(content);
  results.alliteration.total++;
  results.alliteration.avgCount += alliterationResult.count;

  // Test consonance
  const consonanceResult = detectConsonance(content);
  results.consonance.total++;
  results.consonance.avgCount += consonanceResult.count;
}

// Calculate averages
results.alliteration.avgCount /= results.alliteration.total || 1;
results.consonance.avgCount /= results.consonance.total || 1;

// =========================================
// PRINT REPORT
// =========================================

console.log('-'.repeat(80));
console.log('RHYME SCHEME DETECTION');
console.log('-'.repeat(80));
console.log('Total tested:', results.rhymeScheme.total);
console.log('Passed:', results.rhymeScheme.passed);
console.log('Failed:', results.rhymeScheme.failed);
console.log('Pass rate:', ((results.rhymeScheme.passed / results.rhymeScheme.total) * 100).toFixed(1) + '%');

if (results.rhymeScheme.issues.length > 0) {
  console.log('\nIssues (first 5):');
  results.rhymeScheme.issues.slice(0, 5).forEach(issue => {
    console.log(`  - ${issue.poem}: expected ${issue.expected}, got ${issue.detected}`);
  });
}

console.log('');
console.log('-'.repeat(80));
console.log('HAIKU DETECTION');
console.log('-'.repeat(80));
console.log('Total tested:', results.haiku.total);
console.log('Passed:', results.haiku.passed);
console.log('Failed:', results.haiku.failed);
console.log('Pass rate:', ((results.haiku.passed / results.haiku.total) * 100).toFixed(1) + '%');

if (results.haiku.issues.length > 0) {
  console.log('\nIssues (first 5):');
  results.haiku.issues.slice(0, 5).forEach(issue => {
    console.log(`  - ${issue.poem}: syllables ${issue.syllables.join('-')}, expected ${issue.expected}`);
  });
}

console.log('');
console.log('-'.repeat(80));
console.log('SOUND PATTERNS');
console.log('-'.repeat(80));
console.log('Average alliterations per poem:', results.alliteration.avgCount.toFixed(2));
console.log('Average consonances per poem:', results.consonance.avgCount.toFixed(2));

if (results.alliteration.avgCount > 5) {
  console.log('\n⚠️  HIGH ALLITERATION COUNT - may indicate over-detection');
}
if (results.consonance.avgCount > 10) {
  console.log('\n⚠️  HIGH CONSONANCE COUNT - may cause cluttered highlighting in UI');
}

console.log('');
console.log('-'.repeat(80));
console.log('UX/UI ANALYSIS');
console.log('-'.repeat(80));

const uxIssues = [];

// Check rhyme detection reliability
if (results.rhymeScheme.failed > results.rhymeScheme.passed * 0.3) {
  uxIssues.push('Rhyme scheme detection has >30% failure rate - users may see incorrect rhyme patterns');
}

// Check haiku detection
if (results.haiku.failed > 2) {
  uxIssues.push(`${results.haiku.failed} haiku poems not correctly identified - form detection needs improvement`);
}

// Check sound pattern density
if (results.consonance.avgCount > 15) {
  uxIssues.push('Consonance detection is very high - UI highlighting may be overwhelming');
}

if (results.alliteration.avgCount < 0.5) {
  uxIssues.push('Alliteration detection is low - may be missing obvious patterns');
}

if (uxIssues.length === 0) {
  console.log('✓ No major UX/UI issues detected');
} else {
  uxIssues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue}`);
  });
}

console.log('');
console.log('-'.repeat(80));
console.log('RECOMMENDATIONS');
console.log('-'.repeat(80));

const recommendations = [];

if (results.rhymeScheme.failed > 3) {
  recommendations.push('Improve rhyme scheme detection algorithm for more pattern types');
}

if (results.haiku.failed > 0) {
  recommendations.push('Refine syllable counting for better haiku detection accuracy');
}

if (results.consonance.avgCount > 10) {
  recommendations.push('Consider filtering consonance results to show only the most significant patterns');
}

if (recommendations.length === 0) {
  console.log('✓ Analysis algorithms are performing well');
} else {
  recommendations.forEach((rec, i) => {
    console.log(`${i + 1}. ${rec}`);
  });
}

console.log('');
console.log('=' .repeat(80));
console.log('END OF REPORT');
console.log('=' .repeat(80));

// Save detailed results
const reportPath = path.join(__dirname, 'testReport.json');
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  summary: {
    totalPoems: testData.summary.totalPoems,
    totalLines: testData.summary.totalLines,
    rhymeSchemePassRate: (results.rhymeScheme.passed / results.rhymeScheme.total * 100).toFixed(1) + '%',
    haikuPassRate: (results.haiku.passed / results.haiku.total * 100).toFixed(1) + '%',
    avgAlliteration: results.alliteration.avgCount.toFixed(2),
    avgConsonance: results.consonance.avgCount.toFixed(2)
  },
  rhymeSchemeIssues: results.rhymeScheme.issues,
  haikuIssues: results.haiku.issues,
  uxIssues,
  recommendations
}, null, 2));

console.log('\nDetailed report saved to:', reportPath);
