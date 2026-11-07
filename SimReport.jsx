// SimReport.jsx — the two-page screening report of the VE simulator.
// simReportHtml is pure: it turns a plain data object into one HTML document string.
// simOpenReport opens that string in a new window and prints it.
// The formatting helpers (simFormatMass and others) and the field tables come from SimulatorPage.jsx.

const SIM_REPORT_URL = 'https://saeedtelvari.github.io/simulator.html';

// The labels of the "Model edges and grid" group in the inputs rail.
const SIM_REPORT_GRIDS = { coarse: '500 m', standard: '250 m', fine: '167 m' };
const SIM_REPORT_EDGES = { open: 'Open', closed: 'Closed' };

const simReportEscape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

// Text with *italic* marks, as the reference list uses, becomes safe HTML.
const simReportEm = text => String(text).split('*').map((part, i) => (i % 2 ? `<em>${simReportEscape(part)}</em>` : simReportEscape(part))).join('');

const simReportValue = (value, meta) => {
  if (!Number.isFinite(Number(value))) return simReportEscape(value);
  const number = simFormatNumber(value, meta.digits ?? 0);
  return simReportEscape(meta.unit ? `${number} ${meta.unit}` : number);
};

const simReportStamp = date => {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const simReportBalance = row => {
  const balance = row.injected > 0 ? Math.abs(row.balance) / row.injected : 0;
  return balance < 1e-12 ? '< 10⁻¹²' : balance.toExponential(1);
};

const simReportCss = `
@page { size: A4 portrait; margin: 12mm 13mm 14mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; color: #15202b; background: #fff; font: 8.6pt/1.38 "Open Sans", "Segoe UI", Arial, sans-serif; }
h1 { margin: 0; font-size: 19pt; line-height: 1.15; }
h2 { margin: 11px 0 4px; padding-bottom: 2px; border-bottom: 1px solid #9aa7b4; font-size: 10.5pt; break-after: avoid; }
p { margin: 3px 0; }
small, .note { color: #4a5764; }
.lead { margin-top: 2px; font-size: 9.5pt; font-weight: 600; }
.meta { display: grid; grid-template-columns: auto 1fr; gap: 1px 10px; margin: 6px 0 0; }
.meta dt { color: #4a5764; }
.meta dd { margin: 0; overflow-wrap: anywhere; }
.caveat { margin-top: 8px; padding: 5px 8px; border-left: 3px solid #b26a00; background: #fbf4e6; }
.fields { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0 14px; margin: 0; }
.fields div { display: flex; justify-content: space-between; gap: 6px; padding: 1px 0; border-bottom: 1px dotted #c3ccd5; break-inside: avoid; }
.fields dt { color: #3a4754; }
.fields dd { margin: 0; font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; }
table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
th, td { padding: 1.5px 5px; border-bottom: 1px solid #d5dce3; text-align: right; }
th:first-child, td:first-child { text-align: left; }
thead th { border-bottom: 1px solid #6b7a88; color: #26323e; }
tr { break-inside: avoid; page-break-inside: avoid; }
.two { display: grid; grid-template-columns: 1.25fr 1fr; gap: 14px; align-items: start; }
.swatch { display: inline-block; width: 8px; height: 8px; margin-right: 5px; border-radius: 2px; }
.figures { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }
figure { margin: 0; break-inside: avoid; page-break-inside: avoid; }
figure img, figure svg { display: block; width: 100%; height: auto; border: 1px solid #c3ccd5; background: #fff; }
figcaption { margin-top: 2px; color: #4a5764; font-size: 7.8pt; }
ul.plain { margin: 2px 0; padding-left: 15px; }
ul.plain li { margin: 1px 0; break-inside: avoid; }
ul.refs { font-size: 7.6pt; line-height: 1.3; columns: 2; column-gap: 16px; }
ul.refs li { margin: 0 0 2px; }
.pagebreak { break-before: page; page-break-before: always; }
footer { margin-top: 10px; padding-top: 4px; border-top: 1px solid #9aa7b4; color: #4a5764; font-size: 7.8pt; }
`;

// The six inventory classes in Mt and %, the injected total and the mass balance error.
const simReportInventoryTable = (final, current, colors) => {
  const cell = (row, item) => (row ? `<td>${simReportEscape(simFormatMass(row[item.key]))}</td><td>${simReportEscape(simFormatPercent(row[item.key], row.injected))}</td>` : '<td>–</td><td>–</td>');
  const swatch = item => {
    const color = colors && /^#[0-9a-fA-F]{3,8}$|^rgba?\([\d\s.,%/]+\)$/.test(colors[item.key] || '') ? colors[item.key] : '#888888';
    return `<span class="swatch" style="background:${color}"></span>`;
  };
  const rows = SIM_INVENTORY.slice().reverse().map(item =>
    `<tr><td>${swatch(item)}${simReportEscape(item.label)}</td>${cell(final.row, item)}${cell(current.row, item)}</tr>`).join('');
  const total = row => (row ? `<td colspan="2">${simReportEscape(simFormatMass(row.injected))}</td>` : '<td colspan="2">–</td>');
  const balance = row => (row ? `<td colspan="2">${simReportEscape(simReportBalance(row))}</td>` : '<td colspan="2">–</td>');
  return `<table><thead><tr><th>Inventory class</th><th colspan="2">Final, year ${simReportEscape(Math.round(final.year))}</th><th colspan="2">Current, year ${simReportEscape(Math.round(current.year))}</th></tr>
<tr><th></th><th>Mt</th><th>%</th><th>Mt</th><th>%</th></tr></thead><tbody>${rows}
<tr><td><strong>Injected total</strong></td>${total(final.row)}${total(current.row)}</tr>
<tr><td>Mass balance error (relative)</td>${balance(final.row)}${balance(current.row)}</tr></tbody></table>`;
};

const simReportPlumeTable = (final, current) => {
  const items = [
    ['CO₂ footprint', 'km²', row => simFormatNumber(row.footprint / 1e6, 1)],
    ['Thickest column', 'm', row => simFormatNumber(row.maxColumn, 1)],
    ['Mobile plume reach', 'km from well', row => simFormatNumber(row.migration / 1000, 1)],
    ['Peak pressure rise at the well', 'bar', row => simFormatNumber(row.bhpPeak / 1e5, 1)]
  ];
  const rows = items.map(([label, unit, fn]) =>
    `<tr><td>${simReportEscape(label)} <small>(${simReportEscape(unit)})</small></td><td>${final.row ? simReportEscape(fn(final.row)) : '–'}</td><td>${current.row ? simReportEscape(fn(current.row)) : '–'}</td></tr>`).join('');
  return `<table><thead><tr><th>Plume and pressure</th><th>Final, year ${simReportEscape(Math.round(final.year))}</th><th>Current, year ${simReportEscape(Math.round(current.year))}</th></tr></thead><tbody>${rows}</tbody></table>`;
};

const simReportInputs = scenario => {
  const items = Object.keys(SIM_FIELDS).map(key => `<div><dt>${simReportEscape(SIM_FIELDS[key].label)}</dt><dd>${simReportValue(scenario[key], SIM_FIELDS[key])}</dd></div>`);
  items.push(`<div><dt>Grid cell size</dt><dd>${simReportEscape(SIM_REPORT_GRIDS[scenario.grid] || scenario.grid)}</dd></div>`);
  items.push(`<div><dt>Model edges</dt><dd>${simReportEscape(SIM_REPORT_EDGES[scenario.boundary] || scenario.boundary)}</dd></div>`);
  const faults = scenario.faults || [];
  const faultKeys = Object.keys(SIM_FAULT_FIELDS);
  const faultTable = faults.length
    ? `<table><thead><tr><th>Fault</th>${faults.map((_, i) => `<th>${i + 1}</th>`).join('')}</tr></thead><tbody>${faultKeys.map(key =>
      `<tr><td>${simReportEscape(SIM_FAULT_FIELDS[key].label)} <small>${simReportEscape(SIM_FAULT_FIELDS[key].unit)}</small></td>${faults.map(f => `<td>${simReportValue(f[key], { digits: SIM_FAULT_FIELDS[key].digits })}</td>`).join('')}</tr>`).join('')}</tbody></table>`
    : '<p class="note">No faults.</p>';
  return `<dl class="fields">${items.join('')}</dl><div style="margin-top:6px">${faultTable}</div>`;
};

const simReportUq = uq => {
  if (!uq || !uq.table || !uq.table.length) return '<p>No uncertainty run.</p>';
  const rows = uq.table.map(m => `<tr><td>${simReportEscape(m.label)}</td>${[m.p10, m.p50, m.p90].map(v => `<td>${simReportEscape(simFormatNumber(v, m.digits))} ${simReportEscape(m.unit)}</td>`).join('')}</tr>`).join('');
  return `<p class="note">${simReportEscape(uq.runs)} runs, outcomes at year ${simReportEscape(uq.years)}. P10, P50 and P90 are the 10th, 50th and 90th percentiles.</p>
<table><thead><tr><th>Outcome</th><th>P10</th><th>P50</th><th>P90</th></tr></thead><tbody>${rows}</tbody></table>`;
};

const simReportFigures = (data, current) => {
  const parts = [];
  const png = typeof data.mapPng === 'string' && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(data.mapPng) ? data.mapPng : null;
  const svg = typeof data.mapSvg === 'string' && data.mapSvg.startsWith('<svg') ? data.mapSvg : null;
  const chart = typeof data.chartSvg === 'string' && data.chartSvg.startsWith('<svg') ? data.chartSvg : null;
  if (png) parts.push(`<figure><img src="${png}" alt="Current model view"><figcaption>${simReportEscape(data.viewLabel || 'Current view')} at year ${simReportEscape(Math.round(current.year))}.</figcaption></figure>`);
  else if (svg) parts.push(`<figure>${svg}<figcaption>Section at year ${simReportEscape(Math.round(current.year))}.</figcaption></figure>`);
  if (chart) parts.push(`<figure>${chart}<figcaption>CO₂ inventory through time. The dashed line is the injected total.</figcaption></figure>`);
  return parts.length ? `<div class="figures">${parts.join('')}</div>` : '<p class="note">No figure is available for this view.</p>';
};

const simReportHtml = data => {
  const final = { year: data.finalYear, row: data.finalRow };
  const current = { year: data.currentYear, row: data.currentRow };
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>VE screening report</title>
<style>${simReportCss}</style></head><body>
<header>
<h1>VE screening report</h1>
<p class="lead">Educational model. Not a substitute for a field study.</p>
<dl class="meta">
<dt>Date and time</dt><dd>${simReportEscape(simReportStamp(data.generatedAt))}</dd>
<dt>Scenario</dt><dd>${simReportEscape(data.scenarioName)}</dd>
<dt>Share link</dt><dd>${simReportEscape(data.shareUrl)}</dd>
</dl>
</header>
<p class="caveat">${simReportEscape(SIM_CAVEAT_TEXT)}</p>
<h2>Inputs</h2>
${simReportInputs(data.scenario)}
<h2>Results</h2>
<div class="two">
<div>${simReportInventoryTable(final, current, data.classColors)}</div>
<div>${simReportPlumeTable(final, current)}</div>
</div>
<h2>Figures</h2>
${simReportFigures(data, current)}
<h2>Uncertainty</h2>
${simReportUq(data.uq)}
<h2>Limitations</h2>
<ul class="plain">${SIM_LIMITATIONS.map(text => `<li>${simReportEscape(text)}</li>`).join('')}</ul>
<h2>References</h2>
<ul class="plain refs">${SIM_REFERENCES.map((text, i) => `<li>${simReportEm(text)}${SIM_REFERENCE_DOIS[i] ? ` doi:${simReportEscape(SIM_REFERENCE_DOIS[i])}` : ''}</li>`).join('')}</ul>
<footer>Made with the VE simulator, <a href="${SIM_REPORT_URL}">${SIM_REPORT_URL}</a></footer>
</body></html>`;
};

// Copy an SVG from the page with its computed colours written into the attributes.
// The copy then prints without the page CSS. Dark ink replaces the page ink for paper.
const simReportInlineSvg = svg => {
  if (!svg) return null;
  const clone = svg.cloneNode(true);
  const sources = [svg, ...svg.querySelectorAll('*')];
  const targets = [clone, ...clone.querySelectorAll('*')];
  const props = ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'opacity', 'fill-opacity', 'font-size', 'font-family', 'font-weight'];
  const drop = [];
  sources.forEach((source, i) => {
    const target = targets[i];
    const style = window.getComputedStyle(source);
    const cls = source.getAttribute('class') || '';
    const tag = source.tagName.toLowerCase();
    for (const prop of props) target.setAttribute(prop, style.getPropertyValue(prop));
    if (tag === 'text') target.setAttribute('fill', '#3a4754');
    if (cls.includes('sim-chart__grid')) target.setAttribute('stroke', '#d5dce3');
    if (cls.includes('sim-chart__axis')) target.setAttribute('stroke', '#7b8896');
    if (cls.includes('sim-chart__injected')) target.setAttribute('stroke', '#15202b');
    if (tag === 'path' && !cls) target.setAttribute('stroke', '#ffffff');
    if (cls.includes('sim-chart__cursor') || source.getAttribute('stroke-dasharray') === '2 2') drop.push(target);
    target.removeAttribute('class');
    target.removeAttribute('style');
  });
  drop.forEach(node => node.remove());
  const box = svg.viewBox && svg.viewBox.baseVal;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  if (box && box.width) { clone.setAttribute('width', box.width); clone.setAttribute('height', box.height); }
  clone.removeAttribute('role');
  clone.removeAttribute('aria-label');
  return new XMLSerializer().serializeToString(clone);
};

// Show the report in the same tab when the browser blocks the new window.
const simReportOverlay = html => {
  const wrap = document.createElement('div');
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-label', 'Screening report');
  wrap.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;background:#e9edf1;';
  const bar = document.createElement('div');
  bar.style.cssText = 'display:flex;gap:8px;align-items:center;padding:8px 12px;background:#15202b;color:#fff;font:14px sans-serif;';
  const note = document.createElement('span');
  note.setAttribute('role', 'status');
  note.style.flex = '1';
  const message = 'Your browser blocked the pop-up, so the report is shown here. Choose Print, then Save as PDF.';
  const print = document.createElement('button');
  print.type = 'button';
  print.textContent = 'Print';
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Close';
  bar.append(note, print, close);
  const frame = document.createElement('iframe');
  frame.title = 'Screening report';
  frame.style.cssText = 'flex:1;border:0;background:#fff;width:100%;max-width:900px;margin:0 auto;';
  frame.srcdoc = html;
  wrap.append(bar, frame);
  document.body.appendChild(wrap);
  print.addEventListener('click', () => { frame.contentWindow.focus(); frame.contentWindow.print(); });
  close.addEventListener('click', () => wrap.remove());
  wrap.addEventListener('keydown', event => { if (event.key === 'Escape') wrap.remove(); });
  print.focus();
  // The text is set after the overlay is in the page, so a screen reader announces it.
  setTimeout(() => { note.textContent = message; }, 50);
};

// Open the report in a new window and print it after the images load.
const simOpenReport = html => {
  let win = null;
  try { win = window.open('', '_blank'); } catch (_) { win = null; }
  if (!win) { simReportOverlay(html); return 'overlay'; }
  win.document.open();
  win.document.write(html);
  win.document.close();
  const images = Array.from(win.document.images);
  const ready = Promise.all(images.map(img => (img.complete ? Promise.resolve() : new Promise(resolve => { img.onload = img.onerror = resolve; }))));
  Promise.race([ready, new Promise(resolve => setTimeout(resolve, 2000))]).then(() => { win.focus(); win.print(); });
  return 'window';
};
