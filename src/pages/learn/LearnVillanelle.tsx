import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { SEOHead } from '../../components/SEOHead';
import './LearnPages.css';

export function LearnVillanelle() {
  return (
    <Layout>
      <SEOHead
        title="How to Write a Villanelle - Structure, Rules & Examples"
        description="Learn to write a villanelle with our complete guide. Understand the 19-line structure, ABA rhyme scheme, two refrains, and study examples from Dylan Thomas, Elizabeth Bishop, and more."
        canonicalPath="/learn/villanelle"
        keywords="how to write a villanelle, villanelle structure, villanelle poem, ABA rhyme scheme, refrain poetry, Dylan Thomas Do Not Go Gentle, villanelle examples"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "How to Write a Villanelle - Structure, Rules & Examples",
          "description": "Learn the villanelle form: 19 lines, two refrains, and an ABA rhyme scheme that builds obsessive intensity.",
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
            <span>Villanelle</span>
          </div>
          <h1>How to Write a Villanelle</h1>
          <p className="learn-subtitle">
            Master the obsessive, spiraling form that turns repetition into emotional power
          </p>
        </header>

        <div className="learn-content">
          <section className="learn-section">
            <h2>What Is a Villanelle?</h2>
            <p>
              A villanelle is a <strong>19-line poem</strong> built on just two rhymes and two
              repeating refrains. Originating from Italian and French pastoral traditions, the form
              creates a hypnotic, circling effect — the same lines return again and again, each
              time gathering new meaning from the lines around them.
            </p>
            <p>
              The villanelle is one of the most demanding fixed forms in English poetry. Its rigid
              structure forces poets to find refrains that can carry shifting meaning across the
              entire poem. When it works, the repetition creates an almost obsessive intensity.
            </p>
          </section>

          <section className="learn-section">
            <h2>Structure of a Villanelle</h2>
            <p>
              The villanelle consists of <strong>five tercets</strong> (three-line stanzas) followed
              by a <strong>quatrain</strong> (four-line stanza). Two lines from the first tercet
              serve as alternating refrains throughout.
            </p>
            <ul className="feature-list">
              <li><strong>19 lines total:</strong> 5 tercets + 1 quatrain</li>
              <li><strong>Two rhymes only:</strong> ABA pattern in tercets, ABAA in the quatrain</li>
              <li><strong>Refrain 1 (R1):</strong> Line 1 of the poem, repeated as the last line of stanzas 2 and 4</li>
              <li><strong>Refrain 2 (R2):</strong> Line 3 of the poem, repeated as the last line of stanzas 3 and 5</li>
              <li><strong>Final quatrain:</strong> Ends with both refrains as a couplet (R1, R2)</li>
            </ul>
          </section>

          <section className="learn-section">
            <h2>The Greatest Villanelle: Dylan Thomas</h2>
            <div className="example-box">
              <div className="example-label">Opening Stanzas</div>
              <div className="poem-example">
                <div className="poem-line">Do not go gentle into that good night, <span className="syllable-note">(R1)</span></div>
                <div className="poem-line">Old age should burn and rave at close of day;</div>
                <div className="poem-line">Rage, rage against the dying of the light. <span className="syllable-note">(R2)</span></div>
                <div className="poem-line">&nbsp;</div>
                <div className="poem-line">Though wise men at their end know dark is right,</div>
                <div className="poem-line">Because their words had forked no lightning they</div>
                <div className="poem-line">Do not go gentle into that good night. <span className="syllable-note">(R1)</span></div>
              </div>
              <div className="example-attribution">— Dylan Thomas (1914-1953)</div>
              <div className="example-analysis">
                Thomas wrote this for his dying father. The two refrains — a plea and a command —
                gain desperate urgency with each repetition. Each stanza introduces a new type of
                person (wise men, good men, wild men, grave men), but all arrive at the same demand:
                fight death.
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>How to Write a Villanelle</h2>
            <div className="steps-list">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Choose Your Refrains First</h4>
                  <p>
                    Your two refrains are the skeleton of the poem. They must rhyme with each other
                    (A-rhyme), work in multiple contexts, and carry enough weight to bear repetition.
                    Spend most of your time here.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Map Your B-Rhymes</h4>
                  <p>
                    You need six B-rhyme words (the middle line of each tercet plus one line in the
                    quatrain). List possible rhymes using our <Link to="/rhymes">Rhyme Finder</Link> before
                    you start writing stanzas.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Let Each Stanza Shift the Meaning</h4>
                  <p>
                    The refrains stay the same, but the context around them should evolve. Each tercet
                    should cast the refrain in a slightly different light — ironic, tender, desperate,
                    defiant.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Build Toward the Final Couplet</h4>
                  <p>
                    The quatrain ending — where both refrains appear together for the first and only
                    time — should feel like an arrival. Everything in the poem builds to this moment.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Famous Villanelles</h2>
            <p>
              Beyond Dylan Thomas, these villanelles demonstrate the range of the form:
            </p>
            <ul className="feature-list">
              <li><strong>"One Art" by Elizabeth Bishop:</strong> A masterpiece of controlled grief, where "the art of losing" accumulates from lost keys to lost continents to lost love.</li>
              <li><strong>"The Waking" by Theodore Roethke:</strong> A philosophical meditation where "I wake to sleep, and take my waking slow" becomes a mantra for living with uncertainty.</li>
              <li><strong>"Mad Girl's Love Song" by Sylvia Plath:</strong> "I shut my eyes and all the world drops dead" — obsessive repetition mirrors obsessive love.</li>
            </ul>
          </section>

          <section className="learn-section cta-section">
            <h2>Try It Yourself</h2>
            <p>
              Ready to write your own villanelle? Start by brainstorming refrains with our{' '}
              <Link to="/rhymes">Rhyme Finder</Link> to ensure you have enough rhyming options.
              Then open the <Link to="/">Poetry Editor</Link> and let the refrains guide you.
            </p>
            <div className="cta-buttons">
              <Link to="/rhymes" className="cta-button primary">
                Find Rhymes for Your Refrains
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
                  <span>Master the 14-line form</span>
                </span>
              </Link>
              <Link to="/learn/pantoum" className="related-link">
                <span className="related-icon">🔄</span>
                <span className="related-text">
                  <strong>How to Write a Pantoum</strong>
                  <span>Another form built on repetition</span>
                </span>
              </Link>
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
}
