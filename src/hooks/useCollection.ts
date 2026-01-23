import { useState, useCallback, useEffect } from 'react';
import {
  PoetryCollection,
  CollectionPoem,
  CollectionSection,
  TreeNode,
  UploadResult,
} from '../types/collection';
import {
  loadOrCreateCollection,
  saveCollection,
  createEmptyCollection,
} from '../utils/collectionMigration';
import { generateId, processUploadedFiles } from '../utils/markdownUtils';
import { downloadCollectionAsZip } from '../utils/collectionExport';
import { importZipFile, isZipFile } from '../utils/collectionImport';

export function useCollection() {
  const [collection, setCollection] = useState<PoetryCollection>(() => {
    return loadOrCreateCollection();
  });

  // Auto-save to localStorage when collection changes
  useEffect(() => {
    saveCollection(collection);
  }, [collection]);

  // ============ POEM OPERATIONS ============

  const addPoem = useCallback((poem: Omit<CollectionPoem, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
    setCollection(prev => {
      const maxOrder = Math.max(0, ...prev.poems.map(p => p.order));
      const newPoem: CollectionPoem = {
        ...poem,
        id: generateId('poem'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: maxOrder + 1,
      };
      return {
        ...prev,
        poems: [...prev.poems, newPoem],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updatePoem = useCallback((id: string, updates: Partial<CollectionPoem>) => {
    setCollection(prev => ({
      ...prev,
      poems: prev.poems.map(p =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const deletePoem = useCallback((id: string) => {
    setCollection(prev => ({
      ...prev,
      poems: prev.poems.filter(p => p.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const getPoemById = useCallback((id: string): CollectionPoem | undefined => {
    return collection.poems.find(p => p.id === id);
  }, [collection.poems]);

  // ============ SECTION OPERATIONS ============

  const addSection = useCallback((name: string, parentId: string | null = null) => {
    setCollection(prev => {
      const siblingSections = prev.sections.filter(s => s.parentId === parentId);
      const maxOrder = Math.max(0, ...siblingSections.map(s => s.order));
      const newSection: CollectionSection = {
        id: generateId('section'),
        name,
        parentId,
        order: maxOrder + 1,
        isExpanded: true,
      };
      return {
        ...prev,
        sections: [...prev.sections, newSection],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updateSection = useCallback((id: string, updates: Partial<CollectionSection>) => {
    setCollection(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const deleteSection = useCallback((id: string, deletePoems: boolean = false) => {
    setCollection(prev => {
      // Get all descendant section IDs
      const getDescendantIds = (parentId: string): string[] => {
        const children = prev.sections.filter(s => s.parentId === parentId);
        return children.flatMap(c => [c.id, ...getDescendantIds(c.id)]);
      };
      const sectionIdsToDelete = [id, ...getDescendantIds(id)];

      let updatedPoems = prev.poems;
      if (deletePoems) {
        // Delete poems in these sections
        updatedPoems = prev.poems.filter(p => !sectionIdsToDelete.includes(p.sectionId || ''));
      } else {
        // Move poems to root
        updatedPoems = prev.poems.map(p =>
          sectionIdsToDelete.includes(p.sectionId || '')
            ? { ...p, sectionId: null }
            : p
        );
      }

      return {
        ...prev,
        sections: prev.sections.filter(s => !sectionIdsToDelete.includes(s.id)),
        poems: updatedPoems,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const toggleSectionExpanded = useCallback((id: string) => {
    setCollection(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === id ? { ...s, isExpanded: !s.isExpanded } : s
      ),
    }));
  }, []);

  // ============ IMPORT OPERATIONS ============

  const importFiles = useCallback(async (files: FileList | File[]): Promise<UploadResult> => {
    const fileArray = Array.from(files);

    // Check if any files are ZIP files
    const zipFiles = fileArray.filter(isZipFile);
    const mdFiles = fileArray.filter(f => !isZipFile(f));

    let combinedResult: UploadResult = { success: [], failed: [] };

    // Process ZIP files
    for (const zipFile of zipFiles) {
      const { result, sections, poems } = await importZipFile(zipFile, collection);
      combinedResult.success.push(...result.success);
      combinedResult.failed.push(...result.failed);

      if (result.success.length > 0) {
        setCollection(prev => ({
          ...prev,
          sections,
          poems,
          updatedAt: new Date().toISOString(),
        }));
      }
    }

    // Process regular markdown files
    if (mdFiles.length > 0) {
      const result = await processUploadedFiles(mdFiles);
      combinedResult.success.push(...result.success);
      combinedResult.failed.push(...result.failed);

      if (result.success.length > 0) {
        setCollection(prev => {
          const maxOrder = Math.max(0, ...prev.poems.map(p => p.order));
          const newPoems = result.success.map((poem, index) => ({
            ...poem,
            order: maxOrder + 1 + index,
          }));
          return {
            ...prev,
            poems: [...prev.poems, ...newPoems],
            updatedAt: new Date().toISOString(),
          };
        });
      }
    }

    return combinedResult;
  }, [collection]);

  // ============ REORDERING OPERATIONS ============

  const movePoemToSection = useCallback((poemId: string, sectionId: string | null) => {
    setCollection(prev => {
      const poemsInTarget = prev.poems.filter(p => p.sectionId === sectionId);
      const maxOrder = Math.max(0, ...poemsInTarget.map(p => p.order));

      return {
        ...prev,
        poems: prev.poems.map(p =>
          p.id === poemId
            ? { ...p, sectionId, order: maxOrder + 1, updatedAt: new Date().toISOString() }
            : p
        ),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const reorderPoem = useCallback((poemId: string, newOrder: number, sectionId: string | null) => {
    setCollection(prev => {
      const poemsInSection = prev.poems
        .filter(p => p.sectionId === sectionId)
        .sort((a, b) => a.order - b.order);

      const poem = poemsInSection.find(p => p.id === poemId);
      if (!poem) return prev;

      // Remove poem and reinsert at new position
      const without = poemsInSection.filter(p => p.id !== poemId);
      without.splice(newOrder, 0, poem);

      // Reassign order numbers
      const reordered = without.map((p, idx) => ({
        ...p,
        order: idx,
        ...(p.id === poemId ? { updatedAt: new Date().toISOString() } : {}),
      }));

      // Merge back with poems from other sections
      const otherPoems = prev.poems.filter(p => p.sectionId !== sectionId);

      return {
        ...prev,
        poems: [...otherPoems, ...reordered],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const reorderSection = useCallback((sectionId: string, newOrder: number) => {
    setCollection(prev => {
      const section = prev.sections.find(s => s.id === sectionId);
      if (!section) return prev;

      const siblingSections = prev.sections
        .filter(s => s.parentId === section.parentId)
        .sort((a, b) => a.order - b.order);

      // Remove and reinsert
      const without = siblingSections.filter(s => s.id !== sectionId);
      without.splice(newOrder, 0, section);

      // Reassign order numbers
      const reordered = without.map((s, idx) => ({ ...s, order: idx }));

      // Merge back with other sections
      const otherSections = prev.sections.filter(s => s.parentId !== section.parentId);

      return {
        ...prev,
        sections: [...otherSections, ...reordered],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  // ============ TREE BUILDING ============

  const buildTree = useCallback((): TreeNode[] => {
    const nodes: TreeNode[] = [];

    // Helper to build tree recursively
    const buildLevel = (parentId: string | null, depth: number) => {
      // Get sections at this level
      const sections = collection.sections
        .filter(s => s.parentId === parentId)
        .sort((a, b) => a.order - b.order);

      for (const section of sections) {
        nodes.push({
          type: 'section',
          id: section.id,
          name: section.name,
          depth,
          parentId: section.parentId,
          data: section,
        });

        // If expanded, add children
        if (section.isExpanded) {
          // Add poems in this section
          const sectionPoems = collection.poems
            .filter(p => p.sectionId === section.id)
            .sort((a, b) => a.order - b.order);

          for (const poem of sectionPoems) {
            nodes.push({
              type: 'poem',
              id: poem.id,
              name: poem.title,
              depth: depth + 1,
              parentId: section.id,
              data: poem,
            });
          }

          // Recurse for child sections
          buildLevel(section.id, depth + 1);
        }
      }
    };

    // Start with root level
    // Add root-level poems first
    const rootPoems = collection.poems
      .filter(p => p.sectionId === null)
      .sort((a, b) => a.order - b.order);

    for (const poem of rootPoems) {
      nodes.push({
        type: 'poem',
        id: poem.id,
        name: poem.title,
        depth: 0,
        parentId: null,
        data: poem,
      });
    }

    // Then add sections (and their contents)
    buildLevel(null, 0);

    return nodes;
  }, [collection]);

  // ============ UTILITY ============

  const resetCollection = useCallback(() => {
    const empty = createEmptyCollection();
    setCollection(empty);
    saveCollection(empty);
  }, []);

  const getPoemCount = useCallback((sectionId: string | null = null): number => {
    if (sectionId === null) {
      return collection.poems.length;
    }
    return collection.poems.filter(p => p.sectionId === sectionId).length;
  }, [collection.poems]);

  const exportCollection = useCallback(async () => {
    await downloadCollectionAsZip(collection);
  }, [collection]);

  return {
    collection,
    // Poem operations
    addPoem,
    updatePoem,
    deletePoem,
    getPoemById,
    // Section operations
    addSection,
    updateSection,
    deleteSection,
    toggleSectionExpanded,
    // Import
    importFiles,
    // Export
    exportCollection,
    // Reordering
    movePoemToSection,
    reorderPoem,
    reorderSection,
    // Tree
    buildTree,
    // Utility
    resetCollection,
    getPoemCount,
  };
}
