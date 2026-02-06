import { PoemAnalysis } from './index';

// Source: Public domain (1794)

export const redRedRose: PoemAnalysis = {
  slug: 'a-red-red-rose',
  title: 'A Red, Red Rose',
  poet: 'Robert Burns',
  poetBirth: 1759,
  poetDeath: 1796,
  year: 1794,
  collection: 'Scots Musical Museum',
  form: 'Four stanzas of ballad meter',
  text: `O my Luve's like a red, red rose
That's newly sprung in June;
O my Luve's like the melody
That's sweetly played in tune.

As fair art thou, my bonnie lass,
So deep in luve am I;
And I will love thee still, my dear,
Till a' the seas gang dry.

Till a' the seas gang dry, my dear,
And the rocks melt wi' the sun;
I will love thee still, my dear,
While the sands o' life shall run.

And fare thee weel, my only Luve,
And fare thee weel awhile!
And I will come again, my Luve,
Though it were ten thousand mile.`,
  analysis: {
    overview: 'Burns blends folk-song simplicity with bold hyperbole to promise a love that outlasts time and distance.',
    lineByLine: [
      { lines: '1-8', commentary: 'Love is compared to fresh beauty and music, then affirmed as deep and enduring.' },
      { lines: '9-16', commentary: 'The speaker vows constancy beyond natural limits, ending with a bittersweet farewell.' }
    ],
    themes: ['Love', 'Constancy', 'Beauty', 'Distance', 'Time'],
    literaryDevices: [
      { device: 'Simile', example: "Luve's like a red, red rose", explanation: 'Sensual, vivid comparison of love to beauty.' },
      { device: 'Hyperbole', example: 'Till a’ the seas gang dry', explanation: 'Exaggeration emphasizes devotion.' }
    ],
    historicalContext: 'Burns adapted traditional song forms and Scots dialect to create a lyric that became one of his most popular love poems.'
  },
  seoDescription: 'A Red, Red Rose by Robert Burns with full text and analysis of its folk lyric devotion.'
};
