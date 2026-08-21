import { describe, expect, it } from 'vitest';
import { findPoemDropId } from '../pointerPoemDrag';
import { collectionDroppableId, poemSlotId } from '../poemDrag';

function fakeNode(dropId: string | null) {
  return {
    closest: (selector: string) => {
      if (selector !== '[data-poem-drop]' || !dropId) return null;
      return {
        getAttribute: (name: string) => (name === 'data-poem-drop' ? dropId : null),
      } as Element;
    },
  };
}

describe('findPoemDropId', () => {
  it('prefers a section droppable over the card being dragged', () => {
    const overId = findPoemDropId(10, 10, 'poem-a', () => [
      fakeNode(poemSlotId('poem-a')),
      fakeNode(collectionDroppableId('sec-1')),
    ]);
    expect(overId).toBe('section-sec-1');
  });

  it('returns another poem slot when that card is under the pointer', () => {
    const overId = findPoemDropId(10, 10, 'poem-a', () => [
      fakeNode(poemSlotId('poem-b')),
    ]);
    expect(overId).toBe(poemSlotId('poem-b'));
  });
});
