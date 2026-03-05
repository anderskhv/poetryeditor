/**
 * usePoetProfile — manages the poet's profile (onboarding, learnings, memory).
 *
 * Uses Supabase for authenticated users, localStorage fallback for guests.
 */

import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type {
  PoetProfile,
  FeedbackStyle,
  OnboardingData,
  PoetLearning,
} from '../types/editor';
import {
  getLocalProfile,
  saveLocalProfile,
  updateLocalOnboarding,
  updateLocalFeedbackStyle,
  appendLocalLearning,
  updateLocalSummary,
} from '../utils/editorStorage';

// Default profile shape
function defaultProfile(userId: string): PoetProfile {
  return {
    id: '',
    userId,
    onboardingCompleted: false,
    onboardingData: {},
    learnings: [],
    patterns: { stylePreferences: [], tendencies: [], themes: [] },
    feedbackStyle: { directness: 'balanced', tone: 'encouraging' },
    summary: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastInteractionAt: new Date().toISOString(),
  };
}

// Convert snake_case DB row to camelCase PoetProfile
function rowToProfile(row: Record<string, unknown>): PoetProfile {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    onboardingCompleted: row.onboarding_completed as boolean,
    onboardingData: (row.onboarding_data || {}) as OnboardingData,
    learnings: (row.learnings || []) as PoetLearning[],
    patterns: (row.patterns || { stylePreferences: [], tendencies: [], themes: [] }) as PoetProfile['patterns'],
    feedbackStyle: (row.feedback_style || { directness: 'balanced', tone: 'encouraging' }) as FeedbackStyle,
    summary: (row.summary || '') as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    lastInteractionAt: row.last_interaction_at as string,
  };
}

export function usePoetProfile(user: User | null) {
  const [profile, setProfile] = useState<PoetProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile on mount or user change
  useEffect(() => {
    if (!user) {
      // Guest: use localStorage
      setProfile(getLocalProfile());
      setLoading(false);
      return;
    }

    // Authenticated: load from Supabase
    let cancelled = false;

    async function loadProfile() {
      if (!supabase || !user) {
        setProfile(getLocalProfile());
        setLoading(false);
        return;
      }

      const userId = user.id;

      try {
        const { data, error } = await supabase
          .from('editor_poet_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (cancelled) return;

        if (error && error.code === 'PGRST116') {
          // No profile yet — create one
          const { data: newRow, error: insertError } = await supabase
            .from('editor_poet_profiles')
            .insert({ user_id: userId })
            .select()
            .single();

          if (cancelled) return;

          if (insertError) {
            console.error('Failed to create poet profile:', insertError);
            setProfile(defaultProfile(userId));
          } else {
            setProfile(rowToProfile(newRow));
          }
        } else if (error) {
          console.error('Failed to load poet profile:', error);
          setProfile(defaultProfile(userId));
        } else {
          setProfile(rowToProfile(data));
        }
      } catch (err) {
        console.error('Profile load error:', err);
        if (!cancelled) setProfile(defaultProfile(userId));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => { cancelled = true; };
  }, [user]);

  // ── Update helpers ──

  const updateProfile = useCallback(async (updates: Partial<PoetProfile>) => {
    if (!user || !supabase) {
      // Guest
      const updated = saveLocalProfile(updates);
      setProfile(updated);
      return;
    }

    // Supabase: convert to snake_case
    const dbUpdates: Record<string, unknown> = {};
    if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;
    if (updates.onboardingData !== undefined) dbUpdates.onboarding_data = updates.onboardingData;
    if (updates.learnings !== undefined) dbUpdates.learnings = updates.learnings;
    if (updates.patterns !== undefined) dbUpdates.patterns = updates.patterns;
    if (updates.feedbackStyle !== undefined) dbUpdates.feedback_style = updates.feedbackStyle;
    if (updates.summary !== undefined) dbUpdates.summary = updates.summary;
    if (updates.lastInteractionAt !== undefined) dbUpdates.last_interaction_at = updates.lastInteractionAt;

    const { error } = await supabase
      .from('editor_poet_profiles')
      .update(dbUpdates)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update profile:', error);
    }

    setProfile(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : prev);
  }, [user]);

  const completeOnboarding = useCallback(async (data: OnboardingData, feedbackStyle: FeedbackStyle) => {
    if (!user || !supabase) {
      const updated = updateLocalOnboarding(data, true);
      const final = updateLocalFeedbackStyle(feedbackStyle);
      setProfile(final);
      return;
    }

    await updateProfile({
      onboardingData: data,
      onboardingCompleted: true,
      feedbackStyle,
    });
  }, [user, updateProfile]);

  const addLearning = useCallback(async (insight: string, source: PoetLearning['source'] = 'conversation') => {
    const learning: PoetLearning = {
      insight,
      date: new Date().toISOString(),
      source,
    };

    if (!user || !supabase) {
      const updated = appendLocalLearning(learning);
      setProfile(updated);
      return;
    }

    const db = supabase;
    const userId = user.id;

    // Append to existing array
    setProfile(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        learnings: [...prev.learnings, learning],
        lastInteractionAt: new Date().toISOString(),
      };
      // Fire Supabase update
      db
        .from('editor_poet_profiles')
        .update({
          learnings: updated.learnings,
          last_interaction_at: updated.lastInteractionAt,
        })
        .eq('user_id', userId)
        .then(({ error }) => {
          if (error) console.error('Failed to save learning:', error);
        });
      return updated;
    });
  }, [user]);

  const updateSummary = useCallback(async (summary: string) => {
    if (!user || !supabase) {
      const updated = updateLocalSummary(summary);
      setProfile(updated);
      return;
    }

    await updateProfile({ summary });
  }, [user, updateProfile]);

  return {
    profile,
    loading,
    updateProfile,
    completeOnboarding,
    addLearning,
    updateSummary,
  };
}
