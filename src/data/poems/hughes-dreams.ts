import { PoemAnalysis } from './index';

// Source: Public domain (published 1923)

export const dreams: PoemAnalysis = {
  slug: 'dreams',
  title: 'Dreams',
  poet: 'Langston Hughes',
  poetBirth: 1901,
  poetDeath: 1967,
  year: 1923,
  form: 'Two quatrains with irregular rhyme',
  text: `Hold fast to dreams
For if dreams die
Life is a broken-winged bird
That cannot fly.

Hold fast to dreams
For when dreams go
Life is a barren field
Frozen with snow.`,
  analysis: {
    overview: 'In just eight lines, Hughes makes the case that dreams are essential to life through two vivid metaphors — a crippled bird and a frozen field. The poem\'s simplicity gives it the force of a proverb.',
    lineByLine: [
      { lines: '1-4', commentary: 'The first stanza opens with an imperative ("Hold fast") and presents the consequence of losing dreams: life becomes a broken-winged bird. The image is of something alive but grounded, capable of flight but denied it.' },
      { lines: '5-8', commentary: 'The second stanza mirrors the first but shifts from a living creature to a landscape. A barren field frozen with snow is life without aspiration — not just empty but locked in cold, unable to produce anything.' }
    ],
    themes: ['Hope', 'Aspiration', 'The necessity of dreams', 'Loss and emptiness'],
    literaryDevices: [
      { device: 'Simile', example: 'Life is a broken-winged bird / That cannot fly', explanation: 'Life without dreams is compared to a bird that has lost its essential capacity — the ability to take flight.' },
      { device: 'Simile', example: 'Life is a barren field / Frozen with snow', explanation: 'The second comparison shifts from animate to inanimate, suggesting that without dreams, life loses not just movement but fertility.' },
      { device: 'Anaphora', example: 'Hold fast to dreams / For if... Hold fast to dreams / For when', explanation: 'The parallel structure of the two stanzas gives the poem an incantatory, almost hymn-like quality.' },
      { device: 'Imperative mood', example: 'Hold fast to dreams', explanation: 'The direct command gives the poem urgency — this is not a suggestion but a plea.' }
    ],
    historicalContext: 'Written during the early Harlem Renaissance, the poem carries particular weight in the context of African American aspiration. For a community facing systemic barriers, the insistence on holding fast to dreams is both personal and political.'
  },
  seoDescription: 'Dreams by Langston Hughes — full text and analysis of this eight-line poem about the vital importance of holding onto dreams, with its iconic broken-winged bird metaphor.'
};
