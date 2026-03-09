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

export type ExperienceLevel =
  | 'brand_new'      // Just starting to write poetry
  | 'beginner'       // Writing regularly, learning craft basics
  | 'intermediate'   // Understands form, voice, imagery; working on consistency
  | 'experienced'    // Strong craft, working toward publication
  | 'advanced';      // Published, MFA-level or equivalent

export type PoemStage =
  | 'first_draft'    // Getting ideas down
  | 'early_revision' // Shaping structure and voice
  | 'mid_revision'   // Refining imagery, sound, line breaks
  | 'late_revision'  // Polishing, cutting, precision work
  | 'submission';    // Final check before sending out

export interface OnboardingData {
  goals?: string;
  influences?: string;
  favoritPoets?: string;
  workingOn?: string;
  experienceLevel?: ExperienceLevel;
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

export interface TokenUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: (fullResponse: string) => void;
  onError: (error: Error) => void;
  onUsage?: (usage: TokenUsage) => void;
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

// ── Multi-Agent Architecture ──

export type AgentRole =
  | 'reader'        // Primary responder (Sonnet) — emotional response, what moved me
  | 'craftsperson'  // Specialist (Haiku) — prosody, line breaks, sound, meter, form
  | 'questioner'    // Specialist (Haiku) — generative questions, alternative possibilities
  | 'perspective'   // Specialist (Haiku) — reads through a chosen editorial lens
  | 'learning'      // Background (Haiku) — extracts learnings, tracks growth
  | 'synthesizer';  // Final pass (Sonnet) — weaves outputs into one coherent response

export type AgentModel = 'sonnet' | 'haiku';

export interface AgentConfig {
  role: AgentRole;
  model: AgentModel;
  enabled: boolean;
}

/** Result from a single agent run */
export interface AgentResult {
  role: AgentRole;
  content: string;
  model: AgentModel;
  durationMs: number;
}

/** Structured multi-agent response sections */
export interface MultiAgentResponse {
  /** Main feedback from Reader (always present) */
  mainFeedback: string;
  /** Craft-level observations from Craftsperson (optional) */
  craftNotes?: string;
  /** Generative questions from Questioner (optional) */
  questions?: string;
  /** Perspective-specific reading (optional) */
  perspectiveNotes?: string;
  /** The perspective name used, if any */
  perspectiveName?: string;
}

// ── Editorial Perspectives ──

export type EditorialPerspective =
  | 'none'           // No perspective agent (balanced default)
  | 'formalist'      // Structure, meter, rhyme scheme, form constraints
  | 'imagist'        // Precision of image, compression, sensory detail
  | 'lyricist'       // Musicality, sound patterns, vowel play, rhythm
  | 'narrativist'    // Story, persona, dramatic arc, voice consistency
  | 'experimentalist' // Pushing boundaries, fragmentation, white space
  | 'intimate';      // Emotional truth, vulnerability, specificity of feeling

export type HarshnessLevel = 'encouraging' | 'balanced' | 'direct';

export interface EditorSettings {
  perspective: EditorialPerspective;
  harshness: HarshnessLevel;
}

// ── Memory System ──

/** A single learning extracted from a conversation */
export interface EditorLearningRecord {
  id: string;
  userId: string;
  insight: string;
  source: 'conversation' | 'onboarding' | 'manual';
  poemId?: string;
  conversationId?: string;
  createdAt: string;
  active: boolean; // false = compacted into summary
}

/** Summary of a single editor session */
export interface EditorSessionRecord {
  id: string;
  userId: string;
  conversationId: string;
  poemId?: string;
  poemTitle?: string;
  mode: ConversationMode;
  summary: string;
  feedbackGiven: string[]; // key topics covered
  poetEngagement: string[]; // what the poet responded to
  draftStage?: PoemStage;
  createdAt: string;
}

/** Cross-poem patterns detected over time */
export interface EditorPatternRecord {
  id: string;
  userId: string;
  category: 'strength' | 'habit' | 'theme' | 'growth_area';
  description: string;
  examples: string[]; // poem titles / specific lines
  confidence: number; // 0-1, increases with repeated observation
  updatedAt: string;
}
