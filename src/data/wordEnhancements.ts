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
};

// Helper to get enhancement for a word (case-insensitive)
export function getWordEnhancement(word: string): WordEnhancement | undefined {
  return wordEnhancements[word.toLowerCase()];
}

// Get all words that have enhancements
export function getEnhancedWords(): string[] {
  return Object.keys(wordEnhancements);
}
