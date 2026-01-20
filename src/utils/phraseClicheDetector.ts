/**
 * Phrase-based Cliche Detection
 *
 * This module detects clichéd phrases, idioms, and overused expressions in poetry.
 * Unlike rhyme cliches, this looks for full phrases anywhere in the text.
 *
 * Detection Philosophy:
 * - Only flag cliches when we're highly confident (avoid false positives)
 * - Use fuzzy matching to catch variations (e.g., "heart of gold" vs "hearts of gold")
 * - Categorize cliches to help poets understand the type of expression
 * - Provide gentle, educational feedback rather than harsh criticism
 */

export interface PhraseCliche {
  phrase: string;
  category: string;
  severity: 'mild' | 'moderate' | 'strong'; // How clichéd is it?
  alternatives?: string[]; // Optional suggestions
}

export interface DetectedCliche {
  phrase: string;
  matchedCliche: string;
  category: string;
  severity: 'mild' | 'moderate' | 'strong';
  lineNumber: number;
  startIndex: number;
  endIndex: number;
  confidence: number; // 0-1, how confident we are this is a match
}

// Cliche database - organized by category
// This is loaded from an external file for the full 5000+ database
// Here we define the structure and some core cliches for immediate use

const CORE_CLICHES: PhraseCliche[] = [
  // LOVE/ROMANCE - Strong cliches
  { phrase: 'love at first sight', category: 'Romance', severity: 'strong' },
  { phrase: 'heart of gold', category: 'Romance', severity: 'strong' },
  { phrase: 'head over heels', category: 'Romance', severity: 'strong' },
  { phrase: 'love conquers all', category: 'Romance', severity: 'strong' },
  { phrase: 'soul mate', category: 'Romance', severity: 'strong' },
  { phrase: 'soulmate', category: 'Romance', severity: 'strong' },
  { phrase: 'two hearts beat as one', category: 'Romance', severity: 'strong' },
  { phrase: 'meant to be', category: 'Romance', severity: 'moderate' },
  { phrase: 'written in the stars', category: 'Romance', severity: 'strong' },
  { phrase: 'fall in love', category: 'Romance', severity: 'mild' },
  { phrase: 'madly in love', category: 'Romance', severity: 'moderate' },
  { phrase: 'deeply in love', category: 'Romance', severity: 'moderate' },
  { phrase: 'hopelessly devoted', category: 'Romance', severity: 'moderate' },
  { phrase: 'undying love', category: 'Romance', severity: 'strong' },
  { phrase: 'eternal love', category: 'Romance', severity: 'strong' },
  { phrase: 'true love', category: 'Romance', severity: 'moderate' },
  { phrase: 'first love', category: 'Romance', severity: 'mild' },
  { phrase: 'lost love', category: 'Romance', severity: 'mild' },
  { phrase: 'endless love', category: 'Romance', severity: 'strong' },
  { phrase: 'unconditional love', category: 'Romance', severity: 'moderate' },

  // HEARTBREAK
  { phrase: 'broken heart', category: 'Heartbreak', severity: 'strong' },
  { phrase: 'heart ache', category: 'Heartbreak', severity: 'moderate' },
  { phrase: 'heartache', category: 'Heartbreak', severity: 'moderate' },
  { phrase: 'heart break', category: 'Heartbreak', severity: 'strong' },
  { phrase: 'shattered heart', category: 'Heartbreak', severity: 'strong' },
  { phrase: 'torn apart', category: 'Heartbreak', severity: 'moderate' },
  { phrase: 'falling apart', category: 'Heartbreak', severity: 'moderate' },
  { phrase: 'pick up the pieces', category: 'Heartbreak', severity: 'strong' },
  { phrase: 'mend a broken heart', category: 'Heartbreak', severity: 'strong' },
  { phrase: 'wounds that never heal', category: 'Heartbreak', severity: 'strong' },
  { phrase: 'scars that remain', category: 'Heartbreak', severity: 'moderate' },

  // TIME
  { phrase: 'time flies', category: 'Time', severity: 'strong' },
  { phrase: 'time heals all wounds', category: 'Time', severity: 'strong' },
  { phrase: 'time stands still', category: 'Time', severity: 'strong' },
  { phrase: 'stood still', category: 'Time', severity: 'moderate' },
  { phrase: 'sands of time', category: 'Time', severity: 'strong' },
  { phrase: 'in the nick of time', category: 'Time', severity: 'strong' },
  { phrase: 'once upon a time', category: 'Time', severity: 'strong' },
  { phrase: 'better late than never', category: 'Time', severity: 'strong' },
  { phrase: 'time will tell', category: 'Time', severity: 'strong' },
  { phrase: 'against time', category: 'Time', severity: 'mild' },
  { phrase: 'race against time', category: 'Time', severity: 'moderate' },
  { phrase: 'lost in time', category: 'Time', severity: 'moderate' },
  { phrase: 'test of time', category: 'Time', severity: 'moderate' },
  { phrase: 'turn back time', category: 'Time', severity: 'moderate' },
  { phrase: 'moment in time', category: 'Time', severity: 'moderate' },
  { phrase: 'fleeting moment', category: 'Time', severity: 'moderate' },

  // NATURE/WEATHER
  { phrase: 'calm before the storm', category: 'Weather', severity: 'strong' },
  { phrase: 'weather the storm', category: 'Weather', severity: 'strong' },
  { phrase: 'raining cats and dogs', category: 'Weather', severity: 'strong' },
  { phrase: 'silver lining', category: 'Weather', severity: 'strong' },
  { phrase: 'every cloud has a silver lining', category: 'Weather', severity: 'strong' },
  { phrase: 'under the weather', category: 'Weather', severity: 'strong' },
  { phrase: 'ray of sunshine', category: 'Weather', severity: 'moderate' },
  { phrase: 'ray of light', category: 'Weather', severity: 'moderate' },
  { phrase: 'bolt from the blue', category: 'Weather', severity: 'strong' },
  { phrase: 'out of the blue', category: 'Weather', severity: 'strong' },
  { phrase: 'clear blue sky', category: 'Nature', severity: 'moderate' },
  { phrase: 'blue sky', category: 'Nature', severity: 'mild' },
  { phrase: 'starry night', category: 'Nature', severity: 'moderate' },
  { phrase: 'starlit sky', category: 'Nature', severity: 'moderate' },
  { phrase: 'moonlit night', category: 'Nature', severity: 'moderate' },
  { phrase: 'babbling brook', category: 'Nature', severity: 'strong' },
  { phrase: 'gentle breeze', category: 'Nature', severity: 'moderate' },
  { phrase: 'whispering wind', category: 'Nature', severity: 'moderate' },
  { phrase: 'howling wind', category: 'Nature', severity: 'moderate' },
  { phrase: 'roaring sea', category: 'Nature', severity: 'moderate' },
  { phrase: 'crashing waves', category: 'Nature', severity: 'moderate' },
  { phrase: 'rolling hills', category: 'Nature', severity: 'moderate' },
  { phrase: 'towering mountains', category: 'Nature', severity: 'moderate' },
  { phrase: 'majestic mountain', category: 'Nature', severity: 'moderate' },
  { phrase: 'verdant meadow', category: 'Nature', severity: 'moderate' },
  { phrase: 'lush green', category: 'Nature', severity: 'mild' },
  { phrase: 'blanket of snow', category: 'Nature', severity: 'moderate' },
  { phrase: 'carpet of flowers', category: 'Nature', severity: 'moderate' },
  { phrase: 'sea of flowers', category: 'Nature', severity: 'moderate' },

  // DEATH/DARKNESS
  { phrase: 'rest in peace', category: 'Death', severity: 'strong' },
  { phrase: 'six feet under', category: 'Death', severity: 'strong' },
  { phrase: 'meet your maker', category: 'Death', severity: 'strong' },
  { phrase: 'grim reaper', category: 'Death', severity: 'strong' },
  { phrase: 'deathly silence', category: 'Death', severity: 'strong' },
  { phrase: 'dead silence', category: 'Death', severity: 'moderate' },
  { phrase: 'dead of night', category: 'Darkness', severity: 'strong' },
  { phrase: 'darkest hour', category: 'Darkness', severity: 'strong' },
  { phrase: 'dark night of the soul', category: 'Darkness', severity: 'strong' },
  { phrase: 'pitch black', category: 'Darkness', severity: 'moderate' },
  { phrase: 'engulfed in darkness', category: 'Darkness', severity: 'moderate' },
  { phrase: 'consumed by darkness', category: 'Darkness', severity: 'moderate' },
  { phrase: 'darkness falls', category: 'Darkness', severity: 'moderate' },
  { phrase: 'endless night', category: 'Darkness', severity: 'moderate' },
  { phrase: 'eternal darkness', category: 'Darkness', severity: 'moderate' },
  { phrase: 'shadow of death', category: 'Death', severity: 'strong' },
  { phrase: 'vale of tears', category: 'Death', severity: 'strong' },
  { phrase: 'valley of the shadow', category: 'Death', severity: 'strong' },

  // JOURNEY/PATH
  { phrase: 'light at the end of the tunnel', category: 'Journey', severity: 'strong' },
  { phrase: 'at a crossroads', category: 'Journey', severity: 'strong' },
  { phrase: 'crossroads', category: 'Journey', severity: 'mild' },
  { phrase: 'fork in the road', category: 'Journey', severity: 'strong' },
  { phrase: 'long and winding road', category: 'Journey', severity: 'strong' },
  { phrase: 'road less traveled', category: 'Journey', severity: 'strong' },
  { phrase: 'path less taken', category: 'Journey', severity: 'strong' },
  { phrase: 'journey of a thousand miles', category: 'Journey', severity: 'strong' },
  { phrase: 'take the plunge', category: 'Journey', severity: 'strong' },
  { phrase: 'leap of faith', category: 'Journey', severity: 'strong' },
  { phrase: 'new beginning', category: 'Journey', severity: 'moderate' },
  { phrase: 'fresh start', category: 'Journey', severity: 'moderate' },
  { phrase: 'turn the page', category: 'Journey', severity: 'moderate' },
  { phrase: 'new chapter', category: 'Journey', severity: 'moderate' },
  { phrase: 'starting over', category: 'Journey', severity: 'mild' },
  { phrase: 'finding my way', category: 'Journey', severity: 'moderate' },
  { phrase: 'lost my way', category: 'Journey', severity: 'moderate' },

  // EMOTIONS
  { phrase: 'tears of joy', category: 'Emotion', severity: 'strong' },
  { phrase: 'tears streaming', category: 'Emotion', severity: 'moderate' },
  { phrase: 'overcome with emotion', category: 'Emotion', severity: 'moderate' },
  { phrase: 'heart skipped a beat', category: 'Emotion', severity: 'strong' },
  { phrase: 'butterflies in my stomach', category: 'Emotion', severity: 'strong' },
  { phrase: 'butterflies in stomach', category: 'Emotion', severity: 'strong' },
  { phrase: 'on cloud nine', category: 'Emotion', severity: 'strong' },
  { phrase: 'over the moon', category: 'Emotion', severity: 'strong' },
  { phrase: 'walking on air', category: 'Emotion', severity: 'strong' },
  { phrase: 'feeling blue', category: 'Emotion', severity: 'strong' },
  { phrase: 'green with envy', category: 'Emotion', severity: 'strong' },
  { phrase: 'seeing red', category: 'Emotion', severity: 'strong' },
  { phrase: 'white as a sheet', category: 'Emotion', severity: 'strong' },
  { phrase: 'white as a ghost', category: 'Emotion', severity: 'strong' },
  { phrase: 'cold feet', category: 'Emotion', severity: 'strong' },
  { phrase: 'heavy heart', category: 'Emotion', severity: 'moderate' },
  { phrase: 'aching heart', category: 'Emotion', severity: 'moderate' },
  { phrase: 'lonely heart', category: 'Emotion', severity: 'moderate' },
  { phrase: 'empty inside', category: 'Emotion', severity: 'moderate' },
  { phrase: 'hollow inside', category: 'Emotion', severity: 'moderate' },
  { phrase: 'numb inside', category: 'Emotion', severity: 'moderate' },

  // WAR/BATTLE
  { phrase: 'battle of wills', category: 'Battle', severity: 'moderate' },
  { phrase: 'fight fire with fire', category: 'Battle', severity: 'strong' },
  { phrase: 'bury the hatchet', category: 'Battle', severity: 'strong' },
  { phrase: 'bite the bullet', category: 'Battle', severity: 'strong' },
  { phrase: 'blood sweat and tears', category: 'Battle', severity: 'strong' },
  { phrase: 'blood, sweat, and tears', category: 'Battle', severity: 'strong' },
  { phrase: 'fight the good fight', category: 'Battle', severity: 'strong' },
  { phrase: 'inner demons', category: 'Battle', severity: 'moderate' },
  { phrase: 'battle scars', category: 'Battle', severity: 'moderate' },
  { phrase: 'warrior spirit', category: 'Battle', severity: 'moderate' },
  { phrase: 'fight to survive', category: 'Battle', severity: 'moderate' },

  // SUCCESS/FAILURE
  { phrase: 'reach for the stars', category: 'Success', severity: 'strong' },
  { phrase: 'shoot for the moon', category: 'Success', severity: 'strong' },
  { phrase: 'sky is the limit', category: 'Success', severity: 'strong' },
  { phrase: 'the sky\'s the limit', category: 'Success', severity: 'strong' },
  { phrase: 'back to square one', category: 'Failure', severity: 'strong' },
  { phrase: 'hit rock bottom', category: 'Failure', severity: 'strong' },
  { phrase: 'rock bottom', category: 'Failure', severity: 'moderate' },
  { phrase: 'down but not out', category: 'Failure', severity: 'strong' },
  { phrase: 'rise from the ashes', category: 'Success', severity: 'strong' },
  { phrase: 'like a phoenix', category: 'Success', severity: 'moderate' },
  { phrase: 'against all odds', category: 'Success', severity: 'strong' },
  { phrase: 'beat the odds', category: 'Success', severity: 'moderate' },
  { phrase: 'come out on top', category: 'Success', severity: 'moderate' },
  { phrase: 'seize the day', category: 'Success', severity: 'strong' },
  { phrase: 'carpe diem', category: 'Success', severity: 'moderate' },
  { phrase: 'follow your dreams', category: 'Success', severity: 'strong' },
  { phrase: 'chase your dreams', category: 'Success', severity: 'strong' },
  { phrase: 'live your dreams', category: 'Success', severity: 'moderate' },
  { phrase: 'make it count', category: 'Success', severity: 'moderate' },

  // BEAUTY/APPEARANCE
  { phrase: 'beauty is in the eye of the beholder', category: 'Beauty', severity: 'strong' },
  { phrase: 'beauty is only skin deep', category: 'Beauty', severity: 'strong' },
  { phrase: 'inner beauty', category: 'Beauty', severity: 'moderate' },
  { phrase: 'true beauty', category: 'Beauty', severity: 'moderate' },
  { phrase: 'radiant beauty', category: 'Beauty', severity: 'moderate' },
  { phrase: 'breathtaking beauty', category: 'Beauty', severity: 'moderate' },
  { phrase: 'stunning beauty', category: 'Beauty', severity: 'mild' },
  { phrase: 'picture perfect', category: 'Beauty', severity: 'moderate' },
  { phrase: 'drop dead gorgeous', category: 'Beauty', severity: 'strong' },

  // POETIC CLICHES (specifically overused in poetry)
  { phrase: 'rose by any other name', category: 'Poetic', severity: 'strong' },
  { phrase: 'thorns and roses', category: 'Poetic', severity: 'moderate' },
  { phrase: 'bed of roses', category: 'Poetic', severity: 'strong' },
  { phrase: 'coming up roses', category: 'Poetic', severity: 'strong' },
  { phrase: 'stop and smell the roses', category: 'Poetic', severity: 'strong' },
  { phrase: 'crimson rose', category: 'Poetic', severity: 'moderate' },
  { phrase: 'blood red rose', category: 'Poetic', severity: 'moderate' },
  { phrase: 'tear drop', category: 'Poetic', severity: 'moderate' },
  { phrase: 'teardrop', category: 'Poetic', severity: 'moderate' },
  { phrase: 'crystal tear', category: 'Poetic', severity: 'moderate' },
  { phrase: 'silent tear', category: 'Poetic', severity: 'moderate' },
  { phrase: 'ocean of tears', category: 'Poetic', severity: 'strong' },
  { phrase: 'sea of tears', category: 'Poetic', severity: 'strong' },
  { phrase: 'river of tears', category: 'Poetic', severity: 'strong' },
  { phrase: 'wings of freedom', category: 'Poetic', severity: 'moderate' },
  { phrase: 'spread my wings', category: 'Poetic', severity: 'moderate' },
  { phrase: 'spread your wings', category: 'Poetic', severity: 'moderate' },
  { phrase: 'learn to fly', category: 'Poetic', severity: 'moderate' },
  { phrase: 'free as a bird', category: 'Poetic', severity: 'strong' },
  { phrase: 'caged bird', category: 'Poetic', severity: 'moderate' },
  { phrase: 'bird in a cage', category: 'Poetic', severity: 'moderate' },
  { phrase: 'singing bird', category: 'Poetic', severity: 'mild' },
  { phrase: 'weeping willow', category: 'Poetic', severity: 'moderate' },
  { phrase: 'dancing flames', category: 'Poetic', severity: 'moderate' },
  { phrase: 'flickering flame', category: 'Poetic', severity: 'moderate' },
  { phrase: 'burning desire', category: 'Poetic', severity: 'strong' },
  { phrase: 'burning passion', category: 'Poetic', severity: 'strong' },
  { phrase: 'smoldering passion', category: 'Poetic', severity: 'moderate' },
  { phrase: 'flame of love', category: 'Poetic', severity: 'strong' },
  { phrase: 'spark of love', category: 'Poetic', severity: 'moderate' },
  { phrase: 'eternal flame', category: 'Poetic', severity: 'strong' },
  { phrase: 'whisper of love', category: 'Poetic', severity: 'moderate' },
  { phrase: 'whispered promises', category: 'Poetic', severity: 'moderate' },
  { phrase: 'tender touch', category: 'Poetic', severity: 'moderate' },
  { phrase: 'gentle touch', category: 'Poetic', severity: 'moderate' },
  { phrase: 'loving embrace', category: 'Poetic', severity: 'moderate' },
  { phrase: 'warm embrace', category: 'Poetic', severity: 'moderate' },

  // LIFE/EXISTENCE
  { phrase: 'circle of life', category: 'Life', severity: 'strong' },
  { phrase: 'wheel of life', category: 'Life', severity: 'moderate' },
  { phrase: 'breath of life', category: 'Life', severity: 'moderate' },
  { phrase: 'gift of life', category: 'Life', severity: 'moderate' },
  { phrase: 'meaning of life', category: 'Life', severity: 'moderate' },
  { phrase: 'such is life', category: 'Life', severity: 'moderate' },
  { phrase: 'that\'s life', category: 'Life', severity: 'moderate' },
  { phrase: 'life goes on', category: 'Life', severity: 'moderate' },
  { phrase: 'larger than life', category: 'Life', severity: 'moderate' },
  { phrase: 'live and learn', category: 'Life', severity: 'strong' },
  { phrase: 'live and let live', category: 'Life', severity: 'strong' },
  { phrase: 'live life to the fullest', category: 'Life', severity: 'strong' },
  { phrase: 'life is short', category: 'Life', severity: 'moderate' },
  { phrase: 'life is precious', category: 'Life', severity: 'moderate' },
  { phrase: 'life is beautiful', category: 'Life', severity: 'moderate' },

  // ANIMALS
  { phrase: 'busy as a bee', category: 'Animal', severity: 'strong' },
  { phrase: 'wolf in sheep\'s clothing', category: 'Animal', severity: 'strong' },
  { phrase: 'like a moth to flame', category: 'Animal', severity: 'strong' },
  { phrase: 'moth to a flame', category: 'Animal', severity: 'strong' },
  { phrase: 'lion\'s share', category: 'Animal', severity: 'strong' },
  { phrase: 'eagle eye', category: 'Animal', severity: 'strong' },
  { phrase: 'eyes like a hawk', category: 'Animal', severity: 'strong' },
  { phrase: 'blind as a bat', category: 'Animal', severity: 'strong' },
  { phrase: 'wise as an owl', category: 'Animal', severity: 'strong' },
  { phrase: 'sly as a fox', category: 'Animal', severity: 'strong' },
  { phrase: 'strong as an ox', category: 'Animal', severity: 'strong' },
  { phrase: 'gentle as a lamb', category: 'Animal', severity: 'strong' },
  { phrase: 'quiet as a mouse', category: 'Animal', severity: 'strong' },
  { phrase: 'slippery as an eel', category: 'Animal', severity: 'strong' },
  { phrase: 'black sheep', category: 'Animal', severity: 'strong' },
  { phrase: 'dark horse', category: 'Animal', severity: 'moderate' },
  { phrase: 'wild horses', category: 'Animal', severity: 'moderate' },
  { phrase: 'wild goose chase', category: 'Animal', severity: 'strong' },
  { phrase: 'sitting duck', category: 'Animal', severity: 'strong' },
  { phrase: 'pecking order', category: 'Animal', severity: 'moderate' },

  // BODY
  { phrase: 'skin deep', category: 'Body', severity: 'moderate' },
  { phrase: 'thick skinned', category: 'Body', severity: 'moderate' },
  { phrase: 'thin skinned', category: 'Body', severity: 'moderate' },
  { phrase: 'blood is thicker than water', category: 'Body', severity: 'strong' },
  { phrase: 'flesh and blood', category: 'Body', severity: 'moderate' },
  { phrase: 'bare bones', category: 'Body', severity: 'moderate' },
  { phrase: 'to the bone', category: 'Body', severity: 'moderate' },
  { phrase: 'in my bones', category: 'Body', severity: 'moderate' },
  { phrase: 'in my blood', category: 'Body', severity: 'moderate' },
  { phrase: 'piercing eyes', category: 'Body', severity: 'moderate' },
  { phrase: 'soul-piercing', category: 'Body', severity: 'moderate' },
  { phrase: 'all ears', category: 'Body', severity: 'strong' },
  { phrase: 'turn a blind eye', category: 'Body', severity: 'strong' },
  { phrase: 'sharp tongue', category: 'Body', severity: 'moderate' },
  { phrase: 'silver tongue', category: 'Body', severity: 'moderate' },

  // SEASONAL
  { phrase: 'spring awakening', category: 'Seasonal', severity: 'moderate' },
  { phrase: 'spring of youth', category: 'Seasonal', severity: 'moderate' },
  { phrase: 'summer breeze', category: 'Seasonal', severity: 'moderate' },
  { phrase: 'endless summer', category: 'Seasonal', severity: 'moderate' },
  { phrase: 'indian summer', category: 'Seasonal', severity: 'moderate' },
  { phrase: 'autumn leaves', category: 'Seasonal', severity: 'moderate' },
  { phrase: 'falling leaves', category: 'Seasonal', severity: 'moderate' },
  { phrase: 'winter of discontent', category: 'Seasonal', severity: 'strong' },
  { phrase: 'dead of winter', category: 'Seasonal', severity: 'moderate' },
  { phrase: 'winter chill', category: 'Seasonal', severity: 'moderate' },
  { phrase: 'cold winter', category: 'Seasonal', severity: 'mild' },
  { phrase: 'spring flowers', category: 'Seasonal', severity: 'mild' },

  // TRUTH/WISDOM
  { phrase: 'moment of truth', category: 'Truth', severity: 'moderate' },
  { phrase: 'truth be told', category: 'Truth', severity: 'moderate' },
  { phrase: 'truth hurts', category: 'Truth', severity: 'moderate' },
  { phrase: 'naked truth', category: 'Truth', severity: 'moderate' },
  { phrase: 'hard truth', category: 'Truth', severity: 'mild' },
  { phrase: 'words of wisdom', category: 'Wisdom', severity: 'moderate' },
  { phrase: 'wise words', category: 'Wisdom', severity: 'moderate' },
  { phrase: 'pearl of wisdom', category: 'Wisdom', severity: 'strong' },
  { phrase: 'live and learn', category: 'Wisdom', severity: 'strong' },
  { phrase: 'learn the hard way', category: 'Wisdom', severity: 'moderate' },
  { phrase: 'hindsight is 20/20', category: 'Wisdom', severity: 'strong' },

  // MIND/THOUGHT
  { phrase: 'peace of mind', category: 'Mind', severity: 'moderate' },
  { phrase: 'piece of mind', category: 'Mind', severity: 'moderate' },
  { phrase: 'food for thought', category: 'Mind', severity: 'strong' },
  { phrase: 'train of thought', category: 'Mind', severity: 'moderate' },
  { phrase: 'lost in thought', category: 'Mind', severity: 'moderate' },
  { phrase: 'deep in thought', category: 'Mind', severity: 'moderate' },
  { phrase: 'mind over matter', category: 'Mind', severity: 'strong' },
  { phrase: 'open mind', category: 'Mind', severity: 'moderate' },
  { phrase: 'clear my mind', category: 'Mind', severity: 'mild' },
  { phrase: 'racing thoughts', category: 'Mind', severity: 'moderate' },
  { phrase: 'wandering mind', category: 'Mind', severity: 'moderate' },

  // HOPE/DREAMS
  { phrase: 'ray of hope', category: 'Hope', severity: 'moderate' },
  { phrase: 'glimmer of hope', category: 'Hope', severity: 'moderate' },
  { phrase: 'beacon of hope', category: 'Hope', severity: 'moderate' },
  { phrase: 'hope springs eternal', category: 'Hope', severity: 'strong' },
  { phrase: 'last hope', category: 'Hope', severity: 'moderate' },
  { phrase: 'beyond hope', category: 'Hope', severity: 'moderate' },
  { phrase: 'dare to dream', category: 'Dreams', severity: 'moderate' },
  { phrase: 'dream come true', category: 'Dreams', severity: 'strong' },
  { phrase: 'pipe dream', category: 'Dreams', severity: 'strong' },
  { phrase: 'living the dream', category: 'Dreams', severity: 'strong' },
  { phrase: 'shattered dreams', category: 'Dreams', severity: 'moderate' },
  { phrase: 'broken dreams', category: 'Dreams', severity: 'moderate' },
  { phrase: 'sweet dreams', category: 'Dreams', severity: 'moderate' },
  { phrase: 'wildest dreams', category: 'Dreams', severity: 'moderate' },

  // ADDITIONAL COMMONLY MISSED CLICHES
  { phrase: 'hit the ground running', category: 'Success', severity: 'strong' },
  { phrase: 'live to fight another day', category: 'Battle', severity: 'strong' },
  { phrase: 'through thick and thin', category: 'Romance', severity: 'strong' },
  { phrase: 'happily ever after', category: 'Romance', severity: 'strong' },
  { phrase: 'match made in heaven', category: 'Romance', severity: 'strong' },
  { phrase: 'forever and a day', category: 'Time', severity: 'strong' },
  { phrase: 'forever and ever', category: 'Time', severity: 'strong' },
  { phrase: 'till death do us part', category: 'Romance', severity: 'strong' },
  { phrase: 'apple of my eye', category: 'Romance', severity: 'strong' },
  { phrase: 'light of my life', category: 'Romance', severity: 'strong' },
  { phrase: 'love of my life', category: 'Romance', severity: 'strong' },
  { phrase: 'best of both worlds', category: 'Success', severity: 'strong' },
  { phrase: 'blessing in disguise', category: 'Success', severity: 'strong' },
  { phrase: 'burning the midnight oil', category: 'Work', severity: 'strong' },
  { phrase: 'tip of the iceberg', category: 'Metaphor', severity: 'strong' },
  { phrase: 'drop in the bucket', category: 'Metaphor', severity: 'strong' },
  { phrase: 'drop in the ocean', category: 'Metaphor', severity: 'strong' },
  { phrase: 'once in a lifetime', category: 'Time', severity: 'strong' },
  { phrase: 'once in a blue moon', category: 'Time', severity: 'strong' },
  { phrase: 'heart and soul', category: 'Emotion', severity: 'strong' },
  { phrase: 'body and soul', category: 'Emotion', severity: 'moderate' },
  { phrase: 'mind body and soul', category: 'Emotion', severity: 'moderate' },
  { phrase: 'one step at a time', category: 'Journey', severity: 'moderate' },
  { phrase: 'step by step', category: 'Journey', severity: 'moderate' },
  { phrase: 'day by day', category: 'Time', severity: 'moderate' },
  { phrase: 'little by little', category: 'Time', severity: 'moderate' },
  { phrase: 'at the end of the day', category: 'Time', severity: 'strong' },
  { phrase: 'when all is said and done', category: 'Time', severity: 'strong' },
  { phrase: 'all said and done', category: 'Time', severity: 'moderate' },
  { phrase: 'bottom of my heart', category: 'Emotion', severity: 'strong' },
  { phrase: 'from the heart', category: 'Emotion', severity: 'moderate' },
  { phrase: 'speak from the heart', category: 'Emotion', severity: 'moderate' },
  { phrase: 'wear your heart on your sleeve', category: 'Emotion', severity: 'strong' },
  { phrase: 'heart on my sleeve', category: 'Emotion', severity: 'strong' },
  { phrase: 'take my breath away', category: 'Emotion', severity: 'strong' },
  { phrase: 'swept off my feet', category: 'Romance', severity: 'strong' },
  { phrase: 'swept me off my feet', category: 'Romance', severity: 'strong' },
  { phrase: 'knight in shining armor', category: 'Romance', severity: 'strong' },
  { phrase: 'prince charming', category: 'Romance', severity: 'strong' },
  { phrase: 'fairy tale ending', category: 'Romance', severity: 'strong' },
  { phrase: 'fairy tale', category: 'Romance', severity: 'moderate' },
  { phrase: 'castle in the sky', category: 'Dreams', severity: 'moderate' },
  { phrase: 'pie in the sky', category: 'Dreams', severity: 'strong' },
  { phrase: 'head in the sand', category: 'Metaphor', severity: 'strong' },
  { phrase: 'head in the clouds', category: 'Dreams', severity: 'moderate' },
  { phrase: 'feet on the ground', category: 'Reality', severity: 'moderate' },
  { phrase: 'down to earth', category: 'Reality', severity: 'moderate' },
  { phrase: 'face the music', category: 'Reality', severity: 'strong' },
  { phrase: 'face the facts', category: 'Reality', severity: 'moderate' },
  { phrase: 'wake up call', category: 'Reality', severity: 'moderate' },
  { phrase: 'rude awakening', category: 'Reality', severity: 'moderate' },
  { phrase: 'eye opener', category: 'Reality', severity: 'moderate' },
  { phrase: 'moment of clarity', category: 'Reality', severity: 'moderate' },
  { phrase: 'see the light', category: 'Enlightenment', severity: 'moderate' },
  { phrase: 'saw the light', category: 'Enlightenment', severity: 'moderate' },
  { phrase: 'in a different light', category: 'Enlightenment', severity: 'moderate' },
  { phrase: 'new light', category: 'Enlightenment', severity: 'mild' },
  { phrase: 'shed light on', category: 'Enlightenment', severity: 'moderate' },
  { phrase: 'come to light', category: 'Enlightenment', severity: 'moderate' },
  { phrase: 'brought to light', category: 'Enlightenment', severity: 'moderate' },
  { phrase: 'guiding light', category: 'Enlightenment', severity: 'moderate' },
  { phrase: 'shining light', category: 'Enlightenment', severity: 'moderate' },
  { phrase: 'inner light', category: 'Enlightenment', severity: 'moderate' },
  { phrase: 'tunnel vision', category: 'Mind', severity: 'moderate' },
  { phrase: 'bird eye view', category: 'Perspective', severity: 'moderate' },
  { phrase: 'birds eye view', category: 'Perspective', severity: 'moderate' },
  { phrase: 'big picture', category: 'Perspective', severity: 'moderate' },
  { phrase: 'grand scheme', category: 'Perspective', severity: 'moderate' },
  { phrase: 'stand tall', category: 'Strength', severity: 'moderate' },
  { phrase: 'head held high', category: 'Strength', severity: 'moderate' },
  { phrase: 'hold your head high', category: 'Strength', severity: 'moderate' },
  { phrase: 'keep your head up', category: 'Strength', severity: 'moderate' },
  { phrase: 'chin up', category: 'Strength', severity: 'moderate' },
  { phrase: 'stay strong', category: 'Strength', severity: 'moderate' },
  { phrase: 'inner strength', category: 'Strength', severity: 'moderate' },
  { phrase: 'find the strength', category: 'Strength', severity: 'moderate' },
  { phrase: 'give me strength', category: 'Strength', severity: 'moderate' },
  { phrase: 'tower of strength', category: 'Strength', severity: 'strong' },
  { phrase: 'pillar of strength', category: 'Strength', severity: 'strong' },
  { phrase: 'rock solid', category: 'Strength', severity: 'moderate' },
  { phrase: 'solid as a rock', category: 'Strength', severity: 'strong' },
  { phrase: 'steady as a rock', category: 'Strength', severity: 'strong' },
  { phrase: 'heart of stone', category: 'Emotion', severity: 'strong' },
  { phrase: 'cold as stone', category: 'Emotion', severity: 'moderate' },
  { phrase: 'cold as ice', category: 'Emotion', severity: 'strong' },
  { phrase: 'ice queen', category: 'Emotion', severity: 'moderate' },
  { phrase: 'ice cold', category: 'Emotion', severity: 'moderate' },
  { phrase: 'break the ice', category: 'Social', severity: 'strong' },
  { phrase: 'tip of my tongue', category: 'Mind', severity: 'strong' },
  { phrase: 'on the tip of my tongue', category: 'Mind', severity: 'strong' },
  { phrase: 'slip of the tongue', category: 'Mind', severity: 'moderate' },
  { phrase: 'tongue tied', category: 'Emotion', severity: 'moderate' },
  { phrase: 'cat got your tongue', category: 'Social', severity: 'strong' },
  { phrase: 'actions speak louder than words', category: 'Wisdom', severity: 'strong' },
  { phrase: 'easier said than done', category: 'Wisdom', severity: 'strong' },
  { phrase: 'practice what you preach', category: 'Wisdom', severity: 'strong' },
  { phrase: 'walk the walk', category: 'Wisdom', severity: 'moderate' },
  { phrase: 'talk the talk', category: 'Wisdom', severity: 'moderate' },
  { phrase: 'put your money where your mouth is', category: 'Wisdom', severity: 'strong' },

  // MONEY/WEALTH
  { phrase: 'money talks', category: 'Money', severity: 'strong' },
  { phrase: 'money doesn\'t grow on trees', category: 'Money', severity: 'strong' },
  { phrase: 'penny for your thoughts', category: 'Money', severity: 'strong' },
  { phrase: 'worth its weight in gold', category: 'Money', severity: 'strong' },
  { phrase: 'golden opportunity', category: 'Money', severity: 'moderate' },
  { phrase: 'strike gold', category: 'Money', severity: 'moderate' },
  { phrase: 'rich as croesus', category: 'Money', severity: 'strong' },
  { phrase: 'rags to riches', category: 'Money', severity: 'strong' },
  { phrase: 'filthy rich', category: 'Money', severity: 'moderate' },
  { phrase: 'dirt poor', category: 'Money', severity: 'moderate' },
  { phrase: 'cost an arm and a leg', category: 'Money', severity: 'strong' },
  { phrase: 'break the bank', category: 'Money', severity: 'strong' },
  { phrase: 'nest egg', category: 'Money', severity: 'moderate' },
  { phrase: 'cash cow', category: 'Money', severity: 'moderate' },
  { phrase: 'time is money', category: 'Money', severity: 'strong' },
  { phrase: 'money can\'t buy happiness', category: 'Money', severity: 'strong' },
  { phrase: 'rich in spirit', category: 'Money', severity: 'moderate' },
  { phrase: 'poor in spirit', category: 'Money', severity: 'moderate' },
  { phrase: 'money to burn', category: 'Money', severity: 'moderate' },
  { phrase: 'tightfisted', category: 'Money', severity: 'moderate' },

  // FOOD/EATING
  { phrase: 'piece of cake', category: 'Food', severity: 'strong' },
  { phrase: 'easy as pie', category: 'Food', severity: 'strong' },
  { phrase: 'icing on the cake', category: 'Food', severity: 'strong' },
  { phrase: 'best thing since sliced bread', category: 'Food', severity: 'strong' },
  { phrase: 'bread and butter', category: 'Food', severity: 'moderate' },
  { phrase: 'bring home the bacon', category: 'Food', severity: 'strong' },
  { phrase: 'butter someone up', category: 'Food', severity: 'strong' },
  { phrase: 'cry over spilt milk', category: 'Food', severity: 'strong' },
  { phrase: 'egg on your face', category: 'Food', severity: 'strong' },
  { phrase: 'half baked', category: 'Food', severity: 'moderate' },
  { phrase: 'hot potato', category: 'Food', severity: 'moderate' },
  { phrase: 'in a nutshell', category: 'Food', severity: 'strong' },
  { phrase: 'out of the frying pan', category: 'Food', severity: 'strong' },
  { phrase: 'spill the beans', category: 'Food', severity: 'strong' },
  { phrase: 'take with a grain of salt', category: 'Food', severity: 'strong' },
  { phrase: 'the whole enchilada', category: 'Food', severity: 'moderate' },
  { phrase: 'apple of discord', category: 'Food', severity: 'moderate' },
  { phrase: 'bad apple', category: 'Food', severity: 'moderate' },
  { phrase: 'sour grapes', category: 'Food', severity: 'strong' },
  { phrase: 'forbidden fruit', category: 'Food', severity: 'moderate' },
  { phrase: 'low hanging fruit', category: 'Food', severity: 'moderate' },
  { phrase: 'cream of the crop', category: 'Food', severity: 'strong' },
  { phrase: 'cherry on top', category: 'Food', severity: 'moderate' },
  { phrase: 'full plate', category: 'Food', severity: 'moderate' },
  { phrase: 'bite off more than you can chew', category: 'Food', severity: 'strong' },
  { phrase: 'have your cake and eat it too', category: 'Food', severity: 'strong' },

  // WATER/SEA
  { phrase: 'like a fish out of water', category: 'Water', severity: 'strong' },
  { phrase: 'plenty of fish in the sea', category: 'Water', severity: 'strong' },
  { phrase: 'dead in the water', category: 'Water', severity: 'strong' },
  { phrase: 'water under the bridge', category: 'Water', severity: 'strong' },
  { phrase: 'test the waters', category: 'Water', severity: 'moderate' },
  { phrase: 'muddy the waters', category: 'Water', severity: 'moderate' },
  { phrase: 'still waters run deep', category: 'Water', severity: 'strong' },
  { phrase: 'in deep water', category: 'Water', severity: 'moderate' },
  { phrase: 'in hot water', category: 'Water', severity: 'moderate' },
  { phrase: 'keep your head above water', category: 'Water', severity: 'strong' },
  { phrase: 'make waves', category: 'Water', severity: 'moderate' },
  { phrase: 'ride the wave', category: 'Water', severity: 'moderate' },
  { phrase: 'sea of change', category: 'Water', severity: 'moderate' },
  { phrase: 'sink or swim', category: 'Water', severity: 'strong' },
  { phrase: 'smooth sailing', category: 'Water', severity: 'strong' },
  { phrase: 'rock the boat', category: 'Water', severity: 'strong' },
  { phrase: 'miss the boat', category: 'Water', severity: 'strong' },
  { phrase: 'in the same boat', category: 'Water', severity: 'strong' },
  { phrase: 'ship has sailed', category: 'Water', severity: 'moderate' },
  { phrase: 'anchor of hope', category: 'Water', severity: 'moderate' },
  { phrase: 'port in a storm', category: 'Water', severity: 'moderate' },
  { phrase: 'drown your sorrows', category: 'Water', severity: 'moderate' },
  { phrase: 'come hell or high water', category: 'Water', severity: 'strong' },
  { phrase: 'blood is thicker than water', category: 'Water', severity: 'strong' },

  // FIRE/HEAT
  { phrase: 'play with fire', category: 'Fire', severity: 'strong' },
  { phrase: 'where there\'s smoke there\'s fire', category: 'Fire', severity: 'strong' },
  { phrase: 'add fuel to the fire', category: 'Fire', severity: 'strong' },
  { phrase: 'fan the flames', category: 'Fire', severity: 'moderate' },
  { phrase: 'out of the fire', category: 'Fire', severity: 'moderate' },
  { phrase: 'trial by fire', category: 'Fire', severity: 'moderate' },
  { phrase: 'baptism by fire', category: 'Fire', severity: 'moderate' },
  { phrase: 'forge in fire', category: 'Fire', severity: 'moderate' },
  { phrase: 'fire in the belly', category: 'Fire', severity: 'moderate' },
  { phrase: 'fire and ice', category: 'Fire', severity: 'moderate' },
  { phrase: 'burning bridges', category: 'Fire', severity: 'strong' },
  { phrase: 'burn the candle at both ends', category: 'Fire', severity: 'strong' },
  { phrase: 'go down in flames', category: 'Fire', severity: 'moderate' },
  { phrase: 'crash and burn', category: 'Fire', severity: 'moderate' },
  { phrase: 'too hot to handle', category: 'Fire', severity: 'moderate' },
  { phrase: 'hot under the collar', category: 'Fire', severity: 'moderate' },
  { phrase: 'heated argument', category: 'Fire', severity: 'mild' },
  { phrase: 'warm welcome', category: 'Fire', severity: 'mild' },
  { phrase: 'warm the heart', category: 'Fire', severity: 'moderate' },
  { phrase: 'cold shoulder', category: 'Fire', severity: 'strong' },

  // LIGHT/DARKNESS
  { phrase: 'light of day', category: 'Light', severity: 'moderate' },
  { phrase: 'see the light of day', category: 'Light', severity: 'moderate' },
  { phrase: 'light the way', category: 'Light', severity: 'moderate' },
  { phrase: 'leading light', category: 'Light', severity: 'moderate' },
  { phrase: 'bright side', category: 'Light', severity: 'moderate' },
  { phrase: 'look on the bright side', category: 'Light', severity: 'strong' },
  { phrase: 'bright future', category: 'Light', severity: 'moderate' },
  { phrase: 'bright idea', category: 'Light', severity: 'moderate' },
  { phrase: 'brighten my day', category: 'Light', severity: 'moderate' },
  { phrase: 'spark of hope', category: 'Light', severity: 'moderate' },
  { phrase: 'spark of life', category: 'Light', severity: 'moderate' },
  { phrase: 'dim view', category: 'Light', severity: 'moderate' },
  { phrase: 'dark days', category: 'Light', severity: 'moderate' },
  { phrase: 'dark times', category: 'Light', severity: 'moderate' },
  { phrase: 'in the dark', category: 'Light', severity: 'moderate' },
  { phrase: 'keep in the dark', category: 'Light', severity: 'moderate' },
  { phrase: 'left in the dark', category: 'Light', severity: 'moderate' },
  { phrase: 'shot in the dark', category: 'Light', severity: 'strong' },
  { phrase: 'dark side', category: 'Light', severity: 'moderate' },
  { phrase: 'shades of grey', category: 'Light', severity: 'moderate' },

  // DOORS/WINDOWS
  { phrase: 'open door', category: 'Doors', severity: 'mild' },
  { phrase: 'door of opportunity', category: 'Doors', severity: 'moderate' },
  { phrase: 'when one door closes another opens', category: 'Doors', severity: 'strong' },
  { phrase: 'foot in the door', category: 'Doors', severity: 'strong' },
  { phrase: 'behind closed doors', category: 'Doors', severity: 'moderate' },
  { phrase: 'show someone the door', category: 'Doors', severity: 'moderate' },
  { phrase: 'knock on wood', category: 'Doors', severity: 'strong' },
  { phrase: 'window of opportunity', category: 'Doors', severity: 'strong' },
  { phrase: 'window to the soul', category: 'Doors', severity: 'strong' },
  { phrase: 'eyes are the window', category: 'Doors', severity: 'strong' },

  // GAMES/SPORTS
  { phrase: 'level playing field', category: 'Sports', severity: 'strong' },
  { phrase: 'par for the course', category: 'Sports', severity: 'strong' },
  { phrase: 'ball is in your court', category: 'Sports', severity: 'strong' },
  { phrase: 'home run', category: 'Sports', severity: 'moderate' },
  { phrase: 'hit it out of the park', category: 'Sports', severity: 'moderate' },
  { phrase: 'knock it out of the park', category: 'Sports', severity: 'moderate' },
  { phrase: 'three strikes', category: 'Sports', severity: 'moderate' },
  { phrase: 'drop the ball', category: 'Sports', severity: 'strong' },
  { phrase: 'game changer', category: 'Sports', severity: 'moderate' },
  { phrase: 'game plan', category: 'Sports', severity: 'moderate' },
  { phrase: 'play hardball', category: 'Sports', severity: 'moderate' },
  { phrase: 'play ball', category: 'Sports', severity: 'mild' },
  { phrase: 'whole new ball game', category: 'Sports', severity: 'strong' },
  { phrase: 'touch base', category: 'Sports', severity: 'moderate' },
  { phrase: 'cover all bases', category: 'Sports', severity: 'moderate' },
  { phrase: 'off base', category: 'Sports', severity: 'moderate' },
  { phrase: 'on the ball', category: 'Sports', severity: 'moderate' },
  { phrase: 'keep your eye on the ball', category: 'Sports', severity: 'strong' },
  { phrase: 'the ball is rolling', category: 'Sports', severity: 'moderate' },
  { phrase: 'get the ball rolling', category: 'Sports', severity: 'strong' },
  { phrase: 'run with it', category: 'Sports', severity: 'moderate' },
  { phrase: 'go the distance', category: 'Sports', severity: 'moderate' },
  { phrase: 'in it for the long haul', category: 'Sports', severity: 'moderate' },
  { phrase: 'marathon not a sprint', category: 'Sports', severity: 'moderate' },
  { phrase: 'win win situation', category: 'Sports', severity: 'strong' },
  { phrase: 'win some lose some', category: 'Sports', severity: 'strong' },
  { phrase: 'play your cards right', category: 'Sports', severity: 'strong' },
  { phrase: 'hold all the cards', category: 'Sports', severity: 'strong' },
  { phrase: 'ace up your sleeve', category: 'Sports', severity: 'strong' },
  { phrase: 'wild card', category: 'Sports', severity: 'moderate' },
  { phrase: 'trump card', category: 'Sports', severity: 'moderate' },
  { phrase: 'show your hand', category: 'Sports', severity: 'moderate' },
  { phrase: 'poker face', category: 'Sports', severity: 'moderate' },
  { phrase: 'roll the dice', category: 'Sports', severity: 'moderate' },
  { phrase: 'dice are loaded', category: 'Sports', severity: 'moderate' },
  { phrase: 'luck of the draw', category: 'Sports', severity: 'moderate' },

  // CLOTHING/FABRIC
  { phrase: 'wear many hats', category: 'Clothing', severity: 'moderate' },
  { phrase: 'hat in the ring', category: 'Clothing', severity: 'moderate' },
  { phrase: 'keep it under your hat', category: 'Clothing', severity: 'strong' },
  { phrase: 'old hat', category: 'Clothing', severity: 'moderate' },
  { phrase: 'at the drop of a hat', category: 'Clothing', severity: 'strong' },
  { phrase: 'fit like a glove', category: 'Clothing', severity: 'strong' },
  { phrase: 'kid gloves', category: 'Clothing', severity: 'moderate' },
  { phrase: 'hand in glove', category: 'Clothing', severity: 'moderate' },
  { phrase: 'roll up your sleeves', category: 'Clothing', severity: 'moderate' },
  { phrase: 'laugh up your sleeve', category: 'Clothing', severity: 'moderate' },
  { phrase: 'up your sleeve', category: 'Clothing', severity: 'moderate' },
  { phrase: 'tighten your belt', category: 'Clothing', severity: 'moderate' },
  { phrase: 'below the belt', category: 'Clothing', severity: 'strong' },
  { phrase: 'pull up your socks', category: 'Clothing', severity: 'moderate' },
  { phrase: 'knock your socks off', category: 'Clothing', severity: 'moderate' },
  { phrase: 'too big for your boots', category: 'Clothing', severity: 'moderate' },
  { phrase: 'fill someone\'s shoes', category: 'Clothing', severity: 'moderate' },
  { phrase: 'if the shoe fits', category: 'Clothing', severity: 'strong' },
  { phrase: 'in someone else\'s shoes', category: 'Clothing', severity: 'strong' },
  { phrase: 'cut from the same cloth', category: 'Clothing', severity: 'strong' },
  { phrase: 'whole cloth', category: 'Clothing', severity: 'moderate' },
  { phrase: 'hang by a thread', category: 'Clothing', severity: 'strong' },
  { phrase: 'lose the thread', category: 'Clothing', severity: 'moderate' },
  { phrase: 'thread of hope', category: 'Clothing', severity: 'moderate' },
  { phrase: 'tied up in knots', category: 'Clothing', severity: 'moderate' },
  { phrase: 'come unraveled', category: 'Clothing', severity: 'moderate' },
  { phrase: 'fabric of society', category: 'Clothing', severity: 'moderate' },
  { phrase: 'woven together', category: 'Clothing', severity: 'moderate' },

  // BUILDING/CONSTRUCTION
  { phrase: 'built on sand', category: 'Building', severity: 'moderate' },
  { phrase: 'cornerstone', category: 'Building', severity: 'moderate' },
  { phrase: 'lay the foundation', category: 'Building', severity: 'moderate' },
  { phrase: 'solid foundation', category: 'Building', severity: 'moderate' },
  { phrase: 'build bridges', category: 'Building', severity: 'moderate' },
  { phrase: 'bridge the gap', category: 'Building', severity: 'moderate' },
  { phrase: 'cross that bridge', category: 'Building', severity: 'strong' },
  { phrase: 'water under the bridge', category: 'Building', severity: 'strong' },
  { phrase: 'brick by brick', category: 'Building', severity: 'moderate' },
  { phrase: 'brick wall', category: 'Building', severity: 'moderate' },
  { phrase: 'hit a wall', category: 'Building', severity: 'moderate' },
  { phrase: 'back against the wall', category: 'Building', severity: 'strong' },
  { phrase: 'writing on the wall', category: 'Building', severity: 'strong' },
  { phrase: 'fly on the wall', category: 'Building', severity: 'moderate' },
  { phrase: 'four walls', category: 'Building', severity: 'mild' },
  { phrase: 'walls have ears', category: 'Building', severity: 'moderate' },
  { phrase: 'hit the roof', category: 'Building', severity: 'moderate' },
  { phrase: 'raise the roof', category: 'Building', severity: 'moderate' },
  { phrase: 'through the roof', category: 'Building', severity: 'moderate' },
  { phrase: 'roof over your head', category: 'Building', severity: 'moderate' },
  { phrase: 'glass ceiling', category: 'Building', severity: 'moderate' },
  { phrase: 'hit the ceiling', category: 'Building', severity: 'moderate' },
  { phrase: 'on the fence', category: 'Building', severity: 'strong' },
  { phrase: 'mend fences', category: 'Building', severity: 'moderate' },
  { phrase: 'good fences make good neighbors', category: 'Building', severity: 'strong' },
  { phrase: 'house of cards', category: 'Building', severity: 'strong' },

  // TREES/PLANTS
  { phrase: 'can\'t see the forest for the trees', category: 'Trees', severity: 'strong' },
  { phrase: 'out of the woods', category: 'Trees', severity: 'strong' },
  { phrase: 'neck of the woods', category: 'Trees', severity: 'moderate' },
  { phrase: 'barking up the wrong tree', category: 'Trees', severity: 'strong' },
  { phrase: 'branch out', category: 'Trees', severity: 'moderate' },
  { phrase: 'turn over a new leaf', category: 'Trees', severity: 'strong' },
  { phrase: 'shake like a leaf', category: 'Trees', severity: 'moderate' },
  { phrase: 'take a leaf', category: 'Trees', severity: 'moderate' },
  { phrase: 'put down roots', category: 'Trees', severity: 'moderate' },
  { phrase: 'deep roots', category: 'Trees', severity: 'moderate' },
  { phrase: 'root of the problem', category: 'Trees', severity: 'moderate' },
  { phrase: 'root cause', category: 'Trees', severity: 'moderate' },
  { phrase: 'grass is greener', category: 'Trees', severity: 'strong' },
  { phrase: 'grass is always greener', category: 'Trees', severity: 'strong' },
  { phrase: 'beat around the bush', category: 'Trees', severity: 'strong' },
  { phrase: 'burning bush', category: 'Trees', severity: 'moderate' },
  { phrase: 'in full bloom', category: 'Trees', severity: 'moderate' },
  { phrase: 'late bloomer', category: 'Trees', severity: 'moderate' },
  { phrase: 'nip in the bud', category: 'Trees', severity: 'strong' },
  { phrase: 'budding romance', category: 'Trees', severity: 'moderate' },
  { phrase: 'plant the seed', category: 'Trees', severity: 'moderate' },
  { phrase: 'seed of doubt', category: 'Trees', severity: 'moderate' },
  { phrase: 'reap what you sow', category: 'Trees', severity: 'strong' },
  { phrase: 'sow wild oats', category: 'Trees', severity: 'strong' },
  { phrase: 'separate the wheat from the chaff', category: 'Trees', severity: 'strong' },
  { phrase: 'flower of youth', category: 'Trees', severity: 'moderate' },
  { phrase: 'garden of eden', category: 'Trees', severity: 'moderate' },
  { phrase: 'path of thorns', category: 'Trees', severity: 'moderate' },
  { phrase: 'crown of thorns', category: 'Trees', severity: 'moderate' },

  // MUSIC/SOUND
  { phrase: 'music to my ears', category: 'Music', severity: 'strong' },
  { phrase: 'face the music', category: 'Music', severity: 'strong' },
  { phrase: 'change your tune', category: 'Music', severity: 'strong' },
  { phrase: 'sing a different tune', category: 'Music', severity: 'moderate' },
  { phrase: 'same old song', category: 'Music', severity: 'moderate' },
  { phrase: 'song and dance', category: 'Music', severity: 'moderate' },
  { phrase: 'swan song', category: 'Music', severity: 'moderate' },
  { phrase: 'for a song', category: 'Music', severity: 'moderate' },
  { phrase: 'strike a chord', category: 'Music', severity: 'moderate' },
  { phrase: 'rings a bell', category: 'Music', severity: 'strong' },
  { phrase: 'saved by the bell', category: 'Music', severity: 'strong' },
  { phrase: 'clear as a bell', category: 'Music', severity: 'moderate' },
  { phrase: 'blow the whistle', category: 'Music', severity: 'moderate' },
  { phrase: 'bells and whistles', category: 'Music', severity: 'moderate' },
  { phrase: 'drum up', category: 'Music', severity: 'moderate' },
  { phrase: 'march to a different drum', category: 'Music', severity: 'strong' },
  { phrase: 'beat of a different drum', category: 'Music', severity: 'strong' },
  { phrase: 'play second fiddle', category: 'Music', severity: 'strong' },
  { phrase: 'fit as a fiddle', category: 'Music', severity: 'strong' },
  { phrase: 'pull strings', category: 'Music', severity: 'moderate' },
  { phrase: 'no strings attached', category: 'Music', severity: 'strong' },
  { phrase: 'harp on', category: 'Music', severity: 'moderate' },
  { phrase: 'blow your own horn', category: 'Music', severity: 'strong' },
  { phrase: 'toot your own horn', category: 'Music', severity: 'strong' },
  { phrase: 'loud and clear', category: 'Music', severity: 'moderate' },
  { phrase: 'fall on deaf ears', category: 'Music', severity: 'strong' },

  // READING/WRITING
  { phrase: 'read between the lines', category: 'Reading', severity: 'strong' },
  { phrase: 'read like a book', category: 'Reading', severity: 'moderate' },
  { phrase: 'by the book', category: 'Reading', severity: 'moderate' },
  { phrase: 'in my book', category: 'Reading', severity: 'moderate' },
  { phrase: 'closed book', category: 'Reading', severity: 'moderate' },
  { phrase: 'open book', category: 'Reading', severity: 'moderate' },
  { phrase: 'book of life', category: 'Reading', severity: 'moderate' },
  { phrase: 'don\'t judge a book by its cover', category: 'Reading', severity: 'strong' },
  { phrase: 'oldest trick in the book', category: 'Reading', severity: 'strong' },
  { phrase: 'throw the book at', category: 'Reading', severity: 'moderate' },
  { phrase: 'on the same page', category: 'Reading', severity: 'strong' },
  { phrase: 'blank page', category: 'Reading', severity: 'moderate' },
  { phrase: 'blank slate', category: 'Reading', severity: 'moderate' },
  { phrase: 'letter of the law', category: 'Reading', severity: 'moderate' },
  { phrase: 'to the letter', category: 'Reading', severity: 'moderate' },
  { phrase: 'red letter day', category: 'Reading', severity: 'moderate' },
  { phrase: 'signed sealed delivered', category: 'Reading', severity: 'moderate' },
  { phrase: 'written in stone', category: 'Reading', severity: 'strong' },
  { phrase: 'set in stone', category: 'Reading', severity: 'strong' },
  { phrase: 'carved in stone', category: 'Reading', severity: 'strong' },

  // HEALTH/MEDICINE
  { phrase: 'bitter pill to swallow', category: 'Health', severity: 'strong' },
  { phrase: 'dose of your own medicine', category: 'Health', severity: 'strong' },
  { phrase: 'what the doctor ordered', category: 'Health', severity: 'strong' },
  { phrase: 'clean bill of health', category: 'Health', severity: 'moderate' },
  { phrase: 'picture of health', category: 'Health', severity: 'moderate' },
  { phrase: 'in the pink', category: 'Health', severity: 'moderate' },
  { phrase: 'on the mend', category: 'Health', severity: 'moderate' },
  { phrase: 'fighting fit', category: 'Health', severity: 'moderate' },
  { phrase: 'hale and hearty', category: 'Health', severity: 'moderate' },
  { phrase: 'alive and kicking', category: 'Health', severity: 'strong' },
  { phrase: 'alive and well', category: 'Health', severity: 'moderate' },
  { phrase: 'sick and tired', category: 'Health', severity: 'strong' },
  { phrase: 'sick at heart', category: 'Health', severity: 'moderate' },
  { phrase: 'sick to my stomach', category: 'Health', severity: 'moderate' },
  { phrase: 'feeling under the weather', category: 'Health', severity: 'strong' },
  { phrase: 'wound that never heals', category: 'Health', severity: 'moderate' },
  { phrase: 'lick your wounds', category: 'Health', severity: 'moderate' },
  { phrase: 'rub salt in the wound', category: 'Health', severity: 'strong' },
  { phrase: 'open old wounds', category: 'Health', severity: 'moderate' },
  { phrase: 'time heals', category: 'Health', severity: 'moderate' },

  // SIGHT/VISION
  { phrase: 'sight for sore eyes', category: 'Vision', severity: 'strong' },
  { phrase: 'out of sight out of mind', category: 'Vision', severity: 'strong' },
  { phrase: 'love at first sight', category: 'Vision', severity: 'strong' },
  { phrase: 'hindsight is 20/20', category: 'Vision', severity: 'strong' },
  { phrase: 'eye to eye', category: 'Vision', severity: 'moderate' },
  { phrase: 'see eye to eye', category: 'Vision', severity: 'strong' },
  { phrase: 'in the public eye', category: 'Vision', severity: 'moderate' },
  { phrase: 'private eye', category: 'Vision', severity: 'moderate' },
  { phrase: 'eye of the beholder', category: 'Vision', severity: 'strong' },
  { phrase: 'keep an eye on', category: 'Vision', severity: 'moderate' },
  { phrase: 'keep an eye out', category: 'Vision', severity: 'moderate' },
  { phrase: 'catch someone\'s eye', category: 'Vision', severity: 'moderate' },
  { phrase: 'turn a blind eye', category: 'Vision', severity: 'strong' },
  { phrase: 'eye for an eye', category: 'Vision', severity: 'strong' },
  { phrase: 'more than meets the eye', category: 'Vision', severity: 'strong' },
  { phrase: 'eagle eyed', category: 'Vision', severity: 'moderate' },
  { phrase: 'eyes wide open', category: 'Vision', severity: 'moderate' },
  { phrase: 'eyes wide shut', category: 'Vision', severity: 'moderate' },
  { phrase: 'feast your eyes', category: 'Vision', severity: 'moderate' },
  { phrase: 'crying your eyes out', category: 'Vision', severity: 'moderate' },

  // HANDS
  { phrase: 'hand in hand', category: 'Hands', severity: 'moderate' },
  { phrase: 'lend a hand', category: 'Hands', severity: 'moderate' },
  { phrase: 'helping hand', category: 'Hands', severity: 'moderate' },
  { phrase: 'upper hand', category: 'Hands', severity: 'moderate' },
  { phrase: 'wash your hands of', category: 'Hands', severity: 'strong' },
  { phrase: 'hands are tied', category: 'Hands', severity: 'strong' },
  { phrase: 'out of hand', category: 'Hands', severity: 'moderate' },
  { phrase: 'hand to mouth', category: 'Hands', severity: 'moderate' },
  { phrase: 'at hand', category: 'Hands', severity: 'mild' },
  { phrase: 'close at hand', category: 'Hands', severity: 'moderate' },
  { phrase: 'in good hands', category: 'Hands', severity: 'moderate' },
  { phrase: 'take matters into your own hands', category: 'Hands', severity: 'strong' },
  { phrase: 'bite the hand that feeds', category: 'Hands', severity: 'strong' },
  { phrase: 'caught red handed', category: 'Hands', severity: 'strong' },
  { phrase: 'heavy handed', category: 'Hands', severity: 'moderate' },
  { phrase: 'empty handed', category: 'Hands', severity: 'moderate' },
  { phrase: 'single handed', category: 'Hands', severity: 'moderate' },
  { phrase: 'old hand', category: 'Hands', severity: 'moderate' },
  { phrase: 'shake hands', category: 'Hands', severity: 'mild' },
  { phrase: 'join hands', category: 'Hands', severity: 'mild' },

  // FEET/WALKING
  { phrase: 'get off on the wrong foot', category: 'Feet', severity: 'strong' },
  { phrase: 'start off on the right foot', category: 'Feet', severity: 'moderate' },
  { phrase: 'put your best foot forward', category: 'Feet', severity: 'strong' },
  { phrase: 'put your foot in your mouth', category: 'Feet', severity: 'strong' },
  { phrase: 'shoot yourself in the foot', category: 'Feet', severity: 'strong' },
  { phrase: 'find your footing', category: 'Feet', severity: 'moderate' },
  { phrase: 'lose your footing', category: 'Feet', severity: 'moderate' },
  { phrase: 'stand on your own two feet', category: 'Feet', severity: 'strong' },
  { phrase: 'back on your feet', category: 'Feet', severity: 'moderate' },
  { phrase: 'drag your feet', category: 'Feet', severity: 'moderate' },
  { phrase: 'itchy feet', category: 'Feet', severity: 'moderate' },
  { phrase: 'land on your feet', category: 'Feet', severity: 'moderate' },
  { phrase: 'one foot in the grave', category: 'Feet', severity: 'strong' },
  { phrase: 'under your feet', category: 'Feet', severity: 'mild' },
  { phrase: 'walk a mile in my shoes', category: 'Feet', severity: 'strong' },
  { phrase: 'walking tall', category: 'Feet', severity: 'moderate' },
  { phrase: 'walk of shame', category: 'Feet', severity: 'moderate' },
  { phrase: 'walk the line', category: 'Feet', severity: 'moderate' },
  { phrase: 'walk on eggshells', category: 'Feet', severity: 'strong' },
  { phrase: 'run for your life', category: 'Feet', severity: 'moderate' },

  // AGE/TIME OF LIFE
  { phrase: 'young at heart', category: 'Age', severity: 'moderate' },
  { phrase: 'old as the hills', category: 'Age', severity: 'strong' },
  { phrase: 'over the hill', category: 'Age', severity: 'strong' },
  { phrase: 'in the prime of life', category: 'Age', severity: 'moderate' },
  { phrase: 'in your prime', category: 'Age', severity: 'moderate' },
  { phrase: 'golden years', category: 'Age', severity: 'moderate' },
  { phrase: 'tender age', category: 'Age', severity: 'moderate' },
  { phrase: 'ripe old age', category: 'Age', severity: 'moderate' },
  { phrase: 'age is just a number', category: 'Age', severity: 'strong' },
  { phrase: 'wise beyond your years', category: 'Age', severity: 'moderate' },
  { phrase: 'old soul', category: 'Age', severity: 'moderate' },
  { phrase: 'young soul', category: 'Age', severity: 'moderate' },
  { phrase: 'second childhood', category: 'Age', severity: 'moderate' },
  { phrase: 'spring chicken', category: 'Age', severity: 'moderate' },
  { phrase: 'no spring chicken', category: 'Age', severity: 'moderate' },
  { phrase: 'long in the tooth', category: 'Age', severity: 'moderate' },
  { phrase: 'set in your ways', category: 'Age', severity: 'moderate' },
  { phrase: 'old habits die hard', category: 'Age', severity: 'strong' },
  { phrase: 'youth is wasted on the young', category: 'Age', severity: 'strong' },
  { phrase: 'cradle to grave', category: 'Age', severity: 'moderate' },

  // MEMORY/FORGETTING
  { phrase: 'slip my mind', category: 'Memory', severity: 'moderate' },
  { phrase: 'in one ear and out the other', category: 'Memory', severity: 'strong' },
  { phrase: 'memory like an elephant', category: 'Memory', severity: 'strong' },
  { phrase: 'memory like a sieve', category: 'Memory', severity: 'moderate' },
  { phrase: 'trip down memory lane', category: 'Memory', severity: 'strong' },
  { phrase: 'walk down memory lane', category: 'Memory', severity: 'strong' },
  { phrase: 'in living memory', category: 'Memory', severity: 'moderate' },
  { phrase: 'commit to memory', category: 'Memory', severity: 'moderate' },
  { phrase: 'jog your memory', category: 'Memory', severity: 'moderate' },
  { phrase: 'refresh your memory', category: 'Memory', severity: 'moderate' },
  { phrase: 'forgive and forget', category: 'Memory', severity: 'strong' },
  { phrase: 'forget about it', category: 'Memory', severity: 'mild' },
  { phrase: 'never forget', category: 'Memory', severity: 'moderate' },
  { phrase: 'gone but not forgotten', category: 'Memory', severity: 'strong' },
  { phrase: 'lost to time', category: 'Memory', severity: 'moderate' },
  { phrase: 'sands of time', category: 'Memory', severity: 'strong' },
  { phrase: 'mists of time', category: 'Memory', severity: 'moderate' },
  { phrase: 'annals of history', category: 'Memory', severity: 'moderate' },
  { phrase: 'pages of history', category: 'Memory', severity: 'moderate' },
  { phrase: 'history repeats itself', category: 'Memory', severity: 'strong' },

  // SLEEP/DREAMS (more)
  { phrase: 'beauty sleep', category: 'Sleep', severity: 'moderate' },
  { phrase: 'sleep tight', category: 'Sleep', severity: 'moderate' },
  { phrase: 'sleep like a baby', category: 'Sleep', severity: 'strong' },
  { phrase: 'sleep like a log', category: 'Sleep', severity: 'strong' },
  { phrase: 'lose sleep over', category: 'Sleep', severity: 'moderate' },
  { phrase: 'sleep on it', category: 'Sleep', severity: 'moderate' },
  { phrase: 'asleep at the wheel', category: 'Sleep', severity: 'moderate' },
  { phrase: 'let sleeping dogs lie', category: 'Sleep', severity: 'strong' },
  { phrase: 'wake up and smell the coffee', category: 'Sleep', severity: 'strong' },
  { phrase: 'bright eyed and bushy tailed', category: 'Sleep', severity: 'strong' },
  { phrase: 'rise and shine', category: 'Sleep', severity: 'moderate' },
  { phrase: 'crack of dawn', category: 'Sleep', severity: 'moderate' },
  { phrase: 'break of day', category: 'Sleep', severity: 'moderate' },
  { phrase: 'first light', category: 'Sleep', severity: 'moderate' },
  { phrase: 'darkest before dawn', category: 'Sleep', severity: 'strong' },
  { phrase: 'new dawn', category: 'Sleep', severity: 'moderate' },
  { phrase: 'dawn of a new era', category: 'Sleep', severity: 'moderate' },
  { phrase: 'nightmare scenario', category: 'Sleep', severity: 'moderate' },
  { phrase: 'living nightmare', category: 'Sleep', severity: 'moderate' },
  { phrase: 'worst nightmare', category: 'Sleep', severity: 'moderate' },

  // COMMUNICATION
  { phrase: 'get the message', category: 'Communication', severity: 'moderate' },
  { phrase: 'loud and clear', category: 'Communication', severity: 'moderate' },
  { phrase: 'crystal clear', category: 'Communication', severity: 'moderate' },
  { phrase: 'clear as day', category: 'Communication', severity: 'moderate' },
  { phrase: 'clear as mud', category: 'Communication', severity: 'moderate' },
  { phrase: 'beat a dead horse', category: 'Communication', severity: 'strong' },
  { phrase: 'preaching to the choir', category: 'Communication', severity: 'strong' },
  { phrase: 'get the ball rolling', category: 'Communication', severity: 'strong' },
  { phrase: 'get the show on the road', category: 'Communication', severity: 'moderate' },
  { phrase: 'get down to brass tacks', category: 'Communication', severity: 'strong' },
  { phrase: 'cut to the chase', category: 'Communication', severity: 'strong' },
  { phrase: 'long story short', category: 'Communication', severity: 'moderate' },
  { phrase: 'bottom line', category: 'Communication', severity: 'moderate' },
  { phrase: 'read my lips', category: 'Communication', severity: 'moderate' },
  { phrase: 'speak volumes', category: 'Communication', severity: 'moderate' },
  { phrase: 'silence is golden', category: 'Communication', severity: 'strong' },
  { phrase: 'heard it through the grapevine', category: 'Communication', severity: 'strong' },
  { phrase: 'word of mouth', category: 'Communication', severity: 'moderate' },
  { phrase: 'spread the word', category: 'Communication', severity: 'moderate' },
  { phrase: 'have the last word', category: 'Communication', severity: 'moderate' },

  // ADDITIONAL - WAR/CONFLICT
  { phrase: 'all is fair in love and war', category: 'War', severity: 'strong' },
  { phrase: 'battle of the sexes', category: 'War', severity: 'moderate' },
  { phrase: 'draw the line', category: 'War', severity: 'moderate' },
  { phrase: 'draw first blood', category: 'War', severity: 'moderate' },
  { phrase: 'front line', category: 'War', severity: 'moderate' },
  { phrase: 'in the line of fire', category: 'War', severity: 'moderate' },
  { phrase: 'line in the sand', category: 'War', severity: 'moderate' },
  { phrase: 'no man\'s land', category: 'War', severity: 'moderate' },
  { phrase: 'war of words', category: 'War', severity: 'moderate' },
  { phrase: 'pick your battles', category: 'War', severity: 'moderate' },
  { phrase: 'choose your battles', category: 'War', severity: 'moderate' },
  { phrase: 'battle cry', category: 'War', severity: 'moderate' },
  { phrase: 'call to arms', category: 'War', severity: 'moderate' },
  { phrase: 'up in arms', category: 'War', severity: 'moderate' },
  { phrase: 'armed to the teeth', category: 'War', severity: 'moderate' },
  { phrase: 'smoking gun', category: 'War', severity: 'moderate' },
  { phrase: 'loaded question', category: 'War', severity: 'moderate' },
  { phrase: 'bite the bullet', category: 'War', severity: 'strong' },
  { phrase: 'silver bullet', category: 'War', severity: 'moderate' },
  { phrase: 'magic bullet', category: 'War', severity: 'moderate' },

  // ADDITIONAL - EMOTIONS
  { phrase: 'on top of the world', category: 'Emotion', severity: 'strong' },
  { phrase: 'down in the dumps', category: 'Emotion', severity: 'strong' },
  { phrase: 'beside myself', category: 'Emotion', severity: 'moderate' },
  { phrase: 'at wit\'s end', category: 'Emotion', severity: 'moderate' },
  { phrase: 'at my wit\'s end', category: 'Emotion', severity: 'moderate' },
  { phrase: 'jump for joy', category: 'Emotion', severity: 'moderate' },
  { phrase: 'tickled pink', category: 'Emotion', severity: 'moderate' },
  { phrase: 'over the moon', category: 'Emotion', severity: 'strong' },
  { phrase: 'cry me a river', category: 'Emotion', severity: 'strong' },
  { phrase: 'have a heart', category: 'Emotion', severity: 'moderate' },
  { phrase: 'change of heart', category: 'Emotion', severity: 'moderate' },
  { phrase: 'from the bottom of my heart', category: 'Emotion', severity: 'strong' },
  { phrase: 'follow your heart', category: 'Emotion', severity: 'strong' },
  { phrase: 'listen to your heart', category: 'Emotion', severity: 'moderate' },
  { phrase: 'cross my heart', category: 'Emotion', severity: 'moderate' },
  { phrase: 'pour your heart out', category: 'Emotion', severity: 'moderate' },
  { phrase: 'bleeding heart', category: 'Emotion', severity: 'moderate' },
  { phrase: 'heart to heart', category: 'Emotion', severity: 'moderate' },
  { phrase: 'heart\'s desire', category: 'Emotion', severity: 'moderate' },
  { phrase: 'affairs of the heart', category: 'Emotion', severity: 'moderate' },

  // ADDITIONAL - KNOWLEDGE/THINKING
  { phrase: 'think outside the box', category: 'Knowledge', severity: 'strong' },
  { phrase: 'no brainer', category: 'Knowledge', severity: 'moderate' },
  { phrase: 'use your head', category: 'Knowledge', severity: 'moderate' },
  { phrase: 'over your head', category: 'Knowledge', severity: 'moderate' },
  { phrase: 'wrap your head around', category: 'Knowledge', severity: 'moderate' },
  { phrase: 'get it through your head', category: 'Knowledge', severity: 'moderate' },
  { phrase: 'keep your wits about you', category: 'Knowledge', severity: 'moderate' },
  { phrase: 'use your noodle', category: 'Knowledge', severity: 'moderate' },
  { phrase: 'brain drain', category: 'Knowledge', severity: 'moderate' },
  { phrase: 'brain storm', category: 'Knowledge', severity: 'moderate' },
  { phrase: 'pick your brain', category: 'Knowledge', severity: 'moderate' },
  { phrase: 'on the same wavelength', category: 'Knowledge', severity: 'moderate' },
  { phrase: 'light bulb moment', category: 'Knowledge', severity: 'moderate' },
  { phrase: 'penny dropped', category: 'Knowledge', severity: 'moderate' },
  { phrase: 'two cents', category: 'Knowledge', severity: 'moderate' },
  { phrase: 'put two and two together', category: 'Knowledge', severity: 'strong' },
  { phrase: 'see the bigger picture', category: 'Knowledge', severity: 'moderate' },
  { phrase: 'connect the dots', category: 'Knowledge', severity: 'moderate' },
  { phrase: 'missing piece', category: 'Knowledge', severity: 'moderate' },
  { phrase: 'puzzle piece', category: 'Knowledge', severity: 'moderate' },

  // ADDITIONAL - RELATIONSHIPS
  { phrase: 'birds of a feather', category: 'Relationships', severity: 'strong' },
  { phrase: 'thick as thieves', category: 'Relationships', severity: 'strong' },
  { phrase: 'two peas in a pod', category: 'Relationships', severity: 'strong' },
  { phrase: 'made for each other', category: 'Relationships', severity: 'strong' },
  { phrase: 'perfect match', category: 'Relationships', severity: 'moderate' },
  { phrase: 'other half', category: 'Relationships', severity: 'moderate' },
  { phrase: 'better half', category: 'Relationships', severity: 'moderate' },
  { phrase: 'kindred spirit', category: 'Relationships', severity: 'moderate' },
  { phrase: 'kindred spirits', category: 'Relationships', severity: 'moderate' },
  { phrase: 'partners in crime', category: 'Relationships', severity: 'moderate' },
  { phrase: 'joined at the hip', category: 'Relationships', severity: 'strong' },
  { phrase: 'inseparable', category: 'Relationships', severity: 'mild' },
  { phrase: 'bosom buddies', category: 'Relationships', severity: 'moderate' },
  { phrase: 'blood brothers', category: 'Relationships', severity: 'moderate' },
  { phrase: 'blood sisters', category: 'Relationships', severity: 'moderate' },
  { phrase: 'bound by blood', category: 'Relationships', severity: 'moderate' },
  { phrase: 'flesh of my flesh', category: 'Relationships', severity: 'moderate' },
  { phrase: 'apple doesn\'t fall far from the tree', category: 'Relationships', severity: 'strong' },
  { phrase: 'chip off the old block', category: 'Relationships', severity: 'strong' },
  { phrase: 'spitting image', category: 'Relationships', severity: 'strong' },

  // ADDITIONAL - WORK/EFFORT
  { phrase: 'back to the drawing board', category: 'Work', severity: 'strong' },
  { phrase: 'back to basics', category: 'Work', severity: 'moderate' },
  { phrase: 'get your ducks in a row', category: 'Work', severity: 'strong' },
  { phrase: 'all hands on deck', category: 'Work', severity: 'strong' },
  { phrase: 'pulling your weight', category: 'Work', severity: 'moderate' },
  { phrase: 'shoulder the burden', category: 'Work', severity: 'moderate' },
  { phrase: 'carry the weight', category: 'Work', severity: 'moderate' },
  { phrase: 'carry the load', category: 'Work', severity: 'moderate' },
  { phrase: 'weight of the world', category: 'Work', severity: 'strong' },
  { phrase: 'heavy lifting', category: 'Work', severity: 'moderate' },
  { phrase: 'sweat equity', category: 'Work', severity: 'moderate' },
  { phrase: 'elbow grease', category: 'Work', severity: 'moderate' },
  { phrase: 'nose to the grindstone', category: 'Work', severity: 'strong' },
  { phrase: 'shoulder to the wheel', category: 'Work', severity: 'strong' },
  { phrase: 'pedal to the metal', category: 'Work', severity: 'moderate' },
  { phrase: 'full steam ahead', category: 'Work', severity: 'moderate' },
  { phrase: 'full throttle', category: 'Work', severity: 'moderate' },
  { phrase: 'in full swing', category: 'Work', severity: 'moderate' },
  { phrase: 'get cracking', category: 'Work', severity: 'moderate' },
  { phrase: 'crack the whip', category: 'Work', severity: 'moderate' },

  // ADDITIONAL - WEATHER/CLIMATE
  { phrase: 'fair weather friend', category: 'Weather', severity: 'strong' },
  { phrase: 'rain check', category: 'Weather', severity: 'moderate' },
  { phrase: 'take a rain check', category: 'Weather', severity: 'moderate' },
  { phrase: 'cloudy day', category: 'Weather', severity: 'mild' },
  { phrase: 'sunny day', category: 'Weather', severity: 'mild' },
  { phrase: 'sunny skies', category: 'Weather', severity: 'mild' },
  { phrase: 'clear skies', category: 'Weather', severity: 'mild' },
  { phrase: 'stormy seas', category: 'Weather', severity: 'moderate' },
  { phrase: 'rough seas', category: 'Weather', severity: 'moderate' },
  { phrase: 'choppy waters', category: 'Weather', severity: 'moderate' },
  { phrase: 'uncharted waters', category: 'Weather', severity: 'moderate' },
  { phrase: 'calm waters', category: 'Weather', severity: 'moderate' },
  { phrase: 'perfect storm', category: 'Weather', severity: 'strong' },
  { phrase: 'eye of the storm', category: 'Weather', severity: 'moderate' },
  { phrase: 'storm clouds', category: 'Weather', severity: 'moderate' },
  { phrase: 'gathering clouds', category: 'Weather', severity: 'moderate' },
  { phrase: 'parting clouds', category: 'Weather', severity: 'moderate' },
  { phrase: 'break in the clouds', category: 'Weather', severity: 'moderate' },
  { phrase: 'head in the clouds', category: 'Weather', severity: 'strong' },
  { phrase: 'cloud of doubt', category: 'Weather', severity: 'moderate' },

  // ADDITIONAL - MISCELLANEOUS COMMON
  { phrase: 'better safe than sorry', category: 'Common', severity: 'strong' },
  { phrase: 'last but not least', category: 'Common', severity: 'strong' },
  { phrase: 'first and foremost', category: 'Common', severity: 'moderate' },
  { phrase: 'above and beyond', category: 'Common', severity: 'moderate' },
  { phrase: 'each and every', category: 'Common', severity: 'moderate' },
  { phrase: 'one and only', category: 'Common', severity: 'moderate' },
  { phrase: 'once and for all', category: 'Common', severity: 'moderate' },
  { phrase: 'now or never', category: 'Common', severity: 'strong' },
  { phrase: 'do or die', category: 'Common', severity: 'moderate' },
  { phrase: 'make or break', category: 'Common', severity: 'moderate' },
  { phrase: 'sink or swim', category: 'Common', severity: 'strong' },
  { phrase: 'hit or miss', category: 'Common', severity: 'moderate' },
  { phrase: 'give or take', category: 'Common', severity: 'moderate' },
  { phrase: 'all or nothing', category: 'Common', severity: 'moderate' },
  { phrase: 'sooner or later', category: 'Common', severity: 'moderate' },
  { phrase: 'more or less', category: 'Common', severity: 'mild' },
  { phrase: 'believe it or not', category: 'Common', severity: 'moderate' },
  { phrase: 'like it or not', category: 'Common', severity: 'moderate' },
  { phrase: 'ready or not', category: 'Common', severity: 'moderate' },
  { phrase: 'come what may', category: 'Common', severity: 'moderate' },
  { phrase: 'what goes around comes around', category: 'Common', severity: 'strong' },
  { phrase: 'that\'s the way the cookie crumbles', category: 'Common', severity: 'strong' },
  { phrase: 'every rose has its thorn', category: 'Common', severity: 'strong' },
  { phrase: 'absence makes the heart grow fonder', category: 'Common', severity: 'strong' },
  { phrase: 'ignorance is bliss', category: 'Common', severity: 'strong' },
  { phrase: 'curiosity killed the cat', category: 'Common', severity: 'strong' },
];

// Full cliche database - will be populated from external source
let fullClicheDatabase: PhraseCliche[] = [...CORE_CLICHES];

/**
 * Load additional cliches from external source
 */
export function loadClicheDatabase(cliches: PhraseCliche[]): void {
  fullClicheDatabase = [...CORE_CLICHES, ...cliches];
}

/**
 * Get current database size
 */
export function getClicheDatabaseSize(): number {
  return fullClicheDatabase.length;
}

/**
 * Normalize text for matching (lowercase, remove extra spaces, handle contractions)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Create word variations for fuzzy matching
 * Handles plurals, verb forms, possessives
 */
function createVariations(phrase: string): string[] {
  const variations = [phrase];
  const words = phrase.split(' ');

  // Try singular/plural variations for nouns
  const pluralMappings: Record<string, string> = {
    'heart': 'hearts',
    'tear': 'tears',
    'dream': 'dreams',
    'star': 'stars',
    'wing': 'wings',
    'rose': 'roses',
    'flame': 'flames',
    'wave': 'waves',
    'stone': 'stones',
    'bone': 'bones',
    'wound': 'wounds',
    'scar': 'scars',
  };

  // Add variations with plurals swapped
  for (const [singular, plural] of Object.entries(pluralMappings)) {
    if (phrase.includes(singular)) {
      variations.push(phrase.replace(singular, plural));
    }
    if (phrase.includes(plural)) {
      variations.push(phrase.replace(plural, singular));
    }
  }

  // Handle "my"/"your"/"his"/"her"/"our"/"their" variations
  const pronouns = ['my', 'your', 'his', 'her', 'our', 'their', 'its'];
  for (const pronoun of pronouns) {
    if (words.includes(pronoun)) {
      for (const otherPronoun of pronouns) {
        if (pronoun !== otherPronoun) {
          variations.push(phrase.replace(new RegExp(`\\b${pronoun}\\b`, 'g'), otherPronoun));
        }
      }
    }
  }

  // Handle "a"/"the" variations
  if (phrase.includes(' a ')) {
    variations.push(phrase.replace(' a ', ' the '));
  }
  if (phrase.includes(' the ')) {
    variations.push(phrase.replace(' the ', ' a '));
  }

  return [...new Set(variations)];
}

/**
 * Calculate confidence score for a match
 * Higher score = more confident it's a real cliche match
 */
function calculateConfidence(
  originalPhrase: string,
  matchedCliche: string,
  _context: string
): number {
  let confidence = 1.0;

  // Exact match = highest confidence
  if (originalPhrase === matchedCliche) {
    return 1.0;
  }

  // Check if it's a minor variation (pronoun swap, plural)
  const normalizedOriginal = normalizeText(originalPhrase);
  const normalizedCliche = normalizeText(matchedCliche);

  // Very similar length = higher confidence
  const lengthRatio = Math.min(normalizedOriginal.length, normalizedCliche.length) /
                      Math.max(normalizedOriginal.length, normalizedCliche.length);
  confidence *= lengthRatio;

  // Check word overlap
  const originalWords = new Set(normalizedOriginal.split(' '));
  const clicheWords = new Set(normalizedCliche.split(' '));
  const overlap = [...originalWords].filter(w => clicheWords.has(w)).length;
  const overlapRatio = overlap / Math.max(originalWords.size, clicheWords.size);
  confidence *= (0.5 + overlapRatio * 0.5);

  return Math.max(0.5, Math.min(1.0, confidence));
}

/**
 * Detect cliches in a poem text
 * Returns array of detected cliches with their locations
 */
export function detectCliches(text: string): DetectedCliche[] {
  const detected: DetectedCliche[] = [];
  const lines = text.split('\n');

  // Track what we've already matched to avoid duplicates
  const matchedRanges: Set<string> = new Set();

  // Process each line separately for accurate line numbers
  let globalCharOffset = 0;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const normalizedLine = normalizeText(line);
    const lineNumber = lineIdx + 1;

    for (const cliche of fullClicheDatabase) {
      const variations = createVariations(cliche.phrase);

      for (const variation of variations) {
        const normalizedVariation = normalizeText(variation);

        // Use regex for word boundary matching
        // Escape special regex characters in the variation
        const escapedVariation = normalizedVariation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Match with optional word boundaries (allow partial at start/end of line)
        const regex = new RegExp(`(?:^|\\s|[.,!?;:'"()-])${escapedVariation}(?:$|\\s|[.,!?;:'"()-])`, 'gi');

        let match;
        while ((match = regex.exec(normalizedLine)) !== null) {
          // Adjust index to account for possible leading boundary character
          let matchStart = match.index;
          const fullMatch = match[0];

          // Find where the actual cliche starts (skip leading punctuation/space)
          const leadingChars = fullMatch.match(/^[\s.,!?;:'"()-]*/)?.[0]?.length || 0;
          matchStart += leadingChars;

          // Find the actual matched text in the original line
          // Search the original line (case-insensitive) near this position
          const originalLineLC = line.toLowerCase();
          const searchStart = Math.max(0, matchStart - 5);
          const actualIndex = originalLineLC.indexOf(normalizedVariation, searchStart);

          if (actualIndex === -1) continue;

          const rangeKey = `${lineNumber}-${actualIndex}-${actualIndex + normalizedVariation.length}`;

          // Skip if we've already matched this range
          if (matchedRanges.has(rangeKey)) {
            continue;
          }

          // Extract the actual phrase from original text
          const matchedPhrase = line.substring(actualIndex, actualIndex + normalizedVariation.length);

          // Calculate confidence
          const confidence = calculateConfidence(matchedPhrase, cliche.phrase, text);

          // Only report if confidence is high enough
          if (confidence >= 0.7) {
            detected.push({
              phrase: matchedPhrase,
              matchedCliche: cliche.phrase,
              category: cliche.category,
              severity: cliche.severity,
              lineNumber,
              startIndex: globalCharOffset + actualIndex,
              endIndex: globalCharOffset + actualIndex + matchedPhrase.length,
              confidence
            });

            matchedRanges.add(rangeKey);
          }

          // Prevent infinite loop by moving past this match
          regex.lastIndex = match.index + 1;
        }
      }
    }

    globalCharOffset += line.length + 1; // +1 for newline
  }

  // Sort by line number, then by start index
  detected.sort((a, b) => {
    if (a.lineNumber !== b.lineNumber) return a.lineNumber - b.lineNumber;
    return a.startIndex - b.startIndex;
  });

  // Remove overlapping detections, keeping the one with higher confidence
  const filtered: DetectedCliche[] = [];
  for (const detection of detected) {
    const overlapping = filtered.find(d =>
      !(detection.endIndex <= d.startIndex || detection.startIndex >= d.endIndex)
    );

    if (!overlapping) {
      filtered.push(detection);
    } else if (detection.confidence > overlapping.confidence) {
      // Replace with higher confidence match
      const idx = filtered.indexOf(overlapping);
      filtered[idx] = detection;
    }
  }

  return filtered;
}

/**
 * Get cliche analysis summary for a poem
 */
export interface ClicheAnalysis {
  totalClichesFound: number;
  strongCliches: DetectedCliche[];
  moderateCliches: DetectedCliche[];
  mildCliches: DetectedCliche[];
  categoryCounts: Record<string, number>;
  overallScore: number; // 0-100, higher = more original
}

export function analyzeCliches(text: string): ClicheAnalysis {
  const detected = detectCliches(text);

  const strongCliches = detected.filter(d => d.severity === 'strong');
  const moderateCliches = detected.filter(d => d.severity === 'moderate');
  const mildCliches = detected.filter(d => d.severity === 'mild');

  // Count by category
  const categoryCounts: Record<string, number> = {};
  for (const cliche of detected) {
    categoryCounts[cliche.category] = (categoryCounts[cliche.category] || 0) + 1;
  }

  // Calculate overall originality score
  // Penalize based on number and severity of cliches relative to text length
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const clichePenalty =
    (strongCliches.length * 15) +
    (moderateCliches.length * 8) +
    (mildCliches.length * 3);

  // Normalize penalty by word count (longer poems can have more without penalty)
  const normalizedPenalty = clichePenalty / Math.max(1, wordCount / 50);
  const overallScore = Math.max(0, Math.min(100, 100 - normalizedPenalty));

  return {
    totalClichesFound: detected.length,
    strongCliches,
    moderateCliches,
    mildCliches,
    categoryCounts,
    overallScore: Math.round(overallScore)
  };
}

/**
 * Get all cliche categories in the database
 */
export function getClicheCategories(): string[] {
  const categories = new Set(fullClicheDatabase.map(c => c.category));
  return Array.from(categories).sort();
}
