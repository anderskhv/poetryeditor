#!/usr/bin/env node
/**
 * fetch-poems-batch2-final.mjs — Final 3 remaining poems with corrected titles
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POEMS_DIR = path.join(__dirname, '..', 'src', 'data', 'poems');

const WANTED = [
  {
    file: 'byron-don-juan-canto1',
    exportName: 'donJuanCanto1Opening',
    title: 'Don Juan (Canto I, Opening)',
    poetryDbTitle: 'Don Juan',
    poet: 'George Gordon, Lord Byron',
    poetBirth: 1788, poetDeath: 1824, year: 1819,
    form: 'Ottava Rima',
    extractLines: [0, 64], // First 8 stanzas
  },
  {
    file: 'pope-essay-on-man-epistle1',
    exportName: 'essayOnManEpistle1',
    title: 'An Essay on Man (Epistle I, Excerpt)',
    poetryDbTitle: 'An Essay on Man',
    poet: 'Alexander Pope',
    poetBirth: 1688, poetDeath: 1744, year: 1733,
    form: 'Heroic Couplets',
    extractLines: [0, 50],
  },
  {
    file: 'pope-rape-of-the-lock-canto1',
    exportName: 'rapeOfTheLockCanto1',
    title: 'The Rape of the Lock (Canto 1)',
    poetryDbTitle: 'The Rape of the Lock:',
    poet: 'Alexander Pope',
    poetBirth: 1688, poetDeath: 1744, year: 1712,
    form: 'Mock-Heroic / Heroic Couplets',
    extractLines: [0, 142], // Canto 1 is ~142 lines
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
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.status === 404 || !Array.isArray(data) || data.length === 0) return null;
  return data[0].lines;
}

async function main() {
  const missing = WANTED.filter(p => !fs.existsSync(path.join(POEMS_DIR, `${p.file}.ts`)));

  if (missing.length === 0) {
    console.log('All poems already have files.');
    return;
  }

  let created = 0, failed = 0;

  for (const poem of missing) {
    console.log(`[${poem.poet}] "${poem.title}"`);
    try {
      let lines = await fetchFromPoetryDB(poem.poet, poem.poetryDbTitle);
      if (!lines) { console.log('  X Not found\n'); failed++; continue; }

      if (poem.extractLines) {
        const [start, end] = poem.extractLines;
        lines = lines.slice(start, end);
        console.log(`  Extracted lines ${start}-${end} (${lines.length} lines from ${lines.length} total)`);
      }

      const scaffold = buildScaffold(poem, lines);
      fs.writeFileSync(path.join(POEMS_DIR, `${poem.file}.ts`), scaffold, 'utf-8');
      console.log(`  OK ${lines.length} lines -> ${poem.file}.ts\n`);
      created++;
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.log(`  X Error: ${err.message}\n`);
      failed++;
    }
  }

  console.log(`\nDone: ${created} created, ${failed} failed`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
