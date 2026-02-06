import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const inputPath = args[0];
const outputPath = args[1] || path.resolve('src', 'data', 'offlineSynonyms.json');

if (!inputPath) {
  console.error('Usage: node scripts/build-offline-synonyms.mjs <input-file> [output-file]');
  process.exit(1);
}

const existing = fs.existsSync(outputPath)
  ? JSON.parse(fs.readFileSync(outputPath, 'utf8'))
  : {};

function normalizeEntry(entry) {
  const word = entry.word?.toLowerCase().trim();
  if (!word) return null;
  const synonyms = (entry.synonyms || []).map(s => s.toLowerCase().trim()).filter(Boolean);
  const antonyms = (entry.antonyms || []).map(s => s.toLowerCase().trim()).filter(Boolean);
  const hyponyms = (entry.hyponyms || []).map(s => s.toLowerCase().trim()).filter(Boolean);
  return { word, synonyms, antonyms, hyponyms };
}

function mergeEntry(target, entry) {
  const existingEntry = target[entry.word] || { synonyms: [], antonyms: [], hyponyms: [] };
  const merged = {
    synonyms: Array.from(new Set([...(existingEntry.synonyms || []), ...entry.synonyms])),
    antonyms: Array.from(new Set([...(existingEntry.antonyms || []), ...entry.antonyms])),
    hyponyms: Array.from(new Set([...(existingEntry.hyponyms || []), ...entry.hyponyms])),
  };
  target[entry.word] = merged;
}

function parseJson(content) {
  const data = JSON.parse(content);
  if (Array.isArray(data)) {
    data.forEach(item => {
      const entry = normalizeEntry(item);
      if (entry) mergeEntry(existing, entry);
    });
    return;
  }
  if (typeof data === 'object') {
    Object.entries(data).forEach(([word, entry]) => {
      const normalized = normalizeEntry({ word, ...entry });
      if (normalized) mergeEntry(existing, normalized);
    });
  }
}

function parseTsv(content) {
  const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
  for (const line of lines) {
    const [word, synStr = '', antStr = '', hypoStr = ''] = line.split('\t');
    const entry = normalizeEntry({
      word,
      synonyms: synStr.split(','),
      antonyms: antStr.split(','),
      hyponyms: hypoStr.split(','),
    });
    if (entry) mergeEntry(existing, entry);
  }
}

const inputContent = fs.readFileSync(inputPath, 'utf8');
if (inputPath.endsWith('.json')) {
  parseJson(inputContent);
} else {
  parseTsv(inputContent);
}

fs.writeFileSync(outputPath, JSON.stringify(existing, null, 2));
console.log(`Merged offline synonyms written to ${outputPath}`);
