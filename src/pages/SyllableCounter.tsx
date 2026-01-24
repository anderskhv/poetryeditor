import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { loadCMUDictionary, isDictionaryLoaded, getStressPattern, getSyllables } from '../utils/cmuDict';
import './SyllableCounter.css';

const POPULAR_WORDS = [
  'beautiful', 'interesting', 'chocolate', 'comfortable',
  'different', 'every', 'favorite', 'business',
  'poem', 'fire', 'hour', 'flower',
  'caramel', 'orange', 'separate', 'naturally',
];

interface WordResult {
  word: string;
  syllables: string[];
  stresses: number[];
  count: number;
}

export function SyllableCounter() {
  const [input, setInput] = useState('');
  const [dictionaryLoaded, setDictionaryLoaded] = useState(isDictionaryLoaded());
  const [mode, setMode] = useState<'word' | 'line'>('word');
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

  // Parse input for line mode
  const lineResults = useMemo<WordResult[]>(() => {
    if (!dictionaryLoaded || mode !== 'line' || !input.trim()) return [];

    const words = input.trim().split(/\s+/).filter(w => /[a-zA-Z]/.test(w));
    const results: WordResult[] = [];

    for (const rawWord of words) {
      const word = rawWord.toLowerCase().replace(/[^a-z'-]/g, '');
      if (!word) continue;

      const stresses = getStressPattern(word);
      const syllables = getSyllables(word);
      const count = stresses.length || syllables.length || 1;

      results.push({
        word: rawWord,
        syllables: syllables.length > 0 ? syllables : [word],
        stresses,
        count,
      });
    }

    return results;
  }, [input, dictionaryLoaded, mode]);

  // Single word result
  const singleWordResult = useMemo<WordResult | null>(() => {
    if (!dictionaryLoaded || mode !== 'word' || !input.trim()) return null;

    const word = input.trim().toLowerCase().replace(/[^a-z'-]/g, '');
    if (!word || word.includes(' ')) return null;

    const stresses = getStressPattern(word);
    const syllables = getSyllables(word);
    const count = stresses.length || syllables.length || 1;

    return {
      word: input.trim(),
      syllables: syllables.length > 0 ? syllables : [word],
      stresses,
      count,
    };
  }, [input, dictionaryLoaded, mode]);

  const totalSyllables = useMemo(() => {
    if (mode === 'line') {
      return lineResults.reduce((sum, r) => sum + r.count, 0);
    }
    return singleWordResult?.count || 0;
  }, [mode, lineResults, singleWordResult]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    if (mode === 'word' && !trimmed.includes(' ')) {
      // Navigate to word detail page
      navigate(`/syllables/${encodeURIComponent(trimmed.toLowerCase())}`);
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    // Auto-switch to line mode if spaces detected
    if (value.includes(' ') && mode === 'word') {
      setMode('line');
    }
  };

  return (
    <Layout>
      <SEOHead
        title="Syllable Counter - Count Syllables in Any Word"
        description="Free online syllable counter. Count syllables in words, sentences, or poems. See syllable breakdown and stress patterns for poetry and songwriting."
        canonicalPath="/syllables"
        keywords="syllable counter, count syllables, how many syllables, syllable breakdown, stress pattern, poetry syllables"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How do you count syllables in a word?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Count the vowel sounds (not letters) in the word. Subtract silent vowels (like the 'e' at the end of 'cake') and vowel pairs that make one sound (like 'ou' in 'soup'). Our syllable counter uses the CMU Pronouncing Dictionary for accurate counts based on actual pronunciation."
              }
            },
            {
              "@type": "Question",
              "name": "What is a stress pattern in poetry?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A stress pattern shows which syllables are emphasized (stressed) when pronouncing a word. Primary stress is the main emphasis, secondary stress is a lighter emphasis, and unstressed syllables are spoken more softly. Understanding stress patterns helps with writing metered poetry."
              }
            }
          ]
        }}
      />

      <div className="syllable-counter">
        {/* Hero Search Section */}
        <div className="syllable-hero">
          <h1>How Many Syllables?</h1>
          <p className="syllable-hero-subtitle">
            Count syllables instantly. See stress patterns for poetry.
          </p>

          {/* Mode Toggle */}
          <div className="syllable-mode-toggle">
            <button
              className={`mode-btn ${mode === 'word' ? 'active' : ''}`}
              onClick={() => setMode('word')}
            >
              Single Word
            </button>
            <button
              className={`mode-btn ${mode === 'line' ? 'active' : ''}`}
              onClick={() => setMode('line')}
            >
              Line / Sentence
            </button>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSubmit} className="syllable-search-form">
            {mode === 'word' ? (
              <input
                type="text"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter a word..."
                className="syllable-search-input"
                autoFocus
              />
            ) : (
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter a line, sentence, or verse..."
                className="syllable-line-input"
                rows={3}
              />
            )}
            {mode === 'word' && input.trim() && !input.includes(' ') && (
              <button type="submit" className="syllable-search-btn">
                View Details
              </button>
            )}
          </form>
        </div>

        {/* Results Section */}
        {input.trim() && (
          <div className="syllable-results-section">
            {mode === 'word' && singleWordResult ? (
              /* Single Word Result */
              <div className="single-word-result">
                <div className="result-count-display">
                  <span className="result-count-number">{singleWordResult.count}</span>
                  <span className="result-count-label">
                    {singleWordResult.count === 1 ? 'syllable' : 'syllables'}
                  </span>
                </div>

                <div className="result-word-display">
                  <span className="result-word">{singleWordResult.word}</span>
                </div>

                <div className="result-breakdown">
                  {singleWordResult.syllables.map((syl, i) => (
                    <span
                      key={i}
                      className={`breakdown-syllable ${
                        singleWordResult.stresses[i] === 1 ? 'stressed' :
                        singleWordResult.stresses[i] === 2 ? 'secondary' : ''
                      }`}
                    >
                      {syl}
                      {i < singleWordResult.syllables.length - 1 && (
                        <span className="breakdown-sep">·</span>
                      )}
                    </span>
                  ))}
                </div>

                {singleWordResult.stresses.length > 0 && (
                  <div className="result-stress-info">
                    <span className="stress-label">Stress pattern:</span>
                    <span className="stress-pattern">
                      {singleWordResult.stresses.map((s, i) => (
                        <span key={i} className={`stress-mark ${s === 1 ? 'primary' : s === 2 ? 'secondary' : 'unstressed'}`}>
                          {s === 1 ? '/' : s === 2 ? '\\' : '–'}
                        </span>
                      ))}
                    </span>
                  </div>
                )}

                <Link
                  to={`/syllables/${encodeURIComponent(singleWordResult.word.toLowerCase().replace(/[^a-z'-]/g, ''))}`}
                  className="view-details-link"
                >
                  View full details, rhymes & more
                </Link>
              </div>
            ) : mode === 'line' && lineResults.length > 0 ? (
              /* Line Mode Results */
              <div className="line-results">
                <div className="line-total">
                  <span className="line-total-number">{totalSyllables}</span>
                  <span className="line-total-label">
                    {totalSyllables === 1 ? 'syllable' : 'syllables'} total
                  </span>
                </div>

                <div className="line-breakdown">
                  <div className="line-words-grid">
                    {lineResults.map((result, idx) => (
                      <Link
                        key={idx}
                        to={`/syllables/${encodeURIComponent(result.word.toLowerCase().replace(/[^a-z'-]/g, ''))}`}
                        className="line-word-item"
                      >
                        <span className="line-word-text">{result.word}</span>
                        <span className="line-word-syllables">
                          {result.syllables.map((syl, i) => (
                            <span
                              key={i}
                              className={`line-syllable ${
                                result.stresses[i] === 1 ? 'stressed' :
                                result.stresses[i] === 2 ? 'secondary' : ''
                              }`}
                            >
                              {syl}
                              {i < result.syllables.length - 1 && '·'}
                            </span>
                          ))}
                        </span>
                        <span className="line-word-count">{result.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Popular Words (shown when no input) */}
        {!input.trim() && (
          <div className="popular-words-section">
            <h2>Popular Lookups</h2>
            <div className="popular-words-grid">
              {POPULAR_WORDS.map((word) => {
                const stresses = dictionaryLoaded ? getStressPattern(word) : [];
                const count = stresses.length || 1;
                return (
                  <Link
                    key={word}
                    to={`/syllables/${word}`}
                    className="popular-word-card"
                  >
                    <span className="popular-word-text">{word}</span>
                    <span className="popular-word-count">{count}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Stress Pattern Legend */}
        <div className="stress-legend-section">
          <h3>Understanding Stress Patterns</h3>
          <div className="stress-legend-content">
            <div className="stress-legend-item">
              <span className="stress-example stressed">beau</span>
              <span className="stress-desc">Primary stress (emphasized)</span>
            </div>
            <div className="stress-legend-item">
              <span className="stress-example secondary">ti</span>
              <span className="stress-desc">Secondary stress</span>
            </div>
            <div className="stress-legend-item">
              <span className="stress-example">ful</span>
              <span className="stress-desc">Unstressed</span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="syllable-info-section">
          <h2>How to Count Syllables</h2>
          <div className="info-content">
            <p>
              A syllable is a unit of pronunciation with one vowel sound. Our counter uses
              the CMU Pronouncing Dictionary for accurate counts based on actual pronunciation,
              not spelling rules.
            </p>
            <div className="info-tips">
              <div className="info-tip">
                <strong>Count vowel sounds</strong> — not letters. "Queue" has 5 vowels but only 1 syllable.
              </div>
              <div className="info-tip">
                <strong>Silent E doesn't count</strong> — "cake" has 1 syllable despite having 2 vowels.
              </div>
              <div className="info-tip">
                <strong>Dialects vary</strong> — "fire" can be 1 or 2 syllables depending on accent.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
