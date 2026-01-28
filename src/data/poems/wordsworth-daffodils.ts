import { PoemAnalysis } from './index';

// Source: Public Domain (Wordsworth died 1850)

export const daffodils: PoemAnalysis = {
  slug: 'daffodils',
  title: 'I Wandered Lonely as a Cloud',
  poet: 'William Wordsworth',
  poetBirth: 1770,
  poetDeath: 1850,
  year: 1807,
  collection: 'Poems, in Two Volumes',
  form: 'Lyric',
  text: `I wandered lonely as a cloud
That floats on high o'er vales and hills,
When all at once I saw a crowd,
A host, of golden daffodils;
Beside the lake, beneath the trees,
Fluttering and dancing in the breeze.

Continuous as the stars that shine
And twinkle on the milky way,
They stretched in never-ending line
Along the margin of a bay:
Ten thousand saw I at a glance,
Tossing their heads in sprightly dance.

The waves beside them danced; but they
Out-did the sparkling waves in glee:
A poet could not but be gay,
In such a jocund company:
I gazed—and gazed—but little thought
What wealth the show to me had brought:

For oft, when on my couch I lie
In vacant or in pensive mood,
They flash upon that inward eye
Which is the bliss of solitude;
And then my heart with pleasure fills,
And dances with the daffodils.`,
  analysis: {
    overview: `The most anthologized poem in English literature is also one of the most misread. It's not really about daffodils—it's about memory. The actual encounter takes three stanzas; the fourth stanza, written from a couch years later, is where the poem lives. Wordsworth's radical claim: experience matters less than recollection. The flowers become "wealth" only in retrospect.`,
    lineByLine: [
      { lines: '1-6', commentary: `"Lonely as a cloud" seems melancholy but clouds float freely. The daffodils appear suddenly ("all at once")—nature interrupts solitude.` },
      { lines: '19-24', commentary: `The crucial stanza: years later, lying on his couch, the daffodils "flash upon that inward eye." Memory transforms experience into permanent joy.` }
    ],
    themes: ['Memory as creative act', 'Solitude and companionship', 'Nature as spiritual renewal', 'The value of recollection'],
    literaryDevices: [
      { device: 'Personification', example: 'Daffodils "dancing," "tossing their heads"', explanation: 'The flowers become a "crowd," a social gathering that relieves the speaker\'s loneliness.' },
      { device: 'Simile', example: 'Lonely as a cloud, continuous as stars', explanation: 'Natural comparisons place the speaker within the landscape rather than observing it.' }
    ],
    historicalContext: `Based on a walk Wordsworth took with his sister Dorothy in 1802. Her journal entry describes the scene; his poem appeared five years later. Dorothy's prose is arguably more vivid—Wordsworth's contribution is the fourth stanza's meditation on memory.`
  },
  seoDescription: 'Analysis of Wordsworth\'s "I Wandered Lonely as a Cloud" (Daffodils) - exploring how memory transforms experience into lasting joy.'
};
