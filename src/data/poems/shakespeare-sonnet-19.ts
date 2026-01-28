import { PoemAnalysis } from './index';

// Note: Sonnet 18 already exists. Adding Sonnet 19 instead.

export const sonnet19: PoemAnalysis = {
  slug: 'sonnet-19',
  title: 'Sonnet 19: Devouring Time, blunt thou the lion\'s paws',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `Devouring Time, blunt thou the lion's paws,
And make the earth devour her own sweet brood;
Burn the long-lived phoenix in her blood,
And make glad and sorry seasons as thou fleets;
Do thy worst, old Time: despite thy wrong,
My love shall in my verse ever live young.`,
  analysis: {
    overview: `Sonnet 19 directly addresses Time as an adversary. The speaker grants Time permission to do its worst—blunt lions, burn phoenixes, cycle seasons—but draws a line: "My love shall in my verse ever live young." It's a declaration of war ending in defiant victory through poetry.`,
    lineByLine: [
      { lines: '1-4', commentary: `Commands to Time: blunt the lion's claws, make earth consume its offspring, even burn the immortal phoenix. Escalating concessions.` },
      { lines: '5-6', commentary: `"Do thy worst"—a challenge. Despite Time's wrongs, verse preserves love eternally young. Poetry trumps mortality.` }
    ],
    themes: ['Time as devourer', 'Poetry as defiance', 'Challenge to mortality', 'Preservation through verse'],
    literaryDevices: [
      { device: 'Apostrophe', example: 'Devouring Time, blunt thou...', explanation: 'Direct address to an abstraction—confrontational tone.' },
      { device: 'Personification', example: 'Time as agent who "blunts" and "burns"', explanation: 'Time becomes an active destroyer to be challenged.' }
    ],
    historicalContext: `Transitions from procreation sonnets to poetry-as-immortality theme. The phoenix was a symbol of renewal, yet even it falls to Time.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 19 "Devouring Time" - the defiant challenge to Time, ending in poetry\'s victory.'
};
