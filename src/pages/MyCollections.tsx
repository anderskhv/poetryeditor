import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EditorLayout } from '../components/EditorLayout';
import { SEOHead } from '../components/SEOHead';
import { useAuth } from '../hooks/useAuth';
import { useCollections } from '../hooks/useCollections';
import { AuthModal } from '../components/AuthModal';
import { CollectionRenameField } from '../components/collection/CollectionRenameField';
import { formatCollectionUpdatedAt, formatPoemCount, nextCollectionName } from '../utils/collectionShelf';
import './MyCollections.css';

interface ParsedFolder {
  name: string;
  sections: Map<string, string[]>; // sectionPath -> fileNames
  poems: Array<{
    title: string;
    content: string;
    sectionPath: string | null;
    filename: string;
  }>;
}

// Natural sort comparator for strings like "1. Poem", "2. Poem", "10. Poem"
function naturalCompare(a: string, b: string): number {
  const aParts = a.split(/(\d+)/);
  const bParts = b.split(/(\d+)/);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || '';
    const bPart = bParts[i] || '';

    const aNum = parseInt(aPart, 10);
    const bNum = parseInt(bPart, 10);

    if (!isNaN(aNum) && !isNaN(bNum)) {
      if (aNum !== bNum) return aNum - bNum;
    } else {
      const cmp = aPart.localeCompare(bPart);
      if (cmp !== 0) return cmp;
    }
  }
  return 0;
}

export function MyCollections() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { collections, loading, error, refetch, createCollection, updateCollection, deleteCollection } = useCollections();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);
  const [parsedFolder, setParsedFolder] = useState<ParsedFolder | null>(null);
  const [uploading, setUploading] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const poems: ParsedFolder['poems'] = [];
    const sections = new Map<string, string[]>();
    let folderName = '';

    // Sort files by path using natural sort (so "1. Poem" < "2. Poem" < "10. Poem")
    const sortedFiles = Array.from(files).sort((a, b) =>
      naturalCompare(a.webkitRelativePath, b.webkitRelativePath)
    );

    for (const file of sortedFiles) {
      // Only process .md files
      if (!file.name.endsWith('.md')) continue;

      // Parse path to get folder structure
      const pathParts = file.webkitRelativePath.split('/');
      if (!folderName && pathParts.length > 0) {
        folderName = pathParts[0];
      }

      // Get section path (everything between root folder and filename)
      const sectionPath = pathParts.length > 2
        ? pathParts.slice(1, -1).join('/')
        : null;

      if (sectionPath) {
        if (!sections.has(sectionPath)) {
          sections.set(sectionPath, []);
        }
        sections.get(sectionPath)!.push(file.name);
      }

      // Read file content
      const content = await file.text();

      // Title is filename without .md
      const title = file.name.replace(/\.md$/, '');

      poems.push({
        title,
        content,
        sectionPath,
        filename: file.name,
      });
    }

    setParsedFolder({
      name: folderName,
      sections,
      poems,
    });
    setCollectionName(folderName);
    setShowUploader(true);
  };

  const handleUpload = async () => {
    if (!parsedFolder || !collectionName.trim()) return;

    setUploading(true);
    try {
      // Create collection
      const collection = await createCollection(collectionName.trim());
      if (!collection) throw new Error('Failed to create collection');

      // Navigate to the new collection
      // Sort sections by natural order for proper display
      const sortedSections = Array.from(parsedFolder.sections.keys()).sort(naturalCompare);

      navigate(`/my-collections/${collection.id}`, {
        state: {
          pendingUpload: {
            sections: sortedSections,
            poems: parsedFolder.poems,
          }
        }
      });
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateNewCollection = async () => {
    if (!newCollectionName.trim()) return;
    setCreatingNew(true);
    try {
      const collection = await createCollection(newCollectionName.trim());
      if (collection) {
        navigate(`/my-collections/${collection.id}`);
      }
    } catch (err) {
      console.error('Failed to create collection:', err);
    } finally {
      setCreatingNew(false);
    }
  };

  const handleDeleteCollection = async (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" and all its poems? This cannot be undone.`)) {
      await deleteCollection(id);
    }
  };

  const beginRenameCollection = (id: string, name: string) => {
    setRenamingId(id);
    setRenameInput(name);
  };

  const commitRenameCollection = async () => {
    if (!renamingId) return;
    const current = collections.find(collection => collection.id === renamingId);
    const nextName = nextCollectionName(current?.name ?? '', renameInput);
    const id = renamingId;
    setRenamingId(null);
    if (nextName) {
      await updateCollection(id, nextName);
    }
  };

  const cancelRenameCollection = () => {
    setRenamingId(null);
    setRenameInput('');
  };

  if (authLoading) {
    return (
      <EditorLayout>
        <div className="my-collections-page">
          <div className="loading">Loading...</div>
        </div>
      </EditorLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <EditorLayout>
        <SEOHead
          title="My Collections - Poetry Editor"
          description="Sign in to save and organize your poetry collections."
          canonicalPath="/my-collections"
        />
        <div className="my-collections-page">
          <div className="not-authenticated">
            <h1>My Collections</h1>
            <p>Sign in to save your poems to the cloud and access them anywhere.</p>
            <button className="sign-in-cta" onClick={() => setShowAuthModal(true)}>
              Sign In to Get Started
            </button>
          </div>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </EditorLayout>
    );
  }

  return (
    <EditorLayout>
      <SEOHead
        title="My Collections - Poetry Editor"
        description="Manage your poetry collections."
        canonicalPath="/my-collections"
      />
      <div className="my-collections-page">
        <div className="collections-header">
          <h1>My Collections</h1>
          <div className="collections-actions">
            <input
              ref={fileInputRef}
              type="file"
              /* @ts-expect-error webkitdirectory is not in types */
              webkitdirectory=""
              multiple
              onChange={handleFolderSelect}
              style={{ display: 'none' }}
            />
            <button
              className="new-collection-button"
              onClick={() => { setNewCollectionName(''); setShowNewCollection(true); }}
            >
              New Collection
            </button>
            <button
              type="button"
              className="upload-button upload-folder-button"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Folder
            </button>
            <p className="upload-folder-note">Upload a folder from a computer.</p>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading collections...</div>
        ) : error ? (
          <div className="collections-error" role="alert">
            <p>{error}</p>
            <button className="new-collection-button" onClick={() => refetch()}>
              Try again
            </button>
          </div>
        ) : collections.length === 0 ? (
          <div className="no-collections">
            <h2>No collections yet</h2>
            <p>Create a collection to organize and save your poems.</p>
            <div className="no-collections-actions">
              <button
                className="upload-button large"
                onClick={() => { setNewCollectionName(''); setShowNewCollection(true); }}
              >
                Create Your First Collection
              </button>
              <button
                type="button"
                className="upload-folder-link"
                onClick={() => fileInputRef.current?.click()}
              >
                Or upload a folder of markdown files
              </button>
              <p className="upload-folder-note">Upload a folder from a computer.</p>
            </div>
          </div>
        ) : (
          <div className="collections-grid">
            {collections.map(collection => (
              <div key={collection.id} className="collection-card">
                {renamingId === collection.id ? (
                  <div className="collection-card-edit">
                    <CollectionRenameField
                      className="collection-card-rename-input"
                      value={renameInput}
                      onChange={setRenameInput}
                      onCommit={commitRenameCollection}
                      onCancel={cancelRenameCollection}
                    />
                    <p className="collection-date">
                      {formatCollectionUpdatedAt(collection.updated_at)}
                    </p>
                    {formatPoemCount(collection.poem_count) && (
                      <p className="collection-poem-count">{formatPoemCount(collection.poem_count)}</p>
                    )}
                  </div>
                ) : (
                  <Link to={`/my-collections/${collection.id}`} className="collection-link">
                    <h2>{collection.name}</h2>
                    <p className="collection-date">
                      {formatCollectionUpdatedAt(collection.updated_at)}
                    </p>
                    {formatPoemCount(collection.poem_count) && (
                      <p className="collection-poem-count">{formatPoemCount(collection.poem_count)}</p>
                    )}
                  </Link>
                )}
                <div className="collection-card-actions">
                  {renamingId !== collection.id && (
                    <button
                      type="button"
                      className="rename-collection-btn"
                      onClick={() => beginRenameCollection(collection.id, collection.name)}
                      aria-label={`Rename ${collection.name}`}
                    >
                      Rename
                    </button>
                  )}
                  <button
                    type="button"
                    className="delete-collection-btn"
                    onClick={() => handleDeleteCollection(collection.id, collection.name)}
                    title="Delete collection"
                    aria-label={`Delete ${collection.name}`}
                  >
                    <span className="delete-collection-icon" aria-hidden="true">&times;</span>
                    <span className="delete-collection-label">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New Collection Modal */}
        {showNewCollection && (
          <div className="upload-modal-overlay" onClick={() => setShowNewCollection(false)}>
            <div className="upload-modal" onClick={e => e.stopPropagation()}>
              <h2>New Collection</h2>
              <div className="upload-form">
                <label>
                  Collection Name
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={e => setNewCollectionName(e.target.value)}
                    placeholder="My Poetry Collection"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newCollectionName.trim()) {
                        handleCreateNewCollection();
                      }
                    }}
                  />
                </label>
              </div>
              <div className="upload-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowNewCollection(false)}
                >
                  Cancel
                </button>
                <button
                  className="confirm-upload-button"
                  onClick={handleCreateNewCollection}
                  disabled={creatingNew || !newCollectionName.trim()}
                >
                  {creatingNew ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Preview Modal */}
        {showUploader && parsedFolder && (
          <div className="upload-modal-overlay" onClick={() => setShowUploader(false)}>
            <div className="upload-modal" onClick={e => e.stopPropagation()}>
              <h2>Upload Collection</h2>

              <div className="upload-form">
                <label>
                  Collection Name
                  <input
                    type="text"
                    value={collectionName}
                    onChange={e => setCollectionName(e.target.value)}
                    placeholder="My Poetry Collection"
                  />
                </label>
              </div>

              <div className="upload-preview">
                <h3>Preview</h3>
                <p>{parsedFolder.poems.length} poems found</p>

                {parsedFolder.sections.size > 0 && (
                  <div className="sections-preview">
                    <h4>Sections:</h4>
                    <ul>
                      {Array.from(parsedFolder.sections.keys()).sort(naturalCompare).map(section => (
                        <li key={section}>{section}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="poems-preview">
                  <h4>Poems:</h4>
                  <ul>
                    {parsedFolder.poems.slice(0, 10).map((poem, idx) => (
                      <li key={idx}>
                        {poem.sectionPath && <span className="poem-section">{poem.sectionPath}/</span>}
                        {poem.title}
                      </li>
                    ))}
                    {parsedFolder.poems.length > 10 && (
                      <li className="more-poems">...and {parsedFolder.poems.length - 10} more</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="upload-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowUploader(false)}
                >
                  Cancel
                </button>
                <button
                  className="confirm-upload-button"
                  onClick={handleUpload}
                  disabled={uploading || !collectionName.trim()}
                >
                  {uploading ? 'Creating...' : 'Create Collection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </EditorLayout>
  );
}
