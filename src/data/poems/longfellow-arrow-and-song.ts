import { PoemAnalysis } from './index';

// Source: Public domain (1845)

export const arrowAndSong: PoemAnalysis = {
  slug: 'the-arrow-and-the-song',
  title: 'The Arrow and the Song',
  poet: 'Henry Wadsworth Longfellow',
  poetBirth: 1807,
  poetDeath: 1882,
  year: 1845,
  collection: 'The Belfry of Bruges and Other Poems',
  form: 'Three quatrains',
  text: `I shot an arrow into the air,
It fell to earth, I knew not where;
For, so swiftly it flew, the sight
Could not follow it in its flight.

I breathed a song into the air,
It fell to earth, I knew not where;
For who has sight so keen and strong,
That it can follow the flight of song?

Long, long afterward, in an oak
I found the arrow, still unbroke;
And the song, from beginning to end,
I found again in the heart of a friend.`,
  analysis: {
    overview: 'Longfellow contrasts the invisible paths of actions and words, showing how both can return unexpectedly with lasting impact.',
    lineByLine: [
      { lines: '1-4', commentary: 'The arrow vanishes quickly, a metaphor for actions whose outcomes are unseen.' },
      { lines: '5-8', commentary: 'The song is even harder to track, like a word or feeling released into the world.' },
      { lines: '9-12', commentary: 'Time reveals the effects of both: the arrow is found, and the song lives in a friend.' }
    ],
    themes: ['Influence', 'Memory', 'Friendship', 'Unseen consequences'],
    literaryDevices: [
      { device: 'Metaphor', example: 'arrow and song', explanation: 'Actions and words are compared to projectiles with unseen trajectories.' },
      { device: 'Parallelism', example: 'I shot... I breathed...', explanation: 'Repetition reinforces the comparison.' }
    ],
    historicalContext: 'Longfellow favored moral clarity and musicality, making this short lyric a popular teaching poem.'
  },
  seoDescription: 'The Arrow and the Song by Henry Wadsworth Longfellow with full text and analysis of its lasting influence.'
};
