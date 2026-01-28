import { PoemAnalysis } from './index';

// Source: Project Gutenberg - Public Domain

export const sonnet65: PoemAnalysis = {
  slug: 'sonnet-65',
  title: 'Sonnet 65: Since brass, nor stone, nor earth, nor boundless sea',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `Since brass, nor stone, nor earth, nor boundless sea,
But sad mortality o'er-sways their power,
How with this rage shall beauty hold a plea,
Whose action is no stronger than a flower?
O, how shall summer's honey breath hold out
Against the wreckful siege of battering days,
When rocks impregnable are not so stout,
Nor gates of steel so strong, but Time decays?
O fearful meditation! where, alack,
Shall Time's best jewel from Time's chest lie hid?
Or what strong hand can hold his swift foot back?
Or who his spoil of beauty can forbid?
O, none, unless this miracle have might,
That in black ink my love may still shine bright.`,
  analysis: {
    overview: `Sonnet 65 argues from strength to weakness: if brass, stone, and steel fall to Time, how can beauty survive? The poem's desperation builds through questions—"how shall," "where," "what," "who"—until the only answer: "black ink." Poetry is the "miracle" against mortality.`,
    lineByLine: [
      { lines: '1-4', commentary: `If nothing strong survives, how can beauty—weak as a flower—"hold a plea" (mount a legal defense)?` },
      { lines: '5-8', commentary: `Summer breath vs. "battering days." Even impregnable rocks and steel gates decay.` },
      { lines: '9-12', commentary: `"Fearful meditation"—the speaker frightens himself. Where to hide Time's jewel from Time's chest (treasure box)?` },
      { lines: '13-14', commentary: `"O, none, unless this miracle"—only black ink offers hope. Despair yields to one solution.` }
    ],
    themes: ['Fragility of beauty', 'Time as destroyer', 'Poetry as miracle', 'Desperation and hope'],
    literaryDevices: [
      { device: 'Rhetorical Questions', example: 'How shall... where... what... who...', explanation: 'Accumulated questions build desperation before the answer.' },
      { device: 'Contrast', example: 'Brass/stone vs. flower/breath', explanation: 'Strong things fail, so fragile beauty has no chance—except through ink.' }
    ],
    historicalContext: `Companion to Sonnets 63-64, all meditating on Time's destruction. Part of the shift from procreation to poetry as solution.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 65 "Since brass, nor stone" - desperate questions about beauty\'s survival answered only by poetry.'
};
