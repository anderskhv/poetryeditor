/**
 * API utilities for fetching word information
 * - Word origins/etymology from Free Dictionary API
 * - Pronunciation audio links
 */

export interface WordOrigin {
  origin: string;
  partOfSpeech?: string;
}

export interface Pronunciation {
  text: string; // IPA or phonetic spelling
  audioUrl?: string; // URL to audio file
}

export interface WordDefinition {
  partOfSpeech: string;
  definitions: string[];
  origin?: string;
}

export interface DictionaryResponse {
  word: string;
  phonetic?: string;
  phonetics?: Array<{
    text?: string;
    audio?: string;
  }>;
  origin?: string;
  meanings?: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
    }>;
  }>;
}

/**
 * Fetch word information from Free Dictionary API
 */
async function fetchFromDictionaryApi(word: string): Promise<DictionaryResponse | null> {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data[0] as DictionaryResponse;
  } catch (error) {
    console.warn('Error fetching from dictionary API:', error);
    return null;
  }
}

/**
 * Fetch word origin/etymology
 */
export async function fetchWordOrigin(word: string): Promise<WordOrigin | null> {
  const data = await fetchFromDictionaryApi(word);

  if (!data) {
    return null;
  }

  if (data.origin) {
    return {
      origin: data.origin,
      partOfSpeech: data.meanings?.[0]?.partOfSpeech,
    };
  }

  return null;
}

/**
 * Fetch pronunciation information including audio URLs
 */
export async function fetchPronunciation(word: string): Promise<Pronunciation | null> {
  const data = await fetchFromDictionaryApi(word);

  if (!data) {
    return null;
  }

  // Get phonetic text
  let phoneticText = data.phonetic || '';

  // Get audio URL - prefer one with audio
  let audioUrl: string | undefined;

  if (data.phonetics && data.phonetics.length > 0) {
    for (const phonetic of data.phonetics) {
      if (phonetic.audio && phonetic.audio.length > 0) {
        audioUrl = phonetic.audio;
        // Also get the text from the same entry if available
        if (phonetic.text) {
          phoneticText = phonetic.text;
        }
        break;
      }
      // Use text if no audio found yet
      if (!phoneticText && phonetic.text) {
        phoneticText = phonetic.text;
      }
    }
  }

  if (!phoneticText && !audioUrl) {
    return null;
  }

  return {
    text: phoneticText,
    audioUrl,
  };
}

/**
 * Fetch full word information (definitions, origin, pronunciation)
 */
export async function fetchWordInfo(word: string): Promise<{
  definitions: WordDefinition[];
  origin: WordOrigin | null;
  pronunciation: Pronunciation | null;
} | null> {
  const data = await fetchFromDictionaryApi(word);

  if (!data) {
    return null;
  }

  // Extract definitions
  const definitions: WordDefinition[] = [];
  if (data.meanings) {
    for (const meaning of data.meanings) {
      definitions.push({
        partOfSpeech: meaning.partOfSpeech,
        definitions: meaning.definitions.map(d => d.definition).slice(0, 3), // Limit to 3 definitions
      });
    }
  }

  // Extract origin
  const origin: WordOrigin | null = data.origin
    ? { origin: data.origin, partOfSpeech: data.meanings?.[0]?.partOfSpeech }
    : null;

  // Extract pronunciation
  let phoneticText = data.phonetic || '';
  let audioUrl: string | undefined;

  if (data.phonetics && data.phonetics.length > 0) {
    for (const phonetic of data.phonetics) {
      if (phonetic.audio && phonetic.audio.length > 0) {
        audioUrl = phonetic.audio;
        if (phonetic.text) {
          phoneticText = phonetic.text;
        }
        break;
      }
      if (!phoneticText && phonetic.text) {
        phoneticText = phonetic.text;
      }
    }
  }

  const pronunciation: Pronunciation | null = phoneticText || audioUrl
    ? { text: phoneticText, audioUrl }
    : null;

  return {
    definitions,
    origin,
    pronunciation,
  };
}
