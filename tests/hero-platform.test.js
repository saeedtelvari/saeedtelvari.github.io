const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'SubsurfaceHero.jsx'), 'utf8');
const css = fs.readFileSync(path.join(root, 'colors_and_type.css'), 'utf8');

// The drawing of the platform and the carrier: from HeroShip to the end of SurfaceSite.
const drawing = (() => {
  const start = source.indexOf('// Decorative equipment stays anchored');
  const end = source.indexOf('const HeroName');
  assert.ok(start > 0 && end > start, 'HeroShip and SurfaceSite must be in SubsurfaceHero.jsx');
  return source.slice(start, end);
})();
const site = drawing.slice(drawing.indexOf('const SurfaceSite'));

test('the platform keeps the well at x = 48 with the conductor down to the cut line', () => {
  assert.match(site, /viewBox="-140 0 540 160"/);
  assert.match(site, /<path d="M48 104V160" stroke="#3a4f69"/);
  assert.match(site, /HERO_SITE_FLOW/);
  assert.match(drawing, /HERO_SITE_FLOW = 'M236 108Q176 144 112 101H48V160'/);
  assert.match(site, /d="M48 101V160"/);
  assert.match(site, /data-site-status="true" cx="48"/);
  assert.match(site, /left: `\$\{geology\.wellXPct\}%`/);
});

test('the waterline is at y = 146 and the carrier floats on it', () => {
  assert.match(drawing, /HERO_SITE_WATERLINE = 146;/);
  // The hull bottom is at y = 152 in a group that is moved up by 6 units.
  assert.match(drawing, /<g transform="translate\(0 -6\)">/);
  assert.match(drawing, /Q394 152 388 152H174/);
});

test('the hose route and the flow paths exist', () => {
  assert.match(drawing, /<path id="site-feed-route" pathLength="1" d=\{HERO_SITE_HOSE\} \/>/);
  assert.match(drawing, /href="#site-feed-route"/);
  assert.match(drawing, /HERO_SITE_HOSE = 'M112 101Q176 144 236 108'/);
  assert.match(site, /hero-well__flow/);
  assert.match(site, /stroke="url\(#site-flow-x\)"/);
  assert.match(site, /stroke="url\(#site-flow-y\)"/);
});

test('the platform has no flare', () => {
  assert.doesNotMatch(drawing, /flare/i);
});

test('lamp reflections are short horizontal dashes', () => {
  const lamps = [...drawing.matchAll(/className="refl"[\s\S]*?<path d=\{`([^`]+)`\}/g)].map(match => match[1]);
  assert.equal(lamps.length, 2, 'one reflection path for the platform and one for the carrier');
  for (const raw of lamps) {
    const d = raw.replace(/\$\{[^}]*\}/g, '0');
    assert.match(d, /h-?[\d.]+/, 'a reflection uses h segments');
    assert.doesNotMatch(d, /[vVlLqQcC]/, 'a reflection has only horizontal moves');
  }
});

test('every filled shape in the drawing has an explicit fill', () => {
  // The root svg has fill="none"; each rect, circle and ellipse names its own fill.
  assert.match(site, /<svg viewBox="-140 0 540 160" width="100%" height="100%" fill="none">/);
  const shapes = [...drawing.matchAll(/<(rect|circle|ellipse)\b[\s\S]*?\/>/g)].map(match => match[0]);
  assert.ok(shapes.length >= 20);
  for (const shape of shapes) assert.match(shape, /fill=/, shape);
});

test('the platform has the requested equipment', () => {
  assert.match(drawing, /className="beacon"/);
  assert.match(drawing, /className="morse"/);
  assert.match(drawing, /className="foam"/);
  assert.match(drawing, /#8c7433/, 'yellow splash zone');
  assert.match(drawing, /#7dfca0/, 'green helideck lights');
  assert.match(drawing, /#d9822b/, 'orange lifeboats');
  assert.match(drawing, /M-8 104H118V111H-8Z/, 'cellar deck');
});

test('desktop width is 20 percent larger and phones crop closer', () => {
  assert.match(css, /\.hero-surface-site \{[^}]*width: min\(648px, 50\.4vw\);/);
  assert.match(css, /aspect-ratio: 540 \/ 160;/);
  assert.match(css, /@media \(max-width: 600px\) \{\s*\.hero-surface-site \{ width: 62vw; \}/);
});

test('the light animations stop under reduced motion and pause off-screen', () => {
  const reduce = css.match(/Under reduced motion every light is steady\. \*\/\s*@media \(prefers-reduced-motion: reduce\) \{([^}]*)\}/);
  assert.ok(reduce, 'the platform has its own reduced-motion rule');
  for (const name of ['.beacon', '.morse', '.refl', '.foam']) assert.ok(reduce[1].includes(`.hero-surface-site ${name}`), name);
  assert.match(reduce[1], /animation: none !important/);
  assert.match(css, /\.hero-scene\[data-visible="false"\] \*,/);
  assert.match(css, /animation-play-state: paused !important/);
});
