// HomeSections.jsx — About, Research, Publications, Projects, News, Contact

const { useState } = React;

/* =====================================================
   Research & Background (About + Activity)
   ===================================================== */
const RECENT_ACTIVITIES = [
  {
    date: 'September 2026',
    month: '2026-09',
    venue: 'InterPore UK Chapter Conference',
    desc: 'Gave an oral presentation on compositional VE modelling for CO₂ storage and co-chaired a multiphase-flow session.',
  },
  {
    date: 'May 2026',
    month: '2026-05',
    venue: 'InterPore 2026',
    desc: 'Gave an oral presentation on VE modelling of CO₂ migration in depleted reservoirs.',
  },
  {
    date: 'March 2026',
    month: '2026-03',
    venue: 'MATLAB/MRST workshop series',
    desc: 'Co-organised the series and led a hands-on session building a flow simulator with MRST.',
  },
  {
    date: 'October 2025',
    month: '2025-10',
    venue: 'EAGE GET 2025',
    desc: 'Presented a poster on three-phase VE simulation of CO₂, methane and brine flow.',
  },
];

const RecentActivity = () => {
  const [expanded, setExpanded] = useState(false);
  const initialCount = 4;
  const items = expanded ? RECENT_ACTIVITIES : RECENT_ACTIVITIES.slice(0, initialCount);

  return (
    <div className="recent-activity-panel">
      <h3 className="activity-panel-title">Recent activity</h3>

      <ol className="activity-track" role="list">
        {items.map(item => (
          <li key={item.month} className="activity-entry">
            <div className="activity-entry-content">
              <time className="activity-date" dateTime={item.month}>{item.date}</time>
              <h4 className="activity-venue">{item.venue}</h4>
              <p className="activity-desc">{item.desc}</p>
            </div>
          </li>
        ))}
      </ol>

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
    <SectionPanel>
      <div className="dossier-masthead">
        <Reveal>
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
              <span className="affiliation-primary">PhD Researcher &middot; James Watt Scholarship recipient</span>
              <span className="affiliation-secondary">Institute of GeoEnergy Engineering, Edinburgh</span>
            </div>
          </div>

          <div className="about-lead-copy">
            <p>
              I’m a PhD researcher in petroleum engineering, developing computational models for <strong>CO&#8322; storage in depleted gas reservoirs</strong>. I focus on <strong>Vertical Equilibrium (VE) methods</strong>, which simplify the vertical description of fluid flow to reduce simulation cost.
            </p>
            <p>
              I’m interested in which physical processes a model needs to represent, where simplifications are appropriate, and when more detailed simulation is needed.
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
              <i className="fas fa-play" style={{ fontSize: 10 }}></i>
              <span>Try the VE simulator</span>
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
                Depleted gas reservoirs still contain <strong>natural gas and water</strong>, so modelling injected CO&#8322; is more complex than treating them as empty storage space.
              </p>
              <p className="about-body-text">
                I develop VE models of CO&#8322; movement and compare them with <strong>three-dimensional compositional simulations</strong>. I assess how well these reduced-order models capture gas migration, where their assumptions break down, and how they can support studies requiring many simulation runs.
              </p>
            </div>
          </Reveal>

          <Reveal delay="reveal-delay-2">
            <div className="about-block">
              <h4 className="about-block-title">Academic background</h4>
              <p className="about-body-text">
                I earned my B.Sc. and M.Sc. in Petroleum Engineering at <strong>Amirkabir University of Technology</strong>. My master’s research explored machine-learning-assisted <strong>fracture permeability upscaling</strong> using three-dimensional convolutional neural networks.
              </p>
              <p className="about-body-text">
                This work informs my broader interest in combining physics-based simulation with data-driven methods for subsurface modelling.
              </p>
            </div>
          </Reveal>

          {/* Methods & tools: Compact area below biography */}
          <Reveal delay="reveal-delay-3">
            <div className="about-methods-compact">
              <h4 className="about-block-title" style={{ marginBottom: 12 }}>Methods &amp; tools</h4>
              <div className="methods-entry">
                <span className="methods-category">Modelling</span>
                <span className="methods-content">
                  Vertical Equilibrium<span className="method-dot">&nbsp;&middot;</span> Multiphase flow<span className="method-dot">&nbsp;&middot;</span> Compositional simulation<span className="method-dot">&nbsp;&middot;</span> Permeability upscaling<span className="method-dot">&nbsp;&middot;</span> Scientific machine learning
                </span>
              </div>
              <div className="methods-entry" style={{ marginTop: 10 }}>
                <span className="methods-category">Programming &amp; simulation</span>
                <span className="methods-content">
                  MATLAB<span className="method-dot">&nbsp;&middot;</span> Python<span className="method-dot">&nbsp;&middot;</span> Julia<span className="method-dot">&nbsp;&middot;</span> MRST<span className="method-dot">&nbsp;&middot;</span> JutulDarcy
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
    keyContribution: 'A VE model reproduces large-scale CO\u2082 and methane migration while running up to two orders of magnitude faster than full 3D simulation in the reported cases.',
    abstract: 'This EarthArXiv preprint develops a reduced-order model of CO\u2082, methane and brine flow in depleted gas reservoirs and compares it with three-dimensional compositional simulations.',
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
    authors: <React.Fragment>Sayyafzadeh, M., <strong style={{ color: '#64ffda' }}>Telvari, S.</strong>, Guérillot, D., &amp; Sharifi, M. (2026)</React.Fragment>,
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
    <SectionPanel>
      <div className="pub-terminal-header">
        <Reveal>
          <h2 className="dossier-headline">Publications</h2>
          <p className="dossier-subtitle">
            Peer-reviewed articles, conference proceedings and open preprints on reduced-order Vertical Equilibrium, 3D micro-CT characterisation and machine-learning upscaling.
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
                <span className="pub-doi">
                  DOI: {p.doi}
                </span>
              </div>

              <h3 className="pub-card-title">{p.title}</h3>
              <p className="pub-authors-line">{p.authors}</p>
              <p className="pub-venue-line">{p.venue}</p>

              {/* High-Contrast Key Contribution Callout */}
              <div className="pub-key-contribution">
                <div className="pub-key-contribution-label">
                  Key contribution
                </div>
                <p className="pub-key-contribution-text">{p.keyContribution}</p>
              </div>

              <details className="pub-abstract">
                <summary>Read abstract</summary>
                <p className="pub-abstract-text">{p.abstract}</p>
              </details>

              {/* Action Utility Bar: View DOI & Copy BibTeX */}
              <div className="pub-actions-bar">
                {p.link && (
                  <a href={p.link} target="_blank" rel="noreferrer" className="btn-doi-view">
                    <i className="fas fa-external-link-alt" style={{ fontSize: 11 }}></i>
                    Read publication
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
            <span>{showAll ? 'Show fewer publications' : `View more publications (${filteredPubs.length - 2} remaining)`}</span>
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
    <SectionPanel>
      <div className="collab-terminal-header">
        <Reveal>
          <h2 className="dossier-headline">Contact &amp; collaboration</h2>
          <p className="dossier-subtitle">
            Open to collaborations in computational reservoir simulation and industrial CCUS storage assessment, and invitations to scientific seminars.
          </p>
        </Reveal>
      </div>

      <div className="collab-console-grid">
        {/* Left: Direct Inquiry & Office Telemetry */}
        <Reveal>
          <div className="collab-hero-tile">
            <div>
              <h3 className="contact-card-title">Get in touch</h3>
              <p className="contact-card-copy">
                For preprints, research enquiries or questions about Vertical Equilibrium code, reach me at my institutional email.
              </p>
              <div className="email-copy-action-box">
                <a className="contact-email" href="mailto:st4014@hw.ac.uk">st4014@hw.ac.uk</a>
                <button type="button" className="btn-cite-copy" onClick={copyEmail} aria-label="Copy email address">
                  <i className={copiedEmail ? 'fas fa-check' : 'far fa-copy'} aria-hidden="true" />
                  <span aria-live="polite">{copiedEmail ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Office Telemetry Badge */}
            <div className="office-telemetry-pill">
              <i className="fas fa-map-marker-alt" style={{ color: '#a8d1c8' }}></i>
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
                  <div style={{ fontSize: 13, color: '#c8d0d6', lineHeight: 1.6 }}>
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

Object.assign(window, { AboutSection, PublicationsList, ContactSection });
