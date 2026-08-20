import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { AuthButton } from './components/AuthButton';
import { PoemNavSidebar } from './components/PoemNavSidebar';
import type { Poem } from './types/database';
import { EditorSwitch } from './components/EditorSwitch';
import type { EditorHandle } from './types/editorHandle';
import { addPoemVersion, ensureInitialPoemVersion, fetchPoemVersionById, migrateLocalPoemVersions, type PoemVersion } from './utils/poemVersions';
import { AnalysisPanel } from './components/AnalysisPanel';
import { CommentsPanel } from './components/CommentsPanel';
import { CollectionPanel } from './components/collection/CollectionPanel';
import { ShareModal } from './components/ShareModal';
import { SEOHead } from './components/SEOHead';
import { useDebouncedLocalStorage } from './hooks/useLocalStorage';
import { useCollection } from './hooks/useCollection';
import { WordInfo } from './types';
import { CollectionPoem, CollectionSection, PoemStatus } from './types/collection';
import { type PassiveVoiceInstance } from './utils/passiveVoiceDetector';
import { type TenseInstance } from './utils/tenseChecker';
import { type StressedSyllableInstance } from './utils/scansionAnalyzer';
import { stripMarkdownFormatting } from './utils/markdownFormatter';
import { escapeHtml } from './utils/escapeHtml';
import { getAllPoems } from './data/poems';
import { addPoemComment, deletePoemComment, fetchPoemComments, updatePoemComment, type PoemComment, type CommentRange } from './utils/poemComments';
import { trackPageview } from './utils/analytics';
import { FONT_OPTIONS } from './utils/fontOptions';
import { exportPoemAsPdf } from './utils/pdfExport';
import { SaveToCollectionModal } from './components/SaveToCollectionModal';
import { AuthModal } from './components/AuthModal';
import { getLocalPoemsForCloudMigration, migrateLocalPoemsToCloud, dismissCloudMigration } from './utils/collectionMigration';
import { useCollections } from './hooks/useCollections';
import { EditorChat } from './components/editor/EditorChat';
import { PreFlightForm } from './components/editor/PreFlightForm';
import { usePoetProfile } from './hooks/usePoetProfile';
import { useEditorMemory } from './hooks/useEditorMemory';
import { useEditorialReport } from './hooks/useEditorialReport';
import type { AnalysisContext } from './types/editor';
import type { ClientAnalysisSummary } from './utils/llmAnalysis';
import { useLLMAnalysis } from './hooks/useLLMAnalysis';
import type { PoemFormatting } from './types/database';
import { getAllConversationSummaries } from './utils/editorStorage';
import {
  isCloudDraftDirty,
  shouldApplyServerContent,
  shouldFetchCloudPoem,
  shouldScheduleCloudSave,
} from './utils/cloudDraftGuard';
import { hasDraftToProtect, NEW_POEM_CONFIRM_MESSAGE, planNewPoem } from './utils/newPoemConfirm';
import { getDefaultNavSidebarOpen, getDefaultSidePanelOpen } from './utils/editorLayoutDefaults';
import './App.css';

const SAMPLE_POEM = ``;

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

type CloudSaveStatus = 'idle' | 'saving' | 'saved' | 'failed';

function App() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cloudPoemId = searchParams.get('poem');
  const versionId = searchParams.get('version');
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const { collections: userCollections, createCollection: createUserCollection } = useCollections();
  const { profile: poetProfile, completeOnboarding, addLearning, updateSummary } = usePoetProfile(user);
  const {
    settings: editorSettings,
    updateSettings: updateEditorSettings,
    getMemoryContext,
    extractAndSaveLearnings,
  } = useEditorMemory(user);

  // LLM-enhanced analysis: client analysis data callback + hook
  const [clientAnalysisData, setClientAnalysisData] = useState<ClientAnalysisSummary | null>(null);
  const handleAnalysisData = useCallback((data: ClientAnalysisSummary) => {
    setClientAnalysisData(data);
  }, []);

  const [text, setText, lastSaved] = useDebouncedLocalStorage('poetryContent', SAMPLE_POEM, 800);
  const [localTitle, setLocalTitle] = useDebouncedLocalStorage('poetryTitle', '', 800);
  const [analyzedWords, setAnalyzedWords] = useState<WordInfo[]>([]);

  const llmAnalysis = useLLMAnalysis({
    user,
    supabase,
    poemText: text,
    clientAnalysis: clientAnalysisData,
  });

  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(() => {
    const storedPanel = localStorage.getItem('analysisPanelOpen');
    return getDefaultSidePanelOpen({
      viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1280,
      hasOpenedAnalysisPanel: localStorage.getItem('hasOpenedAnalysisPanel') === 'true',
      analysisPanelOpen: storedPanel === null ? null : storedPanel === 'true',
    });
  });
  const [isCollectionOpen, setIsCollectionOpen] = useState<boolean>(false);
  const [poemComments, setPoemComments] = useState<PoemComment[]>([]);
  const [activeSideTab, setActiveSideTab] = useState<'analysis' | 'comments' | 'editor'>('editor');
  const [showCommentHighlights, setShowCommentHighlights] = useState<boolean>(true);
  const [collectionReviewMode, setCollectionReviewMode] = useState<boolean>(false);

  // Cloud poem state
  const [cloudPoemTitle, setCloudPoemTitle] = useState<string | null>(null);
  const [cloudPoemCollectionId, setCloudPoemCollectionId] = useState<string | null>(null);
  const [loadedCloudPoemId, setLoadedCloudPoemId] = useState<string | null>(null);
  const [cloudCollectionName, setCloudCollectionName] = useState<string | null>(null);
  const [cloudCollectionPoems, setCloudCollectionPoems] = useState<Array<{ title: string; content: string; sectionName: string | null }>>([]);
  const [cloudCollectionFullPoems, setCloudCollectionFullPoems] = useState<CollectionPoem[]>([]);
  const [cloudCollectionSections, setCloudCollectionSections] = useState<CollectionSection[]>([]);
  const [isLoadingCloudCollection, setIsLoadingCloudCollection] = useState<boolean>(false);
  const [isLoadingCloudPoem, setIsLoadingCloudPoem] = useState<boolean>(false);
  const [cloudPoemError, setCloudPoemError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cloudSaveSeqRef = useRef(0);
  const cloudPoemLoadSeqRef = useRef(0);
  const activePoemIdRef = useRef<string | null>(null);
  const activePoemTitleRef = useRef<string>('');
  const activePoemContentRef = useRef<string>('');
  const ensuredPoemIdsRef = useRef<Set<string>>(new Set());
  const migratedPoemIdsRef = useRef<Set<string>>(new Set());
  const skipCloudSaveRef = useRef(false);
  const pendingBlankEditorRef = useRef(false);
  const lastSavedTitleRef = useRef<string | null>(null);
  const loadedCloudPoemIdRef = useRef<string | null>(null);
  const lastSavedContentRef = useRef<string | null>(null);

  // Nav sidebar state - collapsed on phones so it does not cover the poem
  const [navSidebarOpen, setNavSidebarOpen] = useState<boolean>(() => (
    getDefaultNavSidebarOpen(typeof window !== 'undefined' ? window.innerWidth : 1280)
  ));

  // Collection management
  const {
    collection,
    addSection,
    updateSection,
    deleteSection,
    toggleSectionExpanded,
    importFiles,
    updatePoem,
    deletePoem,
    buildTree,
    getPoemById,
    reorderPoem,
    movePoemToSection,
    exportCollection,
    renameCollection,
  } = useCollection();

  // Editorial report management — use cloud collection data when editing a cloud poem
  const isCloudCollection = !!cloudPoemCollectionId;
  const editorialReport = useEditorialReport({
    user,
    collectionId: isCloudCollection ? cloudPoemCollectionId! : collection.id,
    collectionName: isCloudCollection ? (cloudCollectionName || 'Collection') : collection.name,
    poems: isCloudCollection ? cloudCollectionFullPoems : collection.poems,
    sections: isCloudCollection ? cloudCollectionSections : collection.sections,
  });

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
  const editorRef = useRef<EditorHandle | null>(null);
  const [showToolsMenu, setShowToolsMenu] = useState<boolean>(false);
  const [showInspirationMenu, setShowInspirationMenu] = useState<boolean>(false);
  const [savedPoems, setSavedPoems] = useState<SavedPoem[]>(() => {
    const saved = localStorage.getItem('savedPoems');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentPoemId, setCurrentPoemId] = useState<string | null>(null);
  const [poemTitle, setPoemTitle] = useState<string>('');
  const [lastSavedContent, setLastSavedContent] = useState<string | null>(null); // Track content at last explicit save
  loadedCloudPoemIdRef.current = loadedCloudPoemId;
  lastSavedContentRef.current = lastSavedContent;
  const [cloudSaveStatus, setCloudSaveStatus] = useState<CloudSaveStatus>('idle');
  const [cloudSaveError, setCloudSaveError] = useState<string | null>(null);
  const [lastCloudSavedAt, setLastCloudSavedAt] = useState<Date | null>(null);
  const [workspaceNotice, setWorkspaceNotice] = useState<string | null>(null);
  const activePoemId = cloudPoemId || currentPoemId || null;
  const [versionPreview, setVersionPreview] = useState<PoemVersion | null>(null);
  const previewTextRef = useRef<string | null>(null);
  const previewTitleRef = useRef<string | null>(null);
  const isPreviewing = Boolean(versionPreview);
  const [showSaveToCollectionModal, setShowSaveToCollectionModal] = useState(false);
  const [showSaveAuthModal, setShowSaveAuthModal] = useState(false);
  const pendingSaveRef = useRef(false);
  const [migrationPoems, setMigrationPoems] = useState<Array<{ title: string; content: string }>>([]);
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
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

  // Memoize conversation summaries for cross-poem awareness
  const conversationSummaries = useMemo(() => {
    return getAllConversationSummaries(activePoemId || undefined).map(s => ({
      poemTitle: s.poemTitle,
      summary: s.summary,
    }));
  }, [activePoemId]);

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

  // Check for local poems to migrate to cloud when user authenticates
  useEffect(() => {
    if (!user) return;
    const poems = getLocalPoemsForCloudMigration();
    if (poems.length > 0) {
      setMigrationPoems(poems);
      setShowMigrationPrompt(true);
    }
  }, [user]);

  // After auth completes with a pending save, continue the save flow
  useEffect(() => {
    if (!user || !pendingSaveRef.current) return;
    pendingSaveRef.current = false;
    setShowSaveAuthModal(false);
    // Show the collection modal — it handles both "create new" and "pick existing"
    setShowSaveToCollectionModal(true);
  }, [user]);

  // Load cloud poem if ?poem= is in URL.
  // Depend on userId (not the user object) so auth refreshes cannot refetch
  // and write the last server snapshot over keys the poet just typed.
  useEffect(() => {
    if (!cloudPoemId || !userId || !supabase) {
      setCloudPoemTitle(null);
      setCloudPoemCollectionId(null);
      setLoadedCloudPoemId(null);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      if (pendingBlankEditorRef.current) {
        pendingBlankEditorRef.current = false;
        skipCloudSaveRef.current = false;
        setText('');
        setAnalyzedWords([]);
        setCurrentPoemId(null);
        setPoemTitle('');
        setLastSavedContent(null);
        lastSavedTitleRef.current = null;
        setCloudSaveStatus('idle');
        setCloudSaveError(null);
      }
      return;
    }

    if (!shouldFetchCloudPoem(cloudPoemId, loadedCloudPoemIdRef.current, userId)) {
      return;
    }

    const requestedPoemId = cloudPoemId;
    const previouslyLoadedId = loadedCloudPoemIdRef.current;
    skipCloudSaveRef.current = false;
    const loadSeq = cloudPoemLoadSeqRef.current + 1;
    cloudPoemLoadSeqRef.current = loadSeq;
    let cancelled = false;

    async function loadCloudPoem() {
      if (!supabase) return;
      setIsLoadingCloudPoem(true);
      setCloudPoemError(null);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      try {
        const { data, error } = await supabase
          .from('poems')
          .select('*')
          .eq('id', requestedPoemId)
          .single();

        if (error) throw error;
        if (cancelled || cloudPoemLoadSeqRef.current !== loadSeq) return;

        const poemData = data as Poem;
        const localContent = activePoemContentRef.current;
        const dirty = isCloudDraftDirty(localContent, lastSavedContentRef.current);
        const applyServer = shouldApplyServerContent({
          requestedPoemId,
          loadedPoemId: previouslyLoadedId,
          localContent,
          serverContent: poemData.content,
          isDirty: dirty,
        });

        if (applyServer) {
          setText(poemData.content);
          setPoemTitle(poemData.title);
          setLastSavedContent(poemData.content);
          lastSavedTitleRef.current = poemData.title;
        } else {
          lastSavedTitleRef.current = lastSavedTitleRef.current ?? poemData.title;
        }

        setCloudPoemTitle(poemData.title);
        setCloudPoemCollectionId(poemData.collection_id);
        setLoadedCloudPoemId(requestedPoemId);
        setLastCloudSavedAt(poemData.updated_at ? new Date(poemData.updated_at) : new Date());
        setCloudSaveStatus(dirty && previouslyLoadedId === requestedPoemId ? 'saving' : 'saved');
        setCloudSaveError(null);

        // Restore per-poem formatting (reset to defaults first so
        // formatting from a previous poem doesn't bleed into this one)
        const fmt = poemData.formatting;
        setParagraphAlign(fmt?.align || 'left');
        setSelectedFont(fmt?.font || 'libre-baskerville');
        setLineSpacing(fmt?.lineSpacing || 'normal');
        setFirstLineIndent(fmt?.firstLineIndent ?? false);
      } catch (err) {
        if (cancelled || cloudPoemLoadSeqRef.current !== loadSeq) return;
        console.error('Failed to load cloud poem:', err);
        setCloudPoemError('Failed to load poem');
      } finally {
        if (!cancelled && cloudPoemLoadSeqRef.current === loadSeq) {
          setIsLoadingCloudPoem(false);
        }
      }
    }

    loadCloudPoem();
    return () => {
      cancelled = true;
    };
  }, [cloudPoemId, userId, setText]);

  // Fetch all poems in the cloud collection for editor context
  useEffect(() => {
    if (!cloudPoemCollectionId || !supabase) {
      setCloudCollectionPoems([]);
      setCloudCollectionFullPoems([]);
      setCloudCollectionSections([]);
      setCloudCollectionName(null);
      setIsLoadingCloudCollection(false);
      return;
    }

    async function loadCloudCollection() {
      if (!supabase || !cloudPoemCollectionId) return;
      setIsLoadingCloudCollection(true);
      try {
        // Fetch collection name
        const { data: collData } = await supabase
          .from('collections')
          .select('name')
          .eq('id', cloudPoemCollectionId)
          .single();
        if (collData) setCloudCollectionName(collData.name);

        // Fetch sections with sort_order for correct ordering
        const { data: sectionsData } = await supabase
          .from('sections')
          .select('id, name, sort_order')
          .eq('collection_id', cloudPoemCollectionId)
          .order('sort_order');
        const sectionMap = new Map((sectionsData || []).map((s: { id: string; name: string; sort_order: number }) => [s.id, { name: s.name, sortOrder: s.sort_order }]));

        // Store full section data for editorial reports
        setCloudCollectionSections(
          (sectionsData || []).map((s: { id: string; name: string; sort_order: number }) => ({
            id: s.id,
            name: s.name,
            parentId: null,
            order: s.sort_order,
            isExpanded: true,
          }))
        );

        // Fetch all poems with full data
        const { data: poemsData } = await supabase
          .from('poems')
          .select('id, title, content, section_id, sort_order, created_at, updated_at')
          .eq('collection_id', cloudPoemCollectionId)
          .order('sort_order');

        // Store full poem data for editorial reports
        const now = new Date().toISOString();
        setCloudCollectionFullPoems(
          (poemsData || []).map((p: { id: string; title: string; content: string; section_id: string | null; sort_order: number; created_at: string; updated_at: string }) => ({
            id: p.id,
            title: p.title,
            content: p.content,
            sectionId: p.section_id,
            order: p.sort_order,
            status: 'draft' as PoemStatus,
            createdAt: p.created_at || now,
            updatedAt: p.updated_at || now,
          }))
        );

        // Sort poems by (section_sort_order, poem_sort_order) so sections appear in correct order
        const sortedPoems = (poemsData || [])
          .map((p: { title: string; content: string; section_id: string | null; sort_order: number }) => ({
            title: p.title,
            content: p.content,
            sectionName: p.section_id ? sectionMap.get(p.section_id)?.name ?? null : null,
            _sectionOrder: p.section_id ? sectionMap.get(p.section_id)?.sortOrder ?? 999 : -1,
            _poemOrder: p.sort_order,
          }))
          .sort((a: { _sectionOrder: number; _poemOrder: number }, b: { _sectionOrder: number; _poemOrder: number }) =>
            a._sectionOrder !== b._sectionOrder
              ? a._sectionOrder - b._sectionOrder
              : a._poemOrder - b._poemOrder
          );

        setCloudCollectionPoems(
          sortedPoems.map((p: { title: string; content: string; sectionName: string | null }) => ({
            title: p.title,
            content: p.content,
            sectionName: p.sectionName,
          }))
        );
      } catch (err) {
        console.error('Failed to load cloud collection poems:', err);
      } finally {
        setIsLoadingCloudCollection(false);
      }
    }

    loadCloudCollection();
  }, [cloudPoemCollectionId]);

  useEffect(() => {
    trackPageview(`${location.pathname}${location.search || ''}`, user?.id);
  }, [location.pathname, location.search, user?.id]);

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
    setPoemTitle('');
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

  const buildCurrentFormatting = useCallback((): PoemFormatting => ({
    align: paragraphAlign,
    font: selectedFont,
    lineSpacing,
    firstLineIndent,
  }), [paragraphAlign, selectedFont, lineSpacing, firstLineIndent]);

  const saveCloudPoemNow = useCallback(async (
    poemId: string,
    nextTitle: string,
    nextText: string,
    formatting: PoemFormatting,
  ) => {
    if (!supabase) return false;
    const saveSeq = cloudSaveSeqRef.current + 1;
    cloudSaveSeqRef.current = saveSeq;
    setCloudSaveStatus('saving');
    setCloudSaveError(null);

    try {
      const { error } = await supabase
        .from('poems')
        .update({
          content: nextText,
          title: nextTitle,
          formatting,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', poemId)
        .select('id')
        .single();

      if (error) throw error;

      if (cloudSaveSeqRef.current === saveSeq) {
        setLastSavedContent(nextText);
        lastSavedTitleRef.current = nextTitle;
        setLastCloudSavedAt(new Date());
        setCloudSaveStatus('saved');
        setCloudSaveError(null);
      }
      return true;
    } catch (err) {
      console.error('Failed to save cloud poem:', err);
      if (cloudSaveSeqRef.current === saveSeq) {
        setCloudSaveStatus('failed');
        setCloudSaveError('Save failed. Your latest text is still in this browser, but it has not reached the cloud.');
      }
      return false;
    }
  }, [supabase]);

  // Auto-save cloud poem changes (debounced).
  // Do not mark Saving or write to the server unless the loaded draft actually changed.
  useEffect(() => {
    if (!shouldScheduleCloudSave({
      poemId: cloudPoemId,
      loadedPoemId: loadedCloudPoemId,
      hasUser: Boolean(userId),
      isLoading: isLoadingCloudPoem,
      isPreviewing,
      skipSave: skipCloudSaveRef.current,
      currentText: text,
      currentTitle: poemTitle,
      lastSavedText: lastSavedContent,
      lastSavedTitle: lastSavedTitleRef.current,
    })) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const poemIdToSave = cloudPoemId;
    const titleToSave = poemTitle;
    const textToSave = text;
    const formattingToSave = buildCurrentFormatting();
    setCloudSaveStatus('saving');
    setCloudSaveError(null);
    saveTimeoutRef.current = setTimeout(async () => {
      saveTimeoutRef.current = null;
      if (skipCloudSaveRef.current || !poemIdToSave) return;
      await saveCloudPoemNow(poemIdToSave, titleToSave, textToSave, formattingToSave);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [text, poemTitle, cloudPoemId, loadedCloudPoemId, userId, isLoadingCloudPoem, isPreviewing, lastSavedContent, buildCurrentFormatting, saveCloudPoemNow]);

  useEffect(() => {
    const activeId = cloudPoemId || currentPoemId;
    activePoemIdRef.current = activeId;
    activePoemTitleRef.current = poemTitle;
    activePoemContentRef.current = text;
  }, [cloudPoemId, currentPoemId, poemTitle, text]);

  // Sync editor text back to collection so AI editor sees current content
  useEffect(() => {
    if (!currentPoemId || cloudPoemId) return; // Only for local collection poems
    const poem = getPoemById(currentPoemId);
    if (!poem) return;
    // Only update if content or title actually changed
    if (poem.content !== text || poem.title !== poemTitle) {
      updatePoem(currentPoemId, { content: text, title: poemTitle });
    }
  }, [currentPoemId, cloudPoemId, text, poemTitle, getPoemById, updatePoem]);

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

  const createCloudPoem = useCallback(async (collectionId: string) => {
    if (!supabase || !user) return false;
    setCloudSaveStatus('saving');
    setCloudSaveError(null);
    try {
      const { data, error } = await supabase
        .from('poems')
        .insert({
          collection_id: collectionId,
          title: 'Untitled',
          content: '',
          formatting: buildCurrentFormatting(),
          sort_order: 0,
        } as any)
        .select('id')
        .single();

      if (error) throw error;
      skipCloudSaveRef.current = true;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      setText('');
      setAnalyzedWords([]);
      setPoemTitle('');
      setLastSavedContent('');
      lastSavedTitleRef.current = 'Untitled';
      setLastCloudSavedAt(new Date());
      setCloudSaveStatus('saved');
      localStorage.setItem('lastCloudPoemId', data.id);
      navigate(`/?poem=${data.id}`);
      return true;
    } catch (err) {
      console.error('Failed to create cloud poem:', err);
      setCloudSaveStatus('failed');
      setCloudSaveError('Could not create a new cloud poem. Your current draft was not cleared.');
      return false;
    }
  }, [buildCurrentFormatting, navigate, setText, supabase, user]);

  const blankLocalEditor = () => {
    setText('');
    setAnalyzedWords([]);
    setCurrentPoemId(null);
    setPoemTitle('');
    setLastSavedContent(null);
    lastSavedTitleRef.current = null;
    setCloudSaveStatus('idle');
    setCloudSaveError(null);
  };

  const handleNewPoem = async () => {
    const hasDraft = hasDraftToProtect(text, poemTitle);
    const confirmed = !hasDraft || window.confirm(NEW_POEM_CONFIRM_MESSAGE);
    const path = planNewPoem({
      confirmed,
      hasDraft,
      cloudPoemId,
      cloudCollectionId: cloudPoemCollectionId,
      isAuthenticated: Boolean(user),
    });

    if (path === 'abort') return;

    if (path === 'create-cloud' && cloudPoemCollectionId) {
      const saved = await flushCurrentCloudPoem();
      if (!saved) return;
      await createCloudPoem(cloudPoemCollectionId);
      return;
    }

    try {
      localStorage.removeItem('lastCloudPoemId');
    } catch (err) {
      console.warn('Failed to clear last cloud poem id:', err);
    }

    if (path === 'blank-local-after-leave') {
      // Leave the cloud URL first so autosave cannot write an empty buffer
      // over the poem the poet was just editing.
      skipCloudSaveRef.current = true;
      pendingBlankEditorRef.current = true;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      navigate('/', { replace: true });
      return;
    }

    blankLocalEditor();
    navigate('/', { replace: true });
  };

  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [showExportOptions, setShowExportOptions] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [showMobileFormatting, setShowMobileFormatting] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // Apply markdown formatting via the unified EditorHandle interface
  const applyFormatting = useCallback((type: 'bold' | 'italic' | 'underline') => {
    const handle = editorRef.current;
    if (!handle) return;
    handle.applyFormatting(type);
    handle.focus();
  }, []);

  const handlePasteFromClipboard = useCallback(async () => {
    const handle = editorRef.current;
    if (!handle) return;
    try {
      await handle.pasteFromClipboard();
    } catch (err) {
      console.error('Clipboard paste failed:', err);
      const toast = document.createElement('div');
      toast.className = 'paste-toast';
      toast.textContent = 'Tap the editor and use long-press > Paste';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
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

  const handleEditComment = useCallback(async (commentId: string, text: string) => {
    if (!activePoemId) return;
    const next = await updatePoemComment(activePoemId, commentId, { text });
    setPoemComments(next);
  }, [activePoemId]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!activePoemId) return;
    const next = await deletePoemComment(activePoemId, commentId);
    setPoemComments(next);
  }, [activePoemId]);

  const handleJumpToComment = useCallback((comment: PoemComment) => {
    const handle = editorRef.current;
    if (!handle) return;
    if (handle.jumpToRange) {
      handle.jumpToRange(comment.range);
    }
    handle.focus();
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

  const saveToCollection = async (collectionId: string) => {
    if (!supabase || !user) return false;
    const title = poemTitle.trim() || 'Untitled';
    const formatting: PoemFormatting = {
      align: paragraphAlign,
      font: selectedFont,
      lineSpacing,
      firstLineIndent,
    };
    try {
      const { data, error } = await supabase
        .from('poems')
        .insert({
          collection_id: collectionId,
          title,
          content: text,
          formatting,
          sort_order: 0,
        })
        .select('id')
        .single();
      if (error) throw error;
      localStorage.setItem('lastUsedCollectionId', collectionId);
      setLastSavedContent(text);
      navigate(`/?poem=${data.id}`, { replace: true });
      return true;
    } catch (err) {
      console.error('Failed to save to collection:', err);
      setCloudSaveStatus('failed');
      setCloudSaveError('Save failed. Your draft is still in this browser.');
      return false;
    }
  };

  const handleSavePoem = async () => {
    // If already editing a cloud poem, force an immediate save (bypass debounce)
    if (cloudPoemId && supabase) {
      if (loadedCloudPoemId !== cloudPoemId) return false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      return saveCloudPoemNow(cloudPoemId, poemTitle, text, buildCurrentFormatting());
    }

    // Guest user: prompt to create an account, then resume save
    if (!user) {
      pendingSaveRef.current = true;
      setShowSaveAuthModal(true);
      return false;
    }

    // Authenticated user: save to a collection
    if (userCollections.length === 0) {
      // No collections yet — show modal so user can name their first collection
      setShowSaveToCollectionModal(true);
      return false;
    } else if (userCollections.length === 1) {
      return saveToCollection(userCollections[0].id);
    } else {
      // Multiple collections — show picker
      setShowSaveToCollectionModal(true);
      return false;
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
      setPoemTitle('');
      setLastSavedContent(null);
    }
  }, [getPoemById, deletePoem, currentPoemId, setText]);

  const handleRenameSection = useCallback((id: string, name: string) => {
    updateSection(id, { name });
  }, [updateSection]);

  const flushCurrentCloudPoem = useCallback(async () => {
    if (!cloudPoemId || !user || !supabase || isPreviewing) return true;
    if (loadedCloudPoemId !== cloudPoemId) return true;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    return saveCloudPoemNow(cloudPoemId, poemTitle, text, buildCurrentFormatting());
  }, [cloudPoemId, user, supabase, isPreviewing, loadedCloudPoemId, text, poemTitle, buildCurrentFormatting, saveCloudPoemNow]);

  // Handle poem selection from nav sidebar
  const handleNavPoemSelect = useCallback(async (poemId: string) => {
    if (poemId === cloudPoemId) return;
    const saved = await flushCurrentCloudPoem();
    if (!saved) return;
    navigate(`/?poem=${poemId}`);
  }, [cloudPoemId, flushCurrentCloudPoem, navigate]);

  const poemStats = useMemo(() => {
    const plainText = stripMarkdownFormatting(text);
    const lines = plainText.length > 0 ? plainText.split('\n') : [];
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const words = plainText.trim().length > 0
      ? plainText.trim().split(/\s+/).filter(Boolean).length
      : 0;
    const stanzas = plainText.trim().length > 0
      ? plainText.trim().split(/\n\s*\n/).filter(stanza => stanza.trim().length > 0).length
      : 0;
    return {
      words,
      lines: nonEmptyLines.length,
      stanzas,
      characters: plainText.length,
    };
  }, [text]);

  const saveLabel = useMemo(() => {
    if (cloudPoemId) {
      if (cloudSaveStatus === 'saving') return 'Saving...';
      if (cloudSaveStatus === 'failed') return 'Save failed';
      if (lastCloudSavedAt) return `Saved ${lastCloudSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      return 'Cloud draft';
    }
    return `Local draft saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }, [cloudPoemId, cloudSaveStatus, lastCloudSavedAt, lastSaved]);

  const handleSaveSnapshot = useCallback(async () => {
    if (!activePoemId) {
      setWorkspaceNotice('Save the poem first, then snapshot the draft.');
      return;
    }
    if (!user) {
      pendingSaveRef.current = true;
      setWorkspaceNotice('Sign in to keep version history across devices.');
      setShowSaveAuthModal(true);
      return;
    }

    const saved = await flushCurrentCloudPoem();
    if (!saved) return;
    await addPoemVersion(activePoemId, poemTitle, text, user.id);
    setWorkspaceNotice('Snapshot saved to version history.');
    window.setTimeout(() => setWorkspaceNotice(null), 4000);
  }, [activePoemId, flushCurrentCloudPoem, poemTitle, text, user]);

  useEffect(() => {
    if (!hasUnsavedChanges && cloudSaveStatus !== 'failed') return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, cloudSaveStatus]);

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
        title="Poetry Editor — AI Feedback for Serious Poets"
        description="Get AI feedback on your poetry — craft, rhythm, imagery, and voice. Not a poem generator. A writing tool for poets who want to improve their work."
        canonicalPath="/"
        keywords="poetry editor, AI poetry coach, AI poetry feedback, poetry coaching, poetry feedback, rhyme finder, syllable counter, synonym finder, poetry writing tool"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Poetry Editor",
          "url": "https://poetryeditor.com",
          "applicationCategory": "WritingApplication",
          "operatingSystem": "Web",
          "description": "Get AI feedback on your poetry — craft, rhythm, imagery, and voice. Not a poem generator. A writing tool for poets who want to improve their work."
        }}
      />
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="app-title-group">
              <h1 className="app-title">Poetry Editor</h1>
              <span className="app-subtitle">AI feedback for serious poets</span>
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
                  <button
                    className="export-item"
                    onClick={() => {
                      handleSaveSnapshot();
                      setShowExportMenu(false);
                      setShowExportOptions(false);
                    }}
                  >
                    Snapshot draft
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
                        <button
                          className="export-submenu-item"
                          onClick={() => {
                            exportPoemAsPdf({
                              title: poemTitle,
                              text,
                              authorName: user?.email?.split('@')[0] || '',
                              align: paragraphAlign,
                              lineSpacing,
                            });
                            setShowExportMenu(false);
                            setShowExportOptions(false);
                          }}
                        >
                          PDF (.pdf)
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
                        className="inspiration-item"
                        onClick={() => setShowInspirationMenu(false)}
                      >
                        <span className="inspiration-poet-name">{poet}</span>
                        <span className="inspiration-count">{poemsByPoet[poet].length}</span>
                      </a>
                    ))}
                  </div>
                  <div className="inspiration-section inspiration-browse-all">
                    <a href="/poems" className="inspiration-item browse-all-link" onClick={() => setShowInspirationMenu(false)}>
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
                  <a href="/rhymes" className="tools-item" onClick={() => setShowToolsMenu(false)}>
                    Rhyme Dictionary
                  </a>
                  <a href="/synonyms" className="tools-item" onClick={() => setShowToolsMenu(false)}>
                    Synonyms
                  </a>
                  <a href="/syllables" className="tools-item" onClick={() => setShowToolsMenu(false)}>
                    Syllable Counter
                  </a>
                  <a href="/rhyme-scheme-analyzer" className="tools-item" onClick={() => setShowToolsMenu(false)}>
                    Rhyme Scheme Maker
                  </a>
                  <a href="/haiku-checker" className="tools-item form-tool" onClick={() => setShowToolsMenu(false)}>
                    Haiku Checker
                  </a>
                  <a href="/sonnet-checker" className="tools-item form-tool" onClick={() => setShowToolsMenu(false)}>
                    Sonnet Checker
                  </a>
                </div>
              )}
            </div>
            {/* Mobile paste button — direct click for iOS clipboard permission */}
            <button
              className="mobile-paste-btn"
              onClick={handlePasteFromClipboard}
              aria-label="Paste from clipboard"
              title="Paste from clipboard"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
            </button>
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
                  {/* File actions */}
                  <div className="mobile-overflow-item submenu-label">File</div>
                  <button
                    className="mobile-overflow-item"
                    onClick={() => {
                      handleNewPoem();
                      setShowMobileMenu(false);
                    }}
                  >
                    New Poem
                  </button>
                  <button
                    className="mobile-overflow-item"
                    onClick={() => {
                      handleSavePoem();
                      setShowMobileMenu(false);
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="mobile-overflow-item"
                    onClick={() => {
                      handleSaveSnapshot();
                      setShowMobileMenu(false);
                    }}
                  >
                    Snapshot draft
                  </button>
                  <button
                    className="mobile-overflow-item"
                    onClick={() => {
                      setShowShareModal(true);
                      setShowMobileMenu(false);
                    }}
                  >
                    Share Image
                  </button>
                  {/* Export */}
                  <div className="mobile-overflow-item submenu-label">Export</div>
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
                  <button
                    className="mobile-overflow-item"
                    onClick={() => {
                      exportPoemAsPdf({
                        title: poemTitle,
                        text,
                        authorName: user?.email?.split('@')[0] || '',
                        align: paragraphAlign,
                        lineSpacing,
                      });
                      setShowMobileMenu(false);
                    }}
                  >
                    Export as PDF
                  </button>
                  {/* Formatting */}
                  <div className="mobile-overflow-item submenu-label">Formatting</div>
                  <div className="mobile-formatting-row">
                    <button
                      className="mobile-format-btn"
                      onClick={() => applyFormatting('bold')}
                      title="Bold"
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      className="mobile-format-btn"
                      onClick={() => applyFormatting('italic')}
                      title="Italic"
                    >
                      <em>I</em>
                    </button>
                    <button
                      className="mobile-format-btn"
                      onClick={() => applyFormatting('underline')}
                      title="Underline"
                    >
                      <span style={{ textDecoration: 'underline' }}>U</span>
                    </button>
                  </div>
                  <button
                    className="mobile-overflow-item"
                    onClick={() => setShowMobileFormatting(!showMobileFormatting)}
                  >
                    More Formatting {showMobileFormatting ? '▾' : '▸'}
                  </button>
                  {showMobileFormatting && (
                    <>
                      <div className="mobile-overflow-item submenu-label" style={{ paddingLeft: 20 }}>Line Spacing</div>
                      <button
                        className="mobile-overflow-item"
                        style={{ paddingLeft: 20 }}
                        onClick={() => setLineSpacing('normal')}
                      >
                        {lineSpacing === 'normal' ? '✓ ' : ''}Normal
                      </button>
                      <button
                        className="mobile-overflow-item"
                        style={{ paddingLeft: 20 }}
                        onClick={() => setLineSpacing('relaxed')}
                      >
                        {lineSpacing === 'relaxed' ? '✓ ' : ''}Relaxed
                      </button>
                      <button
                        className="mobile-overflow-item"
                        style={{ paddingLeft: 20 }}
                        onClick={() => setLineSpacing('spacious')}
                      >
                        {lineSpacing === 'spacious' ? '✓ ' : ''}Spacious
                      </button>
                      <div className="mobile-overflow-item submenu-label" style={{ paddingLeft: 20 }}>Alignment</div>
                      <button
                        className="mobile-overflow-item"
                        style={{ paddingLeft: 20 }}
                        onClick={() => setParagraphAlign('left')}
                      >
                        {paragraphAlign === 'left' ? '✓ ' : ''}Left
                      </button>
                      <button
                        className="mobile-overflow-item"
                        style={{ paddingLeft: 20 }}
                        onClick={() => setParagraphAlign('center')}
                      >
                        {paragraphAlign === 'center' ? '✓ ' : ''}Center
                      </button>
                      <button
                        className="mobile-overflow-item"
                        style={{ paddingLeft: 20 }}
                        onClick={() => setParagraphAlign('right')}
                      >
                        {paragraphAlign === 'right' ? '✓ ' : ''}Right
                      </button>
                    </>
                  )}
                  {/* Theme */}
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

      <div className="workspace-status-strip" role="status" aria-live="polite">
        <span className="privacy-pill" title="Poem text should not be logged or casually accessed by the site operator.">
          Private by default
        </span>
        <span className={`save-status-pill ${cloudSaveStatus}`}>
          {saveLabel}
        </span>
        {(cloudSaveError || workspaceNotice) && (
          <span className={`workspace-notice ${cloudSaveError ? 'error' : ''}`}>
            {cloudSaveError || workspaceNotice}
          </span>
        )}
        <span className="poem-stats">
          {poemStats.words} words | {poemStats.lines} lines | {poemStats.stanzas} stanzas | {poemStats.characters} chars
        </span>
      </div>

      <div className="app-content">
        {/* Collection panel hidden for now - not ready for release
        <CollectionPanel
          isOpen={isCollectionOpen}
          collectionName={collection.name}
          treeNodes={buildTree()}
          currentPoemId={currentPoemId}
          onPoemSelect={handleCollectionPoemSelect}
          onSectionToggle={toggleSectionExpanded}
          onImportFiles={handleCollectionImport}
          onAddSection={addSection}
          onRenameCollection={renameCollection}
          onRenameSection={handleRenameSection}
          onDeleteSection={deleteSection}
          onDeletePoem={handleCollectionDeletePoem}
          onReorderPoem={reorderPoem}
          onMovePoemToSection={movePoemToSection}
          onStatusChange={(poemId, status) => updatePoem(poemId, { status })}
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
          {cloudPoemError && (
            <div className="cloud-poem-error" role="alert">
              <span>{cloudPoemError}</span>
              <button onClick={() => setCloudPoemError(null)} aria-label="Dismiss error">&times;</button>
            </div>
          )}
          <EditorSwitch
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
            onEditorMount={(handle) => {
              editorRef.current = handle as any;
            }}
            comments={showCommentHighlights ? poemComments : []}
            onAddComment={handleAddComment}
            showCommentHighlights={showCommentHighlights}
            onToggleCommentHighlights={() => setShowCommentHighlights(prev => !prev)}
            readOnly={Boolean(versionPreview)}
          />

          <button
            className={`panel-toggle ${isPanelOpen ? 'open' : ''}`}
            onClick={() => {
              const next = !isPanelOpen;
              setIsPanelOpen(next);
              localStorage.setItem('analysisPanelOpen', String(next));
              if (!hasEverOpenedPanel && next) {
                setHasEverOpenedPanel(true);
                localStorage.setItem('hasOpenedAnalysisPanel', 'true');
              }
            }}
            title={isPanelOpen ? "Close analysis panel" : "Open analysis panel"}
          >
            <span className="panel-toggle-icon">
              {isPanelOpen ? '›' : '‹'}
            </span>
            <span className="panel-toggle-label">{activeSideTab === 'editor' ? 'Editor' : 'Analysis'}</span>
          </button>
        </div>

        {isPanelOpen && (
          <div className="side-panel">
            <div className="side-panel-tabs">
              <button
                className={`side-panel-tab ${activeSideTab === 'editor' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSideTab('editor');
                  setCollectionReviewMode(false);
                }}
              >
                Editor
              </button>
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
              {activeSideTab === 'editor' && (collection.poems.length > 0 || cloudPoemCollectionId) && (
                <button
                  className="side-panel-tab"
                  onClick={() => {
                    if (isCloudCollection && isLoadingCloudCollection) return;
                    editorialReport.setShowPreFlight(true);
                  }}
                  title="Generate a full editorial report for your collection"
                >
                  Editorial Report
                </button>
              )}
            </div>
            {activeSideTab === 'editor' ? (
              <EditorChat
                user={user}
                profile={poetProfile}
                poemId={activePoemId}
                poemTitle={poemTitle}
                poemText={text}
                collectionPoems={cloudPoemCollectionId
                  ? cloudCollectionPoems
                  : [...collection.poems]
                    .map(p => ({
                      ...p,
                      sectionName: p.sectionId
                        ? collection.sections.find(s => s.id === p.sectionId)?.name ?? null
                        : null,
                      _sectionOrder: p.sectionId
                        ? collection.sections.findIndex(s => s.id === p.sectionId)
                        : -1,
                    }))
                    .sort((a, b) => a._sectionOrder !== b._sectionOrder
                      ? a._sectionOrder - b._sectionOrder
                      : a.order - b.order)
                    .map(({ _sectionOrder, ...p }) => p)
                }
                collectionName={cloudPoemCollectionId ? (cloudCollectionName || 'Collection') : collection.name}
                mode="per_poem"
                conversationSummaries={conversationSummaries}
                onCompleteOnboarding={completeOnboarding}
                onAddLearning={(insight: string) => addLearning(insight)}
                onUpdateSummary={updateSummary}
                editorSettings={editorSettings}
                onUpdateEditorSettings={updateEditorSettings}
                memoryContext={getMemoryContext()}
                onExtractLearnings={(msgs) => extractAndSaveLearnings(msgs)}
                onCreateReport={() => {
                  if (isCloudCollection && isLoadingCloudCollection) return; // Data not ready yet
                  editorialReport.setShowPreFlight(true);
                }}
                hasExistingReport={editorialReport.reportHistory.length > 0}
              />
            ) : activeSideTab === 'analysis' ? (
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
                llmAnalysis={llmAnalysis}
                onAnalysisData={handleAnalysisData}
              />
            ) : (
              <CommentsPanel
                comments={poemComments}
                onResolve={handleResolveComment}
                onDelete={handleDeleteComment}
                onEdit={handleEditComment}
                onJump={handleJumpToComment}
              />
            )}
          </div>
        )}
      </div>

      <footer className="app-footer">
        <p className="footer-line footer-privacy">Your poems are private. We do not read drafts, and support should only inspect poem text with your explicit consent.</p>
        <p className="footer-line">Ideas, feedback, or bugs? Write <a href="mailto:contact@poetryeditor.com">contact@poetryeditor.com</a>. We will get back in &lt;48 hours.</p>
      </footer>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        poemTitle={poemTitle}
        poemText={text}
        paragraphAlign={paragraphAlign}
      />

      {editorialReport.showPreFlight && (() => {
        const allSections = isCloudCollection ? cloudCollectionSections : collection.sections;
        const allPoems = isCloudCollection ? cloudCollectionFullPoems : collection.poems;
        // Only include sections that have at least one poem
        const nonEmptySections = allSections.filter(s =>
          allPoems.some(p => p.sectionId === s.id)
        );
        return (
        <PreFlightForm
          sections={nonEmptySections}
          collectionName={isCloudCollection ? (cloudCollectionName || 'Collection') : collection.name}
          savedAnswers={editorialReport.savedAnswers}
          isGenerating={editorialReport.isGenerating}
          onSubmit={(answers) => {
            const reportCollectionId = isCloudCollection ? cloudPoemCollectionId! : collection.id;
            const reportCollectionName = isCloudCollection ? (cloudCollectionName || 'Collection') : collection.name;
            const reportPoems = allPoems;
            const reportSections = nonEmptySections;

            // Guard: don't navigate if poems haven't loaded yet
            if (reportPoems.length === 0) {
              console.error('Editorial report: no poems available. Cloud loading:', isLoadingCloudCollection);
              return;
            }

            editorialReport.setShowPreFlight(false);
            navigate('/editorial-report', {
              state: {
                generateNew: true,
                collectionId: reportCollectionId,
                collectionName: reportCollectionName,
                preFlightAnswers: answers,
                poems: reportPoems,
                sections: reportSections,
              },
            });
          }}
          onCancel={() => editorialReport.setShowPreFlight(false)}
        />
        );
      })()}

      {/* Save to Collection Modal */}
      <SaveToCollectionModal
        isOpen={showSaveToCollectionModal}
        onClose={() => setShowSaveToCollectionModal(false)}
        poemTitle={poemTitle.trim() || 'Untitled'}
        poemContent={text}
        formatting={{ align: paragraphAlign, font: selectedFont, lineSpacing, firstLineIndent }}
        onSaved={(collectionId, poemId) => {
          setShowSaveToCollectionModal(false);
          setLastSavedContent(text);
          localStorage.setItem('lastUsedCollectionId', collectionId);
          navigate(`/?poem=${poemId}`, { replace: true });
        }}
      />

      {/* Auth modal for guest save */}
      <AuthModal isOpen={showSaveAuthModal} onClose={() => setShowSaveAuthModal(false)} />

      {/* Migration prompt for authenticated users with local poems */}
      {showMigrationPrompt && user && supabase && (
        <div className="signup-nudge">
          <span>We found {migrationPoems.length} {migrationPoems.length === 1 ? 'poem' : 'poems'} saved locally. Import to your collection?</span>
          <button
            className="signup-nudge-link"
            onClick={async () => {
              const targetId = userCollections.length === 1 ? userCollections[0].id : undefined;
              const collectionId = await migrateLocalPoemsToCloud(user.id, supabase!, targetId);
              setShowMigrationPrompt(false);
              if (collectionId) {
                navigate(`/my-collections/${collectionId}`);
              }
            }}
          >
            Import
          </button>
          <button
            className="signup-nudge-close"
            onClick={() => { dismissCloudMigration(); setShowMigrationPrompt(false); }}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
