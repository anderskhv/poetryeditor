import { PoemAnalysis } from './index';

// Source: Public Domain (Crapsey died 1914, published 1915)

export const triad: PoemAnalysis = {
  slug: 'triad',
  title: 'Triad',
  poet: 'Adelaide Crapsey',
  poetBirth: 1878,
  poetDeath: 1914,
  year: 1915,
  collection: 'Verse',
  form: 'Cinquain',
  text: `These be
Three silent things:
The falling snow... the hour
Before the dawn... the mouth of one
Just dead.`,
  analysis: {
    overview: `Three silences ranked by intensity: snow, pre-dawn, death. The poem builds toward its devastating final image—"the mouth of one / Just dead." Crapsey wrote this while dying; the poem knows what it's talking about. The ellipses create pauses that enact the silence described.`,
    lineByLine: [
      { lines: '1-2', commentary: `"These be / Three silent things"—archaic "be" adds gravity, like a proverb or riddle. We're promised a list.` },
      { lines: '3', commentary: `"The falling snow..."—soft, natural silence. Beautiful, not threatening. The ellipsis holds the pause.` },
      { lines: '4', commentary: `"The hour before the dawn..."—deeper silence. The world holding its breath. Still natural but weighted with anticipation.` },
      { lines: '5', commentary: `"The mouth of one / Just dead."—the silence that matters. "Just" is crucial: not long dead, but freshly. The mouth that just stopped speaking.` }
    ],
    themes: ['Silence gradations', 'Death as ultimate quiet', 'Natural and human stillness', 'The weight of ending'],
    literaryDevices: [
      { device: 'Tricolon', example: 'Snow, dawn, death', explanation: 'Three items building in intensity—the rhetorical rule of three, weaponized.' },
      { device: 'Ellipsis', example: 'Three sets of "..."', explanation: 'Visual silence on the page. The punctuation performs its content.' },
      { device: 'Enjambment', example: '"the mouth of one / Just dead"', explanation: 'Breaking across lines delays "dead," making us wait for the final word.' }
    ],
    historicalContext: `Crapsey was diagnosed with tuberculosis in 1911 and spent her final years in a sanatorium. Her cinquains often circle death, but with precision rather than self-pity. She died in 1914 at 36.`
  },
  seoDescription: 'Analysis of Adelaide Crapsey\'s "Triad" - the cinquain listing three silent things, building to the silence of death.'
};
