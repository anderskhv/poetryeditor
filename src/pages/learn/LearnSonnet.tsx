import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { SEOHead } from '../../components/SEOHead';
import './LearnPages.css';

export function LearnSonnet() {
  return (
    <Layout>
      <SEOHead
        title="How to Write a Sonnet - Complete Guide to Shakespearean & Petrarchan Forms"
        description="Learn how to write a sonnet with our comprehensive guide. Master the 14-line structure, iambic pentameter, rhyme schemes (ABAB CDCD EFEF GG), and the art of the volta."
        canonicalPath="/learn/sonnet"
        keywords="how to write a sonnet, Shakespearean sonnet, Petrarchan sonnet, iambic pentameter, sonnet rhyme scheme, volta in poetry, 14 line poem"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "How to Write a Sonnet - Complete Guide to Shakespearean & Petrarchan Forms",
          "description": "Master the art of sonnet writing with our guide to structure, meter, rhyme schemes, and the volta.",
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
            <span>Sonnet</span>
          </div>
          <h1>How to Write a Sonnet</h1>
          <p className="learn-subtitle">
            Master the 14-line form that Shakespeare, Petrarch, and countless poets have used
            to explore love, mortality, and the human condition
          </p>
        </header>

        <div className="learn-content">
          <section className="learn-section">
            <h2>What Is a Sonnet?</h2>
            <p>
              A sonnet is a 14-line poem written in <strong>iambic pentameter</strong> with a
              specific rhyme scheme. The form originated in 13th-century Italy and became one
              of the most enduring structures in English poetry.
            </p>
            <p>
              What makes sonnets powerful isn't just their structure—it's the <strong>volta</strong>
              (turn), a shift in thought or feeling that typically occurs around line 9 or in the
              final couplet. This turn creates dramatic tension and allows the poem to surprise
              the reader.
            </p>

            <div className="tip-box">
              <div className="tip-label">Key Requirements</div>
              <p>
                Every traditional sonnet has: <strong>14 lines</strong>, <strong>iambic pentameter</strong>
                (10 syllables per line in a da-DUM pattern), a <strong>rhyme scheme</strong>, and a
                <strong> volta</strong> (turn) that shifts the poem's direction.
              </p>
            </div>
          </section>

          <section className="learn-section">
            <h2>The Two Main Sonnet Forms</h2>
            <p>
              While there are several sonnet variations, two forms dominate: the <strong>Shakespearean</strong>
              (English) sonnet and the <strong>Petrarchan</strong> (Italian) sonnet. Each has its own
              structure and strengths.
            </p>

            <h3>Shakespearean Sonnet</h3>
            <p>
              The Shakespearean sonnet consists of <strong>three quatrains</strong> (4-line stanzas)
              followed by a <strong>couplet</strong> (2 lines). The rhyme scheme is:
            </p>
            <div className="rhyme-scheme-display">
              <span className="scheme-part">ABAB</span>
              <span className="scheme-part">CDCD</span>
              <span className="scheme-part">EFEF</span>
              <span className="scheme-part couplet">GG</span>
            </div>
            <p>
              This structure allows the poet to develop an idea through three stages, then deliver
              a punchy conclusion or twist in the final couplet. The volta typically comes at line
              13, just before the couplet.
            </p>

            <div className="example-box">
              <div className="example-label">Shakespearean Example</div>
              <div className="poem-example">
                <div className="poem-line">Shall I compare thee to a summer's day? <span className="rhyme-label">A</span></div>
                <div className="poem-line">Thou art more lovely and more temperate: <span className="rhyme-label">B</span></div>
                <div className="poem-line">Rough winds do shake the darling buds of May, <span className="rhyme-label">A</span></div>
                <div className="poem-line">And summer's lease hath all too short a date. <span className="rhyme-label">B</span></div>
                <div className="poem-line stanza-break"></div>
                <div className="poem-line">Sometime too hot the eye of heaven shines, <span className="rhyme-label">C</span></div>
                <div className="poem-line">And often is his gold complexion dimmed; <span className="rhyme-label">D</span></div>
                <div className="poem-line">And every fair from fair sometime declines, <span className="rhyme-label">C</span></div>
                <div className="poem-line">By chance, or nature's changing course, untrimmed; <span className="rhyme-label">D</span></div>
                <div className="poem-line stanza-break"></div>
                <div className="poem-line">But thy eternal summer shall not fade, <span className="rhyme-label">E</span></div>
                <div className="poem-line">Nor lose possession of that fair thou ow'st; <span className="rhyme-label">F</span></div>
                <div className="poem-line">Nor shall death brag thou wand'rest in his shade, <span className="rhyme-label">E</span></div>
                <div className="poem-line">When in eternal lines to Time thou grow'st. <span className="rhyme-label">F</span></div>
                <div className="poem-line stanza-break"></div>
                <div className="poem-line">So long as men can breathe, or eyes can see, <span className="rhyme-label">G</span></div>
                <div className="poem-line">So long lives this, and this gives life to thee. <span className="rhyme-label">G</span></div>
              </div>
              <div className="example-attribution">— William Shakespeare, Sonnet 18</div>
              <div className="example-analysis">
                <strong>Structure:</strong> Quatrain 1 poses a question and notes summer's flaws.
                Quatrain 2 expands on nature's impermanence. Quatrain 3 turns ("But") to the beloved's
                eternal beauty. The couplet delivers the thesis: poetry itself immortalizes.
              </div>
            </div>

            <h3>Petrarchan Sonnet</h3>
            <p>
              The Petrarchan sonnet divides into an <strong>octave</strong> (8 lines) and a
              <strong> sestet</strong> (6 lines). The rhyme scheme is:
            </p>
            <div className="rhyme-scheme-display">
              <span className="scheme-part octave">ABBAABBA</span>
              <span className="scheme-part sestet">CDECDE</span>
              <span className="scheme-note">(or CDCDCD)</span>
            </div>
            <p>
              The volta comes between the octave and sestet (after line 8). This creates a clear
              two-part structure: the octave presents a problem, question, or situation; the
              sestet offers a resolution, answer, or shift in perspective.
            </p>

            <div className="example-box">
              <div className="example-label">Petrarchan Example</div>
              <div className="poem-example">
                <div className="poem-line">How do I love thee? Let me count the ways. <span className="rhyme-label">A</span></div>
                <div className="poem-line">I love thee to the depth and breadth and height <span className="rhyme-label">B</span></div>
                <div className="poem-line">My soul can reach, when feeling out of sight <span className="rhyme-label">B</span></div>
                <div className="poem-line">For the ends of being and ideal grace. <span className="rhyme-label">A</span></div>
                <div className="poem-line">I love thee to the level of every day's <span className="rhyme-label">A</span></div>
                <div className="poem-line">Most quiet need, by sun and candle-light. <span className="rhyme-label">B</span></div>
                <div className="poem-line">I love thee freely, as men strive for right. <span className="rhyme-label">B</span></div>
                <div className="poem-line">I love thee purely, as they turn from praise. <span className="rhyme-label">A</span></div>
                <div className="poem-line stanza-break volta-marker">↓ Volta</div>
                <div className="poem-line">I love thee with the passion put to use <span className="rhyme-label">C</span></div>
                <div className="poem-line">In my old griefs, and with my childhood's faith. <span className="rhyme-label">D</span></div>
                <div className="poem-line">I love thee with a love I seemed to lose <span className="rhyme-label">C</span></div>
                <div className="poem-line">With my lost saints. I love thee with the breath, <span className="rhyme-label">D</span></div>
                <div className="poem-line">Smiles, tears, of all my life; and, if God choose, <span className="rhyme-label">C</span></div>
                <div className="poem-line">I shall but love thee better after death. <span className="rhyme-label">D</span></div>
              </div>
              <div className="example-attribution">— Elizabeth Barrett Browning, Sonnet 43</div>
              <div className="example-analysis">
                <strong>Structure:</strong> The octave catalogs different ways of loving (breadth,
                height, depth, daily need, freely, purely). After the volta, the sestet deepens
                the emotion with references to past grief, lost faith, and the final transcendent
                claim: love beyond death.
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Iambic Pentameter</h2>
            <p>
              Sonnets are written in <strong>iambic pentameter</strong>: five iambs per line.
              An iamb is an unstressed syllable followed by a stressed syllable (da-DUM).
            </p>
            <p>
              This creates a rhythm like a heartbeat:
            </p>

            <div className="meter-example">
              <div className="meter-line">
                <span className="meter-text">Shall I | com-PARE | thee TO | a SUM | mer's DAY?</span>
              </div>
              <div className="meter-pattern">
                <span className="foot">u /</span>
                <span className="foot">u /</span>
                <span className="foot">u /</span>
                <span className="foot">u /</span>
                <span className="foot">u /</span>
              </div>
            </div>

            <p>
              Each line has 10 syllables: 5 unstressed (u) and 5 stressed (/). The pattern
              isn't always perfect—poets vary it for emphasis—but the underlying rhythm
              should feel consistent.
            </p>

            <div className="tip-box">
              <div className="tip-label">Learn More About Meter</div>
              <p>
                Iambic pentameter can take time to master. For a deeper understanding of meter,
                scansion, and stress patterns, see our{' '}
                <Link to="/learn/scansion">Guide to Meter and Scansion</Link>.
              </p>
            </div>
          </section>

          <section className="learn-section">
            <h2>The Volta (Turn)</h2>
            <p>
              The <strong>volta</strong> is the emotional or logical turn that makes a sonnet
              more than just 14 rhyming lines. It's where the poem shifts direction, complicates
              its argument, or delivers its surprise.
            </p>

            <div className="info-grid two-col">
              <div className="info-card">
                <h4>Shakespearean Volta</h4>
                <p>
                  Usually at line 13, marked by the couplet. Often introduced with "But," "Yet,"
                  "So," or "Then." The couplet often reverses, resolves, or reframes everything
                  that came before.
                </p>
              </div>
              <div className="info-card">
                <h4>Petrarchan Volta</h4>
                <p>
                  At line 9, between octave and sestet. Creates a clear before/after structure.
                  The octave poses a problem; the sestet responds. Shift words: "But," "Yet,"
                  "And yet," "However."
                </p>
              </div>
            </div>

            <p>
              A weak volta makes a sonnet feel flat. The best sonnets use the volta to surprise
              the reader—to complicate what seemed simple, or to resolve what seemed impossible.
            </p>
          </section>

          <section className="learn-section">
            <h2>Writing Your First Sonnet: Step by Step</h2>

            <div className="steps-list">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Choose Your Subject and Form</h4>
                  <p>
                    Traditional sonnets explore love, beauty, mortality, or nature—but any subject
                    that involves tension or transformation works. Decide: Shakespearean (build to
                    a couplet) or Petrarchan (problem → resolution)?
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Plan Your Argument</h4>
                  <p>
                    Outline what each section will say. For Shakespearean: What's the idea in Q1?
                    How does Q2 develop it? What new angle does Q3 add? What does the couplet
                    conclude? For Petrarchan: What's the problem? What's the turn?
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Draft in Prose First</h4>
                  <p>
                    Write out your argument without worrying about meter or rhyme. Get the ideas
                    down. What images do you want to use? What's the emotional arc? Where's the
                    surprise?
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Find Your Rhymes</h4>
                  <p>
                    Identify the key words you want at line endings. Use our{' '}
                    <Link to="/rhymes">Rhyme Dictionary</Link> to find options. You need 7 rhyme
                    pairs for Shakespearean, 5 for Petrarchan. Choose rhymes that feel natural,
                    not forced.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h4>Write in Iambic Pentameter</h4>
                  <p>
                    Now shape your lines into 10 syllables each with the da-DUM rhythm. Read aloud
                    constantly. Use our <Link to="/meter-analyzer">Meter Analyzer</Link> to check
                    your stress patterns. Don't sacrifice meaning for meter—adjust both.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">6</div>
                <div className="step-content">
                  <h4>Revise for the Volta</h4>
                  <p>
                    Make sure your turn is strong. Does line 9 (Petrarchan) or line 13 (Shakespearean)
                    genuinely shift the poem? The reader should feel the ground move. If not,
                    strengthen the contrast.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">7</div>
                <div className="step-content">
                  <h4>Test with the Sonnet Checker</h4>
                  <p>
                    Use our <Link to="/sonnet-checker">Sonnet Checker</Link> to verify your 14 lines,
                    rhyme scheme, and syllable counts. It will flag any structural issues so you
                    can fix them.
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
                  <h4>Forcing Rhymes</h4>
                  <p>
                    "Love" doesn't have to rhyme with "above" or "dove"—those are clichés. If a
                    rhyme sounds awkward or makes you contort your syntax, find another word.
                    Check our <Link to="/rhymes">Rhyme Dictionary</Link> for fresher options.
                  </p>
                </div>
              </div>

              <div className="mistake">
                <div className="mistake-icon">✕</div>
                <div className="mistake-content">
                  <h4>Ignoring the Volta</h4>
                  <p>
                    A sonnet without a strong turn is just 14 lines of verse. Make sure something
                    shifts—in tone, argument, or perspective. The volta is what makes a sonnet
                    feel complete.
                  </p>
                </div>
              </div>

              <div className="mistake">
                <div className="mistake-icon">✕</div>
                <div className="mistake-content">
                  <h4>Irregular Meter Throughout</h4>
                  <p>
                    While poets do vary iambic pentameter for effect, every line shouldn't feel
                    metrically chaotic. Establish the rhythm, then vary it deliberately. Read
                    aloud to hear if the beat is there.
                  </p>
                </div>
              </div>

              <div className="mistake">
                <div className="mistake-icon">✕</div>
                <div className="mistake-content">
                  <h4>Weak Final Couplet</h4>
                  <p>
                    In Shakespearean sonnets, the couplet carries enormous weight. A flat or
                    obvious conclusion ("And that is why I love you so") deflates the whole poem.
                    The couplet should surprise or resonate.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Shakespearean vs. Petrarchan: Which to Choose?</h2>
            <p>
              Both forms have their strengths. Here's when each might work best:
            </p>

            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Choose Shakespearean When...</th>
                  <th>Choose Petrarchan When...</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>You want to build an argument in stages</td>
                  <td>You have a clear problem/resolution structure</td>
                </tr>
                <tr>
                  <td>You want a punchy, memorable ending</td>
                  <td>You want a more meditative, expansive conclusion</td>
                </tr>
                <tr>
                  <td>English is your primary language (more natural rhymes)</td>
                  <td>You're comfortable with fewer rhyme sounds (only 4-5)</td>
                </tr>
                <tr>
                  <td>You like the flexibility of three different ideas</td>
                  <td>You want a strong binary contrast (before/after)</td>
                </tr>
              </tbody>
            </table>

            <p>
              Neither form is "better"—they're different tools. Many poets try both to see which
              suits their voice and subject.
            </p>
          </section>

          <section className="learn-section cta-section">
            <h2>Ready to Write Your Sonnet?</h2>
            <p>
              Now that you understand the form, try writing your own. Our Sonnet Checker will
              analyze your 14 lines, verify your rhyme scheme, and check your meter.
            </p>
            <div className="cta-buttons">
              <Link to="/sonnet-checker" className="cta-button primary">
                Try the Sonnet Checker
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
                <span className="related-icon">📐</span>
                <span className="related-text">
                  <strong>Understanding Meter & Scansion</strong>
                  <span>Master iambic pentameter and stress patterns</span>
                </span>
              </Link>
              <Link to="/meter-analyzer" className="related-link">
                <span className="related-icon">🎵</span>
                <span className="related-text">
                  <strong>Meter Analyzer Tool</strong>
                  <span>Check your poem's rhythm and stress</span>
                </span>
              </Link>
              <Link to="/rhymes" className="related-link">
                <span className="related-icon">🔤</span>
                <span className="related-text">
                  <strong>Rhyme Dictionary</strong>
                  <span>Find perfect and near rhymes</span>
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
