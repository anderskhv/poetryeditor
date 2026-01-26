// Poem data structure for analysis pages
export interface PoemAnalysis {
  slug: string;
  title: string;
  poet: string;
  poetBirth: number;
  poetDeath: number;
  year: number;
  collection?: string;
  text: string;
  form: string;
  analysis: {
    overview: string;
    lineByLine: Array<{
      lines: string; // e.g., "1-4" or "5"
      commentary: string;
    }>;
    themes: string[];
    literaryDevices: Array<{
      device: string;
      example: string;
      explanation: string;
    }>;
    historicalContext?: string;
  };
  seoDescription: string;
}

// Import individual poems
import { onLove } from './gibran-on-love';
import { onChildren } from './gibran-on-children';
import { onJoyAndSorrow } from './gibran-on-joy-and-sorrow';
import { wideningCircles } from './rilke-widening-circles';
import { godSpeaks } from './rilke-god-speaks';

export const poems: Record<string, PoemAnalysis> = {
  'on-love': onLove,
  'on-children': onChildren,
  'on-joy-and-sorrow': onJoyAndSorrow,
  'widening-circles': wideningCircles,
  'god-speaks': godSpeaks,
};

export function getPoemBySlug(slug: string): PoemAnalysis | undefined {
  return poems[slug];
}

export function getAllPoems(): PoemAnalysis[] {
  return Object.values(poems);
}

export function getAllPoemSlugs(): string[] {
  return Object.keys(poems);
}
