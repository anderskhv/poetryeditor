import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { fetchHyponyms, fetchHypernyms, type ImageryWord } from '../utils/rhymeApi';
import { getSyllables } from '../utils/cmuDict';
import { DefinitionTooltip } from '../components/DefinitionTooltip';
import './Imagery.css';

const EXAMPLE_WORDS = [
  'tree', 'bird', 'flower', 'emotion', 'color', 'sound',
  'fruit', 'animal', 'vehicle', 'building', 'weapon', 'fabric',
  'metal', 'stone', 'water', 'light', 'food', 'music'
];

const PAGE_TITLE = 'Imagery';

interface ImageryResult {
  hyponyms: ImageryWord[];
  hypernyms: ImageryWord[];
}

export function Imagery() {
  const { word: urlWord } = useParams<{ word?: string }>();
  const [searchWord, setSearchWord] = useState(urlWord || '');
  const [results, setResults] = useState<ImageryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const performSearch = useCallback(async (word: string) => {
    if (!word.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const [hyponyms, hypernyms] = await Promise.all([
        fetchHyponyms(word),
        fetchHypernyms(word),
      ]);

      setResults({ hyponyms, hypernyms });
    } catch (error) {
      console.error('Error searching imagery:', error);
      setResults({ hyponyms: [], hypernyms: [] });
    } finally {
      setLoading(false);
    }
  }, []);

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
    navigate(`/imagery/${encodeURIComponent(word)}`);
  };

  const handleQuickSearch = (word: string) => {
    navigate(`/imagery/${encodeURIComponent(word)}`);
  };

  const groupBySyllables = (words: ImageryWord[]) => {
    return words.reduce((acc, word) => {
      const sylCount = getSyllables(word.word).length || 1;
      if (!acc[sylCount]) acc[sylCount] = [];
      acc[sylCount].push(word);
      return acc;
    }, {} as Record<number, ImageryWord[]>);
  };

  const displayWord = urlWord || searchWord;
  const groupedHyponyms = results ? groupBySyllables(results.hyponyms) : {};

  return (
    <Layout>
      <SEOHead
        title={urlWord ? `${urlWord} - Concrete Examples for Poetry` : 'Imagery - Find Concrete Words for Poetry'}
        description={urlWord
          ? `Find specific, concrete examples of "${urlWord}" for more vivid poetry. Discover sensory words organized by syllable count.`
          : 'Free imagery finder for poets. Transform abstract words into concrete, sensory language. Find specific examples organized by syllable count.'
        }
        canonicalPath={urlWord ? `/imagery/${urlWord}` : '/imagery'}
        keywords="imagery, concrete words, specific examples, poetry vocabulary, sensory language, vivid writing, hyponyms"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is imagery in poetry?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Imagery is the use of vivid, descriptive language that appeals to the senses. Instead of abstract words like 'tree', poets often use specific examples like 'oak', 'willow', or 'birch' to create more evocative and memorable verses."
              }
            },
            {
              "@type": "Question",
              "name": "How does this tool help with poetry writing?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "This tool finds concrete, specific examples of general concepts. Enter a broad word like 'bird' and discover specific species like 'sparrow', 'hawk', or 'wren'. These concrete words create stronger mental images and more memorable poetry."
              }
            },
            {
              "@type": "Question",
              "name": "What are hyponyms and hypernyms?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Hyponyms are more specific words (oak is a hyponym of tree). Hypernyms are more general words (tree is a hypernym of oak). Poets often replace hypernyms with hyponyms to add specificity and sensory detail to their writing."
              }
            }
          ]
        }}
      />

      <div className="imagery-page">
        <h1>{PAGE_TITLE}</h1>
        <p className="imagery-subtitle">
          Find concrete, specific words to make your poetry more vivid
        </p>

        <form onSubmit={handleSearch} className="imagery-search-form">
          <input
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            placeholder="Enter a general word (e.g., tree, bird, emotion)..."
            className="imagery-search-input"
            autoFocus
          />
          <button type="submit" className="imagery-search-button">
            Search
          </button>
        </form>

        {!searched && !urlWord && (
          <div className="example-searches">
            <h2>Try These Words</h2>
            <div className="example-words">
              {EXAMPLE_WORDS.map((word) => (
                <button
                  key={word}
                  onClick={() => handleQuickSearch(word)}
                  className="example-word-link"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="imagery-loading">Finding concrete examples...</div>
        )}

        {searched && !loading && results && (
          <div className="imagery-results">
            <h2>Concrete examples of "{displayWord}"</h2>

            {results.hyponyms.length === 0 ? (
              <div className="imagery-no-results">
                <p>No specific examples found for "{displayWord}".</p>
                <p className="no-results-hint">
                  Try a more general or abstract word like "tree", "bird", or "emotion".
                </p>
              </div>
            ) : (
              <>
                <p className="imagery-results-count">
                  Found {results.hyponyms.length} concrete examples
                </p>

                {Object.keys(groupedHyponyms)
                  .sort((a, b) => Number(a) - Number(b))
                  .map((sylCount) => (
                    <div key={sylCount} className="imagery-syllable-group">
                      <h3>
                        {sylCount} {Number(sylCount) === 1 ? 'syllable' : 'syllables'}
                      </h3>
                      <div className="imagery-word-list">
                        {groupedHyponyms[Number(sylCount)]
                          .filter(w => !w.word.includes(' '))
                          .map((word, idx) => (
                            <DefinitionTooltip key={idx} word={word.word}>
                              <button
                                onClick={() => handleQuickSearch(word.word)}
                                className="imagery-word-item"
                              >
                                {word.word}
                              </button>
                            </DefinitionTooltip>
                          ))}
                      </div>
                    </div>
                  ))}

                {results.hypernyms.length > 0 && (
                  <div className="imagery-hypernyms">
                    <h3>Related Categories</h3>
                    <p className="hypernyms-hint">
                      Explore broader concepts that include "{displayWord}":
                    </p>
                    <div className="imagery-word-list">
                      {results.hypernyms
                        .filter(w => !w.word.includes(' '))
                        .map((word, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickSearch(word.word)}
                            className="imagery-word-item hypernym"
                          >
                            {word.word}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <div className="imagery-cta">
                  <p>Found the word you need?</p>
                  <div className="cta-buttons">
                    <Link to={`/rhymes/${encodeURIComponent(displayWord)}`} className="imagery-cta-secondary">
                      Find Rhymes
                    </Link>
                    <Link to={`/synonyms/${encodeURIComponent(displayWord)}`} className="imagery-cta-secondary">
                      Find Synonyms
                    </Link>
                    <Link to="/" className="imagery-cta-button">
                      Use in Poetry Editor
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div className="imagery-info">
          <h2>About Imagery</h2>
          <div className="imagery-info-grid">
            <div className="imagery-info-card">
              <h3>Concrete vs Abstract</h3>
              <p>
                Abstract words like "tree" are general. Concrete words like "oak" or
                "willow" evoke specific images and sensory details that make poetry memorable.
              </p>
            </div>
            <div className="imagery-info-card">
              <h3>Sensory Language</h3>
              <p>
                Specific words engage the senses more directly. "Crimson" paints a
                richer picture than "red". Find the precise word for your vision.
              </p>
            </div>
            <div className="imagery-info-card">
              <h3>Syllable Grouping</h3>
              <p>
                Words are organized by syllable count to help you maintain consistent
                meter when choosing more specific alternatives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export function ImageryWord() {
  return <Imagery />;
}
