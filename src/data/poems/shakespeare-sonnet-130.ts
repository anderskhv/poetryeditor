import { PoemAnalysis } from './index';

export const sonnet130: PoemAnalysis = {
  slug: 'sonnet-130',
  title: 'Sonnet 130: My mistress\' eyes are nothing like the sun',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `My mistress' eyes are nothing like the sun;
Coral is far more red than her lips' red;
If snow be white, why then her breasts are dun;
If hairs be wires, black wires grow on her head.
I have seen roses damasked, red and white,
But no such roses see I in her cheeks;
And in some perfumes is there more delight
Than in the breath that from my mistress reeks.
I love to hear her speak, yet well I know
That music hath a far more pleasing sound;
I grant I never saw a goddess go;
My mistress, when she walks, treads on the ground:
And yet, by heaven, I think my love as rare
As any she belied with false compare.`,
  analysis: {
    overview: `Sonnet 130 is a demolition of Petrarchan clichés. Every line denies the conventional comparisons: her eyes aren't like the sun, her lips aren't coral, her skin isn't snow-white. This sounds like insult, but it's actually a more radical claim: real women are better than imaginary ideals. The "Dark Lady" exists in a body that "treads on the ground" and has breath that "reeks" (just means "emanates," but still). Shakespeare's point is that love based on false comparisons is itself false. His love is "rare" precisely because it sees clearly. But there's unease here—the praise is backhanded, and the lady might not appreciate being told her breasts are "dun" (grayish-brown).`,
    lineByLine: [
      {
        lines: '1-4',
        commentary: `A catalog of denials. Not: sun, coral, snow, gold wire (a common Petrarchan comparison for hair). Each line takes a cliché and rejects it. "Black wires grow on her head"—the Dark Lady's dark hair, but also deliberately unflattering. The anti-blazon (describing a woman by what she isn't) is aggressive.`
      },
      {
        lines: '5-8',
        commentary: `More denials: no roses in her cheeks, her breath isn't perfume. "Reeks" in Shakespeare's time meant "emanates" without negative connotation, but the word still surprises. The comparisons are all sensory: sight, smell. He's emphasizing her physical reality against poetic fantasy.`
      },
      {
        lines: '9-12',
        commentary: `Now sound and motion. Her voice isn't music, her walk isn't divine. "I grant I never saw a goddess go"—admission that he's comparing against things he's never seen. "Treads on the ground"—she's earthbound, mortal. This should be obvious, but poetry often forgets it.`
      },
      {
        lines: '13-14',
        commentary: `The pivot: "And yet, by heaven." After twelve lines of what she isn't, he declares his love "as rare / As any she belied with false compare." "Belied" means misrepresented. Women described with false comparisons are betrayed by those lies. His honest description is the real compliment—or so he claims.`
      }
    ],
    themes: [
      'Anti-Petrarchan satire',
      'Real versus idealized beauty',
      'Honesty in love',
      'The limits of poetic convention',
      'Dark Lady as contrast to Fair Youth'
    ],
    literaryDevices: [
      {
        device: 'Anti-blazon',
        example: 'The entire poem',
        explanation: 'A blazon catalogs a woman\'s beautiful parts; an anti-blazon denies each convention, creating beauty through negation.'
      },
      {
        device: 'Litotes',
        example: '"nothing like the sun"',
        explanation: 'Understatement through negation—saying what something isn\'t rather than what it is.'
      },
      {
        device: 'Irony',
        example: '"I think my love as rare"',
        explanation: 'The poem pretends to criticize but actually praises—the insults become compliments by rejecting false standards.'
      }
    ],
    historicalContext: `The "Dark Lady" appears in sonnets 127-154 and represents a radical break from the Fair Youth. She's married, sexually active, unfaithful, and dark-complexioned in an era that prized fair skin. Her identity is unknown—candidates include Emilia Lanier, Mary Fitton, and others. This sonnet parodies the Petrarchan tradition of impossibly idealized women, which had become cliché by the 1590s.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 130 "My mistress\' eyes are nothing like the sun" - the famous anti-Petrarchan poem about the Dark Lady and honest love.'
};
