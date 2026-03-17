/**
 * useLLMAnalysis — auto-triggers Haiku enrichment for registered users.
 *
 * Debounces 3 seconds after last poem text change, caches by poem hash,
 * respects budget gating via usageTracking.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { LLMAnalysisResult, LLMAnalysisState } from '../types/editor';
import { callLLMAnalysis, type ClientAnalysisSummary } from '../utils/llmAnalysis';
import { checkBudget, recordUsage } from '../utils/usageTracking';

const DEBOUNCE_MS = 3000;
const ANALYSIS_MODEL = 'claude-haiku-4-5-20251001';

/** Simple string hash for cache keying */
function hashPoemText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return String(hash);
}

interface UseLLMAnalysisOptions {
  user: User | null;
  supabase: SupabaseClient | null;
  poemText: string;
  clientAnalysis: ClientAnalysisSummary | null;
}

export function useLLMAnalysis({
  user,
  supabase,
  poemText,
  clientAnalysis,
}: UseLLMAnalysisOptions): LLMAnalysisState {
  const [result, setResult] = useState<LLMAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poemHash, setPoemHash] = useState<string | null>(null);

  // Cache: hash -> result
  const cacheRef = useRef<Map<string, LLMAnalysisResult>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runAnalysis = useCallback(async (text: string, analysis: ClientAnalysisSummary) => {
    // Only for registered users
    if (!user) return;

    const hash = hashPoemText(text);

    // Check cache
    const cached = cacheRef.current.get(hash);
    if (cached) {
      setResult(cached);
      setPoemHash(hash);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Check budget
    try {
      const budget = await checkBudget(user, supabase);
      if (!budget.canSend) {
        setError(null); // Don't show error for budget — just skip silently
        setIsLoading(false);
        return;
      }
    } catch {
      setIsLoading(false);
      return;
    }

    // Abort any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const { result: llmResult, usage } = await callLLMAnalysis(text, analysis);

      // Check if aborted
      if (controller.signal.aborted) return;

      // Record usage
      await recordUsage(user, supabase, ANALYSIS_MODEL, usage.inputTokens, usage.outputTokens);

      // Cache and set
      cacheRef.current.set(hash, llmResult);
      setResult(llmResult);
      setPoemHash(hash);
      setError(null);
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error('LLM analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [user, supabase]);

  // Debounce trigger on text/analysis changes
  useEffect(() => {
    // Don't run for guests
    if (!user) {
      setResult(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Need minimum text and analysis data
    const trimmed = poemText.trim();
    if (trimmed.length < 20 || !clientAnalysis) {
      setResult(null);
      setIsLoading(false);
      return;
    }

    // Check if hash changed
    const newHash = hashPoemText(trimmed);
    if (newHash === poemHash && result !== null) {
      return; // Same poem, already have result
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      runAnalysis(trimmed, clientAnalysis);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [user, poemText, clientAnalysis, poemHash, result, runAnalysis]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { result, isLoading, error, poemHash };
}
