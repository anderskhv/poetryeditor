import { describe, it, expect } from 'vitest';
import { computeFormatting, type FormattingResult } from '../formattingEngine';

/** Helper: apply edits to text and return the result + verify selection is valid */
function applyResult(text: string, result: FormattingResult): string {
  // Sort edits by startOffset descending (apply from end to start)
  const sorted = [...result.edits].sort((a, b) => b.startOffset - a.startOffset);
  let out = text;
  for (const edit of sorted) {
    out = out.substring(0, edit.startOffset) + edit.newText + out.substring(edit.endOffset);
  }
  // Verify selection is within bounds
  expect(result.newSelectionStart).toBeGreaterThanOrEqual(0);
  expect(result.newSelectionEnd).toBeLessThanOrEqual(out.length);
  expect(result.newSelectionEnd).toBeGreaterThanOrEqual(result.newSelectionStart);
  return out;
}

/** Helper: get selected text after applying result */
function getSelectedText(text: string, result: FormattingResult): string {
  const newText = applyResult(text, result);
  return newText.substring(result.newSelectionStart, result.newSelectionEnd);
}

describe('computeFormatting — no selection, word at cursor', () => {
  it('wraps a plain word with bold', () => {
    const text = 'hello world';
    const result = computeFormatting(text, 7, 7, 'bold', { startOffset: 6, endOffset: 11, text: 'world' });
    expect(result).not.toBeNull();
    const newText = applyResult(text, result!);
    expect(newText).toBe('hello **world**');
    expect(getSelectedText(text, result!)).toBe('world');
  });

  it('wraps a plain word with italic', () => {
    const text = 'hello world';
    const result = computeFormatting(text, 7, 7, 'italic', { startOffset: 6, endOffset: 11, text: 'world' });
    expect(result).not.toBeNull();
    const newText = applyResult(text, result!);
    expect(newText).toBe('hello *world*');
    expect(getSelectedText(text, result!)).toBe('world');
  });

  it('wraps a plain word with underline', () => {
    const text = 'hello world';
    const result = computeFormatting(text, 7, 7, 'underline', { startOffset: 6, endOffset: 11, text: 'world' });
    expect(result).not.toBeNull();
    const newText = applyResult(text, result!);
    expect(newText).toBe('hello __world__');
    expect(getSelectedText(text, result!)).toBe('world');
  });

  it('returns null when no word at cursor', () => {
    const result = computeFormatting('hello world', 5, 5, 'bold');
    expect(result).toBeNull();
  });
});

describe('computeFormatting — no selection, cursor inside formatted region', () => {
  it('unwraps bold when cursor is inside', () => {
    const text = 'hello **world** end';
    // cursor at offset 9 = inside "world" content (offset 8-13)
    const result = computeFormatting(text, 9, 9, 'bold');
    expect(result).not.toBeNull();
    const newText = applyResult(text, result!);
    expect(newText).toBe('hello world end');
    expect(getSelectedText(text, result!)).toBe('world');
  });

  it('unwraps italic when cursor is inside', () => {
    const text = 'hello *world* end';
    const result = computeFormatting(text, 8, 8, 'italic');
    expect(result).not.toBeNull();
    const newText = applyResult(text, result!);
    expect(newText).toBe('hello world end');
    expect(getSelectedText(text, result!)).toBe('world');
  });

  it('unwraps underline when cursor is inside', () => {
    const text = 'hello __world__ end';
    const result = computeFormatting(text, 9, 9, 'underline');
    expect(result).not.toBeNull();
    const newText = applyResult(text, result!);
    expect(newText).toBe('hello world end');
    expect(getSelectedText(text, result!)).toBe('world');
  });
});

describe('computeFormatting — toggle cycle (the core bug)', () => {
  it('bold toggles cleanly 10 times', () => {
    let text = 'hello';
    // Start with full word selected
    let selStart = 0;
    let selEnd = 5;

    for (let i = 0; i < 10; i++) {
      const result = computeFormatting(text, selStart, selEnd, 'bold');
      expect(result).not.toBeNull();
      text = applyResult(text, result!);
      selStart = result!.newSelectionStart;
      selEnd = result!.newSelectionEnd;

      if (i % 2 === 0) {
        // After wrap
        expect(text).toBe('**hello**');
        expect(text.substring(selStart, selEnd)).toBe('hello');
      } else {
        // After unwrap
        expect(text).toBe('hello');
        expect(text.substring(selStart, selEnd)).toBe('hello');
      }
    }
  });

  it('italic toggles cleanly 10 times', () => {
    let text = 'hello';
    let selStart = 0;
    let selEnd = 5;

    for (let i = 0; i < 10; i++) {
      const result = computeFormatting(text, selStart, selEnd, 'italic');
      expect(result).not.toBeNull();
      text = applyResult(text, result!);
      selStart = result!.newSelectionStart;
      selEnd = result!.newSelectionEnd;

      if (i % 2 === 0) {
        expect(text).toBe('*hello*');
      } else {
        expect(text).toBe('hello');
      }
    }
  });

  it('underline toggles cleanly 10 times', () => {
    let text = 'hello';
    let selStart = 0;
    let selEnd = 5;

    for (let i = 0; i < 10; i++) {
      const result = computeFormatting(text, selStart, selEnd, 'underline');
      expect(result).not.toBeNull();
      text = applyResult(text, result!);
      selStart = result!.newSelectionStart;
      selEnd = result!.newSelectionEnd;

      if (i % 2 === 0) {
        expect(text).toBe('__hello__');
      } else {
        expect(text).toBe('hello');
      }
    }
  });

  it('cursor-based toggle cycles cleanly (no selection)', () => {
    // Simulate: place cursor in word → wrap → cursor now inside formatted → unwrap → repeat
    let text = 'hello';

    // First: wrap via word expansion
    let result = computeFormatting(text, 2, 2, 'bold', { startOffset: 0, endOffset: 5, text: 'hello' });
    expect(result).not.toBeNull();
    text = applyResult(text, result!);
    expect(text).toBe('**hello**');

    // Now cursor inside formatted region (offset 4 = inside content)
    result = computeFormatting(text, 4, 4, 'bold');
    expect(result).not.toBeNull();
    text = applyResult(text, result!);
    expect(text).toBe('hello');
    expect(getSelectedText('**hello**', result!)).toBe('hello');
  });
});

describe('computeFormatting — with selection', () => {
  it('wraps selected text with bold', () => {
    const text = 'hello world';
    const result = computeFormatting(text, 6, 11, 'bold');
    expect(result).not.toBeNull();
    const newText = applyResult(text, result!);
    expect(newText).toBe('hello **world**');
  });

  it('unwraps selected bold text', () => {
    const text = 'hello **world** end';
    // Select the bold region including markers
    const result = computeFormatting(text, 6, 15, 'bold');
    expect(result).not.toBeNull();
    const newText = applyResult(text, result!);
    expect(newText).toBe('hello world end');
  });

  it('preserves leading/trailing whitespace when wrapping', () => {
    const text = '  hello  ';
    const result = computeFormatting(text, 0, 9, 'bold');
    expect(result).not.toBeNull();
    const newText = applyResult(text, result!);
    expect(newText).toBe('  **hello**  ');
  });

  it('handles multi-line wrap', () => {
    const text = 'line one\nline two';
    const result = computeFormatting(text, 0, 17, 'bold');
    expect(result).not.toBeNull();
    const newText = applyResult(text, result!);
    expect(newText).toBe('**line one**\n**line two**');
  });

  it('handles multi-line unwrap', () => {
    const text = '**line one**\n**line two**';
    const result = computeFormatting(text, 0, text.length, 'bold');
    expect(result).not.toBeNull();
    const newText = applyResult(text, result!);
    expect(newText).toBe('line one\nline two');
  });

  it('mixed lines: only wraps unformatted lines', () => {
    const text = '**bold line**\nplain line';
    const result = computeFormatting(text, 0, text.length, 'bold');
    expect(result).not.toBeNull();
    const newText = applyResult(text, result!);
    expect(newText).toBe('**bold line**\n**plain line**');
  });

  it('skips empty lines when wrapping', () => {
    const text = 'hello\n\nworld';
    const result = computeFormatting(text, 0, 12, 'bold');
    expect(result).not.toBeNull();
    const newText = applyResult(text, result!);
    expect(newText).toBe('**hello**\n\n**world**');
  });
});

describe('computeFormatting — edge cases', () => {
  it('returns null for empty text with empty selection', () => {
    const result = computeFormatting('', 0, 0, 'bold');
    expect(result).toBeNull();
  });

  it('returns null for cursor in unformatted text without word', () => {
    const result = computeFormatting('hello world', 5, 5, 'bold');
    // offset 5 = the space between words — no word at cursor
    expect(result).toBeNull();
  });

  it('bold then italic on same text creates ***text***', () => {
    // Start with bold text, select content, apply italic
    const text = '**hello**';
    // Select the content "hello" (offsets 2-7)
    const result = computeFormatting(text, 2, 7, 'italic');
    expect(result).not.toBeNull();
    const newText = applyResult(text, result!);
    expect(newText).toBe('***hello***');
  });

  it('single character word wraps correctly', () => {
    const text = 'a';
    const result = computeFormatting(text, 0, 1, 'bold');
    expect(result).not.toBeNull();
    const newText = applyResult(text, result!);
    expect(newText).toBe('**a**');
  });

  it('selection including markers toggles cleanly', () => {
    // Select the full "**hello**" including markers, then toggle bold
    const text = '**hello**';
    const result = computeFormatting(text, 0, 9, 'bold');
    expect(result).not.toBeNull();
    const newText = applyResult(text, result!);
    expect(newText).toBe('hello');
    expect(result!.newSelectionStart).toBe(0);
    expect(result!.newSelectionEnd).toBe(5);
  });
});

describe('computeFormatting — multi-line toggle roundtrip', () => {
  it('multi-line bold toggles cleanly 4 times', () => {
    let text = 'line one\nline two';
    let selStart = 0;
    let selEnd = text.length;

    for (let i = 0; i < 4; i++) {
      const result = computeFormatting(text, selStart, selEnd, 'bold');
      expect(result).not.toBeNull();
      text = applyResult(text, result!);
      selStart = result!.newSelectionStart;
      selEnd = result!.newSelectionEnd;

      if (i % 2 === 0) {
        expect(text).toBe('**line one**\n**line two**');
      } else {
        expect(text).toBe('line one\nline two');
      }
    }
  });

  it('multi-line with empty line toggles cleanly', () => {
    let text = 'hello\n\nworld';
    let selStart = 0;
    let selEnd = text.length;

    // Wrap
    let result = computeFormatting(text, selStart, selEnd, 'bold');
    expect(result).not.toBeNull();
    text = applyResult(text, result!);
    selStart = result!.newSelectionStart;
    selEnd = result!.newSelectionEnd;
    expect(text).toBe('**hello**\n\n**world**');

    // Unwrap
    result = computeFormatting(text, selStart, selEnd, 'bold');
    expect(result).not.toBeNull();
    text = applyResult(text, result!);
    expect(text).toBe('hello\n\nworld');
  });
});

describe('computeFormatting — nested formatting', () => {
  it('bold then italic wraps, then italic unwrap leaves bold', () => {
    // Start: **hello**, apply italic to content → ***hello***
    let text = '**hello**';
    let result = computeFormatting(text, 2, 7, 'italic');
    expect(result).not.toBeNull();
    text = applyResult(text, result!);
    expect(text).toBe('***hello***');

    // Now unwrap italic from the content (select inner content)
    // In ***hello***, bold range is [0,11] content [2,9], italic is [2,9] content [3,8]
    result = computeFormatting(text, 3, 8, 'italic');
    expect(result).not.toBeNull();
    text = applyResult(text, result!);
    expect(text).toBe('**hello**');
  });

  it('allows bold, italic, and underline on the same text', () => {
    let text = 'hello';

    let result = computeFormatting(text, 0, 5, 'bold');
    expect(result).not.toBeNull();
    text = applyResult(text, result!);
    expect(text).toBe('**hello**');

    result = computeFormatting(text, 2, 7, 'italic');
    expect(result).not.toBeNull();
    text = applyResult(text, result!);
    expect(text).toBe('***hello***');

    result = computeFormatting(text, 3, 8, 'underline');
    expect(result).not.toBeNull();
    text = applyResult(text, result!);
    expect(text).toBe('***__hello__***');
  });

  it('removes one stacked format while keeping the others', () => {
    const text = '***__hello__***';
    const result = computeFormatting(text, 5, 10, 'underline');
    expect(result).not.toBeNull();
    const newText = applyResult(text, result!);
    expect(newText).toBe('***hello***');
  });
});
