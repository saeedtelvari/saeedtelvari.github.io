// Header.jsx — fixed top navbar, transparent over hero, shrinks on scroll, responsive mobile drawer.

const { useEffect, useState } = React;

const Header = ({ active, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const items = [
    { id: 'home',         label: 'Home' },
    { id: 'about',        label: 'About' },
    { id: 'publications', label: 'Research' },
    { id: 'simulator',    label: 'VE Simulator' },
    { id: 'cv',           label: 'CV' },
  ];

  const handleNav = (id) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000,
      pointerEvents: 'none',
    }}>
      <style>{`
        .desktop-nav-list {
          display: flex;
          gap: 4px;
          list-style: none;
          margin: 0;
          padding: 0;
          align-items: center;
        }
        .mobile-nav-toggle {
          display: none;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.20);
          color: #64ffda;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          font-size: 18px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .mobile-nav-drawer {
          display: none;
        }
        @media (max-width: 768px) {
          .desktop-nav-list {
            display: none !important;
          }
          .mobile-nav-toggle {
            display: flex !important;
          }
          .mobile-nav-drawer {
            display: flex !important;
            flex-direction: column;
            gap: 8px;
            padding: 16px 20px;
            background: linear-gradient(180deg, rgba(28,38,69,0.96) 0%, rgba(19,13,28,0.98) 100%);
            backdrop-filter: blur(25px) saturate(180%);
            -webkit-backdrop-filter: blur(25px) saturate(180%);
            border-bottom: 1px solid rgba(255,255,255,0.15);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            animation: drawerSlide 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          }
        }
        @keyframes drawerSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        height: scrolled ? 64 : 88,
        padding: '0 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.4s ease',
        background: scrolled
          ? 'linear-gradient(180deg, rgba(20,18,34,0.85) 0%, rgba(18,22,42,0.75) 100%)'
          : 'linear-gradient(180deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.10) 50%, transparent 100%)',
        backdropFilter: scrolled ? 'blur(25px) saturate(180%)' : 'blur(8px)',
        WebkitBackdropFilter: scrolled ? 'blur(25px) saturate(180%)' : 'blur(8px)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.25), inset 0 -1px 0 rgba(255,255,255,0.10)' : 'none',
        pointerEvents: 'auto',
      }}>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); handleNav('home'); }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: scrolled ? 42 : 56, height: scrolled ? 42 : 56,
            transition: 'all 0.4s ease',
          }}
        >
          <img src="./assets/logo-minimalist.png" alt="Sa'eed Telvari" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </a>

        {/* Desktop nav list */}
        <ul className="desktop-nav-list">
          {items.map(it => (
            <NavItem
              key={it.id}
              label={it.label}
              active={active === it.id}
              onClick={() => handleNav(it.id)}
            />
          ))}
        </ul>

        {/* Mobile menu button */}
        <button
          className="mobile-nav-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <i className={mobileOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="mobile-nav-drawer" style={{ pointerEvents: 'auto' }}>
          {items.map(it => (
            <div
              key={it.id}
              onClick={() => handleNav(it.id)}
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: active === it.id ? 600 : 500,
                color: active === it.id ? '#64ffda' : 'rgba(255,255,255,0.9)',
                background: active === it.id ? 'rgba(100,255,218,0.15)' : 'transparent',
                border: active === it.id ? '1px solid rgba(100,255,218,0.30)' : '1px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>{it.label}</span>
              {active === it.id && <i className="fas fa-chevron-right" style={{ fontSize: 12, color: '#64ffda' }}></i>}
            </div>
          ))}
        </div>
      )}
    </header>
  );
};

const NavItem = ({ label, active, onClick }) => {
  const [hover, setHover] = useState(false);
  const showPill = hover || active;
  return (
    <li
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{
        position: 'relative',
        padding: '8px 16px',
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 15,
        fontWeight: active ? 600 : 400,
        color: active ? '#64ffda' : 'var(--fg-2, rgba(255,255,255,0.85))',
        cursor: 'pointer',
        borderRadius: 12,
        transition: 'all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        background: showPill
          ? 'linear-gradient(135deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.05) 100%)'
          : 'transparent',
        backdropFilter: showPill ? 'blur(10px)' : 'none',
        WebkitBackdropFilter: showPill ? 'blur(10px)' : 'none',
        border: active 
          ? '1px solid rgba(100,255,218,0.35)' 
          : showPill 
            ? '1px solid rgba(255,255,255,0.15)' 
            : '1px solid transparent',
        boxShadow: active 
          ? '0 4px 15px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.20), 0 0 10px rgba(100,255,218,0.15)'
          : showPill 
            ? '0 4px 15px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.30)' 
            : 'none',
      }}
    >
      <span style={{ transition: 'color 0.3s ease' }}>{label}</span>
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
    </li>
  );
};

Object.assign(window, { Header });
