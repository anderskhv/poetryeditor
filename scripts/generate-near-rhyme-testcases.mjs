import fs from 'node:fs';
import path from 'node:path';

const dictPath = path.join(process.cwd(), 'public', 'cmudict.dict');
const dictText = fs.readFileSync(dictPath, 'utf8');
const wordnetDir = path.join(process.cwd(), 'public', 'wordnet-senses');
const outPath = path.join(process.cwd(), 'scripts', 'near-rhyme-testcases.json');

const wordnetCache = new Map();

function getWordnetEntry(word) {
  const normalized = word.toLowerCase();
  if (!normalized) return null;
  const prefix = normalized.replace(/[^a-z]/g, '').slice(0, 2).padEnd(2, '_') || '__';
  if (wordnetCache.has(prefix)) return wordnetCache.get(prefix);
  const filePath = path.join(wordnetDir, `${prefix}.json`);
  if (!fs.existsSync(filePath)) {
    wordnetCache.set(prefix, {});
    return {};
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  wordnetCache.set(prefix, data);
  return data;
}

function hasWordnetSense(word) {
  const normalized = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!normalized) return false;
  const entry = getWordnetEntry(normalized);
  return Boolean(entry && entry[normalized]);
}

function parseCMUDict(text) {
  const dict = new Map();
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith(';;;') || line.trim().length === 0) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;
    const word = parts[0];
    const phones = parts.slice(1);
    const baseWord = word.replace(/\(\d+\)$/, '').toLowerCase();
    const stresses = [];
    for (const phone of phones) {
      const match = phone.match(/[012]$/);
      if (match) stresses.push(parseInt(match[0]));
    }
    const pronunciation = { word: baseWord, phones, stresses };
    if (!dict.has(baseWord)) dict.set(baseWord, []);
    dict.get(baseWord).push(pronunciation);
  }
  return dict;
}

const dictionary = parseCMUDict(dictText);

function getPronunciations(word) {
  const normalized = word.toLowerCase().replace(/[^a-z'-]/g, '');
  let result = dictionary.get(normalized);
  if (!result || result.length === 0) {
    const withoutApostrophe = normalized.replace(/'/g, '');
    result = dictionary.get(withoutApostrophe);
  }
  return result || [];
}

function getRhymePhonemes(word) {
  const pronunciations = getPronunciations(word);
  if (pronunciations.length === 0) return null;
  const phones = pronunciations[0].phones;
  let lastStressIndex = -1;
  for (let i = phones.length - 1; i >= 0; i -= 1) {
    if (/[12]$/.test(phones[i])) {
      lastStressIndex = i;
      break;
    }
  }
  if (lastStressIndex === -1) {
    for (let i = phones.length - 1; i >= 0; i -= 1) {
      if (/[012]$/.test(phones[i])) {
        lastStressIndex = i;
        break;
      }
    }
  }
  if (lastStressIndex === -1) return null;
  return phones.slice(lastStressIndex).map(p => p.replace(/[012]$/, ''));
}

function getSyllableCount(word) {
  const pronunciations = getPronunciations(word);
  if (pronunciations.length === 0) return 0;
  const stresses = pronunciations[0].stresses;
  return stresses.length || 0;
}

function getNearKeyFromPhones(phones) {
  for (let i = phones.length - 1; i >= 0; i -= 1) {
    if (/[012]$/.test(phones[i])) return phones[i].replace(/[012]$/, '');
  }
  return null;
}

function getRhymeKeyFromPhones(phones) {
  let lastStressIndex = -1;
  for (let i = phones.length - 1; i >= 0; i -= 1) {
    if (/[12]$/.test(phones[i])) {
      lastStressIndex = i;
      break;
    }
  }
  if (lastStressIndex === -1) {
    for (let i = phones.length - 1; i >= 0; i -= 1) {
      if (/[012]$/.test(phones[i])) {
        lastStressIndex = i;
        break;
      }
    }
  }
  if (lastStressIndex === -1) return null;
  return phones.slice(lastStressIndex).map(p => p.replace(/[012]$/, '')).join('-');
}

function buildNearIndex() {
  const near = new Map();
  for (const [word, pronunciations] of dictionary.entries()) {
    const best = [...pronunciations].sort((a, b) => b.stresses.length - a.stresses.length)[0];
    if (!best) continue;
    const nearKey = getNearKeyFromPhones(best.phones);
    if (!nearKey) continue;
    const list = near.get(nearKey) ?? [];
    list.push(word);
    near.set(nearKey, list);
  }
  return near;
}

const nearIndex = buildNearIndex();
const perfectIndex = new Map();
for (const [word, pronunciations] of dictionary.entries()) {
  const best = [...pronunciations].sort((a, b) => b.stresses.length - a.stresses.length)[0];
  if (!best) continue;
  const key = getRhymeKeyFromPhones(best.phones);
  if (!key) continue;
  const list = perfectIndex.get(key) ?? [];
  list.push(word);
  perfectIndex.set(key, list);
}

const stopwords = new Set([
  'a','an','the','and','or','to','of','in','on','for','at','by','from',
  'is','am','are','be','was','were','been','being','i','me','my','you',
  'your','yours','we','us','our','he','him','his','she','her','it','its',
  'they','them','their','this','that','these','those'
]);

function isValidNearRhyme(candidate) {
  const trimmed = candidate.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("'")) return false;
  const normalized = trimmed.toLowerCase();
  if (normalized.length < 3) return false;
  if (stopwords.has(normalized)) return false;
  if (!/^[a-zA-Z-]+$/.test(trimmed)) return false;
  if (!/[aeiouy]/i.test(trimmed)) return false;
  return true;
}

function calculateRhymeQualityFast(sourcePhonemes, targetWord) {
  if (!sourcePhonemes) return 0;
  const targetPhonemes = getRhymePhonemes(targetWord);
  if (!targetPhonemes) return 0;
  if (sourcePhonemes.length === targetPhonemes.length) {
    let matches = 0;
    for (let i = 0; i < sourcePhonemes.length; i += 1) {
      if (sourcePhonemes[i] === targetPhonemes[i]) matches += 1;
    }
    return matches / sourcePhonemes.length;
  }
  const minLen = Math.min(sourcePhonemes.length, targetPhonemes.length);
  let matches = 0;
  for (let i = 0; i < minLen; i += 1) {
    const p1 = sourcePhonemes[sourcePhonemes.length - 1 - i];
    const p2 = targetPhonemes[targetPhonemes.length - 1 - i];
    if (p1 === p2) matches += 1;
  }
  const lengthPenalty = minLen / Math.max(sourcePhonemes.length, targetPhonemes.length);
  return (matches / minLen) * lengthPenalty;
}

function getNearRhymes(word, limit = 200) {
  const pronunciations = getPronunciations(word);
  if (pronunciations.length === 0) return [];
  const best = [...pronunciations].sort((a, b) => b.stresses.length - a.stresses.length)[0];
  const nearKey = getNearKeyFromPhones(best.phones);
  if (!nearKey) return [];
  const results = nearIndex.get(nearKey) ?? [];
  return results.filter(w => w !== word).slice(0, limit);
}

function filterNearRhymes(word, candidates) {
  const targetRhyme = getRhymePhonemes(word);
  const targetVowel = targetRhyme?.[0] || null;
  const targetSyllables = getSyllableCount(word);

  const matchesTargetVowel = (candidate) => {
    if (!targetVowel) return true;
    const rhyme = getRhymePhonemes(candidate);
    const vowel = rhyme?.[0];
    return vowel === targetVowel;
  };

  const passesPhonemeFilter = (candidate) => {
    if (!targetRhyme) return true;
    const rhyme = getRhymePhonemes(candidate);
    if (!rhyme) return false;
    if (rhyme.length < 2 || targetRhyme.length < 2) return false;
    const minLen = Math.min(targetRhyme.length, rhyme.length);
    let matches = 0;
    for (let i = 1; i <= minLen; i += 1) {
      if (targetRhyme[targetRhyme.length - i] === rhyme[rhyme.length - i]) matches += 1;
    }
    const requiredMatches = minLen >= 3 ? 2 : 1;
    if (matches < requiredMatches) return false;
    return calculateRhymeQualityFast(targetRhyme, candidate) >= 0.45;
  };

  const matchesSyllables = (candidate) => {
    const syllables = getSyllableCount(candidate);
    return Math.abs(syllables - targetSyllables) <= 1;
  };

  return candidates
    .filter(isValidNearRhyme)
    .filter(matchesTargetVowel)
    .filter(matchesSyllables)
    .filter(passesPhonemeFilter);
}

const cases = [];

for (const [key, words] of perfectIndex.entries()) {
  if (cases.length >= 50) break;
  const unique = Array.from(new Set(words)).filter(w =>
    w.length > 2 &&
    /^[a-z]+$/.test(w) &&
    hasWordnetSense(w)
  );
  if (unique.length < 4) continue;
  const target = unique[0];
  const filtered = filterNearRhymes(target, getNearRhymes(target, 400));
  if (filtered.length < 10) continue;
  cases.push({ word: target });
}

if (cases.length < 50) {
  console.error(`Could only generate ${cases.length} cases.`);
  process.exit(1);
}

fs.writeFileSync(outPath, JSON.stringify(cases, null, 2));
console.log(`Wrote ${cases.length} near-rhyme cases to ${outPath}`);
