// Style C below the story: the sections, the header, the footer and the CV use the --story-* tokens.
// The simulator shares colors_and_type.css, so its rules must not change. These tests pin both.
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
const blocks = cssBlocks(sheet);
const allRules = blocks.flatMap(block => block.rules);

const isStory = rule => /^(STORY|Story block)/.test(rule.block);

// Rules that the simulator also uses. They must keep their text. The site has its own rules next to them.
const NEW_PRINT_SELECTORS = ['.cv-sheet', '.cv .strata'];
const SHARED_GROUPS = [
  ['tokens', rule => /^SA'EED TELVARI/.test(rule.block)],
  ['base elements', rule => /^BASE ELEMENTS/.test(rule.block)],
  ['primitives', rule => /^SITE PRIMITIVES/.test(rule.block) && ['.visually-hidden', '.skip-link', '.skip-link:focus', '.icon'].includes(rule.selector)],
  ['cv print', rule => /^CV/.test(rule.block) && rule.media === '@media print' && !NEW_PRINT_SELECTORS.includes(rule.selector)],
  ['focus rings', rule => /^ACCESSIBILITY/.test(rule.block)],
  ['reduced motion', rule => /^PREFERS REDUCED MOTION/.test(rule.block)],
  ['print', rule => /^PRINT/.test(rule.block)],
  ['header (workbench and shared)', rule => /^HEADER/.test(rule.block) && !/app-header--site/.test(rule.selector)],
];
// Hashes of the shared rules as they were before style C. To update one on purpose, change the rule and the hash together.
// The reduced-motion hash changed once, on purpose: the cleanup removed the hero rules of that block. The simulator does not use them.
const SHARED_HASHES = {
  'tokens': '60f96e2f4687',
  'base elements': 'fad404039db3',
  'primitives': 'd4b3abbd0a71',
  'cv print': '0b7f52531d24',
  'focus rings': 'b87604d3554b',
  'reduced motion': 'a2b3c528f520',
  'print': 'a3415cef1122',
  'header (workbench and shared)': '160833376739',
  'workbench': '8f72bddd381f',
};
const isShared = rule => SHARED_GROUPS.some(([, test]) => test(rule));
const siteRules = allRules.filter(rule => !isShared(rule));

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

test('no homepage or CV rule uses the old cream or the dark night colours', () => {
  assert.ok(siteRules.length > 150, 'the site rules were parsed');
  const night = new RegExp([
    'rgba?\\(\\s*(?:244\\s*,\\s*237\\s*,\\s*227|18\\s*,\\s*14\\s*,\\s*11|7\\s*,\\s*10\\s*,\\s*16|8\\s*,\\s*6\\s*,\\s*4|26\\s*,\\s*21\\s*,\\s*17|34\\s*,\\s*28\\s*,\\s*23|232\\s*,\\s*161\\s*,\\s*90)\\b',
    '#(?:120e0b|f4ede3|1a1511|221c17|2c241d|e8a15a)\\b',
  ].join('|'), 'i');
  for (const rule of siteRules) {
    assert.doesNotMatch(rule.body, night, `${ruleKey(rule)} uses a colour of the old night theme`);
    // The site reads --story-* tokens. Only the easing curve comes from the --sim-* set.
    assert.doesNotMatch(rule.body.replace(/var\(--sim-ease\)/g, ''), /var\(--sim-/, `${ruleKey(rule)} reads a --sim-* token`);
  }
});

test('index.html and cv.html use the style C page colours and fonts', () => {
  for (const page of ['index.html', 'cv.html']) {
    const html = read(page);
    assert.match(html, /<html lang="en" class="site-c">/, `${page}: the site-c class on <html>`);
    assert.match(html, /<meta name="theme-color" content="#c9d6dc">/, `${page}: theme colour is the story sky`);
    assert.match(html, /body \{ background: #c9d6dc; color: #1f2a30;/, `${page}: body ground and ink`);
    assert.match(html, /::-webkit-scrollbar-track \{ background: #c9d6dc; \}/, `${page}: scrollbar track`);
    assert.doesNotMatch(html, /#120e0b|#f4ede3|#4a3c30|#5e4c3c/i, `${page}: no colour of the night theme`);
    assert.match(html, /family=Literata:ital,opsz,wght@/, `${page}: loads Literata`);
    assert.doesNotMatch(html, /Montserrat|Open\+Sans|Open Sans|JetBrains/, `${page}: loads no other font`);
  }
  // The simulator keeps its own page: only the ?v= values change.
  const simulator = read('simulator.html');
  assert.match(simulator, /family=Montserrat[^"]*family=Open\+Sans[^"]*family=JetBrains\+Mono/);
  assert.match(simulator, /body \{\s*background: #0b1120;/);
  assert.doesNotMatch(simulator, /class="site-c"/, 'the simulator is not a style C page');
});

test('the page ground is the story sky, so the story flows into the first section with no edge', () => {
  const tokens = Object.fromEntries([...sheet.matchAll(/(--story-[a-z0-9-]+):\s*([^;]+);/g)].map(match => [match[1], match[2].trim()]));
  assert.equal(tokens['--story-ground'], 'var(--story-sky)');
  assert.equal(tokens['--story-sky'], '#c9d6dc');
  const story = allRules.find(rule => rule.selector === '.story' && rule.block.startsWith('STORY'));
  assert.match(story.body, /background: var\(--story-sky\)/);
  const bodyRule = allRules.find(rule => rule.selector === '.site-c body');
  assert.match(bodyRule.body, /background: var\(--story-ground\)/);
  assert.match(bodyRule.body, /font-family: var\(--story-font\)/);
  assert.match(tokens['--story-font'], /^'Literata'/);
  const bar = allRules.find(rule => rule.selector === '.app-header--site .app-header__bar');
  assert.match(bar.body, /background: var\(--story-ground\)/, 'after the story the bar has the ground colour');
  assert.match(bar.body, /border-bottom-color: var\(--story-ink\)/, 'and an ink hairline');
  const footer = allRules.find(rule => rule.selector === '.site-footer');
  assert.match(footer.body, /background: var\(--story-footer-bg\)/);
  assert.equal(tokens['--story-rock-older'], '#7d6b5d');
  assert.match(tokens['--story-footer-bg'], /^#[0-9a-f]{6}$/);
});

test('the data colours stay data: no link, button, header or footer rule uses CO2 blue or methane red', () => {
  const chrome = /(^|[\s,>+~(])(a|button)(?![\w-])|\.(btn|app-header|app-nav|app-drawer|site-footer|skip-link|text-link|story-btn|story-skip)\b|:where\(a\b/;
  const data = /#3b6cf0|#c8463d|--story-co2|--story-ch4|--sim-c-|--sim-glow-/i;
  let checked = 0;
  for (const rule of allRules) {
    if (!chrome.test(rule.selector)) continue;
    checked += 1;
    assert.doesNotMatch(rule.body, data, `${ruleKey(rule)} uses a data colour`);
  }
  assert.ok(checked > 40, 'the link, button and header rules were found');
  // The legend chips are the one place for the data colours in the story styles.
  assert.ok(allRules.some(rule => /story-controls__chip--co2/.test(rule.selector) && /--story-co2/.test(rule.body)));
});

test('style C is flat: no shadows, no gradients, no caps, no letter-spaced labels, two radii', () => {
  const own = siteRules.filter(rule => !isStory(rule));
  const flat = /box-shadow|text-shadow|drop-shadow|gradient\(|backdrop-filter|-webkit-backdrop-filter/;
  const caps = /text-transform:\s*uppercase|font-variant-caps:\s*all|font-variant:\s*small-caps/;
  const spaced = /letter-spacing:\s*(?!-|0(?:px|em|rem)?\s*(?:;|$)|normal)[\d.]/;
  const radii = new Set();
  for (const rule of own) {
    assert.doesNotMatch(rule.body, flat, `${ruleKey(rule)} is not flat`);
    assert.doesNotMatch(rule.body, caps, `${ruleKey(rule)} sets capitals`);
    assert.doesNotMatch(rule.body, spaced, `${ruleKey(rule)} spaces its letters`);
    for (const match of rule.body.matchAll(/border-radius:\s*([^;]+)/g)) radii.add(match[1].trim());
    assert.doesNotMatch(rule.body, /monospace|JetBrains|Montserrat|Open Sans|var\(--font-mono\)/, `${ruleKey(rule)} uses an old font`);
  }
  assert.deepEqual([...radii].sort(), ['0', '50%', '999px', 'var(--story-radius)'], 'one radius for panels, one for pills');
  const tokens = sheet.match(/--story-radius:\s*([^;]+);/)[1].trim();
  assert.equal(tokens, '10px');
});

test('the strata strip is four beds in the rock colours, once for each section and CV heading', () => {
  const beds = ['sand', 'shale', 'chalk', 'rock-older'];
  beds.forEach((bed, index) => {
    const rule = allRules.find(item => item.selector === `.strata > span:nth-child(${index + 1})`);
    assert.ok(rule, `bed ${index + 1}`);
    assert.match(rule.body, new RegExp(`background: var\\(--story-${bed}\\)`));
  });
  assert.equal(allRules.find(rule => rule.selector === '.cv .strata' && rule.media === '@media print').body, 'display: none;', 'no strata on paper');
  const sections = read('HomeSections.jsx');
  assert.equal((sections.match(/<Strata \/>/g) || []).length, 1, 'SiteSection draws one strip, so each of the four sections has one');
  assert.equal((read('CVPage.jsx').match(/<Strata \/>/g) || []).length, 1, 'CVSection draws one strip for each CV heading');
  assert.doesNotMatch(read('App.jsx'), /GeologicalDescent/, 'the old descent is not in the page');
  assert.doesNotMatch(read('build.js'), /GeologicalDescent/, 'and not in the build');
  for (const gone of ['GeologicalDescent.jsx', 'SubsurfaceHero.jsx', 'hero-geology.js', 'hero-simulation-worker.js']) {
    assert.ok(!fs.existsSync(path.join(root, gone)), gone + ' is deleted; the tag homepage-archive-2026-10 keeps it');
  }
  assert.doesNotMatch(sheet, /\.hero-|\.geological-descent|\.descent-/, 'the stylesheet has no rule of the old hero or descent');
});

test('the CV keeps its print rules and its sheet is for the screen only', () => {
  const printRules = allRules.filter(rule => /^CV/.test(rule.block) && rule.media === '@media print');
  const own = printRules.filter(rule => NEW_PRINT_SELECTORS.includes(rule.selector));
  assert.equal(own.length, 2, 'two rules switch off the sheet and the strata on paper');
  const sheetRule = own.find(rule => rule.selector === '.cv-sheet');
  assert.match(sheetRule.body, /background: none/);
  assert.match(sheetRule.body, /border: 0/);
  const originals = printRules.filter(rule => !NEW_PRINT_SELECTORS.includes(rule.selector));
  assert.ok(originals.some(rule => rule.selector === '.cv, .cv *' && /color: #111 !important/.test(rule.body)), 'black text');
  assert.ok(originals.some(rule => rule.selector === '.cv-print' && /display: none !important/.test(rule.body)));
});
