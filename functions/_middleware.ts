/**
 * SPA fallback. Pages Functions skip `_redirects`, so a 404 from the
 * asset handler would otherwise serve public/404.html and never reach
 * `/* /index.html 200`. Serve the Vite index shell instead.
 * Never rewrite to /200.html — pretty-URLs 308-loop that to /200.
 */
interface Env {
  ASSETS: {
    fetch: (input: Request | URL) => Promise<Response>;
  };
}

export async function onRequest(context: {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
}): Promise<Response> {
  const url = new URL(context.request.url);
  const response = await context.next();
  if (response.status !== 404) return response;
  if (url.pathname.startsWith('/assets/')) return response;
  return context.env.ASSETS.fetch(new URL('/index.html', url.origin));
}
