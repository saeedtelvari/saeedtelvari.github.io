// SubsurfaceHero.jsx — landing hero as a CO2 storage cross-section.
// Strict layout: sky (top 42vh) holds the identity, subsurface (58vh) holds
// the cross-section. They never overlap.

const { useEffect, useMemo, useRef, useState } = React;

/* =====================================================
   Physical Cap Rock & VE Numerical PDE Solver
   ===================================================== */

// Interpolates a smooth spline of the cap rock underside profile:
// (0, 140) -> (195, 92) -> (510, 170) -> (710, 34) -> (1000, 142)
// Defines a complex, realistic wavy cap rock profile with multiple anticlines and a regional dip
const capRockY = (x) => {
  const dip = 60 + x * 0.12; 
  const wave1 = - 20 * Math.sin(x * Math.PI / 150); // Large wavelength
  const wave2 = - 15 * Math.sin(x * Math.PI / 80);  // Medium wavelength
  const wave3 = - 8 * Math.sin(x * Math.PI / 45);   // Small wavelength
  return dip + wave1 + wave2 + wave3;
};

// Numerical PDE Simulator: solves explicit Finite Volume VE equations for CO2 gravity tongue
const precomputeSimulation = () => {
  const N = 101; // 101 cells (width 10px each for x = 0 to 1000)
  const history = [];
  
  let h = new Array(N).fill(0); // plume thickness, initially 0
  let hMax = new Array(N).fill(0); // maximum plume thickness reached
  
  let h2 = new Array(N).fill(0); // secondary reservoir plume
  let h2Max = new Array(N).fill(0);
  
  for (let frame = 0; frame <= 600; frame++) {
    history.push({ h: [...h], hMax: [...hMax], h2: [...h2], h2Max: [...h2Max] });
    
    // Explicit numerical substeps to maintain CFL stability and smoothness
    const substeps = 64; // more substeps for higher speed and perfect stability
    const dt = 0.03;      // smaller dt to keep dt * K * h < 0.5 under CFL
    const K = 0.5;       // Absolute stability limit guaranteed for explicit integration
    
    // Steady injection for the first 100 frames, then shut-in for post-injection migration
    const Q = frame <= 100 ? 0.65 : 0.0;
    
    for (let step = 0; step < substeps; step++) {
      const fluxes = new Array(N - 1).fill(0);
      for (let i = 0; i < N - 1; i++) {
        // Scale pixel depths to physical meters (divided by 15.0) to align with plume thickness h
        const ztL = capRockY(i * 10) / 15.0;
        const ztR = capRockY((i + 1) * 10) / 15.0;
        
        // Total fluid potential depth (deeper y is positive)
        const zL = ztL + h[i];
        const zR = ztR + h[i + 1];
        
        // Buoyancy gradient
        const grad = zR - zL;
        
        // Upwind mobility thickness
        const hFace = grad > 0 ? h[i + 1] : h[i];
        
        // VE flux: mobility * potential gradient
        fluxes[i] = -K * hFace * grad;
      }
      
      const nextH = [...h];
      for (let i = 0; i < N; i++) {
        const fL = i === 0 ? 0 : fluxes[i - 1];
        const fR = i === N - 1 ? 0 : fluxes[i];
        // Conservative mass transport
        nextH[i] = Math.max(0, h[i] + dt * (fL - fR));
      }
      
      // Edge Fault Leakages (x=100 and x=970) preventing unnatural boundary pooling
      const leakRate = 0.8;
      let leakLeft = 0;
      if (nextH[10] > 0) {
        leakLeft = Math.min(nextH[10], leakRate * dt);
        nextH[10] -= leakLeft;
      }
      let leakRight = 0;
      if (nextH[97] > 0) {
        leakRight = Math.min(nextH[97], leakRate * dt);
        nextH[97] -= leakRight;
      }
      
      // Inject at cell index 70 (right flank of primary anticlines) only if Q > 0
      if (Q > 0) {
        nextH[70] += Q * dt;
      }
      h = nextH;
      for (let i = 0; i < N; i++) {
        if (h[i] > hMax[i]) hMax[i] = h[i];
      }
      
      // --- SECONDARY RESERVOIR (h2) ---
      const fluxes2 = new Array(N - 1).fill(0);
      for (let i = 0; i < N - 1; i++) {
        // Shallower topography
        const ztL = (capRockY(i * 10) * 0.4) / 15.0;
        const ztR = (capRockY((i + 1) * 10) * 0.4) / 15.0;
        
        const zL = ztL + h2[i];
        const zR = ztR + h2[i + 1];
        
        const grad = zR - zL;
        const hFace = grad > 0 ? h2[i + 1] : h2[i];
        
        fluxes2[i] = -K * hFace * grad;
      }
      
      const nextH2 = [...h2];
      for (let i = 0; i < N; i++) {
        const fL = i === 0 ? 0 : fluxes2[i - 1];
        const fR = i === N - 1 ? 0 : fluxes2[i];
        nextH2[i] = Math.max(0, h2[i] + dt * (fL - fR));
      }
      
      // Inject leaked mass from primary into secondary fault locations
      nextH2[10] += leakLeft;
      nextH2[97] += leakRight;
      
      h2 = nextH2;
      for (let i = 0; i < N; i++) {
        if (h2[i] > h2Max[i]) h2Max[i] = h2[i];
      }
    }
  }
  return history;
};

// Dynamically traces the top cap rock and bottom gravity tongue to generate custom SVG paths
const getBandPath = (h, fraction, depthMultiplier = 1.0) => {
  const N = h.length;
  const scale = 20.0; // Scale factor to amplify solver units to SVG pixels
  
  // Find active boundaries where the band thickness is visible
  let firstActive = -1;
  let lastActive = -1;
  for (let i = 0; i < N; i++) {
    if (h[i] * scale * fraction > 0.8) {
      if (firstActive === -1) firstActive = i;
      lastActive = i;
    }
  }
  
  if (firstActive === -1) return "";
  
  // Trace cap rock underside from left to right
  let path = `M ${firstActive * 10} ${capRockY(firstActive * 10) * depthMultiplier}`;
  for (let i = firstActive + 1; i <= lastActive; i++) {
    path += ` L ${i * 10} ${capRockY(i * 10) * depthMultiplier}`;
  }
  
  // Trace plume bottom interface from right to left
  for (let i = lastActive; i >= firstActive; i--) {
    let yVal = capRockY(i * 10) * depthMultiplier + h[i] * scale * fraction;
    // Visually constrain the secondary reservoir from overlapping the layer below it
    if (depthMultiplier === 0.4) {
      yVal = Math.min(yVal, capRockY(i * 10) * 0.85);
    }
    path += ` L ${i * 10} ${yVal}`;
  }
  
  path += " Z";
  return path;
};

// Generates a clean meniscus path along the active cap-rock boundary
const getMeniscusPath = (h, depthMultiplier = 1.0) => {
  const N = h.length;
  const scale = 20.0;
  
  let firstActive = -1;
  let lastActive = -1;
  for (let i = 0; i < N; i++) {
    if (h[i] * scale > 0.8) {
      if (firstActive === -1) firstActive = i;
      lastActive = i;
    }
  }
  
  if (firstActive === -1) return "";
  
  let path = `M ${firstActive * 10} ${capRockY(firstActive * 10) * depthMultiplier}`;
  for (let i = firstActive + 1; i <= lastActive; i++) {
    path += ` L ${i * 10} ${capRockY(i * 10) * depthMultiplier}`;
  }
  return path;
};

// Generates the polygonal path of the residually trapped CO2 region (from current h down to hMax)
const getResidualPath = (h, hMax, depthMultiplier = 1.0) => {
  if (!h || !hMax) return "";
  const N = h.length;
  const scale = 20.0;
  
  let firstActive = -1;
  let lastActive = -1;
  for (let i = 0; i < N; i++) {
    if (hMax[i] * scale > 0.8 && hMax[i] - h[i] > 0.05) {
      if (firstActive === -1) firstActive = i;
      lastActive = i;
    }
  }
  
  if (firstActive === -1) return "";
  
  let path = `M ${firstActive * 10} ${capRockY(firstActive * 10) * depthMultiplier + h[firstActive] * scale}`;
  for (let i = firstActive + 1; i <= lastActive; i++) {
    let yVal = capRockY(i * 10) * depthMultiplier + h[i] * scale;
    if (depthMultiplier === 0.4) yVal = Math.min(yVal, capRockY(i * 10) * 0.85);
    path += ` L ${i * 10} ${yVal}`;
  }
  for (let i = lastActive; i >= firstActive; i--) {
    let yVal = capRockY(i * 10) * depthMultiplier + hMax[i] * scale;
    if (depthMultiplier === 0.4) yVal = Math.min(yVal, capRockY(i * 10) * 0.85);
    path += ` L ${i * 10} ${yVal}`;
  }
  path += " Z";
  return path;
};

// Traces the vertical flow column representing constant buoyant ascent in the wellbore
const getColumnPath = (b) => {
  const width = 8 + (5 - b) * 3; // narrower for high sat cores
  const xStart = 700 - width / 2;
  const xEnd = 700 + width / 2;
  const yStart = capRockY(700); // wellbore meets cap rock underside
  const yEnd = capRockY(700) + 160; // wellbore bottom perforations exactly within reservoir thickness
  return `M ${xStart} ${yStart} L ${xEnd} ${yStart} L ${xEnd} ${yEnd} L ${xStart} ${yEnd} Z`;
};

const SubsurfaceHero = () => {
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play on first load to wow visitors
  const [speed, setSpeed] = useState(1);

  // Precompute the entire physical simulation history (solved in <1ms!)
  const history = useMemo(() => precomputeSimulation(), []);
  const currentFrame = history[Math.round(time)] || history[0];
  const currentH = currentFrame.h;
  const currentHMax = currentFrame.hMax;
  const currentH2 = currentFrame.h2;
  const currentH2Max = currentFrame.h2Max;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTime((t) => {
        if (t >= 600) {
          return 0; // smooth loop back to Year 0
        }
        return Math.min(600, t + 1.25 * speed);
      });
    }, 30);
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  return (
    <section id="home" style={{
      position: 'relative',
      height: '100vh',
      minHeight: 720,
      overflow: 'hidden',
      color: '#fff',
      fontFamily: "'Montserrat', sans-serif",
      background: '#130d1c',
    }}>
      {/* Sky and subsurface as discrete background bands */}
      <Sky />
      <Subsurface h={currentH} />
      <Horizon />

      {/* Above-ground content */}
      <Identity />
      <Wellhead />
      <GasFeedAnimation isPlaying={isPlaying} />

      {/* Below-ground content */}
      <DepthAxis />
      <Well />
      <Plume h={currentH} hMax={currentHMax} h2={currentH2} h2Max={currentH2Max} time={time} isPlaying={isPlaying} />
      <Annotation />

      {/* Floating glassmorphism simulation dashboard */}
      <SimulationController 
        time={time} 
        setTime={setTime} 
        isPlaying={isPlaying} 
        setIsPlaying={setIsPlaying} 
        speed={speed} 
        setSpeed={setSpeed} 
      />

      <ScrollCue />
    </section>
  );
};

/* =====================================================
   Simulation Controller — floating dashboard
   ===================================================== */
const SimulationController = ({ time, setTime, isPlaying, setIsPlaying, speed, setSpeed }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        left: '6%',
        bottom: '80px',
        width: '320px',
        padding: '14px 18px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%)',
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        border: hovered ? '1px solid rgba(100,255,218,0.50)' : '1px solid rgba(100,255,218,0.30)',
        borderRadius: '16px',
        boxShadow: hovered 
          ? '0 12px 40px rgba(0,0,0,0.30), 0 0 25px rgba(100,255,218,0.22), inset 0 1px 0 rgba(255,255,255,0.30)' 
          : '0 8px 32px rgba(0,0,0,0.25), 0 0 15px rgba(100,255,218,0.12), inset 0 1px 0 rgba(255,255,255,0.25)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
        transform: hovered ? 'translateY(-4px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ 
            width: 6, 
            height: 6, 
            borderRadius: '50%', 
            background: isPlaying ? '#64ffda' : 'rgba(255,255,255,0.4)', 
            boxShadow: isPlaying ? '0 0 8px #64ffda' : 'none',
            animation: isPlaying ? 'twinkle 1.5s ease-in-out infinite' : 'none'
          }}/>
          <span style={{ fontSize: 9.5, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.70)', fontWeight: 600 }}>Simulation Status</span>
        </div>
        <span style={{ fontSize: 10.5, fontFamily: 'ui-monospace, monospace', color: '#64ffda', fontWeight: 600 }}>
          Year {Math.round(time)} / 600
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Play/Pause Button */}
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: isPlaying ? 'rgba(100,255,218,0.18)' : 'rgba(255,255,255,0.12)',
            border: `1px solid ${isPlaying ? '#64ffda' : 'rgba(255,255,255,0.25)'}`,
            color: isPlaying ? '#64ffda' : '#fff',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            outline: 'none',
          }}
          title={isPlaying ? "Pause" : "Play Simulation"}
        >
          <i className={isPlaying ? "fas fa-pause" : "fas fa-play"} style={{ fontSize: 12, marginLeft: isPlaying ? 0 : 2 }}/>
        </button>
 
        {/* Timeline Slider */}
        <input 
          type="range" 
          min="0" 
          max="600" 
          step="1"
          value={time} 
          onChange={(e) => {
            setTime(parseFloat(e.target.value));
            setIsPlaying(false); // Pause on scrub
          }}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.20)',
            outline: 'none',
            cursor: 'pointer',
            accentColor: '#64ffda',
          }}
        />

        {/* Reset Button */}
        <button 
          onClick={() => { setTime(0); setIsPlaying(false); }}
          style={{
            width: 30, height: 30, borderRadius: '50%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.20)',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            outline: 'none',
          }}
          title="Reset Simulation"
        >
          <i className="fas fa-redo" style={{ fontSize: 10 }}/>
        </button>

        {/* Speed Toggle */}
        <button 
          onClick={() => setSpeed(s => s === 1 ? 2 : s === 2 ? 4 : 1)}
          style={{
            fontSize: 9.5,
            fontWeight: 600,
            padding: '3px 7px',
            borderRadius: 5,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.20)',
            color: '#64ffda',
            cursor: 'pointer',
            minWidth: 30,
            textAlign: 'center',
            outline: 'none',
          }}
          title="Toggle Simulation Speed"
        >
          {speed}x
        </button>
      </div>
    </div>
  );
};

/* =====================================================
   Sky — top 42vh: warm-violet gradient + a sprinkling of stars
   ===================================================== */
const Sky = () => {
  const stars = useMemo(() => Array.from({ length: 36 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 38,
    s: 0.5 + Math.random() * 1.4,
    o: 0.25 + Math.random() * 0.55,
    d: Math.random() * 6,
  })), []);

  const co2Dots = useMemo(() => Array.from({ length: 14 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 38,
    s: 1.0 + Math.random() * 1.6,
    o: 0.35 + Math.random() * 0.50,
    d: Math.random() * 6,
  })), []);

  return (
    <>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: '42vh',
        background: 'linear-gradient(180deg, #16101f 0%, #1e1936 50%, #211d34 100%)',
      }}/>
      {/* Soft violet & rose blobs */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: '42vh',
        background:
          'radial-gradient(circle at 22% 28%, rgba(120,119,198,0.20) 0%, transparent 45%), ' +
          'radial-gradient(circle at 84% 14%, rgba(255,119,178,0.13) 0%, transparent 38%)',
        pointerEvents: 'none',
      }}/>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '42vh', pointerEvents: 'none' }} aria-hidden="true">
        {/* White stars */}
        {stars.map((s, i) => (
          <circle key={`s-${i}`} cx={`${s.x}%`} cy={`${s.y}%`} r={s.s} fill="#cdeaf0"
                  style={{ opacity: s.o, animation: `twinkle 4.2s ease-in-out ${s.d}s infinite` }}/>
        ))}
        {/* Glowing green CO2 particles */}
        {co2Dots.map((g, i) => (
          <circle key={`g-${i}`} cx={`${g.x}%`} cy={`${g.y}%`} r={g.s} fill="#0dfca2"
                  style={{ 
                    opacity: g.o, 
                    animation: `twinkle 3.2s ease-in-out ${g.d}s infinite`,
                    filter: 'drop-shadow(0 0 2px rgba(13,252,162,0.65))'
                  }}/>
        ))}
      </svg>
    </>
  );
};

/* =====================================================
   Horizon — dashed mint line at 42vh
   ===================================================== */
const Horizon = () => (
  <div style={{
    position: 'absolute', left: 0, right: 0, top: '42vh', height: 0,
    borderTop: '1px dashed rgba(100,255,218,0.55)',
    boxShadow: '0 0 8px rgba(100,255,218,0.30)',
    zIndex: 4, pointerEvents: 'none',
  }}>
    <span style={{
      position: 'absolute', right: 28, top: -22,
      fontSize: 10, letterSpacing: '0.20em', textTransform: 'uppercase',
      color: 'rgba(100,255,218,0.85)', fontWeight: 600,
      fontFamily: 'ui-monospace, Menlo, monospace',
    }}>Surface · 0&nbsp;m</span>
  </div>
);

/* =====================================================
   Subsurface — SVG cross-section with anticline cap rock,
   reservoir and aquifer. 42vh → 100vh.
   ===================================================== */
const getCapRockPath = () => {
  let path = `M 0 ${capRockY(0)}`;
  for (let x = 10; x <= 1000; x += 10) {
    path += ` L ${x} ${capRockY(x)}`;
  }
  return path;
};

const getCapRockFillPath = () => {
  let path = `M 0 0 L 1000 0 L 1000 ${capRockY(1000)}`;
  for (let x = 1000; x >= 0; x -= 10) {
    path += ` L ${x} ${capRockY(x)}`;
  }
  path += " Z";
  return path;
};

const CAP_ROCK_UNDERSIDE = getCapRockPath();
const CAP_ROCK_FILL = getCapRockFillPath();

const getAquiferPath = () => {
  let path = `M 0 580 L 1000 580 L 1000 ${capRockY(1000) + 190}`;
  for (let x = 1000; x >= 0; x -= 10) {
    path += ` L ${x} ${capRockY(x) + 190}`;
  }
  path += " Z";
  return path;
};

// Conforming finite volume columns for the reservoir grid block visualization (VE model grid blocks)
// Dynamically fills the lower portion of each cell with solid brine under the CO2 plume interface
const ReservoirGrid = ({ h }) => {
  const cols = [];
  const scale = 16.0; // matching scale factor of the plume
  
  for (let i = 0; i < 100; i++) {
    const x1 = i * 10;
    const x2 = (i + 1) * 10;
    const yt1 = capRockY(x1);
    const yt2 = capRockY(x2);
    const yb1 = yt1 + 190;
    const yb2 = yt2 + 190;
    
    // Deterministic permeability variation for visual sandstone heterogeneity
    const permHash = 0.55 + 0.45 * Math.sin(i * 14.3 + 2.1); 
    const r = Math.floor(33 + permHash * 16);
    const g = Math.floor(24 + permHash * 10);
    const b = Math.floor(18 + permHash * 8);
    const blockFill = `rgb(${r}, ${g}, ${b})`;
    
    // Plume thickness at cell left and right boundaries
    const h1 = h ? (h[i] || 0) * scale : 0;
    const h2 = h ? (h[i + 1] || 0) * scale : 0;
    
    // Conforming solid Brine layer: starts from bottom of CO2 plume down to reservoir bottom
    const yBrineTop1 = yt1 + h1;
    const yBrineTop2 = yt2 + h2;
    
    cols.push(
      <g key={i}>
        {/* Base Sandstone Gridblock */}
        <polygon 
          points={`${x1},${yt1} ${x2},${yt2} ${x2},${yb2} ${x1},${yb1}`}
          fill={blockFill}
          stroke="rgba(0,0,0,0.18)"
          strokeWidth="0.5"
        />
        
        {/* Solid electric-blue Brine fluid layer inside this cell block (sw=1) */}
        {yBrineTop1 < yb1 && (
          <polygon 
            points={`${x1},${yBrineTop1} ${x2},${yBrineTop2} ${x2},${yb2} ${x1},${yb1}`}
            fill="url(#grad-aquifer-v2)"
            opacity="0.88"
          />
        )}
        
        {/* Fine-scale vertical grid layers representing height2finescale reconstruction */}
        {Array.from({ length: 6 }).map((_, j) => {
          const t = (j + 1) / 7;
          const yl1 = yt1 + 190 * t;
          const yl2 = yt2 + 190 * t;
          return (
            <line 
              key={j}
              x1={x1} y1={yl1} x2={x2} y2={yl2}
              stroke="rgba(255,255,255,0.015)"
              strokeWidth="0.4"
            />
          );
        })}
      </g>
    );
  }
  return <g>{cols}</g>;
};

// Conforming vertical grid lines for the cap rock stratum
const CapRockGrid = () => {
  const lines = [];
  for (let i = 1; i < 100; i++) {
    const x = i * 10;
    const yTop = 0;
    const yBot = capRockY(x);
    lines.push(
      <line 
        key={i} 
        x1={x} y1={yTop} x2={x} y2={yBot} 
        stroke="rgba(255,255,255,0.015)" 
        strokeWidth="0.5"
      />
    );
  }
  return <g>{lines}</g>;
};

// Depth axis — clean ticks on the left margin
const DepthAxis = () => {
  const ticks = [
    { top: '42vh',   label: '0 m' },
    { top: '54vh',   label: '–1200 m' },
    { top: '70vh',   label: '–1800 m' },
    { top: '88vh',   label: '–2400 m' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 16, top: 0, bottom: 0, width: 90,
      zIndex: 4, pointerEvents: 'none',
      fontFamily: 'ui-monospace, Menlo, monospace',
    }}>
      {ticks.map((t, i) => (
        <div key={i} style={{ position: 'absolute', top: t.top, left: 0, transform: 'translateY(-50%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 1.5, background: 'rgba(100,255,218,0.75)', boxShadow: '0 0 4px rgba(100,255,218,0.4)' }}/>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 500, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{t.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Captured CO2 gas feed animation above the wellhead
const GasFeedAnimation = ({ isPlaying }) => {
  const bubbles = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${70 + (Math.random() - 0.5) * 1.2}%`,
    delay: i * 0.45,
    size: 2 + Math.random() * 3.5,
    duration: 2.2 + Math.random() * 1.2,
  })), []);
  
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '42vh', pointerEvents: 'none', zIndex: 6 }}>
      {bubbles.map(b => (
        <div 
          key={b.id}
          style={{
            position: 'absolute',
            left: b.left,
            top: 0,
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: '#0dfca2',
            boxShadow: '0 0 6px #0dfca2',
            opacity: 0,
            animation: `feedBubble ${b.duration}s linear ${b.delay}s infinite`,
            animationPlayState: isPlaying ? 'running' : 'paused',
          }}
        />
      ))}
    </div>
  );
};

const Subsurface = ({ h }) => {
  const AQUIFER_PATH = getAquiferPath();
  return (
    <>
      <svg
        style={{
          position: 'absolute', left: 0, right: 0, top: '42vh',
          width: '100%', height: '58vh',
          pointerEvents: 'none',
        }}
        viewBox="0 0 1000 580"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="grad-cap-v2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2b2336"/>
            <stop offset="100%" stopColor="#1c1623"/>
          </linearGradient>
          <linearGradient id="grad-aquifer-v2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0f3460" stopOpacity="0.80"/>
            <stop offset="100%" stopColor="#0a1931" stopOpacity="0.95"/>
          </linearGradient>
        </defs>

        {/* Conforming Cap rock */}
        <path d={CAP_ROCK_FILL} fill="url(#grad-cap-v2)"/>
        
        {/* Realistic Cap rock strata layers */}
        <path 
          d={`M 0 0 L 1000 0 L 1000 ${capRockY(1000)*0.85} ` + Array.from({ length: 100 }, (_, i) => `L ${(99-i)*10} ${capRockY((99-i)*10)*0.85}`).join(" ") + ` Z`} 
          fill="rgba(0,0,0,0.15)"
        />
        <path 
          d={`M 0 0 L 1000 0 L 1000 ${capRockY(1000)*0.4} ` + Array.from({ length: 100 }, (_, i) => `L ${(99-i)*10} ${capRockY((99-i)*10)*0.4}`).join(" ") + ` Z`} 
          fill="rgba(0,0,0,0.25)"
        />
        <path 
          d={`M 0 0 L 1000 0 L 1000 ${capRockY(1000)*0.15} ` + Array.from({ length: 100 }, (_, i) => `L ${(99-i)*10} ${capRockY((99-i)*10)*0.15}`).join(" ") + ` Z`} 
          fill="rgba(0,0,0,0.35)"
        />
        <CapRockGrid />

        {/* Sync Background Reservoir: Conforming FVM Grid blocks */}
        <ReservoirGrid h={h} />

        {/* Synced Aquifer conforming layer */}
        <path d={AQUIFER_PATH} fill="url(#grad-aquifer-v2)"/>
        
        {/* Realistic Aquifer strata layers */}
        <path 
          d={`M 0 580 L 1000 580 L 1000 ${capRockY(1000) + 190 + 80} ` + Array.from({ length: 100 }, (_, i) => `L ${(99-i)*10} ${capRockY((99-i)*10) + 190 + 80}`).join(" ") + ` Z`} 
          fill="rgba(0,0,0,0.2)"
        />
        <path 
          d={`M 0 580 L 1000 580 L 1000 ${capRockY(1000) + 190 + 170} ` + Array.from({ length: 100 }, (_, i) => `L ${(99-i)*10} ${capRockY((99-i)*10) + 190 + 170}`).join(" ") + ` Z`} 
          fill="rgba(0,0,0,0.35)"
        />
        <path 
          d={`M 0 580 L 1000 580 L 1000 ${capRockY(1000) + 190 + 260} ` + Array.from({ length: 100 }, (_, i) => `L ${(99-i)*10} ${capRockY((99-i)*10) + 190 + 260}`).join(" ") + ` Z`} 
          fill="rgba(0,0,0,0.5)"
        />

        {/* Aquifer boundary stroke */}
        <path 
          d={`M 0 ${capRockY(0) + 190} ` + Array.from({ length: 100 }, (_, i) => `L ${(i+1)*10} ${capRockY((i+1)*10) + 190}`).join(" ")} 
          stroke="rgba(0,0,0,0.35)" 
          strokeWidth="1.2" 
          fill="none"
        />

        {/* Mint glow along reservoir/cap-rock interface (anticline emphasis) */}
        <path d={CAP_ROCK_UNDERSIDE}
              stroke="rgba(168,237,234,0.22)" strokeWidth="0.8" fill="none"/>
        <path d={CAP_ROCK_UNDERSIDE}
              stroke="rgba(168,237,234,0.10)" strokeWidth="2" fill="none"
              style={{ filter: 'blur(1.2px)' }}/>

        {/* Top edge highlight */}
        <line x1="0" y1="0" x2="1000" y2="0" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6"/>
      </svg>

      {/* Stratum labels */}
      {[
        { top: 'calc(42vh + 8px)', label: 'Cap rock' },
        { top: 'calc(58vh + 8px)', label: 'Reservoir' },
        { top: 'calc(88vh + 8px)', label: 'Aquifer' },
      ].map((s, i) => (
        <span key={i} style={{
          position: 'absolute', right: 18, top: s.top,
          fontSize: 9.5, letterSpacing: '0.20em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.88)', fontWeight: 600,
          fontFamily: 'ui-monospace, Menlo, monospace',
          pointerEvents: 'none', zIndex: 5,
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
        }}>{s.label}</span>
      ))}
    </>
  );
};

// Wellhead — small structure above the horizon
const Wellhead = () => (
  <div style={{
    position: 'absolute', left: '70%', top: 'calc(42vh - 36px)',
    width: 50, height: 36, transform: 'translateX(-50%)',
    zIndex: 5,
  }}>
    {/* Xmas Tree Wellhead */}
    <div style={{
      width: '100%', height: '100%',
      position: 'relative',
    }}>
      {/* Master flange base */}
      <div style={{ position: 'absolute', bottom: 0, left: 15, width: 20, height: 6, background: '#444', borderRadius: 1, border: '1px solid #666' }}/>
      {/* Vertical riser */}
      <div style={{ position: 'absolute', bottom: 6, left: 22, width: 6, height: 22, background: 'linear-gradient(90deg, #333, #aaa, #333)', borderLeft: '1px solid #555' }}/>
      {/* Flow cross valve block */}
      <div style={{ position: 'absolute', bottom: 16, left: 16, width: 18, height: 8, background: '#222', borderRadius: 2, border: '1px solid #0dfca2' }}/>
      {/* Left pressure gauge */}
      <div style={{ position: 'absolute', bottom: 18, left: 8, width: 8, height: 4, background: '#aaa', borderRadius: 1 }}/>
      {/* Top gauge/cap */}
      <div style={{ position: 'absolute', bottom: 28, left: 20, width: 10, height: 5, background: 'radial-gradient(circle, #fff, #555)', borderRadius: '50%', border: '1px solid #888' }}/>
      {/* Glowing pressure gauge indicator light */}
      <div style={{
        position: 'absolute', left: 23, top: 12, width: 4, height: 4, borderRadius: '50%',
        background: '#0dfca2', boxShadow: '0 0 6px #0dfca2',
        animation: 'twinkle 1s ease-in-out infinite',
      }}/>
    </div>
  </div>
);

// Well — vertical tubing from horizon down through reservoir
// Dynamic height constraints ensure it never extends below the reservoir bottom perforations
const Well = () => {
  const yBotVal = capRockY(700) + 160; 
  const heightVh = `${yBotVal * 0.1}vh`;
  return (
    <div style={{
      position: 'absolute',
      left: '70%', top: '42vh',
      width: 10, height: heightVh,
      transform: 'translateX(-50%)',
      zIndex: 3, pointerEvents: 'none',
    }}>
      {/* Outer steel casing with bright specular highlights */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, #111 0%, #aaa 25%, #fff 50%, #444 75%, #111 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.2)',
        borderRight: '1px solid rgba(255,255,255,0.2)',
        opacity: 0.85,
      }}/>
      {/* Inner flow tube with bright neon green glow */}
      <div style={{
        position: 'absolute', left: 3, right: 3, top: 0, bottom: 0,
        background: 'linear-gradient(90deg, rgba(13,252,162,0.1) 0%, rgba(13,252,162,0.6) 50%, rgba(13,252,162,0.1) 100%)',
        boxShadow: '0 0 10px rgba(13,252,162,0.4)',
      }}/>
      {/* Perforated intervals (horizontal flow slots) inside the reservoir sandstone */}
      <div style={{
        position: 'absolute', left: -3, right: -3, bottom: 10, height: 18,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            height: 2, background: '#0dfca2',
            boxShadow: '0 0 6px #0dfca2',
          }}/>
        ))}
      </div>
      {/* injection point flare at bottom */}
      <div style={{
        position: 'absolute', left: '50%', bottom: -4, transform: 'translateX(-50%)',
        width: 26, height: 26, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,237,234,0.85) 0%, rgba(100,255,218,0.30) 45%, transparent 75%)',
        filter: 'blur(2px)',
        animation: 'pulseFlare 2.6s ease-in-out infinite',
      }}/>
    </div>
  );
};

// Streamlines — gentle curves flowing through the reservoir
// Refactored to dynamically trace caprock-parallel contours
const Streamlines = ({ isPlaying }) => {
  // 3 left-migrating streamlines
  const leftPaths = [35, 75, 115].map(d => {
    let path = `M 700 ${capRockY(700) + d}`;
    for (let x = 690; x >= 0; x -= 10) {
      path += ` L ${x} ${capRockY(x) + d}`;
    }
    return path;
  });
  
  // 3 right-migrating streamlines
  const rightPaths = [35, 75, 115].map(d => {
    let path = `M 700 ${capRockY(700) + d}`;
    for (let x = 710; x <= 1000; x += 10) {
      path += ` L ${x} ${capRockY(x) + d}`;
    }
    return path;
  });

  return (
    <svg
      style={{
        position: 'absolute', left: 0, top: '42vh', width: '100%', height: '58vh',
        zIndex: 2, pointerEvents: 'none',
      }}
      viewBox="0 0 1000 580" preserveAspectRatio="none" aria-hidden="true">
      {/* Left-flowing streamlines (outward, right-to-left) */}
      {leftPaths.map((d, i) => (
        <path key={`l-${i}`}
              d={d}
              stroke="rgba(100,255,218,0.18)"
              strokeWidth="0.8"
              strokeDasharray="2 12"
              fill="none"
              style={{ 
                animation: `flow-reverse ${8 + i * 1.2}s linear infinite`,
                animationPlayState: isPlaying ? 'running' : 'paused'
              }}/>
      ))}
      {/* Right-flowing streamlines (outward, left-to-right) */}
      {rightPaths.map((d, i) => (
        <path key={`r-${i}`}
              d={d}
              stroke="rgba(100,255,218,0.18)"
              strokeWidth="0.8"
              strokeDasharray="2 12"
              fill="none"
              style={{ 
                animation: `flow ${8 + i * 1.2}s linear infinite`,
                animationPlayState: isPlaying ? 'running' : 'paused'
              }}/>
      ))}
    </svg>
  );
};

/* =====================================================
   Simulation cells — sparse pulsing grid, only in reservoir
   ===================================================== */
const SimCells = ({ isPlaying }) => {
  const cells = useMemo(() => {
    const arr = [];
    const rows = 4, cols = 18;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 6 + c * 5.2;        // % across viewport
        // Carve a wide gap around the well at 70% so the plume reads cleanly
        if (x > 46 && x < 96) continue;
        // Carve out the left depth-axis area
        if (x < 12) continue;
        // Carve the small left anticline area too
        if (x > 14 && x < 26) continue;
        arr.push({
          left: `${x}%`,
          top: `${62 + r * 6.5}vh`,
          delay: Math.random() * 4,
          duration: 2.4 + Math.random() * 2,
        });
      }
    }
    return arr;
  }, []);
  return (
    <>
      {cells.map((c, i) => (
        <span key={i} style={{
          position: 'absolute', left: c.left, top: c.top,
          width: 6, height: 6, borderRadius: '50%',
          background: '#64ffda',
          opacity: 0.18,
          boxShadow: '0 0 6px rgba(100,255,218,0.45)',
          animation: `cellPulse ${c.duration}s ease-in-out ${c.delay}s infinite`,
          animationPlayState: isPlaying ? 'running' : 'paused',
          zIndex: 2, pointerEvents: 'none',
        }}/>
      ))}
    </>
  );
};

/* =====================================================
   CO2 plume — saturation contour map. Banded colors run
   from a yellow high-saturation core out through green to
   a faint mint outer halo (low saturation / dissolved CO2).
   Gravity-tongue shape: wide thin lens under the anticline
   crest, narrowing into a column down to the well at
   (x=700, y=400).
   ===================================================== */

const CAP_ROCK_PATH = CAP_ROCK_UNDERSIDE;

// Band 1: outermost (sw ≈ 0.1, mostly dissolved/dilute CO2)
// Naturally tapered gravity-tongue path that slopes down to zero thickness at outer tips (380 & 960)
const PLUME_B1 =
  "M 380 156 " +
  "C 420 168, 460 170, 510 172 " +
  "C 550 168, 585 156, 615 140 " +
  "C 640 112, 660 80, 680 52 " +
  "C 695 38, 710 36, 728 38 " +
  "C 745 58, 765 90, 785 122 " +
  "C 810 140, 840 152, 880 162 " +
  "C 920 156, 960 148, 960 152 " +
  "C 900 180, 800 190, 722 190 " +
  "C 720 252, 714 342, 708 410 L 692 410 " +
  "C 686 342, 680 252, 678 190 " +
  "C 600 190, 480 180, 380 156 Z";

// Band 2: mid saturation (sw ≈ 0.3)
const PLUME_B2 =
  "M 470 168 " +
  "C 500 168, 530 160, 555 148 " +
  "C 590 124, 625 92, 660 64 " +
  "C 678 48, 694 42, 710 40 " +
  "C 728 44, 745 64, 760 88 " +
  "C 778 115, 800 138, 825 152 " +
  "C 855 165, 890 172, 920 175 " +
  "C 860 182, 800 186, 718 186 " +
  "C 716 248, 710 338, 706 405 L 694 405 " +
  "C 690 338, 684 248, 682 186 " +
  "C 620 186, 540 182, 470 168 Z";

// Band 3: high saturation (sw ≈ 0.5)
const PLUME_B3 =
  "M 555 166 " +
  "C 580 158, 605 145, 625 125 " +
  "C 650 95, 675 65, 695 50 " +
  "C 712 46, 725 50, 738 64 " +
  "C 755 86, 775 115, 800 138 " +
  "C 825 155, 855 168, 885 175 " +
  "C 820 180, 770 182, 716 182 " +
  "C 714 244, 710 330, 705 400 L 695 400 " +
  "C 690 330, 686 244, 684 182 " +
  "C 640 182, 600 180, 555 166 Z";

// Band 4: very high saturation (sw ≈ 0.7)
const PLUME_B4 =
  "M 630 166 " +
  "C 650 154, 670 132, 685 105 " +
  "C 698 74, 708 52, 712 46 " +
  "C 725 50, 740 72, 758 98 " +
  "C 778 123, 800 146, 830 160 " +
  "C 850 170, 870 174, 885 176 " +
  "C 830 178, 780 178, 714 178 " +
  "C 712 238, 708 320, 704 395 L 696 395 " +
  "C 692 320, 688 238, 686 178 " +
  "C 660 178, 645 174, 630 166 Z";

// Band 5: peak core (sw ≈ 0.85+, near-saturated CO2)
const PLUME_B5 = "M 695 38 C 705 38, 716 46, 718 56 C 720 96, 716 200, 710 393 L 690 393 C 684 200, 680 96, 682 56 C 684 46, 690 38, 695 38 Z";

const Plume = ({ h, hMax, h2, h2Max, time, isPlaying }) => {
  return (
    <>
      <svg
        style={{
          position: 'absolute', left: 0, right: 0, top: '42vh',
          width: '100%', height: '58vh',
          zIndex: 4, pointerEvents: 'none',
          overflow: 'visible',
        }}
        viewBox="0 0 1000 580"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="below-caprock">
            <path d={`${CAP_ROCK_PATH} L 1000 580 L 0 580 Z`}/>
          </clipPath>
          <clipPath id="below-shallow-caprock">
            <path d={`M 0 ${capRockY(0) * 0.4} ${Array.from({length: 100}, (_, i) => `L ${(i+1)*10} ${capRockY((i+1)*10) * 0.4}`).join(' ')} L 1000 580 L 0 580 Z`}/>
          </clipPath>
          <filter id="band-soften" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="0.7"/>
          </filter>
          <filter id="plume-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6"/>
          </filter>
          <linearGradient id="co2-core-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0dfca2" stopOpacity="0.90" />
            <stop offset="30%" stopColor="#05e67c" stopOpacity="0.80" />
            <stop offset="100%" stopColor="#02aa56" stopOpacity="0.70" />
          </linearGradient>
          <linearGradient id="co2-glow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0dfca2" stopOpacity="0.60" />
            <stop offset="100%" stopColor="#00b05b" stopOpacity="0.10" />
          </linearGradient>
        </defs>

        <g clipPath="url(#below-caprock)">
          {/* 1. Pulsing Outer Neon Glow Aura */}
          {getBandPath(h, 1.0) && (
            <path 
              d={getBandPath(h, 1.0)} 
              fill="url(#co2-glow-grad)" 
              filter="url(#plume-glow)"
              style={{
                animation: 'plumePulse 4s ease-in-out infinite',
                animationPlayState: isPlaying ? 'running' : 'paused',
                transformOrigin: '50% 30%',
              }}
            />
          )}

          {/* 2. Softened Secondary Aura */}
          {getBandPath(h, 1.0) && (
            <path 
              d={getBandPath(h, 1.0)} 
              fill="url(#co2-core-grad)" 
              opacity="0.30"
              filter="url(#band-soften)"
            />
          )}

          {/* 3. Solid High-Definition Core Plume */}
          {getBandPath(h, 1.0) && (
            <path 
              d={getBandPath(h, 1.0)} 
              fill="url(#co2-core-grad)" 
              stroke="#0dfca2"
              strokeWidth="0.8"
              opacity="0.90"
            />
          )}

          {/* 4. Residual Trapped CO2 Area */}
          {getResidualPath(h, hMax) && (
            <path 
              d={getResidualPath(h, hMax)} 
              fill="#0dfca2" 
              opacity="0.18"
            />
          )}
          {getResidualPath(h, hMax) && (
            <path 
              d={getResidualPath(h, hMax)} 
              fill="none" 
              stroke="rgba(13,252,162,0.4)"
              strokeWidth="0.8"
              strokeDasharray="3 6"
            />
          )}

          {/* Bright meniscus along the CO2/cap-rock contact (dynamic trace of active caprock boundary) */}
          {getMeniscusPath(h) && (
            <path
              d={getMeniscusPath(h)}
              stroke="rgba(255,255,255,0.45)" strokeWidth="0.6" fill="none"
            />
          )}

        </g>

        {/* ================= SECONDARY RESERVOIR RENDERING ================= */}
        <g clipPath="url(#below-shallow-caprock)">
          {/* Secondary Reservoir Pulsing Outer Neon Glow Aura */}
          {h2 && getBandPath(h2, 1.0, 0.4) && (
            <path 
              d={getBandPath(h2, 1.0, 0.4)} 
              fill="url(#co2-glow-grad)" 
              filter="url(#plume-glow)"
              style={{
                animation: 'plumePulse 4s ease-in-out infinite',
                animationPlayState: isPlaying ? 'running' : 'paused',
                transformOrigin: '50% 30%',
              }}
            />
          )}

          {/* Secondary Reservoir Softened Secondary Aura */}
          {h2 && getBandPath(h2, 1.0, 0.4) && (
            <path 
              d={getBandPath(h2, 1.0, 0.4)} 
              fill="url(#co2-core-grad)" 
              opacity="0.30"
              filter="url(#band-soften)"
            />
          )}

          {/* Secondary Reservoir Solid High-Definition Core Plume */}
          {h2 && getBandPath(h2, 1.0, 0.4) && (
            <path 
              d={getBandPath(h2, 1.0, 0.4)} 
              fill="url(#co2-core-grad)" 
              stroke="#0dfca2"
              strokeWidth="0.8"
              opacity="0.90"
            />
          )}

          {/* Secondary Reservoir Residual Trapped CO2 Area */}
          {h2Max && getResidualPath(h2, h2Max, 0.4) && (
            <path 
              d={getResidualPath(h2, h2Max, 0.4)} 
              fill="#0dfca2" 
              opacity="0.18"
            />
          )}
          {h2Max && getResidualPath(h2, h2Max, 0.4) && (
            <path 
              d={getResidualPath(h2, h2Max, 0.4)} 
              fill="none" 
              stroke="rgba(13,252,162,0.4)"
              strokeWidth="0.8"
              strokeDasharray="3 6"
            />
          )}

          {/* Secondary Reservoir meniscus */}
          {h2 && getMeniscusPath(h2, 0.4) && (
            <path
              d={getMeniscusPath(h2, 0.4)}
              stroke="rgba(255,255,255,0.45)" strokeWidth="0.6" fill="none"
            />
          )}
        </g>
        {/* ================================================================ */}
        
        <g clipPath="url(#below-caprock)">
          {/* Dissolution fingers falling off the pool - pauseable CSS fingerDrip coupled to local plume arrival */}
          {[
            { x: 500, delay: 0.0, activeTime: 40 },
            { x: 560, delay: 1.2, activeTime: 25 },
            { x: 620, delay: 0.4, activeTime: 12 },
            { x: 790, delay: 0.8, activeTime: 15 },
            { x: 850, delay: 1.6, activeTime: 32 },
            { x: 920, delay: 0.2, activeTime: 55 },
          ].map((d, i) => {
            if (time < d.activeTime) return null;
            return (
              <circle 
                key={`d${i}`} 
                cx={d.x} 
                cy="200" 
                r="1.2" 
                fill="#0dfca2" 
                style={{
                  opacity: 0,
                  animation: `fingerDrip 6s linear ${d.delay}s infinite`,
                  animationPlayState: isPlaying ? 'running' : 'paused',
                }}
              />
            );
          })}
        </g>
        
        {/* Fault Lines (Left: x=100, Right: x=970) */}
        <path d={`M 100 ${capRockY(100)} L 98 ${capRockY(100)*0.85} L 102 ${capRockY(100)*0.7} L 99 ${capRockY(100)*0.55} L 100 ${capRockY(100)*0.4}`} 
              stroke="rgba(100,255,218,0.25)" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
        <path d={`M 970 ${capRockY(970)} L 972 ${capRockY(970)*0.85} L 968 ${capRockY(970)*0.7} L 971 ${capRockY(970)*0.55} L 970 ${capRockY(970)*0.4}`} 
              stroke="rgba(100,255,218,0.25)" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />

        {/* Fault Leakage Bubbles (Active when CO2 reaches the fault) */}
        {h && h[10] > 0.05 && [0, 0.6, 1.2, 1.8, 2.4].map((delay, i) => (
          <circle key={`fl${i}`} cx={100 + (i%2)*3 - 1.5} cy={capRockY(100)} r="2" fill="#0dfca2" style={{
            opacity: 0,
            '--travel': `-${capRockY(100) * 0.6}px`,
            animation: `faultRise 3s linear ${delay}s infinite`,
            animationPlayState: isPlaying ? 'running' : 'paused',
          }}/>
        ))}
        {h && h[97] > 0.05 && [0, 0.6, 1.2, 1.8, 2.4].map((delay, i) => (
          <circle key={`fr${i}`} cx={970 + (i%2)*3 - 1.5} cy={capRockY(970)} r="2" fill="#0dfca2" style={{
            opacity: 0,
            '--travel': `-${capRockY(970) * 0.6}px`,
            animation: `faultRise 3s linear ${delay}s infinite`,
            animationPlayState: isPlaying ? 'running' : 'paused',
          }}/>
        ))}
      </svg>



      {/* Brine label far from the plume (left side) — context label with improved high contrast */}
      <div style={{
        position: 'absolute',
        left: '22%', top: 'calc(42vh + 22vh)',
        transform: 'translate(-50%, -50%)',
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 600,
        fontSize: 16,
        color: 'rgba(255,255,255,0.60)',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        zIndex: 5,
        pointerEvents: 'none',
        textShadow: '0 1px 4px rgba(0,0,0,0.8)',
      }}>
        Brine
      </div>
    </>
  );
};

/* =====================================================
   One clean annotation pointing at the reservoir's VE concept
   ===================================================== */
const Annotation = () => (
  <div style={{
    position: 'absolute', left: '6%', bottom: '195px',
    width: '320px', padding: '14px 18px',
    boxSizing: 'border-box',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%)',
    backdropFilter: 'blur(16px) saturate(160%)',
    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    border: '1px solid rgba(100,255,218,0.35)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 0 15px rgba(100,255,218,0.12), inset 0 1px 0 rgba(255,255,255,0.25)',
    zIndex: 10,
    transition: 'all 0.4s ease',
  }}>
    <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.92)', lineHeight: 1.5, fontFamily: "'Montserrat', sans-serif" }}>
      Vertical Equilibrium model of CO<sub>2</sub> injection — <strong style={{ color: '#64ffda', textShadow: '0 0 8px rgba(100,255,218,0.3)' }}>orders of magnitude</strong> faster than full 3D.
    </div>
  </div>
);

/* =====================================================
   IDENTITY — sits firmly inside the sky region
   ===================================================== */
const Identity = () => (
  <div style={{
    position: 'absolute',
    left: '6%', top: 110,
    maxWidth: 620,
    zIndex: 7,
  }}>
    <div style={{
      fontSize: 11.5, letterSpacing: '0.20em', textTransform: 'uppercase',
      color: '#64ffda', fontWeight: 600, marginBottom: 14,
      display: 'inline-flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#64ffda', boxShadow: '0 0 10px rgba(100,255,218,0.8)' }}/>
      Ph.D. Candidate · Heriot-Watt University
    </div>

    <h1 style={{
      margin: 0,
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 700,
      fontSize: 'clamp(40px, 6vw, 64px)',
      lineHeight: 1.02,
      letterSpacing: '-0.02em',
      background: 'linear-gradient(135deg, #ffffff 0%, #d6f8f3 50%, #7ee8e2 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}>Sa&rsquo;eed Telvari</h1>

    <p style={{
      margin: '18px 0 0',
      maxWidth: 540,
      fontSize: 16,
      lineHeight: 1.6,
      color: 'rgba(255,255,255,0.82)',
    }}>
      Building <strong style={{ color: '#64ffda', fontWeight: 600 }}>Vertical Equilibrium models</strong> for simulating <strong style={{ color: '#64ffda', fontWeight: 600 }}>CO<sub>2</sub> storage</strong> in depleted gas reservoirs — the cross-section below is essentially the thing I simulate.
    </p>

    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <BrandSocial icon="fa-brands fa-linkedin-in" tint="#0a66c2" />
        <BrandSocial icon="fa-brands fa-github"      tint="#22272e" />
        <BrandSocial icon="fa-solid fa-graduation-cap" tint="#4285f4" />
        <BrandSocial icon="fa-solid fa-envelope"     tint="#ea4335" />
      </div>
      <div style={{ height: 22, width: 1, background: 'rgba(255,255,255,0.18)' }}/>
      <a href="#" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '11px 20px', borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(78,205,196,0.90), rgba(78,205,196,0.55))',
        border: '1px solid rgba(168,237,234,0.60)',
        color: '#fff', fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: 13.5,
        textDecoration: 'none',
        boxShadow: '0 6px 18px rgba(78,205,196,0.30), inset 0 1px 0 rgba(255,255,255,0.40)',
      }}>
        <i className="fa-solid fa-download"/> Download CV
      </a>
      <a href="#contact" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '11px 20px', borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))',
        border: '1px solid rgba(255,255,255,0.30)',
        color: '#fff', fontFamily: "'Montserrat', sans-serif", fontWeight: 500, fontSize: 13.5,
        textDecoration: 'none',
        boxShadow: '0 4px 14px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.30)',
      }}>
        Get in touch
      </a>
    </div>
  </div>
);

const BrandSocial = ({ icon, tint }) => {
  const [hover, setHover] = useState(false);
  const toRGBA = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };
  return (
    <a
      href="#"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="social link"
      style={{
        width: 40, height: 40, borderRadius: '50%',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${toRGBA(tint, 0.95)} 0%, ${toRGBA(tint, 0.55)} 100%)`,
        backdropFilter: 'blur(8px)',
        border: `1.5px solid ${toRGBA(tint, 0.75)}`,
        color: '#fff', fontSize: 17,
        cursor: 'pointer', textDecoration: 'none',
        transform: hover ? 'translateY(-3px) scale(1.08)' : 'none',
        boxShadow: hover
          ? `0 10px 26px ${toRGBA(tint, 0.45)}, inset 0 1px 0 rgba(255,255,255,0.45)`
          : `0 4px 14px ${toRGBA(tint, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.30)`,
        transition: 'all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
      }}>
      <i className={icon} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}/>
    </a>
  );
};

const ScrollCue = () => (
  <div style={{
    position: 'absolute', left: '50%', bottom: 18, transform: 'translateX(-50%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    color: 'rgba(255,255,255,0.55)', fontSize: 10, letterSpacing: '0.20em', textTransform: 'uppercase',
    zIndex: 7,
  }}>
    Scroll
    <span style={{
      width: 1, height: 24,
      background: 'linear-gradient(180deg, rgba(100,255,218,0.6), transparent)',
    }}/>
  </div>
);

Object.assign(window, { SubsurfaceHero });
