import { PoemAnalysis } from './index';

// Source: Public Domain (published 1923)

export const nothingGoldCanStay: PoemAnalysis = {
  slug: 'nothing-gold-can-stay',
  title: 'Nothing Gold Can Stay',
  poet: 'Robert Frost',
  poetBirth: 1874,
  poetDeath: 1963,
  year: 1923,
  collection: 'New Hampshire',
  form: 'Eight-line lyric in iambic trimeter',
  text: `Nature's first green is gold,
Her hardest hue to hold.
Her early leaf's a flower;
But only so an hour.
Then leaf subsides to leaf.
So Eden sank to grief,
So dawn goes down to day.
Nothing gold can stay.`,
  analysis: {
    overview: `Eight lines that compress the entire tragedy of impermanence. Frost moves from botanical observation (spring's first leaves are golden) to theological fall (Eden's loss) to cosmic truth (nothing gold can stay). The poem's brevity enacts its theme—beauty passes quickly. Each couplet marks a stage of loss: gold to green, flower to leaf, Eden to grief, dawn to day.`,
    lineByLine: [
      { lines: '1-2', commentary: `The opening paradox: green is gold. Spring's first growth has a golden hue before chlorophyll dominates. This gold is "hardest to hold"—beauty begins fading the moment it appears.` },
      { lines: '3-4', commentary: `"Her early leaf's a flower"—the unfurling leaf resembles a blossom. "But only so an hour"—the resemblance is momentary. Frost compresses time; an hour stands for any brief duration.` },
      { lines: '5-6', commentary: `"Leaf subsides to leaf"—growth becomes ordinary. Then the leap: "So Eden sank to grief." Natural cycles mirror the Fall. Paradise was also golden, also lost.` },
      { lines: '7-8', commentary: `"Dawn goes down to day"—even sunrise fades into common daylight. The final line states the law absolutely: "Nothing gold can stay." No exceptions, no escape.` }
    ],
    themes: ['Impermanence', 'Loss of innocence', 'Nature as parable', 'The Fall', 'Beauty and transience'],
    literaryDevices: [
      { device: 'Paradox', example: 'Nature\'s first green is gold', explanation: 'Apparent contradiction that reveals truth—spring\'s earliest growth is indeed golden-hued.' },
      { device: 'Allusion', example: 'So Eden sank to grief', explanation: 'Biblical Fall connects natural cycles to human loss of innocence.' },
      { device: 'Compression', example: 'The entire 8-line structure', explanation: 'Frost packs cosmic tragedy into four couplets, each a stage of loss.' },
      { device: 'Epigram', example: 'Nothing gold can stay', explanation: 'The final line becomes a proverb, memorable and absolute.' }
    ],
    historicalContext: `Published in 1923 in "New Hampshire." The poem gained renewed fame through the 1967 novel and 1983 film "The Outsiders," where Johnny tells Ponyboy to "stay gold." Frost wrote it in his characteristic mode: simple natural observation opening into larger meaning.`
  },
  seoDescription: 'Analysis of Nothing Gold Can Stay by Robert Frost - the 1923 poem on impermanence and lost innocence.'
};
