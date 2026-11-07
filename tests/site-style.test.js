// Two looks live in this repository.
// - The simulator uses the dark "Earth night" look. The homepage and the CV use "North Sea night". It has the same rules
//   with cool blue-grey tokens, which the class site-ns on <html> sets. All these rules are in colors_and_type.css.
// - The story page (ve-story.html) uses style C, the light textbook cutaway. Its rules are in story.css.
//   Only ve-story.html loads story.css, and only that page has the class site-c on <html>.
// These tests pin both sides, and they pin the border between them.
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

// ---- css helpers (pure; tests/site-style.test.js uses them to read the stylesheets)
const collapse = text => text.replace(/\s+/g, ' ').trim();

// Flat list of the rules. A rule in an @media block has the media text in `media`.
const parseRules = (text, media = '', out = []) => {
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf('{', i);
    if (open < 0) break;
    const head = collapse(text.slice(i, open));
    let depth = 1;
    let j = open + 1;
    while (j < text.length && depth) {
      if (text[j] === '{') depth += 1;
      else if (text[j] === '}') depth -= 1;
      j += 1;
    }
    const inner = text.slice(open + 1, j - 1);
    if (/^@(media|supports)\b/.test(head)) parseRules(inner, media ? `${media} ${head}` : head, out);
    else out.push({ selector: head, body: collapse(inner), media });
    i = j;
  }
  return out;
};

// The stylesheet has headings in comments that start with a line of "=" signs. Each heading starts a block.
const cssBlocks = css => {
  const heading = /\/\*\s*=+[ \t]*\r?\n([\s\S]*?)\r?\n\s*=+\s*\*\//g;
  const marks = [...css.matchAll(heading)].map(match => ({
    title: collapse(match[1].split(/\r?\n/).find(line => line.trim()) || ''),
    from: match.index + match[0].length,
    at: match.index,
  }));
  return marks.map((mark, index) => {
    const end = index + 1 < marks.length ? marks[index + 1].at : css.length;
    const text = css.slice(mark.from, end).replace(/\/\*[\s\S]*?\*\//g, '');
    return { title: mark.title, rules: parseRules(text).map(rule => ({ ...rule, block: mark.title })) };
  });
};

const ruleKey = rule => `${rule.media ? `${rule.media} | ` : ''}${rule.selector}`;
// ---- end css helpers

const hash = text => crypto.createHash('sha256').update(text).digest('hex').slice(0, 12);

const sheet = read('colors_and_type.css');
const allRules = cssBlocks(sheet).flatMap(block => block.rules);
const storySheet = read('story.css');
const storyRules = cssBlocks(storySheet).flatMap(block => block.rules);

// The rules that the simulator also uses. Their text must not change. The hashes are the values at the tag
// homepage-archive-2026-10, the last state before style C. To change one on purpose, change the rule and the hash together.
const SHARED_GROUPS = [
  ['tokens', rule => /^SA'EED TELVARI/.test(rule.block)],
  ['base elements', rule => /^BASE ELEMENTS/.test(rule.block)],
  ['primitives', rule => /^SITE PRIMITIVES/.test(rule.block) && ['.visually-hidden', '.skip-link', '.skip-link:focus', '.icon'].includes(rule.selector)],
  ['cv print', rule => /^CV/.test(rule.block) && rule.media === '@media print'],
  ['focus rings', rule => /^ACCESSIBILITY/.test(rule.block)],
  ['reduced motion', rule => /^PREFERS REDUCED MOTION/.test(rule.block)],
  ['print', rule => /^PRINT/.test(rule.block)],
  ['header (workbench and shared)', rule => /^HEADER/.test(rule.block) && !/app-header--site/.test(rule.selector)],
];
const SHARED_HASHES = {
  'tokens': '60f96e2f4687',
  'base elements': 'fad404039db3',
  'primitives': 'd4b3abbd0a71',
  'cv print': '0b7f52531d24',
  'focus rings': 'b87604d3554b',
  'reduced motion': 'eb506ebab4ae',
  'print': 'a3415cef1122',
  'header (workbench and shared)': '160833376739',
  'workbench': '8f72bddd381f',
};

test('the rules that the simulator shares are unchanged, and the workbench header and .ve-standalone rules too', () => {
  for (const [name, test] of SHARED_GROUPS) {
    const rules = allRules.filter(test);
    assert.ok(rules.length > 0, `${name}: the group has rules`);
    assert.equal(hash(rules.map(rule => `${ruleKey(rule)} {${rule.body}}`).join('\n')), SHARED_HASHES[name],
      `${name} changed: ${rules.map(rule => ruleKey(rule)).join(' ; ')}`);
  }
  const workbench = parseRules(read('simulator-workbench.css').replace(/\/\*[\s\S]*?\*\//g, ''))
    .filter(rule => rule.selector === '.ve-standalone' || /app-header/.test(rule.selector));
  assert.ok(workbench.length >= 3, 'the workbench rules were parsed');
  assert.equal(hash(workbench.map(rule => `${ruleKey(rule)} {${rule.body}}`).join('\n')), SHARED_HASHES.workbench,
    `the .ve-standalone and workbench header rules in simulator-workbench.css changed: ${workbench.map(rule => ruleKey(rule)).join(' ; ')}`);
});

test('colors_and_type.css has the dark look only: no story token, no story rule, no .site-c rule', () => {
  assert.ok(allRules.length > 250, 'the site rules were parsed');
  assert.doesNotMatch(sheet, /--story-/, 'no story token');
  assert.doesNotMatch(sheet, /Literata/, 'no story font');
  for (const rule of allRules) {
    assert.doesNotMatch(rule.selector, /\.site-c|\.story/, `${ruleKey(rule)} is a rule of the story page`);
  }
  // The restored homepage: the hero, the descent, the sheets and the dark header and footer.
  for (const selector of ['.hero-scene', '.hero-name', '.geological-descent', '.section-panel', '.sheet', '.site-footer--geological', '.app-header--site.is-scrolled .app-header__bar']) {
    assert.ok(allRules.some(rule => rule.selector === selector), `${selector} is back`);
  }
  const bar = allRules.find(rule => rule.selector === '.app-header--site .app-header__bar');
  assert.match(bar.body, /gradient\(180deg, rgba\(7, 10, 16, 0\.55\)/, 'the header is transparent over the hero');
  const scrolled = allRules.find(rule => rule.selector === '.app-header--site.is-scrolled .app-header__bar');
  assert.match(scrolled.body, /rgba\(15, 23, 34, 0\.9\)/, 'and a North Sea surface after the page moves');
  assert.match(allRules.find(rule => rule.selector === '.site-footer').body, /var\(--sim-/, 'the footer reads the night tokens');
});

test('index.html and cv.html keep the dark look: night colours, no site-c class, no story file', () => {
  for (const page of ['index.html', 'cv.html']) {
    const html = read(page);
    assert.match(html, /<html lang="en" class="site-ns">/, `${page}: the class site-ns, and no site-c class, on <html>`);
    assert.match(html, /<meta name="theme-color" content="#0f1722">/, `${page}: theme colour is the night ground`);
    assert.match(html, /body \{ background: #0f1722; color: #e8edf2;/, `${page}: body ground and ink`);
    assert.doesNotMatch(html, /#c9d6dc|#1f2a30/i, `${page}: no colour of style C`);
    assert.match(html, /family=Montserrat[^"]*family=Open\+Sans[^"]*family=JetBrains\+Mono/, `${page}: loads the three site fonts`);
    assert.doesNotMatch(html, /Literata/, `${page}: loads no story font`);
    assert.doesNotMatch(html, /story\.css|story-bundle\.js|land-110m|story-run|north-sea-ccs/, `${page}: loads no story file`);
  }
  const index = read('index.html');
  assert.match(index, /#app-loader \{[^}]*linear-gradient\(180deg, #070d1a[^;]*#0f1722 100%\)/, 'the loader shows the night sky over the North Sea ground');
  assert.match(index, /::-webkit-scrollbar-track \{ background: #0f1722; \}/);
  assert.match(index, /::-webkit-scrollbar-thumb \{ background: #34475f;/);
  assert.match(index, /<meta property="og:image" content="https:\/\/saeedtelvari\.github\.io\/assets\/social-card\.jpg">/);
});

test('the CV is dark on screen, and black on white in print', () => {
  const cvRules = allRules.filter(rule => /^CV/.test(rule.block));
  assert.ok(cvRules.some(rule => rule.selector === '.cv-head'), 'the CV head rule is there');
  const screen = cvRules.filter(rule => !rule.media);
  for (const rule of screen) assert.doesNotMatch(rule.body, /--story-/, `${ruleKey(rule)} reads a story token`);
  assert.ok(screen.some(rule => /var\(--sim-/.test(rule.body)), 'the CV screen rules read the night tokens');
  const print = cvRules.filter(rule => rule.media === '@media print');
  assert.ok(print.some(rule => rule.selector === '.cv, .cv *' && /color: #111 !important/.test(rule.body)), 'black text');
  assert.ok(print.some(rule => rule.selector === '.cv-print' && /display: none !important/.test(rule.body)), 'no print button on paper');
  const page = allRules.filter(rule => /^PRINT/.test(rule.block));
  const body = page.find(rule => rule.selector === 'body');
  assert.match(body.body, /background: #ffffff !important/, 'white paper');
  assert.match(body.body, /color: #111111 !important/);
  assert.match(page.find(rule => /app-header/.test(rule.selector)).body, /display: none !important/, 'no header on paper');
});

test('ve-story.html is the one style C page: site-c class, sky colours, Literata, story.css after the shared sheet', () => {
  const html = read('ve-story.html');
  assert.match(html, /<html lang="en" class="site-c">/);
  assert.match(html, /<meta name="theme-color" content="#c9d6dc">/);
  assert.match(html, /body \{ background: #c9d6dc; color: #1f2a30;/);
  assert.match(html, /::-webkit-scrollbar-track \{ background: #c9d6dc; \}/);
  assert.doesNotMatch(html, /#120e0b|#f4ede3|#4a3c30|#5e4c3c/i, 'no colour of the night theme');
  assert.match(html, /family=Literata:ital,opsz,wght@/);
  assert.doesNotMatch(html, /Montserrat|Open\+Sans|Open Sans|JetBrains/, 'no other font');
  assert.ok(html.indexOf('colors_and_type.css') > 0 && html.indexOf('colors_and_type.css') < html.indexOf('story.css'), 'story.css comes second, so it overrides the shared rules');
  for (const page of ['index.html', 'cv.html', 'simulator.html']) {
    assert.doesNotMatch(read(page), /class="site-c"|story\.css/, `${page} is not a style C page`);
  }
  // The simulator keeps its own page: only the name text and the ?v= values change.
  const simulator = read('simulator.html');
  assert.match(simulator, /family=Montserrat[^"]*family=Open\+Sans[^"]*family=JetBrains\+Mono/);
  assert.match(simulator, /body \{\s*background: #0b1120;/);
});

// A selector belongs to the story page when each of its parts starts with the class site-c or names a story class.
const SCOPED = /^(html\.site-c|\.site-c|:root$|html:has\(\.story)/;
const classesOf = selector => [...selector.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(match => match[1]);
const sharedClasses = new Set(allRules.flatMap(rule => classesOf(rule.selector)));

test('every rule of story.css is scoped by .site-c or uses a class that only the story page has', () => {
  assert.ok(storyRules.length > 150, 'the story rules were parsed');
  let prefixed = 0;
  for (const rule of storyRules) {
    for (const part of rule.selector.split(',').map(item => item.trim())) {
      if (SCOPED.test(part)) { if (part.startsWith('.site-c ')) prefixed += 1; continue; }
      const classes = classesOf(part);
      assert.ok(classes.length > 0, `${ruleKey(rule)} (${part}) has neither the site-c scope nor a class`);
      for (const name of classes) {
        assert.ok(/^story-?/.test(name) && !sharedClasses.has(name), `${ruleKey(rule)}: .${name} is a name of the shared sheet, so the rule needs the .site-c scope`);
      }
    }
  }
  assert.ok(prefixed > 50, 'the header, footer and button overrides carry the scope');
  assert.match(storySheet, /html\.site-c \{ color-scheme: light; \}/);
});

test('story.css has the story tokens, and the shared sheet has none of them', () => {
  const tokens = Object.fromEntries([...storySheet.matchAll(/(--story-[a-z0-9-]+):\s*([^;]+);/g)].map(match => [match[1], match[2].trim()]));
  assert.equal(tokens['--story-sky'], '#c9d6dc');
  assert.equal(tokens['--story-ink'], '#1f2a30');
  assert.match(tokens['--story-font'], /^'Literata'/);
  assert.doesNotMatch(sheet, /--story-/);
});

test('the page ground is the story sky, so the story flows into the end panel with no edge', () => {
  const tokens = Object.fromEntries([...storySheet.matchAll(/(--story-[a-z0-9-]+):\s*([^;]+);/g)].map(match => [match[1], match[2].trim()]));
  assert.equal(tokens['--story-ground'], 'var(--story-sky)');
  const story = storyRules.find(rule => rule.selector === '.story' && rule.block.startsWith('STORY'));
  assert.match(story.body, /background: var\(--story-sky\)/);
  const bodyRule = storyRules.find(rule => rule.selector === '.site-c body');
  assert.match(bodyRule.body, /background: var\(--story-ground\)/);
  assert.match(bodyRule.body, /font-family: var\(--story-font\)/);
  const bar = storyRules.find(rule => rule.selector === '.site-c .app-header--site .app-header__bar');
  assert.match(bar.body, /background: var\(--story-ground\)/, 'after the story the bar has the ground colour');
  assert.match(bar.body, /border-bottom-color: var\(--story-ink\)/, 'and an ink hairline');
  const over = storyRules.find(rule => rule.selector === '.site-c .app-header--site.is-over-story .app-header__bar');
  assert.match(over.body, /background: none/, 'over the story the bar is clear');
  const footer = storyRules.find(rule => rule.selector === '.site-c .site-footer');
  assert.match(footer.body, /background: var\(--story-footer-bg\)/);
  const end = storyRules.find(rule => rule.selector === '.story-end');
  assert.match(end.body, /background: var\(--story-ground\)/, 'the end panel sits on the sky ground');
});

test('the data colours stay data: no link, button, header or footer rule uses CO2 blue or methane red', () => {
  const chrome = /(^|[\s,>+~(])(a|button)(?![\w-])|\.(btn|app-header|app-nav|app-drawer|site-footer|skip-link|text-link|story-btn|story-skip|story-end)\b|:where\(a\b/;
  const data = /#3b6cf0|#c8463d|--story-co2|--story-ch4|--sim-c-|--sim-glow-/i;
  let checked = 0;
  for (const rule of storyRules) {
    if (!chrome.test(rule.selector)) continue;
    checked += 1;
    assert.doesNotMatch(rule.body, data, `${ruleKey(rule)} uses a data colour`);
  }
  assert.ok(checked > 40, 'the link, button and header rules were found');
  // The legend chips are the one place for the data colours in the story styles.
  assert.ok(storyRules.some(rule => /story-controls__chip--co2/.test(rule.selector) && /--story-co2/.test(rule.body)));
});

test('style C is flat: no shadows, no gradients, no caps, no letter-spaced labels, two radii', () => {
  const own = storyRules.filter(rule => /^(STORY PAGE STYLES|End panel)/.test(rule.block));
  assert.ok(own.length > 50, 'the shared-part overrides and the end panel were found');
  const flat = /box-shadow|text-shadow|drop-shadow|gradient\(|backdrop-filter|-webkit-backdrop-filter/;
  const caps = /text-transform:\s*uppercase|font-variant-caps:\s*all|font-variant:\s*small-caps/;
  const spaced = /letter-spacing:\s*(?!-|0(?:px|em|rem)?\s*(?:;|$)|normal)[\d.]/;
  const night = /rgba?\(\s*(?:244\s*,\s*237\s*,\s*227|18\s*,\s*14\s*,\s*11|7\s*,\s*10\s*,\s*16|26\s*,\s*21\s*,\s*17|232\s*,\s*161\s*,\s*90)\b|#(?:120e0b|f4ede3|1a1511|221c17|2c241d|e8a15a)\b/i;
  const radii = new Set();
  for (const rule of own) {
    // The clear header bar removes the blur of the dark bar. That is allowed: it sets none.
    assert.doesNotMatch(rule.body.replace(/(-webkit-)?backdrop-filter:\s*none;?/g, ''), flat, `${ruleKey(rule)} is not flat`);
    assert.doesNotMatch(rule.body, caps, `${ruleKey(rule)} sets capitals`);
    assert.doesNotMatch(rule.body, spaced, `${ruleKey(rule)} spaces its letters`);
    assert.doesNotMatch(rule.body, night, `${ruleKey(rule)} uses a colour of the night theme`);
    assert.doesNotMatch(rule.body.replace(/var\(--sim-ease\)/g, ''), /var\(--sim-/, `${ruleKey(rule)} reads a --sim-* token`);
    for (const match of rule.body.matchAll(/border-radius:\s*([^;]+)/g)) radii.add(match[1].trim());
    assert.doesNotMatch(rule.body, /monospace|JetBrains|Montserrat|Open Sans|var\(--font-mono\)/, `${ruleKey(rule)} uses an old font`);
  }
  assert.deepEqual([...radii].sort(), ['50%', '999px'].filter(item => radii.has(item)), 'the shared-part overrides use pills only');
  assert.equal(storySheet.match(/--story-radius:\s*([^;]+);/)[1].trim(), '10px');
});
