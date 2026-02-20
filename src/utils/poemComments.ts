import { supabase } from '../lib/supabase';

export type CommentRange = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
};

export interface PoemComment {
  id: string;
  poemId: string;
  userId?: string | null;
  text: string;
  quote?: string;
  range: CommentRange;
  createdAt: string;
  resolved: boolean;
  resolvedAt?: string | null;
}

const storageKey = (poemId: string) => `poemComments:${poemId}`;

const getLocalComments = (poemId: string): PoemComment[] => {
  if (!poemId) return [];
  const raw = localStorage.getItem(storageKey(poemId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as PoemComment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const setLocalComments = (poemId: string, comments: PoemComment[]) => {
  if (!poemId) return;
  localStorage.setItem(storageKey(poemId), JSON.stringify(comments));
};

export const getLocalCommentsForSync = (poemId: string) => getLocalComments(poemId);

const commentKey = (comment: {
  text: string;
  quote?: string;
  range: CommentRange;
  createdAt: string;
}) => `${comment.text}||${comment.quote || ''}||${JSON.stringify(comment.range)}||${comment.createdAt}`;

export const fetchPoemComments = async (poemId: string, userId?: string | null) => {
  if (!poemId) return [];
  if (!supabase || !userId) {
    return getLocalComments(poemId);
  }

  const { data, error } = await supabase
    .from('poem_comments')
    .select('*')
    .eq('poem_id', poemId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('Failed to fetch poem comments, using local cache:', error.message);
    return getLocalComments(poemId);
  }

  const mapped = (data || []).map((row: any) => ({
    id: row.id,
    poemId: row.poem_id,
    userId: row.user_id,
    text: row.text,
    quote: row.quote || undefined,
    range: row.range,
    createdAt: row.created_at,
    resolved: !!row.resolved,
    resolvedAt: row.resolved_at || null,
  })) as PoemComment[];

  const existingKeys = new Set(mapped.map(commentKey));
  const local = getLocalComments(poemId);
  const pending = local.filter(comment => !existingKeys.has(commentKey(comment)));

  let combined = mapped;
  if (pending.length > 0) {
    const { data: inserted, error: insertError } = await supabase
      .from('poem_comments')
      .insert(pending.map((comment) => ({
        poem_id: poemId,
        user_id: userId,
        text: comment.text,
        quote: comment.quote || null,
        range: comment.range,
        resolved: comment.resolved,
        resolved_at: comment.resolvedAt,
        created_at: comment.createdAt,
      })))
      .select();

    if (insertError) {
      console.warn('Failed to sync local comments to Supabase:', insertError.message);
    } else if (inserted) {
      const synced = inserted.map((row: any) => ({
        id: row.id,
        poemId: row.poem_id,
        userId: row.user_id,
        text: row.text,
        quote: row.quote || undefined,
        range: row.range,
        createdAt: row.created_at,
        resolved: !!row.resolved,
        resolvedAt: row.resolved_at || null,
      })) as PoemComment[];
      combined = [...mapped, ...synced];
    }
  }

  combined.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  setLocalComments(poemId, combined);
  return combined;
};

export const syncLocalComments = async (poemId: string, userId?: string | null) => {
  if (!poemId || !supabase || !userId) return;
  const local = getLocalComments(poemId);
  if (local.length === 0) return;

  const { data, error } = await supabase
    .from('poem_comments')
    .select('id, text, quote, range, created_at')
    .eq('poem_id', poemId)
    .eq('user_id', userId);

  if (error) {
    console.warn('Failed to fetch existing comments for sync:', error.message);
    return;
  }

  const existingKeys = new Set(
    (data || []).map(row => commentKey({
      text: row.text,
      quote: row.quote || undefined,
      range: row.range,
      createdAt: row.created_at,
    }))
  );

  const pending = local.filter(comment => !existingKeys.has(commentKey(comment)));
  if (pending.length === 0) return;

  const { error: insertError } = await supabase
    .from('poem_comments')
    .insert(pending.map((comment) => ({
      poem_id: poemId,
      user_id: userId,
      text: comment.text,
      quote: comment.quote || null,
      range: comment.range,
      resolved: comment.resolved,
      resolved_at: comment.resolvedAt,
      created_at: comment.createdAt,
    })));

  if (insertError) {
    console.warn('Failed to sync local comments to Supabase:', insertError.message);
  }
};

export const addPoemComment = async (
  poemId: string,
  userId: string | null | undefined,
  comment: Omit<PoemComment, 'id' | 'createdAt' | 'resolved' | 'resolvedAt' | 'poemId' | 'userId'>
) => {
  const createdAt = new Date().toISOString();
  const draft: PoemComment = {
    id: `comment-${Date.now()}`,
    poemId,
    userId: userId || null,
    text: comment.text,
    quote: comment.quote,
    range: comment.range,
    createdAt,
    resolved: false,
    resolvedAt: null,
  };

  if (!supabase || !userId || poemId === 'local') {
    const next = [...getLocalComments(poemId), draft];
    setLocalComments(poemId, next);
    return draft;
  }

  const { data, error } = await supabase
    .from('poem_comments')
    .insert({
      poem_id: poemId,
      user_id: userId,
      text: comment.text,
      quote: comment.quote,
      range: comment.range,
      resolved: false,
      created_at: createdAt,
    } as any)
    .select()
    .single();

  if (error) {
    console.warn('Failed to persist poem comment, using local cache:', error.message);
    const next = [...getLocalComments(poemId), draft];
    setLocalComments(poemId, next);
    return draft;
  }

  const saved: PoemComment = {
    id: data.id,
    poemId: data.poem_id,
    userId: data.user_id,
    text: data.text,
    quote: data.quote || undefined,
    range: data.range,
    createdAt: data.created_at,
    resolved: !!data.resolved,
    resolvedAt: data.resolved_at || null,
  };

  const next = [...getLocalComments(poemId), saved];
  setLocalComments(poemId, next);
  return saved;
};

export const updatePoemComment = async (
  poemId: string,
  commentId: string,
  updates: Partial<Pick<PoemComment, 'text' | 'resolved' | 'resolvedAt'>>
) => {
  const current = getLocalComments(poemId);
  const next = current.map(comment =>
    comment.id === commentId ? { ...comment, ...updates } : comment
  );
  setLocalComments(poemId, next);

  if (!supabase) return next;

  const { error } = await supabase
    .from('poem_comments')
    .update({
      text: updates.text,
      resolved: updates.resolved,
      resolved_at: updates.resolvedAt,
    } as any)
    .eq('id', commentId);

  if (error) {
    console.warn('Failed to update poem comment in Supabase:', error.message);
  }

  return next;
};

export const deletePoemComment = async (poemId: string, commentId: string) => {
  const current = getLocalComments(poemId);
  const next = current.filter(comment => comment.id !== commentId);
  setLocalComments(poemId, next);

  if (!supabase) return next;

  const { error } = await supabase
    .from('poem_comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.warn('Failed to delete poem comment in Supabase:', error.message);
  }

  return next;
};
