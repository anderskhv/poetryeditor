import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchRhymes, fetchNearAndSlantRhymes, fetchSynonyms, type RhymeWord, type SynonymWord } from '../utils/rhymeApi';
import { countSyllables } from '../utils/syllableCounter';
import { getSyllables, getStressPattern, isDictionaryLoaded, loadCMUDictionary } from '../utils/cmuDict';
import './WordToolsPanel.css';

interface WordToolsResults {
  perfectRhymes: RhymeWord[];
  nearRhymes: RhymeWord[];
  synonyms: SynonymWord[];
  syllableCount: number;
  syllableBreakdown: string[];
  stressPattern: number[];
}

const MAX_RESULTS = 10;

export function WordToolsPanel() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<WordToolsResults | null>(null);
  const [lastQuery, setLastQuery] = useState('');

  const normalizeWord = (word: string) => word.trim().toLowerCase().replace(/[^a-z'-]/g, '');

  const handleSearch = async () => {
    const normalized = normalizeWord(query);
    if (!normalized) {
      setError('Enter a word to explore rhymes, synonyms, and syllables.');
      return;
    }
    if (normalized === lastQuery && results) return;

    setLoading(true);
    setError(null);

    try {
      if (!isDictionaryLoaded()) {
        await loadCMUDictionary();
      }

      const [perfectRhymes, nearRhymes, synonyms] = await Promise.all([
        fetchRhymes(normalized),
        fetchNearAndSlantRhymes(normalized),
        fetchSynonyms(normalized),
      ]);

      const syllableBreakdown = getSyllables(normalized);
      const stressPattern = getStressPattern(normalized);
      const syllableCount = syllableBreakdown.length || stressPattern.length || countSyllables(normalized);

      setResults({
        perfectRhymes: perfectRhymes.slice(0, MAX_RESULTS),
        nearRhymes: nearRhymes.slice(0, MAX_RESULTS),
        synonyms: synonyms.slice(0, MAX_RESULTS),
        syllableCount,
        syllableBreakdown,
        stressPattern,
      });
      setLastQuery(normalized);
    } catch (err) {
      console.error('Word tools search failed:', err);
      setError('Could not load word data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSearch();
  };

  const activeWord = lastQuery || normalizeWord(query);
  const displayWord = activeWord ? activeWord.charAt(0).toUpperCase() + activeWord.slice(1) : '';

  return (
    <section className="word-tools-panel">
      <div className="word-tools-header">
        <div>
          <h3>Word Tools</h3>
          <p>Quick rhymes, synonyms, and syllables without leaving the editor.</p>
        </div>
        <div className="word-tools-links">
          <Link to="/rhyme-finder">Rhyme Finder</Link>
          <Link to="/synonym-finder">Synonym Finder</Link>
          <Link to="/syllable-counter">Syllable Counter</Link>
        </div>
      </div>

      <form className="word-tools-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a word (e.g., night, quiet, river)"
          className="word-tools-input"
        />
        <button type="submit" className="word-tools-button" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="word-tools-error">{error}</div>}

      {!error && results && (
        <div className="word-tools-results">
          <div className="word-tools-summary">
            <div>
              <span className="summary-label">Syllables</span>
              <span className="summary-value">{results.syllableCount}</span>
            </div>
            <div>
              <span className="summary-label">Breakdown</span>
              <span className="summary-value">
                {results.syllableBreakdown.length > 0
                  ? results.syllableBreakdown.join('-')
                  : displayWord || '—'}
              </span>
            </div>
            <div>
              <span className="summary-label">Stress</span>
              <span className="summary-value">
                {results.stressPattern.length > 0
                  ? results.stressPattern.map((stress) => (stress === 1 ? '/' : stress === 2 ? '\\' : 'u')).join(' ')
                  : '—'}
              </span>
            </div>
            <div className="summary-cta">
              <Link to={`/syllables/${encodeURIComponent(activeWord)}`}>Full syllable details</Link>
            </div>
          </div>

          <div className="word-tools-columns">
            <div className="word-tools-column">
              <div className="column-header">
                <h4>Perfect Rhymes</h4>
                <Link to={`/rhymes/${encodeURIComponent(activeWord)}`}>See all</Link>
              </div>
              {results.perfectRhymes.length === 0 ? (
                <div className="column-empty">No perfect rhymes found yet.</div>
              ) : (
                <div className="word-chip-grid">
                  {results.perfectRhymes.map((rhyme) => (
                    <Link
                      key={rhyme.word}
                      to={`/rhymes/${encodeURIComponent(rhyme.word)}`}
                      className="word-chip"
                    >
                      {rhyme.word}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="word-tools-column">
              <div className="column-header">
                <h4>Near Rhymes</h4>
                <Link to={`/rhymes/${encodeURIComponent(activeWord)}`}>See all</Link>
              </div>
              {results.nearRhymes.length === 0 ? (
                <div className="column-empty">No near rhymes found yet.</div>
              ) : (
                <div className="word-chip-grid">
                  {results.nearRhymes.map((rhyme) => (
                    <Link
                      key={rhyme.word}
                      to={`/rhymes/${encodeURIComponent(rhyme.word)}`}
                      className="word-chip muted"
                    >
                      {rhyme.word}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="word-tools-column">
              <div className="column-header">
                <h4>Synonyms</h4>
                <Link to={`/synonyms/${encodeURIComponent(activeWord)}`}>See all</Link>
              </div>
              {results.synonyms.length === 0 ? (
                <div className="column-empty">No synonyms found yet.</div>
              ) : (
                <div className="word-chip-grid">
                  {results.synonyms.map((synonym) => (
                    <Link
                      key={synonym.word}
                      to={`/synonyms/${encodeURIComponent(synonym.word)}`}
                      className="word-chip"
                    >
                      {synonym.word}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
