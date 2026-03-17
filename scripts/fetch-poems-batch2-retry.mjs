#!/usr/bin/env node
/**
 * fetch-poems-batch2-retry.mjs — Retry failed poems with corrected PoetryDB titles
 * and additional poems from poets who ARE in the database.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POEMS_DIR = path.join(__dirname, '..', 'src', 'data', 'poems');

const WANTED = [
  // === Milton — corrected title format ===
  {
    file: 'milton-paradise-lost-book1-opening',
    exportName: 'paradiseLostOpening',
    title: 'Paradise Lost (Book I, Opening)',
    poetryDbTitle: 'Paradise Lost: Book 01',
    poet: 'John Milton',
    poetBirth: 1608, poetDeath: 1674, year: 1667,
    form: 'Epic / Blank Verse',
    extractLines: [0, 26], // The invocation
  },
  {
    file: 'milton-on-his-blindness',
    exportName: 'onHisBlindness',
    title: 'When I Consider How My Light Is Spent',
    poetryDbTitle: 'How Soon Hath Time', // Try this — "On His Blindness" is actually Sonnet 19
    poet: 'John Milton',
    poetBirth: 1608, poetDeath: 1674, year: 1673,
    form: 'Petrarchan Sonnet',
    // Note: if this fetches the wrong poem, we'll need manual text
  },

  // === Elizabeth Barrett Browning — Aurora Leigh is there ===
  {
    file: 'browning-eb-aurora-leigh',
    exportName: 'auroraLeigh',
    title: 'Aurora Leigh (Excerpts)',
    poetryDbTitle: 'Aurora Leigh (excerpts)',
    poet: 'Elizabeth Barrett Browning',
    poetBirth: 1806, poetDeath: 1861, year: 1856,
    form: 'Verse Novel / Blank Verse',
  },
  // EBB also has "A Musical Instrument" and "The Cry Of The Children"
  {
    file: 'browning-eb-musical-instrument',
    exportName: 'musicalInstrument',
    title: 'A Musical Instrument',
    poetryDbTitle: 'A Musical Instrument',
    poet: 'Elizabeth Barrett Browning',
    poetBirth: 1806, poetDeath: 1861, year: 1860,
    form: 'Lyric',
  },

  // === Emily Bronte — "Remembrance" not in DB, but "Death" and others are ===
  {
    file: 'bronte-death',
    exportName: 'death',
    title: 'Death',
    poetryDbTitle: 'Death',
    poet: 'Emily Bronte',
    poetBirth: 1818, poetDeath: 1848, year: 1846,
    form: 'Lyric',
  },
  {
    file: 'bronte-night-is-darkening',
    exportName: 'nightIsDarkening',
    title: 'The Night Is Darkening Round Me',
    poetryDbTitle: 'The Night is Darkening Around Me',
    poet: 'Emily Bronte',
    poetBirth: 1818, poetDeath: 1848, year: 1837,
    form: 'Lyric',
  },

  // === Blake — "Auguries" not in DB but "Ah! Sun-flower" and others ===
  {
    file: 'blake-ah-sunflower',
    exportName: 'ahSunflower',
    title: 'Ah! Sun-flower',
    poetryDbTitle: 'Ah Sunflower',
    poet: 'William Blake',
    poetBirth: 1757, poetDeath: 1827, year: 1794,
    form: 'Lyric',
    collection: 'Songs of Experience',
  },
  {
    file: 'blake-the-fly',
    exportName: 'theFly',
    title: 'The Fly',
    poetryDbTitle: 'The Fly',
    poet: 'William Blake',
    poetBirth: 1757, poetDeath: 1827, year: 1794,
    form: 'Lyric',
    collection: 'Songs of Experience',
  },
  {
    file: 'blake-the-little-black-boy',
    exportName: 'theLittleBlackBoy',
    title: 'The Little Black Boy',
    poetryDbTitle: 'The Little Black Boy',
    poet: 'William Blake',
    poetBirth: 1757, poetDeath: 1827, year: 1789,
    form: 'Lyric',
    collection: 'Songs of Innocence',
  },

  // === Whitman — "O Me! O Life!" and "I Sing the Body Electric" are in DB ===
  {
    file: 'whitman-o-me-o-life',
    exportName: 'oMeOLife',
    title: 'O Me! O Life!',
    poetryDbTitle: 'O Me! O Life!',
    poet: 'Walt Whitman',
    poetBirth: 1819, poetDeath: 1892, year: 1867,
    form: 'Free Verse',
    collection: 'Leaves of Grass',
  },
  {
    file: 'whitman-i-sing-the-body-electric',
    exportName: 'iSingTheBodyElectric',
    title: 'I Sing the Body Electric',
    poetryDbTitle: 'I Sing the Body Electric.',
    poet: 'Walt Whitman',
    poetBirth: 1819, poetDeath: 1892, year: 1855,
    form: 'Free Verse',
    collection: 'Leaves of Grass',
  },
  {
    file: 'whitman-passage-to-india',
    exportName: 'passageToIndia',
    title: 'Passage to India',
    poetryDbTitle: 'Passage to India.',
    poet: 'Walt Whitman',
    poetBirth: 1819, poetDeath: 1892, year: 1871,
    form: 'Free Verse',
    collection: 'Leaves of Grass',
    extractLines: [0, 50], // First 50 lines (it's very long)
  },

  // === George Herbert — "Easter Wings", "Peace", "The Flower" are in DB ===
  {
    file: 'herbert-easter-wings',
    exportName: 'easterWings',
    title: 'Easter Wings',
    poetryDbTitle: 'Easter Wings',
    poet: 'George Herbert',
    poetBirth: 1593, poetDeath: 1633, year: 1633,
    form: 'Pattern Poem',
    collection: 'The Temple',
  },
  {
    file: 'herbert-the-flower',
    exportName: 'theFlower',
    title: 'The Flower',
    poetryDbTitle: 'The Flower',
    poet: 'George Herbert',
    poetBirth: 1593, poetDeath: 1633, year: 1633,
    form: 'Lyric',
    collection: 'The Temple',
  },
  {
    file: 'herbert-prayer',
    exportName: 'prayer',
    title: 'Prayer (I)',
    poetryDbTitle: 'Prayer',
    poet: 'George Herbert',
    poetBirth: 1593, poetDeath: 1633, year: 1633,
    form: 'Sonnet',
    collection: 'The Temple',
  },

  // === Ben Jonson ===
  {
    file: 'jonson-song-to-celia',
    exportName: 'songToCelia',
    title: 'Song: To Celia',
    poetryDbTitle: 'Song To Celia - I',
    poet: 'Ben Jonson',
    poetBirth: 1572, poetDeath: 1637, year: 1616,
    form: 'Lyric',
  },
  {
    file: 'jonson-it-is-not-growing-like-a-tree',
    exportName: 'itIsNotGrowingLikeATree',
    title: 'It Is Not Growing Like a Tree',
    poetryDbTitle: 'It Is Not Growing Like A Tree',
    poet: 'Ben Jonson',
    poetBirth: 1572, poetDeath: 1637, year: 1640,
    form: 'Ode (excerpt)',
  },

  // === Andrew Marvell — no "To His Coy Mistress" but has "The Picture Of Little T.C." etc. ===
  // Skip Marvell for now since "Coy Mistress" isn't in DB

  // === Emerson — has "Ode To Beauty" ===
  {
    file: 'emerson-ode-to-beauty',
    exportName: 'odeToBeauty',
    title: 'Ode to Beauty',
    poetryDbTitle: 'Ode To Beauty',
    poet: 'Ralph Waldo Emerson',
    poetBirth: 1803, poetDeath: 1882, year: 1843,
    form: 'Ode',
  },

  // === Byron — "Darkness" already succeeded. Let's add "Don Juan" excerpt ===
  {
    file: 'byron-don-juan-canto1',
    exportName: 'donJuanCanto1Opening',
    title: 'Don Juan (Canto I, Opening)',
    poetryDbTitle: 'Don Juan: Canto the First',
    poet: 'George Gordon, Lord Byron',
    poetBirth: 1788, poetDeath: 1824, year: 1819,
    form: 'Ottava Rima',
    extractLines: [0, 64], // First 8 stanzas
  },

  // === Additional poems from poets already in PoetryDB ===

  // Alexander Pope — "Essay on Man"
  {
    file: 'pope-essay-on-man-epistle1',
    exportName: 'essayOnManEpistle1',
    title: 'An Essay on Man: Epistle I (Excerpt)',
    poetryDbTitle: 'An Essay on Man: Epistle I',
    poet: 'Alexander Pope',
    poetBirth: 1688, poetDeath: 1744, year: 1733,
    form: 'Heroic Couplets',
    extractLines: [0, 50],
  },

  // Pope - Rape of the Lock with correct format
  {
    file: 'pope-rape-of-the-lock-canto1',
    exportName: 'rapeOfTheLockCanto1',
    title: 'The Rape of the Lock (Canto 1)',
    poetryDbTitle: 'The Rape of the Lock: Canto 1',
    poet: 'Alexander Pope',
    poetBirth: 1688, poetDeath: 1744, year: 1712,
    form: 'Mock-Heroic / Heroic Couplets',
  },

  // Rupert Brooke — also has "Peace"
  {
    file: 'brooke-peace',
    exportName: 'peace',
    title: 'Peace',
    poetryDbTitle: 'I. Peace',
    poet: 'Rupert Brooke',
    poetBirth: 1887, poetDeath: 1915, year: 1914,
    form: 'Sonnet',
    collection: '1914 and Other Poems',
  },

  // Shelley — "Remembrance" is there!
  {
    file: 'shelley-remembrance',
    exportName: 'shelleyRemembrance',
    title: 'Remembrance',
    poetryDbTitle: 'Remembrance',
    poet: 'Percy Bysshe Shelley',
    poetBirth: 1792, poetDeath: 1822, year: 1824,
    form: 'Lyric',
  },
];

function escapeForTemplate(text) {
  return text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
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

  // Filter to only missing poems
  const missing = WANTED.filter(p => {
    const filePath = path.join(POEMS_DIR, `${p.file}.ts`);
    return !fs.existsSync(filePath);
  });

  if (missing.length === 0) {
    console.log('All poems already have files. Nothing to fetch.');
    return;
  }

  console.log(`\n${missing.length} poems to fetch:\n`);
  missing.forEach(p => console.log(`  - ${p.poet}: ${p.title} -> ${p.file}.ts`));

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
      let lines = await fetchFromPoetryDB(poem.poet, poem.poetryDbTitle);

      if (!lines) {
        console.log(`  X Not found in PoetryDB\n`);
        failures.push(poem);
        failed++;
        continue;
      }

      // Handle extract options
      if (poem.extractLines) {
        const [start, end] = poem.extractLines;
        lines = lines.slice(start, end);
        console.log(`  Extracted lines ${start}-${end} (${lines.length} lines)`);
      }

      console.log(`  OK ${lines.length} lines fetched`);

      const scaffold = buildScaffold(poem, lines);
      const filePath = path.join(POEMS_DIR, `${poem.file}.ts`);
      fs.writeFileSync(filePath, scaffold, 'utf-8');
      console.log(`  OK Written to ${poem.file}.ts\n`);
      created++;

      await new Promise(r => setTimeout(r, 300));

    } catch (err) {
      console.log(`  X Error: ${err.message}\n`);
      failures.push(poem);
      failed++;
    }
  }

  console.log(`\nDone: ${created} created, ${failed} failed (out of ${missing.length} attempted)`);

  if (failures.length > 0) {
    console.log('\nFailed poems (need manual text):');
    failures.forEach(p => console.log(`  - ${p.poet}: ${p.title} (tried: "${p.poetryDbTitle}")`));
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
