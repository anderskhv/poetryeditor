import { parseMarkdownFormatting } from './markdownFormatter';

interface PdfPoem {
  title: string;
  content: string;
  section?: string;
  align?: 'left' | 'center' | 'right';
}

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));

// Use the editor's ranges so combined styles hide exactly the same markers.
export function poemPrintHtml(text: string): string {
  const ranges = parseMarkdownFormatting(text);
  const tags = { bold: 'strong', italic: 'em', underline: 'u', strikethrough: 's' };
  return Array.from(text).reduce((result, char) => {
    const offset = result.offset;
    const hidden = ranges.some(r =>
      (offset >= r.startOffset && offset < r.contentStartOffset) ||
      (offset >= r.contentEndOffset && offset < r.endOffset));
    let html = escapeHtml(char);
    if (!hidden) {
      for (const range of ranges) {
        if (offset >= range.contentStartOffset && offset < range.contentEndOffset) {
          const tag = tags[range.type];
          html = `<${tag}>${html}</${tag}>`;
        }
      }
    }
    return { html: result.html + (hidden ? '' : html), offset: offset + char.length };
  }, { html: '', offset: 0 }).html;
}

export function buildPoetryPrintDocument(title: string, poems: PdfPoem[]): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title || 'Untitled')}</title>
<style>
@page { size: A4; margin: 22mm; }
body { margin: 0; color: #222; background: white; font: 12pt/1.8 Georgia, serif; }
article + article { break-before: page; }
h1 { font-size: 20pt; line-height: 1.3; margin: 0 0 24pt; break-after: avoid; }
.section { font: 10pt/1.5 sans-serif; margin: 0 0 12pt; color: #555; }
.poem { white-space: pre-wrap; overflow-wrap: anywhere; tab-size: 4; orphans: 3; widows: 3; }
.controls { font: 14px/1.5 sans-serif; padding: 16px; background: #f4f2ef; margin-bottom: 24px; }
button { padding: 8px 16px; cursor: pointer; }
@media print { .controls { display: none; } }
@media screen { body { max-width: 166mm; margin: 24px auto; padding: 0 20px; } article { margin-bottom: 48px; } }
</style></head><body><div class="controls"><button id="print-pdf">Save as PDF / Print</button>
<p>Choose Save as PDF in the print dialog. Turn off headers and footers for a clean copy.</p></div>
${poems.map(poem => `<article style="text-align:${poem.align === 'center' || poem.align === 'right' ? poem.align : 'left'}">${poem.section ? `<p class="section">${escapeHtml(poem.section)}</p>` : ''}<h1>${escapeHtml(poem.title || 'Untitled')}</h1><div class="poem">${poemPrintHtml(poem.content)}</div></article>`).join('')}
</body></html>`;
}

export function sharePoetryPdf(title: string, poems: PdfPoem[]): boolean {
  const preview = window.open('', '_blank');
  if (!preview) return false;
  preview.opener = null;
  preview.document.write(buildPoetryPrintDocument(title, poems));
  preview.document.close();
  preview.document.getElementById('print-pdf')?.addEventListener('click', () => preview.print());
  preview.document.fonts.ready.then(() => {
    if (!preview.closed) { preview.focus(); preview.print(); }
  });
  return true;
}
