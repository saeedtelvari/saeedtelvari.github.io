// GuidePage.jsx — Interactive VE Simulator Equations & Methodology Guide
const { useMemo } = React;

const GuidePage = ({ isEmbedded = false }) => {
  return (
    <div className="guide-page-wrapper" style={{
      padding: isEmbedded ? '10px 5px' : '110px 4% 60px',
      minHeight: isEmbedded ? 'auto' : '100vh',
      background: isEmbedded ? 'transparent' : '#130d1c',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: 30,
    }}>
      {/* Custom Stylesheet for Math Layouts */}
      <style>{`
        .guide-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 25px;
        }
        @media (min-width: 900px) {
          .guide-grid {
            grid-template-columns: 1.1fr 0.9fr;
          }
          .full-width-card {
            grid-column: span 2;
          }
        }
        .math-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 24px 28px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.3s ease;
        }
        .math-card:hover {
          border-color: rgba(100, 255, 218, 0.25);
          box-shadow: 0 8px 32px rgba(100, 255, 218, 0.05);
        }
        .math-header {
          margin: 0;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #64ffda;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .math-text {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255,255,255,0.7);
          margin: 0;
        }
        .equation-block {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cambria Math', 'Times New Roman', serif;
          font-size: 1.25rem;
          margin: 20px 0;
          color: #0dfca2;
          background: rgba(0,0,0,0.22);
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.04);
          text-shadow: 0 0 10px rgba(13,252,162,0.15);
          user-select: all;
          overflow-x: auto;
          white-space: nowrap;
        }
        .fraction {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          padding: 0 6px;
          vertical-align: middle;
        }
        .numerator {
          border-bottom: 1.2px solid rgba(255,255,255,0.8);
          padding-bottom: 2px;
          text-align: center;
          font-size: 0.95em;
        }
        .denominator {
          padding-top: 2px;
          text-align: center;
          font-size: 0.95em;
        }
        .parenthesis {
          font-size: 1.9em;
          font-weight: 200;
          vertical-align: middle;
          margin: 0 2px;
        }
        .subscript {
          font-size: 0.65em;
          vertical-align: sub;
          margin-left: 1px;
        }
        .superscript {
          font-size: 0.65em;
          vertical-align: super;
        }
        .variable {
          font-style: italic;
          margin: 0 1px;
        }
      `}</style>

      {/* Title block */}
      <div>
        <div style={{ fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase', color: '#64ffda', fontWeight: 600, marginBottom: 6 }}>
          Saline Aquifer Physics & Simulation
        </div>
        <h2 style={{ margin: 0, fontSize: 'clamp(28px, 4vw, 38px)', fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>
          PDE Methodology Guide
        </h2>
        <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.65)', fontSize: 13.5, maxWidth: 720 }}>
          This reference manual details the mathematical foundations, Vertical Equilibrium simplifications, physical parameters, and numerical algorithms running inside the gravity tongue simulator.
        </p>
      </div>

      {/* Grid containing cards */}
      <div className="guide-grid">
        
        {/* Card 1: Vertical Equilibrium */}
        <div className="math-card full-width-card">
          <h3 className="math-header">
            <i className="fas fa-layer-group" /> The Vertical Equilibrium (VE) Formulation
          </h3>
          <p className="math-text">
            Saline aquifer CO₂ storage formations are typically thin, lateral sandstone layers with high aspect ratios where the reservoir length is far greater than the vertical thickness (<span className="variable">H</span> &ll; <span className="variable">L</span>). In such geometries, buoyancy forces drive rapid vertical segregation. CO₂ (the lighter phase) quickly floats to the top ceiling of the caprock, while denser brine water settles below.
          </p>
          <p className="math-text">
            The **Vertical Equilibrium (VE) approximation** assumes that vertical fluids are segregated instantly and remain in hydrostatic balance. This simplifies the 2D/3D two-phase flow equations into a 1D/2D vertically-integrated height-averaged transport equation, reducing simulation computational cost by several orders of magnitude while preserving core migration physics.
          </p>
          <div className="equation-block">
            <span className="variable">P</span>(<span className="variable">x</span>, <span className="variable">z</span>, <span className="variable">t</span>) = <span className="variable">P</span><span className="subscript">top</span>(<span className="variable">x</span>, <span className="variable">t</span>) + &int;<span className="superscript"><span className="variable">z</span></span><span className="subscript">0</span> &rho;(<span className="variable">z'</span>) <span className="variable">g</span> <span className="variable">dz'</span>
          </div>
          <p className="math-text">
            Under this assumption, the vertical pressure profile is analytical and completely defined by the depth and thickness of the floating carbon dioxide plume.
          </p>
        </div>

        {/* Card 2: Transport PDE */}
        <div className="math-card">
          <h3 className="math-header">
            <i className="fas fa-wave-square" /> 1D Transport PDE (Mass Conservation)
          </h3>
          <p className="math-text">
            The temporal evolution of the CO₂ plume height <span className="variable">h</span>(<span className="variable">x</span>, <span className="variable">t</span>) is governed by the conservation of mass. It is formulated as a 1D vertically-integrated convection-diffusion partial differential equation (PDE) with source/sink terms representing wells and fault leakages:
          </p>
          <div className="equation-block">
            &phi; <span className="fraction"><span className="numerator">&part; <span className="variable">h</span></span><span className="denominator">&part; <span className="variable">t</span></span></span> + 
            <span className="fraction"><span className="numerator">&part; <span className="variable">q</span></span><span className="denominator">&part; <span className="variable">x</span></span></span> = 
            <span className="variable">Q</span><span className="subscript">inj</span> - <span className="variable">Q</span><span className="subscript">leak</span>
          </div>
          <p className="math-text">
            Where:
            <br />• &phi; is the sandstone aquifer **porosity** (dimensionless).
            <br />• <span className="variable">h</span> is the local vertically integrated **CO₂ plume thickness** (meters).
            <br />• <span className="variable">q</span> is the vertically integrated **fluid flux** (meters squared per year).
            <br />• <span className="variable">Q</span><span className="subscript">inj</span> is the local **injection source** rate (well injection).
            <br />• <span className="variable">Q</span><span className="subscript">leak</span> is the local **fault leakage sink** rate.
          </p>
        </div>

        {/* Card 3: integrated flux */}
        <div className="math-card">
          <h3 className="math-header">
            <i className="fas fa-exchange-alt" /> Integrated Darcy Fluid Flux
          </h3>
          <p className="math-text">
            The vertically-integrated Darcy flux <span className="variable">q</span> describes fluid motion. It is driven by two main physical forces: advective regional slope dipping (structural dip) and buoyant lateral capillary spreading (dispersion):
          </p>
          <div className="equation-block">
            <span className="variable">q</span> = - <span className="fraction"><span className="numerator"><span className="variable">k</span> <span className="variable">hMobile</span> &Delta;&rho; <span className="variable">g</span></span><span className="denominator">&mu;</span></span> 
            <span className="parenthesis">[</span>
            <span className="fraction"><span className="numerator">&part; <span className="variable">z</span><span className="subscript">t</span></span><span className="denominator">&part; <span className="variable">x</span></span></span> + 
            <span className="fraction"><span className="numerator">&part; <span className="variable">h</span></span><span className="denominator">&part; <span className="variable">x</span></span></span>
            <span className="parenthesis">]</span>
          </div>
          <p className="math-text">
            Where:
            <br />• <span className="variable">k</span> is the sandstone **absolute permeability** (millidarcies).
            <br />• &Delta;&rho; is the **density difference** between brine water and injected supercritical CO₂ (&rho;<span className="subscript">brine</span> - &rho;<span className="subscript">co2</span>).
            <br />• <span className="variable">g</span> is the acceleration due to gravity.
            <br />• &mu; is the **dynamic viscosity** of the carbon dioxide phase.
            <br />• <span className="variable">z</span><span className="subscript">t</span> is the vertical depth profile of the **caprock ceiling underside**.
            <br />• <span className="variable">hMobile</span> is the flowing, mobile component of the CO₂ plume height.
          </p>
        </div>

        {/* Card 4: Residual Trapping */}
        <div className="math-card">
          <h3 className="math-header">
            <i className="fas fa-lock" /> Residual Capillary Trapping Physics
          </h3>
          <p className="math-text">
            As the CO₂ plume migrates updip under buoyancy, water imbibes at the trailing edge of the plume. This capillary imbibition snaps off carbon dioxide bubbles inside the narrow sandstone pores, rendering them completely immobile.
          </p>
          <p className="math-text">
            In Vertical Equilibrium, we track this by partitioning the total plume thickness <span className="variable">h</span> into a trapped phase <span className="variable">h</span><span className="subscript">trapped</span> and a mobile phase <span className="variable">h</span><span className="subscript">mobile</span>. The trapped gas represents a history-dependent threshold tracking the maximum plume thickness <span className="variable">h</span><span className="subscript">max</span> ever attained at that cell:
          </p>
          <div className="equation-block">
            <span className="variable">h</span><span className="subscript">trapped</span> = <span className="variable">S</span><span className="subscript">gr</span> &bull; <span className="variable">h</span><span className="subscript">max</span>
          </div>
          <div className="equation-block">
            <span className="variable">h</span><span className="subscript">mobile</span> = max<span className="parenthesis">(</span>0, <span className="fraction"><span className="numerator"><span className="variable">h</span> - <span className="variable">S</span><span className="subscript">gr</span> <span className="variable">h</span><span className="subscript">max</span></span><span className="denominator">1 - <span className="variable">S</span><span className="subscript">gr</span></span></span><span className="parenthesis">)</span>
          </div>
          <p className="math-text">
            Where <span className="variable">S</span><span className="subscript">gr</span> is the **residual trapping fraction** (governed by Land's trapping relationship). The mobile thickness <span className="variable">h</span><span className="subscript">mobile</span> is used to compute Darcy fluxes; when it drops to zero, the plume locks and ceases to flow.
          </p>
        </div>

        {/* Card 5: Fault Leakage */}
        <div className="math-card">
          <h3 className="math-header">
            <i className="fas fa-bolt" /> Capillary Seal Breaching & Fault Leakage
          </h3>
          <p className="math-text">
            Fault zones act as barrier seals because of clay smearing, which creates high capillary entry pressures. For CO₂ to breach the fault and escape vertically, the buoyant overpressure at the caprock must exceed the entry pressure threshold:
          </p>
          <div className="equation-block">
            &Delta;<span className="variable">P</span><span className="subscript">buoyancy</span> &gt; <span className="variable">P</span><span className="subscript">c</span><span className="superscript">entry</span> &rArr; <span className="variable">h</span> &gt; <span className="variable">h</span><span className="subscript">threshold</span>
          </div>
          <p className="math-text">
            The equivalent **capillary threshold height** (spill height) is:
          </p>
          <div className="equation-block">
            <span className="variable">h</span><span className="subscript">threshold</span> = <span className="fraction"><span className="numerator"><span className="variable">P</span><span className="subscript">c</span><span className="subscript">entry</span></span><span className="denominator">&Delta;&rho; <span className="variable">g</span></span></span>
          </div>
          <p className="math-text">
            Once breached, the vertical leakage volumetric flow rate is driven by the overpressure according to Darcy's law:
          </p>
          <div className="equation-block">
            <span className="variable">Q</span><span className="subscript">leak</span> = <span className="variable">C</span><span className="subscript">leak</span> &bull; max<span className="parenthesis">(</span>0, <span className="variable">h</span> - <span className="variable">h</span><span className="subscript">threshold</span><span className="parenthesis">)</span>
          </div>
          <p className="math-text">
            Where <span className="variable">C</span><span className="subscript">leak</span> is the transmissibility coefficient (leakage rate) of the open fault zone.
          </p>
        </div>

        {/* Card 6: Capillary Fringe VE Model */}
        <div className="math-card full-width-card">
          <h3 className="math-header">
            <i className="fas fa-water" /> Capillary Fringe & Capillary-VE Formulation
          </h3>
          <p className="math-text">
            While basic VE assumes an infinitely sharp fluid interface, capillary pressure <span className="variable">P</span><span className="subscript">c</span>(<span className="variable">S</span><span className="subscript">w</span>) creates a **capillary transition zone (capillary fringe)** beneath the mobile plume where CO₂ and brine coexist at varying saturations:
          </p>
          <div className="equation-block">
            <span className="variable">P</span><span className="subscript">c</span>(<span className="variable">z</span>) = <span className="variable">P</span><span className="subscript">CO₂</span>(<span className="variable">z</span>) - <span className="variable">P</span><span className="subscript">brine</span>(<span className="variable">z</span>) = <span className="variable">P</span><span className="subscript">entry</span> + &Delta;&rho; <span className="variable">g</span> (<span className="variable">z</span> - <span className="variable">z</span><span className="subscript">interface</span>)
          </div>
          <p className="math-text">
            Using the **Brooks-Corey retention model**, the vertical saturation distribution <span className="variable">S</span><span className="subscript">w</span>(<span className="variable">z</span>) within the capillary fringe is given by:
          </p>
          <div className="equation-block">
            <span className="variable">S</span><span className="subscript">w</span>*(<span className="variable">z</span>) = <span className="parenthesis">(</span><span className="fraction"><span className="numerator"><span className="variable">P</span><span className="subscript">entry</span></span><span className="denominator"><span className="variable">P</span><span className="subscript">c</span>(<span className="variable">z</span>)</span></span><span className="parenthesis">)</span><span className="superscript">&lambda;</span>, &emsp; <span className="variable">h</span><span className="subscript">c</span> = <span className="fraction"><span className="numerator"><span className="variable">P</span><span className="subscript">entry</span></span><span className="denominator">&Delta;&rho; <span className="variable">g</span></span></span>
          </div>
          <p className="math-text">
            Where &lambda; is the pore-size distribution index and <span className="variable">h</span><span className="subscript">c</span> is the characteristic **capillary transition height**. The vertically-integrated pseudo-relative permeability <span className="variable">k̃</span><span className="subscript">r,CO₂</span>(<span className="variable">h</span>) integrates the continuous saturation curve over the full vertical column:
          </p>
          <div className="equation-block">
            <span className="variable">k̃</span><span className="subscript">r,CO₂</span>(<span className="variable">h</span>) = <span className="fraction"><span className="numerator">1</span><span className="denominator"><span className="variable">h</span></span></span> &int;<span className="superscript"><span className="variable">h</span></span><span className="subscript">0</span> <span className="variable">k</span><span className="subscript">r,CO₂</span>(<span className="variable">S</span><span className="subscript">CO₂</span>(<span className="variable">z</span>)) <span className="variable">dz</span>
          </div>
          <p className="math-text">
            Accounting for the capillary fringe rounds off sharp shock fronts, correctly captures capillary retention during imbibition, and reflects the true diffuse halo observed in high-resolution field monitoring.
          </p>
        </div>

      </div>
    </div>
  );
};

// Bind to window object for Babel execution scope
Object.assign(window, { GuidePage });
