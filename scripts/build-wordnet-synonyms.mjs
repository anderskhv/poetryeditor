import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// 1. Load CMU dict and build a Set of valid English words
const cmuPath = path.join(ROOT, 'public', 'cmudict.dict');
const cmuLines = fs.readFileSync(cmuPath, 'utf-8').split('\n');
const validWords = new Set();

for (const line of cmuLines) {
  if (!line || line.startsWith(';;;')) continue;
  const spaceIdx = line.indexOf(' ');
  if (spaceIdx === -1) continue;
  let word = line.slice(0, spaceIdx);
  // Skip variants like WORD(2)
  if (word.includes('(')) continue;
  word = word.toLowerCase();
  // Filter: [a-z][a-z'-]+, length 2-18
  if (word.length < 2 || word.length > 18) continue;
  if (!/^[a-z][a-z'-]+$/.test(word)) continue;
  validWords.add(word);
}

console.log(`CMU dict: ${validWords.size} valid words`);

// 2. Read all WordNet JSON files
const wordnetDir = path.join(ROOT, 'public', 'wordnet-senses');
const jsonFiles = fs.readdirSync(wordnetDir).filter(f => f.endsWith('.json'));

console.log(`WordNet files: ${jsonFiles.length}`);

// 3. Process WordNet entries — use Map to avoid prototype pollution
const wordnetData = new Map(); // word -> Set of synonyms

for (const file of jsonFiles) {
  const filePath = path.join(wordnetDir, file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    console.warn(`  Skipping malformed file: ${file}`);
    continue;
  }

  for (const [word, senses] of Object.entries(data)) {
    // Skip multi-word entries
    if (word.includes(' ')) continue;

    const lowerWord = word.toLowerCase();

    // Skip if not in CMU dict
    if (!validWords.has(lowerWord)) continue;

    if (!Array.isArray(senses)) continue;

    if (!wordnetData.has(lowerWord)) {
      wordnetData.set(lowerWord, new Set());
    }
    const synonymSet = wordnetData.get(lowerWord);

    for (const sense of senses) {
      if (!sense.synonyms || !Array.isArray(sense.synonyms)) continue;
      for (const syn of sense.synonyms) {
        const synWord = (typeof syn === 'string' ? syn : syn.word)?.toLowerCase();
        if (!synWord) continue;
        // Skip multi-word synonyms
        if (synWord.includes(' ')) continue;
        // Must be in CMU dict
        if (!validWords.has(synWord)) continue;
        // Don't add self
        if (synWord !== lowerWord) {
          synonymSet.add(synWord);
        }
      }
    }
  }
}

// Remove entries with no synonyms
for (const [word, syns] of wordnetData.entries()) {
  if (syns.size === 0) wordnetData.delete(word);
}

console.log(`WordNet entries with synonyms: ${wordnetData.size}`);

// 4. Load existing overrides
const overridesPath = path.join(ROOT, 'src', 'data', 'offlineSynonyms.json');
const overrides = JSON.parse(fs.readFileSync(overridesPath, 'utf-8'));
const overrideCount = Object.keys(overrides).length;

console.log(`Override entries: ${overrideCount}`);

// 5. Merge: overrides take priority
const result = new Map();

// Add all WordNet entries
for (const [word, synSet] of wordnetData.entries()) {
  if (overrides[word]) continue; // override takes priority
  result.set(word, { synonyms: Array.from(synSet).sort() });
}

// Add all override entries
for (const [word, entry] of Object.entries(overrides)) {
  result.set(word, entry);
}

// 6. Sort keys alphabetically and write to plain object
const sorted = {};
for (const key of Array.from(result.keys()).sort()) {
  sorted[key] = result.get(key);
}

// 7. Write output (minified)
const output = JSON.stringify(sorted);
fs.writeFileSync(overridesPath, output, 'utf-8');

// 8. Print stats
const totalEntries = Object.keys(sorted).length;
const wordnetOnlyEntries = totalEntries - overrideCount;

console.log('');
console.log('=== Build Complete ===');
console.log(`Total entries: ${totalEntries}`);
console.log(`From WordNet: ${wordnetOnlyEntries}`);
console.log(`From overrides: ${overrideCount}`);
console.log(`Output: ${overridesPath}`);
console.log(`File size: ${(Buffer.byteLength(output) / 1024).toFixed(1)} KB`);
