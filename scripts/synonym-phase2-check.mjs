import fs from 'fs';
import path from 'path';

const dataPath = path.resolve('src', 'data', 'offlineSynonyms.json');
const offlineSynonyms = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const synonymTests = [
  { word: 'happy', expect: ['joyful', 'glad', 'cheerful'] },
  { word: 'sad', expect: ['sorrowful', 'gloomy'] },
  { word: 'love', expect: ['adore', 'cherish'] },
  { word: 'big', expect: ['large', 'huge'] },
  { word: 'small', expect: ['tiny', 'little'] },
  { word: 'fast', expect: ['quick', 'swift'] },
  { word: 'slow', expect: ['sluggish', 'unhurried'] },
  { word: 'bright', expect: ['radiant', 'luminous'] },
  { word: 'dark', expect: ['gloomy', 'shadowy'] },
  { word: 'cold', expect: ['chilly', 'icy'] },
  { word: 'angry', expect: ['furious', 'irate'] },
  { word: 'brave', expect: ['courageous', 'bold'] },
  { word: 'gentle', expect: ['soft', 'tender'] },
  { word: 'silence', expect: ['quiet', 'hush'] },
  { word: 'storm', expect: ['tempest', 'gale'] },
];

const antonymTests = [
  { word: 'happy', expect: ['sad'] },
  { word: 'love', expect: ['hate'] },
  { word: 'big', expect: ['small'] },
  { word: 'fast', expect: ['slow'] },
  { word: 'bright', expect: ['dark'] },
  { word: 'gentle', expect: ['harsh'] },
  { word: 'calm', expect: ['chaotic'] },
  { word: 'awake', expect: ['asleep'] },
];

let synonymPass = 0;
for (const test of synonymTests) {
  const entry = offlineSynonyms[test.word];
  const results = entry?.synonyms ?? [];
  const hits = test.expect.filter(item => results.includes(item));
  const passed = hits.length >= 2;
  if (passed) synonymPass += 1;
  console.log(`SYN ${test.word}: ${hits.length}/${test.expect.length} -> ${passed ? 'PASS' : 'FAIL'}`);
}

let antonymPass = 0;
for (const test of antonymTests) {
  const entry = offlineSynonyms[test.word];
  const results = entry?.antonyms ?? [];
  const hits = test.expect.filter(item => results.includes(item));
  const passed = hits.length >= 1;
  if (passed) antonymPass += 1;
  console.log(`ANT ${test.word}: ${hits.length}/${test.expect.length} -> ${passed ? 'PASS' : 'FAIL'}`);
}

console.log('\nSUMMARY');
console.log(`Synonym tests: ${synonymPass}/${synonymTests.length}`);
console.log(`Antonym tests: ${antonymPass}/${antonymTests.length}`);

if (synonymPass !== synonymTests.length || antonymPass !== antonymTests.length) {
  process.exit(1);
}
