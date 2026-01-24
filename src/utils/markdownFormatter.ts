/**
 * Markdown formatting utilities for poetry editor
 *
 * Supported formats:
 * - Bold: **text**
 * - Italic: *text* (but not **)
 * - Underline: __text__
 */

export interface MarkdownRange {
  type: 'bold' | 'italic' | 'underline';
  startOffset: number;
  endOffset: number;
  contentStartOffset: number;
  contentEndOffset: number;
}

/**
 * Parse markdown formatting in text and return ranges
 * Returns ranges for bold, italic, and underline formatting
 */
export function parseMarkdownFormatting(text: string): MarkdownRange[] {
  const ranges: MarkdownRange[] = [];

  // Bold: **text**
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let match;
  while ((match = boldRegex.exec(text)) !== null) {
    ranges.push({
      type: 'bold',
      startOffset: match.index,
      endOffset: match.index + match[0].length,
      contentStartOffset: match.index + 2,
      contentEndOffset: match.index + match[0].length - 2,
    });
  }

  // Italic: *text* (but not **)
  // Use negative lookbehind/lookahead to avoid matching ** as italic
  const italicRegex = /(?<!\*)\*([^*]+)\*(?!\*)/g;
  while ((match = italicRegex.exec(text)) !== null) {
    // Make sure this isn't inside a bold section
    const isInsideBold = ranges.some(
      r => r.type === 'bold' && match!.index >= r.startOffset && match!.index < r.endOffset
    );
    if (!isInsideBold) {
      ranges.push({
        type: 'italic',
        startOffset: match.index,
        endOffset: match.index + match[0].length,
        contentStartOffset: match.index + 1,
        contentEndOffset: match.index + match[0].length - 1,
      });
    }
  }

  // Underline: __text__
  const underlineRegex = /__([^_]+)__/g;
  while ((match = underlineRegex.exec(text)) !== null) {
    ranges.push({
      type: 'underline',
      startOffset: match.index,
      endOffset: match.index + match[0].length,
      contentStartOffset: match.index + 2,
      contentEndOffset: match.index + match[0].length - 2,
    });
  }

  // Sort by start offset for consistent processing
  ranges.sort((a, b) => a.startOffset - b.startOffset);

  return ranges;
}

/**
 * Strip markdown formatting for plain text export
 * Removes all formatting markers while preserving the content
 */
export function stripMarkdownFormatting(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // Bold
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1')  // Italic
    .replace(/__([^_]+)__/g, '$1');  // Underline
}
