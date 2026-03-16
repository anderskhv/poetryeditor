import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { SEOHead } from '../../components/SEOHead';
import './LearnPages.css';

export function LearnPantoum() {
  return (
    <Layout>
      <SEOHead
        title="How to Write a Pantoum - Interlocking Repetition Guide"
        description="Learn how to write a pantoum with our complete guide. Understand the interlocking quatrain structure where lines 2 and 4 become lines 1 and 3 of the next stanza, creating a dreamlike weave."
        canonicalPath="/learn/pantoum"
        keywords="how to write a pantoum, pantoum structure, pantoum poem, interlocking quatrains, Malay pantun, repetition in poetry, pantoum examples"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "How to Write a Pantoum - Interlocking Repetition Guide",
          "description": "Master the pantoum: an interlocking form where repeated lines create dreamlike, layered meaning.",
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
            <span>Pantoum</span>
          </div>
          <h1>How to Write a Pantoum</h1>
          <p className="learn-subtitle">
            A weaving, dreamlike form where every line appears twice, each time in a new context
          </p>
        </header>

        <div className="learn-content">
          <section className="learn-section">
            <h2>What Is a Pantoum?</h2>
            <p>
              A pantoum is a poem of <strong>interlocking quatrains</strong> where lines repeat
              across stanzas in a specific pattern: lines 2 and 4 of each stanza become lines 1
              and 3 of the next. This creates a woven, echoing texture — every line gets heard
              twice, first in one context, then reframed by new surrounding lines.
            </p>
            <p>
              The effect is meditative and dreamlike. Pantoums excel at exploring obsession, memory,
              grief, and any subject where circling back feels natural rather than redundant.
            </p>
          </section>

          <section className="learn-section">
            <h2>Origins: The Malay Pantun</h2>
            <p>
              The pantoum descends from the <strong>Malay pantun</strong>, an oral form dating back
              at least to the 15th century. The pantun was typically four lines: the first two
              established a natural image, and the second two delivered the human meaning. French
              poets, particularly Victor Hugo, adapted the form into the longer interlocking
              structure we use today.
            </p>
          </section>

          <section className="learn-section">
            <h2>Structure</h2>
            <p>
              The pantoum has no fixed length — you decide how many stanzas to write. But the
              interlocking pattern is strict:
            </p>
            <div className="example-box">
              <div className="example-label">The Pattern</div>
              <div className="poem-example">
                <div className="poem-line"><strong>Stanza 1:</strong> A B C D</div>
                <div className="poem-line"><strong>Stanza 2:</strong> B E D F</div>
                <div className="poem-line"><strong>Stanza 3:</strong> E G F H</div>
                <div className="poem-line"><strong>Stanza 4:</strong> G I H J</div>
                <div className="poem-line"><strong>Final:</strong> I C J A (optional circular ending)</div>
              </div>
              <div className="example-analysis">
                Lines 2 and 4 of each stanza become lines 1 and 3 of the next. In the traditional
                closing stanza, lines 1 and 3 of the first stanza return as lines 4 and 2,
                completing the circle.
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>A Pantoum in Action</h2>
            <div className="example-box">
              <div className="example-label">Example: Opening Stanzas</div>
              <div className="poem-example">
                <div className="poem-line">The rain falls steady on the roof tonight. <span className="syllable-note">(A)</span></div>
                <div className="poem-line">I trace the patterns water makes on glass. <span className="syllable-note">(B)</span></div>
                <div className="poem-line">Each drop a small forgetting, brief and bright. <span className="syllable-note">(C)</span></div>
                <div className="poem-line">The years collect like puddles in the grass. <span className="syllable-note">(D)</span></div>
                <div className="poem-line">&nbsp;</div>
                <div className="poem-line">I trace the patterns water makes on glass. <span className="syllable-note">(B)</span></div>
                <div className="poem-line">Your voice comes back in fragments, incomplete. <span className="syllable-note">(E)</span></div>
                <div className="poem-line">The years collect like puddles in the grass. <span className="syllable-note">(D)</span></div>
                <div className="poem-line">We measure loss by what we still repeat. <span className="syllable-note">(F)</span></div>
              </div>
              <div className="example-analysis">
                Notice how "I trace the patterns water makes on glass" shifts from a quiet observation
                in stanza 1 to the opening of a memory in stanza 2. The same words, but the emotional
                weight has changed.
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>How to Write a Pantoum</h2>
            <div className="steps-list">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Write Lines That Can Shift Meaning</h4>
                  <p>
                    Each line will appear in two different contexts. The best pantoum lines are
                    slightly ambiguous — specific enough to be vivid, flexible enough to mean
                    something different when surrounded by new lines.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Start With Your First Quatrain</h4>
                  <p>
                    Write four strong lines. Then build the second stanza by taking lines 2 and 4 and
                    weaving new lines between them. Let each stanza deepen or complicate the theme.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Plan Your Closing</h4>
                  <p>
                    The traditional circular ending brings back lines 1 and 3 of the first stanza.
                    This is optional but powerful — it closes the loop and creates a sense of
                    inevitability. Consider whether your poem wants closure or open-endedness.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Tips for Success</h2>
            <ul className="feature-list">
              <li><strong>Keep lines self-contained:</strong> Each line should work as a grammatically complete unit, since it will appear in two different stanzas.</li>
              <li><strong>Vary the emotional register:</strong> The repeating lines should feel different each time — tender, then bitter; hopeful, then ironic.</li>
              <li><strong>Allow small variations:</strong> Many modern pantoums permit minor changes to repeated lines (a word substitution, a tense shift) to avoid mechanical rigidity.</li>
              <li><strong>Read it aloud:</strong> The pantoum's power is in its incantatory quality. If the repetition feels dead on the tongue, revise.</li>
            </ul>
          </section>

          <section className="learn-section cta-section">
            <h2>Try It Yourself</h2>
            <p>
              The pantoum rewards patience and revision. Start by drafting your first quatrain in
              the <Link to="/">Poetry Editor</Link>, then use our <Link to="/rhymes">Rhyme Finder</Link> to
              explore end-word options for new lines as you weave each stanza.
            </p>
            <div className="cta-buttons">
              <Link to="/rhymes" className="cta-button primary">
                Find Rhymes
              </Link>
              <Link to="/" className="cta-button secondary">
                Open Poetry Editor
              </Link>
            </div>
          </section>

          <section className="learn-section related-section">
            <h2>Continue Learning</h2>
            <div className="related-links">
              <Link to="/learn/villanelle" className="related-link">
                <span className="related-icon">🔁</span>
                <span className="related-text">
                  <strong>How to Write a Villanelle</strong>
                  <span>Another form built on powerful refrains</span>
                </span>
              </Link>
              <Link to="/learn/sonnet" className="related-link">
                <span className="related-icon">📜</span>
                <span className="related-text">
                  <strong>How to Write a Sonnet</strong>
                  <span>Master the 14-line form</span>
                </span>
              </Link>
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
}
