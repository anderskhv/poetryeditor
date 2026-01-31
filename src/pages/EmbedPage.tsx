import { useState } from 'react';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { getDailyRhyme } from '../data/dailyRhymes';
import './EmbedPage.css';

type ThemeOption = 'light' | 'dark';

export function EmbedPage() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>('light');
  const [copied, setCopied] = useState<'iframe' | 'script' | null>(null);

  const rhyme = getDailyRhyme();

  const iframeCode = `<iframe
  src="https://poetryeditor.com/widget?theme=${selectedTheme}"
  width="320"
  height="140"
  frameborder="0"
  style="border-radius: 12px; border: none;"
  title="Rhyme of the Day"
></iframe>`;

  const scriptCode = `<div id="poetry-editor-widget" data-theme="${selectedTheme}"></div>
<script src="https://poetryeditor.com/widget.js" async></script>`;

  const handleCopy = async (code: string, type: 'iframe' | 'script') => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <Layout>
      <SEOHead
        title="Embed Poetry Widget - Free Rhyme of the Day Widget"
        description="Add a free Rhyme of the Day widget to your website or blog. Beautiful, lightweight poetry widget that displays daily rhyme pairs. Perfect for poetry blogs, creative writing sites, and educational pages."
        canonicalPath="/embed"
        keywords="poetry widget, rhyme widget, embed poetry, rhyme of the day, free poetry widget, website widget, blog widget, creative writing widget, poetry blog widget"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Poetry Editor Rhyme Widget",
          "description": "A free embeddable widget that displays a daily rhyme pair for poetry enthusiasts",
          "applicationCategory": "UtilityApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        }}
      />

      <div className="embed-page">
        <div className="embed-hero">
          <h1>Rhyme of the Day Widget</h1>
          <p className="embed-subtitle">
            Add a beautiful poetry widget to your website. Free, lightweight, and updates daily.
          </p>
        </div>

        <section className="embed-preview-section">
          <h2>Preview</h2>
          <div className="embed-preview-container">
            <div className={`widget-preview widget-preview-${selectedTheme}`}>
              <div className="widget-preview-header">
                <span className="widget-preview-label">Rhyme of the Day</span>
              </div>
              <div className="widget-preview-content">
                <div className="widget-preview-rhyme">
                  <span className="widget-preview-word">{rhyme.word1}</span>
                  <span className="widget-preview-amp">&amp;</span>
                  <span className="widget-preview-word">{rhyme.word2}</span>
                </div>
                {rhyme.category && (
                  <span className="widget-preview-category">{rhyme.category}</span>
                )}
              </div>
              <div className="widget-preview-footer">
                <span className="widget-preview-link">Powered by Poetry Editor</span>
              </div>
            </div>
          </div>

          <div className="theme-selector">
            <span className="theme-label">Theme:</span>
            <button
              className={`theme-btn ${selectedTheme === 'light' ? 'active' : ''}`}
              onClick={() => setSelectedTheme('light')}
            >
              Light
            </button>
            <button
              className={`theme-btn ${selectedTheme === 'dark' ? 'active' : ''}`}
              onClick={() => setSelectedTheme('dark')}
            >
              Dark
            </button>
          </div>
        </section>

        <section className="embed-code-section">
          <h2>Embed Code</h2>

          <div className="embed-method">
            <h3>Option 1: iframe (Recommended)</h3>
            <p className="embed-method-desc">
              Simple and reliable. Works on any website without conflicts.
            </p>
            <div className="code-block">
              <pre><code>{iframeCode}</code></pre>
              <button
                className="copy-btn"
                onClick={() => handleCopy(iframeCode, 'iframe')}
              >
                {copied === 'iframe' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="embed-method">
            <h3>Option 2: JavaScript</h3>
            <p className="embed-method-desc">
              Lightweight script that injects the widget directly into your page.
            </p>
            <div className="code-block">
              <pre><code>{scriptCode}</code></pre>
              <button
                className="copy-btn"
                onClick={() => handleCopy(scriptCode, 'script')}
              >
                {copied === 'script' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </section>

        <section className="embed-features-section">
          <h2>Widget Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Daily Updates</h3>
              <p>
                A new rhyme pair every day from our curated collection of 365 poetic rhymes.
              </p>
            </div>
            <div className="feature-card">
              <h3>Lightweight</h3>
              <p>
                Under 5KB. Fast loading with no impact on your site&apos;s performance.
              </p>
            </div>
            <div className="feature-card">
              <h3>Responsive</h3>
              <p>
                Looks great on desktop, tablet, and mobile devices.
              </p>
            </div>
            <div className="feature-card">
              <h3>Customizable</h3>
              <p>
                Choose between light and dark themes to match your site&apos;s design.
              </p>
            </div>
          </div>
        </section>

        <section className="embed-faq-section">
          <h2>Frequently Asked Questions</h2>

          <div className="faq-item">
            <h3>Is the widget free to use?</h3>
            <p>
              Yes, completely free. We only ask that you keep the &quot;Powered by Poetry Editor&quot;
              link visible, which helps us grow and continue providing free poetry tools.
            </p>
          </div>

          <div className="faq-item">
            <h3>When does the rhyme change?</h3>
            <p>
              The rhyme updates at midnight based on the visitor&apos;s local time.
              Each day of the year has a unique rhyme pair.
            </p>
          </div>

          <div className="faq-item">
            <h3>Can I customize the widget size?</h3>
            <p>
              The default size is 320x140 pixels. You can adjust the width in the iframe
              code, and the widget will adapt. Minimum recommended width is 280px.
            </p>
          </div>

          <div className="faq-item">
            <h3>Does it work on WordPress, Squarespace, Wix?</h3>
            <p>
              Yes! The iframe method works on virtually any website builder. Look for
              &quot;Custom HTML&quot; or &quot;Embed Code&quot; blocks in your editor.
            </p>
          </div>
        </section>

        <section className="embed-cta-section">
          <h2>Build Your Own Poetry</h2>
          <p>
            Want to write your own poems? Try our full Poetry Editor with rhyme dictionary,
            syllable counter, and style analysis tools.
          </p>
          <a href="/" className="embed-cta-btn">
            Open Poetry Editor
          </a>
        </section>
      </div>
    </Layout>
  );
}
