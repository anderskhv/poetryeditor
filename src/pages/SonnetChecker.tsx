import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { loadCMUDictionary, isDictionaryLoaded } from '../utils/cmuDict';
import { detectRhymeScheme } from '../utils/rhymeScheme';
import { getSyllableCounts } from '../utils/syllableCounter';
import { detectMeter } from '../utils/meterDetector';
import './SonnetChecker.css';

const EXAMPLE_SONNETS = [
  {
    title: 'Sonnet 18',
    author: 'William Shakespeare',
    type: 'Shakespearean',
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
    title: 'Sonnet 43',
    author: 'Elizabeth Barrett Browning',
    type: 'Petrarchan',
    poem: `How do I love thee? Let me count the ways.
I love thee to the depth and breadth and height
My soul can reach, when feeling out of sight
For the ends of being and ideal grace.
I love thee to the level of every day's
Most quiet need, by sun and candle-light.
I love thee freely, as men strive for right.
I love thee purely, as they turn from praise.
I love thee with the passion put to use
In my old griefs, and with my childhood's faith.
I love thee with a love I seemed to lose
With my lost saints. I love thee with the breath,
Smiles, tears, of all my life; and, if God choose,
I shall but love thee better after death.`,
  },
];

interface SonnetAnalysis {
  lineCount: number;
  rhymeScheme: string;
  detectedType: string;
  meter: string;
  syllableCounts: number[];
  issues: string[];
  score: number;
  rhymePattern: string[];
}

// Color palette for rhyme groups
const RHYME_COLORS: Record<string, string> = {
  'A': 'hsl(220, 70%, 50%)',
  'B': 'hsl(350, 70%, 50%)',
  'C': 'hsl(130, 60%, 40%)',
  'D': 'hsl(40, 80%, 45%)',
  'E': 'hsl(280, 60%, 50%)',
  'F': 'hsl(180, 70%, 40%)',
  'G': 'hsl(320, 60%, 50%)',
};

export function SonnetChecker() {
  const [poem, setPoem] = useState('');
  const [analysis, setAnalysis] = useState<SonnetAnalysis | null>(null);
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

  useEffect(() => {
    if (dictionaryLoaded && poem.trim()) {
      analyzeSonnet();
    } else {
      setAnalysis(null);
    }
  }, [poem, dictionaryLoaded]);

  const analyzeSonnet = () => {
    const lines = poem.split('\n').filter(line => line.trim());
    const lineCount = lines.length;
    const issues: string[] = [];
    let score = 100;

    // Check line count
    if (lineCount !== 14) {
      issues.push(`Sonnets require 14 lines (found ${lineCount})`);
      score -= 30;
    }

    // Get rhyme scheme
    const rhymeResult = detectRhymeScheme(poem);
    const rhymeScheme = rhymeResult.schemePattern.join('');

    // Detect sonnet type based on rhyme scheme
    let detectedType = 'Unknown';

    // Shakespearean: ABAB CDCD EFEF GG
    const isShakespearean = lineCount === 14 &&
      rhymeScheme[0] === rhymeScheme[2] && rhymeScheme[1] === rhymeScheme[3] &&
      rhymeScheme[4] === rhymeScheme[6] && rhymeScheme[5] === rhymeScheme[7] &&
      rhymeScheme[8] === rhymeScheme[10] && rhymeScheme[9] === rhymeScheme[11] &&
      rhymeScheme[12] === rhymeScheme[13];

    // Petrarchan: ABBAABBA + sestet
    const isPetrarchanOctave = lineCount >= 8 &&
      rhymeScheme[0] === rhymeScheme[3] && rhymeScheme[0] === rhymeScheme[4] && rhymeScheme[0] === rhymeScheme[7] &&
      rhymeScheme[1] === rhymeScheme[2] && rhymeScheme[1] === rhymeScheme[5] && rhymeScheme[1] === rhymeScheme[6];

    // Spenserian: ABAB BCBC CDCD EE
    const isSpenserian = rhymeScheme === 'ABABBCBCCDCDEE';

    if (isShakespearean) {
      detectedType = 'Shakespearean';
    } else if (isPetrarchanOctave) {
      detectedType = 'Petrarchan';
    } else if (isSpenserian) {
      detectedType = 'Spenserian';
    } else if (lineCount === 14) {
      detectedType = 'Non-standard';
      issues.push('Rhyme scheme does not match Shakespearean, Petrarchan, or Spenserian patterns');
      score -= 15;
    }

    // Get syllable counts and check meter
    const syllableCounts = getSyllableCounts(poem);
    const meter = detectMeter(poem);

    // Check for iambic pentameter (10 syllables per line)
    const pentameterLines = syllableCounts.filter(count => count === 10 || count === 11).length;
    const pentameterRatio = lineCount > 0 ? pentameterLines / lineCount : 0;

    if (pentameterRatio < 0.7) {
      issues.push(`Only ${Math.round(pentameterRatio * 100)}% of lines follow iambic pentameter (10-11 syllables)`);
      score -= Math.round((1 - pentameterRatio) * 20);
    }

    // List specific syllable issues
    syllableCounts.forEach((count, idx) => {
      if (count < 8 || count > 12) {
        issues.push(`Line ${idx + 1}: ${count} syllables (expected ~10)`);
      }
    });

    setAnalysis({
      lineCount,
      rhymeScheme,
      detectedType,
      meter,
      syllableCounts,
      issues,
      score: Math.max(0, score),
      rhymePattern: rhymeResult.schemePattern,
    });
  };

  const loadExample = (example: typeof EXAMPLE_SONNETS[0]) => {
    setPoem(example.poem);
  };

  const clearAll = () => {
    setPoem('');
    setAnalysis(null);
  };

  const lines = poem.split('\n');

  const getScoreClass = (score: number) => {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'needs-work';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Work';
  };

  return (
    <Layout>
      <SEOHead
        title="Sonnet Checker - Validate Shakespearean & Petrarchan Sonnets"
        description="Free online sonnet checker. Validate Shakespearean, Petrarchan, and Spenserian sonnet forms. Check 14-line structure, rhyme scheme, and iambic pentameter."
        canonicalPath="/sonnet-checker"
        keywords="sonnet checker, sonnet validator, Shakespearean sonnet, Petrarchan sonnet, iambic pentameter checker, 14 line poem, sonnet form"
      />

      <div className="sonnet-checker">
        <h1>Sonnet Checker</h1>
        <p className="sonnet-subtitle">
          Validate your sonnet's structure, rhyme scheme, and meter
        </p>

        <div className="sonnet-form">
          <label className="input-label">
            Enter your sonnet (14 lines)
          </label>
          <textarea
            value={poem}
            onChange={(e) => setPoem(e.target.value)}
            placeholder="Paste or type your 14-line sonnet here..."
            className="poem-input"
            rows={16}
          />

          <div className="sonnet-actions">
            <button onClick={clearAll} className="clear-button">
              Clear
            </button>
          </div>
        </div>

        {analysis && (
          <div className="analysis-results">
            <div className="score-section">
              <div className={`score-badge ${getScoreClass(analysis.score)}`}>
                <span className="score-number">{analysis.score}</span>
                <span className="score-label">{getScoreLabel(analysis.score)}</span>
              </div>
              <div className="score-details">
                <div className="detail-item">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{analysis.detectedType} Sonnet</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Lines:</span>
                  <span className={`detail-value ${analysis.lineCount === 14 ? 'correct' : 'incorrect'}`}>
                    {analysis.lineCount} / 14
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Meter:</span>
                  <span className="detail-value">{analysis.meter}</span>
                </div>
              </div>
            </div>

            {analysis.issues.length > 0 && (
              <div className="issues-section">
                <h3>Issues Found</h3>
                <ul className="issues-list">
                  {analysis.issues.slice(0, 5).map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                  {analysis.issues.length > 5 && (
                    <li className="more-issues">...and {analysis.issues.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}

            <div className="poem-analysis">
              <h3>Line-by-Line Analysis</h3>
              <div className="poem-lines">
                {lines.map((line, idx) => {
                  if (!line.trim()) return null;

                  const nonEmptyIdx = lines.slice(0, idx + 1).filter(l => l.trim()).length - 1;
                  const rhymeLabel = analysis.rhymePattern[nonEmptyIdx] || 'X';
                  const syllables = analysis.syllableCounts[nonEmptyIdx] || 0;
                  const isGoodSyllables = syllables >= 9 && syllables <= 11;

                  return (
                    <div key={idx} className="poem-line">
                      <span className="line-num">{nonEmptyIdx + 1}</span>
                      <span className="line-content">{line}</span>
                      <span
                        className="rhyme-badge"
                        style={{ backgroundColor: RHYME_COLORS[rhymeLabel] || 'var(--color-text-muted)' }}
                      >
                        {rhymeLabel}
                      </span>
                      <span className={`syllable-badge ${isGoodSyllables ? 'good' : 'off'}`}>
                        {syllables}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rhyme-scheme-display">
              <h3>Rhyme Scheme</h3>
              <div className="scheme-pattern">
                {analysis.rhymePattern.map((label, idx) => (
                  <span
                    key={idx}
                    className="scheme-letter"
                    style={{ backgroundColor: RHYME_COLORS[label] || 'var(--color-text-muted)' }}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <div className="scheme-expected">
                {analysis.detectedType === 'Shakespearean' && (
                  <p>Expected: <strong>ABAB CDCD EFEF GG</strong></p>
                )}
                {analysis.detectedType === 'Petrarchan' && (
                  <p>Expected: <strong>ABBAABBA</strong> + sestet (CDECDE, CDCDCD, etc.)</p>
                )}
                {analysis.detectedType === 'Spenserian' && (
                  <p>Expected: <strong>ABAB BCBC CDCD EE</strong></p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="example-sonnets">
          <h2>Example Sonnets</h2>
          <p className="examples-intro">
            Click to load a classic sonnet and see its analysis:
          </p>
          <div className="examples-grid">
            {EXAMPLE_SONNETS.map((example, idx) => (
              <button
                key={idx}
                onClick={() => loadExample(example)}
                className="example-card"
              >
                <div className="example-title">{example.title}</div>
                <div className="example-type">{example.type}</div>
                <div className="example-attribution">— {example.author}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="sonnet-info">
          <h2>About Sonnets</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>Shakespearean Sonnet</h3>
              <p>
                14 lines in iambic pentameter with ABAB CDCD EFEF GG rhyme scheme.
                Three quatrains develop themes; the final couplet delivers a turn or resolution.
              </p>
            </div>
            <div className="info-card">
              <h3>Petrarchan Sonnet</h3>
              <p>
                14 lines split into an octave (ABBAABBA) and sestet (CDECDE or similar).
                The volta (turn) typically occurs between the octave and sestet.
              </p>
            </div>
            <div className="info-card">
              <h3>Spenserian Sonnet</h3>
              <p>
                14 lines with interlocking ABAB BCBC CDCD EE rhyme scheme.
                Named after Edmund Spenser, it blends English and Italian traditions.
              </p>
            </div>
            <div className="info-card">
              <h3>Iambic Pentameter</h3>
              <p>
                Ten syllables per line in an unstressed-stressed pattern (da-DUM da-DUM da-DUM da-DUM da-DUM).
                The heartbeat rhythm of English poetry.
              </p>
            </div>
          </div>
        </div>

        <div className="sonnet-cta">
          <p>Want complete poetry analysis with clichés and form detection?</p>
          <Link to="/" className="cta-button">
            Open Poetry Editor
          </Link>
        </div>
      </div>
    </Layout>
  );
}
