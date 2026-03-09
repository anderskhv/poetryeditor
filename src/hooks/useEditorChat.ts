/**
 * useEditorChat — manages chat state, message send/receive, streaming,
 * conversation persistence, and multi-agent orchestration.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type {
  ChatMessage,
  EditorConversation,
  PoetProfile,
  AnalysisContext,
  TokenUsage,
  MultiAgentResponse,
  EditorSettings,
} from '../types/editor';
import { streamCoachingMessage, setExtractionUsageCallback } from '../utils/editorApi';
import { runPerPoemAgents } from '../utils/editorAgents';
import { buildCoachingPrompt, buildCollectionAnalysisPrompt, type CollectionContext } from '../utils/editorPrompts';
import {
  getLocalMessages,
  createLocalConversation,
  getLocalConversations,
  appendLocalMessage,
} from '../utils/editorStorage';
import { checkBudget, recordUsage, type BudgetStatus } from '../utils/usageTracking';

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface CollectionPoemData {
  title: string;
  content: string;
  sectionName: string | null;
}

interface UseEditorChatOptions {
  user: User | null;
  profile: PoetProfile | null;
  poemId: string | null;
  poemTitle: string;
  poemText: string;
  analysis?: AnalysisContext;
  collectionPoems?: CollectionPoemData[];
  collectionName?: string;
  mode?: 'per_poem' | 'collection';
  conversationSummaries?: Array<{ poemTitle: string; summary: string }>;
  /** Multi-agent settings (perspective, harshness) */
  editorSettings?: EditorSettings;
  /** Memory context to inject into system prompt */
  memoryContext?: string;
  /** Callback to trigger learning extraction after assistant response */
  onAssistantResponse?: (messages: Array<{ role: string; content: string }>) => void;
}

export function useEditorChat({
  user,
  profile,
  poemId,
  poemTitle,
  poemText,
  analysis,
  collectionPoems,
  collectionName,
  mode = 'per_poem',
  conversationSummaries,
  editorSettings,
  memoryContext,
  onAssistantResponse,
}: UseEditorChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<EditorConversation | null>(null);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  /** Synthesis sections from multi-agent flow (set after Reader finishes) */
  const [synthesisSections, setSynthesisSections] = useState<MultiAgentResponse | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messageCountRef = useRef(0);

  // Reset state when switching mode or poem
  useEffect(() => {
    setMessages([]);
    setConversation(null);
    setSynthesisSections(null);
    messageCountRef.current = 0;
  }, [mode, poemId]);

  // Check budget on mount and after each message
  useEffect(() => {
    checkBudget(user, supabase).then(setBudgetStatus).catch(() => {});
  }, [user, messages.length]);

  // Set up extraction usage callback for tracking Haiku usage
  useEffect(() => {
    setExtractionUsageCallback((usage: TokenUsage) => {
      recordUsage(user, supabase, usage.model, usage.inputTokens, usage.outputTokens);
    });
    return () => setExtractionUsageCallback(null);
  }, [user]);

  // Load existing conversation for this poem or collection
  useEffect(() => {
    if (mode === 'per_poem' && !poemId) return;

    async function loadConversation() {
      if (user && supabase) {
        // Load from Supabase
        let query = supabase
          .from('editor_conversations')
          .select('*')
          .eq('user_id', user.id)
          .eq('mode', mode);

        if (mode === 'per_poem') {
          query = query.eq('poem_id', poemId);
        } else {
          query = query.is('poem_id', null);
        }

        const { data: convs } = await query
          .order('updated_at', { ascending: false })
          .limit(1);

        if (convs && convs.length > 0) {
          const conv = convs[0];
          setConversation({
            id: conv.id,
            userId: conv.user_id,
            poemId: conv.poem_id,
            collectionId: conv.collection_id,
            mode: conv.mode,
            title: conv.title,
            createdAt: conv.created_at,
            updatedAt: conv.updated_at,
          });

          // Load messages
          const { data: msgs } = await supabase
            .from('editor_messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: true });

          if (msgs) {
            setMessages(
              msgs.map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                createdAt: m.created_at,
              })),
            );
            messageCountRef.current = msgs.length;
          }
        }
      } else {
        // Load from localStorage
        const allConvs = getLocalConversations(mode === 'per_poem' ? poemId || undefined : undefined);
        // Filter by mode to avoid mixing per-poem and collection conversations
        const convs = allConvs.filter(c => c.mode === mode);
        if (convs.length > 0) {
          setConversation(convs[0]);
          const msgs = getLocalMessages(convs[0].id);
          setMessages(msgs);
          messageCountRef.current = msgs.length;
        }
      }
    }

    loadConversation();
  }, [user, poemId, mode]);

  // Ensure a conversation exists (create if needed)
  const ensureConversation = useCallback(async (): Promise<EditorConversation> => {
    if (conversation) return conversation;

    if (user && supabase) {
      const { data, error } = await supabase
        .from('editor_conversations')
        .insert({
          user_id: user.id,
          poem_id: mode === 'per_poem' ? poemId : null,
          mode: mode,
          title: mode === 'collection' ? (collectionName || 'Collection Review') : (poemTitle || 'Untitled'),
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error('Failed to create conversation');
      }

      const conv: EditorConversation = {
        id: data.id,
        userId: data.user_id,
        poemId: data.poem_id,
        collectionId: data.collection_id,
        mode: data.mode,
        title: data.title,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
      setConversation(conv);
      return conv;
    } else {
      // localStorage
      const conv = createLocalConversation(
        mode === 'per_poem' ? poemId : null,
        null,
        mode === 'collection' ? (collectionName || 'Collection Review') : (poemTitle || 'Untitled'),
      );
      setConversation(conv);
      return conv;
    }
  }, [conversation, user, poemId, poemTitle, mode, collectionName]);

  // Persist assistant message helper
  const persistAssistantMessage = useCallback((conv: EditorConversation, assistantId: string, fullResponse: string) => {
    if (user && supabase) {
      supabase
        .from('editor_messages')
        .insert({
          conversation_id: conv.id,
          role: 'assistant',
          content: fullResponse,
        })
        .then(({ error }) => {
          if (error) console.error('Failed to save assistant message:', error);
        });
    } else {
      const finalAssistant: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: fullResponse,
        createdAt: new Date().toISOString(),
      };
      appendLocalMessage(conv.id, finalAssistant);
    }
  }, [user]);

  // Send a message
  const sendMessage = useCallback(async (content: string): Promise<'sent' | 'cap_exceeded'> => {
    if (!profile || !content.trim()) return 'sent';

    // Check budget before sending
    const budget = await checkBudget(user, supabase);
    setBudgetStatus(budget);
    if (!budget.canSend) {
      return 'cap_exceeded';
    }

    setError(null);
    setSynthesisSections(null);
    const conv = await ensureConversation();

    // Add user message
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);

    // Persist user message
    if (user && supabase) {
      supabase
        .from('editor_messages')
        .insert({
          conversation_id: conv.id,
          role: 'user',
          content: userMsg.content,
        })
        .then(({ error }) => {
          if (error) console.error('Failed to save user message:', error);
        });
    } else {
      appendLocalMessage(conv.id, userMsg);
    }

    // Create streaming assistant message
    const assistantId = generateId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(true);

    // Build collection context
    const collectionCtx: CollectionContext | undefined =
      collectionPoems && collectionPoems.length > 0
        ? { poems: collectionPoems, collectionName: collectionName || 'Untitled Collection' }
        : undefined;

    // Build message history for API (excluding the streaming placeholder)
    const apiMessages = [...messages, userMsg].map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Abort controller for cancellation
    const controller = new AbortController();
    abortRef.current = controller;

    const harshness = editorSettings?.harshness;
    const perspective = editorSettings?.perspective || 'none';

    // Usage tracking helper
    const trackUsage = (usage: TokenUsage) => {
      recordUsage(user, supabase, usage.model, usage.inputTokens, usage.outputTokens);
      checkBudget(user, supabase).then(setBudgetStatus).catch(() => {});
    };

    if (mode === 'collection') {
      // Collection mode: single Sonnet call (no multi-agent for editorial letters yet)
      const systemPrompt = buildCollectionAnalysisPrompt(
        profile,
        collectionCtx || { poems: [], collectionName: 'Untitled Collection' },
        conversationSummaries,
      );

      const maxTokens = 16384;

      await streamCoachingMessage(
        systemPrompt,
        apiMessages,
        {
          onToken: (token) => {
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: m.content + token }
                  : m,
              ),
            );
          },
          onDone: (fullResponse) => {
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: fullResponse, isStreaming: false }
                  : m,
              ),
            );
            setIsLoading(false);
            abortRef.current = null;
            messageCountRef.current += 2;
            persistAssistantMessage(conv, assistantId, fullResponse);

            // Fire learning extraction in background
            if (onAssistantResponse) {
              onAssistantResponse([...apiMessages, { role: 'assistant', content: fullResponse }]);
            }
          },
          onUsage: trackUsage,
          onError: (err) => {
            setError(err.message);
            setIsLoading(false);
            abortRef.current = null;
            setMessages(prev => prev.filter(m => m.id !== assistantId));
          },
        },
        controller.signal,
        maxTokens,
      );
    } else {
      // Per-poem mode: multi-agent flow
      const systemPrompt = buildCoachingPrompt(
        profile,
        poemTitle,
        poemText,
        analysis,
        collectionCtx,
        conversationSummaries,
        harshness,
        memoryContext,
      );

      setIsSynthesizing(false);

      await runPerPoemAgents(
        {
          poemText,
          poemTitle,
          systemPrompt,
          messages: apiMessages,
          perspective,
          harshness: harshness || 'encouraging',
          signal: controller.signal,
          onUsage: trackUsage,
        },
        {
          onReaderToken: (token) => {
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: m.content + token }
                  : m,
              ),
            );
          },
          onReaderDone: (fullResponse) => {
            // Reader is done — update message, but keep loading for synthesis
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: fullResponse, isStreaming: false }
                  : m,
              ),
            );
            setIsSynthesizing(true);
          },
          onSynthesisReady: (sections: MultiAgentResponse) => {
            setIsSynthesizing(false);
            setIsLoading(false);
            abortRef.current = null;
            messageCountRef.current += 2;

            // Build the full response: main feedback + synthesis sections
            let fullContent = sections.mainFeedback;

            if (sections.craftNotes) {
              fullContent += '\n\n## Craft Notes\n' + sections.craftNotes;
            }
            if (sections.questions) {
              fullContent += '\n\n## Questions to Consider\n' + sections.questions;
            }
            if (sections.perspectiveNotes && sections.perspectiveName) {
              fullContent += `\n\n## From the ${sections.perspectiveName}\n` + sections.perspectiveNotes;
            }

            // Update the message with complete content
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: fullContent, isStreaming: false }
                  : m,
              ),
            );

            setSynthesisSections(sections);
            persistAssistantMessage(conv, assistantId, fullContent);

            // Fire learning extraction in background
            if (onAssistantResponse) {
              onAssistantResponse([...apiMessages, { role: 'assistant', content: fullContent }]);
            }
          },
          onError: (err) => {
            setError(err.message);
            setIsLoading(false);
            setIsSynthesizing(false);
            abortRef.current = null;
            setMessages(prev => prev.filter(m => m.id !== assistantId));
          },
          onUsage: trackUsage,
        },
      );
    }

    return 'sent';
  }, [profile, poemTitle, poemText, analysis, messages, ensureConversation, user, collectionPoems, collectionName, mode, conversationSummaries, editorSettings, memoryContext, onAssistantResponse, persistAssistantMessage]);

  // Cancel streaming
  const cancelStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversation(null);
    setSynthesisSections(null);
    messageCountRef.current = 0;
  }, []);

  // Get message count (for triggering learning extraction)
  const getMessageCount = useCallback(() => messageCountRef.current, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    cancelStreaming,
    clearConversation,
    getMessageCount,
    conversation,
    budgetStatus,
    synthesisSections,
    isSynthesizing,
  };
}
