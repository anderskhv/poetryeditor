import { PoemAnalysis } from './index';

// Source: Public Domain (Wordsworth died 1850)

export const solitaryReaper: PoemAnalysis = {
  slug: 'solitary-reaper',
  title: 'The Solitary Reaper',
  poet: 'William Wordsworth',
  poetBirth: 1770,
  poetDeath: 1850,
  year: 1807,
  collection: 'Poems, in Two Volumes',
  form: 'Ballad',
  text: `Behold her, single in the field,
Yon solitary Highland Lass!
Reaping and singing by herself;
Stop here, or gently pass!
Alone she cuts and binds the grain,
And sings a melancholy strain;
O listen! for the Vale profound
Is overflowing with the sound.

No Nightingale did ever chaunt
More welcome notes to weary bands
Of travellers in some shady haunt,
Among Arabian sands:
A voice so thrilling ne'er was heard
In spring-time from the Cuckoo-bird,
Breaking the silence of the seas
Among the farthest Hebrides.

Will no one tell me what she sings?—
Perhaps the plaintive numbers flow
For old, unhappy, far-off things,
And battles long ago:
Or is it some more humble lay,
Familiar matter of to-day?
Some natural sorrow, loss, or pain,
That has been, and may be again?

Whate'er the theme, the Maiden sang
As if her song could have no ending;
I saw her singing at her work,
And o'er the sickle bending;—
I listened, motionless and still;
And, as I mounted up the hill,
The music in my heart I bore,
Long after it was heard no more.`,
  analysis: {
    overview: `A poem about not understanding. The speaker hears a Highland girl singing in Gaelic while reaping grain—he doesn't know the language, can't identify the song, yet calls it more beautiful than nightingale or cuckoo. The mystery is the point. Meaning matters less than the music carried away in memory.`,
    lineByLine: [
      { lines: '1-8', commentary: `"Behold her"—the speaker frames the scene for us. "Stop here, or gently pass"—we're instructed how to behave. The vale "overflows" with sound, as if the landscape is a vessel.` },
      { lines: '17-24', commentary: `"Will no one tell me what she sings?" The question goes unanswered. His guesses—ancient battles, present sorrows—are generic. The content doesn't matter; the emotion transcends language.` }
    ],
    themes: ['Mystery and beauty', 'The limits of understanding', 'Memory preserving experience', 'Solitude and labor'],
    literaryDevices: [
      { device: 'Rhetorical Question', example: '"Will no one tell me what she sings?"', explanation: 'The unanswered question emphasizes that understanding isn\'t necessary for appreciation.' },
      { device: 'Comparison', example: 'Nightingale, Cuckoo-bird', explanation: 'Exotic comparisons (Arabia, Hebrides) heighten the ordinary girl\'s extraordinariness.' }
    ],
    historicalContext: `Based on a passage in Thomas Wilkinson's Tours to the British Mountains describing a girl singing in Erse. Wordsworth never witnessed the scene himself—he imagined it from reading. The poem is thus about imagination's power to transform secondhand description into felt experience.`
  },
  seoDescription: 'Analysis of Wordsworth\'s "The Solitary Reaper" - a meditation on mysterious beauty and how memory preserves what we cannot understand.'
};
