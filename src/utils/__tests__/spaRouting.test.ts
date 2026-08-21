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

  it('writes collection SPA shells as directory indexes and never emits 200.html', () => {
    expect(prerender).toMatch(/spaAppRoutes = \['\/my-collections'/);
    expect(prerender).toMatch(/writeFileSync\(path\.join\(dir, 'index\.html'\)/);
    expect(prerender).toMatch(/unlinkSync\(flatHtml\)/);
    expect(prerender).not.toMatch(/writeFileSync\([^)]*200\.html/);
  });

  it('uses Functions middleware to serve index.html on 404, not 200.html', () => {
    const middleware = readFileSync(resolve('functions/_middleware.ts'), 'utf8');
    expect(existsSync(resolve('functions/api/anthropic.ts'))).toBe(true);
    expect(middleware).toMatch(/ASSETS\.fetch\(new URL\('\/index\.html'/);
    expect(middleware).toMatch(/pathname\.startsWith\('\/assets\/'\)/);
    expect(middleware).not.toMatch(/ASSETS\.fetch\([^)]*200\.html/);
    expect(routes.version).toBe(1);
    expect(routes.include).toEqual(['/*']);
    expect(routes.exclude).toEqual(['/assets/*']);
  });
});
