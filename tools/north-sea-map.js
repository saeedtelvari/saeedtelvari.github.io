'use strict';
// north-sea-map.js: build assets/north-sea-ccs.json for the stage "fields" of the homepage story.
//
// Run it with:  node tools/north-sea-map.js
//
// The script reads the table of projects in tools/north-sea-projects.json.
// It asks two public map services, and no other service:
//   - NSTA (UK): the layer "UKCS offshore hydrocarbon fields (WGS84)" on ArcGIS.
//   - NLOG (NL): the WFS layer nlog:gdw_ng_field_utm.
// Norway and Denmark have no query. Their markers come from the table only.
// The script asks for the field name, the field code, the status and the shape. It never asks for an operator column.
//
// The file has these parts:
//   ceased    One grey point for each gas field that no longer produces (UK and NL), as [lon, lat].
//   outlines  The simplified shapes of the fields of each project (UK and NL), as rings of [lon, lat].
//   projects  One marker for each project: name, country, group, status, year, lat, lon, source.
// Coordinates have 3 decimals. The file must stay under 40 KB.

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const INPUT = path.join(root, 'tools', 'north-sea-projects.json');
const OUTPUT = path.join(root, 'assets', 'north-sea-ccs.json');

const NSTA_LAYER = 'https://services-eu1.arcgis.com/OZMfUznmLTnWccBc/arcgis/rest/services/Offshore_hydrocarbon_fields_(WGS84)/FeatureServer/0';
const NLOG_WFS = 'https://www.gdngeoservices.nl/geoserver/nlog/ows';

// The area of the map: west, south, east, north in degrees. The script drops all points outside it.
const BOUNDS = [-5.5, 50.8, 9.5, 61.5];
// A shape point closer than this to its line is dropped (degrees, about 500 m).
const TOLERANCE = 0.005;
const MAX_BYTES = 40000;

const ATTRIBUTION = {
  nsta: 'Contains information provided by the North Sea Transition Authority and/or other third parties.',
  nlog: 'Source: NLOG.NL.',
};

const round = value => Math.round(value * 1000) / 1000;
const inside = (lon, lat) => lon >= BOUNDS[0] && lon <= BOUNDS[2] && lat >= BOUNDS[1] && lat <= BOUNDS[3];

const get = async (url, params) => {
  const response = await fetch(`${url}?${new URLSearchParams(params)}`, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
  const body = await response.json();
  if (body.error) throw new Error(`Error from ${url}: ${JSON.stringify(body.error)}`);
  return body;
};

// The Ramer-Douglas-Peucker line simplifier, for the NLOG shapes. The NSTA service simplifies by itself.
// A closed ring has the same first and last point, so the ring is split at the point that is farthest from the start.
const simplify = (points, tolerance) => {
  if (points.length < 3) return points;
  const closed = points[0][0] === points[points.length - 1][0] && points[0][1] === points[points.length - 1][1];
  if (closed) {
    let split = 1;
    let most = -1;
    points.forEach(([x, y], i) => {
      const distance = Math.hypot(x - points[0][0], y - points[0][1]);
      if (distance > most) { most = distance; split = i; }
    });
    const head = simplify(points.slice(0, split + 1), tolerance);
    const tail = simplify(points.slice(split), tolerance);
    return head.concat(tail.slice(1));
  }
  const keep = new Array(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    const [ax, ay] = points[first];
    const [bx, by] = points[last];
    const length = Math.hypot(bx - ax, by - ay) || 1e-12;
    let far = -1;
    let most = tolerance;
    for (let i = first + 1; i < last; i += 1) {
      const distance = Math.abs((bx - ax) * (ay - points[i][1]) - (ax - points[i][0]) * (by - ay)) / length;
      if (distance > most) { most = distance; far = i; }
    }
    if (far >= 0) {
      keep[far] = true;
      stack.push([first, far], [far, last]);
    }
  }
  return points.filter((point, i) => keep[i]);
};

// A ring with 3 decimals and no repeated point. A ring with fewer than 4 points (closed) gives null.
const tidy = ring => {
  const out = [];
  ring.forEach(([lon, lat]) => {
    const point = [round(lon), round(lat)];
    const last = out[out.length - 1];
    if (!last || last[0] !== point[0] || last[1] !== point[1]) out.push(point);
  });
  if (out.length > 1 && (out[0][0] !== out[out.length - 1][0] || out[0][1] !== out[out.length - 1][1])) out.push(out[0].slice());
  return out.length >= 4 ? out : null;
};

// The outer rings of a GeoJSON polygon or multipolygon.
const outerRings = geometry => {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return [geometry.coordinates[0]];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.map(polygon => polygon[0]);
  return [];
};

const boxCentre = rings => {
  let [w, s, e, n] = [Infinity, Infinity, -Infinity, -Infinity];
  rings.forEach(ring => ring.forEach(([lon, lat]) => { w = Math.min(w, lon); e = Math.max(e, lon); s = Math.min(s, lat); n = Math.max(n, lat); }));
  return [(w + e) / 2, (s + n) / 2];
};

const quote = text => `'${String(text).replace(/'/g, "''")}'`;

// ---- the UK: NSTA
const queryNsta = async projectNames => {
  // Gas and condensate fields with the status "production ceased" (899, 900) or "post-COP" (1000).
  const ceased = await get(`${NSTA_LAYER}/query`, {
    where: "FIELDTYPE IN ('GAS','COND') AND STAT_CODE IN ('899','900','1000')",
    returnGeometry: 'false', returnCentroid: 'true', outSR: '4326', outFields: 'FIELDNAME', f: 'json',
  });
  const points = ceased.features
    .filter(feature => feature.centroid && !projectNames.has(feature.attributes.FIELDNAME))
    .map(feature => [feature.centroid.x, feature.centroid.y]);
  const outlines = {};
  if (projectNames.size) {
    const shapes = await get(`${NSTA_LAYER}/query`, {
      where: `FIELDNAME IN (${[...projectNames].map(quote).join(',')})`,
      outFields: 'FIELDNAME', outSR: '4326', maxAllowableOffset: String(TOLERANCE), geometryPrecision: '3', f: 'geojson',
    });
    shapes.features.forEach(feature => {
      outlines[feature.properties.FIELDNAME] = outerRings(feature.geometry);
    });
  }
  return { records: ceased.features.length, points, outlines };
};

// ---- the Netherlands: NLOG
const queryNlog = async projectCodes => {
  const ask = filter => get(NLOG_WFS, {
    service: 'WFS', version: '2.0.0', request: 'GetFeature', typeNames: 'nlog:gdw_ng_field_utm',
    outputFormat: 'application/json', srsName: 'EPSG:4326', propertyName: 'FIELD_CODE,GEOMETRY', CQL_FILTER: filter,
  });
  // Gas fields in the sea with the status "Production ceased" (U) or "Abandoned" (A).
  const ceased = await ask("LANDSEA='Sea' AND HYDROCARBON_MINERAL='Gas' AND STATUS IN ('U','A')");
  const points = ceased.features
    .filter(feature => !projectCodes.has(feature.properties.FIELD_CODE))
    .map(feature => boxCentre(outerRings(feature.geometry)));
  const outlines = {};
  if (projectCodes.size) {
    const shapes = await ask(`FIELD_CODE IN (${[...projectCodes].map(quote).join(',')})`);
    shapes.features.forEach(feature => {
      outlines[feature.properties.FIELD_CODE] = outerRings(feature.geometry).map(ring => simplify(ring, TOLERANCE));
    });
  }
  return { records: ceased.features.length, points, outlines };
};

// ---- the file
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;

const formatFile = file => {
  const rows = items => items.map((item, i) => `    ${JSON.stringify(item)}${i < items.length - 1 ? ',' : ''}`).join('\n');
  const chunks = [];
  for (let i = 0; i < file.ceased.length; i += 10) chunks.push(file.ceased.slice(i, i + 10));
  const ceased = chunks.map((chunk, i) => `    ${chunk.map(point => JSON.stringify(point)).join(',')}${i < chunks.length - 1 ? ',' : ''}`).join('\n');
  return `{
  "builtOn": ${JSON.stringify(file.builtOn)},
  "bounds": ${JSON.stringify(file.bounds)},
  "attribution": ${JSON.stringify(file.attribution)},
  "groups": [
${rows(file.groups)}
  ],
  "queried": [
${rows(file.queried)}
  ],
  "ceased": [
${ceased}
  ],
  "outlines": [
${rows(file.outlines)}
  ],
  "projects": [
${rows(file.projects)}
  ]
}
`;
};

const main = async () => {
  const table = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
  const nstaNames = new Set();
  const nlogCodes = new Set();
  table.projects.forEach(project => {
    ((project.outlines || {}).nsta || []).forEach(name => nstaNames.add(name));
    ((project.outlines || {}).nlog || []).forEach(code => nlogCodes.add(code));
  });

  console.log('Asking NSTA (UK) ...');
  const uk = await queryNsta(nstaNames);
  console.log(`  ${uk.records} ceased gas fields, ${Object.keys(uk.outlines).length} of ${nstaNames.size} project outlines`);
  console.log('Asking NLOG (NL) ...');
  const nl = await queryNlog(nlogCodes);
  console.log(`  ${nl.records} ceased gas fields, ${Object.keys(nl.outlines).length} of ${nlogCodes.size} project outlines`);

  const seen = new Set();
  const ceased = [...uk.points, ...nl.points]
    .map(([lon, lat]) => [round(lon), round(lat)])
    .filter(([lon, lat]) => inside(lon, lat))
    .filter(([lon, lat]) => { const key = `${lon},${lat}`; if (seen.has(key)) return false; seen.add(key); return true; })
    .sort((a, b) => b[1] - a[1] || a[0] - b[0]);

  const outlines = [];
  const projects = table.projects.map(project => {
    const lat = round(mean(project.points.map(point => point[0])));
    const lon = round(mean(project.points.map(point => point[1])));
    if (!inside(lon, lat)) throw new Error(`The project ${project.id} is outside the map.`);
    const rings = [];
    const found = [];
    [[project.outlines && project.outlines.nsta, uk.outlines], [project.outlines && project.outlines.nlog, nl.outlines]].forEach(([names, source]) => {
      (names || []).forEach(name => {
        if (!source[name]) { console.warn(`  No outline for ${name} (${project.id}).`); return; }
        found.push(...source[name]);
        source[name].map(tidy).filter(Boolean).forEach(ring => rings.push(ring));
      });
    });
    if (found.length) {
      const [clon, clat] = boxCentre(found);
      const gap = Math.hypot(clon - lon, clat - lat);
      if (gap > 0.25) console.warn(`  The marker of ${project.id} is ${gap.toFixed(2)} degrees from its outlines. Check the table.`);
    }
    if (rings.length) outlines.push({ project: project.id, rings });
    const item = { id: project.id, name: project.name, short: project.short };
    if (project.tag) item.tag = project.tag;
    return Object.assign(item, {
      country: project.country, group: project.group, status: project.status, year: project.year, lat, lon, source: project.source,
    });
  });

  const file = {
    builtOn: new Date().toISOString().slice(0, 10),
    bounds: BOUNDS,
    attribution: { nsta: ATTRIBUTION.nsta, nlog: ATTRIBUTION.nlog, status: `Project status from public sources, ${table.statusDate}.` },
    groups: table.groups,
    queried: [
      { service: 'NSTA UKCS offshore hydrocarbon fields (WGS84)', url: NSTA_LAYER, records: uk.records },
      { service: 'NLOG nlog:gdw_ng_field_utm', url: NLOG_WFS, records: nl.records },
    ],
    ceased,
    outlines,
    projects,
  };
  const text = formatFile(file);
  const bytes = Buffer.byteLength(text, 'utf8');
  if (bytes > MAX_BYTES) throw new Error(`The file has ${bytes} bytes. The limit is ${MAX_BYTES}. Raise TOLERANCE or drop shapes.`);
  fs.writeFileSync(OUTPUT, text, 'utf8');

  const count = group => projects.filter(project => project.group === group).length;
  console.log(`Wrote ${path.relative(root, OUTPUT)}: ${bytes} bytes.`);
  console.log(`  ${ceased.length} ceased gas fields (UK ${uk.points.length}, NL ${nl.points.length} before the area filter), ${outlines.length} projects with outlines.`);
  console.log(`  ${projects.length} projects: ${count(1)} in depleted gas fields, ${count(2)} pilots and studies, ${count(3)} in saline aquifers.`);
};

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
