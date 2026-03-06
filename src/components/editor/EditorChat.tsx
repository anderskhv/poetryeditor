/**
 * EditorChat — main chat panel for the AI poetry editor.
 *
 * Renders in the right sidebar. Handles:
 * - Philosophy card (shown once before first coaching)
 * - Guest quick onboarding (2 questions: directness + tone)
 * - Registered user full onboarding (via EditorOnboarding)
 * - Chat messages with streaming
 * - Input area with send/cancel
 * - API key configuration
 * - Learning extraction trigger
 * - Usage cap modal
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import type { PoetProfile, AnalysisContext, FeedbackStyle } from '../../types/editor';
import { useEditorChat } from '../../hooks/useEditorChat';
import { EditorOnboarding } from './EditorOnboarding';
import { EditorMessage } from './EditorMessage';
import { hasApiKey } from '../../utils/editorApi';
import { UsageCapModal } from './UsageCapModal';
import { saveLocalApiKey, getLocalApiKey, clearLocalApiKey } from '../../utils/editorStorage';
import {
  extractLearnings,
  regenerateSummary,
  extractConversationSummary,
} from '../../utils/editorApi';
import {
  buildLearningExtractionPrompt,
  buildSummaryPrompt,
  buildConversationSummaryPrompt,
} from '../../utils/editorPrompts';
import { saveConversationSummary } from '../../utils/editorStorage';
import './EditorChat.css';

interface CollectionPoemData {
  title: string;
  content: string;
  sectionName: string | null;
}

interface EditorChatProps {
  user: User | null;
  profile: PoetProfile | null;
  poemId: string | null;
  poemTitle: string;
  poemText: string;
  collectionPoems?: CollectionPoemData[];
  collectionName?: string;
  analysis?: AnalysisContext;
  mode?: 'per_poem' | 'collection';
  conversationSummaries?: Array<{ poemTitle: string; summary: string }>;
  onCompleteOnboarding: (data: import('../../types/editor').OnboardingData, style: import('../../types/editor').FeedbackStyle) => void;
  onAddLearning: (insight: string) => void;
  onUpdateSummary: (summary: string) => void;
  onSwitchToCollection?: () => void;
  onSwitchToPoem?: () => void;
}

// Guest quick setup states
type GuestSetupStep = 'philosophy' | 'directness' | 'tone' | 'done';

export function EditorChat({
  user,
  profile,
  poemId,
  poemTitle,
  poemText,
  collectionPoems,
  collectionName,
  analysis,
  mode = 'per_poem',
  conversationSummaries,
  onCompleteOnboarding,
  onAddLearning,
  onUpdateSummary,
  onSwitchToCollection,
  onSwitchToPoem,
}: EditorChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showCapModal, setShowCapModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastExtractionCount = useRef(0);

  // Guest quick setup state
  const [guestSetupStep, setGuestSetupStep] = useState<GuestSetupStep>(() => {
    if (sessionStorage.getItem('editor:guest-setup-done') === 'true') return 'done';
    return 'philosophy';
  });
  const [guestFeedbackStyle, setGuestFeedbackStyle] = useState<FeedbackStyle>(() => {
    try {
      const stored = sessionStorage.getItem('editor:guest-feedback-style');
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return { directness: 'balanced', tone: 'encouraging' };
  });

  // Determine the effective profile for guests
  // Guests get a minimal "profile" so useEditorChat can work
  const effectiveProfile = useMemo((): PoetProfile | null => {
    if (profile) return profile;
    // Guest with no profile — create a minimal one if they've completed quick setup
    if (!user && guestSetupStep === 'done') {
      return {
        id: 'guest',
        userId: 'guest',
        onboardingCompleted: true,
        onboardingData: { experienceLevel: 'beginner' },
        learnings: [],
        patterns: { stylePreferences: [], tendencies: [], themes: [] },
        feedbackStyle: guestFeedbackStyle,
        summary: 'Guest user. Be encouraging and explain craft concepts clearly.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastInteractionAt: new Date().toISOString(),
      };
    }
    return null;
  }, [profile, user, guestSetupStep, guestFeedbackStyle]);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    cancelStreaming,
    clearConversation,
    getMessageCount,
    budgetStatus,
  } = useEditorChat({
    user,
    profile: effectiveProfile,
    poemId,
    poemTitle,
    poemText,
    analysis,
    collectionPoems,
    collectionName,
    mode,
    conversationSummaries,
  });

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Focus input when not loading
  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  // Trigger learning extraction after every ~5 new messages
  useEffect(() => {
    if (!effectiveProfile || isLoading) return;

    const currentCount = getMessageCount();
    if (currentCount - lastExtractionCount.current >= 6 && currentCount > 0) {
      lastExtractionCount.current = currentCount;
      triggerLearningExtraction();
    }
  }, [messages, isLoading]);

  const triggerLearningExtraction = useCallback(async () => {
    if (!effectiveProfile || !user) return; // Only extract learnings for registered users

    // Get last 6 messages for extraction
    const recentMsgs = messages.slice(-6).map(m => ({
      role: m.role,
      content: m.content,
    }));

    if (recentMsgs.length < 2) return;

    // Extract learnings for per-poem mode
    const extractionPrompt = buildLearningExtractionPrompt(
      effectiveProfile.summary,
      recentMsgs,
    );

    const newLearnings = await extractLearnings(extractionPrompt);

    for (const learning of newLearnings) {
      onAddLearning(learning.insight);
    }

    // Extract conversation summary for per-poem mode
    if (mode === 'per_poem' && poemId) {
      const summaryPrompt = buildConversationSummaryPrompt(recentMsgs, poemTitle);
      const summary = await extractConversationSummary(summaryPrompt);
      if (summary) {
        saveConversationSummary(poemId, poemTitle, summary, messages.length);
      }
    }

    // Regenerate summary if learnings have accumulated
    const totalLearnings = effectiveProfile.learnings.length + newLearnings.length;
    if (totalLearnings > 0 && totalLearnings % 10 === 0) {
      const summaryPrompt = buildSummaryPrompt(
        effectiveProfile.onboardingData,
        [...effectiveProfile.learnings, ...newLearnings.map(l => ({
          insight: l.insight,
          date: new Date().toISOString(),
          source: 'conversation' as const,
        }))],
      );
      const newSummary = await regenerateSummary(summaryPrompt);
      if (newSummary) {
        onUpdateSummary(newSummary);
      }
    }
  }, [effectiveProfile, user, messages, onAddLearning, onUpdateSummary, mode, poemId, poemTitle]);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    setInputValue('');
    const result = await sendMessage(trimmed);
    if (result === 'cap_exceeded') {
      setInputValue(trimmed); // Restore input so user doesn't lose their message
      setShowCapModal(true);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleSaveApiKey() {
    const trimmed = apiKeyInput.trim();
    if (trimmed) {
      saveLocalApiKey(trimmed);
      setApiKeyInput('');
      setShowSettings(false);
    }
  }

  function handleClearApiKey() {
    clearLocalApiKey();
    setApiKeyInput('');
  }

  // Guest quick setup handlers
  function handleGuestDirectness(value: FeedbackStyle['directness']) {
    setGuestFeedbackStyle(prev => ({ ...prev, directness: value }));
    setGuestSetupStep('tone');
  }

  function handleGuestTone(value: FeedbackStyle['tone']) {
    const finalStyle = { ...guestFeedbackStyle, tone: value };
    setGuestFeedbackStyle(finalStyle);
    setGuestSetupStep('done');
    sessionStorage.setItem('editor:guest-setup-done', 'true');
    sessionStorage.setItem('editor:guest-feedback-style', JSON.stringify(finalStyle));
  }

  const hasKey = useMemo(() => hasApiKey(), [showSettings, apiKeyInput]);

  // ── Render ──

  // Settings panel
  if (showSettings) {
    const existingKey = getLocalApiKey();
    return (
      <div className="editor-chat">
        <div className="editor-chat-header">
          <span className="editor-chat-title">Editor Settings</span>
          <button className="editor-header-btn" onClick={() => setShowSettings(false)} title="Back to chat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="editor-settings">
          <div className="editor-settings-section">
            <label className="editor-settings-label">Anthropic API Key</label>
            <p className="editor-settings-hint">
              {existingKey ? 'Key configured. Enter a new one to replace it.' : 'Add your own key to bypass usage limits. Get one at console.anthropic.com.'}
            </p>
            <div className="editor-api-key-row">
              <input
                type="password"
                className="editor-api-key-input"
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder={existingKey ? 'sk-ant-...  (replace existing)' : 'sk-ant-...'}
              />
              <button className="editor-option-btn" onClick={handleSaveApiKey} disabled={!apiKeyInput.trim()}>
                Save
              </button>
            </div>
            {existingKey && (
              <button className="editor-text-btn editor-danger-btn" onClick={handleClearApiKey}>
                Remove stored key
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Registered user onboarding (full 7-question flow)
  if (user && profile && !profile.onboardingCompleted) {
    return (
      <div className="editor-chat">
        <div className="editor-chat-header">
          <span className="editor-chat-title">Editor</span>
        </div>
        <EditorOnboarding onComplete={onCompleteOnboarding} />
      </div>
    );
  }

  // No API key at all (neither env var nor user key) — only show for logged-in users
  // Guests with the shared env key skip this entirely
  if (!hasKey && user) {
    return (
      <div className="editor-chat">
        <div className="editor-chat-header">
          <span className="editor-chat-title">Editor</span>
          <button className="editor-header-btn" onClick={() => setShowSettings(true)} title="Settings">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" /><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.73 12.73l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
        </div>
        <div className="editor-empty-state">
          <p>To start using the editor, add your Anthropic API key.</p>
          <button className="editor-option-btn" onClick={() => setShowSettings(true)}>
            Add API Key
          </button>
        </div>
      </div>
    );
  }

  // No API key and guest — editor unavailable in this environment
  if (!hasKey && !user) {
    return (
      <div className="editor-chat">
        <div className="editor-chat-header">
          <span className="editor-chat-title">Editor</span>
        </div>
        <div className="editor-empty-state">
          <p>The AI editor is currently unavailable. Sign in or try again later.</p>
        </div>
      </div>
    );
  }

  // Guest quick setup: philosophy card
  if (!user && guestSetupStep === 'philosophy') {
    return (
      <div className="editor-chat">
        <div className="editor-chat-header">
          <span className="editor-chat-title">Before we begin</span>
        </div>
        <div className="editor-philosophy-card">
          <p>
            I'll be reading your poems with you — not to tell you what to write, but to help you see what you're already doing.
          </p>
          <p>
            I'm an AI, which means I can spot patterns, question choices, and suggest alternatives — but I sometimes miss context, misread intentional rule-breaking, or project confidence where a human editor would hedge. You are the best custodian of your own work.
          </p>
          <p>
            For deeper editorial work — manuscript feedback, publication strategy, the kind of reading that requires a human sensibility — we'll connect you with professional editors in the future.
          </p>
          <button
            className="editor-option-btn editor-philosophy-btn"
            onClick={() => setGuestSetupStep('directness')}
          >
            Got it — let's go
          </button>
        </div>
      </div>
    );
  }

  // Guest quick setup: directness
  if (!user && guestSetupStep === 'directness') {
    return (
      <div className="editor-chat">
        <div className="editor-chat-header">
          <span className="editor-chat-title">Quick setup</span>
        </div>
        <div className="editor-guest-setup">
          <p className="editor-guest-setup-question">How direct should I be with feedback?</p>
          <div className="editor-button-group">
            <button className="editor-option-btn" onClick={() => handleGuestDirectness('gentle')}>Gentle</button>
            <button className="editor-option-btn" onClick={() => handleGuestDirectness('balanced')}>Balanced</button>
            <button className="editor-option-btn" onClick={() => handleGuestDirectness('direct')}>Direct</button>
          </div>
        </div>
      </div>
    );
  }

  // Guest quick setup: tone
  if (!user && guestSetupStep === 'tone') {
    return (
      <div className="editor-chat">
        <div className="editor-chat-header">
          <span className="editor-chat-title">Quick setup</span>
        </div>
        <div className="editor-guest-setup">
          <p className="editor-guest-setup-question">What tone works best for you?</p>
          <div className="editor-button-group">
            <button className="editor-option-btn" onClick={() => handleGuestTone('encouraging')}>Encouraging</button>
            <button className="editor-option-btn" onClick={() => handleGuestTone('neutral')}>Neutral</button>
            <button className="editor-option-btn" onClick={() => handleGuestTone('challenging')}>Challenging</button>
          </div>
        </div>
      </div>
    );
  }

  // Main chat
  return (
    <div className="editor-chat">
      <div className="editor-chat-header">
        <span className="editor-chat-title">
          {mode === 'collection' ? (collectionName || 'Collection Review') : 'Editor'}
        </span>
        <div className="editor-header-actions">
          {mode === 'collection' && onSwitchToPoem && (
            <button className="editor-header-btn" onClick={onSwitchToPoem} title="Back to poem">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <button className="editor-header-btn" onClick={clearConversation} title="New conversation">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button className="editor-header-btn" onClick={() => setShowSettings(true)} title="Settings">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" /><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.73 12.73l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
        </div>
      </div>

      <div className="editor-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="editor-empty-state">
            {mode === 'collection' ? (
              <>
                <p>I can see your full collection '{collectionName}' ({collectionPoems?.length || 0} poems). Ask me about the arc, ordering, themes, or request an editorial letter.</p>
                <p className="editor-empty-hint">Try: "Write me an editorial letter about this collection"</p>
              </>
            ) : (
              <>
                <p>I can see your poem{collectionPoems && collectionPoems.length > 1 ? ` and your full collection (${collectionPoems.length} poems)` : ''}. Ask me anything — about a specific line, how it connects to other poems, or where to take it next.</p>
                {onSwitchToCollection && collectionPoems && collectionPoems.length > 1 && (
                  <button className="editor-collection-link" onClick={onSwitchToCollection}>
                    Review full collection
                  </button>
                )}
              </>
            )}
          </div>
        )}
        {messages.map(msg => (
          <EditorMessage key={msg.id} message={msg} />
        ))}
        {error && (
          <div className="editor-error">
            {error}
          </div>
        )}
      </div>

      <div className="editor-input-area">
        <form onSubmit={handleSubmit} className="editor-input-form">
          <textarea
            ref={inputRef}
            className="editor-input"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'Thinking...' : (mode === 'collection' ? 'Ask about your collection...' : 'Ask about your poem...')}
            rows={2}
            disabled={isLoading}
          />
          {isLoading ? (
            <button
              type="button"
              className="editor-send-btn editor-cancel-btn"
              onClick={cancelStreaming}
              title="Cancel"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              className="editor-send-btn"
              disabled={!inputValue.trim()}
              title="Send (Cmd+Enter)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          )}
        </form>
        {!user && (
          <div className="editor-guest-hint">
            Sign in to keep conversations across devices
          </div>
        )}
      </div>

      {showCapModal && budgetStatus && (
        <UsageCapModal
          budgetStatus={budgetStatus}
          isLoggedIn={!!user}
          onClose={() => setShowCapModal(false)}
        />
      )}
    </div>
  );
}
