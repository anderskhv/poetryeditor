import { PoemAnalysis } from './index';

// Source: Public Domain (Blake died 1827)

export const theTyger: PoemAnalysis = {
  slug: 'the-tyger',
  title: 'The Tyger',
  poet: 'William Blake',
  poetBirth: 1757,
  poetDeath: 1827,
  year: 1794,
  collection: 'Songs of Experience',
  form: 'Lyric',
  text: `Tyger Tyger, burning bright,
In the forests of the night;
What immortal hand or eye,
Could frame thy fearful symmetry?

In what distant deeps or skies,
Burnt the fire of thine eyes?
On what wings dare he aspire?
What the hand, dare seize the fire?

And what shoulder, & what art,
Could twist the sinews of thy heart?
And when thy heart began to beat,
What dread hand? & what dread feet?

What the hammer? what the chain,
In what furnace was thy brain?
What the anvil? what dread grasp,
Dare its deadly terrors clasp!

When the stars threw down their spears
And water'd heaven with their tears:
Did he smile his work to see?
Did he who made the Lamb make thee?

Tyger Tyger burning bright,
In the forests of the night:
What immortal hand or eye,
Dare frame thy fearful symmetry?`,
  analysis: {
    overview: `"The Tyger" asks whether the same God made both the lamb and the tiger—gentleness and ferocity. The poem never answers. Each stanza adds questions without resolution. The final change from "Could" to "Dare" suggests the real question: not ability but audacity. What creator would dare make such terror?`,
    lineByLine: [
      { lines: '1-4', commentary: `The tiger "burns" in darkness. "Fearful symmetry"—beautiful and terrifying. The question: what creator made this?` },
      { lines: '21-24', commentary: `"Could" becomes "Dare"—the question shifts from capability to moral audacity.` }
    ],
    themes: ['Creation and creator', 'Good and evil', 'Divine responsibility', 'Beauty in terror'],
    literaryDevices: [
      { device: 'Rhetorical Questions', example: 'The entire poem', explanation: 'Relentless questions with no answers create theological unease.' },
      { device: 'Industrial Imagery', example: 'Hammer, chain, furnace, anvil', explanation: 'God as blacksmith forging the tiger—creation as violent labor.' }
    ],
    historicalContext: `Paired with "The Lamb" from Songs of Innocence. Together they pose Blake's central question: how can one God create both innocence and experience, gentleness and violence?`
  },
  seoDescription: 'Analysis of Blake\'s "The Tyger" - the famous poem questioning whether the same God made lamb and tiger.'
};
