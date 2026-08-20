import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { loadCMUDictionaryFromText } from '../cmuDict';
import { getEditorNearRhymes, getEditorRhymes, getPoetRhymes } from '../poetRhymes';
import { resetWordnetPrefixCache } from '../wordnetSenses';

const JUNK = ['keef', 'kief', 'naef', 'neef', 'lindo', 'indo', 'jindo', 'lindow'];

const FIXTURE_DICT = `
belief B IH0 L IY1 F
beef B IY1 F
brief B R IY1 F
bright B R AY1 T
bite B AY1 T
chief CH IY1 F
fight F AY1 T
grief G R IY1 F
height HH AY1 T
indo IH1 N D OW0
jindo JH IH1 N D OW0
keef K IY1 F
kief K IY1 F
kite K AY1 T
knight N AY1 T
leaf L IY1 F
light L AY1 T
lindo L IH1 N D OW0
lindow L IH1 N D OW0
naef N IY1 F
neef N IY1 F
night N AY1 T
reef R IY1 F
relief R IH0 L IY1 F
right R AY1 T
sight S AY1 T
thief TH IY1 F
white W AY1 T
widow W IH1 D OW0
window W IH1 N D OW0
write R AY1 T
`;

function wordsOf(rhymes: { word: string }[]): string[] {
  return rhymes.map((rhyme) => rhyme.word.toLowerCase());
}

function oneSyllable(rhymes: { word: string; numSyllables?: number }[]): string[] {
  return rhymes
    .filter((rhyme) => (rhyme.numSyllables || 0) === 1)
    .map((rhyme) => rhyme.word.toLowerCase());
}

describe('editor poet rhymes (fixture CMU)', () => {
  beforeAll(() => {
    loadCMUDictionaryFromText(FIXTURE_DICT);
    resetWordnetPrefixCache();
  });

  afterEach(() => {
    resetWordnetPrefixCache();
  });

  it('grief: top one-syllable hits are real English, not keef/naef', async () => {
    const rhymes = await getEditorRhymes('grief');
    const all = wordsOf(rhymes);
    const topMono = oneSyllable(rhymes).slice(0, 6);

    expect(all).toEqual(expect.arrayContaining(['leaf', 'thief', 'brief', 'chief', 'relief']));
    expect(all.some((word) => JUNK.includes(word))).toBe(false);
    expect(topMono.some((word) => JUNK.includes(word))).toBe(false);
    expect(topMono.length).toBeGreaterThan(0);
    topMono.forEach((word) => {
      expect(['leaf', 'thief', 'brief', 'chief', 'beef']).toContain(word);
    });
  });

  it('window: hides name junk; near rhymes keep widow', async () => {
    const perfect = await getEditorRhymes('window');
    const near = await getEditorNearRhymes('window');

    expect(wordsOf(perfect).some((word) => JUNK.includes(word))).toBe(false);
    expect(wordsOf(near)).toContain('widow');
    expect(wordsOf(near).some((word) => JUNK.includes(word))).toBe(false);
  });

  it('light: top results are usable English words and hide the night cliché', async () => {
    const rhymes = await getEditorRhymes('light');
    const all = wordsOf(rhymes);
    const top = all.slice(0, 8);

    expect(all).toEqual(expect.arrayContaining(['write', 'right', 'white', 'fight', 'bright', 'sight']));
    expect(all).not.toContain('night');
    expect(top.some((word) => JUNK.includes(word))).toBe(false);
    top.forEach((word) => {
      expect(['write', 'right', 'white', 'fight', 'bright', 'sight', 'height', 'bite', 'kite', 'knight']).toContain(word);
    });
  });

  it('can still surface clichés when the /rhymes filter is off', async () => {
    const withCliches = await getPoetRhymes('light', { kind: 'perfect', hideCliches: false, hideNonWords: true });
    expect(wordsOf(withCliches)).toContain('night');
  });
});

describe('editor poet rhymes (full CMU + local WordNet)', () => {
  beforeAll(() => {
    const dict = readFileSync(resolve(process.cwd(), 'public/cmudict.dict'), 'utf8');
    loadCMUDictionaryFromText(dict);
    resetWordnetPrefixCache();

    vi.stubGlobal('fetch', async (input: RequestInfo | URL) => {
      const url = String(input);
      const match = url.match(/wordnet-senses\/([^/]+)\.json$/);
      if (!match) {
        return { ok: false, json: async () => ({}) } as Response;
      }
      try {
        const text = readFileSync(resolve(process.cwd(), 'public/wordnet-senses', `${match[1]}.json`), 'utf8');
        return { ok: true, json: async () => JSON.parse(text) } as Response;
      } catch {
        return { ok: false, json: async () => ({}) } as Response;
      }
    });
  });

  afterEach(() => {
    resetWordnetPrefixCache();
  });

  it('grief keeps belief/relief and drops keef/naef', async () => {
    const rhymes = await getEditorRhymes('grief');
    const all = wordsOf(rhymes);
    expect(all).toEqual(expect.arrayContaining(['belief', 'relief', 'leaf', 'thief']));
    expect(all.some((word) => ['keef', 'kief', 'naef', 'neef'].includes(word))).toBe(false);
  });

  it('window near list includes widow and drops name junk', async () => {
    const near = await getEditorNearRhymes('window');
    const all = wordsOf(near);
    expect(all).toContain('widow');
    expect(all).not.toContain('lindo');
    expect(all.slice(0, 8)).toContain('widow');
  });

  it('light leads with common English words a poet would use', async () => {
    const rhymes = await getEditorRhymes('light');
    const top = wordsOf(rhymes).slice(0, 8);
    expect(top).toEqual(expect.arrayContaining(['write', 'right', 'white', 'fight']));
    expect(top).not.toContain('night');
    expect(top.every((word) => /^[a-z]+$/.test(word))).toBe(true);
  });
});
