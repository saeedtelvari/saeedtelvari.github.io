/* =====================================================
   HeroWater - the water band of the hero, from the sea level down to the seabed.
   The band has three layers. Back (z 1): the water and the far side of the jacket.
   Live (z 2): a canvas from another component. Front (z 3): the near side of the jacket, the seabed, the sensors and the label.
   The band has its own scale. The rock section below it keeps its own scale.
   ===================================================== */

// ---- hero water helpers
const HERO_SEA_DEPTH = 76; // m, GEBCO 2020 at 57.5° N 2.5° E
// Platform lamps. The numbers are x in site units. The well is at x = 48.
const HERO_WATER_LAMPS = [4, 22, 44, 70, 88, 104];
// Jacket legs at the sea level and at the seabed, in site units.
const HERO_WATER_LEGS = {
  front: [[8, -5], [88, 101]],
  back: [[24, 14], [98, 110]],
};
// The X-braces sit between these levels, in metres.
const HERO_WATER_LEVELS = [0, 18, 40, HERO_SEA_DEPTH];
// The longest label is 32 characters.
const HERO_WATER_LABEL_MAX = 32;

// The inverse of the display depth mapping of the section: y in section units to metres below the seabed.
// The section has a break at y = 28 (800 m). Above it 28 units cover 800 m. Below it 1 unit is 3 m.
const heroWaterYToDepth = y => (y <= 28 ? y / 28 * 800 : 800 + (y - 28) * 3);

// x of a leg at the depth z (m). Each leg is a straight line from its top x to its seabed x.
const heroWaterLegX = (leg, z) => leg[0] + (leg[1] - leg[0]) * z / HERO_SEA_DEPTH;

// The x-range, in percent of the section width, where one aquifer holds CO2. The result is null when it holds none.
// The rule is the same as in the plume drawing: one cell of margin on each side.
const heroWaterRange = (h, hMax) => {
  let a = -1, b = -1;
  for (let k = 0; k <= 200; k++) if (hMax[k] > 0.001 || h[k] > 0.001) { if (a < 0) a = k; b = k; }
  if (a < 0) return null;
  return [Math.max(0, a - 1) / 2, Math.min(200, b + 1) / 2];
};

// The footprints of the plume on the seabed: the storage aquifer and the leaked CO2 in the overlying aquifer.
const heroWaterFootprints = frame => (frame ? {
  storage: heroWaterRange(frame.h, frame.hMax),
  leaked: heroWaterRange(frame.h2, frame.h2Max),
} : { storage: null, leaked: null });

// The shallowest roof (smallest y) of the overlying aquifer where it holds leaked CO2. The result is null when it holds none.
const heroWaterLeakTop = (frame, roofR) => {
  if (!frame) return null;
  let top = null;
  for (let k = 0; k <= 200; k++) {
    if ((frame.h2[k] > 0.001 || frame.h2Max[k] > 0.001) && (top === null || roofR[k] < top)) top = roofR[k];
  }
  return top;
};

// The one line of text in the band. It shows only while a fault leaks. The depth is rounded to 10 m.
const heroWaterLabel = (leaking, topY) => {
  if (!leaking || topY === null || !Number.isFinite(topY)) return null;
  const text = `Leaked CO₂ ${Math.round(heroWaterYToDepth(topY) / 10) * 10} m below seabed`;
  return text.length <= HERO_WATER_LABEL_MAX ? text : null;
};

// Desktop label side. The label sits left of the fault. It goes to the right when the left side hits the axis or the jacket.
// All numbers are px. wellPx is the x of the well. scale is px per site unit.
const heroWaterLabelSide = ({ faultPx, labelPx, wellPx, scale, viewportPx }) => {
  const axisEnd = 100, gap = 8;
  const jacket = [wellPx + (-5 - 48) * scale - 6, wellPx + (110 - 48) * scale + 36];
  const hits = (from, to) => from < axisEnd || to > viewportPx - gap || (from < jacket[1] && to > jacket[0]);
  const left = [faultPx - gap - labelPx, faultPx - gap];
  const right = [faultPx + gap, faultPx + gap + labelPx];
  if (!hits(left[0], left[1])) return 'left';
  if (!hits(right[0], right[1])) return 'right';
  return left[0] >= axisEnd ? 'left' : 'right';
};

// Small fixed random numbers for the mussels and the scour rock. The same dots appear on every load.
const heroWaterRandom = seed => () => {
  seed = (seed + 0x6D2B79F5) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// The X-braces and the horizontals of one jacket face, as one path.
const heroWaterFrame = legs => {
  let d = '';
  HERO_WATER_LEVELS.forEach((z, i) => {
    const x0 = heroWaterLegX(legs[0], z), x1 = heroWaterLegX(legs[1], z);
    if (i) d += `M${x0} ${z}H${x1}`;
    if (i < HERO_WATER_LEVELS.length - 1) {
      const z2 = HERO_WATER_LEVELS[i + 1];
      d += `M${x0} ${z}L${heroWaterLegX(legs[1], z2)} ${z2}M${x1} ${z}L${heroWaterLegX(legs[0], z2)} ${z2}`;
    }
  });
  return d;
};
// ---- end hero water helpers

// Round dots are zero-length lines with round caps and a stroke that does not scale. They stay round in a stretched SVG.
const HERO_WATER_DOTS = (() => {
  const dot = (x, y) => `M${x.toFixed(2)} ${y.toFixed(2)}h.01`;
  const rand = heroWaterRandom(5);
  const mussels = { fine: '', coarse: '' };
  for (let i = 0; i < 44; i++) {
    const leg = rand() < 0.5 ? 0 : 1;
    const z = Math.pow(rand(), 1.5) * 24;
    const x = heroWaterLegX(HERO_WATER_LEGS.front[leg], z) + (rand() - 0.5) * 2.4;
    mussels[rand() < 0.6 ? 'fine' : 'coarse'] += dot(x, z);
  }
  const rocks = { fine: '', coarse: '' };
  [...HERO_WATER_LEGS.front, ...HERO_WATER_LEGS.back].forEach(leg => {
    for (let i = 0; i < 9; i++) {
      const dx = (rand() - 0.5) * 2, h = rand();
      const x = leg[1] + dx * 9, y = HERO_SEA_DEPTH - 0.9 - h * (1 - Math.abs(dx)) * 2.4;
      rocks[rand() < 0.55 ? 'fine' : 'coarse'] += dot(x, y);
    }
  });
  return { mussels, rocks };
})();

// The three small tilted shafts of moonlight in the back layer. They are static and very faint.
const HERO_WATER_MOON = [[62, 14], [72, 12], [82, 15]];

// Back layer: water, moon shafts and lamp light, and the far side of the jacket.
const HeroWaterBack = React.memo(({ wellXPct }) => {
  const [back0, back1] = HERO_WATER_LEGS.back;
  return (
    <div className="hero-water__back" aria-hidden="true">
      <svg className="hero-water__moon" viewBox="0 0 1000 76" preserveAspectRatio="none" fill="none">
        <defs>
          <linearGradient id="hero-water-moon" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#bed7f0" stopOpacity=".06" /><stop offset="1" stopColor="#bed7f0" stopOpacity="0" />
          </linearGradient>
        </defs>
        {HERO_WATER_MOON.map(([x, w]) => (
          <path key={x} d={`M${x * 10 - 5} 0H${x * 10 + 5}L${x * 10 - 18 + w * 2} 46H${x * 10 - 18 - w * 2}Z`} fill="url(#hero-water-moon)" />
        ))}
      </svg>
      <div className="hero-water__site" style={{ left: `${wellXPct}%` }}>
        <svg viewBox={`-140 0 540 ${HERO_SEA_DEPTH}`} preserveAspectRatio="none" fill="none">
          <defs>
            <linearGradient id="hero-water-lamp" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#f0cd8e" stopOpacity=".14" /><stop offset="1" stopColor="#f0cd8e" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* One warm cone of about 25 m under each platform lamp. */}
          {HERO_WATER_LAMPS.map(x => <path key={x} d={`M${x - 1.5} 0H${x + 1.5}L${x + 11} 25H${x - 11}Z`} fill="url(#hero-water-lamp)" />)}
          <g opacity=".55" stroke="#22364d" vectorEffect="non-scaling-stroke">
            <path d={`M${back0[0]} 0L${back0[1]} ${HERO_SEA_DEPTH}M${back1[0]} 0L${back1[1]} ${HERO_SEA_DEPTH}`} strokeWidth="3" vectorEffect="non-scaling-stroke" />
            <path d={heroWaterFrame(HERO_WATER_LEGS.back)} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
      </div>
    </div>
  );
});

// One sensor lander: a tripod and a dome. The small light blinks with CSS opacity only.
const HeroWaterLander = ({ index, ping = false, style }) => (
  <span className="hero-water__lander" style={{ '--i': index, ...style }}>
    {ping && <span className="hero-water__ping"><svg viewBox="0 0 200 100" preserveAspectRatio="none"><path d="M5.1 75.6A98 98 0 0 1 194.9 75.6" vectorEffect="non-scaling-stroke" /></svg></span>}
    <svg viewBox="0 0 12 10" width="12" height="10">
      <path d="M2 10L6 3.5M10 10L6 3.5M6 10V3.5" stroke="#8fa3b8" strokeWidth=".9" />
      <path d="M3.7 3.5a2.3 2.3 0 0 1 4.6 0Z" fill="#5f7389" />
    </svg>
    <i className="hero-water__light" />
  </span>
);

// Front layer: the near side of the jacket, the seabed, the sensors, the axis and the one label.
// The props are numbers and text only, so that the memo skips a frame when nothing moved. A range of -1 means none.
const HeroWaterFront = React.memo(({ wellXPct, f1, f2, storageL, storageR, leakedL, leakedR, label, labelLeft, labelRight }) => {
  const [front0, front1] = HERO_WATER_LEGS.front;
  const { mussels, rocks } = HERO_WATER_DOTS;
  const feet = [...HERO_WATER_LEGS.front, ...HERO_WATER_LEGS.back].map(leg => leg[1]);
  return (
    <div className="hero-water__front" aria-hidden="true">
      <div className="hero-water__site" style={{ left: `${wellXPct}%` }}>
        <svg viewBox={`-140 0 540 ${HERO_SEA_DEPTH}`} preserveAspectRatio="none" fill="none">
          <defs>
            <linearGradient id="hero-water-edge" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={HERO_SEA_DEPTH}>
              <stop stopColor="#96b4d6" stopOpacity=".45" /><stop offset="1" stopColor="#96b4d6" stopOpacity=".05" />
            </linearGradient>
          </defs>
          <g strokeLinecap="butt">
            <path d={heroWaterFrame(HERO_WATER_LEGS.front)} stroke="#26384f" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <path d={`M${front0[0]} 0L${front0[1]} ${HERO_SEA_DEPTH}M${front1[0]} 0L${front1[1]} ${HERO_SEA_DEPTH}`} stroke="#1c2d42" strokeWidth="5" vectorEffect="non-scaling-stroke" />
            <path d={`M${front0[0] + 1} 0L${front0[1] + 1} ${HERO_SEA_DEPTH}M${front1[0] + 1} 0L${front1[1] + 1} ${HERO_SEA_DEPTH}`} stroke="url(#hero-water-edge)" strokeWidth=".7" vectorEffect="non-scaling-stroke" />
            {/* The well conductor at x = 48, with a clamp at 18 m and at 40 m. */}
            <path d={`M48 0V${HERO_SEA_DEPTH}`} stroke="#33475f" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
            <path d="M45 18H51M45 40H51" stroke="#6d86a4" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
          </g>
          <g strokeLinecap="round" vectorEffect="non-scaling-stroke">
            <path d={mussels.fine} stroke="rgba(96,124,112,.85)" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
            <path d={mussels.coarse} stroke="rgba(96,124,112,.85)" strokeWidth="1.7" vectorEffect="non-scaling-stroke" />
            <path d={rocks.fine} stroke="#4c5666" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
            <path d={rocks.coarse} stroke="#4c5666" strokeWidth="2.6" vectorEffect="non-scaling-stroke" />
            {/* Short piles under the front feet. */}
            <path d={`M${feet[0]} ${HERO_SEA_DEPTH}v8M${feet[1]} ${HERO_SEA_DEPTH}v8`} stroke="rgba(27,39,56,.75)" strokeWidth="3.5" strokeLinecap="butt" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
        {/* The third lander stands 26 px right of the right front foot. */}
        <HeroWaterLander index={2} style={{ left: `calc(${((front1[1] + 140) / 540 * 100).toFixed(3)}% + 26px)` }} />
      </div>
      <div className="hero-water__bed" />
      <div className="hero-water__ripples" />
      {storageL >= 0 && <i className="hero-water__foot hero-water__foot--storage" style={{ left: `${storageL}%`, width: `${storageR - storageL}%` }} />}
      {leakedL >= 0 && <i className="hero-water__foot hero-water__foot--leaked" style={{ left: `${leakedL}%`, width: `${leakedR - leakedL}%` }} />}
      <HeroWaterLander index={0} style={{ left: `calc(${f1}% + 10px)` }} />
      <HeroWaterLander index={1} ping style={{ left: `calc(${f2}% + 10px)` }} />
      {/* The band's own axis. The rule goes on from the sea level to the seabed. */}
      <span className="hero-water__rule" />
      <span className="hero-water__tick" />
      <span className="hero-water__depth">{HERO_SEA_DEPTH} m</span>
      {label && <span className="hero-water__label" style={labelLeft ? { left: labelLeft } : { right: labelRight }}>{label}</span>}
    </div>
  );
});

// The viewport width. A resize can move the label to the other side of the fault.
const useHeroWaterViewport = () => {
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' && window.innerWidth) || 1200);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
};

// The band draws from the current model frame. Only the footprints and the label change between frames.
const HeroWater = ({ geology, faults, frame, leak, roofR }) => {
  const viewport = useHeroWaterViewport();
  const { storage, leaked } = heroWaterFootprints(frame);
  const label = heroWaterLabel(!!leak, heroWaterLeakTop(frame, roofR));
  const faultsPct = faults.map(fault => fault.top.x / 10);
  let labelLeft = null, labelRight = null;
  if (label && leak) {
    const fx = faultsPct[leak.fault];
    if (viewport <= 600) labelLeft = '52px';
    else {
      const siteWidth = Math.min(648, 0.504 * viewport);
      const side = heroWaterLabelSide({
        faultPx: fx / 100 * viewport, labelPx: label.length * 7.2 + 10,
        wellPx: geology.wellXPct / 100 * viewport, scale: siteWidth / 540, viewportPx: viewport,
      });
      if (side === 'left') labelRight = `calc(${100 - fx}% + 8px)`;
      else labelLeft = `calc(${fx}% + 8px)`;
    }
  }
  // Round the footprints to 0.5 percent. The memo then skips a frame when nothing moved.
  const near = (range, i) => (range ? Math.round(range[i] * 2) / 2 : -1);
  return (
    <>
      <HeroWaterBack wellXPct={geology.wellXPct} />
      <HeroWaterFront wellXPct={geology.wellXPct} f1={faultsPct[0]} f2={faultsPct[1]} storageL={near(storage, 0)} storageR={near(storage, 1)}
        leakedL={near(leaked, 0)} leakedR={near(leaked, 1)} label={label} labelLeft={labelLeft} labelRight={labelRight} />
    </>
  );
};
