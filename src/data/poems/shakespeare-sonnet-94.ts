import { PoemAnalysis } from './index';

// Source: Project Gutenberg - Public Domain

export const sonnet94: PoemAnalysis = {
  slug: 'sonnet-94',
  title: 'Sonnet 94: They that have power to hurt and will do none',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `They that have power to hurt and will do none,
That do not do the thing they most do show,
Who, moving others, are themselves as stone,
Unmoved, cold, and to temptation slow,
They rightly do inherit heaven's graces
And husband nature's riches from expense;
They are the lords and owners of their faces,
Others but stewards of their excellence.
The summer's flower is to the summer sweet,
Though to itself it only live and die,
But if that flower with base infection meet,
The basest weed outbraves his dignity:
For sweetest things turn sourest by their deeds;
Lilies that fester smell far worse than weeds.`,
  analysis: {
    overview: `Sonnet 94 is Shakespeare's most ambiguous poem—is it praising self-control or criticizing coldness? Those who "have power to hurt and will do none" seem admirable, yet they're "stone," "unmoved, cold." The sestet's infected lily suggests corruption beneath restraint. The famous last line damns more than it praises.`,
    lineByLine: [
      { lines: '1-4', commentary: `Power without action, show without deed, moving others while staying stone. Admirable restraint or emotional deadness?` },
      { lines: '5-8', commentary: `They "inherit heaven's graces," own their faces. Others are mere "stewards." High praise—or is it?` },
      { lines: '9-12', commentary: `The flower lives for itself, yet "base infection" corrupts it. External beauty hides internal rot.` },
      { lines: '13-14', commentary: `"Sweetest things turn sourest"—corruption is worst in the best. Festering lilies stink more than weeds.` }
    ],
    themes: ['Power and restraint', 'Coldness vs. virtue', 'Corruption of the beautiful', 'Ambiguity of praise'],
    literaryDevices: [
      { device: 'Irony', example: 'The entire poem', explanation: 'Apparent praise gradually reveals critique.' },
      { device: 'Aphorism', example: 'Lilies that fester smell far worse than weeds', explanation: 'Proverbial wisdom that inverts the praise.' }
    ],
    historicalContext: `Among the most debated sonnets. May address the Fair Youth's emotional coldness or a political figure. The lily/weed line also appears in Edward III.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 94 "They that have power to hurt" - the ambiguous meditation on cold self-control and hidden corruption.'
};
