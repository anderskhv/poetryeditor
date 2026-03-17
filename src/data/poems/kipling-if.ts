import { PoemAnalysis } from './index';

export const ifPoem: PoemAnalysis = {
  slug: 'kipling-if',
  title: 'If—',
  poet: 'Rudyard Kipling',
  poetBirth: 1865,
  poetDeath: 1936,
  year: 1910,
  collection: 'Rewards and Fairies',
  form: 'Didactic Poem',
  text: `If you can keep your head when all about you
Are losing theirs and blaming it on you;
If you can trust yourself when all men doubt you,
But make allowance for their doubting too:
If you can wait and not be tired by waiting,
Or being lied about, don't deal in lies,
Or being hated don't give way to hating,
And yet don't look too good, nor talk too wise;
If you can dream—and not make dreams your master;
If you can think—and not make thoughts your aim,
If you can meet with Triumph and Disaster
And treat those two impostors just the same:
If you can bear to hear the truth you've spoken
Twisted by knaves to make a trap for fools,
Or watch the things you gave your life to, broken,
And stoop and build 'em up with worn-out tools;
If you can make one heap of all your winnings
And risk it on one turn of pitch-and-toss,
And lose, and start again at your beginnings
And never breathe a word about your loss:
 &#8203;If you can force your heart and nerve and sinew
To serve your turn long after they are gone,
And so hold on when there is nothing in you
Except the Will which says to them: 'Hold on!'
If you can talk with crowds and keep your virtue,
Or walk with Kings—nor lose the common touch,
If neither foes nor loving friends can hurt you,
If all men count with you, but none too much:
If you can fill the unforgiving minute
With sixty seconds' worth of distance run,
Yours is the Earth and everything that's in it,
And—which is more—you'll be a Man, my son!`,
  analysis: {
    overview: `"If—" is the most popular poem in the English language by many polls, and also one of the most misread. It is usually taken as a straightforward list of virtues—keep calm, be honest, persevere—which makes it sound like a motivational poster. But the poem is more interesting than that. Every piece of advice contains a paradox or a contradiction: trust yourself AND make allowance for doubters; dream AND don't make dreams your master; talk with crowds AND keep your virtue; walk with Kings AND keep the common touch. Kipling is not listing simple virtues. He is describing a nearly impossible balancing act—the ability to hold opposing qualities simultaneously without collapsing into either extreme.

The poem is also darker than it appears. "If you can bear to hear the truth you've spoken / Twisted by knaves to make a trap for fools" is about being misquoted and weaponized. "Watch the things you gave your life to, broken, / And stoop and build 'em up with worn-out tools" is about total loss followed by exhausted rebuilding. "If you can force your heart and nerve and sinew / To serve your turn long after they are gone" describes pushing past physical and emotional breakdown. This is not a comfortable poem. The conditions it sets are so demanding that the final reward—"Yours is the Earth and everything that's in it"—feels less like a promise and more like an acknowledgment that almost no one will get there. The word "Man" in the last line is earned precisely because the standard is inhuman.`,
    lineByLine: [
      {
        lines: '1-8',
        commentary: `The first stanza sets up the pattern: each "If" clause presents a virtue that could easily tip into a vice. "Keep your head when all about you / Are losing theirs" is not just about calm—it includes "and blaming it on you," meaning you must stay composed while being scapegoated. "Trust yourself when all men doubt you, / But make allowance for their doubting too" is the key paradox: self-confidence that includes humility. "Don't look too good, nor talk too wise" is Kipling warning against the appearance of superiority—virtue must not become self-righteousness.`
      },
      {
        lines: '9-16',
        commentary: `"If you can dream—and not make dreams your master; / If you can think—and not make thoughts your aim"—dreaming and thinking are good, but treating them as ends in themselves is paralysis. "Triumph and Disaster" are capitalized as "impostors"—both success and failure are lies if you let them define you. The second half turns brutal: hearing your own words "Twisted by knaves to make a trap for fools" is about political and social betrayal. Watching your life's work broken and stooping "to build 'em up with worn-out tools" is about rebuilding without resources or energy—starting over when you have nothing left.`
      },
      {
        lines: '17-24',
        commentary: `"Make one heap of all your winnings / And risk it on one turn of pitch-and-toss"—the gambling metaphor is about total commitment, staking everything on a single throw. "And lose, and start again at your beginnings / And never breathe a word about your loss" adds the hardest condition: silence about your suffering. No complaints, no self-pity. The physical stanza—"force your heart and nerve and sinew / To serve your turn long after they are gone"—describes the body failing while the will continues. "Except the Will which says to them: 'Hold on!'" is pure Stoic endurance: will alone sustains action after every other resource is spent.`
      },
      {
        lines: '25-32',
        commentary: `The final stanza moves from private endurance to public life. "Talk with crowds and keep your virtue, / Or walk with Kings—nor lose the common touch"—you must navigate both democracy and aristocracy without being corrupted by either. "If neither foes nor loving friends can hurt you"—note that friends are as dangerous as enemies here. "Fill the unforgiving minute / With sixty seconds' worth of distance run" is the poem's most concrete image: time as a race, and every second must count. The payoff—"Yours is the Earth and everything that's in it, / And—which is more—you'll be a Man, my son!"—makes manhood not a birthright but an achievement. The dash before "which is more" suggests that being a Man matters more than owning the Earth.`
      }
    ],
    themes: [
      'The paradox of virtue—each quality must be balanced against its excess',
      'Stoic endurance and will as the ultimate resource',
      'The impossibility of the ideal and the value of pursuing it anyway',
      'Self-reliance tempered by humility',
      'Loss, rebuilding, and silence about suffering',
      'Manhood as achievement rather than birthright',
      'The danger of both triumph and disaster as identity'
    ],
    literaryDevices: [
      {
        device: 'Anaphora',
        example: '"If you can ... If you can ... If you can"',
        explanation: 'The relentless repetition of "If" creates a mounting list of conditions that feels increasingly impossible to satisfy. The payoff is delayed for 32 lines—the entire poem is one conditional sentence.'
      },
      {
        device: 'Personification',
        example: '"If you can meet with Triumph and Disaster / And treat those two impostors just the same"',
        explanation: 'Triumph and Disaster are capitalized and given human agency—they are "impostors" who pretend to be real. The advice is to see through their disguise and refuse to be defined by either.'
      },
      {
        device: 'Paradox',
        example: '"If you can trust yourself when all men doubt you, / But make allowance for their doubting too"',
        explanation: 'Trust yourself AND accommodate doubt. These are contradictory impulses, and Kipling demands both simultaneously. The poem is built on such double demands—each virtue balanced against its opposite.'
      },
      {
        device: 'Synecdoche',
        example: '"If you can force your heart and nerve and sinew / To serve your turn long after they are gone"',
        explanation: 'Heart, nerve, and sinew represent the total person—emotional, neurological, physical. All three fail, and the Will alone remains. The body parts stand for the whole human being pushed past its limits.'
      },
      {
        device: 'Metaphor',
        example: '"If you can fill the unforgiving minute / With sixty seconds\' worth of distance run"',
        explanation: 'Time becomes a container to be filled, and effort becomes distance. The metaphor makes abstract diligence into something measurable and athletic—every second is a stride in a race.'
      },
      {
        device: 'Single-Sentence Structure',
        example: 'The entire poem from "If" to "my son!"',
        explanation: 'The whole poem is grammatically one sentence: a protasis (if-clauses, 30 lines) and an apodosis (the result, 2 lines). This structure enacts the poem\'s meaning: the conditions are enormous, the reward is brief, and you must endure the whole list to earn it.'
      }
    ],
    historicalContext: `Kipling wrote "If—" in 1895 and published it in "Rewards and Fairies" (1910). It was inspired by Leander Starr Jameson, who led the failed Jameson Raid into the Transvaal in 1895-96 and maintained his composure during the resulting public humiliation and trial. Kipling admired Jameson's stoicism under pressure. The poem became the most anthologized poem in Britain and was voted the UK's favorite poem in multiple BBC polls. Kipling won the Nobel Prize in Literature in 1907 (the first English-language writer to do so). The poem has been both celebrated as a statement of personal integrity and criticized as an idealization of British imperial masculinity—the stiff upper lip as moral philosophy.`,
  },
  seoDescription: 'Analysis of Rudyard Kipling\'s "If—" with line-by-line commentary. Explore the paradoxes beneath the poem\'s famous advice and why its conditions are harder than they seem.',
  abstractWords: ['virtue', 'triumph', 'disaster', 'will', 'trust'],
  rhymingPairs: [
    { word1: 'you', word2: 'too' },
    { word1: 'master', word2: 'Disaster' },
    { word1: 'toss', word2: 'loss' },
    { word1: 'run', word2: 'son' },
    { word1: 'touch', word2: 'much' }
  ],
};
