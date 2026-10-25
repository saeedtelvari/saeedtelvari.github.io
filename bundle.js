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
  title: 'MuPSI field-scale case study',
  body: 'Built vertical-equilibrium models for a field-scale case study of depleted gas fields in the MuPSI CO₂ storage project, and presented the results to the project partners.'
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
  body: 'Multiscale Pressure-Stress Impacts on fault integrity for multi-site regional CO₂ storage, a Clean Energy Transition Partnership project. I built VE models for a field-scale case study of depleted gas fields, with NORCE, TU Delft and IDAEA-CSIC.'
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
    details: ['VE models for a field-scale case study of depleted gas fields, with NORCE, TU Delft and IDAEA-CSIC.']
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

// The words of the story at the top of the homepage (docs/superpowers/specs/2026-10-25-homepage-story-design.md).
// A caption has two sentences at most. *h* marks italic text. Chapters with two captions switch at the middle.
const SITE_STORY = {
  label: 'From orbit to a live vertical-equilibrium model',
  name: 'Sa’eed Telvari',
  ppm: '280 ppm in 1850. More than 420 ppm today.',
  captions: {
    orbit: ['There is more than 420 ppm of CO₂ in the air. I model how rock under the North Sea can hold it for thousands of years.'],
    descent: ['Carbon capture and storage puts CO₂ back into rock, deep under the sea floor.'],
    rock: ['The well goes about 2 km down, through clay, chalk and a shale caprock.', 'The sandstone is a dome that held natural gas for millions of years. Most of the gas is produced, so the dome can now store CO₂.'],
    grid: ['A 3D model splits the reservoir into cells that follow the layers and the fault. Field models have millions of cells, and one run can take days.', 'Faults cut the reservoir and can leak. In the MuPSI project, which studies fault integrity, I apply these models to depleted gas fields.'],
    ve: ['Gas is lighter than brine. Both the CO₂ and the methane rise to the top of each column.', 'The rock stays 3D, but the vertical cells go. VE solves one value per column, the plume thickness *h*, so it runs up to 100× faster.'],
    live: ['This VE model runs in your browser.']
  },
  // Links under the caption of the last chapter. An entry with an id scrolls to that section of the page.
  actions: [{
    label: 'Open the simulator',
    href: './simulator.html'
  }, {
    label: 'Read my research',
    href: './index.html#research',
    id: 'research'
  }]
};
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SITE_LINKS,
    SITE_PUBLICATIONS,
    SITE_ACTIVITY,
    SITE_PROJECTS,
    SITE_CV,
    SITE_STORY
  };
}

// File: Header.jsx
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
// Header.jsx — fixed navigation shared by the homepage, the CV and the simulator.
// The site variant is transparent over the story sky (with ink text) and turns into an Earth
// surface once the page scrolls past the story; the workbench variant is the simulator's solid 56 px bar.

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
  const [overStory, setOverStory] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const mobileDrawerRef = useRef(null);

  // Over the story the site header is transparent with ink text; it gains a dark surface once the page moves past the story.
  useEffect(() => {
    if (variant !== 'site') return undefined;
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const story = document.getElementById('story');
      setOverStory(!!story && story.getBoundingClientRect().bottom > 32);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [variant]);

  // The open drawer is modal: the page behind is inert, Tab cycles inside, Escape closes.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const mainContent = document.getElementById('main-content');
    const story = document.getElementById('story');
    const drawer = mobileDrawerRef.current;
    setHeaderBackgroundInert(mainContent, true);
    setHeaderBackgroundInert(story, true);
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
      setHeaderBackgroundInert(story, false);
      if (menuButtonRef.current) menuButtonRef.current.focus();
    };
  }, [mobileOpen]);
  const handleItemClick = (id, event) => {
    setMobileOpen(false);
    if (onNavigate) onNavigate(id, event);
  };
  const classes = ['app-header', `app-header--${variant}`, scrolled ? 'is-scrolled' : '', overStory ? 'is-over-story' : ''].filter(Boolean).join(' ');
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

// File: StoryStage.jsx
// StoryStage.jsx — the story at the top of the homepage: one pinned stage, one canvas, HTML captions.
//
// RENDERER API (the art of each chapter plugs in here)
//
// STORY_RENDERERS is a global object. Its keys are the chapter ids: orbit, descent, rock, grid, ve, live.
// Each value is a renderer: { draw(ctx, frame), animated?, mount?(layer), unmount?() }.
//   draw(ctx, frame)  Draw the chapter. The canvas is cleared before each call.
//                     ctx is a 2D context, already scaled by dpr. Draw in CSS pixels, from (0, 0) to (width, height).
//                     ctx.save() and ctx.restore() surround the call.
//   frame             { local, p, width, height, dpr, time, reducedMotion }
//     local           Progress in this chapter, from 0 to 1.
//     p               Progress in the whole story, from 0 to 1.
//     width, height   Size of the stage in CSS pixels.
//     dpr             Pixel ratio of the canvas: the device pixel ratio, with a maximum of 2.
//     time            Milliseconds from the requestAnimationFrame timestamp. It is 0 in a static frame.
//     reducedMotion   true in the six static frames of the reduced-motion layout. local is 1 in these frames.
//   animated          Set it to true if draw() reads frame.time. Then draw() runs on each animation frame while this
//                     chapter is current, the stage is on screen and the tab is visible.
//                     If it is not true, draw() runs only when p or the stage size changes.
//   mount(layer)      Only the chapter live uses it. layer is an empty div that fills the stage.
//   unmount()         The layer takes pointer events while live is current. mount runs when live becomes current.
//                     unmount runs when the visitor scrolls out of live. Neither runs in a static frame.
// A renderer that throws is reported once in the console. The story then goes on.
//
// Colours: STORY_COLORS has the same values as the --story-* tokens in colors_and_type.css.
// Captions are HTML above the canvas. The words are in SITE_STORY (site-content.js).
// The place of each caption is in colors_and_type.css: .story-chapter[data-chapter="id"].
// To change the caption colour for one chapter, set --story-text on .story-stage[data-chapter="id"].
// The site header covers the top 64 px of the stage. The skip control is at the top right under the header.
// The progress rail is in the bottom 12 px. Below 640 px of width, the captions are at the top: keep that band clear.

// [destructured React]

// ---- story helpers (pure; tests/story-stage.test.js evaluates this block)
const STORY_SCREENS = 7;
const STORY_CHAPTERS = [{
  id: 'orbit',
  title: 'Orbit',
  from: 0,
  to: 0.10
}, {
  id: 'descent',
  title: 'Descent',
  from: 0.10,
  to: 0.26
}, {
  id: 'rock',
  title: 'Into the rock',
  from: 0.26,
  to: 0.44
}, {
  id: 'grid',
  title: 'Rock to grid',
  from: 0.44,
  to: 0.60
}, {
  id: 've',
  title: '3D to VE',
  from: 0.60,
  to: 0.80
}, {
  id: 'live',
  title: 'Live VE',
  from: 0.80,
  to: 1
}];

// How many captions each chapter has. A chapter with two captions switches at the middle.
const STORY_CAPTION_COUNT = {
  orbit: 1,
  descent: 1,
  rock: 2,
  grid: 2,
  ve: 2,
  live: 1
};

// The same values as the --story-* tokens in colors_and_type.css.
const STORY_COLORS = {
  sky: '#c9d6dc',
  sea: '#2f5866',
  land: '#c9b26b',
  sand: '#d8a657',
  shale: '#8c7f70',
  chalk: '#ece6d6',
  co2: '#3b6cf0',
  ch4: '#c8463d',
  ink: '#1f2a30',
  grid: '#fff4df',
  cream: '#f3efe4',
  muted: '#4a5a62'
};

// A number from lo to hi. NaN gives lo.
const storyClamp = (value, lo = 0, hi = 1) => value > lo ? Math.min(value, hi) : lo;

// Story progress from the container's bounding-rect top. The stage is pinned for height - viewport pixels.
const storyProgress = ({
  top,
  height,
  viewport
}) => {
  const span = height - viewport;
  return span > 0 ? storyClamp(-top / span) : 0;
};

// The chapter at progress p, and the progress inside it. p = 1 gives the last chapter with local 1.
const storyChapterAt = p => {
  const at = storyClamp(p);
  const found = STORY_CHAPTERS.findIndex(chapter => at < chapter.to);
  const index = found < 0 ? STORY_CHAPTERS.length - 1 : found;
  const {
    id,
    from,
    to
  } = STORY_CHAPTERS[index];
  return {
    index,
    id,
    local: storyClamp((at - from) / (to - from))
  };
};
const storyCaptionIndex = (id, local) => {
  const count = STORY_CAPTION_COUNT[id] || 1;
  return Math.min(count - 1, Math.floor(storyClamp(local) * count));
};

// Six fill fractions for the progress rail, one for each chapter.
const storyRail = p => STORY_CHAPTERS.map(({
  from,
  to
}) => storyClamp((p - from) / (to - from)));

// Splits a caption at the *marks* into plain and italic parts.
const storyInline = text => text.split('*').map((part, i) => ({
  text: part,
  em: i % 2 === 1
})).filter(part => part.text);
// ---- end story helpers

const STORY_MAX_DPR = 2;
const STORY_REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

// The renderers of the chapters. StoryChapters.jsx fills it with placeholders.
const STORY_RENDERERS = {};
const storyReported = {};
const storyGuard = (key, run) => {
  try {
    run();
  } catch (error) {
    if (!storyReported[key]) {
      storyReported[key] = true;
      console.error(`The story renderer "${key}" failed.`, error);
    }
  }
};

// Clears the canvas and lets the renderer of one chapter draw one frame.
const storyPaint = (ctx, id, frame) => {
  ctx.setTransform(frame.dpr, 0, 0, frame.dpr, 0, 0);
  ctx.clearRect(0, 0, frame.width, frame.height);
  const entry = STORY_RENDERERS[id];
  if (!entry || typeof entry.draw !== 'function') return;
  ctx.save();
  storyGuard(`${id}.draw`, () => entry.draw(ctx, frame));
  ctx.restore();
};

// A plain click goes to a section of the page with the same helper as the header. Other clicks keep the link.
const storyGo = (event, id, onNavigate) => {
  if (onNavigate) {
    onNavigate(id, event);
    return;
  }
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  siteScrollTo(id);
};
const useStoryReducedMotion = () => {
  const [reduced, setReduced] = useState(() => !!(window.matchMedia && window.matchMedia(STORY_REDUCED_QUERY).matches));
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const query = window.matchMedia(STORY_REDUCED_QUERY);
    const update = () => setReduced(query.matches);
    update();
    if (query.addEventListener) query.addEventListener('change', update);else query.addListener(update);
    return () => {
      if (query.removeEventListener) query.removeEventListener('change', update);else query.removeListener(update);
    };
  }, []);
  return reduced;
};
const StoryText = ({
  text
}) => /*#__PURE__*/React.createElement(React.Fragment, null, storyInline(text).map((part, i) => part.em ? /*#__PURE__*/React.createElement("em", {
  key: i
}, part.text) : /*#__PURE__*/React.createElement(React.Fragment, {
  key: i
}, part.text)));

// The words of one chapter. In the pinned story, on and caption say which parts the visitor sees now.
// A caption of null means that all captions are on.
const StoryWords = ({
  chapter,
  on,
  caption,
  onNavigate
}) => {
  const copy = SITE_STORY.captions[chapter.id] || [];
  const actions = chapter.id === 'live' ? SITE_STORY.actions : [];
  return /*#__PURE__*/React.createElement(React.Fragment, null, chapter.id === 'orbit' && /*#__PURE__*/React.createElement("h1", {
    className: "story-name story-fade",
    "data-on": on
  }, SITE_STORY.name), /*#__PURE__*/React.createElement("div", {
    className: "story-stack"
  }, copy.map((text, k) => /*#__PURE__*/React.createElement("p", {
    key: k,
    className: "story-caption story-fade",
    "data-on": on && (caption === null || k === caption)
  }, /*#__PURE__*/React.createElement(StoryText, {
    text: text
  })))), chapter.id === 'orbit' && /*#__PURE__*/React.createElement("p", {
    className: "story-note story-fade",
    "data-on": on
  }, SITE_STORY.ppm), actions.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "story-actions story-fade",
    "data-on": on
  }, actions.map((action, i) => /*#__PURE__*/React.createElement("a", {
    key: action.href,
    className: i === 0 ? 'story-btn story-btn--primary' : 'story-btn',
    href: action.href,
    tabIndex: on ? undefined : -1,
    onClick: action.id ? event => storyGo(event, action.id, onNavigate) : undefined
  }, action.label))));
};

// The pinned story. One scroll listener and one animation frame loop draw the canvas from refs.
// React state holds only the chapter and the caption that the captions need.
const StoryPinned = ({
  sectionRef,
  onNavigate
}) => {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const layerRef = useRef(null);
  const railRef = useRef(null);
  const [view, setView] = useState({
    index: 0,
    caption: 0
  });
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const layer = layerRef.current;
    const rail = railRef.current;
    if (!section || !stage || !canvas || !layer || !rail) return undefined;
    const ctx = canvas.getContext('2d');
    const fills = Array.from(rail.querySelectorAll('i'));
    let alive = true;
    let frame = 0;
    let visible = true;
    let dirty = true;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let p = 0;
    let drawn = -1;
    let current = storyChapterAt(0);
    let shown = view;
    let mounted = null;

    // The layer of the chapter live exists only while that chapter is current.
    const syncLayer = id => {
      if (id === 'live' && !mounted) {
        const entry = STORY_RENDERERS.live;
        if (!entry) return;
        mounted = entry;
        if (entry.mount) storyGuard('live.mount', () => entry.mount(layer));
      } else if (id !== 'live' && mounted) {
        const entry = mounted;
        mounted = null;
        if (entry.unmount) storyGuard('live.unmount', () => entry.unmount());
      }
    };
    const resize = () => {
      width = stage.clientWidth;
      height = stage.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, STORY_MAX_DPR);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      dirty = true;
    };
    const tick = now => {
      frame = 0;
      if (!alive) return;
      const box = section.getBoundingClientRect();
      p = storyProgress({
        top: box.top,
        height: box.height,
        viewport: height
      });
      current = storyChapterAt(p);
      const caption = storyCaptionIndex(current.id, current.local);
      if (current.index !== shown.index || caption !== shown.caption) {
        shown = {
          index: current.index,
          caption
        };
        setView(shown);
      }
      syncLayer(current.id);
      const entry = STORY_RENDERERS[current.id];
      const running = !!(entry && entry.animated) && visible && !document.hidden;
      if (width && height && (dirty || p !== drawn || running)) {
        storyPaint(ctx, current.id, {
          local: current.local,
          p,
          width,
          height,
          dpr,
          time: now,
          reducedMotion: false
        });
        const fractions = storyRail(p);
        fills.forEach((fill, i) => {
          fill.style.transform = `scaleX(${fractions[i]})`;
        });
        drawn = p;
        dirty = false;
      }
      if (running) schedule();
    };
    const schedule = () => {
      if (alive && !frame) frame = requestAnimationFrame(tick);
    };
    const onVisibility = () => {
      if (!document.hidden) schedule();
    };
    const sizes = new ResizeObserver(() => {
      resize();
      schedule();
    });
    const watcher = new IntersectionObserver(entries => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) {
        dirty = true;
        schedule();
      }
    });
    sizes.observe(stage);
    watcher.observe(section);
    window.addEventListener('scroll', schedule, {
      passive: true
    });
    document.addEventListener('visibilitychange', onVisibility);
    // The canvas text changes when the web fonts arrive.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => {
      dirty = true;
      schedule();
    });
    resize();
    schedule();
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      document.removeEventListener('visibilitychange', onVisibility);
      sizes.disconnect();
      watcher.disconnect();
      syncLayer('');
    };
  }, [sectionRef]);
  return /*#__PURE__*/React.createElement("div", {
    ref: stageRef,
    className: "story-stage",
    "data-chapter": STORY_CHAPTERS[view.index].id
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    className: "story-canvas",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    ref: layerRef,
    className: "story-layer"
  }), /*#__PURE__*/React.createElement("div", {
    className: "story-captions"
  }, STORY_CHAPTERS.map((chapter, i) => /*#__PURE__*/React.createElement("div", {
    key: chapter.id,
    className: "story-chapter",
    "data-chapter": chapter.id,
    "data-active": i === view.index
  }, /*#__PURE__*/React.createElement(StoryWords, {
    chapter: chapter,
    on: i === view.index,
    caption: view.caption,
    onNavigate: onNavigate
  })))), /*#__PURE__*/React.createElement("div", {
    ref: railRef,
    className: "story-rail",
    "aria-hidden": "true"
  }, STORY_CHAPTERS.map(chapter => /*#__PURE__*/React.createElement("span", {
    key: chapter.id
  }, /*#__PURE__*/React.createElement("i", null)))));
};

// One static frame for the reduced-motion layout: a 16:9 canvas drawn once with local = 1, and its captions below.
const StoryFrame = ({
  chapter,
  onNavigate
}) => {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let alive = true;
    const paint = () => {
      const width = box.clientWidth;
      const height = box.clientHeight;
      if (!alive || !width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, STORY_MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      storyPaint(ctx, chapter.id, {
        local: 1,
        p: chapter.to,
        width,
        height,
        dpr,
        time: 0,
        reducedMotion: true
      });
    };
    const sizes = new ResizeObserver(paint);
    sizes.observe(box);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint);
    paint();
    return () => {
      alive = false;
      sizes.disconnect();
    };
  }, [chapter]);
  return /*#__PURE__*/React.createElement("div", {
    className: "story-frame",
    role: "group",
    "aria-label": chapter.title,
    "data-chapter": chapter.id
  }, /*#__PURE__*/React.createElement("div", {
    ref: boxRef,
    className: "story-frame__art"
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: "story-frame__words"
  }, /*#__PURE__*/React.createElement(StoryWords, {
    chapter: chapter,
    on: true,
    caption: null,
    onNavigate: onNavigate
  })));
};
const StoryStage = ({
  onNavigate
}) => {
  const sectionRef = useRef(null);
  const reduced = useStoryReducedMotion();
  return /*#__PURE__*/React.createElement("section", {
    ref: sectionRef,
    id: "story",
    "aria-label": SITE_STORY.label,
    className: reduced ? 'story story--static' : 'story story--pinned',
    style: reduced ? undefined : {
      '--story-screens': STORY_SCREENS
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "story-skip-wrap"
  }, /*#__PURE__*/React.createElement("a", {
    className: "story-skip",
    href: "#research",
    onClick: event => storyGo(event, 'research', onNavigate)
  }, "Skip to research")), reduced ? STORY_CHAPTERS.map(chapter => /*#__PURE__*/React.createElement(StoryFrame, {
    key: chapter.id,
    chapter: chapter,
    onNavigate: onNavigate
  })) : /*#__PURE__*/React.createElement(StoryPinned, {
    sectionRef: sectionRef,
    onNavigate: onNavigate
  }));
};
Object.assign(window, {
  StoryStage,
  STORY_RENDERERS
});

// File: StoryChapters.jsx
// StoryChapters.jsx — placeholder art for the six chapters of the story.
// Each placeholder fills the sky colour and writes the chapter title and the value of local in plain text.
// The final art replaces one entry at a time. The renderer API is at the top of StoryStage.jsx.

const storyPlaceholder = title => ({
  animated: false,
  draw(ctx, frame) {
    const size = Math.max(18, Math.min(frame.width, frame.height) * 0.06);
    const font = 'Literata, Georgia, serif';
    ctx.fillStyle = STORY_COLORS.sky;
    ctx.fillRect(0, 0, frame.width, frame.height);
    ctx.fillStyle = STORY_COLORS.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${size}px ${font}`;
    ctx.fillText(title, frame.width / 2, frame.height / 2 - size);
    ctx.font = `italic 400 ${size * 0.6}px ${font}`;
    ctx.fillText(`placeholder art, local ${frame.local.toFixed(2)}`, frame.width / 2, frame.height / 2 + size * 0.3);
  }
});
STORY_CHAPTERS.forEach(chapter => {
  STORY_RENDERERS[chapter.id] = storyPlaceholder(chapter.title);
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
const SITE_THEMES = [['VE models for depleted gas fields', 'Three-phase CO₂–methane–brine VE with a black-oil approximation, checked against compositional simulation and up to 100× faster.'], ['Storage screening under uncertainty', 'Ensembles of fast VE runs that test many scenarios and uncertain reservoir properties at field scale.'], ['Machine learning for upscaling and digital rock', 'CNNs that upscale permeability tensors and predict two-phase flow properties from micro-CT images.']];
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
  }), /*#__PURE__*/React.createElement(StoryStage, {
    onNavigate: navigate
  }), /*#__PURE__*/React.createElement(GeologicalDescent, null, /*#__PURE__*/React.createElement("main", {
    id: "main-content",
    tabIndex: -1
  }, /*#__PURE__*/React.createElement(ResearchSection, null), /*#__PURE__*/React.createElement(ProjectsSection, null), /*#__PURE__*/React.createElement(PublicationsSection, null), /*#__PURE__*/React.createElement(ContactSection, null)), /*#__PURE__*/React.createElement(Footer, {
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

