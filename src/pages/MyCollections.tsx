import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { useAuth } from '../hooks/useAuth';
import { useCollections } from '../hooks/useCollections';
import { AuthModal } from '../components/AuthModal';
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

export function MyCollections() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { collections, loading, createCollection, deleteCollection } = useCollections();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
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

    for (const file of Array.from(files)) {
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
      navigate(`/my-collections/${collection.id}`, {
        state: {
          pendingUpload: {
            sections: Array.from(parsedFolder.sections.keys()),
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

  const handleDeleteCollection = async (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" and all its poems? This cannot be undone.`)) {
      await deleteCollection(id);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="my-collections-page">
          <div className="loading">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  return (
    <Layout>
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
              className="upload-button"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Folder
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading collections...</div>
        ) : collections.length === 0 ? (
          <div className="no-collections">
            <p>You don't have any collections yet.</p>
            <p>Upload a folder of markdown (.md) files to create your first collection.</p>
            <button
              className="upload-button large"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Your First Collection
            </button>
          </div>
        ) : (
          <div className="collections-grid">
            {collections.map(collection => (
              <div key={collection.id} className="collection-card">
                <Link to={`/my-collections/${collection.id}`} className="collection-link">
                  <h2>{collection.name}</h2>
                  <p className="collection-date">
                    Updated {new Date(collection.updated_at).toLocaleDateString()}
                  </p>
                </Link>
                <button
                  className="delete-collection-btn"
                  onClick={() => handleDeleteCollection(collection.id, collection.name)}
                  title="Delete collection"
                >
                  &times;
                </button>
              </div>
            ))}
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
                      {Array.from(parsedFolder.sections.keys()).map(section => (
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
    </Layout>
  );
}
