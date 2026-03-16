import { PoemAnalysis } from './index';

// Source: Public Domain (Dickinson died 1886)

export const dickinson67: PoemAnalysis = {
  slug: 'success-is-counted-sweetest',
  title: 'Success is counted sweetest (67)',
  poet: 'Emily Dickinson',
  poetBirth: 1830,
  poetDeath: 1886,
  year: 1859,
  collection: 'Poems (1890)',
  form: 'Common Meter',
  text: `Success is counted sweetest
By those who ne'er succeed.
To comprehend a nectar
Requires sorest need.

Not one of all the purple Host
Who took the Flag today
Can tell the definition
So clear of victory

As he defeated – dying –
On whose forbidden ear
The distant strains of triumph
Burst agonized and clear!`,
  analysis: {
    overview: `Dickinson argues that only those denied success can truly understand its value. The poem builds from abstract principle to battlefield scene, ending with a dying soldier who hears victory more clearly than any victor. Deprivation becomes a form of knowledge — loss teaches what possession cannot.`,
    lineByLine: [
      { lines: '1-4', commentary: `The opening stanza states the paradox directly: success is best understood by those who never achieve it. "Nectar" elevates desire to something divine, and "sorest need" — the most desperate thirst — is what teaches its value.` },
      { lines: '5-8', commentary: `The victorious "purple Host" (royal purple signifying triumph) who captured the flag cannot define victory. Possession dulls comprehension — they have it, so they can't see it.` },
      { lines: '9-12', commentary: `The dying soldier on the losing side hears the distant strains of triumph with agonizing clarity. His exclusion makes the music vivid. "Forbidden ear" — he is denied even the right to hear it, yet hears it most intensely.` }
    ],
    themes: ['Paradox of desire', 'Deprivation as knowledge', 'Victory and defeat', 'Understanding through loss'],
    literaryDevices: [
      { device: 'Paradox', example: `Success is counted sweetest / By those who ne'er succeed`, explanation: 'The central claim inverts expectation: losers understand winning better than winners.' },
      { device: 'Synesthesia', example: 'Burst agonized and clear', explanation: 'Sound is given emotional and visual qualities simultaneously — triumph becomes a physical sensation.' },
      { device: 'Metonymy', example: 'purple Host', explanation: 'Royal purple represents the victorious army and their glory by association.' }
    ],
    historicalContext: `One of only ten Dickinson poems published in her lifetime, appearing anonymously in 1864 in the Brooklyn Daily Union during the Civil War. The battlefield imagery resonated with wartime readers, though the poem's argument is universal — about desire itself, not any particular war.`
  },
  seoDescription: 'Analysis of Emily Dickinson\'s "Success is counted sweetest" — the paradox of how deprivation deepens understanding of triumph.'
};
