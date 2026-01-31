import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { fetchRhymes, RhymeWord as RhymeWordType } from '../utils/rhymeApi';
import { loadCMUDictionary, isDictionaryLoaded, getStressPattern, getSyllables } from '../utils/cmuDict';
import { DefinitionTooltip } from '../components/DefinitionTooltip';
import './RhymeWord.css';

export function RhymeWordFiltered() {
  const { word, syllables: syllablesParam } = useParams<{ word: string; syllables: string }>();
  const [perfectRhymes, setPerfectRhymes] = useState<RhymeWordType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const decodedWord = word ? decodeURIComponent(word).toLowerCase() : '';

  // Parse syllable count from URL (e.g., "2-syllables" -> 2)
  const targetSyllables = syllablesParam
    ? parseInt(syllablesParam.replace('-syllables', '').replace('-syllable', ''))
    : 0;

  const stresses = getStressPattern(decodedWord);
  const wordSyllables = getSyllables(decodedWord);
  const syllableCount = stresses.length || wordSyllables.length;

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);

        if (!isDictionaryLoaded()) {
          await loadCMUDictionary();
        }

        if (decodedWord) {
          setLoading(true);
          const perfect = await fetchRhymes(decodedWord);
          setPerfectRhymes(perfect);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading rhyme data:', err);
        setError('Unable to load rhyme data. Please check your internet connection and try again.');
        setLoading(false);
      }
    }

    loadData();
  }, [decodedWord]);

  // Filter rhymes by target syllable count
  const filteredRhymes = perfectRhymes.filter(
    r => !r.word.includes(' ') && r.numSyllables === targetSyllables
  );

  // Get unique syllable counts for navigation tabs
  const availableSyllableCounts = [...new Set(
    perfectRhymes
      .filter(r => !r.word.includes(' '))
      .map(r => r.numSyllables || 0)
  )].sort((a, b) => a - b);

  // Capitalize first letter for display
  const displayWord = decodedWord.charAt(0).toUpperCase() + decodedWord.slice(1);

  const syllableLabel = targetSyllables === 1 ? 'Syllable' : 'Syllables';
  const pageTitle = `${targetSyllables}-${syllableLabel} Words That Rhyme with ${displayWord} (${filteredRhymes.length} Words)`;

  return (
    <Layout>
      <SEOHead
        title={pageTitle}
        description={`Find ${filteredRhymes.length} ${targetSyllables}-syllable words that rhyme with "${decodedWord}". Perfect for matching meter in poetry and songwriting.`}
        canonicalPath={`/rhymes/${encodeURIComponent(decodedWord)}/${targetSyllables}-syllables`}
        keywords={`${targetSyllables} syllable rhymes with ${decodedWord}, ${decodedWord} rhymes ${targetSyllables} syllables`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": pageTitle,
          "description": `${targetSyllables}-syllable words that rhyme with "${decodedWord}"`,
          "numberOfItems": filteredRhymes.length,
          "itemListElement": filteredRhymes
            .slice(0, 10)
            .map((rhyme, idx) => ({
              "@type": "ListItem",
              "position": idx + 1,
              "name": rhyme.word,
              "url": `https://poetryeditor.com/rhymes/${encodeURIComponent(rhyme.word)}`
            }))
        }}
      />

      <div className="rhyme-word-page">
        <nav className="rhyme-breadcrumb">
          <Link to="/rhymes">Rhyme Dictionary</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to={`/rhymes/${encodeURIComponent(decodedWord)}`}>{displayWord}</Link>
          <span className="breadcrumb-separator">/</span>
          <span>{targetSyllables} {syllableLabel}</span>
        </nav>

        <h1>{targetSyllables}-{syllableLabel} Rhymes for {displayWord}</h1>

        {syllableCount > 0 && (
          <div className="word-info">
            <span className="word-info-item">
              <strong>{displayWord}</strong> has <strong>{syllableCount}</strong> {syllableCount === 1 ? 'syllable' : 'syllables'}
            </span>
          </div>
        )}

        {/* Syllable count tabs */}
        {availableSyllableCounts.length > 1 && (
          <div className="syllable-tabs">
            <span className="syllable-tabs-label">Filter by syllables:</span>
            {availableSyllableCounts.map(count => (
              <Link
                key={count}
                to={`/rhymes/${encodeURIComponent(decodedWord)}/${count}-syllables`}
                className={`syllable-tab ${count === targetSyllables ? 'active' : ''}`}
              >
                {count}
              </Link>
            ))}
            <Link
              to={`/rhymes/${encodeURIComponent(decodedWord)}`}
              className="syllable-tab all-tab"
            >
              All
            </Link>
          </div>
        )}

        {error ? (
          <div className="rhyme-error">
            <span className="error-icon">!</span>
            <span>{error}</span>
            <button onClick={() => window.location.reload()} className="retry-button">
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="rhyme-loading">Finding {targetSyllables}-syllable rhymes for "{decodedWord}"...</div>
        ) : filteredRhymes.length === 0 ? (
          <div className="rhyme-no-results">
            No {targetSyllables}-syllable rhymes found for "{decodedWord}".
            <br />
            <Link to={`/rhymes/${encodeURIComponent(decodedWord)}`} className="link-button">
              View all rhymes
            </Link>
          </div>
        ) : (
          <>
            <p className="results-count">
              Found <strong>{filteredRhymes.length}</strong> {targetSyllables}-syllable {filteredRhymes.length === 1 ? 'word' : 'words'} that rhyme with "{decodedWord}"
            </p>

            <div className="rhyme-results">
              <div className="rhyme-word-list filtered-list">
                {filteredRhymes.map((rhyme, idx) => {
                  const rarityClass = rhyme.score > 5000 ? 'common' : rhyme.score > 1000 ? '' : 'rare';

                  return (
                    <DefinitionTooltip key={idx} word={rhyme.word}>
                      <Link
                        to={`/rhymes/${encodeURIComponent(rhyme.word)}`}
                        className={`rhyme-word-item ${rarityClass}`}
                      >
                        {rhyme.word}
                      </Link>
                    </DefinitionTooltip>
                  );
                })}
              </div>
            </div>

            <div className="rhyme-actions">
              <Link to="/" className="rhyme-cta-button-wrapper">
                <span className="rhyme-cta-button">Open in Poetry Editor</span>
                <span className="rhyme-cta-tooltip">
                  Meter analysis with syllable matching
                </span>
              </Link>
              <Link to={`/rhymes/${encodeURIComponent(decodedWord)}`} className="rhyme-secondary-link">
                View all rhymes for {displayWord}
              </Link>
            </div>
          </>
        )}

        <div className="back-to-search">
          <Link to={`/rhymes/${encodeURIComponent(decodedWord)}`}>← All rhymes for {displayWord}</Link>
        </div>
      </div>
    </Layout>
  );
}
