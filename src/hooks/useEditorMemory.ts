/**
 * useEditorMemory — manages the 3-layer memory system for the AI editor.
 *
 * Layer 1: Active Learnings — specific insights extracted from conversations
 * Layer 2: Session Summaries — compact summaries of each conversation
 * Layer 3: Cross-Poem Patterns — recurring strengths, habits, themes
 *
 * For authenticated users: Supabase persistence
 * For guests: localStorage persistence
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { EditorSettings, HarshnessLevel, EditorialPerspective } from '../types/editor';
import { runLearningExtractor, runSessionSummary } from '../utils/editorAgents';

// ── localStorage keys ──

const SETTINGS_KEY = 'editor:settings';
const LEARNINGS_KEY = 'editor:memory:learnings';
const SESSION_SUMMARIES_KEY = 'editor:memory:sessions';

// ── Default settings ──

function defaultSettings(): EditorSettings {
  return {
    perspective: 'none',
    harshness: 'encouraging',
  };
}

// ── Hook ──

export function useEditorMemory(user: User | null) {
  const [settings, setSettingsState] = useState<EditorSettings>(defaultSettings);
  const [learnings, setLearnings] = useState<string[]>([]);
  const [sessionSummaries, setSessionSummaries] = useState<Array<{
    poemTitle: string;
    summary: string;
    createdAt: string;
  }>>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const extractionInFlight = useRef(false);

  // ── Load on mount ──

  useEffect(() => {
    loadMemory();
  }, [user]);

  async function loadMemory() {
    if (user && supabase) {
      // Load from Supabase
      const [settingsResult, learningsResult, sessionsResult] = await Promise.all([
        supabase.from('editor_settings').select('*').eq('user_id', user.id).single(),
        supabase.from('editor_learnings').select('insight').eq('user_id', user.id).eq('active', true).order('created_at', { ascending: false }).limit(50),
        supabase.from('editor_sessions').select('poem_title, summary, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ]);

      if (settingsResult.data) {
        setSettingsState({
          perspective: settingsResult.data.perspective as EditorialPerspective,
          harshness: settingsResult.data.harshness as HarshnessLevel,
        });
      }

      if (learningsResult.data) {
        setLearnings(learningsResult.data.map(l => l.insight));
      }

      if (sessionsResult.data) {
        setSessionSummaries(sessionsResult.data.map(s => ({
          poemTitle: s.poem_title || '',
          summary: s.summary,
          createdAt: s.created_at,
        })));
      }
    } else {
      // Load from localStorage
      try {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
          setSettingsState({ ...defaultSettings(), ...JSON.parse(savedSettings) });
        }

        const savedLearnings = localStorage.getItem(LEARNINGS_KEY);
        if (savedLearnings) {
          setLearnings(JSON.parse(savedLearnings));
        }

        const savedSessions = localStorage.getItem(SESSION_SUMMARIES_KEY);
        if (savedSessions) {
          setSessionSummaries(JSON.parse(savedSessions));
        }
      } catch {
        // Corrupted localStorage, use defaults
      }
    }
    setIsLoaded(true);
  }

  // ── Settings ──

  const updateSettings = useCallback(async (updates: Partial<EditorSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettingsState(newSettings);

    if (user && supabase) {
      await supabase.from('editor_settings').upsert({
        user_id: user.id,
        perspective: newSettings.perspective,
        harshness: newSettings.harshness,
        updated_at: new Date().toISOString(),
      });
    } else {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    }
  }, [user, settings]);

  // ── Learning Extraction (called after each assistant response) ──

  const extractAndSaveLearnings = useCallback(async (
    recentMessages: Array<{ role: string; content: string }>,
    poemId?: string,
    conversationId?: string,
  ) => {
    // Prevent concurrent extractions
    if (extractionInFlight.current) return;
    extractionInFlight.current = true;

    try {
      const newLearnings = await runLearningExtractor(recentMessages, learnings);

      if (newLearnings.length > 0) {
        const insights = newLearnings.map(l => l.insight);
        const updated = [...insights, ...learnings].slice(0, 50); // Keep max 50 active
        setLearnings(updated);

        if (user && supabase) {
          // Batch insert into Supabase
          const rows = newLearnings.map(l => ({
            user_id: user.id,
            insight: l.insight,
            source: 'conversation' as const,
            poem_id: poemId,
            conversation_id: conversationId,
            active: true,
          }));
          await supabase.from('editor_learnings').insert(rows);
        } else {
          localStorage.setItem(LEARNINGS_KEY, JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.error('Learning extraction failed:', err);
    } finally {
      extractionInFlight.current = false;
    }
  }, [user, learnings]);

  // ── Session Summary (called when conversation ends or on threshold) ──

  const saveSessionSummary = useCallback(async (
    messages: Array<{ role: string; content: string }>,
    poemTitle: string,
    poemId?: string,
    conversationId?: string,
    mode: 'per_poem' | 'collection' = 'per_poem',
  ) => {
    try {
      const summary = await runSessionSummary(messages, poemTitle);
      if (!summary) return;

      const record = {
        poemTitle,
        summary,
        createdAt: new Date().toISOString(),
      };

      setSessionSummaries(prev => [record, ...prev].slice(0, 20));

      if (user && supabase) {
        await supabase.from('editor_sessions').insert({
          user_id: user.id,
          conversation_id: conversationId,
          poem_id: poemId,
          poem_title: poemTitle,
          mode,
          summary,
          feedback_given: [],
          poet_engagement: [],
        });
      } else {
        const updated = [record, ...sessionSummaries].slice(0, 20);
        localStorage.setItem(SESSION_SUMMARIES_KEY, JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Session summary failed:', err);
    }
  }, [user, sessionSummaries]);

  // ── Build memory context for system prompt injection ──

  const getMemoryContext = useCallback((): string => {
    const parts: string[] = [];

    if (learnings.length > 0) {
      const recentLearnings = learnings.slice(0, 15); // Most recent 15
      parts.push(`WHAT I KNOW ABOUT THIS POET (from previous conversations):\n${recentLearnings.map(l => `- ${l}`).join('\n')}`);
    }

    if (sessionSummaries.length > 0) {
      const recentSessions = sessionSummaries.slice(0, 5); // Last 5 sessions
      parts.push(`RECENT SESSIONS:\n${recentSessions.map(s => `- "${s.poemTitle}": ${s.summary}`).join('\n')}`);
    }

    return parts.length > 0 ? '\n' + parts.join('\n\n') + '\n' : '';
  }, [learnings, sessionSummaries]);

  return {
    settings,
    updateSettings,
    learnings,
    sessionSummaries,
    extractAndSaveLearnings,
    saveSessionSummary,
    getMemoryContext,
    isLoaded,
  };
}
