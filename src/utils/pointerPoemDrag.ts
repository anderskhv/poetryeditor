import { poemSlotId } from './poemDrag';

export function findPoemDropId(
  x: number,
  y: number,
  activePoemId: string,
  elementsFromPoint: (clientX: number, clientY: number) => Array<Element | { closest?: (selector: string) => Element | null }> = defaultElementsFromPoint
): string | null {
  const hits = elementsFromPoint(x, y);
  for (const el of hits) {
    const node = typeof el.closest === 'function' ? el.closest('[data-poem-drop]') : null;
    if (!node) continue;
    const dropId = node.getAttribute('data-poem-drop');
    if (!dropId || dropId === poemSlotId(activePoemId)) continue;
    return dropId;
  }
  return null;
}

function defaultElementsFromPoint(x: number, y: number): Element[] {
  if (typeof document === 'undefined' || typeof document.elementsFromPoint !== 'function') {
    return [];
  }
  return document.elementsFromPoint(x, y);
}
