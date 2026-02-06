import { PoemAnalysis } from './index';

// Source: Public domain (1860)

export const americaSinging: PoemAnalysis = {
  slug: 'i-hear-america-singing',
  title: 'I Hear America Singing',
  poet: 'Walt Whitman',
  poetBirth: 1819,
  poetDeath: 1892,
  year: 1860,
  collection: 'Leaves of Grass',
  form: 'Free verse',
  text: `I hear America singing, the varied carols I hear,
Those of mechanics, each one singing his as it should be blithe and strong,
The carpenter singing his as he measures his plank or beam,
The mason singing his as he makes ready for work, or leaves off work,
The boatman singing what belongs to him in his boat, the deckhand singing on the steamboat deck,
The shoemaker singing as he sits on his bench, the hatter singing as he stands,
The wood-cutter's song, the ploughboy's on his way in the morning, or at noon intermission or at sundown,
The delicious singing of the mother, or of the young wife at work, or of the girl sewing or washing,
Each singing what belongs to him or her and to none else,
The day what belongs to the day—at night the party of young fellows, robust, friendly,
Singing with open mouths their strong melodious songs.`,
  analysis: {
    overview: 'Whitman celebrates democratic labor by turning everyday work into a national chorus of individual voices.',
    lineByLine: [
      { lines: '1-6', commentary: 'The speaker catalogues workers whose songs represent pride in craft and labor.' },
      { lines: '7-11', commentary: 'Domestic and communal voices join the chorus, showing a broad, inclusive vision of America.' }
    ],
    themes: ['Democracy', 'Labor', 'Individualism', 'Community', 'Song'],
    literaryDevices: [
      { device: 'Catalog', example: 'mechanics... carpenter... mason...', explanation: 'Lists create rhythm and inclusiveness.' },
      { device: 'Metaphor', example: 'America singing', explanation: 'The nation becomes a choir of workers.' }
    ],
    historicalContext: 'Whitman’s mid-19th-century America celebrated work and expansion; the poem echoes that optimism and egalitarianism.'
  },
  seoDescription: 'I Hear America Singing by Walt Whitman with full text and analysis of its democratic chorus of labor.'
};
