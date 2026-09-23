// CVPage.jsx — single long glass page mirroring cv.html

const CVPage = ({ onNavigate }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="cv-page" style={{
      minHeight: '100vh',
      backgroundImage: "url('./assets/headerbg3.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      padding: '120px 24px 64px',
    }}>
      {/* Custom responsive style for CV */}
      <style>{`
        .cv-skills-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 680px) {
          .cv-skills-grid {
            grid-template-columns: 1fr !important;
          }
          .cv-card-container {
            padding: 24px 18px !important;
          }
          .cv-name-title {
            font-size: 38px !important;
          }
        }
        @media print {
          .app-header, footer, .cv-download-btn, .cv-background-overlay {
            display: none !important;
          }
          body, .cv-page {
            background: #fff !important;
          }
          .cv-page {
            padding: 0 !important;
          }
          .cv-card-container, .cv-card-container * {
            color: #111 !important;
            -webkit-text-fill-color: #111 !important;
            background: none !important;
            box-shadow: none !important;
          }
          .cv-card-container {
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Overlay */}
      <div className="cv-background-overlay" style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(135deg, rgba(10,10,20,0.85) 0%, rgba(15,25,45,0.80) 50%, rgba(10,20,40,0.85) 100%)',
        zIndex: 0,
      }}></div>

      <div className="cv-card-container" style={{
        position: 'relative', zIndex: 1,
        maxWidth: 980, margin: '0 auto',
        padding: 44,
        background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.08) 100%)',
        backdropFilter: 'blur(25px) saturate(180%)',
        WebkitBackdropFilter: 'blur(25px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderTop: '1px solid rgba(255,255,255,0.25)',
        borderLeft: '1px solid rgba(255,255,255,0.20)',
        borderRadius: 30,
        boxShadow: '0 8px 32px rgba(0,0,0,0.30), inset 0 2px 4px rgba(255,255,255,0.10)',
        color: '#fff',
      }}>

        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 className="cv-name-title" style={{
            margin: '0 0 12px',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(36px, 5vw, 56px)',
            lineHeight: 1.1,
            background: 'linear-gradient(135deg, #fff 0%, #a8edea 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Sa&rsquo;eed Telvari</h1>
          <p style={{ fontSize: 19, color: 'rgba(255,255,255,0.70)', margin: '0 0 18px' }}>Ph.D. Candidate in Petroleum Engineering</p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}><i className="fas fa-map-marker-alt" style={{ color: '#4ecdc4', marginRight: 8 }}></i>Edinburgh, UK</span>
            <a href="mailto:st4014@hw.ac.uk" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, textDecoration: 'none' }}><i className="fas fa-envelope" style={{ color: '#4ecdc4', marginRight: 8 }}></i>st4014@hw.ac.uk</a>
            <a href="https://www.linkedin.com/in/stelvari/" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, textDecoration: 'none' }}><i className="fab fa-linkedin" style={{ color: '#4ecdc4', marginRight: 8 }}></i>/in/stelvari</a>
          </div>
          <div className="cv-download-btn">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <GlassButton variant="mint" icon="fas fa-print" onClick={handlePrint}>Print / Save as PDF</GlassButton>
            </div>
          </div>
        </header>

        <Divider />

        {/* Research interests */}
        <CVSection icon="fas fa-flask" title="Research Interests">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['Reservoir Simulation', 'CO\u2082 Storage', 'CCUS Technologies', 'Vertical Equilibrium Models',
              'Machine Learning', 'Upscaling Methods', 'Fractured Reservoirs', 'Digital Rock Physics'].map(t => (
              <Tag key={t} variant="research">{t}</Tag>
            ))}
          </div>
        </CVSection>

        <Divider />

        {/* Education */}
        <CVSection icon="fas fa-graduation-cap" title="Education">
          <Timeline items={[
            { title: 'Ph.D. in Petroleum Engineering', date: '2024 – Present', inst: 'Heriot-Watt University, Edinburgh, UK',
              details: ['Thesis: Developing Vertical Equilibrium Models for Simulating CO\u2082 Storage in Depleted Gas Reservoirs'] },
            { title: 'M.Sc. in Petroleum Engineering — Reservoir', date: '2022 – 2024', inst: 'Amirkabir University of Technology, Tehran',
              details: ['GPA: 3.65/4 (17.23/20)', 'Thesis: Machine Learning Methods in Upscaling Fine-scale Discrete Fracture Models'] },
            { title: 'B.Sc. in Petroleum Engineering', date: '2018 – 2022', inst: 'Amirkabir University of Technology, Tehran',
              details: ['GPA: 17.43/20', 'Thesis: Prediction of two-phase flow properties for digital sandstones using 3D CNNs'] },
          ]}/>
        </CVSection>

        <Divider />

        <CVSection icon="fas fa-microscope" title="Research Experience & Selected Projects">
          <Timeline items={[
            { title: 'Doctoral Researcher — Vertical Equilibrium Modeling', date: '2024 – Present', inst: 'Institute of GeoEnergy Engineering, Heriot-Watt University',
              details: ['Developing reduced-order models for CO₂–methane–brine migration in depleted gas reservoirs, with applications to screening, uncertainty analysis, and field-scale forecasting.'] },
            { title: 'Machine-Learning Permeability Upscaling', date: '2022 – 2026', inst: 'Amirkabir University of Technology',
              details: ['Developed CNN-based workflows for estimating effective permeability from heterogeneous fine-scale reservoir models.'] },
            { title: 'Digital Sandstone Two-Phase Flow Prediction', date: '2021 – 2023', inst: 'Amirkabir University of Technology',
              details: ['Built 3D convolutional neural networks to predict relative-permeability and capillary-pressure behavior from digital-rock images.'] },
          ]}/>
        </CVSection>

        <Divider />

        <CVSection icon="fas fa-book-open" title="Selected Publications">
          <Timeline items={[
            { title: 'A Vertical Equilibrium Model for CO₂ Migration in Depleted Gas Fields', date: '2026', inst: 'EarthArXiv preprint · DOI 10.31223/X5P49D', details: ['Telvari, S.; Ramachandran, H.; Wang, G.; Doster, F.'] },
            { title: 'Accelerated Permeability Upscaling: A Convolutional Neural Network Approach', date: '2026', inst: 'SPE Journal 31(04), 2242–2260', details: ['Sayyafzadeh, M.; Telvari, S.; Guérillot, D.; Sharifi, M.'] },
            { title: 'Three-Phase VE Simulation of CO₂–Methane–Brine Flow in Reservoirs', date: '2025', inst: 'Sixth EAGE Global Energy Transition Conference & Exhibition', details: ['Telvari, S.; Ramachandran, H.; Wang, G.; Doster, F.'] },
            { title: 'Prediction of two-phase flow properties for digital sandstones using 3D convolutional neural networks', date: '2023', inst: 'Advances in Water Resources 176, 104442', details: ['Telvari, S.; Sayyafzadeh, M.; Siavashi, J.; Sharifi, M.'] },
          ]}/>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <a href="https://orcid.org/0000-0002-4896-295X" target="_blank" rel="noreferrer" style={{ color: '#64ffda' }}>ORCID profile</a>
            <a href="https://scholar.google.co.uk/citations?user=_nGa8EQAAAAJ&hl=en&inst=16061989973938494330" target="_blank" rel="noreferrer" style={{ color: '#64ffda' }}>Google Scholar</a>
          </div>
        </CVSection>

        <Divider />

        <CVSection icon="fas fa-chalkboard-teacher" title="Selected Presentations & Teaching">
          <Timeline items={[
            { title: 'Oral presentation & session co-chair', date: 'September 2026', inst: '9th InterPore UK Chapter Conference, Edinburgh', details: ['Presented “A Compositional Vertical Equilibrium Model for CO₂ Storage in Depleted Gas Reservoirs” and co-chaired the Multiphase Phenomena session.'] },
            { title: 'Oral presentation', date: 'May 2026', inst: 'InterPore2026, Nantes', details: ['Presented “Vertical-Equilibrium Modelling of CO₂ Migration in Depleted Reservoirs”.'] },
            { title: 'Lead instructor & co-organiser', date: 'March 2026', inst: 'MATLAB/MRST Workshop Series, Heriot-Watt University', details: ['Led a hands-on session building a flow simulator with MRST’s rapid prototyping framework.'] },
            { title: 'Poster presentation', date: 'October 2025', inst: '6th EAGE Global Energy Transition Conference, Rotterdam', details: ['Presented “Three-Phase VE Simulation of CO₂–Methane–Brine Flow in Reservoirs”.'] },
          ]}/>
        </CVSection>

        <Divider />

        {/* Skills */}
        <CVSection icon="fas fa-tools" title="Skills">
          <div className="cv-skills-grid">
            <SkillCategory icon="fas fa-code" title="Programming" tags={['Python', 'MATLAB', 'Julia']} />
            <SkillCategory icon="fas fa-industry" title="Reservoir Simulation" tags={['MRST', 'Eclipse', 'Petrel RE']} />
            <SkillCategory icon="fas fa-cube" title="Industry Training" tags={['CMG CO₂ Storage', 'SLB Intersect CCS']} />
            <SkillCategory icon="fas fa-laptop-code" title="Research Tools" tags={['Git', 'Jupyter', 'LaTeX', 'Linux']} />
          </div>
        </CVSection>

        <Divider />

        {/* Recognition */}
        <CVSection icon="fas fa-award" title="Selected Recognition">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              { icon: 'fas fa-graduation-cap', body: 'James Watt Scholarship recipient — full PhD funding, Heriot-Watt University (2024–present)' },
              { icon: 'fas fa-medal', body: 'Runner-up, SPE Aberdeen Section Student Bursary — £1,000 awarded (2026)' },
              { icon: 'fas fa-medal', body: 'Team runner-up, EAGE “The Energy–AI Nexus” Hackathon (2026)' },
              { icon: 'fas fa-graduation-cap', body: 'National undergraduate scholarship — full tuition waiver' },
            ].map((a, i) => (
              <li key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 0',
                color: 'rgba(255,255,255,0.90)', fontSize: 15,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                <i className={a.icon} style={{ color: '#ffc107', fontSize: 16, marginTop: 3 }}></i>
                {a.body}
              </li>
            ))}
          </ul>
        </CVSection>
      </div>
    </div>
  );
};

/* -----------------------------------------------------
   Helpers
   ----------------------------------------------------- */
const CVSection = ({ icon, title, children }) => (
  <section>
    <h2 style={{
      fontSize: 22, fontWeight: 700, color: '#fff',
      margin: '0 0 20px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <i className={icon} style={{ color: '#4ecdc4', fontSize: 20 }}></i>
      {title}
    </h2>
    {children}
  </section>
);

const Timeline = ({ items }) => (
  <div style={{ position: 'relative' }}>
    {items.map((it, i) => (
      <div key={i} style={{ position: 'relative', paddingLeft: 32, marginBottom: 22 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: i === items.length - 1 ? 0 : -22, width: 2, background: 'linear-gradient(180deg, #4ecdc4, rgba(78,205,196,0.20))' }}></div>
        <div style={{ position: 'absolute', left: -5, top: 14, width: 12, height: 12, borderRadius: '50%', background: '#4ecdc4', boxShadow: '0 0 10px rgba(78,205,196,0.5)' }}></div>
        <div style={{
          padding: 18,
          background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', margin: 0 }}>{it.title}</h3>
            <span style={{ background: 'rgba(78,205,196,0.20)', color: '#4ecdc4', padding: '4px 12px', borderRadius: 12, fontSize: 13, fontWeight: 500 }}>{it.date}</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.70)', fontSize: 14, margin: '0 0 10px' }}>
            <i className="fas fa-university" style={{ marginRight: 8, color: '#4ecdc4' }}></i>{it.inst}
          </p>
          {it.details.map((d, j) => (
            <p key={j} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13.5, margin: '4px 0 0' }} dangerouslySetInnerHTML={{ __html: d }} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const SkillCategory = ({ icon, title, tags, detail }) => (
  <div style={{
    padding: 18,
    background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 16,
  }}>
    <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: '#fff', margin: '0 0 12px' }}>
      <i className={icon} style={{ color: '#4ecdc4' }}></i>{title}
    </h4>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: detail ? 12 : 0 }}>
      {tags.map(t => <Tag key={t} variant="skill">{t}</Tag>)}
    </div>
    {detail && <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 12.5, margin: 0 }}><strong style={{ color: '#fff', fontWeight: 600 }}>{detail.split(':')[0]}:</strong>{detail.split(':')[1]}</p>}
  </div>
);

Object.assign(window, { CVPage });
