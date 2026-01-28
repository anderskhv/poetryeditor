import { PoemAnalysis } from './index';

// Source: Public Domain (Crapsey died 1914, published 1915)

export const amaze: PoemAnalysis = {
  slug: 'amaze',
  title: 'Amaze',
  poet: 'Adelaide Crapsey',
  poetBirth: 1878,
  poetDeath: 1914,
  year: 1915,
  collection: 'Verse',
  form: 'Cinquain',
  text: `I know
Not these my hands
And yet I think there was
A woman like me once had hands
Like these.`,
  analysis: {
    overview: `Dissociation in five lines. The speaker looks at her own hands and doesn't recognize them—"I know not these my hands." Then a strange thought: some other woman "once" had similar hands. Crapsey was watching her body fail from tuberculosis; the poem captures the uncanny experience of the body becoming foreign.`,
    lineByLine: [
      { lines: '1-2', commentary: `"I know / Not these my hands"—inverted syntax emphasizes estrangement. These are my hands but I don't know them.` },
      { lines: '3', commentary: `"And yet I think there was"—reaching for explanation. Memory? Past self? The sentence stretches across lines.` },
      { lines: '4-5', commentary: `"A woman like me once"—she's become separate from her former self. "Had hands / Like these"—not the same hands, just similar. Identity has fractured.` }
    ],
    themes: ['Bodily estrangement', 'Illness and identity', 'The uncanny self', 'Time and the body'],
    literaryDevices: [
      { device: 'Dissociation', example: '"I know / Not these my hands"', explanation: 'The speaker splits from her own body—classic symptom of trauma or illness.' },
      { device: 'Temporal displacement', example: '"A woman like me once"', explanation: 'Past self becomes a different person entirely.' },
      { device: 'Cinquain compression', example: '22 syllables total', explanation: 'The tiny form intensifies the vertigo—no room to explain or comfort.' }
    ],
    historicalContext: `Crapsey spent her final years in a sanatorium watching her body deteriorate. Her cinquains often describe this experience of the body becoming alien. She died at 36, having invented a new poetic form to express what illness felt like.`
  },
  seoDescription: 'Analysis of Adelaide Crapsey\'s "Amaze" - the cinquain about bodily estrangement and not recognizing one\'s own hands.'
};
