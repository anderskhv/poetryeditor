/**
 * Visual QA Screenshot Script — Poetry Editor
 *
 * Takes screenshots of key pages at multiple viewport widths for visual review.
 * Run with: npx playwright test e2e/visual-qa.spec.ts
 *
 * Environment variables:
 *   BASE_URL  — dev server URL (default: http://localhost:5173)
 *   QA_PAGES  — comma-separated list of page keys to screenshot (default: all)
 *              Valid keys: home, editor, collection, editorial-report, poem-analysis
 */

import { test, expect, type Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots');

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

// Which pages to screenshot (filterable via QA_PAGES env var)
const ALL_PAGE_KEYS = ['home', 'editor', 'collection', 'editorial-report', 'poem-analysis'];
const selectedPages = process.env.QA_PAGES
  ? process.env.QA_PAGES.split(',').map(s => s.trim())
  : ALL_PAGE_KEYS;

let screenshotCount = 0;

function shouldRun(key: string): boolean {
  return selectedPages.includes(key);
}

async function takeScreenshot(page: Page, name: string) {
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  screenshotCount++;
}

// Ensure screenshot directory exists
test.beforeAll(async () => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
  // Clean old screenshots
  const existing = fs.readdirSync(SCREENSHOT_DIR).filter(f => f.endsWith('.png'));
  for (const f of existing) {
    fs.unlinkSync(path.join(SCREENSHOT_DIR, f));
  }
});

test.afterAll(async () => {
  console.log(`\n=== Visual QA Summary ===`);
  console.log(`Screenshots taken: ${screenshotCount}`);
  console.log(`Saved to: ${SCREENSHOT_DIR}`);
  console.log(`=========================\n`);
});

// --- Home Page ---
for (const vp of VIEWPORTS) {
  test(`home-${vp.name}-${vp.width}`, async ({ browser }) => {
    if (!shouldRun('home')) return test.skip();
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await takeScreenshot(page, `home-${vp.name}-${vp.width}`);
    await context.close();
  });
}

// --- Editor Page ---
for (const vp of VIEWPORTS) {
  test(`editor-${vp.name}-${vp.width}`, async ({ browser }) => {
    if (!shouldRun('editor')) return test.skip();
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    // Navigate to the main editor (root is the editor)
    await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    // Try to type a poem into the editor if Monaco is present
    const monacoEditor = page.locator('.monaco-editor').first();
    if (await monacoEditor.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.waitForTimeout(500);
    }
    await takeScreenshot(page, `editor-${vp.name}-${vp.width}`);
    await context.close();
  });
}

// --- Collection View (poems list) ---
for (const vp of VIEWPORTS) {
  test(`collection-${vp.name}-${vp.width}`, async ({ browser }) => {
    if (!shouldRun('collection')) return test.skip();
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto(BASE_URL + '/poems', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await takeScreenshot(page, `collection-${vp.name}-${vp.width}`);
    await context.close();
  });
}

// --- Editorial Report Page ---
for (const vp of VIEWPORTS) {
  test(`editorial-report-${vp.name}-${vp.width}`, async ({ browser }) => {
    if (!shouldRun('editorial-report')) return test.skip();
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    // The editorial report page requires state; just screenshot the route
    await page.goto(BASE_URL + '/my-collections', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await takeScreenshot(page, `editorial-report-${vp.name}-${vp.width}`);
    await context.close();
  });
}

// --- Poem Analysis Page ---
for (const vp of VIEWPORTS) {
  test(`poem-analysis-${vp.name}-${vp.width}`, async ({ browser }) => {
    if (!shouldRun('poem-analysis')) return test.skip();
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto(BASE_URL + '/poems/the-road-not-taken', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await takeScreenshot(page, `poem-analysis-${vp.name}-${vp.width}`);
    await context.close();
  });
}
