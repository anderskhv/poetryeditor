import { test, expect, Page } from '@playwright/test';

const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';

async function waitForEditor(page: Page) {
  // Wait for Monaco editor to be mounted and exposed
  await page.waitForFunction(() => (window as any).__monacoEditor !== undefined, {
    timeout: 15000,
  });
}

async function getEditorText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const editor = (window as any).__monacoEditor;
    return editor.getModel().getValue();
  });
}

async function setEditorText(page: Page, text: string) {
  await page.evaluate((t) => {
    const editor = (window as any).__monacoEditor;
    editor.getModel().setValue(t);
  }, text);
}

async function selectAll(page: Page) {
  await page.evaluate(() => {
    const editor = (window as any).__monacoEditor;
    const model = editor.getModel();
    const lastLine = model.getLineCount();
    const lastCol = model.getLineMaxColumn(lastLine);
    editor.setSelection({
      startLineNumber: 1, startColumn: 1,
      endLineNumber: lastLine, endColumn: lastCol,
    });
  });
}

async function selectRange(page: Page, startLine: number, startCol: number, endLine: number, endCol: number) {
  await page.evaluate(({ sl, sc, el, ec }) => {
    const editor = (window as any).__monacoEditor;
    editor.setSelection({
      startLineNumber: sl, startColumn: sc,
      endLineNumber: el, endColumn: ec,
    });
  }, { sl: startLine, sc: startCol, el: endLine, ec: endCol });
}

async function focusEditor(page: Page) {
  await page.evaluate(() => {
    (window as any).__monacoEditor.focus();
  });
}

test.describe('Text Formatting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
    await focusEditor(page);
  });

  test('Cmd+B wraps selected text in bold markers', async ({ page }) => {
    await setEditorText(page, 'hello world');
    await selectRange(page, 1, 1, 1, 6); // select "hello"
    await page.keyboard.press(`${modifier}+b`);

    const text = await getEditorText(page);
    expect(text).toBe('**hello** world');
  });

  test('Cmd+B again removes bold markers', async ({ page }) => {
    await setEditorText(page, '**hello** world');
    await selectRange(page, 1, 1, 1, 10); // select "**hello**"
    await page.keyboard.press(`${modifier}+b`);

    const text = await getEditorText(page);
    expect(text).toBe('hello world');
  });

  test('Cmd+I wraps selected text in italic markers', async ({ page }) => {
    await setEditorText(page, 'hello world');
    await selectRange(page, 1, 1, 1, 6);
    await page.keyboard.press(`${modifier}+i`);

    const text = await getEditorText(page);
    expect(text).toBe('*hello* world');
  });

  test('Cmd+U wraps selected text in underline markers', async ({ page }) => {
    await setEditorText(page, 'hello world');
    await selectRange(page, 1, 1, 1, 6);
    await page.keyboard.press(`${modifier}+u`);

    const text = await getEditorText(page);
    expect(text).toBe('__hello__ world');
  });

  test('rapid 10x bold toggle produces clean state', async ({ page }) => {
    await setEditorText(page, 'hello');
    await selectAll(page);

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press(`${modifier}+b`);
      const text = await getEditorText(page);
      if (i % 2 === 0) {
        expect(text).toBe('**hello**');
      } else {
        expect(text).toBe('hello');
      }
    }
  });

  test('rapid 10x italic toggle produces clean state', async ({ page }) => {
    await setEditorText(page, 'hello');
    await selectAll(page);

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press(`${modifier}+i`);
      const text = await getEditorText(page);
      if (i % 2 === 0) {
        expect(text).toBe('*hello*');
      } else {
        expect(text).toBe('hello');
      }
    }
  });

  test('bold + italic combined', async ({ page }) => {
    await setEditorText(page, 'hello');
    await selectAll(page);
    await page.keyboard.press(`${modifier}+b`);
    let text = await getEditorText(page);
    expect(text).toBe('**hello**');

    // Now select content and apply italic
    await selectRange(page, 1, 3, 1, 8); // select "hello" inside markers
    await page.keyboard.press(`${modifier}+i`);
    text = await getEditorText(page);
    expect(text).toBe('***hello***');
  });

  test('undo after formatting restores original text', async ({ page }) => {
    await setEditorText(page, 'hello world');
    await selectRange(page, 1, 1, 1, 6);
    await page.keyboard.press(`${modifier}+b`);

    let text = await getEditorText(page);
    expect(text).toBe('**hello** world');

    // Undo
    await page.keyboard.press(`${modifier}+z`);
    text = await getEditorText(page);
    expect(text).toBe('hello world');
  });

  test('multi-line bold wraps each line separately', async ({ page }) => {
    await setEditorText(page, 'line one\nline two');
    await selectAll(page);
    await page.keyboard.press(`${modifier}+b`);

    const text = await getEditorText(page);
    expect(text).toBe('**line one**\n**line two**');
  });
});
