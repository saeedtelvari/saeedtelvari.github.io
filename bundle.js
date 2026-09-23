"use strict";
// Auto-generated bundle — Pre-compiled for instant execution
var { useState, useEffect, useMemo, useRef, useCallback } = React;

// File: Primitives.jsx
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
  const [pressed, setPressed] = useState(false);
  const base = {
    background: 'linear-gradient(145deg, rgba(18, 22, 38, 0.78) 0%, rgba(14, 18, 33, 0.72) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderTop: '1px solid rgba(255,255,255,0.15)',
    borderLeft: '1px solid rgba(255,255,255,0.12)',
    borderRadius: radius,
    padding,
    boxShadow: '0 8px 26px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.08)',
    transition: 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 200ms ease, border-color 200ms ease',
    color: 'rgba(255,255,255,0.92)',
    cursor: onClick ? 'pointer' : 'default',
    ...style
  };
  if (hover && hovered) {
    base.transform = 'translateY(-3px)';
    base.borderColor = 'rgba(100, 255, 218, 0.35)';
    base.boxShadow = '0 12px 32px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 20px rgba(100,255,218,0.12)';
  }
  if (onClick && pressed) {
    base.transform = 'scale(0.98)';
  }
  return /*#__PURE__*/React.createElement("div", {
    className: `glass-card ${className}`.trim(),
    style: base,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => {
      setHovered(false);
      setPressed(false);
    },
    onMouseDown: () => {
      if (onClick) setPressed(true);
    },
    onMouseUp: () => setPressed(false),
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
    transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 160ms ease, border-color 160ms ease, background 160ms ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
    userSelect: 'none',
    ...style
  };
  if (state === 'hover') {
    base.transform = 'translateY(-2px) scale(1.02)';
    base.boxShadow = '0 8px 25px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.40), 0 0 20px rgba(255,255,255,0.10)';
    base.borderColor = 'rgba(255,255,255,0.55)';
  } else if (state === 'press') {
    base.transform = 'scale(0.97)';
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
   Section panel — large rounded glass with geological stratigraphy
   ===================================================== */
const SectionPanel = ({
  children,
  strataTheme = 'sedimentary',
  style = {}
}) => {
  return /*#__PURE__*/React.createElement("section", {
    className: "section-panel",
    style: {
      position: 'relative',
      minHeight: '60vh',
      padding: '115px 24px',
      zIndex: 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-panel-content",
    style: {
      position: 'relative',
      maxWidth: 1000,
      margin: '0 auto',
      background: strataTheme === 'mantle' ? 'rgba(26,24,30,0.62)' : 'rgba(16,24,35,0.58)',
      backdropFilter: 'blur(3px)',
      WebkitBackdropFilter: 'blur(3px)',
      border: '1px solid rgba(198,210,211,0.15)',
      borderRadius: 18,
      boxShadow: '0 24px 60px rgba(5,10,17,0.22)'
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
  Reveal
});

// File: Header.jsx
// Header.jsx — fixed top navbar, transparent over hero, shrinks on scroll, with mobile drawer.

// [destructured React]

const HEADER_FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const getHeaderFocusWrapTarget = (focusables, activeElement, backwards) => {
  if (!focusables.length) return null;
  const currentIndex = focusables.indexOf(activeElement);
  if (currentIndex === -1) return backwards ? focusables[focusables.length - 1] : focusables[0];
  if (backwards && currentIndex === 0) return focusables[focusables.length - 1];
  if (!backwards && currentIndex === focusables.length - 1) return focusables[0];
  return null;
};
const setHeaderBackgroundInert = (element, inert) => {
  if (element) element.inert = inert;
};
const Header = ({
  active,
  onNavigate,
  variant = 'site'
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(active);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const mobileDrawerRef = useRef(null);

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
    if (variant === 'workbench') return undefined;
    const onKeyDown = e => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
        menuButtonRef.current && menuButtonRef.current.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, variant]);
  useEffect(() => {
    if (variant !== 'workbench' && mobileOpen && closeButtonRef.current) closeButtonRef.current.focus();
  }, [mobileOpen, variant]);
  useEffect(() => {
    if (variant !== 'workbench' || !mobileOpen) return undefined;
    const mainContent = document.getElementById('main-content');
    const drawer = mobileDrawerRef.current;
    setHeaderBackgroundInert(mainContent, true);
    if (closeButtonRef.current) closeButtonRef.current.focus();
    const onModalKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !drawer) return;
      const focusables = Array.from(drawer.querySelectorAll(HEADER_FOCUSABLE_SELECTOR));
      const target = getHeaderFocusWrapTarget(focusables, document.activeElement, event.shiftKey);
      if (target) {
        event.preventDefault();
        target.focus();
      }
    };
    document.addEventListener('keydown', onModalKeyDown);
    return () => {
      document.removeEventListener('keydown', onModalKeyDown);
      setHeaderBackgroundInert(mainContent, false);
      if (menuButtonRef.current) menuButtonRef.current.focus();
    };
  }, [mobileOpen, variant]);
  const items = [{
    id: 'home',
    label: 'Home',
    href: './index.html'
  }, {
    id: 'about',
    label: 'About',
    href: './index.html#about'
  }, {
    id: 'publications',
    label: 'Research',
    href: './index.html#publications'
  }, {
    id: 'simulator',
    label: 'VE Simulator',
    href: './simulator.html'
  }, {
    id: 'contact',
    label: 'Contact',
    href: './index.html#contact'
  }, {
    id: 'cv',
    label: 'CV',
    href: './index.html#cv'
  }];
  const handleItemClick = id => {
    setMobileOpen(false);
    if (onNavigate) onNavigate(id);else if (window.__onNavigate) window.__onNavigate(id);
  };
  const isWorkbench = variant === 'workbench';
  const drawerPalette = isWorkbench ? {
    divider: 'var(--ve-border)',
    ink: 'var(--ve-ink)',
    link: 'var(--ve-ink)',
    muted: 'var(--ve-muted)',
    subtle: 'var(--ve-muted)',
    accent: 'var(--ve-accent)',
    activeBackground: 'var(--ve-accent-soft)',
    activeBorder: 'var(--ve-accent)'
  } : {
    divider: 'rgba(255,255,255,0.08)',
    ink: '#fff',
    link: 'rgba(255,255,255,0.85)',
    muted: 'rgba(255,255,255,0.6)',
    subtle: 'rgba(255,255,255,0.5)',
    accent: '#64ffda',
    activeBackground: 'rgba(100,255,218,0.15)',
    activeBorder: 'rgba(100,255,218,0.35)'
  };
  const siteScrolledBackground = 'linear-gradient(180deg, rgba(19, 13, 28, 0.92) 0%, rgba(19, 13, 28, 0.75) 100%)';
  const siteTopBackground = 'linear-gradient(180deg, rgba(19, 13, 28, 0.60) 0%, rgba(19, 13, 28, 0.20) 60%, transparent 100%)';
  const siteBorderBottom = scrolled ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent';
  const siteBoxShadow = scrolled ? '0 4px 30px rgba(0,0,0,0.30), inset 0 -1px 0 rgba(255,255,255,0.08)' : 'none';
  return /*#__PURE__*/React.createElement("header", {
    className: isWorkbench ? 'app-header app-header--workbench' : 'app-header',
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
        .hamburger-btn.workbench {
          background: #fff;
          border-color: var(--ve-border);
          color: var(--ve-ink);
          backdrop-filter: none;
          transition: color 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 160ms cubic-bezier(0.23, 1, 0.32, 1), border-color 160ms cubic-bezier(0.23, 1, 0.32, 1);
        }
        .hamburger-btn.workbench:hover {
          background: #f3f6f8;
          border-color: var(--ve-border);
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
        .mobile-drawer-backdrop.workbench {
          background: rgba(15, 30, 42, 0.38);
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          transition: opacity 180ms cubic-bezier(0.23, 1, 0.32, 1);
        }
        .mobile-drawer-panel.workbench {
          background: #fff;
          border-left: 1px solid var(--ve-border);
          box-shadow: none;
          transition: transform 180ms cubic-bezier(0.23, 1, 0.32, 1);
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
      height: isWorkbench ? 56 : scrolled ? 64 : 88,
      padding: '0 36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: isWorkbench ? 'none' : 'all 0.4s ease',
      background: isWorkbench ? '#ffffff' : scrolled ? siteScrolledBackground : siteTopBackground,
      backdropFilter: isWorkbench ? 'none' : scrolled ? 'blur(20px) saturate(180%)' : 'blur(6px)',
      WebkitBackdropFilter: isWorkbench ? 'none' : scrolled ? 'blur(20px) saturate(180%)' : 'blur(6px)',
      borderBottom: isWorkbench ? '1px solid var(--ve-border)' : siteBorderBottom,
      boxShadow: isWorkbench ? 'none' : siteBoxShadow,
      pointerEvents: 'auto'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "./index.html",
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
      transition: isWorkbench ? 'none' : 'all 0.4s ease'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "./assets/logo-minimalist.webp",
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
    href: it.href,
    active: currentSection === it.id,
    onClick: () => handleItemClick(it.id),
    variant: variant
  })))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    ref: menuButtonRef,
    className: `hamburger-btn${isWorkbench ? ' workbench' : ''}`,
    onClick: () => setMobileOpen(!mobileOpen),
    "aria-expanded": mobileOpen,
    "aria-label": mobileOpen ? "Close navigation menu" : "Open navigation menu"
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${mobileOpen ? 'fa-times' : 'fa-bars'}`
  }))), mobileOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: `mobile-drawer-backdrop open${isWorkbench ? ' workbench' : ''}`,
    onClick: () => setMobileOpen(false),
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    ref: mobileDrawerRef,
    className: `mobile-drawer-panel open${isWorkbench ? ' workbench' : ''}`,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Mobile Navigation"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: `1px solid ${drawerPalette.divider}`,
      paddingBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "./assets/logo-minimalist.webp",
    alt: "",
    style: {
      width: 32,
      height: 32,
      objectFit: 'contain'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: drawerPalette.ink,
      letterSpacing: '-0.01em'
    }
  }, "Sa\u2019eed Telvari")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    ref: closeButtonRef,
    onClick: () => setMobileOpen(false),
    "aria-label": "Close menu",
    style: {
      background: 'none',
      border: 'none',
      color: drawerPalette.muted,
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
    }, /*#__PURE__*/React.createElement("a", {
      href: it.href,
      onClick: e => {
        e.preventDefault();
        handleItemClick(it.id);
      },
      style: {
        width: '100%',
        textAlign: 'left',
        padding: '12px 16px',
        borderRadius: 12,
        background: isActive ? drawerPalette.activeBackground : 'transparent',
        border: isActive ? `1px solid ${drawerPalette.activeBorder}` : '1px solid transparent',
        color: isActive ? drawerPalette.accent : drawerPalette.link,
        fontSize: 15,
        fontWeight: isActive ? 600 : 400,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: isWorkbench ? 'color 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 160ms cubic-bezier(0.23, 1, 0.32, 1), border-color 160ms cubic-bezier(0.23, 1, 0.32, 1)' : 'all 0.2s ease'
      }
    }, /*#__PURE__*/React.createElement("span", null, it.label), isActive && /*#__PURE__*/React.createElement("i", {
      className: "fas fa-chevron-right",
      style: {
        fontSize: 11,
        color: drawerPalette.accent
      }
    })));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      borderTop: `1px solid ${drawerPalette.divider}`,
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: drawerPalette.subtle,
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
      color: drawerPalette.accent,
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
      color: drawerPalette.accent,
      fontSize: 16
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fab fa-github"
  })), /*#__PURE__*/React.createElement("a", {
    href: "mailto:st4014@hw.ac.uk",
    "aria-label": "Email",
    style: {
      color: drawerPalette.accent,
      fontSize: 16
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-envelope"
  })))))));
};
const NavItem = ({
  label,
  href,
  active,
  onClick,
  variant = 'site'
}) => {
  const [hover, setHover] = useState(false);
  const showPill = hover || active;
  const existingBackground = showPill ? 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 100%)' : 'transparent';
  const existingBorder = active ? '1px solid rgba(100,255,218,0.40)' : showPill ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent';
  const existingTransform = hover ? 'translateY(-2px)' : 'translateY(0)';
  return /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onClick: e => {
      e.preventDefault();
      onClick();
    },
    "aria-current": active ? 'page' : undefined,
    style: {
      position: 'relative',
      padding: '8px 16px',
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 14.5,
      fontWeight: active ? 600 : 400,
      color: variant === 'workbench' ? active ? 'var(--ve-accent)' : 'var(--ve-ink)' : active ? '#64ffda' : 'azure',
      cursor: 'pointer',
      borderRadius: 12,
      transition: variant === 'workbench' ? 'color 140ms ease, background-color 140ms ease, border-color 140ms ease, transform 140ms cubic-bezier(0.23,1,0.32,1)' : 'all 0.35s cubic-bezier(0.175,0.885,0.32,1.275)',
      transform: variant === 'workbench' && hover ? 'translateY(-1px)' : existingTransform,
      background: variant === 'workbench' && showPill ? 'var(--ve-accent-soft)' : existingBackground,
      backdropFilter: variant === 'workbench' ? 'none' : showPill ? 'blur(10px)' : 'none',
      WebkitBackdropFilter: variant === 'workbench' ? 'none' : showPill ? 'blur(10px)' : 'none',
      border: variant === 'workbench' && active ? '1px solid rgba(23,111,104,0.28)' : existingBorder,
      boxShadow: variant === 'workbench' ? 'none' : active ? '0 4px 15px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.20), 0 0 10px rgba(100,255,218,0.15)' : showPill ? '0 4px 15px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.30)' : 'none',
      textDecoration: 'none',
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
      backgroundColor: variant === 'workbench' ? 'var(--ve-accent)' : '#64ffda',
      boxShadow: variant === 'workbench' ? 'none' : '0 0 8px #64ffda'
    }
  })));
};
Object.assign(window, {
  Header
});

// File: Footer.jsx
// Footer.jsx
const Footer = ({
  onNavigate,
  geological = false
}) => {
  const links = [{
    id: 'home',
    label: 'Home',
    href: './index.html'
  }, {
    id: 'about',
    label: 'About',
    href: './index.html#about'
  }, {
    id: 'publications',
    label: 'Research',
    href: './index.html#publications'
  }, {
    id: 'simulator',
    label: 'VE Simulator',
    href: './simulator.html'
  }, {
    id: 'contact',
    label: 'Contact',
    href: './index.html#contact'
  }, {
    id: 'cv',
    label: 'CV',
    href: './index.html#cv'
  }];
  return /*#__PURE__*/React.createElement("footer", {
    role: "contentinfo",
    style: {
      position: 'relative',
      zIndex: 10,
      padding: '64px 36px 48px',
      backgroundColor: geological ? 'transparent' : '#1c252d',
      color: 'rgba(255,255,255,0.75)',
      fontFamily: "'Montserrat', sans-serif",
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
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
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
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
  }, "Institute of GeoEnergy Engineering \xB7 Heriot-Watt University")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("nav", {
    role: "navigation",
    "aria-label": "Footer navigation"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      fontSize: 13,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, links.map(l => /*#__PURE__*/React.createElement(FooterLink, {
    key: l.id,
    label: l.label,
    href: l.href,
    onClick: () => {
      if (onNavigate) onNavigate(l.id);else if (window.__onNavigate) window.__onNavigate(l.id);
    }
  })))), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (onNavigate) onNavigate('home');else if (window.__onNavigate) window.__onNavigate('home');else window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    className: "pressable",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 16px',
      borderRadius: 10,
      background: 'rgba(201, 163, 141, 0.10)',
      border: '1px solid rgba(201, 163, 141, 0.32)',
      color: '#d6b5a0',
      fontFamily: 'ui-monospace, monospace',
      fontSize: 11.5,
      fontWeight: 700,
      letterSpacing: '0.06em',
      cursor: 'pointer',
      textTransform: 'uppercase',
      transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background 160ms ease, border-color 160ms ease'
    },
    title: "Back to top"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-arrow-up",
    style: {
      fontSize: 10
    }
  }), "Back to top"))));
};
const FooterLink = ({
  label,
  href,
  onClick
}) => {
  const [hover, setHover] = useState(false);
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    onClick: e => {
      e.preventDefault();
      onClick();
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    className: "pressable",
    style: {
      color: hover ? '#64ffda' : 'rgba(255,255,255,0.70)',
      textDecoration: 'none',
      cursor: 'pointer',
      transition: 'color 160ms ease, transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
      fontWeight: hover ? 500 : 400,
      transform: hover ? 'translateY(-1px)' : 'none',
      userSelect: 'none'
    }
  }, label);
};
Object.assign(window, {
  Footer
});

// File: hero-geology.js
// Shared by the homepage renderer and its worker. Coordinates are SVG units.
const HeroGeology = (() => {
  const layerFraction = (t, x, phase, wavelength) => t + 0.08 * Math.sin(Math.PI * t) * Math.sin(2 * Math.PI * x / wavelength + phase);
  const capRockBaseProfile = (x, depth = 1, g) => (g.baseDepth + x * g.dipSlope - g.amp1 * Math.sin((x + g.phase1) * Math.PI / g.lambda1) - g.amp2 * Math.sin(x * Math.PI / g.lambda2) - g.amp3 * Math.sin(x * Math.PI / g.lambda3)) * layerFraction(depth, x, g.capThicknessPhase, g.thicknessWavelength);
  const stratumBaseProfile = (x, depth = 1, yOffset = 0, g) => {
    const roof = capRockBaseProfile(x, depth, g);
    if (!yOffset) return roof;
    const top = capRockBaseProfile(x, 1, g);
    const wave = Math.sin(2 * Math.PI * x / g.thicknessWavelength + g.reservoirThicknessPhase);
    if (depth < 0.5) {
      // The shallow bed occupies part of the seal, with clearance for fault steps.
      return roof + (top - roof - 0.4 * g.faultThrow - 8) * (0.45 + 0.15 * wave);
    }
    const floor = top + 65 + (435 - top) * (g.reservoirThickness / 300) * (0.65 + 0.30 * wave);
    const t = Math.max(0, Math.min(1, (yOffset - g.reservoirThickness) / 320));
    // Lower beds redistribute the remaining height; the bottom never moves.
    return t === 1 ? 580 : floor + (580 - floor) * layerFraction(t, x, g.aquiferThicknessPhase, g.thicknessWavelength * 1.2);
  };
  const getStratumFaultIntersection = (fault, depth = 1, yOffset = 0, g) => {
    const x0 = fault.xPercent * 10;
    const slope = fault.dipSlope || 0;
    let x = x0;
    for (let i = 0; i < 3; i++) x = x0 + slope * stratumBaseProfile(x, depth, yOffset, g);
    return {
      x,
      y: stratumBaseProfile(x, depth, yOffset, g),
      x0,
      slope
    };
  };
  const getFaultIntersection = (fault, depth = 1, g) => getStratumFaultIntersection(fault, depth, 0, g);
  const stratumY = (x, faults, cell = null, depth = 1, yOffset = 0, g) => {
    let y = stratumBaseProfile(x, depth, yOffset, g);
    const reference = cell === null ? x : cell * 5 + 2.5;
    const lowerFraction = depth === 1 ? Math.max(0, Math.min(1, (yOffset - g.reservoirThickness) / 320)) : 0;
    const throwScale = depth < 0.5 ? depth : 1 - lowerFraction;
    faults.forEach((fault, i) => {
      if (reference > getStratumFaultIntersection(fault, depth, yOffset, g).x) {
        y += (i % 2 ? -1 : 1) * g.faultThrow * throwScale;
      }
    });
    return y;
  };
  const capRockY = (x, faults, cell = null, depth = 1, g) => stratumY(x, faults, cell, depth, 0, g);
  const layerThicknessAt = (x, depth, faults, cell, g) => stratumY(x, faults, cell, depth, depth < 0.5 ? g.shallowThickness : g.reservoirThickness, g) - capRockY(x, faults, cell, depth, g);

  // A permeable fault shares one gas-water level across its two adjacent columns.
  // Solve for that level without creating or removing CO2 from either reservoir.
  const balanceFaultContact = (h, left, right, roofLeft, roofRight, maxLeft, maxRight) => {
    const total = h[left] + h[right];
    if (total <= 0) return;
    let low = Math.min(roofLeft, roofRight);
    let high = Math.max(roofLeft + maxLeft, roofRight + maxRight);
    for (let i = 0; i < 24; i++) {
      const level = (low + high) / 2;
      const gas = Math.max(0, Math.min(maxLeft, level - roofLeft)) + Math.max(0, Math.min(maxRight, level - roofRight));
      if (gas < total) low = level;else high = level;
    }
    const level = (low + high) / 2;
    h[left] = Math.max(0, Math.min(maxLeft, level - roofLeft));
    h[right] = total - h[left];
  };
  return {
    capRockBaseProfile,
    stratumBaseProfile,
    getStratumFaultIntersection,
    getFaultIntersection,
    stratumY,
    capRockY,
    layerThicknessAt,
    balanceFaultContact
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = HeroGeology;

// File: SubsurfaceHero.jsx
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

  // Broad visual ranges in SVG units; keep the full reservoir inside the section.
  const dipSlope = parseFloat((0.025 + Math.random() * 0.085).toFixed(3));
  const baseDepth = parseFloat((110 + Math.random() * 45).toFixed(1));

  // Broad gentle folds through shorter, more pronounced anticlines.
  const amp1 = parseFloat((12 + Math.random() * 20).toFixed(1));
  const lambda1 = parseFloat((120 + Math.random() * 150).toFixed(1));
  const phase1 = parseFloat(((Math.random() - 0.5) * 180).toFixed(1));

  // Smaller folds retain texture without obscuring the larger structures.
  const amp2 = parseFloat((5 + Math.random() * 7).toFixed(1));
  const lambda2 = parseFloat((65 + Math.random() * 55).toFixed(1));

  // Micro-topography.
  const amp3 = parseFloat((2 + Math.random() * 3).toFixed(1));
  const lambda3 = parseFloat((40 + Math.random() * 12).toFixed(1));

  // Fault throw offset step.
  const faultThrow = parseFloat((12 + Math.random() * 8).toFixed(1));

  // Thin sandstone beds through thick storage formations (previously 175–205).
  const reservoirThickness = parseFloat((100 + Math.random() * 150).toFixed(1));
  // Keep a seal between the shallow bed and the primary reservoir, even at fold crests.
  const shallowThickness = Math.min(25 + Math.random() * 25, 0.6 * (baseDepth - amp1 - amp2 - amp3) - 0.4 * faultThrow - 8);
  // Spacing also clears the fault throws, so the decorative beds cannot cross.
  const capLayerDepths = [0.55 + Math.random() * 0.03, 0.28 + Math.random() * 0.07, 0.06 + Math.random() * 0.04];
  const aquiferLayerOffsets = [90 + Math.random() * 12, 176 + Math.random() * 16, 256 + Math.random() * 12];

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
    shallowThickness,
    capLayerDepths,
    aquiferLayerOffsets,
    thicknessWavelength: 650 + Math.random() * 350,
    reservoirThicknessPhase: Math.random() * 2 * Math.PI,
    capThicknessPhase: Math.random() * 2 * Math.PI,
    aquiferThicknessPhase: Math.random() * 2 * Math.PI,
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
const {
  capRockBaseProfile,
  stratumBaseProfile,
  getStratumFaultIntersection,
  getFaultIntersection,
  stratumY,
  capRockY,
  layerThicknessAt,
  balanceFaultContact
} = HeroGeology;

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
  const primaryMax = Array.from({
    length: N
  }, (_, i) => layerThicknessAt(i * 5, 1, flts, i, g) / 15);
  const secondaryMax = Array.from({
    length: N
  }, (_, i) => layerThicknessAt(i * 5, 0.4, flts, i, g) / 15);
  const faces = depth => Array.from({
    length: N - 1
  }, (_, i) => [capRockY(i * 5, flts, i, depth, g) / 15, capRockY((i + 1) * 5, flts, i + 1, depth, g) / 15]);
  const primaryFaces = faces(1),
    secondaryFaces = faces(0.4);
  const faultCells = flts.map(f => [1, 0.4].map(depth => Math.max(0, Math.min(N - 1, Math.round(getFaultIntersection(f, depth, g).x / 5)))));
  const faultRoofs = faultCells.map(cells => [1, 0.4].map((depth, j) => {
    const k = cells[j];
    return [k, capRockY(k * 5, flts, k - 1, depth, g) / 15, capRockY(k * 5, flts, k, depth, g) / 15];
  }));
  const balanceFaults = (heights, limits, layer) => faultRoofs.forEach(contacts => {
    const [k, left, right] = contacts[layer];
    if (k > 0 && k < N) balanceFaultContact(heights, k - 1, k, left, right, limits[k - 1], limits[k]);
  });
  const faultFlow = flts.map(() => 0);
  for (let frame = 0; frame <= totalFrames; frame++) {
    history.push({
      h: [...h],
      hMax: [...hMax],
      h2: [...h2],
      h2Max: [...h2Max],
      faultFlow: [...faultFlow]
    });
    faultFlow.fill(0);

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
        const [ztL, ztR] = primaryFaces[i];
        const zL = ztL + h[i];
        const zR = ztR + h[i + 1];
        const grad = zR - zL;
        const hFace = grad > 0 ? hMob[i + 1] : hMob[i];
        fluxes[i] = -K * hFace * grad;
      }

      // Closed far-field boundaries (preserves CO2 in the regional geological trap)
      const nextH = [...h];
      for (let i = 0; i < N; i++) {
        const fL = i === 0 ? 0 : fluxes[i - 1];
        const fR = i === N - 1 ? 0 : fluxes[i];
        nextH[i] = Math.max(0, Math.min(primaryMax[i], h[i] + dt * (fL - fR)));
      }
      balanceFaults(nextH, primaryMax, 0);

      // Fault capillary seal breaching and leakage
      const leaks = new Array(flts.length).fill(0);
      for (let idx = 0; idx < flts.length; idx++) {
        const f = flts[idx];
        const boundedIdx = faultCells[idx][0];

        // Leakage occurs only if CO2 column height exceeds entry threshold
        if (nextH[boundedIdx] > f.thresholdHeight) {
          const overpressure = nextH[boundedIdx] - f.thresholdHeight;
          const leak = Math.min(overpressure, f.leakRate * dt);
          nextH[boundedIdx] -= leak;
          leaks[idx] = leak;
          faultFlow[idx] += leak / (dt * substeps);
        }
      }

      // Sustained injection during the first 320 frames centered on wellbore
      if (frame <= 320) {
        if (wellCell >= 2 && wellCell <= N - 3) {
          nextH[wellCell - 2] = Math.min(primaryMax[wellCell - 2], nextH[wellCell - 2] + Q * dt * 0.15);
          nextH[wellCell - 1] = Math.min(primaryMax[wellCell - 1], nextH[wellCell - 1] + Q * dt * 0.25);
          nextH[wellCell] = Math.min(primaryMax[wellCell], nextH[wellCell] + Q * dt * 0.40);
          nextH[wellCell + 1] = Math.min(primaryMax[wellCell + 1], nextH[wellCell + 1] + Q * dt * 0.25);
          nextH[wellCell + 2] = Math.min(primaryMax[wellCell + 2], nextH[wellCell + 2] + Q * dt * 0.15);
        }
      }
      h = nextH.map((val, i) => Math.max(0, Math.min(primaryMax[i], val)));
      for (let i = 0; i < N; i++) {
        if (h[i] > hMax[i]) hMax[i] = Math.min(primaryMax[i], h[i]);
      }

      // --- SECONDARY RESERVOIR (h2) ---
      const h2Mob = new Array(N).fill(0);
      for (let i = 0; i < N; i++) {
        const H = h2[i];
        const hm = h2Max[i];
        const mobileVal = R < 1.0 ? Math.max(0, (H - R * hm) / (1.0 - R)) : 0;
        h2Mob[i] = Math.min(H, mobileVal);
      }
      const fluxes2 = new Array(N - 1).fill(0);
      for (let i = 0; i < N - 1; i++) {
        const [ztL, ztR] = secondaryFaces[i];
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
        nextH2[i] = Math.max(0, Math.min(secondaryMax[i], h2[i] + dt * (fL - fR)));
      }

      // Inject leaked mass from primary into secondary fault locations
      for (let idx = 0; idx < flts.length; idx++) {
        const boundedIdx2 = faultCells[idx][1];
        nextH2[boundedIdx2] = Math.min(secondaryMax[boundedIdx2], nextH2[boundedIdx2] + leaks[idx] * 1.5);
      }
      balanceFaults(nextH2, secondaryMax, 1);
      h2 = nextH2.map((val, i) => Math.max(0, Math.min(secondaryMax[i], val)));
      for (let i = 0; i < N; i++) {
        if (h2[i] > h2Max[i]) h2Max[i] = Math.min(secondaryMax[i], h2[i]);
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
    const bedOffset = depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness;
    const isFault = k > 0 && k < 200 && (Math.abs(capRockY(x, flts, k - 1, depthMultiplier, g) - capRockY(x, flts, k, depthMultiplier, g)) > 0.1 || Math.abs(stratumY(x, flts, k - 1, depthMultiplier, bedOffset, g) - stratumY(x, flts, k, depthMultiplier, bedOffset, g)) > 0.1);
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

// Clip both edges of each reservoir, including displaced floor intersections.
const getReservoirClipPath = (depth, faults, g) => buildSmoothRibbonPath((k, side) => capRockY(k * 5, faults, side === 'left' ? k - 1 : k, depth, g), (k, side) => stratumY(k * 5, faults, side === 'left' ? k - 1 : k, depth, depth < 0.5 ? g.shallowThickness : g.reservoirThickness, g), 0, 200, faults, depth, g);

// Heights belong to nodes; left/right choose the cell adjoining a fault.
const getNodeValue = (arr, k, side = 'avg') => {
  if (!arr) return 0;
  const N = arr.length;
  if (k <= 0) return arr[0];
  if (k >= N) return arr[N - 1];
  if (side === 'left') return arr[k - 1];
  if (side === 'right') return arr[k];
  return arr[k];
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
    const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness, g);
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
    const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness, g);
    return Math.min(yBotMax, yTop + getNodeValue(h, k, side) * scale);
  }, (k, side) => {
    const yTop = capRockY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, g);
    const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness, g);
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
    const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness, g);
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
    const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness, g);
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

// Current gas-water contact, using the same height field as the active plume.
const getContactLinePath = (h, depthMultiplier = 1.0, faults = currentGeology.faults, geo = currentGeology) => {
  if (!h) return "";
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  const N = h.length - 1;
  const scale = 15.0;
  const bounds = getPlumeActiveBounds(k => getNodeValue(h, k, 'avg'), N, 0.001);
  if (!bounds) return "";
  let path = "";
  for (let k = bounds.kStart; k <= bounds.kEnd; k++) {
    const x = k * 5.0;
    const isFault = k > 0 && k < 200 && Math.abs(capRockY(x, flts, k - 1, depthMultiplier, g) - capRockY(x, flts, k, depthMultiplier, g)) > 0.1;
    if (k === bounds.kStart) {
      const yTop = capRockY(x, flts, isFault ? k : k, depthMultiplier, g);
      const yBotMax = stratumY(x, flts, isFault ? k : k, depthMultiplier, depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness, g);
      const y0 = Math.min(yBotMax, yTop + getNodeValue(h, k, isFault ? 'right' : 'avg') * scale);
      path = `M ${x} ${y0}`;
    } else if (isFault) {
      const yTopL = capRockY(x, flts, k - 1, depthMultiplier, g);
      const yBotMaxL = stratumY(x, flts, k - 1, depthMultiplier, depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness, g);
      const yTopR = capRockY(x, flts, k, depthMultiplier, g);
      const yBotMaxR = stratumY(x, flts, k, depthMultiplier, depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness, g);
      const yL = Math.min(yBotMaxL, yTopL + getNodeValue(h, k, 'left') * scale);
      const yR = Math.min(yBotMaxR, yTopR + getNodeValue(h, k, 'right') * scale);
      path += ` L ${x} ${yL} L ${x} ${yR}`;
    } else {
      const yTop = capRockY(x, flts, k, depthMultiplier, g);
      const yBotMax = stratumY(x, flts, k, depthMultiplier, depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness, g);
      const y = Math.min(yBotMax, yTop + getNodeValue(h, k, 'avg') * scale);
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
  const yEnd = stratumY(g.wellX, g.faults, null, 1.0, g.reservoirThickness, g) - 20;
  return `M ${xStart} ${yStart} L ${xEnd} ${yStart} L ${xEnd} ${yEnd} L ${xStart} ${yEnd} Z`;
};
const SubsurfaceHero = ({
  onNavigate
}) => {
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play on first load to wow visitors
  const [speed, setSpeed] = useState(1);
  const [history, setHistory] = useState(null);

  // Single unified randomized geology (anticlines, fault throws, layers, petrophysics, well location) generated per page load
  const geology = currentGeology;
  const faults = geology.faults;
  useEffect(() => {
    if (!window.Worker) {
      const fallback = setTimeout(() => setHistory(precomputeSimulation(faults, geology)), 0);
      return () => clearTimeout(fallback);
    }
    const worker = new Worker('./hero-simulation-worker.js?v=6');
    worker.onmessage = event => setHistory(event.data.history);
    worker.onerror = () => setHistory(precomputeSimulation(faults, geology));
    worker.postMessage({
      geology
    });
    return () => worker.terminate();
  }, [faults, geology]);
  const emptyFrame = useMemo(() => ({
    h: new Array(201).fill(0),
    hMax: new Array(201).fill(0),
    h2: new Array(201).fill(0),
    h2Max: new Array(201).fill(0)
  }), []);
  const currentFrame = history ? history[Math.round(time)] || history[0] : emptyFrame;
  const currentH = currentFrame.h;
  const currentHMax = currentFrame.hMax;
  const currentH2 = currentFrame.h2;
  const currentH2Max = currentFrame.h2Max;
  useEffect(() => {
    if (!isPlaying || !history) return;
    const interval = setInterval(() => {
      setTime(t => {
        if (t >= 1000) {
          return 0; // smooth loop back to Year 0
        }
        return Math.min(1000, t + 2.5 * speed);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, speed, history]);
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
    faultFlow: currentFrame.faultFlow,
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
    "aria-label": isPlaying ? 'Pause hero simulation' : 'Play hero simulation',
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
    "aria-label": "Simulation year",
    "aria-valuetext": `Year ${Math.round(time)}`,
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
   Sky — moonlit cloud banks and sparse stars over the same cool geological palette.
   ===================================================== */
const Sky = () => useMemo(() => /*#__PURE__*/React.createElement("div", {
  "data-layer": "sky",
  "aria-hidden": "true",
  style: {
    position: 'absolute',
    inset: '0 0 auto',
    height: '42vh',
    overflow: 'hidden',
    pointerEvents: 'none',
    background: 'linear-gradient(180deg, #090f20 0%, #131b30 56%, #1a253b 84%, #172737 100%)'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at 79% 30%, rgba(142,170,207,0.18), transparent 34%), radial-gradient(ellipse at 70% 105%, rgba(83,131,151,0.12), transparent 55%)'
  }
}), Array.from({
  length: 52
}, (_, i) => /*#__PURE__*/React.createElement("span", {
  key: i,
  style: {
    position: 'absolute',
    left: `${(i * 61.803 + 3) % 100}%`,
    top: `${5 + i * i * 17.31 % 67}%`,
    width: i % 11 === 0 ? 2 : 1.25,
    height: i % 11 === 0 ? 2 : 1.25,
    borderRadius: '50%',
    background: '#c7dbed',
    opacity: 0.26 + i % 5 * 0.08,
    boxShadow: i % 11 === 0 ? '0 0 5px rgba(176,206,238,0.35)' : 'none'
  }
})), /*#__PURE__*/React.createElement("div", {
  className: "hero-night-clouds",
  style: {
    position: 'absolute',
    inset: 0
  }
}, /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 1000 420",
  preserveAspectRatio: "none",
  width: "104%",
  height: "100%",
  style: {
    marginLeft: '-2%'
  }
}, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
  id: "night-cloud-lit",
  x1: "0",
  y1: "0",
  x2: "0.2",
  y2: "1"
}, /*#__PURE__*/React.createElement("stop", {
  stopColor: "#8496b5",
  stopOpacity: "0.60"
}), /*#__PURE__*/React.createElement("stop", {
  offset: "25%",
  stopColor: "#425772",
  stopOpacity: "0.70"
}), /*#__PURE__*/React.createElement("stop", {
  offset: "65%",
  stopColor: "#23324a",
  stopOpacity: "0.88"
}), /*#__PURE__*/React.createElement("stop", {
  offset: "100%",
  stopColor: "#152137",
  stopOpacity: "0"
})), /*#__PURE__*/React.createElement("linearGradient", {
  id: "night-cloud-shadow",
  x1: "0",
  y1: "0",
  x2: "0",
  y2: "1"
}, /*#__PURE__*/React.createElement("stop", {
  stopColor: "#34415d",
  stopOpacity: "0.72"
}), /*#__PURE__*/React.createElement("stop", {
  offset: "30%",
  stopColor: "#131d31",
  stopOpacity: "0.94"
}), /*#__PURE__*/React.createElement("stop", {
  offset: "100%",
  stopColor: "#101b2c",
  stopOpacity: "0"
})), /*#__PURE__*/React.createElement("filter", {
  id: "night-cloud-texture",
  x: "-10%",
  y: "-30%",
  width: "120%",
  height: "160%",
  colorInterpolationFilters: "sRGB"
}, /*#__PURE__*/React.createElement("feTurbulence", {
  type: "fractalNoise",
  baseFrequency: "0.009 0.025",
  numOctaves: "3",
  seed: "12",
  result: "cloud-noise"
}), /*#__PURE__*/React.createElement("feColorMatrix", {
  in: "cloud-noise",
  type: "matrix",
  values: "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  3 0 0 0 -1",
  result: "cloud-density"
}), /*#__PURE__*/React.createElement("feDisplacementMap", {
  in: "SourceGraphic",
  in2: "cloud-noise",
  scale: "38",
  xChannelSelector: "R",
  yChannelSelector: "G"
}), /*#__PURE__*/React.createElement("feGaussianBlur", {
  stdDeviation: "6"
}), /*#__PURE__*/React.createElement("feComposite", {
  in2: "cloud-density",
  operator: "in"
}), /*#__PURE__*/React.createElement("feGaussianBlur", {
  stdDeviation: "1"
}))), /*#__PURE__*/React.createElement("g", {
  filter: "url(#night-cloud-texture)"
}, /*#__PURE__*/React.createElement("g", {
  fill: "url(#night-cloud-lit)"
}, /*#__PURE__*/React.createElement("path", {
  opacity: "0.55",
  d: "M 390 144 C 445 130 471 147 511 125 C 537 111 563 122 594 110 C 631 92 661 109 687 90 C 729 66 755 91 798 77 C 859 62 882 98 936 84 L 1100 81 L 1100 226 C 916 223 858 185 715 203 C 596 213 496 171 390 185 Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M 557 215 C 603 188 625 207 650 187 C 677 165 699 182 722 159 C 741 143 764 163 782 149 C 816 121 839 147 864 136 C 887 126 917 155 943 140 C 991 114 1041 138 1100 118 L 1100 314 C 1023 294 960 317 885 284 C 787 252 723 284 651 250 C 611 235 585 240 557 248 Z"
}), /*#__PURE__*/React.createElement("path", {
  opacity: "0.46",
  d: "M 150 300 C 219 278 257 292 294 275 C 330 258 364 285 400 261 C 431 240 463 263 492 247 C 529 226 555 253 600 241 C 654 226 684 259 725 245 L 832 279 L 901 365 C 690 337 637 355 484 328 C 347 315 259 340 150 332 Z"
})), /*#__PURE__*/React.createElement("g", {
  fill: "url(#night-cloud-shadow)"
}, /*#__PURE__*/React.createElement("path", {
  d: "M 731 256 C 778 228 808 250 831 225 C 854 206 877 223 901 203 C 929 176 956 207 983 190 C 1022 174 1055 194 1100 181 L 1100 408 L 833 390 C 815 328 778 301 731 295 Z"
}), /*#__PURE__*/React.createElement("path", {
  opacity: "0.75",
  d: "M -80 343 C 4 322 43 341 87 317 C 128 293 157 323 202 304 C 244 280 283 308 320 292 C 362 273 387 311 435 298 L 561 372 L 628 432 L -80 432 Z"
}))))), /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg, rgba(11,15,29,0.88) 0%, rgba(13,17,32,0.65) 32%, transparent 68%), linear-gradient(0deg, rgba(14,26,39,0.65), transparent 20%)'
  }
})), []);

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
  faults,
  geology
}) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  const scale = 15.0; // matching scale factor of the plume
  const N = 200;
  const effH = h || new Array(N + 1).fill(0);

  // 1. Single continuous seamless Brine Fluid polygon across entire reservoir
  const brinePath = useMemo(() => {
    let path = `M 0 ${stratumY(0, flts, 0, 1.0, g.reservoirThickness, g)}`;
    // Trace reservoir bottom left-to-right
    for (let i = 0; i < N; i++) {
      const x1 = i * 5.0;
      const x2 = (i + 1) * 5.0;
      const yb1 = stratumY(x1, flts, i, 1.0, g.reservoirThickness, g);
      const yb2 = stratumY(x2, flts, i, 1.0, g.reservoirThickness, g);
      path += ` L ${x1} ${yb1} L ${x2} ${yb2}`;
    }
    // Trace continuous top fluid interface right-to-left
    for (let i = N - 1; i >= 0; i--) {
      const x1 = i * 5.0;
      const x2 = (i + 1) * 5.0;
      const yt1 = capRockY(x1, flts, i, 1.0, g);
      const yt2 = capRockY(x2, flts, i, 1.0, g);
      const yb1 = stratumY(x1, flts, i, 1.0, g.reservoirThickness, g);
      const yb2 = stratumY(x2, flts, i, 1.0, g.reservoirThickness, g);
      const yFluid1 = Math.min(yb1, yt1 + effH[i] * scale);
      const yFluid2 = Math.min(yb2, yt2 + effH[i + 1] * scale);
      if (i === N - 1) {
        path += ` L ${x2} ${yFluid2}`;
      }
      if (i > 0) {
        const yCapLeft = capRockY(x1, flts, i - 1, 1.0, g);
        const yCapRight = yt1;
        if (Math.abs(yCapLeft - yCapRight) > 0.1) {
          const ybPrev = stratumY(x1, flts, i - 1, 1.0, g.reservoirThickness, g);
          const yFluidPrev = Math.min(ybPrev, yCapLeft + effH[i - 1] * scale);
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
    const blockFill = '#182e40';
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

// Static rock detail is built once per geology, independent of simulation frames.
const GeologyTexture = ({
  faults,
  geology: g
}) => useMemo(() => {
  const reservoirPaths = [0.4, 1].map(depth => getReservoirClipPath(depth, faults, g));
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
  const sealLines = Array.from({
    length: 23
  }, (_, i) => trace((x, cell) => capRockY(x, faults, cell, (i + 1) / 24, g)));
  const lowerLines = Array.from({
    length: 25
  }, (_, i) => trace((x, cell) => stratumY(x, faults, cell, 1, g.reservoirThickness + (i + 1) * 320 / 26, g)));
  const reservoirLines = [0.4, 1].flatMap(depth => Array.from({
    length: depth === 1 ? 8 : 3
  }, (_, i) => {
    const fraction = (i + 1) / (depth === 1 ? 9 : 4);
    return trace((x, cell) => capRockY(x, faults, cell, depth, g) + fraction * layerThicknessAt(x, depth, faults, cell, g));
  }));
  return /*#__PURE__*/React.createElement("g", {
    "data-layer": "geology-texture"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
    id: "rock-reservoirs"
  }, reservoirPaths.map((d, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: d
  }))), /*#__PURE__*/React.createElement("mask", {
    id: "rock-seals",
    maskUnits: "userSpaceOnUse",
    x: "0",
    y: "0",
    width: "1000",
    height: "580"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "1000",
    height: "580",
    fill: "white"
  }), reservoirPaths.map((d, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: d,
    fill: "black"
  }))), /*#__PURE__*/React.createElement("pattern", {
    id: "rock-grain",
    width: "137",
    height: "89",
    patternUnits: "userSpaceOnUse"
  }, Array.from({
    length: 90
  }, (_, i) => /*#__PURE__*/React.createElement("ellipse", {
    key: i,
    cx: (i * 47.13 + 7) % 137,
    cy: (i * i * 13.71 + 11) % 89,
    rx: 0.35 + i % 4 * 0.13,
    ry: 0.25 + i % 3 * 0.12,
    fill: i % 3 ? '#c4d4d5' : '#040e18',
    opacity: i % 3 ? 0.17 : 0.3
  }))), /*#__PURE__*/React.createElement("radialGradient", {
    id: "rock-mineral-wash"
  }, /*#__PURE__*/React.createElement("stop", {
    stopColor: "#9da9a1",
    stopOpacity: "0.09"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#9da9a1",
    stopOpacity: "0"
  })), /*#__PURE__*/React.createElement("pattern", {
    id: "rock-mottle",
    width: "431",
    height: "193",
    patternUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("ellipse", {
    cx: "120",
    cy: "60",
    rx: "115",
    ry: "39",
    fill: "url(#rock-mineral-wash)"
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "320",
    cy: "147",
    rx: "101",
    ry: "43",
    fill: "url(#rock-mineral-wash)"
  }))), /*#__PURE__*/React.createElement("rect", {
    width: "1000",
    height: "580",
    fill: "url(#rock-mottle)"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "1000",
    height: "580",
    fill: "url(#rock-grain)",
    opacity: "0.55"
  }), /*#__PURE__*/React.createElement("g", {
    mask: "url(#rock-seals)",
    fill: "none",
    stroke: "#c5b8b1",
    strokeWidth: "0.65"
  }, [...sealLines, ...lowerLines].map((d, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: d,
    opacity: i % 4 === 0 ? 0.15 : 0.065,
    strokeDasharray: i % 3 === 0 ? '31 5 9 3 57 7' : undefined
  }))), /*#__PURE__*/React.createElement("g", {
    clipPath: "url(#rock-reservoirs)"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "1000",
    height: "580",
    fill: "url(#rock-grain)",
    opacity: "0.65"
  }), reservoirLines.map((d, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: d,
    fill: "none",
    stroke: "#93b7c2",
    strokeWidth: "0.7",
    opacity: "0.12",
    strokeDasharray: "47 6 18 4 83 9"
  }))));
}, [faults, g]);

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

// Overland CO2 Supercritical Pipeline with elevated supports and directional chevron flow
const GasFeedAnimation = ({
  isPlaying,
  geology
}) => {
  const g = geology || currentGeology;
  const wellX = g.wellXPct;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 'calc(42vh - 36px)',
      height: 36,
      pointerEvents: 'none',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: `calc(${wellX}% + 33px)`,
      right: 0,
      height: 36
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 16,
      top: -16,
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      fontSize: 9.5,
      fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
      color: '#0dfca2',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      fontWeight: 600,
      textShadow: '0 1px 4px rgba(0,0,0,0.9)',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: '#0dfca2',
      boxShadow: '0 0 8px #0dfca2',
      display: 'inline-block'
    }
  }), /*#__PURE__*/React.createElement("span", null, "CO\u2082 TRANSMISSION PIPELINE \xB7 110 BAR \xB7 SUPERCRITICAL")), /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: "36",
    style: {
      overflow: 'visible'
    },
    preserveAspectRatio: "none"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "pipe-steel",
    x1: "0%",
    y1: "0%",
    x2: "0%",
    y2: "100%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#475569"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "18%",
    stopColor: "#94a3b8"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "42%",
    stopColor: "#334155"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "75%",
    stopColor: "#1e293b"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#0f172a"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "sc-fluid-core",
    x1: "0%",
    y1: "0%",
    x2: "0%",
    y2: "100%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#a7f3d0"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "45%",
    stopColor: "#0dfca2"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#059669"
  })), /*#__PURE__*/React.createElement("pattern", {
    id: "chevron-flow-pattern",
    width: "32",
    height: "10",
    patternUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 12 2 L 6 5 L 12 8 M 24 2 L 18 5 L 24 8",
    fill: "none",
    stroke: "#ffffff",
    strokeWidth: "1.3",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    opacity: "0.85"
  }))), [60, 220, 380, 540, 700, 860, 1020, 1180].map(xPos => /*#__PURE__*/React.createElement("g", {
    key: `pipe-support-${xPos}`
  }, /*#__PURE__*/React.createElement("rect", {
    x: xPos - 2,
    y: "13",
    width: "4",
    height: "21",
    fill: "#334155",
    stroke: "#1e293b",
    strokeWidth: "0.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: `M ${xPos - 6} 13 Q ${xPos} 15 ${xPos + 6} 13`,
    stroke: "#64748b",
    strokeWidth: "1.6",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: xPos - 8,
    y: "32",
    width: "16",
    height: "4",
    rx: "1",
    fill: "#1e293b",
    stroke: "#475569",
    strokeWidth: "0.7"
  }))), /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "1",
    width: "100%",
    height: "12",
    rx: "2.5",
    fill: "url(#pipe-steel)",
    stroke: "rgba(255,255,255,0.22)",
    strokeWidth: "0.8",
    style: {
      filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'
    }
  }), [140, 300, 460, 620, 780, 940, 1100].map(xPos => /*#__PURE__*/React.createElement("g", {
    key: `flange-collar-${xPos}`
  }, /*#__PURE__*/React.createElement("rect", {
    x: xPos - 2.5,
    y: "0",
    width: "5",
    height: "14",
    rx: "1",
    fill: "#475569",
    stroke: "#94a3b8",
    strokeWidth: "0.7"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: xPos,
    cy: "2.5",
    r: "0.8",
    fill: "#e2e8f0"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: xPos,
    cy: "11.5",
    r: "0.8",
    fill: "#e2e8f0"
  }))), /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "4.5",
    width: "100%",
    height: "5",
    rx: "1.5",
    fill: "url(#sc-fluid-core)",
    opacity: "0.9",
    style: {
      filter: 'drop-shadow(0 0 6px rgba(13,252,162,0.7))'
    }
  }), /*#__PURE__*/React.createElement("g", {
    style: {
      animation: 'pipelineChevron 1.4s linear infinite',
      animationPlayState: isPlaying ? 'running' : 'paused'
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "-64",
    y: "3.5",
    width: "calc(100% + 128px)",
    height: "7",
    fill: "url(#chevron-flow-pattern)"
  })), /*#__PURE__*/React.createElement("line", {
    x1: "0",
    y1: "2",
    x2: "100%",
    y2: "2",
    stroke: "rgba(255,255,255,0.55)",
    strokeWidth: "0.75"
  }))));
};
const Subsurface = ({
  h,
  faults,
  geology
}) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  const AQUIFER_PATH = useMemo(() => getAquiferPath(flts, g), [flts, g]);
  const CAP_ROCK_FILL = useMemo(() => getCapRockFillPath(flts, g), [flts, g]);
  const CAP_ROCK_UNDERSIDE = useMemo(() => getCapRockPath(flts, g), [flts, g]);
  const SHALLOW_RESERVOIR_PATH = useMemo(() => getReservoirClipPath(0.4, flts, g), [flts, g]);
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
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "grad-sediment",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#30323c"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "55%",
    stopColor: "#262d35"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#1c252d"
  }))), /*#__PURE__*/React.createElement("path", {
    d: CAP_ROCK_FILL,
    fill: "url(#grad-cap-v2)"
  }), g.capLayerDepths.map((depth, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: getStrataPath(flts, depth, 0, 0, false, g),
    fill: `rgba(0,0,0,${0.15 + i * 0.10})`
  })), /*#__PURE__*/React.createElement("path", {
    "data-layer": "upper-reservoir",
    d: SHALLOW_RESERVOIR_PATH,
    fill: "#123147",
    stroke: "rgba(168,237,234,0.30)",
    strokeWidth: "0.8"
  }), /*#__PURE__*/React.createElement(ReservoirGrid, {
    h: h,
    faults: flts,
    geology: g
  }), /*#__PURE__*/React.createElement("path", {
    d: AQUIFER_PATH,
    fill: "url(#grad-sediment)"
  }), g.aquiferLayerOffsets.map((offset, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: getStrataPath(flts, 1.0, g.reservoirThickness + offset, 580, true, g),
    fill: `rgba(0,0,0,${0.20 + i * 0.15})`
  })), /*#__PURE__*/React.createElement(GeologyTexture, {
    faults: flts,
    geology: g
  }), /*#__PURE__*/React.createElement("path", {
    d: `M 0 ${stratumY(0, flts, 0, 1.0, g.reservoirThickness, g)} ` + Array.from({
      length: 200
    }, (_, i) => `L ${i * 5.0} ${stratumY(i * 5.0, flts, i, 1.0, g.reservoirThickness, g)} L ${(i + 1) * 5.0} ${stratumY((i + 1) * 5.0, flts, i, 1.0, g.reservoirThickness, g)}`).join(" "),
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
    top: `${42 + (capRockY(980, flts, null, 0.4, g) + layerThicknessAt(980, 0.4, flts, null, g) / 2) * 0.1}vh`,
    label: 'Upper reservoir'
  }, {
    top: `${42 + (capRockY(980, flts, null, 1, g) + layerThicknessAt(980, 1, flts, null, g) / 2) * 0.1}vh`,
    label: 'Reservoir'
  }, {
    top: `${42 + (stratumY(980, flts, null, 1, g.reservoirThickness, g) + 580) * 0.05}vh`,
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

// Wellhead — Precision technical SVG Christmas Tree vector assembly
const Wellhead = ({
  geology
}) => {
  const g = geology || currentGeology;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: `${g.wellXPct}%`,
      top: 'calc(42vh - 46px)',
      width: 72,
      height: 46,
      transform: 'translateX(-50%)',
      zIndex: 5,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 72 46",
    width: "72",
    height: "46",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: {
      overflow: 'visible',
      filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.65))'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "wh-metal-grad",
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "0%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#1e293b"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "45%",
    stopColor: "#334155"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "55%",
    stopColor: "#475569"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#0f172a"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "wh-flange-grad",
    x1: "0%",
    y1: "0%",
    x2: "0%",
    y2: "100%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#475569"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#1e293b"
  }))), /*#__PURE__*/React.createElement("rect", {
    x: "23",
    y: "41",
    width: "26",
    height: "5",
    rx: "1",
    fill: "url(#wh-flange-grad)",
    stroke: "rgba(255,255,255,0.25)",
    strokeWidth: "0.7"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "26",
    cy: "43.5",
    r: "0.9",
    fill: "#94a3b8"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "31",
    cy: "43.5",
    r: "0.9",
    fill: "#94a3b8"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "41",
    cy: "43.5",
    r: "0.9",
    fill: "#94a3b8"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "46",
    cy: "43.5",
    r: "0.9",
    fill: "#94a3b8"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "32.5",
    y: "12",
    width: "7",
    height: "29",
    fill: "url(#wh-metal-grad)",
    stroke: "rgba(255,255,255,0.15)",
    strokeWidth: "0.6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "27",
    y: "32",
    width: "18",
    height: "7",
    rx: "1.5",
    fill: "#0f172a",
    stroke: "rgba(100,255,218,0.45)",
    strokeWidth: "0.8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "27",
    y1: "35.5",
    x2: "20",
    y2: "35.5",
    stroke: "#94a3b8",
    strokeWidth: "1.2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "20",
    y1: "31.5",
    x2: "20",
    y2: "39.5",
    stroke: "#cbd5e1",
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "27",
    y: "23",
    width: "18",
    height: "7",
    rx: "1.5",
    fill: "#0f172a",
    stroke: "rgba(100,255,218,0.45)",
    strokeWidth: "0.8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "45",
    y1: "26.5",
    x2: "52",
    y2: "26.5",
    stroke: "#94a3b8",
    strokeWidth: "1.2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "52",
    y1: "22.5",
    x2: "52",
    y2: "30.5",
    stroke: "#cbd5e1",
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "26",
    y: "13",
    width: "20",
    height: "8",
    rx: "1.5",
    fill: "#0b1322",
    stroke: "#64ffda",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "13",
    y: "15",
    width: "13",
    height: "4",
    fill: "url(#wh-metal-grad)",
    stroke: "rgba(255,255,255,0.18)",
    strokeWidth: "0.6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "10",
    y: "14",
    width: "3",
    height: "6",
    rx: "0.8",
    fill: "#475569",
    stroke: "#94a3b8",
    strokeWidth: "0.6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "46",
    y: "15",
    width: "24",
    height: "4",
    fill: "url(#wh-metal-grad)",
    stroke: "rgba(255,255,255,0.18)",
    strokeWidth: "0.6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "54",
    y: "13.5",
    width: "7",
    height: "7",
    rx: "1",
    fill: "#0f172a",
    stroke: "rgba(100,255,218,0.6)",
    strokeWidth: "0.8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "57.5",
    y1: "13.5",
    x2: "57.5",
    y2: "7.5",
    stroke: "#94a3b8",
    strokeWidth: "1.2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "53.5",
    y1: "7.5",
    x2: "61.5",
    y2: "7.5",
    stroke: "#cbd5e1",
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "29",
    y: "6",
    width: "14",
    height: "6",
    rx: "1",
    fill: "#0f172a",
    stroke: "rgba(255,255,255,0.25)",
    strokeWidth: "0.7"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "30.5",
    y: "3.5",
    width: "11",
    height: "2.5",
    rx: "0.8",
    fill: "#334155",
    stroke: "#64ffda",
    strokeWidth: "0.6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "36",
    y1: "3.5",
    x2: "36",
    y2: "1",
    stroke: "#94a3b8",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "36",
    cy: "-2.5",
    r: "3.2",
    fill: "#0f172a",
    stroke: "#64ffda",
    strokeWidth: "0.8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "36",
    y1: "-2.5",
    x2: "37.8",
    y2: "-4",
    stroke: "#0dfca2",
    strokeWidth: "0.7",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "36",
    cy: "17",
    r: "1.4",
    fill: "#0dfca2",
    style: {
      filter: 'drop-shadow(0 0 4px #0dfca2)'
    }
  }, /*#__PURE__*/React.createElement("animate", {
    attributeName: "opacity",
    values: "0.35;1;0.35",
    dur: "1.8s",
    repeatCount: "indefinite"
  }))));
};

// Well — vertical tubing from horizon down through reservoir
// Dynamic height constraints ensure it never extends below the reservoir bottom perforations
const Well = ({
  faults,
  geology
}) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  const yBotVal = stratumY(g.wellX, flts, null, 1.0, g.reservoirThickness, g) - 20;
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
  faultFlow = [],
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
    d: getReservoirClipPath(1, flts, g)
  })), /*#__PURE__*/React.createElement("clipPath", {
    id: "below-shallow-caprock"
  }, /*#__PURE__*/React.createElement("path", {
    d: getReservoirClipPath(0.4, flts, g)
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
  }), h && getActiveMobilePath(h, 1.0, flts, 0, g) && /*#__PURE__*/React.createElement("path", {
    d: getActiveMobilePath(h, 1.0, flts, 0, g),
    fill: "url(#active-mobile-grad)",
    filter: "url(#plume-diffuse-blur)",
    opacity: "0.98"
  }), h && getBandPath(h, 0.50, 1.0, flts, g) && /*#__PURE__*/React.createElement("path", {
    d: getBandPath(h, 0.50, 1.0, flts, g),
    fill: "#0dfca2",
    opacity: "0.25",
    filter: "url(#band-soften)"
  }), h && getContactLinePath(h, 1.0, flts, g) && /*#__PURE__*/React.createElement("path", {
    d: getContactLinePath(h, 1.0, flts, g),
    fill: "none",
    stroke: "#a6e9d7",
    strokeWidth: "1.1",
    opacity: "0.82"
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
  }), h2 && getActiveMobilePath(h2, 0.4, flts, 0, g) && /*#__PURE__*/React.createElement("path", {
    d: getActiveMobilePath(h2, 0.4, flts, 0, g),
    fill: "url(#active-mobile-grad)",
    filter: "url(#plume-diffuse-blur)",
    opacity: "0.96"
  }), h2 && getContactLinePath(h2, 0.4, flts, g) && /*#__PURE__*/React.createElement("path", {
    d: getContactLinePath(h2, 0.4, flts, g),
    fill: "none",
    stroke: "#a6e9d7",
    strokeWidth: "1.1",
    opacity: "0.78"
  }), h2 && getMeniscusPath(h2, 0.4, flts, g) && /*#__PURE__*/React.createElement("path", {
    d: getMeniscusPath(h2, 0.4, flts, g),
    stroke: "rgba(255,255,255,0.45)",
    strokeWidth: "0.6",
    fill: "none"
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
      stroke: "rgba(170,191,201,0.26)",
      strokeWidth: "1.0",
      strokeDasharray: "4 4"
    }));
  }), flts.map((f, idx) => {
    const inter1 = getFaultIntersection(f, 1.0, g); // Primary reservoir caprock spill point
    const inter2 = getFaultIntersection(f, 0.4, g); // Secondary shallow reservoir entry point
    const flow = faultFlow[idx] || 0;
    if (flow <= 0) return null;
    const strength = Math.min(1, Math.sqrt(flow / f.leakRate));
    return /*#__PURE__*/React.createElement("g", {
      key: `fault-flow-group-${idx}`,
      "data-layer": "fault-leak",
      opacity: strength
    }, /*#__PURE__*/React.createElement("line", {
      x1: inter1.x,
      y1: inter1.y,
      x2: inter2.x,
      y2: inter2.y,
      stroke: "#0dfca2",
      strokeWidth: "3",
      opacity: "0.16",
      style: {
        filter: 'blur(2.5px)'
      }
    }), /*#__PURE__*/React.createElement("line", {
      x1: inter1.x,
      y1: inter1.y,
      x2: inter2.x,
      y2: inter2.y,
      stroke: "#0dfca2",
      strokeWidth: "1.15",
      opacity: "0.5",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("line", {
      className: "fault-flow-cue",
      x1: inter1.x,
      y1: inter1.y,
      x2: inter2.x,
      y2: inter2.y,
      stroke: "#b3ffe4",
      strokeWidth: "1.25",
      strokeLinecap: "round",
      strokeDasharray: "3 15",
      strokeDashoffset: -time * 0.18,
      opacity: "0.65"
    }));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '22%',
      top: `${42 + (capRockY(220, flts, null, 1, g) + layerThicknessAt(220, 1, flts, null, g) * 0.7) * 0.1}vh`,
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
  className: "hero-summary",
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
}, "CO", /*#__PURE__*/React.createElement("sub", null, "2"), " storage"), " in depleted gas reservoirs", /*#__PURE__*/React.createElement("span", {
  className: "hero-detail"
}, " \u2014 the cross-section below is essentially the thing I simulate.")), /*#__PURE__*/React.createElement("div", {
  className: "hero-actions",
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginTop: 24,
    flexWrap: 'wrap'
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "hero-socials",
  style: {
    display: 'flex',
    gap: 10
  }
}, /*#__PURE__*/React.createElement(BrandSocial, {
  label: "LinkedIn profile",
  icon: "fa-brands fa-linkedin-in",
  tint: "#0a66c2",
  url: "https://www.linkedin.com/in/stelvari/"
}), /*#__PURE__*/React.createElement(BrandSocial, {
  label: "GitHub profile",
  icon: "fa-brands fa-github",
  tint: "#22272e",
  url: "https://github.com/saeedtelvari"
}), /*#__PURE__*/React.createElement(BrandSocial, {
  label: "Google Scholar profile",
  icon: "fa-solid fa-graduation-cap",
  tint: "#4285f4",
  url: "https://scholar.google.co.uk/citations?user=_nGa8EQAAAAJ&hl=en&inst=16061989973938494330"
}), /*#__PURE__*/React.createElement(BrandSocial, {
  label: "Email Sa'eed Telvari",
  icon: "fa-solid fa-envelope",
  tint: "#ea4335",
  url: "mailto:st4014@hw.ac.uk"
})), /*#__PURE__*/React.createElement("div", {
  className: "hero-actions-divider",
  style: {
    height: 22,
    width: 1,
    background: 'rgba(255,255,255,0.18)'
  }
}), /*#__PURE__*/React.createElement("a", {
  className: "hero-cta-primary",
  href: "./simulator.html",
  onClick: e => {
    e.preventDefault();
    if (onNavigate) onNavigate('simulator');else window.location.href = './simulator.html';
  },
  style: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '11px 20px',
    borderRadius: 14,
    background: 'linear-gradient(135deg, #0dfca2, #159a80)',
    border: '1px solid rgba(255,255,255,0.45)',
    color: '#10251f',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 700,
    fontSize: 13.5,
    textDecoration: 'none',
    boxShadow: '0 7px 22px rgba(13,252,162,0.28)'
  }
}, /*#__PURE__*/React.createElement("i", {
  className: "fa-solid fa-play"
}), " Try VE Simulator"), /*#__PURE__*/React.createElement("a", {
  className: "hero-cta-secondary",
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
  className: "hero-cta-tertiary",
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
  label,
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
    "aria-label": label,
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

// File: GeologicalDescent.jsx
// One cross-section behind the home content, from the hero's aquifer to the footer.
const GeologicalDescent = ({
  children
}) => {
  const rootRef = React.useRef(null);
  const [heights, setHeights] = React.useState([1100, 1500, 850, 240]);
  React.useEffect(() => {
    const sections = [...rootRef.current.querySelectorAll('.section-panel'), rootRef.current.querySelector('footer')];
    const measure = () => {
      const next = sections.map(section => Math.round(section.offsetHeight));
      setHeights(previous => next.some((height, i) => height !== previous[i]) ? next : previous);
    };
    const observer = new ResizeObserver(measure);
    sections.forEach(section => observer.observe(section));
    measure();
    return () => observer.disconnect();
  }, []);
  const [aboutHeight, researchHeight, contactHeight, footerHeight] = heights;
  const basementTop = aboutHeight + 75;
  const mantleTop = aboutHeight + researchHeight + 65;
  const totalHeight = aboutHeight + researchHeight + contactHeight + footerHeight;
  const sedimentLevels = [0, .05, .12, .24, .30, .42, .50, .60, .65, .75, .84];
  const sedimentBends = [0, 8, 14, 22, 17, 26, 19, 29, 23, 31, 36];
  const sedimentColors = ['url(#descent-aquifer-bridge)', '#19282f', '#263840', '#35454a', '#343d40', '#2b3b40', '#424643', '#303a3e', '#494840', '#33383c'];
  const points = (y, amplitude = 0, phase = 0) => Array.from({
    length: 41
  }, (_, i) => {
    const x = i * 36;
    const bend = Math.sin(x / 185 + phase) + 0.32 * Math.sin(x / 61 + phase * 0.7);
    return [x, y + amplitude * bend];
  });
  const trace = (y, amplitude, phase) => 'M' + points(y, amplitude, phase).map(([x, py]) => `${x} ${py.toFixed(1)}`).join('L');
  const bed = (top, bottom, topBend, bottomBend, phase = 0) => trace(top, topBend, phase) + 'L' + points(bottom, bottomBend, phase + 0.3).reverse().map(([x, y]) => `${x} ${y.toFixed(1)}`).join('L') + 'Z';
  const below = (y, bend, phase) => trace(y, bend, phase) + `L1440 ${totalHeight}L0 ${totalHeight}Z`;
  const faultRoots = currentGeology.faults.map(fault => (fault.xPercent * 10 + fault.dipSlope * 580) * 1.44);
  return /*#__PURE__*/React.createElement("div", {
    ref: rootRef,
    className: "geological-descent"
  }, /*#__PURE__*/React.createElement("svg", {
    className: "geological-descent-art",
    viewBox: `0 0 1440 ${totalHeight}`,
    preserveAspectRatio: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("pattern", {
    id: "descent-grain",
    width: "83",
    height: "57",
    patternUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "11",
    r: "1",
    fill: "#c3d4d8",
    opacity: ".16"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "64",
    cy: "39",
    r: ".7",
    fill: "#c3d4d8",
    opacity: ".15"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M29 33l8 -1M67 8l5 1M9 49l4 -1",
    stroke: "#b5c8cb",
    strokeWidth: ".7",
    opacity: ".16"
  })), /*#__PURE__*/React.createElement("pattern", {
    id: "descent-lamina",
    width: "110",
    height: "28",
    patternUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M0 5Q30 2 58 5T110 4M0 19Q35 22 65 18T110 19",
    fill: "none",
    stroke: "#c0c9c5",
    strokeOpacity: ".13",
    strokeWidth: ".7"
  })), /*#__PURE__*/React.createElement("pattern", {
    id: "descent-foliation",
    width: "110",
    height: "45",
    patternUnits: "userSpaceOnUse",
    patternTransform: "rotate(-13)"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M0 9h110M0 28h110",
    stroke: "#adb3c6",
    strokeWidth: ".8",
    opacity: ".12"
  })), /*#__PURE__*/React.createElement("pattern", {
    id: "descent-peridotite",
    width: "72",
    height: "62",
    patternUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("ellipse", {
    cx: "13",
    cy: "17",
    rx: "6",
    ry: "3",
    fill: "#9d9b75",
    opacity: ".11"
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "52",
    cy: "43",
    rx: "3",
    ry: "5",
    fill: "#b08d74",
    opacity: ".11"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M31 7l5 3m-11 39l7 -2",
    stroke: "#c2ab92",
    strokeOpacity: ".12",
    strokeWidth: "1"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "descent-heat",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "#302c2b"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "#3b302d"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "descent-aquifer-bridge",
    gradientUnits: "userSpaceOnUse",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: aboutHeight * .05
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "#070a0c"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: ".52",
    stopColor: "#111b20"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "#19282f"
  }))), /*#__PURE__*/React.createElement("rect", {
    width: "1440",
    height: totalHeight,
    fill: "#070a0c"
  }), sedimentColors.map((fill, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: bed(aboutHeight * sedimentLevels[i], aboutHeight * sedimentLevels[i + 1], sedimentBends[i], sedimentBends[i + 1], .4 + i * .3),
    fill: fill
  })), /*#__PURE__*/React.createElement("path", {
    d: below(aboutHeight * .84, 36, 3.4),
    fill: "#30343a"
  }), sedimentLevels.slice(1).map((fraction, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: trace(aboutHeight * fraction, sedimentBends[i + 1], .7 + i * .3),
    fill: "none",
    stroke: i % 3 === 0 ? '#c4c2b4' : '#8da6aa',
    strokeOpacity: i % 3 === 0 ? '.37' : '.22',
    strokeWidth: i % 3 === 0 ? 1.8 : 1.1
  })), [.009, .018, .028, .038, .048, .060, .074].map((fraction, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: trace(aboutHeight * fraction, 2 + i, .25 + i * .12),
    fill: "none",
    stroke: "#879a9a",
    strokeOpacity: .13 + i * .02,
    strokeWidth: ".8"
  })), [.20, .23, .37, .39, .54, .57, .69, .72].map((fraction, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: trace(aboutHeight * fraction, 10 + i * 1.4, 1.1 + i * .19),
    fill: "none",
    stroke: "#aec0bd",
    strokeOpacity: ".12",
    strokeWidth: ".8"
  })), /*#__PURE__*/React.createElement("rect", {
    y: aboutHeight * .1,
    width: "1440",
    height: aboutHeight * .78,
    fill: "url(#descent-lamina)",
    opacity: ".7"
  }), /*#__PURE__*/React.createElement("path", {
    d: `M1190 ${aboutHeight * .94}C1200 ${aboutHeight * .73} 1280 ${aboutHeight * .51} 1350 ${aboutHeight * .55}C1420 ${aboutHeight * .58} 1450 ${aboutHeight * .81} 1480 ${aboutHeight * .96}Z`,
    fill: "#aab4b0",
    fillOpacity: ".18",
    stroke: "#c2c6b5",
    strokeOpacity: ".42",
    strokeWidth: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: `M1235 ${aboutHeight * .91}C1260 ${aboutHeight * .71} 1305 ${aboutHeight * .60} 1350 ${aboutHeight * .63}`,
    fill: "none",
    stroke: "#d0d0be",
    strokeOpacity: ".25",
    strokeWidth: "2"
  }), /*#__PURE__*/React.createElement("rect", {
    y: aboutHeight * .08,
    width: "1440",
    height: aboutHeight * .92,
    fill: "url(#descent-grain)"
  }), faultRoots.map((x, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: `M${x.toFixed(1)} 0C${(x + 26).toFixed(1)} ${aboutHeight * .19} ${(x + 55).toFixed(1)} ${aboutHeight * .38} ${(x + 42).toFixed(1)} ${aboutHeight * .57}`,
    fill: "none",
    stroke: "#9ab0b4",
    strokeOpacity: ".18",
    strokeWidth: "2"
  })), /*#__PURE__*/React.createElement("path", {
    d: below(basementTop, 44, 2.1),
    fill: "#202936"
  }), /*#__PURE__*/React.createElement("path", {
    d: trace(basementTop, 44, 2.1),
    fill: "none",
    stroke: "#b9b6a8",
    strokeOpacity: ".57",
    strokeWidth: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: bed(aboutHeight + researchHeight * .15, aboutHeight + researchHeight * .30, 29, 38, .9),
    fill: "#2c3744"
  }), /*#__PURE__*/React.createElement("path", {
    d: bed(aboutHeight + researchHeight * .30, aboutHeight + researchHeight * .43, 38, 48, 1.2),
    fill: "#3b3d49"
  }), /*#__PURE__*/React.createElement("path", {
    d: bed(aboutHeight + researchHeight * .43, aboutHeight + researchHeight * .58, 48, 37, 1.5),
    fill: "#2d3442"
  }), /*#__PURE__*/React.createElement("path", {
    d: bed(aboutHeight + researchHeight * .58, aboutHeight + researchHeight * .70, 37, 32, 1.8),
    fill: "#383943"
  }), /*#__PURE__*/React.createElement("path", {
    d: below(aboutHeight + researchHeight * .70, 32, 2.1),
    fill: "#292d39"
  }), [.10, .15, .22, .30, .36, .43, .51, .58, .64, .70, .78].map((fraction, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: trace(aboutHeight + researchHeight * fraction, 20 + i % 4 * 9, .8 + i * .29),
    fill: "none",
    stroke: i % 4 === 2 ? '#d0c6b8' : '#a9b5bf',
    strokeOpacity: i % 4 === 2 ? '.31' : '.18',
    strokeWidth: i % 4 === 2 ? 2 : 1
  })), /*#__PURE__*/React.createElement("path", {
    d: `M45 ${aboutHeight + 90}C70 ${aboutHeight + researchHeight * .3} 130 ${aboutHeight + researchHeight * .47} 210 ${aboutHeight + researchHeight * .72}`,
    fill: "none",
    stroke: "#c8d0ce",
    strokeOpacity: ".28",
    strokeWidth: "5"
  }), /*#__PURE__*/React.createElement("path", {
    d: `M1390 ${aboutHeight + researchHeight * .1}C1340 ${aboutHeight + researchHeight * .32} 1380 ${aboutHeight + researchHeight * .52} 1220 ${aboutHeight + researchHeight * .76}`,
    fill: "none",
    stroke: "#c8d0ce",
    strokeOpacity: ".22",
    strokeWidth: "3"
  }), /*#__PURE__*/React.createElement("rect", {
    y: aboutHeight,
    width: "1440",
    height: researchHeight,
    fill: "url(#descent-foliation)"
  }), /*#__PURE__*/React.createElement("path", {
    d: below(mantleTop, 31, 1.4),
    fill: "url(#descent-heat)"
  }), /*#__PURE__*/React.createElement("path", {
    d: trace(mantleTop, 31, 1.4),
    fill: "none",
    stroke: "#b99a80",
    strokeOpacity: ".6",
    strokeWidth: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: bed(mantleTop + contactHeight * .13, mantleTop + contactHeight * .31, 17, 28, .9),
    fill: "#3a3631"
  }), /*#__PURE__*/React.createElement("path", {
    d: bed(mantleTop + contactHeight * .31, mantleTop + contactHeight * .55, 28, 24, 1.2),
    fill: "#403932"
  }), /*#__PURE__*/React.createElement("path", {
    d: below(mantleTop + contactHeight * .55, 24, 1.5),
    fill: "#382f2d"
  }), [.10, .24, .37, .49, .64, .79].map((fraction, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: trace(aboutHeight + researchHeight + contactHeight * fraction, 15 + i * 4, 1.8 + i * .34),
    fill: "none",
    stroke: i % 2 ? '#b4a789' : '#b98773',
    strokeOpacity: i % 2 ? '.26' : '.18',
    strokeWidth: "1.3"
  })), /*#__PURE__*/React.createElement("rect", {
    y: aboutHeight + researchHeight,
    width: "1440",
    height: contactHeight + footerHeight,
    fill: "url(#descent-peridotite)"
  })), children);
};
Object.assign(window, {
  GeologicalDescent
});

// File: HomeSections.jsx
// HomeSections.jsx — About, Research, Publications, Projects, News, Contact

// [destructured React]

/* =====================================================
   Research & Background (About + Activity)
   ===================================================== */
const RECENT_ACTIVITIES = [{
  date: 'September 2026',
  venue: 'InterPore UK Chapter Conference',
  desc: 'Gave an oral presentation on compositional VE modelling for CO₂ storage and co-chaired a multiphase-flow session.'
}, {
  date: 'May 2026',
  venue: 'InterPore 2026',
  desc: 'Gave an oral presentation on VE modelling of CO₂ migration in depleted reservoirs.'
}, {
  date: 'March 2026',
  venue: 'MATLAB/MRST workshop series',
  desc: 'Co-organised the series and led a hands-on session building a flow simulator with MRST.'
}, {
  date: 'October 2025',
  venue: 'EAGE GET 2025',
  desc: 'Presented a poster on three-phase VE simulation of CO₂, methane and brine flow.'
}];
const RecentActivity = () => {
  const [expanded, setExpanded] = useState(false);
  const initialCount = 4;
  const items = expanded ? RECENT_ACTIVITIES : RECENT_ACTIVITIES.slice(0, initialCount);
  return /*#__PURE__*/React.createElement("div", {
    className: "recent-activity-panel"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "activity-panel-title"
  }, "Recent activity"), /*#__PURE__*/React.createElement("div", {
    className: "activity-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "activity-conduit"
  }), items.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "activity-entry"
  }, /*#__PURE__*/React.createElement("div", {
    className: "activity-node-dot"
  }), /*#__PURE__*/React.createElement("div", {
    className: "activity-entry-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "activity-meta-line"
  }, /*#__PURE__*/React.createElement("span", {
    className: "activity-date"
  }, item.date), /*#__PURE__*/React.createElement("span", {
    className: "activity-bullet"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    className: "activity-venue"
  }, item.venue)), /*#__PURE__*/React.createElement("p", {
    className: "activity-desc"
  }, item.desc))))), RECENT_ACTIVITIES.length > initialCount && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "activity-toggle-btn pressable",
    onClick: () => setExpanded(!expanded),
    "aria-expanded": expanded
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas fa-chevron-${expanded ? 'up' : 'down'}`,
    style: {
      fontSize: 11
    }
  }), /*#__PURE__*/React.createElement("span", null, expanded ? 'Show recent activity' : 'View earlier activity')));
};
const AboutSection = ({
  onNavigate
}) => {
  const handleNav = (id, e) => {
    if (e) e.preventDefault();
    if (onNavigate) {
      onNavigate(id);
    } else if (window.__onNavigate) {
      window.__onNavigate(id);
    } else if (id === 'simulator') {
      window.location.href = './simulator.html';
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return /*#__PURE__*/React.createElement(SectionPanel, {
    strataTheme: "sedimentary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dossier-masthead"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("h2", {
    className: "dossier-headline"
  }, "Research & background"), /*#__PURE__*/React.createElement("p", {
    className: "dossier-subtitle"
  }, "Reservoir simulation, geological CO\u2082 storage and scientific machine learning."))), /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "about-intro-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "about-persona-row"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "about-name"
  }, "Sa\u2019eed Telvari"), /*#__PURE__*/React.createElement("div", {
    className: "about-affiliation"
  }, /*#__PURE__*/React.createElement("span", {
    className: "affiliation-primary"
  }, "PhD Researcher \xB7 James Watt Scholarship recipient"), /*#__PURE__*/React.createElement("span", {
    className: "affiliation-secondary"
  }, "Institute of GeoEnergy Engineering, Edinburgh"))), /*#__PURE__*/React.createElement("div", {
    className: "about-lead-copy"
  }, /*#__PURE__*/React.createElement("p", null, "I\u2019m a PhD researcher in petroleum engineering, working on computational models for CO\u2082 storage in depleted gas reservoirs. My research focuses on Vertical Equilibrium (VE) methods, which simplify the vertical description of fluid flow to reduce the computational cost of reservoir simulation."), /*#__PURE__*/React.createElement("p", null, "I\u2019m interested in understanding which physical processes a model needs to represent, where simplifying assumptions are appropriate, and when more detailed simulation is necessary.")), /*#__PURE__*/React.createElement("div", {
    className: "about-actions-strip"
  }, /*#__PURE__*/React.createElement("a", {
    href: "./simulator.html",
    onClick: e => handleNav('simulator', e),
    className: "btn-sim-prominent pressable",
    title: "Launch interactive Vertical Equilibrium simulator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "btn-sim-pulse-dot"
  }), /*#__PURE__*/React.createElement("i", {
    className: "fas fa-play",
    style: {
      fontSize: 10
    }
  }), /*#__PURE__*/React.createElement("span", null, "Try the VE simulator")), /*#__PURE__*/React.createElement("a", {
    href: "#publications",
    onClick: e => handleNav('publications', e),
    className: "btn-text-action pressable"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-search",
    style: {
      fontSize: 11,
      color: '#64ffda'
    }
  }), /*#__PURE__*/React.createElement("span", null, "Explore my research")), /*#__PURE__*/React.createElement("a", {
    href: "#publications",
    onClick: e => handleNav('publications', e),
    className: "btn-text-action pressable"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-book-open",
    style: {
      fontSize: 11,
      color: '#64ffda'
    }
  }), /*#__PURE__*/React.createElement("span", null, "View publications"))))), /*#__PURE__*/React.createElement("div", {
    className: "about-grid-2col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "about-main-column"
  }, /*#__PURE__*/React.createElement(Reveal, {
    delay: "reveal-delay-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "about-block"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "about-block-title"
  }, "Current research"), /*#__PURE__*/React.createElement("p", {
    className: "about-body-text"
  }, "Depleted gas reservoirs still contain natural gas and water. This makes modelling injected CO\u2082 more involved than treating the reservoir as an empty storage space."), /*#__PURE__*/React.createElement("p", {
    className: "about-body-text"
  }, "I develop VE models to describe the movement of CO\u2082 in these settings and compare them with three-dimensional compositional simulations. The aim is to understand how well reduced-order models capture gas migration, where their assumptions break down, and how they can support studies that require many simulation runs."))), /*#__PURE__*/React.createElement(Reveal, {
    delay: "reveal-delay-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "about-block"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "about-block-title"
  }, "Academic background"), /*#__PURE__*/React.createElement("p", {
    className: "about-body-text"
  }, "I completed my B.Sc. and M.Sc. in Petroleum Engineering at Amirkabir University of Technology. My master\u2019s research focused on machine-learning-assisted fracture permeability upscaling, including the use of three-dimensional convolutional neural networks."), /*#__PURE__*/React.createElement("p", {
    className: "about-body-text"
  }, "That work forms part of my broader interest in combining physics-based simulation with data-driven methods for subsurface modelling."))), /*#__PURE__*/React.createElement(Reveal, {
    delay: "reveal-delay-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "about-methods-compact"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "about-block-title",
    style: {
      marginBottom: 12
    }
  }, "Methods & tools"), /*#__PURE__*/React.createElement("div", {
    className: "methods-entry"
  }, /*#__PURE__*/React.createElement("span", {
    className: "methods-category"
  }, "Modelling:"), /*#__PURE__*/React.createElement("span", {
    className: "methods-content"
  }, "Vertical Equilibrium ", /*#__PURE__*/React.createElement("span", {
    className: "method-dot"
  }, "\xB7"), " Multiphase flow ", /*#__PURE__*/React.createElement("span", {
    className: "method-dot"
  }, "\xB7"), " Compositional simulation ", /*#__PURE__*/React.createElement("span", {
    className: "method-dot"
  }, "\xB7"), " Permeability upscaling ", /*#__PURE__*/React.createElement("span", {
    className: "method-dot"
  }, "\xB7"), " Scientific machine learning")), /*#__PURE__*/React.createElement("div", {
    className: "methods-entry",
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "methods-category"
  }, "Programming & simulation:"), /*#__PURE__*/React.createElement("span", {
    className: "methods-content"
  }, "MATLAB ", /*#__PURE__*/React.createElement("span", {
    className: "method-dot"
  }, "\xB7"), " Python ", /*#__PURE__*/React.createElement("span", {
    className: "method-dot"
  }, "\xB7"), " Julia ", /*#__PURE__*/React.createElement("span", {
    className: "method-dot"
  }, "\xB7"), " MRST ", /*#__PURE__*/React.createElement("span", {
    className: "method-dot"
  }, "\xB7"), " JutulDarcy"))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Reveal, {
    delay: "reveal-delay-1"
  }, /*#__PURE__*/React.createElement(RecentActivity, null)))));
};

/* =====================================================
   Publications — Interactive Publication Terminal (Crystalline Strata)
   ===================================================== */
const PUBLICATIONS = [{
  id: 'pub-ve-co2',
  category: 'co2',
  badge: 'preprint',
  badgeLabel: 'Preprint · EarthArXiv',
  badgeClass: 'pub-badge-preprint',
  title: 'A Vertical Equilibrium Model for CO\u2082 Migration in Depleted Gas Fields',
  authors: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: '#64ffda'
    }
  }, "Telvari, S."), ", Ramachandran, H., Wang, G., & Doster, F. (2026)"),
  venue: 'EarthArXiv preprint · 2026',
  keyContribution: 'A VE model reproduces large-scale CO\u2082 and methane migration while running up to two orders of magnitude faster than full 3D simulation in the reported cases.',
  abstract: 'This EarthArXiv preprint develops a reduced-order model of CO\u2082, methane and brine flow in depleted gas reservoirs and compares it with three-dimensional compositional simulations.',
  link: 'https://doi.org/10.31223/X5P49D',
  doi: '10.31223/X5P49D',
  bibtex: `@article{telvari2026vertical,
  title={A Vertical Equilibrium Model for CO2 Migration in Depleted Gas Fields},
  author={Telvari, Sa'eed and Ramachandran, Harish and Wang, Gang and Doster, Florian},
  journal={EarthArXiv},
  year={2026},
  doi={10.31223/X5P49D}
}`
}, {
  id: 'pub-spe-2026',
  category: 'upscaling',
  badge: 'published',
  badgeLabel: 'Peer-Reviewed · SPE Journal',
  badgeClass: 'pub-badge-journal',
  title: 'Accelerated Permeability Upscaling: A CNN Approach',
  authors: /*#__PURE__*/React.createElement(React.Fragment, null, "Sayyafzadeh, M., ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: '#64ffda'
    }
  }, "Telvari, S."), ", Gu\xE9rillot, D., & Sharifi, M. (2026)"),
  venue: 'SPE Journal, 31(04), 2242–2260 · 2026',
  keyContribution: 'Convolutional neural networks achieve 100–400× computational acceleration over fine-scale Darcy flow upscaling in heterogeneous formations.',
  abstract: 'A novel convolutional neural network approach for rapid permeability upscaling in heterogeneous reservoirs, achieving 100-400\u00d7 computational speedup compared to traditional flow-based methods.',
  link: 'https://onepetro.org/SJ/article-abstract/31/04/2242/795099/Accelerated-Permeability-Upscaling-A-Convolutional',
  doi: '10.2118/218018-PA',
  bibtex: `@article{sayyafzadeh2026accelerated,
  title={Accelerated Permeability Upscaling: A CNN Approach},
  author={Sayyafzadeh, Mohammad and Telvari, Sa'eed and Gu{\'e}rillot, Dominique and Sharifi, Mohammad},
  journal={SPE Journal},
  volume={31},
  number={04},
  pages={2242--2260},
  year={2026},
  publisher={Society of Petroleum Engineers}
}`
}, {
  id: 'pub-eage-2025',
  category: 'co2',
  badge: 'conference',
  badgeLabel: 'Conference · EAGE GET',
  badgeClass: 'pub-badge-conf',
  title: 'Three-Phase VE Simulation of CO\u2082\u2013Methane\u2013Brine Flow in Reservoirs',
  authors: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: '#64ffda'
    }
  }, "Telvari, S."), ", Ramachandran, H., Wang, G., & Doster, F. (2025)"),
  venue: 'Sixth EAGE Global Energy Transition Conference & Exhibition (GET 2025) — Poster Presentation',
  keyContribution: 'Formulates three-phase CO\u2082–CH\u2084–brine vertical equilibria to capture residual cushion-gas mixing during carbon sequestration in partially depleted gas reservoirs.',
  abstract: 'An extended abstract presenting a Vertical Equilibrium (VE) model for simulating three-phase CO\u2082\u2013methane\u2013brine flow in depleted gas reservoirs, enabling efficient large-scale simulation of CO\u2082 storage with residual methane interactions.',
  link: 'https://doi.org/10.3997/2214-4609.202521145',
  doi: '10.3997/2214-4609.202521145',
  bibtex: `@inproceedings{telvari2025three,
  title={Three-Phase VE Simulation of CO2--Methane--Brine Flow in Reservoirs},
  author={Telvari, Sa'eed and Ramachandran, Harish and Wang, Gang and Doster, Florian},
  booktitle={Sixth EAGE Global Energy Transition Conference & Exhibition},
  year={2025},
  doi={10.3997/2214-4609.202521145}
}`
}, {
  id: 'pub-awr-2023',
  category: 'rock',
  badge: 'published',
  badgeLabel: 'Peer-Reviewed · Adv. Water Res.',
  badgeClass: 'pub-badge-journal',
  title: 'Prediction of two-phase flow properties for digital sandstones using 3D convolutional neural networks',
  authors: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: '#64ffda'
    }
  }, "Telvari, S."), ", Sayyafzadeh, M., Siavashi, J., & Sharifi, M. (2023)"),
  venue: 'Advances in Water Resources, 176, 104442 · 2023',
  keyContribution: 'Predicts relative permeability and capillary pressure curves directly from 3D micro-CT imagery without costly pore-network or lattice-Boltzmann simulations.',
  abstract: 'Developed a 3D CNN architecture for predicting relative permeability and capillary pressure curves directly from micro-CT images, eliminating the need for expensive pore-network modeling.',
  link: 'https://doi.org/10.1016/j.advwatres.2023.104442',
  doi: '10.1016/j.advwatres.2023.104442',
  bibtex: `@article{telvari2023prediction,
  title={Prediction of two-phase flow properties for digital sandstones using 3D convolutional neural networks},
  author={Telvari, Sa'eed and Sayyafzadeh, Mohammad and Siavashi, Javad and Sharifi, Mohammad},
  journal={Advances in Water Resources},
  volume={176},
  pages={104442},
  year={2023},
  publisher={Elsevier},
  doi={10.1016/j.advwatres.2023.104442}
}`
}];
const DOMAIN_FILTERS = [{
  id: 'all',
  label: 'All Research'
}, {
  id: 'co2',
  label: 'CO\u2082 & VE Modeling'
}, {
  id: 'rock',
  label: 'Digital Rock Physics'
}, {
  id: 'upscaling',
  label: 'Permeability Upscaling & ML'
}];
const PublicationsList = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const filteredPubs = activeFilter === 'all' ? PUBLICATIONS : PUBLICATIONS.filter(p => p.category === activeFilter);
  const visiblePubs = showAll ? filteredPubs : filteredPubs.slice(0, 2);
  const handleCopyBibtex = p => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(p.bibtex.trim()).then(() => {
        setCopiedId(p.id);
        setTimeout(() => setCopiedId(null), 1800);
      }).catch(() => {});
    }
  };
  return /*#__PURE__*/React.createElement(SectionPanel, {
    strataTheme: "crystalline"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pub-terminal-header"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("h2", {
    className: "dossier-headline"
  }, "Interactive Publication Terminal"), /*#__PURE__*/React.createElement("p", {
    className: "dossier-subtitle"
  }, "Peer-reviewed journal articles, conference proceedings, and open preprints spanning reduced-order Vertical Equilibrium, 3D micro-CT characterization, and machine-learning upscaling."))), /*#__PURE__*/React.createElement(Reveal, {
    delay: "reveal-delay-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pub-filter-bar",
    role: "tablist",
    "aria-label": "Publication topic filter"
  }, DOMAIN_FILTERS.map(f => {
    const count = f.id === 'all' ? PUBLICATIONS.length : PUBLICATIONS.filter(p => p.category === f.id).length;
    const isActive = activeFilter === f.id;
    return /*#__PURE__*/React.createElement("button", {
      key: f.id,
      role: "tab",
      "aria-selected": isActive,
      className: `pub-filter-pill ${isActive ? 'active' : ''}`,
      onClick: () => {
        setActiveFilter(f.id);
        setShowAll(false);
      }
    }, /*#__PURE__*/React.createElement("span", null, f.label), /*#__PURE__*/React.createElement("span", {
      className: "pub-filter-count"
    }, count));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, visiblePubs.map((p, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: p.id,
    delay: `reveal-delay-${i % 2 + 1}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "pub-card-elevated"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pub-card-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: `pub-badge-pill ${p.badgeClass}`
  }, p.badgeLabel), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontFamily: 'ui-monospace, monospace',
      color: 'rgba(255,255,255,0.50)'
    }
  }, "DOI: ", p.doi)), /*#__PURE__*/React.createElement("h3", {
    className: "pub-card-title"
  }, p.title), /*#__PURE__*/React.createElement("p", {
    className: "pub-authors-line"
  }, p.authors), /*#__PURE__*/React.createElement("p", {
    className: "pub-venue-line"
  }, p.venue), /*#__PURE__*/React.createElement("div", {
    className: "pub-key-contribution"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pub-key-contribution-label"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-lightbulb"
  }), " Key Contribution"), /*#__PURE__*/React.createElement("p", {
    className: "pub-key-contribution-text"
  }, p.keyContribution)), /*#__PURE__*/React.createElement("p", {
    className: "pub-abstract-text"
  }, p.abstract), /*#__PURE__*/React.createElement("div", {
    className: "pub-actions-bar"
  }, p.link && /*#__PURE__*/React.createElement("a", {
    href: p.link,
    target: "_blank",
    rel: "noreferrer",
    className: "btn-doi-view"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-external-link-alt",
    style: {
      fontSize: 11
    }
  }), "View Publication / DOI"), /*#__PURE__*/React.createElement("button", {
    className: "btn-cite-copy",
    onClick: () => handleCopyBibtex(p),
    "aria-label": `Copy BibTeX citation for ${p.title}`
  }, /*#__PURE__*/React.createElement("i", {
    className: copiedId === p.id ? "fas fa-check" : "far fa-copy",
    style: {
      color: copiedId === p.id ? '#64ffda' : 'inherit'
    }
  }), /*#__PURE__*/React.createElement("span", null, copiedId === p.id ? "Citation Copied!" : "Copy BibTeX"), copiedId === p.id && /*#__PURE__*/React.createElement("span", {
    className: "cite-tooltip-badge"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-check"
  }), " BibTeX copied to clipboard"))))))), filteredPubs.length > 2 && /*#__PURE__*/React.createElement("div", {
    className: "pub-view-more-container"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "pub-view-more-btn pressable",
    onClick: () => setShowAll(prev => !prev),
    "aria-expanded": showAll
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${showAll ? 'fa-chevron-up' : 'fa-chevron-down'}`,
    style: {
      fontSize: 11
    }
  }), /*#__PURE__*/React.createElement("span", null, showAll ? 'Show Fewer Publications' : `View More Publications (${filteredPubs.length - 2} remaining)`))));
};

/* =====================================================
   Contact — Collaboration Terminal & Academic Office (Mantle Strata)
   ===================================================== */
const VERIFIED_PROFILES = [{
  icon: 'fas fa-graduation-cap',
  label: 'Google Scholar',
  meta: 'Citation Index & Academic Metrics',
  url: 'https://scholar.google.co.uk/citations?user=_nGa8EQAAAAJ&hl=en&inst=16061989973938494330'
}, {
  icon: 'fas fa-id-badge',
  label: 'ORCID Registry',
  meta: '0000-0002-4896-295X (Verified)',
  url: 'https://orcid.org/0000-0002-4896-295X'
}, {
  icon: 'fab fa-linkedin',
  label: 'LinkedIn Profile',
  meta: 'Professional Network & Research Updates',
  url: 'https://www.linkedin.com/in/stelvari/'
}, {
  icon: 'fab fa-github',
  label: 'GitHub Codebases',
  meta: 'Open-Source Solvers & Scientific Repos',
  url: 'https://github.com/saeedtelvari'
}];
const ContactSection = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [localTime, setLocalTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/London',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(new Date());
        setLocalTime(timeStr);
      } catch (e) {
        setLocalTime('10:00');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);
  const copyEmail = () => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText('st4014@hw.ac.uk').then(() => {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2200);
      }).catch(() => {});
    }
  };
  return /*#__PURE__*/React.createElement(SectionPanel, {
    strataTheme: "mantle"
  }, /*#__PURE__*/React.createElement("div", {
    className: "collab-terminal-header"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("h2", {
    className: "dossier-headline"
  }, "Collaboration Terminal & Academic Office"), /*#__PURE__*/React.createElement("p", {
    className: "dossier-subtitle"
  }, "I am always open to discussions regarding computational reservoir simulation collaborations, industrial CCUS storage assessments, and scientific seminar invitations."))), /*#__PURE__*/React.createElement("div", {
    className: "collab-console-grid"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "collab-hero-tile"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: 'rgba(249, 115, 22, 0.15)',
      border: '1px solid rgba(249, 115, 22, 0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#f97316',
      fontSize: 16
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-paper-plane"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 17,
      color: '#fff',
      fontWeight: 700,
      margin: 0
    }
  }, "Direct Academic Communication"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: 'rgba(255,255,255,0.60)',
      fontFamily: 'ui-monospace, monospace'
    }
  }, "PRIMARY DESK \xB7 INSTITUTIONAL EMAIL"))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.80)',
      lineHeight: 1.6,
      margin: '0 0 20px'
    }
  }, "For preprints, research inquiries, or code questions on Vertical Equilibrium models, feel free to reach out directly:"), /*#__PURE__*/React.createElement("div", {
    className: "email-copy-action-box pressable",
    onClick: copyEmail,
    title: "Click to copy email address",
    role: "button",
    tabIndex: 0,
    onKeyDown: e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        copyEmail();
      }
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-envelope",
    style: {
      fontSize: 20,
      color: '#64ffda'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.55)',
      fontFamily: 'ui-monospace, monospace'
    }
  }, "INSTITUTIONAL ADDRESS"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: '#fff',
      fontWeight: 700,
      fontFamily: 'ui-monospace, monospace'
    }
  }, "st4014@hw.ac.uk"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, copiedEmail ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      fontWeight: 700,
      color: '#64ffda',
      background: 'rgba(100, 255, 218, 0.15)',
      padding: '4px 10px',
      borderRadius: 6,
      border: '1px solid rgba(100, 255, 218, 0.30)',
      fontFamily: 'ui-monospace, monospace'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-check"
  }), " COPIED!") : /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      color: 'rgba(255,255,255,0.65)',
      background: 'rgba(255,255,255,0.06)',
      padding: '4px 10px',
      borderRadius: 6,
      border: '1px solid rgba(255,255,255,0.10)',
      fontFamily: 'ui-monospace, monospace'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "far fa-copy"
  }), " COPY"), /*#__PURE__*/React.createElement("a", {
    href: "mailto:st4014@hw.ac.uk",
    onClick: e => e.stopPropagation(),
    style: {
      width: 32,
      height: 32,
      borderRadius: 6,
      background: 'rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 12,
      textDecoration: 'none'
    },
    title: "Open mail app"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-external-link-alt"
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "office-telemetry-pill"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-map-marker-alt",
    style: {
      color: '#f97316'
    }
  }), /*#__PURE__*/React.createElement("span", null, "Institute of GeoEnergy Engineering \xB7 Heriot-Watt University, Edinburgh, UK"), /*#__PURE__*/React.createElement("span", {
    className: "office-time-clock"
  }, /*#__PURE__*/React.createElement("i", {
    className: "far fa-clock"
  }), " ", localTime || '10:00', " UK Time")))), /*#__PURE__*/React.createElement(Reveal, {
    delay: "reveal-delay-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "verified-profiles-grid"
  }, VERIFIED_PROFILES.map((p, idx) => /*#__PURE__*/React.createElement("a", {
    key: idx,
    href: p.url,
    target: "_blank",
    rel: "noreferrer",
    className: "verified-profile-card pressable"
  }, /*#__PURE__*/React.createElement("div", {
    className: "verified-profile-icon"
  }, /*#__PURE__*/React.createElement("i", {
    className: p.icon
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 700,
      color: '#fff',
      margin: '0 0 2px'
    }
  }, p.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'rgba(255,255,255,0.65)',
      lineHeight: 1.35
    }
  }, p.meta))))))));
};
Object.assign(window, {
  AboutSection,
  PublicationsList,
  ContactSection
});

// File: CVPage.jsx
// CVPage.jsx — single long glass page mirroring cv.html

const CVPage = ({
  onNavigate
}) => {
  const handlePrint = () => {
    window.print();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "cv-page",
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
          .app-header, footer, .cv-download-btn, .cv-background-overlay {
            display: none !important;
          }
          body, .cv-page {
            background: #fff !important;
          }
          .cv-page {
            padding: 0 !important;
          }
          .cv-card-container, .cv-card-container * {
            color: #111 !important;
            -webkit-text-fill-color: #111 !important;
            background: none !important;
            box-shadow: none !important;
          }
          .cv-card-container {
            border: none !important;
            padding: 0 !important;
          }
        }
      `), /*#__PURE__*/React.createElement("div", {
    className: "cv-background-overlay",
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
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(GlassButton, {
    variant: "mint",
    icon: "fas fa-print",
    onClick: handlePrint
  }, "Print / Save as PDF")))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(CVSection, {
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
    icon: "fas fa-microscope",
    title: "Research Experience & Selected Projects"
  }, /*#__PURE__*/React.createElement(Timeline, {
    items: [{
      title: 'Doctoral Researcher — Vertical Equilibrium Modeling',
      date: '2024 – Present',
      inst: 'Institute of GeoEnergy Engineering, Heriot-Watt University',
      details: ['Developing reduced-order models for CO₂–methane–brine migration in depleted gas reservoirs, with applications to screening, uncertainty analysis, and field-scale forecasting.']
    }, {
      title: 'Machine-Learning Permeability Upscaling',
      date: '2022 – 2026',
      inst: 'Amirkabir University of Technology',
      details: ['Developed CNN-based workflows for estimating effective permeability from heterogeneous fine-scale reservoir models.']
    }, {
      title: 'Digital Sandstone Two-Phase Flow Prediction',
      date: '2021 – 2023',
      inst: 'Amirkabir University of Technology',
      details: ['Built 3D convolutional neural networks to predict relative-permeability and capillary-pressure behavior from digital-rock images.']
    }]
  })), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(CVSection, {
    icon: "fas fa-book-open",
    title: "Selected Publications"
  }, /*#__PURE__*/React.createElement(Timeline, {
    items: [{
      title: 'A Vertical Equilibrium Model for CO₂ Migration in Depleted Gas Fields',
      date: '2026',
      inst: 'EarthArXiv preprint · DOI 10.31223/X5P49D',
      details: ['Telvari, S.; Ramachandran, H.; Wang, G.; Doster, F.']
    }, {
      title: 'Accelerated Permeability Upscaling: A Convolutional Neural Network Approach',
      date: '2026',
      inst: 'SPE Journal 31(04), 2242–2260',
      details: ['Sayyafzadeh, M.; Telvari, S.; Guérillot, D.; Sharifi, M.']
    }, {
      title: 'Three-Phase VE Simulation of CO₂–Methane–Brine Flow in Reservoirs',
      date: '2025',
      inst: 'Sixth EAGE Global Energy Transition Conference & Exhibition',
      details: ['Telvari, S.; Ramachandran, H.; Wang, G.; Doster, F.']
    }, {
      title: 'Prediction of two-phase flow properties for digital sandstones using 3D convolutional neural networks',
      date: '2023',
      inst: 'Advances in Water Resources 176, 104442',
      details: ['Telvari, S.; Sayyafzadeh, M.; Siavashi, J.; Sharifi, M.']
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://orcid.org/0000-0002-4896-295X",
    target: "_blank",
    rel: "noreferrer",
    style: {
      color: '#64ffda'
    }
  }, "ORCID profile"), /*#__PURE__*/React.createElement("a", {
    href: "https://scholar.google.co.uk/citations?user=_nGa8EQAAAAJ&hl=en&inst=16061989973938494330",
    target: "_blank",
    rel: "noreferrer",
    style: {
      color: '#64ffda'
    }
  }, "Google Scholar"))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(CVSection, {
    icon: "fas fa-chalkboard-teacher",
    title: "Selected Presentations & Teaching"
  }, /*#__PURE__*/React.createElement(Timeline, {
    items: [{
      title: 'Oral presentation & session co-chair',
      date: 'September 2026',
      inst: '9th InterPore UK Chapter Conference, Edinburgh',
      details: ['Presented “A Compositional Vertical Equilibrium Model for CO₂ Storage in Depleted Gas Reservoirs” and co-chaired the Multiphase Phenomena session.']
    }, {
      title: 'Oral presentation',
      date: 'May 2026',
      inst: 'InterPore2026, Nantes',
      details: ['Presented “Vertical-Equilibrium Modelling of CO₂ Migration in Depleted Reservoirs”.']
    }, {
      title: 'Lead instructor & co-organiser',
      date: 'March 2026',
      inst: 'MATLAB/MRST Workshop Series, Heriot-Watt University',
      details: ['Led a hands-on session building a flow simulator with MRST’s rapid prototyping framework.']
    }, {
      title: 'Poster presentation',
      date: 'October 2025',
      inst: '6th EAGE Global Energy Transition Conference, Rotterdam',
      details: ['Presented “Three-Phase VE Simulation of CO₂–Methane–Brine Flow in Reservoirs”.']
    }]
  })), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(CVSection, {
    icon: "fas fa-tools",
    title: "Skills"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cv-skills-grid"
  }, /*#__PURE__*/React.createElement(SkillCategory, {
    icon: "fas fa-code",
    title: "Programming",
    tags: ['Python', 'MATLAB', 'Julia']
  }), /*#__PURE__*/React.createElement(SkillCategory, {
    icon: "fas fa-industry",
    title: "Reservoir Simulation",
    tags: ['MRST', 'Eclipse', 'Petrel RE']
  }), /*#__PURE__*/React.createElement(SkillCategory, {
    icon: "fas fa-cube",
    title: "Industry Training",
    tags: ['CMG CO₂ Storage', 'SLB Intersect CCS']
  }), /*#__PURE__*/React.createElement(SkillCategory, {
    icon: "fas fa-laptop-code",
    title: "Research Tools",
    tags: ['Git', 'Jupyter', 'LaTeX', 'Linux']
  }))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(CVSection, {
    icon: "fas fa-award",
    title: "Selected Recognition"
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    }
  }, [{
    icon: 'fas fa-graduation-cap',
    body: 'James Watt Scholarship recipient — full PhD funding, Heriot-Watt University (2024–present)'
  }, {
    icon: 'fas fa-medal',
    body: 'Runner-up, SPE Aberdeen Section Student Bursary — £1,000 awarded (2026)'
  }, {
    icon: 'fas fa-medal',
    body: 'Team runner-up, EAGE “The Energy–AI Nexus” Hackathon (2026)'
  }, {
    icon: 'fas fa-graduation-cap',
    body: 'National undergraduate scholarship — full tuition waiver'
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

// File: App.jsx
// App.jsx — top-level wiring

// [destructured React]

// Loader dismissal shared by the home entry (index.html) and the standalone
// simulator entry (simulator.html).
const dismissLoader = () => {
  if (window.__appReady) window.__appReady(); // push loader progress bar to 100%
  const loader = document.getElementById('app-loader');
  if (!loader) return () => {};
  const startTime = window.__pageLoadStart || Date.now();
  const elapsed = Date.now() - startTime;
  const minDuration = 150;
  const remaining = Math.max(0, minDuration - elapsed);
  const timer = setTimeout(() => {
    loader.classList.add('loader-finished');
    setTimeout(() => {
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 500);
  }, remaining);
  return () => clearTimeout(timer);
};
const App = () => {
  const [screen, setScreen] = useState('home');
  const [activeSection, setActiveSection] = useState('home');
  const applyLocation = () => {
    const id = (window.location.hash || '#home').slice(1);
    if (id === 'simulator') {
      window.location.replace('./simulator.html');
      return;
    }
    if (id === 'cv') {
      setScreen('cv');
      setActiveSection('cv');
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
  const onNavigate = id => {
    if (id === 'simulator') {
      window.location.href = './simulator.html';
      return;
    }
    const hash = id === 'home' ? '' : '#' + id;
    window.history.pushState({
      screen: id
    }, '', './index.html' + hash);
    applyLocation();
  };

  // Expose onNavigate globally for child buttons
  useEffect(() => {
    window.__onNavigate = onNavigate;
  });

  // Dismiss 0ms pre-React loading screen once components mount and initial simulation renders
  useEffect(() => {
    return dismissLoader();
  }, []);
  useEffect(() => {
    applyLocation();
    window.addEventListener('hashchange', applyLocation);
    window.addEventListener('popstate', applyLocation);
    return () => {
      window.removeEventListener('hashchange', applyLocation);
      window.removeEventListener('popstate', applyLocation);
    };
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
      background: 'var(--bg-gradient)',
      color: '#fff',
      fontFamily: "'Montserrat', sans-serif"
    },
    "data-screen-label": screen === 'cv' ? '02 CV' : '01 Home'
  }, /*#__PURE__*/React.createElement(Header, {
    active: currentNav,
    onNavigate: onNavigate
  }), screen === 'home' ? /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(SubsurfaceHero, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement(GeologicalDescent, null, /*#__PURE__*/React.createElement("div", {
    id: "about"
  }), /*#__PURE__*/React.createElement(AboutSection, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement("div", {
    id: "research"
  }), /*#__PURE__*/React.createElement("div", {
    id: "publications"
  }), /*#__PURE__*/React.createElement(PublicationsList, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement("div", {
    id: "contact"
  }), /*#__PURE__*/React.createElement(ContactSection, null), /*#__PURE__*/React.createElement(Footer, {
    onNavigate: onNavigate,
    geological: true
  }))) : /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(CVPage, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement(Footer, {
    onNavigate: onNavigate
  })));
};

// Standalone simulator entry — rendered when the page is simulator.html.
// Fully independent from the home page: no hero, no sections, own URL.
const SimulatorStandalone = () => {
  useEffect(() => {
    return dismissLoader();
  }, []);
  const simNav = id => {
    if (id === 'simulator') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
    window.location.href = './index.html' + (id === 'home' ? '' : '#' + id);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "ve-standalone",
    "data-screen-label": "03 VE Simulator"
  }, /*#__PURE__*/React.createElement(Header, {
    active: "simulator",
    onNavigate: simNav,
    variant: "workbench"
  }), /*#__PURE__*/React.createElement("main", {
    id: "main-content"
  }, /*#__PURE__*/React.createElement(SimulatorPage, null)));
};
const rootEl = document.getElementById('root');
const isSimulatorEntry = rootEl && typeof rootEl.getAttribute === 'function' && rootEl.getAttribute('data-page') === 'simulator';
const root = ReactDOM.createRoot(rootEl);
if (isSimulatorEntry) {
  root.render( /*#__PURE__*/React.createElement(SimulatorStandalone, null));
} else {
  root.render( /*#__PURE__*/React.createElement(App, null));
}

