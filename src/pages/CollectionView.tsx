import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { EditorLayout } from '../components/EditorLayout';
import { SEOHead } from '../components/SEOHead';
import { useAuth } from '../hooks/useAuth';
import { useSections } from '../hooks/useCollections';
import { usePoems } from '../hooks/usePoems';
import { supabase } from '../lib/supabase';
import { fetchPoemVersionsForPoems, fetchPoemVersions, addPoemVersion, ensureInitialPoemVersion, migrateLocalPoemVersions, filterVersionsForPoem, versionDisplayTitle, type PoemVersion } from '../utils/poemVersions';
import { getOrCreateShare } from '../utils/sharedCollections';
import { syncLocalComments } from '../utils/poemComments';
import { collectionDroppableId, planCollectionPoemDrag, poemSlotId } from '../utils/poemDrag';
import { findPoemDropId } from '../utils/pointerPoemDrag';
import { shouldShowCollectionEmptyState } from '../utils/collectionShelf';
import type { Collection } from '../types/database';
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
  const { sections, createSection, createManySections, renameSection, deleteSection } = useSections(id);
  const { poems, createPoem, createPoemAt, createManyPoems, updatePoem, updatePoemOrders, deletePoem, loading: loadingPoems, refetch: refetchPoems } = usePoems(id);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionNameInput, setSectionNameInput] = useState('');
  const [addingSectionName, setAddingSectionName] = useState<string | null>(null);
  const [processingUpload, setProcessingUpload] = useState(false);
  const processingRef = useRef(false); // Sync flag to prevent duplicate uploads
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [versionsByPoem, setVersionsByPoem] = useState<Record<string, PoemVersion[]>>({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareCommentsDefault, setShareCommentsDefault] = useState(true);
  const [activeDrag, setActiveDrag] = useState<{
    poemId: string;
    x: number;
    y: number;
    overId: string | null;
  } | null>(null);

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

      // Build content with alignment markup when non-left-aligned
      const align = entry.poem.formatting?.align;
      let fileContent = `# ${entry.poem.title}\n\n`;
      if (align && align !== 'left') {
        const escapedLines = entry.poem.content.split('\n').map(l =>
          l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        ).join('<br />\n');
        fileContent += `<div style="text-align:${align}">\n${escapedLines}\n</div>`;
      } else {
        fileContent += entry.poem.content;
      }

      if (entry.sectionId) {
        const section = sectionMap.get(entry.sectionId);
        if (section) {
          zip.file(`${section.name}/${filename}`, fileContent);
        } else {
          zip.file(filename, fileContent);
        }
      } else {
        zip.file(filename, fileContent);
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
    if (filterVersionsForPoem([version], poem, poems).length === 0) return;
    navigate(`/?poem=${poem.id}&version=${version.id}`, {
      state: { fromCollectionId: id, fromCollectionName: collection?.name },
    });
  };

  const handleRenameCollection = async (newName: string) => {
    if (!collection || !id || !supabase) return;
    try {
      const { error } = await supabase
        .from('collections')
        .update({ name: newName, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (!error) {
        setCollection({ ...collection, name: newName });
      }
    } catch (err) {
      console.error('Failed to rename collection:', err);
    }
  };

  const openPoemInCollection = (poemId: string) => {
    navigate(`/?poem=${poemId}`, {
      state: { fromCollectionId: id, fromCollectionName: collection?.name },
    });
  };

  const handleCreatePoem = async (sectionId: string | null = null) => {
    const created = await createPoem('Untitled', '', sectionId, null);
    if (created) {
      openPoemInCollection(created.id);
    }
  };

  const handleInsertPoemAfter = async (sectionId: string | null, index: number) => {
    const created = await createPoemAt('Untitled', '', sectionId, index + 1);
    if (created) {
      openPoemInCollection(created.id);
    }
  };

  const handleAddPoemToSection = async (sectionId: string) => {
    await createPoem('Untitled', '', sectionId, null);
  };

  const handleAddSection = async () => {
    setAddingSectionName('');
  };

  const handleConfirmAddSection = async () => {
    if (addingSectionName === null) return;
    const name = addingSectionName.trim();
    if (!name) {
      setAddingSectionName(null);
      return;
    }
    await createSection(name);
    setAddingSectionName(null);
  };

  const handleDeleteSection = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const sectionPoems = poemsBySection.get(sectionId) || [];
    const msg = sectionPoems.length > 0
      ? `Delete section "${section?.name}"? Its ${sectionPoems.length} poem(s) will be moved to the root level.`
      : `Delete section "${section?.name}"?`;
    if (!confirm(msg)) return;
    await deleteSection(sectionId);
    // Refetch poems since they've been moved to root
    await refetchPoems();
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

  const applyDrop = async (poemId: string, overId: string | null) => {
    if (!overId) return;
    const updates = planCollectionPoemDrag(
      poems.map(poem => ({
        id: poem.id,
        section_id: poem.section_id ?? null,
        sort_order: poem.sort_order,
      })),
      poemId,
      overId
    );
    if (!updates || updates.length === 0) return;
    await updatePoemOrders(updates);
  };

  const beginPointerDrag = (event: React.PointerEvent<HTMLElement>, poemId: string) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const originX = event.clientX;
    const originY = event.clientY;
    let started = false;

    const onMove = (moveEvent: PointerEvent) => {
      const distance = Math.hypot(moveEvent.clientX - originX, moveEvent.clientY - originY);
      if (!started && distance < 4) return;
      started = true;
      setActiveDrag({
        poemId,
        x: moveEvent.clientX,
        y: moveEvent.clientY,
        overId: findPoemDropId(moveEvent.clientX, moveEvent.clientY, poemId),
      });
    };

    const finish = (endEvent: PointerEvent) => {
      try {
        handle.releasePointerCapture(endEvent.pointerId);
      } catch {
        // Capture may already be released.
      }
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      const overId = started ? findPoemDropId(endEvent.clientX, endEvent.clientY, poemId) : null;
      setActiveDrag(null);
      void applyDrop(poemId, overId);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
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
    if (filterVersionsForPoem([version], poem, poems).length === 0) return;
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
      <EditorLayout>
        <div className="collection-view-page">
          <div className="loading">Loading...</div>
        </div>
      </EditorLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <EditorLayout>
        <div className="collection-view-page">
          <div className="not-authenticated">
            <p>Please sign in to view your collections.</p>
            <Link to="/my-collections">Go to Collections</Link>
          </div>
        </div>
      </EditorLayout>
    );
  }

  if (!collection) {
    return (
      <EditorLayout>
        <div className="collection-view-page">
          <div className="not-found">
            <h1>Collection Not Found</h1>
            <Link to="/my-collections">Back to Collections</Link>
          </div>
        </div>
      </EditorLayout>
    );
  }

  const orderedSections = [...sections].sort((a, b) => a.sort_order - b.sort_order);
  const rootPoems = poemsBySection.get('root') || [];
  const visibleSectionCount = sections.length;
  const showEmptyState = shouldShowCollectionEmptyState({
    poemCount: poems.length,
    sectionCount: sections.length,
    isAddingSection: addingSectionName !== null,
  });
  const activeDragPoem = poems.find(poem => poem.id === activeDrag?.poemId) || null;

  return (
    <EditorLayout>
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
          {editingTitle ? (
            <input
              className="collection-title-input"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={() => {
                const trimmed = titleInput.trim();
                if (trimmed && trimmed !== collection.name) {
                  handleRenameCollection(trimmed);
                }
                setEditingTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const trimmed = titleInput.trim();
                  if (trimmed && trimmed !== collection.name) {
                    handleRenameCollection(trimmed);
                  }
                  setEditingTitle(false);
                } else if (e.key === 'Escape') {
                  setEditingTitle(false);
                }
              }}
              autoFocus
            />
          ) : (
            <h1
              className="collection-title-editable"
              onDoubleClick={() => {
                setTitleInput(collection.name);
                setEditingTitle(true);
              }}
              title="Double-click to rename"
            >
              {collection.name}<span className="edit-hint">&#9998;</span>
            </h1>
          )}
          <div className="collection-actions">
            <button className="export-button" onClick={() => handleCreatePoem(null)}>
              New Poem
            </button>
            <button className="export-button" onClick={handleAddSection}>
              New Section
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
        ) : showEmptyState ? (
          <div className="no-poems">
            <p>This collection is empty. You can start by adding sections to organize your poems, or jump straight in with a new poem.</p>
            <p className="no-poems-hint">It's perfectly fine to have just one poem in a collection. You can always add more later.</p>
            <div className="no-poems-actions">
              <button className="export-button" onClick={handleAddSection}>
                Add a Section
              </button>
              <button className="export-button" onClick={() => handleCreatePoem(null)}>
                Write a Poem
              </button>
            </div>
          </div>
        ) : (
          <>
          <div className={`poems-container ${activeDrag ? 'is-dragging-poem' : ''}`}>
              {(rootPoems.length > 0 || orderedSections.length > 0) && (
                <SectionDropTarget sectionId="root" isOver={activeDrag?.overId === collectionDroppableId(null)}>
                  <div className="poems-section">
                    {rootPoems.length > 0 && (
                      <div className="poems-grid">
                        {rootPoems.map((poem, idx) => (
                          <SortablePoemCard
                            key={poem.id}
                            poem={poem}
                            collectionId={id}
                            onDelete={handleDeletePoem}
                            onToggleVersions={toggleVersions}
                            expanded={expandedVersions.has(poem.id)}
                            versions={filterVersionsForPoem(versionsByPoem[poem.id] || [], poem, poems)}
                            onRestoreVersion={handleRestoreVersion}
                            onInsertAfter={() => handleInsertPoemAfter(null, idx)}
                            onPreviewVersion={handlePreviewVersion}
                            onBeginDrag={beginPointerDrag}
                            isDropTarget={activeDrag?.overId === poemSlotId(poem.id)}
                            isDragging={activeDrag?.poemId === poem.id}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </SectionDropTarget>
              )}

              {orderedSections.map((section) => {
                const sectionPoems = poemsBySection.get(section.id) || [];
                return (
                  <SectionDropTarget key={section.id} sectionId={section.id} isOver={activeDrag?.overId === collectionDroppableId(section.id)}>
                    <div className="poems-section">
                      <div className="section-header-row">
                        {editingSectionId === section.id ? (
                          <input
                            className="section-title-input"
                            value={sectionNameInput}
                            onChange={(e) => setSectionNameInput(e.target.value)}
                            onBlur={() => {
                              const trimmed = sectionNameInput.trim();
                              if (trimmed && trimmed !== section.name) {
                                renameSection(section.id, trimmed);
                              }
                              setEditingSectionId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const trimmed = sectionNameInput.trim();
                                if (trimmed && trimmed !== section.name) {
                                  renameSection(section.id, trimmed);
                                }
                                setEditingSectionId(null);
                              } else if (e.key === 'Escape') {
                                setEditingSectionId(null);
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <h2
                            className="section-title section-title-editable"
                            onDoubleClick={() => {
                              setSectionNameInput(section.name);
                              setEditingSectionId(section.id);
                            }}
                            title="Double-click to rename"
                          >
                            {section.name}<span className="edit-hint">&#9998;</span>
                          </h2>
                        )}
                        <button
                          type="button"
                          className="section-delete-btn"
                          onClick={() => handleDeleteSection(section.id)}
                          title="Delete section"
                        >
                          &times;
                        </button>
                      </div>
                      {sectionPoems.length > 0 ? (
                        <div className="poems-grid">
                          {sectionPoems.map((poem, idx) => (
                            <SortablePoemCard
                              key={poem.id}
                              poem={poem}
                              collectionId={id}
                              onDelete={handleDeletePoem}
                              onToggleVersions={toggleVersions}
                              expanded={expandedVersions.has(poem.id)}
                              versions={filterVersionsForPoem(versionsByPoem[poem.id] || [], poem, poems)}
                              onRestoreVersion={handleRestoreVersion}
                              onInsertAfter={() => handleInsertPoemAfter(poem.section_id, idx)}
                              onPreviewVersion={handlePreviewVersion}
                              onBeginDrag={beginPointerDrag}
                              isDropTarget={activeDrag?.overId === poemSlotId(poem.id)}
                              isDragging={activeDrag?.poemId === poem.id}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="section-empty-note">
                          <p>Drag poems here or delete the section.</p>
                          <button
                            type="button"
                            className="section-add-poem-btn"
                            onClick={() => handleAddPoemToSection(section.id)}
                          >
                            Add a poem
                          </button>
                        </div>
                      )}
                    </div>
                  </SectionDropTarget>
                );
              })}

              {addingSectionName !== null && (
                <div className="poems-section add-section-row">
                  <input
                    className="section-title-input"
                    value={addingSectionName}
                    onChange={(e) => setAddingSectionName(e.target.value)}
                    onBlur={handleConfirmAddSection}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirmAddSection();
                      else if (e.key === 'Escape') setAddingSectionName(null);
                    }}
                    placeholder="Section name..."
                    autoFocus
                  />
                </div>
              )}
            </div>
            {activeDrag && activeDragPoem && (
              <div
                className="poem-card poem-card-overlay"
                style={{ left: activeDrag.x + 12, top: activeDrag.y + 12 }}
              >
                <h3>{activeDragPoem.title || 'Untitled'}</h3>
                <p className="poem-preview">
                  {activeDragPoem.content.substring(0, 80)}
                  {activeDragPoem.content.length > 80 ? '...' : ''}
                </p>
              </div>
            )}
          </>
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
          {visibleSectionCount > 0 && (
            <span> in {visibleSectionCount} section{visibleSectionCount !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </EditorLayout>
  );
}

function SectionDropTarget({
  sectionId,
  isOver,
  children,
}: {
  sectionId: string;
  isOver: boolean;
  children: React.ReactNode;
}) {
  const droppableId = collectionDroppableId(sectionId === 'root' ? null : sectionId);
  return (
    <div data-poem-drop={droppableId} className={`poems-section-drop ${isOver ? 'is-over' : ''}`}>
      {children}
    </div>
  );
}

function SortablePoemCard({
  poem,
  collectionId,
  onDelete,
  onToggleVersions,
  expanded,
  versions,
  onRestoreVersion,
  onInsertAfter,
  onPreviewVersion,
  onBeginDrag,
  isDropTarget,
  isDragging,
}: {
  poem: { id: string; title: string; content: string; section_id: string | null };
  collectionId?: string;
  onDelete: (poemId: string, title: string) => void;
  onToggleVersions: (poemId: string) => void;
  expanded: boolean;
  versions: PoemVersion[];
  onRestoreVersion: (poem: { id: string; title: string; content: string }, version: PoemVersion) => void;
  onInsertAfter?: () => void;
  onPreviewVersion: (poem: { id: string; title: string; content: string }, version: PoemVersion) => void;
  onBeginDrag: (event: React.PointerEvent<HTMLElement>, poemId: string) => void;
  isDropTarget: boolean;
  isDragging: boolean;
}) {
  return (
    <div
      data-poem-drop={poemSlotId(poem.id)}
      className={`poem-card ${isDropTarget ? 'is-drop-target' : ''} ${isDragging ? 'is-dragging' : ''}`}
    >
      <Link
        to={`/?poem=${poem.id}`}
        state={collectionId ? { fromCollectionId: collectionId } : undefined}
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
          type="button"
          className="poem-drag-handle"
          title="Drag to reorder"
          aria-label={`Drag ${poem.title || 'Untitled'} to reorder`}
          onPointerDown={(event) => onBeginDrag(event, poem.id)}
        >
          ⋮⋮
        </button>
        {onInsertAfter && (
          <button type="button" className="poem-insert-btn" onClick={onInsertAfter} title="Insert new poem after">
            +
          </button>
        )}
        <button type="button" className="versions-btn" onClick={() => onToggleVersions(poem.id)}>
          Versions ({versions.length})
        </button>
        <button
          type="button"
          className="delete-poem-btn"
          onClick={() => onDelete(poem.id, poem.title)}
          title="Delete poem"
          aria-label={`Delete ${poem.title || 'Untitled'}`}
        >
          Delete
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
                  type="button"
                  className="poem-version-meta"
                  onClick={() => onPreviewVersion(poem, version)}
                  title="Open this version"
                >
                  <span className="poem-version-date">
                    {new Date(version.created_at).toLocaleString()}
                  </span>
                  <span className="poem-version-title">{versionDisplayTitle(version.title, poem.title)}</span>
                </button>
                <p className="poem-version-preview">
                  {version.content.substring(0, 120)}
                  {version.content.length > 120 ? '...' : ''}
                </p>
                <button type="button" className="poem-version-restore" onClick={() => onRestoreVersion(poem, version)}>
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
