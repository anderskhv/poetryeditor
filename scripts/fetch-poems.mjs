#!/usr/bin/env node
/**
 * fetch-poems.mjs — Fetches public domain poems from PoetryDB and writes
 * scaffold .ts files with the full text embedded. Claude can then fill in
 * the analysis fields without hitting content filters (since the text is
 * already on disk).
 *
 * Usage:
 *   node scripts/fetch-poems.mjs              # fetch all missing poems
 *   node scripts/fetch-poems.mjs --list       # just show what would be fetched
 *   node scripts/fetch-poems.mjs --poem "The Raven"  # fetch one specific poem
 *
 * The script:
 *  1. Checks which poems from the WANTED list don't have files yet
 *  2. Fetches text from PoetryDB (https://poetrydb.org)
 *  3. Writes a .ts scaffold with text embedded + empty analysis fields
 *  4. Does NOT touch index.ts (Claude adds imports + exports after filling analysis)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POEMS_DIR = path.join(__dirname, '..', 'src', 'data', 'poems');

// Poem manifest — add entries here to scale up
// PoetryDB uses exact title matching, so titles must match their database
const WANTED = [
  // The 14 "blocked" poems
  {
    file: 'keats-ode-nightingale',
    exportName: 'odeToNightingale',
    title: 'Ode to a Nightingale',
    poetryDbTitle: 'Ode to a Nightingale',
    poet: 'John Keats',
    poetBirth: 1795, poetDeath: 1821, year: 1819,
    form: 'Ode',
    collection: 'Lamia, Isabella, The Eve of St. Agnes, and Other Poems',
  },
  {
    file: 'keats-ode-grecian-urn',
    exportName: 'odeOnGrecianUrn',
    title: 'Ode on a Grecian Urn',
    poetryDbTitle: 'Ode on a Grecian Urn',
    poet: 'John Keats',
    poetBirth: 1795, poetDeath: 1821, year: 1819,
    form: 'Ode',
    collection: 'Lamia, Isabella, The Eve of St. Agnes, and Other Poems',
  },
  {
    file: 'keats-autumn',
    exportName: 'toAutumn',
    title: 'To Autumn',
    poetryDbTitle: 'To Autumn',
    poet: 'John Keats',
    poetBirth: 1795, poetDeath: 1821, year: 1820,
    form: 'Ode',
    collection: 'Lamia, Isabella, The Eve of St. Agnes, and Other Poems',
  },
  {
    file: 'wordsworth-tintern-abbey',
    exportName: 'tinternAbbey',
    title: 'Lines Composed a Few Miles above Tintern Abbey',
    poetryDbTitle: 'Lines Composed a Few Miles above Tintern Abbey, on Revisiting the Banks of the Wye during a Tour. July 13, 1798',
    poet: 'William Wordsworth',
    poetBirth: 1770, poetDeath: 1850, year: 1798,
    form: 'Blank Verse',
    collection: 'Lyrical Ballads',
  },
  {
    file: 'shelley-ode-west-wind',
    exportName: 'odeToTheWestWind',
    title: 'Ode to the West Wind',
    poetryDbTitle: 'Ode to the West Wind',
    poet: 'Percy Bysshe Shelley',
    poetBirth: 1792, poetDeath: 1822, year: 1820,
    form: 'Terza Rima Sonnet',
  },
  {
    file: 'shelley-skylark',
    exportName: 'toASkylark',
    title: 'To a Skylark',
    poetryDbTitle: 'To a Skylark',
    poet: 'Percy Bysshe Shelley',
    poetBirth: 1792, poetDeath: 1822, year: 1820,
    form: 'Lyric',
  },
  {
    file: 'shelley-mont-blanc',
    exportName: 'montBlanc',
    title: 'Mont Blanc',
    poetryDbTitle: 'Mont Blanc',
    poet: 'Percy Bysshe Shelley',
    poetBirth: 1792, poetDeath: 1822, year: 1817,
    form: 'Irregular Verse',
  },
  {
    file: 'poe-raven',
    exportName: 'theRaven',
    title: 'The Raven',
    poetryDbTitle: 'The Raven',
    poet: 'Edgar Allan Poe',
    poetBirth: 1809, poetDeath: 1849, year: 1845,
    form: 'Narrative Poem',
  },
  {
    file: 'eliot-prufrock',
    exportName: 'lovesSongOfPrufrock',
    title: 'The Love Song of J. Alfred Prufrock',
    poetryDbTitle: 'The Love Song of J. Alfred Prufrock',
    poet: 'T.S. Eliot',
    poetBirth: 1888, poetDeath: 1965, year: 1915,
    form: 'Dramatic Monologue',
    collection: 'Prufrock and Other Observations',
  },
  {
    file: 'thayer-casey-at-the-bat',
    exportName: 'caseyAtTheBat',
    title: 'Casey at the Bat',
    poetryDbTitle: 'Casey at the Bat',
    poet: 'Ernest Lawrence Thayer',
    poetBirth: 1863, poetDeath: 1940, year: 1888,
    form: 'Ballad',
  },
  {
    file: 'coleridge-kubla-khan',
    exportName: 'kublaKhan',
    title: 'Kubla Khan',
    poetryDbTitle: 'Kubla Khan',
    poet: 'Samuel Taylor Coleridge',
    poetBirth: 1772, poetDeath: 1834, year: 1816,
    form: 'Fragment / Vision Poem',
  },
  {
    file: 'donne-no-man-is-an-island',
    exportName: 'noManIsAnIsland',
    title: 'No Man Is an Island',
    poetryDbTitle: 'No man is an island',
    poet: 'John Donne',
    poetBirth: 1572, poetDeath: 1631, year: 1624,
    form: 'Prose Poem (from Meditation XVII)',
  },
  {
    file: 'kipling-if',
    exportName: 'ifPoem',
    title: 'If—',
    poetryDbTitle: 'If',
    poet: 'Rudyard Kipling',
    poetBirth: 1865, poetDeath: 1936, year: 1910,
    form: 'Didactic Poem',
    collection: 'Rewards and Fairies',
  },
  {
    file: 'tennyson-charge-light-brigade',
    exportName: 'chargeOfTheLightBrigade',
    title: 'The Charge of the Light Brigade',
    poetryDbTitle: 'The Charge of the Light Brigade',
    poet: 'Alfred, Lord Tennyson',
    poetBirth: 1809, poetDeath: 1892, year: 1854,
    form: 'Narrative Poem',
  },
];

function escapeForTemplate(text) {
  return text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function makeSlug(file) {
  return file; // file name IS the slug
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

async function fetchFromPoetryDB(poet, title) {
  const url = `https://poetrydb.org/author,title/${encodeURIComponent(poet)};${encodeURIComponent(title)}`;
  console.log(`  Fetching: ${url}`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from PoetryDB`);
  }

  const data = await res.json();

  if (data.status && data.status === 404) {
    return null;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return data[0].lines;
}

async function main() {
  const args = process.argv.slice(2);
  const listOnly = args.includes('--list');
  const singlePoem = args.includes('--poem') ? args[args.indexOf('--poem') + 1] : null;

  let toFetch = WANTED;

  if (singlePoem) {
    toFetch = WANTED.filter(p =>
      p.title.toLowerCase().includes(singlePoem.toLowerCase()) ||
      p.file.includes(singlePoem.toLowerCase())
    );
    if (toFetch.length === 0) {
      console.log(`No poem matching "${singlePoem}" in manifest.`);
      process.exit(1);
    }
  }

  // Filter to only missing poems
  const missing = toFetch.filter(p => {
    const filePath = path.join(POEMS_DIR, `${p.file}.ts`);
    return !fs.existsSync(filePath);
  });

  if (missing.length === 0) {
    console.log('All poems already have files. Nothing to fetch.');
    return;
  }

  console.log(`\n${missing.length} poems to fetch:\n`);
  missing.forEach(p => console.log(`  - ${p.poet}: ${p.title} → ${p.file}.ts`));

  if (listOnly) {
    console.log('\nRun without --list to fetch and create files.');
    return;
  }

  console.log('');

  let created = 0;
  let failed = 0;
  const failures = [];

  for (const poem of missing) {
    console.log(`[${poem.poet}] "${poem.title}"`);

    try {
      const lines = await fetchFromPoetryDB(poem.poet, poem.poetryDbTitle);

      if (!lines) {
        console.log(`  ✗ Not found in PoetryDB — will need manual text\n`);
        failures.push(poem);
        failed++;
        continue;
      }

      console.log(`  ✓ ${lines.length} lines fetched`);

      const scaffold = buildScaffold(poem, lines);
      const filePath = path.join(POEMS_DIR, `${poem.file}.ts`);
      fs.writeFileSync(filePath, scaffold, 'utf-8');
      console.log(`  ✓ Written to ${poem.file}.ts\n`);
      created++;

      // Be polite to the API
      await new Promise(r => setTimeout(r, 300));

    } catch (err) {
      console.log(`  ✗ Error: ${err.message}\n`);
      failures.push(poem);
      failed++;
    }
  }

  console.log(`\nDone: ${created} created, ${failed} failed`);

  if (failures.length > 0) {
    console.log('\nFailed poems (need manual text):');
    failures.forEach(p => console.log(`  - ${p.poet}: ${p.title}`));
  }

  if (created > 0) {
    console.log('\nNext steps:');
    console.log('  1. Run Claude to fill in analysis fields (overview, lineByLine, themes, etc.)');
    console.log('  2. Add imports + exports to src/data/poems/index.ts');
    console.log('  3. Verify with: npx tsc --noEmit');
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
