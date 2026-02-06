import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { fetchSynonymSenses, fetchAntonyms, fetchHyponyms, SynonymWord, ImageryWord, SynonymSense } from '../utils/rhymeApi';
import { getSyllables } from '../utils/cmuDict';
import { DefinitionTooltip } from '../components/DefinitionTooltip';
import './Thesaurus.css';

const POPULAR_WORDS = [
  'happy', 'sad', 'beautiful', 'love', 'hate', 'big', 'small', 'good',
  'bad', 'fast', 'slow', 'strong', 'weak', 'bright', 'dark', 'cold',
  'hot', 'old', 'new', 'hard', 'soft', 'loud', 'quiet', 'rich'
];

// Page title for display
const PAGE_TITLE = 'Synonym Finder';

type TabType = 'synonyms' | 'hyponyms' | 'antonyms';

interface ThesaurusResult {
  synonymSenses: SynonymSense[];
  hyponyms: ImageryWord[];
  antonyms: SynonymWord[];
}

export function Thesaurus() {
  const { word: urlWord } = useParams<{ word?: string }>();
  const [searchWord, setSearchWord] = useState(urlWord || '');
  const [results, setResults] = useState<ThesaurusResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('synonyms');
  const [syllableFilter, setSyllableFilter] = useState<number | 'any'>('any');
  const navigate = useNavigate();

  const performSearch = useCallback(async (word: string) => {
    if (!word.trim()) return;

    setLoading(true);
    setSearched(true);
    setSyllableFilter('any');

    try {
      // Fetch synonyms, hyponyms, and antonyms in parallel
      const [synonymSenses, hyponyms, antonyms] = await Promise.all([
        fetchSynonymSenses(word),
        fetchHyponyms(word),
        fetchAntonyms(word),
      ]);

      setResults({ synonymSenses, hyponyms, antonyms });

      // Default to the first tab with results
      if (synonymSenses.length > 0) {
        setActiveTab('synonyms');
      } else if (hyponyms.length > 0) {
        setActiveTab('hyponyms');
      } else if (antonyms.length > 0) {
        setActiveTab('antonyms');
      } else {
        setActiveTab('synonyms');
      }
    } catch (error) {
      console.error('Error searching thesaurus:', error);
      setResults({ synonymSenses: [], hyponyms: [], antonyms: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  // Search when URL word changes
  useEffect(() => {
    if (urlWord) {
      setSearchWord(urlWord);
      performSearch(urlWord);
    }
  }, [urlWord, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const word = searchWord.trim().toLowerCase();
    if (!word) return;

    // Navigate to the word page for SEO
    navigate(`/synonyms/${encodeURIComponent(word)}`);
  };

  const handleQuickSearch = useCallback((word: string) => {
    navigate(`/synonyms/${encodeURIComponent(word)}`);
  }, [navigate]);

  const currentWords = useMemo(() => {
    if (!results) return [];
    switch (activeTab) {
      case 'hyponyms': return results.hyponyms;
      case 'antonyms': return results.antonyms;
      default: return [];
    }
  }, [results, activeTab]);

  const synonymCount = useMemo(() => {
    if (!results) return 0;
    return results.synonymSenses.reduce((total, sense) => total + sense.synonyms.length, 0);
  }, [results]);

  const displayWord = urlWord || searchWord;

  const filteredSynonymSenses = useMemo(() => {
    if (!results) return [];
    if (syllableFilter === 'any') return results.synonymSenses;

    return results.synonymSenses
      .map((sense) => ({
        ...sense,
        synonyms: sense.synonyms.filter((syn) => {
          const count = getSyllables(syn.word).length || 1;
          return count === syllableFilter;
        }),
      }))
      .filter((sense) => sense.synonyms.length > 0);
  }, [results, syllableFilter]);

  return (
    <Layout>
      <SEOHead
        title={urlWord && results
          ? `${urlWord.charAt(0).toUpperCase() + urlWord.slice(1)} Synonyms (${synonymCount}+) - Find Similar Words`
          : 'Synonym Finder - Word Alternatives for Poetry'}
        description={urlWord && results
          ? `Find ${synonymCount}+ synonyms, ${results.hyponyms.length}+ hyponyms, and ${results.antonyms.length}+ antonyms for "${urlWord}". Words organized by meaning and strength for poets and songwriters.`
          : 'Free synonym finder for poets. Find synonyms, specific examples (hyponyms), and antonyms organized by meaning and strength. Discover the perfect word for your poem or song.'
        }
        canonicalPath={urlWord ? `/synonyms/${urlWord}` : '/synonyms'}
        keywords="synonyms, hyponyms, antonyms, poetry words, word alternatives, similar words, specific words, opposite words, thesaurus for poets, concrete imagery"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is a thesaurus and how does it help poets?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A thesaurus is a reference tool that groups words by meaning, showing synonyms (similar words) and antonyms (opposite words). For poets, it helps find alternative words that fit a specific meter, rhyme scheme, or emotional tone. Our thesaurus organizes results by syllable count, making it easy to find words that match your verse structure."
              }
            },
            {
              "@type": "Question",
              "name": "What is the difference between synonyms and antonyms?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Synonyms are words with similar meanings (like 'happy' and 'joyful'), while antonyms are words with opposite meanings (like 'happy' and 'sad'). Both are useful in poetry for creating contrast, emphasis, or finding the exact word that fits your verse."
              }
            },
            {
              "@type": "Question",
              "name": "Why are synonyms organized by syllable count?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Organizing synonyms by syllable count helps poets maintain consistent meter in their verses. If you need a two-syllable word to replace 'happy' in your iambic pentameter, you can quickly find options like 'joyful' or 'cheerful' without disrupting your rhythm."
              }
            }
          ]
        }}
      />

      <div className="thesaurus-page">
        <h1>{PAGE_TITLE}</h1>
        <p className="thesaurus-subtitle">
          Find synonyms, specific examples, and opposites for any word
        </p>

        <form onSubmit={handleSearch} className="thesaurus-search-form">
          <input
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            placeholder="Enter a word to find alternatives..."
            className="thesaurus-search-input"
            autoFocus
          />
          <button type="submit" className="thesaurus-search-button">
            Search
          </button>
        </form>

        {!searched && !urlWord && (
          <div className="popular-searches">
            <h2>Popular Searches</h2>
            <div className="popular-words">
              {POPULAR_WORDS.map((word) => (
                <button
                  key={word}
                  onClick={() => handleQuickSearch(word)}
                  className="popular-word-link"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="thesaurus-loading">Searching thesaurus...</div>
        )}

        {searched && !loading && results && (
          <div className="thesaurus-results">
            <h2>Results for "{displayWord}"</h2>

            <div className="thesaurus-tabs">
              <button
                className={`thesaurus-tab ${activeTab === 'synonyms' ? 'active' : ''}`}
                onClick={() => setActiveTab('synonyms')}
              >
                Synonyms ({synonymCount})
              </button>
              <button
                className={`thesaurus-tab ${activeTab === 'hyponyms' ? 'active' : ''}`}
                onClick={() => setActiveTab('hyponyms')}
                title="More specific examples of this word"
              >
                Hyponyms ({results.hyponyms.length})
              </button>
              <button
                className={`thesaurus-tab ${activeTab === 'antonyms' ? 'active' : ''}`}
                onClick={() => setActiveTab('antonyms')}
              >
                Antonyms ({results.antonyms.length})
              </button>
            </div>

            {activeTab === 'hyponyms' && (
              <p className="thesaurus-tab-description">
                Hyponyms are more specific examples. For "tree" → oak, willow, birch. For "bird" → sparrow, hawk, parrot.
              </p>
            )}

            {(activeTab === 'synonyms' ? filteredSynonymSenses.length === 0 : currentWords.length === 0) ? (
              <div className="thesaurus-no-results">
                No {activeTab} found for "{displayWord}".
                {activeTab === 'synonyms' && (results.hyponyms.length > 0 || results.antonyms.length > 0) && (
                  <> Try checking the other tabs.</>
                )}
                {activeTab === 'hyponyms' && (synonymCount > 0 || results.antonyms.length > 0) && (
                  <> Try checking the synonyms or antonyms tabs.</>
                )}
                {activeTab === 'antonyms' && (synonymCount > 0 || results.hyponyms.length > 0) && (
                  <> Try checking the other tabs.</>
                )}
              </div>
            ) : (
              <>
                <div className="thesaurus-results-meta">
                  <p className="thesaurus-results-count">
                    Found {activeTab === 'synonyms' ? synonymCount : currentWords.length} {activeTab}
                  </p>
                  {activeTab === 'synonyms' && (
                    <div className="thesaurus-filter">
                      <label htmlFor="syn-syllable-filter">Syllables</label>
                      <select
                        id="syn-syllable-filter"
                        value={syllableFilter}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSyllableFilter(value === 'any' ? 'any' : Number(value));
                        }}
                      >
                        <option value="any">Any</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                      </select>
                    </div>
                  )}
                </div>

                {activeTab === 'synonyms' ? (
                  <div className="thesaurus-sense-list">
                    {filteredSynonymSenses.map((sense, senseIdx) => (
                      <div key={`${senseIdx}-${sense.gloss}`} className="thesaurus-sense-group">
                        <div className="thesaurus-sense-heading">
                          <span className="thesaurus-sense-title">Meaning {senseIdx + 1}</span>
                          {sense.pos && <span className="thesaurus-sense-pos">{sense.pos}</span>}
                        </div>
                        <div className="thesaurus-sense-gloss">{sense.gloss}</div>
                        <div className="thesaurus-word-list">
                          {sense.synonyms
                            .filter((syn) => !syn.word.includes(' '))
                            .sort((a, b) => b.score - a.score)
                            .map((syn, idx) => (
                              <DefinitionTooltip key={`${syn.word}-${idx}`} word={syn.word}>
                                <button
                                  onClick={() => handleQuickSearch(syn.word)}
                                  className="thesaurus-word-item"
                                >
                                  {syn.word}
                                </button>
                              </DefinitionTooltip>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="thesaurus-sense-list">
                    <div className="thesaurus-word-list">
                      {currentWords
                        .filter(w => !w.word.includes(' '))
                        .map((word, idx) => (
                          <DefinitionTooltip key={idx} word={word.word}>
                            <button
                              onClick={() => handleQuickSearch(word.word)}
                              className="thesaurus-word-item"
                            >
                              {word.word}
                            </button>
                          </DefinitionTooltip>
                        ))}
                    </div>
                  </div>
                )}

                <div className="thesaurus-cta">
                  <p>Found the word you need?</p>
                  <div className="cta-buttons">
                    <Link to={`/rhymes/${encodeURIComponent(displayWord)}`} className="thesaurus-cta-secondary">
                      Find Rhymes
                    </Link>
                    <Link to="/" className="thesaurus-cta-button">
                      Use in Poetry Editor
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div className="thesaurus-info">
          <h2>About Word Alternatives</h2>
          <div className="thesaurus-info-grid">
            <div className="thesaurus-info-card">
              <h3>Synonyms</h3>
              <p>
                Words with similar meanings. Use synonyms to add variety to your writing
                or find words that better fit your meter and rhythm.
              </p>
            </div>
            <div className="thesaurus-info-card">
              <h3>Hyponyms</h3>
              <p>
                More specific examples of a word. "Tree" → oak, willow, birch.
                Use hyponyms to replace abstract words with vivid, concrete imagery.
              </p>
            </div>
            <div className="thesaurus-info-card">
              <h3>Antonyms</h3>
              <p>
                Words with opposite meanings. Antonyms are powerful tools for creating
                contrast, tension, or emphasizing differences in poetry.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Separate component for word-specific pages
export function ThesaurusWord() {
  return <Thesaurus />;
}
