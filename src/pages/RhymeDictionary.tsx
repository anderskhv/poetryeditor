import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { fetchRhymes, RhymeWord } from '../utils/rhymeApi';
import { loadCMUDictionary, isDictionaryLoaded } from '../utils/cmuDict';
import './RhymeDictionary.css';

const POPULAR_WORDS = [
  'love', 'heart', 'time', 'day', 'night', 'life', 'way', 'world',
  'light', 'dream', 'eyes', 'soul', 'mind', 'rain', 'sun', 'moon',
  'star', 'sky', 'sea', 'fire', 'wind', 'home', 'hand', 'face'
];

export function RhymeDictionary() {
  const [searchWord, setSearchWord] = useState('');
  const [results, setResults] = useState<RhymeWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isDictionaryLoaded()) {
      loadCMUDictionary();
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const word = searchWord.trim().toLowerCase();
    if (!word) return;

    // Navigate to the word page for SEO
    navigate(`/rhymes/${encodeURIComponent(word)}`);
  };

  const handleQuickSearch = async (word: string) => {
    setSearchWord(word);
    setLoading(true);
    setSearched(true);
    const rhymes = await fetchRhymes(word);
    setResults(rhymes);
    setLoading(false);
  };

  // Group results by syllable count
  const groupedResults = results.reduce((acc, rhyme) => {
    const sylCount = rhyme.numSyllables || 0;
    if (!acc[sylCount]) acc[sylCount] = [];
    acc[sylCount].push(rhyme);
    return acc;
  }, {} as Record<number, RhymeWord[]>);

  return (
    <Layout>
      <SEOHead
        title="Rhyme Dictionary - Find Words That Rhyme"
        description="Free online rhyming dictionary. Find perfect rhymes, near rhymes, and slant rhymes for any word. Organized by syllable count for poets and songwriters."
        canonicalPath="/rhymes"
        keywords="rhyming dictionary, words that rhyme, rhyme finder, poetry rhymes, slant rhymes, near rhymes"
      />

      <div className="rhyme-dictionary">
        <h1>Rhyme Dictionary</h1>
        <p className="rhyme-dictionary-subtitle">
          Find perfect rhymes for any word, organized by syllable count
        </p>

        <form onSubmit={handleSearch} className="rhyme-search-form">
          <input
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            placeholder="Enter a word to find rhymes..."
            className="rhyme-search-input"
            autoFocus
          />
          <button type="submit" className="rhyme-search-button">
            Find Rhymes
          </button>
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

        {searched && !loading && results.length === 0 && (
          <div className="rhyme-no-results">
            No rhymes found for "{searchWord}". Try a different word.
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="rhyme-results">
            <h2>Rhymes for "{searchWord}"</h2>
            <p className="rhyme-results-count">
              Found {results.length} rhymes
            </p>

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
                      .map((rhyme, idx) => (
                        <Link
                          key={idx}
                          to={`/rhymes/${encodeURIComponent(rhyme.word)}`}
                          className="rhyme-word-item"
                        >
                          {rhyme.word}
                        </Link>
                      ))}
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
              <h3>Near Rhymes</h3>
              <p>
                Also called slant rhymes. Words with similar but not identical sounds.
                Example: "love" and "move" are near rhymes.
              </p>
            </div>
            <div className="rhyme-info-card">
              <h3>Syllable Matching</h3>
              <p>
                Rhymes are grouped by syllable count to help maintain rhythm
                in your poetry and song lyrics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
