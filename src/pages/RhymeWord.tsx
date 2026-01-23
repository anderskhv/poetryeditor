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
type OriginalityFilter = 'all' | 'original' | 'fresh' | 'common' | 'overused' | 'cliche';
type WordTypeFilter = 'all' | 'noun' | 'verb' | 'adjective' | 'adverb';

// Map Datamuse tags to human-readable labels
const POS_LABELS: Record<string, string> = {
  n: 'noun',
  v: 'verb',
  adj: 'adjective',
  adv: 'adverb',
  u: 'unknown',
  prop: 'proper noun',
};

// Get word type from parts of speech array
function getWordType(partsOfSpeech?: string[]): string {
  if (!partsOfSpeech || partsOfSpeech.length === 0) return 'unknown';
  // Return the first recognized part of speech
  for (const pos of partsOfSpeech) {
    if (POS_LABELS[pos]) return POS_LABELS[pos];
  }
  return 'unknown';
}

export function RhymeWord() {
  const { word } = useParams<{ word: string }>();
  const [perfectRhymes, setPerfectRhymes] = useState<RhymeWordType[]>([]);
  const [nearRhymes, setNearRhymes] = useState<RhymeWordType[]>([]);
  const [synonyms, setSynonyms] = useState<SynonymWord[]>([]);
  const [antonyms, setAntonyms] = useState<SynonymWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'perfect' | 'near'>('perfect');
  const [meterFilter, setMeterFilter] = useState<MeterFilter>('all');
  const [originalityFilter, setOriginalityFilter] = useState<OriginalityFilter>('all');
  const [wordTypeFilter, setWordTypeFilter] = useState<WordTypeFilter>('all');
  // Hover states for highlighting (not filtering yet)
  const [hoverMeter, setHoverMeter] = useState<MeterFilter | null>(null);
  const [hoverOriginality, setHoverOriginality] = useState<OriginalityFilter | null>(null);
  const [hoverWordType, setHoverWordType] = useState<WordTypeFilter | null>(null);

  const decodedWord = word ? decodeURIComponent(word).toLowerCase() : '';
  const stresses = getStressPattern(decodedWord);
  const syllables = getSyllables(decodedWord);
  const syllableCount = stresses.length || syllables.length;

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);

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

          // Check if all results are empty (potential API failure)
          if (perfect.length === 0 && near.length === 0 && syns.length === 0 && ants.length === 0) {
            // Could be a word with no rhymes, or API failure
            // Only show error if we expected results
            console.warn(`No results found for "${decodedWord}" - this may be expected for unusual words`);
          }

          setPerfectRhymes(perfect);
          setNearRhymes(near);
          setSynonyms(syns);
          setAntonyms(ants);
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

  // Get originality category for a word
  const getOriginalityCategory = (rhymeWord: string): OriginalityFilter => {
    const score = getRhymeOriginalityScore(decodedWord, rhymeWord);
    if (score >= 80) return 'original';
    if (score >= 60) return 'fresh';
    if (score >= 40) return 'common';
    if (score >= 20) return 'overused';
    return 'cliche';
  };

  // Get word type category for a rhyme word
  const getWordTypeCategory = (rhyme: RhymeWordType): WordTypeFilter => {
    const wordType = getWordType(rhyme.partsOfSpeech);
    if (wordType === 'noun' || wordType === 'proper noun') return 'noun';
    if (wordType === 'verb') return 'verb';
    if (wordType === 'adjective') return 'adjective';
    if (wordType === 'adverb') return 'adverb';
    return 'all'; // unknown words pass all word type filters
  };

  // Check if a word matches a specific meter
  const matchesMeter = (rhymeWord: string, meter: MeterFilter): boolean => {
    if (meter === 'all') return true;
    if (meter === 'iambic') return fitsIambic(rhymeWord);
    if (meter === 'trochaic') return fitsTrochaic(rhymeWord);
    return true;
  };

  // Check if a word matches a specific originality level
  const matchesOriginality = (rhymeWord: string, originality: OriginalityFilter): boolean => {
    if (originality === 'all') return true;
    return getOriginalityCategory(rhymeWord) === originality;
  };

  // Check if a rhyme matches a specific word type
  const matchesWordType = (rhyme: RhymeWordType, wordType: WordTypeFilter): boolean => {
    if (wordType === 'all') return true;
    const category = getWordTypeCategory(rhyme);
    return category === wordType || category === 'all'; // unknown words match all
  };

  // Apply all filters
  const applyAllFilters = (rhymes: RhymeWordType[]): RhymeWordType[] => {
    return rhymes.filter(r =>
      matchesMeter(r.word, meterFilter) &&
      matchesOriginality(r.word, originalityFilter) &&
      matchesWordType(r, wordTypeFilter)
    );
  };

  // Check if a word should be highlighted (based on hover state)
  const shouldHighlight = (rhyme: RhymeWordType): boolean => {
    // If no hover state, no highlight
    if (!hoverMeter && !hoverOriginality && !hoverWordType) return false;

    // Check each hover filter - word must match ALL hovered filters
    if (hoverMeter && hoverMeter !== 'all' && !matchesMeter(rhyme.word, hoverMeter)) return false;
    if (hoverOriginality && hoverOriginality !== 'all' && !matchesOriginality(rhyme.word, hoverOriginality)) return false;
    if (hoverWordType && hoverWordType !== 'all' && !matchesWordType(rhyme, hoverWordType)) return false;

    return true;
  };

  // Check if ANY hover state is active (to dim non-matching words)
  const isHoverActive = hoverMeter !== null || hoverOriginality !== null || hoverWordType !== null;

  const filteredPerfect = applyAllFilters(perfectRhymes);
  const filteredNear = applyAllFilters(nearRhymes);

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

        {error ? (
          <div className="rhyme-error">
            <span className="error-icon">⚠</span>
            <span>{error}</span>
            <button onClick={() => window.location.reload()} className="retry-button">
              Try Again
            </button>
          </div>
        ) : loading ? (
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
              <div className="filter-group">
                <span className="filter-label">Meter:</span>
                <button
                  className={`filter-btn ${meterFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setMeterFilter('all')}
                  onMouseEnter={() => setHoverMeter('all')}
                  onMouseLeave={() => setHoverMeter(null)}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${meterFilter === 'iambic' ? 'active' : ''}`}
                  onClick={() => setMeterFilter('iambic')}
                  onMouseEnter={() => setHoverMeter('iambic')}
                  onMouseLeave={() => setHoverMeter(null)}
                  title="Words ending on a stressed syllable (da-DUM)"
                >
                  Iambic
                </button>
                <button
                  className={`filter-btn ${meterFilter === 'trochaic' ? 'active' : ''}`}
                  onClick={() => setMeterFilter('trochaic')}
                  onMouseEnter={() => setHoverMeter('trochaic')}
                  onMouseLeave={() => setHoverMeter(null)}
                  title="Words ending on an unstressed syllable (DUM-da)"
                >
                  Trochaic
                </button>
              </div>

              <div className="filter-group">
                <span className="filter-label">Originality:</span>
                <button
                  className={`filter-btn ${originalityFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setOriginalityFilter('all')}
                  onMouseEnter={() => setHoverOriginality('all')}
                  onMouseLeave={() => setHoverOriginality(null)}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${originalityFilter === 'original' ? 'active' : ''}`}
                  onClick={() => setOriginalityFilter('original')}
                  onMouseEnter={() => setHoverOriginality('original')}
                  onMouseLeave={() => setHoverOriginality(null)}
                  title="Unique, unexpected rhyme pairings"
                >
                  Original
                </button>
                <button
                  className={`filter-btn ${originalityFilter === 'fresh' ? 'active' : ''}`}
                  onClick={() => setOriginalityFilter('fresh')}
                  onMouseEnter={() => setHoverOriginality('fresh')}
                  onMouseLeave={() => setHoverOriginality(null)}
                  title="Less common rhyme pairings"
                >
                  Fresh
                </button>
                <button
                  className={`filter-btn ${originalityFilter === 'common' ? 'active' : ''}`}
                  onClick={() => setOriginalityFilter('common')}
                  onMouseEnter={() => setHoverOriginality('common')}
                  onMouseLeave={() => setHoverOriginality(null)}
                  title="Frequently used rhyme pairings"
                >
                  Common
                </button>
                <button
                  className={`filter-btn ${originalityFilter === 'cliche' ? 'active' : ''}`}
                  onClick={() => setOriginalityFilter('cliche')}
                  onMouseEnter={() => setHoverOriginality('cliche')}
                  onMouseLeave={() => setHoverOriginality(null)}
                  title="Overused rhyme pairings"
                >
                  Cliché
                </button>
              </div>

              <div className="filter-group">
                <span className="filter-label">Word Type:</span>
                <button
                  className={`filter-btn ${wordTypeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setWordTypeFilter('all')}
                  onMouseEnter={() => setHoverWordType('all')}
                  onMouseLeave={() => setHoverWordType(null)}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${wordTypeFilter === 'noun' ? 'active' : ''}`}
                  onClick={() => setWordTypeFilter('noun')}
                  onMouseEnter={() => setHoverWordType('noun')}
                  onMouseLeave={() => setHoverWordType(null)}
                  title="Nouns (person, place, thing)"
                >
                  Noun
                </button>
                <button
                  className={`filter-btn ${wordTypeFilter === 'verb' ? 'active' : ''}`}
                  onClick={() => setWordTypeFilter('verb')}
                  onMouseEnter={() => setHoverWordType('verb')}
                  onMouseLeave={() => setHoverWordType(null)}
                  title="Verbs (action words)"
                >
                  Verb
                </button>
                <button
                  className={`filter-btn ${wordTypeFilter === 'adjective' ? 'active' : ''}`}
                  onClick={() => setWordTypeFilter('adjective')}
                  onMouseEnter={() => setHoverWordType('adjective')}
                  onMouseLeave={() => setHoverWordType(null)}
                  title="Adjectives (describe nouns)"
                >
                  Adjective
                </button>
                <button
                  className={`filter-btn ${wordTypeFilter === 'adverb' ? 'active' : ''}`}
                  onClick={() => setWordTypeFilter('adverb')}
                  onMouseEnter={() => setHoverWordType('adverb')}
                  onMouseLeave={() => setHoverWordType(null)}
                  title="Adverbs (describe verbs)"
                >
                  Adverb
                </button>
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
                            // Determine if this word should be highlighted or dimmed
                            const highlighted = shouldHighlight(rhyme);
                            const dimmed = isHoverActive && !highlighted;

                            return (
                              <DefinitionTooltip key={idx} word={rhyme.word}>
                                <Link
                                  to={`/rhymes/${encodeURIComponent(rhyme.word)}`}
                                  className={`rhyme-word-item ${rarityClass} ${highlighted ? 'highlighted' : ''} ${dimmed ? 'dimmed' : ''}`}
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

              <div className="related-section topic-filter-promo">
                <h3>Need More Options?</h3>
                <p className="related-hint">Use the topic filter on the Rhyme Dictionary to find words that rhyme AND have a specific meaning</p>
                <Link to="/rhymes" className="topic-filter-link">
                  Use Topic Filter →
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
