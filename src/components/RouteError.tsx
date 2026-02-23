import { Layout } from './Layout';
import './RouteError.css';

export function RouteError({ title = 'Something went wrong', message }: { title?: string; message?: string }) {
  return (
    <Layout>
      <div className="route-error">
        <h1>{title}</h1>
        <p>{message || 'Please refresh the page or try again later.'}</p>
      </div>
    </Layout>
  );
}
