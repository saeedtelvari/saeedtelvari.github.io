// StoryFields.jsx — the stage fields: a map of the North Sea with the gas fields that no longer produce and the CO2 storage projects.
//
// The camera of the stage (the card that grows into the large map) is in StoryEarth.jsx: storyEarthFieldsCamera.
// This file draws the layers on the land and it holds the data, the labels and the list for screen readers.
//
// The data is assets/north-sea-ccs.json. A person builds it with tools/north-sea-map.js (see the research file in docs/superpowers/specs).
// The map shows project names only. It shows no company, and it links no project to the author.
//
// Layers, in the order in which they come in:
//   ceased    Small grey points: the gas fields that no longer produce (UK and Netherlands).
//   outlines  The outlines of the fields of each project (UK and Netherlands).
//   markers   One marker for each project, on a short stem. The shape and the colour say the group:
//             1 depleted gas field: a circle in the sandstone colour. 2 pilot or study: a cream diamond.
//             3 saline aquifer: a small square with a chalk border (quieter). The colours of CO2 (blue) and methane (red) are not used.
//   names     The project names, with short leaders where a name cannot stand next to its marker.
//   key       A small key for the four groups, and the attribution. They come in with the grey points.
// The blue marker of the story stays on top. On this map it is the "Example site", not a real project.

const { useEffect, useState } = React;

// ---- story fields helpers (pure; tests/story-fields.test.js evaluates this block with the helpers of StoryEarth.jsx)
const STORY_FIELDS_FILE = 'assets/north-sea-ccs.json?v=1';

// The width of a text, as an upper bound. The plan must not depend on the font that is loaded, so it does not measure.
// Each kind has its width for each character, in em. The numbers are a little above the widths that were measured in
// Literata and in Georgia (the font that the browser uses until Literata has loaded).
//   bold    italic 600, the names of the depleted gas projects    italic  italic 400, the other names
//   strip   upright, the attribution (long lines)                  key     upright, the entries of the key
const STORY_FIELDS_EM = { bold: 0.68, italic: 0.6, strip: 0.51, key: 0.47 };
const storyFieldsWidth = (text, size, kind = 'italic') => text.length * size * STORY_FIELDS_EM[kind] + 3;

// The sizes of the marks. A phone (640 px or less) gets smaller marks and fewer names.
const storyFieldsStyle = layout => {
  const phone = layout.width <= 640;
  return {
    phone,
    stem: phone ? 9 : 11,
    head: [0, phone ? 5 : 6, phone ? 5 : 5.5, phone ? 4 : 4.5],
    font: [0, phone ? 12 : 13, phone ? 11 : 12, phone ? 11 : 11.5],
    tag: phone ? 0 : 11,
    key: phone ? 11 : 12.5,
    strip: phone ? 10 : 10.5,
    dot: phone ? 1.5 : 1.9,
    // The groups that get a name. A phone has no room for the names of the saline projects.
    named: phone ? 2 : 3,
  };
};

// The place of a point (lon and lat in degrees) in the large map, in pixels.
const storyFieldsPoint = (layout, lon, lat) => storyEarthMapPoint(
  { S: layout.maps.f, lon: STORY_EARTH_TARGET[0] * STORY_EARTH_RAD, y: storyEarthMercY(STORY_EARTH_TARGET[1]), mx: layout.fieldsMarker.x, my: layout.fieldsMarker.y },
  lon, lat,
);

// A part of a reveal for one item. frac is the place of the item in the row, from 0 to 1. spread is how much the items overlap in time.
const storyFieldsOwn = (reveal, frac, spread = 0.5) => storyEarthClamp((reveal - spread * frac) / (1 - spread));

// Text in lines that are not wider than width. Words are not split.
const storyFieldsWrap = (text, size, width, kind = 'strip') => {
  const lines = [];
  let line = '';
  text.split(' ').forEach(word => {
    const next = line ? `${line} ${word}` : word;
    if (line && storyFieldsWidth(next, size, kind) > width) { lines.push(line); line = word; } else line = next;
  });
  if (line) lines.push(line);
  return lines;
};

const storyFieldsApart = (a, b, margin = 0) => a.x1 + margin <= b.x0 || b.x1 + margin <= a.x0 || a.y1 + margin <= b.y0 || b.y1 + margin <= a.y0;

// Does a segment [x1, y1, x2, y2] go through a box? The segment is sampled every 2 px.
const storyFieldsHits = (segment, box) => {
  const steps = Math.max(1, Math.ceil(Math.hypot(segment[2] - segment[0], segment[3] - segment[1]) / 2));
  for (let i = 0; i <= steps; i += 1) {
    const x = segment[0] + (segment[2] - segment[0]) * i / steps;
    const y = segment[1] + (segment[3] - segment[1]) * i / steps;
    if (x > box.x0 && x < box.x1 && y > box.y0 && y < box.y1) return true;
  }
  return false;
};

// Do two segments cross?
const storyFieldsCross = (a, b) => {
  const side = (px, py, qx, qy, rx, ry) => Math.sign((qx - px) * (ry - py) - (qy - py) * (rx - px));
  return side(a[0], a[1], a[2], a[3], b[0], b[1]) !== side(a[0], a[1], a[2], a[3], b[2], b[3])
    && side(b[0], b[1], b[2], b[3], a[0], a[1]) !== side(b[0], b[1], b[2], b[3], a[2], a[3]);
};

// Two heads that are too close move apart along the line between them. A head moves by 24 px at the most.
// The stem still ends at the true place of the project.
const storyFieldsNudge = (markers, gap, limit) => {
  const home = markers.map(marker => ({ x: marker.hx, y: marker.hy }));
  for (let pass = 0; pass < 12; pass += 1) {
    let moved = false;
    for (let i = 0; i < markers.length; i += 1) {
      for (let j = i + 1; j < markers.length; j += 1) {
        const a = markers[i];
        const b = markers[j];
        let dx = b.hx - a.hx;
        let dy = b.hy - a.hy;
        let d = Math.hypot(dx, dy);
        const need = a.r + b.r + gap;
        if (d >= need) continue;
        if (d < 1e-6) { dx = 1; dy = 0; d = 1; }
        const push = (need - d) / 2 + 0.01;
        a.hx -= dx / d * push;
        a.hy -= dy / d * push;
        b.hx += dx / d * push;
        b.hy += dy / d * push;
        moved = true;
      }
    }
    markers.forEach((marker, i) => {
      const ox = marker.hx - home[i].x;
      const oy = marker.hy - home[i].y;
      const length = Math.hypot(ox, oy);
      if (length > limit) { marker.hx = home[i].x + ox / length * limit; marker.hy = home[i].y + oy / length * limit; }
    });
    if (!moved) break;
  }
};

// The directions in which a name can stand from its head, as unit vectors (y goes down). The first eight are right, left, up,
// up right, up left, down, down right and down left. The next eight are between them. A point lies at a distance from the head
// in the direction. The box of the name starts at that point and goes away from the head.
const STORY_FIELDS_DIRS = [
  [1, 0], [-1, 0], [0, -1], [0.707, -0.707], [-0.707, -0.707], [0, 1], [0.707, 0.707], [-0.707, 0.707],
  [0.924, -0.383], [0.924, 0.383], [-0.924, -0.383], [-0.924, 0.383], [0.383, -0.924], [-0.383, -0.924], [0.383, 0.924], [-0.383, 0.924],
];
// The distance steps from the head. A step larger than 0 needs a leader.
const STORY_FIELDS_STEPS = [0, 10, 22, 38, 56, 80, 110];

// Everything the layers need for one size of the stage: where each mark and each name stands, in pixels. The data is the JSON file.
// No name overlaps another name, a head, a stem, the key, the attribution or the blue marker with its label.
const storyFieldsPlan = (layout, data) => {
  const rect = layout.fields;
  const st = storyFieldsStyle(layout);
  const at = (lon, lat) => storyFieldsPoint(layout, lon, lat);
  const inRect = (p, pad) => p.x >= rect.x + pad && p.x <= rect.x + rect.w - pad && p.y >= rect.y + pad && p.y <= rect.y + rect.h - pad;
  const groupOf = {};
  data.projects.forEach(project => { groupOf[project.id] = project.group; });

  const ceased = data.ceased.map(([lon, lat]) => at(lon, lat)).filter(p => inRect(p, 2));
  const outlines = data.outlines.map(outline => ({ project: outline.project, group: groupOf[outline.project], rings: outline.rings.map(ring => ring.map(([lon, lat]) => at(lon, lat))) }));

  // The strip at the bottom of the map: the attribution, word for word.
  const words = [data.attribution.nsta, `${data.attribution.nlog} ${data.attribution.status}`];
  const lineHeight = st.strip * 1.4;
  const lines = [].concat(...words.map(text => storyFieldsWrap(text, st.strip, rect.w - 20)));
  const strip = {
    size: st.strip, lineHeight, lines,
    box: { x0: rect.x, y0: rect.y + rect.h - lines.length * lineHeight - 10, x1: rect.x + rect.w, y1: rect.y + rect.h },
  };

  // The blue marker of the story and its label (see storyEarthMarker). The label is right and above the marker.
  const size = layout.kMap;
  const ex = layout.fieldsMarker.x;
  const ey = layout.fieldsMarker.y;
  const example = {
    x: ex, y: ey,
    mark: { x0: ex - 9 * size, y0: ey - 9 * size, x1: ex + 9 * size, y1: ey + 9 * size },
    label: { x0: ex + 14 * size, y0: ey - 10 * size - 14 * size, x1: ex + 14 * size + storyFieldsWidth('Example site', 14 * size, 'italic'), y1: ey - 10 * size + 4 * size },
  };

  const markers = data.projects.filter(project => project.group >= 1 && project.group <= 3).map((project, index) => {
    const tip = at(project.lon, project.lat);
    return { id: project.id, index, project, group: project.group, r: st.head[project.group], tx: tip.x, ty: tip.y, hx: tip.x, hy: tip.y - st.stem };
  });
  storyFieldsNudge(markers, 9, 24);
  // A head stays inside the map.
  markers.forEach(marker => {
    marker.hx = storyEarthClamp(marker.hx, rect.x + marker.r + 4, rect.x + rect.w - marker.r - 4);
    marker.hy = storyEarthClamp(marker.hy, rect.y + marker.r + 4, rect.y + rect.h - marker.r - 4);
  });

  const headBox = marker => ({ x0: marker.hx - marker.r - 1.5, y0: marker.hy - marker.r - 1.5, x1: marker.hx + marker.r + 1.5, y1: marker.hy + marker.r + 1.5 });
  const stemBox = marker => ({
    x0: Math.min(marker.tx, marker.hx) - 1.5, y0: Math.min(marker.ty, marker.hy), x1: Math.max(marker.tx, marker.hx) + 1.5, y1: Math.max(marker.ty, marker.hy) + 1,
  });
  const marks = [example.mark, example.label];
  markers.forEach(marker => { marks.push(headBox(marker), stemBox(marker)); });

  // The key: one row for each group. It stands in the first corner of the map that has no mark: at the top left, then at
  // the bottom left, at the top right and at the bottom right. The cluster of the southern North Sea is at the bottom of the map.
  const rowHeight = st.key * 1.55;
  const entries = [1, 2, 3, 4].map(id => {
    const group = data.groups.find(item => item.id === id);
    return { group: id, text: st.phone ? group.short : group.name };
  });
  const keyWidth = Math.max(...entries.map(entry => storyFieldsWidth(entry.text, st.key, 'key'))) + 36;
  const keyHeight = entries.length * rowHeight + 12;
  const corners = [
    [rect.x + 10, rect.y + 10],
    [rect.x + 10, strip.box.y0 - 10 - keyHeight],
    [rect.x + rect.w - 10 - keyWidth, rect.y + 10],
    [rect.x + rect.w - 10 - keyWidth, strip.box.y0 - 10 - keyHeight],
  ].map(([x0, y0]) => ({ x0, y0, x1: x0 + keyWidth, y1: y0 + keyHeight }));
  const key = {
    size: st.key, rowHeight, entries,
    box: corners.find(box => marks.every(other => storyFieldsApart(box, other, 10))) || corners[0],
  };
  const base = [strip.box, key.box, example.mark, example.label];
  // The edge of the map.
  const edge = { x0: rect.x + 5, y0: rect.y + 5, x1: rect.x + rect.w - 5, y1: rect.y + rect.h - 5 };

  // Names: the groups come in order of priority (depleted gas first). In a group, the order of the table is the order of priority.
  // A name that has a tag (a second line, for example "withdrawing (2026)") goes first in its group, and it tries to stand with
  // the tag first, then without it.
  // A name that finds no free place is left out. The list for screen readers has all projects.
  // A leader is a short line from the head to its name. It must not cross a head, a stem, another name or another leader.
  // The names go one after the other, so an early name can take the place that a later name needs. A name that finds no place
  // goes to the front of the order, and all names are placed again. The best result of at most 8 tries stays.
  const place = order => {
    const placed = [];
    const labels = [];
    order.forEach(marker => {
      const { project } = marker;
      const fontSize = st.font[marker.group];
      // What the name and its leader must keep clear of: the key, the strip, the blue marker, the other marks and the own stem.
      // The own head is a circle: the name stands at a distance from it.
      const blockers = markers.filter(other => other !== marker).reduce((list, other) => list.concat(headBox(other), stemBox(other)), base.concat(stemBox(marker)));
      const clearOfHead = box => Math.hypot(storyEarthClamp(marker.hx, box.x0, box.x1) - marker.hx, storyEarthClamp(marker.hy, box.y0, box.y1) - marker.hy) >= marker.r + 2.5;
      for (const tag of st.tag && project.tag ? [project.tag, ''] : ['']) {
        const w = Math.max(storyFieldsWidth(project.short, fontSize, marker.group === 1 ? 'bold' : 'italic'), tag ? storyFieldsWidth(tag, st.tag, 'italic') : 0);
        const h = fontSize * 1.3 + (tag ? st.tag * 1.2 : 0);
        let found = null;
        for (const step of STORY_FIELDS_STEPS) {
          for (const [dx, dy] of STORY_FIELDS_DIRS) {
            const reach = marker.r + 3 + step;
            const ax = marker.hx + dx * reach;
            const ay = marker.hy + dy * reach;
            const x0 = ax - w * (0.5 - 0.5 * dx);
            const y0 = ay - h * (0.5 - 0.5 * dy);
            const box = { x0, y0, x1: x0 + w, y1: y0 + h };
            let leader = null;
            if (step > 0) {
              const px = storyEarthClamp(marker.hx, box.x0, box.x1);
              const py = storyEarthClamp(marker.hy, box.y0, box.y1);
              const length = Math.hypot(px - marker.hx, py - marker.hy) || 1;
              leader = [marker.hx + (px - marker.hx) / length * (marker.r + 2), marker.hy + (py - marker.hy) / length * (marker.r + 2), px, py];
            }
            const free = box.x0 >= edge.x0 && box.x1 <= edge.x1 && box.y0 >= edge.y0 && box.y1 <= edge.y1
              && clearOfHead(box)
              && blockers.every(other => storyFieldsApart(box, other, 1.5))
              && placed.every(other => storyFieldsApart(box, other.box, 2.5) && !(other.leader && storyFieldsHits(other.leader, box)))
              && (!leader || (!blockers.concat(placed.map(other => other.box)).some(other => storyFieldsHits(leader, other))
                && !placed.some(other => other.leader && storyFieldsCross(leader, other.leader))));
            if (free) { found = { box, leader }; break; }
          }
          if (found) break;
        }
        if (!found) continue;
        const label = { id: marker.id, group: marker.group, text: project.short, tag, size: fontSize, tagSize: st.tag, box: found.box, leader: found.leader };
        placed.push(label);
        labels.push(label);
        break;
      }
    });
    // A name that has no place, or that lost its tag, is missing.
    const missing = order.filter(marker => {
      const label = labels.find(item => item.id === marker.id);
      return !label || (st.tag && marker.project.tag && !label.tag);
    });
    // A name of the first group counts 100, of the second group 10, of the third group 1. A tag counts 5.
    const score = labels.reduce((sum, label) => sum + [0, 100, 10, 1][label.group] + (label.tag ? 5 : 0), 0);
    return { labels, missing, score };
  };

  let order = markers.filter(marker => marker.group <= st.named)
    .sort((a, b) => a.group - b.group || (b.project.tag ? 1 : 0) - (a.project.tag ? 1 : 0) || a.index - b.index);
  let best = place(order);
  let latest = best;
  for (let attempt = 0; attempt < 8 && latest.missing.length; attempt += 1) {
    order = latest.missing.concat(order.filter(marker => !latest.missing.includes(marker)));
    latest = place(order);
    if (latest.score > best.score) best = latest;
  }
  // The names in the order of the markers, so the draw order does not depend on the tries.
  const labels = markers.map(marker => best.labels.find(label => label.id === marker.id)).filter(Boolean);

  return { rect, st, ceased, outlines, markers, labels, key, strip, example };
};
// ---- end story fields helpers

// ---- the data: one request, shared by the canvas and the list
const storyFieldsData = { state: 'idle', value: null, plan: null, planKey: '' };

// The draws that ran before the data arrived (the frame.requestDraw of a stage or of a static frame), and the watchers of the list.
const storyFieldsWaiting = new Set();
const storyFieldsWatchers = new Set();

const storyFieldsLoad = frame => {
  if (storyFieldsData.state === 'idle' && typeof fetch === 'function') {
    storyFieldsData.state = 'loading';
    fetch(STORY_FIELDS_FILE)
      .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
      .then(value => {
        const shaped = value && [value.projects, value.ceased, value.outlines, value.groups].every(Array.isArray) && value.attribution && value.attribution.nsta;
        if (!shaped) throw new Error('The data of the map has a wrong shape.');
        storyFieldsData.value = value;
        storyFieldsData.state = 'ready';
        Array.from(storyFieldsWatchers).forEach(watcher => watcher(value));
        const calls = Array.from(storyFieldsWaiting);
        storyFieldsWaiting.clear();
        calls.forEach(call => call());
      })
      .catch(error => {
        storyFieldsData.state = 'failed';
        storyFieldsWaiting.clear();
        console.error('The data of the fields map did not load.', error);
      });
  }
  if (storyFieldsData.state === 'loading' && frame && typeof frame.requestDraw === 'function') storyFieldsWaiting.add(frame.requestDraw);
};

const storyFieldsPlanFor = layout => {
  const key = `${layout.width}x${layout.height}x${layout.still}`;
  if (storyFieldsData.planKey !== key || !storyFieldsData.plan) {
    storyFieldsData.plan = storyFieldsPlan(layout, storyFieldsData.value);
    storyFieldsData.planKey = key;
  }
  return storyFieldsData.plan;
};

// ---- drawing
const STORY_FIELDS_GREY = '#a9b6bb';
const STORY_FIELDS_LABEL = { 1: STORY_COLORS.cream, 2: STORY_COLORS.cream, 3: STORY_COLORS.chalk };

// The shape of the head of a marker: a circle (group 1), a diamond (group 2) or a square (group 3).
const storyFieldsHeadPath = (ctx, group, x, y, r) => {
  ctx.beginPath();
  if (group === 1) {
    ctx.arc(x, y, r, 0, 2 * Math.PI);
  } else if (group === 2) {
    ctx.moveTo(x, y - r * 1.15);
    ctx.lineTo(x + r * 1.15, y);
    ctx.lineTo(x, y + r * 1.15);
    ctx.lineTo(x - r * 1.15, y);
    ctx.closePath();
  } else {
    ctx.rect(x - r, y - r, 2 * r, 2 * r);
  }
};

// Draws the head. A group 3 head is a square with a chalk border and the colour of the sea inside: quieter than the others.
const storyFieldsHead = (ctx, group, x, y, r) => {
  storyFieldsHeadPath(ctx, group, x, y, r);
  if (group === 3) {
    // An ink line under the chalk line keeps the square clear on the land and on the key.
    ctx.fillStyle = STORY_COLORS.sea;
    ctx.fill();
    ctx.lineWidth = 3.6;
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.stroke();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = STORY_COLORS.chalk;
    ctx.stroke();
    return;
  }
  ctx.fillStyle = group === 1 ? STORY_COLORS.sand : STORY_COLORS.cream;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.stroke();
};

// Text with a thin ink border, so it reads on the sea and on the land.
const storyFieldsText = (ctx, text, x, y) => {
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
};

const storyFieldsDrawCeased = (ctx, plan, reveal) => {
  const n = plan.ceased.length;
  ctx.fillStyle = STORY_FIELDS_GREY;
  plan.ceased.forEach((p, i) => {
    const alpha = storyFieldsOwn(reveal, ((i * 7919) % n) / n, 0.6);
    if (alpha <= 0) return;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, plan.st.dot * (0.5 + 0.5 * alpha), 0, 2 * Math.PI);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
};

const storyFieldsDrawOutlines = (ctx, plan, reveal) => {
  plan.outlines.forEach((outline, i) => {
    const alpha = storyFieldsOwn(reveal, i / Math.max(1, plan.outlines.length - 1), 0.5);
    if (alpha <= 0) return;
    ctx.beginPath();
    outline.rings.forEach(ring => {
      ring.forEach((p, k) => { if (k === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
      ctx.closePath();
    });
    const color = outline.group === 1 ? STORY_COLORS.sand : STORY_COLORS.cream;
    ctx.globalAlpha = 0.5 * alpha;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1.2;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
};

const storyFieldsDrawMarkers = (ctx, plan, reveal) => {
  const n = plan.markers.length;
  plan.markers.forEach((marker, i) => {
    const alpha = storyFieldsOwn(reveal, i / Math.max(1, n - 1), 0.5);
    if (alpha <= 0) return;
    // The head rises from the true place of the project.
    const rise = storyEarthSmooth(alpha);
    const x = marker.tx + (marker.hx - marker.tx) * rise;
    const y = marker.ty + (marker.hy - marker.ty) * rise;
    ctx.globalAlpha = alpha;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(marker.tx, marker.ty);
    ctx.lineTo(x, y);
    ctx.lineWidth = 3.6;
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = STORY_COLORS.cream;
    ctx.stroke();
    storyFieldsHead(ctx, marker.group, x, y, marker.r);
  });
  ctx.globalAlpha = 1;
};

const storyFieldsDrawNames = (ctx, plan, reveal) => {
  const n = plan.labels.length;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  plan.labels.forEach((label, i) => {
    const alpha = storyFieldsOwn(reveal, i / Math.max(1, n - 1), 0.5) * (label.group === 3 ? 0.9 : 1);
    if (alpha <= 0) return;
    ctx.globalAlpha = alpha;
    if (label.leader) {
      ctx.beginPath();
      ctx.moveTo(label.leader[0], label.leader[1]);
      ctx.lineTo(label.leader[2], label.leader[3]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = STORY_COLORS.cream;
      ctx.stroke();
    }
    ctx.font = `italic ${label.group === 1 ? 600 : 400} ${label.size}px ${STORY_EARTH_FONT}`;
    ctx.fillStyle = STORY_FIELDS_LABEL[label.group];
    const x = label.box.x0 + 1.5;
    storyFieldsText(ctx, label.text, x, label.box.y0 + label.size);
    if (label.tag) {
      ctx.font = `italic 400 ${label.tagSize}px ${STORY_EARTH_FONT}`;
      storyFieldsText(ctx, label.tag, x, label.box.y0 + label.size * 1.3 + label.tagSize);
    }
  });
  ctx.globalAlpha = 1;
};

// The key and the attribution strip. They share one reveal.
const storyFieldsDrawKey = (ctx, plan, alpha) => {
  const { key, strip, rect } = plan;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = STORY_COLORS.ink;
  ctx.fillRect(strip.box.x0, strip.box.y0, strip.box.x1 - strip.box.x0, strip.box.y1 - strip.box.y0);
  ctx.font = `400 ${strip.size}px ${STORY_EARTH_FONT}`;
  ctx.fillStyle = STORY_COLORS.cream;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  strip.lines.forEach((line, i) => ctx.fillText(line, rect.x + 10, strip.box.y0 + 6 + strip.size + i * strip.lineHeight - 1));

  ctx.beginPath();
  storyEarthRoundRect(ctx, key.box.x0, key.box.y0, key.box.x1 - key.box.x0, key.box.y1 - key.box.y0, 6);
  ctx.fillStyle = STORY_COLORS.cream;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.stroke();
  ctx.font = `400 ${key.size}px ${STORY_EARTH_FONT}`;
  key.entries.forEach((entry, i) => {
    const y = key.box.y0 + 6 + key.rowHeight * (i + 0.5);
    const x = key.box.x0 + 14;
    if (entry.group === 4) {
      ctx.beginPath();
      ctx.arc(x, y, plan.st.dot + 0.8, 0, 2 * Math.PI);
      ctx.fillStyle = STORY_FIELDS_GREY;
      ctx.fill();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = STORY_COLORS.ink;
      ctx.stroke();
    } else {
      storyFieldsHead(ctx, entry.group, x, y, plan.st.head[entry.group] * 0.9);
    }
    ctx.fillStyle = STORY_COLORS.ink;
    ctx.textBaseline = 'middle';
    ctx.fillText(entry.text, x + 16, y + 0.5);
  });
  ctx.globalAlpha = 1;
};

// Draws all layers inside the clip of the map. reveal says how far each layer has come (see storyEarthFieldsCamera).
// The layers belong to the large map. The plan uses the place of the large map, so the camera must show the large map
// when a layer is on. The camera does so: the card has grown to the large map before the first layer comes in.
const storyFieldsLayers = (ctx, lens, layout, reveal, frame) => {
  storyFieldsLoad(frame);
  if (storyFieldsData.state !== 'ready') return;
  const plan = storyFieldsPlanFor(layout);
  if (reveal.ceased > 0) storyFieldsDrawCeased(ctx, plan, reveal.ceased);
  if (reveal.outlines > 0) storyFieldsDrawOutlines(ctx, plan, reveal.outlines);
  if (reveal.markers > 0) storyFieldsDrawMarkers(ctx, plan, reveal.markers);
  if (reveal.names > 0) storyFieldsDrawNames(ctx, plan, reveal.names);
  if (reveal.key > 0) storyFieldsDrawKey(ctx, plan, reveal.key);
};

STORY_RENDERERS.fields = {
  animated: false,
  draw(ctx, frame) {
    storyEarthLoad(frame);
    storyFieldsLoad(frame);
    const layout = storyEarthLayout(frame.width, frame.height, frame.reducedMotion);
    const camera = storyEarthFieldsCamera(frame.reducedMotion ? 1 : frame.local, layout);
    storyEarthFill(ctx, layout);
    storyEarthDrawLens(ctx, camera.lens, layout, 0, camera.size, storyEarthLayers(camera.lens, layout, camera.reveal, frame), camera.words);
  },
};

// ---- the list for screen readers and keyboard users
// The canvas text cannot be read by a screen reader. This list has the same facts as the map, with the source of each project.
// It is a details element: the summary is a button that opens and closes the list. It closes when the visitor leaves the stage.
const StoryFieldsList = ({ on }) => {
  const [data, setData] = useState(storyFieldsData.value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (storyFieldsData.value) { setData(storyFieldsData.value); return undefined; }
    storyFieldsWatchers.add(setData);
    storyFieldsLoad(null);
    return () => { storyFieldsWatchers.delete(setData); };
  }, []);
  useEffect(() => { if (!on) setOpen(false); }, [on]);

  // A control that the visitor cannot see must not take the focus.
  const tab = on ? undefined : -1;
  return (
    <details className="story-data story-fade" data-on={on} open={open} onToggle={event => setOpen(event.currentTarget.open)}>
      <summary tabIndex={tab}>Map data and sources</summary>
      {open && data && (
        <div className="story-data__panel">
          <p className="story-data__intro">
            The grey points are {data.ceased.length} gas fields that no longer produce, in the UK and the Netherlands.
          </p>
          {[1, 2, 3].map(id => {
            const group = data.groups.find(item => item.id === id);
            const items = data.projects.filter(project => project.group === id);
            return (
              <div key={id} className="story-data__group">
                <p className="story-data__head">{group.list}</p>
                <ul>
                  {items.map(project => (
                    <li key={project.id}>
                      <strong>{project.name}</strong> ({project.country}). {project.status}{' '}
                      <a href={project.source} target="_blank" rel="noopener noreferrer" tabIndex={tab}>
                        Source<span className="visually-hidden"> for {project.name} (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <p className="story-data__note">The blue marker on the map is the example site of this story. It is not a real project.</p>
          <p className="story-data__note">{data.attribution.nsta}</p>
          <p className="story-data__note">{data.attribution.nlog} {data.attribution.status}</p>
        </div>
      )}
    </details>
  );
};
