import nlp from 'compromise';

function detectWordForm(word, posHint) {
  const lower = word.toLowerCase();
  const doc = nlp(lower);
  const isVerb = posHint ? posHint.startsWith('v') : doc.verbs().length > 0;
  const isNoun = posHint ? posHint.startsWith('n') : doc.nouns().length > 0;

  if (lower.endsWith('ing') && isVerb) return { type: 'verb', suffix: 'ing' };
  if (lower.endsWith('ed') && isVerb) return { type: 'verb', suffix: 'ed' };
  if (lower.endsWith('s') && !lower.endsWith('ss') && isVerb) return { type: 'verb', suffix: 's' };

  if (lower.endsWith('es') && isNoun) return { type: 'noun', suffix: 'es' };
  if (lower.endsWith('s') && isNoun) return { type: 'noun', suffix: 's' };

  return null;
}

function applyWordForm(synonymWord, originalWord, posHint) {
  const wordForm = detectWordForm(originalWord, posHint);
  if (!wordForm) return synonymWord;

  const synDoc = nlp(synonymWord);
  const normalizeVerbOutput = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return '';
    const parts = trimmed.split(/\s+/);
    return parts[parts.length - 1];
  };
  const irregularPast = new Set(['done']);

  if (wordForm.type === 'verb') {
    if (wordForm.suffix === 'ing') {
      if (synonymWord.endsWith('ing')) return synonymWord;
      const gerund = normalizeVerbOutput(synDoc.verbs().toGerund().text());
      if (gerund && gerund !== synonymWord) return gerund;
      if (synonymWord.endsWith('e')) return synonymWord.slice(0, -1) + 'ing';
      return synonymWord + 'ing';
    }

    if (wordForm.suffix === 'ed') {
      if (synonymWord.endsWith('ed')) return synonymWord;
      if (irregularPast.has(synonymWord)) return synonymWord;
      const conjugations = synDoc.verbs().conjugate();
      const isPast = conjugations.some((conj) =>
        Object.entries(conj).some(([key, value]) =>
          key.toLowerCase().includes('past') && value === synonymWord
        )
      );
      if (isPast) return synonymWord;
      const past = normalizeVerbOutput(synDoc.verbs().toPastTense().text());
      if (past && past !== synonymWord) return past;
      if (synonymWord.endsWith('e')) return synonymWord + 'd';
      return synonymWord + 'ed';
    }

    if (wordForm.suffix === 's') {
      const present = normalizeVerbOutput(synDoc.verbs().toPresentTense().text());
      if (present && present !== synonymWord) return present;
      if (synonymWord.match(/[sxz]$|[cs]h$/)) return synonymWord + 'es';
      return synonymWord + 's';
    }
  }

  if (wordForm.type === 'noun' && (wordForm.suffix === 's' || wordForm.suffix === 'es')) {
    if (synonymWord.endsWith(wordForm.suffix)) return synonymWord;
    const plural = synDoc.nouns().toPlural().text();
    if (plural && plural !== synonymWord) return plural;
    if (synonymWord.match(/[sxz]$|[cs]h$/)) return synonymWord + 'es';
    return synonymWord + 's';
  }

  return synonymWord;
}

const cases = [
  {
    name: 'Adjective forms should not be double-inflected',
    original: 'astonishing',
    pos: 'adj',
    pairs: [
      ['amazing', 'amazing'],
      ['staggering', 'staggering'],
      ['astounding', 'astounding'],
      ['surprising', 'surprising'],
    ],
  },
  {
    name: 'Gerund verbs should inflect cleanly',
    original: 'walking',
    pos: 'verb',
    pairs: [
      ['stroll', 'strolling'],
      ['move', 'moving'],
      ['jog', 'jogging'],
      ['running', 'running'],
    ],
  },
  {
    name: 'Past tense verbs should inflect cleanly',
    original: 'finished',
    pos: 'verb',
    pairs: [
      ['complete', 'completed'],
      ['end', 'ended'],
      ['done', 'done'],
    ],
  },
  {
    name: 'Third-person verbs should inflect cleanly',
    original: 'runs',
    pos: 'verb',
    pairs: [
      ['move', 'moves'],
      ['watch', 'watches'],
      ['pass', 'passes'],
    ],
  },
  {
    name: 'Plural nouns should inflect cleanly',
    original: 'lamps',
    pos: 'noun',
    pairs: [
      ['light', 'lights'],
      ['box', 'boxes'],
    ],
  },
];

const failures = [];

cases.forEach((testCase) => {
  testCase.pairs.forEach(([input, expected]) => {
    const result = applyWordForm(input, testCase.original, testCase.pos);
    if (result !== expected) {
      failures.push({
        case: testCase.name,
        original: testCase.original,
        input,
        expected,
        got: result,
      });
    }
  });
});

if (failures.length > 0) {
  console.error('Synonym form tests failed:\n');
  failures.forEach((failure) => {
    console.error(`- ${failure.case}: ${failure.input} -> ${failure.got} (expected ${failure.expected}) for original '${failure.original}'`);
  });
  process.exit(1);
}

console.log('Synonym form tests passed.');
