import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { exportCollectionAsWord } from '../collectionWordExport';
import type { Poem, Section } from '../../types/database';

const poem = (id: string, order: number, section: string | null, content = id): Poem => ({
  id, title: id, sort_order: order, section_id: section, content,
  collection_id: 'collection', filename: null, created_at: '', updated_at: '',
});
const section = (id: string, order: number): Section => ({
  id, name: id, sort_order: order, collection_id: 'collection', parent_id: null, created_at: '',
});

async function readDocument(poems: Poem[], sections: Section[] = []) {
  const blob = await exportCollectionAsWord({ name: 'Collected & selected' }, poems, sections);
  expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  expect(await zip.file('_rels/.rels')!.async('string')).toContain('Target="word/document.xml"');
  expect(await zip.file('[Content_Types].xml')!.async('string')).toContain('wordprocessingml.document.main+xml');
  return zip.file('word/document.xml')!.async('string');
}

describe('Word collection export', () => {
  it('orders sections and poems without losing poems whose section is missing', async () => {
    const poems = [poem('last', 2, 'B'), poem('second', 2, 'A'), poem('first', 1, 'A'), poem('root', 0, null), poem('orphan', 1, 'missing')];
    const xml = await readDocument(poems, [section('B', 2), section('A', 1)]);
    const positions = ['root', 'orphan', 'A', 'first', 'second', 'B', 'last'].map(text => xml.indexOf(`>${text}</w:t>`));
    expect(positions.every(position => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(poems[0].id).toBe('last');
  });

  it('preserves stanza breaks, indentation, tabs, Unicode, and alignment', async () => {
    const item = poem('Title', 0, null, '  Æble & <sky>\r\n\r\n\tmoon\u0001');
    item.formatting = { align: 'center', lineSpacing: 'relaxed', firstLineIndent: true };
    const xml = await readDocument([item]);
    expect(xml).toContain('Collected &amp; selected');
    expect(xml).toContain('<w:t xml:space="preserve">  Æble &amp; &lt;sky&gt;</w:t>');
    expect(xml).toContain('<w:t xml:space="preserve"></w:t></w:r></w:p>');
    expect(xml).toContain('<w:tab/>');
    expect(xml).toContain('<w:jc w:val="center"/>');
    expect(xml).toContain('w:line="360"');
    expect(xml).toContain('<w:ind w:firstLine="720"/>');
    expect(xml).not.toContain('\u0001');
  });
});
