import { useParams, Link, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { getRhymeSchemeById, getAllRhymeSchemes, RhymeScheme } from '../data/rhymeSchemes';
import './RhymeSchemePage.css';

// Color assignments for rhyme labels
const rhymeColors: Record<string, string> = {
  'A': 'var(--rhyme-color-a)',
  'B': 'var(--rhyme-color-b)',
  'C': 'var(--rhyme-color-c)',
  'D': 'var(--rhyme-color-d)',
  'E': 'var(--rhyme-color-e)',
  'F': 'var(--rhyme-color-f)',
  'G': 'var(--rhyme-color-g)',
  '-': 'var(--color-text-muted)'
};

function RhymeLabel({ label }: { label: string }) {
  const color = rhymeColors[label] || 'var(--color-text-muted)';
  return (
    <span
      className="rhyme-scheme-label"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

function PatternDisplay({ pattern }: { pattern: string }) {
  // Split pattern into individual letters for coloring
  const letters = pattern.replace(/\s+/g, ' ').split('');

  return (
    <div className="pattern-display">
      {letters.map((letter, i) => {
        if (letter === ' ') {
          return <span key={i} className="pattern-space" />;
        }
        const color = rhymeColors[letter] || 'var(--color-text-muted)';
        return (
          <span
            key={i}
            className="pattern-letter"
            style={{ color }}
          >
            {letter}
          </span>
        );
      })}
    </div>
  );
}

function generateFAQSchema(scheme: RhymeScheme) {
  const patternName = scheme.name.split('(')[0].trim();
  const schemePattern = scheme.pattern.replace(/\s+/g, '');

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is the ${schemePattern} rhyme scheme?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": scheme.description
        }
      },
      {
        "@type": "Question",
        "name": `What is ${patternName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": scheme.explanation.split('\n\n')[0]
        }
      },
      {
        "@type": "Question",
        "name": `What poems use the ${schemePattern} rhyme scheme?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Famous poems using ${schemePattern} include: ${scheme.famousPoems.slice(0, 5).map(p => `"${p.title}" by ${p.poet}`).join(', ')}.`
        }
      },
      {
        "@type": "Question",
        "name": `How do I write a poem with ${schemePattern} rhyme scheme?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": scheme.writingTips.slice(0, 3).join(' ')
        }
      }
    ]
  };
}

export function RhymeSchemePage() {
  const { scheme: schemeId } = useParams<{ scheme: string }>();

  if (!schemeId) {
    return <Navigate to="/rhyme-scheme-analyzer" replace />;
  }

  const scheme = getRhymeSchemeById(schemeId);

  if (!scheme) {
    // Try to find a similar scheme or redirect
    return <Navigate to="/rhyme-scheme-analyzer" replace />;
  }

  const allSchemes = getAllRhymeSchemes();
  const relatedSchemes = scheme.relatedSchemes
    .map(id => allSchemes.find(s => s.id === id))
    .filter((s): s is RhymeScheme => s !== undefined);

  const patternForTitle = scheme.pattern.replace(/\s+/g, '');
  const pageTitle = `${patternForTitle} Rhyme Scheme - ${scheme.name}`;
  const pageDescription = `Learn the ${patternForTitle} rhyme scheme (${scheme.name.split('(')[0].trim()}). ${scheme.description} Examples, tips, and famous poems.`;

  return (
    <Layout>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalPath={`/rhyme-scheme/${schemeId}`}
        keywords={`${patternForTitle} rhyme scheme, ${scheme.alternateNames?.join(', ') || ''}, rhyme pattern, poetry rhyme scheme, ${scheme.commonForms.join(', ')}`}
        jsonLd={generateFAQSchema(scheme)}
      />

      <article className="rhyme-scheme-page">
        <header className="rhyme-scheme-header">
          <div className="rhyme-scheme-breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/rhyme-scheme-analyzer">Rhyme Schemes</Link>
            <span className="breadcrumb-sep">/</span>
            <span>{patternForTitle}</span>
          </div>

          <h1>{scheme.name}</h1>

          <p className="rhyme-scheme-subtitle">{scheme.description}</p>

          <div className="rhyme-scheme-meta">
            <span className={`difficulty-badge ${scheme.difficulty}`}>
              {scheme.difficulty}
            </span>
            {scheme.alternateNames && scheme.alternateNames.length > 0 && (
              <span className="alternate-names">
                Also called: {scheme.alternateNames.join(', ')}
              </span>
            )}
          </div>
        </header>

        <div className="rhyme-scheme-content">
          {/* Visual Pattern Section */}
          <section className="rhyme-scheme-section">
            <h2>The Pattern</h2>
            <div className="pattern-visual">
              <PatternDisplay pattern={scheme.pattern} />
            </div>
            <div className="pattern-explanation">
              {scheme.explanation.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          {/* Example Section */}
          <section className="rhyme-scheme-section">
            <h2>Example with Highlighted Rhymes</h2>
            <div className="example-box">
              <div className="example-poem">
                {scheme.example.lines.map((line, i) => {
                  const label = scheme.example.labels[i];
                  if (line === '') {
                    return <div key={i} className="poem-line stanza-break" />;
                  }
                  return (
                    <div key={i} className="poem-line-with-label">
                      <span className="poem-line-text">{line}</span>
                      {label && <RhymeLabel label={label} />}
                    </div>
                  );
                })}
              </div>
              <div className="example-attribution">
                {scheme.example.poemSlug ? (
                  <Link to={`/poems/${scheme.example.poemSlug}`}>
                    {scheme.example.attribution}
                  </Link>
                ) : (
                  <span>{scheme.example.attribution}</span>
                )}
              </div>
            </div>
          </section>

          {/* Famous Poems Section */}
          <section className="rhyme-scheme-section">
            <h2>Famous Poems Using This Scheme</h2>
            <ul className="famous-poems-list">
              {scheme.famousPoems.map((poem, i) => (
                <li key={i}>
                  {poem.slug ? (
                    <Link to={`/poems/${poem.slug}`} className="poem-link">
                      <span className="poem-title">"{poem.title}"</span>
                      <span className="poem-poet">by {poem.poet}</span>
                    </Link>
                  ) : (
                    <span className="poem-link no-link">
                      <span className="poem-title">"{poem.title}"</span>
                      <span className="poem-poet">by {poem.poet}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* Writing Tips Section */}
          <section className="rhyme-scheme-section">
            <h2>Tips for Writing in {patternForTitle}</h2>
            <div className="tips-list">
              {scheme.writingTips.map((tip, i) => (
                <div key={i} className="tip-item">
                  <span className="tip-number">{i + 1}</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Common Forms Section */}
          {scheme.commonForms.length > 0 && (
            <section className="rhyme-scheme-section">
              <h2>Common Forms Using This Scheme</h2>
              <div className="forms-list">
                {scheme.commonForms.map((form, i) => (
                  <span key={i} className="form-tag">{form}</span>
                ))}
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section className="rhyme-scheme-section cta-section">
            <h2>Try Writing in {patternForTitle}</h2>
            <p>
              Ready to write your own poem using the {scheme.name.split('(')[0].trim()}?
              Our editor includes real-time rhyme analysis to help you stay on track.
            </p>
            <div className="cta-buttons">
              <Link to="/" className="cta-button primary">
                Open Poetry Editor
              </Link>
              <Link to="/rhyme-scheme-analyzer" className="cta-button secondary">
                Analyze a Poem
              </Link>
            </div>
          </section>

          {/* Related Schemes Section */}
          {relatedSchemes.length > 0 && (
            <section className="rhyme-scheme-section related-section">
              <h2>Related Rhyme Schemes</h2>
              <div className="related-schemes">
                {relatedSchemes.map(related => (
                  <Link
                    key={related.id}
                    to={`/rhyme-scheme/${related.id}`}
                    className="related-scheme-card"
                  >
                    <span className="related-pattern">{related.pattern}</span>
                    <span className="related-name">{related.name.split('(')[0].trim()}</span>
                    <span className="related-description">{related.description}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* All Schemes Link */}
          <section className="rhyme-scheme-section browse-section">
            <h2>Browse All Rhyme Schemes</h2>
            <div className="all-schemes-grid">
              {allSchemes.map(s => (
                <Link
                  key={s.id}
                  to={`/rhyme-scheme/${s.id}`}
                  className={`scheme-mini-card ${s.id === schemeId ? 'current' : ''}`}
                >
                  <span className="mini-pattern">{s.pattern.replace(/\s+/g, '')}</span>
                  <span className="mini-name">{s.name.split('(')[0].trim()}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
}
