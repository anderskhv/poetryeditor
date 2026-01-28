import { PoemAnalysis } from './index';

// Source: Public Domain (Blake died 1827)

export const theLamb: PoemAnalysis = {
  slug: 'the-lamb',
  title: 'The Lamb',
  poet: 'William Blake',
  poetBirth: 1757,
  poetDeath: 1827,
  year: 1789,
  collection: 'Songs of Innocence',
  form: 'Lyric',
  text: `Little Lamb who made thee
Dost thou know who made thee
Gave thee life & bid thee feed.
By the stream & o'er the mead;
Gave thee clothing of delight,
Softest clothing wooly bright;
Gave thee such a tender voice,
Making all the vales rejoice!
Little Lamb who made thee
Dost thou know who made thee

Little Lamb I'll tell thee,
Little Lamb I'll tell thee!
He is called by thy name,
For he calls himself a Lamb:
He is meek & he is mild,
He became a little child:
I a child & thou a lamb,
We are called by his name.
Little Lamb God bless thee.
Little Lamb God bless thee.`,
  analysis: {
    overview: `"The Lamb" has easy answers where "The Tyger" has none. Who made the lamb? Jesus, who is also called a Lamb. Child, lamb, Christ—all merge. The simplicity is deliberate: Innocence provides comfort that Experience will question.`,
    lineByLine: [
      { lines: '1-10', commentary: `A child asks the lamb who made it. The creature's gifts are listed: food, wool, voice. All benign.` },
      { lines: '11-20', commentary: `The answer is easy: Christ, who "calls himself a Lamb." Child, lamb, and God become one.` }
    ],
    themes: ['Innocence and faith', 'Christ as Lamb', 'Childhood and simplicity', 'Creation as gift'],
    literaryDevices: [
      { device: 'Repetition', example: 'Little Lamb', explanation: 'Incantatory repetition creates lullaby-like comfort.' },
      { device: 'Dramatic Monologue', example: 'Child speaking to lamb', explanation: 'The speaker is a child, explaining faith in childlike terms.' }
    ],
    historicalContext: `From Songs of Innocence (1789), paired with "The Tyger" (1794) in Songs of Experience. The two poems are designed to be read together.`
  },
  seoDescription: 'Analysis of Blake\'s "The Lamb" - the innocent companion piece to "The Tyger" with easy answers about creation.'
};
