import { describe, expect, it } from 'vitest';
import { hasDraftToProtect, NEW_POEM_CONFIRM_MESSAGE, planNewPoem } from '../newPoemConfirm';

describe('hasDraftToProtect', () => {
  it('treats any title or body as a draft worth confirming', () => {
    expect(hasDraftToProtect('a kettle hums', '')).toBe(true);
    expect(hasDraftToProtect('', 'Smoke Test')).toBe(true);
    expect(hasDraftToProtect('   ', '')).toBe(false);
  });
});

describe('planNewPoem', () => {
  it('Cancel aborts and does not discard', () => {
    expect(planNewPoem({
      confirmed: false,
      hasDraft: true,
      cloudPoemId: null,
      cloudCollectionId: null,
      isAuthenticated: false,
    })).toBe('abort');
  });

  it('guest OK blanks the local editor only', () => {
    expect(planNewPoem({
      confirmed: true,
      hasDraft: true,
      cloudPoemId: null,
      cloudCollectionId: null,
      isAuthenticated: false,
    })).toBe('blank-local');
  });

  it('signed-in collection poem creates a new cloud poem instead of wiping the current one', () => {
    expect(planNewPoem({
      confirmed: true,
      hasDraft: true,
      cloudPoemId: 'poem-1',
      cloudCollectionId: 'col-1',
      isAuthenticated: true,
    })).toBe('create-cloud');
  });

  it('does not blank a cloud poem in place when there is no collection', () => {
    expect(planNewPoem({
      confirmed: true,
      hasDraft: true,
      cloudPoemId: 'poem-1',
      cloudCollectionId: null,
      isAuthenticated: true,
    })).toBe('blank-local-after-leave');
  });

  it('confirm copy says Cancel keeps the draft', () => {
    expect(NEW_POEM_CONFIRM_MESSAGE).toMatch(/Cancel keeps this draft/i);
    expect(NEW_POEM_CONFIRM_MESSAGE).not.toMatch(/Cancel to discard/i);
  });
});
