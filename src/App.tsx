import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { editor, Range } from 'monaco-editor';
import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { AuthButton } from './components/AuthButton';
import { PoemNavSidebar } from './components/PoemNavSidebar';
import type { Poem } from './types/database';
import { PoetryEditor } from './components/PoetryEditor';
import { addPoemVersion, ensureInitialPoemVersion, fetchPoemVersionById, migrateLocalPoemVersions, type PoemVersion } from './utils/poemVersions';
import { AnalysisPanel } from './components/AnalysisPanel';
import { CommentsPanel } from './components/CommentsPanel';
import { CollectionPanel } from './components/collection/CollectionPanel';
import { ShareModal } from './components/ShareModal';
import { SEOHead } from './components/SEOHead';
import { useDebouncedLocalStorage } from './hooks/useLocalStorage';
import { useCollection } from './hooks/useCollection';
import { WordInfo } from './types';
import { CollectionPoem } from './types/collection';
import { type PassiveVoiceInstance } from './utils/passiveVoiceDetector';
import { type TenseInstance } from './utils/tenseChecker';
import { type StressedSyllableInstance } from './utils/scansionAnalyzer';
import { stripMarkdownFormatting } from './utils/markdownFormatter';
import { getAllPoems } from './data/poems';
import { addPoemComment, deletePoemComment, fetchPoemComments, updatePoemComment, type PoemComment, type CommentRange } from './utils/poemComments';
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

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const mulberry32 = (seed: number) => () => {
  let t = seed += 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const getLocalDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDailyShuffle = <T,>(items: T[], count: number, seedKey: string) => {
  const rng = mulberry32(hashString(seedKey));
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

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
  const versionId = searchParams.get('version');
  const { user } = useAuth();

  const [text, setText, lastSaved] = useDebouncedLocalStorage('poetryContent', SAMPLE_POEM, 800);
  const [localTitle, setLocalTitle] = useDebouncedLocalStorage('poetryTitle', 'Untitled', 800);
  const [analyzedWords, setAnalyzedWords] = useState<WordInfo[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState<boolean>(false);
  const [poemComments, setPoemComments] = useState<PoemComment[]>([]);
  const [activeSideTab, setActiveSideTab] = useState<'analysis' | 'comments'>('analysis');
  const [showCommentHighlights, setShowCommentHighlights] = useState<boolean>(true);

  // Cloud poem state
  const [cloudPoemTitle, setCloudPoemTitle] = useState<string | null>(null);
  const [cloudPoemCollectionId, setCloudPoemCollectionId] = useState<string | null>(null);
  const [isLoadingCloudPoem, setIsLoadingCloudPoem] = useState<boolean>(false);
  const [cloudPoemError, setCloudPoemError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activePoemIdRef = useRef<string | null>(null);
  const activePoemTitleRef = useRef<string>('');
  const activePoemContentRef = useRef<string>('');
  const ensuredPoemIdsRef = useRef<Set<string>>(new Set());
  const migratedPoemIdsRef = useRef<Set<string>>(new Set());

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
  const [paragraphAlign, setParagraphAlign] = useState<'left' | 'center' | 'right'>(() => {
    return (localStorage.getItem('paragraphAlign') as 'left' | 'center' | 'right') || 'left';
  });
  const [showParagraphMenu, setShowParagraphMenu] = useState<boolean>(false);
  const [firstLineIndent, setFirstLineIndent] = useState<boolean>(() => {
    return localStorage.getItem('firstLineIndent') === 'true';
  });
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [showToolsMenu, setShowToolsMenu] = useState<boolean>(false);
  const [showInspirationMenu, setShowInspirationMenu] = useState<boolean>(false);
  const [savedPoems, setSavedPoems] = useState<SavedPoem[]>(() => {
    const saved = localStorage.getItem('savedPoems');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentPoemId, setCurrentPoemId] = useState<string | null>(null);
  const [poemTitle, setPoemTitle] = useState<string>('Untitled');
  const [lastSavedContent, setLastSavedContent] = useState<string | null>(null); // Track content at last explicit save
  const activePoemId = cloudPoemId || currentPoemId || null;
  const [versionPreview, setVersionPreview] = useState<PoemVersion | null>(null);
  const previewTextRef = useRef<string | null>(null);
  const previewTitleRef = useRef<string | null>(null);
  const isPreviewing = Boolean(versionPreview);
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

  const poemsList = getAllPoems();
  const poemsByPoet = poemsList.reduce((acc, poem) => {
    if (!acc[poem.poet]) acc[poem.poet] = [];
    acc[poem.poet].push(poem);
    return acc;
  }, {} as Record<string, typeof poemsList>);
  const dailyKey = getLocalDateKey();
  const dailyFeatured = getDailyShuffle(poemsList, 4, `featured:${dailyKey}`);
  const dailyPoets = getDailyShuffle(Object.keys(poemsByPoet), 4, `poets:${dailyKey}`);

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

  useEffect(() => {
    if (!user || !cloudPoemId) return;
    try {
      window.localStorage.setItem('lastCloudPoemId', cloudPoemId);
    } catch (error) {
      console.warn('Failed to store last cloud poem id:', error);
    }
  }, [user, cloudPoemId]);

  useEffect(() => {
    if (!user || cloudPoemId || versionId) return;
    try {
      const lastCloudPoemId = window.localStorage.getItem('lastCloudPoemId');
      if (lastCloudPoemId) {
        navigate(`/?poem=${lastCloudPoemId}`, { replace: true });
        return;
      }
    } catch (error) {
      console.warn('Failed to read last cloud poem id:', error);
    }
    setText('');
    setPoemTitle('Untitled');
    setCurrentPoemId(null);
    setLastSavedContent(null);
  }, [user, cloudPoemId, versionId, navigate, setText]);

  useEffect(() => {
    if (user || cloudPoemId) return;
    setPoemTitle(localTitle);
  }, [user, cloudPoemId, localTitle]);

  useEffect(() => {
    if (!versionId) {
      if (versionPreview) {
        if (previewTextRef.current !== null) {
          setText(previewTextRef.current);
          setPoemTitle(previewTitleRef.current || 'Untitled');
        }
        previewTextRef.current = null;
        previewTitleRef.current = null;
        setVersionPreview(null);
      }
      return;
    }
    if (!cloudPoemId || !user) return;

    if (previewTextRef.current === null) {
      previewTextRef.current = text;
      previewTitleRef.current = poemTitle;
    }

    fetchPoemVersionById(versionId, user.id).then((version) => {
      if (!version || version.poem_id !== cloudPoemId) {
        setCloudPoemError('Version not found.');
        setVersionPreview(null);
        return;
      }
      setVersionPreview(version);
      setText(version.content);
      setPoemTitle(version.title);
    });
  }, [versionId, cloudPoemId, user, text, poemTitle, setText]);

  // Auto-save cloud poem changes (debounced)
  useEffect(() => {
    if (!cloudPoemId || !user || isLoadingCloudPoem || !supabase || isPreviewing) return;

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

  useEffect(() => {
    const activeId = cloudPoemId || currentPoemId;
    activePoemIdRef.current = activeId;
    activePoemTitleRef.current = poemTitle;
    activePoemContentRef.current = text;
  }, [cloudPoemId, currentPoemId, poemTitle, text]);

  useEffect(() => {
    const activeId = cloudPoemId || currentPoemId;
    if (!activeId || !user) return;
    if (isPreviewing) return;
    if (cloudPoemId && isLoadingCloudPoem) return;
    if (migratedPoemIdsRef.current.has(activeId)) return;
    migratedPoemIdsRef.current.add(activeId);
    migrateLocalPoemVersions(activeId, user.id);
  }, [cloudPoemId, currentPoemId, user, isLoadingCloudPoem]);

  useEffect(() => {
    const activeId = cloudPoemId || currentPoemId;
    if (!activeId || !user) return;
    if (isPreviewing) return;
    if (cloudPoemId && isLoadingCloudPoem) return;
    if (ensuredPoemIdsRef.current.has(activeId)) return;
    ensuredPoemIdsRef.current.add(activeId);
    ensureInitialPoemVersion(activeId, poemTitle, text, user.id);
  }, [cloudPoemId, currentPoemId, poemTitle, text, user, isLoadingCloudPoem]);

  useEffect(() => {
    if (!activePoemId) {
      setPoemComments([]);
      return;
    }
    fetchPoemComments(activePoemId, user?.id || null).then(setPoemComments);
  }, [activePoemId, user?.id]);

  useEffect(() => {
    const activeId = cloudPoemId || currentPoemId;
    if (!activeId || !user) return;
    if (isPreviewing) return;
    const interval = window.setInterval(() => {
      const id = activePoemIdRef.current;
      if (!id) return;
      addPoemVersion(id, activePoemTitleRef.current, activePoemContentRef.current, user.id);
    }, 5 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [cloudPoemId, currentPoemId, user]);

  // Keep local saved poem title in sync with editor title
  useEffect(() => {
    if (cloudPoemId) return;
    if (!currentPoemId) return;
    const existing = savedPoems.find(poem => poem.id === currentPoemId);
    if (!existing) return;
    if (existing.title === poemTitle) return;

    const updatedPoems = savedPoems.map(poem =>
      poem.id === currentPoemId
        ? { ...poem, title: poemTitle, updatedAt: new Date().toISOString() }
        : poem
    );
    setSavedPoems(updatedPoems);
    localStorage.setItem('savedPoems', JSON.stringify(updatedPoems));
  }, [poemTitle, currentPoemId, savedPoems, cloudPoemId]);

  // Save indent settings
  useEffect(() => {
    localStorage.setItem('firstLineIndent', String(firstLineIndent));
  }, [firstLineIndent]);

  // Save line spacing settings
  useEffect(() => {
    localStorage.setItem('lineSpacing', lineSpacing);
  }, [lineSpacing]);

  // Save paragraph alignment settings
  useEffect(() => {
    localStorage.setItem('paragraphAlign', paragraphAlign);
  }, [paragraphAlign]);

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
  const [showExportOptions, setShowExportOptions] = useState<boolean>(false);
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

  const handlePasteFromClipboard = useCallback(async () => {
    const editorInstance = editorRef.current;
    if (!editorInstance) return;
    try {
      const textToPaste = await navigator.clipboard.readText();
      if (!textToPaste) return;
      const model = editorInstance.getModel();
      if (!model) return;
      const selection = editorInstance.getSelection();
      const position = editorInstance.getPosition() || model.getPositionAt(model.getValueLength());
      const range = selection || new Range(position.lineNumber, position.column, position.lineNumber, position.column);
      editorInstance.executeEdits('clipboard-paste', [{ range, text: textToPaste }]);
      editorInstance.focus();
    } catch (err) {
      console.error('Clipboard paste failed:', err);
      alert('Paste is not available on this device. Try long-press > Paste or use the share menu.');
    }
  }, []);

  const buildCommentMarkers = (plainText: string, comments: PoemComment[]) => {
    if (comments.length === 0) {
      return { markedText: plainText, ordered: [] as PoemComment[] };
    }

    const lines = plainText.split('\n');
    const withOffsets = comments.map((comment) => {
      const endLine = Math.max(1, Math.min(comment.range.endLineNumber, lines.length));
      const lineText = lines[endLine - 1] || '';
      const column = Math.max(1, Math.min(comment.range.endColumn, lineText.length + 1));
      let offset = 0;
      for (let i = 0; i < endLine - 1; i += 1) {
        offset += lines[i].length + 1;
      }
      offset += column - 1;
      return { comment, offset };
    });

    const ordered = withOffsets
      .sort((a, b) => b.offset - a.offset)
      .map(item => item.comment);

    let markedText = plainText;
    ordered.forEach((comment, idx) => {
      const marker = ` [C${ordered.length - idx}]`;
      const lineIdx = Math.max(1, Math.min(comment.range.endLineNumber, lines.length));
      const lineText = lines[lineIdx - 1] || '';
      const column = Math.max(1, Math.min(comment.range.endColumn, lineText.length + 1));
      let offset = 0;
      for (let i = 0; i < lineIdx - 1; i += 1) {
        offset += lines[i].length + 1;
      }
      offset += column - 1;
      markedText = markedText.slice(0, offset) + marker + markedText.slice(offset);
    });

    const orderedAscending = ordered.slice().reverse();
    return { markedText, ordered: orderedAscending };
  };

  const handleExportPoem = (format: 'txt' | 'md' | 'docx') => {
    setShowExportMenu(false);
    const title = poemTitle.trim() || 'Untitled';
    const safeTitle = title.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-');
    const alignment = paragraphAlign;
    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'md') {
      if (alignment === 'left') {
        // Markdown format with H1 title
        content = `# ${title}\n\n${text}`;
      } else {
        const plainText = stripMarkdownFormatting(text)
          .split('\n')
          .map(line => escapeHtml(line))
          .join('<br />');
        content = `<div style="text-align:${alignment}">\n<h1>${escapeHtml(title)}</h1>\n<p>${plainText}</p>\n</div>`;
      }
      filename = `${safeTitle}.md`;
      mimeType = 'text/markdown';
    } else if (format === 'docx') {
      // Simple Word-compatible HTML export
      const plainText = stripMarkdownFormatting(text)
        .split('\n')
        .map(line => escapeHtml(line))
        .join('<br />');
      const rawText = stripMarkdownFormatting(text);
      const { markedText, ordered } = buildCommentMarkers(
        rawText,
        poemComments.filter(comment => !comment.resolved)
      );
      const markedHtml = escapeHtml(markedText).split('\n').join('<br />');
      const commentsHtml = ordered.length
        ? `<hr /><h2>Comments</h2>${ordered
            .map((comment, idx) => {
              const label = `C${idx + 1}`;
              const quote = comment.quote ? ` — <em>${escapeHtml(comment.quote)}</em>` : '';
              return `<p><strong>${label}:</strong> ${escapeHtml(comment.text)}${quote}</p>`;
            })
            .join('')}`
        : '';
      content = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><div style="text-align:${alignment}"><h1>${escapeHtml(title)}</h1><p>${markedHtml}</p>${commentsHtml}</div></body></html>`;
      filename = `${safeTitle}.doc`;
      mimeType = 'application/msword';
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

  const handleAddComment = useCallback(async (range: CommentRange, quote: string) => {
    if (!activePoemId) return;
    const commentText = window.prompt('Add a comment');
    if (!commentText || !commentText.trim()) return;
    const saved = await addPoemComment(activePoemId, user?.id || null, {
      text: commentText.trim(),
      quote,
      range,
    });
    setPoemComments(prev => [...prev, saved]);
    setActiveSideTab('comments');
  }, [activePoemId, user?.id]);

  const handleResolveComment = useCallback(async (commentId: string) => {
    if (!activePoemId) return;
    const resolvedAt = new Date().toISOString();
    const next = await updatePoemComment(activePoemId, commentId, {
      resolved: true,
      resolvedAt,
    });
    setPoemComments(next);
  }, [activePoemId]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!activePoemId) return;
    const next = await deletePoemComment(activePoemId, commentId);
    setPoemComments(next);
  }, [activePoemId]);

  const handleJumpToComment = useCallback((comment: PoemComment) => {
    const editorInstance = editorRef.current;
    if (!editorInstance) return;
    const selection = {
      startLineNumber: comment.range.startLineNumber,
      startColumn: comment.range.startColumn,
      endLineNumber: comment.range.endLineNumber,
      endColumn: comment.range.endColumn,
    };
    editorInstance.setSelection(selection);
    editorInstance.revealRangeInCenterIfOutsideViewport(new Range(
      comment.range.startLineNumber,
      comment.range.startColumn,
      comment.range.endLineNumber,
      comment.range.endColumn
    ));
    editorInstance.focus();
  }, []);

  const exitVersionPreview = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('version');
    navigate({ pathname: '/', search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
    setVersionPreview(null);
    if (previewTextRef.current !== null) {
      setText(previewTextRef.current);
      setPoemTitle(previewTitleRef.current || 'Untitled');
      previewTextRef.current = null;
      previewTitleRef.current = null;
    }
  }, [navigate, searchParams, setText]);

  const handleRestorePreviewVersion = useCallback(async () => {
    if (!versionPreview || !cloudPoemId || !user || !supabase) return;
    const confirmRestore = window.confirm('Restore this version to the current poem?');
    if (!confirmRestore) return;
    try {
      await supabase
        .from('poems')
        .update({
          content: versionPreview.content,
          title: versionPreview.title,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', cloudPoemId);
      setText(versionPreview.content);
      setPoemTitle(versionPreview.title);
      setLastSavedContent(versionPreview.content);
    } catch (err) {
      console.error('Failed to restore version:', err);
    } finally {
      exitVersionPreview();
    }
  }, [versionPreview, cloudPoemId, user, supabase, exitVersionPreview, setText]);

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
    if (user) {
      addPoemVersion(newPoem.id, title, text, user.id);
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
      if (!target.closest('.export-dropdown')) {
        setShowExportMenu(false);
        setShowExportOptions(false);
      }
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
      <SEOHead
        title="Poetry Editor - Write, Rhyme, and Count Syllables"
        description="Write and analyze poems with a full-featured poetry editor, rhyme finder, synonym tools, and syllable counter. Built for poets, songwriters, and teachers."
        canonicalPath="/"
        keywords="poetry editor, rhyme finder, synonym finder, syllable counter, poetry tools, write poetry"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Poetry Editor",
          "url": "https://poetryeditor.com",
          "applicationCategory": "WritingApplication",
          "operatingSystem": "Web",
          "description": "Write and analyze poems with rhyme, synonym, and syllable tools."
        }}
      />
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
                onClick={() => {
                  const next = !showExportMenu;
                  setShowExportMenu(next);
                  if (!next) {
                    setShowExportOptions(false);
                  }
                }}
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
                      setShowExportOptions(false);
                    }}
                  >
                    New
                  </button>
                  <button
                    className="export-item"
                    onClick={() => {
                      handleSavePoem();
                      setShowExportMenu(false);
                      setShowExportOptions(false);
                    }}
                  >
                    Save
                  </button>
                  <div className="export-options-inline">
                    <button
                      className="export-item has-submenu"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowExportOptions(!showExportOptions);
                      }}
                    >
                      Export
                      <span className="submenu-arrow">›</span>
                    </button>
                    {showExportOptions && (
                      <div className="export-submenu">
                        <button
                          className="export-submenu-item"
                          onClick={() => {
                            handleExportPoem('txt');
                            setShowExportMenu(false);
                            setShowExportOptions(false);
                          }}
                        >
                          .txt
                        </button>
                        <button
                          className="export-submenu-item"
                          onClick={() => {
                            handleExportPoem('md');
                            setShowExportMenu(false);
                            setShowExportOptions(false);
                          }}
                        >
                          .md
                        </button>
                        <button
                          className="export-submenu-item"
                          onClick={() => {
                            handleExportPoem('docx');
                            setShowExportMenu(false);
                            setShowExportOptions(false);
                          }}
                        >
                          Word (.doc)
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    className="export-item"
                    onClick={() => {
                      setShowShareModal(true);
                      setShowExportMenu(false);
                      setShowExportOptions(false);
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
                  <div className="paragraph-menu-section">
                    <div className="paragraph-menu-label">Alignment</div>
                    <button
                      className={`paragraph-item ${paragraphAlign === 'left' ? 'active' : ''}`}
                      onClick={() => setParagraphAlign('left')}
                    >
                      {paragraphAlign === 'left' && <span className="checkmark">✓</span>}
                      Left
                    </button>
                    <button
                      className={`paragraph-item ${paragraphAlign === 'center' ? 'active' : ''}`}
                      onClick={() => setParagraphAlign('center')}
                    >
                      {paragraphAlign === 'center' && <span className="checkmark">✓</span>}
                      Center
                    </button>
                    <button
                      className={`paragraph-item ${paragraphAlign === 'right' ? 'active' : ''}`}
                      onClick={() => setParagraphAlign('right')}
                    >
                      {paragraphAlign === 'right' && <span className="checkmark">✓</span>}
                      Right
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
                    {dailyFeatured.map(poem => (
                      <a
                        key={poem.slug}
                        href={`/poems/${poem.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inspiration-item"
                        onClick={() => setShowInspirationMenu(false)}
                      >
                        <span className="inspiration-poem-title">"{poem.title}"</span>
                        <span className="inspiration-poet">{poem.poet.split(' ').slice(-1)[0]}</span>
                      </a>
                    ))}
                  </div>
                  <div className="inspiration-section">
                    <div className="inspiration-section-label">Browse by Poet</div>
                    {dailyPoets.map(poet => (
                      <a
                        key={poet}
                        href={`/poems?poet=${encodeURIComponent(poet.toLowerCase())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inspiration-item"
                        onClick={() => setShowInspirationMenu(false)}
                      >
                        <span className="inspiration-poet-name">{poet}</span>
                        <span className="inspiration-count">{poemsByPoet[poet].length}</span>
                      </a>
                    ))}
                  </div>
                  <div className="inspiration-section inspiration-browse-all">
                    <a href="/poems" target="_blank" rel="noopener noreferrer" className="inspiration-item browse-all-link" onClick={() => setShowInspirationMenu(false)}>
                      Browse All {poemsList.length} Poems
                      <span className="browse-arrow">→</span>
                    </a>
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
                  <a href="/rhymes" target="_blank" rel="noopener noreferrer" className="tools-item" onClick={() => setShowToolsMenu(false)}>
                    Rhyme Dictionary
                  </a>
                  <a href="/synonyms" target="_blank" rel="noopener noreferrer" className="tools-item" onClick={() => setShowToolsMenu(false)}>
                    Synonyms
                  </a>
                  <a href="/syllables" target="_blank" rel="noopener noreferrer" className="tools-item" onClick={() => setShowToolsMenu(false)}>
                    Syllable Counter
                  </a>
                  <a href="/rhyme-scheme-analyzer" target="_blank" rel="noopener noreferrer" className="tools-item" onClick={() => setShowToolsMenu(false)}>
                    Rhyme Scheme Maker
                  </a>
                  <a href="/haiku-checker" target="_blank" rel="noopener noreferrer" className="tools-item form-tool" onClick={() => setShowToolsMenu(false)}>
                    Haiku Checker
                  </a>
                  <a href="/sonnet-checker" target="_blank" rel="noopener noreferrer" className="tools-item form-tool" onClick={() => setShowToolsMenu(false)}>
                    Sonnet Checker
                  </a>
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
                      handlePasteFromClipboard();
                      setShowMobileMenu(false);
                    }}
                  >
                    Paste from Clipboard
                  </button>
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
                  <button
                    className="mobile-overflow-item"
                    onClick={() => {
                      handleExportPoem('docx');
                      setShowMobileMenu(false);
                    }}
                  >
                    Export as Word
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
            currentPoemTitle={poemTitle}
            onPoemSelect={handleNavPoemSelect}
            isOpen={navSidebarOpen}
            onToggle={() => setNavSidebarOpen(!navSidebarOpen)}
          />
        )}

        <div className="editor-pane">
          {versionPreview && (
            <div className="version-preview-banner">
              <div className="version-preview-info">
                Viewing version from {new Date(versionPreview.created_at).toLocaleString()}
              </div>
              <div className="version-preview-actions">
                <button className="version-preview-btn" onClick={handleRestorePreviewVersion}>
                  Restore this version
                </button>
                <button className="version-preview-btn secondary" onClick={exitVersionPreview}>
                  Exit preview
                </button>
              </div>
            </div>
          )}
          <PoetryEditor
            value={text}
            onChange={handleTextChange}
            poemId={cloudPoemId || currentPoemId || 'local'}
            poemTitle={poemTitle}
            onTitleChange={(nextTitle) => {
              setPoemTitle(nextTitle);
              if (!user && !cloudPoemId) {
                setLocalTitle(nextTitle);
              }
            }}
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
            paragraphAlign={paragraphAlign}
            firstLineIndent={firstLineIndent}
            lineSpacing={lineSpacing}
            onEditorMount={(editor) => { editorRef.current = editor; }}
            comments={showCommentHighlights ? poemComments : []}
            onAddComment={handleAddComment}
            showCommentHighlights={showCommentHighlights}
            onToggleCommentHighlights={() => setShowCommentHighlights(prev => !prev)}
            readOnly={Boolean(versionPreview)}
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
            <div className="side-panel-tabs">
              <button
                className={`side-panel-tab ${activeSideTab === 'analysis' ? 'active' : ''}`}
                onClick={() => setActiveSideTab('analysis')}
              >
                Analysis
              </button>
              <button
                className={`side-panel-tab ${activeSideTab === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveSideTab('comments')}
              >
                Comments
                {poemComments.length > 0 && (
                  <span className="side-panel-tab-badge">{poemComments.length}</span>
                )}
              </button>
            </div>
            {activeSideTab === 'analysis' ? (
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
            ) : (
              <CommentsPanel
                comments={poemComments}
                onResolve={handleResolveComment}
                onDelete={handleDeleteComment}
                onJump={handleJumpToComment}
              />
            )}
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
