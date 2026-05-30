// Footer.jsx
const Footer = () => (
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
        <p style={{ margin: 0, fontSize: 13 }}>&copy; 2024–2025 Sa&rsquo;eed Telvari. All rights reserved.</p>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.50)' }}>Last updated: December 2024</p>
      </div>
      <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
        <a style={{ color: 'rgba(255,255,255,0.70)', textDecoration: 'none' }}>Home</a>
        <a style={{ color: 'rgba(255,255,255,0.70)', textDecoration: 'none' }}>About</a>
        <a style={{ color: 'rgba(255,255,255,0.70)', textDecoration: 'none' }}>Publications</a>
        <a style={{ color: 'rgba(255,255,255,0.70)', textDecoration: 'none' }}>CV</a>
      </div>
    </div>
  </footer>
);

Object.assign(window, { Footer });
