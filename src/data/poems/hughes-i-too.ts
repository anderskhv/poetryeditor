import { PoemAnalysis } from './index';

// Source: Public domain (published 1926)

export const iToo: PoemAnalysis = {
  slug: 'i-too',
  title: 'I, Too',
  poet: 'Langston Hughes',
  poetBirth: 1901,
  poetDeath: 1967,
  year: 1926,
  collection: 'The Weary Blues',
  form: 'Free verse',
  text: `I, too, sing America.

I am the darker brother.
They send me to eat in the kitchen
When company comes,
But I laugh,
And eat well,
And grow strong.

Tomorrow,
I'll be at the table
When company comes.
Nobody'll dare
Say to me,
"Eat in the kitchen,"
Then.

Besides,
They'll see how beautiful I am
And be ashamed—

I, too, am America.`,
  analysis: {
    overview: 'Hughes answers Walt Whitman\'s "I Hear America Singing" by asserting that Black Americans are equally part of the national song. The poem moves from present exclusion through defiant strength to a prophetic vision of future inclusion.',
    lineByLine: [
      { lines: '1', commentary: 'The opening line echoes and revises Whitman. The comma after "too" is deliberate — it insists on inclusion rather than requesting it. "Sing" connects to Whitman\'s celebration of American voices.' },
      { lines: '2-7', commentary: 'The "darker brother" is sent to the kitchen when guests arrive — a domestic metaphor for racial segregation. But the speaker\'s response is not bitterness: he laughs, eats well, and grows strong. The oppression is acknowledged but not internalized.' },
      { lines: '8-14', commentary: '"Tomorrow" shifts to prophecy. The speaker will sit at the table — not by permission but by right. "Nobody\'ll dare" carries both confidence and implicit warning.' },
      { lines: '15-17', commentary: 'The pivot to beauty and shame. The oppressors will recognize what they excluded, and shame will be theirs, not his.' },
      { lines: '18', commentary: 'The closing line drops "sing" — the speaker doesn\'t just sing America, he IS America. The shift from verb to noun is the poem\'s most powerful move.' }
    ],
    themes: ['Racial equality', 'American identity', 'Defiance and dignity', 'Prophetic vision', 'Exclusion and belonging'],
    literaryDevices: [
      { device: 'Allusion', example: 'I, too, sing America', explanation: 'Direct response to Walt Whitman\'s "I Hear America Singing," inserting Black voices into Whitman\'s democratic vision.' },
      { device: 'Metaphor', example: 'They send me to eat in the kitchen', explanation: 'The kitchen represents all the spaces of exclusion — Jim Crow laws, segregated facilities, social invisibility.' },
      { device: 'Volta', example: 'Tomorrow, / I\'ll be at the table', explanation: 'The poem turns from present tense endurance to future tense prophecy, shifting the power dynamic entirely.' },
      { device: 'Parallelism', example: 'I, too, sing America... I, too, am America', explanation: 'The shift from "sing" to "am" between the opening and closing lines elevates the claim from participation to identity.' }
    ],
    historicalContext: 'Published in 1926 during the height of the Harlem Renaissance, the poem directly challenges the exclusion of Black voices from the American literary and cultural canon. It remains one of the most frequently anthologized poems in American literature.'
  },
  seoDescription: 'I, Too by Langston Hughes — full text and analysis of this powerful Harlem Renaissance poem asserting Black American identity, responding to Walt Whitman\'s vision of America.'
};
