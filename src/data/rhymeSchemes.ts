// Rhyme scheme data for /rhyme-scheme/:scheme pages

export interface RhymeSchemeExample {
  lines: string[];
  labels: string[];
  attribution: string;
  poemSlug?: string; // Link to /poems/:slug if we have it
}

export interface RhymeScheme {
  id: string;
  name: string;
  pattern: string;
  alternateNames?: string[];
  description: string;
  explanation: string;
  example: RhymeSchemeExample;
  famousPoems: Array<{
    title: string;
    poet: string;
    slug?: string; // Link to /poems/:slug if we have it
  }>;
  writingTips: string[];
  relatedSchemes: string[]; // IDs of related schemes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  commonForms: string[]; // e.g., "ballad", "sonnet"
}

export const rhymeSchemes: Record<string, RhymeScheme> = {
  'aabb': {
    id: 'aabb',
    name: 'Couplet Rhyme (AABB)',
    pattern: 'AABB',
    alternateNames: ['Couplets', 'Heroic Couplets', 'Rhyming Couplets'],
    description: 'Each pair of consecutive lines rhymes together. Simple, punchy, and satisfying.',
    explanation: `The AABB rhyme scheme pairs lines together: line 1 rhymes with line 2, line 3 rhymes with line 4, and so on. This creates a sense of completion every two lines, giving the poem a rhythmic, almost musical quality.

Couplets work particularly well for witty, epigrammatic poetry because each rhyme delivers a small payoff. Alexander Pope mastered this form in the 18th century, using "heroic couplets" (iambic pentameter couplets) for satirical effect.

The danger of AABB is that it can feel sing-songy or predictable. The best couplet poetry varies its syntax, running sentences across the rhyme to avoid monotony.`,
    example: {
      lines: [
        'Tyger Tyger, burning bright,',
        'In the forests of the night;',
        'What immortal hand or eye,',
        'Could frame thy fearful symmetry?'
      ],
      labels: ['A', 'A', 'B', 'B'],
      attribution: 'William Blake, "The Tyger"',
      poemSlug: 'the-tyger'
    },
    famousPoems: [
      { title: 'The Tyger', poet: 'William Blake', slug: 'the-tyger' },
      { title: 'The Lamb', poet: 'William Blake', slug: 'the-lamb' },
      { title: 'The Rape of the Lock', poet: 'Alexander Pope' },
      { title: 'An Essay on Criticism', poet: 'Alexander Pope' },
      { title: 'To His Coy Mistress', poet: 'Andrew Marvell' }
    ],
    writingTips: [
      'Vary your sentence structure to avoid a sing-song effect. Let sentences run across the rhyme.',
      'Use enjambment (continuing a sentence past the line break) to create tension before the rhyme arrives.',
      'Choose strong rhymes that feel inevitable, not forced. Weak rhymes stand out more in couplets.',
      'Consider end-stopping one line and enjambing the next for rhythmic variety.',
      'Couplets excel at wit and wordplay. Use the form for epigrams, satire, or memorable statements.'
    ],
    relatedSchemes: ['abab', 'abba', 'free-verse'],
    difficulty: 'beginner',
    commonForms: ['Heroic couplets', 'Elegiac couplets', 'Nursery rhymes', 'Epigrams']
  },

  'abab': {
    id: 'abab',
    name: 'Alternate Rhyme (ABAB)',
    pattern: 'ABAB',
    alternateNames: ['Cross Rhyme', 'Interlocking Rhyme', 'Quatrain Rhyme'],
    description: 'Lines rhyme in an alternating pattern: 1st with 3rd, 2nd with 4th. Creates anticipation and payoff.',
    explanation: `The ABAB scheme alternates rhymes: line 1 rhymes with line 3, and line 2 rhymes with line 4. This creates a longer arc than couplets, building anticipation before delivering the rhyme two lines later.

This scheme is the backbone of the English quatrain and appears in countless ballads, hymns, and folk songs. It feels natural in English because it mirrors the rhythm of everyday speech and song.

The gap between rhyming lines allows for more complex thoughts than couplets. You can develop an idea across lines 1-2, then resolve or complicate it in lines 3-4. Shakespearean sonnets use three ABAB quatrains before a final couplet.`,
    example: {
      lines: [
        'Shall I compare thee to a summer\'s day?',
        'Thou art more lovely and more temperate:',
        'Rough winds do shake the darling buds of May,',
        'And summer\'s lease hath all too short a date.'
      ],
      labels: ['A', 'B', 'A', 'B'],
      attribution: 'William Shakespeare, Sonnet 18',
      poemSlug: 'sonnet-18'
    },
    famousPoems: [
      { title: 'Sonnet 18', poet: 'William Shakespeare', slug: 'sonnet-18' },
      { title: 'Sonnet 116', poet: 'William Shakespeare', slug: 'sonnet-116' },
      { title: 'The Road Not Taken', poet: 'Robert Frost', slug: 'the-road-not-taken' },
      { title: 'I Wandered Lonely as a Cloud', poet: 'William Wordsworth', slug: 'daffodils' },
      { title: 'Stopping by Woods on a Snowy Evening', poet: 'Robert Frost', slug: 'stopping-by-woods' }
    ],
    writingTips: [
      'Think of each quatrain as a complete unit with setup (lines 1-2) and resolution (lines 3-4).',
      'The gap between rhyming lines lets you develop more complex thoughts. Use it.',
      'Strong B rhymes matter more than A rhymes because they close the quatrain.',
      'Vary the weight of your line endings. Not every rhyme needs to be a hard stop.',
      'This scheme works well for narrative poetry because it maintains momentum while providing structure.'
    ],
    relatedSchemes: ['aabb', 'abba', 'shakespearean-sonnet', 'abcabc'],
    difficulty: 'beginner',
    commonForms: ['Ballad stanza', 'Shakespearean sonnet quatrains', 'Hymn meter', 'Folk songs']
  },

  'abba': {
    id: 'abba',
    name: 'Enclosed Rhyme (ABBA)',
    pattern: 'ABBA',
    alternateNames: ['Envelope Rhyme', 'Chiasmic Rhyme', 'Mirror Rhyme'],
    description: 'The first and fourth lines rhyme, enclosing a rhyming couplet in the middle. Creates a sense of return.',
    explanation: `In ABBA, the outer lines (1 and 4) rhyme, while the inner lines (2 and 3) form a couplet. This "envelope" structure creates a satisfying sense of closure, as the final line returns to the sound of the opening.

The pattern is psychologically powerful: you hear the first rhyme, then two lines that match each other, then a return to the original sound. It feels like completing a journey—going somewhere and coming back changed.

Tennyson used this scheme throughout "In Memoriam," creating hundreds of ABBA stanzas that circle obsessively around grief and memory. The form itself enacts return.`,
    example: {
      lines: [
        'Out of the night that covers me,',
        'Black as the pit from pole to pole,',
        'I thank whatever gods may be',
        'For my unconquerable soul.'
      ],
      labels: ['A', 'B', 'B', 'A'],
      attribution: 'William Ernest Henley, "Invictus"',
      poemSlug: 'invictus'
    },
    famousPoems: [
      { title: 'Invictus', poet: 'William Ernest Henley', slug: 'invictus' },
      { title: 'In Memoriam A.H.H.', poet: 'Alfred, Lord Tennyson' },
      { title: 'The Garden of Proserpine', poet: 'Algernon Charles Swinburne' },
      { title: 'Aubade', poet: 'Philip Larkin' }
    ],
    writingTips: [
      'Use the enclosed structure to create a sense of return. The final line should feel like coming home.',
      'The inner couplet (BB) can serve as the "heart" of the stanza—put your most intense image or idea there.',
      'The long wait between A rhymes makes them more noticeable. Choose them carefully.',
      'This scheme works well for meditative poetry about memory, loss, or cyclical themes.',
      'Consider what changes between the first A and the last A. The same sound, but different meaning.'
    ],
    relatedSchemes: ['abab', 'petrarchan-sonnet', 'aabb'],
    difficulty: 'intermediate',
    commonForms: ['In Memoriam stanza', 'Petrarchan sonnet octave', 'Rubai (Persian quatrain)']
  },

  'abcabc': {
    id: 'abcabc',
    name: 'Interlocking Rhyme (ABCABC)',
    pattern: 'ABCABC',
    alternateNames: ['Sixain', 'Crossed Rhyme Sixain'],
    description: 'A six-line stanza where lines 1, 4 rhyme; lines 2, 5 rhyme; and lines 3, 6 rhyme. Complex and musical.',
    explanation: `ABCABC creates three pairs of rhymes distributed across six lines. Each rhyme sound appears twice, separated by two other lines. This creates a weaving effect, like three threads intertwining.

The pattern demands careful planning. You need three good rhyme pairs, and you need to sustain meaning across the gaps. The payoff is a stanza that feels unified yet intricate, like a small musical composition.

This scheme often appears in more elaborate verse forms and was popular in Renaissance poetry. It rewards readers who pay attention to the sound patterns.`,
    example: {
      lines: [
        'Then took the other, as just as fair,',
        'And having perhaps the better claim,',
        'Because it was grassy and wanted wear;',
        'Though as for that the passing there',
        'Had worn them really about the same,',
        'And both that morning equally lay'
      ],
      labels: ['A', 'B', 'A', 'A', 'B', 'C'],
      attribution: 'Robert Frost, "The Road Not Taken" (modified ABAAB scheme)'
    },
    famousPoems: [
      { title: 'Venus and Adonis (stanzas)', poet: 'William Shakespeare' },
      { title: 'The Road Not Taken', poet: 'Robert Frost', slug: 'the-road-not-taken' },
      { title: 'Various Renaissance lyrics', poet: 'Edmund Spenser' }
    ],
    writingTips: [
      'Plan all three rhyme pairs before you start writing. Running out of rhymes mid-stanza is painful.',
      'The C rhyme closes the stanza, so make it strong and conclusive.',
      'Use the weaving structure to develop three related ideas that come together at the end.',
      'This scheme rewards musical readers. Read aloud to hear the pattern.',
      'Consider using this for meditative or descriptive passages where the complexity suits the content.'
    ],
    relatedSchemes: ['abab', 'shakespearean-sonnet', 'terza-rima'],
    difficulty: 'intermediate',
    commonForms: ['Venus and Adonis stanza', 'Some ode forms', 'Renaissance lyrics']
  },

  'shakespearean-sonnet': {
    id: 'shakespearean-sonnet',
    name: 'Shakespearean Sonnet (ABABCDCDEFEFGG)',
    pattern: 'ABAB CDCD EFEF GG',
    alternateNames: ['English Sonnet', 'Elizabethan Sonnet'],
    description: 'Three quatrains (ABAB CDCD EFEF) followed by a couplet (GG). The couplet delivers a twist or conclusion.',
    explanation: `The Shakespearean sonnet uses three ABAB quatrains plus a final couplet. This structure allows the poet to develop an argument in three stages, then deliver a punchy conclusion or twist in the final two lines.

The form requires seven different rhyme sounds (A, B, C, D, E, F, G), which is easier in English than the Petrarchan sonnet's four sounds. Shakespeare wrote 154 sonnets in this form, exploring love, beauty, time, and mortality.

The key to the Shakespearean sonnet is the couplet. It must do significant work—reversing, resolving, or complicating everything that came before. A weak couplet deflates the entire poem.`,
    example: {
      lines: [
        'Shall I compare thee to a summer\'s day?',
        'Thou art more lovely and more temperate:',
        'Rough winds do shake the darling buds of May,',
        'And summer\'s lease hath all too short a date.',
        'Sometime too hot the eye of heaven shines,',
        'And often is his gold complexion dimmed;',
        'And every fair from fair sometime declines,',
        'By chance, or nature\'s changing course, untrimmed;',
        'But thy eternal summer shall not fade,',
        'Nor lose possession of that fair thou ow\'st,',
        'Nor shall death brag thou wand\'rest in his shade,',
        'When in eternal lines to Time thou grow\'st.',
        'So long as men can breathe, or eyes can see,',
        'So long lives this, and this gives life to thee.'
      ],
      labels: ['A', 'B', 'A', 'B', 'C', 'D', 'C', 'D', 'E', 'F', 'E', 'F', 'G', 'G'],
      attribution: 'William Shakespeare, Sonnet 18',
      poemSlug: 'sonnet-18'
    },
    famousPoems: [
      { title: 'Sonnet 18 (Shall I compare thee)', poet: 'William Shakespeare', slug: 'sonnet-18' },
      { title: 'Sonnet 116 (Let me not to the marriage)', poet: 'William Shakespeare', slug: 'sonnet-116' },
      { title: 'Sonnet 130 (My mistress\' eyes)', poet: 'William Shakespeare', slug: 'sonnet-130' },
      { title: 'Sonnet 73 (That time of year)', poet: 'William Shakespeare', slug: 'sonnet-73' },
      { title: 'Sonnet 29 (When, in disgrace)', poet: 'William Shakespeare', slug: 'sonnet-29' }
    ],
    writingTips: [
      'Plan your three quatrains as stages of an argument. What does each one contribute?',
      'The couplet must earn its place. Don\'t just summarize—transform, reverse, or complicate.',
      'Avoid cliche rhymes in the couplet. "Love/above" and "heart/part" are overused.',
      'The volta (turn) usually comes at line 13, but you can place smaller turns at lines 5 and 9.',
      'Iambic pentameter is traditional. Read Shakespeare aloud to internalize the rhythm.',
      'Our Sonnet Checker can verify your structure and rhyme scheme.'
    ],
    relatedSchemes: ['abab', 'petrarchan-sonnet', 'aabb'],
    difficulty: 'advanced',
    commonForms: ['Shakespearean/English sonnet']
  },

  'petrarchan-sonnet': {
    id: 'petrarchan-sonnet',
    name: 'Petrarchan Sonnet (ABBAABBACDECDE)',
    pattern: 'ABBAABBA CDECDE',
    alternateNames: ['Italian Sonnet', 'Petrarchan Octave and Sestet'],
    description: 'An octave (ABBAABBA) presents a problem; a sestet (CDECDE or CDCDCD) responds. The volta comes at line 9.',
    explanation: `The Petrarchan sonnet divides into an octave (8 lines) and a sestet (6 lines). The octave uses only two rhyme sounds (ABBAABBA), creating a tight, enclosed structure. The sestet can vary (CDECDE, CDCDCD, or other patterns) and provides resolution.

The volta (turn) comes between the octave and sestet, at line 9. This creates a clear two-part structure: the octave presents a problem, question, or situation; the sestet responds with an answer, resolution, or shift in perspective.

The Petrarchan sonnet is harder to write in English than the Shakespearean because it requires only four or five rhyme sounds total. Italian has more rhyming words, making this easier in the original language.`,
    example: {
      lines: [
        'I met a traveller from an antique land,',
        'Who said—"Two vast and trunkless legs of stone',
        'Stand in the desert. . . . Near them, on the sand,',
        'Half sunk a shattered visage lies, whose frown,',
        'And wrinkled lip, and sneer of cold command,',
        'Tell that its sculptor well those passions read',
        'Which yet survive, stamped on these lifeless things,',
        'The hand that mocked them, and the heart that fed;',
        'And on the pedestal, these words appear:',
        'My name is Ozymandias, King of Kings;',
        'Look on my Works, ye Mighty, and despair!',
        'Nothing beside remains. Round the decay',
        'Of that colossal Wreck, boundless and bare',
        'The lone and level sands stretch far away."'
      ],
      labels: ['A', 'B', 'A', 'B', 'A', 'C', 'D', 'C', 'E', 'D', 'E', 'F', 'E', 'F'],
      attribution: 'Percy Bysshe Shelley, "Ozymandias" (unconventional rhyme scheme)',
      poemSlug: 'ozymandias'
    },
    famousPoems: [
      { title: 'Ozymandias', poet: 'Percy Bysshe Shelley', slug: 'ozymandias' },
      { title: 'How Do I Love Thee? (Sonnet 43)', poet: 'Elizabeth Barrett Browning' },
      { title: 'On His Blindness', poet: 'John Milton' },
      { title: 'The World Is Too Much with Us', poet: 'William Wordsworth', slug: 'world-too-much' },
      { title: 'Composed upon Westminster Bridge', poet: 'William Wordsworth', slug: 'westminster-bridge' }
    ],
    writingTips: [
      'The octave should present a complete thought or problem. Don\'t resolve it early.',
      'The volta at line 9 is crucial. Mark it clearly with "But," "Yet," "And yet," or a shift in tone.',
      'Finding enough A and B rhymes for the octave is the hardest part. Plan these first.',
      'The sestet has more flexibility. CDECDE and CDCDCD both work.',
      'Read Milton and Wordsworth to see how English poets adapted the Italian form.',
      'This form suits meditative poetry about big questions—love, mortality, faith, nature.'
    ],
    relatedSchemes: ['abba', 'shakespearean-sonnet', 'abcabc'],
    difficulty: 'advanced',
    commonForms: ['Italian/Petrarchan sonnet']
  },

  'terza-rima': {
    id: 'terza-rima',
    name: 'Terza Rima (ABA BCB CDC...)',
    pattern: 'ABA BCB CDC...',
    alternateNames: ['Third Rhyme', 'Dante\'s Scheme'],
    description: 'An interlocking pattern where the middle line of each tercet rhymes with the first and third lines of the next.',
    explanation: `Terza rima chains tercets (three-line stanzas) together through rhyme. In each tercet, the first and third lines rhyme (A-A), while the middle line (B) becomes the rhyme for the next tercet (B-B). This creates an endless chain: ABA BCB CDC DED...

Dante invented this scheme for the Divine Comedy, and it drives over 14,000 lines of his epic. The interlocking structure creates forward momentum—each tercet pulls you into the next because the middle rhyme demands resolution.

The scheme typically ends with a single line or couplet that rhymes with the previous tercet's middle line, creating closure. In English, terza rima is challenging because of our limited rhyme pool, but poets like Shelley and Frost have used it effectively.`,
    example: {
      lines: [
        'O wild West Wind, thou breath of Autumn\'s being,',
        'Thou, from whose unseen presence the leaves dead',
        'Are driven, like ghosts from an enchanter fleeing,',
        '',
        'Yellow, and black, and pale, and hectic red,',
        'Pestilence-stricken multitudes: O thou,',
        'Who chariotest to their dark wintry bed'
      ],
      labels: ['A', 'B', 'A', '', 'B', 'C', 'B'],
      attribution: 'Percy Bysshe Shelley, "Ode to the West Wind"'
    },
    famousPoems: [
      { title: 'The Divine Comedy', poet: 'Dante Alighieri' },
      { title: 'Ode to the West Wind', poet: 'Percy Bysshe Shelley' },
      { title: 'Acquainted with the Night', poet: 'Robert Frost' },
      { title: 'The Triumph of Life', poet: 'Percy Bysshe Shelley' }
    ],
    writingTips: [
      'Plan your rhyme chains in advance. Running out of rhymes mid-poem is catastrophic.',
      'The B line of each tercet is crucial—it must work as an ending AND set up the next stanza.',
      'Use the forward momentum of the form for narrative or argumentative poetry.',
      'Consider slant rhymes to expand your options in English.',
      'This is a demanding form. Start with a short poem (3-5 tercets) before attempting longer work.',
      'End with a single line or couplet that resolves the final B rhyme.'
    ],
    relatedSchemes: ['abcabc', 'abab', 'petrarchan-sonnet'],
    difficulty: 'advanced',
    commonForms: ['Terza rima', 'Dante\'s tercets']
  },

  'free-verse': {
    id: 'free-verse',
    name: 'Free Verse (No Fixed Scheme)',
    pattern: 'No fixed pattern',
    alternateNames: ['Vers Libre', 'Open Form'],
    description: 'Poetry without a regular rhyme scheme or meter. Structure comes from other elements: rhythm, imagery, line breaks.',
    explanation: `Free verse abandons fixed rhyme schemes and meter, but it isn't formless. Instead of external patterns, free verse creates structure through rhythm, imagery, repetition, line breaks, and the natural cadences of speech.

Walt Whitman pioneered free verse in English with "Leaves of Grass" (1855). He replaced end rhyme with parallelism, anaphora (repeated openings), and catalog structures. Later poets like T.S. Eliot, William Carlos Williams, and contemporary poets developed the form further.

Free verse is not easier than formal verse—it just relocates the difficulty. Without rhyme and meter as scaffolding, every choice about line length, breaks, and rhythm must be intentional.`,
    example: {
      lines: [
        'A noiseless patient spider,',
        'I mark\'d where on a little promontory it stood isolated,',
        'Mark\'d how to explore the vacant vast surrounding,',
        'It launch\'d forth filament, filament, filament, out of itself,',
        'Ever unreeling them, ever tirelessly speeding them.'
      ],
      labels: ['-', '-', '-', '-', '-'],
      attribution: 'Walt Whitman, "A Noiseless Patient Spider"',
      poemSlug: 'noiseless-spider'
    },
    famousPoems: [
      { title: 'A Noiseless Patient Spider', poet: 'Walt Whitman', slug: 'noiseless-spider' },
      { title: 'Song of Myself', poet: 'Walt Whitman' },
      { title: 'The Red Wheelbarrow', poet: 'William Carlos Williams' },
      { title: 'The Love Song of J. Alfred Prufrock', poet: 'T.S. Eliot' },
      { title: 'This Is Just to Say', poet: 'William Carlos Williams' }
    ],
    writingTips: [
      'Every line break should have a reason. Ask: why does this line end here?',
      'Use repetition and parallelism to create rhythm without meter.',
      'Read your poem aloud. The rhythm should feel intentional, not random.',
      'Strong imagery becomes more important without rhyme to carry the reader forward.',
      'Consider using occasional rhyme or near-rhyme for emphasis at key moments.',
      'Line length variations create visual and rhythmic effects. Use them deliberately.'
    ],
    relatedSchemes: ['aabb', 'abab', 'terza-rima'],
    difficulty: 'beginner',
    commonForms: ['Free verse', 'Open form', 'Prose poetry']
  }
};

export function getRhymeSchemeById(id: string): RhymeScheme | undefined {
  return rhymeSchemes[id];
}

export function getAllRhymeSchemes(): RhymeScheme[] {
  return Object.values(rhymeSchemes);
}

export function getAllRhymeSchemeIds(): string[] {
  return Object.keys(rhymeSchemes);
}
