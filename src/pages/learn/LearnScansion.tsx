import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { SEOHead } from '../../components/SEOHead';
import './LearnPages.css';

export function LearnScansion() {
  return (
    <Layout>
      <SEOHead
        title="Understanding Meter & Scansion - A Complete Guide to Poetic Rhythm"
        description="Learn scansion: how to mark stressed and unstressed syllables, identify iambic pentameter, and understand poetic meter. Covers iambs, trochees, anapests, dactyls, and more."
        canonicalPath="/learn/scansion"
        keywords="scansion, poetic meter, iambic pentameter, stressed syllables, trochee, anapest, dactyl, poetry rhythm, metrical feet"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Understanding Meter & Scansion - A Complete Guide to Poetic Rhythm",
          "description": "Master scansion and poetic meter. Learn to identify iambic, trochaic, anapestic, and dactylic patterns in poetry.",
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
            <span>Scansion</span>
          </div>
          <h1>Understanding Meter & Scansion</h1>
          <p className="learn-subtitle">
            The heartbeat of poetry: how stress patterns create rhythm, and how to analyze them
          </p>
        </header>

        <div className="learn-content">
          <section className="learn-section">
            <h2>What Is Scansion?</h2>
            <p>
              <strong>Scansion</strong> is the process of analyzing a poem's meter by marking
              stressed (/) and unstressed (u) syllables. It reveals the rhythmic pattern—the
              "beat"—that underlies metered poetry.
            </p>
            <p>
              Understanding scansion helps you read poetry aloud with natural rhythm, write
              in traditional forms like sonnets and ballads, and appreciate the craft behind
              centuries of verse.
            </p>

            <div className="example-box">
              <div className="example-label">Scansion Example</div>
              <div className="scansion-example">
                <div className="scansion-line">
                  <span className="scansion-marks">u&nbsp;&nbsp; /&nbsp;&nbsp;&nbsp; u&nbsp;&nbsp; /&nbsp;&nbsp;&nbsp;&nbsp; u&nbsp;&nbsp;&nbsp; /&nbsp;&nbsp;&nbsp; u&nbsp;&nbsp; /&nbsp;&nbsp;&nbsp; u&nbsp;&nbsp;&nbsp; /</span>
                </div>
                <div className="scansion-line">
                  <span className="scansion-text">Shall I | com-PARE | thee TO | a SUM | mer's DAY?</span>
                </div>
              </div>
              <div className="example-analysis">
                This line has 10 syllables in 5 pairs (feet). Each foot has an unstressed syllable
                followed by a stressed syllable (u /). This pattern is called <strong>iambic pentameter</strong>.
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Stress in English</h2>
            <p>
              Before you can scan poetry, you need to hear stress. In English, some syllables
              are naturally emphasized (stressed) while others are softer (unstressed).
            </p>

            <h3>Word Stress</h3>
            <p>
              Multi-syllable words have fixed stress patterns:
            </p>
            <ul className="feature-list">
              <li><strong>be-GIN</strong> (stress on second syllable)</li>
              <li><strong>BEAU-ti-ful</strong> (stress on first syllable)</li>
              <li><strong>un-der-STAND</strong> (stress on third syllable)</li>
              <li><strong>com-PU-ter</strong> (stress on second syllable)</li>
            </ul>

            <div className="tip-box">
              <div className="tip-label">Finding Stress</div>
              <p>
                Not sure which syllable is stressed? Try saying the word with emphasis on different
                syllables. "beau-TI-ful" sounds wrong; "BEAU-ti-ful" sounds right. Or use our{' '}
                <Link to="/syllables">Syllable Counter</Link>, which shows stress patterns.
              </p>
            </div>

            <h3>Sentence Stress</h3>
            <p>
              In sentences, content words (nouns, verbs, adjectives) are usually stressed, while
              function words (articles, prepositions, pronouns) are usually unstressed:
            </p>
            <div className="example-box">
              <div className="scansion-example">
                <div className="scansion-line">
                  <span className="scansion-marks">&nbsp;u&nbsp;&nbsp; /&nbsp;&nbsp;&nbsp;&nbsp;u&nbsp;&nbsp;&nbsp;u&nbsp;&nbsp;&nbsp; /</span>
                </div>
                <div className="scansion-line">
                  <span className="scansion-text">The CAT sat on the MAT</span>
                </div>
              </div>
              <div className="example-analysis">
                "The" and "on" are unstressed function words. "Cat," "sat," and "mat" are stressed
                content words.
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Metrical Feet</h2>
            <p>
              A <strong>foot</strong> is the basic unit of meter—a pattern of stressed and
              unstressed syllables. The four most common feet are:
            </p>

            <div className="meter-cards">
              <div className="meter-card">
                <div className="meter-name">Iamb</div>
                <div className="meter-pattern-display">u /</div>
                <div className="meter-sound">da-DUM</div>
                <div className="meter-example-word">a-WAKE, be-GIN, de-LIGHT</div>
                <div className="meter-description">
                  The most natural rhythm in English. Rising rhythm—unstressed to stressed.
                  Used in sonnets, blank verse, heroic couplets.
                </div>
              </div>

              <div className="meter-card">
                <div className="meter-name">Trochee</div>
                <div className="meter-pattern-display">/ u</div>
                <div className="meter-sound">DUM-da</div>
                <div className="meter-example-word">GAR-den, FAIR-y, NIGH-fall</div>
                <div className="meter-description">
                  Falling rhythm—stressed to unstressed. Creates a driving, insistent feel.
                  Used in chants, children's verse, and incantations.
                </div>
              </div>

              <div className="meter-card">
                <div className="meter-name">Anapest</div>
                <div className="meter-pattern-display">u u /</div>
                <div className="meter-sound">da-da-DUM</div>
                <div className="meter-example-word">in-ter-VENE, un-der-STAND</div>
                <div className="meter-description">
                  Galloping rhythm—two unstressed syllables, then stressed. Creates speed and
                  momentum. Common in limericks and comic verse.
                </div>
              </div>

              <div className="meter-card">
                <div className="meter-name">Dactyl</div>
                <div className="meter-pattern-display">/ u u</div>
                <div className="meter-sound">DUM-da-da</div>
                <div className="meter-example-word">MER-ri-ly, BEAU-ti-ful</div>
                <div className="meter-description">
                  Rolling, waltz-like rhythm. Rare in English poetry but used in classical
                  verse and some hymns.
                </div>
              </div>
            </div>

            <h3>Other Feet</h3>
            <p>
              Two additional feet appear less often but are important to recognize:
            </p>
            <div className="info-grid two-col">
              <div className="info-card">
                <h4>Spondee (/ /)</h4>
                <p>
                  Two stressed syllables in a row. "HEART-BREAK," "DEAD-LOCK." Used for emphasis,
                  not as the base meter. Poets substitute spondees to slow down a line.
                </p>
              </div>
              <div className="info-card">
                <h4>Pyrrhic (u u)</h4>
                <p>
                  Two unstressed syllables. Usually occurs between stronger feet. Creates a
                  momentary lightness before the next stressed syllable.
                </p>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Meter Names</h2>
            <p>
              Meter is named by combining the <strong>foot type</strong> with the <strong>number
              of feet per line</strong>:
            </p>

            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feet Per Line</th>
                  <th>Name</th>
                  <th>Syllables</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>3 feet</td>
                  <td>Trimeter</td>
                  <td>6 (iambic), 9 (anapestic)</td>
                </tr>
                <tr>
                  <td>4 feet</td>
                  <td>Tetrameter</td>
                  <td>8 (iambic), 12 (anapestic)</td>
                </tr>
                <tr>
                  <td>5 feet</td>
                  <td>Pentameter</td>
                  <td>10 (iambic), 15 (anapestic)</td>
                </tr>
                <tr>
                  <td>6 feet</td>
                  <td>Hexameter</td>
                  <td>12 (iambic), 18 (anapestic)</td>
                </tr>
              </tbody>
            </table>

            <p>
              So <strong>iambic pentameter</strong> = iambs (u /) + pentameter (5 feet) = 10 syllables
              in a da-DUM da-DUM da-DUM da-DUM da-DUM pattern.
            </p>

            <div className="example-box">
              <div className="example-label">Common Meters in Action</div>
              <div className="scansion-example">
                <div className="scansion-label">Iambic Pentameter (Shakespeare)</div>
                <div className="scansion-line">
                  <span className="scansion-text">But SOFT, what LIGHT through YON-der WIN-dow BREAKS?</span>
                </div>
              </div>
              <div className="scansion-example">
                <div className="scansion-label">Trochaic Tetrameter (Longfellow)</div>
                <div className="scansion-line">
                  <span className="scansion-text">BY the SHORES of GIT-che GU-mee</span>
                </div>
              </div>
              <div className="scansion-example">
                <div className="scansion-label">Anapestic Tetrameter (Byron)</div>
                <div className="scansion-line">
                  <span className="scansion-text">The As-SYR-ian came DOWN like a WOLF on the FOLD</span>
                </div>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>How to Scan a Poem</h2>

            <div className="steps-list">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Read Aloud Naturally</h4>
                  <p>
                    Don't force a rhythm. Read the line as if it were ordinary speech. Where do
                    you naturally emphasize? Those are likely your stressed syllables.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Mark the Obvious Stresses</h4>
                  <p>
                    Content words (nouns, verbs, adjectives) usually carry stress. Mark them with /.
                    Mark clearly unstressed syllables (articles, prepositions) with u.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Identify the Pattern</h4>
                  <p>
                    Look for repeating feet. Is it u / u / u / (iambic)? Or / u / u / u (trochaic)?
                    Count the feet to determine if it's trimeter, tetrameter, pentameter, etc.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Check Ambiguous Syllables</h4>
                  <p>
                    Some syllables could go either way. Ask: Does the expected pattern suggest
                    stress here? Does the meaning suggest emphasis? Trust your ear, but let the
                    overall pattern guide you.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h4>Note Variations</h4>
                  <p>
                    Poets vary meter for effect. A spondee (/ /) might slow down a line. An
                    inverted foot at the start might create emphasis. These aren't mistakes—they're
                    choices.
                  </p>
                </div>
              </div>
            </div>

            <div className="tip-box">
              <div className="tip-label">Try Our Tool</div>
              <p>
                Our <Link to="/meter-analyzer">Meter Analyzer</Link> will scan your poem automatically,
                showing stressed and unstressed syllables for each line. It's a great way to check
                your work or learn by example.
              </p>
            </div>
          </section>

          <section className="learn-section">
            <h2>Common Variations</h2>
            <p>
              Even in strict meter, poets rarely follow the pattern perfectly. These variations
              are intentional tools:
            </p>

            <div className="info-grid two-col">
              <div className="info-card">
                <h4>Inverted First Foot</h4>
                <p>
                  Starting an iambic line with a trochee (/ u instead of u /). Creates emphasis
                  at the line's beginning. "TELL me not in mournful numbers..."
                </p>
              </div>
              <div className="info-card">
                <h4>Feminine Ending</h4>
                <p>
                  An extra unstressed syllable at the end. "To BE or NOT to be, that IS the QUES-tion"
                  (11 syllables, ending unstressed).
                </p>
              </div>
              <div className="info-card">
                <h4>Spondaic Substitution</h4>
                <p>
                  Replacing an iamb with a spondee (/ /) to create weight. "The LONG DAY wanes..."
                  The double stress slows the reader down.
                </p>
              </div>
              <div className="info-card">
                <h4>Pyrrhic Substitution</h4>
                <p>
                  Two unstressed syllables (u u) where a foot would normally be. Creates a light,
                  rushing feel before the next stress.
                </p>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Meter in Historical Context</h2>
            <p>
              Different periods and traditions have favored different meters:
            </p>

            <h3>Classical & Renaissance</h3>
            <p>
              <strong>Iambic pentameter</strong> dominated English poetry from Chaucer through the
              Elizabethan era. Shakespeare's plays and sonnets, Milton's "Paradise Lost," and most
              Renaissance verse used this "heroic" meter.
            </p>

            <h3>Romantic Era</h3>
            <p>
              Poets like Byron, Shelley, and Keats continued using iambic pentameter but also
              experimented with other meters. Byron's "The Destruction of Sennacherib" uses
              <strong> anapestic tetrameter</strong> for its galloping energy.
            </p>

            <h3>Victorian Era</h3>
            <p>
              Tennyson and Browning used meter with great technical skill. <strong>Trochaic
              tetrameter</strong> became popular for narrative poems like "The Song of Hiawatha."
            </p>

            <h3>Modern & Contemporary</h3>
            <p>
              Free verse became dominant in the 20th century, but many contemporary poets still
              use meter—sometimes strictly, sometimes as a subtle undercurrent. Poets like
              Richard Wilbur, Derek Walcott, and Mary Oliver blend meter with modern sensibilities.
            </p>
          </section>

          <section className="learn-section">
            <h2>Why Meter Matters</h2>
            <p>
              Even if you write free verse, understanding meter helps you:
            </p>
            <ul className="feature-list">
              <li><strong>Read poetry aloud</strong> with natural rhythm</li>
              <li><strong>Appreciate craft</strong> in traditional forms</li>
              <li><strong>Create rhythm intentionally</strong> in your own work</li>
              <li><strong>Understand variation</strong>—when a poet breaks the pattern, they're making a choice</li>
              <li><strong>Write in forms</strong> like sonnets, villanelles, or ballads</li>
            </ul>
          </section>

          <section className="learn-section cta-section">
            <h2>Practice Your Scansion</h2>
            <p>
              Use our Meter Analyzer to scan any poem and see its stress patterns visualized.
              Try it with Shakespeare, your own poems, or any verse you want to understand better.
            </p>
            <div className="cta-buttons">
              <Link to="/meter-analyzer" className="cta-button primary">
                Open Meter Analyzer
              </Link>
              <Link to="/syllables" className="cta-button secondary">
                Syllable Counter
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
                  <span>Put iambic pentameter into practice</span>
                </span>
              </Link>
              <Link to="/learn/haiku" className="related-link">
                <span className="related-icon">🌸</span>
                <span className="related-text">
                  <strong>How to Write a Haiku</strong>
                  <span>Syllables without meter</span>
                </span>
              </Link>
              <Link to="/learn/free-verse" className="related-link">
                <span className="related-icon">🌊</span>
                <span className="related-text">
                  <strong>How to Write Free Verse</strong>
                  <span>Rhythm without meter</span>
                </span>
              </Link>
              <Link to="/rhyme-scheme-analyzer" className="related-link">
                <span className="related-icon">🎨</span>
                <span className="related-text">
                  <strong>Rhyme Scheme Analyzer</strong>
                  <span>Detect patterns in any poem</span>
                </span>
              </Link>
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
}
