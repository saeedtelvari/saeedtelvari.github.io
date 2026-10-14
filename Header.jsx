// Header.jsx — fixed navigation shared by the homepage, the CV and the simulator.
// The site variant is transparent over the hero sky and turns into an Earth surface once
// the page scrolls; the workbench variant is the simulator's solid 56 px bar.

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

const HEADER_PROFILES = [
  { icon: 'mail', label: 'Email', href: `mailto:${SITE_LINKS.email}` },
  { icon: 'scholar', label: 'Google Scholar', href: SITE_LINKS.scholar },
  { icon: 'orcid', label: 'ORCID', href: SITE_LINKS.orcid },
  { icon: 'github', label: 'GitHub', href: SITE_LINKS.github },
  { icon: 'linkedin', label: 'LinkedIn', href: SITE_LINKS.linkedin },
];

const Header = ({ active, onNavigate, variant = 'site' }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const mobileDrawerRef = useRef(null);

  // Over the hero the site header is transparent; it gains a surface once the page moves.
  useEffect(() => {
    if (variant !== 'site') return undefined;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [variant]);

  // The open drawer is modal: the page behind is inert, Tab cycles inside, Escape closes.
  useEffect(() => {
    if (!mobileOpen) return undefined;
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
  }, [mobileOpen]);

  const handleItemClick = (id, event) => {
    setMobileOpen(false);
    if (onNavigate) onNavigate(id, event);
  };

  const classes = ['app-header', `app-header--${variant}`, scrolled ? 'is-scrolled' : ''].filter(Boolean).join(' ');
  const navLink = it => (
    <a className="app-nav__link" href={it.href} aria-current={active === it.id ? 'page' : undefined}
      onClick={event => handleItemClick(it.id, event)}>{it.label}</a>
  );

  return (
    <header className={classes}>
      <div className="app-header__bar">
        <a className="app-header__logo" href="./index.html" onClick={event => handleItemClick('home', event)} aria-label="Sa’eed Telvari, home">
          <img src="./assets/logo-minimalist.webp" alt="" width="40" height="40" />
        </a>

        <nav className="app-header__nav" aria-label="Main">
          <ul className="app-nav">
            {SITE_NAV_ITEMS.map(it => <li key={it.id}>{navLink(it)}</li>)}
          </ul>
        </nav>

        <button type="button" ref={menuButtonRef} className="app-header__menu" onClick={() => setMobileOpen(true)}
          aria-expanded={mobileOpen} aria-controls="site-drawer" aria-label="Open navigation menu">
          <Icon name="menu" size={20} />
        </button>
      </div>

      {mobileOpen && <React.Fragment>
        <div className="app-drawer__backdrop" onClick={() => setMobileOpen(false)} aria-hidden="true" />
        <div ref={mobileDrawerRef} id="site-drawer" className="app-drawer" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="app-drawer__head">
            <span className="app-drawer__name">Sa’eed Telvari</span>
            <button type="button" ref={closeButtonRef} className="app-drawer__close" onClick={() => setMobileOpen(false)} aria-label="Close navigation menu">
              <Icon name="close" size={20} />
            </button>
          </div>
          <ul className="app-drawer__list">
            {SITE_NAV_ITEMS.map(it => <li key={it.id}>{navLink(it)}</li>)}
          </ul>
          <ul className="app-drawer__profiles" aria-label="Elsewhere">
            {HEADER_PROFILES.map(profile => (
              <li key={profile.label}>
                <a href={profile.href} {...(profile.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
                  <Icon name={profile.icon} size={16} />{profile.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </React.Fragment>}
    </header>
  );
};

Object.assign(window, { Header });
