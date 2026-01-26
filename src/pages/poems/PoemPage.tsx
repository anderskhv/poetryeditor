import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPoemBySlug, getAllPoemSlugs, PoemAnalysis } from '../../data/poems';
import { Layout } from '../../components/Layout';
import { SEOHead } from '../../components/SEOHead';
import { ShareModal } from '../../components/ShareModal';
import './PoemPage.css';

export function PoemPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [poem, setPoem] = useState<PoemAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'line-by-line' | 'devices'>('overview');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (slug) {
      const foundPoem = getPoemBySlug(slug);
      if (foundPoem) {
        setPoem(foundPoem);
      } else {
        navigate('/poems');
      }
    }
  }, [slug, navigate]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const handleShareTwitter = useCallback(() => {
    const text = `"${poem?.title}" by ${poem?.poet} — Read the full analysis`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  }, [poem]);

  const handleShareFacebook = useCallback(() => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  }, []);

  if (!poem) {
    return (
      <Layout>
        <div className="poem-page-loading">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={`${poem.title} by ${poem.poet} - Analysis & Commentary`}
        description={poem.seoDescription}
      />

      <div className="poem-page">
        <div className="poem-page-header">
          <div className="poem-meta">
            <h1 className="poem-title">{poem.title}</h1>
            <p className="poem-poet">
              {poem.poet} ({poem.poetBirth}–{poem.poetDeath})
            </p>
            {poem.collection && (
              <p className="poem-collection">From <em>{poem.collection}</em> ({poem.year})</p>
            )}
          </div>

          <div className="poem-share-buttons">
            <button
              className="share-btn share-btn-copy"
              onClick={handleCopyLink}
              title="Copy link"
            >
              {copySuccess ? '✓ Copied' : 'Copy Link'}
            </button>
            <button
              className="share-btn share-btn-twitter"
              onClick={handleShareTwitter}
              title="Share on X"
            >
              Share on X
            </button>
            <button
              className="share-btn share-btn-facebook"
              onClick={handleShareFacebook}
              title="Share on Facebook"
            >
              Facebook
            </button>
            <button
              className="share-btn share-btn-image"
              onClick={() => setShowShareModal(true)}
              title="Create shareable image"
            >
              Create Image
            </button>
          </div>
        </div>

        <div className="poem-content-grid">
          {/* Poem Text */}
          <div className="poem-text-section">
            <div className="poem-text-container">
              {poem.text.split('\n').map((line, index) => (
                <div key={index} className="poem-line">
                  <span className="line-number">{index + 1}</span>
                  <span className="line-text">{line || '\u00A0'}</span>
                </div>
              ))}
            </div>

            <div className="poem-form-badge">
              Form: {poem.form}
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="poem-analysis-section">
            <div className="analysis-tabs">
              <button
                className={`analysis-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`analysis-tab ${activeTab === 'line-by-line' ? 'active' : ''}`}
                onClick={() => setActiveTab('line-by-line')}
              >
                Line-by-Line
              </button>
              <button
                className={`analysis-tab ${activeTab === 'devices' ? 'active' : ''}`}
                onClick={() => setActiveTab('devices')}
              >
                Literary Devices
              </button>
            </div>

            <div className="analysis-content">
              {activeTab === 'overview' && (
                <div className="analysis-overview">
                  <p className="overview-text">{poem.analysis.overview}</p>

                  <div className="themes-section">
                    <h3>Themes</h3>
                    <ul className="themes-list">
                      {poem.analysis.themes.map((theme, index) => (
                        <li key={index}>{theme}</li>
                      ))}
                    </ul>
                  </div>

                  {poem.analysis.historicalContext && (
                    <div className="context-section">
                      <h3>Historical Context</h3>
                      <p>{poem.analysis.historicalContext}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'line-by-line' && (
                <div className="analysis-line-by-line">
                  {poem.analysis.lineByLine.map((item, index) => (
                    <div key={index} className="line-analysis-item">
                      <div className="line-reference">Lines {item.lines}</div>
                      <p className="line-commentary">{item.commentary}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'devices' && (
                <div className="analysis-devices">
                  {poem.analysis.literaryDevices.map((device, index) => (
                    <div key={index} className="device-item">
                      <h4 className="device-name">{device.device}</h4>
                      <blockquote className="device-example">"{device.example}"</blockquote>
                      <p className="device-explanation">{device.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="poem-page-footer">
          <div className="footer-cta">
            <h3>Write Your Own Poetry</h3>
            <p>Use our free poetry editor with syllable counter, rhyme finder, and meter analysis.</p>
            <Link to="/" className="cta-button">
              Try Poetry Editor
            </Link>
          </div>

          <div className="more-poems">
            <h3>More Poem Analyses</h3>
            <div className="poem-links">
              {getAllPoemSlugs()
                .filter(s => s !== slug)
                .slice(0, 4)
                .map(poemSlug => {
                  const p = getPoemBySlug(poemSlug);
                  return p ? (
                    <Link key={poemSlug} to={`/poems/${poemSlug}`} className="poem-link">
                      "{p.title}" — {p.poet}
                    </Link>
                  ) : null;
                })}
            </div>
          </div>
        </div>

        <div className="feedback-box">
          <p className="feedback-text">
            Do you have ideas, feedback, or have you found a bug? Let us know and we'll get back to you within 48 hours.
          </p>
          <a href="mailto:contact@poetryeditor.com" className="feedback-email">
            contact@poetryeditor.com
          </a>
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        poemTitle={poem.title}
        poemText={poem.text}
      />
    </Layout>
  );
}
