import { PoemAnalysis } from './index';

// Source: Public Domain (published 1920 in A Few Figs from Thistles)

export const whatLipsMyLips: PoemAnalysis = {
  slug: 'what-lips-my-lips-have-kissed',
  title: 'What lips my lips have kissed, and where, and why',
  poet: 'Edna St. Vincent Millay',
  poetBirth: 1892,
  poetDeath: 1950,
  year: 1920,
  collection: 'A Few Figs from Thistles',
  form: 'Petrarchan Sonnet',
  text: `What lips my lips have kissed, and where, and why,
I have forgotten, and what arms have lain
Under my head till morning; but the rain
Is full of ghosts tonight, that tap and sigh
Upon the glass and listen for reply,
And in my heart there stirs a quiet pain
For unremembered lads that not again
Will turn to me at midnight with a cry.

Thus in the winter stands the lonely tree,
Nor knows what birds have vanished one by one,
Yet knows its boughs more silent than before:
I cannot say what loves have come and gone,
I only know that summer sang in me
A little while, that in me sings no more.`,
  analysis: {
    overview: `A woman cataloging forgotten lovers—radical for 1920. Millay reverses the usual script: she's the one who loved and moved on, who can't quite remember the men. But there's loss here too. The "unremembered lads" are ghosts in the rain; summer "sings no more." It's both defiant and elegiac—she owned her desire, and now mourns its fading.`,
    lineByLine: [
      { lines: '1-4', commentary: `"What lips... and where, and why, / I have forgotten"—casual about forgetting lovers. But rain is "full of ghosts" that "tap and sigh"—memory returns unbidden.` },
      { lines: '5-8', commentary: `The ghosts "listen for reply" they won't get. "Unremembered lads" is casually devastating—they're not even distinct enough to name. They won't return "with a cry"—desire is past.` },
      { lines: '9-11', commentary: `The tree metaphor: it doesn't know which birds left, only that branches are "more silent." Loss without specific memory.` },
      { lines: '12-14', commentary: `"Summer sang in me / A little while"—youth and desire as a season. "In me sings no more"—not regret for the lovers, but for her own capacity to feel that intensely.` }
    ],
    themes: ['Memory and forgetting', 'Female desire', 'The loss of youth', 'Love as season'],
    literaryDevices: [
      { device: 'Petrarchan sonnet', example: 'Octave/sestet structure', explanation: 'The traditional love sonnet form, subverted by a woman speaker with many lovers.' },
      { device: 'Extended metaphor', example: 'Tree with vanished birds', explanation: 'The sestet shifts from human memory to natural image—loss without itemization.' },
      { device: 'Personification', example: 'Rain full of ghosts, summer singing', explanation: 'Memory and desire become external forces visiting her.' }
    ],
    historicalContext: `Millay was openly bisexual in an era when women's desire was barely acknowledged. This sonnet shocked readers by presenting a woman who had many lovers and couldn't quite remember them—a male poetic pose, claimed by a woman.`
  },
  seoDescription: 'Analysis of Millay\'s "What lips my lips have kissed" - the revolutionary sonnet about a woman\'s forgotten lovers and fading desire.'
};
