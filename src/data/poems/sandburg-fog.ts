import { PoemAnalysis } from './index';

// Source: Public domain (published 1916)

export const fog: PoemAnalysis = {
  slug: 'fog',
  title: 'Fog',
  poet: 'Carl Sandburg',
  poetBirth: 1878,
  poetDeath: 1967,
  year: 1916,
  collection: 'Chicago Poems',
  form: 'Free verse imagist poem',
  text: `The fog comes
on little cat feet.

It sits looking
over harbor and city
on silent haunches
and then moves on.`,
  analysis: {
    overview: 'In just six lines, Sandburg creates one of the most famous extended metaphors in American poetry: fog as a cat that arrives silently, observes, and departs. The poem is a model of imagist compression.',
    lineByLine: [
      { lines: '1-2', commentary: 'The fog\'s arrival is rendered through a single physical detail: "little cat feet." The adjective "little" domesticates a vast weather phenomenon, making it intimate and unthreatening.' },
      { lines: '3-6', commentary: 'The cat-fog sits on its haunches — a posture of patient observation, not action. It surveys harbor and city (the commercial and human worlds), then leaves. The verb "moves on" has a cat\'s indifference: it came, it looked, it left without caring.' }
    ],
    themes: ['Nature and the urban world', 'Transience', 'Quiet observation', 'Imagist compression'],
    literaryDevices: [
      { device: 'Extended metaphor', example: 'The fog comes / on little cat feet', explanation: 'The entire poem sustains a single comparison between fog and a cat, never breaking the conceit.' },
      { device: 'Personification', example: 'It sits looking / over harbor and city', explanation: 'The fog is given animal agency — it looks, it sits, it moves on — transforming weather into a creature with intentions.' },
      { device: 'Imagism', example: 'on silent haunches', explanation: 'Sandburg follows the imagist principle of direct treatment — no abstraction, no commentary, just the image presented cleanly.' },
      { device: 'Enjambment', example: 'It sits looking / over harbor and city', explanation: 'The line break after "looking" creates a momentary pause that mimics the fog\'s own stillness before the eye sweeps across the landscape.' }
    ],
    historicalContext: 'Published in Chicago Poems in 1916, this is one of the defining works of the American imagist movement. Sandburg reportedly wrote it in response to seeing fog roll into Chicago\'s harbor. The poem\'s brevity was radical for its time.'
  },
  seoDescription: 'Fog by Carl Sandburg — full text and analysis of this iconic six-line imagist poem comparing fog to a cat on silent haunches, from Chicago Poems.'
};
