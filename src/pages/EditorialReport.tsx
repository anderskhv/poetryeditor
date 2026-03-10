/**
 * EditorialReport — full page for AI-generated editorial reports.
 *
 * Orchestrates the editorial report generation pipeline with support for:
 * - New report generation from collection submission
 * - Loading existing reports by ID
 * - Poet input during debate phases
 * - Report history browser
 * - Split-view layout with chat sidebar (future)
 */

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEditorialReport } from '../hooks/useEditorialReport';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import type { PreFlightAnswers } from '../types/editor';
import type { CollectionPoem, CollectionSection } from '../types/collection';
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

    // Heading: ##, ###, ####
    if (trimmed.startsWith('#### ')) {
      flushParagraph();
      closeList();
      htmlParts.push(`<h4>${formatInline(trimmed.slice(5))}</h4>`);
      continue;
    }
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

interface GenerateNewState {
  generateNew: true;
  collectionId: string;
  collectionName: string;
  preFlightAnswers: PreFlightAnswers;
  poems: CollectionPoem[];
  sections: CollectionSection[];
}

interface LocationState {
  generateNew?: true;
  collectionId?: string;
  collectionName?: string;
  preFlightAnswers?: PreFlightAnswers;
  poems?: CollectionPoem[];
  sections?: CollectionSection[];
}

interface PoemInputs {
  [poemId: string]: string;
}

interface SectionInputs {
  [sectionName: string]: string;
}

export function EditorialReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reportId } = useParams<{ reportId?: string }>();
  const { user } = useAuth();

  const locationState = location.state as LocationState | null;

  // Determine if we should start a new generation
  const shouldGenerateNew =
    locationState?.generateNew === true &&
    locationState?.collectionId &&
    locationState?.collectionName &&
    Array.isArray(locationState?.poems) &&
    locationState.poems.length > 0 &&
    Array.isArray(locationState?.sections);

  // Initialize the hook
  const hook = useEditorialReport({
    user,
    collectionId: (shouldGenerateNew ? locationState?.collectionId : '') || '',
    collectionName: (shouldGenerateNew ? locationState?.collectionName : '') || '',
    poems: (shouldGenerateNew ? locationState?.poems : []) || [],
    sections: (shouldGenerateNew ? locationState?.sections : []) || [],
  });

  const {
    report,
    progress,
    isGenerating,
    error,
    reportHistory,
    startGeneration,
    submitPoetInput,
    loadReport,
  } = hook;

  // Start generation on mount if needed
  useEffect(() => {
    if (shouldGenerateNew && locationState?.preFlightAnswers) {
      startGeneration(locationState.preFlightAnswers);
    }
  }, [shouldGenerateNew, locationState?.preFlightAnswers, startGeneration]);

  // Load existing report if reportId is in URL
  useEffect(() => {
    if (reportId && !shouldGenerateNew && !report) {
      loadReport(reportId);
    }
  }, [reportId, shouldGenerateNew, report, loadReport]);

  // Poet input state for debate items
  const [debatePoetInputs, setDebatePoetInputs] = useState<Record<string, string>>({});
  const [sectionPoetInputs, setSectionPoetInputs] = useState<SectionInputs>({});
  const [poemPoetInputs, setPoemPoetInputs] = useState<PoemInputs>({});

  // Handle debate poet input submission
  const handleSubmitDebateInput = async () => {
    if (report?.status === 'awaiting_poet') {
      await submitPoetInput(debatePoetInputs);
      setDebatePoetInputs({});
    }
  };

  // Render synthesized report as HTML (must be before any early returns — hooks rule)
  const reportHtml = useMemo(
    () => report?.synthesizedReport ? renderEditorialMarkdown(report.synthesizedReport) : '',
    [report?.synthesizedReport],
  );

  const reportDate = report
    ? new Date(report.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  // Render empty state
  if (!shouldGenerateNew && !reportId && !report) {
    return (
      <Layout>
        <SEOHead
          title="Editorial Report — Poetry Editor"
          description="AI-generated editorial report for your poetry collection."
          noindex
        />
        <div className="editorial-empty">
          <h1>No report available</h1>
          <p>Generate an editorial report from your collection or load a previous report.</p>
          <button onClick={() => navigate('/')} className="editorial-back-btn">
            Back to editor
          </button>
        </div>
      </Layout>
    );
  }

  // Render generating state
  if (isGenerating && progress) {
    return (
      <Layout>
        <SEOHead
          title="Generating Editorial Report — Poetry Editor"
          description="Your editorial report is being generated."
          noindex
        />
        <div className="editorial-progress-container">
          <div className="editorial-progress-content">
            <h1>Generating Editorial Report</h1>

            {/* Main progress bar */}
            <div className="editorial-progress-bar-wrapper">
              <div className="editorial-progress-fill" style={{ width: `${progress.overallProgress}%` }} />
            </div>
            <p className="editorial-progress-pct">{progress.overallProgress}%</p>

            {/* Status message */}
            <p className="editorial-status-message">{progress.statusMessage}</p>

            {/* Phase list */}
            <div className="editorial-phases">
              {[
                { phase: 'editors_reading', label: 'Each editor reads independently' },
                { phase: 'ambition_comparison', label: 'Compare to your ambitions' },
                { phase: 'comparing_notes', label: 'Compare notes' },
                { phase: 'debate', label: 'Debate' },
                { phase: 'poem_assessments', label: 'Build per-poem assessments' },
                { phase: 'synthesis', label: 'Write the editorial letter' },
              ].map(({ phase, label }) => {
                const phaseOrder = ['editors_reading', 'ambition_comparison', 'comparing_notes', 'debate', 'poem_assessments', 'synthesis'];
                const currentIdx = phaseOrder.indexOf(progress.currentPhase);
                const thisIdx = phaseOrder.indexOf(phase);
                const className = thisIdx < currentIdx
                  ? 'editorial-phase editorial-phase-done'
                  : thisIdx === currentIdx
                  ? 'editorial-phase editorial-phase-current'
                  : 'editorial-phase editorial-phase-pending';
                return (
                  <div key={phase} className={className}>
                    <span className="editorial-phase-dot" />
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Render error state
  if (error) {
    return (
      <Layout>
        <SEOHead
          title="Error — Editorial Report — Poetry Editor"
          description="An error occurred while generating your editorial report."
          noindex
        />
        <div className="editorial-error">
          <h1>An error occurred</h1>
          <p className="editorial-error-message">{error}</p>
          <button onClick={() => navigate('/')} className="editorial-back-btn">
            Back to editor
          </button>
        </div>
      </Layout>
    );
  }

  // No report yet
  if (!report) {
    return (
      <Layout>
        <SEOHead
          title="Editorial Report — Poetry Editor"
          description="AI-generated editorial report for your poetry collection."
          noindex
        />
        <div className="editorial-empty">
          <h1>Loading report...</h1>
          <button onClick={() => navigate('/')} className="editorial-back-btn">
            Back to editor
          </button>
        </div>
      </Layout>
    );
  }

  // Render complete report
  return (
    <Layout>
      <SEOHead
        title={`Editorial Report — Poetry Editor`}
        description={`Full editorial report for ${report.collectionId}.`}
        noindex
      />

      <div className="editorial-split">
        {/* Left: Report Content */}
        <div className="editorial-main">
          {/* Header */}
          <div className="editorial-header">
            <button
              onClick={() => navigate('/')}
              className="editorial-back-btn"
              title="Back to editor"
            >
              &larr;
            </button>

            <div className="editorial-title-area">
              <h1>Editorial Report</h1>
              <p className="editorial-meta">Generated {reportDate}</p>
            </div>

            <div className="editorial-header-actions">
              {reportHistory.length > 0 && (
                <select
                  className="editorial-history-select"
                  onChange={(e) => {
                    if (e.target.value) {
                      loadReport(e.target.value);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">Load previous report...</option>
                  {reportHistory.map((r) => (
                    <option key={r.id} value={r.id}>
                      {new Date(r.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit',
                      })} - {r.status}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={() => window.print()}
                className="editorial-print-btn"
                title="Print or save as PDF"
              >
                Print
              </button>
            </div>
          </div>

          {/* Report sections */}
          <article className="editorial-article">
            {/* 1. Synthesized Report (Editorial Letter) */}
            <section className="editorial-section">
              <h2>Editorial Letter</h2>
              <div
                className="editorial-markdown"
                dangerouslySetInnerHTML={{ __html: reportHtml }}
              />
            </section>

            {/* 2. Spine Analysis */}
            {report.spineAnalysis && (
              <section className="editorial-section">
                <h2>What We See</h2>
                <div className="editorial-spine">
                  <div className="editorial-spine-part">
                    <h3>Blind Reading</h3>
                    <div
                      className="editorial-markdown"
                      dangerouslySetInnerHTML={{
                        __html: renderEditorialMarkdown(report.spineAnalysis.blindReading),
                      }}
                    />
                  </div>
                  <div className="editorial-spine-part">
                    <h3>Compared to Your Ambitions</h3>
                    <div
                      className="editorial-markdown"
                      dangerouslySetInnerHTML={{
                        __html: renderEditorialMarkdown(report.spineAnalysis.ambitionComparison),
                      }}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* 3. Section by Section */}
            {report.sectionEditorials.length > 0 && (
              <section className="editorial-section">
                <h2>Section by Section</h2>
                {report.sectionEditorials.map((section, idx) => (
                  <div key={idx} className="editorial-section-block">
                    <h3>{section.sectionName}</h3>

                    {/* Shared analysis */}
                    <div className="editorial-shared-analysis">
                      <div
                        className="editorial-markdown"
                        dangerouslySetInnerHTML={{
                          __html: renderEditorialMarkdown(section.sharedAnalysis),
                        }}
                      />
                    </div>

                    {/* Editor notes (collapsible) */}
                    {section.editorNotes.length > 0 && (
                      <details className="editorial-editor-notes">
                        <summary>Per-editor notes</summary>
                        <div className="editorial-notes-content">
                          {section.editorNotes.map((note, noteIdx) => (
                            <div key={noteIdx} className="editorial-note">
                              <strong>{note.editorId}</strong>
                              <div
                                className="editorial-markdown"
                                dangerouslySetInnerHTML={{
                                  __html: renderEditorialMarkdown(note.note),
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </details>
                    )}

                    {/* Poet input textarea */}
                    <div className="editorial-poet-input-box">
                      <label>Your notes on this section:</label>
                      <textarea
                        className="editorial-textarea"
                        placeholder="Add your reflections on this section..."
                        value={sectionPoetInputs[section.sectionName] || ''}
                        onChange={(e) =>
                          setSectionPoetInputs({
                            ...sectionPoetInputs,
                            [section.sectionName]: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* 4. Debate Rounds */}
            {report.debateLog.length > 0 && (
              <section className="editorial-section">
                <h2>Where Our Editors Agreed / Disagreed</h2>
                <div className="editorial-debate-topics">
                  {report.debateLog.map((round, idx) => (
                    <div key={idx} className="editorial-debate-topic">
                      <h3>{round.topic}</h3>

                      {/* Positions */}
                      <div className="editorial-positions">
                        {round.positions.map((pos, posIdx) => (
                          <div key={posIdx} className="editorial-position">
                            <strong>{pos.editorId}:</strong>
                            <div
                              className="editorial-markdown"
                              dangerouslySetInnerHTML={{
                                __html: renderEditorialMarkdown(pos.position),
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Resolution if exists */}
                      {round.resolution && (
                        <div className="editorial-resolution">
                          <strong>Resolution:</strong>
                          <div
                            className="editorial-markdown"
                            dangerouslySetInnerHTML={{
                              __html: renderEditorialMarkdown(round.resolution),
                            }}
                          />
                        </div>
                      )}

                      {/* Status badge */}
                      <div className={`editorial-debate-status editorial-status-${round.status}`}>
                        {round.status === 'consensus' && 'Editors reached consensus'}
                        {round.status === 'genuine_disagreement' && 'Genuine disagreement'}
                        {round.status === 'poet_input_needed' && 'Awaiting your input'}
                      </div>

                      {/* Poet input if needed */}
                      {round.status === 'poet_input_needed' && report.status === 'awaiting_poet' && (
                        <div className="editorial-poet-input-box">
                          <label>What do you think?</label>
                          <textarea
                            className="editorial-textarea"
                            placeholder="Share your perspective on this disagreement..."
                            value={debatePoetInputs[round.topic] || ''}
                            onChange={(e) =>
                              setDebatePoetInputs({
                                ...debatePoetInputs,
                                [round.topic]: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Submit poet input button (if awaiting input) */}
                {report.status === 'awaiting_poet' && (
                  <div className="editorial-submit-input">
                    <button
                      onClick={handleSubmitDebateInput}
                      className="editorial-submit-btn"
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Processing...' : 'Submit & Continue'}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* 5. Individual Poems */}
            {report.perPoemAssessments.length > 0 && (
              <section className="editorial-section">
                <h2>Individual Poems</h2>
                <div className="editorial-poems">
                  {report.perPoemAssessments.map((poem, idx) => {
                    const statusColors: Record<string, string> = {
                      done: '#2d8a4e',
                      edit: '#d4a017',
                      draft: '#888',
                      rough: '#c44',
                    };
                    const dotColor = statusColors[poem.poemStatus] || '#999';

                    return (
                      <div key={idx} className="editorial-poem-card">
                        <div className="editorial-poem-header">
                          <h3>
                            <span
                              className="editorial-status-dot"
                              style={{ backgroundColor: dotColor }}
                              title={poem.poemStatus}
                            />
                            {poem.poemTitle}
                          </h3>
                          <span className="editorial-consensus" title="Editor consensus">
                            {poem.assessorConsensus === 'strong' && 'Strong consensus'}
                            {poem.assessorConsensus === 'mixed' && 'Mixed views'}
                            {poem.assessorConsensus === 'weak' && 'Weak consensus'}
                          </span>
                        </div>

                        {poem.isFlagged && (
                          <div className={`editorial-flag editorial-flag-${poem.isFlagged}`}>
                            {poem.isFlagged === 'strongest' && 'Editors\' strongest'}
                            {poem.isFlagged === 'weakest' && 'Editors\' most challenged'}
                            {poem.flagReason && `: ${poem.flagReason}`}
                          </div>
                        )}

                        <div className="editorial-poem-meta">
                          <p>
                            <strong>Readiness:</strong> {poem.readinessLevel}
                          </p>
                          {poem.sectionName && (
                            <p>
                              <strong>Section:</strong> {poem.sectionName}
                            </p>
                          )}
                        </div>

                        {poem.strengths.length > 0 && (
                          <div className="editorial-poem-section">
                            <h4>Strengths</h4>
                            <ul>
                              {poem.strengths.map((s, sIdx) => (
                                <li key={sIdx}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {poem.weaknesses.length > 0 && (
                          <div className="editorial-poem-section">
                            <h4>Areas for Development</h4>
                            <ul>
                              {poem.weaknesses.map((w, wIdx) => (
                                <li key={wIdx}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {poem.suggestionsForNextLevel.length > 0 && (
                          <div className="editorial-poem-section">
                            <h4>Suggestions for Next Level</h4>
                            <ul>
                              {poem.suggestionsForNextLevel.map((s, sIdx) => (
                                <li key={sIdx}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {poem.collectionRole && (
                          <div className="editorial-poem-section">
                            <h4>Role in Collection</h4>
                            <p>{poem.collectionRole}</p>
                          </div>
                        )}

                        {/* Poet input textarea */}
                        <div className="editorial-poet-input-box">
                          <label>Your notes on this poem:</label>
                          <textarea
                            className="editorial-textarea"
                            placeholder="Jot down your thoughts on this feedback..."
                            value={poemPoetInputs[poem.poemId] || ''}
                            onChange={(e) =>
                              setPoemPoetInputs({
                                ...poemPoetInputs,
                                [poem.poemId]: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </article>

          {/* Footer */}
          <div className="editorial-footer">
            <p>Generated by Poetry Editor. This is one reader's perspective, not the final word on your work.</p>
          </div>
        </div>

        {/* Right: Chat Sidebar (placeholder) */}
        <div className="editorial-sidebar">
          <div className="editorial-chat-placeholder">
            <p>Chat sidebar coming soon</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
