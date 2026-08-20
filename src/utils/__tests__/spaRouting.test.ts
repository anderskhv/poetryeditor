import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

describe('SPA routing for authenticated app pages', () => {
  const redirects = readFileSync(resolve('public/_redirects'), 'utf8');

  it('serves /my-collections from the SPA shell, not 404.html', () => {
    expect(redirects).toMatch(/\/my-collections\s+\/200\.html\s+200/);
    expect(redirects).toMatch(/\/my-collections\/\*\s+\/200\.html\s+200/);
  });

  it('redirects /collections to /my-collections', () => {
    expect(redirects).toMatch(/\/collections\s+\/my-collections\s+302/);
  });

  it('does not send unknown app routes to 404.html', () => {
    expect(redirects).toMatch(/^\s*\/\*\s+\/200\.html\s+200\s*$/m);
    expect(redirects).not.toMatch(/^\s*\/\*\s+\/404\.html/m);
  });
});
