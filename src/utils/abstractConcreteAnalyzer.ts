/**
 * Abstract vs Concrete Language Analyzer
 *
 * Detects whether a poem relies too heavily on abstract language
 * (love, truth, beauty, hope) vs concrete, sensory imagery.
 *
 * Great poetry tends to "show, not tell" through concrete details.
 */

export interface AbstractWord {
  word: string;
  lineNumber: number;
  category: 'emotion' | 'concept' | 'quality' | 'state';
}

export interface ConcreteWord {
  word: string;
  lineNumber: number;
  category: 'sensory' | 'object' | 'action' | 'body' | 'nature';
}

export interface AbstractConcreteAnalysis {
  abstractWords: AbstractWord[];
  concreteWords: ConcreteWord[];
  abstractCount: number;
  concreteCount: number;
  ratio: number; // concrete / (abstract + concrete), higher is better
  score: number; // 0-100, higher means more concrete
  assessment: 'excellent' | 'good' | 'moderate' | 'abstract-heavy';
  suggestions: string[];
}

// Common abstract words - these "tell" rather than "show"
const ABSTRACT_WORDS: Record<string, 'emotion' | 'concept' | 'quality' | 'state'> = {
  // Emotions (tell, don't show)
  'love': 'emotion', 'hate': 'emotion', 'fear': 'emotion', 'joy': 'emotion',
  'sorrow': 'emotion', 'grief': 'emotion', 'anger': 'emotion', 'rage': 'emotion',
  'happiness': 'emotion', 'sadness': 'emotion', 'loneliness': 'emotion',
  'despair': 'emotion', 'hope': 'emotion', 'desire': 'emotion', 'passion': 'emotion',
  'jealousy': 'emotion', 'envy': 'emotion', 'pride': 'emotion', 'shame': 'emotion',
  'guilt': 'emotion', 'regret': 'emotion', 'longing': 'emotion', 'yearning': 'emotion',
  'anxiety': 'emotion', 'dread': 'emotion', 'terror': 'emotion', 'bliss': 'emotion',
  'ecstasy': 'emotion', 'melancholy': 'emotion', 'anguish': 'emotion',

  // Abstract concepts
  'truth': 'concept', 'beauty': 'concept', 'freedom': 'concept', 'justice': 'concept',
  'peace': 'concept', 'war': 'concept', 'death': 'concept', 'life': 'concept',
  'time': 'concept', 'eternity': 'concept', 'infinity': 'concept', 'fate': 'concept',
  'destiny': 'concept', 'soul': 'concept', 'spirit': 'concept', 'mind': 'concept',
  'thought': 'concept', 'dream': 'concept', 'memory': 'concept', 'wisdom': 'concept',
  'knowledge': 'concept', 'power': 'concept', 'strength': 'concept', 'weakness': 'concept',
  'virtue': 'concept', 'sin': 'concept', 'grace': 'concept', 'faith': 'concept',
  'belief': 'concept', 'doubt': 'concept', 'reason': 'concept', 'logic': 'concept',
  'chaos': 'concept', 'order': 'concept', 'nature': 'concept', 'humanity': 'concept',
  'existence': 'concept', 'reality': 'concept', 'illusion': 'concept',

  // Abstract qualities
  'good': 'quality', 'evil': 'quality', 'pure': 'quality', 'innocent': 'quality',
  'perfect': 'quality', 'beautiful': 'quality', 'ugly': 'quality', 'wonderful': 'quality',
  'terrible': 'quality', 'amazing': 'quality', 'horrible': 'quality', 'lovely': 'quality',
  'nice': 'quality', 'great': 'quality', 'important': 'quality', 'significant': 'quality',
  'meaningful': 'quality', 'deep': 'quality', 'profound': 'quality', 'eternal': 'quality',
  'infinite': 'quality', 'endless': 'quality', 'boundless': 'quality',

  // Abstract states
  'being': 'state', 'becoming': 'state', 'existing': 'state', 'living': 'state',
  'dying': 'state', 'suffering': 'state', 'feeling': 'state', 'thinking': 'state',
  'knowing': 'state', 'believing': 'state', 'hoping': 'state', 'loving': 'state',
  'hating': 'state', 'wanting': 'state', 'needing': 'state', 'wishing': 'state',
};

// Concrete words - these "show" through sensory detail
const CONCRETE_INDICATORS: Record<string, 'sensory' | 'object' | 'action' | 'body' | 'nature'> = {
  // Sensory words (sight, sound, touch, taste, smell)
  'red': 'sensory', 'blue': 'sensory', 'green': 'sensory', 'yellow': 'sensory',
  'white': 'sensory', 'black': 'sensory', 'golden': 'sensory', 'silver': 'sensory',
  'bright': 'sensory', 'dark': 'sensory', 'dim': 'sensory', 'pale': 'sensory',
  'loud': 'sensory', 'quiet': 'sensory', 'soft': 'sensory', 'hard': 'sensory',
  'rough': 'sensory', 'smooth': 'sensory', 'sharp': 'sensory', 'dull': 'sensory',
  'cold': 'sensory', 'hot': 'sensory', 'warm': 'sensory', 'cool': 'sensory',
  'wet': 'sensory', 'dry': 'sensory', 'sweet': 'sensory', 'bitter': 'sensory',
  'sour': 'sensory', 'salty': 'sensory', 'fragrant': 'sensory', 'musty': 'sensory',
  'crisp': 'sensory', 'sticky': 'sensory', 'slippery': 'sensory', 'gritty': 'sensory',

  // Physical objects
  'stone': 'object', 'rock': 'object', 'glass': 'object', 'wood': 'object',
  'metal': 'object', 'iron': 'object', 'steel': 'object', 'gold': 'object',
  'door': 'object', 'window': 'object', 'wall': 'object', 'floor': 'object',
  'table': 'object', 'chair': 'object', 'bed': 'object', 'book': 'object',
  'pen': 'object', 'knife': 'object', 'key': 'object', 'mirror': 'object',
  'candle': 'object', 'lamp': 'object', 'clock': 'object', 'bell': 'object',

  // Specific actions (not abstract states)
  'walk': 'action', 'run': 'action', 'jump': 'action', 'fall': 'action',
  'climb': 'action', 'crawl': 'action', 'swim': 'action', 'fly': 'action',
  'sit': 'action', 'stand': 'action', 'lie': 'action', 'kneel': 'action',
  'reach': 'action', 'grab': 'action', 'hold': 'action', 'drop': 'action',
  'push': 'action', 'pull': 'action', 'throw': 'action', 'catch': 'action',
  'cut': 'action', 'break': 'action', 'tear': 'action', 'burn': 'action',
  'eat': 'action', 'drink': 'action', 'breathe': 'action', 'sleep': 'action',
  'whisper': 'action', 'shout': 'action', 'sing': 'action', 'cry': 'action',
  'laugh': 'action', 'smile': 'action', 'frown': 'action', 'tremble': 'action',

  // Body parts
  'hand': 'body', 'hands': 'body', 'finger': 'body', 'fingers': 'body',
  'arm': 'body', 'arms': 'body', 'leg': 'body', 'legs': 'body',
  'foot': 'body', 'feet': 'body', 'eye': 'body', 'eyes': 'body',
  'ear': 'body', 'ears': 'body', 'nose': 'body', 'mouth': 'body',
  'lip': 'body', 'lips': 'body', 'tongue': 'body', 'teeth': 'body',
  'face': 'body', 'head': 'body', 'hair': 'body', 'skin': 'body',
  'bone': 'body', 'bones': 'body', 'blood': 'body', 'heart': 'body',
  'chest': 'body', 'back': 'body', 'shoulder': 'body', 'shoulders': 'body',

  // Nature (concrete natural imagery)
  'sun': 'nature', 'moon': 'nature', 'star': 'nature', 'stars': 'nature',
  'sky': 'nature', 'cloud': 'nature', 'clouds': 'nature', 'rain': 'nature',
  'snow': 'nature', 'wind': 'nature', 'storm': 'nature', 'thunder': 'nature',
  'lightning': 'nature', 'fog': 'nature', 'mist': 'nature', 'dew': 'nature',
  'tree': 'nature', 'trees': 'nature', 'leaf': 'nature', 'leaves': 'nature',
  'flower': 'nature', 'flowers': 'nature', 'grass': 'nature', 'root': 'nature',
  'branch': 'nature', 'bark': 'nature', 'thorn': 'nature', 'rose': 'nature',
  'river': 'nature', 'stream': 'nature', 'lake': 'nature', 'sea': 'nature',
  'ocean': 'nature', 'wave': 'nature', 'waves': 'nature', 'shore': 'nature',
  'sand': 'nature', 'mud': 'nature', 'dirt': 'nature', 'dust': 'nature',
  'mountain': 'nature', 'hill': 'nature', 'valley': 'nature', 'field': 'nature',
  'forest': 'nature', 'bird': 'nature', 'birds': 'nature', 'fish': 'nature',
  'wolf': 'nature', 'deer': 'nature', 'horse': 'nature', 'dog': 'nature',
  'cat': 'nature', 'snake': 'nature', 'bee': 'nature', 'butterfly': 'nature',
};

/**
 * Analyze a poem for abstract vs concrete language balance
 */
export function analyzeAbstractConcrete(text: string): AbstractConcreteAnalysis {
  const lines = text.split('\n');
  const abstractWords: AbstractWord[] = [];
  const concreteWords: ConcreteWord[] = [];

  lines.forEach((line, lineIndex) => {
    const words = line.toLowerCase().match(/\b[a-z]+\b/g) || [];

    words.forEach(word => {
      // Check for abstract words
      if (ABSTRACT_WORDS[word]) {
        abstractWords.push({
          word,
          lineNumber: lineIndex + 1,
          category: ABSTRACT_WORDS[word]
        });
      }

      // Check for concrete words
      if (CONCRETE_INDICATORS[word]) {
        concreteWords.push({
          word,
          lineNumber: lineIndex + 1,
          category: CONCRETE_INDICATORS[word]
        });
      }
    });
  });

  const abstractCount = abstractWords.length;
  const concreteCount = concreteWords.length;
  const total = abstractCount + concreteCount;

  // Calculate ratio (concrete / total)
  const ratio = total > 0 ? concreteCount / total : 0.5;

  // Score: 0-100 where higher is more concrete
  // Ideal poetry has a good balance but leans concrete
  // ratio 0.7+ = excellent, 0.5-0.7 = good, 0.3-0.5 = moderate, <0.3 = abstract-heavy
  const score = Math.round(ratio * 100);

  let assessment: 'excellent' | 'good' | 'moderate' | 'abstract-heavy';
  const suggestions: string[] = [];

  if (ratio >= 0.7) {
    assessment = 'excellent';
  } else if (ratio >= 0.5) {
    assessment = 'good';
  } else if (ratio >= 0.3) {
    assessment = 'moderate';
    suggestions.push('Consider adding more sensory details to ground abstract concepts.');
  } else {
    assessment = 'abstract-heavy';
    suggestions.push('Your poem relies heavily on abstract language. Try "showing" emotions through concrete images.');

    // Find most common abstract category
    const categoryCounts: Record<string, number> = {};
    abstractWords.forEach(w => {
      categoryCounts[w.category] = (categoryCounts[w.category] || 0) + 1;
    });

    const topCategory = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])[0];

    if (topCategory) {
      if (topCategory[0] === 'emotion') {
        suggestions.push('Instead of naming emotions (love, fear, joy), show physical reactions: racing pulse, clenched fists, trembling hands.');
      } else if (topCategory[0] === 'concept') {
        suggestions.push('Abstract concepts work better when paired with concrete images. "Truth" alone is vague; "the cold truth like January water" creates a feeling.');
      }
    }
  }

  return {
    abstractWords,
    concreteWords,
    abstractCount,
    concreteCount,
    ratio,
    score,
    assessment,
    suggestions
  };
}
