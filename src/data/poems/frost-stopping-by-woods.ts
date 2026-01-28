import { PoemAnalysis } from './index';

// Source: Public Domain (published 1923)

export const stoppingByWoods: PoemAnalysis = {
  slug: 'stopping-by-woods',
  title: 'Stopping by Woods on a Snowy Evening',
  poet: 'Robert Frost',
  poetBirth: 1874,
  poetDeath: 1963,
  year: 1923,
  collection: 'New Hampshire',
  form: 'Four quatrains in iambic tetrameter with interlocking rhyme',
  text: `Whose woods these are I think I know.
His house is in the village though;
He will not see me stopping here
To watch his woods fill up with snow.

My little horse must think it queer
To stop without a farmhouse near
Between the woods and frozen lake
The darkest evening of the year.

He gives his harness bells a shake
To ask if there is some mistake.
The only other sound's the sweep
Of easy wind and downy flake.

The woods are lovely, dark and deep,
But I have promises to keep,
And miles to go before I sleep,
And miles to go before I sleep.`,
  analysis: {
    overview: `Frost's most famous poem operates on two levels simultaneously. On the surface: a traveler stops to watch snow fall in someone else's woods, then continues home. Below the surface: a meditation on death's appeal versus life's obligations. The "lovely, dark and deep" woods offer rest, escape, perhaps oblivion—but "promises to keep" pull the speaker back. The repeated final line is either simple emphasis or a recognition that the "sleep" ahead is death. Frost refused to confirm either reading.`,
    lineByLine: [
      { lines: '1-4', commentary: `The speaker knows whose woods these are but stops anyway—the owner is safely in the village. There's something furtive about this pause, as if the attraction to the snowy woods needs hiding.` },
      { lines: '5-8', commentary: `The horse finds this stop "queer"—no farmhouse, no practical reason. "The darkest evening of the year" is winter solstice, maximum darkness. The setting intensifies the woods' pull.` },
      { lines: '9-12', commentary: `The horse shakes its bells, questioning. The only sounds are wind and snow—"easy wind and downy flake." The quiet is seductive, hypnotic. Nature offers peace.` },
      { lines: '13-16', commentary: `"Lovely, dark and deep"—three adjectives that make the woods both beautiful and dangerous. "But I have promises to keep"—duty interrupts temptation. The repeated "miles to go before I sleep" is either literal (long ride home) or metaphorical (years to live before death). Frost leaves it ambiguous.` }
    ],
    themes: ['Duty versus desire', 'Death\'s attraction', 'Nature\'s seductive beauty', 'Obligation and responsibility', 'The pull of oblivion'],
    literaryDevices: [
      { device: 'Interlocking rhyme', example: 'AABA BBCB CCDC DDDD', explanation: 'Each stanza\'s third line rhymes with the next stanza\'s main rhyme, creating a chain. The final stanza breaks the pattern with four identical rhymes—closure.' },
      { device: 'Repetition', example: 'And miles to go before I sleep', explanation: 'The repeated line gains weight through repetition. Is it emphasis or exhaustion? Resolution or resignation?' },
      { device: 'Symbolism', example: 'The dark woods', explanation: 'Woods are "lovely, dark and deep"—beauty, mystery, death, rest, escape. The symbol holds multiple meanings.' },
      { device: 'Ambiguity', example: 'Sleep as literal or metaphorical', explanation: 'Frost structures the poem so both readings work—a journey home or a meditation on mortality.' }
    ],
    historicalContext: `Written in 1922, published in "New Hampshire" (1923). Frost claimed he wrote it in a single sitting after an all-night writing session, almost as a gift. He called it "my best bid for remembrance." The poem has been read at countless funerals, though Frost resisted confirming the death interpretation.`
  },
  seoDescription: 'Analysis of Stopping by Woods on a Snowy Evening by Robert Frost - the beloved 1923 poem about duty and beauty.'
};
