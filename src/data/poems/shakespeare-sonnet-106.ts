import { PoemAnalysis } from './index';

// Source: Project Gutenberg - Public Domain

export const sonnet106: PoemAnalysis = {
  slug: 'sonnet-106',
  title: 'Sonnet 106: When in the chronicle of wasted time',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `When in the chronicle of wasted time
I see descriptions of the fairest wights,
And beauty making beautiful old rhyme
In praise of ladies dead and lovely knights,
Then, in the blazon of sweet beauty's best,
Of hand, of foot, of lip, of eye, of brow,
I see their antique pen would have express'd
Even such a beauty as you master now.
So all their praises are but prophecies
Of this our time, all you prefiguring;
And, for they look'd but with divining eyes,
They had not skill enough your worth to sing:
For we, which now behold these present days,
Had eyes to wonder, but lack tongues to praise.`,
  analysis: {
    overview: `Sonnet 106 claims that all past poetry was prophecy of the beloved's beauty. When old poets praised dead beauties, they were unknowingly describing this person. Yet even now, with him present, we "lack tongues to praise" him. Beauty exceeds language in every era.`,
    lineByLine: [
      { lines: '1-4', commentary: `"Chronicle of wasted time"—history, old poetry. Past poets praised "ladies dead and lovely knights."` },
      { lines: '5-8', commentary: `The "blazon" (catalogue of features) describes hands, feet, lips—they were really describing you.` },
      { lines: '9-12', commentary: `All past praise was prophecy. They "divined" your beauty but couldn't fully express it.` },
      { lines: '13-14', commentary: `And we're no better—we see him clearly but still "lack tongues to praise." Beauty defeats language.` }
    ],
    themes: ['Beauty beyond words', 'Past as prophecy', 'Insufficiency of praise', 'Literary tradition'],
    literaryDevices: [
      { device: 'Blazon', example: 'Hand, foot, lip, eye, brow', explanation: 'Conventional catalogue of beauties—here shown as inadequate.' },
      { device: 'Conceit', example: 'Past poetry as prophecy', explanation: 'All literary history foretold this one person—extravagant flattery.' }
    ],
    historicalContext: `References the blazon tradition from Petrarch through Elizabethan poetry. The "chronicle of wasted time" may refer to actual chronicles or to poetry.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 106 "When in the chronicle of wasted time" - all past poetry as prophecy of the beloved.'
};
