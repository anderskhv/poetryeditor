import { PoemAnalysis } from './index';

export const toTheVirgins: PoemAnalysis = {
  slug: 'herrick-to-the-virgins',
  title: 'To the Virgins, to Make Much of Time',
  poet: 'Robert Herrick',
  poetBirth: 1591,
  poetDeath: 1674,
  year: 1648,
  collection: 'Hesperides',
  form: 'Carpe Diem Lyric',
  text: `Gather ye rose-buds while ye may:
Old Time is still a-flying;
And this same flower that smiles to-day,
To-morrow will be dying.

The glorious lamp of heaven, the Sun,
The higher he's a-getting,
The sooner will his race be run,
And nearer he's to setting.

That age is best, which is the first,
When youth and blood are warmer;
But being spent, the worse, and worst
Times, still succeed the former.

--Then be not coy, but use your time,
And while ye may, go marry;
For having lost but once your prime,
You may for ever tarry.`,
  analysis: {
    overview: `"To the Virgins, to Make Much of Time" is the most famous carpe diem poem in English, and its opening line — "Gather ye rose-buds while ye may" — has become shorthand for the entire tradition. But the poem is more cunning than its reputation suggests. Herrick structures a logical argument across four stanzas: flowers die (stanza 1), the sun sets (stanza 2), youth is the best age (stanza 3), therefore go marry now (stanza 4). The logic is airtight, but the conclusion — "go marry" — is oddly conservative for a poem about seizing the day.

That's the tension that makes this poem interesting. Carpe diem poems from Catullus onward typically urge sexual freedom, not marriage. Herrick's twist is to use the libertine tradition's urgency to argue for a socially respectable outcome. Whether this is genuine moral advice or playful irony is debatable — Herrick was a bachelor clergyman who never married himself. The poem's power comes from its rhythm: the alternating tetrameter and trimeter lines create a skipping, musical pace that embodies the fleeting time it describes.`,
    lineByLine: [
      {
        lines: '1-4',
        commentary: `"Gather ye rose-buds while ye may" — the imperative is immediate and physical. Rose-buds, not roses: they haven't even fully opened yet, which makes the urgency sharper. "Old Time is still a-flying" personifies time as an old man in perpetual motion. "This same flower that smiles to-day, / To-morrow will be dying" — "smiles" gives the flower a human face, making its death feel personal. The dash between "to-day" and "To-morrow" compresses an entire life into one line break.`
      },
      {
        lines: '5-8',
        commentary: `The sun analogy escalates the argument from flowers (hours) to the sun (a full day — or a full life). "The glorious lamp of heaven" is conventional but functional — it establishes the sun's arc as a metaphor for a human lifespan. The paradox: "The higher he's a-getting, / The sooner will his race be run." Success and decline are simultaneous. The moment you reach your peak, you've already started falling. "Race" carries both meanings — a course to run and a competition against time.`
      },
      {
        lines: '9-12',
        commentary: `Herrick drops the metaphors and states the argument directly: "That age is best, which is the first." Youth isn't just preferable — it's the only good time. "When youth and blood are warmer" — "blood" carries connotations of vitality, passion, and life force. "The worse, and worst / Times, still succeed the former" — the comparative and superlative pile up: things don't just get bad, they get progressively worse. There's no plateau, only decline.`
      },
      {
        lines: '13-16',
        commentary: `The conclusion arrives with a dash and a shift in tone: "--Then be not coy, but use your time." "Coy" meant reluctant or modest, not flirtatious — it's a direct challenge to feminine reserve. "And while ye may, go marry" — here's the surprise. After all this urgency about dying flowers and setting suns, the advice is simply: get married. "For having lost but once your prime, / You may for ever tarry" — "tarry" means to wait or linger, but it also implies being left behind. The final word rhymes with "marry," binding the two fates: marry now, or wait forever.`
      }
    ],
    themes: [
      'Carpe diem — seize the day before youth passes',
      'Time as irreversible decline',
      'Nature as mirror for human mortality',
      'The paradox of peak and decline being simultaneous',
      'Marriage as social urgency, not just romantic choice',
      'Female agency constrained by biological time'
    ],
    literaryDevices: [
      {
        device: 'Personification',
        example: '"Old Time is still a-flying"',
        explanation: 'Time is given a body and motion — an old figure perpetually in flight. The personification makes abstract inevitability feel like a physical pursuer.'
      },
      {
        device: 'Metaphor (Sun as Life)',
        example: '"The glorious lamp of heaven, the Sun, / The higher he\'s a-getting, / The sooner will his race be run"',
        explanation: 'The sun\'s daily arc becomes a human lifespan. The paradox — that rising is already the start of setting — compresses the carpe diem argument into astronomical observation.'
      },
      {
        device: 'Personification of Flower',
        example: '"this same flower that smiles to-day"',
        explanation: 'The flower "smiles" — it has a face, an expression, a personality. This makes its death in the next line feel like the loss of a person, not just a plant.'
      },
      {
        device: 'Imperative Voice',
        example: '"Gather ye rose-buds," "be not coy," "go marry"',
        explanation: 'Every stanza either begins or ends with a command. The poem doesn\'t suggest or reflect — it orders. This urgency performs the time pressure it describes.'
      },
      {
        device: 'Gradatio (Climactic Progression)',
        example: '"the worse, and worst / Times, still succeed the former"',
        explanation: 'The comparative "worse" escalates to superlative "worst" in a single line, grammatically enacting the decline the poem describes. Things don\'t stabilize — they compound.'
      }
    ],
    historicalContext: `Published in Herrick's "Hesperides" (1648), the poem draws on a classical tradition stretching back to Catullus ("Vivamus, mea Lesbia") and Horace ("Carpe diem"). Herrick was a Cavalier poet — a Royalist during the English Civil War — and his poetry celebrates sensual pleasure, rural life, and pagan-tinged ceremony. He was also an Anglican clergyman who never married, which gives the poem's marriage advice an ironic edge. The "virgins" addressed were young unmarried women of the gentry class, for whom marriage was both a personal and economic imperative — delay meant diminished prospects.`,
  },
  seoDescription: 'Analysis of Robert Herrick\'s "To the Virgins, to Make Much of Time" — the definitive carpe diem poem urging youth to seize the day before beauty and opportunity fade.',
  abstractWords: ['time', 'youth', 'prime', 'coy', 'glory'],
  rhymingPairs: [
    { word1: 'may', word2: 'day' },
    { word1: 'flying', word2: 'dying' },
    { word1: 'first', word2: 'worst' },
    { word1: 'time', word2: 'prime' },
    { word1: 'marry', word2: 'tarry' }
  ],
};
