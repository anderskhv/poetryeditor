import { PoemAnalysis } from './index';

// Source: Public Domain (Dickinson died 1886)

export const dickinson712: PoemAnalysis = {
  slug: 'because-i-could-not-stop-for-death',
  title: 'Because I could not stop for Death (712)',
  poet: 'Emily Dickinson',
  poetBirth: 1830,
  poetDeath: 1886,
  year: 1863,
  collection: 'Poems (1890)',
  form: 'Ballad Meter',
  text: `Because I could not stop for Death –
He kindly stopped for me –
The Carriage held but just Ourselves –
And Immortality.

We slowly drove – He knew no haste
And I had put away
My labor and my leisure too,
For His Civility –

We passed the School, where Children strove
At Recess – in the Ring –
We passed the Fields of Gazing Grain –
We passed the Setting Sun –

Or rather – He passed Us –
The Dews drew quivering and Chill –
For only Gossamer, my Gown –
My Tippet – only Tulle –

We paused before a House that seemed
A Swelling of the Ground –
The Roof was scarcely visible –
The Cornice – in the Ground –

Since then – 'tis Centuries – and yet
Feels shorter than the Day
I first surmised the Horses' Heads
Were toward Eternity –`,
  analysis: {
    overview: `Death as gentleman caller—polite, patient, driving slowly. The poem domesticates mortality: a carriage ride past life's stages (school, fields, sunset) ending at a grave described as a "house." But the final stanza's time warp ("Centuries" feeling "shorter than the Day") unsettles the cozy allegory. Eternity isn't rest; it's disorientation.`,
    lineByLine: [
      { lines: '1-4', commentary: `Death "kindly stopped"—courtesy, not menace. "Immortality" rides along as chaperone. The threesome is oddly social.` },
      { lines: '21-24', commentary: `"Centuries" passing like a day inverts normal time. The speaker realizes only at the end where they're going: "toward Eternity."` }
    ],
    themes: ['Death as transition', 'Time and eternity', 'Life stages', 'The domestication of mortality'],
    literaryDevices: [
      { device: 'Personification', example: 'Death as courteous suitor', explanation: 'Making Death polite makes the poem more unsettling, not less—gentility masks finality.' },
      { device: 'Euphemism', example: 'Grave as "House," "Swelling of the Ground"', explanation: 'Indirect language for the grave echoes how we avoid discussing death directly.' }
    ],
    historicalContext: `Written around 1863, unpublished until 1890. Dickinson wrote extensively about death without apparent fear—possibly because death was common in her era. Several close friends and her nephew died young.`
  },
  seoDescription: 'Analysis of Dickinson\'s "Because I could not stop for Death" - the famous poem reimagining death as a gentleman caller.'
};
