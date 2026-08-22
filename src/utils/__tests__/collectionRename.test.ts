import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

describe('collection rename is labeled and persists', () => {
  const collectionView = readFileSync(resolve('src/pages/CollectionView.tsx'), 'utf8');
  const collectionViewCss = readFileSync(resolve('src/pages/CollectionView.css'), 'utf8');
  const myCollections = readFileSync(resolve('src/pages/MyCollections.tsx'), 'utf8');
  const myCollectionsCss = readFileSync(resolve('src/pages/MyCollections.css'), 'utf8');
  const renameField = readFileSync(resolve('src/components/collection/CollectionRenameField.tsx'), 'utf8');
  const redirects = readFileSync(resolve('public/_redirects'), 'utf8');

  it('keeps a real H1 on the collection page next to a labeled Rename control', () => {
    expect(collectionView).toMatch(/<h1[\s\S]*className="collection-title-editable"/);
    expect(collectionView).toMatch(/className="rename-collection-btn"/);
    expect(collectionView).toMatch(/>\s*Rename\s*</);
    expect(collectionView).toMatch(/onDoubleClick=\{beginRenameCollection\}/);
    expect(collectionView).toMatch(/handleRenameCollection/);
    expect(collectionView).toMatch(/from\('collections'\)[\s\S]*update\(\{ name: newName/);
    const collectionTitle = collectionView.match(/<h1[\s\S]*?className="collection-title-editable"[\s\S]*?<\/h1>/)?.[0] ?? '';
    expect(collectionTitle).toContain('collection-title-editable');
    expect(collectionTitle).not.toContain('Double-click to rename');
    expect(collectionTitle).not.toContain('edit-hint');
  });

  it('does not make the breadcrumb or header crumb the only collection name', () => {
    expect(collectionView).toMatch(/className="collection-breadcrumb"/);
    expect(collectionView).toMatch(/className="collection-title-row"/);
    expect(collectionView).toMatch(/<h1/);
    expect(collectionView).not.toMatch(/header-collection-crumb/);
  });

  it('exposes labeled Rename on each shelf card and saves through updateCollection', () => {
    expect(myCollections).toMatch(/updateCollection/);
    expect(myCollections).toMatch(/className="rename-collection-btn"/);
    expect(myCollections).toMatch(/>\s*Rename\s*</);
    expect(myCollections).toMatch(/beginRenameCollection/);
    expect(myCollections).toMatch(/commitRenameCollection/);
    expect(myCollections).toMatch(/CollectionRenameField/);
  });

  it('saves on Enter or blur and cancels on Escape', () => {
    expect(renameField).toMatch(/event\.key === 'Enter'/);
    expect(renameField).toMatch(/event\.currentTarget\.blur\(\)/);
    expect(renameField).toMatch(/event\.key === 'Escape'/);
    expect(renameField).toMatch(/onCancel/);
    expect(renameField).toMatch(/aria-label="Collection name"/);
  });

  it('keeps Rename visible without hover on the book and the shelf', () => {
    expect(collectionViewCss).toMatch(/\.rename-collection-btn\s*\{[^}]*min-height:\s*40px/s);
    expect(collectionViewCss).not.toMatch(/\.rename-collection-btn[^}]*opacity:\s*0/);
    expect(myCollectionsCss).toMatch(/\.rename-collection-btn,\s*\n\s*\.delete-collection-btn\s*\{[^}]*opacity:\s*1/s);
    expect(myCollectionsCss).toMatch(/pointer:\s*coarse[\s\S]*\.rename-collection-btn[\s\S]*min-height:\s*44px/);
    expect(collectionViewCss).toMatch(/max-width:\s*600px[\s\S]*\.rename-collection-btn[\s\S]*min-height:\s*44px/);
  });

  it('leaves the SPA fallback on index.html', () => {
    expect(redirects).toMatch(/^\s*\/\*\s+\/index\.html\s+200\s*$/m);
    expect(redirects).not.toMatch(/200\.html/);
  });
});
