import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { editor } from 'monaco-editor';
import { getPoemBySlug, PoemAnalysis } from '../../data/poems';
import { Layout } from '../../components/Layout';
import { PoetryEditor } from '../../components/PoetryEditor';
import { AnalysisPanel } from '../../components/AnalysisPanel';
import { SEOHead } from '../../components/SEOHead';
import { ShareModal } from '../../components/ShareModal';
import { RelatedTools } from '../../components/RelatedTools';
import { WordInfo } from '../../types';
import { type PassiveVoiceInstance } from '../../utils/passiveVoiceDetector';
import { type TenseInstance } from '../../utils/tenseChecker';
import { type StressedSyllableInstance } from '../../utils/scansionAnalyzer';
import './PoemPage.css';

export function PoemPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [poem, setPoem] = useState<PoemAnalysis | null>(null);
  const [text, setText] = useState('');
  const [analyzedWords, setAnalyzedWords] = useState<WordInfo[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Analysis tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'line-by-line' | 'devices' | 'technical'>('overview');

  // Theme state
  const [theme] = useState<'light' | 'dark' | 'yellow'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'yellow') return saved;
    return 'light';
  });

  // Font settings
  const [selectedFont] = useState<string>(() => localStorage.getItem('selectedFont') || 'libre-baskerville');
  const [lineSpacing] = useState<'normal' | 'relaxed' | 'spacious'>(() =>
    (localStorage.getItem('lineSpacing') as 'normal' | 'relaxed' | 'spacious') || 'normal');
  const [paragraphAlign] = useState<'left' | 'center' | 'right'>(() =>
    (localStorage.getItem('paragraphAlign') as 'left' | 'center' | 'right') || 'left');
  const [firstLineIndent] = useState<boolean>(() => localStorage.getItem('firstLineIndent') === 'true');

  // Highlighting state for technical analysis
  const [highlightedPOS, setHighlightedPOS] = useState<string | null>(null);
  const [scansionColoringData, setScansionColoringData] = useState<{
    syllableInstances: StressedSyllableInstance[];
  } | null>(null);
  const [highlightedLines, setHighlightedLines] = useState<number[] | null>(null);

  const FONT_OPTIONS: Record<string, string> = {
    'libre-baskerville': "'Libre Baskerville', serif",
    'eb-garamond': "'EB Garamond', serif",
    'crimson-pro': "'Crimson Pro', serif",
    'lora': "'Lora', serif",
    'georgia': "Georgia, serif",
    'merriweather': "'Merriweather', serif",
  };

  useEffect(() => {
    if (slug) {
      const foundPoem = getPoemBySlug(slug);
      if (foundPoem) {
        setPoem(foundPoem);
        setText(foundPoem.text);
      } else {
        navigate('/');
      }
    }
  }, [slug, navigate]);

  useEffect(() => {
    document.documentElement.classList.remove('dark-mode', 'yellow-mode');
    if (theme === 'dark') document.documentElement.classList.add('dark-mode');
    else if (theme === 'yellow') document.documentElement.classList.add('yellow-mode');
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.share-dropdown')) setShowShareMenu(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Coloring/highlighting data for editor (from AnalysisPanel callbacks)
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
  const [highlightedWords, setHighlightedWords] = useState<{ word: string; lineNumber: number }[] | null>(null);

  // Last saved timestamp for AnalysisPanel
  const lastSaved = useMemo(() => new Date(), []);

  // Create mapping from content line numbers (1,2,3...) to editor line numbers (accounting for blank lines)
  const contentToEditorLineMap = useMemo(() => {
    if (!text) return new Map<number, number>();
    const allLines = text.split('\n');
    const map = new Map<number, number>();
    let contentLineNum = 1;
    allLines.forEach((line, idx) => {
      if (line.trim()) {
        map.set(contentLineNum, idx + 1); // Editor lines are 1-indexed
        contentLineNum++;
      }
    });
    return map;
  }, [text]);

  // Convert content line range to editor line range
  const getEditorLinesFromContentLines = useCallback((lineSpec: string): number[] => {
    const parts = lineSpec.split('-').map(n => parseInt(n.trim()));
    const editorLines: number[] = [];
    if (parts.length === 2) {
      for (let i = parts[0]; i <= parts[1]; i++) {
        const editorLine = contentToEditorLineMap.get(i);
        if (editorLine) editorLines.push(editorLine);
      }
    } else if (parts.length === 1) {
      const editorLine = contentToEditorLineMap.get(parts[0]);
      if (editorLine) editorLines.push(editorLine);
    }
    return editorLines;
  }, [contentToEditorLineMap]);

  const handleWordsAnalyzed = useCallback((words: WordInfo[]) => setAnalyzedWords(words), []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setShowShareMenu(false);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const handleShareTwitter = useCallback(() => {
    const shareText = `"${poem?.title}" by ${poem?.poet}`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, '_blank');
    setShowShareMenu(false);
  }, [poem]);

  const handleShareFacebook = useCallback(() => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
    setShowShareMenu(false);
  }, []);

  // Generate Wikipedia URLs
  const getWikipediaUrl = (name: string) => {
    const formatted = name.replace(/\s+/g, '_');
    return `https://en.wikipedia.org/wiki/${formatted}`;
  };

  if (!poem) {
    return (
      <Layout>
        <div className="poem-page-loading">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={`${poem.title} by ${poem.poet} - Analysis & Commentary`}
        description={poem.seoDescription}
        canonicalPath={`/poems/${poem.slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": `${poem.title} by ${poem.poet} - Analysis & Commentary`,
          "description": poem.seoDescription,
          "author": {
            "@type": "Organization",
            "name": "Poetry Editor"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Poetry Editor",
            "url": "https://poetryeditor.com"
          },
          "mainEntity": {
            "@type": "CreativeWork",
            "name": poem.title,
            "author": {
              "@type": "Person",
              "name": poem.poet,
              "birthDate": poem.poetBirth.toString(),
              "deathDate": poem.poetDeath.toString()
            },
            "datePublished": poem.year.toString(),
            "genre": poem.form,
            "inLanguage": "en",
            "about": poem.analysis.themes.map(theme => ({
              "@type": "Thing",
              "name": theme
            }))
          }
        }}
      />

      <div className="poem-page-content">
        <div className="editor-pane">
          <PoetryEditor
            value={text}
            onChange={() => {}}
            poemId={poem.slug}
            poemTitle={poem.title}
            onTitleChange={() => {}}
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
            onLineHover={() => {}}
            editorFont={FONT_OPTIONS[selectedFont] || FONT_OPTIONS['libre-baskerville']}
            paragraphAlign={paragraphAlign}
            firstLineIndent={firstLineIndent}
            lineSpacing={lineSpacing}
            onEditorMount={(ed) => { editorRef.current = ed; }}
            readOnly={true}
            hideTitle={false}
            poemMetadata={{
              poet: poem.poet,
              poetUrl: getWikipediaUrl(poem.poet),
              collection: poem.collection,
              collectionUrl: poem.collection ? getWikipediaUrl(poem.collection) : undefined,
              year: poem.year,
            }}
          />
        </div>

        <div className="side-panel poem-panel">
          {/* Analysis tabs */}
          <div className="poetic-analysis">
            <div className="analysis-tabs">
              <button
                className={`analysis-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`analysis-tab ${activeTab === 'line-by-line' ? 'active' : ''}`}
                onClick={() => setActiveTab('line-by-line')}
              >
                Line-by-Line
              </button>
              <button
                className={`analysis-tab ${activeTab === 'devices' ? 'active' : ''}`}
                onClick={() => setActiveTab('devices')}
              >
                Devices
              </button>
              <button
                className={`analysis-tab technical-tab ${activeTab === 'technical' ? 'active' : ''}`}
                onClick={() => setActiveTab('technical')}
              >
                Technical
              </button>
            </div>

            <div className="analysis-content">
              {activeTab === 'overview' && (
                <div className="tab-content">
                  <p className="overview-text">{poem.analysis.overview}</p>
                  <div className="themes-section">
                    <h4>Themes</h4>
                    <ul className="themes-list">
                      {poem.analysis.themes.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>
                  {poem.analysis.historicalContext && (
                    <div className="context-section">
                      <h4>Historical Context</h4>
                      <p>{poem.analysis.historicalContext}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'line-by-line' && (
                <div className="tab-content">
                  {poem.analysis.lineByLine.map((item, i) => (
                    <div
                      key={i}
                      className="line-analysis-item"
                      onMouseEnter={() => {
                        setHighlightedLines(getEditorLinesFromContentLines(item.lines));
                      }}
                      onMouseLeave={() => setHighlightedLines(null)}
                    >
                      <span className="line-ref">Lines {item.lines}</span>
                      <p className="line-commentary">{item.commentary}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'devices' && (
                <div className="tab-content">
                  {poem.analysis.literaryDevices.map((d, i) => (
                    <div key={i} className="device-item">
                      <h4 className="device-name">{d.device}</h4>
                      <blockquote className="device-example">"{d.example}"</blockquote>
                      <p className="device-explanation">{d.explanation}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'technical' && (
                <div className="technical-panel-wrapper">
                  <AnalysisPanel
                    text={text}
                    words={analyzedWords}
                    lastSaved={lastSaved}
                    onHighlightPOS={setHighlightedPOS}
                    onMeterExpand={setMeterColoringData}
                    onSyllableExpand={setSyllableColoringData}
                    onRhythmVariationExpand={setRhythmVariationColoringData}
                    onLineLengthExpand={setLineLengthColoringData}
                    onPunctuationExpand={setPunctuationColoringData}
                    onPassiveVoiceExpand={setPassiveVoiceColoringData}
                    onTenseExpand={setTenseColoringData}
                    onScansionExpand={setScansionColoringData}
                    onSectionCollapse={() => {
                      setMeterColoringData(null);
                      setSyllableColoringData(null);
                      setRhythmVariationColoringData(null);
                      setLineLengthColoringData(null);
                      setPunctuationColoringData(null);
                      setPassiveVoiceColoringData(null);
                      setTenseColoringData(null);
                      setScansionColoringData(null);
                    }}
                    onHighlightLines={setHighlightedLines}
                    onHighlightWords={setHighlightedWords}
                  />
                </div>
              )}
            </div>

            <RelatedTools
              abstractWords={poem.abstractWords}
              rhymingPairs={poem.rhymingPairs}
            />
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        poemTitle={poem.title}
        poemText={poem.text}
      />
    </Layout>
  );
}
