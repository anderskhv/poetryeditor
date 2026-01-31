import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { fetchRhymes, RhymeWord as RhymeWordType } from '../utils/rhymeApi';
import { loadCMUDictionary, isDictionaryLoaded, getSyllables } from '../utils/cmuDict';
import { DefinitionTooltip } from '../components/DefinitionTooltip';
import './RhymePair.css';

// Common rhyme pairs for the "More rhyme pairs" section
const POPULAR_RHYME_PAIRS = [
  ['love', 'above'],
  ['heart', 'start'],
  ['day', 'way'],
  ['night', 'light'],
  ['time', 'rhyme'],
  ['mind', 'find'],
  ['soul', 'whole'],
  ['dream', 'seem'],
  ['life', 'strife'],
  ['true', 'you'],
  ['moon', 'soon'],
  ['sun', 'one'],
  ['fire', 'desire'],
  ['rain', 'pain'],
  ['tears', 'years'],
];

// Example sentence templates using both words
const SENTENCE_TEMPLATES = [
  (w1: string, w2: string) => `The ${w1} I feel is like the sky ${w2}.`,
  (w1: string, w2: string) => `When ${w1} meets ${w2}, poetry is born.`,
  (w1: string, w2: string) => `From ${w1} to ${w2}, the rhythm flows.`,
  (w1: string, w2: string) => `A verse of ${w1}, a line of ${w2}.`,
  (w1: string, w2: string) => `${capitalize(w1)} and ${w2} dance together in rhyme.`,
];

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Generate example sentences using both words
function generateExampleSentences(word1: string, word2: string): string[] {
  const examples: string[] = [];

  // Use template-based sentences
  const template = SENTENCE_TEMPLATES[Math.floor(Math.random() * SENTENCE_TEMPLATES.length)];
  examples.push(template(word1, word2));
  examples.push(template(word2, word1));

  // Add poetic couplet examples
  examples.push(`"...and with ${word1},\nwe find ${word2}."`);
  examples.push(`"Through ${word2}, we seek the ${word1}."`);

  return examples.slice(0, 3); // Return 3 examples
}

export function RhymePair() {
  // React Router parses /rhymes/:word1-and-:word2 as two params: word1 and word2
  // e.g., /rhymes/love-and-above gives word1="love" and word2="above"
  const params = useParams<{ word1: string; word2: string }>();

  // Get word1 and word2 from route params, decode and normalize
  const word1 = params.word1 ? decodeURIComponent(params.word1).toLowerCase().trim() : '';
  const word2 = params.word2 ? decodeURIComponent(params.word2).toLowerCase().trim() : '';

  const [rhymes1, setRhymes1] = useState<RhymeWordType[]>([]);
  const [rhymes2, setRhymes2] = useState<RhymeWordType[]>([]);
  const [commonRhymes, setCommonRhymes] = useState<RhymeWordType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syllables1 = getSyllables(word1 || '');
  const syllables2 = getSyllables(word2 || '');
  const syllableCount1 = syllables1.length;
  const syllableCount2 = syllables2.length;

  useEffect(() => {
    async function loadData() {
      if (!word1 || !word2) {
        setError('Invalid rhyme pair URL. Expected format: /rhymes/word1-and-word2');
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);

        if (!isDictionaryLoaded()) {
          await loadCMUDictionary();
        }

        // Fetch rhymes for both words in parallel
        const [rhymesFor1, rhymesFor2] = await Promise.all([
          fetchRhymes(word1),
          fetchRhymes(word2)
        ]);

        setRhymes1(rhymesFor1);
        setRhymes2(rhymesFor2);

        // Find common rhymes (words that rhyme with both)
        const rhymeWords1 = new Set(rhymesFor1.map(r => r.word.toLowerCase()));
        const common = rhymesFor2.filter(r => rhymeWords1.has(r.word.toLowerCase()));
        setCommonRhymes(common);

        setLoading(false);
      } catch (err) {
        console.error('Error loading rhyme pair data:', err);
        setError('Unable to load rhyme data. Please check your internet connection and try again.');
        setLoading(false);
      }
    }

    loadData();
  }, [word1, word2]);

  // Get related rhyme pairs
  const getRelatedPairs = () => {
    return POPULAR_RHYME_PAIRS
      .filter(([a, b]) => !(a === word1 && b === word2) && !(a === word2 && b === word1))
      .slice(0, 6);
  };

  // Generate example sentences
  const exampleSentences = word1 && word2 ? generateExampleSentences(word1, word2) : [];

  // Display words
  const displayWord1 = word1 ? capitalize(word1) : '';
  const displayWord2 = word2 ? capitalize(word2) : '';
  const pairTitle = `${displayWord1} and ${displayWord2}`;

  if (!word1 || !word2) {
    return (
      <Layout>
        <SEOHead
          title="Rhyme Pair - Poetry Editor"
          description="Explore rhyming word pairs for poetry and songwriting."
          canonicalPath="/rhymes"
        />
        <div className="rhyme-pair-page">
          <div className="rhyme-error">
            <span className="error-icon">!</span>
            <span>Invalid rhyme pair URL. Expected format: /rhymes/word1-and-word2</span>
            <Link to="/rhymes" className="back-link">Go to Rhyme Dictionary</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={`${displayWord1} and ${displayWord2} Rhyme Pair - Perfect Rhymes for Poetry`}
        description={`Explore the rhyming pair "${word1}" and "${word2}". See syllable counts, common rhymes they share, and example usage for poets and songwriters.`}
        canonicalPath={`/rhymes/${encodeURIComponent(word1)}-and-${encodeURIComponent(word2)}`}
        keywords={`${word1} ${word2} rhyme, ${word1} and ${word2}, rhyming words, poetry rhymes, ${word1} rhymes, ${word2} rhymes`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": `Rhyme Pair: ${displayWord1} and ${displayWord2}`,
          "description": `A rhyming word pair for poetry: "${word1}" and "${word2}" with their common rhymes`,
          "numberOfItems": 2 + commonRhymes.length,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": word1,
              "url": `https://poetryeditor.com/rhymes/${encodeURIComponent(word1)}`
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": word2,
              "url": `https://poetryeditor.com/rhymes/${encodeURIComponent(word2)}`
            },
            ...commonRhymes.slice(0, 8).map((rhyme, idx) => ({
              "@type": "ListItem",
              "position": idx + 3,
              "name": rhyme.word,
              "url": `https://poetryeditor.com/rhymes/${encodeURIComponent(rhyme.word)}`
            }))
          ]
        }}
      />

      <div className="rhyme-pair-page">
        <nav className="rhyme-breadcrumb">
          <Link to="/rhymes">Rhyme Dictionary</Link>
          <span className="breadcrumb-separator">/</span>
          <span>{pairTitle}</span>
        </nav>

        <h1>{displayWord1} and {displayWord2}</h1>
        <p className="pair-subtitle">A rhyming word pair for poetry</p>

        {error ? (
          <div className="rhyme-error">
            <span className="error-icon">!</span>
            <span>{error}</span>
            <button onClick={() => window.location.reload()} className="retry-button">
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="rhyme-loading">Analyzing rhyme pair...</div>
        ) : (
          <>
            {/* Word Cards */}
            <div className="pair-words-section">
              <div className="word-card">
                <Link to={`/rhymes/${encodeURIComponent(word1)}`} className="word-card-link">
                  <h2>{displayWord1}</h2>
                  <div className="word-card-info">
                    <span className="syllable-count">
                      {syllableCount1} {syllableCount1 === 1 ? 'syllable' : 'syllables'}
                    </span>
                    {syllables1.length > 0 && (
                      <span className="syllable-breakdown">{syllables1.join('-')}</span>
                    )}
                  </div>
                  <span className="word-card-rhyme-count">{rhymes1.length} rhymes</span>
                </Link>
              </div>

              <div className="pair-connector">
                <span className="connector-symbol">&amp;</span>
              </div>

              <div className="word-card">
                <Link to={`/rhymes/${encodeURIComponent(word2)}`} className="word-card-link">
                  <h2>{displayWord2}</h2>
                  <div className="word-card-info">
                    <span className="syllable-count">
                      {syllableCount2} {syllableCount2 === 1 ? 'syllable' : 'syllables'}
                    </span>
                    {syllables2.length > 0 && (
                      <span className="syllable-breakdown">{syllables2.join('-')}</span>
                    )}
                  </div>
                  <span className="word-card-rhyme-count">{rhymes2.length} rhymes</span>
                </Link>
              </div>
            </div>

            {/* Common Rhymes Section */}
            {commonRhymes.length > 0 && (
              <div className="common-rhymes-section">
                <h3>Words That Rhyme with Both</h3>
                <p className="section-hint">
                  These {commonRhymes.length} words rhyme with both "{word1}" and "{word2}"
                </p>
                <div className="rhyme-word-list">
                  {commonRhymes
                    .filter(r => !r.word.includes(' '))
                    .slice(0, 20)
                    .map((rhyme, idx) => (
                      <DefinitionTooltip key={idx} word={rhyme.word}>
                        <Link
                          to={`/rhymes/${encodeURIComponent(rhyme.word)}`}
                          className="rhyme-word-item"
                        >
                          {rhyme.word}
                        </Link>
                      </DefinitionTooltip>
                    ))}
                </div>
              </div>
            )}

            {/* Example Sentences */}
            <div className="examples-section">
              <h3>Example Usage</h3>
              <p className="section-hint">Ways to use these words together in verse</p>
              <div className="example-sentences">
                {exampleSentences.map((sentence, idx) => (
                  <div key={idx} className="example-sentence">
                    <span className="example-number">{idx + 1}</span>
                    <span className="example-text">{sentence}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="rhyme-actions">
              <Link to="/" className="rhyme-cta-button-wrapper">
                <span className="rhyme-cta-button">Open in Poetry Editor</span>
                <span className="rhyme-cta-tooltip">
                  Meter analysis, rhyme schemes, and more
                </span>
              </Link>
            </div>

            {/* Individual Word Links */}
            <div className="individual-word-links">
              <h3>Explore Each Word</h3>
              <div className="word-link-cards">
                <Link to={`/rhymes/${encodeURIComponent(word1)}`} className="word-link-card">
                  <span className="word-link-label">All rhymes for</span>
                  <span className="word-link-word">{displayWord1}</span>
                </Link>
                <Link to={`/rhymes/${encodeURIComponent(word2)}`} className="word-link-card">
                  <span className="word-link-label">All rhymes for</span>
                  <span className="word-link-word">{displayWord2}</span>
                </Link>
              </div>
            </div>

            {/* More Rhyme Pairs */}
            <div className="more-pairs-section">
              <h3>More Rhyme Pairs</h3>
              <p className="section-hint">Popular word pairs for poetry</p>
              <div className="pair-links">
                {getRelatedPairs().map(([a, b], idx) => (
                  <Link
                    key={idx}
                    to={`/rhymes/${encodeURIComponent(a)}-and-${encodeURIComponent(b)}`}
                    className="pair-link"
                  >
                    {capitalize(a)} &amp; {capitalize(b)}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="back-to-search">
          <Link to="/rhymes">Back to Rhyme Dictionary</Link>
        </div>
      </div>
    </Layout>
  );
}
