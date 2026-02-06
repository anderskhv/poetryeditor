export interface WordnetSensePayload {
  gloss: string;
  pos?: string;
  synonyms: { word: string; score: number }[];
}

const prefixCache = new Map<string, Record<string, WordnetSensePayload[]>>();

const normalizeWord = (value: string) =>
  value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getPrefix = (value: string) => {
  const letters = value.replace(/[^a-z]/g, '');
  if (!letters) return '__';
  return letters.slice(0, 2).padEnd(2, '_');
};

async function loadPrefix(prefix: string): Promise<Record<string, WordnetSensePayload[]> | null> {
  if (prefixCache.has(prefix)) {
    return prefixCache.get(prefix) || null;
  }
  try {
    const response = await fetch(`/wordnet-senses/${prefix}.json`);
    if (!response.ok) {
      prefixCache.set(prefix, {});
      return null;
    }
    const data = await response.json();
    prefixCache.set(prefix, data);
    return data;
  } catch {
    prefixCache.set(prefix, {});
    return null;
  }
}

export async function getWordnetSenses(word: string): Promise<WordnetSensePayload[] | null> {
  const normalized = normalizeWord(word);
  if (!normalized) return null;
  const prefix = getPrefix(normalized);
  const data = await loadPrefix(prefix);
  if (!data) return null;
  return data[normalized] || null;
}
