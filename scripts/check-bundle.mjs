/**
 * Post-build guard: scan dist/ for credential shapes that must never ship to
 * the client. Fails the build if any are found.
 *
 * If this trips, find the offending env var (likely prefixed with VITE_ when
 * it shouldn't be) and rename it to a non-public prefix. The browser bundle
 * is public — anything inlined here is publicly readable.
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

const PATTERNS = [
  { name: 'Anthropic API key', re: /sk-ant-[a-zA-Z0-9_-]{20,}/g },
  { name: 'OpenAI API key', re: /sk-(?:proj-)?[a-zA-Z0-9]{40,}/g },
  { name: 'Google API key', re: /AIza[0-9A-Za-z_-]{35}/g },
  { name: 'Supabase service-role JWT', re: /"role":"service_role"/g },
];

const SCAN_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.html', '.css', '.json', '.txt']);

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(p);
    } else if (e.isFile()) {
      yield p;
    }
  }
}

async function main() {
  try {
    await stat(DIST);
  } catch {
    console.log(`[check-bundle] dist/ not found at ${DIST}, skipping.`);
    return;
  }

  const hits = [];
  for await (const file of walk(DIST)) {
    const ext = file.slice(file.lastIndexOf('.'));
    if (!SCAN_EXTENSIONS.has(ext)) continue;
    const text = await readFile(file, 'utf8');
    for (const { name, re } of PATTERNS) {
      const matches = text.match(re);
      if (matches) {
        hits.push({ file: file.replace(DIST, ''), name, sample: matches[0].slice(0, 12) + '…' });
      }
    }
  }

  if (hits.length > 0) {
    console.error('\n[check-bundle] CREDENTIAL FOUND IN BUNDLE — refusing to ship:\n');
    for (const h of hits) {
      console.error(`  ${h.name} in dist/${h.file}: ${h.sample}`);
    }
    console.error('\nFind the env var that leaked and remove the public prefix (VITE_, NEXT_PUBLIC_, etc.).\n');
    process.exit(1);
  }

  console.log('[check-bundle] OK — no credentials detected in dist/.');
}

main().catch(err => {
  console.error('[check-bundle] error:', err);
  process.exit(1);
});
