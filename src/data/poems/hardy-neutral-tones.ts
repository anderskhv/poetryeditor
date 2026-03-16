import { PoemAnalysis } from './index';

// Source: Public domain (Hardy died 1928)

export const neutralTones: PoemAnalysis = {
  slug: 'neutral-tones',
  title: 'Neutral Tones',
  poet: 'Thomas Hardy',
  poetBirth: 1840,
  poetDeath: 1928,
  year: 1867,
  form: 'Four quatrains in iambic tetrameter with ABBA rhyme scheme',
  text: `We stood by a pond that winter day,
And the sun was white, as though chidden of God,
And a few leaves lay on the starving sod;
— They had fallen from an ash, and were gray.

Your eyes on me were as eyes that rove
Over tedious riddles of years ago;
And some words played between us to and fro
On which lost the more by our love.

The smile on your mouth was the deadest thing
Alive enough to have strength to die;
And a grin of bitterness swept thereby
Like an ominous bird a-wing....

Since then, keen lessons that love deceives,
And wrings with wrong, have shaped to me
Your face, and the God-curst sun, and a tree,
And a pond edged with grayish leaves.`,
  analysis: {
    overview: `One of Hardy's earliest poems (written when he was 27, though not published until 1898), "Neutral Tones" distills the death of love into a single winter scene. Every element — the white sun, the gray leaves, the starving sod, the pond — is drained of color and warmth. The lovers' conversation is empty, the smile on her mouth is "the deadest thing / Alive enough to have strength to die." The final stanza reveals this is a memory: the scene has become the permanent image that all subsequent heartbreak maps onto.`,
    lineByLine: [
      { lines: '1-4', commentary: `The scene is set with forensic bleakness: a pond, a winter day, a sun that is "white, as though chidden of God" — scolded, punished, drained of warmth. Leaves on "the starving sod" are gray, from an ash tree. Every detail is neutral — colorless, lifeless, cold. The dash before "They had fallen" adds a flat, afterthought quality.` },
      { lines: '5-8', commentary: `Her eyes rove over him like someone puzzling over "tedious riddles of years ago" — he has become a boring unsolved problem. Words "played between us to and fro" but the subject is loss: "on which lost the more by our love." Even conversation is competitive accounting of damage.` },
      { lines: '9-12', commentary: `The poem's most devastating image: her smile is "the deadest thing / Alive enough to have strength to die." This paradox — dead yet alive enough to expire — captures love in its final, zombie-like state. The "grin of bitterness" that follows is compared to "an ominous bird a-wing" — the only movement in the entire still scene.` },
      { lines: '13-16', commentary: `The final stanza reveals the temporal frame: "Since then" — this is a memory that has hardened into a symbol. Every later lesson that "love deceives, / And wrings with wrong" maps back onto this scene: her face, the "God-curst sun," a tree, and the pond. The image is permanent, recursive, inescapable.` }
    ],
    themes: ['The death of love', 'Memory as permanent wound', 'Emotional neutrality as devastation', 'Nature mirroring inner desolation'],
    literaryDevices: [
      { device: 'Pathetic fallacy', example: 'the sun was white, as though chidden of God', explanation: 'The landscape mirrors the emotional state — every natural element is drained of color, warmth, and vitality to match the dead relationship.' },
      { device: 'Paradox', example: 'the deadest thing / Alive enough to have strength to die', explanation: 'The smile is simultaneously dead and dying — love reduced to a state beyond death, where even expiring requires effort.' },
      { device: 'Circular structure', example: 'We stood by a pond ... And a pond edged with grayish leaves', explanation: 'The poem ends where it began — at the pond — trapping the reader in the same recursive memory the speaker cannot escape.' },
      { device: 'Simile', example: 'Like an ominous bird a-wing', explanation: 'The bitter grin sweeps across her face like a bird of ill omen — the only movement in an otherwise frozen scene, and it signals doom.' }
    ],
    historicalContext: `Written in 1867 when Hardy was 27, possibly inspired by his troubled relationship with his cousin Tryphena Sparks, though the biographical connection is debated. The poem was not published until 1898 in Wessex Poems, Hardy's first poetry collection, which he issued after abandoning fiction. Its bleakness anticipates the tone of Hardy's mature poetry. The "neutral tones" of the title — the whites, grays, and absence of color — would become a signature Hardy technique: using landscape as emotional correlative.`
  },
  seoDescription: 'Neutral Tones by Thomas Hardy - analysis of the 1867 poem on the death of love, memory, and emotional desolation in a winter landscape.'
};
