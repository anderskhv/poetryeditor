/**
 * Metaphor and Figurative Language Detector
 * Identifies metaphors, similes, personification, and other figures of speech
 */

export interface FigurativeInstance {
  type: 'metaphor' | 'simile' | 'personification' | 'hyperbole';
  text: string;
  lineIndex: number;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface MetaphorAnalysis {
  instances: FigurativeInstance[];
  simileCount: number;
  metaphorCount: number;
  personificationCount: number;
  hyperboleCount: number;
}

// Personification verbs - human actions applied to non-human things
const PERSONIFICATION_VERBS = [
  'whisper', 'whispers', 'whispered', 'whispering',
  'dance', 'dances', 'danced', 'dancing',
  'sing', 'sings', 'sang', 'singing',
  'cry', 'cries', 'cried', 'crying',
  'weep', 'weeps', 'wept', 'weeping',
  'laugh', 'laughs', 'laughed', 'laughing',
  'smile', 'smiles', 'smiled', 'smiling',
  'frown', 'frowns', 'frowned', 'frowning',
  'embrace', 'embraces', 'embraced', 'embracing',
  'kiss', 'kisses', 'kissed', 'kissing',
  'speak', 'speaks', 'spoke', 'speaking',
  'call', 'calls', 'called', 'calling',
  'scream', 'screams', 'screamed', 'screaming',
  'shout', 'shouts', 'shouted', 'shouting',
  'sleep', 'sleeps', 'slept', 'sleeping',
  'wake', 'wakes', 'woke', 'waking',
  'dream', 'dreams', 'dreamed', 'dreaming',
  'think', 'thinks', 'thought', 'thinking',
  'feel', 'feels', 'felt', 'feeling',
  'watch', 'watches', 'watched', 'watching',
  'stare', 'stares', 'stared', 'staring',
  'breathe', 'breathes', 'breathed', 'breathing',
  'sigh', 'sighs', 'sighed', 'sighing',
  'mourn', 'mourns', 'mourned', 'mourning',
  'yearn', 'yearns', 'yearned', 'yearning',
  'wait', 'waits', 'waited', 'waiting',
  'knock', 'knocks', 'knocked', 'knocking',
  'march', 'marches', 'marched', 'marching',
  'run', 'runs', 'ran', 'running',
  'walk', 'walks', 'walked', 'walking',
  'crawl', 'crawls', 'crawled', 'crawling',
  'creep', 'creeps', 'crept', 'creeping',
  'roar', 'roars', 'roared', 'roaring',
  'wink', 'winks', 'winked', 'winking',
  'conquer', 'conquers', 'conquered', 'conquering',
  'grip', 'grips', 'gripped', 'gripping',
  'stand', 'stands', 'stood', 'standing',
  'reach', 'reaches', 'reached', 'reaching',
  'grab', 'grabs', 'grabbed', 'grabbing',
  'hold', 'holds', 'held', 'holding',
  'touch', 'touches', 'touched', 'touching',
  'caress', 'caresses', 'caressed', 'caressing',
];

// Non-human subjects that often get personified
const PERSONIFIABLE_SUBJECTS = [
  'sun', 'moon', 'stars', 'sky', 'clouds', 'wind', 'rain', 'storm',
  'sea', 'ocean', 'river', 'stream', 'waves', 'water',
  'mountain', 'hill', 'valley', 'forest', 'tree', 'trees', 'flower', 'flowers',
  'night', 'darkness', 'light', 'shadow', 'shadows',
  'death', 'time', 'fate', 'love', 'hope', 'fear', 'sorrow', 'joy',
  'earth', 'nature', 'world', 'universe',
  'city', 'house', 'home', 'road', 'street', 'door', 'window',
  'heart', 'soul', 'mind', 'memory', 'memories', 'dream', 'dreams',
  'fire', 'flame', 'flames', 'ice', 'snow', 'frost',
  'silence', 'music', 'song',
];

// Hyperbole indicators - more specific to avoid false positives
const HYPERBOLE_PATTERNS = [
  /\b(million|billion|trillion|infinite|endless|eternal) (times|years|miles|ways)\b/i,
  /\b(best|worst|most|least) .{1,30} (ever|in the world|in history|of all time)\b/i,
  /\b(died|die|dying) (of|from) (embarrassment|laughter|boredom|shame|hunger)\b/i,
  /\bto death\b/i,
  /\bwaited (for )?(an )?eternity\b/i,
  /\b(ocean|sea|river|flood) of (tears|blood|sorrow|emotion)\b/i,
  /\bweight of the world\b/i,
  /\b(starving|dying|killing) (to|for)\b/i,
  /\bcould eat a horse\b/i,
  /\ba ton of\b/i,
  /\bforever and (a day|ever)\b/i,
];

// Common metaphor patterns (X is Y where Y is unexpected)
const METAPHOR_BE_PATTERNS = [
  // Nature metaphors for emotions/abstract
  { pattern: /\b(life|love|hope|time|death|fear) (is|was|are|were) (a |an )?(\w+)/i, type: 'conceptual' },
  // Body part metaphors
  { pattern: /\bheart (is|was) (a |an )?(\w+)/i, type: 'body' },
  // Journey metaphors
  { pattern: /\b(life|love|career) (is|was) (a |an )?(journey|road|path|race)/i, type: 'journey' },
  // War/battle metaphors
  { pattern: /\b(life|love|business) (is|was) (a |an )?(war|battle|fight)/i, type: 'conflict' },
  // Container metaphors
  { pattern: /\bfull of (\w+)/i, type: 'container' },
  { pattern: /\bempty of (\w+)/i, type: 'container' },
];

/**
 * Detect similes in text
 */
function detectSimiles(line: string, lineIndex: number): FigurativeInstance[] {
  const instances: FigurativeInstance[] = [];

  // Pattern: [noun/adjective] like [noun]
  const likePattern = /(\w+(?:\s+\w+)?)\s+like\s+(?:a\s+|an\s+|the\s+)?(\w+(?:\s+\w+)?)/gi;
  let match;

  while ((match = likePattern.exec(line)) !== null) {
    const wordBeforeLike = match[1].trim().toLowerCase();
    const lastWord = wordBeforeLike.split(/\s+/).pop() || '';

    // Skip "like" as a verb - when preceded by subject pronouns or modals
    // e.g., "I like pizza", "We like it", "Do you like this", "Would like to"
    if (/^(i|you|we|they|he|she|it|do|does|did|would|could|should|might|may|will|can|don't|doesn't|didn't)$/i.test(lastWord)) {
      continue;
    }

    // Also skip if the entire match[1] is just a pronoun
    if (/^(i|you|we|they|he|she|it)$/i.test(wordBeforeLike)) {
      continue;
    }

    instances.push({
      type: 'simile',
      text: match[0],
      lineIndex,
      explanation: `Comparison using "like": ${match[1]} compared to ${match[2]}`,
      confidence: 'high',
    });
  }

  // Pattern: as [adjective] as [noun]
  const asAsPattern = /as\s+(\w+)\s+as\s+(?:a\s+|an\s+|the\s+)?(\w+)/gi;
  while ((match = asAsPattern.exec(line)) !== null) {
    instances.push({
      type: 'simile',
      text: match[0],
      lineIndex,
      explanation: `Comparison using "as...as": ${match[1]} compared to ${match[2]}`,
      confidence: 'high',
    });
  }

  return instances;
}

/**
 * Detect personification
 */
function detectPersonification(line: string, lineIndex: number): FigurativeInstance[] {
  const instances: FigurativeInstance[] = [];

  // Look for non-human subjects with human verbs
  for (const subject of PERSONIFIABLE_SUBJECTS) {
    const subjectPattern = new RegExp(`\\b${subject}\\b`, 'i');
    if (!subjectPattern.test(line)) continue;

    for (const verb of PERSONIFICATION_VERBS) {
      const verbPattern = new RegExp(`\\b${subject}\\s+(?:\\w+\\s+)?${verb}`, 'i');
      const match = line.match(verbPattern);

      if (match) {
        instances.push({
          type: 'personification',
          text: match[0],
          lineIndex,
          explanation: `"${subject}" given human action "${verb}"`,
          confidence: 'high',
        });
      }
    }

    // Also check for possessive + human attribute
    const possessivePattern = new RegExp(`\\b${subject}'s\\s+(heart|soul|mind|eyes|voice|breath|arms|hands|face)\\b`, 'i');
    const possMatch = line.match(possessivePattern);
    if (possMatch) {
      instances.push({
        type: 'personification',
        text: possMatch[0],
        lineIndex,
        explanation: `"${subject}" given human attribute`,
        confidence: 'medium',
      });
    }
  }

  return instances;
}

/**
 * Detect hyperbole
 */
function detectHyperbole(line: string, lineIndex: number): FigurativeInstance[] {
  const instances: FigurativeInstance[] = [];

  for (const pattern of HYPERBOLE_PATTERNS) {
    const match = line.match(pattern);
    if (match) {
      instances.push({
        type: 'hyperbole',
        text: match[0],
        lineIndex,
        explanation: `Exaggeration for effect`,
        confidence: 'medium',
      });
    }
  }

  return instances;
}

/**
 * Detect metaphors (X is Y constructions)
 */
function detectMetaphors(line: string, lineIndex: number): FigurativeInstance[] {
  const instances: FigurativeInstance[] = [];

  for (const { pattern, type } of METAPHOR_BE_PATTERNS) {
    const match = line.match(pattern);
    if (match) {
      instances.push({
        type: 'metaphor',
        text: match[0],
        lineIndex,
        explanation: `${type} metaphor: implicit comparison`,
        confidence: 'medium',
      });
    }
  }

  // Check for "the X of Y" metaphorical constructions
  const ofPattern = /the\s+(\w+)\s+of\s+(life|love|death|time|hope|fear|sorrow|joy|night|day)/gi;
  let match;
  while ((match = ofPattern.exec(line)) !== null) {
    // Check if the first word is concrete being applied to abstract
    const concreteNouns = ['weight', 'river', 'ocean', 'sea', 'mountain', 'shadow', 'light', 'fire', 'ice', 'storm', 'rain', 'wind', 'song', 'music', 'dance', 'journey', 'road', 'path'];
    if (concreteNouns.includes(match[1].toLowerCase())) {
      instances.push({
        type: 'metaphor',
        text: match[0],
        lineIndex,
        explanation: `Concrete "${match[1]}" applied to abstract "${match[2]}"`,
        confidence: 'high',
      });
    }
  }

  return instances;
}

/**
 * Analyze text for figurative language
 */
export function analyzeMetaphors(text: string): MetaphorAnalysis {
  const lines = text.split('\n');
  const instances: FigurativeInstance[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex].trim();
    if (!line) continue;

    instances.push(...detectSimiles(line, lineIndex));
    instances.push(...detectPersonification(line, lineIndex));
    instances.push(...detectHyperbole(line, lineIndex));
    instances.push(...detectMetaphors(line, lineIndex));
  }

  // Remove duplicates (same text on same line)
  const uniqueInstances = instances.filter((instance, index, self) =>
    index === self.findIndex(i => i.text === instance.text && i.lineIndex === instance.lineIndex)
  );

  return {
    instances: uniqueInstances,
    simileCount: uniqueInstances.filter(i => i.type === 'simile').length,
    metaphorCount: uniqueInstances.filter(i => i.type === 'metaphor').length,
    personificationCount: uniqueInstances.filter(i => i.type === 'personification').length,
    hyperboleCount: uniqueInstances.filter(i => i.type === 'hyperbole').length,
  };
}

/**
 * Get summary of figurative language
 */
export function getMetaphorSummary(analysis: MetaphorAnalysis): string {
  const parts: string[] = [];

  if (analysis.simileCount > 0) {
    parts.push(`${analysis.simileCount} simile${analysis.simileCount !== 1 ? 's' : ''}`);
  }
  if (analysis.metaphorCount > 0) {
    parts.push(`${analysis.metaphorCount} metaphor${analysis.metaphorCount !== 1 ? 's' : ''}`);
  }
  if (analysis.personificationCount > 0) {
    parts.push(`${analysis.personificationCount} personification${analysis.personificationCount !== 1 ? 's' : ''}`);
  }
  if (analysis.hyperboleCount > 0) {
    parts.push(`${analysis.hyperboleCount} hyperbole${analysis.hyperboleCount !== 1 ? 's' : ''}`);
  }

  return parts.length > 0 ? parts.join(', ') : 'No figurative language detected';
}
