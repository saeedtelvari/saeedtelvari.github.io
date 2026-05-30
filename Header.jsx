// Header.jsx — fixed top navbar, transparent over hero, shrinks on scroll.

const { useEffect, useState } = React;

const Header = ({ active, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const items = [
    { id: 'home',         label: 'Home' },
    { id: 'about',        label: 'About' },
    { id: 'publications', label: 'Research' },
    { id: 'cv',           label: 'CV' },
  ];

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000,
      pointerEvents: 'none',
    }}>
      <div style={{
        height: scrolled ? 64 : 92,
        padding: '0 36px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.5s ease',
        background: scrolled
          ? 'linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.10) 100%)'
          : 'linear-gradient(180deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.10) 50%, transparent 100%)',
        backdropFilter: scrolled ? 'blur(25px) saturate(180%)' : 'blur(8px)',
        WebkitBackdropFilter: scrolled ? 'blur(25px) saturate(180%)' : 'blur(8px)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.15), inset 0 -1px 0 rgba(255,255,255,0.10)' : 'none',
        pointerEvents: 'auto',
      }}>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: scrolled ? 44 : 64, height: scrolled ? 44 : 64,
            transition: 'all 0.5s ease',
          }}
        >
          <img src="./assets/logo-minimalist.png" alt="Sa'eed Telvari" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </a>

        <ul style={{
          display: 'flex', gap: 4, listStyle: 'none', margin: 0, padding: 0,
          alignItems: 'center',
        }}>
          {items.map(it => (
            <NavItem
              key={it.id}
              label={it.label}
              active={active === it.id}
              onClick={() => onNavigate(it.id)}
            />
          ))}
        </ul>
      </div>
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
        color: active ? '#64ffda' : 'azure',
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
