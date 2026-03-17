#!/usr/bin/env node
/**
 * fetch-gutenberg.mjs — Fetches poems directly from Project Gutenberg plain text files.
 * Uses raw text extraction with known line markers (first/last line of each poem).
 *
 * Usage: node scripts/fetch-gutenberg.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POEMS_DIR = path.join(__dirname, '..', 'src', 'data', 'poems');

// Each entry has the Gutenberg URL and start/end markers to extract the poem
const POEMS = [
  {
    file: 'keats-ode-nightingale',
    exportName: 'odeToNightingale',
    title: 'Ode to a Nightingale',
    poet: 'John Keats',
    poetBirth: 1795, poetDeath: 1821, year: 1819,
    form: 'Ode',
    collection: 'Lamia, Isabella, The Eve of St. Agnes, and Other Poems',
    // Gutenberg: The Complete Poems of John Keats
    url: 'https://www.gutenberg.org/cache/epub/23684/pg23684.txt',
    startMarker: 'My heart aches',
    endMarker: 'Do I wake or sleep?',
  },
  {
    file: 'wordsworth-tintern-abbey',
    exportName: 'tinternAbbey',
    title: 'Lines Composed a Few Miles above Tintern Abbey',
    poet: 'William Wordsworth',
    poetBirth: 1770, poetDeath: 1850, year: 1798,
    form: 'Blank Verse',
    collection: 'Lyrical Ballads',
    url: 'https://www.gutenberg.org/cache/epub/9622/pg9622.txt',
    startMarker: 'Five years have past',
    endMarker: 'these steep woods and lofty cliffs',
  },
  {
    file: 'eliot-prufrock',
    exportName: 'loveSongOfPrufrock',
    title: 'The Love Song of J. Alfred Prufrock',
    poet: 'T.S. Eliot',
    poetBirth: 1888, poetDeath: 1965, year: 1915,
    form: 'Dramatic Monologue',
    collection: 'Prufrock and Other Observations',
    url: 'https://www.gutenberg.org/cache/epub/1459/pg1459.txt',
    startMarker: 'Let us go then',
    endMarker: 'Till human voices wake us, and we drown.',
  },
  {
    file: 'coleridge-kubla-khan',
    exportName: 'kublaKhan',
    title: 'Kubla Khan',
    poet: 'Samuel Taylor Coleridge',
    poetBirth: 1772, poetDeath: 1834, year: 1816,
    form: 'Fragment / Vision Poem',
    url: 'https://www.gutenberg.org/cache/epub/29090/pg29090.txt',
    startMarker: 'In Xanadu did Kubla Khan',
    endMarker: 'the milk of Paradise.',
  },
  {
    file: 'tennyson-charge-light-brigade',
    exportName: 'chargeOfTheLightBrigade',
    title: 'The Charge of the Light Brigade',
    poet: 'Alfred, Lord Tennyson',
    poetBirth: 1809, poetDeath: 1892, year: 1854,
    form: 'Narrative Poem',
    url: 'https://www.gutenberg.org/cache/epub/8601/pg8601.txt',
    startMarker: 'Half a league',
    endMarker: 'Noble six hundred!',
  },
  {
    file: 'kipling-if',
    exportName: 'ifPoem',
    title: 'If—',
    poet: 'Rudyard Kipling',
    poetBirth: 1865, poetDeath: 1936, year: 1910,
    form: 'Didactic Poem',
    collection: 'Rewards and Fairies',
    url: 'https://www.gutenberg.org/cache/epub/6575/pg6575.txt',
    startMarker: 'If you can keep your head',
    endMarker: "you'll be a Man, my son!",
  },
  {
    file: 'thayer-casey-at-the-bat',
    exportName: 'caseyAtTheBat',
    title: 'Casey at the Bat',
    poet: 'Ernest Lawrence Thayer',
    poetBirth: 1863, poetDeath: 1940, year: 1888,
    form: 'Ballad',
    // Public domain text widely available
    url: 'https://www.gutenberg.org/cache/epub/37692/pg37692.txt',
    startMarker: 'The outlook wasn',
    endMarker: 'mighty Casey has struck out.',
  },
  {
    file: 'donne-no-man-is-an-island',
    exportName: 'noManIsAnIsland',
    title: 'No Man Is an Island',
    poet: 'John Donne',
    poetBirth: 1572, poetDeath: 1631, year: 1624,
    form: 'Prose Poem (from Meditation XVII)',
    url: 'https://www.gutenberg.org/cache/epub/23772/pg23772.txt',
    startMarker: 'No man is an island',
    endMarker: 'it tolls for thee.',
  },
];

function escapeForTemplate(text) {
  return text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function extractPoem(fullText, startMarker, endMarker) {
  const lines = fullText.split('\n');

  let startIdx = -1;
  let endIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (startIdx === -1 && lines[i].includes(startMarker)) {
      startIdx = i;
    }
    if (startIdx !== -1 && lines[i].includes(endMarker)) {
      endIdx = i;
      break; // Take the first occurrence after start
    }
  }

  if (startIdx === -1 || endIdx === -1) {
    return null;
  }

  // Extract lines, trim trailing whitespace, remove leading/trailing blank lines
  let poemLines = lines.slice(startIdx, endIdx + 1).map(l => l.trimEnd());

  // Remove leading blank lines
  while (poemLines.length > 0 && poemLines[0].trim() === '') poemLines.shift();
  // Remove trailing blank lines
  while (poemLines.length > 0 && poemLines[poemLines.length - 1].trim() === '') poemLines.pop();

  return poemLines;
}

function buildScaffold(poem, lines) {
  const text = escapeForTemplate(lines.join('\n'));
  const lineCount = lines.length;

  return `import { PoemAnalysis } from './index';

export const ${poem.exportName}: PoemAnalysis = {
  slug: '${poem.file}',
  title: '${poem.title.replace(/'/g, "\\'")}',
  poet: '${poem.poet.replace(/'/g, "\\'")}',
  poetBirth: ${poem.poetBirth},
  poetDeath: ${poem.poetDeath},
  year: ${poem.year},
${poem.collection ? `  collection: '${poem.collection.replace(/'/g, "\\'")}',\n` : ''}  form: '${poem.form}',
  text: \`${text}\`,
  // ${lineCount} lines — analysis fields below are scaffolds, fill in with Claude
  analysis: {
    overview: 'TODO: Write 2-3 paragraph overview',
    lineByLine: [
      { lines: '1-${Math.min(4, lineCount)}', commentary: 'TODO' },
    ],
    themes: ['TODO'],
    literaryDevices: [
      { device: 'TODO', example: 'TODO', explanation: 'TODO' },
    ],
    historicalContext: 'TODO: Historical context',
  },
  seoDescription: 'TODO: SEO description',
  abstractWords: [],
  rhymingPairs: [],
};
`;
}

async function main() {
  let created = 0;
  let failed = 0;
  const failures = [];

  for (const poem of POEMS) {
    const filePath = path.join(POEMS_DIR, `${poem.file}.ts`);
    if (fs.existsSync(filePath)) {
      console.log(`[SKIP] ${poem.file}.ts already exists`);
      continue;
    }

    console.log(`\n[${poem.poet}] "${poem.title}"`);
    console.log(`  Fetching: ${poem.url}`);

    try {
      const res = await fetch(poem.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const fullText = await res.text();
      console.log(`  Downloaded ${(fullText.length / 1024).toFixed(0)}KB`);

      const lines = extractPoem(fullText, poem.startMarker, poem.endMarker);

      if (!lines) {
        console.log(`  ✗ Could not find markers in text`);
        console.log(`    Start: "${poem.startMarker}"`);
        console.log(`    End: "${poem.endMarker}"`);
        failures.push(poem);
        failed++;
        continue;
      }

      console.log(`  ✓ Extracted ${lines.length} lines`);

      const scaffold = buildScaffold(poem, lines);
      fs.writeFileSync(filePath, scaffold, 'utf-8');
      console.log(`  ✓ Written to ${poem.file}.ts`);
      created++;

      await new Promise(r => setTimeout(r, 500));

    } catch (err) {
      console.log(`  ✗ Error: ${err.message}`);
      failures.push(poem);
      failed++;
    }
  }

  console.log(`\nDone: ${created} created, ${failed} failed`);
  if (failures.length > 0) {
    console.log('\nFailed:');
    failures.forEach(p => console.log(`  - ${p.poet}: ${p.title}`));
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
