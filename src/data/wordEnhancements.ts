// Enhanced content for rhyme word pages - example sentences and poetry quotes
// This makes pages 10x better than competitors

export interface WordEnhancement {
  exampleSentences: string[];
  poetryQuotes: Array<{
    quote: string;
    poem: string;
    poet: string;
    poemSlug?: string; // Link to our analysis page if we have it
  }>;
  relatedPairs: Array<{ word1: string; word2: string }>; // Common rhyme pairs with this word
}

export const wordEnhancements: Record<string, WordEnhancement> = {
  love: {
    exampleSentences: [
      "She felt a deep love for the mountains where she grew up.",
      "The love between them had weathered many storms.",
      "His love of poetry began in childhood.",
      "They love to walk along the shore at sunset.",
    ],
    poetryQuotes: [
      {
        quote: "How do I love thee? Let me count the ways.",
        poem: "Sonnet 43",
        poet: "Elizabeth Barrett Browning",
      },
      {
        quote: "Love is not love which alters when it alteration finds.",
        poem: "Sonnet 116",
        poet: "William Shakespeare",
        poemSlug: "sonnet-116",
      },
      {
        quote: "But we loved with a love that was more than love",
        poem: "Annabel Lee",
        poet: "Edgar Allan Poe",
        poemSlug: "annabel-lee",
      },
    ],
    relatedPairs: [
      { word1: "love", word2: "above" },
      { word1: "love", word2: "dove" },
      { word1: "love", word2: "of" },
      { word1: "love", word2: "shove" },
    ],
  },
  heart: {
    exampleSentences: [
      "Her heart ached with longing for distant shores.",
      "At the heart of the matter lay a simple truth.",
      "He learned the poem by heart.",
      "The heart wants what the heart wants.",
    ],
    poetryQuotes: [
      {
        quote: "Tell all the truth but tell it slant",
        poem: "Tell All the Truth",
        poet: "Emily Dickinson",
        poemSlug: "tell-all-the-truth",
      },
      {
        quote: "My heart aches, and a drowsy numbness pains my sense",
        poem: "Ode to a Nightingale",
        poet: "John Keats",
      },
      {
        quote: "And when thy heart began to beat, what dread hand?",
        poem: "The Tyger",
        poet: "William Blake",
        poemSlug: "the-tyger",
      },
    ],
    relatedPairs: [
      { word1: "heart", word2: "part" },
      { word1: "heart", word2: "start" },
      { word1: "heart", word2: "art" },
      { word1: "heart", word2: "apart" },
    ],
  },
  night: {
    exampleSentences: [
      "The night sky blazed with countless stars.",
      "She worked through the night to finish the poem.",
      "Night fell softly over the sleeping town.",
      "In the dead of night, inspiration struck.",
    ],
    poetryQuotes: [
      {
        quote: "Do not go gentle into that good night",
        poem: "Do Not Go Gentle into That Good Night",
        poet: "Dylan Thomas",
      },
      {
        quote: "Tyger Tyger, burning bright, in the forests of the night",
        poem: "The Tyger",
        poet: "William Blake",
        poemSlug: "the-tyger",
      },
      {
        quote: "Out of the night that covers me, black as the pit from pole to pole",
        poem: "Invictus",
        poet: "William Ernest Henley",
        poemSlug: "invictus",
      },
    ],
    relatedPairs: [
      { word1: "night", word2: "light" },
      { word1: "night", word2: "bright" },
      { word1: "night", word2: "sight" },
      { word1: "night", word2: "right" },
    ],
  },
  light: {
    exampleSentences: [
      "Morning light streamed through the window.",
      "She was the light of his life.",
      "The candle cast a soft, flickering light.",
      "Light as a feather, she danced across the stage.",
    ],
    poetryQuotes: [
      {
        quote: "There's a certain Slant of light, Winter Afternoons",
        poem: "There's a certain Slant of light",
        poet: "Emily Dickinson",
        poemSlug: "theres-a-certain-slant-of-light",
      },
      {
        quote: "Rage, rage against the dying of the light",
        poem: "Do Not Go Gentle into That Good Night",
        poet: "Dylan Thomas",
      },
      {
        quote: "The light that never was, on sea or land",
        poem: "Elegiac Stanzas",
        poet: "William Wordsworth",
      },
    ],
    relatedPairs: [
      { word1: "light", word2: "night" },
      { word1: "light", word2: "bright" },
      { word1: "light", word2: "sight" },
      { word1: "light", word2: "flight" },
    ],
  },
  day: {
    exampleSentences: [
      "Each day brought new possibilities.",
      "The day dawned clear and cold.",
      "She dreamed of the day they would meet again.",
      "Day by day, he grew stronger.",
    ],
    poetryQuotes: [
      {
        quote: "Shall I compare thee to a summer's day?",
        poem: "Sonnet 18",
        poet: "William Shakespeare",
        poemSlug: "sonnet-18",
      },
      {
        quote: "I wandered lonely as a cloud that floats on high o'er vales and hills",
        poem: "Daffodils",
        poet: "William Wordsworth",
        poemSlug: "daffodils",
      },
      {
        quote: "Oh, I kept the first for another day!",
        poem: "The Road Not Taken",
        poet: "Robert Frost",
        poemSlug: "the-road-not-taken",
      },
    ],
    relatedPairs: [
      { word1: "day", word2: "way" },
      { word1: "day", word2: "say" },
      { word1: "day", word2: "stay" },
      { word1: "day", word2: "away" },
    ],
  },
  time: {
    exampleSentences: [
      "Time heals all wounds, they say.",
      "She had no time for regrets.",
      "In time, even mountains crumble to dust.",
      "The sands of time wait for no one.",
    ],
    poetryQuotes: [
      {
        quote: "When in eternal lines to Time thou grow'st",
        poem: "Sonnet 18",
        poet: "William Shakespeare",
        poemSlug: "sonnet-18",
      },
      {
        quote: "Time held me green and dying",
        poem: "Fern Hill",
        poet: "Dylan Thomas",
      },
      {
        quote: "And indeed there will be time",
        poem: "The Love Song of J. Alfred Prufrock",
        poet: "T.S. Eliot",
      },
    ],
    relatedPairs: [
      { word1: "time", word2: "rhyme" },
      { word1: "time", word2: "climb" },
      { word1: "time", word2: "prime" },
      { word1: "time", word2: "sublime" },
    ],
  },
  dream: {
    exampleSentences: [
      "She chased her dream across continents.",
      "The dream faded with the morning light.",
      "It seemed too good to be true, like a dream.",
      "He dared to dream of a better world.",
    ],
    poetryQuotes: [
      {
        quote: "Hold fast to dreams, for if dreams die, life is a broken-winged bird",
        poem: "Dreams",
        poet: "Langston Hughes",
      },
      {
        quote: "For the moon never beams, without bringing me dreams",
        poem: "Annabel Lee",
        poet: "Edgar Allan Poe",
        poemSlug: "annabel-lee",
      },
      {
        quote: "Was it a vision, or a waking dream?",
        poem: "Ode to a Nightingale",
        poet: "John Keats",
      },
    ],
    relatedPairs: [
      { word1: "dream", word2: "stream" },
      { word1: "dream", word2: "seem" },
      { word1: "dream", word2: "gleam" },
      { word1: "dream", word2: "beam" },
    ],
  },
  soul: {
    exampleSentences: [
      "She poured her soul into every verse.",
      "Music speaks to the soul.",
      "He was a lost soul searching for meaning.",
      "The two were soul mates from the start.",
    ],
    poetryQuotes: [
      {
        quote: "I am the master of my fate, I am the captain of my soul",
        poem: "Invictus",
        poet: "William Ernest Henley",
        poemSlug: "invictus",
      },
      {
        quote: "'Hope' is the thing with feathers that perches in the soul",
        poem: "Hope is the thing with feathers",
        poet: "Emily Dickinson",
        poemSlug: "hope-is-the-thing-with-feathers",
      },
      {
        quote: "The Soul selects her own Society",
        poem: "The Soul selects her own Society",
        poet: "Emily Dickinson",
        poemSlug: "the-soul-selects-her-own-society",
      },
    ],
    relatedPairs: [
      { word1: "soul", word2: "whole" },
      { word1: "soul", word2: "goal" },
      { word1: "soul", word2: "roll" },
      { word1: "soul", word2: "control" },
    ],
  },
  sea: {
    exampleSentences: [
      "The sea stretched endlessly to the horizon.",
      "She felt at sea in the new city.",
      "The old sailor had stories of the sea.",
      "A sea of troubles washed over him.",
    ],
    poetryQuotes: [
      {
        quote: "In a kingdom by the sea",
        poem: "Annabel Lee",
        poet: "Edgar Allan Poe",
        poemSlug: "annabel-lee",
      },
      {
        quote: "The sea is calm tonight",
        poem: "Dover Beach",
        poet: "Matthew Arnold",
        poemSlug: "dover-beach",
      },
      {
        quote: "And I've heard it in the chillest land, and on the strangest Sea",
        poem: "Hope is the thing with feathers",
        poet: "Emily Dickinson",
        poemSlug: "hope-is-the-thing-with-feathers",
      },
    ],
    relatedPairs: [
      { word1: "sea", word2: "free" },
      { word1: "sea", word2: "me" },
      { word1: "sea", word2: "be" },
      { word1: "sea", word2: "thee" },
    ],
  },
  sky: {
    exampleSentences: [
      "The sky turned crimson at sunset.",
      "Her ambitions reached for the sky.",
      "Not a cloud marred the perfect blue sky.",
      "The birds vanished into the sky.",
    ],
    poetryQuotes: [
      {
        quote: "The sky is low, the clouds are mean",
        poem: "The Sky is Low",
        poet: "Emily Dickinson",
      },
      {
        quote: "Look at the stars! look, look up at the skies!",
        poem: "The Starlight Night",
        poet: "Gerard Manley Hopkins",
      },
      {
        quote: "In what distant deeps or skies burnt the fire of thine eyes?",
        poem: "The Tyger",
        poet: "William Blake",
        poemSlug: "the-tyger",
      },
    ],
    relatedPairs: [
      { word1: "sky", word2: "high" },
      { word1: "sky", word2: "fly" },
      { word1: "sky", word2: "die" },
      { word1: "sky", word2: "why" },
    ],
  },
  death: {
    exampleSentences: [
      "He faced death with quiet dignity.",
      "The death of summer brought cool relief.",
      "She feared death less than dishonor.",
      "It was a matter of life and death.",
    ],
    poetryQuotes: [
      {
        quote: "Because I could not stop for Death, He kindly stopped for me",
        poem: "Because I could not stop for Death",
        poet: "Emily Dickinson",
        poemSlug: "because-i-could-not-stop-for-death",
      },
      {
        quote: "Nor shall death brag thou wand'rest in his shade",
        poem: "Sonnet 18",
        poet: "William Shakespeare",
        poemSlug: "sonnet-18",
      },
      {
        quote: "Death, be not proud, though some have called thee mighty and dreadful",
        poem: "Death, be not proud",
        poet: "John Donne",
      },
    ],
    relatedPairs: [
      { word1: "death", word2: "breath" },
      { word1: "death", word2: "beneath" },
    ],
  },
  life: {
    exampleSentences: [
      "Life is but a fleeting shadow.",
      "She lived life to the fullest.",
      "His life's work was finally complete.",
      "The meaning of life eluded him still.",
    ],
    poetryQuotes: [
      {
        quote: "So long lives this, and this gives life to thee",
        poem: "Sonnet 18",
        poet: "William Shakespeare",
        poemSlug: "sonnet-18",
      },
      {
        quote: "My darling, my darling, my life and my bride",
        poem: "Annabel Lee",
        poet: "Edgar Allan Poe",
        poemSlug: "annabel-lee",
      },
      {
        quote: "Life, like a dome of many-coloured glass",
        poem: "Adonais",
        poet: "Percy Bysshe Shelley",
      },
    ],
    relatedPairs: [
      { word1: "life", word2: "wife" },
      { word1: "life", word2: "strife" },
      { word1: "life", word2: "knife" },
    ],
  },
  sleep: {
    exampleSentences: [
      "Sleep came at last to the weary traveler.",
      "She could not sleep for thinking of him.",
      "The eternal sleep awaits us all.",
      "Sleep knit up the raveled sleeve of care.",
    ],
    poetryQuotes: [
      {
        quote: "And miles to go before I sleep, and miles to go before I sleep",
        poem: "Stopping by Woods on a Snowy Evening",
        poet: "Robert Frost",
        poemSlug: "stopping-by-woods",
      },
      {
        quote: "To sleep, perchance to dream",
        poem: "Hamlet",
        poet: "William Shakespeare",
      },
      {
        quote: "Sleep that knits up the raveled sleave of care",
        poem: "Macbeth",
        poet: "William Shakespeare",
      },
    ],
    relatedPairs: [
      { word1: "sleep", word2: "deep" },
      { word1: "sleep", word2: "keep" },
      { word1: "sleep", word2: "weep" },
      { word1: "sleep", word2: "creep" },
    ],
  },
  hope: {
    exampleSentences: [
      "Hope springs eternal in the human heart.",
      "She clung to hope like a lifeline.",
      "Beyond hope, beyond despair, she persisted.",
      "There was still hope on the horizon.",
    ],
    poetryQuotes: [
      {
        quote: "'Hope' is the thing with feathers that perches in the soul",
        poem: "Hope is the thing with feathers",
        poet: "Emily Dickinson",
        poemSlug: "hope-is-the-thing-with-feathers",
      },
      {
        quote: "Hope is a waking dream",
        poem: "(attributed)",
        poet: "Aristotle",
      },
    ],
    relatedPairs: [
      { word1: "hope", word2: "scope" },
      { word1: "hope", word2: "rope" },
      { word1: "hope", word2: "slope" },
    ],
  },
  wind: {
    exampleSentences: [
      "The wind howled through the empty streets.",
      "She threw caution to the wind.",
      "A cold wind blew from the north.",
      "The wind carried the scent of rain.",
    ],
    poetryQuotes: [
      {
        quote: "O wild West Wind, thou breath of Autumn's being",
        poem: "Ode to the West Wind",
        poet: "Percy Bysshe Shelley",
      },
      {
        quote: "A wind blew out of a cloud, chilling my beautiful Annabel Lee",
        poem: "Annabel Lee",
        poet: "Edgar Allan Poe",
        poemSlug: "annabel-lee",
      },
      {
        quote: "The only other sound's the sweep of easy wind and downy flake",
        poem: "Stopping by Woods on a Snowy Evening",
        poet: "Robert Frost",
        poemSlug: "stopping-by-woods",
      },
    ],
    relatedPairs: [
      { word1: "wind", word2: "mind" },
      { word1: "wind", word2: "find" },
      { word1: "wind", word2: "blind" },
      { word1: "wind", word2: "behind" },
    ],
  },
  fire: {
    exampleSentences: [
      "The fire crackled in the hearth.",
      "Her eyes blazed with inner fire.",
      "He was playing with fire.",
      "The fire of youth burned in his veins.",
    ],
    poetryQuotes: [
      {
        quote: "Some say the world will end in fire, some say in ice",
        poem: "Fire and Ice",
        poet: "Robert Frost",
      },
      {
        quote: "What the hand, dare seize the fire?",
        poem: "The Tyger",
        poet: "William Blake",
        poemSlug: "the-tyger",
      },
      {
        quote: "My candle burns at both ends; it will not last the night",
        poem: "First Fig",
        poet: "Edna St. Vincent Millay",
        poemSlug: "first-fig",
      },
    ],
    relatedPairs: [
      { word1: "fire", word2: "desire" },
      { word1: "fire", word2: "higher" },
      { word1: "fire", word2: "inspire" },
      { word1: "fire", word2: "liar" },
    ],
  },
  rain: {
    exampleSentences: [
      "The rain fell softly on the roof.",
      "She danced in the rain without a care.",
      "Rain washed away the dust of summer.",
      "He waited in the rain for hours.",
    ],
    poetryQuotes: [
      {
        quote: "There will come soft rains and the smell of the ground",
        poem: "There Will Come Soft Rains",
        poet: "Sara Teasdale",
        poemSlug: "there-will-come-soft-rains",
      },
      {
        quote: "Let the rain kiss you. Let the rain beat upon your head with silver liquid drops",
        poem: "April Rain Song",
        poet: "Langston Hughes",
      },
    ],
    relatedPairs: [
      { word1: "rain", word2: "pain" },
      { word1: "rain", word2: "again" },
      { word1: "rain", word2: "vain" },
      { word1: "rain", word2: "remain" },
    ],
  },
  moon: {
    exampleSentences: [
      "The moon rose over the silent hills.",
      "She was over the moon with joy.",
      "By the light of the moon they traveled.",
      "Once in a blue moon, magic happens.",
    ],
    poetryQuotes: [
      {
        quote: "For the moon never beams, without bringing me dreams",
        poem: "Annabel Lee",
        poet: "Edgar Allan Poe",
        poemSlug: "annabel-lee",
      },
      {
        quote: "The moon was a ghostly galleon tossed upon cloudy seas",
        poem: "The Highwayman",
        poet: "Alfred Noyes",
      },
    ],
    relatedPairs: [
      { word1: "moon", word2: "soon" },
      { word1: "moon", word2: "tune" },
      { word1: "moon", word2: "June" },
      { word1: "moon", word2: "boon" },
    ],
  },
  star: {
    exampleSentences: [
      "She wished upon a falling star.",
      "He was the star of the show.",
      "The North Star guided their way.",
      "Every star has its season.",
    ],
    poetryQuotes: [
      {
        quote: "Bright star, would I were stedfast as thou art",
        poem: "Bright Star",
        poet: "John Keats",
        poemSlug: "bright-star",
      },
      {
        quote: "When the stars threw down their spears",
        poem: "The Tyger",
        poet: "William Blake",
        poemSlug: "the-tyger",
      },
      {
        quote: "And the stars never rise, but I feel the bright eyes",
        poem: "Annabel Lee",
        poet: "Edgar Allan Poe",
        poemSlug: "annabel-lee",
      },
    ],
    relatedPairs: [
      { word1: "star", word2: "far" },
      { word1: "star", word2: "are" },
      { word1: "star", word2: "bar" },
      { word1: "star", word2: "guitar" },
    ],
  },
  world: {
    exampleSentences: [
      "The world lay spread before them.",
      "She carried the weight of the world.",
      "It was a brave new world.",
      "The whole world was watching.",
    ],
    poetryQuotes: [
      {
        quote: "The world is too much with us; late and soon",
        poem: "The World Is Too Much with Us",
        poet: "William Wordsworth",
        poemSlug: "world-too-much",
      },
      {
        quote: "Had we but world enough, and time",
        poem: "To His Coy Mistress",
        poet: "Andrew Marvell",
      },
    ],
    relatedPairs: [
      { word1: "world", word2: "furled" },
      { word1: "world", word2: "hurled" },
      { word1: "world", word2: "curled" },
    ],
  },
  // Words getting search impressions - prioritized for SEO
  white: {
    exampleSentences: [
      "The white snow blanketed the silent hills.",
      "Her white dress gleamed in the moonlight.",
      "He saw the world in black and white.",
      "The white pages lay empty, waiting for words.",
    ],
    poetryQuotes: [
      {
        quote: "Much madness is divinest sense to a discerning eye; much sense the starkest madness",
        poem: "Much Madness is Divinest Sense",
        poet: "Emily Dickinson",
      },
      {
        quote: "The fog comes on little cat feet",
        poem: "Fog",
        poet: "Carl Sandburg",
        poemSlug: "fog",
      },
      {
        quote: "Whose woods these are I think I know. His house is in the village though",
        poem: "Stopping by Woods on a Snowy Evening",
        poet: "Robert Frost",
        poemSlug: "stopping-by-woods",
      },
    ],
    relatedPairs: [
      { word1: "white", word2: "night" },
      { word1: "white", word2: "light" },
      { word1: "white", word2: "bright" },
      { word1: "white", word2: "sight" },
      { word1: "white", word2: "right" },
    ],
  },
  cold: {
    exampleSentences: [
      "The cold wind cut through her thin coat.",
      "His words left her cold and distant.",
      "A cold fear crept into her heart.",
      "The coffee had gone cold hours ago.",
    ],
    poetryQuotes: [
      {
        quote: "Some say the world will end in fire, some say in ice",
        poem: "Fire and Ice",
        poet: "Robert Frost",
      },
      {
        quote: "A wind blew out of a cloud, chilling my beautiful Annabel Lee",
        poem: "Annabel Lee",
        poet: "Edgar Allan Poe",
        poemSlug: "annabel-lee",
      },
      {
        quote: "The woods are lovely, dark and deep",
        poem: "Stopping by Woods on a Snowy Evening",
        poet: "Robert Frost",
        poemSlug: "stopping-by-woods",
      },
    ],
    relatedPairs: [
      { word1: "cold", word2: "old" },
      { word1: "cold", word2: "bold" },
      { word1: "cold", word2: "gold" },
      { word1: "cold", word2: "told" },
      { word1: "cold", word2: "hold" },
    ],
  },
  hate: {
    exampleSentences: [
      "Love and hate are two sides of the same coin.",
      "She could not hate him, try as she might.",
      "Hate corrodes the vessel that contains it.",
      "His eyes burned with an ancient hate.",
    ],
    poetryQuotes: [
      {
        quote: "From what I've tasted of desire I hold with those who favor fire",
        poem: "Fire and Ice",
        poet: "Robert Frost",
      },
      {
        quote: "I know enough of hate to say that for destruction ice is also great",
        poem: "Fire and Ice",
        poet: "Robert Frost",
      },
      {
        quote: "And yet, by heaven, I think my love as rare",
        poem: "Sonnet 130",
        poet: "William Shakespeare",
        poemSlug: "sonnet-130",
      },
    ],
    relatedPairs: [
      { word1: "hate", word2: "fate" },
      { word1: "hate", word2: "late" },
      { word1: "hate", word2: "wait" },
      { word1: "hate", word2: "great" },
      { word1: "hate", word2: "state" },
    ],
  },
  voice: {
    exampleSentences: [
      "Her voice echoed through the empty hall.",
      "He found his voice after years of silence.",
      "The voice of reason was drowned out.",
      "A small voice inside urged her onward.",
    ],
    poetryQuotes: [
      {
        quote: "I celebrate myself, and sing myself",
        poem: "Song of Myself",
        poet: "Walt Whitman",
        poemSlug: "song-of-myself",
      },
      {
        quote: "I hear America singing, the varied carols I hear",
        poem: "I Hear America Singing",
        poet: "Walt Whitman",
        poemSlug: "i-hear-america-singing",
      },
      {
        quote: "Hope is the thing with feathers that perches in the soul, and sings the tune without the words",
        poem: "Hope is the thing with feathers",
        poet: "Emily Dickinson",
        poemSlug: "hope-is-the-thing-with-feathers",
      },
    ],
    relatedPairs: [
      { word1: "voice", word2: "choice" },
      { word1: "voice", word2: "rejoice" },
      { word1: "voice", word2: "noise" },
    ],
  },
  dead: {
    exampleSentences: [
      "The dead leaves crunched underfoot.",
      "In the dead of night, she awoke.",
      "The poet spoke for the dead.",
      "Hope was not yet dead in his heart.",
    ],
    poetryQuotes: [
      {
        quote: "Because I could not stop for Death, He kindly stopped for me",
        poem: "Because I could not stop for Death",
        poet: "Emily Dickinson",
        poemSlug: "because-i-could-not-stop-for-death",
      },
      {
        quote: "Death, be not proud, though some have called thee mighty and dreadful",
        poem: "Death, be not proud",
        poet: "John Donne",
      },
      {
        quote: "And Death shall be no more; Death, thou shalt die",
        poem: "Death, be not proud",
        poet: "John Donne",
      },
    ],
    relatedPairs: [
      { word1: "dead", word2: "head" },
      { word1: "dead", word2: "said" },
      { word1: "dead", word2: "bed" },
      { word1: "dead", word2: "red" },
      { word1: "dead", word2: "led" },
    ],
  },
  // --- Batch 2: 75 additional high-traffic poetry words ---
  rose: {
    exampleSentences: [
      "A single rose bloomed in the abandoned garden.",
      "She rose from the chair with quiet determination.",
      "The scent of rose perfumed the evening air.",
      "He gave her a rose the color of sunset.",
    ],
    poetryQuotes: [
      { quote: "A rose by any other name would smell as sweet", poem: "Romeo and Juliet", poet: "William Shakespeare" },
      { quote: "O Rose, thou art sick", poem: "The Sick Rose", poet: "William Blake" },
    ],
    relatedPairs: [
      { word1: "rose", word2: "goes" },
      { word1: "rose", word2: "knows" },
      { word1: "rose", word2: "flows" },
      { word1: "rose", word2: "close" },
    ],
  },
  spring: {
    exampleSentences: [
      "The first days of spring brought color back to the landscape.",
      "Water bubbled from a hidden spring in the hillside.",
      "Hope can spring from the most unlikely places.",
      "She had a spring in her step after the good news.",
    ],
    poetryQuotes: [
      { quote: "Nothing gold can stay", poem: "Nothing Gold Can Stay", poet: "Robert Frost", poemSlug: "nothing-gold-can-stay" },
    ],
    relatedPairs: [
      { word1: "spring", word2: "ring" },
      { word1: "spring", word2: "sing" },
      { word1: "spring", word2: "bring" },
      { word1: "spring", word2: "thing" },
    ],
  },
  dark: {
    exampleSentences: [
      "The dark woods stretched endlessly before them.",
      "In the dark, sounds became sharper and more vivid.",
      "A dark cloud passed over her expression.",
      "The poem explored the dark corners of memory.",
    ],
    poetryQuotes: [
      { quote: "The woods are lovely, dark and deep", poem: "Stopping by Woods on a Snowy Evening", poet: "Robert Frost", poemSlug: "stopping-by-woods" },
      { quote: "Do not go gentle into that good night", poem: "Do Not Go Gentle into That Good Night", poet: "Dylan Thomas" },
    ],
    relatedPairs: [
      { word1: "dark", word2: "mark" },
      { word1: "dark", word2: "spark" },
      { word1: "dark", word2: "bark" },
      { word1: "dark", word2: "stark" },
    ],
  },
  song: {
    exampleSentences: [
      "The bird's song echoed through the empty valley.",
      "Every culture has its own ancient song traditions.",
      "Her whole life felt like a song that kept changing key.",
      "The wind carried a song from distant shores.",
    ],
    poetryQuotes: [
      { quote: "Sing, Siren, for thyself and I will dote", poem: "Sonnet 119", poet: "William Shakespeare" },
    ],
    relatedPairs: [
      { word1: "song", word2: "long" },
      { word1: "song", word2: "strong" },
      { word1: "song", word2: "wrong" },
      { word1: "song", word2: "along" },
    ],
  },
  silence: {
    exampleSentences: [
      "The silence after the storm felt almost holy.",
      "Words failed her, and silence filled the room.",
      "In silence, she found what noise had hidden.",
      "The poem gave silence its own kind of music.",
    ],
    poetryQuotes: [
      { quote: "After great pain, a formal feeling comes", poem: "After Great Pain", poet: "Emily Dickinson" },
    ],
    relatedPairs: [
      { word1: "silence", word2: "violence" },
      { word1: "silence", word2: "vigilance" },
    ],
  },
  blood: {
    exampleSentences: [
      "Blood ties bind families across generations.",
      "The sunset bled blood-red across the horizon.",
      "His blood ran cold at the sight.",
      "Poetry courses through the blood of every culture.",
    ],
    poetryQuotes: [
      { quote: "Out of the night that covers me, Black as the pit from pole to pole", poem: "Invictus", poet: "William Ernest Henley", poemSlug: "invictus" },
    ],
    relatedPairs: [
      { word1: "blood", word2: "flood" },
      { word1: "blood", word2: "mud" },
      { word1: "blood", word2: "bud" },
    ],
  },
  stone: {
    exampleSentences: [
      "The stone wall had stood for three hundred years.",
      "Her words fell like stones into still water.",
      "Beneath the stone lay something forgotten.",
      "Time can turn even stone to dust.",
    ],
    poetryQuotes: [
      { quote: "Too long a sacrifice can make a stone of the heart", poem: "Easter, 1916", poet: "W. B. Yeats" },
    ],
    relatedPairs: [
      { word1: "stone", word2: "bone" },
      { word1: "stone", word2: "alone" },
      { word1: "stone", word2: "known" },
      { word1: "stone", word2: "grown" },
    ],
  },
  water: {
    exampleSentences: [
      "Still water reflects the sky more clearly than rushing streams.",
      "The water carved its path through ancient rock.",
      "Her eyes were the color of deep water.",
      "Poetry flows like water — finding its own level.",
    ],
    poetryQuotes: [
      { quote: "Water, water, every where, nor any drop to drink", poem: "The Rime of the Ancient Mariner", poet: "Samuel Taylor Coleridge" },
    ],
    relatedPairs: [
      { word1: "water", word2: "daughter" },
      { word1: "water", word2: "slaughter" },
    ],
  },
  sun: {
    exampleSentences: [
      "The sun broke through the clouds like a revelation.",
      "Under the sun, all things eventually change.",
      "She turned her face to the sun and closed her eyes.",
      "Nothing new under the sun, the old saying goes.",
    ],
    poetryQuotes: [
      { quote: "Shall I compare thee to a summer's day?", poem: "Sonnet 18", poet: "William Shakespeare", poemSlug: "sonnet-18" },
    ],
    relatedPairs: [
      { word1: "sun", word2: "one" },
      { word1: "sun", word2: "run" },
      { word1: "sun", word2: "done" },
      { word1: "sun", word2: "begun" },
    ],
  },
  bone: {
    exampleSentences: [
      "She felt it in her bones that something had changed.",
      "The cold cut right to the bone.",
      "The dog buried its bone beneath the oak tree.",
      "Words can cut closer to the bone than any blade.",
    ],
    poetryQuotes: [
      { quote: "I felt a funeral in my brain", poem: "I Felt a Funeral in My Brain", poet: "Emily Dickinson" },
    ],
    relatedPairs: [
      { word1: "bone", word2: "stone" },
      { word1: "bone", word2: "alone" },
      { word1: "bone", word2: "known" },
      { word1: "bone", word2: "grown" },
    ],
  },
  earth: {
    exampleSentences: [
      "The earth beneath their feet was rich and dark.",
      "All living things return to the earth.",
      "She dug her hands into the warm earth.",
      "The poem brought heaven down to earth.",
    ],
    poetryQuotes: [
      { quote: "This is the way the world ends", poem: "The Hollow Men", poet: "T. S. Eliot" },
    ],
    relatedPairs: [
      { word1: "earth", word2: "birth" },
      { word1: "earth", word2: "worth" },
      { word1: "earth", word2: "mirth" },
    ],
  },
  shadow: {
    exampleSentences: [
      "A shadow fell across the page as clouds gathered.",
      "She was only a shadow of her former self.",
      "The shadow moved independently of its caster.",
      "Even in bright sunlight, shadows find their corners.",
    ],
    poetryQuotes: [
      { quote: "I have measured out my life with coffee spoons", poem: "The Love Song of J. Alfred Prufrock", poet: "T. S. Eliot" },
    ],
    relatedPairs: [
      { word1: "shadow", word2: "meadow" },
    ],
  },
  green: {
    exampleSentences: [
      "The green of new leaves against a grey sky.",
      "Spring painted the hillside in every shade of green.",
      "Her green eyes held secrets she would never tell.",
      "The green world hummed with hidden life.",
    ],
    poetryQuotes: [
      { quote: "Nature's first green is gold", poem: "Nothing Gold Can Stay", poet: "Robert Frost", poemSlug: "nothing-gold-can-stay" },
    ],
    relatedPairs: [
      { word1: "green", word2: "seen" },
      { word1: "green", word2: "keen" },
      { word1: "green", word2: "between" },
      { word1: "green", word2: "serene" },
    ],
  },
  gold: {
    exampleSentences: [
      "The autumn leaves turned gold before falling.",
      "Not all that glitters is gold.",
      "She wore a chain of delicate gold.",
      "The gold of evening light transformed the landscape.",
    ],
    poetryQuotes: [
      { quote: "Nature's first green is gold, her hardest hue to hold", poem: "Nothing Gold Can Stay", poet: "Robert Frost", poemSlug: "nothing-gold-can-stay" },
    ],
    relatedPairs: [
      { word1: "gold", word2: "old" },
      { word1: "gold", word2: "bold" },
      { word1: "gold", word2: "cold" },
      { word1: "gold", word2: "told" },
      { word1: "gold", word2: "hold" },
    ],
  },
  tree: {
    exampleSentences: [
      "The old tree had witnessed a century of change.",
      "Every tree tells a story in its rings.",
      "She sat beneath the tree and wrote for hours.",
      "The bare tree stood stark against the winter sky.",
    ],
    poetryQuotes: [
      { quote: "I think that I shall never see a poem lovely as a tree", poem: "Trees", poet: "Joyce Kilmer" },
    ],
    relatedPairs: [
      { word1: "tree", word2: "free" },
      { word1: "tree", word2: "sea" },
      { word1: "tree", word2: "be" },
      { word1: "tree", word2: "me" },
    ],
  },
  river: {
    exampleSentences: [
      "The river wound through the valley like a silver thread.",
      "Time is a river that carries all things away.",
      "They sat by the river and watched the water pass.",
      "The river rose after three days of rain.",
    ],
    poetryQuotes: [
      { quote: "I've known rivers ancient as the world", poem: "The Negro Speaks of Rivers", poet: "Langston Hughes" },
    ],
    relatedPairs: [
      { word1: "river", word2: "deliver" },
      { word1: "river", word2: "giver" },
      { word1: "river", word2: "shiver" },
    ],
  },
  grave: {
    exampleSentences: [
      "The news was grave, and no one spoke for a long time.",
      "Flowers grew wild around the forgotten grave.",
      "She spoke in a grave, measured tone.",
      "Beyond the grave, what waits for us remains unknown.",
    ],
    poetryQuotes: [
      { quote: "Because I could not stop for Death, He kindly stopped for me", poem: "Because I Could Not Stop for Death", poet: "Emily Dickinson", poemSlug: "because-i-could-not-stop" },
    ],
    relatedPairs: [
      { word1: "grave", word2: "brave" },
      { word1: "grave", word2: "save" },
      { word1: "grave", word2: "wave" },
      { word1: "grave", word2: "gave" },
    ],
  },
  flower: {
    exampleSentences: [
      "A single flower pushed through the crack in the pavement.",
      "The flower of youth fades but its fragrance lingers.",
      "She pressed a flower between the pages of her journal.",
      "Every flower is a poem written in petals.",
    ],
    poetryQuotes: [
      { quote: "Where have all the flowers gone", poem: "Where Have All the Flowers Gone", poet: "Pete Seeger" },
    ],
    relatedPairs: [
      { word1: "flower", word2: "power" },
      { word1: "flower", word2: "hour" },
      { word1: "flower", word2: "tower" },
      { word1: "flower", word2: "shower" },
    ],
  },
  tears: {
    exampleSentences: [
      "Tears blurred the words on the page.",
      "The tears of a clown hide a deeper sorrow.",
      "Joy and tears are often companions.",
      "She wiped her tears and began again.",
    ],
    poetryQuotes: [
      { quote: "Tears, idle tears, I know not what they mean", poem: "The Princess", poet: "Alfred, Lord Tennyson" },
    ],
    relatedPairs: [
      { word1: "tears", word2: "fears" },
      { word1: "tears", word2: "years" },
      { word1: "tears", word2: "ears" },
      { word1: "tears", word2: "appears" },
    ],
  },
  beauty: {
    exampleSentences: [
      "Beauty can be found in the most unexpected places.",
      "The beauty of the poem lay in its simplicity.",
      "She saw beauty where others saw only decay.",
      "True beauty outlasts fashion and trend.",
    ],
    poetryQuotes: [
      { quote: "A thing of beauty is a joy for ever", poem: "Endymion", poet: "John Keats" },
      { quote: "She walks in beauty, like the night", poem: "She Walks in Beauty", poet: "Lord Byron", poemSlug: "she-walks-in-beauty" },
    ],
    relatedPairs: [
      { word1: "beauty", word2: "duty" },
    ],
  },
  truth: {
    exampleSentences: [
      "The truth is rarely pure and never simple.",
      "Poetry aims to tell the truth slant.",
      "She spoke the truth even when it was difficult.",
      "The truth of the matter was far more complex.",
    ],
    poetryQuotes: [
      { quote: "Tell all the truth but tell it slant", poem: "Tell All the Truth", poet: "Emily Dickinson" },
      { quote: "Beauty is truth, truth beauty", poem: "Ode on a Grecian Urn", poet: "John Keats" },
    ],
    relatedPairs: [
      { word1: "truth", word2: "youth" },
      { word1: "truth", word2: "tooth" },
    ],
  },
  sorrow: {
    exampleSentences: [
      "Sorrow carved deeper channels than joy ever could.",
      "In sorrow, she found an unexpected strength.",
      "The sorrow of parting hung in the air.",
      "Poetry transforms sorrow into something bearable.",
    ],
    poetryQuotes: [
      { quote: "Parting is such sweet sorrow", poem: "Romeo and Juliet", poet: "William Shakespeare" },
    ],
    relatedPairs: [
      { word1: "sorrow", word2: "tomorrow" },
      { word1: "sorrow", word2: "borrow" },
      { word1: "sorrow", word2: "follow" },
    ],
  },
  joy: {
    exampleSentences: [
      "Joy surprised her like sunlight through clouds.",
      "The joy of creation kept her writing through the night.",
      "Small joys accumulate into a life well lived.",
      "His face was a map of joy and wonder.",
    ],
    poetryQuotes: [
      { quote: "Tyger Tyger, burning bright", poem: "The Tyger", poet: "William Blake", poemSlug: "the-tyger" },
    ],
    relatedPairs: [
      { word1: "joy", word2: "boy" },
      { word1: "joy", word2: "destroy" },
      { word1: "joy", word2: "employ" },
      { word1: "joy", word2: "enjoy" },
    ],
  },
  snow: {
    exampleSentences: [
      "The first snow of the season silenced the world.",
      "Snow blanketed the fields in white.",
      "Footprints in the snow told their own story.",
      "The snow fell softly, without sound or hurry.",
    ],
    poetryQuotes: [
      { quote: "Whose woods these are I think I know", poem: "Stopping by Woods on a Snowy Evening", poet: "Robert Frost", poemSlug: "stopping-by-woods" },
    ],
    relatedPairs: [
      { word1: "snow", word2: "know" },
      { word1: "snow", word2: "go" },
      { word1: "snow", word2: "below" },
      { word1: "snow", word2: "flow" },
      { word1: "snow", word2: "glow" },
    ],
  },
  ocean: {
    exampleSentences: [
      "The ocean stretched beyond sight and imagination.",
      "She felt an ocean of feeling rise within her.",
      "The ocean does not apologize for its depth.",
      "Watching the ocean, she felt both small and infinite.",
    ],
    poetryQuotes: [
      { quote: "The sea is calm tonight", poem: "Dover Beach", poet: "Matthew Arnold", poemSlug: "dover-beach" },
    ],
    relatedPairs: [
      { word1: "ocean", word2: "motion" },
      { word1: "ocean", word2: "devotion" },
      { word1: "ocean", word2: "emotion" },
    ],
  },
  morning: {
    exampleSentences: [
      "The morning light made everything look possible.",
      "Every morning is a chance to begin again.",
      "She wrote best in the early morning hours.",
      "Morning dew clung to the spider's web like jewels.",
    ],
    poetryQuotes: [
      { quote: "I'm nobody! Who are you?", poem: "I'm Nobody! Who Are You?", poet: "Emily Dickinson", poemSlug: "im-nobody-who-are-you" },
    ],
    relatedPairs: [
      { word1: "morning", word2: "warning" },
      { word1: "morning", word2: "mourning" },
      { word1: "morning", word2: "dawning" },
    ],
  },
  winter: {
    exampleSentences: [
      "Winter stripped the trees to their essential shapes.",
      "The winter of discontent gave way to spring.",
      "She loved winter for its stark, honest beauty.",
      "In winter, the world turns inward.",
    ],
    poetryQuotes: [
      { quote: "The woods are lovely, dark and deep", poem: "Stopping by Woods on a Snowy Evening", poet: "Robert Frost", poemSlug: "stopping-by-woods" },
    ],
    relatedPairs: [
      { word1: "winter", word2: "splinter" },
      { word1: "winter", word2: "enter" },
    ],
  },
  summer: {
    exampleSentences: [
      "Summer lingered longer than anyone expected.",
      "The summer of her childhood felt endless.",
      "Lazy summer days stretched into golden evenings.",
      "Summer was a season of abundance and possibility.",
    ],
    poetryQuotes: [
      { quote: "Shall I compare thee to a summer's day?", poem: "Sonnet 18", poet: "William Shakespeare", poemSlug: "sonnet-18" },
    ],
    relatedPairs: [
      { word1: "summer", word2: "drummer" },
      { word1: "summer", word2: "hummer" },
    ],
  },
  hand: {
    exampleSentences: [
      "She took his hand and they walked into the unknown.",
      "The hand that wrote the poem trembled slightly.",
      "Time's hand touches everything eventually.",
      "He held the bird gently in his hand.",
    ],
    poetryQuotes: [
      { quote: "This is the hand that wrote it", poem: "This Living Hand", poet: "John Keats" },
    ],
    relatedPairs: [
      { word1: "hand", word2: "land" },
      { word1: "hand", word2: "stand" },
      { word1: "hand", word2: "sand" },
      { word1: "hand", word2: "understand" },
    ],
  },
  eye: {
    exampleSentences: [
      "The eye sees only what the mind is prepared to comprehend.",
      "She caught his eye across the crowded room.",
      "The poet's eye finds beauty in the ordinary.",
      "In the eye of the storm, there was perfect calm.",
    ],
    poetryQuotes: [
      { quote: "I wandered lonely as a cloud", poem: "I Wandered Lonely as a Cloud", poet: "William Wordsworth", poemSlug: "daffodils" },
    ],
    relatedPairs: [
      { word1: "eye", word2: "sky" },
      { word1: "eye", word2: "fly" },
      { word1: "eye", word2: "die" },
      { word1: "eye", word2: "high" },
    ],
  },
  child: {
    exampleSentences: [
      "The child in her never stopped asking questions.",
      "Every child is born a poet.",
      "She remembered the world as a child sees it.",
      "The child laughed, and the sound was pure music.",
    ],
    poetryQuotes: [
      { quote: "The child is father of the man", poem: "My Heart Leaps Up", poet: "William Wordsworth" },
    ],
    relatedPairs: [
      { word1: "child", word2: "wild" },
      { word1: "child", word2: "mild" },
      { word1: "child", word2: "smiled" },
    ],
  },
  pain: {
    exampleSentences: [
      "Pain is the raw material from which art is made.",
      "The pain subsided but left its mark.",
      "She wrote through the pain until it became something else.",
      "Even pain can be a kind of teacher.",
    ],
    poetryQuotes: [
      { quote: "After great pain, a formal feeling comes", poem: "After Great Pain", poet: "Emily Dickinson" },
    ],
    relatedPairs: [
      { word1: "pain", word2: "rain" },
      { word1: "pain", word2: "vain" },
      { word1: "pain", word2: "remain" },
      { word1: "pain", word2: "again" },
    ],
  },
  door: {
    exampleSentences: [
      "Every closed door is an invitation to find another way.",
      "The door stood open to the garden.",
      "She knocked on the door of possibility.",
      "Behind every door, a different world waited.",
    ],
    poetryQuotes: [
      { quote: "Because I could not stop for Death, He kindly stopped for me", poem: "Because I Could Not Stop for Death", poet: "Emily Dickinson", poemSlug: "because-i-could-not-stop" },
    ],
    relatedPairs: [
      { word1: "door", word2: "floor" },
      { word1: "door", word2: "more" },
      { word1: "door", word2: "before" },
      { word1: "door", word2: "shore" },
    ],
  },
  road: {
    exampleSentences: [
      "The road stretched ahead, full of promise and uncertainty.",
      "Two roads diverged, and that made all the difference.",
      "Every journey begins with a single step on the road.",
      "The road home is the longest and the shortest.",
    ],
    poetryQuotes: [
      { quote: "Two roads diverged in a wood, and I took the one less traveled by", poem: "The Road Not Taken", poet: "Robert Frost", poemSlug: "the-road-not-taken" },
    ],
    relatedPairs: [
      { word1: "road", word2: "showed" },
      { word1: "road", word2: "flowed" },
      { word1: "road", word2: "bestowed" },
    ],
  },
  breath: {
    exampleSentences: [
      "Each breath is a small poem the body writes.",
      "She held her breath as the music swelled.",
      "The cold air turned each breath visible.",
      "Poetry lives in the space between breaths.",
    ],
    poetryQuotes: [
      { quote: "I am not yet born; O hear me", poem: "Prayer Before Birth", poet: "Louis MacNeice" },
    ],
    relatedPairs: [
      { word1: "breath", word2: "death" },
      { word1: "breath", word2: "beneath" },
    ],
  },
  face: {
    exampleSentences: [
      "Her face told a story words could not.",
      "He turned to face the coming storm.",
      "Time writes its history on every face.",
      "She wore a brave face despite the sadness.",
    ],
    poetryQuotes: [
      { quote: "Let us go then, you and I", poem: "The Love Song of J. Alfred Prufrock", poet: "T. S. Eliot" },
    ],
    relatedPairs: [
      { word1: "face", word2: "place" },
      { word1: "face", word2: "grace" },
      { word1: "face", word2: "space" },
      { word1: "face", word2: "trace" },
    ],
  },
  bird: {
    exampleSentences: [
      "A bird sang from the highest branch.",
      "The caged bird sings of freedom it has never known.",
      "She watched the bird until it vanished into blue.",
      "Every bird carries a song no other bird can sing.",
    ],
    poetryQuotes: [
      { quote: "Hope is the thing with feathers that perches in the soul", poem: "Hope Is the Thing with Feathers", poet: "Emily Dickinson", poemSlug: "hope-is-the-thing-with-feathers" },
    ],
    relatedPairs: [
      { word1: "bird", word2: "word" },
      { word1: "bird", word2: "heard" },
      { word1: "bird", word2: "stirred" },
    ],
  },
  glass: {
    exampleSentences: [
      "Through the glass, the world looked distorted.",
      "She was fragile as glass but twice as sharp.",
      "The glass reflected a face she barely recognized.",
      "Life is like a pane of glass — clear until it breaks.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "glass", word2: "pass" },
      { word1: "glass", word2: "grass" },
      { word1: "glass", word2: "class" },
      { word1: "glass", word2: "mass" },
    ],
  },
  deep: {
    exampleSentences: [
      "The well was deep and the water was cold.",
      "She fell into a deep and dreamless sleep.",
      "The poem stirred something deep within him.",
      "Still waters run deep, as the saying goes.",
    ],
    poetryQuotes: [
      { quote: "The woods are lovely, dark and deep", poem: "Stopping by Woods on a Snowy Evening", poet: "Robert Frost", poemSlug: "stopping-by-woods" },
    ],
    relatedPairs: [
      { word1: "deep", word2: "sleep" },
      { word1: "deep", word2: "keep" },
      { word1: "deep", word2: "weep" },
      { word1: "deep", word2: "steep" },
    ],
  },
  flame: {
    exampleSentences: [
      "The flame danced in the darkness like a living thing.",
      "Old flame and new passion are different kinds of fire.",
      "She held the flame of hope when all else failed.",
      "The candle flame bent in the draft.",
    ],
    poetryQuotes: [
      { quote: "Tyger Tyger, burning bright, In the forests of the night", poem: "The Tyger", poet: "William Blake", poemSlug: "the-tyger" },
    ],
    relatedPairs: [
      { word1: "flame", word2: "name" },
      { word1: "flame", word2: "came" },
      { word1: "flame", word2: "same" },
      { word1: "flame", word2: "shame" },
    ],
  },
  storm: {
    exampleSentences: [
      "The storm passed as quickly as it came.",
      "In the calm before the storm, everything felt suspended.",
      "She weathered every storm life threw at her.",
      "The storm inside was worse than the one outside.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "storm", word2: "form" },
      { word1: "storm", word2: "warm" },
      { word1: "storm", word2: "swarm" },
      { word1: "storm", word2: "norm" },
    ],
  },
  angel: {
    exampleSentences: [
      "She moved through the ward like an angel of mercy.",
      "The angel in the painting had sorrowful eyes.",
      "Not every angel wears wings.",
      "He saw an angel where others saw only a stranger.",
    ],
    poetryQuotes: [
      { quote: "And the angels, not half so happy in heaven", poem: "Annabel Lee", poet: "Edgar Allan Poe", poemSlug: "annabel-lee" },
    ],
    relatedPairs: [
      { word1: "angel", word2: "stranger" },
    ],
  },
  dust: {
    exampleSentences: [
      "All glory returns to dust in time.",
      "The dust motes danced in the beam of light.",
      "She shook the dust from an old manuscript.",
      "From dust we come and to dust we return.",
    ],
    poetryQuotes: [
      { quote: "Remember that thou art dust, and unto dust shalt thou return", poem: "Genesis", poet: "Biblical" },
    ],
    relatedPairs: [
      { word1: "dust", word2: "must" },
      { word1: "dust", word2: "trust" },
      { word1: "dust", word2: "rust" },
      { word1: "dust", word2: "just" },
    ],
  },
  path: {
    exampleSentences: [
      "The path through the forest was barely visible.",
      "She chose the difficult path because it was hers.",
      "Every path leads somewhere, even the ones that seem to circle back.",
      "The path of least resistance is not always the wisest.",
    ],
    poetryQuotes: [
      { quote: "Two roads diverged in a yellow wood", poem: "The Road Not Taken", poet: "Robert Frost", poemSlug: "the-road-not-taken" },
    ],
    relatedPairs: [
      { word1: "path", word2: "wrath" },
      { word1: "path", word2: "math" },
      { word1: "path", word2: "bath" },
      { word1: "path", word2: "aftermath" },
    ],
  },
  cloud: {
    exampleSentences: [
      "A single cloud drifted across an otherwise clear sky.",
      "Every cloud carries both shadow and the promise of rain.",
      "She watched the clouds reshape themselves endlessly.",
      "The cloud of unknowing hung over the landscape.",
    ],
    poetryQuotes: [
      { quote: "I wandered lonely as a cloud", poem: "I Wandered Lonely as a Cloud", poet: "William Wordsworth", poemSlug: "daffodils" },
    ],
    relatedPairs: [
      { word1: "cloud", word2: "loud" },
      { word1: "cloud", word2: "proud" },
      { word1: "cloud", word2: "shroud" },
      { word1: "cloud", word2: "crowd" },
    ],
  },
  iron: {
    exampleSentences: [
      "The iron gate stood guard over forgotten gardens.",
      "Her will was made of iron, unbending and sure.",
      "Rust ate through the iron, a slow and patient destroyer.",
      "Words forged in iron carry the weight of conviction.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "iron", word2: "lion" },
      { word1: "iron", word2: "horizon" },
    ],
  },
  mountain: {
    exampleSentences: [
      "The mountain stood unchanged while everything else shifted.",
      "She climbed the mountain because it was there.",
      "From the mountain top, the world looked small and possible.",
      "Every mountain was once an ocean floor.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "mountain", word2: "fountain" },
      { word1: "mountain", word2: "certain" },
    ],
  },
  field: {
    exampleSentences: [
      "The field stretched to the horizon, golden with wheat.",
      "She found herself in an unfamiliar field of study.",
      "Wildflowers dotted the field like scattered stars.",
      "The field lay fallow, waiting for the next season.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "field", word2: "yield" },
      { word1: "field", word2: "sealed" },
      { word1: "field", word2: "revealed" },
      { word1: "field", word2: "healed" },
    ],
  },
  wall: {
    exampleSentences: [
      "The wall between them was invisible but real.",
      "Good fences make good neighbors, or so they say.",
      "She pressed her back against the cold wall.",
      "The wall held centuries of history in its stones.",
    ],
    poetryQuotes: [
      { quote: "Something there is that doesn't love a wall", poem: "Mending Wall", poet: "Robert Frost" },
    ],
    relatedPairs: [
      { word1: "wall", word2: "fall" },
      { word1: "wall", word2: "call" },
      { word1: "wall", word2: "small" },
      { word1: "wall", word2: "all" },
    ],
  },
  root: {
    exampleSentences: [
      "The root of the problem lay deeper than anyone suspected.",
      "Trees with strong roots weather the worst storms.",
      "She traced her roots back through generations.",
      "Every poem has a root in lived experience.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "root", word2: "fruit" },
      { word1: "root", word2: "pursuit" },
      { word1: "root", word2: "truth" },
    ],
  },
  wing: {
    exampleSentences: [
      "The bird spread its wing and caught the updraft.",
      "She found her wings when she learned to write.",
      "On the wing of the wind came the scent of jasmine.",
      "Every poem needs wings to carry it beyond the page.",
    ],
    poetryQuotes: [
      { quote: "Hope is the thing with feathers that perches in the soul", poem: "Hope Is the Thing with Feathers", poet: "Emily Dickinson", poemSlug: "hope-is-the-thing-with-feathers" },
    ],
    relatedPairs: [
      { word1: "wing", word2: "sing" },
      { word1: "wing", word2: "ring" },
      { word1: "wing", word2: "spring" },
      { word1: "wing", word2: "thing" },
    ],
  },
  ghost: {
    exampleSentences: [
      "The ghost of her former life haunted the old house.",
      "Memory is the ghost that never fully departs.",
      "He moved through the crowd like a ghost.",
      "The ghost of a smile crossed her lips.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "ghost", word2: "most" },
      { word1: "ghost", word2: "coast" },
      { word1: "ghost", word2: "host" },
      { word1: "ghost", word2: "post" },
    ],
  },
  silver: {
    exampleSentences: [
      "The silver moon hung low over the lake.",
      "Her hair had turned silver but her eyes still sparkled.",
      "Words are silver, but silence is golden.",
      "The river was a silver ribbon in the moonlight.",
    ],
    poetryQuotes: [
      { quote: "The moon was a ghostly galleon tossed upon cloudy seas", poem: "The Highwayman", poet: "Alfred Noyes" },
    ],
    relatedPairs: [
      { word1: "silver", word2: "river" },
      { word1: "silver", word2: "deliver" },
    ],
  },
  mercy: {
    exampleSentences: [
      "Mercy is the companion of true strength.",
      "She asked for mercy but expected justice.",
      "The quality of mercy is not strained.",
      "Without mercy, justice becomes cruelty.",
    ],
    poetryQuotes: [
      { quote: "The quality of mercy is not strained", poem: "The Merchant of Venice", poet: "William Shakespeare" },
    ],
    relatedPairs: [
      { word1: "mercy", word2: "controversy" },
    ],
  },
  promise: {
    exampleSentences: [
      "The morning held the promise of something new.",
      "She kept her promise against all odds.",
      "Spring is nature's promise of renewal.",
      "Every beginning is a promise waiting to be kept.",
    ],
    poetryQuotes: [
      { quote: "But I have promises to keep, and miles to go before I sleep", poem: "Stopping by Woods on a Snowy Evening", poet: "Robert Frost", poemSlug: "stopping-by-woods" },
    ],
    relatedPairs: [
      { word1: "promise", word2: "premise" },
    ],
  },
  garden: {
    exampleSentences: [
      "The garden was her sanctuary from the world.",
      "In every garden, beauty and wildness negotiate.",
      "She tended the garden of her mind with care.",
      "The walled garden kept its secrets behind high stones.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "garden", word2: "pardon" },
      { word1: "garden", word2: "harden" },
    ],
  },
  lamp: {
    exampleSentences: [
      "The lamp cast a warm circle of light on the desk.",
      "She read by the lamp until the oil ran dry.",
      "A single lamp burned in the window.",
      "The lamp of knowledge illuminates the darkest corners.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "lamp", word2: "camp" },
      { word1: "lamp", word2: "damp" },
      { word1: "lamp", word2: "stamp" },
    ],
  },
  ashes: {
    exampleSentences: [
      "From the ashes of the old, something new arose.",
      "The fire left nothing but ashes and memory.",
      "She sifted through the ashes of what had been.",
      "Even ashes hold the ghost of warmth.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "ashes", word2: "clashes" },
      { word1: "ashes", word2: "flashes" },
      { word1: "ashes", word2: "crashes" },
    ],
  },
  dawn: {
    exampleSentences: [
      "Dawn broke slowly over the eastern hills.",
      "At the dawn of a new era, everything felt possible.",
      "She rose before dawn to capture the quiet.",
      "The dawn chorus was the day's first poem.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "dawn", word2: "drawn" },
      { word1: "dawn", word2: "gone" },
      { word1: "dawn", word2: "upon" },
      { word1: "dawn", word2: "swan" },
    ],
  },
  heaven: {
    exampleSentences: [
      "Heaven seemed closer on that mountaintop.",
      "She found a little piece of heaven in the garden.",
      "The poem attempted to describe heaven in human words.",
      "Between heaven and earth, the kite danced.",
    ],
    poetryQuotes: [
      { quote: "And the angels, not half so happy in heaven", poem: "Annabel Lee", poet: "Edgar Allan Poe", poemSlug: "annabel-lee" },
    ],
    relatedPairs: [
      { word1: "heaven", word2: "seven" },
      { word1: "heaven", word2: "given" },
      { word1: "heaven", word2: "forgiven" },
    ],
  },
  wild: {
    exampleSentences: [
      "The wild flowers grew where no one planted them.",
      "Something wild stirred in her chest.",
      "The wind was wild and unrelenting.",
      "She ran wild through the meadows of her childhood.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "wild", word2: "child" },
      { word1: "wild", word2: "mild" },
      { word1: "wild", word2: "smiled" },
      { word1: "wild", word2: "beguiled" },
    ],
  },
  sword: {
    exampleSentences: [
      "The pen is mightier than the sword.",
      "Words can cut deeper than any sword.",
      "He drew his sword against the coming darkness.",
      "The sword of justice must cut both ways.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "sword", word2: "word" },
      { word1: "sword", word2: "lord" },
      { word1: "sword", word2: "accord" },
    ],
  },
  sail: {
    exampleSentences: [
      "The white sail caught the wind and the boat surged forward.",
      "She set sail for unknown waters.",
      "Life is a voyage; we must learn to sail.",
      "The sail billowed like a breathing lung.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "sail", word2: "tale" },
      { word1: "sail", word2: "pale" },
      { word1: "sail", word2: "trail" },
      { word1: "sail", word2: "whale" },
    ],
  },
  whisper: {
    exampleSentences: [
      "The wind carried a whisper from the past.",
      "She spoke in a whisper but her words were thunder.",
      "Trees whisper secrets to those who listen.",
      "The whisper of pages turning was the only sound.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "whisper", word2: "sister" },
    ],
  },
  pearl: {
    exampleSentences: [
      "Each word was a pearl strung on a thread of meaning.",
      "The dew on the leaf looked like a pearl.",
      "She wore a single pearl at her throat.",
      "Wisdom, like a pearl, forms around a grain of irritation.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "pearl", word2: "girl" },
      { word1: "pearl", word2: "world" },
      { word1: "pearl", word2: "curl" },
      { word1: "pearl", word2: "unfurl" },
    ],
  },
  crown: {
    exampleSentences: [
      "Heavy lies the head that wears the crown.",
      "Autumn crowned the trees in red and gold.",
      "The mountain wore a crown of clouds.",
      "She earned her crown through years of quiet effort.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "crown", word2: "down" },
      { word1: "crown", word2: "town" },
      { word1: "crown", word2: "brown" },
      { word1: "crown", word2: "frown" },
    ],
  },
  wound: {
    exampleSentences: [
      "Time heals every wound, or so we are told.",
      "The wound ran deeper than the surface showed.",
      "She wore her wound like a badge of survival.",
      "Words can open wounds that never fully close.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "wound", word2: "found" },
      { word1: "wound", word2: "ground" },
      { word1: "wound", word2: "sound" },
      { word1: "wound", word2: "bound" },
    ],
  },
  mirror: {
    exampleSentences: [
      "The lake was a mirror reflecting the sky.",
      "She looked in the mirror and saw her mother's face.",
      "Poetry is a mirror held up to the soul.",
      "The mirror shows us what we are, not what we wish to be.",
    ],
    poetryQuotes: [
      { quote: "I am silver and exact", poem: "Mirror", poet: "Sylvia Plath" },
    ],
    relatedPairs: [],
  },
  freedom: {
    exampleSentences: [
      "Freedom has a different meaning for everyone.",
      "The bird sang of freedom from the highest branch.",
      "True freedom begins in the mind.",
      "She found freedom in the discipline of writing.",
    ],
    poetryQuotes: [
      { quote: "I know why the caged bird sings", poem: "I Know Why the Caged Bird Sings", poet: "Maya Angelou" },
    ],
    relatedPairs: [
      { word1: "freedom", word2: "kingdom" },
    ],
  },
  stranger: {
    exampleSentences: [
      "She felt like a stranger in her own home.",
      "A stranger's kindness changed everything.",
      "We are all strangers until someone tells our story.",
      "The stranger brought news from a distant land.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "stranger", word2: "danger" },
      { word1: "stranger", word2: "ranger" },
    ],
  },
  candle: {
    exampleSentences: [
      "A single candle pushed back the darkness.",
      "She burned the candle at both ends.",
      "The candle flickered and then went out.",
      "Even a small candle casts a long shadow.",
    ],
    poetryQuotes: [
      { quote: "Out, out, brief candle!", poem: "Macbeth", poet: "William Shakespeare" },
    ],
    relatedPairs: [
      { word1: "candle", word2: "handle" },
      { word1: "candle", word2: "sandal" },
    ],
  },
  memory: {
    exampleSentences: [
      "Memory is the thread that stitches our days together.",
      "The memory of that summer never faded.",
      "She carried the memory like a stone in her pocket.",
      "Without memory, we are strangers to ourselves.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "memory", word2: "reverie" },
    ],
  },
  hunger: {
    exampleSentences: [
      "The hunger for knowledge drove her forward.",
      "Hunger sharpens every sense.",
      "There is a hunger that food cannot satisfy.",
      "The poem spoke of a hunger deeper than the body's.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "hunger", word2: "younger" },
      { word1: "hunger", word2: "among her" },
    ],
  },
  temple: {
    exampleSentences: [
      "The body is a temple of the spirit.",
      "The ruined temple stood witness to forgotten gods.",
      "She pressed her fingers to her temple and thought.",
      "The forest was a temple of green light.",
    ],
    poetryQuotes: [],
    relatedPairs: [
      { word1: "temple", word2: "simple" },
    ],
  },
};

// Helper to get enhancement for a word (case-insensitive)
export function getWordEnhancement(word: string): WordEnhancement | undefined {
  return wordEnhancements[word.toLowerCase()];
}

// Get all words that have enhancements
export function getEnhancedWords(): string[] {
  return Object.keys(wordEnhancements);
}
