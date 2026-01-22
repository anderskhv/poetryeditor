import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { loadCMUDictionary, isDictionaryLoaded } from '../utils/cmuDict';
import { detectMeter } from '../utils/meterDetector';
import { analyzeTextStress, createStressVisualization, StressVisualization } from '../utils/stressAnalyzer';
import './MeterAnalyzer.css';

const EXAMPLE_POEMS = [
  {
    title: 'Sonnet 18 (excerpt)',
    author: 'William Shakespeare',
    text: `Shall I compare thee to a summer's day?
Thou art more lovely and more temperate.
Rough winds do shake the darling buds of May,
And summer's lease hath all too short a date.`,
    expectedMeter: 'Iambic Pentameter',
  },
  {
    title: 'The Raven (excerpt)',
    author: 'Edgar Allan Poe',
    text: `Once upon a midnight dreary, while I pondered, weak and weary,
Over many a quaint and curious volume of forgotten lore—
While I nodded, nearly napping, suddenly there came a tapping,
As of some one gently rapping, rapping at my chamber door.`,
    expectedMeter: 'Trochaic Octameter',
  },
  {
    title: 'A Visit from St. Nicholas (excerpt)',
    author: 'Clement Clarke Moore',
    text: `'Twas the night before Christmas, when all through the house
Not a creature was stirring, not even a mouse;
The stockings were hung by the chimney with care,
In hopes that St. Nicholas soon would be there.`,
    expectedMeter: 'Anapestic Tetrameter',
  },
];

interface LineAnalysis {
  text: string;
  stresses: number[];
  meter: string;
  visualization: StressVisualization[];
}

export function MeterAnalyzer() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<{
    overallMeter: string;
    lines: LineAnalysis[];
  } | null>(null);
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
    if (dictionaryLoaded && text.trim()) {
      analyzePoem();
    } else {
      setAnalysis(null);
    }
  }, [text, dictionaryLoaded]);

  const analyzePoem = () => {
    if (!dictionaryLoaded || !text.trim()) return;

    const overallMeter = detectMeter(text);
    const stressAnalyses = analyzeTextStress(text);
    const lines = text.split('\n').filter(line => line.trim());

    const lineAnalyses: LineAnalysis[] = lines.map((line, idx) => {
      const stressInfo = stressAnalyses[idx] || { stresses: [], words: [] };
      const visualization = createStressVisualization(line);

      // Determine line-specific meter based on stress pattern
      let lineMeter = 'Free verse';
      const syllableCount = stressInfo.stresses.length;
      const stressPattern = stressInfo.stresses;

      if (syllableCount === 10) {
        // Check for iambic pentameter pattern
        const isIambic = stressPattern.every((s, i) =>
          i % 2 === 0 ? s === 0 : s >= 1
        ) || stressPattern.filter((_, i) => i % 2 === 1).every(s => s >= 1);
        if (isIambic) lineMeter = 'Iambic Pentameter';
      } else if (syllableCount === 8) {
        lineMeter = 'Tetrameter (8 syllables)';
      } else if (syllableCount === 12) {
        lineMeter = 'Hexameter (12 syllables)';
      }

      return {
        text: line,
        stresses: stressInfo.stresses,
        meter: lineMeter,
        visualization,
      };
    });

    setAnalysis({
      overallMeter,
      lines: lineAnalyses,
    });
  };

  const loadExample = (example: typeof EXAMPLE_POEMS[0]) => {
    setText(example.text);
  };

  const clearAll = () => {
    setText('');
    setAnalysis(null);
  };

  return (
    <Layout>
      <SEOHead
        title="Meter Analyzer - Detect Iambic Pentameter & Poetic Meter"
        description="Free online meter analyzer. Detect iambic pentameter, trochaic, anapestic, and dactylic meters. Visualize stress patterns in your poetry instantly."
        canonicalPath="/meter-analyzer"
        keywords="meter analyzer, iambic pentameter checker, scansion tool, stress pattern analyzer, poetry meter, trochaic meter, anapestic meter"
      />

      <div className="meter-analyzer">
        <h1>Meter Analyzer</h1>
        <p className="meter-subtitle">
          Detect and visualize poetic meter and stress patterns
        </p>

        <div className="meter-form">
          <label className="input-label">
            Paste your poem
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your poem here..."
            className="poem-input"
            rows={6}
          />
          <div className="meter-actions">
            <button onClick={clearAll} className="clear-button">
              Clear
            </button>
          </div>
        </div>

        {analysis && (
          <div className="analysis-results">
            <div className="overall-meter">
              <span className="meter-label">Detected Meter:</span>
              <span className="meter-value">{analysis.overallMeter}</span>
            </div>

            <div className="line-analyses">
              <h2>Line-by-Line Analysis</h2>
              {analysis.lines.map((line, idx) => (
                <div key={idx} className="line-analysis">
                  <div className="line-header">
                    <span className="line-number">Line {idx + 1}</span>
                    <span className="line-syllables">{line.stresses.length} syllables</span>
                  </div>
                  <div className="line-text">{line.text}</div>
                  <div className="stress-visualization">
                    {line.visualization.map((item, idx) => (
                      <span
                        key={idx}
                        className={`syllable ${item.stress >= 1 ? 'stressed' : 'unstressed'}${item.isUnknown ? ' unknown' : ''}`}
                      >
                        {item.text}
                      </span>
                    ))}
                  </div>
                  <div className="stress-pattern">
                    {line.stresses.map((s, i) => (
                      <span key={i} className={`stress-mark ${s >= 1 ? 'strong' : 'weak'}`}>
                        {s >= 1 ? '/' : 'u'}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="example-poems">
          <h2>Example Poems</h2>
          <p className="examples-intro">
            Click to load an example and see meter analysis in action:
          </p>
          <div className="examples-grid">
            {EXAMPLE_POEMS.map((example, idx) => (
              <button
                key={idx}
                onClick={() => loadExample(example)}
                className="example-card"
              >
                <div className="example-title">{example.title}</div>
                <div className="example-meter">{example.expectedMeter}</div>
                <div className="example-attribution">— {example.author}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="meter-info">
          <h2>About Poetic Meter</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>Iambic (da-DUM)</h3>
              <p>
                An unstressed syllable followed by a stressed syllable. Most common
                in English poetry. "Shall I comPARE thee TO a SUMmer's DAY?"
              </p>
            </div>
            <div className="info-card">
              <h3>Trochaic (DUM-da)</h3>
              <p>
                A stressed syllable followed by an unstressed syllable. Creates a
                falling rhythm. "DOUble, DOUble, TOIL and TROUble"
              </p>
            </div>
            <div className="info-card">
              <h3>Anapestic (da-da-DUM)</h3>
              <p>
                Two unstressed syllables followed by a stressed syllable. Creates a
                galloping rhythm. "'Twas the NIGHT before CHRISTmas"
              </p>
            </div>
            <div className="info-card">
              <h3>Dactylic (DUM-da-da)</h3>
              <p>
                A stressed syllable followed by two unstressed syllables. Used in
                classical poetry. "THIS is the FORest primEVal"
              </p>
            </div>
          </div>
        </div>

        <div className="meter-cta">
          <p>Want complete poetry analysis?</p>
          <Link to="/" className="cta-button">
            Open Poetry Editor
          </Link>
        </div>
      </div>
    </Layout>
  );
}
