/**
 * Single-flight cloud save queue.
 *
 * Persist must read the live editor (Monaco getValue / title input) at
 * write time. A React `text` / `poemTitle` snapshot from a debounce
 * closure can be a prefix of what the poet already sees on screen.
 *
 * After each HTTP write, if the live model has moved, write again.
 * "Saved" is only honest when the last committed row matches the model.
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

/** Prefer the editor model / title input over a lagged React snapshot. */
export function readLiveCloudDraft(input: {
  getValue?: () => string | undefined;
  getTitle?: () => string | undefined;
  titleInputValue?: string;
  fallbackText: string;
  fallbackTitle: string;
}): CloudDraftSnapshot {
  const fromModel = input.getValue?.();
  const fromTitleFn = input.getTitle?.();
  const fromInput = input.titleInputValue;
  return {
    text: fromModel !== undefined ? fromModel : input.fallbackText,
    title: fromTitleFn !== undefined
      ? fromTitleFn
      : (fromInput !== undefined ? fromInput : input.fallbackTitle),
  };
}

export function rememberKnownTitle(
  current: string | null,
  nextTitle: string | null | undefined,
): string | null {
  if (nextTitle != null && nextTitle.trim() !== '') {
    return nextTitle;
  }
  return current && current.trim() !== '' ? current : null;
}

/** Build the poems.update payload. Never send title "" over a known title. */
export function buildCloudPoemWrite<TFormatting>(input: {
  text: string;
  title: string;
  knownTitle: string | null;
  formatting: TFormatting;
}): { content: string; title?: string; formatting: TFormatting } {
  const title = resolveTitleToPersist(input.title, input.knownTitle);
  if (title.trim() === '') {
    return { content: input.text, formatting: input.formatting };
  }
  return { content: input.text, title, formatting: input.formatting };
}

export interface CloudSaveQueueOptions {
  persist: (draft: CloudDraftSnapshot) => Promise<void>;
  readLiveDraft: () => CloudDraftSnapshot;
}

export function createCloudSaveQueue(options: CloudSaveQueueOptions) {
  let knownTitle = '';
  let lastSaved: { text: string | null; title: string | null } = { text: null, title: null };
  let inFlight: Promise<CloudDraftSnapshot | null> | null = null;

  function rememberTitle(title: string) {
    if (title.trim() !== '') {
      knownTitle = title;
    }
  }

  function liveSnapshot(): CloudDraftSnapshot {
    const live = options.readLiveDraft();
    const title = resolveTitleToPersist(live.title, knownTitle);
    rememberTitle(title);
    return { text: live.text, title };
  }

  function matchesCommitted(draft?: CloudDraftSnapshot): boolean {
    const snap = draft ?? liveSnapshot();
    const committedTitle = lastSaved.title ?? '';
    return snap.text === lastSaved.text && snap.title === committedTitle;
  }

  function isDirty(): boolean {
    return !matchesCommitted();
  }

  /**
   * Seed the last committed row after a cloud load.
   * Empty server titles do not become the known title (and cannot wipe one
   * on this poem's first load — knownTitle resets per poem).
   */
  function syncLastSaved(text: string | null, title: string | null) {
    lastSaved = { text, title };
    knownTitle = title && title.trim() !== '' ? title : '';
  }

  async function runFlush(): Promise<CloudDraftSnapshot | null> {
    let written: CloudDraftSnapshot | null = null;
    while (isDirty()) {
      const toWrite = liveSnapshot();
      await options.persist(toWrite);
      lastSaved = { text: toWrite.text, title: toWrite.title };
      rememberTitle(toWrite.title);
      written = toWrite;
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
    rememberTitle,
    syncLastSaved,
    flush,
    isDirty,
    matchesCommitted,
    getLastSaved: () => ({ ...lastSaved }),
    getKnownTitle: () => knownTitle,
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
