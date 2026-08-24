// Footer.jsx
const Footer = ({ onNavigate }) => {
  const links = [
    { id: 'home',         label: 'Home' },
    { id: 'about',        label: 'About' },
    { id: 'publications', label: 'Research' },
    { id: 'simulator',    label: 'VE Simulator' },
    { id: 'cv',           label: 'CV' },
  ];

  return (
    <footer 
      role="contentinfo"
      style={{
        position: 'relative', zIndex: 10,
        padding: '32px 36px',
        background: 'linear-gradient(180deg, rgba(15,20,38,0.95) 0%, rgba(10,12,24,0.98) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        color: 'rgba(255,255,255,0.70)',
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 18,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
            &copy; 2024–2026 Sa&rsquo;eed Telvari. All rights reserved.
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.50)' }}>
            Institute of GeoEnergy Engineering · Heriot-Watt University
          </p>
        </div>
        <nav role="navigation" aria-label="Footer navigation">
          <div style={{ display: 'flex', gap: 20, fontSize: 13, flexWrap: 'wrap' }}>
            {links.map(l => (
              <FooterLink 
                key={l.id} 
                label={l.label} 
                onClick={() => {
                  if (onNavigate) onNavigate(l.id);
                  else if (window.__onNavigate) window.__onNavigate(l.id);
                }} 
              />
            ))}
          </div>
        </nav>
      </div>
    </footer>
  );
};

const FooterLink = ({ label, onClick }) => {
  const [hover, setHover] = useState(false);
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        color: hover ? '#64ffda' : 'rgba(255,255,255,0.70)',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        fontWeight: hover ? 500 : 400,
        transform: hover ? 'translateY(-1px)' : 'none',
      }}
    >
      {label}
    </a>
  );
};

Object.assign(window, { Footer });
