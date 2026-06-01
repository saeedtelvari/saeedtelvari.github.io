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
   Section panel — large rounded glass that wraps each page section
   ===================================================== */
const SectionPanel = ({ children, bg, style = {} }) => (
  <section style={{
    position: 'relative',
    minHeight: '60vh',
    padding: '80px 24px',
    backgroundImage: bg ? `url('${bg}')` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    overflow: 'hidden',
    ...style,
  }}>
    {bg && (
      <>
        {/* Main neutral contrast overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(15,15,22,0.50) 0%, rgba(18,18,26,0.35) 50%, rgba(15,15,22,0.55) 100%)',
          zIndex: 1,
        }}></div>
        {/* Top transition zone: gentle fade-in from the page's deep dark background */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 160,
          background: 'linear-gradient(to bottom, #130d1c 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }} />
        {/* Bottom transition zone: gentle fade-out into the page's deep dark background */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 160,
          background: 'linear-gradient(to top, #130d1c 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }} />
      </>
    )}
    {/* decorative blobs */}
    <div 
      className="bg-blob-violet"
      style={{
        position: 'absolute', left: '-10%', top: '-10%', width: '120%', height: '120%', pointerEvents: 'none',
        background: 'radial-gradient(circle at 20% 50%, rgba(120,119,198,0.12) 0%, transparent 50%)',
      }}
    />
    <div 
      className="bg-blob-pink"
      style={{
        position: 'absolute', left: '-10%', top: '-10%', width: '120%', height: '120%', pointerEvents: 'none',
        background: 'radial-gradient(circle at 80% 80%, rgba(255,119,198,0.09) 0%, transparent 40%)',
      }}
    />
    <div style={{
      position: 'relative', zIndex: 5,
      maxWidth: 1100, margin: '0 auto',
      padding: '40px 36px',
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

Object.assign(window, { GlassCard, GlassButton, Badge, Tag, ResearchIcon, SectionTitle, Divider, SectionPanel, Reveal });
