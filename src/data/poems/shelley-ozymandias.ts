import { PoemAnalysis } from './index';

// Source: Public Domain (Shelley died 1822)

export const ozymandias: PoemAnalysis = {
  slug: 'ozymandias',
  title: 'Ozymandias',
  poet: 'Percy Bysshe Shelley',
  poetBirth: 1792,
  poetDeath: 1822,
  year: 1818,
  collection: 'The Examiner (newspaper)',
  form: 'Sonnet',
  text: `I met a traveller from an antique land,
Who said—"Two vast and trunkless legs of stone
Stand in the desert. . . . Near them, on the sand,
Half sunk a shattered visage lies, whose frown,
And wrinkled lip, and sneer of cold command,
Tell that its sculptor well those passions read
Which yet survive, stamped on these lifeless things,
The hand that mocked them, and the heart that fed;
And on the pedestal, these words appear:
My name is Ozymandias, King of Kings;
Look on my Works, ye Mighty, and despair!
Nothing beside remains. Round the decay
Of that colossal Wreck, boundless and bare
The lone and level sands stretch far away."`,
  analysis: {
    overview: `History's greatest "look on my works and despair" is immediately undercut by "nothing beside remains." The poem has three artists: the sculptor who captured arrogance, the traveler who reports it, and Shelley who frames both. The tyrant thought he was the subject; he's actually the object lesson. Time wins every argument with power.`,
    lineByLine: [
      { lines: '1-8', commentary: `"I met a traveller"—the frame distances us twice. The statue's "sneer of cold command" survives because the sculptor "well those passions read." Art outlasts the tyrant by mocking him.` },
      { lines: '9-14', commentary: `The inscription's boast ("Look on my Works, ye Mighty, and despair!") is devastated by what follows: "Nothing beside remains." The desert's emptiness is the poem's punchline.` }
    ],
    themes: ['The impermanence of power', 'Art outlasting tyranny', 'Pride and its fall', 'Time as the ultimate judge'],
    literaryDevices: [
      { device: 'Irony', example: 'The gap between inscription and reality', explanation: 'Ozymandias commands despair at his greatness; we despair at his obliteration.' },
      { device: 'Frame Narrative', example: 'Poet → traveler → sculptor → king', explanation: 'Multiple layers of transmission emphasize how story outlives monument.' }
    ],
    historicalContext: `Written in competition with Horace Smith, who wrote his own "Ozymandias" sonnet. Shelley's won. "Ozymandias" is Greek for Ramesses II. The British Museum had just acquired a massive Ramesses statue fragment—Shelley never saw it but imagined the rest.`
  },
  seoDescription: 'Analysis of Shelley\'s "Ozymandias" - the famous sonnet on the impermanence of power and the irony of tyrants\' monuments.'
};
