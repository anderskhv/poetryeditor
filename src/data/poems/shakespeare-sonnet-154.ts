import { PoemAnalysis } from './index';

// Source: Project Gutenberg - Public Domain

export const sonnet154: PoemAnalysis = {
  slug: 'sonnet-154',
  title: 'Sonnet 154: The little Love-god lying once asleep',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `The little Love-god lying once asleep
Laid by his side his heart-inflaming brand,
Whilst many nymphs that vow'd chaste life to keep
Came tripping by; but in her maiden hand
The fairest votary took up that fire
Which many legions of true hearts had warm'd;
And so the general of hot desire
Was sleeping by a virgin hand disarm'd.
This brand she quenched in a cool well by,
Which from Love's fire took heat perpetual,
Growing a bath and healthful remedy
For men diseased; but I, my mistress' thrall,
Came there for cure, and this by that I prove,
Love's fire heats water, water cools not love.`,
  analysis: {
    overview: `The final sonnet retells a classical myth: Cupid's torch stolen and quenched, creating a healing bath. But the speaker tried the cure and it failed—"water cools not love." The sequence ends not with resolution but ironic defeat: love remains incurable.`,
    lineByLine: [
      { lines: '1-8', commentary: `Cupid sleeps; a virgin nymph steals his torch and disarms the "general of hot desire."` },
      { lines: '9-12', commentary: `She quenches it in a well, which becomes a healing bath for "men diseased" by love.` },
      { lines: '13-14', commentary: `The speaker tried the cure. It failed. Love's fire heated the water but water couldn't cool love. No escape.` }
    ],
    themes: ['Love incurable', 'Classical myth', 'Failed remedies', 'Ironic conclusion'],
    literaryDevices: [
      { device: 'Mythological Allegory', example: 'Cupid, nymphs, torch', explanation: 'Classical apparatus for a personal conclusion.' },
      { device: 'Epigram', example: 'Love\'s fire heats water, water cools not love', explanation: 'Witty paradox as final statement—love defeats all cures.' }
    ],
    historicalContext: `The sequence ends with classical allegory rather than personal address—a distancing gesture. The myth derives from Greek sources.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 154 - the final sonnet\'s myth of Cupid\'s torch and love\'s incurable fire.'
};
