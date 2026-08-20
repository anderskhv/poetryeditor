/**
 * Markdown formatting utilities for poetry editor
 *
 * Supported formats:
 * - Bold: **text**
 * - Italic: *text* (but not **)
 * - Bold+Italic: ***text*** (emits both a bold and an italic range)
 * - Underline: __text__
 */

export interface MarkdownRange {
  type: 'bold' | 'italic' | 'underline' | 'strikethrough';
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
  // Track offsets claimed by bold+italic to avoid double-matching
  const claimedOffsets = new Set<number>();
  let match;

  // Bold+Italic first: ***text*** — emit BOTH a bold and an italic range.
  // The content may have leading/trailing spaces while the user is editing
  // inside the range; keep the formatting alive as long as there is one
  // non-space character between the markers.
  const boldItalicRegex = /\*\*\*([^*\n]*?\S[^*\n]*?)\*\*\*/g;
  while ((match = boldItalicRegex.exec(text)) !== null) {
    if (match[1].includes('\n')) continue;
    const start = match.index;
    const end = start + match[0].length;
    // Bold range: covers the full ***...*** (content inside the outer ** pair)
    ranges.push({
      type: 'bold',
      startOffset: start,
      endOffset: end,
      contentStartOffset: start + 2,
      contentEndOffset: end - 2,
    });
    // Italic range: covers *content* inside the bold
    ranges.push({
      type: 'italic',
      startOffset: start + 2,
      endOffset: end - 2,
      contentStartOffset: start + 3,
      contentEndOffset: end - 3,
    });
    // Mark these offsets as claimed
    for (let i = start; i < end; i++) claimedOffsets.add(i);
  }

  // Bold: **text** - content may temporarily start/end with whitespace during edits.
  const boldRegex = /\*\*([^*\n]*?\S[^*\n]*?)\*\*/g;
  while ((match = boldRegex.exec(text)) !== null) {
    if (match[1].includes('\n')) continue;
    // Skip if already claimed by bold+italic
    if (claimedOffsets.has(match.index)) continue;
    ranges.push({
      type: 'bold',
      startOffset: match.index,
      endOffset: match.index + match[0].length,
      contentStartOffset: match.index + 2,
      contentEndOffset: match.index + match[0].length - 2,
    });
  }

  // Italic: *text* (but not **)
  // Requires: not preceded by *, not followed by *, content has at least one non-space char.
  const italicRegex = /(?<!\*)\*(?!\*)([^*\n]*?\S[^*\n]*?)(?<!\*)\*(?!\*)/g;
  while ((match = italicRegex.exec(text)) !== null) {
    // Skip if already claimed by bold+italic
    if (claimedOffsets.has(match.index)) continue;
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

  // Underline: __text__ - content may temporarily start/end with whitespace during edits.
  const underlineRegex = /__([^_\n]*?\S[^_\n]*?)__/g;
  while ((match = underlineRegex.exec(text)) !== null) {
    ranges.push({
      type: 'underline',
      startOffset: match.index,
      endOffset: match.index + match[0].length,
      contentStartOffset: match.index + 2,
      contentEndOffset: match.index + match[0].length - 2,
    });
  }

  // Strikethrough: ~~text~~
  const strikethroughRegex = /~~([^~\n]*?\S[^~\n]*?)~~/g;
  while ((match = strikethroughRegex.exec(text)) !== null) {
    ranges.push({
      type: 'strikethrough',
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
    .replace(/\*\*\*([^*\n]*?\S[^*\n]*?)\*\*\*/g, '$1')  // Bold+Italic first
    .replace(/\*\*([^*\n]*?\S[^*\n]*?)\*\*/g, '$1')  // Bold
    .replace(/(?<!\*)\*(?!\*)([^*\n]*?\S[^*\n]*?)(?<!\*)\*(?!\*)/g, '$1')  // Italic
    .replace(/__([^_\n]*?\S[^_\n]*?)__/g, '$1')  // Underline
    .replace(/~~([^~\n]*?\S[^~\n]*?)~~/g, '$1');  // Strikethrough
}

export function getMarkdownMarkerNavigationOffset(
  text: string,
  offset: number,
  direction: 'backward' | 'forward',
): number | null {
  const ranges = parseMarkdownFormatting(text);

  for (const range of ranges) {
    const markerSpans = [
      {
        start: range.startOffset,
        end: range.contentStartOffset,
        target: range.contentStartOffset,
      },
      {
        start: range.contentEndOffset,
        end: range.endOffset,
        target: range.contentEndOffset,
      },
    ];

    for (const span of markerSpans) {
      if (span.start >= span.end) continue;
      const wouldDeleteMarker = direction === 'backward'
        ? offset > span.start && offset <= span.end
        : offset >= span.start && offset < span.end;

      if (wouldDeleteMarker) {
        return span.target;
      }
    }
  }

  return null;
}
