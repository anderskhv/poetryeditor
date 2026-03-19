import { useEffect, useRef, useCallback, useState } from 'react';
import { EditorView, ViewPlugin, ViewUpdate, Decoration, DecorationSet, keymap, lineNumbers } from '@codemirror/view';
import { EditorState, RangeSetBuilder, Transaction } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { parseMarkdownFormatting } from '../utils/markdownFormatter';
import { computeFormatting } from '../utils/formattingEngine';
import { analyzeText } from '../utils/nlpProcessor';
import { WordInfo } from '../types';
import { type EditorHandle } from '../types/editorHandle';
import './MobileEditor.css';

// Re-export the same props interface as PoetryEditor for compatibility
interface MobileEditorProps {
  value: string;
  onChange: (value: string) => void;
  poemId?: string | null;
  poemTitle: string;
  onTitleChange: (title: string) => void;
  onWordsAnalyzed?: (words: WordInfo[]) => void;
  highlightedPOS?: string | null;
  isDarkMode?: boolean;
  editorTheme?: 'light' | 'dark' | 'yellow';
  editorFont?: string;
  lineSpacing?: 'normal' | 'relaxed' | 'spacious';
  readOnly?: boolean;
  hideTitle?: boolean;
  onEditorMount?: (handle: EditorHandle) => void;
  // These props are accepted for API compatibility but not used on mobile v1
  meterColoringData?: unknown;
  syllableColoringData?: unknown;
  rhythmVariationColoringData?: unknown;
  lineLengthColoringData?: unknown;
  punctuationColoringData?: unknown;
  passiveVoiceColoringData?: unknown;
  tenseColoringData?: unknown;
  scansionColoringData?: unknown;
  highlightedLines?: unknown;
  highlightedWords?: unknown;
  onLineHover?: unknown;
  paragraphAlign?: unknown;
  firstLineIndent?: unknown;
  comments?: unknown;
  onAddComment?: unknown;
  showCommentHighlights?: unknown;
  onToggleCommentHighlights?: unknown;
  poemMetadata?: unknown;
}

const LINE_SPACING_VALUES = {
  normal: '32px',
  relaxed: '36px',
  spacious: '40px',
};

// --- Theme definitions ---

function buildTheme(
  editorTheme: 'light' | 'dark' | 'yellow',
  fontFamily: string,
  lineHeight: string,
) {
  const colors = {
    light: {
      bg: '#fdfcfa', fg: '#2c2c2c', selection: '#e8e6e3',
      gutterBg: '#fdfcfa', gutterFg: '#c0c0c0', cursor: '#2c2c2c',
    },
    dark: {
      bg: '#242428', fg: '#e0e0e0', selection: '#3a3a3e',
      gutterBg: '#242428', gutterFg: '#505050', cursor: '#e0e0e0',
    },
    yellow: {
      bg: '#f5e6b8', fg: '#3a3020', selection: '#e8d8a0',
      gutterBg: '#f5e6b8', gutterFg: '#b0a080', cursor: '#3a3020',
    },
  }[editorTheme];

  return EditorView.theme({
    '&': {
      backgroundColor: colors.bg,
      color: colors.fg,
      height: '100%',
    },
    '.cm-content': {
      fontFamily,
      fontSize: '17px',
      lineHeight,
      padding: '24px 0 40px 0',
      caretColor: colors.cursor,
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: `${colors.selection} !important`,
    },
    '.cm-gutters': {
      backgroundColor: colors.gutterBg,
      color: colors.gutterFg,
      border: 'none',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent',
    },
    '.cm-activeLine': {
      backgroundColor: 'transparent',
    },
    '.cm-cursor': {
      borderLeftColor: colors.cursor,
    },
    '.cm-scroller': {
      overflow: 'auto',
    },
  }, { dark: editorTheme === 'dark' });
}

// --- Markdown decoration plugin ---

const markdownDecoPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildMarkdownDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildMarkdownDecorations(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

function buildMarkdownDecorations(view: EditorView): DecorationSet {
  const text = view.state.doc.toString();
  const ranges = parseMarkdownFormatting(text);

  if (ranges.length === 0) return Decoration.none;

  const builder = new RangeSetBuilder<Decoration>();

  // Sort by startOffset (they should already be sorted, but be safe)
  const sorted = [...ranges].sort((a, b) => a.startOffset - b.startOffset);

  // We need to add decorations in document order with no overlapping ranges
  // For bold+italic (***text***), we get overlapping ranges. Handle them carefully.
  // Build a flat list of decoration segments
  type Segment = { from: number; to: number; deco: Decoration };
  const segments: Segment[] = [];

  for (const r of sorted) {
    // Opening marker — dim it
    segments.push({
      from: r.startOffset,
      to: r.contentStartOffset,
      deco: Decoration.mark({ class: `cm-md-marker cm-md-${r.type}-marker` }),
    });

    // Content — style it
    segments.push({
      from: r.contentStartOffset,
      to: r.contentEndOffset,
      deco: Decoration.mark({ class: `cm-md-${r.type}` }),
    });

    // Closing marker — dim it
    segments.push({
      from: r.contentEndOffset,
      to: r.endOffset,
      deco: Decoration.mark({ class: `cm-md-marker cm-md-${r.type}-marker` }),
    });
  }

  // Sort segments and add to builder (must be in document order)
  segments.sort((a, b) => a.from - b.from || a.to - b.to);

  for (const seg of segments) {
    if (seg.from < seg.to) {
      builder.add(seg.from, seg.to, seg.deco);
    }
  }

  return builder.finish();
}

// --- Formatting helpers ---

function applyFormattingToView(
  view: EditorView,
  type: 'bold' | 'italic' | 'underline',
): boolean {
  const state = view.state;
  const { from, to } = state.selection.main;
  const fullText = state.doc.toString();

  // Get word at cursor for no-selection case
  let wordAtCursor: { startOffset: number; endOffset: number; text: string } | undefined;
  if (from === to) {
    const word = state.wordAt(from);
    if (word) {
      wordAtCursor = {
        startOffset: word.from,
        endOffset: word.to,
        text: state.doc.sliceString(word.from, word.to),
      };
    }
  }

  const result = computeFormatting(fullText, from, to, type, wordAtCursor);
  if (!result) return false;

  // Convert FormattingEdit[] to CM6 ChangeSpec[]
  // Must be sorted by position for CM6
  const sortedEdits = [...result.edits].sort((a, b) => a.startOffset - b.startOffset);
  const changes = sortedEdits.map((edit) => ({
    from: edit.startOffset,
    to: edit.endOffset,
    insert: edit.newText,
  }));

  view.dispatch({
    changes,
    selection: { anchor: result.newSelectionStart, head: result.newSelectionEnd },
  });

  return true;
}

// --- Enter handler for formatting continuation ---

function handleEnterInFormatting(view: EditorView): boolean {
  const state = view.state;
  const { from, to } = state.selection.main;
  if (from !== to) return false; // has selection, let default handle it

  const fullText = state.doc.toString();
  const cursorOffset = from;
  const formattedRanges = parseMarkdownFormatting(fullText);

  const region = formattedRanges.find(
    (r) => cursorOffset >= r.contentStartOffset && cursorOffset <= r.contentEndOffset
  );
  if (!region) return false;

  const marker = region.type === 'bold' ? '**' : region.type === 'underline' ? '__' : '*';

  if (cursorOffset === region.contentStartOffset) {
    // At start of content: insert blank line before
    view.dispatch({
      changes: { from: region.startOffset, to: region.startOffset, insert: '\n' },
    });
    return true;
  }

  if (cursorOffset === region.contentEndOffset) {
    // At end of content: end formatting, start new plain line
    view.dispatch({
      changes: { from: region.endOffset, to: region.endOffset, insert: '\n' },
      selection: { anchor: region.endOffset + 1 },
    });
    return true;
  }

  // In the middle: split into two formatted lines
  const insertText = `${marker}\n${marker}`;
  view.dispatch({
    changes: { from: cursorOffset, to: cursorOffset, insert: insertText },
    selection: { anchor: cursorOffset + marker.length + 1 + marker.length },
  });
  return true;
}

// --- Backspace handler for formatted line merging ---

function handleBackspaceInFormatting(view: EditorView): boolean {
  const state = view.state;
  const { from, to } = state.selection.main;
  if (from !== to) return false;

  const cursorOffset = from;
  const line = state.doc.lineAt(cursorOffset);

  // Only handle at start of line (not first line)
  if (cursorOffset !== line.from || line.number <= 1) return false;

  const fullText = state.doc.toString();
  const formattedRanges = parseMarkdownFormatting(fullText);

  const prevLine = state.doc.line(line.number - 1);

  // Find a formatted region ending on the previous line
  const endingRegion = formattedRanges.find((r) => {
    const rLine = state.doc.lineAt(r.endOffset);
    return rLine.number === prevLine.number;
  });

  // Find a formatted region starting on the current line
  const startingRegion = formattedRanges.find((r) => {
    const rLine = state.doc.lineAt(r.startOffset);
    return rLine.number === line.number;
  });

  if (endingRegion && startingRegion && endingRegion.type === startingRegion.type) {
    // Both lines formatted same type: merge
    view.dispatch({
      changes: {
        from: endingRegion.contentEndOffset,
        to: startingRegion.contentStartOffset,
        insert: ' ',
      },
    });
    return true;
  }

  if (endingRegion && !startingRegion) {
    // Previous ends formatted, current plain: join
    view.dispatch({
      changes: { from: endingRegion.contentEndOffset, to: cursorOffset, insert: ' ' },
    });
    return true;
  }

  if (!endingRegion && startingRegion) {
    // Previous plain, current starts formatted: join
    view.dispatch({
      changes: { from: cursorOffset - 1, to: startingRegion.contentStartOffset, insert: ' ' },
    });
    return true;
  }

  return false;
}

// --- Delete handler for formatted line merging ---

function handleDeleteInFormatting(view: EditorView): boolean {
  const state = view.state;
  const { from, to } = state.selection.main;
  if (from !== to) return false;

  const cursorOffset = from;
  const line = state.doc.lineAt(cursorOffset);

  // Only handle at end of line (not last line)
  if (cursorOffset !== line.to || line.number >= state.doc.lines) return false;

  const fullText = state.doc.toString();
  const formattedRanges = parseMarkdownFormatting(fullText);

  // Find a formatted region ending on the current line
  const endingRegion = formattedRanges.find((r) => {
    const rLine = state.doc.lineAt(r.endOffset);
    return rLine.number === line.number;
  });

  // Find a formatted region starting on the next line
  const nextLine = state.doc.line(line.number + 1);
  const startingRegion = formattedRanges.find((r) => {
    const rLine = state.doc.lineAt(r.startOffset);
    return rLine.number === nextLine.number;
  });

  if (endingRegion && startingRegion && endingRegion.type === startingRegion.type) {
    view.dispatch({
      changes: {
        from: endingRegion.contentEndOffset,
        to: startingRegion.contentStartOffset,
        insert: ' ',
      },
    });
    return true;
  }

  if (endingRegion && !startingRegion) {
    view.dispatch({
      changes: { from: endingRegion.contentEndOffset, to: nextLine.from, insert: ' ' },
    });
    return true;
  }

  if (!endingRegion && startingRegion) {
    view.dispatch({
      changes: { from: cursorOffset, to: startingRegion.contentStartOffset, insert: ' ' },
    });
    return true;
  }

  return false;
}

// --- Main Component ---

export function MobileEditor({
  value,
  onChange,
  poemId,
  poemTitle,
  onTitleChange,
  onWordsAnalyzed,
  editorTheme = 'light',
  editorFont,
  lineSpacing = 'normal',
  readOnly = false,
  hideTitle = false,
  onEditorMount,
}: MobileEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isLocalChangeRef = useRef(false);
  const analyzeTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const fontFamily = editorFont || "'Libre Baskerville', Georgia, 'Times New Roman', serif";
  const lineHeightPx = LINE_SPACING_VALUES[lineSpacing];

  // Stable onChange ref to avoid recreating extensions
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onWordsAnalyzedRef = useRef(onWordsAnalyzed);
  onWordsAnalyzedRef.current = onWordsAnalyzed;

  // --- Create editor ---
  useEffect(() => {
    if (!containerRef.current) return;

    const theme = buildTheme(editorTheme, fontFamily, lineHeightPx);

    const formattingKeymap = keymap.of([
      {
        key: 'Mod-b',
        run: (v) => applyFormattingToView(v, 'bold'),
      },
      {
        key: 'Mod-i',
        run: (v) => applyFormattingToView(v, 'italic'),
      },
      {
        key: 'Mod-u',
        run: (v) => applyFormattingToView(v, 'underline'),
      },
      {
        key: 'Enter',
        run: handleEnterInFormatting,
      },
      {
        key: 'Backspace',
        run: handleBackspaceInFormatting,
      },
      {
        key: 'Delete',
        run: handleDeleteInFormatting,
      },
    ]);

    const updateListener = EditorView.updateListener.of((update: ViewUpdate) => {
      if (update.docChanged) {
        // Check if this was a local change (user typing)
        const isLocal = update.transactions.some(
          (tr) => tr.annotation(Transaction.userEvent) !== undefined
        );
        if (isLocal) {
          isLocalChangeRef.current = true;
          const newText = update.state.doc.toString();
          onChangeRef.current(newText);

          // Debounced analysis
          if (analyzeTimerRef.current) clearTimeout(analyzeTimerRef.current);
          analyzeTimerRef.current = setTimeout(() => {
            if (onWordsAnalyzedRef.current) {
              const words = analyzeText(newText);
              onWordsAnalyzedRef.current(words);
            }
          }, 300);
        }
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        formattingKeymap,
        keymap.of([...defaultKeymap, ...historyKeymap]),
        history(),
        lineNumbers(),
        EditorView.lineWrapping,
        EditorState.readOnly.of(readOnly),
        EditorView.editable.of(!readOnly),
        theme,
        markdownDecoPlugin,
        updateListener,
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    // Initial analysis
    if (onWordsAnalyzed) {
      const words = analyzeText(value);
      onWordsAnalyzed(words);
    }

    return () => {
      view.destroy();
      viewRef.current = null;
      if (analyzeTimerRef.current) clearTimeout(analyzeTimerRef.current);
    };
    // Only recreate on theme/font/spacing/readOnly change — NOT on value change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorTheme, fontFamily, lineHeightPx, readOnly, poemId]);

  // --- Sync external value changes ---
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    if (isLocalChangeRef.current) {
      isLocalChangeRef.current = false;
      return;
    }

    const currentText = view.state.doc.toString();
    if (value !== currentText) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
    }
  }, [value]);

  // --- Expose EditorHandle ---
  useEffect(() => {
    if (!onEditorMount || !viewRef.current) return;

    const view = viewRef.current;
    const handle: EditorHandle = {
      applyFormatting: (type) => {
        applyFormattingToView(view, type);
        view.focus();
      },
      focus: () => view.focus(),
      pasteFromClipboard: async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (!text) return;
          const { from, to } = view.state.selection.main;
          view.dispatch({
            changes: { from, to, insert: text },
          });
          view.focus();
        } catch (err) {
          console.error('Clipboard paste failed:', err);
        }
      },
    };

    onEditorMount(handle as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onEditorMount, editorTheme, fontFamily, lineHeightPx, readOnly, poemId]);

  // --- Title editing ---
  const handleTitleDoubleClick = useCallback(() => {
    if (!readOnly) setIsEditingTitle(true);
  }, [readOnly]);

  const handleTitleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsEditingTitle(false);
      onTitleChange(e.target.value);
    },
    [onTitleChange]
  );

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        setIsEditingTitle(false);
        onTitleChange((e.target as HTMLInputElement).value);
      }
    },
    [onTitleChange]
  );

  return (
    <div className={`mobile-editor-wrapper mobile-editor-${editorTheme}`}>
      {!hideTitle && (
        <div className="mobile-editor-title-bar">
          {isEditingTitle ? (
            <input
              className="mobile-editor-title-input"
              defaultValue={poemTitle}
              autoFocus
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
            />
          ) : (
            <h2
              className="mobile-editor-title"
              onDoubleClick={handleTitleDoubleClick}
              title="Double-click to rename"
            >
              {poemTitle || 'Untitled'}
            </h2>
          )}
        </div>
      )}
      <div
        ref={containerRef}
        className="mobile-editor-cm-container"
      />
    </div>
  );
}

export default MobileEditor;
