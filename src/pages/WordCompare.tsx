import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { loadCMUDictionary, isDictionaryLoaded, getStressPattern, getSyllables } from '../utils/cmuDict';
import { fetchRhymes, fetchSynonyms, RhymeWord, SynonymWord } from '../utils/rhymeApi';
import './WordCompare.css';

// Connotation data for common words
const CONNOTATIONS: Record<string, { tone: string; usage: string; formality: string }> = {
  happy: { tone: 'casual, everyday', usage: 'general situations, casual speech', formality: 'neutral' },
  joyful: { tone: 'elevated, poetic', usage: 'celebrations, formal writing', formality: 'formal' },
  glad: { tone: 'mild, polite', usage: 'polite acknowledgment, older usage', formality: 'neutral' },
  cheerful: { tone: 'warm, friendly', usage: 'describing personality or atmosphere', formality: 'neutral' },
  elated: { tone: 'intense, dramatic', usage: 'extreme happiness, achievements', formality: 'formal' },
  content: { tone: 'calm, peaceful', usage: 'satisfied state, not excited', formality: 'neutral' },
  delighted: { tone: 'polite, enthusiastic', usage: 'formal pleasure, surprises', formality: 'formal' },
  sad: { tone: 'simple, direct', usage: 'general unhappiness', formality: 'neutral' },
  sorrowful: { tone: 'deep, literary', usage: 'profound grief, poetry', formality: 'formal' },
  melancholy: { tone: 'reflective, bittersweet', usage: 'thoughtful sadness, literary', formality: 'formal' },
  gloomy: { tone: 'dark, atmospheric', usage: 'mood, weather, outlook', formality: 'neutral' },
  love: { tone: 'universal, powerful', usage: 'deep affection, romance', formality: 'neutral' },
  adore: { tone: 'intense, devotional', usage: 'worship-like love, strong preference', formality: 'neutral' },
  cherish: { tone: 'tender, protective', usage: 'treasuring something precious', formality: 'neutral' },
  big: { tone: 'casual, basic', usage: 'everyday size description', formality: 'informal' },
  large: { tone: 'neutral, precise', usage: 'formal size description', formality: 'neutral' },
  enormous: { tone: 'emphatic, dramatic', usage: 'impressive size', formality: 'neutral' },
  vast: { tone: 'expansive, poetic', usage: 'immense spaces, abstract scale', formality: 'formal' },
  small: { tone: 'neutral, basic', usage: 'everyday size description', formality: 'neutral' },
  tiny: { tone: 'diminutive, cute', usage: 'very small, often affectionate', formality: 'informal' },
  minute: { tone: 'precise, technical', usage: 'extremely small, scientific', formality: 'formal' },
  beautiful: { tone: 'appreciative, common', usage: 'general aesthetic praise', formality: 'neutral' },
  gorgeous: { tone: 'enthusiastic, modern', usage: 'strong visual appeal', formality: 'informal' },
  stunning: { tone: 'impactful, dramatic', usage: 'striking beauty', formality: 'neutral' },
  lovely: { tone: 'warm, pleasant', usage: 'gentle appreciation', formality: 'neutral' },
  fast: { tone: 'direct, energetic', usage: 'speed in general', formality: 'neutral' },
  quick: { tone: 'brief, efficient', usage: 'short duration', formality: 'neutral' },
  rapid: { tone: 'technical, clinical', usage: 'measured speed, formal', formality: 'formal' },
  swift: { tone: 'elegant, literary', usage: 'graceful speed, poetry', formality: 'formal' },
  old: { tone: 'neutral, basic', usage: 'age description', formality: 'neutral' },
  ancient: { tone: 'historical, grand', usage: 'very old, historical', formality: 'formal' },
  elderly: { tone: 'respectful, polite', usage: 'older people', formality: 'formal' },
  aged: { tone: 'literary, dignified', usage: 'time-worn, mature', formality: 'formal' },
  smart: { tone: 'casual, modern', usage: 'intelligence, cleverness', formality: 'informal' },
  intelligent: { tone: 'precise, respectful', usage: 'measured cognitive ability', formality: 'formal' },
  clever: { tone: 'quick-witted', usage: 'ingenuity, wit', formality: 'neutral' },
  brilliant: { tone: 'exceptional, bright', usage: 'outstanding intelligence', formality: 'neutral' },
  angry: { tone: 'direct, common', usage: 'general anger', formality: 'neutral' },
  furious: { tone: 'intense, explosive', usage: 'extreme anger', formality: 'neutral' },
  irate: { tone: 'formal, contained', usage: 'formal anger, complaints', formality: 'formal' },
  enraged: { tone: 'dramatic, violent', usage: 'loss of control', formality: 'formal' },
};

// Popular word comparisons for suggestions
const POPULAR_COMPARISONS: [string, string][] = [
  ['happy', 'joyful'],
  ['sad', 'melancholy'],
  ['big', 'large'],
  ['fast', 'quick'],
  ['beautiful', 'gorgeous'],
  ['smart', 'intelligent'],
  ['old', 'ancient'],
  ['love', 'adore'],
  ['angry', 'furious'],
  ['small', 'tiny'],
];

function getConnotation(word: string): { tone: string; usage: string; formality: string } | null {
  return CONNOTATIONS[word.toLowerCase()] || null;
}

function formatStressPattern(stresses: number[]): string {
  return stresses.map(s => {
    if (s === 1) return '/';
    if (s === 2) return '\\';
    return 'u';
  }).join(' ');
}

function getStressDescription(stresses: number[]): string {
  if (stresses.length === 0) return 'Unknown';
  if (stresses.length === 1) {
    return stresses[0] >= 1 ? 'Stressed' : 'Unstressed';
  }

  const primaryIndex = stresses.findIndex(s => s === 1);
  if (primaryIndex === 0) return 'Initial stress';
  if (primaryIndex === stresses.length - 1) return 'Final stress';
  return `Stress on syllable ${primaryIndex + 1}`;
}

export function WordCompare() {
  const { words } = useParams<{ words: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [word1Rhymes, setWord1Rhymes] = useState<RhymeWord[]>([]);
  const [word2Rhymes, setWord2Rhymes] = useState<RhymeWord[]>([]);
  const [word1Synonyms, setWord1Synonyms] = useState<SynonymWord[]>([]);
  const [word2Synonyms, setWord2Synonyms] = useState<SynonymWord[]>([]);

  // Parse words from URL (format: word1-vs-word2)
  const parsedWords = useMemo(() => {
    if (!words) return { word1: '', word2: '' };
    const parts = words.toLowerCase().split('-vs-');
    if (parts.length !== 2) return { word1: '', word2: '' };
    return {
      word1: decodeURIComponent(parts[0].trim()),
      word2: decodeURIComponent(parts[1].trim()),
    };
  }, [words]);

  const { word1, word2 } = parsedWords;

  // Get syllable and stress data
  const word1Stresses = getStressPattern(word1);
  const word2Stresses = getStressPattern(word2);
  const word1Syllables = getSyllables(word1);
  const word2Syllables = getSyllables(word2);

  useEffect(() => {
    async function loadData() {
      if (!word1 || !word2) {
        setLoading(false);
        return;
      }

      try {
        if (!isDictionaryLoaded()) {
          await loadCMUDictionary();
        }

        // Fetch rhymes and synonyms for both words in parallel
        const [rhymes1, rhymes2, syns1, syns2] = await Promise.all([
          fetchRhymes(word1),
          fetchRhymes(word2),
          fetchSynonyms(word1),
          fetchSynonyms(word2),
        ]);

        setWord1Rhymes(rhymes1);
        setWord2Rhymes(rhymes2);
        setWord1Synonyms(syns1);
        setWord2Synonyms(syns2);
      } catch (error) {
        console.error('Error loading comparison data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [word1, word2]);

  // Calculate unique synonyms for each word
  const uniqueSynonyms = useMemo(() => {
    const syns1Set = new Set(word1Synonyms.map(s => s.word.toLowerCase()));
    const syns2Set = new Set(word2Synonyms.map(s => s.word.toLowerCase()));

    return {
      word1Only: word1Synonyms.filter(s => !syns2Set.has(s.word.toLowerCase())).slice(0, 8),
      word2Only: word2Synonyms.filter(s => !syns1Set.has(s.word.toLowerCase())).slice(0, 8),
      shared: word1Synonyms.filter(s => syns2Set.has(s.word.toLowerCase())).slice(0, 6),
    };
  }, [word1Synonyms, word2Synonyms]);

  // Get connotations
  const word1Connotation = getConnotation(word1);
  const word2Connotation = getConnotation(word2);

  // Capitalize for display
  const displayWord1 = word1.charAt(0).toUpperCase() + word1.slice(1);
  const displayWord2 = word2.charAt(0).toUpperCase() + word2.slice(1);

  // Generate similar comparisons
  const similarComparisons = useMemo(() => {
    // Find comparisons that share a word or are semantically related
    const related = POPULAR_COMPARISONS.filter(([w1, w2]) => {
      return w1 !== word1 && w2 !== word2 && w1 !== word2 && w2 !== word1;
    }).slice(0, 5);

    // Also suggest comparing each word with its top synonym
    const suggestions: [string, string][] = [...related];

    if (word1Synonyms.length > 0 && word1Synonyms[0].word !== word2) {
      suggestions.unshift([word1, word1Synonyms[0].word]);
    }
    if (word2Synonyms.length > 0 && word2Synonyms[0].word !== word1) {
      suggestions.unshift([word2, word2Synonyms[0].word]);
    }

    return suggestions.slice(0, 6);
  }, [word1, word2, word1Synonyms, word2Synonyms]);

  // Handle invalid URL
  if (!word1 || !word2) {
    return (
      <Layout>
        <SEOHead
          title="Word Comparison - Compare Words for Poetry"
          description="Compare two words side by side: syllables, stress patterns, synonyms, and when to use each. Perfect for poets and writers."
          canonicalPath="/compare"
        />
        <div className="word-compare-page">
          <h1>Compare Two Words</h1>
          <p className="compare-intro">
            Enter two words in the URL to compare them, e.g., /compare/happy-vs-joyful
          </p>

          <div className="popular-comparisons">
            <h2>Popular Comparisons</h2>
            <div className="comparison-links">
              {POPULAR_COMPARISONS.map(([w1, w2]) => (
                <Link
                  key={`${w1}-${w2}`}
                  to={`/compare/${w1}-vs-${w2}`}
                  className="comparison-link"
                >
                  {w1} vs {w2}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={`${displayWord1} vs ${displayWord2}: Word Comparison for Poets`}
        description={`Compare "${word1}" and "${word2}": syllable count, stress patterns, unique synonyms, and when to use each word in your poetry or writing.`}
        canonicalPath={`/compare/${encodeURIComponent(word1)}-vs-${encodeURIComponent(word2)}`}
        keywords={`${word1} vs ${word2}, ${word1} or ${word2}, difference between ${word1} and ${word2}, ${word1} synonym, ${word2} synonym`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": `What is the difference between ${word1} and ${word2}?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `"${displayWord1}" has ${word1Stresses.length || 'unknown'} syllable${word1Stresses.length !== 1 ? 's' : ''} (${word1Syllables.join('-') || word1}), while "${displayWord2}" has ${word2Stresses.length || 'unknown'} syllable${word2Stresses.length !== 1 ? 's' : ''} (${word2Syllables.join('-') || word2}). ${word1Connotation ? `"${displayWord1}" has a ${word1Connotation.tone} tone.` : ''} ${word2Connotation ? `"${displayWord2}" has a ${word2Connotation.tone} tone.` : ''}`
              }
            },
            {
              "@type": "Question",
              "name": `When should I use ${word1} vs ${word2}?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `Use "${word1}" ${word1Connotation ? `for ${word1Connotation.usage}` : 'in general contexts'}. Use "${word2}" ${word2Connotation ? `for ${word2Connotation.usage}` : 'in similar contexts'}. Consider the syllable count for meter: ${word1} (${word1Stresses.length || '?'}) vs ${word2} (${word2Stresses.length || '?'}).`
              }
            }
          ]
        }}
      />

      <div className="word-compare-page">
        <nav className="compare-breadcrumb">
          <Link to="/synonyms">Word Alternatives</Link>
          <span className="breadcrumb-separator">/</span>
          <span>Compare</span>
        </nav>

        <h1>{displayWord1} vs {displayWord2}</h1>
        <p className="compare-subtitle">Side-by-side word comparison for poets and writers</p>

        {loading ? (
          <div className="compare-loading">Loading comparison data...</div>
        ) : (
          <>
            {/* Syllable Comparison */}
            <section className="compare-section">
              <h2>Syllables</h2>
              <div className="compare-grid">
                <div className="compare-card">
                  <h3>{displayWord1}</h3>
                  <div className="syllable-count">{word1Stresses.length || '?'}</div>
                  <div className="syllable-label">
                    {word1Stresses.length === 1 ? 'syllable' : 'syllables'}
                  </div>
                  {word1Syllables.length > 0 && (
                    <div className="syllable-breakdown">{word1Syllables.join('-')}</div>
                  )}
                </div>

                <div className="compare-vs">vs</div>

                <div className="compare-card">
                  <h3>{displayWord2}</h3>
                  <div className="syllable-count">{word2Stresses.length || '?'}</div>
                  <div className="syllable-label">
                    {word2Stresses.length === 1 ? 'syllable' : 'syllables'}
                  </div>
                  {word2Syllables.length > 0 && (
                    <div className="syllable-breakdown">{word2Syllables.join('-')}</div>
                  )}
                </div>
              </div>
            </section>

            {/* Stress Pattern Comparison */}
            <section className="compare-section">
              <h2>Stress Patterns</h2>
              <div className="compare-grid">
                <div className="compare-card">
                  <h3>{displayWord1}</h3>
                  {word1Stresses.length > 0 ? (
                    <>
                      <div className="stress-visual">
                        {word1Stresses.map((stress, idx) => (
                          <span
                            key={idx}
                            className={`stress-mark ${stress === 1 ? 'primary' : stress === 2 ? 'secondary' : 'unstressed'}`}
                          >
                            {stress === 1 ? '/' : stress === 2 ? '\\' : 'u'}
                          </span>
                        ))}
                      </div>
                      <div className="stress-description">{getStressDescription(word1Stresses)}</div>
                    </>
                  ) : (
                    <div className="stress-unknown">Pattern not available</div>
                  )}
                </div>

                <div className="compare-vs">vs</div>

                <div className="compare-card">
                  <h3>{displayWord2}</h3>
                  {word2Stresses.length > 0 ? (
                    <>
                      <div className="stress-visual">
                        {word2Stresses.map((stress, idx) => (
                          <span
                            key={idx}
                            className={`stress-mark ${stress === 1 ? 'primary' : stress === 2 ? 'secondary' : 'unstressed'}`}
                          >
                            {stress === 1 ? '/' : stress === 2 ? '\\' : 'u'}
                          </span>
                        ))}
                      </div>
                      <div className="stress-description">{getStressDescription(word2Stresses)}</div>
                    </>
                  ) : (
                    <div className="stress-unknown">Pattern not available</div>
                  )}
                </div>
              </div>
              <div className="stress-legend">
                <span><strong>/</strong> = primary stress</span>
                <span><strong>\</strong> = secondary stress</span>
                <span><strong>u</strong> = unstressed</span>
              </div>
            </section>

            {/* Unique Synonyms */}
            <section className="compare-section">
              <h2>Unique Synonyms</h2>
              <p className="section-hint">Words associated with one but not the other</p>
              <div className="compare-grid synonyms-grid">
                <div className="compare-card">
                  <h3>Only "{displayWord1}"</h3>
                  {uniqueSynonyms.word1Only.length > 0 ? (
                    <div className="synonym-list">
                      {uniqueSynonyms.word1Only.map(syn => (
                        <Link
                          key={syn.word}
                          to={`/synonyms/${encodeURIComponent(syn.word)}`}
                          className="synonym-chip"
                        >
                          {syn.word}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="no-synonyms">No unique synonyms found</div>
                  )}
                </div>

                <div className="compare-card">
                  <h3>Only "{displayWord2}"</h3>
                  {uniqueSynonyms.word2Only.length > 0 ? (
                    <div className="synonym-list">
                      {uniqueSynonyms.word2Only.map(syn => (
                        <Link
                          key={syn.word}
                          to={`/synonyms/${encodeURIComponent(syn.word)}`}
                          className="synonym-chip"
                        >
                          {syn.word}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="no-synonyms">No unique synonyms found</div>
                  )}
                </div>
              </div>

              {uniqueSynonyms.shared.length > 0 && (
                <div className="shared-synonyms">
                  <h4>Shared Synonyms</h4>
                  <div className="synonym-list shared">
                    {uniqueSynonyms.shared.map(syn => (
                      <Link
                        key={syn.word}
                        to={`/synonyms/${encodeURIComponent(syn.word)}`}
                        className="synonym-chip shared"
                      >
                        {syn.word}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Rhymes */}
            <section className="compare-section">
              <h2>Rhymes</h2>
              <div className="compare-grid">
                <div className="compare-card">
                  <h3>Rhymes with "{displayWord1}"</h3>
                  {word1Rhymes.length > 0 ? (
                    <div className="rhyme-list">
                      {word1Rhymes.slice(0, 8).map(rhyme => (
                        <Link
                          key={rhyme.word}
                          to={`/rhymes/${encodeURIComponent(rhyme.word)}`}
                          className="rhyme-chip"
                        >
                          {rhyme.word}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="no-rhymes">No rhymes found</div>
                  )}
                  {word1Rhymes.length > 8 && (
                    <Link to={`/rhymes/${encodeURIComponent(word1)}`} className="see-all-link">
                      See all {word1Rhymes.length} rhymes
                    </Link>
                  )}
                </div>

                <div className="compare-card">
                  <h3>Rhymes with "{displayWord2}"</h3>
                  {word2Rhymes.length > 0 ? (
                    <div className="rhyme-list">
                      {word2Rhymes.slice(0, 8).map(rhyme => (
                        <Link
                          key={rhyme.word}
                          to={`/rhymes/${encodeURIComponent(rhyme.word)}`}
                          className="rhyme-chip"
                        >
                          {rhyme.word}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="no-rhymes">No rhymes found</div>
                  )}
                  {word2Rhymes.length > 8 && (
                    <Link to={`/rhymes/${encodeURIComponent(word2)}`} className="see-all-link">
                      See all {word2Rhymes.length} rhymes
                    </Link>
                  )}
                </div>
              </div>
            </section>

            {/* When to Use Each */}
            {(word1Connotation || word2Connotation) && (
              <section className="compare-section usage-section">
                <h2>When to Use Each Word</h2>
                <div className="usage-grid">
                  {word1Connotation && (
                    <div className="usage-card">
                      <h3>Use "{displayWord1}" when...</h3>
                      <ul>
                        <li><strong>Tone:</strong> {word1Connotation.tone}</li>
                        <li><strong>Best for:</strong> {word1Connotation.usage}</li>
                        <li><strong>Formality:</strong> {word1Connotation.formality}</li>
                      </ul>
                    </div>
                  )}
                  {word2Connotation && (
                    <div className="usage-card">
                      <h3>Use "{displayWord2}" when...</h3>
                      <ul>
                        <li><strong>Tone:</strong> {word2Connotation.tone}</li>
                        <li><strong>Best for:</strong> {word2Connotation.usage}</li>
                        <li><strong>Formality:</strong> {word2Connotation.formality}</li>
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Poetry Tips */}
            <section className="compare-section tips-section">
              <h2>Tips for Poets</h2>
              <div className="tips-content">
                {word1Stresses.length !== word2Stresses.length && (
                  <p>
                    <strong>Meter consideration:</strong> "{displayWord1}" ({word1Stresses.length} syllables)
                    and "{displayWord2}" ({word2Stresses.length} syllables) have different lengths.
                    Choose based on your line's meter requirements.
                  </p>
                )}
                {word1Stresses.length === word2Stresses.length && word1Stresses.length > 0 && (
                  <p>
                    <strong>Same syllable count:</strong> Both words have {word1Stresses.length} syllables,
                    making them interchangeable for meter. Choose based on meaning and tone.
                  </p>
                )}
                <p>
                  <strong>Sound quality:</strong> Consider the vowel sounds and consonants.
                  "{displayWord1}" starts with a{/^[aeiou]/i.test(word1) ? 'n' : ''} {word1[0].toUpperCase()} sound,
                  while "{displayWord2}" starts with a{/^[aeiou]/i.test(word2) ? 'n' : ''} {word2[0].toUpperCase()} sound.
                </p>
              </div>
            </section>

            {/* Similar Comparisons */}
            {similarComparisons.length > 0 && (
              <section className="compare-section similar-section">
                <h2>Similar Comparisons</h2>
                <div className="comparison-links">
                  {similarComparisons.map(([w1, w2]) => (
                    <Link
                      key={`${w1}-${w2}`}
                      to={`/compare/${encodeURIComponent(w1)}-vs-${encodeURIComponent(w2)}`}
                      className="comparison-link"
                    >
                      {w1} vs {w2}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Actions */}
            <div className="compare-actions">
              <Link to={`/synonyms/${encodeURIComponent(word1)}`} className="action-link">
                More synonyms for "{displayWord1}"
              </Link>
              <Link to={`/synonyms/${encodeURIComponent(word2)}`} className="action-link">
                More synonyms for "{displayWord2}"
              </Link>
              <Link to="/" className="action-button primary">
                Use in Poetry Editor
              </Link>
            </div>
          </>
        )}

        <div className="back-to-thesaurus">
          <Link to="/synonyms">Back to Word Alternatives</Link>
        </div>
      </div>
    </Layout>
  );
}
