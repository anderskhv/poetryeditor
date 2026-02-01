import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { AutocompleteInput } from '../components/AutocompleteInput';
import { fetchRhymes, RhymeWord } from '../utils/rhymeApi';
import { loadCMUDictionary, isDictionaryLoaded, getStressPattern, getSyllables } from '../utils/cmuDict';
import { getRhymeOriginalityScore } from '../utils/rhymeCliches';
import { DefinitionTooltip } from '../components/DefinitionTooltip';
import './RhymeDictionary.css';

const POPULAR_WORDS = [
  'love', 'heart', 'time', 'day', 'night', 'life', 'way', 'world',
  'light', 'dream', 'eyes', 'soul', 'mind', 'rain', 'sun', 'moon',
  'star', 'sky', 'sea', 'fire', 'wind', 'home', 'hand', 'face'
];

interface EnhancedRhymeWord extends RhymeWord {
  originalityScore?: number;
  isCliche?: boolean;
}

type WordTypeFilter = 'all' | 'noun' | 'verb' | 'adjective' | 'adverb';

export function RhymeDictionary() {
  const [searchWord, setSearchWord] = useState('');
  const [topicWord, setTopicWord] = useState('');
  const [syllableFilter, setSyllableFilter] = useState<string>('all');
  const [clicheFilter, setClicheFilter] = useState<string>('all');
  const [wordTypeFilter, setWordTypeFilter] = useState<WordTypeFilter>('all');
  const [results, setResults] = useState<EnhancedRhymeWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [dictionaryLoaded, setDictionaryLoaded] = useState(isDictionaryLoaded());
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDict() {
      if (!isDictionaryLoaded()) {
        await loadCMUDictionary();
        setDictionaryLoaded(true);
      }
    }
    loadDict();
  }, []);

  const performSearch = useCallback(async () => {
    const word = searchWord.trim().toLowerCase();
    if (!word) return;

    setLoading(true);
    setSearched(true);

    try {
      let rhymes: RhymeWord[];

      // If topic is provided, use combined rhyme+meaning search
      if (topicWord.trim()) {
        const response = await fetch(
          `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&ml=${encodeURIComponent(topicWord.trim())}&md=sp&max=100`
        );
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        rhymes = data.map((item: any) => ({
          word: item.word,
          score: item.score || 0,
          numSyllables: item.numSyllables,
          partsOfSpeech: item.tags?.filter((tag: string) =>
            ['n', 'v', 'adj', 'adv', 'u', 'prop'].includes(tag)
          ) || [],
        }));
      } else {
        // Standard rhyme search
        rhymes = await fetchRhymes(word);
      }

      // Enhance with originality scores
      const enhancedRhymes: EnhancedRhymeWord[] = rhymes.map(rhyme => {
        const originalityScore = getRhymeOriginalityScore(word, rhyme.word);
        return {
          ...rhyme,
          originalityScore,
          isCliche: originalityScore < 35,
        };
      });

      setResults(enhancedRhymes);
    } catch (error) {
      console.error('Error searching rhymes:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchWord, topicWord]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const word = searchWord.trim().toLowerCase();
    if (!word) return;

    // If no filters are applied, navigate to the word page for SEO
    if (!topicWord.trim() && syllableFilter === 'all' && clicheFilter === 'all' && wordTypeFilter === 'all') {
      navigate(`/rhymes/${encodeURIComponent(word)}`);
    } else {
      // Perform search with filters
      performSearch();
    }
  };

  const handleQuickSearch = (word: string) => {
    navigate(`/rhymes/${encodeURIComponent(word)}`);
  };

  const clearFilters = () => {
    setTopicWord('');
    setSyllableFilter('all');
    setClicheFilter('all');
    setWordTypeFilter('all');
  };

  // Apply filters to results
  const filteredResults = results.filter(rhyme => {
    // Syllable filter
    if (syllableFilter !== 'all') {
      const sylCount = rhyme.numSyllables || getSyllables(rhyme.word).length || 0;
      if (sylCount !== Number(syllableFilter)) return false;
    }

    // Cliché filter
    if (clicheFilter === 'yes' && rhyme.isCliche) {
      return false;
    }
    if (clicheFilter === 'no' && !rhyme.isCliche) {
      return false;
    }

    // Word type filter
    if (wordTypeFilter !== 'all') {
      const posMap: Record<string, string[]> = {
        'noun': ['n', 'prop'],
        'verb': ['v'],
        'adjective': ['adj'],
        'adverb': ['adv'],
      };
      const allowedTags = posMap[wordTypeFilter] || [];
      const hasPOS = rhyme.partsOfSpeech?.some(pos => allowedTags.includes(pos));
      if (!hasPOS) return false;
    }

    return true;
  });

  // Group results by syllable count
  const groupedResults = filteredResults.reduce((acc, rhyme) => {
    const sylCount = rhyme.numSyllables || getSyllables(rhyme.word).length || 0;
    if (!acc[sylCount]) acc[sylCount] = [];
    acc[sylCount].push(rhyme);
    return acc;
  }, {} as Record<number, EnhancedRhymeWord[]>);

  // Get available syllable counts from results
  const availableSyllableCounts = [...new Set(results.map(r =>
    r.numSyllables || getSyllables(r.word).length || 0
  ))].sort((a, b) => a - b);

  const hasActiveFilters = topicWord.trim() || syllableFilter !== 'all' || clicheFilter !== 'all' || wordTypeFilter !== 'all';

  return (
    <Layout>
      <SEOHead
        title="Rhyme Dictionary - Find Words That Rhyme"
        description="Free online rhyming dictionary. Find perfect rhymes, near rhymes, and slant rhymes for any word. Filter by syllables, topic, and originality. Organized by syllable count for poets and songwriters."
        canonicalPath="/rhymes"
        keywords="rhyming dictionary, words that rhyme, rhyme finder, poetry rhymes, slant rhymes, near rhymes, rhyme with meaning"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is the difference between perfect rhymes and near rhymes?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Perfect rhymes share the same ending sound from the stressed vowel onward (like 'love' and 'dove'). Near rhymes (also called slant rhymes or half rhymes) have similar but not identical sounds (like 'love' and 'move'). Both are useful in poetry and songwriting."
              }
            },
            {
              "@type": "Question",
              "name": "How can I find rhymes that also relate to a specific topic?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Use the 'About (topic)' filter in our Rhyme Dictionary. Enter a word in the search field, then add a topic word. For example, search for rhymes with 'love' that relate to 'ocean' to find words like 'dove' and 'above' that have oceanic associations."
              }
            },
            {
              "@type": "Question",
              "name": "What are cliché rhymes and how can I avoid them?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Cliché rhymes are overused word pairs like 'love/above', 'heart/apart', or 'fire/desire'. While they're not wrong, they can make poetry feel predictable. Enable 'Avoid Clichés' in our filters to hide commonly overused rhyme pairs and discover more original options."
              }
            }
          ]
        }}
      />

      <div className="rhyme-dictionary">
        <h1>Rhyme Dictionary</h1>
        <p className="rhyme-dictionary-subtitle">
          Find perfect rhymes for any word, with optional filters for topic and originality
        </p>

        <form onSubmit={handleSearch} className="rhyme-search-form">
          <div className="search-row">
            <AutocompleteInput
              value={searchWord}
              onChange={setSearchWord}
              onSubmit={(word) => {
                const trimmed = word.trim().toLowerCase();
                if (!trimmed) return;
                if (!topicWord.trim() && syllableFilter === 'all' && clicheFilter === 'all' && wordTypeFilter === 'all') {
                  navigate(`/rhymes/${encodeURIComponent(trimmed)}`);
                } else {
                  performSearch();
                }
              }}
              placeholder="Enter a word to find rhymes..."
              className="rhyme-search-input"
              autoFocus
            />
            <button type="submit" className="rhyme-search-button">
              Find Rhymes
            </button>
          </div>

          <div className="filter-bar">
            <div className="filter-item">
              <label className="filter-label">Syllables</label>
              <select
                value={syllableFilter}
                onChange={(e) => setSyllableFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Any</option>
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label className="filter-label">Clichés</label>
              <select
                value={clicheFilter}
                onChange={(e) => setClicheFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Show all</option>
                <option value="yes">Hide clichés</option>
                <option value="no">Only clichés</option>
              </select>
            </div>

            <div className="filter-item">
              <label className="filter-label">Word Type</label>
              <select
                value={wordTypeFilter}
                onChange={(e) => setWordTypeFilter(e.target.value as WordTypeFilter)}
                className="filter-select"
              >
                <option value="all">Any</option>
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
                <option value="adverb">Adverb</option>
              </select>
            </div>

            <div className="filter-item filter-item-topic">
              <label className="filter-label">Topic</label>
              <input
                type="text"
                value={topicWord}
                onChange={(e) => setTopicWord(e.target.value)}
                placeholder="e.g., ocean, love..."
                className="filter-input"
              />
            </div>

            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="clear-filters-btn">
                Clear
              </button>
            )}
          </div>
        </form>

        {!searched && (
          <div className="popular-searches">
            <h2>Popular Searches</h2>
            <div className="popular-words">
              {POPULAR_WORDS.map((word) => (
                <Link
                  key={word}
                  to={`/rhymes/${word}`}
                  className="popular-word-link"
                >
                  {word}
                </Link>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="rhyme-loading">Finding rhymes...</div>
        )}

        {searched && !loading && filteredResults.length === 0 && (
          <div className="rhyme-no-results">
            {results.length === 0 ? (
              <>No rhymes found for "{searchWord}". Try a different word.</>
            ) : (
              <>No rhymes match your filters. Try adjusting the syllable count or disabling "Avoid clichés".</>
            )}
          </div>
        )}

        {!loading && filteredResults.length > 0 && (
          <div className="rhyme-results">
            <div className="results-header">
              <h2>
                Rhymes for "{searchWord}"
                {topicWord.trim() && <span className="topic-tag">about "{topicWord}"</span>}
              </h2>
              <p className="rhyme-results-count">
                Found {filteredResults.length} rhymes
                {results.length !== filteredResults.length && (
                  <span className="filtered-count"> (filtered from {results.length})</span>
                )}
              </p>
            </div>

            {Object.keys(groupedResults)
              .sort((a, b) => Number(a) - Number(b))
              .map((sylCount) => (
                <div key={sylCount} className="rhyme-syllable-group">
                  <h3>
                    {sylCount} {Number(sylCount) === 1 ? 'syllable' : 'syllables'}
                  </h3>
                  <div className="rhyme-word-list">
                    {groupedResults[Number(sylCount)]
                      .filter(r => !r.word.includes(' '))
                      .map((rhyme, idx) => {
                        const stresses = getStressPattern(rhyme.word);
                        const lastStress = stresses.length > 0 ? stresses[stresses.length - 1] : -1;
                        const meterClass = lastStress >= 1 ? 'iambic-friendly' : lastStress === 0 ? 'trochaic-friendly' : '';
                        const originalityClass = rhyme.isCliche ? 'cliche' : rhyme.originalityScore && rhyme.originalityScore >= 70 ? 'original' : '';

                        return (
                          <DefinitionTooltip key={idx} word={rhyme.word}>
                            <Link
                              to={`/rhymes/${encodeURIComponent(rhyme.word)}`}
                              className={`rhyme-word-item ${meterClass} ${originalityClass}`}
                              title={`${meterClass === 'iambic-friendly' ? 'Ends on stressed syllable (iambic-friendly)' : meterClass === 'trochaic-friendly' ? 'Ends on unstressed syllable (trochaic-friendly)' : ''}${rhyme.isCliche ? ' • Commonly used rhyme' : ''}`}
                            >
                              {rhyme.word}
                              {rhyme.isCliche && <span className="cliche-indicator" title="Commonly used rhyme">•</span>}
                            </Link>
                          </DefinitionTooltip>
                        );
                      })}
                  </div>
                </div>
              ))}

            <div className="rhyme-cta">
              <Link to="/" className="rhyme-cta-button">
                Use in Poetry Editor
              </Link>
            </div>
          </div>
        )}

        <div className="browse-by-category">
          <h2>Browse by Category</h2>
          <p className="category-description">Find rhyming words organized by topic</p>
          <div className="category-links">
            <Link to="/rhymes/category/colors" className="category-link">Colors</Link>
            <Link to="/rhymes/category/emotions" className="category-link">Emotions</Link>
            <Link to="/rhymes/category/nature" className="category-link">Nature</Link>
            <Link to="/rhymes/category/time" className="category-link">Time</Link>
            <Link to="/rhymes/category/body" className="category-link">Body</Link>
            <Link to="/rhymes/category/actions" className="category-link">Actions</Link>
          </div>
          <Link to="/rhymes/category" className="view-all-categories">View all categories</Link>
        </div>

        <div className="rhyme-info">
          <h2>About Rhyming</h2>
          <div className="rhyme-info-grid">
            <div className="rhyme-info-card">
              <h3>Perfect Rhymes</h3>
              <p>
                Words that share the same ending sound from the stressed vowel onward.
                Example: "love" and "dove" are perfect rhymes.
              </p>
            </div>
            <div className="rhyme-info-card">
              <h3>Topic Filtering</h3>
              <p>
                Use the "About" filter to find rhymes that also relate to a specific meaning.
                Great for finding contextually appropriate words.
              </p>
            </div>
            <div className="rhyme-info-card">
              <h3>Avoid Clichés</h3>
              <p>
                Enable the cliché filter to hide overused rhyme pairs like love/above
                or heart/apart and discover more original word choices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
