import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

describe('SPA routing for authenticated app pages', () => {
  const redirects = readFileSync(resolve('public/_redirects'), 'utf8');

  it('uses the known-good index.html SPA fallback, not 200.html', () => {
    expect(redirects).toMatch(/^\s*\/\*\s+\/index\.html\s+200\s*$/m);
    expect(redirects).not.toMatch(/200\.html/);
  });

  it('redirects /collections to /my-collections', () => {
    expect(redirects).toMatch(/\/collections\s+\/my-collections\s+302/);
  });

  it('keeps asset misses on 404.html only', () => {
    expect(redirects).toMatch(/\/assets\/\*\s+\/404\.html\s+404/);
  });
});
