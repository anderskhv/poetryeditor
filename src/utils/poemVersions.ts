export interface PoemVersion {
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

export const getPoemVersions = (poemId: string): PoemVersion[] => {
  if (!poemId) return [];
  const raw = localStorage.getItem(storageKey(poemId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as PoemVersion[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

export const addPoemVersion = (poemId: string, title: string, content: string) => {
  if (!poemId) return [] as PoemVersion[];

  const normalizedTitle = title.trim() || 'Untitled';
  const normalizedContent = content.trimEnd();
  const hash = hashString(`${normalizedTitle}\n${normalizedContent}`);

  const existing = getPoemVersions(poemId);
  if (existing[0]?.hash === hash) return existing;

  const next: PoemVersion = {
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
