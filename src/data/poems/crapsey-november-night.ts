import { PoemAnalysis } from './index';

// Source: Public Domain (Crapsey died 1914, published 1915)

export const novemberNight: PoemAnalysis = {
  slug: 'november-night',
  title: 'November Night',
  poet: 'Adelaide Crapsey',
  poetBirth: 1878,
  poetDeath: 1914,
  year: 1915,
  collection: 'Verse',
  form: 'Cinquain',
  text: `Listen...
With faint dry sound,
Like steps of passing ghosts,
The leaves, frost-crisp'd, break from the trees
And fall.`,
  analysis: {
    overview: `One of Crapsey's most famous cinquains, capturing autumn's end in just 22 syllables. The single word "Listen" commands attention, then delivers: leaves breaking from trees sound like ghostly footsteps. The form Crapsey invented—2, 4, 6, 8, 2 syllables—creates a swelling and sudden stop, like the leaf's fall.`,
    lineByLine: [
      { lines: '1', commentary: `"Listen..."—a single word with ellipsis. Commands silence, creates anticipation. We strain to hear.` },
      { lines: '2-3', commentary: `"Faint dry sound / Like steps of passing ghosts"—synesthesia (sound becomes footsteps) and the uncanny. Dead leaves as dead spirits.` },
      { lines: '4-5', commentary: `"Frost-crisp'd" is precise sensory detail. Then "And fall"—two syllables, abrupt. The poem enacts the leaf's drop.` }
    ],
    themes: ['Autumn and mortality', 'The uncanny in nature', 'Silence and listening', 'Compression of experience'],
    literaryDevices: [
      { device: 'Cinquain form', example: '2-4-6-8-2 syllables', explanation: 'Crapsey invented this form, influenced by Japanese haiku and tanka. The shape swells then stops.' },
      { device: 'Simile', example: '"Like steps of passing ghosts"', explanation: 'Natural sound becomes supernatural presence—autumn is haunted.' },
      { device: 'Onomatopoeia', example: '"frost-crisp\'d"', explanation: 'The word sounds like what it describes—dry, crackling.' }
    ],
    historicalContext: `Crapsey wrote her cinquains while dying of tuberculosis at 36. The form's compression may reflect her limited energy, but also her scholarly interest in meter. She studied English prosody intensively, seeking patterns in stressed syllables.`
  },
  seoDescription: 'Analysis of Adelaide Crapsey\'s "November Night" - the famous cinquain capturing autumn leaves as ghostly footsteps in just 22 syllables.'
};
