import { PoemAnalysis } from './index';

// Source: Public domain (Hopkins died 1889)

export const godsGrandeur: PoemAnalysis = {
  slug: 'gods-grandeur',
  title: 'God\'s Grandeur',
  poet: 'Gerard Manley Hopkins',
  poetBirth: 1844,
  poetDeath: 1889,
  year: 1877,
  form: 'Petrarchan sonnet in sprung rhythm (iambic pentameter base with frequent extra stresses)',
  text: `The world is charged with the grandeur of God.
It will flame out, like shining from shook foil;
It gathers to a greatness, like the ooze of oil
Crushed. Why do men then now not reck his rod?
Generations have trod, have trod, have trod;
And all is seared with trade; bleared, smeared with toil;
And wears man's smudge and shares man's smell: the soil
Is bare now, nor can foot feel, being shod.

And for all this, nature is never spent;
There lives the dearest freshness deep down things;
And though the last lights off the black West went
Oh, morning, at the brown brink eastward, springs —
Because the Holy Ghost over the bent
World broods with warm breast and with ah! bright wings.`,
  analysis: {
    overview: `Hopkins's sonnet asserts that God's grandeur saturates the physical world — it "flames out" and "gathers to a greatness" — yet humanity has blunted its capacity to perceive this through industrialization and spiritual neglect. The sestet answers with hope: nature renews itself endlessly because the Holy Ghost broods over creation like a bird warming the world back to life.`,
    lineByLine: [
      { lines: '1-4', commentary: `The opening declaration is electric: the world is "charged" — both filled and electrified. Two similes follow: God's grandeur flames out "like shining from shook foil" (Hopkins meant gold foil, which scatters light in all directions) and "gathers to a greatness, like the ooze of oil / Crushed" — slow, concentrated, inevitable. Then the turn: "Why do men then now not reck his rod?"` },
      { lines: '5-8', commentary: `"Have trod, have trod, have trod" — the repetition is exhausting, mimicking the monotony of industrial labor. The octave's second half is a litany of damage: "seared," "bleared," "smeared." The soil is "bare" and feet can't feel it through shoes. Industrialized humanity has insulated itself from creation.` },
      { lines: '9-12', commentary: `The Petrarchan volta: "And for all this, nature is never spent." Despite everything, "the dearest freshness deep down things" persists. The image of dawn — "morning, at the brown brink eastward, springs" — enacts renewal in its very syntax, the verb springing at the line's end.` },
      { lines: '13-14', commentary: `The closing image: the Holy Ghost broods "with warm breast and with ah! bright wings" over the "bent / World." The bird-like brooding recalls Genesis 1:2 (the Spirit moving over the waters) and transforms the damaged world into an egg being warmed back to life. The exclamatory "ah!" is pure Hopkins — ecstatic interruption.` }
    ],
    themes: ['God\'s presence in the natural world', 'Industrial damage to creation', 'Perpetual renewal of nature', 'The Holy Spirit as sustainer'],
    literaryDevices: [
      { device: 'Sprung rhythm', example: 'Generations have trod, have trod, have trod', explanation: 'Hopkins\'s signature technique: counting stresses rather than syllables, creating a speech-like intensity. The triple "have trod" piles three stresses together.' },
      { device: 'Alliteration and assonance', example: 'seared with trade; bleared, smeared with toil', explanation: 'The internal rhymes and repeated "-eared" sounds create a sense of accumulating damage, each word smearing into the next.' },
      { device: 'Simile', example: 'like shining from shook foil', explanation: 'Gold foil shaken catches and scatters light unpredictably — God\'s grandeur flashes out in sudden, scattered revelations across creation.' },
      { device: 'Imagery (brooding bird)', example: 'the Holy Ghost over the bent / World broods with warm breast', explanation: 'The Holy Spirit as a bird warming an egg transforms the damaged world into something gestating new life — creation is never finished.' }
    ],
    historicalContext: `Written in 1877 while Hopkins was studying theology at St Beuno's in Wales, during one of his most productive periods. Hopkins was a Jesuit priest who had burned his earlier poetry upon entering the order, only resuming composition in 1875. "God's Grandeur" reflects both his sacramental vision of nature (influenced by Duns Scotus's "inscape") and his horror at Victorian industrialization. The poem was not published until 1918, nearly thirty years after his death.`
  },
  seoDescription: 'God\'s Grandeur by Gerard Manley Hopkins - analysis of the 1877 sonnet on divine presence in nature and industrial desecration.'
};
