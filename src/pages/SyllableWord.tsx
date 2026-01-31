import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { loadCMUDictionary, isDictionaryLoaded, getStressPattern, getSyllables, getPronunciations } from '../utils/cmuDict';
import './SyllableWord.css';

export function SyllableWord() {
  const { word } = useParams<{ word: string }>();
  const [loading, setLoading] = useState(true);

  const decodedWord = word ? decodeURIComponent(word).toLowerCase() : '';

  useEffect(() => {
    async function loadDict() {
      if (!isDictionaryLoaded()) {
        await loadCMUDictionary();
      }
      setLoading(false);
    }
    loadDict();
  }, []);

  const stresses = getStressPattern(decodedWord);
  const syllables = getSyllables(decodedWord);
  const pronunciations = getPronunciations(decodedWord);
  const syllableCount = stresses.length || syllables.length || 0;

  // Capitalize for display
  const displayWord = decodedWord.charAt(0).toUpperCase() + decodedWord.slice(1);

  // Get stress pattern description
  const getStressDescription = (stress: number) => {
    if (stress === 1) return 'primary stress';
    if (stress === 2) return 'secondary stress';
    return 'unstressed';
  };

  return (
    <Layout>
      <SEOHead
        title={`${displayWord}: ${syllableCount} Syllable${syllableCount !== 1 ? 's' : ''} [${syllables.length > 0 ? syllables.join('-') : decodedWord}]`}
        description={`${displayWord} has ${syllableCount} syllable${syllableCount !== 1 ? 's' : ''}, broken down as ${syllables.length > 0 ? syllables.join('-') : decodedWord}. See stress pattern, pronunciation, and find rhymes for "${decodedWord}".`}
        canonicalPath={`/syllables/${encodeURIComponent(decodedWord)}`}
        keywords={`how many syllables in ${decodedWord}, ${decodedWord} syllables, ${decodedWord} syllable count`}
        jsonLd={syllableCount > 0 ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": `How many syllables in ${decodedWord}?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `${displayWord} has ${syllableCount} syllable${syllableCount !== 1 ? 's' : ''}${syllables.length > 0 ? `, broken down as: ${syllables.join('-')}` : ''}.`
              }
            },
            {
              "@type": "Question",
              "name": `How do you pronounce ${decodedWord}?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `${displayWord} is pronounced with ${syllableCount} syllable${syllableCount !== 1 ? 's' : ''}${syllables.length > 0 ? `: ${syllables.join('-')}` : ''}. ${stresses.length > 0 ? `The stress falls on the ${stresses.findIndex(s => s === 1) + 1}${['st', 'nd', 'rd'][stresses.findIndex(s => s === 1)] || 'th'} syllable.` : ''}`
              }
            }
          ]
        } : undefined}
      />

      <div className="syllable-word-page">
        <nav className="syllable-breadcrumb">
          <Link to="/syllables">Syllable Counter</Link>
          <span className="breadcrumb-separator">/</span>
          <span>{displayWord}</span>
        </nav>

        <h1>How Many Syllables in {displayWord}?</h1>

        {loading ? (
          <div className="syllable-loading">Loading syllable data...</div>
        ) : syllableCount === 0 ? (
          <div className="syllable-not-found">
            <p>We couldn't find syllable data for "{decodedWord}" in our dictionary.</p>
            <p>This might be a proper noun, a very rare word, or a misspelling.</p>
            <Link to="/syllables" className="try-again-link">Try another word</Link>
          </div>
        ) : (
          <>
            <div className="syllable-answer">
              <div className="answer-number">{syllableCount}</div>
              <div className="answer-label">
                {syllableCount === 1 ? 'syllable' : 'syllables'}
              </div>
            </div>

            <div className="syllable-breakdown-section">
              <h2>Syllable Breakdown</h2>
              <div className="syllable-visual">
                {syllables.map((syl, idx) => (
                  <div key={idx} className="syllable-item">
                    <span className={`syllable-text ${stresses[idx] === 1 ? 'primary' : stresses[idx] === 2 ? 'secondary' : 'unstressed'}`}>
                      {syl}
                    </span>
                    <span className="syllable-stress">
                      {getStressDescription(stresses[idx])}
                    </span>
                  </div>
                ))}
              </div>

              <div className="syllable-written">
                Written: <strong>{syllables.join('-')}</strong>
              </div>
            </div>

            {pronunciations.length > 0 && (
              <div className="pronunciation-section">
                <h2>Pronunciation</h2>
                <div className="phonemes">
                  {pronunciations[0].phones.join(' ')}
                </div>
                <p className="phoneme-note">
                  Phonemes from the CMU Pronouncing Dictionary. Numbers indicate stress:
                  1 = primary, 2 = secondary, 0 = unstressed.
                </p>
              </div>
            )}

            <div className="stress-pattern-section">
              <h2>Stress Pattern</h2>
              <div className="stress-visual">
                {stresses.map((stress, idx) => (
                  <span key={idx} className={`stress-mark ${stress === 1 ? 'primary' : stress === 2 ? 'secondary' : 'unstressed'}`}>
                    {stress === 1 ? '/' : stress === 2 ? '\\' : 'u'}
                  </span>
                ))}
              </div>
              <div className="stress-legend-inline">
                <span><strong>/</strong> = primary stress</span>
                <span><strong>\</strong> = secondary stress</span>
                <span><strong>u</strong> = unstressed</span>
              </div>
            </div>

            <div className="word-actions">
              <Link to={`/rhymes/${encodeURIComponent(decodedWord)}`} className="action-button primary">
                Find Rhymes for "{displayWord}"
              </Link>
              <Link to="/" className="action-button secondary">
                Use in Poetry Editor
              </Link>
            </div>
          </>
        )}

        <div className="back-to-counter">
          <Link to="/syllables">← Back to Syllable Counter</Link>
        </div>
      </div>
    </Layout>
  );
}
