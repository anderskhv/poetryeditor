/**
 * EditorialReport — dedicated page for reading a full editorial letter.
 *
 * Receives report markdown via location state from EditorChat.
 * Renders in a clean, wide reading layout with print support.
 */

import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import './EditorialReport.css';

/**
 * Render editorial markdown to HTML.
 * Supports: headings (##), bold, italic, inline code, paragraphs, numbered lists, bullet lists.
 */
function renderEditorialMarkdown(text: string): string {
  const lines = text.split('\n');
  const htmlParts: string[] = [];
  let inList: 'ul' | 'ol' | null = null;
  let paragraphBuffer: string[] = [];

  function flushParagraph() {
    if (paragraphBuffer.length > 0) {
      const content = paragraphBuffer.join(' ').trim();
      if (content) {
        htmlParts.push(`<p>${formatInline(content)}</p>`);
      }
      paragraphBuffer = [];
    }
  }

  function closeList() {
    if (inList) {
      htmlParts.push(inList === 'ul' ? '</ul>' : '</ol>');
      inList = null;
    }
  }

  function formatInline(s: string): string {
    return s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/(?<!\w)\*([^*]+?)\*(?!\w)/g, '<em>$1</em>')
      .replace(/(?<!\w)_([^_]+?)_(?!\w)/g, '<em>$1</em>')
      .replace(/`([^`]+?)`/g, '<code>$1</code>');
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty line — flush paragraph
    if (trimmed === '') {
      flushParagraph();
      closeList();
      continue;
    }

    // Heading: ## or ###
    if (trimmed.startsWith('### ')) {
      flushParagraph();
      closeList();
      htmlParts.push(`<h3>${formatInline(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushParagraph();
      closeList();
      htmlParts.push(`<h2>${formatInline(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushParagraph();
      closeList();
      htmlParts.push(`<h1>${formatInline(trimmed.slice(2))}</h1>`);
      continue;
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***') {
      flushParagraph();
      closeList();
      htmlParts.push('<hr />');
      continue;
    }

    // Bullet list item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph();
      if (inList !== 'ul') {
        closeList();
        htmlParts.push('<ul>');
        inList = 'ul';
      }
      htmlParts.push(`<li>${formatInline(trimmed.slice(2))}</li>`);
      continue;
    }

    // Numbered list item
    const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
    if (numberedMatch) {
      flushParagraph();
      if (inList !== 'ol') {
        closeList();
        htmlParts.push('<ol>');
        inList = 'ol';
      }
      htmlParts.push(`<li>${formatInline(numberedMatch[2])}</li>`);
      continue;
    }

    // Regular text — accumulate into paragraph
    paragraphBuffer.push(trimmed);
  }

  flushParagraph();
  closeList();

  return htmlParts.join('\n');
}

interface ReportState {
  markdown: string;
  collectionName: string;
  generatedAt: string;
}

export function EditorialReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ReportState | null;

  const html = useMemo(() => {
    if (!state?.markdown) return '';
    return renderEditorialMarkdown(state.markdown);
  }, [state?.markdown]);

  if (!state?.markdown) {
    return (
      <Layout>
        <SEOHead
          title="Editorial Report — Poetry Editor"
          description="Full editorial letter for your poetry collection."
          noindex
        />
        <div className="editorial-report-empty">
          <h1>No report available</h1>
          <p>Generate an editorial report from the editor's collection review mode.</p>
          <button onClick={() => navigate('/')} className="editorial-report-back">
            Back to editor
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={`Editorial Letter: ${state.collectionName} — Poetry Editor`}
        description={`Full editorial letter for "${state.collectionName}".`}
        noindex
      />
      <div className="editorial-report">
        <div className="editorial-report-header">
          <button onClick={() => navigate(-1)} className="editorial-report-back">
            &larr; Back to editor
          </button>
          <button onClick={() => window.print()} className="editorial-report-print">
            Print / Save as PDF
          </button>
        </div>

        <article className="editorial-report-content">
          <header className="editorial-report-title">
            <h1>Editorial Letter</h1>
            <p className="editorial-report-meta">
              {state.collectionName} &middot; {new Date(state.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </header>

          <div
            className="editorial-report-body"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>

        <div className="editorial-report-footer">
          <p>Generated by Poetry Editor's AI coach. This is one reader's response — not the final word on your work.</p>
        </div>
      </div>
    </Layout>
  );
}
