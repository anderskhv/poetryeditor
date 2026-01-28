import { PoemAnalysis } from './index';

// Source: Public Domain (Dickinson died 1886)

export const dickinson465: PoemAnalysis = {
  slug: 'i-heard-a-fly-buzz',
  title: 'I heard a Fly buzz – when I died (465)',
  poet: 'Emily Dickinson',
  poetBirth: 1830,
  poetDeath: 1886,
  year: 1863,
  collection: 'Poems (1896)',
  form: 'Common Meter',
  text: `I heard a Fly buzz – when I died –
The Stillness in the Room
Was like the Stillness in the Air –
Between the Heaves of Storm –

The Eyes around – had wrung them dry –
And Breaths were gathering firm
For that last Onset – when the King
Be witnessed – in the Room –

I willed my Keepsakes – Signed away
What portion of me be
Assignable – and then it was
There interposed a Fly –

With Blue – uncertain – stumbling Buzz –
Between the light – and me –
And then – the Windows failed – and then
I could not see to see –`,
  analysis: {
    overview: `The deathbed prepared for "the King" (God, revelation, meaning) gets a fly instead. This is Dickinson's blackest joke: the moment of death, heavy with expectation, interrupted by something trivial, physical, ordinary. The "uncertain stumbling Buzz" is the poem's climax—not transcendence but a fly between light and dying eyes.`,
    lineByLine: [
      { lines: '1-4', commentary: `The scene is hushed, expectant—"between the Heaves of Storm." Everyone awaits something significant.` },
      { lines: '13-16', commentary: `The fly "interposes"—blocks the expected revelation. "Blue – uncertain – stumbling" makes it pathetically real. "I could not see to see" is consciousness ending.` }
    ],
    themes: ['Death without transcendence', 'The mundane interrupting the sacred', 'Consciousness at its limit', 'Failed expectations'],
    literaryDevices: [
      { device: 'Bathos', example: 'Expecting "the King," getting a fly', explanation: 'The anticlimax is the point—death may offer nothing but distraction.' },
      { device: 'Synesthesia', example: '"Blue – uncertain – stumbling Buzz"', explanation: 'Sound described as color and movement blends senses as they fail.' }
    ],
    historicalContext: `Dickinson wrote this during the Civil War, when death was everywhere. The period expected "good deaths" with clear spiritual meaning. This poem refuses that comfort—death is physical, messy, meaningless.`
  },
  seoDescription: 'Analysis of Dickinson\'s "I heard a Fly buzz – when I died" - the deathbed poem where a fly replaces expected revelation.'
};
