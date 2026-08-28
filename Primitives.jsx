const { useState, useEffect, useRef } = React;

/* =====================================================
   Reveal — Scroll-reveal animation wrapper
   ===================================================== */
const Reveal = ({ children, delay = '', className = '', style = {} }) => {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.unobserve(entry.target);
        }
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });
      observer.observe(ref.current);
      return () => observer.disconnect();
    } else {
      setRevealed(true);
    }
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${revealed ? 'revealed' : ''} ${delay} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};


/* =====================================================
   GlassCard — the workhorse container
   ===================================================== */
const GlassCard = ({ children, hover = true, padding = 24, radius = 24, style = {}, className = '', onClick }) => {
  const [hovered, setHovered] = useState(false);
  const base = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.08) 100%)',
    backdropFilter: 'blur(20px) saturate(150%)',
    WebkitBackdropFilter: 'blur(20px) saturate(150%)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderTop: '1px solid rgba(255,255,255,0.40)',
    borderLeft: '1px solid rgba(255,255,255,0.30)',
    borderRadius: radius,
    padding,
    boxShadow: '0 8px 32px rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.05)',
    transition: 'transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.4s ease, border-color 0.4s ease',
    color: 'rgba(255,255,255,0.85)',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };
  if (hover && hovered) {
    base.transform = 'translateY(-8px)';
    base.borderColor = 'rgba(100, 255, 218, 0.45)';
    base.boxShadow = '0 20px 45px rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,255,255,0.30), 0 0 25px rgba(100,255,218,0.15)';
  }
  return (
    <div
      className={className}
      style={base}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

/* =====================================================
   GlassButton — primary + mint variants
   ===================================================== */
const GlassButton = ({ children, variant = 'glass', onClick, icon, style = {} }) => {
  const [state, setState] = useState('rest'); // rest | hover | press

  const mintBg = {
    background: 'linear-gradient(135deg, rgba(78,205,196,0.80) 0%, rgba(78,205,196,0.50) 100%)',
    border: '1px solid rgba(255,255,255,0.20)',
  };
  const glassBg = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
    border: '1px solid rgba(255,255,255,0.30)',
  };

  const base = {
    ...(variant === 'mint' ? mintBg : glassBg),
    color: '#fff',
    fontFamily: "'Montserrat', system-ui, sans-serif",
    fontWeight: variant === 'mint' ? 600 : 500,
    fontSize: 14,
    padding: '12px 22px',
    borderRadius: variant === 'mint' ? 14 : 12,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.30)',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
    ...style,
  };
  if (state === 'hover') {
    base.transform = 'translateY(-3px) scale(1.02)';
    base.boxShadow = '0 8px 25px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.40), 0 0 20px rgba(255,255,255,0.10)';
    base.borderColor = 'rgba(255,255,255,0.55)';
  } else if (state === 'press') {
    base.transform = 'translateY(-1px) scale(0.98)';
  }
  return (
    <button
      style={base}
      onClick={onClick}
      onMouseEnter={() => setState('hover')}
      onMouseLeave={() => setState('rest')}
      onMouseDown={() => setState('press')}
      onMouseUp={() => setState('hover')}
    >
      {icon && <i className={icon}></i>}
      {children}
    </button>
  );
};

/* =====================================================
   Badge — pub badges (Conference / Published / Submitted / Journal)
   ===================================================== */
const BADGE_TINTS = {
  conference: { bg: 'rgba(255,193,7,0.20)', color: '#ffc107' },
  published:  { bg: 'rgba(100,255,218,0.20)', color: '#64ffda' },
  journal:    { bg: 'rgba(40,167,69,0.20)', color: '#28a745' },
  submitted:  { bg: 'rgba(108,117,125,0.20)', color: '#adb5bd' },
  accepted:   { bg: 'rgba(255,193,7,0.20)', color: '#ffc107' },
  preprint:   { bg: 'rgba(167,139,250,0.22)', color: '#c4b5fd' },
};
const Badge = ({ kind = 'conference', children }) => {
  const t = BADGE_TINTS[kind] || BADGE_TINTS.conference;
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: 12,
      background: t.bg,
      color: t.color,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      marginBottom: 12,
    }}>{children}</span>
  );
};

/* =====================================================
   Tag — research (mint pill) + project (neutral chip)
   ===================================================== */
const Tag = ({ children, variant = 'research' }) => {
  const [hovered, setHovered] = useState(false);
  
  const research = {
    background: hovered 
      ? 'linear-gradient(135deg, rgba(78,205,196,0.45) 0%, rgba(78,205,196,0.20) 100%)' 
      : 'linear-gradient(135deg, rgba(78,205,196,0.30) 0%, rgba(78,205,196,0.10) 100%)',
    color: '#fff',
    border: hovered ? '1px solid rgba(78,205,196,0.50)' : '1px solid rgba(78,205,196,0.30)',
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 13,
  };
  const project = {
    background: hovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)',
    color: 'rgba(255,255,255,0.90)',
    border: hovered ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.15)',
    padding: '5px 12px',
    borderRadius: 15,
    fontSize: 12,
  };
  const skill = {
    background: hovered 
      ? 'linear-gradient(135deg, rgba(78,205,196,0.40) 0%, rgba(78,205,196,0.20) 100%)' 
      : 'linear-gradient(135deg, rgba(78,205,196,0.25) 0%, rgba(78,205,196,0.10) 100%)',
    color: '#fff',
    border: hovered ? '1px solid rgba(78,205,196,0.35)' : '1px solid rgba(78,205,196,0.20)',
    padding: '5px 12px',
    borderRadius: 10,
    fontSize: 12,
  };
  const styleMap = { research, project, skill };
  
  return (
    <span 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ 
        ...styleMap[variant], 
        display: 'inline-block', 
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 4px 12px rgba(100, 255, 218, 0.15)' : 'none',
      }}
    >
      {children}
    </span>
  );
};

/* =====================================================
   ResearchIcon — 80px mint circle with icon
   ===================================================== */
const ResearchIcon = ({ icon, size = 80 }) => (
  <div style={{
    width: size, height: size,
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(100,255,218,0.20) 0%, rgba(100,255,218,0.05) 100%)',
    border: '1px solid rgba(100,255,218,0.30)',
    margin: '0 auto 20px',
  }}>
    <i className={icon} style={{ fontSize: size * 0.28, color: '#64ffda' }}></i>
  </div>
);

/* =====================================================
   Section title with mint underline
   ===================================================== */
const SectionTitle = ({ children, style }) => (
  <h2 style={{
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 700,
    fontSize: 40,
    lineHeight: 1.2,
    color: '#fff',
    textAlign: 'center',
    margin: '0 0 48px',
    position: 'relative',
    paddingBottom: 16,
    ...style,
  }}>
    {children}
    <span style={{
      position: 'absolute',
      bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: 100, height: 4, borderRadius: 2,
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6) 50%, transparent)',
    }}></span>
  </h2>
);

/* =====================================================
   Divider — mint gradient hairline
   ===================================================== */
const Divider = () => (
  <hr style={{
    height: 2, margin: '32px 0', border: 'none', borderRadius: 2,
    background: 'linear-gradient(90deg, transparent, rgba(78,205,196,0.30) 20%, rgba(78,205,196,0.50) 50%, rgba(78,205,196,0.30) 80%, transparent)',
  }}/>
);

/* =====================================================
   GeologicalStrataBackground — Procedural SVG Earth Layers
   ===================================================== */
const GeologicalStrataBackground = ({ theme = 'sedimentary' }) => {
  const uid = React.useMemo(() => 'gsb-' + Math.random().toString(36).slice(2, 8), []);
  if (theme === 'sedimentary') {
    return (
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 0,
        }}
        aria-hidden="true"
      >
        <defs>
          {/* Sedimentary Base Gradient — seamless flow from Hero Aquifer (#0a1931) into Crystalline (#161329) */}
          <linearGradient id={uid + '-sedimentBaseGrad'} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b172c" />
            <stop offset="35%" stopColor="#121e33" />
            <stop offset="70%" stopColor="#171b2d" />
            <stop offset="100%" stopColor="#161329" />
          </linearGradient>

          {/* Layer Bedding Colors */}
          <linearGradient id={uid + '-limestoneBedGrad'} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#162238" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#20304c" stopOpacity="0.90" />
            <stop offset="100%" stopColor="#162238" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id={uid + '-dolomiteBedGrad'} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1a253c" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#253552" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1a253c" stopOpacity="0.75" />
          </linearGradient>

          <linearGradient id={uid + '-evaporiteBedGrad'} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#181d30" stopOpacity="0.80" />
            <stop offset="50%" stopColor="#212840" stopOpacity="0.90" />
            <stop offset="100%" stopColor="#181d30" stopOpacity="0.80" />
          </linearGradient>

          {/* Salt Diapir Dome Gradient */}
          <radialGradient id={uid + '-saltDomeGrad'} cx="65%" cy="80%" r="55%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.22)" />
            <stop offset="45%" stopColor="rgba(217, 119, 6, 0.12)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Petroleum-Amber Vein Glow */}
          <linearGradient id={uid + '-petroAmberVein'} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(217, 119, 6, 0.45)" />
            <stop offset="50%" stopColor="rgba(251, 191, 36, 0.65)" />
            <stop offset="100%" stopColor="rgba(217, 119, 6, 0.20)" />
          </linearGradient>

          {/* Carbonate / Limestone Lithology Hatch Pattern */}
          <pattern id={uid + '-carbonateBricks'} width="48" height="24" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="48" y2="0" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <line x1="0" y1="12" x2="48" y2="12" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <line x1="24" y1="0" x2="24" y2="12" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <line x1="0" y1="12" x2="0" y2="24" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <line x1="48" y1="12" x2="48" y2="24" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          </pattern>

          {/* Cross-bedding Sandstone Hatch Pattern */}
          <pattern id={uid + '-crossBedding'} width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(22)">
            <line x1="0" y1="0" x2="0" y2="32" stroke="rgba(56, 189, 248, 0.07)" strokeWidth="1.2" strokeDasharray="3 3" />
            <line x1="16" y1="0" x2="16" y2="32" stroke="rgba(217, 119, 6, 0.05)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Base Background Fill */}
        <rect width="100%" height="100%" fill={'url(#' + uid + '-sedimentBaseGrad)'} />

        {/* Strata Layer 1: Upper Marine Carbonate Bed */}
        <path
          d="M0,80 Q340,45 720,95 T1440,70 L1440,250 Q1080,285 720,235 T0,260 Z"
          fill={'url(#' + uid + '-limestoneBedGrad)'}
        />
        <path
          d="M0,80 Q340,45 720,95 T1440,70 L1440,250 Q1080,285 720,235 T0,260 Z"
          fill={'url(#' + uid + '-carbonateBricks)'}
          opacity="0.65"
        />

        {/* Strata Layer 2: Interbedded Dolomite & Cross-Bedded Sandstone */}
        <path
          d="M0,255 Q320,290 720,240 T1440,265 L1440,480 Q1080,440 720,490 T0,455 Z"
          fill={'url(#' + uid + '-dolomiteBedGrad)'}
        />
        <path
          d="M0,255 Q320,290 720,240 T1440,265 L1440,480 Q1080,440 720,490 T0,455 Z"
          fill={'url(#' + uid + '-crossBedding)'}
          opacity="0.75"
        />

        {/* Strata Layer 3: Evaporite / Halite Deep Marine Strata */}
        <path
          d="M0,450 Q380,490 720,445 T1440,475 L1440,685 Q1080,725 720,675 T0,705 Z"
          fill={'url(#' + uid + '-evaporiteBedGrad)'}
        />

        {/* Strata Layer 4: Deep Sedimentary Basal Bed & Angular Unconformity Seam */}
        <path
          d="M0,700 Q360,760 720,690 T1440,720 L1440,900 L0,900 Z"
          fill="#161329"
        />

        {/* Salt Dome Diapir Intrusion (Halite anticlinal upwelling on right flank) */}
        <path
          d="M920,900 C930,510 1100,340 1260,340 C1400,340 1440,510 1440,900 Z"
          fill={'url(#' + uid + '-saltDomeGrad)'}
        />
        <path
          d="M920,900 C930,510 1100,340 1260,340 C1400,340 1440,510 1440,900"
          fill="none"
          stroke="rgba(56, 189, 248, 0.35)"
          strokeWidth="1.8"
          strokeDasharray="6 4"
        />

        {/* High-definition Bedding Plane & Lamina Lines */}
        <path d="M0,80 Q340,45 720,95 T1440,70" fill="none" stroke="rgba(100,255,218,0.30)" strokeWidth="1.5" />
        <path d="M0,165 Q380,130 720,180 T1440,155" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="8 6" />
        <path d="M0,255 Q320,290 720,240 T1440,265" fill="none" stroke="rgba(56,189,248,0.35)" strokeWidth="1.5" />
        <path d="M0,365 Q360,400 720,350 T1440,380" fill="none" stroke="rgba(217,119,6,0.25)" strokeWidth="1.2" strokeDasharray="12 8" />
        <path d="M0,450 Q380,490 720,445 T1440,475" fill="none" stroke="rgba(100,255,218,0.25)" strokeWidth="1.5" />
        <path d="M0,570 Q330,530 720,590 T1440,555" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeDasharray="6 6" />
        <path d="M0,700 Q360,760 720,690 T1440,720" fill="none" stroke="rgba(168,85,247,0.38)" strokeWidth="2" strokeDasharray="10 6" />

        {/* Hydrocarbon / Petroleum-Amber Mineral Veins */}
        <path
          d="M180,900 Q240,680 320,520 T420,240 T580,0"
          fill="none"
          stroke={'url(#' + uid + '-petroAmberVein)'}
          strokeWidth="1.6"
          strokeDasharray="8 5"
        />
        <path
          d="M580,900 Q620,710 690,560 T820,320"
          fill="none"
          stroke="rgba(217, 119, 6, 0.35)"
          strokeWidth="1.2"
        />
      </svg>
    );
  }

  if (theme === 'crystalline') {
    return (
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 0,
        }}
        aria-hidden="true"
      >
        <defs>
          {/* Crystalline Base Gradient — seamless flow from Sedimentary (#161329) into Mantle (#150f24) */}
          <linearGradient id={uid + '-crystalBaseGrad'} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#161329" />
            <stop offset="35%" stopColor="#1c163b" />
            <stop offset="70%" stopColor="#1c1334" />
            <stop offset="100%" stopColor="#150f24" />
          </linearGradient>

          {/* Metamorphic Gneiss Foliation Gradient */}
          <linearGradient id={uid + '-gneissFoldGrad1'} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#211a47" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#2d225e" stopOpacity="0.90" />
            <stop offset="100%" stopColor="#1c163b" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id={uid + '-gneissFoldGrad2'} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#1b153a" stopOpacity="0.80" />
            <stop offset="50%" stopColor="#261c4f" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1b153a" stopOpacity="0.80" />
          </linearGradient>

          {/* Quartz Vein Glow Gradient */}
          <linearGradient id={uid + '-quartzVeinGrad'} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.85)" />
            <stop offset="50%" stopColor="rgba(100, 255, 218, 0.95)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0.60)" />
          </linearGradient>

          {/* Tectonic Metamorphic Foliation Pattern */}
          <pattern id={uid + '-foliationHatch'} width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
            <line x1="0" y1="0" x2="40" y2="0" stroke="rgba(168, 85, 247, 0.08)" strokeWidth="1.2" />
            <line x1="0" y1="20" x2="40" y2="20" stroke="rgba(100, 255, 218, 0.06)" strokeWidth="1" strokeDasharray="4 4" />
          </pattern>
        </defs>

        {/* Base Background Fill */}
        <rect width="100%" height="100%" fill={'url(#' + uid + '-crystalBaseGrad)'} />

        {/* Top Connecting Unconformity Boundary from Sedimentary */}
        <path
          d="M0,0 L1440,0 L1440,60 Q1080,120 720,50 T0,80 Z"
          fill="#161329"
          opacity="0.9"
        />
        <path
          d="M0,80 Q360,10 720,80 T1440,50"
          fill="none"
          stroke="rgba(168,85,247,0.38)"
          strokeWidth="2"
          strokeDasharray="10 6"
        />

        {/* Metamorphic Fold Band 1 (Ptygmatic folded gneiss) */}
        <path
          d="M0,90 Q240,190 480,85 T960,215 T1440,75 L1440,280 Q1200,370 960,270 T480,380 T0,260 Z"
          fill={'url(#' + uid + '-gneissFoldGrad1)'}
        />
        <path
          d="M0,90 Q240,190 480,85 T960,215 T1440,75 L1440,280 Q1200,370 960,270 T480,380 T0,260 Z"
          fill={'url(#' + uid + '-foliationHatch)'}
          opacity="0.8"
        />

        {/* Metamorphic Fold Band 2 (Isoclinal fold core) */}
        <path
          d="M0,255 Q260,375 480,280 T960,395 T1440,270 L1440,530 Q1200,620 960,520 T480,630 T0,510 Z"
          fill={'url(#' + uid + '-gneissFoldGrad2)'}
        />

        {/* Metamorphic Fold Band 3 (Lower Crystalline Shear Zone & Moho Seam) */}
        <path
          d="M0,505 Q240,625 480,535 T960,645 T1440,525 L1440,760 Q1200,850 960,750 T480,860 T0,740 Z"
          fill={'url(#' + uid + '-gneissFoldGrad1)'}
        />
        <path
          d="M0,740 C360,820 1080,710 1440,780 L1440,900 L0,900 Z"
          fill="#150f24"
        />

        {/* Fold Axial Lines & Mineral Segregation Layers */}
        <path d="M0,90 Q240,190 480,85 T960,215 T1440,75" fill="none" stroke="rgba(168,85,247,0.40)" strokeWidth="1.8" />
        <path d="M0,175 Q250,280 480,180 T960,305 T1440,170" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="6 6" />
        <path d="M0,255 Q260,375 480,280 T960,395 T1440,270" fill="none" stroke="rgba(100,255,218,0.35)" strokeWidth="1.8" />
        <path d="M0,380 Q240,500 480,405 T960,520 T1440,395" fill="none" stroke="rgba(168,85,247,0.25)" strokeWidth="1.2" strokeDasharray="10 6" />
        <path d="M0,505 Q240,625 480,535 T960,645 T1440,525" fill="none" stroke="rgba(100,255,218,0.30)" strokeWidth="1.8" />
        <path d="M0,630 Q260,750 480,655 T960,765 T1440,645" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeDasharray="8 8" />
        <path d="M0,740 C360,820 1080,710 1440,780" fill="none" stroke="rgba(249,115,22,0.42)" strokeWidth="2.2" strokeDasharray="12 6" />

        {/* Tectonic Brittle Natural Fracture Network (Fault Shears with Quartz Infilling) */}
        <g style={{ filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.4))' }}>
          <path d="M90,0 L360,460 L290,900" fill="none" stroke={'url(#' + uid + '-quartzVeinGrad)'} strokeWidth="2.4" />
          <path d="M360,460 L680,720 L840,900" fill="none" stroke="rgba(100,255,218,0.45)" strokeWidth="1.8" />
          <path d="M840,0 L1120,540 L1380,900" fill="none" stroke={'url(#' + uid + '-quartzVeinGrad)'} strokeWidth="2.2" />
          <path d="M1120,540 L880,900" fill="none" stroke="rgba(168,85,247,0.40)" strokeWidth="1.5" strokeDasharray="10 5" />
          <path d="M520,0 L640,240 L590,480" fill="none" stroke="rgba(100,255,218,0.30)" strokeWidth="1.4" />
        </g>

        {/* Crystalline Pegmatite Pluton Intrusion Facets */}
        <polygon points="540,320 620,260 740,310 710,400 580,410" fill="rgba(168,85,247,0.14)" stroke="rgba(168,85,247,0.35)" strokeWidth="1.2" />
        <polygon points="1020,180 1140,120 1240,190 1210,290 1080,270" fill="rgba(100,255,218,0.12)" stroke="rgba(100,255,218,0.30)" strokeWidth="1.2" />

        {/* Crystalline Mineral Shimmer Sparkles */}
        <circle cx="360" cy="460" r="4" fill="#64ffda" style={{ animation: 'crystalShimmer 3s ease-in-out infinite' }} />
        <circle cx="1120" cy="540" r="4" fill="#a855f7" style={{ animation: 'crystalShimmer 3.5s ease-in-out infinite 0.5s' }} />
        <circle cx="680" cy="720" r="3.5" fill="#64ffda" style={{ animation: 'crystalShimmer 4s ease-in-out infinite 1s' }} />
        <circle cx="620" cy="260" r="3" fill="#a855f7" style={{ animation: 'crystalShimmer 3.2s ease-in-out infinite 1.5s' }} />
      </svg>
    );
  }

  if (theme === 'mantle') {
    return (
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 0,
        }}
        aria-hidden="true"
      >
        <defs>
          {/* Mantle Base Gradient — seamless flow from Crystalline (#150f24) into Core (#2e0d1d) */}
          <linearGradient id={uid + '-mantleBaseGrad'} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#150f24" />
            <stop offset="35%" stopColor="#1c0e25" />
            <stop offset="70%" stopColor="#250e23" />
            <stop offset="100%" stopColor="#2e0d1d" />
          </linearGradient>

          {/* Ductile Peridotite Flow Gradients */}
          <linearGradient id={uid + '-peridotiteFlowGrad1'} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1b0f29" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#2a1236" stopOpacity="0.90" />
            <stop offset="100%" stopColor="#1b0f29" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id={uid + '-peridotiteFlowGrad2'} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#230f2d" stopOpacity="0.80" />
            <stop offset="50%" stopColor="#361338" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#230f2d" stopOpacity="0.80" />
          </linearGradient>

          {/* Magma Conduit Glow Gradient */}
          <linearGradient id={uid + '-magmaConduitGrad'} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.4" />
          </linearGradient>

          {/* Bottom Radiant Geothermal Heat Gradient */}
          <radialGradient id={uid + '-geothermalHeatGlow'} cx="50%" cy="100%" r="70%">
            <stop offset="0%" stopColor="rgba(239, 68, 68, 0.40)" />
            <stop offset="45%" stopColor="rgba(249, 115, 22, 0.22)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Serpentine / Olivine Ductile Grain Pattern */}
          <pattern id={uid + '-olivineGrain'} width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.5" fill="rgba(249, 115, 22, 0.12)" />
            <circle cx="36" cy="24" r="2" fill="rgba(239, 68, 68, 0.10)" />
            <circle cx="20" cy="40" r="1.5" fill="rgba(100, 255, 218, 0.08)" />
          </pattern>
        </defs>

        {/* Base Background Fill */}
        <rect width="100%" height="100%" fill={'url(#' + uid + '-mantleBaseGrad)'} />

        {/* Top Connecting Moho Shear Boundary from Crystalline */}
        <path
          d="M0,0 L1440,0 L1440,70 C1080,10 360,120 0,40 Z"
          fill="#150f24"
          opacity="0.9"
        />
        <path
          d="M0,40 C360,120 1080,10 1440,70"
          fill="none"
          stroke="rgba(249,115,22,0.42)"
          strokeWidth="2.2"
          strokeDasharray="12 6"
        />

        {/* Radiant Bottom Geothermal Heat Bloom */}
        <rect width="100%" height="100%" fill={'url(#' + uid + '-geothermalHeatGlow)'} />

        {/* Ductile Flow Band 1 (Upper Mantle Plastic Rheology Shear Belt) */}
        <path
          d="M0,110 C360,230 1080,50 1440,170 L1440,390 C1080,270 360,450 0,330 Z"
          fill={'url(#' + uid + '-peridotiteFlowGrad1)'}
        />
        <path
          d="M0,110 C360,230 1080,50 1440,170 L1440,390 C1080,270 360,450 0,330 Z"
          fill={'url(#' + uid + '-olivineGrain)'}
          opacity="0.8"
        />

        {/* Ductile Flow Band 2 (High-temperature Serpentine Marbling) */}
        <path
          d="M0,325 C380,445 1060,265 1440,385 L1440,650 C1080,530 360,710 0,590 Z"
          fill={'url(#' + uid + '-peridotiteFlowGrad2)'}
        />

        {/* Core-Mantle Boundary (CMB / D'' Layer Transition at base) */}
        <path
          d="M0,740 Q360,810 720,730 T1440,770 L1440,900 L0,900 Z"
          fill="#2e0d1d"
        />

        {/* Ductile Flow Lines */}
        <path d="M0,110 C360,230 1080,50 1440,170" fill="none" stroke="rgba(249,115,22,0.35)" strokeWidth="1.8" />
        <path d="M0,215 C370,335 1070,160 1440,280" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeDasharray="8 8" />
        <path d="M0,325 C380,445 1060,265 1440,385" fill="none" stroke="rgba(239,68,68,0.40)" strokeWidth="2" />
        <path d="M0,455 C370,575 1070,395 1440,515" fill="none" stroke="rgba(249,115,22,0.25)" strokeWidth="1.2" strokeDasharray="12 6" />
        <path d="M0,590 C360,710 1080,530 1440,650" fill="none" stroke="rgba(239,68,68,0.35)" strokeWidth="1.8" />
        <path d="M0,740 Q360,810 720,730 T1440,770" fill="none" stroke="rgba(251,191,36,0.40)" strokeWidth="2" strokeDasharray="10 8" />

        {/* Ascending Magma Conduits & Geothermal Feeder Dikes */}
        <g>
          <path
            d="M240,900 Q280,640 360,420 T440,80"
            fill="none"
            stroke={'url(#' + uid + '-magmaConduitGrad)'}
            strokeWidth="3.2"
            style={{ animation: 'magmaPulse 3.5s ease-in-out infinite' }}
          />
          <path
            d="M780,900 Q740,620 860,360 T960,0"
            fill="none"
            stroke={'url(#' + uid + '-magmaConduitGrad)'}
            strokeWidth="3.8"
            style={{ animation: 'magmaPulse 4s ease-in-out infinite 0.8s' }}
          />
          <path
            d="M1220,900 Q1160,670 1260,390 T1310,60"
            fill="none"
            stroke={'url(#' + uid + '-magmaConduitGrad)'}
            strokeWidth="2.8"
            style={{ animation: 'magmaPulse 3.8s ease-in-out infinite 1.6s' }}
          />
        </g>

        {/* Branching Thermal Fissures */}
        <path d="M360,420 L480,290" fill="none" stroke="rgba(249,115,22,0.50)" strokeWidth="1.5" strokeDasharray="6 4" />
        <path d="M860,360 L730,220" fill="none" stroke="rgba(239,68,68,0.50)" strokeWidth="1.5" strokeDasharray="6 4" />
        <path d="M1260,390 L1150,260" fill="none" stroke="rgba(249,115,22,0.45)" strokeWidth="1.5" strokeDasharray="6 4" />
      </svg>
    );
  }

  if (theme === 'core') {
    return (
      <svg
        viewBox="0 0 1440 450"
        preserveAspectRatio="none"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 0,
        }}
        aria-hidden="true"
      >
        <defs>
          {/* Core Base Gradient — seamless flow from Mantle (#2e0d1d) into Molten Core (#3d1110) */}
          <linearGradient id={uid + '-coreBaseGrad'} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e0d1d" />
            <stop offset="45%" stopColor="#1f0714" />
            <stop offset="100%" stopColor="#3d1110" />
          </linearGradient>

          {/* Molten Core Bottom Radiance */}
          <linearGradient id={uid + '-coreMoltenGlow'} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="60%" stopColor="rgba(239, 68, 68, 0.25)" />
            <stop offset="100%" stopColor="rgba(251, 191, 36, 0.45)" />
          </linearGradient>

          {/* Magnetic Dipolar Flux Gradient */}
          <linearGradient id={uid + '-magneticFluxGrad'} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(251, 191, 36, 0.15)" />
            <stop offset="50%" stopColor="rgba(251, 191, 36, 0.65)" />
            <stop offset="100%" stopColor="rgba(251, 191, 36, 0.15)" />
          </linearGradient>
        </defs>

        {/* Base Background Fill */}
        <rect width="100%" height="100%" fill={'url(#' + uid + '-coreBaseGrad)'} />

        {/* Top Connecting CMB Boundary from Mantle */}
        <path
          d="M0,0 L1440,0 L1440,60 Q1080,120 720,40 T0,70 Z"
          fill="#2e0d1d"
          opacity="0.9"
        />
        <path
          d="M0,70 Q360,0 720,70 T1440,40"
          fill="none"
          stroke="rgba(251,191,36,0.40)"
          strokeWidth="2"
          strokeDasharray="10 8"
        />

        {/* Geodynamo Magnetic Dipolar Field Arcs */}
        <g>
          <path
            d="M0,450 C320,100 1120,100 1440,450"
            fill="none"
            stroke={'url(#' + uid + '-magneticFluxGrad)'}
            strokeWidth="1.8"
            strokeDasharray="8 6"
            style={{ animation: 'magneticFlux 18s linear infinite' }}
          />
          <path
            d="M120,450 C400,180 1040,180 1320,450"
            fill="none"
            stroke="rgba(244, 63, 94, 0.45)"
            strokeWidth="1.5"
            strokeDasharray="10 8"
            style={{ animation: 'magneticFlux 22s linear infinite' }}
          />
          <path
            d="M-80,450 C260,30 1180,30 1520,450"
            fill="none"
            stroke="rgba(251, 191, 36, 0.25)"
            strokeWidth="1.2"
            strokeDasharray="6 6"
            style={{ animation: 'magneticFlux 26s linear infinite' }}
          />
        </g>

        {/* Molten Core Liquid Iron Convection Loops */}
        <path
          d="M260,350 Q360,260 460,350 T660,350"
          fill="none"
          stroke="rgba(239, 68, 68, 0.35)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <path
          d="M820,350 Q920,260 1020,350 T1220,350"
          fill="none"
          stroke="rgba(251, 191, 36, 0.35)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Incandescent Core Bottom Glow */}
        <rect
          y="200"
          width="100%"
          height="250"
          fill={'url(#' + uid + '-coreMoltenGlow)'}
          style={{ animation: 'coreGlowPulse 4s ease-in-out infinite alternate' }}
        />
      </svg>
    );
  }

  return null;
};

/* =====================================================
   Section panel — large rounded glass with geological stratigraphy
   ===================================================== */
const SectionPanel = ({ children, strataTheme = 'sedimentary', style = {} }) => {
  const strataTexture = {
    sedimentary: './assets/strata_sedimentary.webp',
    crystalline: './assets/strata_crystalline.webp',
    mantle: './assets/strata_mantle.webp',
  }[strataTheme] || null;

  const seamGradients = {
    sedimentary: {
      top: '#0b172c',
      bottom: '#161329',
    },
    crystalline: {
      top: '#161329',
      bottom: '#150f24',
    },
    mantle: {
      top: '#150f24',
      bottom: '#2e0d1d',
    },
  };

  const seam = seamGradients[strataTheme] || seamGradients.sedimentary;

  return (
    <section style={{
      position: 'relative',
      minHeight: '60vh',
      padding: '90px 24px',
      overflow: 'hidden',
      backgroundColor: seam.top,
      ...style,
    }}>
      {/* High-Resolution Geological Strata Texture */}
      {strataTexture && (
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url('${strataTexture}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.82,
            filter: 'saturate(115%) contrast(108%)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Procedural Vector Strata Details & Vein Glow Overlays */}
      <GeologicalStrataBackground theme={strataTheme} />

      {/* Seamless Vertical Seam Blending Gradients (Melts sections into each other) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 160,
        background: `linear-gradient(to bottom, ${seam.top} 0%, transparent 100%)`,
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 160,
        background: `linear-gradient(to top, ${seam.bottom} 0%, transparent 100%)`,
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* Dark Ambient Glassmorphic Readability Layer */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(10,12,22,0.45) 0%, rgba(15,18,30,0.25) 50%, rgba(10,12,22,0.50) 100%)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      {/* Atmospheric Depth Glows */}
      <div
        style={{
          position: 'absolute', left: '-10%', top: '-10%', width: '120%', height: '120%', pointerEvents: 'none',
          background: strataTheme === 'sedimentary'
            ? 'radial-gradient(circle at 20% 40%, rgba(56,189,248,0.12) 0%, transparent 55%)'
            : strataTheme === 'crystalline'
              ? 'radial-gradient(circle at 20% 40%, rgba(168,85,247,0.14) 0%, transparent 55%)'
              : 'radial-gradient(circle at 20% 40%, rgba(249,115,22,0.16) 0%, transparent 55%)',
          zIndex: 3,
        }}
      />
      <div
        style={{
          position: 'absolute', left: '-10%', top: '-10%', width: '120%', height: '120%', pointerEvents: 'none',
          background: strataTheme === 'sedimentary'
            ? 'radial-gradient(circle at 80% 80%, rgba(217,119,6,0.10) 0%, transparent 45%)'
            : strataTheme === 'crystalline'
              ? 'radial-gradient(circle at 80% 80%, rgba(100,255,218,0.10) 0%, transparent 45%)'
              : 'radial-gradient(circle at 80% 80%, rgba(239,68,68,0.16) 0%, transparent 45%)',
          zIndex: 3,
        }}
      />

      {/* Main Glass Content Container */}
      <div className="section-panel-content" style={{
        position: 'relative', zIndex: 5,
        maxWidth: 1100, margin: '0 auto',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.08) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderTop: '1px solid rgba(255,255,255,0.25)',
        borderLeft: '1px solid rgba(255,255,255,0.20)',
        borderRadius: 30,
        boxShadow: '0 8px 32px rgba(0,0,0,0.30), inset 0 2px 4px rgba(255,255,255,0.10)',
      }}>
        {children}
      </div>
    </section>
  );
};

Object.assign(window, {
  GlassCard,
  GlassButton,
  Badge,
  Tag,
  ResearchIcon,
  SectionTitle,
  Divider,
  SectionPanel,
  Reveal,
  GeologicalStrataBackground,
});
