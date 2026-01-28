import { PoemAnalysis } from './index';

export const sonnet1: PoemAnalysis = {
  slug: 'sonnet-1',
  title: 'Sonnet 1: From fairest creatures we desire increase',
  poet: 'William Shakespeare',
  poetBirth: 1564,
  poetDeath: 1616,
  year: 1609,
  collection: "Shakespeare's Sonnets",
  form: 'Shakespearean Sonnet',
  text: `From fairest creatures we desire increase,
That thereby beauty's rose might never die,
But as the riper should by time decease,
His tender heir might bear his memory:
But thou, contracted to thine own bright eyes,
Feed'st thy light's flame with self-substantial fuel,
Making a famine where abundance lies,
Thyself thy foe, to thy sweet self too cruel.
Thou that art now the world's fresh ornament
And only herald to the gaudy spring,
Within thine own bud buriest thy content
And, tender churl, makest waste in niggarding.
Pity the world, or else this glutton be,
To eat the world's due, by the grave and thee.`,
  analysis: {
    overview: `Sonnet 1 opens the entire sequence with a command disguised as philosophy: have children. Shakespeare addresses a beautiful young man (the "Fair Youth") and argues that refusing to reproduce is a form of self-cannibalism. The poem's real argument isn't about biology—it's about narcissism. The youth is "contracted to thine own bright eyes," meaning he's in love with himself. Shakespeare will spend the first 17 sonnets trying to convince him that self-love, taken to its logical end, is self-destruction. The irony: Shakespeare himself never married for love (as far as we know), and his own children didn't continue his legacy—his poems did.`,
    lineByLine: [
      {
        lines: '1-4',
        commentary: `"From fairest creatures we desire increase"—we want beautiful things to reproduce. The "rose" is beauty itself. But notice "riper should by time decease"—even the word "riper" suggests both maturity and decay. The "tender heir" carries memory forward. This sounds like general wisdom, but it's aimed at one specific person.`
      },
      {
        lines: '5-8',
        commentary: `The turn comes early. "But thou"—you specifically—are doing the opposite. "Contracted to thine own bright eyes" means legally bound to yourself, like a marriage contract. You're burning your own substance as fuel. The oxymorons pile up: "famine where abundance lies," "thy foe, to thy sweet self." Self-love becomes self-destruction.`
      },
      {
        lines: '9-12',
        commentary: `"The world's fresh ornament"—you're the most beautiful thing in the world right now. "Only herald to the gaudy spring"—you announce spring's arrival but don't participate in its fertility. "Buriest thy content" means both burying your satisfaction and burying what you contain (your potential children). "Tender churl" is another oxymoron: gentle miser.`
      },
      {
        lines: '13-14',
        commentary: `The couplet offers a stark choice: "Pity the world" by having children, or be a "glutton" who eats what the world deserves. The grave will take you anyway; the question is whether you'll have given anything back first. "By the grave and thee"—you and death are collaborators in this consumption.`
      }
    ],
    themes: [
      'Procreation as moral duty',
      'Narcissism as self-destruction',
      'Beauty as debt owed to the world',
      'Time as inevitable decay',
      'Self-love versus generative love'
    ],
    literaryDevices: [
      {
        device: 'Oxymoron',
        example: '"tender churl," "sweet self too cruel"',
        explanation: 'Pairing contradictory terms emphasizes the paradox of self-love: what seems nurturing is actually destructive.'
      },
      {
        device: 'Extended Metaphor',
        example: 'Financial/contractual language throughout',
        explanation: '"Contracted," "niggarding," "waste," "due"—beauty is treated as capital that must be invested, not hoarded.'
      },
      {
        device: 'Personification',
        example: '"beauty\'s rose"',
        explanation: 'Beauty becomes a living thing that can die, making the stakes feel biological rather than abstract.'
      }
    ],
    historicalContext: `This is the opening salvo of the "procreation sonnets" (1-17), likely commissioned by the young man's family to encourage him to marry and produce an heir. The identity of the "Fair Youth" is debated—candidates include Henry Wriothesley (Earl of Southampton) and William Herbert (Earl of Pembroke). The economic language reflects Renaissance anxiety about lineage and inheritance.`
  },
  seoDescription: 'Analysis of Shakespeare\'s Sonnet 1 "From fairest creatures we desire increase" - the opening poem urging the Fair Youth to have children and defeat time through procreation.'
};
