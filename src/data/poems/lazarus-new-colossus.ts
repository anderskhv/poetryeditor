import { PoemAnalysis } from './index';

// Source: Public domain (1883)

export const newColossus: PoemAnalysis = {
  slug: 'the-new-colossus',
  title: 'The New Colossus',
  poet: 'Emma Lazarus',
  poetBirth: 1849,
  poetDeath: 1887,
  year: 1883,
  collection: 'Fundraising poem for the Statue of Liberty',
  form: 'Italian sonnet (Petrarchan)',
  text: `Not like the brazen giant of Greek fame,
With conquering limbs astride from land to land;
Here at our sea-washed, sunset gates shall stand
A mighty woman with a torch, whose flame
Is the imprisoned lightning, and her name
Mother of Exiles. From her beacon-hand
Glows world-wide welcome; her mild eyes command
The air-bridged harbor that twin cities frame.
"Keep, ancient lands, your storied pomp!" cries she
With silent lips. "Give me your tired, your poor,
Your huddled masses yearning to breathe free,
The wretched refuse of your teeming shore.
Send these, the homeless, tempest-tost to me,
I lift my lamp beside the golden door!"`,
  analysis: {
    overview: 'Lazarus recasts the Statue of Liberty as a maternal guardian who welcomes the displaced, redefining American power as refuge and hospitality.',
    lineByLine: [
      { lines: '1-8', commentary: 'The speaker contrasts the ancient Colossus of conquest with a new figure: a woman whose torch signals welcome rather than domination.' },
      { lines: '9-14', commentary: 'Liberty speaks directly, rejecting imperial glory and inviting the poor and displaced to safety and dignity.' }
    ],
    themes: ['Immigration', 'Refuge', 'National identity', 'Compassion', 'Freedom'],
    literaryDevices: [
      { device: 'Allusion', example: 'brazen giant of Greek fame', explanation: 'Refers to the Colossus of Rhodes to contrast old power with the new.' },
      { device: 'Personification', example: 'A mighty woman with a torch', explanation: 'Liberty is given a voice and maternal presence.' }
    ],
    historicalContext: 'Written to help raise funds for the Statue of Liberty pedestal; later inscribed on the statue and became a defining immigration emblem.'
  },
  seoDescription: 'The New Colossus by Emma Lazarus with full text and analysis of its immigration symbolism and lasting cultural impact.'
};
