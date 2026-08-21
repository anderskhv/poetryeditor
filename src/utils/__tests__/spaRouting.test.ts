import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

describe('SPA routing for authenticated app pages', () => {
  const redirects = readFileSync(resolve('public/_redirects'), 'utf8');
  const routerSource = readFileSync(resolve('src/router.tsx'), 'utf8');
  const prerender = readFileSync(resolve('scripts/prerender.mjs'), 'utf8');

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

  it('rewrites /my-collections/:id to the SPA shell without 200.html', () => {
    expect(redirects).toMatch(/\/my-collections\/\*\s+\/index\.html\s+200/);
    expect(redirects).not.toMatch(/200\.html/);
  });

  it('writes collection SPA shells as directory indexes so pretty-URLs do not 404 children', () => {
    expect(prerender).toMatch(/writeFileSync\(path\.join\(dir, 'index\.html'\)/);
    expect(prerender).toMatch(/unlinkSync\(flatHtml\)/);
    expect(prerender).not.toMatch(/writeFileSync\(path\.join\(DIST, `\$\{route\.slice\(1\)\}\.html`\)/);
  });
});
