import { PoemAnalysis } from './index';

export const shelleyRemembrance: PoemAnalysis = {
  slug: 'shelley-remembrance',
  title: 'Remembrance',
  poet: 'Percy Bysshe Shelley',
  poetBirth: 1792,
  poetDeath: 1822,
  year: 1824,
  form: 'Lyric',
  text: `Swifter far than summer's flight--
Swifter far than youth's delight--
Swifter far than happy night,
Art thou come and gone--
As the earth when leaves are dead,
As the night when sleep is sped,
As the heart when joy is fled,
I am left lone, alone.

The swallow summer comes again--
The owlet night resumes her reign--
But the wild-swan youth is fain
To fly with thee, false as thou.--
My heart each day desires the morrow;
Sleep itself is turned to sorrow;
Vainly would my winter borrow
Sunny leaves from any bough.

Lilies for a bridal bed--
Roses for a matron's head--
Violets for a maiden dead--
Pansies let MY flowers be:
On the living grave I bear
Scatter them without a tear--
Let no friend, however dear,
Waste one hope, one fear for me.`,
  analysis: {
    overview: `"Remembrance" is a poem about abandonment so complete that the speaker has stopped asking for its reversal. The three stanzas move from description of loss (stanza 1), through the failure of natural renewal to compensate (stanza 2), to a final request that is actually a refusal — "Let no friend, however dear, / Waste one hope, one fear for me." The speaker doesn't want to be mourned because mourning implies the possibility of recovery, and recovery is exactly what this poem denies.

The poem's formal control is striking given its emotional content. Each stanza uses the same pattern: three rapid lines with the same end-rhyme ("flight/delight/night," "again/reign/fain," "bed/head/dead") followed by a fourth line that breaks the pattern and delivers the emotional blow. The triple rhymes create velocity; the fourth line crashes. Shelley uses the same technique in the second half of each stanza, and the effect is relentless — the poem is a series of controlled falls. The flower imagery in the final stanza is particularly devastating: lilies for brides, roses for matrons, violets for dead maidens — the speaker claims pansies for himself, the flower of thought and grief, scattered on "the living grave I bear."`,
    lineByLine: [
      {
        lines: '1-8',
        commentary: `Three anaphoric lines — "Swifter far than" — establish the speed of departure. The beloved left faster than summer, youth, and happy night. Each comparison is already something brief, making the departure seem instantaneous. "Art thou come and gone" — the beloved arrived and departed in a single breath. The second half mirrors the structure: "As the earth when leaves are dead, / As the night when sleep is sped, / As the heart when joy is fled" — three similes for emptiness. Earth without leaves, night without sleep, heart without joy. "I am left lone, alone" — the comma separates "lone" from "alone," making the solitude feel both described and experienced. The repetition insists: not just solitary, but absolutely singular.`
      },
      {
        lines: '9-16',
        commentary: `Nature cycles back — "The swallow summer comes again" — but it doesn't help. "The owlet night resumes her reign" — darkness returns on schedule. "But the wild-swan youth is fain / To fly with thee, false as thou" — youth has defected, following the departed beloved. "False as thou" is the poem's bitterest phrase — the beloved is explicitly accused of betrayal. "My heart each day desires the morrow; / Sleep itself is turned to sorrow" — even rest becomes suffering. "Vainly would my winter borrow / Sunny leaves from any bough" — the speaker is in permanent winter, unable to borrow warmth from any source. "Vainly" seals it: the attempt is futile.`
      },
      {
        lines: '17-26',
        commentary: `The final stanza assigns flowers to life stages: "Lilies for a bridal bed-- / Roses for a matron's head-- / Violets for a maiden dead." Each flower belongs to a recognizable role — bride, mother, dead virgin. "Pansies let MY flowers be" — "MY" is capitalized for emphasis. The speaker chooses pansies, derived from the French "pensees" (thoughts) — the flower of melancholy reflection. "On the living grave I bear / Scatter them without a tear" — "living grave" is the poem's most extreme image: the speaker is alive but already a tomb. "Without a tear" — the instruction is to scatter the flowers dry-eyed, because tears imply hope. "Let no friend, however dear, / Waste one hope, one fear for me" — the final request refuses sympathy itself. Don't hope for me, don't fear for me. I am beyond both.`
      }
    ],
    themes: [
      'Abandonment beyond the reach of consolation',
      'The failure of natural cycles to restore the self',
      'Youth as a traitor that follows the beloved',
      'The living grave — death-in-life',
      'The refusal of sympathy as a form of despair',
      'Flowers as markers of life stages the speaker has lost'
    ],
    literaryDevices: [
      {
        device: 'Anaphora',
        example: '"Swifter far than summer\'s flight-- / Swifter far than youth\'s delight-- / Swifter far than happy night"',
        explanation: 'The triple repetition creates acceleration — each "Swifter far" pushes the departure faster. The technique mirrors the content: the beloved left so quickly that the poem can barely keep up.'
      },
      {
        device: 'Triple Rhyme Pattern',
        example: '"flight/delight/night," "again/reign/fain," "bed/head/dead"',
        explanation: 'Each stanza groups three lines with the same end-rhyme before breaking the pattern in the fourth. The triple rhymes build momentum; the break delivers the emotional impact. The form enacts the poem\'s experience: speed followed by crash.'
      },
      {
        device: 'Oxymoron',
        example: '"the living grave I bear"',
        explanation: 'A grave that is alive — the speaker is both dead and living. The oxymoron captures the poem\'s central state: existence without life, survival without vitality.'
      },
      {
        device: 'Personification',
        example: '"The owlet night resumes her reign"',
        explanation: 'Night is an owl-queen reclaiming her throne. The personification makes nature\'s cycles feel deliberate and indifferent — nature carries on its business regardless of the speaker\'s suffering.'
      },
      {
        device: 'Symbolic Catalogue',
        example: '"Lilies for a bridal bed-- / Roses for a matron\'s head-- / Violets for a maiden dead-- / Pansies let MY flowers be"',
        explanation: 'Each flower represents a stage of female life (bride, mother, dead maiden). The speaker claims pansies — the flower of thought and mourning — identifying with none of the conventional roles, only with grief itself.'
      },
      {
        device: 'Imperative Refusal',
        example: '"Let no friend, however dear, / Waste one hope, one fear for me"',
        explanation: 'The final lines command friends not to care. This is the most extreme form of despair — not asking for help, but forbidding it. Sympathy itself is declared a waste.'
      }
    ],
    historicalContext: `"Remembrance" was published posthumously in 1824, two years after Shelley drowned in a sailing accident in the Gulf of Spezia at age 29. The poem's biographical referent is uncertain — it may address a specific loss or express a more generalized despair. Shelley's personal life was marked by multiple abandonments and losses: his first wife Harriet's suicide, estrangement from his children, the deaths of two children with Mary Shelley, and exile from England. The poem's emotional extremity reflects both Romantic conventions of sensibility and Shelley's genuine experience of loss and displacement.`,
  },
  seoDescription: 'Analysis of Shelley\'s "Remembrance" — a poem of absolute abandonment where natural cycles fail to console and the speaker refuses sympathy itself as a waste.',
  abstractWords: ['sorrow', 'delight', 'remembrance', 'hope', 'fear'],
  rhymingPairs: [
    { word1: 'flight', word2: 'night' },
    { word1: 'again', word2: 'reign' },
    { word1: 'sorrow', word2: 'borrow' },
    { word1: 'bed', word2: 'dead' },
    { word1: 'dear', word2: 'fear' }
  ],
};
