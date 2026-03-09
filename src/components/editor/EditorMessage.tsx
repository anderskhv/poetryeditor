/**
 * EditorMessage — renders a single chat message bubble with basic markdown.
 *
 * For assistant messages, detects ## sections (Craft Notes, Questions to Consider,
 * From the [Perspective]) and renders them as collapsible sections.
 */

import { useMemo, useState, useCallback } from 'react';
import type { ChatMessage } from '../../types/editor';

interface EditorMessageProps {
  message: ChatMessage;
}

/**
 * Simple markdown-to-HTML: headings, bold, italic, inline code, line breaks.
 * No heavy dependencies.
 */
function renderMarkdown(text: string): string {
  return text
    // Headings: ## and ###
    .replace(/^### (.+)$/gm, '<h4 class="editor-msg-h3">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="editor-msg-h2">$1</h3>')
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

/** Known collapsible section headers from multi-agent synthesis */
const SECTION_HEADERS = ['## Craft Notes', '## Questions to Consider', '## From the '];

interface MessageSection {
  title: string;
  content: string;
  isMain: boolean;
}

/**
 * Split assistant content into main feedback + collapsible sections.
 */
function splitIntoSections(content: string): MessageSection[] {
  const sections: MessageSection[] = [];
  const lines = content.split('\n');
  let currentSection: MessageSection = { title: '', content: '', isMain: true };

  for (const line of lines) {
    // Check if this line starts a known section
    const isNewSection = SECTION_HEADERS.some(h => line.startsWith(h));

    if (isNewSection) {
      // Save the current section
      if (currentSection.content.trim()) {
        sections.push({ ...currentSection, content: currentSection.content.trim() });
      }
      // Start a new section
      const title = line.replace(/^## /, '').trim();
      currentSection = { title, content: '', isMain: false };
    } else {
      currentSection.content += (currentSection.content ? '\n' : '') + line;
    }
  }

  // Save the last section
  if (currentSection.content.trim()) {
    sections.push({ ...currentSection, content: currentSection.content.trim() });
  }

  return sections;
}

function CollapsibleSection({ section }: { section: MessageSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const html = useMemo(() => renderMarkdown(section.content), [section.content]);

  return (
    <div className={`editor-msg-section ${isOpen ? 'open' : ''}`}>
      <button
        className="editor-msg-section-toggle"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <svg
          className={`editor-msg-section-chevron ${isOpen ? 'open' : ''}`}
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="editor-msg-section-title">{section.title}</span>
      </button>
      {isOpen && (
        <div
          className="editor-msg-section-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}

export function EditorMessage({ message }: EditorMessageProps) {
  const [copied, setCopied] = useState(false);

  // Split assistant messages into sections
  const sections = useMemo(() => {
    if (message.role !== 'assistant' || message.isStreaming) return null;
    const s = splitIntoSections(message.content);
    // Only use sections if there are collapsible ones
    if (s.length <= 1 || s.every(sec => sec.isMain)) return null;
    return s;
  }, [message.content, message.role, message.isStreaming]);

  const mainHtml = useMemo(() => {
    if (sections) {
      // Only render the main section
      const main = sections.find(s => s.isMain);
      return main ? renderMarkdown(main.content) : '';
    }
    return renderMarkdown(message.content);
  }, [message.content, sections]);

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
        dangerouslySetInnerHTML={{ __html: mainHtml }}
      />
      {sections && sections.filter(s => !s.isMain).map((section, i) => (
        <CollapsibleSection key={i} section={section} />
      ))}
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
