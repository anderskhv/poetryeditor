import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { getReadingPathBySlug, ReadingPath, ReadingPathStep } from '../data/readingPaths';
import { getPoemBySlug } from '../data/poems';
import './ReadingPathPage.css';

const PROGRESS_KEY = 'readingPathProgress';

function getProgress(): Record<string, string[]> {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: Record<string, string[]>) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function StepCard({ step, index, pathSlug, isComplete, onToggle }: {
  step: ReadingPathStep;
  index: number;
  pathSlug: string;
  isComplete: boolean;
  onToggle: () => void;
}) {
  const poem = getPoemBySlug(step.poemSlug);
  const [exerciseExpanded, setExerciseExpanded] = useState(false);

  if (!poem) return null;

  return (
    <div className={`step-card ${isComplete ? 'complete' : ''}`}>
      <div className="step-number-col">
        <button
          className={`step-check ${isComplete ? 'checked' : ''}`}
          onClick={onToggle}
          aria-label={isComplete ? 'Mark as not read' : 'Mark as read'}
        >
          {isComplete ? '✓' : index + 1}
        </button>
      </div>
      <div className="step-content">
        <div className="step-poem-header">
          <Link to={`/poems/${step.poemSlug}`} className="step-poem-link">
            <span className="step-poem-title">{poem.title}</span>
            <span className="step-poem-poet">by {poem.poet}</span>
          </Link>
        </div>
        <p className="step-notice">{step.noticeThis}</p>
        {step.exercise && (
          <div className="step-exercise-section">
            <button
              className="step-exercise-toggle"
              onClick={() => setExerciseExpanded(!exerciseExpanded)}
            >
              {exerciseExpanded ? '▾ Writing exercise' : '▸ Writing exercise'}
            </button>
            {exerciseExpanded && (
              <div className="step-exercise-content">
                <p>{step.exercise}</p>
                <Link to="/" className="exercise-open-editor">
                  Open editor →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ReadingPathPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [path, setPath] = useState<ReadingPath | null>(null);
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);

  useEffect(() => {
    if (slug) {
      const found = getReadingPathBySlug(slug);
      if (found) {
        setPath(found);
        const progress = getProgress();
        setCompletedSlugs(progress[slug] || []);
      } else {
        navigate('/reading-paths');
      }
    }
  }, [slug, navigate]);

  const toggleStep = useCallback((poemSlug: string) => {
    if (!slug) return;
    setCompletedSlugs(prev => {
      const next = prev.includes(poemSlug)
        ? prev.filter(s => s !== poemSlug)
        : [...prev, poemSlug];
      const progress = getProgress();
      progress[slug] = next;
      saveProgress(progress);
      return next;
    });
  }, [slug]);

  if (!path) {
    return (
      <Layout>
        <div className="reading-path-page">Loading...</div>
      </Layout>
    );
  }

  const completedCount = completedSlugs.length;
  const totalSteps = path.steps.length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  return (
    <Layout>
      <SEOHead
        title={`${path.title} — Reading Path | Poetry Editor`}
        description={path.seoDescription}
        canonicalPath={`/reading-paths/${path.slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Course",
          "name": path.title,
          "description": path.seoDescription,
          "provider": {
            "@type": "Organization",
            "name": "Poetry Editor",
            "url": "https://poetryeditor.com"
          },
          "numberOfCredits": totalSteps,
          "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "self-paced"
          }
        }}
      />

      <div className="reading-path-page">
        <header className="reading-path-header">
          <div className="reading-path-breadcrumb">
            <Link to="/reading-paths">Reading Paths</Link>
            <span className="breadcrumb-sep">/</span>
            <span>{path.title}</span>
          </div>
          <h1>{path.title}</h1>
          <p className="reading-path-subtitle">{path.subtitle}</p>
          <p className="reading-path-description">{path.description}</p>

          <div className="reading-path-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="progress-label">
              {completedCount} of {totalSteps} poems read
            </span>
          </div>
        </header>

        <div className="reading-path-steps">
          {path.steps.map((step, i) => (
            <StepCard
              key={step.poemSlug}
              step={step}
              index={i}
              pathSlug={path.slug}
              isComplete={completedSlugs.includes(step.poemSlug)}
              onToggle={() => toggleStep(step.poemSlug)}
            />
          ))}
        </div>

        {completedCount === totalSteps && (
          <div className="reading-path-complete">
            <h3>Path complete</h3>
            <p>
              You've read all {totalSteps} poems in this path. The exercises above are worth
              returning to — writing is rewriting, and each revisit teaches something new.
            </p>
            <Link to="/reading-paths" className="back-to-paths">
              Explore more paths →
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
