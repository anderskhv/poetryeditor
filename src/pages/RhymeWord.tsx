import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { fetchRhymes, fetchNearAndSlantRhymes, fetchSynonyms, fetchAntonyms, getWordVariants, RhymeWord as RhymeWordType, SynonymWord } from '../utils/rhymeApi';
import { loadCMUDictionary, isDictionaryLoaded, getStressPattern, getSyllables } from '../utils/cmuDict';
import { getRhymeOriginalityScore } from '../utils/rhymeCliches';
import { DefinitionTooltip } from '../components/DefinitionTooltip';
import { getWordEnhancement } from '../data/wordEnhancements';
import { rhymeCategories } from './RhymeCategoryPage';
import './RhymeWord.css';

type MeterFilter = 'all' | 'iambic' | 'trochaic';
type OriginalityFilter = 'all' | 'original' | 'fresh' | 'common' | 'overused' | 'cliche';
type WordTypeFilter = 'all' | 'noun' | 'verb' | 'adjective' | 'adverb';
type SortMode = 'syllables' | 'topic';

// Map Datamuse tags to human-readable labels
const POS_LABELS: Record<string, string> = {
  n: 'noun',
  v: 'verb',
  adj: 'adjective',
  adv: 'adverb',
  u: 'unknown',
  prop: 'proper noun',
};

const RHYME_CATEGORY_LIST = Object.entries(rhymeCategories).map(([key, data]) => ({
  key,
  title: data.title,
  words: new Set(data.words.map(word => word.toLowerCase())),
}));

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
  const [topicWord, setTopicWord] = useState('');
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
  const [sortMode, setSortMode] = useState<SortMode>('syllables');

  const decodedWord = word ? decodeURIComponent(word).toLowerCase() : '';
  const topicTerm = topicWord.trim().toLowerCase();
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

  const groupByTopic = (rhymes: RhymeWordType[]) => {
    const groups = new Map<string, RhymeWordType[]>();

    rhymes.forEach((rhyme) => {
      const lowerWord = rhyme.word.toLowerCase();
      const category = RHYME_CATEGORY_LIST.find((entry) => entry.words.has(lowerWord));
      const groupKey = category ? category.key : 'other';
      const current = groups.get(groupKey) ?? [];
      current.push(rhyme);
      groups.set(groupKey, current);
    });

    const orderedGroups = RHYME_CATEGORY_LIST
      .filter(entry => groups.has(entry.key))
      .map(entry => ({
        key: entry.key,
        title: entry.title,
        items: groups.get(entry.key) ?? [],
      }));

    if (groups.has('other')) {
      orderedGroups.push({
        key: 'other',
        title: 'Other',
        items: groups.get('other') ?? [],
      });
    }

    orderedGroups.forEach(group => {
      group.items.sort((a, b) => {
        const aSyl = a.numSyllables || 0;
        const bSyl = b.numSyllables || 0;
        if (aSyl !== bSyl) return aSyl - bSyl;
        return a.word.localeCompare(b.word);
      });
    });

    return orderedGroups;
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

  const applyTopicFilter = (rhymes: RhymeWordType[]): RhymeWordType[] => {
    if (!topicTerm) return rhymes;
    return rhymes.filter(r => r.word.toLowerCase().includes(topicTerm));
  };

  const filteredPerfect = applyTopicFilter(applyAllFilters(perfectRhymes));
  const filteredNear = applyTopicFilter(applyAllFilters(nearRhymes));

  const withVariants = (rhymes: RhymeWordType[]) =>
    rhymes.map(rhyme => ({
      ...rhyme,
      variants: getWordVariants(rhyme.word, rhyme.partsOfSpeech || []),
    }));

  const perfectWithVariants = withVariants(filteredPerfect);
  const nearWithVariants = withVariants(filteredNear);

  const groupedPerfect = groupBySyllables(perfectWithVariants);
  const groupedNear = groupBySyllables(nearWithVariants);
  const groupedPerfectByTopic = groupByTopic(perfectWithVariants);
  const groupedNearByTopic = groupByTopic(nearWithVariants);

  const activeResults = activeTab === 'perfect' ? groupedPerfect : groupedNear;
  const activeTopicGroups = activeTab === 'perfect' ? groupedPerfectByTopic : groupedNearByTopic;

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
        title={`Rhymes with ${displayWord} (${perfectRhymes.length + nearRhymes.length}+) - Perfect & Near Rhymes`}
        description={`Find ${perfectRhymes.length}+ perfect rhymes and ${nearRhymes.length}+ near rhymes for "${decodedWord}". Organized by syllable count with meter filters for poets and songwriters.`}
        canonicalPath={`/rhymes/${encodeURIComponent(decodedWord)}`}
        keywords={`rhymes with ${decodedWord}, ${decodedWord} rhymes, words that rhyme with ${decodedWord}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": `Words That Rhyme with ${displayWord}`,
          "description": `Perfect and near rhymes for "${decodedWord}" organized by syllable count`,
          "numberOfItems": perfectRhymes.length + nearRhymes.length,
          "itemListElement": perfectRhymes
            .filter(r => !r.word.includes(' ') && r.score > 1000)
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
          <span>{displayWord}</span>
        </nav>

        <h1>Words That Rhyme with {displayWord}</h1>

        <div className="rhyme-topic-row">
          <label className="rhyme-topic-label" htmlFor="rhyme-topic-input">Topic</label>
          <input
            id="rhyme-topic-input"
            type="text"
            value={topicWord}
            onChange={(e) => setTopicWord(e.target.value)}
            placeholder="Type a topic (optional)"
            className="rhyme-topic-input"
          />
        </div>

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

            <div className="filter-bar">
              <div className="filter-item">
                <label className="filter-label">Meter</label>
                <select
                  value={meterFilter}
                  onChange={(e) => setMeterFilter(e.target.value as MeterFilter)}
                  className="filter-select"
                >
                  <option value="all">Any</option>
                  <option value="iambic">Iambic</option>
                  <option value="trochaic">Trochaic</option>
                </select>
              </div>

              <div className="filter-item">
                <label className="filter-label">Originality</label>
                <select
                  value={originalityFilter}
                  onChange={(e) => setOriginalityFilter(e.target.value as OriginalityFilter)}
                  className="filter-select"
                >
                  <option value="all">Any</option>
                  <option value="original">Original</option>
                  <option value="fresh">Fresh</option>
                  <option value="common">Common</option>
                  <option value="overused">Overused</option>
                  <option value="cliche">Cliché</option>
                </select>
              </div>

              <div className="filter-item">
                <label className="filter-label">Word Type</label>
                <select
                  value={wordTypeFilter}
                  onChange={(e) => setWordTypeFilter(e.target.value as WordTypeFilter)}
                  className="filter-select"
                >
                  <option value="all">Any</option>
                  <option value="noun">Noun</option>
                  <option value="verb">Verb</option>
                  <option value="adjective">Adjective</option>
                  <option value="adverb">Adverb</option>
                </select>
              </div>

              <div className="filter-item">
                <label className="filter-label">Group</label>
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className="filter-select"
                >
                  <option value="syllables">Syllables</option>
                  <option value="topic">Topic</option>
                </select>
              </div>

              {topicTerm && (
                <div className="filter-item filter-topic-pill">
                  <span className="filter-label">Topic</span>
                  <span className="topic-pill">{topicTerm}</span>
                </div>
              )}

              {(meterFilter !== 'all' || originalityFilter !== 'all' || wordTypeFilter !== 'all' || topicTerm) && (
                <button
                  type="button"
                  onClick={() => {
                    setMeterFilter('all');
                    setOriginalityFilter('all');
                    setWordTypeFilter('all');
                    setTopicWord('');
                  }}
                  className="clear-filters-btn"
                >
                  Clear
                </button>
              )}
            </div>

            {sortMode === 'syllables' && Object.keys(activeResults).length === 0 ? (
              <div className="rhyme-no-results">
                No {activeTab === 'perfect' ? 'perfect' : 'near'} rhymes found for "{decodedWord}".
                {activeTab === 'perfect' && nearRhymes.length > 0 && (
                  <> Try <button onClick={() => setActiveTab('near')} className="link-button">near rhymes</button> instead.</>
                )}
              </div>
            ) : sortMode === 'topic' && activeTopicGroups.length === 0 ? (
              <div className="rhyme-no-results">
                No {activeTab === 'perfect' ? 'perfect' : 'near'} rhymes found for "{decodedWord}".
                {activeTab === 'perfect' && nearRhymes.length > 0 && (
                  <> Try <button onClick={() => setActiveTab('near')} className="link-button">near rhymes</button> instead.</>
                )}
              </div>
            ) : sortMode === 'syllables' ? (
              <div className="rhyme-results">
                {Object.keys(activeResults)
                  .sort((a, b) => Number(a) - Number(b))
                  .map((sylCount) => (
                    <div key={sylCount} className="rhyme-syllable-group">
                      <h2>
                        <Link
                          to={`/rhymes/${encodeURIComponent(decodedWord)}/${sylCount}-syllables`}
                          className="syllable-header-link"
                        >
                          {sylCount} {Number(sylCount) === 1 ? 'syllable' : 'syllables'}
                        </Link>
                      </h2>
                      <div className="rhyme-word-list">
                        {activeResults[Number(sylCount)]
                          .filter(r => !r.word.includes(' '))
                          .map((rhyme, idx) => {
                            // Determine rarity class based on Datamuse score
                            // Higher score = more common word
                            const rarityClass = rhyme.score > 5000 ? 'common' : rhyme.score > 1000 ? '' : 'rare';
                            const variants = (rhyme as RhymeWordType & { variants?: string[] }).variants || [];

                            return (
                              <div key={idx} className="rhyme-word-stack">
                                <DefinitionTooltip word={rhyme.word}>
                                  <Link
                                    to={`/rhymes/${encodeURIComponent(rhyme.word)}`}
                                    className={`rhyme-word-item ${rarityClass}`}
                                  >
                                    {rhyme.word}
                                  </Link>
                                </DefinitionTooltip>
                                {variants.length > 0 && (
                                  <div className="rhyme-variants">
                                    {variants.slice(0, 4).map(variant => (
                                      <Link
                                        key={variant}
                                        to={`/rhymes/${encodeURIComponent(variant)}`}
                                        className="rhyme-variant-pill"
                                      >
                                        {variant}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="rhyme-results topic-groups">
                {activeTopicGroups.map((group) => (
                  <div key={group.key} className="rhyme-topic-group">
                    <h2>{group.title}</h2>
                    <div className="rhyme-word-list">
                      {group.items
                        .filter(r => !r.word.includes(' '))
                        .map((rhyme, idx) => {
                          const rarityClass = rhyme.score > 5000 ? 'common' : rhyme.score > 1000 ? '' : 'rare';
                          const variants = (rhyme as RhymeWordType & { variants?: string[] }).variants || [];

                          return (
                            <div key={idx} className="rhyme-word-stack">
                              <DefinitionTooltip word={rhyme.word}>
                                <Link
                                  to={`/rhymes/${encodeURIComponent(rhyme.word)}`}
                                  className={`rhyme-word-item ${rarityClass}`}
                                >
                                  {rhyme.word}
                                </Link>
                              </DefinitionTooltip>
                              {variants.length > 0 && (
                                <div className="rhyme-variants">
                                  {variants.slice(0, 4).map(variant => (
                                    <Link
                                      key={variant}
                                      to={`/rhymes/${encodeURIComponent(variant)}`}
                                      className="rhyme-variant-pill"
                                    >
                                      {variant}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
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

            {/* Enhanced content: Example sentences and poetry quotes */}
            {(() => {
              const enhancement = getWordEnhancement(decodedWord);
              if (!enhancement) return null;
              return (
                <div className="word-enhancements">
                  {enhancement.poetryQuotes.length > 0 && (
                    <div className="enhancement-section poetry-quotes">
                      <h3>"{displayWord}" in Famous Poetry</h3>
                      <div className="quotes-list">
                        {enhancement.poetryQuotes.map((quote, idx) => (
                          <blockquote key={idx} className="poetry-quote">
                            <p>"{quote.quote}"</p>
                            <cite>
                              — {quote.poet}, {quote.poemSlug ? (
                                <Link to={`/poems/${quote.poemSlug}`}>{quote.poem}</Link>
                              ) : (
                                <em>{quote.poem}</em>
                              )}
                            </cite>
                          </blockquote>
                        ))}
                      </div>
                    </div>
                  )}
                  {enhancement.exampleSentences.length > 0 && (
                    <div className="enhancement-section example-sentences">
                      <h3>Example Sentences</h3>
                      <ul className="sentences-list">
                        {enhancement.exampleSentences.map((sentence, idx) => (
                          <li key={idx}>{sentence}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {enhancement.relatedPairs.length > 0 && (
                    <div className="enhancement-section rhyme-pairs">
                      <h3>Common Rhyme Pairs</h3>
                      <div className="pairs-list">
                        {enhancement.relatedPairs.map((pair, idx) => (
                          <Link
                            key={idx}
                            to={`/rhymes/${pair.word1}-and-${pair.word2}`}
                            className="rhyme-pair-link"
                          >
                            {pair.word1} / {pair.word2}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

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
