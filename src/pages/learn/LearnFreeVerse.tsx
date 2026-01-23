import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { SEOHead } from '../../components/SEOHead';
import './LearnPages.css';

export function LearnFreeVerse() {
  return (
    <Layout>
      <SEOHead
        title="How to Write Free Verse Poetry - A Complete Guide"
        description="Learn how to write free verse poetry. Understand line breaks, rhythm without meter, imagery, and the techniques that make free verse powerful. No rules doesn't mean no craft."
        canonicalPath="/learn/free-verse"
        keywords="how to write free verse, free verse poetry, modern poetry, line breaks, vers libre, poetry without rhyme, contemporary poetry"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "How to Write Free Verse Poetry - A Complete Guide",
          "description": "Master free verse poetry: line breaks, rhythm, imagery, and the craft behind poetry without formal constraints.",
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
            <span>Free Verse</span>
          </div>
          <h1>How to Write Free Verse</h1>
          <p className="learn-subtitle">
            Poetry liberated from meter and rhyme—but not from craft
          </p>
        </header>

        <div className="learn-content">
          <section className="learn-section">
            <h2>What Is Free Verse?</h2>
            <p>
              Free verse (<em>vers libre</em>) is poetry that doesn't follow fixed meter, rhyme
              schemes, or stanza patterns. It emerged in the late 19th century as poets sought
              to break from traditional forms and let content dictate structure.
            </p>
            <p>
              But "free" doesn't mean "formless." The best free verse uses line breaks, rhythm,
              repetition, imagery, and white space with deliberate craft. As T.S. Eliot wrote:
              "No verse is free for the man who wants to do a good job."
            </p>

            <div className="example-box">
              <div className="example-label">Classic Free Verse</div>
              <div className="poem-example">
                <div className="poem-line">So much depends</div>
                <div className="poem-line">upon</div>
                <div className="poem-line stanza-break"></div>
                <div className="poem-line">a red wheel</div>
                <div className="poem-line">barrow</div>
                <div className="poem-line stanza-break"></div>
                <div className="poem-line">glazed with rain</div>
                <div className="poem-line">water</div>
                <div className="poem-line stanza-break"></div>
                <div className="poem-line">beside the white</div>
                <div className="poem-line">chickens.</div>
              </div>
              <div className="example-attribution">— William Carlos Williams, "The Red Wheelbarrow"</div>
              <div className="example-analysis">
                No rhyme, no regular meter—yet nothing is random. Each stanza has the same
                structure: 3 words, then 1 word. The line breaks create pauses that isolate
                images and force attention onto ordinary objects.
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Why Write Free Verse?</h2>
            <p>
              Free verse lets you:
            </p>
            <ul className="feature-list">
              <li><strong>Match form to content:</strong> A fragmented experience can have fragmented lines. A flowing thought can flow across the page.</li>
              <li><strong>Use natural speech rhythms:</strong> Write how people actually talk, without forcing words into iambic patterns.</li>
              <li><strong>Control pacing precisely:</strong> Line breaks become your punctuation, creating pauses exactly where you want them.</li>
              <li><strong>Focus on imagery:</strong> Without rhyme to chase, you can let images drive the poem.</li>
              <li><strong>Explore the page visually:</strong> The white space around words becomes part of the poem.</li>
            </ul>
          </section>

          <section className="learn-section">
            <h2>The Art of the Line Break</h2>
            <p>
              In free verse, the <strong>line break</strong> is your most important tool. Where you
              break a line determines rhythm, emphasis, and meaning. There are no rules—but there
              are strategies.
            </p>

            <h3>End-Stopped Lines</h3>
            <p>
              A line that ends at a natural pause (period, comma, or complete phrase). Creates
              a sense of completion and stability.
            </p>
            <div className="example-box">
              <div className="poem-example">
                <div className="poem-line">I have eaten</div>
                <div className="poem-line">the plums</div>
                <div className="poem-line">that were in</div>
                <div className="poem-line">the icebox</div>
              </div>
              <div className="example-attribution">— William Carlos Williams, "This Is Just to Say"</div>
            </div>

            <h3>Enjambment</h3>
            <p>
              A line that breaks mid-phrase, pushing the reader forward. Creates momentum,
              surprise, or tension.
            </p>
            <div className="example-box">
              <div className="poem-example">
                <div className="poem-line">Let the light of late afternoon</div>
                <div className="poem-line">shine through chinks in the barn, moving</div>
                <div className="poem-line">up the bales as the sun moves down.</div>
              </div>
              <div className="example-attribution">— Jane Kenyon, "Let Evening Come"</div>
              <div className="example-analysis">
                "moving" at the end of line 2 creates suspense—moving where? The enjambment
                mimics the slow movement of light across the barn.
              </div>
            </div>

            <h3>Breaking for Emphasis</h3>
            <p>
              The word at the end of a line gets extra weight. The word at the beginning of a
              line gets a fresh start. Use this to highlight key words.
            </p>
            <div className="practice-box">
              <div className="practice-line">
                <span className="practice-text">"She walked into the dark room alone"</span>
              </div>
              <div className="practice-line">
                <span className="practice-count">Different line breaks, different effects:</span>
              </div>
              <div className="practice-line">
                <span className="practice-text">
                  She walked into the dark<br />
                  room alone
                </span>
                <span className="practice-verdict">Emphasizes "dark" and "room alone"</span>
              </div>
              <div className="practice-line">
                <span className="practice-text">
                  She walked into<br />
                  the dark room<br />
                  alone
                </span>
                <span className="practice-verdict">Isolates "alone" for maximum impact</span>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Rhythm Without Meter</h2>
            <p>
              Free verse doesn't have meter, but it still has <strong>rhythm</strong>. The
              rhythm comes from:
            </p>

            <div className="info-grid two-col">
              <div className="info-card">
                <h4>Stressed Syllables</h4>
                <p>
                  Even without iambic pentameter, stressed words create beats. "The COLD
                  WIND BLOWS through BARE TREES" has a rhythm.
                </p>
              </div>
              <div className="info-card">
                <h4>Line Length Variation</h4>
                <p>
                  Alternating long and short lines creates a visual and auditory rhythm.
                  Short lines speed up; long lines slow down.
                </p>
              </div>
              <div className="info-card">
                <h4>Repetition</h4>
                <p>
                  Repeating words, phrases, or structures creates patterns. Anaphora (same
                  word starting multiple lines) is common in free verse.
                </p>
              </div>
              <div className="info-card">
                <h4>Syntax</h4>
                <p>
                  The length and structure of sentences creates rhythm. Short, punchy
                  sentences. Then a long, flowing sentence that carries across multiple lines.
                </p>
              </div>
            </div>

            <div className="example-box">
              <div className="example-label">Rhythm Through Repetition</div>
              <div className="poem-example">
                <div className="poem-line">I celebrate myself, and sing myself,</div>
                <div className="poem-line">And what I assume you shall assume,</div>
                <div className="poem-line">For every atom belonging to me as good belongs to you.</div>
              </div>
              <div className="example-attribution">— Walt Whitman, "Song of Myself"</div>
              <div className="example-analysis">
                Whitman's rhythm comes from parallelism ("I celebrate... and sing"),
                repetition ("myself... myself... assume... assume"), and the expansive
                final line that breaks the pattern.
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Writing Your First Free Verse Poem: Step by Step</h2>

            <div className="steps-list">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Start with an Image or Moment</h4>
                  <p>
                    Free verse thrives on specificity. Don't start with "love" or "sadness"—start
                    with a red wheelbarrow, a plum in the icebox, a spider at your window. The
                    abstract will emerge from the concrete.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Write Without Lines First</h4>
                  <p>
                    Get your thoughts down in prose. What do you see, feel, hear? What's the
                    emotional core? Don't worry about poetry yet—just capture the raw material.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Find the First Line Break</h4>
                  <p>
                    Read your prose aloud. Where do you naturally pause? Where does an image
                    complete itself? Where would a pause create tension? Make your first break there.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Work Through Line by Line</h4>
                  <p>
                    For each line, ask: What word do I want to emphasize? Should this line push
                    forward (enjambment) or pause (end-stopped)? Is this line too long? Too short?
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h4>Consider Stanza Breaks</h4>
                  <p>
                    White space is part of the poem. Where does the poem shift? Where should
                    the reader pause and absorb? Stanza breaks can mark time passing, a change
                    in focus, or a tonal shift.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">6</div>
                <div className="step-content">
                  <h4>Read Aloud and Revise</h4>
                  <p>
                    Free verse lives in the voice. Read your poem aloud. Do the rhythms feel
                    natural? Do the line breaks create the pauses you want? Cut unnecessary
                    words. Every word should earn its place.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Common Free Verse Techniques</h2>

            <h3>Anaphora</h3>
            <p>
              Repeating the same word or phrase at the beginning of multiple lines. Creates
              incantatory rhythm and builds intensity.
            </p>
            <div className="example-box">
              <div className="poem-example">
                <div className="poem-line">I saw the best minds of my generation destroyed by madness,</div>
                <div className="poem-line indent">starving hysterical naked,</div>
                <div className="poem-line">who poverty and tatters and hollow-eyed and high sat up smoking</div>
                <div className="poem-line">who bared their brains to Heaven under the El...</div>
              </div>
              <div className="example-attribution">— Allen Ginsberg, "Howl"</div>
            </div>

            <h3>The List Poem</h3>
            <p>
              A catalog of images, observations, or memories. The accumulation creates momentum
              and meaning through juxtaposition.
            </p>

            <h3>The Fragment</h3>
            <p>
              Incomplete sentences that create a sense of immediacy or disconnection. Useful
              for poems about trauma, memory, or perception.
            </p>

            <h3>White Space</h3>
            <p>
              Indentation, gaps within lines, or unusual spacing can create visual effects
              and guide the reader's eye across the page.
            </p>
          </section>

          <section className="learn-section">
            <h2>Common Mistakes to Avoid</h2>

            <div className="mistakes-list">
              <div className="mistake">
                <div className="mistake-icon">✕</div>
                <div className="mistake-content">
                  <h4>Random Line Breaks</h4>
                  <p>
                    Breaking lines arbitrarily doesn't make prose into poetry. Every break should
                    have a reason—rhythm, emphasis, surprise. If you can't explain why you broke
                    there, reconsider.
                  </p>
                </div>
              </div>

              <div className="mistake">
                <div className="mistake-icon">✕</div>
                <div className="mistake-content">
                  <h4>Over-Abstraction</h4>
                  <p>
                    "Love hurts / Pain is real / We all suffer"—this is sentiment, not poetry.
                    Ground your emotions in concrete images. Show the hurt, don't name it.
                  </p>
                </div>
              </div>

              <div className="mistake">
                <div className="mistake-icon">✕</div>
                <div className="mistake-content">
                  <h4>Prose Chopped into Lines</h4>
                  <p>
                    If your poem would work just as well as a paragraph, it's not using the line
                    as a unit of meaning. Line breaks should do something—create pauses, isolate
                    images, surprise the reader.
                  </p>
                </div>
              </div>

              <div className="mistake">
                <div className="mistake-icon">✕</div>
                <div className="mistake-content">
                  <h4>Thinking "Free" Means "Easy"</h4>
                  <p>
                    Without form to lean on, every choice is yours. That's harder, not easier.
                    The best free verse is revised repeatedly until every word and break feels
                    inevitable.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Poets to Study</h2>
            <p>
              These poets mastered free verse in different ways. Reading them will teach you
              more than any guide:
            </p>

            <div className="info-grid two-col">
              <div className="info-card">
                <h4>Walt Whitman</h4>
                <p>
                  The father of American free verse. Long, expansive lines with parallelism
                  and catalogs. "Song of Myself," "Leaves of Grass."
                </p>
              </div>
              <div className="info-card">
                <h4>William Carlos Williams</h4>
                <p>
                  Short, precise, imagist. "No ideas but in things." Ordinary objects made
                  extraordinary through attention.
                </p>
              </div>
              <div className="info-card">
                <h4>Mary Oliver</h4>
                <p>
                  Nature poetry with accessible language and clear imagery. Emotional without
                  being sentimental. "Wild Geese," "The Summer Day."
                </p>
              </div>
              <div className="info-card">
                <h4>Ocean Vuong</h4>
                <p>
                  Contemporary, lyrical, fragmentary. Uses white space and interruption. "Night
                  Sky with Exit Wounds."
                </p>
              </div>
            </div>
          </section>

          <section className="learn-section cta-section">
            <h2>Ready to Write?</h2>
            <p>
              Open the Poetry Editor and start writing. Our analysis tools will help you
              track syllables, find sound patterns, and avoid clichés—even in free verse.
            </p>
            <div className="cta-buttons">
              <Link to="/" className="cta-button primary">
                Open Poetry Editor
              </Link>
              <Link to="/syllables" className="cta-button secondary">
                Syllable Counter
              </Link>
            </div>
          </section>

          <section className="learn-section related-section">
            <h2>Continue Learning</h2>
            <div className="related-links">
              <Link to="/learn/haiku" className="related-link">
                <span className="related-icon">🌸</span>
                <span className="related-text">
                  <strong>How to Write a Haiku</strong>
                  <span>Brevity and precision in 17 syllables</span>
                </span>
              </Link>
              <Link to="/learn/sonnet" className="related-link">
                <span className="related-icon">📜</span>
                <span className="related-text">
                  <strong>How to Write a Sonnet</strong>
                  <span>Master traditional form first</span>
                </span>
              </Link>
              <Link to="/learn/scansion" className="related-link">
                <span className="related-icon">📐</span>
                <span className="related-text">
                  <strong>Understanding Meter & Scansion</strong>
                  <span>Learn what you're choosing not to use</span>
                </span>
              </Link>
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
}
