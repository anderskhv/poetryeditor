import { PoemAnalysis } from './index';

export const odeToNightingale: PoemAnalysis = {
  slug: 'keats-ode-nightingale',
  title: 'Ode to a Nightingale',
  poet: 'John Keats',
  poetBirth: 1795,
  poetDeath: 1821,
  year: 1819,
  collection: 'Lamia, Isabella, The Eve of St. Agnes, and Other Poems',
  form: 'Ode',
  text: `  My heart aches, and a drowsy numbness pains
    My sense, as though of hemlock I had drunk,
  Or emptied some dull opiate to the drains
    One minute past, and Lethe-wards had sunk:
  'Tis not through envy of thy happy lot,
    But being too happy in thine happiness,--
      That thou, light-winged Dryad of the trees,
          In some melodious plot
    Of beechen green, and shadows numberless,
      Singest of summer in full-throated ease.                 10

  2.

  O, for a draught of vintage! that hath been
    Cool'd a long age in the deep-delved earth,
  Tasting of Flora and the country green,
    Dance, and Provençal song, and sunburnt mirth!
  O for a beaker full of the warm South,
    Full of the true, the blushful Hippocrene,
      With beaded bubbles winking at the brim,
          And purple-stained mouth;
    That I might drink, and leave the world unseen,
      And with thee fade away into the forest dim:             20

  3.

  Fade far away, dissolve, and quite forget
    What thou among the leaves hast never known,
  The weariness, the fever, and the fret
    Here, where men sit and hear each other groan;
  Where palsy shakes a few, sad, last gray hairs,
    Where youth grows pale, and spectre-thin, and dies;
      Where but to think is to be full of sorrow
          And leaden-eyed despairs,
    Where Beauty cannot keep her lustrous eyes,
      Or new Love pine at them beyond to-morrow.               30

  4.

  Away! away! for I will fly to thee,
    Not charioted by Bacchus and his pards,
  But on the viewless wings of Poesy,
    Though the dull brain perplexes and retards:
  Already with thee! tender is the night,
    And haply the Queen-Moon is on her throne,
      Cluster'd around by all her starry Fays;
          But here there is no light,
    Save what from heaven is with the breezes blown
      Through verdurous glooms and winding mossy ways.         40

  5.

  I cannot see what flowers are at my feet,
    Nor what soft incense hangs upon the boughs,
  But, in embalmed darkness, guess each sweet
    Wherewith the seasonable month endows
  The grass, the thicket, and the fruit-tree wild;
    White hawthorn, and the pastoral eglantine;
      Fast fading violets cover'd up in leaves;
          And mid-May's eldest child,
    The coming musk-rose, full of dewy wine,
      The murmurous haunt of flies on summer eves.             50

  6.

  Darkling I listen; and, for many a time
    I have been half in love with easeful Death,
  Call'd him soft names in many a mused rhyme,
    To take into the air my quiet breath;
  Now more than ever seems it rich to die,
    To cease upon the midnight with no pain,
      While thou art pouring forth thy soul abroad
          In such an ecstasy!
    Still wouldst thou sing, and I have ears in vain--
      To thy high requiem become a sod.                        60

  7.

  Thou wast not born for death, immortal Bird!
    No hungry generations tread thee down;
  The voice I hear this passing night was heard
    In ancient days by emperor and clown:
  Perhaps the self-same song that found a path
    Through the sad heart of Ruth, when, sick for home,
      She stood in tears amid the alien corn;
          The same that oft-times hath
    Charm'd magic casements, opening on the foam
      Of perilous seas, in faery lands forlorn.                70

  8.

  Forlorn! the very word is like a bell
    To toll me back from thee to my sole self!
  Adieu! the fancy cannot cheat so well
    As she is fam'd to do, deceiving elf.
  Adieu! adieu! thy plaintive anthem fades
    Past the near meadows, over the still stream,
      Up the hill-side; and now 'tis buried deep
          In the next valley-glades:
    Was it a vision, or a waking dream?
      Fled is that music:--Do I wake or sleep?                 80`,
  analysis: {
    overview: `"Ode to a Nightingale" is about the impossible desire to escape human consciousness. Keats hears a bird singing and wants to dissolve into its world of pure sensation, free from the awareness of suffering, aging, and death that defines human life. The poem tracks his attempt to get there -- first through wine, then through poetry -- and his forced return when he realizes that even imagination cannot sustain the fantasy. The nightingale's song is beautiful precisely because the bird does not know it will die. Keats does know, and that knowledge is the poem's engine.

What makes this ode devastating rather than merely wistful is the autobiographical pressure behind it. Keats had nursed his brother Tom through tuberculosis and watched him die just months before writing this poem. He was already showing symptoms himself. When he writes "Where youth grows pale, and spectre-thin, and dies," he is describing what he saw and what he suspected awaited him. The poem is not an abstraction about mortality -- it is a man who knows he is dying trying to imagine what it would feel like not to know.

The structural arc matters: the poem moves from numbness (stanza 1) through longing for escape (2-3), a brief ecstatic union with the nightingale via poetry (4-5), a flirtation with death as the ultimate escape (6), the recognition that the bird is immortal in a way humans cannot be (7), and finally the collapse back into the self (8). The word "forlorn" bridges stanzas 7 and 8, tolling like a bell that breaks the spell. The final question -- "Do I wake or sleep?" -- is not rhetorical. Keats genuinely does not know whether the imaginative experience was more real than ordinary consciousness.`,
    lineByLine: [
      {
        lines: '1-10',
        commentary: `The opening is a paradox: "a drowsy numbness pains / My sense." Numbness should not hurt, but this one does -- it is the pain of too much empathy, not too little feeling. Keats insists he is not envious of the bird but "too happy in thine happiness." The nightingale is introduced as a "light-winged Dryad of the trees" -- a nature spirit, not just a bird. It sings "of summer in full-throated ease," and that ease is exactly what Keats lacks. The references to hemlock and Lethe (the river of forgetfulness) establish the poem's central desire: to forget, to become unconscious, to stop knowing what he knows.`
      },
      {
        lines: '11-20',
        commentary: `Stanza 2 is the wine fantasy. Keats wants a "draught of vintage" that has been aging underground -- cool, earthy, connected to the land. The wine evokes warmth, dance, Provencal song -- the sensual pleasures of southern Europe. "The true, the blushful Hippocrene" refers to the fountain of the Muses on Mount Helicon, so this wine is simultaneously intoxicant and poetic inspiration. "Beaded bubbles winking at the brim" is one of the most precise sensory descriptions in English poetry -- you can see the champagne. The goal: "leave the world unseen, / And with thee fade away into the forest dim." He wants to disappear.`
      },
      {
        lines: '21-30',
        commentary: `Stanza 3 catalogs what he wants to escape. The litany is devastating: "The weariness, the fever, and the fret" of human life, palsy, youth dying young, sorrow, despair, fading beauty, love that cannot last. "Where youth grows pale, and spectre-thin, and dies" is almost certainly about his brother Tom, dead of tuberculosis at nineteen. "Where but to think is to be full of sorrow" -- consciousness itself is the problem. The nightingale has "never known" these things. The bird's ignorance is its paradise.`
      },
      {
        lines: '31-40',
        commentary: `The turn: Keats rejects wine ("Not charioted by Bacchus and his pards") and chooses poetry instead -- "the viewless wings of Poesy." The transition is almost instantaneous: "Already with thee! tender is the night." This line gave F. Scott Fitzgerald his novel title. The darkness becomes rich rather than frightening. The Queen-Moon on her throne with "starry Fays" creates a fairy-court atmosphere. But "here there is no light" -- he is in darkness, guided only by breezes and the faint glow filtering through "verdurous glooms and winding mossy ways." Poetry has transported him, but into blindness.`
      },
      {
        lines: '41-50',
        commentary: `Stanza 5 is the sensory peak -- Keats cannot see, so he smells and guesses. "In embalmed darkness" -- the word "embalmed" carries death inside a description of lush life. He catalogs flowers: white hawthorn, eglantine, "fast fading violets," the "coming musk-rose, full of dewy wine." Each flower is at a different stage of blooming and dying. "The murmurous haunt of flies on summer eves" is the poem's most perfect sound-picture: you hear the buzzing. This stanza demonstrates that the richest sensory experience comes when you surrender one sense and heighten the others.`
      },
      {
        lines: '51-60',
        commentary: `The death stanza. "Darkling I listen" -- in the dark, listening -- and confesses he has been "half in love with easeful Death." He has "Call'd him soft names in many a mused rhyme." Death is personified as a gentle lover, not a terror. "Now more than ever seems it rich to die, / To cease upon the midnight with no pain" -- dying while the nightingale sings would be the ultimate merger of beauty and oblivion. But the logic collapses: if he dies, "I have ears in vain -- / To thy high requiem become a sod." Dead, he would be dirt. He cannot enjoy the escape he craves because enjoyment requires the consciousness he wants to escape.`
      },
      {
        lines: '61-70',
        commentary: `The great reversal. "Thou wast not born for death, immortal Bird!" -- the nightingale transcends individual mortality because its song has been heard across all of human history. Emperor and clown alike have heard it. The biblical Ruth, homesick among alien corn, heard it. The image of "magic casements, opening on the foam / Of perilous seas, in faery lands forlorn" is one of the most celebrated passages in English Romantic poetry -- windows opening onto dangerous, enchanted unknowns. The bird's song connects all human loneliness across time. But the word "forlorn" at stanza's end will snap the spell.`
      },
      {
        lines: '71-80',
        commentary: `"Forlorn! the very word is like a bell / To toll me back from thee to my sole self!" The word that described fairyland now describes Keats himself, and the double meaning destroys the fantasy. "The fancy cannot cheat so well / As she is fam'd to do" -- imagination's reputation exceeds its actual power. The nightingale's song fades geographically: "Past the near meadows, over the still stream, / Up the hill-side" -- each phrase moves it further away. The final question, "Was it a vision, or a waking dream? / Fled is that music:--Do I wake or sleep?" leaves everything unresolved. The poem refuses to tell us whether the experience was real or imagined, and that refusal is the point.`
      }
    ],
    themes: [
      'The desire to escape human consciousness and its burdens',
      'Mortality versus the immortality of art and nature',
      'The limits of imagination as a means of transcendence',
      'Sensory experience as both ecstasy and reminder of death',
      'The paradox of beauty intensified by its transience',
      'Empathy as a source of suffering',
      'The impossibility of sustained visionary experience'
    ],
    literaryDevices: [
      {
        device: 'Synesthesia',
        example: '"Tasting of Flora and the country green"',
        explanation: 'Tasting a color and a goddess -- Keats fuses senses throughout the poem, most notably in the dark garden stanza where he smells what he cannot see. This blending mirrors his desire to dissolve the boundaries of selfhood.'
      },
      {
        device: 'Oxymoron',
        example: '"a drowsy numbness pains"',
        explanation: 'Numbness should not cause pain, but Keats\'s empathetic overload produces exactly this contradiction. The opening oxymoron sets the poem\'s emotional logic: every pleasure here contains its opposite.'
      },
      {
        device: 'Allusion',
        example: '"Through the sad heart of Ruth, when, sick for home, / She stood in tears amid the alien corn"',
        explanation: 'The biblical Ruth (Book of Ruth) who left her homeland to follow Naomi. Keats uses her to show that the nightingale\'s song has accompanied human displacement and loneliness across millennia.'
      },
      {
        device: 'Personification',
        example: '"I have been half in love with easeful Death, / Call\'d him soft names in many a mused rhyme"',
        explanation: 'Death becomes a gentle suitor whom the poet has courted in verse. This transforms mortality from an abstract threat into an intimate relationship, making the flirtation with dying feel seductive rather than morbid.'
      },
      {
        device: 'Structural Pivot',
        example: '"Forlorn! the very word is like a bell / To toll me back from thee to my sole self!"',
        explanation: 'The word "forlorn" ends stanza 7 describing faery lands and opens stanza 8 describing Keats himself. This single word bridges fantasy and reality, and its repetition is the mechanism that collapses the visionary experience.'
      },
      {
        device: 'Imagery of Dissolution',
        example: '"Fade far away, dissolve, and quite forget"',
        explanation: 'Keats uses verbs of disappearance throughout -- fade, dissolve, forget, leave unseen. The poem enacts the desire to unmake the self, but the very precision of the language keeps reasserting the poet\'s conscious artistry.'
      }
    ],
    historicalContext: `Written in May 1819, during Keats's annus mirabilis -- the year he produced nearly all his greatest work. He composed it in a single morning in the garden of his friend Charles Brown's house in Hampstead, reportedly after hearing a nightingale nesting nearby. His brother Tom had died of tuberculosis in December 1818, and Keats himself was likely already infected, though he would not be formally diagnosed until early 1820. He was also deeply in love with Fanny Brawne, a relationship shadowed by his poverty and declining health. The poem appeared in the July 1819 issue of Annals of the Fine Arts and was later collected in the 1820 volume that would be his last published work. Keats died in Rome on February 23, 1821, at the age of twenty-five.`,
  },
  seoDescription: 'Analysis of Keats\'s "Ode to a Nightingale" with line-by-line commentary exploring mortality, imagination, and the impossible desire to escape human consciousness through beauty.',
  abstractWords: ['mortality', 'ecstasy', 'oblivion', 'immortality', 'consciousness'],
  rhymingPairs: [
    { word1: 'pains', word2: 'drains' },
    { word1: 'trees', word2: 'ease' },
    { word1: 'die', word2: 'ecstasy' },
    { word1: 'bell', word2: 'self' },
    { word1: 'forlorn', word2: 'corn' }
  ],
};
