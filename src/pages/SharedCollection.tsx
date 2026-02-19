import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { fetchSharedCollection, type SharedCollectionPayload } from '../utils/sharedCollections';
import './SharedCollection.css';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderMarkdownToHtml = (value: string) => {
  const escaped = escapeHtml(value);
  return escaped
    .replace(/\*\*(\S(?:[^*]*\S)?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*(\S(?:[^*\n]*\S)?)\*(?!\*)/g, '<em>$1</em>')
    .replace(/__(\S(?:[^_\n]*\S)?)__/g, '<u>$1</u>')
    .replace(/\n/g, '<br />');
};

export function SharedCollection() {
  const { token } = useParams<{ token: string }>();
  const [payload, setPayload] = useState<SharedCollectionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(true);
  const [activeView, setActiveView] = useState<'poems' | 'comments'>('poems');
  const [commentIndex, setCommentIndex] = useState(0);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchSharedCollection(token)
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          const normalized = fetchError.toLowerCase();
          if (
            normalized.includes('permission denied') ||
            normalized.includes('function') && normalized.includes('does not exist')
          ) {
            setError('Sharing is not fully set up. Please run the share SQL in Supabase.');
          } else if (
            normalized.includes('no rows') ||
            normalized.includes('json object requested') ||
            normalized.includes('pgrst116')
          ) {
            setError('This share link is invalid or expired.');
          } else {
            setError(fetchError);
          }
          return;
        }
        if (!data) {
          setError('This share link is invalid or expired.');
          return;
        }
        setPayload(data);
        if (data.share && typeof data.share.show_comments_default === 'boolean') {
          setShowComments(data.share.show_comments_default);
        }
      })
      .catch(() => setError('Failed to load shared collection.'))
      .finally(() => setLoading(false));
  }, [token]);

  const sectionsById = useMemo(() => {
    const map = new Map(payload?.sections.map(section => [section.id, section]) ?? []);
    return map;
  }, [payload]);

  const poemsBySection = useMemo(() => {
    const grouped = new Map<string | null, SharedCollectionPayload['poems']>();
    (payload?.poems || []).forEach(poem => {
      const key = poem.section_id ?? null;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(poem);
    });
    grouped.forEach(list => list.sort((a, b) => a.sort_order - b.sort_order));
    return grouped;
  }, [payload]);

  const orderedSections = useMemo(() => {
    return (payload?.sections || []).slice().sort((a, b) => a.sort_order - b.sort_order);
  }, [payload]);

  const commentsByPoem = useMemo(() => {
    const grouped = new Map<string, SharedCollectionPayload['comments']>();
    (payload?.comments || []).forEach(comment => {
      if (!grouped.has(comment.poem_id)) grouped.set(comment.poem_id, []);
      grouped.get(comment.poem_id)!.push(comment);
    });
    return grouped;
  }, [payload]);

  const poemOrder = useMemo(() => {
    const ordered: Array<SharedCollectionPayload['poems'][number]> = [];
    (poemsBySection.get(null) || []).forEach(poem => ordered.push(poem));
    orderedSections.forEach(section => {
      (poemsBySection.get(section.id) || []).forEach(poem => ordered.push(poem));
    });
    return ordered;
  }, [poemsBySection, orderedSections]);

  const commentList = useMemo(() => {
    const list: Array<{
      id: string;
      poemId: string;
      poemTitle: string;
      text: string;
      quote: string | null;
      createdAt: string;
    }> = [];
    poemOrder.forEach(poem => {
      const comments = commentsByPoem.get(poem.id) || [];
      comments.forEach(comment => {
        list.push({
          id: comment.id,
          poemId: poem.id,
          poemTitle: poem.title || 'Untitled',
          text: comment.text,
          quote: comment.quote || null,
          createdAt: comment.created_at,
        });
      });
    });
    return list;
  }, [poemOrder, commentsByPoem]);

  useEffect(() => {
    if (commentIndex >= commentList.length) {
      setCommentIndex(0);
    }
  }, [commentIndex, commentList.length]);

  const handleNextComment = () => {
    if (commentList.length === 0) return;
    const nextIndex = (commentIndex + 1) % commentList.length;
    setCommentIndex(nextIndex);
    const target = document.getElementById(`comment-${commentList[nextIndex].id}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="shared-collection-page">
          <div className="shared-status">Loading shared collection...</div>
        </div>
      </Layout>
    );
  }

  if (!payload || error) {
    return (
      <Layout>
        <div className="shared-collection-page">
          <div className="shared-status">{error || 'Unable to load this collection.'}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={`${payload.collection.name} - Shared Collection`}
        description={`Read the shared collection "${payload.collection.name}" on Poetry Editor.`}
        canonicalPath={`/share/${token}`}
      />
        <div className="shared-collection-page">
          <div className="shared-collection-layout">
            <aside className="shared-nav">
              <div className="shared-nav-title">Contents</div>
              <nav className="shared-nav-list">
                {(poemsBySection.get(null) || []).length > 0 && (
                <div className="shared-nav-section">
                  <a className="shared-nav-section-link" href="#section-root">Unsorted</a>
                  <div className="shared-nav-poems">
                    {(poemsBySection.get(null) || []).map(poem => {
                      const count = commentsByPoem.get(poem.id)?.length || 0;
                      return (
                      <a key={poem.id} className="shared-nav-poem" href={`#poem-${poem.id}`}>
                        {poem.title || 'Untitled'}
                        {count > 0 && <span className="shared-nav-count">{count}</span>}
                      </a>
                    );
                    })}
                  </div>
                </div>
              )}

              {orderedSections.map(section => {
                const poems = poemsBySection.get(section.id) || [];
                if (poems.length === 0) return null;
                return (
                  <div key={section.id} className="shared-nav-section">
                    <a className="shared-nav-section-link" href={`#section-${section.id}`}>
                      {section.name}
                    </a>
                    <div className="shared-nav-poems">
                      {poems.map(poem => {
                        const count = commentsByPoem.get(poem.id)?.length || 0;
                        return (
                        <a key={poem.id} className="shared-nav-poem" href={`#poem-${poem.id}`}>
                          {poem.title || 'Untitled'}
                          {count > 0 && <span className="shared-nav-count">{count}</span>}
                        </a>
                      );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>
          </aside>

          <div className="shared-collection-main">
            <header className="shared-collection-header">
              <h1>{payload.collection.name}</h1>
              <p className="shared-subtitle">Shared collection</p>
              <div className="shared-header-controls">
                <div className="shared-view-tabs">
                  <button
                    className={`shared-view-tab ${activeView === 'poems' ? 'active' : ''}`}
                    onClick={() => setActiveView('poems')}
                  >
                    Poems
                  </button>
                  <button
                    className={`shared-view-tab ${activeView === 'comments' ? 'active' : ''}`}
                    onClick={() => setActiveView('comments')}
                  >
                    Comments ({commentList.length})
                  </button>
                </div>
                <div className="shared-view-actions">
                  {activeView === 'comments' && (
                    <button
                      className="shared-next-comment"
                      onClick={handleNextComment}
                      disabled={commentList.length === 0}
                    >
                      Next comment
                    </button>
                  )}
                  <button
                    className="shared-comments-toggle"
                    onClick={() => setShowComments(prev => !prev)}
                  >
                    {showComments ? 'Hide comments' : 'Show comments'}
                  </button>
                </div>
              </div>
            </header>

            {activeView === 'poems' ? (
              <>
                <section className="shared-section" id="section-root">
                  {(poemsBySection.get(null) || []).map(poem => {
                    const comments = commentsByPoem.get(poem.id) || [];
                    return (
                      <article key={poem.id} className="shared-poem" id={`poem-${poem.id}`}>
                        <h2>{poem.title || 'Untitled'}</h2>
                        <div
                          className="shared-poem-content"
                          dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(poem.content) }}
                        />
                        {showComments && comments.length > 0 && (
                          <div className="shared-comments">
                            <h3>Comments</h3>
                            {comments.map((comment, idx) => (
                              <div key={comment.id} className="shared-comment" id={`comment-${comment.id}`}>
                                <div className="shared-comment-label">C{idx + 1}</div>
                                {comment.quote && (
                                  <div className="shared-comment-quote">“{comment.quote}”</div>
                                )}
                                <div className="shared-comment-text">{comment.text}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </section>

                {orderedSections.map(section => {
                  const poems = poemsBySection.get(section.id) || [];
                  if (poems.length === 0) return null;
                  return (
                    <section key={section.id} className="shared-section" id={`section-${section.id}`}>
                      <h2 className="shared-section-title">{section.name}</h2>
                      {poems.map(poem => {
                        const comments = commentsByPoem.get(poem.id) || [];
                        return (
                          <article key={poem.id} className="shared-poem" id={`poem-${poem.id}`}>
                            <h3>{poem.title || 'Untitled'}</h3>
                            <div
                              className="shared-poem-content"
                              dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(poem.content) }}
                            />
                            {showComments && comments.length > 0 && (
                              <div className="shared-comments">
                                <h4>Comments</h4>
                                {comments.map((comment, idx) => (
                                  <div key={comment.id} className="shared-comment" id={`comment-${comment.id}`}>
                                    <div className="shared-comment-label">C{idx + 1}</div>
                                    {comment.quote && (
                                      <div className="shared-comment-quote">“{comment.quote}”</div>
                                    )}
                                    <div className="shared-comment-text">{comment.text}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </section>
                  );
                })}
              </>
            ) : (
              <section className="shared-comments-panel">
                {commentList.length === 0 ? (
                  <div className="shared-comments-empty">No comments yet.</div>
                ) : (
                  commentList.map((comment, idx) => (
                    <div key={comment.id} className="shared-comment-card" id={`comment-${comment.id}`}>
                      <div className="shared-comment-meta">
                        <span className="shared-comment-label">C{idx + 1}</span>
                        <span className="shared-comment-poem">{comment.poemTitle}</span>
                      </div>
                      {comment.quote && (
                        <div className="shared-comment-quote">“{comment.quote}”</div>
                      )}
                      <div className="shared-comment-text">{comment.text}</div>
                    </div>
                  ))
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
