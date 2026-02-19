/**
 * Pre-render key pages as static HTML for SEO.
 *
 * Runs after `vite build`. Uses Vite's ssrLoadModule() to import poem and
 * rhyme-scheme TypeScript data, then stamps meta tags + semantic HTML into
 * copies of dist/index.html.
 *
 * Cloudflare Pages serves static files first; non-pre-rendered routes fall
 * back to dist/200.html (the original SPA shell).
 */

import fs from 'fs';
import path from 'path';
import { createServer } from 'vite';

const DIST = path.resolve('dist');
const SITE = 'https://poetryeditor.com';
const RHYME_SITEMAP = path.resolve('public/sitemap-rhymes.xml');
const SYNONYM_SITEMAP = path.resolve('public/sitemap-synonyms.xml');

// ── Helpers ────────────────────────────────────────────────────────────────

function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Write an HTML string to dist/<route>/index.html (or dist/index.html for /). */
function writePage(route, html) {
  const dir = route === '/'
    ? DIST
    : path.join(DIST, ...route.replace(/^\//, '').split('/'));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
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

function rhymeWordHtml(word) {
  return `<article>
<h1>Rhymes with ${esc(word)}</h1>
<p>Find perfect rhymes, near rhymes, and syllable breakdowns for <strong>${esc(word)}</strong>. Filter by meter, syllables, and originality to match your line.</p>
<p><a href="/rhymes">Rhyme Finder</a> | <a href="/synonyms/${encodeURIComponent(word.toLowerCase())}">Synonyms</a> | <a href="/">Poetry Editor</a></p>
</article>`;
}

function synonymWordHtml(word) {
  return `<article>
<h1>Synonyms for ${esc(word)}</h1>
<p>Find synonyms for <strong>${esc(word)}</strong> organized by meaning and strength, with syllable filters to keep your meter consistent.</p>
<p><a href="/synonyms">Synonym Finder</a> | <a href="/rhymes/${encodeURIComponent(word.toLowerCase())}">Rhymes</a> | <a href="/">Poetry Editor</a></p>
</article>`;
}

function makeRhymeJsonLd(word) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Words That Rhyme with ${word}`,
    description: `Perfect and near rhymes for "${word}"`,
    numberOfItems: 0,
  };
}

function makeSynonymJsonLd(word) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Synonyms for ${word}`,
    description: `Synonyms and related words for "${word}"`,
    numberOfItems: 0,
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
];

function homepageHtml() {
  return `<article>
<h1>Poetry Editor &mdash; A Toolbox for Poets</h1>
<p>Write and analyze poems with a full-featured poetry editor, rhyme finder, synonym tools, and syllable counter. Built for poets, songwriters, and teachers.</p>
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

  // 3. Read the built index.html as template
  const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

  // 4. Copy original SPA shell → 200.html (fallback for non-pre-rendered routes)
  fs.copyFileSync(path.join(DIST, 'index.html'), path.join(DIST, '200.html'));
  console.log('  Created dist/200.html (SPA fallback)');

  let count = 0;

  // 5. Homepage
  writePage('/', stampTemplate(template, {
    title: 'Poetry Editor - Write, Rhyme, and Count Syllables | Poetry Editor',
    description: 'Write and analyze poems with a full-featured poetry editor, rhyme finder, synonym tools, and syllable counter. Built for poets, songwriters, and teachers.',
    canonical: SITE + '/',
    keywords: 'poetry editor, rhyme finder, synonym finder, syllable counter, poetry tools, write poetry',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Poetry Editor',
      url: SITE,
      applicationCategory: 'WritingApplication',
      operatingSystem: 'Web',
      description: 'Write and analyze poems with rhyme, synonym, and syllable tools.',
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
  const rhymeRoutes = loadSitemapRoutes(RHYME_SITEMAP, /\/rhymes\/[^/]+$/);
  const synonymRoutes = loadSitemapRoutes(SYNONYM_SITEMAP, /\/synonyms\/[^/]+$/);

  for (const route of rhymeRoutes) {
    const slug = route.split('/').pop() || '';
    const word = decodeURIComponent(slug);
    const title = `Rhymes with ${word} | Poetry Editor`;
    const description = `Find perfect rhymes, near rhymes, and syllable-friendly options for "${word}". Filter by meter and originality.`;
    writePage(route, stampTemplate(template, {
      title,
      description,
      canonical: `${SITE}${route}`,
      jsonLd: makeRhymeJsonLd(word),
      bodyHtml: rhymeWordHtml(word),
    }));
    count++;
  }
  console.log(`  Pre-rendered ${rhymeRoutes.length} rhyme word pages`);

  for (const route of synonymRoutes) {
    const slug = route.split('/').pop() || '';
    const word = decodeURIComponent(slug);
    const title = `Synonyms for ${word} | Poetry Editor`;
    const description = `Discover synonyms for "${word}" organized by meaning and strength, with syllable filters for poets.`;
    writePage(route, stampTemplate(template, {
      title,
      description,
      canonical: `${SITE}${route}`,
      jsonLd: makeSynonymJsonLd(word),
      bodyHtml: synonymWordHtml(word),
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
