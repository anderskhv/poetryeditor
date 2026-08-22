import { expect, test, type Page } from '@playwright/test';

async function waitForEditor(page: Page) {
  await page.waitForFunction(() => (window as unknown as { __monacoEditor?: unknown }).__monacoEditor !== undefined, {
    timeout: 15000,
  });
}

test.describe('Quiet editor chrome', () => {
  test('header, status strip, and coach composer share one rhythm', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await waitForEditor(page);

    await expect(page.locator('.app-header .app-title')).toHaveText('Poetry Editor');
    await expect(page.locator('.app-header .app-subtitle')).toHaveText('A writing tool for poets');
    await expect(page.locator('.app-header')).toHaveCount(1);
    await expect(page.locator('.header-collection-crumb')).toHaveCount(0);
    await expect(page.locator('.editor-collection-crumb')).toHaveCount(0);
    await expect(page.getByText('Private by default')).toHaveCount(0);

    const headerBox = await page.locator('.app-header').boundingBox();
    expect(headerBox?.height).toBeGreaterThanOrEqual(44);
    expect(headerBox?.height).toBeLessThanOrEqual(56);

    const menuLabels = ['File', 'Formatting', 'Background', 'Inspiration', 'Tools'];
    for (const label of menuLabels) {
      await expect(page.locator('.header-menubar button.btn-menu').filter({ hasText: label })).toBeVisible();
    }

    const titleBox = await page.locator('.app-header .app-title').boundingBox();
    const fileBox = await page.locator('.header-menubar button.btn-menu').filter({ hasText: 'File' }).boundingBox();
    expect(titleBox && fileBox).toBeTruthy();
    if (titleBox && fileBox) {
      const titleMid = titleBox.y + titleBox.height / 2;
      const fileMid = fileBox.y + fileBox.height / 2;
      expect(Math.abs(titleMid - fileMid)).toBeLessThan(10);
    }

    await expect(page.locator('.workspace-status-strip .save-status-pill')).toBeVisible();
    await expect(page.locator('.workspace-status-strip .poem-stats')).toBeVisible();

    const input = page.locator('.editor-input');
    const send = page.locator('.editor-send-btn');
    await expect(input).toBeVisible();
    await expect(send).toBeVisible();
    const inputBox = await input.boundingBox();
    const sendBox = await send.boundingBox();
    expect(inputBox && sendBox).toBeTruthy();
    if (inputBox && sendBox) {
      expect(Math.abs(inputBox.height - sendBox.height)).toBeLessThan(8);
      const inputMid = inputBox.y + inputBox.height / 2;
      const sendMid = sendBox.y + sendBox.height / 2;
      expect(Math.abs(inputMid - sendMid)).toBeLessThan(4);
    }
  });

  test('collections pages use the same product header', async ({ page }) => {
    await page.goto('/my-collections');
    await expect(page.locator('.app-header .app-title')).toHaveText('Poetry Editor');
    await expect(page.locator('.app-header .app-subtitle')).toHaveText('A writing tool for poets');
    await expect(page.getByText('Private by default')).toHaveCount(0);
    await expect(page.locator('.app-footer .footer-line')).toContainText('contact@poetryeditor.com');
  });
});
