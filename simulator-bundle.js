"use strict";
// Auto-generated bundle — Pre-compiled for instant execution
var { useState, useEffect, useMemo, useRef, useCallback } = React;

// File: GuidePage.jsx
// GuidePage.jsx — Interactive VE Simulator Equations & Methodology Guide
// [destructured React]

const GuidePage = ({
  isEmbedded = false
}) => {
  return /*#__PURE__*/React.createElement("div", {
    className: "guide-page-wrapper",
    style: {
      padding: isEmbedded ? '10px 5px' : '110px 4% 60px',
      minHeight: isEmbedded ? 'auto' : '100vh',
      background: isEmbedded ? 'transparent' : '#130d1c',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: 30
    }
  }, /*#__PURE__*/React.createElement("style", null, `
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
      `), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: '0.20em',
      textTransform: 'uppercase',
      color: '#64ffda',
      fontWeight: 600,
      marginBottom: 6
    }
  }, "VE Theory & Educational Simulator"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 'clamp(28px, 4vw, 38px)',
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 700
    }
  }, "Model Scope & Methodology Guide"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      color: 'rgba(255,255,255,0.65)',
      fontSize: 13.5,
      maxWidth: 780
    }
  }, "This guide separates general Vertical Equilibrium theory from the educational model used by this browser simulator. The interactive solver is a reduced, height-based finite-volume demonstration\u2014not a research-grade compositional simulator.")), /*#__PURE__*/React.createElement("div", {
    className: "guide-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "math-card full-width-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-layer-group"
  }), " 1. The Vertical Equilibrium (VE) Formulation"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Saline aquifer CO\u2082 storage formations are typically thin, lateral sandstone layers with high aspect ratios where the reservoir length is far greater than the vertical thickness (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "H"), " &ll; ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "L"), "). In such geometries, buoyancy forces drive rapid vertical segregation on a timescale much faster than regional horizontal migration (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "vert"), " &ll; ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "horiz"), "). Supercritical CO\u2082 quickly floats to the caprock ceiling, while denser brine water settles below."), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "The ", /*#__PURE__*/React.createElement("strong", null, "Vertical Equilibrium (VE) approximation"), " assumes that fluids segregate rapidly along the vertical coordinate and remain in hydrostatic balance:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"))), " = - \u03C1(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), ") ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "g"), " \u2003\u21D2\u2003 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"), ", ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), ", ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"), ") = ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "top"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"), ", ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"), ") + \u222B", /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z")), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "0"), " \u03C1(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z'"), ") ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "g"), " ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "dz'")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "In general VE formulations, vertically integrating multiphase porous-media conservation equations reduces the spatial dimension. The educational model below applies that idea to plume height; it does not solve the full 3D Navier\u2013Stokes or compositional equations.")), /*#__PURE__*/React.createElement("div", {
    className: "math-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-tint"
  }), " 2. Multi-Phase Saturation Limits & Sum Rule"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "At every point in the pore space, the pore volume is completely occupied by gas (supercritical CO\u2082) and aqueous brine:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), ") + ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), ") = 1.0"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "The saturation boundaries are parameterized by critical rock-fluid endpoints:", /*#__PURE__*/React.createElement("br", null), "\u2022 ", /*#__PURE__*/React.createElement("strong", null, "Connate / irreducible water saturation"), " (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc"), "): capillary-bound water not displaced by gas.", /*#__PURE__*/React.createElement("br", null), "\u2022 ", /*#__PURE__*/React.createElement("strong", null, "Maximum mobile gas saturation"), " (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g,max"), " = 1 - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc"), ").", /*#__PURE__*/React.createElement("br", null), "\u2022 ", /*#__PURE__*/React.createElement("strong", null, "Residual gas saturation"), " (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr"), "): disconnected gas retained during imbibition.")), /*#__PURE__*/React.createElement("div", {
    className: "math-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-water"
  }), " 3. Reference Theory: Brooks\u2013Corey Capillary Pressure"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "A common research formulation represents the capillary transition with the ", /*#__PURE__*/React.createElement("strong", null, "Brooks\u2013Corey retention law"), ":"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "c"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"), ") = ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "ce"), " \u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "("), /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "1 - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc"))), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, ")"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "-1/\u03BB")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Under hydrostatic VE balance, this can reconstruct a vertical gas saturation profile:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), ") = (1 - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc"), ") ", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "["), " 1 - ", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "("), /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "ce")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u0394\u03C1 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "g"), " (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), ") + ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "ce"))), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, ")"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "\u03BB"), " ", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "]")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "This constitutive law is shown for context. The browser solver does not evaluate it; its entry-pressure control changes only the illustrated fringe thickness.")), /*#__PURE__*/React.createElement("div", {
    className: "math-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-chart-line"
  }), " 4. Reference Theory: Corey Relative Permeability"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Research-grade multiphase models often use ", /*#__PURE__*/React.createElement("strong", null, "Corey-type relative permeabilities"), ":"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "k"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "rg"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g"), ") = ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "k"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "rg"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "0"), " ", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "("), /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "1 - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr"))), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, ")"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "n", /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g"))), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "k"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "rw"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"), ") = ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "k"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "rw"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "0"), " ", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "("), /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "1 - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr"))), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, ")"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "n", /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"))), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "These curves are background theory, not equations evaluated by this educational model. The solver instead uses a direct mobile-height mobility proportional to permeability and plume thickness.")), /*#__PURE__*/React.createElement("div", {
    className: "math-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-wave-square"
  }), " 5. Implemented Height Transport Scheme"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "The plume column thickness ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"), ", ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"), ") evolves according to the 1D vertically-integrated mass conservation law:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, "\u03C6 ", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"))), " +", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "q")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"))), " =", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "Q"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "inj"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "Q"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "leak")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "The browser implementation uses an explicit first-order upwind finite-volume flux and caps each substep\u2019s outgoing mobile volume for numerical robustness:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, "|", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "q"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "i+1/2"), "| \u2264 ", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "0.30 \u2022 \u03C6 \u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "mob,upwind")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u0394", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t")))), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "The cap is a practical stability safeguard. The interface reports a numerical mass-balance diagnostic; it does not claim exact conservation or a formal TVD/CFL proof.")), /*#__PURE__*/React.createElement("div", {
    className: "math-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-exchange-alt"
  }), " 6. Integrated Darcy Fluid Flux & Faults"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "The vertically-integrated Darcy flux ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "q"), " combines regional structural dipping and buoyant hydrostatic spreading:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "q"), " = - ", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "K"), " ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "mob"), " \u0394\u03C1 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "g")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u03BC")), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "["), /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "t")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"))), " +", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"))), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "]"), " \u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "T"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "fault")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Where:", /*#__PURE__*/React.createElement("br", null), "\u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "K"), " is sandstone permeability.", /*#__PURE__*/React.createElement("br", null), "\u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "t"), " is the vertical depth profile of the caprock ceiling underside.", /*#__PURE__*/React.createElement("br", null), "\u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "T"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "fault"), " &in; [0, 1] is cross-fault horizontal transmissibility (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "T"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "fault"), " = 0 for completely sealed barrier faults).")), /*#__PURE__*/React.createElement("div", {
    className: "math-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-lock"
  }), " 7. Residual Capillary Trapping & Envelope"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "As the plume migrates updip under buoyancy, trailing-edge water imbibition snaps off CO\u2082 bubbles inside sandstone pores. In VE, the total height is partitioned into immobile trapped and flowing mobile components:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "trapped"), " = ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr"), " \u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "max")), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "mob"), " = max", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "("), "0, ", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr"), " ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "max")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "1 - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr"))), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, ")")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Here ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "max"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"), ") is the historical maximum gas envelope, visualized as the ", /*#__PURE__*/React.createElement("strong", null, "cyan dashed boundary"), ".")), /*#__PURE__*/React.createElement("div", {
    className: "math-card full-width-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-bolt"
  }), " 8. Capillary Seal Breaching & Fault Conduit Leakage"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Fault zones act as structural barrier seals due to clay smearing, creating high capillary entry pressures. For CO\u2082 to breach the seal and escape vertically into overlying strata, the buoyant overpressure must exceed the capillary entry threshold:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, "\u0394", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "buoyancy"), " > ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "c"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "entry"), " \u2003\u21D2\u2003 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), " > ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "threshold"), " = ", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "c"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "entry")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u0394\u03C1 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "g")))), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Once the spill height is exceeded, vertical leakage volume rate follows Darcy's conduit law:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "Q"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "leak"), " = ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "C"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "leak"), " \u2022 max", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "("), "0, ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "threshold"), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, ")")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Where ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "C"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "leak"), " is the vertical fault zone permeability transmissibility."))));
};

// Bind to window object for Babel execution scope
Object.assign(window, {
  GuidePage
});

// File: SimulatorPage.jsx
// SimulatorPage.jsx — Interactive VE Simulator Page
// [destructured React]

const SIM_TABS = ['profile', 'uq', 'guide'];

// Declarative registry of every parameter the UQ batch can sample.
// dec = display decimals; dec 0 params are sampled as integers.
const UQ_PARAM_DEFS = [{
  key: 'K',
  label: 'Permeability (K)',
  lo: 0.1,
  hi: 3.5,
  dec: 2,
  percentDef: 40
}, {
  key: 'residualTrapFraction',
  label: 'Residual Trap (Sgr)',
  lo: 0.0,
  hi: 0.40,
  dec: 3,
  percentDef: 40
}, {
  key: 'porosity',
  label: 'Porosity (\u03C6)',
  lo: 0.10,
  hi: 0.40,
  dec: 3,
  percentDef: 20
}, {
  key: 'Q',
  label: 'Injection Rate (Q)',
  lo: 0.0,
  hi: 3.5,
  dec: 2,
  percentDef: 30
}, {
  key: 'injLocation',
  label: 'Well Position (%)',
  lo: 10,
  hi: 90,
  dec: 0,
  percentDef: 8
}, {
  key: 'dipPercent',
  label: 'Regional Dip (%)',
  lo: -5.0,
  hi: 5.0,
  dec: 2,
  percentDef: 35
}, {
  key: 'amplitude',
  label: 'Anticline Height (px)',
  lo: 0,
  hi: 50,
  dec: 0,
  percentDef: 25
}, {
  key: 'faultThreshold',
  label: 'Fault Seal Threshold (m)',
  lo: 0.0,
  hi: 2.0,
  dec: 2,
  percentDef: 50,
  group: 'fault'
}, {
  key: 'faultLeakRate',
  label: 'Fault Leak Rate',
  lo: 0.01,
  hi: 0.40,
  dec: 3,
  percentDef: 40,
  group: 'fault',
  leakingOnly: true
}, {
  key: 'faultTransmissibility',
  label: 'Fault Transmissibility',
  lo: 0.0,
  hi: 1.0,
  dec: 2,
  percentDef: 30,
  group: 'fault'
}];
const roundDec = (v, d) => d === 0 ? Math.round(v) : +v.toFixed(d);

// Parse a free-text list like "1.0, 1.5; 2  2.5" into finite numbers.
// Empty tokens are dropped BEFORE Number() — Number('') is 0, not NaN.
const parseValueList = text => (text || '').split(/[\s,;]+/).filter(t => t.length > 0).map(Number).filter(v => isFinite(v));
const scenarioNumber = (query, key, min, max, fallback, integer = false) => {
  if (!query.has(key)) return fallback;
  const value = Number(query.get(key));
  if (!isFinite(value)) return fallback;
  const clamped = Math.max(min, Math.min(max, value));
  return integer ? Math.round(clamped) : clamped;
};

// Draw one sample for a parameter given its config and nominal value.
// Returns { value, sampled } — sampled=false means the nominal was used unchanged.
const sampleUqParam = (def, cfg, nominal) => {
  if (!cfg || !cfg.enabled) return {
    value: nominal,
    sampled: false
  };
  const clampDef = v => Math.max(def.lo, Math.min(def.hi, v));
  if (cfg.mode === 'range') {
    let a = isFinite(cfg.min) ? cfg.min : def.lo;
    let b = isFinite(cfg.max) ? cfg.max : def.hi;
    if (a > b) {
      const t = a;
      a = b;
      b = t;
    }
    return {
      value: roundDec(clampDef(a + Math.random() * (b - a)), def.dec),
      sampled: true
    };
  }
  if (cfg.mode === 'values') {
    const vals = parseValueList(cfg.values);
    if (vals.length === 0) return {
      value: nominal,
      sampled: false
    };
    return {
      value: roundDec(clampDef(vals[Math.floor(Math.random() * vals.length)]), def.dec),
      sampled: true
    };
  }

  // percent mode (+/- of nominal)
  const unc = (isFinite(cfg.percent) ? cfg.percent : def.percentDef) / 100;
  return {
    value: roundDec(clampDef(nominal * (1.0 - unc) + Math.random() * (2.0 * unc * nominal)), def.dec),
    sampled: true
  };
};

// Per-parameter sampling config editor: enable checkbox + mode toggle + mode inputs
const UQParamConfig = ({
  def,
  cfg,
  onChange
}) => {
  const inputStyle = {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    padding: '3px 6px',
    borderRadius: 6,
    fontSize: 10.5,
    fontFamily: 'monospace',
    width: 58,
    outline: 'none'
  };
  const numVal = v => isFinite(v) ? v : '';
  const numChange = e => e.target.value === '' ? NaN : parseFloat(e.target.value);
  const stepVal = def.dec === 0 ? 1 : Math.pow(10, -def.dec);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      opacity: cfg.enabled ? 1 : 0.45,
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${cfg.enabled ? 'rgba(100,255,218,0.18)' : 'rgba(255,255,255,0.05)'}`,
      borderRadius: 10,
      padding: '8px 10px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 10.5,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: cfg.enabled,
    onChange: e => onChange({
      enabled: e.target.checked
    }),
    "aria-label": `Include ${def.label} in uncertainty analysis`,
    style: {
      accentColor: '#64ffda'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: cfg.enabled ? '#64ffda' : 'rgba(255,255,255,0.7)',
      fontWeight: cfg.enabled ? 'bold' : 500,
      flex: 1
    }
  }, def.label)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 3
    },
    role: "group",
    "aria-label": `${def.label} sampling mode`
  }, [{
    id: 'range',
    label: 'Range'
  }, {
    id: 'percent',
    label: '\u00B1%'
  }, {
    id: 'values',
    label: 'Values'
  }].map(m => /*#__PURE__*/React.createElement("button", {
    key: m.id,
    onClick: () => onChange({
      mode: m.id
    }),
    "aria-pressed": cfg.mode === m.id,
    style: {
      flex: 1,
      background: cfg.mode === m.id ? 'rgba(100,255,218,0.18)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${cfg.mode === m.id ? '#64ffda' : 'rgba(255,255,255,0.10)'}`,
      color: cfg.mode === m.id ? '#64ffda' : 'rgba(255,255,255,0.55)',
      padding: '2px 0',
      borderRadius: 5,
      fontSize: 9,
      fontWeight: 'bold',
      cursor: 'pointer'
    }
  }, m.label))), cfg.enabled && cfg.mode === 'range' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    "aria-label": `${def.label} minimum value`,
    value: numVal(cfg.min),
    step: stepVal,
    min: def.lo,
    max: def.hi,
    onChange: e => onChange({
      min: numChange(e)
    }),
    style: inputStyle
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: 'rgba(255,255,255,0.4)'
    }
  }, "to"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    "aria-label": `${def.label} maximum value`,
    value: numVal(cfg.max),
    step: stepVal,
    min: def.lo,
    max: def.hi,
    onChange: e => onChange({
      max: numChange(e)
    }),
    style: inputStyle
  })), cfg.enabled && cfg.mode === 'percent' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 10.5,
      color: 'rgba(255,255,255,0.7)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'monospace'
    }
  }, "nominal \xB1"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    "aria-label": `${def.label} percent variation`,
    value: numVal(cfg.percent),
    min: 1,
    max: 95,
    onChange: e => onChange({
      percent: numChange(e)
    }),
    style: inputStyle
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'monospace'
    }
  }, "%")), cfg.enabled && cfg.mode === 'values' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    "aria-label": `${def.label} discrete values, comma separated`,
    value: cfg.values,
    placeholder: "e.g. 1.0, 1.5, 2.0",
    onChange: e => onChange({
      values: e.target.value
    }),
    style: {
      ...inputStyle,
      width: '100%',
      boxSizing: 'border-box'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: parseValueList(cfg.values).length > 0 ? 'rgba(255,255,255,0.35)' : '#ff6b6b'
    }
  }, parseValueList(cfg.values).length, " valid value", parseValueList(cfg.values).length === 1 ? '' : 's', " \u2014 sampled uniformly")));
};

// Main Simulator component
const SimulatorPage = () => {
  // --- STATE PARAMETERS ---
  // Physical parameters
  const [K, setK] = useState(1.70); // Absolute permeability scaling (0.1 to 3.5)
  const [porosity, setPorosity] = useState(0.25); // Porosity (0.1 to 0.4)
  const [cellCount, setCellCount] = useState(200); // N cells resolution (50 to 300)
  const [residualTrapFraction, setResidualTrapFraction] = useState(0.25); // Trapping fraction Sgr (0.0 to 0.40)

  // Define dx in the outer scope of the component so it is available to all rendering sub-blocks
  const dx = 1000.0 / cellCount;

  // Topography parameters (Formula sliders)
  const [dipPercent, setDipPercent] = useState(1.5); // Regional dip in % (-5% to 5%)
  const [amplitude, setAmplitude] = useState(25); // Anticline wave amplitude (0 to 50px)
  const [frequency, setFrequency] = useState(2); // Wave frequency multiplier (0.5 to 4)
  const [faultOffset, setFaultOffset] = useState(1.2); // Fault displacement (0 to 3)

  // Injection parameters
  const [Q, setQ] = useState(2.30); // Constant injection rate (0.0 to 3.5)
  const [injLocation, setInjLocation] = useState(70); // Injection cell index % (10% to 90%)
  const [injDuration, setInjDuration] = useState(240); // Frame count of active injection (50 to 400)

  // Fault parameters
  const [faultCount, setFaultCount] = useState(2); // Number of faults (0 to 3)
  const [faults, setFaults] = useState(() => [{
    xPercent: 28,
    isSealed: false,
    thresholdHeight: 0.35,
    leakRate: 0.14,
    transmissibility: 1.0,
    dipSlope: -0.22
  }, {
    xPercent: 48,
    isSealed: false,
    thresholdHeight: 0.30,
    leakRate: 0.12,
    transmissibility: 1.0,
    dipSlope: 0.25
  }]);

  // Capillary fringe state
  const [hasCapillaryFringe, setHasCapillaryFringe] = useState(true);
  const [fringeScale, setFringeScale] = useState(0.65); // subtle, crisp capillary transition zone thickness (meters)
  const [entryPressure, setEntryPressure] = useState(15); // entry capillary pressure (kPa)

  // Simulation run state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReversing, setIsReversing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 4x execution speed
  const [simTime, setSimTime] = useState(0); // simulation timer frame

  // Tab Navigation state
  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile' (2D reservoir) or 'uq' (Sensitivity & UQ Analysis)
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [shareStatus, setShareStatus] = useState('');
  const tabRefs = useRef({});
  const reservoirSvgRef = useRef(null);
  const uqWorkerRef = useRef(null);

  // SA/UQ uncertainty bounds configuration states (default +/- percentages)
  // --- UQ / SA PARAMETER SELECTION CONFIG ---
  // Each parameter the user may include in the Monte Carlo batch has a config:
  //   enabled — participate in sampling at all
  //   mode    — 'range' (absolute min/max) | 'percent' (+/- of nominal) | 'values' (discrete list)
  //   percent — +/- percentage used by 'percent' mode
  //   min/max — bounds used by 'range' mode
  //   values  — raw text parsed to a discrete value list for 'values' mode
  const [uqParams, setUqParams] = useState(() => {
    const cfg = {};
    UQ_PARAM_DEFS.forEach(d => {
      cfg[d.key] = {
        enabled: d.key === 'K' || d.key === 'residualTrapFraction',
        mode: 'percent',
        percent: d.percentDef,
        min: roundDec(d.lo + (d.hi - d.lo) * 0.25, d.dec),
        max: roundDec(d.hi - (d.hi - d.lo) * 0.25, d.dec),
        values: ''
      };
    });
    return cfg;
  });

  // Nominal (deterministic) value of a UQ parameter from the live UI state.
  // Fault-grouped parameters resolve to the average across active faults.
  const getUqNominal = key => {
    switch (key) {
      case 'K':
        return K;
      case 'residualTrapFraction':
        return residualTrapFraction;
      case 'porosity':
        return porosity;
      case 'Q':
        return Q;
      case 'injLocation':
        return injLocation;
      case 'dipPercent':
        return dipPercent;
      case 'amplitude':
        return amplitude;
      case 'faultThreshold':
        {
          const a = faults.slice(0, faultCount);
          return a.length ? a.reduce((s, f) => s + f.thresholdHeight, 0) / a.length : 0.35;
        }
      case 'faultLeakRate':
        {
          const a = faults.slice(0, faultCount).filter(f => !f.isSealed);
          return a.length ? a.reduce((s, f) => s + f.leakRate, 0) / a.length : 0.14;
        }
      case 'faultTransmissibility':
        {
          const a = faults.slice(0, faultCount);
          return a.length ? a.reduce((s, f) => s + (f.transmissibility !== undefined ? f.transmissibility : 1.0), 0) / a.length : 1.0;
        }
      default:
        return 0;
    }
  };

  // Patch one parameter's config; when the mode changes, seed the new mode's
  // inputs from the current nominal (nominal ±30% for range/values).
  const updateUqParam = (key, patch) => {
    setUqParams(prev => {
      const def = UQ_PARAM_DEFS.find(d => d.key === key);
      const cur = prev[key];
      const next = {
        ...cur,
        ...patch
      };
      if (patch.mode && patch.mode !== cur.mode) {
        const nom = getUqNominal(key);
        if (patch.mode === 'range') {
          next.min = roundDec(Math.min(nom * 0.7, nom * 1.3), def.dec);
          next.max = roundDec(Math.max(nom * 0.7, nom * 1.3), def.dec);
        } else if (patch.mode === 'values') {
          const triple = [nom * 0.7, nom, nom * 1.3].sort((a, b) => a - b);
          next.values = triple.map(v => String(roundDec(v, def.dec))).join(', ');
        } else if (patch.mode === 'percent' && !isFinite(next.percent)) {
          next.percent = def.percentDef;
        }
      }
      return {
        ...prev,
        [key]: next
      };
    });
  };

  // Monte Carlo execution states
  const [mcRunsCount, setMcRunsCount] = useState(50); // 25, 50, or 100 simulations
  const [mcResults, setMcResults] = useState(null); // Array of realization runs
  const [uqRunning, setUqRunning] = useState(false);
  const [uqProgress, setUqProgress] = useState(0);
  const [uqTargetMetric, setUqTargetMetric] = useState('leaked'); // 'leaked' (CO2 leaked mass) or 'trapped' (trapping efficiency %)

  // Solver variables (Plume thickness vector, max thickness historical)
  const [h, setH] = useState(() => new Array(200).fill(0));
  const [hMax, setHMax] = useState(() => new Array(200).fill(0));

  // Cumulative masses tracking state
  const [massHistory, setMassHistory] = useState([]); // Array of { time, injected, trapped, mobile, leaked }
  const [currentMasses, setCurrentMasses] = useState({
    injected: 0,
    trapped: 0,
    mobile: 0,
    leaked: 0
  });

  // Reset flag / state synchronizer
  const stateRef = useRef({
    h: [],
    hMax: [],
    masses: {
      injected: 0,
      trapped: 0,
      mobile: 0,
      leaked: 0
    }
  });

  // Immutable snapshot of the live solver parameters (faults frozen at call time).
  // Much cheaper than a JSON round-trip and safe for Time-Machine branch diffs.
  const snapshotParams = () => {
    const p = solverParamsRef.current;
    return {
      ...p,
      faults: p.faults.map(f => ({
        ...f
      }))
    };
  };

  // Time travel history ref — stores full solver state at each year for back-and-forth scrubbing
  const historyRef = useRef([]);

  // Initialize solver parameters reference to prevent interval resets on slider modifications
  const solverParamsRef = useRef(null);
  solverParamsRef.current = {
    K,
    porosity,
    cellCount,
    dipPercent,
    amplitude,
    frequency,
    faultOffset,
    Q,
    injLocation,
    injDuration,
    faultCount,
    parentDX: dx,
    faults,
    residualTrapFraction
  };

  // Compute mobile and trapped heights dynamically for SVG visualization
  const {
    hMobile,
    hTrapped
  } = useMemo(() => {
    const N = h.length;
    const hMob = new Array(N).fill(0);
    const hTrap = new Array(N).fill(0);
    const R = residualTrapFraction;
    for (let i = 0; i < N; i++) {
      const H = h[i];
      const hm = hMax[i];
      // VE residual trapping model
      const mobileVal = R < 1.0 ? Math.max(0, (H - R * hm) / (1.0 - R)) : 0;
      hMob[i] = Math.min(H, mobileVal);
      hTrap[i] = Math.max(0, H - hMob[i]);
    }
    return {
      hMobile: hMob,
      hTrapped: hTrap
    };
  }, [h, hMax, residualTrapFraction]);

  // Initialize solver vectors when cell count changes
  useEffect(() => {
    resetSimulation();
  }, [cellCount]);

  // Reset simulation function
  const resetSimulation = () => {
    const arr = new Array(cellCount).fill(0);
    setH(arr);
    setHMax(arr);
    const initialMasses = {
      injected: 0,
      trapped: 0,
      mobile: 0,
      leaked: 0
    };
    setCurrentMasses(initialMasses);
    setMassHistory([{
      time: 0,
      ...initialMasses
    }]);
    setSimTime(0);
    setIsPlaying(false);
    setIsReversing(false);
    stateRef.current = {
      h: [...arr],
      hMax: [...arr],
      masses: {
        ...initialMasses
      }
    };
    historyRef.current = [{
      time: 0,
      h: [...arr],
      hMax: [...arr],
      masses: {
        ...initialMasses
      },
      params: snapshotParams()
    }];
  };

  // Preset Scenario Handlers
  const applyPreset = presetName => {
    setSelectedPreset(presetName);
    resetSimulation();
    if (presetName === 'dome') {
      setDipPercent(0.2);
      setAmplitude(45);
      setFrequency(1.5);
      setFaultOffset(0);
      setK(1.60);
      setPorosity(0.25);
      setQ(2.20);
      setInjDuration(240);
      setFaultCount(0);
      setResidualTrapFraction(0.30);
    } else if (presetName === 'faulted') {
      setDipPercent(1.8);
      setAmplitude(15);
      setFrequency(2);
      setFaultOffset(1.8);
      setK(1.80);
      setPorosity(0.22);
      setQ(2.00);
      setInjDuration(200);
      setFaultCount(2);
      setFaults([{
        xPercent: 26,
        isSealed: false,
        thresholdHeight: 0.30,
        leakRate: 0.16,
        transmissibility: 0.8,
        dipSlope: -0.22
      }, {
        xPercent: 50,
        isSealed: false,
        thresholdHeight: 0.45,
        leakRate: 0.12,
        transmissibility: 0.5,
        dipSlope: 0.25
      }]);
      setResidualTrapFraction(0.20);
    } else if (presetName === 'monocline') {
      setDipPercent(-2.5);
      setAmplitude(6);
      setFrequency(0.5);
      setFaultOffset(0);
      setK(1.50);
      setPorosity(0.28);
      setQ(1.80);
      setInjDuration(220);
      setFaultCount(1);
      setFaults([{
        xPercent: 32,
        isSealed: false,
        thresholdHeight: 0.35,
        leakRate: 0.14,
        transmissibility: 0.9,
        dipSlope: -0.20
      }]);
      setResidualTrapFraction(0.25);
    } else if (presetName === 'default') {
      setDipPercent(1.5);
      setAmplitude(25);
      setFrequency(2);
      setFaultOffset(1.2);
      setK(1.70);
      setPorosity(0.25);
      setQ(2.30);
      setInjDuration(240);
      setFaultCount(2);
      setFaults([{
        xPercent: 28,
        isSealed: false,
        thresholdHeight: 0.35,
        leakRate: 0.14,
        transmissibility: 1.0,
        dipSlope: -0.22
      }, {
        xPercent: 48,
        isSealed: false,
        thresholdHeight: 0.30,
        leakRate: 0.12,
        transmissibility: 1.0,
        dipSlope: 0.25
      }]);
      setResidualTrapFraction(0.25);
    }
  };
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const tab = query.get('tab');
    const preset = query.get('preset');
    if (['default', 'dome', 'faulted', 'monocline'].includes(preset)) applyPreset(preset);
    if (SIM_TABS.includes(tab)) setActiveSubTab(tab);
    setK(scenarioNumber(query, 'k', 0.1, 3.5, K));
    setPorosity(scenarioNumber(query, 'phi', 0.1, 0.4, porosity));
    setCellCount(scenarioNumber(query, 'cells', 50, 300, cellCount, true));
    setResidualTrapFraction(scenarioNumber(query, 'sgr', 0, 0.4, residualTrapFraction));
    setDipPercent(scenarioNumber(query, 'dip', -5, 5, dipPercent));
    setAmplitude(scenarioNumber(query, 'amp', 0, 50, amplitude, true));
    setFrequency(scenarioNumber(query, 'freq', 0.5, 4, frequency));
    setFaultOffset(scenarioNumber(query, 'slip', 0, 3, faultOffset));
    setQ(scenarioNumber(query, 'q', 0, 3.5, Q));
    setInjLocation(scenarioNumber(query, 'well', 10, 90, injLocation, true));
    setInjDuration(scenarioNumber(query, 'stop', 50, 400, injDuration, true));
    setFaultCount(scenarioNumber(query, 'faults', 0, 3, faultCount, true));
    try {
      const decoded = JSON.parse(query.get('faultData') || 'null');
      if (Array.isArray(decoded) && decoded.length <= 3) {
        setFaults(decoded.map((f, i) => ({
          xPercent: Math.max(10, Math.min(90, Number(f.xPercent) || 30 + i * 20)),
          isSealed: Boolean(f.isSealed),
          thresholdHeight: Math.max(0, Math.min(2, Number(f.thresholdHeight) || 0)),
          leakRate: Math.max(0.01, Math.min(0.4, Number(f.leakRate) || 0.01)),
          transmissibility: Math.max(0, Math.min(1, Number(f.transmissibility) || 0)),
          dipSlope: Math.max(-0.5, Math.min(0.5, Number(f.dipSlope) || 0))
        })));
      }
    } catch (_) {/* Invalid shared fault data falls back to the preset. */}
  }, []);
  useEffect(() => () => {
    if (uqWorkerRef.current) uqWorkerRef.current.terminate();
  }, []);
  const scenarioUrl = () => {
    const url = new URL('./simulator.html', window.location.href);
    const values = {
      preset: selectedPreset,
      tab: activeSubTab,
      k: K,
      phi: porosity,
      cells: cellCount,
      sgr: residualTrapFraction,
      dip: dipPercent,
      amp: amplitude,
      freq: frequency,
      slip: faultOffset,
      q: Q,
      well: injLocation,
      stop: injDuration,
      faults: faultCount,
      faultData: JSON.stringify(faults.slice(0, faultCount))
    };
    Object.entries(values).forEach(([key, value]) => url.searchParams.set(key, String(value)));
    return url.toString();
  };
  const copyScenarioLink = () => {
    const url = scenarioUrl();
    window.history.replaceState({
      simulator: true
    }, '', url);
    setShareStatus('Scenario link copied');
    if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {
      const field = document.createElement('textarea');
      field.value = url;
      document.body.appendChild(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    });
    setTimeout(() => setShareStatus(''), 2400);
  };
  const downloadBlob = (blob, filename) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };
  const exportCsv = () => {
    const rows = ['year,injected_kt,mobile_kt,trapped_kt,leaked_kt', ...massHistory.map(r => [r.time, r.injected, r.mobile, r.trapped, r.leaked].join(','))];
    downloadBlob(new Blob([rows.join('\n')], {
      type: 'text/csv;charset=utf-8'
    }), 've-simulator-mass-balance.csv');
  };
  const exportSvg = () => {
    if (!reservoirSvgRef.current) return;
    const markup = new XMLSerializer().serializeToString(reservoirSvgRef.current);
    downloadBlob(new Blob([markup], {
      type: 'image/svg+xml;charset=utf-8'
    }), 've-simulator-reservoir.svg');
  };

  // Geometry helpers accept an optional params object `p` so Monte Carlo
  // realizations can vary dip/amplitude/faultOffset/faults independently of
  // the live UI state. Passing no `p` (all render call sites) uses closure state.
  const capRockBaseProfile = (x, p) => {
    const dip = 150 + x * ((p ? p.dipPercent : dipPercent) / 100.0) * 8.0; // regional dip
    const wave = -(p ? p.amplitude : amplitude) * Math.sin(x * Math.PI / 1000.0 * (p ? p.frequency : frequency) * 2);
    return dip + wave;
  };

  // Base unperturbed stratum profile for any yOffset
  const stratumBaseProfile = (x, yOffset = 0, p) => {
    return capRockBaseProfile(x, p) + yOffset;
  };

  // Computes the exact subpixel intersection (x*, y*) of a sloped fault plane with any geological stratum at depth
  const getSimStratumFaultIntersection = (f, idx, yOffset = 0, p) => {
    const x0 = f.xPercent / 100.0 * 1000.0;
    const defaultSlope = idx % 2 === 0 ? -0.22 : 0.25;
    const slope = f.dipSlope !== undefined ? f.dipSlope : defaultSlope;
    let x = x0;
    for (let iter = 0; iter < 3; iter++) {
      const y = stratumBaseProfile(x, yOffset, p);
      x = x0 + slope * y;
    }
    const y = stratumBaseProfile(x, yOffset, p);
    return {
      x,
      y,
      x0,
      slope
    };
  };

  // Computes intersection for caprock specifically (yOffset = 0)
  const getSimFaultIntersection = (f, idx, p) => {
    return getSimStratumFaultIntersection(f, idx, 0, p);
  };

  // Computes elevation for any geological stratum displaced along the sloped fault
  const stratumY = (x, cellIdx = null, yOffset = 0, p) => {
    const g = p || {
      faultOffset,
      faults,
      faultCount
    };
    const base = stratumBaseProfile(x, yOffset, p);
    let offset = 0;
    const xRef = cellIdx !== null ? cellIdx * dx + dx / 2.0 : x;
    for (let idx = 0; idx < g.faultCount; idx++) {
      const f = g.faults[idx];
      const inter = getSimStratumFaultIntersection(f, idx, yOffset, p);
      if (xRef > inter.x) {
        const direction = idx % 2 === 0 ? 1 : -1;
        offset += direction * g.faultOffset * 12;
      }
    }
    return base + offset;
  };

  // Helper: Caprock Underside Topography Function
  const capRockY = (x, cellIdx = null, p) => {
    return stratumY(x, cellIdx, 0, p);
  };

  // --- SOLVER ITERATOR (FORWARD & REVERSE) ---
  useEffect(() => {
    if (!isPlaying && !isReversing) return;
    const interval = setInterval(() => {
      if (isPlaying) {
        setSimTime(t => {
          const nextTime = t + 1;
          if (nextTime > 1000) {
            setIsPlaying(false);
            return t;
          }

          // Run numerical VE solver step using parameters from the ref
          const result = runSolverStep(stateRef.current.h, stateRef.current.hMax, stateRef.current.masses, nextTime, solverParamsRef.current);

          // Update local React states
          setH(result.h);
          setHMax(result.hMax);
          setCurrentMasses(result.masses);

          // Append to mass history for plotting
          if (nextTime % 5 === 0 || nextTime === 1 || nextTime === 1000) {
            setMassHistory(history => {
              const cleaned = history.filter(item => item.time < nextTime);
              return [...cleaned, {
                time: nextTime,
                ...result.masses
              }];
            });
          }

          // Store back in ref for next iteration
          stateRef.current = {
            h: result.h,
            hMax: result.hMax,
            masses: result.masses
          };

          // Cache historical snapshot in historyRef for time scrubbing
          historyRef.current[nextTime] = {
            time: nextTime,
            h: [...result.h],
            hMax: [...result.hMax],
            masses: {
              ...result.masses
            },
            params: snapshotParams()
          };
          return nextTime;
        });
      } else if (isReversing) {
        setSimTime(t => {
          const nextTime = t - 1;
          if (nextTime < 0) {
            setIsReversing(false);
            return t;
          }

          // Load from history
          const histState = historyRef.current[nextTime];
          if (histState) {
            setH(histState.h);
            setHMax(histState.hMax);
            setCurrentMasses(histState.masses);
            stateRef.current = {
              h: [...histState.h],
              hMax: [...histState.hMax],
              masses: {
                ...histState.masses
              }
            };
          }
          return nextTime;
        });
      }
    }, 40 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, isReversing, speed]);

  // Time-Travel Scrubbing Handler (Non-destructive)
  const handleScrub = targetTime => {
    setIsPlaying(false);
    setIsReversing(false);
    const t = Math.max(0, Math.min(historyRef.current.length - 1, targetTime));
    const histState = historyRef.current[t];
    if (histState) {
      setH(histState.h);
      setHMax(histState.hMax);
      setCurrentMasses(histState.masses);
      setSimTime(t);

      // Update solver references
      stateRef.current = {
        h: [...histState.h],
        hMax: [...histState.hMax],
        masses: {
          ...histState.masses
        }
      };
    }
  };

  // Branching Committer: Slices the future history from target time and locks in new parameters
  const commitBranch = (targetTime = simTime) => {
    setIsPlaying(false);
    setIsReversing(false);
    const t = Math.max(0, Math.min(historyRef.current.length - 1, targetTime));

    // Truncate history ref after this point
    historyRef.current = historyRef.current.slice(0, t + 1);

    // Truncate mass history for chart
    setMassHistory(history => history.filter(item => item.time <= t));

    // Reload state
    const histState = historyRef.current[t];
    if (histState) {
      setH(histState.h);
      setHMax(histState.hMax);
      setCurrentMasses(histState.masses);
      stateRef.current = {
        h: [...histState.h],
        hMax: [...histState.hMax],
        masses: {
          ...histState.masses
        }
      };
    }
  };

  // Check differences between current parameters and parameters saved at simTime
  const getParamDiff = () => {
    if (simTime >= historyRef.current.length) return [];
    const histState = historyRef.current[simTime];
    if (!histState || !histState.params) return [];
    const histParams = histState.params;
    const diffs = [];
    const checkDiff = (key, label, formatHist, formatCurr) => {
      const vHist = histParams[key];
      let vCurr;
      if (key === 'K') vCurr = K;else if (key === 'porosity') vCurr = porosity;else if (key === 'cellCount') vCurr = cellCount;else if (key === 'residualTrapFraction') vCurr = residualTrapFraction;else if (key === 'dipPercent') vCurr = dipPercent;else if (key === 'amplitude') vCurr = amplitude;else if (key === 'frequency') vCurr = frequency;else if (key === 'faultOffset') vCurr = faultOffset;else if (key === 'Q') vCurr = Q;else if (key === 'injLocation') vCurr = injLocation;else if (key === 'injDuration') vCurr = injDuration;else if (key === 'faultCount') vCurr = faultCount;
      if (key !== 'faults' && Math.abs(vHist - vCurr) > 1e-5) {
        diffs.push({
          label,
          original: formatHist(vHist),
          current: formatCurr(vCurr)
        });
      }
    };
    checkDiff('K', 'Permeability (K)', v => `${Math.round(v * 1000)} mD`, v => `${Math.round(v * 1000)} mD`);
    checkDiff('porosity', 'Porosity (\u03C6)', v => `${Math.round(v * 100)}%`, v => `${Math.round(v * 100)}%`);
    checkDiff('cellCount', 'Grid Cells (N)', v => v, v => v);
    checkDiff('residualTrapFraction', 'Residual Trap (Sgr)', v => `${Math.round(v * 100)}%`, v => `${Math.round(v * 100)}%`);
    checkDiff('dipPercent', 'Regional Dip', v => `${v}%`, v => `${v}%`);
    checkDiff('amplitude', 'Anticline Height', v => `${v}px`, v => `${v}px`);
    checkDiff('frequency', 'Anticline Count', v => v, v => v);
    checkDiff('faultOffset', 'Fault Slip', v => `${v}x`, v => `${v}x`);
    checkDiff('Q', 'Flow Rate (Q)', v => v, v => v);
    checkDiff('injLocation', 'Well Location', v => `${v}%`, v => `${v}%`);
    checkDiff('injDuration', 'Inj. Stop Year', v => `${v}y`, v => `${v}y`);
    checkDiff('faultCount', 'Active Faults', v => v, v => v);
    if (histParams.faultCount === faultCount && faultCount > 0 && histParams.faults) {
      for (let i = 0; i < faultCount; i++) {
        const fHist = histParams.faults[i];
        const fCurr = faults[i];
        if (fHist && fCurr) {
          const prefix = `Fault ${String.fromCharCode(65 + i)}`;
          if (fHist.isSealed !== fCurr.isSealed) {
            diffs.push({
              label: `${prefix} Seal`,
              original: fHist.isSealed ? 'Sealed' : 'Leaking',
              current: fCurr.isSealed ? 'Sealed' : 'Leaking'
            });
          }
          if (Math.abs(fHist.xPercent - fCurr.xPercent) > 1e-5) {
            diffs.push({
              label: `${prefix} Position`,
              original: `${fHist.xPercent}%`,
              current: `${fCurr.xPercent}%`
            });
          }
          if (Math.abs(fHist.thresholdHeight - fCurr.thresholdHeight) > 1e-5) {
            diffs.push({
              label: `${prefix} Threshold`,
              original: `${fHist.thresholdHeight} m`,
              current: `${fCurr.thresholdHeight} m`
            });
          }
          if (!fHist.isSealed && !fCurr.isSealed && Math.abs(fHist.leakRate - fCurr.leakRate) > 1e-5) {
            diffs.push({
              label: `${prefix} Leak Rate`,
              original: fHist.leakRate,
              current: fCurr.leakRate
            });
          }
        }
      }
    }
    return diffs;
  };

  // Accessible tab switching (Left/Right arrows while focus is inside the tablist)
  const handleTabKeys = e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const idx = SIM_TABS.indexOf(activeSubTab);
    const dir = e.key === 'ArrowRight' ? 1 : SIM_TABS.length - 1;
    const next = SIM_TABS[(idx + dir) % SIM_TABS.length];
    setActiveSubTab(next);
    requestAnimationFrame(() => tabRefs.current[next] && tabRefs.current[next].focus());
  };

  // Play controls toggles
  const handlePlayToggle = () => {
    if (isReversing) {
      setIsReversing(false);
    }
    if (!isPlaying) {
      if (simTime < historyRef.current.length - 1) {
        commitBranch();
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };
  const handlePlayReverseToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    }
    setIsReversing(!isReversing);
  };
  const stepForward = () => {
    setIsPlaying(false);
    setIsReversing(false);
    const nextTime = simTime + 1;
    if (nextTime > 1000) return;
    if (simTime < historyRef.current.length - 1) {
      commitBranch();
    }
    const result = runSolverStep(stateRef.current.h, stateRef.current.hMax, stateRef.current.masses, nextTime, solverParamsRef.current);
    setH(result.h);
    setHMax(result.hMax);
    setCurrentMasses(result.masses);
    setSimTime(nextTime);
    if (nextTime % 5 === 0 || nextTime === 1 || nextTime === 1000) {
      setMassHistory(history => {
        const cleaned = history.filter(item => item.time < nextTime);
        return [...cleaned, {
          time: nextTime,
          ...result.masses
        }];
      });
    }
    stateRef.current = {
      h: result.h,
      hMax: result.hMax,
      masses: result.masses
    };
    historyRef.current[nextTime] = {
      time: nextTime,
      h: [...result.h],
      hMax: [...result.hMax],
      masses: {
        ...result.masses
      },
      params: snapshotParams()
    };
  };
  const stepBackward = () => {
    setIsPlaying(false);
    setIsReversing(false);
    const prevTime = simTime - 1;
    if (prevTime < 0) return;
    const histState = historyRef.current[prevTime];
    if (histState) {
      setH(histState.h);
      setHMax(histState.hMax);
      setCurrentMasses(histState.masses);
      setSimTime(prevTime);
      stateRef.current = {
        h: [...histState.h],
        hMax: [...histState.hMax],
        masses: {
          ...histState.masses
        }
      };
    }
  };

  // --- MONTE CARLO UQ/SA ENGINE ---
  const runMonteCarloBatch = () => {
    if (uqRunning) return;
    setUqRunning(true);
    setUqProgress(0);
    setMcResults(null);
    const totalRuns = mcRunsCount;

    // Capture nominal parameter values
    const nominalK = K;
    const nominalSgr = residualTrapFraction;
    const nominalFaults = faults.map(f => ({
      ...f
    }));
    const activeFaults = nominalFaults.slice(0, faultCount);
    const leakingFaults = activeFaults.filter(f => !f.isSealed);
    const anyLeaking = leakingFaults.length > 0;
    const nominals = {
      K: nominalK,
      residualTrapFraction: nominalSgr,
      porosity: porosity,
      Q: Q,
      injLocation: injLocation,
      dipPercent: dipPercent,
      amplitude: amplitude,
      faultThreshold: activeFaults.length ? activeFaults.reduce((s, f) => s + f.thresholdHeight, 0) / activeFaults.length : 0.35,
      faultLeakRate: anyLeaking ? leakingFaults.reduce((s, f) => s + f.leakRate, 0) / leakingFaults.length : 0.14,
      faultTransmissibility: activeFaults.length ? activeFaults.reduce((s, f) => s + (f.transmissibility !== undefined ? f.transmissibility : 1.0), 0) / activeFaults.length : 1.0
    };
    const defOf = key => UQ_PARAM_DEFS.find(d => d.key === key);
    const sampledKeys = new Set();

    // Generate parameter sets for each realization
    const realizations = [];
    for (let i = 0; i < totalRuns; i++) {
      const s = {};
      UQ_PARAM_DEFS.forEach(def => {
        if (def.group === 'fault') return; // sampled per-fault below
        const r = sampleUqParam(def, uqParams[def.key], nominals[def.key]);
        s[def.key] = r.value;
        if (r.sampled) sampledKeys.add(def.key);
      });
      const randFaults = nominalFaults.map(f => {
        const nf = {
          ...f
        };
        ['faultThreshold', 'faultLeakRate', 'faultTransmissibility'].forEach(key => {
          if (faultCount === 0) return;
          const def = defOf(key);
          if (key === 'faultLeakRate' && (f.isSealed || !anyLeaking)) return;
          const base = key === 'faultThreshold' ? f.thresholdHeight : key === 'faultLeakRate' ? f.leakRate : f.transmissibility !== undefined ? f.transmissibility : 1.0;
          const r = sampleUqParam(def, uqParams[key], base);
          if (r.sampled) {
            if (key === 'faultThreshold') nf.thresholdHeight = r.value;else if (key === 'faultLeakRate') nf.leakRate = r.value;else nf.transmissibility = r.value;
            sampledKeys.add(key);
          }
        });
        return nf;
      });
      realizations.push({
        id: i,
        K: s.K,
        residualTrapFraction: s.residualTrapFraction,
        porosity: s.porosity,
        Q: s.Q,
        injLocation: s.injLocation,
        dipPercent: s.dipPercent,
        amplitude: s.amplitude,
        faults: randFaults
      });
    }
    if (!window.Worker) {
      setUqRunning(false);
      setShareStatus('This browser does not support background simulation workers.');
      return;
    }
    const worker = new Worker('./uq-worker.js');
    uqWorkerRef.current = worker;
    worker.onmessage = ({
      data
    }) => {
      if (data.type === 'progress') setUqProgress(data.value);
      if (data.type === 'complete') {
        setUqRunning(false);
        setMcResults({
          runs: data.results,
          sampledKeys: Array.from(sampledKeys)
        });
        worker.terminate();
        uqWorkerRef.current = null;
      }
    };
    worker.onerror = () => {
      setUqRunning(false);
      setShareStatus('Uncertainty analysis could not start. Please retry.');
      worker.terminate();
      uqWorkerRef.current = null;
    };
    worker.postMessage({
      realizations,
      base: {
        cellCount,
        frequency,
        faultOffset,
        injDuration,
        faultCount,
        parentDX: dx
      }
    });
  };

  // Helper to calculate percentiles
  const getPercentile = (sortedArray, percentile) => {
    if (sortedArray.length === 0) return 0;
    const idx = Math.floor(sortedArray.length * (percentile / 100));
    return sortedArray[Math.min(sortedArray.length - 1, idx)];
  };

  // Helper to calculate Pearson correlation coefficient
  const computeCorrelation = (xValues, yValues) => {
    const M = xValues.length;
    if (M === 0) return 0;
    const meanX = xValues.reduce((a, b) => a + b, 0) / M;
    const meanY = yValues.reduce((a, b) => a + b, 0) / M;
    let num = 0;
    let denX = 0;
    let denY = 0;
    for (let j = 0; j < M; j++) {
      const dx = xValues[j] - meanX;
      const dy = yValues[j] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    if (denX === 0 || denY === 0) return 0;
    return num / Math.sqrt(denX * denY);
  };

  // Memoized UQ statistics computations
  const uqData = useMemo(() => {
    if (!mcResults) return null;
    const runs = mcResults.runs;
    const vals = runs.map(r => uqTargetMetric === 'leaked' ? r.finalLeaked : r.trappingEfficiency);
    const sorted = [...vals].sort((a, b) => a - b);
    const p10Val = getPercentile(sorted, 10);
    const p50Val = getPercentile(sorted, 50);
    const p90Val = getPercentile(sorted, 90);
    const findClosestRealization = targetVal => {
      let closest = runs[0];
      let minDiff = Infinity;
      runs.forEach(r => {
        const val = uqTargetMetric === 'leaked' ? r.finalLeaked : r.trappingEfficiency;
        const diff = Math.abs(val - targetVal);
        if (diff < minDiff) {
          minDiff = diff;
          closest = r;
        }
      });
      return closest;
    };
    const p10Realization = findClosestRealization(p10Val);
    const p50Realization = findClosestRealization(p50Val);
    const p90Realization = findClosestRealization(p90Val);
    const minVal = sorted[0];
    const maxVal = sorted[sorted.length - 1];
    const range = maxVal - minVal || 1.0;
    const numBins = 10;
    const binWidth = range / numBins;
    const bins = new Array(numBins).fill(0);
    vals.forEach(v => {
      let binIdx = Math.floor((v - minVal) / binWidth);
      if (binIdx >= numBins) binIdx = numBins - 1;
      if (binIdx < 0) binIdx = 0;
      bins[binIdx]++;
    });
    const maxBinCount = Math.max(1, Math.max(...bins));
    return {
      vals,
      sorted,
      minVal,
      maxVal,
      range,
      bins,
      maxBinCount,
      binWidth,
      p10Val,
      p50Val,
      p90Val,
      p10Realization,
      p50Realization,
      p90Realization
    };
  }, [mcResults, uqTargetMetric]);

  // Memoized Sensitivity correlations — only ranks parameters actually
  // sampled in the batch (per mcResults.sampledKeys).
  const sensitivityData = useMemo(() => {
    if (!mcResults) return null;
    const {
      runs,
      sampledKeys
    } = mcResults;
    if (!sampledKeys || sampledKeys.length === 0) return [];
    const yVals = runs.map(r => uqTargetMetric === 'leaked' ? r.finalLeaked : r.trappingEfficiency);
    const scalarGetters = {
      K: r => r.params.K,
      residualTrapFraction: r => r.params.residualTrapFraction,
      porosity: r => r.params.porosity,
      Q: r => r.params.Q,
      injLocation: r => r.params.injLocation,
      dipPercent: r => r.params.dipPercent,
      amplitude: r => r.params.amplitude
    };
    const faultGetters = {
      faultThreshold: r => {
        const a = r.params.faults.slice(0, faultCount);
        return a.length ? a.reduce((s, f) => s + f.thresholdHeight, 0) / a.length : 0;
      },
      faultLeakRate: r => {
        const a = r.params.faults.slice(0, faultCount).filter(f => !f.isSealed);
        return a.length ? a.reduce((s, f) => s + f.leakRate, 0) / a.length : 0;
      },
      faultTransmissibility: r => {
        const a = r.params.faults.slice(0, faultCount);
        return a.length ? a.reduce((s, f) => s + (f.transmissibility !== undefined ? f.transmissibility : 1.0), 0) / a.length : 0;
      }
    };
    return sampledKeys.map(key => {
      const def = UQ_PARAM_DEFS.find(d => d.key === key);
      const getter = def.group === 'fault' ? faultGetters[key] : scalarGetters[key];
      return {
        label: def.label,
        r: computeCorrelation(runs.map(getter), yVals)
      };
    }).sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
  }, [mcResults, uqTargetMetric, faultCount]);

  // Load a selected Monte Carlo model back to 2D simulator
  const loadUQRealization = realization => {
    if (!realization) return;

    // 1. Apply the realization's parameters to the live UI controls
    const loadedK = parseFloat(realization.params.K.toFixed(3));
    const loadedSgr = parseFloat(realization.params.residualTrapFraction.toFixed(3));
    const loadedPor = parseFloat(realization.params.porosity.toFixed(3));
    const loadedQ = parseFloat(realization.params.Q.toFixed(3));
    const loadedInjLoc = Math.round(realization.params.injLocation);
    const loadedDip = parseFloat(realization.params.dipPercent.toFixed(2));
    const loadedAmp = Math.round(realization.params.amplitude);
    setK(loadedK);
    setResidualTrapFraction(loadedSgr);
    setPorosity(loadedPor);
    setQ(loadedQ);
    setInjLocation(loadedInjLoc);
    setDipPercent(loadedDip);
    setAmplitude(loadedAmp);
    const newFaults = faults.map((f, i) => {
      const rf = realization.params.faults[i];
      if (rf) {
        return {
          ...f,
          thresholdHeight: parseFloat(rf.thresholdHeight.toFixed(3)),
          leakRate: rf.leakRate !== undefined ? parseFloat(rf.leakRate.toFixed(3)) : f.leakRate,
          transmissibility: rf.transmissibility !== undefined ? parseFloat(rf.transmissibility.toFixed(3)) : f.transmissibility !== undefined ? f.transmissibility : 1.0
        };
      }
      return f;
    });
    setFaults(newFaults);

    // 2. Snapshot the realization's EXACT solver params (the ref still holds
    //    the pre-load values until the next render, so build it explicitly).
    const loadedParams = {
      K: loadedK,
      porosity: loadedPor,
      cellCount,
      dipPercent: loadedDip,
      amplitude: loadedAmp,
      frequency,
      faultOffset,
      Q: loadedQ,
      injLocation: loadedInjLoc,
      injDuration,
      faultCount,
      parentDX: dx,
      faults: newFaults.map(f => ({
        ...f
      })),
      residualTrapFraction: loadedSgr
    };
    solverParamsRef.current = loadedParams;

    // 3. Replay the realization year-by-year so the ENTIRE timeline is
    //    scrubbable (previously only years 0 and 1000 existed, which left
    //    the seek slider, milestones, play and scrub dead after loading).
    let rH = new Array(cellCount).fill(0);
    let rHMax = new Array(cellCount).fill(0);
    let rMasses = {
      injected: 0,
      trapped: 0,
      mobile: 0,
      leaked: 0
    };
    const replayHistory = [{
      time: 0,
      h: [...rH],
      hMax: [...rHMax],
      masses: {
        ...rMasses
      },
      params: snapshotParams()
    }];
    const replayMassHistory = [{
      time: 0,
      ...rMasses
    }];
    for (let yr = 1; yr <= 1000; yr++) {
      const res = runSolverStep(rH, rHMax, rMasses, yr, loadedParams);
      rH = res.h;
      rHMax = res.hMax;
      rMasses = res.masses;
      replayHistory.push({
        time: yr,
        h: [...res.h],
        hMax: [...res.hMax],
        masses: {
          ...res.masses
        },
        params: snapshotParams()
      });
      if (yr % 5 === 0 || yr === 1) replayMassHistory.push({
        time: yr,
        ...res.masses
      });
    }
    setH(rH);
    setHMax(rHMax);
    setCurrentMasses(rMasses);
    setMassHistory(replayMassHistory);
    setSimTime(1000);
    setIsPlaying(false);
    setIsReversing(false);
    stateRef.current = {
      h: [...rH],
      hMax: [...rHMax],
      masses: {
        ...rMasses
      }
    };
    historyRef.current = replayHistory;
    setActiveSubTab('profile');
  };

  // SVG Histogram Renderer
  const renderUQHistogram = data => {
    const width = 450;
    const height = 200;
    const padding = {
      left: 40,
      right: 20,
      top: 20,
      bottom: 25
    };
    const getX = val => padding.left + (val - data.minVal) / data.range * (width - padding.left - padding.right);
    const getY = count => height - padding.bottom - count / data.maxBinCount * (height - padding.top - padding.bottom);
    return /*#__PURE__*/React.createElement("svg", {
      width: "100%",
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      style: {
        background: 'rgba(0,0,0,0.18)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.06)'
      }
    }, [0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
      const y = getY(data.maxBinCount * ratio);
      return /*#__PURE__*/React.createElement("line", {
        key: i,
        x1: padding.left,
        y1: y,
        x2: width - padding.right,
        y2: y,
        stroke: "rgba(255,255,255,0.05)",
        strokeWidth: "0.5",
        strokeDasharray: "3 3"
      });
    }), data.bins.map((count, idx) => {
      const valStart = data.minVal + idx * data.binWidth;
      const valEnd = valStart + data.binWidth;
      const x1 = getX(valStart);
      const x2 = getX(valEnd);
      const y = getY(count);
      const barWidth = Math.max(1, x2 - x1 - 1.5);
      const barHeight = Math.max(0, height - padding.bottom - y);
      return /*#__PURE__*/React.createElement("rect", {
        key: idx,
        x: x1,
        y: y,
        width: barWidth,
        height: barHeight,
        fill: "rgba(100, 255, 218, 0.22)",
        stroke: "rgba(100, 255, 218, 0.5)",
        strokeWidth: "1"
      });
    }), [{
      label: 'P10',
      val: data.p10Val,
      color: '#64ffda'
    }, {
      label: 'P50',
      val: data.p50Val,
      color: '#ffb300'
    }, {
      label: 'P90',
      val: data.p90Val,
      color: '#ff6b6b'
    }].map((p, i) => {
      const x = getX(p.val);
      return /*#__PURE__*/React.createElement("g", {
        key: i
      }, /*#__PURE__*/React.createElement("line", {
        x1: x,
        y1: padding.top,
        x2: x,
        y2: height - padding.bottom,
        stroke: p.color,
        strokeWidth: "1.5",
        strokeDasharray: "4 3"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: x,
        cy: padding.top,
        r: "3.5",
        fill: p.color
      }), /*#__PURE__*/React.createElement("text", {
        x: x,
        y: padding.top - 5,
        fill: p.color,
        fontSize: "8.5",
        fontWeight: "bold",
        textAnchor: "middle",
        fontFamily: "monospace"
      }, p.label));
    }), /*#__PURE__*/React.createElement("line", {
      x1: padding.left,
      y1: padding.top,
      x2: padding.left,
      y2: height - padding.bottom,
      stroke: "rgba(255,255,255,0.15)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("line", {
      x1: padding.left,
      y1: height - padding.bottom,
      x2: width - padding.right,
      y2: height - padding.bottom,
      stroke: "rgba(255,255,255,0.15)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("text", {
      x: padding.left,
      y: height - 8,
      fill: "rgba(255,255,255,0.4)",
      fontSize: "8.5",
      textAnchor: "start",
      fontFamily: "monospace"
    }, data.minVal.toFixed(1), uqTargetMetric === 'leaked' ? ' kt' : '%'), /*#__PURE__*/React.createElement("text", {
      x: width - padding.right,
      y: height - 8,
      fill: "rgba(255,255,255,0.4)",
      fontSize: "8.5",
      textAnchor: "end",
      fontFamily: "monospace"
    }, data.maxVal.toFixed(1), uqTargetMetric === 'leaked' ? ' kt' : '%'));
  };

  // SVG Sensitivity Tornado Renderer (height adapts to number of parameters)
  const renderUQSensitivity = data => {
    const width = 450;
    const padding = {
      left: 140,
      right: 30,
      top: 25,
      bottom: 20
    };
    const barHeight = 24;
    const gap = 16;
    const height = padding.top + padding.bottom + Math.max(1, data.length) * (barHeight + gap) - gap;
    const centerOffset = padding.left + (width - padding.left - padding.right) / 2;
    const halfPlotWidth = (width - padding.left - padding.right) / 2;
    const getX = r => centerOffset + r * halfPlotWidth;
    return /*#__PURE__*/React.createElement("svg", {
      width: "100%",
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      style: {
        background: 'rgba(0,0,0,0.18)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.06)'
      }
    }, [-1.0, -0.5, 0, 0.5, 1.0].map((tick, i) => {
      const x = getX(tick);
      return /*#__PURE__*/React.createElement("g", {
        key: i
      }, /*#__PURE__*/React.createElement("line", {
        x1: x,
        y1: padding.top - 5,
        x2: x,
        y2: height - padding.bottom,
        stroke: tick === 0 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.05)",
        strokeWidth: tick === 0 ? "1" : "0.5",
        strokeDasharray: tick === 0 ? "none" : "3 3"
      }), /*#__PURE__*/React.createElement("text", {
        x: x,
        y: padding.top - 12,
        fill: "rgba(255,255,255,0.35)",
        fontSize: "8",
        textAnchor: "middle",
        fontFamily: "monospace"
      }, tick > 0 ? `+${tick.toFixed(1)}` : tick.toFixed(1)));
    }), data.map((item, idx) => {
      const y = padding.top + idx * (barHeight + gap);
      const xStart = item.r >= 0 ? centerOffset : getX(item.r);
      const xEnd = item.r >= 0 ? getX(item.r) : centerOffset;
      const rectWidth = Math.max(1, xEnd - xStart);
      const color = item.r >= 0 ? '#64ffda' : '#ff6b6b';
      const fill = item.r >= 0 ? 'rgba(100, 255, 218, 0.25)' : 'rgba(255, 107, 107, 0.25)';
      return /*#__PURE__*/React.createElement("g", {
        key: idx
      }, /*#__PURE__*/React.createElement("text", {
        x: padding.left - 10,
        y: y + barHeight / 2 + 3,
        fill: "rgba(255,255,255,0.85)",
        fontSize: "9.5",
        textAnchor: "end",
        fontFamily: "sans-serif"
      }, item.label), /*#__PURE__*/React.createElement("rect", {
        x: xStart,
        y: y,
        width: rectWidth,
        height: barHeight,
        fill: fill,
        stroke: color,
        strokeWidth: "1",
        rx: "3"
      }), /*#__PURE__*/React.createElement("text", {
        x: item.r >= 0 ? xEnd + 6 : xStart - 6,
        y: y + barHeight / 2 + 3,
        fill: color,
        fontSize: "9",
        fontWeight: "bold",
        textAnchor: item.r >= 0 ? 'start' : 'end',
        fontFamily: "monospace"
      }, item.r.toFixed(2)));
    }), /*#__PURE__*/React.createElement("line", {
      x1: padding.left,
      y1: padding.top - 5,
      x2: padding.left,
      y2: height - padding.bottom,
      stroke: "rgba(255,255,255,0.1)",
      strokeWidth: "1"
    }));
  };

  // Solver implementation
  const runSolverStep = (currentH, currentHMax, masses, currentFrame, params) => {
    const {
      K,
      porosity,
      cellCount,
      Q,
      injLocation,
      injDuration,
      faultCount,
      faults,
      residualTrapFraction,
      parentDX
    } = params;
    const N = cellCount;
    const dx = parentDX || 1000.0 / N;
    let nextH = [...currentH];
    let nextHMax = [...currentHMax];
    let {
      injected,
      trapped,
      mobile,
      leaked
    } = masses;

    // 25 explicit substeps per model year for a stable educational animation
    const substeps = 25;
    const dt = 1.0 / substeps;

    // Physical coordinate depth array (scaled by 1/15)
    const zt = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      zt[i] = capRockY(i * dx + dx / 2.0, i, params) / 15.0;
    }

    // Run explicit finite volume integration substeps
    for (let step = 0; step < substeps; step++) {
      // 1. Partition total height into mobile and trapped components for each cell (VE physics)
      const hMob = new Array(N).fill(0);
      for (let i = 0; i < N; i++) {
        const H = nextH[i];
        const hm = nextHMax[i];
        const R = residualTrapFraction;
        const mobileVal = R < 1.0 ? Math.max(0, (H - R * hm) / (1.0 - R)) : 0;
        hMob[i] = Math.min(H, mobileVal);
      }

      // 2. Compute first-order upwind fluxes using only the mobile thickness
      const fluxes = new Array(N - 1).fill(0);
      for (let i = 0; i < N - 1; i++) {
        const zL = zt[i] + nextH[i];
        const zR = zt[i + 1] + nextH[i + 1];
        const grad = (zR - zL) / (dx / 5.0);
        const hFace = grad > 0 ? hMob[i + 1] : hMob[i];

        // Find if a fault is located at this grid boundary and apply its transmissibility multiplier
        let transMult = 1.0;
        for (let idx = 0; idx < faultCount; idx++) {
          const f = faults[idx];
          if (f) {
            const inter = getSimFaultIntersection(f, idx, params);
            const cellFaultIdx = Math.round(inter.x / dx);
            if (cellFaultIdx - 1 === i) {
              if (f.isSealed) {
                transMult = 0.0; // Infinite sealed barrier
              } else {
                transMult = f.transmissibility !== undefined ? f.transmissibility : 1.0;
              }
              break;
            }
          }
        }
        let rawFlux = -(K / porosity) * hFace * grad * 0.08 * transMult;

        // Practical flux cap: no more than 30% of upstream mobile height per substep
        if (rawFlux > 0) {
          rawFlux = Math.min(rawFlux, 0.30 * hMob[i] / dt);
        } else {
          rawFlux = Math.max(rawFlux, -(0.30 * hMob[i + 1]) / dt);
        }
        fluxes[i] = rawFlux;
      }

      // Ghost cells boundaries (zero far-field flux)
      const H_res = 175.0 / 15.0; // 11.667 m physical maximum thickness of reservoir sandstone bed
      const hTmp = [...nextH];
      for (let i = 0; i < N; i++) {
        const fL = i === 0 ? 0 : fluxes[i - 1];
        const fR = i === N - 1 ? 0 : fluxes[i];
        hTmp[i] = Math.max(0, Math.min(H_res, nextH[i] + dt * (fL - fR)));
      }

      // Injection: Smooth wellbore Gaussian kernel over adjacent cells to prevent point singularity
      const cellInjIdx = Math.floor(injLocation / 100.0 * N);
      if (Q > 0 && currentFrame <= injDuration) {
        const dVolInj = Q * dt;
        const kernel = [0.10, 0.20, 0.40, 0.20, 0.10];
        for (let offset = -2; offset <= 2; offset++) {
          const cIdx = Math.max(0, Math.min(N - 1, cellInjIdx + offset));
          hTmp[cIdx] = Math.min(H_res, hTmp[cIdx] + dVolInj * kernel[offset + 2] / (porosity * (dx / 5.0)));
        }
        injected += dVolInj;
      }

      // Fault Leaks: threshold-pressure/spill-height capillary barrier
      for (let idx = 0; idx < faultCount; idx++) {
        const f = faults[idx];
        if (!f.isSealed) {
          const inter = getSimFaultIntersection(f, idx, params);
          const cellFaultIdx = Math.round(inter.x / dx);
          const boundedIdx = Math.max(0, Math.min(N - 1, cellFaultIdx));

          // Leakage occurs only if CO2 column height H exceeds the threshold
          if (hTmp[boundedIdx] > f.thresholdHeight) {
            const overpressure = hTmp[boundedIdx] - f.thresholdHeight;
            const leakHeight = Math.min(overpressure, f.leakRate * dt * 0.8);
            hTmp[boundedIdx] -= leakHeight;
            leaked += leakHeight * porosity * (dx / 5.0);
          }
        }
      }
      nextH = hTmp.map(val => Math.max(0, Math.min(H_res, val)));
      for (let i = 0; i < N; i++) {
        if (nextH[i] > nextHMax[i]) nextHMax[i] = Math.min(H_res, nextH[i]);
      }
    }

    // Mass distribution calculation (Exact integral of fluid volume)
    let mobileSum = 0;
    let trappedSum = 0;
    for (let i = 0; i < N; i++) {
      const H = nextH[i];
      const hm = nextHMax[i];
      const R = residualTrapFraction;
      const mobileVal = R < 1.0 ? Math.max(0, (H - R * hm) / (1.0 - R)) : 0;
      const hMob = Math.min(H, mobileVal);
      const hTrap = Math.max(0, H - hMob);
      mobileSum += hMob * (dx / 5.0) * porosity;
      trappedSum += hTrap * (dx / 5.0) * porosity;
    }
    return {
      h: nextH,
      hMax: nextHMax,
      masses: {
        injected: parseFloat(injected.toFixed(2)),
        trapped: parseFloat(trappedSum.toFixed(2)),
        mobile: parseFloat(mobileSum.toFixed(2)),
        leaked: parseFloat(leaked.toFixed(2))
      }
    };
  };

  // --- NODE-BASED RIBBON BUILDER (Zero Sawteeth Guaranteed) ---
  const buildSmoothRibbon = (topElevationFn, botElevationFn, kStart, kEnd) => {
    if (kStart > kEnd) return "";
    let path = "";
    for (let k = kStart; k <= kEnd; k++) {
      const x = k * dx;
      const isFault = k > 0 && k < cellCount && Math.abs(capRockY(x, k - 1) - capRockY(x, k)) > 0.1;
      if (k === kStart) {
        const y0 = topElevationFn(k, isFault ? 'right' : 'avg');
        path = `M ${x} ${y0}`;
      } else if (isFault) {
        const yL = topElevationFn(k, 'left');
        const yR = topElevationFn(k, 'right');
        path += ` L ${x} ${yL} L ${x} ${yR}`;
      } else {
        const y = topElevationFn(k, 'avg');
        path += ` L ${x} ${y}`;
      }
    }
    for (let k = kEnd; k >= kStart; k--) {
      const x = k * dx;
      const isFault = k > 0 && k < cellCount && Math.abs(capRockY(x, k - 1) - capRockY(x, k)) > 0.1;
      if (isFault) {
        const yR = botElevationFn(k, 'right');
        const yL = botElevationFn(k, 'left');
        path += ` L ${x} ${yR} L ${x} ${yL}`;
      } else {
        const y = botElevationFn(k, 'avg');
        path += ` L ${x} ${y}`;
      }
    }
    path += " Z";
    return path;
  };
  const getSimNodeValue = (arr, k, side = 'avg') => {
    if (!arr) return 0;
    const N = arr.length;
    if (k <= 0) return arr[0];
    if (k >= N) return arr[N - 1];
    if (side === 'left') return arr[k - 1];
    if (side === 'right') return arr[k];
    return 0.5 * (arr[k - 1] + arr[k]);
  };

  // Helper to find the active continuous domain with sub-grid zero-tapered tip nodes
  const getSimActiveBounds = (nodeValueFn, N, eps = 0.001) => {
    let kFirst = -1,
      kLast = -1;
    for (let k = 0; k <= N; k++) {
      const val = nodeValueFn(k);
      if (val > eps) {
        if (kFirst === -1) kFirst = k;
        kLast = k;
      }
    }
    if (kFirst === -1) return null;
    const kStart = Math.max(0, kFirst - 1);
    const kEnd = Math.min(N, kLast + 1);
    return {
      kStart,
      kEnd
    };
  };

  // Swept Residual Trapping Footprint (hTrapped)
  // Fringe thickness modulated by entry pressure: higher P_e => thinner imbibe transition (Brooks-Corey)
  const getSweptResidualSimPath = () => {
    const N = cellCount;
    const scale = 15.0;
    const fringePx = hasCapillaryFringe ? fringeScale * 15.0 * 0.25 * (15.0 / entryPressure) : 0;
    const bounds = getSimActiveBounds(k => getSimNodeValue(hTrapped, k, 'avg'), N, 0.001);
    if (!bounds) return "";
    return buildSmoothRibbon((k, side) => capRockY(k * dx, side === 'left' ? k - 1 : k), (k, side) => {
      const yTop = capRockY(k * dx, side === 'left' ? k - 1 : k);
      const yBotMax = stratumY(k * dx, side === 'left' ? k - 1 : k, 175);
      const hTrp = getSimNodeValue(hTrapped, k, side);
      const f = fringePx * Math.min(1.0, hTrp * 1.5);
      return Math.min(yBotMax, yTop + hTrp * scale + f);
    }, bounds.kStart, bounds.kEnd);
  };

  // Active Flowing Mobile Plume (hMobile)
  const getActiveMobileSimPath = () => {
    const N = cellCount;
    const scale = 15.0;
    const fringePx = hasCapillaryFringe ? fringeScale * 15.0 * 0.35 * (15.0 / entryPressure) : 0;
    const bounds = getSimActiveBounds(k => getSimNodeValue(hMobile, k, 'avg'), N, 0.001);
    if (!bounds) return "";
    return buildSmoothRibbon((k, side) => capRockY(k * dx, side === 'left' ? k - 1 : k), (k, side) => {
      const yTop = capRockY(k * dx, side === 'left' ? k - 1 : k);
      const yBotMax = stratumY(k * dx, side === 'left' ? k - 1 : k, 175);
      const hMob = getSimNodeValue(hMobile, k, side);
      const f = fringePx * Math.min(1.0, hMob * 1.8);
      return Math.min(yBotMax, yTop + hMob * scale + f);
    }, bounds.kStart, bounds.kEnd);
  };

  // Maximum Historic Gas Saturation Boundary (hMax Swept Footprint Dashed Line)
  const getMaxHgLinePath = () => {
    const N = cellCount;
    const scale = 15.0;
    const bounds = getSimActiveBounds(k => getSimNodeValue(hMax, k, 'avg'), N, 0.001);
    if (!bounds) return "";
    let path = "";
    for (let k = bounds.kStart; k <= bounds.kEnd; k++) {
      const x = k * dx;
      const isFault = k > 0 && k < cellCount && Math.abs(capRockY(x, k - 1) - capRockY(x, k)) > 0.1;
      if (k === bounds.kStart) {
        const yTop = capRockY(x, isFault ? k : k);
        const yBotMax = stratumY(x, isFault ? k : k, 175);
        const y0 = Math.min(yBotMax, yTop + getSimNodeValue(hMax, k, isFault ? 'right' : 'avg') * scale);
        path = `M ${x} ${y0}`;
      } else if (isFault) {
        const yTopL = capRockY(x, k - 1);
        const yBotMaxL = stratumY(x, k - 1, 175);
        const yTopR = capRockY(x, k);
        const yBotMaxR = stratumY(x, k, 175);
        const yL = Math.min(yBotMaxL, yTopL + getSimNodeValue(hMax, k, 'left') * scale);
        const yR = Math.min(yBotMaxR, yTopR + getSimNodeValue(hMax, k, 'right') * scale);
        path += ` L ${x} ${yL} L ${x} ${yR}`;
      } else {
        const yTop = capRockY(x, k);
        const yBotMax = stratumY(x, k, 175);
        const y = Math.min(yBotMax, yTop + getSimNodeValue(hMax, k, 'avg') * scale);
        path += ` L ${x} ${y}`;
      }
    }
    return path;
  };

  // Build the three heavy plume geometry strings once per state/param change
  // instead of twice per render (they were previously invoked for both the
  // emptiness check and the path data on every tick).
  const plumePaths = useMemo(() => ({
    swept: getSweptResidualSimPath(),
    mobile: getActiveMobileSimPath(),
    maxEnv: getMaxHgLinePath()
  }), [hMobile, hTrapped, hMax, cellCount, dx, dipPercent, amplitude, frequency, faultOffset, faultCount, faults, hasCapillaryFringe, fringeScale, entryPressure]);

  // Reservoir Conformable Grid block columns
  const reservoirBlocks = useMemo(() => {
    const blocks = [];
    const N = cellCount;
    for (let i = 0; i < N; i++) {
      const x1 = i * dx;
      const x2 = (i + 1) * dx;
      const yt1 = capRockY(x1, i);
      const yt2 = capRockY(x2, i);
      const yb1 = stratumY(x1, i, 175);
      const yb2 = stratumY(x2, i, 175);

      // Permeability noise mapping for sandstone heterogeneity
      const permFactor = 0.5 + 0.5 * Math.sin(i * 12.7 + 1.1);
      const r = Math.floor(35 + permFactor * 14);
      const g = Math.floor(26 + permFactor * 10);
      const b = Math.floor(20 + permFactor * 6);
      const colFill = `rgb(${r}, ${g}, ${b})`;
      blocks.push({
        points: `${x1},${yt1} ${x2},${yt2} ${x2},${yb2} ${x1},${yb1}`,
        fill: colFill,
        x1,
        yt1,
        x2,
        yt2,
        yb1,
        yb2
      });
    }
    return blocks;
  }, [cellCount, dipPercent, amplitude, frequency, faultOffset, faultCount, faults]);

  // --- Dynamic SVG Chart Drawing ---
  const renderSVGChart = () => {
    const width = 450;
    const height = 210;
    const padding = {
      left: 45,
      right: 15,
      top: 15,
      bottom: 25
    };
    const maxVal = Math.max(10, Math.max(currentMasses.injected, currentMasses.mobile + currentMasses.trapped + currentMasses.leaked) * 1.08);

    // Scale helper
    const getX = t => padding.left + t / 1000.0 * (width - padding.left - padding.right);
    const getY = val => height - padding.bottom - val / maxVal * (height - padding.top - padding.bottom);
    let pathInj = "",
      pathTrap = "",
      pathMob = "",
      pathLeak = "";
    if (massHistory.length > 0) {
      pathInj = `M ${getX(massHistory[0].time)} ${getY(massHistory[0].injected)}`;
      pathTrap = `M ${getX(massHistory[0].time)} ${getY(massHistory[0].trapped)}`;
      pathMob = `M ${getX(massHistory[0].time)} ${getY(massHistory[0].mobile)}`;
      pathLeak = `M ${getX(massHistory[0].time)} ${getY(massHistory[0].leaked)}`;
      for (let idx = 1; idx < massHistory.length; idx++) {
        const pt = massHistory[idx];
        pathInj += ` L ${getX(pt.time)} ${getY(pt.injected)}`;
        pathTrap += ` L ${getX(pt.time)} ${getY(pt.trapped)}`;
        pathMob += ` L ${getX(pt.time)} ${getY(pt.mobile)}`;
        pathLeak += ` L ${getX(pt.time)} ${getY(pt.leaked)}`;
      }
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
        fontSize: 10.5,
        padding: '2px 4px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 2,
        background: '#ffffff',
        opacity: 0.6,
        borderTop: '1px dashed #fff'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.7)'
      }
    }, "Injected:"), /*#__PURE__*/React.createElement("strong", {
      style: {
        color: '#fff',
        fontFamily: 'monospace'
      }
    }, Math.round(currentMasses.injected), " kt")), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 2.5,
        background: '#64ffda'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.7)'
      }
    }, "Mobile:"), /*#__PURE__*/React.createElement("strong", {
      style: {
        color: '#64ffda',
        fontFamily: 'monospace'
      }
    }, Math.round(currentMasses.mobile), " kt")), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 2.5,
        background: '#3ca68e'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.7)'
      }
    }, "Trapped:"), /*#__PURE__*/React.createElement("strong", {
      style: {
        color: '#3ca68e',
        fontFamily: 'monospace'
      }
    }, Math.round(currentMasses.trapped), " kt")), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 2.5,
        background: '#ff6b6b'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.7)'
      }
    }, "Leaked:"), /*#__PURE__*/React.createElement("strong", {
      style: {
        color: '#ff6b6b',
        fontFamily: 'monospace'
      }
    }, Math.round(currentMasses.leaked), " kt"))), /*#__PURE__*/React.createElement("svg", {
      role: "img",
      "aria-labelledby": "mass-chart-title mass-chart-desc",
      width: "100%",
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      style: {
        background: 'rgba(0,0,0,0.18)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.06)'
      }
    }, /*#__PURE__*/React.createElement("title", {
      id: "mass-chart-title"
    }, "CO\u2082 mass balance through year ", simTime), /*#__PURE__*/React.createElement("desc", {
      id: "mass-chart-desc"
    }, "Line chart of injected, mobile, trapped, and leaked model mass over simulation time."), [0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
      const val = maxVal * ratio;
      const y = getY(val);
      return /*#__PURE__*/React.createElement("g", {
        key: i
      }, /*#__PURE__*/React.createElement("line", {
        x1: padding.left,
        y1: y,
        x2: width - padding.right,
        y2: y,
        stroke: "rgba(255,255,255,0.05)",
        strokeWidth: "0.5",
        strokeDasharray: "3 3"
      }), /*#__PURE__*/React.createElement("text", {
        x: padding.left - 8,
        y: y + 3,
        fill: "rgba(255,255,255,0.45)",
        fontSize: "8.5",
        textAnchor: "end",
        fontFamily: "monospace"
      }, Math.round(val)));
    }), [0, 200, 400, 600, 800, 1000].map((t, i) => {
      const x = getX(t);
      return /*#__PURE__*/React.createElement("text", {
        key: i,
        x: x,
        y: height - 8,
        fill: "rgba(255,255,255,0.45)",
        fontSize: "8.5",
        textAnchor: "middle",
        fontFamily: "monospace"
      }, t, "y");
    }), pathInj && /*#__PURE__*/React.createElement("path", {
      d: pathInj,
      fill: "none",
      stroke: "#ffffff",
      strokeWidth: "1.5",
      strokeDasharray: "3 3",
      opacity: "0.6"
    }), pathMob && /*#__PURE__*/React.createElement("path", {
      d: pathMob,
      fill: "none",
      stroke: "#64ffda",
      strokeWidth: "2",
      style: {
        filter: 'drop-shadow(0 0 2px rgba(100,255,218,0.4))'
      }
    }), pathTrap && /*#__PURE__*/React.createElement("path", {
      d: pathTrap,
      fill: "none",
      stroke: "#3ca68e",
      strokeWidth: "1.8"
    }), pathLeak && /*#__PURE__*/React.createElement("path", {
      d: pathLeak,
      fill: "none",
      stroke: "#ff6b6b",
      strokeWidth: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: getX(simTime),
      y1: padding.top,
      x2: getX(simTime),
      y2: height - padding.bottom,
      stroke: "#64ffda",
      strokeWidth: "1.2",
      strokeDasharray: "2 2",
      opacity: "0.8"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: getX(simTime),
      cy: padding.top,
      r: "3",
      fill: "#64ffda"
    }), /*#__PURE__*/React.createElement("line", {
      x1: padding.left,
      y1: padding.top,
      x2: padding.left,
      y2: height - padding.bottom,
      stroke: "rgba(255,255,255,0.15)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("line", {
      x1: padding.left,
      y1: height - padding.bottom,
      x2: width - padding.right,
      y2: height - padding.bottom,
      stroke: "rgba(255,255,255,0.15)",
      strokeWidth: "1"
    })), /*#__PURE__*/React.createElement("table", {
      className: "sr-only"
    }, /*#__PURE__*/React.createElement("caption", null, "Current CO\u2082 mass balance at year ", simTime), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Injected"), /*#__PURE__*/React.createElement("th", null, "Mobile"), /*#__PURE__*/React.createElement("th", null, "Trapped"), /*#__PURE__*/React.createElement("th", null, "Leaked"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, currentMasses.injected), /*#__PURE__*/React.createElement("td", null, currentMasses.mobile), /*#__PURE__*/React.createElement("td", null, currentMasses.trapped), /*#__PURE__*/React.createElement("td", null, currentMasses.leaked)))));
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "simulator-page-wrapper",
    style: {
      padding: '110px 4% 60px',
      minHeight: '100vh',
      background: '#130d1c',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: 25,
      transition: 'padding-left 0.3s ease-in-out',
      paddingLeft: sidebarOpen ? '360px' : '4%'
    }
  }, sidebarOpen && /*#__PURE__*/React.createElement("div", {
    className: "time-travel-sidebar open"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 15,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#64ffda',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-history",
    style: {
      fontSize: 14
    }
  }), " Timeline"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSidebarOpen(false),
    "aria-label": "Close timeline panel",
    style: {
      background: 'none',
      border: 'none',
      color: 'rgba(255,255,255,0.5)',
      cursor: 'pointer',
      fontSize: 16
    },
    title: "Close panel"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-times"
  }))), (() => {
    const isPast = simTime < historyRef.current.length - 1;
    const paramDiffs = sidebarOpen ? getParamDiff() : [];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 15
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: isPast ? 'rgba(255, 179, 0, 0.1)' : 'rgba(100, 255, 218, 0.1)',
        border: `1px solid ${isPast ? 'rgba(255, 179, 0, 0.3)' : 'rgba(100, 255, 218, 0.3)'}`,
        padding: '12px 14px',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 11,
        fontWeight: 'bold',
        color: isPast ? '#ffb300' : '#64ffda'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: isPast ? '#ffb300' : '#64ffda',
        boxShadow: `0 0 8px ${isPast ? '#ffb300' : '#64ffda'}`,
        animation: 'pulseFlare 1.5s infinite'
      }
    }), isPast ? `VIEWING PAST \u00B7 YEAR ${simTime}` : `SIMULATING \u00B7 YEAR ${simTime}`), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10.5,
        color: 'rgba(255,255,255,0.65)',
        lineHeight: 1.4
      }
    }, isPast ? `Viewing history at Year ${simTime}. Changes to sliders will configure a branch starting from this point.` : `Simulating in real-time. Drag the timeline scrub slider to travel back to previous years.`)), isPast && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: 12,
        borderRadius: 12
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        commitBranch();
        handlePlayToggle();
      },
      style: {
        background: '#0dfca2',
        border: 'none',
        color: '#000',
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: 11.5,
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transition: 'all 0.2s ease'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-code-branch"
    }), " Branch & Run (Yr ", simTime, ")"), /*#__PURE__*/React.createElement("button", {
      onClick: () => handleScrub(historyRef.current.length - 1),
      style: {
        background: 'none',
        border: '1px solid rgba(255,255,255,0.15)',
        color: 'rgba(255,255,255,0.8)',
        padding: '6px 12px',
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transition: 'all 0.2s ease'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-fast-forward"
    }), " Return to Present (Yr ", historyRef.current.length - 1, ")")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9.5,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        fontWeight: 'bold'
      }
    }, "Time Controls"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 6,
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.05)',
        padding: 8,
        borderRadius: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: stepBackward,
      "aria-label": "Step back 1 year",
      style: {
        background: 'none',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        opacity: simTime > 0 ? 0.8 : 0.3
      },
      disabled: simTime === 0,
      title: "Step Back 1 Year"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-step-backward",
      style: {
        fontSize: 10
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: handlePlayReverseToggle,
      "aria-label": isReversing ? 'Pause reverse playback' : 'Play backward',
      style: {
        background: 'none',
        border: 'none',
        color: isReversing ? '#ff6b6b' : '#64ffda',
        cursor: 'pointer'
      },
      title: isReversing ? "Pause" : "Play Reverse"
    }, /*#__PURE__*/React.createElement("i", {
      className: `fas ${isReversing ? 'fa-pause' : 'fa-play fa-flip-horizontal'}`,
      style: {
        fontSize: 11
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setIsPlaying(false);
        setIsReversing(false);
      },
      "aria-label": "Pause simulation",
      style: {
        background: 'none',
        border: 'none',
        color: !isPlaying && !isReversing ? '#ffb300' : '#fff',
        cursor: 'pointer'
      },
      title: "Pause"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-pause",
      style: {
        fontSize: 11
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: handlePlayToggle,
      "aria-label": isPlaying ? 'Pause simulation' : 'Play simulation forward',
      style: {
        background: 'none',
        border: 'none',
        color: isPlaying ? '#0dfca2' : '#64ffda',
        cursor: 'pointer'
      },
      title: isPlaying ? "Pause" : "Play Forward"
    }, /*#__PURE__*/React.createElement("i", {
      className: `fas ${isPlaying ? 'fa-pause' : 'fa-play'}`,
      style: {
        fontSize: 11
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: stepForward,
      "aria-label": "Step forward 1 year",
      style: {
        background: 'none',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        opacity: simTime < 1000 ? 0.8 : 0.3
      },
      disabled: simTime >= 1000,
      title: "Step Forward 1 Year"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-step-forward",
      style: {
        fontSize: 10
      }
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9.5,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        fontWeight: 'bold'
      }
    }, "Branch Parameters"), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 12,
        maxHeight: '220px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, paramDiffs.length > 0 ? paramDiffs.map((diff, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        fontSize: 10.5,
        borderBottom: i < paramDiffs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
        paddingBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.7)',
        fontWeight: 500
      }
    }, diff.label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'monospace'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#ff6b6b',
        textDecoration: 'line-through'
      }
    }, diff.original), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.4)'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-arrow-right",
      style: {
        fontSize: 8
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#0dfca2',
        fontWeight: 'bold'
      }
    }, diff.current)))) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        padding: '15px 0'
      }
    }, isPast ? 'Parameters match the original run. Tweak physical sliders below to define a new branch configuration.' : 'Simulating on main branch. Scroll down and modify parameters in real-time.'))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9.5,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        fontWeight: 'bold'
      }
    }, "Milestones"), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: '12px 14px',
        maxHeight: '220px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 19,
        top: 20,
        bottom: 20,
        width: 2,
        background: 'rgba(255,255,255,0.06)'
      }
    }), [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((m, idx) => {
      const maxSimulated = historyRef.current.length - 1;
      const isAvailable = m <= maxSimulated;
      const isCurrent = m === simTime;
      return /*#__PURE__*/React.createElement("button", {
        key: idx,
        onClick: () => isAvailable && handleScrub(m),
        disabled: !isAvailable,
        "aria-label": `Jump to year ${m}${isCurrent ? ' (current)' : ''}`,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '6px 0',
          background: 'none',
          border: 'none',
          color: 'inherit',
          font: 'inherit',
          textAlign: 'left',
          width: '100%',
          cursor: isAvailable ? 'pointer' : 'default',
          opacity: isAvailable ? 1 : 0.35
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: isCurrent ? '#0dfca2' : isAvailable ? '#3ca68e' : 'rgba(255,255,255,0.1)',
          border: `2px solid ${isCurrent ? '#fff' : 'transparent'}`,
          boxShadow: isCurrent ? '0 0 6px #0dfca2' : 'none',
          zIndex: 2,
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11.5,
          fontFamily: 'monospace',
          color: isCurrent ? '#0dfca2' : 'rgba(255,255,255,0.7)',
          fontWeight: isCurrent ? 'bold' : 'normal'
        }
      }, "Year ", m, " ", isCurrent && '\u2190'));
    }))));
  })()), /*#__PURE__*/React.createElement("style", null, `
        .simulator-layout {
          display: grid;
          grid-template-columns: 1.40fr 1fr;
          gap: 25px;
          align-items: start;
          min-width: 0;
        }
        .simulator-layout > *, .controls-subgrid > * { min-width: 0; }
        .sr-only { position: absolute !important; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        .controls-subgrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .time-travel-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 330px;
          background: linear-gradient(135deg, rgba(25, 18, 38, 0.96) 0%, rgba(16, 20, 38, 0.96) 100%);
          border-right: 1px solid rgba(100, 255, 218, 0.18);
          box-shadow: 8px 0 32px rgba(0,0,0,0.5);
          backdrop-filter: blur(15px);
          z-index: 1000;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          padding: 100px 22px 30px;
        }
        .time-travel-sidebar.closed {
          transform: translateX(-100%);
        }
        .time-travel-sidebar.open {
          transform: translateX(0);
        }
        @media (max-width: 1100px) {
          .simulator-layout {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .simulator-page-wrapper {
            padding: 94px 12px 40px !important;
            max-width: 100vw;
            overflow: hidden;
          }
          .controls-subgrid {
            grid-template-columns: 1fr;
          }
          .simulator-page-wrapper {
            padding-left: 4% !important;
          }
          .time-travel-sidebar {
            width: min(330px, 92vw);
            padding-top: 90px;
          }
          .sim-title-row { align-items: stretch !important; }
          .sim-title-row { order: 1; }
          .simulator-layout { order: 2; }
          .sim-evidence-grid { order: 3; }
          .sim-tab-header { overflow-x: auto; align-items: stretch !important; }
          .sim-tab-header [role="tablist"] { min-width: max-content; }
          .sim-tab-status { display: none; }
          .sim-hud-legend { max-width: calc(100% - 16px); overflow-x: auto; right: 8px !important; top: 8px !important; white-space: nowrap; }
          .sim-playback { left: 8px !important; right: 8px !important; gap: 7px !important; padding: 8px 10px !important; }
          .sim-playback input[type="range"] { min-width: 48px; }
          .sim-evidence-grid, .uq-config-grid, .uq-results-grid, .uq-percentile-grid { grid-template-columns: 1fr !important; }
          .sim-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .control-panel > summary { cursor: pointer; }
        }
      `), /*#__PURE__*/React.createElement("div", {
    className: "sim-title-row",
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: '0.20em',
      textTransform: 'uppercase',
      color: '#64ffda',
      fontWeight: 600,
      marginBottom: 6
    }
  }, "Interactive Numerical Simulator"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'clamp(28px, 4vw, 38px)',
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: 15,
      flexWrap: 'wrap'
    }
  }, "VE Gravity Tongue Simulator", /*#__PURE__*/React.createElement("button", {
    onClick: () => setSidebarOpen(!sidebarOpen),
    style: {
      background: sidebarOpen ? 'rgba(100, 255, 218, 0.25)' : 'rgba(100, 255, 218, 0.1)',
      border: `1px solid ${sidebarOpen ? '#64ffda' : 'rgba(100, 255, 218, 0.3)'}`,
      color: '#64ffda',
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '11px',
      cursor: 'pointer',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      transition: 'all 0.2s ease'
    },
    title: "Toggle timeline sidebar"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-history"
  }), " ", sidebarOpen ? 'Close Timeline' : 'Timeline')), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      color: 'rgba(255,255,255,0.65)',
      fontSize: 13.5,
      maxWidth: 680
    }
  }, "Explore an educational finite-volume Vertical Equilibrium model. Adjust caprock structure, rock properties, injection, and simplified fault behavior in real time."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 9,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: copyScenarioLink,
    style: {
      background: '#64ffda',
      color: '#10251f',
      border: 0,
      borderRadius: 8,
      padding: '8px 12px',
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-link"
  }), " Copy Scenario Link"), /*#__PURE__*/React.createElement("button", {
    onClick: exportCsv,
    style: {
      background: 'rgba(255,255,255,0.08)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.18)',
      borderRadius: 8,
      padding: '8px 12px',
      cursor: 'pointer'
    }
  }, "Export CSV"), /*#__PURE__*/React.createElement("button", {
    onClick: exportSvg,
    style: {
      background: 'rgba(255,255,255,0.08)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.18)',
      borderRadius: 8,
      padding: '8px 12px',
      cursor: 'pointer'
    }
  }, "Export SVG"), /*#__PURE__*/React.createElement("a", {
    href: "mailto:st4014@hw.ac.uk?subject=VE%20simulator%20enquiry",
    style: {
      color: '#64ffda',
      padding: '8px 4px'
    }
  }, "Contact the researcher"), /*#__PURE__*/React.createElement("span", {
    role: "status",
    "aria-live": "polite",
    style: {
      color: '#64ffda',
      fontSize: 12,
      alignSelf: 'center'
    }
  }, shareStatus))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      padding: '10px 14px',
      borderRadius: 14,
      backdropFilter: 'blur(8px)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9.5,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.5)',
      fontWeight: 600
    }
  }, "Synthetic Reservoir Cases"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, [{
    id: 'default',
    label: 'Default Case',
    icon: 'fa-project-diagram'
  }, {
    id: 'dome',
    label: 'Anticline Dome',
    icon: 'fa-mountain'
  }, {
    id: 'faulted',
    label: 'Faulted Trap',
    icon: 'fa-bolt'
  }, {
    id: 'monocline',
    label: 'Dipping Layer',
    icon: 'fa-sliders'
  }].map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    onClick: () => applyPreset(p.id),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: 'azure',
      padding: '6px 12px',
      borderRadius: 8,
      fontSize: 11.5,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${p.icon}`,
    style: {
      fontSize: 9.5,
      color: '#64ffda'
    }
  }), " ", p.label))))), /*#__PURE__*/React.createElement("div", {
    className: "sim-evidence-grid",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 10
    }
  }, [['Problem', 'Full-field CO₂ storage forecasts can be computationally expensive.'], ['Method', 'Vertical integration represents large-scale migration through plume height.'], ['Evidence', 'The research model is benchmarked against higher-resolution compositional cases.'], ['Impact', 'Fast screening supports uncertainty analysis and scenario comparison.']].map(([label, body]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      padding: 12,
      borderRadius: 12,
      background: 'rgba(255,255,255,0.035)',
      border: '1px solid rgba(255,255,255,0.07)',
      fontSize: 11.5,
      lineHeight: 1.45
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      display: 'block',
      color: '#64ffda',
      marginBottom: 4
    }
  }, label), body)), /*#__PURE__*/React.createElement("a", {
    href: "https://doi.org/10.31223/X5P49D",
    target: "_blank",
    rel: "noreferrer",
    style: {
      gridColumn: '1 / -1',
      color: '#64ffda',
      fontSize: 12
    }
  }, "Read the associated EarthArXiv preprint ", /*#__PURE__*/React.createElement("i", {
    className: "fas fa-external-link-alt"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "simulator-layout"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sim-reservoir-card",
    style: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      border: '1px solid rgba(100,255,218,0.18)',
      borderRadius: 20,
      boxShadow: '0 8px 32px rgba(0,0,0,0.30)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 450,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sim-tab-header",
    style: {
      padding: '0 10px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(0,0,0,0.15)',
      minHeight: '48px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    },
    role: "tablist",
    "aria-label": "Simulator views",
    onKeyDown: handleTabKeys
  }, /*#__PURE__*/React.createElement("button", {
    ref: el => {
      tabRefs.current.profile = el;
    },
    onClick: () => setActiveSubTab('profile'),
    role: "tab",
    id: "tab-profile",
    "aria-selected": activeSubTab === 'profile',
    "aria-controls": "tabpanel-profile",
    tabIndex: activeSubTab === 'profile' ? 0 : -1,
    style: {
      background: activeSubTab === 'profile' ? 'rgba(100, 255, 218, 0.08)' : 'none',
      border: 'none',
      borderBottom: activeSubTab === 'profile' ? '2px solid #64ffda' : '2px solid transparent',
      color: activeSubTab === 'profile' ? '#64ffda' : 'rgba(255,255,255,0.6)',
      padding: '12px 16px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-project-diagram",
    style: {
      marginRight: 6
    }
  }), " 2D Simulator"), /*#__PURE__*/React.createElement("button", {
    ref: el => {
      tabRefs.current.uq = el;
    },
    onClick: () => setActiveSubTab('uq'),
    role: "tab",
    id: "tab-uq",
    "aria-selected": activeSubTab === 'uq',
    "aria-controls": "tabpanel-uq",
    tabIndex: activeSubTab === 'uq' ? 0 : -1,
    style: {
      background: activeSubTab === 'uq' ? 'rgba(100, 255, 218, 0.08)' : 'none',
      border: 'none',
      borderBottom: activeSubTab === 'uq' ? '2px solid #64ffda' : '2px solid transparent',
      color: activeSubTab === 'uq' ? '#64ffda' : 'rgba(255,255,255,0.6)',
      padding: '12px 16px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-chart-bar",
    style: {
      marginRight: 6
    }
  }), " Sensitivity & UQ"), /*#__PURE__*/React.createElement("button", {
    ref: el => {
      tabRefs.current.guide = el;
    },
    onClick: () => setActiveSubTab('guide'),
    role: "tab",
    id: "tab-guide",
    "aria-selected": activeSubTab === 'guide',
    "aria-controls": "tabpanel-guide",
    tabIndex: activeSubTab === 'guide' ? 0 : -1,
    style: {
      background: activeSubTab === 'guide' ? 'rgba(100, 255, 218, 0.08)' : 'none',
      border: 'none',
      borderBottom: activeSubTab === 'guide' ? '2px solid #64ffda' : '2px solid transparent',
      color: activeSubTab === 'guide' ? '#64ffda' : 'rgba(255,255,255,0.6)',
      padding: '12px 16px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-book",
    style: {
      marginRight: 6
    }
  }), " PDE Methodology Guide")), /*#__PURE__*/React.createElement("div", {
    className: "sim-tab-status",
    style: {
      paddingRight: 8
    }
  }, activeSubTab === 'profile' ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: 'rgba(255,255,255,0.5)'
    }
  }, "Year ", simTime, " / 1000") : activeSubTab === 'uq' ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: 'rgba(255,255,255,0.5)'
    }
  }, "Monte Carlo Analysis") : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: 'rgba(255,255,255,0.5)'
    }
  }, "Methodology Guide"))), (() => {
    if (activeSubTab === 'profile') {
      return /*#__PURE__*/React.createElement("div", {
        id: "tabpanel-profile",
        role: "tabpanel",
        "aria-labelledby": "tab-profile",
        style: {
          flex: 1,
          position: 'relative',
          display: 'flex',
          background: '#1c1626'
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "sim-hud-legend",
        style: {
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          background: 'rgba(0,0,0,0.50)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '5px 12px',
          fontSize: 10,
          color: 'rgba(255,255,255,0.85)',
          zIndex: 5,
          pointerEvents: 'none'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: 2,
          background: '#0dfca2'
        }
      }), " Mobile CO\u2082 (S_g \u2192 0.90)"), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: 2,
          background: '#20c997',
          border: '1px solid #1a8e8f'
        }
      }), " Trapped Gas (S_gr \u2248 0.25)"), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 14,
          height: 0,
          borderTop: '2px dashed #64ffda'
        }
      }), " Max Envelope (h_max)"), hasCapillaryFringe && /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: 2,
          background: 'linear-gradient(180deg, #20c997, #1a8e8f, #0a2a4d)',
          border: '1px solid #20c997'
        }
      }), " Capillary Fringe"), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: 2,
          background: '#0a2a4d'
        }
      }), " Brine (S_w = 1.0)")), /*#__PURE__*/React.createElement("svg", {
        ref: reservoirSvgRef,
        role: "img",
        "aria-labelledby": "reservoir-title reservoir-desc",
        viewBox: "0 0 1000 450",
        preserveAspectRatio: "none",
        style: {
          width: '100%',
          height: '100%',
          pointerEvents: 'auto'
        }
      }, /*#__PURE__*/React.createElement("title", {
        id: "reservoir-title"
      }, "CO\u2082 plume migration cross-section at year ", simTime), /*#__PURE__*/React.createElement("desc", {
        id: "reservoir-desc"
      }, "Educational reservoir cross-section showing caprock, brine, mobile and trapped CO\u2082, injection well, and ", faultCount, " active faults."), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
        id: "caprock-clipper"
      }, /*#__PURE__*/React.createElement("path", {
        d: `M 0 ${reservoirBlocks[0] ? reservoirBlocks[0].yt1 : capRockY(0)} ` + reservoirBlocks.map(b => `L ${b.x2} ${b.yt2}`).join(" ") + ` L 1000 ${stratumY(1000, cellCount - 1, 175)} ` + Array.from({
          length: cellCount + 1
        }, (_, idx) => {
          const k = cellCount - idx;
          const x = k * dx;
          return `L ${x} ${stratumY(x, Math.max(0, k - 1), 175)}`;
        }).join(" ") + ` Z`
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "plume-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#0dfca2",
        stopOpacity: "0.95"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "40%",
        stopColor: "#05e67c",
        stopOpacity: "0.85"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#05ab5e",
        stopOpacity: "0.75"
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "trapped-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#0b7a61",
        stopOpacity: "0.85"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#034d3c",
        stopOpacity: "0.75"
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "active-mobile-sim-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#0dfca2",
        stopOpacity: "0.98"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "45%",
        stopColor: "#0dfca2",
        stopOpacity: "0.95"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "70%",
        stopColor: "#05e67c",
        stopOpacity: "0.92"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "88%",
        stopColor: "#20c997",
        stopOpacity: "0.90"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#1a8e8f",
        stopOpacity: "0.85"
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "residual-trapped-sim-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#20c997",
        stopOpacity: "0.85"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "40%",
        stopColor: "#20c997",
        stopOpacity: "0.75"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "75%",
        stopColor: "#1a8e8f",
        stopOpacity: "0.65"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "92%",
        stopColor: "#125672",
        stopOpacity: "0.45"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#0a2a4d",
        stopOpacity: "0.25"
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "fringe-sim-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#20c997",
        stopOpacity: "0.80"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "50%",
        stopColor: "#1a8e8f",
        stopOpacity: "0.60"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "85%",
        stopColor: "#125672",
        stopOpacity: "0.35"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#0a2a4d",
        stopOpacity: "0.10"
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "brine-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#0a2a4d",
        stopOpacity: "0.85"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#051426",
        stopOpacity: "0.95"
      }))), /*#__PURE__*/React.createElement("path", {
        d: `M 0 0 L 1000 0 L 1000 ${capRockY(1000, cellCount - 1)} ` + Array.from({
          length: cellCount + 1
        }, (_, idx) => {
          const k = cellCount - idx;
          const x = k * dx;
          return `L ${x} ${capRockY(x, Math.max(0, k - 1))}`;
        }).join(" ") + ` Z`,
        fill: "#282030",
        stroke: "rgba(255,255,255,0.02)"
      }), reservoirBlocks.map((b, idx) => /*#__PURE__*/React.createElement("polygon", {
        key: idx,
        points: b.points,
        fill: b.fill,
        stroke: "rgba(0,0,0,0.06)",
        strokeWidth: "0.5"
      })), /*#__PURE__*/React.createElement("path", {
        d: `M 0 ${reservoirBlocks[0] ? reservoirBlocks[0].yt1 : capRockY(0)} ` + reservoirBlocks.map(b => `L ${b.x2} ${b.yt2}`).join(" ") + ` L 1000 ${stratumY(1000, cellCount - 1, 175)} ` + Array.from({
          length: cellCount + 1
        }, (_, idx) => {
          const k = cellCount - idx;
          const x = k * dx;
          return `L ${x} ${stratumY(x, Math.max(0, k - 1), 175)}`;
        }).join(" ") + ` Z`,
        fill: "url(#brine-grad)",
        opacity: "0.88"
      }), (() => {
        const cellInjIdx = Math.floor(injLocation / 100.0 * cellCount);
        const b = reservoirBlocks[cellInjIdx];
        if (!b) return null;
        return /*#__PURE__*/React.createElement("rect", {
          x: b.x1 + dx / 2.0 - 2,
          y: b.yt1,
          width: "4",
          height: b.yb1 - b.yt1,
          fill: "rgba(255,255,255,0.2)"
        });
      })(), /*#__PURE__*/React.createElement("g", {
        clipPath: "url(#caprock-clipper)"
      }, plumePaths.swept && /*#__PURE__*/React.createElement("path", {
        d: plumePaths.swept,
        fill: "url(#residual-trapped-sim-grad)",
        opacity: "0.92"
      }), plumePaths.mobile && /*#__PURE__*/React.createElement("path", {
        d: plumePaths.mobile,
        fill: "url(#active-mobile-sim-grad)",
        opacity: "0.98"
      }), plumePaths.maxEnv && /*#__PURE__*/React.createElement("path", {
        d: plumePaths.maxEnv,
        fill: "none",
        stroke: "#64ffda",
        strokeWidth: "1.4",
        strokeDasharray: "5 3.5",
        opacity: "0.85"
      })), /*#__PURE__*/React.createElement("path", {
        d: `M 0 ${stratumY(0, 0, 175)} ` + Array.from({
          length: cellCount + 1
        }, (_, idx) => {
          const x = idx * dx;
          return `L ${x} ${stratumY(x, Math.min(cellCount - 1, idx), 175)}`;
        }).join(" "),
        stroke: "rgba(0,0,0,0.3)",
        strokeWidth: "1",
        fill: "none"
      }), (() => {
        const cellInjIdx = Math.floor(injLocation / 100.0 * cellCount);
        const xWell = cellInjIdx * dx + dx / 2.0;
        const yCap = capRockY(xWell);
        return /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
          x1: xWell,
          y1: "0",
          x2: xWell,
          y2: yCap + 120,
          stroke: "url(#well-gradient)",
          strokeWidth: "4"
        }), Q > 0 && isPlaying && simTime <= injDuration && [0, 0.3, 0.6, 0.9].map((delay, idx) => /*#__PURE__*/React.createElement("circle", {
          key: idx,
          cx: xWell,
          cy: yCap * (idx / 4.0),
          r: "2",
          fill: "#0dfca2",
          style: {
            animation: `streakRise 1.5s linear ${delay}s infinite`
          }
        })));
      })(), Array.from({
        length: faultCount
      }).map((_, idx) => {
        const f = faults[idx];
        const inter = getSimFaultIntersection(f, idx);
        const color = f.isSealed ? '#64ffda' : '#ff6b6b';
        const yStart = 0;
        const yEnd = 450;
        const xStart = inter.x0 + inter.slope * yStart;
        const xEnd = inter.x0 + inter.slope * yEnd;
        return /*#__PURE__*/React.createElement("g", {
          key: idx
        }, /*#__PURE__*/React.createElement("line", {
          x1: xStart,
          y1: yStart,
          x2: xEnd,
          y2: yEnd,
          stroke: color,
          strokeWidth: "1.2",
          strokeDasharray: "3 3",
          opacity: "0.6"
        }));
      }), Array.from({
        length: faultCount
      }).map((_, idx) => {
        const f = faults[idx];
        if (f.isSealed) return null;
        const inter = getSimFaultIntersection(f, idx);
        const cellIdx = Math.round(cellCount * (inter.x / 1000.0));
        const boundedIdx = Math.max(0, Math.min(cellCount - 1, cellIdx));

        // Flow activates ONLY when total plume height exceeds spill threshold height
        if (h[boundedIdx] > f.thresholdHeight) {
          const travelY = -65; // Traverses through the overlying seal
          const travelX = inter.slope * travelY;
          const xTop = inter.x + travelX;
          const yTop = inter.y + travelY;
          return /*#__PURE__*/React.createElement("g", {
            key: `fl-group-${idx}`
          }, /*#__PURE__*/React.createElement("line", {
            x1: inter.x,
            y1: inter.y,
            x2: xTop,
            y2: yTop,
            stroke: "#ff6b6b",
            strokeWidth: "1.5",
            strokeDasharray: "4 3",
            opacity: "0.8",
            style: {
              animation: 'conduitFlow 1s linear infinite'
            }
          }), [0, 0.6, 1.2, 1.8].map((delay, i) => /*#__PURE__*/React.createElement("circle", {
            key: `fl-${idx}-${i}`,
            cx: inter.x,
            cy: inter.y,
            r: "1.6",
            fill: "#ff6b6b",
            style: {
              opacity: 0,
              '--travel-x': `${travelX}px`,
              '--travel-y': `${travelY}px`,
              animation: 'faultRiseTilted 2.0s cubic-bezier(0.25, 0.46, 0.45, 0.94) ' + delay + 's infinite'
            }
          })));
        }
        return null;
      }), /*#__PURE__*/React.createElement("text", {
        x: "30",
        y: capRockY(30) - 10,
        fill: "rgba(255,255,255,0.4)",
        fontSize: "9",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontFamily: "monospace"
      }, "Caprock Seal"), /*#__PURE__*/React.createElement("text", {
        x: "30",
        y: capRockY(30) + 80,
        fill: "rgba(255,255,255,0.4)",
        fontSize: "9",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontFamily: "monospace"
      }, "Sandstone Aquifer"), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
        id: "well-gradient",
        x1: "0",
        y1: "0",
        x2: "1",
        y2: "0"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#222"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "50%",
        stopColor: "#ccc"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#222"
      })))), /*#__PURE__*/React.createElement("div", {
        className: "sim-playback",
        style: {
          position: 'absolute',
          bottom: 15,
          left: '5%',
          right: '5%',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '8px 18px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '30px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          zIndex: 10
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: handlePlayReverseToggle,
        "aria-label": isReversing ? 'Pause reverse playback' : 'Play backward',
        style: {
          background: 'none',
          border: 'none',
          color: isReversing ? '#ff6b6b' : '#64ffda',
          cursor: 'pointer',
          outline: 'none'
        },
        title: isReversing ? "Pause Reverse" : "Reverse Play"
      }, /*#__PURE__*/React.createElement("i", {
        className: `fas ${isReversing ? 'fa-pause' : 'fa-play fa-flip-horizontal'}`,
        style: {
          fontSize: 13
        }
      })), /*#__PURE__*/React.createElement("button", {
        onClick: handlePlayToggle,
        "aria-label": isPlaying ? 'Pause simulation' : 'Play simulation forward',
        style: {
          background: 'none',
          border: 'none',
          color: isPlaying ? '#0dfca2' : '#64ffda',
          cursor: 'pointer',
          outline: 'none'
        },
        title: isPlaying ? "Pause" : "Play Forward"
      }, /*#__PURE__*/React.createElement("i", {
        className: `fas ${isPlaying ? 'fa-pause' : 'fa-play'}`,
        style: {
          fontSize: 13
        }
      })), /*#__PURE__*/React.createElement("button", {
        onClick: stepBackward,
        "aria-label": "Step 1 year backward",
        style: {
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          outline: 'none'
        },
        title: "Step 1 Year Backward"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-step-backward",
        style: {
          fontSize: 10
        }
      })), /*#__PURE__*/React.createElement("button", {
        onClick: stepForward,
        "aria-label": "Step 1 year forward",
        style: {
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          outline: 'none'
        },
        title: "Step 1 Year Forward"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-step-forward",
        style: {
          fontSize: 10
        }
      })), /*#__PURE__*/React.createElement("button", {
        onClick: resetSimulation,
        "aria-label": "Reset simulation",
        style: {
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          outline: 'none'
        },
        title: "Reset Simulation"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-redo",
        style: {
          fontSize: 11
        }
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 1,
          height: 14,
          background: 'rgba(255,255,255,0.2)'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10.5,
          fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.7)',
          minWidth: 50
        }
      }, "Yr ", simTime), /*#__PURE__*/React.createElement("input", {
        type: "range",
        min: "0",
        max: Math.max(1, historyRef.current.length - 1),
        value: simTime,
        "aria-label": "Seek simulation year",
        onChange: e => handleScrub(parseInt(e.target.value)),
        style: {
          flex: 1,
          height: 3,
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 2,
          outline: 'none',
          cursor: 'pointer',
          accentColor: '#64ffda'
        },
        title: "Drag to seek/reverse simulation time"
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 1,
          height: 14,
          background: 'rgba(255,255,255,0.2)'
        }
      }), /*#__PURE__*/React.createElement("button", {
        onClick: () => setSpeed(s => s === 1 ? 2 : s === 2 ? 4 : 1),
        style: {
          background: 'none',
          border: 'none',
          color: '#64ffda',
          cursor: 'pointer',
          fontSize: 10,
          fontWeight: 'bold',
          outline: 'none'
        }
      }, speed, "x")));
    } else if (activeSubTab === 'uq') {
      return (
        /*#__PURE__*/
        /* Sensitivity & UQ Dashboard UI panel */
        React.createElement("div", {
          id: "tabpanel-uq",
          role: "tabpanel",
          "aria-labelledby": "tab-uq",
          tabIndex: 0,
          style: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: '#1c1626',
            padding: '20px 25px',
            gap: 20,
            overflowY: 'auto',
            minHeight: 450
          }
        }, /*#__PURE__*/React.createElement("div", {
          className: "uq-config-grid",
          style: {
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1fr',
            gap: 20,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 14,
            padding: 16
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            minWidth: 0
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }
        }, "Uncertainty Parameters"), /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 9,
            color: 'rgba(255,255,255,0.3)',
            marginTop: -6
          }
        }, "Select parameters, then pick an absolute range, a \xB1% band, or discrete values."), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            maxHeight: 340,
            overflowY: 'auto',
            paddingRight: 4
          }
        }, UQ_PARAM_DEFS.filter(def => !(def.group === 'fault' && faultCount === 0)).filter(def => !(def.key === 'faultLeakRate' && !faults.slice(0, faultCount).some(f => !f.isSealed))).map(def => /*#__PURE__*/React.createElement(UQParamConfig, {
          key: def.key,
          def: def,
          cfg: uqParams[def.key],
          onChange: patch => updateUqParam(def.key, patch)
        })))), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }
        }, "Simulation Settings"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10.5,
            color: 'rgba(255,255,255,0.7)'
          }
        }, "Monte Carlo Realizations:"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            gap: 4,
            marginTop: 2
          }
        }, [25, 50, 100].map(cnt => /*#__PURE__*/React.createElement("button", {
          key: cnt,
          onClick: () => setMcRunsCount(cnt),
          style: {
            background: mcRunsCount === cnt ? 'rgba(100,255,218,0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${mcRunsCount === cnt ? '#64ffda' : 'rgba(255,255,255,0.12)'}`,
            color: mcRunsCount === cnt ? '#64ffda' : 'azure',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 10.5,
            fontWeight: 'bold',
            cursor: 'pointer',
            outline: 'none'
          }
        }, cnt, " runs")))), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10.5,
            color: 'rgba(255,255,255,0.7)'
          }
        }, "Target Storage Metric:"), /*#__PURE__*/React.createElement("select", {
          value: uqTargetMetric,
          onChange: e => setUqTargetMetric(e.target.value),
          "aria-label": "Target storage metric",
          style: {
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: 8,
            fontSize: 11,
            cursor: 'pointer',
            outline: 'none'
          }
        }, /*#__PURE__*/React.createElement("option", {
          value: "leaked"
        }, "CO\\u2082 Leakage Mass (ktonnes)"), /*#__PURE__*/React.createElement("option", {
          value: "trapped"
        }, "Residual Trapping Efficiency (%)")))), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10
          }
        }, /*#__PURE__*/React.createElement("button", {
          onClick: runMonteCarloBatch,
          disabled: uqRunning,
          style: {
            background: uqRunning ? 'rgba(255,255,255,0.05)' : '#64ffda',
            border: 'none',
            color: uqRunning ? 'rgba(255,255,255,0.3)' : '#000',
            padding: '12px 20px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 'bold',
            cursor: uqRunning ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: uqRunning ? 'none' : '0 4px 15px rgba(100,255,218,0.25)',
            transition: 'all 0.2s ease',
            width: '100%',
            justifyContent: 'center'
          }
        }, uqRunning ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
          className: "fas fa-spinner fa-spin"
        }), " Simulating...") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
          className: "fas fa-play"
        }), " Run Uncertainty Analysis")), uqRunning && /*#__PURE__*/React.createElement("div", {
          style: {
            width: '100%',
            marginTop: 4
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 9.5,
            color: 'rgba(255,255,255,0.6)',
            marginBottom: 3
          }
        }, /*#__PURE__*/React.createElement("span", null, "Running Batch"), /*#__PURE__*/React.createElement("span", null, uqProgress, "%")), /*#__PURE__*/React.createElement("div", {
          style: {
            height: 4,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            overflow: 'hidden'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            width: `${uqProgress}%`,
            height: '100%',
            background: '#64ffda',
            transition: 'width 0.1s ease'
          }
        }))))), uqData ? /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 15
          }
        }, /*#__PURE__*/React.createElement("div", {
          className: "uq-results-grid",
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 15
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }
        }, "Uncertainty Distribution (", uqTargetMetric === 'leaked' ? 'CO\u2082 Leaked Mass' : 'Trapping Efficiency', ")"), renderUQHistogram(uqData)), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }
        }, "Parameter Correlation Coefficients (Pearson r)"), sensitivityData && sensitivityData.length > 0 ? renderUQSensitivity(sensitivityData) : /*#__PURE__*/React.createElement("div", {
          style: {
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.18)',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: 10.5,
            color: 'rgba(255,255,255,0.4)',
            textAlign: 'center',
            padding: 16
          }
        }, "No parameters were varied in this batch.", /*#__PURE__*/React.createElement("br", null), "Enable at least one uncertainty parameter and re-run."))), /*#__PURE__*/React.createElement("div", {
          style: {
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 14,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10.5,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }
        }, "P10 / P50 / P90 Outcomes"), /*#__PURE__*/React.createElement("div", {
          className: "uq-percentile-grid",
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 10
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: 'rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: 10,
            padding: '10px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 9.5,
            color: '#64ffda',
            fontWeight: 'bold'
          }
        }, "P10 \xB7 ", uqTargetMetric === 'leaked' ? 'optimistic' : 'conservative'), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 13,
            fontWeight: 'bold',
            fontFamily: 'monospace',
            marginTop: 2
          }
        }, uqData.p10Val.toFixed(1), uqTargetMetric === 'leaked' ? ' kt' : '%')), /*#__PURE__*/React.createElement("button", {
          onClick: () => loadUQRealization(uqData.p10Realization),
          style: {
            background: 'rgba(100,255,218,0.1)',
            border: '1px solid rgba(100,255,218,0.3)',
            color: '#64ffda',
            padding: '6px 10px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none'
          }
        }, "Load Model")), /*#__PURE__*/React.createElement("div", {
          style: {
            background: 'rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: 10,
            padding: '10px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 9.5,
            color: '#ffb300',
            fontWeight: 'bold'
          }
        }, "P50 \xB7 median"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 13,
            fontWeight: 'bold',
            fontFamily: 'monospace',
            marginTop: 2
          }
        }, uqData.p50Val.toFixed(1), uqTargetMetric === 'leaked' ? ' kt' : '%')), /*#__PURE__*/React.createElement("button", {
          onClick: () => loadUQRealization(uqData.p50Realization),
          style: {
            background: 'rgba(255,179,0,0.1)',
            border: '1px solid rgba(255,179,0,0.3)',
            color: '#ffb300',
            padding: '6px 10px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none'
          }
        }, "Load Model")), /*#__PURE__*/React.createElement("div", {
          style: {
            background: 'rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: 10,
            padding: '10px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 9.5,
            color: '#ff6b6b',
            fontWeight: 'bold'
          }
        }, "P90 \xB7 ", uqTargetMetric === 'leaked' ? 'conservative' : 'optimistic'), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 13,
            fontWeight: 'bold',
            fontFamily: 'monospace',
            marginTop: 2
          }
        }, uqData.p90Val.toFixed(1), uqTargetMetric === 'leaked' ? ' kt' : '%')), /*#__PURE__*/React.createElement("button", {
          onClick: () => loadUQRealization(uqData.p90Realization),
          style: {
            background: 'rgba(255,107,107,0.1)',
            border: '1px solid rgba(255,107,107,0.3)',
            color: '#ff6b6b',
            padding: '6px 10px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none'
          }
        }, "Load Model"))))) : /*#__PURE__*/React.createElement("div", {
          style: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.1)',
            border: '1px dashed rgba(255,255,255,0.08)',
            borderRadius: 14,
            padding: 40,
            textAlign: 'center'
          }
        }, /*#__PURE__*/React.createElement("i", {
          className: "fas fa-calculator",
          style: {
            fontSize: 36,
            color: 'rgba(255,255,255,0.15)',
            marginBottom: 15
          }
        }), /*#__PURE__*/React.createElement("h4", {
          style: {
            margin: 0,
            fontSize: 13.5,
            color: 'rgba(255,255,255,0.8)'
          }
        }, "No results yet"), /*#__PURE__*/React.createElement("p", {
          style: {
            margin: '6px 0 0',
            fontSize: 11.5,
            color: 'rgba(255,255,255,0.45)',
            maxWidth: 380
          }
        }, "Select which parameters to vary, define each range or set of values, then run the batch simulator to generate risk distributions and sensitivity analyses.")))
      );
    } else {
      return /*#__PURE__*/React.createElement("div", {
        id: "tabpanel-guide",
        role: "tabpanel",
        "aria-labelledby": "tab-guide",
        tabIndex: 0,
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#1c1626',
          padding: '20px 25px',
          overflowY: 'auto',
          minHeight: 450
        }
      }, /*#__PURE__*/React.createElement(GuidePage, {
        isEmbedded: true
      }));
    }
  })()), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '-8px 6px 0',
      fontSize: 10.5,
      lineHeight: 1.5,
      color: 'rgba(255,255,255,0.45)'
    }
  }, "Educational 2D Vertical-Equilibrium model \xB7 scaled units (1 kt = one model mass unit) \xB7 buoyancy-driven, viscosity-free gravity tongue with simplified fault conduits. The Methodology tab separates reference theory from the implemented scheme."), /*#__PURE__*/React.createElement("div", {
    className: "controls-subgrid"
  }, /*#__PURE__*/React.createElement("details", {
    className: "control-panel",
    open: window.innerWidth > 768,
    style: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20,
      padding: '18px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
      backdropFilter: 'blur(12px)'
    }
  }, /*#__PURE__*/React.createElement("summary", {
    style: {
      margin: '0 0 14px',
      fontSize: 14,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: '#64ffda',
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 700
    }
  }, "Simulation Parameters"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      paddingBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.4)',
      textTransform: 'uppercase',
      fontWeight: 'bold'
    }
  }, "Topography Spline (Caprock)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Slider, {
    label: "Regional Dip",
    val: `${dipPercent}%`,
    min: "-5",
    max: "5",
    step: "0.5",
    value: dipPercent,
    onChange: v => setDipPercent(parseFloat(v))
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Anticline Height",
    val: `${amplitude}px`,
    min: "0",
    max: "50",
    step: "5",
    value: amplitude,
    onChange: v => setAmplitude(parseInt(v))
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Anticline Count",
    val: frequency,
    min: "0.5",
    max: "4.0",
    step: "0.5",
    value: frequency,
    onChange: v => setFrequency(parseFloat(v))
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Fault Slip",
    val: `${faultOffset}x`,
    min: "0",
    max: "3",
    step: "0.2",
    value: faultOffset,
    onChange: v => setFaultOffset(parseFloat(v))
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      paddingBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.4)',
      textTransform: 'uppercase',
      fontWeight: 'bold'
    }
  }, "Sandstone Properties"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Slider, {
    label: "Permeability (K)",
    val: `${Math.round(K * 1000)} mD`,
    min: "0.1",
    max: "3.5",
    step: "0.1",
    value: K,
    onChange: v => setK(parseFloat(v))
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Porosity (phi)",
    val: `${Math.round(porosity * 100)}%`,
    min: "0.1",
    max: "0.4",
    step: "0.05",
    value: porosity,
    onChange: v => setPorosity(parseFloat(v))
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Grid Cells (N)",
    val: cellCount,
    min: "50",
    max: "300",
    step: "10",
    value: cellCount,
    onChange: v => setCellCount(parseInt(v))
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Residual Trap (Sgr)",
    val: `${Math.round(residualTrapFraction * 100)}%`,
    min: "0.0",
    max: "0.4",
    step: "0.05",
    value: residualTrapFraction,
    onChange: v => setResidualTrapFraction(parseFloat(v))
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      paddingBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.4)',
      textTransform: 'uppercase',
      fontWeight: 'bold'
    }
  }, "Capillary Fringe (P_c Transition)"), /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 10.5,
      cursor: 'pointer',
      color: hasCapillaryFringe ? '#64ffda' : 'rgba(255,255,255,0.5)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: hasCapillaryFringe,
    onChange: e => setHasCapillaryFringe(e.target.checked),
    style: {
      accentColor: '#64ffda'
    }
  }), "Enable Fringe")), hasCapillaryFringe && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Slider, {
    label: "Fringe Height (h_c)",
    val: `${fringeScale.toFixed(2)} m`,
    min: "0.10",
    max: "3.00",
    step: "0.10",
    value: fringeScale,
    onChange: v => setFringeScale(parseFloat(v))
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Visual Entry-pressure Scale",
    val: `${entryPressure} kPa`,
    min: "5",
    max: "40",
    step: "1",
    value: entryPressure,
    onChange: v => setEntryPressure(parseInt(v))
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.4)',
      textTransform: 'uppercase',
      fontWeight: 'bold'
    }
  }, "Injection Settings"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Slider, {
    label: "Flow Rate (Q)",
    val: `${Q.toFixed(1)} kt/yr`,
    min: "0.0",
    max: "3.5",
    step: "0.1",
    value: Q,
    onChange: v => setQ(parseFloat(v))
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Well Location",
    val: `${injLocation}%`,
    min: "10",
    max: "90",
    step: "5",
    value: injLocation,
    onChange: v => setInjLocation(parseInt(v))
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Inj. Stop Year",
    val: `${injDuration}y`,
    min: "50",
    max: "400",
    step: "10",
    value: injDuration,
    onChange: v => setInjDuration(parseInt(v))
  }))))), /*#__PURE__*/React.createElement("details", {
    className: "control-panel",
    open: window.innerWidth > 768,
    style: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20,
      padding: '18px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
      backdropFilter: 'blur(12px)'
    }
  }, /*#__PURE__*/React.createElement("summary", {
    style: {
      margin: '0 0 14px',
      fontSize: 14,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: '#64ffda',
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 700
    }
  }, "Fault Management"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 15
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.7)'
    }
  }, "Active Faults:"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, [0, 1, 2, 3].map(cnt => /*#__PURE__*/React.createElement("button", {
    key: cnt,
    onClick: () => setFaultCount(cnt),
    style: {
      background: faultCount === cnt ? 'rgba(100,255,218,0.2)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${faultCount === cnt ? '#64ffda' : 'rgba(255,255,255,0.12)'}`,
      color: faultCount === cnt ? '#64ffda' : 'azure',
      padding: '4px 10px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    }
  }, cnt)))), faultCount > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, Array.from({
    length: faultCount
  }).map((_, idx) => {
    const f = faults[idx];
    const label = `Fault ${String.fromCharCode(65 + idx)}`;
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      style: {
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: 12,
        padding: '10px 12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11.5,
        fontWeight: 'bold',
        color: f.isSealed ? '#64ffda' : '#ff6b6b'
      }
    }, label), /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 10.5,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: f.isSealed,
      onChange: e => {
        const newFaults = [...faults];
        newFaults[idx].isSealed = e.target.checked;
        setFaults(newFaults);
      },
      style: {
        accentColor: '#64ffda'
      }
    }), "Sealed (Infinite Barrier)")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Slider, {
      label: "Position",
      val: `${f.xPercent}%`,
      min: "10",
      max: "90",
      step: "5",
      value: f.xPercent,
      onChange: v => {
        const newFaults = [...faults];
        newFaults[idx].xPercent = parseInt(v);
        setFaults(newFaults);
      }
    }), /*#__PURE__*/React.createElement(Slider, {
      label: "Capillary Threshold",
      val: `${f.thresholdHeight} m`,
      min: "0.0",
      max: "2.0",
      step: "0.1",
      value: f.thresholdHeight,
      onChange: v => {
        const newFaults = [...faults];
        newFaults[idx].thresholdHeight = parseFloat(v);
        setFaults(newFaults);
      }
    }), /*#__PURE__*/React.createElement(Slider, {
      label: "Horiz. Transmissibility",
      val: f.transmissibility !== undefined ? f.transmissibility.toFixed(2) : "1.00",
      min: "0.0",
      max: "1.0",
      step: "0.05",
      value: f.transmissibility !== undefined ? f.transmissibility : 1.0,
      onChange: v => {
        const newFaults = [...faults];
        newFaults[idx].transmissibility = parseFloat(v);
        setFaults(newFaults);
      }
    }), !f.isSealed ? /*#__PURE__*/React.createElement(Slider, {
      label: "Leakage Rate",
      val: f.leakRate,
      min: "0.01",
      max: "0.40",
      step: "0.02",
      value: f.leakRate,
      onChange: v => {
        const newFaults = [...faults];
        newFaults[idx].leakRate = parseFloat(v);
        setFaults(newFaults);
      }
    }) : /*#__PURE__*/React.createElement("div", null)));
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      position: 'sticky',
      top: 110
    }
  }, /*#__PURE__*/React.createElement("details", {
    className: "control-panel",
    open: window.innerWidth > 768,
    style: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20,
      padding: '18px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("summary", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      margin: 0,
      fontSize: 14,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: '#64ffda',
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 700
    }
  }, "CO\u2082 Mass Balance"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      fontFamily: 'monospace',
      color: 'rgba(255,255,255,0.5)'
    }
  }, "Scaled units (ktonnes equiv.)")), renderSVGChart(), /*#__PURE__*/React.createElement("div", {
    className: "sim-stat-grid",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 8,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(StatBox, {
    label: "Injected",
    value: Math.round(currentMasses.injected),
    color: "#ffffff",
    opacity: "0.6"
  }), /*#__PURE__*/React.createElement(StatBox, {
    label: "Mobile Plume",
    value: Math.round(currentMasses.mobile),
    color: "#64ffda"
  }), /*#__PURE__*/React.createElement(StatBox, {
    label: "Trapped",
    value: Math.round(currentMasses.trapped),
    color: "#3ca68e"
  }), /*#__PURE__*/React.createElement(StatBox, {
    label: "Leaked",
    value: Math.round(currentMasses.leaked),
    color: "#ff6b6b"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      borderTop: '1px solid rgba(255,255,255,0.06)',
      paddingTop: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.4)',
      textTransform: 'uppercase',
      fontWeight: 'bold'
    }
  }, "Storage Efficiency"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    label: "Structural Trapping (Mobile)",
    pct: currentMasses.injected > 0 ? currentMasses.mobile / currentMasses.injected * 100 : 0,
    color: "#64ffda"
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "Residual Capillary Trapping",
    pct: currentMasses.injected > 0 ? currentMasses.trapped / currentMasses.injected * 100 : 0,
    color: "#3ca68e"
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "Cumulative Leaked Fraction",
    pct: currentMasses.injected > 0 ? currentMasses.leaked / currentMasses.injected * 100 : 0,
    color: "#ff6b6b"
  })))))));
};

// Slider Input helper component
const Slider = ({
  label,
  val,
  min,
  max,
  step,
  value,
  onChange
}) => {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 10.5,
      color: 'rgba(255,255,255,0.8)'
    }
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'monospace',
      color: '#64ffda'
    }
  }, val)), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: min,
    max: max,
    step: step,
    value: value,
    "aria-label": label,
    "aria-valuetext": String(val),
    onChange: e => onChange(e.target.value),
    style: {
      width: '100%',
      height: 3,
      background: 'rgba(255,255,255,0.15)',
      borderRadius: 2,
      outline: 'none',
      cursor: 'pointer',
      accentColor: '#64ffda'
    }
  }));
};

// Stat numeric display helper component
const StatBox = ({
  label,
  value,
  color,
  opacity
}) => {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(0,0,0,0.12)',
      border: '1px solid rgba(255,255,255,0.04)',
      borderRadius: 10,
      padding: '8px 4px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.45)',
      marginBottom: 2
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 'bold',
      color: color,
      fontFamily: 'monospace',
      opacity: opacity
    }
  }, value));
};

// Storage Efficiency Progress Bar helper component
const ProgressBar = ({
  label,
  pct,
  color
}) => {
  // Cap at 100%
  const clampedPct = Math.max(0, Math.min(100, pct));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,0.7)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      color: color,
      fontWeight: 'bold'
    }
  }, Math.round(clampedPct), "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      background: 'rgba(255,255,255,0.1)',
      borderRadius: 2,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${clampedPct}%`,
      height: '100%',
      background: color,
      borderRadius: 2,
      transition: 'width 0.3s ease'
    }
  })));
};

// Bind to window object for Babel execution scope
Object.assign(window, {
  SimulatorPage
});

