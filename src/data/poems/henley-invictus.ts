import { PoemAnalysis } from './index';

// Source: Public Domain (Henley died 1903)

export const invictus: PoemAnalysis = {
  slug: 'invictus',
  title: 'Invictus',
  poet: 'William Ernest Henley',
  poetBirth: 1849,
  poetDeath: 1903,
  year: 1875,
  form: 'Four quatrains in iambic tetrameter',
  text: `Out of the night that covers me,
Black as the pit from pole to pole,
I thank whatever gods may be
For my unconquerable soul.

In the fell clutch of circumstance
I have not winced nor cried aloud.
Under the bludgeonings of chance
My head is bloody, but unbowed.

Beyond this place of wrath and tears
Looms but the Horror of the shade,
And yet the menace of the years
Finds and shall find me unafraid.

It matters not how strait the gate,
How charged with punishments the scroll,
I am the master of my fate,
I am the captain of my soul.`,
  analysis: {
    overview: `"Invictus" is a Victorian stoic manifesto. Written from a hospital bed after leg amputation, Henley refuses self-pity. The poem acknowledges suffering ("bloody, but unbowed") without surrendering to it. The famous final lines—"I am the master of my fate, / I am the captain of my soul"—declare radical self-determination. This is defiance as philosophy: circumstances can wound but cannot conquer.`,
    lineByLine: [
      { lines: '1-4', commentary: `"Night" and "pit" establish total darkness—suffering as absolute. But "I thank whatever gods may be"—gratitude despite agnosticism—"for my unconquerable soul." The soul remains intact regardless of external conditions.` },
      { lines: '5-8', commentary: `"Fell clutch of circumstance"—fate grips cruelly. "I have not winced nor cried aloud"—stoic silence under torture. "Bludgeonings of chance"—life beats randomly. "Bloody, but unbowed"—damaged but not defeated.` },
      { lines: '9-12', commentary: `"This place of wrath and tears"—the world, or the hospital. Death ("the Horror of the shade") looms ahead. Yet "the menace of the years / Finds and shall find me unafraid." Past and future threats cannot frighten him.` },
      { lines: '13-16', commentary: `"Strait the gate"—the difficult passage (echoing Matthew 7:14). "Charged with punishments the scroll"—judgment awaits. But the conclusion is absolute: "I am the master of my fate, / I am the captain of my soul." Self-sovereignty, regardless of circumstances or afterlife.` }
    ],
    themes: ['Stoic defiance', 'Self-determination', 'Courage under suffering', 'Mastery of fate', 'The unconquerable will'],
    literaryDevices: [
      { device: 'Metaphor', example: 'Night, pit, shade', explanation: 'Darkness images represent suffering, despair, and death—all acknowledged, none surrendered to.' },
      { device: 'Anaphora', example: 'I am the master... I am the captain', explanation: 'Parallel declarations emphasize self-command.' },
      { device: 'Allusion', example: 'Strait the gate', explanation: 'Biblical reference to the narrow gate of salvation, but here redirected to personal agency rather than divine grace.' },
      { device: 'Latin title', example: 'Invictus', explanation: 'Means "unconquered"—sets the defiant tone before the poem begins.' }
    ],
    historicalContext: `Written in 1875 while Henley was hospitalized for tuberculosis of the bone. His left leg was amputated below the knee; he saved the right by insisting on experimental treatment under Joseph Lister. Nelson Mandela reportedly recited this poem to fellow prisoners on Robben Island. Timothy McVeigh quoted it before his execution. The poem has become a touchstone for anyone facing extreme adversity.`
  },
  seoDescription: 'Analysis of Invictus by William Ernest Henley - the powerful 1875 poem of resilience and unconquerable spirit.',
  abstractWords: ['soul', 'fate', 'courage', 'horror', 'unconquerable'],
  rhymingPairs: [
    { word1: 'me', word2: 'be' },
    { word1: 'aloud', word2: 'unbowed' },
    { word1: 'shade', word2: 'unafraid' },
    { word1: 'gate', word2: 'fate' }
  ]
};
