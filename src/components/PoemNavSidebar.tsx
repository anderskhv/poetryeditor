import { useState, useEffect, useMemo } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { supabase } from '../lib/supabase';
import type { Poem, Section } from '../types/database';
import './PoemNavSidebar.css';

interface PoemNavSidebarProps {
  collectionId: string;
  currentPoemId: string;
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
}: {
  poem: Poem;
  isActive: boolean;
  onSelect: (poemId: string) => void;
  sectionId: string | null;
}) {
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: poem.id,
    data: { poemId: poem.id, sectionId },
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `poem-${poem.id}`,
    data: { sectionId },
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
      <button
        className={`poem-nav-item ${isActive ? 'active' : ''}`}
        onClick={() => onSelect(poem.id)}
        {...attributes}
        {...listeners}
      >
        {poem.title}
      </button>
    </div>
  );
}

export function PoemNavSidebar({
  collectionId,
  currentPoemId,
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

    const targetList = targetSectionId
      ? sections.find(section => section.id === targetSectionId)?.poems || []
      : unsectionedPoems;

    const nextSortOrder = (targetList[targetList.length - 1]?.sort_order ?? 0) + 1;

    const { error } = await supabase
      .from('poems')
      .update({ section_id: targetSectionId, sort_order: nextSortOrder })
      .eq('id', poemId);

    if (error) {
      console.error('Failed to move poem:', error);
      return;
    }

    const updatedPoem = { ...current.poem, section_id: targetSectionId, sort_order: nextSortOrder };

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
            ? { ...section, poems: [...section.poems, updatedPoem] }
            : section
        )
      );
    } else {
      setUnsectionedPoems(prev => [...prev, updatedPoem]);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overData = over.data.current as { sectionId?: string | null } | undefined;
    let targetSectionId: string | null = null;

    if (overData && 'sectionId' in overData) {
      targetSectionId = overData.sectionId ?? null;
    } else if (typeof over.id === 'string' && over.id.startsWith('section-')) {
      targetSectionId = over.id.replace('section-', '') || null;
    } else if (over.id === 'section-none') {
      targetSectionId = null;
    }

    void movePoem(activeId, targetSectionId);
  };

  const { setNodeRef: setUnsectionedDropRef, isOver: isOverUnsectioned } = useDroppable({
    id: 'section-none',
    data: { sectionId: null },
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
        <span className="poem-nav-title">Poems</span>
        <button className="poem-nav-close" onClick={onToggle} title="Hide poems">
          ‹
        </button>
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
              {unsectionedPoems.map(poem => (
                <PoemNavItem
                  key={poem.id}
                  poem={poem}
                  isActive={poem.id === currentPoemId}
                  onSelect={onPoemSelect}
                  sectionId={null}
                />
              ))}
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
                  <div className="poem-nav-section-items">
                    {section.poems.map(poem => (
                      <PoemNavItem
                        key={poem.id}
                        poem={poem}
                        isActive={poem.id === currentPoemId}
                        onSelect={onPoemSelect}
                        sectionId={section.id}
                      />
                    ))}
                    {section.poems.length === 0 && (
                      <div className="poem-nav-empty">No poems</div>
                    )}
                  </div>
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
