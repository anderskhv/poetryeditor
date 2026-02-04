import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { useAuth } from '../hooks/useAuth';
import { useSections } from '../hooks/useCollections';
import { usePoems } from '../hooks/usePoems';
import { supabase } from '../lib/supabase';
import { fetchPoemVersionsForPoems, fetchPoemVersions, addPoemVersion, ensureInitialPoemVersion, migrateLocalPoemVersions, type PoemVersion } from '../utils/poemVersions';
import type { Collection, Section } from '../types/database';
import JSZip from 'jszip';
import './CollectionView.css';

interface PendingUpload {
  sections: string[];
  poems: Array<{
    title: string;
    content: string;
    sectionPath: string | null;
    filename: string;
  }>;
}

export function CollectionView() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loadingCollection, setLoadingCollection] = useState(true);
  const { sections, createManySections } = useSections(id);
  const { poems, createManyPoems, updatePoem, deletePoem, loading: loadingPoems } = usePoems(id);
  const [processingUpload, setProcessingUpload] = useState(false);
  const processingRef = useRef(false); // Sync flag to prevent duplicate uploads
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [versionsByPoem, setVersionsByPoem] = useState<Record<string, PoemVersion[]>>({});

  // Fetch collection details
  useEffect(() => {
    async function fetchCollection() {
      if (!id || !supabase) return;

      try {
        const { data, error } = await supabase
          .from('collections')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setCollection(data);
      } catch (err) {
        console.error('Failed to fetch collection:', err);
      } finally {
        setLoadingCollection(false);
      }
    }

    fetchCollection();
  }, [id]);

  // Handle pending upload from navigation state
  useEffect(() => {
    const state = location.state as { pendingUpload?: PendingUpload } | null;
    if (!state?.pendingUpload || !id) return;

    // Use ref to prevent duplicate uploads (state updates are async, refs are sync)
    if (processingRef.current) return;
    processingRef.current = true;

    async function processUpload() {
      const pendingUpload = (location.state as { pendingUpload: PendingUpload }).pendingUpload;
      setProcessingUpload(true);

      // Clear navigation state immediately to prevent re-runs
      navigate(location.pathname, { replace: true, state: {} });

      try {
        // Create sections first
        const sectionMap = new Map<string, string>(); // path -> id

        if (pendingUpload.sections.length > 0) {
          const sectionsToCreate = pendingUpload.sections.map(path => ({
            name: path.split('/').pop() || path,
            parentId: null, // TODO: handle nested sections
          }));

          const createdSections = await createManySections(sectionsToCreate);
          pendingUpload.sections.forEach((path, idx) => {
            if (createdSections[idx]) {
              sectionMap.set(path, createdSections[idx].id);
            }
          });
        }

        // Create poems
        const poemsToCreate = pendingUpload.poems.map(poem => ({
          title: poem.title,
          content: poem.content,
          sectionId: poem.sectionPath ? sectionMap.get(poem.sectionPath) || null : null,
          filename: poem.filename,
        }));

        await createManyPoems(poemsToCreate);
      } catch (err) {
        console.error('Failed to process upload:', err);
      } finally {
        setProcessingUpload(false);
        processingRef.current = false;
      }
    }

    processUpload();
  }, [location.state, id, createManySections, createManyPoems, navigate, location.pathname]);

  useEffect(() => {
    if (poems.length === 0 || !user) return;
    let isActive = true;
    const poemIds = poems.map(poem => poem.id);

    const loadVersions = async () => {
      await Promise.all(poems.map(poem => migrateLocalPoemVersions(poem.id, user.id)));
      let grouped = await fetchPoemVersionsForPoems(poemIds, user.id);

      const missing = poems.filter(poem => !grouped[poem.id] || grouped[poem.id].length === 0);
      if (missing.length > 0) {
        await Promise.all(missing.map(poem => ensureInitialPoemVersion(poem.id, poem.title, poem.content, user.id)));
        grouped = await fetchPoemVersionsForPoems(poemIds, user.id);
      }

      if (isActive) {
        setVersionsByPoem(grouped);
      }
    };

    loadVersions();
    return () => {
      isActive = false;
    };
  }, [poems, user]);

  const handleExport = async () => {
    if (!collection || poems.length === 0) return;

    const zip = new JSZip();

    // Group poems by section
    const poemsBySection = new Map<string | null, typeof poems>();
    poems.forEach(poem => {
      const key = poem.section_id;
      if (!poemsBySection.has(key)) {
        poemsBySection.set(key, []);
      }
      poemsBySection.get(key)!.push(poem);
    });

    // Create section folders and add poems
    const sectionMap = new Map(sections.map(s => [s.id, s]));

    poemsBySection.forEach((sectionPoems, sectionId) => {
      sectionPoems.forEach(poem => {
        const filename = poem.filename || `${poem.title.replace(/[^a-zA-Z0-9]/g, '-')}.md`;

        if (sectionId) {
          const section = sectionMap.get(sectionId);
          if (section) {
            zip.file(`${section.name}/${filename}`, poem.content);
          } else {
            zip.file(filename, poem.content);
          }
        } else {
          zip.file(filename, poem.content);
        }
      });
    });

    // Generate and download
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collection.name}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeletePoem = async (poemId: string, title: string) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      await deletePoem(poemId);
    }
  };

  const toggleVersions = (poemId: string) => {
    setExpandedVersions(prev => {
      const next = new Set(prev);
      if (next.has(poemId)) {
        next.delete(poemId);
      } else {
        next.add(poemId);
      }
      return next;
    });
  };

  const handleRestoreVersion = async (poem: { id: string; title: string; content: string }, version: PoemVersion) => {
    if (!user) return;
    if (!window.confirm(`Restore version from ${new Date(version.created_at).toLocaleString()}?`)) return;

    // Preserve current version before restoring
    await addPoemVersion(poem.id, poem.title, poem.content, user.id);
    const ok = await updatePoem(poem.id, { title: version.title, content: version.content });
    if (ok) {
      await addPoemVersion(poem.id, version.title, version.content, user.id);
      const refreshed = await fetchPoemVersions(poem.id, user.id);
      setVersionsByPoem(prev => ({
        ...prev,
        [poem.id]: refreshed,
      }));
    }
  };

  if (authLoading || loadingCollection) {
    return (
      <Layout>
        <div className="collection-view-page">
          <div className="loading">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="collection-view-page">
          <div className="not-authenticated">
            <p>Please sign in to view your collections.</p>
            <Link to="/my-collections">Go to Collections</Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!collection) {
    return (
      <Layout>
        <div className="collection-view-page">
          <div className="not-found">
            <h1>Collection Not Found</h1>
            <Link to="/my-collections">Back to Collections</Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Group poems by section for display
  const poemsBySection = new Map<string | null, typeof poems>();
  const rootPoems: typeof poems = [];

  poems.forEach(poem => {
    if (poem.section_id) {
      if (!poemsBySection.has(poem.section_id)) {
        poemsBySection.set(poem.section_id, []);
      }
      poemsBySection.get(poem.section_id)!.push(poem);
    } else {
      rootPoems.push(poem);
    }
  });

  const sectionMap = new Map(sections.map(s => [s.id, s]));

  return (
    <Layout>
      <SEOHead
        title={`${collection.name} - Poetry Editor`}
        description={`Your poetry collection: ${collection.name}`}
        canonicalPath={`/my-collections/${id}`}
      />

      <div className="collection-view-page">
        <nav className="collection-breadcrumb">
          <Link to="/my-collections">My Collections</Link>
          <span className="breadcrumb-separator">/</span>
          <span>{collection.name}</span>
        </nav>

        <div className="collection-header">
          <h1>{collection.name}</h1>
          <div className="collection-actions">
            <button className="export-button" onClick={handleExport} disabled={poems.length === 0}>
              Export as ZIP
            </button>
          </div>
        </div>

        {processingUpload && (
          <div className="processing-upload">
            Uploading poems...
          </div>
        )}

        {loadingPoems ? (
          <div className="loading">Loading poems...</div>
        ) : poems.length === 0 ? (
          <div className="no-poems">
            <p>This collection is empty.</p>
          </div>
        ) : (
          <div className="poems-container">
            {/* Root level poems */}
            {rootPoems.length > 0 && (
              <div className="poems-section">
                <div className="poems-grid">
                  {rootPoems.map(poem => (
                    <div key={poem.id} className="poem-card">
                      <Link
                        to={`/?poem=${poem.id}`}
                        className="poem-link"
                      >
                        <h3>{poem.title}</h3>
                        <p className="poem-preview">
                          {poem.content.substring(0, 100)}
                          {poem.content.length > 100 ? '...' : ''}
                        </p>
                      </Link>
                      <div className="poem-card-actions">
                        <button
                          className="versions-btn"
                          onClick={() => toggleVersions(poem.id)}
                        >
                          Versions ({versionsByPoem[poem.id]?.length || 0})
                        </button>
                        <button
                          className="delete-poem-btn"
                          onClick={() => handleDeletePoem(poem.id, poem.title)}
                          title="Delete poem"
                        >
                          &times;
                        </button>
                      </div>
                      {expandedVersions.has(poem.id) && (
                        <div className="poem-versions">
                          {(versionsByPoem[poem.id] || []).length === 0 ? (
                            <div className="poem-version-empty">No saved versions yet.</div>
                          ) : (
                            (versionsByPoem[poem.id] || []).map(version => (
                              <div key={version.id} className="poem-version-item">
                                <div className="poem-version-meta">
                                  <span className="poem-version-date">
                                    {new Date(version.created_at).toLocaleString()}
                                  </span>
                                  <span className="poem-version-title">{version.title}</span>
                                </div>
                                <p className="poem-version-preview">
                                  {version.content.substring(0, 120)}
                                  {version.content.length > 120 ? '...' : ''}
                                </p>
                                <button
                                  className="poem-version-restore"
                                  onClick={() => handleRestoreVersion(poem, version)}
                                >
                                  Restore
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sectioned poems */}
            {Array.from(poemsBySection.entries()).map(([sectionId, sectionPoems]) => {
              const section = sectionId ? sectionMap.get(sectionId) : null;
              return (
                <div key={sectionId || 'root'} className="poems-section">
                  {section && <h2 className="section-title">{section.name}</h2>}
                  <div className="poems-grid">
                    {sectionPoems.map(poem => (
                      <div key={poem.id} className="poem-card">
                        <Link
                          to={`/?poem=${poem.id}`}
                          className="poem-link"
                        >
                          <h3>{poem.title}</h3>
                          <p className="poem-preview">
                            {poem.content.substring(0, 100)}
                            {poem.content.length > 100 ? '...' : ''}
                          </p>
                        </Link>
                        <div className="poem-card-actions">
                          <button
                            className="versions-btn"
                            onClick={() => toggleVersions(poem.id)}
                          >
                            Versions ({versionsByPoem[poem.id]?.length || 0})
                          </button>
                          <button
                            className="delete-poem-btn"
                            onClick={() => handleDeletePoem(poem.id, poem.title)}
                            title="Delete poem"
                          >
                            &times;
                          </button>
                        </div>
                        {expandedVersions.has(poem.id) && (
                          <div className="poem-versions">
                            {(versionsByPoem[poem.id] || []).length === 0 ? (
                              <div className="poem-version-empty">No saved versions yet.</div>
                            ) : (
                              (versionsByPoem[poem.id] || []).map(version => (
                                <div key={version.id} className="poem-version-item">
                                  <div className="poem-version-meta">
                                    <span className="poem-version-date">
                                      {new Date(version.created_at).toLocaleString()}
                                    </span>
                                    <span className="poem-version-title">{version.title}</span>
                                  </div>
                                  <p className="poem-version-preview">
                                    {version.content.substring(0, 120)}
                                    {version.content.length > 120 ? '...' : ''}
                                  </p>
                                  <button
                                    className="poem-version-restore"
                                    onClick={() => handleRestoreVersion(poem, version)}
                                  >
                                    Restore
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="collection-stats">
          <span>{poems.length} poem{poems.length !== 1 ? 's' : ''}</span>
          {sections.length > 0 && (
            <span> in {sections.length} section{sections.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </Layout>
  );
}
