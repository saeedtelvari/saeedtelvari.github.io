// App.jsx — top-level wiring

const { useState, useEffect } = React;

const App = () => {
  const [screen, setScreen] = useState('home');
  const [activeSection, setActiveSection] = useState('home');

  const onNavigate = (id) => {
    if (id === 'cv') { 
      setScreen('cv'); 
      setActiveSection('cv');
      window.scrollTo(0, 0); 
      return; 
    }
    if (id === 'simulator') { 
      setScreen('simulator'); 
      setActiveSection('simulator');
      window.scrollTo(0, 0); 
      return; 
    }
    
    setScreen('home');
    if (id === 'home') {
      setActiveSection('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // smooth-scroll to anchor on home
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

  // Expose onNavigate globally for child buttons
  useEffect(() => {
    window.__onNavigate = onNavigate;
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
      background: 'linear-gradient(135deg, #211d34 0%, #1c2645 50%, #1d416e 100%)',
      color: '#fff',
      fontFamily: "'Montserrat', sans-serif",
    }}
    data-screen-label={screen === 'cv' ? '02 CV' : screen === 'simulator' ? '03 VE Simulator' : '01 Home'}>
      <Header active={currentNav} onNavigate={onNavigate} />

      {screen === 'home' ? (
        <main>
          <SubsurfaceHero />
          <div id="about" />
          <AboutSection />
          <div id="research" />
          <div id="publications" />
          <PublicationsList />
          <div id="contact" />
          <ContactSection />
          <Footer onNavigate={onNavigate} />
        </main>
      ) : screen === 'simulator' ? (
        <main>
          <SimulatorPage />
          <Footer onNavigate={onNavigate} />
        </main>
      ) : (
        <main>
          <CVPage />
          <Footer onNavigate={onNavigate} />
        </main>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
