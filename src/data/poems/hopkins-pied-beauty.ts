import { PoemAnalysis } from './index';

// Source: Public domain (Hopkins died 1889)

export const piedBeauty: PoemAnalysis = {
  slug: 'pied-beauty',
  title: 'Pied Beauty',
  poet: 'Gerard Manley Hopkins',
  poetBirth: 1844,
  poetDeath: 1889,
  year: 1877,
  form: 'Curtal sonnet in sprung rhythm (10.5 lines — a compressed Petrarchan sonnet)',
  text: `Glory be to God for dappled things —
For skies of couple-colour as a brinded cow;
For rose-moles all in stipple upon trout that swim;
Fresh-firecoal chestnut-falls; finches' wings;
For landscape plotted and pieced — fold, fallow, and plough;
And áll trádes, their gear and tackle and trim.

All things counter, original, spare, strange;
Whatever is fickle, freckled (who knows how?)
With swift, slow; sweet, sour; adazzle, dim;
He fathers-forth whose beauty is past change:
Praise him.`,
  analysis: {
    overview: `"Pied Beauty" is a hymn of praise for the mottled, dappled, mixed things of creation — brinded cows, trout spots, finch wings, patched landscapes. Hopkins invented the "curtal sonnet" (a sonnet cut short to 10.5 lines) to hold this compressed catalogue of variety. The paradox at the poem's heart: all this changeable, "fickle, freckled" beauty comes from a God "whose beauty is past change."`,
    lineByLine: [
      { lines: '1-6', commentary: `The poem opens as a prayer: "Glory be to God for dappled things." Then a catalogue: skies streaked like a brindled cow, rose-colored spots on trout, chestnuts fresh from the fire with their glowing shells, finches' patterned wings, and landscapes "plotted and pieced" into fields. Even human trades and their tools are included — the dappled world encompasses work as well as nature.` },
      { lines: '7-11', commentary: `The sestet abstracts from the catalogue: "counter, original, spare, strange" — things that resist uniformity. Pairs of opposites ("swift, slow; sweet, sour; adazzle, dim") show that variety includes contrast itself. Then the turn: God "fathers-forth" all this change, yet His own beauty is "past change." The final half-line — "Praise him." — is both a command and a prayer, abrupt and complete.` }
    ],
    themes: ['Praise for diversity in creation', 'The paradox of changeless God and changing world', 'Beauty in imperfection and irregularity', 'Sacramental vision of nature'],
    literaryDevices: [
      { device: 'Catalogue', example: 'skies of couple-colour as a brinded cow; / For rose-moles all in stipple upon trout', explanation: 'The poem accumulates dappled things in a rush of examples, each more surprising than the last, enacting the variety it celebrates.' },
      { device: 'Compound coinages', example: 'Fresh-firecoal chestnut-falls', explanation: 'Hopkins invents hyphenated compounds to compress multiple sensory impressions into single phrases — chestnuts fresh-fallen with the glow of fire-coals.' },
      { device: 'Sprung rhythm', example: 'With swift, slow; sweet, sour; adazzle, dim', explanation: 'Stressed syllables are packed together without unstressed padding, creating a dense, percussive music that mirrors the crowded variety of creation.' },
      { device: 'Paradox', example: 'He fathers-forth whose beauty is past change', explanation: 'The creator of all changeable things is himself unchanging — the diversity of creation flows from a single, constant source.' }
    ],
    historicalContext: `Written in 1877 at St Beuno's in Wales, the same productive period that produced "God's Grandeur" and "The Windhover." The curtal sonnet was Hopkins's own invention — a Petrarchan sonnet mathematically compressed by 3/4 (octave becomes 6 lines, sestet becomes 4.5). Hopkins's philosophy of "inscape" — the unique, distinctive pattern of each created thing — drives the poem's celebration of individuality. Published posthumously in 1918.`
  },
  seoDescription: 'Pied Beauty by Gerard Manley Hopkins - analysis of the 1877 curtal sonnet celebrating dappled things and divine variety in creation.'
};
