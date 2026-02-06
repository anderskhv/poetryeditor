import { PoemAnalysis } from './index';

// Source: Public domain (1890)

export const innisfree: PoemAnalysis = {
  slug: 'the-lake-isle-of-innisfree',
  title: 'The Lake Isle of Innisfree',
  poet: 'W. B. Yeats',
  poetBirth: 1865,
  poetDeath: 1939,
  year: 1890,
  collection: 'The Rose',
  form: 'Three quatrains',
  text: `I will arise and go now, and go to Innisfree,
And a small cabin build there, of clay and wattles made;
Nine bean-rows will I have there, a hive for the honey-bee,
And live alone in the bee-loud glade.

And I shall have some peace there, for peace comes dropping slow,
Dropping from the veils of the morning to where the cricket sings;
There midnight's all a glimmer, and noon a purple glow,
And evening full of the linnet's wings.

I will arise and go now, for always night and day
I hear lake water lapping with low sounds by the shore;
While I stand on the roadway, or on the pavements grey,
I hear it in the deep heart's core.`,
  analysis: {
    overview: 'Yeats imagines a simple island retreat where peace descends through sound and light, contrasting urban life with inward longing.',
    lineByLine: [
      { lines: '1-4', commentary: 'The speaker vows to build a modest cabin and live close to nature.' },
      { lines: '5-8', commentary: 'Peace is described as a slow, sensory atmosphere of dawn, noon, and evening.' },
      { lines: '9-12', commentary: 'Even in the city, the speaker hears the island in memory and desire.' }
    ],
    themes: ['Escape', 'Nature', 'Longing', 'Memory', 'Solitude'],
    literaryDevices: [
      { device: 'Imagery', example: 'bee-loud glade', explanation: 'Sound and sight create a vivid pastoral scene.' },
      { device: 'Repetition', example: 'I will arise and go now', explanation: 'Signals resolve and recurring desire.' }
    ],
    historicalContext: 'Yeats wrote the poem after glimpsing a fountain in London, which triggered his longing for the Irish countryside.'
  },
  seoDescription: 'The Lake Isle of Innisfree by W. B. Yeats with full text and analysis of its pastoral longing.'
};
