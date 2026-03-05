/**
 * useEditorChat — manages chat state, message send/receive, streaming,
 * and conversation persistence.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type {
  ChatMessage,
  EditorConversation,
  PoetProfile,
  AnalysisContext,
} from '../types/editor';
import { streamCoachingMessage } from '../utils/editorApi';
import { buildCoachingPrompt, type CollectionContext } from '../utils/editorPrompts';
import {
  getLocalMessages,
  saveLocalMessages,
  createLocalConversation,
  getLocalConversations,
  appendLocalMessage,
} from '../utils/editorStorage';

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
}: UseEditorChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<EditorConversation | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messageCountRef = useRef(0);

  // Load existing conversation for this poem
  useEffect(() => {
    if (!poemId) return;

    async function loadConversation() {
      if (user && supabase) {
        // Load from Supabase
        const { data: convs } = await supabase
          .from('editor_conversations')
          .select('*')
          .eq('user_id', user.id)
          .eq('poem_id', poemId)
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
        const convs = getLocalConversations(poemId || undefined);
        if (convs.length > 0) {
          setConversation(convs[0]);
          const msgs = getLocalMessages(convs[0].id);
          setMessages(msgs);
          messageCountRef.current = msgs.length;
        }
      }
    }

    loadConversation();
  }, [user, poemId]);

  // Ensure a conversation exists (create if needed)
  const ensureConversation = useCallback(async (): Promise<EditorConversation> => {
    if (conversation) return conversation;

    if (user && supabase) {
      const { data, error } = await supabase
        .from('editor_conversations')
        .insert({
          user_id: user.id,
          poem_id: poemId,
          mode: 'per_poem',
          title: poemTitle || 'Untitled',
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
      const conv = createLocalConversation(poemId, null, poemTitle || 'Untitled');
      setConversation(conv);
      return conv;
    }
  }, [conversation, user, poemId, poemTitle]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!profile || !content.trim()) return;

    setError(null);
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

    // Build the system prompt
    const systemPrompt = buildCoachingPrompt(profile, poemTitle, poemText, analysis, collectionCtx);

    // Build message history for API (excluding the streaming placeholder)
    const apiMessages = [...messages, userMsg].map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Abort controller for cancellation
    const controller = new AbortController();
    abortRef.current = controller;

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

          // Persist assistant message
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
        },
        onError: (err) => {
          setError(err.message);
          setIsLoading(false);
          abortRef.current = null;
          // Remove the empty streaming message
          setMessages(prev => prev.filter(m => m.id !== assistantId));
        },
      },
      controller.signal,
    );
  }, [profile, poemTitle, poemText, analysis, messages, ensureConversation, user, collectionPoems, collectionName]);

  // Cancel streaming
  const cancelStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversation(null);
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
  };
}
