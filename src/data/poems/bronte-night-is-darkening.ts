import { PoemAnalysis } from './index';

export const nightIsDarkening: PoemAnalysis = {
  slug: 'bronte-night-is-darkening',
  title: 'The Night Is Darkening Round Me',
  poet: 'Emily Bronte',
  poetBirth: 1818,
  poetDeath: 1848,
  year: 1837,
  form: 'Lyric',
  text: `The night is darkening round me,
The wild winds coldly blow ;
But a tyrant spell has bound me,
And I cannot, cannot go.

The giant trees are bending
Their bare boughs weighed with snow ;
The storm is fast descending,
And yet I cannot go.

Clouds beyond clouds above me,
Wastes beyond wastes below ;
But nothing drear can move me :
I will not, cannot go.`,
  // 14 lines
  analysis: {
    overview: `This is a poem about being paralyzed — and not wanting to be freed. The speaker stands in a worsening storm (darkness, wind, snow, clouds) and refuses to leave. What makes it extraordinary is the shift across the three stanzas: "I cannot, cannot go" becomes "And yet I cannot go" becomes "I will not, cannot go." That final "will not" changes everything. It reveals that what seemed like helpless captivity is at least partly chosen. The "tyrant spell" may be external, but the speaker has stopped fighting it.

Bronte wrote this at nineteen, already developing the psychological complexity that would define Wuthering Heights a decade later. The poem resists interpretation — it never names the spell, never explains what holds the speaker. Is it depression? Artistic obsession? Love? The Gondal fantasy world she shared with Anne? All have been proposed. The poem's power lies in refusing to answer. The landscape is not metaphor — it is literal storm — but it also mirrors an interior state of magnificent, terrifying stillness at the center of chaos.

The formal structure reinforces the content: three stanzas of identical shape, each ending with a variation on "I cannot go." The repetition creates a sense of ritual incantation, as if the poem itself is the spell that binds. The rhyme scheme (ABAB) is simple and unyielding, like the speaker's refusal to move.`,
    lineByLine: [
      {
        lines: '1-4',
        commentary: `"The night is darkening round me" — not just dark, but darkening, an active process of enclosure. The winds blow "coldly," and then the key word: "tyrant spell." Something has "bound" the speaker. At this point it sounds like a victim's report — I am trapped, I cannot escape. The doubled "cannot, cannot" is desperate, emphatic.`
      },
      {
        lines: '5-8',
        commentary: `The storm intensifies: trees bend under snow, the storm descends. "Giant trees" and "bare boughs weighed with snow" — the landscape is both majestic and oppressive. "And yet I cannot go" — the "yet" is important. It acknowledges that the worsening conditions should motivate departure. The speaker knows she should leave. She cannot.`
      },
      {
        lines: '9-12',
        commentary: `The scope expands to cosmic scale: "Clouds beyond clouds above me, / Wastes beyond wastes below." Infinity in both directions — the speaker is suspended between endless sky and endless emptiness. Then the decisive turn: "I will not, cannot go." The addition of "will not" transforms the poem. This is no longer pure helplessness. There is volition here — a choice made within captivity, or a captivity that has become indistinguishable from choice. "Nothing drear can move me" — she is immovable, and the word "drear" dismisses all the storm's power as insufficient to break whatever holds her.`
      }
    ],
    themes: [
      'Paralysis as both captivity and choice',
      'The sublime terror of nature',
      'Inner resolve against external force',
      'The unnamed spell — obsession, depression, or creative possession',
      'Defiance through stillness',
      'The merging of will and compulsion'
    ],
    literaryDevices: [
      {
        device: 'Incremental Repetition',
        example: '"cannot, cannot go" → "I cannot go" → "I will not, cannot go"',
        explanation: 'Each stanza ends with a variation on the same refusal, but the wording shifts crucially. The progression from pure inability to a blend of will and inability is the entire emotional arc of the poem.'
      },
      {
        device: 'Pathetic Fallacy',
        example: '"The night is darkening round me, / The wild winds coldly blow"',
        explanation: 'The storm mirrors the speaker\'s psychological state — but Bronte complicates the device by making the speaker indifferent to it. The landscape reflects her, but cannot affect her.'
      },
      {
        device: 'Anaphora / Parallelism',
        example: '"Clouds beyond clouds above me, / Wastes beyond wastes below"',
        explanation: 'The parallel structure creates a sense of infinite extension in both directions, placing the speaker at the still center of a vast, hostile universe.'
      },
      {
        device: 'Personification',
        example: '"a tyrant spell has bound me"',
        explanation: 'The spell is given political power — it is a "tyrant," implying the speaker is its subject. This raises the question of resistance: does she serve willingly or under absolute compulsion?'
      },
      {
        device: 'Enjambment Refusal',
        example: '"And I cannot, cannot go." / "And yet I cannot go." / "I will not, cannot go."',
        explanation: 'Every stanza ends with a full stop on "go." There is no overflow, no continuation. The form itself refuses to move forward, enacting the speaker\'s paralysis.'
      }
    ],
    historicalContext: `Written in 1837 when Bronte was just nineteen, this poem is often associated with the Gondal saga — the elaborate fictional world Emily and her sister Anne created and maintained throughout their lives. Many of Bronte's poems were written as dramatic utterances by Gondal characters, and this poem may be voiced by one of them. However, the psychological intensity transcends any fictional frame. Bronte spent most of her short life at the Haworth parsonage on the Yorkshire moors, and the landscape of wind, snow, and exposed heights was her daily reality. She died of tuberculosis at thirty, having published Wuthering Heights just a year before. The poem's mixture of terror and defiance anticipates Heathcliff and Catherine's relationship with the moors — landscape as both prison and liberation.`
  },
  seoDescription: 'Analysis of Emily Bronte\'s "The Night Is Darkening Round Me." Line-by-line commentary on this short, fierce poem about paralysis, defiance, and the mysterious spell that holds the speaker immobile against a gathering storm.',
  abstractWords: ['spell', 'drear', 'tyrant', 'wastes', 'storm'],
  rhymingPairs: [
    { word1: 'me', word2: 'go' },
    { word1: 'blow', word2: 'snow' },
    { word1: 'bending', word2: 'descending' },
    { word1: 'bound', word2: 'round' }
  ]
};
