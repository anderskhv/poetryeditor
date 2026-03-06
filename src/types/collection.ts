// Poetry Collection Manager Types

export type PoemStatus = 'draft' | 'edit' | 'done';

export interface CollectionPoem {
  id: string;
  title: string;           // From # heading or filename
  content: string;         // Poem text (without title line)
  sourceFilename?: string; // Original filename if uploaded
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
  sectionId: string | null; // null = root level
  order: number;           // Position for drag-drop sorting
  status?: PoemStatus;     // draft → edit → done (default: draft)
}

export interface CollectionSection {
  id: string;
  name: string;
  parentId: string | null; // null = top-level section
  order: number;           // Position among siblings
  isExpanded: boolean;     // UI state for tree collapse/expand
}

export interface PoetryCollection {
  id: string;
  name: string;
  poems: CollectionPoem[];
  sections: CollectionSection[];
  createdAt: string;
  updatedAt: string;
}

// For file upload results
export interface UploadResult {
  success: CollectionPoem[];
  failed: Array<{ filename: string; error: string }>;
}

// For tree rendering - flattened node
export interface TreeNode {
  type: 'section' | 'poem';
  id: string;
  name: string;
  depth: number;
  parentId: string | null;
  data: CollectionPoem | CollectionSection;
}
