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
          PDE Methodology & Constitutive Models Guide
        </h2>
        <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.65)', fontSize: 13.5, maxWidth: 780 }}>
          This reference manual details the mathematical foundations, Vertical Equilibrium simplifications, multi-phase constitutive laws (Brooks-Corey capillary pressure and Corey relative permeabilities), and TVD numerical schemes running inside the simulator.
        </p>
      </div>

      {/* Grid containing cards */}
      <div className="guide-grid">
        
        {/* Card 1: Vertical Equilibrium */}
        <div className="math-card full-width-card">
          <h3 className="math-header">
            <i className="fas fa-layer-group" /> 1. The Vertical Equilibrium (VE) Formulation
          </h3>
          <p className="math-text">
            Saline aquifer CO₂ storage formations are typically thin, lateral sandstone layers with high aspect ratios where the reservoir length is far greater than the vertical thickness (<span className="variable">H</span> &ll; <span className="variable">L</span>). In such geometries, buoyancy forces drive rapid vertical segregation on a timescale much faster than regional horizontal migration (<span className="variable">t</span><span className="subscript">vert</span> &ll; <span className="variable">t</span><span className="subscript">horiz</span>). Supercritical CO₂ quickly floats to the caprock ceiling, while denser brine water settles below.
          </p>
          <p className="math-text">
            The **Vertical Equilibrium (VE) approximation** assumes that fluids segregate instantly along the vertical coordinate and remain in hydrostatic balance:
          </p>
          <div className="equation-block">
            <span className="fraction"><span className="numerator">&part; <span className="variable">P</span></span><span className="denominator">&part; <span className="variable">z</span></span></span> = - &rho;(<span className="variable">z</span>) <span className="variable">g</span> &emsp;&rArr;&emsp; <span className="variable">P</span>(<span className="variable">x</span>, <span className="variable">z</span>, <span className="variable">t</span>) = <span className="variable">P</span><span className="subscript">top</span>(<span className="variable">x</span>, <span className="variable">t</span>) + &int;<span className="superscript"><span className="variable">z</span></span><span className="subscript">0</span> &rho;(<span className="variable">z'</span>) <span className="variable">g</span> <span className="variable">dz'</span>
          </div>
          <p className="math-text">
            This simplifies 3D multi-phase Navier-Stokes equations into a 1D vertically-integrated height-averaged transport PDE, reducing computational cost by orders of magnitude while rigorously preserving mass balance and migration dynamics.
          </p>
        </div>

        {/* Card 2: Saturation Endpoints */}
        <div className="math-card">
          <h3 className="math-header">
            <i className="fas fa-tint" /> 2. Multi-Phase Saturation Limits & Sum Rule
          </h3>
          <p className="math-text">
            At every point in the pore space, the pore volume is completely occupied by gas (supercritical CO₂) and aqueous brine:
          </p>
          <div className="equation-block">
            <span className="variable">S</span><span className="subscript">w</span>(<span className="variable">z</span>) + <span className="variable">S</span><span className="subscript">g</span>(<span className="variable">z</span>) = 1.0
          </div>
          <p className="math-text">
            The saturation boundaries are parameterized by critical rock-fluid endpoints:
            <br />• **Connate / Irreducible Water Saturation** (<span className="variable">S</span><span className="subscript">wc</span> = 0.10): Capillary-bound water trapped in micro-pores that cannot be displaced by gas.
            <br />• **Maximum Mobile Gas Saturation** (<span className="variable">S</span><span className="subscript">g,max</span> = 1 - <span className="variable">S</span><span className="subscript">wc</span> = 0.90): Peak gas saturation at the caprock ceiling.
            <br />• **Residual Gas Trapping Saturation** (<span className="variable">S</span><span className="subscript">gr</span> = 0.20 – 0.25): Disconnected gas ganglia snapped off during water imbibition.
          </p>
        </div>

        {/* Card 3: Capillary Pressure & Vertical Distribution */}
        <div className="math-card">
          <h3 className="math-header">
            <i className="fas fa-water" /> 3. Brooks-Corey Capillary Pressure Model
          </h3>
          <p className="math-text">
            Capillary pressure <span className="variable">P</span><span className="subscript">c</span> governs the diffuse transition zone (capillary fringe) between mobile CO₂ and the native brine aquifer using the **Brooks-Corey (1964)** retention law:
          </p>
          <div className="equation-block">
            <span className="variable">P</span><span className="subscript">c</span>(<span className="variable">S</span><span className="subscript">w</span>) = <span className="variable">P</span><span className="subscript">ce</span> &bull; <span className="parenthesis">(</span><span className="fraction"><span className="numerator"><span className="variable">S</span><span className="subscript">w</span> - <span className="variable">S</span><span className="subscript">wc</span></span><span className="denominator">1 - <span className="variable">S</span><span className="subscript">wc</span></span></span><span className="parenthesis">)</span><span className="superscript">-1/&lambda;</span>
          </div>
          <p className="math-text">
            Under hydrostatic VE balance, the vertical gas saturation profile is:
          </p>
          <div className="equation-block">
            <span className="variable">S</span><span className="subscript">g</span>(<span className="variable">z</span>) = (1 - <span className="variable">S</span><span className="subscript">wc</span>) <span className="parenthesis">[</span> 1 - <span className="parenthesis">(</span><span className="fraction"><span className="numerator"><span className="variable">P</span><span className="subscript">ce</span></span><span className="denominator">&Delta;&rho; <span className="variable">g</span> (<span className="variable">h</span> - <span className="variable">z</span>) + <span className="variable">P</span><span className="subscript">ce</span></span></span><span className="parenthesis">)</span><span className="superscript">&lambda;</span> <span className="parenthesis">]</span>
          </div>
          <p className="math-text">
            Where <span className="variable">P</span><span className="subscript">ce</span> = 5.0 kPa is entry displacement pressure, &lambda; = 2.0 is the pore-size distribution index, and &Delta;&rho; = &rho;<span className="subscript">brine</span> - &rho;<span className="subscript">CO₂</span> is fluid density contrast.
          </p>
        </div>

        {/* Card 4: Relative Permeability Functions */}
        <div className="math-card">
          <h3 className="math-header">
            <i className="fas fa-chart-line" /> 4. Corey Relative Permeability Functions
          </h3>
          <p className="math-text">
            Phase mobilities in the porous sandstone are governed by modified **Corey / Brooks-Corey relative permeabilities**:
          </p>
          <div className="equation-block">
            <span className="variable">k</span><span className="subscript">rg</span>(<span className="variable">S</span><span className="subscript">g</span>) = <span className="variable">k</span><span className="subscript">rg</span><span className="superscript">0</span> <span className="parenthesis">(</span><span className="fraction"><span className="numerator"><span className="variable">S</span><span className="subscript">g</span> - <span className="variable">S</span><span className="subscript">gr</span></span><span className="denominator">1 - <span className="variable">S</span><span className="subscript">wc</span> - <span className="variable">S</span><span className="subscript">gr</span></span></span><span className="parenthesis">)</span><span className="superscript">n<span className="subscript">g</span></span>
          </div>
          <div className="equation-block">
            <span className="variable">k</span><span className="subscript">rw</span>(<span className="variable">S</span><span className="subscript">w</span>) = <span className="variable">k</span><span className="subscript">rw</span><span className="superscript">0</span> <span className="parenthesis">(</span><span className="fraction"><span className="numerator"><span className="variable">S</span><span className="subscript">w</span> - <span className="variable">S</span><span className="subscript">wc</span></span><span className="denominator">1 - <span className="variable">S</span><span className="subscript">wc</span> - <span className="variable">S</span><span className="subscript">gr</span></span></span><span className="parenthesis">)</span><span className="superscript">n<span className="subscript">w</span></span>
          </div>
          <p className="math-text">
            Parameters:
            <br />• Gas Corey exponent: <span className="variable">n</span><span className="subscript">g</span> = 2.0 (non-wetting phase).
            <br />• Water Corey exponent: <span className="variable">n</span><span className="subscript">w</span> = 3.0 (wetting phase).
            <br />• Endpoints: <span className="variable">k</span><span className="subscript">rg</span><span className="superscript">0</span> = 0.85, <span className="variable">k</span><span className="subscript">rw</span><span className="superscript">0</span> = 1.00.
          </p>
        </div>

        {/* Card 5: Transport PDE & TVD Scheme */}
        <div className="math-card">
          <h3 className="math-header">
            <i className="fas fa-wave-square" /> 5. 1D Transport PDE & TVD Flux Limiter
          </h3>
          <p className="math-text">
            The plume column thickness <span className="variable">h</span>(<span className="variable">x</span>, <span className="variable">t</span>) evolves according to the 1D vertically-integrated mass conservation law:
          </p>
          <div className="equation-block">
            &phi; <span className="fraction"><span className="numerator">&part; <span className="variable">h</span></span><span className="denominator">&part; <span className="variable">t</span></span></span> + 
            <span className="fraction"><span className="numerator">&part; <span className="variable">q</span></span><span className="denominator">&part; <span className="variable">x</span></span></span> = 
            <span className="variable">Q</span><span className="subscript">inj</span> - <span className="variable">Q</span><span className="subscript">leak</span>
          </div>
          <p className="math-text">
            To prevent non-physical dispersion and odd-even spatial checkerboarding across steep structural fault throws, our solver enforces a **Total Variation Diminishing (TVD)** upwind flux limiter:
          </p>
          <div className="equation-block">
            |<span className="variable">q</span><span className="subscript">i+1/2</span>| &le; <span className="fraction"><span className="numerator">0.30 &bull; &phi; &bull; <span className="variable">h</span><span className="subscript">mob,upwind</span></span><span className="denominator">&Delta;<span className="variable">t</span></span></span>
          </div>
          <p className="math-text">
            Integrated across 25 substeps per simulation year (&Delta;<span className="variable">t</span> = 0.040 yr), guaranteeing strict CFL stability and mass conservation.
          </p>
        </div>

        {/* Card 6: Darcy Flux */}
        <div className="math-card">
          <h3 className="math-header">
            <i className="fas fa-exchange-alt" /> 6. Integrated Darcy Fluid Flux & Faults
          </h3>
          <p className="math-text">
            The vertically-integrated Darcy flux <span className="variable">q</span> combines regional structural dipping and buoyant hydrostatic spreading:
          </p>
          <div className="equation-block">
            <span className="variable">q</span> = - <span className="fraction"><span className="numerator"><span className="variable">K</span> <span className="variable">h</span><span className="subscript">mob</span> &Delta;&rho; <span className="variable">g</span></span><span className="denominator">&mu;</span></span> 
            <span className="parenthesis">[</span>
            <span className="fraction"><span className="numerator">&part; <span className="variable">z</span><span className="subscript">t</span></span><span className="denominator">&part; <span className="variable">x</span></span></span> + 
            <span className="fraction"><span className="numerator">&part; <span className="variable">h</span></span><span className="denominator">&part; <span className="variable">x</span></span></span>
            <span className="parenthesis">]</span> &bull; <span className="variable">T</span><span className="subscript">fault</span>
          </div>
          <p className="math-text">
            Where:
            <br />• <span className="variable">K</span> is sandstone permeability.
            <br />• <span className="variable">z</span><span className="subscript">t</span> is the vertical depth profile of the caprock ceiling underside.
            <br />• <span className="variable">T</span><span className="subscript">fault</span> &in; [0, 1] is cross-fault horizontal transmissibility (<span className="variable">T</span><span className="subscript">fault</span> = 0 for completely sealed barrier faults).
          </p>
        </div>

        {/* Card 7: Residual Trapping */}
        <div className="math-card">
          <h3 className="math-header">
            <i className="fas fa-lock" /> 7. Residual Capillary Trapping & Envelope
          </h3>
          <p className="math-text">
            As the plume migrates updip under buoyancy, trailing-edge water imbibition snaps off CO₂ bubbles inside sandstone pores. In VE, the total height is partitioned into immobile trapped and flowing mobile components:
          </p>
          <div className="equation-block">
            <span className="variable">h</span><span className="subscript">trapped</span> = <span className="variable">S</span><span className="subscript">gr</span> &bull; <span className="variable">h</span><span className="subscript">max</span>
          </div>
          <div className="equation-block">
            <span className="variable">h</span><span className="subscript">mob</span> = max<span className="parenthesis">(</span>0, <span className="fraction"><span className="numerator"><span className="variable">h</span> - <span className="variable">S</span><span className="subscript">gr</span> <span className="variable">h</span><span className="subscript">max</span></span><span className="denominator">1 - <span className="variable">S</span><span className="subscript">gr</span></span></span><span className="parenthesis">)</span>
          </div>
          <p className="math-text">
            Where <span className="variable">h</span><span className="subscript">max</span>(<span className="variable">x</span>) is the historical maximum gas saturation envelope, visualized in the 2D reservoir canvas as the **cyan dashed boundary line**.
          </p>
        </div>

        {/* Card 8: Fault Leakage */}
        <div className="math-card full-width-card">
          <h3 className="math-header">
            <i className="fas fa-bolt" /> 8. Capillary Seal Breaching & Fault Conduit Leakage
          </h3>
          <p className="math-text">
            Fault zones act as structural barrier seals due to clay smearing, creating high capillary entry pressures. For CO₂ to breach the seal and escape vertically into overlying strata, the buoyant overpressure must exceed the capillary entry threshold:
          </p>
          <div className="equation-block">
            &Delta;<span className="variable">P</span><span className="subscript">buoyancy</span> &gt; <span className="variable">P</span><span className="subscript">c</span><span className="superscript">entry</span> &emsp;&rArr;&emsp; <span className="variable">h</span> &gt; <span className="variable">h</span><span className="subscript">threshold</span> = <span className="fraction"><span className="numerator"><span className="variable">P</span><span className="subscript">c</span><span className="superscript">entry</span></span><span className="denominator">&Delta;&rho; <span className="variable">g</span></span></span>
          </div>
          <p className="math-text">
            Once the spill height is exceeded, vertical leakage volume rate follows Darcy's conduit law:
          </p>
          <div className="equation-block">
            <span className="variable">Q</span><span className="subscript">leak</span> = <span className="variable">C</span><span className="subscript">leak</span> &bull; max<span className="parenthesis">(</span>0, <span className="variable">h</span> - <span className="variable">h</span><span className="subscript">threshold</span><span className="parenthesis">)</span>
          </div>
          <p className="math-text">
            Where <span className="variable">C</span><span className="subscript">leak</span> is the vertical fault zone permeability transmissibility.
          </p>
        </div>

      </div>
    </div>
  );
};

// Bind to window object for Babel execution scope
Object.assign(window, { GuidePage });
