import { PoemAnalysis } from './index';

export const theFly: PoemAnalysis = {
  slug: 'blake-the-fly',
  title: 'The Fly',
  poet: 'William Blake',
  poetBirth: 1757,
  poetDeath: 1827,
  year: 1794,
  collection: 'Songs of Experience',
  form: 'Lyric',
  text: `Little Fly,
Thy summer's play
My thoughtless hand
Has brushed away.

Am not I
A fly like thee?
Or art not thou
A man like me?

For I dance
And drink, and sing,
Till some blind hand
Shall brush my wing.

If thought is life
And strength and breath
And the want
Of thought is death;

Then am I
A happy fly,
If I live,
Or if I die.`,
  analysis: {
    overview: `"The Fly" is Blake at his most philosophically disorienting. It opens with a simple scene -- a hand swatting a fly -- and within twenty lines arrives at a radical claim about consciousness, mortality, and what it means to be alive. The speaker kills a fly without thinking, then asks whether he and the fly are fundamentally the same creature. Both dance, drink, and sing until "some blind hand" ends them. The logic is unsettling because it works in both directions: the speaker is lowered to the fly's level, and the fly is raised to his.

The poem's philosophical crux arrives in the fourth stanza: "If thought is life / And strength and breath / And the want / Of thought is death." This is a conditional statement, not a declaration. Blake is testing an idea: if consciousness is what defines life, then losing consciousness (whether through death or thoughtlessness) is a kind of death. The speaker who "thoughtlessly" killed the fly was, in that moment, as dead as the fly he killed.

The final stanza resolves -- or refuses to resolve -- the problem. "Then am I / A happy fly, / If I live, / Or if I die." If thought equals life, then a thoughtful person is alive regardless of physical state, and a thoughtless person is dead regardless of heartbeat. Blake collapses the distinction between life and death into a question about awareness. It is a tiny poem with enormous metaphysical ambition.`,
    lineByLine: [
      {
        lines: '1-4',
        commentary: `The opening is deceptively simple: a fly killed by a careless hand. "Little Fly" is tender, almost affectionate. "Thy summer's play" gives the fly a life of leisure and joy. "My thoughtless hand" is the key phrase -- "thoughtless" means both careless and literally without thought. The speaker wasn't thinking when he killed, which will become philosophically significant later.`
      },
      {
        lines: '5-8',
        commentary: `The reversal begins. "Am not I / A fly like thee?" seems rhetorical at first -- of course not. But Blake means it. The second question is even bolder: "Or art not thou / A man like me?" The fly is elevated and the man diminished simultaneously. The symmetry of the two questions forces the reader to take both seriously.`
      },
      {
        lines: '9-12',
        commentary: `The parallel is made concrete. "For I dance / And drink, and sing" -- the speaker's life is described in the same terms as the fly's "summer's play." "Till some blind hand / Shall brush my wing" -- death will come for the speaker as casually as it came for the fly. "Blind hand" echoes "thoughtless hand" from the first stanza, suggesting that whatever kills us will be as indifferent to us as we were to the fly.`
      },
      {
        lines: '13-16',
        commentary: `The philosophical pivot. "If thought is life" -- a conditional, not a certainty. Blake proposes that consciousness is the essence of being alive. "And the want / Of thought is death" -- "want" means lack or absence. Without thought, you are already dead. This retroactively condemns the speaker: his "thoughtless" killing of the fly was itself a small death of awareness.`
      },
      {
        lines: '17-20',
        commentary: `The conclusion is paradoxical and strangely cheerful. "Then am I / A happy fly" -- the speaker accepts the fly's identity. "If I live, / Or if I die" -- physical survival is irrelevant if thought defines life. A thinking being is alive even in death; a thoughtless being is dead even while breathing. The word "happy" is surprising -- Blake finds liberation, not despair, in this equivalence.`
      }
    ],
    themes: [
      'The equivalence of human and animal life',
      'Consciousness as the definition of being alive',
      'The casual violence of thoughtlessness',
      'Mortality as universal and indiscriminate',
      'The paradox of happiness beyond life and death',
      'The ethical implications of careless destruction'
    ],
    literaryDevices: [
      {
        device: 'Philosophical Analogy',
        example: '"Am not I / A fly like thee? / Or art not thou / A man like me?"',
        explanation: 'Blake uses chiastic questioning to collapse the boundary between human and insect. The symmetry of the structure forces the reader to consider both directions of the comparison equally.'
      },
      {
        device: 'Wordplay',
        example: '"My thoughtless hand"',
        explanation: '"Thoughtless" operates on two levels simultaneously: careless (the surface meaning) and literally without thought (the philosophical meaning that becomes central to the poem\'s argument).'
      },
      {
        device: 'Parallelism',
        example: '"Thy summer\'s play" / "For I dance / And drink, and sing"',
        explanation: 'The fly\'s life and the speaker\'s life are described in parallel terms of pleasure and play, making the comparison between them feel inevitable rather than forced.'
      },
      {
        device: 'Conditional Logic',
        example: '"If thought is life... Then am I / A happy fly"',
        explanation: 'Blake structures the poem\'s climax as a syllogism: if thought equals life, and thoughtlessness equals death, then the speaker\'s state of mind matters more than his physical state. The "if... then" framework gives philosophical weight to what could be whimsy.'
      },
      {
        device: 'Echoing Imagery',
        example: '"My thoughtless hand" / "some blind hand"',
        explanation: 'The "thoughtless hand" that kills the fly in stanza one becomes the "blind hand" that will kill the speaker in stanza three. The echo implies that the force of death operates with the same indifference at every scale.'
      },
      {
        device: 'Diminutive Address',
        example: '"Little Fly"',
        explanation: 'The tender diminutive sets up the poem\'s reversal: what begins as condescension toward something small becomes identification with it.'
      }
    ],
    historicalContext: `Published in Songs of Experience (1794), "The Fly" reflects the period's intense philosophical debates about consciousness, the soul, and the relationship between humans and animals. Blake was writing in the wake of Descartes' claim that animals were mere machines without consciousness -- a position Blake clearly rejects here. The poem also resonates with the emerging Romantic emphasis on feeling and awareness over rational categorization. Blake's willingness to equate a human with an insect was radical for a culture that placed humanity at the pinnacle of creation, and anticipates later ecological and animal rights thinking by over a century.`
  },
  seoDescription: 'Analysis of William Blake\'s "The Fly" from Songs of Experience. Line-by-line commentary exploring Blake\'s radical equation of human and insect life, consciousness as the essence of existence, and the ethics of thoughtlessness.',
  abstractWords: ['thought', 'life', 'death', 'happiness', 'consciousness'],
  rhymingPairs: [
    { word1: 'play', word2: 'away' },
    { word1: 'thee', word2: 'me' },
    { word1: 'sing', word2: 'wing' },
    { word1: 'fly', word2: 'die' }
  ]
};
