import { supabase } from '../lib/supabase';

export interface PoemVersion {
  id: string;
  poem_id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  hash: string;
}

interface LocalPoemVersion {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  hash: string;
}

const VERSION_LIMIT = 10;

const storageKey = (poemId: string) => `poemVersions:${poemId}`;

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
};

const getLocalPoemVersions = (poemId: string): LocalPoemVersion[] => {
  if (!poemId) return [];
  const raw = localStorage.getItem(storageKey(poemId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as LocalPoemVersion[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const addLocalPoemVersion = (poemId: string, title: string, content: string) => {
  if (!poemId) return [];
  const normalizedTitle = title.trim() || 'Untitled';
  const normalizedContent = content.trimEnd();
  const hash = hashString(`${normalizedTitle}\n${normalizedContent}`);

  const existing = getLocalPoemVersions(poemId);
  if (existing[0]?.hash === hash) return existing;

  const next: LocalPoemVersion = {
    id: `${poemId}-${Date.now()}`,
    title: normalizedTitle,
    content: normalizedContent,
    createdAt: new Date().toISOString(),
    hash,
  };

  const merged = [next, ...existing.filter(version => version.hash !== hash)].slice(0, VERSION_LIMIT);
  localStorage.setItem(storageKey(poemId), JSON.stringify(merged));
  return merged;
};

const clearLocalPoemVersions = (poemId: string) => {
  if (!poemId) return;
  localStorage.removeItem(storageKey(poemId));
};

export const fetchPoemVersionsForPoems = async (poemIds: string[], userId: string) => {
  if (!supabase || poemIds.length === 0 || !userId) return {} as Record<string, PoemVersion[]>;

  const { data, error } = await supabase
    .from('poem_versions')
    .select('*')
    .in('poem_id', poemIds)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch poem versions:', error);
    const fallback: Record<string, PoemVersion[]> = {};
    poemIds.forEach(poemId => {
      const local = getLocalPoemVersions(poemId);
      if (local.length > 0) {
        fallback[poemId] = local.map(version => ({
          id: version.id,
          poem_id: poemId,
          user_id: userId,
          title: version.title,
          content: version.content,
          created_at: version.createdAt,
          hash: version.hash,
        }));
      }
    });
    return fallback;
  }

  const grouped: Record<string, PoemVersion[]> = {};
  (data || []).forEach(version => {
    if (!grouped[version.poem_id]) grouped[version.poem_id] = [];
    if (grouped[version.poem_id].length < VERSION_LIMIT) {
      grouped[version.poem_id].push(version);
    }
  });

  return grouped;
};

export const fetchPoemVersions = async (poemId: string, userId: string) => {
  if (!supabase || !poemId || !userId) return [] as PoemVersion[];

  const { data, error } = await supabase
    .from('poem_versions')
    .select('*')
    .eq('poem_id', poemId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(VERSION_LIMIT);

  if (error) {
    console.error('Failed to fetch poem versions:', error);
    const local = getLocalPoemVersions(poemId);
    return local.map(version => ({
      id: version.id,
      poem_id: poemId,
      user_id: userId,
      title: version.title,
      content: version.content,
      created_at: version.createdAt,
      hash: version.hash,
    }));
  }

  return data || [];
};

export const fetchPoemVersionById = async (versionId: string, userId: string) => {
  if (!supabase || !versionId || !userId) return null as PoemVersion | null;

  const { data, error } = await supabase
    .from('poem_versions')
    .select('*')
    .eq('id', versionId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Failed to fetch poem version:', error);
    return null;
  }

  return data as PoemVersion;
};

export const ensureInitialPoemVersion = async (poemId: string, title: string, content: string, userId: string) => {
  if (!supabase || !poemId || !userId) return;

  const { data, error } = await supabase
    .from('poem_versions')
    .select('id')
    .eq('poem_id', poemId)
    .eq('user_id', userId)
    .limit(1);

  if (error) {
    console.error('Failed to check poem versions:', error);
    addLocalPoemVersion(poemId, title, content);
    return;
  }

  if (!data || data.length === 0) {
    await addPoemVersion(poemId, title, content, userId);
  }
};

export const addPoemVersion = async (poemId: string, title: string, content: string, userId: string) => {
  if (!supabase || !poemId || !userId) return [] as PoemVersion[];

  const normalizedTitle = title.trim() || 'Untitled';
  const normalizedContent = content.trimEnd();
  const hash = hashString(`${normalizedTitle}\n${normalizedContent}`);

  const { data: latest, error: latestError } = await supabase
    .from('poem_versions')
    .select('id, hash')
    .eq('poem_id', poemId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (latestError) {
    console.error('Failed to check latest poem version:', latestError);
    addLocalPoemVersion(poemId, title, content);
    return [] as PoemVersion[];
  }

  if (latest && latest[0]?.hash === hash) {
    return [] as PoemVersion[];
  }

  const { error: insertError } = await supabase
    .from('poem_versions')
    .insert({
      poem_id: poemId,
      user_id: userId,
      title: normalizedTitle,
      content: normalizedContent,
      hash,
    });

  if (insertError) {
    console.error('Failed to add poem version:', insertError);
    addLocalPoemVersion(poemId, title, content);
    return [] as PoemVersion[];
  }

  const { data: overflow, error: overflowError } = await supabase
    .from('poem_versions')
    .select('id')
    .eq('poem_id', poemId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(VERSION_LIMIT, VERSION_LIMIT + 200);

  if (overflowError) {
    console.error('Failed to trim poem versions:', overflowError);
    return [] as PoemVersion[];
  }

  if (overflow && overflow.length > 0) {
    const ids = overflow.map(version => version.id);
    const { error: deleteError } = await supabase
      .from('poem_versions')
      .delete()
      .in('id', ids);

    if (deleteError) {
      console.error('Failed to delete old poem versions:', deleteError);
    }
  }

  return [] as PoemVersion[];
};

export const migrateLocalPoemVersions = async (poemId: string, userId: string) => {
  if (!supabase || !poemId || !userId) return false;

  const localVersions = getLocalPoemVersions(poemId);
  if (localVersions.length === 0) return false;

  const { data: existing, error: existingError } = await supabase
    .from('poem_versions')
    .select('id')
    .eq('poem_id', poemId)
    .eq('user_id', userId)
    .limit(1);

  if (existingError) {
    console.error('Failed to check existing poem versions:', existingError);
    return false;
  }

  if (existing && existing.length > 0) return false;

  const payload = localVersions
    .slice(0, VERSION_LIMIT)
    .map(version => ({
      poem_id: poemId,
      user_id: userId,
      title: version.title,
      content: version.content,
      created_at: version.createdAt,
      hash: version.hash || hashString(`${version.title}\n${version.content}`),
    }));

  const { error: insertError } = await supabase
    .from('poem_versions')
    .insert(payload);

  if (insertError) {
    console.error('Failed to migrate local poem versions:', insertError);
    return false;
  }

  clearLocalPoemVersions(poemId);
  return true;
};
