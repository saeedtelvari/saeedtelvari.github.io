// SubsurfaceHero.jsx — the landing hero: a moonlit Highland field site above a live
// vertical-equilibrium section of CO2 injected into a faulted saline aquifer.
// Geometry, physics and the depth scale live in hero-geology.js (shared with the worker and tests).

const { useEffect, useMemo, useRef, useState } = React;

// ---- hero playback helpers (pure; tests/hero-model.test.js evaluates this block)
const heroInitialPlayback = reducedMotion => ({ year: reducedMotion ? 400 : 0, playing: !reducedMotion });
const heroShouldTick = ({ playing, visible, hidden }) => playing && visible && !hidden;
const heroPhase = (year, injectionYears) => year < injectionYears ? 'injecting' : 'migrating';
// ---- end hero playback helpers

const HERO_YEARS = 2000;
const HERO_UNIT = 15; // SVG units per solver unit of height
// One random section per page load; the worker simulates it.
const heroGeology = HeroGeology.randomGeology();
const heroSection = HeroGeology.section(heroGeology);
const [heroStorage, heroOverlying] = heroSection.layers;
const { capRockY, stratumY, layerThicknessAt, getFaultIntersection, getStratumFaultIntersection } = HeroGeology;

const HERO_PROFILES = [
  { icon: 'scholar', label: 'Google Scholar profile', href: SITE_LINKS.scholar },
  { icon: 'orcid', label: 'ORCID record', href: SITE_LINKS.orcid },
  { icon: 'github', label: 'GitHub profile', href: SITE_LINKS.github },
  { icon: 'linkedin', label: 'LinkedIn profile', href: SITE_LINKS.linkedin },
  { icon: 'mail', label: 'Email Sa’eed Telvari', href: `mailto:${SITE_LINKS.email}` },
];

const heroFixed = value => Math.round(value * 10) / 10;
const heroRoof = layer => (k, side) => side === 'L' ? layer.roofL[k] : layer.roofR[k];
const heroFloor = layer => (k, side) => side === 'L' ? layer.floorL[k] : layer.floorR[k];
const HERO_NO_STEPS = new Uint8Array(201);

// Closed ribbon between two boundaries from node a to node b. top/bottom(k, side) return SVG y;
// side 'L' is the cell left of node k and 'R' the cell on its right. Nodes flagged in the step
// arrays get a vertical segment, so a fault is drawn as a step and never as a diagonal.
const heroRibbon = (top, topSteps, bottom, bottomSteps, a = 0, b = 200) => {
  let d = '';
  for (let k = a; k <= b; k++) {
    const x = k * 5;
    if (k === a) d = `M${x} ${heroFixed(top(k, 'R'))}`;
    else if (topSteps[k]) d += `L${x} ${heroFixed(top(k, 'L'))}L${x} ${heroFixed(top(k, 'R'))}`;
    else d += `L${x} ${heroFixed(top(k, 'R'))}`;
  }
  for (let k = b; k >= a; k--) {
    const x = k * 5;
    if (bottomSteps[k] && k > a) d += `L${x} ${heroFixed(bottom(k, 'R'))}L${x} ${heroFixed(bottom(k, 'L'))}`;
    else d += `L${x} ${heroFixed(bottom(k, 'R'))}`;
  }
  return `${d}Z`;
};

const HERO_PATHS = {
  storage: heroRibbon(heroRoof(heroStorage), heroStorage.faultTop, heroFloor(heroStorage), heroStorage.faultBottom),
  overlying: heroRibbon(heroRoof(heroOverlying), heroOverlying.faultTop, heroFloor(heroOverlying), heroOverlying.faultBottom),
  caprock: heroRibbon(heroFloor(heroOverlying), heroOverlying.faultBottom, heroRoof(heroStorage), heroStorage.faultTop),
  underburden: heroRibbon(heroFloor(heroStorage), heroStorage.faultBottom, () => 580, HERO_NO_STEPS),
};

// Fault traces and the segment each one leaks through: storage roof up to the overlying aquifer's base.
const HERO_FAULTS = heroGeology.faults.map(fault => ({
  top: { x: fault.xPercent * 10, y: 0 },
  bottom: { x: fault.xPercent * 10 + fault.dipSlope * 480, y: 480 },
  from: getFaultIntersection(fault, 1, heroGeology),
  to: getStratumFaultIntersection(fault, 0.4, heroGeology.shallowThickness, heroGeology),
}));

// Labels sit at mid-depth of each unit: far right on wide screens, just right of the axis on phones.
const HERO_LABELS = [['wide', 980], ['narrow', 160]].flatMap(([set, x]) => {
  const k = Math.round(x / 5);
  const mid = (a, b) => (a + b) / 2;
  return [
    ['Overburden', heroOverlying.roofR[k] / 2, set === 'wide'],
    ['Overlying aquifer', mid(heroOverlying.roofR[k], heroOverlying.floorR[k]), true],
    ['Caprock', mid(heroOverlying.floorR[k], heroStorage.roofR[k]), true],
    ['Storage aquifer', mid(heroStorage.roofR[k], heroStorage.floorR[k]), true],
    ['Underburden', mid(heroStorage.floorR[k], 580), set === 'wide'],
  ].filter(([, , shown]) => shown).map(([text, y]) => ({ set, text, y }));
});

const heroDepthTop = y => `calc(var(--hero-surface) + var(--hero-depth) * ${heroFixed(y) / 580})`;

// Mobile plume (roof to roof + h) and swept residual zone (to roof + hMax) of one aquifer.
const heroPlumePaths = (layer, h, hMax) => {
  let a = -1, b = -1;
  for (let k = 0; k <= 200; k++) if (hMax[k] > 0.001 || h[k] > 0.001) { if (a < 0) a = k; b = k; }
  if (a < 0) return null;
  a = Math.max(0, a - 1);
  b = Math.min(200, b + 1);
  const roof = heroRoof(layer), floor = heroFloor(layer);
  const cell = (k, side) => side === 'L' ? Math.max(0, k - 1) : k;
  const depth = values => (k, side) => Math.min(floor(k, side), roof(k, side) + values[cell(k, side)] * HERO_UNIT);
  const mobile = depth(h), swept = depth(hMax);
  let contact = '';
  for (let k = a; k <= b; k++) {
    const pen = h[k] > 0.002 ? (contact && h[Math.max(0, k - 1)] > 0.002 ? 'L' : 'M') : '';
    if (!pen) continue;
    if (pen === 'L' && layer.faultBottom[k]) contact += `L${k * 5} ${heroFixed(mobile(k, 'L'))}`;
    contact += `${pen}${k * 5} ${heroFixed(mobile(k, 'R'))}`;
  }
  return {
    mobile: heroRibbon(roof, layer.faultTop, mobile, layer.faultBottom, a, b),
    residual: heroRibbon(mobile, layer.faultBottom, swept, layer.faultBottom, a, b),
    contact,
  };
};

// Linear interpolation between two recorded years, so slow playback moves smoothly.
const heroFrameAt = (run, year) => {
  const y0 = Math.floor(year), y1 = Math.min(run.years, y0 + 1), t = year - y0;
  const a = HeroGeology.frameOf(run, y0), b = HeroGeology.frameOf(run, y1);
  const mix = (p, q) => (t > 0 ? Float32Array.from(p, (v, i) => v + (q[i] - v) * t) : p);
  const inventory = {};
  for (const key of ['mobile', 'residual', 'leaked', 'injected']) inventory[key] = a.inventory[key] + (b.inventory[key] - a.inventory[key]) * t;
  return { h: mix(a.h, b.h), hMax: mix(a.hMax, b.hMax), h2: mix(a.h2, b.h2), h2Max: mix(a.h2Max, b.h2Max), faultFlow: b.faultFlow, inventory };
};

const SubsurfaceHero = ({ onNavigate }) => {
  const heroRef = useRef(null);
  const sectionRef = useRef(null);
  const yearRef = useRef(0);
  const initial = useMemo(() => heroInitialPlayback(siteReducedMotion()), []);
  const [run, setRun] = useState(null);
  const [year, setYear] = useState(initial.year);
  const [playing, setPlaying] = useState(initial.playing);
  const [speed, setSpeed] = useState(1);
  const [visible, setVisible] = useState(true);
  const [hidden, setHidden] = useState(() => document.hidden);
  const [exaggeration, setExaggeration] = useState(2);
  yearRef.current = year;

  // The model runs once per page load, off the main thread when possible.
  useEffect(() => {
    const options = { years: HERO_YEARS };
    if (!window.Worker) {
      const timer = setTimeout(() => setRun(HeroGeology.simulate(heroGeology, options)), 0);
      return () => clearTimeout(timer);
    }
    const worker = new Worker('./hero-simulation-worker.js?v=8');
    worker.onmessage = event => setRun(event.data);
    worker.onerror = () => setRun(HeroGeology.simulate(heroGeology, options));
    worker.postMessage({ geology: heroGeology, options });
    return () => worker.terminate();
  }, []);

  // Playback stops while the hero is off-screen or the tab is hidden.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (heroRef.current) observer.observe(heroRef.current);
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);

  // Vertical exaggeration of the rendered section (horizontal m/px over vertical m/px).
  useEffect(() => {
    const element = sectionRef.current;
    if (!element || !('ResizeObserver' in window)) return undefined;
    const sizes = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height) setExaggeration(HeroGeology.exaggeration(width, height));
    });
    sizes.observe(element);
    return () => sizes.disconnect();
  }, []);

  useEffect(() => {
    if (!run || !heroShouldTick({ playing, visible, hidden })) return undefined;
    let frameId = 0, last = 0;
    const tick = now => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      const next = Math.min(HERO_YEARS, yearRef.current + dt * HeroGeology.yearsPerSecond(yearRef.current, run.injectionYears) * speed);
      setYear(next);
      if (next >= HERO_YEARS) { setPlaying(false); return; }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [run, playing, speed, visible, hidden]);

  const frame = useMemo(() => (run ? heroFrameAt(run, year) : null), [run, year]);
  const injectionYears = run ? run.injectionYears : 30;
  const injecting = !!run && playing && visible && year < injectionYears;
  const controls = {
    toggle: () => {
      if (!playing && yearRef.current >= HERO_YEARS) setYear(0);
      setPlaying(!playing);
    },
    scrub: value => { setYear(value); setPlaying(false); },
    restart: () => { setYear(0); setPlaying(true); },
    speed: () => setSpeed(s => (s === 1 ? 2 : s === 2 ? 4 : 1)),
  };

  return (
    <section id="home" ref={heroRef} className="hero-scene" aria-labelledby="hero-name" data-visible={visible && !hidden ? 'true' : 'false'}>
      <Sky />
      <HeroSection sectionRef={sectionRef} />
      <HeroPlume frame={frame} year={year} />
      <HeroOverlay injecting={injecting} />
      <SurfaceSite geology={heroGeology} injecting={injecting} />
      <HeroLabels />
      <Identity onNavigate={onNavigate} />
      <HeroPlayer year={year} playing={playing} speed={speed} frame={frame} injectionYears={injectionYears}
        exaggeration={exaggeration} controls={controls} />
    </section>
  );
};

/* =====================================================
   Section — rock units, bedding and textures (static per page load)
   ===================================================== */
const HeroSection = React.memo(({ sectionRef }) => {
  const AQUIFER_PATH = HERO_PATHS.underburden;
  return (
    <svg ref={sectionRef} className="hero-svg hero-svg--rock" viewBox="0 0 1000 580" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="hero-shale" width="18" height="6" patternUnits="userSpaceOnUse">
          <rect width="18" height="6" className="hero-rock--cap" />
          <path d="M1 3h9M12 1h5" stroke="#8d7f6e" strokeOpacity=".3" strokeWidth=".8" />
        </pattern>
        <pattern id="hero-sand" width="9" height="9" patternUnits="userSpaceOnUse">
          <rect width="9" height="9" className="hero-rock--sand" />
          <circle cx="2" cy="2" r=".9" fill="#8d7f6e" fillOpacity=".4" />
          <circle cx="6.5" cy="6" r=".7" fill="#8d7f6e" fillOpacity=".3" />
        </pattern>
        <clipPath id="hero-lower-rock"><path d={AQUIFER_PATH}/></clipPath>
        <linearGradient id="hero-lower-texture" x1="0" y1="280" x2="0" y2="580" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0"/><stop offset="1" stopColor="white" stopOpacity=".65"/>
        </linearGradient>
        <mask id="hero-lower-texture-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="580">
          <rect width="1000" height="580" fill="url(#hero-lower-texture)"/>
        </mask>
        <linearGradient id="hero-descent-bridge" x1="0" y1="490" x2="0" y2="580" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1d150f" stopOpacity="0"/><stop offset="1" stopColor="#1d150f"/>
        </linearGradient>
      </defs>
      <rect width="1000" height="580" className="hero-rock--over" />
      <path d={HERO_PATHS.caprock} fill="url(#hero-shale)" />
      <path d={HERO_PATHS.overlying} fill="url(#hero-sand)" />
      <path d={HERO_PATHS.storage} fill="url(#hero-sand)" />
      <path d={AQUIFER_PATH} className="hero-rock--base" />
      <g clipPath="url(#hero-lower-rock)">
        <rect width="1000" height="580" fill="url(#descent-rock-shale)" mask="url(#hero-lower-texture-mask)"/>
        <rect width="1000" height="580" fill="url(#hero-descent-bridge)"/>
      </g>
      <GeologyTexture faults={heroGeology.faults} geology={heroGeology} />
    </svg>
  );
});

// Static rock detail is built once per geology, independent of simulation frames.
const GeologyTexture = ({ faults, geology: g }) => useMemo(() => {
  const reservoirPaths = [HERO_PATHS.overlying, HERO_PATHS.storage];
  const trace = elevation => {
    let path = '';
    for (let i = 0; i < 200; i++) {
      const x = i * 5;
      const y = elevation(x, i);
      // Break at displaced contacts instead of drawing a diagonal across a fault.
      const move = !i || Math.abs(y - elevation(x, i - 1)) > 0.1;
      path += ` ${move ? 'M' : 'L'} ${x} ${y} L ${x + 5} ${elevation(x + 5, i)}`;
    }
    return path;
  };
  const sealLines = Array.from({ length: 23 }, (_, i) =>
    trace((x, cell) => capRockY(x, faults, cell, (i + 1) / 24, g)));
  const lowerLines = Array.from({ length: 25 }, (_, i) =>
    trace((x, cell) => stratumY(x, faults, cell, 1, g.reservoirThickness + (i + 1) * 320 / 26, g)));
  const reservoirLines = [0.4, 1].flatMap(depth => Array.from({ length: depth === 1 ? 8 : 3 }, (_, i) => {
    const fraction = (i + 1) / (depth === 1 ? 9 : 4);
    return trace((x, cell) => capRockY(x, faults, cell, depth, g)
      + fraction * layerThicknessAt(x, depth, faults, cell, g));
  }));
  return <g data-layer="geology-texture">
    <defs>
      <clipPath id="rock-reservoirs">{reservoirPaths.map((d, i) => <path key={i} d={d}/>)}</clipPath>
      <mask id="rock-seals" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="580">
        <rect width="1000" height="580" fill="white"/>
        {reservoirPaths.map((d, i) => <path key={i} d={d} fill="black"/>) }
      </mask>
      <pattern id="rock-grain" width="137" height="89" patternUnits="userSpaceOnUse">
        {Array.from({ length: 90 }, (_, i) => <ellipse key={i}
          cx={(i * 47.13 + 7) % 137} cy={(i * i * 13.71 + 11) % 89}
          rx={0.35 + (i % 4) * 0.13} ry={0.25 + (i % 3) * 0.12}
          fill={i % 3 ? '#d8c7b0' : '#0d0906'} opacity={i % 3 ? 0.13 : 0.3}/>) }
      </pattern>
    </defs>
    <rect width="1000" height="580" fill="url(#rock-grain)" opacity="0.5"/>
    <g mask="url(#rock-seals)" fill="none" stroke="#c5b8b1" strokeWidth="0.65">
      {[...sealLines, ...lowerLines].map((d, i) => <path key={i} d={d}
        opacity={i % 4 === 0 ? 0.12 : 0.05}
        strokeDasharray={i % 3 === 0 ? '31 5 9 3 57 7' : undefined}/>) }
    </g>
    <g clipPath="url(#rock-reservoirs)">
      {reservoirLines.map((d, i) => <path key={i} d={d} fill="none"
        stroke="#d9c3a3" strokeWidth="0.7" opacity="0.12" strokeDasharray="47 6 18 4 83 9"/>) }
    </g>
  </g>;
}, [faults, g]);

/* =====================================================
   Plume — CO2 in the simulator's class colours, redrawn per frame
   ===================================================== */
const HeroPlume = ({ frame, year }) => {
  if (!frame) return null;
  const storage = heroPlumePaths(heroStorage, frame.h, frame.hMax);
  const overlying = heroPlumePaths(heroOverlying, frame.h2, frame.h2Max);
  return (
    <svg className="hero-svg hero-svg--plume" viewBox="0 0 1000 580" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <clipPath id="hero-in-storage"><path d={HERO_PATHS.storage} /></clipPath>
        <clipPath id="hero-in-overlying"><path d={HERO_PATHS.overlying} /></clipPath>
        <pattern id="hero-residual" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" className="hero-fill--residual-soft" /><rect width="2" height="6" className="hero-fill--residual" />
        </pattern>
        <pattern id="hero-leaked-residual" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" className="hero-fill--leaked-soft" /><rect width="2" height="6" className="hero-fill--leaked" />
        </pattern>
        <linearGradient id="hero-mobile" x1="0" x2="0" y1="0" y2="1">
          <stop className="hero-stop--free-glow" /><stop offset="1" className="hero-stop--free" />
        </linearGradient>
        <linearGradient id="hero-leaked" x1="0" x2="0" y1="0" y2="1">
          <stop className="hero-stop--leaked-glow" /><stop offset="1" className="hero-stop--leaked" />
        </linearGradient>
      </defs>
      {storage && <g clipPath="url(#hero-in-storage)" data-layer="storage-plume">
        <path d={storage.residual} fill="url(#hero-residual)" />
        <path d={storage.mobile} fill="url(#hero-mobile)" />
        <path d={storage.contact} className="hero-contact" fill="none" vectorEffect="non-scaling-stroke" />
      </g>}
      {overlying && <g clipPath="url(#hero-in-overlying)" data-layer="leaked-plume">
        <path d={overlying.residual} fill="url(#hero-leaked-residual)" />
        <path d={overlying.mobile} fill="url(#hero-leaked)" />
      </g>}
      {HERO_FAULTS.map((fault, i) => {
        const flow = frame.faultFlow[i] || 0;
        if (flow <= 0) return null;
        const strength = Math.min(1, Math.sqrt(flow / heroGeology.faults[i].leakRate));
        return (
          <g key={i} data-layer="fault-leak" opacity={0.35 + 0.65 * strength}>
            <line x1={fault.from.x} y1={fault.from.y} x2={fault.to.x} y2={fault.to.y} className="hero-leak" vectorEffect="non-scaling-stroke" />
            {/* The cue moves with the simulation clock, so pausing or scrubbing stops it. */}
            <line className="fault-flow-cue hero-leak-cue" x1={fault.from.x} y1={fault.from.y} x2={fault.to.x} y2={fault.to.y}
              strokeDasharray="3 9" strokeDashoffset={-year * 0.6} vectorEffect="non-scaling-stroke" />
          </g>
        );
      })}
    </svg>
  );
};

/* =====================================================
   Overlay — ground surface, faults and the injection well
   ===================================================== */
const HeroOverlay = React.memo(({ injecting }) => {
  const wellTop = heroStorage.roofR[heroSection.wellCell];
  const { wellBottom } = heroSection;
  return (
    <svg className="hero-svg hero-svg--overlay" viewBox="0 0 1000 580" preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" y1="0.5" x2="1000" y2="0.5" className="hero-surface-line" vectorEffect="non-scaling-stroke" />
      {HERO_FAULTS.map((fault, i) => (
        <line key={i} x1={fault.top.x} y1={fault.top.y} x2={fault.bottom.x} y2={fault.bottom.y} className="hero-fault" vectorEffect="non-scaling-stroke" />
      ))}
      <line x1={heroGeology.wellX} y1="0" x2={heroGeology.wellX} y2={wellBottom} className="hero-well" vectorEffect="non-scaling-stroke" />
      {[0.2, 0.4, 0.6, 0.8].map(f => {
        const y = wellTop + f * (wellBottom - wellTop);
        return <line key={f} x1={heroGeology.wellX - 7} x2={heroGeology.wellX + 7} y1={y} y2={y} className="hero-perforation" vectorEffect="non-scaling-stroke" />;
      })}
      {injecting && <line className="hero-inject" x1={heroGeology.wellX} y1="0" x2={heroGeology.wellX} y2={wellTop}
        strokeDasharray="6 10" vectorEffect="non-scaling-stroke" />}
    </svg>
  );
});

/* =====================================================
   Labels and the depth axis (HTML, so text is not stretched)
   ===================================================== */
const HeroLabels = React.memo(() => (
  <div className="hero-annotations">
    <p className="visually-hidden">
      Cross-section, from the surface down: overburden, an overlying aquifer, a caprock, the storage aquifer the well injects into,
      and underburden, cut by two faults.
    </p>
    <div className="hero-axis" aria-hidden="true">
      <span className="hero-axis__rule hero-axis__rule--upper" />
      <span className="hero-axis__break" style={{ top: `${heroFixed(100 * 14 / 580)}%` }} />
      <span className="hero-axis__rule hero-axis__rule--lower" style={{ top: `${heroFixed(100 * 21 / 580)}%` }} />
      {[[0, '0 m'], ...HeroGeology.depthTicks().map(depth => [HeroGeology.depthToY(depth), `${depth} m`])].map(([y, label]) => (
        <span key={label} className="hero-axis__tick" style={{ top: `${heroFixed(100 * y / 580)}%` }}>{label}</span>
      ))}
    </div>
    {HERO_FAULTS.map((fault, i) => (
      <span key={i} className="hero-fault-label" aria-hidden="true" style={{ left: `${heroFixed(fault.top.x / 10 + 0.6)}%` }}>F{i + 1}</span>
    ))}
    {HERO_LABELS.map(label => (
      <span key={`${label.set}-${label.text}`} className={`hero-label hero-label--${label.set}`} aria-hidden="true"
        style={{ top: heroDepthTop(label.y) }}>{label.text}</span>
    ))}
  </div>
));

/* =====================================================
   Player — controls, the CO2 inventory and the scale note
   ===================================================== */
const HeroPlayer = ({ year, playing, speed, frame, injectionYears, exaggeration, controls }) => {
  const phase = heroPhase(year, injectionYears);
  const inventory = frame ? frame.inventory : { mobile: 0, residual: 0, leaked: 0, injected: 0 };
  const share = value => (inventory.injected > 0 ? Math.round(100 * value / inventory.injected) : 0);
  const classes = [['mobile', 'Mobile', inventory.mobile], ['residual', 'Residual', inventory.residual], ['leaked', 'Leaked', inventory.leaked]];
  const shownYear = Math.round(year);
  return (
    <div className="hero-player" role="group" aria-label="Live model controls">
      <div className="hero-player__controls">
        <button type="button" className="hero-player__play" onClick={controls.toggle} aria-label={playing ? 'Pause simulation' : 'Play simulation'}>
          <Icon name={playing ? 'pause' : 'play'} size={14} />
        </button>
        <input className="hero-player__scrub" type="range" min="0" max={HERO_YEARS} step="1" value={shownYear}
          aria-label="Simulation year" aria-valuetext={`Year ${shownYear}, ${phase}`}
          onChange={event => controls.scrub(parseFloat(event.target.value))} />
        <button type="button" className="hero-player__small" onClick={controls.restart} aria-label="Restart simulation">
          <Icon name="restart" size={15} />
        </button>
        <button type="button" className="hero-player__small hero-player__speed" onClick={controls.speed} aria-label={`Playback speed ${speed} times`}>{speed}×</button>
      </div>
      <p className="hero-player__title">Live VE model, year <span className="hero-player__year">{shownYear}</span> <span className="hero-player__phase">{phase}</span></p>
      <div className="hero-player__bar" role="img"
        aria-label={`Of the CO₂ injected so far: ${share(inventory.mobile)}% mobile, ${share(inventory.residual)}% residually trapped, ${share(inventory.leaked)}% leaked into the overlying aquifer.`}>
        {classes.map(([key, , value]) => <span key={key} className={`is-${key}`} style={{ width: `${inventory.injected > 0 ? 100 * value / inventory.injected : 0}%` }} />)}
      </div>
      <ul className="hero-player__legend" aria-hidden="true">
        {classes.map(([key, label, value]) => <li key={key}><i className={`is-${key}`} />{label} {share(value)}%</li>)}
      </ul>
      <p className="hero-player__note">Schematic saline aquifer, 10 km wide, vertical exaggeration ×{exaggeration}.</p>
    </div>
  );
};

/* =====================================================
   Sky — moonlight and drifting clouds above a Highland field site.
   ===================================================== */
const Sky = () => {
  const skyRef = useRef(null);
  useEffect(() => {
    const sky = skyRef.current;
    const hero = sky.closest('#home');
    const starsLayer = sky.querySelector('.hero-stars');
    const stars = [...starsLayer.children];
    const motion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame;
    const reset = () => {
      window.cancelAnimationFrame(frame);
      stars.forEach(star => star.style.setProperty('--star-near', '0'));
    };
    const move = event => {
      if (!motion.matches || event.pointerType !== 'mouse') return;
      const rect = sky.getBoundingClientRect();
      const x = event.clientX - rect.left, y = event.clientY - rect.top;
      if (!rect.width || !rect.height || x < 0 || x > rect.width || y < 0 || y > rect.height) {
        reset();
        return;
      }
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        stars.forEach(star => {
          const sx = parseFloat(star.style.left) / 100 * rect.width;
          const sy = parseFloat(star.style.top) / 100 * rect.height;
          const proximity = Math.max(0, 1 - Math.hypot(x - sx, y - sy) / 90);
          star.style.setProperty('--star-near', proximity.toFixed(3));
        });
      });
    };
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', reset);
    window.addEventListener('scroll', reset, { passive: true });
    motion.addEventListener('change', reset);
    return () => {
      reset();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', reset);
      window.removeEventListener('scroll', reset);
      motion.removeEventListener('change', reset);
    };
  }, []);

  return useMemo(() => (
  <div ref={skyRef} data-layer="sky" aria-hidden="true" style={{
    position: 'absolute', inset: '0 0 auto', height: 'var(--hero-surface)',
    overflow: 'hidden', pointerEvents: 'none',
    background: 'linear-gradient(180deg, #070d1a 0%, #111e32 58%, #253449 100%)',
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at 82% 28%, rgba(159,183,209,0.1), transparent 52%)',
    }}/>
    <div className="hero-stars">
    {Array.from({ length: 108 }, (_, i) => <span key={i} className={`hero-star${i % 7 === 0 ? ' hero-star-twinkle' : ''}`} style={{
      left: `${(i * 61.803 + 3) % 100}%`, top: `${10 + (i * i * 17.31) % 67}%`,
      width: i % 11 === 0 ? 2 : 1.25, height: i % 11 === 0 ? 2 : 1.25,
      '--star-base': 0.32 + (i % 5) * 0.08,
      '--star-period': `${6 + i % 5}s`, '--star-delay': `${-i * .73}s`,
      boxShadow: i % 11 === 0 ? '0 0 5px rgba(176,206,238,0.35)' : 'none',
    }}/>) }
    </div>
    <div className="hero-moon">
      <svg viewBox="0 0 64 64" width="100%" height="100%">
        <defs>
          <radialGradient id="moon-disc" cx=".35" cy=".3" r=".75">
            <stop stopColor="#edf0e5" /><stop offset=".7" stopColor="#c8d1cf" /><stop offset="1" stopColor="#97a8b6" />
          </radialGradient>
          <filter id="moon-soft"><feGaussianBlur stdDeviation=".6" /></filter>
        </defs>
        <circle cx="32" cy="32" r="29" fill="url(#moon-disc)" filter="url(#moon-soft)" />
        <g fill="#697f91" opacity=".15" filter="url(#moon-soft)">
          <ellipse cx="22" cy="23" rx="7" ry="9" />
          <ellipse cx="37" cy="41" rx="9" ry="7" />
          <circle cx="43" cy="22" r="4" /><circle cx="20" cy="42" r="3" />
        </g>
      </svg>
    </div>
    <div className="hero-night-clouds" style={{position: 'absolute', inset: 0, opacity: .55}}>
      <svg viewBox="0 0 1000 420" preserveAspectRatio="none" width="104%" height="100%" style={{marginLeft: '-2%'}}>
        <defs>
          <linearGradient id="night-cloud-lit" x1="0" y1="0" x2="0.2" y2="1">
            <stop stopColor="#a1b6cd" stopOpacity="0.45"/>
            <stop offset="25%" stopColor="#536780" stopOpacity="0.60"/>
            <stop offset="65%" stopColor="#23324a" stopOpacity="0.88"/>
            <stop offset="100%" stopColor="#152137" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="night-cloud-shadow" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#34415d" stopOpacity="0.72"/>
            <stop offset="30%" stopColor="#131d31" stopOpacity="0.94"/>
            <stop offset="100%" stopColor="#101b2c" stopOpacity="0"/>
          </linearGradient>
          <filter id="night-cloud-texture" x="-10%" y="-30%" width="120%" height="160%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.009 0.025" numOctaves="3" seed="12" result="cloud-noise"/>
            <feColorMatrix in="cloud-noise" type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  3 0 0 0 -1" result="cloud-density"/>
            <feDisplacementMap in="SourceGraphic" in2="cloud-noise" scale="38" xChannelSelector="R" yChannelSelector="G"/>
            <feGaussianBlur stdDeviation="6"/>
            <feComposite in2="cloud-density" operator="in"/>
            <feGaussianBlur stdDeviation="1"/>
          </filter>
        </defs>
        {/* Thin, textured banks drift in front of the moon. */}
        <g filter="url(#night-cloud-texture)">
          <g fill="url(#night-cloud-lit)">
            <path opacity="0.55" d="M 390 144 C 445 130 471 147 511 125 C 537 111 563 122 594 110 C 631 92 661 109 687 90 C 729 66 755 91 798 77 C 859 62 882 98 936 84 L 1100 81 L 1100 226 C 916 223 858 185 715 203 C 596 213 496 171 390 185 Z"/>
            <path d="M 557 215 C 603 188 625 207 650 187 C 677 165 699 182 722 159 C 741 143 764 163 782 149 C 816 121 839 147 864 136 C 887 126 917 155 943 140 C 991 114 1041 138 1100 118 L 1100 314 C 1023 294 960 317 885 284 C 787 252 723 284 651 250 C 611 235 585 240 557 248 Z"/>
            <path opacity="0.46" d="M 150 300 C 219 278 257 292 294 275 C 330 258 364 285 400 261 C 431 240 463 263 492 247 C 529 226 555 253 600 241 C 654 226 684 259 725 245 L 832 279 L 901 365 C 690 337 637 355 484 328 C 347 315 259 340 150 332 Z"/>
          </g>
          <g fill="url(#night-cloud-shadow)">
            <path d="M 731 256 C 778 228 808 250 831 225 C 854 206 877 223 901 203 C 929 176 956 207 983 190 C 1022 174 1055 194 1100 181 L 1100 408 L 833 390 C 815 328 778 301 731 295 Z"/>
            <path opacity="0.75" d="M -80 343 C 4 322 43 341 87 317 C 128 293 157 323 202 304 C 244 280 283 308 320 292 C 362 273 387 311 435 298 L 561 372 L 628 432 L -80 432 Z"/>
          </g>
        </g>
      </svg>
    </div>
    {/* A dark left veil protects the identity; a cool horizon ties into the blue reservoirs. */}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(90deg, rgba(8,14,28,0.94) 0%, rgba(8,14,28,0.72) 29%, rgba(8,14,28,0.15) 58%, transparent 78%)',
    }}/>
    <svg className="hero-landscape" viewBox="0 0 1440 180" preserveAspectRatio="none">
      <defs>
        <linearGradient id="highland-distant" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#2e4053" /><stop offset="1" stopColor="#152333" />
        </linearGradient>
        <linearGradient id="highland-near" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#172b3b" /><stop offset="1" stopColor="#0b171f" />
        </linearGradient>
        <linearGradient id="highland-mist" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#a5bcd3" stopOpacity="0" /><stop offset=".62" stopColor="#a5bcd3" stopOpacity=".16" /><stop offset="1" stopColor="#a5bcd3" stopOpacity="0" />
        </linearGradient>
        <filter id="highland-soft"><feGaussianBlur stdDeviation="5" /></filter>
        <path id="highland-ridge" d="M0 138L80 123L155 130L228 112L292 119L357 90L403 96L457 70L489 74L540 41L568 53L600 48L647 77L693 61L738 80L804 50L846 27L880 44L912 40L950 73L1014 91L1060 81L1131 97L1201 61L1240 69L1290 46L1336 73L1390 64L1440 88V180H0Z" />
        <clipPath id="highland-ridge-clip"><use href="#highland-ridge" /></clipPath>
        <filter id="highland-rock-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".18 .32" numOctaves="2" seed="18" />
          <feColorMatrix type="saturate" values="0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <use href="#highland-ridge" fill="url(#highland-distant)" />
      <g clipPath="url(#highland-ridge-clip)">
        <path d="M540 41L517 76L489 104L453 121L499 96L533 82L560 111L594 125L568 53Z
          M846 27L825 61L792 89L747 112L795 96L830 80L866 116L902 126L880 44Z
          M1290 46L1265 75L1238 104L1197 130L1260 109L1294 91L1333 123L1357 129L1336 73Z" fill="#111e2b" opacity=".64" />
        <path d="M543 43L533 60L547 56L555 68L568 53M850 29L838 49L852 43L866 58L878 45M1292 49L1284 64L1298 60L1308 74L1317 66"
          fill="none" stroke="#a0b1ba" strokeWidth="1.1" strokeOpacity=".34" />
        <path d="M536 66l-14 27 -28 17m48 -31l17 30 16 12m267 -63l-15 32 -21 15m47 -39l19 30 22 16m395 -33l-22 24 -16 8"
          fill="none" stroke="#718594" strokeWidth=".8" strokeOpacity=".25" />
        <rect width="1440" height="180" filter="url(#highland-rock-grain)" opacity=".075" />
      </g>
      <path d="M0 155Q120 120 220 147T402 118L476 106L528 112L585 91L638 109L694 102L761 126L837 108L910 125L991 110L1057 126L1140 112L1210 126L1290 98L1351 104L1440 128V180H0Z" fill="url(#highland-near)" />
      <path d="M466 116Q523 125 584 102M743 140Q821 121 889 136M1071 141Q1131 127 1198 140M1223 132Q1291 113 1357 120"
        fill="none" stroke="#536c78" strokeWidth=".8" strokeOpacity=".24" />
      <path d="M360 139Q620 112 871 133T1470 128" stroke="url(#highland-mist)" strokeWidth="20" fill="none" filter="url(#highland-soft)" />
      <path d="M453 158Q513 151 578 156L670 160Q574 168 467 162Z" fill="#7897a5" opacity=".16" />
      <path d="M477 159h58m17 2h62m-102 2h22" stroke="#9cb5c1" strokeWidth=".6" opacity=".25" />
      <path d="M0 171Q142 164 264 173T490 165T730 171T958 167T1220 170T1440 164V180H0Z" fill="#0a151b" />
      {/* A narrow gravel track and irregular vegetation give the field site context. */}
      <path d="M626 149Q686 151 718 159T842 170Q900 174 949 180H970Q911 170 849 166T728 155Q684 147 626 149Z" fill="#45504e" opacity=".42" />
      <path d="M666 151Q723 158 766 161M812 168Q878 172 919 176" stroke="#9ba69a" strokeWidth=".7" strokeOpacity=".21" fill="none" />
      {[38, 57, 82, 104, 142, 167, 529, 552, 576, 700, 719].map((x, i) => {
        const y = 165 + Math.sin(i * 2.1) * 4, h = 11 + i % 4 * 4;
        return <g key={x} opacity={i < 6 ? '.8' : '.65'}>
          <path d={`M${x} ${y}v${-h}`} stroke="#233b3b" strokeWidth="1" />
          <path d={`M${x} ${y - h}l${-h * .3} ${h * .42}h${h * .15}l${-h * .24} ${h * .37}h${h * .78}l${-h * .24} ${-h * .37}h${h * .15}Z`}
            fill={i % 2 ? '#17302f' : '#112627'} />
          <path d={`M${x + 1} ${y - h + 3}l${h * .2} ${h * .3}`} stroke="#627f76" strokeWidth=".7" strokeOpacity=".3" />
        </g>;
      })}
      <path d="M7 177l18 -3 15 2 19 -2 17 3 22 -1 15 3m31 -1l17 -3 22 1 17 -2 13 3 18 -1" stroke="#667568" strokeOpacity=".25" strokeWidth="2" fill="none" />
      {Array.from({ length: 54 }, (_, i) => {
        const x = (i * 137.51 + 43) % 1440, y = 175 + i % 4;
        return <path key={i} d={`M${x} ${y}l-2 ${-3 - i % 4}m2 ${3 + i % 4}l3 -4`}
          stroke="#53685c" strokeWidth=".7" opacity={.24 + i % 3 * .08} />;
      })}
      <path d="M720 173L735 168L759 174M1115 172L1130 164L1151 172M1268 173L1280 167L1294 172" fill="#21333a" stroke="#48605e" strokeOpacity=".3" />
      <path d="M607 172l-3 -10m3 10l4 -7m566 8l-3 -13m3 13l5 -8m173 6l-2 -11m2 11l4 -5" stroke="#527067" strokeWidth="1" opacity=".65" />
    </svg>
    <div className="hero-rain">
      {Array.from({ length: 64 }, (_, i) => <span key={i} className="hero-rain-drop" style={{
        left: `${(i * 61.803 + 9) % 100}%`,
        '--rain-speed': `${.8 + i % 5 * .12}s`,
        '--rain-phase': `${-i * .13}s`,
        '--rain-length': `${14 + i % 6 * 3}px`,
        '--rain-alpha': .13 + i % 4 * .04,
      }}/>) }
    </div>
  </div>
), []);
};

// Decorative equipment stays anchored to the same surface and well as the live model.
const SurfaceSite = ({ geology, injecting }) => (
  <div className="hero-surface-site" aria-hidden="true" style={{ left: `${geology.wellXPct}%` }}>
    <svg viewBox="-140 0 540 160" width="100%" height="100%" fill="none">
      <defs>
        <linearGradient id="site-wall" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#43535a" /><stop offset="1" stopColor="#25363d" />
        </linearGradient>
        <radialGradient id="site-lamplight">
          <stop stopColor="#dec99d" stopOpacity=".2" /><stop offset="1" stopColor="#dec99d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="site-metal" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#98abae" /><stop offset=".3" stopColor="#597078" /><stop offset=".65" stopColor="#334850" /><stop offset="1" stopColor="#17272e" />
        </linearGradient>
        <linearGradient id="site-roof" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#6f8188" /><stop offset=".35" stopColor="#425961" /><stop offset="1" stopColor="#293c45" />
        </linearGradient>
        <linearGradient id="site-pad" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#52605c" /><stop offset="1" stopColor="#263732" />
        </linearGradient>
        <linearGradient id="site-window" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#d3c09a" /><stop offset="1" stopColor="#89754e" />
        </linearGradient>
        <linearGradient id="site-worklight" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#e2d3ac" stopOpacity=".12" /><stop offset="1" stopColor="#e2d3ac" stopOpacity="0" />
        </linearGradient>
        <path id="site-feed-route" d="M289 118H252Q246 118 246 124V130Q246 136 240 136H95Q87 136 87 128V120Q87 114 81 114H60" />
        <clipPath id="site-gravel-clip"><path d="M-124 153L-94 140L335 137L396 153L385 160H-131Z" /></clipPath>
      </defs>
      {/* A shallow gravel plane, contact shadows, and sparse wet highlights ground the equipment. */}
      <path d="M-124 153L-94 140L335 137L396 153L385 160H-131Z" fill="url(#site-pad)" />
      <g clipPath="url(#site-gravel-clip)">
        {Array.from({ length: 100 }, (_, i) => <path key={i}
          d={`M${-132 + (i * 97.37) % 535} ${139 + i * 7.31 % 22}l${1 + i % 3} -.4`}
          stroke={i % 3 ? '#8b9485' : '#131f22'} strokeWidth=".6" opacity={i % 3 ? '.25' : '.5'} />)}
        <path d="M-70 151l124 -1m54 5l55 -1m80 -7l96 -1m-152 11l28 -1" stroke="#a0afaa" strokeOpacity=".15" strokeWidth=".8" />
      </g>
      <path d="M-124 153L-94 140L335 137L396 153" stroke="#7c8b80" strokeOpacity=".3" strokeWidth=".6" />
      <ellipse cx="172" cy="148" rx="62" ry="8" fill="#09171a" opacity=".6" />
      <ellipse cx="292" cy="143" rx="45" ry="4" fill="#09171a" opacity=".6" />
      <ellipse cx="49" cy="156" rx="28" ry="3" fill="#07161a" opacity=".7" />
      {/* Small remote monitoring point to the left of the well. */}
      <path d="M-92 147h37l-5 4h-37Z" fill="#3b4c49" />
      <path d="M-78 147V99m0 8h13m-1 -4v7m-12 -6l-7 -3m7 3l8 -3" stroke="#7b9090" strokeWidth="1.1" />
      <circle cx="-78" cy="97" r="1.6" fill="#93a7a1" />
      <path d="M-95 121l22 -3 7 13 -23 3Z" fill="#213946" stroke="#6c8489" strokeWidth=".7" />
      <path d="M-89 121l6 12m1 -13l6 12m1 -13l6 12m-22 -7l20 -2" stroke="#a0b2b1" strokeWidth=".5" strokeOpacity=".28" />
      <path d="M-83 135v12" stroke="#5f7778" strokeWidth="1.4" />
      <rect x="-61" y="131" width="12" height="15" rx="1" fill="#33484c" stroke="#7a8d85" strokeWidth=".5" />
      <path d="M-58 135h6m-6 3h6" stroke="#11272d" />
      {/* Fence and feed line sit behind the shelter; the doorway remains clear. */}
      <g stroke="#7b8e87" strokeOpacity=".38" strokeWidth=".8">
        <path d="M258 135V100M291 138V103M326 141V106M361 144V109M395 147V112M258 104L395 116M258 127L395 139" />
        {[267, 276, 303, 312, 338, 347, 372, 381].map(x => <path key={x} d={`M${x} ${104 + (x - 258) * .087}l0 23`} strokeOpacity=".2" />)}
      </g>
      <path d="M95 138v11m-5 0h10m144 -13v10m-5 0h10" stroke="#657b76" strokeWidth="1.5" />
      <use href="#site-feed-route" stroke="#0e2027" strokeWidth="6" />
      <use href="#site-feed-route" stroke="url(#site-metal)" strokeWidth="3.8" />
      {/* The feed line pulses only while CO₂ is being injected. */}
      {injecting && <use className="hero-feed-flow" href="#site-feed-route" strokeWidth=".8" style={{ stroke: 'var(--sim-glow-free)' }} />}
      <path d="M101 132v8m4 -8v8m136 -12v8m4 -8v8" stroke="#a1b0a7" strokeWidth=".6" opacity=".55" />
      {/* Three-quarter shelter: moonlit roof, shaded side, siding, plinth, and entry steps. */}
      <path d="M126 145H210L234 134V140L210 151H126Z" fill="#182b2e" stroke="#73857b" strokeOpacity=".35" strokeWidth=".6" />
      <path d="M128 76L165 54L208 76V145H128Z" fill="url(#site-wall)" />
      <path d="M208 76L232 65V134L208 145Z" fill="#1a2d35" stroke="#62757a" strokeOpacity=".35" strokeWidth=".6" />
      <path d="M122 78L165 52L190 41L148 66Z" fill="#263d47" />
      <path d="M165 52L211 78L238 65L190 41Z" fill="url(#site-roof)" stroke="#809397" strokeOpacity=".65" strokeWidth=".7" />
      {[0, 1, 2, 3, 4, 5].map(i => <path key={i} d={`M${168 + i * 4} ${52 - i * 1.7}l43 24`}
        stroke="#a7b6b5" strokeWidth=".6" strokeOpacity=".23" />)}
      <path d="M121 79L165 54L210 79L238 66M210 79V145M128 145H208" stroke="#93a5a3" strokeOpacity=".45" strokeWidth=".8" />
      <g stroke="#99aaa3" strokeWidth=".55" strokeOpacity=".15">
        {[84, 91, 98, 105, 112, 119, 126, 133, 140].map(y => <path key={y} d={`M130 ${y}H206M212 ${y - 2}l18 -8`} />)}
      </g>
      <path d="M134 89H163V113H134Z" fill="#172b33" stroke="#9aa79b" strokeWidth=".7" />
      <path d="M137 92H160V110H137Z" fill="url(#site-window)" opacity=".86" />
      <path d="M148 92V110M137 101H160M133 114H165" stroke="#405254" strokeWidth="1" />
      <path d="M137 93H159" stroke="#edddbd" strokeWidth=".5" opacity=".6" />
      <path d="M177 91H201V145H177Z" fill="#122831" stroke="#758881" strokeWidth=".7" />
      <path d="M180 94H198V137H180Z" stroke="#566d70" strokeOpacity=".45" strokeWidth=".6" />
      <rect x="183" y="98" width="11" height="9" fill="#38515a" stroke="#718781" strokeWidth=".5" />
      <path d="M195 121h3" stroke="#abb8a8" strokeWidth="1" />
      <path d="M175 145H202L205 149H173Z" fill="#6b7970" /><path d="M173 149H205V152H171V155H208" stroke="#52675f" strokeWidth="2" />
      <path d="M214 90l13 -6v15l-13 6Z" fill="#0d222a" stroke="#647b7a" strokeWidth=".5" />
      <path d="M216 94l9 -4m-9 7l9 -4m-9 7l9 -4" stroke="#62797c" strokeWidth=".7" />
      <path d="M231 74V134l-6 3" stroke="#7b8c88" strokeWidth="1" strokeOpacity=".6" />
      <ellipse cx="148" cy="146" rx="39" ry="10" fill="url(#site-lamplight)" />
      {/* Compact process skid with pressure vessel, end caps, valves, and control cabinet. */}
      <path d="M259 137H328L336 140H265Z" fill="#4b625f" stroke="#7b9187" strokeWidth=".6" />
      <path d="M267 135V127m50 9v-9M262 118H327" stroke="#587277" strokeWidth="2" />
      <rect x="268" y="112" width="55" height="14" rx="6" fill="url(#site-metal)" stroke="#96aaa7" strokeWidth=".65" />
      <ellipse cx="272" cy="119" rx="4" ry="6" fill="#4a6068" stroke="#9aadaa" strokeWidth=".6" />
      <path d="M284 113V126M307 113V126" stroke="#a5b3ac" strokeWidth="1" strokeOpacity=".45" />
      <path d="M284 112V104h9m12 8v-10h9" stroke="#718b88" strokeWidth="2" />
      <path d="M289 101v6m21 -8v6" stroke="#a1b2a6" strokeWidth="1" />
      <circle cx="302" cy="109" r="3" fill="#1a3039" stroke="#9baea8" strokeWidth=".6" />
      <path d="M302 109l1 -1.5" stroke="#c5d0bb" strokeWidth=".7" />
      <path d="M332 109l13 -3v29l-13 3Z" fill="#243c43" stroke="#738b82" strokeWidth=".65" />
      <path d="M335 114l7 -1.5m-7 4.5l7 -1.5m-7 4.5l7 -1.5" stroke="#526d70" strokeWidth=".6" />
      {/* Shielded warm worklight; the beam stays on the pad. */}
      <path d="M359 147V58h-17" stroke="#869a97" strokeWidth="1.8" />
      <path d="M348 60L320 147H379Z" fill="url(#site-worklight)" />
      <path d="M337 58h16l-2 3h-13Z" fill="#263f47" stroke="#9aada5" strokeWidth=".6" />
      <path d="M339 61h11" stroke="#dfcea4" strokeWidth="1.3" />
      <ellipse cx="349" cy="146" rx="43" ry="8" fill="url(#site-lamplight)" />
      <g className="hero-wellhead">
        <rect x="27" y="156" width="42" height="4" rx="1" fill="#354c50" stroke="#8b9e97" strokeWidth=".7" />
        <path d="M48 107V157M33 119H61" stroke="url(#site-metal)" strokeWidth="5" />
        <path d="M41 145H55M41 138H55M41 129H55M41 110H55" stroke="#8da19b" strokeWidth="1.5" />
        <rect x="42" y="132" width="12" height="9" rx="1" fill="#304b54" stroke="#91a6a0" strokeWidth=".65" />
        <rect x="42" y="114" width="12" height="9" rx="1" fill="#304b54" stroke="#91a6a0" strokeWidth=".65" />
        <path d="M42 137H35m0 -3v6M60 114v8M45 109H51" stroke="#b1bdb0" strokeWidth="1" />
        <circle cx="33" cy="119" r="4" stroke="#899f96" strokeWidth=".9" />
        <path d="M29 119h8m-4 -4v8" stroke="#718a82" strokeWidth=".7" />
        <circle cx="48" cy="104" r="4" fill="#152e38" stroke="#9bafa8" strokeWidth=".7" />
        <path d="M46 106l3 -3" stroke="#c3d1bf" strokeWidth=".8" />
        <circle data-site-status="true" cx="51" cy="136" r="1.2" style={{ fill: injecting ? 'var(--sim-glow-free)' : '#647b79' }} />
        <path d="M32 159h3m27 0h3" stroke="#a6b4a6" strokeWidth="1" />
      </g>
    </svg>
  </div>
);

const HeroName = ({ variant }) => {
  const titleRef = useRef(null);
  useEffect(() => {
    const title = titleRef.current;
    const hero = title.closest('#home');
    const words = [...title.querySelectorAll('.hero-name-word')];
    const contours = [...title.querySelectorAll('.hero-name-contour')];
    const motion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame;
    const reset = () => {
      window.cancelAnimationFrame(frame);
      title.style.transform = '';
      title.removeAttribute('data-lit');
      contours.forEach(contour => contour.style.transform = '');
    };
    const move = event => {
      if (!motion.matches || event.pointerType !== 'mouse') return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const rect = title.getBoundingClientRect();
        if (!rect.width || !rect.height) return reset();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const near = x > -0.25 && x < 1.25 && y > -1 && y < 2;
        if (!near) return reset();
        const dx = Math.max(-1, Math.min(1, (x - 0.5) * 2)) * 4;
        const dy = Math.max(-1, Math.min(1, (y - 0.5) * 2)) * 3;
        title.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        title.setAttribute('data-lit', '');
        contours.forEach(contour => {
          const depth = Number(contour.dataset.depth);
          contour.style.transform = `translate3d(${depth * (0.3 + dx * 0.05)}px, ${depth * (0.2 + dy * 0.04)}px, 0)`;
        });
        words.forEach(word => {
          const bounds = word.getBoundingClientRect();
          word.style.setProperty('--name-light-x', `${(event.clientX - bounds.left) / bounds.width * 100}%`);
        });
      });
    };
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', reset);
    window.addEventListener('scroll', reset, { passive: true });
    motion.addEventListener('change', reset);
    return () => {
      reset();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', reset);
      window.removeEventListener('scroll', reset);
      motion.removeEventListener('change', reset);
    };
  }, []);

  return (
    <h1 ref={titleRef} id="hero-name" className="hero-name" data-name-style={variant} aria-label="Sa’eed Telvari">
      {['Sa\u2019eed', 'Telvari'].map((word, index) => (
        <React.Fragment key={word}>
          {index > 0 && ' '}
          <span className="hero-name-word" data-word={word} aria-hidden="true">
            {variant === 'contour' && (
              <span className="hero-name-contours">
                {[1, 2, 3, 4, 5, 6].map(depth => (
                  <span key={depth} className="hero-name-contour" data-depth={depth} data-word={word}
                    style={{ '--contour-depth': depth }}>{word}</span>
                ))}
              </span>
            )}
            <span className="hero-name-ink" data-word={word}>{word}</span>
          </span>
        </React.Fragment>
      ))}
    </h1>
  );
};

const Identity = React.memo(({ onNavigate }) => (
  <div className="hero-identity" data-name-style="contour">
    <p className="hero-role hero-reveal">PhD candidate, Heriot-Watt University</p>
    <HeroName variant="contour" />
    <p className="hero-summary hero-reveal">
      I build vertical-equilibrium models of CO<sub>2</sub> storage in depleted gas fields: reduced-order simulators
      that run up to 100× faster than full 3D compositional models.
    </p>
    <div className="hero-actions hero-reveal">
      <a className="btn btn--primary" href="./simulator.html" onClick={event => onNavigate && onNavigate('simulator', event)}>
        <Icon name="play" size={14} />Open the CO₂ simulator
      </a>
      <a className="btn btn--quiet" href="./cv.html" onClick={event => onNavigate && onNavigate('cv', event)}>Read my CV</a>
      <ul className="hero-profiles">
        {HERO_PROFILES.map(({ icon, label, href }) => (
          <li key={icon}>
            <a href={href} aria-label={label} title={label} {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
              <Icon name={icon} size={18} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  </div>
));

Object.assign(window, { SubsurfaceHero });
