import { PoemAnalysis } from './index';

// Source: Public domain (Blake died 1827)

export const gardenOfLove: PoemAnalysis = {
  slug: 'the-garden-of-love',
  title: 'The Garden of Love',
  poet: 'William Blake',
  poetBirth: 1757,
  poetDeath: 1827,
  year: 1794,
  collection: 'Songs of Experience',
  form: 'Three quatrains with irregular rhyme',
  text: `I went to the Garden of Love,
And saw what I never had seen:
A Chapel was built in the midst,
Where I used to play on the green.

And the gates of this Chapel were shut,
And "Thou shalt not" writ over the door;
So I turn'd to the Garden of Love
That so many sweet flowers bore;

And I saw it was filled with graves,
And tomb-stones where flowers should be;
And Priests in black gowns were walking their rounds,
And binding with briars my joys & desires.`,
  analysis: {
    overview: 'A short, devastating attack on institutional religion for replacing natural joy and desire with prohibition, guilt, and death.',
    lineByLine: [
      { lines: '1-4', commentary: 'The speaker returns to a place of childhood play and finds it transformed — a Chapel now stands where the green was. The past tense ("used to play") signals irreversible loss.' },
      { lines: '5-8', commentary: 'The Chapel doors are shut and inscribed with "Thou shalt not" — the Decalogue reduced to pure prohibition. The speaker turns back to the garden, expecting flowers.' },
      { lines: '9-12', commentary: 'Instead of flowers: graves and tombstones. The Priests "bind with briars" the speaker\'s joys and desires. The final image fuses crucifixion thorns with institutional control.' }
    ],
    themes: ['Institutional religion vs. natural joy', 'Loss of innocence', 'Prohibition and guilt', 'Freedom of desire'],
    literaryDevices: [
      { device: 'Symbolism', example: 'Chapel, graves, tomb-stones, briars', explanation: 'Each image represents how organized religion replaces living experience (flowers, play) with death and restriction.' },
      { device: 'Allusion', example: '"Thou shalt not" writ over the door', explanation: 'The Ten Commandments reduced to their negative essence — pure denial rather than moral guidance.' },
      { device: 'Contrast', example: 'sweet flowers / filled with graves', explanation: 'The garden\'s transformation from living beauty to a graveyard makes the poem\'s argument visual and visceral.' },
      { device: 'Internal Rhyme', example: 'Priests in black gowns were walking their rounds', explanation: 'The internal rhyme of "gowns" and "rounds" gives the priests\' patrol a mechanical, rhythmic menace.' }
    ],
    historicalContext: 'Blake was deeply hostile to the Church of England, which he saw as a tool of social control that suppressed natural human impulses. The poem channels this into a personal, almost fairy-tale narrative of return and disillusionment.'
  },
  seoDescription: 'The Garden of Love by William Blake — full text and analysis of the 1794 poem critiquing institutional religion and the suppression of joy.'
};
