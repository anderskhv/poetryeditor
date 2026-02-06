import { PoemAnalysis } from './index';

// Source: Public domain (1794)

export const london: PoemAnalysis = {
  slug: 'london',
  title: 'London',
  poet: 'William Blake',
  poetBirth: 1757,
  poetDeath: 1827,
  year: 1794,
  collection: 'Songs of Experience',
  form: 'Four quatrains in ballad meter',
  text: `I wander through each chartered street,
Near where the chartered Thames does flow,
And mark in every face I meet
Marks of weakness, marks of woe.

In every cry of every Man,
In every Infant's cry of fear,
In every voice, in every ban,
The mind-forged manacles I hear.

How the Chimney-sweeper's cry
Every blackening Church appalls,
And the hapless Soldier's sigh
Runs in blood down Palace walls.

But most through midnight streets I hear
How the youthful Harlot's curse
Blasts the new-born Infant's tear,
And blights with plagues the Marriage hearse.`,
  analysis: {
    overview: 'Blake depicts a city where oppression is visible in every face and cry, linking political, religious, and social suffering.',
    lineByLine: [
      { lines: '1-4', commentary: 'The speaker walks through a controlled city and sees misery everywhere.' },
      { lines: '5-8', commentary: 'Suffering is internalized as “mind-forged manacles,” a psychological chain.' },
      { lines: '9-16', commentary: 'Blake connects child labor, militarism, and sexual exploitation to institutional violence.' }
    ],
    themes: ['Oppression', 'Urban misery', 'Institutional violence', 'Lost innocence'],
    literaryDevices: [
      { device: 'Repetition', example: 'In every', explanation: 'Creates a relentless, suffocating rhythm.' },
      { device: 'Metaphor', example: 'mind-forged manacles', explanation: 'Captures internalized oppression.' }
    ],
    historicalContext: 'Written during rapid industrialization in London, the poem criticizes social institutions and political power.'
  },
  seoDescription: 'London by William Blake with full text and analysis of its indictment of urban oppression.'
};
