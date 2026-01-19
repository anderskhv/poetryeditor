/**
 * Sound Pattern Detection - Alliteration, Assonance, and Consonance
 */

export interface SoundPatternInstance {
  type: 'alliteration' | 'assonance' | 'consonance';
  words: string[];
  lineIndex: number;
  sound: string;
  description: string;
}

export interface SoundPatternAnalysis {
  alliterations: SoundPatternInstance[];
  assonances: SoundPatternInstance[];
  consonances: SoundPatternInstance[];
  totalScore: number;
}

/**
 * Get the initial sound of a word for alliteration detection
 */
function getInitialSound(word: string): string {
  const lower = word.toLowerCase();
  const twoLetters = lower.slice(0, 2);

  // Silent letter combinations
  if (twoLetters === 'wr') return 'r';
  if (twoLetters === 'kn') return 'n';
  if (twoLetters === 'gn') return 'n';
  if (twoLetters === 'ps') return 's';
  if (twoLetters === 'pn') return 'n';
  if (twoLetters === 'wh') return 'w';
  if (twoLetters === 'ph') return 'f';
  if (twoLetters === 'qu') return 'kw';
  if (twoLetters === 'ch') return 'ch';
  if (twoLetters === 'sh') return 'sh';
  if (twoLetters === 'th') return 'th';

  // Soft c (before e, i, y)
  if (lower[0] === 'c' && (lower[1] === 'e' || lower[1] === 'i' || lower[1] === 'y')) {
    return 's';
  }

  // c/k equivalence
  if (lower[0] === 'c' || lower[0] === 'k') {
    return 'k';
  }

  return lower[0];
}

/**
 * Extract vowel sounds from a word
 * Returns only the PRIMARY/dominant vowel sound of the word to reduce false positives
 * Uses phonetic rules rather than just spelling
 */
function extractVowelSounds(word: string): string[] {
  const lower = word.toLowerCase();
  const sounds: string[] = [];

  // Track which positions have been "consumed" by a vowel pattern
  const consumedPositions = new Set<number>();

  // Helper to mark positions as consumed
  const markConsumed = (pattern: RegExp) => {
    let match;
    const regex = new RegExp(pattern.source, 'g');
    while ((match = regex.exec(lower)) !== null) {
      for (let i = match.index; i < match.index + match[0].length; i++) {
        consumedPositions.add(i);
      }
    }
  };

  // Words with silent 'e' at the end - mark as consumed
  // Also handle words where vowels don't sound as spelled
  const silentEWords = /[^aeiou]e$/; // consonant + e at end (like "once", "come", "have")
  if (silentEWords.test(lower)) {
    consumedPositions.add(lower.length - 1);
  }

  // Special cases: words where the vowel sound doesn't match spelling
  // "once", "one", "done", "come", "some", "love", "dove", "shove", "above" - have /ʌ/ sound
  if (/^(once|one|done|come|some|none|gone|love|dove|shove|above|won|son|ton|front|month|monkey|money|honey|among|tongue)$/.test(lower)) {
    sounds.push('short-u');
    return sounds; // These words have a clear single vowel sound
  }

  // Words ending in just 'e' that have long-e: "we", "me", "he", "she", "be", "the" (when stressed)
  if (/^(we|me|he|she|be)$/.test(lower)) {
    sounds.push('long-e');
    return sounds;
  }

  // Long-a patterns: ai (rain, pain), ay (day, say), a_e (make, take), eigh (weigh), ey (they, grey)
  if (/ai|ay|a[^aeiou]e\b|eigh|^they$|^grey$|^great$/.test(lower)) {
    sounds.push('long-a');
    markConsumed(/ai|ay|a[^aeiou]e\b|eigh/);
  }

  // Long-o patterns: ow (slow, know - but NOT "how", "now"), oa (boat), o_e (home), old, olk, oll, ost, oe
  if (/oa|o[^aeiou]e\b|old|olk|oll\b|ost\b|oe\b|^(slow|flow|grow|know|show|snow|blow|glow|low|row|tow|bow|mow|sow)$/.test(lower)) {
    sounds.push('long-o');
    markConsumed(/oa|o[^aeiou]e\b|old|olk|oll\b|ost\b|oe\b|ow/);
  }

  // Long-i patterns: i_e (time, mine), igh (night), y at end (my, fly), ie (die, tie)
  if (/i[^aeiou]e\b|igh|[^aeiou]y\b|^(die|tie|lie|pie|vie)$|yme\b/.test(lower)) {
    sounds.push('long-i');
    markConsumed(/i[^aeiou]e\b|igh|y\b|ie\b|yme\b/);
  }

  // Long-e patterns: ee (feet, see), ea (beat, sea), ie (field), ey (key), y in middle (system - no)
  if (/ee|ea(?!r\b)(?!u)|ie(?!s\b)(?!d\b)|^key$/.test(lower)) {
    sounds.push('long-e');
    markConsumed(/ee|ea|ie/);
  }

  // Long-u patterns: oo (moon, soon), ue (blue, true), ew (new, few), u_e (tune)
  if (/oo(?!k\b)|ue\b|ew\b|u[^aeiou]e\b/.test(lower)) {
    sounds.push('long-u');
    markConsumed(/oo|ue\b|ew\b|u[^aeiou]e\b/);
  }

  // Diphthongs - ou/ow as in "out", "how" (NOT "slow", "know")
  if (/ou[ndt]|^(how|now|cow|bow|wow|pow|vow|brow|plow|town|down|rown|brown|crown|frown|drown|ound|ound|ount|out|ouse|outh)/.test(lower)) {
    sounds.push('ou-diphthong');
    markConsumed(/ou|ow/);
  }
  if (/oi|oy/.test(lower)) {
    sounds.push('oi-diphthong');
    markConsumed(/oi|oy/);
  }
  if (/au|aw|a[l]l/.test(lower)) {
    sounds.push('aw-sound');
    markConsumed(/au|aw|all/);
  }

  // Short vowels - only add if the vowel position hasn't been consumed
  // Be strict: only detect short vowels in clear CVC, CVCC, CCVC patterns
  // This prevents false positives from unstressed syllables and silent letters

  // First, check for clear short vowel patterns
  // Short-e: bet, set, get, let, met, felt, help, held, melt, west, best, rest, test, left, kept, wept, etc.
  if (/^[^aeiou]*e[^aeiou]+$/.test(lower) && !sounds.length) {
    // Single vowel 'e' followed by consonant(s) - clear short-e
    sounds.push('short-e');
  }
  // Short-a: cat, bat, hat, sat, back, black, hand, land, stand, etc.
  else if (/^[^aeiou]*a[^aeiou]+$/.test(lower) && !sounds.length && !/all|alk|alt|ald/.test(lower)) {
    sounds.push('short-a');
  }
  // Short-i: bit, sit, hit, fit, ship, trip, still, fill, will, etc.
  else if (/^[^aeiou]*i[^aeiou]+$/.test(lower) && !sounds.length && !/igh|ind\b|ild\b/.test(lower)) {
    sounds.push('short-i');
  }
  // Short-o: hot, not, got, pot, stop, drop, rock, lock, etc.
  else if (/^[^aeiou]*o[^aeiou]+$/.test(lower) && !sounds.length && !/old|olk|oll|ost|oth/.test(lower)) {
    sounds.push('short-o');
  }
  // Short-u: but, cut, hut, run, sun, fun, up, cup, just, must, etc.
  else if (/^[^aeiou]*u[^aeiou]+$/.test(lower) && !sounds.length) {
    sounds.push('short-u');
  }

  return [...new Set(sounds)]; // Remove duplicates
}

/**
 * Extract ending consonant sounds from a word
 */
function extractEndingConsonants(word: string): string {
  const lower = word.toLowerCase();
  const clusters = ['ck', 'ng', 'nk', 'nt', 'nd', 'mp', 'lt', 'ld', 'ft', 'st', 'sk', 'sp', 'pt', 'ct'];

  for (const cluster of clusters) {
    if (lower.endsWith(cluster)) {
      return cluster;
    }
  }

  const match = lower.match(/[bcdfghjklmnpqrstvwxyz]+$/);
  return match ? match[0] : '';
}

/**
 * Detect alliteration in a line using sliding window approach
 * Requires 3+ words with the same starting sound within a 5-word window
 */
function detectAlliterationInLine(words: string[], lineIndex: number): SoundPatternInstance[] {
  const instances: SoundPatternInstance[] = [];
  const contentWords = words.filter(w => w.length > 2);

  if (contentWords.length < 3) return instances;

  const windowSize = 5;
  const minMatches = 3;
  const foundPatterns = new Set<string>(); // Avoid duplicate patterns

  // Sliding window approach
  for (let windowStart = 0; windowStart <= contentWords.length - minMatches; windowStart++) {
    const windowEnd = Math.min(windowStart + windowSize, contentWords.length);
    const windowWords = contentWords.slice(windowStart, windowEnd);

    // Group by initial sound within this window
    const soundGroups: Map<string, string[]> = new Map();

    for (const word of windowWords) {
      const sound = getInitialSound(word);
      if (!sound || /[aeiou]/.test(sound)) continue;

      if (!soundGroups.has(sound)) {
        soundGroups.set(sound, []);
      }
      soundGroups.get(sound)!.push(word);
    }

    // Check for alliteration (3+ words with same sound in window)
    for (const [sound, groupWords] of soundGroups) {
      if (groupWords.length >= minMatches) {
        const patternKey = `${sound}:${groupWords.sort().join(',')}`;
        if (!foundPatterns.has(patternKey)) {
          foundPatterns.add(patternKey);
          instances.push({
            type: 'alliteration',
            words: groupWords,
            lineIndex,
            sound,
            description: `"${sound}" sound: ${groupWords.join(', ')}`,
          });
        }
      }
    }
  }

  return instances;
}

/**
 * Detect assonance in a line using sliding window approach
 * Requires 3+ words with the same vowel sound within a 5-word window
 */
function detectAssonanceInLine(words: string[], lineIndex: number): SoundPatternInstance[] {
  const instances: SoundPatternInstance[] = [];
  // Include shorter words for assonance (words like "we", "my", "go" have strong vowel sounds)
  const contentWords = words.filter(w => w.length >= 2);

  if (contentWords.length < 3) return instances;

  const windowSize = 5;
  const minMatches = 3;
  const foundPatterns = new Set<string>(); // Avoid duplicate patterns

  // Sliding window approach
  for (let windowStart = 0; windowStart <= contentWords.length - minMatches; windowStart++) {
    const windowEnd = Math.min(windowStart + windowSize, contentWords.length);
    const windowWords = contentWords.slice(windowStart, windowEnd);

    // Group by vowel sound within this window
    const soundGroups: Map<string, string[]> = new Map();

    for (const word of windowWords) {
      const vowelSounds = extractVowelSounds(word);

      for (const sound of vowelSounds) {
        if (!soundGroups.has(sound)) {
          soundGroups.set(sound, []);
        }
        if (!soundGroups.get(sound)!.includes(word)) {
          soundGroups.get(sound)!.push(word);
        }
      }
    }

    // Check for assonance (3+ words with same vowel sound in window)
    for (const [sound, groupWords] of soundGroups) {
      if (groupWords.length >= minMatches) {
        const patternKey = `${sound}:${groupWords.sort().join(',')}`;
        if (!foundPatterns.has(patternKey)) {
          foundPatterns.add(patternKey);
          const soundLabel = sound.replace('-', ' ');
          instances.push({
            type: 'assonance',
            words: groupWords,
            lineIndex,
            sound,
            description: `${soundLabel} vowel: ${groupWords.join(', ')}`,
          });
        }
      }
    }
  }

  return instances;
}

/**
 * Get the final consonant sound from a word (just the last consonant, not the cluster)
 * This allows matching "on" with "scorn" (both end in 'n')
 * Handles silent 'e' endings (like "gone", "stone", "time")
 */
function getFinalConsonant(word: string): string {
  let lower = word.toLowerCase();

  // Handle silent 'e' at the end (gone -> gon, stone -> ston, time -> tim)
  if (lower.endsWith('e') && lower.length > 2) {
    const beforeE = lower.slice(0, -1);
    // Only treat as silent 'e' if there's a consonant before it
    if (/[bcdfghjklmnpqrstvwxyz]$/.test(beforeE)) {
      lower = beforeE;
    }
  }

  const match = lower.match(/[bcdfghjklmnpqrstvwxyz]$/);
  return match ? match[0] : '';
}

/**
 * Detect consonance in a line
 * Matches words that share the same final consonant sound
 * Requires 3+ words to reduce noise (aligned with alliteration/assonance)
 */
function detectConsonanceInLine(words: string[], lineIndex: number): SoundPatternInstance[] {
  const instances: SoundPatternInstance[] = [];
  // Include 2-letter words like "on", "an", etc.
  const contentWords = words.filter(w => w.length >= 2);

  const minMatches = 3; // Require 3+ words to match (reduces noise significantly)

  if (contentWords.length < minMatches) return instances;

  // Group by final consonant sound (simpler matching for better coverage)
  const finalConsonantGroups: Map<string, string[]> = new Map();
  // Also track full ending clusters for more specific consonance
  const clusterGroups: Map<string, string[]> = new Map();

  for (const word of contentWords) {
    // Get final consonant for broad matching
    const finalConsonant = getFinalConsonant(word);
    if (finalConsonant) {
      if (!finalConsonantGroups.has(finalConsonant)) {
        finalConsonantGroups.set(finalConsonant, []);
      }
      if (!finalConsonantGroups.get(finalConsonant)!.includes(word)) {
        finalConsonantGroups.get(finalConsonant)!.push(word);
      }
    }

    // Also get full ending cluster for more specific matches
    const ending = extractEndingConsonants(word);
    if (ending && ending.length > 1) {
      if (!clusterGroups.has(ending)) {
        clusterGroups.set(ending, []);
      }
      if (!clusterGroups.get(ending)!.includes(word)) {
        clusterGroups.get(ending)!.push(word);
      }
    }
  }

  // Track which words we've already reported to avoid duplicates
  const reportedPairs = new Set<string>();

  // First, report cluster matches (more specific, like -nt, -nd, -rn)
  for (const [sound, groupWords] of clusterGroups) {
    if (groupWords.length >= minMatches) {
      const pairKey = groupWords.sort().join(',');
      reportedPairs.add(pairKey);
      instances.push({
        type: 'consonance',
        words: groupWords,
        lineIndex,
        sound,
        description: `"-${sound}" ending: ${groupWords.join(', ')}`,
      });
    }
  }

  // Then report final consonant matches (broader, like -n matching on/scorn)
  for (const [sound, groupWords] of finalConsonantGroups) {
    if (groupWords.length >= minMatches) {
      // Only report if we haven't already covered these words in a cluster match
      const pairKey = groupWords.sort().join(',');
      if (!reportedPairs.has(pairKey)) {
        instances.push({
          type: 'consonance',
          words: groupWords,
          lineIndex,
          sound,
          description: `"-${sound}" sound: ${groupWords.join(', ')}`,
        });
      }
    }
  }

  return instances;
}

/**
 * Analyze sound patterns in the entire text
 */
export function analyzeSoundPatterns(text: string): SoundPatternAnalysis {
  const lines = text.split('\n');
  const alliterations: SoundPatternInstance[] = [];
  const assonances: SoundPatternInstance[] = [];
  const consonances: SoundPatternInstance[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex].trim();
    if (!line) continue;

    const words = line
      .replace(/[^\w\s'-]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 0);

    alliterations.push(...detectAlliterationInLine(words, lineIndex));
    assonances.push(...detectAssonanceInLine(words, lineIndex));
    consonances.push(...detectConsonanceInLine(words, lineIndex));
  }

  const totalPatterns = alliterations.length + assonances.length + consonances.length;
  const lineCount = lines.filter(l => l.trim().length > 0).length;
  const patternsPerLine = lineCount > 0 ? totalPatterns / lineCount : 0;
  const totalScore = Math.min(100, Math.round(patternsPerLine * 50));

  return {
    alliterations,
    assonances,
    consonances,
    totalScore,
  };
}
