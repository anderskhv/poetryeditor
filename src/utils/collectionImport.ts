import JSZip from 'jszip';
import { CollectionPoem, CollectionSection, PoetryCollection, UploadResult } from '../types/collection';
import { extractPoemTitle, generateId } from './markdownUtils';

/**
 * Extract order number from filename (e.g., "1.poem.md" -> 1, "2-sonnet.md" -> 2)
 * Returns 0 if no order number found
 */
function extractOrderNumber(filename: string): number {
  // Match patterns like "1.name.md", "01-name.md", "1_name.md", "1name.md"
  const match = filename.match(/^(\d+)[.\-_]?/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 0;
}

/**
 * Clean the display name from a filename by removing order prefix
 */
function cleanDisplayName(filename: string): string {
  // Remove .md extension
  let name = filename.replace(/\.md$/i, '');
  // Remove leading number and separator
  name = name.replace(/^\d+[.\-_]?\s*/, '');
  // Clean up underscores and hyphens to spaces
  name = name.replace(/[-_]/g, ' ').trim();
  // Capitalize first letter
  if (name.length > 0) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }
  return name || 'Untitled';
}

interface FolderNode {
  name: string;
  order: number;
  path: string;
  files: Array<{
    name: string;
    order: number;
    content: string;
  }>;
  children: Map<string, FolderNode>;
}

/**
 * Parse the ZIP file structure into a folder tree
 */
async function parseZipStructure(zip: JSZip): Promise<FolderNode> {
  const root: FolderNode = {
    name: '',
    order: 0,
    path: '',
    files: [],
    children: new Map(),
  };

  const entries: Array<{ path: string; content: string }> = [];

  // Collect all markdown files with their content
  const promises: Promise<void>[] = [];
  zip.forEach((relativePath, file) => {
    if (!file.dir && relativePath.toLowerCase().endsWith('.md')) {
      promises.push(
        file.async('string').then((content) => {
          entries.push({ path: relativePath, content });
        })
      );
    }
  });
  await Promise.all(promises);

  // Build the folder tree
  for (const entry of entries) {
    const parts = entry.path.split('/').filter(Boolean);
    const filename = parts.pop()!;

    // Navigate to the correct folder
    let currentNode = root;
    for (const folderName of parts) {
      if (!currentNode.children.has(folderName)) {
        const order = extractOrderNumber(folderName);
        const cleanName = cleanDisplayName(folderName);
        currentNode.children.set(folderName, {
          name: cleanName,
          order,
          path: currentNode.path ? `${currentNode.path}/${folderName}` : folderName,
          files: [],
          children: new Map(),
        });
      }
      currentNode = currentNode.children.get(folderName)!;
    }

    // Add the file to the current folder
    currentNode.files.push({
      name: filename,
      order: extractOrderNumber(filename),
      content: entry.content,
    });
  }

  return root;
}

/**
 * Convert folder tree to sections and poems
 */
function convertTreeToCollection(
  root: FolderNode,
  existingSections: CollectionSection[] = [],
  existingPoems: CollectionPoem[] = []
): { sections: CollectionSection[]; poems: CollectionPoem[] } {
  const sections: CollectionSection[] = [...existingSections];
  const poems: CollectionPoem[] = [...existingPoems];

  // Get the next order number for sections and poems
  let nextSectionOrder = Math.max(0, ...sections.map(s => s.order)) + 1;
  let nextPoemOrder = Math.max(0, ...poems.map(p => p.order)) + 1;

  function processFolderNode(
    node: FolderNode,
    parentId: string | null,
    depth: number = 0
  ): void {
    // Sort children by order number, then alphabetically
    const sortedChildren = Array.from(node.children.values()).sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name);
    });

    // Sort files by order number, then alphabetically
    const sortedFiles = [...node.files].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name);
    });

    // Create poems for files in this folder
    for (const file of sortedFiles) {
      const { title, body } = extractPoemTitle(file.content, file.name);
      poems.push({
        id: generateId('poem'),
        title: title || cleanDisplayName(file.name),
        content: body,
        sourceFilename: file.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sectionId: parentId,
        order: nextPoemOrder++,
      });
    }

    // Create sections for child folders
    for (const child of sortedChildren) {
      const sectionId = generateId('section');
      sections.push({
        id: sectionId,
        name: child.name,
        parentId: parentId,
        order: nextSectionOrder++,
        isExpanded: true,
      });

      // Recursively process child folder
      processFolderNode(child, sectionId, depth + 1);
    }
  }

  // Process root-level items (files go to root, folders become sections)
  processFolderNode(root, null);

  return { sections, poems };
}

/**
 * Import a ZIP file into the collection
 */
export async function importZipFile(
  file: File,
  existingCollection?: PoetryCollection
): Promise<{
  result: UploadResult;
  sections: CollectionSection[];
  poems: CollectionPoem[];
}> {
  const result: UploadResult = { success: [], failed: [] };

  try {
    // Load the ZIP file
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Check if it's actually a ZIP file with content
    const fileCount = Object.keys(zip.files).length;
    if (fileCount === 0) {
      result.failed.push({
        filename: file.name,
        error: 'ZIP file is empty',
      });
      return {
        result,
        sections: existingCollection?.sections || [],
        poems: existingCollection?.poems || []
      };
    }

    // Parse the ZIP structure
    const root = await parseZipStructure(zip);

    // Convert to collection format
    const { sections, poems } = convertTreeToCollection(
      root,
      existingCollection?.sections || [],
      existingCollection?.poems || []
    );

    // Count how many new poems were added
    const newPoemCount = poems.length - (existingCollection?.poems.length || 0);
    const newSectionCount = sections.length - (existingCollection?.sections.length || 0);

    // Create dummy success entries for counting
    for (let i = 0; i < newPoemCount; i++) {
      const poem = poems[poems.length - newPoemCount + i];
      result.success.push(poem);
    }

    return { result, sections, poems };
  } catch (error) {
    result.failed.push({
      filename: file.name,
      error: error instanceof Error ? error.message : 'Failed to read ZIP file',
    });
    return {
      result,
      sections: existingCollection?.sections || [],
      poems: existingCollection?.poems || []
    };
  }
}

/**
 * Check if a file is a ZIP file
 */
export function isZipFile(file: File): boolean {
  return (
    file.type === 'application/zip' ||
    file.type === 'application/x-zip-compressed' ||
    file.name.toLowerCase().endsWith('.zip')
  );
}
