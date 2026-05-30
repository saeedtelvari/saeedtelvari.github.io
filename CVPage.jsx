// CVPage.jsx — single long glass page mirroring cv.html

const CVPage = () => (
  <div style={{
    minHeight: '100vh',
    backgroundImage: "url('./assets/headerbg3.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    padding: '120px 24px 64px',
  }}>
    {/* Overlay */}
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, rgba(10,10,20,0.85) 0%, rgba(15,25,45,0.80) 50%, rgba(10,20,40,0.85) 100%)',
      zIndex: 0,
    }}></div>

    <div style={{
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
        <h1 style={{
          margin: '0 0 12px',
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 700,
          fontSize: 56,
          lineHeight: 1.1,
          background: 'linear-gradient(135deg, #fff 0%, #a8edea 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>Sa&rsquo;eed Telvari</h1>
        <p style={{ fontSize: 19, color: 'rgba(255,255,255,0.70)', margin: '0 0 18px' }}>Ph.D. Candidate in Petroleum Engineering</p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}><i className="fas fa-map-marker-alt" style={{ color: '#4ecdc4', marginRight: 8 }}></i>Edinburgh, UK</span>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}><i className="fas fa-envelope" style={{ color: '#4ecdc4', marginRight: 8 }}></i>telvari.saeed@gmail.com</span>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}><i className="fab fa-linkedin" style={{ color: '#4ecdc4', marginRight: 8 }}></i>/in/stelvari</span>
        </div>
        <GlassButton variant="mint" icon="fas fa-download">Download PDF</GlassButton>
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
            details: ['Thesis: Developing Vertical Equilibrium Models for Simulating CO\u2082 Storage in Depleted Gas Reservoirs', 'Supervisor: Dr. Florian Doster'] },
          { title: 'M.Sc. in Petroleum Engineering — Reservoir', date: '2022 – 2024', inst: 'Amirkabir University of Technology, Tehran',
            details: ['GPA: 3.65/4 (17.23/20)', 'Thesis: Machine Learning Methods in Upscaling Fine-scale Discrete Fracture Models'] },
          { title: 'B.Sc. in Petroleum Engineering', date: '2018 – 2022', inst: 'Amirkabir University of Technology, Tehran',
            details: ['GPA: 17.43/20', 'Thesis: Prediction of two-phase flow properties for digital sandstones using 3D CNNs'] },
        ]}/>
      </CVSection>

      <Divider />

      {/* Skills */}
      <CVSection icon="fas fa-tools" title="Skills">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <SkillCategory icon="fas fa-code" title="Programming" tags={['Python', 'MATLAB', 'Julia', 'Rust', 'LaTeX']} detail="Libraries: TensorFlow, PyTorch, Scikit-learn, OpenCV, OpenPNM" />
          <SkillCategory icon="fas fa-industry" title="Industry Software" tags={['Eclipse', 'MRST', 'Petrel RE', 'Saphir', 'PVTSim']} />
          <SkillCategory icon="fas fa-cube" title="CFD & Simulation" tags={['OpenFOAM', 'PerGeos', 'SALOME', 'MeshLab']} />
          <SkillCategory icon="fas fa-laptop-code" title="Tools & Platforms" tags={['Linux', 'Docker', 'Git', 'Jupyter', 'VS Code']} />
        </div>
      </CVSection>

      <Divider />

      {/* Awards */}
      <CVSection icon="fas fa-award" title="Honors & Awards">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {[
            { icon: 'fas fa-trophy', body: 'Ranked within top 2% in Iranian University Entrance Exam for Master\'s degrees' },
            { icon: 'fas fa-star', body: 'Direct admission for graduate study from Talented Student Office, Amirkabir University' },
            { icon: 'fas fa-medal', body: 'National undergraduate scholarship (full tuition waiver)' },
            { icon: 'fas fa-trophy', body: 'Ranked within top 4% among 140,000+ students in undergraduate entrance exam' },
            { icon: 'fas fa-certificate', body: 'Recognized as talented student in NODET entrance exam' },
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
