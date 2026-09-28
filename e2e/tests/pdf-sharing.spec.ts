import { test, expect } from '@playwright/test';

test('poem sharing opens a printable PDF view and handles blocked popups', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'File options', exact: true }).click();
  await page.getByRole('button', { name: 'Share', exact: true }).click();
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Share as PDF', exact: true }).click();
  const popup = await popupPromise;
  await expect(popup.locator('article')).toHaveCount(1);
  await expect(popup.getByRole('button', { name: 'Save as PDF / Print' })).toBeVisible();
  await popup.close();
  await page.evaluate(() => { window.open = () => null; });
  await page.getByRole('button', { name: 'Share as PDF', exact: true }).click();
  await expect(page.locator('.share-modal').getByRole('alert')).toContainText('Allow pop-ups');
});
