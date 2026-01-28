import { PoemAnalysis } from './index';

// Source: Public Domain (Wordsworth died 1850)

export const worldTooMuch: PoemAnalysis = {
  slug: 'world-too-much',
  title: 'The World Is Too Much with Us',
  poet: 'William Wordsworth',
  poetBirth: 1770,
  poetDeath: 1850,
  year: 1807,
  collection: 'Poems, in Two Volumes',
  form: 'Petrarchan Sonnet',
  text: `The world is too much with us; late and soon,
Getting and spending, we lay waste our powers;—
Little we see in Nature that is ours;
We have given our hearts away, a sordid boon!
This Sea that bares her bosom to the moon;
The winds that will be howling at all hours,
And are up-gathered now like sleeping flowers;
For this, for everything, we are out of tune;
It moves us not. Great God! I'd rather be
A Pagan suckled in a creed outworn;
So might I, standing on this pleasant lea,
Have glimpses that would make me less forlorn;
Have sight of Proteus rising from the sea;
Or hear old Triton blow his wreathèd horn.`,
  analysis: {
    overview: `Wordsworth's environmental jeremiad. We're so busy with commerce ("getting and spending") that nature no longer moves us. His solution is startling: he'd rather be a pagan than a modern Christian blind to nature. The poem trades monotheism for mythology, suggesting the old gods kept humans in right relationship with the natural world.`,
    lineByLine: [
      { lines: '1-8', commentary: `"Late and soon"—always, constantly. "Getting and spending" reduces life to economics. "Sordid boon" is oxymoronic—a gift that degrades. The sea and wind are personified, alive, but "we are out of tune."` },
      { lines: '9-14', commentary: `The volta brings the shocking wish: better to be pagan. Proteus (shape-shifter) and Triton (sea god) represent a worldview where nature is divine. "Less forlorn"—not happy, just less bereft.` }
    ],
    themes: ['Materialism versus spiritual life', 'Alienation from nature', 'Critique of modernity', 'Paganism as ecological consciousness'],
    literaryDevices: [
      { device: 'Oxymoron', example: '"sordid boon"', explanation: 'The gift of modern progress is actually degradation.' },
      { device: 'Classical Allusion', example: 'Proteus, Triton', explanation: 'Greek sea gods represent an older relationship with nature—one of awe and participation.' }
    ],
    historicalContext: `Written during the Industrial Revolution's acceleration. Wordsworth watched rural England transform. The poem's preference for paganism was radical—some readers found it blasphemous. But Wordsworth isn't advocating polytheism; he's diagnosing what monotheism lost.`
  },
  seoDescription: 'Analysis of Wordsworth\'s "The World Is Too Much with Us" - the Romantic critique of materialism and alienation from nature.'
};
