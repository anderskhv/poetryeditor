/**
 * First Draft Phrases Detector
 *
 * Identifies filler words and weak phrases that often appear in first drafts.
 * These words tend to dilute impact and can usually be cut or replaced.
 *
 * Philosophy: Not errors, but opportunities to strengthen the writing.
 */

export interface FirstDraftPhrase {
  phrase: string;
  lineNumber: number;
  startIndex: number;
  endIndex: number;
  category: 'intensifier' | 'hedge' | 'filler' | 'weak-verb' | 'redundant';
  suggestion: string;
}

export interface FirstDraftAnalysis {
  phrases: FirstDraftPhrase[];
  count: number;
  score: number; // 0-100, higher is cleaner
  assessment: 'clean' | 'minor-issues' | 'needs-revision';
}

// Weak intensifiers - often weaken rather than strengthen
const WEAK_INTENSIFIERS: Record<string, string> = {
  'very': 'Cut or use a stronger word. "Very tired" → "exhausted"',
  'really': 'Usually unnecessary. "Really beautiful" → "beautiful" or "stunning"',
  'quite': 'Often adds nothing. "Quite sad" → "sad" or "devastated"',
  'rather': 'Hedges your meaning. Commit to your image.',
  'somewhat': 'Weakens impact. Either something is or isn\'t.',
  'fairly': 'Non-committal. Be bold with your language.',
  'pretty': 'Dilutes meaning when used as intensifier. "Pretty good" → "good" or find stronger word.',
  'extremely': 'Often signals a weak base word. Find one strong word instead.',
  'incredibly': 'Overused intensifier. Let the image speak for itself.',
  'absolutely': 'Usually redundant. "Absolutely silent" → "silent"',
  'totally': 'Informal filler. Cut it.',
  'completely': 'Often redundant. "Completely empty" → "empty" or "hollow"',
  'utterly': 'Can work in poetry, but check if needed.',
  'so': 'Weak when used as intensifier. "So beautiful" → use a specific image.',
};

// Hedge words - show uncertainty where none is needed
const HEDGE_WORDS: Record<string, string> = {
  'maybe': 'Commit to your image or cut. Poetry thrives on conviction.',
  'perhaps': 'Sometimes effective for tone, but often weakens.',
  'possibly': 'Creates doubt. Be definite.',
  'probably': 'Hedges your statement. Take a stand.',
  'seemingly': 'Either it seems or it is. Choose.',
  'apparently': 'Creates distance. Get closer to your subject.',
  'somehow': 'Vague. How exactly? Show it.',
  'somewhat': 'Fence-sitting. Commit.',
  'almost': 'Sometimes effective, but check if it\'s doing work.',
  'nearly': 'Similar to almost. Make sure it earns its place.',
  'kind of': 'Colloquial hedge. Cut or commit.',
  'sort of': 'Weakens assertion. What is it exactly?',
  'a bit': 'Often unnecessary. "A bit cold" → "cold"',
  'a little': 'Check if needed. "A little afraid" → "afraid" or show the fear.',
};

// Filler phrases - add words without adding meaning
const FILLER_PHRASES: Record<string, string> = {
  'i think': 'In poetry, everything is what you think. Cut it.',
  'i feel': 'Show the feeling through images instead.',
  'i believe': 'Your poem is your belief. No need to state it.',
  'i know': 'Often unnecessary. Just state what you know.',
  'it is': 'Can often be cut. "It is raining" → "Rain falls" or just "Rain"',
  'there is': '"There is a bird" → "A bird" or better: describe the bird.',
  'there are': 'Similar to "there is". Often cuttable.',
  'in order to': '"In order to see" → "to see"',
  'due to the fact': 'Just say "because"',
  'at this point': 'Usually cuttable.',
  'for the most part': 'Hedge. Be specific or cut.',
  'as a matter of fact': 'Just state the fact.',
  'at the end of the day': 'Cliche. Find a fresh way to say it.',
  'the fact that': 'Usually can be cut. "The fact that she left" → "She left"',
  'in my opinion': 'The whole poem is your opinion. Cut it.',
  'to be honest': 'Implies you might not be otherwise. Cut it.',
  'basically': 'Filler word. Cut it.',
  'actually': 'Often unnecessary. Cut unless creating contrast.',
  'literally': 'Overused. Make sure it\'s literal, or cut it.',
  'just': 'One of the most overused words. Cut 90% of the time.',
};

// Weak verb phrases - "to be" + adjective instead of strong verb
const WEAK_VERB_PATTERNS: Array<{pattern: RegExp; suggestion: string}> = [
  {
    pattern: /\b(is|was|are|were|am|be|been|being)\s+(very\s+)?(sad|happy|angry|afraid|scared|tired|hungry|thirsty)\b/gi,
    suggestion: 'Replace "is/was [emotion]" with an action verb. "She was sad" → "She wept" or show physical signs.'
  },
  {
    pattern: /\bstarted?\s+to\s+\w+/gi,
    suggestion: '"Started to [verb]" → just use the verb. "Started to cry" → "cried" or "wept"'
  },
  {
    pattern: /\bbegan?\s+to\s+\w+/gi,
    suggestion: '"Began to [verb]" → just use the verb. "Began to run" → "ran"'
  },
  {
    pattern: /\btried?\s+to\s+\w+/gi,
    suggestion: 'Consider if "tried to" is needed. Often you can just use the verb.'
  },
  {
    pattern: /\bseemed?\s+to\s+\w+/gi,
    suggestion: '"Seemed to" creates distance. Get closer: did it or didn\'t it?'
  },
];

/**
 * Detect first draft phrases in text
 */
export function detectFirstDraftPhrases(text: string): FirstDraftAnalysis {
  const phrases: FirstDraftPhrase[] = [];
  const lines = text.split('\n');

  lines.forEach((line, lineIndex) => {
    const lineLower = line.toLowerCase();
    let charOffset = 0;

    // Check intensifiers
    for (const [word, suggestion] of Object.entries(WEAK_INTENSIFIERS)) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      let match;
      while ((match = regex.exec(lineLower)) !== null) {
        phrases.push({
          phrase: line.substring(match.index, match.index + word.length),
          lineNumber: lineIndex + 1,
          startIndex: charOffset + match.index,
          endIndex: charOffset + match.index + word.length,
          category: 'intensifier',
          suggestion
        });
      }
    }

    // Check hedge words
    for (const [word, suggestion] of Object.entries(HEDGE_WORDS)) {
      const regex = new RegExp(`\\b${word.replace(/ /g, '\\s+')}\\b`, 'gi');
      let match;
      while ((match = regex.exec(lineLower)) !== null) {
        phrases.push({
          phrase: line.substring(match.index, match.index + match[0].length),
          lineNumber: lineIndex + 1,
          startIndex: charOffset + match.index,
          endIndex: charOffset + match.index + match[0].length,
          category: 'hedge',
          suggestion
        });
      }
    }

    // Check filler phrases
    for (const [phrase, suggestion] of Object.entries(FILLER_PHRASES)) {
      const regex = new RegExp(`\\b${phrase.replace(/ /g, '\\s+')}\\b`, 'gi');
      let match;
      while ((match = regex.exec(lineLower)) !== null) {
        phrases.push({
          phrase: line.substring(match.index, match.index + match[0].length),
          lineNumber: lineIndex + 1,
          startIndex: charOffset + match.index,
          endIndex: charOffset + match.index + match[0].length,
          category: 'filler',
          suggestion
        });
      }
    }

    // Check weak verb patterns
    for (const {pattern, suggestion} of WEAK_VERB_PATTERNS) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(lineLower)) !== null) {
        phrases.push({
          phrase: line.substring(match.index, match.index + match[0].length),
          lineNumber: lineIndex + 1,
          startIndex: charOffset + match.index,
          endIndex: charOffset + match.index + match[0].length,
          category: 'weak-verb',
          suggestion
        });
      }
    }

    charOffset += line.length + 1;
  });

  // Remove duplicates (same position)
  const uniquePhrases = phrases.filter((phrase, index, self) =>
    index === self.findIndex(p =>
      p.lineNumber === phrase.lineNumber &&
      p.startIndex === phrase.startIndex &&
      p.phrase.toLowerCase() === phrase.phrase.toLowerCase()
    )
  );

  // Sort by line number, then position
  uniquePhrases.sort((a, b) => {
    if (a.lineNumber !== b.lineNumber) return a.lineNumber - b.lineNumber;
    return a.startIndex - b.startIndex;
  });

  const count = uniquePhrases.length;
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  // Score: fewer issues = higher score
  // Normalize by word count
  const issueRate = wordCount > 0 ? count / wordCount : 0;
  const score = Math.max(0, Math.round(100 - (issueRate * 500)));

  let assessment: 'clean' | 'minor-issues' | 'needs-revision';
  if (score >= 90) {
    assessment = 'clean';
  } else if (score >= 70) {
    assessment = 'minor-issues';
  } else {
    assessment = 'needs-revision';
  }

  return {
    phrases: uniquePhrases,
    count,
    score,
    assessment
  };
}

/**
 * Group phrases by category for display
 */
export function groupByCategory(analysis: FirstDraftAnalysis): Record<string, FirstDraftPhrase[]> {
  const groups: Record<string, FirstDraftPhrase[]> = {
    'intensifier': [],
    'hedge': [],
    'filler': [],
    'weak-verb': [],
    'redundant': []
  };

  analysis.phrases.forEach(phrase => {
    groups[phrase.category].push(phrase);
  });

  return groups;
}
