/**
 * EditorMessage — renders a single chat message bubble with basic markdown.
 */

import { useMemo } from 'react';
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

  return (
    <div className={`editor-msg editor-msg-${message.role}`}>
      <div
        className="editor-msg-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {message.isStreaming && <span className="editor-cursor" />}
    </div>
  );
}
