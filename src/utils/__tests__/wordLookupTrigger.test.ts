import { describe, expect, it } from 'vitest';
import { shouldOpenWordLookup } from '../wordLookupTrigger';

describe('shouldOpenWordLookup', () => {
  it('does not steal an ordinary left click', () => {
    expect(shouldOpenWordLookup({ button: 0 })).toBe(false);
    expect(shouldOpenWordLookup({ button: 0, altKey: false, metaKey: false, ctrlKey: false })).toBe(false);
  });

  it('opens on right-click', () => {
    expect(shouldOpenWordLookup({ button: 2 })).toBe(true);
  });

  it('opens on modifier+click', () => {
    expect(shouldOpenWordLookup({ button: 0, altKey: true })).toBe(true);
    expect(shouldOpenWordLookup({ button: 0, metaKey: true })).toBe(true);
    expect(shouldOpenWordLookup({ button: 0, ctrlKey: true })).toBe(true);
  });

  it('does not open when the event is missing', () => {
    expect(shouldOpenWordLookup(undefined)).toBe(false);
    expect(shouldOpenWordLookup(null)).toBe(false);
  });
});
