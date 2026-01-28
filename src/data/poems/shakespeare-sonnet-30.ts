import { PoemAnalysis } from './index';

// Source: Project Gutenberg - Public Domain

export const sonnet30: PoemAnalysis = {
  slug: 'sonnet-30',
  title: 'Sonnet 30: When to the sessions of sweet silent thought',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `When to the sessions of sweet silent thought
I summon up remembrance of things past,
I sigh the lack of many a thing I sought,
And with old woes new wail my dear time's waste:
Then can I drown an eye, unused to flow,
For precious friends hid in death's dateless night,
And weep afresh love's long since cancell'd woe,
And moan the expense of many a vanish'd sight:
Then can I grieve at grievances foregone,
And heavily from woe to woe tell o'er
The sad account of fore-bemoaned moan,
Which I new pay as if not paid before.
But if the while I think on thee, dear friend,
All losses are restored and sorrows end.`,
  analysis: {
    overview: `Sonnet 30 uses legal and financial language for memory's pain. "Sessions" is a court sitting; the speaker "summons" memories like witnesses. Old griefs are debts "new paid as if not paid before." The accumulation of sorrow is relentless—until the couplet's rescue. Thinking of the beloved cancels all debts.`,
    lineByLine: [
      { lines: '1-4', commentary: `"Sessions" and "summon"—legal language for meditation. Memory becomes a courtroom trial of losses.` },
      { lines: '5-8', commentary: `Weeping for dead friends, cancelled loves, vanished sights. "Death's dateless night"—eternity of absence.` },
      { lines: '9-12', commentary: `"Grieve at grievances," "fore-bemoaned moan"—repetition enacts the endless replaying of sorrow. Debts never fully paid.` },
      { lines: '13-14', commentary: `"But"—the rescue. Thinking of the friend restores all losses. Love as total compensation.` }
    ],
    themes: ['Memory as trial', 'Grief as debt', 'Love as restoration', 'Past losses'],
    literaryDevices: [
      { device: 'Legal Metaphor', example: '"sessions," "summon," "cancell\'d"', explanation: 'Memory as courtroom; griefs as legal proceedings.' },
      { device: 'Financial Metaphor', example: '"expense," "account," "pay"', explanation: 'Sorrow as debt continually repaid.' }
    ],
    historicalContext: `Proust titled his novel after line 2. The legal language reflects Shakespeare's documented involvement in property and debt disputes.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 30 "When to the sessions of sweet silent thought" - memory, grief, and the famous line Proust borrowed.'
};
