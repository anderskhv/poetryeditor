import { PoemAnalysis } from './index';

// Source: Public domain (Wordsworth died 1850)

export const myHeartLeapsUp: PoemAnalysis = {
  slug: 'my-heart-leaps-up',
  title: 'My Heart Leaps Up',
  poet: 'William Wordsworth',
  poetBirth: 1770,
  poetDeath: 1850,
  year: 1802,
  form: 'Nine-line lyric with irregular rhyme',
  text: `My heart leaps up when I behold
A rainbow in the sky:
So was it when my life began;
So is it now I am a man;
So be it when I shall grow old,
Or let me die!
The Child is father of the Man;
And I could wish my days to be
Bound each to each by natural piety.`,
  analysis: {
    overview: 'A nine-line declaration that the capacity for wonder must persist from childhood through old age — and that losing it would make life not worth living.',
    lineByLine: [
      { lines: '1-2', commentary: 'The opening is pure Wordsworth: an involuntary physical response ("leaps up") to natural beauty. The rainbow is the trigger, but the real subject is the capacity to be moved.' },
      { lines: '3-6', commentary: 'Three temporal stages — childhood, manhood, old age — linked by the repeated "So." The force of "Or let me die!" is striking: Wordsworth would rather not live than lose this responsiveness.' },
      { lines: '7-9', commentary: '"The Child is father of the Man" — the poem\'s most famous line, a paradox that reverses the expected hierarchy. Childhood wonder teaches and shapes the adult. "Natural piety" means reverence for nature, not religion.' }
    ],
    themes: ['Continuity of wonder', 'Childhood as spiritual origin', 'Nature as sacred', 'The passage of time'],
    literaryDevices: [
      { device: 'Paradox', example: 'The Child is father of the Man', explanation: 'Reverses the biological relationship to argue that childhood experience is the origin and authority for adult feeling.' },
      { device: 'Anaphora', example: 'So was it / So is it / So be it', explanation: 'The triple repetition binds past, present, and future into a single emotional continuity.' },
      { device: 'Hyperbole', example: 'Or let me die!', explanation: 'The exclamation elevates the stakes: loss of wonder is equated with death itself.' }
    ],
    historicalContext: 'Wordsworth later used the "Child is father of the Man" line as the epigraph to his "Ode: Intimations of Immortality." The poem was composed at Dove Cottage in the Lake District during one of Wordsworth\'s most productive periods.'
  },
  seoDescription: 'My Heart Leaps Up by William Wordsworth — full text and analysis of the 1802 poem about wonder, childhood, and "The Child is father of the Man."'
};
