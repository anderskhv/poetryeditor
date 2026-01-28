import { PoemAnalysis } from './index';

// Source: Public Domain (Dickinson died 1886)

export const dickinson1129: PoemAnalysis = {
  slug: 'tell-all-the-truth',
  title: 'Tell all the truth but tell it slant (1129)',
  poet: 'Emily Dickinson',
  poetBirth: 1830,
  poetDeath: 1886,
  year: 1868,
  collection: 'Poems (1945)',
  form: 'Common Meter',
  text: `Tell all the truth but tell it slant —
Success in Circuit lies
Too bright for our infirm Delight
The Truth's superb surprise
Must dazzle gradually
Or every man be blind —

As Lightning to the Children eased
With explanation kind
The Truth must dazzle gradually
Or every man be blind.`,
  analysis: {
    overview: `Dickinson's ars poetica: truth must be indirect. Like light too bright to face directly, truth requires "circuit"—the oblique approach, the parable, the metaphor. This poem explains why Dickinson's poems work the way they do: dashes, gaps, and slant rhymes protect us from truths we couldn't otherwise bear.`,
    lineByLine: [
      { lines: '1-6', commentary: `"Tell it slant"—indirection as method. "Success in Circuit" values the roundabout path. Truth's "superb surprise" would blind us if given directly.` },
      { lines: '7-10', commentary: `Lightning explained to children: domesticate terror with narrative. The repetition ("dazzle gradually") becomes the lesson itself.` }
    ],
    themes: ['Truth and indirection', 'Art as protection', 'The limits of human perception', 'Gradual revelation'],
    literaryDevices: [
      { device: 'Metaphor', example: 'Truth as blinding light', explanation: 'Truth shares properties with light: illuminating but dangerous in excess.' },
      { device: 'Paradox', example: 'Tell all truth by not telling it directly', explanation: 'Complete truth requires incomplete telling—fullness through indirection.' }
    ],
    historicalContext: `This poem serves as Dickinson's defense of her style. Her editors initially "corrected" her slant rhymes and dashes; she insisted on them. The poem argues that indirection isn't failure but method—perhaps the only method that works for certain truths.`
  },
  seoDescription: 'Analysis of Dickinson\'s "Tell all the truth but tell it slant" - her manifesto on indirect revelation and protective obliquity.'
};
