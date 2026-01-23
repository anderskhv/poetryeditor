import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { loadCMUDictionary, isDictionaryLoaded } from '../utils/cmuDict';
import { detectRhymeScheme, detectInternalRhymes, InternalRhyme, assessRhymeQuality } from '../utils/rhymeScheme';
import { useDebounce } from '../hooks/useDebounce';
import './RhymeSchemeAnalyzer.css';

// Poetry form definitions with rhyme schemes
interface PoetryForm {
  id: string;
  name: string;
  scheme: string;
  lineCount: number;
  description: string;
  stanzaBreaks?: number[]; // Line indices where stanza breaks occur
}

const POETRY_FORMS: PoetryForm[] = [
  {
    id: 'limerick',
    name: 'Limerick',
    scheme: 'AABBA',
    lineCount: 5,
    description: 'A humorous five-line poem with a bouncy rhythm',
  },
  {
    id: 'quatrain-abab',
    name: 'Quatrain (ABAB)',
    scheme: 'ABAB',
    lineCount: 4,
    description: 'Four lines with alternating rhymes',
  },
  {
    id: 'quatrain-abba',
    name: 'Quatrain (ABBA)',
    scheme: 'ABBA',
    lineCount: 4,
    description: 'Four lines with enclosed rhymes',
  },
  {
    id: 'couplets',
    name: 'Couplets',
    scheme: 'AABBCC',
    lineCount: 6,
    description: 'Pairs of rhyming lines',
  },
  {
    id: 'shakespearean-sonnet',
    name: 'Shakespearean Sonnet',
    scheme: 'ABABCDCDEFEFGG',
    lineCount: 14,
    description: 'Three quatrains and a couplet',
    stanzaBreaks: [4, 8, 12],
  },
  {
    id: 'petrarchan-sonnet',
    name: 'Petrarchan Sonnet',
    scheme: 'ABBAABBACDCDCD',
    lineCount: 14,
    description: 'Octave and sestet structure',
    stanzaBreaks: [8],
  },
  {
    id: 'terza-rima',
    name: 'Terza Rima',
    scheme: 'ABABCBCDC',
    lineCount: 9,
    description: 'Interlocking tercets',
    stanzaBreaks: [3, 6],
  },
  {
    id: 'free-verse',
    name: 'Free Verse',
    scheme: '',
    lineCount: 0,
    description: 'No fixed rhyme scheme - analyze any text',
  },
];

const EXAMPLE_POEMS = [
  {
    title: 'Shakespearean Sonnet',
    author: 'William Shakespeare',
    formId: 'shakespearean-sonnet',
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
    formId: 'limerick',
    poem: `There was an Old Man with a beard,
Who said, "It is just as I feared!
Two Owls and a Hen,
Four Larks and a Wren,
Have all built their nests in my beard!"`,
  },
  {
    title: 'Alternate Rhyme',
    author: 'Robert Frost',
    formId: 'quatrain-abab',
    poem: `Whose woods these are I think I know.
His house is in the village though;
He will not see me stopping here
To watch his woods fill up with snow.`,
  },
  {
    title: 'Enclosed Rhyme',
    author: 'Alfred, Lord Tennyson',
    formId: 'quatrain-abba',
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

// Get the last word from a line
function getLastWord(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return '';
  const withoutPunctuation = trimmed.replace(/[.,!?;:'")\]}>]+$/, '');
  const words = withoutPunctuation.split(/\s+/);
  return words[words.length - 1]?.toLowerCase() || '';
}

// Analyze rhyme compliance for form-based mode
interface LineAnalysis {
  lineIndex: number;
  expectedLabel: string;
  actualLabel: string;
  endWord: string;
  rhymeStatus: 'correct' | 'slant' | 'incorrect' | 'pending';
  rhymesWithLines: number[];
}

function analyzeFormCompliance(
  lines: string[],
  form: PoetryForm
): LineAnalysis[] {
  const expectedScheme = form.scheme.split('');
  const analyses: LineAnalysis[] = [];

  // Build a map of which lines should rhyme together based on the expected scheme
  const expectedRhymeGroups: Map<string, number[]> = new Map();
  expectedScheme.forEach((label, idx) => {
    if (!expectedRhymeGroups.has(label)) {
      expectedRhymeGroups.set(label, []);
    }
    expectedRhymeGroups.get(label)!.push(idx);
  });

  // Get end words for each line
  const endWords = lines.map(line => getLastWord(line));

  // Analyze each line
  for (let i = 0; i < form.lineCount; i++) {
    const expectedLabel = expectedScheme[i] || '';
    const endWord = endWords[i] || '';
    const lineText = lines[i] || '';

    // Find which lines this should rhyme with
    const shouldRhymeWith = (expectedRhymeGroups.get(expectedLabel) || [])
      .filter(idx => idx !== i && idx < i);

    let rhymeStatus: 'correct' | 'slant' | 'incorrect' | 'pending' = 'pending';
    const rhymesWithLines: number[] = [];

    if (!lineText.trim() || !endWord) {
      rhymeStatus = 'pending';
    } else if (shouldRhymeWith.length === 0) {
      // This is the first line with this label - check if later lines will rhyme
      const futureRhymes = (expectedRhymeGroups.get(expectedLabel) || [])
        .filter(idx => idx > i);

      if (futureRhymes.length === 0) {
        // No other lines share this label (shouldn't happen in well-formed schemes)
        rhymeStatus = 'pending';
      } else {
        // Check against future lines that are already filled in
        let foundRhyme = false;
        for (const futureIdx of futureRhymes) {
          const futureWord = endWords[futureIdx];
          if (futureWord) {
            const quality = assessRhymeQuality(endWord, futureWord);
            if (quality === 'perfect') {
              rhymeStatus = 'correct';
              rhymesWithLines.push(futureIdx + 1);
              foundRhyme = true;
            } else if (quality === 'slant' && rhymeStatus !== 'correct') {
              rhymeStatus = 'slant';
              rhymesWithLines.push(futureIdx + 1);
              foundRhyme = true;
            }
          }
        }
        if (!foundRhyme) {
          // No future lines filled yet, check if any future lines have content
          const anyFutureFilled = futureRhymes.some(idx => endWords[idx]);
          if (anyFutureFilled) {
            rhymeStatus = 'incorrect';
          } else {
            rhymeStatus = 'pending';
          }
        }
      }
    } else {
      // Check if this line rhymes with previous lines it should
      let bestQuality: 'perfect' | 'slant' | 'none' = 'none';

      for (const prevIdx of shouldRhymeWith) {
        const prevWord = endWords[prevIdx];
        if (prevWord) {
          const quality = assessRhymeQuality(endWord, prevWord);
          if (quality === 'perfect') {
            bestQuality = 'perfect';
            rhymesWithLines.push(prevIdx + 1);
          } else if (quality === 'slant' && bestQuality !== 'perfect') {
            bestQuality = 'slant';
            rhymesWithLines.push(prevIdx + 1);
          }
        }
      }

      if (bestQuality === 'perfect') {
        rhymeStatus = 'correct';
      } else if (bestQuality === 'slant') {
        rhymeStatus = 'slant';
      } else {
        // Check if any previous lines are filled
        const anyPrevFilled = shouldRhymeWith.some(idx => endWords[idx]);
        rhymeStatus = anyPrevFilled ? 'incorrect' : 'pending';
      }
    }

    analyses.push({
      lineIndex: i,
      expectedLabel,
      actualLabel: '', // Will be filled from detection
      endWord,
      rhymeStatus,
      rhymesWithLines,
    });
  }

  return analyses;
}

export function RhymeSchemeAnalyzer() {
  const [selectedForm, setSelectedForm] = useState<PoetryForm>(POETRY_FORMS[0]);
  const [lines, setLines] = useState<string[]>([]);
  const [dictionaryLoaded, setDictionaryLoaded] = useState(isDictionaryLoaded());
  const [showInternalRhymes, setShowInternalRhymes] = useState(false);

  // Initialize lines based on selected form
  useEffect(() => {
    if (selectedForm.lineCount > 0) {
      setLines(prev => {
        const newLines = [...prev];
        while (newLines.length < selectedForm.lineCount) {
          newLines.push('');
        }
        return newLines.slice(0, selectedForm.lineCount);
      });
    }
  }, [selectedForm]);

  // For free verse mode, join lines into text
  const poemText = useMemo(() => lines.join('\n'), [lines]);
  const debouncedPoemText = useDebounce(poemText, 300);

  // Result for free verse mode
  const [freeVerseResult, setFreeVerseResult] = useState<RhymeResult | null>(null);
  const [internalRhymes, setInternalRhymes] = useState<InternalRhyme[]>([]);

  useEffect(() => {
    async function loadDict() {
      if (!isDictionaryLoaded()) {
        await loadCMUDictionary();
        setDictionaryLoaded(true);
      }
    }
    loadDict();
  }, []);

  // Analyze for free verse mode
  useEffect(() => {
    if (dictionaryLoaded && debouncedPoemText.trim() && selectedForm.id === 'free-verse') {
      const schemeResult = detectRhymeScheme(debouncedPoemText);
      setFreeVerseResult(schemeResult);
      const internal = detectInternalRhymes(debouncedPoemText);
      setInternalRhymes(internal);
    } else {
      setFreeVerseResult(null);
      setInternalRhymes([]);
    }
  }, [debouncedPoemText, dictionaryLoaded, selectedForm.id]);

  // Analyze for form-based mode
  const formAnalysis = useMemo(() => {
    if (!dictionaryLoaded || selectedForm.id === 'free-verse') return null;
    return analyzeFormCompliance(lines, selectedForm);
  }, [lines, selectedForm, dictionaryLoaded]);

  // Progress stats for form-based mode
  const progressStats = useMemo(() => {
    if (!formAnalysis) return null;

    const filledLines = formAnalysis.filter(a => a.endWord);
    const correct = formAnalysis.filter(a => a.rhymeStatus === 'correct').length;
    const slant = formAnalysis.filter(a => a.rhymeStatus === 'slant').length;
    const incorrect = formAnalysis.filter(a => a.rhymeStatus === 'incorrect').length;
    const pending = formAnalysis.filter(a => a.rhymeStatus === 'pending').length;

    return { filled: filledLines.length, total: formAnalysis.length, correct, slant, incorrect, pending };
  }, [formAnalysis]);

  const handleLineChange = useCallback((index: number, value: string) => {
    setLines(prev => {
      const newLines = [...prev];
      newLines[index] = value;
      return newLines;
    });
  }, []);

  const handleFormSelect = (form: PoetryForm) => {
    if (lines.some(l => l.trim()) && !window.confirm('Changing forms will adjust the number of lines. Continue?')) {
      return;
    }
    setSelectedForm(form);
    if (form.lineCount > 0) {
      setLines(Array(form.lineCount).fill(''));
    } else {
      // Free verse - keep existing or start with some empty lines
      setLines(prev => prev.length > 0 ? prev : Array(8).fill(''));
    }
  };

  const loadExample = (example: typeof EXAMPLE_POEMS[0]) => {
    if (lines.some(l => l.trim()) && !window.confirm('This will replace your current text. Continue?')) {
      return;
    }
    const form = POETRY_FORMS.find(f => f.id === example.formId) || POETRY_FORMS[0];
    setSelectedForm(form);
    const exampleLines = example.poem.split('\n');
    if (form.lineCount > 0) {
      setLines(exampleLines.slice(0, form.lineCount));
    } else {
      setLines(exampleLines);
    }
  };

  const clearAll = () => {
    if (selectedForm.lineCount > 0) {
      setLines(Array(selectedForm.lineCount).fill(''));
    } else {
      setLines(Array(8).fill(''));
    }
    setFreeVerseResult(null);
    setInternalRhymes([]);
  };

  const addLine = () => {
    setLines(prev => [...prev, '']);
  };

  const isFreeVerse = selectedForm.id === 'free-verse';

  // Determine placeholder text for each line
  const getPlaceholder = (index: number): string => {
    if (isFreeVerse) return 'Type your line...';
    const label = selectedForm.scheme[index];
    if (!label) return 'Type your line...';

    // Find other lines with the same label
    const sameLabel = selectedForm.scheme
      .split('')
      .map((l, i) => ({ label: l, index: i }))
      .filter(item => item.label === label && item.index !== index);

    if (sameLabel.length === 0) {
      return `Line ${index + 1} - rhyme group ${label}`;
    }

    const otherLineNums = sameLabel.map(item => item.index + 1).join(', ');
    return `Rhymes with line${sameLabel.length > 1 ? 's' : ''} ${otherLineNums}`;
  };

  return (
    <Layout>
      <SEOHead
        title="Rhyme Scheme Maker - Create Limericks, Sonnets, and More"
        description="Interactive rhyme scheme maker for poetry. Write limericks, sonnets, quatrains with real-time rhyme guidance. See correct and incorrect rhymes highlighted as you type."
        canonicalPath="/rhyme-scheme-analyzer"
        keywords="rhyme scheme maker, limerick generator, sonnet writer, rhyme pattern, ABAB rhyme, poetry form, rhyme helper"
      />

      <div className="rhyme-scheme-analyzer">
        <h1>Rhyme Scheme Maker</h1>
        <p className="analyzer-subtitle">
          Create poetry with guided rhyme schemes
        </p>

        {/* Form Selector */}
        <div className="form-selector">
          <span className="form-selector-label">Choose a poetry form:</span>
          <div className="form-selector-grid">
            {POETRY_FORMS.map(form => (
              <button
                key={form.id}
                className={`form-option ${selectedForm.id === form.id ? 'selected' : ''}`}
                onClick={() => handleFormSelect(form)}
              >
                <span className="form-option-name">{form.name}</span>
                {form.scheme && (
                  <span className="form-option-scheme">{form.scheme}</span>
                )}
                {form.lineCount > 0 && (
                  <span className="form-option-lines">{form.lineCount} lines</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Editor Section */}
        <div className="rhyme-editor-section">
          <div className="editor-header">
            <span className="editor-label">
              {isFreeVerse
                ? 'Write your poem (rhyme scheme will be detected)'
                : `Write your ${selectedForm.name}`
              }
            </span>
            <div className="editor-actions">
              <button onClick={clearAll} className="clear-button">
                Clear
              </button>
              {isFreeVerse && (
                <button onClick={addLine} className="load-example-button">
                  Add Line
                </button>
              )}
            </div>
          </div>

          <div className="rhyme-editor-container">
            <div className="rhyme-editor-lines">
              {lines.map((line, index) => {
                const analysis = formAnalysis?.[index];
                const expectedLabel = analysis?.expectedLabel || '';
                const rhymeStatus = analysis?.rhymeStatus || 'pending';
                const endWord = analysis?.endWord || getLastWord(line);

                // Check for stanza breaks
                const isAfterStanzaBreak = selectedForm.stanzaBreaks?.includes(index);

                return (
                  <div key={index}>
                    {isAfterStanzaBreak && <div className="stanza-separator" />}
                    <div className="editor-line">
                      <div className="line-guidance">
                        {!isFreeVerse && expectedLabel && (
                          <span
                            className={`expected-scheme-label rhyme-${rhymeStatus}`}
                            title={`Expected rhyme: ${expectedLabel}`}
                          >
                            {expectedLabel}
                          </span>
                        )}
                        {isFreeVerse && (
                          <span className="line-number-display">{index + 1}</span>
                        )}
                      </div>
                      <div className="line-input-wrapper">
                        <input
                          type="text"
                          className="line-input"
                          value={line}
                          onChange={(e) => handleLineChange(index, e.target.value)}
                          placeholder={getPlaceholder(index)}
                        />
                      </div>
                      <div className="line-end-word">
                        {endWord && !isFreeVerse && (
                          <span
                            className={`end-word-display rhyme-${rhymeStatus}`}
                            title={
                              rhymeStatus === 'correct' ? 'Perfect rhyme match' :
                              rhymeStatus === 'slant' ? 'Slant rhyme (close match)' :
                              rhymeStatus === 'incorrect' ? 'Does not match expected rhyme' :
                              'Waiting for matching line'
                            }
                          >
                            {endWord}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Summary for form-based mode */}
          {!isFreeVerse && progressStats && (
            <div className="progress-summary">
              <div className="progress-item">
                <span className="progress-dot correct" />
                <span className="progress-label">Correct:</span>
                <span className="progress-count">{progressStats.correct}</span>
              </div>
              <div className="progress-item">
                <span className="progress-dot slant" />
                <span className="progress-label">Slant:</span>
                <span className="progress-count">{progressStats.slant}</span>
              </div>
              <div className="progress-item">
                <span className="progress-dot incorrect" />
                <span className="progress-label">Incorrect:</span>
                <span className="progress-count">{progressStats.incorrect}</span>
              </div>
              <div className="progress-item">
                <span className="progress-dot pending" />
                <span className="progress-label">Pending:</span>
                <span className="progress-count">{progressStats.pending}</span>
              </div>
            </div>
          )}
        </div>

        {/* Free Verse Analysis Results */}
        {isFreeVerse && freeVerseResult && freeVerseResult.schemePattern.length > 0 && (
          <div className="analysis-results">
            <div className="overall-scheme">
              <span className="scheme-label">Detected Pattern:</span>
              <span className="scheme-value">{freeVerseResult.scheme}</span>
              {freeVerseResult.scheme.includes('X') && (
                <span className="scheme-hint">
                  (X = no rhyme found for that line)
                </span>
              )}
            </div>

            <div className="line-analyses">
              <h2>Line-by-Line Analysis</h2>
              <div className="poem-visualization">
                {lines.map((line, idx) => {
                  if (!line.trim()) {
                    return <div key={idx} className="poem-line empty-line">&nbsp;</div>;
                  }

                  const nonEmptyIndex = freeVerseResult.lineNumbers.indexOf(idx + 1);
                  if (nonEmptyIndex === -1) return null;

                  const label = freeVerseResult.schemePattern[nonEmptyIndex];
                  const endWord = freeVerseResult.lineEndWords[nonEmptyIndex];
                  const quality = freeVerseResult.rhymeQualities[nonEmptyIndex];
                  const color = label !== 'X' ? getColorForLabel(label) : 'var(--color-text-muted)';

                  return (
                    <div key={idx} className="poem-line">
                      <span className="line-number-display">{idx + 1}</span>
                      <span className="line-text-display">{line}</span>
                      <span
                        className={`rhyme-label ${quality}`}
                        style={{ backgroundColor: color }}
                        title={label === 'X'
                          ? `"${endWord}" - No rhyme found (unique line ending)`
                          : `"${endWord}" - ${quality === 'perfect' ? 'Perfect rhyme' : quality === 'slant' ? 'Slant rhyme' : 'Unique ending'}`}
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
                {Array.from(freeVerseResult.rhymeGroups.entries())
                  .filter(([, lineNums]) => lineNums.length > 1)
                  .map(([label, lineNums]) => {
                    const color = getColorForLabel(label);
                    const words = lineNums.map(lineNum => {
                      const idx = freeVerseResult.lineNumbers.indexOf(lineNum);
                      return freeVerseResult.lineEndWords[idx];
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
                        <span className="internal-arrow">-</span>
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
            {EXAMPLE_POEMS.map((example, idx) => {
              const form = POETRY_FORMS.find(f => f.id === example.formId);
              return (
                <button
                  key={idx}
                  onClick={() => loadExample(example)}
                  className="example-card"
                >
                  <div className="example-title">{example.title}</div>
                  <div className="example-meter">{form?.scheme || ''}</div>
                  <div className="example-attribution">{example.author}</div>
                </button>
              );
            })}
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
          <p>Want meter analysis, cliche detection, and more?</p>
          <Link to="/" className="cta-button">
            Open Poetry Editor
          </Link>
        </div>
      </div>
    </Layout>
  );
}
