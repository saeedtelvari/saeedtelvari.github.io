// HomeSections.jsx — the homepage below the hero: research, projects, publications, contact.
// Facts come from site-content.js, which the CV shares.

const { useState } = React;

// ---- copy helper (pure; tests/site-content.test.js evaluates this block)
const siteCopy = async (text, clipboard) => {
  try {
    if (!clipboard || !clipboard.writeText) return false;
    await clipboard.writeText(text);
    return true;
  } catch (error) {
    return false;
  }
};
// ---- end copy helper

// "Copied" / "Copy failed" for two seconds, announced politely.
const useCopyStatus = () => {
  const [status, setStatus] = useState({});
  const copy = async (key, text) => {
    const ok = await siteCopy(text, navigator.clipboard);
    setStatus(previous => ({ ...previous, [key]: ok ? 'Copied' : 'Copy failed' }));
    setTimeout(() => setStatus(previous => ({ ...previous, [key]: '' })), 2000);
  };
  return [status, copy];
};

const SiteSection = ({ id, title, children }) => (
  <section id={id} className="section-panel" aria-labelledby={`${id}-title`}>
    <div className="sheet">
      <h2 id={`${id}-title`} className="section-title">{title}</h2>
      {children}
    </div>
  </section>
);

const SITE_THEMES = [
  ['VE models for depleted gas fields', 'Three-phase CO₂–methane–brine VE with a black-oil approximation, checked against compositional simulation and up to 100× faster.'],
  ['Storage screening under uncertainty', 'Ensembles of fast VE runs, such as the 28-case ensemble study in MuPSI.'],
  ['Machine learning for upscaling and digital rock', 'CNNs that upscale permeability tensors and predict two-phase flow properties from micro-CT images.'],
];

const ActivityList = ({ items = SITE_ACTIVITY, initial = 5 }) => {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, initial);
  return (
    <div className="activity">
      <h3 className="activity__title">Recent activity</h3>
      <ol className="activity__list" id="activity-list">
        {shown.map(item => (
          <li key={`${item.month}-${item.title}`} className="activity__item">
            <time dateTime={item.month}>{item.date}</time>
            <h4>{item.title}</h4>
            <p>{item.body}</p>
          </li>
        ))}
      </ol>
      {items.length > initial && (
        <button type="button" className="btn btn--quiet btn--small" aria-expanded={expanded} aria-controls="activity-list"
          onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show recent activity only' : 'Show earlier activity'}
        </button>
      )}
    </div>
  );
};

const ResearchSection = () => (
  <SiteSection id="research" title="Research">
    <div className="research">
      <div className="research__main">
        <p className="lead">
          I’m a PhD candidate in Petroleum Engineering at Heriot-Watt University. I study how injected CO₂ migrates through
          depleted gas reservoirs, and how to simulate it quickly at field scale.
        </p>
        <p>
          My main tool is the vertical-equilibrium (VE) model, which assumes that CO₂, methane and brine separate vertically
          under buoyancy. That reduces a 3D reservoir model to 2D and makes it fast enough for screening, uncertainty
          quantification and optimisation studies. I build these models in MRST, apply them to depleted gas fields in
          the MuPSI project, and teach MRST’s rapid-prototyping framework at Heriot-Watt.
        </p>
        <h3>Themes</h3>
        <dl className="themes">
          {SITE_THEMES.map(([term, detail]) => (
            <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>
          ))}
        </dl>
        <h3>Methods and tools</h3>
        <p className="methods">
          VE modelling, multiphase and compositional simulation, permeability upscaling and scientific machine learning,
          in MATLAB and MRST, Python, and Julia with JutulDarcy.
        </p>
        <h3>Background</h3>
        <p>
          BSc and MSc in Petroleum Engineering from Amirkabir University of Technology, Tehran, focused on reservoir
          simulation and machine learning for upscaling and digital rock.
        </p>
      </div>
      <div className="research__aside"><ActivityList /></div>
    </div>
  </SiteSection>
);

const ProjectsSection = () => {
  const [feature, ...others] = SITE_PROJECTS;
  return (
    <SiteSection id="projects" title="Projects">
      <article className="project-feature">
        <div className="project-feature__text">
          <h3>{feature.title}</h3>
          <p>{feature.body}</p>
          <p className="project-links">
            {feature.links.map((link, index) => (
              <a key={link.href} className={`btn ${index === 0 ? 'btn--primary' : 'btn--quiet'} btn--small`} href={link.href}>{link.label}</a>
            ))}
          </p>
        </div>
        <a className="project-feature__media" href={feature.links[0].href} aria-label={feature.links[0].label}>
          <img className="project-feature__shot" src={feature.image.src} width={feature.image.width} height={feature.image.height}
            alt={feature.image.alt} loading="lazy" decoding="async" />
        </a>
      </article>
      <div className="project-list">
        {others.map(project => (
          <article key={project.id} className="project">
            <h3>{project.title}{project.meta && <span className="project__meta">{project.meta}</span>}</h3>
            <p>{project.body}</p>
          </article>
        ))}
      </div>
    </SiteSection>
  );
};

const SiteAuthors = ({ authors }) => (
  <p className="pub__authors">
    {authors.map((name, i) => (
      <React.Fragment key={name}>{i > 0 && ', '}{name === 'Telvari, S.' ? <strong>{name}</strong> : name}</React.Fragment>
    ))}
  </p>
);

const PublicationsSection = () => {
  const [status, copy] = useCopyStatus();
  return (
    <SiteSection id="publications" title="Publications">
      <ol className="pubs">
        {SITE_PUBLICATIONS.map(pub => (
          <li key={pub.id} className="pub">
            <span className="pub__year">{pub.year}</span>
            <div className="pub__body">
              <h3 className="pub__title"><a href={pub.url} target="_blank" rel="noreferrer">{pub.title}</a></h3>
              <SiteAuthors authors={pub.authors} />
              <p className="pub__venue"><span className="pub__status">{pub.status}</span>{pub.venue}</p>
              <p className="pub__summary">{pub.summary}</p>
              <div className="pub__actions">
                <a className="btn btn--quiet btn--small" href={pub.url} target="_blank" rel="noreferrer">
                  <Icon name="external" size={15} />DOI {pub.doi}
                </a>
                <button type="button" className="btn btn--quiet btn--small" onClick={() => copy(pub.id, pub.bibtex)}
                  aria-label={`Copy BibTeX for ${pub.title}`}>
                  <Icon name={status[pub.id] === 'Copied' ? 'check' : 'copy'} size={15} />{status[pub.id] || 'Copy BibTeX'}
                </button>
                <span className="visually-hidden" aria-live="polite">{status[pub.id] ? `${status[pub.id]}: BibTeX for ${pub.title}` : ''}</span>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p className="pubs__more">
        Citations and new work: <a href={SITE_LINKS.scholar} target="_blank" rel="noreferrer">Google Scholar</a> and{' '}
        <a href={SITE_LINKS.orcid} target="_blank" rel="noreferrer">ORCID</a>.
      </p>
    </SiteSection>
  );
};

const SITE_CONTACT_PROFILES = [
  ['scholar', 'Google Scholar', 'Publications and citations', SITE_LINKS.scholar],
  ['orcid', 'ORCID', SITE_LINKS.orcidId, SITE_LINKS.orcid],
  ['github', 'GitHub', SITE_LINKS.githubUser, SITE_LINKS.github],
  ['linkedin', 'LinkedIn', SITE_LINKS.linkedinUser, SITE_LINKS.linkedin],
];

const ContactSection = () => {
  const [status, copy] = useCopyStatus();
  return (
    <SiteSection id="contact" title="Contact">
      <div className="contact">
        <div className="contact__main">
          <p className="lead">For collaborations, preprints or questions about VE models and the simulator, email me.</p>
          <div className="contact__email">
            <a href={`mailto:${SITE_LINKS.email}`}><Icon name="mail" size={18} />{SITE_LINKS.email}</a>
            <button type="button" className="btn btn--quiet btn--small" onClick={() => copy('email', SITE_LINKS.email)} aria-label="Copy email address">
              <Icon name={status.email === 'Copied' ? 'check' : 'copy'} size={15} />{status.email || 'Copy'}
            </button>
            <span className="visually-hidden" aria-live="polite">{status.email ? `${status.email}: email address` : ''}</span>
          </div>
          <p className="contact__address"><Icon name="pin" size={16} />Institute of GeoEnergy Engineering, Heriot-Watt University, Edinburgh, UK</p>
        </div>
        <ul className="contact__profiles">
          {SITE_CONTACT_PROFILES.map(([icon, label, detail, href]) => (
            <li key={icon}>
              <a href={href} target="_blank" rel="noreferrer">
                <Icon name={icon} size={18} />
                <span><strong>{label}</strong><small>{detail}</small></span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </SiteSection>
  );
};

Object.assign(window, { ResearchSection, ProjectsSection, PublicationsSection, ContactSection, ActivityList, siteCopy });
