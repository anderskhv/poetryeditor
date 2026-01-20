import { useEffect, useRef, useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { analyzeText } from '../utils/nlpProcessor';
import { WordInfo } from '../types';
import { isDictionaryLoaded } from '../utils/cmuDict';
import { type PassiveVoiceInstance } from '../utils/passiveVoiceDetector';
import { type TenseInstance } from '../utils/tenseChecker';
import { type StressedSyllableInstance } from '../utils/scansionAnalyzer';
import { WordPopup } from './WordPopup';

interface PoetryEditorProps {
  value: string;
  onChange: (value: string) => void;
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
}

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

export function PoetryEditor({ value, onChange, poemTitle, onTitleChange, onWordsAnalyzed, highlightedPOS, isDarkMode, meterColoringData, syllableColoringData, rhythmVariationColoringData, lineLengthColoringData, punctuationColoringData, passiveVoiceColoringData, tenseColoringData, scansionColoringData, highlightedLines, highlightedWords, onLineHover }: PoetryEditorProps) {
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const [popupState, setPopupState] = useState<{
    word: string;
    position: { top: number; left: number };
  } | null>(null);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register custom language for poetry
    monaco.languages.register({ id: 'poetry' });

    // Define light theme
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
        'editor.background': '#fafafa',
        'editor.foreground': '#333333',
        'editor.lineHighlightBackground': '#f5f5f5',
        'editorCursor.foreground': '#333333',
        'editor.selectionBackground': '#e0e0e0',
      },
    });

    // Define dark theme
    monaco.editor.defineTheme('poetry-theme-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'noun', foreground: '81C784' },       // lighter green
        { token: 'verb', foreground: 'CE93D8' },       // lighter purple
        { token: 'adjective', foreground: 'EF9A9A' }, // lighter red
        { token: 'adverb', foreground: 'FFB74D' },    // lighter orange
        { token: 'other', foreground: 'BDBDBD' },     // lighter gray
      ],
      colors: {
        'editor.background': '#1a1a2e',
        'editor.foreground': '#e2e8f0',
        'editor.lineHighlightBackground': '#2d3748',
        'editorCursor.foreground': '#e2e8f0',
        'editor.selectionBackground': '#4a5568',
        'editorLineNumber.foreground': '#718096',
        'editorLineNumber.activeForeground': '#a0aec0',
      },
    });

    monaco.editor.setTheme(isDarkMode ? 'poetry-theme-dark' : 'poetry-theme');

    // Handle click events to show word popup
    editor.onMouseDown((e) => {
      if (e.target.type === monaco.editor.MouseTargetType.CONTENT_TEXT) {
        const position = e.target.position;
        if (position) {
          // Get the full line text
          const model = editor.getModel();
          if (!model) return;

          const offset = model.getOffsetAt(position);

          // Find word at cursor using our custom regex that handles apostrophes
          const words = analyzeText(value);
          const clickedWord = words.find(w => offset >= w.startOffset && offset < w.endOffset);

          if (clickedWord && containerRef.current) {
            const domNode = editor.getDomNode();
            if (domNode) {
              const editorRect = domNode.getBoundingClientRect();
              const lineTop = editor.getTopForLineNumber(position.lineNumber);
              const scrollTop = editor.getScrollTop();

              // Calculate word position in viewport
              const wordTop = editorRect.top + lineTop - scrollTop;
              let left = editorRect.left + position.column * 8;

              // Popup dimensions (approximate)
              const popupHeight = 500; // Max height including content
              const popupWidth = 400;
              const viewportHeight = window.innerHeight;
              const viewportWidth = window.innerWidth;

              // Default: position below the word
              let top = wordTop + 30;

              // Check if popup would go below viewport
              if (top + popupHeight > viewportHeight - 20) {
                // Position above the word instead
                top = wordTop - 30;

                // If still doesn't fit, clamp to viewport with margin
                if (top < 20) {
                  top = 20;
                }
              }

              // Ensure popup stays within horizontal bounds
              if (left + popupWidth > viewportWidth - 20) {
                left = viewportWidth - popupWidth - 20;
              }
              if (left < 20) {
                left = 20;
              }

              setPopupState({
                word: clickedWord.word,
                position: {
                  top,
                  left,
                },
              });
            }
          }
        }
      }
    });

    // Handle mouse move to track hovered line for rhyme highlighting
    editor.onMouseMove((e) => {
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
    editor.onMouseLeave(() => {
      onLineHover?.(null);
    });

    // Apply initial decorations
    updateDecorations();
  };

  const updateDecorations = () => {
    if (!editorRef.current || !monacoRef.current) return;

    const words = analyzeText(value);

    // Notify parent of analyzed words
    if (onWordsAnalyzed) {
      onWordsAnalyzed(words);
    }

    let newDecorations: editor.IModelDeltaDecoration[] = [];

    // Check which coloring mode is active (priority order matters)
    if (meterColoringData && !meterColoringData.isFreeOrMixed) {
      // Meter coloring mode
      const lines = value.split('\n');
      const model = editorRef.current.getModel();
      if (!model) return;

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
      const lines = value.split('\n');
      const model = editorRef.current.getModel();
      if (!model) return;

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
      const lines = value.split('\n');
      const model = editorRef.current.getModel();
      if (!model) return;

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
      const lines = lineLengthColoringData.text.split('\n');
      const model = editorRef.current.getModel();
      if (!model) return;

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
      const lines = value.split('\n');
      const model = editorRef.current.getModel();
      if (!model) return;

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
      const model = editorRef.current.getModel();
      if (!model) return;

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
      const model = editorRef.current.getModel();
      if (!model) return;

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
      const model = editorRef.current.getModel();
      if (!model) return;

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
        const lines = value.split('\n');
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
        const lines = value.split('\n');
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

    // Word-level highlighting for rhymes and sound patterns - ALWAYS applies on top of other decorations
    if (highlightedWords && highlightedWords.length > 0) {
      const lines = value.split('\n');

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

        /* Meter-based line coloring */
        .meter-perfect {
          color: #2E7D32 !important; /* Green - matches meter */
          font-weight: 500 !important;
          display: inline !important;
        }

        .meter-close {
          color: #F57C00 !important; /* Orange/Yellow - close to meter (±1 syllable) */
          font-weight: 500 !important;
          display: inline !important;
        }

        .meter-violation {
          color: #C62828 !important; /* Red - violates meter */
          font-weight: 500 !important;
          display: inline !important;
        }

        /* Highlighted line when hovering badges */
        .meter-line-highlighted {
          background-color: rgba(102, 126, 234, 0.15) !important;
          font-weight: 700 !important;
        }

        /* Passive voice highlighting */
        .passive-voice-highlight {
          background-color: rgba(249, 168, 37, 0.2) !important;
          border-bottom: 2px solid #f9a825 !important;
          font-weight: 500 !important;
          display: inline !important;
        }

        /* Tense verb highlighting */
        .tense-verb-highlight {
          background-color: rgba(123, 31, 162, 0.2) !important;
          border-bottom: 2px solid #7B1FA2 !important;
          font-weight: 500 !important;
          display: inline !important;
        }

        /* Scansion highlighting - stressed syllables are bold */
        .scansion-stressed {
          font-weight: 700 !important;
          color: #1565C0 !important;
          display: inline !important;
        }

        .scansion-unstressed {
          font-weight: 400 !important;
          color: #757575 !important;
          display: inline !important;
        }

        /* Scansion line highlight when hovering in analysis panel */
        .scansion-line-highlighted {
          background-color: #FFF9C4 !important;
          border-left: 3px solid #FBC02D !important;
        }

        /* Rhyme word highlight - word-level highlighting for rhymes */
        .rhyme-word-highlighted {
          background-color: #FFF59D !important;
          border-radius: 3px;
          padding: 1px 2px;
          box-shadow: 0 0 0 2px rgba(251, 192, 45, 0.5);
          font-weight: 600 !important;
        }

        /* Dark mode highlight adjustments */
        :root.dark-mode .scansion-line-highlighted {
          background-color: rgba(251, 192, 45, 0.25) !important;
          border-left: 3px solid #FBC02D !important;
        }

        :root.dark-mode .rhyme-word-highlighted {
          background-color: rgba(251, 192, 45, 0.35) !important;
          box-shadow: 0 0 0 2px rgba(251, 192, 45, 0.4);
          color: #fff !important;
        }

        :root.dark-mode .meter-line-highlighted {
          background-color: rgba(102, 126, 234, 0.25) !important;
        }

        :root.dark-mode .pos-highlighted {
          background-color: rgba(102, 126, 234, 0.35) !important;
        }

        :root.dark-mode .passive-voice-highlight {
          background-color: rgba(249, 168, 37, 0.35) !important;
          border-bottom-color: #FBC02D !important;
        }

        :root.dark-mode .tense-verb-highlight {
          background-color: rgba(186, 104, 200, 0.35) !important;
          border-bottom-color: #BA68C8 !important;
        }

        :root.dark-mode .scansion-unstressed {
          color: #9e9e9e !important;
        }

        :root.dark-mode .meter-perfect {
          color: #66BB6A !important;
        }

        :root.dark-mode .meter-close {
          color: #FFB74D !important;
        }

        :root.dark-mode .meter-violation {
          color: #EF5350 !important;
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

  // Switch theme when dark mode changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(isDarkMode ? 'poetry-theme-dark' : 'poetry-theme');
    }
  }, [isDarkMode]);

  return (
    <div ref={containerRef} style={{ height: '100%', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div className="poem-title-container">
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
      </div>
      <Editor
        height="calc(100% - 60px)"
        defaultLanguage="poetry"
        value={value}
        onChange={(newValue) => onChange(newValue || '')}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 16,
          lineHeight: 24,
          fontFamily: "'Georgia', 'Times New Roman', serif",
          minimap: { enabled: false },
          lineNumbers: 'on',
          wordWrap: 'on',
          wrappingIndent: 'same',
          scrollBeyondLastLine: false,
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          padding: { top: 20, bottom: 20 },
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

      {popupState && isDictionaryLoaded() && (
        <WordPopup
          word={popupState.word}
          position={popupState.position}
          onClose={() => setPopupState(null)}
        />
      )}
    </div>
  );
}
