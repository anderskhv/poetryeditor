import { ReactNode, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthButton } from './AuthButton';
import { useAuth } from '../hooks/useAuth';
import { trackPageview } from '../utils/analytics';
import '../App.css';
import './EditorLayout.css';

interface EditorLayoutProps {
  children: ReactNode;
}

export function EditorLayout({ children }: EditorLayoutProps) {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    trackPageview(`${location.pathname}${location.search || ''}`, user?.id);
  }, [location.pathname, location.search, user?.id]);

  return (
    <div className="editor-layout">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/" className="app-title-group" style={{ textDecoration: 'none' }}>
              <h1 className="app-title">Poetry Editor</h1>
              <span className="app-subtitle">A writing tool for poets</span>
            </Link>
          </div>
          <nav className="header-actions header-menubar" aria-label="Account">
            <AuthButton />
          </nav>
        </div>
      </header>
      <main className="editor-layout-main">
        {children}
      </main>
      <footer className="app-footer">
        <p className="footer-line">Ideas, feedback, or bugs? Write <a href="mailto:contact@poetryeditor.com">contact@poetryeditor.com</a>. We will get back in &lt;48 hours.</p>
      </footer>
    </div>
  );
}
