import { PoemAnalysis } from './index';

// Source: Project Gutenberg https://www.gutenberg.org/ebooks/353

export const inFlandersFields: PoemAnalysis = {
  slug: 'in-flanders-fields',
  title: 'In Flanders Fields',
  poet: 'John McCrae',
  poetBirth: 1872,
  poetDeath: 1918,
  year: 1915,
  form: 'Rondeau',
  text: `In Flanders fields the poppies blow
Between the crosses, row on row,
That mark our place; and in the sky
The larks, still bravely singing, fly
Scarce heard amid the guns below.

We are the Dead. Short days ago
We lived, felt dawn, saw sunset glow,
Loved and were loved, and now we lie,
In Flanders fields.

Take up our quarrel with the foe:
To you from failing hands we throw
The torch; be yours to hold it high.
If ye break faith with us who die
We shall not sleep, though poppies grow
In Flanders fields.`,
  analysis: {
    overview: 'Written during WWI, the dead soldiers speak, urging the living to continue the fight.',
    lineByLine: [
      { lines: '1-5', commentary: 'The dead describe their resting place amid poppies and war sounds.' },
      { lines: '6-9', commentary: 'The dead recall their recent lives—now they lie in Flanders.' },
      { lines: '10-15', commentary: 'A call to arms: carry the torch or the dead will not rest.' }
    ],
    themes: ['War', 'Sacrifice', 'Duty', 'Memory', 'Legacy'],
    literaryDevices: [
      { device: 'Prosopopoeia', example: 'We are the Dead', explanation: 'The dead speak directly to the living.' },
      { device: 'Rondeau form', example: 'In Flanders fields (refrain)', explanation: 'Medieval French form with repeating lines.' }
    ],
    historicalContext: 'Written after McCrae witnessed the death of a friend at the Second Battle of Ypres.'
  },
  seoDescription: 'In Flanders Fields by John McCrae - full text and analysis of the iconic WWI poem.'
};
