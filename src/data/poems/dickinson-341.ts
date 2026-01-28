import { PoemAnalysis } from './index';

// Source: Public Domain (Dickinson died 1886)

export const dickinson341: PoemAnalysis = {
  slug: 'after-great-pain',
  title: 'After great pain, a formal feeling comes (341)',
  poet: 'Emily Dickinson',
  poetBirth: 1830,
  poetDeath: 1886,
  year: 1862,
  collection: 'Poems (1929)',
  form: 'Free Verse',
  text: `After great pain, a formal feeling comes –
The Nerves sit ceremonious, like Tombs –
The stiff Heart questions 'was it He, that bore,'
And 'Yesterday, or Centuries before'?

The Feet, mechanical, go round –
A Wooden way
Of Ground, or Air, or Ought –
Regardless grown,
A Quartz contentment, like a stone –

This is the Hour of Lead –
Remembered, if outlived,
As Freezing persons, recollect the Snow –
First – Chill – then Stupor – then the letting go –`,
  analysis: {
    overview: `Dickinson's anatomy of shock. After trauma, the body goes mechanical: nerves "sit ceremonious," feet move "wooden," the heart can't locate pain in time. The final progression—"Chill – then Stupor – then the letting go"—describes both freezing to death and emotional numbness. Survival isn't guaranteed; the poem only says "if outlived."`,
    lineByLine: [
      { lines: '1-4', commentary: `"Formal feeling"—grief as ceremony. The heart's confused questions ("He" = Christ? pain?) show dissociation. Time collapses: "Yesterday, or Centuries."` },
      { lines: '10-13', commentary: `"Hour of Lead" captures heaviness. The freezing metaphor makes numbness literal—first you feel cold, then nothing. "Letting go" is ambiguous: release or death.` }
    ],
    themes: ['Trauma and dissociation', 'Emotional numbness', 'The body in grief', 'Survival uncertain'],
    literaryDevices: [
      { device: 'Personification', example: 'Nerves sit, Heart questions, Feet mechanical', explanation: 'Body parts act independently—the self is fragmented by pain.' },
      { device: 'Simile', example: '"like Tombs," "like a stone"', explanation: 'Comparisons to dead things (tombs, quartz, stone) make the living person corpse-like.' }
    ],
    historicalContext: `Possibly written during a period of intense personal crisis in 1862. Dickinson sent many poems to Thomas Wentworth Higginson that year, seeking guidance. The biographical source of the "great pain" remains unknown.`
  },
  seoDescription: 'Analysis of Dickinson\'s "After great pain, a formal feeling comes" - the poem mapping emotional numbness and trauma\'s aftermath.'
};
