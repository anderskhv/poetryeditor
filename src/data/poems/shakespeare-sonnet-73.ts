import { PoemAnalysis } from './index';

export const sonnet73: PoemAnalysis = {
  slug: 'sonnet-73',
  title: 'Sonnet 73: That time of year thou mayst in me behold',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `That time of year thou mayst in me behold
When yellow leaves, or none, or few, do hang
Upon those boughs which shake against the cold,
Bare ruined choirs, where late the sweet birds sang.
In me thou see'st the twilight of such day
As after sunset fadeth in the west,
Which by and by black night doth take away,
Death's second self, that seals up all in rest.
In me thou see'st the glowing of such fire
That on the ashes of his youth doth lie,
As the death-bed whereon it must expire,
Consumed with that which it was nourished by.
This thou perceiv'st, which makes thy love more strong,
To love that well which thou must leave ere long.`,
  analysis: {
    overview: `Sonnet 73 is Shakespeare's meditation on aging, built from three shrinking metaphors: a year becomes a day becomes a fire. Each image compresses time further—seasons to hours to the moment before extinction. The poem's argument is counterintuitive: knowing someone will die should make you love them more, not less. But there's a manipulation here. Shakespeare is essentially saying "look how old I am" to intensify the beloved's affection. Is this genuine vulnerability or emotional leverage? The "bare ruined choirs" line—comparing leafless branches to destroyed churches—is one of the most analyzed in English poetry, layering natural decay with religious destruction.`,
    lineByLine: [
      {
        lines: '1-4',
        commentary: `The first metaphor: late autumn. "Yellow leaves, or none, or few"—the hesitation ("or none, or few") enacts the counting of remaining leaves. "Bare ruined choirs" compares branches to the choir lofts of dissolved monasteries (Henry VIII's Reformation). Where birds sang, now nothing—nature and religion share the same ruins.`
      },
      {
        lines: '5-8',
        commentary: `The second metaphor: twilight. Time compresses from a year to a day. "Fadeth in the west" is both literal sunset and the direction of death. "Death's second self" is sleep/night, but calling it death's twin makes rest sound final. "Seals up" suggests both closing eyes and sealing a tomb.`
      },
      {
        lines: '9-12',
        commentary: `The third metaphor: dying fire. Now time is moments—the last glow before extinction. "Ashes of his youth" means the fire lies on what it already burned. "Consumed with that which it was nourished by"—a devastating line: we're destroyed by what once fed us. Youth itself becomes the death-bed.`
      },
      {
        lines: '13-14',
        commentary: `The couplet turns observation into argument. You perceive all this decay, "which makes thy love more strong." Why? Because "thou must leave ere long"—you'll lose me soon. The emotional logic: urgency intensifies love. But who's leaving whom? "Leave" is ambiguous—departure or death.`
      }
    ],
    themes: [
      'Aging and mortality',
      'The compression of time',
      'Love intensified by loss',
      'Self-consumption and decay',
      'The observer\'s role in defining the self'
    ],
    literaryDevices: [
      {
        device: 'Extended Metaphor (Conceit)',
        example: 'Three metaphors: autumn, twilight, dying fire',
        explanation: 'Each metaphor compresses time further (year → day → moment), accelerating toward death.'
      },
      {
        device: 'Allusion',
        example: '"Bare ruined choirs"',
        explanation: 'References the destroyed monasteries of the English Reformation, adding historical tragedy to natural decay.'
      },
      {
        device: 'Paradox',
        example: '"Consumed with that which it was nourished by"',
        explanation: 'What feeds us eventually destroys us—youth becomes the fuel for aging.'
      }
    ],
    historicalContext: `The "bare ruined choirs" likely alludes to the dissolution of the monasteries (1536-41) under Henry VIII. Shakespeare grew up seeing these ruins. The sonnet was probably written when Shakespeare was in his late 30s—not old, but actors aged faster in the period. The intimate "thou perceiv'st" suggests the beloved is watching the speaker age in real time.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 73 "That time of year thou mayst in me behold" - the famous meditation on aging through images of autumn, twilight, and dying fire.'
};
