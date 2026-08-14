// Footer.jsx
const Footer = ({ onNavigate }) => {
  const [hoveredLink, setHoveredLink] = useState(null);

  const links = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'publications', label: 'Research' },
    { id: 'simulator', label: 'VE Simulator' },
    { id: 'cv', label: 'CV' },
  ];

  return (
    <footer style={{
      position: 'relative', zIndex: 10,
      padding: '28px 36px',
      background: 'linear-gradient(180deg, rgba(15,52,96,0.95) 0%, rgba(22,33,62,0.98) 100%)',
      borderTop: '1px solid rgba(255,255,255,0.10)',
      color: 'rgba(255,255,255,0.70)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 13 }}>&copy; 2024–2026 Sa&rsquo;eed Telvari. All rights reserved.</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.50)' }}>Institute of GeoEnergy Engineering &middot; Heriot-Watt University</p>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, flexWrap: 'wrap' }}>
          {links.map(l => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate(l.id);
                else if (window.__onNavigate) window.__onNavigate(l.id);
              }}
              onMouseEnter={() => setHoveredLink(l.id)}
              onMouseLeave={() => setHoveredLink(null)}
              style={{
                color: hoveredLink === l.id ? '#64ffda' : 'rgba(255,255,255,0.75)',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'color 0.25s ease',
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

Object.assign(window, { Footer });
