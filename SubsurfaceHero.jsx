// SubsurfaceHero.jsx — the landing hero: a moonlit Highland field site above a live
// vertical-equilibrium section of CO2 injected into a faulted saline aquifer.
// Geometry, physics and the depth scale live in hero-geology.js (shared with the worker and tests).

const { useEffect, useMemo, useRef, useState } = React;

// ---- hero playback helpers (pure; tests/hero-model.test.js evaluates this block)
const heroInitialPlayback = reducedMotion => ({ year: reducedMotion ? 400 : 0, playing: !reducedMotion });
const heroShouldTick = ({ playing, visible, hidden }) => playing && visible && !hidden;
const heroPhase = (year, injectionYears, ship = 'moored') => {
  if (year >= injectionYears) return 'migrating';
  if (ship === 'arriving' || ship === 'away') return 'carrier arriving';
  return ship === 'connecting' ? 'connecting the hose' : 'injecting';
};
// The CO2 carrier: away -> arriving -> connecting -> moored (injection runs) -> disconnecting -> departing -> away.
// Manoeuvres take real seconds; injection years only advance while the carrier is moored and connected.
const HERO_SHIP_SECONDS = { arriving: 3.2, connecting: 0.8, disconnecting: 1, departing: 10 };
const HERO_SHIP_NEXT = { arriving: 'connecting', connecting: 'moored', disconnecting: 'departing', departing: 'away' };
const heroShipStep = (ship, dt, wantMoored, seconds = HERO_SHIP_SECONDS) => {
  let { phase, p } = ship;
  if (wantMoored) {
    // A restart reconnects a hose that is still coming off, or brings the carrier back in.
    if (phase === 'disconnecting') { phase = 'connecting'; p = 1 - p; }
    else if (phase === 'away' || phase === 'departing') { phase = 'arriving'; p = 0; }
  } else if (phase === 'moored') { phase = 'disconnecting'; p = 0; }
  else if (phase === 'connecting') { phase = 'disconnecting'; p = 1 - p; }
  else if (phase === 'arriving') return { phase: 'away', p: 1 };
  if (phase === 'moored' || phase === 'away') return { phase, p: 1 };
  p += seconds[phase] > 0 ? dt / seconds[phase] : 1;
  return p < 1 ? { phase, p } : { phase: HERO_SHIP_NEXT[phase], p: HERO_SHIP_NEXT[phase] === 'moored' || HERO_SHIP_NEXT[phase] === 'away' ? 1 : 0 };
};
const heroCanAdvance = (year, injectionYears, ship) => year >= injectionYears || ship === 'moored';
// Scrubbing is a jump in time, so the carrier jumps to where it belongs in that year.
const heroShipFor = (year, injectionYears) => (year < injectionYears ? { phase: 'moored', p: 1 } : { phase: 'away', p: 1 });
// Where the carrier is in its manoeuvre, as a sideways offset in site units at a constant size. It runs in
// from beyond the right edge, slowing as it comes alongside, and leaves bow-first to the left, behind the
// platform, fading into the dark.
const heroShipPose = ({ phase, p }) => {
  if (phase === 'away') return null;
  if (phase === 'arriving') {
    return { x: 640 * (1 - p) ** 3, opacity: Math.min(1, p / 0.1), wake: (1 - p) ** 2, hose: 0, lights: 0 };
  }
  if (phase === 'departing') {
    return { x: -1100 * p * p, opacity: p < 0.55 ? 1 : (1 - p) / 0.45, wake: Math.min(1, 2 * p), hose: 0, lights: 0 };
  }
  const hose = phase === 'connecting' ? p : phase === 'disconnecting' ? 1 - p : 1;
  return { x: 0, opacity: 1, wake: 0, hose, lights: 1 };
};
// The completion, in section units of depth: a packer in the caprock above the storage roof, then
// perforations every 8 units (24 m) down to a short sump above TD, which the model sets.
const heroWellLayout = (roofY, td) => {
  const perforations = [];
  for (let y = roofY + 5; y <= td - 5; y += 8) perforations.push(Math.round(y * 10) / 10);
  return { packer: roofY - 7, perforations, td };
};
// Where the CO2 in the pipes has got to: 6 section units per injection year, so the pulses move at
// about 35 px/s at normal speed, stand still when the hero is paused and stop with injection.
const heroFlowPhase = year => Math.round(year * 60) / 10;
// ---- end hero playback helpers

// ---- hero leak helpers (pure; tests/hero-leak.test.js evaluates this block)
// A droplet is a fixed small volume of leaked CO2. The leak rate sets how many droplets leave per second.
// Each droplet passes four stages: 0 gather (in the plume), 1 squeeze (damage zone), 2 rise (on the fault), 3 spread (under the roof).
// Points are [x, y] in CSS pixels.
const HERO_LEAK_PEAK_RATE = 5;   // droplets per second at the peak flow of the run, at full migration speed (1x)
const HERO_LEAK_MAX_DROPS = 140; // live droplets per fault
const heroLeakClamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const heroLeakLerp = (a, b, t) => a + (b - a) * t;
const heroLeakEase = t => 1 - Math.pow(1 - heroLeakClamp(t), 3);
// A small seeded generator, so that every replay draws the same droplets.
const heroLeakRandom = seed => () => {
  seed = (seed + 0x6D2B79F5) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
// Droplets per real second for one fault. The flow is relative to the peak flow of the run.
const heroLeakRate = (flow, peak, yearsPerSecond, speed) =>
  flow > 0 && peak > 0 ? HERO_LEAK_PEAK_RATE * Math.min(1, flow / peak) * yearsPerSecond * speed / 60 : 0;
// End of the rise: the fault line from -> to, continued up to the height riseY.
const heroLeakRiseEnd = (from, to, riseY) => {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const u = [(to[0] - from[0]) / length, (to[1] - from[1]) / length];
  if (!(length > 0) || u[1] > -1e-6 || to[1] <= riseY) return [to[0], to[1]];
  const t = (to[1] - riseY) / -u[1];
  return [to[0] + u[0] * t, to[1] + u[1] * t];
};
// How far a droplet spreads under the roof. It never goes past the tip of the pool (reach plus 4 px).
const heroLeakSpreadLength = (reach, random) => Math.min(Math.max(8, reach) + 4, 12 + 56 * Math.pow(random, 0.8));
// Where a droplet is and how it looks. g holds the fault in pixels: from, to, u (up the fault), n (across it), capLen and roofAt(x).
// The radius R and the alpha a follow the stage: small in the plume, smallest in the caprock, a little larger in the rise, smaller again at the pool.
const heroLeakLook = (p, g) => {
  const { from, to, u, n, capLen } = g;
  const t = p.t;
  if (p.st === 0) {
    const ctrl = [heroLeakLerp(from[0], p.s0[0], 0.35), p.s0[1] - 0.5];
    const e = heroLeakEase(t * 0.9 + 0.1 * t * t);
    const q = (1 - e) * (1 - e), r = 2 * (1 - e) * e, s = e * e;
    return { x: q * p.s0[0] + r * ctrl[0] + s * from[0], y: q * p.s0[1] + r * ctrl[1] + s * from[1],
      c: t < 0.55 ? 'green' : 'mix', k: heroLeakClamp((t - 0.55) / 0.45), R: p.r * 0.7, a: 0.75 * heroLeakClamp(t / 0.3) };
  }
  if (p.st === 1) {
    const e = heroLeakClamp(t + 0.07 * Math.sin(6.283 * (2.5 * t) + p.phi));
    const off = 0.75 * Math.sin(6.283 * (1.6 * t) + p.phi2);
    return { x: from[0] + u[0] * capLen * e + n[0] * off, y: from[1] + u[1] * capLen * e + n[1] * off, c: 'amber', k: 0, R: p.r * 0.74, a: 1 };
  }
  if (p.st === 2) {
    const e = 0.55 * t + 0.45 * t * t;
    const off = (0.6 + 1.4 * e) * Math.sin(6.283 * (1.3 * t) + p.phi);
    return { x: heroLeakLerp(to[0], p.riseEnd[0], e) + n[0] * off, y: heroLeakLerp(to[1], p.riseEnd[1], e) + n[1] * off, c: 'cream', k: 0, R: p.r * 0.88, a: 1 };
  }
  const e = heroLeakEase(t);
  const x = p.riseEnd[0] + p.side * p.spreadLen * e;
  return { x, y: g.roofAt(x) + 1.6 + 0.3 * Math.sin(6.283 * t + p.phi), c: 'join', k: e,
    R: p.r * 0.88 * (1 - 0.45 * e), a: 1 - heroLeakClamp((t - 0.2) / 0.8) };
};
const heroLeakHead = l => {
  if (l.c === 'green') return '#7dffd2';
  if (l.c === 'amber') return '#ffd9a2';
  if (l.c === 'cream') return '#fff0d8';
  if (l.c === 'mix') return `rgb(${Math.round(heroLeakLerp(61, 255, l.k))},${Math.round(heroLeakLerp(255, 207, l.k))},${Math.round(heroLeakLerp(192, 135, l.k))})`;
  return `rgb(255,${Math.round(heroLeakLerp(230, 181, l.k))},${Math.round(heroLeakLerp(191, 71, l.k))})`;
};
const heroLeakTail = l => (l.c === 'green' || (l.c === 'mix' && l.k < 0.5) ? '61,255,192' : '255,181,71');
// The buoyancy in the card. A value that rounds to 0 while the fault leaks reads "< 0.1".
const heroLeakBuoyText = value => (value < 0.05 ? '< 0.1' : String(Math.round(value * 10) / 10));
const heroLeakLine = leak => (leak.state === 'above'
  ? `Buoyancy ${heroLeakBuoyText(leak.buoyancy)} bar${leak.overpressure > 0 ? ` + overpressure ${leak.overpressure} bar` : ''} > entry ${leak.entry} bar`
  : `${leak.overpressure > 0 ? 'Buoyancy + overpressure' : 'Buoyancy'} held at the ${leak.entry} bar entry pressure`);
// Full scale of the bar: the largest push of the run, rounded up to a whole bar.
const heroLeakScaleBar = values => Math.max(1, Math.ceil(values.reduce((max, v) => Math.max(max, v), 0) - 1e-9));
// Fractions of the full scale: buoyancy, buoyancy plus overpressure, and the entry pressure.
const heroLeakGauge = (leak, scale) => ({
  buoyancy: heroLeakClamp(leak.buoyancy / scale),
  push: heroLeakClamp((leak.buoyancy + leak.overpressure) / scale),
  entry: heroLeakClamp(leak.entry / scale),
});
// First year with flow for each fault, or -1.
const heroLeakFirstYears = (faultFlow, faults, years) => {
  const first = new Array(faults).fill(-1);
  for (let y = 0; y <= years; y++) for (let i = 0; i < faults; i++) if (first[i] < 0 && faultFlow[y * faults + i] > 0) first[i] = y;
  return first;
};
// Stops of the band under the scrubber: the strongest leak of any fault, about every 20 years.
// at is the share of the band (0 to 100). alpha is the amber share (25 to 95), or 0 where nothing leaks.
const heroLeakBandStops = (faultFlow, faults, years, peak, first, step = 20) => {
  if (first < 0 || !(peak > 0)) return [];
  const stops = [];
  const add = y => {
    let flow = 0;
    for (let i = 0; i < faults; i++) flow = Math.max(flow, faultFlow[y * faults + i]);
    stops.push({ at: Math.round(1000 * (y - first) / Math.max(1, years - first)) / 10,
      alpha: flow > 0 ? Math.round(25 + 70 * Math.sqrt(Math.min(1, flow / peak))) : 0 });
  };
  add(first);
  for (let y = Math.ceil((first + 1) / step) * step; y < years; y += step) add(y);
  if (years > first) add(years);
  return stops;
};
// ---- end hero leak helpers

// Percent of injected CO2 for display: a trace that rounds to nothing still reads as "<0.1".
const heroPercentText = (value, total) => {
  const share = HeroGeology.percent(value, total);
  return share === 0 && value > 0 ? '<0.1' : String(share);
};

const HERO_YEARS = 2000;

// The main-thread fallback times the run like the worker does. computeMs is in milliseconds.
const heroSimulateTimed = options => {
  const start = performance.now();
  const run = HeroGeology.simulate(heroGeology, options);
  run.computeMs = performance.now() - start;
  return run;
};

// The one line under the player note. It states only the browser time of this hero model.
const heroReceiptText = (years, milliseconds) => {
  const seconds = milliseconds / 1000;
  const time = seconds < 0.05 ? 'under 0.1 s' : `${seconds.toFixed(1)} s`;
  return `This model ran ${years.toLocaleString('en-US')} years in ${time} in your browser.`;
};
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

// Labels sit at mid-depth of each unit on the right margin of the section.
const HERO_LABELS = [['wide', 980], ['narrow', 960]].flatMap(([set, x]) => {
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
  const [ship, setShip] = useState({ phase: 'away', p: 1 });
  // Two steps. Step 0 draws the identity, the sky colour and the section. Step 1 adds the sky decoration, the
  // sea, the platform and the carrier. Step 1 runs as a transition, so React time-slices it and the main
  // thread stays free for input and for the loader fade.
  const [step, setStep] = useState(0);
  const late = step >= 1;
  useEffect(() => {
    if (step < 1) React.startTransition(() => setStep(step + 1));
  }, [step]);
  // The first paint never waits for the network. The hero starts with the cache or the typical night, then applies the live weather.
  const [weather, setWeather] = useState(() => heroWeatherInitial(window));
  const moon = useMemo(() => {
    const override = heroWeatherOverride(window.location && window.location.hash);
    return (override && override.moon) || heroMoonPhase(new Date());
  }, []);
  const scene = useMemo(() => heroWeatherScene(weather, moon), [weather, moon]);
  useEffect(() => heroWeatherStart(setWeather), []);
  const shipRef = useRef(ship);
  // Under reduced motion the carrier's manoeuvres complete at once.
  const shipSeconds = useMemo(() => (siteReducedMotion() ? { arriving: 0, connecting: 0, disconnecting: 0, departing: 0 } : HERO_SHIP_SECONDS), []);
  yearRef.current = year;

  // The model runs once per page load, off the main thread when possible.
  useEffect(() => {
    const options = { years: HERO_YEARS };
    if (!window.Worker) {
      const timer = setTimeout(() => setRun(heroSimulateTimed(options)), 0);
      return () => clearTimeout(timer);
    }
    const worker = new Worker('./hero-simulation-worker.js?v=11');
    worker.onmessage = event => setRun(event.data);
    worker.onerror = () => setRun(heroSimulateTimed(options));
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

  // One clock drives the carrier and the model: injection years wait until the carrier is moored and connected.
  // The clock waits for the second step. A per-frame update would restart that transition at every frame.
  useEffect(() => {
    if (!late || !heroShouldTick({ playing, visible, hidden })) return undefined;
    let frameId = 0, last = 0;
    const tick = now => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      const injectionEnd = run ? run.injectionYears : 30;
      const nextShip = heroShipStep(shipRef.current, dt, yearRef.current < injectionEnd, shipSeconds);
      if (nextShip.phase !== shipRef.current.phase || nextShip.p !== shipRef.current.p) {
        shipRef.current = nextShip;
        setShip(nextShip);
      }
      if (run && heroCanAdvance(yearRef.current, injectionEnd, nextShip.phase)) {
        const next = Math.min(HERO_YEARS, yearRef.current + dt * HeroGeology.yearsPerSecond(yearRef.current, injectionEnd) * speed);
        yearRef.current = next;
        setYear(next);
        if (next >= HERO_YEARS) { setPlaying(false); return; }
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [late, run, playing, speed, visible, hidden, shipSeconds]);

  const frame = useMemo(() => (run ? heroFrameAt(run, year) : null), [run, year]);
  // The strongest leak of this run sets the scale of the droplet flow and of the band under the scrubber.
  const leakScale = useMemo(() => ({ peak: run ? run.faultFlow.reduce((max, v) => Math.max(max, v), 0) : 0 }), [run]);
  const firstLeakYears = useMemo(() => (run ? heroLeakFirstYears(run.faultFlow, run.faults, run.years) : []), [run]);
  // Full scale of the push bar for each fault: its largest buoyancy plus overpressure while it leaks, rounded up to a whole bar.
  const pushScale = useMemo(() => (run ? HERO_FAULTS.map((fault, i) => {
    const cell = heroSection.faultCells[i][0], { distance } = heroSection.leak[i], sums = [];
    for (let y = 0; y <= run.years; y++) {
      if (run.faultFlow[y * run.faults + i] > 0) sums.push(run.h[0][y * run.nodes + cell] * HeroGeology.BAR_PER_HEAD + HeroGeology.overpressure(distance, y, run.injectionYears));
    }
    return heroLeakScaleBar(sums);
  }) : []), [run]);
  const injectionYears = run ? run.injectionYears : 30;
  const leak = useMemo(() => (frame ? HeroGeology.leakReadout(heroGeology, heroSection, frame, year, injectionYears) : null), [frame, year, injectionYears]);
  // CO2 is in the pipes while the carrier is connected during the injection years; its flow follows the clock.
  const flow = run && year < injectionYears && ship.phase === 'moored' ? heroFlowPhase(year) : null;
  const jumpShip = value => {
    shipRef.current = heroShipFor(value, injectionYears);
    setShip(shipRef.current);
  };
  const controls = {
    toggle: () => {
      if (!playing && yearRef.current >= HERO_YEARS) setYear(0);
      setPlaying(!playing);
    },
    scrub: value => { setYear(value); setPlaying(false); jumpShip(value); },
    restart: () => { setYear(0); setPlaying(true); },
    speed: () => setSpeed(s => (s === 1 ? 2 : s === 2 ? 4 : 1)),
  };

  return (
    <section id="home" ref={heroRef} className="hero-scene" aria-labelledby="hero-name" data-visible={visible && !hidden ? 'true' : 'false'}
      style={{ '--hero-swell': scene.swell, '--hero-foam': scene.foam }}>
      <Sky weather={scene} late={step >= 1} />
      <HeroSection sectionRef={sectionRef} />
      <HeroPlume frame={frame} />
      {leakScale.peak > 0 && <HeroLeakFlow sectionRef={sectionRef} frame={frame} yearRef={yearRef} run={run} speed={speed} playing={playing} visible={visible} hidden={hidden}
        injectionYears={injectionYears} peak={leakScale.peak} firstYears={firstLeakYears} />}
      <HeroOverlay />
      <HeroWell flow={flow} />
      {late && <SurfaceSite geology={heroGeology} flow={flow} ship={ship} />}
      <HeroLabels />
      <HeroLeakReadout frame={frame} leak={leak} pushScale={pushScale} />
      <Identity onNavigate={onNavigate} />
      <HeroPlayer year={year} playing={playing} speed={speed} frame={frame} run={run} injectionYears={injectionYears} leak={leak} peak={leakScale.peak}
        ship={ship.phase} exaggeration={exaggeration} controls={controls} weather={scene} />
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
        <clipPath id="hero-lower-rock"><path d={AQUIFER_PATH}/></clipPath>
        <linearGradient id="hero-lower-texture" x1="0" y1="280" x2="0" y2="580" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0"/><stop offset="1" stopColor="white" stopOpacity=".65"/>
        </linearGradient>
        <mask id="hero-lower-texture-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="580">
          <rect width="1000" height="580" fill="url(#hero-lower-texture)"/>
        </mask>
        <linearGradient id="hero-descent-bridge" x1="0" y1="490" x2="0" y2="580" gradientUnits="userSpaceOnUse">
          <stop stopColor="#141c27" stopOpacity="0"/><stop offset="1" stopColor="#141c27"/>
        </linearGradient>
      </defs>
      <rect width="1000" height="580" className="hero-rock--over" />
      {/* Sea water above the seabed: about 90 m, a hairline at this depth scale. */}
      <rect width="1000" height="3" fill="#0b1a2c" />
      <path d={HERO_PATHS.caprock} fill="url(#hero-shale)" />
      <path d={HERO_PATHS.overlying} className="hero-rock--sand" />
      <path d={HERO_PATHS.storage} className="hero-rock--sand" />
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
        <path d={overlying.contact} className="hero-contact hero-contact--leaked" fill="none" vectorEffect="non-scaling-stroke" />
      </g>}
    </svg>
  );
};

/* =====================================================
   Leak flow — CO2 droplets along each leaking fault, on one canvas at true pixel scale
   ===================================================== */
const HERO_LEAK_JUMP = 30;        // a step of more than this many years is a jump (scrub, restart)
const HERO_LEAK_FRAME_MS = 30;    // the loop skips a frame that comes sooner than this (about 30 fps at 60 Hz)
const HERO_LEAK_WARM_STEP = 1 / 30;
const HERO_LEAK_WARM_STEPS = 120; // 4 s of updates, so that a stream shows at once
const HERO_LEAK_ONSET = 0.9;      // seconds: the band fills for 0.8 s, the ring fades for 0.9 s
const HERO_LEAK_AMBER = '255,181,71';
const heroLeakFx = v => Math.round(v * 100) / 100;

// Paint one droplet: a soft round head, a faint halo and a tapered trail of the last positions.
const heroLeakDrawDrop = (ctx, q) => {
  const l = q.l;
  if (l.a <= 0.01) return;
  const rgb = heroLeakTail(l), h = q.h, n = h.length;
  ctx.lineCap = 'round';
  for (let i = 1; i < n; i++) {
    const k = i / (n - 1);
    ctx.strokeStyle = `rgba(${rgb},${heroLeakFx(l.a * 0.5 * k * k)})`;
    ctx.lineWidth = l.R * 1.6 * k;
    ctx.beginPath(); ctx.moveTo(h[i - 1][0], h[i - 1][1]); ctx.lineTo(h[i][0], h[i][1]); ctx.stroke();
  }
  ctx.globalAlpha = l.a * 0.16;
  ctx.fillStyle = `rgb(${rgb})`;
  ctx.beginPath(); ctx.arc(l.x, l.y, l.R * 2.6, 0, 6.2832); ctx.fill();
  ctx.globalAlpha = l.a;
  ctx.fillStyle = heroLeakHead(l);
  ctx.beginPath(); ctx.arc(l.x, l.y, l.R, 0, 6.2832); ctx.fill();
  ctx.globalAlpha = 1;
};

// The engine owns the droplets of each fault. React never sees them.
// tick() moves them in real time x speed while the hero clock advances. paint() draws one still frame.
const heroLeakEngine = canvas => {
  const ctx = canvas.getContext('2d');
  const size = { w: 0, h: 0, sx: 1, sy: 1, ox: 0, oy: 0 };
  const faults = HERO_FAULTS.map(() => ({ rand: null, drops: [], carry: 0, on: false, done: false, onset: 0, geo: null, box: null }));
  let lastYear = -1, lastRun = null, boxes = [];

  const roofLine = layer => x => {
    const k = heroLeakClamp(x / size.w * 200, 0, 200), a = Math.floor(k), b = Math.min(200, a + 1);
    return heroLeakLerp(layer.roofR[a], layer.roofR[b], k - a) / 580 * size.h;
  };
  const storageRoof = roofLine(heroStorage), overlyingRoof = roofLine(heroOverlying);
  const cellOf = x => Math.max(0, Math.min(200, Math.floor(x / size.w * 200)));

  // Fault geometry in pixels: section units map to x = vx / 1000 * width and y = vy / 580 * height.
  const geometry = () => faults.forEach((f, i) => {
    const fault = HERO_FAULTS[i];
    const pt = point => [point.x / 1000 * size.w, point.y / 580 * size.h];
    const from = pt(fault.from), to = pt(fault.to);
    const capLen = Math.max(1, Math.hypot(to[0] - from[0], to[1] - from[1]));
    const u = [(to[0] - from[0]) / capLen, (to[1] - from[1]) / capLen];
    const riseEnd = heroLeakRiseEnd(from, to, fault.rise.y / 580 * size.h);
    const xs = [from[0], to[0], riseEnd[0]];
    f.geo = { from, to, u, n: [-u[1], u[0]], capLen, riseEnd, roofAt: overlyingRoof };
    f.box = { x: Math.min(...xs) - 84, y: Math.min(to[1], riseEnd[1]) - 18, w: Math.max(...xs) - Math.min(...xs) + 168, h: from[1] - Math.min(to[1], riseEnd[1]) + 56 };
  });

  // The storage plume beside the fault: the side with more mobile CO2, and its columns 4-28 px from the entry point.
  const gatherOf = (i, frame) => {
    const { from } = faults[i].geo, c = heroSection.faultCells[i][0];
    let left = 0, right = 0;
    for (let j = 1; j <= 4; j++) { left += frame.h[Math.max(0, c - j)]; right += frame.h[Math.min(200, c + j)]; }
    const side = right >= left ? 1 : -1, cols = [];
    for (let k = 4; k <= 28; k += 2) {
      const x = from[0] + side * k, cell = cellOf(x);
      if (frame.h[cell] > 0.002) cols.push([x, frame.h[cell] * HERO_UNIT / 580 * size.h]);
    }
    return { side, cols };
  };
  // The leaked pool: how far it reaches each way from the fault, in pixels, and the side that reaches further.
  const poolOf = (i, frame) => {
    const c = heroSection.faultCells[i][1], cell = size.w / 200, reach = [0, 0];
    [-1, 1].forEach((dir, d) => {
      for (let k = 0; k <= 100; k++) {
        const j = c + dir * k;
        if (j < 0 || j > 200 || frame.h2[j] <= 0.002) break;
        reach[d]++;
      }
    });
    return { side: reach[1] >= reach[0] ? 1 : -1, reach: Math.max(reach[0], reach[1]) * cell };
  };

  const spawn = (f, gather, pool) => {
    const { rand, geo } = f, { from, to, capLen, riseEnd } = geo;
    let s0;
    if (gather.cols.length) {
      const [x, hPx] = gather.cols[Math.floor(rand() * gather.cols.length)];
      s0 = [x + (rand() - 0.5) * 1.6, storageRoof(x) + Math.min(1.2 + rand() * 3.8, Math.max(0.5, hPx))];
    } else s0 = [from[0] + gather.side * 4, from[1] + 1 + rand() * 2];
    const mul = 0.65 + 0.7 * rand();
    const spreadLen = heroLeakSpreadLength(pool.reach, rand());
    const p = { st: 0, t: 0, s0, mul, side: pool.side, spreadLen, riseEnd, h: [], l: null,
      phi: rand() * 6.283, phi2: rand() * 6.283, r: 1.15 + 0.75 * rand() };
    p.dur = [Math.max(0.35, Math.hypot(from[0] - s0[0], from[1] - s0[1]) / (16 * mul)), capLen / (26 * mul),
      Math.max(0.3, Math.hypot(riseEnd[0] - to[0], riseEnd[1] - to[1]) / (24 * mul)), spreadLen / (17 * mul)];
    f.drops.push(p);
  };
  // dt moves the droplets, dtEmit counts new ones. The history of a droplet grows only while it moves.
  const update = (i, frame, dt, dtEmit, rate) => {
    const f = faults[i];
    f.carry += rate * dtEmit;
    if (f.carry >= 1 && f.drops.length < HERO_LEAK_MAX_DROPS) {
      const gather = gatherOf(i, frame), pool = poolOf(i, frame);
      while (f.carry >= 1 && f.drops.length < HERO_LEAK_MAX_DROPS) { spawn(f, gather, pool); f.carry -= 1; }
    }
    if (f.carry > 1) f.carry = 1;
    for (let n = f.drops.length - 1; n >= 0; n--) {
      const p = f.drops[n];
      p.t += dt / p.dur[p.st];
      while (p.t >= 1 && p.st < 4) { p.t -= 1; p.st++; if (p.st < 4) p.t *= p.dur[p.st - 1] / p.dur[p.st]; }
      if (p.st >= 4) { f.drops.splice(n, 1); continue; }
      p.l = heroLeakLook(p, f.geo);
      p.h.push([p.l.x, p.l.y]);
      if (p.h.length > 7) p.h.shift();
    }
  };

  // Bring the droplets of every fault in line with the frame. mode: 'jump' starts again, 'tick' moves, 'still' only keeps up.
  const advance = (L, year, mode, dt) => {
    const frame = L.frame;
    if (!frame) return;
    faults.forEach((f, i) => {
      if (!(L.firstYears[i] >= 0 && year >= L.firstYears[i])) f.done = false;
      const flow = frame.faultFlow[i] || 0;
      if (mode === 'jump') { f.rand = heroLeakRandom(7 + i); f.drops.length = 0; f.carry = 0; f.on = false; }
      if (flow <= 0) { f.drops.length = 0; f.carry = 0; f.on = false; return; }
      const rate = heroLeakRate(flow, L.peak, HeroGeology.yearsPerSecond(year, L.injectionYears), L.speed);
      if (!f.on) {
        f.on = true;
        if (mode === 'tick' && !f.done && !L.reduced) f.onset = 0;
        else {
          // A scrub, a restart or a reduced-motion view: no fill and no ring, and a steady stream at once.
          f.done = true;
          for (let n = 0; n < HERO_LEAK_WARM_STEPS; n++) update(i, frame, HERO_LEAK_WARM_STEP * L.speed, HERO_LEAK_WARM_STEP, rate);
        }
      }
      if (mode !== 'tick') return;
      if (!f.done) { f.onset += dt; if (f.onset >= HERO_LEAK_ONSET) f.done = true; }
      update(i, frame, dt * L.speed, dt, f.done || f.onset > 0.45 ? rate : 0);
    });
  };

  // Clear only the boxes round the fault paths, then draw the damage zones, the start marks and the droplets.
  const draw = L => {
    const frame = L.frame;
    const live = frame ? faults.filter((f, i) => f.on && f.geo && (frame.faultFlow[i] || 0) > 0) : [];
    if (!live.length && !boxes.length) return;
    ctx.setTransform(size.sx, 0, 0, size.sy, -size.ox * size.sx, -size.oy * size.sy);
    boxes.forEach(b => ctx.clearRect(b.x, b.y, b.w, b.h));
    boxes = live.map(f => f.box);
    boxes.forEach(b => ctx.clearRect(b.x, b.y, b.w, b.h));
    live.forEach(f => {
      const { from, to } = f.geo, i = faults.indexOf(f);
      const strength = Math.sqrt(Math.min(1, (frame.faultFlow[i] || 0) / L.peak));
      const e = f.done ? 1 : heroLeakEase(f.onset / 0.8);
      const x = heroLeakLerp(from[0], to[0], e), y = heroLeakLerp(from[1], to[1], e);
      ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(${HERO_LEAK_AMBER},${heroLeakFx(0.2 + 0.25 * strength)})`;
      ctx.lineWidth = 4.5;
      ctx.beginPath(); ctx.moveTo(from[0], from[1]); ctx.lineTo(x, y); ctx.stroke();
      ctx.strokeStyle = `rgba(${HERO_LEAK_AMBER},0.9)`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(from[0], from[1]); ctx.lineTo(x, y); ctx.stroke();
      if (!f.done) {
        const r = heroLeakClamp(f.onset / HERO_LEAK_ONSET);
        ctx.strokeStyle = `rgba(${HERO_LEAK_AMBER},${heroLeakFx(0.9 * (1 - r))})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(from[0], from[1], 3 + 15 * heroLeakEase(r), 0, 6.2832); ctx.stroke();
      }
      f.drops.forEach(q => { if (q.l) heroLeakDrawDrop(ctx, q); });
    });
  };

  // Classify a step of the year: a jump goes back or far forward, or follows a new run.
  const classify = (L, year) => {
    const dy = year - lastYear;
    const jumped = lastYear < 0 || dy < 0 || dy > HERO_LEAK_JUMP || L.run !== lastRun;
    lastYear = year;
    lastRun = L.run;
    return { jumped, moving: dy > 1e-9 };
  };

  return {
    // width and height are the size of the section in CSS pixels. The canvas covers only the union of the boxes of the faults that leak in this run.
    resize(width, height, ratio, L) {
      size.w = width; size.h = height;
      geometry();
      const used = faults.filter((f, i) => L && L.firstYears[i] >= 0).map(f => f.box);
      const x0 = Math.max(0, Math.floor(Math.min(...used.map(b => b.x)))), y0 = Math.max(0, Math.floor(Math.min(...used.map(b => b.y))));
      const x1 = Math.min(width, Math.ceil(Math.max(...used.map(b => b.x + b.w)))), y1 = Math.min(height, Math.ceil(Math.max(...used.map(b => b.y + b.h))));
      const cw = Math.max(1, x1 - x0), ch = Math.max(1, y1 - y0);
      canvas.width = Math.max(1, Math.round(cw * ratio));
      canvas.height = Math.max(1, Math.round(ch * ratio));
      canvas.style.left = `${x0}px`;
      canvas.style.top = `calc(var(--hero-surface) + ${y0}px)`;
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      size.sx = canvas.width / cw; size.sy = canvas.height / ch; size.ox = x0; size.oy = y0;
      boxes = [];
      lastYear = -1;
      if (L) this.paint(L);
    },
    tick(L, dt) {
      if (!size.w) return;
      const year = L.yearRef.current, { jumped, moving } = classify(L, year);
      advance(L, year, jumped ? 'jump' : moving ? 'tick' : 'still', dt);
      draw(L);
    },
    paint(L) {
      if (!size.w) return;
      const year = L.yearRef.current, { jumped } = classify(L, year);
      advance(L, year, jumped ? 'jump' : 'still', 0);
      draw(L);
    },
  };
};

// One canvas over the section. The loop runs only while a fault leaks, playback runs, the hero is in view and the tab is visible.
// It reads the frame, the year, the speed and the run through refs, so React does not render for each droplet.
const HeroLeakFlow = ({ sectionRef, frame, yearRef, run, speed, playing, visible, hidden, injectionYears, peak, firstYears }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const reduced = useMemo(() => siteReducedMotion(), []);
  const leaking = !!frame && frame.faultFlow.some(v => v > 0);
  const running = !reduced && leaking && heroShouldTick({ playing, visible, hidden });
  const live = useRef(null);
  live.current = { frame, yearRef, run, speed, injectionYears, peak, firstYears, reduced };

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = heroLeakEngine(canvas);
    engineRef.current = engine;
    // The canvas box depends on the section size, so the observer watches the section.
    const section = sectionRef.current;
    const fit = () => {
      const { width, height } = section.getBoundingClientRect();
      if (width && height) engine.resize(width, height, Math.min(2, window.devicePixelRatio || 1), live.current);
    };
    fit();
    if (!('ResizeObserver' in window)) return () => { engineRef.current = null; };
    const sizes = new ResizeObserver(fit);
    sizes.observe(section);
    return () => { sizes.disconnect(); engineRef.current = null; };
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    let frameId = 0, last = 0;
    const tick = now => {
      frameId = requestAnimationFrame(tick);
      // The loop draws at 30 fps at most: a smaller canvas upload for the same look.
      if (last && now - last < HERO_LEAK_FRAME_MS) return;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      if (engineRef.current) engineRef.current.tick(live.current, dt);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [running]);

  // Pause, scrub and reduced motion: one still frame whenever the frame changes.
  useEffect(() => {
    if (!running && engineRef.current) engineRef.current.paint(live.current);
  }, [frame, run, running]);

  return <canvas ref={canvasRef} className="hero-leak-flow" aria-hidden="true" />;
};

/* =====================================================
   Overlay — ground surface and the fault traces
   ===================================================== */
const HeroOverlay = React.memo(() => (
  <svg className="hero-svg hero-svg--overlay" viewBox="0 0 1000 580" preserveAspectRatio="none" aria-hidden="true">
    <line x1="0" y1="0.5" x2="1000" y2="0.5" className="hero-surface-line" vectorEffect="non-scaling-stroke" />
    {HERO_FAULTS.map((fault, i) => (
      <line key={i} x1={fault.top.x} y1={fault.top.y} x2={fault.bottom.x} y2={fault.bottom.y} className="hero-fault" vectorEffect="non-scaling-stroke" />
    ))}
  </svg>
));

/* =====================================================
   Well — a pixel-true strip over the section: x in px about the well, y in section units
   ===================================================== */
const HERO_WELL = heroWellLayout(heroStorage.roofR[heroSection.wellCell], heroSection.wellBottom);
const HeroWell = React.memo(({ flow }) => {
  const { packer, perforations, td } = HERO_WELL;
  const bore = `M0 0V${heroFixed(td)}`;
  return (
    <svg className="hero-well" viewBox="-40 0 80 580" preserveAspectRatio="none" aria-hidden="true" style={{ left: `${heroGeology.wellXPct}%` }}>
      <defs>
        {/* Soft pulses that repeat down the tubing; the clock slides them. */}
        <linearGradient id="hero-well-flow" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="32" spreadMethod="repeat"
          gradientTransform={`translate(0 ${flow || 0})`}>
          <stop stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Production casing to TD and surface casing to the axis break, each a light wall round a dark bore. */}
      <path d={bore} className="hero-well__casing" vectorEffect="non-scaling-stroke" />
      <path d={bore} className="hero-well__bore" vectorEffect="non-scaling-stroke" />
      <path d="M0 0V28" className="hero-well__casing hero-well__casing--surface" vectorEffect="non-scaling-stroke" />
      <path d="M0 0V28" className="hero-well__bore hero-well__bore--surface" vectorEffect="non-scaling-stroke" />
      <path d={`M-5 ${heroFixed(packer)}H5`} className="hero-well__packer" vectorEffect="non-scaling-stroke" />
      <path d={perforations.map(y => `M-3.5 ${y}h-3M3.5 ${y}h3`).join('')} className="hero-well__perforations" vectorEffect="non-scaling-stroke" />
      {flow !== null && <g className="hero-well__flow">
        <path d={bore} className="hero-well__co2" vectorEffect="non-scaling-stroke" />
        <path d={bore} className="hero-well__pulse" stroke="url(#hero-well-flow)" vectorEffect="non-scaling-stroke" />
      </g>}
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
const HERO_LEAK_BAR_WIDTH = 150; // px
const HeroLeakReadout = ({ frame, leak, pushScale }) => {
  if (!leak) return null;
  const gauge = heroLeakGauge(leak, pushScale[leak.fault] || 1);
  const w = HERO_LEAK_BAR_WIDTH;
  const { to } = HERO_FAULTS[leak.fault];
  // Sit on the side of the fault away from the well, unless that side has no room for the label.
  const placeLeft = to.x < heroGeology.wellX ? to.x > 380 : to.x > 750;
  const side = placeLeft ? { right: `calc(${heroFixed(100 - to.x / 10)}% + 22px)` } : { left: `calc(${heroFixed(to.x / 10)}% + 22px)` };
  return (
    <div className="hero-leak-readout" aria-hidden="true" style={{ ...side, top: heroDepthTop(to.y) }}>
      <span className="hero-leak-readout__head">
        <strong>F{leak.fault + 1} leaking</strong>
        <span className="hero-leak-readout__share">{heroPercentText(frame.inventory.leaked, frame.inventory.injected)}% leaked</span>
      </span>
      {/* The push against the hold: buoyancy (solid), overpressure (striped) and the entry pressure (tick). */}
      <span className="hero-leak-gauge" style={{ width: w }}>
        <i className="hero-leak-gauge__b" style={{ width: heroFixed(gauge.buoyancy * w) }} />
        <i className="hero-leak-gauge__o" style={{ left: heroFixed(gauge.buoyancy * w), width: heroFixed((gauge.push - gauge.buoyancy) * w) }} />
        <i className="hero-leak-gauge__e" style={{ left: heroFixed(gauge.entry * w) }} />
      </span>
      <span>{heroLeakLine(leak)}</span>
    </div>
  );
};

/* =====================================================
   Player — controls, the CO2 inventory and the scale note
   ===================================================== */
const HeroPlayer = ({ year, playing, speed, frame, run, injectionYears, leak, peak, ship, exaggeration, controls, weather }) => {
  const phase = heroPhase(year, injectionYears, ship);
  // The band under the scrubber shows how strong the leak is over the run. It is built once per run.
  const band = useMemo(() => {
    if (!run || !(peak > 0)) return null;
    const first = heroLeakFirstYears(run.faultFlow, run.faults, run.years).reduce((min, y) => (y >= 0 && (min < 0 || y < min) ? y : min), -1);
    const stops = heroLeakBandStops(run.faultFlow, run.faults, run.years, peak, first);
    if (!stops.length) return null;
    const colors = stops.map(({ at, alpha }) => `color-mix(in srgb, var(--sim-glow-leaked) ${alpha}%, transparent) ${at}%`);
    return { left: `${heroFixed(100 * first / run.years)}%`, background: `linear-gradient(90deg, ${colors.join(', ')})` };
  }, [run, peak]);
  const inventory = frame ? frame.inventory : { mobile: 0, residual: 0, leaked: 0, injected: 0 };
  const share = value => heroPercentText(value, inventory.injected);
  const classes = [['mobile', 'Mobile', inventory.mobile], ['residual', 'Residual', inventory.residual], ['leaked', 'Leaked', inventory.leaked]];
  const shownYear = Math.round(year);
  const weatherNote = weather ? heroWeatherNote(weather) : null;
  return (
    <div className="hero-player" role="group" aria-label="Live model controls">
      <div className="hero-player__controls">
        <button type="button" className="hero-player__play" onClick={controls.toggle} aria-label={playing ? 'Pause simulation' : 'Play simulation'}>
          <Icon name={playing ? 'pause' : 'play'} size={14} />
        </button>
        <span className="hero-player__track">
          <input className="hero-player__scrub" type="range" min="0" max={HERO_YEARS} step="1" value={shownYear}
            aria-label="Simulation year" aria-valuetext={`Year ${shownYear}, ${phase}${leak ? `, F${leak.fault + 1} leaking` : ''}`}
            onChange={event => controls.scrub(parseFloat(event.target.value))} />
          {band && <i className="hero-player__leakband" aria-hidden="true" style={band} />}
          {band && <i className="hero-player__leaktick" aria-hidden="true" style={{ left: band.left }} />}
        </span>
        <button type="button" className="hero-player__small" onClick={controls.restart} aria-label="Restart simulation">
          <Icon name="restart" size={15} />
        </button>
        <button type="button" className="hero-player__small hero-player__speed" onClick={controls.speed} aria-label={`${speed}× playback speed`}>{speed}×</button>
      </div>
      <p className="hero-player__title">Live VE model, year <span className="hero-player__year">{shownYear}</span> <span className="hero-player__phase">{phase}</span>{leak && <span className="hero-player__leak"> · F{leak.fault + 1} leaking</span>}</p>
      <div className="hero-player__bar" role="img"
        aria-label={`Of the CO₂ injected so far: ${share(inventory.mobile)}% mobile, ${share(inventory.residual)}% residually trapped, ${share(inventory.leaked)}% leaked into the overlying aquifer.`}>
        {classes.map(([key, , value]) => <span key={key} className={`is-${key}`} style={{ width: `${inventory.injected > 0 ? 100 * value / inventory.injected : 0}%` }} />)}
      </div>
      <ul className="hero-player__legend" aria-hidden="true">
        {classes.map(([key, label, value]) => <li key={key}><i className={`is-${key}`} />{label} {share(value)}%</li>)}
      </ul>
      <p className="hero-player__note">Teaching model: a schematic saline aquifer, 10 km wide, vertical exaggeration ×{exaggeration}. The depleted-gas model is in the 2026 preprint.</p>
      {run && run.computeMs > 0 && <p className="hero-player__receipt">{heroReceiptText(run.years, run.computeMs)}</p>}
      {weatherNote && <p className="hero-player__weather">{weatherNote.text}{weatherNote.credit && <> Weather by <a href={HERO_WEATHER_SOURCE_URL} target="_blank" rel="noopener noreferrer">Open-Meteo</a>.</>}</p>}
    </div>
  );
};

/* =====================================================
   Sky — moonlight and drifting clouds above a Highland field site.
   The weather reaches the sky through CSS custom properties on one container, so the large static parts
   are built once. Only the moon phase and the number of rain drops can build again, and they are small.
   ===================================================== */
const Sky = ({ weather = HERO_WEATHER_DEFAULT, late = true } = {}) => {
  // The weather sets the art. Cloud sets the cloud layer, the overcast deck and the stars. Fog sets the haze.
  // Rain sets the number of drops. The moon disc shows the real phase (moonPath is the lit part).
  const { cloud = 0.35, fog = 0, rain = 0.5, moonPath = null } = weather;
  const heroSkyRound = value => Math.round(value * 1000) / 1000;
  const deck = cloud >= 0.7 ? 0.45 + 0.4 * Math.min(1, (cloud - 0.7) / 0.3) : 0;
  const vars = {
    '--wx-stars': heroSkyRound(Math.max(0, (1 - 0.9 * cloud) * (1 - 0.6 * fog))),
    '--wx-cloud': heroSkyRound(Math.min(1, 0.2 + cloud)),
    '--wx-deck': heroSkyRound(deck),
    '--wx-fog': heroSkyRound(fog),
    '--wx-horizon': fog > 0 ? heroSkyRound(1 - 0.85 * fog) : 1,
    '--wx-moon-op': fog > 0 ? 0.5 : heroSkyRound(1 - 0.4 * cloud),
    '--moon-glow': weather.moon,
  };
  return (
  <div data-layer="sky" aria-hidden="true" style={{
    position: 'absolute', inset: '0 0 auto', height: 'var(--hero-surface)',
    overflow: 'hidden', pointerEvents: 'none',
    background: 'linear-gradient(180deg, #070d1a 0%, #111e32 58%, #253449 100%)',
    ...vars,
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at 95.5% 28%, rgba(159,183,209,0.1), transparent 52%)',
    }}/>
    {late && <SkyBack moonPath={moonPath} />}
    {/* A dark left veil protects the identity; a cool horizon ties into the blue reservoirs. */}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(90deg, rgba(8,14,28,0.94) 0%, rgba(8,14,28,0.72) 29%, rgba(8,14,28,0.15) 58%, transparent 78%)',
    }}/>
    {late && <SkyFront weather={weather} rain={rain} />}
  </div>
  );
};

// Stars, moon, clouds, overcast deck and fog. They mount in the second step, after the first paint.
const SkyBack = ({ moonPath }) => (
  <>
    <SkyStars />
    <div className="hero-moon" style={{ opacity: 'var(--wx-moon-op)' }}><SkyMoon moonPath={moonPath} /></div>
    <SkyClouds />
    {/* A flat overcast deck covers the upper sky when cloud is 70 percent or more. Its lower edge is soft. */}
    <div className="hero-deck" style={{ opacity: 'var(--wx-deck)' }} />
    {/* Fog: a flat haze that rises from the horizon. */}
    <div className="hero-fog" style={{ opacity: 'var(--wx-fog)' }} />
  </>
);

// The horizon haze, the sea strip, the distant features and the rain.
const SkyFront = ({ weather, rain }) => (
  <>
    <SkyHaze />
    <HeroSea weather={weather} />
    <SkyHorizon />
    <SkyRain rain={rain} live={!!weather.live} />
  </>
);

const SkyStars = React.memo(() => {
  const layerRef = useRef(null);
  useEffect(() => {
    const layer = layerRef.current;
    const sky = layer.closest('[data-layer="sky"]');
    const hero = layer.closest('#home');
    const stars = [...layer.children];
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
  return (
    <div ref={layerRef} className="hero-stars" style={{ opacity: 'var(--wx-stars)' }}>
    {Array.from({ length: 108 }, (_, i) => <span key={i} className={`hero-star${i % 7 === 0 ? ' hero-star-twinkle' : ''}`} style={{
      left: `${(i * 61.803 + 3) % 100}%`, top: `${10 + (i * i * 17.31) % 67}%`,
      width: i % 11 === 0 ? 2 : 1.25, height: i % 11 === 0 ? 2 : 1.25,
      '--star-base': 0.32 + (i % 5) * 0.08,
      '--star-period': `${6 + i % 5}s`, '--star-delay': `${-i * .73}s`,
      boxShadow: i % 11 === 0 ? '0 0 5px rgba(176,206,238,0.35)' : 'none',
    }}/>) }
    
    </div>
  );
});

// The moon disc. It builds again only when the phase path changes.
const SkyMoon = React.memo(({ moonPath }) => {
  const newMoon = moonPath === '';
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
        <defs>
          <radialGradient id="moon-disc" cx=".35" cy=".3" r=".75">
            <stop stopColor="#edf0e5" /><stop offset=".7" stopColor="#c8d1cf" /><stop offset="1" stopColor="#97a8b6" />
          </radialGradient>
          <filter id="moon-soft"><feGaussianBlur stdDeviation=".6" /></filter>
        </defs>
        {moonPath !== null && <>
          <circle cx="32" cy="32" r="29" fill="#0b1527" fillOpacity={newMoon ? 0.35 : 0.6} stroke="#8aa0ba" strokeOpacity={newMoon ? 0.5 : 0.22} strokeWidth="1" />
          <clipPath id="moon-lit">{newMoon ? null : <path d={moonPath} />}</clipPath>
        </>}
        <g clipPath={moonPath ? 'url(#moon-lit)' : undefined}>
          {!newMoon && <circle cx="32" cy="32" r="29" fill="url(#moon-disc)" filter="url(#moon-soft)" />}
          {!newMoon && <g fill="#697f91" opacity=".15" filter="url(#moon-soft)">
            <ellipse cx="22" cy="23" rx="7" ry="9" />
            <ellipse cx="37" cy="41" rx="9" ry="7" />
            <circle cx="43" cy="22" r="4" /><circle cx="20" cy="42" r="3" />
          </g>}
        </g>
      </svg>
  );
});

const SkyClouds = React.memo(() => (
  <div className="hero-night-clouds" style={{position: 'absolute', inset: 0, opacity: 'var(--wx-cloud)'}}>
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
));

const SkyHaze = React.memo(() => (
  <svg className="hero-landscape" viewBox="0 0 1440 20" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sea-haze" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#a5bcd3" stopOpacity="0" /><stop offset="1" stopColor="#a5bcd3" stopOpacity=".14" />
        </linearGradient>
      </defs>
      <rect width="1440" height="20" fill="url(#sea-haze)" />
    </svg>
));

// Distant offshore features sit on the horizon at fixed size, so they never stretch.
const SkyHorizon = React.memo(() => (
    <div className="hero-horizon" style={{ opacity: 'var(--wx-horizon)' }}>
      <svg className="hero-horizon__item" style={{ left: '33%' }} width="34" height="20" viewBox="0 0 34 20">
        <path d="M8 20V11h18v9M10 11V6h8v5M22 11V2" stroke="#2b3e57" strokeWidth="1.2" fill="none" />
        <ellipse cx="17" cy="16" rx="30" ry="10" fill="#e3c286" opacity=".07" />
        <circle className="hero-beacon hero-beacon--slow" cx="22" cy="2" r="1" fill="#ff5a4f" /><circle cx="13" cy="8.5" r=".9" fill="#e9c98f" />
        <circle cx="19" cy="14" r=".9" fill="#e9c98f" opacity=".7" />
      </svg>
      <svg className="hero-horizon__item" style={{ left: '50%' }} width="200" height="32" viewBox="0 0 200 32">
        {[[14, 26, 0], [44, 24, 40], [72, 22, 75], [98, 20, 20], [122, 18, 95], [144, 17, 55], [164, 15, 10], [182, 14, 80]].map(([x, h, a]) => {
          const top = 32 - h, r = h * .42;
          const blade = k => { const t = (a + k * 120) * Math.PI / 180; return `M${x} ${top}l${heroFixed(r * Math.cos(t))} ${heroFixed(r * Math.sin(t))}`; };
          return <g key={x}>
            <path d={`M${x} 32V${top}${blade(0)}${blade(1)}${blade(2)}`} stroke="#3a5070" strokeWidth=".9" fill="none" />
            <circle className="hero-beacon" cx={x} cy={top} r="1.1" fill="#ff5a4f" />
          </g>;
        })}
      </svg>
      {/* A distant ship: a white masthead light and a warm deck light. */}
      <svg className="hero-horizon__item" style={{ left: '72%' }} width="24" height="10" viewBox="0 0 24 10">
        <path d="M3 10h18l-2 -2h-14z" fill="#1a2738" />
        <circle cx="12" cy="5" r=".9" fill="#f4f7fb" /><circle cx="6" cy="9" r=".7" fill="#e9c98f" opacity=".8" />
      </svg>
    </div>
));

// The rain layer. The drop count follows the rain strength. Zero rain draws nothing.
const SkyRain = React.memo(({ rain, live }) => {
  if (!(rain > 0)) return null;
  const dropCount = Math.round(16 + 96 * rain);
  return (
    <div className={`hero-rain${live ? ' hero-rain--live' : ''}`}>
      {Array.from({ length: dropCount }, (_, i) => <span key={i} className="hero-rain-drop" style={{
        left: `${(i * 61.803 + 9) % 100}%`,
        '--rain-speed': `${.8 + i % 5 * .12}s`,
        '--rain-phase': `${-i * .13}s`,
        '--rain-length': `${14 + i % 6 * 3}px`,
        '--rain-alpha': .13 + i % 4 * .04,
      }}/>) }
    </div>
  );
});

// Decorative equipment stays anchored to the same surface and well as the live model:
// an offshore injection platform over the well, and a CO₂ carrier moored alongside while injecting.
// The drawing of the carrier is static and builds once (HeroShipBody). The pose reaches it through three CSS
// custom properties on the wrapper: --ship-wake, --ship-lights and --ship-engine. Between the manoeuvres
// the wrapper is hidden, not removed, so the drawing never builds again.
const HeroShip = ({ ship }) => {
  const pose = heroShipPose(ship);
  const engine = pose ? 0.15 + 0.85 * pose.wake : 0;
  return (
    <g className="hero-ship" style={pose ? {
      transform: `translateX(${heroFixed(pose.x)}px)`, opacity: heroFixed(pose.opacity * 100) / 100,
      '--ship-wake': heroFixed(pose.wake), '--ship-lights': pose.lights, '--ship-engine': heroFixed(engine * .22),
    } : { display: 'none' }}>
      <HeroShipBody />
      {/* The transfer hose is lowered from the platform to the manifold. */}
      {pose && pose.hose > 0 && <use href="#site-feed-route" stroke="#0e1a28" strokeWidth="3.4" strokeDasharray="1 1" strokeDashoffset={(1 - pose.hose).toFixed(3)} />}
    </g>
  );
};

const HeroShipBody = React.memo(() => (
  <g transform="translate(0 -6)">
          {/* Wake astern and the bow wave grow with the carrier's speed. */}
          <g style={{ opacity: 'var(--ship-wake)' }}>
            <path d="M394 151q30 1 70 -1M392 153q50 2 120 0M396 155q30 3 80 3" stroke="#cfdbe8" strokeWidth="1" strokeDasharray="18 6 30 8" opacity=".75" />
            <ellipse cx="400" cy="153" rx="12" ry="1.6" fill="#dfe7f0" opacity=".55" />
            <path d="M152 151q-12 -4 -26 0M149 153q-18 -2 -36 4" stroke="#e7eef7" strokeWidth="1" opacity=".8" />
          </g>
          <g className="hero-ship__hull">
            <path d="M150 154H392" stroke="#05090f" strokeWidth="3" opacity=".6" />
            <path d="M144 126L166 133H394V146Q394 152 388 152H174Q158 152 152 141Z" fill="url(#ship-hull)" stroke="#7c94b3" strokeOpacity=".35" strokeWidth=".6" />
            <path d="M156 147H392" stroke="#6b2f36" strokeWidth="2" opacity=".75" />
            <path d="M144 126L166 133H394" stroke="#b7c9de" strokeOpacity=".55" strokeWidth=".7" />
            <path d="M148 127H172V133H166Z" fill="#22344c" />
            <path d="M162 127V107M158 111h8" stroke="#7d93ad" strokeWidth="1" />
            <circle cx="162" cy="106" r="1.3" fill="#f4f7fb" />
            {/* Insulated cargo tanks with a highlight, and the midship manifold the hose connects to. */}
            {[205, 262, 319].map(x => <g key={x}>
              <rect x={x - 26} y="118" width="52" height="15" rx="7.5" fill="url(#ship-tank)" stroke="#a9bfd8" strokeOpacity=".35" strokeWidth=".5" />
              <path d={`M${x - 20} 120.5h40`} stroke="#dfe8f3" strokeOpacity=".35" strokeWidth=".7" />
            </g>)}
            <path d="M233 133V111h6" stroke="#7d93ad" strokeWidth="1" />
            {/* Accommodation and bridge aft, funnel, mast. The right face catches the moon. */}
            <path d="M350 133V97H390V133Z" fill="#3a4f6b" stroke="#89a0bd" strokeOpacity=".4" strokeWidth=".6" />
            <path d="M390 97V133" stroke="#b5c8de" strokeOpacity=".45" strokeWidth=".7" />
            <path d="M346 97H394V92H346Z" fill="#2f4462" />
            {[103, 110, 117, 124].map((y, i) => <path key={y} d={`M354 ${y}h32`} stroke="#f0cd8e" strokeWidth="2" strokeDasharray="3 2" opacity={i ? .45 : .95} />)}
            <path d="M374 92V80h9v12Z" fill="#1b2a3d" /><path d="M374 84h9" stroke="#6b2f36" strokeWidth="1.4" />
            <path d="M362 92V76M358 80h8" stroke="#7d93ad" strokeWidth="1" />
            <circle cx="362" cy="75" r="1.3" fill="#f4f7fb" />
            <circle cx="347" cy="95" r="1.3" fill="#ff5a4f" /><circle cx="394" cy="136" r="1" fill="#f4f7fb" opacity=".8" />
            {/* Deck floodlights come on alongside, for the transfer. */}
            <g style={{ opacity: 'var(--ship-lights)' }}>
              <ellipse cx="236" cy="124" rx="30" ry="10" fill="url(#site-flood)" />
              <ellipse cx="368" cy="126" rx="24" ry="9" fill="url(#site-flood)" />
            </g>
            {/* Exhaust thickens while the engines work. */}
            {[[386, 73, 4], [396, 67, 5.5], [409, 62, 7]].map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r} fill="#8b9bb0" style={{ opacity: 'var(--ship-engine)' }} />)}
            {/* Lamp reflections: short horizontal dashes that shimmer. Then the hull's dark reflection, broken up by the ripples. */}
            {HERO_SHIP_LAMPS.map(([x, color], i) => <g key={x} className="refl" style={{ '--rd': `${(-i * .37).toFixed(2)}s` }}>
              <path d={`M${x - 2.4} 153.6h4.8M${x - 1.5} 156.4h3M${x - 2} 159.2h4`} stroke={color} strokeOpacity=".55" strokeWidth="1" strokeLinecap="round" />
            </g>)}
            <path d="M172 153.6H388M184 156H378M196 158.4H362" stroke="#02060c" strokeWidth="1.5" strokeDasharray="22 3 40 4 16 3" opacity=".6" />
          </g>
        </g>
));

// Both share the viewBox -140 0 540 160. The well is at x = 48. The cut line is at y = 160. The waterline is at y = 146.
const HERO_SITE_WATERLINE = 146;
// The hose runs from the carrier's manifold to the deck. The flow then goes left along the deck and down the conductor.
const HERO_SITE_HOSE = 'M112 101Q176 144 236 108';
const HERO_SITE_FLOW = 'M236 108Q176 144 112 101H48V160';
const heroSiteRound = value => Math.round(value * 100) / 100;
// Lamp colours of the carrier's reflections: x position and colour.
const HERO_SHIP_LAMPS = [[180, '#f0cd8e'], [236, '#f6e3b8'], [356, '#f0cd8e'], [372, '#f0cd8e'], [347, '#ff6a5c']];
// Lamp reflections of the platform on the water: x position, colour and strength.
const HERO_PLATFORM_LAMPS = [[4, '#f0cd8e', 1], [22, '#f0cd8e', .8], [44, '#f6e3b8', 1], [70, '#f0cd8e', .9], [88, '#cfe0f0', .6], [104, '#f0cd8e', .8]];
// Accommodation windows: warm light, with some cold white and some dark.
const HERO_ACCOM_WINDOWS = (() => {
  const list = [];
  for (let row = 0; row < 5; row++) {
    for (let i = 0; i < 8; i++) {
      const lit = (i * 7 + row * 5) % 6;
      if (lit < 4) list.push([66 + i * 5.6, 60 + row * 7, lit === 3 ? '#cfe0f0' : '#f0cd8e', lit ? .62 : .95]);
    }
  }
  return list;
})();
const HERO_MODULE_WINDOWS = [[6, 78], [14, 78], [30, 84], [38, 84], [22, 72]];
// Path data for the repeated steel: module cladding, handrail posts, cellar deck truss, crane boom and derrick lattice.
const HERO_PLATFORM_STEEL = (() => {
  const make = (count, fn) => Array.from({ length: count }, (_, i) => fn(i)).join('');
  const boom = (() => {
    const x0 = 12, y0 = 54, x1 = -66, y1 = 20, n = 12;
    let d = `M${x0} ${y0}L${x1} ${y1}M${x0} ${y0 + 4}L${x1 + 2} ${y1 + 2}`;
    for (let i = 0; i < n; i++) {
      const a = i / n, b = (i + 1) / n;
      d += `M${heroSiteRound(x0 + (x1 - x0) * a)} ${heroSiteRound(y0 + (y1 - y0) * a)}L${heroSiteRound(x0 + (x1 + 2 - x0) * (a + b) / 2)} ${heroSiteRound(y0 + 4 + (y1 + 2 - y0 - 4) * (a + b) / 2)}L${heroSiteRound(x0 + (x1 - x0) * b)} ${heroSiteRound(y0 + (y1 - y0) * b)}`;
    }
    return d;
  })();
  const derrick = (() => {
    let d = 'M40 97L45 20H51L56 97';
    const levels = [88, 76, 64, 52, 40, 30];
    for (let i = 0; i < levels.length; i++) {
      const y = levels[i], k = (97 - y) / 77, xl = 40 + 5 * k, xr = 56 - 5 * k;
      d += `M${heroSiteRound(xl)} ${y}H${heroSiteRound(xr)}`;
      if (i) {
        const yp = levels[i - 1], kp = (97 - yp) / 77;
        d += `M${heroSiteRound(40 + 5 * kp)} ${yp}L${heroSiteRound(xr)} ${y}M${heroSiteRound(56 - 5 * kp)} ${yp}L${heroSiteRound(xl)} ${y}`;
      }
    }
    return d;
  })();
  return {
    cladding: make(20, i => `M${-2 + i * 3} 66V96`),
    rail: make(22, i => `M${-6 + i * 5.6} 97V94`),
    truss: make(20, i => `M${-6 + i * 6} 110L${-3 + i * 6} 104L${i * 6} 110`),
    boom,
    derrick,
  };
})();
// Floodlights on the decks: x, y. Each one has a soft glow.
const HERO_PLATFORM_FLOODS = [[10, 99], [40, 99], [70, 99], [100, 99], [30, 62], [88, 52]];

// The platform is split in three. SiteDefs, SitePlatformDeck and SitePlatformTop never build again: they are
// static. SurfaceSite builds only the parts that move: the flow gradients, the status light, the flow
// paths and the carrier wrapper. The order of the layers is the same as in one drawing.
const SurfaceSite = React.memo(({ geology, flow, ship }) => (
  <div className="hero-surface-site" aria-hidden="true" style={{ left: `${geology.wellXPct}%` }}>
    <svg viewBox="-140 0 540 160" width="100%" height="100%" fill="none">
      <SiteDefs />
      <defs>
        {/* The same pulses as in the well: leftwards along the hose and deck, then down the conductor. */}
        <linearGradient id="site-flow-x" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="24" y2="0" spreadMethod="repeat"
          gradientTransform={`translate(${-(flow || 0)} 0)`}>
          <stop stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="site-flow-y" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="24" spreadMethod="repeat"
          gradientTransform={`translate(0 ${flow || 0})`}>
          <stop stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* A faint warm bloom in the night air around the platform. */}
      <ellipse cx="54" cy="78" rx="120" ry="64" fill="url(#site-bloom)" />
      <HeroShip ship={ship} />
      <SitePlatformDeck />
      <circle data-site-status="true" cx="48" cy="95" r="1.5" fill={flow !== null ? 'var(--sim-glow-free)' : '#647b79'} style={{ fill: flow !== null ? 'var(--sim-glow-free)' : '#647b79' }} />
      <SitePlatformTop />
      {/* While connected, CO₂ runs from the carrier's manifold up the hose, across the deck to the well bay
          and down the conductor; the section's well carries it on to the aquifer. */}
      {flow !== null && <g className="hero-well__flow">
        <path d={HERO_SITE_FLOW} className="hero-well__co2" strokeWidth="2" />
        <path d="M236 108Q176 144 112 101H48" className="hero-well__pulse" strokeWidth="2" stroke="url(#site-flow-x)" />
        <path d="M48 101V160" className="hero-well__pulse" strokeWidth="2" stroke="url(#site-flow-y)" />
      </g>}
    </svg>
  </div>
));

const SiteDefs = React.memo(() => (
  <defs>
    <linearGradient id="site-steel" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#16222f" /><stop offset=".65" stopColor="#2b3d53" /><stop offset="1" stopColor="#6d86a4" /></linearGradient>
        <linearGradient id="site-module" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#2c3f57" /><stop offset="1" stopColor="#172438" /></linearGradient>
        <linearGradient id="site-accom" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#223349" /><stop offset=".8" stopColor="#2c4058" /><stop offset="1" stopColor="#3b5372" /></linearGradient>
        <radialGradient id="site-flood"><stop stopColor="#f6dca6" stopOpacity=".42" /><stop offset=".45" stopColor="#f0c987" stopOpacity=".12" /><stop offset="1" stopColor="#f0c987" stopOpacity="0" /></radialGradient>
        <radialGradient id="site-bloom"><stop stopColor="#efcf95" stopOpacity=".16" /><stop offset="1" stopColor="#efcf95" stopOpacity="0" /></radialGradient>
        <linearGradient id="ship-hull" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#27394f" /><stop offset=".55" stopColor="#162334" /><stop offset="1" stopColor="#0d1622" /></linearGradient>
        <linearGradient id="ship-tank" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#8ea4bd" /><stop offset=".3" stopColor="#4b6180" /><stop offset="1" stopColor="#1c2a3e" /></linearGradient>
        <path id="site-feed-route" pathLength="1" d={HERO_SITE_HOSE} />
  </defs>
));

// From the back legs to the derrick.
const SitePlatformDeck = React.memo(() => (
  <>
    {/* Back legs and bracing, thinner and hazier with distance. */}
      <g opacity=".55" stroke="#2a3d56">
        <path d={`M32 101L24 ${HERO_SITE_WATERLINE + 14}M88 101L98 ${HERO_SITE_WATERLINE + 14}`} strokeWidth="3.6" />
        <path d={`M30 116H90M28 131H93M30 116L59 131L90 116M28 131L60 ${HERO_SITE_WATERLINE}L93 131`} strokeWidth="1.1" />
      </g>
      {/* Front legs: battered steel, a yellow splash zone above the waterline, moonlight on the right edge. */}
      <path d="M20 104L8 160M76 104L88 160" stroke="url(#site-steel)" strokeWidth="5.6" />
      <path d="M76.8 104L88.8 160" stroke="#a9bfd8" strokeOpacity=".5" strokeWidth=".8" />
      <path d={`M14.2 132L11.6 ${HERO_SITE_WATERLINE}M81.8 132L84.4 ${HERO_SITE_WATERLINE}`} stroke="#8c7433" strokeWidth="5.8" opacity=".85" />
      <path d={`M16 118H80M14 132H82M16 118L48 132L80 118M14 132L48 ${HERO_SITE_WATERLINE}L82 132M16 118L48 104L80 118`} stroke="#35495f" strokeWidth="1.5" />
      {/* The well conductor is clamped to the jacket. */}
      <path d="M48 104V160" stroke="#3a4f69" strokeWidth="2.4" />
      {[118, 132].map(y => <path key={y} d={`M45 ${y}h6`} stroke="#6d86a4" strokeWidth="1.2" />)}
      <path d={`M84 110L92 ${HERO_SITE_WATERLINE + 14}`} stroke="#4a6382" strokeWidth="1.4" />
      {/* The sea darkens the legs below the waterline. Foam rings the legs at the waterline. */}
      <path d={`M11.6 ${HERO_SITE_WATERLINE}L8 160M84.4 ${HERO_SITE_WATERLINE}L88 160M22.2 ${HERO_SITE_WATERLINE}L24 160M96.6 ${HERO_SITE_WATERLINE}L98 160M48 ${HERO_SITE_WATERLINE}V160`} stroke="#07101c" strokeOpacity=".72" strokeWidth="6" />
      <g className="foam" stroke="#dfe9f5" strokeLinecap="round" fill="none">
        <path d={`M2 ${HERO_SITE_WATERLINE + .5}q6 -1.6 12 0M80 ${HERO_SITE_WATERLINE + .5}q6 -1.6 12 0M44 ${HERO_SITE_WATERLINE + .5}q4 -1.2 8 0`} strokeOpacity=".55" strokeWidth=".9" />
        <path d={`M0 ${HERO_SITE_WATERLINE + 2.2}q8 1 16 0M78 ${HERO_SITE_WATERLINE + 2.2}q8 1 16 0`} strokeOpacity=".25" strokeWidth=".7" />
      </g>
      {/* Lamp reflections on the water: short horizontal dashes that shimmer. */}
      {HERO_PLATFORM_LAMPS.map(([x, color, strength], i) => <g key={x} className="refl" style={{ '--rd': `${(-i * .41).toFixed(2)}s` }}>
        <path d={`M${x - 2.6} ${HERO_SITE_WATERLINE + 2}h5.2M${x - 1.6} ${HERO_SITE_WATERLINE + 5}h3.4M${x - 2.2} ${HERO_SITE_WATERLINE + 8}h4.2M${x - 1.2} ${HERO_SITE_WATERLINE + 11}h2.6`}
          stroke={color} strokeOpacity={heroSiteRound(strength * .65)} strokeWidth="1" strokeLinecap="round" />
      </g>)}
      {/* Cellar deck truss and main deck with handrail. */}
      <path d="M-8 104H118V111H-8Z" fill="#111b28" />
      <path d={HERO_PLATFORM_STEEL.truss} stroke="#2f425a" strokeWidth=".7" />
      <path d="M-8 104H118" stroke="#4f6683" strokeWidth=".8" />
      <path d="M-8 97H118V101H-8Z" fill="#1d2c40" stroke="#89a0bd" strokeOpacity=".35" strokeWidth=".5" />
      <path d={`M-6 94H116${HERO_PLATFORM_STEEL.rail}`} stroke="#6d86a4" strokeOpacity=".5" strokeWidth=".5" />
      {/* Process module with ribbed cladding and a stair tower. */}
      <path d="M-2 97V66H58V97Z" fill="url(#site-module)" stroke="#89a0bd" strokeOpacity=".3" strokeWidth=".5" />
      <path d={HERO_PLATFORM_STEEL.cladding} stroke="#0e1826" strokeOpacity=".55" strokeWidth=".6" />
      <path d="M-8 97V70H-2V97ZM-8 78L-2 74M-8 86L-2 82M-8 94L-2 90" stroke="#4a6080" strokeWidth=".6" fill="#131f2f" />
      {HERO_MODULE_WINDOWS.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="4" height="2.4" fill="#f0cd8e" opacity=".75" />)}
      <path d="M4 66V62H54V66" stroke="#3d5170" strokeWidth=".8" />
      {/* Accommodation, lit, with moonlight on its right face. */}
      <path d="M62 97V56H114V97Z" fill="url(#site-accom)" stroke="#89a0bd" strokeOpacity=".35" strokeWidth=".5" />
      <path d="M114 56V97" stroke="#b5c8de" strokeOpacity=".45" strokeWidth=".8" />
      {HERO_ACCOM_WINDOWS.map(([x, y, color, opacity]) => <rect key={`${x}-${y}`} x={heroSiteRound(x)} y={y} width="3.2" height="2.6" fill={color} opacity={opacity} />)}
      {/* Two orange lifeboats on davits, under the accommodation. */}
      {[94, 106].map(x => <g key={x}>
        <path d={`M${x} 101v3`} stroke="#56708f" strokeWidth=".6" />
        <rect x={x - 5} y="103.5" width="10" height="4.2" rx="2.1" fill="#d9822b" />
        <rect x={x - 4} y="103.8" width="8" height="1.3" rx=".6" fill="#f3b46a" opacity=".7" />
      </g>)}
      {/* Helideck on struts: green perimeter lights, the circle and the H in perspective. */}
      <path d="M66 56L74 51M112 56L104 51M120 52L110 56" stroke="#3b5070" strokeWidth="1" />
      <path d="M58 51H128L133 47H63Z" fill="#26384f" stroke="#9fb3c8" strokeOpacity=".5" strokeWidth=".5" />
      <ellipse cx="96" cy="49" rx="17" ry="1.6" fill="none" stroke="#e7c25a" strokeOpacity=".55" strokeWidth=".5" />
      <path d="M92 49.6h8M93 48.4v2.4M99 48.4v2.4" stroke="#e8edf2" strokeOpacity=".5" strokeWidth=".5" />
      {[60, 72, 84, 96, 108, 120, 130].map(x => <circle key={x} cx={x} cy={x > 125 ? 49 : 51} r=".75" fill="#7dfca0" />)}
      {/* Radio mast with a red light. */}
      <path d="M70 56V30M66 36h8M67 42h6" stroke="#5c7392" strokeWidth=".7" />
      <circle className="beacon" cx="70" cy="29" r="1.3" fill="#ff5a4f" />
      {/* Workover derrick over the well bay: the injection well runs straight down beneath it. */}
      <path d={HERO_PLATFORM_STEEL.derrick} stroke="#4a5f7a" strokeWidth=".85" />
      <path d="M56 97L51 20" stroke="#a9bfd8" strokeOpacity=".4" strokeWidth=".6" />
      <path d="M44 20H52V16H44Z" fill="#2c4060" />
      <circle className="beacon slow" cx="48" cy="14" r="1.8" fill="#ff5a4f" />
  </>
));

// The crane, the floodlights and the corner lights.
const SitePlatformTop = React.memo(() => (
  <>
    {/* Pedestal crane: lattice boom resting over the water, a lit cab. */}
      <path d="M6 66V58H14V66Z" fill="#22344b" />
      <path d="M2 50H16V58H2Z" fill="#2b3e57" stroke="#89a0bd" strokeOpacity=".35" strokeWidth=".5" />
      <rect x="4" y="52" width="5" height="3" fill="#f0cd8e" opacity=".85" />
      <path d={HERO_PLATFORM_STEEL.boom} stroke="#53698a" strokeWidth=".7" fill="none" />
      <path d="M-66 20V46" stroke="#7d93ad" strokeOpacity=".55" strokeWidth=".5" />
      <circle className="beacon" cx="-66" cy="19" r="1.3" fill="#ff5a4f" />
      {/* Floodlights on the decks with their glow. White corner lights flash Morse U. */}
      {HERO_PLATFORM_FLOODS.map(([x, y]) => <g key={`${x}-${y}`}>
        <circle cx={x} cy={y} r="1" fill="#fff3d6" />
        <ellipse cx={x} cy={y + 5} rx="16" ry="9" fill="url(#site-flood)" />
      </g>)}
      <circle className="morse" cx="-7" cy="100" r="1.2" fill="#ffffff" /><circle className="morse" cx="117" cy="100" r="1.2" fill="#ffffff" />
  </>
));

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
      that run up to 100× faster than full 3D compositional models{' '}
      (<a className="hero-summary__source" href="#pub-ve-depleted-gas-2026" onClick={event => onNavigate && onNavigate('publications', event)}>preprint, 2026</a>).
    </p>
    <div className="hero-actions hero-reveal">
      <a className="btn btn--primary" href="./simulator.html" onClick={event => onNavigate && onNavigate('simulator', event)}>
        <Icon name="play" size={14} />Open the VE simulator
      </a>
      <a className="btn btn--quiet" href="./ve-story.html" onClick={event => onNavigate && onNavigate('story', event)}>How VE models work</a>
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
    <nav className="hero-doors hero-reveal" aria-label="Paths for visitors">
      <ul>
        <li><span className="hero-doors__ask">Reviewing my work?</span> <a href="#publications" onClick={event => onNavigate && onNavigate('publications', event)}><span className="hero-doors__long">Papers and BibTeX</span><span className="hero-doors__short">Papers &amp; BibTeX</span></a></li>
        <li><span className="hero-doors__ask">Hiring?</span> <a href="./assets/cv.pdf">CV (PDF)</a></li>
        <li><span className="hero-doors__ask">Working on CCS?</span> <a href="./simulator.html#method"><span className="hero-doors__long">The method and its checks</span><span className="hero-doors__short">Method</span></a></li>
      </ul>
    </nav>
  </div>
));

Object.assign(window, { SubsurfaceHero });
