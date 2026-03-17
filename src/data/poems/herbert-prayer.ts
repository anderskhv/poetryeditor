import { PoemAnalysis } from './index';

export const prayer: PoemAnalysis = {
  slug: 'herbert-prayer',
  title: 'Prayer (I)',
  poet: 'George Herbert',
  poetBirth: 1593,
  poetDeath: 1633,
  year: 1633,
  collection: 'The Temple',
  form: 'Sonnet',
  text: `Prayer the Churches banquet, Angels age,
Gods breath in man returning to his birth,
The soul in paraphrase, heart in pilgramage,
The Christian plummet sounding heav'n and earth;
Engine against th'Almightie, sinners towre,
Reversed thunder, Christ-side-piercing spear,
The six-daies world-transposing in an houre,
A kinde of tune, which all things heare and fear;
Softnesse, and peace, and joy, and love, and blisse,
Exalted Manna, gladnesse of the best,
Heaven in ordinarie, man well drest,
The milkie way, the bird of Paradise,
Church-bels beyond the starres heard, the souls bloud,
The land of spices; something understood.`,
  analysis: {
    overview: `"Prayer (I)" is a sonnet that contains no main verb. That's the first thing to notice and the last thing to understand. Herbert attempts to define prayer and produces twenty-seven metaphors in fourteen lines without ever completing a sentence. The poem is a list that never resolves into a statement—which is exactly the point. Prayer can be described but not defined. Every metaphor reaches toward it and falls short, so Herbert keeps reaching.

The metaphors range across extraordinary territory. Prayer is domestic ("the Churches banquet"), violent ("Engine against th'Almightie," "Christ-side-piercing spear"), cosmic ("The milkie way"), sensory ("Softnesse, and peace, and joy"), and ultimately humble ("something understood"). That final phrase—"something understood"—lands with devastating simplicity after thirteen lines of baroque imagery. It's as if Herbert exhausts every extravagant comparison and then admits that prayer, in the end, is just a moment of genuine comprehension between a person and God.

The poem also works as a miniature theology. Prayer moves through different relationships with the divine: it's worship (banquet, manna), it's warfare (engine, tower, reversed thunder), it's transformation (the six-day creation compressed into an hour), and finally it's intimacy (something understood). Herbert doesn't choose between these—he insists that prayer is all of them simultaneously. The absence of a verb means there's no hierarchy, no "prayer IS this rather than that." It's everything at once, and the reader must hold all twenty-seven definitions in mind together.`,
    lineByLine: [
      {
        lines: '1-4',
        commentary: `Four metaphors in rapid succession. "The Churches banquet" makes prayer communal and nourishing—a feast, not a chore. "Angels age" is mysterious: does prayer last as long as angels live, or is it what angels experience as time? "Gods breath in man returning to his birth" is theological precision—God breathed life into Adam (Genesis 2:7), and prayer is that breath returning to its source. "The soul in paraphrase" is extraordinary: prayer is the soul restating itself in different words, trying to express what it cannot say directly. "Heart in pilgramage" makes prayer a journey, not a destination. "The Christian plummet sounding heav'n and earth" uses a nautical image—a plumb line measuring depth—to suggest prayer measures the distance between heaven and earth.`
      },
      {
        lines: '5-8',
        commentary: `The metaphors turn violent. "Engine against th'Almightie" makes prayer a siege weapon aimed at God—an astonishing image that suggests prayer can move the immovable. "Sinners towre" recalls the Tower of Babel, but here the tower is prayer itself, sinners reaching upward. "Reversed thunder" inverts the direction of divine power: God thunders down, and prayer thunders back up. "Christ-side-piercing spear" references the soldier's lance at the crucifixion (John 19:34)—prayer pierces Christ as the spear did, reaching into the heart of God. Then the tone shifts: "The six-daies world-transposing in an houre" says prayer compresses all of creation into a single hour of experience. "A kinde of tune, which all things heare and fear" makes prayer into music that the entire cosmos responds to.`
      },
      {
        lines: '9-12',
        commentary: `After the violence, a cascade of gentleness. "Softnesse, and peace, and joy, and love, and blisse"—five abstract nouns connected by "and," as if Herbert is listing everything good and finding that prayer contains all of it. "Exalted Manna" recalls the food God sent to the Israelites in the wilderness (Exodus 16), but lifted higher—spiritual sustenance beyond physical survival. "Gladnesse of the best" suggests the joy of the saints or the elect. "Heaven in ordinarie" is a pun: "ordinary" was the term for a regular meal at a fixed price, so heaven becomes available as a daily meal, not a special occasion. "Man well drest" continues the domestic imagery—prayer is simply a person properly prepared. Then the images expand outward: "The milkie way" makes prayer cosmic, and "the bird of Paradise" links it to the exotic and the unfallen.`
      },
      {
        lines: '13-14',
        commentary: `The closing couplet delivers two final images and the poem's resolution. "Church-bels beyond the starres heard" sends the sound of earthly worship past the edge of the universe—prayer reaches further than light. "The souls bloud" makes prayer as essential to the soul as blood is to the body—it's what keeps the soul alive. "The land of spices" evokes the Song of Solomon and the exotic richness of the divine encounter. And then: "something understood." After twenty-six extravagant metaphors, Herbert lands on the simplest possible phrase. The word "something" is deliberately vague—after all that reaching, prayer turns out to be not a grand spectacle but a quiet moment of mutual understanding. The semicolon before it creates a pause that makes the ending feel like arrival after a long journey.`
      }
    ],
    themes: [
      'The inadequacy of language to capture spiritual experience',
      'Prayer as simultaneously violent and gentle',
      'The relationship between the domestic and the cosmic',
      'Definition through accumulation rather than precision',
      'Prayer as communion, warfare, and intimacy',
      'The compression of infinite meaning into finite form',
      'Simplicity as the destination of complexity',
      'The body and the soul as parallel systems'
    ],
    literaryDevices: [
      {
        device: 'Catalogue (Asyndetic List)',
        example: '"Softnesse, and peace, and joy, and love, and blisse"',
        explanation: 'Herbert piles metaphor upon metaphor without a governing verb. The accumulation itself becomes the meaning—prayer is too many things to be captured in a single definition, so the poem becomes a flood of attempts.'
      },
      {
        device: 'Metaphor (Sustained)',
        example: '"Gods breath in man returning to his birth"',
        explanation: 'Each of the twenty-seven metaphors stands alone, but together they form a sustained attempt to triangulate something that resists direct statement. No single metaphor is adequate; their multiplicity is the point.'
      },
      {
        device: 'Paradox',
        example: '"Engine against th\'Almightie"',
        explanation: 'A siege engine aimed at the Almighty—how can a finite creature assault the infinite? The paradox captures the audacity of prayer: a human addressing the creator of the universe and expecting to be heard.'
      },
      {
        device: 'Oxymoron',
        example: '"Reversed thunder"',
        explanation: 'Thunder comes from above; reversing it means sending power upward from below. Prayer becomes the human counterpart to divine force—the same energy moving in the opposite direction.'
      },
      {
        device: 'Anticlimax (Deliberate)',
        example: '"something understood"',
        explanation: 'After thirteen lines of cosmic, violent, and ecstatic imagery, the poem ends with the most modest phrase possible. The anticlimax is the poem\'s deepest statement: prayer is not spectacle but comprehension.'
      },
      {
        device: 'Absent Verb (Verbless Sonnet)',
        example: 'The entire poem contains no main verb',
        explanation: 'By constructing a sonnet without a predicate, Herbert makes prayer something that cannot be reduced to action or being. It simply IS all of these metaphors at once, without the grammar to rank them.'
      },
      {
        device: 'Biblical Allusion',
        example: '"Exalted Manna," "Christ-side-piercing spear"',
        explanation: 'Herbert draws on Exodus (manna), Genesis (six days of creation), John (the piercing of Christ\'s side), and the Song of Solomon (land of spices), layering the poem with scriptural resonance that a seventeenth-century congregation would have recognized immediately.'
      }
    ],
    historicalContext: `Herbert wrote "Prayer (I)" as part of The Temple, published posthumously in 1633, the year of his death. Herbert was an Anglican priest who had given up a promising political career (he was Public Orator at Cambridge and had connections at court) to serve a small rural parish in Bemerton, Wiltshire. The Temple was enormously influential—it went through thirteen editions by 1709 and shaped devotional poetry for generations. Herbert's approach to religious poetry was distinctive: he used homely, everyday images (banquets, dressing, church bells) alongside grand theological concepts, insisting that the sacred is present in the ordinary. "Prayer (I)" is sometimes considered the greatest short poem in English on the subject of prayer, and its final phrase—"something understood"—has become one of the most quoted lines in devotional literature.`,
  },
  seoDescription: 'Analysis of George Herbert\'s "Prayer (I)" from The Temple. Line-by-line commentary on this verbless sonnet that defines prayer through twenty-seven metaphors, culminating in the devastating simplicity of "something understood."',
  abstractWords: ['prayer', 'softnesse', 'peace', 'blisse', 'love'],
  rhymingPairs: [
    { word1: 'age', word2: 'pilgramage' },
    { word1: 'birth', word2: 'earth' },
    { word1: 'blisse', word2: 'Paradise' },
    { word1: 'drest', word2: 'best' },
    { word1: 'bloud', word2: 'understood' }
  ],
};
