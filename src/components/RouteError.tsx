import { Link } from 'react-router-dom';
import { Layout } from './Layout';
import './RouteError.css';

export function RouteError({ title = 'Something went wrong', message, showHomeLink }: { title?: string; message?: string; showHomeLink?: boolean }) {
  return (
    <Layout>
      <div className="route-error">
        <h1>{title}</h1>
        <p>{message || 'Please refresh the page or try again later.'}</p>
        {showHomeLink && (
          <p style={{ marginTop: '1.5rem' }}>
            <Link to="/" className="route-error-link">Back to editor</Link>
          </p>
        )}
      </div>
    </Layout>
  );
}
