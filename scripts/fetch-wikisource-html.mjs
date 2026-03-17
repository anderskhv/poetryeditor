#!/usr/bin/env node
/**
 * fetch-wikisource-html.mjs — Fetches poems from Wikisource rendered HTML API
 * Works with ProofreadPage format (scan-based pages that don't have <poem> tags in wikitext)
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
    startMarker: 'Half a league',
    endMarker: 'Left of six hundred',
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
    startMarker: 'If you can keep your head',
    endMarker: "you'll be a Man",
  },
  {
    page: 'Casey at the Bat (1912)',
    file: 'thayer-casey-at-the-bat',
    exportName: 'caseyAtTheBat',
    title: 'Casey at the Bat',
    poet: 'Ernest Lawrence Thayer',
    poetBirth: 1863, poetDeath: 1940, year: 1888,
    form: 'Ballad',
    startMarker: 'looked extremely rocky',
    endMarker: 'Casey has struck out',
  },
];

async function fetchRenderedHTML(pageTitle) {
  const url = `https://en.wikisource.org/w/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&prop=text&format=json&disabletoc=true`;
  const res = await fetch(url);
  const j = await res.json();
  if (j.error) return null;
  return j.parse.text['*'];
}

function htmlToLines(html) {
  let text = html;
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n');
  text = text.replace(/<[^>]+>/g, '');
  // Decode HTML entities
  text = text.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#160;/g, ' ').replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'").replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    .replace(/&#8212;/g, '—').replace(/&#8211;/g, '–')
    .replace(/&#32;/g, ' ')
    .replace(/\u200B/g, '').replace(/\u00A0/g, ' ');
  return text.split('\n').map(l => l.trimEnd());
}

function extractBetweenMarkers(lines, startMarker, endMarker) {
  let start = -1, end = -1;
  for (let i = 0; i < lines.length; i++) {
    if (start === -1 && lines[i].includes(startMarker)) start = i;
    if (start !== -1 && lines[i].includes(endMarker)) { end = i; break; }
  }
  if (start === -1 || end === -1) return null;
  return lines.slice(start, end + 1).filter(l => l.trim()).join('\n');
}

function escapeForTemplate(text) {
  return text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function writeScaffold(poem, poemText) {
  const lineCount = poemText.split('\n').length;
  const escaped = escapeForTemplate(poemText);

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

    const html = await fetchRenderedHTML(poem.page);
    if (!html) {
      console.log('  ✗ Failed to fetch page');
      continue;
    }

    const lines = htmlToLines(html);
    const poemText = extractBetweenMarkers(lines, poem.startMarker, poem.endMarker);

    if (!poemText) {
      console.log('  ✗ Could not find poem between markers');
      continue;
    }

    console.log(`  ✓ Extracted ${poemText.split('\n').length} lines`);
    writeScaffold(poem, poemText);

    await new Promise(r => setTimeout(r, 500));
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
