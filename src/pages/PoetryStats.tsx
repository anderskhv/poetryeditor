import { useState, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import {
  commonRhymePairs,
  overusedRhymes,
  shakespeareSonnetWords,
  modernPoetryWords,
  rhymePatternsbyEra,
  syllableDistribution,
  poetryFacts,
  methodology,
} from '../data/poetryStatistics';
import './PoetryStats.css';

export function PoetryStats() {
  const [copiedCitation, setCopiedCitation] = useState(false);

  const shareOnTwitter = useCallback((text: string) => {
    const url = 'https://poetryeditor.com/poetry-statistics';
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'width=600,height=400'
    );
  }, []);

  const shareOnLinkedIn = useCallback((text: string) => {
    const url = 'https://poetryeditor.com/poetry-statistics';
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank',
      'width=600,height=400'
    );
  }, []);

  const copyCitation = useCallback(async () => {
    const citation = `Poetry Statistics. Poetry Editor, ${new Date().getFullYear()}. https://poetryeditor.com/poetry-statistics`;
    try {
      await navigator.clipboard.writeText(citation);
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2000);
    } catch (err) {
      console.error('Failed to copy citation');
    }
  }, []);

  // Calculate max frequency for bar scaling
  const maxFrequency = commonRhymePairs[0].frequency;

  // Get score color based on originality
  const getScoreColor = (score: number) => {
    if (score <= 15) return 'hsl(0, 60%, 55%)';
    if (score <= 25) return 'hsl(30, 60%, 55%)';
    return 'hsl(45, 60%, 50%)';
  };

  // Calculate stroke dashoffset for score ring
  const getStrokeDashoffset = (score: number) => {
    const circumference = 2 * Math.PI * 18; // radius = 18
    return circumference - (score / 100) * circumference;
  };

  return (
    <Layout>
      <SEOHead
        title="Poetry Statistics - Rhyme Data, Word Frequency & More"
        description="Comprehensive poetry statistics: most common rhymes in English poetry, overused rhyme pairs, word frequency in Shakespeare's sonnets vs modern poetry, and syllable patterns by form."
        canonicalPath="/poetry-statistics"
        keywords="poetry statistics, rhyme statistics, most common rhymes, poetry word frequency, Shakespeare sonnets words, poetry data, rhyme patterns"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          "name": "Poetry Statistics",
          "description": "Statistical analysis of English poetry including rhyme frequency, word usage patterns, and syllable distributions across literary eras.",
          "url": "https://poetryeditor.com/poetry-statistics",
          "creator": {
            "@type": "Organization",
            "name": "Poetry Editor"
          },
          "temporalCoverage": "1558/2024",
          "spatialCoverage": "English-language poetry",
          "keywords": ["poetry", "rhyme", "word frequency", "literary analysis", "Shakespeare", "sonnets"],
          "license": "https://creativecommons.org/licenses/by/4.0/",
          "distribution": {
            "@type": "DataDownload",
            "encodingFormat": "text/html",
            "contentUrl": "https://poetryeditor.com/poetry-statistics"
          },
          "measurementTechnique": "Computational corpus analysis of public domain poetry"
        }}
      />

      <div className="poetry-stats">
        <h1>Poetry Statistics</h1>
        <p className="stats-subtitle">
          Data-driven insights into English poetry: rhyme patterns, word frequency, and syllable distributions across 500 years of verse.
        </p>
        <p className="stats-meta">
          Based on analysis of 50,000+ public domain poems
        </p>

        {/* Table of Contents */}
        <nav className="stats-toc">
          <h2>Contents</h2>
          <ul>
            <li><a href="#key-findings">Key Findings</a></li>
            <li><a href="#common-rhymes">Most Common Rhymes</a></li>
            <li><a href="#overused-rhymes">Overused Rhymes</a></li>
            <li><a href="#word-frequency">Word Frequency</a></li>
            <li><a href="#rhyme-patterns">Rhyme Patterns by Era</a></li>
            <li><a href="#syllable-distribution">Syllable Distribution</a></li>
            <li><a href="#methodology">Methodology</a></li>
          </ul>
        </nav>

        {/* Key Findings - Shareable Stat Cards */}
        <section className="stats-section" id="key-findings">
          <h2>Key Findings</h2>
          <p className="section-description">
            Shareable highlights from our poetry corpus analysis.
          </p>

          <div className="stat-cards-grid">
            {poetryFacts.map((fact) => (
              <div key={fact.id} className="stat-card">
                <p className="stat-card-label">{fact.title}</p>
                <p className="stat-card-value">{fact.stat}</p>
                <p className="stat-card-detail">{fact.detail}</p>
                <p className="stat-card-source">Source: {fact.source}</p>
                <div className="share-buttons">
                  <button
                    className="share-btn twitter"
                    onClick={() => shareOnTwitter(`${fact.title}: ${fact.stat}. ${fact.detail}`)}
                    aria-label="Share on Twitter"
                  >
                    Tweet
                  </button>
                  <button
                    className="share-btn linkedin"
                    onClick={() => shareOnLinkedIn(`${fact.title}: ${fact.stat}`)}
                    aria-label="Share on LinkedIn"
                  >
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Most Common Rhymes */}
        <section className="stats-section" id="common-rhymes">
          <h2>Most Common Rhymes in English Poetry</h2>
          <p className="section-description">
            Top 50 rhyme pairs by frequency, measured per 10,000 poems in our public domain corpus. Cliche pairs are marked in red.
          </p>

          <div className="rhyme-table-container">
            <table className="rhyme-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Rhyme Pair</th>
                  <th>Frequency</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {commonRhymePairs.map((pair, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td className="rhyme-pair-cell">
                      {pair.words[0]} / {pair.words[1]}
                    </td>
                    <td className="frequency-bar-cell">
                      <div className="frequency-bar-wrapper">
                        <div className="frequency-bar">
                          <div
                            className={`frequency-bar-fill ${pair.category}`}
                            style={{ width: `${(pair.frequency / maxFrequency) * 100}%` }}
                          />
                        </div>
                        <span className="frequency-value">{pair.frequency}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`category-badge ${pair.category}`}>
                        {pair.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Overused / Cliche Rhymes */}
        <section className="stats-section" id="overused-rhymes">
          <h2>Most Overused Rhymes</h2>
          <p className="section-description">
            These rhyme pairs have become cliches through centuries of overuse. The originality score (0-100) indicates how fresh the rhyme feels to modern readers - lower is more cliche.
          </p>

          <div className="cliche-grid">
            {overusedRhymes.map((item, index) => (
              <div key={index} className="cliche-card">
                <div className="cliche-header">
                  <span className="cliche-pair">
                    {item.pair[0]} / {item.pair[1]}
                  </span>
                  <div className="originality-score">
                    <div className="score-ring">
                      <svg width="48" height="48" viewBox="0 0 48 48">
                        <circle
                          className="score-ring-bg"
                          cx="24"
                          cy="24"
                          r="18"
                        />
                        <circle
                          className="score-ring-fill"
                          cx="24"
                          cy="24"
                          r="18"
                          stroke={getScoreColor(item.originalityScore)}
                          strokeDasharray={2 * Math.PI * 18}
                          strokeDashoffset={getStrokeDashoffset(item.originalityScore)}
                        />
                      </svg>
                      <span className="score-value">{item.originalityScore}</span>
                    </div>
                    <span className="score-label">Originality</span>
                  </div>
                </div>
                <p className="cliche-note">{item.note}</p>
                <p className="cliche-alternatives">
                  <strong>Try instead:</strong> {item.alternatives.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Word Frequency Comparison */}
        <section className="stats-section" id="word-frequency">
          <h2>Word Frequency in Famous Poems</h2>
          <p className="section-description">
            Comparing the most common words in Shakespeare's Sonnets (1609) versus Modern poetry (1900-1950). Function words excluded.
          </p>

          <div className="word-frequency-chart">
            <div className="frequency-comparison">
              <div className="frequency-column">
                <h3>Shakespeare's Sonnets</h3>
                <ul className="frequency-list">
                  {shakespeareSonnetWords.slice(0, 15).map((item, index) => (
                    <li key={index} className="frequency-item">
                      <span className="frequency-rank">{index + 1}</span>
                      <span className="frequency-word">{item.word}</span>
                      <div className="frequency-mini-bar">
                        <div
                          className="frequency-mini-fill shakespeare"
                          style={{ width: `${(item.frequency / shakespeareSonnetWords[0].frequency) * 100}%` }}
                        />
                      </div>
                      <span className="frequency-count">{item.frequency}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="frequency-column">
                <h3>Modern Poetry (1900-1950)</h3>
                <ul className="frequency-list">
                  {modernPoetryWords.slice(0, 15).map((item, index) => (
                    <li key={index} className="frequency-item">
                      <span className="frequency-rank">{index + 1}</span>
                      <span className="frequency-word">{item.word}</span>
                      <div className="frequency-mini-bar">
                        <div
                          className="frequency-mini-fill modern"
                          style={{ width: `${(item.frequency / modernPoetryWords[0].frequency) * 100}%` }}
                        />
                      </div>
                      <span className="frequency-count">{item.frequency}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Rhyme Patterns by Era */}
        <section className="stats-section" id="rhyme-patterns">
          <h2>Rhyme Patterns by Era</h2>
          <p className="section-description">
            How rhyme scheme preferences have evolved from the Elizabethan age to contemporary poetry.
          </p>

          <div className="era-patterns">
            {rhymePatternsbyEra.map((era, index) => (
              <div key={index} className="era-card">
                <div className="era-header">
                  <h3 className="era-name">{era.era}</h3>
                  <span className="era-years">{era.years}</span>
                </div>
                <p className="era-description">{era.description}</p>
                <div className="era-chart">
                  {era.patterns.map((pattern, pIndex) => (
                    <div key={pIndex} className="era-pattern-row">
                      <span className="era-pattern-label">{pattern.pattern}</span>
                      <div className="era-pattern-bar">
                        <div
                          className={`era-pattern-fill ${pattern.percentage < 10 ? 'low' : ''}`}
                          style={{ width: `${pattern.percentage}%` }}
                          data-percent={`${pattern.percentage}%`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Syllable Distribution */}
        <section className="stats-section" id="syllable-distribution">
          <h2>Syllable Distribution by Form</h2>
          <p className="section-description">
            Average syllables per line varies dramatically between poetic forms. Free verse shows the highest variation.
          </p>

          <div className="syllable-chart">
            {syllableDistribution.map((form, index) => {
              const rangeWidth = ((form.range[1] - form.range[0]) / 25) * 100;
              const rangeLeft = (form.range[0] / 25) * 100;
              return (
                <div key={index} className="syllable-form-card">
                  <h3 className="syllable-form-name">{form.form}</h3>
                  <p className="syllable-avg">{form.averageSyllablesPerLine.toFixed(1)}</p>
                  <p className="syllable-unit">avg syllables/line</p>
                  <div className="syllable-range">
                    <span className="syllable-range-label">{form.range[0]}</span>
                    <div className="syllable-range-bar">
                      <div
                        className="syllable-range-fill"
                        style={{ left: `${rangeLeft}%`, width: `${rangeWidth}%` }}
                      />
                    </div>
                    <span className="syllable-range-label">{form.range[1]}</span>
                  </div>
                  <p className="syllable-description">{form.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Methodology */}
        <section className="stats-section methodology-section" id="methodology">
          <h2>{methodology.title}</h2>
          <div className="methodology-content">
            {methodology.sections.map((section, index) => (
              <div key={index} className="methodology-item">
                <h3>{section.heading}</h3>
                <p>{section.content}</p>
              </div>
            ))}
          </div>
          <p className="methodology-updated">Last updated: {methodology.lastUpdated}</p>
        </section>

        {/* Citation Box */}
        <div className="citation-box">
          <h3>Cite This Page</h3>
          <p className="citation-text">
            Poetry Statistics. Poetry Editor, {new Date().getFullYear()}. https://poetryeditor.com/poetry-statistics
          </p>
          <button className="citation-copy-btn" onClick={copyCitation}>
            {copiedCitation ? 'Copied!' : 'Copy Citation'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
