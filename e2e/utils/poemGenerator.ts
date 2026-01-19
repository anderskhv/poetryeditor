/**
 * Poem Generator Utilities
 *
 * Generates various types of poems for comprehensive testing.
 * Includes edge cases, malformed poems, and standard forms.
 */

export interface GeneratedPoem {
  type: string;
  title: string;
  content: string;
  expectedFeatures: {
    lineCount?: number;
    syllablePattern?: number[];
    rhymeScheme?: string;
    meterType?: string;
    expectedForm?: string;
  };
  testNotes: string;
}

// ============================================================================
// HAIKU GENERATORS
// ============================================================================

const HAIKU_POEMS: GeneratedPoem[] = [
  {
    type: 'haiku',
    title: 'Classic Nature Haiku',
    content: `An old silent pond
A frog jumps into the pond
Splash! Silence again`,
    expectedFeatures: {
      lineCount: 3,
      syllablePattern: [5, 7, 5],
      expectedForm: 'Haiku',
    },
    testNotes: 'Traditional haiku by Basho - should detect 5-7-5 pattern',
  },
  {
    type: 'haiku',
    title: 'Modern Haiku',
    content: `Morning coffee steam
Rising like my sleepy thoughts
Monday begins slow`,
    expectedFeatures: {
      lineCount: 3,
      syllablePattern: [5, 7, 5],
      expectedForm: 'Haiku',
    },
    testNotes: 'Contemporary haiku - tests modern vocabulary syllable counting',
  },
  {
    type: 'haiku',
    title: 'Approximate Haiku',
    content: `Cherry blossoms fall
Drifting on the spring breeze now
Beauty fades away`,
    expectedFeatures: {
      lineCount: 3,
      expectedForm: 'Haiku',
    },
    testNotes: 'Near-haiku that may have slight syllable variations',
  },
  {
    type: 'haiku',
    title: 'Technical Haiku',
    content: `Code compiles at last
Stack overflow exception
Debug starts again`,
    expectedFeatures: {
      lineCount: 3,
      syllablePattern: [5, 7, 5],
      expectedForm: 'Haiku',
    },
    testNotes: 'Tech-themed haiku - tests handling of technical terms',
  },
];

// ============================================================================
// SONNET GENERATORS
// ============================================================================

const SONNET_POEMS: GeneratedPoem[] = [
  {
    type: 'shakespearean_sonnet',
    title: 'Shakespeare Sonnet 18',
    content: `Shall I compare thee to a summer's day?
Thou art more lovely and more temperate:
Rough winds do shake the darling buds of May,
And summer's lease hath all too short a date:
Sometime too hot the eye of heaven shines,
And often is his gold complexion dimm'd;
And every fair from fair sometime declines,
By chance, or nature's changing course untrimm'd;
But thy eternal summer shall not fade,
Nor lose possession of that fair thou ow'st;
Nor shall death brag thou wander'st in his shade,
When in eternal lines to time thou grow'st:
  So long as men can breathe, or eyes can see,
  So long lives this, and this gives life to thee.`,
    expectedFeatures: {
      lineCount: 14,
      rhymeScheme: 'ABAB CDCD EFEF GG',
      meterType: 'iambic pentameter',
      expectedForm: 'Shakespearean Sonnet',
    },
    testNotes: 'Classic Shakespearean sonnet - full form validation',
  },
  {
    type: 'petrarchan_sonnet',
    title: 'Petrarchan Sonnet Example',
    content: `How do I love thee? Let me count the ways.
I love thee to the depth and breadth and height
My soul can reach, when feeling out of sight
For the ends of being and ideal grace.
I love thee to the level of every day's
Most quiet need, by sun and candle-light.
I love thee freely, as men strive for right.
I love thee purely, as they turn from praise.
I love thee with the passion put to use
In my old griefs, and with my childhood's faith.
I love thee with a love I seemed to lose
With my lost saints. I love thee with the breath,
Smiles, tears, of all my life; and, if God choose,
I shall but love thee better after death.`,
    expectedFeatures: {
      lineCount: 14,
      rhymeScheme: 'ABBA ABBA CDCDCD',
      meterType: 'iambic pentameter',
      expectedForm: 'Petrarchan Sonnet',
    },
    testNotes: 'EBB Sonnet 43 - tests Petrarchan form detection',
  },
];

// ============================================================================
// FREE VERSE GENERATORS
// ============================================================================

const FREE_VERSE_POEMS: GeneratedPoem[] = [
  {
    type: 'free_verse',
    title: 'Modern Free Verse',
    content: `I saw the best minds of my generation destroyed
by madness, starving hysterical naked,
dragging themselves through the negro streets
at dawn looking for an angry fix`,
    expectedFeatures: {
      expectedForm: 'Free Verse',
    },
    testNotes: 'Ginsberg-style - no regular meter or rhyme',
  },
  {
    type: 'free_verse',
    title: 'Imagist Free Verse',
    content: `So much depends
upon

a red wheel
barrow

glazed with rain
water

beside the white
chickens`,
    expectedFeatures: {
      expectedForm: 'Free Verse',
    },
    testNotes: 'WCW style with short lines and stanza breaks',
  },
  {
    type: 'free_verse',
    title: 'Prose-like Free Verse',
    content: `The fog comes on little cat feet.
It sits looking over harbor and city
on silent haunches and then moves on.`,
    expectedFeatures: {
      lineCount: 3,
      expectedForm: 'Free Verse',
    },
    testNotes: 'Sandburg fog poem - short free verse',
  },
];

// ============================================================================
// LIMERICK GENERATORS
// ============================================================================

const LIMERICK_POEMS: GeneratedPoem[] = [
  {
    type: 'limerick',
    title: 'Classic Limerick',
    content: `There once was a man from Nantucket
Who kept all his cash in a bucket
His daughter named Nan
Ran away with a man
And as for the bucket, Nan took it`,
    expectedFeatures: {
      lineCount: 5,
      rhymeScheme: 'AABBA',
      expectedForm: 'Limerick',
    },
    testNotes: 'Traditional limerick structure',
  },
  {
    type: 'limerick',
    title: 'Tech Limerick',
    content: `A programmer known as McNight
Would code from the morning to night
His functions were clean
The best ever seen
But comments? Not one was in sight`,
    expectedFeatures: {
      lineCount: 5,
      rhymeScheme: 'AABBA',
      expectedForm: 'Limerick',
    },
    testNotes: 'Modern limerick with tech vocabulary',
  },
];

// ============================================================================
// VILLANELLE GENERATORS
// ============================================================================

const VILLANELLE_POEMS: GeneratedPoem[] = [
  {
    type: 'villanelle',
    title: 'Do Not Go Gentle',
    content: `Do not go gentle into that good night,
Old age should burn and rave at close of day;
Rage, rage against the dying of the light.

Though wise men at their end know dark is right,
Because their words had forked no lightning they
Do not go gentle into that good night.

Good men, the last wave by, crying how bright
Their frail deeds might have danced in a green bay,
Rage, rage against the dying of the light.

Wild men who caught and sang the sun in flight,
And learn, too late, they grieved it on its way,
Do not go gentle into that good night.

Grave men, near death, who see with blinding sight
Blind eyes could blaze like meteors and be gay,
Rage, rage against the dying of the light.

And you, my father, there on the sad height,
Curse, bless, me now with your fierce tears, I pray.
Do not go gentle into that good night.
Rage, rage against the dying of the light.`,
    expectedFeatures: {
      lineCount: 19,
      expectedForm: 'Villanelle',
    },
    testNotes: 'Dylan Thomas villanelle - complex refrain pattern',
  },
];

// ============================================================================
// BLANK VERSE GENERATORS
// ============================================================================

const BLANK_VERSE_POEMS: GeneratedPoem[] = [
  {
    type: 'blank_verse',
    title: 'Shakespearean Blank Verse',
    content: `To be, or not to be, that is the question:
Whether 'tis nobler in the mind to suffer
The slings and arrows of outrageous fortune,
Or to take arms against a sea of troubles
And by opposing end them. To die: to sleep;
No more; and by a sleep to say we end
The heart-ache and the thousand natural shocks
That flesh is heir to. 'Tis a consummation
Devoutly to be wished.`,
    expectedFeatures: {
      meterType: 'iambic pentameter',
      expectedForm: 'Blank Verse',
    },
    testNotes: 'Hamlet soliloquy - unrhymed iambic pentameter',
  },
  {
    type: 'blank_verse',
    title: 'Milton Blank Verse',
    content: `Of Man's first disobedience, and the fruit
Of that forbidden tree whose mortal taste
Brought death into the World, and all our woe,
With loss of Eden, till one greater Man
Restore us, and regain the blissful seat,
Sing, Heavenly Muse.`,
    expectedFeatures: {
      meterType: 'iambic pentameter',
      expectedForm: 'Blank Verse',
    },
    testNotes: 'Paradise Lost opening - epic blank verse',
  },
];

// ============================================================================
// EDGE CASES AND MALFORMED POEMS
// ============================================================================

const EDGE_CASE_POEMS: GeneratedPoem[] = [
  {
    type: 'edge_case',
    title: 'Empty Input',
    content: ``,
    expectedFeatures: {},
    testNotes: 'Empty string - should handle gracefully',
  },
  {
    type: 'edge_case',
    title: 'Single Word',
    content: `Poetry`,
    expectedFeatures: {
      lineCount: 1,
    },
    testNotes: 'Single word input',
  },
  {
    type: 'edge_case',
    title: 'Single Line',
    content: `This is a single line of poetry that goes on and on`,
    expectedFeatures: {
      lineCount: 1,
    },
    testNotes: 'Single long line',
  },
  {
    type: 'edge_case',
    title: 'Numbers and Symbols',
    content: `1984 was a year of change
$100 bills flew like birds in spring
The @ symbol means "at" they say
But # is for hashtags today`,
    expectedFeatures: {
      lineCount: 4,
    },
    testNotes: 'Tests handling of numbers and special characters',
  },
  {
    type: 'edge_case',
    title: 'Unicode and Accents',
    content: `Café au lait in the morn
Résumé of life well worn
Naïve dreams of déjà vu
Piñata breaks, confetti flew`,
    expectedFeatures: {
      lineCount: 4,
    },
    testNotes: 'Tests Unicode character handling',
  },
  {
    type: 'edge_case',
    title: 'Very Long Lines',
    content: `This is an extremely long line of poetry that contains many many words and goes on for what seems like forever without any breaks or pauses just continuous text flowing like a river
And this second line is also quite long though perhaps not quite as long as the first but still substantial in its length and scope`,
    expectedFeatures: {
      lineCount: 2,
    },
    testNotes: 'Tests handling of very long lines',
  },
  {
    type: 'edge_case',
    title: 'Multiple Blank Lines',
    content: `First stanza here


Second stanza after blanks



Third stanza after more blanks`,
    expectedFeatures: {},
    testNotes: 'Tests handling of multiple consecutive blank lines',
  },
  {
    type: 'edge_case',
    title: 'Tabs and Irregular Whitespace',
    content: `	This line starts with a tab
    This one has leading spaces
		Double tabs here
No whitespace at the start of this line`,
    expectedFeatures: {
      lineCount: 4,
    },
    testNotes: 'Tests handling of tabs and irregular whitespace',
  },
  {
    type: 'edge_case',
    title: 'All Caps',
    content: `THE QUICK BROWN FOX JUMPS OVER
THE LAZY DOG AND RUNS AWAY
INTO THE FOREST DARK AND DEEP
WHERE SECRETS SLEEP AND SHADOWS PLAY`,
    expectedFeatures: {
      lineCount: 4,
    },
    testNotes: 'Tests handling of all caps text',
  },
  {
    type: 'edge_case',
    title: 'Mixed Case Irregular',
    content: `ThIs LiNe HaS wEiRd CaPiTaLiZaTiOn
this LINE has RANDOM caps throughout
SOME words ARE louder THAN others
CaN tHe AnAlYzEr HaNdLe ThIs?`,
    expectedFeatures: {
      lineCount: 4,
    },
    testNotes: 'Tests case insensitivity in analysis',
  },
  {
    type: 'edge_case',
    title: 'Punctuation Heavy',
    content: `"Hello," she said, "how are you?"
'Fine,' he replied--quite tersely.
Wait...what? No! Yes! Maybe?
Semi-colons; colons: dashes—everywhere!`,
    expectedFeatures: {
      lineCount: 4,
    },
    testNotes: 'Tests handling of various punctuation marks',
  },
  {
    type: 'edge_case',
    title: 'Contractions Heavy',
    content: `I can't believe you've done this
It's not what I'd expected
They're saying we'll regret it
But I won't and I haven't`,
    expectedFeatures: {
      lineCount: 4,
    },
    testNotes: 'Tests syllable counting with contractions',
  },
  {
    type: 'edge_case',
    title: 'Archaic Language',
    content: `Wherefore art thou Romeo?
Hast thou forgotten me so soon?
'Twas but a fortnight past
When o'er the moor we walked`,
    expectedFeatures: {
      lineCount: 4,
    },
    testNotes: 'Tests handling of archaic contractions and vocabulary',
  },
  {
    type: 'edge_case',
    title: 'Foreign Words Mixed',
    content: `The Weltschmerz fills my heart tonight
With Schadenfreude and delight
A je ne sais quoi in the air
While karma waits just over there`,
    expectedFeatures: {
      lineCount: 4,
    },
    testNotes: 'Tests handling of foreign loanwords',
  },
  {
    type: 'edge_case',
    title: 'Repeated Words',
    content: `The the the the the the the
Word word word word word word word
Same same same same same same same
Test test test test test test test`,
    expectedFeatures: {
      lineCount: 4,
    },
    testNotes: 'Tests word repetition detection',
  },
  {
    type: 'edge_case',
    title: 'Hyphenated Compounds',
    content: `The well-worn path led to the half-open door
Self-conscious and world-weary she stood
The ever-present wind was ice-cold
Mother-in-law waited with father-in-law`,
    expectedFeatures: {
      lineCount: 4,
    },
    testNotes: 'Tests hyphenated compound word handling',
  },
  {
    type: 'edge_case',
    title: 'Alliterative Lines',
    content: `Peter Piper picked a peck of pickled peppers
She sells seashells by the seashore
Big black bugs bit big black bears
How much wood would a woodchuck chuck`,
    expectedFeatures: {
      lineCount: 4,
    },
    testNotes: 'Tests alliteration detection',
  },
  {
    type: 'edge_case',
    title: 'Rhyming Couplets',
    content: `The cat sat on the mat so flat
And next to him there sat a rat
They looked around without a sound
And then got up and walked around`,
    expectedFeatures: {
      lineCount: 4,
      rhymeScheme: 'AABB',
    },
    testNotes: 'Tests rhyme scheme detection with couplets',
  },
];

// ============================================================================
// STRESS AND METER TEST POEMS
// ============================================================================

const METER_TEST_POEMS: GeneratedPoem[] = [
  {
    type: 'meter_test',
    title: 'Perfect Iambic Pentameter',
    content: `If music be the food of love play on
Give me excess of it that surfeiting
The appetite may sicken and so die
That strain again it had a dying fall`,
    expectedFeatures: {
      meterType: 'iambic pentameter',
    },
    testNotes: 'Clean iambic pentameter for meter detection test',
  },
  {
    type: 'meter_test',
    title: 'Trochaic Tetrameter',
    content: `Double double toil and trouble
Fire burn and cauldron bubble
Fillet of a fenny snake
In the cauldron boil and bake`,
    expectedFeatures: {
      meterType: 'trochaic tetrameter',
    },
    testNotes: 'Tests trochaic pattern detection',
  },
  {
    type: 'meter_test',
    title: 'Anapestic Meter',
    content: `Twas the night before Christmas and all through the house
Not a creature was stirring not even a mouse
The stockings were hung by the chimney with care
In hopes that Saint Nicholas soon would be there`,
    expectedFeatures: {
      meterType: 'anapestic',
    },
    testNotes: 'Tests anapestic pattern detection',
  },
  {
    type: 'meter_test',
    title: 'Dactylic Meter',
    content: `This is the forest primeval the murmuring pines
And the hemlocks bearded with moss and garments green
Indistinct in the twilight stand like druids of eld
With voices sad and prophetic stand like harpers hoar`,
    expectedFeatures: {
      meterType: 'dactylic',
    },
    testNotes: 'Tests dactylic pattern detection',
  },
  {
    type: 'meter_test',
    title: 'Mixed Meter',
    content: `Sometimes I write in iambic pentameter
But then I switch to something different
Trochees dancing across the page
Back to iambs again we go today`,
    expectedFeatures: {
      meterType: 'mixed',
    },
    testNotes: 'Tests handling of inconsistent meter',
  },
];

// ============================================================================
// PERFORMANCE TEST POEMS
// ============================================================================

function generateLongPoem(lineCount: number): GeneratedPoem {
  const lines: string[] = [];
  const words = ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'and', 'runs', 'away', 'into', 'forest', 'dark', 'deep', 'where', 'secrets', 'sleep', 'shadows', 'play', 'light', 'fades', 'night', 'comes', 'stars', 'shine', 'bright', 'moon', 'rises', 'high'];

  for (let i = 0; i < lineCount; i++) {
    const lineWords: string[] = [];
    const wordCount = 5 + Math.floor(Math.random() * 5);
    for (let j = 0; j < wordCount; j++) {
      lineWords.push(words[Math.floor(Math.random() * words.length)]);
    }
    // Capitalize first word
    lineWords[0] = lineWords[0].charAt(0).toUpperCase() + lineWords[0].slice(1);
    lines.push(lineWords.join(' '));
  }

  return {
    type: 'performance',
    title: `Long Poem (${lineCount} lines)`,
    content: lines.join('\n'),
    expectedFeatures: {
      lineCount,
    },
    testNotes: `Performance test with ${lineCount} lines`,
  };
}

const PERFORMANCE_POEMS: GeneratedPoem[] = [
  generateLongPoem(50),
  generateLongPoem(100),
  generateLongPoem(200),
];

// ============================================================================
// RHYME TEST POEMS
// ============================================================================

const RHYME_TEST_POEMS: GeneratedPoem[] = [
  {
    type: 'rhyme_test',
    title: 'Perfect End Rhymes',
    content: `The cat sat on the mat
The dog logged through the fog
The bee flew to the tree
The mouse found a house`,
    expectedFeatures: {
      rhymeScheme: 'ABCD',
    },
    testNotes: 'Tests end rhyme detection within lines',
  },
  {
    type: 'rhyme_test',
    title: 'Slant Rhymes',
    content: `I walked alone through the years
My heart was filled with fears
The wind whispered in my ears
And dried away my tears`,
    expectedFeatures: {
      rhymeScheme: 'AAAA',
    },
    testNotes: 'Tests detection of slant/near rhymes',
  },
  {
    type: 'rhyme_test',
    title: 'Internal Rhymes',
    content: `Once upon a midnight dreary while I pondered weak and weary
Over many a quaint and curious volume of forgotten lore
While I nodded nearly napping suddenly there came a tapping
As of someone gently rapping rapping at my chamber door`,
    expectedFeatures: {},
    testNotes: 'Tests internal rhyme detection',
  },
  {
    type: 'rhyme_test',
    title: 'No Rhymes',
    content: `The elephant walked slowly
Through the African grassland
Searching for water
Beneath the burning sun`,
    expectedFeatures: {
      rhymeScheme: 'ABCD',
    },
    testNotes: 'Tests handling of non-rhyming verse',
  },
];

// ============================================================================
// SOUND PATTERN TEST POEMS
// ============================================================================

const SOUND_PATTERN_POEMS: GeneratedPoem[] = [
  {
    type: 'sound_pattern',
    title: 'Heavy Alliteration',
    content: `Slithering snakes silently slid
Between brown branches barely bent
Crispy crackling leaves lay below
Mice meekly moved through murky mud`,
    expectedFeatures: {},
    testNotes: 'Tests alliteration detection',
  },
  {
    type: 'sound_pattern',
    title: 'Assonance Heavy',
    content: `The rain in Spain falls mainly on the plain
Hear the mellow wedding bells
Fleet feet sweep by sleeping geese
How now brown cow`,
    expectedFeatures: {},
    testNotes: 'Tests assonance detection',
  },
  {
    type: 'sound_pattern',
    title: 'Consonance Heavy',
    content: `The lumpy bumpy pumpkin sat
On the mat flat and fat
The cat that sat began to chat
About this and that and all of that`,
    expectedFeatures: {},
    testNotes: 'Tests consonance detection',
  },
];

// ============================================================================
// LANGUAGE ANALYSIS TEST POEMS
// ============================================================================

const LANGUAGE_TEST_POEMS: GeneratedPoem[] = [
  {
    type: 'language_test',
    title: 'Passive Voice Heavy',
    content: `The ball was thrown by the boy
The cake was eaten by the girl
The song was sung by the choir
The game was won by the team`,
    expectedFeatures: {},
    testNotes: 'Tests passive voice detection',
  },
  {
    type: 'language_test',
    title: 'Adverb Heavy',
    content: `She walked slowly and carefully today
Quietly and softly she began to say
Quickly and suddenly she ran away
Happily and joyfully she came to stay`,
    expectedFeatures: {},
    testNotes: 'Tests adverb detection and suggestions',
  },
  {
    type: 'language_test',
    title: 'Tense Inconsistent',
    content: `I walked to the store yesterday
Today I am walking to school
Tomorrow I will walk to work
Last week I walk to the park`,
    expectedFeatures: {},
    testNotes: 'Tests tense consistency detection',
  },
  {
    type: 'language_test',
    title: 'Cliche Heavy',
    content: `It was a dark and stormy night
Love is blind they always say
Time flies when you're having fun
Every cloud has a silver lining`,
    expectedFeatures: {},
    testNotes: 'Tests cliche detection',
  },
];

// ============================================================================
// EXPORT ALL POEM COLLECTIONS
// ============================================================================

export const ALL_TEST_POEMS: GeneratedPoem[] = [
  ...HAIKU_POEMS,
  ...SONNET_POEMS,
  ...FREE_VERSE_POEMS,
  ...LIMERICK_POEMS,
  ...VILLANELLE_POEMS,
  ...BLANK_VERSE_POEMS,
  ...EDGE_CASE_POEMS,
  ...METER_TEST_POEMS,
  ...PERFORMANCE_POEMS,
  ...RHYME_TEST_POEMS,
  ...SOUND_PATTERN_POEMS,
  ...LANGUAGE_TEST_POEMS,
];

export function getRandomPoem(): GeneratedPoem {
  return ALL_TEST_POEMS[Math.floor(Math.random() * ALL_TEST_POEMS.length)];
}

export function getPoemsByType(type: string): GeneratedPoem[] {
  return ALL_TEST_POEMS.filter(p => p.type === type);
}

export function getPoemsByCategory(category: 'forms' | 'edge_cases' | 'meter' | 'rhyme' | 'sound' | 'language' | 'performance'): GeneratedPoem[] {
  const typeMap: Record<string, string[]> = {
    forms: ['haiku', 'shakespearean_sonnet', 'petrarchan_sonnet', 'free_verse', 'limerick', 'villanelle', 'blank_verse'],
    edge_cases: ['edge_case'],
    meter: ['meter_test'],
    rhyme: ['rhyme_test'],
    sound: ['sound_pattern'],
    language: ['language_test'],
    performance: ['performance'],
  };

  const types = typeMap[category] || [];
  return ALL_TEST_POEMS.filter(p => types.includes(p.type));
}

export { HAIKU_POEMS, SONNET_POEMS, FREE_VERSE_POEMS, LIMERICK_POEMS, VILLANELLE_POEMS, BLANK_VERSE_POEMS, EDGE_CASE_POEMS, METER_TEST_POEMS, PERFORMANCE_POEMS, RHYME_TEST_POEMS, SOUND_PATTERN_POEMS, LANGUAGE_TEST_POEMS };
