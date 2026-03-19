/**
 * Unified editor handle exposed by both Monaco (desktop) and CodeMirror (mobile).
 * App.tsx uses this instead of raw Monaco editor instance.
 */
export interface EditorHandle {
  applyFormatting: (type: 'bold' | 'italic' | 'underline') => void;
  focus: () => void;
  pasteFromClipboard: () => Promise<void>;
  /** Jump to a line/column range and reveal it. Desktop only — no-op on mobile. */
  jumpToRange?: (range: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number }) => void;
}
