import { PoemAnalysis } from './index';

// Source: Project Gutenberg - Public Domain

export const sonnet55: PoemAnalysis = {
  slug: 'sonnet-55',
  title: 'Sonnet 55: Not marble, nor the gilded monuments',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `Not marble, nor the gilded monuments
Of princes, shall outlive this powerful rhyme;
But you shall shine more bright in these contents
Than unswept stone besmear'd with sluttish time.
When wasteful war shall statues overturn,
And broils root out the work of masonry,
Nor Mars his sword nor war's quick fire shall burn
The living record of your memory.
'Gainst death and all-oblivious enmity
Shall you pace forth; your praise shall still find room
Even in the eyes of all posterity
That wear this world out to the ending doom.
So, till the judgment that yourself arise,
You live in this, and dwell in lovers' eyes.`,
  analysis: {
    overview: `Sonnet 55 makes poetry's boldest claim: verse outlasts stone. Monuments crumble, statues fall to war, but poetry survives. This shifts from the procreation argument—now immortality comes through art, not children. Shakespeare proved himself right; the beloved lives because this poem endures.`,
    lineByLine: [
      { lines: '1-4', commentary: `Marble and gilded monuments will not outlive "this powerful rhyme." Stone becomes "sluttish" (slovenly) with time.` },
      { lines: '5-8', commentary: `War destroys statues and masonry, but neither sword nor fire can burn "the living record" of poetry.` },
      { lines: '9-12', commentary: `Against death itself, "you pace forth"—the beloved walks through time, praised until "ending doom."` },
      { lines: '13-14', commentary: `Until Judgment Day when you physically rise, you live in this poem and in readers' eyes.` }
    ],
    themes: ['Poetry as immortality', 'Art versus physical monuments', 'Defying time through verse', 'War and destruction'],
    literaryDevices: [
      { device: 'Contrast', example: 'Marble vs. rhyme', explanation: 'Physical permanence fails; textual permanence endures.' },
      { device: 'Personification', example: '"sluttish time"', explanation: 'Time as careless figure neglecting monuments.' }
    ],
    historicalContext: `Shifts from procreation sonnets to poetry-as-immortality theme. Shakespeare echoes Horace and Ovid's claims that poetry outlasts bronze.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 55 "Not marble, nor the gilded monuments" - the famous claim that poetry outlasts stone.'
};
