import { PoemAnalysis } from './index';

// Source: Public Domain (Wordsworth died 1850)

export const westminsterBridge: PoemAnalysis = {
  slug: 'westminster-bridge',
  title: 'Composed upon Westminster Bridge, September 3, 1802',
  poet: 'William Wordsworth',
  poetBirth: 1770,
  poetDeath: 1850,
  year: 1807,
  collection: 'Poems, in Two Volumes',
  form: 'Petrarchan Sonnet',
  text: `Earth has not anything to show more fair:
Dull would he be of soul who could pass by
A sight so touching in its majesty:
This City now doth, like a garment, wear
The beauty of the morning; silent, bare,
Ships, towers, domes, theatres, and temples lie
Open unto the fields, and to the sky;
All bright and glittering in the smokeless air.
Never did sun more beautifully steep
In his first splendour, valley, rock, or hill;
Ne'er saw I, never felt, a calm so deep!
The river glideth at his own sweet will:
Dear God! the very houses seem asleep;
And all that mighty heart is lying still!`,
  analysis: {
    overview: `Wordsworth, the nature poet, writes his most ecstatic poem about a city. The trick: he catches London asleep, at dawn, before it becomes itself. No smoke, no crowds, no commerce—just architecture as landscape. The city becomes nature by being emptied of people. It's a love poem to London that depends on London's absence.`,
    lineByLine: [
      { lines: '1-8', commentary: `The octave makes an extraordinary claim: "Earth has not anything to show more fair." The city wears morning "like a garment"—beauty is costume, temporary. "Smokeless air" is key: industrial London usually choked with pollution.` },
      { lines: '9-14', commentary: `The sestet compares this urban scene favorably to natural landscapes ("valley, rock, or hill"). "The river glideth at his own sweet will"—the Thames personified, free. "That mighty heart is lying still"—London sleeps, and only sleeping is it beautiful.` }
    ],
    themes: ['Urban beauty', 'Stillness and revelation', 'Nature in the city', 'The transformative power of morning light'],
    literaryDevices: [
      { device: 'Personification', example: 'City wearing garments, river gliding at will, houses asleep', explanation: 'London becomes a living being—but one that must sleep to be loved.' },
      { device: 'Hyperbole', example: '"Earth has not anything to show more fair"', explanation: 'The exaggeration signals genuine surprise—Wordsworth didn\'t expect to feel this.' }
    ],
    historicalContext: `Written crossing Westminster Bridge at dawn en route to France. Dorothy's journal: "The sun shone so brightly... that there was even something like the purity of one of nature's own grand spectacles." Wordsworth was returning to see his former lover and their daughter.`
  },
  seoDescription: 'Analysis of Wordsworth\'s "Composed upon Westminster Bridge" - the nature poet\'s surprising hymn to sleeping London at dawn.'
};
