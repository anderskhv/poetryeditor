import { ReactNode, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthButton } from './AuthButton';
import { useAuth } from '../hooks/useAuth';
import { trackPageview } from '../utils/analytics';
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
              <span className="app-subtitle">a toolbox for poets</span>
            </Link>
          </div>
          <div className="header-actions">
            <AuthButton />
          </div>
        </div>
      </header>
      <main className="editor-layout-main">
        {children}
      </main>
    </div>
  );
}
