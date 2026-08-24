// Header.jsx — fixed top navbar, transparent over hero, shrinks on scroll, with mobile drawer.

const { useEffect, useState, useRef } = React;

const Header = ({ active, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(active);

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
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen) setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const items = [
    { id: 'home',         label: 'Home' },
    { id: 'about',        label: 'About' },
    { id: 'publications', label: 'Research' },
    { id: 'simulator',    label: 'VE Simulator' },
    { id: 'cv',           label: 'CV' },
  ];

  const handleItemClick = (id) => {
    setMobileOpen(false);
    if (onNavigate) onNavigate(id);
    else if (window.__onNavigate) window.__onNavigate(id);
  };

  return (
    <header 
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
      `}</style>

      <div 
        className="header-container"
        style={{
          height: scrolled ? 64 : 88,
          padding: '0 36px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'all 0.4s ease',
          background: scrolled
            ? 'linear-gradient(180deg, rgba(19, 13, 28, 0.92) 0%, rgba(19, 13, 28, 0.75) 100%)'
            : 'linear-gradient(180deg, rgba(19, 13, 28, 0.60) 0%, rgba(19, 13, 28, 0.20) 60%, transparent 100%)',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(6px)',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(6px)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.30), inset 0 -1px 0 rgba(255,255,255,0.08)' : 'none',
          pointerEvents: 'auto',
        }}
      >
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); handleItemClick('home'); }}
          aria-label="Sa'eed Telvari Homepage"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: scrolled ? 44 : 58, height: scrolled ? 44 : 58,
            transition: 'all 0.4s ease',
          }}
        >
          <img 
            src="./assets/logo-minimalist.png" 
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
                active={currentSection === it.id}
                onClick={() => handleItemClick(it.id)}
              />
            ))}
          </ul>
        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          className="hamburger-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'}`} />
        </button>
      </div>

      {/* Mobile Navigation Drawer Backdrop */}
      <div 
        className={`mobile-drawer-backdrop ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer Panel */}
      <div className={`mobile-drawer-panel ${mobileOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Mobile Navigation">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="./assets/logo-minimalist.png" alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>Sa&rsquo;eed Telvari</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
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
                <button
                  type="button"
                  onClick={() => handleItemClick(it.id)}
                  style={{
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
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{it.label}</span>
                  {isActive && <i className="fas fa-chevron-right" style={{ fontSize: 11, color: '#64ffda' }} />}
                </button>
              </li>
            );
          })}
        </ul>

        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Connect
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="https://www.linkedin.com/in/stelvari/" target="_blank" rel="noreferrer" aria-label="LinkedIn" style={{ color: '#64ffda', fontSize: 16 }}>
              <i className="fab fa-linkedin" />
            </a>
            <a href="https://github.com/saeedtelvari" target="_blank" rel="noreferrer" aria-label="GitHub" style={{ color: '#64ffda', fontSize: 16 }}>
              <i className="fab fa-github" />
            </a>
            <a href="mailto:st4014@hw.ac.uk" aria-label="Email" style={{ color: '#64ffda', fontSize: 16 }}>
              <i className="fas fa-envelope" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

const NavItem = ({ label, active, onClick }) => {
  const [hover, setHover] = useState(false);
  const showPill = hover || active;
  return (
    <li>
      <button
        type="button"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={onClick}
        aria-current={active ? 'page' : undefined}
        style={{
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
          background: showPill
            ? 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 100%)'
            : 'transparent',
          backdropFilter: showPill ? 'blur(10px)' : 'none',
          WebkitBackdropFilter: showPill ? 'blur(10px)' : 'none',
          border: active 
            ? '1px solid rgba(100,255,218,0.40)' 
            : showPill 
              ? '1px solid rgba(255,255,255,0.15)' 
              : '1px solid transparent',
          boxShadow: active 
            ? '0 4px 15px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.20), 0 0 10px rgba(100,255,218,0.15)'
            : showPill 
              ? '0 4px 15px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.30)' 
              : 'none',
          outline: 'none',
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
            backgroundColor: '#64ffda',
            boxShadow: '0 0 8px #64ffda',
          }} />
        )}
      </button>
    </li>
  );
};

Object.assign(window, { Header });
