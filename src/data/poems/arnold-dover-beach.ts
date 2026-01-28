import { PoemAnalysis } from './index';

// Source: Public Domain (Arnold died 1888)

export const doverBeach: PoemAnalysis = {
  slug: 'dover-beach',
  title: 'Dover Beach',
  poet: 'Matthew Arnold',
  poetBirth: 1822,
  poetDeath: 1888,
  year: 1867,
  form: 'Free verse with irregular rhyme',
  text: `The sea is calm tonight.
The tide is full, the moon lies fair
Upon the straits; on the French coast the light
Gleams and is gone; the cliffs of England stand,
Glimmering and vast, out in the tranquil bay.
Come to the window, sweet is the night-air!
Only, from the long line of spray
Where the sea meets the moon-blanched land,
Listen! you hear the grating roar
Of pebbles which the waves draw back, and fling,
At their return, up the high strand,
Begin, and cease, and then again begin,
With tremulous cadence slow, and bring
The eternal note of sadness in.

Sophocles long ago
Heard it on the Aegean, and it brought
Into his mind the turbid ebb and flow
Of human misery; we
Find also in the sound a thought,
Hearing it by this distant northern sea.

The Sea of Faith
Was once, too, at the full, and round earth's shore
Lay like the folds of a bright girdle furled.
But now I only hear
Its melancholy, long, withdrawing roar,
Retreating, to the breath
Of the night-wind, down the vast edges drear
And naked shingles of the world.

Ah, love, let us be true
To one another! for the world, which seems
To lie before us like a land of dreams,
So various, so beautiful, so new,
Hath really neither joy, nor love, nor light,
Nor certitude, nor peace, nor help for pain;
And we are here as on a darkling plain
Swept with confused alarms of struggle and flight,
Where ignorant armies clash by night.`,
  analysis: {
    overview: `"Dover Beach" is Arnold's masterpiece of Victorian doubt. Standing at a window overlooking the English Channel, the speaker moves from scenic beauty to existential crisis. The "Sea of Faith" was once full but now retreats, leaving humanity on a "darkling plain" without certainty. The only refuge is human love—"Ah, love, let us be true / To one another!" But even this is desperate rather than hopeful. The famous final image of "ignorant armies clash by night" captures the chaos of a world without shared belief.`,
    lineByLine: [
      { lines: '1-14', commentary: `The opening is deceptively peaceful—calm sea, full moon, French coast visible. But "Listen!" shifts to sound: the "grating roar" of pebbles brings "the eternal note of sadness." Beauty contains melancholy from the start.` },
      { lines: '15-20', commentary: `Sophocles heard the same sound on the Aegean and thought of "human misery." Arnold links himself to ancient tragedy—the sadness isn't modern but eternal. Yet "this distant northern sea" emphasizes his remove from classical certainty.` },
      { lines: '21-28', commentary: `The central metaphor: the "Sea of Faith" once wrapped the world like a "bright girdle" but now retreats with a "melancholy, long, withdrawing roar." This is Arnold's diagnosis of his age—faith ebbing, leaving "naked shingles" (bare pebble beaches).` },
      { lines: '29-37', commentary: `The desperate plea: "Ah, love, let us be true / To one another!" The world only "seems" beautiful—it actually offers neither joy, love, light, certitude, peace, nor help. The final image: a "darkling plain" where armies clash blindly. Human connection is the only shelter in chaos.` }
    ],
    themes: ['Loss of faith', 'Victorian doubt', 'Love as refuge', 'The eternal sadness of existence', 'Modernity as disenchantment'],
    literaryDevices: [
      { device: 'Extended metaphor', example: 'Sea of Faith', explanation: 'The retreating tide represents declining religious belief—once full, now withdrawing.' },
      { device: 'Allusion', example: 'Sophocles long ago', explanation: 'Links Victorian doubt to ancient Greek awareness of human misery—the problem is eternal, not new.' },
      { device: 'Imagery shift', example: 'Calm sea to darkling plain', explanation: 'The poem moves from tranquil seascape to battlefield—beauty dissolves into chaos.' },
      { device: 'Apostrophe', example: 'Ah, love, let us be true', explanation: 'Direct address to the beloved makes the plea urgent, personal, desperate.' }
    ],
    historicalContext: `Written around 1851 (published 1867), during the Victorian crisis of faith following geological discoveries and Darwin's work. Arnold saw traditional Christianity losing its hold on educated minds. The poem was likely written during Arnold's honeymoon, adding poignancy to the appeal to human love as substitute for lost faith.`
  },
  seoDescription: 'Dover Beach by Matthew Arnold - analysis of the 1867 poem on faith, love, and modernity.'
};
