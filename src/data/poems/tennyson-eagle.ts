import { PoemAnalysis } from './index';

// Source: Public domain (Tennyson died 1892)

export const eagle: PoemAnalysis = {
  slug: 'the-eagle',
  title: 'The Eagle',
  poet: 'Alfred, Lord Tennyson',
  poetBirth: 1809,
  poetDeath: 1892,
  year: 1851,
  form: 'Two tercets in iambic tetrameter with AAA BBB rhyme scheme',
  text: `He clasps the crag with crooked hands;
Close to the sun in lonely lands,
Ring'd with the azure world, he stands.

The wrinkled sea beneath him crawls;
He watches from his mountain walls,
And like a thunderbolt he falls.`,
  analysis: {
    overview: `In just six lines, Tennyson captures the eagle's solitary majesty and sudden violence. The first stanza presents stillness and altitude; the second transforms the perspective — the sea "crawls" far below — before the eagle plunges with the force of a thunderbolt. The poem is a masterclass in compression: every word earns its place.`,
    lineByLine: [
      { lines: '1-3', commentary: `"Crooked hands" personifies the eagle, lending it human grip and age. The alliterative "clasps the crag with crooked" hammers the consonants like talons on rock. "Close to the sun" elevates the bird to near-mythic status, while "ring'd with the azure world" places it at the center of a vast blue dome.` },
      { lines: '4-6', commentary: `Perspective shifts downward: the sea is "wrinkled" and "crawls" — enormous forces reduced to insignificance by altitude. "Mountain walls" makes the cliff a fortress. Then the final line detonates: "like a thunderbolt he falls." The monosyllabic force and the simile convert stillness into pure velocity.` }
    ],
    themes: ['Power and solitude', 'The sublime in nature', 'Stillness and sudden violence', 'Perspective and scale'],
    literaryDevices: [
      { device: 'Alliteration', example: 'clasps the crag with crooked', explanation: 'The hard "c" sounds mimic the grip of talons on stone, giving the line a physical crunch.' },
      { device: 'Personification', example: 'crooked hands', explanation: 'Giving the eagle "hands" rather than talons humanizes it, making the bird a figure of aged, gripping power.' },
      { device: 'Simile', example: 'like a thunderbolt he falls', explanation: 'The eagle\'s dive is equated with lightning — sudden, devastating, almost divine in force.' },
      { device: 'Transferred epithet', example: 'The wrinkled sea beneath him crawls', explanation: 'The sea appears wrinkled and slow only because of the eagle\'s immense height — the adjective belongs to the perspective, not the ocean.' }
    ],
    historicalContext: `Published in 1851, "The Eagle" is subtitled "A Fragment." Tennyson may have written it after observing eagles during travels in the Pyrenees in 1830 with his friend Arthur Hallam. The poem's compression was unusual for Tennyson, who was known for longer, more elaborate works. Its six lines have become one of the most anthologized short poems in English.`
  },
  seoDescription: 'The Eagle by Alfred, Lord Tennyson - analysis of the 1851 poem on power, solitude, and the sudden violence of nature.'
};
