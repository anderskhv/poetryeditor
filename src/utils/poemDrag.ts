export type DragPoem = {
  id: string;
  section_id: string | null;
  sort_order: number;
};

export type PoemPlacement = {
  id: string;
  section_id: string | null;
  sort_order: number;
};

export type CollectionDropTarget =
  | { kind: 'poem'; poemId: string }
  | { kind: 'section'; sectionId: string | null };

export function sectionKey(sectionId: string | null | undefined): string {
  return sectionId ?? 'root';
}

export function collectionDroppableId(sectionId: string | null): string {
  return `section-${sectionKey(sectionId)}`;
}

export function poemSlotId(poemId: string): string {
  return `poem-slot-${poemId}`;
}

export function parseCollectionDropId(overId: string): CollectionDropTarget | null {
  if (!overId) return null;
  if (overId.startsWith('poem-slot-')) {
    return { kind: 'poem', poemId: overId.slice('poem-slot-'.length) };
  }
  if (overId.startsWith('section-')) {
    const raw = overId.slice('section-'.length);
    return { kind: 'section', sectionId: raw === 'root' ? null : raw };
  }
  return { kind: 'poem', poemId: overId };
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  const clamped = Math.max(0, Math.min(to, next.length));
  next.splice(clamped, 0, item);
  return next;
}

function groupBySection(poems: DragPoem[]): Map<string, DragPoem[]> {
  const grouped = new Map<string, DragPoem[]>();
  [...poems]
    .sort((a, b) => a.sort_order - b.sort_order)
    .forEach(poem => {
      const key = sectionKey(poem.section_id);
      const list = grouped.get(key) || [];
      list.push(poem);
      grouped.set(key, list);
    });
  return grouped;
}

export function planCollectionPoemDrag(
  poems: DragPoem[],
  activeId: string,
  overId: string
): PoemPlacement[] | null {
  if (!activeId || !overId) return null;
  if (activeId === overId || overId === poemSlotId(activeId)) return null;

  const active = poems.find(poem => poem.id === activeId);
  if (!active) return null;

  const drop = parseCollectionDropId(overId);
  if (!drop) return null;
  if (drop.kind === 'poem' && drop.poemId === activeId) return null;

  const grouped = groupBySection(poems);
  const fromKey = sectionKey(active.section_id);
  const fromList = [...(grouped.get(fromKey) || [])];
  const fromIndex = fromList.findIndex(poem => poem.id === activeId);
  if (fromIndex === -1) return null;

  let toSectionId: string | null;
  let insertIndex: number;

  if (drop.kind === 'poem') {
    const overPoem = poems.find(poem => poem.id === drop.poemId);
    if (!overPoem) return null;
    toSectionId = overPoem.section_id ?? null;
    const toKey = sectionKey(toSectionId);
    const toList = fromKey === toKey ? fromList : [...(grouped.get(toKey) || [])];
    insertIndex = toList.findIndex(poem => poem.id === drop.poemId);
    if (insertIndex === -1) insertIndex = toList.length;
  } else {
    toSectionId = drop.sectionId;
    const toKey = sectionKey(toSectionId);
    insertIndex = fromKey === toKey ? fromList.length - 1 : (grouped.get(toKey) || []).length;
  }

  const toKey = sectionKey(toSectionId);

  if (fromKey === toKey) {
    if (drop.kind === 'section') return null;
    const reordered = moveItem(fromList, fromIndex, insertIndex);
    const unchanged = reordered.every((poem, index) => poem.id === fromList[index].id);
    if (unchanged) return null;
    return reordered.map((poem, index) => ({
      id: poem.id,
      section_id: toSectionId,
      sort_order: index,
    }));
  }

  const nextFrom = fromList.filter(poem => poem.id !== activeId);
  const nextTo = [...(grouped.get(toKey) || [])];
  nextTo.splice(Math.max(0, Math.min(insertIndex, nextTo.length)), 0, {
    ...active,
    section_id: toSectionId,
  });

  return [
    ...nextFrom.map((poem, index) => ({
      id: poem.id,
      section_id: active.section_id ?? null,
      sort_order: index,
    })),
    ...nextTo.map((poem, index) => ({
      id: poem.id,
      section_id: toSectionId,
      sort_order: index,
    })),
  ];
}

export type SidebarDropTarget = {
  sectionId: string | null;
  index: number | null;
};

export function parseSidebarDrop(
  overId: string,
  overData?: { sectionId?: string | null; index?: number; poemId?: string }
): SidebarDropTarget | null {
  if (overData && ('sectionId' in overData || typeof overData.index === 'number')) {
    return {
      sectionId: overData.sectionId ?? null,
      index: typeof overData.index === 'number' ? overData.index : null,
    };
  }

  if (overId === 'section-list-root' || overId === 'section-root') {
    return { sectionId: null, index: null };
  }
  if (overId.startsWith('section-list-')) {
    return { sectionId: overId.slice('section-list-'.length), index: null };
  }
  if (overId.startsWith('section-')) {
    const raw = overId.slice('section-'.length);
    return { sectionId: raw === 'root' ? null : raw, index: null };
  }
  if (overId.startsWith('poem-') && overData?.poemId) {
    return { sectionId: overData.sectionId ?? null, index: overData.index ?? null };
  }
  return null;
}

export function planSidebarPoemDrag(args: {
  activeId: string;
  sourceSectionId: string | null;
  sourceIndex: number;
  target: SidebarDropTarget;
  sourceCount: number;
  targetCount: number;
}): { sectionId: string | null; index: number } | null {
  const { activeId, sourceSectionId, sourceIndex, target, sourceCount, targetCount } = args;
  if (!activeId) return null;

  const targetSectionId = target.sectionId;
  let insertIndex = target.index ?? targetCount;

  if (sourceSectionId === targetSectionId) {
    if (insertIndex > sourceIndex) insertIndex -= 1;
    insertIndex = Math.max(0, Math.min(insertIndex, sourceCount - 1));
    if (insertIndex === sourceIndex) return null;
    return { sectionId: targetSectionId, index: insertIndex };
  }

  return {
    sectionId: targetSectionId,
    index: Math.max(0, Math.min(insertIndex, targetCount)),
  };
}
