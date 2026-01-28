import { PoemAnalysis } from './index';

// Source: Project Gutenberg - Public Domain

export const sonnet144: PoemAnalysis = {
  slug: 'sonnet-144',
  title: 'Sonnet 144: Two loves I have of comfort and despair',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `Two loves I have of comfort and despair,
Which like two spirits do suggest me still:
The better angel is a man right fair,
The worser spirit a woman colour'd ill.
To win me soon to hell, my female evil
Tempteth my better angel from my side,
And would corrupt my saint to be a devil,
Wooing his purity with her foul pride.
And whether that my angel be turn'd fiend
Suspect I may, but not directly tell;
But being both from me, both to each friend,
I guess one angel in another's hell:
Yet this shall I ne'er know, but live in doubt,
Till my bad angel fire my good one out.`,
  analysis: {
    overview: `Sonnet 144 makes explicit the sonnet sequence's love triangle: the speaker, the Fair Youth ("better angel"), and the Dark Lady ("worser spirit"). She's corrupting him; they may be sleeping together ("one angel in another's hell"). The speaker lives in agonized uncertainty.`,
    lineByLine: [
      { lines: '1-4', commentary: `Two loves: comfort (male, fair) and despair (female, dark). Morality play figures—angel and devil.` },
      { lines: '5-8', commentary: `The woman tempts the man, trying to "corrupt my saint to be a devil." Sexual seduction as spiritual battle.` },
      { lines: '9-12', commentary: `Has the angel become a fiend? He suspects but can't know. "In another's hell"—sexual pun on female anatomy.` },
      { lines: '13-14', commentary: `Living in doubt until the "bad angel fire my good one out"—venereal disease as revelation.` }
    ],
    themes: ['Love triangle', 'Moral allegory', 'Sexual jealousy', 'Uncertainty'],
    literaryDevices: [
      { device: 'Morality Play', example: 'Angel vs. devil', explanation: 'Medieval dramatic form—good and evil spirits competing for a soul.' },
      { device: 'Sexual Puns', example: '"hell," "fire out"', explanation: 'Crude puns underneath spiritual language.' }
    ],
    historicalContext: `Published earlier in The Passionate Pilgrim (1599). Makes the sequence's triangular structure explicit.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 144 "Two loves I have" - the love triangle between speaker, Fair Youth, and Dark Lady.'
};
