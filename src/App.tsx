import { useState, useCallback, useEffect } from 'react';
import { PoetryEditor } from './components/PoetryEditor';
import { AnalysisPanel } from './components/AnalysisPanel';
import { useDebouncedLocalStorage } from './hooks/useLocalStorage';
import { WordInfo } from './types';
import { loadCMUDictionary } from './utils/cmuDict';
import { type PassiveVoiceInstance } from './utils/passiveVoiceDetector';
import { type TenseInstance } from './utils/tenseChecker';
import { type StressedSyllableInstance } from './utils/scansionAnalyzer';
import './App.css';

const SAMPLE_POEM = `Shall I compare thee to a summer's day?
Thou art more lovely and more temperate.
Rough winds do shake the darling buds of May,
And summer's lease hath all too short a date.`;

// Poem storage type
interface SavedPoem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

// Example poems for quick loading
const EXAMPLE_POEMS: Record<string, { name: string; content: string }> = {
  haiku: {
    name: 'Haiku',
    content: `An old silent pond
A frog jumps into the pond
Splash! Silence again`
  },
  sonnet: {
    name: 'Sonnet (Shakespeare)',
    content: `Shall I compare thee to a summer's day?
Thou art more lovely and more temperate.
Rough winds do shake the darling buds of May,
And summer's lease hath all too short a date.
Sometime too hot the eye of heaven shines,
And often is his gold complexion dimmed;
And every fair from fair sometime declines,
By chance, or nature's changing course, untrimmed;
But thy eternal summer shall not fade,
Nor lose possession of that fair thou ow'st,
Nor shall death brag thou wand'rest in his shade,
When in eternal lines to Time thou grow'st.
So long as men can breathe, or eyes can see,
So long lives this, and this gives life to thee.`
  },
  limerick: {
    name: 'Limerick',
    content: `There once was a man from Nantucket
Who kept all his cash in a bucket
His daughter named Nan
Ran away with a man
And as for the bucket, Nan took it`
  },
  freeVerse: {
    name: 'Free Verse (Whitman)',
    content: `I celebrate myself, and sing myself,
And what I assume you shall assume,
For every atom belonging to me as good belongs to you.

I loafe and invite my soul,
I lean and loafe at my ease observing a spear of summer grass.`
  },
  blankVerse: {
    name: 'Blank Verse (Milton)',
    content: `Of Man's first disobedience, and the fruit
Of that forbidden tree whose mortal taste
Brought death into the World, and all our woe,
With loss of Eden, till one greater Man
Restore us, and regain the blissful seat,
Sing, Heavenly Muse`
  }
};

function App() {
  const [text, setText, lastSaved] = useDebouncedLocalStorage('poetryContent', SAMPLE_POEM, 800);
  const [analyzedWords, setAnalyzedWords] = useState<WordInfo[]>([]);
  const [, setIsDictionaryLoading] = useState<boolean>(true);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [showExamples, setShowExamples] = useState<boolean>(false);
  const [showPoemList, setShowPoemList] = useState<boolean>(false);
  const [savedPoems, setSavedPoems] = useState<SavedPoem[]>(() => {
    const saved = localStorage.getItem('savedPoems');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentPoemId, setCurrentPoemId] = useState<string | null>(null);
  const [poemTitle, setPoemTitle] = useState<string>('Untitled');
  const [lastSavedContent, setLastSavedContent] = useState<string | null>(null); // Track content at last explicit save
  const [highlightedPOS, setHighlightedPOS] = useState<string | null>(null);
  const [meterColoringData, setMeterColoringData] = useState<{
    syllableCounts: number[];
    medianSyllableCount: number;
    violatingLines: number[];
    isFreeOrMixed: boolean;
  } | null>(null);
  const [syllableColoringData, setSyllableColoringData] = useState<{
    syllableCounts: number[];
    medianSyllableCount: number;
  } | null>(null);
  const [rhythmVariationColoringData, setRhythmVariationColoringData] = useState<{
    syllableCounts: number[];
  } | null>(null);
  const [lineLengthColoringData, setLineLengthColoringData] = useState<{
    text: string;
    medianWords: number;
  } | null>(null);
  const [punctuationColoringData, setPunctuationColoringData] = useState<{
    enjambedLines: number[];
  } | null>(null);
  const [passiveVoiceColoringData, setPassiveVoiceColoringData] = useState<{
    passiveInstances: PassiveVoiceInstance[];
  } | null>(null);
  const [tenseColoringData, setTenseColoringData] = useState<{
    tenseInstances: TenseInstance[];
  } | null>(null);
  const [scansionColoringData, setScansionColoringData] = useState<{
    syllableInstances: StressedSyllableInstance[];
  } | null>(null);
  const [highlightedLines, setHighlightedLines] = useState<number[] | null>(null);
  const [highlightedWords, setHighlightedWords] = useState<{ word: string; lineNumber: number }[] | null>(null);
  const [editorHoveredLine, setEditorHoveredLine] = useState<number | null>(null);

  // Load CMU dictionary on mount
  useEffect(() => {
    loadCMUDictionary()
      .then(() => {
        setIsDictionaryLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load CMU dictionary:', error);
        setIsDictionaryLoading(false);
      });
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  // Track analysis state based on text changes
  useEffect(() => {
    if (text) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => setIsAnalyzing(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [text]);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
  }, [setText]);

  const handleWordsAnalyzed = useCallback((words: WordInfo[]) => {
    setAnalyzedWords(words);
  }, []);

  const handleMeterExpand = useCallback((data: {
    syllableCounts: number[];
    medianSyllableCount: number;
    violatingLines: number[];
    isFreeOrMixed: boolean;
  }) => {
    setMeterColoringData(data);
  }, []);

  const handleSectionCollapse = useCallback(() => {
    setMeterColoringData(null);
    setSyllableColoringData(null);
    setRhythmVariationColoringData(null);
    setLineLengthColoringData(null);
    setPunctuationColoringData(null);
    setPassiveVoiceColoringData(null);
    setTenseColoringData(null);
    setScansionColoringData(null);
  }, []);

  const handleSyllableExpand = useCallback((data: {
    syllableCounts: number[];
    medianSyllableCount: number;
  }) => {
    setSyllableColoringData(data);
  }, []);

  const handleRhythmVariationExpand = useCallback((data: {
    syllableCounts: number[];
  }) => {
    setRhythmVariationColoringData(data);
  }, []);

  const handleLineLengthExpand = useCallback((data: {
    text: string;
    medianWords: number;
  }) => {
    setLineLengthColoringData(data);
  }, []);

  const handlePunctuationExpand = useCallback((data: {
    enjambedLines: number[];
  }) => {
    setPunctuationColoringData(data);
  }, []);

  const handlePassiveVoiceExpand = useCallback((data: {
    passiveInstances: PassiveVoiceInstance[];
  }) => {
    setPassiveVoiceColoringData(data);
  }, []);

  const handleTenseExpand = useCallback((data: {
    tenseInstances: TenseInstance[];
  } | null) => {
    setTenseColoringData(data);
  }, []);

  const handleScansionExpand = useCallback((data: {
    syllableInstances: StressedSyllableInstance[];
  } | null) => {
    setScansionColoringData(data);
  }, []);

  // Check if there are unsaved changes
  const hasUnsavedChanges = text.trim() !== '' && text !== lastSavedContent;

  const handleNewPoem = () => {
    if (hasUnsavedChanges) {
      const choice = window.confirm(
        'You have unsaved changes. Would you like to save before starting a new poem?\n\nClick OK to save first, or Cancel to discard changes.'
      );
      if (choice) {
        // User wants to save first
        handleSavePoem();
      }
    }
    // Clear the editor
    setText('');
    setAnalyzedWords([]);
    setCurrentPoemId(null);
    setPoemTitle('Untitled');
    setLastSavedContent(null);
  };

  const handleLoadExample = (key: string) => {
    const example = EXAMPLE_POEMS[key];
    if (example) {
      if (hasUnsavedChanges && !confirm(`Load "${example.name}" example? You have unsaved changes that will be lost.`)) {
        return;
      }
      setText(example.content);
      setCurrentPoemId(null); // Examples are not saved poems
      setPoemTitle(example.name); // Use example name as title
      setLastSavedContent(null); // Mark as not saved
      setShowExamples(false);
    }
  };

  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  const handleExportPoem = (format: 'txt' | 'md') => {
    const title = poemTitle.trim() || 'Untitled';
    const safeTitle = title.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-');

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'md') {
      // Markdown format with H1 title
      content = `# ${title}\n\n${text}`;
      filename = `${safeTitle}.md`;
      mimeType = 'text/markdown';
    } else {
      // Plain text with title at top
      content = `${title}\n${'='.repeat(title.length)}\n\n${text}`;
      filename = `${safeTitle}.txt`;
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleSavePoem = () => {
    // Use current title from header input (no prompt needed)
    const title = poemTitle.trim() || 'Untitled';

    const newPoem: SavedPoem = {
      id: currentPoemId || `poem-${Date.now()}`,
      title,
      content: text,
      updatedAt: new Date().toISOString(),
    };

    const updatedPoems = currentPoemId
      ? savedPoems.map(p => p.id === currentPoemId ? newPoem : p)
      : [...savedPoems, newPoem];

    setSavedPoems(updatedPoems);
    setCurrentPoemId(newPoem.id);
    setPoemTitle(title); // Ensure title state is synced
    setLastSavedContent(text); // Track the saved content
    localStorage.setItem('savedPoems', JSON.stringify(updatedPoems));
  };

  const handleLoadPoem = (poem: SavedPoem) => {
    if (hasUnsavedChanges && !confirm(`Load "${poem.title}"? You have unsaved changes that will be lost.`)) {
      return;
    }
    setText(poem.content);
    setCurrentPoemId(poem.id);
    setPoemTitle(poem.title); // Load the poem's title
    setLastSavedContent(poem.content); // Track the loaded content as "saved"
    setShowPoemList(false);
  };

  const handleDeletePoem = (poemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const poem = savedPoems.find(p => p.id === poemId);
    if (!poem || !confirm(`Delete "${poem.title}"?`)) return;

    const updatedPoems = savedPoems.filter(p => p.id !== poemId);
    setSavedPoems(updatedPoems);
    localStorage.setItem('savedPoems', JSON.stringify(updatedPoems));
    if (currentPoemId === poemId) {
      setCurrentPoemId(null);
    }
    // Close the dropdown after deleting the last poem
    if (updatedPoems.length === 0) {
      setShowPoemList(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.poems-dropdown') && !target.closest('.examples-dropdown') && !target.closest('.export-dropdown')) {
        setShowPoemList(false);
        setShowExamples(false);
        setShowExportMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">Poetry Editor</h1>
            {isAnalyzing && (
              <span className="analyzing-indicator" title="Analyzing poem...">
                <span className="analyzing-dot"></span>
                Analyzing
              </span>
            )}
          </div>
          <div className="header-actions">
            <div className="poems-dropdown">
              <button
                onClick={() => setShowPoemList(!showPoemList)}
                className="btn btn-secondary"
                aria-label="View saved poems"
                aria-expanded={showPoemList}
              >
                My Poems {savedPoems.length > 0 && `(${savedPoems.length})`}
              </button>
              {showPoemList && (
                <div className="poems-menu">
                  {savedPoems.length === 0 ? (
                    <div className="poems-empty">No saved poems yet</div>
                  ) : (
                    savedPoems.map(poem => (
                      <div
                        key={poem.id}
                        className={`poem-item ${currentPoemId === poem.id ? 'active' : ''}`}
                        onClick={() => handleLoadPoem(poem)}
                      >
                        <span className="poem-title">{poem.title}</span>
                        <button
                          className="poem-delete"
                          onClick={(e) => handleDeletePoem(poem.id, e)}
                          aria-label={`Delete ${poem.title}`}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <button onClick={handleSavePoem} className="btn btn-secondary">
              Save
            </button>
            <div className="examples-dropdown">
              <button
                onClick={() => setShowExamples(!showExamples)}
                className="btn btn-secondary"
                aria-label="Load example poem"
                aria-expanded={showExamples}
              >
                Examples
              </button>
              {showExamples && (
                <div className="examples-menu">
                  {Object.entries(EXAMPLE_POEMS).map(([key, poem]) => (
                    <button
                      key={key}
                      className="example-item"
                      onClick={() => handleLoadExample(key)}
                    >
                      {poem.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleNewPoem} className="btn btn-secondary">
              New Poem
            </button>
            <div className="export-dropdown">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="btn btn-primary"
                aria-label="Export poem"
                aria-expanded={showExportMenu}
              >
                Export
              </button>
              {showExportMenu && (
                <div className="export-menu">
                  <button
                    className="export-item"
                    onClick={() => handleExportPoem('txt')}
                  >
                    Plain Text (.txt)
                  </button>
                  <button
                    className="export-item"
                    onClick={() => handleExportPoem('md')}
                  >
                    Markdown (.md)
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="btn btn-icon"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <div className="app-content">
        <div className="editor-pane">
          <PoetryEditor
            value={text}
            onChange={handleTextChange}
            poemTitle={poemTitle}
            onTitleChange={setPoemTitle}
            onWordsAnalyzed={handleWordsAnalyzed}
            highlightedPOS={highlightedPOS}
            isDarkMode={isDarkMode}
            meterColoringData={meterColoringData}
            syllableColoringData={syllableColoringData}
            rhythmVariationColoringData={rhythmVariationColoringData}
            lineLengthColoringData={lineLengthColoringData}
            punctuationColoringData={punctuationColoringData}
            passiveVoiceColoringData={passiveVoiceColoringData}
            tenseColoringData={tenseColoringData}
            scansionColoringData={scansionColoringData}
            highlightedLines={highlightedLines}
            highlightedWords={highlightedWords}
            onLineHover={setEditorHoveredLine}
          />

          <button
            className={`panel-toggle ${isPanelOpen ? 'open' : ''}`}
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            title={isPanelOpen ? 'Close analysis panel' : 'Open analysis panel'}
          >
            {isPanelOpen ? '›' : '‹'}
          </button>
        </div>

        {isPanelOpen && (
          <div className="side-panel">
            <AnalysisPanel
              text={text}
              words={analyzedWords}
              lastSaved={lastSaved}
              onHighlightPOS={setHighlightedPOS}
              onMeterExpand={handleMeterExpand}
              onSyllableExpand={handleSyllableExpand}
              onRhythmVariationExpand={handleRhythmVariationExpand}
              onLineLengthExpand={handleLineLengthExpand}
              onPunctuationExpand={handlePunctuationExpand}
              onPassiveVoiceExpand={handlePassiveVoiceExpand}
              onTenseExpand={handleTenseExpand}
              onScansionExpand={handleScansionExpand}
              onSectionCollapse={handleSectionCollapse}
              onHighlightLines={setHighlightedLines}
              onHighlightWords={setHighlightedWords}
              editorHoveredLine={editorHoveredLine}
            />
          </div>
        )}
      </div>

      <footer className="app-footer">
        <div className="footer-content">
          <span>Poetry Editor v1.0</span>
          <span>•</span>
          <span>Real-time POS tagging and meter detection</span>
          <span>•</span>
          <span>Auto-saves to browser storage</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
