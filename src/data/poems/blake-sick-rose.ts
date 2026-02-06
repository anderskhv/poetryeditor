import { PoemAnalysis } from './index';

// Source: Public domain (1794)

export const sickRose: PoemAnalysis = {
  slug: 'the-sick-rose',
  title: 'The Sick Rose',
  poet: 'William Blake',
  poetBirth: 1757,
  poetDeath: 1827,
  year: 1794,
  collection: 'Songs of Experience',
  form: 'Two quatrains',
  text: `O Rose, thou art sick!
The invisible worm
That flies in the night,
In the howling storm,

Has found out thy bed
Of crimson joy;
And his dark secret love
Does thy life destroy.`,
  analysis: {
    overview: 'A brief allegory of corruption: beauty is undermined by a hidden, destructive force that poses as love.',
    lineByLine: [
      { lines: '1-4', commentary: 'The rose is directly addressed and declared ill; the cause is an unseen worm.' },
      { lines: '5-8', commentary: 'The worm invades the rose’s place of joy, and the “secret love” becomes lethal.' }
    ],
    themes: ['Corruption', 'Hidden danger', 'Innocence lost', 'Desire'],
    literaryDevices: [
      { device: 'Symbolism', example: 'Rose and worm', explanation: 'The rose suggests beauty or innocence; the worm suggests decay or destructive desire.' },
      { device: 'Alliteration', example: 'dark secret love', explanation: 'Sound intensifies the sinister tone.' }
    ],
    historicalContext: 'Blake’s Songs of Experience explores how innocence is undermined by social and psychological forces.'
  },
  seoDescription: 'The Sick Rose by William Blake with full text and analysis of its haunting allegory.'
};
