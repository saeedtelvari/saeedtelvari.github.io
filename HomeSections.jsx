// HomeSections.jsx — About, Research, Publications, Projects, News, Contact

const { useState } = React;

/* =====================================================
   About + Recent Activity (merged)
   ===================================================== */
const NEWS = [
  { month: 'May', year: '2026', title: 'Presented at InterPore 2026', body: 'Presented research on Vertical Equilibrium models for CO\u2082 storage at the InterPore 2026 Annual Meeting.' },
  { month: 'Oct', year: '2025', title: 'Poster Presentation at EAGE GET 2025', body: 'Presented an extended abstract on "Three-Phase VE Simulation of CO\u2082\u2013Methane\u2013Brine Flow in Reservoirs" at the Sixth EAGE Global Energy Transition Conference.' },
  { month: 'Sep', year: '2025', title: 'Presented at InterPore UK 2025', body: 'Delivered a presentation on Vertical Equilibrium flow models at the InterPore UK 2025 Chapter Meeting.' },
  { month: 'Sep', year: '2024', title: 'Started PhD at Heriot-Watt University', body: 'Began doctoral research on Vertical Equilibrium Models for CO\u2082 storage.' },
  { month: 'Jun', year: '2024', title: 'M.Sc. Thesis Defense', body: 'Successfully defended thesis on "Machine Learning Methods in Upscaling Fine-scale Discrete Fracture Models" with distinction. GPA: 3.65/4.' },
  { month: 'May', year: '2023', title: 'Paper Published in Advances in Water Resources', body: 'First-author publication on 3D CNN prediction of two-phase flow properties accepted in a top-tier journal.' },
];

const AboutSection = () => (
  <SectionPanel bg="./assets/about_bg.png">
    <div style={{
      display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)', gap: 48, alignItems: 'flex-start',
    }}>
      {/* Left: About */}
      <div style={{ color: 'rgba(255,255,255,0.90)' }}>
        <Reveal>
          <SectionTitle style={{ marginBottom: 28, fontSize: 34 }}>About Me</SectionTitle>
        </Reveal>
        
        <Reveal delay="reveal-delay-1">
          <p className="lead" style={{ fontSize: 21, fontWeight: 500, lineHeight: 1.7, color: '#fff', marginTop: 0 }}>
            I'm <strong style={{ color: '#64ffda', fontWeight: 600 }}>Sa'eed Telvari</strong>, a PhD candidate in Petroleum Engineering at Heriot-Watt University. My research bridges the gap between computational efficiency and physical accuracy in subsurface flow simulation.
          </p>
        </Reveal>
        
        <Reveal delay="reveal-delay-2">
          <p style={{ fontSize: 16, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)' }}>
            I completed both my B.Sc. and M.Sc. in Petroleum Engineering with a focus on reservoir simulation and machine learning applications. Based on academic excellence, I was granted direct admission for graduate study, ranking within the top 2% in the national entrance exam.
          </p>
        </Reveal>
        
        <Reveal delay="reveal-delay-3">
          <p style={{ fontSize: 16, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)' }}>
            Currently, I'm developing Vertical Equilibrium (VE) models for simulating CO<sub>2</sub> storage in depleted gas reservoirs &mdash; a key simulation strategy for achieving net-zero emissions.
          </p>
        </Reveal>
        
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginTop: 28,
        }}>
          {[
            { icon: 'fas fa-graduation-cap', label: 'PhD @ Heriot-Watt' },
            { icon: 'fas fa-flask', label: 'CCUS Research' },
            { icon: 'fas fa-code', label: 'Python, MATLAB, Julia' },
            { icon: 'fas fa-robot', label: 'Agentic AI' },
          ].map((h, i) => (
            <Reveal key={i} delay={`reveal-delay-${i + 1}`}>
              <GlassCard padding={16} radius={16} style={{ display: 'flex', alignItems: 'center', gap: 12, height: '100%' }}>
                <i className={h.icon} style={{ fontSize: 22, color: '#64ffda' }}></i>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.90)', fontWeight: 500 }}>{h.label}</span>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Right: Recent Activity */}
      <div>
        <Reveal>
          <SectionTitle style={{ marginBottom: 28, fontSize: 34 }}>Recent Activity</SectionTitle>
        </Reveal>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {NEWS.map((n, i) => (
            <Reveal key={i} delay={`reveal-delay-${i + 1}`}>
              <GlassCard padding={18}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    flexShrink: 0, width: 62, textAlign: 'center',
                    padding: '10px 6px',
                    background: 'linear-gradient(135deg, rgba(100,255,218,0.15) 0%, rgba(100,255,218,0.05) 100%)',
                    border: '1px solid rgba(100,255,218,0.20)',
                    borderRadius: 10,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64ffda', textTransform: 'uppercase' }}>{n.month}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.60)', marginTop: 2 }}>{n.year}</div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: 15, color: '#fff', fontWeight: 600, margin: '0 0 4px', lineHeight: 1.35 }}>{n.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.70)', fontSize: 13, lineHeight: 1.55, margin: 0 }} dangerouslySetInnerHTML={{ __html: n.body }} />
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </SectionPanel>
);

/* =====================================================
   Publications + Research Interests (merged)
   ===================================================== */
const RESEARCH = [
  { icon: 'fas fa-cloud',        title: 'CO\u2082 Storage Modeling',     body: 'Efficient numerical models for CO\u2082 injection into depleted reservoirs.' },
  { icon: 'fas fa-cubes',        title: 'Reservoir Simulation',          body: 'Eclipse and MRST workflows for fractured, heterogeneous systems.' },
  { icon: 'fas fa-layer-group',  title: 'Upscaling Methods',             body: 'ML-enhanced upscaling of fine-scale discrete fracture models.' },
  { icon: 'fas fa-microscope',   title: 'Digital Rock Analysis',         body: '3D CNN prediction of petrophysical properties from micro-CT.' },
  { icon: 'fas fa-fire',         title: 'Depleted Oil/Gas Reservoirs',   body: 'Residual gas effects and multi-phase flow under CO\u2082 injection.' },
  { icon: 'fas fa-brain',        title: 'Machine Learning in PE',        body: 'Deep learning for reservoir characterization and property prediction.' },
];

const ResearchInterestsStrip = () => (
  <div style={{ marginBottom: 36 }}>
    <Reveal>
      <h3 style={{
        fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase',
        color: 'rgba(100,255,218,0.85)', margin: '0 0 18px',
      }}>Research Interests</h3>
    </Reveal>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {RESEARCH.map((r, i) => (
        <Reveal key={i} delay={`reveal-delay-${(i % 3) + 1}`}>
          <GlassCard padding={16} radius={14} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, height: '100%' }}>
            <i className={r.icon} style={{ fontSize: 18, color: '#64ffda', marginTop: 2, flexShrink: 0 }}></i>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, color: '#fff', fontWeight: 600, margin: '0 0 3px', lineHeight: 1.3 }}
                   dangerouslySetInnerHTML={{ __html: r.title }} />
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.45, margin: 0 }}>{r.body}</p>
            </div>
          </GlassCard>
        </Reveal>
      ))}
    </div>
  </div>
);

const PUBLICATIONS = [
  {
    badge: 'preprint', badgeLabel: 'Preprint',
    title: 'A Vertical Equilibrium Model for CO\u2082 Migration in Depleted Gas Fields',
    authors: <><strong style={{ color: '#64ffda' }}>Telvari, S.</strong>, Ramachandran, H., Wang, G., &amp; Doster, F. (2025)</>,
    venue: 'EarthArXiv preprint',
    abstract: 'A reduced-order VE framework that captures the buoyant migration of injected CO\u2082 in depleted gas reservoirs against the cap rock, delivering full-field-scale forecasts orders of magnitude faster than 3D simulation.',
    link: 'https://doi.org/10.31223/X5P49D',
  },
  {
    badge: 'conference', badgeLabel: 'Poster / Extended Abstract',
    title: 'Three-Phase VE Simulation of CO\u2082\u2013Methane\u2013Brine Flow in Reservoirs',
    authors: <><strong style={{ color: '#64ffda' }}>Telvari, S.</strong>, Ramachandran, H., Wang, G., &amp; Doster, F. (2025)</>,
    venue: 'Sixth EAGE Global Energy Transition Conference & Exhibition (GET 2025) — Poster Presentation',
    abstract: 'An extended abstract presenting a Vertical Equilibrium (VE) model for simulating three-phase CO\u2082\u2013methane\u2013brine flow in depleted gas reservoirs, enabling efficient large-scale simulation of CO\u2082 storage with residual methane interactions.',
    link: 'https://doi.org/10.3997/2214-4609.202521145',
  },
  {
    badge: 'published', badgeLabel: 'Published',
    title: 'Accelerated Permeability Upscaling: A CNN Approach',
    authors: <>Sayyafzadeh, M., <strong style={{ color: '#64ffda' }}>Telvari, S.</strong>, Guerillot, D., &amp; Sharifi, M. (2024)</>,
    venue: 'SPE Journal, 31(04), 2242',
    abstract: 'A novel convolutional neural network approach for rapid permeability upscaling in heterogeneous reservoirs, achieving 100-400\u00d7 computational speedup compared to traditional flow-based methods.',
    link: 'https://onepetro.org/SJ/article-abstract/31/04/2242/795099/Accelerated-Permeability-Upscaling-A-Convolutional',
  },
  {
    badge: 'published', badgeLabel: 'Published',
    title: 'Prediction of two-phase flow properties for digital sandstones using 3D convolutional neural networks',
    authors: <><strong style={{ color: '#64ffda' }}>Telvari, S.</strong>, Sayyafzadeh, M., Siavashi, J., &amp; Sharifi, M. (2023)</>,
    venue: 'Advances in Water Resources, 176, 104442',
    abstract: 'Developed a 3D CNN architecture for predicting relative permeability and capillary pressure curves directly from micro-CT images, eliminating the need for expensive pore-network modeling.',
    link: 'https://doi.org/10.1016/j.advwatres.2023.104442',
  },
];

const PublicationsList = () => (
  <SectionPanel bg="./assets/research_bg_v2.png" style={{ marginTop: 24 }}>
    <Reveal>
      <SectionTitle>Research &amp; Publications</SectionTitle>
    </Reveal>
    <ResearchInterestsStrip />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {PUBLICATIONS.map((p, i) => (
        <Reveal key={i} delay={`reveal-delay-${(i % 2) + 1}`}>
          <GlassCard padding={28}>
            <Badge kind={p.badge}>{p.badgeLabel}</Badge>
            <h3 style={{ fontSize: 21, color: '#fff', fontWeight: 600, margin: '0 0 10px', lineHeight: 1.4 }}
                dangerouslySetInnerHTML={{ __html: p.title }} />
            <p style={{ color: 'rgba(255,255,255,0.85)', margin: '0 0 6px', fontSize: 15 }}>{p.authors}</p>
            <p style={{ color: 'rgba(255,255,255,0.60)', fontStyle: 'italic', margin: '0 0 14px', fontSize: 14 }}>{p.venue}</p>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}
               dangerouslySetInnerHTML={{ __html: p.abstract }} />
            {p.link && (
              <a href={p.link} target="_blank" rel="noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
                color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.30)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.30)',
              }}>
                <i className="fas fa-external-link-alt" style={{ fontSize: 11 }}></i> View Publication
              </a>
            )}
          </GlassCard>
        </Reveal>
      ))}
    </div>
  </SectionPanel>
);

/* =====================================================
   Contact
   ===================================================== */
const ContactSection = () => {
  const contacts = [
    { icon: "fas fa-envelope", label: "st4014@hw.ac.uk", url: "mailto:st4014@hw.ac.uk" },
    { icon: "fab fa-linkedin", label: "LinkedIn Profile", url: "https://www.linkedin.com/in/stelvari/" },
    { icon: "fab fa-github", label: "GitHub", url: "https://github.com/saeedtelvari" },
    { icon: "fas fa-graduation-cap", label: "Google Scholar", url: "https://scholar.google.co.uk/citations?user=_nGa8EQAAAAJ&hl=en&inst=16061989973938494330" },
  ];
  
  return (
    <SectionPanel bg="./assets/contact_bg_v2.png" style={{ marginTop: 24 }}>
      <Reveal>
        <SectionTitle>Get In Touch</SectionTitle>
      </Reveal>
      <div style={{ textAlign: 'center' }}>
        <Reveal delay="reveal-delay-1">
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', maxWidth: 620, margin: '0 auto 36px', lineHeight: 1.7 }}>
            I'm always interested in discussing research collaborations, academic opportunities, or questions about reservoir simulation and CCUS technologies.
          </p>
        </Reveal>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 18, marginBottom: 36 }}>
          {contacts.map((c, i) => (
            <Reveal key={i} delay={`reveal-delay-${i + 1}`}>
              <ContactCard icon={c.icon} label={c.label} url={c.url} />
            </Reveal>
          ))}
        </div>
        <Reveal delay="reveal-delay-3">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.60)', fontSize: 14 }}>
            <i className="fas fa-map-marker-alt" style={{ color: '#64ffda' }}></i>
            Institute of GeoEnergy Engineering, Heriot-Watt University, Edinburgh, UK
          </div>
        </Reveal>
      </div>
    </SectionPanel>
  );
};
const ContactCard = ({ icon, label, url }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <a 
      href={url}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'inline-block', height: '100%', textDecoration: 'none', cursor: 'pointer' }}
    >
      <GlassCard padding={18} radius={20} style={{ minWidth: 220, display: 'flex', alignItems: 'center', gap: 14, height: '100%' }}>
        <i className={icon} style={{ 
          fontSize: 22, 
          color: '#64ffda',
          transition: 'transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
          transform: hovered ? 'scale(1.22) rotate(8deg)' : 'scale(1)',
        }}></i>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.90)' }}>{label}</span>
      </GlassCard>
    </a>
  );
};

Object.assign(window, { AboutSection, PublicationsList, ContactSection });
