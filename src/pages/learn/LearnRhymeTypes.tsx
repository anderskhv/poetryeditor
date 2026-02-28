import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { SEOHead } from '../../components/SEOHead';
import './LearnPages.css';

export function LearnRhymeTypes() {
  return (
    <Layout>
      <SEOHead
        title="Types of Rhyme in Poetry - Perfect, Slant, Internal & More"
        description="Learn about the different types of rhyme used in poetry: perfect rhyme, slant rhyme, eye rhyme, internal rhyme, and more. Examples from classic poems and tips for using each type effectively."
        canonicalPath="/learn/rhyme-types"
        keywords="types of rhyme in poetry, perfect rhyme, slant rhyme, near rhyme, eye rhyme, internal rhyme, end rhyme, rhyme scheme, poetry rhyming techniques"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Types of Rhyme in Poetry - A Complete Guide",
          "description": "A comprehensive guide to the different types of rhyme used in poetry, with examples and writing tips.",
          "author": { "@type": "Organization", "name": "Poetry Editor" },
          "publisher": { "@type": "Organization", "name": "Poetry Editor", "url": "https://poetryeditor.com" },
        }}
      />

      <article className="learn-page">
        <header className="learn-header">
          <div className="learn-breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span>Learn</span>
            <span className="breadcrumb-sep">/</span>
            <span>Rhyme Types</span>
          </div>
          <h1>Types of Rhyme in Poetry</h1>
          <p className="learn-subtitle">
            From perfect rhymes to slant rhymes, understand how poets use sound to create meaning
          </p>
        </header>

        <div className="learn-content">
          <section className="learn-section">
            <h2>Why Rhyme Matters</h2>
            <p>
              Rhyme does more than make a poem sound pleasant. It creates connections between words,
              reinforces meaning, aids memorability, and gives poems their musical quality. Understanding
              different types of rhyme gives you more tools to work with as a poet.
            </p>
          </section>

          <section className="learn-section">
            <h2>Perfect Rhyme (True Rhyme)</h2>
            <p>
              Perfect rhyme is the most common type. The stressed vowel sounds and all following sounds
              are identical: <em>cat/hat</em>, <em>love/dove</em>, <em>moon/June</em>. This is what
              most people think of when they hear "rhyme."
            </p>
            <div className="learn-example">
              <p className="example-label">Example:</p>
              <p className="example-text">
                Shall I compare thee to a summer's <strong>day</strong>?<br />
                Thou art more lovely and more temper<strong>ate</strong>.<br />
                Rough winds do shake the darling buds of <strong>May</strong>,<br />
                And summer's lease hath all too short a <strong>date</strong>.
              </p>
              <p className="example-citation">
                — Shakespeare, <Link to="/poems/sonnet-18">Sonnet 18</Link>
              </p>
            </div>
            <p>
              Perfect rhymes create a strong sense of closure and satisfaction. They work especially well
              in formal verse, songs, and poems intended for performance.
            </p>
          </section>

          <section className="learn-section">
            <h2>Slant Rhyme (Near Rhyme, Half Rhyme)</h2>
            <p>
              Slant rhyme occurs when sounds are similar but not identical: <em>soul/all</em>,
              <em>worm/swarm</em>, <em>prove/love</em>. Emily Dickinson used slant rhyme extensively,
              and it has become one of the most important techniques in modern poetry.
            </p>
            <div className="learn-example">
              <p className="example-label">Why use slant rhyme?</p>
              <ul className="learn-list">
                <li>It feels more natural and conversational than perfect rhyme</li>
                <li>It avoids the "sing-song" effect that can make poems feel juvenile</li>
                <li>It creates subtle tension — the ear expects a perfect match and gets something slightly off</li>
                <li>It gives you far more word choices than restricting yourself to perfect rhymes</li>
              </ul>
            </div>
            <p>
              Use our <Link to="/rhymes">Rhyme Dictionary</Link> to find both perfect and slant
              rhymes for any word. The analysis panel in the{' '}
              <Link to="/">Poetry Editor</Link> automatically identifies your rhyme scheme and
              distinguishes perfect from slant rhymes.
            </p>
          </section>

          <section className="learn-section">
            <h2>Eye Rhyme (Sight Rhyme)</h2>
            <p>
              Eye rhymes look like they should rhyme but don't when spoken aloud: <em>love/move</em>,
              <em>cough/through</em>, <em>food/blood</em>. Many eye rhymes were once perfect rhymes
              in older English pronunciations. They appear frequently in Shakespeare and other
              Renaissance poets.
            </p>
          </section>

          <section className="learn-section">
            <h2>Internal Rhyme</h2>
            <p>
              Internal rhyme places rhyming words within a single line rather than at line endings.
              It creates a faster pace and a sense of momentum.
            </p>
            <div className="learn-example">
              <p className="example-label">Technique:</p>
              <p className="example-text">
                "Once upon a midnight <strong>dreary</strong>, while I pondered, weak and <strong>weary</strong>"
              </p>
              <p className="example-citation">
                — Edgar Allan Poe, "The Raven"
              </p>
            </div>
            <p>
              Internal rhyme is particularly effective in longer lines and narrative poetry. It keeps
              the reader's ear engaged without waiting for the line break.
            </p>
          </section>

          <section className="learn-section">
            <h2>Masculine vs. Feminine Rhyme</h2>
            <p>
              <strong>Masculine rhyme</strong> matches a single stressed syllable: <em>cat/hat</em>,
              <em>desire/fire</em>. <strong>Feminine rhyme</strong> matches two or more syllables,
              with the stress on the first: <em>ocean/motion</em>, <em>flower/power</em>.
            </p>
            <p>
              Feminine rhymes tend to feel lighter, more playful, and less emphatic. Masculine rhymes
              feel stronger and more decisive. Mixing both types adds rhythmic variety.
            </p>
          </section>

          <section className="learn-section">
            <h2>Common Rhyme Schemes</h2>
            <div className="learn-example">
              <ul className="learn-list">
                <li><strong>ABAB</strong> — Alternating rhyme (common in ballads and sonnets)</li>
                <li><strong>AABB</strong> — Couplets (each pair of lines rhymes)</li>
                <li><strong>ABBA</strong> — Enclosed rhyme (used in Petrarchan sonnets)</li>
                <li><strong>ABABCDCDEFEFGG</strong> — Shakespearean sonnet</li>
                <li><strong>AABBA</strong> — Limerick</li>
                <li><strong>ABA BCB CDC</strong> — Terza rima (Dante's scheme)</li>
              </ul>
            </div>
            <p>
              The <Link to="/">Poetry Editor</Link>'s analysis panel automatically detects your
              rhyme scheme as you write, showing it in the Rhymes tab.
            </p>
          </section>

          <section className="learn-section">
            <h2>Tips for Better Rhyming</h2>
            <div className="learn-example">
              <ul className="learn-list">
                <li>Never force a rhyme — if a line feels awkward just to rhyme, revise it</li>
                <li>Mix perfect and slant rhymes for a more sophisticated sound</li>
                <li>Avoid overused rhyme pairs (love/above, heart/apart, moon/June) unless used ironically</li>
                <li>Read your poem aloud — your ear is the best judge of whether a rhyme works</li>
                <li>Consider what your rhyme is doing semantically — the best rhymes connect meaning, not just sound</li>
              </ul>
            </div>
          </section>

          <section className="learn-section learn-cta">
            <h2>Practice Your Rhyming</h2>
            <p>
              Open the <Link to="/">Poetry Editor</Link> and start writing. Click any word to find
              rhymes, synonyms, and definitions. The analysis panel will track your rhyme scheme
              in real time.
            </p>
            <div className="learn-tool-links">
              <Link to="/" className="learn-tool-link">Open Editor</Link>
              <Link to="/rhymes" className="learn-tool-link">Rhyme Dictionary</Link>
              <Link to="/learn/sonnet" className="learn-tool-link">Learn Sonnets</Link>
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
}
