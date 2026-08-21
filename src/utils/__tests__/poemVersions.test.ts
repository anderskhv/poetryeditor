import { describe, expect, it } from 'vitest';
import {
  groupPoemVersions,
  isVersionForPoem,
  versionDisplayTitle,
  type PoemVersion,
} from '../poemVersions';

const version = (
  overrides: Partial<PoemVersion> & Pick<PoemVersion, 'id' | 'poem_id' | 'content'>
): PoemVersion => ({
  user_id: 'user-1',
  title: 'Untitled',
  created_at: '2026-08-21T12:00:00.000Z',
  hash: overrides.id,
  ...overrides,
});

describe('groupPoemVersions', () => {
  it('keeps versions on the poem they belong to', () => {
    const grouped = groupPoemVersions([
      version({ id: 'v1', poem_id: 'poem-a', title: 'UX Walk Poem', content: 'kettle steam test' }),
      version({ id: 'v2', poem_id: 'poem-b', title: 'Untitled', content: 'test kettle hums on the sillunting' }),
    ], ['poem-a', 'poem-b']);

    expect(grouped['poem-a']).toHaveLength(1);
    expect(grouped['poem-a'][0].content).toBe('kettle steam test');
    expect(grouped['poem-b'][0].content).toContain('sillunting');
  });

  it('drops rows whose poem_id does not match the requested poems', () => {
    const grouped = groupPoemVersions([
      version({ id: 'v1', poem_id: 'poem-a', content: 'mine' }),
      version({ id: 'v-leak', poem_id: 'poem-other', content: 'someone else' }),
      version({ id: 'v-empty', poem_id: '', content: 'orphan' }),
    ], ['poem-a']);

    expect(grouped['poem-a'].map(item => item.id)).toEqual(['v1']);
    expect(grouped['poem-other']).toBeUndefined();
  });
});

describe('isVersionForPoem', () => {
  it('rejects a version that points at another poem', () => {
    expect(isVersionForPoem({ poem_id: 'poem-b' }, 'poem-a')).toBe(false);
    expect(isVersionForPoem({ poem_id: 'poem-a' }, 'poem-a')).toBe(true);
  });
});

describe('versionDisplayTitle', () => {
  it('uses the poem title when the snapshot is still Untitled', () => {
    expect(versionDisplayTitle('Untitled', 'UX Walk Poem')).toBe('UX Walk Poem');
  });

  it('keeps a version title the poet actually set', () => {
    expect(versionDisplayTitle('Kettle draft', 'UX Walk Poem')).toBe('Kettle draft');
  });
});
