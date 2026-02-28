/**
 * PDF Export for Poetry Submissions
 *
 * Generates a clean, submission-ready PDF using raw PDF construction.
 * No external dependencies — builds the PDF byte-by-byte.
 *
 * Standard poetry submission format:
 * - Title centered at top
 * - Author name (if provided) below title
 * - Poem text respecting alignment
 * - Page numbers at bottom
 * - Clean serif font (Times-Roman, built into every PDF reader)
 */

import { stripMarkdownFormatting } from './markdownFormatter';

interface PdfExportOptions {
  title: string;
  text: string;
  authorName?: string;
  align?: 'left' | 'center' | 'right';
  lineSpacing?: 'normal' | 'relaxed' | 'spacious';
}

// PDF uses 72 points per inch. US Letter = 612 x 792 pt
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN_TOP = 72;
const MARGIN_BOTTOM = 72;
const MARGIN_LEFT = 72;
const MARGIN_RIGHT = 72;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

const TITLE_FONT_SIZE = 16;
const AUTHOR_FONT_SIZE = 12;
const POEM_FONT_SIZE = 12;
const PAGE_NUM_FONT_SIZE = 10;

const LINE_SPACING_MAP = {
  normal: 1.6,
  relaxed: 2.0,
  spacious: 2.4,
};

/** Escape special PDF string characters */
const pdfEscapeStr = (s: string): string =>
  s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

/** Approximate text width using average character widths */
const measureText = (text: string, fontSize: number): number => {
  // Rough proportional width estimate for Times-Roman
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    if (ch >= 65 && ch <= 90) {
      // Uppercase: wider
      width += fontSize * 0.6;
    } else if (ch === 32) {
      // Space
      width += fontSize * 0.25;
    } else if (ch === 105 || ch === 108 || ch === 116) {
      // i, l, t: narrow
      width += fontSize * 0.28;
    } else if (ch === 109 || ch === 119) {
      // m, w: wide
      width += fontSize * 0.7;
    } else {
      width += fontSize * 0.44;
    }
  }
  return width;
};

/** Word-wrap a line to fit within maxWidth */
const wrapLine = (line: string, fontSize: number, maxWidth: number): string[] => {
  if (measureText(line, fontSize) <= maxWidth) return [line];

  const words = line.split(' ');
  const wrapped: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (measureText(test, fontSize) > maxWidth && current) {
      wrapped.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) wrapped.push(current);
  return wrapped;
};

/** Calculate X position for text alignment */
const getTextX = (text: string, fontSize: number, align: 'left' | 'center' | 'right'): number => {
  if (align === 'left') return MARGIN_LEFT;
  const textWidth = measureText(text, fontSize);
  if (align === 'center') return MARGIN_LEFT + (CONTENT_WIDTH - textWidth) / 2;
  return MARGIN_LEFT + CONTENT_WIDTH - textWidth;
};

/**
 * Build a raw PDF file as a Uint8Array.
 *
 * Uses PDF 1.4 spec with Times-Roman (one of the 14 standard PDF fonts,
 * guaranteed available in every PDF reader).
 */
function buildPdf(options: PdfExportOptions): Uint8Array {
  const { title, text, authorName, align = 'left', lineSpacing = 'normal' } = options;
  const plainText = stripMarkdownFormatting(text);
  const lines = plainText.split('\n');
  const lineHeightMultiplier = LINE_SPACING_MAP[lineSpacing];
  const poemLineHeight = POEM_FONT_SIZE * lineHeightMultiplier;
  const usableHeight = PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;

  // Pre-process: wrap long lines
  const wrappedLines: string[] = [];
  for (const line of lines) {
    if (line.trim() === '') {
      wrappedLines.push('');
    } else {
      wrappedLines.push(...wrapLine(line, POEM_FONT_SIZE, CONTENT_WIDTH));
    }
  }

  // Calculate pages
  interface PageData {
    isFirstPage: boolean;
    lines: string[];
  }

  const pages: PageData[] = [];
  let lineIndex = 0;

  while (lineIndex < wrappedLines.length || pages.length === 0) {
    const isFirstPage = pages.length === 0;
    let headerHeight = 0;
    if (isFirstPage) {
      headerHeight += TITLE_FONT_SIZE + 12; // title + gap
      if (authorName && authorName.trim()) {
        headerHeight += AUTHOR_FONT_SIZE + 20; // author + gap
      } else {
        headerHeight += 20; // gap after title
      }
    }

    const availableHeight = usableHeight - headerHeight - 30; // 30pt for page number
    const linesPerPage = Math.floor(availableHeight / poemLineHeight);
    const pageLines = wrappedLines.slice(lineIndex, lineIndex + linesPerPage);

    pages.push({ isFirstPage, lines: pageLines });
    lineIndex += linesPerPage;

    if (lineIndex >= wrappedLines.length) break;
  }

  const totalPages = pages.length;

  // Build PDF content streams for each page
  const pageStreams: string[] = [];

  for (let p = 0; p < pages.length; p++) {
    const page = pages[p];
    let stream = '';
    let y = PAGE_HEIGHT - MARGIN_TOP;

    // Title on first page (always centered for submission format)
    if (page.isFirstPage) {
      const displayTitle = title && title.trim() !== 'Untitled' ? title : '';
      if (displayTitle) {
        stream += `BT\n`;
        stream += `/F2 ${TITLE_FONT_SIZE} Tf\n`;
        const titleX = MARGIN_LEFT + (CONTENT_WIDTH - measureText(displayTitle, TITLE_FONT_SIZE)) / 2;
        stream += `${titleX.toFixed(2)} ${y.toFixed(2)} Td\n`;
        stream += `(${pdfEscapeStr(displayTitle)}) Tj\n`;
        stream += `ET\n`;
        y -= TITLE_FONT_SIZE + 12;
      }

      if (authorName && authorName.trim()) {
        stream += `BT\n`;
        stream += `/F1 ${AUTHOR_FONT_SIZE} Tf\n`;
        const authorX = MARGIN_LEFT + (CONTENT_WIDTH - measureText(authorName, AUTHOR_FONT_SIZE)) / 2;
        stream += `${authorX.toFixed(2)} ${y.toFixed(2)} Td\n`;
        stream += `(${pdfEscapeStr(authorName)}) Tj\n`;
        stream += `ET\n`;
        y -= AUTHOR_FONT_SIZE + 20;
      } else {
        y -= 20;
      }
    }

    // Poem lines
    stream += `BT\n`;
    stream += `/F1 ${POEM_FONT_SIZE} Tf\n`;
    for (const line of page.lines) {
      const x = getTextX(line, POEM_FONT_SIZE, align);
      stream += `${x.toFixed(2)} ${y.toFixed(2)} Td\n`;
      stream += `(${pdfEscapeStr(line)}) Tj\n`;
      // Reset position for next absolute move
      stream += `${(-x).toFixed(2)} ${(-y).toFixed(2)} Td\n`;
      y -= poemLineHeight;
    }
    stream += `ET\n`;

    // Page number (centered at bottom)
    if (totalPages > 1) {
      const pageNum = `${p + 1}`;
      const pnX = MARGIN_LEFT + (CONTENT_WIDTH - measureText(pageNum, PAGE_NUM_FONT_SIZE)) / 2;
      const pnY = MARGIN_BOTTOM - 20;
      stream += `BT\n`;
      stream += `/F1 ${PAGE_NUM_FONT_SIZE} Tf\n`;
      stream += `${pnX.toFixed(2)} ${pnY.toFixed(2)} Td\n`;
      stream += `(${pdfEscapeStr(pageNum)}) Tj\n`;
      stream += `ET\n`;
    }

    pageStreams.push(stream);
  }

  // Assemble PDF objects
  // Object layout:
  // 1: Catalog
  // 2: Pages
  // 3: Font (Times-Roman)
  // 4: Font (Times-Bold for title)
  // 5..5+N-1: Page objects
  // 5+N..5+2N-1: Stream objects

  const objects: string[] = [];
  const offsets: number[] = [];

  // We'll build the byte array at the end. For now, accumulate strings.
  const pdfLines: string[] = [];
  pdfLines.push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  const addObject = (content: string) => {
    const objNum = objects.length + 1;
    objects.push(content);
    return objNum;
  };

  // 1: Catalog
  addObject(''); // placeholder
  // 2: Pages
  addObject(''); // placeholder
  // 3: Font Times-Roman
  addObject(''); // placeholder
  // 4: Font Times-Bold
  addObject(''); // placeholder

  // Page objects (5 to 5+N-1)
  const pageObjNums: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    pageObjNums.push(addObject('')); // placeholder
  }

  // Stream objects (5+N to 5+2N-1)
  const streamObjNums: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    streamObjNums.push(addObject('')); // placeholder
  }

  // Now fill in objects
  // Catalog (obj 1)
  objects[0] = `<< /Type /Catalog /Pages 2 0 R >>`;

  // Pages (obj 2)
  const pageRefs = pageObjNums.map(n => `${n} 0 R`).join(' ');
  objects[1] = `<< /Type /Pages /Kids [${pageRefs}] /Count ${totalPages} >>`;

  // Font Times-Roman (obj 3)
  objects[2] = `<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>`;

  // Font Times-Bold (obj 4)
  objects[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>`;

  // Page objects
  for (let i = 0; i < totalPages; i++) {
    const streamObj = streamObjNums[i];
    objects[pageObjNums[i] - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      `/Contents ${streamObj} 0 R ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>`;
  }

  // Stream objects
  for (let i = 0; i < totalPages; i++) {
    const streamContent = pageStreams[i];
    objects[streamObjNums[i] - 1] =
      `STREAM:${streamContent}`;
  }

  // Serialize to bytes
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  let byteOffset = 0;

  const write = (s: string) => {
    const bytes = encoder.encode(s);
    parts.push(bytes);
    byteOffset += bytes.length;
  };

  // Header
  write('%PDF-1.4\n');
  write('%\xE2\xE3\xCF\xD3\n');

  // Objects
  const objectOffsets: number[] = [];
  for (let i = 0; i < objects.length; i++) {
    objectOffsets.push(byteOffset);
    const objNum = i + 1;
    const content = objects[i];

    if (content.startsWith('STREAM:')) {
      const streamData = content.slice(7);
      const streamBytes = encoder.encode(streamData);
      write(`${objNum} 0 obj\n`);
      write(`<< /Length ${streamBytes.length} >>\n`);
      write(`stream\n`);
      write(streamData);
      write(`\nendstream\n`);
      write(`endobj\n`);
    } else {
      write(`${objNum} 0 obj\n`);
      write(`${content}\n`);
      write(`endobj\n`);
    }
  }

  // Cross-reference table
  const xrefOffset = byteOffset;
  write(`xref\n`);
  write(`0 ${objects.length + 1}\n`);
  write(`0000000000 65535 f \n`);
  for (const offset of objectOffsets) {
    write(`${String(offset).padStart(10, '0')} 00000 n \n`);
  }

  // Trailer
  write(`trailer\n`);
  write(`<< /Size ${objects.length + 1} /Root 1 0 R >>\n`);
  write(`startxref\n`);
  write(`${xrefOffset}\n`);
  write(`%%EOF\n`);

  // Combine all parts
  const totalLength = parts.reduce((sum, p) => sum + p.length, 0);
  const result = new Uint8Array(totalLength);
  let pos = 0;
  for (const part of parts) {
    result.set(part, pos);
    pos += part.length;
  }

  return result;
}

/**
 * Export the current poem as a submission-ready PDF and trigger download.
 */
export function exportPoemAsPdf(options: PdfExportOptions): void {
  const pdfBytes = buildPdf(options);
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const safeTitle = (options.title || 'poem')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .replace(/\s+/g, '-');

  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeTitle}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
