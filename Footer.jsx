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
        padding: '64px 36px 48px',
        backgroundColor: '#2e0d1d',
        color: 'rgba(255,255,255,0.75)',
        fontFamily: "'Montserrat', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* High-Resolution Earth Outer Core Texture */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url('./assets/strata_core.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          opacity: 0.85,
          filter: 'saturate(120%) contrast(110%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Earth Molten Core Geological Background Accents */}
      <GeologicalStrataBackground theme="core" />

      {/* Top Seam Gradient Blending into Mantle (#2e0d1d) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 120,
        background: 'linear-gradient(to bottom, #2e0d1d 0%, transparent 100%)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: '#fbbf24',
              boxShadow: '0 0 10px #fbbf24, 0 0 20px #f59e0b',
              display: 'inline-block',
            }} />
            <span style={{
              fontSize: 11,
              fontFamily: 'ui-monospace, Menlo, Monaco, monospace',
              letterSpacing: '0.12em',
              color: '#fbbf24',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}>
              Depth: &gt;2,900 km · Earth's Outer Core &amp; Geodynamo
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(255,255,255,0.90)', fontWeight: 500 }}>
            &copy; 2024–2026 Sa&rsquo;eed Telvari. All rights reserved.
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
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
