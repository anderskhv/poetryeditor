import { PoemAnalysis } from './index';

// Source: Shakespeare's Sonnets (1609) - Public Domain

export const sonnet18: PoemAnalysis = {
  slug: 'sonnet-18',
  title: 'Sonnet 18: Shall I compare thee to a summer\'s day?',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: 'Shakespeare\'s Sonnets',
  form: 'Shakespearean Sonnet',
  text: `Shall I compare thee to a summer's day?
Thou art more lovely and more temperate.
Rough winds do shake the darling buds of May,
And summer's lease hath all too short a date.

Sometime too hot the eye of heaven shines,
And often is his gold complexion dimmed;
And every fair from fair sometime declines,
By chance, or nature's changing course, untrimmed;

But thy eternal summer shall not fade,
Nor lose possession of that fair thou ow'st,
Nor shall death brag thou wand'rest in his shade,
When in eternal lines to Time thou grow'st.

So long as men can breathe, or eyes can see,
So long lives this, and this gives life to thee.`,
  analysis: {
    overview: `Sonnet 18 is about the claim that poetry can defeat death. The poem explicitly says art will make the beloved immortal—"So long lives this, and this gives life to thee." What it doesn't say, but is equally true: the poet immortalizes himself too. Shakespeare's name lives because of this poem. Is that self-serving? Yes, but the poem never claims otherwise—it just doesn't mention it. The argument is surprisingly negative about summer (too hot, too windy, too brief) to set up the twist: nature fails, but art endures. Another detail readers miss: "thee" is almost certainly a young man, not a woman—the first 126 sonnets address a male, which changes how we hear "more lovely and more temperate."`,
    lineByLine: [
      {
        lines: '1-2',
        commentary: `"Shall I compare thee?" is a trick question—he's already doing it. "Temperate" is doing double duty: it means moderate in temperature (unlike extreme summer) AND even-tempered in personality. The beloved is praised for being stable, not dramatic.`
      },
      {
        lines: '3-4',
        commentary: `Here's the surprise: Shakespeare spends 8 lines criticizing summer. "Rough winds" destroy beauty, and summer holds only a "lease"—a rental agreement. This commercial language in a love poem is intentionally jarring. Summer doesn't own its beauty; it's borrowed.`
      },
      {
        lines: '5-6',
        commentary: `The sun is "the eye of heaven"—but even it fails. "Too hot" or "dimmed" by clouds. Shakespeare is building a case: if even the sun is unreliable, how can any natural thing preserve beauty? The answer is coming.`
      },
      {
        lines: '7-8',
        commentary: `"Every fair from fair sometime declines"—every beautiful thing will lose its beauty. "Untrimmed" is debated: it might mean "stripped of decoration" or (nautically) "with sails unfurled." Either way: beauty gets wrecked by chance or by nature's "changing course."`
      },
      {
        lines: '9-10',
        commentary: `The turn. "But" announces the reversal. After 8 lines trashing summer, Shakespeare claims the beloved's summer is "eternal." How? Not through nature—through poetry. "That fair thou ow'st" = the beauty you own. Unlike summer's lease, you'll own this forever.`
      },
      {
        lines: '11-12',
        commentary: `"Nor shall death brag"—death personified as a boaster who won't get to claim this victory. The beloved lives in "eternal lines"—this poem's lines. "Grow'st" is strange: are you grafted onto Time? Growing into it? Scholars disagree, but the meaning is clear: you become permanent.`
      },
      {
        lines: '13-14',
        commentary: `The boldest couplet in English poetry. "So long as men can breathe"—Shakespeare predicts his poem will outlast civilizations. And it has. Notice the claim is specific: "this gives life to thee"—the poem saves the beloved. But who saves the poem? The poet does, by writing it. Shakespeare doesn't claim immortality for himself, but achieves it by association. The poem says art is immortal; Shakespeare just happens to be the artist.`
      }
    ],
    themes: [
      'Poetry as immortality (and the poet\'s ego)',
      'Natural beauty vs. artistic preservation',
      'Time as the enemy that art defeats',
      'The limits of all natural comparisons',
      'Self-fulfilling prophecy'
    ],
    literaryDevices: [
      {
        device: 'Rhetorical Question',
        example: '"Shall I compare thee to a summer\'s day?"',
        explanation: 'The question pretends to be asking permission, but he\'s already comparing. It\'s a false modesty that sets up a bolder claim.'
      },
      {
        device: 'Litany of Complaints',
        example: 'Rough winds, too short, too hot, dimmed, declines',
        explanation: 'Shakespeare spends 8 lines attacking summer—an unexpected move in what seems like a compliment. The negativity makes the turn more powerful.'
      },
      {
        device: 'Legal/Commercial Metaphor',
        example: '"summer\'s lease"',
        explanation: 'Describing beauty as a lease—a temporary rental—is jarring in a love poem. It introduces the idea that nature only borrows beauty; it doesn\'t own it.'
      },
      {
        device: 'Personification',
        example: '"death brag," "eye of heaven"',
        explanation: 'Death becomes a braggart who will be denied his boast. The sun becomes a face with a "gold complexion." These make abstract forces into defeatable opponents.'
      },
      {
        device: 'Self-Reference',
        example: '"eternal lines," "this gives life to thee"',
        explanation: 'The poem points to itself as the solution. This is either supreme confidence or supreme arrogance—and it turned out to be justified.'
      }
    ],
    historicalContext: `The sonnets were published in 1609 but likely written in the 1590s. The "thee" in sonnets 1-126 is a young man (often called the "Fair Youth"), not a woman. Early sonnets urge him to marry and have children to preserve his beauty. Sonnet 18 marks a shift: Shakespeare realizes poetry works better than procreation for immortality. Some scholars see rivalry here—the poet claiming his verse outperforms biological reproduction.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 18 "Shall I compare thee to a summer\'s day?" Line-by-line commentary on this immortal meditation on beauty, time, and poetry\'s power to defeat death.'
};
