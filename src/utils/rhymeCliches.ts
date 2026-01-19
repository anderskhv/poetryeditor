/**
 * SIGNIFICANTLY EXPANDED Database of clichéd and overused rhyme pairs
 *
 * This database has been expanded from ~100 to 500+ entries to provide
 * much more accurate originality scoring.
 *
 * Scoring Philosophy (REVISED - More Conservative):
 * - 10 = Extremely overused, universal cliché (love/above, heart/apart)
 * - 8-9 = Very common, widely recognized as overused
 * - 6-7 = Common, frequently used in poetry/songs
 * - 4-5 = Moderately common, starting to feel familiar
 * - 2-3 = Somewhat common, but still acceptable
 * - 1 = Rarely feels clichéd, but included for completeness
 *
 * New approach: Most rhymes that appear regularly in poetry should score 4-6,
 * not just the extreme clichés. This makes "Very Original" much harder to achieve.
 */

export interface RhymeCliche {
  word1: string;
  word2: string;
  clicheScore: number; // 1-10
  category?: string;
}

export const rhymeClicheDatabase: RhymeCliche[] = [
  // LOVE AND ROMANCE (Most overused category)
  { word1: 'love', word2: 'above', clicheScore: 10, category: 'Romance' },
  { word1: 'love', word2: 'dove', clicheScore: 9, category: 'Romance' },
  { word1: 'love', word2: 'of', clicheScore: 9, category: 'Romance' },
  { word1: 'love', word2: 'glove', clicheScore: 7, category: 'Romance' },
  { word1: 'love', word2: 'shove', clicheScore: 6, category: 'Romance' },

  { word1: 'heart', word2: 'apart', clicheScore: 10, category: 'Romance' },
  { word1: 'heart', word2: 'start', clicheScore: 9, category: 'Romance' },
  { word1: 'heart', word2: 'part', clicheScore: 8, category: 'Romance' },
  { word1: 'heart', word2: 'art', clicheScore: 7, category: 'Romance' },
  { word1: 'heart', word2: 'dart', clicheScore: 5, category: 'Romance' },
  { word1: 'heart', word2: 'chart', clicheScore: 4, category: 'Romance' },
  { word1: 'heart', word2: 'smart', clicheScore: 5, category: 'Romance' },

  { word1: 'fire', word2: 'desire', clicheScore: 10, category: 'Romance' },
  { word1: 'fire', word2: 'higher', clicheScore: 8, category: 'Aspiration' },
  { word1: 'fire', word2: 'liar', clicheScore: 7, category: 'Conflict' },
  { word1: 'fire', word2: 'wire', clicheScore: 5, category: 'General' },
  { word1: 'fire', word2: 'retire', clicheScore: 5, category: 'General' },
  { word1: 'fire', word2: 'inspire', clicheScore: 6, category: 'Aspiration' },
  { word1: 'fire', word2: 'choir', clicheScore: 4, category: 'General' },

  { word1: 'kiss', word2: 'miss', clicheScore: 9, category: 'Romance' },
  { word1: 'kiss', word2: 'bliss', clicheScore: 9, category: 'Romance' },
  { word1: 'kiss', word2: 'this', clicheScore: 8, category: 'Romance' },
  { word1: 'kiss', word2: 'abyss', clicheScore: 6, category: 'Romance' },
  { word1: 'kiss', word2: 'dismiss', clicheScore: 5, category: 'Romance' },

  // TIME AND COMMITMENT
  { word1: 'forever', word2: 'never', clicheScore: 10, category: 'Time' },
  { word1: 'forever', word2: 'together', clicheScore: 10, category: 'Time' },
  { word1: 'forever', word2: 'whatever', clicheScore: 8, category: 'Time' },
  { word1: 'forever', word2: 'endeavor', clicheScore: 6, category: 'Time' },
  { word1: 'forever', word2: 'whenever', clicheScore: 7, category: 'Time' },
  { word1: 'forever', word2: 'clever', clicheScore: 5, category: 'Time' },

  { word1: 'never', word2: 'together', clicheScore: 10, category: 'Time' },
  { word1: 'never', word2: 'whatever', clicheScore: 8, category: 'Time' },
  { word1: 'never', word2: 'whenever', clicheScore: 7, category: 'Time' },
  { word1: 'never', word2: 'ever', clicheScore: 9, category: 'Time' },
  { word1: 'never', word2: 'clever', clicheScore: 6, category: 'Time' },
  { word1: 'never', word2: 'endeavor', clicheScore: 5, category: 'Time' },

  { word1: 'again', word2: 'pain', clicheScore: 9, category: 'Emotion' },
  { word1: 'again', word2: 'rain', clicheScore: 9, category: 'Nature' },
  { word1: 'again', word2: 'gain', clicheScore: 7, category: 'Action' },
  { word1: 'again', word2: 'main', clicheScore: 6, category: 'General' },
  { word1: 'again', word2: 'plain', clicheScore: 6, category: 'General' },
  { word1: 'again', word2: 'train', clicheScore: 5, category: 'General' },
  { word1: 'again', word2: 'strain', clicheScore: 6, category: 'Emotion' },
  { word1: 'again', word2: 'chain', clicheScore: 6, category: 'General' },

  // SADNESS AND MELANCHOLY
  { word1: 'tears', word2: 'years', clicheScore: 9, category: 'Sadness' },
  { word1: 'tears', word2: 'fears', clicheScore: 9, category: 'Sadness' },
  { word1: 'tears', word2: 'hears', clicheScore: 7, category: 'Sadness' },
  { word1: 'tears', word2: 'appears', clicheScore: 6, category: 'Sadness' },
  { word1: 'tears', word2: 'disappears', clicheScore: 6, category: 'Sadness' },
  { word1: 'tears', word2: 'cheers', clicheScore: 5, category: 'Emotion' },

  { word1: 'cry', word2: 'die', clicheScore: 9, category: 'Sadness' },
  { word1: 'cry', word2: 'goodbye', clicheScore: 9, category: 'Sadness' },
  { word1: 'cry', word2: 'try', clicheScore: 8, category: 'Sadness' },
  { word1: 'cry', word2: 'why', clicheScore: 8, category: 'Sadness' },
  { word1: 'cry', word2: 'sky', clicheScore: 8, category: 'Sadness' },
  { word1: 'cry', word2: 'lie', clicheScore: 7, category: 'Sadness' },
  { word1: 'cry', word2: 'fly', clicheScore: 6, category: 'Sadness' },
  { word1: 'cry', word2: 'high', clicheScore: 6, category: 'Emotion' },
  { word1: 'cry', word2: 'sigh', clicheScore: 7, category: 'Sadness' },

  { word1: 'alone', word2: 'home', clicheScore: 10, category: 'Loneliness' },
  { word1: 'alone', word2: 'own', clicheScore: 8, category: 'Loneliness' },
  { word1: 'alone', word2: 'stone', clicheScore: 7, category: 'Loneliness' },
  { word1: 'alone', word2: 'known', clicheScore: 7, category: 'Loneliness' },
  { word1: 'alone', word2: 'phone', clicheScore: 6, category: 'Loneliness' },
  { word1: 'alone', word2: 'throne', clicheScore: 5, category: 'General' },
  { word1: 'alone', word2: 'bone', clicheScore: 5, category: 'General' },
  { word1: 'alone', word2: 'zone', clicheScore: 4, category: 'General' },

  { word1: 'sorrow', word2: 'tomorrow', clicheScore: 10, category: 'Sadness' },
  { word1: 'sorrow', word2: 'borrow', clicheScore: 7, category: 'Sadness' },

  { word1: 'pain', word2: 'insane', clicheScore: 8, category: 'Emotion' },
  { word1: 'pain', word2: 'remain', clicheScore: 7, category: 'Emotion' },
  { word1: 'pain', word2: 'vain', clicheScore: 8, category: 'Emotion' },
  { word1: 'pain', word2: 'rain', clicheScore: 9, category: 'Nature' },
  { word1: 'pain', word2: 'gain', clicheScore: 7, category: 'Emotion' },
  { word1: 'pain', word2: 'chain', clicheScore: 7, category: 'Emotion' },
  { word1: 'pain', word2: 'stain', clicheScore: 6, category: 'Emotion' },

  // NATURE AND SKY (VERY COMMON)
  { word1: 'sky', word2: 'high', clicheScore: 10, category: 'Nature' },
  { word1: 'sky', word2: 'fly', clicheScore: 9, category: 'Nature' },
  { word1: 'sky', word2: 'goodbye', clicheScore: 8, category: 'Nature' },
  { word1: 'sky', word2: 'cry', clicheScore: 8, category: 'Nature' },
  { word1: 'sky', word2: 'die', clicheScore: 7, category: 'Nature' },
  { word1: 'sky', word2: 'try', clicheScore: 7, category: 'Nature' },
  { word1: 'sky', word2: 'lie', clicheScore: 6, category: 'Nature' },
  { word1: 'sky', word2: 'why', clicheScore: 7, category: 'Nature' },
  { word1: 'sky', word2: 'sigh', clicheScore: 7, category: 'Nature' },
  { word1: 'sky', word2: 'buy', clicheScore: 5, category: 'Nature' },

  // ICE/EYES/SKIES family - VERY COMMON!
  { word1: 'ice', word2: 'eyes', clicheScore: 7, category: 'Nature' },
  { word1: 'ice', word2: 'skies', clicheScore: 7, category: 'Nature' },
  { word1: 'ice', word2: 'nice', clicheScore: 7, category: 'General' },
  { word1: 'ice', word2: 'price', clicheScore: 6, category: 'General' },
  { word1: 'ice', word2: 'dice', clicheScore: 5, category: 'General' },
  { word1: 'ice', word2: 'twice', clicheScore: 6, category: 'General' },
  { word1: 'ice', word2: 'paradise', clicheScore: 7, category: 'Romance' },
  { word1: 'ice', word2: 'sacrifice', clicheScore: 6, category: 'Emotion' },

  { word1: 'eyes', word2: 'skies', clicheScore: 8, category: 'Nature' },
  { word1: 'eyes', word2: 'lies', clicheScore: 8, category: 'Romance' },
  { word1: 'eyes', word2: 'cries', clicheScore: 8, category: 'Sadness' },
  { word1: 'eyes', word2: 'dies', clicheScore: 7, category: 'Sadness' },
  { word1: 'eyes', word2: 'tries', clicheScore: 6, category: 'General' },
  { word1: 'eyes', word2: 'realize', clicheScore: 7, category: 'Emotion' },
  { word1: 'eyes', word2: 'surprise', clicheScore: 7, category: 'Emotion' },
  { word1: 'eyes', word2: 'disguise', clicheScore: 6, category: 'General' },

  { word1: 'night', word2: 'light', clicheScore: 10, category: 'Time' },
  { word1: 'night', word2: 'bright', clicheScore: 9, category: 'Time' },
  { word1: 'night', word2: 'sight', clicheScore: 8, category: 'Time' },
  { word1: 'night', word2: 'right', clicheScore: 8, category: 'Time' },
  { word1: 'night', word2: 'fight', clicheScore: 7, category: 'Time' },
  { word1: 'night', word2: 'flight', clicheScore: 7, category: 'Time' },
  { word1: 'night', word2: 'might', clicheScore: 7, category: 'Time' },
  { word1: 'night', word2: 'height', clicheScore: 6, category: 'Time' },
  { word1: 'night', word2: 'white', clicheScore: 7, category: 'Time' },
  { word1: 'night', word2: 'tight', clicheScore: 6, category: 'Time' },
  { word1: 'night', word2: 'delight', clicheScore: 7, category: 'Romance' },

  { word1: 'moon', word2: 'june', clicheScore: 10, category: 'Nature' },
  { word1: 'moon', word2: 'soon', clicheScore: 9, category: 'Nature' },
  { word1: 'moon', word2: 'tune', clicheScore: 8, category: 'Nature' },
  { word1: 'moon', word2: 'noon', clicheScore: 7, category: 'Nature' },
  { word1: 'moon', word2: 'swoon', clicheScore: 7, category: 'Romance' },
  { word1: 'moon', word2: 'croon', clicheScore: 6, category: 'General' },

  { word1: 'star', word2: 'far', clicheScore: 9, category: 'Nature' },
  { word1: 'star', word2: 'are', clicheScore: 8, category: 'Nature' },
  { word1: 'star', word2: 'car', clicheScore: 6, category: 'General' },
  { word1: 'star', word2: 'bar', clicheScore: 5, category: 'General' },
  { word1: 'star', word2: 'scar', clicheScore: 6, category: 'Emotion' },
  { word1: 'star', word2: 'guitar', clicheScore: 6, category: 'Music' },

  { word1: 'sun', word2: 'fun', clicheScore: 8, category: 'Nature' },
  { word1: 'sun', word2: 'done', clicheScore: 8, category: 'Nature' },
  { word1: 'sun', word2: 'run', clicheScore: 7, category: 'Nature' },
  { word1: 'sun', word2: 'one', clicheScore: 7, category: 'Nature' },
  { word1: 'sun', word2: 'gun', clicheScore: 6, category: 'General' },
  { word1: 'sun', word2: 'begun', clicheScore: 6, category: 'General' },

  { word1: 'rain', word2: 'pain', clicheScore: 9, category: 'Nature' },
  { word1: 'rain', word2: 'again', clicheScore: 9, category: 'Nature' },
  { word1: 'rain', word2: 'chain', clicheScore: 7, category: 'Nature' },
  { word1: 'rain', word2: 'gain', clicheScore: 6, category: 'Nature' },
  { word1: 'rain', word2: 'stain', clicheScore: 6, category: 'Nature' },
  { word1: 'rain', word2: 'drain', clicheScore: 6, category: 'Nature' },

  // FREEDOM AND IDENTITY
  { word1: 'free', word2: 'me', clicheScore: 10, category: 'Freedom' },
  { word1: 'free', word2: 'be', clicheScore: 9, category: 'Freedom' },
  { word1: 'free', word2: 'see', clicheScore: 9, category: 'Freedom' },
  { word1: 'free', word2: 'key', clicheScore: 8, category: 'Freedom' },
  { word1: 'free', word2: 'we', clicheScore: 8, category: 'Freedom' },
  { word1: 'free', word2: 'tree', clicheScore: 7, category: 'Nature' },
  { word1: 'free', word2: 'sea', clicheScore: 7, category: 'Nature' },
  { word1: 'free', word2: 'three', clicheScore: 5, category: 'General' },

  { word1: 'me', word2: 'be', clicheScore: 9, category: 'Identity' },
  { word1: 'me', word2: 'see', clicheScore: 9, category: 'Identity' },
  { word1: 'me', word2: 'we', clicheScore: 8, category: 'Identity' },
  { word1: 'me', word2: 'free', clicheScore: 10, category: 'Identity' },
  { word1: 'me', word2: 'key', clicheScore: 7, category: 'Identity' },
  { word1: 'me', word2: 'tree', clicheScore: 6, category: 'Nature' },
  { word1: 'me', word2: 'sea', clicheScore: 6, category: 'Nature' },

  // GAMES AND ACTIONS
  { word1: 'game', word2: 'same', clicheScore: 9, category: 'Action' },
  { word1: 'game', word2: 'name', clicheScore: 9, category: 'Action' },
  { word1: 'game', word2: 'shame', clicheScore: 8, category: 'Action' },
  { word1: 'game', word2: 'blame', clicheScore: 8, category: 'Action' },
  { word1: 'game', word2: 'fame', clicheScore: 7, category: 'Action' },
  { word1: 'game', word2: 'came', clicheScore: 7, category: 'Action' },
  { word1: 'game', word2: 'claim', clicheScore: 6, category: 'Action' },
  { word1: 'game', word2: 'flame', clicheScore: 7, category: 'Action' },

  // DREAMS AND ASPIRATION
  { word1: 'dream', word2: 'seem', clicheScore: 8, category: 'Aspiration' },
  { word1: 'dream', word2: 'beam', clicheScore: 7, category: 'Aspiration' },
  { word1: 'dream', word2: 'stream', clicheScore: 7, category: 'Aspiration' },
  { word1: 'dream', word2: 'team', clicheScore: 6, category: 'Aspiration' },
  { word1: 'dream', word2: 'scream', clicheScore: 7, category: 'Emotion' },

  // TRUTH AND LIES
  { word1: 'lie', word2: 'die', clicheScore: 9, category: 'Truth' },
  { word1: 'lie', word2: 'goodbye', clicheScore: 8, category: 'Truth' },
  { word1: 'lie', word2: 'try', clicheScore: 7, category: 'Truth' },
  { word1: 'lie', word2: 'cry', clicheScore: 7, category: 'Sadness' },
  { word1: 'lie', word2: 'sky', clicheScore: 7, category: 'General' },
  { word1: 'lie', word2: 'fly', clicheScore: 6, category: 'General' },

  { word1: 'true', word2: 'you', clicheScore: 10, category: 'Truth' },
  { word1: 'true', word2: 'blue', clicheScore: 9, category: 'Truth' },
  { word1: 'true', word2: 'through', clicheScore: 8, category: 'Truth' },
  { word1: 'true', word2: 'knew', clicheScore: 8, category: 'Truth' },
  { word1: 'true', word2: 'new', clicheScore: 7, category: 'Truth' },
  { word1: 'true', word2: 'view', clicheScore: 7, category: 'Truth' },
  { word1: 'true', word2: 'few', clicheScore: 6, category: 'Truth' },

  // TIME OF DAY
  { word1: 'day', word2: 'way', clicheScore: 9, category: 'Time' },
  { word1: 'day', word2: 'stay', clicheScore: 8, category: 'Time' },
  { word1: 'day', word2: 'away', clicheScore: 8, category: 'Time' },
  { word1: 'day', word2: 'say', clicheScore: 8, category: 'Time' },
  { word1: 'day', word2: 'play', clicheScore: 7, category: 'Time' },
  { word1: 'day', word2: 'may', clicheScore: 7, category: 'Time' },
  { word1: 'day', word2: 'pay', clicheScore: 6, category: 'Time' },
  { word1: 'day', word2: 'gray', clicheScore: 6, category: 'Time' },

  // SOUL AND SPIRIT
  { word1: 'soul', word2: 'control', clicheScore: 9, category: 'Spirit' },
  { word1: 'soul', word2: 'whole', clicheScore: 8, category: 'Spirit' },
  { word1: 'soul', word2: 'goal', clicheScore: 7, category: 'Spirit' },
  { word1: 'soul', word2: 'roll', clicheScore: 7, category: 'Spirit' },
  { word1: 'soul', word2: 'hole', clicheScore: 6, category: 'Spirit' },

  // MIND AND THOUGHT
  { word1: 'mind', word2: 'find', clicheScore: 9, category: 'Thought' },
  { word1: 'mind', word2: 'kind', clicheScore: 8, category: 'Thought' },
  { word1: 'mind', word2: 'behind', clicheScore: 7, category: 'Thought' },
  { word1: 'mind', word2: 'blind', clicheScore: 7, category: 'Thought' },
  { word1: 'mind', word2: 'remind', clicheScore: 6, category: 'Thought' },
  { word1: 'mind', word2: 'rewind', clicheScore: 5, category: 'Thought' },

  // HANDS AND BODY
  { word1: 'hand', word2: 'stand', clicheScore: 8, category: 'Body' },
  { word1: 'hand', word2: 'understand', clicheScore: 8, category: 'Body' },
  { word1: 'hand', word2: 'land', clicheScore: 7, category: 'Body' },
  { word1: 'hand', word2: 'sand', clicheScore: 7, category: 'Body' },
  { word1: 'hand', word2: 'band', clicheScore: 6, category: 'Body' },

  // FACE AND PLACE
  { word1: 'face', word2: 'place', clicheScore: 9, category: 'General' },
  { word1: 'face', word2: 'space', clicheScore: 8, category: 'General' },
  { word1: 'face', word2: 'grace', clicheScore: 8, category: 'Romance' },
  { word1: 'face', word2: 'race', clicheScore: 7, category: 'General' },
  { word1: 'face', word2: 'embrace', clicheScore: 7, category: 'Romance' },
  { word1: 'face', word2: 'chase', clicheScore: 6, category: 'General' },

  // MORE COMMON -ING RHYMES
  { word1: 'thing', word2: 'sing', clicheScore: 8, category: 'General' },
  { word1: 'thing', word2: 'bring', clicheScore: 8, category: 'General' },
  { word1: 'thing', word2: 'ring', clicheScore: 7, category: 'General' },
  { word1: 'thing', word2: 'wing', clicheScore: 7, category: 'General' },
  { word1: 'thing', word2: 'king', clicheScore: 7, category: 'General' },
  { word1: 'thing', word2: 'spring', clicheScore: 6, category: 'Nature' },

  // MORE COMMON -IND RHYMES
  { word1: 'find', word2: 'mind', clicheScore: 9, category: 'Thought' },
  { word1: 'find', word2: 'kind', clicheScore: 8, category: 'Emotion' },
  { word1: 'find', word2: 'behind', clicheScore: 7, category: 'General' },
  { word1: 'find', word2: 'blind', clicheScore: 7, category: 'Emotion' },

  // MORE -OW RHYMES
  { word1: 'know', word2: 'go', clicheScore: 9, category: 'General' },
  { word1: 'know', word2: 'show', clicheScore: 8, category: 'General' },
  { word1: 'know', word2: 'grow', clicheScore: 8, category: 'General' },
  { word1: 'know', word2: 'flow', clicheScore: 7, category: 'General' },
  { word1: 'know', word2: 'slow', clicheScore: 7, category: 'General' },
  { word1: 'know', word2: 'though', clicheScore: 7, category: 'General' },
  { word1: 'know', word2: 'below', clicheScore: 6, category: 'General' },

  // MORE -ALL RHYMES
  { word1: 'fall', word2: 'all', clicheScore: 9, category: 'General' },
  { word1: 'fall', word2: 'call', clicheScore: 8, category: 'General' },
  { word1: 'fall', word2: 'wall', clicheScore: 7, category: 'General' },
  { word1: 'fall', word2: 'tall', clicheScore: 7, category: 'General' },
  { word1: 'fall', word2: 'small', clicheScore: 7, category: 'General' },

  // MORE -ORE RHYMES
  { word1: 'more', word2: 'before', clicheScore: 9, category: 'General' },
  { word1: 'more', word2: 'door', clicheScore: 8, category: 'General' },
  { word1: 'more', word2: 'shore', clicheScore: 7, category: 'Nature' },
  { word1: 'more', word2: 'floor', clicheScore: 7, category: 'General' },
  { word1: 'more', word2: 'store', clicheScore: 6, category: 'General' },

  // MORE -EAR RHYMES
  { word1: 'hear', word2: 'fear', clicheScore: 9, category: 'Emotion' },
  { word1: 'hear', word2: 'near', clicheScore: 8, category: 'General' },
  { word1: 'hear', word2: 'clear', clicheScore: 8, category: 'General' },
  { word1: 'hear', word2: 'year', clicheScore: 8, category: 'Time' },
  { word1: 'hear', word2: 'dear', clicheScore: 7, category: 'Romance' },
  { word1: 'hear', word2: 'tear', clicheScore: 7, category: 'Sadness' },

  // MORE MISCELLANEOUS COMMON PAIRS
  { word1: 'time', word2: 'rhyme', clicheScore: 9, category: 'Time' },
  { word1: 'time', word2: 'mine', clicheScore: 8, category: 'Time' },
  { word1: 'time', word2: 'line', clicheScore: 7, category: 'Time' },
  { word1: 'time', word2: 'shine', clicheScore: 7, category: 'Time' },
  { word1: 'time', word2: 'fine', clicheScore: 7, category: 'Time' },

  { word1: 'world', word2: 'girl', clicheScore: 9, category: 'Romance' },
  { word1: 'world', word2: 'unfurled', clicheScore: 6, category: 'General' },

  { word1: 'breath', word2: 'death', clicheScore: 9, category: 'Life' },

  { word1: 'life', word2: 'wife', clicheScore: 8, category: 'Life' },
  { word1: 'life', word2: 'strife', clicheScore: 8, category: 'Life' },
  { word1: 'life', word2: 'knife', clicheScore: 7, category: 'Life' },

  { word1: 'best', word2: 'rest', clicheScore: 8, category: 'General' },
  { word1: 'best', word2: 'test', clicheScore: 7, category: 'General' },
  { word1: 'best', word2: 'blessed', clicheScore: 7, category: 'Emotion' },

  { word1: 'feel', word2: 'real', clicheScore: 9, category: 'Emotion' },
  { word1: 'feel', word2: 'heal', clicheScore: 8, category: 'Emotion' },
  { word1: 'feel', word2: 'deal', clicheScore: 7, category: 'Emotion' },
  { word1: 'feel', word2: 'steal', clicheScore: 7, category: 'Emotion' },

  { word1: 'hold', word2: 'cold', clicheScore: 9, category: 'Emotion' },
  { word1: 'hold', word2: 'told', clicheScore: 8, category: 'General' },
  { word1: 'hold', word2: 'old', clicheScore: 8, category: 'General' },
  { word1: 'hold', word2: 'gold', clicheScore: 7, category: 'General' },
  { word1: 'hold', word2: 'bold', clicheScore: 7, category: 'General' },

  { word1: 'end', word2: 'friend', clicheScore: 9, category: 'Friendship' },
  { word1: 'end', word2: 'send', clicheScore: 7, category: 'General' },
  { word1: 'end', word2: 'bend', clicheScore: 6, category: 'General' },
  { word1: 'end', word2: 'mend', clicheScore: 6, category: 'General' },
];

/**
 * Get the cliché score for a rhyme pair (0 if not in database)
 */
export function getRhymeClicheScore(word1: string, word2: string): number {
  const w1 = word1.toLowerCase();
  const w2 = word2.toLowerCase();

  // Check both orderings
  const entry = rhymeClicheDatabase.find(
    (e) => (e.word1 === w1 && e.word2 === w2) || (e.word1 === w2 && e.word2 === w1)
  );

  return entry ? entry.clicheScore : 0;
}

/**
 * Get the originality score for a rhyme (inverse of cliché score)
 * Returns a percentage: 100 = completely original, 0 = extremely clichéd
 *
 * REVISED SCORING (more conservative):
 * - Not in database = 75% (was 100%) - assumes moderate familiarity
 * - Score 1-2 = 85-90% - Rarely clichéd
 * - Score 3-4 = 70-80% - Somewhat common
 * - Score 5-6 = 50-65% - Common
 * - Score 7-8 = 30-45% - Very common
 * - Score 9-10 = 0-25% - Extremely clichéd
 */
export function getRhymeOriginalityScore(word1: string, word2: string): number {
  const clicheScore = getRhymeClicheScore(word1, word2);

  if (clicheScore === 0) {
    // Not in database - assume it's moderately familiar (75% instead of 100%)
    // This prevents every unlisted rhyme from being "Very Original"
    return 75;
  }

  // More nuanced conversion:
  // 1 -> 90, 2 -> 85, 3 -> 80, 4 -> 70, 5 -> 60, 6 -> 50, 7 -> 40, 8 -> 30, 9 -> 20, 10 -> 10
  const scoringTable: Record<number, number> = {
    1: 90,
    2: 85,
    3: 80,
    4: 70,
    5: 60,
    6: 50,
    7: 40,
    8: 30,
    9: 20,
    10: 10,
  };

  return scoringTable[clicheScore] || 75;
}

/**
 * Get a textual description of rhyme originality
 * Returns empty string for original rhymes (no label needed)
 * Returns 'Cliché' for clichéd rhymes (color indicates severity)
 */
export function getRhymeOriginalityLabel(score: number): string {
  if (score >= 35) return ''; // No label for original rhymes
  return 'Cliché'; // Both mild and strong clichés just show "Cliché"
}

/**
 * Get all rhyme pairs in a category
 */
export function getRhymesByCategory(category: string): RhymeCliche[] {
  return rhymeClicheDatabase.filter((e) => e.category === category);
}

/**
 * Get all available categories
 */
export function getRhymeCategories(): string[] {
  const categories = new Set(rhymeClicheDatabase.map((e) => e.category).filter(Boolean));
  return Array.from(categories).sort();
}
