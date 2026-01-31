import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { SyllableWord } from './SyllableWord';
import {
  getWordsBySyllableCount,
  getWordsByPOS,
  getWordCount,
  availableSyllableCounts,
  posLabels,
  WordEntry,
} from '../data/wordsBySyllable';
import './SyllableList.css';

// Pattern to match URLs like "3-syllable-words"
const SYLLABLE_LIST_PATTERN = /^(\d+)-syllable-words$/;

export function SyllableList() {
  const { slug } = useParams<{ slug: string }>();

  // Check if URL matches the syllable list pattern
  const match = slug ? SYLLABLE_LIST_PATTERN.exec(slug) : null;

  // If it doesn't match the pattern, render the word page component instead
  if (!match) {
    return <SyllableWord />;
  }

  // Parse syllable count from URL (e.g., "3-syllable-words" -> 3)
  const syllableCount = parseInt(match[1], 10);
  const isValidCount = availableSyllableCounts.includes(syllableCount);

  const wordsByPOS = isValidCount ? getWordsByPOS(syllableCount) : {};
  const totalWords = isValidCount ? getWordCount(syllableCount) : 0;

  // Format syllable count for display
  const formatSyllableLabel = (num: number) => {
    return num === 1 ? '1 Syllable' : `${num} Syllables`;
  };

  // Get ordinal suffix
  const getOrdinal = (num: number) => {
    if (num === 1) return 'one';
    if (num === 2) return 'two';
    if (num === 3) return 'three';
    if (num === 4) return 'four';
    if (num === 5) return 'five';
    return num.toString();
  };

  // Build ItemList schema for SEO
  const buildItemListSchema = () => {
    const allWords = getWordsBySyllableCount(syllableCount);
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `${syllableCount}-Syllable Words`,
      "description": `A comprehensive list of ${totalWords} common English words with exactly ${syllableCount} syllable${syllableCount !== 1 ? 's' : ''}, organized by part of speech.`,
      "numberOfItems": totalWords,
      "itemListElement": allWords.slice(0, 100).map((entry, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": entry.word,
        "url": `https://poetryeditor.com/syllables/${encodeURIComponent(entry.word)}`
      }))
    };
  };

  return (
    <Layout>
      <SEOHead
        title={isValidCount
          ? `${syllableCount}-Syllable Words: ${totalWords}+ Common Words with ${formatSyllableLabel(syllableCount)}`
          : 'Syllable Word Lists'
        }
        description={isValidCount
          ? `Browse ${totalWords}+ common ${syllableCount}-syllable words organized by part of speech. Find nouns, verbs, adjectives, and adverbs with ${getOrdinal(syllableCount)} syllable${syllableCount !== 1 ? 's' : ''} for poetry, writing, and word games.`
          : 'Browse words organized by syllable count for poetry, writing, and word games.'
        }
        canonicalPath={`/syllables/${slug || ''}`}
        keywords={isValidCount
          ? `${syllableCount} syllable words, ${getOrdinal(syllableCount)} syllable words list, words with ${syllableCount} syllables, ${syllableCount}-syllable nouns, ${syllableCount}-syllable verbs`
          : 'syllable words, word lists by syllables'
        }
        jsonLd={isValidCount ? buildItemListSchema() : undefined}
      />

      <div className="syllable-list-page">
        <nav className="syllable-breadcrumb">
          <Link to="/syllables">Syllable Counter</Link>
          <span className="breadcrumb-separator">/</span>
          <span>{isValidCount ? `${syllableCount}-Syllable Words` : 'Word Lists'}</span>
        </nav>

        {!isValidCount ? (
          <div className="syllable-list-error">
            <h1>Syllable Word Lists</h1>
            <p>Select a syllable count to browse words:</p>
            <div className="syllable-nav-buttons">
              {availableSyllableCounts.map(num => (
                <Link
                  key={num}
                  to={`/syllables/${num}-syllable-words`}
                  className="syllable-nav-btn"
                >
                  {num} Syllable{num !== 1 ? 's' : ''}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <>
            <h1>{syllableCount}-Syllable Words</h1>

            <div className="syllable-list-summary">
              <div className="summary-count">
                <span className="count-number">{totalWords}</span>
                <span className="count-label">words</span>
              </div>
              <p className="summary-description">
                Common English words with exactly {syllableCount} syllable{syllableCount !== 1 ? 's' : ''},
                organized by part of speech. Click any word to see its syllable breakdown and find rhymes.
              </p>
            </div>

            <div className="syllable-nav">
              <span className="syllable-nav-label">Browse by syllables:</span>
              <div className="syllable-nav-buttons">
                {availableSyllableCounts.map(num => (
                  <Link
                    key={num}
                    to={`/syllables/${num}-syllable-words`}
                    className={`syllable-nav-btn ${num === syllableCount ? 'active' : ''}`}
                  >
                    {num}
                  </Link>
                ))}
              </div>
            </div>

            <div className="syllable-list-content">
              {Object.entries(posLabels).map(([pos, label]) => {
                const words = wordsByPOS[pos] || [];
                if (words.length === 0) return null;

                return (
                  <section key={pos} className="pos-section">
                    <h2>{label} <span className="pos-count">({words.length})</span></h2>
                    <div className="word-grid">
                      {words.map((entry: WordEntry) => (
                        <WordCard key={entry.word} entry={entry} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            <div className="syllable-list-actions">
              <Link to="/syllables" className="action-button primary">
                Count Syllables in Any Word
              </Link>
              <Link to="/rhymes" className="action-button secondary">
                Find Rhymes
              </Link>
            </div>

            <div className="related-lists">
              <h3>More Word Lists by Syllable Count</h3>
              <div className="related-links">
                {availableSyllableCounts
                  .filter(num => num !== syllableCount)
                  .map(num => (
                    <Link
                      key={num}
                      to={`/syllables/${num}-syllable-words`}
                      className="related-link"
                    >
                      {num}-Syllable Words ({getWordCount(num)})
                    </Link>
                  ))}
              </div>
            </div>
          </>
        )}

        <div className="back-to-counter">
          <Link to="/syllables">Back to Syllable Counter</Link>
        </div>
      </div>
    </Layout>
  );
}

interface WordCardProps {
  entry: WordEntry;
}

function WordCard({ entry }: WordCardProps) {
  return (
    <Link
      to={`/syllables/${encodeURIComponent(entry.word)}`}
      className="word-card"
    >
      <span className="word-text">{entry.word}</span>
      <span className="word-breakdown">{entry.syllables.join('-')}</span>
    </Link>
  );
}
