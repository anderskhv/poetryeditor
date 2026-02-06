import { PoemAnalysis } from './index';

// Source: Public domain (1862)

export const remember: PoemAnalysis = {
  slug: 'remember',
  title: 'Remember',
  poet: 'Christina Rossetti',
  poetBirth: 1830,
  poetDeath: 1894,
  year: 1862,
  collection: 'Goblin Market and Other Poems',
  form: 'Petrarchan sonnet',
  text: `Remember me when I am gone away,
Gone far away into the silent land;
When you can no more hold me by the hand,
Nor I half turn to go yet turning stay.
Remember me when no more day by day
You tell me of our future that you planned:
Only remember me; you understand
It will be late to counsel then or pray.

Yet if you should forget me for a while
And afterwards remember, do not grieve:
For if the darkness and corruption leave
A vestige of the thoughts that once I had,
Better by far you should forget and smile
Than that you should remember and be sad.`,
  analysis: {
    overview: 'Rossetti’s speaker asks to be remembered after death, then gently releases the beloved from that duty.',
    lineByLine: [
      { lines: '1-8', commentary: 'The octave insists on remembrance after death and acknowledges the finality of separation.' },
      { lines: '9-14', commentary: 'The sestet reverses the request: forgetting is kinder than sorrowful memory.' }
    ],
    themes: ['Grief', 'Memory', 'Love', 'Selflessness', 'Death'],
    literaryDevices: [
      { device: 'Volta', example: 'Yet if you should forget me', explanation: 'The turn shifts from demand to release.' },
      { device: 'Alliteration', example: 'forget and smile', explanation: 'Soft sounds underscore the gentle concession.' }
    ],
    historicalContext: 'Rossetti’s devotional sensibility often tempers passion with restraint; this sonnet exemplifies that balance.'
  },
  seoDescription: 'Remember by Christina Rossetti with full text and analysis of its tender meditation on memory after death.'
};
