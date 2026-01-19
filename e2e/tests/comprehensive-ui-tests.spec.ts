/**
 * Comprehensive UI/UX Tests for Poetry Editor
 *
 * These tests thoroughly examine every aspect of the poetry editor,
 * including functionality, usability, edge cases, and potential improvements.
 */

import { test, expect, Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import {
  ALL_TEST_POEMS,
  getPoemsByCategory,
  getRandomPoem,
  GeneratedPoem,
  HAIKU_POEMS,
  SONNET_POEMS,
  EDGE_CASE_POEMS,
  PERFORMANCE_POEMS,
} from '../utils/poemGenerator';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

// Timeouts
const ANALYSIS_WAIT = 2000;  // Wait for analysis to complete
const LONG_ANALYSIS_WAIT = 5000;  // For longer poems
const ANIMATION_WAIT = 500;  // Wait for animations

// Issue tracking
interface TestIssue {
  severity: 'critical' | 'major' | 'minor' | 'improvement';
  category: 'bug' | 'ux' | 'performance' | 'accessibility' | 'feature';
  title: string;
  description: string;
  steps?: string[];
  expected?: string;
  actual?: string;
  screenshot?: string;
}

// Persistent issue tracking
const ISSUES_FILE = path.join(process.cwd(), 'test-reports/ui-ux-issues.json');

function loadIssues(): TestIssue[] {
  try {
    if (fs.existsSync(ISSUES_FILE)) {
      const data = JSON.parse(fs.readFileSync(ISSUES_FILE, 'utf-8'));
      return data.issues || [];
    }
  } catch {}
  return [];
}

function saveIssues(issues: TestIssue[]) {
  fs.mkdirSync(path.dirname(ISSUES_FILE), { recursive: true });

  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const majorIssues = issues.filter(i => i.severity === 'major');
  const minorIssues = issues.filter(i => i.severity === 'minor');
  const improvements = issues.filter(i => i.severity === 'improvement');

  fs.writeFileSync(ISSUES_FILE, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalIssues: issues.length,
    summary: {
      critical: criticalIssues.length,
      major: majorIssues.length,
      minor: minorIssues.length,
      improvements: improvements.length,
    },
    issues: issues,
  }, null, 2));
}

// Use a Set to track unique issues by title
const seenIssueTitles = new Set<string>();
const discoveredIssues: TestIssue[] = loadIssues();

// Restore seen titles from loaded issues
discoveredIssues.forEach(i => seenIssueTitles.add(i.title));

function reportIssue(issue: TestIssue) {
  // Avoid duplicates
  if (seenIssueTitles.has(issue.title)) return;

  seenIssueTitles.add(issue.title);
  discoveredIssues.push(issue);
  saveIssues(discoveredIssues);
  console.log(`[${issue.severity.toUpperCase()}] ${issue.category}: ${issue.title}`);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getEditorContent(page: Page): Promise<string> {
  // Monaco editor stores content in a specific way
  return await page.evaluate(() => {
    const editor = (window as any).monaco?.editor?.getModels()?.[0];
    return editor?.getValue() || '';
  });
}

async function setEditorContent(page: Page, content: string): Promise<void> {
  // Clear and set content in Monaco editor
  await page.click('.monaco-editor');
  await page.keyboard.press('Meta+a'); // Select all
  await page.keyboard.press('Backspace');

  // For large content, use clipboard paste instead of typing
  if (content.length > 500) {
    await page.evaluate((text) => {
      const editor = (window as any).monaco?.editor?.getModels()?.[0];
      if (editor) {
        editor.setValue(text);
      }
    }, content);
  } else {
    await page.keyboard.type(content, { delay: 5 });
  }
}

async function waitForAnalysis(page: Page, timeout = ANALYSIS_WAIT): Promise<void> {
  await page.waitForTimeout(timeout);
}

async function isElementVisible(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector);
    return await element.isVisible();
  } catch {
    return false;
  }
}

async function countElements(page: Page, selector: string): Promise<number> {
  return await page.locator(selector).count();
}

async function captureScreenshot(page: Page, name: string): Promise<string> {
  const path = `test-reports/screenshots/${name}-${Date.now()}.png`;
  await page.screenshot({ path, fullPage: true });
  return path;
}

// ============================================================================
// TEST SUITE: APPLICATION LOADING
// ============================================================================

test.describe('Application Loading', () => {
  test('should load the application successfully', async ({ page }) => {
    await page.goto('/');

    // Check for main elements - use first() to avoid strict mode issues
    const header = page.locator('header').first();
    const editor = page.locator('.monaco-editor').first();

    if (!(await header.isVisible())) {
      reportIssue({
        severity: 'critical',
        category: 'bug',
        title: 'Header not visible on load',
        description: 'The application header is not visible when the page loads',
      });
    }

    await expect(editor).toBeVisible({ timeout: 10000 });
  });

  test('should display application title', async ({ page }) => {
    await page.goto('/');

    const title = await page.title();
    const headerText = await page.locator('header, .header').textContent();

    if (!title.toLowerCase().includes('poetry') && !headerText?.toLowerCase().includes('poetry')) {
      reportIssue({
        severity: 'minor',
        category: 'ux',
        title: 'Application branding unclear',
        description: 'The page title or header does not clearly indicate this is a poetry editor',
      });
    }
  });

  test('should have proper favicon', async ({ page }) => {
    await page.goto('/');

    const favicon = await page.locator('link[rel*="icon"]').getAttribute('href');
    if (!favicon) {
      reportIssue({
        severity: 'minor',
        category: 'ux',
        title: 'Missing favicon',
        description: 'The application does not have a favicon set',
      });
    }
  });

  test('should load without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await waitForAnalysis(page);

    if (consoleErrors.length > 0) {
      reportIssue({
        severity: 'major',
        category: 'bug',
        title: 'Console errors on page load',
        description: `Found ${consoleErrors.length} console errors: ${consoleErrors.slice(0, 3).join('; ')}`,
      });
    }
  });

  test('should load without network errors', async ({ page }) => {
    const networkErrors: string[] = [];

    page.on('requestfailed', request => {
      networkErrors.push(`${request.url()} - ${request.failure()?.errorText}`);
    });

    await page.goto('/');
    await waitForAnalysis(page);

    if (networkErrors.length > 0) {
      reportIssue({
        severity: 'major',
        category: 'bug',
        title: 'Network request failures',
        description: `Found ${networkErrors.length} failed requests`,
      });
    }
  });
});

// ============================================================================
// TEST SUITE: EDITOR FUNCTIONALITY
// ============================================================================

test.describe('Editor Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
  });

  test('should allow typing in editor', async ({ page }) => {
    const testText = 'Test line one\nTest line two';

    await page.click('.monaco-editor');
    await page.keyboard.type(testText);

    await waitForAnalysis(page);

    const content = await getEditorContent(page);
    if (!content.includes('Test line')) {
      reportIssue({
        severity: 'critical',
        category: 'bug',
        title: 'Editor does not accept input',
        description: 'Typed content does not appear in the editor',
      });
    }
  });

  test('should support copy/paste', async ({ page }) => {
    const poem = getRandomPoem();

    await page.click('.monaco-editor');
    await page.keyboard.type(poem.content.substring(0, 50));

    // Test select all and copy
    await page.keyboard.press('Meta+a');
    await page.keyboard.press('Meta+c');
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Meta+v');

    await waitForAnalysis(page);
  });

  test('should support undo/redo', async ({ page }) => {
    await page.click('.monaco-editor');
    await page.keyboard.type('First text');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Second text');

    // Undo
    await page.keyboard.press('Meta+z');
    await waitForAnalysis(page, 500);

    // Redo
    await page.keyboard.press('Meta+Shift+z');
    await waitForAnalysis(page, 500);
  });

  test('should preserve content on reload (auto-save)', async ({ page }) => {
    const uniqueText = `Unique poem ${Date.now()}`;

    await page.click('.monaco-editor');
    await page.keyboard.type(uniqueText);

    // Wait for debounced auto-save
    await page.waitForTimeout(1500);

    // Reload page
    await page.reload();
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
    await waitForAnalysis(page);

    const content = await getEditorContent(page);
    if (!content.includes(uniqueText)) {
      reportIssue({
        severity: 'major',
        category: 'bug',
        title: 'Auto-save not working',
        description: 'Content is not preserved after page reload',
      });
    }
  });

  test('should handle large text input', async ({ page }) => {
    const longPoem = PERFORMANCE_POEMS[PERFORMANCE_POEMS.length - 1];  // 200 lines

    await setEditorContent(page, longPoem.content);
    await waitForAnalysis(page, LONG_ANALYSIS_WAIT);

    // Check if UI is still responsive
    const startTime = Date.now();
    await page.click('.monaco-editor');
    await page.keyboard.type('X');
    const endTime = Date.now();

    if (endTime - startTime > 1000) {
      reportIssue({
        severity: 'major',
        category: 'performance',
        title: 'Editor sluggish with large text',
        description: `Typing latency of ${endTime - startTime}ms with ${longPoem.content.split('\n').length} lines`,
      });
    }
  });

  test('should handle rapid typing', async ({ page }) => {
    await page.click('.monaco-editor');

    // Type rapidly
    for (let i = 0; i < 10; i++) {
      await page.keyboard.type(`Line ${i} with some words `, { delay: 10 });
      await page.keyboard.press('Enter');
    }

    await waitForAnalysis(page);

    // Verify no crashes or freezes
    const isResponsive = await page.evaluate(() => document.readyState === 'complete');
    expect(isResponsive).toBe(true);
  });
});

// ============================================================================
// TEST SUITE: NEW POEM AND EXPORT BUTTONS
// ============================================================================

test.describe('Header Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
  });

  test('should have New Poem button visible', async ({ page }) => {
    const newPoemBtn = page.locator('button:has-text("New"), button:has-text("new"), [class*="new"]');

    if (!(await newPoemBtn.first().isVisible())) {
      reportIssue({
        severity: 'minor',
        category: 'ux',
        title: 'New Poem button not easily findable',
        description: 'The New Poem button should be prominently visible',
      });
    }
  });

  test('should clear editor on New Poem click', async ({ page }) => {
    // Add some content first
    await page.click('.monaco-editor');
    await page.keyboard.type('Some test content here');
    await waitForAnalysis(page);

    // Click New Poem
    const newPoemBtn = page.locator('button:has-text("New")').first();
    if (await newPoemBtn.isVisible()) {
      await newPoemBtn.click();
      await waitForAnalysis(page);

      const content = await getEditorContent(page);
      // Check if content was cleared or if confirmation was shown
    }
  });

  test('should have Export button visible', async ({ page }) => {
    const exportBtn = page.locator('button:has-text("Export"), button:has-text("export"), [class*="export"]');

    if (!(await exportBtn.first().isVisible())) {
      reportIssue({
        severity: 'minor',
        category: 'ux',
        title: 'Export button not easily findable',
        description: 'The Export button should be prominently visible',
      });
    }
  });

  test('should trigger download on Export click', async ({ page }) => {
    // Add content
    await page.click('.monaco-editor');
    await page.keyboard.type('Test poem for export');
    await waitForAnalysis(page);

    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

    // Click Export
    const exportBtn = page.locator('button:has-text("Export")').first();
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
    }

    const download = await downloadPromise;
    if (!download) {
      // Check if dialog appeared or other feedback
      reportIssue({
        severity: 'minor',
        category: 'ux',
        title: 'Export feedback unclear',
        description: 'Clicking Export should provide clear feedback or trigger download',
      });
    }
  });
});

// ============================================================================
// TEST SUITE: ANALYSIS PANEL
// ============================================================================

test.describe('Analysis Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
  });

  test('should display analysis panel', async ({ page }) => {
    const panel = page.locator('[class*="panel"], [class*="analysis"], [class*="sidebar"]').first();

    if (!(await panel.isVisible())) {
      reportIssue({
        severity: 'major',
        category: 'bug',
        title: 'Analysis panel not visible',
        description: 'The analysis panel should be visible by default',
      });
    }
  });

  test('should have all four tabs', async ({ page }) => {
    const expectedTabs = ['Rhythm', 'Rhymes', 'Language', 'Originality'];

    for (const tabName of expectedTabs) {
      // Use more specific selector for category tabs
      const tab = page.locator(`.category-tab:has-text("${tabName}")`).first();
      const isVisible = await tab.isVisible().catch(() => false);
      if (!isVisible) {
        reportIssue({
          severity: 'major',
          category: 'bug',
          title: `${tabName} tab missing`,
          description: `The ${tabName} tab is not visible in the analysis panel`,
        });
      }
    }
  });

  test('should switch between tabs', async ({ page }) => {
    const tabs = ['Rhythm', 'Rhymes', 'Language', 'Originality'];

    for (const tabName of tabs) {
      const tab = page.locator(`button:has-text("${tabName}")`).first();
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(ANIMATION_WAIT);

        // Verify tab content changes (look for tab-specific elements)
      }
    }
  });

  test('should toggle panel visibility', async ({ page }) => {
    const toggleBtn = page.locator('[class*="toggle"], button[aria-label*="panel"], [class*="collapse"]').first();

    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(ANIMATION_WAIT);

      // Check if panel collapsed
      await toggleBtn.click();
      await page.waitForTimeout(ANIMATION_WAIT);
    } else {
      reportIssue({
        severity: 'minor',
        category: 'ux',
        title: 'Panel toggle not easily accessible',
        description: 'The panel toggle button should be clearly visible',
      });
    }
  });
});

// ============================================================================
// TEST SUITE: POEM FORM DETECTION
// ============================================================================

test.describe('Form Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
  });

  for (const poem of HAIKU_POEMS.slice(0, 2)) {
    test(`should detect haiku: ${poem.title}`, async ({ page }) => {
      await setEditorContent(page, poem.content);
      await waitForAnalysis(page, LONG_ANALYSIS_WAIT);

      // Look for form detection in Originality tab
      const originalityTab = page.locator('button:has-text("Originality")').first();
      if (await originalityTab.isVisible()) {
        await originalityTab.click();
        await page.waitForTimeout(ANIMATION_WAIT);
      }

      // Get the full page text to check for haiku detection
      const pageText = await page.locator('body').textContent({ timeout: 5000 }).catch(() => '');

      if (!pageText?.toLowerCase().includes('haiku')) {
        reportIssue({
          severity: 'major',
          category: 'bug',
          title: `Haiku not detected: ${poem.title}`,
          description: `Expected haiku detection for poem with 5-7-5 pattern`,
          expected: 'Haiku',
          actual: 'Form not detected',
        });
      }
    });
  }

  for (const poem of SONNET_POEMS.slice(0, 1)) {
    test(`should detect sonnet: ${poem.title}`, async ({ page }) => {
      await setEditorContent(page, poem.content);
      await waitForAnalysis(page, LONG_ANALYSIS_WAIT);

      const originalityTab = page.locator('button:has-text("Originality")').first();
      if (await originalityTab.isVisible()) {
        await originalityTab.click();
        await page.waitForTimeout(ANIMATION_WAIT);
      }

      const pageText = await page.locator('body').textContent();

      if (!pageText?.toLowerCase().includes('sonnet')) {
        reportIssue({
          severity: 'major',
          category: 'bug',
          title: `Sonnet not detected: ${poem.title}`,
          description: `Expected sonnet detection for 14-line poem with proper rhyme scheme`,
        });
      }
    });
  }
});

// ============================================================================
// TEST SUITE: RHYTHM ANALYSIS
// ============================================================================

test.describe('Rhythm Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
  });

  test('should display syllable counts', async ({ page }) => {
    const poem = HAIKU_POEMS[0];
    await setEditorContent(page, poem.content);
    await waitForAnalysis(page);

    const rhythmTab = page.locator('button:has-text("Rhythm")').first();
    if (await rhythmTab.isVisible()) {
      await rhythmTab.click();
      await page.waitForTimeout(ANIMATION_WAIT);
    }

    // Look for syllable-related content
    const pageText = await page.locator('body').textContent();
    if (!pageText?.toLowerCase().includes('syllable')) {
      reportIssue({
        severity: 'major',
        category: 'bug',
        title: 'Syllable analysis not displayed',
        description: 'The rhythm tab should show syllable analysis',
      });
    }
  });

  test('should display scansion patterns', async ({ page }) => {
    const poem = SONNET_POEMS[0];
    await setEditorContent(page, poem.content);
    await waitForAnalysis(page, LONG_ANALYSIS_WAIT);

    const rhythmTab = page.locator('button:has-text("Rhythm")').first();
    if (await rhythmTab.isVisible()) {
      await rhythmTab.click();
      await page.waitForTimeout(ANIMATION_WAIT);
    }

    // Look for scansion symbols (/ and u) or "iamb" terminology
    const pageText = await page.locator('body').textContent();
    if (!pageText?.includes('/') && !pageText?.toLowerCase().includes('stress')) {
      reportIssue({
        severity: 'minor',
        category: 'ux',
        title: 'Scansion not clearly displayed',
        description: 'Stress patterns should be visually clear in the analysis',
      });
    }
  });

  test('should detect meter type', async ({ page }) => {
    const poem = SONNET_POEMS[0];
    await setEditorContent(page, poem.content);
    await waitForAnalysis(page, LONG_ANALYSIS_WAIT);

    const pageText = await page.locator('body').textContent();

    if (!pageText?.toLowerCase().includes('iambic') && !pageText?.toLowerCase().includes('pentameter')) {
      reportIssue({
        severity: 'major',
        category: 'bug',
        title: 'Meter type not detected',
        description: 'Should detect iambic pentameter in Shakespeare sonnet',
      });
    }
  });
});

// ============================================================================
// TEST SUITE: RHYME ANALYSIS
// ============================================================================

test.describe('Rhyme Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
  });

  test('should detect rhyme scheme', async ({ page }) => {
    const poem = `The cat sat on the mat
The dog ran through the fog
A bird flew to the tree
As happy as can be`;

    await setEditorContent(page, poem);
    await waitForAnalysis(page);

    const rhymesTab = page.locator('button:has-text("Rhymes")').first();
    if (await rhymesTab.isVisible()) {
      await rhymesTab.click();
      await page.waitForTimeout(ANIMATION_WAIT);
    }

    // Look for rhyme scheme display (ABAB, etc.)
    const pageText = await page.locator('body').textContent();
    if (!pageText?.match(/[A-Z]{2,}/)) {
      reportIssue({
        severity: 'major',
        category: 'bug',
        title: 'Rhyme scheme not displayed',
        description: 'Should show rhyme scheme letters (ABAB, etc.)',
      });
    }
  });

  test('should highlight rhyming words', async ({ page }) => {
    const poem = `Roses are red\nViolets are blue\nSugar is sweet\nAnd so are you`;

    await setEditorContent(page, poem);
    await waitForAnalysis(page);

    const rhymesTab = page.locator('button:has-text("Rhymes")').first();
    if (await rhymesTab.isVisible()) {
      await rhymesTab.click();
      await page.waitForTimeout(ANIMATION_WAIT);
    }

    // Check for highlighting in editor or panel
  });
});

// ============================================================================
// TEST SUITE: LANGUAGE ANALYSIS
// ============================================================================

test.describe('Language Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
  });

  test('should detect passive voice', async ({ page }) => {
    const passivePoem = `The ball was thrown by the boy
The cake was eaten by the girl
The song was sung by the choir`;

    await setEditorContent(page, passivePoem);
    await waitForAnalysis(page);

    const languageTab = page.locator('button:has-text("Language")').first();
    if (await languageTab.isVisible()) {
      await languageTab.click();
      await page.waitForTimeout(ANIMATION_WAIT);
    }

    const pageText = await page.locator('body').textContent();
    if (!pageText?.toLowerCase().includes('passive')) {
      reportIssue({
        severity: 'major',
        category: 'bug',
        title: 'Passive voice not detected',
        description: 'Should detect passive voice constructions',
      });
    }
  });

  test('should show parts of speech', async ({ page }) => {
    const poem = `The quick brown fox jumps over the lazy dog`;

    await setEditorContent(page, poem);
    await waitForAnalysis(page);

    const languageTab = page.locator('button:has-text("Language")').first();
    if (await languageTab.isVisible()) {
      await languageTab.click();
      await page.waitForTimeout(ANIMATION_WAIT);
    }

    // Look for POS terminology
    const pageText = await page.locator('body').textContent();
    if (!pageText?.match(/noun|verb|adjective|adverb/i)) {
      reportIssue({
        severity: 'minor',
        category: 'ux',
        title: 'Parts of speech not clearly shown',
        description: 'POS distribution should be visible in language analysis',
      });
    }
  });

  test('should detect adverb overuse', async ({ page }) => {
    const adverbHeavy = `She walked slowly and carefully
Quietly and softly she spoke
Quickly and suddenly she ran`;

    await setEditorContent(page, adverbHeavy);
    await waitForAnalysis(page);

    const languageTab = page.locator('button:has-text("Language")').first();
    if (await languageTab.isVisible()) {
      await languageTab.click();
      await page.waitForTimeout(ANIMATION_WAIT);
    }

    const pageText = await page.locator('body').textContent();
    if (!pageText?.toLowerCase().includes('adverb')) {
      reportIssue({
        severity: 'minor',
        category: 'feature',
        title: 'Adverb analysis not prominent',
        description: 'Adverb analysis should be clearly visible for poems with many adverbs',
      });
    }
  });
});

// ============================================================================
// TEST SUITE: EDGE CASES
// ============================================================================

test.describe('Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
  });

  for (const edgeCase of EDGE_CASE_POEMS) {
    test(`Edge case: ${edgeCase.title}`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await setEditorContent(page, edgeCase.content);
      await waitForAnalysis(page);

      // Check for crashes or errors
      if (consoleErrors.length > 0) {
        reportIssue({
          severity: 'major',
          category: 'bug',
          title: `Console error on edge case: ${edgeCase.title}`,
          description: `Error: ${consoleErrors[0]}`,
        });
      }

      // Verify UI is still responsive
      const isResponsive = await page.evaluate(() => document.readyState === 'complete');
      if (!isResponsive) {
        reportIssue({
          severity: 'critical',
          category: 'bug',
          title: `UI freeze on edge case: ${edgeCase.title}`,
          description: 'The UI became unresponsive',
        });
      }
    });
  }
});

// ============================================================================
// TEST SUITE: ACCESSIBILITY
// ============================================================================

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
  });

  test('should have proper heading structure', async ({ page }) => {
    const h1Count = await countElements(page, 'h1');

    if (h1Count === 0) {
      reportIssue({
        severity: 'minor',
        category: 'accessibility',
        title: 'Missing H1 heading',
        description: 'Page should have exactly one H1 heading for accessibility',
      });
    } else if (h1Count > 1) {
      reportIssue({
        severity: 'minor',
        category: 'accessibility',
        title: 'Multiple H1 headings',
        description: `Found ${h1Count} H1 headings, should have exactly one`,
      });
    }
  });

  test('should have labeled form elements', async ({ page }) => {
    const inputsWithoutLabels = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, textarea, select');
      let unlabeledCount = 0;
      inputs.forEach(input => {
        const id = input.id;
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        const ariaLabel = input.getAttribute('aria-label');
        if (!label && !ariaLabel) unlabeledCount++;
      });
      return unlabeledCount;
    });

    if (inputsWithoutLabels > 0) {
      reportIssue({
        severity: 'minor',
        category: 'accessibility',
        title: 'Form elements without labels',
        description: `Found ${inputsWithoutLabels} form elements without proper labels`,
      });
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through the page
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }

    // Check if focus is visible
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.tagName;
    });

    if (!focusedElement) {
      reportIssue({
        severity: 'major',
        category: 'accessibility',
        title: 'Keyboard navigation issues',
        description: 'Focus should move through interactive elements',
      });
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // This is a basic check - full contrast testing requires axe-core
    const hasLowContrast = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let lowContrastCount = 0;
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bg = style.backgroundColor;
        // Basic check for very light text on white
        if (color === 'rgb(200, 200, 200)' && bg === 'rgb(255, 255, 255)') {
          lowContrastCount++;
        }
      });
      return lowContrastCount > 0;
    });

    if (hasLowContrast) {
      reportIssue({
        severity: 'minor',
        category: 'accessibility',
        title: 'Potential contrast issues',
        description: 'Some elements may have insufficient color contrast',
      });
    }
  });
});

// ============================================================================
// TEST SUITE: RESPONSIVE DESIGN
// ============================================================================

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Wide', width: 2560, height: 1440 },
  ];

  for (const viewport of viewports) {
    test(`should render correctly at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await waitForAnalysis(page);

      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      if (hasHorizontalScroll) {
        reportIssue({
          severity: 'minor',
          category: 'ux',
          title: `Horizontal scroll at ${viewport.name}`,
          description: `Page has horizontal scroll at ${viewport.width}px width`,
        });
      }

      // Check if editor is visible
      const editor = page.locator('.monaco-editor');
      if (!(await editor.isVisible())) {
        reportIssue({
          severity: 'major',
          category: 'bug',
          title: `Editor not visible at ${viewport.name}`,
          description: `Editor is not visible at ${viewport.width}px width`,
        });
      }

      // Take screenshot for visual comparison
      await captureScreenshot(page, `responsive-${viewport.name.toLowerCase()}`);
    });
  }
});

// ============================================================================
// TEST SUITE: PERFORMANCE
// ============================================================================

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
    const loadTime = Date.now() - startTime;

    if (loadTime > 5000) {
      reportIssue({
        severity: 'major',
        category: 'performance',
        title: 'Slow initial load',
        description: `Page took ${loadTime}ms to load (threshold: 5000ms)`,
      });
    }
  });

  test('should analyze poem within acceptable time', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    const poem = SONNET_POEMS[0];

    const startTime = Date.now();
    await setEditorContent(page, poem.content);

    // Wait for analysis to complete (look for analysis results)
    await page.waitForTimeout(3000);
    const analysisTime = Date.now() - startTime;

    if (analysisTime > 5000) {
      reportIssue({
        severity: 'major',
        category: 'performance',
        title: 'Slow poem analysis',
        description: `14-line sonnet took ${analysisTime}ms to analyze (threshold: 5000ms)`,
      });
    }
  });

  test('should handle 200-line poem without freezing', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    const longPoem = PERFORMANCE_POEMS[PERFORMANCE_POEMS.length - 1];

    const startTime = Date.now();
    await setEditorContent(page, longPoem.content);
    await waitForAnalysis(page, 10000);
    const totalTime = Date.now() - startTime;

    // Check if UI is still responsive
    const isResponsive = await page.evaluate(() => {
      return new Promise<boolean>(resolve => {
        const start = Date.now();
        requestAnimationFrame(() => {
          resolve(Date.now() - start < 100);
        });
      });
    });

    if (!isResponsive) {
      reportIssue({
        severity: 'major',
        category: 'performance',
        title: 'UI freeze on long poem',
        description: `UI became unresponsive processing ${longPoem.content.split('\n').length} lines`,
      });
    }

    if (totalTime > 15000) {
      reportIssue({
        severity: 'major',
        category: 'performance',
        title: 'Very slow large poem processing',
        description: `200-line poem took ${totalTime}ms to process`,
      });
    }
  });

  test('should not leak memory on repeated edits', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // Get initial memory if available
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Perform many edits
    for (let i = 0; i < 50; i++) {
      await page.click('.monaco-editor');
      await page.keyboard.type(`Line ${i} of test content\n`, { delay: 5 });
    }

    await waitForAnalysis(page);

    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    if (initialMemory > 0 && finalMemory > initialMemory * 3) {
      reportIssue({
        severity: 'major',
        category: 'performance',
        title: 'Potential memory leak',
        description: `Memory grew from ${initialMemory} to ${finalMemory} bytes during editing`,
      });
    }
  });
});

// ============================================================================
// TEST SUITE: WORD POPUP
// ============================================================================

test.describe('Word Popup Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
  });

  test('should show popup on word click', async ({ page }) => {
    const poem = `The quick brown fox jumps over the lazy dog`;
    await setEditorContent(page, poem);
    await waitForAnalysis(page);

    // Try to click on a word in the editor
    // This requires knowing how the popup is triggered
    await page.click('.monaco-editor');

    // Double-click to select a word
    await page.dblclick('.monaco-editor');
    await page.waitForTimeout(500);

    // Look for popup
    const popup = page.locator('[class*="popup"], [class*="modal"], [class*="tooltip"]');
    // Note: Popup behavior depends on implementation
  });
});

// ============================================================================
// CLEANUP AND REPORT GENERATION
// ============================================================================

test.afterAll(async () => {
  // Generate summary report
  console.log('\n' + '='.repeat(80));
  console.log('UI/UX TEST REPORT SUMMARY');
  console.log('='.repeat(80));

  const criticalIssues = discoveredIssues.filter(i => i.severity === 'critical');
  const majorIssues = discoveredIssues.filter(i => i.severity === 'major');
  const minorIssues = discoveredIssues.filter(i => i.severity === 'minor');
  const improvements = discoveredIssues.filter(i => i.severity === 'improvement');

  console.log(`\nTotal Issues Found: ${discoveredIssues.length}`);
  console.log(`  Critical: ${criticalIssues.length}`);
  console.log(`  Major: ${majorIssues.length}`);
  console.log(`  Minor: ${minorIssues.length}`);
  console.log(`  Improvements: ${improvements.length}`);

  if (criticalIssues.length > 0) {
    console.log('\n--- CRITICAL ISSUES ---');
    criticalIssues.forEach(i => console.log(`  [${i.category}] ${i.title}: ${i.description}`));
  }

  if (majorIssues.length > 0) {
    console.log('\n--- MAJOR ISSUES ---');
    majorIssues.forEach(i => console.log(`  [${i.category}] ${i.title}: ${i.description}`));
  }

  if (minorIssues.length > 0) {
    console.log('\n--- MINOR ISSUES ---');
    minorIssues.forEach(i => console.log(`  [${i.category}] ${i.title}: ${i.description}`));
  }

  console.log('\n' + '='.repeat(80));

  // Write detailed report to file
  const fs = await import('fs');
  const reportPath = 'test-reports/ui-ux-issues.json';
  fs.mkdirSync('test-reports', { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalIssues: discoveredIssues.length,
    summary: {
      critical: criticalIssues.length,
      major: majorIssues.length,
      minor: minorIssues.length,
      improvements: improvements.length,
    },
    issues: discoveredIssues,
  }, null, 2));

  console.log(`\nDetailed report written to: ${reportPath}`);
});
