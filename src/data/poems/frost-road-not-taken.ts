import { PoemAnalysis } from './index';

// Source: Project Gutenberg https://www.gutenberg.org/ebooks/29345

export const roadNotTaken: PoemAnalysis = {
  slug: 'the-road-not-taken',
  title: 'The Road Not Taken',
  poet: 'Robert Frost',
  poetBirth: 1874,
  poetDeath: 1963,
  year: 1916,
  collection: 'Mountain Interval',
  form: 'Lyric poem in four stanzas of iambic tetrameter',
  text: `Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;

Then took the other, as just as fair,
And having perhaps the better claim,
Because it was grassy and wanted wear;
Though as for that the passing there
Had worn them really about the same,

And both that morning equally lay
In leaves no step had trodden black.
Oh, I kept the first for another day!
Yet knowing how way leads on to way,
I doubted if I should ever come back.

I shall be telling this with a sigh
Somewhere ages and ages hence:
Two roads diverged in a wood, and I—
I took the one less traveled by,
And that has made all the difference.`,
  analysis: {
    overview: 'Often misread as celebrating individualism, Frost intended irony—the speaker admits both paths were "really about the same."',
    lineByLine: [
      { lines: '1-5', commentary: 'The speaker faces a choice between two paths in autumn woods, symbolizing life decisions.' }
    ],
    themes: ['Choice', 'Individualism', 'Regret', 'Self-deception', 'The passage of time'],
    literaryDevices: [
      { device: 'Extended metaphor', example: 'The diverging roads', explanation: 'Life choices represented as a fork in the path.' },
      { device: 'Irony', example: 'I took the one less traveled by', explanation: 'The speaker earlier admits both paths were worn "really about the same."' }
    ],
    historicalContext: 'Written for Frost\'s friend Edward Thomas, gently mocking his indecisiveness on their walks.'
  },
  seoDescription: 'Analysis of The Road Not Taken by Robert Frost - exploring the irony behind this famous 1916 poem about choices.'
};
