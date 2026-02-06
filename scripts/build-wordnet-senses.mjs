import fs from 'fs';
import path from 'path';
import wordnetDb from 'wordnet-db';

const outputDir = path.resolve('public', 'wordnet-senses');
const dictPath = wordnetDb.path;

const POS_LABELS = {
  n: 'noun',
  v: 'verb',
  a: 'adj',
  r: 'adv',
};

const DATA_FILES = {
  n: 'data.noun',
  v: 'data.verb',
  a: 'data.adj',
  r: 'data.adv',
};

const INDEX_FILES = {
  n: 'index.noun',
  v: 'index.verb',
  a: 'index.adj',
  r: 'index.adv',
};

const normalizeWord = (value) =>
  value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getPrefix = (value) => {
  const letters = value.replace(/[^a-z]/g, '');
  if (!letters) return '__';
  return letters.slice(0, 2).padEnd(2, '_');
};

const parseDataFile = (filePath, posCode) => {
  const data = new Map();
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  for (const line of lines) {
    if (!line || line.startsWith('  ') || line.startsWith('#')) continue;
    const [meta, glossPart = ''] = line.split(' | ');
    const parts = meta.split(' ');
    if (parts.length < 5) continue;
    const offset = parts[0];
    const wCountHex = parts[3];
    const wordCount = parseInt(wCountHex, 16);
    const words = [];
    for (let i = 0; i < wordCount; i += 1) {
      const word = parts[4 + i * 2];
      if (word) {
        words.push(normalizeWord(word));
      }
    }
    const gloss = glossPart.trim();
    data.set(offset, {
      words,
      gloss,
      pos: POS_LABELS[posCode],
    });
  }
  return data;
};

const parseIndexFile = (filePath) => {
  const entries = [];
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  for (const line of lines) {
    if (!line || line.startsWith('  ') || line.startsWith('#')) continue;
    const parts = line.trim().split(/\s+/);
    if (parts.length < 6) continue;
    const lemma = normalizeWord(parts[0]);
    const pos = parts[1];
    const pointerCount = parseInt(parts[3], 10);
    const senseIndex = 4 + pointerCount;
    const offsets = parts.slice(senseIndex + 2);
    entries.push({ lemma, pos, offsets });
  }
  return entries;
};

const buildSenses = () => {
  const dataMaps = {};
  Object.entries(DATA_FILES).forEach(([pos, filename]) => {
    const filePath = path.join(dictPath, filename);
    dataMaps[pos] = parseDataFile(filePath, pos);
  });

  const wordMap = new Map();
  Object.entries(INDEX_FILES).forEach(([pos, filename]) => {
    const indexPath = path.join(dictPath, filename);
    const entries = parseIndexFile(indexPath);
    const dataMap = dataMaps[pos];
    for (const entry of entries) {
      if (!entry.offsets.length) continue;
      const senses = [];
      const seen = new Set();
      entry.offsets.forEach((offset, senseIdx) => {
        const synset = dataMap.get(offset);
        if (!synset) return;
        const gloss = synset.gloss.split(';')[0]?.trim() || 'General meaning';
        const synonyms = synset.words
          .filter(word => word !== entry.lemma)
          .filter(word => {
            if (seen.has(word)) return false;
            seen.add(word);
            return true;
          })
          .map((word, idx) => ({
            word,
            score: 1000 - senseIdx * 60 - idx * 4,
          }));

        if (synonyms.length > 0) {
          senses.push({
            gloss,
            pos: synset.pos,
            synonyms,
          });
        }
      });
      if (senses.length > 0) {
        wordMap.set(entry.lemma, senses);
      }
    }
  });

  return wordMap;
};

const writeChunks = (wordMap) => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const chunks = new Map();
  for (const [word, senses] of wordMap.entries()) {
    const prefix = getPrefix(word);
    if (!chunks.has(prefix)) {
      chunks.set(prefix, {});
    }
    chunks.get(prefix)[word] = senses;
  }

  for (const [prefix, payload] of chunks.entries()) {
    const filePath = path.join(outputDir, `${prefix}.json`);
    fs.writeFileSync(filePath, JSON.stringify(payload));
  }
  console.log(`Wrote ${chunks.size} wordnet chunks to ${outputDir}`);
};

const wordMap = buildSenses();
writeChunks(wordMap);
