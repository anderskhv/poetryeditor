import { PoemAnalysis } from './index';

// Source: Public Domain (Dickinson died 1886)

export const dickinson585: PoemAnalysis = {
  slug: 'i-like-to-see-it-lap-the-miles',
  title: 'I like to see it lap the Miles (585)',
  poet: 'Emily Dickinson',
  poetBirth: 1830,
  poetDeath: 1886,
  year: 1862,
  collection: 'Poems (1891)',
  form: 'Common Meter (variant)',
  text: `I like to see it lap the Miles –
And lick the Valleys up –
And stop to feed itself at Tanks –
And then – prodigious step

Around a Pile of Mountains –
And supercilious peer
In Shanties – by the sides of Roads –
And then a Quarry pare

To fit its Ribs
And crawl between
Complaining all the while
In horrid – hooting stanza –
Then chase itself down Hill –

And neigh like Boanerges –
Then – punctual as a Star –
Stop – docile and omnipotent
At its own stable Door –`,
  analysis: {
    overview: `Dickinson describes a train without ever naming it. The locomotive becomes a giant animal — lapping, licking, feeding, crawling, neighing — that devours landscape yet arrives punctually at its stable. The poem captures industrial America's ambivalence: the machine is powerful and obedient, prodigious and docile, omnipotent yet domesticated. The word "train" never appears.`,
    lineByLine: [
      { lines: '1-4', commentary: `The creature "laps" miles and "licks" valleys — consuming distance like an animal drinking. It stops to feed at water tanks. The "prodigious step" introduces its enormous scale.` },
      { lines: '5-8', commentary: `It steps around mountains with a "supercilious peer" into shanties — looking down on human dwellings with contempt. Then it pares a quarry to fit its body through. The landscape must accommodate the machine.` },
      { lines: '9-13', commentary: `The lines shorten as the train squeezes through the quarry cut. It "complains" in "horrid – hooting stanza" — the steam whistle described as bad poetry. Then it chases itself downhill with gathered momentum.` },
      { lines: '14-17', commentary: `It neighs "like Boanerges" (biblical "Sons of Thunder"), then arrives "punctual as a Star" — cosmic reliability. The final paradox: "docile and omnipotent." All that power, standing quietly at its stable door.` }
    ],
    themes: ['Technology as animal', 'Industrial power', 'Domestication of force', 'The machine in the garden'],
    literaryDevices: [
      { device: 'Extended Metaphor', example: 'lap, lick, feed, crawl, neigh, stable', explanation: 'The train is described entirely through animal imagery — it\'s a horse, a cat, a creature — but never named. The riddle structure sustains the entire poem.' },
      { device: 'Oxymoron', example: 'docile and omnipotent', explanation: 'The train is simultaneously all-powerful and obedient — industrial force perfectly tamed by its schedule and tracks.' },
      { device: 'Allusion', example: 'Boanerges', explanation: 'Biblical reference to James and John, whom Jesus called "Sons of Thunder" (Mark 3:17). The train\'s whistle becomes prophetic thunder.' }
    ],
    historicalContext: `The railroad reached Amherst in 1853, transforming the town. Dickinson's father, Edward, was instrumental in bringing it there. She would have witnessed the locomotive's arrival as a child — a machine entering a pastoral New England landscape. The poem belongs to a tradition of American writers grappling with industrialization (Thoreau's Walden train, Hawthorne's "Celestial Railroad"), but Dickinson's approach is uniquely playful.`
  },
  seoDescription: 'Analysis of Emily Dickinson\'s "I like to see it lap the Miles" — a riddle poem describing a train as a powerful, domesticated animal.'
};
