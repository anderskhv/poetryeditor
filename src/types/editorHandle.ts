/**
 * Unified editor handle exposed by both Monaco (desktop) and CodeMirror (mobile).
 * App.tsx uses this instead of raw Monaco editor instance.
 */
export interface EditorHandle {
  applyFormatting: (type: 'bold' | 'italic' | 'underline') => void;
  focus: () => void;
  pasteFromClipboard: () => Promise<void>;
  /** Live editor buffer. Cloud save must persist this, not a lagged React `text`. */
  getValue: () => string;
  /** Live title field. Empty string is allowed; persist must not use it to wipe a known title. */
  getTitle: () => string;
  /** Jump to a line/column range and reveal it. Desktop only — no-op on mobile. */
  jumpToRange?: (range: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number }) => void;
}
