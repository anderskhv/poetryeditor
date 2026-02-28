import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { SEOHead } from '../../components/SEOHead';
import './LearnPages.css';

export function LearnMeter() {
  return (
    <Layout>
      <SEOHead
        title="Understanding Meter in Poetry - Iambic, Trochaic & More"
        description="Learn about poetic meter: iambic pentameter, trochaic, anapestic, dactylic, and spondaic patterns. Understand how stress patterns create rhythm in poetry with examples and practice tips."
        canonicalPath="/learn/meter"
        keywords="poetic meter, iambic pentameter, trochaic meter, anapestic meter, dactylic meter, spondee, poetry rhythm, stressed syllables in poetry, meter in poetry explained"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Understanding Meter in Poetry - A Complete Guide",
          "description": "A comprehensive guide to poetic meter, including iambic pentameter, trochaic, anapestic, and dactylic patterns.",
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
            <span>Meter</span>
          </div>
          <h1>Understanding Meter in Poetry</h1>
          <p className="learn-subtitle">
            How poets use patterns of stressed and unstressed syllables to create rhythm
          </p>
        </header>

        <div className="learn-content">
          <section className="learn-section">
            <h2>What Is Meter?</h2>
            <p>
              Meter is the rhythmic pattern created by arranging stressed (strong) and unstressed
              (weak) syllables in a line of poetry. Just as music has beats, poetry has meter. When
              you read "Shall I comPARE thee TO a SUMmer's DAY?" you naturally emphasize certain
              syllables — that pattern of emphasis is meter.
            </p>
            <p>
              Meter is measured in <em>feet</em> — small units of stressed and unstressed syllables.
              A line's meter is named by combining the foot type with how many feet appear per line.
            </p>
          </section>

          <section className="learn-section">
            <h2>The Five Common Metrical Feet</h2>

            <div className="learn-meter-grid">
              <div className="learn-meter-item">
                <h3>Iamb (da-DUM)</h3>
                <p className="meter-pattern">unstressed + stressed</p>
                <p>The most natural meter in English. It mirrors how we normally speak: "to-DAY," "a-BOVE," "de-LIGHT."</p>
                <div className="learn-example">
                  <p className="example-text">
                    Shall <strong>I</strong> com<strong>PARE</strong> thee <strong>TO</strong> a <strong>SUM</strong>mer's <strong>DAY</strong>?
                  </p>
                  <p className="example-citation">— Shakespeare, <Link to="/poems/sonnet-18">Sonnet 18</Link> (iambic pentameter)</p>
                </div>
              </div>

              <div className="learn-meter-item">
                <h3>Trochee (DUM-da)</h3>
                <p className="meter-pattern">stressed + unstressed</p>
                <p>The reverse of an iamb. Trochees feel more forceful and insistent: "TI-ger," "NEV-er," "GAR-den."</p>
                <div className="learn-example">
                  <p className="example-text">
                    <strong>TY</strong>-ger <strong>TY</strong>-ger <strong>BURN</strong>-ing <strong>BRIGHT</strong>
                  </p>
                  <p className="example-citation">— Blake, <Link to="/poems/the-tyger">"The Tyger"</Link> (trochaic tetrameter)</p>
                </div>
              </div>

              <div className="learn-meter-item">
                <h3>Anapest (da-da-DUM)</h3>
                <p className="meter-pattern">unstressed + unstressed + stressed</p>
                <p>Creates a galloping, forward-moving rhythm. Common in narrative and comic verse: "in-ter-VENE," "un-der-STAND."</p>
                <div className="learn-example">
                  <p className="example-text">
                    'Twas the <strong>NIGHT</strong> before <strong>CHRIST</strong>-mas and <strong>ALL</strong> through the <strong>HOUSE</strong>
                  </p>
                  <p className="example-citation">— Clement Clarke Moore</p>
                </div>
              </div>

              <div className="learn-meter-item">
                <h3>Dactyl (DUM-da-da)</h3>
                <p className="meter-pattern">stressed + unstressed + unstressed</p>
                <p>The reverse of an anapest. Dactyls feel grand and rolling: "BEAU-ti-ful," "MUR-mur-ing," "EL-e-gant."</p>
              </div>

              <div className="learn-meter-item">
                <h3>Spondee (DUM-DUM)</h3>
                <p className="meter-pattern">stressed + stressed</p>
                <p>Two heavy stresses in a row. Spondees slow the reader down and add weight: "HEART-BREAK," "DEAD-STOP." Rarely sustained for a full poem, but powerful when mixed in.</p>
              </div>
            </div>
          </section>

          <section className="learn-section">
            <h2>Line Lengths</h2>
            <p>The number of feet per line has its own terminology:</p>
            <div className="learn-example">
              <ul className="learn-list">
                <li><strong>Monometer</strong> — 1 foot per line (rare, very short)</li>
                <li><strong>Dimeter</strong> — 2 feet per line</li>
                <li><strong>Trimeter</strong> — 3 feet per line (common in hymns)</li>
                <li><strong>Tetrameter</strong> — 4 feet per line (common in ballads)</li>
                <li><strong>Pentameter</strong> — 5 feet per line (the most common in English)</li>
                <li><strong>Hexameter</strong> — 6 feet per line (the meter of Homer's epics)</li>
              </ul>
            </div>
            <p>
              So "iambic pentameter" means five iambs per line (da-DUM da-DUM da-DUM da-DUM da-DUM),
              giving you ten syllables. This is by far the most important meter in English poetry —
              Shakespeare, Milton, Wordsworth, and Frost all wrote primarily in iambic pentameter.
            </p>
          </section>

          <section className="learn-section">
            <h2>Why Meter Matters</h2>
            <p>
              Meter isn't just a rule to follow — it's a tool for expression. A regular meter
              creates expectations in the reader's mind. When you break the pattern, the disruption
              draws attention to that moment. Shakespeare used metrical substitutions constantly:
              a trochee at the start of an iambic line creates emphasis, a spondee slows things down
              for gravity.
            </p>
            <p>
              Even free verse poets benefit from understanding meter. Knowing the rules helps you
              break them intentionally rather than accidentally. Many successful free verse poems
              have passages of regular meter woven in for effect.
            </p>
          </section>

          <section className="learn-section">
            <h2>How to Scan a Poem</h2>
            <p>
              Scanning (or scansion) is the process of marking stressed and unstressed syllables.
              Here's a practical approach:
            </p>
            <div className="learn-example">
              <ul className="learn-list">
                <li>Read the line aloud naturally — don't force a rhythm</li>
                <li>Mark which syllables you naturally emphasize</li>
                <li>Look for patterns in your markings</li>
                <li>Identify the dominant foot type and count the feet</li>
                <li>Note where the pattern breaks — these are substitutions</li>
              </ul>
            </div>
            <p>
              Our <Link to="/learn/scansion">Scansion Guide</Link> goes deeper into the technique.
              The <Link to="/">Poetry Editor</Link>'s analysis panel includes automatic scansion
              that marks stressed syllables as you write.
            </p>
          </section>

          <section className="learn-section learn-cta">
            <h2>Analyze Your Poem's Meter</h2>
            <p>
              Open the <Link to="/">Poetry Editor</Link> and paste or write a poem. The Rhythm tab
              in the analysis panel will detect your meter pattern, show syllable counts per line,
              and highlight where your rhythm varies.
            </p>
            <div className="learn-tool-links">
              <Link to="/" className="learn-tool-link">Open Editor</Link>
              <Link to="/syllables" className="learn-tool-link">Syllable Counter</Link>
              <Link to="/learn/scansion" className="learn-tool-link">Learn Scansion</Link>
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
}
