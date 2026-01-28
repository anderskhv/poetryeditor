import { PoemAnalysis } from './index';

// Source: Project Gutenberg - Public Domain

export const sonnet12: PoemAnalysis = {
  slug: 'sonnet-12',
  title: 'Sonnet 12: When I do count the clock that tells the time',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `When I do count the clock that tells the time,
And see the brave day sunk in hideous night;
When I behold the violet past prime,
And sable curls all silver'd o'er with white;
When lofty trees I see barren of leaves
Which erst from heat did canopy the herd,
And summer's green all girded up in sheaves
Borne on the bier with white and bristly beard,
Then of thy beauty do I question make,
That thou among the wastes of time must go,
Since sweets and beauties do themselves forsake
And die as fast as they see others grow;
And nothing 'gainst Time's scythe can make defence
Save breed, to brave him when he takes thee hence.`,
  analysis: {
    overview: `Sonnet 12 catalogs decay: clocks, sunset, wilting violets, graying hair, bare trees, harvested grain. Each image adds to a cumulative case against beauty's permanence. The argument is stark—nothing defends against Time's scythe except children. This is the procreation argument at its most elemental.`,
    lineByLine: [
      { lines: '1-4', commentary: `Four images of passing time: clock, sunset, fading violet, hair turning white. Each marks decline.` },
      { lines: '5-8', commentary: `Trees lose leaves; summer becomes harvested sheaves carried like a corpse ("bier"). Nature enacts death.` },
      { lines: '9-12', commentary: `"Then of thy beauty do I question make"—after all this evidence, how can your beauty last? It cannot.` },
      { lines: '13-14', commentary: `The answer: only "breed" (children) can "brave" Time. The scythe image makes death agricultural—inevitable harvest.` }
    ],
    themes: ['Time as destroyer', 'Natural cycles of decay', 'Procreation as defense', 'Mortality'],
    literaryDevices: [
      { device: 'Catalogue', example: 'Clock, sunset, violet, hair, trees, sheaves', explanation: 'Accumulated images build overwhelming evidence of decay.' },
      { device: 'Personification', example: "Time's scythe", explanation: 'Time as grim reaper, harvesting all beauty.' }
    ],
    historicalContext: `Part of the procreation sonnets urging the Fair Youth to have children as defense against mortality.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 12 - the famous meditation on time and decay, arguing only children can defeat mortality.'
};
