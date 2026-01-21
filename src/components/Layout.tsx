import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-content">
          <Link to="/" className="layout-logo">
            Poetry Editor
          </Link>
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`} />
          </button>
          <nav className={`layout-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <Link to="/rhymes" className="layout-nav-link" onClick={() => setMobileMenuOpen(false)}>Rhyme Dictionary</Link>
            <Link to="/syllables" className="layout-nav-link" onClick={() => setMobileMenuOpen(false)}>Syllable Counter</Link>
            <Link to="/haiku-checker" className="layout-nav-link" onClick={() => setMobileMenuOpen(false)}>Haiku Checker</Link>
            <Link to="/" className="layout-nav-link layout-nav-cta" onClick={() => setMobileMenuOpen(false)}>Open Editor</Link>
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
            <Link to="/syllables">Syllable Counter</Link>
            <Link to="/haiku-checker">Haiku Checker</Link>
          </div>
          <p className="layout-footer-copy">Free poetry analysis tools for poets and students</p>
        </div>
      </footer>
    </div>
  );
}
