/**
 * Single-flight cloud save queue.
 *
 * Overlapping HTTP updates are unsafe: a debounce that captured "the"
 * can finish after a later full-line save and become the committed copy.
 * This queue writes at most one request at a time and, when that request
 * returns, writes again if the poet kept typing.
 */

export interface CloudDraftSnapshot {
  text: string;
  title: string;
}

export function resolveTitleToPersist(
  currentTitle: string,
  lastKnownTitle: string | null,
): string {
  if (currentTitle.trim() === '' && lastKnownTitle && lastKnownTitle.trim() !== '') {
    return lastKnownTitle;
  }
  return currentTitle;
}

export function createCloudSaveQueue(
  persist: (draft: CloudDraftSnapshot) => Promise<void>,
) {
  let latest: CloudDraftSnapshot = { text: '', title: '' };
  let lastSaved: { text: string | null; title: string | null } = { text: null, title: null };
  let inFlight: Promise<CloudDraftSnapshot | null> | null = null;

  function setDraft(text: string, title: string) {
    latest = { text, title };
  }

  function syncLastSaved(text: string | null, title: string | null) {
    lastSaved = { text, title };
  }

  function isDirty(): boolean {
    return latest.text !== lastSaved.text || latest.title !== lastSaved.title;
  }

  async function runFlush(): Promise<CloudDraftSnapshot | null> {
    let written: CloudDraftSnapshot | null = null;
    while (isDirty()) {
      written = { text: latest.text, title: latest.title };
      await persist(written);
      lastSaved = { text: written.text, title: written.title };
    }
    if (written) return written;
    if (lastSaved.text === null) return null;
    return { text: lastSaved.text, title: lastSaved.title ?? '' };
  }

  async function flush(): Promise<CloudDraftSnapshot | null> {
    if (inFlight) {
      await inFlight;
      if (isDirty()) return flush();
      if (lastSaved.text === null) return null;
      return { text: lastSaved.text, title: lastSaved.title ?? '' };
    }

    inFlight = runFlush();
    try {
      return await inFlight;
    } finally {
      inFlight = null;
    }
  }

  return {
    setDraft,
    syncLastSaved,
    flush,
    isDirty,
    getLatest: (): CloudDraftSnapshot => ({ ...latest }),
    getLastSaved: () => ({ ...lastSaved }),
  };
}

/** What a hard reload would show if it read the last committed cloud snapshot. */
export function reloadFromCommitted(
  lastSaved: { text: string | null; title: string | null },
): { text: string; title: string } {
  return {
    text: lastSaved.text ?? '',
    title: lastSaved.title ?? '',
  };
}
