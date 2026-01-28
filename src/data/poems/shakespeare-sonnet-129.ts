import { PoemAnalysis } from './index';

// Source: Project Gutenberg - Public Domain

export const sonnet129: PoemAnalysis = {
  slug: 'sonnet-129',
  title: 'Sonnet 129: The expense of spirit in a waste of shame',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `The expense of spirit in a waste of shame
Is lust in action; and till action, lust
Is perjured, murderous, bloody, full of blame,
Savage, extreme, rude, cruel, not to trust,
Enjoy'd no sooner but despised straight,
Past reason hunted, and no sooner had
Past reason hated, as a swallow'd bait
On purpose laid to make the taker mad:
Mad in pursuit and in possession so;
Had, having, and in quest to have, extreme;
A bliss in proof, and proved, a very woe;
Before, a joy proposed; behind, a dream.
All this the world well knows; yet none knows well
To shun the heaven that leads men to this hell.`,
  analysis: {
    overview: `Sonnet 129 is Shakespeare's most violent poem—a furious catalogue of self-disgust about sexual desire. "Lust in action" wastes spirit (semen/soul) in shame. The poem's rhythm enacts compulsion: adjectives pile up breathlessly. The bitter couplet admits we know all this yet can't stop.`,
    lineByLine: [
      { lines: '1-4', commentary: `"Expense of spirit"—semen and soul spent wastefully. Lust is "perjured, murderous, bloody"—extreme condemnation.` },
      { lines: '5-8', commentary: `Enjoyed then despised. "Swallowed bait" makes desire a trap. We know it's poisoned and bite anyway.` },
      { lines: '9-12', commentary: `"Mad in pursuit and in possession so"—madness before and after. "Had, having, in quest"—all tenses are extreme.` },
      { lines: '13-14', commentary: `"The world well knows; yet none knows well"—knowledge doesn't prevent action. Heaven leads to hell.` }
    ],
    themes: ['Sexual self-disgust', 'Desire as madness', 'Compulsion', 'Knowledge without wisdom'],
    literaryDevices: [
      { device: 'Accumulation', example: 'Perjured, murderous, bloody, savage...', explanation: 'Adjectives pile up breathlessly, enacting loss of control.' },
      { device: 'Paradox', example: 'Heaven that leads men to this hell', explanation: 'Pleasure leads to damnation; knowing this changes nothing.' }
    ],
    historicalContext: `Perhaps the most intense of the Dark Lady sonnets. "Spirit" meant both soul and semen in Renaissance usage.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 129 "The expense of spirit" - the furious poem about lust, shame, and sexual self-disgust.'
};
