import { PoemAnalysis } from './index';

export const sonnet116: PoemAnalysis = {
  slug: 'sonnet-116',
  title: 'Sonnet 116: Let me not to the marriage of true minds',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `Let me not to the marriage of true minds
Admit impediments. Love is not love
Which alters when it alteration finds,
Or bends with the remover to remove:
O no! it is an ever-fixed mark
That looks on tempests and is never shaken;
It is the star to every wandering bark,
Whose worth's unknown, although his height be taken.
Love's not Time's fool, though rosy lips and cheeks
Within his bending sickle's compass come;
Love alters not with his brief hours and weeks,
But bears it out even to the edge of doom.
If this be error and upon me proved,
I never writ, nor no man ever loved.`,
  analysis: {
    overview: `Sonnet 116 is Shakespeare's most famous definition of love—and it's a lie we want to believe. The poem claims love never changes, never bends, survives all tempests. But read against the rest of the sequence, this is either self-deception or desperation. By sonnet 116, Shakespeare has already documented jealousy, betrayal, and the beloved's infidelity. The poem's certainty is suspicious: "Let me not admit impediments" sounds like someone trying to talk themselves into faith. The final couplet makes a bet it cannot lose—if he's wrong about love, then no one ever loved, which we know is false. It's beautiful rhetoric, but rhetoric is what liars use.`,
    lineByLine: [
      {
        lines: '1-4',
        commentary: `"Let me not" is oddly passive—he's asking not to admit something, as if the admission is being forced. "Marriage of true minds" echoes the wedding service ("if any know impediments"). "Love is not love / Which alters when it alteration finds"—a tautology that sounds profound but says: if it changes, it wasn't real. This is unfalsifiable.`
      },
      {
        lines: '5-8',
        commentary: `Now positive definitions: love is a "fixed mark" (lighthouse or sea-mark) that survives tempests. It's the North Star to "every wandering bark" (ship). "Whose worth's unknown, although his height be taken"—we can measure its position but not its value. The navigation metaphor suggests love guides us through confusion.`
      },
      {
        lines: '9-12',
        commentary: `"Time's fool"—love isn't mocked by time, even though beauty fades ("rosy lips and cheeks" under the "bending sickle"). "Bears it out even to the edge of doom"—lasts until Judgment Day. But notice: he's not saying love prevents death, only that love doesn't notice it.`
      },
      {
        lines: '13-14',
        commentary: `The couplet is a rhetorical trap. "If this be error and upon me proved"—if I'm wrong—"I never writ, nor no man ever loved." But he did write this, and people do love. So he must be right? This is circular logic dressed as confidence. The double negative ("nor no man") adds emphasis but also instability.`
      }
    ],
    themes: [
      'Love as unchanging ideal',
      'Constancy versus mutability',
      'Time and decay',
      'The gap between ideal and experience',
      'Self-persuasion through rhetoric'
    ],
    literaryDevices: [
      {
        device: 'Anaphora',
        example: '"Love is not... Love\'s not"',
        explanation: 'Repeated negations define love by what it isn\'t—suggesting positive definition is impossible.'
      },
      {
        device: 'Navigation Metaphor',
        example: '"star to every wandering bark"',
        explanation: 'Love as a fixed star for lost ships—guiding, constant, but also distant and cold.'
      },
      {
        device: 'Personification',
        example: '"Time\'s fool," "his bending sickle"',
        explanation: 'Time becomes a mocker with a weapon; love refuses to be his victim.'
      }
    ],
    historicalContext: `This sonnet is frequently read at weddings, often without awareness of its context. In the sequence, it follows poems about betrayal and precedes poems about a "Dark Lady" who represents everything unstable this poem denies. Shakespeare may be arguing against his own experience—insisting on an ideal of love precisely because reality has failed him.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 116 "Let me not to the marriage of true minds" - the famous wedding poem defining love as constant and unchanging.'
};
