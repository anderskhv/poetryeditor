import { describe, expect, it } from 'vitest';
import {
  canWritePoemVersion,
  formatCollectionUpdatedAt,
  formatPoemCount,
  legacyCollectionPath,
  shouldShowCollectionEmptyState,
} from '../collectionShelf';

describe('shouldShowCollectionEmptyState', () => {
  it('hides the empty copy once a section exists', () => {
    expect(shouldShowCollectionEmptyState({
      poemCount: 0,
      sectionCount: 1,
      isAddingSection: false,
    })).toBe(false);
  });

  it('still shows the empty copy on a brand-new book', () => {
    expect(shouldShowCollectionEmptyState({
      poemCount: 0,
      sectionCount: 0,
      isAddingSection: false,
    })).toBe(true);
  });
});

describe('formatCollectionUpdatedAt', () => {
  const now = new Date('2026-08-21T15:00:00.000Z').getTime();

  it('uses relative time for same-day edits', () => {
    expect(formatCollectionUpdatedAt('2026-08-21T14:50:00.000Z', now)).toBe('Updated 10 minutes ago');
    expect(formatCollectionUpdatedAt('2026-08-21T14:59:30.000Z', now)).toBe('Updated just now');
  });

  it('names yesterday and other recent days instead of a calendar date', () => {
    expect(formatCollectionUpdatedAt('2026-08-20T15:00:00.000Z', now)).toBe('Updated yesterday');
    expect(formatCollectionUpdatedAt('2026-08-18T15:00:00.000Z', now)).toBe('Updated 3 days ago');
  });

  it('falls back to a calendar date after a week', () => {
    expect(formatCollectionUpdatedAt('2026-08-01T15:00:00.000Z', now)).toMatch(/^Updated /);
    expect(formatCollectionUpdatedAt('2026-08-01T15:00:00.000Z', now)).not.toMatch(/just now|minutes ago|hours ago|yesterday|days ago/);
  });
});

describe('formatPoemCount', () => {
  it('names the number of poems on a shelf card', () => {
    expect(formatPoemCount(0)).toBe('0 poems');
    expect(formatPoemCount(1)).toBe('1 poem');
    expect(formatPoemCount(3)).toBe('3 poems');
  });
});

describe('legacyCollectionPath', () => {
  it('keeps the collection id when rewriting /collections/:id', () => {
    expect(legacyCollectionPath('abc-123')).toBe('/my-collections/abc-123');
    expect(legacyCollectionPath(undefined)).toBe('/my-collections');
  });
});

describe('canWritePoemVersion', () => {
  it('refuses to snapshot a cloud poem before that poem has loaded', () => {
    expect(canWritePoemVersion({
      poemId: 'poem-b',
      isCloud: true,
      loadedCloudPoemId: 'poem-a',
      isLoadingCloudPoem: false,
      isPreviewing: false,
    })).toBe(false);
  });

  it('allows a snapshot once the open cloud poem matches the editor', () => {
    expect(canWritePoemVersion({
      poemId: 'poem-b',
      isCloud: true,
      loadedCloudPoemId: 'poem-b',
      isLoadingCloudPoem: false,
      isPreviewing: false,
    })).toBe(true);
  });
});
