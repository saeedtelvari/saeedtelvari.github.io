// HackathonAgent.jsx — the agent sections of the GeoHackathon page: the workflow flowchart and the two live runs.
// It uses the helpers of HackathonPage.jsx (hkReduced, hkFmt, hkScale, useHkSeen, HkReveal, HkCount, HkSection).
// Every top-level name starts with "hk" or "Hk", because the site bundle shares the global scope.

const { useState, useEffect, useRef, useMemo } = React;

// ---- small pictograms, drawn in a 24 x 24 box with the current colour
const HK_GLYPHS = {
  brief: 'M6 3h9l4 4v14H6z M15 3v4h4 M9 11h7 M9 14h7 M9 17h5',
  weather: 'M8 15a4 4 0 1 1 1-7.9 5 5 0 0 1 9.6 2A3.5 3.5 0 0 1 18 16H8z M5 19l-1 2 M10 19l-1 2 M15 19l-1 2',
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 3.6-7 8-7s8 3 8 7',
  chip: 'M7 7h10v10H7z M10 3v4 M14 3v4 M10 17v4 M14 17v4 M3 10h4 M3 14h4 M17 10h4 M17 14h4 M10 10h4v4h-4z',
  tools: 'M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8 6.2 21l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.5 2.5-2.2-.6-.6-2.2z',
  sim: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v3 M12 19v3 M4.9 4.9l2.1 2.1 M17 17l2.1 2.1 M2 12h3 M19 12h3 M4.9 19.1L7 17 M17 7l2.1-2.1',
  shield: 'M12 3l8 3v6c0 4.6-3.4 8.3-8 9-4.6-.7-8-4.4-8-9V6z M8.5 12l2.5 2.5 4.5-5',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
  curve: 'M3 20h18 M4 19c3 0 4-13 8-13s5 13 8 13 M12 6v13',
  memory: 'M5 5h14v4H5z M5 10h14v4H5z M5 15h14v4H5z M8 7h.01 M8 12h.01 M8 17h.01',
  sandbox: 'M4 7l8-4 8 4v10l-8 4-8-4z M4 7l8 4 8-4 M12 11v10',
  drill: 'M9 2h6v4H9z M12 6v6 M8 12h8l-2 10h-4z',
  flame: 'M12 21c-4 0-7-3-7-7 0-4 4-6 4-10 3 2 5 4 5 7 1-1 2-2 2-4 2 2 3 4 3 7 0 4-3 7-7 7z',
  snow: 'M12 2v20 M4 7l16 10 M20 7L4 17 M9 3l3 3 3-3 M9 21l3-3 3 3',
  calendar: 'M4 6h16v15H4z M4 10h16 M8 3v5 M16 3v5 M8 14h3v3H8z',
  gas: 'M7 21V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v16 M5 21h12 M15 9h2a2 2 0 0 1 2 2v5a1 1 0 0 0 2 0V8l-3-3',
  wind: 'M3 9h11a3 3 0 1 0-3-3 M3 14h15a3 3 0 1 1-3 3 M3 19h7',
  doublet: 'M7 3v13c0 3 2 5 5 5s5-2 5-5V3 M5 6l2-3 2 3 M15 18l2 3 2-3',
  coin: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M15 9a3 3 0 0 0-5.6 1.5V14 M8 12h5 M8 14.5h5 M9.5 17H15',
  scale: 'M12 3v18 M5 21h14 M4 8h16 M7 8l-3 6a3 3 0 0 0 6 0z M17 8l-3 6a3 3 0 0 0 6 0z',
};

const HkGlyph = ({ name, size = 20, className = '' }) => (
  <svg className={`hk-glyph ${className}`} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d={HK_GLYPHS[name]} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// A glyph placed inside an SVG figure.
const HkSvgGlyph = ({ name, x, y, size = 22, className = '' }) => (
  <g transform={`translate(${x} ${y}) scale(${size / 24})`} className={`hk-svgglyph ${className}`}>
    <path d={HK_GLYPHS[name]} fill="none" stroke="currentColor" strokeWidth={1.7 * 24 / size} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

// ---- 4. the agent: the workflow as a flowchart, like the submitted diagram
const HK_TOOL_GROUPS = [
  ['Simulate', ['run_design', 'screen', 'sensitivity', 'stress_test', 'cross_check', 'reservoir_simulation'], 'sim'],
  ['Inspect + decide', ['describe_inputs', 'list_models', 'get_run', 'compare_runs', 'log_option'], 'plain'],
  ['Extend', ['write_model'], 'gate'],
  ['Talk + remember', ['ask_user', 'memory_read', 'memory_write'], 'plain'],
];
const HK_GATES = [['2', 'Hard rules', 'every day'], ['3', 'Energy balance', 'closes to 0.1 %'], ['4', 'Second solver', 'GEMINI’s solver, 0.5 K'], ['5', 'Sanity bounds', 'Carnot, T order, pumps']];

// The packet's routes in the figure (viewBox 1200 x 660).
const HK_ROUTES = {
  ask: 'M205 470 L246 470',
  think: 'M360 300 L360 250',
  call: 'M474 236 L562 236',
  tool: 'M650 250 L650 252',
  sim: 'M738 160 L776 160 L776 175',
  chain: 'M842 140 L842 330',
  gate: 'M1016 300 L1016 572 L1000 572',
  fail: 'M566 600 L358 600 L358 528',
  answer: 'M360 64 L360 34 L1110 34 L1110 64',
};
const HK_FLOW_STEPS = [
  { at: ['engineer'], route: 'ask', n: 1, say: 'The engineer asks one question in plain words: which design meets demand at the lowest cost and CO₂?' },
  { at: ['agent'], route: 'think', say: 'The LLM plans the study. It reads the brief and the weather, and its memory of earlier runs. It never writes a number itself.' },
  { at: ['gate1', 'tools'], route: 'call', n: 2, say: 'It calls a tool: run_design with 2 doublets at 3.2 km, CHP and a 33 MW boiler. Gate 1 checks every argument first.' },
  { at: ['sim'], route: 'sim', n: 3, say: 'Deterministic models run the plant for all 365 days: the doublets, the daily flowsheet, the dispatch and the economics, on GEMINI’s component models.' },
  { at: ['gatebar'], route: 'gate', n: 4, gates: { 2: 'ok', 3: 'fail' }, say: 'Gates 2 to 5 check the run. Here the energy balance does not close, so the run is rejected.' },
  { at: ['agent'], route: 'fail', fail: true, gates: { 2: 'ok', 3: 'fail' }, say: 'The rejection goes back to the LLM with its reason. The run cannot be cited. The agent changes the design and calls the tool again.' },
  { at: ['gate1', 'tools', 'sim'], route: 'chain', n: 3, say: 'A new full year, day by day. Screens can run 720 such plants in one call.' },
  { at: ['gatebar'], route: 'gate', n: 4, gates: { 2: 'ok', 3: 'ok', 4: 'ok', 5: 'ok' }, say: 'This time every gate passes. The run goes into the ledger, and now it can be cited.' },
  { at: ['gate6', 'answer'], route: 'answer', n: 5, say: 'Gate 6 traces every number in the answer back to a run, with its unit. Only then does the engineer see the design.' },
];

const HkFlowchart = () => {
  const [ref, seen] = useHkSeen(0.25);
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!seen || paused || hkReduced()) return undefined;
    const t = setInterval(() => setStep(s => (s + 1) % HK_FLOW_STEPS.length), 3200);
    return () => clearInterval(t);
  }, [seen, paused]);
  const cur = HK_FLOW_STEPS[step];
  const on = id => (cur.at.includes(id) ? ' is-on' : '');
  const gateState = n => (cur.gates && cur.gates[n]) || '';
  const box = (x, y, w, h, cls, rx = 12) => <rect x={x} y={y} width={w} height={h} rx={rx} className={cls} />;
  return (
    <figure ref={ref} className={`hk-flowchart${seen ? ' is-in' : ''}${paused ? ' is-paused' : ''}`}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="hk-flowchart__scroll">
        <svg viewBox="0 0 1200 660" className="hk-fc" role="img" aria-labelledby="hk-fc-title hk-fc-desc">
          <title id="hk-fc-title">How the design agent works</title>
          <desc id="hk-fc-desc">The engineer asks the design agent. The LLM calls 15 tools; gate 1 checks the arguments. Deterministic models on GEMINI run the plant for a year. Gates 2 to 5 check every run and send failures back to the LLM. Gate 6 checks that every number in the answer traces to a run.</desc>
          <defs>
            <marker id="hk-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="context-stroke" />
            </marker>
            <filter id="hk-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter>
          </defs>

          {/* arrows */}
          <g className="hk-fc__wires">
            <path d="M205 140 L246 140" className="hk-wire" markerEnd="url(#hk-ar)" />
            <path d="M205 275 L246 275" className="hk-wire" markerEnd="url(#hk-ar)" />
            <path d="M205 470 L246 470" className="hk-wire hk-wire--strong" markerEnd="url(#hk-ar)" />
            <path d="M246 500 L205 500" className="hk-wire hk-wire--dash" markerEnd="url(#hk-ar)" />
            <path d="M474 236 L562 236" className="hk-wire hk-wire--strong" markerEnd="url(#hk-ar)" />
            <path d="M738 160 L770 160" className="hk-wire hk-wire--blue" markerEnd="url(#hk-ar)" />
            <path d="M738 376 L770 376" className="hk-wire hk-wire--blue" markerEnd="url(#hk-ar)" />
            <path d="M738 448 L770 448" className="hk-wire hk-wire--rust" markerEnd="url(#hk-ar)" />
            <path d="M1016 300 L1016 540" className="hk-wire hk-wire--blue" markerEnd="url(#hk-ar)" />
            <path d="M566 600 L358 600 L358 530" className="hk-wire hk-wire--rust" markerEnd="url(#hk-ar)" />
            <path d="M360 64 L360 34 L1110 34 L1110 60" className="hk-wire hk-wire--rust" markerEnd="url(#hk-ar)" />
            <path d="M1110 352 L1110 336" className="hk-wire hk-wire--blue" markerEnd="url(#hk-ar)" />
            <text x="352" y="624" textAnchor="end" className="hk-fc__note"><tspan className="hk-fc__pass">pass → run ledger, citable</tspan></text>
            <text x="352" y="642" textAnchor="end" className="hk-fc__note"><tspan className="hk-fc__fail">fail → error back to the LLM</tspan></text>
          </g>

          {/* inputs */}
          <g className={`hk-node2${on('brief')}`}>
            {box(10, 64, 195, 150, 'hk-fc__card')}
            <HkSvgGlyph name="brief" x={24} y={78} />
            <text x="54" y="96" className="hk-fc__h">Challenge brief</text>
            <text x="24" y="124" className="hk-fc__t">Daily heating + cooling,</text>
            <text x="24" y="142" className="hk-fc__t">2027, 365 days</text>
            <text x="24" y="164" className="hk-fc__t">Reservoir, brine, gas</text>
            <text x="24" y="186" className="hk-fc__t hk-fc__t--muted">1–3 doublets · ΔT ≤ 40 K</text>
            <text x="24" y="203" className="hk-fc__t hk-fc__t--muted">≤ 330 days per doublet</text>
          </g>
          <g className={`hk-node2${on('weather')}`}>
            {box(10, 230, 195, 100, 'hk-fc__card')}
            <HkSvgGlyph name="weather" x={24} y={244} />
            <text x="54" y="262" className="hk-fc__h">Weather year</text>
            <text x="24" y="290" className="hk-fc__t">KNMI Schiphol, daily</text>
            <text x="24" y="310" className="hk-fc__t hk-fc__t--muted">chiller lift, free cooling</text>
          </g>
          <g className={`hk-node2${on('engineer')}`}>
            {box(10, 412, 195, 124, 'hk-fc__card hk-fc__card--white')}
            <HkSvgGlyph name="person" x={24} y={424} />
            <text x="54" y="442" className="hk-fc__h">Engineer</text>
            <text x="24" y="468" className="hk-fc__t hk-fc__t--quote">“Which design meets</text>
            <text x="24" y="485" className="hk-fc__t hk-fc__t--quote">demand at the lowest</text>
            <text x="24" y="502" className="hk-fc__t hk-fc__t--quote">cost and CO₂?”</text>
            <text x="24" y="524" className="hk-fc__t hk-fc__t--muted">answers ask_user questions</text>
          </g>

          {/* the design agent */}
          <g className={`hk-node2${on('agent')}`}>
            {box(246, 64, 228, 466, 'hk-fc__agent', 16)}
            <HkSvgGlyph name="chip" x={262} y={80} size={26} className="hk-c-accent" />
            <text x="296" y="100" className="hk-fc__h hk-fc__h--big">Design agent</text>
            {box(260, 120, 200, 168, 'hk-fc__inner', 10)}
            <text x="274" y="144" className="hk-fc__h hk-fc__h--accent">Swappable LLM</text>
            <text x="274" y="168" className="hk-fc__t hk-fc__t--white">DeepSeek V4.1 Flash <tspan className="hk-fc__accent">default</tspan></text>
            <text x="274" y="190" className="hk-fc__t hk-fc__t--white">GLM 5.3 · Qwen 3.8 27B</text>
            <text x="274" y="212" className="hk-fc__t hk-fc__t--white">GPT-6.1 Sol · Terra</text>
            <text x="274" y="234" className="hk-fc__t hk-fc__t--white">GPT-6 Luna</text>
            <text x="274" y="262" className="hk-fc__t hk-fc__t--muted">same tools and gate for all</text>
            <text x="274" y="278" className="hk-fc__t hk-fc__t--muted">open weights by default</text>
            <text x="262" y="316" className="hk-fc__t hk-fc__t--white">Plans the study, calls tools,</text>
            <text x="262" y="336" className="hk-fc__t hk-fc__t--white">retries when a gate rejects,</text>
            <text x="262" y="356" className="hk-fc__t hk-fc__t--white">explains.</text>
            {box(260, 378, 200, 132, 'hk-fc__inner', 10)}
            <HkSvgGlyph name="memory" x={274} y={390} size={18} className="hk-c-accent" />
            <text x="298" y="404" className="hk-fc__h hk-fc__h--accent">Memory</text>
            <text x="274" y="430" className="hk-fc__mono">scratchpad <tspan className="hk-fc__dim">per question</tspan></text>
            <text x="274" y="452" className="hk-fc__mono">run ledger <tspan className="hk-fc__dim">reused runs</tspan></text>
            <text x="274" y="474" className="hk-fc__mono">project notes <tspan className="hk-fc__dim">kept</tspan></text>
            <text x="274" y="497" className="hk-fc__t hk-fc__t--muted">only gated runs can be cited</text>
          </g>

          {/* gate 1 */}
          <g className={`hk-node2 hk-fc__gate1${on('gate1')}`}>
            <rect x="488" y="252" width="64" height="44" rx="10" className="hk-fc__gatepill" />
            <text x="520" y="271" textAnchor="middle" className="hk-fc__gt">Gate 1</text>
            <text x="520" y="287" textAnchor="middle" className="hk-fc__gs">valid inputs</text>
          </g>

          {/* 15 tools */}
          <g className={`hk-node2${on('tools')}`}>
            {box(562, 64, 176, 466, 'hk-fc__card hk-fc__card--white', 14)}
            <HkSvgGlyph name="tools" x={576} y={78} />
            <text x="606" y="96" className="hk-fc__h">15 tools</text>
            {(() => {
              let y = 118;
              const out = [];
              for (const [group, names, tone] of HK_TOOL_GROUPS) {
                out.push(<text key={group} x="576" y={y + 4} className="hk-fc__group">{group.toUpperCase()}</text>);
                y += 12;
                for (const name of names) {
                  out.push(<g key={name}><rect x="574" y={y} width="152" height="19" rx="5" className={`hk-fc__tool hk-fc__tool--${tone}`} /><text x="582" y={y + 13.5} className="hk-fc__mono hk-fc__mono--tool">{name}</text></g>);
                  y += 23;
                }
                y += 8;
              }
              return out;
            })()}
          </g>

          {/* deterministic simulation */}
          <g className={`hk-node2${on('sim')}`}>
            {box(776, 64, 230, 236, 'hk-fc__sim', 14)}
            <HkSvgGlyph name="sim" x={790} y={78} className="hk-c-cool" />
            <text x="820" y="96" className="hk-fc__h hk-fc__h--blue">Deterministic simulation</text>
            {[['Doublet hydraulics', 'depth, drawdown, pumps'], ['Plant flowsheet, daily', 'HEX, boiler, CHP, chillers'], ['365-day dispatch', 'staggered 35-day stops'], ['Economics', 'CAPEX, LCOE, CO₂']].map(([h, s], i) => (
              <g key={h}>
                <rect x="786" y={112 + i * 46} width="142" height="38" rx="7" className="hk-fc__simbox" />
                <text x="795" y={127 + i * 46} className="hk-fc__ht">{h}</text>
                <text x="795" y={142 + i * 46} className="hk-fc__st hk-fc__st--s">{s}</text>
                {i < 3 && <path d={`M857 ${150 + i * 46} L857 ${158 + i * 46}`} className="hk-wire hk-wire--blue" markerEnd="url(#hk-ar)" />}
              </g>
            ))}
            <rect x="934" y="112" width="64" height="86" rx="7" className="hk-fc__upstream" />
            <text x="966" y="130" textAnchor="middle" className="hk-fc__ht">GEMINI</text>
            <text x="966" y="145" textAnchor="middle" className="hk-fc__st hk-fc__st--s">TNO models</text>
            <text x="966" y="160" textAnchor="middle" className="hk-fc__st hk-fc__st--s">+ ours:</text>
            <text x="966" y="175" textAnchor="middle" className="hk-fc__st hk-fc__st--s hk-fc__accent">chillers,</text>
            <text x="966" y="189" textAnchor="middle" className="hk-fc__st hk-fc__st--s hk-fc__accent">ATES</text>
            <rect x="934" y="206" width="64" height="84" rx="7" className="hk-fc__upstream" />
            <text x="966" y="224" textAnchor="middle" className="hk-fc__ht">Fimbul.jl</text>
            <text x="966" y="240" textAnchor="middle" className="hk-fc__st hk-fc__st--s">JutulDarcy</text>
            <text x="966" y="256" textAnchor="middle" className="hk-fc__st hk-fc__st--s">30-year</text>
            <text x="966" y="271" textAnchor="middle" className="hk-fc__st hk-fc__st--s">doublets</text>
          </g>
          <g className={`hk-node2${on('sim')}`}>
            {box(776, 356, 230, 42, 'hk-fc__sim', 10)}
            <text x="790" y="382" className="hk-fc__mono">screen <tspan className="hk-fc__dim">720 designs × 365 days</tspan></text>
          </g>
          <g className="hk-node2">
            {box(776, 414, 230, 80, 'hk-fc__sandbox', 10)}
            <HkSvgGlyph name="sandbox" x={788} y={424} size={18} className="hk-c-heat" />
            <text x="812" y="438" className="hk-fc__mono hk-c-heat">write_model <tspan className="hk-fc__dim">sandbox</tspan></text>
            <text x="790" y="460" className="hk-fc__st">new model → the agent’s tests →</text>
            <text x="790" y="477" className="hk-fc__st">our acceptance tests → usable</text>
          </g>

          {/* the answer and the uncertainty */}
          <g className={`hk-node2${on('answer')}`}>
            {box(1030, 64, 160, 272, 'hk-fc__answer', 14)}
            <HkSvgGlyph name="star" x={1044} y={78} className="hk-c-heat" />
            <text x="1074" y="96" className="hk-fc__h hk-fc__h--heat">Answer</text>
            {['2 doublets, 3.2 km', '33 MW gas boiler', '+ CHP on the gas', 'air-cooled chiller', '+ free cooling', '3 ATES well pairs'].map((t, i) => (
              <text key={t} x="1044" y={124 + i * 19} className="hk-fc__t">{t}</text>
            ))}
            <line x1="1044" x2="1176" y1="246" y2="246" className="hk-fc__rule" />
            <text x="1044" y="276" className="hk-fc__big">€36.35/MWh</text>
            <text x="1044" y="302" className="hk-fc__bigsub">4,269 t CO₂/yr</text>
            <text x="1044" y="322" className="hk-fc__t hk-fc__t--muted">met all 365 days</text>
          </g>
          <g className="hk-node2">
            {box(1030, 352, 160, 142, 'hk-fc__sim', 14)}
            <HkSvgGlyph name="curve" x={1044} y={364} className="hk-c-cool" />
            <text x="1074" y="382" className="hk-fc__h hk-fc__h--blue">Uncertainty</text>
            <text x="1044" y="410" className="hk-fc__st">400-sample Latin</text>
            <text x="1044" y="426" className="hk-fc__st">hypercube, 14 sourced</text>
            <text x="1044" y="442" className="hk-fc__st">inputs → P10/P50/P90,</text>
            <text x="1044" y="458" className="hk-fc__st">tornado, P(demand met)</text>
            <text x="1044" y="482" className="hk-fc__st hk-fc__dim">runs the same engine</text>
          </g>

          {/* gates 2-5 */}
          <g className={`hk-node2${on('gatebar')}`}>
            {box(566, 540, 624, 100, 'hk-fc__gatebar', 14)}
            <HkSvgGlyph name="shield" x={580} y={552} className="hk-c-heat" />
            <text x="610" y="570" className="hk-fc__h hk-fc__h--heat">Physics gate on every run</text>
            <text x="1176" y="570" textAnchor="end" className="hk-fc__st hk-fc__dim">checks we wrote; the LLM can’t skip them</text>
            {HK_GATES.map(([n, h, s], i) => (
              <g key={n} className={`hk-fc__gate is-${gateState(n) || 'idle'}`} transform={`translate(${578 + i * 148} 590)`}>
                <circle cx="12" cy="18" r="12" className="hk-fc__gatedot" />
                <text x="12" y="23" textAnchor="middle" className="hk-fc__gatenum">{gateState(n) === 'ok' ? '✓' : gateState(n) === 'fail' ? '✕' : n}</text>
                <text x="32" y="15" className="hk-fc__ht">{h}</text>
                <text x="32" y="31" className="hk-fc__st">{s}</text>
              </g>
            ))}
          </g>

          {/* gate 6 over the top */}
          <g className={`hk-node2${on('gate6')}`}>
            <rect x="560" y="20" width="420" height="28" rx="14" className="hk-fc__gate6" />
            <text x="770" y="39" textAnchor="middle" className="hk-fc__gt">Gate 6 · no orphan numbers: every number traces to a run</text>
          </g>

          {/* step numbers */}
          {[[226, 470, 1], [518, 222, 2], [755, 160, 3], [1016, 420, 4], [360, 34, 5]].map(([x, y, n]) => (
            <g key={n} className={`hk-fc__stepn${cur.n === n ? ' is-on' : ''}`}><circle cx={x} cy={y} r="11" /><text x={x} y={y + 4} textAnchor="middle">{n}</text></g>
          ))}

          {/* the moving packet */}
          {!hkReduced() && seen && (
            <g key={step} className={`hk-fc__packet${cur.fail ? ' is-fail' : ''}`}>
              <circle r="11" filter="url(#hk-glow)" className="hk-fc__packetglow">
                <animateMotion dur="1.6s" fill="freeze" path={HK_ROUTES[cur.route]} calcMode="spline" keyTimes="0;1" keySplines="0.3 0 0.2 1" />
              </circle>
              <circle r="6">
                <animateMotion dur="1.6s" fill="freeze" path={HK_ROUTES[cur.route]} calcMode="spline" keyTimes="0;1" keySplines="0.3 0 0.2 1" />
              </circle>
            </g>
          )}
        </svg>
      </div>
      <div className="hk-flowchart__bar">
        <div className="hk-flowchart__dots" role="group" aria-label="Steps of the workflow">
          {HK_FLOW_STEPS.map((s, i) => (
            <button key={i} type="button" className={`hk-stepdot${i === step ? ' is-on' : ''}${s.fail ? ' is-fail' : ''}`}
              aria-label={`Step ${i + 1}`} aria-pressed={i === step} onClick={() => { setStep(i); setPaused(true); }} />
          ))}
        </div>
        <p className="hk-flowchart__say" aria-live="polite">{cur.say}</p>
      </div>
      <div className="hk-legend hk-legend--small hk-flowchart__legend">
        <span className="hk-key" style={{ '--key': '#14213d' }}>LLM (not deterministic)</span>
        <span className="hk-key" style={{ '--key': 'rgba(74,168,232,0.45)' }}>deterministic simulation</span>
        <span className="hk-key" style={{ '--key': '#5b6a7d' }}>upstream GEMINI (TNO)</span>
        <span className="hk-key" style={{ '--key': 'rgba(240,136,74,0.55)' }}>checks we wrote</span>
      </div>
    </figure>
  );
};

const HK_AGENT_STATS = [
  { icon: 'shield', value: 4100, label: 'faults planted in runs and answers', note: 'The gate caught 98 %. It rejected 0 of 200 correct answers.' },
  { icon: 'sandbox', value: 22, label: 'bugs planted in models the agent wrote', note: 'Our acceptance tests catch 21. The agent’s own tests catch 13.' },
  { icon: 'memory', value: 3, label: 'memory layers', note: 'A scratchpad per question, a ledger of runs to reuse, and project notes.' },
];

const HkAgent = () => (
  <HkSection id="agent" kicker="04 · The agent" title="An agent that plans, but never invents a number"
    intro="The LLM is swappable and not deterministic. Everything around it is deterministic. Follow one question through the system.">
    <HkFlowchart />
    <div className="hk-agentstats">
      {HK_AGENT_STATS.map((s, i) => (
        <HkReveal key={s.label} delay={i * 80} className="hk-agentstat">
          <HkGlyph name={s.icon} size={26} className="hk-agentstat__icon" />
          <strong><HkCount value={s.value} /></strong><span>{s.label}</span><small>{s.note}</small>
        </HkReveal>
      ))}
    </div>
  </HkSection>
);

// ---- 4b. the agent at work: a replay board, one tab for each live session.
// The data (HACK_DATA.agents) holds, for each session, every plant it simulated (pts), every LLM and tool call (log)
// and its length (end, in seconds). A model in HK_ROSTER without data shows as a pending tab.
const HK_CALL_KINDS = {
  setup: ['Read inputs', '#8796aa'], screen: ['Screen', '#4aa8e8'], design: ['Run a design', '#64ffda'], inspect: ['Inspect a run', '#6f7f94'],
  stress: ['Stress test', '#f0884a'], check: ['Cross-check', '#f2c66d'], talk: ['Memory, ask', '#b48cf0'],
};
const HK_PHASES = ['Brief', 'Screen', 'Probe', 'Stress test', 'Check', 'Answer'];

// The steps are written from the transcripts: t is seconds from the start of the session; run marks a run on the chart.
const HK_RUNS = {
  deepseek: {
    label: 'DeepSeek V4.1 Flash', tag: 'open weights · our pick', answer: 418,
    answerText: '2 doublets at 3.0 km · CHP on the gas · 18 MW gas boiler in 3 units · free cooling · 10 MW screw chiller',
    answerNote: 'It passed the trip on the coldest day that the brief asks for.',
    steps: [
      { t: 0, phase: 0, text: 'Reads the brief and checks the reservoir: 87 °C at 2.5 km, 102 °C at 3 km.' },
      { t: 9, phase: 1, text: 'Screens 48 plants in one call: 1–3 doublets × 4 depths × boiler or heat pump × absorption or electric cooling. Absorption misses the cooling.' },
      { t: 338, phase: 2, text: 'Keeps 2 doublets at 3 km and tunes them: boiler size, return temperatures, an ORC, then CHP, free cooling and an aquifer store.' },
      { t: 627, phase: 3, run: 189, text: 'First stress test: one doublet trips on the coldest day. R0189 leaves 357 MWh of heat unmet, so the agent adds boiler units.' },
      { t: 1313, phase: 2, run: 418, text: 'A screen of 18 variants finds R0418, the plant it will recommend.' },
      { t: 1717, phase: 4, text: 'Cross-checks a peak day in GEMINI’s own solver and runs price and reservoir sensitivities.' },
      { t: 1925, phase: 3, run: 419, text: 'Stress-tests R0418 next to R0419, which adds an aquifer store and also passes +10 % demand. It keeps the cheaper R0418 and names R0419.' },
      { t: 2286, phase: 4, run: 418, text: 'Cross-checks R0418 in GEMINI’s solver once more.' },
      { t: 2611, phase: 5, run: 418, text: 'Saves its decision to memory and answers: R0418.' },
    ],
  },
  sol: {
    label: 'GPT-6.1 Sol', tag: 'via Codex', answer: 514,
    answerText: '2 doublets at 3.075 km · 30 MW gas boiler · CHP and a 0.05 MW ORC · screw chiller, dry cooler and free cooling',
    answerNote: 'The solver agrees at both demand peaks, and both doublets down for 35 days from the peak still meet demand.',
    steps: [
      { t: 13, phase: 0, text: 'Reads the brief and the list of models.' },
      { t: 313, phase: 1, text: 'Screens 36 plants, with a cooling tower and free cooling from the start.' },
      { t: 722, phase: 3, run: 18, text: 'Runs the trip-at-peak test on its early favourite, R0018. It passes.' },
      { t: 888, phase: 2, text: 'Screens 48 plants at a time, again and again: depth, boiler size, CHP, ORC, pumps and return temperatures.' },
      { t: 4319, phase: 2, run: 514, text: 'A last fine screen finds R0514: 2 doublets at 3.075 km.' },
      { t: 4372, phase: 4, run: 514, text: 'Cross-checks R0514 at both demand peaks in GEMINI’s solver. Both agree.' },
      { t: 4378, phase: 3, run: 552, text: 'Writes its own, harder test: both doublets down for 35 days from the peak. R0552 still meets demand.' },
      { t: 4562, phase: 2, run: 564, text: 'Tries a 30 MW electric boiler in place of the gas backup. It is a little cheaper.' },
      { t: 4796, phase: 5, text: 'Stops to ask the engineer one question: can the grid supply a 30 MW electric boiler?' },
      { t: 4836, phase: 5, run: 514, text: 'The engineer does not know. So the agent keeps gas backup and answers: R0514.' },
    ],
  },
};
// The roster: sessions with data first, then models whose runs are on the way.
const HK_ROSTER = [
  { key: 'deepseek' }, { key: 'sol' },
  { key: 'sol62', label: 'GPT-6.2 Sol' },
  { key: 'hydrogen', label: 'Gemini 4 Hydrogen' }, { key: 'sonnet55', label: 'Claude Sonnet 5.5' },
];
const HK_VIEWS = { all: { x: [3.5, 14.5], y: [34, 72], label: 'Whole design space' }, zoom: { x: [3.9, 8.2], y: [35, 50], label: 'Zoom on the answer' } };
const HK_SPEEDS = [0.5, 1, 2, 4];
const HK_PLAY_SECONDS = 100; // one session at 1× speed
const HK_GAP_CAP = 40; // a quiet stretch longer than this (seconds of agent time) is shortened on the timeline

// The timeline runs on "u", agent time with long quiet stretches shortened, so the replay never stalls.
const hkWarp = (times, end) => {
  const knots = Array.from(new Set([0, ...times, end])).sort((a, b) => a - b);
  const us = [0];
  for (let i = 1; i < knots.length; i++) us.push(us[i - 1] + Math.min(knots[i] - knots[i - 1], HK_GAP_CAP));
  const find = (arr, v) => { let lo = 0, hi = arr.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (arr[m] <= v) lo = m; else hi = m; } return lo; };
  const toReal = u => { if (u <= 0) return 0; if (u >= us[us.length - 1]) return end; const i = find(us, u); const f = (u - us[i]) / (us[i + 1] - us[i] || 1); return knots[i] + f * (knots[i + 1] - knots[i]); };
  const toU = t => { if (t <= 0) return 0; if (t >= end) return us[us.length - 1]; const i = find(knots, t); const f = (t - knots[i]) / (knots[i + 1] - knots[i] || 1); return us[i] + f * (us[i + 1] - us[i]); };
  // The shortened stretches, to mark them on the bar.
  const gaps = [];
  for (let i = 1; i < knots.length; i++) if (knots[i] - knots[i - 1] > HK_GAP_CAP * 2) gaps.push([us[i - 1], us[i], knots[i] - knots[i - 1]]);
  return { U: us[us.length - 1], toReal, toU, gaps };
};
const hkMMSS = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const hkK = n => (n >= 1e6 ? `${(n / 1e6).toFixed(2)} M` : n >= 1e4 ? `${Math.round(n / 1e3)} k` : n >= 1e3 ? `${(n / 1e3).toFixed(1)} k` : String(n));

const HkFeedItem = React.memo(({ e, n, fresh }) => {
  if (e.k === 'user') return <li className={`hk-feed__it hk-feed__it--user${fresh ? ' is-fresh' : ''}`}><span className="hk-feed__time">{hkMMSS(e.t)}</span><div><b><HkGlyph name="person" size={15} /> Engineer</b><p>{e.text}</p></div></li>;
  if (e.k === 'gap') return <li className="hk-feed__gap"><span>{e.text}</span></li>;
  if (e.k === 'ask') return <li className={`hk-feed__it hk-feed__it--ask${fresh ? ' is-fresh' : ''}`}><span className="hk-feed__time">{hkMMSS(e.t)}</span><div><b>Asks the engineer</b><p>{e.text}</p></div></li>;
  if (e.k === 'answer') return <li className={`hk-feed__it hk-feed__it--answer${fresh ? ' is-fresh' : ''}`}><span className="hk-feed__time">{hkMMSS(e.t)}</span><div><b><HkGlyph name="star" size={15} /> Answer · gate 6 passed</b><p>{e.text}</p></div></li>;
  if (e.k === 'llm') return (
    <li className={`hk-feed__it hk-feed__it--llm${fresh ? ' is-fresh' : ''}`}>
      <span className="hk-feed__time">{hkMMSS(e.t)}</span>
      <div>
        <b><HkGlyph name="chip" size={15} /> LLM call {n} <small>{hkK(e.pt)} in · {hkK(e.ct)} out{e.rt ? ` (${hkK(e.rt)} thinking)` : ''} · {e.lat} s</small></b>
        {e.think ? <p className="hk-feed__think">“{e.think}”</p> : e.rt ? <p className="hk-feed__think hk-feed__think--hidden">Reasoning hidden by the provider.</p> : null}
        {e.n > 0 && <p className="hk-feed__plan">→ {e.n} tool call{e.n > 1 ? 's' : ''}</p>}
      </div>
    </li>
  );
  const [label, color] = HK_CALL_KINDS[e.cat] || HK_CALL_KINDS.inspect;
  return (
    <li className={`hk-feed__it hk-feed__it--tool${e.ok === false ? ' is-bad' : e.ok ? ' is-good' : ''}${fresh ? ' is-fresh' : ''}`} style={{ '--kind': color }}>
      <span className="hk-feed__time">{hkMMSS(e.t)}</span>
      <div>
        <b><code>{e.name}</code><small>{label}{e.s >= 1 ? ` · ${e.s} s` : ''}</small></b>
        {e.a && <p className="hk-feed__args">{e.a}</p>}
        <p className="hk-feed__res">{e.ok === false ? '✕ ' : e.ok ? '✓ ' : '→ '}{e.r}</p>
      </div>
    </li>
  );
});

const HkBoardStats = ({ log, pts, t, end }) => {
  const s = useMemo(() => {
    const out = { llm: 0, tools: 0, pt: 0, ct: 0, rt: 0, usd: 0, stress: 0, cases: 0, reject: 0, checks: 0, mix: {} };
    for (const e of log) {
      if (e.t > t) break;
      if (e.k === 'llm') { out.llm += 1; out.pt += e.pt; out.ct += e.ct; out.rt += e.rt; out.usd += e.usd; }
      if (e.k === 'tool') {
        out.tools += 1; out.mix[e.cat] = (out.mix[e.cat] || 0) + 1;
        if (e.cat === 'stress') { out.stress += 1; out.cases += e.cases || 1; }
        if (e.ok === false && /^Gate 1/.test(e.r)) out.reject += 1;
        if (e.name === 'cross_check') out.checks += 1;
      }
    }
    out.plants = pts.filter(p => p[0] <= t).length;
    out.gateRuns = pts.filter(p => p[0] <= t && !p[4]).length;
    return out;
  }, [log, pts, Math.floor(t)]);
  const tiles = [
    ['Agent time', `${hkMMSS(t)}`, `of ${hkMMSS(end)}`],
    ['LLM calls', s.llm, `${hkK(s.pt)} tokens read`],
    ['Tokens written', hkK(s.ct), s.rt ? `${hkK(s.rt)} of them thinking` : 'answers and tool calls'],
    ['Tool calls', s.tools, `${s.reject} rejected by gate 1`],
    ['Plants simulated', s.plants, 'each a full year, day by day'],
    ['Stress tests', s.stress, `${s.cases} case${s.cases === 1 ? '' : 's'}, each a full year`],
    ['Solver cross-checks', s.checks, 'peak day in GEMINI’s solver'],
    ['Cost so far', s.usd > 0 ? `$${s.usd.toFixed(2)}` : '—', s.usd > 0 ? 'billed by the API' : 'run on a subscription'],
  ];
  const total = Object.values(s.mix).reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="hk-bstats">
      <ul className="hk-bstats__tiles">
        {tiles.map(([k, v, sub]) => <li key={k}><span>{k}</span><strong>{v}</strong><small>{sub}</small></li>)}
      </ul>
      <div className="hk-bstats__mix" aria-label="Tool calls by kind">
        <p>Tool calls by kind</p>
        <div className="hk-bstats__bar">
          {Object.entries(HK_CALL_KINDS).map(([k, [label, color]]) => (s.mix[k] ? <span key={k} style={{ flex: s.mix[k] / total, background: color }} title={`${label}: ${s.mix[k]}`} /> : null))}
        </div>
        <div className="hk-legend hk-legend--small">
          {Object.entries(HK_CALL_KINDS).map(([k, [label, color]]) => <span key={k} className="hk-key" style={{ '--key': color }}>{label} {s.mix[k] || 0}</span>)}
        </div>
      </div>
    </div>
  );
};

const HkBoard = () => {
  const available = HK_ROSTER.filter(r => HACK_DATA.agents[r.key] && HK_RUNS[r.key]);
  const [which, setWhich] = useState(available[0].key);
  // One playback state for each tab: its position (u), whether the visitor paused it, and its speed.
  const [states, setStates] = useState({});
  const [picked, setPicked] = useState({});
  const [ref, seen] = useHkSeen(0.2);
  const run = HK_RUNS[which];
  const data = HACK_DATA.agents[which];
  const { pts, log } = data;
  const end = data.end;
  const warps = useMemo(() => Object.fromEntries(available.map(r => {
    const d = HACK_DATA.agents[r.key];
    return [r.key, hkWarp([...d.log.map(e => e.t), ...d.pts.map(p => p[0])], d.end)];
  })), []);
  const warp = warps[which];
  const st = states[which] || { u: 0, paused: false, speed: 1 };
  const setSt = patch => setStates(all => ({ ...all, [which]: { ...(all[which] || { u: 0, paused: false, speed: 1 }), ...patch } }));
  const reduced = hkReduced();
  const playing = seen && !st.paused && !reduced;
  const hold = useRef(0);
  useEffect(() => { if (reduced && seen && !states[which]) setSt({ u: warp.U, paused: true }); }, [reduced, seen, which]);
  // Autoplay: each tab plays from where it was. At the end it holds, then plays again from the start.
  useEffect(() => {
    if (!playing) return undefined;
    let frame = 0, last = performance.now(), acc = 0;
    const tick = now => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now; acc += dt;
      if (acc >= 1 / 30) {
        const step = acc * warp.U / HK_PLAY_SECONDS * st.speed; acc = 0;
        setStates(all => {
          const cur = all[which] || { u: 0, paused: false, speed: 1 };
          if (cur.u >= warp.U) {
            hold.current += step / (warp.U / HK_PLAY_SECONDS * cur.speed);
            if (hold.current > 9) { hold.current = 0; return { ...all, [which]: { ...cur, u: 0 } }; }
            return all;
          }
          return { ...all, [which]: { ...cur, u: Math.min(warp.U, cur.u + step) } };
        });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, which, warp, st.speed]);

  const t = warp.toReal(st.u);
  const done = st.u >= warp.U - 1e-6;
  const steps = run.steps || [];
  const stepIdx = steps.reduce((k, s, i) => (s.t <= t ? i : k), 0);
  const step = steps[stepIdx];
  const byId = useMemo(() => Object.fromEntries(pts.map(p => [p[6], p])), [pts]);
  const answer = byId[run.answer];
  const shown = pts.filter(p => p[0] <= t);
  const view = picked[which] || (stepIdx >= 2 ? 'zoom' : 'all');
  const v = HK_VIEWS[view];
  const W = 660, H = 420, L = 54, R = 14, T = 14, B = 42;
  const x = hkScale(v.x[0], v.x[1], L, W - R);
  const y = hkScale(v.y[0], v.y[1], H - B, T);
  const inView = p => p[1] >= v.x[0] && p[1] <= v.x[1] && p[2] >= v.y[0] && p[2] <= v.y[1];
  const nColor = n => (n === 1 ? '#8796aa' : n === 2 ? '#4aa8e8' : '#b48cf0');
  const fresh = (end / HK_PLAY_SECONDS) * 1.5;

  // The feed: every event up to now, newest at the bottom, scrolled inside its own box.
  const feedRef = useRef(null);
  const upto = log.filter(e => e.t <= t);
  const llmNo = useMemo(() => { const m = new Map(); let n = 0; log.forEach(e => { if (e.k === 'llm') m.set(e, ++n); }); return m; }, [log]);
  useEffect(() => { const f = feedRef.current; if (f) f.scrollTop = f.scrollHeight; }, [upto.length, which]);

  // The bar: drag or click to move. Moving does not pause; the play button does.
  const TW = 1000;
  const tx = hkScale(0, warp.U, 12, TW - 12);
  const barRef = useRef(null);
  const seekAt = clientX => {
    const b = barRef.current.getBoundingClientRect();
    const u = Math.max(0, Math.min(warp.U, ((clientX - b.left) / b.width * TW - 12) / (TW - 24) * warp.U));
    hold.current = 0;
    setSt({ u });
  };
  const onDown = e => {
    e.preventDefault();
    seekAt(e.clientX);
    const move = ev => seekAt(ev.clientX);
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const onKey = e => {
    const d = warp.U / 60;
    if (e.key === 'ArrowRight') { e.preventDefault(); setSt({ u: Math.min(warp.U, st.u + d) }); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); setSt({ u: Math.max(0, st.u - d) }); }
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); setSt({ paused: !st.paused }); }
  };
  const latest = upto.filter(e => e.k === 'tool').slice(-1)[0];
  return (
    <div ref={ref} className="hk-board">
      <div className="hk-board__tabs" role="tablist" aria-label="Choose a model">
        {HK_ROSTER.map(r => {
          const ready = available.some(a => a.key === r.key);
          const meta = HK_RUNS[r.key];
          const label = meta ? meta.label : r.label;
          return (
            <button key={r.key} type="button" role="tab" aria-selected={which === r.key} disabled={!ready}
              className={`hk-btab${which === r.key ? ' is-on' : ''}${ready ? '' : ' is-pending'}`}
              onClick={() => ready && setWhich(r.key)}>
              <strong>{label}</strong>
              <small>{ready ? (meta.tag || 'live run') : 'run on the way'}</small>
              {ready && <span className="hk-btab__prog"><i style={{ width: `${((states[r.key] || { u: 0 }).u / warps[r.key].U) * 100}%` }} /></span>}
            </button>
          );
        })}
      </div>

      <div className="hk-board__controls">
        <button type="button" className="btn btn--primary btn--small hk-board__play" onClick={() => setSt({ paused: !st.paused })}
          aria-label={st.paused ? 'Play this replay' : 'Pause this replay'}>
          <Icon name={st.paused || !playing ? 'play' : 'pause'} size={15} />{st.paused ? 'Play' : 'Pause'}
        </button>
        <div className="hk-board__speeds" role="group" aria-label="Speed">
          {HK_SPEEDS.map(sp => <button key={sp} type="button" className={`hk-chip${st.speed === sp ? ' is-on' : ''}`} aria-pressed={st.speed === sp} onClick={() => setSt({ speed: sp })}>{sp}×</button>)}
        </div>
        <span className="hk-board__clock"><strong>{hkMMSS(t)}</strong> / {hkMMSS(end)} agent time</span>
      </div>
      <svg ref={barRef} viewBox={`0 0 ${TW} 70`} className="hk-board__bar" role="slider" tabIndex={0}
        aria-label={`Timeline of the ${run.label} session`} aria-valuemin={0} aria-valuemax={Math.round(end)} aria-valuenow={Math.round(t)}
        aria-valuetext={`${hkMMSS(t)} of ${hkMMSS(end)}`} onPointerDown={onDown} onKeyDown={onKey}>
        <rect x="12" y="26" width={TW - 24} height="26" rx="6" className="hk-timeline__bg" />
        <rect x="12" y="26" width={Math.max(0, tx(st.u) - 12)} height="26" rx="6" className="hk-board__done" />
        {(() => {
          // Label only the long shortened stretches, and never two labels close together.
          let lastX = -100;
          return warp.gaps.map(([u0, u1, dt], i) => {
            const cx = (tx(u0) + tx(u1)) / 2;
            const label = dt >= 240 && cx - lastX > 70;
            if (label) lastX = cx;
            return <g key={i} className="hk-board__gap"><rect x={tx(u0)} y="26" width={Math.max(2, tx(u1) - tx(u0))} height="26" />{label && <text x={cx} y="66" textAnchor="middle">{Math.round(dt / 60)} min</text>}</g>;
          });
        })()}
        {log.filter(e => e.k === 'tool').map((e, i) => <rect key={i} x={tx(warp.toU(e.t)) - 1.2} y="29" width="2.4" height="20" fill={(HK_CALL_KINDS[e.cat] || HK_CALL_KINDS.inspect)[1]} opacity={e.t <= t ? 1 : 0.3} />)}
        {log.filter(e => e.k === 'llm').map((e, i) => <circle key={`l${i}`} cx={tx(warp.toU(e.t))} cy="56" r="1.6" className="hk-board__llmdot" opacity={e.t <= t ? 1 : 0.3} />)}
        {steps.map((s, i) => (
          <g key={i} className={`hk-timeline__ms${i === stepIdx ? ' is-on' : ''}`} onPointerDown={ev => { ev.stopPropagation(); hold.current = 0; setSt({ u: warp.toU(s.t) + 0.01 }); }}>
            <circle cx={tx(warp.toU(s.t))} cy="12" r="9" />
            <text x={tx(warp.toU(s.t))} y="15.5" textAnchor="middle">{i + 1}</text>
          </g>
        ))}
        <g className="hk-board__head" transform={`translate(${tx(st.u)} 0)`}>
          <line y1="20" y2="58" /><circle cy="39" r="7" />
        </g>
      </svg>
      <p className="hk-board__hint">Drag the bar or press a number to move through the session. The replay keeps playing; the button pauses it. Long simulations are shortened on the bar.</p>

      <div className="hk-board__grid">
        <div className="hk-board__main">
          {step && (
            <div className="hk-board__caption" key={`${which}-${stepIdx}`}>
              <span className="hk-board__stepno">{stepIdx + 1}<small>/{steps.length}</small></span>
              <div><em>{HK_PHASES[step.phase]}</em><p>{step.text}</p></div>
            </div>
          )}
          <ol className="hk-phases" aria-label="Phase of the session">
            {HK_PHASES.map((p, i) => <li key={p} className={step && i === step.phase ? 'is-on' : steps.slice(0, stepIdx + 1).some(s => s.phase === i) ? 'is-past' : ''}>{p}</li>)}
          </ol>
          <figure className="hk-figure hk-board__fig">
            <div className="hk-replay__hud">
              <span>plants simulated <strong>{shown.length}</strong></span>
              {latest && <span className="hk-board__now">now: <code>{latest.name}</code></span>}
              <span className="hk-views" role="group" aria-label="Chart view">
                {Object.entries(HK_VIEWS).map(([k, vv]) => (
                  <button key={k} type="button" className={`hk-chip${view === k ? ' is-on' : ''}`} aria-pressed={view === k} onClick={() => setPicked(pk => ({ ...pk, [which]: k }))}>{vv.label}</button>
                ))}
              </span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="hk-chart" role="img" aria-label={`Each plant the ${run.label} session simulated, on cost against CO2.`}>
              <defs><clipPath id="hk-bd-clip"><rect x={L} y={T} width={W - L - R} height={H - T - B} /></clipPath></defs>
              {(view === 'all' ? [35, 40, 45, 50, 55, 60, 65, 70] : [36, 38, 40, 42, 44, 46, 48, 50]).map(g => <g key={g} className="hk-grid"><line x1={L} x2={W - R} y1={y(g)} y2={y(g)} /><text x={L - 8} y={y(g) + 4} textAnchor="end">{g}</text></g>)}
              {(view === 'all' ? [4, 6, 8, 10, 12, 14] : [4, 5, 6, 7, 8]).map(g => <g key={g} className="hk-grid"><text x={x(g)} y={H - B + 18} textAnchor="middle">{g}</text></g>)}
              <text className="hk-axis-title" x={(L + W) / 2} y={H - 6} textAnchor="middle">CO₂, kt a year</text>
              <text className="hk-axis-title" x="13" y={(T + H - B) / 2} textAnchor="middle" transform={`rotate(-90 13 ${(T + H - B) / 2})`}>€/MWh with CO₂ at €180/t</text>
              <text className="hk-rp__better" x={L + 8} y={H - B - 8}>↙ cheaper and cleaner</text>
              <g clipPath="url(#hk-bd-clip)">
                {shown.map(p => {
                  const isFresh = t - p[0] < fresh;
                  return p[4]
                    ? <circle key={p[6]} cx={x(p[1])} cy={y(p[2])} r={isFresh ? 4.5 : 2.8} fill={nColor(p[3])} className={`hk-rp${isFresh ? ' is-fresh' : ''}`} />
                    : <path key={p[6]} d={`M${x(p[1]) - 4} ${y(p[2]) - 4} l8 8 m0 -8 l-8 8`} className="hk-rp hk-rp--rej" />;
                })}
                {steps.slice(0, stepIdx + 1).filter(s => s.run && byId[s.run] && inView(byId[s.run])).map(s => {
                  const p = byId[s.run];
                  return (
                    <g key={`${s.t}-${s.run}`} className={`hk-rp__mark${s === step ? ' is-on' : ''}`}>
                      <circle cx={x(p[1])} cy={y(p[2])} r="11" />
                      {s === step && !(done && s.run === run.answer) && <text x={x(p[1]) + 15} y={y(p[2]) - 9}>R{String(s.run).padStart(4, '0')}</text>}
                    </g>
                  );
                })}
                {done && answer && inView(answer) && (
                  <g className="hk-star">
                    <path transform={`translate(${x(answer[1])} ${y(answer[2])})`} d="M0 -15 L4.4 -4.8 L14.3 -4.6 L6.5 2 L9.1 12.2 L0 6.5 L-9.1 12.2 L-6.5 2 L-14.3 -4.6 L-4.4 -4.8 Z" />
                    <text x={x(answer[1]) + 18} y={y(answer[2]) + 5} className="hk-star__label">answer R{String(run.answer).padStart(4, '0')}</text>
                  </g>
                )}
              </g>
              {shown.filter(p => !inView(p)).length > 0 && <text x={W - R - 4} y={T + 14} textAnchor="end" className="hk-rp__off">{shown.filter(p => !inView(p)).length} plants outside this view</text>}
            </svg>
            <div className="hk-legend hk-legend--small">
              <span className="hk-key" style={{ '--key': '#8796aa' }}>1 doublet</span>
              <span className="hk-key" style={{ '--key': '#4aa8e8' }}>2 doublets</span>
              <span className="hk-key" style={{ '--key': '#b48cf0' }}>3 doublets</span>
              <span className="hk-key hk-key--x">rejected by the physics gate</span>
              <span className="hk-key hk-key--star">the answer</span>
            </div>
            {done && answer && (
              <div className="hk-board__answer">
                <p className="hk-answer__k">The answer · R{String(run.answer).padStart(4, '0')}</p>
                <p className="hk-answer__big">€{hkFmt(answer[2], 2)}<small>/MWh</small> · {hkFmt(answer[1], 2)}<small> kt CO₂/yr</small></p>
                <p>{run.answerText}</p>
                <p className="hk-muted">{run.answerNote}</p>
              </div>
            )}
          </figure>
        </div>
        <aside className="hk-feed" aria-label="What the agent does">
          <p className="hk-feed__title"><span className={`hk-feed__live${playing && !done ? ' is-on' : ''}`} />{playing && !done ? 'Live' : done ? 'Session complete' : 'Paused'} · every LLM call and tool call</p>
          <ol className="hk-feed__list" ref={feedRef} aria-live="off">
            {upto.map((e, i) => <HkFeedItem key={i} e={e} n={llmNo.get(e)} fresh={i >= upto.length - 2} />)}
          </ol>
        </aside>
      </div>
      <HkBoardStats log={log} pts={pts} t={t} end={end} />
    </div>
  );
};

const HkAtWork = () => (
  <HkSection id="replay" kicker="04b · The agent at work" title="Watch each model work, call by call"
    intro="Each tab replays a real session from its transcript and run ledger: the same question, at maximum reasoning. Every LLM call, every tool call and every plant it simulated appears at the moment it happened. CO₂ is priced at the €180/t the question asked for. More models join as their runs finish.">
    <HkBoard />
  </HkSection>
);

Object.assign(window, { HkAgent, HkAtWork, HkGlyph });
