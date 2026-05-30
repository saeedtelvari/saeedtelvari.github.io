// App.jsx — top-level wiring

const { useState } = React;

const App = () => {
  const [screen, setScreen] = useState('home');
  const onNavigate = (id) => {
    if (id === 'cv') { setScreen('cv'); window.scrollTo(0, 0); return; }
    setScreen('home');
    // smooth-scroll to anchor on home
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo(0, 0);
    }, 50);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #211d34 0%, #1c2645 50%, #1d416e 100%)',
      color: '#fff',
      fontFamily: "'Montserrat', sans-serif",
    }}
    data-screen-label={screen === 'cv' ? '02 CV' : '01 Home'}>
      <Header active={screen} onNavigate={onNavigate} />

      {screen === 'home' ? (
        <main>
          <SubsurfaceHero />
          <div id="about" />
          <AboutSection />
          <div id="research" />
          <div id="publications" />
          <PublicationsList />
          <ContactSection />
          <Footer />
        </main>
      ) : (
        <main>
          <CVPage />
          <Footer />
        </main>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
