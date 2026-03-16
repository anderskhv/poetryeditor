import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { SEOHead } from '../../components/SEOHead';
import './LearnPages.css';

export function LearnBallad() {
  return (
    <Layout>
      <SEOHead
        title="How to Write a Ballad - Meter, Rhyme & Storytelling Guide"
        description="Learn how to write a ballad with our complete guide. Understand ballad meter (4-3-4-3 iambic), ABAB and ABCB rhyme schemes, and the tradition from folk songs to literary ballads."
        canonicalPath="/learn/ballad"
        keywords="how to write a ballad, ballad meter, ballad stanza, ABAB rhyme scheme, ABCB rhyme, folk ballad, literary ballad, Coleridge Rime Ancient Mariner, ballad poetry"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "How to Write a Ballad - Meter, Rhyme & Storytelling Guide",
          "description": "Master the ballad: poetry's great storytelling form with its driving meter and memorable rhymes.",
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
            <span>Ballad</span>
          </div>
          <h1>How to Write a Ballad</h1>
          <p className="learn-subtitle">
            Poetry's great narrative form — where story, song, and rhythm come together
          </p>
        </header>

        <div className="learn-content">
          <section className="learn-section">
            <h2>What Is a Ballad?</h2>
            <p>
              A ballad is a <strong>narrative poem</strong> that tells a story, traditionally in
              quatrains with a musical, driving rhythm. Ballads are the oldest form of English
              poetry that still feels alive — they were sung in medieval taverns, printed on
              broadsheets, and remain the backbone of storytelling in verse.
            </p>
            <p>
              What makes a ballad a ballad is the combination of <em>story</em> and <em>song</em>.
              A ballad doesn't just narrate — it moves with a propulsive rhythm that carries the
              listener forward, stanza by stanza, toward drama, tragedy, or wonder.
            </p>
          </section>

          <section className="learn-section">
            <h2>Ballad Meter</h2>
            <p>
              The standard ballad stanza alternates between <strong>iambic tetrameter</strong> (4
              iambic feet) and <strong>iambic trimeter</strong> (3 iambic feet) in a 4-3-4-3 pattern:
            </p>
            <div className="example-box">
              <div className="example-label">Ballad Meter in Action</div>
              <div className="poem-example">
                <div className="poem-line">It is an ancient Mariner, <span className="syllable-note">(4 feet)</span></div>
                <div className="poem-line">And he stoppeth one of three. <span className="syllable-note">(3 feet)</span></div>
                <div className="poem-line">"By thy long grey beard and glittering eye, <span className="syllable-note">(4 feet)</span></div>
                <div className="poem-line">Now wherefore stopp'st thou me?" <span className="syllable-note">(3 feet)</span></div>
              </div>
              <div className="example-attribution">— Samuel Taylor Coleridge, "The Rime of the Ancient Mariner" (1798)</div>
              <div className="example-analysis">
                The alternating line lengths create a rocking, propulsive rhythm — like a ship on
                waves, fitting for Coleridge's seafaring tale. The shorter lines create natural
                pauses that build anticipation.
              </div>
            </div>

            <p>
              The rhyme scheme is typically <strong>ABAB</strong> or <strong>ABCB</strong> (where
              only the shorter lines rhyme). ABCB is more common in folk ballads because it's
              easier to sustain over many stanzas.
            </p>
          </section>

          <section className="learn-section">
            <h2>Folk Ballads vs. Literary Ballads</h2>
            <div className="info-grid two-col">
              <div className="info-card">
                <h4>Folk Ballads</h4>
                <p>
                  Anonymous, oral tradition. Simple diction, frequent repetition, refrains.
                  Often about love, death, betrayal, or the supernatural. Examples: "Barbara
                  Allen," "Lord Randall," "The Unquiet Grave." The story matters more than
                  the poet.
                </p>
              </div>
              <div className="info-card">
                <h4>Literary Ballads</h4>
                <p>
                  Written by known poets who adopt the folk form. Richer imagery, more complex
                  language, but still driven by narrative. Examples: Coleridge's "Ancient Mariner,"
                  Keats's "La Belle Dame sans Merci," Poe's "Annabel Lee."
                </p>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Another Example: Keats</h2>
            <div className="example-box">
              <div className="example-label">Literary Ballad</div>
              <div className="poem-example">
                <div className="poem-line">O what can ail thee, knight-at-arms,</div>
                <div className="poem-line">Alone and palely loitering?</div>
                <div className="poem-line">The sedge has wither'd from the lake,</div>
                <div className="poem-line">And no birds sing.</div>
              </div>
              <div className="example-attribution">— John Keats, "La Belle Dame sans Merci" (1819)</div>
              <div className="example-analysis">
                Keats shortens the final line to just three syllables ("And no birds sing"),
                creating a haunting truncation. The ballad tells of a knight enchanted and
                abandoned by a fairy woman — classic ballad territory of love and the supernatural.
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Writing Tips</h2>
            <div className="steps-list">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Start With Story</h4>
                  <p>
                    A ballad needs a narrative arc: a situation, a complication, a resolution (often
                    tragic). Outline your story before you start writing stanzas. Who are the
                    characters? What happens? How does it end?
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Use Dialogue</h4>
                  <p>
                    Folk ballads jump into dialogue without attribution — "O where have you been,
                    Lord Randall, my son?" This creates immediacy and drama. Let your characters
                    speak directly.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Embrace Repetition</h4>
                  <p>
                    Refrains, incremental repetition (where a phrase changes slightly each time),
                    and repeated structures are the ballad's tools for building momentum. Use our{' '}
                    <Link to="/learn/scansion">Scansion Guide</Link> to keep your meter steady.
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Keep the Language Simple</h4>
                  <p>
                    Ballads thrive on plain, direct diction. Save the ornate imagery for odes and
                    sonnets. In a ballad, "the king rode out at dawn" beats "the sovereign departed
                    upon the aurora's arrival."
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="learn-section cta-section">
            <h2>Try It Yourself</h2>
            <p>
              Write a ballad in the <Link to="/">Poetry Editor</Link> and use our{' '}
              <Link to="/rhymes">Rhyme Finder</Link> to find rhymes for your ABAB or ABCB
              scheme. Check your meter with the <Link to="/learn/scansion">Scansion Guide</Link>.
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
              <Link to="/learn/scansion" className="related-link">
                <span className="related-icon">📏</span>
                <span className="related-text">
                  <strong>Guide to Scansion</strong>
                  <span>Learn to scan meter in any poem</span>
                </span>
              </Link>
              <Link to="/learn/villanelle" className="related-link">
                <span className="related-icon">🔁</span>
                <span className="related-text">
                  <strong>How to Write a Villanelle</strong>
                  <span>Another form built on powerful repetition</span>
                </span>
              </Link>
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
}
