import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { SEOHead } from '../../components/SEOHead';
import './LearnPages.css';

export function AIPoetryCoach() {
  return (
    <Layout>
      <SEOHead
        title="AI Poetry Coach — Get Feedback on Your Poems"
        description="An AI poetry coach that reads your work and gives feedback on craft, rhythm, imagery, and voice. Write in the editor, ask questions, and improve your poetry."
        canonicalPath="/ai-poetry-coach"
        keywords="AI poetry coach, AI poetry editor, poetry feedback AI, AI writing coach for poetry, poetry coaching, AI poem feedback, poetry critique AI"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "AI Poetry Coach — Get Feedback on Your Poems",
          "description": "An AI poetry coach that reads your work and gives feedback on craft, rhythm, imagery, and voice.",
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
            <span>AI Poetry Coach</span>
          </div>
          <h1>AI Poetry Coach</h1>
          <p className="learn-subtitle">
            Write poetry in the editor and get feedback on craft, rhythm, imagery, and voice
          </p>
        </header>

        <div className="learn-content">
          <section className="learn-section">
            <h2>How It Works</h2>
            <p>
              The AI poetry coach lives in the right sidebar of the <Link to="/">poetry editor</Link>.
              Write or paste a poem, then open a conversation with the coach. It reads your poem
              and responds to whatever you ask — line-level craft questions, thematic feedback,
              suggestions for revision, or just a close reading.
            </p>
            <p>
              The coach is not a template or a generator. It reads what you've written and engages
              with your specific choices — your line breaks, your word choices, your rhythm. Think
              of it as a knowledgeable reader who's always available.
            </p>
          </section>

          <section className="learn-section">
            <h2>What the Coach Can Help With</h2>
            <ul>
              <li><strong>Craft feedback</strong> — line breaks, enjambment, word choice, economy of language</li>
              <li><strong>Rhythm and meter</strong> — scansion, stressed/unstressed patterns, how the poem sounds read aloud</li>
              <li><strong>Imagery and figurative language</strong> — metaphor, simile, concrete vs. abstract, sensory detail</li>
              <li><strong>Structure</strong> — how stanzas relate, pacing, where the poem turns</li>
              <li><strong>Tone and voice</strong> — consistency, register, emotional arc</li>
              <li><strong>Revision ideas</strong> — what to cut, what to expand, alternative phrasings</li>
            </ul>
          </section>

          <section className="learn-section">
            <h2>Built for Poets, Not Prompts</h2>
            <p>
              Unlike pasting your poem into a general-purpose AI chat, the poetry coach already
              has your poem in context. It knows the title, the full text, and the analysis data
              (rhyme scheme, meter, syllable counts) that the editor generates automatically.
              You don't need to set anything up — just ask.
            </p>
            <p>
              The coach remembers your conversation within a session and adapts to your level.
              Whether you're working on your first poem or your fiftieth, it meets you where you are.
            </p>
          </section>

          <section className="learn-section">
            <h2>What It Doesn't Do</h2>
            <p>
              The coach won't write poems for you. It won't generate lines or complete your stanzas.
              It's a reader and a critic, not a ghostwriter. Its job is to help you see your own
              work more clearly and make stronger choices.
            </p>
          </section>

          <section className="learn-section">
            <h2>Try It Now</h2>
            <p>
              Open the <Link to="/">poetry editor</Link>, write or paste a poem, and click the
              chat icon in the sidebar. The coach is free to use with a daily message limit.
            </p>
          </section>

          <section className="learn-section">
            <h2>Other Tools</h2>
            <p>
              The editor also includes a <Link to="/rhymes">rhyme finder</Link>,{' '}
              <Link to="/synonyms">synonym finder</Link>,{' '}
              <Link to="/syllables">syllable counter</Link>,{' '}
              and real-time analysis of rhythm, rhyme scheme, and style — all running
              locally in your browser.
            </p>
          </section>
        </div>
      </article>
    </Layout>
  );
}
