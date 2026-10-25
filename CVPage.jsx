// CVPage.jsx — the curriculum vitae: a light sheet on the sky ground on screen (style C), black on white in print.
// Facts come from site-content.js, which the homepage shares.
// Strata comes from HomeSections.jsx. The bundle loads that file first.

const CVSection = ({ id, title, children }) => (
  <section className="cv-section" aria-labelledby={`cv-${id}`}>
    <h2 id={`cv-${id}`}>{title}</h2>
    <Strata />
    {children}
  </section>
);

const CVRows = ({ items }) => (
  <div className="cv-rows">
    {items.map(item => (
      <div key={`${item.date}-${item.title}`} className="cv-row">
        <span className="cv-date">{item.date}</span>
        <div className="cv-entry">
          <h3>{item.title}</h3>
          {item.place && <p className="cv-place">{item.place}</p>}
          {(item.details || []).map(detail => <p key={detail} className="cv-detail">{detail}</p>)}
        </div>
      </div>
    ))}
  </div>
);

const CVPublications = () => (
  <div className="cv-rows">
    {SITE_PUBLICATIONS.map(pub => (
      <div key={pub.id} className="cv-row">
        <span className="cv-date">{pub.year}</span>
        <div className="cv-entry">
          <h3><a href={pub.url}>{pub.title}</a></h3>
          <p className="cv-place">
            {pub.authors.map((name, i) => (
              <React.Fragment key={name}>{i > 0 && ', '}{name === 'Telvari, S.' ? <strong>{name}</strong> : name}</React.Fragment>
            ))}
          </p>
          <p className="cv-detail">{pub.venue}. {pub.status}. DOI <a className="tnum" href={pub.url}>{pub.doi}</a></p>
        </div>
      </div>
    ))}
  </div>
);

const CVPage = () => (
  <article className="cv">
    <div className="cv-sheet">
      <header className="cv-head">
        <div>
          <h1>Sa’eed Telvari</h1>
          <p className="cv-role">{SITE_CV.title}</p>
          <ul className="cv-contact">
            <li><Icon name="pin" size={15} />{SITE_CV.location}</li>
            <li><a href={`mailto:${SITE_LINKS.email}`}><Icon name="mail" size={15} />{SITE_LINKS.email}</a></li>
            <li><a href={SITE_LINKS.orcid}><Icon name="orcid" size={15} />ORCID {SITE_LINKS.orcidId}</a></li>
            <li><a href={SITE_LINKS.scholar}><Icon name="scholar" size={15} />Google Scholar</a></li>
            <li><a href={SITE_LINKS.linkedin}><Icon name="linkedin" size={15} />linkedin.com/in/{SITE_LINKS.linkedinUser}</a></li>
            <li><a href="https://saeedtelvari.github.io/">saeedtelvari.github.io</a></li>
          </ul>
        </div>
        <button type="button" className="btn btn--quiet cv-print" onClick={() => window.print()}>
          <Icon name="print" size={16} />Print or save as PDF
        </button>
      </header>

      <CVSection id="interests" title="Research interests"><p className="cv-interests">{SITE_CV.interests}</p></CVSection>
      <CVSection id="education" title="Education"><CVRows items={SITE_CV.education} /></CVSection>
      <CVSection id="experience" title="Research projects and experience"><CVRows items={SITE_CV.experience} /></CVSection>
      <CVSection id="publications" title="Publications"><CVPublications /></CVSection>
      <CVSection id="presentations" title="Presentations"><CVRows items={SITE_CV.presentations} /></CVSection>
      <CVSection id="teaching" title="Teaching"><CVRows items={SITE_CV.teaching} /></CVSection>
      <CVSection id="service" title="Service and leadership"><CVRows items={SITE_CV.service} /></CVSection>
      <CVSection id="training" title="Professional training"><CVRows items={SITE_CV.training} /></CVSection>
      <CVSection id="skills" title="Skills">
        <dl className="cv-skills">
          {SITE_CV.skills.map(([area, list]) => <div key={area}><dt>{area}</dt><dd>{list}</dd></div>)}
        </dl>
      </CVSection>
      <CVSection id="recognition" title="Recognition"><CVRows items={SITE_CV.recognition} /></CVSection>
    </div>
  </article>
);

Object.assign(window, { CVPage });
