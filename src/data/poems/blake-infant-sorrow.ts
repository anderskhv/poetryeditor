import { PoemAnalysis } from './index';

// Source: Public domain (Blake died 1827)

export const infantSorrow: PoemAnalysis = {
  slug: 'infant-sorrow',
  title: 'Infant Sorrow',
  poet: 'William Blake',
  poetBirth: 1757,
  poetDeath: 1827,
  year: 1794,
  collection: 'Songs of Experience',
  form: 'Two quatrains in rhyming couplets',
  text: `My mother groand! my father wept.
Into the dangerous world I leapt:
Helpless, naked, piping loud:
Like a fiend hid in a cloud.

Struggling in my fathers hands:
Striving against my swadling bands:
Bound and weary I thought best
To sulk upon my mothers breast.`,
  analysis: {
    overview: 'The counterpart to "Infant Joy" in Songs of Innocence — here birth is violent entry into a hostile world, and the infant already knows resistance and resignation.',
    lineByLine: [
      { lines: '1-4', commentary: 'The parents groan and weep — birth is suffering for everyone. The baby "leapt" into a "dangerous world," active rather than passive. The simile "Like a fiend hid in a cloud" is startling: the infant is already perceived as potentially demonic, wrapped in flesh.' },
      { lines: '5-8', commentary: 'The baby struggles against the father\'s hands and swaddling bands — both literal restraint and metaphor for social constraint. The final couplet is devastating: the infant gives up ("thought best / To sulk"), choosing strategic submission over futile resistance.' }
    ],
    themes: ['Birth as trauma', 'Constraint and rebellion', 'Loss of freedom', 'Experience vs. innocence', 'Social control from birth'],
    literaryDevices: [
      { device: 'Simile', example: 'Like a fiend hid in a cloud', explanation: 'The newborn compared to a demon concealed in innocence — Blake suggests that society already projects danger onto the child.' },
      { device: 'Contrast with Companion Poem', example: 'Infant Sorrow vs. Infant Joy', explanation: 'Where "Infant Joy" is all tenderness and naming, this poem is all struggle and binding. Together they form Blake\'s dialectic of innocence and experience.' },
      { device: 'Assonance', example: 'Bound and weary I thought best', explanation: 'The heavy vowels slow the line down, enacting the exhaustion the infant feels.' },
      { device: 'Irony', example: 'I thought best / To sulk upon my mothers breast', explanation: 'The infant\'s "choice" to sulk is a calculated surrender — even comfort becomes a form of defeat.' }
    ],
    historicalContext: 'Blake wrote this as the Experience counterpart to "Infant Joy." Where that poem imagines a two-day-old baby joyfully accepting its name, this one shows birth as the first encounter with a world that binds and constrains. Blake\'s spelling ("groand," "swadling") reflects his original engraving.'
  },
  seoDescription: 'Infant Sorrow by William Blake — full text and analysis of the 1794 poem depicting birth as a violent entry into a constraining world.'
};
