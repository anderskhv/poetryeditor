import { PoemAnalysis } from './index';

// Source: Public Domain (published 1917 in Love Songs)

export const barter: PoemAnalysis = {
  slug: 'barter',
  title: 'Barter',
  poet: 'Sara Teasdale',
  poetBirth: 1884,
  poetDeath: 1933,
  year: 1917,
  collection: 'Love Songs',
  form: 'Three stanzas with varied rhyme',
  text: `Life has loveliness to sell,
All beautiful and splendid things,
Blue waves whitened on a cliff,
Soaring fire that sways and sings,
And children's faces looking up
Holding wonder like a cup.

Life has loveliness to sell,
Music like a curve of gold,
Scent of pine trees in the rain,
Eyes that love you, arms that hold,
And for your spirit's still delight,
Holy thoughts that star the night.

Spend all you have for loveliness,
Buy it and never count the cost;
For one white singing hour of peace
Count many a year of strife well lost,
And for a breath of ecstasy
Give all you have been, or could be.`,
  analysis: {
    overview: `Life as marketplace, beauty as currency. Teasdale lists what's for sale—waves, fire, children's wonder, music, love—then commands: "Spend all you have." The final stanza is radical: trade years of strife for one hour of peace, give "all you have been, or could be" for a breath of ecstasy. It's a philosophy of intensity over accumulation.`,
    lineByLine: [
      { lines: '1-6', commentary: `"Loveliness to sell"—beauty has a price, implying it's worth paying. The list: waves, fire, children's faces "holding wonder like a cup." Sensory richness.` },
      { lines: '7-12', commentary: `More inventory: music as "curve of gold" (synesthesia), pine scent, loving eyes. Then "holy thoughts that star the night"—beauty becomes spiritual.` },
      { lines: '13-18', commentary: `The command: "Spend all you have" and "never count the cost." Trade strife for peace, trade your entire self for "a breath of ecstasy." The math is extreme.` }
    ],
    themes: ['Beauty as transaction', 'Intensity over longevity', 'The cost of ecstasy', 'Sensory richness'],
    literaryDevices: [
      { device: 'Extended metaphor', example: 'Life selling, spending, buying', explanation: 'Commercial language for spiritual exchange—beauty as commodity worth any price.' },
      { device: 'Catalogue', example: 'List of beautiful things', explanation: 'Accumulating images builds the sense of abundance available for purchase.' },
      { device: 'Synesthesia', example: '"Music like a curve of gold"', explanation: 'Sound becomes shape and color—senses blend in describing beauty.' }
    ],
    historicalContext: `From "Love Songs" (1917), which won the Columbia Poetry Prize (precursor to the Pulitzer). Teasdale's philosophy here resembles Millay's "First Fig"—spend yourself for beauty. Both poets advocated intensity in an era of Victorian restraint.`
  },
  seoDescription: 'Analysis of Sara Teasdale\'s "Barter" - the poem commanding us to spend everything for loveliness and never count the cost.'
};
