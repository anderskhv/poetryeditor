export interface LookupPointerEvent {
  button?: number;
  altKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
}

/**
 * Ordinary left-click / tap must place a caret.
 * Word lookup is opt-in: right-click or a modifier+click.
 */
export function shouldOpenWordLookup(event?: LookupPointerEvent | null): boolean {
  if (!event) return false;
  if (event.button === 2) return true;
  if (event.altKey || event.metaKey || event.ctrlKey) return true;
  return false;
}

export const WORD_LOOKUP_LONG_PRESS_MS = 500;
