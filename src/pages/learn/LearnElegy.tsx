import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { SEOHead } from '../../components/SEOHead';
import './LearnPages.css';

export function LearnElegy() {
  return (
    <Layout>
      <SEOHead
        title="How to Write an Elegy - Structure, Tradition & Examples"
        description="Learn how to write an elegy with our guide. Understand the lament-praise-consolation structure, study examples from Milton, Tennyson, and Auden, and find your own voice for grief."
        canonicalPath="/learn/elegy"
        keywords="how to write an elegy, elegy poem, lament praise consolation, elegiac poetry, funeral poem, Milton Lycidas, Auden Funeral Blues, Tennyson In Memoriam"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "How to Write an Elegy - Structure, Tradition & Examples",
          "description": "Master the elegy: the poem of mourning that moves through lament, praise, and consolation.",
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
            <span>Elegy</span>
          </div>
          <h1>How to Write an Elegy</h1>
          <p className="learn-subtitle">
            The ancient art of turning grief into meaning — from lament through praise to consolation
          </p>
        </header>

        <div className="learn-content">
          <section className="learn-section">
            <h2>What Is an Elegy?</h2>
            <p>
              An elegy is a <strong>poem of mourning</strong>, written in response to death or
              profound loss. Unlike a eulogy (spoken at a funeral), an elegy is a literary work
              that processes grief through the full resources of poetry: image, rhythm, metaphor,
              and structure.
            </p>
            <p>
              The tradition is ancient — Greek elegies date to the 7th century BC — and remains
              one of poetry's most vital forms. When someone dies, we reach for poetry because
              ordinary language fails. The elegy is the form that meets that need.
            </p>
          </section>

          <section className="learn-section">
            <h2>The Three Movements</h2>
            <p>
              Classical elegies tend to move through three phases, though modern elegies often
              rearrange or compress them:
            </p>
            <ul className="feature-list">
              <li><strong>Lament:</strong> The raw expression of grief. The world is wrong because the person is gone. Nature itself may mourn ("pathetic fallacy"). This is where the poem earns its emotional authority.</li>
              <li><strong>Praise:</strong> Celebration of the dead — who they were, what they meant, what the world loses without them. Specific memories and images are more powerful than general statements.</li>
              <li><strong>Consolation:</strong> The turn toward meaning, acceptance, or transcendence. Not forced optimism, but a genuine reckoning with what remains. Some modern elegies refuse consolation entirely — which is itself a statement.</li>
            </ul>
          </section>

          <section className="learn-section">
            <h2>Examples from the Tradition</h2>

            <div className="example-box">
              <div className="example-label">W.H. Auden — "Funeral Blues"</div>
              <div className="poem-example">
                <div className="poem-line">Stop all the clocks, cut off the telephone,</div>
                <div className="poem-line">Prevent the dog from barking with a juicy bone,</div>
                <div className="poem-line">Silence the pianos and with muffled drum</div>
                <div className="poem-line">Bring out the coffin, let the mourners come.</div>
              </div>
              <div className="example-attribution">— W.H. Auden (1907-1973)</div>
              <div className="example-analysis">
                Auden's elegy is almost entirely lament — a demand that the whole world stop because
                one person has died. The poem's power comes from treating private grief as a cosmic
                event. "He was my North, my South, my East and West" refuses to minimize the loss.
              </div>
            </div>

            <div className="example-box">
              <div className="example-label">Alfred, Lord Tennyson — "In Memoriam A.H.H."</div>
              <div className="poem-example">
                <div className="poem-line">I hold it true, whate'er befall;</div>
                <div className="poem-line">I feel it, when I sorrow most;</div>
                <div className="poem-line">'Tis better to have loved and lost</div>
                <div className="poem-line">Than never to have loved at all.</div>
              </div>
              <div className="example-attribution">— Alfred, Lord Tennyson (1809-1892)</div>
              <div className="example-analysis">
                Tennyson wrote 133 sections over 17 years mourning his friend Arthur Hallam. This
                famous stanza is consolation — but it arrives only after hundreds of lines of doubt,
                anger, and despair. The consolation is earned, not imposed.
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Writing Tips</h2>
            <div className="steps-list">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Be Specific</h4>
                  <p>
                    "She was a wonderful person" says nothing. "She kept a jar of sea glass on the
                    kitchen windowsill" brings someone to life. Concrete details honor the dead more
                    than abstract praise.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Earn the Consolation</h4>
                  <p>
                    Don't rush to meaning. The lament must be real before any consolation can be
                    believed. If the poem resolves too quickly, the reader will feel the grief was
                    never genuine.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Consider Refusing Consolation</h4>
                  <p>
                    Not every elegy needs a hopeful ending. Some of the most honest elegies end in
                    unresolved grief. Auden's "Funeral Blues" offers no comfort — and that refusal
                    is what makes it devastating.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Let Form Carry Feeling</h4>
                  <p>
                    Repetition can mirror the way grief keeps circling back. Regular meter can
                    provide a steadying rhythm against emotional chaos. Or break form deliberately
                    to show where composure fails.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="learn-section cta-section">
            <h2>Try It Yourself</h2>
            <p>
              If you are writing through grief, the <Link to="/">Poetry Editor</Link> provides
              a quiet space to work. Use our <Link to="/rhymes">Rhyme Finder</Link> if you want
              to write in a formal pattern like Tennyson's ABBA stanza.
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
              <Link to="/learn/ode" className="related-link">
                <span className="related-icon">🎵</span>
                <span className="related-text">
                  <strong>How to Write an Ode</strong>
                  <span>The poem of praise and celebration</span>
                </span>
              </Link>
              <Link to="/learn/sonnet" className="related-link">
                <span className="related-icon">📜</span>
                <span className="related-text">
                  <strong>How to Write a Sonnet</strong>
                  <span>A compact form for deep feeling</span>
                </span>
              </Link>
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
}
