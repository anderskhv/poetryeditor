/**
 * Pure formatting engine — no Monaco dependency.
 * Takes text + selection offsets, returns edits + new selection.
 */

import { parseMarkdownFormatting, type MarkdownRange } from './markdownFormatter';

export interface FormattingEdit {
  startOffset: number;
  endOffset: number;
  newText: string;
}

export interface FormattingResult {
  edits: FormattingEdit[];
  newSelectionStart: number;
  newSelectionEnd: number;
}

/**
 * Compute formatting edits for bold/italic/underline toggling.
 *
 * @param fullText      The entire document text
 * @param selStart      Selection start offset (character offset into fullText)
 * @param selEnd        Selection end offset (same as selStart when no selection)
 * @param formatType    Which format to toggle
 * @param wordAtCursor  If no selection, the word under the cursor (optional)
 * @returns             Edits + new selection, or null if no-op
 */
export function computeFormatting(
  fullText: string,
  selStart: number,
  selEnd: number,
  formatType: 'bold' | 'italic' | 'underline' | 'strikethrough',
  wordAtCursor?: { startOffset: number; endOffset: number; text: string },
): FormattingResult | null {
  const prefix = formatType === 'bold' ? '**' : formatType === 'italic' ? '*' : formatType === 'underline' ? '__' : '~~';
  const suffix = prefix;
  const markerLen = prefix.length;

  const formattedRanges = parseMarkdownFormatting(fullText);

  // Find overlapping formatted regions of matching type
  const overlapping = formattedRanges.filter(r =>
    r.type === formatType &&
    selEnd > r.startOffset &&
    selStart < r.endOffset
  );

  const hasSelection = selStart !== selEnd;

  // --- No selection ---
  if (!hasSelection) {
    // Cursor inside a formatted region → unwrap it
    if (overlapping.length === 1) {
      const region = overlapping[0];
      const content = fullText.substring(region.contentStartOffset, region.contentEndOffset);
      return {
        edits: [{
          startOffset: region.startOffset,
          endOffset: region.endOffset,
          newText: content,
        }],
        newSelectionStart: region.startOffset,
        newSelectionEnd: region.startOffset + content.length,
      };
    }

    // No formatted region — expand to word and wrap
    if (!wordAtCursor || !wordAtCursor.text) return null;

    const wrapped = `${prefix}${wordAtCursor.text}${suffix}`;
    return {
      edits: [{
        startOffset: wordAtCursor.startOffset,
        endOffset: wordAtCursor.endOffset,
        newText: wrapped,
      }],
      newSelectionStart: wordAtCursor.startOffset + markerLen,
      newSelectionEnd: wordAtCursor.startOffset + markerLen + wordAtCursor.text.length,
    };
  }

  // --- Selection exists ---

  // Split selection into per-line segments
  const lines = fullText.split('\n');
  const lineSegments = getLineSegments(fullText, selStart, selEnd);

  // Check which lines are fully covered by a formatted region
  // A line is "formatted" if a matching region fully contains it (using full region bounds,
  // not just content bounds, so selections that include markers still count)
  const lineFormatted = lineSegments.map(seg => {
    return formattedRanges.find(r =>
      r.type === formatType &&
      r.startOffset <= seg.startOffset &&
      r.endOffset >= seg.endOffset
    ) || null;
  });

  const allFormatted = lineSegments.every((seg, i) => {
    return !seg.text.trim() || lineFormatted[i] !== null;
  });

  if (allFormatted && overlapping.length > 0) {
    // UNWRAP all overlapping regions (reverse order to preserve offsets)
    const sorted = [...overlapping].sort((a, b) => b.startOffset - a.startOffset);
    const edits: FormattingEdit[] = sorted.map(region => ({
      startOffset: region.startOffset,
      endOffset: region.endOffset,
      newText: fullText.substring(region.contentStartOffset, region.contentEndOffset),
    }));

    // Calculate new selection after unwrapping
    // Count marker characters removed before selStart and before selEnd
    let removedBeforeSelStart = 0;
    let removedBeforeSelEnd = 0;
    for (const region of overlapping) {
      const openMarkerLen = region.contentStartOffset - region.startOffset;
      const closeMarkerLen = region.endOffset - region.contentEndOffset;

      // Opening marker: removed before selStart if region starts before selStart
      if (region.startOffset < selStart) {
        removedBeforeSelStart += openMarkerLen;
      }
      // Opening marker: always removed before selEnd (region is within selection)
      removedBeforeSelEnd += openMarkerLen;

      // Closing marker: removed before selEnd if region ends at or before selEnd
      if (region.endOffset <= selEnd) {
        removedBeforeSelEnd += closeMarkerLen;
      }
      // Closing marker: removed before selStart only if region ends before selStart
      if (region.endOffset <= selStart) {
        removedBeforeSelStart += closeMarkerLen;
      }
    }

    return {
      edits,
      newSelectionStart: selStart - removedBeforeSelStart,
      newSelectionEnd: selEnd - removedBeforeSelEnd,
    };
  }

  // WRAP: wrap each line that isn't already formatted
  const edits: FormattingEdit[] = [];
  // Process in reverse order to preserve offsets
  for (let i = lineSegments.length - 1; i >= 0; i--) {
    const seg = lineSegments[i];
    if (!seg.text.trim()) continue;
    if (lineFormatted[i]) continue;

    const match = seg.text.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const leading = match?.[1] ?? '';
    const core = match?.[2] ?? '';
    const trailing = match?.[3] ?? '';
    if (!core) continue;

    edits.push({
      startOffset: seg.startOffset,
      endOffset: seg.endOffset,
      newText: `${leading}${prefix}${core}${suffix}${trailing}`,
    });
  }

  if (edits.length === 0) return null;

  // Calculate new selection after wrapping
  // For single-line: select inside markers (content only)
  // For multi-line: select from first content start to last content end
  const forwardEdits = [...edits].reverse();

  // First edit (in document order) determines selection start
  const firstEdit = forwardEdits[0];
  const lastEdit = forwardEdits[forwardEdits.length - 1];

  // Parse the wrapped text to find content boundaries
  const firstMatch = firstEdit.newText.match(/^(\s*)(.+?)(\s*)$/);
  const firstLeading = firstMatch?.[1] ?? '';
  const lastMatch = lastEdit.newText.match(/^(\s*)(.+?)(\s*)$/);
  const lastTrailing = lastMatch?.[3] ?? '';

  // Selection starts after first prefix marker, ends before last suffix marker
  const newSelStart = firstEdit.startOffset + firstLeading.length + markerLen;

  // For the last edit: calculate where content ends
  let lastEditNewStart = lastEdit.startOffset;
  // Adjust for any earlier edits that shift offsets
  for (const e of forwardEdits) {
    if (e === lastEdit) break;
    lastEditNewStart += e.newText.length - (e.endOffset - e.startOffset);
  }
  const newSelEnd = lastEditNewStart + lastEdit.newText.length - lastTrailing.length - markerLen;

  return {
    edits,
    newSelectionStart: newSelStart,
    newSelectionEnd: newSelEnd,
  };
}

interface LineSegment {
  startOffset: number;
  endOffset: number;
  text: string;
  lineIndex: number;
}

function getLineSegments(fullText: string, selStart: number, selEnd: number): LineSegment[] {
  const lines = fullText.split('\n');
  const segments: LineSegment[] = [];
  let offset = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineStart = offset;
    const lineEnd = offset + lines[i].length;

    // Check if this line overlaps with the selection
    if (lineEnd > selStart && lineStart < selEnd) {
      const segStart = Math.max(lineStart, selStart);
      const segEnd = Math.min(lineEnd, selEnd);
      segments.push({
        startOffset: segStart,
        endOffset: segEnd,
        text: fullText.substring(segStart, segEnd),
        lineIndex: i,
      });
    }

    offset = lineEnd + 1; // +1 for the \n
  }

  return segments;
}
