import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Poem, PoemInsert } from '../types/database';

export function usePoems(collectionId: string | undefined) {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoems = useCallback(async () => {
    if (!collectionId) {
      setPoems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('poems')
        .select('*')
        .eq('collection_id', collectionId)
        .order('sort_order');

      if (error) throw error;
      setPoems((data as Poem[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch poems');
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    fetchPoems();
  }, [fetchPoems]);

  const createPoem = async (
    title: string,
    content: string,
    sectionId: string | null = null,
    filename: string | null = null
  ): Promise<Poem | null> => {
    if (!collectionId) return null;

    try {
      const insert: PoemInsert = {
        collection_id: collectionId,
        section_id: sectionId,
        title,
        content,
        filename,
        sort_order: poems.length,
      };

      const { data, error } = await supabase
        .from('poems')
        .insert(insert as any)
        .select()
        .single();

      if (error) throw error;
      const newPoem = data as Poem;
      setPoems(prev => [...prev, newPoem]);
      return newPoem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create poem');
      return null;
    }
  };

  const createManyPoems = async (
    poemData: Array<{
      title: string;
      content: string;
      sectionId: string | null;
      filename: string | null;
    }>
  ): Promise<Poem[]> => {
    if (!collectionId) return [];

    try {
      const inserts: PoemInsert[] = poemData.map((p, idx) => ({
        collection_id: collectionId,
        section_id: p.sectionId,
        title: p.title,
        content: p.content,
        filename: p.filename,
        sort_order: poems.length + idx,
      }));

      const { data, error } = await supabase
        .from('poems')
        .insert(inserts as any)
        .select();

      if (error) throw error;
      const newPoems = (data as Poem[]) || [];
      setPoems(prev => [...prev, ...newPoems]);
      return newPoems;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create poems');
      return [];
    }
  };

  const updatePoem = async (id: string, updates: { title?: string; content?: string }): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('poems')
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', id);

      if (error) throw error;
      setPoems(prev =>
        prev.map(p => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update poem');
      return false;
    }
  };

  const deletePoem = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('poems')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPoems(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete poem');
      return false;
    }
  };

  const deleteManyPoems = async (ids: string[]): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('poems')
        .delete()
        .in('id', ids);

      if (error) throw error;
      setPoems(prev => prev.filter(p => !ids.includes(p.id)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete poems');
      return false;
    }
  };

  return {
    poems,
    loading,
    error,
    createPoem,
    createManyPoems,
    updatePoem,
    deletePoem,
    deleteManyPoems,
    refetch: fetchPoems,
  };
}

export function usePoem(poemId: string | undefined) {
  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoem = useCallback(async () => {
    if (!poemId) {
      setPoem(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('poems')
        .select('*')
        .eq('id', poemId)
        .single();

      if (error) throw error;
      setPoem(data as Poem);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch poem');
    } finally {
      setLoading(false);
    }
  }, [poemId]);

  useEffect(() => {
    fetchPoem();
  }, [fetchPoem]);

  const updatePoem = async (updates: { title?: string; content?: string }): Promise<boolean> => {
    if (!poemId) return false;

    try {
      const { data, error } = await supabase
        .from('poems')
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', poemId)
        .select()
        .single();

      if (error) throw error;
      setPoem(data as Poem);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update poem');
      return false;
    }
  };

  return {
    poem,
    loading,
    error,
    updatePoem,
    refetch: fetchPoem,
  };
}
