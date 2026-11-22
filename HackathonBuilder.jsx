// HackathonBuilder.jsx — "Build your own plant" on the GeoHackathon page.
// The visitor picks the main choices of a plant. The page finds that plant in the 720-plant screen
// (HACK_DATA.screen, all on one basis: KNMI 2025 weather, staggered 35-day stops, CO₂ at €80/t)
// and compares it with our pick, the cheapest plant of the screen and the plants the LLM agents picked.
// Every top-level name starts with "hk" or "Hk", because the site bundle shares the global scope.

const { useState, useMemo } = React;

// ---- the engine. Now: a lookup in the static screen. Later: a live mode can replace run() with the
// real models (for example gemini_design in the browser through Pyodide) and keep the same interface.
const HK_DEPTHS = [2500, 2800, 3100, 3200, 3400, 4000];
const HK_CHILLERS = [
  { id: 'absorption', label: 'Absorption', sub: 'driven by hot brine' },
  { id: 'legacy', label: 'Legacy electric', sub: 'old COP' },
  { id: 'screw', label: 'Screw + dry cooler', sub: 'electric' },
  { id: 'tower', label: 'Centrifugal + tower', sub: 'electric, uses water' },
  { id: 'air', label: 'Air-cooled screw', sub: 'electric' },
];
// screen cooling option index for (chiller, free cooling, aquifer store); see coolOptions in hackathon-data.js
const hkCoolIndex = (chiller, fc, ates) => {
  if (chiller === 'absorption') return 0;
  const base = { legacy: 1, screw: 2, tower: 3, air: 4 }[chiller];
  if (!fc) return base;
  if (chiller === 'air' && ates) return 9;
  return base + 4;
};

const HK_BUILDER_ENGINE = {
  mode: 'lookup',
  // design: { doublets, depth, heatPump, chp, chiller, freeCooling, ates }
  run(design) {
    const notes = [];
    let { depth, chiller, freeCooling, ates } = design;
    const snappedDepth = HK_DEPTHS.reduce((best, d) => (Math.abs(d - depth) < Math.abs(best - depth) ? d : best), HK_DEPTHS[0]);
    if (snappedDepth !== depth) notes.push(`Well depth snapped from ${hkFmt(depth)} m to ${hkFmt(snappedDepth)} m, the nearest simulated depth.`);
    if (chiller === 'absorption' && (freeCooling || ates)) {
      notes.push('Free cooling and the aquifer store were simulated with electric chillers only, so they are left out here.');
      freeCooling = false; ates = false;
    }
    if (ates && !(chiller === 'air' && freeCooling)) {
      notes.push('The aquifer store was simulated with the air-cooled chiller and free cooling, so those are switched on.');
      chiller = 'air'; freeCooling = true;
    }
    const cool = hkCoolIndex(chiller, freeCooling, ates);
    const i = HACK_DATA.screen.findIndex(p => p[0] === design.doublets && p[1] === snappedDepth && p[2] === (design.heatPump ? 1 : 0) && p[3] === (design.chp ? 1 : 0) && p[4] === cool);
    return { index: i, row: HACK_DATA.screen[i], notes, used: { ...design, depth: snappedDepth, chiller, freeCooling, ates } };
  },
};

const HK_PRESETS = [
  { label: 'Our pick', design: { doublets: 2, depth: 3200, heatPump: false, chp: true, chiller: 'air', freeCooling: true, ates: true } },
  { label: 'Cheapest in the screen', design: { doublets: 2, depth: 3100, heatPump: false, chp: true, chiller: 'screw', freeCooling: false, ates: false } },
  { label: 'The brief as given', design: { doublets: 1, depth: 2500, heatPump: false, chp: false, chiller: 'absorption', freeCooling: false, ates: false } },
  { label: 'All-electric', design: { doublets: 2, depth: 2800, heatPump: true, chp: false, chiller: 'screw', freeCooling: true, ates: false } },
];

// The LLM picks: rebuilt on our basis from each model's own tool calls (HACK_DATA.picks), or, for the
// 21 Nov models, taken from their own B1 runs (same brief prices, but not rebuilt).
const hkLlmPicks = () => {
  const rebuilt = HACK_DATA.picks.filter(p => p.model !== 'Our pick').map(p => ({
    name: p.model, q: p.question.replace(' (candidate)', ''), lcoe: p.lcoe, co2: p.co2 / 1000, passed: p.passed, rebuilt: true,
    design: `${p.doublets} doublet${p.doublets > 1 ? 's' : ''} at ${hkFmt(p.depth)} m · ${p.boiler} MW boiler`,
  }));
  const own = [['sol62', 'GPT-6.2 Sol', 759], ['sonnet55', 'Claude Sonnet 5.5', 239], ['hydrogen', 'Gemini 4 Hydrogen', 916]]
    .filter(([k]) => HACK_DATA.agents[k])
    .map(([k, name, id]) => {
      const p = HACK_DATA.agents[k].pts.find(q => q[6] === id);
      return p && { name, q: 'B1', lcoe: p[2], co2: p[1], rebuilt: false, design: `R${String(id).padStart(4, '0')}, from its own run` };
    }).filter(Boolean);
  return [...rebuilt, ...own];
};

const HkSeg = ({ label, value, options, onChange }) => (
  <div className="hk-bld__field">
    <span className="hk-bld__label">{label}</span>
    <div className="hk-seg" role="radiogroup" aria-label={label}>
      {options.map(([v, text, sub]) => (
        <button key={String(v)} type="button" role="radio" aria-checked={value === v} className={`hk-seg__opt${value === v ? ' is-on' : ''}`} onClick={() => onChange(v)}>
          {text}{sub && <small>{sub}</small>}
        </button>
      ))}
    </div>
  </div>
);

const HkToggle = ({ label, sub, checked, onChange, disabled }) => (
  <label className={`hk-tog${checked ? ' is-on' : ''}${disabled ? ' is-off' : ''}`}>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={e => onChange(e.target.checked)} />
    <span className="hk-tog__sw" aria-hidden="true" />
    <span><strong>{label}</strong>{sub && <small>{sub}</small>}</span>
  </label>
);

// A small drawing of the plant that follows the choices.
const HkBuilderSketch = ({ d }) => {
  const top = 44;
  const y = km => top + km * 30;
  const wellY = y(d.depth / 1000);
  const xs = d.doublets === 1 ? [220] : d.doublets === 2 ? [180, 260] : [150, 220, 290];
  const temp = Math.round(12 + 30 * d.depth / 1000);
  const parts = [
    [d.heatPump ? 'heat pump' : 'gas boiler', ''],
    ...(d.chp ? [['CHP', 'hk-c-heat']] : []),
    [d.chiller === 'absorption' ? 'absorption' : 'chiller', 'hk-c-cool'],
    ...(d.freeCooling ? [['free cooling', 'hk-c-cool']] : []),
  ];
  return (
    <svg viewBox="0 0 440 180" className="hk-bld__sketch" aria-hidden="true">
      <rect x="0" y="0" width="440" height={top} className="hk-bld__sky" />
      <rect x="0" y={top} width="440" height={180 - top} className="hk-bld__ground" />
      <rect x="0" y={wellY - 5} width="440" height="10" className="hk-bld__res" />
      <text x="432" y={wellY - 9} textAnchor="end" className="hk-bld__t hk-c-heat">{temp} °C at {(d.depth / 1000).toFixed(2)} km</text>
      {xs.map(x => (
        <g key={x}>
          <path d={`M${x - 7} ${top - 6} L${x - 7} ${wellY}`} className="hk-bld__well hk-bld__well--hot" />
          <path d={`M${x + 7} ${top - 6} L${x + 7} ${wellY}`} className="hk-bld__well hk-bld__well--cold" />
        </g>
      ))}
      <rect x="44" y="8" width="352" height="24" rx="5" className="hk-bld__plant" />
      {parts.map(([t, c], i) => <text key={t} x={44 + 352 / parts.length * (i + 0.5)} y="24" textAnchor="middle" className={`hk-bld__t ${c}`}>{t}</text>)}
      {d.ates && <g><path d={`M70 ${top - 6} L70 ${y(0.25)} M84 ${top - 6} L84 ${y(0.25)}`} className="hk-bld__well hk-bld__well--cold" /><text x="92" y={y(0.25)} className="hk-bld__t hk-c-cool">ATES</text></g>}
      {[1, 2, 3, 4].map(km => <text key={km} x="6" y={y(km) + 3} className="hk-bld__axis">{km} km</text>)}
    </svg>
  );
};

const HkBuilder = () => {
  const [design, setDesign] = useState(HK_PRESETS[0].design);
  const [hover, setHover] = useState(null);
  const set = patch => setDesign(d => ({ ...d, ...patch }));
  const result = useMemo(() => HK_BUILDER_ENGINE.run(design), [design]);
  const { screen } = HACK_DATA;
  const row = result.row;
  const valid = screen.filter(p => p[5]);
  const optimum = valid.reduce((b, p) => (!b || p[6] < b[6] ? p : b), null);
  const ourIdx = HK_BUILDER_ENGINE.run(HK_PRESETS[0].design).index;
  const ours = screen[ourIdx];
  const rank = row ? valid.filter(p => p[6] < row[6]).length : 0;
  const picks = useMemo(hkLlmPicks, []);
  const W = 640, H = 380, L = 50, R = 14, T = 14, B = 40;
  const x = hkScale(3.5, 14.5, L, W - R);
  const y = hkScale(30, 50, H - B, T);
  const clampY = v => Math.max(30, Math.min(50, v));
  const diff = (a, b) => `${a - b >= 0 ? '+' : '−'}€${Math.abs(a - b).toFixed(2)}`;
  return (
    <div className="hk-bld">
      <div className="hk-bld__controls">
        <div className="hk-bld__presets">
          <span className="hk-bld__label">Start from</span>
          {HK_PRESETS.map(p => <button key={p.label} type="button" className="hk-chip" onClick={() => setDesign(p.design)}>{p.label}</button>)}
        </div>
        <HkSeg label="Doublets" value={design.doublets} onChange={v => set({ doublets: v })} options={[[1, '1'], [2, '2'], [3, '3']]} />
        <div className="hk-bld__field">
          <span className="hk-bld__label">Well depth <b>{hkFmt(design.depth)} m</b> <small>· {Math.round(12 + 30 * design.depth / 1000)} °C brine</small></span>
          <input type="range" min="2500" max="4000" step="50" value={design.depth} onChange={e => set({ depth: +e.target.value })} aria-label="Well depth in metres" />
          <div className="hk-bld__ticks" aria-hidden="true">{HK_DEPTHS.map(d => <i key={d} style={{ left: `${(d - 2500) / 1500 * 100}%` }} title={`${d} m`} />)}</div>
        </div>
        <HkSeg label="Heat top-up to 100 °C" value={design.heatPump} onChange={v => set({ heatPump: v })} options={[[false, 'Gas boiler'], [true, 'Heat pump']]} />
        <HkToggle label="CHP on the co-produced gas" sub="burns the gas that comes up with the brine" checked={design.chp} onChange={v => set({ chp: v })} />
        <div className="hk-bld__field">
          <span className="hk-bld__label">Chiller</span>
          <div className="hk-seg hk-seg--wrap" role="radiogroup" aria-label="Chiller">
            {HK_CHILLERS.map(c => (
              <button key={c.id} type="button" role="radio" aria-checked={design.chiller === c.id} className={`hk-seg__opt${design.chiller === c.id ? ' is-on' : ''}`} onClick={() => set({ chiller: c.id })}>
                {c.label}<small>{c.sub}</small>
              </button>
            ))}
          </div>
        </div>
        <HkToggle label="Free cooling" sub="outdoor air on cool days" checked={design.freeCooling} onChange={v => set({ freeCooling: v, ates: v ? design.ates : false })} disabled={design.chiller === 'absorption'} />
        <HkToggle label="Aquifer cold store (ATES)" sub="3 well pairs, charged by winter air" checked={design.ates} onChange={v => set(v ? { ates: true, chiller: 'air', freeCooling: true } : { ates: false })} disabled={design.chiller === 'absorption'} />
        <HkBuilderSketch d={result.used} />
      </div>

      <div className="hk-bld__out">
        {row && (
          <div className={`hk-bld__result${row[5] ? ' is-ok' : ' is-bad'}`} aria-live="polite">
            <p className="hk-bld__verdict">{row[5] ? '✓ Meets every rule on every day' : `✕ Misses ${hkFmt(row[9], 1)} MWh of cooling`}</p>
            <div className="hk-bld__kpis">
              <div><strong>€{row[6].toFixed(2)}</strong><span>per MWh</span></div>
              <div><strong>{row[7].toFixed(2)}</strong><span>kt CO₂ a year</span></div>
              <div><strong>€{row[8].toFixed(1)} M</strong><span>to build</span></div>
              <div><strong>{hkFmt(row[10])}</strong><span>MWh gas bought</span></div>
            </div>
            <p className="hk-bld__cmp">
              {row[5] ? <span>Cheaper than {Math.round((1 - rank / valid.length) * 100)} % of the {valid.length} plants that meet every rule. </span> : null}
              Against our pick: <b>{diff(row[6], ours[6])}/MWh</b>, <b>{row[7] - ours[7] >= 0 ? '+' : '−'}{Math.abs(row[7] - ours[7]).toFixed(2)} kt CO₂</b>.
              {' '}Against the cheapest plant of the screen: <b>{diff(row[6], optimum[6])}/MWh</b>.
            </p>
            {result.notes.map(n => <p key={n} className="hk-bld__snap">↳ {n}</p>)}
          </div>
        )}
        <figure className="hk-figure hk-bld__fig">
          <svg viewBox={`0 0 ${W} ${H}`} className="hk-chart" role="img" aria-label="Your plant on cost against CO2, next to the other 719 plants, our pick, the cheapest plant of the screen and the LLM picks.">
            {[30, 35, 40, 45, 50].map(v => <g key={v} className="hk-grid"><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} /><text x={L - 8} y={y(v) + 4} textAnchor="end">{v}</text></g>)}
            {[4, 6, 8, 10, 12, 14].map(v => <g key={v} className="hk-grid"><text x={x(v)} y={H - B + 18} textAnchor="middle">{v}</text></g>)}
            <text className="hk-axis-title" x={(L + W) / 2} y={H - 6} textAnchor="middle">CO₂, kt a year</text>
            <text className="hk-axis-title" x="13" y={(T + H - B) / 2} textAnchor="middle" transform={`rotate(-90 13 ${(T + H - B) / 2})`}>€ per MWh</text>
            <g className="hk-bld__cloud">{screen.map((p, i) => p[6] <= 50 && <circle key={i} cx={x(p[7])} cy={y(p[6])} r="2.2" className={p[5] ? '' : 'is-bad'} />)}</g>
            {picks.map((p, i) => (
              <g key={i} className={`hk-bld__llm${p.rebuilt ? '' : ' is-own'}`} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
                <rect x={x(p.co2) - 5} y={y(clampY(p.lcoe)) - 5} width="10" height="10" transform={`rotate(45 ${x(p.co2)} ${y(clampY(p.lcoe))})`} />
              </g>
            ))}
            <g className="hk-bld__opt"><circle cx={x(optimum[7])} cy={y(optimum[6])} r="7" /><text x={x(optimum[7]) + 11} y={y(optimum[6]) + 16}>cheapest in the screen</text></g>
            <g className="hk-star"><path transform={`translate(${x(ours[7])} ${y(ours[6])})`} d="M0 -12 L3.5 -3.8 L11.4 -3.7 L5.2 1.6 L7.3 9.8 L0 5.2 L-7.3 9.8 L-5.2 1.6 L-11.4 -3.7 L-3.5 -3.8 Z" />{result.index !== ourIdx && <text x={x(ours[7]) - 14} y={y(ours[6]) + 4} textAnchor="end" className="hk-star__label">our pick</text>}</g>
            {row && row[6] <= 50 && (
              <g className="hk-bld__you" key={result.index}>
                <circle cx={x(row[7])} cy={y(row[6])} r="13" className="hk-bld__you-ring" />
                <circle cx={x(row[7])} cy={y(row[6])} r="6" className="hk-bld__you-dot" />
                <text x={x(row[7]) + 18} y={y(row[6]) - 10}>{result.index === ourIdx ? 'your plant = our pick' : result.index === screen.indexOf(optimum) ? 'your plant = the cheapest' : 'your plant'}</text>
              </g>
            )}
            {row && row[6] > 50 && <text x={W - R - 6} y={T + 14} textAnchor="end" className="hk-bld__off">your plant is off the chart: €{row[6].toFixed(2)}/MWh</text>}
          </svg>
          {hover !== null && (
            <div className="hk-tip hk-tip--float" style={{ left: `${x(picks[hover].co2) / W * 100}%`, top: `${y(clampY(picks[hover].lcoe)) / H * 100}%` }}>
              <strong>{picks[hover].name} · {picks[hover].q}</strong>
              <span>{picks[hover].design}</span>
              <span>€{picks[hover].lcoe.toFixed(2)}/MWh · {picks[hover].co2.toFixed(2)} kt CO₂</span>
              {picks[hover].rebuilt ? <span>meets {picks[hover].passed} of our 13 stress tests</span> : <span className="hk-muted">from its own run, not rebuilt on our basis</span>}
            </div>
          )}
          <div className="hk-legend hk-legend--small">
            <span className="hk-key hk-key--you">your plant</span>
            <span className="hk-key hk-key--star">our pick</span>
            <span className="hk-key hk-key--opt">cheapest plant in the screen</span>
            <span className="hk-key hk-key--llm">an LLM’s pick, rebuilt on our basis</span>
            <span className="hk-key hk-key--llmown">an LLM’s pick from its own run</span>
          </div>
          <figcaption>
            The grey cloud is the 720-plant screen. Most LLM picks sit below it on cost: they also tune boiler size, return temperatures and pumps, which the screen holds fixed,
            and most of them drop the backup that our stress tests need. Move over a diamond to see its tests.
          </figcaption>
        </figure>
      </div>
    </div>
  );
};

const HkBuild = () => (
  <HkSection id="build" kicker="02b · Your turn" title="Build your own plant"
    intro="Choose the main parts of a plant. The page finds the same plant among the 720 that I simulated, each for a full year on the same basis, and shows its cost, its CO₂ and whether it meets demand. If you choose something that was not simulated, the page uses the nearest simulated plant and says so.">
    <HkBuilder />
  </HkSection>
);

Object.assign(window, { HkBuild, HK_BUILDER_ENGINE });
