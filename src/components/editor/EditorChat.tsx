/**
 * EditorChat — main chat panel for the AI poetry editor.
 *
 * Renders in the right sidebar. Handles:
 * - Onboarding gate (first-time questionnaire)
 * - Chat messages with streaming
 * - Input area with send/cancel
 * - API key configuration
 * - Learning extraction trigger
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import type { PoetProfile, AnalysisContext } from '../../types/editor';
import { useEditorChat } from '../../hooks/useEditorChat';
import { EditorOnboarding } from './EditorOnboarding';
import { EditorMessage } from './EditorMessage';
import { hasApiKey } from '../../utils/editorApi';
import { saveLocalApiKey, getLocalApiKey, clearLocalApiKey } from '../../utils/editorStorage';
import {
  extractLearnings,
  regenerateSummary,
} from '../../utils/editorApi';
import {
  buildLearningExtractionPrompt,
  buildSummaryPrompt,
} from '../../utils/editorPrompts';
import './EditorChat.css';

interface CollectionPoemData {
  id: string;
  title: string;
  content: string;
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
  onCompleteOnboarding: (data: import('../../types/editor').OnboardingData, style: import('../../types/editor').FeedbackStyle) => void;
  onAddLearning: (insight: string) => void;
  onUpdateSummary: (summary: string) => void;
}

export function EditorChat({
  user,
  profile,
  poemId,
  poemTitle,
  poemText,
  collectionPoems,
  collectionName,
  analysis,
  onCompleteOnboarding,
  onAddLearning,
  onUpdateSummary,
}: EditorChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastExtractionCount = useRef(0);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    cancelStreaming,
    clearConversation,
    getMessageCount,
  } = useEditorChat({
    user,
    profile,
    poemId,
    poemTitle,
    poemText,
    analysis,
    collectionPoems,
    collectionName,
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
    if (!profile || isLoading) return;

    const currentCount = getMessageCount();
    if (currentCount - lastExtractionCount.current >= 6 && currentCount > 0) {
      lastExtractionCount.current = currentCount;
      triggerLearningExtraction();
    }
  }, [messages, isLoading]);

  const triggerLearningExtraction = useCallback(async () => {
    if (!profile) return;

    // Get last 6 messages for extraction
    const recentMsgs = messages.slice(-6).map(m => ({
      role: m.role,
      content: m.content,
    }));

    if (recentMsgs.length < 2) return;

    const extractionPrompt = buildLearningExtractionPrompt(
      profile.summary,
      recentMsgs,
    );

    const newLearnings = await extractLearnings(extractionPrompt);

    for (const learning of newLearnings) {
      onAddLearning(learning.insight);
    }

    // Regenerate summary if learnings have accumulated
    const totalLearnings = profile.learnings.length + newLearnings.length;
    if (totalLearnings > 0 && totalLearnings % 10 === 0) {
      const summaryPrompt = buildSummaryPrompt(
        profile.onboardingData,
        [...profile.learnings, ...newLearnings.map(l => ({
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
  }, [profile, messages, onAddLearning, onUpdateSummary]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    setInputValue('');
    sendMessage(trimmed);
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
              {existingKey ? 'Key configured. Enter a new one to replace it.' : 'Required to use the editor. Get one at console.anthropic.com.'}
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

  // Onboarding
  if (profile && !profile.onboardingCompleted) {
    return (
      <div className="editor-chat">
        <div className="editor-chat-header">
          <span className="editor-chat-title">Editor</span>
        </div>
        <EditorOnboarding onComplete={onCompleteOnboarding} />
      </div>
    );
  }

  // No API key
  if (!hasKey) {
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
          <p>To start using the editor, you'll need an Anthropic API key.</p>
          <button className="editor-option-btn" onClick={() => setShowSettings(true)}>
            Add API Key
          </button>
        </div>
      </div>
    );
  }

  // Main chat
  return (
    <div className="editor-chat">
      <div className="editor-chat-header">
        <span className="editor-chat-title">Editor</span>
        <div className="editor-header-actions">
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
            <p>I can see your poem{collectionPoems && collectionPoems.length > 1 ? ` and your full collection (${collectionPoems.length} poems)` : ''}. Ask me anything — about a specific line, how it connects to other poems, or where to take it next.</p>
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
            placeholder={isLoading ? 'Thinking...' : 'Ask about your poem...'}
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
    </div>
  );
}
