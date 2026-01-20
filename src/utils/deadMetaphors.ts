/**
 * Dead Metaphors Detector
 *
 * Identifies metaphors that have become so commonplace they've lost their
 * figurative power - readers no longer "see" the comparison.
 *
 * Unlike cliches (which are overused phrases), dead metaphors specifically
 * target comparisons and figurative language that have calcified into
 * literal-seeming expressions.
 *
 * Philosophy: These aren't wrong, but they're invisible. If you want
 * imagery, you need to resurrect or replace them.
 */

export interface DeadMetaphor {
  phrase: string;
  lineNumber: number;
  startIndex: number;
  endIndex: number;
  category: 'body' | 'nature' | 'journey' | 'war' | 'building' | 'light' | 'time' | 'emotion' | 'other';
  originalMeaning: string;
  suggestion: string;
}

export interface DeadMetaphorAnalysis {
  metaphors: DeadMetaphor[];
  count: number;
  score: number; // 0-100, higher is more original
  assessment: 'original' | 'some-dead' | 'metaphor-heavy';
}

// Dead metaphors organized by conceptual domain
// These are expressions where the metaphorical origin has been forgotten

const BODY_METAPHORS: Record<string, { original: string; suggestion: string }> = {
  'heart of the matter': {
    original: 'Heart as center/core of a body',
    suggestion: 'Try: "the crux," "the essential question," or describe what matters specifically'
  },
  'foot of the': {
    original: 'Foot as base/bottom of a body',
    suggestion: 'Try: "base of," "bottom of," or describe the location specifically'
  },
  'head of the': {
    original: 'Head as top/leader of a body',
    suggestion: 'If meaning "top": describe specifically. If "leader": name their role'
  },
  'shoulder the burden': {
    original: 'Shoulders bearing physical weight',
    suggestion: 'Try: "carry," "bear," or show the weight through action'
  },
  'eye of the storm': {
    original: 'Eye as center/opening',
    suggestion: 'Try: "center of the chaos," "the still point," or create a fresh image'
  },
  'neck of the woods': {
    original: 'Neck as narrow passage',
    suggestion: 'Try: "area," "region," "neighborhood," or be more specific'
  },
  'face the music': {
    original: 'Turning to face performers/consequences',
    suggestion: 'Try: "accept consequences," "confront reality," or show the confrontation'
  },
  'turn a blind eye': {
    original: 'Literally closing one eye to ignore',
    suggestion: 'Try: "ignore," "overlook deliberately," or show the avoidance'
  },
  'lend an ear': {
    original: 'Physically leaning ear toward someone',
    suggestion: 'Try: "listen," "attend to," or show the act of listening'
  },
  'cold shoulder': {
    original: 'Turning shoulder (cold part) to someone',
    suggestion: 'Try: "snub," "ignore," or show the rejection through action'
  },
  'get cold feet': {
    original: 'Physical coldness from fear',
    suggestion: 'Try: "hesitate," "lose nerve," or show the fear through specific signs'
  },
  'break a leg': {
    original: 'Theater superstition (ironic wish)',
    suggestion: 'If wishing luck: try something specific to the situation'
  },
  'spine of': {
    original: 'Spine as central support structure',
    suggestion: 'Try: "core of," "backbone of," or describe the support specifically'
  },
  'blood is thicker': {
    original: 'Blood as family bond',
    suggestion: 'Try showing family loyalty through specific actions instead'
  },
  'flesh and blood': {
    original: 'Physical body as human reality',
    suggestion: 'Try: "human," "mortal," "real person," or describe their humanity'
  },
};

const NATURE_METAPHORS: Record<string, { original: string; suggestion: string }> = {
  'branch out': {
    original: 'Tree branches spreading in new directions',
    suggestion: 'Try: "expand," "diversify," or describe the new direction specifically'
  },
  'root of the problem': {
    original: 'Roots as origin/source buried underground',
    suggestion: 'Try: "cause," "source," "origin," or name the specific cause'
  },
  'nip in the bud': {
    original: 'Pinching off buds before they bloom',
    suggestion: 'Try: "stop early," "prevent," or describe the early intervention'
  },
  'bear fruit': {
    original: 'Trees producing fruit after long growth',
    suggestion: 'Try: "produce results," "succeed," or describe the specific outcome'
  },
  'turn over a new leaf': {
    original: 'New leaf growth in spring',
    suggestion: 'Try: "start fresh," "change ways," or describe the specific change'
  },
  'stem from': {
    original: 'Plant stems connecting flower to root',
    suggestion: 'Try: "originate from," "arise from," or name the connection'
  },
  'bed of roses': {
    original: 'Roses as luxury/comfort',
    suggestion: 'Try describing the actual comfort or ease specifically'
  },
  'pushing up daisies': {
    original: 'Buried body making flowers grow',
    suggestion: 'If death: try fresh imagery or direct statement'
  },
  'weather the storm': {
    original: 'Ships surviving storms at sea',
    suggestion: 'Try: "endure," "survive," or show the specific hardship'
  },
  'calm before the storm': {
    original: 'Atmospheric stillness before weather',
    suggestion: 'Try: "uneasy peace," "quiet tension," or describe the specific anticipation'
  },
  'tip of the iceberg': {
    original: 'Icebergs mostly hidden underwater',
    suggestion: 'Try: "small part," "hint of more," or describe what\'s hidden'
  },
  'snowball effect': {
    original: 'Snowballs gathering mass as they roll',
    suggestion: 'Try: "compound," "escalate," "grow rapidly," or describe the growth'
  },
  'flood of': {
    original: 'Water overwhelming barriers',
    suggestion: 'Try: "surge of," "wave of," or describe the overwhelming quantity'
  },
  'sea of': {
    original: 'Vast expanse of water',
    suggestion: 'Try: "expanse of," "countless," or describe the vastness specifically'
  },
  'river of': {
    original: 'Continuous flowing water',
    suggestion: 'Try: "stream of," "flow of," or describe the movement'
  },
};

const JOURNEY_METAPHORS: Record<string, { original: string; suggestion: string }> = {
  'at a crossroads': {
    original: 'Literal intersection requiring direction choice',
    suggestion: 'Try: "facing a choice," "at a decision point," or describe the options'
  },
  'go the extra mile': {
    original: 'Roman soldiers forced to carry loads one mile',
    suggestion: 'Try: "do more than required," or show the extra effort specifically'
  },
  'end of the road': {
    original: 'Physical terminus of a path',
    suggestion: 'Try: "final point," "conclusion," or describe the ending specifically'
  },
  'hit the road': {
    original: 'Feet striking the road surface',
    suggestion: 'Try: "depart," "leave," "begin traveling," or describe the departure'
  },
  'down the road': {
    original: 'Further along a physical path',
    suggestion: 'Try: "in the future," "later," or be specific about timing'
  },
  'pave the way': {
    original: 'Literally making a road smooth for travel',
    suggestion: 'Try: "prepare for," "make possible," or describe the preparation'
  },
  'stumbling block': {
    original: 'Stone causing people to trip',
    suggestion: 'Try: "obstacle," "difficulty," or name the specific barrier'
  },
  'bridge to cross': {
    original: 'Needing a structure to span water',
    suggestion: 'Try: "challenge to face," "problem to solve," or describe it'
  },
  'burning bridges': {
    original: 'Military tactic preventing retreat',
    suggestion: 'Try: "ending relationships," "closing off options," or show the rupture'
  },
  'long haul': {
    original: 'Extended journey carrying goods',
    suggestion: 'Try: "extended effort," "long term," or describe the duration'
  },
  'uphill battle': {
    original: 'Military disadvantage of attacking uphill',
    suggestion: 'Try: "difficult struggle," "hard fight," or describe the difficulty'
  },
  'rocky road': {
    original: 'Difficult terrain to traverse',
    suggestion: 'Try: "difficult path," "troubled progress," or describe the obstacles'
  },
  'smooth sailing': {
    original: 'Sailing without wind or wave troubles',
    suggestion: 'Try: "easy progress," "without problems," or describe the ease'
  },
  'uncharted territory': {
    original: 'Maps without markings for unexplored areas',
    suggestion: 'Try: "unknown area," "unexplored," or describe what\'s unfamiliar'
  },
};

const WAR_METAPHORS: Record<string, { original: string; suggestion: string }> = {
  'battle of wills': {
    original: 'Military combat applied to disagreement',
    suggestion: 'Try: "contest," "struggle," or describe the conflict specifically'
  },
  'draw the line': {
    original: 'Military defensive line marking',
    suggestion: 'Try: "set a limit," "refuse to go further," or state the boundary'
  },
  'front lines': {
    original: 'Foremost military position',
    suggestion: 'Try: "forefront," "leading edge," or describe the position'
  },
  'in the trenches': {
    original: 'WWI trench warfare conditions',
    suggestion: 'Try: "in the difficult work," "doing the hard part," or show it'
  },
  'take flak': {
    original: 'Anti-aircraft fire hitting planes',
    suggestion: 'Try: "receive criticism," "be attacked," or describe the criticism'
  },
  'under fire': {
    original: 'Being shot at by enemy',
    suggestion: 'Try: "being criticized," "under attack," or describe the pressure'
  },
  'hold the fort': {
    original: 'Defend a military position',
    suggestion: 'Try: "maintain," "keep things running," or describe the task'
  },
  'rally the troops': {
    original: 'Gathering scattered soldiers',
    suggestion: 'Try: "motivate the team," "gather support," or show the rallying'
  },
  'war of words': {
    original: 'Combat through language',
    suggestion: 'Try: "argument," "verbal conflict," or describe the exchange'
  },
  'bite the bullet': {
    original: 'Biting bullets during surgery without anesthesia',
    suggestion: 'Try: "endure pain," "accept difficulty," or show the acceptance'
  },
  'stick to your guns': {
    original: 'Soldiers not abandoning weapons',
    suggestion: 'Try: "maintain position," "refuse to change," or show the persistence'
  },
  'battle scars': {
    original: 'Physical marks from combat',
    suggestion: 'Try: "marks of experience," or describe the specific evidence'
  },
};

const BUILDING_METAPHORS: Record<string, { original: string; suggestion: string }> = {
  'foundation of': {
    original: 'Building base supporting structure',
    suggestion: 'Try: "basis of," "underlying support," or describe what supports it'
  },
  'build bridges': {
    original: 'Constructing spans over gaps',
    suggestion: 'Try: "create connections," "foster understanding," or show the connecting'
  },
  'hit the ceiling': {
    original: 'Physically striking the top of a room',
    suggestion: 'Try: "become very angry," "explode with anger," or show the anger'
  },
  'glass ceiling': {
    original: 'Invisible barrier in buildings',
    suggestion: 'Try: "invisible barrier," "unspoken limit," or describe the specific barrier'
  },
  'through the roof': {
    original: 'Breaking through building top',
    suggestion: 'Try: "extremely high," "soaring," or describe the extent'
  },
  'window of opportunity': {
    original: 'Opening in a wall allowing passage',
    suggestion: 'Try: "chance," "brief opening," or describe the opportunity'
  },
  'open doors': {
    original: 'Doors allowing entry',
    suggestion: 'Try: "create opportunities," "enable access," or describe what opens'
  },
  'close the door on': {
    original: 'Shutting someone out of a room',
    suggestion: 'Try: "end," "reject," "refuse," or describe the closing off'
  },
  'paint yourself into a corner': {
    original: 'Literally trapping yourself while painting',
    suggestion: 'Try: "trap yourself," "limit options," or describe the trap'
  },
  'hit a wall': {
    original: 'Physical collision with barrier',
    suggestion: 'Try: "reach a barrier," "be stopped," or describe the obstacle'
  },
  'corner the market': {
    original: 'Trapping something in a corner',
    suggestion: 'Try: "dominate," "control completely," or describe the dominance'
  },
  'pillar of': {
    original: 'Structural column supporting building',
    suggestion: 'Try: "essential support," "key member," or describe their role'
  },
};

const LIGHT_METAPHORS: Record<string, { original: string; suggestion: string }> = {
  'shed light on': {
    original: 'Illuminating dark areas',
    suggestion: 'Try: "clarify," "explain," "reveal," or show the illumination'
  },
  'in the dark': {
    original: 'Unable to see without light',
    suggestion: 'Try: "uninformed," "unaware," or describe the ignorance'
  },
  'see the light': {
    original: 'Emerging from darkness to light',
    suggestion: 'Try: "understand," "realize," or describe the moment of understanding'
  },
  'bright idea': {
    original: 'Light associated with insight',
    suggestion: 'Try: "clever idea," "insight," or describe the idea\'s quality'
  },
  'dim view': {
    original: 'Low light obscuring vision',
    suggestion: 'Try: "negative opinion," "disapproval," or state the view'
  },
  'ray of hope': {
    original: 'Single light beam in darkness',
    suggestion: 'Try: "small hope," "promising sign," or describe the hope specifically'
  },
  'light at the end of the tunnel': {
    original: 'Tunnel exit visible as light',
    suggestion: 'Try: "sign of ending," "hope of resolution," or describe the hope'
  },
  'spark of': {
    original: 'Small fire beginning',
    suggestion: 'Try: "hint of," "beginning of," or describe the origin'
  },
  'burn out': {
    original: 'Fire consuming all fuel',
    suggestion: 'Try: "exhaust," "deplete," or describe the exhaustion'
  },
  'flame of': {
    original: 'Fire as passion/intensity',
    suggestion: 'Try: describe the intensity or passion more specifically'
  },
  'kindle': {
    original: 'Starting a fire',
    suggestion: 'Try: "start," "ignite," "begin," or describe the beginning'
  },
  'extinguish': {
    original: 'Putting out fire',
    suggestion: 'Try: "end," "stop," "eliminate," or describe the ending'
  },
};

const TIME_METAPHORS: Record<string, { original: string; suggestion: string }> = {
  'time flies': {
    original: 'Time as bird/winged creature',
    suggestion: 'Try: "time passes quickly," or describe the speed specifically'
  },
  'time is money': {
    original: 'Time as currency',
    suggestion: 'Try: "time is valuable," or describe why time matters here'
  },
  'spend time': {
    original: 'Time as money to be spent',
    suggestion: 'Consider: "use time," "devote time," or describe the activity'
  },
  'waste time': {
    original: 'Time as resource being discarded',
    suggestion: 'Try: "lose time," "use time poorly," or describe what was lost'
  },
  'buy time': {
    original: 'Time as purchasable commodity',
    suggestion: 'Try: "delay," "create delay," or describe the gaining of time'
  },
  'race against time': {
    original: 'Time as competitor in race',
    suggestion: 'Try: "hurry," "work urgently," or describe the urgency'
  },
  'in the nick of time': {
    original: 'Nick as precise cut/moment',
    suggestion: 'Try: "just barely," "at the last moment," or describe the timing'
  },
  'against the clock': {
    original: 'Clock as opponent',
    suggestion: 'Try: "with limited time," "hurrying," or describe the pressure'
  },
  'turn back time': {
    original: 'Time as rotatable dial',
    suggestion: 'Try: "undo," "return to the past," or describe what would change'
  },
  'stand the test of time': {
    original: 'Time as examiner/judge',
    suggestion: 'Try: "endure," "last," "remain relevant," or describe the lasting quality'
  },
};

const EMOTION_METAPHORS: Record<string, { original: string; suggestion: string }> = {
  'heart of stone': {
    original: 'Heart as emotional center, stone as unfeeling',
    suggestion: 'Try: "unfeeling," "cold," or show the lack of emotion through action'
  },
  'bottled up': {
    original: 'Emotions contained in bottle',
    suggestion: 'Try: "suppressed," "held in," or show the suppression'
  },
  'let off steam': {
    original: 'Steam engine releasing pressure',
    suggestion: 'Try: "release tension," "express frustration," or show the release'
  },
  'blow off steam': {
    original: 'Steam engine releasing pressure',
    suggestion: 'Try: "release tension," "vent," or show the venting'
  },
  'boiling point': {
    original: 'Water temperature when it boils',
    suggestion: 'Try: "breaking point," "crisis point," or show the moment'
  },
  'simmering anger': {
    original: 'Water just below boiling',
    suggestion: 'Try: "quiet anger," "restrained fury," or show the containment'
  },
  'frozen with fear': {
    original: 'Cold/ice causing immobility',
    suggestion: 'Try: "paralyzed," "unable to move," or show the paralysis'
  },
  'warm welcome': {
    original: 'Physical warmth as emotional comfort',
    suggestion: 'Try: "friendly welcome," "kind reception," or show the warmth'
  },
  'cold reception': {
    original: 'Physical cold as emotional distance',
    suggestion: 'Try: "unfriendly reception," "cool response," or show the coldness'
  },
  'melted heart': {
    original: 'Ice/frozen heart becoming liquid',
    suggestion: 'Try: "softened," "moved," "touched," or show the emotional change'
  },
  'weight on shoulders': {
    original: 'Burden as physical weight',
    suggestion: 'Try: "burden," "responsibility," or describe what weighs'
  },
  'heavy heart': {
    original: 'Sadness as physical weight in chest',
    suggestion: 'Try: "sad," "grieving," "sorrowful," or show the heaviness'
  },
  'light heart': {
    original: 'Joy as absence of weight',
    suggestion: 'Try: "happy," "carefree," "joyful," or show the lightness'
  },
  'torn apart': {
    original: 'Physical ripping applied to emotions',
    suggestion: 'Try: "devastated," "conflicted," or show the division'
  },
  'broken heart': {
    original: 'Heart as physical object that can shatter',
    suggestion: 'Very common - try showing heartbreak through specific detail instead'
  },
};

// Combine all categories for detection
const ALL_DEAD_METAPHORS: Array<{
  phrase: string;
  category: DeadMetaphor['category'];
  original: string;
  suggestion: string;
}> = [
  ...Object.entries(BODY_METAPHORS).map(([phrase, data]) => ({
    phrase,
    category: 'body' as const,
    ...data
  })),
  ...Object.entries(NATURE_METAPHORS).map(([phrase, data]) => ({
    phrase,
    category: 'nature' as const,
    ...data
  })),
  ...Object.entries(JOURNEY_METAPHORS).map(([phrase, data]) => ({
    phrase,
    category: 'journey' as const,
    ...data
  })),
  ...Object.entries(WAR_METAPHORS).map(([phrase, data]) => ({
    phrase,
    category: 'war' as const,
    ...data
  })),
  ...Object.entries(BUILDING_METAPHORS).map(([phrase, data]) => ({
    phrase,
    category: 'building' as const,
    ...data
  })),
  ...Object.entries(LIGHT_METAPHORS).map(([phrase, data]) => ({
    phrase,
    category: 'light' as const,
    ...data
  })),
  ...Object.entries(TIME_METAPHORS).map(([phrase, data]) => ({
    phrase,
    category: 'time' as const,
    ...data
  })),
  ...Object.entries(EMOTION_METAPHORS).map(([phrase, data]) => ({
    phrase,
    category: 'emotion' as const,
    ...data
  })),
];

/**
 * Detect dead metaphors in text
 */
export function detectDeadMetaphors(text: string): DeadMetaphorAnalysis {
  const metaphors: DeadMetaphor[] = [];
  const lines = text.split('\n');
  let charOffset = 0;

  lines.forEach((line, lineIndex) => {
    const lineLower = line.toLowerCase();

    for (const { phrase, category, original, suggestion } of ALL_DEAD_METAPHORS) {
      // Create regex that handles word boundaries and spaces
      const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedPhrase.replace(/ /g, '\\s+')}`, 'gi');

      let match;
      while ((match = regex.exec(lineLower)) !== null) {
        const matchedText = line.substring(match.index, match.index + match[0].length);

        metaphors.push({
          phrase: matchedText,
          lineNumber: lineIndex + 1,
          startIndex: charOffset + match.index,
          endIndex: charOffset + match.index + match[0].length,
          category,
          originalMeaning: original,
          suggestion
        });
      }
    }

    charOffset += line.length + 1;
  });

  // Remove duplicates at same position
  const uniqueMetaphors = metaphors.filter((metaphor, index, self) =>
    index === self.findIndex(m =>
      m.lineNumber === metaphor.lineNumber &&
      m.startIndex === metaphor.startIndex
    )
  );

  // Sort by line number, then position
  uniqueMetaphors.sort((a, b) => {
    if (a.lineNumber !== b.lineNumber) return a.lineNumber - b.lineNumber;
    return a.startIndex - b.startIndex;
  });

  const count = uniqueMetaphors.length;
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  // Score: fewer dead metaphors = higher originality
  const metaphorRate = wordCount > 0 ? count / wordCount : 0;
  const score = Math.max(0, Math.round(100 - (metaphorRate * 300)));

  let assessment: 'original' | 'some-dead' | 'metaphor-heavy';
  if (score >= 90) {
    assessment = 'original';
  } else if (score >= 70) {
    assessment = 'some-dead';
  } else {
    assessment = 'metaphor-heavy';
  }

  return {
    metaphors: uniqueMetaphors,
    count,
    score,
    assessment
  };
}

/**
 * Group dead metaphors by category for display
 */
export function groupMetaphorsByCategory(analysis: DeadMetaphorAnalysis): Record<string, DeadMetaphor[]> {
  const groups: Record<string, DeadMetaphor[]> = {
    body: [],
    nature: [],
    journey: [],
    war: [],
    building: [],
    light: [],
    time: [],
    emotion: [],
    other: []
  };

  analysis.metaphors.forEach(metaphor => {
    groups[metaphor.category].push(metaphor);
  });

  return groups;
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: DeadMetaphor['category']): string {
  const names: Record<string, string> = {
    body: 'Body Parts',
    nature: 'Nature & Weather',
    journey: 'Journey & Path',
    war: 'War & Battle',
    building: 'Building & Structure',
    light: 'Light & Fire',
    time: 'Time',
    emotion: 'Emotion & Temperature',
    other: 'Other'
  };
  return names[category] || category;
}
