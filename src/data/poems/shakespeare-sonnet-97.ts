import { PoemAnalysis } from './index';

// Source: Project Gutenberg - Public Domain

export const sonnet97: PoemAnalysis = {
  slug: 'sonnet-97',
  title: 'Sonnet 97: How like a winter hath my absence been',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `How like a winter hath my absence been
From thee, the pleasure of the fleeting year!
What freezings have I felt, what dark days seen!
What old December's bareness every where!
And yet this time removed was summer's time,
The teeming autumn, big with rich increase,
Bearing the wanton burden of the prime,
Like widow'd wombs after their lords' decease:
Yet this abundant issue seem'd to me
But hope of orphans and unfather'd fruit;
For summer and his pleasures wait on thee,
And, thou away, the very birds are mute;
Or, if they sing, 'tis with so dull a cheer
That leaves look pale, dreading the winter's near.`,
  analysis: {
    overview: `Sonnet 97 inverts seasons: the speaker's separation from the beloved made summer feel like winter. Even autumn's abundance seemed orphaned without the beloved's presence. Fertility without him is meaningless—"widow'd wombs," "unfather'd fruit." Joy itself depends on his company.`,
    lineByLine: [
      { lines: '1-4', commentary: `Absence = winter. The speaker felt freezing and "December's bareness" despite the calendar.` },
      { lines: '5-8', commentary: `It was actually summer/autumn, "big with rich increase." But harvests feel like widows' pregnancies—productionwithout joy.` },
      { lines: '9-12', commentary: `Abundance seemed like "orphans" without the father. Summer's pleasures "wait on thee."` },
      { lines: '13-14', commentary: `Birds sing dully; leaves "look pale, dreading winter." Without the beloved, nature itself mourns.` }
    ],
    themes: ['Absence as winter', 'Inverted seasons', 'Fertility without joy', 'Pathetic fallacy'],
    literaryDevices: [
      { device: 'Pathetic Fallacy', example: 'Birds mute, leaves pale', explanation: 'Nature reflects the speaker\'s emotional state.' },
      { device: 'Seasonal Inversion', example: 'Summer that feels like winter', explanation: 'Subjective experience overrides objective reality.' }
    ],
    historicalContext: `Part of a sequence about separation (97-99). May reflect an actual absence or emotional distance.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 97 "How like a winter" - absence makes summer feel like December.'
};
