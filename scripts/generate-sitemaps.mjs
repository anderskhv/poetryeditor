import fs from 'fs';
import path from 'path';

const ROOT_URL = 'https://poetryeditor.com';
const OUTPUT_DIR = path.resolve('public');
const CMU_PATH = path.resolve('public', 'cmudict.dict');
const POEM_INDEX_PATH = path.resolve('src', 'data', 'poems', 'index.ts');
const SYNONYMS_PATH = path.resolve('src', 'data', 'offlineSynonyms.json');
// Match the pre-render limit: only include words that will have enriched HTML pages
// Cloudflare Pages hard limit: 20,000 files; we reserve headroom for other pages/assets
const RHYME_LIMIT = 8000;
const SYN_LIMIT = 8000;

const today = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const xmlEscape = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const buildUrlset = (entries) => {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  entries.forEach((entry) => {
    lines.push('  <url>');
    lines.push(`    <loc>${xmlEscape(entry.loc)}</loc>`);
    if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    if (entry.changefreq) lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    if (entry.priority) lines.push(`    <priority>${entry.priority}</priority>`);
    lines.push('  </url>');
  });
  lines.push('</urlset>');
  return lines.join('\n');
};

const buildIndex = (sitemaps) => {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  sitemaps.forEach((loc) => {
    lines.push('  <sitemap>');
    lines.push(`    <loc>${xmlEscape(loc)}</loc>`);
    lines.push('  </sitemap>');
  });
  lines.push('</sitemapindex>');
  return lines.join('\n');
};

const loadWordList = () => {
  const content = fs.readFileSync(CMU_PATH, 'utf8');
  const words = new Set();
  for (const line of content.split('\n')) {
    if (!line || line.startsWith(';;;')) continue;
    const [rawWord] = line.split(/\s+/);
    if (!rawWord) continue;
    const base = rawWord.replace(/\(\d+\)$/, '').toLowerCase();
    if (!/^[a-z][a-z\-']+$/.test(base)) continue;
    if (base.length < 2 || base.length > 18) continue;
    words.add(base);
  }
  // Priority: words we have synonym data for first (they'll have richest pages),
  // then by length (shorter = more commonly searched)
  let synonymWords;
  try {
    synonymWords = new Set(Object.keys(JSON.parse(fs.readFileSync(SYNONYMS_PATH, 'utf8'))));
  } catch { synonymWords = new Set(); }

  return Array.from(words).sort((a, b) => {
    const aHasSyns = synonymWords.has(a) ? 0 : 1;
    const bHasSyns = synonymWords.has(b) ? 0 : 1;
    if (aHasSyns !== bHasSyns) return aHasSyns - bHasSyns;
    const aSimple = /^[a-z]+$/.test(a);
    const bSimple = /^[a-z]+$/.test(b);
    if (aSimple !== bSimple) return aSimple ? -1 : 1;
    if (a.length !== b.length) return a.length - b.length;
    return a.localeCompare(b);
  });
};

const loadPoemSlugs = () => {
  const content = fs.readFileSync(POEM_INDEX_PATH, 'utf8');
  const poemsBlockMatch = content.match(/export const poems:[\s\S]*?=\s*\{([\s\S]*?)\};/);
  if (!poemsBlockMatch) return [];
  const block = poemsBlockMatch[1];
  const slugs = new Set();
  const regex = /'([^']+)'\s*:/g;
  let match;
  while ((match = regex.exec(block))) {
    slugs.add(match[1]);
  }
  return Array.from(slugs).sort();
};

const mainEntries = [
  { loc: `${ROOT_URL}/`, lastmod: today(), changefreq: 'weekly', priority: '1.0' },
  { loc: `${ROOT_URL}/rhymes`, lastmod: today(), changefreq: 'weekly', priority: '0.9' },
  { loc: `${ROOT_URL}/synonyms`, lastmod: today(), changefreq: 'weekly', priority: '0.9' },
  { loc: `${ROOT_URL}/syllables`, lastmod: today(), changefreq: 'weekly', priority: '0.8' },
  { loc: `${ROOT_URL}/poems`, lastmod: today(), changefreq: 'weekly', priority: '0.8' },
  { loc: `${ROOT_URL}/rhyme-scheme-analyzer`, lastmod: today(), changefreq: 'monthly', priority: '0.7' },
  { loc: `${ROOT_URL}/haiku-checker`, lastmod: today(), changefreq: 'monthly', priority: '0.7' },
  { loc: `${ROOT_URL}/sonnet-checker`, lastmod: today(), changefreq: 'monthly', priority: '0.7' },
  { loc: `${ROOT_URL}/poetry-statistics`, lastmod: today(), changefreq: 'monthly', priority: '0.7' },
  // Learn pages
  { loc: `${ROOT_URL}/learn/haiku`, lastmod: today(), changefreq: 'monthly', priority: '0.7' },
  { loc: `${ROOT_URL}/learn/sonnet`, lastmod: today(), changefreq: 'monthly', priority: '0.7' },
  { loc: `${ROOT_URL}/learn/free-verse`, lastmod: today(), changefreq: 'monthly', priority: '0.7' },
  { loc: `${ROOT_URL}/learn/scansion`, lastmod: today(), changefreq: 'monthly', priority: '0.7' },
  { loc: `${ROOT_URL}/learn/villanelle`, lastmod: today(), changefreq: 'monthly', priority: '0.7' },
  { loc: `${ROOT_URL}/learn/pantoum`, lastmod: today(), changefreq: 'monthly', priority: '0.7' },
  { loc: `${ROOT_URL}/learn/ode`, lastmod: today(), changefreq: 'monthly', priority: '0.7' },
  { loc: `${ROOT_URL}/learn/elegy`, lastmod: today(), changefreq: 'monthly', priority: '0.7' },
  { loc: `${ROOT_URL}/learn/ballad`, lastmod: today(), changefreq: 'monthly', priority: '0.7' },
  { loc: `${ROOT_URL}/learn/slant-rhyme`, lastmod: today(), changefreq: 'monthly', priority: '0.7' },
  { loc: `${ROOT_URL}/learn/avoiding-cliches`, lastmod: today(), changefreq: 'monthly', priority: '0.7' },
];

const slugs = loadPoemSlugs();
const poemsEntries = slugs.map((slug) => ({
  loc: `${ROOT_URL}/poems/${slug}`,
  lastmod: today(),
  changefreq: 'monthly',
  priority: '0.6',
}));

const words = loadWordList();
const rhymeWords = words.slice(0, RHYME_LIMIT);
const synWords = words.slice(0, SYN_LIMIT);

const rhymeEntries = rhymeWords.map((word) => ({
  loc: `${ROOT_URL}/rhymes/${encodeURIComponent(word)}`,
  lastmod: today(),
  changefreq: 'monthly',
  priority: '0.5',
}));

const synonymEntries = synWords.map((word) => ({
  loc: `${ROOT_URL}/synonyms/${encodeURIComponent(word)}`,
  lastmod: today(),
  changefreq: 'monthly',
  priority: '0.5',
}));

fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-main.xml'), buildUrlset(mainEntries));
fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-poems.xml'), buildUrlset(poemsEntries));
fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-rhymes.xml'), buildUrlset(rhymeEntries));
fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-synonyms.xml'), buildUrlset(synonymEntries));

const indexXml = buildIndex([
  `${ROOT_URL}/sitemap-main.xml`,
  `${ROOT_URL}/sitemap-poems.xml`,
  `${ROOT_URL}/sitemap-rhymes.xml`,
  `${ROOT_URL}/sitemap-synonyms.xml`,
]);
fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), indexXml);

console.log(`Generated sitemaps with ${poemsEntries.length} poems, ${rhymeEntries.length} rhymes, ${synonymEntries.length} synonyms.`);
