/**
 * LLM-Enhanced Analysis — Haiku post-processing pass.
 *
 * Enriches client-side analysis with AI verdicts on cliches,
 * figurative language, meter violations, and craft observations.
 * Runs automatically for registered users.
 */

import type { LLMAnalysisResult } from '../types/editor';
import { getLocalApiKey } from './editorStorage';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANALYSIS_MODEL = 'claude-haiku-4-5-20251001';
const ANTHROPIC_VERSION = '2023-06-01';

/** Compact summary of client-side analysis sent to Haiku */
export interface ClientAnalysisSummary {
  detectedCliches: Array<{ phrase: string; lineNumber: number; severity: string }>;
  figurativeInstances: Array<{ type: string; text: string; lineIndex: number }>;
  meterViolations: Array<{ lineNumber: number; expected: number; actual: number }>;
  rhymeScheme: string;
  detectedMeter: string;
  detectedForm: string;
}

function resolveApiKey(): string | null {
  const userKey = getLocalApiKey();
  if (userKey) return userKey;
  const envKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (envKey) return envKey;
  return null;
}

/**
 * Build the system + user prompt for the Haiku analysis pass.
 */
export function buildAnalysisPrompt(
  poemText: string,
  clientAnalysis: ClientAnalysisSummary,
): { system: string; user: string } {
  const system = `You are a poetry craft analyst. You receive a poem and its client-side analysis results. Your job is to enrich the analysis with nuanced judgments that heuristics cannot make.

Return ONLY valid JSON matching this exact schema — no markdown, no explanation, no code blocks:
{
  "enhancedSummary": ["string", ...],
  "clicheVerdicts": { "phrase": { "verdict": "intentional|likely_cliche|ambiguous", "reasoning": "string" }, ... },
  "additionalFigurative": [{ "type": "string", "text": "string", "lineNumber": number, "explanation": "string" }, ...],
  "meterVerdicts": { "lineNumber": { "verdict": "intentional_break|accidental|ambiguous", "reasoning": "string" }, ... },
  "craftObservations": ["string", ...]
}

Rules:
- enhancedSummary: 3-5 rich craft observations about the poem's technique, voice, or effect. Be specific and insightful.
- clicheVerdicts: For each detected cliche phrase, assess whether the poet is subverting it intentionally, using it as a genuine cliche, or it's ambiguous. Only include entries for phrases in the input.
- additionalFigurative: Find figurative language the heuristics missed (metaphor, simile, personification, synecdoche, metonymy, etc.). Include line numbers (1-indexed). Only include genuinely missed instances.
- meterVerdicts: For each meter-violating line number, assess whether the break is intentional (for emphasis, dramatic effect) or accidental. Only include entries for line numbers in the input.
- craftObservations: 3-5 specific craft notes (e.g., "The volta at line 9 effectively pivots from observation to reflection").`;

  const clicheList = clientAnalysis.detectedCliches.length > 0
    ? clientAnalysis.detectedCliches.map(c => `"${c.phrase}" (line ${c.lineNumber}, ${c.severity})`).join('; ')
    : 'None detected';

  const figurativeList = clientAnalysis.figurativeInstances.length > 0
    ? clientAnalysis.figurativeInstances.map(f => `${f.type}: "${f.text}" (line ${f.lineIndex + 1})`).join('; ')
    : 'None detected';

  const meterList = clientAnalysis.meterViolations.length > 0
    ? clientAnalysis.meterViolations.map(m => `Line ${m.lineNumber}: expected ~${m.expected} syllables, got ${m.actual}`).join('; ')
    : 'None';

  const user = `POEM:
${poemText}

CLIENT-SIDE ANALYSIS:
- Detected form: ${clientAnalysis.detectedForm}
- Detected meter: ${clientAnalysis.detectedMeter}
- Rhyme scheme: ${clientAnalysis.rhymeScheme}
- Detected cliches: ${clicheList}
- Figurative language found: ${figurativeList}
- Meter violations: ${meterList}`;

  return { system, user };
}

/**
 * Call Haiku to enrich the analysis. Returns parsed LLMAnalysisResult.
 */
export async function callLLMAnalysis(
  poemText: string,
  clientAnalysis: ClientAnalysisSummary,
  _apiKey?: string,
): Promise<{ result: LLMAnalysisResult; usage: { inputTokens: number; outputTokens: number } }> {
  const apiKey = _apiKey || resolveApiKey();
  if (!apiKey) throw new Error('No API key configured.');

  const { system, user } = buildAnalysisPrompt(poemText, clientAnalysis);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: ANALYSIS_MODEL,
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`LLM Analysis API error (${response.status}): ${errorBody.slice(0, 200)}`);
  }

  const apiResult = await response.json();
  const rawText = apiResult.content?.[0]?.text || '';
  const usage = {
    inputTokens: apiResult.usage?.input_tokens || 0,
    outputTokens: apiResult.usage?.output_tokens || 0,
  };

  // Parse JSON — handle possible markdown code blocks
  const jsonStr = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  let parsed: LLMAnalysisResult;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('Failed to parse LLM analysis response as JSON');
  }

  // Validate and provide defaults for missing fields
  const result: LLMAnalysisResult = {
    enhancedSummary: Array.isArray(parsed.enhancedSummary) ? parsed.enhancedSummary : [],
    clicheVerdicts: parsed.clicheVerdicts && typeof parsed.clicheVerdicts === 'object' ? parsed.clicheVerdicts : {},
    additionalFigurative: Array.isArray(parsed.additionalFigurative) ? parsed.additionalFigurative : [],
    meterVerdicts: parsed.meterVerdicts && typeof parsed.meterVerdicts === 'object' ? parsed.meterVerdicts : {},
    craftObservations: Array.isArray(parsed.craftObservations) ? parsed.craftObservations : [],
  };

  return { result, usage };
}
