import { describe, expect, it } from 'vitest';
import {
  parseCollectionDropId,
  planCollectionPoemDrag,
  parseSidebarDrop,
  planSidebarPoemDrag,
  poemSlotId,
} from '../poemDrag';

const poems = [
  { id: 'a', section_id: null, sort_order: 0 },
  { id: 'b', section_id: null, sort_order: 1 },
  { id: 'c', section_id: 'sec-1', sort_order: 0 },
];

describe('parseCollectionDropId', () => {
  it('reads a section droppable, including root', () => {
    expect(parseCollectionDropId('section-sec-1')).toEqual({ kind: 'section', sectionId: 'sec-1' });
    expect(parseCollectionDropId('section-root')).toEqual({ kind: 'section', sectionId: null });
  });

  it('reads a poem slot', () => {
    expect(parseCollectionDropId(poemSlotId('a'))).toEqual({ kind: 'poem', poemId: 'a' });
  });
});

describe('planCollectionPoemDrag', () => {
  it('reorders two root poems', () => {
    const updates = planCollectionPoemDrag(poems, 'a', poemSlotId('b'));
    expect(updates).toEqual([
      { id: 'b', section_id: null, sort_order: 0 },
      { id: 'a', section_id: null, sort_order: 1 },
    ]);
  });

  it('moves a root poem into an empty section droppable', () => {
    const updates = planCollectionPoemDrag(poems, 'a', 'section-sec-empty');
    expect(updates).toEqual([
      { id: 'b', section_id: null, sort_order: 0 },
      { id: 'a', section_id: 'sec-empty', sort_order: 0 },
    ]);
  });

  it('moves a root poem onto a poem that already lives in a section', () => {
    const updates = planCollectionPoemDrag(poems, 'b', poemSlotId('c'));
    expect(updates).toEqual([
      { id: 'a', section_id: null, sort_order: 0 },
      { id: 'b', section_id: 'sec-1', sort_order: 0 },
      { id: 'c', section_id: 'sec-1', sort_order: 1 },
    ]);
  });

  it('does not no-op when the over target is a different section container', () => {
    expect(planCollectionPoemDrag(poems, 'a', 'section-sec-1')).toEqual([
      { id: 'b', section_id: null, sort_order: 0 },
      { id: 'c', section_id: 'sec-1', sort_order: 0 },
      { id: 'a', section_id: 'sec-1', sort_order: 1 },
    ]);
  });

  it('ignores dropping a poem on itself or its own section', () => {
    expect(planCollectionPoemDrag(poems, 'a', poemSlotId('a'))).toBeNull();
    expect(planCollectionPoemDrag(poems, 'a', 'section-root')).toBeNull();
    expect(planCollectionPoemDrag(poems, 'missing', 'section-sec-1')).toBeNull();
  });
});

describe('sidebar drop planning', () => {
  it('reads a section header as a drop target', () => {
    expect(parseSidebarDrop('section-sec-1')).toEqual({ sectionId: 'sec-1', index: null });
  });

  it('prefers droppable data when the handle lands on a poem row', () => {
    expect(parseSidebarDrop('poem-c', { sectionId: 'sec-1', index: 0 })).toEqual({
      sectionId: 'sec-1',
      index: 0,
    });
  });

  it('moves a poem into another section at the end when only a container is hit', () => {
    expect(planSidebarPoemDrag({
      activeId: 'a',
      sourceSectionId: null,
      sourceIndex: 0,
      target: { sectionId: 'sec-1', index: null },
      sourceCount: 2,
      targetCount: 1,
    })).toEqual({ sectionId: 'sec-1', index: 1 });
  });

  it('reorders within the same list', () => {
    expect(planSidebarPoemDrag({
      activeId: 'a',
      sourceSectionId: null,
      sourceIndex: 0,
      target: { sectionId: null, index: 2 },
      sourceCount: 2,
      targetCount: 2,
    })).toEqual({ sectionId: null, index: 1 });
  });
});
