import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { loadCMUDictionary, isDictionaryLoaded } from '../utils/cmuDict';
import { detectRhymeScheme } from '../utils/rhymeScheme';
import { getSyllableCounts } from '../utils/syllableCounter';
import { detectMeter } from '../utils/meterDetector';
import { analyzeTextStress, detectMeterFromStress, LineStressAnalysis } from '../utils/stressAnalyzer';
import { useDebounce } from '../hooks/useDebounce';
import './SonnetChecker.css';

// Sonnet type definitions with expected rhyme schemes
const SONNET_TYPES = {
  shakespearean: {
    name: 'Shakespearean',
    scheme: ['A', 'B', 'A', 'B', 'C', 'D', 'C', 'D', 'E', 'F', 'E', 'F', 'G', 'G'],
    description: 'ABAB CDCD EFEF GG',
  },
  petrarchan: {
    name: 'Petrarchan',
    scheme: ['A', 'B', 'B', 'A', 'A', 'B', 'B', 'A', 'C', 'D', 'E', 'C', 'D', 'E'],
    description: 'ABBAABBA CDECDE',
  },
  spenserian: {
    name: 'Spenserian',
    scheme: ['A', 'B', 'A', 'B', 'B', 'C', 'B', 'C', 'C', 'D', 'C', 'D', 'E', 'E'],
    description: 'ABAB BCBC CDCD EE',
  },
};

type SonnetType = keyof typeof SONNET_TYPES;

// Line compliance interface
interface LineCompliance {
  lineNumber: number;
  text: string;
  syllableCount: number;
  syllableCompliant: boolean;
  syllableMessage: string;
  stressPattern: number[];
  stressString: string;
  stressCompliant: boolean;
  stressMessage: string;
  rhymeLabel: string;
  expectedRhyme: string;
  rhymeCompliant: boolean;
  rhymeMessage: string;
  rhymingWord: string;
  isFullyCompliant: boolean;
}

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
  stressAnalyses: LineStressAnalysis[];
  lineCompliances: LineCompliance[];
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
  const [lines, setLines] = useState<string[]>(Array(14).fill(''));
  const poem = lines.join('\n');
  const debouncedPoem = useDebounce(poem, 300);
  const [analysis, setAnalysis] = useState<SonnetAnalysis | null>(null);
  const [dictionaryLoaded, setDictionaryLoaded] = useState(isDictionaryLoaded());
  const [selectedSonnetType, setSelectedSonnetType] = useState<SonnetType>('shakespearean');
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

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
    if (dictionaryLoaded && debouncedPoem.trim()) {
      analyzeSonnet();
    } else {
      setAnalysis(null);
    }
  }, [debouncedPoem, dictionaryLoaded, selectedSonnetType]);

  const analyzeSonnet = () => {
    const lines = debouncedPoem.split('\n').filter(line => line.trim());
    const lineCount = lines.length;
    const issues: string[] = [];
    let score = 100;

    // Check line count
    if (lineCount !== 14) {
      issues.push(`Sonnets require 14 lines (found ${lineCount})`);
      score -= 30;
    }

    // Get rhyme scheme
    const rhymeResult = detectRhymeScheme(debouncedPoem);
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

    // Get syllable counts and check meter using actual stress patterns
    const syllableCounts = getSyllableCounts(debouncedPoem);
    const meter = detectMeter(debouncedPoem);
    const stressAnalyses = analyzeTextStress(debouncedPoem);

    // Filter out empty lines from stress analyses for proper alignment
    const nonEmptyStressAnalyses = stressAnalyses.filter(a => a.line.trim());

    // Get expected scheme based on selected type
    const expectedScheme = SONNET_TYPES[selectedSonnetType].scheme;

    // Build line compliance data
    const lineCompliances: LineCompliance[] = lines.map((line, idx) => {
      const syllables = syllableCounts[idx] || 0;
      const stressAnalysis = nonEmptyStressAnalyses[idx];
      const stresses = stressAnalysis?.stresses || [];
      const stressString = stressAnalysis?.stressString || '';
      const lineMeter = stresses.length > 0 ? detectMeterFromStress(stresses) : 'Unknown';

      // Syllable compliance: expect 10 syllables (allow 9-11)
      const syllableCompliant = syllables >= 9 && syllables <= 11;
      let syllableMessage = '';
      if (syllables < 9) {
        syllableMessage = `Too few syllables (${syllables}). Iambic pentameter requires 10 syllables per line.`;
      } else if (syllables > 11) {
        syllableMessage = `Too many syllables (${syllables}). Iambic pentameter requires 10 syllables per line.`;
      }

      // Stress compliance: expect iambic pattern (unstressed-stressed pairs)
      const stressCompliant = lineMeter === 'Iambic Pentameter' || lineMeter.includes('Iambic');
      let stressMessage = '';
      if (!stressCompliant && stresses.length > 0) {
        stressMessage = `Detected ${lineMeter}. Sonnets traditionally use iambic meter (unstressed-stressed pairs: da-DUM da-DUM...).`;
      }

      // Rhyme compliance
      const actualRhyme = rhymeResult.schemePattern[idx] || 'X';
      const expectedRhyme = expectedScheme[idx] || 'X';

      // Find which lines should rhyme with this one based on expected scheme
      const rhymingLineIndices = expectedScheme
        .map((label, i) => label === expectedRhyme && i !== idx ? i + 1 : -1)
        .filter(i => i > 0);

      // Check if actual rhyme matches expected pattern
      const actualRhymingLines = rhymeResult.schemePattern
        .map((label, i) => label === actualRhyme && i !== idx ? i + 1 : -1)
        .filter(i => i > 0);

      // Rhyme is compliant if this line rhymes with the expected lines
      let rhymeCompliant = true;
      let rhymeMessage = '';

      if (lineCount === 14) {
        // Check if we're rhyming with the correct lines
        const expectedRhymePartners = expectedScheme
          .map((label, i) => ({ label, index: i }))
          .filter(item => item.label === expectedRhyme && item.index !== idx)
          .map(item => item.index);

        const actualRhymePartners = rhymeResult.schemePattern
          .map((label, i) => ({ label, index: i }))
          .filter(item => item.label === actualRhyme && item.index !== idx)
          .map(item => item.index);

        // Check if actual rhyme partners match expected
        const hasCorrectRhymes = expectedRhymePartners.every(expectedIdx =>
          actualRhymePartners.includes(expectedIdx)
        );

        if (!hasCorrectRhymes && expectedRhymePartners.length > 0) {
          rhymeCompliant = false;
          const expectedLinesStr = expectedRhymePartners.map(i => i + 1).join(', ');
          rhymeMessage = `Should rhyme with line${expectedRhymePartners.length > 1 ? 's' : ''} ${expectedLinesStr} in ${SONNET_TYPES[selectedSonnetType].name} form.`;
        }
      }

      // Get the last word for rhyme dictionary link
      const words = line.trim().split(/\s+/);
      const rhymingWord = words[words.length - 1]?.replace(/[^a-zA-Z]/g, '').toLowerCase() || '';

      return {
        lineNumber: idx + 1,
        text: line,
        syllableCount: syllables,
        syllableCompliant,
        syllableMessage,
        stressPattern: stresses,
        stressString,
        stressCompliant,
        stressMessage,
        rhymeLabel: actualRhyme,
        expectedRhyme,
        rhymeCompliant,
        rhymeMessage,
        rhymingWord,
        isFullyCompliant: syllableCompliant && stressCompliant && rhymeCompliant,
      };
    });

    // Check for iambic pentameter using actual stress patterns
    let iambicPentameterCount = 0;
    const lineMeters: string[] = [];

    nonEmptyStressAnalyses.forEach((analysis, idx) => {
      if (analysis.stresses.length === 0) return;

      const lineMeter = detectMeterFromStress(analysis.stresses);
      lineMeters.push(lineMeter);

      // Check if it's iambic pentameter
      if (lineMeter === 'Iambic Pentameter') {
        iambicPentameterCount++;
      }
    });

    const pentameterRatio = lineCount > 0 ? iambicPentameterCount / lineCount : 0;

    if (pentameterRatio < 0.7) {
      issues.push(`Only ${Math.round(pentameterRatio * 100)}% of lines follow iambic pentameter pattern`);
      score -= Math.round((1 - pentameterRatio) * 20);
    }

    // List specific meter issues for each line
    nonEmptyStressAnalyses.forEach((analysis, idx) => {
      if (analysis.stresses.length === 0) return;

      const lineMeter = detectMeterFromStress(analysis.stresses);
      const syllables = analysis.stresses.length;

      // Flag lines that aren't iambic pentameter
      if (lineMeter !== 'Iambic Pentameter' && syllables > 0) {
        if (syllables < 8 || syllables > 12) {
          issues.push(`Line ${idx + 1}: ${syllables} syllables, ${lineMeter} (expected iambic pentameter)`);
        } else if (!lineMeter.includes('Iambic')) {
          issues.push(`Line ${idx + 1}: ${lineMeter} (expected iambic pentameter)`);
        }
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
      stressAnalyses: nonEmptyStressAnalyses,
      lineCompliances,
    });
  };

  const handleLineChange = (index: number, value: string) => {
    const newLines = [...lines];
    newLines[index] = value;
    setLines(newLines);
  };

  const loadExample = (example: typeof EXAMPLE_SONNETS[0]) => {
    if (lines.some(l => l.trim()) && !window.confirm('This will replace your current text. Continue?')) {
      return;
    }
    const exampleLines = example.poem.split('\n');
    const newLines = Array(14).fill('').map((_, i) => exampleLines[i] || '');
    setLines(newLines);
  };

  const clearAll = () => {
    setLines(Array(14).fill(''));
    setAnalysis(null);
  };

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
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is the structure of a Shakespearean sonnet?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A Shakespearean (English) sonnet has 14 lines in iambic pentameter with the rhyme scheme ABAB CDCD EFEF GG. It consists of three quatrains (4-line stanzas) that develop the theme, followed by a closing couplet that provides a turn or resolution."
              }
            },
            {
              "@type": "Question",
              "name": "What is the difference between Shakespearean and Petrarchan sonnets?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Shakespearean sonnets have three quatrains plus a couplet (ABAB CDCD EFEF GG), while Petrarchan sonnets divide into an octave (ABBAABBA) and a sestet (CDECDE or similar). The 'volta' or turn comes at the couplet in Shakespearean sonnets but between the octave and sestet in Petrarchan sonnets."
              }
            },
            {
              "@type": "Question",
              "name": "How many syllables should each line of a sonnet have?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Each line of a traditional sonnet should have 10 syllables in iambic pentameter (five iambs of unstressed-stressed pairs). Some variations allow 9-11 syllables due to poetic license, feminine endings, or elision."
              }
            },
            {
              "@type": "Question",
              "name": "What is a Spenserian sonnet?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A Spenserian sonnet, named after Edmund Spenser, has 14 lines with an interlocking rhyme scheme: ABAB BCBC CDCD EE. It uses the same linked rhymes between quatrains as Spenser's 'The Faerie Queene' stanza, creating a more unified flow than the Shakespearean form."
              }
            }
          ]
        }}
      />

      <div className="sonnet-checker">
        <h1>Sonnet Checker</h1>
        <p className="sonnet-subtitle">
          Validate your sonnet's structure, rhyme scheme, and meter
        </p>

        {/* Sonnet Explanation Box */}
        <div className="sonnet-explainer">
          <h2>What is a Sonnet?</h2>
          <p>
            A sonnet is a <strong>14-line poem</strong> written in <strong>iambic pentameter</strong> with
            a specific rhyme scheme. Each line should have <strong>10 syllables</strong> following an
            unstressed-stressed pattern (da-DUM).
          </p>

          <div className="sonnet-type-selector">
            <label className="selector-label">Select sonnet type to check against:</label>
            <div className="type-buttons">
              {(Object.keys(SONNET_TYPES) as SonnetType[]).map((type) => (
                <button
                  key={type}
                  className={`type-button ${selectedSonnetType === type ? 'active' : ''}`}
                  onClick={() => setSelectedSonnetType(type)}
                >
                  <span className="type-name">{SONNET_TYPES[type].name}</span>
                  <span className="type-scheme">{SONNET_TYPES[type].description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sonnet-structure">
            <h3>Structure of a {SONNET_TYPES[selectedSonnetType].name} Sonnet</h3>
            <div className="structure-details">
              <div className="structure-item">
                <span className="structure-icon">14</span>
                <span className="structure-text">Lines total</span>
              </div>
              <div className="structure-item">
                <span className="structure-icon">10</span>
                <span className="structure-text">Syllables per line</span>
              </div>
              <div className="structure-item">
                <span className="structure-icon">
                  {selectedSonnetType === 'shakespearean' && 'da-DUM'}
                  {selectedSonnetType === 'petrarchan' && 'da-DUM'}
                  {selectedSonnetType === 'spenserian' && 'da-DUM'}
                </span>
                <span className="structure-text">Iambic meter</span>
              </div>
            </div>
            <div className="rhyme-pattern-visual">
              <span className="pattern-label">Rhyme scheme:</span>
              <span className="pattern-display">{SONNET_TYPES[selectedSonnetType].description}</span>
            </div>
          </div>

          <p className="explainer-note">
            The <em>volta</em> (turn) is a shift in thought or argument.
            {selectedSonnetType === 'shakespearean' && ' In Shakespearean sonnets, it typically occurs at the final couplet (lines 13-14).'}
            {selectedSonnetType === 'petrarchan' && ' In Petrarchan sonnets, it occurs between the octave (first 8 lines) and sestet (final 6 lines).'}
            {selectedSonnetType === 'spenserian' && ' In Spenserian sonnets, the interlocking rhymes create a more gradual turn.'}
          </p>
        </div>

        <div className="sonnet-form">
          <div className="form-header">
            <label className="input-label">
              Enter your sonnet (14 lines)
            </label>
            <button onClick={clearAll} className="clear-button">
              Clear
            </button>
          </div>
          <div className="sonnet-lines-editor">
            {lines.map((line, idx) => {
              const compliance = analysis?.lineCompliances[idx];
              const expectedLabel = SONNET_TYPES[selectedSonnetType].scheme[idx];
              const syllables = compliance?.syllableCount ?? 0;
              const hasText = line.trim().length > 0;
              const isHovered = hoveredLine === idx;

              // Determine status
              let status = 'empty';
              if (hasText && compliance) {
                status = compliance.isFullyCompliant ? 'correct' : 'incorrect';
              }

              // Stanza breaks for visual grouping
              const isStanzaBreak = [4, 8, 12].includes(idx);

              return (
                <div key={idx}>
                  {isStanzaBreak && idx > 0 && <div className="stanza-separator" />}
                  <div
                    className={`sonnet-line-row ${status} ${isHovered ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredLine(idx)}
                    onMouseLeave={() => setHoveredLine(null)}
                  >
                    <div className="line-guidance">
                      <span
                        className={`expected-scheme-label rhyme-${status}`}
                        style={{ backgroundColor: hasText ? (RHYME_COLORS[expectedLabel] || 'var(--color-text-muted)') : undefined }}
                      >
                        {expectedLabel}
                      </span>
                    </div>
                    <div className="line-input-wrapper">
                      <input
                        type="text"
                        value={line}
                        onChange={(e) => handleLineChange(idx, e.target.value)}
                        placeholder={`Line ${idx + 1}: rhymes with ${expectedLabel}...`}
                        className={`line-input ${status}`}
                      />
                      {/* Show stress pattern on hover */}
                      {isHovered && hasText && compliance?.stressString && (
                        <div className="line-stress-tooltip">
                          <span className="stress-label">Stress:</span>
                          <span className="stress-display">{compliance.stressString}</span>
                          {!compliance.stressCompliant && (
                            <span className="stress-hint">Expected iambic: u / u / u / u / u /</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="line-metrics">
                      <span className={`syllable-count ${hasText && compliance ? (compliance.syllableCompliant ? 'correct' : 'incorrect') : 'empty'}`}>
                        {hasText ? syllables : '—'}/10
                      </span>
                      {hasText && compliance && (
                        <span className={`status-icon ${compliance.isFullyCompliant ? 'correct' : 'incorrect'}`}>
                          {compliance.isFullyCompliant ? '✓' : '×'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
                <h3>Issues Found ({analysis.issues.length})</h3>
                <ul className="issues-list">
                  {analysis.issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="poem-analysis">
              <h3>Line-by-Line Compliance</h3>
              <div className="compliance-legend">
                <span className="legend-item">
                  <span className="legend-check compliant">&#10003;</span>
                  <span>Compliant</span>
                </span>
                <span className="legend-item">
                  <span className="legend-check non-compliant">&#10007;</span>
                  <span>Needs attention</span>
                </span>
              </div>
              <div className="poem-lines">
                {analysis.lineCompliances.map((compliance, idx) => {
                  const isHovered = hoveredLine === idx;
                  const hasIssues = !compliance.isFullyCompliant;
                  const tooltipMessages: string[] = [];
                  if (!compliance.syllableCompliant) tooltipMessages.push(compliance.syllableMessage);
                  if (!compliance.stressCompliant) tooltipMessages.push(compliance.stressMessage);
                  if (!compliance.rhymeCompliant) tooltipMessages.push(compliance.rhymeMessage);

                  return (
                    <div
                      key={idx}
                      className={`poem-line-enhanced ${hasIssues ? 'has-issues' : 'compliant'} ${isHovered ? 'hovered' : ''}`}
                      onMouseEnter={() => setHoveredLine(idx)}
                      onMouseLeave={() => setHoveredLine(null)}
                    >
                      <span className="line-num">{compliance.lineNumber}</span>
                      <div className="line-main">
                        <span className="line-content">{compliance.text}</span>
                        {compliance.stressString && (
                          <span className="stress-pattern" title="Stress pattern: ' = stressed, u = unstressed">
                            {compliance.stressString}
                          </span>
                        )}
                      </div>
                      <div className="compliance-checks">
                        <div
                          className={`check-item ${compliance.syllableCompliant ? 'pass' : 'fail'}`}
                          title={compliance.syllableCompliant ? `${compliance.syllableCount} syllables` : compliance.syllableMessage}
                        >
                          <span className="check-label">Syl</span>
                          <span className="check-value">{compliance.syllableCount}</span>
                          <span className="check-icon">{compliance.syllableCompliant ? '\u2713' : '\u2717'}</span>
                        </div>
                        <div
                          className={`check-item ${compliance.stressCompliant ? 'pass' : 'fail'}`}
                          title={compliance.stressCompliant ? 'Iambic meter' : compliance.stressMessage}
                        >
                          <span className="check-label">Meter</span>
                          <span className="check-icon">{compliance.stressCompliant ? '\u2713' : '\u2717'}</span>
                        </div>
                        <div
                          className={`check-item ${compliance.rhymeCompliant ? 'pass' : 'fail'}`}
                          title={compliance.rhymeCompliant ? `Rhyme group ${compliance.rhymeLabel}` : compliance.rhymeMessage}
                        >
                          <span
                            className="rhyme-badge-small"
                            style={{ backgroundColor: RHYME_COLORS[compliance.rhymeLabel] || 'var(--color-text-muted)' }}
                          >
                            {compliance.rhymeLabel}
                          </span>
                          <span className="check-icon">{compliance.rhymeCompliant ? '\u2713' : '\u2717'}</span>
                        </div>
                      </div>

                      {/* Tooltip for non-compliant lines */}
                      {hasIssues && isHovered && (
                        <div className="compliance-tooltip">
                          <div className="tooltip-header">Issues Detected</div>
                          <ul className="tooltip-issues">
                            {!compliance.syllableCompliant && (
                              <li>
                                <strong>Syllables:</strong> {compliance.syllableMessage}
                              </li>
                            )}
                            {!compliance.stressCompliant && (
                              <li>
                                <strong>Meter:</strong> {compliance.stressMessage}
                              </li>
                            )}
                            {!compliance.rhymeCompliant && (
                              <li>
                                <strong>Rhyme:</strong> {compliance.rhymeMessage}
                                {compliance.rhymingWord && (
                                  <Link
                                    to={`/rhymes/${encodeURIComponent(compliance.rhymingWord)}`}
                                    className="rhyme-help-link"
                                  >
                                    Find rhymes for "{compliance.rhymingWord}"
                                  </Link>
                                )}
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
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
