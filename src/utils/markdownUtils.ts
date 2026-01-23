import { CollectionPoem, UploadResult } from '../types/collection';

/**
 * Extract title from markdown content.
 * Priority: 1. First # heading, 2. Filename (without .md), 3. "Untitled"
 */
export function extractPoemTitle(content: string, filename?: string): { title: string; body: string } {
  // Match first H1 heading: # Title (at start of line)
  const h1Match = content.match(/^#\s+(.+)$/m);

  if (h1Match) {
    const title = h1Match[1].trim();
    // Remove the title line from body
    const body = content.replace(/^#\s+.+\n?/, '').trim();
    return { title, body };
  }

  // Fallback to filename
  if (filename) {
    const title = filename
      .replace(/\.md$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    // Capitalize first letter
    const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);
    return { title: capitalizedTitle, body: content.trim() };
  }

  return { title: 'Untitled', body: content.trim() };
}

/**
 * Generate a unique ID for poems/sections
 */
export function generateId(prefix: string = 'item'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Process a single uploaded file into a CollectionPoem
 */
export async function processMarkdownFile(file: File): Promise<CollectionPoem> {
  const content = await file.text();
  const { title, body } = extractPoemTitle(content, file.name);

  return {
    id: generateId('poem'),
    title,
    content: body,
    sourceFilename: file.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sectionId: null,
    order: Date.now(), // Will be adjusted after adding to collection
  };
}

/**
 * Process multiple uploaded files
 */
export async function processUploadedFiles(files: FileList | File[]): Promise<UploadResult> {
  const results: UploadResult = { success: [], failed: [] };
  const fileArray = Array.from(files);

  for (const file of fileArray) {
    // Check if it's a markdown file
    if (!file.name.toLowerCase().endsWith('.md')) {
      results.failed.push({
        filename: file.name,
        error: 'Not a markdown file (.md)',
      });
      continue;
    }

    try {
      const poem = await processMarkdownFile(file);
      results.success.push(poem);
    } catch (error) {
      results.failed.push({
        filename: file.name,
        error: error instanceof Error ? error.message : 'Failed to read file',
      });
    }
  }

  // Assign sequential order numbers to successful imports
  results.success.forEach((poem, index) => {
    poem.order = index;
  });

  return results;
}

/**
 * Validate that content looks like a poem (basic heuristics)
 */
export function validatePoemContent(content: string): { valid: boolean; warning?: string } {
  const trimmed = content.trim();

  if (!trimmed) {
    return { valid: false, warning: 'File is empty' };
  }

  if (trimmed.length < 10) {
    return { valid: true, warning: 'Very short content' };
  }

  // Check if it looks like code (too many special characters)
  const codeIndicators = ['{', '}', '=>', 'function', 'const ', 'import ', 'export '];
  const hasCodeIndicators = codeIndicators.some(indicator => trimmed.includes(indicator));
  if (hasCodeIndicators) {
    return { valid: true, warning: 'Content may be code, not poetry' };
  }

  return { valid: true };
}
