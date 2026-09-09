import { test, expect, type Page } from '@playwright/test';

// Keep these regressions entirely local: the real App and mobile editor run,
// while authentication and database transport are replaced at the Vite boundary.
// No credentials, Supabase service, Monaco CDN, or paid AI calls are needed.
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

const poem = {
  id: 'title-regression-poem',
  collection_id: null,
  title: 'The title I chose',
  content: 'A small bird waits\nbeside the quiet gate.',
  formatting: { align: 'left', font: 'libre-baskerville', lineSpacing: 'normal', firstLineIndent: false },
  updated_at: '2026-09-01T12:00:00.000Z',
};

async function fixtures(page: Page, guest = false, holdCloudLoad = false, holdFirstWrite = false) {
  const updates: Record<string, unknown>[] = [];
  const storedPoem = { ...poem };
  const secondPoem = { ...poem, id: 'second-title-regression-poem', title: 'A different chosen title' };
  let releaseWrite = () => {};
  const writeGate = new Promise<void>(resolve => { releaseWrite = resolve; });
  let releaseSecondLoad = () => {};
  const secondLoadGate = new Promise<void>(resolve => { releaseSecondLoad = resolve; });
  let secondLoadStarted = false;
  let releaseCloudLoad = () => {};
  const loadGate = new Promise<void>(resolve => { releaseCloudLoad = resolve; });
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith('/api/') || !['localhost', '127.0.0.1'].includes(url.hostname)) {
      await route.abort();
      return;
    }
    await route.continue();
  });
  await page.route('**/src/hooks/useAuth.ts*', route => route.fulfill({
    contentType: 'application/javascript',
    body: `const user = localStorage.getItem('title-test-guest') === 'true' ? null : { id: 'fixture-user', email: 'fixture@example.test', user_metadata: {} };
      export function useAuth() { return { user, session: user ? { user } : null, loading: false, isAuthenticated: !!user, signOut: async () => {} }; }`,
  }));
  await page.route('**/src/lib/supabase.ts*', route => route.fulfill({
    contentType: 'application/javascript',
    body: `export const supabase = {
      from(table) {
        const query = { table, action: 'select', single: false, filters: {} };
        const chain = new Proxy({}, { get(_, method) {
          if (method === 'then') return (resolve, reject) => fetch('/__title_fixture', { method: 'POST', body: JSON.stringify(query) }).then(r => r.json()).then(resolve, reject);
          return (...args) => {
            if (['update', 'insert', 'upsert', 'delete'].includes(method)) { query.action = method; query.payload = args[0]; }
            if (method === 'eq') query.filters[args[0]] = args[1];
            if (['single', 'maybeSingle'].includes(method)) query.single = true;
            return chain;
          };
        }});
        return chain;
      },
      auth: { getSession: async () => ({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) }
    };`,
  }));
  await page.route('**/__title_fixture', async route => {
    const query = route.request().postDataJSON();
    let data: unknown = query.single ? null : [];
    if (query.table === 'poems' && [poem.id, secondPoem.id].includes(query.filters.id)) {
      const targetPoem = query.filters.id === poem.id ? storedPoem : secondPoem;
      if (query.action === 'update') {
        updates.push(query.payload);
        Object.assign(targetPoem, query.payload);
        if (holdFirstWrite && updates.length === 1) await writeGate;
      } else if (holdFirstWrite && targetPoem === secondPoem) {
        secondLoadStarted = true;
        await secondLoadGate;
      } else if (holdCloudLoad) {
        await loadGate;
      }
      data = { ...targetPoem };
    } else if (query.table === 'editor_poet_profiles') {
      data = { id: 'profile', user_id: 'fixture-user', onboarding_completed: true };
    }
    await route.fulfill({ json: { data, error: null } });
  });
  await page.addInitScript(({ guest, poem }) => {
    if (localStorage.getItem('title-test-seeded')) return;
    localStorage.setItem('title-test-seeded', 'true');
    localStorage.setItem('title-test-guest', String(guest));
    localStorage.setItem('hasOpenedAnalysisPanel', 'true');
    localStorage.setItem('analysisPanelOpen', 'false');
    localStorage.setItem('cloudMigrationDone', 'true');
    localStorage.setItem('lastCloudPoemId', poem.id);
    localStorage.setItem('poetryTitle', JSON.stringify(guest ? poem.title : 'Stale browser title'));
    // A normal reopen has the latest body cached, but the old implementation
    // could leave an unrelated title cached. Matching bodies must still load
    // the cloud title and initialize the committed save snapshot.
    localStorage.setItem('poetryContent', JSON.stringify(poem.content));
  }, { guest, poem });
  return { updates, storedPoem, secondPoem, releaseCloudLoad, releaseWrite, releaseSecondLoad, secondLoadStarted: () => secondLoadStarted };
}

test('reopening a guest draft preserves its chosen title and body', async ({ page }) => {
  await fixtures(page, true);
  await page.goto('/');
  await expect(page.locator('.mobile-editor-title')).toHaveText(poem.title);
  await expect(page.locator('.cm-content')).toContainText('A small bird waits');
  await page.reload();
  await expect(page.locator('.mobile-editor-title')).toHaveText(poem.title);
  await expect(page.locator('.cm-content')).toContainText('A small bird waits');
});

test('opening the last cloud poem does not save; body edits preserve title and explicit renames save', async ({ page }) => {
  const { updates } = await fixtures(page);
  await page.goto('/');
  await expect(page).toHaveURL(new RegExp(`poem=${poem.id}`));
  await expect(page.locator('.mobile-editor-title')).toHaveText(poem.title);
  await page.waitForTimeout(1400); // Exceed the real cloud autosave debounce.
  expect(updates).toEqual([]);

  await page.locator('.cm-content').fill('A revised bird waits\nbeside the quiet gate.');
  await expect.poll(() => updates.length).toBe(1);
  expect(updates[0]).toHaveProperty('content', 'A revised bird waits\nbeside the quiet gate.');
  expect(updates[0]).not.toHaveProperty('title');

  await page.locator('.mobile-editor-title').dblclick();
  await page.locator('.mobile-editor-title-input').fill('A deliberate new title');
  await page.locator('.mobile-editor-title-input').press('Enter');
  await expect.poll(() => updates.length).toBe(2);
  expect(updates[1]).toHaveProperty('title', 'A deliberate new title');
});

test('cloud title and body remain paired when the next visit is signed out', async ({ page }) => {
  await fixtures(page);
  await page.goto('/');
  await expect(page.locator('.mobile-editor-title')).toHaveText(poem.title);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('poetryTitle') || 'null'))).toBe(poem.title);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('poetryContent') || 'null'))).toBe(poem.content);
  await page.evaluate(() => localStorage.setItem('title-test-guest', 'true'));
  await page.goto('/');
  await expect(page.locator('.mobile-editor-title')).toHaveText(poem.title);
  await expect(page.locator('.cm-content')).toContainText('A small bird waits');
});

test('a delayed cloud load cannot leave a stale editable mobile title', async ({ page }) => {
  const { updates, releaseCloudLoad } = await fixtures(page, false, true);
  await page.goto(`/?poem=${poem.id}`);
  await expect(page.locator('.mobile-editor-title')).toBeVisible();
  await page.locator('.mobile-editor-title').dblclick();
  await expect(page.locator('.mobile-editor-title-input')).toHaveCount(0);
  releaseCloudLoad();
  await expect(page.locator('.mobile-editor-title')).toHaveText(poem.title);
  await page.waitForTimeout(1400);
  expect(updates).toEqual([]);
});

test('switching poems closes the old mobile title input without renaming the new poem', async ({ page }) => {
  const { updates, secondPoem } = await fixtures(page);
  await page.goto('/');
  await expect(page.locator('.mobile-editor-title')).toHaveText(poem.title);
  await page.locator('.mobile-editor-title').dblclick();
  await expect(page.locator('.mobile-editor-title-input')).toHaveValue(poem.title);
  await page.evaluate(id => {
    history.pushState({}, '', `/?poem=${id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, secondPoem.id);
  await expect(page.locator('.mobile-editor-title')).toHaveText(secondPoem.title);
  await expect(page.locator('.mobile-editor-title-input')).toHaveCount(0);
  await page.locator('.cm-content').click();
  await page.waitForTimeout(1400);
  expect(updates).toEqual([]);
  expect(secondPoem.title).toBe('A different chosen title');
});

test('reverting a title before autosave makes no write and clears the saving indicator', async ({ page }) => {
  const { updates } = await fixtures(page);
  await page.goto('/');
  await expect(page.locator('.mobile-editor-title')).toHaveText(poem.title);
  await page.locator('.mobile-editor-title').dblclick();
  await page.locator('.mobile-editor-title-input').fill('A temporary title');
  await expect(page.locator('.save-status-pill')).toHaveClass(/saving/);
  await page.locator('.mobile-editor-title-input').fill(poem.title);
  await page.locator('.mobile-editor-title-input').press('Enter');
  await expect(page.locator('.save-status-pill')).toHaveClass(/saved/);
  await page.waitForTimeout(1400);
  expect(updates).toEqual([]);
});

test.describe('desktop title', () => {
  test.use({ viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false });

  test('reopening matching cached text restores the saved cloud title without writing', async ({ page }) => {
    const { updates } = await fixtures(page);
    await page.goto('/');
    await expect(page.getByRole('textbox', { name: 'Poem title', exact: true })).toHaveValue(poem.title);
    await page.waitForTimeout(1400);
    expect(updates).toEqual([]);
  });
});


test('a delayed save cannot overwrite the next poem while its cloud load is pending', async ({ page }) => {
  const fixture = await fixtures(page, false, false, true);
  await page.goto('/');
  await expect(page.locator('.mobile-editor-title')).toHaveText(poem.title);
  await page.locator('.cm-content').fill('First edited draft of A');
  await expect.poll(() => fixture.updates.length).toBe(1);
  await page.locator('.cm-content').fill('Latest draft of A while saving');
  await page.evaluate(id => {
    history.pushState({}, '', `/?poem=${id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, fixture.secondPoem.id);
  await expect.poll(fixture.secondLoadStarted).toBe(true);
  fixture.releaseWrite();
  await page.waitForTimeout(1400);
  expect(fixture.secondPoem.content).toBe(poem.content);
  expect(fixture.updates).toHaveLength(1);
  fixture.releaseSecondLoad();
  await expect(page.locator('.mobile-editor-title')).toHaveText(fixture.secondPoem.title);
  await expect(page.locator('.cm-content')).toContainText('A small bird waits');
  await page.locator('.cm-content').fill('A deliberate edit of B');
  await expect.poll(() => fixture.secondPoem.content).toBe('A deliberate edit of B');
  expect(fixture.storedPoem.content).toBe('First edited draft of A');
});
