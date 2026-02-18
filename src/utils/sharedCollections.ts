import { supabase } from '../lib/supabase';

export interface CollectionShare {
  id: string;
  collection_id: string;
  user_id: string;
  token: string;
  created_at: string;
}

export interface SharedCollectionPayload {
  collection: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
  sections: Array<{
    id: string;
    collection_id: string;
    name: string;
    parent_id: string | null;
    sort_order: number;
    created_at: string;
  }>;
  poems: Array<{
    id: string;
    collection_id: string;
    section_id: string | null;
    title: string;
    content: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
  }>;
  comments: Array<{
    id: string;
    poem_id: string;
    text: string;
    quote: string | null;
    range: any;
    resolved: boolean;
    created_at: string;
  }>;
}

const generateToken = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '');
  }
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
};

export const createCollectionShare = async (collectionId: string, userId: string) => {
  if (!supabase) return null;
  const token = generateToken();
  const { data, error } = await supabase
    .from('collection_shares')
    .insert({
      collection_id: collectionId,
      user_id: userId,
      token,
    } as any)
    .select()
    .single();

  if (error) {
    console.error('Failed to create share link:', error);
    return null;
  }
  return data as CollectionShare;
};

export const getExistingShare = async (collectionId: string, userId: string) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('collection_shares')
    .select('*')
    .eq('collection_id', collectionId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('Failed to fetch share link:', error);
    return null;
  }
  return data as CollectionShare | null;
};

export const getOrCreateShare = async (collectionId: string, userId: string) => {
  const existing = await getExistingShare(collectionId, userId);
  if (existing) return existing;
  return createCollectionShare(collectionId, userId);
};

export const fetchSharedCollection = async (token: string): Promise<SharedCollectionPayload | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .rpc('get_shared_collection', { share_token: token })
    .single();

  if (error) {
    console.error('Failed to fetch shared collection:', error);
    return null;
  }
  return data as SharedCollectionPayload;
};
