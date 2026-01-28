import { PoemAnalysis } from './index';

// Source: Public Domain (Dickinson died 1886)

export const dickinson288: PoemAnalysis = {
  slug: 'im-nobody-who-are-you',
  title: 'I\'m Nobody! Who are you? (288)',
  poet: 'Emily Dickinson',
  poetBirth: 1830,
  poetDeath: 1886,
  year: 1861,
  collection: 'Poems (1891)',
  form: 'Common Meter',
  text: `I'm Nobody! Who are you?
Are you – Nobody – Too?
Then there's a pair of us!
Don't tell! they'd advertise – you know!

How dreary – to be – Somebody!
How public – like a Frog –
To tell one's name – the livelong June –
To an admiring Bog!`,
  analysis: {
    overview: `Dickinson's manifesto against fame. Being "Somebody" means croaking your name like a frog to a bog—public, repetitive, undiscriminating. Being "Nobody" is a secret club of two. The poem delights in anonymity as resistance: publication ("they'd advertise") is exposure to be avoided.`,
    lineByLine: [
      { lines: '1-4', commentary: `"I'm Nobody" is declaration, not lament. Finding another Nobody creates conspiracy. "Don't tell!"—visibility is the threat.` },
      { lines: '5-8', commentary: `"Public – like a Frog" is brilliantly dismissive. The frog's audience is a bog—admiring but mindless. Fame is performance for swamp.` }
    ],
    themes: ['Anonymity as freedom', 'Fame as degradation', 'Conspiracy of the obscure', 'Public versus private self'],
    literaryDevices: [
      { device: 'Simile', example: '"public – like a Frog"', explanation: 'Fame reduced to amphibian croaking—repetitive, loud, desperate for attention.' },
      { device: 'Exclamation', example: '"I\'m Nobody!"', explanation: 'The exclamation point makes obscurity triumphant, not pathetic.' }
    ],
    historicalContext: `Dickinson published only about ten poems during her lifetime, all anonymously. This poem explains why: publication meant losing control, becoming "Somebody" croaking to a bog. She preferred manuscript circulation to friends—selective, private, controlled.`
  },
  seoDescription: 'Analysis of Dickinson\'s "I\'m Nobody! Who are you?" - the playful poem celebrating obscurity over public fame.'
};
