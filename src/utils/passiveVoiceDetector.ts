/**
 * Passive Voice Detection Utility
 *
 * Detects passive voice constructions in text using compromise.js
 */

import nlp from 'compromise';

export interface PassiveVoiceInstance {
  text: string;
  lineIndex: number;
  startOffset: number;
  endOffset: number;
  type: 'be-passive' | 'get-passive';
}

/**
 * Detect passive voice in text
 *
 * Passive voice patterns:
 * - "to be" verb + past participle (e.g., "was written", "is done", "were taken")
 * - "get" + past participle (e.g., "got caught", "get broken")
 */
export function detectPassiveVoice(text: string): PassiveVoiceInstance[] {
  const instances: PassiveVoiceInstance[] = [];
  const lines = text.split('\n');

  let globalOffset = 0;

  // Common past participles that indicate passive voice
  const commonPastParticiples = new Set([
    'written', 'done', 'taken', 'made', 'seen', 'given', 'found', 'told', 'left',
    'brought', 'sent', 'broken', 'chosen', 'driven', 'eaten', 'fallen', 'forgotten',
    'frozen', 'hidden', 'known', 'proven', 'ridden', 'risen', 'spoken', 'stolen',
    'sworn', 'thrown', 'worn', 'woken', 'born', 'built', 'caught', 'felt', 'held',
    'heard', 'kept', 'lost', 'meant', 'met', 'paid', 'read', 'said', 'sold', 'shot',
    'shown', 'shut', 'slept', 'spent', 'stood', 'taught', 'thought', 'understood',
    'won', 'killed', 'moved', 'changed', 'loved', 'hated', 'watched', 'called',
    'created', 'destroyed', 'opened', 'closed', 'finished', 'started', 'stopped',
    'allowed', 'asked', 'believed', 'considered', 'expected', 'needed', 'wanted',
    'remembered', 'used', 'placed', 'named', 'formed', 'based', 'designed', 'required',
    'torn', 'worn', 'born', 'sworn', 'shorn', 'borne',
    'hurt', 'cut', 'put', 'set', 'hit', 'split', 'shut', 'quit', 'rid', 'bid',
  ]);

  // Regex pattern for be-passive: forms of "be" + adverb(optional) + past participle
  const beVerbs = '(?:am|is|are|was|were|been|being|be)';
  // Match words ending in common past participle endings:
  // -ed, -en, -wn, -rn, -ne (done), -de (made), -ld (told), -nd (found), -id (paid, said), -rt (hurt)
  const bePassiveRegex = new RegExp(
    `\\b(${beVerbs})\\s+(?:\\w+ly\\s+)?([a-z]+(?:ed|en|wn|rn|ne|de|ld|nd|id|rt|pt|ft|lt|nt|st|ck))\\b`,
    'gi'
  );

  // Regex pattern for get-passive - added ght for caught/taught/bought
  const getPassiveRegex = /\b(get|gets|getting|got)\s+(?:\w+ly\s+)?([a-z]+(?:ed|en|wn|rn|ne|de|ld|nd|id|rt|pt|ft|lt|nt|st|ck|ght))\b/gi;

  lines.forEach((line, lineIndex) => {
    if (!line.trim()) {
      globalOffset += line.length + 1;
      return;
    }

    // Try NLP-based detection first
    const doc = nlp(line);

    // Pattern 1: "to be" + past participle using compromise.js
    const bePassive = doc.match('[am|is|are|was|were|been|being] [#PastTense]');
    const bePassive2 = doc.match('[am|is|are|was|were|been|being] #Adverb? [#Verb]');

    const addedMatches = new Set<string>();

    if (bePassive.found) {
      bePassive.forEach((match: any) => {
        const matchText = match.text();
        const startOffset = line.indexOf(matchText);

        if (startOffset !== -1 && !addedMatches.has(matchText.toLowerCase())) {
          addedMatches.add(matchText.toLowerCase());
          instances.push({
            text: matchText,
            lineIndex,
            startOffset: globalOffset + startOffset,
            endOffset: globalOffset + startOffset + matchText.length,
            type: 'be-passive'
          });
        }
      });
    }

    // Also check with regex for patterns NLP might miss
    let regexMatch;
    bePassiveRegex.lastIndex = 0;
    while ((regexMatch = bePassiveRegex.exec(line)) !== null) {
      const matchText = regexMatch[0];
      const participle = regexMatch[2].toLowerCase();

      // Check if it's a likely past participle
      if (commonPastParticiples.has(participle) ||
          participle.endsWith('ed') ||
          participle.endsWith('en') ||
          participle.endsWith('wn') ||
          participle.endsWith('ught') ||
          participle.endsWith('oken')) {

        if (!addedMatches.has(matchText.toLowerCase())) {
          addedMatches.add(matchText.toLowerCase());
          instances.push({
            text: matchText,
            lineIndex,
            startOffset: globalOffset + regexMatch.index,
            endOffset: globalOffset + regexMatch.index + matchText.length,
            type: 'be-passive'
          });
        }
      }
    }

    // Pattern 2: "get" + past participle
    const getPassive = doc.match('[get|gets|getting|got] [#PastTense]');

    if (getPassive.found) {
      getPassive.forEach((match: any) => {
        const matchText = match.text();
        const startOffset = line.indexOf(matchText);

        if (startOffset !== -1 && !addedMatches.has(matchText.toLowerCase())) {
          addedMatches.add(matchText.toLowerCase());
          instances.push({
            text: matchText,
            lineIndex,
            startOffset: globalOffset + startOffset,
            endOffset: globalOffset + startOffset + matchText.length,
            type: 'get-passive'
          });
        }
      });
    }

    // Also check get-passive with regex
    getPassiveRegex.lastIndex = 0;
    while ((regexMatch = getPassiveRegex.exec(line)) !== null) {
      const matchText = regexMatch[0];
      const participle = regexMatch[2].toLowerCase();

      if (commonPastParticiples.has(participle) ||
          participle.endsWith('ed') ||
          participle.endsWith('en')) {

        if (!addedMatches.has(matchText.toLowerCase())) {
          addedMatches.add(matchText.toLowerCase());
          instances.push({
            text: matchText,
            lineIndex,
            startOffset: globalOffset + regexMatch.index,
            endOffset: globalOffset + regexMatch.index + matchText.length,
            type: 'get-passive'
          });
        }
      }
    }

    globalOffset += line.length + 1; // +1 for newline
  });

  return instances;
}

/**
 * Get passive voice percentage
 */
export function getPassiveVoicePercentage(passiveInstances: PassiveVoiceInstance[], totalSentences: number): number {
  if (totalSentences === 0) return 0;

  // Count unique lines with passive voice
  const linesWithPassive = new Set(passiveInstances.map(p => p.lineIndex)).size;

  return Math.round((linesWithPassive / totalSentences) * 100);
}

/**
 * Group passive instances by line
 */
export function groupPassiveByLine(passiveInstances: PassiveVoiceInstance[]): Map<number, PassiveVoiceInstance[]> {
  const grouped = new Map<number, PassiveVoiceInstance[]>();

  passiveInstances.forEach(instance => {
    if (!grouped.has(instance.lineIndex)) {
      grouped.set(instance.lineIndex, []);
    }
    grouped.get(instance.lineIndex)!.push(instance);
  });

  return grouped;
}
