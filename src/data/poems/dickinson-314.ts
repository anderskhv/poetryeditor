import { PoemAnalysis } from './index';

// Source: Public Domain (Dickinson died 1886)

export const dickinson314: PoemAnalysis = {
  slug: 'nature-is-what-we-see',
  title: 'Nature is what we see (314)',
  poet: 'Emily Dickinson',
  poetBirth: 1830,
  poetDeath: 1886,
  year: 1863,
  collection: 'Poems (1891)',
  form: 'Free verse (irregular meter)',
  text: `"Nature" is what we see –
The Hill – the Afternoon –
Squirrel – Eclipse – the Bumble bee –
Nay – Nature is Heaven –
Nature is what we hear –
The Bobolink – the Sea –
Thunder – the Cricket –
Nay – Nature is Harmony –
Nature is what we know –
Yet have no art to say –
So impotent Our Wisdom is
To her Simplicity.`,
  analysis: {
    overview: `Dickinson attempts to define nature and fails — deliberately. She tries sight, then sound, then knowledge, and each time corrects herself ("Nay"). The poem's real argument is in the last four lines: nature is what we know but cannot articulate. Our wisdom is impotent before her simplicity. The poem enacts the very failure it describes.`,
    lineByLine: [
      { lines: '1-4', commentary: `First attempt: nature is what we see. She lists visual phenomena — hills, afternoon light, squirrels, eclipses, bees — mixing the domestic with the cosmic. Then self-corrects: "Nay – Nature is Heaven." Seeing isn't enough; it's something larger.` },
      { lines: '5-8', commentary: `Second attempt: nature is what we hear. Bobolinks, sea, thunder, crickets — again mixing intimate with immense. Another correction: "Nay – Nature is Harmony." Sound isn't enough either; it's the pattern behind the sounds.` },
      { lines: '9-12', commentary: `Final attempt abandons the senses entirely. Nature is what we know "Yet have no art to say." The poem concedes defeat: human wisdom is impotent before nature's simplicity. Definition itself is the wrong tool.` }
    ],
    themes: ['The limits of language', 'Nature as irreducible', 'Knowledge beyond expression', 'Humility before simplicity'],
    literaryDevices: [
      { device: 'Anaphora', example: 'Nature is what we see / Nature is what we hear / Nature is what we know', explanation: 'The triple repetition creates a rising structure that collapses — each definition fails and must be replaced.' },
      { device: 'Catalogue', example: 'The Hill – the Afternoon – / Squirrel – Eclipse – the Bumble bee', explanation: 'Rapid listing of disparate natural phenomena, mixing scale (squirrel beside eclipse) to suggest nature\'s range.' },
      { device: 'Epanorthosis', example: 'Nay – Nature is Heaven', explanation: 'Self-correction mid-poem. Dickinson revises her own definitions in real time, dramatizing the inadequacy of each attempt.' }
    ],
    historicalContext: `Written during Dickinson's most prolific period (1862-1864), when she composed nearly 800 poems. This poem engages the Romantic tradition of nature poetry (Wordsworth, Emerson) but subverts it — where Romantics celebrate nature's legibility, Dickinson insists on its resistance to language. Her Amherst garden and daily observation of birds, insects, and weather ground the specific details.`
  },
  seoDescription: 'Analysis of Emily Dickinson\'s "Nature is what we see" — a poem about the impossibility of defining nature through sight, sound, or knowledge.'
};
