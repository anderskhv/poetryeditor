import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { fetchRhymes, fetchNearAndSlantRhymes, RhymeWord as RhymeWordType } from '../utils/rhymeApi';
import { loadCMUDictionary, isDictionaryLoaded, getStressPattern, getSyllables } from '../utils/cmuDict';
import './RhymeWord.css';

export function RhymeWord() {
  const { word } = useParams<{ word: string }>();
  const [perfectRhymes, setPerfectRhymes] = useState<RhymeWordType[]>([]);
  const [nearRhymes, setNearRhymes] = useState<RhymeWordType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'perfect' | 'near'>('perfect');

  const decodedWord = word ? decodeURIComponent(word).toLowerCase() : '';
  const stresses = getStressPattern(decodedWord);
  const syllables = getSyllables(decodedWord);
  const syllableCount = stresses.length || syllables.length;

  useEffect(() => {
    async function loadData() {
      if (!isDictionaryLoaded()) {
        await loadCMUDictionary();
      }

      if (decodedWord) {
        setLoading(true);
        const [perfect, near] = await Promise.all([
          fetchRhymes(decodedWord),
          fetchNearAndSlantRhymes(decodedWord)
        ]);
        setPerfectRhymes(perfect);
        setNearRhymes(near);
        setLoading(false);
      }
    }

    loadData();
  }, [decodedWord]);

  // Group results by syllable count
  const groupBySyllables = (rhymes: RhymeWordType[]) => {
    return rhymes.reduce((acc, rhyme) => {
      const sylCount = rhyme.numSyllables || 0;
      if (!acc[sylCount]) acc[sylCount] = [];
      acc[sylCount].push(rhyme);
      return acc;
    }, {} as Record<number, RhymeWordType[]>);
  };

  const groupedPerfect = groupBySyllables(perfectRhymes);
  const groupedNear = groupBySyllables(nearRhymes);
  const activeResults = activeTab === 'perfect' ? groupedPerfect : groupedNear;

  // Get related words for internal linking
  const relatedWords = perfectRhymes
    .filter(r => !r.word.includes(' '))
    .slice(0, 5)
    .map(r => r.word);

  // Capitalize first letter for display
  const displayWord = decodedWord.charAt(0).toUpperCase() + decodedWord.slice(1);

  return (
    <Layout>
      <SEOHead
        title={`Words That Rhyme with ${displayWord}`}
        description={`Find ${perfectRhymes.length}+ words that rhyme with "${decodedWord}". Perfect rhymes and near rhymes organized by syllable count for poets and songwriters.`}
        canonicalPath={`/rhymes/${encodeURIComponent(decodedWord)}`}
        keywords={`rhymes with ${decodedWord}, ${decodedWord} rhymes, words that rhyme with ${decodedWord}`}
      />

      <div className="rhyme-word-page">
        <nav className="rhyme-breadcrumb">
          <Link to="/rhymes">Rhyme Dictionary</Link>
          <span className="breadcrumb-separator">/</span>
          <span>{displayWord}</span>
        </nav>

        <h1>Words That Rhyme with {displayWord}</h1>

        {syllableCount > 0 && (
          <div className="word-info">
            <span className="word-info-item">
              <strong>{syllableCount}</strong> {syllableCount === 1 ? 'syllable' : 'syllables'}
            </span>
            {syllables.length > 0 && (
              <span className="word-info-item">
                Breakdown: <strong>{syllables.join('-')}</strong>
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="rhyme-loading">Finding rhymes for "{decodedWord}"...</div>
        ) : (
          <>
            <div className="rhyme-tabs">
              <button
                className={`rhyme-tab ${activeTab === 'perfect' ? 'active' : ''}`}
                onClick={() => setActiveTab('perfect')}
              >
                Perfect Rhymes ({perfectRhymes.length})
              </button>
              <button
                className={`rhyme-tab ${activeTab === 'near' ? 'active' : ''}`}
                onClick={() => setActiveTab('near')}
              >
                Near Rhymes ({nearRhymes.length})
              </button>
            </div>

            {Object.keys(activeResults).length === 0 ? (
              <div className="rhyme-no-results">
                No {activeTab === 'perfect' ? 'perfect' : 'near'} rhymes found for "{decodedWord}".
                {activeTab === 'perfect' && nearRhymes.length > 0 && (
                  <> Try <button onClick={() => setActiveTab('near')} className="link-button">near rhymes</button> instead.</>
                )}
              </div>
            ) : (
              <div className="rhyme-results">
                {Object.keys(activeResults)
                  .sort((a, b) => Number(a) - Number(b))
                  .map((sylCount) => (
                    <div key={sylCount} className="rhyme-syllable-group">
                      <h2>
                        {sylCount} {Number(sylCount) === 1 ? 'syllable' : 'syllables'}
                      </h2>
                      <div className="rhyme-word-list">
                        {activeResults[Number(sylCount)]
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
              </div>
            )}

            <div className="rhyme-actions">
              <Link to="/" className="rhyme-cta-button">
                Use "{decodedWord}" in Poetry Editor
              </Link>
              <Link to={`/syllables/${encodeURIComponent(decodedWord)}`} className="rhyme-secondary-link">
                View syllable breakdown
              </Link>
            </div>

            {relatedWords.length > 0 && (
              <div className="related-searches">
                <h3>Related Rhyme Searches</h3>
                <div className="related-words">
                  {relatedWords.map((w) => (
                    <Link key={w} to={`/rhymes/${w}`} className="related-word-link">
                      {w}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="back-to-search">
          <Link to="/rhymes">← Back to Rhyme Dictionary</Link>
        </div>
      </div>
    </Layout>
  );
}
