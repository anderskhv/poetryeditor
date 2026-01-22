import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { loadCMUDictionary, isDictionaryLoaded } from '../utils/cmuDict';
import { detectRhymeScheme, detectInternalRhymes, InternalRhyme } from '../utils/rhymeScheme';
import './RhymeSchemeAnalyzer.css';

const EXAMPLE_POEMS = [
  {
    title: 'Shakespearean Sonnet',
    author: 'William Shakespeare',
    meter: 'ABAB CDCD EFEF GG',
    poem: `Shall I compare thee to a summer's day?
Thou art more lovely and more temperate.
Rough winds do shake the darling buds of May,
And summer's lease hath all too short a date.

Sometime too hot the eye of heaven shines,
And often is his gold complexion dimmed;
And every fair from fair sometime declines,
By chance, or nature's changing course, untrimmed;

But thy eternal summer shall not fade,
Nor lose possession of that fair thou ow'st,
Nor shall death brag thou wand'rest in his shade,
When in eternal lines to Time thou grow'st.

So long as men can breathe, or eyes can see,
So long lives this, and this gives life to thee.`,
  },
  {
    title: 'Limerick',
    author: 'Edward Lear',
    meter: 'AABBA',
    poem: `There was an Old Man with a beard,
Who said, "It is just as I feared!
Two Owls and a Hen,
Four Larks and a Wren,
Have all built their nests in my beard!"`,
  },
  {
    title: 'Alternate Rhyme',
    author: 'Robert Frost',
    meter: 'ABAB',
    poem: `Whose woods these are I think I know.
His house is in the village though;
He will not see me stopping here
To watch his woods fill up with snow.`,
  },
  {
    title: 'Enclosed Rhyme',
    author: 'Alfred, Lord Tennyson',
    meter: 'ABBA',
    poem: `Ring out, wild bells, to the wild sky,
The flying cloud, the frosty light:
The year is dying in the night;
Ring out, wild bells, and let him die.`,
  },
];

interface RhymeResult {
  scheme: string;
  schemePattern: string[];
  lineEndWords: string[];
  lineNumbers: number[];
  rhymeGroups: Map<string, number[]>;
  rhymeQualities: ('perfect' | 'slant' | 'none')[];
}

// Color palette for rhyme groups
const RHYME_COLORS = [
  'hsl(220, 70%, 50%)', // Blue
  'hsl(350, 70%, 50%)', // Red
  'hsl(130, 60%, 40%)', // Green
  'hsl(40, 80%, 45%)',  // Orange
  'hsl(280, 60%, 50%)', // Purple
  'hsl(180, 70%, 40%)', // Teal
  'hsl(320, 60%, 50%)', // Pink
  'hsl(60, 70%, 40%)',  // Yellow-green
];

function getColorForLabel(label: string): string {
  const index = label.charCodeAt(0) - 'A'.charCodeAt(0);
  return RHYME_COLORS[index % RHYME_COLORS.length];
}

export function RhymeSchemeAnalyzer() {
  const [poem, setPoem] = useState('');
  const [result, setResult] = useState<RhymeResult | null>(null);
  const [internalRhymes, setInternalRhymes] = useState<InternalRhyme[]>([]);
  const [dictionaryLoaded, setDictionaryLoaded] = useState(isDictionaryLoaded());
  const [showInternalRhymes, setShowInternalRhymes] = useState(false);

  useEffect(() => {
    async function loadDict() {
      if (!isDictionaryLoaded()) {
        await loadCMUDictionary();
        setDictionaryLoaded(true);
      }
    }
    loadDict();
  }, []);

  useEffect(() => {
    if (dictionaryLoaded && poem.trim()) {
      const schemeResult = detectRhymeScheme(poem);
      setResult(schemeResult);
      const internal = detectInternalRhymes(poem);
      setInternalRhymes(internal);
    } else {
      setResult(null);
      setInternalRhymes([]);
    }
  }, [poem, dictionaryLoaded]);

  const loadExample = (example: typeof EXAMPLE_POEMS[0]) => {
    setPoem(example.poem);
  };

  const clearAll = () => {
    setPoem('');
    setResult(null);
    setInternalRhymes([]);
  };

  const lines = poem.split('\n');

  return (
    <Layout>
      <SEOHead
        title="Rhyme Scheme Analyzer - Detect ABAB, AABB, Sonnet Patterns"
        description="Free online rhyme scheme analyzer. Detect ABAB, AABB, ABBA, and sonnet patterns instantly. Visualize rhyme groups with color-coded line endings."
        canonicalPath="/rhyme-scheme-analyzer"
        keywords="rhyme scheme analyzer, rhyme scheme detector, ABAB pattern, AABB pattern, sonnet rhyme scheme, poem rhyme scheme, rhyme pattern finder"
      />

      <div className="rhyme-scheme-analyzer">
        <h1>Rhyme Scheme Analyzer</h1>
        <p className="analyzer-subtitle">
          Detect and visualize rhyme patterns in poetry
        </p>

        <div className="analyzer-form">
          <label className="input-label">
            Enter your poem
          </label>
          <textarea
            value={poem}
            onChange={(e) => setPoem(e.target.value)}
            placeholder="Paste or type your poem here..."
            className="poem-input"
            rows={10}
          />

          <div className="analyzer-actions">
            <button onClick={clearAll} className="clear-button">
              Clear
            </button>
          </div>
        </div>

        {result && result.schemePattern.length > 0 && (
          <div className="analysis-results">
            <div className="overall-scheme">
              <span className="scheme-label">Detected Pattern:</span>
              <span className="scheme-value">{result.scheme}</span>
            </div>

            <div className="line-analyses">
              <h2>Line-by-Line Analysis</h2>
              <div className="poem-visualization">
                {lines.map((line, idx) => {
                  if (!line.trim()) {
                    return <div key={idx} className="poem-line empty-line">&nbsp;</div>;
                  }

                  // Find the index in non-empty lines
                  const nonEmptyIndex = result.lineNumbers.indexOf(idx + 1);
                  if (nonEmptyIndex === -1) return null;

                  const label = result.schemePattern[nonEmptyIndex];
                  const endWord = result.lineEndWords[nonEmptyIndex];
                  const quality = result.rhymeQualities[nonEmptyIndex];
                  const color = label !== 'X' ? getColorForLabel(label) : 'var(--color-text-muted)';

                  return (
                    <div key={idx} className="poem-line">
                      <span className="line-number-display">{idx + 1}</span>
                      <span className="line-text-display">{line}</span>
                      <span
                        className={`rhyme-label ${quality}`}
                        style={{ backgroundColor: color }}
                        title={`"${endWord}" - ${quality === 'perfect' ? 'Perfect rhyme' : quality === 'slant' ? 'Slant rhyme' : 'Unique ending'}`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rhyme-groups-section">
              <h2>Rhyme Groups</h2>
              <div className="rhyme-groups-grid">
                {Array.from(result.rhymeGroups.entries())
                  .filter(([, lineNums]) => lineNums.length > 1)
                  .map(([label, lineNums]) => {
                    const color = getColorForLabel(label);
                    const words = lineNums.map(lineNum => {
                      const idx = result.lineNumbers.indexOf(lineNum);
                      return result.lineEndWords[idx];
                    });

                    return (
                      <div key={label} className="rhyme-group-card">
                        <span
                          className="group-label"
                          style={{ backgroundColor: color }}
                        >
                          {label}
                        </span>
                        <div className="group-words">
                          {words.map((word, i) => (
                            <span key={i} className="group-word">
                              {word}
                              {i < words.length - 1 && <span className="word-separator">/</span>}
                            </span>
                          ))}
                        </div>
                        <div className="group-lines">
                          Lines: {lineNums.join(', ')}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {internalRhymes.length > 0 && (
              <div className="internal-rhymes-section">
                <button
                  className="toggle-internal-btn"
                  onClick={() => setShowInternalRhymes(!showInternalRhymes)}
                >
                  {showInternalRhymes ? 'Hide' : 'Show'} Internal Rhymes ({internalRhymes.length})
                </button>

                {showInternalRhymes && (
                  <div className="internal-rhymes-list">
                    <p className="internal-rhymes-intro">
                      Internal rhymes occur within or across lines, not just at line endings:
                    </p>
                    {internalRhymes.slice(0, 10).map((rhyme, idx) => (
                      <div key={idx} className="internal-rhyme-item">
                        <span className="internal-word">{rhyme.word1}</span>
                        <span className="internal-arrow">↔</span>
                        <span className="internal-word">{rhyme.word2}</span>
                        <span className="internal-lines">
                          (lines {rhyme.line1} & {rhyme.line2})
                        </span>
                      </div>
                    ))}
                    {internalRhymes.length > 10 && (
                      <p className="internal-rhymes-more">
                        ...and {internalRhymes.length - 10} more
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="example-poems">
          <h2>Example Poems</h2>
          <p className="examples-intro">
            Click to load a classic poem and see its rhyme scheme:
          </p>
          <div className="examples-grid">
            {EXAMPLE_POEMS.map((example, idx) => (
              <button
                key={idx}
                onClick={() => loadExample(example)}
                className="example-card"
              >
                <div className="example-title">{example.title}</div>
                <div className="example-meter">{example.meter}</div>
                <div className="example-attribution">— {example.author}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="scheme-info">
          <h2>Common Rhyme Schemes</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>Couplets (AA BB)</h3>
              <p>
                Two consecutive lines that rhyme. Common in heroic couplets and
                many nursery rhymes. Creates a sense of completion.
              </p>
            </div>
            <div className="info-card">
              <h3>Alternate (ABAB)</h3>
              <p>
                Alternating rhymes between lines 1&3 and 2&4. Creates forward
                momentum while maintaining connection. Used in ballads.
              </p>
            </div>
            <div className="info-card">
              <h3>Enclosed (ABBA)</h3>
              <p>
                The outer lines rhyme, as do the inner lines. Creates a sense
                of circularity. Used in Italian sonnets (octave).
              </p>
            </div>
            <div className="info-card">
              <h3>Shakespearean Sonnet</h3>
              <p>
                Three quatrains (ABAB CDCD EFEF) plus a couplet (GG). The final
                couplet often delivers a twist or resolution.
              </p>
            </div>
            <div className="info-card">
              <h3>Limerick (AABBA)</h3>
              <p>
                Five lines with a distinctive bounce. Lines 1, 2, and 5 share one
                rhyme; lines 3 and 4 share another. Often humorous.
              </p>
            </div>
            <div className="info-card">
              <h3>Terza Rima (ABA BCB)</h3>
              <p>
                Interlocking tercets where each stanza's middle line rhymes with
                the outer lines of the next. Dante's Divine Comedy uses this.
              </p>
            </div>
          </div>
        </div>

        <div className="analyzer-cta">
          <p>Want meter analysis, cliché detection, and more?</p>
          <Link to="/" className="cta-button">
            Open Poetry Editor
          </Link>
        </div>
      </div>
    </Layout>
  );
}
