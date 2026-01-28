import { PoemAnalysis } from './index';

// Source: Public Domain (Keats died 1821)

export const brightStar: PoemAnalysis = {
  slug: 'bright-star',
  title: 'Bright Star',
  poet: 'John Keats',
  poetBirth: 1795,
  poetDeath: 1821,
  year: 1819,
  collection: 'Posthumous',
  form: 'Shakespearean Sonnet',
  text: `Bright star, would I were stedfast as thou art—
Not in lone splendour hung aloft the night
And watching, with eternal lids apart,
Like nature's patient, sleepless Eremite,
The moving waters at their priestlike task
Of pure ablution round earth's human shores,
Or gazing on the new soft-fallen mask
Of snow upon the mountains and the moors—
No—yet still stedfast, still unchangeable,
Pillow'd upon my fair love's ripening breast,
To feel for ever its soft fall and swell,
Awake for ever in a sweet unrest,
Still, still to hear her tender-taken breath,
And so live ever—or else swoon to death.`,
  analysis: {
    overview: `Keats wants the star's steadfastness but not its isolation. The octave describes eternal watching—cold, distant, sleepless. "No—" he pivots—he wants constancy while "pillow'd" on his love's breast, feeling her breath forever. Eternal intimacy, not eternal solitude.`,
    lineByLine: [
      { lines: '1-8', commentary: `The star watches eternally but alone—a "sleepless Eremite" (hermit). It sees waters and snow but touches nothing.` },
      { lines: '9-14', commentary: `"No—yet still stedfast"—he wants permanence but warm, intimate. Living forever in "sweet unrest" or dying in the attempt.` }
    ],
    themes: ['Constancy and intimacy', 'Eternal love', 'Isolation versus connection', 'Desire for permanence'],
    literaryDevices: [
      { device: 'Volta', example: '"No—yet still stedfast"', explanation: 'Sharp rejection of cold eternity for warm permanence.' },
      { device: 'Oxymoron', example: '"sweet unrest"', explanation: 'The desired state isn\'t static peace but loving wakefulness.' }
    ],
    historicalContext: `Possibly revised on Keats's final voyage to Italy in 1820, where he died. Fanny Brawne was his love. The poem merges cosmic and intimate scales.`
  },
  seoDescription: 'Analysis of Keats\'s "Bright Star" - the sonnet wanting stellar constancy but human warmth.'
};
