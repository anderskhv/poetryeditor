import { describe, expect, it } from 'vitest';
import {
  createCloudSaveQueue,
  reloadFromCommitted,
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

describe('createCloudSaveQueue', () => {
  it('sends the full current text after a burst of typing, not the first debounce prefix', async () => {
    const committed: string[] = [];
    const gates: Array<ReturnType<typeof deferred>> = [];
    let persistCalls = 0;

    const queue = createCloudSaveQueue(async (draft: CloudDraftSnapshot) => {
      persistCalls += 1;
      if (persistCalls === 1) {
        const gate = deferred();
        gates.push(gate);
        await gate.promise;
      }
      committed.push(draft.text);
    });

    queue.setDraft('the', 'Smoke Test');
    const firstFlush = queue.flush();

    queue.setDraft('the kettle keeps its counsel', 'Smoke Test');
    const secondFlush = queue.flush();

    expect(gates.length).toBe(1);
    gates[0].resolve();

    const [firstResult, secondResult] = await Promise.all([firstFlush, secondFlush]);
    const lastWrite = committed[committed.length - 1];

    expect(lastWrite).toBe('the kettle keeps its counsel');
    expect(queue.getLastSaved().text).toBe('the kettle keeps its counsel');
    expect(firstResult?.text).toBe('the kettle keeps its counsel');
    expect(secondResult?.text).toBe('the kettle keeps its counsel');
  });

  it('reload simulation does not restore a prefix', async () => {
    const gates: Array<ReturnType<typeof deferred>> = [];
    let persistCalls = 0;
    const queue = createCloudSaveQueue(async () => {
      persistCalls += 1;
      if (persistCalls === 1) {
        const gate = deferred();
        gates.push(gate);
        await gate.promise;
      }
    });

    queue.setDraft('\nthe', 'Smoke Test Throwaway');
    const prefixFlush = queue.flush();
    queue.setDraft('\nthe kettle keeps its counsel', 'Smoke Test Throwaway');
    const fullFlush = queue.flush();
    gates[0].resolve();
    await Promise.all([prefixFlush, fullFlush]);

    const reloaded = reloadFromCommitted(queue.getLastSaved());
    expect(reloaded.text).toBe('\nthe kettle keeps its counsel');
    expect(reloaded.text).not.toBe('\nthe');
    expect(reloaded.title).toBe('Smoke Test Throwaway');
  });

  it('does not replace a known title with a blank', () => {
    expect(resolveTitleToPersist('', 'Smoke Test Throwaway')).toBe('Smoke Test Throwaway');
    expect(resolveTitleToPersist('  ', 'Smoke Test Throwaway')).toBe('Smoke Test Throwaway');
    expect(resolveTitleToPersist('Renamed', 'Smoke Test Throwaway')).toBe('Renamed');
  });
});
