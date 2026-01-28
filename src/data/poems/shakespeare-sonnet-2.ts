import { PoemAnalysis } from './index';

// Source: Project Gutenberg - Public Domain

export const sonnet2: PoemAnalysis = {
  slug: 'sonnet-2',
  title: 'Sonnet 2: When forty winters shall besiege thy brow',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `When forty winters shall besiege thy brow,
And dig deep trenches in thy beauty's field,
Thy youth's proud livery so gazed on now,
Will be a tatter'd weed of small worth held:
Then being asked, where all thy beauty lies,
Where all the treasure of thy lusty days;
To say, within thine own deep sunken eyes,
Were an all-eating shame, and thriftless praise.
How much more praise deserv'd thy beauty's use,
If thou couldst answer 'This fair child of mine
Shall sum my count, and make my old excuse,'
Proving his beauty by succession thine!
This were to be new made when thou art old,
And see thy blood warm when thou feel'st it cold.`,
  analysis: {
    overview: `Sonnet 2 continues the procreation argument with military and financial metaphors. Time is an army besieging beauty; wrinkles are trenches dug in a battlefield. The youth's current beauty is "livery" (a servant's uniform) that will become a "tattered weed." Shakespeare's argument: your only answer to "where did your beauty go?" should be "into my child." Without offspring, beauty is wasted capital earning no interest.`,
    lineByLine: [
      {
        lines: '1-4',
        commentary: `"Forty winters" ages the youth to middle age. Time "besieges" and digs "trenches"—warfare imagery for aging. "Proud livery" (fine uniform) becomes "tattered weed" (worn-out clothes). Beauty is clothing that wears out.`
      },
      {
        lines: '5-8',
        commentary: `A future interrogation: where did your beauty go? To answer "in my sunken eyes" is shameful. "Thriftless praise"—praising yourself without profit. The financial language continues: beauty should earn returns.`
      },
      {
        lines: '9-12',
        commentary: `The better answer: "This fair child of mine / Shall sum my count." The child is the ledger entry that balances your account. "Succession" is both inheritance and the sequence of generations.`
      },
      {
        lines: '13-14',
        commentary: `"New made when thou art old"—the child renews you. "See thy blood warm when thou feel'st it cold"—your bloodline stays warm even as you grow cold. Life continues through lineage.`
      }
    ],
    themes: [
      'Time as military aggressor',
      'Beauty as depreciating asset',
      'Procreation as financial wisdom',
      'The body as battlefield',
      'Legacy through children'
    ],
    literaryDevices: [
      {
        device: 'Military Metaphor',
        example: '"besiege," "trenches," "field"',
        explanation: 'Aging becomes warfare—time attacks, beauty is the territory being conquered.'
      },
      {
        device: 'Financial Language',
        example: '"treasure," "sum my count," "thriftless"',
        explanation: 'Beauty treated as capital that must be invested in children to avoid loss.'
      },
      {
        device: 'Clothing Metaphor',
        example: '"livery," "tattered weed"',
        explanation: 'Youth is a fine uniform that becomes rags—beauty as temporary costume.'
      }
    ],
    historicalContext: `Part of the "procreation sonnets" (1-17) urging the Fair Youth to marry. The financial metaphors reflect Renaissance concerns with inheritance and estate management. "Forty winters" was considered old age in the period.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 2 "When forty winters shall besiege thy brow" - the procreation sonnet using military and financial metaphors for aging.'
};
