/**
 * Comprehensive test suite for poetic form detection
 * Tests against well-known classic poems to ensure accuracy
 */

import { detectPoetricForm } from '../formDetector';

interface TestPoem {
  title: string;
  author: string;
  text: string;
  expectedForm: string;
  expectedFit: 'high' | 'medium' | 'low';
}

const testPoems: TestPoem[] = [
  // ===== SHAKESPEAREAN SONNETS =====
  {
    title: 'Sonnet 18',
    author: 'William Shakespeare',
    expectedForm: 'Shakespearean Sonnet',
    expectedFit: 'high',
    text: `Shall I compare thee to a summer's day?
Thou art more lovely and more temperate:
Rough winds do shake the darling buds of May,
And summer's lease hath all too short a date:
Sometime too hot the eye of heaven shines,
And often is his gold complexion dimmed,
And every fair from fair sometime declines,
By chance, or nature's changing course untrimmed:
But thy eternal summer shall not fade,
Nor lose possession of that fair thou ow'st,
Nor shall death brag thou wand'rest in his shade,
When in eternal lines to time thou grow'st,
So long as men can breathe, or eyes can see,
So long lives this, and this gives life to thee.`
  },
  {
    title: 'Sonnet 29',
    author: 'William Shakespeare',
    expectedForm: 'Shakespearean Sonnet',
    expectedFit: 'high',
    text: `When in disgrace with fortune and men's eyes
I all alone beweep my outcast state,
And trouble deaf heaven with my bootless cries,
And look upon myself, and curse my fate,
Wishing me like to one more rich in hope,
Featured like him, like him with friends possessed,
Desiring this man's art, and that man's scope,
With what I most enjoy contented least;
Yet in these thoughts my self almost despising,
Haply I think on thee, and then my state,
Like to the lark at break of day arising
From sullen earth, sings hymns at heaven's gate;
For thy sweet love remembered such wealth brings
That then I scorn to change my state with kings.`
  },
  {
    title: 'Sonnet 116',
    author: 'William Shakespeare',
    expectedForm: 'Shakespearean Sonnet',
    expectedFit: 'high',
    text: `Let me not to the marriage of true minds
Admit impediments. Love is not love
Which alters when it alteration finds,
Or bends with the remover to remove:
O no! it is an ever-fixed mark
That looks on tempests and is never shaken;
It is the star to every wandering bark,
Whose worth's unknown, although his height be taken.
Love's not Time's fool, though rosy lips and cheeks
Within his bending sickle's compass come:
Love alters not with his brief hours and weeks,
But bears it out even to the edge of doom.
If this be error and upon me proved,
I never writ, nor no man ever loved.`
  },

  // ===== PETRARCHAN SONNETS =====
  {
    title: 'Whoso List to Hunt',
    author: 'Thomas Wyatt',
    expectedForm: 'Petrarchan Sonnet',
    expectedFit: 'high',
    text: `Whoso list to hunt, I know where is an hind,
But as for me, helas, I may no more.
The vain travail hath wearied me so sore,
I am of them that farthest cometh behind.
Yet may I by no means my wearied mind
Draw from the deer, but as she fleeth afore
Fainting I follow. I leave off therefore,
Sithens in a net I seek to hold the wind.
Who list her hunt, I put him out of doubt,
As well as I may spend his time in vain.
And graven with diamonds in letters plain
There is written, her fair neck round about:
Noli me tangere, for Caesar's I am,
And wild for to hold, though I seem tame.`
  },

  // ===== HAIKUS =====
  {
    title: 'The Old Pond',
    author: 'Matsuo Basho',
    expectedForm: 'Haiku',
    expectedFit: 'high',
    text: `An old silent pond
A frog jumps into the pond
Splash! Silence again`
  },
  {
    title: 'Over the wintry',
    author: 'Natsume Soseki',
    expectedForm: 'Haiku',
    expectedFit: 'high',
    text: `Over the wintry
forest, winds howl in rage
with no leaves to blow`
  },
  {
    title: 'In the twilight rain',
    author: 'Masaoka Shiki',
    expectedForm: 'Haiku',
    expectedFit: 'high',
    text: `In the twilight rain
these brilliant-hued hibiscus
A lovely sunset`
  },
  {
    title: 'A summer river',
    author: 'Yosa Buson',
    expectedForm: 'Haiku',
    expectedFit: 'high',
    text: `A summer river
crossed, how pleasing with sandals
in my hands`
  },

  // ===== LIMERICKS =====
  {
    title: 'There was an Old Man with a beard',
    author: 'Edward Lear',
    expectedForm: 'Limerick',
    expectedFit: 'high',
    text: `There was an Old Man with a beard,
Who said, "It is just as I feared!
Two Owls and a Hen,
Four Larks and a Wren,
Have all built their nests in my beard!"`
  },
  {
    title: 'There was a Young Lady',
    author: 'Edward Lear',
    expectedForm: 'Limerick',
    expectedFit: 'high',
    text: `There was a Young Lady of Norway,
Who casually sat in a doorway;
When the door squeezed her flat,
She exclaimed, "What of that?"
This courageous Young Lady of Norway.`
  },
  {
    title: 'Hickory Dickory Dock',
    author: 'Traditional',
    expectedForm: 'Limerick',
    expectedFit: 'medium',
    text: `Hickory dickory dock
The mouse ran up the clock
The clock struck one
The mouse ran down
Hickory dickory dock`
  },

  // ===== VILLANELLE =====
  {
    title: 'Do Not Go Gentle Into That Good Night',
    author: 'Dylan Thomas',
    expectedForm: 'Villanelle',
    expectedFit: 'high',
    text: `Do not go gentle into that good night,
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
Rage, rage against the dying of the light.`
  },

  // ===== BALLAD STANZA =====
  {
    title: 'Sir Patrick Spens (excerpt)',
    author: 'Anonymous',
    expectedForm: 'Ballad Stanza',
    expectedFit: 'high',
    text: `The king sits in Dumferling town,
Drinking the blood-red wine:
"O where will I get a good sailor,
To sail this ship of mine?"`
  },

  // ===== FREE VERSE =====
  {
    title: 'The Red Wheelbarrow',
    author: 'William Carlos Williams',
    expectedForm: 'Free Verse',
    expectedFit: 'high',
    text: `so much depends
upon
a red wheel
barrow
glazed with rain
water
beside the white
chickens`
  },
  {
    title: 'This Is Just To Say',
    author: 'William Carlos Williams',
    expectedForm: 'Free Verse',
    expectedFit: 'high',
    text: `I have eaten
the plums
that were in
the icebox
and which
you were probably
saving
for breakfast
Forgive me
they were delicious
so sweet
and so cold`
  }
];

describe('Poetic Form Detection', () => {
  describe('Shakespearean Sonnets', () => {
    const shakespeareanSonnets = testPoems.filter(p => p.expectedForm === 'Shakespearean Sonnet');

    shakespeareanSonnets.forEach((poem) => {
      it(`should detect "${poem.title}" as Shakespearean Sonnet`, () => {
        const result = detectPoetricForm(poem.text);
        console.log(`\n${poem.title}:`);
        console.log(`  Expected: ${poem.expectedForm} (${poem.expectedFit} fit)`);
        console.log(`  Got: ${result.form} (${result.fit} fit)`);
        if (result.issues) {
          console.log(`  Issues:`, result.issues);
        }
        console.log(`  Actual pattern: ${result.actualPattern}`);

        expect(result.form).toBe(poem.expectedForm);
        expect(['high', 'medium']).toContain(result.fit);
      });
    });
  });

  describe('Petrarchan Sonnets', () => {
    const petrarchanSonnets = testPoems.filter(p => p.expectedForm === 'Petrarchan Sonnet');

    petrarchanSonnets.forEach((poem) => {
      it(`should detect "${poem.title}" as Petrarchan Sonnet`, () => {
        const result = detectPoetricForm(poem.text);
        console.log(`\n${poem.title}:`);
        console.log(`  Expected: ${poem.expectedForm} (${poem.expectedFit} fit)`);
        console.log(`  Got: ${result.form} (${result.fit} fit)`);
        if (result.issues) {
          console.log(`  Issues:`, result.issues);
        }
        console.log(`  Actual pattern: ${result.actualPattern}`);

        expect(result.form).toBe(poem.expectedForm);
        expect(['high', 'medium']).toContain(result.fit);
      });
    });
  });

  describe('Haikus', () => {
    const haikus = testPoems.filter(p => p.expectedForm === 'Haiku');

    haikus.forEach((poem) => {
      it(`should detect "${poem.title}" as Haiku`, () => {
        const result = detectPoetricForm(poem.text);
        console.log(`\n${poem.title}:`);
        console.log(`  Expected: ${poem.expectedForm} (${poem.expectedFit} fit)`);
        console.log(`  Got: ${result.form} (${result.fit} fit)`);
        if (result.issues) {
          console.log(`  Issues:`, result.issues);
        }

        expect(result.form).toBe(poem.expectedForm);
        expect(['high', 'medium']).toContain(result.fit);
      });
    });
  });

  describe('Limericks', () => {
    const limericks = testPoems.filter(p => p.expectedForm === 'Limerick');

    limericks.forEach((poem) => {
      it(`should detect "${poem.title}" as Limerick`, () => {
        const result = detectPoetricForm(poem.text);
        console.log(`\n${poem.title}:`);
        console.log(`  Expected: ${poem.expectedForm} (${poem.expectedFit} fit)`);
        console.log(`  Got: ${result.form} (${result.fit} fit)`);
        if (result.issues) {
          console.log(`  Issues:`, result.issues);
        }
        console.log(`  Actual pattern: ${result.actualPattern}`);

        expect(result.form).toBe(poem.expectedForm);
      });
    });
  });

  describe('Villanelles', () => {
    const villanelles = testPoems.filter(p => p.expectedForm === 'Villanelle');

    villanelles.forEach((poem) => {
      it(`should detect "${poem.title}" as Villanelle`, () => {
        const result = detectPoetricForm(poem.text);
        console.log(`\n${poem.title}:`);
        console.log(`  Expected: ${poem.expectedForm} (${poem.expectedFit} fit)`);
        console.log(`  Got: ${result.form} (${result.fit} fit)`);
        if (result.issues) {
          console.log(`  Issues:`, result.issues);
        }
        console.log(`  Actual pattern: ${result.actualPattern}`);

        expect(result.form).toBe(poem.expectedForm);
      });
    });
  });

  describe('Ballad Stanzas', () => {
    const ballads = testPoems.filter(p => p.expectedForm === 'Ballad Stanza');

    ballads.forEach((poem) => {
      it(`should detect "${poem.title}" as Ballad Stanza`, () => {
        const result = detectPoetricForm(poem.text);
        console.log(`\n${poem.title}:`);
        console.log(`  Expected: ${poem.expectedForm} (${poem.expectedFit} fit)`);
        console.log(`  Got: ${result.form} (${result.fit} fit)`);
        if (result.issues) {
          console.log(`  Issues:`, result.issues);
        }
        console.log(`  Actual pattern: ${result.actualPattern}`);

        expect(result.form).toBe(poem.expectedForm);
      });
    });
  });

  describe('Free Verse', () => {
    const freeVerse = testPoems.filter(p => p.expectedForm === 'Free Verse');

    freeVerse.forEach((poem) => {
      it(`should detect "${poem.title}" as Free Verse`, () => {
        const result = detectPoetricForm(poem.text);
        console.log(`\n${poem.title}:`);
        console.log(`  Expected: ${poem.expectedForm} (${poem.expectedFit} fit)`);
        console.log(`  Got: ${result.form} (${result.fit} fit)`);

        expect(result.form).toBe(poem.expectedForm);
      });
    });
  });
});

// Export test poems for manual testing
export { testPoems };
