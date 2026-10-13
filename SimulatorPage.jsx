// SimulatorPage.jsx — CO2 Storage Simulator: scenario inputs, streamed results, playback,
// outcomes and the uncertainty study. Views are in SimViews.jsx, charts in SimCharts.jsx,
// the method page in GuidePage.jsx, the physics in ve2d-model.js.
const { useCallback, useEffect, useMemo, useRef, useState } = React;

// ---------------------------------------------------------------- pure helpers

const SIM_SECTIONS = [
  { id: 'simulator', label: 'Simulator' },
  { id: 'uncertainty', label: 'Uncertainty' },
  { id: 'method', label: 'Method' }
];
const SIM_VIEWS = [
  { id: 'map', label: 'Map' },
  { id: '3d', label: '3D' },
  { id: 'section', label: 'Section' }
];
// Stack order bottom to top; colours come from CSS custom properties.
const SIM_INVENTORY = [
  { key: 'dissolved', label: 'Dissolved', color: '--sim-c-dissolved', hint: 'Dissolved in the brine below the plume' },
  { key: 'residual', label: 'Residually trapped', color: '--sim-c-residual', hint: 'Disconnected CO₂ left behind as the plume moves' },
  { key: 'structural', label: 'Structurally trapped', color: '--sim-c-structural', hint: 'Mobile CO₂ held in a trap above its spill point' },
  { key: 'free', label: 'Free plume', color: '--sim-c-free', hint: 'Mobile CO₂ that can still migrate' },
  { key: 'exited', label: 'Left the model', color: '--sim-c-exited', hint: 'Migrated out across an open model edge' },
  { key: 'leaked', label: 'Leaked through faults', color: '--sim-c-leaked', hint: 'Escaped up a leaky fault zone' }
];
const SIM_FRAME_YEARS = 5;
const SIM_SPEEDS = [25, 60, 150];
const SIM_THEME_KEY = 'co2-simulator-theme';
const SIM_FAULT_KEYS = ['x', 'y', 'strike', 'length', 'throw', 'trans', 'sealCap', 'kf'];
// Typical fracture margin above hydrostatic (fracture ~0.16 bar/m, brine ~0.105 bar/m).
const SIM_FRACTURE_MARGIN_BAR_PER_M = 0.055;

const simFormatMass = kg => {
  const mt = kg / 1e9;
  if (!Number.isFinite(mt) || Math.abs(mt) < 5e-4) return '0 Mt';
  if (Math.abs(mt) < 0.1) return `${(mt * 1000).toFixed(0)} kt`;
  return `${mt.toFixed(mt < 10 ? 2 : 1)} Mt`;
};

const simFormatPercent = (part, whole) => {
  if (!(whole > 0)) return '–';
  const pct = 100 * part / whole;
  if (pct > 0 && pct < 0.1) return '<0.1%';
  return `${pct.toFixed(pct < 10 ? 1 : 0)}%`;
};

const simFormatNumber = (value, digits = 0) => Number(value).toLocaleString('en-GB', { maximumFractionDigits: digits, minimumFractionDigits: digits });

const simEncodeScenario = scenario => {
  const params = new URLSearchParams();
  params.set('preset', scenario.preset);
  params.set('grid', scenario.grid);
  params.set('boundary', scenario.boundary);
  for (const key of Object.keys(VE2D.LIMITS)) params.set(key, String(+Number(scenario[key]).toPrecision(6)));
  params.set('faults', scenario.faults.map(fault => SIM_FAULT_KEYS.map(key => +Number(fault[key]).toPrecision(5)).join(',')).join(';'));
  return params.toString();
};

// Hand-edited links are untrusted: everything passes through the engine's normaliser.
const simDecodeScenario = search => {
  const params = new URLSearchParams(search);
  if (!params.has('preset') && !params.has('rateMt') && !params.has('faults')) return null;
  const raw = {};
  for (const [key, value] of params) if (key !== 'faults') raw[key] = value;
  if (params.has('faults')) {
    const text = params.get('faults');
    raw.faults = text === '' ? [] : text.split(';').map(item => {
      const values = item.split(',');
      return Object.fromEntries(SIM_FAULT_KEYS.map((key, index) => [key, values[index]]));
    });
  }
  return VE2D.normalizeScenario(raw);
};

const SIM_HISTORY_KEYS = ['injected', 'free', 'structural', 'residual', 'dissolved', 'exited', 'leaked', 'balance'];

const simInventoryCsv = history => [
  'year,injected_Mt,free_Mt,structural_Mt,residual_Mt,dissolved_Mt,exited_Mt,leaked_Mt,balance_Mt',
  ...history.map(row => [row.year, ...SIM_HISTORY_KEYS.map(key => (row[key] / 1e9).toPrecision(8))].join(','))
].join('\n');

const simGridCsv = (model, frame) => {
  const rows = ['x_km,y_km,top_depth_m,h_m,hmax_m,dissolved_kg_m2,dp_bar'];
  for (let c = 0; c < model.nx * model.ny; c++) {
    const i = c % model.nx;
    const j = Math.floor(c / model.nx);
    rows.push([((i + 0.5) * model.dx / 1000).toFixed(3), ((j + 0.5) * model.dy / 1000).toFixed(3), model.zt[c].toFixed(2),
      frame.h[c].toFixed(3), frame.hMax[c].toFixed(3), frame.md[c].toFixed(2), (frame.p[c] / 1e5).toFixed(3)].join(','));
  }
  return rows.join('\n');
};

const simInitialRun = () => ({ id: 0, status: 'idle', scenario: null, model: null, frames: [], history: [], truncated: false, error: null });

// Starting a run keeps the previous scenario paired with the previous fields until the
// worker reports the new model, so no view mixes old results with new geometry.
const simStartRun = (run, id, scenario) => ({ ...run, id, status: 'computing', pendingScenario: scenario, error: null });

// Advance playback; stop at the end of the run, or at the last computed frame once the
// run is finished (a truncated run ends early).
const simNextYear = (current, dt, yearsPerSecond, { years, computedYears, ready }) => {
  const next = current + dt * yearsPerSecond;
  if (next >= years) return { year: years <= computedYears ? years : computedYears, stop: true };
  if (next >= computedYears) return { year: computedYears, stop: ready };
  return { year: next, stop: false };
};

// Reducer for worker messages; anything from an older run id is ignored.
const simApplyWorkerMessage = (run, message) => {
  if (!message || message.id !== run.id) return run;
  switch (message.type) {
    case 'model': return { ...run, status: 'computing', scenario: run.pendingScenario ?? run.scenario, model: message.model, frames: [], history: [], truncated: false, error: null };
    case 'frame': return { ...run, frames: run.frames.concat([message.snap]), history: run.history.concat(message.rows) };
    case 'done': return { ...run, status: 'ready', history: run.history.concat(message.rows), truncated: !!message.truncated };
    case 'error': return { ...run, status: 'error', error: message.message };
    default: return run;
  }
};

// Linear interpolation between the two snapshots around `year`.
const simFrameAt = (frames, year) => {
  if (!frames || !frames.length) return null;
  const position = Math.max(0, year / SIM_FRAME_YEARS);
  const index = Math.min(frames.length - 1, Math.floor(position));
  const a = frames[index];
  const b = frames[Math.min(frames.length - 1, index + 1)];
  const w = a === b ? 0 : Math.min(1, position - index);
  if (w < 1e-6) return a;
  const mix = key => {
    const from = a[key];
    const to = b[key];
    const out = new Float32Array(from.length);
    for (let c = 0; c < from.length; c++) out[c] = from[c] + (to[c] - from[c]) * w;
    return out;
  };
  return { year, h: mix('h'), hMax: mix('hMax'), md: mix('md'), p: mix('p'), fx: mix('fx'), fy: mix('fy'), leaking: w < 0.5 ? a.leaking : b.leaking };
};

const simRowAt = (history, year) => {
  if (!history || !history.length) return null;
  const index = Math.min(history.length - 1, Math.max(0, Math.floor(year)));
  const a = history[index];
  const b = history[Math.min(history.length - 1, index + 1)];
  const w = Math.min(1, Math.max(0, year - index));
  if (a === b || w === 0) return a;
  const row = { year };
  for (const key of Object.keys(a)) row[key] = typeof a[key] === 'number' ? a[key] + (b[key] - a[key]) * w : a[key];
  return row;
};

const simStoredTheme = storage => {
  try {
    const value = storage?.getItem(SIM_THEME_KEY);
    return value === 'day' || value === 'night' ? value : 'night';
  } catch (_) {
    return 'night';
  }
};

const simPersistTheme = (theme, storage) => {
  try { storage?.setItem(SIM_THEME_KEY, theme); } catch (_) { /* storage blocked: the choice lasts for this visit */ }
};

const simCopyText = async (text, clipboard) => {
  try {
    if (!clipboard?.writeText) return false;
    await clipboard.writeText(text);
    return true;
  } catch (_) {
    return false;
  }
};

const simDownload = (content, filename, type) => {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
};

const simMessages = (model, row, frame, run) => {
  const messages = [];
  if (!model || !row) return messages;
  if (run.truncated) messages.push({ tone: 'danger', icon: 'fa-triangle-exclamation', text: `The run stopped at year ${run.history.at(-1)?.year}: these inputs need more time steps than the browser budget allows.` });
  model.faults.forEach((fault, index) => {
    if (frame?.leaking?.[index]) messages.push({ tone: 'danger', icon: 'fa-arrow-up', text: `Fault F${index + 1} is leaking: the CO₂ column against it exceeds its ${fault.sealCap} m seal capacity.` });
  });
  const marginBar = SIM_FRACTURE_MARGIN_BAR_PER_M * model.depth;
  if (row.bhpPeak / 1e5 > marginBar) messages.push({ tone: 'warning', icon: 'fa-gauge-high', text: `Peak pressure rise at the well, ${simFormatNumber(row.bhpPeak / 1e5)} bar, exceeds a typical fracture margin of about ${simFormatNumber(marginBar)} bar at ${simFormatNumber(model.depth)} m.` });
  const leakingNow = frame?.leaking && [...frame.leaking].some(Boolean);
  if (!leakingNow && row.leaked > 0) messages.push({ tone: 'warning', icon: 'fa-arrow-up', text: `${simFormatMass(row.leaked)} has leaked through faults so far; no fault is leaking now.` });
  if (row.exited > 1e-4 * row.injected) messages.push({ tone: 'warning', icon: 'fa-arrow-right-from-bracket', text: `${simFormatMass(row.exited)} has left the model across an open edge.` });
  if (!messages.length && row.injected > 0) messages.push({ tone: 'info', icon: 'fa-circle-check', text: 'Nothing has leaked or left the model so far.' });
  return messages;
};

// Default section A–A′: through the injector and the crest of the largest trap, edge to
// edge; east–west through the injector when there is no trap.
const simDefaultSectionLine = model => {
  const trap = model.traps.slice().sort((a, b) => b.capacity - a.capacity)[0];
  const wx = model.wellX;
  const wy = model.wellY;
  let dx = 1;
  let dy = 0;
  if (trap) {
    const cx = ((trap.crestCell % model.nx) + 0.5) * model.dx;
    const cy = (Math.floor(trap.crestCell / model.nx) + 0.5) * model.dy;
    const length = Math.hypot(cx - wx, cy - wy);
    if (length > model.dx) { dx = (cx - wx) / length; dy = (cy - wy) / length; }
  }
  const reach = sign => {
    const tx = dx * sign > 0 ? (model.Lx - wx) / (dx * sign) : dx * sign < 0 ? -wx / (dx * sign) : Infinity;
    const ty = dy * sign > 0 ? (model.Ly - wy) / (dy * sign) : dy * sign < 0 ? -wy / (dy * sign) : Infinity;
    return Math.min(tx, ty);
  };
  const back = reach(-1);
  const ahead = reach(1);
  const line = { x0: wx - dx * back, y0: wy - dy * back, x1: wx + dx * ahead, y1: wy + dy * ahead };
  // A is the western end, so the section reads west to east like the map.
  return line.x0 <= line.x1 ? line : { x0: line.x1, y0: line.y1, x1: line.x0, y1: line.y0 };
};

const simReadPalette = element => {
  const style = element ? getComputedStyle(element) : null;
  const v = (name, fallback) => (style && style.getPropertyValue(name).trim()) || fallback;
  return {
    free: v('--sim-c-free', '#23a07a'),
    structural: v('--sim-c-structural', '#c08417'),
    residual: v('--sim-c-residual', '#cf5f9e'),
    dissolved: v('--sim-c-dissolved', '#3b82d4'),
    exited: v('--sim-c-exited', '#8270e0'),
    leaked: v('--sim-c-leaked', '#d94a3f'),
    glowFree: v('--sim-glow-free', '#4fe0b0'),
    glowStructural: v('--sim-glow-structural', '#f0b649'),
    glowResidual: v('--sim-glow-residual', '#ee8ac2'),
    glowDissolved: v('--sim-glow-dissolved', '#6fb0ff'),
    glowLeaked: v('--sim-glow-leaked', '#ff6b5e'),
    depth: [0, 1, 2, 3, 4, 5, 6].map(i => v(`--sim-depth-${i}`, '#555')),
    contour: v('--sim-contour', 'rgba(232,236,244,0.32)'),
    stage: v('--sim-stage', '#0a0f1c'),
    ink: v('--sim-ink', '#e8ecf4'),
    inkMuted: v('--sim-ink-muted', '#9aa6bf'),
    inkFaint: v('--sim-ink-faint', '#6f7b96'),
    rule: v('--sim-rule', '#26324d'),
    surface: v('--sim-surface', '#111a2e'),
    accent: v('--sim-accent', '#f2c66d'),
    rockCap: v('--sim-rock-cap', '#3b3f55'),
    rockAquifer: v('--sim-rock-aquifer', '#2a3350'),
    rockBase: v('--sim-rock-base', '#151a2b'),
    rockOver: v('--sim-rock-over', '#10162a'),
    font: v('--sim-font-ui', 'Open Sans, sans-serif'),
    mono: v('--sim-font-mono', 'monospace')
  };
};

// Field metadata: labels, units and one-line explanations shown under each input.
const SIM_FIELDS = {
  rateMt: { label: 'Injection rate', unit: 'Mt/yr', digits: 1, hint: 'CO₂ mass injected each year.' },
  injYears: { label: 'Injection period', unit: 'years', digits: 0 },
  wellX: { label: 'Well, east', unit: 'km', digits: 1, hint: 'Drag the well on the map to move it.' },
  wellY: { label: 'Well, north', unit: 'km', digits: 1 },
  years: { label: 'Simulated period', unit: 'years', digits: 0 },
  permMd: { label: 'Permeability', unit: 'mD', digits: 0, log: true },
  porosity: { label: 'Porosity', unit: '', digits: 2 },
  thickness: { label: 'Aquifer thickness', unit: 'm', digits: 0 },
  dipDeg: { label: 'Regional dip', unit: '°', digits: 1 },
  dipAz: { label: 'Dip direction', unit: '° from N', digits: 0, hint: 'Direction in which the caprock deepens; CO₂ rises the other way.' },
  domes: { label: 'Domes', unit: '', digits: 0 },
  domeRelief: { label: 'Dome relief', unit: 'm', digits: 0 },
  roughness: { label: 'Caprock roughness', unit: 'm', digits: 0, hint: 'Small undulations that hold CO₂ in many small traps.' },
  sgr: { label: 'Residual CO₂ saturation', unit: '', digits: 2, hint: 'Fraction of pore space left as trapped CO₂ when brine returns.' },
  swr: { label: 'Residual brine saturation', unit: '', digits: 2 },
  krg: { label: 'CO₂ relative permeability', unit: '', digits: 2, hint: 'End-point value at residual brine saturation.' },
  disRate: { label: 'Dissolution rate', unit: 'kg/m²/yr', digits: 2, hint: 'Convective dissolution below the plume.' },
  disCap: { label: 'CO₂ solubility', unit: 'kg/m³', digits: 0, hint: 'Mass of CO₂ a cubic metre of brine can hold.' },
  rhoCo2: { label: 'CO₂ density', unit: 'kg/m³', digits: 0 },
  rhoBrine: { label: 'Brine density', unit: 'kg/m³', digits: 0 },
  muCo2: { label: 'CO₂ viscosity', unit: 'mPa·s', digits: 3 },
  muBrine: { label: 'Brine viscosity', unit: 'mPa·s', digits: 2 },
  ct: { label: 'Total compressibility', unit: '×10⁻⁴ /bar', digits: 1 }
};
const SIM_FAULT_FIELDS = {
  x: { label: 'Centre, east', unit: 'km', digits: 1 },
  y: { label: 'Centre, north', unit: 'km', digits: 1 },
  strike: { label: 'Strike', unit: '° from N', digits: 0 },
  length: { label: 'Length', unit: 'km', digits: 1 },
  throw: { label: 'Throw', unit: 'm', digits: 0, hint: 'Vertical offset; a throw above the aquifer thickness seals the fault.' },
  trans: { label: 'Cross-fault transmissibility', unit: '', digits: 2, hint: '0 seals the fault, 1 is no barrier.' },
  sealCap: { label: 'Seal capacity', unit: 'm', digits: 0, hint: 'CO₂ column the fault zone holds before it leaks.' },
  kf: { label: 'Fault-zone permeability', unit: 'mD', digits: 0, hint: '0 means the fault never leaks vertically.' }
};

// ---------------------------------------------------------------- hooks

const useSimSimulation = scenario => {
  const [run, setRun] = useState(simInitialRun);
  const workerRef = useRef(null);
  const busyRef = useRef(false);
  const idRef = useRef(0);
  const key = JSON.stringify(scenario);

  useEffect(() => {
    const timer = setTimeout(() => {
      const id = ++idRef.current;
      if (busyRef.current && workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (!workerRef.current) {
        try {
          const worker = new Worker('./simulation-worker.js?v=1');
          worker.onmessage = ({ data }) => {
            if (data.type === 'done' || data.type === 'error') busyRef.current = false;
            setRun(current => simApplyWorkerMessage(current, data));
          };
          worker.onerror = event => {
            busyRef.current = false;
            setRun(current => ({ ...current, status: 'error', error: event.message || 'The simulation worker failed to start.' }));
          };
          workerRef.current = worker;
        } catch (error) {
          setRun(current => ({ ...current, id, status: 'error', error: 'This browser blocked the simulation worker.' }));
          return;
        }
      }
      busyRef.current = true;
      setRun(current => simStartRun(current, id, scenario));
      workerRef.current.postMessage({ type: 'run', id, scenario });
    }, idRef.current === 0 ? 0 : 250);
    return () => clearTimeout(timer);
  }, [key]);

  useEffect(() => () => workerRef.current?.terminate(), []);
  return run;
};

const useSimReducedMotion = () => {
  const [reduced, setReduced] = useState(() => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return undefined;
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  return reduced;
};

// ---------------------------------------------------------------- inputs

const SimField = ({ name, meta, value, limits, onChange }) => {
  const [min, max, step] = limits;
  const [draft, setDraft] = useState(null);
  const [feedback, setFeedback] = useState('');
  const id = `sim-field-${name}`;
  const toSlider = v => meta.log ? Math.log10(v) : v;
  const fromSlider = v => meta.log ? Math.round(10 ** v) : v;
  const sliderMin = toSlider(min);
  const sliderMax = toSlider(max);
  const fill = `${(100 * (toSlider(value) - sliderMin) / (sliderMax - sliderMin || 1)).toFixed(1)}%`;
  const commit = text => {
    const number = Number(text);
    if (text === '' || !Number.isFinite(number)) {
      setFeedback(`Enter a number between ${min} and ${max}.`);
      return;
    }
    const bounded = Math.min(max, Math.max(min, number));
    setFeedback(bounded !== number ? `Kept within ${min}–${max} ${meta.unit}.` : '');
    setDraft(null);
    onChange(bounded);
  };
  return (
    <div className="sim-field">
      <div className="sim-field__top">
        <label htmlFor={id}>{meta.label}</label>
        <span className="sim-field__value">
          <input
            id={id}
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            value={draft ?? +Number(value).toFixed(meta.digits ?? 2)}
            aria-describedby={feedback ? `${id}-feedback` : meta.hint ? `${id}-hint` : undefined}
            aria-invalid={feedback && draft !== null ? 'true' : undefined}
            onChange={event => setDraft(event.target.value)}
            onBlur={event => { if (draft !== null) commit(event.target.value); }}
            onKeyDown={event => { if (event.key === 'Enter') commit(event.currentTarget.value); }}
          />
          {meta.unit && <span>{meta.unit}</span>}
        </span>
      </div>
      <input
        className="sim-range"
        type="range"
        aria-label={meta.label}
        min={sliderMin}
        max={sliderMax}
        step={meta.log ? 0.01 : step}
        value={toSlider(value)}
        style={{ '--fill': fill }}
        onChange={event => { setDraft(null); setFeedback(''); onChange(fromSlider(Number(event.target.value))); }}
      />
      {feedback
        ? <p className="sim-field__feedback" id={`${id}-feedback`} role="status">{feedback}</p>
        : meta.hint && <p className="sim-field__hint" id={`${id}-hint`}>{meta.hint}</p>}
    </div>
  );
};

const SimChoice = ({ label, options, value, onChange }) => (
  <div className="sim-field">
    <div className="sim-field__top"><span style={{ fontWeight: 600, fontSize: 13.5 }}>{label}</span></div>
    <div className="sim-choice" role="group" aria-label={label} style={{ '--choices': options.length }}>
      {options.map(option => (
        <button key={option.id} type="button" aria-pressed={value === option.id} onClick={() => onChange(option.id)}>{option.label}</button>
      ))}
    </div>
    {options.find(option => option.id === value)?.hint && <p className="sim-field__hint">{options.find(option => option.id === value).hint}</p>}
  </div>
);

const SimGroup = ({ title, open = true, children }) => (
  <details className="sim-group" open={open}>
    <summary>{title}</summary>
    <div className="sim-group__body">{children}</div>
  </details>
);

const SimInputs = ({ scenario, onChange, onPreset, onRandom, onClose }) => {
  const field = key => <SimField key={key} name={key} meta={SIM_FIELDS[key]} value={scenario[key]} limits={VE2D.LIMITS[key]} onChange={value => onChange({ [key]: value })} />;
  const setFault = (index, patch) => onChange({ faults: scenario.faults.map((fault, i) => i === index ? { ...fault, ...patch } : fault) });
  const presetIds = Object.keys(VE2D.PRESETS);
  const preset = VE2D.PRESETS[scenario.preset];
  return (
    <>
      <div className="sim-rail__head">
        <h2>Scenario</h2>
        <button type="button" className="sim-icon-button sim-sheet-close" onClick={onClose} aria-label="Close inputs"><i className="fas fa-times" aria-hidden="true" /></button>
      </div>
      <div className="sim-scenario">
        <label className="sim-sr-only" htmlFor="sim-preset">Scenario</label>
        <select id="sim-preset" value={preset ? scenario.preset : 'custom'} onChange={event => onPreset(event.target.value)}>
          {presetIds.map(id => <option key={id} value={id}>{VE2D.PRESETS[id].label}</option>)}
          {!preset && <option value="custom">Custom</option>}
        </select>
        <p>{preset ? preset.description : 'Your own combination of inputs. Share it with the link button.'}</p>
        <div className="sim-scenario__row">
          <button type="button" className="sim-button" onClick={onRandom}><i className="fas fa-shuffle" aria-hidden="true" /> New random structure</button>
        </div>
      </div>
      <SimGroup title="Injection">
        {field('rateMt')}
        {field('injYears')}
        {field('wellX')}
        {field('wellY')}
        {field('years')}
      </SimGroup>
      <SimGroup title="Aquifer">
        {field('permMd')}
        {field('porosity')}
        {field('thickness')}
      </SimGroup>
      <SimGroup title="Structure">
        {field('dipDeg')}
        {field('dipAz')}
        {field('domes')}
        {field('domeRelief')}
        {field('roughness')}
      </SimGroup>
      <SimGroup title={`Faults (${scenario.faults.length})`}>
        {scenario.faults.map((fault, index) => (
          <div className="sim-fault" key={index}>
            <div className="sim-fault__head">
              <span><span className="sim-fault__swatch" data-leaky={fault.kf > 0} aria-hidden="true" />Fault F{index + 1}</span>
              <button type="button" className="sim-button sim-button--quiet" aria-label={`Remove fault F${index + 1}`} onClick={() => onChange({ faults: scenario.faults.filter((_, i) => i !== index) })}>Remove</button>
            </div>
            {Object.keys(SIM_FAULT_FIELDS).map(key => (
              <SimField key={key} name={`f${index}-${key}`} meta={SIM_FAULT_FIELDS[key]} value={fault[key]} limits={VE2D.FAULT_LIMITS[key]} onChange={value => setFault(index, { [key]: value })} />
            ))}
          </div>
        ))}
        {scenario.faults.length < VE2D.MAX_FAULTS && (
          <button type="button" className="sim-button" onClick={() => onChange({ faults: [...scenario.faults, { x: 6 + 4 * scenario.faults.length, y: 6, strike: 20, length: 6, throw: 10, trans: 0.5, sealCap: 20, kf: 10 }] })}>
            <i className="fas fa-plus" aria-hidden="true" /> Add a fault
          </button>
        )}
      </SimGroup>
      <SimGroup title="Trapping and fluids" open={false}>
        {['sgr', 'swr', 'krg', 'disRate', 'disCap', 'rhoCo2', 'rhoBrine', 'muCo2', 'muBrine', 'ct'].map(field)}
      </SimGroup>
      <SimGroup title="Model edges and grid" open={false}>
        <SimChoice label="Model edges" value={scenario.boundary} onChange={boundary => onChange({ boundary })} options={[
          { id: 'open', label: 'Open', hint: 'Hydrostatic aquifer beyond the edges: brine and CO₂ can leave.' },
          { id: 'closed', label: 'Closed', hint: 'Sealed compartment: nothing leaves and pressure builds up.' }
        ]} />
        <SimChoice label="Grid" value={scenario.grid} onChange={grid => onChange({ grid })} options={[
          { id: 'coarse', label: '500 m', hint: '40 × 24 cells: fastest.' },
          { id: 'standard', label: '250 m', hint: '80 × 48 cells.' },
          { id: 'fine', label: '167 m', hint: '120 × 72 cells: slowest, most detail.' }
        ]} />
      </SimGroup>
    </>
  );
};

// ---------------------------------------------------------------- outcomes

const SimOutcomes = ({ model, row, frame, run, history, year, onSeek }) => {
  if (!model || !row) {
    return (
      <div className="sim-outcome-section">
        <h3>Outcomes</h3>
        <p className="sim-field__hint">{run.status === 'error' ? run.error : 'Running the scenario…'}</p>
      </div>
    );
  }
  const total = SIM_INVENTORY.reduce((sum, item) => sum + row[item.key], 0);
  const messages = simMessages(model, row, frame, run);
  const balance = row.injected > 0 ? Math.abs(row.balance) / row.injected : 0;
  return (
    <>
      <section className="sim-outcome-section" aria-labelledby="sim-where">
        <h3 id="sim-where">Where the CO₂ is <span>at year {Math.round(year)}</span></h3>
        <div className="sim-stackbar" role="img" aria-label="Share of injected CO₂ in each class">
          {SIM_INVENTORY.map(item => <span key={item.key} style={{ '--swatch': `var(${item.color})`, flexGrow: total > 0 ? row[item.key] / total : 0 }} />)}
        </div>
        <ul className="sim-inventory">
          {SIM_INVENTORY.slice().reverse().map(item => (
            <li key={item.key} title={item.hint}>
              <span className="sim-swatch" style={{ '--swatch': `var(${item.color})` }} aria-hidden="true" />
              <span className="sim-inventory__label">{item.label}</span>
              <span className="sim-inventory__value">{simFormatMass(row[item.key])}</span>
              <span className="sim-inventory__pct">{simFormatPercent(row[item.key], row.injected)}</span>
            </li>
          ))}
        </ul>
        <div className="sim-inventory__total">
          <span>Injected {simFormatMass(row.injected)}</span>
          <span title="Injected minus every class, relative to injected">Mass balance error {balance < 1e-12 ? '< 10⁻¹²' : balance.toExponential(1)}</span>
        </div>
      </section>
      <section className="sim-outcome-section" aria-labelledby="sim-time">
        <h3 id="sim-time">Through time</h3>
        <SimInventoryChart history={history} year={year} years={model.years} injYears={model.injYears} onSeek={onSeek} />
      </section>
      <section className="sim-outcome-section" aria-labelledby="sim-plume">
        <h3 id="sim-plume">Plume and pressure</h3>
        <dl className="sim-kpis">
          <div><dt>CO₂ footprint</dt><dd>{simFormatNumber(row.footprint / 1e6, 1)}<small>km²</small></dd></div>
          <div><dt>Thickest column</dt><dd>{simFormatNumber(row.maxColumn, 1)}<small>m</small></dd></div>
          <div><dt>Mobile plume reach</dt><dd>{simFormatNumber(row.migration / 1000, 1)}<small>km from well</small></dd></div>
          <div><dt>Peak pressure rise at the well</dt><dd>{simFormatNumber(row.bhpPeak / 1e5, 1)}<small>bar</small></dd></div>
        </dl>
      </section>
      <section className="sim-outcome-section" aria-labelledby="sim-notes">
        <h3 id="sim-notes">Notes</h3>
        <ul className="sim-messages">
          {messages.map(message => (
            <li key={message.text} data-tone={message.tone}><i className={`fas ${message.icon}`} aria-hidden="true" /><span>{message.text}</span></li>
          ))}
        </ul>
      </section>
    </>
  );
};

const SimTransport = ({ year, years, injYears, computedYears, playing, speed, onPlay, onSeek, onSpeed }) => {
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(f * years));
  return (
    <div className="sim-transport">
      <button type="button" className="sim-play" onClick={onPlay} aria-label={playing ? 'Pause' : year >= years ? 'Replay from year 0' : 'Play'}>
        <i className={`fas ${playing ? 'fa-pause' : year >= years ? 'fa-rotate-left' : 'fa-play'}`} aria-hidden="true" />
      </button>
      <div className="sim-steps">
        <button type="button" className="sim-icon-button" onClick={() => onSeek(Math.max(0, Math.ceil(year / SIM_FRAME_YEARS - 1) * SIM_FRAME_YEARS))} aria-label="Back 5 years"><i className="fas fa-backward-step" aria-hidden="true" /></button>
        <button type="button" className="sim-icon-button" onClick={() => onSeek(Math.min(computedYears, Math.floor(year / SIM_FRAME_YEARS + 1) * SIM_FRAME_YEARS))} aria-label="Forward 5 years"><i className="fas fa-forward-step" aria-hidden="true" /></button>
      </div>
      <div className="sim-scrubber">
        <div className="sim-scrubber__bands" aria-hidden="true">
          <span className="sim-scrubber__computed" style={{ width: `${100 * computedYears / years}%` }} />
          <span className="sim-scrubber__injection" style={{ width: `${100 * injYears / years}%` }} />
        </div>
        <input type="range" min={0} max={years} step={1} value={Math.round(year)} aria-label="Simulation year" aria-valuetext={`Year ${Math.round(year)} of ${years}`}
          onChange={event => onSeek(Math.min(computedYears, Number(event.target.value)))} />
        <div className="sim-scrubber__ticks" aria-hidden="true">{ticks.map(t => <span key={t}>{t}</span>)}</div>
      </div>
      <div className="sim-year" aria-live="off"><strong>{Math.round(year)}</strong> <span>of {years} years</span></div>
      <button type="button" className="sim-button sim-speed" onClick={onSpeed} aria-label={`Playback speed ${speed + 1}×, change`}>{speed + 1}×</button>
    </div>
  );
};

// ---------------------------------------------------------------- uncertainty

const SIM_UQ_METRICS = [
  { key: 'leakedPct', label: 'Leaked through faults', unit: '%', digits: 1 },
  { key: 'exitedPct', label: 'Left the model', unit: '%', digits: 1 },
  { key: 'residualPct', label: 'Residually trapped', unit: '%', digits: 1 },
  { key: 'dissolvedPct', label: 'Dissolved', unit: '%', digits: 1 },
  { key: 'structuralPct', label: 'Structurally trapped', unit: '%', digits: 1 },
  { key: 'freePct', label: 'Free plume', unit: '%', digits: 1 },
  { key: 'footprintKm2', label: 'CO₂ footprint', unit: 'km²', digits: 0 },
  { key: 'bhpBar', label: 'Peak pressure rise at the well', unit: 'bar', digits: 1 }
];

const simDefaultUqSpecs = scenario => VE2D.UQ_PARAMS.map(param => {
  const base = param.key.startsWith('fault0.') ? scenario.faults[0]?.[param.key.slice(7)] : scenario[param.key];
  const limits = param.key.startsWith('fault0.') ? VE2D.FAULT_LIMITS[param.key.slice(7)] : VE2D.LIMITS[param.key];
  const spread = param.log ? [base / 2, base * 2] : [base * 0.7, base * 1.3];
  const round = v => +Number(v).toPrecision(3);
  return {
    ...param,
    enabled: ['permMd', 'porosity', 'sgr', 'fault0.sealCap'].includes(param.key) && base !== undefined,
    available: base !== undefined,
    min: round(Math.max(limits[0], Math.min(spread[0], spread[1]))),
    max: round(Math.min(limits[1], Math.max(spread[0], spread[1], limits[0] + limits[2])))
  };
});

const simPercentile = (sorted, p) => {
  if (!sorted.length) return NaN;
  const position = (sorted.length - 1) * p;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
};

const SimUncertainty = ({ scenario, onLoad, theme, hidden }) => {
  const [specs, setSpecs] = useState(() => simDefaultUqSpecs(scenario));
  const [runs, setRuns] = useState(50);
  const [grid, setGrid] = useState('coarse');
  const [seed, setSeed] = useState(1);
  const [state, setState] = useState({ status: 'idle', done: 0, total: 0, rows: [], error: null });
  const [metric, setMetric] = useState('leakedPct');
  const [xParam, setXParam] = useState(null);
  const workerRef = useRef(null);

  useEffect(() => () => workerRef.current?.terminate(), []);
  useEffect(() => setSpecs(simDefaultUqSpecs(scenario)), [scenario.faults.length]);

  const active = specs.filter(spec => spec.enabled && spec.available);
  const start = () => {
    workerRef.current?.terminate();
    const base = { ...scenario, grid: grid === 'same' ? scenario.grid : 'coarse' };
    const scenarios = VE2D.sampleBatch(base, active.map(({ key, min, max, log }) => ({ key, min: Math.min(min, max), max: Math.max(min, max), log })), runs, seed);
    try {
      const worker = new Worker('./simulation-worker.js?v=1');
      workerRef.current = worker;
      worker.onmessage = ({ data }) => {
        if (data.type === 'progress') setState(current => ({ ...current, done: data.done, total: data.total }));
        if (data.type === 'batch-done') { setState({ status: 'ready', done: data.rows.length, total: data.rows.length, rows: data.rows, error: null }); worker.terminate(); }
        if (data.type === 'error') setState(current => ({ ...current, status: 'error', error: data.message }));
      };
      setState({ status: 'running', done: 0, total: runs, rows: [], error: null });
      setXParam(active[0]?.key || null);
      worker.postMessage({ type: 'batch', id: 1, scenarios });
    } catch (_) {
      setState({ status: 'error', done: 0, total: 0, rows: [], error: 'This browser blocked the simulation worker.' });
    }
  };
  const cancel = () => {
    workerRef.current?.terminate();
    setState(current => ({ ...current, status: 'idle' }));
  };

  const valueOf = (row, key) => key.startsWith('fault0.') ? row.scenario.faults[0]?.[key.slice(7)] : row.scenario[key];
  const metricMeta = SIM_UQ_METRICS.find(m => m.key === metric);
  const results = useMemo(() => {
    if (!state.rows.length) return null;
    const table = SIM_UQ_METRICS.map(m => {
      const sorted = state.rows.map(r => r.summary[m.key]).sort((a, b) => a - b);
      return { ...m, p10: simPercentile(sorted, 0.1), p50: simPercentile(sorted, 0.5), p90: simPercentile(sorted, 0.9) };
    });
    const params = VE2D.UQ_PARAMS.filter(p => state.rows.some(r => valueOf(r, p.key) !== valueOf(state.rows[0], p.key)));
    const tornado = params.map(p => ({ key: p.key, label: p.label, rho: VE2D.spearman(state.rows.map(r => valueOf(r, p.key)), state.rows.map(r => r.summary[metric])) }))
      .sort((a, b) => Math.abs(b.rho) - Math.abs(a.rho));
    return { table, params, tornado };
  }, [state.rows, metric]);

  return (
    <div className="sim-uq" id="sim-panel-uncertainty" role="tabpanel" aria-labelledby="sim-tab-uncertainty" hidden={hidden}>
      <aside className="sim-rail sim-uq__setup" aria-label="Uncertainty set-up">
        <div className="sim-rail__head"><h2>Inputs to vary</h2></div>
        <p className="sim-field__hint" style={{ padding: '0 16px 8px' }}>Each run draws its inputs by Latin hypercube sampling from these ranges; everything else is the current scenario.</p>
        <ul className="sim-uq__params">
          {specs.filter(spec => spec.available).map(spec => (
            <li key={spec.key} className="sim-uq__param" data-off={!spec.enabled}>
              <input type="checkbox" id={`sim-uq-${spec.key}`} checked={spec.enabled} onChange={event => setSpecs(current => current.map(s => s.key === spec.key ? { ...s, enabled: event.target.checked } : s))} />
              <label htmlFor={`sim-uq-${spec.key}`}>{spec.label}</label>
              <div className="sim-uq__range">
                <input type="number" aria-label={`${spec.label} minimum`} value={spec.min} disabled={!spec.enabled} onChange={event => setSpecs(current => current.map(s => s.key === spec.key ? { ...s, min: Number(event.target.value) } : s))} />
                <span>to</span>
                <input type="number" aria-label={`${spec.label} maximum`} value={spec.max} disabled={!spec.enabled} onChange={event => setSpecs(current => current.map(s => s.key === spec.key ? { ...s, max: Number(event.target.value) } : s))} />
                <span>{spec.unit}{spec.log ? ', log' : ''}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="sim-uq__run">
          <SimChoice label="Runs" value={String(runs)} onChange={value => setRuns(Number(value))} options={[{ id: '25', label: '25' }, { id: '50', label: '50' }, { id: '100', label: '100' }, { id: '200', label: '200' }]} />
          <SimChoice label="Grid" value={grid} onChange={setGrid} options={[
            { id: 'coarse', label: '500 m (fast)', hint: 'Coarse grid; load a run to see it on the same grid.' },
            { id: 'same', label: 'Same as simulator', hint: 'Exactly the simulator grid; slower.' }
          ]} />
          <SimField name="uq-seed" meta={{ label: 'Sampling seed', unit: '', digits: 0 }} value={seed} limits={[1, 9999, 1]} onChange={setSeed} />
          {state.status === 'running'
            ? <>
              <div className="sim-progress" role="progressbar" aria-label="Uncertainty runs completed" aria-valuemin={0} aria-valuemax={state.total} aria-valuenow={state.done}><span style={{ width: `${100 * state.done / Math.max(1, state.total)}%` }} /></div>
              <button type="button" className="sim-button" onClick={cancel}>Cancel ({state.done} of {state.total})</button>
            </>
            : <button type="button" className="sim-button sim-button--primary" disabled={!active.length} onClick={start}><i className="fas fa-play" aria-hidden="true" /> Run {runs} scenarios</button>}
          {state.error && <p className="sim-field__feedback" role="status">{state.error}</p>}
        </div>
      </aside>
      <div className="sim-uq__results">
        {!results
          ? <div className="sim-empty"><div><h3>No uncertainty runs yet</h3><p>Pick the inputs you are unsure about, set their ranges and run the batch. The results show the spread of outcomes and which inputs drive them.</p></div></div>
          : <div className="sim-uq__grid">
            <section className="sim-card" style={{ gridColumn: '1 / -1' }}>
              <h3>Outcomes at year {scenario.years} across {state.rows.length} runs</h3>
              <p>P10, P50 and P90 are the 10th, 50th and 90th percentiles. Choose an outcome to plot.</p>
              <table className="sim-table">
                <thead><tr><th>Outcome</th><th>P10</th><th>P50</th><th>P90</th></tr></thead>
                <tbody>{results.table.map(m => (
                  <tr key={m.key} aria-selected={metric === m.key} style={{ cursor: 'pointer', background: metric === m.key ? 'var(--sim-surface-3)' : undefined }} onClick={() => setMetric(m.key)}>
                    <td><button type="button" className="sim-button sim-button--quiet" style={{ padding: 0, minHeight: 0 }} onClick={() => setMetric(m.key)}>{m.label}</button></td>
                    <td>{simFormatNumber(m.p10, m.digits)} {m.unit}</td><td>{simFormatNumber(m.p50, m.digits)} {m.unit}</td><td>{simFormatNumber(m.p90, m.digits)} {m.unit}</td>
                  </tr>
                ))}</tbody>
              </table>
            </section>
            <section className="sim-card">
              <h3>{metricMeta.label}</h3>
              <p>Distribution over the runs, in {metricMeta.unit}.</p>
              <SimHistogram values={state.rows.map(r => r.summary[metric])} unit={metricMeta.unit} digits={metricMeta.digits} />
            </section>
            <section className="sim-card">
              <h3>What drives it</h3>
              <p>Spearman rank correlation between each input and {metricMeta.label.toLowerCase()}.</p>
              <SimTornado items={results.tornado} />
            </section>
            {xParam && <section className="sim-card" style={{ gridColumn: '1 / -1' }}>
              <h3>Runs</h3>
              <p>Each point is one run. Select a point to open that run in the simulator.</p>
              <div style={{ marginBottom: 10 }}>
                <label className="sim-field__hint" htmlFor="sim-uq-x">Horizontal axis </label>
                <select id="sim-uq-x" value={xParam} onChange={event => setXParam(event.target.value)} className="sim-button" style={{ marginLeft: 6 }}>
                  {results.params.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <SimScatter
                points={state.rows.map(r => ({ x: valueOf(r, xParam), y: r.summary[metric], row: r }))}
                xLabel={VE2D.UQ_PARAMS.find(p => p.key === xParam)?.label}
                yLabel={`${metricMeta.label} (${metricMeta.unit})`}
                log={VE2D.UQ_PARAMS.find(p => p.key === xParam)?.log}
                onSelect={point => onLoad(point.row.scenario)}
              />
            </section>}
          </div>}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- page

const SimulatorPage = () => {
  const reducedMotion = useSimReducedMotion();
  const [scenario, setScenario] = useState(() => simDecodeScenario(window.location.search) || VE2D.normalizeScenario(VE2D.DEFAULTS));
  const [section, setSection] = useState('simulator');
  const [view, setView] = useState('map');
  const [theme, setTheme] = useState(() => simStoredTheme(window.localStorage));
  const [palette, setPalette] = useState(() => simReadPalette(null));
  const [year, setYear] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [sheet, setSheet] = useState(null);
  const [share, setShare] = useState('Share');
  const [layers, setLayers] = useState({ contours: true, traps: true, residual: true, dissolved: false, pressure: false, flow: true });
  const [sectionLine, setSectionLine] = useState(null);
  const autoplayed = useRef(false);
  const tabRefs = useRef({});

  const run = useSimSimulation(scenario);
  // Keep showing the previous result until the new one has caught up with the
  // current year, so edits morph instead of flashing an empty map.
  const lastComplete = useRef(null);
  if (run.model && run.frames.length && run.status === 'ready') lastComplete.current = run;
  const computedYears = run.model ? Math.max(0, (run.frames.length - 1) * SIM_FRAME_YEARS) : 0;
  const shown = run.model && (computedYears >= Math.min(year, run.model.years) || !lastComplete.current) ? run : lastComplete.current || run;
  const model = shown.model;
  const shownYear = model ? Math.min(year, model.years) : 0;
  const frame = useMemo(() => simFrameAt(shown.frames, shownYear), [shown.frames, shownYear]);
  const row = useMemo(() => simRowAt(shown.history, shownYear), [shown.history, shownYear]);

  useEffect(() => {
    const root = document.querySelector('.ve-standalone');
    root?.setAttribute('data-theme', theme);
    simPersistTheme(theme, window.localStorage);
    setPalette(simReadPalette(root));
  }, [theme]);

  useEffect(() => {
    const url = `${window.location.pathname}?${simEncodeScenario(scenario)}`;
    try { window.history.replaceState(null, '', url); } catch (_) { /* file:// or sandboxed frames */ }
  }, [scenario]);

  // One orchestrated moment: the first result plays from injection onwards.
  useEffect(() => {
    if (autoplayed.current || run.frames.length < 2) return;
    autoplayed.current = true;
    if (reducedMotion) setYear(Math.min(run.model.years, run.model.injYears + 70));
    else setPlaying(true);
  }, [run.frames.length, reducedMotion]);

  useEffect(() => {
    if (!playing) return undefined;
    let last = performance.now();
    let frameId;
    const tick = now => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      setYear(current => {
        if (!run.model) return current;
        const step = simNextYear(current, dt, SIM_SPEEDS[speed], { years: run.model.years, computedYears, ready: run.status !== 'computing' });
        if (step.stop) setPlaying(false);
        return step.year;
      });
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [playing, speed, computedYears, run.model, run.status]);

  useEffect(() => {
    const onKey = event => {
      if (section !== 'simulator' || event.target.closest?.('input, select, textarea, button, summary')) return;
      if (event.code === 'Space') { event.preventDefault(); setPlaying(p => !p); }
      if (event.key === 'ArrowRight') setYear(y => Math.min(computedYears, Math.floor(y / SIM_FRAME_YEARS + 1) * SIM_FRAME_YEARS));
      if (event.key === 'ArrowLeft') setYear(y => Math.max(0, Math.ceil(y / SIM_FRAME_YEARS - 1) * SIM_FRAME_YEARS));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [section, computedYears]);

  useEffect(() => {
    if (!sheet) return undefined;
    const onKey = event => { if (event.key === 'Escape') setSheet(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet]);

  const update = patch => setScenario(current => VE2D.normalizeScenario({ ...current, ...patch, preset: 'custom' }));
  const applyPreset = id => {
    if (!VE2D.PRESETS[id]) return;
    setScenario(VE2D.normalizeScenario({ ...VE2D.DEFAULTS, ...VE2D.PRESETS[id].patch, preset: id, grid: scenario.grid }));
    setSectionLine(null);
  };
  const randomise = () => {
    const rng = VE2D.mulberry32((Date.now() & 0xffff) + 17);
    const pick = (min, max, step = 1) => Math.round((min + rng() * (max - min)) / step) * step;
    update({
      seed: pick(1, 999999),
      dipDeg: pick(0.2, 1.4, 0.1),
      dipAz: pick(0, 359),
      domes: pick(0, 3),
      domeRelief: pick(20, 120, 5),
      roughness: pick(0, 15),
      faults: Array.from({ length: pick(0, 2) }, () => ({
        x: pick(4, 16, 0.5), y: pick(3, 9, 0.5), strike: pick(0, 179), length: pick(4, 12, 0.5),
        throw: pick(0, 40), trans: pick(0, 1, 0.05), sealCap: pick(5, 40), kf: pick(0, 60)
      }))
    });
  };

  const play = () => {
    if (!run.model) return;
    const finished = year >= run.model.years - 1e-6 || (run.status !== 'computing' && year >= computedYears);
    if (!playing && finished) setYear(0);
    setPlaying(p => !p);
  };
  const seek = value => { setPlaying(false); setYear(Math.max(0, value)); };

  const copyLink = async () => {
    const ok = await simCopyText(window.location.href, navigator.clipboard);
    setShare(ok ? 'Link copied' : 'Copy the address bar');
    setTimeout(() => setShare('Share'), 2200);
  };
  const exportRef = useRef(null);
  const exportInventory = () => { simDownload(simInventoryCsv(shown.history), 'co2-inventory.csv', 'text/csv'); exportRef.current?.removeAttribute('open'); };
  const exportGrid = () => { if (frame) simDownload(simGridCsv(model, frame), `co2-grid-year-${Math.round(shownYear)}.csv`, 'text/csv'); exportRef.current?.removeAttribute('open'); };
  const exportImage = () => {
    exportRef.current?.removeAttribute('open');
    const canvas = document.querySelector('.sim-view canvas[data-export]');
    if (canvas) { canvas.toBlob(blob => blob && simDownload(blob, `co2-${view}-year-${Math.round(shownYear)}.png`)); return; }
    const svg = document.querySelector('.sim-view svg.sim-view__svg');
    if (svg) simDownload(new XMLSerializer().serializeToString(svg), `co2-section-year-${Math.round(shownYear)}.svg`, 'image/svg+xml');
  };

  const onTabKey = event => {
    const index = SIM_SECTIONS.findIndex(s => s.id === section);
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = SIM_SECTIONS[(index + delta + SIM_SECTIONS.length) % SIM_SECTIONS.length].id;
    setSection(next);
    tabRefs.current[next]?.focus();
  };

  const loadRealization = realization => {
    setScenario(VE2D.normalizeScenario({ ...realization, preset: 'custom' }));
    setSection('simulator');
    setYear(realization.years);
    setPlaying(false);
  };

  const line = sectionLine || (model ? simDefaultSectionLine(model) : null);
  const statusText = run.status === 'computing' ? `Computing… year ${computedYears}` : run.status === 'error' ? 'Run failed' : 'Up to date';
  const viewProps = { model, frame, palette, theme, layers, reducedMotion, scenario: shown.scenario || scenario, year: shownYear, playing };

  return (
    <div className="sim">
      <header className="sim-appbar">
        <div className="sim-title">
          <h1>CO₂ Storage Simulator</h1>
          <p>Vertical-equilibrium model of plume migration, trapping and leakage in a saline aquifer</p>
        </div>
        <div className="sim-sections" role="tablist" aria-label="Simulator sections" onKeyDown={onTabKey}>
          {SIM_SECTIONS.map(item => (
            <button key={item.id} id={`sim-tab-${item.id}`} ref={el => { tabRefs.current[item.id] = el; }} type="button" role="tab"
              aria-selected={section === item.id} aria-controls={`sim-panel-${item.id}`} tabIndex={section === item.id ? 0 : -1}
              onClick={() => setSection(item.id)}>{item.label}</button>
          ))}
        </div>
        <div className="sim-actions">
          <span className="sim-status-pill" data-state={run.status} role="status">{statusText}</span>
          {section === 'simulator' && <button type="button" className="sim-button sim-inputs-trigger" onClick={() => setSheet('inputs')} aria-expanded={sheet === 'inputs'} aria-controls="sim-inputs"><i className="fas fa-sliders" aria-hidden="true" /><span className="sim-button__label">Inputs</span></button>}
          <button type="button" className="sim-button" onClick={copyLink} aria-label="Copy a link to this scenario"><i className="fas fa-link" aria-hidden="true" /><span className="sim-button__label">{share}</span></button>
          <details className="sim-menu" ref={exportRef}>
            <summary className="sim-button" aria-label="Export"><i className="fas fa-download" aria-hidden="true" /><span className="sim-button__label">Export</span></summary>
            <div className="sim-menu__panel">
              <button type="button" onClick={exportInventory}>Inventory through time <small>CSV</small></button>
              <button type="button" onClick={exportGrid} disabled={!frame}>Grid at this year <small>CSV</small></button>
              <button type="button" onClick={exportImage}>Current view <small>{view === 'section' ? 'SVG' : 'PNG'}</small></button>
            </div>
          </details>
          <button type="button" className="sim-icon-button" onClick={() => setTheme(t => t === 'night' ? 'day' : 'night')} aria-label={theme === 'night' ? 'Switch to the day theme' : 'Switch to the night theme'}>
            <i className="fas fa-circle-half-stroke" aria-hidden="true" />
          </button>
        </div>
      </header>

      {section === 'simulator' && (
        <div className="sim-workbench" id="sim-panel-simulator" role="tabpanel" aria-labelledby="sim-tab-simulator">
          <aside className="sim-rail sim-rail--inputs" id="sim-inputs" data-open={sheet === 'inputs'} aria-label="Scenario inputs">
            <SimInputs scenario={scenario} onChange={update} onPreset={applyPreset} onRandom={randomise} onClose={() => setSheet(null)} />
          </aside>
          <div className="sim-sheet-backdrop" data-open={sheet === 'inputs'} onClick={() => setSheet(null)} aria-hidden="true" />
          <section className="sim-stage" aria-label="Reservoir views">
            <div className="sim-view">
              {model && view === 'map' && <SimMapView {...viewProps} line={line} onLine={setSectionLine} onWell={(x, y) => update({ wellX: x, wellY: y })} />}
              {model && view === '3d' && <SimBlockView {...viewProps} />}
              {model && view === 'section' && <SimSectionView {...viewProps} line={line} />}
              {!model && <div className="sim-view-note" style={{ top: '45%', left: 0, right: 0, textAlign: 'center' }}>{run.status === 'error' ? run.error : 'Building the reservoir model…'}</div>}
              <div className="sim-overlay">
                <div className="sim-segmented" role="group" aria-label="View">
                  {SIM_VIEWS.map(item => <button key={item.id} type="button" aria-pressed={view === item.id} onClick={() => setView(item.id)}>{item.label}</button>)}
                </div>
                <div className="sim-overlay__right">
                  {view !== 'section' && <SimLayersMenu layers={layers} onChange={setLayers} view={view} />}
                </div>
              </div>
              {model && <SimLegend view={view} layers={layers} model={model} />}
            </div>
            <SimTransport year={shownYear} years={model?.years || scenario.years} injYears={model?.injYears || scenario.injYears} computedYears={computedYears}
              playing={playing} speed={speed} onPlay={play} onSeek={seek} onSpeed={() => setSpeed(s => (s + 1) % SIM_SPEEDS.length)} />
          </section>
          <aside className="sim-rail sim-rail--outcomes" aria-label="Outcomes">
            <SimOutcomes model={model} row={row} frame={frame} run={shown} history={shown.history} year={shownYear} onSeek={seek} />
          </aside>
        </div>
      )}
      <SimUncertainty scenario={scenario} onLoad={loadRealization} theme={theme} hidden={section !== 'uncertainty'} />
      {section === 'method' && (
        <div className="sim-method" id="sim-panel-method" role="tabpanel" aria-labelledby="sim-tab-method">
          <GuidePage />
        </div>
      )}
    </div>
  );
};

Object.assign(window, { SimulatorPage });
