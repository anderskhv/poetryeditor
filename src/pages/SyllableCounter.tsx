import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { loadCMUDictionary, isDictionaryLoaded, getStressPattern, getSyllables } from '../utils/cmuDict';
import './SyllableCounter.css';

const TRICKY_WORDS = [
  { word: 'beautiful', syllables: 3 },
  { word: 'comfortable', syllables: 4 },
  { word: 'interesting', syllables: 4 },
  { word: 'chocolate', syllables: 3 },
  { word: 'different', syllables: 3 },
  { word: 'every', syllables: 3 },
  { word: 'business', syllables: 2 },
  { word: 'poem', syllables: 2 },
  { word: 'fire', syllables: 1 },
  { word: 'hour', syllables: 1 },
  { word: 'real', syllables: 1 },
  { word: 'flower', syllables: 2 },
];

interface WordResult {
  word: string;
  syllables: string[];
  stresses: number[];
  count: number;
}

export function SyllableCounter() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<WordResult[]>([]);
  const [totalSyllables, setTotalSyllables] = useState(0);
  const [dictionaryLoaded, setDictionaryLoaded] = useState(isDictionaryLoaded());
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDict() {
      if (!isDictionaryLoaded()) {
        await loadCMUDictionary();
        setDictionaryLoaded(true);
      }
    }
    loadDict();
  }, []);

  const analyzeText = () => {
    if (!input.trim()) {
      setResults([]);
      setTotalSyllables(0);
      return;
    }

    const words = input.trim().split(/\s+/).filter(w => /[a-zA-Z]/.test(w));
    const wordResults: WordResult[] = [];
    let total = 0;

    for (const rawWord of words) {
      const word = rawWord.toLowerCase().replace(/[^a-z'-]/g, '');
      if (!word) continue;

      const stresses = getStressPattern(word);
      const syllables = getSyllables(word);
      const count = stresses.length || syllables.length || 1;

      wordResults.push({
        word: rawWord,
        syllables: syllables.length > 0 ? syllables : [word],
        stresses,
        count,
      });

      total += count;
    }

    setResults(wordResults);
    setTotalSyllables(total);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If it's a single word, navigate to the word page
    const trimmed = input.trim();
    if (trimmed && !trimmed.includes(' ')) {
      navigate(`/syllables/${encodeURIComponent(trimmed.toLowerCase())}`);
    } else {
      analyzeText();
    }
  };

  // Real-time analysis
  useEffect(() => {
    if (dictionaryLoaded) {
      analyzeText();
    }
  }, [input, dictionaryLoaded]);

  return (
    <Layout>
      <SEOHead
        title="Syllable Counter - Count Syllables in Any Word"
        description="Free online syllable counter. Count syllables in words, sentences, or poems. See syllable breakdown and stress patterns for poetry and songwriting."
        canonicalPath="/syllables"
        keywords="syllable counter, count syllables, how many syllables, syllable breakdown, stress pattern, poetry syllables"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How do you count syllables in a word?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Count the vowel sounds (not letters) in the word. Subtract silent vowels (like the 'e' at the end of 'cake') and vowel pairs that make one sound (like 'ou' in 'soup'). Our syllable counter uses the CMU Pronouncing Dictionary for accurate counts based on actual pronunciation."
              }
            },
            {
              "@type": "Question",
              "name": "What is a stress pattern in poetry?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A stress pattern shows which syllables are emphasized (stressed) when pronouncing a word. Primary stress is the main emphasis, secondary stress is a lighter emphasis, and unstressed syllables are spoken more softly. Understanding stress patterns helps with writing metered poetry."
              }
            },
            {
              "@type": "Question",
              "name": "Why do some words have different syllable counts?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Some words vary in syllable count based on dialect or speech patterns. For example, 'caramel' can be 2 or 3 syllables, 'fire' can be 1 or 2, and 'comfortable' can be 3 or 4. Our counter uses standard American English pronunciation."
              }
            },
            {
              "@type": "Question",
              "name": "How many syllables are in common tricky words?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Some commonly mispronounced words: 'beautiful' has 3 syllables, 'interesting' has 4, 'chocolate' has 3, 'different' has 3, 'business' has 2, 'poem' has 2, 'fire' has 1 (in most American dialects), and 'hour' has 1."
              }
            }
          ]
        }}
      />

      <div className="syllable-counter">
        <h1>Syllable Counter</h1>
        <p className="syllable-counter-subtitle">
          Count syllables in any word or text. See stress patterns for poetry.
        </p>

        <form onSubmit={handleSubmit} className="syllable-form">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a word, sentence, or poem..."
            className="syllable-input"
            rows={4}
          />
          <div className="syllable-actions">
            <button type="submit" className="syllable-button">
              {input.trim() && !input.includes(' ') ? 'View Details' : 'Count Syllables'}
            </button>
            {input.trim() && (
              <button
                type="button"
                onClick={() => { setInput(''); setResults([]); setTotalSyllables(0); }}
                className="clear-button"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {totalSyllables > 0 && (
          <div className="syllable-results">
            <div className="syllable-total">
              <span className="total-number">{totalSyllables}</span>
              <span className="total-label">{totalSyllables === 1 ? 'syllable' : 'syllables'} total</span>
            </div>

            <div className="syllable-breakdown">
              <h2>Word-by-Word Breakdown</h2>
              <div className="word-results">
                {results.map((result, idx) => (
                  <Link
                    key={idx}
                    to={`/syllables/${encodeURIComponent(result.word.toLowerCase().replace(/[^a-z'-]/g, ''))}`}
                    className="word-result"
                  >
                    <span className="word-text">{result.word}</span>
                    <span className="word-syllables">
                      {result.syllables.map((syl, i) => (
                        <span key={i} className={`syllable ${result.stresses[i] === 1 ? 'stressed' : result.stresses[i] === 2 ? 'secondary' : ''}`}>
                          {syl}
                          {i < result.syllables.length - 1 && <span className="syllable-sep">·</span>}
                        </span>
                      ))}
                    </span>
                    <span className="word-count">{result.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="stress-legend">
              <h3>Stress Pattern Key</h3>
              <div className="legend-items">
                <div className="legend-item">
                  <span className="syllable stressed">pri</span>
                  <span>Primary stress (emphasized)</span>
                </div>
                <div className="legend-item">
                  <span className="syllable secondary">sec</span>
                  <span>Secondary stress</span>
                </div>
                <div className="legend-item">
                  <span className="syllable">un</span>
                  <span>Unstressed</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!input && (
          <div className="tricky-words">
            <h2>Tricky Words</h2>
            <p className="tricky-words-intro">
              These words often catch people off guard. Click to see the breakdown:
            </p>
            <div className="tricky-words-list">
              {TRICKY_WORDS.map((item) => (
                <Link
                  key={item.word}
                  to={`/syllables/${item.word}`}
                  className="tricky-word-link"
                >
                  <span className="tricky-word">{item.word}</span>
                  <span className="tricky-count">{item.syllables}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="syllable-info">
          <h2>How to Count Syllables</h2>
          <div className="info-content">
            <p>
              A syllable is a unit of pronunciation with one vowel sound. To count syllables:
            </p>
            <ol>
              <li>Count the vowel sounds (not letters) in the word</li>
              <li>Subtract silent vowels (like the "e" at the end of "cake")</li>
              <li>Subtract vowel pairs that make one sound (like "ou" in "soup")</li>
            </ol>
            <p>
              Our counter uses the CMU Pronouncing Dictionary for accurate syllable counts
              based on actual pronunciation, not spelling rules.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
