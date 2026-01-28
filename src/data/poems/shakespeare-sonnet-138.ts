import { PoemAnalysis } from './index';

// Source: Project Gutenberg - Public Domain

export const sonnet138: PoemAnalysis = {
  slug: 'sonnet-138',
  title: 'Sonnet 138: When my love swears that she is made of truth',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `When my love swears that she is made of truth
I do believe her, though I know she lies,
That she might think me some untutor'd youth,
Unlearned in the world's false subtleties.
Thus vainly thinking that she thinks me young,
Although she knows my days are past the best,
Simply I credit her false speaking tongue:
On both sides thus is simple truth suppress'd.
But wherefore says she not she is unjust?
And wherefore say not I that I am old?
O, love's best habit is in seeming trust,
And age in love loves not to have years told.
Therefore I lie with her and she with me,
And in our faults by lies we flatter'd be.`,
  analysis: {
    overview: `Sonnet 138 is about mutual deception in love. She lies about fidelity; he pretends to believe. He lies about being young; she pretends not to notice. "I lie with her" puns on deception and sex. Both prefer comfortable lies to painful truth—a bleak but honest portrait of a relationship sustained by willful blindness.`,
    lineByLine: [
      { lines: '1-4', commentary: `She swears truth; he believes though he knows she lies. He wants to seem young and naive.` },
      { lines: '5-8', commentary: `He pretends she thinks him young; she knows he's old. "Simple truth suppressed" on both sides.` },
      { lines: '9-12', commentary: `Why not admit her unfaithfulness, his age? Because love prefers "seeming trust" to real disclosure.` },
      { lines: '13-14', commentary: `"I lie with her"—sleep with/deceive. Mutual lies create mutual flattery. A cynical bargain.` }
    ],
    themes: ['Mutual deception', 'Aging and denial', 'Sexual puns', 'Love as bargain'],
    literaryDevices: [
      { device: 'Pun', example: '"I lie with her"', explanation: 'Lie = deceive AND lie (in bed). Sex and deception fused.' },
      { device: 'Chiasmus', example: 'I lie with her and she with me', explanation: 'Mirrored structure shows reciprocal deception.' }
    ],
    historicalContext: `Dark Lady sonnet. Published earlier in The Passionate Pilgrim (1599). Shows the cynical, knowing quality of this later relationship.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 138 "When my love swears" - the Dark Lady poem about mutual deception and the pun on "lie."'
};
