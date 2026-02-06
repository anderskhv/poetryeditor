import { PoemAnalysis } from './index';

// Source: Public domain (1920)

export const fireAndIce: PoemAnalysis = {
  slug: 'fire-and-ice',
  title: 'Fire and Ice',
  poet: 'Robert Frost',
  poetBirth: 1874,
  poetDeath: 1963,
  year: 1920,
  collection: 'New Hampshire',
  form: 'Nine-line rhyming stanza',
  text: `Some say the world will end in fire,
Some say in ice.
From what I've tasted of desire
I hold with those who favor fire.
But if it had to perish twice,
I think I know enough of hate
To say that for destruction ice
Is also great
And would suffice.`,
  analysis: {
    overview: 'Frost compresses cosmic end-times into human emotions: desire and hate become rival dooms.',
    lineByLine: [
      { lines: '1-4', commentary: 'The speaker compares two apocalyptic theories and aligns fire with desire.' },
      { lines: '5-9', commentary: 'Hate’s coldness is judged equally destructive, making ice a second valid ending.' }
    ],
    themes: ['Desire', 'Hate', 'Destruction', 'Human nature', 'Irony'],
    literaryDevices: [
      { device: 'Metaphor', example: 'fire... ice', explanation: 'Emotions are mapped onto elemental forces.' },
      { device: 'Understatement', example: 'I think I know enough of hate', explanation: 'The calm tone heightens the dark message.' }
    ],
    historicalContext: 'Published after World War I, the poem distills large-scale catastrophe into personal psychology.'
  },
  seoDescription: 'Fire and Ice by Robert Frost with full text and analysis of its elemental metaphor for human desire and hate.'
};
