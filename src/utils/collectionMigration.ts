import { PoetryCollection, CollectionPoem } from '../types/collection';
import { generateId } from './markdownUtils';

// Keys for localStorage
export const COLLECTION_KEY = 'poetryCollection';
export const MIGRATION_FLAG = 'collectionMigrated';
const SAVED_POEMS_KEY = 'savedPoems';

// Existing SavedPoem interface from App.tsx
interface LegacySavedPoem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

/**
 * Create an empty collection
 */
export function createEmptyCollection(): PoetryCollection {
  return {
    id: generateId('collection'),
    name: 'My Collection',
    poems: [],
    sections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Migrate existing savedPoems to new collection format
 */
export function migrateFromLegacySavedPoems(): PoetryCollection | null {
  // Check if already migrated
  if (localStorage.getItem(MIGRATION_FLAG) === 'true') {
    return null;
  }

  // Load existing saved poems
  const savedPoemsJson = localStorage.getItem(SAVED_POEMS_KEY);
  if (!savedPoemsJson) {
    // No existing poems, just mark as migrated and return null
    localStorage.setItem(MIGRATION_FLAG, 'true');
    return null;
  }

  try {
    const savedPoems: LegacySavedPoem[] = JSON.parse(savedPoemsJson);

    if (!Array.isArray(savedPoems) || savedPoems.length === 0) {
      localStorage.setItem(MIGRATION_FLAG, 'true');
      return null;
    }

    // Convert to new format
    const collectionPoems: CollectionPoem[] = savedPoems.map((poem, index) => ({
      id: poem.id,
      title: poem.title || 'Untitled',
      content: poem.content,
      sourceFilename: undefined,
      createdAt: poem.updatedAt, // Use updatedAt as createdAt (best available)
      updatedAt: poem.updatedAt,
      sectionId: null, // All migrated poems go to root
      order: index,
    }));

    const collection: PoetryCollection = {
      id: generateId('collection'),
      name: 'My Poems',
      poems: collectionPoems,
      sections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save new collection
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(collection));
    localStorage.setItem(MIGRATION_FLAG, 'true');

    // Keep savedPoems as backup (don't delete)
    console.log(`Migrated ${collectionPoems.length} poems to new collection format`);

    return collection;
  } catch (error) {
    console.error('Migration failed:', error);
    localStorage.setItem(MIGRATION_FLAG, 'true'); // Don't retry on failure
    return null;
  }
}

/**
 * Load existing collection or migrate from legacy format
 */
export function loadOrCreateCollection(): PoetryCollection {
  // Try to load existing collection
  const existingJson = localStorage.getItem(COLLECTION_KEY);
  if (existingJson) {
    try {
      const collection = JSON.parse(existingJson) as PoetryCollection;
      // Basic validation
      if (collection.id && Array.isArray(collection.poems) && Array.isArray(collection.sections)) {
        return collection;
      }
    } catch {
      console.error('Failed to parse collection, will recreate');
    }
  }

  // Attempt migration from legacy format
  const migrated = migrateFromLegacySavedPoems();
  if (migrated) {
    return migrated;
  }

  // Fallback to empty collection
  return createEmptyCollection();
}

/**
 * Save collection to localStorage
 */
export function saveCollection(collection: PoetryCollection): void {
  const updated = {
    ...collection,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(updated));
}
