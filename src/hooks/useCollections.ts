import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Collection, Section, CollectionInsert, SectionInsert } from '../types/database';
import { useAuth } from './useAuth';

export function useCollections() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    if (!user || !supabase) {
      setCollections([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setCollections((data as Collection[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collections');
    } finally {
      setLoading(false);
    }
  }, [user]);

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
      return newSections;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sections');
      return [];
    }
  };

  return {
    sections,
    loading,
    error,
    createSection,
    createManySections,
    refetch: fetchSections,
  };
}
