import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { useAuth } from '../hooks/useAuth';
import { useSections } from '../hooks/useCollections';
import { usePoems } from '../hooks/usePoems';
import { supabase } from '../lib/supabase';
import { fetchPoemVersionsForPoems, fetchPoemVersions, addPoemVersion, ensureInitialPoemVersion, migrateLocalPoemVersions, type PoemVersion } from '../utils/poemVersions';
import { getOrCreateShare } from '../utils/sharedCollections';
import { syncLocalComments } from '../utils/poemComments';
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
  const { poems, createPoem, createPoemAt, createManyPoems, updatePoem, updatePoemOrders, deletePoem, loading: loadingPoems } = usePoems(id);
  const [processingUpload, setProcessingUpload] = useState(false);
  const processingRef = useRef(false); // Sync flag to prevent duplicate uploads
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [versionsByPoem, setVersionsByPoem] = useState<Record<string, PoemVersion[]>>({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareCommentsDefault, setShareCommentsDefault] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

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
      const key = poem.section_id ?? null;
      if (!poemsBySection.has(key)) poemsBySection.set(key, []);
      poemsBySection.get(key)!.push(poem);
    });

    const sectionMap = new Map(sections.map(s => [s.id, s]));
    const orderedSections = [...sections].sort((a, b) => a.sort_order - b.sort_order);
    const globalOrdered: Array<{ poem: typeof poems[number]; sectionId: string | null }> = [];

    const rootPoems = (poemsBySection.get(null) || []).slice().sort((a, b) => a.sort_order - b.sort_order);
    rootPoems.forEach(poem => globalOrdered.push({ poem, sectionId: null }));

    orderedSections.forEach(section => {
      const sectionPoems = (poemsBySection.get(section.id) || []).slice().sort((a, b) => a.sort_order - b.sort_order);
      sectionPoems.forEach(poem => globalOrdered.push({ poem, sectionId: section.id }));
    });

    globalOrdered.forEach((entry, idx) => {
      const orderPrefix = String(idx + 1).padStart(2, '0');
      const baseTitle = entry.poem.title.replace(/[^a-zA-Z0-9]/g, '-');
      const filename = `${orderPrefix} - ${baseTitle || 'Untitled'}.md`;
      if (entry.sectionId) {
        const section = sectionMap.get(entry.sectionId);
        if (section) {
          zip.file(`${section.name}/${filename}`, entry.poem.content);
        } else {
          zip.file(filename, entry.poem.content);
        }
      } else {
        zip.file(filename, entry.poem.content);
      }
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

  const handleShare = async () => {
    if (!collection || !user) return;
    setShowShareModal(true);
  };

  const handleGenerateShare = async () => {
    if (!collection || !user) return;
    setShareBusy(true);
    setShareError(null);
    await Promise.all(poems.map(poem => syncLocalComments(poem.id, user.id)));
    const share = await getOrCreateShare(collection.id, user.id, shareCommentsDefault);
    if (share) {
      setShareLink(`${window.location.origin}/share/${share.token}`);
    } else {
      setShareLink(null);
      setShareError('Sharing is not set up yet. Please run the share SQL in Supabase.');
    }
    setShareBusy(false);
  };

  const handleDeletePoem = async (poemId: string, title: string) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      await deletePoem(poemId);
    }
  };

  const handlePreviewVersion = (poem: { id: string; title: string; content: string }, version: PoemVersion) => {
    navigate(`/?poem=${poem.id}&version=${version.id}`);
  };

  const handleCreatePoem = async () => {
    const created = await createPoem('Untitled', '', null, null);
    if (created) {
      navigate(`/?poem=${created.id}`);
    }
  };

  const handleInsertPoemAfter = async (sectionId: string | null, index: number) => {
    const created = await createPoemAt('Untitled', '', sectionId, index + 1);
    if (created) {
      navigate(`/?poem=${created.id}`);
    }
  };

  const getSectionKey = (sectionId: string | null) => sectionId ?? 'root';

  const poemsBySection = useMemo(() => {
    const grouped = new Map<string, typeof poems>();
    poems.forEach(poem => {
      const key = getSectionKey(poem.section_id);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(poem);
    });
    grouped.forEach((list, key) => {
      grouped.set(key, [...list].sort((a, b) => a.sort_order - b.sort_order));
    });
    return grouped;
  }, [poems]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activePoem = poems.find(poem => poem.id === active.id);
    if (!activePoem) return;

    const overId = over.id as string;
    const overPoem = poems.find(poem => poem.id === overId);
    const overSectionId = overId.startsWith('section-') ? overId.replace('section-', '') : null;

    const fromSectionId = activePoem.section_id ?? null;
    const targetSectionId = overPoem
      ? (overPoem.section_id ?? null)
      : overSectionId === 'root'
        ? null
        : overSectionId;
    if (targetSectionId === undefined) return;

    const fromKey = getSectionKey(fromSectionId);
    const toKey = getSectionKey(targetSectionId);

    const fromList = [...(poemsBySection.get(fromKey) || [])];
    const toList = fromKey === toKey ? fromList : [...(poemsBySection.get(toKey) || [])];

    const fromIndex = fromList.findIndex(poem => poem.id === active.id);
    if (fromIndex === -1) return;

    if (fromKey === toKey) {
      const toIndex = toList.findIndex(poem => poem.id === overId);
      if (toIndex === -1) return;
      const reordered = arrayMove(fromList, fromIndex, toIndex);
      const updates = reordered.map((poem, idx) => ({
        id: poem.id,
        section_id: targetSectionId,
        sort_order: idx,
      }));
      await updatePoemOrders(updates);
      return;
    }

    const [moved] = fromList.splice(fromIndex, 1);
    const insertIndex = overPoem ? toList.findIndex(poem => poem.id === overId) : toList.length;
    toList.splice(insertIndex < 0 ? toList.length : insertIndex, 0, { ...moved, section_id: targetSectionId });

    const updates = [
      ...fromList.map((poem, idx) => ({
        id: poem.id,
        section_id: fromSectionId,
        sort_order: idx,
      })),
      ...toList.map((poem, idx) => ({
        id: poem.id,
        section_id: targetSectionId,
        sort_order: idx,
      })),
    ];
    await updatePoemOrders(updates);
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

  const sectionMap = new Map(sections.map(s => [s.id, s]));
  const orderedSections = [...sections].sort((a, b) => a.sort_order - b.sort_order);
  const rootPoems = poemsBySection.get('root') || [];

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
            <button className="export-button" onClick={handleCreatePoem}>
              New Poem
            </button>
            <button className="export-button" onClick={handleExport} disabled={poems.length === 0}>
              Export as ZIP
            </button>
            <button className="export-button" onClick={handleShare} disabled={shareBusy}>
              {shareBusy ? 'Sharing...' : 'Share'}
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
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="poems-container">
              {/* Root level poems */}
              {rootPoems.length > 0 && (
                <SectionDropTarget sectionId="root">
                  <div className="poems-section">
                    <SortableContext items={rootPoems.map(poem => poem.id)} strategy={rectSortingStrategy}>
                      <div className="poems-grid">
                        {rootPoems.map((poem, idx) => (
                          <SortablePoemCard
                            key={poem.id}
                            poem={poem}
                            onDelete={handleDeletePoem}
                            onToggleVersions={toggleVersions}
                            expanded={expandedVersions.has(poem.id)}
                            versions={versionsByPoem[poem.id] || []}
                            onRestoreVersion={handleRestoreVersion}
                            onInsertAfter={() => handleInsertPoemAfter(null, idx)}
                            onPreviewVersion={handlePreviewVersion}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </div>
                </SectionDropTarget>
              )}

              {/* Sectioned poems */}
              {orderedSections.map((section) => {
                const sectionPoems = poemsBySection.get(section.id) || [];
                if (sectionPoems.length === 0) return null;
                return (
                  <SectionDropTarget key={section.id} sectionId={section.id}>
                    <div className="poems-section">
                      <h2 className="section-title">{section.name}</h2>
                      <SortableContext items={sectionPoems.map(poem => poem.id)} strategy={rectSortingStrategy}>
                        <div className="poems-grid">
                          {sectionPoems.map((poem, idx) => (
                            <SortablePoemCard
                              key={poem.id}
                              poem={poem}
                              onDelete={handleDeletePoem}
                              onToggleVersions={toggleVersions}
                              expanded={expandedVersions.has(poem.id)}
                              versions={versionsByPoem[poem.id] || []}
                              onRestoreVersion={handleRestoreVersion}
                              onInsertAfter={() => handleInsertPoemAfter(poem.section_id, idx)}
                              onPreviewVersion={handlePreviewVersion}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </div>
                  </SectionDropTarget>
                );
              })}
            </div>
          </DndContext>
        )}

        {showShareModal && (
          <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
            <div className="share-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Share Collection</h2>
              <p>This link gives read-only access to your collection and its comments.</p>
              <div className="share-comments-choice">
                <div className="share-comments-label">Show comments by default?</div>
                <label className="share-comments-option">
                  <input
                    type="radio"
                    name="share-comments-default"
                    checked={shareCommentsDefault}
                    onChange={() => setShareCommentsDefault(true)}
                  />
                  Show comments
                </label>
                <label className="share-comments-option">
                  <input
                    type="radio"
                    name="share-comments-default"
                    checked={!shareCommentsDefault}
                    onChange={() => setShareCommentsDefault(false)}
                  />
                  Hide comments
                </label>
              </div>
              {shareError && (
                <div className="share-error">{shareError}</div>
              )}
              <div className="share-link-row">
                <input type="text" readOnly value={shareLink || ''} />
                <button
                  className="export-button"
                  onClick={async () => {
                    if (!shareLink) return;
                    try {
                      await navigator.clipboard.writeText(shareLink);
                    } catch {
                      const textarea = document.createElement('textarea');
                      textarea.value = shareLink;
                      textarea.style.position = 'fixed';
                      textarea.style.opacity = '0';
                      document.body.appendChild(textarea);
                      textarea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textarea);
                    }
                  }}
                >
                  Copy
                </button>
              </div>
              <div className="share-modal-actions">
                <div className="share-modal-actions-left">
                  <button
                    className="export-button"
                    onClick={() => setShowShareModal(false)}
                  >
                    Close
                  </button>
                </div>
                <div className="share-modal-actions-right">
                  <button className="export-button" onClick={handleGenerateShare} disabled={shareBusy}>
                    {shareBusy
                      ? 'Generating...'
                      : shareLink
                        ? 'Update link'
                        : 'Generate link'}
                  </button>
                  {shareLink && (
                    <a className="share-open-link" href={shareLink} target="_blank" rel="noopener noreferrer">
                      Open
                    </a>
                  )}
                </div>
              </div>
            </div>
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

function SectionDropTarget({ sectionId, children }: { sectionId: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `section-${sectionId}`,
    data: { sectionId },
  });

  return (
    <div ref={setNodeRef} className={`poems-section-drop ${isOver ? 'is-over' : ''}`}>
      {children}
    </div>
  );
}

function SortablePoemCard({
  poem,
  onDelete,
  onToggleVersions,
  expanded,
  versions,
  onRestoreVersion,
  onInsertAfter,
  onPreviewVersion,
}: {
  poem: { id: string; title: string; content: string; section_id: string | null };
  onDelete: (poemId: string, title: string) => void;
  onToggleVersions: (poemId: string) => void;
  expanded: boolean;
  versions: PoemVersion[];
  onRestoreVersion: (poem: { id: string; title: string; content: string }, version: PoemVersion) => void;
  onInsertAfter?: () => void;
  onPreviewVersion: (poem: { id: string; title: string; content: string }, version: PoemVersion) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: poem.id,
    data: { sectionId: poem.section_id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="poem-card">
      <Link to={`/?poem=${poem.id}`} className="poem-link">
        <h3>{poem.title}</h3>
        <p className="poem-preview">
          {poem.content.substring(0, 100)}
          {poem.content.length > 100 ? '...' : ''}
        </p>
      </Link>
      <div className="poem-card-actions">
        <button className="poem-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
          ⋮⋮
        </button>
        {onInsertAfter && (
          <button className="poem-insert-btn" onClick={onInsertAfter} title="Insert new poem after">
            +
          </button>
        )}
        <button className="versions-btn" onClick={() => onToggleVersions(poem.id)}>
          Versions ({versions.length})
        </button>
        <button className="delete-poem-btn" onClick={() => onDelete(poem.id, poem.title)} title="Delete poem">
          &times;
        </button>
      </div>
      {expanded && (
        <div className="poem-versions">
          {versions.length === 0 ? (
            <div className="poem-version-empty">No saved versions yet.</div>
          ) : (
            versions.map(version => (
              <div key={version.id} className="poem-version-item">
                <button
                  className="poem-version-meta"
                  onClick={() => onPreviewVersion(poem, version)}
                  title="Open this version"
                >
                  <span className="poem-version-date">
                    {new Date(version.created_at).toLocaleString()}
                  </span>
                  <span className="poem-version-title">{version.title}</span>
                </button>
                <p className="poem-version-preview">
                  {version.content.substring(0, 120)}
                  {version.content.length > 120 ? '...' : ''}
                </p>
                <button className="poem-version-restore" onClick={() => onRestoreVersion(poem, version)}>
                  Restore
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
