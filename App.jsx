// App.jsx — entries for the three pages (home, CV, simulator) and their navigation.

const { useState, useEffect } = React;

// ---- navigation helpers (pure; tests/site-nav.test.js evaluates this block)
const SITE_NAV_ITEMS = [
  { id: 'research', label: 'Research', href: './index.html#research' },
  { id: 'projects', label: 'Projects', href: './index.html#projects' },
  { id: 'publications', label: 'Publications', href: './index.html#publications' },
  { id: 'simulator', label: 'Simulator', href: './simulator.html' },
  { id: 'cv', label: 'CV', href: './cv.html' },
  { id: 'contact', label: 'Contact', href: './index.html#contact' },
];
const SITE_SECTION_IDS = ['research', 'projects', 'publications', 'contact'];

// The section whose top has passed the reading line (viewport coordinates); the hero is 'home'.
const siteActiveSection = (rects, line) => {
  let active = 'home';
  for (const rect of rects) if (rect.top <= line) active = rect.id;
  return active;
};

// Old anchors from before the redesign keep working.
const siteLegacyTarget = hash => ({
  '#about': 'research', '#research': 'research', '#projects': 'projects', '#publications': 'publications',
  '#contact': 'contact', '#cv': 'cv', '#simulator': 'simulator',
})[hash] || 'home';
// ---- end navigation helpers

const siteHref = id => (SITE_NAV_ITEMS.find(item => item.id === id) || { href: './index.html' }).href;
const siteReducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

const siteScrollTo = id => {
  const behavior = siteReducedMotion() ? 'auto' : 'smooth';
  if (id === 'home') { window.scrollTo({ top: 0, behavior }); return; }
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior, block: 'start' });
};

// Links are real; only plain clicks on targets within the current page are handled here.
const siteNavigate = (page, id, event) => {
  if (event && (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
  const samePage = id === page || (page === 'home' && SITE_SECTION_IDS.includes(id));
  if (!samePage) {
    if (!event) window.location.href = siteHref(id);
    return;
  }
  if (event) event.preventDefault();
  if (page === 'home' && id !== 'home') {
    siteScrollTo(id);
    window.history.pushState({ id }, '', `${window.location.pathname}#${id}`);
  } else {
    siteScrollTo('home');
    if (window.location.hash) window.history.pushState({ id }, '', window.location.pathname);
  }
};

// The pre-React shell in each HTML page fades out once React has rendered.
const dismissLoader = () => {
  if (window.__appReady) window.__appReady();
  const loader = document.getElementById('app-loader');
  if (!loader) return () => {};
  loader.classList.add('loader-finished');
  const timer = setTimeout(() => loader.remove(), 500);
  return () => clearTimeout(timer);
};

const SkipLink = () => <a className="skip-link" href="#main-content">Skip to content</a>;

const SiteHome = () => {
  const [active, setActive] = useState('home');
  const navigate = (id, event) => siteNavigate('home', id, event);

  useEffect(() => dismissLoader(), []);

  // Old and new anchors: pages redirect, sections scroll into view after the first layout.
  useEffect(() => {
    const apply = () => {
      const target = siteLegacyTarget(window.location.hash);
      if (target === 'cv' || target === 'simulator') { window.location.replace(siteHref(target)); return; }
      if (target !== 'home') requestAnimationFrame(() => siteScrollTo(target));
    };
    apply();
    window.addEventListener('hashchange', apply);
    window.addEventListener('popstate', apply);
    return () => {
      window.removeEventListener('hashchange', apply);
      window.removeEventListener('popstate', apply);
    };
  }, []);

  // One scroll spy for the header: the section under a line 45 % down the viewport.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const rects = SITE_SECTION_IDS.map(id => {
        const element = document.getElementById(id);
        if (!element) return null;
        const box = element.getBoundingClientRect();
        return { id, top: box.top, bottom: box.bottom };
      }).filter(Boolean);
      setActive(siteActiveSection(rects, window.innerHeight * 0.45));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <React.Fragment>
      <SkipLink />
      <Header active={active} onNavigate={navigate} />
      {/* The story is first on the page. The sections and the footer follow it on the same sky ground. */}
      <StoryStage onNavigate={navigate} />
      <main id="main-content" tabIndex={-1}>
        <ResearchSection />
        <ProjectsSection />
        <PublicationsSection />
        <ContactSection />
      </main>
      <Footer onNavigate={navigate} />
    </React.Fragment>
  );
};

const CVStandalone = () => {
  const navigate = (id, event) => siteNavigate('cv', id, event);
  useEffect(() => dismissLoader(), []);
  return (
    <React.Fragment>
      <SkipLink />
      <Header active="cv" onNavigate={navigate} />
      <main id="main-content" tabIndex={-1}><CVPage onNavigate={navigate} /></main>
      <Footer onNavigate={navigate} />
    </React.Fragment>
  );
};

// Standalone simulator entry — rendered when the page is simulator.html.
const SimulatorStandalone = () => {
  useEffect(() => dismissLoader(), []);
  return (
    <div className="ve-standalone" data-screen-label="03 VE Simulator">
      <SkipLink />
      <Header active="simulator" onNavigate={(id, event) => siteNavigate('simulator', id, event)} variant="workbench" />
      <main id="main-content"><SimulatorPage /></main>
    </div>
  );
};

const rootEl = document.getElementById('root');
const sitePage = rootEl && typeof rootEl.getAttribute === 'function' ? rootEl.getAttribute('data-page') : null;
const root = ReactDOM.createRoot(rootEl);
root.render(sitePage === 'simulator' ? <SimulatorStandalone /> : sitePage === 'cv' ? <CVStandalone /> : <SiteHome />);
