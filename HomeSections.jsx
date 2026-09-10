// HomeSections.jsx — About, Research, Publications, Projects, News, Contact

const { useState } = React;

/* =====================================================
   Research & Background (About + Activity)
   ===================================================== */
const RECENT_ACTIVITIES = [
  {
    date: 'May 2026',
    venue: 'InterPore 2026',
    desc: 'Presented research on Vertical Equilibrium modelling for CO₂ storage at the InterPore Annual Meeting.',
  },
  {
    date: 'October 2025',
    venue: 'EAGE GET 2025',
    desc: 'Presented a poster on VE simulation of CO₂, methane and brine flow in reservoirs at the EAGE Global Energy Transition Conference.',
  },
  {
    date: 'September 2025',
    venue: 'InterPore UK Chapter Meeting',
    desc: 'Presented work on reduced-order Vertical Equilibrium flow modelling.',
  },
  {
    date: 'September 2024',
    venue: 'Started doctoral research',
    desc: 'Began my PhD at Heriot-Watt University’s Institute of GeoEnergy Engineering.',
  },
  {
    date: 'August 2024',
    venue: 'M.Sc. Thesis Defended',
    desc: 'Defended thesis on machine learning methods in upscaling fine-scale discrete fracture models with distinction.',
  },
  {
    date: 'May 2023',
    venue: 'Advances in Water Resources',
    desc: 'First-author paper published on 3D CNN prediction of two-phase relative permeability and capillary curves directly from micro-CT sandstone scans.',
  },
];

const RecentActivity = () => {
  const [expanded, setExpanded] = useState(false);
  const initialCount = 4;
  const items = expanded ? RECENT_ACTIVITIES : RECENT_ACTIVITIES.slice(0, initialCount);

  return (
    <div className="recent-activity-panel">
      <h3 className="activity-panel-title">Recent activity</h3>

      <div className="activity-track">
        <div className="activity-conduit" />
        {items.map((item, i) => (
          <div key={i} className="activity-entry">
            <div className="activity-node-dot" />
            <div className="activity-entry-content">
              <div className="activity-meta-line">
                <span className="activity-date">{item.date}</span>
                <span className="activity-bullet">&middot;</span>
                <span className="activity-venue">{item.venue}</span>
              </div>
              <p className="activity-desc">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {RECENT_ACTIVITIES.length > initialCount && (
        <button
          type="button"
          className="activity-toggle-btn pressable"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`} style={{ fontSize: 11 }}></i>
          <span>{expanded ? 'Show recent activity' : 'View earlier activity'}</span>
        </button>
      )}
    </div>
  );
};

const AboutSection = ({ onNavigate }) => {
  const handleNav = (id, e) => {
    if (e) e.preventDefault();
    if (onNavigate) {
      onNavigate(id);
    } else if (window.__onNavigate) {
      window.__onNavigate(id);
    } else if (id === 'simulator') {
      window.location.href = './simulator.html';
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <SectionPanel strataTheme="sedimentary">
      <div className="dossier-masthead">
        <Reveal>
          <div className="strata-marker-eyebrow">
            <span className="strata-marker-dot"></span>
            STRATA // SEDIMENTARY BASIN &middot; DEPTH: 2.4 KM
          </div>
          <h2 className="dossier-headline">Research &amp; background</h2>
          <p className="dossier-subtitle">
            Reservoir simulation, geological CO&#8322; storage and scientific machine learning.
          </p>
        </Reveal>
      </div>

      {/* Top Introduction & Persona Hero Card */}
      <Reveal>
        <div className="about-intro-card">
          <div className="about-persona-row">
            <h3 className="about-name">Sa’eed Telvari</h3>
            <div className="about-affiliation">
              <span className="affiliation-primary">PhD Researcher &middot; Heriot-Watt University</span>
              <span className="affiliation-secondary">Institute of GeoEnergy Engineering, Edinburgh</span>
            </div>
          </div>

          <div className="about-lead-copy">
            <p>
              I’m a PhD researcher in petroleum engineering, working on computational models for CO&#8322; storage in depleted gas reservoirs. My research focuses on Vertical Equilibrium (VE) methods, which simplify the vertical description of fluid flow to reduce the computational cost of reservoir simulation.
            </p>
            <p>
              I’m interested in understanding which physical processes a model needs to represent, where simplifying assumptions are appropriate, and when more detailed simulation is necessary.
            </p>
          </div>

          {/* Action Utility Bar: Interactive simulator as the most visible project link */}
          <div className="about-actions-strip">
            <a
              href="./simulator.html"
              onClick={(e) => handleNav('simulator', e)}
              className="btn-sim-prominent pressable"
              title="Launch interactive Vertical Equilibrium simulator"
            >
              <span className="btn-sim-pulse-dot"></span>
              <i className="fas fa-play" style={{ fontSize: 10 }}></i>
              <span>Try the VE simulator</span>
            </a>

            <a
              href="#publications"
              onClick={(e) => handleNav('publications', e)}
              className="btn-text-action pressable"
            >
              <i className="fas fa-search" style={{ fontSize: 11, color: '#64ffda' }}></i>
              <span>Explore my research</span>
            </a>

            <a
              href="#publications"
              onClick={(e) => handleNav('publications', e)}
              className="btn-text-action pressable"
            >
              <i className="fas fa-book-open" style={{ fontSize: 11, color: '#64ffda' }}></i>
              <span>View publications</span>
            </a>
          </div>
        </div>
      </Reveal>

      {/* Two-Column Grid: Current Research & Academic Background (Left) + Recent Activity (Right) */}
      <div className="about-grid-2col">
        {/* Left / Main Column */}
        <div className="about-main-column">
          <Reveal delay="reveal-delay-1">
            <div className="about-block">
              <h4 className="about-block-title">Current research</h4>
              <p className="about-body-text">
                Depleted gas reservoirs still contain natural gas and water. This makes modelling injected CO&#8322; more involved than treating the reservoir as an empty storage space.
              </p>
              <p className="about-body-text">
                I develop VE models to describe the movement of CO&#8322; in these settings and compare them with three-dimensional compositional simulations. The aim is to understand how well reduced-order models capture gas migration, where their assumptions break down, and how they can support studies that require many simulation runs.
              </p>
            </div>
          </Reveal>

          <Reveal delay="reveal-delay-2">
            <div className="about-block">
              <h4 className="about-block-title">Academic background</h4>
              <p className="about-body-text">
                I completed my B.Sc. and M.Sc. in Petroleum Engineering at Amirkabir University of Technology. My master’s research focused on machine-learning-assisted fracture permeability upscaling, including the use of three-dimensional convolutional neural networks.
              </p>
              <p className="about-body-text">
                That work forms part of my broader interest in combining physics-based simulation with data-driven methods for subsurface modelling.
              </p>
            </div>
          </Reveal>

          {/* Methods & tools: Compact area below biography */}
          <Reveal delay="reveal-delay-3">
            <div className="about-methods-compact">
              <h4 className="about-block-title" style={{ marginBottom: 12 }}>Methods &amp; tools</h4>
              <div className="methods-entry">
                <span className="methods-category">Modelling:</span>
                <span className="methods-content">
                  Vertical Equilibrium <span className="method-dot">&middot;</span> Multiphase flow <span className="method-dot">&middot;</span> Compositional simulation <span className="method-dot">&middot;</span> Permeability upscaling <span className="method-dot">&middot;</span> Scientific machine learning
                </span>
              </div>
              <div className="methods-entry" style={{ marginTop: 10 }}>
                <span className="methods-category">Programming &amp; simulation:</span>
                <span className="methods-content">
                  MATLAB <span className="method-dot">&middot;</span> Python <span className="method-dot">&middot;</span> Julia <span className="method-dot">&middot;</span> MRST <span className="method-dot">&middot;</span> JutulDarcy
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right / Alongside Column: Recent Activity */}
        <div>
          <Reveal delay="reveal-delay-1">
            <RecentActivity />
          </Reveal>
        </div>
      </div>
    </SectionPanel>
  );
};

/* =====================================================
   Publications — Interactive Publication Terminal (Crystalline Strata)
   ===================================================== */
const PUBLICATIONS = [
  {
    id: 'pub-ve-co2',
    category: 'co2',
    badge: 'preprint',
    badgeLabel: 'Preprint · EarthArXiv',
    badgeClass: 'pub-badge-preprint',
    title: 'A Vertical Equilibrium Model for CO\u2082 Migration in Depleted Gas Fields',
    authors: <React.Fragment><strong style={{ color: '#64ffda' }}>Telvari, S.</strong>, Ramachandran, H., Wang, G., &amp; Doster, F. (2026)</React.Fragment>,
    venue: 'EarthArXiv preprint · 2026',
    keyContribution: '2D Vertical Equilibrium reduced-order modeling predicts buoyant plume migration across depleted fields ~1,000× faster than full 3D simulation with bounded caprock error.',
    abstract: 'A reduced-order VE framework that captures the buoyant migration of injected CO\u2082 in depleted gas reservoirs against the cap rock, delivering full-field-scale forecasts orders of magnitude faster than 3D simulation.',
    link: 'https://doi.org/10.31223/X5P49D',
    doi: '10.31223/X5P49D',
    bibtex: `@article{telvari2026vertical,
  title={A Vertical Equilibrium Model for CO2 Migration in Depleted Gas Fields},
  author={Telvari, Sa'eed and Ramachandran, Harish and Wang, Gang and Doster, Florian},
  journal={EarthArXiv},
  year={2026},
  doi={10.31223/X5P49D}
}`,
  },
  {
    id: 'pub-spe-2026',
    category: 'upscaling',
    badge: 'published',
    badgeLabel: 'Peer-Reviewed · SPE Journal',
    badgeClass: 'pub-badge-journal',
    title: 'Accelerated Permeability Upscaling: A CNN Approach',
    authors: <React.Fragment>Sayyafzadeh, M., <strong style={{ color: '#64ffda' }}>Telvari, S.</strong>, Gu\u00e9rillot, D., &amp; Sharifi, M. (2026)</React.Fragment>,
    venue: 'SPE Journal, 31(04), 2242–2260 · 2026',
    keyContribution: 'Convolutional neural networks achieve 100–400× computational acceleration over fine-scale Darcy flow upscaling in heterogeneous formations.',
    abstract: 'A novel convolutional neural network approach for rapid permeability upscaling in heterogeneous reservoirs, achieving 100-400\u00d7 computational speedup compared to traditional flow-based methods.',
    link: 'https://onepetro.org/SJ/article-abstract/31/04/2242/795099/Accelerated-Permeability-Upscaling-A-Convolutional',
    doi: '10.2118/218018-PA',
    bibtex: `@article{sayyafzadeh2026accelerated,
  title={Accelerated Permeability Upscaling: A CNN Approach},
  author={Sayyafzadeh, Mohammad and Telvari, Sa'eed and Gu{\'e}rillot, Dominique and Sharifi, Mohammad},
  journal={SPE Journal},
  volume={31},
  number={04},
  pages={2242--2260},
  year={2026},
  publisher={Society of Petroleum Engineers}
}`,
  },
  {
    id: 'pub-eage-2025',
    category: 'co2',
    badge: 'conference',
    badgeLabel: 'Conference · EAGE GET',
    badgeClass: 'pub-badge-conf',
    title: 'Three-Phase VE Simulation of CO\u2082\u2013Methane\u2013Brine Flow in Reservoirs',
    authors: <React.Fragment><strong style={{ color: '#64ffda' }}>Telvari, S.</strong>, Ramachandran, H., Wang, G., &amp; Doster, F. (2025)</React.Fragment>,
    venue: 'Sixth EAGE Global Energy Transition Conference & Exhibition (GET 2025) — Poster Presentation',
    keyContribution: 'Formulates three-phase CO\u2082–CH\u2084–brine vertical equilibria to capture residual cushion-gas mixing during carbon sequestration in partially depleted gas reservoirs.',
    abstract: 'An extended abstract presenting a Vertical Equilibrium (VE) model for simulating three-phase CO\u2082\u2013methane\u2013brine flow in depleted gas reservoirs, enabling efficient large-scale simulation of CO\u2082 storage with residual methane interactions.',
    link: 'https://doi.org/10.3997/2214-4609.202521145',
    doi: '10.3997/2214-4609.202521145',
    bibtex: `@inproceedings{telvari2025three,
  title={Three-Phase VE Simulation of CO2--Methane--Brine Flow in Reservoirs},
  author={Telvari, Sa'eed and Ramachandran, Harish and Wang, Gang and Doster, Florian},
  booktitle={Sixth EAGE Global Energy Transition Conference & Exhibition},
  year={2025},
  doi={10.3997/2214-4609.202521145}
}`,
  },
  {
    id: 'pub-awr-2023',
    category: 'rock',
    badge: 'published',
    badgeLabel: 'Peer-Reviewed · Adv. Water Res.',
    badgeClass: 'pub-badge-journal',
    title: 'Prediction of two-phase flow properties for digital sandstones using 3D convolutional neural networks',
    authors: <React.Fragment><strong style={{ color: '#64ffda' }}>Telvari, S.</strong>, Sayyafzadeh, M., Siavashi, J., &amp; Sharifi, M. (2023)</React.Fragment>,
    venue: 'Advances in Water Resources, 176, 104442 · 2023',
    keyContribution: 'Predicts relative permeability and capillary pressure curves directly from 3D micro-CT imagery without costly pore-network or lattice-Boltzmann simulations.',
    abstract: 'Developed a 3D CNN architecture for predicting relative permeability and capillary pressure curves directly from micro-CT images, eliminating the need for expensive pore-network modeling.',
    link: 'https://doi.org/10.1016/j.advwatres.2023.104442',
    doi: '10.1016/j.advwatres.2023.104442',
    bibtex: `@article{telvari2023prediction,
  title={Prediction of two-phase flow properties for digital sandstones using 3D convolutional neural networks},
  author={Telvari, Sa'eed and Sayyafzadeh, Mohammad and Siavashi, Javad and Sharifi, Mohammad},
  journal={Advances in Water Resources},
  volume={176},
  pages={104442},
  year={2023},
  publisher={Elsevier},
  doi={10.1016/j.advwatres.2023.104442}
}`,
  },
];

const DOMAIN_FILTERS = [
  { id: 'all', label: 'All Research' },
  { id: 'co2', label: 'CO\u2082 & VE Modeling' },
  { id: 'rock', label: 'Digital Rock Physics' },
  { id: 'upscaling', label: 'Permeability Upscaling & ML' },
];

const PublicationsList = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const filteredPubs = activeFilter === 'all'
    ? PUBLICATIONS
    : PUBLICATIONS.filter(p => p.category === activeFilter);

  const visiblePubs = showAll ? filteredPubs : filteredPubs.slice(0, 2);

  const handleCopyBibtex = (p) => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(p.bibtex.trim()).then(() => {
        setCopiedId(p.id);
        setTimeout(() => setCopiedId(null), 1800);
      }).catch(() => {});
    }
  };

  return (
    <SectionPanel strataTheme="crystalline">
      <div className="pub-terminal-header">
        <Reveal>
          <div className="pub-strata-eyebrow">
            <span className="pub-strata-dot"></span>
            STRATA // CRYSTALLINE BASEMENT &middot; DEPTH: 5.2 KM &middot; T: 145&deg;C &middot; FRACTURED GRANITE
          </div>
          <h2 className="dossier-headline">Interactive Publication Terminal</h2>
          <p className="dossier-subtitle">
            Peer-reviewed journal articles, conference proceedings, and open preprints spanning reduced-order Vertical Equilibrium, 3D micro-CT characterization, and machine-learning upscaling.
          </p>
        </Reveal>
      </div>

      {/* Domain Pill Filter Bar */}
      <Reveal delay="reveal-delay-1">
        <div className="pub-filter-bar" role="tablist" aria-label="Publication topic filter">
          {DOMAIN_FILTERS.map(f => {
            const count = f.id === 'all' ? PUBLICATIONS.length : PUBLICATIONS.filter(p => p.category === f.id).length;
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                role="tab"
                aria-selected={isActive}
                className={`pub-filter-pill ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveFilter(f.id);
                  setShowAll(false);
                }}
              >
                <span>{f.label}</span>
                <span className="pub-filter-count">{count}</span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Publications Cards Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {visiblePubs.map((p, i) => (
          <Reveal key={p.id} delay={`reveal-delay-${(i % 2) + 1}`}>
            <div className="pub-card-elevated">
              <div className="pub-card-top">
                <span className={`pub-badge-pill ${p.badgeClass}`}>{p.badgeLabel}</span>
                <span style={{
                  fontSize: 11.5,
                  fontFamily: 'ui-monospace, monospace',
                  color: 'rgba(255,255,255,0.50)',
                }}>
                  DOI: {p.doi}
                </span>
              </div>

              <h3 className="pub-card-title">{p.title}</h3>
              <p className="pub-authors-line">{p.authors}</p>
              <p className="pub-venue-line">{p.venue}</p>

              {/* High-Contrast Key Contribution Callout */}
              <div className="pub-key-contribution">
                <div className="pub-key-contribution-label">
                  <i className="fas fa-lightbulb"></i> Key Contribution
                </div>
                <p className="pub-key-contribution-text">{p.keyContribution}</p>
              </div>

              <p className="pub-abstract-text">{p.abstract}</p>

              {/* Action Utility Bar: View DOI & Copy BibTeX */}
              <div className="pub-actions-bar">
                {p.link && (
                  <a href={p.link} target="_blank" rel="noreferrer" className="btn-doi-view">
                    <i className="fas fa-external-link-alt" style={{ fontSize: 11 }}></i>
                    View Publication / DOI
                  </a>
                )}

                <button
                  className="btn-cite-copy"
                  onClick={() => handleCopyBibtex(p)}
                  aria-label={`Copy BibTeX citation for ${p.title}`}
                >
                  <i className={copiedId === p.id ? "fas fa-check" : "far fa-copy"} style={{ color: copiedId === p.id ? '#64ffda' : 'inherit' }}></i>
                  <span>{copiedId === p.id ? "Citation Copied!" : "Copy BibTeX"}</span>

                  {copiedId === p.id && (
                    <span className="cite-tooltip-badge">
                      <i className="fas fa-check"></i> BibTeX copied to clipboard
                    </span>
                  )}
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Progressive Disclosure: View More Publications */}
      {filteredPubs.length > 2 && (
        <div className="pub-view-more-container">
          <button
            type="button"
            className="pub-view-more-btn pressable"
            onClick={() => setShowAll(prev => !prev)}
            aria-expanded={showAll}
          >
            <i className={`fas ${showAll ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ fontSize: 11 }}></i>
            <span>{showAll ? 'Show Fewer Publications' : `View More Publications (${filteredPubs.length - 2} remaining)`}</span>
          </button>
        </div>
      )}
    </SectionPanel>
  );
};

/* =====================================================
   Contact — Collaboration Terminal & Academic Office (Mantle Strata)
   ===================================================== */
const VERIFIED_PROFILES = [
  {
    icon: 'fas fa-graduation-cap',
    label: 'Google Scholar',
    meta: 'Citation Index & Academic Metrics',
    url: 'https://scholar.google.co.uk/citations?user=_nGa8EQAAAAJ&hl=en&inst=16061989973938494330',
  },
  {
    icon: 'fas fa-id-badge',
    label: 'ORCID Registry',
    meta: '0000-0002-4896-295X (Verified)',
    url: 'https://orcid.org/0000-0002-4896-295X',
  },
  {
    icon: 'fab fa-linkedin',
    label: 'LinkedIn Profile',
    meta: 'Professional Network & Research Updates',
    url: 'https://www.linkedin.com/in/stelvari/',
  },
  {
    icon: 'fab fa-github',
    label: 'GitHub Codebases',
    meta: 'Open-Source Solvers & Scientific Repos',
    url: 'https://github.com/saeedtelvari',
  },
];

const ContactSection = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [localTime, setLocalTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/London',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date());
        setLocalTime(timeStr);
      } catch (e) {
        setLocalTime('10:00');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const copyEmail = () => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText('st4014@hw.ac.uk').then(() => {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2200);
      }).catch(() => {});
    }
  };

  return (
    <SectionPanel strataTheme="mantle">
      <div className="collab-terminal-header">
        <Reveal>
          <div className="collab-strata-eyebrow">
            <span className="collab-strata-dot"></span>
            STRATA // UPPER MANTLE &amp; MOHO &middot; DEPTH: 15–35 KM &middot; DUCTILE PERIDOTITE
          </div>
          <h2 className="dossier-headline">Collaboration Terminal &amp; Academic Office</h2>
          <p className="dossier-subtitle">
            I am always open to discussions regarding computational reservoir simulation collaborations, industrial CCUS storage assessments, and scientific seminar invitations.
          </p>
        </Reveal>
      </div>

      <div className="collab-console-grid">
        {/* Left: Direct Inquiry & Office Telemetry */}
        <Reveal>
          <div className="collab-hero-tile">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(249, 115, 22, 0.15)',
                  border: '1px solid rgba(249, 115, 22, 0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#f97316', fontSize: 16,
                }}>
                  <i className="fas fa-paper-plane"></i>
                </div>
                <div>
                  <h3 style={{ fontSize: 17, color: '#fff', fontWeight: 700, margin: 0 }}>
                    Direct Academic Communication
                  </h3>
                  <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.60)', fontFamily: 'ui-monospace, monospace' }}>
                    PRIMARY DESK &middot; INSTITUTIONAL EMAIL
                  </span>
                </div>
              </div>

              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.80)', lineHeight: 1.6, margin: '0 0 20px' }}>
                For preprints, research inquiries, or code questions on Vertical Equilibrium models, feel free to reach out directly:
              </p>

              {/* 1-Click Email Copy Tile */}
              <div
                className="email-copy-action-box pressable"
                onClick={copyEmail}
                title="Click to copy email address"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copyEmail(); } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <i className="fas fa-envelope" style={{ fontSize: 20, color: '#64ffda' }}></i>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'ui-monospace, monospace' }}>
                      INSTITUTIONAL ADDRESS
                    </div>
                    <div style={{ fontSize: 16, color: '#fff', fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>
                      st4014@hw.ac.uk
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {copiedEmail ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: 12, fontWeight: 700, color: '#64ffda',
                      background: 'rgba(100, 255, 218, 0.15)',
                      padding: '4px 10px', borderRadius: 6,
                      border: '1px solid rgba(100, 255, 218, 0.30)',
                      fontFamily: 'ui-monospace, monospace',
                    }}>
                      <i className="fas fa-check"></i> COPIED!
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: 12, color: 'rgba(255,255,255,0.65)',
                      background: 'rgba(255,255,255,0.06)',
                      padding: '4px 10px', borderRadius: 6,
                      border: '1px solid rgba(255,255,255,0.10)',
                      fontFamily: 'ui-monospace, monospace',
                    }}>
                      <i className="far fa-copy"></i> COPY
                    </span>
                  )}
                  <a
                    href="mailto:st4014@hw.ac.uk"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: 32, height: 32, borderRadius: 6,
                      background: 'rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 12, textDecoration: 'none',
                    }}
                    title="Open mail app"
                  >
                    <i className="fas fa-external-link-alt"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Office Telemetry Badge */}
            <div className="office-telemetry-pill">
              <i className="fas fa-map-marker-alt" style={{ color: '#f97316' }}></i>
              <span>Institute of GeoEnergy Engineering &middot; Heriot-Watt University, Edinburgh, UK</span>
              <span className="office-time-clock">
                <i className="far fa-clock"></i> {localTime || '10:00'} UK Time
              </span>
            </div>
          </div>
        </Reveal>

        {/* Right: Verified Academic Profiles */}
        <Reveal delay="reveal-delay-1">
          <div className="verified-profiles-grid">
            {VERIFIED_PROFILES.map((p, idx) => (
              <a
                key={idx}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="verified-profile-card pressable"
              >
                <div className="verified-profile-icon">
                  <i className={p.icon}></i>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.35 }}>
                    {p.meta}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </SectionPanel>
  );
};

/* =====================================================
   StratigraphicDepthHUD — Floating Geological Column Navigator
   ===================================================== */
const HUD_SECTIONS = [
  { id: 'home',         label: 'Surface',  depth: '0.0 km', stratum: 'Wellhead & Horizon',      color: '#64ffda' },
  { id: 'about',        label: 'Dossier',  depth: '2.4 km', stratum: 'Sedimentary Basin',       color: '#38bdf8' },
  { id: 'publications', label: 'Research', depth: '5.2 km', stratum: 'Crystalline Basement',   color: '#a855f7' },
  { id: 'contact',      label: 'Office',   depth: '35 km',  stratum: 'Moho & Upper Mantle',     color: '#f97316' },
];

const StratigraphicDepthHUD = ({ onNavigate, activeSection }) => {
  const [hoveredTick, setHoveredTick] = useState(null);

  const sections = HUD_SECTIONS;
  const activeSectionIndex = Math.max(0, sections.findIndex(s => s.id === activeSection));

  const handleClick = (id) => {
    if (onNavigate) onNavigate(id);
    else if (window.__onNavigate) window.__onNavigate(id);
  };

  return (
    <aside className="stratigraphic-hud-container" aria-label="Section navigator">
      <div style={{
        padding: '14px 10px',
        borderRadius: 20,
        background: 'linear-gradient(180deg, rgba(19,13,28,0.92) 0%, rgba(15,20,38,0.95) 100%)',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.20)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: 'rgba(255,255,255,0.60)',
          textTransform: 'uppercase',
          fontFamily: 'ui-monospace, monospace',
          textAlign: 'center',
          lineHeight: 1.2,
        }}>
          STRATA
        </div>

        {/* Vertical Navigation Track */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          padding: '6px 0',
        }}>
          {/* Track Line */}
          <div style={{
            position: 'absolute',
            top: 6,
            bottom: 6,
            width: 2,
            background: 'linear-gradient(180deg, #64ffda 0%, #38bdf8 30%, #a855f7 65%, #f97316 100%)',
            opacity: 0.35,
            borderRadius: 1,
          }} />

          {sections.map((s, idx) => {
            const isActive = activeSectionIndex === idx;
            const isHover = hoveredTick === idx;

            return (
              <div
                key={s.id}
                style={{ position: 'relative', cursor: 'pointer', padding: '2px 0' }}
                onMouseEnter={() => setHoveredTick(idx)}
                onMouseLeave={() => setHoveredTick(null)}
                onClick={() => handleClick(s.id)}
              >
                {/* Tick node */}
                <div style={{
                  width: isActive ? 14 : 9,
                  height: isActive ? 14 : 9,
                  borderRadius: '50%',
                  backgroundColor: s.color,
                  boxShadow: isActive ? `0 0 14px ${s.color}, inset 0 0 4px #fff` : `0 0 4px ${s.color}`,
                  border: isActive ? '2px solid #fff' : '1.5px solid rgba(255,255,255,0.4)',
                  transition: 'all 0.25s cubic-bezier(0.23, 1, 0.32, 1)',
                  transform: isHover ? 'scale(1.35)' : 'scale(1)',
                }} />

                {/* Section Depth Tooltip */}
                {(isHover || isActive) && (
                  <div style={{
                    position: 'absolute',
                    right: 26,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(14,10,22,0.96)',
                    border: `1px solid ${s.color}`,
                    borderRadius: 10,
                    padding: '8px 12px',
                    whiteSpace: 'nowrap',
                    boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 12px ${s.color}33`,
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    pointerEvents: 'none',
                    zIndex: 1000,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: s.color, fontFamily: 'ui-monospace, monospace' }}>
                        {s.label}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#fff',
                        background: `${s.color}25`, border: `1px solid ${s.color}55`,
                        padding: '1px 6px', borderRadius: 4, fontFamily: 'ui-monospace, monospace',
                      }}>
                        {s.depth}
                      </span>
                    </div>
                    <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.65)', fontFamily: 'ui-monospace, monospace' }}>
                      {s.stratum}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

Object.assign(window, { AboutSection, PublicationsList, ContactSection, StratigraphicDepthHUD });
