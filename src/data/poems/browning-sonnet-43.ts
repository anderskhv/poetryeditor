import { PoemAnalysis } from './index';

// Source: Public domain (1850)

export const sonnet43: PoemAnalysis = {
  slug: 'sonnet-43',
  title: 'Sonnet 43 (How do I love thee?)',
  poet: 'Elizabeth Barrett Browning',
  poetBirth: 1806,
  poetDeath: 1861,
  year: 1850,
  collection: 'Sonnets from the Portuguese',
  form: 'Petrarchan sonnet',
  text: `How do I love thee? Let me count the ways.
I love thee to the depth and breadth and height
My soul can reach, when feeling out of sight
For the ends of being and ideal grace.
I love thee to the level of every day's
Most quiet need, by sun and candle-light.
I love thee freely, as men strive for right.
I love thee purely, as they turn from praise.
I love thee with the passion put to use
In my old griefs, and with my childhood's faith.
I love thee with a love I seemed to lose
With my lost saints. I love thee with the breath,
Smiles, tears, of all my life; and, if God choose,
I shall but love thee better after death.`,
  analysis: {
    overview: 'A devotional catalog of love that moves from cosmic scale to daily life, ending with a vow that love will outlast death.',
    lineByLine: [
      { lines: '1-8', commentary: 'The speaker measures love in spiritual dimensions and everyday acts, blending ideal and ordinary devotion.' },
      { lines: '9-14', commentary: 'Love gathers past grief and faith into the present, culminating in a promise of love beyond mortality.' }
    ],
    themes: ['Romantic devotion', 'Spiritual love', 'Continuity of the self', 'Faith', 'Mortality'],
    literaryDevices: [
      { device: 'Anaphora', example: 'I love thee...', explanation: 'Repetition builds intensity and structure.' },
      { device: 'Hyperbole', example: 'depth and breadth and height', explanation: 'Expands love to cosmic dimensions.' }
    ],
    historicalContext: 'Part of a private sonnet sequence written for Robert Browning during their courtship; later published and widely celebrated.'
  },
  seoDescription: 'Sonnet 43 by Elizabeth Barrett Browning with full text and analysis of its famous catalog of love.'
};
