import { PoemAnalysis } from './index';

// Source: The Prophet (1923) by Kahlil Gibran - Public Domain
// Full text available at Project Gutenberg: https://www.gutenberg.org/ebooks/58585

export const onLove: PoemAnalysis = {
  slug: 'on-love',
  title: 'On Love',
  poet: 'Kahlil Gibran',
  poetBirth: 1883,
  poetDeath: 1931,
  year: 1923,
  collection: 'The Prophet',
  form: 'Prose Poetry',
  text: `Then said Almitra, Speak to us of Love.
And he raised his head and looked upon the people, and there fell a stillness upon them. And with a great voice he said:
When love beckons to you, follow him,
Though his ways are hard and steep.
And when his wings enfold you yield to him,
Though the sword hidden among his pinions may wound you.
And when he speaks to you believe in him,
Though his voice may shatter your dreams
as the north wind lays waste the garden.

For even as love crowns you so shall he crucify you.
Even as he is for your growth so is he for your pruning.
Even as he ascends to your height and caresses your tenderest branches that quiver in the sun,
So shall he descend to your roots and shake them in their clinging to the earth.`,
  analysis: {
    overview: `"On Love" is one of the most celebrated sections of Kahlil Gibran's masterwork "The Prophet." Written in prose poetry form, it presents love not as simple romantic feeling but as a transformative spiritual force that demands total surrender. The speaker, Almustafa, responds to Almitra's request with imagery that emphasizes love's dual nature—its capacity for both tenderness and pain.`,
    lineByLine: [
      {
        lines: '1-2',
        commentary: `The frame narrative establishes the setting: Almitra asks about love, and Almustafa's response commands such reverence that "there fell a stillness" upon the crowd. This silence signals the weight of what follows.`
      },
      {
        lines: '3-4',
        commentary: `"When love beckons to you, follow him" — Love is personified as a guide whose path is "hard and steep." The imperative "follow" suggests love is not optional but a calling one must answer.`
      },
      {
        lines: '5-6',
        commentary: `The image of love's "wings" enfolding the beloved is tender, yet Gibran immediately introduces the paradox: a "sword hidden among his pinions." Love offers embrace and wounding simultaneously.`
      },
      {
        lines: '7-9',
        commentary: `Love's voice "may shatter your dreams as the north wind lays waste the garden." This striking simile presents love as destructive of illusions—what we thought we wanted may be swept away by love's truth.`
      },
      {
        lines: '10-11',
        commentary: `"Love crowns you" and "crucify you" — The crown/crucifixion parallel invokes Christ imagery, suggesting love involves both exaltation and suffering, glory and sacrifice.`
      },
      {
        lines: '12-14',
        commentary: `The agricultural metaphor of growth and pruning presents love as a gardener. The same force that helps you reach toward the sun will also cut away what doesn't serve your becoming.`
      }
    ],
    themes: [
      'The transformative power of love',
      'Surrender and vulnerability',
      'Pain as path to growth',
      'Love as spiritual awakening',
      'The paradox of tenderness and suffering'
    ],
    literaryDevices: [
      {
        device: 'Personification',
        example: '"When love beckons to you, follow him"',
        explanation: 'Love is given human qualities—beckoning, speaking, having wings—making the abstract tangible.'
      },
      {
        device: 'Paradox',
        example: '"even as love crowns you so shall he crucify you"',
        explanation: 'Gibran pairs opposites to show love contains contradictions: crown/crucify, growth/pruning.'
      },
      {
        device: 'Extended Metaphor',
        example: 'The gardener/plant imagery throughout',
        explanation: 'Love as gardener tends, prunes, and cultivates the beloved, who is the growing plant.'
      },
      {
        device: 'Anaphora',
        example: '"And when... And when... And when..."',
        explanation: 'Repetition of structure creates incantatory rhythm, like sacred instruction.'
      }
    ],
    historicalContext: `Written in 1923 while Gibran lived in New York, "The Prophet" emerged from his dual Lebanese-American identity and drew on both Christian mysticism and Sufi Islamic traditions. The book became a phenomenon of the 1960s counterculture and remains one of the best-selling poetry books in history.`
  },
  seoDescription: 'Read and analyze "On Love" from Kahlil Gibran\'s The Prophet. Line-by-line analysis, themes, literary devices, and historical context of this beloved prose poem about love\'s transformative power.'
};
