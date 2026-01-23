import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const TOOLS = [
  { path: '/rhymes', label: 'Rhyme Dictionary' },
  { path: '/thesaurus', label: 'Thesaurus' },
  { path: '/syllables', label: 'Syllable Counter' },
  { path: '/meter-analyzer', label: 'Meter Analyzer' },
  { path: '/rhyme-scheme-analyzer', label: 'Rhyme Scheme Analyzer' },
  { path: '/haiku-checker', label: 'Haiku Checker', isFormTool: true },
  { path: '/sonnet-checker', label: 'Sonnet Checker', isFormTool: true },
];

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showOtherTools, setShowOtherTools] = useState(false);
  const location = useLocation();

  // Get current tool name to exclude from "Other Tools"
  const currentPath = location.pathname;
  const otherTools = TOOLS.filter(tool => tool.path !== currentPath);

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-content">
          <Link to="/" className="layout-logo-group">
            <span className="layout-logo">Poetry Editor</span>
            <span className="layout-subtitle">Toolbox for Poets</span>
          </Link>
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`} />
          </button>
          <nav className={`layout-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="other-tools-dropdown">
              <button
                className="other-tools-btn"
                onClick={() => setShowOtherTools(!showOtherTools)}
                onBlur={() => setTimeout(() => setShowOtherTools(false), 150)}
                aria-expanded={showOtherTools}
              >
                Other Tools
              </button>
              {showOtherTools && (
                <div className="other-tools-menu">
                  {otherTools.map(tool => (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      className={`other-tools-item ${tool.isFormTool ? 'form-tool' : ''}`}
                      onClick={() => {
                        setShowOtherTools(false);
                        setMobileMenuOpen(false);
                      }}
                    >
                      {tool.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              to="/"
              className="layout-nav-cta"
              onClick={() => setMobileMenuOpen(false)}
            >
              Open Full Editor
            </Link>
          </nav>
        </div>
      </header>
      {mobileMenuOpen && <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />}
      <main className="layout-main">
        {children}
      </main>
      <footer className="layout-footer">
        <div className="layout-footer-content">
          <div className="layout-footer-links">
            <Link to="/">Poetry Editor</Link>
            <Link to="/rhymes">Rhyme Dictionary</Link>
            <Link to="/thesaurus">Thesaurus</Link>
            <Link to="/syllables">Syllable Counter</Link>
            <Link to="/haiku-checker">Haiku Checker</Link>
            <Link to="/meter-analyzer">Meter Analyzer</Link>
            <Link to="/sonnet-checker">Sonnet Checker</Link>
          </div>
          <p className="layout-footer-copy">Free poetry analysis tools for poets and students</p>
        </div>
      </footer>
    </div>
  );
}
