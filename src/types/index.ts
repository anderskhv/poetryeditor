export interface PoetryAnalysis {
  syllableCount: number[];
  totalWords: number;
  posDistribution: Record<string, number>;
  detectedMeter: string;
  rhymeScheme?: string;
}

export interface WordInfo {
  word: string;
  pos: string;
  syllables: number;
  lineIndex: number;
  startOffset: number;
  endOffset: number;
}

export interface MeterPattern {
  name: string;
  pattern: string[];
  description: string;
}

export type POSCategory = 'Noun' | 'Verb' | 'Adjective' | 'Adverb' | 'Pronoun' | 'Conjunction' | 'Preposition' | 'Article' | 'Other';

export interface EditorTheme {
  nouns: string;
  verbs: string;
  adjectives: string;
  adverbs: string;
  other: string;
}
