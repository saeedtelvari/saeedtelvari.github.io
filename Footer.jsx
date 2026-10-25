// Footer.jsx — closing band: name, affiliation, the same links as the header, back to top.
// It is the base of the page: older rock in flat colour with light text (style C).
const Footer = ({ onNavigate }) => {
  const toTop = event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: siteReducedMotion() ? 'auto' : 'smooth' });
    const main = document.getElementById('main-content');
    if (main) main.focus({ preventScroll: true });
  };
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <p className="site-footer__name">© 2024–2026 Sa’eed Telvari</p>
          <p className="site-footer__affiliation">Institute of GeoEnergy Engineering, Heriot-Watt University, Edinburgh</p>
        </div>
        <nav aria-label="Footer">
          <ul className="site-footer__links">
            {SITE_NAV_ITEMS.map(it => (
              <li key={it.id}><FooterLink label={it.label} href={it.href} onClick={event => onNavigate && onNavigate(it.id, event)} /></li>
            ))}
          </ul>
        </nav>
        <a className="btn btn--quiet btn--small" href="#main-content" onClick={toTop}>
          <Icon name="arrow-up" size={16} />Back to top
        </a>
      </div>
    </footer>
  );
};

const FooterLink = ({ label, href, onClick }) => <a href={href} onClick={onClick}>{label}</a>;

Object.assign(window, { Footer });
