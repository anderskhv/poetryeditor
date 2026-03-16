// Reading Paths — curated journeys through the poem library
// Each path teaches a specific craft concept through 5-8 poems with guidance and exercises

export interface ReadingPathStep {
  poemSlug: string;         // Links to poems[slug] in poems/index.ts
  noticeThis: string;       // Specific craft element to observe in this poem
  exercise?: string;        // Optional writing exercise after reading
}

export interface ReadingPath {
  slug: string;
  title: string;
  subtitle: string;
  description: string;      // 2-3 sentences for the path overview
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number; // Rough time to complete
  steps: ReadingPathStep[];
  seoDescription: string;
}

export const readingPaths: ReadingPath[] = [
  {
    slug: 'learning-sound',
    title: 'Learning Sound',
    subtitle: 'How poems make music without melody',
    description: 'Poetry is sound before it is meaning. This path walks you through the sonic toolkit — from the blunt force of alliteration to the hidden hum of assonance and the surprise of internal rhyme. By the end, you\'ll hear poems differently.',
    difficulty: 'beginner',
    estimatedMinutes: 45,
    steps: [
      {
        poemSlug: 'the-tyger',
        noticeThis: 'Read this aloud. Notice how the hard "t" and "b" sounds in "Tyger Tyger, burning bright" create a hammering rhythm — that\'s alliteration working as percussion.',
        exercise: 'Write four lines describing an animal. Use the same consonant sound at the start of at least two words per line.'
      },
      {
        poemSlug: 'the-lake-isle-of-innisfree',
        noticeThis: 'Listen for the long vowel sounds: "I will arise and go now, and go to Innisfree." The repeated "o" and "ee" sounds create a dreamy, yearning quality. This is assonance.',
        exercise: 'Describe a place you miss using at least three words with the same vowel sound in each line.'
      },
      {
        poemSlug: 'annabel-lee',
        noticeThis: 'Poe weaves rhyme throughout, not just at line endings. "kingdom by the sea" echoes through the poem like a refrain. Notice how internal rhymes ("chilling and killing") bind the lines together.',
        exercise: 'Write a six-line poem where at least two lines have a rhyme inside the line, not just at the end.'
      },
      {
        poemSlug: 'god-speaks',
        noticeThis: 'Rilke uses consonance — repeated consonant sounds within words — to create texture. The German-inflected English has a gravity that comes from how the sounds land.',
      },
      {
        poemSlug: 'fire-and-ice',
        noticeThis: 'In just nine lines, Frost uses the "s" sound (some, say, suffice) to create a hissing, quiet menace. The sonic choice reinforces the theme: destruction whispers.',
        exercise: 'Write a short poem (6-10 lines) about something dangerous, using soft sounds (s, sh, wh) to make it feel quiet rather than loud.'
      },
      {
        poemSlug: 'the-chimney-sweeper',
        noticeThis: 'Blake uses simple, nursery-rhyme sounds ("weep weep weep") to devastating effect. The innocence of the sound clashes with the horror of the content. Sound can work against meaning.',
      },
      {
        poemSlug: 'pied-beauty',
        noticeThis: 'Hopkins packs more sonic density into 10 lines than most poets manage in 100. "Glory be to God for dappled things" — count the consonant clusters. Every syllable is chosen for its sound.',
        exercise: 'Write a 5-line praise poem for something ordinary. Pack each line with as much sonic texture as you can — alliteration, assonance, consonance. Then read it aloud.'
      }
    ],
    seoDescription: 'Learn how poems create music through sound — alliteration, assonance, internal rhyme, and consonance. A guided reading path through 7 classic poems with writing exercises.'
  },
  {
    slug: 'the-image',
    title: 'The Image',
    subtitle: 'Show, don\'t tell — and when to break that rule',
    description: 'The image is poetry\'s primary unit of power. A single concrete detail can carry more emotional weight than a paragraph of abstraction. This path teaches you to see how great poets build images — and when they deliberately leave the image behind.',
    difficulty: 'beginner',
    estimatedMinutes: 40,
    steps: [
      {
        poemSlug: 'fog',
        noticeThis: 'Six lines. One image. Sandburg compares fog to a cat — and that\'s the entire poem. Notice what he doesn\'t do: he doesn\'t explain the metaphor, moralize, or add commentary. The image IS the poem.',
        exercise: 'Write a poem of 6 lines or fewer that IS a single image. No explanation. No "I think" or "I feel." Just the thing itself.'
      },
      {
        poemSlug: 'noiseless-spider',
        noticeThis: 'Whitman builds the spider image with precise physical detail: "filament, filament, filament." Then he pivots — the spider becomes a metaphor for the soul. Notice the moment where concrete becomes abstract.',
        exercise: 'Observe something small (an insect, a leaf, a crack in the wall). Describe it in exact physical detail for 4 lines, then let it become a metaphor for something larger in 4 more lines.'
      },
      {
        poemSlug: 'to-autumn',
        noticeThis: 'Keats doesn\'t just describe autumn — he builds it through accumulated sensory details across three stanzas: sight, sound, touch, taste, smell. Each stanza shifts the time of day and the quality of light.',
      },
      {
        poemSlug: 'the-sick-rose',
        noticeThis: 'Blake\'s rose and worm are images that refuse to settle into one meaning. Is it about love? Disease? Innocence? The image is powerful precisely because it remains an image, not an allegory with a key.',
        exercise: 'Write an 8-line poem using a natural image (flower, storm, river) that suggests a human situation without ever naming it directly.'
      },
      {
        poemSlug: 'london',
        noticeThis: 'Blake layers images of a city walk into an indictment of society. Each stanza adds a new sensory layer: sounds ("cry," "ban"), sights ("marks of weakness"), metaphors ("mind-forg\'d manacles"). The images accumulate into argument.',
      },
      {
        poemSlug: 'the-road-not-taken',
        noticeThis: 'The image of two roads diverging is so vivid that most readers take it literally. But notice the final stanza: "I shall be telling this with a sigh." Frost is showing us how we turn images into stories — and how those stories might be false.',
        exercise: 'Describe an ordinary choice (what to eat, which route to walk) as if it were momentous. Use concrete, specific imagery. In the last two lines, undercut the seriousness.'
      }
    ],
    seoDescription: 'Master the art of poetic imagery — concrete detail, metaphor, and showing vs telling. A guided reading path through 6 classic poems with writing exercises.'
  },
  {
    slug: 'breaking-lines',
    title: 'Breaking Lines',
    subtitle: 'The line break is poetry\'s secret weapon',
    description: 'In prose, the line ends when the margin runs out. In poetry, every line break is a choice. This path shows you how poets use line breaks to create suspense, surprise, double meanings, and emphasis — and how enjambment turns the line into an instrument.',
    difficulty: 'intermediate',
    estimatedMinutes: 40,
    steps: [
      {
        poemSlug: 'stopping-by-woods',
        noticeThis: 'Frost\'s lines are end-stopped — each one is a complete thought. This creates a measured, calm pace that mirrors the speaker watching snow fall. The regularity IS the mood.',
        exercise: 'Write 8 lines where every line is a complete clause or sentence. No enjambment. Notice how the rhythm feels — controlled, deliberate, measured.'
      },
      {
        poemSlug: 'ozymandias',
        noticeThis: 'Shelley enjambs aggressively: "Two vast and trunkless legs of stone / Stand in the desert." The sentence spills across lines, pulling you forward. The energy of the enjambment creates urgency in a poem about ruins.',
      },
      {
        poemSlug: 'westminster-bridge',
        noticeThis: 'Wordsworth writes a sonnet — 14 lines — but the syntax runs across the line breaks like water. "This City now doth, like a garment, wear / The beauty of the morning." The line break between "wear" and "The beauty" creates a tiny pause of expectation.',
        exercise: 'Take a prose sentence of 20+ words. Break it into 4 lines of poetry, choosing where each break falls. Try three different versions and notice how the meaning shifts.'
      },
      {
        poemSlug: 'when-i-have-fears',
        noticeThis: 'Keats opens with a massive enjambed sentence that doesn\'t resolve until line 12 of a 14-line sonnet. The delay creates anxiety — you feel the weight of "when... when... when..." piling up before the resolution.',
      },
      {
        poemSlug: 'i-hear-america-singing',
        noticeThis: 'Whitman\'s long lines have their own internal caesuras — natural pauses created by commas and syntax within the line. The line IS the breath. Each singer gets their own line, their own breath.',
        exercise: 'Write a poem of 5 long lines (15+ words each). Each line should be one complete thought with at least one internal pause (a comma, a dash). Read it aloud and breathe at each line break.'
      },
      {
        poemSlug: 'first-fig',
        noticeThis: 'Four lines. Millay\'s enjambment between "My candle burns at both ends; / It will not last the night" uses the line break to isolate the defiance. The semicolon creates a caesura, but the enjambment pushes forward. Short poems make every break visible.',
      },
      {
        poemSlug: 'dreams',
        noticeThis: 'Hughes uses short, direct lines with strong end-stops: "Hold fast to dreams / For if dreams die / Life is a broken-winged bird / That cannot fly." The simplicity of the line breaks makes each statement feel like a proverb.',
        exercise: 'Write a poem of advice in 8 short lines (3-6 words each). Make every line end-stopped. Aim for the feeling of carved stone — each line complete in itself.'
      }
    ],
    seoDescription: 'Learn how line breaks shape meaning in poetry — enjambment, end-stopping, caesura, and breath. A guided reading path through 7 classic poems with writing exercises.'
  },
  {
    slug: 'finding-form',
    title: 'Finding Form',
    subtitle: 'From sonnets to free verse — choosing your container',
    description: 'Form is not a prison — it\'s a partner. The sonnet\'s 14 lines create pressure. Free verse demands that you invent your own structure. This path introduces you to the major forms through the poems that define them, so you can choose the right container for your own work.',
    difficulty: 'intermediate',
    estimatedMinutes: 50,
    steps: [
      {
        poemSlug: 'sonnet-18',
        noticeThis: 'The Shakespearean sonnet: three quatrains building an argument, then a couplet that flips it. Notice how "But thy eternal summer shall not fade" at line 9 (the volta) changes direction. The form creates the turn.',
        exercise: 'Write just the final couplet of a sonnet — two rhyming lines that reverse or complicate everything that came before. (You don\'t need the other 12 lines yet.)'
      },
      {
        poemSlug: 'sonnet-43',
        noticeThis: 'The Petrarchan sonnet: 8 lines (octave) set up a situation, 6 lines (sestet) respond. Browning\'s "How do I love thee?" counts the ways in the octave, then deepens into faith and eternity in the sestet. Different form, different logic.',
      },
      {
        poemSlug: 'november-night',
        noticeThis: 'Adelaide Crapsey invented the cinquain: 2-4-6-8-2 syllables across 5 lines. The form creates a swell and sudden stop — like a wave. Notice how "November Night" uses this shape to capture a single image dissolving.',
        exercise: 'Write a cinquain (2-4-6-8-2 syllables). Choose a single moment — something fleeting — and let the form\'s expansion and contraction mirror the experience.'
      },
      {
        poemSlug: 'invictus',
        noticeThis: 'Four quatrains in iambic tetrameter with alternating rhyme (ABAB). The relentless regularity of the form mirrors the speaker\'s refusal to bend. Form as defiance.',
      },
      {
        poemSlug: 'o-captain',
        noticeThis: 'Whitman — the father of American free verse — writes in a modified ballad form here. The refrain ("O Captain! my Captain!") and regular stanzas show that even free verse poets reach for form when the emotion demands it.',
        exercise: 'Write 8 lines of free verse about a strong emotion. Then rewrite the same content as a formal quatrain with rhyme. Which version is more honest? Which is more powerful? They might be different poems.'
      },
      {
        poemSlug: 'the-second-coming',
        noticeThis: 'Yeats uses loose blank verse (unrhymed iambic pentameter) that breaks its own rules as the poem\'s vision intensifies. The form starts controlled and disintegrates — "Things fall apart" applies to the poem\'s own structure.',
      },
      {
        poemSlug: 'we-wear-the-mask',
        noticeThis: 'Dunbar writes a rondeau — a French form with a repeated refrain. "We wear the mask" returns again and again, but each time the context has changed. The repetition of form becomes the repetition of masking.',
        exercise: 'Choose a phrase of 4-6 words that captures something you return to again and again. Write a 10-line poem where that phrase appears three times: at the start, the middle, and the end. Notice how its meaning shifts.'
      }
    ],
    seoDescription: 'Explore major poetic forms — sonnet, cinquain, ballad, free verse, and rondeau. A guided reading path through 7 classic poems with writing exercises.'
  },
  {
    slug: 'finding-your-voice',
    title: 'Finding Your Voice',
    subtitle: 'From imitation to identity',
    description: 'Every poet starts by sounding like someone else. This path guides you through conscious imitation — the fastest way to discover what you are and aren\'t. You\'ll read poets with unmistakable voices, try writing in their style, and notice where your own instincts push back.',
    difficulty: 'advanced',
    estimatedMinutes: 60,
    steps: [
      {
        poemSlug: 'hope-is-the-thing-with-feathers',
        noticeThis: 'Dickinson\'s voice: short lines, dashes instead of punctuation, oblique metaphors, hymn meter. She turns abstractions into physical things. "Hope" becomes a bird — but she never says "bird."',
        exercise: 'Pick an abstract concept (grief, time, ambition). Write 8 lines in Dickinson\'s style: short lines, dashes, common meter (8-6-8-6 syllables), and turn the abstraction into a physical thing without naming it.'
      },
      {
        poemSlug: 'i-hear-america-singing',
        noticeThis: 'Whitman\'s voice: long lines, catalogues, first-person expansiveness, no regular meter. He includes everything. Each line is a breath, each breath holds a world.',
        exercise: 'Write a Whitman-style catalogue poem: "I hear [your city/school/family] singing." List 6-8 people and what they\'re doing. Use long lines. Be generous and specific.'
      },
      {
        poemSlug: 'the-road-not-taken',
        noticeThis: 'Frost\'s voice: conversational, regular meter that sounds like natural speech, rural imagery, and a final turn that\'s more ambiguous than it seems. He sounds simple but isn\'t.',
        exercise: 'Write 8 lines about a walk you took. Use Frost\'s trick: iambic tetrameter that sounds like talking. Include one natural image. In the last two lines, shift the meaning slightly.'
      },
      {
        poemSlug: 'the-negro-speaks-of-rivers',
        noticeThis: 'Hughes\'s voice: biblical cadence, racial pride, historical sweep in simple language. "I\'ve known rivers ancient as the world and older than the flow of human blood in human veins." Grand claims in plain words.',
        exercise: 'Write a poem that begins "I\'ve known..." and connects your personal experience to something much larger — history, nature, your ancestry. Use simple, direct language.'
      },
      {
        poemSlug: 'she-walks-in-beauty',
        noticeThis: 'Byron\'s voice: polished, musical, aristocratic. Every syllable is placed. The elegance is the content — the poem performs the beauty it describes.',
      },
      {
        poemSlug: 'dover-beach',
        noticeThis: 'Arnold\'s voice: meditative, intellectual, moving from observation to philosophy. He starts with a landscape and ends with a worldview. The poem thinks out loud.',
        exercise: 'Now write a poem in YOUR voice. Not Dickinson\'s, not Whitman\'s, not anyone else\'s. Write about something you saw today. Notice which poet\'s habits you fall into — and which instincts are yours alone.'
      }
    ],
    seoDescription: 'Develop your unique poetic voice through guided imitation of Dickinson, Whitman, Frost, Hughes, Byron, and Arnold. A reading path with writing exercises for each poet\'s style.'
  },
  {
    slug: 'reading-like-a-writer',
    title: 'Reading Like a Writer',
    subtitle: 'What to notice when you read a poem',
    description: 'Most people read poems for meaning. Writers read for craft. This path teaches you to notice the decisions behind the words — why this word and not that one, why this line breaks here, what the rhythm is doing. Once you learn to read this way, every poem becomes a lesson.',
    difficulty: 'beginner',
    estimatedMinutes: 35,
    steps: [
      {
        poemSlug: 'nothing-gold-can-stay',
        noticeThis: 'Start with this: what is the poem about? Now look again. How many syllables per line? (They\'re almost all 6.) How many stresses? (3.) Frost chose this tight form to match the idea of something precious and brief. The form IS the meaning.',
        exercise: 'Read the poem three times: once for meaning, once counting syllables, once listening to the sounds. Write one sentence about what you noticed each time.'
      },
      {
        poemSlug: 'a-red-red-rose',
        noticeThis: 'Why "red, red" instead of just "red"? The repetition isn\'t accidental — it creates emphasis and mimics the rhythm of a folk song. Notice every word that could have been different and ask: why this one?',
      },
      {
        poemSlug: 'daffodils',
        noticeThis: 'Look at Wordsworth\'s verbs: "wandered," "floats," "saw," "fluttering," "dancing," "tossing." The poem\'s energy is in its verbs. When you read like a writer, you read the verbs first.',
        exercise: 'Pick any poem in the library. List every verb. Do they share a quality (all active? all gentle? all violent?)? Write a paragraph about what the verbs reveal about the poem\'s emotional world.'
      },
      {
        poemSlug: 'ozymandias',
        noticeThis: 'Notice the distance Shelley creates: a traveller told me → the sculptor read the passions → Ozymandias spoke. The meaning is filtered through three layers. Ask: who is speaking, and how far are we from the original voice?',
      },
      {
        poemSlug: 'bright-star',
        noticeThis: 'Keats opens with what he wants ("Bright star, would I were stedfast as thou art") then immediately says what he doesn\'t want (the star\'s loneliness). The poem\'s structure is desire → qualification → deeper desire. Notice the architecture of feeling.',
        exercise: 'Take "Bright Star" and write a one-paragraph analysis covering: form (what kind of poem?), one sound device, one image, and the poem\'s emotional arc (where does it start vs. where does it end?).'
      },
      {
        poemSlug: 'i-felt-a-funeral',
        noticeThis: 'Dickinson makes you feel the funeral through sound: "treading — treading," "beating — beating." She\'s not describing a funeral — she\'s recreating one in your body through rhythm and repetition. The best poems don\'t describe experience; they create it.',
        exercise: 'Choose any poem from the library that moved you. Write 5 sentences: (1) What is the poem about? (2) What is the first image? (3) Where does the poem turn or shift? (4) What is the most surprising word? (5) What craft technique makes this poem work?'
      }
    ],
    seoDescription: 'Learn to read poetry like a writer — noticing craft decisions, form, verb choice, sound, and structure. A beginner\'s reading path through 6 classic poems with analytical exercises.'
  }
];

export function getReadingPathBySlug(slug: string): ReadingPath | undefined {
  return readingPaths.find(p => p.slug === slug);
}

export function getAllReadingPaths(): ReadingPath[] {
  return readingPaths;
}
