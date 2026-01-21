import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { loadCMUDictionary, isDictionaryLoaded } from '../utils/cmuDict';
import { countLineSyllables } from '../utils/syllableCounter';
import './HaikuChecker.css';

const HAIKU_PATTERN = [5, 7, 5];

const EXAMPLE_HAIKUS = [
  {
    title: 'Old Pond',
    author: 'Matsuo Bashō',
    lines: ['An old silent pond', 'A frog jumps into the pond', 'Splash! Silence again'],
  },
  {
    title: 'Lightning',
    author: 'Matsuo Bashō',
    lines: ['A lightning flash', 'Between the forest trees', 'I have seen water'],
  },
];

interface LineResult {
  text: string;
  syllables: number;
  target: number;
  isCorrect: boolean;
}

export function HaikuChecker() {
  const [lines, setLines] = useState(['', '', '']);
  const [results, setResults] = useState<LineResult[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [dictionaryLoaded, setDictionaryLoaded] = useState(isDictionaryLoaded());

  useEffect(() => {
    async function loadDict() {
      if (!isDictionaryLoaded()) {
        await loadCMUDictionary();
        setDictionaryLoaded(true);
      }
    }
    loadDict();
  }, []);

  const checkHaiku = () => {
    if (!dictionaryLoaded) return;

    const lineResults: LineResult[] = lines.map((line, idx) => {
      const syllables = countLineSyllables(line);
      const target = HAIKU_PATTERN[idx];
      return {
        text: line,
        syllables,
        target,
        isCorrect: syllables === target,
      };
    });

    setResults(lineResults);
    setIsValid(lineResults.every((r) => r.isCorrect) && lines.every((l) => l.trim()));
  };

  // Check on every change
  useEffect(() => {
    if (dictionaryLoaded && lines.some((l) => l.trim())) {
      checkHaiku();
    } else {
      setResults([]);
      setIsValid(null);
    }
  }, [lines, dictionaryLoaded]);

  const handleLineChange = (index: number, value: string) => {
    const newLines = [...lines];
    newLines[index] = value;
    setLines(newLines);
  };

  const loadExample = (example: typeof EXAMPLE_HAIKUS[0]) => {
    setLines(example.lines);
  };

  const clearAll = () => {
    setLines(['', '', '']);
    setResults([]);
    setIsValid(null);
  };

  return (
    <Layout>
      <SEOHead
        title="Haiku Checker - Validate 5-7-5 Syllable Pattern"
        description="Free online haiku checker. Validate your haiku's 5-7-5 syllable pattern instantly. Get real-time feedback on each line's syllable count."
        canonicalPath="/haiku-checker"
        keywords="haiku checker, 5-7-5 syllable counter, haiku validator, haiku syllables, write haiku, haiku format"
      />

      <div className="haiku-checker">
        <h1>Haiku Checker</h1>
        <p className="haiku-subtitle">
          Validate your haiku's 5-7-5 syllable pattern
        </p>

        <div className="haiku-form">
          {lines.map((line, idx) => (
            <div key={idx} className="haiku-line-input">
              <label className="line-label">
                Line {idx + 1}
                <span className="line-target">({HAIKU_PATTERN[idx]} syllables)</span>
              </label>
              <div className="line-input-wrapper">
                <input
                  type="text"
                  value={line}
                  onChange={(e) => handleLineChange(idx, e.target.value)}
                  placeholder={`Enter line ${idx + 1}...`}
                  className={`line-input ${results[idx] ? (results[idx].isCorrect ? 'correct' : 'incorrect') : ''}`}
                />
                {results[idx] && (
                  <span className={`syllable-count ${results[idx].isCorrect ? 'correct' : 'incorrect'}`}>
                    {results[idx].syllables}
                  </span>
                )}
              </div>
            </div>
          ))}

          <div className="haiku-actions">
            <button onClick={clearAll} className="clear-button">
              Clear
            </button>
          </div>
        </div>

        {isValid !== null && (
          <div className={`haiku-result ${isValid ? 'valid' : 'invalid'}`}>
            {isValid ? (
              <>
                <span className="result-icon">✓</span>
                <span className="result-text">Valid haiku! Perfect 5-7-5 pattern.</span>
              </>
            ) : (
              <>
                <span className="result-icon">×</span>
                <span className="result-text">
                  Not quite right.
                  {results.map((r, idx) => {
                    if (!r.isCorrect && r.text.trim()) {
                      const diff = r.syllables - r.target;
                      return ` Line ${idx + 1} has ${r.syllables} syllables (${diff > 0 ? `${diff} too many` : `${Math.abs(diff)} too few`}).`;
                    }
                    return '';
                  }).join('')}
                </span>
              </>
            )}
          </div>
        )}

        <div className="example-haikus">
          <h2>Example Haikus</h2>
          <p className="examples-intro">
            Click to load an example and see the 5-7-5 pattern in action:
          </p>
          <div className="examples-grid">
            {EXAMPLE_HAIKUS.map((example, idx) => (
              <button
                key={idx}
                onClick={() => loadExample(example)}
                className="example-card"
              >
                <div className="example-lines">
                  {example.lines.map((line, lineIdx) => (
                    <div key={lineIdx} className="example-line">{line}</div>
                  ))}
                </div>
                <div className="example-attribution">
                  — {example.author}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="haiku-info">
          <h2>About Haiku</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>The 5-7-5 Pattern</h3>
              <p>
                Traditional Japanese haiku follow a 5-7-5 mora pattern. In English,
                we approximate this with syllables: 5 syllables in the first line,
                7 in the second, and 5 in the third.
              </p>
            </div>
            <div className="info-card">
              <h3>Nature & Seasons</h3>
              <p>
                Classic haiku often include a "kigo" (seasonal reference) and focus
                on nature. The poem captures a moment of awareness or insight.
              </p>
            </div>
            <div className="info-card">
              <h3>The Turn</h3>
              <p>
                Many haiku include a "kireji" (cutting word) that creates a pause
                or juxtaposition between two images or ideas.
              </p>
            </div>
          </div>
        </div>

        <div className="haiku-cta">
          <p>Want more detailed analysis?</p>
          <Link to="/" className="cta-button">
            Open Poetry Editor
          </Link>
        </div>
      </div>
    </Layout>
  );
}
