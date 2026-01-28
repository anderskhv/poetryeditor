import { PoemAnalysis } from './index';

// Source: Scribner's Magazine (1875, written c. 1829) - Public Domain

export const alone: PoemAnalysis = {
  slug: 'alone',
  title: 'Alone',
  poet: 'Edgar Allan Poe',
  poetBirth: 1809,
  poetDeath: 1849,
  year: 1829,
  collection: 'Uncollected',
  form: 'Lyric Poem',
  text: `From childhood's hour I have not been
As others were—I have not seen
As others saw—I could not bring
My passions from a common spring—
From the same source I have not taken
My sorrow—I could not awaken
My heart to joy at the same tone—
And all I lov'd—I lov'd alone—
Then—in my childhood—in the dawn
Of a most stormy life—was drawn
From ev'ry depth of good and ill
The mystery which binds me still—
From the torrent, or the fountain—
From the red cliff of the mountain—
From the sun that round me roll'd
In its autumn tint of gold—
From the lightning in the sky
As it pass'd me flying by—
From the thunder, and the storm—
And the cloud that took the form
(When the rest of Heaven was blue)
Of a demon in my view—`,
  analysis: {
    overview: `Poe wrote this at around 20 years old, and it reads like a manifesto of alienation. The poem's argument: I have always been fundamentally different from other people. My joys, sorrows, and perceptions come from a different source. This isn't teenage melodrama—or rather, it is, but it's also accurate prophecy. Poe would spend his life as an outsider: orphaned, expelled from West Point, poor, addicted, married to his cousin, writing tales of madness. The poem ends with a cloud shaped like a demon—alone in a blue sky, just as Poe felt alone among ordinary people. That demon isn't external threat; it's his own strange vision that sets him apart.`,
    lineByLine: [
      {
        lines: '1-4',
        commentary: `Four parallel negations: not been as others, not seen as others, could not bring passions from a common spring. Poe insists on absolute difference—not partial, not occasional, but fundamental. "Common spring" suggests shared humanity; his passions come from elsewhere.`
      },
      {
        lines: '5-8',
        commentary: `More negations. His sorrow has a different source; his joy doesn't respond to the same triggers. "And all I lov'd—I lov'd alone"—the climactic line. He loves, but his love isolates rather than connects. Even in loving he's solitary.`
      },
      {
        lines: '9-12',
        commentary: `"The dawn / Of a most stormy life"—Poe was orphaned by age 3, making "stormy" literal biography. "From ev'ry depth of good and ill"—he drew from extremes, not the middle. "The mystery which binds me still"—at 20, he knows something grips him that he can't name.`
      },
      {
        lines: '13-16',
        commentary: `A list of natural sources: torrent, fountain, red cliff, autumnal sun. These are where he found his mystery. Nature speaks to him—but notice the elements are dramatic, not gentle. Torrents and cliffs, not meadows and streams.`
      },
      {
        lines: '17-22',
        commentary: `Lightning, thunder, storm—escalating intensity. Then the final image: a cloud shaped like a demon against blue sky. Everyone else sees ordinary sky; he sees a demon. "In my view"—only he perceives this. The demon is his alone, like everything else.`
      }
    ],
    themes: [
      'Fundamental alienation from humanity',
      'The artist as outsider',
      'Nature as source of dark inspiration',
      'Childhood as origin of difference',
      'Isolation as identity'
    ],
    literaryDevices: [
      {
        device: 'Anaphora',
        example: '"From the torrent... From the red cliff... From the sun..."',
        explanation: 'The repeated "From" creates a litany of sources. Poe lists where his mystery came from, building through accumulation.'
      },
      {
        device: 'Parallel Negation',
        example: '"I have not been / As others were—I have not seen / As others saw"',
        explanation: 'Poe structures the opening as a series of denials. He defines himself by what he is not—by his difference from the norm.'
      },
      {
        device: 'Pathetic Fallacy',
        example: 'The demon-shaped cloud',
        explanation: 'Nature reflects (or creates) his inner state. The cloud becomes demonic because that\'s how his perception works—he sees darkness where others see sky.'
      },
      {
        device: 'Couplet Form',
        example: 'Throughout: been/seen, bring/spring, taken/awaken',
        explanation: 'The tight rhyming couplets create an almost obsessive sonic regularity, contrasting with the content about being irregular and different.'
      },
      {
        device: 'Truncated Ending',
        example: '"Of a demon in my view—"',
        explanation: 'The poem ends on a dash, mid-thought. It doesn\'t conclude; it breaks off. The demon remains unresolved, the mystery unexplained.'
      }
    ],
    historicalContext: `Poe wrote this around 1829, when he was about 20. It wasn't published in his lifetime—it appeared in 1875, decades after his death. The poem was found in an album belonging to Lucy Holmes, a Baltimore woman. Some scholars questioned its authenticity, but handwriting analysis confirmed it as Poe's. The autobiographical reading is strong: Poe's parents were traveling actors; his father abandoned the family; his mother died when he was 2; he was taken in (but never legally adopted) by John Allan; he was constantly in conflict with his foster father. "Stormy life" barely covers it.`
  },
  seoDescription: 'Analysis of Edgar Allan Poe\'s "Alone." A line-by-line examination of Poe\'s early lyric manifesto declaring his fundamental alienation from ordinary humanity and the sources of his dark vision.'
};
