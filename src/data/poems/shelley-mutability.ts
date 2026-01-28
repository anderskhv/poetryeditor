import { PoemAnalysis } from './index';

// Source: Public Domain (Shelley died 1822)

export const mutability: PoemAnalysis = {
  slug: 'mutability',
  title: 'Mutability',
  poet: 'Percy Bysshe Shelley',
  poetBirth: 1792,
  poetDeath: 1822,
  year: 1816,
  collection: 'Alastor, or The Spirit of Solitude',
  form: 'Lyric',
  text: `We are as clouds that veil the midnight moon;
How restlessly they speed, and gleam, and quiver,
Streaking the darkness radiantly!—yet soon
Night closes round, and they are lost for ever:

Or like forgotten lyres, whose dissonant strings
Give various response to each varying blast,
To whose frail frame no second motion brings
One mood or modulation like the last.

We rest.—A dream has power to poison sleep;
We rise.—One wandering thought pollutes the day;
We feel, conceive or reason, laugh or weep;
Embrace fond woe, or cast our cares away:

It is the same!—For, be it joy or sorrow,
The path of its departure still is free:
Man's yesterday may ne'er be like his morrow;
Nought may endure but Mutability.`,
  analysis: {
    overview: `Shelley's short meditation on impermanence. We are like clouds that vanish, like lyres giving different sounds to each wind. Everything changes—moods, thoughts, even our responses to the same stimulus. The final paradox: "Nought may endure but Mutability." Only change is permanent.`,
    lineByLine: [
      { lines: '1-4', commentary: `Humans as clouds: bright but temporary, "lost for ever." The beauty of "streaking the darkness radiantly" doesn't prevent disappearance.` },
      { lines: '5-8', commentary: `The lyre simile: we respond differently to each stimulus. "No second motion brings / One mood or modulation like the last"—we never repeat ourselves exactly.` },
      { lines: '9-12', commentary: `Daily life catalogued: rest, rise, feel, reason, laugh, weep. Each state passes. "Embrace fond woe, or cast our cares away"—even our choices about emotion shift.` },
      { lines: '13-16', commentary: `"It is the same!"—joy and sorrow are equally impermanent. "Nought may endure but Mutability"—the paradox: only change doesn't change.` }
    ],
    themes: ['Impermanence', 'The instability of identity', 'Change as the only constant', 'Human fragility'],
    literaryDevices: [
      { device: 'Simile', example: 'Clouds, forgotten lyres', explanation: 'Both images suggest beauty without permanence—momentary light, accidental music.' },
      { device: 'Paradox', example: '"Nought may endure but Mutability"', explanation: 'Only change doesn\'t change—a logical contradiction that captures lived experience.' }
    ],
    historicalContext: `Published in Shelley's first major volume (1816) when he was 23. The poem reflects both Romantic interest in flux and Shelley's personal instability—he had eloped, been expelled from Oxford, and was already on his second major relationship.`
  },
  seoDescription: 'Analysis of Shelley\'s "Mutability" - the short lyric on impermanence and change as the only constant.'
};
