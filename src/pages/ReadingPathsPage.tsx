import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { getAllReadingPaths } from '../data/readingPaths';
import './ReadingPathsPage.css';

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function ReadingPathsPage() {
  const paths = getAllReadingPaths();

  return (
    <Layout>
      <SEOHead
        title="Reading Paths - Poetry Editor"
        description="Curated journeys through classic poetry. Learn sound, imagery, line breaks, form, and voice through guided reading with writing exercises."
        canonicalPath="/reading-paths"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Reading Paths - Poetry Editor",
          "description": "Curated reading paths to develop your poetic craft",
          "publisher": {
            "@type": "Organization",
            "name": "Poetry Editor",
            "url": "https://poetryeditor.com"
          }
        }}
      />
      <div className="reading-paths-page">
        <header className="reading-paths-header">
          <h1>Reading Paths</h1>
          <p className="reading-paths-intro">
            Curated journeys through the poem library. Each path teaches a specific craft concept
            through {paths.reduce((sum, p) => sum + p.steps.length, 0)} carefully chosen poems with
            guidance on what to notice and exercises to try.
          </p>
        </header>

        <div className="reading-paths-grid">
          {paths.map(path => (
            <Link key={path.slug} to={`/reading-paths/${path.slug}`} className="path-card">
              <div className="path-card-header">
                <h2 className="path-card-title">{path.title}</h2>
                <span className={`path-difficulty ${path.difficulty}`}>
                  {DIFFICULTY_LABEL[path.difficulty]}
                </span>
              </div>
              <p className="path-card-subtitle">{path.subtitle}</p>
              <p className="path-card-description">{path.description}</p>
              <div className="path-card-meta">
                <span>{path.steps.length} poems</span>
                <span className="meta-dot">&middot;</span>
                <span>~{path.estimatedMinutes} min</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
