import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Collection, Section, CollectionInsert, SectionInsert } from '../types/database';
import { useAuth } from './useAuth';
import { touchCollectionUpdatedAt } from '../utils/touchCollection';

export function useCollections() {
  const { user } = useAuth();
  const userId = user?.id;
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    if (!userId || !supabase) {
      setCollections([]);
      setLoading(false);
      return;
    }

    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      setError('Could not load collections. Check your connection and try again.');
      setLoading(false);
    }, 8000);

    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (timedOut) return;
      if (error) throw error;
      const rows = (data as Collection[]) || [];
      if (rows.length === 0) {
        setCollections([]);
        return;
      }

      const { data: poemRows, error: poemError } = await supabase
        .from('poems')
        .select('collection_id')
        .in('collection_id', rows.map(row => row.id));

      if (poemError) {
        setCollections(rows);
        return;
      }

      const counts = new Map<string, number>();
      (poemRows || []).forEach((row: { collection_id: string }) => {
        counts.set(row.collection_id, (counts.get(row.collection_id) || 0) + 1);
      });
      setCollections(rows.map(row => ({ ...row, poem_count: counts.get(row.id) || 0 })));
    } catch (err) {
      if (timedOut) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch collections');
    } finally {
      window.clearTimeout(timeout);
      if (!timedOut) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const createCollection = async (name: string): Promise<Collection | null> => {
    if (!user || !supabase) return null;

    try {
      const insert: CollectionInsert = {
        user_id: user.id,
        name,
      };

      const { data, error } = await supabase
        .from('collections')
        .insert(insert as any)
        .select()
        .single();

      if (error) throw error;
      const newCollection = data as Collection;
      setCollections(prev => [newCollection, ...prev]);
      return newCollection;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create collection');
      return null;
    }
  };

  const updateCollection = async (id: string, name: string): Promise<boolean> => {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('collections')
        .update({ name, updated_at: new Date().toISOString() } as any)
        .eq('id', id);

      if (error) throw error;
      setCollections(prev =>
        prev.map(c => (c.id === id ? { ...c, name, updated_at: new Date().toISOString() } : c))
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update collection');
      return false;
    }
  };

  const deleteCollection = async (id: string): Promise<boolean> => {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCollections(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete collection');
      return false;
    }
  };

  return {
    collections,
    loading,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    refetch: fetchCollections,
  };
}

export function useSections(collectionId: string | undefined) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    if (!collectionId || !supabase) {
      setSections([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('collection_id', collectionId)
        .order('sort_order');

      if (error) throw error;
      setSections((data as Section[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const createSection = async (name: string, parentId: string | null = null): Promise<Section | null> => {
    if (!collectionId || !supabase) return null;

    try {
      const insert: SectionInsert = {
        collection_id: collectionId,
        name,
        parent_id: parentId,
        sort_order: sections.length,
      };

      const { data, error } = await supabase
        .from('sections')
        .insert(insert as any)
        .select()
        .single();

      if (error) throw error;
      const newSection = data as Section;
      setSections(prev => [...prev, newSection]);
      await touchCollectionUpdatedAt(collectionId);
      return newSection;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create section');
      return null;
    }
  };

  const createManySections = async (sectionData: Array<{ name: string; parentId: string | null }>): Promise<Section[]> => {
    if (!collectionId || !supabase) return [];

    try {
      const inserts: SectionInsert[] = sectionData.map((s, idx) => ({
        collection_id: collectionId,
        name: s.name,
        parent_id: s.parentId,
        sort_order: sections.length + idx,
      }));

      const { data, error } = await supabase
        .from('sections')
        .insert(inserts as any)
        .select();

      if (error) throw error;
      const newSections = (data as Section[]) || [];
      setSections(prev => [...prev, ...newSections]);
      if (newSections.length > 0) {
        await touchCollectionUpdatedAt(collectionId);
      }
      return newSections;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sections');
      return [];
    }
  };

  const renameSection = async (sectionId: string, name: string): Promise<boolean> => {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('sections')
        .update({ name })
        .eq('id', sectionId);
      if (error) throw error;
      setSections(prev => prev.map(s => s.id === sectionId ? { ...s, name } : s));
      await touchCollectionUpdatedAt(collectionId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename section');
      return false;
    }
  };

  const deleteSection = async (sectionId: string): Promise<boolean> => {
    if (!supabase || !collectionId) return false;
    try {
      // Move any poems in this section to root (null section_id)
      await supabase
        .from('poems')
        .update({ section_id: null })
        .eq('section_id', sectionId);

      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', sectionId);
      if (error) throw error;
      setSections(prev => prev.filter(s => s.id !== sectionId));
      await touchCollectionUpdatedAt(collectionId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete section');
      return false;
    }
  };

  return {
    sections,
    loading,
    error,
    createSection,
    createManySections,
    renameSection,
    deleteSection,
    refetch: fetchSections,
  };
}
