/* =====================================================
   Live water - the moving part of the water band in the hero.
   One canvas lies between the far and the near legs of the jacket.
   It draws the sea surface, marine snow, a warm layer in summer, a haze in a gale and a small school of fish.
   It draws no text.
   ===================================================== */

// ---- hero water helpers (pure; tests/hero-water-live.test.js evaluates this block)
const HERO_WATER_DEPTH = 76;          // m. The real sea depth at the site (GEBCO 2020, 57.5 N 2.5 E).
const HERO_WATER_GRAVITY = 9.81;      // m/s2
const HERO_WATER_EXAG = 6;            // The orbits are drawn 6 times larger than the true size.
const HERO_WATER_FRAME_MS = 30;       // The loop skips a frame that comes sooner than this (about 30 fps at 60 Hz).
const HERO_WATER_MAX_SNOW = 160;      // The most specks of marine snow.
const HERO_LIVE_LAMPS = [4, 22, 44, 70, 88, 104]; // Lamp positions in site units.
const HERO_WATER_SKY_WATER = '#050b16'; // The dark near water of the sea strip, above the wave line.
const HERO_WATER_SNOW_ALPHA = [0.2, 0.28, 0.36, 0.44]; // Four alpha levels. The specks of one level draw in one batch.
const HERO_WATER_STILL_TIME = 2;      // s. The time of the still frame for reduced motion.
const HERO_WATER_GALE_HEIGHT = 3.5;   // m. A haze of sediment shows from this wave height.

// A small seeded random generator, so that the scene looks the same at each visit.
const heroLiveRandom = seed => () => {
  seed = (seed + 0x6D2B79F5) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// The wave of the sea for one period and one height. The pixel scale is the pixels for one metre of depth.
// The wavelength is the deep-water value: L = g T^2 / (2 pi).
const heroWaterWave = (period, height, pxPerM) => {
  const length = HERO_WATER_GRAVITY * period * period / (2 * Math.PI);
  return {
    length,
    k: 2 * Math.PI / length,
    omega: 2 * Math.PI / period,
    lambda: Math.max(14, length * pxPerM),
    amplitude: Math.max(0.5, height / 2 * pxPerM),
  };
};

// The radius of the orbit of a water particle at depth z (m). It falls with depth as exp(-k z).
// The radius is drawn 6 times larger than the true size.
const heroWaterOrbit = (height, pxPerM, k, z) => (height / 2) * pxPerM * HERO_WATER_EXAG * Math.exp(-k * z);

const heroWaterSnowCount = width => Math.min(HERO_WATER_MAX_SNOW, Math.round(width / 9));

// The specks. x is a fraction of the width. z is the depth in m. sink is in m/s. level is an index in HERO_WATER_SNOW_ALPHA.
const heroWaterSnow = (count, phone) => {
  const random = heroLiveRandom(7);
  return Array.from({ length: count }, () => {
    const x = random(), z = random() * HERO_WATER_DEPTH, phase = random() * 2 * Math.PI;
    const radius = (0.6 + random() * 0.8) * (phone ? 0.62 : 1), alpha = 0.16 + random() * 0.3, sink = 0.1 + random() * 0.2;
    return { x, z, phase, radius, alpha, sink, level: Math.min(HERO_WATER_SNOW_ALPHA.length - 1, Math.floor((alpha - 0.16) / 0.3 * HERO_WATER_SNOW_ALPHA.length)) };
  });
};

// The sideways drift in px/s. It is illustrative: 7 px/s at 0.6 km/h on desktop and 3 px/s on phones.
// Open-Meteo documents ocean_current_direction as the direction the current flows towards (0 north, 90 east).
// The section x axis is east, so the east part of the current is sin(direction).
// A missing speed or direction gives no drift.
const heroWaterDrift = (current, direction, phone) => {
  if (current === null || current === undefined || direction === null || direction === undefined) return 0;
  return (phone ? 3 : 7) * (current / 0.6) * Math.sin(direction * Math.PI / 180);
};

// The month is 0 for January. The warm layer shows from June to September.
const heroWaterIsSummer = month => month >= 5 && month <= 8;

// The scale of the site: the width of the site in px and the px for one site unit.
const heroWaterSiteScale = (viewportWidth, phone) => {
  const width = phone ? 0.62 * viewportWidth : Math.min(648, 0.504 * viewportWidth);
  return width / 540;
};

// The fish. The school has 28 fish on desktop and 16 on phones. ox, oy and phase are in 0..1 (ox and oy: -0.5..0.5).
const heroWaterFish = phone => {
  const random = heroLiveRandom(21);
  return Array.from({ length: phone ? 16 : 28 }, () => ({ ox: random() - 0.5, oy: random() - 0.5, phase: random() * 2 * Math.PI, speed: 0.8 + random() * 0.5, length: 4 + random() * 2.5 }));
};

// The place of the school at time t. The centre circles the jacket in about 28 s at 15 to 30 m of depth.
// dir is 1 when the school swims to the right and -1 when it swims to the left.
const heroWaterSchool = (t, wellX, phone) => {
  const w = 2 * Math.PI / 28;
  return {
    x: wellX + (phone ? 43 : 70) * Math.cos(w * t),
    z: 22 + 2 * Math.sin(w * 0.7 * t),
    dir: -Math.sin(w * t) >= 0 ? 1 : -1,
  };
};
// ---- end hero water helpers

// The numbers that the drawing reads: the wave, the drift and the layers. They change only with the weather.
const heroWaterParams = (weather, month) => {
  const height = heroWeatherWaves(weather);
  const period = heroWeatherPeriod(weather);
  return {
    height, period,
    drift: weather.current === null || weather.current === undefined ? null : { current: weather.current, direction: weather.currentDir },
    summer: heroWaterIsSummer(month),
    gale: height >= HERO_WATER_GALE_HEIGHT,
  };
};

// The drawing engine of the canvas. It owns the size, the specks, the fish and two gradients.
const heroWaterEngine = canvas => {
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, phone = false, snow = [], fish = [], warm = null, haze = null;

  const resize = (cssWidth, cssHeight, ratio) => {
    if (!ctx || !cssWidth || !cssHeight) return;
    width = cssWidth; height = cssHeight;
    const next = width <= 600;
    if (next !== phone || !fish.length) { phone = next; fish = heroWaterFish(phone); }
    snow = heroWaterSnow(heroWaterSnowCount(width), phone);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const mpx = height / HERO_WATER_DEPTH;
    // Two gradients that depend only on the height of the band.
    warm = ctx.createLinearGradient(0, 0, 0, 34 * mpx);
    warm.addColorStop(0, 'rgba(70,190,160,0.08)');
    warm.addColorStop(1, 'rgba(70,190,160,0)');
    haze = ctx.createLinearGradient(0, (HERO_WATER_DEPTH - 16) * mpx, 0, height);
    haze.addColorStop(0, 'rgba(126,108,78,0)');
    haze.addColorStop(1, 'rgba(126,108,78,0.28)');
  };

  const paint = (p, t, wellXPct) => {
    if (!ctx || !width) return;
    ctx.clearRect(0, 0, width, height);
    const mpx = height / HERO_WATER_DEPTH;
    const wave = heroWaterWave(p.period, p.height, mpx);
    const sz = phone ? 0.62 : 1;

    // The warm layer of summer: a faint tint in the top 34 m. It has no line and no label.
    if (p.summer) { ctx.fillStyle = warm; ctx.fillRect(0, 0, width, 34 * mpx); }
    // The haze of sediment in a gale, in the bottom 16 m.
    if (p.gale) { ctx.fillStyle = haze; ctx.fillRect(0, (HERO_WATER_DEPTH - 16) * mpx, width, 16 * mpx + 1); }

    // Marine snow: each speck moves on the orbit of the wave, sinks slowly and drifts with the current.
    const drift = p.drift ? heroWaterDrift(p.drift.current, p.drift.direction, phone) : 0;
    ctx.fillStyle = '#d3e0ec';
    for (let level = 0; level < HERO_WATER_SNOW_ALPHA.length; level++) {
      ctx.globalAlpha = HERO_WATER_SNOW_ALPHA[level];
      ctx.beginPath();
      for (let i = 0; i < snow.length; i++) {
        const s = snow[i];
        if (s.level !== level) continue;
        const z = (s.z + s.sink * t) % HERO_WATER_DEPTH;
        const r = heroWaterOrbit(p.height, mpx, wave.k, z);
        const x = (((s.x * width + drift * t) % width) + width) % width;
        const angle = wave.omega * t + s.phase;
        const cx = x + r * Math.cos(angle), cy = z * mpx + r * Math.sin(angle);
        ctx.moveTo(cx + s.radius, cy);
        ctx.arc(cx, cy, s.radius, 0, 2 * Math.PI);
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // The fish: a loose school around the jacket. A fish in the lamp light is brighter.
    const wellX = wellXPct / 100 * width;
    const su = heroWaterSiteScale(width, phone);
    const lampX = HERO_LIVE_LAMPS.map(u => wellX + (u - 48) * su);
    const school = heroWaterSchool(t, wellX, phone);
    const dir = school.dir;
    ctx.lineWidth = Math.max(0.6, 0.9 * sz);
    ctx.lineCap = 'round';
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass ? 'rgba(220,232,244,0.8)' : 'rgba(150,176,204,0.5)';
      ctx.beginPath();
      for (let i = 0; i < fish.length; i++) {
        const f = fish[i];
        const x = school.x + f.ox * 64 * sz + 4 * sz * Math.sin(t * 1.3 * f.speed + f.phase);
        const y = (school.z + f.oy * 11) * mpx + 1.6 * sz * Math.cos(t * 1.1 * f.speed + f.phase);
        let lit = false;
        if (y < 28 * mpx) for (let j = 0; j < lampX.length; j++) if (Math.abs(lampX[j] - x) < 14 * sz) { lit = true; break; }
        if ((pass === 1) !== lit) continue;
        const len = f.length * sz, tail = x - dir * len, fork = 1.3 * sz;
        ctx.moveTo(tail, y); ctx.lineTo(x, y);
        ctx.moveTo(tail, y); ctx.lineTo(tail - dir * fork, y - 0.9 * sz);
        ctx.moveTo(tail, y); ctx.lineTo(tail - dir * fork, y + 0.9 * sz);
      }
      ctx.stroke();
    }

    // The sea surface on the top edge. The strip above the line takes the colour of the dark near water.
    const base = wave.amplitude + 0.6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x <= width + 6; x += 6) ctx.lineTo(x, base + wave.amplitude * Math.sin(2 * Math.PI * x / wave.lambda - wave.omega * t));
    ctx.lineTo(width + 6, 0);
    ctx.closePath();
    ctx.fillStyle = HERO_WATER_SKY_WATER;
    ctx.fill();
    ctx.beginPath();
    for (let x = 0; x <= width + 6; x += 6) {
      const y = base + wave.amplitude * Math.sin(2 * Math.PI * x / wave.lambda - wave.omega * t);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(207,224,240,0.42)';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  return { resize, paint };
};

// One canvas in the water band. It has its own loop at 30 fps at most.
// The loop runs only while the hero is in view and the tab is visible, and never with reduced motion.
// With reduced motion, the canvas shows one still frame and draws it again when the size changes.
const HeroWaterLive = ({ weather, wellXPct, visible, hidden }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const timeRef = useRef(HERO_WATER_STILL_TIME);
  const reduced = useMemo(() => siteReducedMotion(), []);
  const month = useMemo(() => new Date().getUTCMonth(), []);
  const params = useMemo(() => heroWaterParams(weather, month),
    [weather.waves, weather.period, weather.windMs, weather.wind, weather.current, weather.currentDir, month]);
  const running = !reduced && heroShouldTick({ playing: true, visible, hidden });
  const live = useRef(null);
  live.current = { params, wellXPct };

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = heroWaterEngine(canvas);
    engineRef.current = engine;
    const fit = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      engine.resize(width, height, Math.min(2, window.devicePixelRatio || 1));
      engine.paint(live.current.params, timeRef.current, live.current.wellXPct);
    };
    fit();
    if (!('ResizeObserver' in window)) return () => { engineRef.current = null; };
    const sizes = new ResizeObserver(fit);
    sizes.observe(canvas);
    return () => { sizes.disconnect(); engineRef.current = null; };
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    let frameId = 0, last = 0;
    const tick = now => {
      frameId = requestAnimationFrame(tick);
      if (last && now - last < HERO_WATER_FRAME_MS) return;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      timeRef.current += dt;
      if (engineRef.current) engineRef.current.paint(live.current.params, timeRef.current, live.current.wellXPct);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [running]);

  // A pause, reduced motion or a new weather: draw one frame at the current time.
  useEffect(() => {
    if (!running && engineRef.current) engineRef.current.paint(params, timeRef.current, wellXPct);
  }, [params, running, wellXPct]);

  return <canvas ref={canvasRef} className="hero-water__live" aria-hidden="true" />;
};
