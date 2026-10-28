const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { SITE_STORY } = require('../site-content.js');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const between = (text, from, to) => text.slice(text.indexOf(from), text.indexOf(to));
const plain = value => JSON.parse(JSON.stringify(value));
const near = (a, b, message, tolerance = 1e-9) => assert.ok(Math.abs(a - b) <= tolerance, `${message || 'close'}: ${a} and ${b}`);
const sweep = (count = 100) => Array.from({ length: count + 1 }, (_, i) => i / count);

// The pure helpers of the stage fields use the helpers of StoryEarth.jsx, so the test runs both blocks together.
const api = new Function(`${between(read('StoryEarth.jsx'), '// ---- story earth helpers', '// ---- end story earth helpers')}
${between(read('StoryFields.jsx'), '// ---- story fields helpers', '// ---- end story fields helpers')}
return { STORY_EARTH_TARGET, STORY_EARTH_FIELDS_BOX, STORY_EARTH_GROW, STORY_EARTH_FADE, STORY_EARTH_ZOOM, STORY_EARTH_HOLD,
  storyEarthLayout, storyEarthOrbitCamera, storyEarthFieldsCamera, storyEarthDescentCamera, storyEarthMapPoint, storyEarthMercY,
  STORY_FIELDS_EM, storyFieldsPlan, storyFieldsStyle, storyFieldsOwn, storyFieldsWidth, storyFieldsHits, storyFieldsCross };`)();
const {
  STORY_EARTH_TARGET, STORY_EARTH_FIELDS_BOX, STORY_EARTH_GROW, STORY_EARTH_FADE, STORY_EARTH_ZOOM,
  storyEarthLayout, storyEarthOrbitCamera, storyEarthFieldsCamera, storyEarthDescentCamera, storyEarthMapPoint, storyEarthMercY,
  STORY_FIELDS_EM, storyFieldsPlan, storyFieldsStyle, storyFieldsOwn, storyFieldsHits, storyFieldsCross,
} = api;

const FILE = 'assets/north-sea-ccs.json';
const text = read(FILE);
const data = JSON.parse(text);
const SIZES = [[1280, 800], [1920, 1080], [1440, 900], [1024, 768], [768, 1024], [390, 844], [375, 667], [360, 640]];
const COMPANIES = ['Eni', 'Spirit', 'Centrica', 'Harbour', 'bp', 'Perenco', 'Shell', 'Equinor', 'TotalEnergies', 'Gasunie', 'EBN', 'INEOS', 'Synergia'];
const hasName = (haystack, name) => new RegExp(`(^|[^A-Za-z0-9])${name}([^A-Za-z0-9]|$)`, 'i').test(haystack);

// ---- the data file

test('the data file is small, has the four groups, and holds the projects of the research file', () => {
  const bytes = Buffer.byteLength(text, 'utf8');
  assert.ok(bytes > 5000 && bytes < 40000, `the file has ${bytes} bytes: under 40 KB`);
  assert.deepEqual(data.groups.map(group => group.id), [1, 2, 3, 4]);
  data.groups.forEach(group => assert.ok(group.name && group.short && group.list, `group ${group.id} has its names`));
  const ids = data.projects.map(project => project.id);
  assert.equal(new Set(ids).size, ids.length, 'unique ids');
  const names = group => data.projects.filter(project => project.group === group).map(project => project.short);
  assert.deepEqual(names(1), ['HyNet', 'Morecambe', 'Viking', 'Poseidon', 'Orion', 'Bacton', 'Camelot', 'Porthos', 'Aramis', 'Q16-FA', 'L09-FF', 'Bifrost'], 'group 1: depleted gas fields');
  assert.deepEqual(names(2), ['K12-B', 'Peterhead', 'Frigg', 'Heimdal'], 'group 2: pilots and studies');
  assert.deepEqual(names(3), ['Endurance', 'Acorn', 'Northern Lights', 'Sleipner', 'Smeaheia'], 'group 3: saline projects');
  assert.ok(!data.projects.some(project => /greensand/i.test(JSON.stringify(project))), 'depleted oil (Greensand) is left out');
  data.projects.forEach(project => {
    assert.ok(['UK', 'NL', 'NO', 'DK'].includes(project.country), `${project.id}: country`);
    assert.ok(project.name && project.short && project.status && project.status.length < 160, `${project.id}: name and status`);
    assert.ok(project.year === null || Number.isInteger(project.year), `${project.id}: the year is a whole number or null`);
    assert.match(project.source, /^https:\/\/[^\s]+$/, `${project.id}: source link`);
  });
  const camelot = data.projects.find(project => project.id === 'camelot');
  assert.equal(camelot.tag, 'withdrawing (2026)');
  assert.match(camelot.status, /^Withdrawing \(2026\)\./, 'Camelot shows the status "withdrawing (2026)"');
  assert.ok(data.ceased.length > 150 && data.ceased.length < 400, `the grey points: ${data.ceased.length} ceased gas fields`);
  assert.ok(data.outlines.length >= 10, 'the outlines of the project fields (UK and NL)');
  data.outlines.forEach(outline => {
    assert.ok(ids.includes(outline.project), `${outline.project}: the outline belongs to a project`);
    assert.ok(data.projects.find(project => project.id === outline.project).group <= 2, 'only depleted gas fields and pilots have outlines');
    outline.rings.forEach(ring => {
      assert.ok(ring.length >= 4, 'a ring has 4 points at least');
      assert.deepEqual(ring[0], ring[ring.length - 1], 'a ring is closed');
    });
  });
});

test('the data file has no company name, no MuPSI, no logo, and the attribution word for word', () => {
  for (const file of [FILE, 'tools/north-sea-projects.json']) {
    const body = read(file);
    for (const name of COMPANIES) assert.ok(!hasName(body, name), `${file} has no "${name}"`);
    assert.doesNotMatch(body, /mupsi/i, `${file} has no MuPSI`);
    assert.doesNotMatch(body, /logo|\.png|\.svg|\.jpg/i, `${file} has no logo`);
    assert.doesNotMatch(body, /operator/i, `${file} has no operator column`);
  }
  assert.deepEqual(plain(data.attribution), {
    nsta: 'Contains information provided by the North Sea Transition Authority and/or other third parties.',
    nlog: 'Source: NLOG.NL.',
    status: 'Project status from public sources, 28 Oct 2026.',
  });
  assert.match(data.builtOn, /^\d{4}-\d{2}-\d{2}$/, 'the file has its build date');
});

test('all coordinates are inside the map bounds and have 3 decimals at most', () => {
  const [west, south, east, north] = data.bounds;
  const [[boxWest, boxSouth], [boxEast, boxNorth]] = STORY_EARTH_FIELDS_BOX;
  assert.ok(west >= boxWest - 1.5 && east <= boxEast + 1.5 && south >= boxSouth - 0.5 && north <= boxNorth + 0.5, 'the bounds are the area of the large map (about 51 to 61 degrees north, 4 degrees west to 9 degrees east)');
  const inside = (lon, lat, label) => {
    assert.ok(lon >= west && lon <= east && lat >= south && lat <= north, `${label}: ${lon}, ${lat} is outside the bounds`);
    assert.ok(Math.abs(Math.round(lon * 1000) / 1000 - lon) < 1e-9 && Math.abs(Math.round(lat * 1000) / 1000 - lat) < 1e-9, `${label}: more than 3 decimals`);
  };
  data.ceased.forEach(([lon, lat], i) => inside(lon, lat, `ceased ${i}`));
  data.outlines.forEach(outline => outline.rings.forEach(ring => ring.forEach(([lon, lat]) => inside(lon, lat, `outline of ${outline.project}`))));
  data.projects.forEach(project => inside(project.lon, project.lat, project.id));
  const keys = new Set(data.ceased.map(point => point.join(',')));
  assert.equal(keys.size, data.ceased.length, 'no point twice');
});

test('the script asks only the two approved services, asks for no operator column, and the input table matches the file', () => {
  const script = read('tools/north-sea-map.js');
  const hosts = [...script.matchAll(/https:\/\/([a-z0-9.-]+)\//g)].map(match => match[1]);
  assert.deepEqual([...new Set(hosts)].sort(), ['services-eu1.arcgis.com', 'www.gdngeoservices.nl'], 'NSTA (UK) and NLOG (NL) only');
  assert.doesNotMatch(script, /OPERATOR|CURR_OPER|ORIG_OP|EQUITY/, 'the script never asks for a company column');
  assert.match(script, /outFields: 'FIELDNAME'/);
  assert.match(script, /propertyName: 'FIELD_CODE,GEOMETRY'/);
  assert.deepEqual(data.queried.map(item => new URL(item.url).hostname), ['services-eu1.arcgis.com', 'www.gdngeoservices.nl']);
  const table = JSON.parse(read('tools/north-sea-projects.json'));
  assert.equal(table.projects.length, data.projects.length);
  table.projects.forEach(row => {
    const item = data.projects.find(project => project.id === row.id);
    assert.deepEqual([item.name, item.short, item.group, item.status, item.year, item.source, item.country], [row.name, row.short, row.group, row.status, row.year, row.source, row.country], `${row.id}: the file matches the table`);
    const mean = index => Math.round(row.points.reduce((sum, point) => sum + point[index], 0) / row.points.length * 1000) / 1000;
    assert.deepEqual([item.lat, item.lon], [mean(0), mean(1)], `${row.id}: the marker is the mean of its points`);
  });
  const research = read('docs/superpowers/specs/2026-10-28-north-sea-ccs-map-research.md');
  assert.match(research, /node tools\/north-sea-map\.js/, 'the research file tells how to run the script again');
});

// ---- the stage in the story

test('the stage fields is the second stage, between orbit and descent, with 8 seconds and one caption', () => {
  const stage = read('StoryStage.jsx');
  const helpers = new Function(`${between(stage, '// ---- story helpers', '// ---- end story helpers')}\nreturn { STORY_CHAPTERS, STORY_DURATIONS, STORY_CAPTION_COUNT };`)();
  assert.deepEqual(helpers.STORY_CHAPTERS.map(chapter => chapter.id), ['orbit', 'fields', 'descent', 'rock', 'grid', 've', 'live']);
  assert.equal(helpers.STORY_DURATIONS.fields, 8);
  assert.equal(helpers.STORY_CAPTION_COUNT.fields, 1);
  const caption = SITE_STORY.captions.fields;
  assert.equal(caption.length, 1);
  assert.equal(caption[0], 'Hundreds of gas fields under the North Sea no longer produce. Projects in the UK, the Netherlands and Denmark plan to store CO₂ in some of them.');
  assert.equal(caption[0].split(/(?<=\.)\s/).length, 2, 'two sentences at the most');
  for (const name of COMPANIES) assert.ok(!hasName(caption[0], name), `the caption has no "${name}"`);
  assert.doesNotMatch(caption[0], /mupsi/i);
  assert.match(stage, /chapter\.id === 'fields' && typeof StoryFieldsList === 'function' && <StoryFieldsList on=\{on\} \/>/, 'the list is in the words of the stage fields');
  const files = [...read('build.js').match(/const files = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map(match => match[1]);
  assert.ok(files.indexOf('StoryFields.jsx') === files.indexOf('StoryEarth.jsx') + 1 && files.indexOf('StoryFields.jsx') < files.indexOf('StoryRock.jsx'), 'StoryFields.jsx follows StoryEarth.jsx in the build');
  const bundle = read('bundle.js');
  assert.ok(bundle.includes('// File: StoryFields.jsx') && /STORY_RENDERERS\.fields=/.test(bundle), 'build the current source before testing');
});

test('the pages load the new bundle and the new stylesheet in the same version', () => {
  const versions = file => [read(file).match(/(?<![-\w])bundle\.js\?v=(\d+)/)[1], read(file).match(/colors_and_type\.css\?v=(\d+)/)[1]];
  assert.deepEqual(versions('index.html'), versions('cv.html'));
  assert.deepEqual(versions('index.html'), versions('simulator.html'));
  assert.ok(Number(versions('index.html')[0]) >= 58 && Number(versions('index.html')[1]) >= 55, 'bundle.js 58 and colors_and_type.css 55, or newer');
});

// ---- the camera: the card grows into the large map, and the large map goes back into the card

test('layout: the large map holds the card, stays clear of the caption and inside the stage', () => {
  for (const [width, height] of SIZES) {
    const layout = storyEarthLayout(width, height);
    const label = `${width} by ${height}`;
    const { card, fields, maps } = layout;
    assert.ok(fields.x >= 0 && fields.y >= layout.skip && fields.x + fields.w <= width && fields.y + fields.h <= height, `${label}: the map is in the stage, under the skip control`);
    assert.ok(maps.f >= maps.a, `${label}: the map zooms in while it grows`);
    assert.ok(maps.b > maps.f, `${label}: the zoom of descent goes in from the large map`);
    assert.ok(layout.kMap <= layout.k && layout.kMap >= 0.9, `${label}: the blue marker is not larger on the large map`);
    if (!layout.compact) {
      assert.ok(fields.x >= 0.4 * width && fields.x <= card.x, `${label}: the caption (36.5% of the width at the most) stays clear of the map`);
      assert.ok(fields.x + fields.w >= card.x + card.w && fields.y <= card.y && fields.y + fields.h >= card.y + card.h, `${label}: the map holds the card`);
    } else if (width <= 640) {
      // The caption has 4 to 5 lines at 25.5 px from 128 px, and the button of the list is under it.
      assert.ok(fields.y >= 128 + 25.5 * Math.ceil(1400 / (width - 32)) + 56 - 1e-9, `${label}: the top band stays clear of the caption and the button`);
      assert.ok(fields.y <= card.y && fields.y + fields.h >= card.y + card.h, `${label}: the map holds the card`);
    }
    // The whole box (about 51 to 61 degrees north, 4.5 degrees west to 9 degrees east) is on the map.
    const [[boxWest, boxSouth], [boxEast, boxNorth]] = STORY_EARTH_FIELDS_BOX;
    for (const [lon, lat] of [[boxWest, boxSouth], [boxEast, boxSouth], [boxWest, boxNorth], [boxEast, boxNorth]]) {
      const p = storyEarthMapPoint({ S: maps.f, lon: STORY_EARTH_TARGET[0] * Math.PI / 180, y: storyEarthMercY(STORY_EARTH_TARGET[1]), mx: layout.fieldsMarker.x, my: layout.fieldsMarker.y }, lon, lat);
      // On a very short screen (375 by 667) the map keeps zooming in, so the box is larger than the map by 4 percent at most.
      const slack = 0.04 * fields.h;
      assert.ok(p.x >= fields.x - slack && p.x <= fields.x + fields.w + slack && p.y >= fields.y - slack && p.y <= fields.y + fields.h - fields.foot + slack, `${label}: ${lon}, ${lat} is on the map, above the attribution`);
    }
    assert.ok(layout.fieldsMarker.x > fields.x && layout.fieldsMarker.x < fields.x + fields.w && layout.fieldsMarker.y > fields.y && layout.fieldsMarker.y < fields.y + fields.h, `${label}: the example site is on the map`);
  }
  const still = storyEarthLayout(1000, 562.5, true);
  assert.deepEqual([still.fields.x, still.fields.y, still.fields.w, still.fields.h], [16, 16, 968, 530.5], 'a static frame has no caption on the canvas: the map takes the frame');
});

test('fields camera: it starts as the card of orbit, grows into the large map, and the layers come in order', () => {
  for (const [width, height] of SIZES) {
    const layout = storyEarthLayout(width, height);
    const label = `${width} by ${height}`;
    const { card, fields, maps } = layout;
    assert.deepEqual(plain(storyEarthFieldsCamera(0, layout).lens), plain(storyEarthOrbitCamera(1, layout).lens), `${label}: no jump between orbit and fields`);
    assert.equal(storyEarthFieldsCamera(0, layout).size, layout.k, `${label}: the marker has its size in the card`);
    const grown = storyEarthFieldsCamera(STORY_EARTH_GROW, layout);
    assert.deepEqual(plain(grown.lens), { x: fields.x, y: fields.y, w: fields.w, h: fields.h, r: fields.r, S: maps.f, mx: layout.fieldsMarker.x, my: layout.fieldsMarker.y }, `${label}: the large map`);
    assert.deepEqual(plain(storyEarthFieldsCamera(1, layout).lens), plain(grown.lens), `${label}: it stays when the layers come in`);
    assert.equal(storyEarthFieldsCamera(1, layout).size, layout.kMap);
    let before = storyEarthFieldsCamera(0, layout);
    for (const local of sweep(200).slice(1)) {
      const now = storyEarthFieldsCamera(local, layout);
      assert.ok(now.lens.S >= before.lens.S - 1e-9 && now.lens.w >= before.lens.w - 1e-9 && now.lens.h >= before.lens.h - 1e-9, `${label}, local ${local}: the map only grows`);
      const { lens } = now;
      assert.ok(lens.mx >= lens.x - 1e-9 && lens.mx <= lens.x + lens.w + 1e-9 && lens.my >= lens.y - 1e-9 && lens.my <= lens.y + lens.h + 1e-9, `${label}, local ${local}: the blue marker is on the map`);
      for (const key of Object.keys(now.reveal)) assert.ok(now.reveal[key] >= before.reveal[key] - 1e-12 && now.reveal[key] >= 0 && now.reveal[key] <= 1, `${label}, local ${local}: ${key} only comes in`);
      if (local < STORY_EARTH_GROW) assert.deepEqual(Object.values(now.reveal), [0, 0, 0, 0, 0], `${label}, local ${local}: no layer while the card grows`);
      before = now;
    }
    const at = key => sweep(1000).find(local => storyEarthFieldsCamera(local, layout).reveal[key] > 0);
    assert.ok(at('ceased') >= STORY_EARTH_GROW && at('ceased') < at('outlines') && at('outlines') < at('markers') && at('markers') < at('names'), 'the order: ceased gas fields, outlines, markers, names');
    assert.ok(at('key') <= at('outlines'), 'the key and the attribution are there before the outlines');
    assert.deepEqual(Object.values(storyEarthFieldsCamera(1, layout).reveal), [1, 1, 1, 1, 1], `${label}: everything at the end`);
    const words = local => Object.fromEntries(storyEarthFieldsCamera(local, layout).words);
    assert.deepEqual(words(0), { 'North Sea': 1, 'Example site': 0 }, 'the card says "North Sea"');
    assert.deepEqual(words(1), { 'North Sea': 0, 'Example site': 1 }, 'the large map says "Example site"');
  }
});

test('descent camera: the layers fade out first, then the large map goes back to the card with a zoom in', () => {
  for (const [width, height] of SIZES) {
    const layout = storyEarthLayout(width, height);
    const label = `${width} by ${height}`;
    const start = storyEarthDescentCamera(0, layout);
    assert.deepEqual(Object.values(start.reveal), [1, 1, 1, 1, 1], `${label}: all layers at the start`);
    assert.deepEqual(Object.fromEntries(start.words), { 'Example site': 1, 'North Sea': 0 });
    assert.equal(start.size, layout.kMap);
    const faded = storyEarthDescentCamera(STORY_EARTH_FADE, layout);
    assert.deepEqual(Object.values(faded.reveal), [0, 0, 0, 0, 0], `${label}: no layer after the fade`);
    assert.deepEqual(plain(faded.lens), plain(start.lens), `${label}: the map does not move while the layers fade`);
    assert.deepEqual(Object.fromEntries(faded.words), { 'Example site': 0, 'North Sea': 1 });
    let before = start;
    for (const local of sweep(200).slice(1)) {
      const now = storyEarthDescentCamera(local, layout);
      assert.ok(now.reveal.names <= before.reveal.names + 1e-12 && now.reveal.markers <= before.reveal.markers + 1e-12, `${label}, local ${local}: the layers only fade`);
      assert.ok(now.reveal.names <= now.reveal.markers + 1e-12, 'the names go first');
      if (local > STORY_EARTH_FADE && local <= STORY_EARTH_ZOOM) assert.ok(now.lens.S >= before.lens.S - 1e-9, `${label}, local ${local}: the map zooms in`);
      before = now;
    }
    // The zoom ends in the card, with the marker at the middle, as before the stage fields existed.
    const zoomed = storyEarthDescentCamera(STORY_EARTH_ZOOM, layout);
    assert.deepEqual(plain(zoomed.lens), { x: layout.card.x, y: layout.card.y, w: layout.card.w, h: layout.card.h, r: layout.card.r, S: layout.maps.b, mx: layout.card.cx, my: layout.card.cy });
    assert.equal(zoomed.size, layout.k);
  }
});

// ---- the label plan: names, key and attribution

const planOf = (width, height, still = false) => {
  const layout = storyEarthLayout(width, height, still);
  return { layout, plan: storyFieldsPlan(layout, data) };
};

// All boxes of the marks of a plan: the head and the stem of each marker.
const marksOf = plan => plan.markers.map(marker => ({
  id: marker.id,
  head: { x0: marker.hx - marker.r, y0: marker.hy - marker.r, x1: marker.hx + marker.r, y1: marker.hy + marker.r },
  stem: { x0: Math.min(marker.tx, marker.hx) - 1, y0: Math.min(marker.ty, marker.hy), x1: Math.max(marker.tx, marker.hx) + 1, y1: Math.max(marker.ty, marker.hy) },
  marker,
}));
const overlap = (a, b) => !(a.x1 <= b.x0 || b.x1 <= a.x0 || a.y1 <= b.y0 || b.y1 <= a.y0);

test('labels at 1280 by 800 and 390 by 844: no name overlaps a name, a marker, the key, the attribution or the blue marker', () => {
  for (const [width, height] of [[1280, 800], [390, 844]]) {
    const { layout, plan } = planOf(width, height);
    const label = `${width} by ${height}`;
    const { rect } = plan;
    const marks = marksOf(plan);
    const fixed = [{ id: 'the key', box: plan.key.box }, { id: 'the attribution', box: plan.strip.box }, { id: 'the blue marker', box: plan.example.mark }, { id: 'the label of the blue marker', box: plan.example.label }];
    assert.ok(plan.labels.length > 0);
    plan.labels.forEach(item => {
      const { box } = item;
      assert.ok(box.x0 >= rect.x && box.x1 <= rect.x + rect.w && box.y0 >= rect.y && box.y1 <= rect.y + rect.h, `${label}: ${item.id} is inside the map`);
      marks.forEach(mark => {
        if (mark.id === item.id) {
          const px = Math.min(Math.max(mark.marker.hx, box.x0), box.x1);
          const py = Math.min(Math.max(mark.marker.hy, box.y0), box.y1);
          assert.ok(Math.hypot(px - mark.marker.hx, py - mark.marker.hy) >= mark.marker.r + 2, `${label}: the name of ${item.id} does not touch its marker`);
        } else {
          assert.ok(!overlap(box, mark.head), `${label}: the name ${item.id} covers the marker ${mark.id}`);
          assert.ok(!overlap(box, mark.stem), `${label}: the name ${item.id} covers the stem of ${mark.id}`);
        }
      });
      fixed.forEach(other => assert.ok(!overlap(box, other.box), `${label}: the name ${item.id} covers ${other.id}`));
      const own = plan.markers.find(marker => marker.id === item.id);
      assert.ok(Math.hypot((box.x0 + box.x1) / 2 - own.hx, (box.y0 + box.y1) / 2 - own.hy) < 160, `${label}: the name of ${item.id} is near its marker`);
    });
    for (let i = 0; i < plan.labels.length; i += 1) {
      for (let j = i + 1; j < plan.labels.length; j += 1) {
        assert.ok(!overlap(plan.labels[i].box, plan.labels[j].box), `${label}: the names ${plan.labels[i].id} and ${plan.labels[j].id} overlap`);
      }
    }
    // Leaders: short, and they cross no mark, no name and no other leader.
    const leaders = plan.labels.filter(item => item.leader);
    leaders.forEach(item => {
      assert.ok(Math.hypot(item.leader[2] - item.leader[0], item.leader[3] - item.leader[1]) <= 125, `${label}: the leader of ${item.id} is short`);
      marks.filter(mark => mark.id !== item.id).forEach(mark => {
        assert.ok(!storyFieldsHits(item.leader, mark.head) && !storyFieldsHits(item.leader, mark.stem), `${label}: the leader of ${item.id} crosses the marker ${mark.id}`);
      });
      plan.labels.filter(other => other !== item).forEach(other => {
        assert.ok(!storyFieldsHits(item.leader, other.box), `${label}: the leader of ${item.id} crosses the name ${other.id}`);
        if (other.leader) assert.ok(!storyFieldsCross(item.leader, other.leader), `${label}: the leaders of ${item.id} and ${other.id} cross`);
      });
    });
    // The marks do not overlap, and the key, the attribution and the blue marker do not hide a marker.
    for (let i = 0; i < marks.length; i += 1) {
      for (let j = i + 1; j < marks.length; j += 1) assert.ok(!overlap(marks[i].head, marks[j].head), `${label}: the markers ${marks[i].id} and ${marks[j].id} overlap`);
      fixed.forEach(other => assert.ok(!overlap(marks[i].head, other.box), `${label}: ${other.id} hides the marker ${marks[i].id}`));
    }
    assert.ok(plan.key.box.x0 >= rect.x && plan.key.box.x1 <= rect.x + rect.w && plan.key.box.y0 >= rect.y && plan.key.box.y1 <= plan.strip.box.y0, `${label}: the key is in the map, above the attribution`);
    assert.equal(plan.strip.lines.join(' '), `${data.attribution.nsta} ${data.attribution.nlog} ${data.attribution.status}`, `${label}: the attribution is in the strip, word for word`);
    assert.ok(plan.strip.box.y1 === rect.y + rect.h && plan.strip.box.x0 === rect.x && plan.strip.box.x1 === rect.x + rect.w);
    assert.ok(plan.strip.box.y1 - plan.strip.box.y0 <= layout.fields.foot + 1e-9, `${label}: the strip fits in the room that the map keeps for it`);
    assert.deepEqual(plan.key.entries.map(entry => entry.group), [1, 2, 3, 4], `${label}: one row for each group`);
    if (width <= 640) assert.ok(rect.y >= 128 + 25.5 * Math.ceil(1400 / (width - 32)) + 56 - 1e-9, `${label}: the caption band is clear`);
  }
});

test('names: a large screen names all 21 projects, a phone names fewer (all depleted gas projects first), and Camelot has its status', () => {
  const wide = planOf(1280, 800).plan;
  assert.equal(wide.labels.length, 21, 'a laptop screen names all projects');
  assert.equal(wide.labels.find(item => item.id === 'camelot').tag, 'withdrawing (2026)', 'Camelot shows its status on the map');
  for (const [width, height] of [[1920, 1080], [1440, 900], [1024, 768]]) {
    const { plan } = planOf(width, height);
    assert.ok(plan.labels.filter(item => item.group === 1).length === 12, `${width} by ${height}: all depleted gas projects have a name`);
  }
  const phone = planOf(390, 844).plan;
  assert.ok(phone.labels.length < wide.labels.length, 'the phone has fewer names');
  assert.equal(phone.labels.filter(item => item.group === 1).length, 12, 'but all depleted gas projects keep their names');
  assert.equal(phone.labels.filter(item => item.group === 3).length, 0, 'the saline projects have no name on a phone (they are in the list)');
  assert.ok(phone.labels.every(item => !item.tag), 'no second line on a phone');
  for (const [width, height] of [[375, 667], [360, 640]]) {
    const { plan } = planOf(width, height);
    assert.ok(plan.labels.filter(item => item.group === 1).length >= 6, `${width} by ${height}: half of the depleted gas projects keep their names`);
  }
  // The names come from the data. A project with no name on the map is still in the list for screen readers.
  assert.deepEqual(wide.labels.map(item => item.text).sort(), data.projects.map(project => project.short).sort());
});

test('the width estimates are above the widths that were measured in Literata and in Georgia (28 Oct 2026)', () => {
  // The largest width for each character: italic 600 (Georgia 0.685, Literata 0.588), italic 400 (0.592, 0.599),
  // the long lines of the attribution (0.505, 0.45) and the entries of the key (0.44, 0.42).
  assert.ok(STORY_FIELDS_EM.bold >= 0.66 && STORY_FIELDS_EM.italic >= 0.6 && STORY_FIELDS_EM.strip >= 0.505 && STORY_FIELDS_EM.key >= 0.44);
  assert.ok(storyFieldsStyle(storyEarthLayout(390, 844)).phone && !storyFieldsStyle(storyEarthLayout(1280, 800)).phone);
  assert.equal(storyFieldsOwn(0, 0.5), 0);
  assert.equal(storyFieldsOwn(1, 1), 1, 'the last item of a row is done at the end');
  assert.ok(storyFieldsOwn(0.5, 0) > storyFieldsOwn(0.5, 1), 'the first items come first');
});

// ---- the renderer, run from the compiled bundle with a recording context

const loadFields = ({ failData = false } = {}) => {
  const bundle = read('bundle.js');
  const code = between(bundle, '// File: StoryEarth.jsx', '// File: StoryRock.jsx');
  assert.ok(code.includes('StoryFieldsList') && code.includes('STORY_RENDERERS.fields='), 'build the current source before testing');
  const stage = read('StoryStage.jsx');
  const colors = new Function(`${between(stage, 'const STORY_COLORS', '// A number from lo to hi')}\nreturn STORY_COLORS;`)();
  const topology = JSON.parse(read('assets/land-110m.json'));
  const requests = [];
  const errors = [];
  let releaseLand;
  let releaseData;
  const land = new Promise(resolve => { releaseLand = () => resolve({ ok: true, json: () => Promise.resolve(topology) }); });
  const file = new Promise((resolve, reject) => { releaseData = () => (failData ? reject(new Error('offline')) : resolve({ ok: true, json: () => Promise.resolve(JSON.parse(text)) })); });
  const slots = [];
  let slot = 0;
  const context = {
    STORY_COLORS: colors, STORY_RENDERERS: {}, window: {}, Path2D: class {}, console: { error: (...args) => errors.push(args) },
    fetch: url => { requests.push(url); return url.includes('north-sea') ? file : land; },
    React: { Fragment: 'Fragment', createElement: (type, props, ...children) => ({ type, props: props || {}, children }) },
    useEffect: fn => { context.effects.push(fn); },
    useState: init => { const i = slot; slot += 1; if (!(i in slots)) slots[i] = init; return [slots[i], value => { slots[i] = value; }]; },
    effects: [],
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  return {
    context, renderers: context.STORY_RENDERERS, requests, errors,
    // The requests start with the first draw, or with the mount of the list. release starts them with one draw if nothing did.
    releaseData: async () => { releaseData(); await settle(); await settle(); },
    releaseLand: async () => { releaseLand(); await settle(); await settle(); },
    release: async () => {
      if (!requests.length) context.STORY_RENDERERS.fields.draw(logContext().ctx, frameOf({ local: 0.5 }));
      releaseLand();
      releaseData();
      await settle();
      await settle();
    },
    render: (name, props) => { slot = 0; context.effects.length = 0; return vm.runInContext(name, context)(props); },
  };
};

const settle = () => new Promise(resolve => setTimeout(resolve, 0));
const frameOf = (extra = {}) => ({ local: 0.5, p: 0.1, width: 1280, height: 800, dpr: 1, time: 0, reducedMotion: false, ...extra });

// A context that writes every call and every set, in order. Two draws with the same list are the same picture.
const logContext = () => {
  const calls = [];
  const base = { measureText: string => ({ width: String(string).length * 6 }) };
  const ctx = new Proxy(base, {
    get: (object, key) => (key in object ? object[key] : (...args) => { calls.push([String(key), ...args]); }),
    set: (object, key, value) => { calls.push(['set', String(key), value]); object[key] = value; return true; },
  });
  return { ctx, calls };
};

// A context that keeps the state of the style and writes the fills and the texts with the style and the opacity of that moment.
const traceContext = () => {
  const events = [];
  const state = { fillStyle: '#000000', strokeStyle: '#000000', globalAlpha: 1, lineWidth: 1, font: '' };
  let path = [];
  const log = (op, extra) => events.push({ op, fill: state.fillStyle, stroke: state.strokeStyle, alpha: state.globalAlpha, ...extra });
  const base = { measureText: string => ({ width: String(string).length * 6 }) };
  const ctx = new Proxy(base, {
    get: (object, key) => {
      if (key in object) return object[key];
      if (key in state) return state[key];
      return (...args) => {
        if (key === 'beginPath') path = [];
        else if (['moveTo', 'lineTo', 'arc', 'rect', 'arcTo', 'closePath', 'quadraticCurveTo'].includes(key)) path.push(key);
        if (key === 'fill' || key === 'stroke') log(key, { path: path.slice() });
        else if (key === 'fillText') log('text', { text: args[0], font: state.font });
      };
    },
    set: (object, key, value) => { state[key] = value; return true; },
  });
  return { ctx, events, state };
};

test('boundary orbit to fields: the first frame of fields is the last frame of orbit, before and after the data arrives', async () => {
  const run = await loadFields();
  const sizes = [[1280, 800], [1920, 1080], [1024, 768], [768, 1024], [390, 844]];
  const compare = label => {
    for (const [width, height] of sizes) {
      const last = logContext();
      run.renderers.orbit.draw(last.ctx, frameOf({ local: 1, width, height }));
      const first = logContext();
      run.renderers.fields.draw(first.ctx, frameOf({ local: 0, width, height }));
      assert.ok(last.calls.length > 10, 'the map card is drawn');
      assert.deepEqual(first.calls, last.calls, `${label}, ${width}x${height}: the same picture`);
    }
  };
  compare('no data yet');
  await run.release();
  compare('with the land and the data');
  const texts = logContext();
  run.renderers.fields.draw(texts.ctx, frameOf({ local: 0 }));
  assert.deepEqual(texts.calls.filter(call => call[0] === 'fillText').map(call => call[1]), ['North Sea'], 'the card with its label');
  assert.deepEqual(run.errors, []);
});

test('boundary fields to descent: the first frame of descent is the last frame of fields, before and after the data arrives', async () => {
  const run = await loadFields();
  const sizes = [[1280, 800], [1920, 1080], [1024, 768], [768, 1024], [390, 844]];
  const compare = label => {
    for (const [width, height] of sizes) {
      const last = logContext();
      run.renderers.fields.draw(last.ctx, frameOf({ local: 1, width, height }));
      const first = logContext();
      run.renderers.descent.draw(first.ctx, frameOf({ local: 0, width, height }));
      assert.ok(last.calls.length > 10, 'the large map is drawn');
      assert.deepEqual(first.calls, last.calls, `${label}, ${width}x${height}: the same picture`);
    }
  };
  compare('no data yet');
  await run.release();
  compare('with the land and the data');
  const full = logContext();
  run.renderers.descent.draw(full.ctx, frameOf({ local: 0 }));
  const words = full.calls.filter(call => call[0] === 'fillText').map(call => call[1]);
  assert.ok(words.includes('Example site') && words.includes('HyNet') && words.includes('Camelot') && words.includes('Pilot or study'), 'the layers, the key and the example site are in the first frame of descent');
  assert.ok(!words.includes('North Sea'));
  // After the fade the layers are gone and the label is the old one.
  const after = logContext();
  run.renderers.descent.draw(after.ctx, frameOf({ local: STORY_EARTH_FADE }));
  assert.deepEqual(after.calls.filter(call => call[0] === 'fillText').map(call => call[1]), ['North Sea']);
  assert.deepEqual(run.errors, []);
});

test('the layers come in this order: grey points, key and attribution, outlines, markers, names; no drawing leaves the opacity changed', async () => {
  const run = await loadFields();
  await run.release();
  const traces = sweep(200).map(local => {
    const trace = traceContext();
    run.renderers.fields.draw(trace.ctx, frameOf({ local }));
    assert.equal(trace.state.globalAlpha, 1, `local ${local}: the opacity is back to 1`);
    return { local, events: trace.events };
  });
  const first = predicate => {
    const found = traces.find(trace => predicate(trace.events));
    return found ? found.local : Infinity;
  };
  const grey = '#a9b6bb';
  const sand = '#d8a657';
  const at = {
    grey: first(events => events.some(event => event.op === 'fill' && event.fill === grey && event.alpha > 0)),
    key: first(events => events.some(event => event.op === 'text' && event.text === 'Pilot or study' && event.alpha > 0)),
    attribution: first(events => events.some(event => event.op === 'text' && /^Source: NLOG\.NL\./.test(event.text) && event.alpha > 0)),
    outlines: first(events => events.some(event => event.op === 'fill' && event.fill === sand && event.path.includes('lineTo') && event.alpha > 0)),
    markers: first(events => events.filter(event => event.op === 'fill' && event.fill === sand && event.path.join() === 'arc' && event.alpha > 0).length >= 3),
    names: first(events => events.some(event => event.op === 'text' && /^(HyNet|Viking|Poseidon)$/.test(event.text) && event.alpha > 0)),
  };
  assert.ok(Object.values(at).every(Number.isFinite), `every layer comes in: ${JSON.stringify(at)}`);
  assert.ok(at.grey >= STORY_EARTH_GROW - 0.01, 'the layers wait for the large map');
  assert.ok(at.grey < at.outlines && at.outlines < at.markers && at.markers < at.names, `the order: ${JSON.stringify(at)}`);
  assert.ok(at.key <= at.outlines && at.attribution <= at.outlines, 'the key and the attribution come in with the grey points');
  // No project name before its marker, and at the end all names are there, with the legend, the attribution and the example site.
  const done = traceContext();
  run.renderers.fields.draw(done.ctx, frameOf({ local: 1 }));
  const written = done.events.filter(event => event.op === 'text').map(event => event.text);
  for (const project of data.projects) assert.ok(written.includes(project.short), `${project.short} is on the map`);
  assert.ok(written.includes('withdrawing (2026)') && written.includes('Example site'));
  for (const line of planOf(1280, 800).plan.strip.lines) assert.ok(written.includes(line), 'the attribution is on the map');
  assert.ok(done.events.filter(event => event.op === 'text').every(event => event.alpha === 1 || event.text), 'no text is half drawn at the end');
  assert.deepEqual(run.errors, []);
});

test('the blue marker and the colours: blue and red are used for the example site only, and the groups have their own colours', async () => {
  const source = read('StoryFields.jsx');
  assert.doesNotMatch(source, /STORY_COLORS\.(co2|ch4)|#3b6cf0|#c8463d/i, 'CO2 blue and methane red are data colours: the layers do not use them');
  assert.doesNotMatch(source, /createLinearGradient|createRadialGradient|shadowBlur|shadowColor|drawImage|new Image/, 'flat colour, and no logo or image');
  const run = await loadFields();
  await run.release();
  const trace = traceContext();
  run.renderers.fields.draw(trace.ctx, frameOf({ local: 1 }));
  const fills = new Set(trace.events.filter(event => event.op === 'fill').map(event => event.fill));
  const blue = fills.has('#3b6cf0');
  assert.ok(blue, 'the example site is blue');
  assert.equal(trace.events.filter(event => event.op === 'fill' && event.fill === '#3b6cf0').length, 1, 'one blue shape on the map: the example site');
  assert.ok(!trace.events.some(event => event.fill === '#c8463d' || event.stroke === '#c8463d'), 'no methane red');
  for (const colour of ['#d8a657', '#f3efe4', '#a9b6bb', '#2f5866']) assert.ok(fills.has(colour), `the group colour ${colour} is used`);
});

test('static frame (reduced motion): the full map with the layers, the names, the key and the attribution', async () => {
  const run = await loadFields();
  await run.release();
  for (const [width, height] of [[1000, 562.5], [1120, 630], [640, 360]]) {
    const trace = traceContext();
    run.renderers.fields.draw(trace.ctx, frameOf({ local: 1, width, height, reducedMotion: true }));
    const written = trace.events.filter(event => event.op === 'text').map(event => event.text);
    assert.ok(trace.events.every(event => event.alpha >= 0.5), `${width}x${height}: nothing is half drawn (the fill of an outline has 0.5, the names of the saline projects 0.9)`);
    assert.equal(trace.events.filter(event => event.op === 'text' && event.text === 'North Sea').length, 0, 'the static frame shows the large map');
    assert.ok(written.includes('Example site'), 'with the example site');
    assert.ok(written.includes('Gas field that no longer produces') || written.includes('Ceased gas field'), 'with the key');
    if (width > 640) for (const project of data.projects) assert.ok(written.includes(project.short), `${width}x${height}: ${project.short} is on the map`);
    const { plan } = planOf(width, height, true);
    plan.strip.lines.forEach(line => assert.ok(written.includes(line), `${width}x${height}: the attribution`));
    assert.ok(plan.labels.length >= 12, `${width}x${height}: names`);
    for (let i = 0; i < plan.labels.length; i += 1) {
      for (let j = i + 1; j < plan.labels.length; j += 1) assert.ok(!overlap(plan.labels[i].box, plan.labels[j].box), `${width}x${height}: the names ${plan.labels[i].id} and ${plan.labels[j].id} overlap`);
    }
  }
  assert.deepEqual(run.errors, []);
});

test('the data arrives late: each draw that ran before asks its frame for one more draw, with no event', async () => {
  const run = await loadFields();
  const counts = { fields: 0, descent: 0, still: 0 };
  const frames = {
    fields: frameOf({ local: 0.7, requestDraw: () => { counts.fields += 1; } }),
    descent: frameOf({ local: 0.02, requestDraw: () => { counts.descent += 1; } }),
    still: frameOf({ local: 1, reducedMotion: true, width: 1000, height: 562.5, requestDraw: () => { counts.still += 1; } }),
  };
  run.renderers.fields.draw(logContext().ctx, frames.fields);
  run.renderers.fields.draw(logContext().ctx, frames.fields);
  run.renderers.descent.draw(logContext().ctx, frames.descent);
  run.renderers.fields.draw(logContext().ctx, frames.still);
  assert.deepEqual(run.requests.filter(url => url.includes('north-sea')), ['assets/north-sea-ccs.json?v=1'], 'one request for the data');
  assert.deepEqual(counts, { fields: 0, descent: 0, still: 0 }, 'nothing is asked before the data arrives');
  assert.equal(run.renderers.fields.animated, false, 'the stage does not run on each frame to wait for the data');
  await run.releaseData();
  assert.deepEqual(counts, { fields: 1, descent: 1, still: 1 }, 'each function is called once, when the data arrives');
  await run.releaseLand();
  assert.deepEqual(counts, { fields: 2, descent: 2, still: 2 }, 'and once more when the land arrives: the stage joins the calls of one frame');
  run.renderers.fields.draw(logContext().ctx, frames.fields);
  assert.deepEqual(counts, { fields: 2, descent: 2, still: 2 }, 'a draw after the arrival asks for nothing');
  assert.equal(run.requests.filter(url => url.includes('north-sea')).length, 1);
  assert.deepEqual(run.errors, []);
});

test('a failed request for the data asks for nothing, reports once, and the map still draws the land and the card', async () => {
  const run = await loadFields({ failData: true });
  let asks = 0;
  const frame = frameOf({ local: 0.7, requestDraw: () => { asks += 1; } });
  run.renderers.fields.draw(logContext().ctx, frame);
  await run.releaseData();
  run.renderers.fields.draw(logContext().ctx, frame);
  run.renderers.descent.draw(logContext().ctx, frameOf({ local: 0, requestDraw: () => { asks += 1; } }));
  assert.equal(asks, 0, 'the failed data asks for nothing');
  assert.equal(run.errors.length, 1, 'one report in the console');
  assert.equal(run.requests.filter(url => url.includes('north-sea')).length, 1, 'no second request');
  await run.releaseLand();
  assert.equal(asks, 2, 'only the land asks, once for each of the two frames');
  const trace = traceContext();
  run.renderers.fields.draw(trace.ctx, frame);
  assert.ok(trace.events.some(event => event.op === 'fill' && event.fill === '#c9b26b'), 'the land is still there');
  assert.ok(!trace.events.some(event => event.op === 'text' && event.text === 'HyNet'), 'and no project name');
});

// ---- the list for screen readers

const findAll = (tree, predicate, found = []) => {
  if (Array.isArray(tree)) { tree.forEach(item => findAll(item, predicate, found)); return found; }
  if (!tree || typeof tree !== 'object') return found;
  if (predicate(tree)) found.push(tree);
  findAll(tree.children, predicate, found);
  return found;
};
const textOf = tree => {
  if (Array.isArray(tree)) return tree.map(textOf).join('');
  if (tree === null || tree === undefined || tree === false) return '';
  if (typeof tree !== 'object') return String(tree);
  return textOf(tree.children);
};

test('the list "Map data and sources": a details element with every project, its status and its source link, and the attribution', async () => {
  const run = await loadFields();
  await run.release();
  const closed = run.render('StoryFieldsList', { on: true });
  assert.equal(closed.type, 'details');
  assert.equal(closed.props['data-on'], true);
  assert.equal(closed.props.open, false, 'the list is closed at first');
  const summary = findAll(closed, node => node.type === 'summary')[0];
  assert.equal(textOf(summary), 'Map data and sources');
  assert.equal(summary.props.tabIndex, undefined, 'the summary is in the tab order while the stage is on');
  assert.equal(findAll(closed, node => node.props && /story-data__panel/.test(node.props.className || '')).length, 0, 'no panel while it is closed');

  // The visitor opens it (the browser fires toggle).
  closed.props.onToggle({ currentTarget: { open: true } });
  const open = run.render('StoryFieldsList', { on: true });
  assert.equal(open.props.open, true);
  const items = findAll(open, node => node.type === 'li');
  assert.equal(items.length, data.projects.length, 'one item for each project');
  const links = findAll(open, node => node.type === 'a');
  assert.deepEqual(links.map(link => link.props.href), data.projects.map(project => project.source), 'each item has its source link');
  assert.ok(links.every(link => link.props.rel === 'noopener noreferrer' && link.props.tabIndex === undefined), 'external links, in the tab order');
  data.projects.forEach((project, i) => {
    const line = textOf(items[i]);
    assert.ok(line.includes(project.name) && line.includes(project.status) && line.includes(`(${project.country})`), `${project.id}: name, country and status`);
    assert.match(line, /Source for .+ \(opens in a new tab\)$/, 'the link text says what it is for');
  });
  const all = textOf(open);
  for (const heading of ['Projects in depleted gas fields', 'Pilots and studies', 'Projects in saline aquifers']) assert.ok(all.includes(heading), heading);
  assert.ok(all.includes(data.attribution.nsta) && all.includes(`${data.attribution.nlog} ${data.attribution.status}`), 'the attribution is in the list');
  assert.ok(all.includes('example site') && all.includes('216 gas fields'), 'the list explains the example site and the grey points');
  for (const name of COMPANIES) assert.ok(!hasName(all, name), `the list has no "${name}"`);
  assert.doesNotMatch(all, /mupsi/i);
  assert.ok(all.includes('Camelot CCS (UK). Withdrawing (2026).'));

  // The stage is off: the controls are out of the tab order, and the list closes itself.
  const off = run.render('StoryFieldsList', { on: false });
  assert.equal(off.props['data-on'], false);
  assert.equal(findAll(off, node => node.type === 'summary')[0].props.tabIndex, -1, 'the summary is out of the tab order');
  assert.ok(findAll(off, node => node.type === 'a').every(link => link.props.tabIndex === -1), 'and the links too');
  run.context.effects.forEach(effect => effect());
  const closedAgain = run.render('StoryFieldsList', { on: false });
  assert.equal(closedAgain.props.open, false, 'the list closes when the visitor leaves the stage');
});

test('the list loads the data itself, and a later arrival fills it', async () => {
  const run = await loadFields();
  const first = run.render('StoryFieldsList', { on: true });
  assert.equal(findAll(first, node => node.type === 'li').length, 0, 'no data yet');
  const effect = run.context.effects[0];
  const cleanup = effect();
  assert.equal(run.requests.filter(url => url.includes('north-sea')).length, 1, 'the list asks for the data at mount, so the map has it when the visitor arrives');
  assert.equal(typeof cleanup, 'function', 'and it stops watching when it unmounts');
  await run.release();
  const late = run.render('StoryFieldsList', { on: true });
  late.props.onToggle({ currentTarget: { open: true } });
  assert.equal(findAll(run.render('StoryFieldsList', { on: true }), node => node.type === 'li').length, 21);
  cleanup();
});

test('StoryFields.jsx: one local request, no library, no CDN, no event, no company, no MuPSI', () => {
  const source = read('StoryFields.jsx');
  assert.match(source, /fetch\(STORY_FIELDS_FILE\)/);
  assert.equal((source.match(/fetch\(/g) || []).length, 1);
  assert.match(source, /STORY_FIELDS_FILE = 'assets\/north-sea-ccs\.json\?v=1'/);
  assert.doesNotMatch(source, /https?:\/\/|\bd3\b|cdnjs|unpkg|jsdelivr/i, 'no CDN and no library');
  assert.doesNotMatch(source, /dispatchEvent|new Event\(/);
  assert.match(source, /requestDraw/);
  assert.doesNotMatch(source, /mupsi/i);
  for (const name of COMPANIES) assert.ok(!hasName(source, name), `no "${name}" in the source`);
  assert.ok(fs.existsSync(path.join(root, FILE)));
});
