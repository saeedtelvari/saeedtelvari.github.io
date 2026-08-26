"use strict";
// Auto-generated bundle — Pre-compiled for instant 0ms execution
var { useState, useEffect, useMemo, useRef, useCallback } = React;

// ==========================================
// File: Primitives.jsx
// ==========================================
// [destructured React]

/* =====================================================
   Reveal — Scroll-reveal animation wrapper
   ===================================================== */
const Reveal = ({
  children,
  delay = '',
  className = '',
  style = {}
}) => {
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
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: `reveal ${revealed ? 'revealed' : ''} ${delay} ${className}`,
    style: style
  }, children);
};

/* =====================================================
   GlassCard — the workhorse container
   ===================================================== */
const GlassCard = ({
  children,
  hover = true,
  padding = 24,
  radius = 24,
  style = {},
  className = '',
  onClick
}) => {
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
    ...style
  };
  if (hover && hovered) {
    base.transform = 'translateY(-8px)';
    base.borderColor = 'rgba(100, 255, 218, 0.45)';
    base.boxShadow = '0 20px 45px rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,255,255,0.30), 0 0 25px rgba(100,255,218,0.15)';
  }
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: base,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onClick: onClick
  }, children);
};

/* =====================================================
   GlassButton — primary + mint variants
   ===================================================== */
const GlassButton = ({
  children,
  variant = 'glass',
  onClick,
  icon,
  style = {}
}) => {
  const [state, setState] = useState('rest'); // rest | hover | press

  const mintBg = {
    background: 'linear-gradient(135deg, rgba(78,205,196,0.80) 0%, rgba(78,205,196,0.50) 100%)',
    border: '1px solid rgba(255,255,255,0.20)'
  };
  const glassBg = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
    border: '1px solid rgba(255,255,255,0.30)'
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
    ...style
  };
  if (state === 'hover') {
    base.transform = 'translateY(-3px) scale(1.02)';
    base.boxShadow = '0 8px 25px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.40), 0 0 20px rgba(255,255,255,0.10)';
    base.borderColor = 'rgba(255,255,255,0.55)';
  } else if (state === 'press') {
    base.transform = 'translateY(-1px) scale(0.98)';
  }
  return /*#__PURE__*/React.createElement("button", {
    style: base,
    onClick: onClick,
    onMouseEnter: () => setState('hover'),
    onMouseLeave: () => setState('rest'),
    onMouseDown: () => setState('press'),
    onMouseUp: () => setState('hover')
  }, icon && /*#__PURE__*/React.createElement("i", {
    className: icon
  }), children);
};

/* =====================================================
   Badge — pub badges (Conference / Published / Submitted / Journal)
   ===================================================== */
const BADGE_TINTS = {
  conference: {
    bg: 'rgba(255,193,7,0.20)',
    color: '#ffc107'
  },
  published: {
    bg: 'rgba(100,255,218,0.20)',
    color: '#64ffda'
  },
  journal: {
    bg: 'rgba(40,167,69,0.20)',
    color: '#28a745'
  },
  submitted: {
    bg: 'rgba(108,117,125,0.20)',
    color: '#adb5bd'
  },
  accepted: {
    bg: 'rgba(255,193,7,0.20)',
    color: '#ffc107'
  },
  preprint: {
    bg: 'rgba(167,139,250,0.22)',
    color: '#c4b5fd'
  }
};
const Badge = ({
  kind = 'conference',
  children
}) => {
  const t = BADGE_TINTS[kind] || BADGE_TINTS.conference;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: 12,
      background: t.bg,
      color: t.color,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      marginBottom: 12
    }
  }, children);
};

/* =====================================================
   Tag — research (mint pill) + project (neutral chip)
   ===================================================== */
const Tag = ({
  children,
  variant = 'research'
}) => {
  const [hovered, setHovered] = useState(false);
  const research = {
    background: hovered ? 'linear-gradient(135deg, rgba(78,205,196,0.45) 0%, rgba(78,205,196,0.20) 100%)' : 'linear-gradient(135deg, rgba(78,205,196,0.30) 0%, rgba(78,205,196,0.10) 100%)',
    color: '#fff',
    border: hovered ? '1px solid rgba(78,205,196,0.50)' : '1px solid rgba(78,205,196,0.30)',
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 13
  };
  const project = {
    background: hovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)',
    color: 'rgba(255,255,255,0.90)',
    border: hovered ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.15)',
    padding: '5px 12px',
    borderRadius: 15,
    fontSize: 12
  };
  const skill = {
    background: hovered ? 'linear-gradient(135deg, rgba(78,205,196,0.40) 0%, rgba(78,205,196,0.20) 100%)' : 'linear-gradient(135deg, rgba(78,205,196,0.25) 0%, rgba(78,205,196,0.10) 100%)',
    color: '#fff',
    border: hovered ? '1px solid rgba(78,205,196,0.35)' : '1px solid rgba(78,205,196,0.20)',
    padding: '5px 12px',
    borderRadius: 10,
    fontSize: 12
  };
  const styleMap = {
    research,
    project,
    skill
  };
  return /*#__PURE__*/React.createElement("span", {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: {
      ...styleMap[variant],
      display: 'inline-block',
      transition: 'all 0.3s ease',
      transform: hovered ? 'translateY(-2px)' : 'none',
      boxShadow: hovered ? '0 4px 12px rgba(100, 255, 218, 0.15)' : 'none'
    }
  }, children);
};

/* =====================================================
   ResearchIcon — 80px mint circle with icon
   ===================================================== */
const ResearchIcon = ({
  icon,
  size = 80
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(100,255,218,0.20) 0%, rgba(100,255,218,0.05) 100%)',
    border: '1px solid rgba(100,255,218,0.30)',
    margin: '0 auto 20px'
  }
}, /*#__PURE__*/React.createElement("i", {
  className: icon,
  style: {
    fontSize: size * 0.28,
    color: '#64ffda'
  }
}));

/* =====================================================
   Section title with mint underline
   ===================================================== */
const SectionTitle = ({
  children,
  style
}) => /*#__PURE__*/React.createElement("h2", {
  style: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 700,
    fontSize: 40,
    lineHeight: 1.2,
    color: '#fff',
    textAlign: 'center',
    margin: '0 0 48px',
    position: 'relative',
    paddingBottom: 16,
    ...style
  }
}, children, /*#__PURE__*/React.createElement("span", {
  style: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 100,
    height: 4,
    borderRadius: 2,
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6) 50%, transparent)'
  }
}));

/* =====================================================
   Divider — mint gradient hairline
   ===================================================== */
const Divider = () => /*#__PURE__*/React.createElement("hr", {
  style: {
    height: 2,
    margin: '32px 0',
    border: 'none',
    borderRadius: 2,
    background: 'linear-gradient(90deg, transparent, rgba(78,205,196,0.30) 20%, rgba(78,205,196,0.50) 50%, rgba(78,205,196,0.30) 80%, transparent)'
  }
});

/* =====================================================
   GeologicalStrataBackground — Procedural SVG Earth Layers
   ===================================================== */
const GeologicalStrataBackground = ({
  theme = 'sedimentary'
}) => {
  if (theme === 'sedimentary') {
    return /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 1440 900",
      preserveAspectRatio: "none",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      },
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
      id: "sedimentBaseGrad",
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "#0b172c"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "35%",
      stopColor: "#121e33"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "70%",
      stopColor: "#171b2d"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "#161329"
    })), /*#__PURE__*/React.createElement("linearGradient", {
      id: "limestoneBedGrad",
      x1: "0",
      y1: "0",
      x2: "1",
      y2: "0"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "#162238",
      stopOpacity: "0.85"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "50%",
      stopColor: "#20304c",
      stopOpacity: "0.90"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "#162238",
      stopOpacity: "0.85"
    })), /*#__PURE__*/React.createElement("linearGradient", {
      id: "dolomiteBedGrad",
      x1: "0",
      y1: "0",
      x2: "1",
      y2: "0"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "#1a253c",
      stopOpacity: "0.75"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "50%",
      stopColor: "#253552",
      stopOpacity: "0.85"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "#1a253c",
      stopOpacity: "0.75"
    })), /*#__PURE__*/React.createElement("linearGradient", {
      id: "evaporiteBedGrad",
      x1: "0",
      y1: "0",
      x2: "1",
      y2: "0"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "#181d30",
      stopOpacity: "0.80"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "50%",
      stopColor: "#212840",
      stopOpacity: "0.90"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "#181d30",
      stopOpacity: "0.80"
    })), /*#__PURE__*/React.createElement("radialGradient", {
      id: "saltDomeGrad",
      cx: "65%",
      cy: "80%",
      r: "55%"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "rgba(56, 189, 248, 0.22)"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "45%",
      stopColor: "rgba(217, 119, 6, 0.12)"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "transparent"
    })), /*#__PURE__*/React.createElement("linearGradient", {
      id: "petroAmberVein",
      x1: "0",
      y1: "0",
      x2: "1",
      y2: "1"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "rgba(217, 119, 6, 0.45)"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "50%",
      stopColor: "rgba(251, 191, 36, 0.65)"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "rgba(217, 119, 6, 0.20)"
    })), /*#__PURE__*/React.createElement("pattern", {
      id: "carbonateBricks",
      width: "48",
      height: "24",
      patternUnits: "userSpaceOnUse"
    }, /*#__PURE__*/React.createElement("line", {
      x1: "0",
      y1: "0",
      x2: "48",
      y2: "0",
      stroke: "rgba(255,255,255,0.06)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "0",
      y1: "12",
      x2: "48",
      y2: "12",
      stroke: "rgba(255,255,255,0.05)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "24",
      y1: "0",
      x2: "24",
      y2: "12",
      stroke: "rgba(255,255,255,0.05)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "0",
      y1: "12",
      x2: "0",
      y2: "24",
      stroke: "rgba(255,255,255,0.05)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "48",
      y1: "12",
      x2: "48",
      y2: "24",
      stroke: "rgba(255,255,255,0.05)",
      strokeWidth: "1"
    })), /*#__PURE__*/React.createElement("pattern", {
      id: "crossBedding",
      width: "32",
      height: "32",
      patternUnits: "userSpaceOnUse",
      patternTransform: "rotate(22)"
    }, /*#__PURE__*/React.createElement("line", {
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "32",
      stroke: "rgba(56, 189, 248, 0.07)",
      strokeWidth: "1.2",
      strokeDasharray: "3 3"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "0",
      x2: "16",
      y2: "32",
      stroke: "rgba(217, 119, 6, 0.05)",
      strokeWidth: "1"
    }))), /*#__PURE__*/React.createElement("rect", {
      width: "100%",
      height: "100%",
      fill: "url(#sedimentBaseGrad)"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,80 Q340,45 720,95 T1440,70 L1440,250 Q1080,285 720,235 T0,260 Z",
      fill: "url(#limestoneBedGrad)"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,80 Q340,45 720,95 T1440,70 L1440,250 Q1080,285 720,235 T0,260 Z",
      fill: "url(#carbonateBricks)",
      opacity: "0.65"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,255 Q320,290 720,240 T1440,265 L1440,480 Q1080,440 720,490 T0,455 Z",
      fill: "url(#dolomiteBedGrad)"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,255 Q320,290 720,240 T1440,265 L1440,480 Q1080,440 720,490 T0,455 Z",
      fill: "url(#crossBedding)",
      opacity: "0.75"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,450 Q380,490 720,445 T1440,475 L1440,685 Q1080,725 720,675 T0,705 Z",
      fill: "url(#evaporiteBedGrad)"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,700 Q360,760 720,690 T1440,720 L1440,900 L0,900 Z",
      fill: "#161329"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M920,900 C930,510 1100,340 1260,340 C1400,340 1440,510 1440,900 Z",
      fill: "url(#saltDomeGrad)"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M920,900 C930,510 1100,340 1260,340 C1400,340 1440,510 1440,900",
      fill: "none",
      stroke: "rgba(56, 189, 248, 0.35)",
      strokeWidth: "1.8",
      strokeDasharray: "6 4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,80 Q340,45 720,95 T1440,70",
      fill: "none",
      stroke: "rgba(100,255,218,0.30)",
      strokeWidth: "1.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,165 Q380,130 720,180 T1440,155",
      fill: "none",
      stroke: "rgba(255,255,255,0.12)",
      strokeWidth: "1",
      strokeDasharray: "8 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,255 Q320,290 720,240 T1440,265",
      fill: "none",
      stroke: "rgba(56,189,248,0.35)",
      strokeWidth: "1.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,365 Q360,400 720,350 T1440,380",
      fill: "none",
      stroke: "rgba(217,119,6,0.25)",
      strokeWidth: "1.2",
      strokeDasharray: "12 8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,450 Q380,490 720,445 T1440,475",
      fill: "none",
      stroke: "rgba(100,255,218,0.25)",
      strokeWidth: "1.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,570 Q330,530 720,590 T1440,555",
      fill: "none",
      stroke: "rgba(255,255,255,0.10)",
      strokeWidth: "1",
      strokeDasharray: "6 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,700 Q360,760 720,690 T1440,720",
      fill: "none",
      stroke: "rgba(168,85,247,0.38)",
      strokeWidth: "2",
      strokeDasharray: "10 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M180,900 Q240,680 320,520 T420,240 T580,0",
      fill: "none",
      stroke: "url(#petroAmberVein)",
      strokeWidth: "1.6",
      strokeDasharray: "8 5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M580,900 Q620,710 690,560 T820,320",
      fill: "none",
      stroke: "rgba(217, 119, 6, 0.35)",
      strokeWidth: "1.2"
    }));
  }
  if (theme === 'crystalline') {
    return /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 1440 900",
      preserveAspectRatio: "none",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      },
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
      id: "crystalBaseGrad",
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "#161329"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "35%",
      stopColor: "#1c163b"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "70%",
      stopColor: "#1c1334"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "#150f24"
    })), /*#__PURE__*/React.createElement("linearGradient", {
      id: "gneissFoldGrad1",
      x1: "0",
      y1: "0",
      x2: "1",
      y2: "1"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "#211a47",
      stopOpacity: "0.85"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "50%",
      stopColor: "#2d225e",
      stopOpacity: "0.90"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "#1c163b",
      stopOpacity: "0.85"
    })), /*#__PURE__*/React.createElement("linearGradient", {
      id: "gneissFoldGrad2",
      x1: "0",
      y1: "1",
      x2: "1",
      y2: "0"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "#1b153a",
      stopOpacity: "0.80"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "50%",
      stopColor: "#261c4f",
      stopOpacity: "0.85"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "#1b153a",
      stopOpacity: "0.80"
    })), /*#__PURE__*/React.createElement("linearGradient", {
      id: "quartzVeinGrad",
      x1: "0",
      y1: "0",
      x2: "1",
      y2: "1"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "rgba(168, 85, 247, 0.85)"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "50%",
      stopColor: "rgba(100, 255, 218, 0.95)"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "rgba(168, 85, 247, 0.60)"
    })), /*#__PURE__*/React.createElement("pattern", {
      id: "foliationHatch",
      width: "40",
      height: "40",
      patternUnits: "userSpaceOnUse",
      patternTransform: "rotate(-35)"
    }, /*#__PURE__*/React.createElement("line", {
      x1: "0",
      y1: "0",
      x2: "40",
      y2: "0",
      stroke: "rgba(168, 85, 247, 0.08)",
      strokeWidth: "1.2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "0",
      y1: "20",
      x2: "40",
      y2: "20",
      stroke: "rgba(100, 255, 218, 0.06)",
      strokeWidth: "1",
      strokeDasharray: "4 4"
    }))), /*#__PURE__*/React.createElement("rect", {
      width: "100%",
      height: "100%",
      fill: "url(#crystalBaseGrad)"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,0 L1440,0 L1440,60 Q1080,120 720,50 T0,80 Z",
      fill: "#161329",
      opacity: "0.9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,80 Q360,10 720,80 T1440,50",
      fill: "none",
      stroke: "rgba(168,85,247,0.38)",
      strokeWidth: "2",
      strokeDasharray: "10 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,90 Q240,190 480,85 T960,215 T1440,75 L1440,280 Q1200,370 960,270 T480,380 T0,260 Z",
      fill: "url(#gneissFoldGrad1)"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,90 Q240,190 480,85 T960,215 T1440,75 L1440,280 Q1200,370 960,270 T480,380 T0,260 Z",
      fill: "url(#foliationHatch)",
      opacity: "0.8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,255 Q260,375 480,280 T960,395 T1440,270 L1440,530 Q1200,620 960,520 T480,630 T0,510 Z",
      fill: "url(#gneissFoldGrad2)"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,505 Q240,625 480,535 T960,645 T1440,525 L1440,760 Q1200,850 960,750 T480,860 T0,740 Z",
      fill: "url(#gneissFoldGrad1)"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,740 C360,820 1080,710 1440,780 L1440,900 L0,900 Z",
      fill: "#150f24"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,90 Q240,190 480,85 T960,215 T1440,75",
      fill: "none",
      stroke: "rgba(168,85,247,0.40)",
      strokeWidth: "1.8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,175 Q250,280 480,180 T960,305 T1440,170",
      fill: "none",
      stroke: "rgba(255,255,255,0.12)",
      strokeWidth: "1",
      strokeDasharray: "6 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,255 Q260,375 480,280 T960,395 T1440,270",
      fill: "none",
      stroke: "rgba(100,255,218,0.35)",
      strokeWidth: "1.8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,380 Q240,500 480,405 T960,520 T1440,395",
      fill: "none",
      stroke: "rgba(168,85,247,0.25)",
      strokeWidth: "1.2",
      strokeDasharray: "10 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,505 Q240,625 480,535 T960,645 T1440,525",
      fill: "none",
      stroke: "rgba(100,255,218,0.30)",
      strokeWidth: "1.8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,630 Q260,750 480,655 T960,765 T1440,645",
      fill: "none",
      stroke: "rgba(255,255,255,0.10)",
      strokeWidth: "1",
      strokeDasharray: "8 8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,740 C360,820 1080,710 1440,780",
      fill: "none",
      stroke: "rgba(249,115,22,0.42)",
      strokeWidth: "2.2",
      strokeDasharray: "12 6"
    }), /*#__PURE__*/React.createElement("g", {
      style: {
        filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.4))'
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: "M90,0 L360,460 L290,900",
      fill: "none",
      stroke: "url(#quartzVeinGrad)",
      strokeWidth: "2.4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M360,460 L680,720 L840,900",
      fill: "none",
      stroke: "rgba(100,255,218,0.45)",
      strokeWidth: "1.8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M840,0 L1120,540 L1380,900",
      fill: "none",
      stroke: "url(#quartzVeinGrad)",
      strokeWidth: "2.2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M1120,540 L880,900",
      fill: "none",
      stroke: "rgba(168,85,247,0.40)",
      strokeWidth: "1.5",
      strokeDasharray: "10 5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M520,0 L640,240 L590,480",
      fill: "none",
      stroke: "rgba(100,255,218,0.30)",
      strokeWidth: "1.4"
    })), /*#__PURE__*/React.createElement("polygon", {
      points: "540,320 620,260 740,310 710,400 580,410",
      fill: "rgba(168,85,247,0.14)",
      stroke: "rgba(168,85,247,0.35)",
      strokeWidth: "1.2"
    }), /*#__PURE__*/React.createElement("polygon", {
      points: "1020,180 1140,120 1240,190 1210,290 1080,270",
      fill: "rgba(100,255,218,0.12)",
      stroke: "rgba(100,255,218,0.30)",
      strokeWidth: "1.2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "360",
      cy: "460",
      r: "4",
      fill: "#64ffda",
      style: {
        animation: 'crystalShimmer 3s ease-in-out infinite'
      }
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "1120",
      cy: "540",
      r: "4",
      fill: "#a855f7",
      style: {
        animation: 'crystalShimmer 3.5s ease-in-out infinite 0.5s'
      }
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "680",
      cy: "720",
      r: "3.5",
      fill: "#64ffda",
      style: {
        animation: 'crystalShimmer 4s ease-in-out infinite 1s'
      }
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "620",
      cy: "260",
      r: "3",
      fill: "#a855f7",
      style: {
        animation: 'crystalShimmer 3.2s ease-in-out infinite 1.5s'
      }
    }));
  }
  if (theme === 'mantle') {
    return /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 1440 900",
      preserveAspectRatio: "none",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      },
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
      id: "mantleBaseGrad",
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "#150f24"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "35%",
      stopColor: "#1c0e25"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "70%",
      stopColor: "#250e23"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "#2e0d1d"
    })), /*#__PURE__*/React.createElement("linearGradient", {
      id: "peridotiteFlowGrad1",
      x1: "0",
      y1: "0",
      x2: "1",
      y2: "0"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "#1b0f29",
      stopOpacity: "0.85"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "50%",
      stopColor: "#2a1236",
      stopOpacity: "0.90"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "#1b0f29",
      stopOpacity: "0.85"
    })), /*#__PURE__*/React.createElement("linearGradient", {
      id: "peridotiteFlowGrad2",
      x1: "0",
      y1: "0",
      x2: "1",
      y2: "0"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "#230f2d",
      stopOpacity: "0.80"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "50%",
      stopColor: "#361338",
      stopOpacity: "0.88"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "#230f2d",
      stopOpacity: "0.80"
    })), /*#__PURE__*/React.createElement("linearGradient", {
      id: "magmaConduitGrad",
      x1: "0",
      y1: "1",
      x2: "0",
      y2: "0"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "#ef4444"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "50%",
      stopColor: "#f97316"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "#fbbf24",
      stopOpacity: "0.4"
    })), /*#__PURE__*/React.createElement("radialGradient", {
      id: "geothermalHeatGlow",
      cx: "50%",
      cy: "100%",
      r: "70%"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "rgba(239, 68, 68, 0.40)"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "45%",
      stopColor: "rgba(249, 115, 22, 0.22)"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "transparent"
    })), /*#__PURE__*/React.createElement("pattern", {
      id: "olivineGrain",
      width: "48",
      height: "48",
      patternUnits: "userSpaceOnUse"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "1.5",
      fill: "rgba(249, 115, 22, 0.12)"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "36",
      cy: "24",
      r: "2",
      fill: "rgba(239, 68, 68, 0.10)"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "20",
      cy: "40",
      r: "1.5",
      fill: "rgba(100, 255, 218, 0.08)"
    }))), /*#__PURE__*/React.createElement("rect", {
      width: "100%",
      height: "100%",
      fill: "url(#mantleBaseGrad)"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,0 L1440,0 L1440,70 C1080,10 360,120 0,40 Z",
      fill: "#150f24",
      opacity: "0.9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,40 C360,120 1080,10 1440,70",
      fill: "none",
      stroke: "rgba(249,115,22,0.42)",
      strokeWidth: "2.2",
      strokeDasharray: "12 6"
    }), /*#__PURE__*/React.createElement("rect", {
      width: "100%",
      height: "100%",
      fill: "url(#geothermalHeatGlow)"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,110 C360,230 1080,50 1440,170 L1440,390 C1080,270 360,450 0,330 Z",
      fill: "url(#peridotiteFlowGrad1)"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,110 C360,230 1080,50 1440,170 L1440,390 C1080,270 360,450 0,330 Z",
      fill: "url(#olivineGrain)",
      opacity: "0.8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,325 C380,445 1060,265 1440,385 L1440,650 C1080,530 360,710 0,590 Z",
      fill: "url(#peridotiteFlowGrad2)"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,740 Q360,810 720,730 T1440,770 L1440,900 L0,900 Z",
      fill: "#2e0d1d"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,110 C360,230 1080,50 1440,170",
      fill: "none",
      stroke: "rgba(249,115,22,0.35)",
      strokeWidth: "1.8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,215 C370,335 1070,160 1440,280",
      fill: "none",
      stroke: "rgba(255,255,255,0.10)",
      strokeWidth: "1",
      strokeDasharray: "8 8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,325 C380,445 1060,265 1440,385",
      fill: "none",
      stroke: "rgba(239,68,68,0.40)",
      strokeWidth: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,455 C370,575 1070,395 1440,515",
      fill: "none",
      stroke: "rgba(249,115,22,0.25)",
      strokeWidth: "1.2",
      strokeDasharray: "12 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,590 C360,710 1080,530 1440,650",
      fill: "none",
      stroke: "rgba(239,68,68,0.35)",
      strokeWidth: "1.8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,740 Q360,810 720,730 T1440,770",
      fill: "none",
      stroke: "rgba(251,191,36,0.40)",
      strokeWidth: "2",
      strokeDasharray: "10 8"
    }), /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
      d: "M240,900 Q280,640 360,420 T440,80",
      fill: "none",
      stroke: "url(#magmaConduitGrad)",
      strokeWidth: "3.2",
      style: {
        animation: 'magmaPulse 3.5s ease-in-out infinite'
      }
    }), /*#__PURE__*/React.createElement("path", {
      d: "M780,900 Q740,620 860,360 T960,0",
      fill: "none",
      stroke: "url(#magmaConduitGrad)",
      strokeWidth: "3.8",
      style: {
        animation: 'magmaPulse 4s ease-in-out infinite 0.8s'
      }
    }), /*#__PURE__*/React.createElement("path", {
      d: "M1220,900 Q1160,670 1260,390 T1310,60",
      fill: "none",
      stroke: "url(#magmaConduitGrad)",
      strokeWidth: "2.8",
      style: {
        animation: 'magmaPulse 3.8s ease-in-out infinite 1.6s'
      }
    })), /*#__PURE__*/React.createElement("path", {
      d: "M360,420 L480,290",
      fill: "none",
      stroke: "rgba(249,115,22,0.50)",
      strokeWidth: "1.5",
      strokeDasharray: "6 4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M860,360 L730,220",
      fill: "none",
      stroke: "rgba(239,68,68,0.50)",
      strokeWidth: "1.5",
      strokeDasharray: "6 4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M1260,390 L1150,260",
      fill: "none",
      stroke: "rgba(249,115,22,0.45)",
      strokeWidth: "1.5",
      strokeDasharray: "6 4"
    }));
  }
  if (theme === 'core') {
    return /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 1440 450",
      preserveAspectRatio: "none",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      },
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
      id: "coreBaseGrad",
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "#2e0d1d"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "45%",
      stopColor: "#1f0714"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "#3d1110"
    })), /*#__PURE__*/React.createElement("linearGradient", {
      id: "coreMoltenGlow",
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "transparent"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "60%",
      stopColor: "rgba(239, 68, 68, 0.25)"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "rgba(251, 191, 36, 0.45)"
    })), /*#__PURE__*/React.createElement("linearGradient", {
      id: "magneticFluxGrad",
      x1: "0",
      y1: "0",
      x2: "1",
      y2: "0"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: "rgba(251, 191, 36, 0.15)"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "50%",
      stopColor: "rgba(251, 191, 36, 0.65)"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: "rgba(251, 191, 36, 0.15)"
    }))), /*#__PURE__*/React.createElement("rect", {
      width: "100%",
      height: "100%",
      fill: "url(#coreBaseGrad)"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,0 L1440,0 L1440,60 Q1080,120 720,40 T0,70 Z",
      fill: "#2e0d1d",
      opacity: "0.9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0,70 Q360,0 720,70 T1440,40",
      fill: "none",
      stroke: "rgba(251,191,36,0.40)",
      strokeWidth: "2",
      strokeDasharray: "10 8"
    }), /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
      d: "M0,450 C320,100 1120,100 1440,450",
      fill: "none",
      stroke: "url(#magneticFluxGrad)",
      strokeWidth: "1.8",
      strokeDasharray: "8 6",
      style: {
        animation: 'magneticFlux 18s linear infinite'
      }
    }), /*#__PURE__*/React.createElement("path", {
      d: "M120,450 C400,180 1040,180 1320,450",
      fill: "none",
      stroke: "rgba(244, 63, 94, 0.45)",
      strokeWidth: "1.5",
      strokeDasharray: "10 8",
      style: {
        animation: 'magneticFlux 22s linear infinite'
      }
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-80,450 C260,30 1180,30 1520,450",
      fill: "none",
      stroke: "rgba(251, 191, 36, 0.25)",
      strokeWidth: "1.2",
      strokeDasharray: "6 6",
      style: {
        animation: 'magneticFlux 26s linear infinite'
      }
    })), /*#__PURE__*/React.createElement("path", {
      d: "M260,350 Q360,260 460,350 T660,350",
      fill: "none",
      stroke: "rgba(239, 68, 68, 0.35)",
      strokeWidth: "2",
      strokeDasharray: "4 4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M820,350 Q920,260 1020,350 T1220,350",
      fill: "none",
      stroke: "rgba(251, 191, 36, 0.35)",
      strokeWidth: "2",
      strokeDasharray: "4 4"
    }), /*#__PURE__*/React.createElement("rect", {
      y: "200",
      width: "100%",
      height: "250",
      fill: "url(#coreMoltenGlow)",
      style: {
        animation: 'coreGlowPulse 4s ease-in-out infinite alternate'
      }
    }));
  }
  return null;
};

/* =====================================================
   StratigraphicBadge — Geological Depth Horizon Marker
   ===================================================== */
const StratigraphicBadge = ({
  depth,
  formation,
  temp,
  press,
  theme = 'sedimentary'
}) => {
  const themeColors = {
    sedimentary: {
      dot: '#38bdf8',
      border: 'rgba(56, 189, 248, 0.35)',
      bg: 'rgba(56, 189, 248, 0.12)',
      text: '#7dd3fc'
    },
    crystalline: {
      dot: '#a855f7',
      border: 'rgba(168, 85, 247, 0.35)',
      bg: 'rgba(168, 85, 247, 0.14)',
      text: '#c084fc'
    },
    mantle: {
      dot: '#f97316',
      border: 'rgba(249, 115, 22, 0.40)',
      bg: 'rgba(249, 115, 22, 0.15)',
      text: '#fdba74'
    },
    core: {
      dot: '#fbbf24',
      border: 'rgba(251, 191, 36, 0.45)',
      bg: 'rgba(251, 191, 36, 0.18)',
      text: '#fde047'
    }
  };
  const cfg = themeColors[theme] || themeColors.sedimentary;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '8px 12px',
      padding: '6px 16px',
      borderRadius: 24,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
      border: `1px solid ${cfg.border}`,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.20)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      fontSize: 11.5,
      fontFamily: 'ui-monospace, Menlo, Monaco, monospace',
      letterSpacing: '0.06em',
      color: '#fff',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      backgroundColor: cfg.dot,
      boxShadow: `0 0 8px ${cfg.dot}`,
      display: 'inline-block'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: cfg.text,
      textTransform: 'uppercase'
    }
  }, depth)), /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.4
    }
  }, "|"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,0.90)',
      fontWeight: 500
    }
  }, formation), (temp || press) && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.4
    }
  }, "|"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,0.65)',
      fontSize: 11
    }
  }, temp && `T: ${temp}`, temp && press && ' · ', press && `P: ${press}`)));
};

/* =====================================================
   Section panel — large rounded glass with geological stratigraphy
   ===================================================== */
const SectionPanel = ({
  children,
  strataTheme = 'sedimentary',
  bg,
  style = {}
}) => {
  // Default strata background mapping if not explicitly provided
  const defaultBg = bg || (strataTheme === 'sedimentary' ? './assets/strata_sedimentary.jpg' : strataTheme === 'crystalline' ? './assets/strata_crystalline.jpg' : strataTheme === 'mantle' ? './assets/strata_mantle.jpg' : null);
  const seamGradients = {
    sedimentary: {
      top: '#0b172c',
      bottom: '#161329'
    },
    crystalline: {
      top: '#161329',
      bottom: '#150f24'
    },
    mantle: {
      top: '#150f24',
      bottom: '#2e0d1d'
    }
  };
  const seam = seamGradients[strataTheme] || seamGradients.sedimentary;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      minHeight: '60vh',
      padding: '90px 24px',
      overflow: 'hidden',
      backgroundColor: seam.top,
      ...style
    }
  }, defaultBg && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: `url('${defaultBg}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: 0.82,
      filter: 'saturate(115%) contrast(108%)',
      zIndex: 0,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement(GeologicalStrataBackground, {
    theme: strataTheme
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 160,
      background: `linear-gradient(to bottom, ${seam.top} 0%, transparent 100%)`,
      zIndex: 1,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 160,
      background: `linear-gradient(to top, ${seam.bottom} 0%, transparent 100%)`,
      zIndex: 1,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(135deg, rgba(10,12,22,0.45) 0%, rgba(15,18,30,0.25) 50%, rgba(10,12,22,0.50) 100%)',
      zIndex: 2,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '-10%',
      top: '-10%',
      width: '120%',
      height: '120%',
      pointerEvents: 'none',
      background: strataTheme === 'sedimentary' ? 'radial-gradient(circle at 20% 40%, rgba(56,189,248,0.12) 0%, transparent 55%)' : strataTheme === 'crystalline' ? 'radial-gradient(circle at 20% 40%, rgba(168,85,247,0.14) 0%, transparent 55%)' : 'radial-gradient(circle at 20% 40%, rgba(249,115,22,0.16) 0%, transparent 55%)',
      zIndex: 3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '-10%',
      top: '-10%',
      width: '120%',
      height: '120%',
      pointerEvents: 'none',
      background: strataTheme === 'sedimentary' ? 'radial-gradient(circle at 80% 80%, rgba(217,119,6,0.10) 0%, transparent 45%)' : strataTheme === 'crystalline' ? 'radial-gradient(circle at 80% 80%, rgba(100,255,218,0.10) 0%, transparent 45%)' : 'radial-gradient(circle at 80% 80%, rgba(239,68,68,0.16) 0%, transparent 45%)',
      zIndex: 3
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "section-panel-content",
    style: {
      position: 'relative',
      zIndex: 5,
      maxWidth: 1100,
      margin: '0 auto',
      background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.08) 100%)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderTop: '1px solid rgba(255,255,255,0.25)',
      borderLeft: '1px solid rgba(255,255,255,0.20)',
      borderRadius: 30,
      boxShadow: '0 8px 32px rgba(0,0,0,0.30), inset 0 2px 4px rgba(255,255,255,0.10)'
    }
  }, children));
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
  StratigraphicBadge
});

// ==========================================
// File: Header.jsx
// ==========================================
// Header.jsx — fixed top navbar, transparent over hero, shrinks on scroll, with mobile drawer.

// [destructured React]

const Header = ({
  active,
  onNavigate
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(active);

  // Shrink-on-scroll
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);

      // Auto section spy when on home page
      if (active === 'home' || active === 'about' || active === 'publications' || active === 'contact') {
        const sections = [{
          id: 'contact',
          el: document.getElementById('contact')
        }, {
          id: 'publications',
          el: document.getElementById('publications')
        }, {
          id: 'about',
          el: document.getElementById('about')
        }, {
          id: 'home',
          el: document.getElementById('home')
        }];
        for (const s of sections) {
          if (s.el) {
            const rect = s.el.getBoundingClientRect();
            if (rect.top <= 200) {
              setCurrentSection(s.id);
              break;
            }
          }
        }
      } else {
        setCurrentSection(active);
      }
    };
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', onScroll);
  }, [active]);

  // Sync current section if active prop changes
  useEffect(() => {
    setCurrentSection(active);
  }, [active]);

  // Close drawer on escape key
  useEffect(() => {
    const onKeyDown = e => {
      if (e.key === 'Escape' && mobileOpen) setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);
  const items = [{
    id: 'home',
    label: 'Home'
  }, {
    id: 'about',
    label: 'About'
  }, {
    id: 'publications',
    label: 'Research'
  }, {
    id: 'simulator',
    label: 'VE Simulator'
  }, {
    id: 'cv',
    label: 'CV'
  }];
  const handleItemClick = id => {
    setMobileOpen(false);
    if (onNavigate) onNavigate(id);else if (window.__onNavigate) window.__onNavigate(id);
  };
  return /*#__PURE__*/React.createElement("header", {
    role: "banner",
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 1000,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("style", null, `
        .desktop-nav-list {
          display: flex;
          gap: 6px;
          list-style: none;
          margin: 0;
          padding: 0;
          align-items: center;
        }
        .hamburger-btn {
          display: none;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          color: #64ffda;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
        }
        .hamburger-btn:hover {
          background: rgba(100,255,218,0.18);
          border-color: #64ffda;
        }
        .mobile-drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(10, 8, 18, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 1001;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.35s ease;
        }
        .mobile-drawer-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }
        .mobile-drawer-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(320px, 80vw);
          background: linear-gradient(165deg, rgba(33, 29, 52, 0.98) 0%, rgba(20, 28, 52, 0.98) 100%);
          border-left: 1px solid rgba(100, 255, 218, 0.25);
          box-shadow: -10px 0 35px rgba(0, 0, 0, 0.5);
          z-index: 1002;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          pointer-events: auto;
        }
        .mobile-drawer-panel.open {
          transform: translateX(0);
        }
        @media (max-width: 768px) {
          .desktop-nav-list {
            display: none !important;
          }
          .hamburger-btn {
            display: flex !important;
          }
          .header-container {
            padding: 0 20px !important;
          }
        }
      `), /*#__PURE__*/React.createElement("div", {
    className: "header-container",
    style: {
      height: scrolled ? 64 : 88,
      padding: '0 36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.4s ease',
      background: scrolled ? 'linear-gradient(180deg, rgba(19, 13, 28, 0.92) 0%, rgba(19, 13, 28, 0.75) 100%)' : 'linear-gradient(180deg, rgba(19, 13, 28, 0.60) 0%, rgba(19, 13, 28, 0.20) 60%, transparent 100%)',
      backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(6px)',
      WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(6px)',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
      boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.30), inset 0 -1px 0 rgba(255,255,255,0.08)' : 'none',
      pointerEvents: 'auto'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      handleItemClick('home');
    },
    "aria-label": "Sa'eed Telvari Homepage",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: scrolled ? 44 : 58,
      height: scrolled ? 44 : 58,
      transition: 'all 0.4s ease'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "./assets/logo-minimalist.png",
    alt: "Sa'eed Telvari",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'contain'
    }
  })), /*#__PURE__*/React.createElement("nav", {
    role: "navigation",
    "aria-label": "Main menu"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "desktop-nav-list"
  }, items.map(it => /*#__PURE__*/React.createElement(NavItem, {
    key: it.id,
    label: it.label,
    active: currentSection === it.id,
    onClick: () => handleItemClick(it.id)
  })))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "hamburger-btn",
    onClick: () => setMobileOpen(!mobileOpen),
    "aria-expanded": mobileOpen,
    "aria-label": mobileOpen ? "Close navigation menu" : "Open navigation menu"
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${mobileOpen ? 'fa-times' : 'fa-bars'}`
  }))), /*#__PURE__*/React.createElement("div", {
    className: `mobile-drawer-backdrop ${mobileOpen ? 'open' : ''}`,
    onClick: () => setMobileOpen(false),
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: `mobile-drawer-panel ${mobileOpen ? 'open' : ''}`,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Mobile Navigation"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      paddingBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "./assets/logo-minimalist.png",
    alt: "Logo",
    style: {
      width: 32,
      height: 32,
      objectFit: 'contain'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: '#fff',
      letterSpacing: '-0.01em'
    }
  }, "Sa\u2019eed Telvari")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setMobileOpen(false),
    "aria-label": "Close menu",
    style: {
      background: 'none',
      border: 'none',
      color: 'rgba(255,255,255,0.6)',
      fontSize: 18,
      cursor: 'pointer',
      padding: 4
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-times"
  }))), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, items.map(it => {
    const isActive = currentSection === it.id;
    return /*#__PURE__*/React.createElement("li", {
      key: it.id
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => handleItemClick(it.id),
      style: {
        width: '100%',
        textAlign: 'left',
        padding: '12px 16px',
        borderRadius: 12,
        background: isActive ? 'rgba(100,255,218,0.15)' : 'transparent',
        border: isActive ? '1px solid rgba(100,255,218,0.35)' : '1px solid transparent',
        color: isActive ? '#64ffda' : 'rgba(255,255,255,0.85)',
        fontSize: 15,
        fontWeight: isActive ? 600 : 400,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease'
      }
    }, /*#__PURE__*/React.createElement("span", null, it.label), isActive && /*#__PURE__*/React.createElement("i", {
      className: "fas fa-chevron-right",
      style: {
        fontSize: 11,
        color: '#64ffda'
      }
    })));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.5)',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: 12
    }
  }, "Connect"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://www.linkedin.com/in/stelvari/",
    target: "_blank",
    rel: "noreferrer",
    "aria-label": "LinkedIn",
    style: {
      color: '#64ffda',
      fontSize: 16
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fab fa-linkedin"
  })), /*#__PURE__*/React.createElement("a", {
    href: "https://github.com/saeedtelvari",
    target: "_blank",
    rel: "noreferrer",
    "aria-label": "GitHub",
    style: {
      color: '#64ffda',
      fontSize: 16
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fab fa-github"
  })), /*#__PURE__*/React.createElement("a", {
    href: "mailto:st4014@hw.ac.uk",
    "aria-label": "Email",
    style: {
      color: '#64ffda',
      fontSize: 16
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-envelope"
  }))))));
};
const NavItem = ({
  label,
  active,
  onClick
}) => {
  const [hover, setHover] = useState(false);
  const showPill = hover || active;
  return /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onClick: onClick,
    "aria-current": active ? 'page' : undefined,
    style: {
      position: 'relative',
      padding: '8px 16px',
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 14.5,
      fontWeight: active ? 600 : 400,
      color: active ? '#64ffda' : 'azure',
      cursor: 'pointer',
      borderRadius: 12,
      transition: 'all 0.35s cubic-bezier(0.175,0.885,0.32,1.275)',
      transform: hover ? 'translateY(-2px)' : 'translateY(0)',
      background: showPill ? 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 100%)' : 'transparent',
      backdropFilter: showPill ? 'blur(10px)' : 'none',
      WebkitBackdropFilter: showPill ? 'blur(10px)' : 'none',
      border: active ? '1px solid rgba(100,255,218,0.40)' : showPill ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
      boxShadow: active ? '0 4px 15px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.20), 0 0 10px rgba(100,255,218,0.15)' : showPill ? '0 4px 15px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.30)' : 'none',
      outline: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", null, label), active && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: 2,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 4,
      height: 4,
      borderRadius: '50%',
      backgroundColor: '#64ffda',
      boxShadow: '0 0 8px #64ffda'
    }
  })));
};
Object.assign(window, {
  Header
});

// ==========================================
// File: Footer.jsx
// ==========================================
// Footer.jsx
const Footer = ({
  onNavigate
}) => {
  const links = [{
    id: 'home',
    label: 'Home'
  }, {
    id: 'about',
    label: 'About'
  }, {
    id: 'publications',
    label: 'Research'
  }, {
    id: 'simulator',
    label: 'VE Simulator'
  }, {
    id: 'cv',
    label: 'CV'
  }];
  return /*#__PURE__*/React.createElement("footer", {
    role: "contentinfo",
    style: {
      position: 'relative',
      zIndex: 10,
      padding: '64px 36px 48px',
      backgroundColor: '#2e0d1d',
      color: 'rgba(255,255,255,0.75)',
      fontFamily: "'Montserrat', sans-serif",
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: "url('./assets/strata_core.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center bottom',
      opacity: 0.85,
      filter: 'saturate(120%) contrast(110%)',
      zIndex: 0,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement(GeologicalStrataBackground, {
    theme: "core"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 120,
      background: 'linear-gradient(to bottom, #2e0d1d 0%, transparent 100%)',
      zIndex: 1,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 2,
      maxWidth: 1200,
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: '#fbbf24',
      boxShadow: '0 0 10px #fbbf24, 0 0 20px #f59e0b',
      display: 'inline-block'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontFamily: 'ui-monospace, Menlo, Monaco, monospace',
      letterSpacing: '0.12em',
      color: '#fbbf24',
      fontWeight: 700,
      textTransform: 'uppercase'
    }
  }, "Depth: >2,900 km \xB7 Earth's Outer Core & Geodynamo")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13.5,
      color: 'rgba(255,255,255,0.90)',
      fontWeight: 500
    }
  }, "\xA9 2024\u20132026 Sa\u2019eed Telvari. All rights reserved."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 12,
      color: 'rgba(255,255,255,0.55)'
    }
  }, "Institute of GeoEnergy Engineering \xB7 Heriot-Watt University")), /*#__PURE__*/React.createElement("nav", {
    role: "navigation",
    "aria-label": "Footer navigation"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      fontSize: 13,
      flexWrap: 'wrap'
    }
  }, links.map(l => /*#__PURE__*/React.createElement(FooterLink, {
    key: l.id,
    label: l.label,
    onClick: () => {
      if (onNavigate) onNavigate(l.id);else if (window.__onNavigate) window.__onNavigate(l.id);
    }
  }))))));
};
const FooterLink = ({
  label,
  onClick
}) => {
  const [hover, setHover] = useState(false);
  return /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onClick();
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      color: hover ? '#64ffda' : 'rgba(255,255,255,0.70)',
      textDecoration: 'none',
      cursor: 'pointer',
      transition: 'all 0.25s ease',
      fontWeight: hover ? 500 : 400,
      transform: hover ? 'translateY(-1px)' : 'none'
    }
  }, label);
};
Object.assign(window, {
  Footer
});

// ==========================================
// File: SubsurfaceHero.jsx
// ==========================================
// SubsurfaceHero.jsx — landing hero as a CO2 storage cross-section.
// Strict layout: sky (top 42vh) holds the identity, subsurface (58vh) holds
// the cross-section. They never overlap.

// [destructured React]

/* =====================================================
   Physical Cap Rock & VE Numerical PDE Solver
   ===================================================== */

// Generate randomized faults with opposing slopes (random angles 0° to 20° from vertical) and guaranteed non-crossing spacing
const generateRandomizedFaults = () => {
  const count = 2; // Always exactly 2 faults
  const faultsList = [];

  // Random slope angles between 0° (purely vertical) and 20° from vertical
  // tan(deg * PI / 180): tan(0°) = 0.0, tan(20°) ≈ 0.364
  const angleDeg1 = Math.random() * 20.0; // 0° to 20°
  const angleDeg2 = Math.random() * 20.0; // 0° to 20°
  const slopeMag1 = parseFloat(Math.tan(angleDeg1 * Math.PI / 180.0).toFixed(3)); // 0.000 to 0.364
  const slopeMag2 = parseFloat(Math.tan(angleDeg2 * Math.PI / 180.0).toFixed(3)); // 0.000 to 0.364

  // Opposing slopes: Fault 1 and Fault 2 tilt in opposite directions
  // 65% outward divergent (Horst), 35% inward convergent (Graben with guaranteed non-crossing buffer)
  const isDivergent = Math.random() < 0.65;
  let dipSlope1 = isDivergent ? -slopeMag1 : slopeMag1;
  let dipSlope2 = isDivergent ? slopeMag2 : -slopeMag2;
  let xPct1, xPct2;
  if (isDivergent) {
    xPct1 = Math.floor(Math.random() * (32 - 18 + 1)) + 18; // 18% to 32%
    xPct2 = Math.floor(Math.random() * (54 - 44 + 1)) + 44; // 44% to 54%
  } else {
    // For converging faults, guarantee at least 80px clearance at bottom (y = 580)
    xPct1 = Math.floor(Math.random() * (22 - 14 + 1)) + 14; // 14% to 22%
    const minX2ForDepth = Math.ceil((xPct1 * 10 + (dipSlope1 - dipSlope2) * 580 + 80) / 10);
    const minX2 = Math.max(46, minX2ForDepth);
    const maxX2 = 54;
    xPct2 = minX2 <= maxX2 ? Math.floor(Math.random() * (maxX2 - minX2 + 1)) + minX2 : 54;
    if (xPct2 * 10 + dipSlope2 * 580 - (xPct1 * 10 + dipSlope1 * 580) < 60) {
      dipSlope1 = -slopeMag1;
      dipSlope2 = slopeMag2;
    }
  }
  const thresholdHeight1 = parseFloat((Math.random() * 0.4 + 0.15).toFixed(2));
  const leakRate1 = parseFloat((Math.random() * 0.18 + 0.08).toFixed(2));
  const thresholdHeight2 = parseFloat((Math.random() * 0.4 + 0.15).toFixed(2));
  const leakRate2 = parseFloat((Math.random() * 0.18 + 0.08).toFixed(2));
  faultsList.push({
    xPercent: xPct1,
    thresholdHeight: thresholdHeight1,
    leakRate: leakRate1,
    dipSlope: dipSlope1,
    angleDeg: parseFloat(angleDeg1.toFixed(1))
  });
  faultsList.push({
    xPercent: xPct2,
    thresholdHeight: thresholdHeight2,
    leakRate: leakRate2,
    dipSlope: dipSlope2,
    angleDeg: parseFloat(angleDeg2.toFixed(1))
  });
  faultsList.sort((a, b) => a.xPercent - b.xPercent);
  return faultsList;
};

// Procedurally generates realistic, physically bounded random geology for every refresh
const generateRandomGeology = () => {
  const faults = generateRandomizedFaults();

  // 1. Regional structural basin dip slope (0.090 to 0.140) & Reference caprock depth (55px to 67px)
  const dipSlope = parseFloat((0.090 + Math.random() * 0.050).toFixed(3));
  const baseDepth = parseFloat((55 + Math.random() * 12).toFixed(1));

  // 2. Primary Anticline Structural Trap (Amp 17 to 24px, Wavelength 135 to 165px, Phase -15 to +15px)
  const amp1 = parseFloat((17.0 + Math.random() * 7.0).toFixed(1));
  const lambda1 = parseFloat((135 + Math.random() * 30).toFixed(1));
  const phase1 = parseFloat(((Math.random() - 0.5) * 30).toFixed(1));

  // 3. Secondary parasitic fold undulations (Amp 11 to 16px, Wavelength 72 to 88px)
  const amp2 = parseFloat((11.0 + Math.random() * 5.0).toFixed(1));
  const lambda2 = parseFloat((72 + Math.random() * 16).toFixed(1));

  // 4. Micro-topography sub-seismic rugosity (Amp 5 to 8px, Wavelength 40 to 52px)
  const amp3 = parseFloat((5.0 + Math.random() * 3.0).toFixed(1));
  const lambda3 = parseFloat((40 + Math.random() * 12).toFixed(1));

  // 5. Fault throw offset step (13px to 18px)
  const faultThrow = parseFloat((13.0 + Math.random() * 5.0).toFixed(1));

  // 6. Sandstone reservoir bed thickness (175px to 205px)
  const reservoirThickness = parseFloat((175.0 + Math.random() * 30.0).toFixed(1));

  // 7. Sandstone permeability & trapping petrophysics
  const K = parseFloat((1.15 + Math.random() * 0.35).toFixed(2)); // 1.15 to 1.50 D
  const R = parseFloat((0.24 + Math.random() * 0.07).toFixed(2)); // 0.24 to 0.31 Sgr
  const Q = parseFloat((3.40 + Math.random() * 0.60).toFixed(2)); // 3.40 to 4.00

  // 8. Injection well surface location (68% to 72% across the cross-section)
  const wellXPct = 68 + Math.floor(Math.random() * 5); // 68, 69, 70, 71, or 72%
  const wellX = wellXPct * 10;
  const wellCellIdx = Math.round(wellX / 5.0); // cell ~136 to 144

  return {
    faults,
    dipSlope,
    baseDepth,
    amp1,
    lambda1,
    phase1,
    amp2,
    lambda2,
    amp3,
    lambda3,
    faultThrow,
    reservoirThickness,
    K,
    R,
    Q,
    wellXPct,
    wellX,
    wellCellIdx
  };
};
let currentGeology = generateRandomGeology();
const randomizedFaults = currentGeology.faults;

// Base unperturbed caprock profile adapting to current geology
const capRockBaseProfile = (x, depthMultiplier = 1.0, geo = currentGeology) => {
  const g = geo || currentGeology;
  const dip = (g.baseDepth + x * g.dipSlope) * depthMultiplier;
  const wave1 = -g.amp1 * Math.sin((x + g.phase1) * Math.PI / g.lambda1) * depthMultiplier; // Primary anticline
  const wave2 = -g.amp2 * Math.sin(x * Math.PI / g.lambda2) * depthMultiplier; // Secondary fold
  const wave3 = -g.amp3 * Math.sin(x * Math.PI / g.lambda3) * depthMultiplier; // Micro-rugosity
  return dip + wave1 + wave2 + wave3;
};

// Base unperturbed stratum profile for any depthMultiplier and yOffset
const stratumBaseProfile = (x, depthMultiplier = 1.0, yOffset = 0, geo = currentGeology) => {
  return capRockBaseProfile(x, depthMultiplier, geo) + yOffset;
};

// Computes the exact subpixel intersection (x*, y*) of a sloped fault plane with any geological layer at depth
const getStratumFaultIntersection = (f, depthMultiplier = 1.0, yOffset = 0, geo = currentGeology) => {
  const x0 = f.xPercent * 10;
  const slope = f.dipSlope !== undefined ? f.dipSlope : 0.16;
  let x = x0;
  for (let iter = 0; iter < 3; iter++) {
    const y = stratumBaseProfile(x, depthMultiplier, yOffset, geo);
    x = x0 + slope * y;
  }
  const y = stratumBaseProfile(x, depthMultiplier, yOffset, geo);
  return {
    x,
    y,
    x0,
    slope
  };
};

// Computes intersection for caprock specifically (depthMultiplier, yOffset = 0)
const getFaultIntersection = (f, depthMultiplier = 1.0, geo = currentGeology) => {
  return getStratumFaultIntersection(f, depthMultiplier, 0, geo);
};

// Computes the exact elevation of any geological layer displaced along the sloped fault plane
const stratumY = (x, faults = currentGeology.faults, cellIdx = null, depthMultiplier = 1.0, yOffset = 0, geo = currentGeology) => {
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  const base = stratumBaseProfile(x, depthMultiplier, yOffset, g);
  let offset = 0;
  const xReference = cellIdx !== null ? cellIdx * 5.0 + 2.5 : x;
  if (flts) {
    for (let idx = 0; idx < flts.length; idx++) {
      const f = flts[idx];
      const inter = getStratumFaultIntersection(f, depthMultiplier, yOffset, g);
      if (xReference > inter.x) {
        const direction = idx % 2 === 0 ? 1 : -1;
        offset += direction * (g.faultThrow * (depthMultiplier < 0.5 ? 0.4 : 1.0));
      }
    }
  }
  return base + offset;
};

// Interpolates a smooth spline of the cap rock underside profile with sloped fault slips
const capRockY = (x, faults = currentGeology.faults, cellIdx = null, depthMultiplier = 1.0, geo = currentGeology) => {
  return stratumY(x, faults, cellIdx, depthMultiplier, 0, geo);
};

// Numerical PDE Simulator: solves explicit Finite Volume VE equations for CO2 gravity tongue (200-cell high-definition grid)
const precomputeSimulation = (faults = currentGeology.faults, geo = currentGeology) => {
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  const N = 201; // 201 nodes / 200 cells (width dx = 5.0px each from x = 0 to 1000px)
  const history = [];
  let h = new Array(N).fill(0); // plume thickness, initially 0
  let hMax = new Array(N).fill(0); // maximum plume thickness reached

  let h2 = new Array(N).fill(0); // secondary reservoir plume
  let h2Max = new Array(N).fill(0);
  const totalFrames = 1000; // 1000 years of simulation and long-term post-migration trapping
  const substeps = 10;
  const dt = 0.020;
  const K = g.K; // Permeability
  const R = g.R; // Residual trapping coefficient
  const Q = g.Q; // Sustained injection rate
  const wellCell = g.wellCellIdx;
  for (let frame = 0; frame <= totalFrames; frame++) {
    history.push({
      h: [...h],
      hMax: [...hMax],
      h2: [...h2],
      h2Max: [...h2Max]
    });

    // Explicit finite volume flux updates (VE gravity tongue flow)
    for (let step = 0; step < substeps; step++) {
      // --- PRIMARY RESERVOIR (h) ---
      const hMob = new Array(N).fill(0);
      for (let i = 0; i < N; i++) {
        const H = h[i];
        const hm = hMax[i];
        const mobileVal = R < 1.0 ? Math.max(0, (H - R * hm) / (1.0 - R)) : 0;
        hMob[i] = Math.min(H, mobileVal);
      }
      const fluxes = new Array(N - 1).fill(0);
      for (let i = 0; i < N - 1; i++) {
        const ztL = capRockY(i * 5.0, flts, i, 1.0, g) / 15.0;
        const ztR = capRockY((i + 1) * 5.0, flts, i, 1.0, g) / 15.0;
        const zL = ztL + h[i];
        const zR = ztR + h[i + 1];
        const grad = zR - zL;
        const hFace = grad > 0 ? hMob[i + 1] : hMob[i];
        fluxes[i] = -K * hFace * grad;
      }

      // Closed far-field boundaries (preserves CO2 in the regional geological trap)
      const H_res = g.reservoirThickness / 15.0;
      const nextH = [...h];
      for (let i = 0; i < N; i++) {
        const fL = i === 0 ? 0 : fluxes[i - 1];
        const fR = i === N - 1 ? 0 : fluxes[i];
        nextH[i] = Math.max(0, Math.min(H_res, h[i] + dt * (fL - fR)));
      }

      // Fault capillary seal breaching and leakage
      const leaks = new Array(flts.length).fill(0);
      for (let idx = 0; idx < flts.length; idx++) {
        const f = flts[idx];
        const inter1 = getFaultIntersection(f, 1.0, g);
        const cellIdx = Math.round(inter1.x / 5.0);
        const boundedIdx = Math.max(0, Math.min(N - 1, cellIdx));

        // Leakage occurs only if CO2 column height exceeds entry threshold
        if (nextH[boundedIdx] > f.thresholdHeight) {
          const overpressure = nextH[boundedIdx] - f.thresholdHeight;
          const leak = Math.min(overpressure, f.leakRate * dt);
          nextH[boundedIdx] -= leak;
          leaks[idx] = leak;
        }
      }

      // Sustained injection during the first 320 frames centered on wellbore
      if (frame <= 320) {
        if (wellCell >= 2 && wellCell <= N - 3) {
          nextH[wellCell - 2] = Math.min(H_res, nextH[wellCell - 2] + Q * dt * 0.15);
          nextH[wellCell - 1] = Math.min(H_res, nextH[wellCell - 1] + Q * dt * 0.25);
          nextH[wellCell] = Math.min(H_res, nextH[wellCell] + Q * dt * 0.40);
          nextH[wellCell + 1] = Math.min(H_res, nextH[wellCell + 1] + Q * dt * 0.25);
          nextH[wellCell + 2] = Math.min(H_res, nextH[wellCell + 2] + Q * dt * 0.15);
        }
      }
      h = nextH.map(val => Math.max(0, Math.min(H_res, val)));
      for (let i = 0; i < N; i++) {
        if (h[i] > hMax[i]) hMax[i] = Math.min(H_res, h[i]);
      }

      // --- SECONDARY RESERVOIR (h2) ---
      const H_res2 = 60.0 / 15.0; // 4.0 m thickness for shallow layer
      const h2Mob = new Array(N).fill(0);
      for (let i = 0; i < N; i++) {
        const H = h2[i];
        const hm = h2Max[i];
        const mobileVal = R < 1.0 ? Math.max(0, (H - R * hm) / (1.0 - R)) : 0;
        h2Mob[i] = Math.min(H, mobileVal);
      }
      const fluxes2 = new Array(N - 1).fill(0);
      for (let i = 0; i < N - 1; i++) {
        const ztL = capRockY(i * 5.0, flts, i, 0.4, g) / 15.0;
        const ztR = capRockY((i + 1) * 5.0, flts, i, 0.4, g) / 15.0;
        const zL = ztL + h2[i];
        const zR = ztR + h2[i + 1];
        const grad = zR - zL;
        const hFace = grad > 0 ? h2Mob[i + 1] : h2Mob[i];
        fluxes2[i] = -K * hFace * grad;
      }
      const nextH2 = [...h2];
      for (let i = 0; i < N; i++) {
        const fL = i === 0 ? 0 : fluxes2[i - 1];
        const fR = i === N - 1 ? 0 : fluxes2[i];
        nextH2[i] = Math.max(0, Math.min(H_res2, h2[i] + dt * (fL - fR)));
      }

      // Inject leaked mass from primary into secondary fault locations
      for (let idx = 0; idx < flts.length; idx++) {
        const f = flts[idx];
        const inter2 = getFaultIntersection(f, 0.4, g);
        const cellIdx2 = Math.round(inter2.x / 5.0);
        const boundedIdx2 = Math.max(0, Math.min(N - 1, cellIdx2));
        nextH2[boundedIdx2] = Math.min(H_res2, nextH2[boundedIdx2] + leaks[idx] * 1.5);
      }
      h2 = nextH2.map(val => Math.max(0, Math.min(H_res2, val)));
      for (let i = 0; i < N; i++) {
        if (h2[i] > h2Max[i]) h2Max[i] = Math.min(H_res2, h2[i]);
      }
    }
  }
  return history;
};

// Generic node-based smooth polygon builder with exact fault-stepping (200-cell high-definition grid)
const buildSmoothRibbonPath = (topElevationFn, botElevationFn, kStart, kEnd, faults = currentGeology.faults, depthMultiplier = 1.0, geo = currentGeology) => {
  if (kStart > kEnd) return "";
  const dx = 5.0;
  const g = geo || currentGeology;
  const flts = faults || g.faults;

  // 1. Top boundary: left-to-right from kStart to kEnd
  let path = "";
  for (let k = kStart; k <= kEnd; k++) {
    const x = k * dx;
    const isFault = k > 0 && k < 200 && Math.abs(capRockY(x, flts, k - 1, depthMultiplier, g) - capRockY(x, flts, k, depthMultiplier, g)) > 0.1;
    if (k === kStart) {
      const y0 = topElevationFn(k, isFault ? 'right' : 'avg');
      path = `M ${x} ${y0}`;
    } else if (isFault) {
      const yL = topElevationFn(k, 'left');
      const yR = topElevationFn(k, 'right');
      path += ` L ${x} ${yL} L ${x} ${yR}`;
    } else {
      const y = topElevationFn(k, 'avg');
      path += ` L ${x} ${y}`;
    }
  }

  // 2. Bottom boundary: right-to-left from kEnd down to kStart
  for (let k = kEnd; k >= kStart; k--) {
    const x = k * dx;
    const isFault = k > 0 && k < 200 && Math.abs(capRockY(x, flts, k - 1, depthMultiplier, g) - capRockY(x, flts, k, depthMultiplier, g)) > 0.1;
    if (isFault) {
      const yR = botElevationFn(k, 'right');
      const yL = botElevationFn(k, 'left');
      path += ` L ${x} ${yR} L ${x} ${yL}`;
    } else {
      const y = botElevationFn(k, 'avg');
      path += ` L ${x} ${y}`;
    }
  }
  path += " Z";
  return path;
};

// Helper to get continuous node-evaluated height for any cell array
const getNodeValue = (arr, k, side = 'avg') => {
  if (!arr) return 0;
  const N = arr.length;
  if (k <= 0) return arr[0];
  if (k >= N) return arr[N - 1];
  if (side === 'left') return arr[k - 1];
  if (side === 'right') return arr[k];
  return 0.5 * (arr[k - 1] + arr[k]);
};

// Helper to find the active continuous domain with sub-grid zero-tapered tip nodes
const getPlumeActiveBounds = (nodeValueFn, N, eps = 0.001) => {
  let kFirst = -1,
    kLast = -1;
  for (let k = 0; k <= N; k++) {
    const val = nodeValueFn(k);
    if (val > eps) {
      if (kFirst === -1) kFirst = k;
      kLast = k;
    }
  }
  if (kFirst === -1) return null;
  // Extend by 1 node on left and right so plume thickness smoothly tapers to 0.000px
  const kStart = Math.max(0, kFirst - 1);
  const kEnd = Math.min(N, kLast + 1);
  return {
    kStart,
    kEnd
  };
};

// Mobile CO2 plume band path
const getBandPath = (h, fraction = 1.0, depthMultiplier = 1.0, faults = currentGeology.faults, geo = currentGeology) => {
  if (!h) return "";
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  const N = h.length;
  const scale = 15.0;
  const bounds = getPlumeActiveBounds(k => getNodeValue(h, k, 'avg'), N, 0.001);
  if (!bounds) return "";
  return buildSmoothRibbonPath((k, side) => capRockY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, g), (k, side) => {
    const yTop = capRockY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, g);
    const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, depthMultiplier < 0.5 ? 60 : g.reservoirThickness, g);
    return Math.min(yBotMax, yTop + getNodeValue(h, k, side) * fraction * scale);
  }, bounds.kStart, bounds.kEnd, flts, depthMultiplier, g);
};

// Residually trapped CO2 plume band path (from h up to hMax)
const getResidualPath = (h, hMax, depthMultiplier = 1.0, faults = currentGeology.faults, geo = currentGeology) => {
  if (!h || !hMax) return "";
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  const N = h.length;
  const scale = 15.0;
  const bounds = getPlumeActiveBounds(k => {
    const hCur = getNodeValue(h, k, 'avg');
    const hM = getNodeValue(hMax, k, 'avg');
    return Math.max(0, hM - hCur);
  }, N, 0.001);
  if (!bounds) return "";
  return buildSmoothRibbonPath((k, side) => {
    const yTop = capRockY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, g);
    const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, depthMultiplier < 0.5 ? 60 : g.reservoirThickness, g);
    return Math.min(yBotMax, yTop + getNodeValue(h, k, side) * scale);
  }, (k, side) => {
    const yTop = capRockY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, g);
    const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, depthMultiplier < 0.5 ? 60 : g.reservoirThickness, g);
    return Math.min(yBotMax, yTop + getNodeValue(hMax, k, side) * scale);
  }, bounds.kStart, bounds.kEnd, flts, depthMultiplier, g);
};

// Swept Residual Trapped Gas Footprint (hMax)
const getSweptResidualPath = (hMax, depthMultiplier = 1.0, faults = currentGeology.faults, fringeHeight = 4.0, geo = currentGeology) => {
  if (!hMax) return "";
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  const N = hMax.length;
  const scale = 15.0;
  const bounds = getPlumeActiveBounds(k => getNodeValue(hMax, k, 'avg'), N, 0.001);
  if (!bounds) return "";
  return buildSmoothRibbonPath((k, side) => capRockY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, g), (k, side) => {
    const yTop = capRockY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, g);
    const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, depthMultiplier < 0.5 ? 60 : g.reservoirThickness, g);
    const hm = getNodeValue(hMax, k, side);
    const f = fringeHeight * Math.min(1.0, hm * 1.5);
    return Math.min(yBotMax, yTop + hm * scale + f);
  }, bounds.kStart, bounds.kEnd, flts, depthMultiplier, g);
};

// Active Flowing Mobile CO2 Plume (h)
const getActiveMobilePath = (h, depthMultiplier = 1.0, faults = currentGeology.faults, fringeHeight = 5.0, geo = currentGeology) => {
  if (!h) return "";
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  const N = h.length;
  const scale = 15.0;
  const bounds = getPlumeActiveBounds(k => getNodeValue(h, k, 'avg'), N, 0.001);
  if (!bounds) return "";
  return buildSmoothRibbonPath((k, side) => capRockY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, g), (k, side) => {
    const yTop = capRockY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, g);
    const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, depthMultiplier < 0.5 ? 60 : g.reservoirThickness, g);
    const hVal = getNodeValue(h, k, side);
    const f = fringeHeight * Math.min(1.0, hVal * 1.8);
    return Math.min(yBotMax, yTop + hVal * scale + f);
  }, bounds.kStart, bounds.kEnd, flts, depthMultiplier, g);
};

// Meniscus path along active caprock underside
const getMeniscusPath = (h, depthMultiplier = 1.0, faults = currentGeology.faults, geo = currentGeology) => {
  if (!h) return "";
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  const N = h.length;
  const bounds = getPlumeActiveBounds(k => getNodeValue(h, k, 'avg'), N, 0.001);
  if (!bounds) return "";
  let path = "";
  for (let k = bounds.kStart; k <= bounds.kEnd; k++) {
    const x = k * 5.0;
    const isFault = k > 0 && k < 200 && Math.abs(capRockY(x, flts, k - 1, depthMultiplier, g) - capRockY(x, flts, k, depthMultiplier, g)) > 0.1;
    if (k === bounds.kStart) {
      const y0 = capRockY(x, flts, isFault ? k : k, depthMultiplier, g);
      path = `M ${x} ${y0}`;
    } else if (isFault) {
      const yL = capRockY(x, flts, k - 1, depthMultiplier, g);
      const yR = capRockY(x, flts, k, depthMultiplier, g);
      path += ` L ${x} ${yL} L ${x} ${yR}`;
    } else {
      const y = capRockY(x, flts, k, depthMultiplier, g);
      path += ` L ${x} ${y}`;
    }
  }
  return path;
};

// Maximum Historic Gas Saturation Boundary (hMax Swept Footprint Dashed Line)
const getMaxHgLinePath = (hMax, depthMultiplier = 1.0, faults = currentGeology.faults, geo = currentGeology) => {
  if (!hMax) return "";
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  const N = hMax.length;
  const scale = 15.0;
  const bounds = getPlumeActiveBounds(k => getNodeValue(hMax, k, 'avg'), N, 0.001);
  if (!bounds) return "";
  let path = "";
  for (let k = bounds.kStart; k <= bounds.kEnd; k++) {
    const x = k * 5.0;
    const isFault = k > 0 && k < 200 && Math.abs(capRockY(x, flts, k - 1, depthMultiplier, g) - capRockY(x, flts, k, depthMultiplier, g)) > 0.1;
    if (k === bounds.kStart) {
      const yTop = capRockY(x, flts, isFault ? k : k, depthMultiplier, g);
      const yBotMax = stratumY(x, flts, isFault ? k : k, depthMultiplier, depthMultiplier < 0.5 ? 60 : g.reservoirThickness, g);
      const y0 = Math.min(yBotMax, yTop + getNodeValue(hMax, k, isFault ? 'right' : 'avg') * scale);
      path = `M ${x} ${y0}`;
    } else if (isFault) {
      const yTopL = capRockY(x, flts, k - 1, depthMultiplier, g);
      const yBotMaxL = stratumY(x, flts, k - 1, depthMultiplier, depthMultiplier < 0.5 ? 60 : g.reservoirThickness, g);
      const yTopR = capRockY(x, flts, k, depthMultiplier, g);
      const yBotMaxR = stratumY(x, flts, k, depthMultiplier, depthMultiplier < 0.5 ? 60 : g.reservoirThickness, g);
      const yL = Math.min(yBotMaxL, yTopL + getNodeValue(hMax, k, 'left') * scale);
      const yR = Math.min(yBotMaxR, yTopR + getNodeValue(hMax, k, 'right') * scale);
      path += ` L ${x} ${yL} L ${x} ${yR}`;
    } else {
      const yTop = capRockY(x, flts, k, depthMultiplier, g);
      const yBotMax = stratumY(x, flts, k, depthMultiplier, depthMultiplier < 0.5 ? 60 : g.reservoirThickness, g);
      const y = Math.min(yBotMax, yTop + getNodeValue(hMax, k, 'avg') * scale);
      path += ` L ${x} ${y}`;
    }
  }
  return path;
};

// Traces the vertical flow column representing constant buoyant ascent in the wellbore
const getColumnPath = (b, geo = currentGeology) => {
  const g = geo || currentGeology;
  const width = 8 + (5 - b) * 3; // narrower for high sat cores
  const xStart = g.wellX - width / 2;
  const xEnd = g.wellX + width / 2;
  const yStart = capRockY(g.wellX, g.faults, null, 1.0, g); // wellbore meets cap rock underside
  const yEnd = capRockY(g.wellX, g.faults, null, 1.0, g) + 160; // wellbore bottom perforations exactly within reservoir thickness
  return `M ${xStart} ${yStart} L ${xEnd} ${yStart} L ${xEnd} ${yEnd} L ${xStart} ${yEnd} Z`;
};
const SubsurfaceHero = ({
  onNavigate
}) => {
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play on first load to wow visitors
  const [speed, setSpeed] = useState(1);

  // Single unified randomized geology (anticlines, fault throws, layers, petrophysics, well location) generated per page load
  const geology = currentGeology;
  const faults = geology.faults;

  // Precompute the entire physical simulation history (solved in <1ms!) using dynamic geology
  const history = useMemo(() => precomputeSimulation(faults, geology), [faults, geology]);
  const currentFrame = history[Math.round(time)] || history[0];
  const currentH = currentFrame.h;
  const currentHMax = currentFrame.hMax;
  const currentH2 = currentFrame.h2;
  const currentH2Max = currentFrame.h2Max;
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTime(t => {
        if (t >= 1000) {
          return 0; // smooth loop back to Year 0
        }
        return Math.min(1000, t + 1.5 * speed);
      });
    }, 30);
    return () => clearInterval(interval);
  }, [isPlaying, speed]);
  return /*#__PURE__*/React.createElement("section", {
    id: "home",
    style: {
      position: 'relative',
      height: '100vh',
      minHeight: 720,
      overflow: 'hidden',
      color: '#fff',
      fontFamily: "'Montserrat', sans-serif",
      background: '#130d1c'
    }
  }, /*#__PURE__*/React.createElement(Sky, null), /*#__PURE__*/React.createElement(Subsurface, {
    h: currentH,
    hMax: currentHMax,
    faults: faults,
    geology: geology
  }), /*#__PURE__*/React.createElement(Horizon, null), /*#__PURE__*/React.createElement(Identity, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement(Wellhead, {
    geology: geology
  }), /*#__PURE__*/React.createElement(GasFeedAnimation, {
    isPlaying: isPlaying,
    geology: geology
  }), /*#__PURE__*/React.createElement(DepthAxis, null), /*#__PURE__*/React.createElement(Well, {
    faults: faults,
    geology: geology
  }), /*#__PURE__*/React.createElement(Plume, {
    h: currentH,
    hMax: currentHMax,
    h2: currentH2,
    h2Max: currentH2Max,
    time: time,
    isPlaying: isPlaying,
    faults: faults,
    geology: geology
  }), /*#__PURE__*/React.createElement(Annotation, null), /*#__PURE__*/React.createElement(SimulationController, {
    time: time,
    setTime: setTime,
    isPlaying: isPlaying,
    setIsPlaying: setIsPlaying,
    speed: speed,
    setSpeed: setSpeed
  }), /*#__PURE__*/React.createElement(ScrollCue, null));
};

/* =====================================================
   Simulation Controller — floating dashboard
   ===================================================== */
const SimulationController = ({
  time,
  setTime,
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed
}) => {
  const [hovered, setHovered] = useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: {
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
      boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.30), 0 0 25px rgba(100,255,218,0.22), inset 0 1px 0 rgba(255,255,255,0.30)' : '0 8px 32px rgba(0,0,0,0.25), 0 0 15px rgba(100,255,218,0.12), inset 0 1px 0 rgba(255,255,255,0.25)',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      transition: 'all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
      transform: hovered ? 'translateY(-4px)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: isPlaying ? '#64ffda' : 'rgba(255,255,255,0.4)',
      boxShadow: isPlaying ? '0 0 8px #64ffda' : 'none',
      animation: isPlaying ? 'twinkle 1.5s ease-in-out infinite' : 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9.5,
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.70)',
      fontWeight: 600
    }
  }, "Simulation Status")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      fontFamily: 'ui-monospace, monospace',
      color: '#64ffda',
      fontWeight: 600
    }
  }, "Year ", Math.round(time), " / 1000")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setIsPlaying(!isPlaying),
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isPlaying ? 'rgba(100,255,218,0.18)' : 'rgba(255,255,255,0.12)',
      border: `1px solid ${isPlaying ? '#64ffda' : 'rgba(255,255,255,0.25)'}`,
      color: isPlaying ? '#64ffda' : '#fff',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      outline: 'none'
    },
    title: isPlaying ? "Pause" : "Play Simulation"
  }, /*#__PURE__*/React.createElement("i", {
    className: isPlaying ? "fas fa-pause" : "fas fa-play",
    style: {
      fontSize: 12,
      marginLeft: isPlaying ? 0 : 2
    }
  })), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0",
    max: "1000",
    step: "1",
    value: time,
    onChange: e => {
      setTime(parseFloat(e.target.value));
      setIsPlaying(false); // Pause on scrub
    },
    style: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      background: 'rgba(255,255,255,0.20)',
      outline: 'none',
      cursor: 'pointer',
      accentColor: '#64ffda'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setTime(0);
      setIsPlaying(false);
    },
    style: {
      width: 30,
      height: 30,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.20)',
      color: 'rgba(255,255,255,0.7)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      outline: 'none'
    },
    title: "Reset Simulation"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-redo",
    style: {
      fontSize: 10
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSpeed(s => s === 1 ? 2 : s === 2 ? 4 : 1),
    style: {
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
      outline: 'none'
    },
    title: "Toggle Simulation Speed"
  }, speed, "x")));
};

/* =====================================================
   Sky — top 42vh: warm-violet gradient + a sprinkling of stars
   ===================================================== */
const Sky = () => {
  const stars = useMemo(() => Array.from({
    length: 36
  }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 38,
    s: 0.5 + Math.random() * 1.4,
    o: 0.25 + Math.random() * 0.55,
    d: Math.random() * 6
  })), []);
  const co2Dots = useMemo(() => Array.from({
    length: 14
  }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 38,
    s: 1.0 + Math.random() * 1.6,
    o: 0.35 + Math.random() * 0.50,
    d: Math.random() * 6
  })), []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: '42vh',
      background: 'linear-gradient(180deg, #16101f 0%, #1e1936 50%, #211d34 100%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: '42vh',
      background: 'radial-gradient(circle at 22% 28%, rgba(120,119,198,0.20) 0%, transparent 45%), ' + 'radial-gradient(circle at 84% 14%, rgba(255,119,178,0.13) 0%, transparent 38%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("svg", {
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '42vh',
      pointerEvents: 'none'
    },
    "aria-hidden": "true"
  }, stars.map((s, i) => /*#__PURE__*/React.createElement("circle", {
    key: `s-${i}`,
    cx: `${s.x}%`,
    cy: `${s.y}%`,
    r: s.s,
    fill: "#cdeaf0",
    style: {
      opacity: s.o,
      animation: `twinkle 4.2s ease-in-out ${s.d}s infinite`
    }
  })), co2Dots.map((g, i) => /*#__PURE__*/React.createElement("circle", {
    key: `g-${i}`,
    cx: `${g.x}%`,
    cy: `${g.y}%`,
    r: g.s,
    fill: "#0dfca2",
    style: {
      opacity: g.o,
      animation: `twinkle 3.2s ease-in-out ${g.d}s infinite`,
      filter: 'drop-shadow(0 0 2px rgba(13,252,162,0.65))'
    }
  }))));
};

/* =====================================================
   Horizon — dashed mint line at 42vh
   ===================================================== */
const Horizon = () => /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '42vh',
    height: 0,
    borderTop: '1px dashed rgba(100,255,218,0.55)',
    boxShadow: '0 0 8px rgba(100,255,218,0.30)',
    zIndex: 4,
    pointerEvents: 'none'
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    position: 'absolute',
    right: 28,
    top: -22,
    fontSize: 10,
    letterSpacing: '0.20em',
    textTransform: 'uppercase',
    color: 'rgba(100,255,218,0.85)',
    fontWeight: 600,
    fontFamily: 'ui-monospace, Menlo, monospace'
  }
}, "Surface \xB7 0\xA0m"));

/* =====================================================
   Subsurface — SVG cross-section with anticline cap rock,
   reservoir and aquifer. 42vh → 100vh.
   ===================================================== */
const getCapRockPath = (faults = currentGeology.faults, geo = currentGeology) => {
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  let path = `M 0 ${capRockY(0, flts, 0, 1.0, g)}`;
  for (let i = 0; i < 200; i++) {
    const x1 = i * 5.0;
    const x2 = (i + 1) * 5.0;
    const y1 = capRockY(x1, flts, i, 1.0, g);
    const y2 = capRockY(x2, flts, i, 1.0, g);
    path += ` L ${x1} ${y1} L ${x2} ${y2}`;
  }
  return path;
};
const getCapRockFillPath = (faults = currentGeology.faults, geo = currentGeology) => {
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  let path = `M 0 0 L 1000 0`;
  for (let i = 199; i >= 0; i--) {
    const x1 = i * 5.0;
    const x2 = (i + 1) * 5.0;
    const yRight = capRockY(x2, flts, i, 1.0, g);
    const yLeft = capRockY(x1, flts, i, 1.0, g);
    path += ` L ${x2} ${yRight} L ${x1} ${yLeft}`;
  }
  path += " Z";
  return path;
};
const CAP_ROCK_UNDERSIDE = getCapRockPath();
const CAP_ROCK_FILL = getCapRockFillPath();
const getAquiferPath = (faults = currentGeology.faults, geo = currentGeology) => {
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  let path = `M 0 580 L 1000 580`;
  for (let i = 199; i >= 0; i--) {
    const x1 = i * 5.0;
    const x2 = (i + 1) * 5.0;
    const yRight = stratumY(x2, flts, i, 1.0, g.reservoirThickness, g);
    const yLeft = stratumY(x1, flts, i, 1.0, g.reservoirThickness, g);
    path += ` L ${x2} ${yRight} L ${x1} ${yLeft}`;
  }
  path += " Z";
  return path;
};

// Generates continuous strata layer polygons with displacement aligned to the sloped fault plane at each depth (200-cell resolution)
const getStrataPath = (faults = currentGeology.faults, depthMultiplier = 1.0, yOffset = 0, yBase = 0, isAquifer = false, geo = currentGeology) => {
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  let path = isAquifer ? `M 0 580 L 1000 580` : `M 0 ${yBase} L 1000 ${yBase}`;
  for (let i = 199; i >= 0; i--) {
    const x1 = i * 5.0;
    const x2 = (i + 1) * 5.0;
    const yCap2 = stratumY(x2, flts, i, depthMultiplier, yOffset, g);
    const yCap1 = stratumY(x1, flts, i, depthMultiplier, yOffset, g);
    path += ` L ${x2} ${yCap2} L ${x1} ${yCap1}`;
  }
  path += " Z";
  return path;
};

// Conforming finite volume columns for the reservoir grid block visualization (200 high-definition cells)
const ReservoirGrid = ({
  h,
  hMax,
  faults,
  geology
}) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  const scale = 15.0; // matching scale factor of the plume
  const N = 200;

  // Precompute smooth fluid depths across all cells
  const effH = useMemo(() => {
    const arr = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      const hCur = h ? h[i] : 0;
      const hM = hMax ? hMax[i] : 0;
      arr[i] = Math.max(hCur, hM);
    }
    return arr;
  }, [h, hMax]);

  // 1. Single continuous seamless Brine Fluid polygon across entire reservoir
  const brinePath = useMemo(() => {
    let path = `M 0 ${stratumY(0, flts, 0, 1.0, g.reservoirThickness, g)}`;
    // Trace reservoir bottom left-to-right
    for (let i = 0; i < N; i++) {
      const x1 = i * 5.0;
      const x2 = (i + 1) * 5.0;
      const yb2 = stratumY(x2, flts, i, 1.0, g.reservoirThickness, g);
      path += ` L ${x2} ${yb2}`;
    }
    // Trace continuous top fluid interface right-to-left
    for (let i = N - 1; i >= 0; i--) {
      const x1 = i * 5.0;
      const x2 = (i + 1) * 5.0;
      const yt1 = capRockY(x1, flts, i, 1.0, g);
      const yt2 = capRockY(x2, flts, i, 1.0, g);
      const yb1 = stratumY(x1, flts, i, 1.0, g.reservoirThickness, g);
      const yb2 = stratumY(x2, flts, i, 1.0, g.reservoirThickness, g);
      const hLeft = i === 0 ? effH[0] : 0.5 * (effH[i - 1] + effH[i]);
      const hRight = i === N - 1 ? effH[N - 1] : 0.5 * (effH[i] + effH[i + 1]);

      // Capillary fringe extends fluid zone (crisp, subtle 4px)
      const fLeft = 4.0 * Math.min(1.0, hLeft * 1.8);
      const fRight = 4.0 * Math.min(1.0, hRight * 1.8);
      const yFluid1 = Math.min(yb1, yt1 + hLeft * scale + fLeft);
      const yFluid2 = Math.min(yb2, yt2 + hRight * scale + fRight);
      if (i === N - 1) {
        path += ` L ${x2} ${yFluid2}`;
      }
      if (i > 0) {
        const yCapLeft = capRockY(x1, flts, i - 1, 1.0, g);
        const yCapRight = yt1;
        if (Math.abs(yCapLeft - yCapRight) > 0.1) {
          const hPrev = 0.5 * (effH[i - 1] + (i > 1 ? effH[i - 2] : effH[0]));
          const fPrev = 4.0 * Math.min(1.0, hPrev * 1.8);
          const ybPrev = stratumY(x1, flts, i - 1, 1.0, g.reservoirThickness, g);
          const yFluidPrev = Math.min(ybPrev, yCapLeft + hPrev * scale + fPrev);
          path += ` L ${x1} ${yFluid1} L ${x1} ${yFluidPrev}`;
        } else {
          path += ` L ${x1} ${yFluid1}`;
        }
      } else {
        path += ` L ${x1} ${yFluid1}`;
      }
    }
    path += " Z";
    return path;
  }, [effH, flts, g]);

  // Sandstone block columns (stroke="none" eliminates dark vertical stripes)
  const cols = [];
  for (let i = 0; i < N; i++) {
    const x1 = i * 5.0;
    const x2 = (i + 1) * 5.0;
    const yt1 = capRockY(x1, flts, i, 1.0, g);
    const yt2 = capRockY(x2, flts, i, 1.0, g);
    const yb1 = stratumY(x1, flts, i, 1.0, g.reservoirThickness, g);
    const yb2 = stratumY(x2, flts, i, 1.0, g.reservoirThickness, g);
    const permHash = 0.55 + 0.45 * Math.sin(i * 14.3 + 2.1);
    const r = Math.floor(33 + permHash * 14);
    const gCol = Math.floor(24 + permHash * 8);
    const b = Math.floor(18 + permHash * 6);
    const blockFill = `rgb(${r}, ${gCol}, ${b})`;
    cols.push( /*#__PURE__*/React.createElement("polygon", {
      key: i,
      points: `${x1},${yt1} ${x2},${yt2} ${x2},${yb2} ${x1},${yb1}`,
      fill: blockFill,
      stroke: "none"
    }));
  }
  return /*#__PURE__*/React.createElement("g", null, cols, /*#__PURE__*/React.createElement("path", {
    d: brinePath,
    fill: "url(#grad-aquifer-v2)",
    opacity: "0.88"
  }));
};

// Conforming vertical grid lines for the cap rock stratum (200 cells)
const CapRockGrid = ({
  faults,
  geology
}) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  const lines = [];
  for (let i = 1; i < 200; i++) {
    const x = i * 5.0;
    const yTop = 0;
    const yBot = capRockY(x, flts, i, 1.0, g);
    lines.push( /*#__PURE__*/React.createElement("line", {
      key: i,
      x1: x,
      y1: yTop,
      x2: x,
      y2: yBot,
      stroke: "rgba(255,255,255,0.015)",
      strokeWidth: "0.5"
    }));
  }
  return /*#__PURE__*/React.createElement("g", null, lines);
};

// Depth axis — clean ticks on the left margin
const DepthAxis = () => {
  const ticks = [{
    top: '42vh',
    label: '0 m'
  }, {
    top: '54vh',
    label: '–1200 m'
  }, {
    top: '70vh',
    label: '–1800 m'
  }, {
    top: '88vh',
    label: '–2400 m'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 16,
      top: 0,
      bottom: 0,
      width: 90,
      zIndex: 4,
      pointerEvents: 'none',
      fontFamily: 'ui-monospace, Menlo, monospace'
    }
  }, ticks.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: 'absolute',
      top: t.top,
      left: 0,
      transform: 'translateY(-50%)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 12,
      height: 1.5,
      background: 'rgba(100,255,218,0.75)',
      boxShadow: '0 0 4px rgba(100,255,218,0.4)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.85)',
      fontWeight: 500,
      textShadow: '0 1px 4px rgba(0,0,0,0.8)'
    }
  }, t.label)))));
};

// Captured CO2 gas feed animation above the wellhead
const GasFeedAnimation = ({
  isPlaying,
  geology
}) => {
  const g = geology || currentGeology;
  const bubbles = useMemo(() => Array.from({
    length: 12
  }, (_, i) => ({
    id: i,
    left: `${g.wellXPct + (Math.random() - 0.5) * 1.2}%`,
    delay: i * 0.45,
    size: 2 + Math.random() * 3.5,
    duration: 2.2 + Math.random() * 1.2
  })), [g.wellXPct]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: '42vh',
      pointerEvents: 'none',
      zIndex: 6
    }
  }, bubbles.map(b => /*#__PURE__*/React.createElement("div", {
    key: b.id,
    style: {
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
      animationPlayState: isPlaying ? 'running' : 'paused'
    }
  })));
};
const Subsurface = ({
  h,
  hMax,
  faults,
  geology
}) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  const AQUIFER_PATH = useMemo(() => getAquiferPath(flts, g), [flts, g]);
  const CAP_ROCK_FILL = useMemo(() => getCapRockFillPath(flts, g), [flts, g]);
  const CAP_ROCK_UNDERSIDE = useMemo(() => getCapRockPath(flts, g), [flts, g]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("svg", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: '42vh',
      width: '100%',
      height: '58vh',
      pointerEvents: 'none'
    },
    viewBox: "0 0 1000 580",
    preserveAspectRatio: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "grad-cap-v2",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#2b2336"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#1c1623"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "grad-aquifer-v2",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#0f3460",
    stopOpacity: "0.80"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#0a1931",
    stopOpacity: "0.95"
  }))), /*#__PURE__*/React.createElement("path", {
    d: CAP_ROCK_FILL,
    fill: "url(#grad-cap-v2)"
  }), /*#__PURE__*/React.createElement("path", {
    d: getStrataPath(flts, 0.85, 0, 0, false, g),
    fill: "rgba(0,0,0,0.15)"
  }), /*#__PURE__*/React.createElement("path", {
    d: getStrataPath(flts, 0.40, 0, 0, false, g),
    fill: "rgba(0,0,0,0.25)"
  }), /*#__PURE__*/React.createElement("path", {
    d: getStrataPath(flts, 0.15, 0, 0, false, g),
    fill: "rgba(0,0,0,0.35)"
  }), /*#__PURE__*/React.createElement(CapRockGrid, {
    faults: flts,
    geology: g
  }), /*#__PURE__*/React.createElement(ReservoirGrid, {
    h: h,
    hMax: hMax,
    faults: flts,
    geology: g
  }), /*#__PURE__*/React.createElement("path", {
    d: AQUIFER_PATH,
    fill: "url(#grad-aquifer-v2)"
  }), /*#__PURE__*/React.createElement("path", {
    d: getStrataPath(flts, 1.0, g.reservoirThickness + 80, 580, true, g),
    fill: "rgba(0,0,0,0.20)"
  }), /*#__PURE__*/React.createElement("path", {
    d: getStrataPath(flts, 1.0, g.reservoirThickness + 170, 580, true, g),
    fill: "rgba(0,0,0,0.35)"
  }), /*#__PURE__*/React.createElement("path", {
    d: getStrataPath(flts, 1.0, g.reservoirThickness + 260, 580, true, g),
    fill: "rgba(0,0,0,0.50)"
  }), /*#__PURE__*/React.createElement("path", {
    d: `M 0 ${stratumY(0, flts, 0, 1.0, g.reservoirThickness, g)} ` + Array.from({
      length: 200
    }, (_, i) => `L ${(i + 1) * 5.0} ${stratumY((i + 1) * 5.0, flts, i, 1.0, g.reservoirThickness, g)}`).join(" "),
    stroke: "rgba(0,0,0,0.35)",
    strokeWidth: "1.2",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: CAP_ROCK_UNDERSIDE,
    stroke: "rgba(168,237,234,0.22)",
    strokeWidth: "0.8",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: CAP_ROCK_UNDERSIDE,
    stroke: "rgba(168,237,234,0.10)",
    strokeWidth: "2",
    fill: "none",
    style: {
      filter: 'blur(1.2px)'
    }
  }), /*#__PURE__*/React.createElement("line", {
    x1: "0",
    y1: "0",
    x2: "1000",
    y2: "0",
    stroke: "rgba(255,255,255,0.12)",
    strokeWidth: "0.6"
  })), [{
    top: 'calc(42vh + 8px)',
    label: 'Cap rock'
  }, {
    top: 'calc(58vh + 8px)',
    label: 'Reservoir'
  }, {
    top: 'calc(88vh + 8px)',
    label: 'Aquifer'
  }].map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      position: 'absolute',
      right: 18,
      top: s.top,
      fontSize: 9.5,
      letterSpacing: '0.20em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.88)',
      fontWeight: 600,
      fontFamily: 'ui-monospace, Menlo, monospace',
      pointerEvents: 'none',
      zIndex: 5,
      textShadow: '0 1px 4px rgba(0,0,0,0.8)'
    }
  }, s.label)));
};

// Wellhead — small structure above the horizon
const Wellhead = ({
  geology
}) => {
  const g = geology || currentGeology;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: `${g.wellXPct}%`,
      top: 'calc(42vh - 36px)',
      width: 50,
      height: 36,
      transform: 'translateX(-50%)',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 15,
      width: 20,
      height: 6,
      background: '#444',
      borderRadius: 1,
      border: '1px solid #666'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 6,
      left: 22,
      width: 6,
      height: 22,
      background: 'linear-gradient(90deg, #333, #aaa, #333)',
      borderLeft: '1px solid #555'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 16,
      left: 16,
      width: 18,
      height: 8,
      background: '#222',
      borderRadius: 2,
      border: '1px solid #0dfca2'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 18,
      left: 8,
      width: 8,
      height: 4,
      background: '#aaa',
      borderRadius: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 28,
      left: 20,
      width: 10,
      height: 5,
      background: 'radial-gradient(circle, #fff, #555)',
      borderRadius: '50%',
      border: '1px solid #888'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 23,
      top: 12,
      width: 4,
      height: 4,
      borderRadius: '50%',
      background: '#0dfca2',
      boxShadow: '0 0 6px #0dfca2',
      animation: 'twinkle 1s ease-in-out infinite'
    }
  })));
};

// Well — vertical tubing from horizon down through reservoir
// Dynamic height constraints ensure it never extends below the reservoir bottom perforations
const Well = ({
  faults,
  geology
}) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  const yBotVal = capRockY(g.wellX, flts, null, 1.0, g) + 160;
  const heightVh = `${yBotVal * 0.1}vh`;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: `${g.wellXPct}%`,
      top: '42vh',
      width: 10,
      height: heightVh,
      transform: 'translateX(-50%)',
      zIndex: 3,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(90deg, #111 0%, #aaa 25%, #fff 50%, #444 75%, #111 100%)',
      borderLeft: '1px solid rgba(255,255,255,0.2)',
      borderRight: '1px solid rgba(255,255,255,0.2)',
      opacity: 0.85
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 3,
      right: 3,
      top: 0,
      bottom: 0,
      background: 'linear-gradient(90deg, rgba(13,252,162,0.1) 0%, rgba(13,252,162,0.6) 50%, rgba(13,252,162,0.1) 100%)',
      boxShadow: '0 0 10px rgba(13,252,162,0.4)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: -3,
      right: -3,
      bottom: 10,
      height: 18,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }
  }, [1, 2, 3].map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      height: 2,
      background: '#0dfca2',
      boxShadow: '0 0 6px #0dfca2'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      bottom: -4,
      transform: 'translateX(-50%)',
      width: 26,
      height: 26,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(168,237,234,0.85) 0%, rgba(100,255,218,0.30) 45%, transparent 75%)',
      filter: 'blur(2px)',
      animation: 'pulseFlare 2.6s ease-in-out infinite'
    }
  }));
};

// Streamlines — gentle curves flowing through the reservoir
// Refactored to dynamically trace caprock-parallel contours
const Streamlines = ({
  isPlaying,
  faults,
  geology
}) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  // 3 left-migrating streamlines
  const leftPaths = [35, 75, 115].map(d => {
    let path = `M ${g.wellX} ${capRockY(g.wellX, flts, null, 1.0, g) + d}`;
    for (let x = g.wellX - 10; x >= 0; x -= 10) {
      path += ` L ${x} ${capRockY(x, flts, null, 1.0, g) + d}`;
    }
    return path;
  });

  // 3 right-migrating streamlines
  const rightPaths = [35, 75, 115].map(d => {
    let path = `M ${g.wellX} ${capRockY(g.wellX, flts, null, 1.0, g) + d}`;
    for (let x = g.wellX + 10; x <= 1000; x += 10) {
      path += ` L ${x} ${capRockY(x, flts, null, 1.0, g) + d}`;
    }
    return path;
  });
  return /*#__PURE__*/React.createElement("svg", {
    style: {
      position: 'absolute',
      left: 0,
      top: '42vh',
      width: '100%',
      height: '58vh',
      zIndex: 2,
      pointerEvents: 'none'
    },
    viewBox: "0 0 1000 580",
    preserveAspectRatio: "none",
    "aria-hidden": "true"
  }, leftPaths.map((d, i) => /*#__PURE__*/React.createElement("path", {
    key: `l-${i}`,
    d: d,
    stroke: "rgba(100,255,218,0.18)",
    strokeWidth: "0.8",
    strokeDasharray: "2 12",
    fill: "none",
    style: {
      animation: `flow-reverse ${8 + i * 1.2}s linear infinite`,
      animationPlayState: isPlaying ? 'running' : 'paused'
    }
  })), rightPaths.map((d, i) => /*#__PURE__*/React.createElement("path", {
    key: `r-${i}`,
    d: d,
    stroke: "rgba(100,255,218,0.18)",
    strokeWidth: "0.8",
    strokeDasharray: "2 12",
    fill: "none",
    style: {
      animation: `flow ${8 + i * 1.2}s linear infinite`,
      animationPlayState: isPlaying ? 'running' : 'paused'
    }
  })));
};

/* =====================================================
   Simulation cells — sparse pulsing grid, only in reservoir
   ===================================================== */
const SimCells = ({
  isPlaying
}) => {
  const cells = useMemo(() => {
    const arr = [];
    const rows = 4,
      cols = 18;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 6 + c * 5.2; // % across viewport
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
          duration: 2.4 + Math.random() * 2
        });
      }
    }
    return arr;
  }, []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, cells.map((c, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      position: 'absolute',
      left: c.left,
      top: c.top,
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: '#64ffda',
      opacity: 0.18,
      boxShadow: '0 0 6px rgba(100,255,218,0.45)',
      animation: `cellPulse ${c.duration}s ease-in-out ${c.delay}s infinite`,
      animationPlayState: isPlaying ? 'running' : 'paused',
      zIndex: 2,
      pointerEvents: 'none'
    }
  })));
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
const PLUME_B1 = "M 380 156 " + "C 420 168, 460 170, 510 172 " + "C 550 168, 585 156, 615 140 " + "C 640 112, 660 80, 680 52 " + "C 695 38, 710 36, 728 38 " + "C 745 58, 765 90, 785 122 " + "C 810 140, 840 152, 880 162 " + "C 920 156, 960 148, 960 152 " + "C 900 180, 800 190, 722 190 " + "C 720 252, 714 342, 708 410 L 692 410 " + "C 686 342, 680 252, 678 190 " + "C 600 190, 480 180, 380 156 Z";

// Band 2: mid saturation (sw ≈ 0.3)
const PLUME_B2 = "M 470 168 " + "C 500 168, 530 160, 555 148 " + "C 590 124, 625 92, 660 64 " + "C 678 48, 694 42, 710 40 " + "C 728 44, 745 64, 760 88 " + "C 778 115, 800 138, 825 152 " + "C 855 165, 890 172, 920 175 " + "C 860 182, 800 186, 718 186 " + "C 716 248, 710 338, 706 405 L 694 405 " + "C 690 338, 684 248, 682 186 " + "C 620 186, 540 182, 470 168 Z";

// Band 3: high saturation (sw ≈ 0.5)
const PLUME_B3 = "M 555 166 " + "C 580 158, 605 145, 625 125 " + "C 650 95, 675 65, 695 50 " + "C 712 46, 725 50, 738 64 " + "C 755 86, 775 115, 800 138 " + "C 825 155, 855 168, 885 175 " + "C 820 180, 770 182, 716 182 " + "C 714 244, 710 330, 705 400 L 695 400 " + "C 690 330, 686 244, 684 182 " + "C 640 182, 600 180, 555 166 Z";

// Band 4: very high saturation (sw ≈ 0.7)
const PLUME_B4 = "M 630 166 " + "C 650 154, 670 132, 685 105 " + "C 698 74, 708 52, 712 46 " + "C 725 50, 740 72, 758 98 " + "C 778 123, 800 146, 830 160 " + "C 850 170, 870 174, 885 176 " + "C 830 178, 780 178, 714 178 " + "C 712 238, 708 320, 704 395 L 696 395 " + "C 692 320, 688 238, 686 178 " + "C 660 178, 645 174, 630 166 Z";

// Band 5: peak core (sw ≈ 0.85+, near-saturated CO2)
const PLUME_B5 = "M 695 38 C 705 38, 716 46, 718 56 C 720 96, 716 200, 710 393 L 690 393 C 684 200, 680 96, 682 56 C 684 46, 690 38, 695 38 Z";
const Plume = ({
  h,
  hMax,
  h2,
  h2Max,
  time,
  isPlaying,
  faults = [],
  geology
}) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  const CAP_ROCK_PATH = useMemo(() => getCapRockPath(flts, g), [flts, g]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("svg", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: '42vh',
      width: '100%',
      height: '58vh',
      zIndex: 4,
      pointerEvents: 'none',
      overflow: 'visible'
    },
    viewBox: "0 0 1000 580",
    preserveAspectRatio: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
    id: "below-caprock"
  }, /*#__PURE__*/React.createElement("path", {
    d: `${CAP_ROCK_PATH} L 1000 580 L 0 580 Z`
  })), /*#__PURE__*/React.createElement("clipPath", {
    id: "below-shallow-caprock"
  }, /*#__PURE__*/React.createElement("path", {
    d: `M 0 ${capRockY(0, flts, null, 0.4, g)} ${Array.from({
      length: 200
    }, (_, i) => `L ${(i + 1) * 5.0} ${capRockY((i + 1) * 5.0, flts, null, 0.4, g)}`).join(' ')} L 1000 580 L 0 580 Z`
  })), /*#__PURE__*/React.createElement("filter", {
    id: "band-soften",
    x: "-10%",
    y: "-10%",
    width: "120%",
    height: "120%"
  }, /*#__PURE__*/React.createElement("feGaussianBlur", {
    stdDeviation: "1.5"
  })), /*#__PURE__*/React.createElement("filter", {
    id: "plume-diffuse-blur",
    x: "-15%",
    y: "-15%",
    width: "130%",
    height: "130%"
  }, /*#__PURE__*/React.createElement("feGaussianBlur", {
    stdDeviation: "2.5"
  })), /*#__PURE__*/React.createElement("filter", {
    id: "plume-glow",
    x: "-20%",
    y: "-20%",
    width: "140%",
    height: "140%"
  }, /*#__PURE__*/React.createElement("feGaussianBlur", {
    stdDeviation: "6"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "active-mobile-grad",
    x1: "0%",
    y1: "0%",
    x2: "0%",
    y2: "100%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#0dfca2",
    stopOpacity: "0.98"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "45%",
    stopColor: "#0dfca2",
    stopOpacity: "0.95"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "70%",
    stopColor: "#05e67c",
    stopOpacity: "0.92"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "88%",
    stopColor: "#20c997",
    stopOpacity: "0.90"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#1a8e8f",
    stopOpacity: "0.85"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "residual-trapped-grad",
    x1: "0%",
    y1: "0%",
    x2: "0%",
    y2: "100%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#20c997",
    stopOpacity: "0.85"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "40%",
    stopColor: "#20c997",
    stopOpacity: "0.75"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "75%",
    stopColor: "#1a8e8f",
    stopOpacity: "0.65"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "92%",
    stopColor: "#125672",
    stopOpacity: "0.45"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#0a2a4d",
    stopOpacity: "0.25"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "co2-glow-grad",
    x1: "0%",
    y1: "0%",
    x2: "0%",
    y2: "100%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#0dfca2",
    stopOpacity: "0.60"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#00b05b",
    stopOpacity: "0.05"
  }))), /*#__PURE__*/React.createElement("g", {
    clipPath: "url(#below-caprock)"
  }, hMax && getSweptResidualPath(hMax, 1.0, flts, 16.0, g) && /*#__PURE__*/React.createElement("path", {
    d: getSweptResidualPath(hMax, 1.0, flts, 16.0, g),
    fill: "url(#co2-glow-grad)",
    filter: "url(#plume-glow)",
    style: {
      animation: 'plumePulse 4s ease-in-out infinite',
      animationPlayState: isPlaying ? 'running' : 'paused',
      transformOrigin: '50% 30%'
    }
  }), hMax && getSweptResidualPath(hMax, 1.0, flts, 4.0, g) && /*#__PURE__*/React.createElement("path", {
    d: getSweptResidualPath(hMax, 1.0, flts, 4.0, g),
    fill: "url(#residual-trapped-grad)",
    filter: "url(#plume-diffuse-blur)",
    opacity: "0.95"
  }), h && getActiveMobilePath(h, 1.0, flts, 5.0, g) && /*#__PURE__*/React.createElement("path", {
    d: getActiveMobilePath(h, 1.0, flts, 5.0, g),
    fill: "url(#active-mobile-grad)",
    filter: "url(#plume-diffuse-blur)",
    opacity: "0.98"
  }), h && getBandPath(h, 0.50, 1.0, flts, g) && /*#__PURE__*/React.createElement("path", {
    d: getBandPath(h, 0.50, 1.0, flts, g),
    fill: "#0dfca2",
    opacity: "0.25",
    filter: "url(#band-soften)"
  }), hMax && getMaxHgLinePath(hMax, 1.0, flts, g) && /*#__PURE__*/React.createElement("path", {
    d: getMaxHgLinePath(hMax, 1.0, flts, g),
    fill: "none",
    stroke: "#64ffda",
    strokeWidth: "1.4",
    strokeDasharray: "5 3.5",
    opacity: "0.85"
  }), getMeniscusPath(h || hMax, 1.0, flts, g) && /*#__PURE__*/React.createElement("path", {
    d: getMeniscusPath(h || hMax, 1.0, flts, g),
    stroke: "rgba(255,255,255,0.45)",
    strokeWidth: "0.6",
    fill: "none"
  })), /*#__PURE__*/React.createElement("g", {
    clipPath: "url(#below-shallow-caprock)"
  }, h2Max && getSweptResidualPath(h2Max, 0.4, flts, 8.0, g) && /*#__PURE__*/React.createElement("path", {
    d: getSweptResidualPath(h2Max, 0.4, flts, 8.0, g),
    fill: "url(#co2-glow-grad)",
    filter: "url(#plume-glow)",
    style: {
      animation: 'plumePulse 4s ease-in-out infinite',
      animationPlayState: isPlaying ? 'running' : 'paused',
      transformOrigin: '50% 30%'
    }
  }), h2Max && getSweptResidualPath(h2Max, 0.4, flts, 2.0, g) && /*#__PURE__*/React.createElement("path", {
    d: getSweptResidualPath(h2Max, 0.4, flts, 2.0, g),
    fill: "url(#residual-trapped-grad)",
    filter: "url(#plume-diffuse-blur)",
    opacity: "0.92"
  }), h2 && getActiveMobilePath(h2, 0.4, flts, 2.5, g) && /*#__PURE__*/React.createElement("path", {
    d: getActiveMobilePath(h2, 0.4, flts, 2.5, g),
    fill: "url(#active-mobile-grad)",
    filter: "url(#plume-diffuse-blur)",
    opacity: "0.96"
  }), h2Max && getMaxHgLinePath(h2Max, 0.4, flts, g) && /*#__PURE__*/React.createElement("path", {
    d: getMaxHgLinePath(h2Max, 0.4, flts, g),
    fill: "none",
    stroke: "#64ffda",
    strokeWidth: "1.2",
    strokeDasharray: "4 3",
    opacity: "0.80"
  }), h2 && getMeniscusPath(h2, 0.4, flts, g) && /*#__PURE__*/React.createElement("path", {
    d: getMeniscusPath(h2, 0.4, flts, g),
    stroke: "rgba(255,255,255,0.45)",
    strokeWidth: "0.6",
    fill: "none"
  })), /*#__PURE__*/React.createElement("g", {
    clipPath: "url(#below-caprock)"
  }, [{
    x: 500,
    delay: 0.0,
    activeTime: 40
  }, {
    x: 560,
    delay: 1.2,
    activeTime: 25
  }, {
    x: 620,
    delay: 0.4,
    activeTime: 12
  }, {
    x: 790,
    delay: 0.8,
    activeTime: 15
  }, {
    x: 850,
    delay: 1.6,
    activeTime: 32
  }, {
    x: 920,
    delay: 0.2,
    activeTime: 55
  }].map((d, i) => {
    if (time < d.activeTime) return null;
    return /*#__PURE__*/React.createElement("circle", {
      key: `d${i}`,
      cx: d.x,
      cy: "200",
      r: "1.2",
      fill: "#0dfca2",
      style: {
        opacity: 0,
        animation: `fingerDrip 6s linear ${d.delay}s infinite`,
        animationPlayState: isPlaying ? 'running' : 'paused'
      }
    });
  })), flts.map((f, idx) => {
    const x0 = f.xPercent * 10;
    const slope = f.dipSlope !== undefined ? f.dipSlope : 0.16;
    const yStart = 0;
    const yEnd = 480;
    const xStart = x0 + slope * yStart;
    const xEnd = x0 + slope * yEnd;
    return /*#__PURE__*/React.createElement("g", {
      key: `fault-group-${idx}`
    }, /*#__PURE__*/React.createElement("line", {
      x1: xStart,
      y1: yStart,
      x2: xEnd,
      y2: yEnd,
      stroke: "rgba(100,255,218,0.25)",
      strokeWidth: "1.0",
      strokeDasharray: "4 4"
    }));
  }), flts.map((f, idx) => {
    const inter1 = getFaultIntersection(f, 1.0, g); // Primary reservoir caprock spill point
    const inter2 = getFaultIntersection(f, 0.4, g); // Secondary shallow reservoir entry point
    const cellIdx1 = Math.round(inter1.x / 5.0);
    const hasBreached = h && h[cellIdx1] > f.thresholdHeight;
    if (!hasBreached) return null;
    const travelX = inter2.x - inter1.x;
    const travelY = inter2.y - inter1.y;
    return /*#__PURE__*/React.createElement("g", {
      key: `fault-flow-group-${idx}`
    }, /*#__PURE__*/React.createElement("line", {
      x1: inter1.x,
      y1: inter1.y,
      x2: inter2.x,
      y2: inter2.y,
      stroke: "#0dfca2",
      strokeWidth: "3.5",
      opacity: "0.22",
      style: {
        filter: 'blur(2.5px)'
      }
    }), /*#__PURE__*/React.createElement("line", {
      x1: inter1.x,
      y1: inter1.y,
      x2: inter2.x,
      y2: inter2.y,
      stroke: "#0dfca2",
      strokeWidth: "1.6",
      strokeDasharray: "5 4",
      opacity: "0.85",
      style: {
        animation: 'conduitFlow 1.2s linear infinite',
        animationPlayState: isPlaying ? 'running' : 'paused'
      }
    }), /*#__PURE__*/React.createElement("circle", {
      cx: inter2.x,
      cy: inter2.y,
      r: "3.5",
      fill: "none",
      stroke: "#0dfca2",
      strokeWidth: "1.2",
      style: {
        animation: 'dischargePulse 2s ease-out infinite',
        animationPlayState: isPlaying ? 'running' : 'paused'
      }
    }), /*#__PURE__*/React.createElement("circle", {
      cx: inter2.x,
      cy: inter2.y,
      r: "1.8",
      fill: "#0dfca2",
      opacity: "0.85"
    }), [0, 0.5, 1.0, 1.5, 2.0].map((delay, i) => /*#__PURE__*/React.createElement("circle", {
      key: `fb-${idx}-${i}`,
      cx: inter1.x,
      cy: inter1.y,
      r: "1.8",
      fill: "#0dfca2",
      style: {
        opacity: 0,
        '--travel-x': `${travelX}px`,
        '--travel-y': `${travelY}px`,
        animation: `faultRise 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s infinite`,
        animationPlayState: isPlaying ? 'running' : 'paused'
      }
    })));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '22%',
      top: 'calc(42vh + 22vh)',
      transform: 'translate(-50%, -50%)',
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 600,
      fontSize: 16,
      color: 'rgba(255,255,255,0.60)',
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      zIndex: 5,
      pointerEvents: 'none',
      textShadow: '0 1px 4px rgba(0,0,0,0.8)'
    }
  }, "Brine"));
};

/* =====================================================
   One clean annotation pointing at the reservoir's VE concept
   ===================================================== */
const Annotation = () => /*#__PURE__*/React.createElement("div", {
  className: "hero-annotation-box",
  style: {
    padding: '14px 18px',
    boxSizing: 'border-box',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%)',
    backdropFilter: 'blur(16px) saturate(160%)',
    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    border: '1px solid rgba(100,255,218,0.35)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 0 15px rgba(100,255,218,0.12), inset 0 1px 0 rgba(255,255,255,0.25)',
    transition: 'all 0.4s ease'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 1.5,
    fontFamily: "'Montserrat', sans-serif"
  }
}, "Vertical Equilibrium model of CO", /*#__PURE__*/React.createElement("sub", null, "2"), " injection \u2014 ", /*#__PURE__*/React.createElement("strong", {
  style: {
    color: '#64ffda',
    textShadow: '0 0 8px rgba(100,255,218,0.3)'
  }
}, "orders of magnitude"), " faster than full 3D."));

/* =====================================================
   IDENTITY — sits firmly inside the sky region
   ===================================================== */
const Identity = ({
  onNavigate
}) => /*#__PURE__*/React.createElement("div", {
  className: "hero-identity-container"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11.5,
    letterSpacing: '0.20em',
    textTransform: 'uppercase',
    color: '#64ffda',
    fontWeight: 600,
    marginBottom: 14,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#64ffda',
    boxShadow: '0 0 10px rgba(100,255,218,0.8)'
  }
}), "Ph.D. Candidate \xB7 Heriot-Watt University"), /*#__PURE__*/React.createElement("h1", {
  style: {
    margin: 0,
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 700,
    fontSize: 'clamp(36px, 6vw, 64px)',
    lineHeight: 1.02,
    letterSpacing: '-0.02em',
    background: 'linear-gradient(135deg, #ffffff 0%, #d6f8f3 50%, #7ee8e2 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  }
}, "Sa\u2019eed Telvari"), /*#__PURE__*/React.createElement("p", {
  style: {
    margin: '18px 0 0',
    maxWidth: 540,
    fontSize: 16,
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.82)'
  }
}, "Building ", /*#__PURE__*/React.createElement("strong", {
  style: {
    color: '#64ffda',
    fontWeight: 600
  }
}, "Vertical Equilibrium models"), " for simulating ", /*#__PURE__*/React.createElement("strong", {
  style: {
    color: '#64ffda',
    fontWeight: 600
  }
}, "CO", /*#__PURE__*/React.createElement("sub", null, "2"), " storage"), " in depleted gas reservoirs \u2014 the cross-section below is essentially the thing I simulate."), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginTop: 24,
    flexWrap: 'wrap'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    gap: 10
  }
}, /*#__PURE__*/React.createElement(BrandSocial, {
  icon: "fa-brands fa-linkedin-in",
  tint: "#0a66c2",
  url: "https://www.linkedin.com/in/stelvari/"
}), /*#__PURE__*/React.createElement(BrandSocial, {
  icon: "fa-brands fa-github",
  tint: "#22272e",
  url: "https://github.com/saeedtelvari"
}), /*#__PURE__*/React.createElement(BrandSocial, {
  icon: "fa-solid fa-graduation-cap",
  tint: "#4285f4",
  url: "https://scholar.google.co.uk/citations?user=_nGa8EQAAAAJ&hl=en&inst=16061989973938494330"
}), /*#__PURE__*/React.createElement(BrandSocial, {
  icon: "fa-solid fa-envelope",
  tint: "#ea4335",
  url: "mailto:st4014@hw.ac.uk"
})), /*#__PURE__*/React.createElement("div", {
  style: {
    height: 22,
    width: 1,
    background: 'rgba(255,255,255,0.18)'
  }
}), /*#__PURE__*/React.createElement("a", {
  href: "#cv",
  onClick: e => {
    e.preventDefault();
    if (onNavigate) onNavigate('cv');else if (window.__onNavigate) window.__onNavigate('cv');
  },
  style: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '11px 20px',
    borderRadius: 14,
    background: 'linear-gradient(135deg, rgba(78,205,196,0.90), rgba(78,205,196,0.55))',
    border: '1px solid rgba(168,237,234,0.60)',
    color: '#fff',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
    fontSize: 13.5,
    textDecoration: 'none',
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(78,205,196,0.30), inset 0 1px 0 rgba(255,255,255,0.40)',
    transition: 'all 0.3s ease'
  }
}, /*#__PURE__*/React.createElement("i", {
  className: "fa-solid fa-file-lines"
}), " View CV"), /*#__PURE__*/React.createElement("a", {
  href: "#contact",
  onClick: e => {
    e.preventDefault();
    if (onNavigate) onNavigate('contact');else if (window.__onNavigate) window.__onNavigate('contact');else {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({
        behavior: 'smooth'
      });
    }
  },
  style: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '11px 20px',
    borderRadius: 14,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))',
    border: '1px solid rgba(255,255,255,0.30)',
    color: '#fff',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 500,
    fontSize: 13.5,
    textDecoration: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.30)',
    transition: 'all 0.3s ease'
  }
}, "Get in touch")));
const BrandSocial = ({
  icon,
  tint,
  url
}) => {
  const [hover, setHover] = useState(false);
  const toRGBA = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
  };
  return /*#__PURE__*/React.createElement("a", {
    href: url,
    target: "_blank",
    rel: "noreferrer",
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    "aria-label": "social link",
    style: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${toRGBA(tint, 0.95)} 0%, ${toRGBA(tint, 0.55)} 100%)`,
      backdropFilter: 'blur(8px)',
      border: `1.5px solid ${toRGBA(tint, 0.75)}`,
      color: '#fff',
      fontSize: 17,
      cursor: 'pointer',
      textDecoration: 'none',
      transform: hover ? 'translateY(-3px) scale(1.08)' : 'none',
      boxShadow: hover ? `0 10px 26px ${toRGBA(tint, 0.45)}, inset 0 1px 0 rgba(255,255,255,0.45)` : `0 4px 14px ${toRGBA(tint, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.30)`,
      transition: 'all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: icon,
    style: {
      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'
    }
  }));
};
const ScrollCue = () => /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    left: '50%',
    bottom: 18,
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    letterSpacing: '0.20em',
    textTransform: 'uppercase',
    zIndex: 7
  }
}, "Scroll", /*#__PURE__*/React.createElement("span", {
  style: {
    width: 1,
    height: 24,
    background: 'linear-gradient(180deg, rgba(100,255,218,0.6), transparent)'
  }
}));
Object.assign(window, {
  SubsurfaceHero
});

// ==========================================
// File: HomeSections.jsx
// ==========================================
// HomeSections.jsx — About, Research, Publications, Projects, News, Contact

// [destructured React]

/* =====================================================
   About + Recent Activity (merged)
   ===================================================== */
const NEWS = [{
  month: 'May',
  year: '2026',
  title: 'Presented at InterPore 2026',
  body: 'Presented research on Vertical Equilibrium models for CO\u2082 storage at the InterPore 2026 Annual Meeting.'
}, {
  month: 'Oct',
  year: '2025',
  title: 'Poster Presentation at EAGE GET 2025',
  body: 'Presented an extended abstract on "Three-Phase VE Simulation of CO\u2082\u2013Methane\u2013Brine Flow in Reservoirs" at the Sixth EAGE Global Energy Transition Conference.'
}, {
  month: 'Sep',
  year: '2025',
  title: 'Presented at InterPore UK 2025',
  body: 'Delivered a presentation on Vertical Equilibrium flow models at the InterPore UK 2025 Chapter Meeting.'
}, {
  month: 'Sep',
  year: '2024',
  title: 'Started PhD at Heriot-Watt University',
  body: 'Began doctoral research on Vertical Equilibrium Models for CO\u2082 storage.'
}, {
  month: 'Aug',
  year: '2024',
  title: 'M.Sc. Thesis Defense',
  body: 'Successfully defended thesis on "Machine Learning Methods in Upscaling Fine-scale Discrete Fracture Models" with distinction. GPA: 3.65/4.'
}, {
  month: 'May',
  year: '2023',
  title: 'Paper Published in Advances in Water Resources',
  body: 'First-author publication on 3D CNN prediction of two-phase flow properties accepted in a top-tier journal.'
}];
const AboutSection = () => /*#__PURE__*/React.createElement(SectionPanel, {
  strataTheme: "sedimentary"
}, /*#__PURE__*/React.createElement("style", null, `
      .about-main-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
        gap: 48px;
        align-items: flex-start;
      }
      .about-badges-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
        margin-top: 28px;
      }
      .research-strip-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }
      @media (max-width: 960px) {
        .about-main-grid {
          grid-template-columns: 1fr !important;
          gap: 36px !important;
        }
        .research-strip-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
      }
      @media (max-width: 600px) {
        .about-badges-grid {
          grid-template-columns: 1fr !important;
        }
        .research-strip-grid {
          grid-template-columns: 1fr !important;
        }
      }
    `), /*#__PURE__*/React.createElement("div", {
  className: "about-main-grid"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    color: 'rgba(255,255,255,0.90)'
  }
}, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
  style: {
    textAlign: 'center',
    marginBottom: 6
  }
}, /*#__PURE__*/React.createElement(StratigraphicBadge, {
  theme: "sedimentary",
  depth: "2.0 \u2013 5.0 km",
  formation: "Deep Sedimentary Basin \xB7 Marine Carbonate & Evaporites",
  temp: "95\xB0C",
  press: "35 MPa"
})), /*#__PURE__*/React.createElement(SectionTitle, {
  style: {
    marginBottom: 28,
    fontSize: 34
  }
}, "About Me")), /*#__PURE__*/React.createElement(Reveal, {
  delay: "reveal-delay-1"
}, /*#__PURE__*/React.createElement("p", {
  className: "lead",
  style: {
    fontSize: 21,
    fontWeight: 500,
    lineHeight: 1.7,
    color: '#fff',
    marginTop: 0
  }
}, "I'm ", /*#__PURE__*/React.createElement("strong", {
  style: {
    color: '#64ffda',
    fontWeight: 600
  }
}, "Sa'eed Telvari"), ", a PhD candidate in Petroleum Engineering at Heriot-Watt University. My research bridges the gap between computational efficiency and physical accuracy in subsurface flow simulation.")), /*#__PURE__*/React.createElement(Reveal, {
  delay: "reveal-delay-2"
}, /*#__PURE__*/React.createElement("p", {
  style: {
    fontSize: 16,
    lineHeight: 1.8,
    color: 'rgba(255,255,255,0.85)'
  }
}, "I completed both my B.Sc. and M.Sc. in Petroleum Engineering with a focus on reservoir simulation and machine learning applications. Based on academic excellence, I was granted direct admission for graduate study, ranking within the top 2% in the national entrance exam.")), /*#__PURE__*/React.createElement(Reveal, {
  delay: "reveal-delay-3"
}, /*#__PURE__*/React.createElement("p", {
  style: {
    fontSize: 16,
    lineHeight: 1.8,
    color: 'rgba(255,255,255,0.85)'
  }
}, "Currently, I'm developing Vertical Equilibrium (VE) models for simulating CO", /*#__PURE__*/React.createElement("sub", null, "2"), " storage in depleted gas reservoirs \u2014 a key simulation strategy for achieving net-zero emissions.")), /*#__PURE__*/React.createElement("div", {
  className: "about-badges-grid"
}, [{
  icon: 'fas fa-graduation-cap',
  label: 'PhD @ Heriot-Watt'
}, {
  icon: 'fas fa-flask',
  label: 'CCUS Research'
}, {
  icon: 'fas fa-code',
  label: 'Python, MATLAB, Julia'
}, {
  icon: 'fas fa-robot',
  label: 'Agentic AI'
}].map((h, i) => /*#__PURE__*/React.createElement(Reveal, {
  key: i,
  delay: `reveal-delay-${i + 1}`
}, /*#__PURE__*/React.createElement(GlassCard, {
  padding: 16,
  radius: 16,
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: '100%'
  }
}, /*#__PURE__*/React.createElement("i", {
  className: h.icon,
  style: {
    fontSize: 22,
    color: '#64ffda'
  }
}), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.90)',
    fontWeight: 500
  }
}, h.label)))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement(SectionTitle, {
  style: {
    marginBottom: 28,
    fontSize: 34
  }
}, "Recent Activity")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  }
}, NEWS.map((n, i) => /*#__PURE__*/React.createElement(Reveal, {
  key: i,
  delay: `reveal-delay-${i + 1}`
}, /*#__PURE__*/React.createElement(GlassCard, {
  padding: 18
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    flexShrink: 0,
    width: 62,
    textAlign: 'center',
    padding: '10px 6px',
    background: 'linear-gradient(135deg, rgba(100,255,218,0.15) 0%, rgba(100,255,218,0.05) 100%)',
    border: '1px solid rgba(100,255,218,0.20)',
    borderRadius: 10
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12,
    fontWeight: 700,
    color: '#64ffda',
    textTransform: 'uppercase'
  }
}, n.month), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.60)',
    marginTop: 2
  }
}, n.year)), /*#__PURE__*/React.createElement("div", {
  style: {
    minWidth: 0
  }
}, /*#__PURE__*/React.createElement("h3", {
  style: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 600,
    margin: '0 0 4px',
    lineHeight: 1.35
  }
}, n.title), /*#__PURE__*/React.createElement("p", {
  style: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 13,
    lineHeight: 1.55,
    margin: 0
  },
  dangerouslySetInnerHTML: {
    __html: n.body
  }
}))))))))));

/* =====================================================
   Publications + Research Interests (merged)
   ===================================================== */
const RESEARCH = [{
  icon: 'fas fa-cloud',
  title: 'CO\u2082 Storage Modeling',
  body: 'Efficient numerical models for CO\u2082 injection into depleted reservoirs.'
}, {
  icon: 'fas fa-cubes',
  title: 'Reservoir Simulation',
  body: 'Eclipse and MRST workflows for fractured, heterogeneous systems.'
}, {
  icon: 'fas fa-layer-group',
  title: 'Upscaling Methods',
  body: 'ML-enhanced upscaling of fine-scale discrete fracture models.'
}, {
  icon: 'fas fa-microscope',
  title: 'Digital Rock Analysis',
  body: '3D CNN prediction of petrophysical properties from micro-CT.'
}, {
  icon: 'fas fa-fire',
  title: 'Depleted Oil/Gas Reservoirs',
  body: 'Residual gas effects and multi-phase flow under CO\u2082 injection.'
}, {
  icon: 'fas fa-brain',
  title: 'Machine Learning in PE',
  body: 'Deep learning for reservoir characterization and property prediction.'
}];
const ResearchInterestsStrip = () => /*#__PURE__*/React.createElement("div", {
  style: {
    marginBottom: 36
  }
}, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("h3", {
  style: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(100,255,218,0.85)',
    margin: '0 0 18px'
  }
}, "Research Interests")), /*#__PURE__*/React.createElement("div", {
  className: "research-strip-grid"
}, RESEARCH.map((r, i) => /*#__PURE__*/React.createElement(Reveal, {
  key: i,
  delay: `reveal-delay-${i % 3 + 1}`
}, /*#__PURE__*/React.createElement(GlassCard, {
  padding: 16,
  radius: 14,
  style: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    height: '100%'
  }
}, /*#__PURE__*/React.createElement("i", {
  className: r.icon,
  style: {
    fontSize: 18,
    color: '#64ffda',
    marginTop: 2,
    flexShrink: 0
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    minWidth: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 600,
    margin: '0 0 3px',
    lineHeight: 1.3
  },
  dangerouslySetInnerHTML: {
    __html: r.title
  }
}), /*#__PURE__*/React.createElement("p", {
  style: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 1.45,
    margin: 0
  }
}, r.body)))))));
const PUBLICATIONS = [{
  badge: 'preprint',
  badgeLabel: 'Preprint',
  title: 'A Vertical Equilibrium Model for CO\u2082 Migration in Depleted Gas Fields',
  authors: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: '#64ffda'
    }
  }, "Telvari, S."), ", Ramachandran, H., Wang, G., & Doster, F. (2025)"),
  venue: 'EarthArXiv preprint',
  abstract: 'A reduced-order VE framework that captures the buoyant migration of injected CO\u2082 in depleted gas reservoirs against the cap rock, delivering full-field-scale forecasts orders of magnitude faster than 3D simulation.',
  link: 'https://doi.org/10.31223/X5P49D'
}, {
  badge: 'conference',
  badgeLabel: 'Poster / Extended Abstract',
  title: 'Three-Phase VE Simulation of CO\u2082\u2013Methane\u2013Brine Flow in Reservoirs',
  authors: /*#__PURE__*/React.createElement(React.Fragment, null, "Golsanami, N., ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: '#64ffda'
    }
  }, "Telvari, S."), ", & Yan, W. (2022)"),
  venue: 'Sixth EAGE Global Energy Transition Conference & Exhibition (GET 2025) — Poster Presentation',
  abstract: 'An extended abstract presenting a Vertical Equilibrium (VE) model for simulating three-phase CO\u2082\u2013methane\u2013brine flow in depleted gas reservoirs, enabling efficient large-scale simulation of CO\u2082 storage with residual methane interactions.',
  link: 'https://doi.org/10.3997/2214-4609.202521145'
}, {
  badge: 'published',
  badgeLabel: 'Published',
  title: 'Accelerated Permeability Upscaling: A CNN Approach',
  authors: /*#__PURE__*/React.createElement(React.Fragment, null, "Sayyafzadeh, M., ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: '#64ffda'
    }
  }, "Telvari, S."), ", Guerillot, D., & Sharifi, M. (2024)"),
  venue: 'SPE Journal, 31(04), 2242',
  abstract: 'A novel convolutional neural network approach for rapid permeability upscaling in heterogeneous reservoirs, achieving 100-400\u00d7 computational speedup compared to traditional flow-based methods.',
  link: 'https://onepetro.org/SJ/article-abstract/31/04/2242/795099/Accelerated-Permeability-Upscaling-A-Convolutional'
}, {
  badge: 'published',
  badgeLabel: 'Published',
  title: 'Prediction of two-phase flow properties for digital sandstones using 3D convolutional neural networks',
  authors: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: '#64ffda'
    }
  }, "Telvari, S."), ", Sayyafzadeh, M., Siavashi, J., & Sharifi, M. (2023)"),
  venue: 'Advances in Water Resources, 176, 104442',
  abstract: 'Developed a 3D CNN architecture for predicting relative permeability and capillary pressure curves directly from micro-CT images, eliminating the need for expensive pore-network modeling.',
  link: 'https://doi.org/10.1016/j.advwatres.2023.104442'
}];
const PublicationsList = () => /*#__PURE__*/React.createElement(SectionPanel, {
  strataTheme: "crystalline"
}, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
  style: {
    textAlign: 'center',
    marginBottom: 6
  }
}, /*#__PURE__*/React.createElement(StratigraphicBadge, {
  theme: "crystalline",
  depth: "5.0 \u2013 15.0 km",
  formation: "Crystalline Basement \xB7 Metamorphic Gneiss Foliation & Shear Fractures",
  temp: "240\xB0C",
  press: "120 MPa"
})), /*#__PURE__*/React.createElement(SectionTitle, null, "Research & Publications")), /*#__PURE__*/React.createElement(ResearchInterestsStrip, null), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  }
}, PUBLICATIONS.map((p, i) => /*#__PURE__*/React.createElement(Reveal, {
  key: i,
  delay: `reveal-delay-${i % 2 + 1}`
}, /*#__PURE__*/React.createElement(GlassCard, {
  padding: 28
}, /*#__PURE__*/React.createElement(Badge, {
  kind: p.badge
}, p.badgeLabel), /*#__PURE__*/React.createElement("h3", {
  style: {
    fontSize: 21,
    color: '#fff',
    fontWeight: 600,
    margin: '0 0 10px',
    lineHeight: 1.4
  },
  dangerouslySetInnerHTML: {
    __html: p.title
  }
}), /*#__PURE__*/React.createElement("p", {
  style: {
    color: 'rgba(255,255,255,0.85)',
    margin: '0 0 6px',
    fontSize: 15
  }
}, p.authors), /*#__PURE__*/React.createElement("p", {
  style: {
    color: 'rgba(255,255,255,0.60)',
    fontStyle: 'italic',
    margin: '0 0 14px',
    fontSize: 14
  }
}, p.venue), /*#__PURE__*/React.createElement("p", {
  style: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    lineHeight: 1.6,
    margin: '0 0 16px'
  },
  dangerouslySetInnerHTML: {
    __html: p.abstract
  }
}), p.link && /*#__PURE__*/React.createElement("a", {
  href: p.link,
  target: "_blank",
  rel: "noreferrer",
  style: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 18px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
    color: '#fff',
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 600,
    border: '1px solid rgba(255,255,255,0.30)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.30)'
  }
}, /*#__PURE__*/React.createElement("i", {
  className: "fas fa-external-link-alt",
  style: {
    fontSize: 11
  }
}), " View Publication"))))));

/* =====================================================
   Contact
   ===================================================== */
const ContactSection = () => {
  const contacts = [{
    icon: "fas fa-envelope",
    label: "st4014@hw.ac.uk",
    url: "mailto:st4014@hw.ac.uk",
    aria: "Email Sa'eed Telvari"
  }, {
    icon: "fab fa-linkedin",
    label: "LinkedIn Profile",
    url: "https://www.linkedin.com/in/stelvari/",
    aria: "Sa'eed Telvari on LinkedIn"
  }, {
    icon: "fab fa-github",
    label: "GitHub",
    url: "https://github.com/saeedtelvari",
    aria: "Sa'eed Telvari on GitHub"
  }, {
    icon: "fas fa-graduation-cap",
    label: "Google Scholar",
    url: "https://scholar.google.co.uk/citations?user=_nGa8EQAAAAJ&hl=en&inst=16061989973938494330",
    aria: "Sa'eed Telvari on Google Scholar"
  }];
  return /*#__PURE__*/React.createElement(SectionPanel, {
    strataTheme: "mantle"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement(StratigraphicBadge, {
    theme: "mantle",
    depth: "15 \u2013 35+ km",
    formation: "Lower Crust & Moho Boundary \xB7 Ductile Mantle & Thermal Conduits",
    temp: "680\xB0C",
    press: "450 MPa"
  })), /*#__PURE__*/React.createElement(SectionTitle, null, "Get In Touch")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(Reveal, {
    delay: "reveal-delay-1"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      color: 'rgba(255,255,255,0.85)',
      maxWidth: 620,
      margin: '0 auto 36px',
      lineHeight: 1.7
    }
  }, "I'm always interested in discussing research collaborations, academic opportunities, or questions about reservoir simulation and CCUS technologies.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 18,
      marginBottom: 36
    }
  }, contacts.map((c, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: i,
    delay: `reveal-delay-${i + 1}`
  }, /*#__PURE__*/React.createElement(ContactCard, {
    icon: c.icon,
    label: c.label,
    url: c.url,
    ariaLabel: c.aria
  })))), /*#__PURE__*/React.createElement(Reveal, {
    delay: "reveal-delay-3"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      color: 'rgba(255,255,255,0.60)',
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-map-marker-alt",
    style: {
      color: '#f97316'
    }
  }), "Institute of GeoEnergy Engineering, Heriot-Watt University, Edinburgh, UK"))));
};
const ContactCard = ({
  icon,
  label,
  url,
  ariaLabel
}) => {
  const [hovered, setHovered] = useState(false);
  return /*#__PURE__*/React.createElement("a", {
    href: url,
    target: "_blank",
    rel: "noreferrer",
    "aria-label": ariaLabel || label,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: {
      display: 'inline-block',
      height: '100%',
      textDecoration: 'none',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(GlassCard, {
    padding: 18,
    radius: 20,
    style: {
      minWidth: 220,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: icon,
    style: {
      fontSize: 22,
      color: '#64ffda',
      transition: 'transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
      transform: hovered ? 'scale(1.22) rotate(8deg)' : 'scale(1)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.90)'
    }
  }, label)));
};

/* =====================================================
   StratigraphicDepthHUD — Floating Geological Column Navigator
   ===================================================== */
const StratigraphicDepthHUD = ({
  onNavigate
}) => {
  const [activeDepthIndex, setActiveDepthIndex] = useState(0);
  const [hoveredTick, setHoveredTick] = useState(null);
  const horizons = [{
    id: 'home',
    depth: '1.5 km',
    label: 'CO₂ Storage Reservoir',
    color: '#64ffda',
    temp: '45°C'
  }, {
    id: 'about',
    depth: '3.5 km',
    label: 'Sedimentary Basin',
    color: '#38bdf8',
    temp: '95°C'
  }, {
    id: 'publications',
    depth: '10 km',
    label: 'Crystalline Basement',
    color: '#a855f7',
    temp: '240°C'
  }, {
    id: 'contact',
    depth: '28 km',
    label: 'Moho & Mantle',
    color: '#f97316',
    temp: '680°C'
  }];
  useEffect(() => {
    const onScroll = () => {
      const scrollPos = window.scrollY + 350;
      const ids = ['contact', 'publications', 'about', 'home'];
      for (let i = 0; i < ids.length; i++) {
        const el = document.getElementById(ids[i]);
        if (el && el.offsetTop <= scrollPos) {
          const matchedIdx = horizons.findIndex(h => h.id === ids[i]);
          if (matchedIdx !== -1) {
            setActiveDepthIndex(matchedIdx);
            return;
          }
        }
      }
      setActiveDepthIndex(0);
    };
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const handleClick = id => {
    if (onNavigate) onNavigate(id);else if (window.__onNavigate) window.__onNavigate(id);
  };
  return /*#__PURE__*/React.createElement("aside", {
    className: "stratigraphic-hud-container",
    "aria-label": "Stratigraphic Depth Navigator"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 10px',
      borderRadius: 20,
      background: 'linear-gradient(180deg, rgba(19,13,28,0.88) 0%, rgba(15,20,38,0.92) 100%)',
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.20)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 8.5,
      fontWeight: 700,
      letterSpacing: '0.14em',
      color: 'rgba(255,255,255,0.60)',
      textTransform: 'uppercase',
      fontFamily: 'ui-monospace, monospace',
      textAlign: 'center',
      lineHeight: 1.2
    }
  }, "DEPTH", /*#__PURE__*/React.createElement("br", null), "STRATA"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      padding: '6px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 6,
      bottom: 6,
      width: 2,
      background: 'linear-gradient(180deg, #64ffda 0%, #38bdf8 30%, #a855f7 65%, #f97316 100%)',
      opacity: 0.35,
      borderRadius: 1
    }
  }), horizons.map((h, idx) => {
    const isActive = activeDepthIndex === idx;
    const isHover = hoveredTick === idx;
    return /*#__PURE__*/React.createElement("div", {
      key: h.id,
      style: {
        position: 'relative',
        cursor: 'pointer',
        padding: '2px 0'
      },
      onMouseEnter: () => setHoveredTick(idx),
      onMouseLeave: () => setHoveredTick(null),
      onClick: () => handleClick(h.id)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: isActive ? 14 : 9,
        height: isActive ? 14 : 9,
        borderRadius: '50%',
        backgroundColor: h.color,
        boxShadow: isActive ? `0 0 14px ${h.color}, inset 0 0 4px #fff` : `0 0 4px ${h.color}`,
        border: isActive ? '2px solid #fff' : '1.5px solid rgba(255,255,255,0.4)',
        transition: 'all 0.35s cubic-bezier(0.175,0.885,0.32,1.275)',
        transform: isHover ? 'scale(1.35)' : 'scale(1)'
      }
    }), (isHover || isActive) && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        right: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(14,10,22,0.95)',
        border: `1px solid ${h.color}`,
        borderRadius: 10,
        padding: '6px 10px',
        whiteSpace: 'nowrap',
        boxShadow: `0 4px 18px rgba(0,0,0,0.55), 0 0 10px ${h.color}33`,
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        pointerEvents: 'none',
        zIndex: 1000
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: h.color,
        fontFamily: 'ui-monospace, monospace'
      }
    }, h.depth, " \xB7 ", h.temp), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: 500
      }
    }, h.label)));
  }))));
};
Object.assign(window, {
  AboutSection,
  PublicationsList,
  ContactSection,
  StratigraphicDepthHUD
});

// ==========================================
// File: CVPage.jsx
// ==========================================
// CVPage.jsx — single long glass page mirroring cv.html

const CVPage = ({
  onNavigate
}) => {
  const handlePrint = () => {
    window.print();
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      backgroundImage: "url('./assets/headerbg3.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      padding: '120px 24px 64px'
    }
  }, /*#__PURE__*/React.createElement("style", null, `
        .cv-skills-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 680px) {
          .cv-skills-grid {
            grid-template-columns: 1fr !important;
          }
          .cv-card-container {
            padding: 24px 18px !important;
          }
          .cv-name-title {
            font-size: 38px !important;
          }
        }
        @media print {
          header, nav, footer, .cv-download-btn {
            display: none !important;
          }
          body {
            background: #fff !important;
            color: #000 !important;
          }
          .cv-card-container {
            background: #fff !important;
            color: #000 !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
        }
      `), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(135deg, rgba(10,10,20,0.85) 0%, rgba(15,25,45,0.80) 50%, rgba(10,20,40,0.85) 100%)',
      zIndex: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "cv-card-container",
    style: {
      position: 'relative',
      zIndex: 1,
      maxWidth: 980,
      margin: '0 auto',
      padding: 44,
      background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.08) 100%)',
      backdropFilter: 'blur(25px) saturate(180%)',
      WebkitBackdropFilter: 'blur(25px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderTop: '1px solid rgba(255,255,255,0.25)',
      borderLeft: '1px solid rgba(255,255,255,0.20)',
      borderRadius: 30,
      boxShadow: '0 8px 32px rgba(0,0,0,0.30), inset 0 2px 4px rgba(255,255,255,0.10)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      textAlign: 'center',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "cv-name-title",
    style: {
      margin: '0 0 12px',
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 700,
      fontSize: 'clamp(36px, 5vw, 56px)',
      lineHeight: 1.1,
      background: 'linear-gradient(135deg, #fff 0%, #a8edea 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }
  }, "Sa\u2019eed Telvari"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 19,
      color: 'rgba(255,255,255,0.70)',
      margin: '0 0 18px'
    }
  }, "Ph.D. Candidate in Petroleum Engineering"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 20,
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-map-marker-alt",
    style: {
      color: '#4ecdc4',
      marginRight: 8
    }
  }), "Edinburgh, UK"), /*#__PURE__*/React.createElement("a", {
    href: "mailto:st4014@hw.ac.uk",
    style: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 14,
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-envelope",
    style: {
      color: '#4ecdc4',
      marginRight: 8
    }
  }), "st4014@hw.ac.uk"), /*#__PURE__*/React.createElement("a", {
    href: "https://www.linkedin.com/in/stelvari/",
    target: "_blank",
    rel: "noreferrer",
    style: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 14,
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fab fa-linkedin",
    style: {
      color: '#4ecdc4',
      marginRight: 8
    }
  }), "/in/stelvari")), /*#__PURE__*/React.createElement("div", {
    className: "cv-download-btn"
  }, /*#__PURE__*/React.createElement(GlassButton, {
    variant: "mint",
    icon: "fas fa-download",
    onClick: handlePrint
  }, "Download PDF / Print"))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(CVSection, {
    icon: "fas fa-flask",
    title: "Research Interests"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 10
    }
  }, ['Reservoir Simulation', 'CO\u2082 Storage', 'CCUS Technologies', 'Vertical Equilibrium Models', 'Machine Learning', 'Upscaling Methods', 'Fractured Reservoirs', 'Digital Rock Physics'].map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t,
    variant: "research"
  }, t)))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(CVSection, {
    icon: "fas fa-graduation-cap",
    title: "Education"
  }, /*#__PURE__*/React.createElement(Timeline, {
    items: [{
      title: 'Ph.D. in Petroleum Engineering',
      date: '2024 – Present',
      inst: 'Heriot-Watt University, Edinburgh, UK',
      details: ['Thesis: Developing Vertical Equilibrium Models for Simulating CO\u2082 Storage in Depleted Gas Reservoirs']
    }, {
      title: 'M.Sc. in Petroleum Engineering — Reservoir',
      date: '2022 – 2024',
      inst: 'Amirkabir University of Technology, Tehran',
      details: ['GPA: 3.65/4 (17.23/20)', 'Thesis: Machine Learning Methods in Upscaling Fine-scale Discrete Fracture Models']
    }, {
      title: 'B.Sc. in Petroleum Engineering',
      date: '2018 – 2022',
      inst: 'Amirkabir University of Technology, Tehran',
      details: ['GPA: 17.43/20', 'Thesis: Prediction of two-phase flow properties for digital sandstones using 3D CNNs']
    }]
  })), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(CVSection, {
    icon: "fas fa-tools",
    title: "Skills"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cv-skills-grid"
  }, /*#__PURE__*/React.createElement(SkillCategory, {
    icon: "fas fa-code",
    title: "Programming",
    tags: ['Python', 'MATLAB', 'Julia', 'Rust', 'LaTeX'],
    detail: "Libraries: TensorFlow, PyTorch, Scikit-learn, OpenCV, OpenPNM"
  }), /*#__PURE__*/React.createElement(SkillCategory, {
    icon: "fas fa-industry",
    title: "Industry Software",
    tags: ['Eclipse', 'MRST', 'Petrel RE', 'Saphir', 'PVTSim']
  }), /*#__PURE__*/React.createElement(SkillCategory, {
    icon: "fas fa-cube",
    title: "CFD & Simulation",
    tags: ['OpenFOAM', 'PerGeos', 'SALOME', 'MeshLab']
  }), /*#__PURE__*/React.createElement(SkillCategory, {
    icon: "fas fa-laptop-code",
    title: "Tools & Platforms",
    tags: ['Linux', 'Docker', 'Git', 'Jupyter', 'VS Code']
  }))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(CVSection, {
    icon: "fas fa-award",
    title: "Honors & Awards"
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    }
  }, [{
    icon: 'fas fa-trophy',
    body: 'Ranked within top 2% in Iranian University Entrance Exam for Master\'s degrees'
  }, {
    icon: 'fas fa-star',
    body: 'Direct admission for graduate study from Talented Student Office, Amirkabir University'
  }, {
    icon: 'fas fa-medal',
    body: 'National undergraduate scholarship (full tuition waiver)'
  }, {
    icon: 'fas fa-trophy',
    body: 'Ranked within top 4% among 140,000+ students in undergraduate entrance exam'
  }, {
    icon: 'fas fa-certificate',
    body: 'Recognized as talented student in NODET entrance exam'
  }].map((a, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '12px 0',
      color: 'rgba(255,255,255,0.90)',
      fontSize: 15,
      borderBottom: '1px solid rgba(255,255,255,0.05)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: a.icon,
    style: {
      color: '#ffc107',
      fontSize: 16,
      marginTop: 3
    }
  }), a.body))))));
};

/* -----------------------------------------------------
   Helpers
   ----------------------------------------------------- */
const CVSection = ({
  icon,
  title,
  children
}) => /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h2", {
  style: {
    fontSize: 22,
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 12
  }
}, /*#__PURE__*/React.createElement("i", {
  className: icon,
  style: {
    color: '#4ecdc4',
    fontSize: 20
  }
}), title), children);
const Timeline = ({
  items
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'relative'
  }
}, items.map((it, i) => /*#__PURE__*/React.createElement("div", {
  key: i,
  style: {
    position: 'relative',
    paddingLeft: 32,
    marginBottom: 22
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: i === items.length - 1 ? 0 : -22,
    width: 2,
    background: 'linear-gradient(180deg, #4ecdc4, rgba(78,205,196,0.20))'
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    left: -5,
    top: 14,
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: '#4ecdc4',
    boxShadow: '0 0 10px rgba(78,205,196,0.5)'
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 18,
    background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6
  }
}, /*#__PURE__*/React.createElement("h3", {
  style: {
    fontSize: 17,
    fontWeight: 600,
    color: '#fff',
    margin: 0
  }
}, it.title), /*#__PURE__*/React.createElement("span", {
  style: {
    background: 'rgba(78,205,196,0.20)',
    color: '#4ecdc4',
    padding: '4px 12px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 500
  }
}, it.date)), /*#__PURE__*/React.createElement("p", {
  style: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 14,
    margin: '0 0 10px'
  }
}, /*#__PURE__*/React.createElement("i", {
  className: "fas fa-university",
  style: {
    marginRight: 8,
    color: '#4ecdc4'
  }
}), it.inst), it.details.map((d, j) => /*#__PURE__*/React.createElement("p", {
  key: j,
  style: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13.5,
    margin: '4px 0 0'
  },
  dangerouslySetInnerHTML: {
    __html: d
  }
}))))));
const SkillCategory = ({
  icon,
  title,
  tags,
  detail
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 18,
    background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 16
  }
}, /*#__PURE__*/React.createElement("h4", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 15,
    fontWeight: 600,
    color: '#fff',
    margin: '0 0 12px'
  }
}, /*#__PURE__*/React.createElement("i", {
  className: icon,
  style: {
    color: '#4ecdc4'
  }
}), title), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: detail ? 12 : 0
  }
}, tags.map(t => /*#__PURE__*/React.createElement(Tag, {
  key: t,
  variant: "skill"
}, t))), detail && /*#__PURE__*/React.createElement("p", {
  style: {
    color: 'rgba(255,255,255,0.60)',
    fontSize: 12.5,
    margin: 0
  }
}, /*#__PURE__*/React.createElement("strong", {
  style: {
    color: '#fff',
    fontWeight: 600
  }
}, detail.split(':')[0], ":"), detail.split(':')[1]));
Object.assign(window, {
  CVPage
});

// ==========================================
// File: GuidePage.jsx
// ==========================================
// GuidePage.jsx — Interactive VE Simulator Equations & Methodology Guide
// [destructured React]

const GuidePage = ({
  isEmbedded = false
}) => {
  return /*#__PURE__*/React.createElement("div", {
    className: "guide-page-wrapper",
    style: {
      padding: isEmbedded ? '10px 5px' : '110px 4% 60px',
      minHeight: isEmbedded ? 'auto' : '100vh',
      background: isEmbedded ? 'transparent' : '#130d1c',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: 30
    }
  }, /*#__PURE__*/React.createElement("style", null, `
        .guide-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 25px;
        }
        @media (min-width: 900px) {
          .guide-grid {
            grid-template-columns: 1.1fr 0.9fr;
          }
          .full-width-card {
            grid-column: span 2;
          }
        }
        .math-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 24px 28px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.3s ease;
        }
        .math-card:hover {
          border-color: rgba(100, 255, 218, 0.25);
          box-shadow: 0 8px 32px rgba(100, 255, 218, 0.05);
        }
        .math-header {
          margin: 0;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #64ffda;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .math-text {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255,255,255,0.7);
          margin: 0;
        }
        .equation-block {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cambria Math', 'Times New Roman', serif;
          font-size: 1.25rem;
          margin: 20px 0;
          color: #0dfca2;
          background: rgba(0,0,0,0.22);
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.04);
          text-shadow: 0 0 10px rgba(13,252,162,0.15);
          user-select: all;
          overflow-x: auto;
          white-space: nowrap;
        }
        .fraction {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          padding: 0 6px;
          vertical-align: middle;
        }
        .numerator {
          border-bottom: 1.2px solid rgba(255,255,255,0.8);
          padding-bottom: 2px;
          text-align: center;
          font-size: 0.95em;
        }
        .denominator {
          padding-top: 2px;
          text-align: center;
          font-size: 0.95em;
        }
        .parenthesis {
          font-size: 1.9em;
          font-weight: 200;
          vertical-align: middle;
          margin: 0 2px;
        }
        .subscript {
          font-size: 0.65em;
          vertical-align: sub;
          margin-left: 1px;
        }
        .superscript {
          font-size: 0.65em;
          vertical-align: super;
        }
        .variable {
          font-style: italic;
          margin: 0 1px;
        }
      `), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: '0.20em',
      textTransform: 'uppercase',
      color: '#64ffda',
      fontWeight: 600,
      marginBottom: 6
    }
  }, "Saline Aquifer Physics & Simulation"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 'clamp(28px, 4vw, 38px)',
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 700
    }
  }, "PDE Methodology & Constitutive Models Guide"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      color: 'rgba(255,255,255,0.65)',
      fontSize: 13.5,
      maxWidth: 780
    }
  }, "This reference manual details the mathematical foundations, Vertical Equilibrium simplifications, multi-phase constitutive laws (Brooks-Corey capillary pressure and Corey relative permeabilities), and TVD numerical schemes running inside the simulator.")), /*#__PURE__*/React.createElement("div", {
    className: "guide-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "math-card full-width-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-layer-group"
  }), " 1. The Vertical Equilibrium (VE) Formulation"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Saline aquifer CO\u2082 storage formations are typically thin, lateral sandstone layers with high aspect ratios where the reservoir length is far greater than the vertical thickness (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "H"), " &ll; ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "L"), "). In such geometries, buoyancy forces drive rapid vertical segregation on a timescale much faster than regional horizontal migration (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "vert"), " &ll; ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "horiz"), "). Supercritical CO\u2082 quickly floats to the caprock ceiling, while denser brine water settles below."), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "The **Vertical Equilibrium (VE) approximation** assumes that fluids segregate instantly along the vertical coordinate and remain in hydrostatic balance:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"))), " = - \u03C1(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), ") ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "g"), " \u2003\u21D2\u2003 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"), ", ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), ", ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"), ") = ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "top"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"), ", ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"), ") + \u222B", /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z")), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "0"), " \u03C1(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z'"), ") ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "g"), " ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "dz'")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "This simplifies 3D multi-phase Navier-Stokes equations into a 1D vertically-integrated height-averaged transport PDE, reducing computational cost by orders of magnitude while rigorously preserving mass balance and migration dynamics.")), /*#__PURE__*/React.createElement("div", {
    className: "math-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-tint"
  }), " 2. Multi-Phase Saturation Limits & Sum Rule"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "At every point in the pore space, the pore volume is completely occupied by gas (supercritical CO\u2082) and aqueous brine:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), ") + ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), ") = 1.0"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "The saturation boundaries are parameterized by critical rock-fluid endpoints:", /*#__PURE__*/React.createElement("br", null), "\u2022 **Connate / Irreducible Water Saturation** (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc"), " = 0.10): Capillary-bound water trapped in micro-pores that cannot be displaced by gas.", /*#__PURE__*/React.createElement("br", null), "\u2022 **Maximum Mobile Gas Saturation** (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g,max"), " = 1 - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc"), " = 0.90): Peak gas saturation at the caprock ceiling.", /*#__PURE__*/React.createElement("br", null), "\u2022 **Residual Gas Trapping Saturation** (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr"), " = 0.20 \u2013 0.25): Disconnected gas ganglia snapped off during water imbibition.")), /*#__PURE__*/React.createElement("div", {
    className: "math-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-water"
  }), " 3. Brooks-Corey Capillary Pressure Model"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Capillary pressure ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "c"), " governs the diffuse transition zone (capillary fringe) between mobile CO\u2082 and the native brine aquifer using the **Brooks-Corey (1964)** retention law:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "c"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"), ") = ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "ce"), " \u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "("), /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "1 - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc"))), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, ")"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "-1/\u03BB")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Under hydrostatic VE balance, the vertical gas saturation profile is:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), ") = (1 - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc"), ") ", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "["), " 1 - ", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "("), /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "ce")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u0394\u03C1 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "g"), " (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), ") + ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "ce"))), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, ")"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "\u03BB"), " ", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "]")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Where ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "ce"), " = 5.0 kPa is entry displacement pressure, \u03BB = 2.0 is the pore-size distribution index, and \u0394\u03C1 = \u03C1", /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "brine"), " - \u03C1", /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "CO\u2082"), " is fluid density contrast.")), /*#__PURE__*/React.createElement("div", {
    className: "math-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-chart-line"
  }), " 4. Corey Relative Permeability Functions"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Phase mobilities in the porous sandstone are governed by modified **Corey / Brooks-Corey relative permeabilities**:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "k"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "rg"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g"), ") = ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "k"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "rg"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "0"), " ", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "("), /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "1 - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr"))), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, ")"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "n", /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g"))), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "k"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "rw"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"), ") = ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "k"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "rw"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "0"), " ", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "("), /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "1 - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr"))), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, ")"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "n", /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"))), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Parameters:", /*#__PURE__*/React.createElement("br", null), "\u2022 Gas Corey exponent: ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "n"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g"), " = 2.0 (non-wetting phase).", /*#__PURE__*/React.createElement("br", null), "\u2022 Water Corey exponent: ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "n"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"), " = 3.0 (wetting phase).", /*#__PURE__*/React.createElement("br", null), "\u2022 Endpoints: ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "k"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "rg"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "0"), " = 0.85, ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "k"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "rw"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "0"), " = 1.00.")), /*#__PURE__*/React.createElement("div", {
    className: "math-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-wave-square"
  }), " 5. 1D Transport PDE & TVD Flux Limiter"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "The plume column thickness ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"), ", ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"), ") evolves according to the 1D vertically-integrated mass conservation law:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, "\u03C6 ", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"))), " +", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "q")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"))), " =", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "Q"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "inj"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "Q"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "leak")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "To prevent non-physical dispersion and odd-even spatial checkerboarding across steep structural fault throws, our solver enforces a **Total Variation Diminishing (TVD)** upwind flux limiter:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, "|", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "q"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "i+1/2"), "| \u2264 ", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "0.30 \u2022 \u03C6 \u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "mob,upwind")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u0394", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t")))), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Integrated across 25 substeps per simulation year (\u0394", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"), " = 0.040 yr), guaranteeing strict CFL stability and mass conservation.")), /*#__PURE__*/React.createElement("div", {
    className: "math-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-exchange-alt"
  }), " 6. Integrated Darcy Fluid Flux & Faults"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "The vertically-integrated Darcy flux ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "q"), " combines regional structural dipping and buoyant hydrostatic spreading:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "q"), " = - ", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "K"), " ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "mob"), " \u0394\u03C1 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "g")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u03BC")), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "["), /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "t")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"))), " +", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"))), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "]"), " \u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "T"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "fault")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Where:", /*#__PURE__*/React.createElement("br", null), "\u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "K"), " is sandstone permeability.", /*#__PURE__*/React.createElement("br", null), "\u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "t"), " is the vertical depth profile of the caprock ceiling underside.", /*#__PURE__*/React.createElement("br", null), "\u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "T"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "fault"), " &in; [0, 1] is cross-fault horizontal transmissibility (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "T"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "fault"), " = 0 for completely sealed barrier faults).")), /*#__PURE__*/React.createElement("div", {
    className: "math-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-lock"
  }), " 7. Residual Capillary Trapping & Envelope"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "As the plume migrates updip under buoyancy, trailing-edge water imbibition snaps off CO\u2082 bubbles inside sandstone pores. In VE, the total height is partitioned into immobile trapped and flowing mobile components:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "trapped"), " = ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr"), " \u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "max")), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "mob"), " = max", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "("), "0, ", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr"), " ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "max")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "1 - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr"))), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, ")")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Where ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "max"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"), ") is the historical maximum gas saturation envelope, visualized in the 2D reservoir canvas as the **cyan dashed boundary line**.")), /*#__PURE__*/React.createElement("div", {
    className: "math-card full-width-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-bolt"
  }), " 8. Capillary Seal Breaching & Fault Conduit Leakage"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Fault zones act as structural barrier seals due to clay smearing, creating high capillary entry pressures. For CO\u2082 to breach the seal and escape vertically into overlying strata, the buoyant overpressure must exceed the capillary entry threshold:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, "\u0394", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "buoyancy"), " > ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "c"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "entry"), " \u2003\u21D2\u2003 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), " > ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "threshold"), " = ", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "c"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "entry")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u0394\u03C1 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "g")))), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Once the spill height is exceeded, vertical leakage volume rate follows Darcy's conduit law:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "Q"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "leak"), " = ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "C"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "leak"), " \u2022 max", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "("), "0, ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "threshold"), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, ")")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Where ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "C"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "leak"), " is the vertical fault zone permeability transmissibility."))));
};

// Bind to window object for Babel execution scope
Object.assign(window, {
  GuidePage
});

// ==========================================
// File: SimulatorPage.jsx
// ==========================================
// SimulatorPage.jsx — Interactive VE Simulator Page
// [destructured React]

// Main Simulator component
const SimulatorPage = () => {
  // --- STATE PARAMETERS ---
  // Physical parameters
  const [K, setK] = useState(1.70); // Absolute permeability scaling (0.1 to 3.5)
  const [porosity, setPorosity] = useState(0.25); // Porosity (0.1 to 0.4)
  const [cellCount, setCellCount] = useState(200); // N cells resolution (50 to 300)
  const [residualTrapFraction, setResidualTrapFraction] = useState(0.25); // Trapping fraction Sgr (0.0 to 0.40)

  // Define dx in the outer scope of the component so it is available to all rendering sub-blocks
  const dx = 1000.0 / cellCount;

  // Topography parameters (Formula sliders)
  const [dipPercent, setDipPercent] = useState(1.5); // Regional dip in % (-5% to 5%)
  const [amplitude, setAmplitude] = useState(25); // Anticline wave amplitude (0 to 50px)
  const [frequency, setFrequency] = useState(2); // Wave frequency multiplier (0.5 to 4)
  const [faultOffset, setFaultOffset] = useState(1.2); // Fault displacement (0 to 3)

  // Injection parameters
  const [Q, setQ] = useState(2.30); // Constant injection rate (0.0 to 3.5)
  const [injLocation, setInjLocation] = useState(70); // Injection cell index % (10% to 90%)
  const [injDuration, setInjDuration] = useState(240); // Frame count of active injection (50 to 400)

  // Fault parameters
  const [faultCount, setFaultCount] = useState(2); // Number of faults (0 to 3)
  const [faults, setFaults] = useState(() => [{
    xPercent: 28,
    isSealed: false,
    thresholdHeight: 0.35,
    leakRate: 0.14,
    transmissibility: 1.0,
    dipSlope: -0.22
  }, {
    xPercent: 48,
    isSealed: false,
    thresholdHeight: 0.30,
    leakRate: 0.12,
    transmissibility: 1.0,
    dipSlope: 0.25
  }]);

  // Capillary fringe state
  const [hasCapillaryFringe, setHasCapillaryFringe] = useState(true);
  const [fringeScale, setFringeScale] = useState(0.65); // subtle, crisp capillary transition zone thickness (meters)
  const [entryPressure, setEntryPressure] = useState(15); // entry capillary pressure (kPa)

  // Simulation run state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReversing, setIsReversing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 4x execution speed
  const [simTime, setSimTime] = useState(0); // simulation timer frame

  // Tab Navigation state
  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile' (2D reservoir) or 'uq' (Sensitivity & UQ Analysis)

  // SA/UQ uncertainty bounds configuration states (default +/- percentages)
  const [kUncertainty, setKUncertainty] = useState(0.40); // +/- 40% permeability range
  const [sgrUncertainty, setSgrUncertainty] = useState(0.40); // +/- 40% Sgr range
  const [faultThreshUncertainty, setFaultThreshUncertainty] = useState(0.50); // +/- 50% fault threshold range

  // Monte Carlo execution states
  const [mcRunsCount, setMcRunsCount] = useState(50); // 25, 50, or 100 simulations
  const [mcResults, setMcResults] = useState(null); // Array of realization runs
  const [uqRunning, setUqRunning] = useState(false);
  const [uqProgress, setUqProgress] = useState(0);
  const [uqTargetMetric, setUqTargetMetric] = useState('leaked'); // 'leaked' (CO2 leaked mass) or 'trapped' (trapping efficiency %)

  // Solver variables (Plume thickness vector, max thickness historical)
  const [h, setH] = useState(() => new Array(200).fill(0));
  const [hMax, setHMax] = useState(() => new Array(200).fill(0));

  // Cumulative masses tracking state
  const [massHistory, setMassHistory] = useState([]); // Array of { time, injected, trapped, mobile, leaked }
  const [currentMasses, setCurrentMasses] = useState({
    injected: 0,
    trapped: 0,
    mobile: 0,
    leaked: 0
  });

  // Reset flag / state synchronizer
  const stateRef = useRef({
    h: [],
    hMax: [],
    masses: {
      injected: 0,
      trapped: 0,
      mobile: 0,
      leaked: 0
    }
  });

  // Time travel history ref — stores full solver state at each year for back-and-forth scrubbing
  const historyRef = useRef([]);

  // Initialize solver parameters reference to prevent interval resets on slider modifications
  const solverParamsRef = useRef(null);
  solverParamsRef.current = {
    K,
    porosity,
    cellCount,
    dipPercent,
    amplitude,
    frequency,
    faultOffset,
    Q,
    injLocation,
    injDuration,
    faultCount,
    parentDX: dx,
    faults: JSON.parse(JSON.stringify(faults)),
    residualTrapFraction
  };

  // Compute mobile and trapped heights dynamically for SVG visualization
  const {
    hMobile,
    hTrapped
  } = useMemo(() => {
    const N = h.length;
    const hMob = new Array(N).fill(0);
    const hTrap = new Array(N).fill(0);
    const R = residualTrapFraction;
    for (let i = 0; i < N; i++) {
      const H = h[i];
      const hm = hMax[i];
      // VE residual trapping model
      const mobileVal = R < 1.0 ? Math.max(0, (H - R * hm) / (1.0 - R)) : 0;
      hMob[i] = Math.min(H, mobileVal);
      hTrap[i] = Math.max(0, H - hMob[i]);
    }
    return {
      hMobile: hMob,
      hTrapped: hTrap
    };
  }, [h, hMax, residualTrapFraction]);

  // Initialize solver vectors when cell count changes
  useEffect(() => {
    resetSimulation();
  }, [cellCount]);

  // Reset simulation function
  const resetSimulation = () => {
    const arr = new Array(cellCount).fill(0);
    setH(arr);
    setHMax(arr);
    const initialMasses = {
      injected: 0,
      trapped: 0,
      mobile: 0,
      leaked: 0
    };
    setCurrentMasses(initialMasses);
    setMassHistory([{
      time: 0,
      ...initialMasses
    }]);
    setSimTime(0);
    setIsPlaying(false);
    setIsReversing(false);
    stateRef.current = {
      h: [...arr],
      hMax: [...arr],
      masses: {
        ...initialMasses
      }
    };
    historyRef.current = [{
      time: 0,
      h: [...arr],
      hMax: [...arr],
      masses: {
        ...initialMasses
      },
      params: JSON.parse(JSON.stringify(solverParamsRef.current))
    }];
  };

  // Preset Scenario Handlers
  const applyPreset = presetName => {
    resetSimulation();
    if (presetName === 'dome') {
      setDipPercent(0.2);
      setAmplitude(45);
      setFrequency(1.5);
      setFaultOffset(0);
      setK(1.60);
      setPorosity(0.25);
      setQ(2.20);
      setInjDuration(240);
      setFaultCount(0);
      setResidualTrapFraction(0.30);
    } else if (presetName === 'faulted') {
      setDipPercent(1.8);
      setAmplitude(15);
      setFrequency(2);
      setFaultOffset(1.8);
      setK(1.80);
      setPorosity(0.22);
      setQ(2.00);
      setInjDuration(200);
      setFaultCount(2);
      setFaults([{
        xPercent: 26,
        isSealed: false,
        thresholdHeight: 0.30,
        leakRate: 0.16,
        transmissibility: 0.8,
        dipSlope: -0.22
      }, {
        xPercent: 50,
        isSealed: false,
        thresholdHeight: 0.45,
        leakRate: 0.12,
        transmissibility: 0.5,
        dipSlope: 0.25
      }]);
      setResidualTrapFraction(0.20);
    } else if (presetName === 'monocline') {
      setDipPercent(-2.5);
      setAmplitude(6);
      setFrequency(0.5);
      setFaultOffset(0);
      setK(1.50);
      setPorosity(0.28);
      setQ(1.80);
      setInjDuration(220);
      setFaultCount(1);
      setFaults([{
        xPercent: 32,
        isSealed: false,
        thresholdHeight: 0.35,
        leakRate: 0.14,
        transmissibility: 0.9,
        dipSlope: -0.20
      }]);
      setResidualTrapFraction(0.25);
    } else if (presetName === 'default') {
      setDipPercent(1.5);
      setAmplitude(25);
      setFrequency(2);
      setFaultOffset(1.2);
      setK(1.70);
      setPorosity(0.25);
      setQ(2.30);
      setInjDuration(240);
      setFaultCount(2);
      setFaults([{
        xPercent: 28,
        isSealed: false,
        thresholdHeight: 0.35,
        leakRate: 0.14,
        transmissibility: 1.0,
        dipSlope: -0.22
      }, {
        xPercent: 48,
        isSealed: false,
        thresholdHeight: 0.30,
        leakRate: 0.12,
        transmissibility: 1.0,
        dipSlope: 0.25
      }]);
      setResidualTrapFraction(0.25);
    }
  };

  // Base unperturbed caprock profile
  const capRockBaseProfile = x => {
    const dip = 150 + x * (dipPercent / 100.0) * 8.0; // regional dip
    const wave = -amplitude * Math.sin(x * Math.PI / 1000.0 * frequency * 2);
    return dip + wave;
  };

  // Base unperturbed stratum profile for any yOffset
  const stratumBaseProfile = (x, yOffset = 0) => {
    return capRockBaseProfile(x) + yOffset;
  };

  // Computes the exact subpixel intersection (x*, y*) of a sloped fault plane with any geological stratum at depth
  const getSimStratumFaultIntersection = (f, idx, yOffset = 0) => {
    const x0 = f.xPercent / 100.0 * 1000.0;
    const defaultSlope = idx % 2 === 0 ? -0.22 : 0.25;
    const slope = f.dipSlope !== undefined ? f.dipSlope : defaultSlope;
    let x = x0;
    for (let iter = 0; iter < 3; iter++) {
      const y = stratumBaseProfile(x, yOffset);
      x = x0 + slope * y;
    }
    const y = stratumBaseProfile(x, yOffset);
    return {
      x,
      y,
      x0,
      slope
    };
  };

  // Computes intersection for caprock specifically (yOffset = 0)
  const getSimFaultIntersection = (f, idx) => {
    return getSimStratumFaultIntersection(f, idx, 0);
  };

  // Computes elevation for any geological stratum displaced along the sloped fault
  const stratumY = (x, cellIdx = null, yOffset = 0) => {
    const base = stratumBaseProfile(x, yOffset);
    let offset = 0;
    const xRef = cellIdx !== null ? cellIdx * dx + dx / 2.0 : x;
    for (let idx = 0; idx < faultCount; idx++) {
      const f = faults[idx];
      const inter = getSimStratumFaultIntersection(f, idx, yOffset);
      if (xRef > inter.x) {
        const direction = idx % 2 === 0 ? 1 : -1;
        offset += direction * faultOffset * 12;
      }
    }
    return base + offset;
  };

  // Helper: Caprock Underside Topography Function
  const capRockY = (x, cellIdx = null) => {
    return stratumY(x, cellIdx, 0);
  };

  // --- SOLVER ITERATOR (FORWARD & REVERSE) ---
  useEffect(() => {
    if (!isPlaying && !isReversing) return;
    const interval = setInterval(() => {
      if (isPlaying) {
        setSimTime(t => {
          const nextTime = t + 1;
          if (nextTime > 1000) {
            setIsPlaying(false);
            return t;
          }

          // Run numerical VE solver step using parameters from the ref
          const result = runSolverStep(stateRef.current.h, stateRef.current.hMax, stateRef.current.masses, nextTime, solverParamsRef.current);

          // Update local React states
          setH(result.h);
          setHMax(result.hMax);
          setCurrentMasses(result.masses);

          // Append to mass history for plotting
          if (nextTime % 5 === 0 || nextTime === 1 || nextTime === 1000) {
            setMassHistory(history => {
              const cleaned = history.filter(item => item.time < nextTime);
              return [...cleaned, {
                time: nextTime,
                ...result.masses
              }];
            });
          }

          // Store back in ref for next iteration
          stateRef.current = {
            h: result.h,
            hMax: result.hMax,
            masses: result.masses
          };

          // Cache historical snapshot in historyRef for time scrubbing
          historyRef.current[nextTime] = {
            time: nextTime,
            h: [...result.h],
            hMax: [...result.hMax],
            masses: {
              ...result.masses
            },
            params: JSON.parse(JSON.stringify(solverParamsRef.current))
          };
          return nextTime;
        });
      } else if (isReversing) {
        setSimTime(t => {
          const nextTime = t - 1;
          if (nextTime < 0) {
            setIsReversing(false);
            return t;
          }

          // Load from history
          const histState = historyRef.current[nextTime];
          if (histState) {
            setH(histState.h);
            setHMax(histState.hMax);
            setCurrentMasses(histState.masses);
            stateRef.current = {
              h: [...histState.h],
              hMax: [...histState.hMax],
              masses: {
                ...histState.masses
              }
            };
          }
          return nextTime;
        });
      }
    }, 40 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, isReversing, speed]);

  // Time-Travel Scrubbing Handler (Non-destructive)
  const handleScrub = targetTime => {
    setIsPlaying(false);
    setIsReversing(false);
    const t = Math.max(0, Math.min(historyRef.current.length - 1, targetTime));
    const histState = historyRef.current[t];
    if (histState) {
      setH(histState.h);
      setHMax(histState.hMax);
      setCurrentMasses(histState.masses);
      setSimTime(t);

      // Update solver references
      stateRef.current = {
        h: [...histState.h],
        hMax: [...histState.hMax],
        masses: {
          ...histState.masses
        }
      };
    }
  };

  // Branching Committer: Slices the future history from target time and locks in new parameters
  const commitBranch = (targetTime = simTime) => {
    setIsPlaying(false);
    setIsReversing(false);
    const t = Math.max(0, Math.min(historyRef.current.length - 1, targetTime));

    // Truncate history ref after this point
    historyRef.current = historyRef.current.slice(0, t + 1);

    // Truncate mass history for chart
    setMassHistory(history => history.filter(item => item.time <= t));

    // Reload state
    const histState = historyRef.current[t];
    if (histState) {
      setH(histState.h);
      setHMax(histState.hMax);
      setCurrentMasses(histState.masses);
      stateRef.current = {
        h: [...histState.h],
        hMax: [...histState.hMax],
        masses: {
          ...histState.masses
        }
      };
    }
  };

  // Check differences between current parameters and parameters saved at simTime
  const getParamDiff = () => {
    if (simTime >= historyRef.current.length) return [];
    const histState = historyRef.current[simTime];
    if (!histState || !histState.params) return [];
    const histParams = histState.params;
    const diffs = [];
    const checkDiff = (key, label, formatHist, formatCurr) => {
      const vHist = histParams[key];
      let vCurr;
      if (key === 'K') vCurr = K;else if (key === 'porosity') vCurr = porosity;else if (key === 'cellCount') vCurr = cellCount;else if (key === 'residualTrapFraction') vCurr = residualTrapFraction;else if (key === 'dipPercent') vCurr = dipPercent;else if (key === 'amplitude') vCurr = amplitude;else if (key === 'frequency') vCurr = frequency;else if (key === 'faultOffset') vCurr = faultOffset;else if (key === 'Q') vCurr = Q;else if (key === 'injLocation') vCurr = injLocation;else if (key === 'injDuration') vCurr = injDuration;else if (key === 'faultCount') vCurr = faultCount;
      if (key !== 'faults' && Math.abs(vHist - vCurr) > 1e-5) {
        diffs.push({
          label,
          original: formatHist(vHist),
          current: formatCurr(vCurr)
        });
      }
    };
    checkDiff('K', 'Permeability (K)', v => `${Math.round(v * 1000)} mD`, v => `${Math.round(v * 1000)} mD`);
    checkDiff('porosity', 'Porosity (\u03C6)', v => `${Math.round(v * 100)}%`, v => `${Math.round(v * 100)}%`);
    checkDiff('cellCount', 'Grid Cells (N)', v => v, v => v);
    checkDiff('residualTrapFraction', 'Residual Trap (Sgr)', v => `${Math.round(v * 100)}%`, v => `${Math.round(v * 100)}%`);
    checkDiff('dipPercent', 'Regional Dip', v => `${v}%`, v => `${v}%`);
    checkDiff('amplitude', 'Anticline Height', v => `${v}px`, v => `${v}px`);
    checkDiff('frequency', 'Anticline Count', v => v, v => v);
    checkDiff('faultOffset', 'Fault Slip', v => `${v}x`, v => `${v}x`);
    checkDiff('Q', 'Flow Rate (Q)', v => v, v => v);
    checkDiff('injLocation', 'Well Location', v => `${v}%`, v => `${v}%`);
    checkDiff('injDuration', 'Inj. Stop Year', v => `${v}y`, v => `${v}y`);
    checkDiff('faultCount', 'Active Faults', v => v, v => v);
    if (histParams.faultCount === faultCount && faultCount > 0 && histParams.faults) {
      for (let i = 0; i < faultCount; i++) {
        const fHist = histParams.faults[i];
        const fCurr = faults[i];
        if (fHist && fCurr) {
          const prefix = `Fault ${String.fromCharCode(65 + i)}`;
          if (fHist.isSealed !== fCurr.isSealed) {
            diffs.push({
              label: `${prefix} Seal`,
              original: fHist.isSealed ? 'Sealed' : 'Leaking',
              current: fCurr.isSealed ? 'Sealed' : 'Leaking'
            });
          }
          if (Math.abs(fHist.xPercent - fCurr.xPercent) > 1e-5) {
            diffs.push({
              label: `${prefix} Position`,
              original: `${fHist.xPercent}%`,
              current: `${fCurr.xPercent}%`
            });
          }
          if (Math.abs(fHist.thresholdHeight - fCurr.thresholdHeight) > 1e-5) {
            diffs.push({
              label: `${prefix} Threshold`,
              original: `${fHist.thresholdHeight} m`,
              current: `${fCurr.thresholdHeight} m`
            });
          }
          if (!fHist.isSealed && !fCurr.isSealed && Math.abs(fHist.leakRate - fCurr.leakRate) > 1e-5) {
            diffs.push({
              label: `${prefix} Leak Rate`,
              original: fHist.leakRate,
              current: fCurr.leakRate
            });
          }
        }
      }
    }
    return diffs;
  };

  // Play controls toggles
  const handlePlayToggle = () => {
    if (isReversing) {
      setIsReversing(false);
    }
    if (!isPlaying) {
      if (simTime < historyRef.current.length - 1) {
        commitBranch();
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };
  const handlePlayReverseToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    }
    setIsReversing(!isReversing);
  };
  const stepForward = () => {
    setIsPlaying(false);
    setIsReversing(false);
    const nextTime = simTime + 1;
    if (nextTime > 1000) return;
    if (simTime < historyRef.current.length - 1) {
      commitBranch();
    }
    const result = runSolverStep(stateRef.current.h, stateRef.current.hMax, stateRef.current.masses, nextTime, solverParamsRef.current);
    setH(result.h);
    setHMax(result.hMax);
    setCurrentMasses(result.masses);
    setSimTime(nextTime);
    if (nextTime % 5 === 0 || nextTime === 1 || nextTime === 1000) {
      setMassHistory(history => {
        const cleaned = history.filter(item => item.time < nextTime);
        return [...cleaned, {
          time: nextTime,
          ...result.masses
        }];
      });
    }
    stateRef.current = {
      h: result.h,
      hMax: result.hMax,
      masses: result.masses
    };
    historyRef.current[nextTime] = {
      time: nextTime,
      h: [...result.h],
      hMax: [...result.hMax],
      masses: {
        ...result.masses
      },
      params: JSON.parse(JSON.stringify(solverParamsRef.current))
    };
  };
  const stepBackward = () => {
    setIsPlaying(false);
    setIsReversing(false);
    const prevTime = simTime - 1;
    if (prevTime < 0) return;
    const histState = historyRef.current[prevTime];
    if (histState) {
      setH(histState.h);
      setHMax(histState.hMax);
      setCurrentMasses(histState.masses);
      setSimTime(prevTime);
      stateRef.current = {
        h: [...histState.h],
        hMax: [...histState.hMax],
        masses: {
          ...histState.masses
        }
      };
    }
  };

  // --- MONTE CARLO UQ/SA ENGINE ---
  const runMonteCarloBatch = () => {
    if (uqRunning) return;
    setUqRunning(true);
    setUqProgress(0);
    setMcResults(null);
    const totalRuns = mcRunsCount;
    const results = [];
    const batchSize = 5;

    // Capture nominal parameter values
    const nominalK = K;
    const nominalSgr = residualTrapFraction;
    const nominalFaults = faults.map(f => ({
      ...f
    }));

    // Generate parameter sets for each realization (Uniform distribution)
    const realizations = [];
    for (let i = 0; i < totalRuns; i++) {
      // 1. Permeability K
      const kMin = nominalK * (1.0 - kUncertainty);
      const kMax = nominalK * (1.0 + kUncertainty);
      const randK = Math.max(0.1, kMin + Math.random() * (kMax - kMin));

      // 2. Residual Trap Fraction Sgr
      const sgrMin = nominalSgr * (1.0 - sgrUncertainty);
      const sgrMax = nominalSgr * (1.0 + sgrUncertainty);
      const randSgr = Math.max(0.0, Math.min(0.40, sgrMin + Math.random() * (sgrMax - sgrMin)));

      // 3. Fault Capillary Threshold
      const randFaults = nominalFaults.map(f => {
        const threshMin = f.thresholdHeight * (1.0 - faultThreshUncertainty);
        const threshMax = f.thresholdHeight * (1.0 + faultThreshUncertainty);
        const randThresh = Math.max(0.0, Math.min(2.0, threshMin + Math.random() * (threshMax - threshMin)));
        return {
          ...f,
          thresholdHeight: randThresh
        };
      });
      realizations.push({
        id: i,
        K: randK,
        residualTrapFraction: randSgr,
        faults: randFaults
      });
    }

    // Run chunked simulation loop
    const runChunk = startIndex => {
      const endIndex = Math.min(totalRuns, startIndex + batchSize);
      for (let idx = startIndex; idx < endIndex; idx++) {
        const r = realizations[idx];

        // Define solver params for this specific run
        const runParams = {
          K: r.K,
          porosity: porosity,
          cellCount: cellCount,
          dipPercent: dipPercent,
          amplitude: amplitude,
          frequency: frequency,
          faultOffset: faultOffset,
          Q: Q,
          injLocation: injLocation,
          injDuration: injDuration,
          faultCount: faultCount,
          parentDX: dx,
          faults: r.faults,
          residualTrapFraction: r.residualTrapFraction
        };

        // Initialize state vectors for realization
        let curH = new Array(cellCount).fill(0);
        let curHMax = new Array(cellCount).fill(0);
        let curMasses = {
          injected: 0,
          trapped: 0,
          mobile: 0,
          leaked: 0
        };

        // Run explicit solver to Year 1000
        for (let year = 1; year <= 1000; year++) {
          const res = runSolverStep(curH, curHMax, curMasses, year, runParams);
          curH = res.h;
          curHMax = res.hMax;
          curMasses = res.masses;
        }

        // Record outcomes
        const trappingEfficiency = curMasses.injected > 0 ? curMasses.trapped / curMasses.injected * 100 : 0;
        const leakedFraction = curMasses.injected > 0 ? curMasses.leaked / curMasses.injected * 100 : 0;
        results.push({
          id: idx,
          params: r,
          finalLeaked: curMasses.leaked,
          finalTrapped: curMasses.trapped,
          finalMobile: curMasses.mobile,
          finalInjected: curMasses.injected,
          trappingEfficiency,
          leakedFraction,
          h: curH,
          hMax: curHMax
        });
      }
      setUqProgress(Math.round(endIndex / totalRuns * 100));
      if (endIndex < totalRuns) {
        setTimeout(() => runChunk(endIndex), 25);
      } else {
        setUqRunning(false);
        setMcResults(results);
      }
    };

    // Trigger first chunk
    setTimeout(() => runChunk(0), 10);
  };

  // Helper to calculate percentiles
  const getPercentile = (sortedArray, percentile) => {
    if (sortedArray.length === 0) return 0;
    const idx = Math.floor(sortedArray.length * (percentile / 100));
    return sortedArray[Math.min(sortedArray.length - 1, idx)];
  };

  // Helper to calculate Pearson correlation coefficient
  const computeCorrelation = (xValues, yValues) => {
    const M = xValues.length;
    if (M === 0) return 0;
    const meanX = xValues.reduce((a, b) => a + b, 0) / M;
    const meanY = yValues.reduce((a, b) => a + b, 0) / M;
    let num = 0;
    let denX = 0;
    let denY = 0;
    for (let j = 0; j < M; j++) {
      const dx = xValues[j] - meanX;
      const dy = yValues[j] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    if (denX === 0 || denY === 0) return 0;
    return num / Math.sqrt(denX * denY);
  };

  // Memoized UQ statistics computations
  const uqData = useMemo(() => {
    if (!mcResults) return null;
    const vals = mcResults.map(r => uqTargetMetric === 'leaked' ? r.finalLeaked : r.trappingEfficiency);
    const sorted = [...vals].sort((a, b) => a - b);
    const p10Val = getPercentile(sorted, 10);
    const p50Val = getPercentile(sorted, 50);
    const p90Val = getPercentile(sorted, 90);
    const findClosestRealization = targetVal => {
      let closest = mcResults[0];
      let minDiff = Infinity;
      mcResults.forEach(r => {
        const val = uqTargetMetric === 'leaked' ? r.finalLeaked : r.trappingEfficiency;
        const diff = Math.abs(val - targetVal);
        if (diff < minDiff) {
          minDiff = diff;
          closest = r;
        }
      });
      return closest;
    };
    const p10Realization = findClosestRealization(p10Val);
    const p50Realization = findClosestRealization(p50Val);
    const p90Realization = findClosestRealization(p90Val);
    const minVal = sorted[0];
    const maxVal = sorted[sorted.length - 1];
    const range = maxVal - minVal || 1.0;
    const numBins = 10;
    const binWidth = range / numBins;
    const bins = new Array(numBins).fill(0);
    vals.forEach(v => {
      let binIdx = Math.floor((v - minVal) / binWidth);
      if (binIdx >= numBins) binIdx = numBins - 1;
      if (binIdx < 0) binIdx = 0;
      bins[binIdx]++;
    });
    const maxBinCount = Math.max(1, Math.max(...bins));
    return {
      vals,
      sorted,
      minVal,
      maxVal,
      range,
      bins,
      maxBinCount,
      binWidth,
      p10Val,
      p50Val,
      p90Val,
      p10Realization,
      p50Realization,
      p90Realization
    };
  }, [mcResults, uqTargetMetric]);

  // Memoized Sensitivity correlations
  const sensitivityData = useMemo(() => {
    if (!mcResults) return null;
    const yVals = mcResults.map(r => uqTargetMetric === 'leaked' ? r.finalLeaked : r.trappingEfficiency);
    const kVals = mcResults.map(r => r.params.K);
    const sgrVals = mcResults.map(r => r.params.residualTrapFraction);
    const faultThreshVals = mcResults.map(r => {
      const activeFaults = r.params.faults.slice(0, faultCount);
      if (activeFaults.length === 0) return 0;
      const sum = activeFaults.reduce((a, b) => a + b.thresholdHeight, 0);
      return sum / activeFaults.length;
    });
    const kCorr = computeCorrelation(kVals, yVals);
    const sgrCorr = computeCorrelation(sgrVals, yVals);
    const faultCorr = faultCount > 0 ? computeCorrelation(faultThreshVals, yVals) : 0;
    return [{
      label: 'Permeability (K)',
      r: kCorr
    }, {
      label: 'Residual Trapping (Sgr)',
      r: sgrCorr
    }, ...(faultCount > 0 ? [{
      label: 'Fault Seal Height',
      r: faultCorr
    }] : [])].sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
  }, [mcResults, uqTargetMetric, faultCount]);

  // Load a selected Monte Carlo model back to 2D simulator
  const loadUQRealization = realization => {
    if (!realization) return;
    setK(parseFloat(realization.params.K.toFixed(3)));
    setResidualTrapFraction(parseFloat(realization.params.residualTrapFraction.toFixed(3)));
    const newFaults = faults.map((f, i) => {
      const rf = realization.params.faults[i];
      if (rf) {
        return {
          ...f,
          thresholdHeight: parseFloat(rf.thresholdHeight.toFixed(3))
        };
      }
      return f;
    });
    setFaults(newFaults);
    setH(realization.h);
    setHMax(realization.hMax);
    const finalMasses = {
      injected: realization.finalInjected,
      trapped: realization.finalTrapped,
      mobile: realization.finalMobile,
      leaked: realization.finalLeaked
    };
    setCurrentMasses(finalMasses);
    setSimTime(1000);
    setIsPlaying(false);
    setIsReversing(false);
    stateRef.current = {
      h: [...realization.h],
      hMax: [...realization.hMax],
      masses: {
        ...finalMasses
      }
    };
    const emptyArr = new Array(cellCount).fill(0);
    historyRef.current = [{
      time: 0,
      h: emptyArr,
      hMax: emptyArr,
      masses: {
        injected: 0,
        trapped: 0,
        mobile: 0,
        leaked: 0
      },
      params: JSON.parse(JSON.stringify(solverParamsRef.current))
    }, {
      time: 1000,
      h: [...realization.h],
      hMax: [...realization.hMax],
      masses: {
        ...finalMasses
      },
      params: JSON.parse(JSON.stringify(solverParamsRef.current))
    }];
    setMassHistory([{
      time: 0,
      injected: 0,
      trapped: 0,
      mobile: 0,
      leaked: 0
    }, {
      time: 1000,
      ...finalMasses
    }]);
    setActiveSubTab('profile');
  };

  // SVG Histogram Renderer
  const renderUQHistogram = data => {
    const width = 450;
    const height = 200;
    const padding = {
      left: 40,
      right: 20,
      top: 20,
      bottom: 25
    };
    const getX = val => padding.left + (val - data.minVal) / data.range * (width - padding.left - padding.right);
    const getY = count => height - padding.bottom - count / data.maxBinCount * (height - padding.top - padding.bottom);
    return /*#__PURE__*/React.createElement("svg", {
      width: "100%",
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      style: {
        background: 'rgba(0,0,0,0.18)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.06)'
      }
    }, [0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
      const y = getY(data.maxBinCount * ratio);
      return /*#__PURE__*/React.createElement("line", {
        key: i,
        x1: padding.left,
        y1: y,
        x2: width - padding.right,
        y2: y,
        stroke: "rgba(255,255,255,0.05)",
        strokeWidth: "0.5",
        strokeDasharray: "3 3"
      });
    }), data.bins.map((count, idx) => {
      const valStart = data.minVal + idx * data.binWidth;
      const valEnd = valStart + data.binWidth;
      const x1 = getX(valStart);
      const x2 = getX(valEnd);
      const y = getY(count);
      const barWidth = Math.max(1, x2 - x1 - 1.5);
      const barHeight = Math.max(0, height - padding.bottom - y);
      return /*#__PURE__*/React.createElement("rect", {
        key: idx,
        x: x1,
        y: y,
        width: barWidth,
        height: barHeight,
        fill: "rgba(100, 255, 218, 0.22)",
        stroke: "rgba(100, 255, 218, 0.5)",
        strokeWidth: "1"
      });
    }), [{
      label: 'P10',
      val: data.p10Val,
      color: '#64ffda'
    }, {
      label: 'P50',
      val: data.p50Val,
      color: '#ffb300'
    }, {
      label: 'P90',
      val: data.p90Val,
      color: '#ff6b6b'
    }].map((p, i) => {
      const x = getX(p.val);
      return /*#__PURE__*/React.createElement("g", {
        key: i
      }, /*#__PURE__*/React.createElement("line", {
        x1: x,
        y1: padding.top,
        x2: x,
        y2: height - padding.bottom,
        stroke: p.color,
        strokeWidth: "1.5",
        strokeDasharray: "4 3"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: x,
        cy: padding.top,
        r: "3.5",
        fill: p.color
      }), /*#__PURE__*/React.createElement("text", {
        x: x,
        y: padding.top - 5,
        fill: p.color,
        fontSize: "8.5",
        fontWeight: "bold",
        textAnchor: "middle",
        fontFamily: "monospace"
      }, p.label));
    }), /*#__PURE__*/React.createElement("line", {
      x1: padding.left,
      y1: padding.top,
      x2: padding.left,
      y2: height - padding.bottom,
      stroke: "rgba(255,255,255,0.15)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("line", {
      x1: padding.left,
      y1: height - padding.bottom,
      x2: width - padding.right,
      y2: height - padding.bottom,
      stroke: "rgba(255,255,255,0.15)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("text", {
      x: padding.left,
      y: height - 8,
      fill: "rgba(255,255,255,0.4)",
      fontSize: "8.5",
      textAnchor: "start",
      fontFamily: "monospace"
    }, data.minVal.toFixed(1), uqTargetMetric === 'leaked' ? ' kt' : '%'), /*#__PURE__*/React.createElement("text", {
      x: width - padding.right,
      y: height - 8,
      fill: "rgba(255,255,255,0.4)",
      fontSize: "8.5",
      textAnchor: "end",
      fontFamily: "monospace"
    }, data.maxVal.toFixed(1), uqTargetMetric === 'leaked' ? ' kt' : '%'));
  };

  // SVG Sensitivity Tornado Renderer
  const renderUQSensitivity = data => {
    const width = 450;
    const height = 200;
    const padding = {
      left: 140,
      right: 30,
      top: 25,
      bottom: 20
    };
    const centerOffset = padding.left + (width - padding.left - padding.right) / 2;
    const halfPlotWidth = (width - padding.left - padding.right) / 2;
    const getX = r => centerOffset + r * halfPlotWidth;
    const barHeight = 24;
    const gap = 16;
    return /*#__PURE__*/React.createElement("svg", {
      width: "100%",
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      style: {
        background: 'rgba(0,0,0,0.18)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.06)'
      }
    }, [-1.0, -0.5, 0, 0.5, 1.0].map((tick, i) => {
      const x = getX(tick);
      return /*#__PURE__*/React.createElement("g", {
        key: i
      }, /*#__PURE__*/React.createElement("line", {
        x1: x,
        y1: padding.top - 5,
        x2: x,
        y2: height - padding.bottom,
        stroke: tick === 0 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.05)",
        strokeWidth: tick === 0 ? "1" : "0.5",
        strokeDasharray: tick === 0 ? "none" : "3 3"
      }), /*#__PURE__*/React.createElement("text", {
        x: x,
        y: padding.top - 12,
        fill: "rgba(255,255,255,0.35)",
        fontSize: "8",
        textAnchor: "middle",
        fontFamily: "monospace"
      }, tick > 0 ? `+${tick.toFixed(1)}` : tick.toFixed(1)));
    }), data.map((item, idx) => {
      const y = padding.top + idx * (barHeight + gap);
      const xStart = item.r >= 0 ? centerOffset : getX(item.r);
      const xEnd = item.r >= 0 ? getX(item.r) : centerOffset;
      const rectWidth = Math.max(1, xEnd - xStart);
      const color = item.r >= 0 ? '#64ffda' : '#ff6b6b';
      const fill = item.r >= 0 ? 'rgba(100, 255, 218, 0.25)' : 'rgba(255, 107, 107, 0.25)';
      return /*#__PURE__*/React.createElement("g", {
        key: idx
      }, /*#__PURE__*/React.createElement("text", {
        x: padding.left - 10,
        y: y + barHeight / 2 + 3,
        fill: "rgba(255,255,255,0.85)",
        fontSize: "9.5",
        textAnchor: "end",
        fontFamily: "sans-serif"
      }, item.label), /*#__PURE__*/React.createElement("rect", {
        x: xStart,
        y: y,
        width: rectWidth,
        height: barHeight,
        fill: fill,
        stroke: color,
        strokeWidth: "1",
        rx: "3"
      }), /*#__PURE__*/React.createElement("text", {
        x: item.r >= 0 ? xEnd + 6 : xStart - 6,
        y: y + barHeight / 2 + 3,
        fill: color,
        fontSize: "9",
        fontWeight: "bold",
        textAnchor: item.r >= 0 ? 'start' : 'end',
        fontFamily: "monospace"
      }, item.r.toFixed(2)));
    }), /*#__PURE__*/React.createElement("line", {
      x1: padding.left,
      y1: padding.top - 5,
      x2: padding.left,
      y2: height - padding.bottom,
      stroke: "rgba(255,255,255,0.1)",
      strokeWidth: "1"
    }));
  };

  // Solver implementation
  const runSolverStep = (currentH, currentHMax, masses, currentFrame, params) => {
    const {
      K,
      porosity,
      cellCount,
      Q,
      injLocation,
      injDuration,
      faultCount,
      faults,
      residualTrapFraction,
      parentDX
    } = params;
    const N = cellCount;
    const dx = parentDX || 1000.0 / N;
    let nextH = [...currentH];
    let nextHMax = [...currentHMax];
    let {
      injected,
      trapped,
      mobile,
      leaked
    } = masses;

    // 25 substeps per year to guarantee total TVD numerical advection stability
    const substeps = 25;
    const dt = 1.0 / substeps;

    // Physical coordinate depth array (scaled by 1/15)
    const zt = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      zt[i] = capRockY(i * dx + dx / 2.0, i) / 15.0;
    }

    // Run explicit finite volume integration substeps
    for (let step = 0; step < substeps; step++) {
      // 1. Partition total height into mobile and trapped components for each cell (VE physics)
      const hMob = new Array(N).fill(0);
      for (let i = 0; i < N; i++) {
        const H = nextH[i];
        const hm = nextHMax[i];
        const R = residualTrapFraction;
        const mobileVal = R < 1.0 ? Math.max(0, (H - R * hm) / (1.0 - R)) : 0;
        hMob[i] = Math.min(H, mobileVal);
      }

      // 2. Compute fluxes using only the mobile thickness with physical upwind TVD limiter
      const fluxes = new Array(N - 1).fill(0);
      for (let i = 0; i < N - 1; i++) {
        const zL = zt[i] + nextH[i];
        const zR = zt[i + 1] + nextH[i + 1];
        const grad = (zR - zL) / (dx / 5.0);
        const hFace = grad > 0 ? hMob[i + 1] : hMob[i];

        // Find if a fault is located at this grid boundary and apply its transmissibility multiplier
        let transMult = 1.0;
        for (let idx = 0; idx < faultCount; idx++) {
          const f = faults[idx];
          if (f) {
            const inter = getSimFaultIntersection(f, idx);
            const cellFaultIdx = Math.round(inter.x / dx);
            if (cellFaultIdx - 1 === i) {
              if (f.isSealed) {
                transMult = 0.0; // Infinite sealed barrier
              } else {
                transMult = f.transmissibility !== undefined ? f.transmissibility : 1.0;
              }
              break;
            }
          }
        }
        let rawFlux = -(K / porosity) * hFace * grad * 0.08 * transMult;

        // TVD physical limiter: flux can never exceed 30% of mobile mass in cell per substep
        if (rawFlux > 0) {
          rawFlux = Math.min(rawFlux, 0.30 * hMob[i] / dt);
        } else {
          rawFlux = Math.max(rawFlux, -(0.30 * hMob[i + 1]) / dt);
        }
        fluxes[i] = rawFlux;
      }

      // Ghost cells boundaries (zero far-field flux)
      const H_res = 175.0 / 15.0; // 11.667 m physical maximum thickness of reservoir sandstone bed
      const hTmp = [...nextH];
      for (let i = 0; i < N; i++) {
        const fL = i === 0 ? 0 : fluxes[i - 1];
        const fR = i === N - 1 ? 0 : fluxes[i];
        hTmp[i] = Math.max(0, Math.min(H_res, nextH[i] + dt * (fL - fR)));
      }

      // Injection: Smooth wellbore Gaussian kernel over adjacent cells to prevent point singularity
      const cellInjIdx = Math.floor(injLocation / 100.0 * N);
      if (Q > 0 && currentFrame <= injDuration) {
        const dVolInj = Q * dt;
        const kernel = [0.10, 0.20, 0.40, 0.20, 0.10];
        for (let offset = -2; offset <= 2; offset++) {
          const cIdx = Math.max(0, Math.min(N - 1, cellInjIdx + offset));
          hTmp[cIdx] = Math.min(H_res, hTmp[cIdx] + dVolInj * kernel[offset + 2] / (porosity * (dx / 5.0)));
        }
        injected += dVolInj;
      }

      // Fault Leaks: threshold-pressure/spill-height capillary barrier
      for (let idx = 0; idx < faultCount; idx++) {
        const f = faults[idx];
        if (!f.isSealed) {
          const inter = getSimFaultIntersection(f, idx);
          const cellFaultIdx = Math.round(inter.x / dx);
          const boundedIdx = Math.max(0, Math.min(N - 1, cellFaultIdx));

          // Leakage occurs only if CO2 column height H exceeds the threshold
          if (hTmp[boundedIdx] > f.thresholdHeight) {
            const overpressure = hTmp[boundedIdx] - f.thresholdHeight;
            const leakHeight = Math.min(overpressure, f.leakRate * dt * 0.8);
            hTmp[boundedIdx] -= leakHeight;
            leaked += leakHeight * porosity * (dx / 5.0);
          }
        }
      }
      nextH = hTmp.map(val => Math.max(0, Math.min(H_res, val)));
      for (let i = 0; i < N; i++) {
        if (nextH[i] > nextHMax[i]) nextHMax[i] = Math.min(H_res, nextH[i]);
      }
    }

    // Mass distribution calculation (Exact integral of fluid volume)
    let mobileSum = 0;
    let trappedSum = 0;
    for (let i = 0; i < N; i++) {
      const H = nextH[i];
      const hm = nextHMax[i];
      const R = residualTrapFraction;
      const mobileVal = R < 1.0 ? Math.max(0, (H - R * hm) / (1.0 - R)) : 0;
      const hMob = Math.min(H, mobileVal);
      const hTrap = Math.max(0, H - hMob);
      mobileSum += hMob * (dx / 5.0) * porosity;
      trappedSum += hTrap * (dx / 5.0) * porosity;
    }
    return {
      h: nextH,
      hMax: nextHMax,
      masses: {
        injected: parseFloat(injected.toFixed(2)),
        trapped: parseFloat(trappedSum.toFixed(2)),
        mobile: parseFloat(mobileSum.toFixed(2)),
        leaked: parseFloat(leaked.toFixed(2))
      }
    };
  };

  // --- NODE-BASED RIBBON BUILDER (Zero Sawteeth Guaranteed) ---
  const buildSmoothRibbon = (topElevationFn, botElevationFn, kStart, kEnd) => {
    if (kStart > kEnd) return "";
    let path = "";
    for (let k = kStart; k <= kEnd; k++) {
      const x = k * dx;
      const isFault = k > 0 && k < cellCount && Math.abs(capRockY(x, k - 1) - capRockY(x, k)) > 0.1;
      if (k === kStart) {
        const y0 = topElevationFn(k, isFault ? 'right' : 'avg');
        path = `M ${x} ${y0}`;
      } else if (isFault) {
        const yL = topElevationFn(k, 'left');
        const yR = topElevationFn(k, 'right');
        path += ` L ${x} ${yL} L ${x} ${yR}`;
      } else {
        const y = topElevationFn(k, 'avg');
        path += ` L ${x} ${y}`;
      }
    }
    for (let k = kEnd; k >= kStart; k--) {
      const x = k * dx;
      const isFault = k > 0 && k < cellCount && Math.abs(capRockY(x, k - 1) - capRockY(x, k)) > 0.1;
      if (isFault) {
        const yR = botElevationFn(k, 'right');
        const yL = botElevationFn(k, 'left');
        path += ` L ${x} ${yR} L ${x} ${yL}`;
      } else {
        const y = botElevationFn(k, 'avg');
        path += ` L ${x} ${y}`;
      }
    }
    path += " Z";
    return path;
  };
  const getSimNodeValue = (arr, k, side = 'avg') => {
    if (!arr) return 0;
    const N = arr.length;
    if (k <= 0) return arr[0];
    if (k >= N) return arr[N - 1];
    if (side === 'left') return arr[k - 1];
    if (side === 'right') return arr[k];
    return 0.5 * (arr[k - 1] + arr[k]);
  };

  // Helper to find the active continuous domain with sub-grid zero-tapered tip nodes
  const getSimActiveBounds = (nodeValueFn, N, eps = 0.001) => {
    let kFirst = -1,
      kLast = -1;
    for (let k = 0; k <= N; k++) {
      const val = nodeValueFn(k);
      if (val > eps) {
        if (kFirst === -1) kFirst = k;
        kLast = k;
      }
    }
    if (kFirst === -1) return null;
    const kStart = Math.max(0, kFirst - 1);
    const kEnd = Math.min(N, kLast + 1);
    return {
      kStart,
      kEnd
    };
  };

  // Trapped CO2 sits directly under the caprock
  const getTrappedPath = () => {
    const N = cellCount;
    const scale = 15.0;
    const bounds = getSimActiveBounds(k => getSimNodeValue(hTrapped, k, 'avg'), N, 0.001);
    if (!bounds) return "";
    return buildSmoothRibbon((k, side) => capRockY(k * dx, side === 'left' ? k - 1 : k), (k, side) => {
      const yTop = capRockY(k * dx, side === 'left' ? k - 1 : k);
      const yBotMax = stratumY(k * dx, side === 'left' ? k - 1 : k, 175);
      return Math.min(yBotMax, yTop + getSimNodeValue(hTrapped, k, side) * scale);
    }, bounds.kStart, bounds.kEnd);
  };

  // Mobile CO2 flows beneath the trapped layer
  const getMobilePath = () => {
    const N = cellCount;
    const scale = 15.0;
    const bounds = getSimActiveBounds(k => getSimNodeValue(hMobile, k, 'avg'), N, 0.001);
    if (!bounds) return "";
    return buildSmoothRibbon((k, side) => {
      const yTop = capRockY(k * dx, side === 'left' ? k - 1 : k);
      const yBotMax = stratumY(k * dx, side === 'left' ? k - 1 : k, 175);
      return Math.min(yBotMax, yTop + getSimNodeValue(hTrapped, k, side) * scale);
    }, (k, side) => {
      const yTop = capRockY(k * dx, side === 'left' ? k - 1 : k);
      const yBotMax = stratumY(k * dx, side === 'left' ? k - 1 : k, 175);
      return Math.min(yBotMax, yTop + (getSimNodeValue(hTrapped, k, side) + getSimNodeValue(hMobile, k, side)) * scale);
    }, bounds.kStart, bounds.kEnd);
  };

  // Swept Residual Trapping Footprint (hTrapped)
  const getSweptResidualSimPath = () => {
    const N = cellCount;
    const scale = 15.0;
    const fringePx = hasCapillaryFringe ? fringeScale * 15.0 * 0.25 : 0;
    const bounds = getSimActiveBounds(k => getSimNodeValue(hTrapped, k, 'avg'), N, 0.001);
    if (!bounds) return "";
    return buildSmoothRibbon((k, side) => capRockY(k * dx, side === 'left' ? k - 1 : k), (k, side) => {
      const yTop = capRockY(k * dx, side === 'left' ? k - 1 : k);
      const yBotMax = stratumY(k * dx, side === 'left' ? k - 1 : k, 175);
      const hTrp = getSimNodeValue(hTrapped, k, side);
      const f = fringePx * Math.min(1.0, hTrp * 1.5);
      return Math.min(yBotMax, yTop + hTrp * scale + f);
    }, bounds.kStart, bounds.kEnd);
  };

  // Active Flowing Mobile Plume (hMobile)
  const getActiveMobileSimPath = () => {
    const N = cellCount;
    const scale = 15.0;
    const fringePx = hasCapillaryFringe ? fringeScale * 15.0 * 0.35 : 0;
    const bounds = getSimActiveBounds(k => getSimNodeValue(hMobile, k, 'avg'), N, 0.001);
    if (!bounds) return "";
    return buildSmoothRibbon((k, side) => capRockY(k * dx, side === 'left' ? k - 1 : k), (k, side) => {
      const yTop = capRockY(k * dx, side === 'left' ? k - 1 : k);
      const yBotMax = stratumY(k * dx, side === 'left' ? k - 1 : k, 175);
      const hMob = getSimNodeValue(hMobile, k, side);
      const f = fringePx * Math.min(1.0, hMob * 1.8);
      return Math.min(yBotMax, yTop + hMob * scale + f);
    }, bounds.kStart, bounds.kEnd);
  };

  // Maximum Historic Gas Saturation Boundary (hMax Swept Footprint Dashed Line)
  const getMaxHgLinePath = () => {
    const N = cellCount;
    const scale = 15.0;
    const bounds = getSimActiveBounds(k => getSimNodeValue(hMax, k, 'avg'), N, 0.001);
    if (!bounds) return "";
    let path = "";
    for (let k = bounds.kStart; k <= bounds.kEnd; k++) {
      const x = k * dx;
      const isFault = k > 0 && k < cellCount && Math.abs(capRockY(x, k - 1) - capRockY(x, k)) > 0.1;
      if (k === bounds.kStart) {
        const yTop = capRockY(x, isFault ? k : k);
        const yBotMax = stratumY(x, isFault ? k : k, 175);
        const y0 = Math.min(yBotMax, yTop + getSimNodeValue(hMax, k, isFault ? 'right' : 'avg') * scale);
        path = `M ${x} ${y0}`;
      } else if (isFault) {
        const yTopL = capRockY(x, k - 1);
        const yBotMaxL = stratumY(x, k - 1, 175);
        const yTopR = capRockY(x, k);
        const yBotMaxR = stratumY(x, k, 175);
        const yL = Math.min(yBotMaxL, yTopL + getSimNodeValue(hMax, k, 'left') * scale);
        const yR = Math.min(yBotMaxR, yTopR + getSimNodeValue(hMax, k, 'right') * scale);
        path += ` L ${x} ${yL} L ${x} ${yR}`;
      } else {
        const yTop = capRockY(x, k);
        const yBotMax = stratumY(x, k, 175);
        const y = Math.min(yBotMax, yTop + getSimNodeValue(hMax, k, 'avg') * scale);
        path += ` L ${x} ${y}`;
      }
    }
    return path;
  };

  // Reservoir Conformable Grid block columns
  const reservoirBlocks = useMemo(() => {
    const blocks = [];
    const N = cellCount;
    for (let i = 0; i < N; i++) {
      const x1 = i * dx;
      const x2 = (i + 1) * dx;
      const yt1 = capRockY(x1, i);
      const yt2 = capRockY(x2, i);
      const yb1 = stratumY(x1, i, 175);
      const yb2 = stratumY(x2, i, 175);

      // Permeability noise mapping for sandstone heterogeneity
      const permFactor = 0.5 + 0.5 * Math.sin(i * 12.7 + 1.1);
      const r = Math.floor(35 + permFactor * 14);
      const g = Math.floor(26 + permFactor * 10);
      const b = Math.floor(20 + permFactor * 6);
      const colFill = `rgb(${r}, ${g}, ${b})`;
      blocks.push({
        points: `${x1},${yt1} ${x2},${yt2} ${x2},${yb2} ${x1},${yb1}`,
        fill: colFill,
        x1,
        yt1,
        x2,
        yt2,
        yb1,
        yb2
      });
    }
    return blocks;
  }, [cellCount, dipPercent, amplitude, frequency, faultOffset, faultCount, faults]);

  // --- Dynamic SVG Chart Drawing ---
  const renderSVGChart = () => {
    const width = 450;
    const height = 210;
    const padding = {
      left: 45,
      right: 15,
      top: 15,
      bottom: 25
    };
    const maxVal = Math.max(10, Math.max(currentMasses.injected, currentMasses.mobile + currentMasses.trapped + currentMasses.leaked) * 1.08);

    // Scale helper
    const getX = t => padding.left + t / 1000.0 * (width - padding.left - padding.right);
    const getY = val => height - padding.bottom - val / maxVal * (height - padding.top - padding.bottom);
    let pathInj = "",
      pathTrap = "",
      pathMob = "",
      pathLeak = "";
    if (massHistory.length > 0) {
      pathInj = `M ${getX(massHistory[0].time)} ${getY(massHistory[0].injected)}`;
      pathTrap = `M ${getX(massHistory[0].time)} ${getY(massHistory[0].trapped)}`;
      pathMob = `M ${getX(massHistory[0].time)} ${getY(massHistory[0].mobile)}`;
      pathLeak = `M ${getX(massHistory[0].time)} ${getY(massHistory[0].leaked)}`;
      for (let idx = 1; idx < massHistory.length; idx++) {
        const pt = massHistory[idx];
        pathInj += ` L ${getX(pt.time)} ${getY(pt.injected)}`;
        pathTrap += ` L ${getX(pt.time)} ${getY(pt.trapped)}`;
        pathMob += ` L ${getX(pt.time)} ${getY(pt.mobile)}`;
        pathLeak += ` L ${getX(pt.time)} ${getY(pt.leaked)}`;
      }
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
        fontSize: 10.5,
        padding: '2px 4px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 2,
        background: '#ffffff',
        opacity: 0.6,
        borderTop: '1px dashed #fff'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.7)'
      }
    }, "Injected:"), /*#__PURE__*/React.createElement("strong", {
      style: {
        color: '#fff',
        fontFamily: 'monospace'
      }
    }, Math.round(currentMasses.injected), " kt")), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 2.5,
        background: '#64ffda'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.7)'
      }
    }, "Mobile:"), /*#__PURE__*/React.createElement("strong", {
      style: {
        color: '#64ffda',
        fontFamily: 'monospace'
      }
    }, Math.round(currentMasses.mobile), " kt")), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 2.5,
        background: '#3ca68e'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.7)'
      }
    }, "Trapped:"), /*#__PURE__*/React.createElement("strong", {
      style: {
        color: '#3ca68e',
        fontFamily: 'monospace'
      }
    }, Math.round(currentMasses.trapped), " kt")), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 2.5,
        background: '#ff6b6b'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.7)'
      }
    }, "Leaked:"), /*#__PURE__*/React.createElement("strong", {
      style: {
        color: '#ff6b6b',
        fontFamily: 'monospace'
      }
    }, Math.round(currentMasses.leaked), " kt"))), /*#__PURE__*/React.createElement("svg", {
      width: "100%",
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      style: {
        background: 'rgba(0,0,0,0.18)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.06)'
      }
    }, [0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
      const val = maxVal * ratio;
      const y = getY(val);
      return /*#__PURE__*/React.createElement("g", {
        key: i
      }, /*#__PURE__*/React.createElement("line", {
        x1: padding.left,
        y1: y,
        x2: width - padding.right,
        y2: y,
        stroke: "rgba(255,255,255,0.05)",
        strokeWidth: "0.5",
        strokeDasharray: "3 3"
      }), /*#__PURE__*/React.createElement("text", {
        x: padding.left - 8,
        y: y + 3,
        fill: "rgba(255,255,255,0.45)",
        fontSize: "8.5",
        textAnchor: "end",
        fontFamily: "monospace"
      }, Math.round(val)));
    }), [0, 200, 400, 600, 800, 1000].map((t, i) => {
      const x = getX(t);
      return /*#__PURE__*/React.createElement("text", {
        key: i,
        x: x,
        y: height - 8,
        fill: "rgba(255,255,255,0.45)",
        fontSize: "8.5",
        textAnchor: "middle",
        fontFamily: "monospace"
      }, t, "y");
    }), pathInj && /*#__PURE__*/React.createElement("path", {
      d: pathInj,
      fill: "none",
      stroke: "#ffffff",
      strokeWidth: "1.5",
      strokeDasharray: "3 3",
      opacity: "0.6"
    }), pathMob && /*#__PURE__*/React.createElement("path", {
      d: pathMob,
      fill: "none",
      stroke: "#64ffda",
      strokeWidth: "2",
      style: {
        filter: 'drop-shadow(0 0 2px rgba(100,255,218,0.4))'
      }
    }), pathTrap && /*#__PURE__*/React.createElement("path", {
      d: pathTrap,
      fill: "none",
      stroke: "#3ca68e",
      strokeWidth: "1.8"
    }), pathLeak && /*#__PURE__*/React.createElement("path", {
      d: pathLeak,
      fill: "none",
      stroke: "#ff6b6b",
      strokeWidth: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: getX(simTime),
      y1: padding.top,
      x2: getX(simTime),
      y2: height - padding.bottom,
      stroke: "#64ffda",
      strokeWidth: "1.2",
      strokeDasharray: "2 2",
      opacity: "0.8"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: getX(simTime),
      cy: padding.top,
      r: "3",
      fill: "#64ffda"
    }), /*#__PURE__*/React.createElement("line", {
      x1: padding.left,
      y1: padding.top,
      x2: padding.left,
      y2: height - padding.bottom,
      stroke: "rgba(255,255,255,0.15)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("line", {
      x1: padding.left,
      y1: height - padding.bottom,
      x2: width - padding.right,
      y2: height - padding.bottom,
      stroke: "rgba(255,255,255,0.15)",
      strokeWidth: "1"
    })));
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "simulator-page-wrapper",
    style: {
      padding: '110px 4% 60px',
      minHeight: '100vh',
      background: '#130d1c',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: 25,
      transition: 'padding-left 0.3s ease-in-out',
      paddingLeft: sidebarOpen ? '360px' : '4%'
    }
  }, !sidebarOpen && /*#__PURE__*/React.createElement("button", {
    onClick: () => setSidebarOpen(true),
    className: "sidebar-toggle-btn"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-history"
  }), " Time Machine"), /*#__PURE__*/React.createElement("div", {
    className: `time-travel-sidebar ${sidebarOpen ? 'open' : 'closed'}`
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 15,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#64ffda',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-history",
    style: {
      fontSize: 14
    }
  }), " Time Machine"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSidebarOpen(false),
    style: {
      background: 'none',
      border: 'none',
      color: 'rgba(255,255,255,0.5)',
      cursor: 'pointer',
      fontSize: 16
    },
    title: "Close panel"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-times"
  }))), (() => {
    const isPast = simTime < historyRef.current.length - 1;
    const paramDiffs = getParamDiff();
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 15
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: isPast ? 'rgba(255, 179, 0, 0.1)' : 'rgba(100, 255, 218, 0.1)',
        border: `1px solid ${isPast ? 'rgba(255, 179, 0, 0.3)' : 'rgba(100, 255, 218, 0.3)'}`,
        padding: '12px 14px',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 11,
        fontWeight: 'bold',
        color: isPast ? '#ffb300' : '#64ffda'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: isPast ? '#ffb300' : '#64ffda',
        boxShadow: `0 0 8px ${isPast ? '#ffb300' : '#64ffda'}`,
        animation: 'pulseFlare 1.5s infinite'
      }
    }), isPast ? 'TIMELINE PREVIEW' : 'LIVE RUNNING'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10.5,
        color: 'rgba(255,255,255,0.65)',
        lineHeight: 1.4
      }
    }, isPast ? `Viewing history at Year ${simTime}. Changes to sliders will configure a branch starting from this point.` : `Simulating in real-time. Drag the timeline scrub slider to travel back to previous years.`)), isPast && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: 12,
        borderRadius: 12
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        commitBranch();
        handlePlayToggle();
      },
      style: {
        background: '#0dfca2',
        border: 'none',
        color: '#000',
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: 11.5,
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transition: 'all 0.2s ease'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-code-branch"
    }), " Branch & Run (Yr ", simTime, ")"), /*#__PURE__*/React.createElement("button", {
      onClick: () => handleScrub(historyRef.current.length - 1),
      style: {
        background: 'none',
        border: '1px solid rgba(255,255,255,0.15)',
        color: 'rgba(255,255,255,0.8)',
        padding: '6px 12px',
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transition: 'all 0.2s ease'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-fast-forward"
    }), " Return to Present (Yr ", historyRef.current.length - 1, ")")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9.5,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        fontWeight: 'bold'
      }
    }, "Time Controls"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 6,
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.05)',
        padding: 8,
        borderRadius: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: stepBackward,
      style: {
        background: 'none',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        opacity: simTime > 0 ? 0.8 : 0.3
      },
      disabled: simTime === 0,
      title: "Step Back 1 Year"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-step-backward",
      style: {
        fontSize: 10
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: handlePlayReverseToggle,
      style: {
        background: 'none',
        border: 'none',
        color: isReversing ? '#ff6b6b' : '#64ffda',
        cursor: 'pointer'
      },
      title: isReversing ? "Pause" : "Play Reverse"
    }, /*#__PURE__*/React.createElement("i", {
      className: `fas ${isReversing ? 'fa-pause' : 'fa-play fa-flip-horizontal'}`,
      style: {
        fontSize: 11
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setIsPlaying(false);
        setIsReversing(false);
      },
      style: {
        background: 'none',
        border: 'none',
        color: !isPlaying && !isReversing ? '#ffb300' : '#fff',
        cursor: 'pointer'
      },
      title: "Pause"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-pause",
      style: {
        fontSize: 11
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: handlePlayToggle,
      style: {
        background: 'none',
        border: 'none',
        color: isPlaying ? '#0dfca2' : '#64ffda',
        cursor: 'pointer'
      },
      title: isPlaying ? "Pause" : "Play Forward"
    }, /*#__PURE__*/React.createElement("i", {
      className: `fas ${isPlaying ? 'fa-pause' : 'fa-play'}`,
      style: {
        fontSize: 11
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: stepForward,
      style: {
        background: 'none',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        opacity: simTime < 1000 ? 0.8 : 0.3
      },
      disabled: simTime >= 1000,
      title: "Step Forward 1 Year"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-step-forward",
      style: {
        fontSize: 10
      }
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9.5,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        fontWeight: 'bold'
      }
    }, "Branch Parameters"), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 12,
        maxHeight: '220px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, paramDiffs.length > 0 ? paramDiffs.map((diff, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        fontSize: 10.5,
        borderBottom: i < paramDiffs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
        paddingBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.7)',
        fontWeight: 500
      }
    }, diff.label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'monospace'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#ff6b6b',
        textDecoration: 'line-through'
      }
    }, diff.original), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.4)'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-arrow-right",
      style: {
        fontSize: 8
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#0dfca2',
        fontWeight: 'bold'
      }
    }, diff.current)))) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        padding: '15px 0'
      }
    }, isPast ? 'Parameters match the original run. Tweak physical sliders below to define a new branch configuration.' : 'Simulating on main branch. Scroll down and modify parameters in real-time.'))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9.5,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        fontWeight: 'bold'
      }
    }, "Milestones"), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: '12px 14px',
        maxHeight: '220px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 19,
        top: 20,
        bottom: 20,
        width: 2,
        background: 'rgba(255,255,255,0.06)'
      }
    }), [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((m, idx) => {
      const maxSimulated = historyRef.current.length - 1;
      const isAvailable = m <= maxSimulated;
      const isCurrent = m === simTime;
      return /*#__PURE__*/React.createElement("div", {
        key: idx,
        onClick: () => isAvailable && handleScrub(m),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '6px 0',
          cursor: isAvailable ? 'pointer' : 'default',
          opacity: isAvailable ? 1 : 0.35
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: isCurrent ? '#0dfca2' : isAvailable ? '#3ca68e' : 'rgba(255,255,255,0.1)',
          border: `2px solid ${isCurrent ? '#fff' : 'transparent'}`,
          boxShadow: isCurrent ? '0 0 6px #0dfca2' : 'none',
          zIndex: 2,
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11.5,
          fontFamily: 'monospace',
          color: isCurrent ? '#0dfca2' : 'rgba(255,255,255,0.7)',
          fontWeight: isCurrent ? 'bold' : 'normal'
        }
      }, "Year ", m, " ", isCurrent && '←'));
    }))));
  })()), /*#__PURE__*/React.createElement("style", null, `
        .simulator-layout {
          display: grid;
          grid-template-columns: 1.40fr 1fr;
          gap: 25px;
          align-items: start;
        }
        .controls-subgrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .time-travel-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 330px;
          background: linear-gradient(135deg, rgba(25, 18, 38, 0.96) 0%, rgba(16, 20, 38, 0.96) 100%);
          border-right: 1px solid rgba(100, 255, 218, 0.18);
          box-shadow: 8px 0 32px rgba(0,0,0,0.5);
          backdrop-filter: blur(15px);
          z-index: 1000;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          padding: 100px 22px 30px;
        }
        .time-travel-sidebar.closed {
          transform: translateX(-100%);
        }
        .time-travel-sidebar.open {
          transform: translateX(0);
        }
        .sidebar-toggle-btn {
          position: fixed;
          bottom: 25px;
          left: 25px;
          z-index: 999;
          background: rgba(100,255,218,0.12);
          border: 1px solid rgba(100,255,218,0.4);
          color: #64ffda;
          padding: 10px 15px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.25);
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sidebar-toggle-btn:hover {
          background: rgba(100,255,218,0.22);
          box-shadow: 0 4px 20px rgba(100,255,218,0.35);
          transform: translateY(-2px);
        }
        @media (max-width: 1100px) {
          .simulator-layout {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .controls-subgrid {
            grid-template-columns: 1fr;
          }
          .simulator-page-wrapper {
            padding-left: 4% !important;
          }
          .time-travel-sidebar {
            width: 290px;
            padding-top: 90px;
          }
        }
      `), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: '0.20em',
      textTransform: 'uppercase',
      color: '#64ffda',
      fontWeight: 600,
      marginBottom: 6
    }
  }, "Interactive Numerical PDE Sandbox"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 'clamp(28px, 4vw, 38px)',
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: 15
    }
  }, "VE Gravity Tongue Simulator", /*#__PURE__*/React.createElement("button", {
    onClick: () => setSidebarOpen(!sidebarOpen),
    style: {
      background: sidebarOpen ? 'rgba(100, 255, 218, 0.25)' : 'rgba(100, 255, 218, 0.1)',
      border: `1px solid ${sidebarOpen ? '#64ffda' : 'rgba(100, 255, 218, 0.3)'}`,
      color: '#64ffda',
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '11px',
      cursor: 'pointer',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      transition: 'all 0.2s ease'
    },
    title: "Toggle Time Machine Sidebar"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-history"
  }), " ", sidebarOpen ? 'Close Time Machine' : 'Time Machine')), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      color: 'rgba(255,255,255,0.65)',
      fontSize: 13.5,
      maxWidth: 680
    }
  }, "Solve explicit Finite Volume Vertical Equilibrium (VE) equations dynamically. Tweak caprock topography, sandstone parameters, or injection variables in real-time.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      padding: '10px 14px',
      borderRadius: 14,
      backdropFilter: 'blur(8px)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9.5,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.5)',
      fontWeight: 600
    }
  }, "Synthetic Reservoir Cases"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, [{
    id: 'default',
    label: 'Default Case',
    icon: 'fa-project-diagram'
  }, {
    id: 'dome',
    label: 'Anticline Dome',
    icon: 'fa-mountain'
  }, {
    id: 'faulted',
    label: 'Faulted Trap',
    icon: 'fa-bolt'
  }, {
    id: 'monocline',
    label: 'Dipping Layer',
    icon: 'fa-sliders'
  }].map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    onClick: () => applyPreset(p.id),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: 'azure',
      padding: '6px 12px',
      borderRadius: 8,
      fontSize: 11.5,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${p.icon}`,
    style: {
      fontSize: 9.5,
      color: '#64ffda'
    }
  }), " ", p.label))))), /*#__PURE__*/React.createElement("div", {
    className: "simulator-layout"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      border: '1px solid rgba(100,255,218,0.18)',
      borderRadius: 20,
      boxShadow: '0 8px 32px rgba(0,0,0,0.30)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 450,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 10px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(0,0,0,0.15)',
      minHeight: '48px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveSubTab('profile'),
    style: {
      background: activeSubTab === 'profile' ? 'rgba(100, 255, 218, 0.08)' : 'none',
      border: 'none',
      borderBottom: activeSubTab === 'profile' ? '2px solid #64ffda' : '2px solid transparent',
      color: activeSubTab === 'profile' ? '#64ffda' : 'rgba(255,255,255,0.6)',
      padding: '12px 16px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-project-diagram",
    style: {
      marginRight: 6
    }
  }), " 2D Simulator"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveSubTab('uq'),
    style: {
      background: activeSubTab === 'uq' ? 'rgba(100, 255, 218, 0.08)' : 'none',
      border: 'none',
      borderBottom: activeSubTab === 'uq' ? '2px solid #64ffda' : '2px solid transparent',
      color: activeSubTab === 'uq' ? '#64ffda' : 'rgba(255,255,255,0.6)',
      padding: '12px 16px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-chart-bar",
    style: {
      marginRight: 6
    }
  }), " Sensitivity & UQ"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveSubTab('guide'),
    style: {
      background: activeSubTab === 'guide' ? 'rgba(100, 255, 218, 0.08)' : 'none',
      border: 'none',
      borderBottom: activeSubTab === 'guide' ? '2px solid #64ffda' : '2px solid transparent',
      color: activeSubTab === 'guide' ? '#64ffda' : 'rgba(255,255,255,0.6)',
      padding: '12px 16px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-book",
    style: {
      marginRight: 6
    }
  }), " PDE Methodology Guide")), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingRight: 8
    }
  }, activeSubTab === 'profile' ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: 'rgba(255,255,255,0.5)'
    }
  }, "Year ", simTime, " / 1000") : activeSubTab === 'uq' ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: 'rgba(255,255,255,0.5)'
    }
  }, "Monte Carlo Analysis") : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: 'rgba(255,255,255,0.5)'
    }
  }, "Methodology Guide"))), (() => {
    if (activeSubTab === 'profile') {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          position: 'relative',
          display: 'flex',
          background: '#1c1626'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          background: 'rgba(0,0,0,0.50)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '5px 12px',
          fontSize: 10,
          color: 'rgba(255,255,255,0.85)',
          zIndex: 5,
          pointerEvents: 'none'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: 2,
          background: '#0dfca2'
        }
      }), " Mobile CO\u2082 (S_g \u2192 0.90)"), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: 2,
          background: '#20c997',
          border: '1px solid #1a8e8f'
        }
      }), " Trapped Gas (S_gr \u2248 0.25)"), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 14,
          height: 0,
          borderTop: '2px dashed #64ffda'
        }
      }), " Max Envelope (h_max)"), hasCapillaryFringe && /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: 2,
          background: 'linear-gradient(180deg, #20c997, #1a8e8f, #0a2a4d)',
          border: '1px solid #20c997'
        }
      }), " Capillary Fringe"), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: 2,
          background: '#0a2a4d'
        }
      }), " Brine (S_w = 1.0)")), /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 1000 450",
        preserveAspectRatio: "none",
        style: {
          width: '100%',
          height: '100%',
          pointerEvents: 'auto'
        }
      }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
        id: "caprock-clipper"
      }, /*#__PURE__*/React.createElement("path", {
        d: `M 0 ${reservoirBlocks[0] ? reservoirBlocks[0].yt1 : capRockY(0)} ` + reservoirBlocks.map(b => `L ${b.x2} ${b.yt2}`).join(" ") + ` L 1000 ${stratumY(1000, cellCount - 1, 175)} ` + Array.from({
          length: cellCount + 1
        }, (_, idx) => {
          const k = cellCount - idx;
          const x = k * dx;
          return `L ${x} ${stratumY(x, Math.max(0, k - 1), 175)}`;
        }).join(" ") + ` Z`
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "plume-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#0dfca2",
        stopOpacity: "0.95"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "40%",
        stopColor: "#05e67c",
        stopOpacity: "0.85"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#05ab5e",
        stopOpacity: "0.75"
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "trapped-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#0b7a61",
        stopOpacity: "0.85"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#034d3c",
        stopOpacity: "0.75"
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "active-mobile-sim-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#0dfca2",
        stopOpacity: "0.98"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "45%",
        stopColor: "#0dfca2",
        stopOpacity: "0.95"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "70%",
        stopColor: "#05e67c",
        stopOpacity: "0.92"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "88%",
        stopColor: "#20c997",
        stopOpacity: "0.90"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#1a8e8f",
        stopOpacity: "0.85"
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "residual-trapped-sim-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#20c997",
        stopOpacity: "0.85"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "40%",
        stopColor: "#20c997",
        stopOpacity: "0.75"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "75%",
        stopColor: "#1a8e8f",
        stopOpacity: "0.65"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "92%",
        stopColor: "#125672",
        stopOpacity: "0.45"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#0a2a4d",
        stopOpacity: "0.25"
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "fringe-sim-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#20c997",
        stopOpacity: "0.80"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "50%",
        stopColor: "#1a8e8f",
        stopOpacity: "0.60"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "85%",
        stopColor: "#125672",
        stopOpacity: "0.35"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#0a2a4d",
        stopOpacity: "0.10"
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "brine-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#0a2a4d",
        stopOpacity: "0.85"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#051426",
        stopOpacity: "0.95"
      }))), /*#__PURE__*/React.createElement("path", {
        d: `M 0 0 L 1000 0 L 1000 ${capRockY(1000, cellCount - 1)} ` + Array.from({
          length: cellCount + 1
        }, (_, idx) => {
          const k = cellCount - idx;
          const x = k * dx;
          return `L ${x} ${capRockY(x, Math.max(0, k - 1))}`;
        }).join(" ") + ` Z`,
        fill: "#282030",
        stroke: "rgba(255,255,255,0.02)"
      }), reservoirBlocks.map((b, idx) => /*#__PURE__*/React.createElement("polygon", {
        key: idx,
        points: b.points,
        fill: b.fill,
        stroke: "rgba(0,0,0,0.06)",
        strokeWidth: "0.5"
      })), /*#__PURE__*/React.createElement("path", {
        d: `M 0 ${reservoirBlocks[0] ? reservoirBlocks[0].yt1 : capRockY(0)} ` + reservoirBlocks.map(b => `L ${b.x2} ${b.yt2}`).join(" ") + ` L 1000 ${stratumY(1000, cellCount - 1, 175)} ` + Array.from({
          length: cellCount + 1
        }, (_, idx) => {
          const k = cellCount - idx;
          const x = k * dx;
          return `L ${x} ${stratumY(x, Math.max(0, k - 1), 175)}`;
        }).join(" ") + ` Z`,
        fill: "url(#brine-grad)",
        opacity: "0.88"
      }), (() => {
        const cellInjIdx = Math.floor(injLocation / 100.0 * cellCount);
        const b = reservoirBlocks[cellInjIdx];
        if (!b) return null;
        return /*#__PURE__*/React.createElement("rect", {
          x: b.x1 + dx / 2.0 - 2,
          y: b.yt1,
          width: "4",
          height: b.yb1 - b.yt1,
          fill: "rgba(255,255,255,0.2)"
        });
      })(), /*#__PURE__*/React.createElement("g", {
        clipPath: "url(#caprock-clipper)"
      }, getSweptResidualSimPath() && /*#__PURE__*/React.createElement("path", {
        d: getSweptResidualSimPath(),
        fill: "url(#residual-trapped-sim-grad)",
        opacity: "0.92"
      }), getActiveMobileSimPath() && /*#__PURE__*/React.createElement("path", {
        d: getActiveMobileSimPath(),
        fill: "url(#active-mobile-sim-grad)",
        opacity: "0.98"
      }), getMaxHgLinePath() && /*#__PURE__*/React.createElement("path", {
        d: getMaxHgLinePath(),
        fill: "none",
        stroke: "#64ffda",
        strokeWidth: "1.4",
        strokeDasharray: "5 3.5",
        opacity: "0.85"
      })), /*#__PURE__*/React.createElement("path", {
        d: `M 0 ${stratumY(0, 0, 175)} ` + Array.from({
          length: cellCount + 1
        }, (_, idx) => {
          const x = idx * dx;
          return `L ${x} ${stratumY(x, Math.min(cellCount - 1, idx), 175)}`;
        }).join(" "),
        stroke: "rgba(0,0,0,0.3)",
        strokeWidth: "1",
        fill: "none"
      }), (() => {
        const cellInjIdx = Math.floor(injLocation / 100.0 * cellCount);
        const xWell = cellInjIdx * dx + dx / 2.0;
        const yCap = capRockY(xWell);
        return /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
          x1: xWell,
          y1: "0",
          x2: xWell,
          y2: yCap + 120,
          stroke: "url(#well-gradient)",
          strokeWidth: "4"
        }), Q > 0 && simTime <= injDuration && /*#__PURE__*/React.createElement("circle", {
          cx: xWell,
          cy: yCap + 90,
          r: "10",
          fill: "rgba(100,255,218,0.25)",
          style: {
            animation: 'pulseFlare 1.5s infinite'
          }
        }), Q > 0 && isPlaying && simTime <= injDuration && [0, 0.3, 0.6, 0.9].map((delay, idx) => /*#__PURE__*/React.createElement("circle", {
          key: idx,
          cx: xWell,
          cy: yCap * (idx / 4.0),
          r: "2",
          fill: "#0dfca2",
          style: {
            animation: `streakRise 1.5s linear ${delay}s infinite`
          }
        })));
      })(), Array.from({
        length: faultCount
      }).map((_, idx) => {
        const f = faults[idx];
        const inter = getSimFaultIntersection(f, idx);
        const color = f.isSealed ? '#64ffda' : '#ff6b6b';
        const yStart = 0;
        const yEnd = 450;
        const xStart = inter.x0 + inter.slope * yStart;
        const xEnd = inter.x0 + inter.slope * yEnd;
        return /*#__PURE__*/React.createElement("g", {
          key: idx
        }, /*#__PURE__*/React.createElement("line", {
          x1: xStart,
          y1: yStart,
          x2: xEnd,
          y2: yEnd,
          stroke: color,
          strokeWidth: "1.2",
          strokeDasharray: "3 3",
          opacity: "0.6"
        }));
      }), isPlaying && Array.from({
        length: faultCount
      }).map((_, idx) => {
        const f = faults[idx];
        if (f.isSealed) return null;
        const inter = getSimFaultIntersection(f, idx);
        const cellIdx = Math.round(cellCount * (inter.x / 1000.0));
        const boundedIdx = Math.max(0, Math.min(cellCount - 1, cellIdx));

        // Flow activates ONLY when total plume height exceeds spill threshold height
        if (h[boundedIdx] > f.thresholdHeight) {
          const travelY = -65; // Traverses through the overlying seal
          const travelX = inter.slope * travelY;
          const xTop = inter.x + travelX;
          const yTop = inter.y + travelY;
          return /*#__PURE__*/React.createElement("g", {
            key: `fl-group-${idx}`
          }, /*#__PURE__*/React.createElement("line", {
            x1: inter.x,
            y1: inter.y,
            x2: xTop,
            y2: yTop,
            stroke: "#ff6b6b",
            strokeWidth: "1.5",
            strokeDasharray: "4 3",
            opacity: "0.8",
            style: {
              animation: 'conduitFlow 1s linear infinite'
            }
          }), [0, 0.6, 1.2, 1.8].map((delay, i) => /*#__PURE__*/React.createElement("circle", {
            key: `fl-${idx}-${i}`,
            cx: inter.x,
            cy: inter.y,
            r: "1.6",
            fill: "#ff6b6b",
            style: {
              opacity: 0,
              '--travel-x': `${travelX}px`,
              '--travel-y': `${travelY}px`,
              animation: 'faultRiseTilted 2.0s cubic-bezier(0.25, 0.46, 0.45, 0.94) ' + delay + 's infinite'
            }
          })));
        }
        return null;
      }), /*#__PURE__*/React.createElement("text", {
        x: "30",
        y: capRockY(30) - 10,
        fill: "rgba(255,255,255,0.4)",
        fontSize: "9",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontFamily: "monospace"
      }, "Caprock Seal"), /*#__PURE__*/React.createElement("text", {
        x: "30",
        y: capRockY(30) + 80,
        fill: "rgba(255,255,255,0.4)",
        fontSize: "9",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontFamily: "monospace"
      }, "Sandstone Aquifer"), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
        id: "well-gradient",
        x1: "0",
        y1: "0",
        x2: "1",
        y2: "0"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#222"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "50%",
        stopColor: "#ccc"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#222"
      })))), /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          bottom: 15,
          left: '5%',
          right: '5%',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '8px 18px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '30px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          zIndex: 10
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: handlePlayReverseToggle,
        style: {
          background: 'none',
          border: 'none',
          color: isReversing ? '#ff6b6b' : '#64ffda',
          cursor: 'pointer',
          outline: 'none'
        },
        title: isReversing ? "Pause Reverse" : "Reverse Play"
      }, /*#__PURE__*/React.createElement("i", {
        className: `fas ${isReversing ? 'fa-pause' : 'fa-play fa-flip-horizontal'}`,
        style: {
          fontSize: 13
        }
      })), /*#__PURE__*/React.createElement("button", {
        onClick: handlePlayToggle,
        style: {
          background: 'none',
          border: 'none',
          color: isPlaying ? '#0dfca2' : '#64ffda',
          cursor: 'pointer',
          outline: 'none'
        },
        title: isPlaying ? "Pause" : "Play Forward"
      }, /*#__PURE__*/React.createElement("i", {
        className: `fas ${isPlaying ? 'fa-pause' : 'fa-play'}`,
        style: {
          fontSize: 13
        }
      })), /*#__PURE__*/React.createElement("button", {
        onClick: stepBackward,
        style: {
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          outline: 'none'
        },
        title: "Step 1 Year Backward"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-step-backward",
        style: {
          fontSize: 10
        }
      })), /*#__PURE__*/React.createElement("button", {
        onClick: stepForward,
        style: {
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          outline: 'none'
        },
        title: "Step 1 Year Forward"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-step-forward",
        style: {
          fontSize: 10
        }
      })), /*#__PURE__*/React.createElement("button", {
        onClick: resetSimulation,
        style: {
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          outline: 'none'
        },
        title: "Reset Simulation"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-redo",
        style: {
          fontSize: 11
        }
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 1,
          height: 14,
          background: 'rgba(255,255,255,0.2)'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10.5,
          fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.7)',
          minWidth: 50
        }
      }, "Yr ", simTime), /*#__PURE__*/React.createElement("input", {
        type: "range",
        min: "0",
        max: Math.max(1, historyRef.current.length - 1),
        value: simTime,
        onChange: e => handleScrub(parseInt(e.target.value)),
        style: {
          flex: 1,
          height: 3,
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 2,
          outline: 'none',
          cursor: 'pointer',
          accentColor: '#64ffda'
        },
        title: "Drag to seek/reverse simulation time"
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 1,
          height: 14,
          background: 'rgba(255,255,255,0.2)'
        }
      }), /*#__PURE__*/React.createElement("button", {
        onClick: () => setSpeed(s => s === 1 ? 2 : s === 2 ? 4 : 1),
        style: {
          background: 'none',
          border: 'none',
          color: '#64ffda',
          cursor: 'pointer',
          fontSize: 10,
          fontWeight: 'bold',
          outline: 'none'
        }
      }, speed, "x")));
    } else if (activeSubTab === 'uq') {
      return (
        /*#__PURE__*/
        /* Sensitivity & UQ Dashboard UI panel */
        React.createElement("div", {
          style: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: '#1c1626',
            padding: '20px 25px',
            gap: 20,
            overflowY: 'auto',
            minHeight: 450
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1fr',
            gap: 20,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 14,
            padding: 16
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }
        }, "Uncertainty Ranges"), /*#__PURE__*/React.createElement(Slider, {
          label: "Permeability (K) range",
          val: `\u00B1${Math.round(kUncertainty * 100)}%`,
          min: "0.10",
          max: "0.80",
          step: "0.05",
          value: kUncertainty,
          onChange: v => setKUncertainty(parseFloat(v))
        }), /*#__PURE__*/React.createElement(Slider, {
          label: "Residual Trap (Sgr) range",
          val: `\u00B1${Math.round(sgrUncertainty * 100)}%`,
          min: "0.10",
          max: "0.80",
          step: "0.05",
          value: sgrUncertainty,
          onChange: v => setSgrUncertainty(parseFloat(v))
        }), faultCount > 0 && /*#__PURE__*/React.createElement(Slider, {
          label: "Fault Seal Threshold range",
          val: `\u00B1${Math.round(faultThreshUncertainty * 100)}%`,
          min: "0.10",
          max: "0.80",
          step: "0.05",
          value: faultThreshUncertainty,
          onChange: v => setFaultThreshUncertainty(parseFloat(v))
        })), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }
        }, "Simulation Settings"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10.5,
            color: 'rgba(255,255,255,0.7)'
          }
        }, "Monte Carlo Realizations:"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            gap: 4,
            marginTop: 2
          }
        }, [25, 50, 100].map(cnt => /*#__PURE__*/React.createElement("button", {
          key: cnt,
          onClick: () => setMcRunsCount(cnt),
          style: {
            background: mcRunsCount === cnt ? 'rgba(100,255,218,0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${mcRunsCount === cnt ? '#64ffda' : 'rgba(255,255,255,0.12)'}`,
            color: mcRunsCount === cnt ? '#64ffda' : 'azure',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 10.5,
            fontWeight: 'bold',
            cursor: 'pointer',
            outline: 'none'
          }
        }, cnt, " runs")))), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10.5,
            color: 'rgba(255,255,255,0.7)'
          }
        }, "Target Storage Metric:"), /*#__PURE__*/React.createElement("select", {
          value: uqTargetMetric,
          onChange: e => setUqTargetMetric(e.target.value),
          style: {
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: 8,
            fontSize: 11,
            cursor: 'pointer',
            outline: 'none'
          }
        }, /*#__PURE__*/React.createElement("option", {
          value: "leaked"
        }, "CO\\u2082 Leakage Mass (ktonnes)"), /*#__PURE__*/React.createElement("option", {
          value: "trapped"
        }, "Residual Trapping Efficiency (%)")))), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10
          }
        }, /*#__PURE__*/React.createElement("button", {
          onClick: runMonteCarloBatch,
          disabled: uqRunning,
          style: {
            background: uqRunning ? 'rgba(255,255,255,0.05)' : '#64ffda',
            border: 'none',
            color: uqRunning ? 'rgba(255,255,255,0.3)' : '#000',
            padding: '12px 20px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 'bold',
            cursor: uqRunning ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: uqRunning ? 'none' : '0 4px 15px rgba(100,255,218,0.25)',
            transition: 'all 0.2s ease',
            width: '100%',
            justifyContent: 'center'
          }
        }, uqRunning ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
          className: "fas fa-spinner fa-spin"
        }), " Simulating...") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
          className: "fas fa-play"
        }), " Run Uncertainty Analysis")), uqRunning && /*#__PURE__*/React.createElement("div", {
          style: {
            width: '100%',
            marginTop: 4
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 9.5,
            color: 'rgba(255,255,255,0.6)',
            marginBottom: 3
          }
        }, /*#__PURE__*/React.createElement("span", null, "Running Batch"), /*#__PURE__*/React.createElement("span", null, uqProgress, "%")), /*#__PURE__*/React.createElement("div", {
          style: {
            height: 4,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            overflow: 'hidden'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            width: `${uqProgress}%`,
            height: '100%',
            background: '#64ffda',
            transition: 'width 0.1s ease'
          }
        }))))), uqData ? /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 15
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 15
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }
        }, "Uncertainty Distribution (", uqTargetMetric === 'leaked' ? 'CO\u2082 Leaked Mass' : 'Trapping Efficiency', ")"), renderUQHistogram(uqData)), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }
        }, "Parameter Correlation Coefficients (Pearson r)"), renderUQSensitivity(sensitivityData))), /*#__PURE__*/React.createElement("div", {
          style: {
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 14,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10.5,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }
        }, "Probabilistic Risk Models"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 10
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: 'rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: 10,
            padding: '10px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 9.5,
            color: '#64ffda',
            fontWeight: 'bold'
          }
        }, "P10 (Low Risk)"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 13,
            fontWeight: 'bold',
            fontFamily: 'monospace',
            marginTop: 2
          }
        }, uqData.p10Val.toFixed(1), uqTargetMetric === 'leaked' ? ' kt' : '%')), /*#__PURE__*/React.createElement("button", {
          onClick: () => loadUQRealization(uqData.p10Realization),
          style: {
            background: 'rgba(100,255,218,0.1)',
            border: '1px solid rgba(100,255,218,0.3)',
            color: '#64ffda',
            padding: '6px 10px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none'
          }
        }, "Load Model")), /*#__PURE__*/React.createElement("div", {
          style: {
            background: 'rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: 10,
            padding: '10px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 9.5,
            color: '#ffb300',
            fontWeight: 'bold'
          }
        }, "P50 (Expected)"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 13,
            fontWeight: 'bold',
            fontFamily: 'monospace',
            marginTop: 2
          }
        }, uqData.p50Val.toFixed(1), uqTargetMetric === 'leaked' ? ' kt' : '%')), /*#__PURE__*/React.createElement("button", {
          onClick: () => loadUQRealization(uqData.p50Realization),
          style: {
            background: 'rgba(255,179,0,0.1)',
            border: '1px solid rgba(255,179,0,0.3)',
            color: '#ffb300',
            padding: '6px 10px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none'
          }
        }, "Load Model")), /*#__PURE__*/React.createElement("div", {
          style: {
            background: 'rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: 10,
            padding: '10px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 9.5,
            color: '#ff6b6b',
            fontWeight: 'bold'
          }
        }, "P90 (High Risk)"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 13,
            fontWeight: 'bold',
            fontFamily: 'monospace',
            marginTop: 2
          }
        }, uqData.p90Val.toFixed(1), uqTargetMetric === 'leaked' ? ' kt' : '%')), /*#__PURE__*/React.createElement("button", {
          onClick: () => loadUQRealization(uqData.p90Realization),
          style: {
            background: 'rgba(255,107,107,0.1)',
            border: '1px solid rgba(255,107,107,0.3)',
            color: '#ff6b6b',
            padding: '6px 10px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none'
          }
        }, "Load Model"))))) : /*#__PURE__*/React.createElement("div", {
          style: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.1)',
            border: '1px dashed rgba(255,255,255,0.08)',
            borderRadius: 14,
            padding: 40,
            textAlign: 'center'
          }
        }, /*#__PURE__*/React.createElement("i", {
          className: "fas fa-calculator",
          style: {
            fontSize: 36,
            color: 'rgba(255,255,255,0.15)',
            marginBottom: 15
          }
        }), /*#__PURE__*/React.createElement("h4", {
          style: {
            margin: 0,
            fontSize: 13.5,
            color: 'rgba(255,255,255,0.8)'
          }
        }, "Uncalculated Probability Space"), /*#__PURE__*/React.createElement("p", {
          style: {
            margin: '6px 0 0',
            fontSize: 11.5,
            color: 'rgba(255,255,255,0.45)',
            maxWidth: 380
          }
        }, "Configure parameter uncertainties above and run the batch simulator to generate risk distributions and sensitivity analyses.")))
      );
    } else {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#1c1626',
          padding: '20px 25px',
          overflowY: 'auto',
          minHeight: 450
        }
      }, /*#__PURE__*/React.createElement(GuidePage, {
        isEmbedded: true
      }));
    }
  })()), /*#__PURE__*/React.createElement("div", {
    className: "controls-subgrid"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20,
      padding: '18px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
      backdropFilter: 'blur(12px)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 14px',
      fontSize: 14,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: '#64ffda',
      fontFamily: "'Montserrat', sans-serif"
    }
  }, "Simulation Parameters"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      paddingBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.4)',
      textTransform: 'uppercase',
      fontWeight: 'bold'
    }
  }, "Topography Spline (Caprock)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Slider, {
    label: "Regional Dip",
    val: `${dipPercent}%`,
    min: "-5",
    max: "5",
    step: "0.5",
    value: dipPercent,
    onChange: v => setDipPercent(parseFloat(v))
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Anticline Height",
    val: `${amplitude}px`,
    min: "0",
    max: "50",
    step: "5",
    value: amplitude,
    onChange: v => setAmplitude(parseInt(v))
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Anticline Count",
    val: frequency,
    min: "0.5",
    max: "4.0",
    step: "0.5",
    value: frequency,
    onChange: v => setFrequency(parseFloat(v))
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Fault Slip",
    val: `${faultOffset}x`,
    min: "0",
    max: "3",
    step: "0.2",
    value: faultOffset,
    onChange: v => setFaultOffset(parseFloat(v))
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      paddingBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.4)',
      textTransform: 'uppercase',
      fontWeight: 'bold'
    }
  }, "Sandstone Properties"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Slider, {
    label: "Permeability (K)",
    val: `${Math.round(K * 1000)} mD`,
    min: "0.1",
    max: "3.5",
    step: "0.1",
    value: K,
    onChange: v => setK(parseFloat(v))
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Porosity (phi)",
    val: `${Math.round(porosity * 100)}%`,
    min: "0.1",
    max: "0.4",
    step: "0.05",
    value: porosity,
    onChange: v => setPorosity(parseFloat(v))
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Grid Cells (N)",
    val: cellCount,
    min: "50",
    max: "300",
    step: "10",
    value: cellCount,
    onChange: v => setCellCount(parseInt(v))
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Residual Trap (Sgr)",
    val: `${Math.round(residualTrapFraction * 100)}%`,
    min: "0.0",
    max: "0.4",
    step: "0.05",
    value: residualTrapFraction,
    onChange: v => setResidualTrapFraction(parseFloat(v))
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      paddingBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.4)',
      textTransform: 'uppercase',
      fontWeight: 'bold'
    }
  }, "Capillary Fringe (P_c Transition)"), /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 10.5,
      cursor: 'pointer',
      color: hasCapillaryFringe ? '#64ffda' : 'rgba(255,255,255,0.5)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: hasCapillaryFringe,
    onChange: e => setHasCapillaryFringe(e.target.checked),
    style: {
      accentColor: '#64ffda'
    }
  }), "Enable Fringe")), hasCapillaryFringe && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Slider, {
    label: "Fringe Height (h_c)",
    val: `${fringeScale.toFixed(2)} m`,
    min: "0.10",
    max: "3.00",
    step: "0.10",
    value: fringeScale,
    onChange: v => setFringeScale(parseFloat(v))
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Entry Capillary P_e",
    val: `${entryPressure} kPa`,
    min: "5",
    max: "40",
    step: "1",
    value: entryPressure,
    onChange: v => setEntryPressure(parseInt(v))
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.4)',
      textTransform: 'uppercase',
      fontWeight: 'bold'
    }
  }, "Injection Settings"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Slider, {
    label: "Flow Rate (Q)",
    val: Q,
    min: "0.0",
    max: "3.5",
    step: "0.1",
    value: Q,
    onChange: v => setQ(parseFloat(v))
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Well Location",
    val: `${injLocation}%`,
    min: "10",
    max: "90",
    step: "5",
    value: injLocation,
    onChange: v => setInjLocation(parseInt(v))
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Inj. Stop Year",
    val: `${injDuration}y`,
    min: "50",
    max: "400",
    step: "10",
    value: injDuration,
    onChange: v => setInjDuration(parseInt(v))
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20,
      padding: '18px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
      backdropFilter: 'blur(12px)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 14px',
      fontSize: 14,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: '#64ffda',
      fontFamily: "'Montserrat', sans-serif"
    }
  }, "Fault Management"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 15
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.7)'
    }
  }, "Active Faults:"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, [0, 1, 2, 3].map(cnt => /*#__PURE__*/React.createElement("button", {
    key: cnt,
    onClick: () => setFaultCount(cnt),
    style: {
      background: faultCount === cnt ? 'rgba(100,255,218,0.2)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${faultCount === cnt ? '#64ffda' : 'rgba(255,255,255,0.12)'}`,
      color: faultCount === cnt ? '#64ffda' : 'azure',
      padding: '4px 10px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    }
  }, cnt)))), faultCount > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, Array.from({
    length: faultCount
  }).map((_, idx) => {
    const f = faults[idx];
    const label = `Fault ${String.fromCharCode(65 + idx)}`;
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      style: {
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: 12,
        padding: '10px 12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11.5,
        fontWeight: 'bold',
        color: f.isSealed ? '#64ffda' : '#ff6b6b'
      }
    }, label), /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 10.5,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: f.isSealed,
      onChange: e => {
        const newFaults = [...faults];
        newFaults[idx].isSealed = e.target.checked;
        setFaults(newFaults);
      },
      style: {
        accentColor: '#64ffda'
      }
    }), "Sealed (Infinite Barrier)")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Slider, {
      label: "Position",
      val: `${f.xPercent}%`,
      min: "10",
      max: "90",
      step: "5",
      value: f.xPercent,
      onChange: v => {
        const newFaults = [...faults];
        newFaults[idx].xPercent = parseInt(v);
        setFaults(newFaults);
      }
    }), /*#__PURE__*/React.createElement(Slider, {
      label: "Capillary Threshold",
      val: `${f.thresholdHeight} m`,
      min: "0.0",
      max: "2.0",
      step: "0.1",
      value: f.thresholdHeight,
      onChange: v => {
        const newFaults = [...faults];
        newFaults[idx].thresholdHeight = parseFloat(v);
        setFaults(newFaults);
      }
    }), /*#__PURE__*/React.createElement(Slider, {
      label: "Horiz. Transmissibility",
      val: f.transmissibility !== undefined ? f.transmissibility.toFixed(2) : "1.00",
      min: "0.0",
      max: "1.0",
      step: "0.05",
      value: f.transmissibility !== undefined ? f.transmissibility : 1.0,
      onChange: v => {
        const newFaults = [...faults];
        newFaults[idx].transmissibility = parseFloat(v);
        setFaults(newFaults);
      }
    }), !f.isSealed ? /*#__PURE__*/React.createElement(Slider, {
      label: "Leakage Rate",
      val: f.leakRate,
      min: "0.01",
      max: "0.40",
      step: "0.02",
      value: f.leakRate,
      onChange: v => {
        const newFaults = [...faults];
        newFaults[idx].leakRate = parseFloat(v);
        setFaults(newFaults);
      }
    }) : /*#__PURE__*/React.createElement("div", null)));
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      position: 'sticky',
      top: 110
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20,
      padding: '18px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 14,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: '#64ffda',
      fontFamily: "'Montserrat', sans-serif"
    }
  }, "CO\u2082 Mass Balance"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      fontFamily: 'monospace',
      color: 'rgba(255,255,255,0.5)'
    }
  }, "Values in ktonnes")), renderSVGChart(), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 8,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(StatBox, {
    label: "Injected",
    value: Math.round(currentMasses.injected),
    color: "#ffffff",
    opacity: "0.6"
  }), /*#__PURE__*/React.createElement(StatBox, {
    label: "Mobile Plume",
    value: Math.round(currentMasses.mobile),
    color: "#64ffda"
  }), /*#__PURE__*/React.createElement(StatBox, {
    label: "Trapped",
    value: Math.round(currentMasses.trapped),
    color: "#3ca68e"
  }), /*#__PURE__*/React.createElement(StatBox, {
    label: "Leaked",
    value: Math.round(currentMasses.leaked),
    color: "#ff6b6b"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      borderTop: '1px solid rgba(255,255,255,0.06)',
      paddingTop: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.4)',
      textTransform: 'uppercase',
      fontWeight: 'bold'
    }
  }, "Storage Efficiency"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    label: "Structural Trapping (Mobile)",
    pct: currentMasses.injected > 0 ? currentMasses.mobile / currentMasses.injected * 100 : 0,
    color: "#64ffda"
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "Residual Capillary Trapping",
    pct: currentMasses.injected > 0 ? currentMasses.trapped / currentMasses.injected * 100 : 0,
    color: "#3ca68e"
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "Cumulative Leaked Fraction",
    pct: currentMasses.injected > 0 ? currentMasses.leaked / currentMasses.injected * 100 : 0,
    color: "#ff6b6b"
  })))))));
};

// Slider Input helper component
const Slider = ({
  label,
  val,
  min,
  max,
  step,
  value,
  onChange
}) => {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 10.5,
      color: 'rgba(255,255,255,0.8)'
    }
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'monospace',
      color: '#64ffda'
    }
  }, val)), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(e.target.value),
    style: {
      width: '100%',
      height: 3,
      background: 'rgba(255,255,255,0.15)',
      borderRadius: 2,
      outline: 'none',
      cursor: 'pointer',
      accentColor: '#64ffda'
    }
  }));
};

// Stat numeric display helper component
const StatBox = ({
  label,
  value,
  color,
  opacity
}) => {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(0,0,0,0.12)',
      border: '1px solid rgba(255,255,255,0.04)',
      borderRadius: 10,
      padding: '8px 4px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.45)',
      marginBottom: 2
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 'bold',
      color: color,
      fontFamily: 'monospace',
      opacity: opacity
    }
  }, value));
};

// Storage Efficiency Progress Bar helper component
const ProgressBar = ({
  label,
  pct,
  color
}) => {
  // Cap at 100%
  const clampedPct = Math.max(0, Math.min(100, pct));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,0.7)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      color: color,
      fontWeight: 'bold'
    }
  }, Math.round(clampedPct), "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      background: 'rgba(255,255,255,0.1)',
      borderRadius: 2,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${clampedPct}%`,
      height: '100%',
      background: color,
      borderRadius: 2,
      transition: 'width 0.3s ease'
    }
  })));
};

// Bind to window object for Babel execution scope
Object.assign(window, {
  SimulatorPage
});

// ==========================================
// File: App.jsx
// ==========================================
// App.jsx — top-level wiring

// [destructured React]

const App = () => {
  const [screen, setScreen] = useState('home');
  const [activeSection, setActiveSection] = useState('home');
  const onNavigate = id => {
    if (id === 'cv') {
      setScreen('cv');
      setActiveSection('cv');
      window.scrollTo(0, 0);
      return;
    }
    if (id === 'simulator') {
      setScreen('simulator');
      setActiveSection('simulator');
      window.scrollTo(0, 0);
      return;
    }
    setScreen('home');
    if (id === 'home') {
      setActiveSection('home');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }

    // smooth-scroll to anchor on home
    setTimeout(() => {
      const targetId = id === 'research' ? 'publications' : id;
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        setActiveSection(targetId);
      } else {
        window.scrollTo(0, 0);
      }
    }, 50);
  };

  // Expose onNavigate globally for child buttons
  useEffect(() => {
    window.__onNavigate = onNavigate;
  }, []);

  // Dismiss 0ms pre-React loading screen once components mount and initial simulation renders
  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      const startTime = window.__pageLoadStart || Date.now();
      const elapsed = Date.now() - startTime;
      const minDuration = 1550; // 1.55s clean sequence playback
      const remaining = Math.max(100, minDuration - elapsed);
      const timer = setTimeout(() => {
        loader.classList.add('loader-finished');
        setTimeout(() => {
          if (loader && loader.parentNode) {
            loader.parentNode.removeChild(loader);
          }
        }, 700);
      }, remaining);
      return () => clearTimeout(timer);
    }
  }, []);

  // Track active section on home screen using scroll listener
  useEffect(() => {
    if (screen !== 'home') {
      setActiveSection(screen);
      return;
    }
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      const sections = ['contact', 'publications', 'about', 'home'];
      for (const s of sections) {
        const el = document.getElementById(s);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(s);
          return;
        }
      }
      setActiveSection('home');
    };
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [screen]);
  const currentNav = screen === 'home' ? activeSection : screen;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #211d34 0%, #1c2645 50%, #1d416e 100%)',
      color: '#fff',
      fontFamily: "'Montserrat', sans-serif"
    },
    "data-screen-label": screen === 'cv' ? '02 CV' : screen === 'simulator' ? '03 VE Simulator' : '01 Home'
  }, /*#__PURE__*/React.createElement(Header, {
    active: currentNav,
    onNavigate: onNavigate
  }), screen === 'home' ? /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(StratigraphicDepthHUD, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement(SubsurfaceHero, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement("div", {
    id: "about"
  }), /*#__PURE__*/React.createElement(AboutSection, null), /*#__PURE__*/React.createElement("div", {
    id: "research"
  }), /*#__PURE__*/React.createElement("div", {
    id: "publications"
  }), /*#__PURE__*/React.createElement(PublicationsList, null), /*#__PURE__*/React.createElement("div", {
    id: "contact"
  }), /*#__PURE__*/React.createElement(ContactSection, null), /*#__PURE__*/React.createElement(Footer, {
    onNavigate: onNavigate
  })) : screen === 'simulator' ? /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(SimulatorPage, null), /*#__PURE__*/React.createElement(Footer, {
    onNavigate: onNavigate
  })) : /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(CVPage, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement(Footer, {
    onNavigate: onNavigate
  })));
};
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render( /*#__PURE__*/React.createElement(App, null));

