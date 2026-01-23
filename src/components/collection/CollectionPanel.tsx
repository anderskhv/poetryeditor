import { useRef, useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CollectionPoem, CollectionSection, TreeNode } from '../../types/collection';
import './CollectionPanel.css';

interface CollectionPanelProps {
  isOpen: boolean;
  treeNodes: TreeNode[];
  currentPoemId: string | null;
  onPoemSelect: (poem: CollectionPoem) => void;
  onSectionToggle: (sectionId: string) => void;
  onImportFiles: (files: FileList) => Promise<void>;
  onAddSection: (name: string, parentId: string | null) => void;
  onRenameSection: (id: string, name: string) => void;
  onDeleteSection: (id: string) => void;
  onDeletePoem: (id: string) => void;
  onReorderPoem?: (poemId: string, newOrder: number, sectionId: string | null) => void;
  onMovePoemToSection?: (poemId: string, sectionId: string | null) => void;
  onExportAll?: () => Promise<void>;
  onClose: () => void;
  isDarkMode: boolean;
}

// Sortable tree node component
interface SortableNodeProps {
  node: TreeNode;
  currentPoemId: string | null;
  editingSection: string | null;
  editingName: string;
  onPoemSelect: (poem: CollectionPoem) => void;
  onSectionToggle: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onDeletePoem: (poemId: string) => void;
  onStartRename: (section: CollectionSection) => void;
  onFinishRename: () => void;
  onEditingNameChange: (name: string) => void;
  onCancelEdit: () => void;
}

function SortableTreeNode({
  node,
  currentPoemId,
  editingSection,
  editingName,
  onPoemSelect,
  onSectionToggle,
  onDeleteSection,
  onDeletePoem,
  onStartRename,
  onFinishRename,
  onEditingNameChange,
  onCancelEdit,
}: SortableNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const indent = node.depth * 16;

  if (node.type === 'section') {
    const section = node.data as CollectionSection;
    const isEditing = editingSection === section.id;

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="tree-node tree-section"
      >
        <div
          className="tree-node-content"
          style={{ paddingLeft: `${indent + 8}px` }}
        >
          <span
            className="drag-handle"
            {...attributes}
            {...listeners}
          >
            ⋮⋮
          </span>
          <span
            className={`collapse-icon ${section.isExpanded ? 'expanded' : ''}`}
            onClick={() => onSectionToggle(section.id)}
          >
            ▸
          </span>
          {isEditing ? (
            <input
              type="text"
              className="rename-input"
              value={editingName}
              onChange={(e) => onEditingNameChange(e.target.value)}
              onBlur={onFinishRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onFinishRename();
                if (e.key === 'Escape') onCancelEdit();
              }}
              autoFocus
            />
          ) : (
            <>
              <span
                className="tree-node-name section-name"
                onDoubleClick={() => onStartRename(section)}
              >
                {section.name}
              </span>
              <div className="tree-node-actions">
                <button
                  className="tree-action-btn"
                  onClick={() => onStartRename(section)}
                  title="Rename"
                >
                  ✏️
                </button>
                <button
                  className="tree-action-btn delete"
                  onClick={() => onDeleteSection(section.id)}
                  title="Delete section"
                >
                  ×
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Poem node
  const poem = node.data as CollectionPoem;
  const isActive = poem.id === currentPoemId;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`tree-node tree-poem ${isActive ? 'active' : ''}`}
      onClick={() => onPoemSelect(poem)}
    >
      <div
        className="tree-node-content"
        style={{ paddingLeft: `${indent + 8}px` }}
      >
        <span
          className="drag-handle"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          ⋮⋮
        </span>
        <span className="tree-poem-icon">📄</span>
        <span className="tree-node-name poem-name">{poem.title}</span>
        <div className="tree-node-actions">
          <button
            className="tree-action-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              onDeletePoem(poem.id);
            }}
            title="Delete poem"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export function CollectionPanel({
  isOpen,
  treeNodes,
  currentPoemId,
  onPoemSelect,
  onSectionToggle,
  onImportFiles,
  onAddSection,
  onRenameSection,
  onDeleteSection,
  onDeletePoem,
  onReorderPoem,
  onMovePoemToSection,
  onExportAll,
  onClose,
  isDarkMode,
}: CollectionPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showNewSectionInput, setShowNewSectionInput] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await onImportFiles(files);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [onImportFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await onImportFiles(files);
    }
  }, [onImportFiles]);

  const handleStartRename = useCallback((section: CollectionSection) => {
    setEditingSection(section.id);
    setEditingName(section.name);
  }, []);

  const handleFinishRename = useCallback(() => {
    if (editingSection && editingName.trim()) {
      onRenameSection(editingSection, editingName.trim());
    }
    setEditingSection(null);
    setEditingName('');
  }, [editingSection, editingName, onRenameSection]);

  const handleAddSection = useCallback(() => {
    if (newSectionName.trim()) {
      onAddSection(newSectionName.trim(), null);
      setNewSectionName('');
      setShowNewSectionInput(false);
    }
  }, [newSectionName, onAddSection]);

  const handleCancelEdit = useCallback(() => {
    setEditingSection(null);
    setEditingName('');
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeNode = treeNodes.find(n => n.id === active.id);
    const overNode = treeNodes.find(n => n.id === over.id);

    if (!activeNode || !overNode) return;

    // Only handle poem reordering for now
    if (activeNode.type === 'poem' && onReorderPoem) {
      const poem = activeNode.data as CollectionPoem;

      // If dropping on a section, move the poem to that section
      if (overNode.type === 'section' && onMovePoemToSection) {
        onMovePoemToSection(poem.id, overNode.id);
      } else if (overNode.type === 'poem') {
        // Reorder within the same section
        const targetPoem = overNode.data as CollectionPoem;
        const poemsInSection = treeNodes
          .filter(n => n.type === 'poem' && (n.data as CollectionPoem).sectionId === poem.sectionId);
        const newIndex = poemsInSection.findIndex(n => n.id === over.id);

        if (newIndex !== -1) {
          onReorderPoem(poem.id, newIndex, targetPoem.sectionId);
        }
      }
    }
  }, [treeNodes, onReorderPoem, onMovePoemToSection]);

  const renderNode = (node: TreeNode) => {
    const indent = node.depth * 16;

    if (node.type === 'section') {
      const section = node.data as CollectionSection;
      const isEditing = editingSection === section.id;

      return (
        <div key={node.id} className="tree-node tree-section">
          <div
            className="tree-node-content"
            style={{ paddingLeft: `${indent + 8}px` }}
          >
            <span
              className={`collapse-icon ${section.isExpanded ? 'expanded' : ''}`}
              onClick={() => onSectionToggle(section.id)}
            >
              ▸
            </span>
            {isEditing ? (
              <input
                type="text"
                className="rename-input"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={handleFinishRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFinishRename();
                  if (e.key === 'Escape') {
                    setEditingSection(null);
                    setEditingName('');
                  }
                }}
                autoFocus
              />
            ) : (
              <>
                <span
                  className="tree-node-name section-name"
                  onDoubleClick={() => handleStartRename(section)}
                >
                  {section.name}
                </span>
                <div className="tree-node-actions">
                  <button
                    className="tree-action-btn"
                    onClick={() => handleStartRename(section)}
                    title="Rename"
                  >
                    ✏️
                  </button>
                  <button
                    className="tree-action-btn delete"
                    onClick={() => onDeleteSection(section.id)}
                    title="Delete section"
                  >
                    ×
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    // Poem node
    const poem = node.data as CollectionPoem;
    const isActive = poem.id === currentPoemId;

    return (
      <div
        key={node.id}
        className={`tree-node tree-poem ${isActive ? 'active' : ''}`}
        onClick={() => onPoemSelect(poem)}
      >
        <div
          className="tree-node-content"
          style={{ paddingLeft: `${indent + 24}px` }}
        >
          <span className="tree-poem-icon">📄</span>
          <span className="tree-node-name poem-name">{poem.title}</span>
          <div className="tree-node-actions">
            <button
              className="tree-action-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                onDeletePoem(poem.id);
              }}
              title="Delete poem"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={`collection-panel ${isDarkMode ? 'dark' : ''}`}>
      <div className="collection-header">
        <h3>Collection</h3>
        <button className="close-btn" onClick={onClose} title="Close panel">
          ×
        </button>
      </div>

      <div className="collection-toolbar">
        <button className="toolbar-btn" onClick={handleFileSelect} title="Import .md files">
          <span>📥</span> Import
        </button>
        {onExportAll && treeNodes.length > 0 && (
          <button className="toolbar-btn" onClick={onExportAll} title="Export all as ZIP">
            <span>📤</span> Export
          </button>
        )}
        <button
          className="toolbar-btn"
          onClick={() => setShowNewSectionInput(true)}
          title="New section"
        >
          <span>📁</span> New Section
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".md,.zip,application/zip"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {showNewSectionInput && (
        <div className="new-section-input">
          <input
            type="text"
            placeholder="Section name..."
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSection();
              if (e.key === 'Escape') {
                setShowNewSectionInput(false);
                setNewSectionName('');
              }
            }}
            autoFocus
          />
          <button onClick={handleAddSection}>Add</button>
          <button onClick={() => {
            setShowNewSectionInput(false);
            setNewSectionName('');
          }}>Cancel</button>
        </div>
      )}

      <div
        className={`collection-tree ${isDraggingOver ? 'dragging-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {treeNodes.length === 0 ? (
          <div className="empty-state">
            <p>No poems yet</p>
            <p className="hint">Drop .md or .zip files here, or click Import</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={treeNodes.map(n => n.id)}
              strategy={verticalListSortingStrategy}
            >
              {treeNodes.map(node => (
                <SortableTreeNode
                  key={node.id}
                  node={node}
                  currentPoemId={currentPoemId}
                  editingSection={editingSection}
                  editingName={editingName}
                  onPoemSelect={onPoemSelect}
                  onSectionToggle={onSectionToggle}
                  onDeleteSection={onDeleteSection}
                  onDeletePoem={onDeletePoem}
                  onStartRename={handleStartRename}
                  onFinishRename={handleFinishRename}
                  onEditingNameChange={setEditingName}
                  onCancelEdit={handleCancelEdit}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {isDraggingOver && (
          <div className="drop-overlay">
            <span>Drop files to import (.md or .zip)</span>
          </div>
        )}
      </div>
    </div>
  );
}
