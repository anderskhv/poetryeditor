import JSZip from 'jszip';
import type { Collection, Poem, Section } from '../types/database';

const WORD_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

function escapeXml(value: string): string {
  // XML 1.0 forbids these control characters in document text.
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function paragraph(text: string, properties = '', size = 24): string {
  const runs = text.split('\t').map(part => `<w:t xml:space="preserve">${escapeXml(part)}</w:t>`).join('<w:tab/>');
  return `<w:p><w:pPr>${properties}</w:pPr><w:r><w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:sz w:val="${size}"/></w:rPr>${runs}</w:r></w:p>`;
}

/** Create a native Word document, keeping collection order and poem whitespace. */
export async function exportCollectionAsWord(
  collection: Pick<Collection, 'name'>,
  poems: Poem[],
  sections: Section[],
): Promise<Blob> {
  const zip = new JSZip();
  const body = [paragraph(collection.name, '<w:spacing w:after="480"/>', 40)];
  const knownSections = new Set(sections.map(section => section.id));
  const groups = [
    { name: null, poems: poems.filter(poem => !poem.section_id || !knownSections.has(poem.section_id)) },
    ...[...sections].sort((a, b) => a.sort_order - b.sort_order).map(section => ({
      name: section.name,
      poems: poems.filter(poem => poem.section_id === section.id),
    })),
  ];
  let hasPoem = false;
  for (const group of groups) {
    if (group.poems.length === 0) continue;
    if (group.name !== null) {
      body.push(paragraph(group.name, `${hasPoem ? '<w:pageBreakBefore/>' : ''}<w:keepNext/><w:spacing w:after="240"/>`, 32));
    }
    for (const [index, poem] of [...group.poems].sort((a, b) => a.sort_order - b.sort_order).entries()) {
      const align = poem.formatting?.align || 'left';
      const spacing = { normal: 240, relaxed: 360, spacious: 480 }[poem.formatting?.lineSpacing || 'normal'];
      body.push(paragraph(poem.title, `${hasPoem && (group.name === null || index > 0) ? '<w:pageBreakBefore/>' : ''}<w:keepNext/><w:jc w:val="${align}"/><w:spacing w:after="240"/>`, 28));
      poem.content.replace(/\r\n?/g, '\n').split('\n').forEach((line, lineIndex) => {
        body.push(paragraph(line, `<w:jc w:val="${align}"/><w:spacing w:before="0" w:after="0" w:line="${spacing}" w:lineRule="auto"/>${lineIndex === 0 && poem.formatting?.firstLineIndent ? '<w:ind w:firstLine="720"/>' : ''}`));
      });
      hasPoem = true;
    }
  }
  zip.file('[Content_Types].xml', `${XML_HEADER}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`);
  zip.file('_rels/.rels', `${XML_HEADER}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  zip.file('word/document.xml', `${XML_HEADER}<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body.join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`);
  return zip.generateAsync({ type: 'blob', mimeType: WORD_MIME });
}

export async function downloadCollectionAsWord(collection: Collection, poems: Poem[], sections: Section[]): Promise<void> {
  const blob = await exportCollectionAsWord(collection, poems, sections);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  // Strip filesystem-reserved characters, including control characters.
  // eslint-disable-next-line no-control-regex
  link.download = `${collection.name.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '').trim().slice(0, 100) || 'Collection'}.docx`;
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
