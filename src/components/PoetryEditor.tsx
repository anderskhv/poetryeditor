import { useEffect, useRef, useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { analyzeText } from '../utils/nlpProcessor';
import { WordInfo } from '../types';
import { type PassiveVoiceInstance } from '../utils/passiveVoiceDetector';
import { type TenseInstance } from '../utils/tenseChecker';
import { type StressedSyllableInstance } from '../utils/scansionAnalyzer';
import { parseMarkdownFormatting } from '../utils/markdownFormatter';
import { WordPopup } from './WordPopup';

export type WordRange = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
};

type EditorSelection = ReturnType<editor.IStandaloneCodeEditor['getSelection']>;

interface PoetryEditorProps {
  value: string;
  onChange: (value: string) => void;
  poemId?: string | null;
  poemTitle: string;
  onTitleChange: (title: string) => void;
  onWordsAnalyzed?: (words: WordInfo[]) => void;
  highlightedPOS?: string | null;
  isDarkMode?: boolean;
  meterColoringData?: {
    syllableCounts: number[];
    medianSyllableCount: number;
    violatingLines: number[];
    isFreeOrMixed: boolean;
  } | null;
  syllableColoringData?: {
    syllableCounts: number[];
    medianSyllableCount: number;
  } | null;
  rhythmVariationColoringData?: {
    syllableCounts: number[];
  } | null;
  lineLengthColoringData?: {
    text: string;
    medianWords: number;
  } | null;
  punctuationColoringData?: {
    enjambedLines: number[];
  } | null;
  passiveVoiceColoringData?: {
    passiveInstances: PassiveVoiceInstance[];
  } | null;
  tenseColoringData?: {
    tenseInstances: TenseInstance[];
  } | null;
  scansionColoringData?: {
    syllableInstances: StressedSyllableInstance[];
  } | null;
  highlightedLines?: number[] | null;
  highlightedWords?: { word: string; lineNumber: number }[] | null;
  onLineHover?: (lineNumber: number | null) => void;
  editorFont?: string;
  paragraphAlign?: 'left' | 'center' | 'right';
  editorTheme?: 'light' | 'dark' | 'yellow';
  firstLineIndent?: boolean;
  lineSpacing?: 'normal' | 'relaxed' | 'spacious';
  onEditorMount?: (editor: editor.IStandaloneCodeEditor) => void;
  readOnly?: boolean;
  hideTitle?: boolean;
  poemMetadata?: {
    poet: string;
    poetUrl: string;
    collection?: string;
    collectionUrl?: string;
    year: number;
  };
}

// Line spacing values in pixels (at 17px font size)
const LINE_SPACING_VALUES = {
  normal: 32,    // ~1.8x
  relaxed: 36,   // ~2.0x
  spacious: 40,  // ~2.2x
};

// Color scheme for POS highlighting - sharper, more vibrant colors
const POS_COLORS = {
  Noun: '#2E7D32',        // forest green
  Verb: '#7B1FA2',        // deep purple
  Adjective: '#C62828',   // crimson red
  Adverb: '#F57C00',      // vivid orange
  Pronoun: '#0277BD',     // bright blue
  Conjunction: '#AD1457', // magenta
  Preposition: '#5D4037', // brown
  Article: '#616161',     // dark gray
  Other: '#424242',       // charcoal
};

export function PoetryEditor({ value, onChange, poemId, poemTitle, onTitleChange, onWordsAnalyzed, highlightedPOS, isDarkMode, meterColoringData, syllableColoringData, rhythmVariationColoringData, lineLengthColoringData, punctuationColoringData, passiveVoiceColoringData, tenseColoringData, scansionColoringData, highlightedLines, highlightedWords, onLineHover, editorFont, paragraphAlign = 'left', editorTheme = 'light', firstLineIndent = false, lineSpacing = 'normal', onEditorMount, readOnly = false, hideTitle = false, poemMetadata }: PoetryEditorProps) {
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [popupState, setPopupState] = useState<{
    word: string;
    position: { top: number; left: number };
    range: WordRange;
  } | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const copyToastTimerRef = useRef<number | null>(null);
  const lastSelectionRef = useRef<EditorSelection>(null);
  const restoreSelectionRef = useRef(false);

  const handleEditorDidMount = (editorInstance: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editorInstance;
    monacoRef.current = monaco;

    const updateLayoutVars = () => {
      if (!containerRef.current) return;
      const layout = editorInstance.getLayoutInfo();
      containerRef.current.style.setProperty('--editor-content-left', `${layout.contentLeft}px`);
      containerRef.current.style.setProperty('--editor-content-width', `${layout.contentWidth}px`);
      const totalWidth = layout.width - (layout.verticalScrollbarWidth || 0);
      containerRef.current.style.setProperty('--editor-total-width', `${totalWidth}px`);
    };

    // Expose editor to parent component
    if (onEditorMount) {
      onEditorMount(editorInstance);
    }

    // Register custom language for poetry
    monaco.languages.register({ id: 'poetry' });

    // Define light theme - warm paper aesthetic
    monaco.editor.defineTheme('poetry-theme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'noun', foreground: POS_COLORS.Noun.substring(1) },
        { token: 'verb', foreground: POS_COLORS.Verb.substring(1) },
        { token: 'adjective', foreground: POS_COLORS.Adjective.substring(1) },
        { token: 'adverb', foreground: POS_COLORS.Adverb.substring(1) },
        { token: 'other', foreground: POS_COLORS.Other.substring(1) },
      ],
      colors: {
        'editor.background': '#fdfcfa',
        'editor.foreground': '#2c2c2c',
        'editor.lineHighlightBackground': '#fdfcfa',
        'editorCursor.foreground': '#2c2c2c',
        'editor.selectionBackground': '#e8e6e3',
        'editorLineNumber.foreground': '#c0c0c0',
        'editorLineNumber.activeForeground': '#9a9a9a',
      },
    });

    // Define dark theme - night paper aesthetic
    monaco.editor.defineTheme('poetry-theme-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'noun', foreground: '81C784' },
        { token: 'verb', foreground: 'CE93D8' },
        { token: 'adjective', foreground: 'EF9A9A' },
        { token: 'adverb', foreground: 'FFB74D' },
        { token: 'other', foreground: 'BDBDBD' },
      ],
      colors: {
        'editor.background': '#242428',
        'editor.foreground': '#e0e0e0',
        'editor.lineHighlightBackground': '#242428',
        'editorCursor.foreground': '#e0e0e0',
        'editor.selectionBackground': '#3a3a3e',
        'editorLineNumber.foreground': '#505050',
        'editorLineNumber.activeForeground': '#707070',
      },
    });

    // Define yellow/parchment theme
    monaco.editor.defineTheme('poetry-theme-yellow', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'noun', foreground: POS_COLORS.Noun.substring(1) },
        { token: 'verb', foreground: POS_COLORS.Verb.substring(1) },
        { token: 'adjective', foreground: POS_COLORS.Adjective.substring(1) },
        { token: 'adverb', foreground: POS_COLORS.Adverb.substring(1) },
        { token: 'other', foreground: POS_COLORS.Other.substring(1) },
      ],
      colors: {
        'editor.background': '#f5e6b8',
        'editor.foreground': '#3a3020',
        'editor.lineHighlightBackground': '#f5e6b8',
        'editorCursor.foreground': '#3a3020',
        'editor.selectionBackground': '#e8d8a0',
        'editorLineNumber.foreground': '#b0a080',
        'editorLineNumber.activeForeground': '#8a7a60',
      },
    });

    // Set initial theme
    const themeName = editorTheme === 'dark' ? 'poetry-theme-dark' : editorTheme === 'yellow' ? 'poetry-theme-yellow' : 'poetry-theme';
    monaco.editor.setTheme(themeName);

    updateLayoutVars();
    editorInstance.onDidLayoutChange(() => {
      updateLayoutVars();
    });

    // Handle click events to show word popup
    editorInstance.onMouseDown((e) => {
      if (e.target.type !== monaco.editor.MouseTargetType.CONTENT_TEXT) return;

      const position = e.target.position;
      if (!position) return;

      const model = editorInstance.getModel();
      if (!model) return;

      const lineContent = model.getLineContent(position.lineNumber);
      const columnIndex = position.column - 1;
      if (columnIndex < 0 || columnIndex >= lineContent.length) return;

      // Only trigger when the click is on an actual word character
      const wordRegex = /[a-zA-Z]+(?:[''\u2019][a-zA-Z]+|[-\u2013\u2014][a-zA-Z]+)?/g;
      let clickedWordText: string | null = null;
      let clickedRange: WordRange | null = null;

      for (const match of lineContent.matchAll(wordRegex)) {
        const start = match.index ?? 0;
        const end = start + match[0].length;
        if (columnIndex >= start && columnIndex < end) {
          clickedWordText = match[0];
          clickedRange = {
            startLineNumber: position.lineNumber,
            startColumn: start + 1,
            endLineNumber: position.lineNumber,
            endColumn: end + 1,
          };
          break;
        }
      }

      if (!clickedWordText || !clickedRange || !containerRef.current) return;

      const domNode = editorInstance.getDomNode();
      if (!domNode) return;

      const editorRect = domNode.getBoundingClientRect();
      const startPos = editorInstance.getScrolledVisiblePosition({
        lineNumber: clickedRange.startLineNumber,
        column: clickedRange.startColumn,
      });
      const endPos = editorInstance.getScrolledVisiblePosition({
        lineNumber: clickedRange.endLineNumber,
        column: clickedRange.endColumn,
      });
      if (!startPos || !endPos) return;

      const wordTop = editorRect.top + startPos.top;
      const wordLeft = editorRect.left + startPos.left;
      const wordRight = editorRect.left + Math.max(endPos.left, startPos.left + 8);
      const wordBottom = wordTop + startPos.height;

      const popupWidth = 420;
      const popupHeight = 520;
      const gap = 24;
      const margin = 12;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const wordRect = {
        left: wordLeft,
        right: wordRight,
        top: wordTop,
        bottom: wordBottom,
      };

      const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
      const overlapsWord = (left: number, top: number) => {
        const right = left + popupWidth;
        const bottom = top + popupHeight;
        return !(
          right < wordRect.left ||
          left > wordRect.right ||
          bottom < wordRect.top ||
          top > wordRect.bottom
        );
      };

      const preferBelow = wordRect.right + popupWidth + gap > viewportWidth - margin;
      const candidates = preferBelow
        ? [
            { left: wordRect.left, top: wordRect.bottom + gap },
            { left: wordRect.left, top: wordRect.top - popupHeight - gap },
            { left: wordRect.left - popupWidth - gap, top: wordRect.bottom + gap },
            { left: wordRect.right + gap, top: wordRect.bottom + gap },
          ]
        : [
            { left: wordRect.right + gap, top: wordRect.top - 12 },
            { left: wordRect.left - popupWidth - gap, top: wordRect.top - 12 },
            { left: wordRect.left, top: wordRect.top - popupHeight - gap },
            { left: wordRect.left, top: wordRect.bottom + gap },
          ];

      let chosen = candidates.find(c => !overlapsWord(c.left, c.top));
      if (!chosen) {
        const pushRight = wordRect.right + gap + popupWidth <= viewportWidth;
        const pushLeft = wordRect.left - gap - popupWidth >= 0;
        if (pushRight) {
          chosen = { left: wordRect.right + gap, top: wordRect.bottom + gap };
        } else if (pushLeft) {
          chosen = { left: wordRect.left - popupWidth - gap, top: wordRect.bottom + gap };
        } else {
          chosen = { left: wordRect.left, top: wordRect.bottom + gap };
        }
      }

      let left = clamp(chosen.left, margin, viewportWidth - popupWidth - margin);
      let top = clamp(chosen.top, margin, viewportHeight - popupHeight - margin);
      if (overlapsWord(left, top)) {
        left = chosen.left;
        top = chosen.top;
      }

      setPopupState({
        word: clickedWordText,
        position: { top, left },
        range: clickedRange,
      });
    });

    // Handle mouse move to track hovered line for rhyme highlighting
    editorInstance.onMouseMove((e) => {
      if (e.target.type === monaco.editor.MouseTargetType.CONTENT_TEXT ||
          e.target.type === monaco.editor.MouseTargetType.CONTENT_EMPTY) {
        const position = e.target.position;
        if (position) {
          onLineHover?.(position.lineNumber);
        }
      } else {
        onLineHover?.(null);
      }
    });

    // Handle mouse leave to clear hovered line
    editorInstance.onMouseLeave(() => {
      onLineHover?.(null);
    });

    // Add keyboard shortcuts for formatting
    const wrapSelection = (prefix: string, suffix: string) => {
      const model = editorInstance.getModel();
      if (!model) return;

      const sel = editorInstance.getSelection();
      if (!sel) return;

      // Use parseMarkdownFormatting as the authoritative source of truth
      // for detecting existing formatted regions - no manual char scanning
      const formatType: 'bold' | 'italic' | 'underline' =
        prefix === '**' ? 'bold' : prefix === '*' ? 'italic' : 'underline';
      const fullText = model.getValue();
      const formattedRanges = parseMarkdownFormatting(fullText);

      const selStartOffset = model.getOffsetAt({
        lineNumber: sel.startLineNumber,
        column: sel.startColumn,
      });
      const selEndOffset = model.getOffsetAt({
        lineNumber: sel.endLineNumber,
        column: sel.endColumn,
      });

      // Check if cursor/selection overlaps a formatted region of the matching type.
      // This prevents re-wrapping when the selection includes markers and ensures
      // toggling removes formatting as expected.
      const region = formattedRanges.find(r =>
        r.type === formatType &&
        selEndOffset > r.startOffset &&
        selStartOffset < r.endOffset
      );

      if (region) {
        // UNWRAP: remove the formatting markers from this region
        const content = fullText.substring(
          region.contentStartOffset,
          region.contentEndOffset
        );
        const startPos = model.getPositionAt(region.startOffset);
        const endPos = model.getPositionAt(region.endOffset);

        editorInstance.executeEdits('formatting', [{
          range: {
            startLineNumber: startPos.lineNumber,
            startColumn: startPos.column,
            endLineNumber: endPos.lineNumber,
            endColumn: endPos.column,
          },
          text: content,
        }], [new monaco.Selection(
          startPos.lineNumber, startPos.column,
          startPos.lineNumber, startPos.column + content.length
        )]);
        updateDecorations();
        return;
      }

      // WRAP: no existing formatting of this type found at cursor/selection
      const selectedText = model.getValueInRange(sel);

      // If no selection, expand to word at cursor
      if (!selectedText) {
        const word = model.getWordAtPosition(sel.getPosition());
        if (!word) return;

        const wordRange = {
          startLineNumber: sel.startLineNumber,
          startColumn: word.startColumn,
          endLineNumber: sel.startLineNumber,
          endColumn: word.endColumn,
        };
        const wordText = model.getValueInRange(wordRange);
        if (!wordText) return;

        editorInstance.executeEdits('formatting', [{
          range: wordRange,
          text: `${prefix}${wordText}${suffix}`,
        }], [new monaco.Selection(
          sel.startLineNumber, word.startColumn + prefix.length,
          sel.startLineNumber, word.startColumn + prefix.length + wordText.length
        )]);
        updateDecorations();
        return;
      }

      // Only handle single-line selections for wrapping
      if (sel.startLineNumber !== sel.endLineNumber) return;

      const match = selectedText.match(/^(\s*)([\s\S]*?)(\s*)$/);
      const leading = match?.[1] ?? '';
      const core = match?.[2] ?? '';
      const trailing = match?.[3] ?? '';
      if (!core) return;

      const formatted = `${leading}${prefix}${core}${suffix}${trailing}`;
      const selectionStart = sel.startColumn + leading.length + prefix.length;
      const selectionEnd = selectionStart + core.length;

      editorInstance.executeEdits('formatting', [{
        range: sel,
        text: formatted,
      }], [new monaco.Selection(
        sel.startLineNumber, selectionStart,
        sel.startLineNumber, selectionEnd
      )]);
      updateDecorations();
    };

    // Bold: Cmd/Ctrl + B
    editorInstance.addAction({
      id: 'bold-text',
      label: 'Bold',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB],
      run: () => wrapSelection('**', '**'),
    });

    // Italic: Cmd/Ctrl + I
    editorInstance.addAction({
      id: 'italic-text',
      label: 'Italic',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI],
      run: () => wrapSelection('*', '*'),
    });

    // Underline: Cmd/Ctrl + U
    editorInstance.addAction({
      id: 'underline-text',
      label: 'Underline',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyU],
      run: () => wrapSelection('__', '__'),
    });

    // Apply initial decorations
    updateDecorations();
  };

  const updateDecorations = () => {
    if (!editorRef.current || !monacoRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;
    const currentText = model.getValue();

    const words = analyzeText(currentText);

    // Notify parent of analyzed words
    if (onWordsAnalyzed) {
      onWordsAnalyzed(words);
    }

    let newDecorations: editor.IModelDeltaDecoration[] = [];

    // Check which coloring mode is active (priority order matters)
    if (meterColoringData && !meterColoringData.isFreeOrMixed) {
      // Meter coloring mode
      const lines = currentText.split('\n');

      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const syllableCount = meterColoringData.syllableCounts[index];

        if (syllableCount === 0 || line.length === 0) return;

        const median = meterColoringData.medianSyllableCount;
        const percentageVariation = median > 0 ? Math.abs((syllableCount - median) / median) * 100 : 0;

        let className = '';
        if (percentageVariation === 0) {
          className = 'meter-perfect'; // Green
        } else if (percentageVariation <= 10) {
          className = 'meter-close'; // Yellow
        } else {
          className = 'meter-violation'; // Red
        }

        if (highlightedLines?.includes(lineNumber)) {
          className += ' meter-line-highlighted';
        }

        newDecorations.push({
          range: new monacoRef.current!.Range(lineNumber, 1, lineNumber, line.length + 1),
          options: {
            inlineClassName: className,
            inlineClassNameAffectsLetterSpacing: true,
          },
        });
      });
    } else if (syllableColoringData) {
      // Syllable count by line coloring mode
      const lines = currentText.split('\n');

      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const syllableCount = syllableColoringData.syllableCounts[index];

        if (syllableCount === 0 || line.length === 0) return;

        const median = syllableColoringData.medianSyllableCount;
        const percentageVariation = median > 0 ? Math.abs((syllableCount - median) / median) * 100 : 0;

        let className = '';
        if (percentageVariation === 0) {
          className = 'meter-perfect'; // Green
        } else if (percentageVariation <= 15) {
          className = 'meter-close'; // Yellow - within 15%
        } else {
          className = 'meter-violation'; // Red - more than 15%
        }

        if (highlightedLines?.includes(lineNumber)) {
          className += ' meter-line-highlighted';
        }

        newDecorations.push({
          range: new monacoRef.current!.Range(lineNumber, 1, lineNumber, line.length + 1),
          options: {
            inlineClassName: className,
            inlineClassNameAffectsLetterSpacing: true,
          },
        });
      });
    } else if (rhythmVariationColoringData) {
      // Rhythm variation coloring mode
      const lines = currentText.split('\n');

      const syllableCounts = rhythmVariationColoringData.syllableCounts;
      const nonEmptyLines = syllableCounts.filter(c => c > 0);

      if (nonEmptyLines.length > 0) {
        const sortedCounts = [...nonEmptyLines].sort((a, b) => a - b);
        const median = sortedCounts.length % 2 === 0
          ? (sortedCounts[sortedCounts.length / 2 - 1] + sortedCounts[sortedCounts.length / 2]) / 2
          : sortedCounts[Math.floor(sortedCounts.length / 2)];

        lines.forEach((line, index) => {
          const lineNumber = index + 1;
          const syllableCount = syllableCounts[index];

          if (syllableCount === 0 || line.length === 0) return;

          const percentageVariation = median > 0 ? Math.abs((syllableCount - median) / median) * 100 : 0;

          let className = '';
          if (percentageVariation === 0) {
            className = 'meter-perfect'; // Green
          } else if (percentageVariation <= 15) {
            className = 'meter-close'; // Yellow - within 15%
          } else {
            className = 'meter-violation'; // Red - more than 15%
          }

          if (highlightedLines?.includes(lineNumber)) {
            className += ' meter-line-highlighted';
          }

          newDecorations.push({
            range: new monacoRef.current!.Range(lineNumber, 1, lineNumber, line.length + 1),
            options: {
              inlineClassName: className,
              inlineClassNameAffectsLetterSpacing: true,
            },
          });
        });
      }
    } else if (lineLengthColoringData) {
      // Line length (words) coloring mode
      const lines = currentText.split('\n');

      const median = lineLengthColoringData.medianWords;

      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const trimmed = line.trim();

        if (trimmed.length === 0) return;

        const words = trimmed.split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;

        const deviation = Math.abs(wordCount - median);

        let className = '';
        if (deviation === 0) {
          className = 'meter-perfect'; // Green - exact match
        } else if (deviation <= 2) {
          className = 'meter-close'; // Yellow - within ±2 words
        } else {
          className = 'meter-violation'; // Red - more than ±2 words
        }

        if (highlightedLines?.includes(lineNumber)) {
          className += ' meter-line-highlighted';
        }

        newDecorations.push({
          range: new monacoRef.current!.Range(lineNumber, 1, lineNumber, line.length + 1),
          options: {
            inlineClassName: className,
            inlineClassNameAffectsLetterSpacing: true,
          },
        });
      });
    } else if (punctuationColoringData) {
      // Punctuation/enjambment coloring mode
      const lines = currentText.split('\n');

      const enjambedLineSet = new Set(punctuationColoringData.enjambedLines);

      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const trimmed = line.trim();

        if (trimmed.length === 0) return;

        let className = '';
        if (enjambedLineSet.has(lineNumber)) {
          className = 'meter-close'; // Yellow - enjambed lines
        } else {
          className = 'meter-perfect'; // Green - end-stopped lines
        }

        if (highlightedLines?.includes(lineNumber)) {
          className += ' meter-line-highlighted';
        }

        newDecorations.push({
          range: new monacoRef.current!.Range(lineNumber, 1, lineNumber, line.length + 1),
          options: {
            inlineClassName: className,
            inlineClassNameAffectsLetterSpacing: true,
          },
        });
      });
    } else if (passiveVoiceColoringData) {
      // Passive voice coloring mode
      passiveVoiceColoringData.passiveInstances.forEach(instance => {
        const startPosition = model.getPositionAt(instance.startOffset);
        const endPosition = model.getPositionAt(instance.endOffset);

        newDecorations.push({
          range: new monacoRef.current!.Range(
            startPosition.lineNumber,
            startPosition.column,
            endPosition.lineNumber,
            endPosition.column
          ),
          options: {
            inlineClassName: 'passive-voice-highlight',
            inlineClassNameAffectsLetterSpacing: true,
          },
        });
      });
    } else if (tenseColoringData) {
      // Tense verb coloring mode
      tenseColoringData.tenseInstances.forEach(instance => {
        const startPosition = model.getPositionAt(instance.startOffset);
        const endPosition = model.getPositionAt(instance.endOffset);

        newDecorations.push({
          range: new monacoRef.current!.Range(
            startPosition.lineNumber,
            startPosition.column,
            endPosition.lineNumber,
            endPosition.column
          ),
          options: {
            inlineClassName: 'tense-verb-highlight',
            inlineClassNameAffectsLetterSpacing: true,
          },
        });
      });
    } else if (scansionColoringData) {
      // Scansion coloring mode - bold stressed syllables
      scansionColoringData.syllableInstances.forEach(instance => {
        const startPosition = model.getPositionAt(instance.startOffset);
        const endPosition = model.getPositionAt(instance.endOffset);

        newDecorations.push({
          range: new monacoRef.current!.Range(
            startPosition.lineNumber,
            startPosition.column,
            endPosition.lineNumber,
            endPosition.column
          ),
          options: {
            inlineClassName: instance.stressed ? 'scansion-stressed' : 'scansion-unstressed',
            inlineClassNameAffectsLetterSpacing: true,
          },
        });
      });

      // Add line highlight if lines are being hovered in the analysis panel
      if (highlightedLines && highlightedLines.length > 0) {
        const lines = currentText.split('\n');
        highlightedLines.forEach(highlightedLine => {
          if (highlightedLine <= lines.length) {
            const line = lines[highlightedLine - 1];
            newDecorations.push({
              range: new monacoRef.current!.Range(highlightedLine, 1, highlightedLine, line.length + 1),
              options: {
                className: 'scansion-line-highlighted',
                isWholeLine: true,
              },
            });
          }
        });
      }
    } else if (meterColoringData && meterColoringData.isFreeOrMixed) {
      // For free verse/mixed, just show black text (no decorations needed)
      // Decorations array stays empty
    } else if (highlightedPOS) {
      // Only apply POS-based coloring when a POS is actively highlighted
      newDecorations = words.map(word => {
        const startPosition = editorRef.current!.getModel()!.getPositionAt(word.startOffset);
        const endPosition = editorRef.current!.getModel()!.getPositionAt(word.endOffset);

        // POS-based coloring with optional highlight
        const className = `pos-${word.pos.toLowerCase()}`;
        const isHighlighted = highlightedPOS && word.pos === highlightedPOS;
        const finalClassName = isHighlighted ? `${className} pos-highlighted` : className;

        return {
          range: new monacoRef.current!.Range(
            startPosition.lineNumber,
            startPosition.column,
            endPosition.lineNumber,
            endPosition.column
          ),
          options: {
            inlineClassName: finalClassName,
            inlineClassNameAffectsLetterSpacing: true,
          },
        };
      });
    } else {
      // Default: no coloring, just show plain black text
      // But still support line highlighting for hover
      if (highlightedLines && highlightedLines.length > 0) {
        const lines = currentText.split('\n');
        highlightedLines.forEach(highlightedLine => {
          if (highlightedLine <= lines.length) {
            const line = lines[highlightedLine - 1];
            newDecorations.push({
              range: new monacoRef.current!.Range(highlightedLine, 1, highlightedLine, line.length + 1),
              options: {
                className: 'scansion-line-highlighted',
                isWholeLine: true,
              },
            });
          }
        });
      }
    }

    // First line indent per paragraph
    if (firstLineIndent) {
      const lines = currentText.split('\n');
      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const trimmed = line.trim();
        if (trimmed.length === 0) return;
        const prevLine = index === 0 ? '' : lines[index - 1].trim();
        if (index !== 0 && prevLine.length > 0) return;

        newDecorations.push({
          range: new monacoRef.current!.Range(lineNumber, 1, lineNumber, line.length + 1),
          options: {
            className: 'line-first-indent',
            isWholeLine: true,
          },
        });
      });
    }

    // Word-level highlighting for rhymes and sound patterns - ALWAYS applies on top of other decorations
    if (highlightedWords && highlightedWords.length > 0) {
      const lines = currentText.split('\n');

      highlightedWords.forEach(({ word, lineNumber }) => {
        if (lineNumber >= 1 && lineNumber <= lines.length) {
          const line = lines[lineNumber - 1];
          const wordLower = word.toLowerCase();
          const lineLower = line.toLowerCase();

          // Find ALL occurrences of the word in the line (for sound patterns like alliteration)
          // Use regex to find whole word matches only
          const wordRegex = new RegExp(`\\b${wordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          let match;

          while ((match = wordRegex.exec(lineLower)) !== null) {
            const wordIndex = match.index;
            const startColumn = wordIndex + 1; // Monaco columns are 1-indexed
            const endColumn = startColumn + word.length;

            newDecorations.push({
              range: new monacoRef.current!.Range(lineNumber, startColumn, lineNumber, endColumn),
              options: {
                inlineClassName: 'rhyme-word-highlighted',
                inlineClassNameAffectsLetterSpacing: true,
              },
            });
          }
        }
      });
    }

    // Always apply markdown formatting decorations (independent of analysis modes)
    const markdownRanges = parseMarkdownFormatting(currentText);

    if (markdownRanges.length > 0) {
      markdownRanges.forEach(range => {
        // Get positions for markers and content
        const startMarkerStart = model.getPositionAt(range.startOffset);
        const startMarkerEnd = model.getPositionAt(range.contentStartOffset);
        const contentStart = model.getPositionAt(range.contentStartOffset);
        const contentEnd = model.getPositionAt(range.contentEndOffset);
        const endMarkerStart = model.getPositionAt(range.contentEndOffset);
        const endMarkerEnd = model.getPositionAt(range.endOffset);

        // Dim the opening marker characters (**, *, __)
        newDecorations.push({
          range: new monacoRef.current!.Range(
            startMarkerStart.lineNumber, startMarkerStart.column,
            startMarkerEnd.lineNumber, startMarkerEnd.column
          ),
          options: {
            inlineClassName: `md-${range.type}-marker`,
            inlineClassNameAffectsLetterSpacing: true,
          },
        });

        // Style the content
        newDecorations.push({
          range: new monacoRef.current!.Range(
            contentStart.lineNumber, contentStart.column,
            contentEnd.lineNumber, contentEnd.column
          ),
          options: {
            inlineClassName: `md-${range.type}-content`,
            inlineClassNameAffectsLetterSpacing: true,
          },
        });

        // Dim the closing marker characters
        newDecorations.push({
          range: new monacoRef.current!.Range(
            endMarkerStart.lineNumber, endMarkerStart.column,
            endMarkerEnd.lineNumber, endMarkerEnd.column
          ),
          options: {
            inlineClassName: `md-${range.type}-marker`,
            inlineClassNameAffectsLetterSpacing: true,
          },
        });
      });
    }

    // Apply decorations
    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );

    // Inject CSS for decorations
    injectStyles();
  };


  const injectStyles = () => {
    // Inject POS styles
    const posStyleId = 'poetry-pos-styles';
    if (!document.getElementById(posStyleId)) {
      const style = document.createElement('style');
      style.id = posStyleId;
      style.textContent = `
        /* POS-based styles */
        .pos-noun { color: ${POS_COLORS.Noun} !important; font-weight: 500; display: inline !important; }
        .pos-verb { color: ${POS_COLORS.Verb} !important; font-weight: 500; display: inline !important; }
        .pos-adjective { color: ${POS_COLORS.Adjective} !important; font-weight: 500; display: inline !important; }
        .pos-adverb { color: ${POS_COLORS.Adverb} !important; font-weight: 500; display: inline !important; }
        .pos-pronoun { color: ${POS_COLORS.Pronoun} !important; font-weight: 500; display: inline !important; }
        .pos-conjunction { color: ${POS_COLORS.Conjunction} !important; display: inline !important; }
        .pos-preposition { color: ${POS_COLORS.Preposition} !important; display: inline !important; }
        .pos-article { color: ${POS_COLORS.Article} !important; display: inline !important; }
        .pos-other { color: ${POS_COLORS.Other} !important; display: inline !important; }

        /* Highlighted POS style */
        .pos-highlighted {
          background-color: rgba(102, 126, 234, 0.2) !important;
          border-radius: 3px !important;
          padding: 2px 0 !important;
          font-weight: 700 !important;
        }

        /* Meter-based line coloring - editorial ink density */
        .meter-perfect {
          color: #5a5a5a !important; /* Base ink - consistent */
          font-weight: 500 !important;
          display: inline !important;
        }

        .meter-close {
          color: #7a7a7a !important; /* Lighter ink - slight variation */
          font-weight: 500 !important;
          display: inline !important;
        }

        .meter-violation {
          color: #8a7a6a !important; /* Warm tone - attention */
          font-weight: 500 !important;
          display: inline !important;
        }

        /* Highlighted line when hovering - very subtle background shade (2-3%) */
        .meter-line-highlighted {
          background-color: var(--color-highlight-subtle) !important;
        }

        /* Passive voice highlighting - subtle underline, not background */
        .passive-voice-highlight {
          background-color: transparent !important;
          border-bottom: 1px dotted rgba(0, 0, 0, 0.4) !important;
          font-weight: 500 !important;
          display: inline !important;
        }

        /* Tense verb highlighting - subtle underline */
        .tense-verb-highlight {
          background-color: transparent !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.3) !important;
          font-weight: 500 !important;
          display: inline !important;
        }

        /* Scansion highlighting - stressed syllables are bold */
        .scansion-stressed {
          font-weight: 700 !important;
          color: #4a4a4a !important;
          display: inline !important;
        }

        .scansion-unstressed {
          font-weight: 400 !important;
          color: #9a9a9a !important;
          display: inline !important;
        }

        /* Scansion line highlight when hovering - very subtle */
        .scansion-line-highlighted {
          background-color: var(--color-highlight-subtle) !important;
        }

        /* Rhyme word highlight - subtle background tint */
        .rhyme-word-highlighted {
          background-color: var(--color-highlight-subtle) !important;
          border-radius: 2px;
          padding: 1px 2px;
          box-shadow: none;
        }

        /* Dark mode highlight adjustments - very subtle */
        :root.dark-mode .scansion-line-highlighted {
          background-color: var(--color-highlight-subtle) !important;
        }

        :root.dark-mode .rhyme-word-highlighted {
          background-color: var(--color-highlight-subtle) !important;
          box-shadow: none;
          color: inherit !important;
        }

        :root.dark-mode .meter-line-highlighted {
          background-color: var(--color-highlight-subtle) !important;
        }

        :root.dark-mode .pos-highlighted {
          background-color: rgba(255, 255, 255, 0.08) !important;
        }

        :root.dark-mode .passive-voice-highlight {
          background-color: transparent !important;
          border-bottom-color: rgba(255, 255, 255, 0.4) !important;
        }

        :root.dark-mode .tense-verb-highlight {
          background-color: transparent !important;
          border-bottom-color: rgba(255, 255, 255, 0.3) !important;
        }

        :root.dark-mode .scansion-unstressed {
          color: #707070 !important;
        }

        :root.dark-mode .meter-perfect {
          color: #b0b0b0 !important;
        }

        :root.dark-mode .meter-close {
          color: #909090 !important;
        }

        :root.dark-mode .meter-violation {
          color: #a09080 !important;
        }

        /* Markdown formatting styles */
        .md-bold-marker {
          color: transparent !important;
          font-size: 0 !important;
          opacity: 0 !important;
          letter-spacing: -0.5ch !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        .md-bold-content {
          font-weight: 700 !important;
        }

        .md-italic-marker {
          color: transparent !important;
          font-size: 0 !important;
          opacity: 0 !important;
          letter-spacing: -0.5ch !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        .md-italic-content {
          font-style: italic !important;
        }

        .md-underline-marker {
          color: transparent !important;
          font-size: 0 !important;
          opacity: 0 !important;
          letter-spacing: -0.5ch !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        .md-underline-content {
          text-decoration: underline !important;
        }

        :root.dark-mode .md-bold-marker,
        :root.dark-mode .md-italic-marker,
        :root.dark-mode .md-underline-marker {
          color: transparent !important;
          opacity: 0 !important;
        }

        /* Remove all boxes, borders, and decorations from Monaco editor */
        .monaco-editor .squiggly-inline-unnecessary,
        .monaco-editor .squiggly-error,
        .monaco-editor .squiggly-warning,
        .monaco-editor .squiggly-info,
        .monaco-editor .squiggly-hint,
        .monaco-editor .detected-link,
        .monaco-editor .detected-link-active,
        .monaco-editor .bracket-highlighting-0,
        .monaco-editor .bracket-highlighting-1,
        .monaco-editor .bracket-highlighting-2,
        .monaco-editor .bracket-highlighting-3,
        .monaco-editor .bracket-highlighting-4,
        .monaco-editor .bracket-highlighting-5,
        .monaco-editor .inline-selected-text,
        .monaco-editor .wordHighlight,
        .monaco-editor .wordHighlightStrong,
        .monaco-editor .selectionHighlight,
        .monaco-editor .findMatch,
        .monaco-editor .currentFindMatch,
        .monaco-editor .unicode-highlight {
          border: none !important;
          border-bottom: none !important;
          border-top: none !important;
          text-decoration: none !important;
          background: transparent !important;
          box-shadow: none !important;
          outline: none !important;
        }

        /* Remove all view-overlays that create boxes */
        .monaco-editor .view-overlays .current-line ~ div,
        .monaco-editor .view-overlays > div[class*="cigr"] {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  };



  // Update decorations when value changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateDecorations();
    }, 300); // Debounce decoration updates

    return () => clearTimeout(timer);
  }, [value]);

  // Update decorations when highlightedPOS changes (no debounce for instant feedback)
  useEffect(() => {
    updateDecorations();
  }, [highlightedPOS]);

  // Update decorations when meterColoringData changes (no debounce for instant feedback)
  useEffect(() => {
    updateDecorations();
  }, [meterColoringData]);

  // Update decorations when highlightedLines changes (no debounce for instant feedback)
  useEffect(() => {
    updateDecorations();
  }, [highlightedLines]);

  // Update decorations when highlightedWords changes (word-level rhyme highlighting)
  useEffect(() => {
    updateDecorations();
  }, [highlightedWords]);

  // Update decorations when syllableColoringData changes
  useEffect(() => {
    updateDecorations();
  }, [syllableColoringData]);

  // Update decorations when rhythmVariationColoringData changes
  useEffect(() => {
    updateDecorations();
  }, [rhythmVariationColoringData]);

  // Update decorations when lineLengthColoringData changes
  useEffect(() => {
    updateDecorations();
  }, [lineLengthColoringData]);

  // Update decorations when punctuationColoringData changes
  useEffect(() => {
    updateDecorations();
  }, [punctuationColoringData]);

  // Update decorations when passiveVoiceColoringData changes
  useEffect(() => {
    updateDecorations();
  }, [passiveVoiceColoringData]);

  // Update decorations when tenseColoringData changes
  useEffect(() => {
    updateDecorations();
  }, [tenseColoringData]);


  // Update decorations when scansionColoringData changes
  useEffect(() => {
    updateDecorations();
  }, [scansionColoringData]);

  // Switch theme when editorTheme changes
  useEffect(() => {
    if (monacoRef.current) {
      const themeName = editorTheme === 'dark' ? 'poetry-theme-dark' : editorTheme === 'yellow' ? 'poetry-theme-yellow' : 'poetry-theme';
      monacoRef.current.editor.setTheme(themeName);
    }
  }, [editorTheme]);

  useEffect(() => {
    return () => {
      if (copyToastTimerRef.current) {
        window.clearTimeout(copyToastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!restoreSelectionRef.current) return;
    if (!editorRef.current) return;
    const selection = lastSelectionRef.current;
    if (selection) {
      editorRef.current.setSelection(selection);
      editorRef.current.revealRangeInCenterIfOutsideViewport(selection);
    }
    restoreSelectionRef.current = false;
  }, [value]);

  const handleEditorChange = (newValue?: string) => {
    if (editorRef.current) {
      lastSelectionRef.current = editorRef.current.getSelection();
      restoreSelectionRef.current = true;
    }
    onChange(newValue || '');
  };

  // Build container class based on paragraph settings (only title centering works with Monaco)
  const containerClasses = [
    'poetry-editor-container',
    paragraphAlign === 'center' ? 'align-center' : '',
    paragraphAlign === 'right' ? 'align-right' : '',
    firstLineIndent ? 'first-line-indent' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} ref={containerRef}>
      {!hideTitle && (
        <div className="poem-title-container">
          {poemMetadata ? (
            <>
              <h1 className={`poem-title-display ${isDarkMode ? 'dark' : ''}`}>{poemTitle}</h1>
              <div className="poem-metadata">
                <a
                  href={poemMetadata.poetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="poem-metadata-link"
                >
                  {poemMetadata.poet}
                </a>
                {poemMetadata.collection && (
                  <>
                    <span className="poem-metadata-separator">&bull;</span>
                    <a
                      href={poemMetadata.collectionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="poem-metadata-link"
                    >
                      {poemMetadata.collection}
                    </a>
                  </>
                )}
                {poemMetadata.year && (
                  <>
                    <span className="poem-metadata-separator">&bull;</span>
                    <span className="poem-metadata-year">{poemMetadata.year}</span>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="poem-title-inline">
              <input
                type="text"
                className={`poem-title-editor-input ${isDarkMode ? 'dark' : ''}`}
                value={poemTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Untitled"
                aria-label="Poem title"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-1p-ignore
                data-lpignore="true"
                data-form-type="other"
              />
              <button
                type="button"
                className="poem-copy-button"
                title="Copy poem"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(value);
                  } catch {
                    const textarea = document.createElement('textarea');
                    textarea.value = value;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                  }
                  setShowCopyToast(true);
                  if (copyToastTimerRef.current) {
                    window.clearTimeout(copyToastTimerRef.current);
                  }
                  copyToastTimerRef.current = window.setTimeout(() => {
                    setShowCopyToast(false);
                  }, 600);
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <rect x="8" y="8" width="10" height="12" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="5" y="4" width="10" height="12" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
                </svg>
              </button>
              {showCopyToast && (
                <span className="poem-copy-toast">Copied</span>
              )}
            </div>
          )}
        </div>
      )}
      <Editor
        height={hideTitle ? "100%" : "calc(100% - 80px)"}
        defaultLanguage="poetry"
        path={`poem-${poemId || 'local'}`}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 17,
          lineHeight: LINE_SPACING_VALUES[lineSpacing],
          fontFamily: editorFont || "'Libre Baskerville', Georgia, 'Times New Roman', serif",
          minimap: { enabled: false },
          lineNumbers: 'on',
          readOnly: readOnly,
          wordWrap: 'on',
          wrappingIndent: 'same',
          scrollBeyondLastLine: false,
          renderLineHighlight: 'none',
          hideCursorInOverviewRuler: true,
          overviewRulerLanes: 0,
          overviewRulerBorder: false,
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          padding: { top: 24, bottom: 40 },
          lineNumbersMinChars: 3,
          // Disable features that show popups/boxes
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          acceptSuggestionOnCommitCharacter: false,
          tabCompletion: 'off',
          wordBasedSuggestions: 'off',
          suggest: { showWords: false },
          parameterHints: { enabled: false },
          autoClosingBrackets: 'never',
          autoClosingQuotes: 'never',
          autoSurround: 'never',
          matchBrackets: 'never',
          bracketPairColorization: { enabled: false },
          guides: {
            bracketPairs: false,
            highlightActiveBracketPair: false,
          },
          links: false,
          occurrencesHighlight: 'off',
          selectionHighlight: false,
          renderWhitespace: 'none',
        }}
      />

      {popupState && (
        <WordPopup
          word={popupState.word}
          position={popupState.position}
          onClose={() => setPopupState(null)}
          onInsertWord={async (word) => {
            if (!editorRef.current) return;
            editorRef.current.executeEdits('word-popup', [{
              range: popupState.range,
              text: word,
            }]);
            try {
              await navigator.clipboard.writeText(word);
            } catch {
              // Ignore clipboard failures
            }
            setPopupState(null);
          }}
        />
      )}

    </div>
  );
}
