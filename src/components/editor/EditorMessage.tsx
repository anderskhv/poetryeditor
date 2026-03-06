/**
 * EditorMessage — renders a single chat message bubble with basic markdown.
 */

import { useMemo, useState, useCallback } from 'react';
import type { ChatMessage } from '../../types/editor';

interface EditorMessageProps {
  message: ChatMessage;
}

/**
 * Simple markdown-to-HTML: bold, italic, inline code, line breaks.
 * No heavy dependencies.
 */
function renderMarkdown(text: string): string {
  return text
    // Bold: **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_ (but not inside words with underscores)
    .replace(/(?<!\w)\*([^*]+?)\*(?!\w)/g, '<em>$1</em>')
    .replace(/(?<!\w)_([^_]+?)_(?!\w)/g, '<em>$1</em>')
    // Inline code: `text`
    .replace(/`([^`]+?)`/g, '<code>$1</code>')
    // Line breaks
    .replace(/\n/g, '<br />');
}

export function EditorMessage({ message }: EditorMessageProps) {
  const html = useMemo(() => renderMarkdown(message.content), [message.content]);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = message.content;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [message.content]);

  return (
    <div className={`editor-msg editor-msg-${message.role}`}>
      <div
        className="editor-msg-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {message.role === 'assistant' && !message.isStreaming && (
        <button
          className={`editor-msg-copy ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy message'}
          type="button"
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      )}
      {message.isStreaming && <span className="editor-cursor" />}
    </div>
  );
}
