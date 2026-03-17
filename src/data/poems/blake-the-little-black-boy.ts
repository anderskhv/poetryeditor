import { PoemAnalysis } from './index';

export const theLittleBlackBoy: PoemAnalysis = {
  slug: 'blake-the-little-black-boy',
  title: 'The Little Black Boy',
  poet: 'William Blake',
  poetBirth: 1757,
  poetDeath: 1827,
  year: 1789,
  collection: 'Songs of Innocence',
  form: 'Lyric',
  text: `My mother bore me in the southern wild,
  And I  am black, but oh my soul is white!
White as an angel is the English child,
  But I am black, as if bereaved of light.

My mother taught me underneath a tree,
  And, sitting down before the heat of day,
She took me on her lap and kissed me,
  And, pointed to the east, began to say:

"Look on the rising sun: there God does live,
  And gives His light, and gives His heat away,
And flowers and trees and beasts and men receive
  Comfort in morning, joy in the noonday.

"And we are put on earth a little space,
  That we may learn to bear the beams of love
And these black bodies and this sunburnt face
  Is but a cloud, and like a shady grove.

"For when our souls have learn'd the heat to bear,
  The cloud will vanish, we shall hear His voice,
Saying, 'Come out from the grove, my love and care
  And round my golden tent like lambs rejoice',"

Thus did my mother say, and kissed me;
And thus I say to little English boy.
When I from black and he from white cloud free,
And round the tent of God like lambs we joy

I'll shade him from the heat till he can bear
To lean in joy upon our Father's knee;
And then I'll stand and stroke his silver hair,
And be like him, and he will then love me.`,
  // 34 lines
  analysis: {
    overview: `"The Little Black Boy" is one of Blake's most unsettling poems precisely because it sounds comforting. A Black child, taught by his mother, explains that dark skin is merely a "cloud" that will vanish in heaven, where he and the white English boy will be equal before God. The mother's theology is beautiful — bodies are temporary shelters, souls learn to bear divine love, and all will rejoice together. But Blake embeds a devastating irony: the child has so internalized racial hierarchy that he imagines himself serving the white boy in paradise, shading him "till he can bear" God's light, hoping to earn love through service.

The poem operates on two levels simultaneously. Read innocently, it is a tender spiritual lesson about equality before God. Read critically, it exposes how deeply racism has colonized even a child's imagination — he cannot picture divine equality without placing himself in a subordinate role. The final line, "and he will then love me," is heartbreaking because it reveals the child's belief that love must be earned, not given. Blake does not resolve this tension. He lets the child's voice carry both the hope and the damage, trusting the reader to hear what the child cannot.

The mother's teaching is genuinely profound — her image of black skin as a "shady grove" that protects against divine heat inverts the racial logic of her era, making darkness a spiritual advantage rather than a deficit. But the child's application of her lesson betrays how impossible it is to think outside the structures of oppression while living inside them.`,
    lineByLine: [
      {
        lines: '1-4',
        commentary: `The child announces his race as a problem to be explained: "I am black, but oh my soul is white!" The "but" is the wound — he already sees blackness as something requiring justification. "White as an angel is the English child" accepts whiteness as the default of purity. "Bereaved of light" frames dark skin as loss, as grief. Blake is not endorsing this — he is showing us what the child has been taught to believe.`
      },
      {
        lines: '5-8',
        commentary: `The scene shifts to a memory of maternal tenderness — "underneath a tree," the mother holds the child on her lap, kisses him, and begins teaching. The tree, the lap, the kiss: this is Eden-like, a protected space. She points east toward the rising sun, grounding her lesson in observable nature rather than abstract doctrine.`
      },
      {
        lines: '9-12',
        commentary: `The mother's theology begins: God lives in the sun and "gives His light, and gives His heat away." This is a God of pure generosity — light and heat are given freely to all creation. "Flowers and trees and beasts and men" — the catalogue insists on universal reception. No hierarchy in who receives God's gifts.`
      },
      {
        lines: '13-16',
        commentary: `"We are put on earth a little space" — life is brief and purposeful. The purpose: "learn to bear the beams of love." This is the poem's most radical idea. Divine love is so intense it must be endured, trained for. Black skin becomes a "shady grove" — not a deficit but protection, an advantage in spiritual preparation. The mother inverts the racial hierarchy her child has absorbed.`
      },
      {
        lines: '17-20',
        commentary: `"The cloud will vanish" — bodies are temporary. In heaven, God will call them from the grove to "round my golden tent like lambs rejoice." The pastoral imagery (lambs, tent) echoes both biblical and Blakean innocence. "My love and care" — God addresses them with tenderness, not judgment.`
      },
      {
        lines: '21-24',
        commentary: `The child takes over from his mother: "Thus did my mother say, and kissed me." He now applies her lesson to his relationship with the English boy. "When I from black and he from white cloud free" — both colors are clouds, both temporary. This is the mother's teaching correctly understood: equality in heaven.`
      },
      {
        lines: '25-28',
        commentary: `But here the child departs from his mother's lesson. He imagines shading the white boy from God's heat — serving him, protecting him — and only afterward standing to "stroke his silver hair, / And be like him." The desire to "be like him" reveals the damage still intact. "He will then love me" — conditional love, earned through service. The child cannot imagine being loved as he is. Blake's critique of racist theology is complete: even the best spiritual teaching cannot fully undo what society has inscribed on a child's self-conception.`
      }
    ],
    themes: [
      'Racial innocence and internalized oppression',
      'The body as spiritual vessel — skin as temporary "cloud"',
      'Maternal love as theological instruction',
      'Conditional vs. unconditional love',
      'Equality before God vs. social hierarchy',
      'The limits of spiritual consolation under injustice',
      'Childhood as a site of both hope and damage'
    ],
    literaryDevices: [
      {
        device: 'Dramatic Irony',
        example: '"And be like him, and he will then love me"',
        explanation: 'The child means this hopefully, but the reader hears the tragedy: he believes he must become white and serve the white boy to deserve love. Blake lets the gap between the child\'s innocence and the reader\'s understanding carry the poem\'s critique.'
      },
      {
        device: 'Metaphor (Inversion)',
        example: '"these black bodies and this sunburnt face / Is but a cloud, and like a shady grove"',
        explanation: 'The mother reframes dark skin from deficit to protection — a grove that shelters from divine heat. This inverts the racial logic of the era by making blackness spiritually advantageous.'
      },
      {
        device: 'Contrast',
        example: '"I am black, but oh my soul is white! / White as an angel is the English child"',
        explanation: 'The black/white binary runs through the poem, but Blake complicates it: both colors are "clouds" to be shed. The child, however, cannot stop privileging whiteness.'
      },
      {
        device: 'Pastoral Imagery',
        example: '"round my golden tent like lambs rejoice"',
        explanation: 'The heaven imagined here is pastoral — tents, lambs, groves — drawing on both biblical shepherd imagery and Blake\'s own Songs of Innocence iconography. It is deliberately childlike.'
      },
      {
        device: 'Repetition',
        example: '"And gives His light, and gives His heat away"',
        explanation: 'The doubled "gives" emphasizes God\'s generosity as unconditional and abundant — a direct counter to the conditional love the child expects from the English boy.'
      },
      {
        device: 'Symbolism',
        example: '"the rising sun"',
        explanation: 'The sun represents God\'s love and presence throughout the poem. The mother\'s gesture of pointing east toward sunrise transforms a natural phenomenon into theological evidence.'
      }
    ],
    historicalContext: `Published in 1789, the same year as the French Revolution and at the height of the British abolitionist movement. The slave trade would not be abolished in the British Empire until 1807, and slavery itself persisted until 1833. Blake was a committed abolitionist — his companion poem "The Little Black Boy" in Songs of Innocence must be read alongside poems like "The Chimney Sweeper" as critiques of how innocence is exploited by unjust systems. The poem's theology echoes arguments abolitionists actually used: all souls are equal before God. But Blake's genius is showing that even this well-meaning theology cannot fully liberate a child whose self-image has been shaped by a racist world.`
  },
  seoDescription: 'Analysis of William Blake\'s "The Little Black Boy" from Songs of Innocence. Line-by-line commentary exploring racial innocence, maternal theology, and the devastating irony of internalized oppression in one of Blake\'s most complex poems.',
  abstractWords: ['soul', 'love', 'light', 'comfort', 'joy'],
  rhymingPairs: [
    { word1: 'wild', word2: 'child' },
    { word1: 'tree', word2: 'me' },
    { word1: 'bear', word2: 'hair' },
    { word1: 'space', word2: 'face' },
    { word1: 'voice', word2: 'rejoice' }
  ]
};
