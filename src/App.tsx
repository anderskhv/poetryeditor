import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PoetryEditor } from './components/PoetryEditor';
import { AnalysisPanel } from './components/AnalysisPanel';
import { CollectionPanel } from './components/collection/CollectionPanel';
import { useDebouncedLocalStorage } from './hooks/useLocalStorage';
import { useCollection } from './hooks/useCollection';
import { WordInfo } from './types';
import { CollectionPoem } from './types/collection';
import { loadCMUDictionary } from './utils/cmuDict';
import { type PassiveVoiceInstance } from './utils/passiveVoiceDetector';
import { type TenseInstance } from './utils/tenseChecker';
import { type StressedSyllableInstance } from './utils/scansionAnalyzer';
import './App.css';

// Curated font options for poetry
const FONT_OPTIONS = [
  { id: 'libre-baskerville', name: 'Libre Baskerville', family: "'Libre Baskerville', serif", googleFont: 'Libre+Baskerville:ital,wght@0,400;0,700;1,400' },
  { id: 'eb-garamond', name: 'EB Garamond', family: "'EB Garamond', serif", googleFont: 'EB+Garamond:ital,wght@0,400;0,700;1,400' },
  { id: 'crimson-pro', name: 'Crimson Pro', family: "'Crimson Pro', serif", googleFont: 'Crimson+Pro:ital,wght@0,400;0,700;1,400' },
  { id: 'lora', name: 'Lora', family: "'Lora', serif", googleFont: 'Lora:ital,wght@0,400;0,700;1,400' },
  { id: 'merriweather', name: 'Merriweather', family: "'Merriweather', serif", googleFont: 'Merriweather:ital,wght@0,400;0,700;1,400' },
  { id: 'playfair-display', name: 'Playfair Display', family: "'Playfair Display', serif", googleFont: 'Playfair+Display:ital,wght@0,400;0,700;1,400' },
  { id: 'source-serif-pro', name: 'Source Serif Pro', family: "'Source Serif 4', serif", googleFont: 'Source+Serif+4:ital,wght@0,400;0,700;1,400' },
  { id: 'cormorant-garamond', name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", googleFont: 'Cormorant+Garamond:ital,wght@0,400;0,700;1,400' },
  { id: 'spectral', name: 'Spectral', family: "'Spectral', serif", googleFont: 'Spectral:ital,wght@0,400;0,700;1,400' },
  { id: 'georgia', name: 'Georgia', family: "Georgia, serif", googleFont: null },
];

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

function App() {
  const [text, setText, lastSaved] = useDebouncedLocalStorage('poetryContent', SAMPLE_POEM, 800);
  const [analyzedWords, setAnalyzedWords] = useState<WordInfo[]>([]);
  const [, setIsDictionaryLoading] = useState<boolean>(true);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState<boolean>(false);

  // Collection management
  const {
    addSection,
    updateSection,
    deleteSection,
    toggleSectionExpanded,
    importFiles,
    deletePoem,
    buildTree,
    getPoemById,
    reorderPoem,
    movePoemToSection,
    exportCollection,
  } = useCollection();
  const [hasEverOpenedPanel, setHasEverOpenedPanel] = useState<boolean>(() => {
    return localStorage.getItem('hasOpenedAnalysisPanel') === 'true';
  });
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [selectedFont, setSelectedFont] = useState<string>(() => {
    return localStorage.getItem('selectedFont') || 'libre-baskerville';
  });
  const [showFontMenu, setShowFontMenu] = useState<boolean>(false);
  const [showThemeMenu, setShowThemeMenu] = useState<boolean>(false);
  const [showToolsMenu, setShowToolsMenu] = useState<boolean>(false);
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

  // Apply selected font and load from Google Fonts if needed
  useEffect(() => {
    const font = FONT_OPTIONS.find(f => f.id === selectedFont);
    if (font) {
      // Load Google Font if needed
      if (font.googleFont) {
        const linkId = `font-${font.id}`;
        if (!document.getElementById(linkId)) {
          const link = document.createElement('link');
          link.id = linkId;
          link.rel = 'stylesheet';
          link.href = `https://fonts.googleapis.com/css2?family=${font.googleFont}&display=swap`;
          document.head.appendChild(link);
        }
      }
      // Apply font to CSS variable
      document.documentElement.style.setProperty('--font-editor', font.family);
      localStorage.setItem('selectedFont', selectedFont);
    }
  }, [selectedFont]);

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

  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  const handleExportPoem = (format: 'txt' | 'md') => {
    setShowExportMenu(false);
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

  // Collection panel handlers
  const handleCollectionPoemSelect = useCallback((poem: CollectionPoem) => {
    if (hasUnsavedChanges && !confirm(`Load "${poem.title}"? You have unsaved changes that will be lost.`)) {
      return;
    }
    setText(poem.content);
    setCurrentPoemId(poem.id);
    setPoemTitle(poem.title);
    setLastSavedContent(poem.content);
  }, [hasUnsavedChanges, setText]);

  const handleCollectionImport = useCallback(async (files: FileList) => {
    const result = await importFiles(files);
    if (result.failed.length > 0) {
      alert(`Failed to import ${result.failed.length} file(s):\n${result.failed.map(f => `${f.filename}: ${f.error}`).join('\n')}`);
    }
    if (result.success.length > 0) {
      // Optionally load the first imported poem
      const firstPoem = result.success[0];
      setText(firstPoem.content);
      setCurrentPoemId(firstPoem.id);
      setPoemTitle(firstPoem.title);
      setLastSavedContent(firstPoem.content);
    }
  }, [importFiles, setText]);

  const handleCollectionDeletePoem = useCallback((poemId: string) => {
    const poem = getPoemById(poemId);
    if (!poem || !confirm(`Delete "${poem.title}" from collection?`)) return;
    deletePoem(poemId);
    if (currentPoemId === poemId) {
      setCurrentPoemId(null);
      setText('');
      setPoemTitle('Untitled');
      setLastSavedContent(null);
    }
  }, [getPoemById, deletePoem, currentPoemId, setText]);

  const handleRenameSection = useCallback((id: string, name: string) => {
    updateSection(id, { name });
  }, [updateSection]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.poems-dropdown')) setShowPoemList(false);
      if (!target.closest('.export-dropdown')) setShowExportMenu(false);
      if (!target.closest('.font-dropdown')) setShowFontMenu(false);
      if (!target.closest('.theme-dropdown')) setShowThemeMenu(false);
      if (!target.closest('.tools-dropdown')) setShowToolsMenu(false);
      if (!target.closest('.mobile-overflow-dropdown')) setShowMobileMenu(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="app-title-group">
              <h1 className="app-title">Poetry Editor</h1>
              <span className="app-subtitle">a toolbox for poets</span>
            </div>
            {isAnalyzing && (
              <span className="analyzing-indicator" title="Analyzing poem...">
                <span className="analyzing-dot"></span>
              </span>
            )}
          </div>
          <div className="header-actions">
            <button
              onClick={() => setIsCollectionOpen(!isCollectionOpen)}
              className={`btn btn-menu ${isCollectionOpen ? 'active' : ''}`}
              aria-label="Toggle collection panel"
              aria-expanded={isCollectionOpen}
            >
              Collection
            </button>
            <div className="poems-dropdown">
              <button
                onClick={() => setShowPoemList(!showPoemList)}
                className="btn btn-menu"
                aria-label="View saved poems"
                aria-expanded={showPoemList}
              >
                My Poems
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
            <button onClick={handleSavePoem} className="btn btn-menu">
              Save
            </button>
            <button onClick={handleNewPoem} className="btn btn-menu">
              New
            </button>
            <div className="export-dropdown">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="btn btn-menu"
                aria-label="Export options"
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
                    Export as Text
                  </button>
                  <button
                    className="export-item"
                    onClick={() => handleExportPoem('md')}
                  >
                    Export as Markdown
                  </button>
                </div>
              )}
            </div>
            <div className="font-dropdown">
              <button
                onClick={() => setShowFontMenu(!showFontMenu)}
                className="btn btn-menu"
                aria-label="Select font"
                aria-expanded={showFontMenu}
              >
                Font
              </button>
              {showFontMenu && (
                <div className="font-menu">
                  {FONT_OPTIONS.map(font => (
                    <button
                      key={font.id}
                      className={`font-item ${selectedFont === font.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedFont(font.id);
                        setShowFontMenu(false);
                      }}
                      style={{ fontFamily: font.family }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="theme-dropdown">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="btn btn-menu"
                aria-label="Select theme"
                aria-expanded={showThemeMenu}
              >
                Theme
              </button>
              {showThemeMenu && (
                <div className="theme-menu">
                  <button
                    className={`theme-item ${!isDarkMode ? 'active' : ''}`}
                    onClick={() => {
                      setIsDarkMode(false);
                      setShowThemeMenu(false);
                    }}
                  >
                    Light
                  </button>
                  <button
                    className={`theme-item ${isDarkMode ? 'active' : ''}`}
                    onClick={() => {
                      setIsDarkMode(true);
                      setShowThemeMenu(false);
                    }}
                  >
                    Dark
                  </button>
                </div>
              )}
            </div>
            <div className="tools-dropdown">
              <button
                onClick={() => setShowToolsMenu(!showToolsMenu)}
                className="btn btn-tools"
                aria-label="Tools"
                aria-expanded={showToolsMenu}
              >
                Tools
              </button>
              {showToolsMenu && (
                <div className="tools-menu">
                  <Link to="/rhymes" className="tools-item" onClick={() => setShowToolsMenu(false)}>
                    Rhyme Dictionary
                  </Link>
                  <Link to="/thesaurus" className="tools-item" onClick={() => setShowToolsMenu(false)}>
                    Thesaurus
                  </Link>
                  <Link to="/syllables" className="tools-item" onClick={() => setShowToolsMenu(false)}>
                    Syllable Counter
                  </Link>
                  <Link to="/meter-analyzer" className="tools-item" onClick={() => setShowToolsMenu(false)}>
                    Meter Analyzer
                  </Link>
                  <Link to="/rhyme-scheme-analyzer" className="tools-item" onClick={() => setShowToolsMenu(false)}>
                    Rhyme Scheme Analyzer
                  </Link>
                  <Link to="/haiku-checker" className="tools-item form-tool" onClick={() => setShowToolsMenu(false)}>
                    Haiku Checker
                  </Link>
                  <Link to="/sonnet-checker" className="tools-item form-tool" onClick={() => setShowToolsMenu(false)}>
                    Sonnet Checker
                  </Link>
                </div>
              )}
            </div>
            {/* Mobile overflow menu - visible only on small screens */}
            <div className="mobile-overflow-dropdown">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="mobile-overflow-btn"
                aria-label="More options"
                aria-expanded={showMobileMenu}
              >
                ⋯
              </button>
              {showMobileMenu && (
                <div className="mobile-overflow-menu">
                  <button
                    className="mobile-overflow-item"
                    onClick={() => {
                      handleExportPoem('txt');
                      setShowMobileMenu(false);
                    }}
                  >
                    Export as Text
                  </button>
                  <button
                    className="mobile-overflow-item"
                    onClick={() => {
                      handleExportPoem('md');
                      setShowMobileMenu(false);
                    }}
                  >
                    Export as Markdown
                  </button>
                  <div className="mobile-overflow-item submenu-label">Theme</div>
                  <button
                    className="mobile-overflow-item"
                    onClick={() => {
                      setIsDarkMode(false);
                      setShowMobileMenu(false);
                    }}
                  >
                    {!isDarkMode ? '✓ ' : ''}Light Mode
                  </button>
                  <button
                    className="mobile-overflow-item"
                    onClick={() => {
                      setIsDarkMode(true);
                      setShowMobileMenu(false);
                    }}
                  >
                    {isDarkMode ? '✓ ' : ''}Dark Mode
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="app-content">
        <CollectionPanel
          isOpen={isCollectionOpen}
          treeNodes={buildTree()}
          currentPoemId={currentPoemId}
          onPoemSelect={handleCollectionPoemSelect}
          onSectionToggle={toggleSectionExpanded}
          onImportFiles={handleCollectionImport}
          onAddSection={addSection}
          onRenameSection={handleRenameSection}
          onDeleteSection={deleteSection}
          onDeletePoem={handleCollectionDeletePoem}
          onReorderPoem={reorderPoem}
          onMovePoemToSection={movePoemToSection}
          onExportAll={exportCollection}
          onClose={() => setIsCollectionOpen(false)}
          isDarkMode={isDarkMode}
        />
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
            editorFont={FONT_OPTIONS.find(f => f.id === selectedFont)?.family}
          />

          <button
            className={`panel-toggle ${isPanelOpen ? 'open' : ''}`}
            onClick={() => {
              setIsPanelOpen(!isPanelOpen);
              if (!hasEverOpenedPanel && !isPanelOpen) {
                setHasEverOpenedPanel(true);
                localStorage.setItem('hasOpenedAnalysisPanel', 'true');
              }
            }}
            title={isPanelOpen ? "Close analysis panel" : "Open analysis panel"}
          >
            <span className="panel-toggle-icon">
              {isPanelOpen ? '›' : '‹'}
            </span>
            <span className="panel-toggle-label">Analysis</span>
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
          <span>Free online poetry analyzer: syllable counter, rhyme scheme detector, scansion tool, meter analysis, and more.</span>
        </div>
        <div className="footer-copyright">
          <span>© {new Date().getFullYear()} poetryeditor.com</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
