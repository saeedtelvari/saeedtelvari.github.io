// Header.jsx — fixed navigation shared by the homepage, the CV and the simulator.
// The site variant is clear over the pinned story (ink text on the sky). It is a solid bar in the
// ground colour with an ink hairline after the story, and on the CV page.
// The workbench variant is the simulator's solid 56 px bar. Do not change how it looks.

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
  const [overStory, setOverStory] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const mobileDrawerRef = useRef(null);

  // The pinned stage fills the screen while the story is on. The bar is clear then.
  // The bar turns solid when the stage starts to leave, so the art does not slide under the nav text.
  // Without a stage (the CV, or the static frames for reduced motion) the bar is always solid.
  useEffect(() => {
    if (variant !== 'site') return undefined;
    const onScroll = () => {
      const story = document.getElementById('story');
      const stage = story && story.querySelector('.story-stage');
      setOverStory(!!stage && story.getBoundingClientRect().bottom > stage.offsetHeight - 1);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [variant]);

  // The open drawer is modal: the page behind is inert, Tab cycles inside, Escape closes.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const mainContent = document.getElementById('main-content');
    const story = document.getElementById('story');
    const drawer = mobileDrawerRef.current;
    setHeaderBackgroundInert(mainContent, true);
    setHeaderBackgroundInert(story, true);
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
      setHeaderBackgroundInert(story, false);
      if (menuButtonRef.current) menuButtonRef.current.focus();
    };
  }, [mobileOpen]);

  const handleItemClick = (id, event) => {
    setMobileOpen(false);
    if (onNavigate) onNavigate(id, event);
  };

  const classes = ['app-header', `app-header--${variant}`, overStory ? 'is-over-story' : ''].filter(Boolean).join(' ');
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
