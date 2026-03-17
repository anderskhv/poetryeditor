import { PoemAnalysis } from './index';

export const chargeOfTheLightBrigade: PoemAnalysis = {
  slug: 'tennyson-charge-light-brigade',
  title: 'The Charge of the Light Brigade',
  poet: 'Alfred, Lord Tennyson',
  poetBirth: 1809,
  poetDeath: 1892,
  year: 1854,
  form: 'Narrative Poem',
  text: `Half a league, half a league,
Half a league onward,
All in the valley of Death
Rode the six hundred.
"Charge," was the captain's cry;
Their's not to reason why,
Their's not to make reply,
Their's but to do and die,
Into the valley of Death
Rode the six hundred.
 &#8203;
2.
Cannon to right of them,
Cannon to left of them,
Cannon in front of them
Volley'd and thunder'd;
Storm'd at with shot and shell,
Boldly they rode and well;
Into the jaws of Death,
Into the mouth of Hell,
Rode the six hundred.
3.
Flash'd all their sabres bare,
Flash'd all at once in air,
Sabring the gunners there,
Charging an army, while
All the world wonder'd:
Plunged in the battery-smoke
 &#8203;Fiercely the line they broke;
Strong was the sabre-stroke;
Making an army reel
Shaken and sunder'd.
Then they rode back, but not,
Not the six hundred.
4.
Cannon to right of them,
Cannon to left of them,
Cannon behind them
Volley'd and thunder'd;
Storm'd at with shot and shell,
They that had struck so well
Rode thro' the jaws of Death,
Half a league back again,
Up from the mouth of Hell,
All that was left of them,
Left of six hundred.`,
  analysis: {
    overview: `"The Charge of the Light Brigade" celebrates courage while quietly condemning the incompetence that made that courage necessary. On October 25, 1854, during the Battle of Balaclava in the Crimean War, a miscommunicated order sent approximately 670 British cavalrymen charging directly into a valley lined with Russian artillery on three sides. About 110 were killed and 160 wounded in roughly twenty minutes. Tennyson wrote the poem within weeks, and its rhetorical power made it instantly famous—but it sits on an uncomfortable contradiction that gives the poem its real force.

The contradiction is this: "Their's not to reason why, / Their's but to do and die." Tennyson presents unquestioning obedience as heroic, yet the poem cannot avoid the fact that "some one had blunder'd." The soldiers are magnificent because they ride into certain death without hesitation. But they ride into certain death because an officer made a catastrophic mistake. Tennyson honors the soldiers without quite indicting the command, but the structure of the poem does the work: the valley of Death surrounds them from the first stanza, cannon appear on every side, and the survivors who ride back are "Not the six hundred" and later "All that was left of them, / Left of six hundred." The repetition of "six hundred" is a body count. The poem glorifies sacrifice while making it impossible to forget the waste. That tension—between heroism and futility, between honoring soldiers and questioning orders—is why it endures.`,
    lineByLine: [
      {
        lines: '1-10',
        commentary: `"Half a league, half a league, / Half a league onward"—the galloping rhythm of dactyls mimics hoofbeats and creates momentum before the reader can think. "All in the valley of Death" names the destination immediately: these men are riding toward death, not away from it. "Their's not to reason why, / Their's not to make reply, / Their's but to do and die"—three lines of perfect obedience, each one surrendering a different human faculty: reason, speech, and survival. The stanza is a funnel from movement to death.`
      },
      {
        lines: '11-20',
        commentary: `"Cannon to right of them, / Cannon to left of them, / Cannon in front of them"—the spatial repetition creates a three-sided trap. The cannons "Volley'd and thunder'd" while the soldiers "Boldly they rode and well." The juxtaposition of the passive soldiers against the active artillery is devastating. "Into the jaws of Death, / Into the mouth of Hell" personifies the valley as a consuming beast. The six hundred are swallowed.`
      },
      {
        lines: '21-31',
        commentary: `The only stanza that describes the cavalry actually fighting: "Flash'd all their sabres bare, / Flash'd all at once in air." The repetition of "Flash'd" captures the sudden, synchronized gleam of drawn swords. "Charging an army, while / All the world wonder'd" acknowledges the absurdity—a cavalry charge against entrenched artillery. They break the Russian line briefly ("Fiercely the line they broke; / Strong was the sabre-stroke") but the victory is pyrrhic. "Then they rode back, but not, / Not the six hundred"—the double negative and the pause before "Not the six hundred" is a moment of accounting. Many are already dead.`
      },
      {
        lines: '32-42',
        commentary: `The retreat mirrors the advance: "Cannon to right of them, / Cannon to left of them, / Cannon behind them"—now the artillery is behind as well. The same structure as stanza 2, but "in front" has become "behind." They ride back "thro' the jaws of Death" and "Up from the mouth of Hell." "All that was left of them, / Left of six hundred" uses "left" twice with different meanings: "remaining" and "remaining of." The diminishment is relentless.`
      }
    ],
    themes: [
      'Heroism within futility—courage that does not depend on good orders',
      'Obedience as both virtue and tragedy',
      'The gap between military command and military sacrifice',
      'The rhythms of war: advance, engagement, retreat, diminishment',
      'Collective identity and the weight of numbers ("the six hundred")',
      'Honor in the face of certain death'
    ],
    literaryDevices: [
      {
        device: 'Dactylic Meter / Galloping Rhythm',
        example: '"Half a league, half a league, / Half a league onward"',
        explanation: 'The stressed-unstressed-unstressed pattern mimics the rhythm of horses at full gallop. The poem\'s meter physically enacts the charge, pulling the reader forward before they can pause to question.'
      },
      {
        device: 'Anaphora / Repetition',
        example: '"Cannon to right of them, / Cannon to left of them, / Cannon in front of them"',
        explanation: 'The repeated structure creates a sense of encirclement. The sameness of the lines mirrors the sameness of the threat from every direction—there is no escape.'
      },
      {
        device: 'Refrain',
        example: '"Rode the six hundred"',
        explanation: 'The refrain anchors every stanza and serves as a counter: six hundred rode in, but fewer and fewer ride back. By the final stanza it becomes "Left of six hundred"—the number becomes an elegy.'
      },
      {
        device: 'Personification',
        example: '"Into the jaws of Death, / Into the mouth of Hell"',
        explanation: 'Death and Hell become predatory beasts with jaws and mouths. The valley is alive and consuming. The soldiers ride into a creature, not a landscape.'
      },
      {
        device: 'Antithesis',
        example: '"Their\'s not to reason why, / Their\'s but to do and die"',
        explanation: 'Reason and action are set against each other. The soldiers\' job is not to think but to execute orders—even orders that mean their execution. The double meaning of "die" (to do and to die) collapses duty and death into one act.'
      },
      {
        device: 'Structural Mirroring',
        example: 'Stanza 2 (advance) vs. Stanza 4 (retreat)',
        explanation: 'The retreat stanza mirrors the advance almost line for line, but "in front of them" becomes "behind them." This structural echo shows that the trap was total—the same artillery that fired on them going in fires on them coming out.'
      }
    ],
    historicalContext: `Tennyson wrote the poem on December 2, 1854, just weeks after the Battle of Balaclava (October 25, 1854) during the Crimean War. He was Poet Laureate of Great Britain, and the poem was partly a response to a Times editorial about the disastrous charge. The order to charge was likely a miscommunication between Lord Raglan (who wanted a limited advance to retrieve captured guns on a ridge) and Lord Lucan and Lord Cardigan (who interpreted it as a frontal assault on the main Russian battery). Of the approximately 670 men who charged, about 110 were killed and 160 wounded. Tennyson's poem made the event legendary and was distributed to troops in the Crimea. The phrase "someone had blunder'd" was included in the original version, removed under political pressure, then restored—Tennyson recognized that the poem needed the admission of error to be honest.`,
  },
  seoDescription: 'Analysis of Tennyson\'s "The Charge of the Light Brigade" with line-by-line commentary. Explore how the poem celebrates courage while exposing the futility of a catastrophic military blunder.',
  abstractWords: ['death', 'honor', 'glory', 'obedience', 'sacrifice'],
  rhymingPairs: [
    { word1: 'why', word2: 'die' },
    { word1: 'well', word2: 'shell' },
    { word1: 'bare', word2: 'air' },
    { word1: 'broke', word2: 'stroke' }
  ],
};
