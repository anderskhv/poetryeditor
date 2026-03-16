import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { SEOHead } from '../../components/SEOHead';
import './LearnPages.css';

export function LearnSlantRhyme() {
  return (
    <Layout>
      <SEOHead
        title="Guide to Slant Rhyme & Near Rhyme in Poetry"
        description="Learn about slant rhyme, near rhyme, and half rhyme in poetry. Understand consonance, assonance, and eye rhyme with examples from Emily Dickinson and modern poets."
        canonicalPath="/learn/slant-rhyme"
        keywords="slant rhyme, near rhyme, half rhyme, consonance, assonance, eye rhyme, Emily Dickinson rhyme, imperfect rhyme, off rhyme, poetry techniques"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Guide to Slant Rhyme & Near Rhyme in Poetry",
          "description": "Master slant rhyme: the subtle art of almost-rhyming that gives modern poetry its texture and sophistication.",
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
            <span>Slant Rhyme</span>
          </div>
          <h1>Guide to Slant Rhyme & Near Rhyme</h1>
          <p className="learn-subtitle">
            The art of almost-rhyming — how imperfect echoes create richer, more surprising poetry
          </p>
        </header>

        <div className="learn-content">
          <section className="learn-section">
            <h2>What Is Slant Rhyme?</h2>
            <p>
              Slant rhyme (also called <strong>near rhyme</strong>, <strong>half rhyme</strong>, or{' '}
              <strong>off rhyme</strong>) is a rhyme where the sounds are similar but not identical.
              Unlike perfect rhyme (cat/hat, moon/June), slant rhyme creates a subtler echo — a
              connection that the ear registers without the neat click of exact rhyme.
            </p>
            <p>
              Slant rhyme is one of the most important tools in modern poetry. It gives you the
              structural benefits of rhyme — pattern, musicality, connection between lines — without
              the sing-song predictability that can make perfect rhyme feel forced.
            </p>
          </section>

          <section className="learn-section">
            <h2>Types of Slant Rhyme</h2>
            <div className="info-grid two-col">
              <div className="info-card">
                <h4>Consonance</h4>
                <p>
                  Same consonant sounds, different vowels: <strong>luck/lake</strong>,{' '}
                  <strong>bent/want</strong>, <strong>killed/cold</strong>. The consonants
                  match at the end, but the vowel sound shifts.
                </p>
              </div>
              <div className="info-card">
                <h4>Assonance</h4>
                <p>
                  Same vowel sounds, different consonants: <strong>lake/fate</strong>,{' '}
                  <strong>time/light</strong>, <strong>bone/smoke</strong>. The vowel echoes
                  across different word endings.
                </p>
              </div>
            </div>
            <div className="info-grid two-col">
              <div className="info-card">
                <h4>Eye Rhyme</h4>
                <p>
                  Words that look alike on the page but sound different: <strong>love/move</strong>,{' '}
                  <strong>cough/through</strong>, <strong>blood/mood</strong>. These create visual
                  connections that play against the ear's expectation.
                </p>
              </div>
              <div className="info-card">
                <h4>Forced Neighbor</h4>
                <p>
                  Words that share most sounds but differ in one: <strong>heart/art</strong>,{' '}
                  <strong>years/yours</strong>, <strong>room/storm</strong>. Close enough to
                  connect, different enough to surprise.
                </p>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Why Use Slant Rhyme?</h2>
            <ul className="feature-list">
              <li><strong>Avoid predictability:</strong> Perfect rhyme can telegraph the next word. Slant rhyme keeps readers engaged because the echo is felt but not foreseen.</li>
              <li><strong>Expand your vocabulary:</strong> With only perfect rhyme, you're limited to a small set of words. Slant rhyme opens up hundreds of options for any line ending.</li>
              <li><strong>Create unease or tension:</strong> The almost-but-not-quite match mirrors emotional states like doubt, grief, or ambivalence better than the certainty of perfect rhyme.</li>
              <li><strong>Sound more modern:</strong> Most contemporary formal poetry uses slant rhyme extensively. It's the sound of poetry written after Dickinson and Yeats.</li>
            </ul>
          </section>

          <section className="learn-section">
            <h2>Emily Dickinson: The Pioneer</h2>
            <p>
              Emily Dickinson used slant rhyme so consistently that it became her signature. In
              an era when perfect rhyme was expected, her near-rhymes created a sense of
              something slightly off — perfectly matching her themes of death, doubt, and the
              unknowable.
            </p>
            <div className="example-box">
              <div className="example-label">Dickinson's Slant Rhyme</div>
              <div className="poem-example">
                <div className="poem-line">I felt a Funeral, in my Brain,</div>
                <div className="poem-line">And Mourners to and fro</div>
                <div className="poem-line">Kept treading — treading — till it seemed</div>
                <div className="poem-line">That Sense was breaking through —</div>
              </div>
              <div className="example-attribution">— Emily Dickinson (1830-1886)</div>
              <div className="example-analysis">
                "Fro" and "through" share the "oo" vowel sound but differ in their consonant
                endings — a classic slant rhyme. The imperfect match creates a feeling of
                disorientation that mirrors the poem's descent into mental collapse.
              </div>
            </div>

            <div className="example-box">
              <div className="example-label">Another Dickinson Example</div>
              <div className="poem-example">
                <div className="poem-line">Because I could not stop for Death —</div>
                <div className="poem-line">He kindly stopped for me —</div>
                <div className="poem-line">The Carriage held but just Ourselves —</div>
                <div className="poem-line">And Immortality.</div>
              </div>
              <div className="example-attribution">— Emily Dickinson</div>
              <div className="example-analysis">
                "Me" and "Immortality" — the slant rhyme works through shared vowel sounds
                while the word lengths are dramatically different. The tiny word and the vast
                concept are yoked together by sound.
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Modern Usage</h2>
            <p>
              Today, slant rhyme is more common than perfect rhyme in formal poetry. Seamus Heaney,
              Sylvia Plath, W.B. Yeats, and Wilfred Owen all used it extensively. Owen's war poetry
              is especially notable — his use of <strong>pararhyme</strong> (where consonants match
              but vowels differ, like "hall/hell" or "groined/groaned") creates a haunting, unresolved
              quality that perfectly captures the dissonance of war.
            </p>
          </section>

          <section className="learn-section cta-section">
            <h2>Try It Yourself</h2>
            <p>
              Explore slant rhyme options with our <Link to="/rhymes">Rhyme Finder</Link>, which
              shows near rhymes alongside perfect ones. Or read more about how rhyme works in
              our <Link to="/learn/free-verse">Free Verse Guide</Link>, where slant rhyme is a
              key tool for creating structure without strict form.
            </p>
            <div className="cta-buttons">
              <Link to="/rhymes" className="cta-button primary">
                Find Slant Rhymes
              </Link>
              <Link to="/" className="cta-button secondary">
                Open Poetry Editor
              </Link>
            </div>
          </section>

          <section className="learn-section related-section">
            <h2>Continue Learning</h2>
            <div className="related-links">
              <Link to="/learn/free-verse" className="related-link">
                <span className="related-icon">🌊</span>
                <span className="related-text">
                  <strong>How to Write Free Verse</strong>
                  <span>Where slant rhyme becomes a subtle tool</span>
                </span>
              </Link>
              <Link to="/learn/rhyme-types" className="related-link">
                <span className="related-icon">🔔</span>
                <span className="related-text">
                  <strong>Types of Rhyme</strong>
                  <span>Perfect, slant, internal, and more</span>
                </span>
              </Link>
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
}
