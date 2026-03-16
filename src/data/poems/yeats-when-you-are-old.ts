import { PoemAnalysis } from './index';

// Source: Public domain (published 1893 / poet died 1939)

export const whenYouAreOld: PoemAnalysis = {
  slug: 'when-you-are-old',
  title: 'When You Are Old',
  poet: 'W. B. Yeats',
  poetBirth: 1865,
  poetDeath: 1939,
  year: 1893,
  collection: 'The Rose',
  form: 'Three quatrains in iambic pentameter with an ABBA rhyme scheme',
  text: `When you are old and grey and full of sleep,
And nodding by the fire, take down this book,
And slowly read, and dream of the soft look
Your eyes had once, and of their shadows deep;

How many loved your moments of glad grace,
And loved your beauty with love false or true,
But one man loved the pilgrim soul in you,
And loved the sorrows of your changing face;

And bending down beside the glowing bars,
Murmur, a little sadly, how Love fled
And paced upon the mountains overhead
And hid his face amid a crowd of stars.`,
  analysis: {
    overview: 'Yeats addresses his beloved Maud Gonne, asking her to imagine old age and reflect on the one man who loved her soul rather than her beauty — a poignant meditation on unrequited love and the passage of time.',
    lineByLine: [
      { lines: '1-4', commentary: 'The speaker projects the beloved into old age, imagining her drowsy by a fire, taking down a book (this very poem) and remembering her former beauty.' },
      { lines: '5-8', commentary: 'A contrast between the many who loved her outward grace and the one man — the speaker — who loved her "pilgrim soul," her restless inner spirit, and even the sorrows etched on her aging face.' },
      { lines: '9-12', commentary: 'The poem closes with Love personified as a figure who has fled to the mountains and hidden among the stars — unreachable, cosmic, and tinged with sadness.' }
    ],
    themes: ['Unrequited love', 'Aging', 'Beauty versus soul', 'Memory', 'Loss'],
    literaryDevices: [
      { device: 'Personification', example: 'how Love fled / And paced upon the mountains overhead', explanation: 'Love becomes a living figure who departs and hides, dramatizing the speaker\'s loss.' },
      { device: 'Metaphor', example: 'the pilgrim soul in you', explanation: 'The beloved\'s inner nature is cast as a pilgrim — restless, searching, spiritual — distinguishing it from mere physical beauty.' },
      { device: 'Imagery', example: 'hid his face amid a crowd of stars', explanation: 'The final image elevates lost love to something celestial and vast, beyond mortal reach.' },
      { device: 'Alliteration', example: 'glad grace', explanation: 'The soft g-sounds emphasize the fleeting charm of youth.' }
    ],
    historicalContext: 'Yeats wrote this poem for Maud Gonne, the Irish nationalist and great love of his life, who repeatedly refused his proposals. The poem draws on a sonnet by the French poet Pierre de Ronsard ("Quand vous serez bien vieille"), transforming it into something distinctly personal.'
  },
  seoDescription: 'When You Are Old by W. B. Yeats — full text and analysis of this meditation on unrequited love, aging, and the pilgrim soul.'
};
