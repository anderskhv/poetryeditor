#!/usr/bin/env node
/**
 * fetch-wikisource.mjs — Fetches poems from Wikisource API
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POEMS_DIR = path.join(__dirname, '..', 'src', 'data', 'poems');

const POEMS = [
  {
    page: 'Maud, and other poems/The Charge of the Light Brigade',
    file: 'tennyson-charge-light-brigade',
    exportName: 'chargeOfTheLightBrigade',
    title: 'The Charge of the Light Brigade',
    poet: 'Alfred, Lord Tennyson',
    poetBirth: 1809, poetDeath: 1892, year: 1854,
    form: 'Narrative Poem',
  },
  {
    page: 'Rewards and Fairies/If—',
    file: 'kipling-if',
    exportName: 'ifPoem',
    title: 'If—',
    poet: 'Rudyard Kipling',
    poetBirth: 1865, poetDeath: 1936, year: 1910,
    form: 'Didactic Poem',
    collection: 'Rewards and Fairies',
  },
  {
    page: 'Casey at the Bat',
    file: 'thayer-casey-at-the-bat',
    exportName: 'caseyAtTheBat',
    title: 'Casey at the Bat',
    poet: 'Ernest Lawrence Thayer',
    poetBirth: 1863, poetDeath: 1940, year: 1888,
    form: 'Ballad',
  },
];

async function fetchWikisource(pageTitle) {
  const url = `https://en.wikisource.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=revisions&rvprop=content&format=json&rvslots=main`;
  const res = await fetch(url);
  const j = await res.json();
  const pages = j.query.pages;
  const id = Object.keys(pages)[0];
  if (pages[id].missing !== undefined) return null;
  return pages[id].revisions[0].slots.main['*'];
}

function extractPoem(wikitext) {
  const match = wikitext.match(/<poem>([\s\S]*?)<\/poem>/);
  if (match) return match[1].trim();
  return null;
}

function cleanWikiMarkup(text) {
  return text
    .replace(/''''/g, '')
    .replace(/'''/g, '')
    .replace(/''/g, '')
    .replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2')
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/<ref[^>]*>.*?<\/ref>/gs, '')
    .replace(/<ref[^>]*\/>/g, '')
    .replace(/<br\s*\/?>/g, '')
    .split('\n')
    .map(l => l.trimEnd())
    .join('\n');
}

function escapeTemplate(text) {
  return text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function writeScaffold(poem, poemText) {
  const lineCount = poemText.split('\n').length;
  const escaped = escapeTemplate(poemText);

  const content = `import { PoemAnalysis } from './index';

export const ${poem.exportName}: PoemAnalysis = {
  slug: '${poem.file}',
  title: '${poem.title.replace(/'/g, "\\'")}',
  poet: '${poem.poet.replace(/'/g, "\\'")}',
  poetBirth: ${poem.poetBirth},
  poetDeath: ${poem.poetDeath},
  year: ${poem.year},
${poem.collection ? `  collection: '${poem.collection.replace(/'/g, "\\'")}',\n` : ''}  form: '${poem.form}',
  text: \`${escaped}\`,
  // ${lineCount} lines
  analysis: {
    overview: 'TODO',
    lineByLine: [{ lines: '1-4', commentary: 'TODO' }],
    themes: ['TODO'],
    literaryDevices: [{ device: 'TODO', example: 'TODO', explanation: 'TODO' }],
    historicalContext: 'TODO',
  },
  seoDescription: 'TODO',
  abstractWords: [],
  rhymingPairs: [],
};
`;

  const filePath = path.join(POEMS_DIR, `${poem.file}.ts`);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`  ✓ Written ${poem.file}.ts (${lineCount} lines)`);
}

async function main() {
  for (const poem of POEMS) {
    const filePath = path.join(POEMS_DIR, `${poem.file}.ts`);
    if (fs.existsSync(filePath)) {
      console.log(`[SKIP] ${poem.file}.ts already exists`);
      continue;
    }

    console.log(`\n[${poem.poet}] "${poem.title}"`);
    console.log(`  Wikisource page: ${poem.page}`);

    const wikitext = await fetchWikisource(poem.page);
    if (!wikitext) {
      console.log('  ✗ Page not found');
      continue;
    }

    const raw = extractPoem(wikitext);
    if (!raw) {
      console.log('  ✗ No <poem> tags found');
      console.log('  First 300 chars:', wikitext.substring(0, 300));
      continue;
    }

    const cleaned = cleanWikiMarkup(raw);
    console.log(`  ✓ Extracted ${cleaned.split('\n').length} lines`);
    writeScaffold(poem, cleaned);

    await new Promise(r => setTimeout(r, 500));
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
