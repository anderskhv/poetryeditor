import { describe, it, expect } from 'vitest';
import { getMarkdownMarkerNavigationOffset, parseMarkdownFormatting, stripMarkdownFormatting } from '../markdownFormatter';

describe('parseMarkdownFormatting', () => {
  it('parses bold markers', () => {
    const ranges = parseMarkdownFormatting('hello **world** end');
    expect(ranges).toHaveLength(1);
    expect(ranges[0]).toMatchObject({
      type: 'bold',
      startOffset: 6,
      endOffset: 15,
      contentStartOffset: 8,
      contentEndOffset: 13,
    });
  });

  it('parses italic markers', () => {
    const ranges = parseMarkdownFormatting('hello *world* end');
    expect(ranges).toHaveLength(1);
    expect(ranges[0]).toMatchObject({
      type: 'italic',
      startOffset: 6,
      endOffset: 13,
      contentStartOffset: 7,
      contentEndOffset: 12,
    });
  });

  it('parses underline markers', () => {
    const ranges = parseMarkdownFormatting('hello __world__ end');
    expect(ranges).toHaveLength(1);
    expect(ranges[0]).toMatchObject({
      type: 'underline',
      startOffset: 6,
      endOffset: 15,
      contentStartOffset: 8,
      contentEndOffset: 13,
    });
  });

  it('parses single character content: **a**', () => {
    const ranges = parseMarkdownFormatting('**a**');
    expect(ranges).toHaveLength(1);
    expect(ranges[0].type).toBe('bold');
    expect(ranges[0].contentStartOffset).toBe(2);
    expect(ranges[0].contentEndOffset).toBe(3);
  });

  it('parses single character italic: *a*', () => {
    const ranges = parseMarkdownFormatting('*a*');
    expect(ranges).toHaveLength(1);
    expect(ranges[0].type).toBe('italic');
  });

  it('parses multiple formats on one line', () => {
    const ranges = parseMarkdownFormatting('**bold** and *italic* and __underline__');
    expect(ranges).toHaveLength(3);
    expect(ranges[0].type).toBe('bold');
    expect(ranges[1].type).toBe('italic');
    expect(ranges[2].type).toBe('underline');
  });

  it('keeps formatting alive when editing leaves spaces inside markers', () => {
    const ranges = parseMarkdownFormatting('** nope** and *almost * and __ under __');
    expect(ranges.find(r => r.type === 'bold')).toMatchObject({
      type: 'bold',
      contentStartOffset: 2,
      contentEndOffset: 7,
    });
    expect(ranges.find(r => r.type === 'italic')).toMatchObject({
      type: 'italic',
    });
    expect(ranges.find(r => r.type === 'underline')).toMatchObject({
      type: 'underline',
    });
  });

  it('keeps italic after deleting the last word and leaving trailing space', () => {
    const ranges = parseMarkdownFormatting('*one two *');
    expect(ranges).toHaveLength(1);
    expect(ranges[0]).toMatchObject({
      type: 'italic',
      startOffset: 0,
      endOffset: 10,
      contentStartOffset: 1,
      contentEndOffset: 9,
    });
  });

  it('parses stacked bold italic underline', () => {
    const ranges = parseMarkdownFormatting('__***hello***__');
    expect(ranges.filter(r => r.type === 'bold')).toHaveLength(1);
    expect(ranges.filter(r => r.type === 'italic')).toHaveLength(1);
    expect(ranges.filter(r => r.type === 'underline')).toHaveLength(1);
  });

  it('rejects content with newlines', () => {
    const ranges = parseMarkdownFormatting('**line1\nline2**');
    expect(ranges).toHaveLength(0);
  });

  it('does not treat bold markers as italic', () => {
    const ranges = parseMarkdownFormatting('**bold**');
    expect(ranges).toHaveLength(1);
    expect(ranges[0].type).toBe('bold');
  });

  it('italic inside bold range is excluded', () => {
    // The asterisks inside **..** should not be parsed as italic
    const ranges = parseMarkdownFormatting('**some text**');
    const italics = ranges.filter(r => r.type === 'italic');
    expect(italics).toHaveLength(0);
  });

  it('handles empty string', () => {
    expect(parseMarkdownFormatting('')).toHaveLength(0);
  });

  it('handles text with no formatting', () => {
    expect(parseMarkdownFormatting('just plain text')).toHaveLength(0);
  });

  it('handles unbalanced markers', () => {
    expect(parseMarkdownFormatting('**open only')).toHaveLength(0);
    expect(parseMarkdownFormatting('*open only')).toHaveLength(0);
    expect(parseMarkdownFormatting('__open only')).toHaveLength(0);
  });

  it('parses bold+italic (***text***) as both bold and italic ranges', () => {
    const ranges = parseMarkdownFormatting('***hello***');
    const bolds = ranges.filter(r => r.type === 'bold');
    const italics = ranges.filter(r => r.type === 'italic');
    expect(bolds).toHaveLength(1);
    expect(italics).toHaveLength(1);
    // Bold covers the outer range
    expect(bolds[0].startOffset).toBe(0);
    expect(bolds[0].endOffset).toBe(11);
    // Italic is nested inside
    expect(italics[0].contentStartOffset).toBe(3);
    expect(italics[0].contentEndOffset).toBe(8);
  });

  it('bold+italic does not interfere with separate bold/italic', () => {
    const ranges = parseMarkdownFormatting('***both*** and **bold** and *italic*');
    const bolds = ranges.filter(r => r.type === 'bold');
    const italics = ranges.filter(r => r.type === 'italic');
    expect(bolds).toHaveLength(2); // one from ***, one standalone
    expect(italics).toHaveLength(2); // one from ***, one standalone
  });
});

describe('stripMarkdownFormatting', () => {
  it('strips bold', () => {
    expect(stripMarkdownFormatting('**hello**')).toBe('hello');
  });

  it('strips italic', () => {
    expect(stripMarkdownFormatting('*hello*')).toBe('hello');
  });

  it('strips underline', () => {
    expect(stripMarkdownFormatting('__hello__')).toBe('hello');
  });

  it('strips mixed formatting', () => {
    expect(stripMarkdownFormatting('**bold** and *italic* and __under__'))
      .toBe('bold and italic and under');
  });

  it('preserves unformatted text', () => {
    expect(stripMarkdownFormatting('just text')).toBe('just text');
  });
});

describe('getMarkdownMarkerNavigationOffset', () => {
  it('moves backspace out of hidden closing markers', () => {
    expect(getMarkdownMarkerNavigationOffset('*hello*', 7, 'backward')).toBe(6);
  });

  it('moves delete out of hidden opening markers', () => {
    expect(getMarkdownMarkerNavigationOffset('*hello*', 0, 'forward')).toBe(1);
  });

  it('returns null for normal content deletion', () => {
    expect(getMarkdownMarkerNavigationOffset('*hello*', 4, 'backward')).toBeNull();
    expect(getMarkdownMarkerNavigationOffset('*hello*', 4, 'forward')).toBeNull();
  });
});
