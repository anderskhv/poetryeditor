import { PoemAnalysis } from './index';

// Source: Public domain (1913)

export const thePasture: PoemAnalysis = {
  slug: 'the-pasture',
  title: 'The Pasture',
  poet: 'Robert Frost',
  poetBirth: 1874,
  poetDeath: 1963,
  year: 1913,
  collection: "A Boy's Will",
  form: 'Two stanzas with refrain',
  text: `I'm going out to clean the pasture spring;
I'll only stop to rake the leaves away
(And wait to watch the water clear, I may):
I shan't be gone long.—You come too.

I'm going out to fetch the little calf
That's standing by the mother. It's so young,
It totters when she licks it with her tongue.
I shan't be gone long.—You come too.`,
  analysis: {
    overview: 'A quiet invitation that turns ordinary farm tasks into an offering of companionship.',
    lineByLine: [
      { lines: '1-4', commentary: 'The speaker reassures the listener and invites them into a small, attentive ritual with nature.' },
      { lines: '5-8', commentary: 'The calf scene adds tenderness, and the invitation is repeated to close the poem.' }
    ],
    themes: ['Companionship', 'Domestic labor', 'Nature', 'Tenderness'],
    literaryDevices: [
      { device: 'Refrain', example: 'You come too', explanation: 'The repeated invitation creates warmth and inclusion.' },
      { device: 'Imagery', example: 'water clear... little calf', explanation: 'Simple, concrete details ground the poem.' }
    ],
    historicalContext: 'Frost often framed rural chores as moments of intimacy and reflection in early 20th-century New England.'
  },
  seoDescription: 'The Pasture by Robert Frost with full text and analysis of its quiet invitation and rural imagery.'
};
