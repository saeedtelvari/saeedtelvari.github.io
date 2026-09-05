// Header.jsx — fixed top navbar, transparent over hero, shrinks on scroll, with mobile drawer.

const { useEffect, useState, useRef } = React;

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

const Header = ({ active, onNavigate, variant = 'site' }) => {
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
        const sections = [
          { id: 'contact',      el: document.getElementById('contact') },
          { id: 'publications', el: document.getElementById('publications') },
          { id: 'about',        el: document.getElementById('about') },
          { id: 'home',         el: document.getElementById('home') },
        ];
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
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [active]);

  // Sync current section if active prop changes
  useEffect(() => {
    setCurrentSection(active);
  }, [active]);

  // Close drawer on escape key
  useEffect(() => {
    if (variant === 'workbench') return undefined;
    const onKeyDown = (e) => {
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

  const items = [
    { id: 'home',         label: 'Home', href: './index.html' },
    { id: 'about',        label: 'About', href: './index.html#about' },
    { id: 'publications', label: 'Research', href: './index.html#publications' },
    { id: 'simulator',    label: 'VE Simulator', href: './simulator.html' },
    { id: 'contact',      label: 'Contact', href: './index.html#contact' },
    { id: 'cv',           label: 'CV', href: './index.html#cv' },
  ];

  const handleItemClick = (id) => {
    setMobileOpen(false);
    if (onNavigate) onNavigate(id);
    else if (window.__onNavigate) window.__onNavigate(id);
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
    activeBorder: 'var(--ve-accent)',
  } : {
    divider: 'rgba(255,255,255,0.08)',
    ink: '#fff',
    link: 'rgba(255,255,255,0.85)',
    muted: 'rgba(255,255,255,0.6)',
    subtle: 'rgba(255,255,255,0.5)',
    accent: '#64ffda',
    activeBackground: 'rgba(100,255,218,0.15)',
    activeBorder: 'rgba(100,255,218,0.35)',
  };
  const siteScrolledBackground = 'linear-gradient(180deg, rgba(19, 13, 28, 0.92) 0%, rgba(19, 13, 28, 0.75) 100%)';
  const siteTopBackground = 'linear-gradient(180deg, rgba(19, 13, 28, 0.60) 0%, rgba(19, 13, 28, 0.20) 60%, transparent 100%)';
  const siteBorderBottom = scrolled ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent';
  const siteBoxShadow = scrolled ? '0 4px 30px rgba(0,0,0,0.30), inset 0 -1px 0 rgba(255,255,255,0.08)' : 'none';

  return (
    <header
      className={isWorkbench ? 'app-header app-header--workbench' : 'app-header'}
      role="banner"
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <style>{`
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
      `}</style>

      <div 
        className="header-container"
        style={{
          height: isWorkbench ? 56 : (scrolled ? 64 : 88),
          padding: '0 36px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: isWorkbench ? 'none' : 'all 0.4s ease',
          background: isWorkbench ? '#ffffff' : (scrolled ? siteScrolledBackground : siteTopBackground),
          backdropFilter: isWorkbench ? 'none' : (scrolled ? 'blur(20px) saturate(180%)' : 'blur(6px)'),
          WebkitBackdropFilter: isWorkbench ? 'none' : (scrolled ? 'blur(20px) saturate(180%)' : 'blur(6px)'),
          borderBottom: isWorkbench ? '1px solid var(--ve-border)' : siteBorderBottom,
          boxShadow: isWorkbench ? 'none' : siteBoxShadow,
          pointerEvents: 'auto',
        }}
      >
        <a
          href="./index.html"
          onClick={(e) => { e.preventDefault(); handleItemClick('home'); }}
          aria-label="Sa'eed Telvari Homepage"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: scrolled ? 44 : 58, height: scrolled ? 44 : 58,
            transition: isWorkbench ? 'none' : 'all 0.4s ease',
          }}
        >
          <img 
            src="./assets/logo-minimalist.webp"
            alt="Sa'eed Telvari" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        </a>

        {/* Desktop Navigation */}
        <nav role="navigation" aria-label="Main menu">
          <ul className="desktop-nav-list">
            {items.map(it => (
              <NavItem
                key={it.id}
                label={it.label}
                href={it.href}
                active={currentSection === it.id}
                onClick={() => handleItemClick(it.id)}
                variant={variant}
              />
            ))}
          </ul>
        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          ref={menuButtonRef}
          className={`hamburger-btn${isWorkbench ? ' workbench' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'}`} />
        </button>
      </div>

      {/* Mobile Navigation Drawer Backdrop */}
      {mobileOpen && <React.Fragment>
      <div className={`mobile-drawer-backdrop open${isWorkbench ? ' workbench' : ''}`} onClick={() => setMobileOpen(false)} aria-hidden="true" />
      <div ref={mobileDrawerRef} className={`mobile-drawer-panel open${isWorkbench ? ' workbench' : ''}`} role="dialog" aria-modal="true" aria-label="Mobile Navigation">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${drawerPalette.divider}`, paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="./assets/logo-minimalist.webp" alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: drawerPalette.ink, letterSpacing: '-0.01em' }}>Sa&rsquo;eed Telvari</span>
          </div>
          <button
            type="button"
            ref={closeButtonRef}
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            style={{
              background: 'none', border: 'none', color: drawerPalette.muted,
              fontSize: 18, cursor: 'pointer', padding: 4,
            }}
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(it => {
            const isActive = currentSection === it.id;
            return (
              <li key={it.id}>
                <a
                  href={it.href}
                  onClick={(e) => { e.preventDefault(); handleItemClick(it.id); }}
                  style={{
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
                    transition: isWorkbench
                      ? 'color 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 160ms cubic-bezier(0.23, 1, 0.32, 1), border-color 160ms cubic-bezier(0.23, 1, 0.32, 1)'
                      : 'all 0.2s ease',
                  }}
                >
                  <span>{it.label}</span>
                  {isActive && <i className="fas fa-chevron-right" style={{ fontSize: 11, color: drawerPalette.accent }} />}
                </a>
              </li>
            );
          })}
        </ul>

        <div style={{ marginTop: 'auto', borderTop: `1px solid ${drawerPalette.divider}`, paddingTop: 16 }}>
          <div style={{ fontSize: 11, color: drawerPalette.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Connect
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="https://www.linkedin.com/in/stelvari/" target="_blank" rel="noreferrer" aria-label="LinkedIn" style={{ color: drawerPalette.accent, fontSize: 16 }}>
              <i className="fab fa-linkedin" />
            </a>
            <a href="https://github.com/saeedtelvari" target="_blank" rel="noreferrer" aria-label="GitHub" style={{ color: drawerPalette.accent, fontSize: 16 }}>
              <i className="fab fa-github" />
            </a>
            <a href="mailto:st4014@hw.ac.uk" aria-label="Email" style={{ color: drawerPalette.accent, fontSize: 16 }}>
              <i className="fas fa-envelope" />
            </a>
          </div>
        </div>
      </div>
      </React.Fragment>}
    </header>
  );
};

const NavItem = ({ label, href, active, onClick, variant = 'site' }) => {
  const [hover, setHover] = useState(false);
  const showPill = hover || active;
  const existingBackground = showPill
    ? 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 100%)'
    : 'transparent';
  const existingBorder = active
    ? '1px solid rgba(100,255,218,0.40)'
    : showPill
      ? '1px solid rgba(255,255,255,0.15)'
      : '1px solid transparent';
  const existingTransform = hover ? 'translateY(-2px)' : 'translateY(0)';
  return (
    <li>
      <a
        href={href}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={(e) => { e.preventDefault(); onClick(); }}
        aria-current={active ? 'page' : undefined}
        style={{
          position: 'relative',
          padding: '8px 16px',
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 14.5,
          fontWeight: active ? 600 : 400,
          color: variant === 'workbench' ? (active ? 'var(--ve-accent)' : 'var(--ve-ink)') : (active ? '#64ffda' : 'azure'),
          cursor: 'pointer',
          borderRadius: 12,
          transition: variant === 'workbench'
            ? 'color 140ms ease, background-color 140ms ease, border-color 140ms ease, transform 140ms cubic-bezier(0.23,1,0.32,1)'
            : 'all 0.35s cubic-bezier(0.175,0.885,0.32,1.275)',
          transform: variant === 'workbench' && hover ? 'translateY(-1px)' : existingTransform,
          background: variant === 'workbench' && showPill ? 'var(--ve-accent-soft)' : existingBackground,
          backdropFilter: variant === 'workbench' ? 'none' : (showPill ? 'blur(10px)' : 'none'),
          WebkitBackdropFilter: variant === 'workbench' ? 'none' : (showPill ? 'blur(10px)' : 'none'),
          border: variant === 'workbench' && active ? '1px solid rgba(23,111,104,0.28)' : existingBorder,
          boxShadow: variant === 'workbench'
            ? 'none'
            : active
              ? '0 4px 15px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.20), 0 0 10px rgba(100,255,218,0.15)'
              : showPill
                ? '0 4px 15px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.30)'
                : 'none',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>{label}</span>
        {active && (
          <span style={{
            position: 'absolute',
            bottom: 2,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: variant === 'workbench' ? 'var(--ve-accent)' : '#64ffda',
            boxShadow: variant === 'workbench' ? 'none' : '0 0 8px #64ffda',
          }} />
        )}
      </a>
    </li>
  );
};

Object.assign(window, { Header });
