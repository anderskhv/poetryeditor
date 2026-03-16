import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { SEOHead } from '../../components/SEOHead';
import './LearnPages.css';

export function LearnAvoidingCliches() {
  return (
    <Layout>
      <SEOHead
        title="How to Avoid Cliche Rhymes in Poetry - Fresh Alternatives"
        description="Learn to spot and avoid the most overused rhyme pairs in poetry: love/above, heart/apart, fire/desire, night/light. Discover strategies for finding fresh, surprising rhymes."
        canonicalPath="/learn/avoiding-cliches"
        keywords="cliche rhymes, overused rhymes, love above rhyme, heart apart rhyme, avoid cliche poetry, fresh rhymes, poetry writing tips, rhyme alternatives"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "How to Avoid Cliche Rhymes in Poetry",
          "description": "Spot the most overused rhyme pairs and learn strategies for finding fresh, surprising alternatives.",
          "author": {
            "@type": "Organization",
            "name": "Poetry Editor"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Poetry Editor",
            "url": "https://poetryeditor.com"
          }
        }}
      />

      <article className="learn-page">
        <header className="learn-header">
          <div className="learn-breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span>Learn</span>
            <span className="breadcrumb-sep">/</span>
            <span>Avoiding Cliches</span>
          </div>
          <h1>How to Avoid Cliche Rhymes</h1>
          <p className="learn-subtitle">
            The most overused rhyme pairs in English poetry — and how to find fresh alternatives
          </p>
        </header>

        <div className="learn-content">
          <section className="learn-section">
            <h2>The Most Overused Rhyme Pairs</h2>
            <p>
              Certain rhyme pairs have been used so many millions of times that they've lost all
              surprise. When a reader encounters them, the brain auto-completes before the line
              ends — and predictability is the enemy of poetry. Here are the worst offenders:
            </p>

            <div className="example-box">
              <div className="example-label">The Hall of Shame</div>
              <div className="poem-example">
                <div className="poem-line"><strong>love / above / dove</strong> — the holy trinity of greeting-card poetry</div>
                <div className="poem-line"><strong>heart / apart / start</strong> — every breakup poem's default</div>
                <div className="poem-line"><strong>fire / desire</strong> — passion reduced to a reflex</div>
                <div className="poem-line"><strong>night / light / sight</strong> — the most rhymed words in English</div>
                <div className="poem-line"><strong>moon / June / soon</strong> — Tin Pan Alley's legacy</div>
                <div className="poem-line"><strong>tears / fears / years</strong> — sadness on autopilot</div>
                <div className="poem-line"><strong>day / way / say / stay</strong> — ubiquitous and empty</div>
                <div className="poem-line"><strong>soul / whole / role</strong> — depth without content</div>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Why Cliche Rhymes Are a Problem</h2>
            <p>
              The issue isn't that these words are bad — it's that the <em>pairing</em> is dead.
              When you rhyme "love" with "above," the reader's brain has already completed the
              line before their eyes reach it. You've lost the element of surprise, and with it,
              the reader's attention.
            </p>
            <ul className="feature-list">
              <li><strong>They signal amateur writing:</strong> Experienced editors spot cliche rhymes instantly. They suggest the poet reached for the first available rhyme rather than the best one.</li>
              <li><strong>They flatten meaning:</strong> "Love" is complex and specific in your experience. Pairing it with "above" reduces it to a generic sentiment.</li>
              <li><strong>They make poems forgettable:</strong> If the reader has heard the same rhyme a thousand times, your poem blends into the mass. Original rhymes create memorable moments.</li>
            </ul>
          </section>

          <section className="learn-section">
            <h2>Strategies for Fresh Rhymes</h2>

            <div className="steps-list">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Use Slant Rhyme</h4>
                  <p>
                    Instead of "love/above," try "love/move," "love/have," or "love/wolf."
                    Slant rhyme gives you the echo without the predictability. Emily Dickinson
                    built an entire body of work on this principle. See our{' '}
                    <Link to="/learn/slant-rhyme">Slant Rhyme Guide</Link>.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Reach for Multi-Syllable Rhymes</h4>
                  <p>
                    Most cliche pairs are monosyllabic. Try rhyming with longer words:
                    "desire" could rhyme with "rewire," "transpire," "sapphire," or
                    "high-wire." Multi-syllable rhymes feel more inventive because they're rarer.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Change the End Word</h4>
                  <p>
                    If you've written a line ending in "heart," don't look for a rhyme for "heart."
                    Instead, rewrite the line so it ends on a less predictable word. Often the best
                    fix for a cliche rhyme is restructuring the sentence, not finding a cleverer match.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Use Unexpected Word Domains</h4>
                  <p>
                    "Night" rhymed with "light" is dead. "Night" rhymed with "meteorite," "appetite,"
                    or "Fahrenheit" is alive — the unexpected domain (science, food, measurement)
                    creates surprise and fresh imagery.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h4>Try Our Cliche Filter</h4>
                  <p>
                    When you use our <Link to="/rhymes">Rhyme Finder</Link>, pay attention to
                    which results feel immediately obvious — those are the ones to avoid. The
                    best rhyme is usually not the first one that comes to mind.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>When Cliche Rhymes Are Intentional</h2>
            <p>
              There's one exception: deliberate use for ironic or comedic effect. If you're
              writing satire, parody, or a poem that knowingly plays with convention, a cliche
              rhyme can signal that you're in on the joke. The difference between amateur and
              intentional is context — if the poem demonstrates craft everywhere else, the reader
              trusts that the cliche is a choice.
            </p>

            <div className="example-box">
              <div className="example-label">Intentional Cliche</div>
              <div className="poem-example">
                <div className="poem-line">They said that love comes from above,</div>
                <div className="poem-line">as if the sky owed us a debt —</div>
                <div className="poem-line">but love, I've found, comes from the ground,</div>
                <div className="poem-line">from dirt and root and sweat.</div>
              </div>
              <div className="example-analysis">
                Here the cliche "love/above" is introduced only to be rejected. The real rhyme
                — "ground" and "found," "debt" and "sweat" — carries the poem's actual argument.
                The cliche serves as a foil.
              </div>
            </div>
          </section>

          <section className="learn-section cta-section">
            <h2>Try It Yourself</h2>
            <p>
              Use our <Link to="/rhymes">Rhyme Finder</Link> to explore alternatives for your
              end words. When the obvious rhyme appears, skip it — scroll down to the slant
              rhymes and multi-syllable options. Or learn more about near-rhyme techniques in
              our <Link to="/learn/slant-rhyme">Slant Rhyme Guide</Link>.
            </p>
            <div className="cta-buttons">
              <Link to="/rhymes" className="cta-button primary">
                Find Fresh Rhymes
              </Link>
              <Link to="/" className="cta-button secondary">
                Open Poetry Editor
              </Link>
            </div>
          </section>

          <section className="learn-section related-section">
            <h2>Continue Learning</h2>
            <div className="related-links">
              <Link to="/learn/slant-rhyme" className="related-link">
                <span className="related-icon">🔔</span>
                <span className="related-text">
                  <strong>Guide to Slant Rhyme</strong>
                  <span>The art of almost-rhyming</span>
                </span>
              </Link>
              <Link to="/learn/free-verse" className="related-link">
                <span className="related-icon">🌊</span>
                <span className="related-text">
                  <strong>How to Write Free Verse</strong>
                  <span>Poetry beyond rhyme schemes</span>
                </span>
              </Link>
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
}
