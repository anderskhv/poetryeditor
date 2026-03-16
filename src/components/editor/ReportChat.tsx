/**
 * ReportChat — Chat sidebar for discussing a completed editorial report.
 *
 * Takes the full report as context so the user can ask follow-up questions
 * about the editorial feedback, specific poems, or the debate outcomes.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { streamSonnet } from '../../utils/editorialAgents';
import type { EditorialReportData, StreamCallbacks } from '../../types/editor';
import './ReportChat.css';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ReportChatProps {
  report: EditorialReportData;
}

function buildSystemPrompt(report: EditorialReportData): string {
  const sectionSummaries = report.sectionEditorials
    .map(s => `SECTION "${s.sectionName}": ${s.sharedAnalysis}`)
    .join('\n\n');

  const poemSummaries = report.perPoemAssessments
    .map(p => `"${p.poemTitle}" (${p.readinessLevel}): strengths=[${p.strengths.join('; ')}], areas=[${p.weaknesses.join('; ')}]`)
    .join('\n');

  const debateSummary = report.debateLog.length > 0
    ? report.debateLog.map(d =>
        `Topic: ${d.topic} (${d.status})\n${d.positions.map(p => `  ${p.editorId}: ${p.position}`).join('\n')}`
      ).join('\n\n')
    : '(no debate topics)';

  return `You are a helpful editorial assistant for a poetry collection. You have full access to a completed editorial report. Answer the poet's questions about the feedback, specific poems, debate outcomes, or suggestions.

Be warm, direct, and specific. Reference actual poems and feedback from the report. Keep answers concise unless the poet asks for detail.

EDITORIAL LETTER:
${report.synthesizedReport}

SPINE ANALYSIS:
${report.spineAnalysis?.blindReading || '(not available)'}

AMBITION COMPARISON:
${report.spineAnalysis?.ambitionComparison || '(not available)'}

SECTION EDITORIALS:
${sectionSummaries || '(none)'}

PER-POEM ASSESSMENTS:
${poemSummaries || '(none)'}

DEBATE LOG:
${debateSummary}`;
}

export function ReportChat({ report }: ReportChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
    };

    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}-response`,
      role: 'assistant',
      content: '',
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsStreaming(true);

    // Build conversation history for the API
    const conversationMessages = [...messages, userMessage]
      .map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    const userPrompt = conversationMessages
      ? `${conversationMessages}\n\nHuman: ${text}\n\nRespond to the poet's latest message.`
      : text;

    const callbacks: StreamCallbacks = {
      onToken: (token) => {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: last.content + token };
          }
          return updated;
        });
      },
      onDone: () => {
        setIsStreaming(false);
      },
      onError: (err) => {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              content: `Error: ${err.message}`,
            };
          }
          return updated;
        });
        setIsStreaming(false);
      },
    };

    try {
      await streamSonnet(buildSystemPrompt(report), userPrompt, callbacks, 4096);
    } catch {
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages, report]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="report-chat">
      <div className="report-chat-header">
        <h3>Discuss This Report</h3>
        <p>Ask about specific poems, feedback, or suggestions</p>
      </div>

      <div className="report-chat-messages">
        {messages.length === 0 ? (
          <div className="report-chat-empty">
            <p>
              Ask anything about your editorial report. For example:
              <br />
              "Which poems do the editors think are strongest?"
              <br />
              "What should I focus on revising first?"
            </p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`report-chat-message report-chat-message-${msg.role}`}
            >
              {msg.role === 'assistant' ? (
                <div dangerouslySetInnerHTML={{
                  __html: msg.content
                    .split('\n\n')
                    .map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`)
                    .join(''),
                }} />
              ) : (
                msg.content
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="report-chat-input-area">
        <textarea
          ref={textareaRef}
          className="report-chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your report..."
          rows={1}
          disabled={isStreaming}
        />
        <button
          className="report-chat-send-btn"
          onClick={handleSend}
          disabled={isStreaming || !input.trim()}
        >
          {isStreaming ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
