/**
 * EditorMessage — renders a single chat message bubble.
 */

import type { ChatMessage } from '../../types/editor';

interface EditorMessageProps {
  message: ChatMessage;
}

export function EditorMessage({ message }: EditorMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`editor-msg editor-msg-${message.role}`}>
      <div className="editor-msg-content">
        {message.content}
        {message.isStreaming && <span className="editor-cursor" />}
      </div>
    </div>
  );
}
