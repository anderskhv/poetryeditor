import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, TouchSensor, closestCorners, pointerWithin, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { supabase } from '../lib/supabase';
import type { Poem, Section } from '../types/database';
import type { PoemStatus } from '../types/collection';
import { parseSidebarDrop, planSidebarPoemDrag } from '../utils/poemDrag';
import { touchCollectionUpdatedAt } from '../utils/touchCollection';
import './PoemNavSidebar.css';

const STATUS_CYCLE: PoemStatus[] = ['rough', 'draft', 'edit', 'done'];
const STATUS_LABELS: Record<PoemStatus, string> = { rough: 'Rough', draft: 'Draft', edit: 'Edit', done: 'Done' };
const STATUS_COLORS: Record<PoemStatus, string> = { rough: '#c62828', draft: '#999', edit: '#e6a817', done: '#28a745' };

function getPoemStatus(poemId: string): PoemStatus {
  try {
    const val = localStorage.getItem(`poem-status:${poemId}`);
    if (val === 'rough' || val === 'draft' || val === 'edit' || val === 'done') return val;
  } catch {
    return 'draft';
  }
  return 'draft';
}

function setPoemStatus(poemId: string, status: PoemStatus) {
  try {
    localStorage.setItem(`poem-status:${poemId}`, status);
  } catch (err) {
    console.warn('Failed to save poem status:', err);
  }
}

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
  status,
  onStatusChange,
}: {
  poem: Poem;
  isActive: boolean;
  onSelect: (poemId: string) => void;
  sectionId: string | null;
  index: number;
  onDelete?: (poemId: string) => void;
  status: PoemStatus;
  onStatusChange: (poemId: string, status: PoemStatus) => void;
}) {
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: poem.id,
    data: { poemId: poem.id, sectionId, index },
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `poem-${poem.id}`,
    data: { poemId: poem.id, sectionId, index },
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
        <button
          type="button"
          className="poem-status-dot"
          data-status-label={STATUS_LABELS[status]}
          title={STATUS_LABELS[status]}
          aria-label={`Poem status: ${STATUS_LABELS[status]}. Activate to cycle status.`}
          onClick={(e) => {
            e.stopPropagation();
            const idx = STATUS_CYCLE.indexOf(status);
            onStatusChange(poem.id, STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]);
          }}
        >
          <span className="poem-status-dot-swatch" style={{ background: STATUS_COLORS[status] }} />
          <span className="poem-status-dot-label">{STATUS_LABELS[status]}</span>
        </button>
        <button className="poem-nav-title" onClick={() => onSelect(poem.id)}>
          {poem.title}
        </button>
        <div className="poem-nav-actions">
          {onDelete && (
            <button
              type="button"
              className="poem-nav-action-btn delete"
              title="Delete poem"
              aria-label={`Delete ${poem.title}`}
              onClick={() => onDelete(poem.id)}
            >
              ×
            </button>
          )}
          <button
            type="button"
            className="poem-nav-action-btn drag"
            title="Drag to reorder"
            aria-label={`Drag ${poem.title} to reorder`}
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
  const [statusMap, setStatusMap] = useState<Record<string, PoemStatus>>({});
  const [isCreatingPoem, setIsCreatingPoem] = useState(false);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const creatingPoemRef = useRef(false);
  const creatingSectionRef = useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } })
  );
  const collisionDetection: typeof closestCorners = (args) => {
    const pointerHits = pointerWithin(args);
    return pointerHits.length > 0 ? pointerHits : closestCorners(args);
  };

  const handleStatusChange = useCallback((poemId: string, status: PoemStatus) => {
    setPoemStatus(poemId, status);
    setStatusMap(prev => ({ ...prev, [poemId]: status }));
  }, []);

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

  // Load statuses from localStorage when poems change
  useEffect(() => {
    const allPoems = [...unsectionedPoems, ...sections.flatMap(s => s.poems)];
    if (allPoems.length === 0) return;
    const map: Record<string, PoemStatus> = {};
    allPoems.forEach(p => { map[p.id] = getPoemStatus(p.id); });
    setStatusMap(map);
  }, [unsectionedPoems, sections]);

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
    if (creatingPoemRef.current) return;
    creatingPoemRef.current = true;
    setIsCreatingPoem(true);

    const list = sectionId
      ? sections.find(section => section.id === sectionId)?.poems || []
      : unsectionedPoems;
    const clampedIndex = Math.max(0, Math.min(index, list.length));

    try {
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
      const normalizedList = updatedList.map((poem, sortOrder) => ({
        ...poem,
        section_id: sectionId,
        sort_order: sortOrder,
      }));

      if (sectionId) {
        setSections(prev =>
          prev.map(section =>
            section.id === sectionId ? { ...section, poems: normalizedList } : section
          )
        );
      } else {
        setUnsectionedPoems(normalizedList);
      }

      await persistOrders(normalizedList, sectionId);
      await touchCollectionUpdatedAt(collectionId);
      onPoemSelect(created.id);
    } finally {
      creatingPoemRef.current = false;
      setIsCreatingPoem(false);
    }
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
    await touchCollectionUpdatedAt(collectionId);
  };

  const createSection = async (rawName: string) => {
    if (!supabase) return;
    if (creatingSectionRef.current) return;
    const name = rawName.trim();
    if (!name) {
      setShowSectionForm(false);
      setNewSectionName('');
      return;
    }
    creatingSectionRef.current = true;
    setIsCreatingSection(true);
    try {
      const { data, error } = await supabase
        .from('sections')
        .insert({
          collection_id: collectionId,
          name,
          parent_id: null,
          sort_order: sections.length,
        } as any)
        .select()
        .single();
      if (error) {
        console.error('Failed to create section:', error);
        return;
      }
      const created = data as Section;
      setSections(prev => [...prev, { ...created, poems: [] }]);
      setShowSectionForm(false);
      setNewSectionName('');
      await touchCollectionUpdatedAt(collectionId);
    } finally {
      creatingSectionRef.current = false;
      setIsCreatingSection(false);
    }
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;

    const activeId = active.id as string;
    const overData = over.data.current as { sectionId?: string | null; index?: number; poemId?: string } | undefined;
    const overId = over.id as string;

    const activeEntry = poemLookup.get(activeId);
    if (!activeEntry) return;

    const sourceSectionId = activeEntry.sectionId;
    let target = parseSidebarDrop(overId, overData);

    if ((!target || (target.sectionId === null && target.index === null && overId.startsWith('poem-'))) && overId.startsWith('poem-')) {
      const targetPoemId = overId.replace('poem-', '');
      const targetEntry = poemLookup.get(targetPoemId);
      if (targetEntry) {
        const targetList = targetEntry.sectionId
          ? sections.find(section => section.id === targetEntry.sectionId)?.poems || []
          : unsectionedPoems;
        target = {
          sectionId: targetEntry.sectionId,
          index: targetList.findIndex(poem => poem.id === targetPoemId),
        };
      }
    }

    if (!target) return;

    const sourceList = sourceSectionId
      ? sections.find(section => section.id === sourceSectionId)?.poems || []
      : unsectionedPoems;
    const plannedTargetList = target.sectionId
      ? sections.find(section => section.id === target.sectionId)?.poems || []
      : unsectionedPoems;
    const fromIndex = sourceList.findIndex(poem => poem.id === activeId);
    if (fromIndex === -1) return;

    const plan = planSidebarPoemDrag({
      activeId,
      sourceSectionId,
      sourceIndex: fromIndex,
      target,
      sourceCount: sourceList.length,
      targetCount: plannedTargetList.length,
    });
    if (!plan) return;

    const targetSectionId = plan.sectionId;
    const insertIndex = plan.index;
    const targetList = targetSectionId
      ? sections.find(section => section.id === targetSectionId)?.poems || []
      : unsectionedPoems;

    if (sourceSectionId === targetSectionId) {
      const reordered = [...sourceList];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(insertIndex, 0, moved);

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

  const handleDragCancel = () => {
    setActiveDragId(null);
  };

  const activeDragPoem = poemLookup.get(activeDragId || '')?.poem || null;

  return (
    <div className={`poem-nav-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      {!isOpen ? (
        <button className="poem-nav-toggle" onClick={onToggle} title="Show poems" aria-label="Show poems">
          <span className="toggle-icon">›</span>
        </button>
      ) : (
        <>
      <div className="poem-nav-header">
        <span className="poem-nav-heading">Poems</span>
        <div className="poem-nav-header-actions">
          <button className="poem-nav-close" onClick={onToggle} title="Hide poems" aria-label="Hide poems">
            ‹
          </button>
        </div>
      </div>

      <div className="poem-nav-create">
        <button
          type="button"
          className="poem-nav-create-btn"
          onClick={() => createPoemAt(null, unsectionedPoems.length)}
          disabled={isCreatingPoem}
        >
          New Poem
        </button>
        <button
          type="button"
          className="poem-nav-create-btn"
          onClick={() => {
            setShowSectionForm(true);
            setNewSectionName('');
          }}
          disabled={isCreatingSection}
        >
          New Section
        </button>
      </div>
      {showSectionForm && (
        <form
          className="poem-nav-section-form"
          onSubmit={(e) => {
            e.preventDefault();
            void createSection(newSectionName);
          }}
        >
          <label className="visually-hidden" htmlFor="poem-nav-section-name">
            Section name
          </label>
          <input
            id="poem-nav-section-name"
            className="poem-nav-section-input"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onBlur={() => void createSection(newSectionName)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowSectionForm(false);
                setNewSectionName('');
              }
            }}
            placeholder="Section name"
            autoFocus
            disabled={isCreatingSection}
          />
          <button type="submit" className="poem-nav-create-btn" disabled={isCreatingSection}>
            Add
          </button>
        </form>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <PoemNavListBody
          loading={loading}
          unsectionedPoems={unsectionedPoems}
          sections={sections}
          collapsedSections={collapsedSections}
          currentPoemId={currentPoemId}
          onPoemSelect={onPoemSelect}
          onDelete={deletePoem}
          onToggleSection={toggleSection}
          onCreatePoemAt={createPoemAt}
          isCreatingPoem={isCreatingPoem}
          statusMap={statusMap}
          onStatusChange={handleStatusChange}
        />
        <DragOverlay dropAnimation={null}>
          {activeDragPoem && (
            <div className="poem-nav-item poem-nav-overlay">
              <span className="poem-nav-overlay-title">{activeDragPoem.title || 'Untitled'}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {!loading && (unsectionedPoems.length > 0 || sections.length > 0) && (
        <div className="poem-nav-status-legend">
          {STATUS_CYCLE.map(s => (
            <span key={s} className="legend-item">
              <span className="legend-dot" style={{ background: STATUS_COLORS[s] }} />
              {STATUS_LABELS[s]}
            </span>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
}

function PoemNavListBody({
  loading,
  unsectionedPoems,
  sections,
  collapsedSections,
  currentPoemId,
  onPoemSelect,
  onDelete,
  onToggleSection,
  onCreatePoemAt,
  isCreatingPoem,
  statusMap,
  onStatusChange,
}: {
  loading: boolean;
  unsectionedPoems: Poem[];
  sections: SectionWithPoems[];
  collapsedSections: Set<string>;
  currentPoemId: string;
  onPoemSelect: (poemId: string) => void;
  onDelete: (poemId: string) => void;
  onToggleSection: (sectionId: string) => void;
  onCreatePoemAt: (sectionId: string | null, index: number) => void;
  isCreatingPoem: boolean;
  statusMap: Record<string, PoemStatus>;
  onStatusChange: (poemId: string, status: PoemStatus) => void;
}) {
  const { setNodeRef: setUnsectionedDropRef, isOver: isOverUnsectioned } = useDroppable({
    id: 'section-list-root',
    data: { sectionId: null, index: unsectionedPoems.length },
  });

  return (
    <div className="poem-nav-list">
      {loading ? (
        <div className="poem-nav-loading">Loading...</div>
      ) : (
        <>
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
                  onDelete={onDelete}
                  status={statusMap[poem.id] || 'draft'}
                  onStatusChange={onStatusChange}
                />
                <button
                  type="button"
                  className="poem-nav-insert"
                  onClick={() => onCreatePoemAt(null, idx + 1)}
                  disabled={isCreatingPoem}
                  title="Insert new poem here"
                >
                  +
                </button>
              </div>
            ))}
            <button
              type="button"
              className="poem-nav-insert end"
              onClick={() => onCreatePoemAt(null, unsectionedPoems.length)}
              disabled={isCreatingPoem}
              title="Add new poem"
            >
              +
            </button>
          </div>

          {sections.map(section => (
            <div key={section.id} className="poem-nav-section">
              <SectionHeader
                sectionId={section.id}
                name={section.name}
                collapsed={collapsedSections.has(section.id)}
                onToggle={() => onToggleSection(section.id)}
              />
              {!collapsedSections.has(section.id) && (
                <SectionPoemList
                  section={section}
                  currentPoemId={currentPoemId}
                  onPoemSelect={onPoemSelect}
                  onDelete={onDelete}
                  onInsertAfter={(index) => onCreatePoemAt(section.id, index)}
                  isCreatingPoem={isCreatingPoem}
                  statusMap={statusMap}
                  onStatusChange={onStatusChange}
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
  isCreatingPoem,
  statusMap,
  onStatusChange,
}: {
  section: SectionWithPoems;
  currentPoemId: string;
  onPoemSelect: (poemId: string) => void;
  onDelete: (poemId: string) => void;
  onInsertAfter: (index: number) => void;
  isCreatingPoem: boolean;
  statusMap: Record<string, PoemStatus>;
  onStatusChange: (poemId: string, status: PoemStatus) => void;
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
            status={statusMap[poem.id] || 'draft'}
            onStatusChange={onStatusChange}
          />
          <button
            type="button"
            className="poem-nav-insert"
            onClick={() => onInsertAfter(idx + 1)}
            disabled={isCreatingPoem}
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
        disabled={isCreatingPoem}
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
