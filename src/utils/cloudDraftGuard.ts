/**
 * Pure guards for cloud poem load/save so in-progress typing
 * cannot be overwritten by a stale server snapshot.
 */

export interface CloudLoadDecisionInput {
  requestedPoemId: string | null;
  loadedPoemId: string | null;
  userId: string | null | undefined;
  localContent: string;
  serverContent: string;
  isDirty: boolean;
}

export interface CloudLoadDecision {
  shouldFetch: boolean;
  shouldApplyServerContent: boolean;
}

/**
 * Fetch a cloud poem only when the poet or poem identity changes.
 * A new `user` object from auth refresh must not retrigger load.
 */
export function shouldFetchCloudPoem(
  requestedPoemId: string | null,
  loadedPoemId: string | null,
  userId: string | null | undefined,
): boolean {
  if (!requestedPoemId || !userId) return false;
  return requestedPoemId !== loadedPoemId;
}

/**
 * Never apply server text over a dirty local draft of the same poem.
 * First load of a poem (nothing loaded yet) may apply server content.
 */
export function shouldApplyServerContent(input: {
  requestedPoemId: string;
  loadedPoemId: string | null;
  localContent: string;
  serverContent: string;
  isDirty: boolean;
}): boolean {
  const isSamePoem = input.loadedPoemId === input.requestedPoemId;
  if (isSamePoem && input.isDirty) return false;
  return input.serverContent !== input.localContent;
}

export function decideCloudLoad(input: CloudLoadDecisionInput): CloudLoadDecision {
  const shouldFetch = shouldFetchCloudPoem(
    input.requestedPoemId,
    input.loadedPoemId,
    input.userId,
  );
  if (!shouldFetch || !input.requestedPoemId) {
    return { shouldFetch: false, shouldApplyServerContent: false };
  }
  return {
    shouldFetch: true,
    shouldApplyServerContent: shouldApplyServerContent({
      requestedPoemId: input.requestedPoemId,
      loadedPoemId: input.loadedPoemId,
      localContent: input.localContent,
      serverContent: input.serverContent,
      isDirty: input.isDirty,
    }),
  };
}

export interface CloudSaveScheduleInput {
  poemId: string | null;
  loadedPoemId: string | null;
  hasUser: boolean;
  isLoading: boolean;
  isPreviewing: boolean;
  skipSave: boolean;
  currentText: string;
  currentTitle: string;
  lastSavedText: string | null;
  lastSavedTitle: string | null;
}

/** Schedule an autosave only when a loaded cloud draft actually changed. */
export function shouldScheduleCloudSave(input: CloudSaveScheduleInput): boolean {
  if (input.skipSave) return false;
  if (!input.poemId || !input.hasUser || input.isLoading || input.isPreviewing) return false;
  if (input.loadedPoemId !== input.poemId) return false;
  if (input.currentText === input.lastSavedText && input.currentTitle === input.lastSavedTitle) {
    return false;
  }
  return true;
}

/** True when local editor text has moved past the last successful cloud snapshot. */
export function isCloudDraftDirty(
  currentText: string,
  lastSavedText: string | null,
): boolean {
  if (lastSavedText === null) return currentText.trim() !== '';
  return currentText !== lastSavedText;
}
