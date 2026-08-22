import { expect, test, type Page } from '@playwright/test';

async function openEditor(page: Page) {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await expect(page.locator('.app-header .app-title')).toHaveText('Poetry Editor');
  await expect(page.locator('.editor-input')).toBeVisible();
}

test.describe('Quiet editor chrome', () => {
  test('header, status strip, and coach composer share one rhythm', async ({ page }) => {
    await openEditor(page);

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

    const form = page.locator('.editor-input-form');
    const input = page.locator('.editor-input');
    const send = page.locator('.editor-send-btn');
    await expect(form).toBeVisible();
    await expect(input).toBeVisible();
    await expect(send).toBeVisible();
    const formBox = await form.boundingBox();
    const inputBox = await input.boundingBox();
    const sendBox = await send.boundingBox();
    expect(formBox && inputBox && sendBox).toBeTruthy();
    if (formBox && inputBox && sendBox) {
      expect(Math.abs(inputBox.height - sendBox.height)).toBeLessThan(6);
      const formMid = formBox.y + formBox.height / 2;
      const sendMid = sendBox.y + sendBox.height / 2;
      expect(Math.abs(formMid - sendMid)).toBeLessThan(3);
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
