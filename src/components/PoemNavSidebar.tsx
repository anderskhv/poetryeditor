import { useState, useEffect } from 'react';
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

      <div className="poem-nav-list">
        {loading ? (
          <div className="poem-nav-loading">Loading...</div>
        ) : (
          <>
            {/* Unsectioned poems first */}
            {unsectionedPoems.map(poem => (
              <button
                key={poem.id}
                className={`poem-nav-item ${poem.id === currentPoemId ? 'active' : ''}`}
                onClick={() => onPoemSelect(poem.id)}
              >
                {poem.title}
              </button>
            ))}

            {/* Sectioned poems */}
            {sections.map(section => (
              <div key={section.id} className="poem-nav-section">
                <button
                  className="poem-nav-section-header"
                  onClick={() => toggleSection(section.id)}
                >
                  <span className={`section-chevron ${collapsedSections.has(section.id) ? 'collapsed' : ''}`}>
                    ›
                  </span>
                  <span className="section-name">{section.name}</span>
                </button>
                {!collapsedSections.has(section.id) && (
                  <div className="poem-nav-section-items">
                    {section.poems.map(poem => (
                      <button
                        key={poem.id}
                        className={`poem-nav-item ${poem.id === currentPoemId ? 'active' : ''}`}
                        onClick={() => onPoemSelect(poem.id)}
                      >
                        {poem.title}
                      </button>
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
        </>
      )}
    </div>
  );
}
