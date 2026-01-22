import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { fetchRhymes, fetchNearAndSlantRhymes, fetchSynonyms, fetchAntonyms, RhymeWord as RhymeWordType, SynonymWord } from '../utils/rhymeApi';
import { loadCMUDictionary, isDictionaryLoaded, getStressPattern, getSyllables } from '../utils/cmuDict';
import { getRhymeOriginalityScore } from '../utils/rhymeCliches';
import { DefinitionTooltip } from '../components/DefinitionTooltip';
import './RhymeWord.css';

type MeterFilter = 'all' | 'iambic' | 'trochaic';

export function RhymeWord() {
  const { word } = useParams<{ word: string }>();
  const [perfectRhymes, setPerfectRhymes] = useState<RhymeWordType[]>([]);
  const [nearRhymes, setNearRhymes] = useState<RhymeWordType[]>([]);
  const [synonyms, setSynonyms] = useState<SynonymWord[]>([]);
  const [antonyms, setAntonyms] = useState<SynonymWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'perfect' | 'near'>('perfect');
  const [meterFilter, setMeterFilter] = useState<MeterFilter>('all');

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
        const [perfect, near, syns, ants] = await Promise.all([
          fetchRhymes(decodedWord),
          fetchNearAndSlantRhymes(decodedWord),
          fetchSynonyms(decodedWord),
          fetchAntonyms(decodedWord)
        ]);
        setPerfectRhymes(perfect);
        setNearRhymes(near);
        setSynonyms(syns);
        setAntonyms(ants);
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

  // Check if a word fits a specific meter pattern
  const fitsIambic = (rhymeWord: string): boolean => {
    const stress = getStressPattern(rhymeWord);
    if (stress.length === 0) return true; // Unknown words pass through
    if (stress.length === 1) return stress[0] >= 1; // Single syllable: stressed is good
    // For multi-syllable: last syllable should be stressed (ends on stressed)
    // Iambic: unstressed-STRESSED pattern
    return stress[stress.length - 1] >= 1;
  };

  const fitsTrochaic = (rhymeWord: string): boolean => {
    const stress = getStressPattern(rhymeWord);
    if (stress.length === 0) return true; // Unknown words pass through
    if (stress.length === 1) return stress[0] === 0; // Single syllable: unstressed is good
    // For multi-syllable: last syllable should be unstressed (ends on unstressed)
    // Trochaic: STRESSED-unstressed pattern
    return stress[stress.length - 1] === 0;
  };

  // Apply meter filter
  const filterByMeter = (rhymes: RhymeWordType[]): RhymeWordType[] => {
    if (meterFilter === 'all') return rhymes;
    if (meterFilter === 'iambic') return rhymes.filter(r => fitsIambic(r.word));
    if (meterFilter === 'trochaic') return rhymes.filter(r => fitsTrochaic(r.word));
    return rhymes;
  };

  const filteredPerfect = filterByMeter(perfectRhymes);
  const filteredNear = filterByMeter(nearRhymes);

  const groupedPerfect = groupBySyllables(filteredPerfect);
  const groupedNear = groupBySyllables(filteredNear);
  const activeResults = activeTab === 'perfect' ? groupedPerfect : groupedNear;

  // Get related words for internal linking - more varied selection
  const topRhymes = perfectRhymes
    .filter(r => !r.word.includes(' ') && r.score > 1000)
    .slice(0, 8)
    .map(r => r.word);

  // Get rhymes with same syllable count for "Same Length" section
  const sameSyllableRhymes = perfectRhymes
    .filter(r => !r.word.includes(' ') && r.numSyllables === syllableCount)
    .slice(0, 6)
    .map(r => r.word);

  // Get popular rhyme targets (common words poets search for)
  const popularRhymeTargets = ['love', 'heart', 'time', 'day', 'night', 'life', 'way', 'soul', 'mind', 'dream']
    .filter(w => w !== decodedWord)
    .slice(0, 5);

  // Capitalize first letter for display
  const displayWord = decodedWord.charAt(0).toUpperCase() + decodedWord.slice(1);

  // Get originality-based background color (grayscale: light = original, dark = cliché)
  const getOriginalityStyle = (rhymeWord: string): React.CSSProperties => {
    const score = getRhymeOriginalityScore(decodedWord, rhymeWord);
    // Score: 0-100 (100 = original/good, 0 = clichéd/bad)
    // Grayscale mapping: high score = lighter (more original), low score = darker (more clichéd)
    // Map score 0-100 to lightness 55%-98%
    const lightness = 55 + (score * 0.43); // 0 → 55%, 100 → 98%
    const backgroundColor = `hsl(0, 0%, ${lightness}%)`;
    return { backgroundColor };
  };

  // Get originality label for tooltip
  const getOriginalityLabel = (rhymeWord: string): string => {
    const score = getRhymeOriginalityScore(decodedWord, rhymeWord);
    if (score >= 80) return 'Original';
    if (score >= 60) return 'Fresh';
    if (score >= 40) return 'Common';
    if (score >= 20) return 'Overused';
    return 'Cliché';
  };

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
                Perfect Rhymes ({filteredPerfect.length})
              </button>
              <button
                className={`rhyme-tab ${activeTab === 'near' ? 'active' : ''}`}
                onClick={() => setActiveTab('near')}
              >
                Near Rhymes ({filteredNear.length})
              </button>
            </div>

            <div className="rhyme-filters">
              <div className="meter-filter">
                <span className="filter-label">Meter:</span>
                <button
                  className={`filter-btn ${meterFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setMeterFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${meterFilter === 'iambic' ? 'active' : ''}`}
                  onClick={() => setMeterFilter('iambic')}
                  title="Words ending on a stressed syllable (da-DUM)"
                >
                  Iambic
                </button>
                <button
                  className={`filter-btn ${meterFilter === 'trochaic' ? 'active' : ''}`}
                  onClick={() => setMeterFilter('trochaic')}
                  title="Words ending on an unstressed syllable (DUM-da)"
                >
                  Trochaic
                </button>
              </div>
              <div className="originality-legend">
                <span className="legend-label">Originality:</span>
                <span className="legend-item legend-original">Original</span>
                <span className="legend-gradient-grayscale"></span>
                <span className="legend-item legend-cliche">Cliché</span>
              </div>
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
                          .map((rhyme, idx) => {
                            // Determine rarity class based on Datamuse score
                            // Higher score = more common word
                            const rarityClass = rhyme.score > 5000 ? 'common' : rhyme.score > 1000 ? '' : 'rare';
                            return (
                              <DefinitionTooltip key={idx} word={rhyme.word}>
                                <Link
                                  to={`/rhymes/${encodeURIComponent(rhyme.word)}`}
                                  className={`rhyme-word-item ${rarityClass}`}
                                  style={getOriginalityStyle(rhyme.word)}
                                  title={`Originality: ${getOriginalityLabel(rhyme.word)}`}
                                >
                                  {rhyme.word}
                                </Link>
                              </DefinitionTooltip>
                            );
                          })}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="rhyme-actions">
              <Link to="/" className="rhyme-cta-button-wrapper">
                <span className="rhyme-cta-button">Open in Poetry Editor</span>
                <span className="rhyme-cta-tooltip">
                  Meter • Rhyme schemes • Clichés • Forms
                </span>
              </Link>
              <Link to={`/syllables/${encodeURIComponent(decodedWord)}`} className="rhyme-secondary-link">
                View syllable breakdown
              </Link>
            </div>

            {(synonyms.length > 0 || antonyms.length > 0) && (
              <div className="word-relations">
                {synonyms.length > 0 && (
                  <div className="relation-group">
                    <h3>Synonyms</h3>
                    <p className="relation-hint">Words with similar meaning to "{decodedWord}"</p>
                    <div className="relation-words">
                      {synonyms.slice(0, 10).map((syn) => (
                        <Link key={syn.word} to={`/rhymes/${syn.word}`} className="relation-word-link">
                          {syn.word}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {antonyms.length > 0 && (
                  <div className="relation-group">
                    <h3>Antonyms</h3>
                    <p className="relation-hint">Words with opposite meaning to "{decodedWord}"</p>
                    <div className="relation-words">
                      {antonyms.slice(0, 10).map((ant) => (
                        <Link key={ant.word} to={`/rhymes/${ant.word}`} className="relation-word-link antonym">
                          {ant.word}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="related-searches-expanded">
              {topRhymes.length > 0 && (
                <div className="related-section">
                  <h3>Also Try Rhymes With</h3>
                  <div className="related-words">
                    {topRhymes.map((w) => (
                      <Link key={w} to={`/rhymes/${w}`} className="related-word-link">
                        {w}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {sameSyllableRhymes.length > 0 && syllableCount > 0 && (
                <div className="related-section">
                  <h3>{syllableCount}-Syllable Rhymes</h3>
                  <p className="related-hint">Words with the same length as "{decodedWord}"</p>
                  <div className="related-words">
                    {sameSyllableRhymes.map((w) => (
                      <Link key={w} to={`/rhymes/${w}`} className="related-word-link same-length">
                        {w}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="related-section">
                <h3>Popular Searches</h3>
                <div className="related-words">
                  {popularRhymeTargets.map((w) => (
                    <Link key={w} to={`/rhymes/${w}`} className="related-word-link popular">
                      {w}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="related-section poet-maker-promo">
                <h3>Need More Options?</h3>
                <p className="related-hint">Find words that rhyme AND have a specific meaning</p>
                <Link to="/poet-maker" className="poet-maker-link">
                  Try Poet Maker →
                </Link>
              </div>
            </div>
          </>
        )}

        <div className="back-to-search">
          <Link to="/rhymes">← Back to Rhyme Dictionary</Link>
        </div>
      </div>
    </Layout>
  );
}
