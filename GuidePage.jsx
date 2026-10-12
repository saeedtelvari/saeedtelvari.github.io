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
          How the simulator works
        </div>
        <h2 style={{ margin: 0, fontSize: 'clamp(28px, 4vw, 38px)', fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>
          Model & Equations
        </h2>
        <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.65)', fontSize: 13.5, maxWidth: 780 }}>
          This reference documents the model running in the simulator: sharp-interface vertical equilibrium in SI units, residual-trapping hysteresis, faults with juxtaposition seals and up-fault leakage, spill-point trap analysis and convective dissolution — plus its known limitations.
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
            The <strong>Vertical Equilibrium (VE) approximation</strong> assumes that fluids segregate instantly along the vertical coordinate and remain in hydrostatic balance:
          </p>
          <div className="equation-block">
            <span className="fraction"><span className="numerator">&part; <span className="variable">P</span></span><span className="denominator">&part; <span className="variable">z</span></span></span> = - &rho;(<span className="variable">z</span>) <span className="variable">g</span> &emsp;&rArr;&emsp; <span className="variable">P</span>(<span className="variable">x</span>, <span className="variable">z</span>, <span className="variable">t</span>) = <span className="variable">P</span><span className="subscript">top</span>(<span className="variable">x</span>, <span className="variable">t</span>) + &int;<span className="superscript"><span className="variable">z</span></span><span className="subscript">0</span> &rho;(<span className="variable">z'</span>) <span className="variable">g</span> <span className="variable">dz'</span>
          </div>
          <p className="math-text">
            This reduces the 3D two-phase Darcy flow equations to a 1D vertically integrated transport equation for the plume thickness, cutting the computational cost by orders of magnitude while keeping mass balance and the large-scale migration dynamics.
          </p>
        </div>

        {/* Card 2: Column volume & hysteresis */}
        <div className="math-card">
          <h3 className="math-header"><i className="fas fa-tint" /> 2. Sharp Interface & Residual Hysteresis</h3>
          <p className="math-text">
            Each column holds a mobile CO₂ layer of thickness <i>h</i> at saturation 1 − S<sub>wr</sub> beneath the caprock. Where the plume has retreated, the zone between <i>h</i> and the historical maximum <i>h</i><sub>max</sub> keeps residual CO₂ at S<sub>gr</sub>. The conserved quantity per unit area is
          </p>
          <div className="equation-block">V = φ [ (1 − S<sub>wr</sub>) h + S<sub>gr</sub> (h<sub>max</sub> − h) ]</div>
          <p className="math-text">
            Drainage (V ≥ φ(1 − S<sub>wr</sub>) h<sub>max</sub>): h = V / φ(1 − S<sub>wr</sub>) and h<sub>max</sub> = h. Imbibition: h = (V/φ − S<sub>gr</sub> h<sub>max</sub>) / (1 − S<sub>wr</sub> − S<sub>gr</sub>). Because V — not h — is updated, CO₂ mass is conserved to round-off.
          </p>
        </div>

        {/* Card 3: Capillary fringe */}
        <div className="math-card">
          <h3 className="math-header"><i className="fas fa-water" /> 3. Brooks–Corey Capillary Fringe (display)</h3>
          <p className="math-text">The entry pressure sets the fringe height; the saturation profile uses Brooks–Corey with λ = 2:</p>
          <div className="equation-block">h<sub>c</sub> = P<sub>e</sub> / (Δρ g) &emsp; S<sub>g</sub>(y) = (1 − S<sub>wr</sub>) [ 1 − (h<sub>c</sub>/y)<sup>2</sup> ], y ≥ h<sub>c</sub></div>
          <p className="math-text">
            y is height above the free-water level h′, chosen so the profile holds the same CO₂ as the sharp column: (h′ − h<sub>c</sub>)² / h′ = h. The fringe shapes the rendered saturation only; flow uses the sharp interface.
          </p>
        </div>

        {/* Card 4: Mobilities */}
        <div className="math-card">
          <h3 className="math-header"><i className="fas fa-chart-line" /> 4. End-Point Mobilities</h3>
          <div className="equation-block">λ<sub>g</sub> = k<sub>rg</sub>* / μ<sub>g</sub> &emsp; λ<sub>w</sub> = 1 / μ<sub>w</sub> &emsp; M = λ<sub>g</sub> / λ<sub>w</sub></div>
          <p className="math-text">
            Sharp-interface VE uses end-point mobilities: CO₂ at k<sub>rg</sub>* = 0.6 in the plume, brine at k<sub>rw</sub> = 1 below it. μ<sub>w</sub> = 0.5 cP; μ<sub>g</sub> follows from the mobility-ratio control (M = 5 → 0.06 cP).
          </p>
        </div>

        {/* Card 5: Transport */}
        <div className="math-card">
          <h3 className="math-header"><i className="fas fa-wave-square" /> 5. Vertically Integrated Transport</h3>
          <div className="equation-block">∂V/∂t + ∂F/∂x = q<sub>inj</sub> − q<sub>leak</sub> − q<sub>diss</sub>/ρ<sub>g</sub></div>
          <div className="equation-block">F = [m<sub>g</sub>/(m<sub>g</sub>+m<sub>w</sub>)] U + [m<sub>g</sub>m<sub>w</sub>/(m<sub>g</sub>+m<sub>w</sub>)] k Δρ g (−∂(z<sub>t</sub> + h)/∂x)</div>
          <p className="math-text">
            m<sub>g</sub> = λ<sub>g</sub>h, m<sub>w</sub> = λ<sub>w</sub>(H − h). The first term is the viscous push of the injector (total flux U, split left/right by flow resistance with open hydrostatic ends) and produces the gravity tongue; the second is buoyant up-dip migration and spreading. The (H − h) factor shuts gravity flow off as a column fills.
          </p>
        </div>

        {/* Card 6: Numerics */}
        <div className="math-card">
          <h3 className="math-header"><i className="fas fa-calculator" /> 6. Numerical Scheme</h3>
          <p className="math-text">
            Explicit finite volumes with counter-current upwinding (Brenier &amp; Jaffré 1991): CO₂ mobility from its upstream side, brine mobility from the other. Each substep Δt is the minimum of an advective CFL of 0.5, a diffusive limit, a positivity limit (≤ 50 % of a column's removable CO₂ per step), the column capacity and the injection stop time.
          </p>
          <div className="equation-block">Δt ≤ 0.5 φ(1 − S<sub>wr</sub> − S<sub>gr</sub>) Δx / c<sub>max</sub> &emsp; Δt ≤ 0.45 Δx² / D<sub>max</sub></div>
          <p className="math-text">A self-check verifies mass balance to 10<sup>−10</sup> and the t<sup>1/3</sup> spreading of a gravity current (Huppert &amp; Woods 1995).</p>
        </div>

        {/* Card 7: Faults */}
        <div className="math-card">
          <h3 className="math-header"><i className="fas fa-bolt" /> 7. Faults: Juxtaposition & Up-Fault Leakage</h3>
          <div className="equation-block">T<sub>face</sub> = T<sub>jux</sub> · T<sub>rock</sub> &emsp; T<sub>jux</sub> = max(0, H − |throw|) / H</div>
          <div className="equation-block">v<sub>leak</sub> = (k<sub>f</sub> k<sub>rg</sub>*/μ<sub>g</sub>) [ (Δρ g h − P<sub>th</sub>)/C + Δρ g ] &emsp; for h &gt; h<sub>th</sub> = P<sub>th</sub>/(Δρ g)</div>
          <p className="math-text">
            Throw ≥ H puts sand against shale and seals the fault laterally. Leaked CO₂ crosses the caprock (thickness C) through a 1 m fault zone into the upper aquifer, which is solved with the same VE equations.
          </p>
        </div>

        {/* Card 8: Traps & dissolution */}
        <div className="math-card">
          <h3 className="math-header"><i className="fas fa-lock" /> 8. Spill-Point Traps & Dissolution</h3>
          <div className="equation-block">Capacity = Σ ρ<sub>g</sub> φ (1 − S<sub>wr</sub>) min(H, z<sub>spill</sub> − z<sub>t</sub>) Δx W</div>
          <div className="equation-block">F<sub>d</sub> = 0.017 k Δρ<sub>s</sub> g C<sub>s</sub> / μ<sub>w</sub></div>
          <p className="math-text">
            Spill points come from walking out of each caprock crest to the first saddle, sealing face or domain edge. Convective dissolution (Pau et al. 2010; Δρ<sub>s</sub> = 10 kg/m³, C<sub>s</sub> = 50 kg/m³) acts beneath the mobile plume until a column's brine holds φ H C<sub>s</sub>.
          </p>
        </div>

        {/* Card 9: Limitations */}
        <div className="math-card full-width-card">
          <h3 className="math-header"><i className="fas fa-exclamation-circle" /> 9. Known Limitations</h3>
          <p className="math-text">
            Incompressible fluids · small-dip approximation (cos θ ≈ 1) · brine mobility not reduced in the residual zone · capillary fringe affects display only · buoyancy-driven net total flux neglected · no leakage above the upper aquifer · no cross-layer juxtaposition · traps are independent (no spill-merge tree) · dissolved CO₂ is immobile and residual CO₂ does not dissolve · 1D VE with no out-of-plane variation.
          </p>
        </div>

      </div>
    </div>
  );
};

// Bind to window object for Babel execution scope
Object.assign(window, { GuidePage });
