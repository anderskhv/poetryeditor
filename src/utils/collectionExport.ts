import JSZip from 'jszip';
import { PoetryCollection, CollectionPoem, CollectionSection } from '../types/collection';

/**
 * Generate a safe filename from a title
 */
function sanitizeFilename(title: string): string {
  return title
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .slice(0, 100) // Limit length
    || 'untitled';
}

/**
 * Build a map of section IDs to their full folder paths
 */
function buildSectionPaths(
  sections: CollectionSection[]
): Map<string, string> {
  const paths = new Map<string, string>();

  // Helper to get full path for a section
  const getPath = (sectionId: string): string => {
    if (paths.has(sectionId)) {
      return paths.get(sectionId)!;
    }

    const section = sections.find(s => s.id === sectionId);
    if (!section) return '';

    const folderName = sanitizeFilename(section.name);

    if (section.parentId === null) {
      paths.set(sectionId, folderName);
      return folderName;
    }

    const parentPath = getPath(section.parentId);
    const fullPath = parentPath ? `${parentPath}/${folderName}` : folderName;
    paths.set(sectionId, fullPath);
    return fullPath;
  };

  // Build paths for all sections
  for (const section of sections) {
    getPath(section.id);
  }

  return paths;
}

/**
 * Generate markdown content for a poem
 * Includes the title as an H1 heading
 */
function generatePoemMarkdown(poem: CollectionPoem): string {
  return `# ${poem.title}\n\n${poem.content}`;
}

/**
 * Export entire collection as a ZIP file
 */
export async function exportCollectionAsZip(
  collection: PoetryCollection
): Promise<Blob> {
  const zip = new JSZip();
  const sectionPaths = buildSectionPaths(collection.sections);

  // Track used filenames to avoid duplicates
  const usedFilenames = new Map<string, number>();

  for (const poem of collection.poems) {
    // Determine folder path
    const folderPath = poem.sectionId
      ? sectionPaths.get(poem.sectionId) || ''
      : '';

    // Generate filename
    const baseFilename = sanitizeFilename(poem.title);
    const fullBasePath = folderPath ? `${folderPath}/${baseFilename}` : baseFilename;

    // Handle duplicates by adding a number suffix
    const count = usedFilenames.get(fullBasePath) || 0;
    usedFilenames.set(fullBasePath, count + 1);

    const filename = count > 0
      ? `${baseFilename}-${count}.md`
      : `${baseFilename}.md`;

    const fullPath = folderPath ? `${folderPath}/${filename}` : filename;

    // Add file to ZIP
    const content = generatePoemMarkdown(poem);
    zip.file(fullPath, content);
  }

  // Generate ZIP blob
  return zip.generateAsync({ type: 'blob' });
}

/**
 * Trigger download of the ZIP file
 */
export async function downloadCollectionAsZip(
  collection: PoetryCollection
): Promise<void> {
  const blob = await exportCollectionAsZip(collection);

  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(collection.name)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
