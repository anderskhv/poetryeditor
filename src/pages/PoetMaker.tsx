import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { loadCMUDictionary, isDictionaryLoaded, getStressPattern, getSyllables } from '../utils/cmuDict';
import { DefinitionTooltip } from '../components/DefinitionTooltip';
import './PoetMaker.css';

interface SearchResult {
  word: string;
  score: number;
  numSyllables?: number;
}

export function PoetMaker() {
  const [rhymeWord, setRhymeWord] = useState('');
  const [meaningWord, setMeaningWord] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [dictionaryLoaded, setDictionaryLoaded] = useState(isDictionaryLoaded());

  useEffect(() => {
    async function loadDict() {
      if (!isDictionaryLoaded()) {
        await loadCMUDictionary();
        setDictionaryLoaded(true);
      }
    }
    loadDict();
  }, []);

  const searchWords = useCallback(async () => {
    if (!rhymeWord.trim() || !meaningWord.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      // Datamuse API: words that rhyme with X and have meaning related to Y
      // rel_rhy=X&ml=Y finds perfect rhymes that are semantically similar to Y
      const response = await fetch(
        `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(rhymeWord.trim())}&ml=${encodeURIComponent(meaningWord.trim())}&md=s&max=50`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await response.json();

      // Parse results and add syllable info
      const resultsWithInfo: SearchResult[] = data.map((item: any) => ({
        word: item.word,
        score: item.score || 0,
        numSyllables: item.numSyllables,
      }));

      setResults(resultsWithInfo);
    } catch (error) {
      console.error('Error searching words:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [rhymeWord, meaningWord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchWords();
  };

  const clearAll = () => {
    setRhymeWord('');
    setMeaningWord('');
    setResults([]);
    setSearched(false);
  };

  // Group results by syllable count
  const groupBySyllables = (words: SearchResult[]) => {
    return words.reduce((acc, word) => {
      const sylCount = word.numSyllables || getSyllables(word.word).length || 0;
      if (!acc[sylCount]) acc[sylCount] = [];
      acc[sylCount].push(word);
      return acc;
    }, {} as Record<number, SearchResult[]>);
  };

  const groupedResults = groupBySyllables(results);

  // Example searches
  const exampleSearches = [
    { rhyme: 'love', meaning: 'affection', description: 'Words about affection that rhyme with "love"' },
    { rhyme: 'night', meaning: 'darkness', description: 'Words about darkness that rhyme with "night"' },
    { rhyme: 'heart', meaning: 'emotion', description: 'Words about emotion that rhyme with "heart"' },
    { rhyme: 'sky', meaning: 'freedom', description: 'Words about freedom that rhyme with "sky"' },
  ];

  const loadExample = (example: typeof exampleSearches[0]) => {
    setRhymeWord(example.rhyme);
    setMeaningWord(example.meaning);
  };

  return (
    <Layout>
      <SEOHead
        title="Poet Maker - Find Words That Rhyme AND Mean"
        description="Find the perfect word for your poem. Search for words that rhyme with one word AND have a similar meaning to another. A powerful tool for poets and songwriters."
        canonicalPath="/poet-maker"
        keywords="rhyme and meaning search, poetry word finder, rhyming thesaurus, poet tool, find rhyming synonyms, songwriting tool"
      />

      <div className="poet-maker">
        <h1>Poet Maker</h1>
        <p className="poet-subtitle">
          Find words that rhyme with one word AND mean something similar to another
        </p>

        <form onSubmit={handleSubmit} className="poet-form">
          <div className="search-inputs">
            <div className="input-group">
              <label className="input-label">Rhymes with</label>
              <input
                type="text"
                value={rhymeWord}
                onChange={(e) => setRhymeWord(e.target.value)}
                placeholder="e.g., love"
                className="word-input"
              />
            </div>
            <div className="input-connector">+</div>
            <div className="input-group">
              <label className="input-label">Means like</label>
              <input
                type="text"
                value={meaningWord}
                onChange={(e) => setMeaningWord(e.target.value)}
                placeholder="e.g., affection"
                className="word-input"
              />
            </div>
          </div>

          <div className="poet-actions">
            <button type="submit" className="search-button" disabled={loading || !rhymeWord.trim() || !meaningWord.trim()}>
              {loading ? 'Searching...' : 'Find Words'}
            </button>
            <button type="button" onClick={clearAll} className="clear-button">
              Clear
            </button>
          </div>
        </form>

        {searched && !loading && (
          <div className="results-section">
            {results.length === 0 ? (
              <div className="no-results">
                <p>No words found that rhyme with "{rhymeWord}" and mean "{meaningWord}".</p>
                <p className="no-results-hint">Try broader meaning terms or different rhyme words.</p>
              </div>
            ) : (
              <>
                <div className="results-header">
                  <h2>Found {results.length} words</h2>
                  <p className="results-description">
                    Words that rhyme with "<strong>{rhymeWord}</strong>" and relate to "<strong>{meaningWord}</strong>"
                  </p>
                </div>

                <div className="results-list">
                  {Object.keys(groupedResults)
                    .sort((a, b) => Number(a) - Number(b))
                    .map((sylCount) => (
                      <div key={sylCount} className="syllable-group">
                        <h3>
                          {sylCount} {Number(sylCount) === 1 ? 'syllable' : 'syllables'}
                        </h3>
                        <div className="word-list">
                          {groupedResults[Number(sylCount)]
                            .filter(r => !r.word.includes(' '))
                            .map((result, idx) => {
                              const stresses = getStressPattern(result.word);
                              const lastStress = stresses.length > 0 ? stresses[stresses.length - 1] : -1;
                              const meterClass = lastStress >= 1 ? 'iambic-friendly' : lastStress === 0 ? 'trochaic-friendly' : '';

                              return (
                                <DefinitionTooltip key={idx} word={result.word}>
                                  <Link
                                    to={`/rhymes/${encodeURIComponent(result.word)}`}
                                    className={`result-word ${meterClass}`}
                                    title={meterClass === 'iambic-friendly' ? 'Ends on stressed syllable (iambic-friendly)' : meterClass === 'trochaic-friendly' ? 'Ends on unstressed syllable (trochaic-friendly)' : ''}
                                  >
                                    {result.word}
                                  </Link>
                                </DefinitionTooltip>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="example-searches">
          <h2>Example Searches</h2>
          <p className="examples-intro">
            Click to try an example search:
          </p>
          <div className="examples-grid">
            {exampleSearches.map((example, idx) => (
              <button
                key={idx}
                onClick={() => loadExample(example)}
                className="example-card"
              >
                <div className="example-query">
                  Rhymes with "<strong>{example.rhyme}</strong>" + means "<strong>{example.meaning}</strong>"
                </div>
                <div className="example-description">{example.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="poet-info">
          <h2>How It Works</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>Dual Search</h3>
              <p>
                Poet Maker searches for words that satisfy two criteria at once:
                they must rhyme with your first word AND be semantically related
                to your second word.
              </p>
            </div>
            <div className="info-card">
              <h3>Perfect for Poetry</h3>
              <p>
                Struggling to find a rhyme that fits your meaning? Instead of
                compromising on either sound or sense, find words that deliver both.
              </p>
            </div>
            <div className="info-card">
              <h3>Meter Hints</h3>
              <p>
                Results show subtle meter indicators: words ending on a stressed
                syllable work well for iambic verse, while unstressed endings
                suit trochaic patterns.
              </p>
            </div>
          </div>
        </div>

        <div className="poet-cta">
          <p>Ready to write? Bring your words to life with full poetry analysis.</p>
          <Link to="/" className="cta-button">
            Open Poetry Editor
          </Link>
        </div>
      </div>
    </Layout>
  );
}
