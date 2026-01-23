import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { fetchSynonyms, fetchAntonyms, SynonymWord } from '../utils/rhymeApi';
import { getSyllables } from '../utils/cmuDict';
import { DefinitionTooltip } from '../components/DefinitionTooltip';
import './Thesaurus.css';

const POPULAR_WORDS = [
  'happy', 'sad', 'beautiful', 'love', 'hate', 'big', 'small', 'good',
  'bad', 'fast', 'slow', 'strong', 'weak', 'bright', 'dark', 'cold',
  'hot', 'old', 'new', 'hard', 'soft', 'loud', 'quiet', 'rich'
];

interface ThesaurusResult {
  synonyms: SynonymWord[];
  antonyms: SynonymWord[];
}

export function Thesaurus() {
  const { word: urlWord } = useParams<{ word?: string }>();
  const [searchWord, setSearchWord] = useState(urlWord || '');
  const [results, setResults] = useState<ThesaurusResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<'synonyms' | 'antonyms'>('synonyms');
  const navigate = useNavigate();

  const performSearch = useCallback(async (word: string) => {
    if (!word.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      // Fetch both synonyms and antonyms in parallel
      const [synonyms, antonyms] = await Promise.all([
        fetchSynonyms(word),
        fetchAntonyms(word),
      ]);

      setResults({ synonyms, antonyms });

      // Default to antonyms tab if no synonyms but has antonyms
      if (synonyms.length === 0 && antonyms.length > 0) {
        setActiveTab('antonyms');
      } else {
        setActiveTab('synonyms');
      }
    } catch (error) {
      console.error('Error searching thesaurus:', error);
      setResults({ synonyms: [], antonyms: [] });
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
    navigate(`/thesaurus/${encodeURIComponent(word)}`);
  };

  const handleQuickSearch = (word: string) => {
    navigate(`/thesaurus/${encodeURIComponent(word)}`);
  };

  // Group words by syllable count
  const groupBySyllables = (words: SynonymWord[]) => {
    return words.reduce((acc, word) => {
      const sylCount = getSyllables(word.word).length || 1;
      if (!acc[sylCount]) acc[sylCount] = [];
      acc[sylCount].push(word);
      return acc;
    }, {} as Record<number, SynonymWord[]>);
  };

  const currentWords = results ? (activeTab === 'synonyms' ? results.synonyms : results.antonyms) : [];
  const groupedWords = groupBySyllables(currentWords);
  const displayWord = urlWord || searchWord;

  return (
    <Layout>
      <SEOHead
        title={urlWord ? `${urlWord} - Synonyms & Antonyms | Thesaurus for Poets` : 'Thesaurus - Find Synonyms & Antonyms for Poetry'}
        description={urlWord
          ? `Find synonyms and antonyms for "${urlWord}". Discover alternative words organized by syllable count, perfect for poets and songwriters.`
          : 'Free online thesaurus for poets. Find synonyms and antonyms organized by syllable count. Discover the perfect word for your poem or song.'
        }
        canonicalPath={urlWord ? `/thesaurus/${urlWord}` : '/thesaurus'}
        keywords="thesaurus, synonyms, antonyms, poetry words, word alternatives, similar words, opposite words, poet thesaurus"
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
        <h1>Thesaurus</h1>
        <p className="thesaurus-subtitle">
          Find synonyms and antonyms for any word, organized by syllable count
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
                Synonyms ({results.synonyms.length})
              </button>
              <button
                className={`thesaurus-tab ${activeTab === 'antonyms' ? 'active' : ''}`}
                onClick={() => setActiveTab('antonyms')}
              >
                Antonyms ({results.antonyms.length})
              </button>
            </div>

            {currentWords.length === 0 ? (
              <div className="thesaurus-no-results">
                No {activeTab} found for "{displayWord}".
                {activeTab === 'synonyms' && results.antonyms.length > 0 && (
                  <> Try checking the antonyms tab.</>
                )}
                {activeTab === 'antonyms' && results.synonyms.length > 0 && (
                  <> Try checking the synonyms tab.</>
                )}
              </div>
            ) : (
              <>
                <p className="thesaurus-results-count">
                  Found {currentWords.length} {activeTab}
                </p>

                {Object.keys(groupedWords)
                  .sort((a, b) => Number(a) - Number(b))
                  .map((sylCount) => (
                    <div key={sylCount} className="thesaurus-syllable-group">
                      <h3>
                        {sylCount} {Number(sylCount) === 1 ? 'syllable' : 'syllables'}
                      </h3>
                      <div className="thesaurus-word-list">
                        {groupedWords[Number(sylCount)]
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
                  ))}

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
          <h2>About Thesaurus</h2>
          <div className="thesaurus-info-grid">
            <div className="thesaurus-info-card">
              <h3>Synonyms</h3>
              <p>
                Words with similar meanings. Use synonyms to add variety to your writing
                or find words that better fit your meter and rhythm.
              </p>
            </div>
            <div className="thesaurus-info-card">
              <h3>Antonyms</h3>
              <p>
                Words with opposite meanings. Antonyms are powerful tools for creating
                contrast, tension, or emphasizing differences in poetry.
              </p>
            </div>
            <div className="thesaurus-info-card">
              <h3>Syllable Grouping</h3>
              <p>
                Words are organized by syllable count to help you maintain consistent
                meter when substituting words in your verses.
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
