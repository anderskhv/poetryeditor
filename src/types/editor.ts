/**
 * AI Editor Types
 *
 * TypeScript interfaces for the Socratic poetry coaching feature.
 */

// ── Poet Profile ──

export interface PoetLearning {
  insight: string;
  date: string; // ISO date
  source: 'conversation' | 'onboarding' | 'manual';
}

export interface PoetPatterns {
  stylePreferences: string[];
  tendencies: string[];
  themes: string[];
}

export interface FeedbackStyle {
  directness: 'gentle' | 'balanced' | 'direct';
  tone: 'encouraging' | 'neutral' | 'challenging';
}

export interface OnboardingData {
  goals?: string;
  influences?: string;
  favoritPoets?: string;
  workingOn?: string;
  additionalContext?: string;
}

export interface PoetProfile {
  id: string;
  userId: string;
  onboardingCompleted: boolean;
  onboardingData: OnboardingData;
  learnings: PoetLearning[];
  patterns: PoetPatterns;
  feedbackStyle: FeedbackStyle;
  summary: string; // LLM-generated compact summary, included in every prompt
  createdAt: string;
  updatedAt: string;
  lastInteractionAt: string;
}

// ── Conversations ──

export type ConversationMode = 'per_poem' | 'collection';

export interface EditorConversation {
  id: string;
  userId: string;
  poemId: string | null;
  collectionId: string | null;
  mode: ConversationMode;
  title: string;
  createdAt: string;
  updatedAt: string;
}

// ── Conversation Summaries (for cross-poem awareness) ──

export interface ConversationSummary {
  poemId: string;
  poemTitle: string;
  summary: string;
  messageCount: number;
  updatedAt: string;
}

export type MessageRole = 'user' | 'assistant';

export interface EditorMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

// ── Editorial Letters (Phase 2, schema defined now) ──

export interface PerPoemNote {
  poemId: string;
  poemTitle: string;
  notes: string;
  priority: 'high' | 'medium' | 'low';
}

export interface EditorialTodoItem {
  text: string;
  poemId?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface EditorialLetter {
  id: string;
  userId: string;
  collectionId: string;
  versionNumber: number;
  summary: string;
  perPoemNotes: PerPoemNote[];
  todoList: EditorialTodoItem[];
  debateRounds: number;
  generatedAt: string;
  customNotes: string;
}

// ── Chat UI State ──

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  isStreaming?: boolean;
}

export interface EditorChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
}

// ── API ──

export interface EditorApiConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: (fullResponse: string) => void;
  onError: (error: Error) => void;
}

// ── Analysis context passed to the editor ──

export interface AnalysisContext {
  form: string;
  meter: string;
  rhymeScheme: string;
  clicheCount: number;
  abstractConcreteRatio: string;
  summaryItems: string[];
}
