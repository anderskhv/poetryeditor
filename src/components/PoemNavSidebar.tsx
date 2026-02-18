import { useState, useEffect, useMemo } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { supabase } from '../lib/supabase';
import type { Poem, Section } from '../types/database';
import './PoemNavSidebar.css';

interface PoemNavSidebarProps {
  collectionId: string;
  currentPoemId: string;
  currentPoemTitle: string;
  onPoemSelect: (poemId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface SectionWithPoems extends Section {
  poems: Poem[];
}

function PoemNavItem({
  poem,
  isActive,
  onSelect,
  sectionId,
  index,
  onDelete,
}: {
  poem: Poem;
  isActive: boolean;
  onSelect: (poemId: string) => void;
  sectionId: string | null;
  index: number;
  onDelete?: (poemId: string) => void;
}) {
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: poem.id,
    data: { poemId: poem.id, sectionId },
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `poem-${poem.id}`,
    data: { sectionId, index },
  });

  const setRefs = (node: HTMLDivElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  return (
    <div
      ref={setRefs}
      className={`poem-nav-draggable ${isDragging ? 'dragging' : ''} ${isOver ? 'drag-over' : ''}`}
    >
      <div className={`poem-nav-item ${isActive ? 'active' : ''}`}>
        <button className="poem-nav-title" onClick={() => onSelect(poem.id)}>
          {poem.title}
        </button>
        <div className="poem-nav-actions">
          {onDelete && (
            <button
              type="button"
              className="poem-nav-action-btn delete"
              title="Delete poem"
              onClick={() => onDelete(poem.id)}
            >
              ×
            </button>
          )}
          <button
            type="button"
            className="poem-nav-action-btn drag"
            title="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            ⋮⋮
          </button>
        </div>
      </div>
    </div>
  );
}

export function PoemNavSidebar({
  collectionId,
  currentPoemId,
  currentPoemTitle,
  onPoemSelect,
  isOpen,
  onToggle,
}: PoemNavSidebarProps) {
  const [sections, setSections] = useState<SectionWithPoems[]>([]);
  const [unsectionedPoems, setUnsectionedPoems] = useState<Poem[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const poemLookup = useMemo(() => {
    const map = new Map<string, { poem: Poem; sectionId: string | null }>();
    unsectionedPoems.forEach(poem => {
      map.set(poem.id, { poem, sectionId: null });
    });
    sections.forEach(section => {
      section.poems.forEach(poem => {
        map.set(poem.id, { poem, sectionId: section.id });
      });
    });
    return map;
  }, [sections, unsectionedPoems]);

  useEffect(() => {
    async function loadPoems() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Fetch sections for this collection
        const { data: sectionsData } = await supabase
          .from('sections')
          .select('*')
          .eq('collection_id', collectionId)
          .order('sort_order');

        // Fetch all poems for this collection
        const { data: poemsData } = await supabase
          .from('poems')
          .select('*')
          .eq('collection_id', collectionId)
          .order('sort_order');

        const poems = (poemsData || []) as Poem[];
        const sectionsList = (sectionsData || []) as Section[];

        // Group poems by section
        const sectionMap = new Map<string, SectionWithPoems>();
        sectionsList.forEach(section => {
          sectionMap.set(section.id, { ...section, poems: [] });
        });

        const unsectioned: Poem[] = [];
        poems.forEach(poem => {
          if (poem.section_id && sectionMap.has(poem.section_id)) {
            sectionMap.get(poem.section_id)!.poems.push(poem);
          } else {
            unsectioned.push(poem);
          }
        });

        setSections(Array.from(sectionMap.values()));
        setUnsectionedPoems(unsectioned);
      } catch (err) {
        console.error('Failed to load poems for sidebar:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPoems();
  }, [collectionId]);

  useEffect(() => {
    if (!currentPoemId || !currentPoemTitle) return;
    setUnsectionedPoems((prev) =>
      prev.map((poem) => (poem.id === currentPoemId ? { ...poem, title: currentPoemTitle } : poem))
    );
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        poems: section.poems.map((poem) =>
          poem.id === currentPoemId ? { ...poem, title: currentPoemTitle } : poem
        ),
      }))
    );
  }, [currentPoemId, currentPoemTitle]);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const movePoem = async (poemId: string, targetSectionId: string | null) => {
    const current = poemLookup.get(poemId);
    if (!current) return;
    if (current.sectionId === targetSectionId) return;
    if (!supabase) return;

    const sourceList = current.sectionId
      ? sections.find(section => section.id === current.sectionId)?.poems || []
      : unsectionedPoems;
    const targetList = targetSectionId
      ? sections.find(section => section.id === targetSectionId)?.poems || []
      : unsectionedPoems;

    const updatedPoem = { ...current.poem, section_id: targetSectionId };
    const nextSourceList = sourceList.filter(poem => poem.id !== poemId);
    const nextTargetList = [...targetList, updatedPoem];

    setUnsectionedPoems(prev => prev.filter(poem => poem.id !== poemId));
    setSections(prev =>
      prev.map(section => ({
        ...section,
        poems: section.poems.filter(poem => poem.id !== poemId),
      }))
    );

    if (targetSectionId) {
      setSections(prev =>
        prev.map(section =>
          section.id === targetSectionId
            ? { ...section, poems: nextTargetList }
            : section
        )
      );
    } else {
      setUnsectionedPoems(nextTargetList);
    }

    await persistOrders(nextSourceList, current.sectionId);
    await persistOrders(nextTargetList, targetSectionId);
  };

  const createPoemAt = async (sectionId: string | null, index: number) => {
    if (!supabase) return;
    const list = sectionId
      ? sections.find(section => section.id === sectionId)?.poems || []
      : unsectionedPoems;
    const clampedIndex = Math.max(0, Math.min(index, list.length));

    const { data, error } = await supabase
      .from('poems')
      .insert({
        collection_id: collectionId,
        section_id: sectionId,
        title: 'Untitled',
        content: '',
        sort_order: clampedIndex,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Failed to create poem:', error);
      return;
    }

    const created = data as Poem;
    const updatedList = [...list];
    updatedList.splice(clampedIndex, 0, created);

    if (sectionId) {
      setSections(prev =>
        prev.map(section =>
          section.id === sectionId ? { ...section, poems: updatedList } : section
        )
      );
    } else {
      setUnsectionedPoems(updatedList);
    }

    await persistOrders(updatedList, sectionId);
    onPoemSelect(created.id);
  };

  const deletePoem = async (poemId: string) => {
    if (!supabase) return;
    const poem = poemLookup.get(poemId)?.poem;
    if (!poem || !confirm(`Delete "${poem.title}"? This cannot be undone.`)) return;
    const { error } = await supabase
      .from('poems')
      .delete()
      .eq('id', poemId);
    if (error) {
      console.error('Failed to delete poem:', error);
      return;
    }
    setUnsectionedPoems(prev => prev.filter(p => p.id !== poemId));
    setSections(prev =>
      prev.map(section => ({
        ...section,
        poems: section.poems.filter(p => p.id !== poemId),
      }))
    );
  };

  const persistOrders = async (poemsToUpdate: Poem[], sectionId: string | null) => {
    if (!supabase) return;
    const client = supabase;
    await Promise.all(
      poemsToUpdate.map((poem, index) =>
        client
          .from('poems')
          .update({ section_id: sectionId, sort_order: index } as any)
          .eq('id', poem.id)
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overData = over.data.current as { sectionId?: string | null; index?: number } | undefined;
    const overId = over.id as string;

    const activeEntry = poemLookup.get(activeId);
    if (!activeEntry) return;

    const sourceSectionId = activeEntry.sectionId;
    let targetSectionId: string | null = null;
    let targetIndex: number | null = null;

    if (overData && 'sectionId' in overData) {
      targetSectionId = overData.sectionId ?? null;
      targetIndex = typeof overData.index === 'number' ? overData.index : null;
    } else if (overId.startsWith('section-')) {
      const sectionId = overId.replace('section-', '');
      targetSectionId = sectionId === 'root' ? null : sectionId || null;
      targetIndex = null;
    }

    if (targetSectionId === null && targetIndex === null && overId.startsWith('poem-')) {
      const targetPoemId = overId.replace('poem-', '');
      const targetEntry = poemLookup.get(targetPoemId);
      targetSectionId = targetEntry?.sectionId ?? null;
      targetIndex = targetEntry
        ? (targetSectionId
            ? sections.find(section => section.id === targetSectionId)?.poems.findIndex(poem => poem.id === targetPoemId)
            : unsectionedPoems.findIndex(poem => poem.id === targetPoemId)) ?? null
        : null;
    }

    if (targetSectionId === null && targetIndex === null) return;

    const sourceList = sourceSectionId
      ? sections.find(section => section.id === sourceSectionId)?.poems || []
      : unsectionedPoems;
    const targetList = targetSectionId
      ? sections.find(section => section.id === targetSectionId)?.poems || []
      : unsectionedPoems;

    const fromIndex = sourceList.findIndex(poem => poem.id === activeId);
    if (fromIndex === -1) return;

    const insertIndex = targetIndex ?? targetList.length;

    if (sourceSectionId === targetSectionId) {
      const reordered = [...sourceList];
      const [moved] = reordered.splice(fromIndex, 1);
      const adjustedIndex = fromIndex < insertIndex ? insertIndex - 1 : insertIndex;
      reordered.splice(adjustedIndex, 0, moved);

      if (sourceSectionId) {
        setSections(prev =>
          prev.map(section =>
            section.id === sourceSectionId ? { ...section, poems: reordered } : section
          )
        );
      } else {
        setUnsectionedPoems(reordered);
      }
      void persistOrders(reordered, sourceSectionId);
      return;
    }

    const nextSourceList = sourceList.filter(poem => poem.id !== activeId);
    const movedPoem = { ...activeEntry.poem, section_id: targetSectionId };
    const nextTargetList = [...targetList];
    nextTargetList.splice(insertIndex, 0, movedPoem);

    setUnsectionedPoems(prev => prev.filter(poem => poem.id !== activeId));
    setSections(prev =>
      prev.map(section => ({
        ...section,
        poems: section.poems.filter(poem => poem.id !== activeId),
      }))
    );

    if (targetSectionId) {
      setSections(prev =>
        prev.map(section =>
          section.id === targetSectionId ? { ...section, poems: nextTargetList } : section
        )
      );
    } else {
      setUnsectionedPoems(nextTargetList);
    }

    void persistOrders(nextSourceList, sourceSectionId);
    void persistOrders(nextTargetList, targetSectionId);
  };

  const { setNodeRef: setUnsectionedDropRef, isOver: isOverUnsectioned } = useDroppable({
    id: 'section-list-root',
    data: { sectionId: null, index: unsectionedPoems.length },
  });

  return (
    <div className={`poem-nav-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      {!isOpen ? (
        <button className="poem-nav-toggle" onClick={onToggle} title="Show poems">
          <span className="toggle-icon">›</span>
        </button>
      ) : (
        <>
      <div className="poem-nav-header">
        <span className="poem-nav-heading">Poems</span>
        <div className="poem-nav-header-actions">
          <button className="poem-nav-close" onClick={onToggle} title="Hide poems">
            ‹
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="poem-nav-list">
        {loading ? (
          <div className="poem-nav-loading">Loading...</div>
        ) : (
          <>
            {/* Unsectioned poems first */}
            <div
              ref={setUnsectionedDropRef}
              className={`poem-nav-dropzone ${isOverUnsectioned ? 'is-over' : ''}`}
            >
              {unsectionedPoems.map((poem, idx) => (
                <div key={poem.id} className="poem-nav-row">
                  <PoemNavItem
                    poem={poem}
                    isActive={poem.id === currentPoemId}
                    onSelect={onPoemSelect}
                    sectionId={null}
                    index={idx}
                    onDelete={deletePoem}
                  />
                  <button
                    type="button"
                    className="poem-nav-insert"
                    onClick={() => createPoemAt(null, idx + 1)}
                    title="Insert new poem here"
                  >
                    +
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="poem-nav-insert end"
                onClick={() => createPoemAt(null, unsectionedPoems.length)}
                title="Add new poem"
              >
                +
              </button>
            </div>

            {/* Sectioned poems */}
            {sections.map(section => (
              <div key={section.id} className="poem-nav-section">
                <SectionHeader
                  sectionId={section.id}
                  name={section.name}
                  collapsed={collapsedSections.has(section.id)}
                  onToggle={() => toggleSection(section.id)}
                />
                {!collapsedSections.has(section.id) && (
                  <SectionPoemList
                    section={section}
                    currentPoemId={currentPoemId}
                    onPoemSelect={onPoemSelect}
                    onDelete={deletePoem}
                    onInsertAfter={(index) => createPoemAt(section.id, index)}
                  />
                )}
              </div>
            ))}

            {unsectionedPoems.length === 0 && sections.length === 0 && (
              <div className="poem-nav-empty">No poems in collection</div>
            )}
          </>
        )}
      </div>
      </DndContext>
        </>
      )}
    </div>
  );
}

function SectionHeader({
  sectionId,
  name,
  collapsed,
  onToggle,
}: {
  sectionId: string;
  name: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `section-${sectionId}`,
    data: { sectionId },
  });

  return (
    <button
      ref={setNodeRef}
      className={`poem-nav-section-header ${isOver ? 'is-over' : ''}`}
      onClick={onToggle}
    >
      <span className={`section-chevron ${collapsed ? 'collapsed' : ''}`}>
        ›
      </span>
      <span className="section-name">{name}</span>
    </button>
  );
}

function SectionPoemList({
  section,
  currentPoemId,
  onPoemSelect,
  onDelete,
  onInsertAfter,
}: {
  section: SectionWithPoems;
  currentPoemId: string;
  onPoemSelect: (poemId: string) => void;
  onDelete: (poemId: string) => void;
  onInsertAfter: (index: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `section-list-${section.id}`,
    data: { sectionId: section.id, index: section.poems.length },
  });

  return (
    <div ref={setNodeRef} className={`poem-nav-section-items ${isOver ? 'is-over' : ''}`}>
      {section.poems.map((poem, idx) => (
        <div key={poem.id} className="poem-nav-row">
          <PoemNavItem
            poem={poem}
            isActive={poem.id === currentPoemId}
            onSelect={onPoemSelect}
            sectionId={section.id}
            index={idx}
            onDelete={onDelete}
          />
          <button
            type="button"
            className="poem-nav-insert"
            onClick={() => onInsertAfter(idx + 1)}
            title="Insert new poem here"
          >
            +
          </button>
        </div>
      ))}
      <button
        type="button"
        className="poem-nav-insert end"
        onClick={() => onInsertAfter(section.poems.length)}
        title="Add new poem"
      >
        +
      </button>
      {section.poems.length === 0 && (
        <div className="poem-nav-empty">No poems</div>
      )}
    </div>
  );
}
