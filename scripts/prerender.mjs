/**
 * Pre-render key pages as static HTML for SEO.
 *
 * Runs after `vite build`. Uses Vite's ssrLoadModule() to import poem and
 * rhyme-scheme TypeScript data, then stamps meta tags + semantic HTML into
 * copies of dist/index.html.
 *
 * Cloudflare Pages serves static files first; non-pre-rendered routes fall
 * back to dist/index.html via public/_redirects (`/* /index.html 200`).
 * Do not rewrite to /200.html — Pages pretty-URLs turn that into /200 and loop.
 * Pages Functions skip `_redirects`. functions/_middleware.ts turns asset
 * 404s into /index.html (never /200.html). public/_routes.json excludes
 * /assets/* so missing bundles still hit 404.html.
 */

import fs from 'fs';
import path from 'path';
import { createServer } from 'vite';

const DIST = path.resolve('dist');
const SITE = 'https://poetryeditor.com';
const RHYME_SITEMAP = path.resolve('public/sitemap-rhymes.xml');
const SYNONYM_SITEMAP = path.resolve('public/sitemap-synonyms.xml');
// Cloudflare Pages hard limit: 20,000 files per deployment.
// Keep headroom for all other pages/assets.
const MAX_RHYME_PAGES = 8000;
const MAX_SYNONYM_PAGES = 8000;

// ── CMU Dictionary (Node.js compatible) ───────────────────────────────────

const CMU_DICT_PATH = path.resolve('public/cmudict.dict');
const WORDNET_DIR = path.resolve('public/wordnet-senses');
const OFFLINE_SYNONYMS_PATH = path.resolve('src/data/offlineSynonyms.json');

/** Parse CMU dict into Map<word, Pronunciation[]> */
function parseCMUDictNode(text) {
  const dict = new Map();
  for (const line of text.split('\n')) {
    if (line.startsWith(';;;') || !line.trim()) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;
    const rawWord = parts[0];
    const phones = parts.slice(1);
    const baseWord = rawWord.replace(/\(\d+\)$/, '').toLowerCase();
    const stresses = phones.filter(p => /[012]$/.test(p)).map(p => parseInt(p.slice(-1)));
    if (!dict.has(baseWord)) dict.set(baseWord, []);
    dict.get(baseWord).push({ word: baseWord, phones, stresses });
  }
  return dict;
}

function getRhymeKeyFromPhonesNode(phones) {
  let idx = -1;
  for (let i = phones.length - 1; i >= 0; i--) {
    if (/[12]$/.test(phones[i])) { idx = i; break; }
  }
  if (idx === -1) {
    for (let i = phones.length - 1; i >= 0; i--) {
      if (/[012]$/.test(phones[i])) { idx = i; break; }
    }
  }
  if (idx === -1) return null;
  return phones.slice(idx).map(p => p.replace(/[012]$/, '')).join('-');
}

function buildRhymeIndexNode(dict) {
  const perfect = new Map();
  for (const [word, pronunciations] of dict.entries()) {
    if (!pronunciations || pronunciations.length === 0) continue;
    const best = [...pronunciations].sort((a, b) => b.stresses.length - a.stresses.length)[0];
    const key = getRhymeKeyFromPhonesNode(best.phones);
    if (key) {
      const list = perfect.get(key) ?? [];
      list.push(word);
      perfect.set(key, list);
    }
  }
  return perfect;
}

function getPerfectRhymesNode(word, dict, rhymeIndex, limit = 50) {
  const pronunciations = dict.get(word.toLowerCase());
  if (!pronunciations || pronunciations.length === 0) return [];
  const best = [...pronunciations].sort((a, b) => b.stresses.length - a.stresses.length)[0];
  const key = getRhymeKeyFromPhonesNode(best.phones);
  if (!key) return [];
  return (rhymeIndex.get(key) ?? []).filter(w => w !== word.toLowerCase()).slice(0, limit);
}

function getSyllableCountNode(word, dict) {
  const pronunciations = dict.get(word.toLowerCase());
  if (!pronunciations || pronunciations.length === 0) {
    // Fallback: estimate from vowel groups
    const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!cleaned) return 1;
    let count = 0;
    let prev = false;
    for (const ch of cleaned) {
      const isV = 'aeiouy'.includes(ch);
      if (isV && !prev) count++;
      prev = isV;
    }
    if (cleaned.endsWith('e') && !cleaned.endsWith('le') && count > 1) count--;
    return Math.max(1, count);
  }
  const best = [...pronunciations].sort((a, b) => b.stresses.length - a.stresses.length)[0];
  return best.stresses.length || 1;
}

/** CMU phonemes → IPA (approximate) */
const PHONE_TO_IPA = {
  'AA': 'ɑ', 'AE': 'æ', 'AH': 'ʌ', 'AO': 'ɔ', 'AW': 'aʊ', 'AY': 'aɪ',
  'B': 'b', 'CH': 'tʃ', 'D': 'd', 'DH': 'ð', 'EH': 'ɛ', 'ER': 'ɝ',
  'EY': 'eɪ', 'F': 'f', 'G': 'ɡ', 'HH': 'h', 'IH': 'ɪ', 'IY': 'i',
  'JH': 'dʒ', 'K': 'k', 'L': 'l', 'M': 'm', 'N': 'n', 'NG': 'ŋ',
  'OW': 'oʊ', 'OY': 'ɔɪ', 'P': 'p', 'R': 'r', 'S': 's', 'SH': 'ʃ',
  'T': 't', 'TH': 'θ', 'UH': 'ʊ', 'UW': 'u', 'V': 'v', 'W': 'w',
  'Y': 'j', 'Z': 'z', 'ZH': 'ʒ',
};

function phonesToIPA(phones) {
  return '/' + phones.map(p => {
    const base = p.replace(/[012]$/, '');
    return PHONE_TO_IPA[base] || base.toLowerCase();
  }).join('') + '/';
}

function getPronunciationIPA(word, dict) {
  const pronunciations = dict.get(word.toLowerCase());
  if (!pronunciations || pronunciations.length === 0) return null;
  const best = [...pronunciations].sort((a, b) => b.stresses.length - a.stresses.length)[0];
  return phonesToIPA(best.phones);
}

/** Load WordNet senses for a word */
const wordnetCache = new Map();
function loadWordnetSenses(word) {
  const normalized = word.toLowerCase().replace(/[^a-z]/g, '');
  if (normalized.length < 2) return [];
  const prefix = normalized.substring(0, 2);
  if (!wordnetCache.has(prefix)) {
    const filePath = path.join(WORDNET_DIR, `${prefix}.json`);
    if (fs.existsSync(filePath)) {
      try {
        wordnetCache.set(prefix, JSON.parse(fs.readFileSync(filePath, 'utf-8')));
      } catch { wordnetCache.set(prefix, {}); }
    } else {
      wordnetCache.set(prefix, {});
    }
  }
  return wordnetCache.get(prefix)[word.toLowerCase()] || [];
}

/** Load offline synonyms */
function loadOfflineSynonyms() {
  if (fs.existsSync(OFFLINE_SYNONYMS_PATH)) {
    return JSON.parse(fs.readFileSync(OFFLINE_SYNONYMS_PATH, 'utf-8'));
  }
  return {};
}

// ── Helpers ────────────────────────────────────────────────────────────────

function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Write an HTML string to dist/<route>.html (or dist/index.html for /).
 *  Uses flat .html files instead of directory/index.html so Cloudflare Pages
 *  serves them at extensionless URLs without a 308 trailing-slash redirect
 *  (which Google reports as "Redirect error" and refuses to index). */
function writePage(route, html) {
  if (route === '/') {
    fs.writeFileSync(path.join(DIST, 'index.html'), html);
  } else {
    const parts = route.replace(/^\//, '').split('/');
    const filename = parts.pop() + '.html';
    const dir = parts.length > 0 ? path.join(DIST, ...parts) : DIST;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, filename), html);
  }
}

function loadSitemapRoutes(filePath, pattern) {
  if (!fs.existsSync(filePath)) return [];
  const xml = fs.readFileSync(filePath, 'utf-8');
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
  const decodeEntities = (value) =>
    value
      .replace(/&amp;/g, '&')
      .replace(/&apos;/g, '\'')
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  return matches
    .map(match => decodeEntities(match[1].trim()))
    .filter(url => pattern.test(url))
    .map(url => new URL(url).pathname);
}

// ── Template manipulation ──────────────────────────────────────────────────

/**
 * Takes the SPA shell HTML and replaces:
 *   - <title>
 *   - <meta name="description">
 *   - <meta name="keywords">
 *   - <link rel="canonical">
 *   - og:title, og:description, og:url
 *   - twitter:title, twitter:description
 *   - JSON-LD scripts (all replaced with a single new one, if provided)
 *   - Content inside <div id="root">
 */
function stripRatingSchema(value) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(stripRatingSchema);
  const cloned = { ...value };
  delete cloned.aggregateRating;
  delete cloned.review;
  Object.keys(cloned).forEach((key) => {
    cloned[key] = stripRatingSchema(cloned[key]);
  });
  return cloned;
}

function stampTemplate(template, { title, description, canonical, keywords, jsonLd, bodyHtml }) {
  let html = template;

  // Title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);

  // Meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${esc(description)}"`
  );

  // Keywords
  if (keywords) {
    html = html.replace(
      /<meta name="keywords" content="[^"]*"/,
      `<meta name="keywords" content="${esc(keywords)}"`
    );
  }

  // Canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${esc(canonical)}"`
  );

  // Open Graph
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${esc(title)}"`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${esc(description)}"`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${esc(canonical)}"`
  );

  // Twitter
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${esc(title)}"`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${esc(description)}"`
  );

  // Replace all JSON-LD blocks with the new one (if provided)
  if (jsonLd) {
    const sanitizedJsonLd = stripRatingSchema(jsonLd);
    // Remove existing JSON-LD blocks
    html = html.replace(
      /\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
      ''
    );
    // Insert new one before </head>
    const ldScript = `\n    <script type="application/ld+json">\n    ${JSON.stringify(sanitizedJsonLd)}\n    </script>`;
    html = html.replace('</head>', `${ldScript}\n  </head>`);
  }

  // Body HTML inside <div id="root">
  if (bodyHtml) {
    html = html.replace(
      /<div id="root"><\/div>/,
      `<div id="root">${bodyHtml}</div>`
    );
  }

  return html;
}

// ── HTML generators ────────────────────────────────────────────────────────

function poemPageHtml(poem) {
  const lines = poem.text.split('\n');
  const themes = poem.analysis.themes.map(t => `<li>${esc(t)}</li>`).join('');
  const devices = poem.analysis.literaryDevices
    .map(d => `<dt>${esc(d.device)}</dt><dd>${esc(d.example)} &mdash; ${esc(d.explanation)}</dd>`)
    .join('');
  const lineByLine = poem.analysis.lineByLine
    .map(s => `<h3>Lines ${esc(s.lines)}</h3><p>${esc(s.commentary)}</p>`)
    .join('');

  return `<article>
<h1>${esc(poem.title)} by ${esc(poem.poet)}</h1>
<p>Form: ${esc(poem.form)} | Year: ${poem.year}</p>
<section><h2>Full Text</h2><pre>${esc(lines.join('\n'))}</pre></section>
<section><h2>Overview</h2><p>${esc(poem.analysis.overview)}</p></section>
<section><h2>Line-by-Line Analysis</h2>${lineByLine}</section>
<section><h2>Themes</h2><ul>${themes}</ul></section>
<section><h2>Literary Devices</h2><dl>${devices}</dl></section>
${poem.analysis.historicalContext ? `<section><h2>Historical Context</h2><p>${esc(poem.analysis.historicalContext)}</p></section>` : ''}
</article>`;
}

function poemJsonLd(poem) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${poem.title} by ${poem.poet} - Analysis & Commentary`,
    description: poem.seoDescription,
    author: { '@type': 'Organization', name: 'Poetry Editor' },
    publisher: { '@type': 'Organization', name: 'Poetry Editor', url: SITE },
    mainEntity: {
      '@type': 'CreativeWork',
      name: poem.title,
      author: {
        '@type': 'Person',
        name: poem.poet,
        birthDate: poem.poetBirth.toString(),
        deathDate: poem.poetDeath.toString(),
      },
      datePublished: poem.year.toString(),
      genre: poem.form,
      inLanguage: 'en',
      about: poem.analysis.themes.map(t => ({ '@type': 'Thing', name: t })),
    },
  };
}

function poemsListHtml(poems) {
  // Group by poet
  const byPoet = {};
  for (const p of poems) {
    (byPoet[p.poet] ||= []).push(p);
  }
  const sorted = Object.keys(byPoet).sort((a, b) => {
    const la = a.split(' ').pop() || a;
    const lb = b.split(' ').pop() || b;
    return la.localeCompare(lb);
  });

  const sections = sorted.map(poet => {
    const links = byPoet[poet]
      .sort((a, b) => a.title.localeCompare(b.title))
      .map(p => `<li><a href="/poems/${esc(p.slug)}">${esc(p.title)} (${p.year})</a></li>`)
      .join('');
    return `<section><h2>${esc(poet)}</h2><ul>${links}</ul></section>`;
  }).join('');

  return `<article>
<h1>Poem Analyses</h1>
<p>Explore our collection of ${poems.length} analyzed poems with line-by-line commentary, literary devices, themes, and technical analysis.</p>
${sections}
</article>`;
}

function rhymeWordHtml(word, cmuDict, rhymeIndex) {
  const rhymes = getPerfectRhymesNode(word, cmuDict, rhymeIndex, 50);
  const syllableCount = getSyllableCountNode(word, cmuDict);
  const ipa = getPronunciationIPA(word, cmuDict);

  let html = `<article>\n<h1>Words That Rhyme with ${esc(word)}</h1>\n`;
  html += `<p>${syllableCount} syllable${syllableCount !== 1 ? 's' : ''}`;
  if (ipa) html += ` &middot; Pronunciation: <span>${esc(ipa)}</span>`;
  html += `</p>\n`;

  if (rhymes.length > 0) {
    html += `<p>Found <strong>${rhymes.length}</strong> perfect rhyme${rhymes.length !== 1 ? 's' : ''} for &ldquo;${esc(word)}&rdquo;.</p>\n`;

    // Group by syllable count
    const bySyl = {};
    for (const r of rhymes) {
      const s = getSyllableCountNode(r, cmuDict);
      (bySyl[s] ||= []).push(r);
    }
    html += `<section>\n<h2>Perfect Rhymes for ${esc(word)}</h2>\n`;
    for (const syl of Object.keys(bySyl).sort((a, b) => Number(a) - Number(b))) {
      const words = bySyl[syl];
      html += `<h3>${syl}-Syllable Rhyme${words.length !== 1 ? 's' : ''}</h3>\n<ul>`;
      for (const w of words) {
        html += `<li><a href="/rhymes/${encodeURIComponent(w)}">${esc(w)}</a></li>`;
      }
      html += `</ul>\n`;
    }
    html += `</section>\n`;
  } else {
    html += `<p>Find perfect rhymes, near rhymes, and syllable breakdowns for <strong>${esc(word)}</strong>. Filter by meter, syllables, and originality to match your line.</p>\n`;
  }

  // Cross-links
  html += `<nav>\n<h2>Explore Related Words</h2>\n<ul>`;
  html += `<li><a href="/synonyms/${encodeURIComponent(word.toLowerCase())}">Synonyms for ${esc(word)}</a></li>`;
  // Link to top rhymes
  const crossLinks = rhymes.slice(0, 5);
  for (const r of crossLinks) {
    html += `<li><a href="/rhymes/${encodeURIComponent(r)}">Rhymes with ${esc(r)}</a></li>`;
  }
  html += `</ul>\n</nav>\n`;
  html += `<p><a href="/rhymes">Rhyme Finder</a> | <a href="/synonyms">Synonym Finder</a> | <a href="/">Poetry Editor</a></p>\n</article>`;
  return html;
}

function synonymWordHtml(word, offlineSyns) {
  const entry = offlineSyns[word.toLowerCase()];
  const senses = loadWordnetSenses(word);

  let html = `<article>\n<h1>Synonyms for ${esc(word)}</h1>\n`;

  // Render WordNet senses if available
  if (senses.length > 0) {
    const totalSyns = senses.reduce((sum, s) => sum + (s.synonyms?.length || 0), 0);
    html += `<p>Found <strong>${totalSyns}</strong> synonym${totalSyns !== 1 ? 's' : ''} across ${senses.length} meaning${senses.length !== 1 ? 's' : ''} for &ldquo;${esc(word)}&rdquo;.</p>\n`;

    for (const sense of senses) {
      if (!sense.synonyms || sense.synonyms.length === 0) continue;
      const posLabel = sense.pos ? ` (${esc(sense.pos)})` : '';
      html += `<section>\n<h2>${esc(sense.gloss)}${posLabel}</h2>\n<ul>`;
      for (const syn of sense.synonyms.slice(0, 15)) {
        const synWord = syn.word || syn;
        if (synWord.includes(' ')) continue; // Skip multi-word
        html += `<li><a href="/synonyms/${encodeURIComponent(synWord.toLowerCase())}">${esc(synWord)}</a></li>`;
      }
      html += `</ul>\n</section>\n`;
    }
  } else if (entry?.synonyms?.length > 0) {
    // Fall back to offline synonyms
    html += `<p>Found <strong>${entry.synonyms.length}</strong> synonym${entry.synonyms.length !== 1 ? 's' : ''} for &ldquo;${esc(word)}&rdquo;.</p>\n`;
    html += `<section>\n<h2>Synonyms</h2>\n<ul>`;
    for (const syn of entry.synonyms) {
      html += `<li><a href="/synonyms/${encodeURIComponent(syn.toLowerCase())}">${esc(syn)}</a></li>`;
    }
    html += `</ul>\n</section>\n`;
  } else {
    html += `<p>Find synonyms for <strong>${esc(word)}</strong> organized by meaning and strength, with syllable filters to keep your meter consistent.</p>\n`;
  }

  // Antonyms
  if (entry?.antonyms?.length > 0) {
    html += `<section>\n<h2>Antonyms for ${esc(word)}</h2>\n<ul>`;
    for (const ant of entry.antonyms) {
      html += `<li><a href="/synonyms/${encodeURIComponent(ant.toLowerCase())}">${esc(ant)}</a></li>`;
    }
    html += `</ul>\n</section>\n`;
  }

  // Cross-links
  html += `<nav>\n<h2>Explore Related Words</h2>\n<ul>`;
  html += `<li><a href="/rhymes/${encodeURIComponent(word.toLowerCase())}">Rhymes with ${esc(word)}</a></li>`;
  // Link to top synonyms
  const topSyns = senses.length > 0
    ? senses.flatMap(s => (s.synonyms || []).map(syn => syn.word || syn)).filter(w => !w.includes(' ')).slice(0, 5)
    : (entry?.synonyms || []).slice(0, 5);
  for (const s of topSyns) {
    html += `<li><a href="/synonyms/${encodeURIComponent(s.toLowerCase())}">Synonyms for ${esc(s)}</a></li>`;
  }
  html += `</ul>\n</nav>\n`;
  html += `<p><a href="/synonyms">Synonym Finder</a> | <a href="/rhymes">Rhyme Finder</a> | <a href="/">Poetry Editor</a></p>\n</article>`;
  return html;
}

function makeRhymeJsonLd(word, cmuDict, rhymeIndex) {
  const rhymes = getPerfectRhymesNode(word, cmuDict, rhymeIndex, 50);
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Words That Rhyme with ${word}`,
    description: `Perfect and near rhymes for "${word}" — ${rhymes.length} results`,
    numberOfItems: rhymes.length,
    itemListElement: rhymes.slice(0, 20).map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: r,
      url: `${SITE}/rhymes/${encodeURIComponent(r)}`,
    })),
  };
}

function makeSynonymJsonLd(word, offlineSyns) {
  const senses = loadWordnetSenses(word);
  const entry = offlineSyns[word.toLowerCase()];
  const synList = senses.length > 0
    ? senses.flatMap(s => (s.synonyms || []).map(syn => syn.word || syn)).filter(w => !w.includes(' '))
    : (entry?.synonyms || []);
  const unique = [...new Set(synList)];
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Synonyms for ${word}`,
    description: `Synonyms and related words for "${word}" — ${unique.length} results`,
    numberOfItems: unique.length,
    itemListElement: unique.slice(0, 20).map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s,
      url: `${SITE}/synonyms/${encodeURIComponent(s.toLowerCase())}`,
    })),
  };
}

function rhymeSchemePageHtml(scheme) {
  const tips = scheme.writingTips.map(t => `<li>${esc(t)}</li>`).join('');
  const famous = scheme.famousPoems
    .map(p => p.slug
      ? `<li><a href="/poems/${esc(p.slug)}">${esc(p.title)}</a> by ${esc(p.poet)}</li>`
      : `<li>${esc(p.title)} by ${esc(p.poet)}</li>`)
    .join('');
  const example = scheme.example.lines
    .map((l, i) => `<p>${esc(l)} <em>(${esc(scheme.example.labels[i])})</em></p>`)
    .join('');

  return `<article>
<h1>${esc(scheme.name)}</h1>
<p>Pattern: ${esc(scheme.pattern)}</p>
<section><h2>About</h2><p>${esc(scheme.description)}</p></section>
<section><h2>Explanation</h2><p>${esc(scheme.explanation)}</p></section>
<section><h2>Example</h2>${example}<p>&mdash; ${esc(scheme.example.attribution)}</p></section>
<section><h2>Famous Poems</h2><ul>${famous}</ul></section>
<section><h2>Writing Tips</h2><ul>${tips}</ul></section>
</article>`;
}

function rhymeSchemeJsonLd(scheme) {
  const pattern = scheme.pattern.replace(/\s+/g, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the ${pattern} rhyme scheme?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: scheme.description,
        },
      },
      {
        '@type': 'Question',
        name: `How do you write a poem with the ${pattern} rhyme scheme?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: scheme.writingTips.join(' '),
        },
      },
    ],
  };
}

// ── Static page definitions ────────────────────────────────────────────────

const TOOL_PAGES = [
  {
    route: '/rhymes',
    title: 'Rhyme Finder & Dictionary - Find Words That Rhyme | Poetry Editor',
    description: 'Free rhyme finder and rhyming dictionary. Find perfect rhymes, near rhymes, and slant rhymes for any word. Filter by syllables, topic, and originality.',
    keywords: 'rhyming dictionary, words that rhyme, rhyme finder, poetry rhymes, slant rhymes, near rhymes, rhyme with meaning',
    bodyHtml: `<article><h1>Rhyme Finder &amp; Dictionary</h1><p>Find perfect rhymes, near rhymes, and slant rhymes for any word. Filter by syllable count, topic, and originality to discover fresh rhyming words for your poetry and songwriting.</p><ul><li><strong>Perfect rhymes</strong> &mdash; words that share identical ending sounds</li><li><strong>Near rhymes</strong> &mdash; words with similar but not identical sounds (slant rhymes)</li><li><strong>Topic filtering</strong> &mdash; find rhymes related to a specific subject</li><li><strong>Clich&eacute; detection</strong> &mdash; avoid overused rhyme pairs</li></ul><p><a href="/synonyms">Find synonyms</a> | <a href="/syllables">Count syllables</a> | <a href="/poems">Browse poem analyses</a></p></article>`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is the difference between perfect rhymes and near rhymes?', acceptedAnswer: { '@type': 'Answer', text: "Perfect rhymes share the same ending sound from the stressed vowel onward (like 'love' and 'dove'). Near rhymes (also called slant rhymes or half rhymes) have similar but not identical sounds (like 'love' and 'move'). Both are useful in poetry and songwriting." } },
        { '@type': 'Question', name: 'How can I find rhymes that also relate to a specific topic?', acceptedAnswer: { '@type': 'Answer', text: "Use the 'About (topic)' filter in our Rhyme Dictionary. Enter a word in the search field, then add a topic word to find rhymes with thematic associations." } },
        { '@type': 'Question', name: 'What are cliché rhymes and how can I avoid them?', acceptedAnswer: { '@type': 'Answer', text: "Cliché rhymes are overused word pairs like 'love/above', 'heart/apart', or 'fire/desire'. Enable 'Avoid Clichés' in our filters to hide commonly overused rhyme pairs and discover more original options." } },
      ],
    },
  },
  {
    route: '/synonyms',
    title: 'Synonym Finder - Word Alternatives for Poetry | Poetry Editor',
    description: 'Free synonym finder for poets. Find synonyms, specific examples (hyponyms), and antonyms organized by meaning and strength. Discover the perfect word for your poem or song.',
    keywords: 'synonyms, hyponyms, antonyms, poetry words, word alternatives, similar words, thesaurus for poets',
    bodyHtml: `<article><h1>Synonym Finder</h1><p>Find the perfect word for your poem. Our synonym finder organizes results by meaning and syllable count, making it easy to maintain meter while finding alternatives.</p><ul><li><strong>Synonyms</strong> &mdash; words with similar meanings, organized by sense</li><li><strong>Hyponyms</strong> &mdash; more specific examples of a concept</li><li><strong>Antonyms</strong> &mdash; opposite words for contrast</li></ul><p><a href="/rhymes">Find rhymes</a> | <a href="/syllables">Count syllables</a> | <a href="/poems">Browse poem analyses</a></p></article>`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is a thesaurus and how does it help poets?', acceptedAnswer: { '@type': 'Answer', text: 'A thesaurus groups words by meaning, showing synonyms and antonyms. For poets, it helps find alternative words that fit a specific meter, rhyme scheme, or emotional tone.' } },
        { '@type': 'Question', name: 'What is the difference between synonyms and antonyms?', acceptedAnswer: { '@type': 'Answer', text: "Synonyms are words with similar meanings (like 'happy' and 'joyful'), while antonyms are words with opposite meanings (like 'happy' and 'sad'). Both are useful in poetry." } },
      ],
    },
  },
  {
    route: '/syllables',
    title: 'Syllable Counter - Count Syllables in Any Word | Poetry Editor',
    description: 'Free online syllable counter. Count syllables in words, sentences, or poems. See syllable breakdown and stress patterns for poetry and songwriting.',
    keywords: 'syllable counter, count syllables, how many syllables, syllable breakdown, stress pattern, poetry syllables',
    bodyHtml: `<article><h1>Syllable Counter</h1><p>Count syllables in any word or phrase. See stress patterns and syllable breakdowns to perfect your meter in poetry and songwriting.</p><p>Our counter uses the CMU Pronouncing Dictionary for accurate counts based on actual pronunciation, not spelling rules.</p><p><a href="/rhymes">Find rhymes</a> | <a href="/synonyms">Find synonyms</a> | <a href="/haiku-checker">Check haiku</a></p></article>`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'How do you count syllables in a word?', acceptedAnswer: { '@type': 'Answer', text: "Count the vowel sounds (not letters). Subtract silent vowels (like the 'e' at the end of 'cake') and vowel pairs that make one sound (like 'ou' in 'soup'). Our syllable counter uses the CMU Pronouncing Dictionary for accuracy." } },
        { '@type': 'Question', name: 'What is a stress pattern in poetry?', acceptedAnswer: { '@type': 'Answer', text: 'A stress pattern shows which syllables are emphasized when pronouncing a word. Primary stress is the main emphasis, secondary stress is lighter, and unstressed syllables are spoken softly. Understanding stress patterns helps with writing metered poetry.' } },
      ],
    },
  },
  {
    route: '/haiku-checker',
    title: 'Haiku Checker - Validate 5-7-5 Syllable Pattern | Poetry Editor',
    description: "Free online haiku checker. Validate your haiku's 5-7-5 syllable pattern instantly. Get real-time feedback on each line's syllable count.",
    keywords: 'haiku checker, 5-7-5 syllable counter, haiku validator, haiku syllables, write haiku, haiku format',
    bodyHtml: `<article><h1>Haiku Checker</h1><p>Validate your haiku&rsquo;s 5-7-5 syllable pattern instantly. Enter each line and get real-time feedback on syllable count.</p><p>A haiku follows a 5-7-5 syllable pattern: 5 syllables in the first line, 7 in the second, and 5 in the third.</p><p><a href="/learn/haiku">Learn how to write a haiku</a> | <a href="/syllables">Syllable counter</a></p></article>`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is the 5-7-5 syllable pattern in haiku?', acceptedAnswer: { '@type': 'Answer', text: 'A haiku follows a 5-7-5 syllable pattern: 5 syllables in the first line, 7 syllables in the second line, and 5 syllables in the third line.' } },
        { '@type': 'Question', name: 'What makes a good haiku besides the syllable count?', acceptedAnswer: { '@type': 'Answer', text: "Traditional haiku include a 'kigo' (seasonal reference), focus on nature, and contain a 'kireji' (cutting word) that creates a pause or juxtaposition." } },
      ],
    },
  },
  {
    route: '/rhyme-scheme-analyzer',
    title: 'Rhyme Scheme Maker - Create Limericks, Sonnets, and More | Poetry Editor',
    description: 'Interactive rhyme scheme maker for poetry. Write limericks, sonnets, quatrains with real-time rhyme guidance. See correct and incorrect rhymes highlighted as you type.',
    keywords: 'rhyme scheme maker, limerick generator, sonnet writer, rhyme pattern, ABAB rhyme, poetry form, rhyme helper',
    bodyHtml: `<article><h1>Rhyme Scheme Maker</h1><p>Write poetry with real-time rhyme guidance. Choose a form&mdash;limerick, sonnet, quatrain, or custom&mdash;and see correct and incorrect rhymes highlighted as you type.</p><p><a href="/rhyme-scheme/aabb">AABB couplets</a> | <a href="/rhyme-scheme/abab">ABAB alternate</a> | <a href="/rhyme-scheme/shakespearean-sonnet">Shakespearean sonnet</a> | <a href="/rhyme-scheme/petrarchan-sonnet">Petrarchan sonnet</a></p></article>`,
  },
  {
    route: '/sonnet-checker',
    title: 'Sonnet Checker - Validate Shakespearean & Petrarchan Sonnets | Poetry Editor',
    description: 'Free online sonnet checker. Validate Shakespearean, Petrarchan, and Spenserian sonnet forms. Check 14-line structure, rhyme scheme, and iambic pentameter.',
    keywords: 'sonnet checker, sonnet validator, Shakespearean sonnet, Petrarchan sonnet, iambic pentameter checker, 14 line poem, sonnet form',
    bodyHtml: `<article><h1>Sonnet Checker</h1><p>Validate your sonnet&rsquo;s structure, rhyme scheme, and meter. Supports Shakespearean (ABAB CDCD EFEF GG), Petrarchan (ABBAABBA CDECDE), and Spenserian forms.</p><p><a href="/learn/sonnet">Learn how to write a sonnet</a> | <a href="/rhyme-scheme/shakespearean-sonnet">Shakespearean sonnet scheme</a></p></article>`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is the structure of a Shakespearean sonnet?', acceptedAnswer: { '@type': 'Answer', text: 'A Shakespearean sonnet has 14 lines in iambic pentameter with the rhyme scheme ABAB CDCD EFEF GG. Three quatrains develop the theme, followed by a closing couplet.' } },
        { '@type': 'Question', name: 'What is the difference between Shakespearean and Petrarchan sonnets?', acceptedAnswer: { '@type': 'Answer', text: "Shakespearean sonnets have three quatrains plus a couplet (ABAB CDCD EFEF GG), while Petrarchan sonnets divide into an octave (ABBAABBA) and a sestet (CDECDE). The volta comes at the couplet in Shakespearean but between octave and sestet in Petrarchan." } },
      ],
    },
  },
  {
    route: '/poetry-statistics',
    title: 'Poetry Statistics - Rhyme Data, Word Frequency & More | Poetry Editor',
    description: "Comprehensive poetry statistics: most common rhymes in English poetry, overused rhyme pairs, word frequency in Shakespeare's sonnets vs modern poetry, and syllable patterns by form.",
    keywords: 'poetry statistics, rhyme statistics, most common rhymes, poetry word frequency, Shakespeare sonnets words, poetry data',
    bodyHtml: `<article><h1>Poetry Statistics</h1><p>Explore data about English poetry: the most common rhymes, overused rhyme pairs, word frequency patterns in Shakespeare&rsquo;s sonnets versus modern poetry, and syllable distributions across forms.</p><p><a href="/rhymes">Rhyme dictionary</a> | <a href="/syllables">Syllable counter</a> | <a href="/poems">Browse poems</a></p></article>`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: 'Poetry Statistics',
      description: 'Statistical analysis of English poetry including rhyme frequency, word usage patterns, and syllable distributions.',
      url: `${SITE}/poetry-statistics`,
      creator: { '@type': 'Organization', name: 'Poetry Editor' },
      temporalCoverage: '1558/2024',
      keywords: ['poetry', 'rhyme', 'word frequency', 'literary analysis'],
    },
  },
];

const ALIAS_PAGES = [
  { route: '/rhyme-finder', canonicalRoute: '/rhymes', title: 'Rhyme Finder - Find Words That Rhyme | Poetry Editor', description: 'Free rhyme finder. Find perfect rhymes, near rhymes, and slant rhymes for any word. Filter by syllables, topic, and originality.' },
  { route: '/rhyming-dictionary', canonicalRoute: '/rhymes', title: 'Rhyming Dictionary - Find Words That Rhyme | Poetry Editor', description: 'Free online rhyming dictionary. Look up rhymes for any word with filters for syllable count, topic, and originality.' },
  { route: '/thesaurus', canonicalRoute: '/synonyms', title: 'Poetry Thesaurus - Find the Perfect Word | Poetry Editor', description: 'Free thesaurus for poets. Find synonyms, hyponyms, and antonyms organized by meaning and syllable count.' },
  { route: '/synonym-finder', canonicalRoute: '/synonyms', title: 'Synonym Finder - Word Alternatives for Poetry | Poetry Editor', description: 'Find synonyms organized by meaning and syllable count. Perfect for maintaining meter while finding fresh word choices.' },
  { route: '/syllable-counter', canonicalRoute: '/syllables', title: 'Syllable Counter - Count Syllables in Any Word | Poetry Editor', description: 'Free online syllable counter. Count syllables in words, sentences, or poems with stress pattern analysis.' },
];

const LEARN_PAGES = [
  {
    route: '/learn/haiku',
    title: 'How to Write a Haiku - Complete Guide for Beginners | Poetry Editor',
    description: 'Learn how to write a haiku with our step-by-step guide. Understand the 5-7-5 syllable pattern, kigo (seasonal words), kireji (cutting words), and the art of capturing a moment in 17 syllables.',
    keywords: 'how to write a haiku, haiku writing guide, 5-7-5 syllable pattern, kigo seasonal words, kireji cutting word, haiku for beginners',
    bodyHtml: `<article><h1>How to Write a Haiku</h1><p>Master the ancient Japanese art of capturing a moment in just 17 syllables. A haiku follows a <strong>5-7-5 syllable pattern</strong> across three lines.</p><p>Traditional haiku contain a <em>kigo</em> (seasonal reference), a <em>kireji</em> (cutting word), and present two images that contrast or connect in surprising ways.</p><p><a href="/haiku-checker">Try the haiku checker</a> | <a href="/syllables">Syllable counter</a></p></article>`,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Article', headline: 'How to Write a Haiku - Complete Guide for Beginners', description: 'Learn the art of haiku writing with our comprehensive guide.', author: { '@type': 'Organization', name: 'Poetry Editor' }, publisher: { '@type': 'Organization', name: 'Poetry Editor', url: SITE } },
  },
  {
    route: '/learn/sonnet',
    title: 'How to Write a Sonnet - Complete Guide to Shakespearean & Petrarchan Forms | Poetry Editor',
    description: 'Learn how to write a sonnet with our comprehensive guide. Master the 14-line structure, iambic pentameter, rhyme schemes (ABAB CDCD EFEF GG), and the art of the volta.',
    keywords: 'how to write a sonnet, Shakespearean sonnet, Petrarchan sonnet, iambic pentameter, sonnet rhyme scheme, volta',
    bodyHtml: `<article><h1>How to Write a Sonnet</h1><p>Master the 14-line form that has defined English poetry for centuries. Learn about Shakespearean (ABAB CDCD EFEF GG) and Petrarchan (ABBAABBA CDECDE) structures, iambic pentameter, and the volta.</p><p><a href="/sonnet-checker">Try the sonnet checker</a> | <a href="/rhyme-scheme/shakespearean-sonnet">Shakespearean sonnet scheme</a></p></article>`,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Article', headline: 'How to Write a Sonnet - Complete Guide', description: 'Master the art of sonnet writing.', author: { '@type': 'Organization', name: 'Poetry Editor' }, publisher: { '@type': 'Organization', name: 'Poetry Editor', url: SITE } },
  },
  {
    route: '/learn/free-verse',
    title: 'How to Write Free Verse Poetry - A Complete Guide | Poetry Editor',
    description: 'Learn how to write free verse poetry. Understand line breaks, rhythm without meter, imagery, and the techniques that make free verse powerful.',
    keywords: 'how to write free verse, free verse poetry, modern poetry, line breaks, vers libre, poetry without rhyme',
    bodyHtml: `<article><h1>How to Write Free Verse Poetry</h1><p>Free verse abandons fixed meter and rhyme, but &ldquo;no rules&rdquo; doesn&rsquo;t mean no craft. Learn how line breaks, rhythm, and imagery create powerful poetry without formal constraints.</p><p><a href="/rhyme-scheme/free-verse">Free verse rhyme scheme</a> | <a href="/learn/scansion">Learn about meter</a></p></article>`,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Article', headline: 'How to Write Free Verse Poetry - A Complete Guide', description: 'Master free verse poetry techniques.', author: { '@type': 'Organization', name: 'Poetry Editor' }, publisher: { '@type': 'Organization', name: 'Poetry Editor', url: SITE } },
  },
  {
    route: '/learn/scansion',
    title: 'Understanding Meter & Scansion - A Complete Guide to Poetic Rhythm | Poetry Editor',
    description: 'Learn scansion: how to mark stressed and unstressed syllables, identify iambic pentameter, and understand poetic meter. Covers iambs, trochees, anapests, dactyls, and more.',
    keywords: 'scansion, poetic meter, iambic pentameter, stressed syllables, trochee, anapest, dactyl, poetry rhythm',
    bodyHtml: `<article><h1>Understanding Meter &amp; Scansion</h1><p>Learn to read the rhythm of poetry. Scansion is the art of marking stressed and unstressed syllables to reveal a poem&rsquo;s meter&mdash;iambic, trochaic, anapestic, or dactylic.</p><p><a href="/syllables">Syllable counter</a> | <a href="/learn/sonnet">Learn about sonnets</a></p></article>`,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Article', headline: 'Understanding Meter & Scansion', description: 'Master scansion and poetic meter.', author: { '@type': 'Organization', name: 'Poetry Editor' }, publisher: { '@type': 'Organization', name: 'Poetry Editor', url: SITE } },
  },
  {
    route: '/learn/villanelle',
    title: 'How to Write a Villanelle - Complete Guide with Examples | Poetry Editor',
    description: 'Learn how to write a villanelle: the 19-line form with two refrains and an ABA rhyme scheme. Examples from Dylan Thomas, Elizabeth Bishop, and Sylvia Plath.',
    keywords: 'villanelle, how to write a villanelle, villanelle form, ABA rhyme scheme, refrain poetry, Dylan Thomas Do Not Go Gentle',
    bodyHtml: `<article><h1>How to Write a Villanelle</h1><p>The villanelle is a 19-line poem built on two refrains and an ABA rhyme scheme. Five tercets followed by a closing quatrain, with the first and third lines recurring throughout as refrains.</p><section><h2>Structure</h2><p>5 tercets (3-line stanzas) + 1 quatrain (4-line stanza) = 19 lines total. Only two rhyme sounds throughout. The first line (A1) and third line (A2) alternate as the final line of each tercet, then appear together to close the quatrain.</p></section><section><h2>Famous Villanelles</h2><ul><li>&ldquo;Do Not Go Gentle into That Good Night&rdquo; by Dylan Thomas</li><li>&ldquo;One Art&rdquo; by Elizabeth Bishop</li><li>&ldquo;Mad Girl&rsquo;s Love Song&rdquo; by Sylvia Plath</li></ul></section><p><a href="/rhymes">Rhyme finder</a> | <a href="/learn/sonnet">How to write a sonnet</a> | <a href="/learn/free-verse">Free verse guide</a></p></article>`,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Article', headline: 'How to Write a Villanelle', description: 'Complete guide to the villanelle form.', author: { '@type': 'Organization', name: 'Poetry Editor' }, publisher: { '@type': 'Organization', name: 'Poetry Editor', url: SITE } },
  },
  {
    route: '/learn/pantoum',
    title: 'How to Write a Pantoum - Guide to the Repeating Form | Poetry Editor',
    description: 'Learn how to write a pantoum: the interlocking form where lines repeat across stanzas. A Malay-origin form with hypnotic, circular structure.',
    keywords: 'pantoum, how to write a pantoum, pantoum form, repeating lines poetry, Malay poetry form, interlocking stanzas',
    bodyHtml: `<article><h1>How to Write a Pantoum</h1><p>The pantoum is a form of interlocking quatrains where the second and fourth lines of each stanza become the first and third lines of the next. This creates a hypnotic, spiraling effect.</p><section><h2>Structure</h2><p>Quatrains (4-line stanzas) of any number. Lines 2 and 4 of each stanza reappear as lines 1 and 3 of the following stanza. The final stanza often loops back to the poem&rsquo;s opening lines.</p></section><section><h2>Origins</h2><p>The pantoum originated as the <em>pantun</em> in Malay literature and was adapted into Western poetry by French poets in the 19th century, notably Victor Hugo and Charles Baudelaire.</p></section><p><a href="/rhymes">Rhyme finder</a> | <a href="/learn/villanelle">Villanelle guide</a> | <a href="/learn/sonnet">Sonnet guide</a></p></article>`,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Article', headline: 'How to Write a Pantoum', description: 'Guide to the pantoum form.', author: { '@type': 'Organization', name: 'Poetry Editor' }, publisher: { '@type': 'Organization', name: 'Poetry Editor', url: SITE } },
  },
  {
    route: '/learn/ode',
    title: 'How to Write an Ode - Forms, Examples & Guide | Poetry Editor',
    description: 'Learn how to write an ode: a lyric poem of praise and celebration. Covers Pindaric, Horatian, and irregular odes with examples from Keats, Shelley, and Neruda.',
    keywords: 'ode, how to write an ode, Pindaric ode, Horatian ode, irregular ode, ode to, Keats odes',
    bodyHtml: `<article><h1>How to Write an Ode</h1><p>An ode is a lyric poem that addresses a subject with elevated language, deep feeling, and often elaborate structure. It&rsquo;s a poem of praise, celebration, or meditation.</p><section><h2>Three Types of Ode</h2><ul><li><strong>Pindaric Ode</strong> &mdash; Strophe, antistrophe, and epode. Grand and ceremonial.</li><li><strong>Horatian Ode</strong> &mdash; Consistent stanza form, more meditative and personal.</li><li><strong>Irregular Ode</strong> &mdash; Free in form but elevated in tone. Most modern odes.</li></ul></section><section><h2>Famous Odes</h2><ul><li>&ldquo;Ode to a Nightingale&rdquo; by John Keats</li><li>&ldquo;Ode to the West Wind&rdquo; by Percy Bysshe Shelley</li><li>&ldquo;Ode to My Socks&rdquo; by Pablo Neruda</li></ul></section><p><a href="/rhymes">Rhyme finder</a> | <a href="/learn/sonnet">Sonnet guide</a> | <a href="/learn/free-verse">Free verse guide</a></p></article>`,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Article', headline: 'How to Write an Ode', description: 'Complete guide to writing odes.', author: { '@type': 'Organization', name: 'Poetry Editor' }, publisher: { '@type': 'Organization', name: 'Poetry Editor', url: SITE } },
  },
  {
    route: '/learn/elegy',
    title: 'How to Write an Elegy - Guide to Poems of Loss | Poetry Editor',
    description: 'Learn how to write an elegy: a poem of mourning, loss, and remembrance. Structure, tone, and examples from Milton, Tennyson, and Auden.',
    keywords: 'elegy, how to write an elegy, elegy poem, poem of mourning, elegiac verse, memorial poem',
    bodyHtml: `<article><h1>How to Write an Elegy</h1><p>An elegy is a poem of mourning, loss, and remembrance. It moves through grief toward consolation or acceptance, honoring the dead while meditating on mortality itself.</p><section><h2>Traditional Structure</h2><p>Classical elegies follow three movements: <strong>lament</strong> (expressing grief), <strong>praise</strong> (celebrating the deceased), and <strong>consolation</strong> (finding meaning or acceptance). Modern elegies may compress, rearrange, or subvert these stages.</p></section><section><h2>Famous Elegies</h2><ul><li>&ldquo;Lycidas&rdquo; by John Milton</li><li>&ldquo;In Memoriam A.H.H.&rdquo; by Alfred, Lord Tennyson</li><li>&ldquo;Funeral Blues&rdquo; by W. H. Auden</li></ul></section><p><a href="/rhymes">Rhyme finder</a> | <a href="/learn/ode">Ode guide</a> | <a href="/learn/free-verse">Free verse guide</a></p></article>`,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Article', headline: 'How to Write an Elegy', description: 'Guide to writing elegies.', author: { '@type': 'Organization', name: 'Poetry Editor' }, publisher: { '@type': 'Organization', name: 'Poetry Editor', url: SITE } },
  },
  {
    route: '/learn/ballad',
    title: 'How to Write a Ballad - Narrative Poetry Guide | Poetry Editor',
    description: 'Learn how to write a ballad: a narrative poem with a songlike quality. Covers ballad meter, ABAB or ABCB rhyme schemes, and the tradition from folk ballads to literary ballads.',
    keywords: 'ballad, how to write a ballad, ballad meter, ballad stanza, narrative poetry, folk ballad, literary ballad',
    bodyHtml: `<article><h1>How to Write a Ballad</h1><p>A ballad is a narrative poem that tells a story with a songlike quality. Traditionally oral, ballads use simple language, repetition, and strong rhythms to carry dramatic tales of love, death, and adventure.</p><section><h2>Ballad Meter</h2><p>The classic ballad stanza alternates lines of iambic tetrameter (4 beats) and iambic trimeter (3 beats), rhyming ABAB or ABCB. This &ldquo;common meter&rdquo; gives ballads their characteristic swing.</p></section><section><h2>Famous Ballads</h2><ul><li>&ldquo;The Rime of the Ancient Mariner&rdquo; by Samuel Taylor Coleridge</li><li>&ldquo;La Belle Dame sans Merci&rdquo; by John Keats</li><li>&ldquo;Annabel Lee&rdquo; by Edgar Allan Poe</li></ul></section><p><a href="/rhymes">Rhyme finder</a> | <a href="/rhyme-scheme/abab">ABAB rhyme scheme</a> | <a href="/learn/scansion">Meter guide</a></p></article>`,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Article', headline: 'How to Write a Ballad', description: 'Guide to writing ballads.', author: { '@type': 'Organization', name: 'Poetry Editor' }, publisher: { '@type': 'Organization', name: 'Poetry Editor', url: SITE } },
  },
  {
    route: '/learn/slant-rhyme',
    title: 'Guide to Slant Rhyme & Near Rhyme in Poetry | Poetry Editor',
    description: 'Master slant rhyme (half rhyme, near rhyme) in poetry. Learn the difference between perfect and imperfect rhymes, with examples and techniques for using them effectively.',
    keywords: 'slant rhyme, near rhyme, half rhyme, imperfect rhyme, off rhyme, Emily Dickinson slant rhyme, poetry rhyme types',
    bodyHtml: `<article><h1>Guide to Slant Rhyme &amp; Near Rhyme</h1><p>Slant rhyme (also called near rhyme, half rhyme, or off rhyme) is a rhyme where the sounds are similar but not identical. It&rsquo;s one of the most powerful tools in a poet&rsquo;s kit for creating subtlety and surprise.</p><section><h2>Types of Imperfect Rhyme</h2><ul><li><strong>Consonance rhyme</strong> &mdash; matching final consonants but different vowels: <em>hold/bald</em>, <em>bent/want</em></li><li><strong>Assonance rhyme</strong> &mdash; matching vowel sounds but different consonants: <em>lake/fate</em>, <em>beam/green</em></li><li><strong>Eye rhyme</strong> &mdash; words that look alike but sound different: <em>love/move</em>, <em>cough/through</em></li></ul></section><section><h2>Why Use Slant Rhyme?</h2><p>Emily Dickinson pioneered extensive slant rhyme to create a sense of unease and incompleteness. Modern poets use it to avoid the sing-song quality of perfect rhyme while maintaining sonic connection between lines.</p></section><p><a href="/rhymes">Try the rhyme finder</a> | <a href="/learn/free-verse">Free verse guide</a> | <a href="/learn/sonnet">Sonnet guide</a></p></article>`,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Article', headline: 'Guide to Slant Rhyme & Near Rhyme', description: 'Master slant and near rhyme in poetry.', author: { '@type': 'Organization', name: 'Poetry Editor' }, publisher: { '@type': 'Organization', name: 'Poetry Editor', url: SITE } },
  },
  {
    route: '/learn/avoiding-cliches',
    title: 'How to Avoid Cliche Rhymes in Poetry | Poetry Editor',
    description: 'Stop using overused rhyme pairs like love/above, heart/apart, fire/desire. Our database of 500+ cliche pairs helps you find fresh alternatives.',
    keywords: 'cliche rhymes, overused rhymes, love above, heart apart, avoid cliches poetry, fresh rhymes, original rhyming',
    bodyHtml: `<article><h1>How to Avoid Clich&eacute; Rhymes in Poetry</h1><p>Every poet has reached for &ldquo;love/above&rdquo; or &ldquo;heart/apart&rdquo; at some point. These pairings have been used so often that they no longer surprise the reader. Here&rsquo;s how to break free.</p><section><h2>The Most Overused Rhyme Pairs</h2><ul><li>love / above / dove</li><li>heart / apart / start</li><li>fire / desire / higher</li><li>night / light / sight</li><li>time / rhyme / climb</li><li>eyes / skies / lies</li><li>tears / fears / years</li></ul></section><section><h2>Strategies for Fresh Rhyming</h2><ul><li><strong>Use slant rhyme</strong> &mdash; Near rhymes offer sonic connection without predictability</li><li><strong>Rhyme on unexpected words</strong> &mdash; Rhyme on verbs or adjectives instead of nouns</li><li><strong>Try multi-syllable rhymes</strong> &mdash; &ldquo;remember/September&rdquo; feels fresher than &ldquo;day/way&rdquo;</li><li><strong>Use our clich&eacute; filter</strong> &mdash; Our <a href="/rhymes">rhyme finder</a> flags overused pairs so you can avoid them</li></ul></section><p><a href="/rhymes">Try the rhyme finder with clich&eacute; detection</a> | <a href="/learn/slant-rhyme">Slant rhyme guide</a></p></article>`,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Article', headline: 'How to Avoid Cliche Rhymes in Poetry', description: 'Break free from overused rhyme pairs.', author: { '@type': 'Organization', name: 'Poetry Editor' }, publisher: { '@type': 'Organization', name: 'Poetry Editor', url: SITE } },
  },
  {
    route: '/ai-poetry-coach',
    title: 'AI Poetry Coach — Get Feedback on Your Poems | Poetry Editor',
    description: 'An AI poetry coach that reads your work and gives feedback on craft, rhythm, imagery, and voice. Write in the editor, ask questions, and improve your poetry.',
    keywords: 'AI poetry coach, AI poetry editor, poetry feedback AI, AI writing coach for poetry, poetry coaching, AI poem feedback, poetry critique AI',
    bodyHtml: `<article><h1>AI Poetry Coach</h1><p>Write poetry in the editor and get feedback on craft, rhythm, imagery, and voice. The AI coach reads your poem and responds to your questions &mdash; line-level craft feedback, thematic analysis, or revision suggestions.</p><section><h2>What the Coach Helps With</h2><ul><li><strong>Craft feedback</strong> &mdash; line breaks, word choice, economy of language</li><li><strong>Rhythm and meter</strong> &mdash; scansion, stressed/unstressed patterns</li><li><strong>Imagery</strong> &mdash; metaphor, simile, concrete vs. abstract</li><li><strong>Structure</strong> &mdash; stanza relationships, pacing, the turn</li><li><strong>Voice and tone</strong> &mdash; consistency, register, emotional arc</li></ul></section><p><a href="/">Open the poetry editor</a> | <a href="/rhymes">Rhyme finder</a> | <a href="/synonyms">Synonym finder</a></p></article>`,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Article', headline: 'AI Poetry Coach — Get Feedback on Your Poems', description: 'An AI poetry coach that reads your work and gives feedback on craft, rhythm, imagery, and voice.', author: { '@type': 'Organization', name: 'Poetry Editor' }, publisher: { '@type': 'Organization', name: 'Poetry Editor', url: SITE } },
  },
];

function homepageHtml() {
  return `<article>
<h1>Poetry Editor</h1>
<p>Poetry Editor is a writing tool for poets. It shows the rhythm, meter, and diction of the draft you are writing, and you can ask for a reading when you want one.</p>
<nav>
<h2>Poetry Tools</h2>
<ul>
<li><a href="/rhymes">Rhyme Finder &amp; Dictionary</a> &mdash; Find perfect rhymes, near rhymes, and slant rhymes</li>
<li><a href="/synonyms">Synonym Finder</a> &mdash; Discover word alternatives organized by meaning</li>
<li><a href="/syllables">Syllable Counter</a> &mdash; Count syllables and see stress patterns</li>
<li><a href="/haiku-checker">Haiku Checker</a> &mdash; Validate the 5-7-5 syllable pattern</li>
<li><a href="/rhyme-scheme-analyzer">Rhyme Scheme Maker</a> &mdash; Write with real-time rhyme guidance</li>
<li><a href="/sonnet-checker">Sonnet Checker</a> &mdash; Validate sonnet structure and meter</li>
<li><a href="/poetry-statistics">Poetry Statistics</a> &mdash; Explore data about English poetry</li>
</ul>
<h2>Learn</h2>
<ul>
<li><a href="/learn/haiku">How to Write a Haiku</a></li>
<li><a href="/learn/sonnet">How to Write a Sonnet</a></li>
<li><a href="/learn/free-verse">How to Write Free Verse</a></li>
<li><a href="/learn/scansion">Understanding Meter &amp; Scansion</a></li>
<li><a href="/learn/villanelle">How to Write a Villanelle</a></li>
<li><a href="/learn/pantoum">How to Write a Pantoum</a></li>
<li><a href="/learn/ode">How to Write an Ode</a></li>
<li><a href="/learn/elegy">How to Write an Elegy</a></li>
<li><a href="/learn/ballad">How to Write a Ballad</a></li>
<li><a href="/learn/slant-rhyme">Guide to Slant &amp; Near Rhyme</a></li>
<li><a href="/learn/avoiding-cliches">How to Avoid Clich&eacute; Rhymes</a></li>
</ul>
<h2>Rhyme Schemes</h2>
<ul>
<li><a href="/rhyme-scheme/aabb">AABB Couplet Rhyme</a></li>
<li><a href="/rhyme-scheme/abab">ABAB Alternate Rhyme</a></li>
<li><a href="/rhyme-scheme/abba">ABBA Enclosed Rhyme</a></li>
<li><a href="/rhyme-scheme/shakespearean-sonnet">Shakespearean Sonnet</a></li>
<li><a href="/rhyme-scheme/petrarchan-sonnet">Petrarchan Sonnet</a></li>
<li><a href="/rhyme-scheme/terza-rima">Terza Rima</a></li>
<li><a href="/rhyme-scheme/free-verse">Free Verse</a></li>
</ul>
<h2><a href="/poems">Browse Poem Analyses</a></h2>
</nav>
</article>`;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('Pre-rendering pages for SEO...\n');

  // 1. Create a Vite dev server in middleware mode to use ssrLoadModule
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  });

  // 2. Load poem and rhyme-scheme data via Vite's TS pipeline
  const { poems } = await vite.ssrLoadModule('/src/data/poems/index.ts');
  const { rhymeSchemes } = await vite.ssrLoadModule('/src/data/rhymeSchemes.ts');

  await vite.close();

  // 2b. Load CMU dictionary and build rhyme index for enriched pre-rendering
  console.log('  Loading CMU dictionary...');
  const cmuText = fs.readFileSync(CMU_DICT_PATH, 'utf-8');
  const cmuDict = parseCMUDictNode(cmuText);
  console.log(`  Loaded ${cmuDict.size} words from CMU dictionary`);

  console.log('  Building rhyme index...');
  const rhymeIndex = buildRhymeIndexNode(cmuDict);
  console.log(`  Built rhyme index with ${rhymeIndex.size} rhyme groups`);

  // 2c. Load offline synonyms
  const offlineSyns = loadOfflineSynonyms();
  console.log(`  Loaded ${Object.keys(offlineSyns).length} offline synonym entries`);

  // 3. Read the built index.html as template
  const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

  // Authenticated app routes are not content-prerendered. Write directory
  // indexes so /my-collections itself is a static hit (a missing parent
  // made Pages 308 /my-collections to /). Nested /my-collections/:id is
  // served by functions/_middleware.ts → /index.html on the asset 404.
  // Do not emit 200.html — a rewrite to /200.html 308-loops to /200.
  const spaAppRoutes = ['/my-collections', '/my-account', '/reset-password', '/editorial-report'];
  for (const route of spaAppRoutes) {
    const dir = path.join(DIST, route.slice(1));
    fs.mkdirSync(dir, { recursive: true });
    const flatHtml = path.join(DIST, `${route.slice(1)}.html`);
    if (fs.existsSync(flatHtml)) fs.unlinkSync(flatHtml);
    fs.writeFileSync(path.join(dir, 'index.html'), template);
  }
  console.log(`  Created SPA shells for ${spaAppRoutes.join(', ')}`);

  let count = 0;

  // 5. Homepage
  writePage('/', stampTemplate(template, {
    title: 'Poetry Editor',
    description: 'Poetry Editor is a writing tool for poets. It shows the rhythm, meter, and diction of the draft you are writing, and you can ask for a reading when you want one.',
    canonical: SITE + '/',
    keywords: 'poetry editor, AI poetry coach, AI poetry feedback, poetry coaching, poetry feedback, rhyme finder, syllable counter, synonym finder, poetry writing tool',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Poetry Editor',
      url: SITE,
      applicationCategory: 'WritingApplication',
      operatingSystem: 'Web',
      description: 'Poetry Editor is a writing tool for poets. It shows the rhythm, meter, and diction of the draft you are writing, and you can ask for a reading when you want one.',
    },
    bodyHtml: homepageHtml(),
  }));
  count++;

  // 6. Poem pages
  const poemList = Object.values(poems);
  for (const poem of poemList) {
    const fullTitle = `${poem.title} by ${poem.poet} - Analysis & Commentary | Poetry Editor`;
    writePage(`/poems/${poem.slug}`, stampTemplate(template, {
      title: fullTitle,
      description: poem.seoDescription,
      canonical: `${SITE}/poems/${poem.slug}`,
      jsonLd: poemJsonLd(poem),
      bodyHtml: poemPageHtml(poem),
    }));
    count++;
  }
  console.log(`  Pre-rendered ${poemList.length} poem pages`);

  // 7. Poems list page
  writePage('/poems', stampTemplate(template, {
    title: 'Poem Analyses | Poetry Editor',
    description: `Browse our collection of ${poemList.length} analyzed poems with line-by-line commentary, literary devices, and technical analysis.`,
    canonical: `${SITE}/poems`,
    bodyHtml: poemsListHtml(poemList),
  }));
  count++;

  // 8. Tool landing pages
  for (const page of TOOL_PAGES) {
    writePage(page.route, stampTemplate(template, {
      title: page.title,
      description: page.description,
      canonical: `${SITE}${page.route}`,
      keywords: page.keywords,
      jsonLd: page.jsonLd,
      bodyHtml: page.bodyHtml,
    }));
    count++;
  }
  console.log(`  Pre-rendered ${TOOL_PAGES.length} tool pages`);

  // 9. Rhyme + synonym word pages (from sitemaps)
  let rhymeRoutes = loadSitemapRoutes(RHYME_SITEMAP, /\/rhymes\/[^/]+$/);
  let synonymRoutes = loadSitemapRoutes(SYNONYM_SITEMAP, /\/synonyms\/[^/]+$/);
  if (rhymeRoutes.length > MAX_RHYME_PAGES) {
    console.log(`  Limiting rhyme pages from ${rhymeRoutes.length} to ${MAX_RHYME_PAGES} for Cloudflare file cap`);
    rhymeRoutes = rhymeRoutes.slice(0, MAX_RHYME_PAGES);
  }
  if (synonymRoutes.length > MAX_SYNONYM_PAGES) {
    console.log(`  Limiting synonym pages from ${synonymRoutes.length} to ${MAX_SYNONYM_PAGES} for Cloudflare file cap`);
    synonymRoutes = synonymRoutes.slice(0, MAX_SYNONYM_PAGES);
  }

  for (const route of rhymeRoutes) {
    const slug = route.split('/').pop() || '';
    const word = decodeURIComponent(slug);
    const rhymeCount = getPerfectRhymesNode(word, cmuDict, rhymeIndex, 50).length;
    const title = `Rhymes with ${word} — ${rhymeCount} Perfect Rhymes | Poetry Editor`;
    const description = `Find ${rhymeCount} perfect rhymes for "${word}". Browse by syllable count, filter by meter and originality. Free rhyming dictionary for poets.`;
    writePage(route, stampTemplate(template, {
      title,
      description,
      canonical: `${SITE}${route}`,
      jsonLd: makeRhymeJsonLd(word, cmuDict, rhymeIndex),
      bodyHtml: rhymeWordHtml(word, cmuDict, rhymeIndex),
    }));
    count++;
  }
  console.log(`  Pre-rendered ${rhymeRoutes.length} rhyme word pages`);

  for (const route of synonymRoutes) {
    const slug = route.split('/').pop() || '';
    const word = decodeURIComponent(slug);
    const senses = loadWordnetSenses(word);
    const synEntry = offlineSyns[word.toLowerCase()];
    const synCount = senses.length > 0
      ? senses.reduce((sum, s) => sum + (s.synonyms?.length || 0), 0)
      : (synEntry?.synonyms?.length || 0);
    const title = synCount > 0
      ? `Synonyms for ${word} — ${synCount} Synonyms by Meaning | Poetry Editor`
      : `Synonyms for ${word} | Poetry Editor`;
    const description = synCount > 0
      ? `Discover ${synCount} synonyms for "${word}" organized by meaning, with syllable filters for poets and songwriters.`
      : `Discover synonyms for "${word}" organized by meaning and strength, with syllable filters for poets.`;
    writePage(route, stampTemplate(template, {
      title,
      description,
      canonical: `${SITE}${route}`,
      jsonLd: makeSynonymJsonLd(word, offlineSyns),
      bodyHtml: synonymWordHtml(word, offlineSyns),
    }));
    count++;
  }
  console.log(`  Pre-rendered ${synonymRoutes.length} synonym word pages`);

  // 10. Alias pages (with canonical pointing to primary)
  for (const alias of ALIAS_PAGES) {
    writePage(alias.route, stampTemplate(template, {
      title: alias.title,
      description: alias.description,
      canonical: `${SITE}${alias.canonicalRoute}`, // canonical points to primary
      bodyHtml: `<p>Redirecting to <a href="${alias.canonicalRoute}">${alias.canonicalRoute}</a>...</p>`,
    }));
    count++;
  }
  console.log(`  Pre-rendered ${ALIAS_PAGES.length} alias pages`);

  // 11. Learn pages
  for (const page of LEARN_PAGES) {
    writePage(page.route, stampTemplate(template, {
      title: page.title,
      description: page.description,
      canonical: `${SITE}${page.route}`,
      keywords: page.keywords,
      jsonLd: page.jsonLd,
      bodyHtml: page.bodyHtml,
    }));
    count++;
  }
  console.log(`  Pre-rendered ${LEARN_PAGES.length} learn pages`);

  // 12. Rhyme scheme pages
  const schemeIds = Object.keys(rhymeSchemes);
  for (const id of schemeIds) {
    const scheme = rhymeSchemes[id];
    const pattern = scheme.pattern.replace(/\s+/g, '');
    const pageTitle = `${pattern} Rhyme Scheme - ${scheme.name} | Poetry Editor`;
    const pageDesc = `Learn the ${pattern} rhyme scheme (${scheme.name.split('(')[0].trim()}). ${scheme.description} Examples, tips, and famous poems.`;
    writePage(`/rhyme-scheme/${id}`, stampTemplate(template, {
      title: pageTitle,
      description: pageDesc,
      canonical: `${SITE}/rhyme-scheme/${id}`,
      jsonLd: rhymeSchemeJsonLd(scheme),
      bodyHtml: rhymeSchemePageHtml(scheme),
    }));
    count++;
  }
  console.log(`  Pre-rendered ${schemeIds.length} rhyme scheme pages`);

  console.log(`\nDone! Pre-rendered ${count} pages total.`);
}

main().catch(err => {
  console.error('Pre-render failed:', err);
  process.exit(1);
});
