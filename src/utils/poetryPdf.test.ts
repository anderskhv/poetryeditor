import { describe, expect, it } from 'vitest';
import { buildPoetryPrintDocument, poemPrintHtml } from './poetryPdf';

describe('poetry PDF print document', () => {
  it('preserves whitespace, Unicode and combined formatting without markers', () => {
    const html = poemPrintHtml('  café\n\n***Moon*** and __sea__');
    expect(html).toContain('  café\n\n');
    expect(html).toContain('<em><strong>M</strong></em>');
    expect(html).toContain('<u>s</u>');
    expect(html).not.toContain('*');
    expect(html).not.toContain('__');
  });
  it('escapes poem content, titles and section names', () => {
    const html = buildPoetryPrintDocument('<script>alert(1)</script>', [
      { title: '<img src=x>', content: '<script>evil</script>', section: '<iframe>' },
    ]);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;iframe&gt;');
  });
  it('includes every poem with its alignment and page breaks', () => {
    const html = buildPoetryPrintDocument('Book', [
      { title: 'First', content: 'one', align: 'center' },
      { title: 'Second', content: 'two', align: 'right' },
    ]);
    expect(html.match(/<article /g)).toHaveLength(2);
    expect(html).toContain('break-before: page');
    expect(html).toContain('text-align:center');
    expect(html).toContain('text-align:right');
  });
});
