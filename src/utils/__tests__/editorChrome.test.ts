import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

describe('editor chrome after the beauty pass', () => {
  const appSource = readFileSync(resolve('src/App.tsx'), 'utf8');
  const appCss = readFileSync(resolve('src/App.css'), 'utf8');
  const sidebar = readFileSync(resolve('src/components/PoemNavSidebar.tsx'), 'utf8');
  const chatCss = readFileSync(resolve('src/components/editor/EditorChat.css'), 'utf8');
  const layout = readFileSync(resolve('src/components/EditorLayout.tsx'), 'utf8');
  const account = readFileSync(resolve('src/pages/MyAccount.tsx'), 'utf8');
  const redirects = readFileSync(resolve('public/_redirects'), 'utf8');

  it('keeps one collection crumb in the header and none in the status strip', () => {
    expect(appSource.match(/header-collection-crumb/g)?.length).toBeGreaterThan(0);
    expect(appSource).not.toMatch(/editor-collection-crumb/);
    const titleGroup = appSource.match(/<div className="app-title-group">[\s\S]*?<\/div>/)?.[0] ?? '';
    expect(titleGroup).toContain('app-subtitle');
    expect(titleGroup).not.toContain('header-collection-crumb');
  });

  it('does not show a Private by default chip in the editor strip', () => {
    expect(appSource).not.toMatch(/Private by default/);
    expect(appSource).not.toMatch(/privacy-pill/);
    expect(appCss).not.toMatch(/privacy-pill/);
  });

  it('keeps privacy as a quiet My Account note and the contact line in the footer', () => {
    expect(account).toMatch(/<h2>Privacy<\/h2>/);
    expect(account).toMatch(/stay private unless you share/);
    expect(appSource).toMatch(/contact@poetryeditor\.com/);
    expect(layout).toMatch(/contact@poetryeditor\.com/);
    expect(appSource).not.toMatch(/should not be logged or casually accessed/);
  });

  it('exposes labeled New Poem and New Section controls in the poems sidebar', () => {
    expect(sidebar).toMatch(/>\s*New Poem\s*</);
    expect(sidebar).toMatch(/>\s*New Section\s*</);
    expect(sidebar).toMatch(/poem-nav-create-btn/);
  });

  it('centers the coach send button on the same row as the input', () => {
    expect(chatCss).toMatch(/\.editor-input-form\s*\{[^}]*align-items:\s*center/s);
    expect(chatCss).toMatch(/\.editor-send-btn\s*\{[^}]*align-self:\s*center/s);
    expect(chatCss).not.toMatch(/\.editor-input-form\s*\{[^}]*align-items:\s*flex-end/s);
  });

  it('styles File, Formatting, Inspiration, and Tools as the same menubar', () => {
    expect(appSource).toMatch(/className="header-actions header-menubar"/);
    expect(appSource.match(/className="btn btn-menu"/g)?.length).toBeGreaterThanOrEqual(5);
    expect(appSource).not.toMatch(/header-pill btn-tools/);
    expect(appCss).toMatch(/\.header-menubar \.btn-menu/);
    expect(appCss).not.toMatch(/app-header:has\(\.header-collection-crumb\)/);
  });

  it('keeps collections pages on the same header language without 200.html', () => {
    expect(layout).toMatch(/A writing tool for poets/);
    expect(layout).toMatch(/import '\.\.\/App\.css'/);
    expect(redirects).toMatch(/^\s*\/\*\s+\/index\.html\s+200\s*$/m);
    expect(redirects).not.toMatch(/200\.html/);
  });
});
