/**
 * Analysis Summary Generator
 *
 * Converts raw analysis data into natural language coaching feedback.
 * 3-5 concise observations about the poem, focusing on what the poet
 * does well and what could be improved.
 */

interface SummaryInput {
  totalWords: number;
  nonEmptyLines: number;
  stanzaCount: number;
  detectedMeter: string;
  isFreeOrMixed: boolean;
  medianSyllableCount: number;
  violatingLines: number[];
  activeForm: string;
  rhymeScheme: {
    schemePattern: string[];
    rhymeQualities: ('perfect' | 'slant' | 'none')[];
  };
  rhymeCompliance: ('perfect' | 'slant' | 'none')[];
  soundPatterns: {
    alliterations: Array<{ sound: string; words: string[] }>;
    assonances: Array<{ sound: string; words: string[] }>;
    consonances: Array<{ sound: string; words: string[] }>;
  };
  clicheAnalysis: {
    strongCliches: Array<{ phrase: string }>;
    moderateCliches: Array<{ phrase: string }>;
  };
  firstDraftAnalysis: {
    phrases: Array<{ phrase: string }>;
  };
  passiveVoiceInstances: Array<{ text: string }>;
  repetitionResults: Array<{ word: string; count: number }>;
  abstractConcreteAnalysis: {
    abstractCount: number;
    concreteCount: number;
    ratio: number;
    score: number;
  };
  meterConsistency: {
    isConsistent: boolean;
    variance: number;
  };
  rhythmVariation: {
    category: string;
    outlierLines: Array<{ lineNumber: number; syllableCount: number }>;
    medianSyllableCount: number;
  };
}

export interface SummaryItem {
  text: string;
  category: 'form' | 'meter' | 'rhyme' | 'sound' | 'style' | 'originality';
  sentiment: 'positive' | 'neutral' | 'suggestion';
}

export function generateAnalysisSummary(input: SummaryInput): SummaryItem[] {
  const items: SummaryItem[] = [];

  // 1. Form identification
  if (input.activeForm && input.activeForm !== 'Free Verse') {
    items.push({
      text: `This reads as a ${input.activeForm} — ${input.nonEmptyLines} lines across ${input.stanzaCount} stanza${input.stanzaCount !== 1 ? 's' : ''}.`,
      category: 'form',
      sentiment: 'neutral',
    });
  } else if (input.nonEmptyLines > 0) {
    const stanzaNote = input.stanzaCount > 1
      ? ` in ${input.stanzaCount} stanzas`
      : '';
    items.push({
      text: `Free verse, ${input.nonEmptyLines} lines${stanzaNote} — no fixed form constraints.`,
      category: 'form',
      sentiment: 'neutral',
    });
  }

  // 2. Meter observation
  if (!input.isFreeOrMixed && input.detectedMeter) {
    const meterName = input.detectedMeter;
    if (input.violatingLines.length === 0) {
      items.push({
        text: `Consistent ${meterName.toLowerCase()} throughout — every line holds the pattern.`,
        category: 'meter',
        sentiment: 'positive',
      });
    } else if (input.violatingLines.length <= 3) {
      const lineList = input.violatingLines.slice(0, 3).join(', ');
      items.push({
        text: `Mostly ${meterName.toLowerCase()} — line${input.violatingLines.length > 1 ? 's' : ''} ${lineList} break${input.violatingLines.length === 1 ? 's' : ''} the rhythm, which could be intentional tension or worth smoothing.`,
        category: 'meter',
        sentiment: 'suggestion',
      });
    } else {
      items.push({
        text: `The meter leans toward ${meterName.toLowerCase()}, but ${input.violatingLines.length} lines diverge — consider whether you want a tighter rhythmic structure.`,
        category: 'meter',
        sentiment: 'suggestion',
      });
    }
  } else if (input.isFreeOrMixed && input.rhythmVariation) {
    const cat = input.rhythmVariation.category;
    if (cat === 'high-variation' || cat === 'moderate-variation') {
      items.push({
        text: `Good rhythmic variety — your line lengths create a natural, dynamic flow.`,
        category: 'meter',
        sentiment: 'positive',
      });
    } else if (cat === 'very-uniform' && input.nonEmptyLines > 4) {
      items.push({
        text: `Lines are very uniform in length — varying some could create more rhythmic interest.`,
        category: 'meter',
        sentiment: 'suggestion',
      });
    }
  }

  // 3. Rhyme scheme
  const schemeArr = input.rhymeScheme.schemePattern;
  if (schemeArr && schemeArr.length > 0) {
    const scheme = schemeArr.join('');
    const uniqueLabels = new Set(schemeArr);
    const hasRhymes = uniqueLabels.size < schemeArr.length;

    if (hasRhymes) {
      const qualities = input.rhymeCompliance || input.rhymeScheme.rhymeQualities;
      const perfectCount = qualities.filter(q => q === 'perfect').length;
      const slantCount = qualities.filter(q => q === 'slant').length;
      const totalRhymes = perfectCount + slantCount;

      if (totalRhymes > 0) {
        const schemeDisplay = scheme.length <= 14 ? ` (${scheme})` : '';
        if (slantCount > perfectCount) {
          items.push({
            text: `Rhyme scheme${schemeDisplay} favors slant rhymes — this creates a modern, understated music.`,
            category: 'rhyme',
            sentiment: 'positive',
          });
        } else if (perfectCount > 0 && slantCount > 0) {
          items.push({
            text: `Rhyme scheme${schemeDisplay} mixes perfect and slant rhymes for variety.`,
            category: 'rhyme',
            sentiment: 'positive',
          });
        } else if (perfectCount > 0) {
          items.push({
            text: `Clean rhyme scheme${schemeDisplay} — all perfect rhymes give it a classic, musical quality.`,
            category: 'rhyme',
            sentiment: 'positive',
          });
        }
      }
    } else if (input.activeForm !== 'Free Verse') {
      items.push({
        text: `No end rhymes detected — if this form typically rhymes, consider adding some.`,
        category: 'rhyme',
        sentiment: 'suggestion',
      });
    }
  }

  // 4. Sound patterns (alliteration, assonance)
  const alliterationCount = input.soundPatterns.alliterations?.length || 0;
  const assonanceCount = input.soundPatterns.assonances?.length || 0;
  if (alliterationCount >= 3 || assonanceCount >= 3) {
    const patterns: string[] = [];
    if (alliterationCount >= 3) patterns.push('alliteration');
    if (assonanceCount >= 3) patterns.push('assonance');
    items.push({
      text: `Rich ${patterns.join(' and ')} — the sound patterns strengthen the poem's texture.`,
      category: 'sound',
      sentiment: 'positive',
    });
  }

  // 5. Cliches and first-draft phrases
  const allCliches = [
    ...(input.clicheAnalysis.strongCliches || []),
    ...(input.clicheAnalysis.moderateCliches || []),
  ];
  const clicheCount = allCliches.length;
  const firstDraftCount = input.firstDraftAnalysis.phrases?.length || 0;
  const totalIssues = clicheCount + firstDraftCount;

  if (totalIssues === 0 && input.totalWords > 20) {
    items.push({
      text: `No cliches or stock phrases detected — the language feels original.`,
      category: 'originality',
      sentiment: 'positive',
    });
  } else if (totalIssues > 0) {
    const issues: string[] = [];
    if (clicheCount > 0) {
      const examples = allCliches.slice(0, 2).map(c => `"${c.phrase}"`).join(' and ');
      issues.push(`${clicheCount} cliche${clicheCount > 1 ? 's' : ''} (${examples})`);
    }
    if (firstDraftCount > 0) {
      issues.push(`${firstDraftCount} first-draft phrase${firstDraftCount > 1 ? 's' : ''}`);
    }
    items.push({
      text: `Found ${issues.join(' and ')} — consider revising for fresher language.`,
      category: 'originality',
      sentiment: 'suggestion',
    });
  }

  // 6. Passive voice
  if (input.passiveVoiceInstances.length >= 3) {
    items.push({
      text: `${input.passiveVoiceInstances.length} passive voice constructions — active voice could add energy in some of these.`,
      category: 'style',
      sentiment: 'suggestion',
    });
  }

  // 7. Abstract vs concrete balance
  const total = input.abstractConcreteAnalysis.abstractCount + input.abstractConcreteAnalysis.concreteCount;
  if (total > 0 && input.totalWords > 20) {
    const abstractPct = Math.round((input.abstractConcreteAnalysis.abstractCount / total) * 100);
    const concretePct = Math.round((input.abstractConcreteAnalysis.concreteCount / total) * 100);
    if (abstractPct > 60) {
      items.push({
        text: `Language is ${abstractPct}% abstract — adding concrete images could ground the poem.`,
        category: 'style',
        sentiment: 'suggestion',
      });
    } else if (concretePct > 60) {
      items.push({
        text: `Strong concrete imagery (${concretePct}% of words) — the poem paints vivid pictures.`,
        category: 'style',
        sentiment: 'positive',
      });
    }
  }

  // Limit to 5 items max, prioritize: form, then suggestions, then positives
  if (items.length > 5) {
    const formItem = items.find(i => i.category === 'form');
    const rest = items.filter(i => i.category !== 'form');
    const suggestions = rest.filter(i => i.sentiment === 'suggestion');
    const positives = rest.filter(i => i.sentiment === 'positive' || i.sentiment === 'neutral');
    const sorted = [...suggestions, ...positives].slice(0, 4);
    return formItem ? [formItem, ...sorted] : sorted.slice(0, 5);
  }

  return items;
}
