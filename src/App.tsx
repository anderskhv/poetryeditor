import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { editor } from 'monaco-editor';
import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { AuthButton } from './components/AuthButton';
import { PoemNavSidebar } from './components/PoemNavSidebar';
import type { Poem } from './types/database';
import { PoetryEditor } from './components/PoetryEditor';
import { AnalysisPanel } from './components/AnalysisPanel';
import { CollectionPanel } from './components/collection/CollectionPanel';
import { ShareModal } from './components/ShareModal';
import { useDebouncedLocalStorage } from './hooks/useLocalStorage';
import { useCollection } from './hooks/useCollection';
import { WordInfo } from './types';
import { CollectionPoem } from './types/collection';
import { type PassiveVoiceInstance } from './utils/passiveVoiceDetector';
import { type TenseInstance } from './utils/tenseChecker';
import { type StressedSyllableInstance } from './utils/scansionAnalyzer';
import { stripMarkdownFormatting } from './utils/markdownFormatter';
import './App.css';

// Expanded font options for poetry
const FONT_OPTIONS = [
  // Serif - Classic
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
  // Serif - Elegant
  { id: 'cormorant', name: 'Cormorant', family: "'Cormorant', serif", googleFont: 'Cormorant:ital,wght@0,400;0,700;1,400' },
  { id: 'cardo', name: 'Cardo', family: "'Cardo', serif", googleFont: 'Cardo:ital,wght@0,400;0,700;1,400' },
  { id: 'gentium-plus', name: 'Gentium Plus', family: "'Gentium Plus', serif", googleFont: 'Gentium+Plus:ital,wght@0,400;0,700;1,400' },
  { id: 'alegreya', name: 'Alegreya', family: "'Alegreya', serif", googleFont: 'Alegreya:ital,wght@0,400;0,700;1,400' },
  { id: 'noto-serif', name: 'Noto Serif', family: "'Noto Serif', serif", googleFont: 'Noto+Serif:ital,wght@0,400;0,700;1,400' },
  // Sans Serif - Modern
  { id: 'inter', name: 'Inter', family: "'Inter', sans-serif", googleFont: 'Inter:wght@400;500;700' },
  { id: 'source-sans-pro', name: 'Source Sans Pro', family: "'Source Sans 3', sans-serif", googleFont: 'Source+Sans+3:ital,wght@0,400;0,700;1,400' },
  { id: 'open-sans', name: 'Open Sans', family: "'Open Sans', sans-serif", googleFont: 'Open+Sans:ital,wght@0,400;0,700;1,400' },
  { id: 'lato', name: 'Lato', family: "'Lato', sans-serif", googleFont: 'Lato:ital,wght@0,400;0,700;1,400' },
  // Typewriter / Monospace
  { id: 'courier-prime', name: 'Courier Prime', family: "'Courier Prime', monospace", googleFont: 'Courier+Prime:ital,wght@0,400;0,700;1,400' },
  { id: 'ibm-plex-mono', name: 'IBM Plex Mono', family: "'IBM Plex Mono', monospace", googleFont: 'IBM+Plex+Mono:ital,wght@0,400;0,700;1,400' },
  // System fonts
  { id: 'times', name: 'Times New Roman', family: "'Times New Roman', serif", googleFont: null },
  { id: 'palatino', name: 'Palatino', family: "Palatino, 'Palatino Linotype', serif", googleFont: null },
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cloudPoemId = searchParams.get('poem');
  const { user } = useAuth();

  const [text, setText, lastSaved] = useDebouncedLocalStorage('poetryContent', SAMPLE_POEM, 800);
  const [analyzedWords, setAnalyzedWords] = useState<WordInfo[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState<boolean>(false);

  // Cloud poem state
  const [cloudPoemTitle, setCloudPoemTitle] = useState<string | null>(null);
  const [cloudPoemCollectionId, setCloudPoemCollectionId] = useState<string | null>(null);
  const [isLoadingCloudPoem, setIsLoadingCloudPoem] = useState<boolean>(false);
  const [cloudPoemError, setCloudPoemError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Nav sidebar state - only visible when editing cloud poems
  const [navSidebarOpen, setNavSidebarOpen] = useState<boolean>(true);

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
  const [theme, setTheme] = useState<'light' | 'dark' | 'yellow'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'yellow') return saved;
    // Migrate from old darkMode setting
    const oldDarkMode = localStorage.getItem('darkMode');
    if (oldDarkMode === 'true') return 'dark';
    return 'light';
  });
  const [selectedFont, setSelectedFont] = useState<string>(() => {
    return localStorage.getItem('selectedFont') || 'libre-baskerville';
  });
  const [recentFonts, setRecentFonts] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentFonts');
    return saved ? JSON.parse(saved) : [];
  });
  const [fontSearch, setFontSearch] = useState<string>('');
  const [showThemeMenu, setShowThemeMenu] = useState<boolean>(false);
  const [lineSpacing, setLineSpacing] = useState<'normal' | 'relaxed' | 'spacious'>(() => {
    return (localStorage.getItem('lineSpacing') as 'normal' | 'relaxed' | 'spacious') || 'normal';
  });
  const [showParagraphMenu, setShowParagraphMenu] = useState<boolean>(false);
    const [firstLineIndent, setFirstLineIndent] = useState<boolean>(() => {
    return localStorage.getItem('firstLineIndent') === 'true';
  });
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [showToolsMenu, setShowToolsMenu] = useState<boolean>(false);
  const [showInspirationMenu, setShowInspirationMenu] = useState<boolean>(false);
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

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.remove('dark-mode', 'yellow-mode');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else if (theme === 'yellow') {
      document.documentElement.classList.add('yellow-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load cloud poem if ?poem= is in URL
  useEffect(() => {
    if (!cloudPoemId || !user || !supabase) {
      setCloudPoemTitle(null);
      setCloudPoemCollectionId(null);
      return;
    }

    async function loadCloudPoem() {
      if (!supabase) return;
      setIsLoadingCloudPoem(true);
      setCloudPoemError(null);

      try {
        const { data, error } = await supabase
          .from('poems')
          .select('*')
          .eq('id', cloudPoemId)
          .single();

        if (error) throw error;

        const poemData = data as Poem;
        setText(poemData.content);
        setCloudPoemTitle(poemData.title);
        setCloudPoemCollectionId(poemData.collection_id);
        setPoemTitle(poemData.title);
      } catch (err) {
        console.error('Failed to load cloud poem:', err);
        setCloudPoemError('Failed to load poem');
      } finally {
        setIsLoadingCloudPoem(false);
      }
    }

    loadCloudPoem();
  }, [cloudPoemId, user, setText]);

  // Auto-save cloud poem changes (debounced)
  useEffect(() => {
    if (!cloudPoemId || !user || isLoadingCloudPoem || !supabase) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after 1 second of inactivity
    saveTimeoutRef.current = setTimeout(async () => {
      if (!supabase) return;
      try {
        await supabase
          .from('poems')
          .update({
            content: text,
            title: poemTitle,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', cloudPoemId);
      } catch (err) {
        console.error('Failed to auto-save cloud poem:', err);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [text, poemTitle, cloudPoemId, user, isLoadingCloudPoem]);

  // Save indent settings
  useEffect(() => {
    localStorage.setItem('firstLineIndent', String(firstLineIndent));
  }, [firstLineIndent]);

  // Save line spacing settings
  useEffect(() => {
    localStorage.setItem('lineSpacing', lineSpacing);
  }, [lineSpacing]);

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
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // Apply markdown formatting by triggering the Monaco editor actions
  // (the actual logic lives in wrapSelection inside PoetryEditor)
  const applyFormatting = useCallback((type: 'bold' | 'italic' | 'underline') => {
    const editorInstance = editorRef.current;
    if (!editorInstance) return;

    const actionIds: Record<string, string> = {
      bold: 'bold-text',
      italic: 'italic-text',
      underline: 'underline-text',
    };

    const action = editorInstance.getAction(actionIds[type]);
    if (action) {
      action.run();
    }
    editorInstance.focus();
  }, []);

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
      // Plain text with title at top - strip markdown formatting
      const plainText = stripMarkdownFormatting(text);
      content = `${title}\n${'='.repeat(title.length)}\n\n${plainText}`;
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

  // Handle poem selection from nav sidebar
  const handleNavPoemSelect = useCallback((poemId: string) => {
    navigate(`/?poem=${poemId}`);
  }, [navigate]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.poems-dropdown')) setShowPoemList(false);
      if (!target.closest('.export-dropdown')) setShowExportMenu(false);
      if (!target.closest('.theme-dropdown')) setShowThemeMenu(false);
      if (!target.closest('.paragraph-dropdown')) {
        setShowParagraphMenu(false);
        setFontSearch(''); // Clear font search when menu closes
      }
      if (!target.closest('.tools-dropdown')) setShowToolsMenu(false);
      if (!target.closest('.inspiration-dropdown')) setShowInspirationMenu(false);
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
            {/* Collection panel hidden for now - not ready for release
            <button
              onClick={() => setIsCollectionOpen(!isCollectionOpen)}
              className={`btn btn-menu ${isCollectionOpen ? 'active' : ''}`}
              aria-label="Toggle collection panel"
              aria-expanded={isCollectionOpen}
            >
              Collection
            </button>
            */}
            <div className="export-dropdown">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="btn btn-menu"
                aria-label="File options"
                aria-expanded={showExportMenu}
              >
                File
              </button>
              {showExportMenu && (
                <div className="export-menu">
                  <button
                    className="export-item"
                    onClick={() => {
                      handleNewPoem();
                      setShowExportMenu(false);
                    }}
                  >
                    New
                  </button>
                  <div className="poems-dropdown-inline">
                    <button
                      className="export-item has-submenu"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPoemList(!showPoemList);
                      }}
                    >
                      Open Poem
                      <span className="submenu-arrow">›</span>
                    </button>
                    {showPoemList && (
                      <div className="poems-submenu">
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
                  <button
                    className="export-item"
                    onClick={() => {
                      handleSavePoem();
                      setShowExportMenu(false);
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="export-item"
                    onClick={() => {
                      handleExportPoem('txt');
                      setShowExportMenu(false);
                    }}
                  >
                    Export as Text
                  </button>
                  <button
                    className="export-item"
                    onClick={() => {
                      handleExportPoem('md');
                      setShowExportMenu(false);
                    }}
                  >
                    Export as Markdown
                  </button>
                  <button
                    className="export-item"
                    onClick={() => {
                      setShowShareModal(true);
                      setShowExportMenu(false);
                    }}
                  >
                    Share Image
                  </button>
                </div>
              )}
            </div>
            <div className="paragraph-dropdown">
              <button
                onClick={() => setShowParagraphMenu(!showParagraphMenu)}
                className="btn btn-menu"
                aria-label="Formatting options"
                aria-expanded={showParagraphMenu}
              >
                Formatting
              </button>
              {showParagraphMenu && (
                <div className="paragraph-menu">
                  {/* Font Section */}
                  <div className="paragraph-menu-section font-section">
                    <div className="paragraph-menu-label">Font</div>
                    <div className="font-search-container">
                      <input
                        type="text"
                        className="font-search-input"
                        placeholder="Search fonts..."
                        value={fontSearch}
                        onChange={(e) => setFontSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {/* Recent fonts section */}
                    {recentFonts.length > 0 && !fontSearch && (
                      <>
                        <div className="font-section-label">Recent</div>
                        {recentFonts.slice(0, 3).map(fontId => {
                          const font = FONT_OPTIONS.find(f => f.id === fontId);
                          if (!font) return null;
                          return (
                            <button
                              key={`recent-${font.id}`}
                              className={`paragraph-item ${selectedFont === font.id ? 'active' : ''}`}
                              onClick={() => {
                                setSelectedFont(font.id);
                              }}
                              style={{ fontFamily: font.family }}
                            >
                              {selectedFont === font.id && <span className="checkmark">✓</span>}
                              {font.name}
                            </button>
                          );
                        })}
                        <div className="font-section-divider" />
                      </>
                    )}
                    {/* All fonts (filtered) */}
                    <div className="font-list-scrollable">
                      {FONT_OPTIONS
                        .filter(font => font.name.toLowerCase().includes(fontSearch.toLowerCase()))
                        .map(font => (
                          <button
                            key={font.id}
                            className={`paragraph-item ${selectedFont === font.id ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedFont(font.id);
                              // Add to recent fonts (at the beginning, remove duplicates)
                              setRecentFonts(prev => {
                                const filtered = prev.filter(id => id !== font.id);
                                const updated = [font.id, ...filtered].slice(0, 5);
                                localStorage.setItem('recentFonts', JSON.stringify(updated));
                                return updated;
                              });
                            }}
                            style={{ fontFamily: font.family }}
                          >
                            {selectedFont === font.id && <span className="checkmark">✓</span>}
                            {font.name}
                          </button>
                        ))}
                      {FONT_OPTIONS.filter(font => font.name.toLowerCase().includes(fontSearch.toLowerCase())).length === 0 && (
                        <div className="font-no-results">No fonts found</div>
                      )}
                    </div>
                  </div>
                  {/* Text Style Section */}
                  <div className="paragraph-menu-section">
                    <div className="paragraph-menu-label">Text Style</div>
                    <div className="text-style-buttons">
                      <button
                        className="text-style-btn"
                        onClick={() => applyFormatting('bold')}
                        title="Bold (⌘B)"
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        className="text-style-btn"
                        onClick={() => applyFormatting('italic')}
                        title="Italic (⌘I)"
                      >
                        <em>I</em>
                      </button>
                      <button
                        className="text-style-btn"
                        onClick={() => applyFormatting('underline')}
                        title="Underline (⌘U)"
                      >
                        <span style={{ textDecoration: 'underline' }}>U</span>
                      </button>
                    </div>
                  </div>
                  {/* Line Spacing Section */}
                  <div className="paragraph-menu-section">
                    <div className="paragraph-menu-label">Line Spacing</div>
                    <button
                      className={`paragraph-item ${lineSpacing === 'normal' ? 'active' : ''}`}
                      onClick={() => setLineSpacing('normal')}
                    >
                      {lineSpacing === 'normal' && <span className="checkmark">✓</span>}
                      Normal
                    </button>
                    <button
                      className={`paragraph-item ${lineSpacing === 'relaxed' ? 'active' : ''}`}
                      onClick={() => setLineSpacing('relaxed')}
                    >
                      {lineSpacing === 'relaxed' && <span className="checkmark">✓</span>}
                      Relaxed
                    </button>
                    <button
                      className={`paragraph-item ${lineSpacing === 'spacious' ? 'active' : ''}`}
                      onClick={() => setLineSpacing('spacious')}
                    >
                      {lineSpacing === 'spacious' && <span className="checkmark">✓</span>}
                      Spacious
                    </button>
                  </div>
                                    {/* Text Options Section */}
                  <div className="paragraph-menu-section">
                    <div className="paragraph-menu-label">Text Options</div>
                    <button
                      className={`paragraph-item ${firstLineIndent ? 'active' : ''}`}
                      onClick={() => setFirstLineIndent(!firstLineIndent)}
                    >
                      {firstLineIndent && <span className="checkmark">✓</span>}
                      First Line Indent
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="theme-dropdown">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="btn btn-menu"
                aria-label="Select background"
                aria-expanded={showThemeMenu}
              >
                Background
              </button>
              {showThemeMenu && (
                <div className="theme-menu">
                  <button
                    className={`theme-item ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => {
                      setTheme('light');
                      setShowThemeMenu(false);
                    }}
                  >
                    Light
                  </button>
                  <button
                    className={`theme-item ${theme === 'yellow' ? 'active' : ''}`}
                    onClick={() => {
                      setTheme('yellow');
                      setShowThemeMenu(false);
                    }}
                  >
                    Yellow
                  </button>
                  <button
                    className={`theme-item ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => {
                      setTheme('dark');
                      setShowThemeMenu(false);
                    }}
                  >
                    Dark
                  </button>
                </div>
              )}
            </div>
            <div className="inspiration-dropdown">
              <button
                onClick={() => setShowInspirationMenu(!showInspirationMenu)}
                className="btn btn-menu"
                aria-label="Inspiration"
                aria-expanded={showInspirationMenu}
              >
                Inspiration
              </button>
              {showInspirationMenu && (
                <div className="inspiration-menu">
                  <div className="inspiration-section">
                    <div className="inspiration-section-label">Featured</div>
                    <Link to="/poems/first-fig" className="inspiration-item" onClick={() => setShowInspirationMenu(false)}>
                      <span className="inspiration-poem-title">"First Fig"</span>
                      <span className="inspiration-poet">Millay</span>
                    </Link>
                    <Link to="/poems/sonnet-18" className="inspiration-item" onClick={() => setShowInspirationMenu(false)}>
                      <span className="inspiration-poem-title">"Sonnet 18"</span>
                      <span className="inspiration-poet">Shakespeare</span>
                    </Link>
                    <Link to="/poems/november-night" className="inspiration-item" onClick={() => setShowInspirationMenu(false)}>
                      <span className="inspiration-poem-title">"November Night"</span>
                      <span className="inspiration-poet">Crapsey</span>
                    </Link>
                    <Link to="/poems/stopping-by-woods" className="inspiration-item" onClick={() => setShowInspirationMenu(false)}>
                      <span className="inspiration-poem-title">"Stopping by Woods"</span>
                      <span className="inspiration-poet">Frost</span>
                    </Link>
                  </div>
                  <div className="inspiration-section">
                    <div className="inspiration-section-label">Browse by Poet</div>
                    <Link to="/poems?poet=shakespeare" className="inspiration-item" onClick={() => setShowInspirationMenu(false)}>
                      <span className="inspiration-poet-name">Shakespeare</span>
                      <span className="inspiration-count">21</span>
                    </Link>
                    <Link to="/poems?poet=dickinson" className="inspiration-item" onClick={() => setShowInspirationMenu(false)}>
                      <span className="inspiration-poet-name">Dickinson</span>
                      <span className="inspiration-count">10</span>
                    </Link>
                    <Link to="/poems?poet=wordsworth" className="inspiration-item" onClick={() => setShowInspirationMenu(false)}>
                      <span className="inspiration-poet-name">Wordsworth</span>
                      <span className="inspiration-count">4</span>
                    </Link>
                    <Link to="/poems?poet=frost" className="inspiration-item" onClick={() => setShowInspirationMenu(false)}>
                      <span className="inspiration-poet-name">Frost</span>
                      <span className="inspiration-count">3</span>
                    </Link>
                  </div>
                  <div className="inspiration-section inspiration-browse-all">
                    <Link to="/poems" className="inspiration-item browse-all-link" onClick={() => setShowInspirationMenu(false)}>
                      Browse All 63 Poems
                      <span className="browse-arrow">→</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="tools-dropdown">
              <button
                onClick={() => setShowToolsMenu(!showToolsMenu)}
                className="header-pill btn-tools"
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
                  <Link to="/synonyms" className="tools-item" onClick={() => setShowToolsMenu(false)}>
                    Synonyms
                  </Link>
                  <Link to="/syllables" className="tools-item" onClick={() => setShowToolsMenu(false)}>
                    Syllable Counter
                  </Link>
                  <Link to="/rhyme-scheme-analyzer" className="tools-item" onClick={() => setShowToolsMenu(false)}>
                    Rhyme Scheme Maker
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
                      setTheme('light');
                      setShowMobileMenu(false);
                    }}
                  >
                    {theme === 'light' ? '✓ ' : ''}Light Mode
                  </button>
                  <button
                    className="mobile-overflow-item"
                    onClick={() => {
                      setTheme('yellow');
                      setShowMobileMenu(false);
                    }}
                  >
                    {theme === 'yellow' ? '✓ ' : ''}Yellow Mode
                  </button>
                  <button
                    className="mobile-overflow-item"
                    onClick={() => {
                      setTheme('dark');
                      setShowMobileMenu(false);
                    }}
                  >
                    {theme === 'dark' ? '✓ ' : ''}Dark Mode
                  </button>
                </div>
              )}
            </div>
            {/* Auth Button */}
            <AuthButton />
          </div>
        </div>
      </header>

      <div className="app-content">
        {/* Collection panel hidden for now - not ready for release
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
          isDarkMode={theme === 'dark'}
        />
        */}

        {/* Poem navigation sidebar - visible when editing cloud poems */}
        {cloudPoemId && cloudPoemCollectionId && (
          <PoemNavSidebar
            collectionId={cloudPoemCollectionId}
            currentPoemId={cloudPoemId}
            onPoemSelect={handleNavPoemSelect}
            isOpen={navSidebarOpen}
            onToggle={() => setNavSidebarOpen(!navSidebarOpen)}
          />
        )}

        <div className="editor-pane">
          <PoetryEditor
            value={text}
            onChange={handleTextChange}
            poemTitle={poemTitle}
            onTitleChange={setPoemTitle}
            onWordsAnalyzed={handleWordsAnalyzed}
            highlightedPOS={highlightedPOS}
            isDarkMode={theme === 'dark'}
            editorTheme={theme}
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
            paragraphAlign="left"
            firstLineIndent={firstLineIndent}
            lineSpacing={lineSpacing}
            onEditorMount={(editor) => { editorRef.current = editor; }}
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
        <p className="footer-line">Ideas, feedback, or bugs? Write <a href="mailto:contact@poetryeditor.com">contact@poetryeditor.com</a>. We will get back in &lt;48 hours.</p>
      </footer>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        poemTitle={poemTitle}
        poemText={text}
      />
    </div>
  );
}

export default App;
