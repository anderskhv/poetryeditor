import { PoemAnalysis } from './index';

// Source: Public domain (Blake died 1827)

export const poisonTree: PoemAnalysis = {
  slug: 'a-poison-tree',
  title: 'A Poison Tree',
  poet: 'William Blake',
  poetBirth: 1757,
  poetDeath: 1827,
  year: 1794,
  collection: 'Songs of Experience',
  form: 'Four quatrains in rhyming couplets',
  text: `I was angry with my friend:
I told my wrath, my wrath did end.
I was angry with my foe:
I told it not, my wrath did grow.

And I water'd it in fears,
Night and morning with my tears;
And I sunned it with smiles,
And with soft deceitful wiles.

And it grew both day and night,
Till it bore an apple bright;
And my foe beheld it shine,
And he knew that it was mine,

And into my garden stole
When the night had veil'd the pole:
In the morning glad I see
My foe outstretch'd beneath the tree.`,
  analysis: {
    overview: 'A parable about the lethal consequences of suppressed anger: when wrath is nursed in secret, it grows into something that destroys.',
    lineByLine: [
      { lines: '1-4', commentary: 'The opening contrast is stark — anger expressed to a friend dissolves; anger hidden from a foe grows. The simplicity is deliberate: Blake is laying down a moral law.' },
      { lines: '5-8', commentary: 'The speaker cultivates rage with "tears" and "soft deceitful wiles," turning suppression into an active, gardening metaphor. Fear and false smiles feed the tree.' },
      { lines: '9-12', commentary: 'The wrath matures into "an apple bright" — an unmistakable Eden echo. The foe is drawn to it, knowing it belongs to the speaker, suggesting complicity or fatal curiosity.' },
      { lines: '13-16', commentary: 'The foe steals into the garden by night and is found dead beneath the tree. The speaker is "glad" — a chilling final note that implicates the reader in the logic of repression.' }
    ],
    themes: ['Suppressed anger', 'Deception', 'The Fall (Eden imagery)', 'Hypocrisy', 'Emotional honesty'],
    literaryDevices: [
      { device: 'Extended Metaphor', example: 'The poison tree itself', explanation: 'Wrath is literalized as a plant that must be watered, sunned, and eventually bears deadly fruit — sustained across all four stanzas.' },
      { device: 'Allusion', example: 'it bore an apple bright', explanation: 'Direct echo of the Tree of Knowledge in Genesis; the apple represents forbidden, lethal temptation.' },
      { device: 'Antithesis', example: 'I told my wrath, my wrath did end / I told it not, my wrath did grow', explanation: 'The opening couplets set up the poem\'s entire moral architecture through parallel contrast.' },
      { device: 'Irony', example: 'In the morning glad I see', explanation: 'The speaker\'s gladness at finding his foe dead is deeply disturbing — the suppressed anger has corrupted the speaker as much as it killed the foe.' }
    ],
    historicalContext: 'Originally titled "Christian Forbearance" in Blake\'s notebook, which makes the critique sharper: the poem attacks the idea that swallowing anger is virtuous. For Blake, repression is the real sin.'
  },
  seoDescription: 'A Poison Tree by William Blake — full text and analysis of the 1794 poem about suppressed anger, deception, and its deadly consequences.'
};
