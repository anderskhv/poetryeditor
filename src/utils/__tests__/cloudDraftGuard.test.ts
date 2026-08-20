import { describe, expect, it } from 'vitest';
import {
  decideCloudLoad,
  isCloudDraftDirty,
  shouldApplyServerContent,
  shouldFetchCloudPoem,
  shouldScheduleCloudSave,
} from '../cloudDraftGuard';

describe('shouldFetchCloudPoem', () => {
  it('does not refetch when only the user object identity would change', () => {
    expect(shouldFetchCloudPoem('poem-1', 'poem-1', 'user-1')).toBe(false);
  });

  it('fetches when opening a different poem', () => {
    expect(shouldFetchCloudPoem('poem-2', 'poem-1', 'user-1')).toBe(true);
  });

  it('fetches the first time a poem is requested', () => {
    expect(shouldFetchCloudPoem('poem-1', null, 'user-1')).toBe(true);
  });

  it('does not fetch without a user or poem id', () => {
    expect(shouldFetchCloudPoem('poem-1', null, null)).toBe(false);
    expect(shouldFetchCloudPoem(null, null, 'user-1')).toBe(false);
  });
});

describe('shouldApplyServerContent', () => {
  it('refuses to overwrite a dirty draft of the same poem', () => {
    expect(shouldApplyServerContent({
      requestedPoemId: 'poem-1',
      loadedPoemId: 'poem-1',
      localContent: 'kettle hums on the sillx',
      serverContent: 'kettle hums on the sill',
      isDirty: true,
    })).toBe(false);
  });

  it('applies server text on first load of a poem', () => {
    expect(shouldApplyServerContent({
      requestedPoemId: 'poem-1',
      loadedPoemId: null,
      localContent: 'stale localStorage draft',
      serverContent: 'kettle hums on the sill',
      isDirty: false,
    })).toBe(true);
  });

  it('skips apply when server already matches local', () => {
    expect(shouldApplyServerContent({
      requestedPoemId: 'poem-1',
      loadedPoemId: null,
      localContent: 'same',
      serverContent: 'same',
      isDirty: false,
    })).toBe(false);
  });
});

describe('shouldScheduleCloudSave', () => {
  const ready = {
    poemId: 'poem-1',
    loadedPoemId: 'poem-1',
    hasUser: true,
    isLoading: false,
    isPreviewing: false,
    skipSave: false,
    currentText: 'typed letter',
    currentTitle: 'Smoke Test',
    lastSavedText: 'typed lette',
    lastSavedTitle: 'Smoke Test',
  };

  it('schedules a save after the poet types past the last snapshot', () => {
    expect(shouldScheduleCloudSave(ready)).toBe(true);
  });

  it('does not flip into Saving when nothing changed', () => {
    expect(shouldScheduleCloudSave({
      ...ready,
      currentText: 'typed letter',
      lastSavedText: 'typed letter',
    })).toBe(false);
  });

  it('does not save while the poem is still loading or a newer load is pending', () => {
    expect(shouldScheduleCloudSave({ ...ready, isLoading: true })).toBe(false);
    expect(shouldScheduleCloudSave({ ...ready, loadedPoemId: null })).toBe(false);
    expect(shouldScheduleCloudSave({ ...ready, skipSave: true })).toBe(false);
  });
});

describe('isCloudDraftDirty + decideCloudLoad', () => {
  it('keeps in-progress keystrokes when a late server snapshot arrives', () => {
    const local = 'the window keeps a grey opinionx';
    const server = 'the window keeps a grey opinion';
    expect(isCloudDraftDirty(local, server)).toBe(true);

    const decision = decideCloudLoad({
      requestedPoemId: 'poem-1',
      loadedPoemId: 'poem-1',
      userId: 'user-1',
      localContent: local,
      serverContent: server,
      isDirty: true,
    });

    expect(decision.shouldFetch).toBe(false);
    expect(decision.shouldApplyServerContent).toBe(false);
  });
});
