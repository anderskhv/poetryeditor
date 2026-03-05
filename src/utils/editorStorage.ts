/**
 * Editor Storage — localStorage fallback for unauthenticated users.
 *
 * Authenticated users get Supabase persistence (via usePoetProfile / useEditorChat).
 * This module provides the same interface using localStorage for guests.
 */

import type {
  PoetProfile,
  EditorConversation,
  ChatMessage,
  FeedbackStyle,
  OnboardingData,
  PoetLearning,
  ConversationSummary,
} from '../types/editor';

const PROFILE_KEY = 'editor:profile';
const CONV_PREFIX = 'editor:conv:';
const CONV_INDEX_KEY = 'editor:conversations';
const CONV_SUMMARY_PREFIX = 'editor:conv-summary:';

// ── Default profile ──

function defaultProfile(): PoetProfile {
  return {
    id: 'local',
    userId: 'local',
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

// ── Profile ──

export function getLocalProfile(): PoetProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return { ...defaultProfile(), ...JSON.parse(raw) };
  } catch {
    // corrupted — reset
  }
  return defaultProfile();
}

export function saveLocalProfile(profile: Partial<PoetProfile>): PoetProfile {
  const current = getLocalProfile();
  const updated = {
    ...current,
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
  return updated;
}

export function updateLocalOnboarding(data: OnboardingData, completed: boolean): PoetProfile {
  return saveLocalProfile({
    onboardingData: data,
    onboardingCompleted: completed,
  });
}

export function updateLocalFeedbackStyle(style: FeedbackStyle): PoetProfile {
  return saveLocalProfile({ feedbackStyle: style });
}

export function appendLocalLearning(learning: PoetLearning): PoetProfile {
  const current = getLocalProfile();
  return saveLocalProfile({
    learnings: [...current.learnings, learning],
    lastInteractionAt: new Date().toISOString(),
  });
}

export function updateLocalSummary(summary: string): PoetProfile {
  return saveLocalProfile({ summary });
}

// ── Conversations ──

function getConversationIndex(): EditorConversation[] {
  try {
    const raw = localStorage.getItem(CONV_INDEX_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted
  }
  return [];
}

function saveConversationIndex(convs: EditorConversation[]): void {
  localStorage.setItem(CONV_INDEX_KEY, JSON.stringify(convs));
}

export function getLocalConversations(poemId?: string): EditorConversation[] {
  const all = getConversationIndex();
  if (poemId) return all.filter(c => c.poemId === poemId);
  return all;
}

export function createLocalConversation(
  poemId: string | null,
  collectionId: string | null,
  title: string,
): EditorConversation {
  const conv: EditorConversation = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: 'local',
    poemId,
    collectionId,
    mode: poemId ? 'per_poem' : 'collection',
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const index = getConversationIndex();
  index.unshift(conv);
  saveConversationIndex(index);
  return conv;
}

export function deleteLocalConversation(conversationId: string): void {
  const index = getConversationIndex().filter(c => c.id !== conversationId);
  saveConversationIndex(index);
  localStorage.removeItem(CONV_PREFIX + conversationId);
}

// ── Messages ──

export function getLocalMessages(conversationId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CONV_PREFIX + conversationId);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted
  }
  return [];
}

export function saveLocalMessages(conversationId: string, messages: ChatMessage[]): void {
  localStorage.setItem(CONV_PREFIX + conversationId, JSON.stringify(messages));
  // Update conversation timestamp in index
  const index = getConversationIndex();
  const conv = index.find(c => c.id === conversationId);
  if (conv) {
    conv.updatedAt = new Date().toISOString();
    saveConversationIndex(index);
  }
}

export function appendLocalMessage(conversationId: string, message: ChatMessage): void {
  const messages = getLocalMessages(conversationId);
  messages.push(message);
  saveLocalMessages(conversationId, messages);
}

// ── Conversation Summaries ──

export function saveConversationSummary(
  poemId: string,
  poemTitle: string,
  summary: string,
  messageCount: number,
): ConversationSummary {
  const convSummary: ConversationSummary = {
    poemId,
    poemTitle,
    summary,
    messageCount,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(CONV_SUMMARY_PREFIX + poemId, JSON.stringify(convSummary));
  return convSummary;
}

export function getConversationSummary(poemId: string): ConversationSummary | null {
  try {
    const raw = localStorage.getItem(CONV_SUMMARY_PREFIX + poemId);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted
  }
  return null;
}

export function getAllConversationSummaries(excludePoemId?: string): ConversationSummary[] {
  const summaries: ConversationSummary[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CONV_SUMMARY_PREFIX)) {
      const poemId = key.slice(CONV_SUMMARY_PREFIX.length);
      if (excludePoemId && poemId === excludePoemId) continue;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          summaries.push(JSON.parse(raw));
        }
      } catch {
        // skip corrupted
      }
    }
  }
  return summaries;
}

// ── API Key storage ──

const API_KEY_STORAGE = 'editor:apiKey';

export function getLocalApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE);
}

export function saveLocalApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function clearLocalApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE);
}
