import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

describe('SPA routing for authenticated app pages', () => {
  const redirects = readFileSync(resolve('public/_redirects'), 'utf8');
  const routerSource = readFileSync(resolve('src/router.tsx'), 'utf8');
  const prerender = readFileSync(resolve('scripts/prerender.mjs'), 'utf8');
  const routes = JSON.parse(readFileSync(resolve('public/_routes.json'), 'utf8')) as {
    version: number;
    include: string[];
    exclude: string[];
  };

  it('uses the known-good index.html SPA fallback, not 200.html', () => {
    expect(redirects).toMatch(/^\s*\/\*\s+\/index\.html\s+200\s*$/m);
    expect(redirects).not.toMatch(/200\.html/);
  });

  it('redirects /collections to /my-collections', () => {
    expect(redirects).toMatch(/\/collections\s+\/my-collections\s+302/);
  });

  it('keeps the collection id when redirecting /collections/:id', () => {
    expect(redirects).toMatch(/\/collections\/\*\s+\/my-collections\/:splat\s+302/);
    expect(redirects).not.toMatch(/\/collections\/\*\s+\/my-collections\s+302/);
    expect(routerSource).toMatch(/legacyCollectionPath/);
    expect(routerSource).not.toMatch(/path:\s*'\/collections\/:id'[\s\S]*Navigate to="\/my-collections"/);
  });

  it('keeps asset misses on 404.html only', () => {
    expect(redirects).toMatch(/\/assets\/\*\s+\/404\.html\s+404/);
  });

  it('rewrites /my-collections and /my-collections/:id to the SPA shell without 200.html', () => {
    expect(redirects).toMatch(/^\s*\/my-collections\s+\/index\.html\s+200\s*$/m);
    expect(redirects).toMatch(/^\s*\/my-collections\/\*\s+\/index\.html\s+200\s*$/m);
    expect(redirects).not.toMatch(/200\.html/);
  });

  it('does not emit a my-collections pretty-URL parent that 404s :id children', () => {
    expect(prerender).toMatch(/spaAppRoutes = \['\/my-account'/);
    expect(prerender).not.toMatch(/spaAppRoutes = \[[^\]]*['"]\/my-collections['"]/);
    expect(prerender).toMatch(/unlinkSync\(collectionsFlat\)/);
    expect(prerender).toMatch(/rmSync\(collectionsDir/);
    expect(prerender).not.toMatch(/writeFileSync\([^)]*200\.html/);
  });

  it('invokes Pages Functions only on /api/* so _redirects still run', () => {
    expect(routes.version).toBe(1);
    expect(routes.include).toEqual(['/api/*']);
    expect(routes.include).not.toContain('/*');
    expect(existsSync(resolve('functions/api/anthropic.ts'))).toBe(true);
  });
});
