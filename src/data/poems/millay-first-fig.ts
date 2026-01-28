import { PoemAnalysis } from './index';

// Source: Public Domain (published 1920 in A Few Figs from Thistles)

export const firstFig: PoemAnalysis = {
  slug: 'first-fig',
  title: 'First Fig',
  poet: 'Edna St. Vincent Millay',
  poetBirth: 1892,
  poetDeath: 1950,
  year: 1920,
  collection: 'A Few Figs from Thistles',
  form: 'Quatrain',
  text: `My candle burns at both ends;
It will not last the night;
But ah, my foes, and oh, my friends—
It gives a lovely light!`,
  analysis: {
    overview: `Four lines that defined the Jazz Age. The candle burning at both ends became a catchphrase for living fast and recklessly. Millay addresses "foes" and "friends" alike—she doesn't care what either thinks. The exclamation "lovely light!" makes self-destruction glamorous. It's a manifesto for intensity over longevity.`,
    lineByLine: [
      { lines: '1', commentary: `"Burns at both ends"—impossible literally, but the image is clear: using yourself up twice as fast. The candle is her life.` },
      { lines: '2', commentary: `"Will not last the night"—she knows the cost. This isn't ignorance but choice. Short but bright.` },
      { lines: '3', commentary: `"Foes, and oh, my friends"—she addresses everyone, dismissing both disapproval and concern. Neither will stop her.` },
      { lines: '4', commentary: `"It gives a lovely light!"—the payoff. The light justifies the burning. Beauty over duration.` }
    ],
    themes: ['Living intensely', 'Youth and recklessness', 'Defiance of convention', 'Beauty over longevity'],
    literaryDevices: [
      { device: 'Extended metaphor', example: 'Candle as life', explanation: 'The single image carries the whole poem—burning, brightness, brevity.' },
      { device: 'Apostrophe', example: '"my foes, and oh, my friends"', explanation: 'Addressing an audience makes this a public declaration, not private musing.' },
      { device: 'Exclamation', example: '"lovely light!"', explanation: 'The enthusiasm in the final line makes recklessness sound joyful, not regretful.' }
    ],
    historicalContext: `Published in 1920, this became the anthem of the Roaring Twenties. Millay lived the poem—she was famous for love affairs, late nights, and bohemian Greenwich Village life. The "candle burning at both ends" entered common speech.`
  },
  seoDescription: 'Analysis of Edna St. Vincent Millay\'s "First Fig" - the four-line Jazz Age anthem about burning bright and living fast.'
};
