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

// Fault traces and the segment each one leaks through: storage roof up to the overlying aquifer's base,
// then the buoyant rise through the overlying aquifer to its roof, where leaked CO2 pools.
const HERO_FAULTS = heroGeology.faults.map(fault => {
  const to = getStratumFaultIntersection(fault, 0.4, heroGeology.shallowThickness, heroGeology);
  return {
    top: { x: fault.xPercent * 10, y: 0 },
    bottom: { x: fault.xPercent * 10 + fault.dipSlope * 480, y: 480 },
    from: getFaultIntersection(fault, 1, heroGeology),
    to,
    rise: { x: to.x, y: heroOverlying.roofR[Math.max(0, Math.min(200, Math.round(to.x / 5)))] + 3 },
  };
});
// Leak dots advance this many pixels per unit of CO2 a fault has passed.
const HERO_LEAK_DOTS = 12;

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
  return { h: mix(a.h, b.h), hMax: mix(a.hMax, b.hMax), h2: mix(a.h2, b.h2), h2Max: mix(a.h2Max, b.h2Max),
    faultFlow: b.faultFlow, faultLeaked: mix(a.faultLeaked, b.faultLeaked), inventory };
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
      <HeroPlume frame={frame} />
      <HeroOverlay injecting={injecting} />
      <SurfaceSite geology={heroGeology} injecting={injecting} moored={year < injectionYears} />
      <HeroLabels />
      <HeroLeakReadout frame={frame} />
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
  // Fine bedding is decoration: draw it once the hero has painted.
  const [detail, setDetail] = useState(false);
  useEffect(() => {
    const show = () => setDetail(true);
    const idle = window.requestIdleCallback;
    const id = idle ? idle(show, { timeout: 1200 }) : window.setTimeout(show, 200);
    return () => (idle ? window.cancelIdleCallback(id) : window.clearTimeout(id));
  }, []);
  return (
    <svg ref={sectionRef} className="hero-svg hero-svg--rock" viewBox="0 0 1000 580" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="hero-shale" width="18" height="6" patternUnits="userSpaceOnUse">
          <rect width="18" height="6" className="hero-rock--cap" />
          <path d="M1 3h9M12 1h5" stroke="#9fb3c8" strokeOpacity=".3" strokeWidth=".8" />
        </pattern>
        <pattern id="hero-sand" width="9" height="9" patternUnits="userSpaceOnUse">
          <rect width="9" height="9" className="hero-rock--sand" />
          <circle cx="2" cy="2" r=".9" fill="#9fb3c8" fillOpacity=".4" />
          <circle cx="6.5" cy="6" r=".7" fill="#9fb3c8" fillOpacity=".3" />
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
      {/* Sea water above the seabed: about 90 m, a hairline at this depth scale. */}
      <rect width="1000" height="3" fill="#0b1a2c" />
      <path d={HERO_PATHS.caprock} fill="url(#hero-shale)" />
      <path d={HERO_PATHS.overlying} fill="url(#hero-sand)" />
      <path d={HERO_PATHS.storage} fill="url(#hero-sand)" />
      <path d={AQUIFER_PATH} className="hero-rock--base" />
      <g clipPath="url(#hero-lower-rock)">
        <rect width="1000" height="580" fill="url(#descent-rock-shale)" mask="url(#hero-lower-texture-mask)"/>
        <rect width="1000" height="580" fill="url(#hero-descent-bridge)"/>
      </g>
      {detail && <GeologyTexture faults={heroGeology.faults} geology={heroGeology} />}
      {/* Each fault's damage zone through the caprock: grey while it seals. */}
      {HERO_FAULTS.map((fault, i) => <line key={i} x1={fault.from.x} y1={fault.from.y} x2={fault.to.x} y2={fault.to.y}
        className="hero-fault-zone" vectorEffect="non-scaling-stroke" />)}
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
          fill={i % 3 ? '#b8c7d6' : '#05080f'} opacity={i % 3 ? 0.13 : 0.3}/>) }
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
        stroke="#93b7c2" strokeWidth="0.7" opacity="0.12" strokeDasharray="47 6 18 4 83 9"/>) }
    </g>
  </g>;
}, [faults, g]);

/* =====================================================
   Plume — CO2 in the simulator's class colours, redrawn per frame
   ===================================================== */
const HeroPlume = ({ frame }) => {
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
        const conduit = `M${fault.from.x} ${fault.from.y}L${fault.to.x} ${fault.to.y}`;
        const rise = `M${fault.to.x} ${fault.to.y}L${fault.rise.x} ${heroFixed(fault.rise.y)}`;
        return (
          <g key={i} data-layer="fault-leak" opacity={0.45 + 0.55 * strength}>
            <path d={conduit} className="hero-leak-halo" vectorEffect="non-scaling-stroke" />
            <path d={rise} className="hero-leak-halo hero-leak-halo--rise" vectorEffect="non-scaling-stroke" />
            <path d={conduit} className="hero-leak" vectorEffect="non-scaling-stroke" />
            {/* Dots advance with the volume this fault has passed: they move at the leak rate and stop when paused. */}
            <path d={conduit + rise.replace('M', 'L')} className="hero-leak-dots" strokeDasharray="0 11"
              strokeDashoffset={heroFixed(-frame.faultLeaked[i] * HERO_LEAK_DOTS)} vectorEffect="non-scaling-stroke" />
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
   Leak readout — beside a leaking fault, from the model's own numbers
   ===================================================== */
const HeroLeakReadout = ({ frame }) => {
  const leak = frame && HeroGeology.leakReadout(heroGeology, heroSection, frame);
  if (!leak) return null;
  const { to } = HERO_FAULTS[leak.fault];
  // Sit on the side of the fault away from the well, unless that side has no room for the label.
  const placeLeft = to.x < heroGeology.wellX ? to.x > 380 : to.x > 750;
  const side = placeLeft ? { right: `calc(${heroFixed(100 - to.x / 10)}% + 22px)` } : { left: `calc(${heroFixed(to.x / 10)}% + 22px)` };
  return (
    <div className="hero-leak-readout" aria-hidden="true" style={{ ...side, top: heroDepthTop(to.y) }}>
      <strong>F{leak.fault + 1} leaking</strong>
      <span>{leak.state === 'above'
        ? `CO₂ column ${leak.column} m, above the ${leak.entry} m entry height`
        : `CO₂ column held at the ${leak.entry} m entry height`}</span>
      <span className="hero-leak-readout__share">{leak.leakedPct}% of injected CO₂ has leaked</span>
    </div>
  );
};

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
    {/* The North Sea at night: haze on the horizon, then swell running down to sea level at the section. */}
    <svg className="hero-landscape" viewBox="0 0 1440 180" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sea-surface" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#1a2c45" /><stop offset=".35" stopColor="#0f1d31" /><stop offset="1" stopColor="#060d18" />
        </linearGradient>
        <linearGradient id="sea-haze" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#a5bcd3" stopOpacity="0" /><stop offset="1" stopColor="#a5bcd3" stopOpacity=".14" />
        </linearGradient>
      </defs>
      <rect y="66" width="1440" height="24" fill="url(#sea-haze)" />
      <rect y="90" width="1440" height="90" fill="url(#sea-surface)" />
      <path d="M0 90.5H1440" stroke="#3a5577" strokeOpacity=".7" vectorEffect="non-scaling-stroke" />
      {/* Swell strokes lengthen and brighten towards the viewer. */}
      {Array.from({ length: 90 }, (_, i) => {
        const t = (i * 0.618034) % 1, x = (i * 137.51 + 29) % 1440;
        return <path key={i} d={`M${heroFixed(x)} ${heroFixed(94 + t * t * 84)}h${heroFixed(10 + t * 70)}`}
          stroke="#4a6688" strokeOpacity={heroFixed(.07 + t * .17)} vectorEffect="non-scaling-stroke" />;
      })}
    </svg>
    {/* Moonlight on the water, kept under the moon at every width. */}
    <svg className="hero-glitter" viewBox="0 0 120 90" preserveAspectRatio="none">
      {Array.from({ length: 26 }, (_, i) => {
        const t = i / 25, w = 6 + t * 50 * (.6 + (i * .37) % .4);
        return <rect key={i} x={heroFixed(60 - w / 2 + Math.sin(i * 2.3) * (4 + t * 10))} y={heroFixed(2 + t * 86)}
          width={heroFixed(w)} height="1.2" fill="#d6e1ef" opacity={heroFixed(.6 - t * .4)} />;
      })}
    </svg>
    {/* Distant offshore features sit on the horizon at fixed size, so they never stretch. */}
    <div className="hero-horizon">
      <svg className="hero-horizon__item" style={{ left: '33%' }} width="34" height="20" viewBox="0 0 34 20">
        <path d="M8 20V11h18v9M10 11V6h8v5M22 11V2" stroke="#2b3e57" strokeWidth="1.2" fill="none" />
        <circle cx="22" cy="2" r="1" fill="#ff5a4f" opacity=".8" /><circle cx="13" cy="8.5" r=".9" fill="#e9c98f" />
        <circle cx="19" cy="14" r=".9" fill="#e9c98f" opacity=".7" />
      </svg>
      <svg className="hero-horizon__item" style={{ left: '50%' }} width="200" height="32" viewBox="0 0 200 32">
        {[[14, 26, 0], [44, 24, 40], [72, 22, 75], [98, 20, 20], [122, 18, 95], [144, 17, 55], [164, 15, 10], [182, 14, 80]].map(([x, h, a]) => {
          const top = 32 - h, r = h * .42;
          const blade = k => { const t = (a + k * 120) * Math.PI / 180; return `M${x} ${top}l${heroFixed(r * Math.cos(t))} ${heroFixed(r * Math.sin(t))}`; };
          return <g key={x}>
            <path d={`M${x} 32V${top}${blade(0)}${blade(1)}${blade(2)}`} stroke="#3a5070" strokeWidth=".9" fill="none" />
            <circle cx={x} cy={top} r="1.1" fill="#ff5a4f" opacity=".8" />
          </g>;
        })}
      </svg>
    </div>
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

// Decorative equipment stays anchored to the same surface and well as the live model:
// an offshore injection platform over the well, and a CO₂ carrier moored alongside while injecting.
const HERO_RIG_WINDOWS = [[2, 76, 9], [2, 84, 9], [2, 92, 9], [66, 64, 7], [66, 71, 7], [66, 78, 7], [66, 85, 7], [66, 92, 7]]
  .flatMap(([x0, y, n]) => Array.from({ length: n }, (_, i) => [x0 + i * 6, y, (i * 7 + y * 3) % 5]))
  .filter(([, , lit]) => lit < 3);
const SurfaceSite = ({ geology, injecting, moored }) => (
  <div className="hero-surface-site" aria-hidden="true" style={{ left: `${geology.wellXPct}%` }}>
    <svg viewBox="-140 0 540 160" width="100%" height="100%" fill="none">
      <defs>
        <linearGradient id="rig-steel" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#1b293b" /><stop offset=".7" stopColor="#2c3e55" /><stop offset="1" stopColor="#5d7493" />
        </linearGradient>
        <linearGradient id="rig-module" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#2a3c54" /><stop offset="1" stopColor="#18263a" />
        </linearGradient>
        <linearGradient id="ship-hull" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#24364e" /><stop offset="1" stopColor="#111c2c" />
        </linearGradient>
        <linearGradient id="ship-tank" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#7d93ad" /><stop offset=".35" stopColor="#3d5270" /><stop offset="1" stopColor="#1c2a3e" />
        </linearGradient>
        <linearGradient id="ship-light-reflection" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#e9c98f" stopOpacity=".4" /><stop offset="1" stopColor="#e9c98f" stopOpacity="0" />
        </linearGradient>
        <path id="site-feed-route" d="M238 114Q176 150 112 101" />
      </defs>
      {/* The carrier is moored through the injection period and sails once injection ends. */}
      <g className={`hero-ship${moored ? '' : ' is-away'}`}>
        <path d="M150 154H392" stroke="#08111d" strokeWidth="3" opacity=".6" />
        <path d="M150 152Q146 152 146 146L144 134H382Q392 134 398 126L394 142Q388 152 372 152Z" fill="url(#ship-hull)" stroke="#6f87a6" strokeOpacity=".35" strokeWidth=".6" />
        <path d="M147 148H391" stroke="#5a2f35" strokeWidth="1.6" opacity=".7" />
        <path d="M144 134H382Q392 134 398 126" stroke="#9fb3c8" strokeOpacity=".45" strokeWidth=".7" />
        {[226, 284, 342].map(x => <rect key={x} x={x - 26} y="120" width="52" height="15" rx="7.5" fill="url(#ship-tank)" stroke="#9fb3c8" strokeOpacity=".3" strokeWidth=".5" />)}
        <path d="M160 134V98H194V134Z" fill="#22344c" stroke="#7d93ad" strokeOpacity=".35" strokeWidth=".6" />
        <path d="M155 98H199V93H155Z" fill="#2c4060" />
        {[104, 111, 118, 125].map((y, i) => <path key={y} d={`M164 ${y}h26`} stroke="#e9c98f" strokeWidth="2" strokeDasharray="3 2" opacity={i ? .4 : .9} />)}
        <path d="M168 93V84h8v9" fill="#1b2a3d" />
        <path d="M184 93V78M180 82h8" stroke="#7d93ad" strokeWidth="1" />
        <circle cx="184" cy="77" r="1.4" fill="#f4f7fb" />
        <circle cx="395" cy="127" r="1.2" fill="#f4f7fb" />
        <path d="M238 120V112h5" stroke="#7d93ad" strokeWidth="1" />
        {[166, 176, 186].map(x => <rect key={x} x={x} y="153" width="1.4" height="7" fill="url(#ship-light-reflection)" />)}
        {moored && <use href="#site-feed-route" stroke="#0e1a28" strokeWidth="3.4" />}
        {/* The transfer hose pulses only while CO₂ is being injected. */}
        {injecting && <use className="hero-feed-flow" href="#site-feed-route" strokeWidth="1" style={{ stroke: 'var(--sim-glow-free)' }} />}
      </g>
      {/* Jacket: two visible legs with K-bracing, battered out towards the sea floor. */}
      <path d="M10 160L20 104M86 160L76 104" stroke="url(#rig-steel)" strokeWidth="5" />
      <path d="M13 143H83M16 124H80M13 143L48 124L83 143M16 124L48 106L80 124" stroke="#34475f" strokeWidth="1.5" />
      <path d="M86 160L76 104" stroke="#8fa5bd" strokeOpacity=".45" strokeWidth=".8" />
      <path d="M2 159q8 -3 16 0m60 0q8 -3 16 0" stroke="#c9d6e6" strokeOpacity=".35" strokeWidth=".8" />
      {/* Decks, process module and accommodation with lit windows. */}
      <path d="M-8 104L-4 110H114L118 104Z" fill="#141f2e" />
      <path d="M-8 104H118V98H-8Z" fill="#1b2a3d" stroke="#7d93ad" strokeOpacity=".4" strokeWidth=".6" />
      <path d="M-2 98V70H58V98Z" fill="url(#rig-module)" stroke="#7d93ad" strokeOpacity=".35" strokeWidth=".6" />
      <path d="M62 98V58H112V98Z" fill="url(#rig-module)" stroke="#7d93ad" strokeOpacity=".35" strokeWidth=".6" />
      <path d="M112 58V98" stroke="#9fb3c8" strokeOpacity=".45" strokeWidth=".7" />
      {HERO_RIG_WINDOWS.map(([x, y, lit]) => <rect key={`${x}-${y}`} x={x} y={y} width="3.4" height="2.4" fill="#e9c98f" opacity={lit ? .5 : .9} />)}
      {[92, 104].map(x => <rect key={x} x={x} y="105" width="10" height="4" rx="2" fill="#c98a3a" opacity=".8" />)}
      {/* Helideck cantilevered over the accommodation, with edge lights. */}
      <path d="M64 58L72 64M118 56L108 64" stroke="#34475f" strokeWidth="1.2" />
      <path d="M58 56H124L128 52H62Z" fill="#2c4060" stroke="#9fb3c8" strokeOpacity=".5" strokeWidth=".6" />
      {[61, 79, 97, 115, 125].map(x => <circle key={x} cx={x} cy="55.5" r=".8" fill="#f2c14e" />)}
      {/* Derrick over the well bay: the injection well runs straight down beneath it. */}
      <path d="M37 98L44 22H52L59 98" stroke="#4a5f7a" strokeWidth="1.6" />
      <path d="M38 88H58M39.5 76H56.5M41 62H55M42.5 48H53.5M43.5 34H52.5M38 88L56.5 76M58 88L39.5 76M39.5 76L55 62M56.5 76L41 62M41 62L53.5 48M55 62L42.5 48M42.5 48L52.5 34M53.5 48L43.5 34"
        stroke="#3a4f69" strokeWidth=".8" />
      <path d="M59 98L52 22" stroke="#9fb3c8" strokeOpacity=".4" strokeWidth=".6" />
      <path d="M43 22H53V18H43Z" fill="#2c4060" />
      <circle cx="48" cy="16" r="1.8" fill="#ff5a4f" />
      <circle data-site-status="true" cx="48" cy="95" r="1.5" style={{ fill: injecting ? 'var(--sim-glow-free)' : '#647b79' }} />
      {/* Pedestal crane with its boom resting out over the water. */}
      <path d="M4 70V60H12V70Z" fill="#22344b" />
      <path d="M8 60L-62 26" stroke="#4a5f7a" strokeWidth="2.2" />
      <path d="M2 63L-62 26" stroke="#3a4f69" strokeWidth=".7" />
      <path d="M-62 26V52" stroke="#7d93ad" strokeOpacity=".6" strokeWidth=".6" />
      <circle cx="-62" cy="25" r="1.4" fill="#ff5a4f" />
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
