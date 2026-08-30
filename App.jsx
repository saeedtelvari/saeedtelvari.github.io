// App.jsx — top-level wiring

const { useState, useEffect } = React;

// Loader dismissal shared by the home entry (index.html) and the standalone
// simulator entry (simulator.html).
const dismissLoader = () => {
  if (window.__appReady) window.__appReady(); // push loader progress bar to 100%
  const loader = document.getElementById('app-loader');
  if (!loader) return () => {};
  const startTime = window.__pageLoadStart || Date.now();
  const elapsed = Date.now() - startTime;
  const minDuration = 150;
  const remaining = Math.max(0, minDuration - elapsed);

  const timer = setTimeout(() => {
    loader.classList.add('loader-finished');
    setTimeout(() => {
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 500);
  }, remaining);

  return () => clearTimeout(timer);
};

const App = () => {
  const [screen, setScreen] = useState('home');
  const [activeSection, setActiveSection] = useState('home');

  const applyLocation = () => {
    const id = (window.location.hash || '#home').slice(1);
    if (id === 'simulator') {
      window.location.replace('./simulator.html');
      return;
    }
    if (id === 'cv') {
      setScreen('cv');
      setActiveSection('cv');
      window.scrollTo(0, 0);
      return;
    }
    setScreen('home');
    if (id === 'home') {
      setActiveSection('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setTimeout(() => {
      const targetId = id === 'research' ? 'publications' : id;
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSection(targetId);
      } else {
        window.scrollTo(0, 0);
      }
    }, 50);
  };

  const onNavigate = (id) => {
    if (id === 'simulator') {
      window.location.href = './simulator.html';
      return;
    }
    const hash = id === 'home' ? '' : '#' + id;
    window.history.pushState({ screen: id }, '', './index.html' + hash);
    applyLocation();
  };

  // Expose onNavigate globally for child buttons
  useEffect(() => { window.__onNavigate = onNavigate; });

  // Dismiss 0ms pre-React loading screen once components mount and initial simulation renders
  useEffect(() => {
    return dismissLoader();
  }, []);

  useEffect(() => {
    applyLocation();
    window.addEventListener('hashchange', applyLocation);
    window.addEventListener('popstate', applyLocation);
    return () => {
      window.removeEventListener('hashchange', applyLocation);
      window.removeEventListener('popstate', applyLocation);
    };
  }, []);

  // Track active section on home screen using scroll listener
  useEffect(() => {
    if (screen !== 'home') {
      setActiveSection(screen);
      return;
    }

    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      const sections = ['contact', 'publications', 'about', 'home'];
      for (const s of sections) {
        const el = document.getElementById(s);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(s);
          return;
        }
      }
      setActiveSection('home');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [screen]);

  const currentNav = screen === 'home' ? activeSection : screen;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      color: '#fff',
      fontFamily: "'Montserrat', sans-serif",
    }}
    data-screen-label={screen === 'cv' ? '02 CV' : '01 Home'}>
      <Header active={currentNav} onNavigate={onNavigate} />

      {screen === 'home' ? (
        <main>
          <StratigraphicDepthHUD onNavigate={onNavigate} activeSection={activeSection} />
          <SubsurfaceHero onNavigate={onNavigate} />
          <div id="about" />
          <AboutSection />
          <div id="research" />
          <div id="publications" />
          <PublicationsList />
          <div id="contact" />
          <ContactSection />
          <Footer onNavigate={onNavigate} />
        </main>
      ) : (
        <main>
          <CVPage onNavigate={onNavigate} />
          <Footer onNavigate={onNavigate} />
        </main>
      )}
    </div>
  );
};

// Standalone simulator entry — rendered when the page is simulator.html.
// Fully independent from the home page: no hero, no sections, own URL.
const SimulatorStandalone = () => {
  useEffect(() => {
    return dismissLoader();
  }, []);

  const simNav = (id) => {
    if (id === 'simulator') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.location.href = './index.html' + (id === 'home' ? '' : '#' + id);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      color: '#fff',
      fontFamily: "'Montserrat', sans-serif",
    }} data-screen-label="03 VE Simulator">
      <Header active="simulator" onNavigate={simNav} />
      <main>
        <SimulatorPage />
        <Footer onNavigate={simNav} />
      </main>
    </div>
  );
};

const rootEl = document.getElementById('root');
const isSimulatorEntry = rootEl && typeof rootEl.getAttribute === 'function' && rootEl.getAttribute('data-page') === 'simulator';
const root = ReactDOM.createRoot(rootEl);
if (isSimulatorEntry) {
  root.render(<SimulatorStandalone />);
} else {
  root.render(<App />);
}
