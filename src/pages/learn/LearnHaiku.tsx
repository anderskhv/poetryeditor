import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { SEOHead } from '../../components/SEOHead';
import './LearnPages.css';

export function LearnHaiku() {
  return (
    <Layout>
      <SEOHead
        title="How to Write a Haiku - Complete Guide for Beginners"
        description="Learn how to write a haiku with our step-by-step guide. Understand the 5-7-5 syllable pattern, kigo (seasonal words), kireji (cutting words), and the art of capturing a moment in 17 syllables."
        canonicalPath="/learn/haiku"
        keywords="how to write a haiku, haiku writing guide, 5-7-5 syllable pattern, kigo seasonal words, kireji cutting word, haiku for beginners, Japanese poetry"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "How to Write a Haiku - Complete Guide for Beginners",
          "description": "Learn the art of haiku writing with our comprehensive guide covering the 5-7-5 pattern, seasonal references, and capturing moments.",
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
            <span>Haiku</span>
          </div>
          <h1>How to Write a Haiku</h1>
          <p className="learn-subtitle">
            Master the ancient Japanese art of capturing a moment in just 17 syllables
          </p>
        </header>

        <div className="learn-content">
          <section className="learn-section">
            <h2>What Is a Haiku?</h2>
            <p>
              A haiku is a short Japanese poem that captures a single moment, image, or feeling.
              In English, haiku follow a <strong>5-7-5 syllable pattern</strong>: five syllables in
              the first line, seven in the second, and five in the third.
            </p>
            <p>
              But haiku are more than just syllable counting. Traditional haiku contain a <em>kigo</em>
              (seasonal reference), a <em>kireji</em> (cutting word that creates a pause), and present
              two images that contrast or connect in surprising ways.
            </p>

            <div className="example-box">
              <div className="example-label">Classic Example</div>
              <div className="poem-example">
                <div className="poem-line">An old silent pond <span className="syllable-note">(5)</span></div>
                <div className="poem-line">A frog jumps into the pond <span className="syllable-note">(7)</span></div>
                <div className="poem-line">Splash! Silence again <span className="syllable-note">(5)</span></div>
              </div>
              <div className="example-attribution">— Matsuo Bashō (1644–1694)</div>
              <div className="example-analysis">
                Notice how Bashō captures a complete moment: the stillness, the action, and the return
                to stillness. "Splash!" acts as a cutting word, creating a sharp break between the frog's
                jump and the resulting silence.
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>The 5-7-5 Syllable Pattern</h2>
            <p>
              The structure of a haiku is simple to remember:
            </p>
            <ul className="feature-list">
              <li><strong>Line 1:</strong> 5 syllables</li>
              <li><strong>Line 2:</strong> 7 syllables</li>
              <li><strong>Line 3:</strong> 5 syllables</li>
            </ul>
            <p>
              This creates a total of 17 syllables. The brevity forces you to choose every word
              carefully—there's no room for filler words or unnecessary adjectives.
            </p>

            <div className="tip-box">
              <div className="tip-label">Syllable Tip</div>
              <p>
                Not sure how many syllables a word has? Use our{' '}
                <Link to="/syllables">Syllable Counter</Link> to check. Words like "fire" (1-2 syllables)
                and "poem" (1-2 syllables) can be tricky.
              </p>
            </div>

            <h3>Counting Syllables: Practice</h3>
            <p>Let's count the syllables in a few lines:</p>

            <div className="practice-box">
              <div className="practice-line">
                <span className="practice-text">The autumn moon rises</span>
                <span className="practice-count">
                  The (1) au-tumn (2) moon (1) ri-ses (2) = <strong>6 syllables</strong>
                </span>
                <span className="practice-verdict incorrect">Too many for line 1!</span>
              </div>
              <div className="practice-line">
                <span className="practice-text">Autumn moon rising</span>
                <span className="practice-count">
                  Au-tumn (2) moon (1) ri-sing (2) = <strong>5 syllables</strong>
                </span>
                <span className="practice-verdict correct">Perfect for line 1!</span>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Kigo: The Seasonal Reference</h2>
            <p>
              Traditional haiku include a <strong>kigo</strong> (季語)—a word or phrase that indicates
              the season. This grounds the poem in a specific time and connects it to the natural world.
            </p>

            <div className="info-grid two-col">
              <div className="info-card">
                <h4>Spring</h4>
                <p>cherry blossoms, melting snow, plum flowers, swallows, frogs, butterflies, seedlings</p>
              </div>
              <div className="info-card">
                <h4>Summer</h4>
                <p>cicadas, sunflowers, heat waves, thunderstorms, fireflies, mosquitoes, beaches</p>
              </div>
              <div className="info-card">
                <h4>Autumn</h4>
                <p>harvest moon, falling leaves, chrysanthemums, crickets, persimmons, scarecrows</p>
              </div>
              <div className="info-card">
                <h4>Winter</h4>
                <p>snow, bare branches, frost, cold wind, hibernation, New Year, icicles</p>
              </div>
            </div>

            <div className="example-box">
              <div className="example-label">Kigo in Action</div>
              <div className="poem-example">
                <div className="poem-line">On a withered branch</div>
                <div className="poem-line">A crow has alighted—</div>
                <div className="poem-line">Autumn nightfall</div>
              </div>
              <div className="example-attribution">— Matsuo Bashō</div>
              <div className="example-analysis">
                "Withered branch" and "autumn nightfall" are both kigo for autumn. The withered
                branch suggests the dying of the year, while the crow adds a stark, solitary image.
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Kireji: The Cutting Word</h2>
            <p>
              A <strong>kireji</strong> (切れ字) creates a pause or break in the haiku. In Japanese,
              specific particles serve this purpose. In English, we use punctuation (—, ..., !) or
              a natural pause between images.
            </p>
            <p>
              The kireji typically appears at the end of the first or second line, dividing the
              haiku into two parts that contrast, compare, or complete each other.
            </p>

            <div className="example-box">
              <div className="example-label">The Cutting Word</div>
              <div className="poem-example">
                <div className="poem-line">Lightning flash—</div>
                <div className="poem-line">what I thought were faces</div>
                <div className="poem-line">are plumes of pampas grass</div>
              </div>
              <div className="example-attribution">— Matsuo Bashō</div>
              <div className="example-analysis">
                The dash after "flash" is the kireji. It separates the sudden lightning from the
                startling revelation—what seemed like ghostly faces in the dark were only grass.
                The cut creates tension and surprise.
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Writing Your First Haiku: Step by Step</h2>

            <div className="steps-list">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Choose a Moment</h4>
                  <p>
                    Haiku capture fleeting moments. Think of something you observed recently:
                    a bird at your window, morning coffee steam, rain on leaves. Start with
                    something concrete and specific.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Find Two Images</h4>
                  <p>
                    A haiku works by juxtaposing two images or ideas. One might be close-up,
                    one distant. One might be action, one stillness. The connection between
                    them creates meaning.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Draft Without Counting</h4>
                  <p>
                    Write your images down without worrying about syllables. Get the essence
                    first. You might write: "Morning. Coffee steam rises. The cat watches birds
                    outside."
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Shape Into 5-7-5</h4>
                  <p>
                    Now rework your draft to fit the pattern. Cut unnecessary words. Find
                    synonyms with the right syllable count. "Morning coffee steam" (5) /
                    "curls toward the window where" (6)... keep adjusting.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h4>Test and Refine</h4>
                  <p>
                    Use our <Link to="/haiku-checker">Haiku Checker</Link> to verify your syllable
                    counts. Read it aloud. Does it flow? Does it capture the moment? Does the
                    pause between images create resonance?
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Common Mistakes to Avoid</h2>

            <div className="mistakes-list">
              <div className="mistake">
                <div className="mistake-icon">✕</div>
                <div className="mistake-content">
                  <h4>Being Too Abstract</h4>
                  <p>
                    "Love is beautiful / It makes my heart feel so warm / Love is everything"—this
                    tells rather than shows. Haiku need concrete images, not abstract statements.
                  </p>
                </div>
              </div>

              <div className="mistake">
                <div className="mistake-icon">✕</div>
                <div className="mistake-content">
                  <h4>Forcing the Syllable Count</h4>
                  <p>
                    Adding filler words ("very," "really," "so") or awkward phrasing just to hit
                    5-7-5 weakens the poem. Better to be slightly off than to pad with empty words.
                  </p>
                </div>
              </div>

              <div className="mistake">
                <div className="mistake-icon">✕</div>
                <div className="mistake-content">
                  <h4>Explaining the Meaning</h4>
                  <p>
                    Trust your images. Don't end with "this shows that..." or "which means..."
                    Let the reader discover the connection between your two images.
                  </p>
                </div>
              </div>

              <div className="mistake">
                <div className="mistake-icon">✕</div>
                <div className="mistake-content">
                  <h4>Rhyming</h4>
                  <p>
                    Traditional haiku don't rhyme. While not strictly forbidden, rhyme can make
                    English haiku feel like nursery rhymes rather than moments of insight.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Examples to Study</h2>
            <p>
              Here are haiku from different eras and styles. Notice how each captures a specific
              moment and uses the juxtaposition of images:
            </p>

            <div className="examples-grid">
              <div className="example-box">
                <div className="poem-example">
                  <div className="poem-line">The summer grasses—</div>
                  <div className="poem-line">All that remains of the dreams</div>
                  <div className="poem-line">Of ancient warriors</div>
                </div>
                <div className="example-attribution">— Matsuo Bashō</div>
                <div className="example-analysis">
                  Kigo: summer grasses. The cut after "grasses" shifts from nature to history.
                  Where armies once fought, only grass grows.
                </div>
              </div>

              <div className="example-box">
                <div className="poem-example">
                  <div className="poem-line">The temple bell stops—</div>
                  <div className="poem-line">but the sound keeps coming</div>
                  <div className="poem-line">out of the flowers</div>
                </div>
                <div className="example-attribution">— Matsuo Bashō</div>
                <div className="example-analysis">
                  The kireji comes after "stops." Sound transforms into something visual and
                  fragrant. The resonance continues in an unexpected form—a meditation on
                  how sensations blend.
                </div>
              </div>

              <div className="example-box">
                <div className="poem-example">
                  <div className="poem-line">First autumn morning:</div>
                  <div className="poem-line">the mirror I stare into</div>
                  <div className="poem-line">shows my father's face</div>
                </div>
                <div className="example-attribution">— Murakami Kijō (1865–1938)</div>
                <div className="example-analysis">
                  Kigo: autumn morning. A modern haiku about aging and inheritance. The speaker
                  sees themselves becoming their parent—a universal human experience captured
                  in a single moment.
                </div>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Modern Haiku: Bending the Rules</h2>
            <p>
              Many contemporary English-language haiku poets have relaxed the strict 5-7-5 rule.
              Since Japanese syllables (mora) are shorter than English syllables, some argue that
              10-14 syllables better captures the brevity of the original form.
            </p>
            <p>
              What remains constant is the essence: a moment, a season, two images, a pause.
              The 5-7-5 structure is an excellent framework for learning, and many poets continue
              to use it. As you develop, you may choose to adapt it.
            </p>

            <div className="tip-box">
              <div className="tip-label">Start Traditional</div>
              <p>
                We recommend learning with the 5-7-5 structure first. The constraint forces
                you to choose words carefully and understand the form deeply. Once you've
                mastered it, you can decide when and how to break the rules.
              </p>
            </div>
          </section>

          <section className="learn-section cta-section">
            <h2>Ready to Write?</h2>
            <p>
              Now that you understand haiku, try writing your own. Our Haiku Checker will
              validate your syllable pattern instantly and give you feedback as you write.
            </p>
            <div className="cta-buttons">
              <Link to="/haiku-checker" className="cta-button primary">
                Try the Haiku Checker
              </Link>
              <Link to="/" className="cta-button secondary">
                Open Poetry Editor
              </Link>
            </div>
          </section>

          <section className="learn-section related-section">
            <h2>Continue Learning</h2>
            <div className="related-links">
              <Link to="/syllables" className="related-link">
                <span className="related-icon">📊</span>
                <span className="related-text">
                  <strong>Syllable Counter</strong>
                  <span>Check syllable counts for any word</span>
                </span>
              </Link>
              <Link to="/learn/sonnet" className="related-link">
                <span className="related-icon">📜</span>
                <span className="related-text">
                  <strong>How to Write a Sonnet</strong>
                  <span>Master the 14-line form</span>
                </span>
              </Link>
              <Link to="/learn/free-verse" className="related-link">
                <span className="related-icon">🌊</span>
                <span className="related-text">
                  <strong>How to Write Free Verse</strong>
                  <span>Poetry without formal constraints</span>
                </span>
              </Link>
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
}
