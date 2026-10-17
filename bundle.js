"use strict";
// Auto-generated bundle — Pre-compiled for instant execution
var { useState, useEffect, useMemo, useRef, useCallback } = React;

// File: Primitives.jsx
/* =====================================================
   Icon — inline SVG set (replaces Font Awesome on the site pages).
   UI glyphs are 24-unit stroke paths; brand marks are the CC0 paths
   from Simple Icons (GitHub, LinkedIn, ORCID, Google Scholar).
   ===================================================== */
const SITE_ICONS = {
  menu: {
    d: 'M4 7h16M4 12h16M4 17h16'
  },
  close: {
    d: 'M6 6l12 12M18 6 6 18'
  },
  external: {
    d: 'M14 4h6v6M10 14 20 4M19 13.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5.5'
  },
  copy: {
    d: 'M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1'
  },
  check: {
    d: 'M5 12.5l4.5 4.5L19 7.5'
  },
  play: {
    d: 'M8 5.5v13l11-6.5z',
    fill: true
  },
  pause: {
    d: 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z',
    fill: true
  },
  restart: {
    d: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4.2h4.2'
  },
  'arrow-up': {
    d: 'M12 19V5M5.5 11.5 12 5l6.5 6.5'
  },
  mail: {
    d: 'M4 5.5h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1zM3.5 7l8.5 6.5L20.5 7'
  },
  print: {
    d: 'M7 9V3.5h10V9M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v6.5H7z'
  },
  pin: {
    d: 'M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 1 1 13 0c0 5.3-6.5 11-6.5 11zM12 12.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6z'
  },
  scholar: {
    fill: true,
    d: 'M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z'
  },
  orcid: {
    fill: true,
    d: 'M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z'
  },
  github: {
    fill: true,
    d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
  },
  linkedin: {
    fill: true,
    d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
  }
};
const Icon = ({
  name,
  size = 18,
  className = ''
}) => {
  const icon = SITE_ICONS[name];
  if (!icon) return null;
  return /*#__PURE__*/React.createElement("svg", {
    className: `icon ${className}`.trim(),
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    focusable: "false",
    fill: icon.fill ? 'currentColor' : 'none',
    stroke: icon.fill ? 'none' : 'currentColor',
    strokeWidth: icon.fill ? undefined : 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: icon.d
  }));
};
Object.assign(window, {
  Icon,
  SITE_ICONS
});

// File: site-content.js
// site-content.js — one source for the facts the homepage and the CV both show.
// Verify any new DOI against Crossref before adding it. Wording rules (2026-10-13):
// "PhD" without dots, the IGE seminar is never "invited", both 2026 awards are runner-up,
// and the SPE upscaling paper carries no speed-up figure.

const SITE_LINKS = {
  email: 'st4014@hw.ac.uk',
  scholar: 'https://scholar.google.co.uk/citations?user=_nGa8EQAAAAJ&hl=en',
  orcid: 'https://orcid.org/0000-0002-4896-295X',
  orcidId: '0000-0002-4896-295X',
  github: 'https://github.com/saeedtelvari',
  githubUser: 'saeedtelvari',
  linkedin: 'https://www.linkedin.com/in/stelvari/',
  linkedinUser: 'stelvari'
};
const SITE_PUBLICATIONS = [{
  id: 've-depleted-gas-2026',
  year: 2026,
  title: 'A Vertical Equilibrium Model for CO₂ Migration in Depleted Gas Fields',
  authors: ['Telvari, S.', 'Ramachandran, H.', 'Wang, G.', 'Doster, F.'],
  venue: 'EarthArXiv preprint',
  status: 'Under review in Geoenergy Science and Engineering',
  doi: '10.31223/X5P49D',
  url: 'https://doi.org/10.31223/X5P49D',
  summary: 'Extends vertical-equilibrium modelling to CO₂–methane–brine flow in depleted gas reservoirs and reproduces compositional simulations, including a Hugin Formation East field case, with speed-ups of up to 100×.',
  bibtex: `@article{telvari2026vertical,
  title={A Vertical Equilibrium Model for CO2 Migration in Depleted Gas Fields},
  author={Telvari, Sa'eed and Ramachandran, Harish and Wang, Gang and Doster, Florian},
  journal={EarthArXiv},
  note={Preprint},
  year={2026},
  doi={10.31223/X5P49D}
}`
}, {
  id: 'cnn-upscaling-2026',
  year: 2026,
  title: 'Accelerated Permeability Upscaling: A Convolutional Neural Network Approach',
  authors: ['Sayyafzadeh, M.', 'Telvari, S.', 'Guérillot, D.', 'Sharifi, M.'],
  venue: 'SPE Journal 31(04), 2242–2260',
  status: 'Journal article',
  doi: '10.2118/231836-PA',
  url: 'https://doi.org/10.2118/231836-PA',
  summary: 'A compact 3D convolutional network estimates upscaled permeability tensors from fine-scale permeability maps; it was tested on Gaussian fields and the Egg model and checked against pressure solutions.',
  bibtex: `@article{sayyafzadeh2026accelerated,
  title={Accelerated Permeability Upscaling: A Convolutional Neural Network Approach},
  author={Sayyafzadeh, Mohammad and Telvari, Sa'eed and Gu{\\'e}rillot, Dominique and Sharifi, Mohammad},
  journal={SPE Journal},
  volume={31},
  number={04},
  pages={2242--2260},
  year={2026},
  publisher={Society of Petroleum Engineers},
  doi={10.2118/231836-PA}
}`
}, {
  id: 'three-phase-ve-2025',
  year: 2025,
  title: 'Three-Phase VE Simulation of CO₂–Methane–Brine Flow in Reservoirs',
  authors: ['Telvari, S.', 'Ramachandran, H.', 'Wang, G.', 'Doster, F.'],
  venue: 'Sixth EAGE Global Energy Transition Conference & Exhibition (GET 2025), Rotterdam',
  status: 'Extended abstract and poster',
  doi: '10.3997/2214-4609.202521145',
  url: 'https://doi.org/10.3997/2214-4609.202521145',
  summary: 'A vertical-equilibrium model of three-phase CO₂–methane–brine flow for large-scale simulation of storage in depleted gas reservoirs.',
  bibtex: `@inproceedings{telvari2025three,
  title={Three-Phase VE Simulation of CO2--Methane--Brine Flow in Reservoirs},
  author={Telvari, Sa'eed and Ramachandran, Harish and Wang, Gang and Doster, Florian},
  booktitle={Sixth EAGE Global Energy Transition Conference \\& Exhibition},
  year={2025},
  doi={10.3997/2214-4609.202521145}
}`
}, {
  id: 'digital-sandstone-2023',
  year: 2023,
  title: 'Prediction of two-phase flow properties for digital sandstones using 3D convolutional neural networks',
  authors: ['Telvari, S.', 'Sayyafzadeh, M.', 'Siavashi, J.', 'Sharifi, M.'],
  venue: 'Advances in Water Resources 176, 104442',
  status: 'Journal article',
  doi: '10.1016/j.advwatres.2023.104442',
  url: 'https://doi.org/10.1016/j.advwatres.2023.104442',
  summary: '3D convolutional networks predict relative permeability and capillary pressure curves from micro-CT images of sandstone.',
  bibtex: `@article{telvari2023prediction,
  title={Prediction of two-phase flow properties for digital sandstones using 3D convolutional neural networks},
  author={Telvari, Sa'eed and Sayyafzadeh, Mohammad and Siavashi, Javad and Sharifi, Mohammad},
  journal={Advances in Water Resources},
  volume={176},
  pages={104442},
  year={2023},
  publisher={Elsevier},
  doi={10.1016/j.advwatres.2023.104442}
}`
}];
const SITE_ACTIVITY = [{
  month: '2026-09',
  date: 'Sep 2026',
  title: 'Talk and session co-chair, InterPore UK',
  body: 'Presented “A Compositional Vertical Equilibrium Model for CO₂ Storage in Depleted Gas Reservoirs” at the 9th InterPore UK Chapter Conference in Edinburgh, and co-chaired the Multiphase Phenomena session.'
}, {
  month: '2026-09',
  date: 'Sep 2026',
  title: 'Approved as MSc demonstrator',
  body: 'Formation Evaluation labs and Production Technology tutorials for MSc Petroleum Engineering at Heriot-Watt, from November 2026.'
}, {
  month: '2026-08',
  date: 'Aug 2026',
  title: 'MuPSI industrial case study',
  body: 'Built vertical-equilibrium models of depleted gas fields for an industrial case study in the MuPSI CO₂ storage project, and presented the results to the project partners.'
}, {
  month: '2026-06',
  date: 'Jun 2026',
  title: 'Team runner-up, EAGE “The Energy–AI Nexus” Hackathon',
  body: 'Built a Python AI agent that manages an energy grid under growing AI demand, with a team at EAGE Annual 2026 in Aberdeen.'
}, {
  month: '2026-05',
  date: 'May 2026',
  title: 'Talk at InterPore2026; preprint online',
  body: 'Presented “Vertical-Equilibrium Modelling of CO₂ Migration in Depleted Reservoirs” at InterPore2026 in Nantes, and posted the VE model paper as a preprint on EarthArXiv.'
}, {
  month: '2026-03',
  date: 'Mar 2026',
  title: 'Led an MRST rapid-prototyping session',
  body: 'Guided Heriot-Watt PhD students and postdocs through building a single-phase flow simulator from scratch in MRST, in the SET-IT MATLAB/MRST workshop series.'
}, {
  month: '2026-02',
  date: 'Feb 2026',
  title: 'Seminar talk and SPE bursary',
  body: 'Spoke at the IGE GeoEnergy Seminar Series at Heriot-Watt, and was runner-up for the SPE Aberdeen Section Student Bursary (£1,000 awarded).'
}, {
  month: '2025-10',
  date: 'Oct 2025',
  title: 'Poster at EAGE GET 2025',
  body: 'Presented “Three-Phase VE Simulation of CO₂–Methane–Brine Flow in Reservoirs” at the Sixth EAGE Global Energy Transition Conference in Rotterdam.'
}];
const SITE_PROJECTS = [{
  id: 'simulator',
  title: 'CO₂ storage simulator',
  body: 'A vertical-equilibrium simulator of CO₂ plume migration, structural, residual and dissolution trapping, fault leakage and pressure build-up in a saline aquifer, in SI units with a visible mass balance and an uncertainty study. It runs in the browser.',
  links: [{
    label: 'Open the simulator',
    href: './simulator.html'
  }, {
    label: 'Read the method',
    href: './simulator.html#method'
  }],
  image: {
    src: './assets/project-simulator.webp',
    width: 640,
    height: 360,
    alt: 'Map view of the CO₂ storage simulator: a plume under a faulted dome, coloured by trapping class.'
  }
}, {
  id: 'mupsi',
  title: 'MuPSI',
  meta: '2026',
  body: 'Multiscale Pressure-Stress Impacts on fault integrity for multi-site regional CO₂ storage, a Clean Energy Transition Partnership project. I built VE models and a 28-case ensemble for an industrial case study of depleted gas fields, with NORCE, TU Delft and IDAEA-CSIC.'
}, {
  id: 'fault-detection',
  title: '3D fault detection for MRST',
  body: 'Extended a 2D tool to 3D. It finds fault faces with signed distance fields on Cartesian and unstructured grids, and members of the MuPhi group use it.'
}];
const SITE_CV = {
  title: 'PhD Candidate in Petroleum Engineering',
  location: 'Edinburgh, UK',
  interests: 'Reservoir simulation, CO₂ storage, vertical-equilibrium models, multiphase and compositional flow, machine learning for upscaling and digital rock, fractured reservoirs.',
  education: [{
    date: '2024 – present',
    title: 'PhD in Petroleum Engineering',
    place: 'Heriot-Watt University, Edinburgh',
    details: ['Thesis: Developing Vertical Equilibrium Models for Simulating CO₂ Storage in Depleted Gas Reservoirs']
  }, {
    date: '2022 – 2024',
    title: 'MSc in Petroleum Engineering (Reservoir)',
    place: 'Amirkabir University of Technology, Tehran',
    details: ['GPA 3.65/4 (17.23/20)', 'Thesis: Machine Learning Methods in Upscaling Fine-scale Discrete Fracture Models']
  }, {
    date: '2018 – 2022',
    title: 'BSc in Petroleum Engineering',
    place: 'Amirkabir University of Technology, Tehran',
    details: ['GPA 17.43/20', 'Thesis: Prediction of two-phase flow properties for digital sandstones using 3D CNNs']
  }],
  experience: [{
    date: '2024 – present',
    title: 'Doctoral research: vertical-equilibrium modelling',
    place: 'Institute of GeoEnergy Engineering, Heriot-Watt University',
    details: ['Reduced-order models of CO₂–methane–brine migration in depleted gas reservoirs, for screening, uncertainty analysis and field-scale forecasting.']
  }, {
    date: '2026',
    title: 'MuPSI: Multiscale Pressure-Stress Impacts on fault integrity for multi-site regional CO₂ storage',
    place: 'Clean Energy Transition Partnership',
    details: ['VE models and a 28-case ensemble for an industrial case study on depleted gas fields, with NORCE, TU Delft and IDAEA-CSIC.']
  }, {
    date: '',
    title: '3D fault-detection tool for MRST',
    place: 'MuPhi research group, Heriot-Watt University',
    details: ['Extended a 2D code to 3D; it finds fault faces with signed distance fields on Cartesian and unstructured grids and is used by members of the MuPhi group.']
  }, {
    date: '2022 – 2026',
    title: 'Machine-learning permeability upscaling',
    place: 'Amirkabir University of Technology',
    details: ['CNN workflows that estimate effective permeability from heterogeneous fine-scale reservoir models.']
  }, {
    date: '2021 – 2023',
    title: 'Two-phase flow prediction for digital sandstones',
    place: 'Amirkabir University of Technology',
    details: ['3D convolutional neural networks that predict relative permeability and capillary pressure from digital-rock images.']
  }],
  presentations: [{
    date: 'Sep 2026',
    title: 'A Compositional Vertical Equilibrium Model for CO₂ Storage in Depleted Gas Reservoirs',
    place: 'Oral, 9th InterPore UK Chapter Conference, Edinburgh'
  }, {
    date: 'May 2026',
    title: 'Vertical-Equilibrium Modelling of CO₂ Migration in Depleted Reservoirs',
    place: 'Oral, InterPore2026, 18th Annual Meeting, Nantes'
  }, {
    date: 'Feb 2026',
    title: 'A Vertical Equilibrium Model for CO₂ Migration in Depleted Gas Fields',
    place: 'Seminar talk, IGE GeoEnergy Seminar Series, Heriot-Watt University'
  }, {
    date: 'Oct 2025',
    title: 'Three-Phase VE Simulation of CO₂–Methane–Brine Flow in Reservoirs',
    place: 'Poster, Sixth EAGE Global Energy Transition Conference (GET 2025), Rotterdam'
  }],
  teaching: [{
    date: '2026 – 2027',
    title: 'Approved Demonstrator, MSc Petroleum Engineering',
    place: 'Heriot-Watt University, Edinburgh',
    details: ['Formation Evaluation labs (Nov 2026); Production Technology PipeSim tutorials (Jan – Feb 2027)']
  }, {
    date: 'Feb – Apr 2026',
    title: 'Co-organiser and lead instructor, MATLAB/MRST workshop series',
    place: 'SET-IT, Heriot-Watt University',
    details: ['Led “Simulator Development with MRST’s Rapid Prototyping Framework” for IGE PhD students and postdocs']
  }, {
    date: 'MSc',
    title: 'Teaching assistant',
    place: 'Amirkabir University of Technology, Tehran',
    details: ['Advanced Naturally Fractured Reservoirs; Advanced Enhanced Oil Recovery (Eclipse and Petrel tutorials)']
  }],
  service: [{
    date: 'Sep 2026',
    title: 'Session co-chair, 9th InterPore UK Chapter Conference',
    place: 'Session 1: Multiphase Phenomena, with Dr Sarah Perez, Edinburgh'
  }, {
    date: '2026',
    title: 'Co-reviewer, Geophysical Research Letters',
    place: 'Manuscript review with Prof. Florian Doster'
  }, {
    date: 'May 2026',
    title: 'Conference volunteer, InterPore2026',
    place: 'Technical session support for minisymposia MS05 and MS08, Nantes'
  }, {
    date: '2025',
    title: 'Webmaster, SPE Heriot-Watt University Student Chapter',
    place: 'SPE officer certificate of appreciation; the chapter won the 2026 SPE Regional Outstanding Student Chapter Award'
  }, {
    date: '',
    title: 'Web contributor',
    place: 'SET-IT research community and MuPhi Research Group websites'
  }],
  training: [{
    date: 'Sep 2026',
    title: 'SLB Intersect CCS training',
    place: 'Five-day course'
  }, {
    date: 'Mar 2026',
    title: 'CMG Carbon Capture Underground Storage Modelling',
    place: 'Certificate of achievement, CMG CO₂ storage workshop'
  }],
  skills: [['Programming', 'Python, MATLAB, Julia, Rust, LaTeX'], ['Machine learning', 'TensorFlow, PyTorch, scikit-learn, OpenCV, OpenPNM'], ['Reservoir simulation', 'MRST, Eclipse, Intersect, CMG, Petrel RE, PipeSim, Saphir, PVTSim'], ['CFD and imaging', 'OpenFOAM, PerGeos, SALOME, MeshLab'], ['Tools', 'Linux, Docker, Git, Jupyter, VS Code']],
  recognition: [{
    date: '2024 – present',
    title: 'James Watt Scholarship',
    place: 'Full PhD funding, Heriot-Watt University'
  }, {
    date: '2026',
    title: 'Runner-up, SPE Aberdeen Section Student Bursary',
    place: '£1,000 awarded'
  }, {
    date: '2026',
    title: 'Team runner-up, EAGE “The Energy–AI Nexus” Hackathon',
    place: 'EAGE Annual 2026, Aberdeen'
  }, {
    date: '',
    title: 'National undergraduate scholarship',
    place: 'Full tuition waiver'
  }]
};
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SITE_LINKS,
    SITE_PUBLICATIONS,
    SITE_ACTIVITY,
    SITE_PROJECTS,
    SITE_CV
  };
}

// File: Header.jsx
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
// Header.jsx — fixed navigation shared by the homepage, the CV and the simulator.
// The site variant is transparent over the hero sky and turns into an Earth surface once
// the page scrolls; the workbench variant is the simulator's solid 56 px bar.

// [destructured React]

const HEADER_FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const getHeaderFocusWrapTarget = (focusables, activeElement, backwards) => {
  if (!focusables.length) return null;
  const currentIndex = focusables.indexOf(activeElement);
  if (currentIndex === -1) return backwards ? focusables[focusables.length - 1] : focusables[0];
  if (backwards && currentIndex === 0) return focusables[focusables.length - 1];
  if (!backwards && currentIndex === focusables.length - 1) return focusables[0];
  return null;
};
const setHeaderBackgroundInert = (element, inert) => {
  if (element) element.inert = inert;
};
const HEADER_PROFILES = [{
  icon: 'mail',
  label: 'Email',
  href: `mailto:${SITE_LINKS.email}`
}, {
  icon: 'scholar',
  label: 'Google Scholar',
  href: SITE_LINKS.scholar
}, {
  icon: 'orcid',
  label: 'ORCID',
  href: SITE_LINKS.orcid
}, {
  icon: 'github',
  label: 'GitHub',
  href: SITE_LINKS.github
}, {
  icon: 'linkedin',
  label: 'LinkedIn',
  href: SITE_LINKS.linkedin
}];
const Header = ({
  active,
  onNavigate,
  variant = 'site'
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const mobileDrawerRef = useRef(null);

  // Over the hero the site header is transparent; it gains a surface once the page moves.
  useEffect(() => {
    if (variant !== 'site') return undefined;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', onScroll);
  }, [variant]);

  // The open drawer is modal: the page behind is inert, Tab cycles inside, Escape closes.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const mainContent = document.getElementById('main-content');
    const drawer = mobileDrawerRef.current;
    setHeaderBackgroundInert(mainContent, true);
    if (closeButtonRef.current) closeButtonRef.current.focus();
    const onModalKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !drawer) return;
      const focusables = Array.from(drawer.querySelectorAll(HEADER_FOCUSABLE_SELECTOR));
      const target = getHeaderFocusWrapTarget(focusables, document.activeElement, event.shiftKey);
      if (target) {
        event.preventDefault();
        target.focus();
      }
    };
    document.addEventListener('keydown', onModalKeyDown);
    return () => {
      document.removeEventListener('keydown', onModalKeyDown);
      setHeaderBackgroundInert(mainContent, false);
      if (menuButtonRef.current) menuButtonRef.current.focus();
    };
  }, [mobileOpen]);
  const handleItemClick = (id, event) => {
    setMobileOpen(false);
    if (onNavigate) onNavigate(id, event);
  };
  const classes = ['app-header', `app-header--${variant}`, scrolled ? 'is-scrolled' : ''].filter(Boolean).join(' ');
  const navLink = it => /*#__PURE__*/React.createElement("a", {
    className: "app-nav__link",
    href: it.href,
    "aria-current": active === it.id ? 'page' : undefined,
    onClick: event => handleItemClick(it.id, event)
  }, it.label);
  return /*#__PURE__*/React.createElement("header", {
    className: classes
  }, /*#__PURE__*/React.createElement("div", {
    className: "app-header__bar"
  }, /*#__PURE__*/React.createElement("a", {
    className: "app-header__logo",
    href: "./index.html",
    onClick: event => handleItemClick('home', event),
    "aria-label": "Sa\u2019eed Telvari, home"
  }, /*#__PURE__*/React.createElement("img", {
    src: "./assets/logo-minimalist.webp",
    alt: "",
    width: "40",
    height: "40"
  })), /*#__PURE__*/React.createElement("nav", {
    className: "app-header__nav",
    "aria-label": "Main"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "app-nav"
  }, SITE_NAV_ITEMS.map(it => /*#__PURE__*/React.createElement("li", {
    key: it.id
  }, navLink(it))))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    ref: menuButtonRef,
    className: "app-header__menu",
    onClick: () => setMobileOpen(true),
    "aria-expanded": mobileOpen,
    "aria-controls": "site-drawer",
    "aria-label": "Open navigation menu"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "menu",
    size: 20
  }))), mobileOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "app-drawer__backdrop",
    onClick: () => setMobileOpen(false),
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    ref: mobileDrawerRef,
    id: "site-drawer",
    className: "app-drawer",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Navigation"
  }, /*#__PURE__*/React.createElement("div", {
    className: "app-drawer__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "app-drawer__name"
  }, "Sa\u2019eed Telvari"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    ref: closeButtonRef,
    className: "app-drawer__close",
    onClick: () => setMobileOpen(false),
    "aria-label": "Close navigation menu"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 20
  }))), /*#__PURE__*/React.createElement("ul", {
    className: "app-drawer__list"
  }, SITE_NAV_ITEMS.map(it => /*#__PURE__*/React.createElement("li", {
    key: it.id
  }, navLink(it)))), /*#__PURE__*/React.createElement("ul", {
    className: "app-drawer__profiles",
    "aria-label": "Elsewhere"
  }, HEADER_PROFILES.map(profile => /*#__PURE__*/React.createElement("li", {
    key: profile.label
  }, /*#__PURE__*/React.createElement("a", _extends({
    href: profile.href
  }, profile.href.startsWith('http') ? {
    target: '_blank',
    rel: 'noreferrer'
  } : {}), /*#__PURE__*/React.createElement(Icon, {
    name: profile.icon,
    size: 16
  }), profile.label)))))));
};
Object.assign(window, {
  Header
});

// File: Footer.jsx
// Footer.jsx — closing band: name, affiliation, the same links as the header, back to top.
const Footer = ({
  onNavigate,
  geological = false
}) => {
  const toTop = event => {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: siteReducedMotion() ? 'auto' : 'smooth'
    });
    const main = document.getElementById('main-content');
    if (main) main.focus({
      preventScroll: true
    });
  };
  return /*#__PURE__*/React.createElement("footer", {
    className: `site-footer${geological ? ' site-footer--geological' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "site-footer__inner"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "site-footer__name"
  }, "\xA9 2024\u20132026 Sa\u2019eed Telvari"), /*#__PURE__*/React.createElement("p", {
    className: "site-footer__affiliation"
  }, "Institute of GeoEnergy Engineering, Heriot-Watt University, Edinburgh")), /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Footer"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "site-footer__links"
  }, SITE_NAV_ITEMS.map(it => /*#__PURE__*/React.createElement("li", {
    key: it.id
  }, /*#__PURE__*/React.createElement(FooterLink, {
    label: it.label,
    href: it.href,
    onClick: event => onNavigate && onNavigate(it.id, event)
  }))))), /*#__PURE__*/React.createElement("a", {
    className: "btn btn--quiet btn--small",
    href: "#main-content",
    onClick: toTop
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-up",
    size: 16
  }), "Back to top")));
};
const FooterLink = ({
  label,
  href,
  onClick
}) => /*#__PURE__*/React.createElement("a", {
  href: href,
  onClick: onClick
}, label);
Object.assign(window, {
  Footer
});

// File: hero-geology.js
// Shared by the homepage renderer, its worker and Node tests. Coordinates are SVG units
// (x 0–1000 across the section, y 0–580 down from the ground surface).
const HeroGeology = (() => {
  // Two faults with opposing dips of 0–20° from vertical that never cross inside the section.
  const randomFaults = random => {
    const angle1 = random() * 20,
      angle2 = random() * 20;
    const slope1 = parseFloat(Math.tan(angle1 * Math.PI / 180).toFixed(3));
    const slope2 = parseFloat(Math.tan(angle2 * Math.PI / 180).toFixed(3));
    // 65 % diverge (horst-like), 35 % converge with a guaranteed clearance at the base.
    const divergent = random() < 0.65;
    let dip1 = divergent ? -slope1 : slope1;
    let dip2 = divergent ? slope2 : -slope2;
    let x1, x2;
    if (divergent) {
      x1 = Math.floor(random() * 15) + 18; // 18–32 %
      x2 = Math.floor(random() * 11) + 44; // 44–54 %
    } else {
      x1 = Math.floor(random() * 9) + 14; // 14–22 %
      const minX2 = Math.max(46, Math.ceil((x1 * 10 + (dip1 - dip2) * 580 + 80) / 10));
      x2 = minX2 <= 54 ? Math.floor(random() * (54 - minX2 + 1)) + minX2 : 54;
      if (x2 * 10 + dip2 * 580 - (x1 * 10 + dip1 * 580) < 60) {
        dip1 = -slope1;
        dip2 = slope2;
      }
    }
    const fault = (xPercent, dipSlope, angleDeg) => {
      // Damage-zone permeability against the aquifer's CO2 permeability: 10-100 mD against about 100 mD.
      // Leakier than the paper's field case on purpose, so the overlying aquifer's plume shows.
      const permeabilityRatio = parseFloat(Math.pow(10, -1 + random()).toPrecision(3));
      return {
        xPercent,
        dipSlope,
        angleDeg: parseFloat(angleDeg.toFixed(1)),
        permeabilityRatio,
        // Capillary entry pressure of the damage zone in bar, higher for tighter fractures (p_e ~ k^-1/2).
        entryPressure: parseFloat((0.05 / Math.sqrt(permeabilityRatio) * (0.6 + random())).toFixed(2))
      };
    };
    return [fault(x1, dip1, angle1), fault(x2, dip2, angle2)].sort((a, b) => a.xPercent - b.xPercent);
  };

  // A new, physically bounded section for every page load.
  const randomGeology = (random = Math.random) => {
    const faults = randomFaults(random);
    const dipSlope = parseFloat((0.025 + random() * 0.085).toFixed(3));
    const baseDepth = parseFloat((110 + random() * 45).toFixed(1));
    // Broad folds, shorter anticlines and micro-topography of the storage aquifer roof.
    const amp1 = parseFloat((12 + random() * 20).toFixed(1));
    const lambda1 = parseFloat((120 + random() * 150).toFixed(1));
    const phase1 = parseFloat(((random() - 0.5) * 180).toFixed(1));
    const amp2 = parseFloat((5 + random() * 7).toFixed(1));
    const lambda2 = parseFloat((65 + random() * 55).toFixed(1));
    const amp3 = parseFloat((2 + random() * 3).toFixed(1));
    const lambda3 = parseFloat((40 + random() * 12).toFixed(1));
    const faultThrow = parseFloat((12 + random() * 8).toFixed(1));
    const reservoirThickness = parseFloat((100 + random() * 150).toFixed(1));
    // Keep a seal between the overlying aquifer and the storage aquifer, even at fold crests.
    const shallowThickness = Math.min(25 + random() * 25, 0.6 * (baseDepth - amp1 - amp2 - amp3) - 0.4 * faultThrow - 8);
    const capLayerDepths = [0.55 + random() * 0.03, 0.28 + random() * 0.07, 0.06 + random() * 0.04];
    const aquiferLayerOffsets = [90 + random() * 12, 176 + random() * 16, 256 + random() * 12];
    // Mobility (solver units), residual saturation and the legacy injection rate.
    const K = parseFloat((1.15 + random() * 0.35).toFixed(2));
    const R = parseFloat((0.24 + random() * 0.07).toFixed(2));
    const Q = parseFloat((3.40 + random() * 0.60).toFixed(2));
    const wellXPct = 68 + Math.floor(random() * 5);
    const wellX = wellXPct * 10;
    return {
      faults,
      dipSlope,
      baseDepth,
      amp1,
      lambda1,
      phase1,
      amp2,
      lambda2,
      amp3,
      lambda3,
      faultThrow,
      reservoirThickness,
      shallowThickness,
      capLayerDepths,
      aquiferLayerOffsets,
      thicknessWavelength: 650 + random() * 350,
      reservoirThicknessPhase: random() * 2 * Math.PI,
      capThicknessPhase: random() * 2 * Math.PI,
      aquiferThicknessPhase: random() * 2 * Math.PI,
      K,
      R,
      Q,
      wellXPct,
      wellX,
      wellCellIdx: Math.round(wellX / 5)
    };
  };
  const layerFraction = (t, x, phase, wavelength) => t + 0.08 * Math.sin(Math.PI * t) * Math.sin(2 * Math.PI * x / wavelength + phase);
  const capRockBaseProfile = (x, depth = 1, g) => (g.baseDepth + x * g.dipSlope - g.amp1 * Math.sin((x + g.phase1) * Math.PI / g.lambda1) - g.amp2 * Math.sin(x * Math.PI / g.lambda2) - g.amp3 * Math.sin(x * Math.PI / g.lambda3)) * layerFraction(depth, x, g.capThicknessPhase, g.thicknessWavelength);
  const stratumBaseProfile = (x, depth = 1, yOffset = 0, g) => {
    const roof = capRockBaseProfile(x, depth, g);
    if (!yOffset) return roof;
    const top = capRockBaseProfile(x, 1, g);
    const wave = Math.sin(2 * Math.PI * x / g.thicknessWavelength + g.reservoirThicknessPhase);
    if (depth < 0.5) {
      // The shallow bed occupies part of the seal, with clearance for fault steps.
      return roof + (top - roof - 0.4 * g.faultThrow - 8) * (0.45 + 0.15 * wave);
    }
    const floor = top + 65 + (435 - top) * (g.reservoirThickness / 300) * (0.65 + 0.30 * wave);
    const t = Math.max(0, Math.min(1, (yOffset - g.reservoirThickness) / 320));
    // Lower beds redistribute the remaining height; the bottom never moves.
    return t === 1 ? 580 : floor + (580 - floor) * layerFraction(t, x, g.aquiferThicknessPhase, g.thicknessWavelength * 1.2);
  };
  const getStratumFaultIntersection = (fault, depth = 1, yOffset = 0, g) => {
    const x0 = fault.xPercent * 10;
    const slope = fault.dipSlope || 0;
    let x = x0;
    for (let i = 0; i < 3; i++) x = x0 + slope * stratumBaseProfile(x, depth, yOffset, g);
    return {
      x,
      y: stratumBaseProfile(x, depth, yOffset, g),
      x0,
      slope
    };
  };
  const getFaultIntersection = (fault, depth = 1, g) => getStratumFaultIntersection(fault, depth, 0, g);
  const stratumY = (x, faults, cell = null, depth = 1, yOffset = 0, g) => {
    let y = stratumBaseProfile(x, depth, yOffset, g);
    const reference = cell === null ? x : cell * 5 + 2.5;
    const lowerFraction = depth === 1 ? Math.max(0, Math.min(1, (yOffset - g.reservoirThickness) / 320)) : 0;
    const throwScale = depth < 0.5 ? depth : 1 - lowerFraction;
    faults.forEach((fault, i) => {
      if (reference > getStratumFaultIntersection(fault, depth, yOffset, g).x) {
        y += (i % 2 ? -1 : 1) * g.faultThrow * throwScale;
      }
    });
    return y;
  };
  const capRockY = (x, faults, cell = null, depth = 1, g) => stratumY(x, faults, cell, depth, 0, g);
  const layerThicknessAt = (x, depth, faults, cell, g) => stratumY(x, faults, cell, depth, depth < 0.5 ? g.shallowThickness : g.reservoirThickness, g) - capRockY(x, faults, cell, depth, g);

  // ---------------------------------------------------------------- VE model
  // One sharp-interface vertical-equilibrium layer per aquifer. Each node holds S, the CO2
  // volume per unit area over porosity (conserved), and hMax, the deepest interface so far.
  // The mobile plume is h; the swept zone below it keeps residual CO2: S = h + R (hMax - h).
  const HERO_NODES = 201,
    HERO_DX = 5,
    HERO_UNIT = 15,
    HERO_YEAR = 0.2;
  const HERO_WEIGHTS = [0.15, 0.25, 0.4, 0.25, 0.15];
  // Depth below the axis break is linear; the overburden above it is drawn compressed.
  const HERO_DEPTH = {
    breakY: 28,
    breakDepth: 800,
    metresPerUnit: 3,
    sectionWidth: 10000
  };

  // Fault leakage after Ramachandran et al. (2026, WRR, doi:10.1029/2025WR041074): CO2 flows up a fault's
  // damage zone by Darcy's law once psi = buoyancy + injection overpressure - entry pressure is positive.
  const HERO_HEAD = HERO_UNIT * HERO_DEPTH.metresPerUnit; // metres per solver unit of height
  const BAR_PER_HEAD = (1050 - 650) * 9.81 * HERO_HEAD / 1e5; // brine 1050 and CO2 650 kg/m3: 1.77 bar
  const HERO_PSI_SMOOTH = 0.01 / BAR_PER_HEAD; // onset smoothed over 1 kPa (xi = 1e-3 /Pa)
  const HERO_FAULT_WIDTH = 5; // damage-zone width in m, as in the paper

  // Flux up a fault in solver units, with psi and the caprock thickness as heights:
  // Q = A k / mu (psi + drho g Lc) / Lc, smoothed at onset by (1 - exp(-xi psi)).
  const faultFlux = (conductance, psi, caprock) => psi > 0 ? conductance * (psi + caprock) / caprock * (1 - Math.exp(-psi / HERO_PSI_SMOOTH)) : 0;

  // Exponential integral E1: series below 1, Abramowitz & Stegun 5.1.56 above.
  const expint = u => {
    if (u < 1) {
      let sum = -0.5772156649 - Math.log(u),
        term = 1;
      for (let k = 1; k < 25; k++) {
        term *= -u / k;
        sum -= term / k;
      }
      return sum;
    }
    return (u * u + 2.334733 * u + 0.250621) / (u * u + 3.330657 * u + 1.681534) * Math.exp(-u) / u;
  };
  // Injection overpressure (bar) r metres from the well after t years: a Theis line source, superposed off
  // at the end of injection. 1 Mt/yr into 200 m of 200 mD aquifer: 0.5 bar per unit E1, diffusivity 1.6 m2/s.
  const overpressure = (r, years, injectionYears = 30) => {
    if (years <= 0) return 0;
    const u = Math.max(r, 1) ** 2 / (4 * 1.6 * 3.156e7);
    return 0.5 * (expint(u / years) - (years > injectionYears ? expint(u / (years - injectionYears)) : 0));
  };

  // Share of the injected CO2 in percent, with one decimal below 1 %.
  const percent = (value, total) => {
    if (!(total > 0)) return 0;
    const share = 100 * value / total;
    return share < 1 ? Math.round(share * 10) / 10 : Math.round(share);
  };
  const mobileThickness = (S, hMax, R) => S >= hMax ? S : Math.max(0, Math.min(S, (S - R * hMax) / (1 - R)));
  const storedVolume = (h, hMax, R) => h >= hMax ? h : h + R * (hMax - h);

  // A permeable fault shares one gas-water level across its two adjacent columns.
  // Solve for that level without creating or removing CO2; residual CO2 stays where it is.
  const balanceFaultContact = (S, left, right, roofLeft, roofRight, capLeft, capRight, hMax = null, R = 0) => {
    const total = S[left] + S[right];
    if (total <= 0) return;
    const mL = hMax ? hMax[left] : 0,
      mR = hMax ? hMax[right] : 0;
    const volume = (level, roof, cap, m) => storedVolume(Math.max(0, Math.min(cap, level - roof)), m, R);
    let low = Math.min(roofLeft, roofRight),
      high = Math.max(roofLeft + capLeft, roofRight + capRight);
    for (let i = 0; i < 48; i++) {
      const level = (low + high) / 2;
      if (volume(level, roofLeft, capLeft, mL) + volume(level, roofRight, capRight, mR) < total) low = level;else high = level;
    }
    S[left] = Math.min(total, volume((low + high) / 2, roofLeft, capLeft, mL));
    S[right] = total - S[left];
  };

  // Static geometry, evaluated once per section: roof and floor of both aquifers at every node.
  // L belongs to the cell left of the node, R to the cell on its right; they differ at faults.
  const section = g => {
    const layer = (depth, thickness) => {
      const roofL = new Float64Array(HERO_NODES),
        roofR = new Float64Array(HERO_NODES);
      const floorL = new Float64Array(HERO_NODES),
        floorR = new Float64Array(HERO_NODES);
      for (let k = 0; k < HERO_NODES; k++) {
        const x = k * HERO_DX;
        roofR[k] = capRockY(x, g.faults, k, depth, g);
        floorR[k] = stratumY(x, g.faults, k, depth, thickness, g);
        roofL[k] = k ? capRockY(x, g.faults, k - 1, depth, g) : roofR[k];
        floorL[k] = k ? stratumY(x, g.faults, k - 1, depth, thickness, g) : floorR[k];
      }
      const inside = k => k > 0 && k < HERO_NODES - 1;
      const cap = Float64Array.from(roofR, (roof, k) => Math.max(0, (floorR[k] - roof) / HERO_UNIT));
      const faultTop = Uint8Array.from(roofR, (roof, k) => inside(k) && Math.abs(roofL[k] - roof) > 0.1 ? 1 : 0);
      const faultBottom = Uint8Array.from(faultTop, (top, k) => top || inside(k) && Math.abs(floorL[k] - floorR[k]) > 0.1 ? 1 : 0);
      return {
        depth,
        roofL,
        roofR,
        floorL,
        floorR,
        cap,
        faultTop,
        faultBottom
      };
    };
    const layers = [layer(1, g.reservoirThickness), layer(0.4, g.shallowThickness)];
    const clampCell = k => Math.max(0, Math.min(HERO_NODES - 1, k));
    const metresPerX = HERO_DEPTH.sectionWidth / 1000;
    return {
      layers,
      faultCells: g.faults.map(f => layers.map(l => clampCell(Math.round(getFaultIntersection(f, l.depth, g).x / HERO_DX)))),
      // Each fault's leak path: caprock thickness Lc (solver heights), distance from the well (m), entry
      // pressure as a height, and A k / mu relative to the aquifer's mobility K (width 5 m per metre of strike).
      leak: g.faults.map(f => {
        const base = getFaultIntersection(f, 1, g),
          top = getStratumFaultIntersection(f, 0.4, g.shallowThickness, g);
        return {
          caprock: Math.max(0.5, (base.y - top.y) / HERO_UNIT),
          distance: Math.abs(base.x - g.wellX) * metresPerX,
          entryHead: f.entryPressure / BAR_PER_HEAD,
          conductance: g.K * f.permeabilityRatio * HERO_FAULT_WIDTH * HERO_DX * metresPerX / HERO_HEAD ** 2
        };
      }),
      wellCell: g.wellCellIdx,
      wellBottom: stratumY(g.wellX, g.faults, null, 1, g.reservoirThickness, g) - 20
    };
  };

  // Gravity-driven migration with residual trapping, fault contacts and fault leakage into the
  // overlying aquifer. CO2 is injected for `injectionYears`, then migrates.
  const simulate = (g, {
    years = 2000,
    injectionYears = 30,
    injectedVolume = 260
  } = {}) => {
    const n = HERO_NODES,
      R = g.R,
      K = g.K,
      nF = g.faults.length;
    const sec = section(g);
    const L = sec.layers.map(l => ({
      ...l,
      S: new Float64Array(n),
      hMax: new Float64Array(n),
      roof: Float64Array.from(l.roofR, r => r / HERO_UNIT),
      h: new Float64Array(n),
      move: new Float64Array(n - 1)
    }));
    const out = {
      years,
      injectionYears,
      yearLength: HERO_YEAR,
      nodes: n,
      faults: nF,
      lost: 0,
      S: [0, 1].map(() => new Float32Array((years + 1) * n)),
      h: [0, 1].map(() => new Float32Array((years + 1) * n)),
      hMax: [0, 1].map(() => new Float32Array((years + 1) * n)),
      faultFlow: new Float32Array((years + 1) * nF),
      inventory: new Float64Array((years + 1) * 4)
    };
    let injected = 0;
    const settle = l => {
      for (let i = 0; i < n; i++) if (l.S[i] > l.hMax[i]) l.hMax[i] = l.S[i];
    };
    // Place `amount` at `center`, spilling into the nearest columns with room; returns what did not fit.
    const deposit = (l, center, amount) => {
      for (let d = 0; amount > 0 && d < n; d++) {
        for (const i of d ? [center - d, center + d] : [center]) {
          if (i < 0 || i >= n || amount <= 0) continue;
          const a = Math.min(Math.max(0, l.cap[i] - l.S[i]), amount);
          l.S[i] += a;
          amount -= a;
        }
      }
      return Math.max(0, amount);
    };
    // Explicit fluxes from the start-of-step state, q = -K h_up d(roof + h)/dx. Each transfer is
    // limited by what the donor can release (mobile CO2 above its residual) and the receiver can
    // hold, so every move conserves CO2; sweeps alternate direction to stay unbiased.
    const transport = (l, dt, reverse) => {
      const {
        S,
        hMax,
        roof,
        cap,
        h,
        move
      } = l;
      for (let i = 0; i < n; i++) h[i] = mobileThickness(S[i], hMax[i], R);
      for (let i = 0; i < n - 1; i++) {
        const grad = roof[i + 1] + h[i + 1] - roof[i] - h[i];
        move[i] = -K * (grad > 0 ? h[i + 1] : h[i]) * grad * dt;
      }
      const shift = (from, to, amount) => {
        const a = Math.max(0, Math.min(amount, S[from] - R * Math.max(hMax[from], S[from]), cap[to] - S[to]));
        S[from] -= a;
        S[to] += a;
      };
      for (let j = 0; j < n - 1; j++) {
        const i = reverse ? n - 2 - j : j;
        if (move[i] > 0) shift(i, i + 1, move[i]);else if (move[i] < 0) shift(i + 1, i, -move[i]);
      }
      settle(l);
    };
    const record = y => {
      let mobile = 0,
        residual = 0,
        leaked = 0;
      L.forEach((l, j) => {
        for (let i = 0; i < n; i++) {
          const h = mobileThickness(l.S[i], l.hMax[i], R);
          out.S[j][y * n + i] = l.S[i];
          out.h[j][y * n + i] = h;
          out.hMax[j][y * n + i] = l.hMax[i];
          if (j === 0) {
            mobile += h;
            residual += l.S[i] - h;
          } else leaked += l.S[i];
        }
      });
      out.inventory.set([mobile, residual, leaked, injected], y * 4);
    };
    const rate = injectedVolume / (injectionYears * HERO_YEAR);
    record(0);
    for (let y = 1; y <= years; y++) {
      const flow = new Float64Array(nF);
      // Overpressure at each fault, held at the year's midpoint, as a height of CO2 column.
      const over = sec.leak.map(f => overpressure(f.distance, y - 0.5, injectionYears) / BAR_PER_HEAD);
      let t = 0,
        sweep = 0;
      while (t < HERO_YEAR - 1e-12) {
        let peak = 0;
        for (const l of L) for (let i = 0; i < n; i++) peak = Math.max(peak, mobileThickness(l.S[i], l.hMax[i], R));
        // Explicit stability: K h dt stays below 0.45 (dx = 1 in solver units).
        const dt = Math.min(HERO_YEAR - t, 0.02, 0.45 / (K * peak + 1e-9));
        L.forEach(l => transport(l, dt, sweep % 2 === 1));
        sec.faultCells.forEach(cells => L.forEach((l, j) => {
          const k = cells[j];
          if (k > 0 && k < n) balanceFaultContact(l.S, k - 1, k, l.roofL[k] / HERO_UNIT, l.roofR[k] / HERO_UNIT, l.cap[k - 1], l.cap[k], l.hMax, R);
        }));
        L.forEach(settle);
        // A fault leaks while buoyancy plus overpressure beats its entry pressure. One step never takes more
        // than the mobile CO2 at the fault, nor so much that the potential would drop below zero.
        sec.leak.forEach((fault, i) => {
          const [k, up] = sec.faultCells[i];
          const h = mobileThickness(L[0].S[k], L[0].hMax[k], R);
          const psi = h + over[i] - fault.entryHead;
          const want = Math.min(Math.min(h, psi) * (1 - R), faultFlux(fault.conductance, psi, fault.caprock) * dt);
          if (!(want > 0)) return;
          const moved = want - deposit(L[1], up, want);
          L[0].S[k] -= moved;
          flow[i] += moved;
        });
        if (y <= injectionYears) {
          HERO_WEIGHTS.forEach((w, j) => {
            const amount = rate * dt * w / 1.2;
            const rest = deposit(L[0], sec.wellCell + j - 2, amount);
            injected += amount - rest;
            out.lost += rest;
          });
        }
        L.forEach(settle);
        t += dt;
        sweep++;
      }
      out.faultFlow.set(Array.from(flow, v => v / HERO_YEAR), y * nF);
      record(y);
    }
    return out;
  };

  // Views into one recorded year (no copies), plus the volume each fault has passed so far.
  const frameOf = (run, year) => {
    const y = Math.max(0, Math.min(run.years, Math.round(year))),
      a = y * run.nodes,
      b = a + run.nodes;
    const [mobile, residual, leaked, injected] = run.inventory.subarray(y * 4, y * 4 + 4);
    const faultLeaked = new Float64Array(run.faults);
    for (let t = 1; t <= y; t++) for (let i = 0; i < run.faults; i++) faultLeaked[i] += run.faultFlow[t * run.faults + i] * HERO_YEAR;
    return {
      S: run.S[0].subarray(a, b),
      h: run.h[0].subarray(a, b),
      hMax: run.hMax[0].subarray(a, b),
      S2: run.S[1].subarray(a, b),
      h2: run.h[1].subarray(a, b),
      h2Max: run.hMax[1].subarray(a, b),
      faultFlow: run.faultFlow.subarray(y * run.faults, (y + 1) * run.faults),
      faultLeaked,
      inventory: {
        mobile,
        residual,
        leaked,
        injected
      }
    };
  };

  // What the label beside a leaking fault says: which fault, and the terms of its driving potential in bar
  // (CO2 buoyancy, injection overpressure, entry pressure).
  // A steady leak drains the column until buoyancy plus overpressure sits at the entry pressure: 'held'.
  const leakReadout = (g, sec, frame, year, injectionYears = 30) => {
    let i = -1;
    frame.faultFlow.forEach((v, j) => {
      if (v > 0 && (i < 0 || v > frame.faultFlow[i])) i = j;
    });
    if (i < 0) return null;
    const tenth = v => Math.round(v * 10) / 10;
    const buoyancy = tenth(frame.h[sec.faultCells[i][0]] * BAR_PER_HEAD);
    const over = tenth(overpressure(sec.leak[i].distance, year, injectionYears));
    const entry = tenth(g.faults[i].entryPressure);
    return {
      fault: i,
      state: buoyancy + over > entry + 1e-9 ? 'above' : 'held',
      buoyancy,
      overpressure: over,
      entry
    };
  };
  const depthToY = metres => HERO_DEPTH.breakY + (metres - HERO_DEPTH.breakDepth) / HERO_DEPTH.metresPerUnit;
  const depthTicks = () => [1000, 1500, 2000];
  // Horizontal metres per pixel over vertical metres per pixel of the rendered section.
  const exaggeration = (widthPx, heightPx) => Math.max(1, Math.round(HERO_DEPTH.sectionWidth / widthPx / (HERO_DEPTH.metresPerUnit * 580 / heightPx)));
  // Playback speed in simulated years per second: slow while injecting, eased up to fast migration.
  const yearsPerSecond = (year, injectionYears = 30) => {
    const t = Math.max(0, Math.min(1, (year - injectionYears) / 10));
    return 8 + 52 * t * t * (3 - 2 * t);
  };
  return {
    randomGeology,
    capRockBaseProfile,
    stratumBaseProfile,
    getStratumFaultIntersection,
    getFaultIntersection,
    stratumY,
    capRockY,
    layerThicknessAt,
    balanceFaultContact,
    mobileThickness,
    storedVolume,
    section,
    simulate,
    frameOf,
    leakReadout,
    faultFlux,
    overpressure,
    percent,
    BAR_PER_HEAD,
    HERO_DEPTH,
    depthToY,
    depthTicks,
    exaggeration,
    yearsPerSecond
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = HeroGeology;

// File: SubsurfaceHero.jsx
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
// SubsurfaceHero.jsx — the landing hero: a moonlit Highland field site above a live
// vertical-equilibrium section of CO2 injected into a faulted saline aquifer.
// Geometry, physics and the depth scale live in hero-geology.js (shared with the worker and tests).

// [destructured React]

// ---- hero playback helpers (pure; tests/hero-model.test.js evaluates this block)
const heroInitialPlayback = reducedMotion => ({
  year: reducedMotion ? 400 : 0,
  playing: !reducedMotion
});
const heroShouldTick = ({
  playing,
  visible,
  hidden
}) => playing && visible && !hidden;
const heroPhase = (year, injectionYears, ship = 'moored') => {
  if (year >= injectionYears) return 'migrating';
  if (ship === 'arriving' || ship === 'away') return 'carrier arriving';
  return ship === 'connecting' ? 'connecting the hose' : 'injecting';
};
// The CO2 carrier: away -> arriving -> connecting -> moored (injection runs) -> disconnecting -> departing -> away.
// Manoeuvres take real seconds; injection years only advance while the carrier is moored and connected.
const HERO_SHIP_SECONDS = {
  arriving: 3.2,
  connecting: 0.8,
  disconnecting: 1,
  departing: 10
};
const HERO_SHIP_NEXT = {
  arriving: 'connecting',
  connecting: 'moored',
  disconnecting: 'departing',
  departing: 'away'
};
const heroShipStep = (ship, dt, wantMoored, seconds = HERO_SHIP_SECONDS) => {
  let {
    phase,
    p
  } = ship;
  if (wantMoored) {
    // A restart reconnects a hose that is still coming off, or brings the carrier back in.
    if (phase === 'disconnecting') {
      phase = 'connecting';
      p = 1 - p;
    } else if (phase === 'away' || phase === 'departing') {
      phase = 'arriving';
      p = 0;
    }
  } else if (phase === 'moored') {
    phase = 'disconnecting';
    p = 0;
  } else if (phase === 'connecting') {
    phase = 'disconnecting';
    p = 1 - p;
  } else if (phase === 'arriving') return {
    phase: 'away',
    p: 1
  };
  if (phase === 'moored' || phase === 'away') return {
    phase,
    p: 1
  };
  p += seconds[phase] > 0 ? dt / seconds[phase] : 1;
  return p < 1 ? {
    phase,
    p
  } : {
    phase: HERO_SHIP_NEXT[phase],
    p: HERO_SHIP_NEXT[phase] === 'moored' || HERO_SHIP_NEXT[phase] === 'away' ? 1 : 0
  };
};
const heroCanAdvance = (year, injectionYears, ship) => year >= injectionYears || ship === 'moored';
// Scrubbing is a jump in time, so the carrier jumps to where it belongs in that year.
const heroShipFor = (year, injectionYears) => year < injectionYears ? {
  phase: 'moored',
  p: 1
} : {
  phase: 'away',
  p: 1
};
// Where the carrier is in its manoeuvre, as a sideways offset in site units at a constant size. It runs in
// from beyond the right edge, slowing as it comes alongside, and leaves bow-first to the left, behind the
// platform, fading into the dark.
const heroShipPose = ({
  phase,
  p
}) => {
  if (phase === 'away') return null;
  if (phase === 'arriving') {
    return {
      x: 640 * (1 - p) ** 3,
      opacity: Math.min(1, p / 0.1),
      wake: (1 - p) ** 2,
      hose: 0,
      lights: 0
    };
  }
  if (phase === 'departing') {
    return {
      x: -1100 * p * p,
      opacity: p < 0.55 ? 1 : (1 - p) / 0.45,
      wake: Math.min(1, 2 * p),
      hose: 0,
      lights: 0
    };
  }
  const hose = phase === 'connecting' ? p : phase === 'disconnecting' ? 1 - p : 1;
  return {
    x: 0,
    opacity: 1,
    wake: 0,
    hose,
    lights: 1
  };
};
// The completion, in section units of depth: a packer in the caprock above the storage roof, then
// perforations every 8 units (24 m) down to a short sump above TD, which the model sets.
const heroWellLayout = (roofY, td) => {
  const perforations = [];
  for (let y = roofY + 5; y <= td - 5; y += 8) perforations.push(Math.round(y * 10) / 10);
  return {
    packer: roofY - 7,
    perforations,
    td
  };
};
// Where the CO2 in the pipes has got to: 6 section units per injection year, so the pulses move at
// about 35 px/s at normal speed, stand still when the hero is paused and stop with injection.
const heroFlowPhase = year => Math.round(year * 60) / 10;
// ---- end hero playback helpers

// Percent of injected CO2 for display: a trace that rounds to nothing still reads as "<0.1".
const heroPercentText = (value, total) => {
  const share = HeroGeology.percent(value, total);
  return share === 0 && value > 0 ? '<0.1' : String(share);
};
const HERO_YEARS = 2000;
const HERO_UNIT = 15; // SVG units per solver unit of height
// One random section per page load; the worker simulates it.
const heroGeology = HeroGeology.randomGeology();
const heroSection = HeroGeology.section(heroGeology);
const [heroStorage, heroOverlying] = heroSection.layers;
const {
  capRockY,
  stratumY,
  layerThicknessAt,
  getFaultIntersection,
  getStratumFaultIntersection
} = HeroGeology;
const HERO_PROFILES = [{
  icon: 'scholar',
  label: 'Google Scholar profile',
  href: SITE_LINKS.scholar
}, {
  icon: 'orcid',
  label: 'ORCID record',
  href: SITE_LINKS.orcid
}, {
  icon: 'github',
  label: 'GitHub profile',
  href: SITE_LINKS.github
}, {
  icon: 'linkedin',
  label: 'LinkedIn profile',
  href: SITE_LINKS.linkedin
}, {
  icon: 'mail',
  label: 'Email Sa’eed Telvari',
  href: `mailto:${SITE_LINKS.email}`
}];
const heroFixed = value => Math.round(value * 10) / 10;
const heroRoof = layer => (k, side) => side === 'L' ? layer.roofL[k] : layer.roofR[k];
const heroFloor = layer => (k, side) => side === 'L' ? layer.floorL[k] : layer.floorR[k];
const HERO_NO_STEPS = new Uint8Array(201);

// Closed ribbon between two boundaries from node a to node b. top/bottom(k, side) return SVG y;
// side 'L' is the cell left of node k and 'R' the cell on its right. Nodes flagged in the step
// arrays get a vertical segment, so a fault is drawn as a step and never as a diagonal.
const heroRibbon = (top, topSteps, bottom, bottomSteps, a = 0, b = 200) => {
  let d = '';
  for (let k = a; k <= b; k++) {
    const x = k * 5;
    if (k === a) d = `M${x} ${heroFixed(top(k, 'R'))}`;else if (topSteps[k]) d += `L${x} ${heroFixed(top(k, 'L'))}L${x} ${heroFixed(top(k, 'R'))}`;else d += `L${x} ${heroFixed(top(k, 'R'))}`;
  }
  for (let k = b; k >= a; k--) {
    const x = k * 5;
    if (bottomSteps[k] && k > a) d += `L${x} ${heroFixed(bottom(k, 'R'))}L${x} ${heroFixed(bottom(k, 'L'))}`;else d += `L${x} ${heroFixed(bottom(k, 'R'))}`;
  }
  return `${d}Z`;
};
const HERO_PATHS = {
  storage: heroRibbon(heroRoof(heroStorage), heroStorage.faultTop, heroFloor(heroStorage), heroStorage.faultBottom),
  overlying: heroRibbon(heroRoof(heroOverlying), heroOverlying.faultTop, heroFloor(heroOverlying), heroOverlying.faultBottom),
  caprock: heroRibbon(heroFloor(heroOverlying), heroOverlying.faultBottom, heroRoof(heroStorage), heroStorage.faultTop),
  underburden: heroRibbon(heroFloor(heroStorage), heroStorage.faultBottom, () => 580, HERO_NO_STEPS)
};

// Fault traces and the segment each one leaks through: storage roof up to the overlying aquifer's base,
// then the buoyant rise through the overlying aquifer to its roof, where leaked CO2 pools.
const HERO_FAULTS = heroGeology.faults.map(fault => {
  const to = getStratumFaultIntersection(fault, 0.4, heroGeology.shallowThickness, heroGeology);
  return {
    top: {
      x: fault.xPercent * 10,
      y: 0
    },
    bottom: {
      x: fault.xPercent * 10 + fault.dipSlope * 480,
      y: 480
    },
    from: getFaultIntersection(fault, 1, heroGeology),
    to,
    rise: {
      x: to.x,
      y: heroOverlying.roofR[Math.max(0, Math.min(200, Math.round(to.x / 5)))] + 3
    }
  };
});

// Labels sit at mid-depth of each unit on the right margin of the section.
const HERO_LABELS = [['wide', 980], ['narrow', 960]].flatMap(([set, x]) => {
  const k = Math.round(x / 5);
  const mid = (a, b) => (a + b) / 2;
  return [['Overburden', heroOverlying.roofR[k] / 2, set === 'wide'], ['Overlying aquifer', mid(heroOverlying.roofR[k], heroOverlying.floorR[k]), true], ['Caprock', mid(heroOverlying.floorR[k], heroStorage.roofR[k]), true], ['Storage aquifer', mid(heroStorage.roofR[k], heroStorage.floorR[k]), true], ['Underburden', mid(heroStorage.floorR[k], 580), set === 'wide']].filter(([,, shown]) => shown).map(([text, y]) => ({
    set,
    text,
    y
  }));
});
const heroDepthTop = y => `calc(var(--hero-surface) + var(--hero-depth) * ${heroFixed(y) / 580})`;

// Mobile plume (roof to roof + h) and swept residual zone (to roof + hMax) of one aquifer.
const heroPlumePaths = (layer, h, hMax) => {
  let a = -1,
    b = -1;
  for (let k = 0; k <= 200; k++) if (hMax[k] > 0.001 || h[k] > 0.001) {
    if (a < 0) a = k;
    b = k;
  }
  if (a < 0) return null;
  a = Math.max(0, a - 1);
  b = Math.min(200, b + 1);
  const roof = heroRoof(layer),
    floor = heroFloor(layer);
  const cell = (k, side) => side === 'L' ? Math.max(0, k - 1) : k;
  const depth = values => (k, side) => Math.min(floor(k, side), roof(k, side) + values[cell(k, side)] * HERO_UNIT);
  const mobile = depth(h),
    swept = depth(hMax);
  let contact = '';
  for (let k = a; k <= b; k++) {
    const pen = h[k] > 0.002 ? contact && h[Math.max(0, k - 1)] > 0.002 ? 'L' : 'M' : '';
    if (!pen) continue;
    if (pen === 'L' && layer.faultBottom[k]) contact += `L${k * 5} ${heroFixed(mobile(k, 'L'))}`;
    contact += `${pen}${k * 5} ${heroFixed(mobile(k, 'R'))}`;
  }
  return {
    mobile: heroRibbon(roof, layer.faultTop, mobile, layer.faultBottom, a, b),
    residual: heroRibbon(mobile, layer.faultBottom, swept, layer.faultBottom, a, b),
    contact
  };
};

// Linear interpolation between two recorded years, so slow playback moves smoothly.
const heroFrameAt = (run, year) => {
  const y0 = Math.floor(year),
    y1 = Math.min(run.years, y0 + 1),
    t = year - y0;
  const a = HeroGeology.frameOf(run, y0),
    b = HeroGeology.frameOf(run, y1);
  const mix = (p, q) => t > 0 ? Float32Array.from(p, (v, i) => v + (q[i] - v) * t) : p;
  const inventory = {};
  for (const key of ['mobile', 'residual', 'leaked', 'injected']) inventory[key] = a.inventory[key] + (b.inventory[key] - a.inventory[key]) * t;
  return {
    h: mix(a.h, b.h),
    hMax: mix(a.hMax, b.hMax),
    h2: mix(a.h2, b.h2),
    h2Max: mix(a.h2Max, b.h2Max),
    faultFlow: b.faultFlow,
    faultLeaked: mix(a.faultLeaked, b.faultLeaked),
    inventory
  };
};
const SubsurfaceHero = ({
  onNavigate
}) => {
  const heroRef = useRef(null);
  const sectionRef = useRef(null);
  const yearRef = useRef(0);
  const initial = useMemo(() => heroInitialPlayback(siteReducedMotion()), []);
  const [run, setRun] = useState(null);
  const [year, setYear] = useState(initial.year);
  const [playing, setPlaying] = useState(initial.playing);
  const [speed, setSpeed] = useState(1);
  const [visible, setVisible] = useState(true);
  const [hidden, setHidden] = useState(() => document.hidden);
  const [exaggeration, setExaggeration] = useState(2);
  const [ship, setShip] = useState({
    phase: 'away',
    p: 1
  });
  const shipRef = useRef(ship);
  // Under reduced motion the carrier's manoeuvres complete at once.
  const shipSeconds = useMemo(() => siteReducedMotion() ? {
    arriving: 0,
    connecting: 0,
    disconnecting: 0,
    departing: 0
  } : HERO_SHIP_SECONDS, []);
  yearRef.current = year;

  // The model runs once per page load, off the main thread when possible.
  useEffect(() => {
    const options = {
      years: HERO_YEARS
    };
    if (!window.Worker) {
      const timer = setTimeout(() => setRun(HeroGeology.simulate(heroGeology, options)), 0);
      return () => clearTimeout(timer);
    }
    const worker = new Worker('./hero-simulation-worker.js?v=10');
    worker.onmessage = event => setRun(event.data);
    worker.onerror = () => setRun(HeroGeology.simulate(heroGeology, options));
    worker.postMessage({
      geology: heroGeology,
      options
    });
    return () => worker.terminate();
  }, []);

  // Playback stops while the hero is off-screen or the tab is hidden.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (heroRef.current) observer.observe(heroRef.current);
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Vertical exaggeration of the rendered section (horizontal m/px over vertical m/px).
  useEffect(() => {
    const element = sectionRef.current;
    if (!element || !('ResizeObserver' in window)) return undefined;
    const sizes = new ResizeObserver(([entry]) => {
      const {
        width,
        height
      } = entry.contentRect;
      if (width && height) setExaggeration(HeroGeology.exaggeration(width, height));
    });
    sizes.observe(element);
    return () => sizes.disconnect();
  }, []);

  // One clock drives the carrier and the model: injection years wait until the carrier is moored and connected.
  useEffect(() => {
    if (!heroShouldTick({
      playing,
      visible,
      hidden
    })) return undefined;
    let frameId = 0,
      last = 0;
    const tick = now => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      const injectionEnd = run ? run.injectionYears : 30;
      const nextShip = heroShipStep(shipRef.current, dt, yearRef.current < injectionEnd, shipSeconds);
      if (nextShip.phase !== shipRef.current.phase || nextShip.p !== shipRef.current.p) {
        shipRef.current = nextShip;
        setShip(nextShip);
      }
      if (run && heroCanAdvance(yearRef.current, injectionEnd, nextShip.phase)) {
        const next = Math.min(HERO_YEARS, yearRef.current + dt * HeroGeology.yearsPerSecond(yearRef.current, injectionEnd) * speed);
        yearRef.current = next;
        setYear(next);
        if (next >= HERO_YEARS) {
          setPlaying(false);
          return;
        }
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [run, playing, speed, visible, hidden, shipSeconds]);
  const frame = useMemo(() => run ? heroFrameAt(run, year) : null, [run, year]);
  // The strongest leak of this run sets the scale: its dots move about 40 px/s at full migration speed.
  const leakScale = useMemo(() => {
    const peak = run ? run.faultFlow.reduce((max, v) => Math.max(max, v), 0) : 0;
    return {
      peak,
      dots: peak > 0 ? 40 / (60 * peak * run.yearLength) : 0
    };
  }, [run]);
  const injectionYears = run ? run.injectionYears : 30;
  // CO2 is in the pipes while the carrier is connected during the injection years; its flow follows the clock.
  const flow = run && year < injectionYears && ship.phase === 'moored' ? heroFlowPhase(year) : null;
  const jumpShip = value => {
    shipRef.current = heroShipFor(value, injectionYears);
    setShip(shipRef.current);
  };
  const controls = {
    toggle: () => {
      if (!playing && yearRef.current >= HERO_YEARS) setYear(0);
      setPlaying(!playing);
    },
    scrub: value => {
      setYear(value);
      setPlaying(false);
      jumpShip(value);
    },
    restart: () => {
      setYear(0);
      setPlaying(true);
    },
    speed: () => setSpeed(s => s === 1 ? 2 : s === 2 ? 4 : 1)
  };
  return /*#__PURE__*/React.createElement("section", {
    id: "home",
    ref: heroRef,
    className: "hero-scene",
    "aria-labelledby": "hero-name",
    "data-visible": visible && !hidden ? 'true' : 'false'
  }, /*#__PURE__*/React.createElement(Sky, null), /*#__PURE__*/React.createElement(HeroSection, {
    sectionRef: sectionRef
  }), /*#__PURE__*/React.createElement(HeroPlume, {
    frame: frame,
    leakScale: leakScale
  }), /*#__PURE__*/React.createElement(HeroOverlay, null), /*#__PURE__*/React.createElement(HeroWell, {
    flow: flow
  }), /*#__PURE__*/React.createElement(SurfaceSite, {
    geology: heroGeology,
    flow: flow,
    ship: ship
  }), /*#__PURE__*/React.createElement(HeroLabels, null), /*#__PURE__*/React.createElement(HeroLeakReadout, {
    frame: frame,
    year: year,
    injectionYears: injectionYears
  }), /*#__PURE__*/React.createElement(Identity, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement(HeroPlayer, {
    year: year,
    playing: playing,
    speed: speed,
    frame: frame,
    injectionYears: injectionYears,
    ship: ship.phase,
    exaggeration: exaggeration,
    controls: controls
  }));
};

/* =====================================================
   Section — rock units, bedding and textures (static per page load)
   ===================================================== */
const HeroSection = React.memo(({
  sectionRef
}) => {
  const AQUIFER_PATH = HERO_PATHS.underburden;
  // Fine bedding is decoration: draw it once the hero has painted.
  const [detail, setDetail] = useState(false);
  useEffect(() => {
    const show = () => setDetail(true);
    const idle = window.requestIdleCallback;
    const id = idle ? idle(show, {
      timeout: 1200
    }) : window.setTimeout(show, 200);
    return () => idle ? window.cancelIdleCallback(id) : window.clearTimeout(id);
  }, []);
  return /*#__PURE__*/React.createElement("svg", {
    ref: sectionRef,
    className: "hero-svg hero-svg--rock",
    viewBox: "0 0 1000 580",
    preserveAspectRatio: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("pattern", {
    id: "hero-shale",
    width: "18",
    height: "6",
    patternUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "18",
    height: "6",
    className: "hero-rock--cap"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M1 3h9M12 1h5",
    stroke: "#9fb3c8",
    strokeOpacity: ".3",
    strokeWidth: ".8"
  })), /*#__PURE__*/React.createElement("clipPath", {
    id: "hero-lower-rock"
  }, /*#__PURE__*/React.createElement("path", {
    d: AQUIFER_PATH
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "hero-lower-texture",
    x1: "0",
    y1: "280",
    x2: "0",
    y2: "580",
    gradientUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("stop", {
    stopColor: "white",
    stopOpacity: "0"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "white",
    stopOpacity: ".65"
  })), /*#__PURE__*/React.createElement("mask", {
    id: "hero-lower-texture-mask",
    maskUnits: "userSpaceOnUse",
    x: "0",
    y: "0",
    width: "1000",
    height: "580"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "1000",
    height: "580",
    fill: "url(#hero-lower-texture)"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "hero-descent-bridge",
    x1: "0",
    y1: "490",
    x2: "0",
    y2: "580",
    gradientUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("stop", {
    stopColor: "#1d150f",
    stopOpacity: "0"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "#1d150f"
  }))), /*#__PURE__*/React.createElement("rect", {
    width: "1000",
    height: "580",
    className: "hero-rock--over"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "1000",
    height: "3",
    fill: "#0b1a2c"
  }), /*#__PURE__*/React.createElement("path", {
    d: HERO_PATHS.caprock,
    fill: "url(#hero-shale)"
  }), /*#__PURE__*/React.createElement("path", {
    d: HERO_PATHS.overlying,
    className: "hero-rock--sand"
  }), /*#__PURE__*/React.createElement("path", {
    d: HERO_PATHS.storage,
    className: "hero-rock--sand"
  }), /*#__PURE__*/React.createElement("path", {
    d: AQUIFER_PATH,
    className: "hero-rock--base"
  }), /*#__PURE__*/React.createElement("g", {
    clipPath: "url(#hero-lower-rock)"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "1000",
    height: "580",
    fill: "url(#descent-rock-shale)",
    mask: "url(#hero-lower-texture-mask)"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "1000",
    height: "580",
    fill: "url(#hero-descent-bridge)"
  })), detail && /*#__PURE__*/React.createElement(GeologyTexture, {
    faults: heroGeology.faults,
    geology: heroGeology
  }), HERO_FAULTS.map((fault, i) => /*#__PURE__*/React.createElement("line", {
    key: i,
    x1: fault.from.x,
    y1: fault.from.y,
    x2: fault.to.x,
    y2: fault.to.y,
    className: "hero-fault-zone",
    vectorEffect: "non-scaling-stroke"
  })));
});

// Static rock detail is built once per geology, independent of simulation frames.
const GeologyTexture = ({
  faults,
  geology: g
}) => useMemo(() => {
  const reservoirPaths = [HERO_PATHS.overlying, HERO_PATHS.storage];
  const trace = elevation => {
    let path = '';
    for (let i = 0; i < 200; i++) {
      const x = i * 5;
      const y = elevation(x, i);
      // Break at displaced contacts instead of drawing a diagonal across a fault.
      const move = !i || Math.abs(y - elevation(x, i - 1)) > 0.1;
      path += ` ${move ? 'M' : 'L'} ${x} ${y} L ${x + 5} ${elevation(x + 5, i)}`;
    }
    return path;
  };
  const sealLines = Array.from({
    length: 23
  }, (_, i) => trace((x, cell) => capRockY(x, faults, cell, (i + 1) / 24, g)));
  const lowerLines = Array.from({
    length: 25
  }, (_, i) => trace((x, cell) => stratumY(x, faults, cell, 1, g.reservoirThickness + (i + 1) * 320 / 26, g)));
  const reservoirLines = [0.4, 1].flatMap(depth => Array.from({
    length: depth === 1 ? 8 : 3
  }, (_, i) => {
    const fraction = (i + 1) / (depth === 1 ? 9 : 4);
    return trace((x, cell) => capRockY(x, faults, cell, depth, g) + fraction * layerThicknessAt(x, depth, faults, cell, g));
  }));
  return /*#__PURE__*/React.createElement("g", {
    "data-layer": "geology-texture"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
    id: "rock-reservoirs"
  }, reservoirPaths.map((d, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: d
  }))), /*#__PURE__*/React.createElement("mask", {
    id: "rock-seals",
    maskUnits: "userSpaceOnUse",
    x: "0",
    y: "0",
    width: "1000",
    height: "580"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "1000",
    height: "580",
    fill: "white"
  }), reservoirPaths.map((d, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: d,
    fill: "black"
  }))), /*#__PURE__*/React.createElement("pattern", {
    id: "rock-grain",
    width: "137",
    height: "89",
    patternUnits: "userSpaceOnUse"
  }, Array.from({
    length: 90
  }, (_, i) => /*#__PURE__*/React.createElement("ellipse", {
    key: i,
    cx: (i * 47.13 + 7) % 137,
    cy: (i * i * 13.71 + 11) % 89,
    rx: 0.35 + i % 4 * 0.13,
    ry: 0.25 + i % 3 * 0.12,
    fill: i % 3 ? '#b8c7d6' : '#05080f',
    opacity: i % 3 ? 0.13 : 0.3
  })))), /*#__PURE__*/React.createElement("rect", {
    width: "1000",
    height: "580",
    fill: "url(#rock-grain)",
    opacity: "0.5"
  }), /*#__PURE__*/React.createElement("g", {
    mask: "url(#rock-seals)",
    fill: "none",
    stroke: "#c5b8b1",
    strokeWidth: "0.65"
  }, [...sealLines, ...lowerLines].map((d, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: d,
    opacity: i % 4 === 0 ? 0.12 : 0.05,
    strokeDasharray: i % 3 === 0 ? '31 5 9 3 57 7' : undefined
  }))), /*#__PURE__*/React.createElement("g", {
    clipPath: "url(#rock-reservoirs)"
  }, reservoirLines.map((d, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: d,
    fill: "none",
    stroke: "#93b7c2",
    strokeWidth: "0.7",
    opacity: "0.12",
    strokeDasharray: "47 6 18 4 83 9"
  }))));
}, [faults, g]);

/* =====================================================
   Plume — CO2 in the simulator's class colours, redrawn per frame
   ===================================================== */
const HeroPlume = ({
  frame,
  leakScale
}) => {
  if (!frame) return null;
  const storage = heroPlumePaths(heroStorage, frame.h, frame.hMax);
  const overlying = heroPlumePaths(heroOverlying, frame.h2, frame.h2Max);
  return /*#__PURE__*/React.createElement("svg", {
    className: "hero-svg hero-svg--plume",
    viewBox: "0 0 1000 580",
    preserveAspectRatio: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
    id: "hero-in-storage"
  }, /*#__PURE__*/React.createElement("path", {
    d: HERO_PATHS.storage
  })), /*#__PURE__*/React.createElement("clipPath", {
    id: "hero-in-overlying"
  }, /*#__PURE__*/React.createElement("path", {
    d: HERO_PATHS.overlying
  })), /*#__PURE__*/React.createElement("pattern", {
    id: "hero-residual",
    width: "6",
    height: "6",
    patternUnits: "userSpaceOnUse",
    patternTransform: "rotate(45)"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "6",
    height: "6",
    className: "hero-fill--residual-soft"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "2",
    height: "6",
    className: "hero-fill--residual"
  })), /*#__PURE__*/React.createElement("pattern", {
    id: "hero-leaked-residual",
    width: "6",
    height: "6",
    patternUnits: "userSpaceOnUse",
    patternTransform: "rotate(45)"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "6",
    height: "6",
    className: "hero-fill--leaked-soft"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "2",
    height: "6",
    className: "hero-fill--leaked"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "hero-mobile",
    x1: "0",
    x2: "0",
    y1: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    className: "hero-stop--free-glow"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    className: "hero-stop--free"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "hero-leaked",
    x1: "0",
    x2: "0",
    y1: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    className: "hero-stop--leaked-glow"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    className: "hero-stop--leaked"
  }))), storage && /*#__PURE__*/React.createElement("g", {
    clipPath: "url(#hero-in-storage)",
    "data-layer": "storage-plume"
  }, /*#__PURE__*/React.createElement("path", {
    d: storage.residual,
    fill: "url(#hero-residual)"
  }), /*#__PURE__*/React.createElement("path", {
    d: storage.mobile,
    fill: "url(#hero-mobile)"
  }), /*#__PURE__*/React.createElement("path", {
    d: storage.contact,
    className: "hero-contact",
    fill: "none",
    vectorEffect: "non-scaling-stroke"
  })), overlying && /*#__PURE__*/React.createElement("g", {
    clipPath: "url(#hero-in-overlying)",
    "data-layer": "leaked-plume"
  }, /*#__PURE__*/React.createElement("path", {
    d: overlying.residual,
    fill: "url(#hero-leaked-residual)"
  }), /*#__PURE__*/React.createElement("path", {
    d: overlying.mobile,
    fill: "url(#hero-leaked)"
  })), HERO_FAULTS.map((fault, i) => {
    const flow = frame.faultFlow[i] || 0;
    if (flow <= 0) return null;
    const strength = Math.min(1, Math.sqrt(flow / leakScale.peak));
    const conduit = `M${fault.from.x} ${fault.from.y}L${fault.to.x} ${fault.to.y}`;
    const rise = `M${fault.to.x} ${fault.to.y}L${fault.rise.x} ${heroFixed(fault.rise.y)}`;
    return /*#__PURE__*/React.createElement("g", {
      key: i,
      "data-layer": "fault-leak",
      opacity: 0.45 + 0.55 * strength
    }, /*#__PURE__*/React.createElement("path", {
      d: conduit,
      className: "hero-leak-halo",
      vectorEffect: "non-scaling-stroke"
    }), /*#__PURE__*/React.createElement("path", {
      d: rise,
      className: "hero-leak-halo hero-leak-halo--rise",
      vectorEffect: "non-scaling-stroke"
    }), /*#__PURE__*/React.createElement("path", {
      d: conduit,
      className: "hero-leak",
      vectorEffect: "non-scaling-stroke"
    }), /*#__PURE__*/React.createElement("path", {
      d: conduit + rise.replace('M', 'L'),
      className: "hero-leak-dots",
      strokeDasharray: "0 11",
      strokeDashoffset: heroFixed(-frame.faultLeaked[i] * leakScale.dots),
      vectorEffect: "non-scaling-stroke"
    }));
  }));
};

/* =====================================================
   Overlay — ground surface and the fault traces
   ===================================================== */
const HeroOverlay = React.memo(() => /*#__PURE__*/React.createElement("svg", {
  className: "hero-svg hero-svg--overlay",
  viewBox: "0 0 1000 580",
  preserveAspectRatio: "none",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("line", {
  x1: "0",
  y1: "0.5",
  x2: "1000",
  y2: "0.5",
  className: "hero-surface-line",
  vectorEffect: "non-scaling-stroke"
}), HERO_FAULTS.map((fault, i) => /*#__PURE__*/React.createElement("line", {
  key: i,
  x1: fault.top.x,
  y1: fault.top.y,
  x2: fault.bottom.x,
  y2: fault.bottom.y,
  className: "hero-fault",
  vectorEffect: "non-scaling-stroke"
}))));

/* =====================================================
   Well — a pixel-true strip over the section: x in px about the well, y in section units
   ===================================================== */
const HERO_WELL = heroWellLayout(heroStorage.roofR[heroSection.wellCell], heroSection.wellBottom);
const HeroWell = React.memo(({
  flow
}) => {
  const {
    packer,
    perforations,
    td
  } = HERO_WELL;
  const bore = `M0 0V${heroFixed(td)}`;
  return /*#__PURE__*/React.createElement("svg", {
    className: "hero-well",
    viewBox: "-40 0 80 580",
    preserveAspectRatio: "none",
    "aria-hidden": "true",
    style: {
      left: `${heroGeology.wellXPct}%`
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "hero-well-flow",
    gradientUnits: "userSpaceOnUse",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "32",
    spreadMethod: "repeat",
    gradientTransform: `translate(0 ${flow || 0})`
  }, /*#__PURE__*/React.createElement("stop", {
    stopColor: "#fff",
    stopOpacity: "0"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: ".5",
    stopColor: "#fff",
    stopOpacity: ".85"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "#fff",
    stopOpacity: "0"
  }))), /*#__PURE__*/React.createElement("path", {
    d: bore,
    className: "hero-well__casing",
    vectorEffect: "non-scaling-stroke"
  }), /*#__PURE__*/React.createElement("path", {
    d: bore,
    className: "hero-well__bore",
    vectorEffect: "non-scaling-stroke"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M0 0V28",
    className: "hero-well__casing hero-well__casing--surface",
    vectorEffect: "non-scaling-stroke"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M0 0V28",
    className: "hero-well__bore hero-well__bore--surface",
    vectorEffect: "non-scaling-stroke"
  }), /*#__PURE__*/React.createElement("path", {
    d: `M-5 ${heroFixed(packer)}H5`,
    className: "hero-well__packer",
    vectorEffect: "non-scaling-stroke"
  }), /*#__PURE__*/React.createElement("path", {
    d: perforations.map(y => `M-3.5 ${y}h-3M3.5 ${y}h3`).join(''),
    className: "hero-well__perforations",
    vectorEffect: "non-scaling-stroke"
  }), flow !== null && /*#__PURE__*/React.createElement("g", {
    className: "hero-well__flow"
  }, /*#__PURE__*/React.createElement("path", {
    d: bore,
    className: "hero-well__co2",
    vectorEffect: "non-scaling-stroke"
  }), /*#__PURE__*/React.createElement("path", {
    d: bore,
    className: "hero-well__pulse",
    stroke: "url(#hero-well-flow)",
    vectorEffect: "non-scaling-stroke"
  })));
});

/* =====================================================
   Labels and the depth axis (HTML, so text is not stretched)
   ===================================================== */
const HeroLabels = React.memo(() => /*#__PURE__*/React.createElement("div", {
  className: "hero-annotations"
}, /*#__PURE__*/React.createElement("p", {
  className: "visually-hidden"
}, "Cross-section, from the surface down: overburden, an overlying aquifer, a caprock, the storage aquifer the well injects into, and underburden, cut by two faults."), /*#__PURE__*/React.createElement("div", {
  className: "hero-axis",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("span", {
  className: "hero-axis__rule hero-axis__rule--upper"
}), /*#__PURE__*/React.createElement("span", {
  className: "hero-axis__break",
  style: {
    top: `${heroFixed(100 * 14 / 580)}%`
  }
}), /*#__PURE__*/React.createElement("span", {
  className: "hero-axis__rule hero-axis__rule--lower",
  style: {
    top: `${heroFixed(100 * 21 / 580)}%`
  }
}), [[0, '0 m'], ...HeroGeology.depthTicks().map(depth => [HeroGeology.depthToY(depth), `${depth} m`])].map(([y, label]) => /*#__PURE__*/React.createElement("span", {
  key: label,
  className: "hero-axis__tick",
  style: {
    top: `${heroFixed(100 * y / 580)}%`
  }
}, label))), HERO_FAULTS.map((fault, i) => /*#__PURE__*/React.createElement("span", {
  key: i,
  className: "hero-fault-label",
  "aria-hidden": "true",
  style: {
    left: `${heroFixed(fault.top.x / 10 + 0.6)}%`
  }
}, "F", i + 1)), HERO_LABELS.map(label => /*#__PURE__*/React.createElement("span", {
  key: `${label.set}-${label.text}`,
  className: `hero-label hero-label--${label.set}`,
  "aria-hidden": "true",
  style: {
    top: heroDepthTop(label.y)
  }
}, label.text))));

/* =====================================================
   Leak readout — beside a leaking fault, from the model's own numbers
   ===================================================== */
const HeroLeakReadout = ({
  frame,
  year,
  injectionYears
}) => {
  const leak = frame && HeroGeology.leakReadout(heroGeology, heroSection, frame, year, injectionYears);
  if (!leak) return null;
  const {
    to
  } = HERO_FAULTS[leak.fault];
  // Sit on the side of the fault away from the well, unless that side has no room for the label.
  const placeLeft = to.x < heroGeology.wellX ? to.x > 380 : to.x > 750;
  const side = placeLeft ? {
    right: `calc(${heroFixed(100 - to.x / 10)}% + 22px)`
  } : {
    left: `calc(${heroFixed(to.x / 10)}% + 22px)`
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "hero-leak-readout",
    "aria-hidden": "true",
    style: {
      ...side,
      top: heroDepthTop(to.y)
    }
  }, /*#__PURE__*/React.createElement("strong", null, "F", leak.fault + 1, " leaking"), /*#__PURE__*/React.createElement("span", null, leak.state === 'above' ? `Buoyancy ${leak.buoyancy} bar${leak.overpressure > 0 ? ` + overpressure ${leak.overpressure} bar` : ''} > entry ${leak.entry} bar` : `${leak.overpressure > 0 ? 'Buoyancy + overpressure' : 'Buoyancy'} held at the ${leak.entry} bar entry pressure`), /*#__PURE__*/React.createElement("span", {
    className: "hero-leak-readout__share"
  }, heroPercentText(frame.inventory.leaked, frame.inventory.injected), "% of injected CO\u2082 has leaked"));
};

/* =====================================================
   Player — controls, the CO2 inventory and the scale note
   ===================================================== */
const HeroPlayer = ({
  year,
  playing,
  speed,
  frame,
  injectionYears,
  ship,
  exaggeration,
  controls
}) => {
  const phase = heroPhase(year, injectionYears, ship);
  const inventory = frame ? frame.inventory : {
    mobile: 0,
    residual: 0,
    leaked: 0,
    injected: 0
  };
  const share = value => heroPercentText(value, inventory.injected);
  const classes = [['mobile', 'Mobile', inventory.mobile], ['residual', 'Residual', inventory.residual], ['leaked', 'Leaked', inventory.leaked]];
  const shownYear = Math.round(year);
  return /*#__PURE__*/React.createElement("div", {
    className: "hero-player",
    role: "group",
    "aria-label": "Live model controls"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-player__controls"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "hero-player__play",
    onClick: controls.toggle,
    "aria-label": playing ? 'Pause simulation' : 'Play simulation'
  }, /*#__PURE__*/React.createElement(Icon, {
    name: playing ? 'pause' : 'play',
    size: 14
  })), /*#__PURE__*/React.createElement("input", {
    className: "hero-player__scrub",
    type: "range",
    min: "0",
    max: HERO_YEARS,
    step: "1",
    value: shownYear,
    "aria-label": "Simulation year",
    "aria-valuetext": `Year ${shownYear}, ${phase}`,
    onChange: event => controls.scrub(parseFloat(event.target.value))
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "hero-player__small",
    onClick: controls.restart,
    "aria-label": "Restart simulation"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "restart",
    size: 15
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "hero-player__small hero-player__speed",
    onClick: controls.speed,
    "aria-label": `Playback speed ${speed} times`
  }, speed, "\xD7")), /*#__PURE__*/React.createElement("p", {
    className: "hero-player__title"
  }, "Live VE model, year ", /*#__PURE__*/React.createElement("span", {
    className: "hero-player__year"
  }, shownYear), " ", /*#__PURE__*/React.createElement("span", {
    className: "hero-player__phase"
  }, phase)), /*#__PURE__*/React.createElement("div", {
    className: "hero-player__bar",
    role: "img",
    "aria-label": `Of the CO₂ injected so far: ${share(inventory.mobile)}% mobile, ${share(inventory.residual)}% residually trapped, ${share(inventory.leaked)}% leaked into the overlying aquifer.`
  }, classes.map(([key,, value]) => /*#__PURE__*/React.createElement("span", {
    key: key,
    className: `is-${key}`,
    style: {
      width: `${inventory.injected > 0 ? 100 * value / inventory.injected : 0}%`
    }
  }))), /*#__PURE__*/React.createElement("ul", {
    className: "hero-player__legend",
    "aria-hidden": "true"
  }, classes.map(([key, label, value]) => /*#__PURE__*/React.createElement("li", {
    key: key
  }, /*#__PURE__*/React.createElement("i", {
    className: `is-${key}`
  }), label, " ", share(value), "%"))), /*#__PURE__*/React.createElement("p", {
    className: "hero-player__note"
  }, "Schematic saline aquifer, 10 km wide, vertical exaggeration \xD7", exaggeration, "."));
};

/* =====================================================
   Sky — moonlight and drifting clouds above a Highland field site.
   ===================================================== */
const Sky = () => {
  const skyRef = useRef(null);
  useEffect(() => {
    const sky = skyRef.current;
    const hero = sky.closest('#home');
    const starsLayer = sky.querySelector('.hero-stars');
    const stars = [...starsLayer.children];
    const motion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame;
    const reset = () => {
      window.cancelAnimationFrame(frame);
      stars.forEach(star => star.style.setProperty('--star-near', '0'));
    };
    const move = event => {
      if (!motion.matches || event.pointerType !== 'mouse') return;
      const rect = sky.getBoundingClientRect();
      const x = event.clientX - rect.left,
        y = event.clientY - rect.top;
      if (!rect.width || !rect.height || x < 0 || x > rect.width || y < 0 || y > rect.height) {
        reset();
        return;
      }
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        stars.forEach(star => {
          const sx = parseFloat(star.style.left) / 100 * rect.width;
          const sy = parseFloat(star.style.top) / 100 * rect.height;
          const proximity = Math.max(0, 1 - Math.hypot(x - sx, y - sy) / 90);
          star.style.setProperty('--star-near', proximity.toFixed(3));
        });
      });
    };
    hero.addEventListener('pointermove', move, {
      passive: true
    });
    hero.addEventListener('pointerleave', reset);
    window.addEventListener('scroll', reset, {
      passive: true
    });
    motion.addEventListener('change', reset);
    return () => {
      reset();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', reset);
      window.removeEventListener('scroll', reset);
      motion.removeEventListener('change', reset);
    };
  }, []);
  return useMemo(() => /*#__PURE__*/React.createElement("div", {
    ref: skyRef,
    "data-layer": "sky",
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: '0 0 auto',
      height: 'var(--hero-surface)',
      overflow: 'hidden',
      pointerEvents: 'none',
      background: 'linear-gradient(180deg, #070d1a 0%, #111e32 58%, #253449 100%)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse at 82% 28%, rgba(159,183,209,0.1), transparent 52%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "hero-stars"
  }, Array.from({
    length: 108
  }, (_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: `hero-star${i % 7 === 0 ? ' hero-star-twinkle' : ''}`,
    style: {
      left: `${(i * 61.803 + 3) % 100}%`,
      top: `${10 + i * i * 17.31 % 67}%`,
      width: i % 11 === 0 ? 2 : 1.25,
      height: i % 11 === 0 ? 2 : 1.25,
      '--star-base': 0.32 + i % 5 * 0.08,
      '--star-period': `${6 + i % 5}s`,
      '--star-delay': `${-i * .73}s`,
      boxShadow: i % 11 === 0 ? '0 0 5px rgba(176,206,238,0.35)' : 'none'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "hero-moon"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 64 64",
    width: "100%",
    height: "100%"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("radialGradient", {
    id: "moon-disc",
    cx: ".35",
    cy: ".3",
    r: ".75"
  }, /*#__PURE__*/React.createElement("stop", {
    stopColor: "#edf0e5"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: ".7",
    stopColor: "#c8d1cf"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "#97a8b6"
  })), /*#__PURE__*/React.createElement("filter", {
    id: "moon-soft"
  }, /*#__PURE__*/React.createElement("feGaussianBlur", {
    stdDeviation: ".6"
  }))), /*#__PURE__*/React.createElement("circle", {
    cx: "32",
    cy: "32",
    r: "29",
    fill: "url(#moon-disc)",
    filter: "url(#moon-soft)"
  }), /*#__PURE__*/React.createElement("g", {
    fill: "#697f91",
    opacity: ".15",
    filter: "url(#moon-soft)"
  }, /*#__PURE__*/React.createElement("ellipse", {
    cx: "22",
    cy: "23",
    rx: "7",
    ry: "9"
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "37",
    cy: "41",
    rx: "9",
    ry: "7"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "43",
    cy: "22",
    r: "4"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "20",
    cy: "42",
    r: "3"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "hero-night-clouds",
    style: {
      position: 'absolute',
      inset: 0,
      opacity: .55
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 1000 420",
    preserveAspectRatio: "none",
    width: "104%",
    height: "100%",
    style: {
      marginLeft: '-2%'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "night-cloud-lit",
    x1: "0",
    y1: "0",
    x2: "0.2",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    stopColor: "#a1b6cd",
    stopOpacity: "0.45"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "25%",
    stopColor: "#536780",
    stopOpacity: "0.60"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "65%",
    stopColor: "#23324a",
    stopOpacity: "0.88"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#152137",
    stopOpacity: "0"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "night-cloud-shadow",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    stopColor: "#34415d",
    stopOpacity: "0.72"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "30%",
    stopColor: "#131d31",
    stopOpacity: "0.94"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#101b2c",
    stopOpacity: "0"
  })), /*#__PURE__*/React.createElement("filter", {
    id: "night-cloud-texture",
    x: "-10%",
    y: "-30%",
    width: "120%",
    height: "160%",
    colorInterpolationFilters: "sRGB"
  }, /*#__PURE__*/React.createElement("feTurbulence", {
    type: "fractalNoise",
    baseFrequency: "0.009 0.025",
    numOctaves: "3",
    seed: "12",
    result: "cloud-noise"
  }), /*#__PURE__*/React.createElement("feColorMatrix", {
    in: "cloud-noise",
    type: "matrix",
    values: "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  3 0 0 0 -1",
    result: "cloud-density"
  }), /*#__PURE__*/React.createElement("feDisplacementMap", {
    in: "SourceGraphic",
    in2: "cloud-noise",
    scale: "38",
    xChannelSelector: "R",
    yChannelSelector: "G"
  }), /*#__PURE__*/React.createElement("feGaussianBlur", {
    stdDeviation: "6"
  }), /*#__PURE__*/React.createElement("feComposite", {
    in2: "cloud-density",
    operator: "in"
  }), /*#__PURE__*/React.createElement("feGaussianBlur", {
    stdDeviation: "1"
  }))), /*#__PURE__*/React.createElement("g", {
    filter: "url(#night-cloud-texture)"
  }, /*#__PURE__*/React.createElement("g", {
    fill: "url(#night-cloud-lit)"
  }, /*#__PURE__*/React.createElement("path", {
    opacity: "0.55",
    d: "M 390 144 C 445 130 471 147 511 125 C 537 111 563 122 594 110 C 631 92 661 109 687 90 C 729 66 755 91 798 77 C 859 62 882 98 936 84 L 1100 81 L 1100 226 C 916 223 858 185 715 203 C 596 213 496 171 390 185 Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M 557 215 C 603 188 625 207 650 187 C 677 165 699 182 722 159 C 741 143 764 163 782 149 C 816 121 839 147 864 136 C 887 126 917 155 943 140 C 991 114 1041 138 1100 118 L 1100 314 C 1023 294 960 317 885 284 C 787 252 723 284 651 250 C 611 235 585 240 557 248 Z"
  }), /*#__PURE__*/React.createElement("path", {
    opacity: "0.46",
    d: "M 150 300 C 219 278 257 292 294 275 C 330 258 364 285 400 261 C 431 240 463 263 492 247 C 529 226 555 253 600 241 C 654 226 684 259 725 245 L 832 279 L 901 365 C 690 337 637 355 484 328 C 347 315 259 340 150 332 Z"
  })), /*#__PURE__*/React.createElement("g", {
    fill: "url(#night-cloud-shadow)"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 731 256 C 778 228 808 250 831 225 C 854 206 877 223 901 203 C 929 176 956 207 983 190 C 1022 174 1055 194 1100 181 L 1100 408 L 833 390 C 815 328 778 301 731 295 Z"
  }), /*#__PURE__*/React.createElement("path", {
    opacity: "0.75",
    d: "M -80 343 C 4 322 43 341 87 317 C 128 293 157 323 202 304 C 244 280 283 308 320 292 C 362 273 387 311 435 298 L 561 372 L 628 432 L -80 432 Z"
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(90deg, rgba(8,14,28,0.94) 0%, rgba(8,14,28,0.72) 29%, rgba(8,14,28,0.15) 58%, transparent 78%)'
    }
  }), /*#__PURE__*/React.createElement("svg", {
    className: "hero-landscape",
    viewBox: "0 0 1440 180",
    preserveAspectRatio: "none"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "sea-surface",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    stopColor: "#1d3150"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: ".3",
    stopColor: "#11203a"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "#050c18"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "sea-haze",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    stopColor: "#a5bcd3",
    stopOpacity: "0"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "#a5bcd3",
    stopOpacity: ".14"
  }))), /*#__PURE__*/React.createElement("rect", {
    y: "66",
    width: "1440",
    height: "24",
    fill: "url(#sea-haze)"
  }), /*#__PURE__*/React.createElement("rect", {
    y: "90",
    width: "1440",
    height: "90",
    fill: "url(#sea-surface)"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M0 90.5H1440",
    stroke: "#3a5577",
    strokeOpacity: ".7",
    vectorEffect: "non-scaling-stroke"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hero-sea"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-sea__drift"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${HERO_SEA_TILE * 10} 90`,
    preserveAspectRatio: "xMinYMax meet"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("g", {
    id: "sea-tile",
    fill: "none",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: HERO_SEA_RIPPLES.troughs,
    stroke: "#02060d",
    strokeWidth: "1.1",
    strokeOpacity: ".35"
  }), HERO_SEA_RIPPLES.crests.map((d, band) => /*#__PURE__*/React.createElement("path", {
    key: band,
    d: d,
    stroke: "#86a6cc",
    strokeWidth: [0.45, 0.6, 0.85, 1.2][band],
    strokeOpacity: [0.13, 0.17, 0.21, 0.25][band]
  })))), Array.from({
    length: 10
  }, (_, i) => /*#__PURE__*/React.createElement("use", {
    key: i,
    href: "#sea-tile",
    x: i * HERO_SEA_TILE
  }))))), /*#__PURE__*/React.createElement("svg", {
    className: "hero-glitter",
    viewBox: "0 0 120 90",
    preserveAspectRatio: "none"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "glint-glow",
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "0"
  }, /*#__PURE__*/React.createElement("stop", {
    stopColor: "#c9d8ec",
    stopOpacity: "0"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: ".5",
    stopColor: "#c9d8ec",
    stopOpacity: ".12"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "#c9d8ec",
    stopOpacity: "0"
  }))), /*#__PURE__*/React.createElement("path", {
    d: "M56 0H64L104 90H16Z",
    fill: "url(#glint-glow)"
  }), HERO_SEA_GLINTS.map((set, i) => /*#__PURE__*/React.createElement("g", {
    key: i,
    className: "hero-glitter__set",
    fill: "none",
    stroke: "#e8f0fb",
    strokeLinecap: "round"
  }, set.map((glint, k) => /*#__PURE__*/React.createElement("path", {
    key: k,
    d: glint.d,
    strokeWidth: glint.w,
    strokeOpacity: glint.o
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "hero-horizon"
  }, /*#__PURE__*/React.createElement("svg", {
    className: "hero-horizon__item",
    style: {
      left: '33%'
    },
    width: "34",
    height: "20",
    viewBox: "0 0 34 20"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 20V11h18v9M10 11V6h8v5M22 11V2",
    stroke: "#2b3e57",
    strokeWidth: "1.2",
    fill: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "22",
    cy: "2",
    r: "1",
    fill: "#ff5a4f",
    opacity: ".8"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "13",
    cy: "8.5",
    r: ".9",
    fill: "#e9c98f"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "14",
    r: ".9",
    fill: "#e9c98f",
    opacity: ".7"
  })), /*#__PURE__*/React.createElement("svg", {
    className: "hero-horizon__item",
    style: {
      left: '50%'
    },
    width: "200",
    height: "32",
    viewBox: "0 0 200 32"
  }, [[14, 26, 0], [44, 24, 40], [72, 22, 75], [98, 20, 20], [122, 18, 95], [144, 17, 55], [164, 15, 10], [182, 14, 80]].map(([x, h, a]) => {
    const top = 32 - h,
      r = h * .42;
    const blade = k => {
      const t = (a + k * 120) * Math.PI / 180;
      return `M${x} ${top}l${heroFixed(r * Math.cos(t))} ${heroFixed(r * Math.sin(t))}`;
    };
    return /*#__PURE__*/React.createElement("g", {
      key: x
    }, /*#__PURE__*/React.createElement("path", {
      d: `M${x} 32V${top}${blade(0)}${blade(1)}${blade(2)}`,
      stroke: "#3a5070",
      strokeWidth: ".9",
      fill: "none"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: x,
      cy: top,
      r: "1.1",
      fill: "#ff5a4f",
      opacity: ".8"
    }));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "hero-rain"
  }, Array.from({
    length: 64
  }, (_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "hero-rain-drop",
    style: {
      left: `${(i * 61.803 + 9) % 100}%`,
      '--rain-speed': `${.8 + i % 5 * .12}s`,
      '--rain-phase': `${-i * .13}s`,
      '--rain-length': `${14 + i % 6 * 3}px`,
      '--rain-alpha': .13 + i % 4 * .04
    }
  })))), []);
};

// Sea surface, built once. Rows of ripple crests crowd together and shrink towards the horizon
// (y = 0) and open out towards the viewer (y = 90); a tile repeats seamlessly across the strip.
const heroSeaRandom = seed => () => (seed = seed * 1664525 + 1013904223 >>> 0) / 4294967296;
const HERO_SEA_TILE = 360;
const HERO_SEA_RIPPLES = (() => {
  const random = heroSeaRandom(42);
  const bands = [[], [], [], []],
    troughs = [];
  for (let j = 0; j < 30; j++) {
    const t = (j + 0.5) / 30,
      y = 1 + 88 * t ** 1.8,
      length = 2 + 24 * t * t,
      rise = 0.25 + 1.6 * t;
    for (let x = random() * length * 2; x < HERO_SEA_TILE;) {
      const w = length * (0.6 + 0.8 * random());
      if (x + w < HERO_SEA_TILE) {
        const crest = y + (random() - 0.5) * rise;
        bands[Math.min(3, Math.floor(t * 4))].push(`M${heroFixed(x)} ${heroFixed(crest)}q${heroFixed(w / 2)} ${heroFixed(-rise)} ${heroFixed(w)} 0`);
        // Nearer waves show the shaded trough below each crest.
        if (t > 0.4) troughs.push(`M${heroFixed(x + w * 0.15)} ${heroFixed(crest + rise)}q${heroFixed(w * 0.35)} ${heroFixed(rise * 0.5)} ${heroFixed(w * 0.7)} 0`);
      }
      x += w * (1.6 + 2.2 * random());
    }
  }
  return {
    crests: bands.map(band => band.join('')),
    troughs: troughs.join('')
  };
})();
// Glints in the moon's path: brightest on its centre line, the path widening towards the viewer.
const HERO_SEA_GLINTS = (() => {
  const random = heroSeaRandom(7);
  const sets = [[], [], []];
  for (let j = 0; j < 26; j++) {
    const t = (j + 0.5) / 26,
      y = 1 + 88 * t ** 1.8,
      half = 5 + 50 * t;
    for (let k = 0, n = 2 + Math.round(4 * t); k < n; k++) {
      const offset = (random() * 2 - 1) * half * (0.35 + 0.65 * random());
      const w = (1.5 + 9 * t) * (0.5 + random());
      sets[(j + k) % 3].push({
        d: `M${heroFixed(60 + offset - w / 2)} ${heroFixed(y)}q${heroFixed(w / 2)} ${heroFixed(-(0.3 + 1.2 * t))} ${heroFixed(w)} 0`,
        w: heroFixed(0.5 + 0.8 * t),
        o: heroFixed(0.3 + 0.65 * (1 - Math.abs(offset) / half))
      });
    }
  }
  return sets;
})();

// Decorative equipment stays anchored to the same surface and well as the live model:
// an offshore injection platform over the well, and a CO₂ carrier moored alongside while injecting.
const HeroShip = ({
  ship
}) => {
  const pose = heroShipPose(ship);
  if (!pose) return null;
  const engine = 0.15 + 0.85 * pose.wake;
  return /*#__PURE__*/React.createElement("g", {
    className: "hero-ship",
    style: {
      transform: `translateX(${heroFixed(pose.x)}px)`,
      opacity: heroFixed(pose.opacity * 100) / 100
    }
  }, /*#__PURE__*/React.createElement("g", {
    opacity: heroFixed(pose.wake)
  }, /*#__PURE__*/React.createElement("path", {
    d: "M394 151q30 1 70 -1M392 153q50 2 120 0M396 155q30 3 80 3",
    stroke: "#cfdbe8",
    strokeWidth: "1",
    strokeDasharray: "18 6 30 8",
    opacity: ".75"
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "400",
    cy: "153",
    rx: "12",
    ry: "1.6",
    fill: "#dfe7f0",
    opacity: ".55"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M157 151q-12 -4 -26 0M154 153q-18 -2 -36 4",
    stroke: "#e7eef7",
    strokeWidth: "1",
    opacity: ".8"
  })), /*#__PURE__*/React.createElement("g", {
    className: "hero-ship__hull"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M150 154H392",
    stroke: "#08111d",
    strokeWidth: "3",
    opacity: ".6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M146 127L166 134H394V147Q394 152 388 152H174Q160 152 155 143Z",
    fill: "url(#ship-hull)",
    stroke: "#6f87a6",
    strokeOpacity: ".35",
    strokeWidth: ".6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M158 148H392",
    stroke: "#5a2f35",
    strokeWidth: "1.6",
    opacity: ".7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M146 127L166 134H394",
    stroke: "#9fb3c8",
    strokeOpacity: ".45",
    strokeWidth: ".7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M150 128H172V134H166Z",
    fill: "#22344c"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M162 128V108M158 112h8",
    stroke: "#7d93ad",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "162",
    cy: "107",
    r: "1.3",
    fill: "#f4f7fb"
  }), [205, 262, 319].map(x => /*#__PURE__*/React.createElement("rect", {
    key: x,
    x: x - 26,
    y: "120",
    width: "52",
    height: "15",
    rx: "7.5",
    fill: "url(#ship-tank)",
    stroke: "#9fb3c8",
    strokeOpacity: ".3",
    strokeWidth: ".5"
  })), /*#__PURE__*/React.createElement("path", {
    d: "M233 134V113h6",
    stroke: "#7d93ad",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M350 134V98H390V134Z",
    fill: "#22344c",
    stroke: "#7d93ad",
    strokeOpacity: ".35",
    strokeWidth: ".6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M346 98H394V93H346Z",
    fill: "#2c4060"
  }), [104, 111, 118, 125].map((y, i) => /*#__PURE__*/React.createElement("path", {
    key: y,
    d: `M354 ${y}h32`,
    stroke: "#e9c98f",
    strokeWidth: "2",
    strokeDasharray: "3 2",
    opacity: i ? .4 : .9
  })), /*#__PURE__*/React.createElement("path", {
    d: "M374 93V81h9v12Z",
    fill: "#1b2a3d"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M374 85h9",
    stroke: "#5a2f35",
    strokeWidth: "1.4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M362 93V77M358 81h8",
    stroke: "#7d93ad",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "362",
    cy: "76",
    r: "1.3",
    fill: "#f4f7fb"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "347",
    cy: "96",
    r: "1.2",
    fill: "#ff5a4f"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "394",
    cy: "137",
    r: "1",
    fill: "#f4f7fb",
    opacity: ".8"
  }), /*#__PURE__*/React.createElement("g", {
    opacity: pose.lights
  }, /*#__PURE__*/React.createElement("ellipse", {
    cx: "236",
    cy: "126",
    rx: "26",
    ry: "9",
    fill: "url(#ship-worklight)"
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "368",
    cy: "128",
    rx: "22",
    ry: "8",
    fill: "url(#ship-worklight)"
  })), [[386, 74, 4], [396, 68, 5.5], [409, 63, 7]].map(([x, y, r]) => /*#__PURE__*/React.createElement("circle", {
    key: x,
    cx: x,
    cy: y,
    r: r,
    fill: "#8b9bb0",
    opacity: heroFixed(engine * .22)
  })), /*#__PURE__*/React.createElement("path", {
    d: "M172 154.5H388M180 156.8H380M194 159H366",
    stroke: "#03070e",
    strokeWidth: "1.6",
    strokeDasharray: "22 3 40 4 16 3",
    opacity: ".55"
  }), [356, 366, 376].map(x => /*#__PURE__*/React.createElement("rect", {
    key: x,
    x: x,
    y: "153",
    width: "1.4",
    height: "7",
    fill: "url(#ship-light-reflection)"
  }))), pose.hose > 0 && /*#__PURE__*/React.createElement("use", {
    href: "#site-feed-route",
    stroke: "#0e1a28",
    strokeWidth: "3.4",
    strokeDasharray: "1 1",
    strokeDashoffset: (1 - pose.hose).toFixed(3)
  }));
};
const HERO_RIG_WINDOWS = [[2, 76, 9], [2, 84, 9], [2, 92, 9], [66, 64, 7], [66, 71, 7], [66, 78, 7], [66, 85, 7], [66, 92, 7]].flatMap(([x0, y, n]) => Array.from({
  length: n
}, (_, i) => [x0 + i * 6, y, (i * 7 + y * 3) % 5])).filter(([,, lit]) => lit < 3);
const SurfaceSite = ({
  geology,
  flow,
  ship
}) => /*#__PURE__*/React.createElement("div", {
  className: "hero-surface-site",
  "aria-hidden": "true",
  style: {
    left: `${geology.wellXPct}%`
  }
}, /*#__PURE__*/React.createElement("svg", {
  viewBox: "-140 0 540 160",
  width: "100%",
  height: "100%",
  fill: "none"
}, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
  id: "site-flow-x",
  gradientUnits: "userSpaceOnUse",
  x1: "0",
  y1: "0",
  x2: "24",
  y2: "0",
  spreadMethod: "repeat",
  gradientTransform: `translate(${-(flow || 0)} 0)`
}, /*#__PURE__*/React.createElement("stop", {
  stopColor: "#fff",
  stopOpacity: "0"
}), /*#__PURE__*/React.createElement("stop", {
  offset: ".5",
  stopColor: "#fff",
  stopOpacity: ".85"
}), /*#__PURE__*/React.createElement("stop", {
  offset: "1",
  stopColor: "#fff",
  stopOpacity: "0"
})), /*#__PURE__*/React.createElement("linearGradient", {
  id: "site-flow-y",
  gradientUnits: "userSpaceOnUse",
  x1: "0",
  y1: "0",
  x2: "0",
  y2: "24",
  spreadMethod: "repeat",
  gradientTransform: `translate(0 ${flow || 0})`
}, /*#__PURE__*/React.createElement("stop", {
  stopColor: "#fff",
  stopOpacity: "0"
}), /*#__PURE__*/React.createElement("stop", {
  offset: ".5",
  stopColor: "#fff",
  stopOpacity: ".85"
}), /*#__PURE__*/React.createElement("stop", {
  offset: "1",
  stopColor: "#fff",
  stopOpacity: "0"
})), /*#__PURE__*/React.createElement("linearGradient", {
  id: "rig-steel",
  x1: "0",
  y1: "0",
  x2: "1",
  y2: "0"
}, /*#__PURE__*/React.createElement("stop", {
  stopColor: "#1b293b"
}), /*#__PURE__*/React.createElement("stop", {
  offset: ".7",
  stopColor: "#2c3e55"
}), /*#__PURE__*/React.createElement("stop", {
  offset: "1",
  stopColor: "#5d7493"
})), /*#__PURE__*/React.createElement("linearGradient", {
  id: "rig-module",
  x1: "0",
  y1: "0",
  x2: "0",
  y2: "1"
}, /*#__PURE__*/React.createElement("stop", {
  stopColor: "#2a3c54"
}), /*#__PURE__*/React.createElement("stop", {
  offset: "1",
  stopColor: "#18263a"
})), /*#__PURE__*/React.createElement("linearGradient", {
  id: "ship-hull",
  x1: "0",
  y1: "0",
  x2: "0",
  y2: "1"
}, /*#__PURE__*/React.createElement("stop", {
  stopColor: "#24364e"
}), /*#__PURE__*/React.createElement("stop", {
  offset: "1",
  stopColor: "#111c2c"
})), /*#__PURE__*/React.createElement("linearGradient", {
  id: "ship-tank",
  x1: "0",
  y1: "0",
  x2: "0",
  y2: "1"
}, /*#__PURE__*/React.createElement("stop", {
  stopColor: "#7d93ad"
}), /*#__PURE__*/React.createElement("stop", {
  offset: ".35",
  stopColor: "#3d5270"
}), /*#__PURE__*/React.createElement("stop", {
  offset: "1",
  stopColor: "#1c2a3e"
})), /*#__PURE__*/React.createElement("linearGradient", {
  id: "ship-light-reflection",
  x1: "0",
  y1: "0",
  x2: "0",
  y2: "1"
}, /*#__PURE__*/React.createElement("stop", {
  stopColor: "#e9c98f",
  stopOpacity: ".4"
}), /*#__PURE__*/React.createElement("stop", {
  offset: "1",
  stopColor: "#e9c98f",
  stopOpacity: "0"
})), /*#__PURE__*/React.createElement("radialGradient", {
  id: "ship-worklight"
}, /*#__PURE__*/React.createElement("stop", {
  stopColor: "#f2deb0",
  stopOpacity: ".28"
}), /*#__PURE__*/React.createElement("stop", {
  offset: "1",
  stopColor: "#f2deb0",
  stopOpacity: "0"
})), /*#__PURE__*/React.createElement("path", {
  id: "site-feed-route",
  pathLength: "1",
  d: "M112 101Q176 150 236 114"
})), /*#__PURE__*/React.createElement(HeroShip, {
  ship: ship
}), /*#__PURE__*/React.createElement("path", {
  d: "M48 104V160",
  stroke: "#2c3e55",
  strokeWidth: "2.4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M10 160L20 104M86 160L76 104",
  stroke: "url(#rig-steel)",
  strokeWidth: "5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M13 143H83M16 124H80M13 143L48 124L83 143M16 124L48 106L80 124",
  stroke: "#34475f",
  strokeWidth: "1.5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M86 160L76 104",
  stroke: "#8fa5bd",
  strokeOpacity: ".45",
  strokeWidth: ".8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M2 159q8 -3 16 0m60 0q8 -3 16 0",
  stroke: "#c9d6e6",
  strokeOpacity: ".35",
  strokeWidth: ".8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M-8 104L-4 110H114L118 104Z",
  fill: "#141f2e"
}), /*#__PURE__*/React.createElement("path", {
  d: "M-8 104H118V98H-8Z",
  fill: "#1b2a3d",
  stroke: "#7d93ad",
  strokeOpacity: ".4",
  strokeWidth: ".6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M-2 98V70H58V98Z",
  fill: "url(#rig-module)",
  stroke: "#7d93ad",
  strokeOpacity: ".35",
  strokeWidth: ".6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M62 98V58H112V98Z",
  fill: "url(#rig-module)",
  stroke: "#7d93ad",
  strokeOpacity: ".35",
  strokeWidth: ".6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M112 58V98",
  stroke: "#9fb3c8",
  strokeOpacity: ".45",
  strokeWidth: ".7"
}), HERO_RIG_WINDOWS.map(([x, y, lit]) => /*#__PURE__*/React.createElement("rect", {
  key: `${x}-${y}`,
  x: x,
  y: y,
  width: "3.4",
  height: "2.4",
  fill: "#e9c98f",
  opacity: lit ? .5 : .9
})), [92, 104].map(x => /*#__PURE__*/React.createElement("rect", {
  key: x,
  x: x,
  y: "105",
  width: "10",
  height: "4",
  rx: "2",
  fill: "#c98a3a",
  opacity: ".8"
})), /*#__PURE__*/React.createElement("path", {
  d: "M64 58L72 64M118 56L108 64",
  stroke: "#34475f",
  strokeWidth: "1.2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M58 56H124L128 52H62Z",
  fill: "#2c4060",
  stroke: "#9fb3c8",
  strokeOpacity: ".5",
  strokeWidth: ".6"
}), [61, 79, 97, 115, 125].map(x => /*#__PURE__*/React.createElement("circle", {
  key: x,
  cx: x,
  cy: "55.5",
  r: ".8",
  fill: "#f2c14e"
})), /*#__PURE__*/React.createElement("path", {
  d: "M37 98L44 22H52L59 98",
  stroke: "#4a5f7a",
  strokeWidth: "1.6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M38 88H58M39.5 76H56.5M41 62H55M42.5 48H53.5M43.5 34H52.5M38 88L56.5 76M58 88L39.5 76M39.5 76L55 62M56.5 76L41 62M41 62L53.5 48M55 62L42.5 48M42.5 48L52.5 34M53.5 48L43.5 34",
  stroke: "#3a4f69",
  strokeWidth: ".8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M59 98L52 22",
  stroke: "#9fb3c8",
  strokeOpacity: ".4",
  strokeWidth: ".6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M43 22H53V18H43Z",
  fill: "#2c4060"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "48",
  cy: "16",
  r: "1.8",
  fill: "#ff5a4f"
}), /*#__PURE__*/React.createElement("circle", {
  "data-site-status": "true",
  cx: "48",
  cy: "95",
  r: "1.5",
  style: {
    fill: flow !== null ? 'var(--sim-glow-free)' : '#647b79'
  }
}), /*#__PURE__*/React.createElement("path", {
  d: "M4 70V60H12V70Z",
  fill: "#22344b"
}), /*#__PURE__*/React.createElement("path", {
  d: "M8 60L-62 26",
  stroke: "#4a5f7a",
  strokeWidth: "2.2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M2 63L-62 26",
  stroke: "#3a4f69",
  strokeWidth: ".7"
}), /*#__PURE__*/React.createElement("path", {
  d: "M-62 26V52",
  stroke: "#7d93ad",
  strokeOpacity: ".6",
  strokeWidth: ".6"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "-62",
  cy: "25",
  r: "1.4",
  fill: "#ff5a4f"
}), flow !== null && /*#__PURE__*/React.createElement("g", {
  className: "hero-well__flow"
}, /*#__PURE__*/React.createElement("path", {
  d: "M236 114Q176 150 112 101H48V160",
  className: "hero-well__co2",
  strokeWidth: "2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M236 114Q176 150 112 101H48",
  className: "hero-well__pulse",
  strokeWidth: "2",
  stroke: "url(#site-flow-x)"
}), /*#__PURE__*/React.createElement("path", {
  d: "M48 101V160",
  className: "hero-well__pulse",
  strokeWidth: "2",
  stroke: "url(#site-flow-y)"
}))));
const HeroName = ({
  variant
}) => {
  const titleRef = useRef(null);
  useEffect(() => {
    const title = titleRef.current;
    const hero = title.closest('#home');
    const words = [...title.querySelectorAll('.hero-name-word')];
    const contours = [...title.querySelectorAll('.hero-name-contour')];
    const motion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame;
    const reset = () => {
      window.cancelAnimationFrame(frame);
      title.style.transform = '';
      title.removeAttribute('data-lit');
      contours.forEach(contour => contour.style.transform = '');
    };
    const move = event => {
      if (!motion.matches || event.pointerType !== 'mouse') return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const rect = title.getBoundingClientRect();
        if (!rect.width || !rect.height) return reset();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const near = x > -0.25 && x < 1.25 && y > -1 && y < 2;
        if (!near) return reset();
        const dx = Math.max(-1, Math.min(1, (x - 0.5) * 2)) * 4;
        const dy = Math.max(-1, Math.min(1, (y - 0.5) * 2)) * 3;
        title.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        title.setAttribute('data-lit', '');
        contours.forEach(contour => {
          const depth = Number(contour.dataset.depth);
          contour.style.transform = `translate3d(${depth * (0.3 + dx * 0.05)}px, ${depth * (0.2 + dy * 0.04)}px, 0)`;
        });
        words.forEach(word => {
          const bounds = word.getBoundingClientRect();
          word.style.setProperty('--name-light-x', `${(event.clientX - bounds.left) / bounds.width * 100}%`);
        });
      });
    };
    hero.addEventListener('pointermove', move, {
      passive: true
    });
    hero.addEventListener('pointerleave', reset);
    window.addEventListener('scroll', reset, {
      passive: true
    });
    motion.addEventListener('change', reset);
    return () => {
      reset();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', reset);
      window.removeEventListener('scroll', reset);
      motion.removeEventListener('change', reset);
    };
  }, []);
  return /*#__PURE__*/React.createElement("h1", {
    ref: titleRef,
    id: "hero-name",
    className: "hero-name",
    "data-name-style": variant,
    "aria-label": "Sa\u2019eed Telvari"
  }, ['Sa\u2019eed', 'Telvari'].map((word, index) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: word
  }, index > 0 && ' ', /*#__PURE__*/React.createElement("span", {
    className: "hero-name-word",
    "data-word": word,
    "aria-hidden": "true"
  }, variant === 'contour' && /*#__PURE__*/React.createElement("span", {
    className: "hero-name-contours"
  }, [1, 2, 3, 4, 5, 6].map(depth => /*#__PURE__*/React.createElement("span", {
    key: depth,
    className: "hero-name-contour",
    "data-depth": depth,
    "data-word": word,
    style: {
      '--contour-depth': depth
    }
  }, word))), /*#__PURE__*/React.createElement("span", {
    className: "hero-name-ink",
    "data-word": word
  }, word)))));
};
const Identity = React.memo(({
  onNavigate
}) => /*#__PURE__*/React.createElement("div", {
  className: "hero-identity",
  "data-name-style": "contour"
}, /*#__PURE__*/React.createElement("p", {
  className: "hero-role hero-reveal"
}, "PhD candidate, Heriot-Watt University"), /*#__PURE__*/React.createElement(HeroName, {
  variant: "contour"
}), /*#__PURE__*/React.createElement("p", {
  className: "hero-summary hero-reveal"
}, "I build vertical-equilibrium models of CO", /*#__PURE__*/React.createElement("sub", null, "2"), " storage in depleted gas fields: reduced-order simulators that run up to 100\xD7 faster than full 3D compositional models."), /*#__PURE__*/React.createElement("div", {
  className: "hero-actions hero-reveal"
}, /*#__PURE__*/React.createElement("a", {
  className: "btn btn--primary",
  href: "./simulator.html",
  onClick: event => onNavigate && onNavigate('simulator', event)
}, /*#__PURE__*/React.createElement(Icon, {
  name: "play",
  size: 14
}), "Open the CO\u2082 simulator"), /*#__PURE__*/React.createElement("a", {
  className: "btn btn--quiet",
  href: "./cv.html",
  onClick: event => onNavigate && onNavigate('cv', event)
}, "Read my CV"), /*#__PURE__*/React.createElement("ul", {
  className: "hero-profiles"
}, HERO_PROFILES.map(({
  icon,
  label,
  href
}) => /*#__PURE__*/React.createElement("li", {
  key: icon
}, /*#__PURE__*/React.createElement("a", _extends({
  href: href,
  "aria-label": label,
  title: label
}, href.startsWith('http') ? {
  target: '_blank',
  rel: 'noreferrer'
} : {}), /*#__PURE__*/React.createElement(Icon, {
  name: icon,
  size: 18
}))))))));
Object.assign(window, {
  SubsurfaceHero
});

// File: GeologicalDescent.jsx
// A continuous material cutaway, from the hero's aquifer to crystalline basement. The rock is
// drawn below the hero, behind every section sheet and the footer (the last measured height).
const GeologicalDescent = ({
  children
}) => {
  const rootRef = React.useRef(null);
  const [heights, setHeights] = React.useState([1100, 900, 1500, 850, 240]);
  // Photographic textures load once the rock scrolls into view; flat colours stand in until then.
  const [texturesOn, setTexturesOn] = React.useState(false);
  // The rock lies below the fold: build it after the hero has painted.
  const [artReady, setArtReady] = React.useState(false);
  const liveRef = React.useRef(null);
  React.useEffect(() => {
    const ready = () => setArtReady(() => true);
    const idle = window.requestIdleCallback;
    const id = idle ? idle(ready, {
      timeout: 1500
    }) : window.setTimeout(ready, 250);
    return () => idle ? window.cancelIdleCallback(id) : window.clearTimeout(id);
  }, []);

  // Once drawn: size the textures and pause the flow streaks while they are off-screen.
  React.useEffect(() => {
    const live = liveRef.current;
    if (!artReady || !live || !live.measure) return;
    live.measure();
    live.root.querySelectorAll('.descent-motion').forEach(element => live.visibility.observe(element));
  }, [artReady]);
  React.useEffect(() => {
    // Captured once: a resize callback can still arrive after React has detached the ref.
    const root = rootRef.current;
    const sections = [...root.querySelectorAll('.section-panel'), root.querySelector('footer')];
    const measure = () => {
      const next = sections.map(section => Math.round(section.offsetHeight));
      setHeights(previous => next.some((height, i) => height !== previous[i]) ? next : previous);
      // Compensate for the SVG's horizontal scaling so mineral grains stay round.
      const width = root.clientWidth;
      if (width) root.querySelectorAll('.descent-material').forEach(pattern => {
        const tileWidth = 840 * 1440 / width;
        pattern.setAttribute('width', tileWidth);
        pattern.querySelector('.descent-tile').setAttribute('transform', `scale(${tileWidth / 840} 1)`);
      });
    };
    const sizes = new ResizeObserver(measure);
    sections.forEach(section => sizes.observe(section));
    sizes.observe(root);
    measure();
    const visibility = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.dataset.visible = String(entry.isIntersecting);
      });
    });
    root.querySelectorAll('.descent-motion').forEach(element => visibility.observe(element));
    liveRef.current = {
      root,
      measure,
      visibility
    };
    const textures = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setTexturesOn(() => true);
      textures.disconnect();
    }, {
      rootMargin: '0px 0px -5% 0px'
    });
    textures.observe(root.querySelector('.section-panel') || root);
    return () => {
      sizes.disconnect();
      visibility.disconnect();
      textures.disconnect();
    };
  }, []);
  const art = React.useMemo(() => {
    if (!artReady) return null;
    const footer = heights[heights.length - 1];
    const lastSection = heights[heights.length - 2];
    const total = heights.reduce((sum, height) => sum + height, 0);
    const materials = ['shale', 'sandstone', 'sandstone', 'siltstone', 'limestone', 'shale', 'sandstone', 'dolomite', 'shale', 'siltstone', 'sandstone', 'limestone', 'limestone', 'shale', 'sandstone', 'siltstone', 'shale', 'dolomite', 'sandstone', 'siltstone', 'shale', 'limestone', 'sandstone', 'dolomite', 'shale', 'sandstone', 'siltstone', 'dolomite', 'shale', 'limestone', 'shale', 'sandstone', 'sandstone', 'siltstone', 'limestone', 'shale', 'dolomite', 'sandstone', 'shale', 'sandstone', 'basement'];
    // Earth-graded flat colours: the whole bed before its texture loads, and a light tint after.
    const colors = {
      shale: '#2e2925',
      sandstone: '#7a6347',
      siltstone: '#5f5044',
      limestone: '#7a7468',
      dolomite: '#857a64',
      basement: '#6e625a'
    };
    const random = seed => {
      const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
      return n - Math.floor(n);
    };
    const weights = materials.slice(0, -1).map((_, i) => .45 + random(i + 8) * 1.4);
    const basementLevel = total - footer - lastSection * .58;
    const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
    const levels = [0];
    weights.forEach(weight => levels.push(levels[levels.length - 1] + weight / weightTotal * basementLevel));
    levels.push(total);
    const smooth = value => {
      const t = Math.max(0, Math.min(1, value));
      return t * t * t * (10 + t * (6 * t - 15));
    };
    // Three sandstone deposits taper out; the remaining succession stays continuous.
    const pinch = (bed, x) => bed === 6 ? smooth((x - 180) / 640) : bed === 18 ? smooth((1120 - x) / 700) : bed === 37 ? smooth((x - 120) / 400) * smooth((1360 - x) / 400) : 1;
    const columnProfiles = new Map();
    const baseBoundary = (i, x) => {
      if (i === 0) return 0;
      if (i === levels.length - 1) return total;
      if (columnProfiles.has(x)) return columnProfiles.get(x)[i];
      const thicknesses = weights.map((weight, n) => weight * pinch(n, x) * (1 + .24 * Math.sin(x / 440 + n * .72) + .1 * Math.cos(x / 280 - n * .46)));
      const thicknessTotal = thicknesses.reduce((sum, weight) => sum + weight, 0);
      const erosion = 32 * Math.sin(x / 310 + .8) + 12 * Math.sin(x / 110);
      const fold = 36 * Math.sin(x / 510 + .45) + 12 * Math.cos(x / 230);
      let cumulative = 0;
      const column = [0, ...thicknesses.map((weight, n) => {
        cumulative += weight;
        const fraction = cumulative / thicknessTotal;
        return fraction * (basementLevel + erosion) + Math.sin(Math.PI * fraction) * fold;
      }), total];
      columnProfiles.set(x, column);
      return column[i];
    };
    // Two small faults offset a few beds and die out before the adjacent succession.
    const structuralFaults = [{
      top: 10,
      bottom: 14,
      x: 260,
      slope: .62,
      throw: 12
    }, {
      top: 24,
      bottom: 29,
      x: 1160,
      slope: -.55,
      throw: -10
    }].map(fault => {
      const y = baseBoundary(fault.top, fault.x);
      return {
        ...fault,
        y,
        length: baseBoundary(fault.bottom, fault.x) - y
      };
    });
    const faultX = (fault, y) => fault.x + (y - fault.y - fault.length / 2) * fault.slope;
    const boundaryY = (i, x) => {
      const y = baseBoundary(i, x);
      return y + structuralFaults.reduce((offset, fault) => {
        const t = (y - fault.y) / fault.length;
        return offset + (t > 0 && t < 1 && x > faultX(fault, y) ? fault.throw * Math.sin(Math.PI * t) : 0);
      }, 0);
    };
    // Both adjoining beds use the same contact, including exact fault steps.
    const profiles = levels.map((_, i) => {
      const points = Array.from({
        length: 121
      }, (_, n) => [n * 12, boundaryY(i, n * 12)]);
      structuralFaults.forEach(fault => {
        let left = 0,
          right = 1440;
        for (let n = 0; n < 24; n++) {
          const x = (left + right) / 2;
          if (x < faultX(fault, baseBoundary(i, x))) left = x;else right = x;
        }
        const x = (left + right) / 2,
          y = baseBoundary(i, x);
        if (y > fault.y && y < fault.y + fault.length) points.push([x, boundaryY(i, x - .001)], [x, boundaryY(i, x + .001)]);
      });
      return points.sort((a, b) => a[0] - b[0]);
    });
    const trace = points => 'M' + points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');
    const beds = profiles.slice(0, -1).map((points, i) => trace(points) + 'L' + [...profiles[i + 1]].reverse().map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z');
    const middle = (i, x) => (boundaryY(i, x) + boundaryY(i + 1, x)) / 2;
    const bedAt = (material, y) => materials.reduce((best, rock, i) => rock === material && Math.abs(levels[i] - y) < Math.abs(levels[best] - y) ? i : best, materials.indexOf(material));
    const sandstoneBed = bedAt('sandstone', heights[0] * .22);
    const lowerSandstone = bedAt('sandstone', heights[0] + heights[1] * .68);
    // Brittle carbonate intervals and granite host the fault/joint clusters.
    const fracturedBeds = [4, 12, 27, materials.length - 1];
    const fractureCounts = {
      shale: 0,
      siltstone: 1,
      sandstone: 2,
      limestone: 5,
      dolomite: 7,
      basement: 180
    };
    const faults = fracturedBeds.flatMap(bed => Array.from({
      length: materials[bed] === 'basement' ? 24 : 4
    }, (_, n) => {
      const seed = bed * 31 + n * 7;
      const x = 65 + random(seed) * 1310;
      const top = boundaryY(bed, x),
        height = boundaryY(bed + 1, x) - top;
      const length = Math.min(210, height * .7) * (.65 + random(seed + 1) * .35);
      return {
        bed,
        x,
        y: top + height * .08 + random(seed + 2) * Math.max(0, height * .84 - length),
        length,
        slope: n % 3 ? .64 : -.56,
        throw: n % 2 ? -7 : 7
      };
    }));
    return /*#__PURE__*/React.createElement("svg", {
      className: "geological-descent-art",
      viewBox: `0 0 1440 ${total}`,
      preserveAspectRatio: "none",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
      id: "descent-wrap-x"
    }, [0, .15, .5, .85, 1].map((offset, i) => /*#__PURE__*/React.createElement("stop", {
      key: i,
      offset: offset,
      stopColor: "#fff",
      stopOpacity: [0, .2, 1, .2, 0][i]
    }))), /*#__PURE__*/React.createElement("linearGradient", {
      id: "descent-wrap-y",
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1",
      href: "#descent-wrap-x"
    }), /*#__PURE__*/React.createElement("mask", {
      id: "descent-wrap-mask-x",
      x: "0",
      y: "0",
      width: "840",
      height: "840",
      maskUnits: "userSpaceOnUse"
    }, /*#__PURE__*/React.createElement("rect", {
      width: "840",
      height: "840",
      fill: "url(#descent-wrap-x)"
    })), /*#__PURE__*/React.createElement("mask", {
      id: "descent-wrap-mask-y",
      x: "0",
      y: "0",
      width: "840",
      height: "840",
      maskUnits: "userSpaceOnUse"
    }, /*#__PURE__*/React.createElement("rect", {
      width: "840",
      height: "840",
      fill: "url(#descent-wrap-y)"
    })), [...new Set(materials)].map(material => /*#__PURE__*/React.createElement(React.Fragment, {
      key: material
    }, /*#__PURE__*/React.createElement("pattern", {
      id: `descent-raw-${material}`,
      width: "840",
      height: "840",
      patternUnits: "userSpaceOnUse"
    }, /*#__PURE__*/React.createElement("image", {
      href: texturesOn ? `./assets/geology-${material}.webp?v=3` : undefined,
      width: "840",
      height: "840",
      preserveAspectRatio: "none"
    })), /*#__PURE__*/React.createElement("pattern", {
      id: `descent-raw-${material}-x`,
      href: `#descent-raw-${material}`,
      patternTransform: "translate(420 0)"
    }), /*#__PURE__*/React.createElement("pattern", {
      id: `descent-raw-${material}-y`,
      href: `#descent-raw-${material}`,
      patternTransform: "translate(0 420)"
    }), /*#__PURE__*/React.createElement("pattern", {
      id: `descent-raw-${material}-xy`,
      href: `#descent-raw-${material}`,
      patternTransform: "translate(420 420)"
    }), /*#__PURE__*/React.createElement("pattern", {
      className: "descent-material",
      id: `descent-rock-${material}`,
      width: "840",
      height: "840",
      patternUnits: "userSpaceOnUse"
    }, /*#__PURE__*/React.createElement("g", {
      className: "descent-tile"
    }, /*#__PURE__*/React.createElement("rect", {
      width: "840",
      height: "840",
      fill: `url(#descent-raw-${material}-xy)`
    }), /*#__PURE__*/React.createElement("rect", {
      width: "840",
      height: "840",
      fill: `url(#descent-raw-${material}-y)`,
      mask: "url(#descent-wrap-mask-x)"
    }), /*#__PURE__*/React.createElement("g", {
      mask: "url(#descent-wrap-mask-y)"
    }, /*#__PURE__*/React.createElement("rect", {
      width: "840",
      height: "840",
      fill: `url(#descent-raw-${material}-x)`
    }), /*#__PURE__*/React.createElement("rect", {
      width: "840",
      height: "840",
      fill: `url(#descent-raw-${material})`,
      mask: "url(#descent-wrap-mask-x)"
    })))))), beds.map((bed, i) => /*#__PURE__*/React.createElement("clipPath", {
      key: i,
      id: `descent-bed-${i}`
    }, /*#__PURE__*/React.createElement("path", {
      d: bed
    }))), /*#__PURE__*/React.createElement("filter", {
      id: "descent-mineral-grain"
    }, /*#__PURE__*/React.createElement("feTurbulence", {
      type: "fractalNoise",
      baseFrequency: ".55",
      numOctaves: "3",
      seed: "19",
      stitchTiles: "stitch"
    }), /*#__PURE__*/React.createElement("feColorMatrix", {
      type: "saturate",
      values: "0"
    })), /*#__PURE__*/React.createElement("pattern", {
      id: "descent-grain",
      width: "160",
      height: "160",
      patternUnits: "userSpaceOnUse"
    }, /*#__PURE__*/React.createElement("rect", {
      width: "160",
      height: "160",
      filter: "url(#descent-mineral-grain)"
    })), /*#__PURE__*/React.createElement("linearGradient", {
      id: "descent-bridge",
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1"
    }, /*#__PURE__*/React.createElement("stop", {
      stopColor: "#1d150f"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "1",
      stopColor: "#1d150f",
      stopOpacity: "0"
    })), /*#__PURE__*/React.createElement("linearGradient", {
      id: "descent-reading-veil"
    }, /*#__PURE__*/React.createElement("stop", {
      stopColor: "#120e0b",
      stopOpacity: ".45"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: ".2",
      stopColor: "#120e0b",
      stopOpacity: ".6"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: ".8",
      stopColor: "#120e0b",
      stopOpacity: ".6"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "1",
      stopColor: "#120e0b",
      stopOpacity: ".45"
    }))), /*#__PURE__*/React.createElement("rect", {
      width: "1440",
      height: total,
      fill: "#120e0b"
    }), materials.map((material, i) => /*#__PURE__*/React.createElement("g", {
      key: i
    }, /*#__PURE__*/React.createElement("path", {
      "data-bed": i,
      "data-pinch-out": [6, 18, 37].includes(i) ? true : undefined,
      d: beds[i],
      fill: colors[material]
    }), /*#__PURE__*/React.createElement("path", {
      className: "descent-rock",
      "data-material": material,
      d: beds[i],
      fill: `url(#descent-rock-${material})`
    }), /*#__PURE__*/React.createElement("path", {
      d: beds[i],
      fill: colors[material],
      opacity: .08 + random(i + 210) * .08
    }), /*#__PURE__*/React.createElement("path", {
      d: beds[i],
      fill: "url(#descent-grain)",
      opacity: material === 'sandstone' || material === 'siltstone' ? '.09' : '.04'
    }), /*#__PURE__*/React.createElement("g", {
      clipPath: `url(#descent-bed-${i})`,
      fill: "none"
    }, material !== 'basement' && (material === 'shale' ? [.12, .28, .43, .61, .76, .9] : [.24, .52, .78]).map(fraction => /*#__PURE__*/React.createElement("path", {
      key: fraction,
      d: trace(profiles[i].map(([x]) => {
        const y = boundaryY(i, x) * (1 - fraction) + boundaryY(i + 1, x) * fraction;
        const offset = faults.reduce((sum, fault) => {
          const t = (y - fault.y) / fault.length;
          return sum + (fault.bed === i && t > 0 && t < 1 && x > faultX(fault, y) ? fault.throw * Math.sin(Math.PI * t) : 0);
        }, 0);
        return [x, y + offset];
      })),
      stroke: material === 'shale' ? '#a4aea8' : '#494b40',
      strokeOpacity: ".16",
      strokeWidth: ".55"
    })), /*#__PURE__*/React.createElement("path", {
      "data-fractures": i,
      "data-material": material,
      "data-fracture-count": fracturedBeds.includes(i) && material !== 'basement' ? 18 : fractureCounts[material],
      stroke: material === 'basement' ? '#382e2a' : '#3f4239',
      strokeOpacity: ".42",
      strokeWidth: ".7",
      d: Array.from({
        length: fracturedBeds.includes(i) && material !== 'basement' ? 18 : fractureCounts[material]
      }, (_, n) => {
        const seed = i * 97 + n * 5;
        const x = 12 + (n * 91 + random(seed) * 65) % 1416;
        const top = boundaryY(i, x),
          bottom = boundaryY(i + 1, x);
        const y = top + (random(seed + 1) * .84 + .06) * (bottom - top);
        const length = 14 + random(seed + 2) * (material === 'basement' ? 62 : 32);
        const lean = (n % 3 ? .64 : -.56) * length;
        return `M${x} ${y}l${lean * .45} ${length * .48} ${lean * .55 + 2} ${length * .52}` + (n % 3 === 0 ? `m${-lean * .55 - 3} ${-length * .52}l${-lean * .35} ${length * .3}` : '');
      }).join('')
    }), (material === 'basement' || fracturedBeds.includes(i)) && /*#__PURE__*/React.createElement("path", {
      stroke: "#ddd3b9",
      strokeOpacity: ".36",
      strokeWidth: "1",
      d: Array.from({
        length: material === 'basement' ? 12 : 3
      }, (_, n) => {
        const x = 35 + random(i * 37 + n * 11) * 1370;
        const y = boundaryY(i, x) + (boundaryY(i + 1, x) - boundaryY(i, x)) * random(n * 17 + i);
        return `M${x} ${y}l17 19 -7 11 23 24m-16 -35l-19 7`;
      }).join('')
    })))), profiles.slice(1, -1).map((points, i) => /*#__PURE__*/React.createElement("path", {
      key: i,
      "data-contact": i + 1,
      d: trace(points),
      fill: "none",
      stroke: "#a9a595",
      strokeOpacity: i === materials.length - 2 ? '.3' : '.1',
      strokeWidth: i === materials.length - 2 ? 1 : .6
    })), faults.map((fault, i) => {
      const line = trace(Array.from({
        length: 13
      }, (_, n) => {
        const y = fault.y + fault.length * n / 12;
        return [faultX(fault, y) + Math.sin(n * 1.8 + i) * Math.min(1.2, fault.length * .015), y];
      }));
      return /*#__PURE__*/React.createElement("g", {
        key: i,
        className: "descent-fault",
        clipPath: `url(#descent-bed-${fault.bed})`
      }, /*#__PURE__*/React.createElement("path", {
        "data-fault": i,
        "data-fault-material": materials[fault.bed],
        d: line,
        fill: "none",
        stroke: "#42372e",
        strokeOpacity: ".48",
        strokeWidth: "1"
      }), /*#__PURE__*/React.createElement("path", {
        d: line,
        transform: "translate(1.5 0)",
        fill: "none",
        stroke: "#b0a58e",
        strokeOpacity: ".23",
        strokeWidth: ".6"
      }));
    }), structuralFaults.map((fault, i) => /*#__PURE__*/React.createElement("path", {
      key: i,
      "data-structural-fault": i,
      d: `M${faultX(fault, fault.y)} ${fault.y}l${fault.slope * fault.length} ${fault.length}`,
      fill: "none",
      stroke: "#b3aaa0",
      strokeOpacity: ".28",
      strokeWidth: ".8"
    })), [sandstoneBed, lowerSandstone].map((bed, n) => /*#__PURE__*/React.createElement("g", {
      key: bed,
      className: "descent-motion",
      "data-visible": "false",
      clipPath: `url(#descent-bed-${bed})`
    }, [38, 1240].map(x => /*#__PURE__*/React.createElement(React.Fragment, {
      key: x
    }, /*#__PURE__*/React.createElement("path", {
      d: `M${x} ${middle(bed, x)}l108 -4`,
      fill: "none",
      stroke: "#d8cfc4",
      strokeOpacity: ".12",
      strokeWidth: "1"
    }), [0, 1, 2].map(i => /*#__PURE__*/React.createElement("ellipse", {
      key: i,
      className: "descent-flow",
      cx: x,
      cy: middle(bed, x),
      rx: "3",
      ry: "1.1",
      fill: "#e2d9cd",
      style: {
        animationDelay: `${-i * 1.1 - n * 9}s`
      }
    })))))), /*#__PURE__*/React.createElement("rect", {
      width: "1440",
      height: total,
      fill: "url(#descent-reading-veil)"
    }), /*#__PURE__*/React.createElement("rect", {
      width: "1440",
      height: "240",
      fill: "url(#descent-bridge)"
    }));
  }, [artReady, heights, texturesOn]);
  return /*#__PURE__*/React.createElement("div", {
    ref: rootRef,
    className: "geological-descent"
  }, art, children);
};
Object.assign(window, {
  GeologicalDescent
});

// File: HomeSections.jsx
// HomeSections.jsx — the homepage below the hero: research, projects, publications, contact.
// Facts come from site-content.js, which the CV shares.

// [destructured React]

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
    setStatus(previous => ({
      ...previous,
      [key]: ok ? 'Copied' : 'Copy failed'
    }));
    setTimeout(() => setStatus(previous => ({
      ...previous,
      [key]: ''
    })), 2000);
  };
  return [status, copy];
};
const SiteSection = ({
  id,
  title,
  children
}) => /*#__PURE__*/React.createElement("section", {
  id: id,
  className: "section-panel",
  "aria-labelledby": `${id}-title`
}, /*#__PURE__*/React.createElement("div", {
  className: "sheet"
}, /*#__PURE__*/React.createElement("h2", {
  id: `${id}-title`,
  className: "section-title"
}, title), children));
const SITE_THEMES = [['VE models for depleted gas fields', 'Three-phase CO₂–methane–brine VE with a black-oil approximation, checked against compositional simulation and up to 100× faster.'], ['Storage screening under uncertainty', 'Ensembles of fast VE runs, such as the 28-case ensemble study in MuPSI.'], ['Machine learning for upscaling and digital rock', 'CNNs that upscale permeability tensors and predict two-phase flow properties from micro-CT images.']];
const ActivityList = ({
  items = SITE_ACTIVITY,
  initial = 5
}) => {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, initial);
  return /*#__PURE__*/React.createElement("div", {
    className: "activity"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "activity__title"
  }, "Recent activity"), /*#__PURE__*/React.createElement("ol", {
    className: "activity__list",
    id: "activity-list"
  }, shown.map(item => /*#__PURE__*/React.createElement("li", {
    key: `${item.month}-${item.title}`,
    className: "activity__item"
  }, /*#__PURE__*/React.createElement("time", {
    dateTime: item.month
  }, item.date), /*#__PURE__*/React.createElement("h4", null, item.title), /*#__PURE__*/React.createElement("p", null, item.body)))), items.length > initial && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--quiet btn--small",
    "aria-expanded": expanded,
    "aria-controls": "activity-list",
    onClick: () => setExpanded(!expanded)
  }, expanded ? 'Show recent activity only' : 'Show earlier activity'));
};
const ResearchSection = () => /*#__PURE__*/React.createElement(SiteSection, {
  id: "research",
  title: "Research"
}, /*#__PURE__*/React.createElement("div", {
  className: "research"
}, /*#__PURE__*/React.createElement("div", {
  className: "research__main"
}, /*#__PURE__*/React.createElement("p", {
  className: "lead"
}, "I\u2019m a PhD candidate in Petroleum Engineering at Heriot-Watt University. I study how injected CO\u2082 migrates through depleted gas reservoirs, and how to simulate it quickly at field scale."), /*#__PURE__*/React.createElement("p", null, "My main tool is the vertical-equilibrium (VE) model, which assumes that CO\u2082, methane and brine separate vertically under buoyancy. That reduces a 3D reservoir model to 2D and makes it fast enough for screening, uncertainty quantification and optimisation studies. I build these models in MRST, apply them to depleted gas fields in the MuPSI project, and teach MRST\u2019s rapid-prototyping framework at Heriot-Watt."), /*#__PURE__*/React.createElement("h3", null, "Themes"), /*#__PURE__*/React.createElement("dl", {
  className: "themes"
}, SITE_THEMES.map(([term, detail]) => /*#__PURE__*/React.createElement("div", {
  key: term
}, /*#__PURE__*/React.createElement("dt", null, term), /*#__PURE__*/React.createElement("dd", null, detail)))), /*#__PURE__*/React.createElement("h3", null, "Methods and tools"), /*#__PURE__*/React.createElement("p", {
  className: "methods"
}, "VE modelling, multiphase and compositional simulation, permeability upscaling and scientific machine learning, in MATLAB and MRST, Python, and Julia with JutulDarcy."), /*#__PURE__*/React.createElement("h3", null, "Background"), /*#__PURE__*/React.createElement("p", null, "BSc and MSc in Petroleum Engineering from Amirkabir University of Technology, Tehran, focused on reservoir simulation and machine learning for upscaling and digital rock.")), /*#__PURE__*/React.createElement("div", {
  className: "research__aside"
}, /*#__PURE__*/React.createElement(ActivityList, null))));
const ProjectsSection = () => {
  const [feature, ...others] = SITE_PROJECTS;
  return /*#__PURE__*/React.createElement(SiteSection, {
    id: "projects",
    title: "Projects"
  }, /*#__PURE__*/React.createElement("article", {
    className: "project-feature"
  }, /*#__PURE__*/React.createElement("div", {
    className: "project-feature__text"
  }, /*#__PURE__*/React.createElement("h3", null, feature.title), /*#__PURE__*/React.createElement("p", null, feature.body), /*#__PURE__*/React.createElement("p", {
    className: "project-links"
  }, feature.links.map((link, index) => /*#__PURE__*/React.createElement("a", {
    key: link.href,
    className: `btn ${index === 0 ? 'btn--primary' : 'btn--quiet'} btn--small`,
    href: link.href
  }, link.label)))), /*#__PURE__*/React.createElement("a", {
    className: "project-feature__media",
    href: feature.links[0].href,
    "aria-label": feature.links[0].label
  }, /*#__PURE__*/React.createElement("img", {
    className: "project-feature__shot",
    src: feature.image.src,
    width: feature.image.width,
    height: feature.image.height,
    alt: feature.image.alt,
    loading: "lazy",
    decoding: "async"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "project-list"
  }, others.map(project => /*#__PURE__*/React.createElement("article", {
    key: project.id,
    className: "project"
  }, /*#__PURE__*/React.createElement("h3", null, project.title, project.meta && /*#__PURE__*/React.createElement("span", {
    className: "project__meta"
  }, project.meta)), /*#__PURE__*/React.createElement("p", null, project.body)))));
};
const SiteAuthors = ({
  authors
}) => /*#__PURE__*/React.createElement("p", {
  className: "pub__authors"
}, authors.map((name, i) => /*#__PURE__*/React.createElement(React.Fragment, {
  key: name
}, i > 0 && ', ', name === 'Telvari, S.' ? /*#__PURE__*/React.createElement("strong", null, name) : name)));
const PublicationsSection = () => {
  const [status, copy] = useCopyStatus();
  return /*#__PURE__*/React.createElement(SiteSection, {
    id: "publications",
    title: "Publications"
  }, /*#__PURE__*/React.createElement("ol", {
    className: "pubs"
  }, SITE_PUBLICATIONS.map(pub => /*#__PURE__*/React.createElement("li", {
    key: pub.id,
    className: "pub"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pub__year"
  }, pub.year), /*#__PURE__*/React.createElement("div", {
    className: "pub__body"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "pub__title"
  }, /*#__PURE__*/React.createElement("a", {
    href: pub.url,
    target: "_blank",
    rel: "noreferrer"
  }, pub.title)), /*#__PURE__*/React.createElement(SiteAuthors, {
    authors: pub.authors
  }), /*#__PURE__*/React.createElement("p", {
    className: "pub__venue"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pub__status"
  }, pub.status), pub.venue), /*#__PURE__*/React.createElement("p", {
    className: "pub__summary"
  }, pub.summary), /*#__PURE__*/React.createElement("div", {
    className: "pub__actions"
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn--quiet btn--small",
    href: pub.url,
    target: "_blank",
    rel: "noreferrer"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "external",
    size: 15
  }), "DOI ", pub.doi), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--quiet btn--small",
    onClick: () => copy(pub.id, pub.bibtex),
    "aria-label": `Copy BibTeX for ${pub.title}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: status[pub.id] === 'Copied' ? 'check' : 'copy',
    size: 15
  }), status[pub.id] || 'Copy BibTeX'), /*#__PURE__*/React.createElement("span", {
    className: "visually-hidden",
    "aria-live": "polite"
  }, status[pub.id] ? `${status[pub.id]}: BibTeX for ${pub.title}` : '')))))), /*#__PURE__*/React.createElement("p", {
    className: "pubs__more"
  }, "Citations and new work: ", /*#__PURE__*/React.createElement("a", {
    href: SITE_LINKS.scholar,
    target: "_blank",
    rel: "noreferrer"
  }, "Google Scholar"), " and", ' ', /*#__PURE__*/React.createElement("a", {
    href: SITE_LINKS.orcid,
    target: "_blank",
    rel: "noreferrer"
  }, "ORCID"), "."));
};
const SITE_CONTACT_PROFILES = [['scholar', 'Google Scholar', 'Publications and citations', SITE_LINKS.scholar], ['orcid', 'ORCID', SITE_LINKS.orcidId, SITE_LINKS.orcid], ['github', 'GitHub', SITE_LINKS.githubUser, SITE_LINKS.github], ['linkedin', 'LinkedIn', SITE_LINKS.linkedinUser, SITE_LINKS.linkedin]];
const ContactSection = () => {
  const [status, copy] = useCopyStatus();
  return /*#__PURE__*/React.createElement(SiteSection, {
    id: "contact",
    title: "Contact"
  }, /*#__PURE__*/React.createElement("div", {
    className: "contact"
  }, /*#__PURE__*/React.createElement("div", {
    className: "contact__main"
  }, /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, "For collaborations, preprints or questions about VE models and the simulator, email me."), /*#__PURE__*/React.createElement("div", {
    className: "contact__email"
  }, /*#__PURE__*/React.createElement("a", {
    href: `mailto:${SITE_LINKS.email}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "mail",
    size: 18
  }), SITE_LINKS.email), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--quiet btn--small",
    onClick: () => copy('email', SITE_LINKS.email),
    "aria-label": "Copy email address"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: status.email === 'Copied' ? 'check' : 'copy',
    size: 15
  }), status.email || 'Copy'), /*#__PURE__*/React.createElement("span", {
    className: "visually-hidden",
    "aria-live": "polite"
  }, status.email ? `${status.email}: email address` : '')), /*#__PURE__*/React.createElement("p", {
    className: "contact__address"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pin",
    size: 16
  }), "Institute of GeoEnergy Engineering, Heriot-Watt University, Edinburgh, UK")), /*#__PURE__*/React.createElement("ul", {
    className: "contact__profiles"
  }, SITE_CONTACT_PROFILES.map(([icon, label, detail, href]) => /*#__PURE__*/React.createElement("li", {
    key: icon
  }, /*#__PURE__*/React.createElement("a", {
    href: href,
    target: "_blank",
    rel: "noreferrer"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, label), /*#__PURE__*/React.createElement("small", null, detail))))))));
};
Object.assign(window, {
  ResearchSection,
  ProjectsSection,
  PublicationsSection,
  ContactSection,
  ActivityList,
  siteCopy
});

// File: CVPage.jsx
// CVPage.jsx — the curriculum vitae: an Earth document on screen, black on white in print.
// Facts come from site-content.js, which the homepage shares.

const CVSection = ({
  id,
  title,
  children
}) => /*#__PURE__*/React.createElement("section", {
  className: "cv-section",
  "aria-labelledby": `cv-${id}`
}, /*#__PURE__*/React.createElement("h2", {
  id: `cv-${id}`
}, title), children);
const CVRows = ({
  items
}) => /*#__PURE__*/React.createElement("div", {
  className: "cv-rows"
}, items.map(item => /*#__PURE__*/React.createElement("div", {
  key: `${item.date}-${item.title}`,
  className: "cv-row"
}, /*#__PURE__*/React.createElement("span", {
  className: "cv-date"
}, item.date), /*#__PURE__*/React.createElement("div", {
  className: "cv-entry"
}, /*#__PURE__*/React.createElement("h3", null, item.title), item.place && /*#__PURE__*/React.createElement("p", {
  className: "cv-place"
}, item.place), (item.details || []).map(detail => /*#__PURE__*/React.createElement("p", {
  key: detail,
  className: "cv-detail"
}, detail))))));
const CVPublications = () => /*#__PURE__*/React.createElement("div", {
  className: "cv-rows"
}, SITE_PUBLICATIONS.map(pub => /*#__PURE__*/React.createElement("div", {
  key: pub.id,
  className: "cv-row"
}, /*#__PURE__*/React.createElement("span", {
  className: "cv-date"
}, pub.year), /*#__PURE__*/React.createElement("div", {
  className: "cv-entry"
}, /*#__PURE__*/React.createElement("h3", null, /*#__PURE__*/React.createElement("a", {
  href: pub.url
}, pub.title)), /*#__PURE__*/React.createElement("p", {
  className: "cv-place"
}, pub.authors.map((name, i) => /*#__PURE__*/React.createElement(React.Fragment, {
  key: name
}, i > 0 && ', ', name === 'Telvari, S.' ? /*#__PURE__*/React.createElement("strong", null, name) : name))), /*#__PURE__*/React.createElement("p", {
  className: "cv-detail"
}, pub.venue, ". ", pub.status, ". DOI ", /*#__PURE__*/React.createElement("a", {
  href: pub.url
}, pub.doi))))));
const CVPage = () => /*#__PURE__*/React.createElement("article", {
  className: "cv"
}, /*#__PURE__*/React.createElement("header", {
  className: "cv-head"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Sa\u2019eed Telvari"), /*#__PURE__*/React.createElement("p", {
  className: "cv-role"
}, SITE_CV.title), /*#__PURE__*/React.createElement("ul", {
  className: "cv-contact"
}, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Icon, {
  name: "pin",
  size: 15
}), SITE_CV.location), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: `mailto:${SITE_LINKS.email}`
}, /*#__PURE__*/React.createElement(Icon, {
  name: "mail",
  size: 15
}), SITE_LINKS.email)), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: SITE_LINKS.orcid
}, /*#__PURE__*/React.createElement(Icon, {
  name: "orcid",
  size: 15
}), "ORCID ", SITE_LINKS.orcidId)), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: SITE_LINKS.scholar
}, /*#__PURE__*/React.createElement(Icon, {
  name: "scholar",
  size: 15
}), "Google Scholar")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: SITE_LINKS.linkedin
}, /*#__PURE__*/React.createElement(Icon, {
  name: "linkedin",
  size: 15
}), "linkedin.com/in/", SITE_LINKS.linkedinUser)), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "https://saeedtelvari.github.io/"
}, "saeedtelvari.github.io")))), /*#__PURE__*/React.createElement("button", {
  type: "button",
  className: "btn btn--quiet cv-print",
  onClick: () => window.print()
}, /*#__PURE__*/React.createElement(Icon, {
  name: "print",
  size: 16
}), "Print or save as PDF")), /*#__PURE__*/React.createElement(CVSection, {
  id: "interests",
  title: "Research interests"
}, /*#__PURE__*/React.createElement("p", {
  className: "cv-interests"
}, SITE_CV.interests)), /*#__PURE__*/React.createElement(CVSection, {
  id: "education",
  title: "Education"
}, /*#__PURE__*/React.createElement(CVRows, {
  items: SITE_CV.education
})), /*#__PURE__*/React.createElement(CVSection, {
  id: "experience",
  title: "Research projects and experience"
}, /*#__PURE__*/React.createElement(CVRows, {
  items: SITE_CV.experience
})), /*#__PURE__*/React.createElement(CVSection, {
  id: "publications",
  title: "Publications"
}, /*#__PURE__*/React.createElement(CVPublications, null)), /*#__PURE__*/React.createElement(CVSection, {
  id: "presentations",
  title: "Presentations"
}, /*#__PURE__*/React.createElement(CVRows, {
  items: SITE_CV.presentations
})), /*#__PURE__*/React.createElement(CVSection, {
  id: "teaching",
  title: "Teaching"
}, /*#__PURE__*/React.createElement(CVRows, {
  items: SITE_CV.teaching
})), /*#__PURE__*/React.createElement(CVSection, {
  id: "service",
  title: "Service and leadership"
}, /*#__PURE__*/React.createElement(CVRows, {
  items: SITE_CV.service
})), /*#__PURE__*/React.createElement(CVSection, {
  id: "training",
  title: "Professional training"
}, /*#__PURE__*/React.createElement(CVRows, {
  items: SITE_CV.training
})), /*#__PURE__*/React.createElement(CVSection, {
  id: "skills",
  title: "Skills"
}, /*#__PURE__*/React.createElement("dl", {
  className: "cv-skills"
}, SITE_CV.skills.map(([area, list]) => /*#__PURE__*/React.createElement("div", {
  key: area
}, /*#__PURE__*/React.createElement("dt", null, area), /*#__PURE__*/React.createElement("dd", null, list))))), /*#__PURE__*/React.createElement(CVSection, {
  id: "recognition",
  title: "Recognition"
}, /*#__PURE__*/React.createElement(CVRows, {
  items: SITE_CV.recognition
})));
Object.assign(window, {
  CVPage
});

// File: App.jsx
// App.jsx — entries for the three pages (home, CV, simulator) and their navigation.

// [destructured React]

// ---- navigation helpers (pure; tests/site-nav.test.js evaluates this block)
const SITE_NAV_ITEMS = [{
  id: 'research',
  label: 'Research',
  href: './index.html#research'
}, {
  id: 'projects',
  label: 'Projects',
  href: './index.html#projects'
}, {
  id: 'publications',
  label: 'Publications',
  href: './index.html#publications'
}, {
  id: 'simulator',
  label: 'Simulator',
  href: './simulator.html'
}, {
  id: 'cv',
  label: 'CV',
  href: './cv.html'
}, {
  id: 'contact',
  label: 'Contact',
  href: './index.html#contact'
}];
const SITE_SECTION_IDS = ['research', 'projects', 'publications', 'contact'];

// The section whose top has passed the reading line (viewport coordinates); the hero is 'home'.
const siteActiveSection = (rects, line) => {
  let active = 'home';
  for (const rect of rects) if (rect.top <= line) active = rect.id;
  return active;
};

// Old anchors from before the redesign keep working.
const siteLegacyTarget = hash => ({
  '#about': 'research',
  '#research': 'research',
  '#projects': 'projects',
  '#publications': 'publications',
  '#contact': 'contact',
  '#cv': 'cv',
  '#simulator': 'simulator'
})[hash] || 'home';
// ---- end navigation helpers

const siteHref = id => (SITE_NAV_ITEMS.find(item => item.id === id) || {
  href: './index.html'
}).href;
const siteReducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const siteScrollTo = id => {
  const behavior = siteReducedMotion() ? 'auto' : 'smooth';
  if (id === 'home') {
    window.scrollTo({
      top: 0,
      behavior
    });
    return;
  }
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({
    behavior,
    block: 'start'
  });
};

// Links are real; only plain clicks on targets within the current page are handled here.
const siteNavigate = (page, id, event) => {
  if (event && (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
  const samePage = id === page || page === 'home' && SITE_SECTION_IDS.includes(id);
  if (!samePage) {
    if (!event) window.location.href = siteHref(id);
    return;
  }
  if (event) event.preventDefault();
  if (page === 'home' && id !== 'home') {
    siteScrollTo(id);
    window.history.pushState({
      id
    }, '', `${window.location.pathname}#${id}`);
  } else {
    siteScrollTo('home');
    if (window.location.hash) window.history.pushState({
      id
    }, '', window.location.pathname);
  }
};

// The pre-React shell in each HTML page fades out once React has rendered.
const dismissLoader = () => {
  if (window.__appReady) window.__appReady();
  const loader = document.getElementById('app-loader');
  if (!loader) return () => {};
  loader.classList.add('loader-finished');
  const timer = setTimeout(() => loader.remove(), 500);
  return () => clearTimeout(timer);
};
const SkipLink = () => /*#__PURE__*/React.createElement("a", {
  className: "skip-link",
  href: "#main-content"
}, "Skip to content");
const SiteHome = () => {
  const [active, setActive] = useState('home');
  const navigate = (id, event) => siteNavigate('home', id, event);
  useEffect(() => dismissLoader(), []);

  // Old and new anchors: pages redirect, sections scroll into view after the first layout.
  useEffect(() => {
    const apply = () => {
      const target = siteLegacyTarget(window.location.hash);
      if (target === 'cv' || target === 'simulator') {
        window.location.replace(siteHref(target));
        return;
      }
      if (target !== 'home') requestAnimationFrame(() => siteScrollTo(target));
    };
    apply();
    window.addEventListener('hashchange', apply);
    window.addEventListener('popstate', apply);
    return () => {
      window.removeEventListener('hashchange', apply);
      window.removeEventListener('popstate', apply);
    };
  }, []);

  // One scroll spy for the header: the section under a line 45 % down the viewport.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const rects = SITE_SECTION_IDS.map(id => {
        const element = document.getElementById(id);
        if (!element) return null;
        const box = element.getBoundingClientRect();
        return {
          id,
          top: box.top,
          bottom: box.bottom
        };
      }).filter(Boolean);
      setActive(siteActiveSection(rects, window.innerHeight * 0.45));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, {
      passive: true
    });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SkipLink, null), /*#__PURE__*/React.createElement(Header, {
    active: active,
    onNavigate: navigate
  }), /*#__PURE__*/React.createElement(GeologicalDescent, null, /*#__PURE__*/React.createElement("main", {
    id: "main-content",
    tabIndex: -1
  }, /*#__PURE__*/React.createElement(SubsurfaceHero, {
    onNavigate: navigate
  }), /*#__PURE__*/React.createElement(ResearchSection, null), /*#__PURE__*/React.createElement(ProjectsSection, null), /*#__PURE__*/React.createElement(PublicationsSection, null), /*#__PURE__*/React.createElement(ContactSection, null)), /*#__PURE__*/React.createElement(Footer, {
    onNavigate: navigate,
    geological: true
  })));
};
const CVStandalone = () => {
  const navigate = (id, event) => siteNavigate('cv', id, event);
  useEffect(() => dismissLoader(), []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SkipLink, null), /*#__PURE__*/React.createElement(Header, {
    active: "cv",
    onNavigate: navigate
  }), /*#__PURE__*/React.createElement("main", {
    id: "main-content",
    tabIndex: -1
  }, /*#__PURE__*/React.createElement(CVPage, {
    onNavigate: navigate
  })), /*#__PURE__*/React.createElement(Footer, {
    onNavigate: navigate
  }));
};

// Standalone simulator entry — rendered when the page is simulator.html.
const SimulatorStandalone = () => {
  useEffect(() => dismissLoader(), []);
  return /*#__PURE__*/React.createElement("div", {
    className: "ve-standalone",
    "data-screen-label": "03 VE Simulator"
  }, /*#__PURE__*/React.createElement(SkipLink, null), /*#__PURE__*/React.createElement(Header, {
    active: "simulator",
    onNavigate: (id, event) => siteNavigate('simulator', id, event),
    variant: "workbench"
  }), /*#__PURE__*/React.createElement("main", {
    id: "main-content"
  }, /*#__PURE__*/React.createElement(SimulatorPage, null)));
};
const rootEl = document.getElementById('root');
const sitePage = rootEl && typeof rootEl.getAttribute === 'function' ? rootEl.getAttribute('data-page') : null;
const root = ReactDOM.createRoot(rootEl);
root.render(sitePage === 'simulator' ? /*#__PURE__*/React.createElement(SimulatorStandalone, null) : sitePage === 'cv' ? /*#__PURE__*/React.createElement(CVStandalone, null) : /*#__PURE__*/React.createElement(SiteHome, null));

