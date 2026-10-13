// GuidePage.jsx — Method: the equations, numerics, verification and limits of the model
// in ve2d-model.js, written to match the code exactly. Equations are typeset with KaTeX.

const SimTex = ({ tex, block = false }) => {
  const ref = useRef(null);
  const [ready, setReady] = useState(typeof window !== 'undefined' && !!window.katex);
  useEffect(() => {
    if (ready) return undefined;
    const timer = setInterval(() => { if (window.katex) { setReady(true); clearInterval(timer); } }, 200);
    const stop = setTimeout(() => clearInterval(timer), 8000);
    return () => { clearInterval(timer); clearTimeout(stop); };
  }, [ready]);
  useEffect(() => {
    if (ready && ref.current) window.katex.render(tex, ref.current, { displayMode: block, throwOnError: false });
  }, [ready, tex, block]);
  const Tag = block ? 'div' : 'span';
  return <Tag ref={ref} className={block ? 'sim-eq' : undefined}>{ready ? null : <code>{tex}</code>}</Tag>;
};

const SIM_METHOD_SECTIONS = [
  ['scope', 'What the model is'],
  ['geometry', 'Geometry'],
  ['equations', 'Plume equation'],
  ['fluxes', 'Fluxes'],
  ['pressure', 'Pressure and injection'],
  ['edges', 'Model edges'],
  ['faults', 'Faults and leakage'],
  ['dissolution', 'Dissolution'],
  ['inventory', 'Traps and inventory'],
  ['numerics', 'Numerics'],
  ['verification', 'Verification'],
  ['limits', 'Limitations'],
  ['parameters', 'Parameters'],
  ['references', 'References']
];

const GuidePage = () => {
  const d = VE2D.DEFAULTS;
  const rows = [
    ['Permeability', 'k', `${d.permMd} mD`, 'Homogeneous'],
    ['Porosity', '\\phi', d.porosity, ''],
    ['Aquifer thickness', 'H', `${d.thickness} m`, 'Uniform'],
    ['Residual brine saturation', 'S_{wr}', d.swr, 'co2lab Johansen example'],
    ['Residual CO₂ saturation', 'S_{gr}', d.sgr, 'co2lab Johansen example'],
    ['CO₂ relative permeability end point', 'k_{rg}^{*}', d.krg, 'Within Bennion & Bachu (2008) range'],
    ['CO₂ / brine density', '\\rho_g,\\ \\rho_w', `${d.rhoCo2} / ${d.rhoBrine} kg/m³`, 'About 1500 m depth'],
    ['CO₂ / brine viscosity', '\\mu_g,\\ \\mu_w', `${d.muCo2} / ${d.muBrine} mPa·s`, ''],
    ['Total compressibility', 'c_t', `${d.ct}×10⁻⁴ bar⁻¹`, 'Rock plus brine'],
    ['Dissolution rate', 'r_d', `${d.disRate} kg m⁻² yr⁻¹`, 'co2lab default 5×10⁻¹¹ m/s at φ = 0.2'],
    ['CO₂ solubility in brine', 'c_{sat}', `${d.disCap} kg/m³`, 'CO2store value used by co2lab'],
    ['Fault-zone width, caprock thickness', 'w,\\ L_c', '5 m, 100 m', 'Fixed']
  ];
  return (
    <div className="sim-method__inner">
      <nav aria-label="Method contents">
        <ol>{SIM_METHOD_SECTIONS.map(([id, label]) => <li key={id}><a href={`#m-${id}`}>{label}</a></li>)}</ol>
      </nav>
      <article>
        <h2 id="m-scope">What the model is</h2>
        <p>
          This is an educational model of CO₂ storage in a confined saline aquifer, built on the vertical-equilibrium (VE)
          approximation used by MRST's co2lab. It runs in your browser in about a second, so the inputs can be explored
          freely. It is not a substitute for a field study: the aquifer is homogeneous, the fluids have constant
          properties and the caprock is a perfect seal except at faults.
        </p>
        <p>
          All quantities are in SI units inside the model; the interface shows megatonnes, millidarcies, metres,
          kilometres, bar and years. One run drives every view: the map, the 3D block, the section, the charts and the
          uncertainty study all read the same result.
        </p>

        <h2 id="m-geometry">Geometry</h2>
        <p>
          The aquifer covers 20 × 12 km on a Cartesian grid of 500, 250 or 167 m cells. Its top surface, the base of the
          caprock, is an analytic depth field <SimTex tex="z_t(x,y)" /> (positive down) made of a regional dip plane,
          seeded elliptical domes, multi-octave roughness and normal faults. A fault displaces its hanging wall (to the
          right of its strike) by a throw that is largest at mid-length and zero at the tips, decaying away from the fault.
          The aquifer has a uniform thickness <SimTex tex="H" />.
        </p>

        <h2 id="m-equations">Plume equation</h2>
        <p>
          Under vertical equilibrium, buoyancy separates CO₂ from brine much faster than the plume spreads, so each column
          holds a mobile CO₂ layer of thickness <SimTex tex="h" /> under the caprock, a residual zone down to the deepest
          interface reached so far, <SimTex tex="h_{\max}" />, and brine below. The CO₂ volume per unit area is
        </p>
        <SimTex block tex="s = \phi\left[(1-S_{wr})\,h + S_{gr}\,(h_{\max}-h)\right]" />
        <p>and conservation of CO₂ is</p>
        <SimTex block tex="\frac{\partial s}{\partial t} + \nabla\cdot\mathbf{u}_g = \frac{q}{\rho_g\,A}\,\delta_{\text{well}} - \text{leakage} - \text{dissolution}" />
        <p>
          Draining (h rising to a new maximum) and imbibition (h falling) store different volumes per metre of interface
          movement, <SimTex tex="\phi(1-S_{wr})" /> and <SimTex tex="\phi(1-S_{wr}-S_{gr})" />. The difference is the
          residual CO₂ left behind, so residual trapping follows from the history of each column rather than from a rule
          of thumb.
        </p>

        <h2 id="m-fluxes">Fluxes</h2>
        <p>
          With brine potential <SimTex tex="\Phi_w" /> and interface depth <SimTex tex="\zeta = z_t + h" />, the CO₂
          potential is <SimTex tex="\Phi_g = \Phi_w + \Delta\rho\, g\, \zeta" />. Writing the vertically integrated
          mobilities as <SimTex tex="\Lambda_g = k\,k_{rg}^{*} h/\mu_g" /> and <SimTex tex="\Lambda_w = k\,(H-h)/\mu_w" />,
          the CO₂ flux splits into a part carried by the total flux <SimTex tex="\mathbf{u}_T" /> and a buoyant
          counter-current part:
        </p>
        <SimTex block tex="\mathbf{u}_g = \frac{\Lambda_g}{\Lambda_g+\Lambda_w}\,\mathbf{u}_T \;-\; \frac{\Lambda_g\Lambda_w}{\Lambda_g+\Lambda_w}\,\Delta\rho\, g\,\nabla\zeta" />
        <p>
          The first term carries CO₂ away from the injector; the second drives it up-dip and spreads it, faster where
          the plume is thick. Both are evaluated on cell faces (two-point flux approximation). The viscous term is
          upwinded by the direction of the total flux and the buoyant term by the phase potentials (hybrid upwinding,
          Lee, Efendiev and Tchelepi 2015). The interface depth uses the mobile thickness <SimTex tex="h" />, not the
          residual zone, which carries no CO₂ head.
        </p>

        <h2 id="m-pressure">Pressure and injection</h2>
        <p>While injecting, and until the pressure transient has died away, the total flux comes from a backward-Euler pressure equation with total compressibility:</p>
        <SimTex block tex="\phi\, c_t\, H\,\frac{\partial \Phi_w}{\partial t} - \nabla\cdot\big(\Lambda_T \nabla\Phi_w\big) = \frac{q}{\rho_g}\,\delta_{\text{well}} + \nabla\cdot\big(\Lambda_g\,\Delta\rho\, g\,\nabla\zeta\big)" />
        <p>
          It is solved matrix-free with Jacobi-preconditioned conjugate gradients every few weeks to half a year of
          model time. Once the pressure changes by less than 0.05 bar per year after injection, the total flux is set to
          zero: the classic gravity-current regime. The bottom-hole build-up shown in the outcomes adds Peaceman's
          well-block correction, <SimTex tex="\Delta p_{bh} = \Delta p_{\text{block}} + \frac{q_v}{2\pi\,\Lambda_T}\ln\frac{0.2\,\Delta x}{r_w}" />, with the
          volumetric rate <SimTex tex="q_v" />, the well-cell total mobility <SimTex tex="\Lambda_T = \Lambda_g + \Lambda_w" /> and <SimTex tex="r_w = 0.1" /> m.
          It is compared with a typical fracture margin of 0.055 bar per metre of depth.
        </p>

        <h2 id="m-edges">Model edges</h2>
        <p>
          Open edges connect to a hydrostatic aquifer beyond the model: the ghost cell holds brine at hydrostatic
          pressure and no CO₂. CO₂ leaves only where its own potential drops outward, so it leaves up-dip edges and
          stays at down-dip ones. What leaves is reported as "Left the model", never as leakage. Closed edges are sealed:
          nothing crosses them and injection raises the pressure of the whole compartment.
        </p>

        <h2 id="m-faults">Faults and leakage</h2>
        <p>
          A face crossed by a fault trace gets a transmissibility multiplier equal to the fault's cross-fault
          transmissibility times the fraction of the aquifer still in contact across the throw,
          <SimTex tex="\max(0, 1 - \text{throw}/H)" />. A fault with a throw larger than the aquifer is therefore sealing
          whatever its rock properties.
        </p>
        <p>
          A fault zone with permeability <SimTex tex="k_f > 0" /> leaks vertically once the CO₂ column against it exceeds its
          seal capacity <SimTex tex="h_{th}" />, the column whose buoyancy overcomes the zone's capillary entry pressure.
          The leak rate from a cell crossed by a length <SimTex tex="L" /> of fault is
        </p>
        <SimTex block tex="Q_{\text{leak}} = L\,w\,\frac{k_f\,k_{rg}^{*}}{\mu_g}\,\Delta\rho\, g\left[\frac{h-h_{th}}{L_c} + 1\right], \qquad h > h_{th}" />
        <p>
          limited so that leakage never takes the column below <SimTex tex="h_{th}" />. Using the trace length inside each
          cell keeps the leak per metre of fault independent of the grid.
        </p>

        <h2 id="m-dissolution">Dissolution</h2>
        <p>
          CO₂ dissolves into the brine below the plume at a constant convective rate <SimTex tex="r_d" /> per unit area
          until the brine column is saturated at <SimTex tex="c_{sat}\,\phi\,H" />. Dissolution takes mobile CO₂ first and
          then residual CO₂. Dissolved CO₂ is assumed to stay where it dissolved.
        </p>

        <h2 id="m-inventory">Traps and inventory</h2>
        <p>
          Structural traps come from a spill-point analysis of the caprock (priority flood, Barnes et al. 2014) with the
          model edge as the spill path, as in co2lab's trap analysis; sealing faults bound traps, and compartments closed
          by faults never spill. Every kilogram injected is in exactly one of six classes:
        </p>
        <ul>
          <li><strong>Structurally trapped</strong>: mobile CO₂ above the local spill depth.</li>
          <li><strong>Free plume</strong>: the rest of the mobile CO₂.</li>
          <li><strong>Residually trapped</strong>: <SimTex tex="\rho_g\,\phi\,S_{gr}(h_{\max}-h)" /> per unit area.</li>
          <li><strong>Dissolved</strong>, <strong>Left the model</strong> and <strong>Leaked through faults</strong>: cumulative totals.</li>
        </ul>
        <p>The outcomes show the mass-balance error, injected minus the six classes, at every year.</p>

        <h2 id="m-numerics">Numerics</h2>
        <p>
          Transport is explicit with an adaptive time step: the step is limited so that no cell can change by more than
          40 % of its imbibition storage, using bounds on the derivatives of every face flux; a step that would empty a
          column is shortened rather than clipped, so no mass is ever deleted. One step may add at most a quarter of the
          injector cell's pore volume. Leakage and dissolution are applied after each transport step. Films thinner than a
          micrometre do not move.
        </p>

        <h2 id="m-verification">Verification</h2>
        <p>The engine is tested in Node on every change. The current results:</p>
        <table>
          <thead><tr><th>Check</th><th>Result</th></tr></thead>
          <tbody>
            <tr><td>Mass balance over 1000 years, default scenario</td><td>Worst relative error 9×10⁻¹³ (250 m grid)</td></tr>
            <tr><td>Closed aquifer: mean build-up vs injected volume / (φ c<sub>t</sub> V)</td><td>178.6 bar, error below 0.01 %</td></tr>
            <tr><td>Injection without buoyancy vs Nordbotten and Celia (2006)</td><td>Volume-weighted plume radius +7.5 % after 30 years (167 m grid)</td></tr>
            <tr><td>Thin plume on a 1° slope vs buoyant Darcy speed</td><td>56.1 vs 58.1 m/yr (−3.4 %)</td></tr>
            <tr><td>Grid convergence, 250 m vs 167 m, year 1000</td><td>Footprint +1.1 %, leaked 4.68 % vs 4.55 % of injected</td></tr>
            <tr><td>Symmetry, bounds, sealing faults, seal capacity, solubility cap, outflow direction</td><td>Pass</td></tr>
          </tbody>
        </table>

        <h2 id="m-limits">Limitations</h2>
        <ul>
          <li>Sharp interface: no capillary fringe, so very thin plumes are idealised.</li>
          <li>Constant fluid densities and viscosities; no CO₂ compressibility, temperature or composition effects.</li>
          <li>Homogeneous permeability and thickness; no layering inside the aquifer.</li>
          <li>Brine mobility in the residual zone is not reduced; dissolved CO₂ does not migrate.</li>
          <li>After injection the total flux is set to zero once the pressure has relaxed.</li>
          <li>No geomechanics: the fracture margin is a guide, not a calculation.</li>
        </ul>

        <h2 id="m-parameters">Parameters</h2>
        <table>
          <thead><tr><th>Parameter</th><th>Symbol</th><th>Default</th><th>Source or note</th></tr></thead>
          <tbody>{rows.map(([name, symbol, value, note]) => <tr key={name}><td>{name}</td><td><SimTex tex={symbol} /></td><td>{value}</td><td>{note}</td></tr>)}</tbody>
        </table>

        <h2 id="m-references">References</h2>
        <ul>
          <li>Barnes, Lehman and Mulla (2014). Priority-flood: an optimal depression-filling algorithm. <em>Computers &amp; Geosciences</em> 62.</li>
          <li>Bennion and Bachu (2008). Drainage and imbibition relative permeability relationships for supercritical CO₂/brine. <em>SPE Reservoir Evaluation &amp; Engineering</em> 11(3).</li>
          <li>Gasda, Nordbotten and Celia (2009). Vertical equilibrium with sub-scale analytical methods for geological CO₂ sequestration. <em>Computational Geosciences</em> 13.</li>
          <li>Hesse, Orr and Tchelepi (2008). Gravity currents with residual trapping. <em>Journal of Fluid Mechanics</em> 611.</li>
          <li>Lee, Efendiev and Tchelepi (2015). Hybrid upwind discretization of nonlinear two-phase flow with gravity. <em>Advances in Water Resources</em> 82.</li>
          <li>MacMinn, Szulczewski and Juanes (2011). CO₂ migration in saline aquifers. Part 2: capillary and solubility trapping. <em>Journal of Fluid Mechanics</em> 688.</li>
          <li>Neufeld et al. (2010). Convective dissolution of carbon dioxide in saline aquifers. <em>Geophysical Research Letters</em> 37.</li>
          <li>Nilsen, Lie and Andersen (2016). Fully-implicit simulation of vertical-equilibrium models with hysteresis and capillary fringe. <em>Computational Geosciences</em> 20.</li>
          <li>Nordbotten and Celia (2006). Similarity solutions for fluid injection into confined aquifers. <em>Journal of Fluid Mechanics</em> 561.</li>
          <li>Nordbotten and Celia (2012). <em>Geological Storage of CO₂: Modeling Approaches for Large-Scale Simulation</em>. Wiley.</li>
          <li>Peaceman (1978). Interpretation of well-block pressures in numerical reservoir simulation. <em>SPE Journal</em> 18(3).</li>
        </ul>
      </article>
    </div>
  );
};

Object.assign(window, { GuidePage });
