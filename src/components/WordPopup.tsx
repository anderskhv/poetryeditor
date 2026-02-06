import { useState, useEffect, useRef } from 'react';
import { getStressPattern, getSyllables } from '../utils/cmuDict';
import { fetchRhymes, fetchNearAndSlantRhymes, fetchSynonymSenses, RhymeWord, SynonymSense } from '../utils/rhymeApi';
import { fetchWordInfo, type WordOrigin, type Pronunciation, type WordDefinition } from '../utils/wordInfoApi';
import './WordPopup.css';

interface WordPopupProps {
  word: string;
  position?: { top: number; left: number };
  onClose: () => void;
  onInsertWord?: (word: string) => void;
}

type Tab = 'rhymes' | 'nearrhymes' | 'synonyms' | 'syllables' | 'origin';

interface GroupedWords<T> {
  [syllables: number]: T[];
}

export function WordPopup({ word, position, onClose, onInsertWord }: WordPopupProps) {
  const [activeTab, setActiveTab] = useState<Tab>('syllables');
  const [rhymes, setRhymes] = useState<RhymeWord[]>([]);
  const [nearRhymes, setNearRhymes] = useState<RhymeWord[]>([]);
  const [synonymSenses, setSynonymSenses] = useState<SynonymSense[]>([]);
  const [pendingInsert, setPendingInsert] = useState<string | null>(null);
  const [loadingRhymes, setLoadingRhymes] = useState(false);
  const [loadingNearRhymes, setLoadingNearRhymes] = useState(false);
  const [loadingSynonyms, setLoadingSynonyms] = useState(false);
  const [wordOrigin, setWordOrigin] = useState<WordOrigin | null>(null);
  const [wordDefinitions, setWordDefinitions] = useState<WordDefinition[]>([]);
  const [pronunciation, setPronunciation] = useState<Pronunciation | null>(null);
  const [loadingWordInfo, setLoadingWordInfo] = useState(false);
  const [wordInfoLoaded, setWordInfoLoaded] = useState(false);
  const [wordInfoSlow, setWordInfoSlow] = useState(false);
  const [wordInfoError, setWordInfoError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const slowTimerRef = useRef<number | null>(null);
  const hardTimeoutRef = useRef<number | null>(null);
  const wordRef = useRef<string>(word);
  const requestIdRef = useRef<number>(0);

  const stresses = getStressPattern(word);
  const syllableCount = stresses.length;
  const syllables = getSyllables(word);

  useEffect(() => {
    wordRef.current = word;
    if (hardTimeoutRef.current) {
      window.clearTimeout(hardTimeoutRef.current);
      hardTimeoutRef.current = null;
    }
    setRhymes([]);
    setNearRhymes([]);
    setSynonymSenses([]);
    setLoadingRhymes(false);
    setLoadingNearRhymes(false);
    setLoadingSynonyms(false);
    setWordOrigin(null);
    setWordDefinitions([]);
    setPronunciation(null);
    setLoadingWordInfo(false);
    setWordInfoLoaded(false);
    setWordInfoSlow(false);
    setWordInfoError(null);
    setPendingInsert(null);
  }, [word]);

  // Group rhymes by syllable count
  const groupedRhymes: GroupedWords<RhymeWord> = rhymes.reduce((acc, rhyme) => {
    const sylCount = rhyme.numSyllables || 0;
    if (!acc[sylCount]) acc[sylCount] = [];
    acc[sylCount].push(rhyme);
    return acc;
  }, {} as GroupedWords<RhymeWord>);

  // Group near rhymes by syllable count
  const groupedNearRhymes: GroupedWords<RhymeWord> = nearRhymes.reduce((acc, rhyme) => {
    const sylCount = rhyme.numSyllables || 0;
    if (!acc[sylCount]) acc[sylCount] = [];
    acc[sylCount].push(rhyme);
    return acc;
  }, {} as GroupedWords<RhymeWord>);

  // Fetch rhymes when the rhymes tab is active
  useEffect(() => {
    if (activeTab === 'rhymes' && rhymes.length === 0 && !loadingRhymes) {
      setLoadingRhymes(true);
      fetchRhymes(word).then((result) => {
        setRhymes(result);
        setLoadingRhymes(false);
      });
    }
  }, [activeTab, word, rhymes.length, loadingRhymes]);

  // Fetch near rhymes when the near rhymes tab is active
  useEffect(() => {
    if (activeTab === 'nearrhymes' && nearRhymes.length === 0 && !loadingNearRhymes) {
      setLoadingNearRhymes(true);
      fetchNearAndSlantRhymes(word).then((result) => {
        setNearRhymes(result);
        setLoadingNearRhymes(false);
      });
    }
  }, [activeTab, word, nearRhymes.length, loadingNearRhymes]);

  // Fetch synonyms when the synonyms tab is active
  useEffect(() => {
    if (activeTab === 'synonyms' && synonymSenses.length === 0 && !loadingSynonyms) {
      setLoadingSynonyms(true);
      fetchSynonymSenses(word).then((result) => {
        setSynonymSenses(result);
        setLoadingSynonyms(false);
      });
    }
  }, [activeTab, word, synonymSenses.length, loadingSynonyms]);

  const loadWordInfo = () => {
    setLoadingWordInfo(true);
    setWordInfoError(null);
    setWordInfoSlow(false);
    if (slowTimerRef.current) {
      window.clearTimeout(slowTimerRef.current);
    }
    if (hardTimeoutRef.current) {
      window.clearTimeout(hardTimeoutRef.current);
      hardTimeoutRef.current = null;
    }
    const requestWord = word;
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    slowTimerRef.current = window.setTimeout(() => {
      setWordInfoSlow(true);
    }, 2000);

    hardTimeoutRef.current = window.setTimeout(() => {
      if (requestId !== requestIdRef.current) return;
      setLoadingWordInfo(false);
      setWordInfoLoaded(true);
      setWordInfoError('Definition service timed out. Try again.');
    }, 6500);

    fetchWordInfo(word).then((result) => {
      if (slowTimerRef.current) {
        window.clearTimeout(slowTimerRef.current);
        slowTimerRef.current = null;
      }
      if (requestWord !== wordRef.current) return;
      if (requestId !== requestIdRef.current) return;
      if (hardTimeoutRef.current) {
        window.clearTimeout(hardTimeoutRef.current);
        hardTimeoutRef.current = null;
      }
      if (result) {
        setWordOrigin(result.origin);
        setWordDefinitions(result.definitions);
        setPronunciation(result.pronunciation);
      } else {
        setWordInfoError('Definition service is unavailable. Try again.');
      }
      setWordInfoLoaded(true);
      setLoadingWordInfo(false);
    });
  };

  // Fetch word info (origin + pronunciation) when origin tab is active or on mount for audio
  useEffect(() => {
    if ((activeTab === 'origin' || !wordInfoLoaded) && !loadingWordInfo) {
      loadWordInfo();
    }
  }, [activeTab, word, wordInfoLoaded, loadingWordInfo]);

  useEffect(() => {
    return () => {
      if (slowTimerRef.current) {
        window.clearTimeout(slowTimerRef.current);
      }
      if (hardTimeoutRef.current) {
        window.clearTimeout(hardTimeoutRef.current);
      }
    };
  }, []);

  // Handle audio playback
  const playAudio = () => {
    if (pronunciation?.audioUrl && audioRef.current) {
      audioRef.current.src = pronunciation.audioUrl;
      audioRef.current.play();
    }
  };

  return (
    <>
      <div className="word-popup-overlay" onClick={onClose} />
      <div
        className="word-popup"
        style={position ? { top: `${position.top}px`, left: `${position.left}px` } : undefined}
      >
        <div className="word-popup-header">
          <div className="word-popup-title">
            <h3>{word}</h3>
            {pronunciation?.audioUrl && (
              <button className="speaker-icon-btn" onClick={playAudio} title="Play pronunciation">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              </button>
            )}
            {pronunciation?.text && (
              <span className="header-phonetic">{pronunciation.text}</span>
            )}
          </div>
          <button className="word-popup-close" onClick={onClose}>×</button>
          <audio ref={audioRef} />
        </div>

        <div className="word-popup-tabs">
          <button
            className={`word-popup-tab ${activeTab === 'rhymes' ? 'active' : ''}`}
            onClick={() => setActiveTab('rhymes')}
          >
            Rhymes
          </button>
          <button
            className={`word-popup-tab ${activeTab === 'nearrhymes' ? 'active' : ''}`}
            onClick={() => setActiveTab('nearrhymes')}
          >
            Near Rhymes
          </button>
          <button
            className={`word-popup-tab ${activeTab === 'synonyms' ? 'active' : ''}`}
            onClick={() => setActiveTab('synonyms')}
          >
            Synonyms
          </button>
          <button
            className={`word-popup-tab ${activeTab === 'syllables' ? 'active' : ''}`}
            onClick={() => setActiveTab('syllables')}
          >
            Syllables
          </button>
          <button
            className={`word-popup-tab ${activeTab === 'origin' ? 'active' : ''}`}
            onClick={() => setActiveTab('origin')}
          >
            Definition
          </button>
        </div>

        <div className="word-popup-content">
          {activeTab === 'rhymes' && (
            <div className="word-popup-section">
              {loadingRhymes ? (
                <p className="loading">Loading rhymes...</p>
              ) : rhymes.length > 0 ? (
                <div className="grouped-words">
                  {Object.keys(groupedRhymes)
                    .sort((a, b) => Number(a) - Number(b))
                    .map((sylCount) => {
                      const filteredRhymes = groupedRhymes[Number(sylCount)].filter(rhyme => !rhyme.word.includes(' '));
                      if (filteredRhymes.length === 0) return null;

                      return (
                        <div key={sylCount} className="syllable-group">
                          <h4 className="group-header">
                            {sylCount} {Number(sylCount) === 1 ? 'syllable' : 'syllables'}
                          </h4>
                          <div className="word-list">
                            {filteredRhymes
                              .sort((a, b) => {
                                // Sort by rhyme quality first (higher is better)
                                const qualityDiff = (b.rhymeQuality || 0) - (a.rhymeQuality || 0);
                                if (Math.abs(qualityDiff) > 0.1) return qualityDiff;
                                // Then by word frequency (score)
                                return b.score - a.score;
                              })
                              .map((rhyme, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className="word-item word-item-button"
                                  onClick={() => setPendingInsert(rhyme.word)}
                                  title="Insert and copy"
                                >
                                  <span className="word-text">{rhyme.word}</span>
                                  <span className="word-meta">#{idx + 1}</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="no-data">No rhymes found</p>
              )}
            </div>
          )}

          {activeTab === 'nearrhymes' && (
            <div className="word-popup-section">
              {loadingNearRhymes ? (
                <p className="loading">Loading near rhymes & slant rhymes...</p>
              ) : nearRhymes.length > 0 ? (
                <div className="grouped-words">
                  {Object.keys(groupedNearRhymes)
                    .sort((a, b) => Number(a) - Number(b))
                    .map((sylCount) => {
                      const filteredRhymes = groupedNearRhymes[Number(sylCount)].filter(rhyme => !rhyme.word.includes(' '));
                      if (filteredRhymes.length === 0) return null;

                      return (
                        <div key={sylCount} className="syllable-group">
                          <h4 className="group-header">
                            {sylCount} {Number(sylCount) === 1 ? 'syllable' : 'syllables'}
                          </h4>
                          <div className="word-list">
                            {filteredRhymes
                              .sort((a, b) => b.score - a.score)
                              .map((rhyme, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className="word-item word-item-button"
                                  onClick={() => setPendingInsert(rhyme.word)}
                                  title="Insert and copy"
                                >
                                  <span className="word-text">{rhyme.word}</span>
                                  <span className="word-meta">#{idx + 1}</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="no-data">No near rhymes or slant rhymes found</p>
              )}
            </div>
          )}

          {activeTab === 'synonyms' && (
            <div className="word-popup-section">
              {loadingSynonyms ? (
                <p className="loading">Loading synonyms...</p>
              ) : synonymSenses.length > 0 ? (
                <div className="grouped-words">
                  {synonymSenses.map((sense, senseIdx) => (
                    <div key={`${senseIdx}-${sense.gloss}`} className="meaning-group">
                      <div className="meaning-header">
                        <span className="meaning-title">Meaning {senseIdx + 1}</span>
                        {sense.pos && <span className="meaning-pos">{sense.pos}</span>}
                      </div>
                      <div className="meaning-gloss">{sense.gloss}</div>
                      <div className="word-list">
                        {sense.synonyms
                          .filter((synonym) => !synonym.word.includes(' '))
                          .sort((a, b) => b.score - a.score)
                          .map((synonym, idx) => (
                            <button
                              key={`${synonym.word}-${idx}`}
                              type="button"
                              className="word-item word-item-button"
                              onClick={() => setPendingInsert(synonym.word)}
                              title="Insert and copy"
                            >
                              <span className="word-text">{synonym.word}</span>
                              <span className="word-meta">#{idx + 1}</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No synonyms found</p>
              )}
            </div>
          )}

          {activeTab === 'syllables' && (
            <div className="word-popup-section">
              {syllableCount > 0 && syllables.length > 0 ? (
                <>
                  <div className="syllable-info">
                    <strong>{syllableCount}</strong> {syllableCount === 1 ? 'syllable' : 'syllables'}
                  </div>
                  <div className="syllable-breakdown">
                    {syllables.map((syllable, idx) => {
                      const stress = stresses[idx] || 0;
                      // Only capitalize first letter of entire word
                      const displaySyl = idx === 0
                        ? syllable.charAt(0).toUpperCase() + syllable.slice(1).toLowerCase()
                        : syllable.toLowerCase();
                      return (
                        <span key={idx}>
                          <span
                            className={`syllable-text ${
                              stress === 1 ? 'primary-stress' : stress === 2 ? 'secondary-stress' : 'unstressed'
                            }`}
                          >
                            {displaySyl}
                          </span>
                          {idx < syllables.length - 1 && <span className="syllable-separator">-</span>}
                        </span>
                      );
                    })}
                  </div>
                  <div className="stress-explainer">
                    <p><strong className="primary-stress">Primary stress</strong> (underlined + bold): The strongest emphasis</p>
                    <p><strong className="secondary-stress">Secondary stress</strong> (bold): Moderate emphasis</p>
                    <p><span className="unstressed">Unstressed</span> (normal): Weak or no emphasis</p>
                  </div>
                </>
              ) : (
                <p className="no-data">No stress data available for this word</p>
              )}
            </div>
          )}

          {activeTab === 'origin' && (
            <div className="word-popup-section">
              {loadingWordInfo ? (
                <p className="loading">{wordInfoSlow ? 'Still loading definition...' : 'Loading definition...'}</p>
              ) : wordOrigin || wordDefinitions.length > 0 ? (
                <div className="word-origin">
                  {wordDefinitions.length > 0 && (
                    <div className="word-definitions">
                      {wordDefinitions.map((def, idx) => (
                        <div key={idx} className="definition-group">
                          <div className="origin-pos">
                            <em>{def.partOfSpeech}</em>
                          </div>
                          <ul className="definition-list">
                            {def.definitions.map((d, dIdx) => (
                              <li key={dIdx}>{d}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                  {wordOrigin && (
                    <>
                      <div className="origin-label">Etymology</div>
                      <div className="origin-text">
                        {wordOrigin.origin}
                      </div>
                    </>
                  )}
                </div>
              ) : wordInfoError ? (
                <div className="word-info-error">
                  <p className="no-data">{wordInfoError}</p>
                  <button
                    type="button"
                    className="retry-word-info"
                    onClick={() => {
                      setWordInfoLoaded(false);
                      loadWordInfo();
                    }}
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <p className="no-data">No information available for this word</p>
              )}
            </div>
          )}

          {pendingInsert && (
            <div className="insert-confirm">
              <span className="insert-text">Insert "{pendingInsert}"?</span>
              <div className="insert-actions">
                <button
                  type="button"
                  className="insert-btn"
                  onClick={() => {
                    onInsertWord?.(pendingInsert);
                    setPendingInsert(null);
                  }}
                >
                  Insert
                </button>
                <button
                  type="button"
                  className="insert-cancel"
                  onClick={() => setPendingInsert(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
