import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { loadCMUDictionary, isDictionaryLoaded } from '../utils/cmuDict';
import { countLineSyllables } from '../utils/syllableCounter';
import { useDebounce } from '../hooks/useDebounce';
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
  const debouncedLines = useDebounce(lines, 300);
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

    const lineResults: LineResult[] = debouncedLines.map((line, idx) => {
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
    setIsValid(lineResults.every((r) => r.isCorrect) && debouncedLines.every((l) => l.trim()));
  };

  // Check on every change with debounce
  useEffect(() => {
    if (dictionaryLoaded && debouncedLines.some((l) => l.trim())) {
      checkHaiku();
    } else {
      setResults([]);
      setIsValid(null);
    }
  }, [debouncedLines, dictionaryLoaded]);

  const handleLineChange = (index: number, value: string) => {
    const newLines = [...lines];
    newLines[index] = value;
    setLines(newLines);
  };

  const loadExample = (example: typeof EXAMPLE_HAIKUS[0]) => {
    if (lines.some(l => l.trim()) && !window.confirm('This will replace your current text. Continue?')) {
      return;
    }
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
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is the 5-7-5 syllable pattern in haiku?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A haiku follows a 5-7-5 syllable pattern: 5 syllables in the first line, 7 syllables in the second line, and 5 syllables in the third line. This pattern creates the distinctive rhythm of traditional haiku poetry."
              }
            },
            {
              "@type": "Question",
              "name": "How do I check if my haiku is correct?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Enter each line of your haiku into our checker and it will instantly count the syllables for each line. Green indicates the correct syllable count, while red shows lines that need adjustment. A valid haiku shows a checkmark when all three lines match the 5-7-5 pattern."
              }
            },
            {
              "@type": "Question",
              "name": "What makes a good haiku besides the syllable count?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Traditional haiku include a 'kigo' (seasonal reference) and focus on nature. They also often contain a 'kireji' (cutting word) that creates a pause or juxtaposition between two images. The poem should capture a moment of awareness or insight."
              }
            },
            {
              "@type": "Question",
              "name": "Can I write haiku in English?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! While haiku originated in Japan, English-language haiku are popular worldwide. The 5-7-5 syllable pattern is an approximation of the Japanese 'mora' system, and many modern English haiku poets follow this pattern or adapt it slightly."
              }
            }
          ]
        }}
      />

      <div className="haiku-checker">
        <h1>Haiku Checker</h1>
        <p className="haiku-subtitle">
          Validate your haiku's 5-7-5 syllable pattern
        </p>

        {/* Haiku Explanation Box */}
        <div className="haiku-explainer">
          <h2>What is a Haiku?</h2>
          <p>
            A haiku is a traditional Japanese poem with a strict syllable structure.
            Each haiku has exactly <strong>three lines</strong> following a <strong>5-7-5</strong> pattern:
          </p>
          <div className="pattern-visual">
            <div className="pattern-line">
              <span className="pattern-count">5</span>
              <span className="pattern-label">syllables</span>
              <span className="pattern-example">First line</span>
            </div>
            <div className="pattern-line">
              <span className="pattern-count">7</span>
              <span className="pattern-label">syllables</span>
              <span className="pattern-example">Second line (the longest)</span>
            </div>
            <div className="pattern-line">
              <span className="pattern-count">5</span>
              <span className="pattern-label">syllables</span>
              <span className="pattern-example">Third line</span>
            </div>
          </div>
          <p className="explainer-note">
            Traditional haiku often include a <em>kigo</em> (seasonal reference) and a <em>kireji</em> (cutting word)
            that creates a pause or juxtaposition between images.
          </p>
        </div>

        <div className="haiku-form">
          {lines.map((line, idx) => {
            const result = results[idx];
            const syllables = result?.syllables ?? 0;
            const target = HAIKU_PATTERN[idx];
            const hasText = line.trim().length > 0;
            const isCorrect = result?.isCorrect ?? false;
            const status = !hasText ? 'empty' : isCorrect ? 'correct' : 'incorrect';

            return (
              <div key={idx} className={`haiku-line-row ${status}`}>
                <div className="syllable-indicator">
                  <span className={`syllable-current ${status}`}>
                    {hasText ? syllables : '—'}
                  </span>
                  <span className="syllable-separator">/</span>
                  <span className="syllable-target">{target}</span>
                </div>
                <div className="line-input-container">
                  <input
                    type="text"
                    value={line}
                    onChange={(e) => handleLineChange(idx, e.target.value)}
                    placeholder={`Line ${idx + 1}: ${target} syllables...`}
                    className={`line-input ${status}`}
                  />
                  {hasText && (
                    <span className={`status-icon ${status}`}>
                      {isCorrect ? '✓' : '×'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <div className="haiku-actions">
            <button onClick={clearAll} className="clear-button">
              Clear All
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
                      return ` Line ${idx + 1}: ${r.syllables} syllables (${diff > 0 ? `${diff} too many` : `${Math.abs(diff)} too few`}).`;
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
          <h2>Tips for Writing Haiku</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>Focus on a Moment</h3>
              <p>
                Haiku capture a single moment in time. Focus on one image or sensation
                rather than telling a story.
              </p>
            </div>
            <div className="info-card">
              <h3>Use Concrete Images</h3>
              <p>
                Show, don't tell. Use specific, sensory details rather than abstract
                concepts or emotions.
              </p>
            </div>
            <div className="info-card">
              <h3>Include Nature</h3>
              <p>
                Traditional haiku reference nature and the seasons. Consider including
                a kigo (seasonal word) in your haiku.
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
