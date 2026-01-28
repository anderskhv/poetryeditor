import { PoemAnalysis } from './index';

// Source: Project Gutenberg https://www.gutenberg.org/files/32990/

export const sheWalksInBeauty: PoemAnalysis = {
  slug: 'she-walks-in-beauty',
  title: 'She Walks in Beauty',
  poet: 'George Gordon, Lord Byron',
  poetBirth: 1788,
  poetDeath: 1824,
  year: 1814,
  collection: 'Hebrew Melodies',
  form: 'Three six-line stanzas in iambic tetrameter',
  text: `She walks in beauty, like the night
Of cloudless climes and starry skies;
And all that's best of dark and bright
Meet in her aspect and her eyes:
Thus mellow'd to that tender light
Which heaven to gaudy day denies.

One shade the more, one ray the less,
Had half impair'd the nameless grace
Which waves in every raven tress,
Or softly lightens o'er her face;
Where thoughts serenely sweet express
How pure, how dear their dwelling-place.

And on that cheek, and o'er that brow,
So soft, so calm, yet eloquent,
The smiles that win, the tints that glow,
But tell of days in goodness spent,
A mind at peace with all below,
A heart whose love is innocent!`,
  analysis: {
    overview: 'A celebration of feminine beauty that harmonizes darkness and light, inner virtue and outer grace.',
    lineByLine: [
      { lines: '1-6', commentary: 'The woman embodies a perfect balance of dark and light, like a starry night.' },
      { lines: '7-12', commentary: 'Her beauty is so perfectly calibrated that any change would diminish it.' },
      { lines: '13-18', commentary: 'Her outward beauty reflects inner goodness and innocence.' }
    ],
    themes: ['Beauty', 'Harmony', 'Inner virtue', 'Innocence', 'Idealized love'],
    literaryDevices: [
      { device: 'Simile', example: 'like the night', explanation: 'Unconventional comparison—beauty likened to darkness, not light.' },
      { device: 'Antithesis', example: 'dark and bright', explanation: 'Contrasts unite to create perfect harmony.' }
    ],
    historicalContext: 'Written after Byron saw his cousin Anne Wilmot at a party, dressed in mourning with dark dress and spangles.'
  },
  seoDescription: 'She Walks in Beauty by Lord Byron - full text and analysis of the 1814 poem celebrating feminine grace.'
};
