import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { SEOHead } from '../../components/SEOHead';
import './LearnPages.css';

export function LearnOde() {
  return (
    <Layout>
      <SEOHead
        title="How to Write an Ode - Types, Structure & Examples"
        description="Learn how to write an ode with our guide covering the three types: Pindaric, Horatian, and Irregular. Study examples from Keats, Shelley, and Neruda, and write your own."
        canonicalPath="/learn/ode"
        keywords="how to write an ode, ode poetry, Pindaric ode, Horatian ode, irregular ode, Keats ode, Shelley ode, Neruda ode, ode examples"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "How to Write an Ode - Types, Structure & Examples",
          "description": "Master the ode: a lyric poem of praise, meditation, or address. Learn the three types and study the masters.",
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
            <span>Ode</span>
          </div>
          <h1>How to Write an Ode</h1>
          <p className="learn-subtitle">
            The lyric poem of praise, wonder, and direct address — from ancient Greece to today
          </p>
        </header>

        <div className="learn-content">
          <section className="learn-section">
            <h2>What Is an Ode?</h2>
            <p>
              An ode is a <strong>lyric poem that addresses or celebrates a subject</strong> with
              sustained intensity and elevated language. Unlike a narrative poem that tells a story,
              an ode dwells on a single subject — a person, an object, an idea, a season — and
              explores it deeply through imagery, meditation, and often direct address.
            </p>
            <p>
              The ode tradition stretches from Pindar's choral performances in ancient Greece to
              Pablo Neruda's odes to socks, artichokes, and dictionaries. What unites them is the
              posture of attention: the poet turns fully toward something and says, <em>let me
              really look at this</em>.
            </p>
          </section>

          <section className="learn-section">
            <h2>The Three Types of Ode</h2>

            <div className="info-grid two-col">
              <div className="info-card">
                <h4>Pindaric Ode</h4>
                <p>
                  Named after Pindar (c. 518-438 BC). Structured in triads: <strong>strophe</strong>,
                  <strong> antistrophe</strong> (same meter), and <strong>epode</strong> (different
                  meter). Grand, ceremonial, often public. Think of it as choral poetry meant to be
                  performed.
                </p>
              </div>
              <div className="info-card">
                <h4>Horatian Ode</h4>
                <p>
                  Named after Horace (65-8 BC). Uses regular, repeating stanza forms. More intimate
                  and reflective than Pindaric odes. Keats's great odes follow this model — uniform
                  stanzas with a consistent rhyme scheme.
                </p>
              </div>
            </div>

            <div className="info-grid two-col">
              <div className="info-card">
                <h4>Irregular Ode</h4>
                <p>
                  No fixed stanza pattern. The poet invents the structure to suit the subject.
                  Wordsworth's "Ode: Intimations of Immortality" and Neruda's elemental odes use
                  this approach. The freedom allows the poem to follow the energy of its thought.
                </p>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Examples from the Masters</h2>

            <div className="example-box">
              <div className="example-label">Horatian Ode — Keats</div>
              <div className="poem-example">
                <div className="poem-line">Thou still unravish'd bride of quietness,</div>
                <div className="poem-line">Thou foster-child of silence and slow time,</div>
                <div className="poem-line">Sylvan historian, who canst thus express</div>
                <div className="poem-line">A flowery tale more sweetly than our rhyme</div>
              </div>
              <div className="example-attribution">— John Keats, "Ode on a Grecian Urn" (1819)</div>
              <div className="example-analysis">
                Keats addresses the urn directly ("Thou"), treating a physical object as a living
                presence. Each stanza uses the same ABABCDECDE rhyme scheme while deepening the
                meditation on art, time, and beauty.
              </div>
            </div>

            <div className="example-box">
              <div className="example-label">Irregular Ode — Neruda</div>
              <div className="poem-example">
                <div className="poem-line">Mara Mori brought me</div>
                <div className="poem-line">a pair of socks</div>
                <div className="poem-line">which she knitted herself</div>
                <div className="poem-line">with her sheepherder's hands,</div>
                <div className="poem-line">two socks as soft as rabbits.</div>
              </div>
              <div className="example-attribution">— Pablo Neruda, "Ode to My Socks" (1956)</div>
              <div className="example-analysis">
                Neruda brings the ode tradition down to earth. No fixed meter, no rhyme — just the
                poet's genuine delight in a humble gift. The ode's power comes from the intensity of
                attention, not from formal structure.
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>How to Write an Ode</h2>
            <div className="steps-list">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Choose Your Subject</h4>
                  <p>
                    An ode can address anything: a nightingale, autumn, a loved one, melancholy, a
                    tomato. The key is that you have enough feeling about the subject to sustain a
                    long, focused poem. Pick something you can genuinely praise or marvel at.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Decide on Your Type</h4>
                  <p>
                    Want regular stanzas with a repeating rhyme scheme? Write a Horatian ode. Want
                    freedom to follow the thought? Write an irregular ode. For most modern poets, the
                    irregular ode is the most natural starting point.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Address Your Subject Directly</h4>
                  <p>
                    The apostrophe — speaking directly to your subject — is the ode's signature move.
                    "O wild West Wind" (Shelley), "Thou still unravish'd bride" (Keats). This creates
                    intimacy and urgency.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Build Through Turns</h4>
                  <p>
                    The best odes don't just praise — they complicate. Keats begins by admiring the
                    urn's frozen beauty, then questions whether frozen beauty is enough. Let your ode
                    think through its subject, not just describe it.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="learn-section cta-section">
            <h2>Try It Yourself</h2>
            <p>
              Choose something you love or wonder at, and write it an ode. Use our{' '}
              <Link to="/rhymes">Rhyme Finder</Link> if you want to work in a Horatian rhyme
              scheme, or go free-form in the <Link to="/">Poetry Editor</Link>.
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
              <Link to="/learn/sonnet" className="related-link">
                <span className="related-icon">📜</span>
                <span className="related-text">
                  <strong>How to Write a Sonnet</strong>
                  <span>Another lyric form with deep tradition</span>
                </span>
              </Link>
              <Link to="/learn/elegy" className="related-link">
                <span className="related-icon">🕊</span>
                <span className="related-text">
                  <strong>How to Write an Elegy</strong>
                  <span>The poem of mourning and tribute</span>
                </span>
              </Link>
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
}
