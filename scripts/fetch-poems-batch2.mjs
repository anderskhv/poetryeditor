#!/usr/bin/env node
/**
 * fetch-poems-batch2.mjs — Batch 2: ~50 more public domain poems
 *
 * Adds poems from poets not heavily represented in batch 1.
 * All poems are public domain (pre-1928 US publication, authors dead 70+ years).
 *
 * Usage:
 *   node scripts/fetch-poems-batch2.mjs              # fetch all missing poems
 *   node scripts/fetch-poems-batch2.mjs --list       # just show what would be fetched
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POEMS_DIR = path.join(__dirname, '..', 'src', 'data', 'poems');

const WANTED = [
  // === Walt Whitman (3 existing: O Captain, Noiseless Spider, I Hear America Singing) ===
  {
    file: 'whitman-song-of-myself-52',
    exportName: 'songOfMyself52',
    title: 'Song of Myself, 52',
    poetryDbTitle: 'Song of Myself',
    poet: 'Walt Whitman',
    poetBirth: 1819, poetDeath: 1892, year: 1855,
    form: 'Free Verse',
    collection: 'Leaves of Grass',
    extractSection: 52, // We'll extract section 52 from the full poem
  },
  {
    file: 'whitman-crossing-brooklyn-ferry',
    exportName: 'crossingBrooklynFerry',
    title: 'Crossing Brooklyn Ferry',
    poetryDbTitle: 'Crossing Brooklyn Ferry',
    poet: 'Walt Whitman',
    poetBirth: 1819, poetDeath: 1892, year: 1856,
    form: 'Free Verse',
    collection: 'Leaves of Grass',
  },

  // === William Butler Yeats (5 existing) ===
  {
    file: 'yeats-easter-1916',
    exportName: 'easter1916',
    title: 'Easter, 1916',
    poetryDbTitle: 'Easter, 1916',
    poet: 'William Butler Yeats',
    poetBirth: 1865, poetDeath: 1939, year: 1921,
    form: 'Lyric',
  },
  {
    file: 'yeats-sailing-to-byzantium',
    exportName: 'sailingToByzantium',
    title: 'Sailing to Byzantium',
    poetryDbTitle: 'Sailing to Byzantium',
    poet: 'William Butler Yeats',
    poetBirth: 1865, poetDeath: 1939, year: 1928,
    form: 'Ottava Rima',
    collection: 'The Tower',
  },
  {
    file: 'yeats-among-school-children',
    exportName: 'amongSchoolChildren',
    title: 'Among School Children',
    poetryDbTitle: 'Among School Children',
    poet: 'William Butler Yeats',
    poetBirth: 1865, poetDeath: 1939, year: 1928,
    form: 'Ottava Rima',
    collection: 'The Tower',
  },

  // === Robert Frost (5 existing) ===
  {
    file: 'frost-mending-wall',
    exportName: 'mendingWall',
    title: 'Mending Wall',
    poetryDbTitle: 'Mending Wall',
    poet: 'Robert Frost',
    poetBirth: 1874, poetDeath: 1963, year: 1914,
    form: 'Blank Verse',
    collection: 'North of Boston',
  },
  {
    file: 'frost-birches',
    exportName: 'birches',
    title: 'Birches',
    poetryDbTitle: 'Birches',
    poet: 'Robert Frost',
    poetBirth: 1874, poetDeath: 1963, year: 1916,
    form: 'Blank Verse',
    collection: 'Mountain Interval',
  },
  {
    file: 'frost-after-apple-picking',
    exportName: 'afterApplePicking',
    title: 'After Apple-Picking',
    poetryDbTitle: 'After Apple-Picking',
    poet: 'Robert Frost',
    poetBirth: 1874, poetDeath: 1963, year: 1914,
    form: 'Blank Verse (irregular)',
    collection: 'North of Boston',
  },
  {
    file: 'frost-desert-places',
    exportName: 'desertPlaces',
    title: 'Desert Places',
    poetryDbTitle: 'Desert Places',
    poet: 'Robert Frost',
    poetBirth: 1874, poetDeath: 1963, year: 1936,
    form: 'Lyric',
    collection: 'A Further Range',
  },

  // === Emily Bronte ===
  {
    file: 'bronte-remembrance',
    exportName: 'remembrance',
    title: 'Remembrance',
    poetryDbTitle: 'Remembrance',
    poet: 'Emily Bronte',
    poetBirth: 1818, poetDeath: 1848, year: 1846,
    form: 'Elegy',
  },

  // === Elizabeth Barrett Browning (1 existing: Sonnet 43) ===
  // Aurora Leigh is very long, unlikely on PoetryDB. Trying a well-known shorter poem instead.
  {
    file: 'browning-eb-grief',
    exportName: 'grief',
    title: 'Grief',
    poetryDbTitle: 'Grief',
    poet: 'Elizabeth Barrett Browning',
    poetBirth: 1806, poetDeath: 1861, year: 1844,
    form: 'Sonnet',
  },

  // === John Milton ===
  {
    file: 'milton-on-his-blindness',
    exportName: 'onHisBlindness',
    title: 'On His Blindness',
    poetryDbTitle: 'On His Blindness',
    poet: 'John Milton',
    poetBirth: 1608, poetDeath: 1674, year: 1673,
    form: 'Petrarchan Sonnet',
  },
  {
    file: 'milton-paradise-lost-book1-opening',
    exportName: 'paradiseLostOpening',
    title: 'Paradise Lost (Book I, Opening)',
    poetryDbTitle: 'Paradise Lost: Book  1',
    poet: 'John Milton',
    poetBirth: 1608, poetDeath: 1674, year: 1667,
    form: 'Epic / Blank Verse',
    extractLines: [0, 26], // First 26 lines (the invocation)
  },

  // === Alexander Pope ===
  {
    file: 'pope-rape-of-the-lock-canto1',
    exportName: 'rapeOfTheLockCanto1',
    title: 'The Rape of the Lock (Canto 1)',
    poetryDbTitle: 'The Rape of the Lock: Canto 1',
    poet: 'Alexander Pope',
    poetBirth: 1688, poetDeath: 1744, year: 1712,
    form: 'Mock-Heroic / Heroic Couplets',
  },
  {
    file: 'pope-essay-on-criticism-excerpts',
    exportName: 'essayOnCriticism',
    title: 'An Essay on Criticism (Excerpts)',
    poetryDbTitle: 'An Essay on Criticism',
    poet: 'Alexander Pope',
    poetBirth: 1688, poetDeath: 1744, year: 1711,
    form: 'Heroic Couplets',
    extractLines: [0, 50], // First 50 lines
  },

  // === Lord Byron (1 existing: She Walks in Beauty) ===
  {
    file: 'byron-darkness',
    exportName: 'darkness',
    title: 'Darkness',
    poetryDbTitle: 'Darkness',
    poet: 'Lord Byron',
    poetBirth: 1788, poetDeath: 1824, year: 1816,
    form: 'Blank Verse',
  },

  // === William Blake (8 existing) ===
  {
    file: 'blake-auguries-of-innocence',
    exportName: 'auguriesOfInnocence',
    title: 'Auguries of Innocence',
    poetryDbTitle: 'Auguries of Innocence',
    poet: 'William Blake',
    poetBirth: 1757, poetDeath: 1827, year: 1863,
    form: 'Couplets',
  },

  // === Thomas Hardy (2 existing) ===
  {
    file: 'hardy-convergence-of-the-twain',
    exportName: 'convergenceOfTheTwain',
    title: 'The Convergence of the Twain',
    poetryDbTitle: 'The Convergence of the Twain',
    poet: 'Thomas Hardy',
    poetBirth: 1840, poetDeath: 1928, year: 1912,
    form: 'Lyric',
  },
  {
    file: 'hardy-in-time-of-breaking-of-nations',
    exportName: 'inTimeOfBreakingOfNations',
    title: 'In Time of "The Breaking of Nations"',
    poetryDbTitle: 'In Time of "The Breaking of Nations"',
    poet: 'Thomas Hardy',
    poetBirth: 1840, poetDeath: 1928, year: 1915,
    form: 'Lyric',
  },

  // === Langston Hughes (4 existing) ===
  {
    file: 'hughes-harlem',
    exportName: 'harlem',
    title: 'Harlem',
    poetryDbTitle: 'Harlem',
    poet: 'Langston Hughes',
    poetBirth: 1901, poetDeath: 1967, year: 1951,
    form: 'Free Verse',
    collection: 'Montage of a Dream Deferred',
  },
  {
    file: 'hughes-weary-blues',
    exportName: 'wearyBlues',
    title: 'The Weary Blues',
    poetryDbTitle: 'The Weary Blues',
    poet: 'Langston Hughes',
    poetBirth: 1901, poetDeath: 1967, year: 1926,
    form: 'Blues Poem',
    collection: 'The Weary Blues',
  },

  // === Claude McKay ===
  {
    file: 'mckay-if-we-must-die',
    exportName: 'ifWeMustDie',
    title: 'If We Must Die',
    poetryDbTitle: 'If We Must Die',
    poet: 'Claude McKay',
    poetBirth: 1889, poetDeath: 1948, year: 1919,
    form: 'Shakespearean Sonnet',
  },

  // === Countee Cullen ===
  {
    file: 'cullen-yet-do-i-marvel',
    exportName: 'yetDoIMarvel',
    title: 'Yet Do I Marvel',
    poetryDbTitle: 'Yet Do I Marvel',
    poet: 'Countee Cullen',
    poetBirth: 1903, poetDeath: 1946, year: 1925,
    form: 'Shakespearean Sonnet',
    collection: 'Color',
  },
  {
    file: 'cullen-incident',
    exportName: 'incident',
    title: 'Incident',
    poetryDbTitle: 'Incident',
    poet: 'Countee Cullen',
    poetBirth: 1903, poetDeath: 1946, year: 1925,
    form: 'Ballad',
    collection: 'Color',
  },

  // === Edna St. Vincent Millay (2 existing: First Fig, What Lips) ===
  {
    file: 'millay-renascence',
    exportName: 'renascence',
    title: 'Renascence',
    poetryDbTitle: 'Renascence',
    poet: 'Edna St. Vincent Millay',
    poetBirth: 1892, poetDeath: 1950, year: 1912,
    form: 'Narrative Lyric',
    collection: 'Renascence and Other Poems',
  },
  {
    file: 'millay-love-is-not-all',
    exportName: 'loveIsNotAll',
    title: 'Love Is Not All',
    poetryDbTitle: 'Love is not all',
    poet: 'Edna St. Vincent Millay',
    poetBirth: 1892, poetDeath: 1950, year: 1931,
    form: 'Petrarchan Sonnet',
    collection: 'Fatal Interview',
  },

  // === Carl Sandburg (1 existing: Fog) ===
  {
    file: 'sandburg-chicago',
    exportName: 'chicago',
    title: 'Chicago',
    poetryDbTitle: 'Chicago',
    poet: 'Carl Sandburg',
    poetBirth: 1878, poetDeath: 1967, year: 1914,
    form: 'Free Verse',
    collection: 'Chicago Poems',
  },
  {
    file: 'sandburg-grass',
    exportName: 'grass',
    title: 'Grass',
    poetryDbTitle: 'Grass',
    poet: 'Carl Sandburg',
    poetBirth: 1878, poetDeath: 1967, year: 1918,
    form: 'Free Verse',
    collection: 'Cornhuskers',
  },

  // === Amy Lowell ===
  {
    file: 'lowell-patterns',
    exportName: 'patterns',
    title: 'Patterns',
    poetryDbTitle: 'Patterns',
    poet: 'Amy Lowell',
    poetBirth: 1874, poetDeath: 1925, year: 1916,
    form: 'Free Verse',
    collection: 'Men, Women and Ghosts',
  },

  // === Sara Teasdale (3 existing) ===
  {
    file: 'teasdale-let-it-be-forgotten',
    exportName: 'letItBeForgotten',
    title: 'Let It Be Forgotten',
    poetryDbTitle: 'Let It Be Forgotten',
    poet: 'Sara Teasdale',
    poetBirth: 1884, poetDeath: 1933, year: 1921,
    form: 'Lyric',
    collection: 'Flame and Shadow',
  },

  // === Ella Wheeler Wilcox ===
  {
    file: 'wilcox-solitude',
    exportName: 'solitude',
    title: 'Solitude',
    poetryDbTitle: 'Solitude',
    poet: 'Ella Wheeler Wilcox',
    poetBirth: 1850, poetDeath: 1919, year: 1883,
    form: 'Lyric',
  },

  // === Edgar Lee Masters ===
  {
    file: 'masters-lucinda-matlock',
    exportName: 'lucindaMatlock',
    title: 'Lucinda Matlock',
    poetryDbTitle: 'Lucinda Matlock',
    poet: 'Edgar Lee Masters',
    poetBirth: 1868, poetDeath: 1950, year: 1915,
    form: 'Dramatic Monologue',
    collection: 'Spoon River Anthology',
  },
  {
    file: 'masters-anne-rutledge',
    exportName: 'anneRutledge',
    title: 'Anne Rutledge',
    poetryDbTitle: 'Anne Rutledge',
    poet: 'Edgar Lee Masters',
    poetBirth: 1868, poetDeath: 1950, year: 1915,
    form: 'Epitaph / Free Verse',
    collection: 'Spoon River Anthology',
  },
  {
    file: 'masters-george-gray',
    exportName: 'georgeGray',
    title: 'George Gray',
    poetryDbTitle: 'George Gray',
    poet: 'Edgar Lee Masters',
    poetBirth: 1868, poetDeath: 1950, year: 1915,
    form: 'Dramatic Monologue',
    collection: 'Spoon River Anthology',
  },

  // === Oliver Wendell Holmes ===
  {
    file: 'holmes-old-ironsides',
    exportName: 'oldIronsides',
    title: 'Old Ironsides',
    poetryDbTitle: 'Old Ironsides',
    poet: 'Oliver Wendell Holmes',
    poetBirth: 1809, poetDeath: 1894, year: 1830,
    form: 'Lyric',
  },

  // === Henry Wadsworth Longfellow (1 existing: Arrow and Song) ===
  {
    file: 'longfellow-paul-reveres-ride',
    exportName: 'paulReveresRide',
    title: "Paul Revere's Ride",
    poetryDbTitle: "Paul Revere's Ride",
    poet: 'Henry Wadsworth Longfellow',
    poetBirth: 1807, poetDeath: 1882, year: 1861,
    form: 'Narrative Poem',
    collection: 'Tales of a Wayside Inn',
  },
  {
    file: 'longfellow-psalm-of-life',
    exportName: 'psalmOfLife',
    title: 'A Psalm of Life',
    poetryDbTitle: 'A Psalm of Life',
    poet: 'Henry Wadsworth Longfellow',
    poetBirth: 1807, poetDeath: 1882, year: 1838,
    form: 'Lyric',
    collection: 'Voices of the Night',
  },

  // === Rupert Brooke ===
  {
    file: 'brooke-the-soldier',
    exportName: 'theSoldier',
    title: 'The Soldier',
    poetryDbTitle: 'The Soldier',
    poet: 'Rupert Brooke',
    poetBirth: 1887, poetDeath: 1915, year: 1914,
    form: 'Petrarchan Sonnet',
    collection: '1914 and Other Poems',
  },

  // === Wilfred Owen ===
  {
    file: 'owen-dulce-et-decorum-est',
    exportName: 'dulceEtDecorumEst',
    title: 'Dulce et Decorum Est',
    poetryDbTitle: 'Dulce Et Decorum Est',
    poet: 'Wilfred Owen',
    poetBirth: 1893, poetDeath: 1918, year: 1920,
    form: 'War Poem / Near-Sonnet',
  },
  {
    file: 'owen-anthem-for-doomed-youth',
    exportName: 'anthemForDoomedYouth',
    title: 'Anthem for Doomed Youth',
    poetryDbTitle: 'Anthem for Doomed Youth',
    poet: 'Wilfred Owen',
    poetBirth: 1893, poetDeath: 1918, year: 1920,
    form: 'Petrarchan Sonnet',
  },

  // === Ralph Waldo Emerson ===
  {
    file: 'emerson-concord-hymn',
    exportName: 'concordHymn',
    title: 'Concord Hymn',
    poetryDbTitle: 'Concord Hymn',
    poet: 'Ralph Waldo Emerson',
    poetBirth: 1803, poetDeath: 1882, year: 1837,
    form: 'Hymn / Ballad Stanza',
  },

  // === A.E. Housman ===
  {
    file: 'housman-to-an-athlete-dying-young',
    exportName: 'toAnAthleteDyingYoung',
    title: 'To an Athlete Dying Young',
    poetryDbTitle: 'To an Athlete Dying Young',
    poet: 'A.E. Housman',
    poetBirth: 1859, poetDeath: 1936, year: 1896,
    form: 'Elegy',
    collection: 'A Shropshire Lad',
  },
  {
    file: 'housman-loveliest-of-trees',
    exportName: 'loveliestOfTrees',
    title: 'Loveliest of Trees, the Cherry Now',
    poetryDbTitle: 'Loveliest of trees, the cherry now',
    poet: 'A.E. Housman',
    poetBirth: 1859, poetDeath: 1936, year: 1896,
    form: 'Lyric',
    collection: 'A Shropshire Lad',
  },

  // === Additional breadth poets ===

  // Robert Browning (not Elizabeth)
  {
    file: 'browning-rb-my-last-duchess',
    exportName: 'myLastDuchess',
    title: 'My Last Duchess',
    poetryDbTitle: 'My Last Duchess',
    poet: 'Robert Browning',
    poetBirth: 1812, poetDeath: 1889, year: 1842,
    form: 'Dramatic Monologue',
    collection: 'Dramatic Lyrics',
  },

  // Andrew Marvell
  {
    file: 'marvell-to-his-coy-mistress',
    exportName: 'toHisCoyMistress',
    title: 'To His Coy Mistress',
    poetryDbTitle: 'To His Coy Mistress',
    poet: 'Andrew Marvell',
    poetBirth: 1621, poetDeath: 1678, year: 1681,
    form: 'Carpe Diem Poem',
  },

  // George Herbert
  {
    file: 'herbert-the-pulley',
    exportName: 'thePulley',
    title: 'The Pulley',
    poetryDbTitle: 'The Pulley',
    poet: 'George Herbert',
    poetBirth: 1593, poetDeath: 1633, year: 1633,
    form: 'Metaphysical Lyric',
    collection: 'The Temple',
  },

  // Edmund Spenser
  {
    file: 'spenser-one-day-i-wrote-her-name',
    exportName: 'oneDayIWroteHerName',
    title: 'Amoretti LXXV: One Day I Wrote Her Name',
    poetryDbTitle: 'Sonnet 75: One day I wrote her name upon the strand',
    poet: 'Edmund Spenser',
    poetBirth: 1552, poetDeath: 1599, year: 1595,
    form: 'Spenserian Sonnet',
    collection: 'Amoretti',
  },

  // Ben Jonson
  {
    file: 'jonson-on-my-first-son',
    exportName: 'onMyFirstSon',
    title: 'On My First Son',
    poetryDbTitle: 'On My First Son',
    poet: 'Ben Jonson',
    poetBirth: 1572, poetDeath: 1637, year: 1616,
    form: 'Epigram / Elegy',
  },

  // Robert Herrick
  {
    file: 'herrick-to-the-virgins',
    exportName: 'toTheVirgins',
    title: 'To the Virgins, to Make Much of Time',
    poetryDbTitle: 'To the Virgins, to Make Much of Time',
    poet: 'Robert Herrick',
    poetBirth: 1591, poetDeath: 1674, year: 1648,
    form: 'Carpe Diem Lyric',
    collection: 'Hesperides',
  },

  // Dunbar (Paul Laurence) — 1 existing
  {
    file: 'dunbar-sympathy',
    exportName: 'sympathy',
    title: 'Sympathy',
    poetryDbTitle: 'Sympathy',
    poet: 'Paul Laurence Dunbar',
    poetBirth: 1872, poetDeath: 1906, year: 1899,
    form: 'Lyric',
    collection: 'Lyrics of the Hearthside',
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

  let toFetch = WANTED;

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
        console.log(`  X Not found in PoetryDB — will need manual text\n`);
        failures.push(poem);
        failed++;
        continue;
      }

      // Handle extract options
      if (poem.extractSection) {
        // For Song of Myself section 52: find the last section
        // Section 52 starts with "The spotted hawk swoops by"
        const sectionStart = lines.findIndex(l => l.match(/spotted hawk/i));
        if (sectionStart >= 0) {
          lines = lines.slice(sectionStart);
          console.log(`  Extracted section ${poem.extractSection} (${lines.length} lines from full poem)`);
        } else {
          console.log(`  Warning: Could not find section ${poem.extractSection}, using last 30 lines`);
          lines = lines.slice(-30);
        }
      } else if (poem.extractLines) {
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

      // Be polite to the API
      await new Promise(r => setTimeout(r, 300));

    } catch (err) {
      console.log(`  X Error: ${err.message}\n`);
      failures.push(poem);
      failed++;
    }
  }

  console.log(`\nDone: ${created} created, ${failed} failed (out of ${missing.length} attempted)`);

  if (failures.length > 0) {
    console.log('\nFailed poems (need manual text or Gutenberg/Wikisource fallback):');
    failures.forEach(p => console.log(`  - ${p.poet}: ${p.title} (${p.poetryDbTitle})`));
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
