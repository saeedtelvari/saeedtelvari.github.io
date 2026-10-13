// SimViews.jsx — the three synchronised views of one VE run: structure map (canvas),
// 3D block diagram (WebGL, sim-block3d.js) and vertical section (SVG), plus legend, layer
// menu, readout and the data-driven motion layer (flow particles, injection pulse, leak beacons).

const SIM_CAPROCK_DRAWN = 40;

const simParseColor = color => {
  const text = String(color).trim();
  if (text.startsWith('#')) {
    const hex = text.length === 4 ? text.slice(1).split('').map(c => c + c).join('') : text.slice(1, 7);
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  }
  const match = text.match(/rgba?\(([^)]+)\)/);
  if (match) return match[1].split(',').slice(0, 3).map(v => parseFloat(v));
  return [128, 128, 128];
};

const simMixRgb = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const simRgba = (rgb, alpha = 1) => `rgba(${Math.round(rgb[0])},${Math.round(rgb[1])},${Math.round(rgb[2])},${alpha})`;

// Single-hue indigo ramp, 0 = shallow (light) to 1 = deep (dark), identical in every view.
const simDepthColor = (stops, t) => {
  const x = Math.max(0, Math.min(1, t)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  return simMixRgb(stops[i], stops[i + 1], x - i);
};

const simUseSize = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const element = ref.current?.parentElement;
    if (!element) return undefined;
    const update = () => setSize({ width: element.clientWidth, height: element.clientHeight });
    update();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null;
    observer?.observe(element);
    window.addEventListener('resize', update);
    return () => { observer?.disconnect(); window.removeEventListener('resize', update); };
  }, []);
  return [ref, size];
};

const simPrepareCanvas = (canvas, width, height) => {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
};

// Join marching-squares segments into polylines (for smooth strokes and labels).
const simChainSegments = segments => {
  const key = (x, y) => `${Math.round(x * 1e4)},${Math.round(y * 1e4)}`;
  const ends = new Map();
  const count = segments.length / 4;
  const used = new Uint8Array(count);
  for (let s = 0; s < count; s++) {
    for (const end of [0, 1]) {
      const k = key(segments[4 * s + 2 * end], segments[4 * s + 2 * end + 1]);
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k).push(s);
    }
  }
  const lines = [];
  for (let s = 0; s < count; s++) {
    if (used[s]) continue;
    used[s] = 1;
    const points = [segments[4 * s], segments[4 * s + 1], segments[4 * s + 2], segments[4 * s + 3]];
    for (const forward of [true, false]) {
      for (;;) {
        const x = forward ? points[points.length - 2] : points[0];
        const y = forward ? points[points.length - 1] : points[1];
        const next = (ends.get(key(x, y)) || []).find(t => !used[t]);
        if (next === undefined) break;
        used[next] = 1;
        const a = [segments[4 * next], segments[4 * next + 1]];
        const b = [segments[4 * next + 2], segments[4 * next + 3]];
        const sameA = key(a[0], a[1]) === key(x, y);
        const other = sameA ? b : a;
        if (forward) points.push(other[0], other[1]); else points.unshift(other[0], other[1]);
      }
    }
    lines.push(points);
  }
  return lines;
};

const simContourInterval = span => {
  for (const step of [2, 5, 10, 20, 25, 50, 100]) if (span / step <= 14) return step;
  return 200;
};

// Hanging-wall side of a fault (to the right of strike), as in the engine.
const simFaultNormal = fault => {
  const strike = fault.strike * Math.PI / 180;
  return [Math.cos(strike), -Math.sin(strike)];
};

// Fault-aware bilinear sampling of a cell field: neighbours across a fault are ignored,
// so a sealing fault keeps a sharp edge instead of smearing the plume across it.
const simSampleField = (model, values, x, y) => {
  const { nx, ny, dx, dy, faultLines } = model;
  const fx = x / dx - 0.5;
  const fy = y / dy - 0.5;
  const i0 = Math.max(0, Math.min(nx - 1, Math.floor(fx)));
  const j0 = Math.max(0, Math.min(ny - 1, Math.floor(fy)));
  const tx = Math.max(0, Math.min(1, fx - i0));
  const ty = Math.max(0, Math.min(1, fy - j0));
  let sum = 0;
  let weight = 0;
  for (const [di, dj, w] of [[0, 0, (1 - tx) * (1 - ty)], [1, 0, tx * (1 - ty)], [0, 1, (1 - tx) * ty], [1, 1, tx * ty]]) {
    const i = Math.min(nx - 1, i0 + di);
    const j = Math.min(ny - 1, j0 + dj);
    if (w <= 0) continue;
    const cx = (i + 0.5) * dx;
    const cy = (j + 0.5) * dy;
    const crosses = faultLines.some(([ax, ay, bx, by]) => {
      const d1 = (bx - ax) * (y - ay) - (by - ay) * (x - ax);
      const d2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
      const d3 = (cx - x) * (ay - y) - (cy - y) * (ax - x);
      const d4 = (cx - x) * (by - y) - (cy - y) * (bx - x);
      return d1 * d2 < 0 && d3 * d4 < 0;
    });
    if (crosses) continue;
    sum += values[j * nx + i] * w;
    weight += w;
  }
  if (weight > 0) return sum / weight;
  const i = Math.max(0, Math.min(nx - 1, Math.round(fx)));
  const j = Math.max(0, Math.min(ny - 1, Math.round(fy)));
  return values[j * nx + i];
};

// ---------------------------------------------------------------- legend & layers

const SimLegend = ({ view, layers, model }) => {
  const hasFaults = model.faults.length > 0;
  const hasLeakyFault = model.faults.some(fault => fault.kf > 0);
  const hasTraps = model.traps.some(trap => trap.size >= 4);
  const items = [
    { label: 'Free plume', swatch: 'var(--sim-glow-free)' },
    { label: 'Structurally trapped', swatch: 'var(--sim-glow-structural)' },
    { label: 'Residually trapped', swatch: 'var(--sim-c-residual)', kind: 'hatch' }
  ];
  if (view === 'section' || layers.dissolved) items.push({ label: 'Dissolved', swatch: 'var(--sim-c-dissolved)' });
  if (view !== 'section') {
    if (hasLeakyFault) items.push({ label: 'Leaking fault', swatch: 'var(--sim-glow-leaked)', kind: 'line' });
    if (hasFaults) items.push({ label: view === '3d' ? 'Fault scarp' : 'Fault (ticks on downthrown side)', swatch: 'var(--sim-ink)', kind: 'line' });
    if (layers.traps && hasTraps) items.push({ label: 'Structural trap', swatch: 'var(--sim-glow-structural)', kind: view === 'map' ? 'dash' : 'line' });
    if (layers.pressure && view === '3d') items.push({ label: 'Pressure build-up contours', swatch: 'var(--sim-accent)', kind: 'line' });
  }
  return (
    <div className="sim-legend" role="list" aria-label="Legend">
      {items.map(item => (
        <div className="sim-legend__item" role="listitem" key={item.label}>
          <span className={`sim-swatch${item.kind ? ` sim-swatch--${item.kind}` : ''}`} style={{ '--swatch': item.swatch }} aria-hidden="true" />
          {item.label}
        </div>
      ))}
    </div>
  );
};

const SimLayersMenu = ({ layers, onChange, view }) => {
  const options = [
    ['contours', 'Depth contours'],
    ['traps', 'Structural traps'],
    ['residual', 'Residual CO₂'],
    ['dissolved', 'Dissolved CO₂'],
    ['pressure', 'Pressure build-up'],
    ['flow', 'Flow animation']
  ].filter(([key]) => view === 'map' || (view === '3d' ? key !== 'flow' : !['contours', 'pressure', 'flow', 'traps'].includes(key)));
  return (
    <details className="sim-menu sim-layers">
      <summary className="sim-button"><i className="fas fa-layer-group" aria-hidden="true" /> Layers</summary>
      <div className="sim-menu__panel">
        {options.map(([key, label]) => (
          <label key={key}><input type="checkbox" checked={!!layers[key]} onChange={event => onChange({ ...layers, [key]: event.target.checked })} /> {label}</label>
        ))}
      </div>
    </details>
  );
};

// ---------------------------------------------------------------- readout

// Cell values under the pointer, shared by the map and the 3D view.
const simReadoutAt = (model, frame, x, y) => {
  const i = Math.max(0, Math.min(model.nx - 1, Math.floor(x / model.dx)));
  const j = Math.max(0, Math.min(model.ny - 1, Math.floor(y / model.dy)));
  const c = j * model.nx + i;
  return { x, y, depth: model.zt[c], h: frame.h[c], residual: (frame.hMax[c] - frame.h[c]) * model.sgr / (1 - model.swr), md: frame.md[c], p: frame.p[c] };
};

const SimReadout = ({ readout, size }) => (
  <div className="sim-readout" style={{ left: Math.min(readout.px + 16, size.width - 200), top: Math.min(readout.py + 16, size.height - 150) }}>
    <dl>
      <dt>Position</dt><dd>{(readout.x / 1000).toFixed(1)}, {(readout.y / 1000).toFixed(1)} km</dd>
      <dt>Top of aquifer</dt><dd>{simFormatNumber(readout.depth)} m</dd>
      <dt>Mobile CO₂ column</dt><dd>{readout.h.toFixed(1)} m</dd>
      <dt>Residual CO₂</dt><dd>{readout.residual.toFixed(2)} m</dd>
      <dt>Dissolved</dt><dd>{simFormatNumber(readout.md)} kg/m²</dd>
      <dt>Pressure build-up</dt><dd>{(readout.p / 1e5).toFixed(2)} bar</dd>
    </dl>
  </div>
);

// ---------------------------------------------------------------- map

const simMapLayout = (model, width, height) => {
  // Narrow screens wrap the legend onto more rows, so leave more room below the map.
  const margin = { left: 46, right: 26, top: 58, bottom: width < 560 ? 104 : 62 };
  const scale = Math.max(0.0001, Math.min((width - margin.left - margin.right) / model.Lx, (height - margin.top - margin.bottom) / model.Ly));
  const w = model.Lx * scale;
  const h = model.Ly * scale;
  const ox = margin.left + (width - margin.left - margin.right - w) / 2;
  const oy = margin.top + (height - margin.top - margin.bottom - h) / 2;
  return { scale, ox, oy, w, h, sx: x => ox + x * scale, sy: y => oy + (model.Ly - y) * scale, wx: px => (px - ox) / scale, wy: py => model.Ly - (py - oy) / scale };
};

// Static, per-model layers: hillshaded depth raster, contour lines, trap outlines.
const simMapStatics = (model, palette) => {
  const { nx, ny, zt, dx, dy } = model;
  let min = Infinity;
  let max = -Infinity;
  for (const z of zt) { if (z < min) min = z; if (z > max) max = z; }
  const stops = palette.depth.map(simParseColor);
  const raster = document.createElement('canvas');
  raster.width = nx;
  raster.height = ny;
  const image = raster.getContext('2d').createImageData(nx, ny);
  const exaggeration = 30;
  const light = [-0.5, 0.5, 0.707];
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const c = j * nx + i;
      const zx = (zt[j * nx + Math.min(nx - 1, i + 1)] - zt[j * nx + Math.max(0, i - 1)]) / (dx * ((i > 0 && i < nx - 1) ? 2 : 1));
      const zy = (zt[Math.min(ny - 1, j + 1) * nx + i] - zt[Math.max(0, j - 1) * nx + i]) / (dy * ((j > 0 && j < ny - 1) ? 2 : 1));
      // Surface elevation is -depth, so its gradient is (-zx, -zy).
      const n = [zx * exaggeration, zy * exaggeration, 1];
      const length = Math.hypot(n[0], n[1], n[2]);
      const shade = Math.max(0, (n[0] * light[0] + n[1] * light[1] + n[2] * light[2]) / length);
      const rgb = simDepthColor(stops, (zt[c] - min) / (max - min || 1));
      const k = 0.62 + 0.5 * shade;
      const p = 4 * ((ny - 1 - j) * nx + i);
      image.data[p] = Math.min(255, rgb[0] * k);
      image.data[p + 1] = Math.min(255, rgb[1] * k);
      image.data[p + 2] = Math.min(255, rgb[2] * k);
      image.data[p + 3] = 255;
    }
  }
  raster.getContext('2d').putImageData(image, 0, 0);

  const interval = simContourInterval(max - min);
  const contours = [];
  for (let level = Math.ceil(min / interval) * interval; level < max; level += interval) {
    contours.push({ level, lines: simChainSegments(VE2D.contourSegments(zt, nx, ny, level)), major: level % (interval * 5) === 0 });
  }
  const mask = new Float32Array(nx * ny);
  const bigTraps = new Set(model.traps.filter(t => t.size >= 4 && t.capacity * model.rhoG > 0.02e9).map(t => t.id));
  for (let c = 0; c < nx * ny; c++) mask[c] = bigTraps.has(model.trapId[c]) ? 1 : 0;
  const trapLines = simChainSegments(VE2D.contourSegments(mask, nx, ny, 0.5));
  const spills = model.traps.filter(t => bigTraps.has(t.id) && t.spillCell >= 0).map(t => t.spillCell);
  return { raster, contours, trapLines, spills, min, max, interval };
};

const simDrawPolyline = (ctx, points, toX, toY) => {
  ctx.beginPath();
  for (let k = 0; k < points.length; k += 2) {
    const x = toX(points[k]);
    const y = toY(points[k + 1]);
    if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
};

const SimMapView = ({ model, frame, palette, layers, reducedMotion, line, onLine, onWell, year, playing }) => {
  const [sizeRef, size] = simUseSize();
  const canvasRef = useRef(null);
  const motionRef = useRef(null);
  const [readout, setReadout] = useState(null);
  const [drag, setDrag] = useState(null);
  const statics = useMemo(() => simMapStatics(model, palette), [model, palette]);
  const plumeCanvas = useMemo(() => document.createElement('canvas'), []);
  const hatchCanvas = useMemo(() => document.createElement('canvas'), []);
  const layout = useMemo(() => size.width ? simMapLayout(model, size.width, size.height) : null, [model, size]);
  const toX = i => layout.sx((i + 0.5) * model.dx);
  const toY = j => layout.sy((j + 0.5) * model.dy);

  useEffect(() => {
    if (!layout || !frame) return;
    const ctx = simPrepareCanvas(canvasRef.current, size.width, size.height);
    const { nx, ny, H, zt, zSpill } = model;
    ctx.clearRect(0, 0, size.width, size.height);
    ctx.fillStyle = palette.stage;
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(statics.raster, layout.ox, layout.oy, layout.w, layout.h);

    ctx.save();
    ctx.beginPath();
    ctx.rect(layout.ox, layout.oy, layout.w, layout.h);
    ctx.clip();

    if (layers.contours) {
      ctx.strokeStyle = palette.contour;
      for (const contour of statics.contours) {
        ctx.lineWidth = contour.major ? 1.2 : 0.6;
        for (const points of contour.lines) { simDrawPolyline(ctx, points, toX, toY); ctx.stroke(); }
      }
      ctx.font = `11px ${palette.mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const contour of statics.contours.filter(c => c.major || statics.contours.length < 8)) {
        // Dark text on the light (shallow) end of the ramp, light text on the dark end.
        const light = (contour.level - statics.min) / (statics.max - statics.min || 1) < 0.45;
        for (const points of contour.lines) {
          if (points.length < 24) continue;
          const k = 2 * Math.floor(points.length / 4);
          const x = toX(points[k]);
          const y = toY(points[k + 1]);
          ctx.lineWidth = 3;
          ctx.strokeStyle = light ? palette.depth[1] : palette.depth[5];
          ctx.strokeText(String(contour.level), x, y);
          ctx.fillStyle = light ? palette.depth[6] : palette.depth[0];
          ctx.fillText(String(contour.level), x, y);
        }
      }
    }

    // Field rasters at cell resolution, upscaled smoothly.
    plumeCanvas.width = nx;
    plumeCanvas.height = ny;
    const pctx = plumeCanvas.getContext('2d');
    const image = pctx.createImageData(nx, ny);
    const free = simParseColor(palette.glowFree);
    const structural = simParseColor(palette.glowStructural);
    const residual = simParseColor(palette.glowResidual);
    const dissolved = simParseColor(palette.glowDissolved);
    const reference = Math.max(4, 0.5 * H);
    const residualImage = pctx.createImageData(nx, ny);
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const c = j * nx + i;
        const p = 4 * ((ny - 1 - j) * nx + i);
        const h = frame.h[c];
        if (layers.dissolved && frame.md[c] > 0) {
          const a = Math.min(0.75, frame.md[c] / model.disCapacity);
          image.data[p] = dissolved[0]; image.data[p + 1] = dissolved[1]; image.data[p + 2] = dissolved[2]; image.data[p + 3] = 255 * a;
        }
        const zone = frame.hMax[c] - h;
        if (layers.residual && zone > 0.05) {
          residualImage.data[p] = residual[0]; residualImage.data[p + 1] = residual[1]; residualImage.data[p + 2] = residual[2];
          residualImage.data[p + 3] = 255 * Math.min(0.85, 0.3 + zone / reference);
        }
        if (h > 0.05) {
          const closure = Math.max(0, zSpill[c] - zt[c]);
          const rgb = simMixRgb(free, structural, Math.min(h, closure) / h);
          const alpha = 0.35 + 0.65 * Math.min(1, Math.sqrt(h / reference));
          image.data[p] = rgb[0]; image.data[p + 1] = rgb[1]; image.data[p + 2] = rgb[2]; image.data[p + 3] = 255 * alpha;
        }
      }
    }
    if (layers.residual) {
      pctx.putImageData(residualImage, 0, 0);
      hatchCanvas.width = Math.max(1, Math.round(layout.w));
      hatchCanvas.height = Math.max(1, Math.round(layout.h));
      const hctx = hatchCanvas.getContext('2d');
      hctx.imageSmoothingEnabled = true;
      hctx.drawImage(plumeCanvas, 0, 0, hatchCanvas.width, hatchCanvas.height);
      hctx.globalCompositeOperation = 'source-in';
      hctx.strokeStyle = palette.glowResidual;
      hctx.lineWidth = 1.4;
      hctx.beginPath();
      for (let d = -hatchCanvas.height; d < hatchCanvas.width; d += 6) { hctx.moveTo(d, hatchCanvas.height); hctx.lineTo(d + hatchCanvas.height, 0); }
      hctx.stroke();
      hctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(hatchCanvas, layout.ox, layout.oy, layout.w, layout.h);
    }
    pctx.putImageData(image, 0, 0);
    ctx.drawImage(plumeCanvas, layout.ox, layout.oy, layout.w, layout.h);

    // Crisp plume edge at a 0.5 m column.
    ctx.strokeStyle = palette.glowFree;
    ctx.lineWidth = 1.5;
    for (const points of simChainSegments(VE2D.contourSegments(frame.h, nx, ny, 0.5))) { simDrawPolyline(ctx, points, toX, toY); ctx.stroke(); }

    if (layers.traps) {
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = palette.glowStructural;
      ctx.lineWidth = 1.4;
      for (const points of statics.trapLines) { simDrawPolyline(ctx, points, toX, toY); ctx.stroke(); }
      ctx.setLineDash([]);
      for (const cell of statics.spills) {
        const x = toX(cell % nx);
        const y = toY(Math.floor(cell / nx));
        ctx.fillStyle = palette.glowStructural;
        ctx.beginPath();
        ctx.moveTo(x, y - 5); ctx.lineTo(x + 5, y); ctx.lineTo(x, y + 5); ctx.lineTo(x - 5, y); ctx.closePath();
        ctx.fill();
      }
    }

    if (layers.pressure) {
      let pMax = 0;
      for (const v of frame.p) if (v > pMax) pMax = v;
      if (pMax > 0.2e5) {
        const step = simNiceStep(pMax / 1e5, 5);
        ctx.strokeStyle = palette.accent;
        ctx.fillStyle = palette.accent;
        ctx.lineWidth = 1;
        ctx.font = `11px ${palette.mono}`;
        for (let level = step; level < pMax / 1e5; level += step) {
          const lines = simChainSegments(VE2D.contourSegments(frame.p, nx, ny, level * 1e5));
          for (const points of lines) {
            simDrawPolyline(ctx, points, toX, toY);
            ctx.stroke();
            if (points.length > 30) ctx.fillText(`${+level.toPrecision(3)} bar`, toX(points[0]) + 4, toY(points[1]) - 4);
          }
        }
      }
    }
    ctx.restore();

    // Faults with ticks on the downthrown (hanging-wall) side.
    model.faults.forEach((fault, index) => {
      const [x0, y0, x1, y1] = model.faultLines[index];
      const sealing = fault.trans === 0 || fault.throw >= model.H;
      const leaking = frame.leaking?.[index];
      ctx.save();
      ctx.lineCap = 'round';
      if (leaking) {
        ctx.strokeStyle = palette.glowLeaked;
        ctx.lineWidth = 6;
        ctx.globalAlpha = 0.35;
        ctx.beginPath(); ctx.moveTo(layout.sx(x0), layout.sy(y0)); ctx.lineTo(layout.sx(x1), layout.sy(y1)); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = leaking ? palette.glowLeaked : palette.ink;
      ctx.lineWidth = 2.2;
      ctx.setLineDash(sealing ? [] : [9, 5]);
      ctx.beginPath(); ctx.moveTo(layout.sx(x0), layout.sy(y0)); ctx.lineTo(layout.sx(x1), layout.sy(y1)); ctx.stroke();
      ctx.setLineDash([]);
      const [nxv, nyv] = simFaultNormal(fault);
      const length = Math.hypot(x1 - x0, y1 - y0);
      const spacing = Math.max(300, 26 / layout.scale);
      ctx.lineWidth = 1.6;
      for (let s = spacing / 2; s < length; s += spacing) {
        const px = x0 + (x1 - x0) * s / length;
        const py = y0 + (y1 - y0) * s / length;
        ctx.beginPath();
        ctx.moveTo(layout.sx(px), layout.sy(py));
        ctx.lineTo(layout.sx(px) + nxv * 6, layout.sy(py) - nyv * 6);
        ctx.stroke();
      }
      const top = y1 > y0 ? [x1, y1] : [x0, y0];
      ctx.fillStyle = leaking ? palette.glowLeaked : palette.ink;
      ctx.font = `600 12px ${palette.font}`;
      ctx.textAlign = 'center';
      ctx.fillText(`F${index + 1}`, layout.sx(top[0]), layout.sy(top[1]) - 8);
      ctx.restore();
    });

    // Section line A–A′.
    if (line) {
      ctx.save();
      ctx.strokeStyle = palette.ink;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(layout.sx(line.x0), layout.sy(line.y0)); ctx.lineTo(layout.sx(line.x1), layout.sy(line.y1)); ctx.stroke();
      ctx.setLineDash([]);
      [[line.x0, line.y0, 'A'], [line.x1, line.y1, 'A′']].forEach(([x, y, label]) => {
        ctx.fillStyle = palette.surface;
        ctx.strokeStyle = palette.ink;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(layout.sx(x), layout.sy(y), 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = palette.ink;
        ctx.font = `700 10px ${palette.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, layout.sx(x), layout.sy(y) + 0.5);
      });
      ctx.restore();
    }

    // Injector symbol.
    const wellX = drag?.kind === 'well' ? drag.x : model.wellX;
    const wellY = drag?.kind === 'well' ? drag.y : model.wellY;
    ctx.save();
    ctx.fillStyle = palette.surface;
    ctx.strokeStyle = palette.ink;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(layout.sx(wellX), layout.sy(wellY), 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = palette.ink;
    ctx.beginPath(); ctx.arc(layout.sx(wellX), layout.sy(wellY), 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `700 12px ${palette.font}`;
    ctx.textAlign = 'left';
    ctx.lineWidth = 3;
    ctx.strokeStyle = palette.stage;
    ctx.strokeText('INJ-1', layout.sx(wellX) + 11, layout.sy(wellY) - 9);
    ctx.fillText('INJ-1', layout.sx(wellX) + 11, layout.sy(wellY) - 9);
    if (reducedMotion && year < model.injYears) {
      ctx.strokeStyle = palette.glowFree;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(layout.sx(wellX), layout.sy(wellY), 14, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();

    // Frame, kilometre ticks, scale bar and north arrow.
    ctx.save();
    ctx.strokeStyle = palette.rule;
    ctx.lineWidth = 1;
    ctx.strokeRect(layout.ox, layout.oy, layout.w, layout.h);
    ctx.fillStyle = palette.inkFaint;
    ctx.font = `11px ${palette.mono}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let km = 0; km <= model.Lx / 1000; km += 2) ctx.fillText(String(km), layout.sx(km * 1000), layout.oy + layout.h + 6);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let km = 0; km <= model.Ly / 1000; km += 2) ctx.fillText(String(km), layout.ox - 6, layout.sy(km * 1000));
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('km', layout.ox + layout.w + 12, layout.oy + layout.h + 6);
    const bar = 5000 * layout.scale;
    const bx = layout.ox + 14;
    const by = layout.oy + layout.h - 16;
    ctx.fillStyle = palette.ink;
    ctx.fillRect(bx, by, bar, 3);
    ctx.font = `600 11px ${palette.font}`;
    ctx.textBaseline = 'bottom';
    ctx.fillText('5 km', bx, by - 3);
    const ax = layout.ox + layout.w - 20;
    const ay = layout.oy + layout.h - 44;
    ctx.beginPath(); ctx.moveTo(ax, ay - 12); ctx.lineTo(ax + 6, ay + 6); ctx.lineTo(ax, ay + 2); ctx.lineTo(ax - 6, ay + 6); ctx.closePath(); ctx.fill();
    ctx.textAlign = 'center';
    ctx.fillText('N', ax, ay - 14);
    ctx.restore();
  }, [layout, frame, statics, layers, line, drag, palette, reducedMotion, year < model.injYears]);

  // Motion layer: flow particles along the CO2 flux, injection pulse, leak beacons.
  // The field is refreshed per frame; the particles persist across frames.
  const field = useRef(null);
  useEffect(() => {
    if (!frame) return;
    const { nx, ny, dx, dy, phi, swr } = model;
    const velocity = new Float32Array(2 * nx * ny);
    const cells = [];
    let total = 0;
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const c = j * nx + i;
        const h = frame.h[c];
        if (h < 0.3) continue;
        const area = Math.max(0.5, h) * phi * (1 - swr);
        velocity[2 * c] = 0.5 * (frame.fx[j * (nx + 1) + i] + frame.fx[j * (nx + 1) + i + 1]) / (dy * area);
        velocity[2 * c + 1] = 0.5 * (frame.fy[j * nx + i] + frame.fy[(j + 1) * nx + i]) / (dx * area);
        cells.push(c);
        total += h;
      }
    }
    field.current = {
      frame, velocity, cells, total,
      injecting: year < model.injYears,
      leakCells: model.leakCells.filter(cell => frame.h[cell.cell] > model.faults[cell.fault].sealCap),
      playing
    };
  }, [frame, model, playing]);

  useEffect(() => {
    if (!layout || reducedMotion) {
      if (motionRef.current && size.width) simPrepareCanvas(motionRef.current, size.width, size.height).clearRect(0, 0, size.width, size.height);
      return undefined;
    }
    const ctx = simPrepareCanvas(motionRef.current, size.width, size.height);
    const { nx, ny, dx, dy } = model;
    const spawn = particle => {
      const f = field.current;
      if (!f || !f.cells.length) { particle.dead = true; return particle; }
      let r = Math.random() * f.total;
      let c = f.cells[0];
      for (const cell of f.cells) { r -= f.frame.h[cell]; if (r <= 0) { c = cell; break; } }
      particle.x = ((c % nx) + Math.random()) * dx;
      particle.y = (Math.floor(c / nx) + Math.random()) * dy;
      particle.life = 0.6 + Math.random() * 2.2;
      particle.age = 0;
      particle.dead = false;
      return particle;
    };
    const particles = Array.from({ length: 900 }, () => spawn({}));
    let last = performance.now();
    let id;
    const draw = now => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const f = field.current;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      ctx.fillRect(0, 0, size.width, size.height);
      ctx.globalCompositeOperation = 'source-over';
      if (f && layers.flow && f.cells.length) {
        const active = Math.min(particles.length, Math.round(f.cells.length * 1.2));
        const yearsPerSecond = SIM_SPEEDS[0] * (f.playing ? 1.4 : 1);
        ctx.strokeStyle = palette.glowFree;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let k = 0; k < active; k++) {
          const particle = particles[k];
          if (particle.dead) { spawn(particle); continue; }
          const i = Math.floor(particle.x / dx);
          const j = Math.floor(particle.y / dy);
          const c = j * nx + i;
          particle.age += dt;
          if (i < 0 || j < 0 || i >= nx || j >= ny || f.frame.h[c] < 0.3 || particle.age > particle.life) { spawn(particle); continue; }
          let stepX = f.velocity[2 * c] * yearsPerSecond * VE2D.YEAR * dt;
          let stepY = f.velocity[2 * c + 1] * yearsPerSecond * VE2D.YEAR * dt;
          const px = Math.hypot(stepX, stepY) * layout.scale;
          if (px > 2.5) { stepX *= 2.5 / px; stepY *= 2.5 / px; }
          if (px < 0.15) { particle.age += dt * 2; continue; }
          ctx.moveTo(layout.sx(particle.x), layout.sy(particle.y));
          particle.x += stepX;
          particle.y += stepY;
          ctx.lineTo(layout.sx(particle.x), layout.sy(particle.y));
        }
        ctx.stroke();
      }
      if (f && f.injecting) {
        const phase = (now / 1600) % 1;
        ctx.strokeStyle = palette.glowFree;
        ctx.globalAlpha = 1 - phase;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(layout.sx(model.wellX), layout.sy(model.wellY), 9 + phase * 22, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (f && f.leakCells.length) {
        const pulse = 0.5 + 0.5 * Math.sin(now / 260);
        ctx.fillStyle = palette.glowLeaked;
        for (const cell of f.leakCells) {
          ctx.globalAlpha = 0.25 + 0.5 * pulse;
          ctx.beginPath();
          ctx.arc(layout.sx(((cell.cell % nx) + 0.5) * dx), layout.sy((Math.floor(cell.cell / nx) + 0.5) * dy), 2.5 + 2.5 * pulse, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      id = requestAnimationFrame(draw);
    };
    id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [layout, layers.flow, reducedMotion, palette, model]);

  const hit = event => {
    const rect = canvasRef.current.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    return { px, py, x: layout.wx(px), y: layout.wy(py) };
  };
  const near = (a, x, y) => Math.hypot(layout.sx(x) - a.px, layout.sy(y) - a.py) < 14;
  const clampX = x => Math.max(0, Math.min(model.Lx, x));
  const clampY = y => Math.max(0, Math.min(model.Ly, y));
  const onPointerDown = event => {
    if (!layout) return;
    const a = hit(event);
    let kind = null;
    if (near(a, model.wellX, model.wellY)) kind = 'well';
    else if (line && near(a, line.x0, line.y0)) kind = 'a';
    else if (line && near(a, line.x1, line.y1)) kind = 'b';
    if (!kind) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ kind, x: a.x, y: a.y });
  };
  const onPointerMove = event => {
    if (!layout) return;
    const a = hit(event);
    if (drag) {
      const x = clampX(a.x);
      const y = clampY(a.y);
      if (drag.kind === 'well') setDrag({ kind: 'well', x, y });
      else onLine(drag.kind === 'a' ? { ...line, x0: x, y0: y } : { ...line, x1: x, y1: y });
      return;
    }
    if (a.x < 0 || a.y < 0 || a.x > model.Lx || a.y > model.Ly || !frame) { setReadout(null); return; }
    setReadout({ px: a.px, py: a.py, ...simReadoutAt(model, frame, a.x, a.y) });
  };
  const onPointerUp = () => {
    if (drag?.kind === 'well') onWell(+(drag.x / 1000).toFixed(1), +(drag.y / 1000).toFixed(1));
    setDrag(null);
  };
  const cursor = drag ? 'grabbing' : 'crosshair';
  return (
    <>
      <canvas ref={el => { canvasRef.current = el; sizeRef.current = el; }} data-export="map" className="sim-view__fade" role="img" tabIndex={0}
        aria-label={`Structure map at year ${Math.round(year)}: depth to the top of the aquifer with the CO₂ plume, faults and the injector. Drag the injector or the section ends A and A′.`}
        style={{ cursor }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={() => { setReadout(null); }} />
      <canvas ref={motionRef} aria-hidden="true" style={{ pointerEvents: 'none' }} />
      {readout && !drag && <SimReadout readout={readout} size={size} />}
    </>
  );
};

// ---------------------------------------------------------------- 3D block diagram

const SIM_CAMERA = { azimuth: -0.55, elevation: 0.62, zoom: 1, panX: 0, panY: 0 };

const simUnitRgb = color => simParseColor(color).map(v => v / 255);

// Free space around the block: view switcher and controls above, legend below.
const simBlockViewport = size => ({ width: size.width, height: size.height, top: 100, bottom: size.width < 560 ? 104 : 62, side: 16 });

// Labels, distance ticks, north arrow and depth key over the WebGL canvas.
const simDrawBlockOverlay = (ctx, { cam, box, model, geometry, depthAt, wellDepth, palette, size, viewport, leaking }) => {
  ctx.clearRect(0, 0, size.width, size.height);
  const at = (x, y, depth, lift = 0) => {
    const p = SimBlock3D.toDisplay(box, x, y, depth);
    return SimBlock3D.project(cam, p[0], p[1], p[2] + lift);
  };
  const halo = (text, x, y, color, font, align = 'center') => {
    ctx.font = font;
    ctx.textAlign = align;
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = palette.stage;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  };
  const floor = size.height - viewport.bottom + 4;

  // Kilometre ticks along the foot of the walls that face the camera.
  const { Lx, Ly } = model;
  const edges = [
    { normal: [0, -1], points: [0, 5, 10, 15, 20].map(km => [km * 1000, 0]) },
    { normal: [0, 1], points: [0, 5, 10, 15, 20].map(km => [km * 1000, Ly]) },
    { normal: [-1, 0], points: [0, 4, 8, 12].map(km => [0, km * 1000]) },
    { normal: [1, 0], points: [0, 4, 8, 12].map(km => [Lx, km * 1000]) }
  ];
  ctx.textBaseline = 'middle';
  const placed = [];
  for (const edge of edges) {
    const mid = edge.points[Math.floor(edge.points.length / 2)];
    const toEye = [cam.eye[0] - (mid[0] - Lx / 2), cam.eye[1] - (mid[1] - Ly / 2)];
    if (toEye[0] * edge.normal[0] + toEye[1] * edge.normal[1] <= 0) continue;
    edge.points.forEach(([x, y], k) => {
      const depth = depthAt(x, y) + model.H + geometry.base;
      const p = at(x, y, depth);
      const q = at(x + 600 * edge.normal[0], y + 600 * edge.normal[1], depth);
      if (!p || !q) return;
      const length = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
      const d = [(q[0] - p[0]) / length, (q[1] - p[1]) / length];
      const tx = p[0] + d[0] * 15;
      const ty = p[1] + d[1] * 15;
      const along = (edge.normal[0] ? y : x) / 1000;
      const text = k === edge.points.length - 1 ? `${along} km` : String(along);
      ctx.font = `11px ${palette.mono}`;
      ctx.textAlign = d[0] > 0.5 ? 'left' : d[0] < -0.5 ? 'right' : 'center';
      const width = ctx.measureText(text).width;
      const left = ctx.textAlign === 'left' ? tx : ctx.textAlign === 'right' ? tx - width : tx - width / 2;
      if (ty > floor || left < 4 || left + width > size.width - 4 || placed.some(([u, v]) => Math.hypot(u - tx, v - ty) < 26)) return;
      placed.push([tx, ty]);
      ctx.strokeStyle = palette.inkFaint;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] + d[0] * 6, p[1] + d[1] * 6); ctx.stroke();
      ctx.fillStyle = palette.inkFaint;
      ctx.fillText(text, tx, ty);
    });
  }

  // Injector name at the head of the stem, then fault names at the northern tip (as on
  // the map) or, if that would collide with another label, at the southern tip.
  ctx.textBaseline = 'bottom';
  const taken = [];
  const clear = (x, y, width) => !taken.some(([u, v, w]) => Math.abs(u - x) < (w + width) / 2 + 4 && Math.abs(v - y) < 16);
  const head = at(model.wellX, model.wellY, wellDepth, box.stem);
  if (head) {
    halo('INJ-1', head[0], head[1] - 8, palette.ink, `700 12px ${palette.font}`);
    taken.push([head[0], head[1] - 8, 40]);
  }
  model.faults.forEach((fault, index) => {
    const [x0, y0, x1, y1] = model.faultLines[index];
    const tips = [y1 >= y0 ? [x1, y1, x0, y0] : [x0, y0, x1, y1], y1 >= y0 ? [x0, y0, x1, y1] : [x1, y1, x0, y0]].map(([ax, ay, bx, by]) => {
      for (let s = 0; s <= 40; s++) {
        const x = ax + (bx - ax) * s / 40;
        const y = ay + (by - ay) * s / 40;
        if (x >= 0 && y >= 0 && x <= Lx && y <= Ly) return at(x, y, depthAt(x, y));
      }
      return null;
    }).filter(Boolean);
    const p = tips.find(tip => clear(tip[0], tip[1] - 8, 20)) || tips[0];
    if (!p) return;
    halo(`F${index + 1}`, p[0], p[1] - 8, leaking[index] ? palette.glowLeaked : palette.ink, `600 12px ${palette.font}`);
    taken.push([p[0], p[1] - 8, 20]);
  });

  // North arrow, turned with the camera.
  const centre = SimBlock3D.project(cam, cam.target[0], cam.target[1], cam.target[2]);
  const north = SimBlock3D.project(cam, cam.target[0], cam.target[1] + 1000, cam.target[2]);
  if (centre && north) {
    const angle = Math.atan2(north[0] - centre[0], centre[1] - north[1]);
    const ax = 30;
    const ay = floor - 10;
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(angle);
    ctx.fillStyle = palette.ink;
    ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(6, 7); ctx.lineTo(0, 3); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.font = `600 11px ${palette.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = palette.ink;
    ctx.fillText('N', ax + 19 * Math.sin(angle), ay - 19 * Math.cos(angle));
  }

  // Depth key for the colour of the surface.
  const keyX = 16;
  const keyY = 66;
  const keyWidth = size.width < 560 ? 88 : 112;
  const gradient = ctx.createLinearGradient(keyX, 0, keyX + keyWidth, 0);
  palette.depth.forEach((color, i) => gradient.addColorStop(i / (palette.depth.length - 1), color));
  ctx.fillStyle = gradient;
  ctx.fillRect(keyX, keyY + 14, keyWidth, 6);
  ctx.font = `11px ${palette.font}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = palette.inkMuted;
  ctx.fillText('Top of aquifer', keyX, keyY + 9);
  ctx.font = `11px ${palette.mono}`;
  ctx.fillStyle = palette.inkFaint;
  ctx.fillText(simFormatNumber(geometry.zMin), keyX, keyY + 34);
  ctx.textAlign = 'right';
  ctx.fillText(`${simFormatNumber(geometry.zMax)} m`, keyX + keyWidth, keyY + 34);
};

const SimBlockView = ({ model, frame, palette, layers, reducedMotion, year, scenario }) => {
  const [sizeRef, size] = simUseSize();
  const glRef = useRef(null);
  const overlayRef = useRef(null);
  const renderer = useRef(null);
  const [generation, setGeneration] = useState(0);
  const [supported, setSupported] = useState(true);
  const [camera, setCamera] = useState(SIM_CAMERA);
  const [exaggeration, setExaggeration] = useState(25);
  const [readout, setReadout] = useState(null);
  const pointers = useRef(new Map());
  const velocity = useRef({ azimuth: 0, elevation: 0 });
  const animation = useRef(0);

  const depthAt = useMemo(() => VE2D.depthField(scenario), [scenario]);
  const geometry = useMemo(() => SimBlock3D.buildGeometry(model, depthAt), [model, depthAt]);
  const wellDepth = useMemo(() => depthAt(model.wellX, model.wellY), [model, depthAt]);
  const box = useMemo(() => SimBlock3D.sceneBox(geometry, model, exaggeration, wellDepth), [geometry, model, exaggeration, wellDepth]);
  const viewport = simBlockViewport(size);
  const colors = useMemo(() => ({
    stage: simUnitRgb(palette.stage),
    ramp: palette.depth.map(simUnitRgb),
    free: simUnitRgb(palette.glowFree),
    structural: simUnitRgb(palette.glowStructural),
    residual: simUnitRgb(palette.glowResidual),
    dissolved: simUnitRgb(palette.glowDissolved),
    leak: simUnitRgb(palette.glowLeaked),
    ink: simUnitRgb(palette.ink),
    contourInk: simUnitRgb(palette.contour),
    accent: simUnitRgb(palette.accent),
    aquifer: simUnitRgb(palette.rockAquifer),
    base: simUnitRgb(palette.rockBase)
  }), [palette]);
  const injecting = year < model.injYears;
  const leaking = model.faults.map((_, i) => !!frame?.leaking?.[i]);

  // One WebGL context per mount; rebuilt if the browser drops it.
  useEffect(() => {
    const canvas = glRef.current;
    const start = () => {
      try { renderer.current = SimBlock3D.createRenderer(canvas); } catch (error) { console.error(error); renderer.current = null; }
      setSupported(!!renderer.current);
      setGeneration(g => g + 1);
    };
    const lost = event => { event.preventDefault(); renderer.current = null; };
    canvas.addEventListener('webglcontextlost', lost);
    canvas.addEventListener('webglcontextrestored', start);
    start();
    return () => {
      canvas.removeEventListener('webglcontextlost', lost);
      canvas.removeEventListener('webglcontextrestored', start);
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, []);
  useEffect(() => {
    if (!renderer.current) return;
    renderer.current.setGeometry(geometry, model);
    renderer.current.setStatic(SimBlock3D.packStatic(model));
  }, [geometry, model, generation]);
  useEffect(() => {
    if (renderer.current && frame) renderer.current.setFrame(SimBlock3D.packFrame(model, frame));
  }, [frame, model, geometry, generation]);

  const draw = time => {
    const canvas = glRef.current;
    if (!renderer.current || !size.width || !frame || !canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const pixelWidth = Math.round(size.width * dpr);
    const pixelHeight = Math.round(size.height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) { canvas.width = pixelWidth; canvas.height = pixelHeight; }
    const cam = SimBlock3D.cameraFor(camera, box, viewport);
    let pressure = 0;
    if (layers.pressure) {
      let pMax = 0;
      for (const v of frame.p) if (v > pMax) pMax = v;
      if (pMax > 0.2e5) pressure = simNiceStep(pMax / 1e5, 5);
    }
    renderer.current.render({
      cam, box, colors, layers, time, pixelWidth, pixelHeight, pressure,
      hatch: Math.max(120, 6.5 * cam.distance / cam.focal),
      traces: model.faultLines,
      depthRange: [geometry.zMin, geometry.zMax],
      interval: layers.contours ? simContourInterval(geometry.zMax - geometry.zMin) : 0,
      refH: Math.max(4, 0.5 * model.H),
      H: model.H,
      well: { x: model.wellX, y: model.wellY, top: wellDepth - box.stem / exaggeration, bottom: wellDepth + model.H, radius: 0.004 * Math.max(model.Lx, model.Ly), injecting },
      leaking
    });
    simDrawBlockOverlay(simPrepareCanvas(overlayRef.current, size.width, size.height), { cam, box, model, geometry, depthAt, wellDepth, palette, size, viewport, leaking });
  };
  const drawRef = useRef(draw);
  drawRef.current = draw;
  useEffect(() => { draw(reducedMotion ? -1 : performance.now() / 1000); },
    [size, frame, camera, box, colors, layers, geometry, generation, injecting, reducedMotion, leaking.join()]);

  // Motion only while it carries data: the injection pulse and leaking faults.
  const animate = supported && !reducedMotion && (injecting || leaking.some(Boolean));
  useEffect(() => {
    if (!animate) return undefined;
    let id = 0;
    const loop = now => { drawRef.current(now / 1000); id = requestAnimationFrame(loop); };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [animate]);

  const clampCamera = c => ({
    azimuth: ((c.azimuth + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI,
    elevation: Math.max(0.12, Math.min(1.45, c.elevation)),
    zoom: Math.max(0.6, Math.min(4, c.zoom)),
    panX: Math.max(-model.Lx / 2, Math.min(model.Lx / 2, c.panX)),
    panY: Math.max(-model.Ly / 2, Math.min(model.Ly / 2, c.panY))
  });
  // Slide the target so the ground follows the pointer.
  const panBy = (c, dx, dy) => {
    const cam = SimBlock3D.cameraFor(c, box, viewport);
    const across = cam.distance / cam.focal;
    const along = across / Math.max(0.35, Math.sin(c.elevation));
    const sa = Math.sin(c.azimuth);
    const ca = Math.cos(c.azimuth);
    return clampCamera({ ...c, panX: c.panX - dx * across * ca + dy * along * sa, panY: c.panY + dx * across * sa + dy * along * ca });
  };

  // Inertial orbit after a drag (skipped for reduced motion).
  const startInertia = () => {
    if (reducedMotion) return;
    cancelAnimationFrame(animation.current);
    const step = () => {
      const v = velocity.current;
      if (Math.abs(v.azimuth) < 0.0005 && Math.abs(v.elevation) < 0.0005) return;
      setCamera(c => clampCamera({ ...c, azimuth: c.azimuth + v.azimuth, elevation: c.elevation + v.elevation }));
      v.azimuth *= 0.92;
      v.elevation *= 0.92;
      animation.current = requestAnimationFrame(step);
    };
    animation.current = requestAnimationFrame(step);
  };
  const resetView = () => {
    cancelAnimationFrame(animation.current);
    velocity.current = { azimuth: 0, elevation: 0 };
    if (reducedMotion) { setCamera(SIM_CAMERA); return; }
    const from = camera;
    const turn = ((SIM_CAMERA.azimuth - from.azimuth + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
    const start = performance.now();
    const ease = t => 1 - (1 - t) ** 3;
    const step = now => {
      const t = Math.min(1, (now - start) / 420);
      const k = ease(t);
      setCamera(clampCamera(Object.fromEntries(Object.keys(SIM_CAMERA).map(key =>
        [key, key === 'azimuth' ? from.azimuth + turn * k : from[key] + (SIM_CAMERA[key] - from[key]) * k]))));
      if (t < 1) animation.current = requestAnimationFrame(step);
    };
    animation.current = requestAnimationFrame(step);
  };
  useEffect(() => () => cancelAnimationFrame(animation.current), []);

  const pointAt = event => {
    const rect = glRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const hover = event => {
    if (!frame) return;
    const p = pointAt(event);
    const hit = SimBlock3D.pick(SimBlock3D.cameraFor(camera, box, viewport), box, depthAt, p.x, p.y);
    setReadout(hit ? { px: p.x, py: p.y, ...simReadoutAt(model, frame, hit.x, hit.y) } : null);
  };
  const onPointerDown = event => {
    cancelAnimationFrame(animation.current);
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY, pan: event.button === 2 || event.shiftKey });
    setReadout(null);
  };
  const onPointerMove = event => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) { if (event.pointerType === 'mouse') hover(event); return; }
    const dx = event.clientX - previous.x;
    const dy = event.clientY - previous.y;
    if (pointers.current.size === 2) {
      // Pinch to zoom, move both fingers to pan.
      const other = [...pointers.current.entries()].find(([id]) => id !== event.pointerId)[1];
      const before = Math.hypot(previous.x - other.x, previous.y - other.y);
      const after = Math.hypot(event.clientX - other.x, event.clientY - other.y);
      setCamera(c => panBy(clampCamera({ ...c, zoom: before > 0 ? c.zoom * after / before : c.zoom }), dx / 2, dy / 2));
    } else if (previous.pan) {
      setCamera(c => panBy(c, dx, dy));
    } else {
      velocity.current = { azimuth: dx * 0.008, elevation: dy * 0.006 };
      setCamera(c => clampCamera({ ...c, azimuth: c.azimuth + dx * 0.008, elevation: c.elevation + dy * 0.006 }));
    }
    pointers.current.set(event.pointerId, { ...previous, x: event.clientX, y: event.clientY });
  };
  const onPointerUp = event => {
    const previous = pointers.current.get(event.pointerId);
    pointers.current.delete(event.pointerId);
    if (!pointers.current.size && previous && !previous.pan) startInertia();
  };
  const onWheel = event => setCamera(c => clampCamera({ ...c, zoom: c.zoom * (event.deltaY > 0 ? 0.92 : 1.08) }));
  const onKeyDown = event => {
    const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      setCamera(c => event.shiftKey ? panBy(c, -move[0] * 40, -move[1] * 40) : clampCamera({ ...c, azimuth: c.azimuth + move[0] * 0.12, elevation: c.elevation + move[1] * 0.08 }));
    }
    if (event.key === '+' || event.key === '=') setCamera(c => clampCamera({ ...c, zoom: c.zoom * 1.1 }));
    if (event.key === '-') setCamera(c => clampCamera({ ...c, zoom: c.zoom / 1.1 }));
    if (event.key === '0') resetView();
  };
  // Export the picture with its labels.
  const composite = () => {
    const out = document.createElement('canvas');
    out.width = glRef.current.width;
    out.height = glRef.current.height;
    const ctx = out.getContext('2d');
    ctx.drawImage(glRef.current, 0, 0);
    ctx.drawImage(overlayRef.current, 0, 0, out.width, out.height);
    return out;
  };

  return (
    <>
      <canvas ref={el => { glRef.current = el; sizeRef.current = el; if (el) el.simComposite = composite; }} data-export="3d" className="sim-view__fade" tabIndex={0} role="img"
        aria-label={`3D block diagram at year ${Math.round(year)}: top of the aquifer with the caprock removed, ${exaggeration}× vertical exaggeration; the side walls and fault scarps show the CO₂ column in section. Drag or use the arrow keys to orbit, Shift-drag, right-drag or Shift-arrow keys to pan, scroll or press plus and minus to zoom, press 0 to reset.`}
        style={{ cursor: 'grab' }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        onPointerLeave={() => setReadout(null)} onContextMenu={event => event.preventDefault()} onWheel={onWheel} onDoubleClick={resetView} onKeyDown={onKeyDown} />
      <canvas ref={overlayRef} aria-hidden="true" style={{ pointerEvents: 'none' }} />
      {!supported && <div className="sim-view-note" style={{ top: '45%', bottom: 'auto', left: 0, right: 0, textAlign: 'center' }}>This browser does not provide WebGL 2, which the 3D view needs. The map and the section show the same run.</div>}
      {readout && <SimReadout readout={readout} size={size} />}
      <div className="sim-view-controls">
        <label htmlFor="sim-exaggeration" title="Vertical exaggeration"><span className="sim-view-controls__long">Vertical exaggeration </span>{exaggeration}×</label>
        <input id="sim-exaggeration" className="sim-range" type="range" min={5} max={80} step={1} value={exaggeration} aria-label="Vertical exaggeration" aria-valuetext={`${exaggeration} times`} onChange={event => setExaggeration(Number(event.target.value))} />
        <button type="button" className="sim-button" onClick={resetView}>Reset view</button>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- section

const SimSectionView = ({ model, frame, palette, scenario, line, layers, reducedMotion, year }) => {
  const [sizeRef, size] = simUseSize();
  const data = useMemo(() => {
    if (!line || !frame) return null;
    const depthAt = VE2D.depthField(scenario);
    const samples = 360;
    const length = Math.hypot(line.x1 - line.x0, line.y1 - line.y0) || 1;
    const points = [];
    for (let s = 0; s <= samples; s++) {
      const t = s / samples;
      const x = Math.max(1, Math.min(model.Lx - 1, line.x0 + (line.x1 - line.x0) * t));
      const y = Math.max(1, Math.min(model.Ly - 1, line.y0 + (line.y1 - line.y0) * t));
      const zt = depthAt(x, y);
      const spill = simSampleField(model, model.zSpill, x, y);
      points.push({
        d: t * length, x, y, zt,
        h: Math.max(0, simSampleField(model, frame.h, x, y)),
        hMax: Math.max(0, simSampleField(model, frame.hMax, x, y)),
        md: Math.max(0, simSampleField(model, frame.md, x, y)),
        closure: Number.isFinite(spill) ? Math.max(0, spill - simSampleField(model, model.zt, x, y)) : model.H
      });
    }
    const crossings = [];
    model.faultLines.forEach(([ax, ay, bx, by], index) => {
      const rx = line.x1 - line.x0; const ry = line.y1 - line.y0; const sx = bx - ax; const sy = by - ay;
      const den = rx * sy - ry * sx;
      if (Math.abs(den) < 1e-9) return;
      const u = ((ax - line.x0) * sy - (ay - line.y0) * sx) / den;
      const v = ((ax - line.x0) * ry - (ay - line.y0) * rx) / den;
      if (u >= 0 && u <= 1 && v >= 0 && v <= 1) crossings.push({ index, d: u * length, x: line.x0 + rx * u, y: line.y0 + ry * u });
    });
    // Distance from the well to the line, and where the well projects onto it.
    const wx = model.wellX - line.x0; const wy = model.wellY - line.y0;
    const along = (wx * (line.x1 - line.x0) + wy * (line.y1 - line.y0)) / length;
    const offset = Math.abs(wx * (line.y1 - line.y0) - wy * (line.x1 - line.x0)) / length;
    return { points, length, crossings, well: offset < 600 && along >= 0 && along <= length ? along : null };
  }, [line, frame, model, scenario]);

  if (!data || !size.width) return <svg ref={sizeRef} className="sim-view__svg" />;
  const { points, length, crossings, well } = data;
  const W = size.width;
  const Hpx = size.height;
  const m = { left: 64, right: 24, top: 66, bottom: W < 560 ? 104 : 74 };
  const H = model.H;
  let zMin = Infinity;
  let zMax = -Infinity;
  for (const p of points) { zMin = Math.min(zMin, p.zt); zMax = Math.max(zMax, p.zt + H); }
  const top = zMin - SIM_CAPROCK_DRAWN - 50;
  const bottom = zMax + 50;
  const sx = d => m.left + (W - m.left - m.right) * d / length;
  const sy = z => m.top + (Hpx - m.top - m.bottom) * (z - top) / (bottom - top);
  const exaggeration = ((Hpx - m.top - m.bottom) / (bottom - top)) / ((W - m.left - m.right) / length);
  const pathBetween = (upper, lower) => {
    let d = `M${sx(points[0].d).toFixed(1)},${sy(upper(points[0])).toFixed(1)}`;
    for (const p of points) d += `L${sx(p.d).toFixed(1)},${sy(upper(p)).toFixed(1)}`;
    for (let k = points.length - 1; k >= 0; k--) d += `L${sx(points[k].d).toFixed(1)},${sy(lower(points[k])).toFixed(1)}`;
    return `${d}Z`;
  };
  const injecting = year < model.injYears;
  const fingers = points.filter((p, k) => k % 14 === 7 && p.md > 0.02 * model.disCapacity && p.md < 0.95 * model.disCapacity && p.h > 0.5);
  const leaking = crossings.filter(c => frame.leaking?.[c.index]);
  const depthTicks = simTicks(top, bottom, 5).filter(t => t > top && t < bottom);
  const distanceTicks = simTicks(0, length / 1000, 6);
  return (
    <svg ref={sizeRef} className="sim-view__svg sim-view__fade" viewBox={`0 0 ${W} ${Hpx}`} role="img"
      aria-label={`Vertical section A–A′ at year ${Math.round(year)}, ${(length / 1000).toFixed(1)} km long, vertical exaggeration ${Math.round(exaggeration)} times.`}>
      <defs>
        <pattern id="sim-shale" width="18" height="6" patternUnits="userSpaceOnUse"><rect width="18" height="6" fill={palette.rockCap} /><path d="M1 3h9M12 1h5" stroke={palette.inkFaint} strokeOpacity="0.35" strokeWidth="1" /></pattern>
        <pattern id="sim-sand" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill={palette.rockAquifer} /><circle cx="2" cy="2" r="0.9" fill={palette.inkFaint} fillOpacity="0.45" /><circle cx="6.5" cy="6" r="0.7" fill={palette.inkFaint} fillOpacity="0.35" /></pattern>
        <pattern id="sim-residual" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill={palette.residual} fillOpacity="0.25" /><rect width="2" height="6" fill={palette.glowResidual} /></pattern>
        <linearGradient id="sim-plume" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={palette.glowFree} /><stop offset="1" stopColor={palette.free} /></linearGradient>
        <linearGradient id="sim-dissolved" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={palette.glowDissolved} stopOpacity="0.2" /><stop offset="1" stopColor={palette.glowDissolved} stopOpacity="0.75" /></linearGradient>
        <clipPath id="sim-aquifer-clip"><path d={pathBetween(p => p.zt, p => p.zt + H)} /></clipPath>
      </defs>
      <rect x={m.left} y={m.top} width={W - m.left - m.right} height={Hpx - m.top - m.bottom} fill={palette.rockOver} />
      {simTicks(top, bottom, 12).map(t => <line key={`s${t}`} x1={m.left} x2={W - m.right} y1={sy(t)} y2={sy(t)} stroke={palette.rule} strokeOpacity="0.5" />)}
      <path d={pathBetween(p => p.zt - SIM_CAPROCK_DRAWN, p => p.zt)} fill="url(#sim-shale)" />
      <path d={pathBetween(p => p.zt, p => p.zt + H)} fill="url(#sim-sand)" />
      <path d={pathBetween(p => p.zt + H, () => bottom)} fill={palette.rockBase} />
      <g clipPath="url(#sim-aquifer-clip)">
        <path d={pathBetween(p => p.zt + H - H * Math.min(1, p.md / model.disCapacity), p => p.zt + H)} fill="url(#sim-dissolved)" />
        {!reducedMotion && fingers.map((p, k) => (
          <path key={k} className="sim-finger" style={{ animationDelay: `${(k % 7) * -0.6}s` }}
            d={`M${sx(p.d)},${sy(p.zt + p.hMax)} q 3 ${(sy(p.zt + H) - sy(p.zt + p.hMax)) * 0.5} -1 ${(sy(p.zt + H) - sy(p.zt + p.hMax)) * 0.9}`}
            stroke={palette.glowDissolved} strokeOpacity="0.55" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        ))}
        {layers.residual !== false && <path d={pathBetween(p => p.zt + p.h, p => p.zt + Math.max(p.h, p.hMax))} fill="url(#sim-residual)" />}
        <path d={pathBetween(p => p.zt, p => p.zt + p.h)} fill="url(#sim-plume)" />
        <path d={pathBetween(p => p.zt, p => p.zt + Math.min(p.h, p.closure))} fill={palette.glowStructural} fillOpacity="0.85" />
      </g>
      <path d={`M${points.map(p => `${sx(p.d).toFixed(1)},${sy(p.zt).toFixed(1)}`).join('L')}`} fill="none" stroke={palette.ink} strokeOpacity="0.55" strokeWidth="1" />
      {crossings.map(c => {
        const x = sx(c.d);
        const fault = model.faults[c.index];
        const lean = (simFaultNormal(fault)[0] * (line.x1 - line.x0) + simFaultNormal(fault)[1] * (line.y1 - line.y0)) >= 0 ? 1 : -1;
        const run = (sy(bottom) - sy(top)) * 0.18;
        return (
          <g key={c.index}>
            <line x1={x - lean * run / 2} y1={m.top} x2={x + lean * run / 2} y2={Hpx - m.bottom} stroke={frame.leaking?.[c.index] ? palette.glowLeaked : palette.ink} strokeOpacity="0.85" strokeWidth="1.6" />
            <text x={x - lean * run / 2} y={m.top - 8} textAnchor="middle" fill={palette.ink} fontSize="12" fontWeight="700">F{c.index + 1}</text>
          </g>
        );
      })}
      {!reducedMotion && leaking.map(c => [0, 1, 2, 3, 4].map(k => {
        const p = points[Math.round(c.d / length * (points.length - 1))];
        return <circle key={`${c.index}-${k}`} className="sim-bubble" style={{ animationDelay: `${k * -0.7}s`, '--rise': `${sy(p.zt - SIM_CAPROCK_DRAWN) - m.top}px` }}
          cx={sx(c.d) + (k % 2 ? 3 : -3)} cy={sy(p.zt - SIM_CAPROCK_DRAWN)} r={2 + (k % 3)} fill={palette.glowLeaked} />;
      }))}
      {well !== null && (
        <g>
          <line x1={sx(well)} x2={sx(well)} y1={m.top - 4} y2={sy(points[Math.round(well / length * (points.length - 1))].zt + H)} stroke={palette.ink} strokeWidth="2.5" />
          {[0.2, 0.4, 0.6, 0.8].map(f => {
            const p = points[Math.round(well / length * (points.length - 1))];
            return <line key={f} x1={sx(well) - 6} x2={sx(well) + 6} y1={sy(p.zt + f * H)} y2={sy(p.zt + f * H)} stroke={palette.ink} strokeWidth="1.5" />;
          })}
          {injecting && !reducedMotion && <line className="sim-inject" x1={sx(well)} x2={sx(well)} y1={m.top} y2={sy(points[Math.round(well / length * (points.length - 1))].zt)} stroke={palette.glowFree} strokeWidth="2.5" strokeDasharray="6 10" />}
          <text x={sx(well) + 8} y={m.top + 4} fill={palette.ink} fontSize="12" fontWeight="700">INJ-1</text>
        </g>
      )}
      <rect x={m.left} y={m.top} width={W - m.left - m.right} height={Hpx - m.top - m.bottom} fill="none" stroke={palette.rule} />
      {depthTicks.map(t => <text key={t} x={m.left - 8} y={sy(t) + 4} textAnchor="end" fill={palette.inkFaint} fontSize="11" fontFamily={palette.mono}>{t}</text>)}
      <text x={12} y={m.top - 8} fill={palette.inkFaint} fontSize="11">Depth (m)</text>
      {distanceTicks.map(t => <text key={t} x={sx(t * 1000)} y={Hpx - m.bottom + 16} textAnchor="middle" fill={palette.inkFaint} fontSize="11" fontFamily={palette.mono}>{t}</text>)}
      <text x={m.left} y={Hpx - m.bottom + 32} fill={palette.inkFaint} fontSize="11">Distance along A–A′ (km)</text>
      <text x={W - m.right} y={Hpx - m.bottom + 32} textAnchor="end" fill={palette.inkFaint} fontSize="11">Vertical exaggeration ×{Math.round(exaggeration)}</text>
      <text x={m.left + 4} y={m.top + 16} fill={palette.ink} fontSize="13" fontWeight="700">A</text>
      <text x={W - m.right - 4} y={m.top + 16} textAnchor="end" fill={palette.ink} fontSize="13" fontWeight="700">A′</text>
    </svg>
  );
};
