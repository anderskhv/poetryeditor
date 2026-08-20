import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildCloudPoemWrite,
  createCloudSaveQueue,
  readLiveCloudDraft,
  reloadFromCommitted,
  rememberKnownTitle,
  resolveTitleToPersist,
  type CloudDraftSnapshot,
} from '../cloudSaveQueue';

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe('readLiveCloudDraft', () => {
  it('prefers the live editor model over a lagged React snapshot', () => {
    const draft = readLiveCloudDraft({
      getValue: () => 'the kettle keeps its counsel',
      getTitle: () => 'Smoke Test Throwaway',
      fallbackText: 'the kettle keeps its cou',
      fallbackTitle: '',
    });
    expect(draft.text).toBe('the kettle keeps its counsel');
    expect(draft.title).toBe('Smoke Test Throwaway');
  });

  it('reads an empty model value instead of substituting the fallback', () => {
    const draft = readLiveCloudDraft({
      getValue: () => '',
      fallbackText: 'stale react text',
      fallbackTitle: 'Untitled',
    });
    expect(draft.text).toBe('');
  });
});

describe('resolveTitleToPersist / rememberKnownTitle', () => {
  it('does not replace a known title with a blank', () => {
    expect(resolveTitleToPersist('', 'Smoke Test Throwaway')).toBe('Smoke Test Throwaway');
    expect(resolveTitleToPersist('  ', 'Smoke Test Throwaway')).toBe('Smoke Test Throwaway');
    expect(resolveTitleToPersist('Renamed', 'Smoke Test Throwaway')).toBe('Renamed');
  });

  it('never stores an empty string as the known title', () => {
    expect(rememberKnownTitle('Smoke Test Throwaway', '')).toBe('Smoke Test Throwaway');
    expect(rememberKnownTitle('Smoke Test Throwaway', '   ')).toBe('Smoke Test Throwaway');
    expect(rememberKnownTitle(null, '')).toBe(null);
    expect(rememberKnownTitle(null, 'Smoke Test Throwaway')).toBe('Smoke Test Throwaway');
  });
});

describe('buildCloudPoemWrite', () => {
  it('omits title when the only value would be empty', () => {
    const payload = buildCloudPoemWrite({
      text: 'line',
      title: '',
      knownTitle: null,
      formatting: { align: 'left' },
    });
    expect(payload).toEqual({ content: 'line', formatting: { align: 'left' } });
    expect(payload).not.toHaveProperty('title');
  });

  it('writes the known title instead of ""', () => {
    const payload = buildCloudPoemWrite({
      text: 'line',
      title: '',
      knownTitle: 'Smoke Test Throwaway',
      formatting: { align: 'left' },
    });
    expect(payload.title).toBe('Smoke Test Throwaway');
  });
});

describe('createCloudSaveQueue', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('persists the live model when it advances during an in-flight write', async () => {
    const live = { text: 'the kettle keeps its cou', title: 'Smoke Test Throwaway' };
    const committed: CloudDraftSnapshot[] = [];
    const gate = deferred();
    let persistCalls = 0;

    const queue = createCloudSaveQueue({
      readLiveDraft: () => ({ ...live }),
      persist: async (draft) => {
        persistCalls += 1;
        if (persistCalls === 1) {
          await gate.promise;
        }
        committed.push({ ...draft });
      },
    });

    queue.syncLastSaved('', 'Smoke Test Throwaway');
    const flushPromise = queue.flush();

    live.text = 'the kettle keeps its counsel';
    gate.resolve();

    const saved = await flushPromise;
    const lastWrite = committed[committed.length - 1];

    expect(lastWrite.text).toBe('the kettle keeps its counsel');
    expect(saved?.text).toBe('the kettle keeps its counsel');
    expect(queue.getLastSaved().text).toBe('the kettle keeps its counsel');
    expect(queue.matchesCommitted(live)).toBe(true);
  });

  it('keeps the full line after a burst of keystrokes, 3s idle, and reload', async () => {
    vi.useFakeTimers();
    const live = { text: '', title: 'Smoke Test Throwaway' };
    let committed: CloudDraftSnapshot = { text: '', title: '' };

    const queue = createCloudSaveQueue({
      readLiveDraft: () => ({ ...live }),
      persist: async (draft) => {
        committed = { ...draft };
      },
    });
    queue.syncLastSaved('', 'Smoke Test Throwaway');

    const full = 'the kettle keeps its counsel';
    let debounce: ReturnType<typeof setTimeout> | null = null;
    const pendingFlushes: Promise<unknown>[] = [];

    function typeChar(ch: string) {
      live.text += ch;
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => {
        pendingFlushes.push(queue.flush());
      }, 1000);
    }

    for (const ch of full) {
      typeChar(ch);
      await vi.advanceTimersByTimeAsync(30);
    }

    await vi.advanceTimersByTimeAsync(3000);
    await Promise.all(pendingFlushes);
    await queue.flush();

    const reloaded = reloadFromCommitted(queue.getLastSaved());
    expect(committed.text).toBe(full);
    expect(reloaded.text).toBe(full);
    expect(reloaded.text).not.toBe('the kettle keeps its cou');
    expect(reloaded.title).toBe('Smoke Test Throwaway');
    expect(queue.matchesCommitted(live)).toBe(true);
  });

  it('does not write title "" over a title that was already set', async () => {
    const live = { text: 'the kettle keeps its counsel', title: '' };
    const committed: CloudDraftSnapshot[] = [];

    const queue = createCloudSaveQueue({
      readLiveDraft: () => ({ ...live }),
      persist: async (draft) => {
        committed.push({ ...draft });
      },
    });
    queue.syncLastSaved('the kettle keeps its counsel', 'Smoke Test Throwaway');
    queue.rememberTitle('Smoke Test Throwaway');

    await queue.flush();

    expect(committed).toHaveLength(0);
    expect(queue.getLastSaved().title).toBe('Smoke Test Throwaway');
    expect(reloadFromCommitted(queue.getLastSaved()).title).toBe('Smoke Test Throwaway');

    live.text = 'the kettle keeps its counsel\n';
    await queue.flush();

    expect(committed[committed.length - 1].title).toBe('Smoke Test Throwaway');
    expect(committed[committed.length - 1].title).not.toBe('');
    expect(reloadFromCommitted(queue.getLastSaved()).title).toBe('Smoke Test Throwaway');
  });

  it('does not report Saved while the live model is still ahead of the last write', async () => {
    const live = { text: 'the', title: 'Smoke Test Throwaway' };
    const gate = deferred();
    let persistCalls = 0;

    const queue = createCloudSaveQueue({
      readLiveDraft: () => ({ ...live }),
      persist: async () => {
        persistCalls += 1;
        if (persistCalls === 1) {
          await gate.promise;
        }
      },
    });
    queue.syncLastSaved('', 'Smoke Test Throwaway');

    const flushPromise = queue.flush();
    live.text = 'the kettle keeps its counsel';

    expect(queue.matchesCommitted()).toBe(false);

    gate.resolve();
    await flushPromise;

    expect(queue.getLastSaved().text).toBe('the kettle keeps its counsel');
    expect(queue.matchesCommitted()).toBe(true);
  });
});
