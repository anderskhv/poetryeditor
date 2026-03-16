import { PoemAnalysis } from './index';

// Source: Public domain (Wordsworth died 1850)

export const sheDwelt: PoemAnalysis = {
  slug: 'she-dwelt-among-the-untrodden-ways',
  title: 'She Dwelt Among the Untrodden Ways',
  poet: 'William Wordsworth',
  poetBirth: 1770,
  poetDeath: 1850,
  year: 1800,
  collection: 'Lucy Poems',
  form: 'Three quatrains in ballad meter (ABAB rhyme)',
  text: `She dwelt among the untrodden ways
Beside the springs of Dove,
A Maid whom there were none to praise
And very few to love:

A violet by a mossy stone
Half hidden from the eye!
—Fair as a star, when only one
Is shining in the sky.

She lived unknown, and few could know
When Lucy ceased to be;
But she is in her grave, and, oh,
The difference to me!`,
  analysis: {
    overview: 'One of the five "Lucy poems," this elegy compresses a life and death into twelve lines. Lucy is defined by her obscurity — and the speaker\'s grief is defined by how invisible that loss is to everyone else.',
    lineByLine: [
      { lines: '1-4', commentary: 'Lucy is placed in isolation: "untrodden ways," "none to praise," "very few to love." The Dove is a real river in the Lake District, but the name carries symbolic gentleness.' },
      { lines: '5-8', commentary: 'Two contrasting similes: a violet half-hidden (modest, easily missed) and a solitary star (beautiful, singular). Together they capture someone who is both invisible and irreplaceable.' },
      { lines: '9-12', commentary: 'The death is announced with devastating understatement: "Lucy ceased to be." The world barely notices. The final exclamation — "The difference to me!" — carries all the poem\'s emotional weight in five words.' }
    ],
    themes: ['Quiet beauty', 'Grief', 'Obscurity and significance', 'Nature as mirror for human life', 'Loss'],
    literaryDevices: [
      { device: 'Simile', example: 'A violet by a mossy stone / Half hidden from the eye!', explanation: 'Lucy is compared to a flower that most people would walk past — beauty that requires attention to notice.' },
      { device: 'Simile', example: 'Fair as a star, when only one / Is shining in the sky', explanation: 'The second simile elevates Lucy: she is not just hidden but singular, like Venus alone at twilight.' },
      { device: 'Understatement', example: 'When Lucy ceased to be', explanation: 'Death rendered as simple cessation — no drama, no description, which makes the loss feel absolute.' },
      { device: 'Litotes', example: 'very few to love', explanation: '"Very few" implies almost none, intensifying Lucy\'s solitude without stating it directly.' }
    ],
    historicalContext: 'The identity of "Lucy" is one of English literature\'s enduring mysteries. Scholars have proposed Wordsworth\'s sister Dorothy, a childhood acquaintance, or a purely imagined figure. The Lucy poems were written in Germany in 1798-99, during a period of intense homesickness.'
  },
  seoDescription: 'She Dwelt Among the Untrodden Ways by William Wordsworth — full text and analysis of the Lucy poem about obscure beauty, loss, and private grief.'
};
