import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useCollections } from '../hooks/useCollections';
import './SaveToCollectionModal.css';

interface SaveToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  poemTitle: string;
  poemContent: string;
  formatting?: Record<string, unknown> | null;
  onSaved: (collectionId: string, poemId: string) => void;
}

export function SaveToCollectionModal({
  isOpen,
  onClose,
  poemTitle,
  poemContent,
  formatting,
  onSaved,
}: SaveToCollectionModalProps) {
  const { user } = useAuth();
  const { collections, loading, createCollection } = useCollections();
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    return localStorage.getItem('lastUsedCollectionId');
  });
  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen || !user || !supabase) return null;
  const sb = supabase;

  const handleSave = async (collectionId: string) => {
    setSaving(true);
    try {
      const { data, error } = await sb
        .from('poems')
        .insert({
          collection_id: collectionId,
          title: poemTitle.trim() || 'Untitled',
          content: poemContent,
          formatting: formatting || null,
          sort_order: 0,
        })
        .select('id')
        .single();

      if (error) throw error;

      localStorage.setItem('lastUsedCollectionId', collectionId);
      onSaved(collectionId, data.id);
    } catch (err) {
      console.error('Failed to save poem to collection:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAndSave = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const collection = await createCollection(newName.trim());
      if (collection) {
        await handleSave(collection.id);
      }
    } catch (err) {
      console.error('Failed to create collection:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = () => {
    if (showNewInput) {
      handleCreateAndSave();
    } else if (selectedId) {
      handleSave(selectedId);
    }
  };

  // Auto-select first collection if none remembered
  const effectiveSelected = selectedId && collections.some(c => c.id === selectedId)
    ? selectedId
    : collections[0]?.id || null;

  return (
    <div className="save-modal-overlay" onClick={onClose}>
      <div className="save-modal" onClick={e => e.stopPropagation()}>
        <h2>Save to Collection</h2>
        <p className="save-modal-subtitle">
          Choose where to save "{poemTitle.trim() || 'Untitled'}"
        </p>

        {loading ? (
          <div className="save-modal-loading">Loading collections...</div>
        ) : (
          <div className="save-modal-list">
            {collections.map(c => (
              <button
                key={c.id}
                className={`save-modal-item ${effectiveSelected === c.id && !showNewInput ? 'selected' : ''}`}
                onClick={() => { setSelectedId(c.id); setShowNewInput(false); }}
              >
                {c.name}
              </button>
            ))}
            {showNewInput ? (
              <div className="save-modal-new-input">
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Collection name"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newName.trim()) handleCreateAndSave();
                  }}
                />
              </div>
            ) : (
              <button
                className="save-modal-item save-modal-new"
                onClick={() => { setShowNewInput(true); setNewName(''); }}
              >
                + New Collection
              </button>
            )}
          </div>
        )}

        <div className="save-modal-actions">
          <button className="save-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="save-modal-save"
            onClick={handleSubmit}
            disabled={saving || (!showNewInput && !effectiveSelected) || (showNewInput && !newName.trim())}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
