import { PoemAnalysis } from './index';

// Source: Public Domain (Dickinson died 1886)

export const dickinson254: PoemAnalysis = {
  slug: 'hope-is-the-thing-with-feathers',
  title: '"Hope" is the thing with feathers (254)',
  poet: 'Emily Dickinson',
  poetBirth: 1830,
  poetDeath: 1886,
  year: 1861,
  collection: 'Poems (1891)',
  form: 'Common Meter',
  text: `"Hope" is the thing with feathers –
That perches in the soul –
And sings the tune without the words –
And never stops – at all –

And sweetest – in the Gale – is heard –
And sore must be the storm –
That could abash the little Bird
That kept so many warm –

And I've heard it in the chillest land –
And on the strangest Sea –
Yet – never – in Extremity,
It asked a crumb – of me.`,
  analysis: {
    overview: `Hope as bird—one of Dickinson's most beloved poems and one of her simplest. The bird sings without words (hope doesn't explain itself), never stops (hope is persistent), survives gales (hope endures crisis), and asks nothing in return (hope is free). Unusual for Dickinson: optimism without qualification.`,
    lineByLine: [
      { lines: '1-4', commentary: `"Thing with feathers" avoids naming the bird—hope remains abstract even in metaphor. "Tune without the words" is hope's nonverbal comfort.` },
      { lines: '9-12', commentary: `"Chillest land," "strangest Sea"—hope appears in extremity. "Never... asked a crumb" emphasizes hope's generosity. It gives without taking.` }
    ],
    themes: ['Hope as natural resilience', 'Comfort without explanation', 'Persistence through crisis', 'Unconditional gift'],
    literaryDevices: [
      { device: 'Extended Metaphor', example: 'Hope as bird throughout', explanation: 'The bird conceit sustains the whole poem—hope has feathers, perches, sings, is heard in storms.' },
      { device: 'Personification', example: 'Hope that "never stops," "kept so many warm"', explanation: 'Hope acts with intention, providing warmth and refusing silence.' }
    ],
    historicalContext: `One of Dickinson's most accessible poems, often taught in schools. Its relative simplicity is unusual for her—some critics find it too easy. But placed among her darker poems, it reads as hard-won affirmation rather than naivety.`
  },
  seoDescription: 'Analysis of Dickinson\'s "Hope is the thing with feathers" - the famous poem comparing hope to a resilient bird in the soul.',
  abstractWords: ['hope', 'soul', 'warm', 'sweet'],
  rhymingPairs: [
    { word1: 'soul', word2: 'all' },
    { word1: 'heard', word2: 'bird' },
    { word1: 'sea', word2: 'me' }
  ]
};
