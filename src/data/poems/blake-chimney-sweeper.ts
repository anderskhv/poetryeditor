import { PoemAnalysis } from './index';

// Source: Public domain (1789)

export const chimneySweeper: PoemAnalysis = {
  slug: 'the-chimney-sweeper',
  title: 'The Chimney Sweeper',
  poet: 'William Blake',
  poetBirth: 1757,
  poetDeath: 1827,
  year: 1789,
  collection: 'Songs of Innocence',
  form: 'Six quatrains',
  text: `When my mother died I was very young,
And my father sold me while yet my tongue
Could scarcely cry 'weep! 'weep! 'weep! 'weep!'
So your chimneys I sweep and in soot I sleep.

There's little Tom Dacre, who cried when his head,
That curled like a lamb's back, was shaved; so I said,
"Hush, Tom! never mind it, for, when your head's bare,
You know that the soot cannot spoil your white hair."

And so he was quiet, and that very night,
As Tom was a-sleeping, he had such a sight!
That thousands of sweepers, Dick, Joe, Ned, and Jack,
Were all of them locked up in coffins of black;

And by came an Angel who had a bright key,
And he opened the coffins and set them all free;
Then down a green plain, leaping, laughing, they run,
And wash in a river, and shine in the sun.

Then naked and white, all their bags left behind,
They rise upon clouds, and sport in the wind;
And the Angel told Tom, if he'd be a good boy,
He'd have God for his father, and never want joy.

And so Tom awoke; and we rose in the dark,
And got with our bags and our brushes to work.
Though the morning was cold, Tom was happy and warm;
So if all do their duty, they need not fear harm.`,
  analysis: {
    overview: 'Blake contrasts child labor’s brutality with a dream of angelic rescue, exposing how hope is used to soften injustice.',
    lineByLine: [
      { lines: '1-8', commentary: 'The speaker reveals his sale into labor and consoles a friend after a humiliating haircut.' },
      { lines: '9-16', commentary: 'Tom dreams of countless sweepers trapped in black coffins who are freed by an angel.' },
      { lines: '17-24', commentary: 'The dream promises reward for obedience, and the boys return to work in the cold.' }
    ],
    themes: ['Child labor', 'Innocence and exploitation', 'Religion', 'Hope as consolation'],
    literaryDevices: [
      { device: 'Imagery', example: 'coffins of black', explanation: 'Turns soot-covered children into funereal images.' },
      { device: 'Irony', example: 'happy and warm', explanation: 'Happiness is shown as a fragile coping mechanism.' }
    ],
    historicalContext: 'Blake wrote against child labor practices in industrial London, especially chimney sweeping.'
  },
  seoDescription: 'The Chimney Sweeper by William Blake with full text and analysis of its critique of child labor.'
};
