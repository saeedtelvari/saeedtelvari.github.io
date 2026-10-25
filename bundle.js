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

// File: ve2d-model.js
// ve2d-model.js — sharp-interface vertical-equilibrium (VE) model of CO2 storage in a
// confined saline aquifer. SI units internally; scenarios use display units
// (Mt, mD, m, km, degrees, years). Shared by the page, the worker and Node tests.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.VE2D = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const YEAR = 365.25 * 86400;
  const MT = 1e9;
  const MD = 9.869233e-16;
  const BAR = 1e5;
  const KM = 1000;
  const GRAVITY = 9.81;
  const LX = 20 * KM;
  const LY = 12 * KM;
  const GRIDS = {
    coarse: [40, 24],
    standard: [80, 48],
    fine: [120, 72]
  };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // [min, max, step] in display units. The UI and the normaliser share these bounds.
  const LIMITS = Object.freeze({
    years: [100, 2000, 50],
    seed: [1, 999999, 1],
    rateMt: [0.1, 5, 0.1],
    injYears: [1, 100, 1],
    wellX: [0.5, 19.5, 0.1],
    wellY: [0.5, 11.5, 0.1],
    permMd: [10, 5000, 1],
    porosity: [0.05, 0.35, 0.01],
    thickness: [10, 200, 1],
    thicknessVar: [0, 60, 1],
    ct: [0.2, 5, 0.1],
    rhoCo2: [400, 900, 10],
    rhoBrine: [1000, 1200, 5],
    muCo2: [0.02, 0.1, 0.005],
    muBrine: [0.3, 1.5, 0.05],
    swr: [0.05, 0.4, 0.01],
    sgr: [0, 0.4, 0.01],
    krg: [0.1, 1, 0.05],
    disRate: [0, 2, 0.05],
    disCap: [0, 80, 1],
    depth: [800, 3000, 50],
    dipDeg: [0, 3, 0.1],
    dipAz: [0, 359, 1],
    domes: [0, 4, 1],
    domeRelief: [0, 150, 5],
    roughness: [0, 40, 1]
  });
  const FAULT_LIMITS = Object.freeze({
    x: [0, 20, 0.1],
    y: [0, 12, 0.1],
    strike: [0, 359, 1],
    length: [0.5, 30, 0.5],
    throw: [0, 150, 1],
    trans: [0, 1, 0.05],
    sealCap: [0, 200, 1],
    kf: [0, 1000, 1]
  });
  // Optional inputs. They are not in LIMITS or DEFAULTS, so the simulator UI does not list,
  // encode or show them. dome replaces the main dome (x, y, along, across in km, angle in
  // degrees). gasContactDepth is the depth, in metres, of a flat gas-water contact at the
  // start. The gas above the contact is methane.
  const DOME_LIMITS = Object.freeze({
    x: [0, 20],
    y: [0, 12],
    along: [0.3, 10],
    across: [0.3, 10],
    angle: [0, 359]
  });
  const GAS_CONTACT_LIMITS = Object.freeze([0, 6000]);
  const INTEGER_KEYS = new Set(['years', 'seed', 'injYears', 'domes', 'dipAz']);
  const MAX_FAULTS = 3;
  const DEFAULT_FAULT = Object.freeze({
    x: 9.5,
    y: 6,
    strike: 12,
    length: 8,
    throw: 12,
    trans: 0.4,
    sealCap: 26,
    kf: 20
  });
  const DEFAULTS = Object.freeze({
    preset: 'dome-fault',
    grid: 'standard',
    boundary: 'open',
    years: 1000,
    seed: 1443,
    rateMt: 1,
    injYears: 30,
    wellX: 14,
    wellY: 6,
    permMd: 500,
    porosity: 0.2,
    thickness: 50,
    thicknessVar: 20,
    ct: 1,
    rhoCo2: 700,
    rhoBrine: 1050,
    muCo2: 0.055,
    muBrine: 0.6,
    swr: 0.27,
    sgr: 0.2,
    krg: 0.5,
    disRate: 0.2,
    disCap: 53,
    depth: 1500,
    dipDeg: 0.6,
    dipAz: 90,
    domes: 1,
    domeRelief: 60,
    roughness: 4,
    faults: Object.freeze([DEFAULT_FAULT])
  });
  const PRESETS = Object.freeze({
    'dome-fault': {
      label: 'Dome & leaky fault',
      description: 'CO₂ migrates up-dip past a partly sealing fault into a dome. Shows every trapping mechanism.',
      patch: {}
    },
    dipping: {
      label: 'Dipping aquifer',
      description: 'A plain 1° slope: the plume migrates up-dip, leaving a residual trail, and dissolves.',
      patch: {
        dipDeg: 1,
        domes: 0,
        roughness: 2,
        faults: []
      }
    },
    anticline: {
      label: 'Anticline trap',
      description: 'A large dome up-dip of the injector fills to its spill point and then spills.',
      patch: {
        dipDeg: 0.4,
        domes: 1,
        domeRelief: 40,
        roughness: 2,
        faults: []
      }
    },
    'sealed-block': {
      label: 'Sealed fault block',
      description: 'Two sealing faults and closed boundaries: CO₂ is contained, pressure builds up.',
      patch: {
        boundary: 'closed',
        dipDeg: 0.4,
        domes: 0,
        roughness: 3,
        injYears: 20,
        faults: [{
          x: 8,
          y: 6,
          strike: 5,
          length: 14,
          throw: 40,
          trans: 0,
          sealCap: 200,
          kf: 0
        }, {
          x: 16.5,
          y: 6,
          strike: 170,
          length: 14,
          throw: 30,
          trans: 0,
          sealCap: 200,
          kf: 0
        }]
      }
    },
    rough: {
      label: 'Rough top surface',
      description: 'Small undulations in the caprock create many small structural traps.',
      patch: {
        dipDeg: 0.5,
        domes: 0,
        roughness: 10,
        faults: []
      }
    }
  });
  const normalizeFault = raw => {
    const fault = {};
    for (const [key, [min, max]] of Object.entries(FAULT_LIMITS)) {
      const value = Number(raw?.[key]);
      fault[key] = Number.isFinite(value) ? clamp(value, min, max) : DEFAULT_FAULT[key];
    }
    return fault;
  };

  // A dome needs all five numbers. Any other input gives no dome, so the seed places it.
  const normalizeDome = raw => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const dome = {};
    for (const [key, [min, max]] of Object.entries(DOME_LIMITS)) {
      const value = Number(raw[key]);
      if (!Number.isFinite(value) || raw[key] === '' || raw[key] === null) return null;
      dome[key] = clamp(value, min, max);
    }
    return dome;
  };
  const normalizeScenario = (raw = {}) => {
    const scenario = {
      preset: typeof raw.preset === 'string' ? raw.preset : DEFAULTS.preset,
      grid: Object.prototype.hasOwnProperty.call(GRIDS, raw.grid) ? raw.grid : DEFAULTS.grid,
      boundary: raw.boundary === 'closed' || raw.boundary === 'open' ? raw.boundary : DEFAULTS.boundary
    };
    for (const [key, [min, max]] of Object.entries(LIMITS)) {
      const value = Number(raw[key]);
      const bounded = Number.isFinite(value) && raw[key] !== '' && raw[key] !== null ? clamp(value, min, max) : DEFAULTS[key];
      // The simulated period snaps to its step so every run ends on a snapshot year.
      scenario[key] = key === 'years' ? Math.round(bounded / 50) * 50 : INTEGER_KEYS.has(key) ? Math.round(bounded) : bounded;
    }
    const faults = Array.isArray(raw.faults) ? raw.faults : DEFAULTS.faults;
    scenario.faults = faults.slice(0, MAX_FAULTS).map(normalizeFault);
    const dome = normalizeDome(raw.dome);
    if (dome) scenario.dome = dome;
    const contact = Number(raw.gasContactDepth);
    scenario.gasContactDepth = Number.isFinite(contact) && raw.gasContactDepth !== '' && raw.gasContactDepth !== null ? clamp(contact, GAS_CONTACT_LIMITS[0], GAS_CONTACT_LIMITS[1]) : null;
    return scenario;
  };

  // ------------------------------------------------------------------ geometry

  const hashNoise = (x, y, seed) => {
    const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
    return value - Math.floor(value);
  };

  // Map angle (from +x, anticlockwise) of the regional strike, at right angles to the dip
  // direction. Domes and caprock undulations are elongated along it.
  const strikeAngle = scenario => Math.PI - scenario.dipAz * Math.PI / 180;

  // Gaussian domes elongated along strike (±15°). The first is the main closure; any others
  // are smaller satellites. An explicit scenario.dome (km and degrees) replaces the main one.
  const domeCentres = scenario => Array.from({
    length: scenario.domes
  }, (_, index) => {
    if (index === 0 && scenario.dome) {
      const {
        x,
        y,
        along,
        across,
        angle
      } = scenario.dome;
      return {
        x: x * KM,
        y: y * KM,
        angle: angle * Math.PI / 180,
        along: along * KM,
        across: across * KM,
        relief: 1
      };
    }
    const hash = (a, b, salt) => hashNoise(index * a, b, scenario.seed + salt);
    const main = index === 0;
    return {
      x: (0.12 + 0.76 * hash(2.1, 0.4, 503)) * LX,
      y: (0.15 + 0.7 * hash(2.9, 0.8, 547)) * LY,
      angle: strikeAngle(scenario) + (hash(3.7, 1.2, 571) - 0.5) * Math.PI / 6,
      along: 2400 * (main ? 0.85 + 0.45 * hash(4.3, 1.6, 593) : 0.55 + 0.35 * hash(4.3, 1.6, 593)),
      across: 1600 * (main ? 0.7 + 0.3 * hash(5.1, 2.0, 613) : 0.45 + 0.2 * hash(5.1, 2.0, 613)),
      relief: main ? 1 : 0.35 + 0.45 * hash(5.9, 2.4, 631)
    };
  });

  // Smooth Gaussian random fields with a self-affine spectrum, stretched along strike: a
  // sum of random Fourier modes, one per equal step in log wavenumber (amplitude k^-H),
  // scaled to unit variance.
  const spectralModes = (seed, spec, angle) => {
    const rng = mulberry32(seed);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const modes = new Float64Array(4 * spec.modes);
    let variance = 0;
    for (let m = 0; m < spec.modes; m++) {
      const k = 2 * Math.PI / (spec.longest * (spec.shortest / spec.longest) ** ((m + rng()) / spec.modes));
      const direction = 2 * Math.PI * rng();
      const along = k * Math.cos(direction) / spec.stretch;
      const across = k * Math.sin(direction);
      modes.set([along * cos - across * sin, along * sin + across * cos, 2 * Math.PI * rng(), k ** -spec.hurst], 4 * m);
      variance += k ** (-2 * spec.hurst) / 2;
    }
    for (let m = 3; m < modes.length; m += 4) modes[m] /= Math.sqrt(variance);
    return modes;
  };

  // Caprock roughness (Hurst exponent 0.8, wavelengths 8 km to 500 m, stretched 2.5 times
  // along strike); the roughness input is its RMS height in metres.
  const ROUGH = Object.freeze({
    modes: 48,
    longest: 8000,
    shortest: 500,
    hurst: 0.8,
    stretch: 2.5
  });
  const roughModes = scenario => spectralModes(scenario.seed + 7919, ROUGH, strikeAngle(scenario));

  // Aquifer thickness: the mean times a log-normal factor exp(sG - s^2/2) of a smoother
  // field (Hurst 0.9, wavelengths 12 km to 1.5 km, sand belts stretched twice along
  // strike), so the mean is kept, thickness stays positive and s is about its spread.
  const THICK = Object.freeze({
    modes: 32,
    longest: 12000,
    shortest: 1500,
    hurst: 0.9,
    stretch: 2
  });
  const thickModes = scenario => spectralModes(scenario.seed + 104729, THICK, strikeAngle(scenario));
  const roughnessAt = (modes, x, y) => {
    let value = 0;
    for (let m = 0; m < modes.length; m += 4) value += modes[m + 3] * Math.cos(modes[m] * x + modes[m + 1] * y + modes[m + 2]);
    return value;
  };
  const faultFrame = fault => {
    const strike = fault.strike * Math.PI / 180;
    const along = [Math.sin(strike), Math.cos(strike)];
    return {
      cx: fault.x * KM,
      cy: fault.y * KM,
      half: fault.length * KM / 2,
      along,
      normal: [along[1], -along[0]]
    };
  };

  // Normal-fault displacement. The throw is parabolic along strike (zero at the tips). The
  // hanging wall, to the right of the strike direction (right-hand rule), drops by 70 % of
  // it and the footwall rises by 30 %; both decay away from the fault over a fifth of its
  // length, so each footwall crest is a closure against its fault.
  const FOOTWALL_SHARE = 0.3;
  const faultThrowAt = (fault, frame, x, y) => {
    const dx = x - frame.cx;
    const dy = y - frame.cy;
    const t = (dx * frame.along[0] + dy * frame.along[1]) / frame.half;
    if (Math.abs(t) >= 1) return 0;
    return fault.throw * (1 - t * t);
  };
  const faultOffset = (fault, frame, x, y) => {
    const side = (x - frame.cx) * frame.normal[0] + (y - frame.cy) * frame.normal[1];
    const offset = faultThrowAt(fault, frame, x, y) * Math.exp(-Math.abs(side) / (0.4 * frame.half));
    return side > 0 ? (1 - FOOTWALL_SHARE) * offset : -FOOTWALL_SHARE * offset;
  };
  const topDepth = (x, y, scenario, cache) => {
    const azimuth = scenario.dipAz * Math.PI / 180;
    const slope = Math.tan(scenario.dipDeg * Math.PI / 180);
    let depth = scenario.depth + slope * ((x - LX / 2) * Math.sin(azimuth) + (y - LY / 2) * Math.cos(azimuth));
    const domes = cache?.domes || domeCentres(scenario);
    for (const dome of domes) {
      const dx = x - dome.x;
      const dy = y - dome.y;
      const along = dx * Math.cos(dome.angle) + dy * Math.sin(dome.angle);
      const across = -dx * Math.sin(dome.angle) + dy * Math.cos(dome.angle);
      depth -= scenario.domeRelief * dome.relief * Math.exp(-0.5 * ((along / dome.along) ** 2 + (across / dome.across) ** 2));
    }
    if (scenario.roughness > 0) depth += scenario.roughness * roughnessAt(cache?.rough || roughModes(scenario), x, y);
    const frames = cache?.frames || scenario.faults.map(faultFrame);
    scenario.faults.forEach((fault, index) => {
      depth += faultOffset(fault, frames[index], x, y);
    });
    return depth;
  };
  const thicknessAt = (x, y, scenario, cache) => {
    const spread = scenario.thicknessVar / 100;
    if (!(spread > 0)) return scenario.thickness;
    return scenario.thickness * Math.exp(spread * roughnessAt(cache?.thick || thickModes(scenario), x, y) - spread * spread / 2);
  };
  const depthCache = scenario => ({
    domes: domeCentres(scenario),
    frames: scenario.faults.map(faultFrame),
    rough: roughModes(scenario),
    thick: thickModes(scenario)
  });

  // The top-surface depth of one (normalised) scenario as a function of x and y in metres,
  // with its domes, fault frames and roughness modes computed once.
  const depthField = scenario => {
    const cache = depthCache(scenario);
    return (x, y) => topDepth(x, y, scenario, cache);
  };

  // The aquifer thickness of one (normalised) scenario as a function of x and y in metres.
  const thicknessField = scenario => {
    const cache = depthCache(scenario);
    return (x, y) => thicknessAt(x, y, scenario, cache);
  };

  // Segment p–q against the fault trace; returns the along-strike parameter t in [-1, 1] or null.
  const traceCrossing = (frame, px, py, qx, qy) => {
    const ax = frame.cx - frame.along[0] * frame.half;
    const ay = frame.cy - frame.along[1] * frame.half;
    const bx = frame.cx + frame.along[0] * frame.half;
    const by = frame.cy + frame.along[1] * frame.half;
    const rx = qx - px;
    const ry = qy - py;
    const sx = bx - ax;
    const sy = by - ay;
    const denominator = rx * sy - ry * sx;
    if (Math.abs(denominator) < 1e-12) return null;
    const u = ((ax - px) * sy - (ay - py) * sx) / denominator;
    const v = ((ax - px) * ry - (ay - py) * rx) / denominator;
    if (u < 0 || u > 1 || v < 0 || v > 1) return null;
    return 2 * v - 1;
  };
  const buildModel = rawScenario => {
    const scenario = normalizeScenario(rawScenario);
    const [nx, ny] = GRIDS[scenario.grid];
    const n = nx * ny;
    const dx = LX / nx;
    const dy = LY / ny;
    const H = scenario.thickness;
    const p = {
      k: scenario.permMd * MD,
      phi: scenario.porosity,
      H,
      rhoG: scenario.rhoCo2,
      rhoW: scenario.rhoBrine,
      dRho: scenario.rhoBrine - scenario.rhoCo2,
      g: GRAVITY,
      muG: scenario.muCo2 * 1e-3,
      muW: scenario.muBrine * 1e-3,
      swr: scenario.swr,
      sgr: Math.min(scenario.sgr, 0.95 - scenario.swr),
      krg: scenario.krg,
      ct: scenario.ct * 1e-4 / BAR,
      rate: scenario.rateMt * MT / YEAR,
      injEnd: scenario.injYears * YEAR,
      tEnd: scenario.years * YEAR,
      disRate: scenario.disRate / YEAR,
      disCap: scenario.disCap,
      open: scenario.boundary === 'open'
    };
    const cache = depthCache(scenario);
    const depthAt = (x, y) => topDepth(x, y, scenario, cache);
    const xc = Float64Array.from({
      length: nx
    }, (_, i) => (i + 0.5) * dx);
    const yc = Float64Array.from({
      length: ny
    }, (_, j) => (j + 0.5) * dy);
    const zt = new Float64Array(n);
    const Hc = new Float64Array(n);
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        zt[j * nx + i] = depthAt(xc[i], yc[j]);
        Hc[j * nx + i] = thicknessAt(xc[i], yc[j], scenario, cache);
      }
    }

    // Face multiplier: cross-fault transmissibility times the juxtaposed fraction of the
    // aquifer thickness at the face.
    const multiplier = (px, py, qx, qy) => {
      let value = 1;
      scenario.faults.forEach((fault, index) => {
        const t = traceCrossing(cache.frames[index], px, py, qx, qy);
        if (t === null) return;
        const localThrow = fault.throw * (1 - t * t);
        value = Math.min(value, fault.trans * Math.max(0, 1 - localThrow / thicknessAt((px + qx) / 2, (py + qy) / 2, scenario, cache)));
      });
      return value;
    };
    const tx = new Float64Array((nx + 1) * ny);
    const mx = new Float64Array((nx + 1) * ny);
    const ghostX = new Float64Array((nx + 1) * ny).fill(NaN);
    for (let j = 0; j < ny; j++) {
      for (let f = 0; f <= nx; f++) {
        const index = j * (nx + 1) + f;
        const boundary = f === 0 || f === nx;
        tx[index] = p.k * dy / (boundary ? dx / 2 : dx);
        mx[index] = boundary ? multiplier(f === 0 ? xc[0] : xc[nx - 1], yc[j], f * dx, yc[j]) : multiplier(xc[f - 1], yc[j], xc[f], yc[j]);
        if (boundary) ghostX[index] = depthAt(f * dx, yc[j]);
      }
    }
    const ty = new Float64Array(nx * (ny + 1));
    const my = new Float64Array(nx * (ny + 1));
    const ghostY = new Float64Array(nx * (ny + 1)).fill(NaN);
    for (let f = 0; f <= ny; f++) {
      for (let i = 0; i < nx; i++) {
        const index = f * nx + i;
        const boundary = f === 0 || f === ny;
        ty[index] = p.k * dx / (boundary ? dy / 2 : dy);
        my[index] = boundary ? multiplier(xc[i], f === 0 ? yc[0] : yc[ny - 1], xc[i], f * dy) : multiplier(xc[i], yc[f - 1], xc[i], yc[f]);
        if (boundary) ghostY[index] = depthAt(xc[i], f * dy);
      }
    }

    // Fault-zone leakage: trace length inside each cell, so the leak rate per metre of
    // fault does not depend on the grid.
    const leakCells = [];
    const faultLines = [];
    scenario.faults.forEach((fault, faultIndex) => {
      const frame = cache.frames[faultIndex];
      const x0 = frame.cx - frame.along[0] * frame.half;
      const y0 = frame.cy - frame.along[1] * frame.half;
      const x1 = frame.cx + frame.along[0] * frame.half;
      const y1 = frame.cy + frame.along[1] * frame.half;
      faultLines.push([x0, y0, x1, y1]);
      if (!(fault.kf > 0)) return;
      const samples = Math.max(1, Math.ceil(fault.length * KM / (Math.min(dx, dy) / 20)));
      const ds = fault.length * KM / samples;
      const lengths = new Map();
      for (let s = 0; s < samples; s++) {
        const w = (s + 0.5) / samples;
        const x = x0 + (x1 - x0) * w;
        const y = y0 + (y1 - y0) * w;
        if (x < 0 || x >= LX || y < 0 || y >= LY) continue;
        const cell = Math.floor(y / dy) * nx + Math.floor(x / dx);
        lengths.set(cell, (lengths.get(cell) || 0) + ds);
      }
      for (const [cell, length] of lengths) leakCells.push({
        cell,
        length,
        fault: faultIndex
      });
    });
    const well = clamp(Math.floor(scenario.wellY * KM / dy), 0, ny - 1) * nx + clamp(Math.floor(scenario.wellX * KM / dx), 0, nx - 1);
    const model = {
      scenario,
      nx,
      ny,
      n,
      dx,
      dy,
      Lx: LX,
      Ly: LY,
      area: dx * dy,
      H,
      Hc,
      p,
      xc,
      yc,
      zt,
      tx,
      ty,
      mx,
      my,
      ghostX,
      ghostY,
      leakCells,
      faultLines,
      well,
      depthAt,
      domes: cache.domes
    };
    model.traps = trapAnalysis(model);
    return model;
  };

  // Binary min-heap of (key, cell) pairs for the priority flood.
  const createHeap = capacity => {
    let size = 0;
    const keys = new Float64Array(capacity);
    const cells = new Int32Array(capacity);
    return {
      get size() {
        return size;
      },
      push(key, cell) {
        let i = size++;
        while (i > 0) {
          const parent = i - 1 >> 1;
          if (keys[parent] <= key) break;
          keys[i] = keys[parent];
          cells[i] = cells[parent];
          i = parent;
        }
        keys[i] = key;
        cells[i] = cell;
      },
      pop() {
        const top = cells[0];
        const key = keys[--size];
        const cell = cells[size];
        let i = 0;
        for (;;) {
          let child = 2 * i + 1;
          if (child >= size) break;
          if (child + 1 < size && keys[child + 1] < keys[child]) child++;
          if (keys[child] >= key) break;
          keys[i] = keys[child];
          cells[i] = cells[child];
          i = child;
        }
        keys[i] = key;
        cells[i] = cell;
        return top;
      }
    };
  };

  // Visit the four face neighbours of a cell that are connected through a passable face.
  const forEachNeighbour = (model, cell, visit) => {
    const {
      nx,
      ny,
      mx,
      my
    } = model;
    const i = cell % nx;
    const j = (cell - i) / nx;
    if (i > 0 && mx[j * (nx + 1) + i] > 0) visit(cell - 1);
    if (i < nx - 1 && mx[j * (nx + 1) + i + 1] > 0) visit(cell + 1);
    if (j > 0 && my[j * nx + i] > 0) visit(cell - nx);
    if (j < ny - 1 && my[(j + 1) * nx + i] > 0) visit(cell + nx);
  };
  const TRAP_COLUMN = 1e-3;

  // Spill-point analysis (priority flood, Barnes et al. 2014) on the caprock depth: CO2
  // rises to shallower depth, so domes are "pits" of depth. As in co2lab, the model edge
  // is always a spill path; compartments sealed off from the edge never spill.
  const trapAnalysis = model => {
    const {
      nx,
      ny,
      n,
      zt
    } = model;
    const zSpill = new Float64Array(n).fill(Infinity);
    const from = new Int32Array(n).fill(-1);
    const done = new Uint8Array(n);
    const heap = createHeap(5 * n + 8);
    for (let c = 0; c < n; c++) {
      const i = c % nx;
      const j = (c - i) / nx;
      if (i === 0 || j === 0 || i === nx - 1 || j === ny - 1) {
        zSpill[c] = zt[c];
        heap.push(zt[c], c);
      }
    }
    while (heap.size) {
      const c = heap.pop();
      if (done[c]) continue;
      done[c] = 1;
      forEachNeighbour(model, c, nb => {
        if (done[nb]) return;
        const level = Math.max(zt[nb], zSpill[c]);
        if (level < zSpill[nb]) {
          zSpill[nb] = level;
          from[nb] = c;
          heap.push(level, nb);
        }
      });
    }
    const trapId = new Int32Array(n).fill(-1);
    const traps = [];
    const capacityFactor = model.p.phi * (1 - model.p.swr) * model.area;
    for (let seed = 0; seed < n; seed++) {
      if (trapId[seed] !== -1 || !(zSpill[seed] - zt[seed] > TRAP_COLUMN)) continue;
      const id = traps.length;
      const cells = [];
      trapId[seed] = id;
      for (let q = [seed]; q.length;) {
        const c = q.pop();
        cells.push(c);
        forEachNeighbour(model, c, nb => {
          if (trapId[nb] === -1 && zSpill[nb] - zt[nb] > TRAP_COLUMN) {
            trapId[nb] = id;
            q.push(nb);
          }
        });
      }
      let crestCell = cells[0];
      let spillCell = -1;
      let capacity = 0;
      for (const c of cells) {
        if (zt[c] < zt[crestCell]) crestCell = c;
        if (spillCell === -1 && from[c] !== -1 && trapId[from[c]] !== id) spillCell = from[c];
        capacity += Math.min(model.Hc[c], zSpill[c] - zt[c]) * capacityFactor;
      }
      traps.push({
        id,
        cells: Int32Array.from(cells),
        crestCell,
        spillCell,
        spillDepth: zSpill[crestCell],
        capacity
      });
    }
    return {
      zSpill,
      trapId,
      traps
    };
  };

  // Marching squares on cell-centre values. Segments are [x0, y0, x1, y1, ...] in
  // cell-index coordinates (cell (i, j) centre at x = i, y = j).
  const contourSegments = (values, nx, ny, level) => {
    const out = [];
    const t = (v0, v1) => (level - v0) / (v1 - v0);
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const a = values[j * nx + i];
        const b = values[j * nx + i + 1];
        const c = values[(j + 1) * nx + i + 1];
        const d = values[(j + 1) * nx + i];
        if (!(Number.isFinite(a) && Number.isFinite(b) && Number.isFinite(c) && Number.isFinite(d))) continue;
        const code = (a > level ? 1 : 0) | (b > level ? 2 : 0) | (c > level ? 4 : 0) | (d > level ? 8 : 0);
        if (code === 0 || code === 15) continue;
        const bottom = () => [i + t(a, b), j];
        const right = () => [i + 1, j + t(b, c)];
        const top = () => [i + t(d, c), j + 1];
        const left = () => [i, j + t(a, d)];
        const segment = (p, q) => out.push(p[0], p[1], q[0], q[1]);
        const centreAbove = (a + b + c + d) / 4 > level;
        switch (code) {
          case 1:
          case 14:
            segment(left(), bottom());
            break;
          case 2:
          case 13:
            segment(bottom(), right());
            break;
          case 3:
          case 12:
            segment(left(), right());
            break;
          case 4:
          case 11:
            segment(right(), top());
            break;
          case 6:
          case 9:
            segment(bottom(), top());
            break;
          case 7:
          case 8:
            segment(left(), top());
            break;
          case 5:
            if (centreAbove) {
              segment(bottom(), right());
              segment(left(), top());
            } else {
              segment(left(), bottom());
              segment(right(), top());
            }
            break;
          case 10:
            if (centreAbove) {
              segment(left(), bottom());
              segment(right(), top());
            } else {
              segment(bottom(), right());
              segment(left(), top());
            }
            break;
        }
      }
    }
    return Float64Array.from(out);
  };

  // ------------------------------------------------------------------ dynamics

  const CFL = 0.4;
  // Films thinner than a micrometre do not move: their mass stays where it is (so the
  // balance is still exact) and they no longer throttle the time step everywhere.
  const H_EPS = 1e-6;

  // The start state is brine, plus a methane gas cap when the scenario sets gasContactDepth.
  // A column above the contact holds gas from its top down to the contact, or down to the
  // aquifer base. It has no residual gas. Methane is the same light phase as CO2, so it
  // has the same stored volume s. The array ch4 holds the methane part of s.
  const createState = model => {
    const {
      n,
      nx,
      ny,
      p,
      zt,
      Hc
    } = model;
    const h = new Float64Array(n);
    const hMax = new Float64Array(n);
    const s = new Float64Array(n);
    const ch4 = new Float64Array(n);
    const contact = model.scenario.gasContactDepth;
    let hasMethane = false;
    if (contact !== null) {
      const drain = p.phi * (1 - p.swr);
      for (let c = 0; c < n; c++) {
        if (!(zt[c] < contact)) continue;
        h[c] = hMax[c] = Math.min(contact - zt[c], Hc[c]);
        s[c] = ch4[c] = drain * h[c];
        hasMethane = true;
      }
    }
    return {
      t: 0,
      steps: 0,
      h,
      hMax,
      s,
      ch4,
      md: new Float64Array(n),
      p: new Float64Array(n),
      ux: new Float64Array((nx + 1) * ny),
      uy: new Float64Array(nx * (ny + 1)),
      fx: new Float64Array((nx + 1) * ny),
      fy: new Float64Array(nx * (ny + 1)),
      net: new Float64Array(n),
      rate: new Float64Array(n),
      leaking: new Uint8Array(model.scenario.faults.length),
      // The injected, exited, leaked and dissolved totals count CO2 only (kg). The methane
      // totals are kept apart. The tracer runs only while hasMethane is true.
      injected: 0,
      exited: 0,
      leaked: 0,
      dissolved: 0,
      methaneExited: 0,
      methaneLeaked: 0,
      methaneDissolved: 0,
      hasMethane,
      frac: new Float64Array(n),
      dMethane: new Float64Array(n),
      pressureActive: true
    };
  };

  // The CO2 part of the gas in column c (1 where the column holds no methane).
  const co2Share = (state, c) => state.ch4[c] > 0 && state.s[c] > 0 ? 1 - state.ch4[c] / state.s[c] : 1;

  // CO2 volume per area s = phi[(1 - Swr) h + Sgr (hMax - h)] -> (h, hMax).
  const invertColumn = (p, state, c) => {
    const s = state.s[c];
    const drain = p.phi * (1 - p.swr);
    const residual = p.phi * p.sgr;
    const hMax = state.hMax[c];
    if (s >= drain * hMax) {
      state.h[c] = state.hMax[c] = s / drain;
    } else if (s >= residual * hMax) {
      state.h[c] = (s - residual * hMax) / (drain - residual);
    } else {
      state.h[c] = 0;
      state.hMax[c] = residual > 0 ? s / residual : 0;
    }
  };

  // Gas volume flux across one face (positive from side A to side B) with hybrid
  // upwinding: the viscous part follows the total flux, buoyancy follows the phase
  // potentials (gas from the deeper interface, brine the other way).
  const faceFlux = (k, T, U, zetaA, zetaB, hA, hB, HA, HB, scratch) => {
    if (hA <= H_EPS && hB <= H_EPS) {
      scratch.bound = 0;
      return 0;
    }
    const a = k.a;
    const b = k.b;
    const dz = zetaA - zetaB;
    let mob = 0;
    let gravity = 0;
    if (dz !== 0 && T > 0) {
      const gas = dz > 0 ? a * Math.min(hA, HA) : a * Math.min(hB, HB);
      const brine = dz > 0 ? b * Math.max(0, HB - hB) : b * Math.max(0, HA - hA);
      mob = gas + brine > 0 ? gas * brine / (gas + brine) : 0;
      gravity = T * k.tg * dz * mob;
    }
    let viscous = 0;
    let slope = 0;
    if (U !== 0) {
      const Hu = U > 0 ? HA : HB;
      const hu = Math.min(U > 0 ? hA : hB, Hu);
      const gas = a * hu;
      const brine = b * (Hu - hu);
      const total = gas + brine;
      if (total > 0) {
        viscous = U * gas / total;
        // df/dh at the upstream column: the local characteristic speed.
        slope = a * b * Hu / (total * total);
      }
    }
    scratch.bound = T * k.tg * (mob + Math.abs(dz) * (a + b)) + Math.abs(U) * slope;
    return viscous + gravity;
  };
  const FAULT_ZONE_WIDTH = 5;
  const CAPROCK_THICKNESS = 100;

  // Operator-split sinks after each transport step: vertical leakage up leaky fault zones
  // (only above the seal capacity, never draining a column below it) and convective
  // dissolution into the brine column until it is saturated. Each sink removes methane and
  // CO2 in proportion to the methane share of the column. The dissolved mass per area md
  // counts both gases, because they share the brine capacity.
  const applySinks = (model, state, dt) => {
    const {
      p,
      area,
      Hc
    } = model;
    const {
      h,
      s,
      ch4,
      md
    } = state;
    const tracer = state.hasMethane;
    const imbibe = p.phi * Math.max(1e-3, 1 - p.swr - p.sgr);
    state.leaking.fill(0);
    for (const {
      cell,
      length,
      fault
    } of model.leakCells) {
      const {
        sealCap,
        kf
      } = model.scenario.faults[fault];
      const excess = Math.min(h[cell], Hc[cell]) - sealCap;
      if (!(excess > 0)) continue;
      const rate = length * FAULT_ZONE_WIDTH * kf * MD * (p.krg / p.muG) * p.dRho * p.g * (excess / CAPROCK_THICKNESS + 1);
      const volume = Math.min(rate * dt, excess * imbibe * area);
      if (!(volume > 0)) continue;
      const share = tracer ? 1 - co2Share(state, cell) : 0;
      s[cell] -= volume / area;
      state.leaked += volume * (1 - share) * p.rhoG;
      if (share > 0) {
        state.methaneLeaked += volume * share * p.rhoG;
        ch4[cell] = clamp(ch4[cell] - volume * share / area, 0, s[cell]);
      }
      state.leaking[fault] = 1;
      invertColumn(p, state, cell);
    }
    if (p.disRate > 0 && p.disCap > 0) {
      for (let c = 0; c < model.n; c++) {
        const capacity = p.disCap * p.phi * Hc[c];
        if (s[c] <= 0 || md[c] >= capacity) continue;
        const mass = Math.min(p.disRate * dt, capacity - md[c], p.rhoG * s[c]);
        if (!(mass > 0)) continue;
        const share = tracer ? 1 - co2Share(state, c) : 0;
        md[c] += mass;
        s[c] = Math.max(0, s[c] - mass / p.rhoG);
        state.dissolved += mass * (1 - share) * area;
        if (share > 0) {
          state.methaneDissolved += mass * share * area;
          ch4[c] = clamp(ch4[c] - mass * share / p.rhoG, 0, s[c]);
        }
        invertColumn(p, state, c);
      }
    }
  };

  // Methane share of the gas in each column, taken before a transport step.
  const methaneFractions = state => {
    const {
      s,
      ch4,
      frac
    } = state;
    for (let c = 0; c < s.length; c++) frac[c] = s[c] > 0 ? Math.min(1, ch4[c] / s[c]) : 0;
  };

  // Move the methane tracer with the gas face fluxes of the step. A face carries the methane
  // share of its upwind column (from methaneFractions), so the tracer does not change the
  // flow. Injection adds CO2 only. Call this after s is updated: it keeps 0 <= ch4 <= s.
  // It returns the methane volume rate that leaves through the open boundaries.
  const moveMethane = (model, state, dt) => {
    const {
      nx,
      ny,
      n,
      area
    } = model;
    const {
      s,
      ch4,
      fx,
      fy,
      frac,
      dMethane
    } = state;
    let outflow = 0;
    dMethane.fill(0);
    for (let j = 0; j < ny; j++) {
      for (let f = 0; f <= nx; f++) {
        const index = j * (nx + 1) + f;
        const flux = fx[index];
        if (flux === 0) continue;
        if (f === 0 || f === nx) {
          // Boundary faces let gas out only. The stored flux is negative at the west edge.
          const c = j * nx + (f === 0 ? 0 : nx - 1);
          const methane = (f === 0 ? -flux : flux) * frac[c];
          dMethane[c] -= methane;
          outflow += methane;
          continue;
        }
        const L = j * nx + f - 1;
        const methane = flux * (flux > 0 ? frac[L] : frac[L + 1]);
        dMethane[L] -= methane;
        dMethane[L + 1] += methane;
      }
    }
    for (let f = 0; f <= ny; f++) {
      for (let i = 0; i < nx; i++) {
        const index = f * nx + i;
        const flux = fy[index];
        if (flux === 0) continue;
        if (f === 0 || f === ny) {
          const c = (f === 0 ? 0 : ny - 1) * nx + i;
          const methane = (f === 0 ? -flux : flux) * frac[c];
          dMethane[c] -= methane;
          outflow += methane;
          continue;
        }
        const S = (f - 1) * nx + i;
        const methane = flux * (flux > 0 ? frac[S] : frac[S + nx]);
        dMethane[S] -= methane;
        dMethane[S + nx] += methane;
      }
    }
    for (let c = 0; c < n; c++) {
      if (dMethane[c] !== 0) ch4[c] += dt * dMethane[c] / area;
      if (ch4[c] < 0) ch4[c] = 0;else if (ch4[c] > s[c]) ch4[c] = s[c];
    }
    return outflow;
  };
  const stepTransport = (model, state, dtMax) => {
    const {
      nx,
      ny,
      n,
      p,
      tx,
      ty,
      mx,
      my,
      zt,
      ghostX,
      ghostY,
      area,
      Hc
    } = model;
    const {
      h,
      s,
      ux,
      uy,
      fx,
      fy,
      net,
      rate
    } = state;
    const a = p.krg / p.muG;
    const b = 1 / p.muW;
    const k = {
      a,
      b,
      tg: p.dRho * p.g
    };
    const scratch = {
      bound: 0
    };
    net.fill(0);
    rate.fill(0);
    // Boundary faces use phase-potential upwinding: the hydrostatic ghost holds no gas,
    // so CO2 leaves only where its own potential drops outward.
    const boundaryFlux = (T, c, ghostDepth) => {
      if (h[c] <= H_EPS) {
        scratch.bound = 0;
        return 0;
      }
      const hc = Math.min(h[c], Hc[c]);
      const drop = state.p[c] + k.tg * (zt[c] + h[c] - ghostDepth);
      scratch.bound = T * a * (Math.abs(drop) + k.tg * hc);
      return drop > 0 ? T * a * hc * drop : 0;
    };
    for (let j = 0; j < ny; j++) {
      for (let f = 0; f <= nx; f++) {
        const index = j * (nx + 1) + f;
        const T = tx[index] * mx[index];
        if (f === 0 || f === nx) {
          if (!p.open || T === 0) {
            fx[index] = 0;
            continue;
          }
          const c = j * nx + (f === 0 ? 0 : nx - 1);
          const flux = boundaryFlux(T, c, ghostX[index]);
          fx[index] = f === 0 ? -flux : flux;
          net[c] -= flux;
          rate[c] += scratch.bound;
          continue;
        }
        const L = j * nx + f - 1;
        const R = L + 1;
        if (T === 0) {
          fx[index] = 0;
          continue;
        }
        const flux = faceFlux(k, T, ux[index], zt[L] + h[L], zt[R] + h[R], h[L], h[R], Hc[L], Hc[R], scratch);
        fx[index] = flux;
        net[L] -= flux;
        net[R] += flux;
        rate[L] += scratch.bound;
        rate[R] += scratch.bound;
      }
    }
    for (let f = 0; f <= ny; f++) {
      for (let i = 0; i < nx; i++) {
        const index = f * nx + i;
        const T = ty[index] * my[index];
        if (f === 0 || f === ny) {
          if (!p.open || T === 0) {
            fy[index] = 0;
            continue;
          }
          const c = (f === 0 ? 0 : ny - 1) * nx + i;
          const flux = boundaryFlux(T, c, ghostY[index]);
          fy[index] = f === 0 ? -flux : flux;
          net[c] -= flux;
          rate[c] += scratch.bound;
          continue;
        }
        const S = (f - 1) * nx + i;
        const N = S + nx;
        if (T === 0) {
          fy[index] = 0;
          continue;
        }
        const flux = faceFlux(k, T, uy[index], zt[S] + h[S], zt[N] + h[N], h[S], h[N], Hc[S], Hc[N], scratch);
        fy[index] = flux;
        net[S] -= flux;
        net[N] += flux;
        rate[S] += scratch.bound;
        rate[N] += scratch.bound;
      }
    }
    const injecting = state.t < p.injEnd && p.rate > 0;
    const volumeRate = injecting ? p.rate / p.rhoG : 0;
    net[model.well] += volumeRate;

    // Explicit stability: the smallest storage coefficient (imbibition) bounds the step,
    // and one step may fill at most a quarter of the injector cell's pore volume.
    const storage = p.phi * Math.max(1e-3, 1 - p.swr - p.sgr) * area;
    let dt = volumeRate > 0 ? Math.min(dtMax, 0.25 * p.phi * (1 - p.swr) * Hc[model.well] * area / volumeRate) : dtMax;
    for (let c = 0; c < n; c++) if (rate[c] > 0) dt = Math.min(dt, CFL * storage / rate[c]);
    // Never let a column go negative: shrink the step instead of clipping mass.
    for (let c = 0; c < n; c++) {
      if (net[c] < 0 && s[c] + dt * net[c] / area < 0) dt = Math.min(dt, 0.999 * s[c] * area / -net[c]);
    }
    const tracer = state.hasMethane;
    if (tracer) methaneFractions(state);
    for (let c = 0; c < n; c++) {
      if (net[c] === 0) continue;
      s[c] += dt * net[c] / area;
      if (s[c] < 0) s[c] = 0;
      invertColumn(p, state, c);
    }
    const methaneOut = tracer ? moveMethane(model, state, dt) : 0;
    applySinks(model, state, dt);
    let outflow = 0;
    if (p.open) {
      for (let j = 0; j < ny; j++) outflow += fx[j * (nx + 1) + nx] - fx[j * (nx + 1)];
      for (let i = 0; i < nx; i++) outflow += fy[ny * nx + i] - fy[i];
    }
    state.exited += (outflow - methaneOut) * dt * p.rhoG;
    state.methaneExited += methaneOut * dt * p.rhoG;
    state.injected += volumeRate * dt * p.rhoG;
    state.t += dt;
    state.steps++;
    return dt;
  };

  // ------------------------------------------------------------------ pressure

  const PRESSURE_TOL = 1e-7;
  const RELAXED_RATE = 0.05 * BAR / YEAR;
  const MAX_RELAX_TIME = 50 * YEAR;

  // Implicit (backward-Euler) brine-potential equation with total compressibility:
  //   phi ct H_c A (p - p_old)/dt + sum T m LamT (p_c - p_nb) = Qv - sum T m LamG drho g (zeta_c - zeta_nb)
  // solved matrix-free with Jacobi-preconditioned CG, then converted to total face fluxes.
  const solvePressure = (model, state, dt, injecting) => {
    const {
      nx,
      ny,
      n,
      p,
      tx,
      ty,
      mx,
      my,
      zt,
      ghostX,
      ghostY,
      area,
      Hc
    } = model;
    const {
      h
    } = state;
    const a = p.krg / p.muG;
    const b = 1 / p.muW;
    const tg = p.dRho * p.g;
    const cg = state.cg || (state.cg = {
      wx: new Float64Array((nx + 1) * ny),
      wy: new Float64Array(nx * (ny + 1)),
      gx: new Float64Array((nx + 1) * ny),
      gy: new Float64Array(nx * (ny + 1)),
      diag: new Float64Array(n),
      rhs: new Float64Array(n),
      r: new Float64Array(n),
      z: new Float64Array(n),
      d: new Float64Array(n),
      q: new Float64Array(n),
      old: new Float64Array(n),
      wE: new Float64Array(n),
      wN: new Float64Array(n),
      prev: new Float64Array(n),
      prevInterval: 0
    });
    const {
      wx,
      wy,
      gx,
      gy,
      diag,
      rhs,
      r,
      z,
      d,
      q,
      old
    } = cg;
    const lamT = c => a * Math.min(h[c], Hc[c]) + b * Math.max(0, Hc[c] - h[c]);
    const lamG = c => a * Math.min(h[c], Hc[c]);
    const acc = p.phi * p.ct * area / dt;
    old.set(state.p);
    for (let c = 0; c < n; c++) {
      diag[c] = acc * Hc[c];
      rhs[c] = diag[c] * state.p[c];
    }
    if (injecting) rhs[model.well] += p.rate / p.rhoG;
    for (let j = 0; j < ny; j++) {
      for (let f = 0; f <= nx; f++) {
        const index = j * (nx + 1) + f;
        const T = tx[index] * mx[index];
        wx[index] = 0;
        gx[index] = 0;
        if (T === 0) continue;
        if (f === 0 || f === nx) {
          if (!p.open) continue;
          const c = j * nx + (f === 0 ? 0 : nx - 1);
          // Outward-positive buoyancy flux into the hydrostatic ghost (h = 0, p = 0).
          wx[index] = T * 0.5 * (lamT(c) + b * Hc[c]);
          gx[index] = T * 0.5 * lamG(c) * tg * (zt[c] + h[c] - ghostX[index]);
          diag[c] += wx[index];
          rhs[c] -= gx[index];
          continue;
        }
        const L = j * nx + f - 1;
        const R = L + 1;
        wx[index] = T * 0.5 * (lamT(L) + lamT(R));
        gx[index] = T * 0.5 * (lamG(L) + lamG(R)) * tg * (zt[L] + h[L] - zt[R] - h[R]);
        diag[L] += wx[index];
        diag[R] += wx[index];
        rhs[L] -= gx[index];
        rhs[R] += gx[index];
      }
    }
    for (let f = 0; f <= ny; f++) {
      for (let i = 0; i < nx; i++) {
        const index = f * nx + i;
        const T = ty[index] * my[index];
        wy[index] = 0;
        gy[index] = 0;
        if (T === 0) continue;
        if (f === 0 || f === ny) {
          if (!p.open) continue;
          const c = (f === 0 ? 0 : ny - 1) * nx + i;
          wy[index] = T * 0.5 * (lamT(c) + b * Hc[c]);
          gy[index] = T * 0.5 * lamG(c) * tg * (zt[c] + h[c] - ghostY[index]);
          diag[c] += wy[index];
          rhs[c] -= gy[index];
          continue;
        }
        const S = (f - 1) * nx + i;
        const N = S + nx;
        wy[index] = T * 0.5 * (lamT(S) + lamT(N));
        gy[index] = T * 0.5 * (lamG(S) + lamG(N)) * tg * (zt[S] + h[S] - zt[N] - h[N]);
        diag[S] += wy[index];
        diag[N] += wy[index];
        rhs[S] -= gy[index];
        rhs[N] += gy[index];
      }
    }

    // Five-point stencil per cell: east and north couplings (west/south are the
    // neighbours' east/north) give a single pass over the grid.
    const {
      wE,
      wN
    } = cg;
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const c = j * nx + i;
        wE[c] = i < nx - 1 ? wx[j * (nx + 1) + i + 1] : 0;
        wN[c] = j < ny - 1 ? wy[(j + 1) * nx + i] : 0;
      }
    }
    const apply = (x, out) => {
      for (let j = 0; j < ny; j++) {
        const row = j * nx;
        for (let i = 0; i < nx; i++) {
          const c = row + i;
          let v = diag[c] * x[c];
          if (i > 0) v -= wE[c - 1] * x[c - 1];
          if (i < nx - 1) v -= wE[c] * x[c + 1];
          if (j > 0) v -= wN[c - nx] * x[c - nx];
          if (j < ny - 1) v -= wN[c] * x[c + nx];
          out[c] = v;
        }
      }
    };

    // Start CG from a linear extrapolation of the last two solutions.
    const x = state.p;
    const prev = cg.prev;
    if (cg.prevInterval > 0) {
      const ratio = Math.min(2, dt / cg.prevInterval);
      for (let c = 0; c < n; c++) x[c] += ratio * (x[c] - prev[c]);
    }
    prev.set(old);
    cg.prevInterval = dt;
    apply(x, q);
    let bNorm = 0;
    let rz = 0;
    for (let c = 0; c < n; c++) {
      r[c] = rhs[c] - q[c];
      z[c] = r[c] / diag[c];
      d[c] = z[c];
      rz += r[c] * z[c];
      bNorm += rhs[c] * rhs[c];
    }
    bNorm = Math.sqrt(bNorm) || 1;
    let iterations = 0;
    for (; iterations < 3000; iterations++) {
      let rNorm = 0;
      for (let c = 0; c < n; c++) rNorm += r[c] * r[c];
      if (Math.sqrt(rNorm) <= PRESSURE_TOL * bNorm) break;
      apply(d, q);
      let dq = 0;
      for (let c = 0; c < n; c++) dq += d[c] * q[c];
      if (!(dq > 0)) break;
      const alpha = rz / dq;
      let rzNew = 0;
      for (let c = 0; c < n; c++) {
        x[c] += alpha * d[c];
        r[c] -= alpha * q[c];
        z[c] = r[c] / diag[c];
        rzNew += r[c] * z[c];
      }
      const beta = rzNew / rz;
      rz = rzNew;
      for (let c = 0; c < n; c++) d[c] = z[c] + beta * d[c];
    }

    // Total face fluxes: interior faces positive in +x/+y; boundary faces store +x/+y too.
    for (let j = 0; j < ny; j++) {
      for (let f = 0; f <= nx; f++) {
        const index = j * (nx + 1) + f;
        if (wx[index] === 0 && gx[index] === 0) {
          state.ux[index] = 0;
          continue;
        }
        if (f === 0) state.ux[index] = -(wx[index] * x[j * nx] + gx[index]);else if (f === nx) state.ux[index] = wx[index] * x[j * nx + nx - 1] + gx[index];else state.ux[index] = wx[index] * (x[j * nx + f - 1] - x[j * nx + f]) + gx[index];
      }
    }
    for (let f = 0; f <= ny; f++) {
      for (let i = 0; i < nx; i++) {
        const index = f * nx + i;
        if (wy[index] === 0 && gy[index] === 0) {
          state.uy[index] = 0;
          continue;
        }
        if (f === 0) state.uy[index] = -(wy[index] * x[i] + gy[index]);else if (f === ny) state.uy[index] = wy[index] * x[(ny - 1) * nx + i] + gy[index];else state.uy[index] = wy[index] * (x[(f - 1) * nx + i] - x[f * nx + i]) + gy[index];
      }
    }
    let change = 0;
    for (let c = 0; c < n; c++) change = Math.max(change, Math.abs(x[c] - old[c]));
    state.cgIterations = iterations;
    state.cgTotal = (state.cgTotal || 0) + iterations;
    state.solves = (state.solves || 0) + 1;
    return change;
  };
  const pressureInterval = (state, p) => {
    if (state.t < p.injEnd) return clamp(0.25 * state.t, 2 * 86400, 0.5 * YEAR);
    return 0.5 * YEAR;
  };
  const advance = (model, state, tTarget) => {
    const p = model.p;
    if (state.nextPressure === undefined) state.nextPressure = 0;
    while (state.t < tTarget * (1 - 1e-12)) {
      if (state.pressureActive && state.t >= state.nextPressure * (1 - 1e-12)) {
        let interval = pressureInterval(state, p);
        if (state.t < p.injEnd) interval = Math.min(interval, p.injEnd - state.t);
        const injecting = state.t < p.injEnd && p.rate > 0;
        const change = solvePressure(model, state, interval, injecting);
        state.nextPressure = state.t + interval;
        if (!injecting && state.t >= p.injEnd && (change / interval < RELAXED_RATE || state.t - p.injEnd > MAX_RELAX_TIME)) {
          state.pressureActive = false;
          state.ux.fill(0);
          state.uy.fill(0);
        }
      }
      let dtMax = tTarget - state.t;
      if (state.t < p.injEnd && state.t + dtMax > p.injEnd) dtMax = p.injEnd - state.t;
      if (state.pressureActive) dtMax = Math.min(dtMax, state.nextPressure - state.t);
      stepTransport(model, state, dtMax);
    }
  };

  // Key performance indicators at the current state (SI). Footprint, column and migration
  // count the CO2 part of the gas only.
  const kpis = (model, state) => {
    const {
      n,
      nx,
      p,
      Hc,
      area,
      xc,
      yc
    } = model;
    const a = p.krg / p.muG;
    const b = 1 / p.muW;
    let footprint = 0;
    let maxColumn = 0;
    let migration = 0;
    let pMax = 0;
    const wx = xc[model.well % nx];
    const wy = yc[Math.floor(model.well / nx)];
    for (let c = 0; c < n; c++) {
      const column = state.h[c] * co2Share(state, c);
      if (state.s[c] - state.ch4[c] > 1e-3) footprint += area;
      if (column > maxColumn) maxColumn = column;
      if (column > 0.1) migration = Math.max(migration, Math.hypot(xc[c % nx] - wx, yc[Math.floor(c / nx)] - wy));
      if (state.p[c] > pMax) pMax = state.p[c];
    }
    let bhp = state.p[model.well];
    if (state.t < p.injEnd && p.rate > 0) {
      const Hw = Hc[model.well];
      const hw = Math.min(state.h[model.well], Hw);
      const lamT = a * hw + b * (Hw - hw);
      bhp += p.rate / p.rhoG * Math.log(0.198 * model.dx / 0.1) / (2 * Math.PI * p.k * lamT);
    }
    return {
      footprint,
      maxColumn,
      migration,
      bhp,
      pMax
    };
  };

  // CO2 inventory in kg, classified as in co2lab: free plume, structurally trapped
  // (mobile CO2 above the local spill depth), residually trapped, dissolved, left the
  // model through an open boundary, and leaked up fault zones. Every class counts the CO2
  // part of the gas only. The methane rows give the methane in place and its three sinks.
  const inventory = (model, state) => {
    const {
      n,
      p,
      area,
      zt,
      traps
    } = model;
    const {
      h,
      hMax
    } = state;
    const mobileFactor = p.rhoG * p.phi * (1 - p.swr) * area;
    const residualFactor = p.rhoG * p.phi * p.sgr * area;
    let mobile = 0;
    let structural = 0;
    let residual = 0;
    let methane = 0;
    for (let c = 0; c < n; c++) {
      if (state.s[c] <= 0) continue;
      const co2 = co2Share(state, c);
      mobile += h[c] * mobileFactor * co2;
      residual += (hMax[c] - h[c]) * residualFactor * co2;
      const closure = traps.zSpill[c] - zt[c];
      if (closure > 0) structural += Math.min(h[c], closure) * mobileFactor * co2;
      methane += state.ch4[c];
    }
    const result = {
      injected: state.injected,
      free: Math.max(0, mobile - structural),
      structural,
      residual: Math.max(0, residual),
      dissolved: state.dissolved,
      exited: state.exited,
      leaked: state.leaked,
      methane: methane * area * p.rhoG,
      methaneExited: state.methaneExited,
      methaneLeaked: state.methaneLeaked,
      methaneDissolved: state.methaneDissolved
    };
    result.balance = result.injected - (result.free + result.structural + result.residual + result.dissolved + result.exited + result.leaked);
    return result;
  };
  const MAX_STEPS = 400000;
  const modelViewOf = model => ({
    nx: model.nx,
    ny: model.ny,
    dx: model.dx,
    dy: model.dy,
    Lx: model.Lx,
    Ly: model.Ly,
    H: model.H,
    Hc: Float32Array.from(model.Hc),
    depth: model.scenario.depth,
    years: model.scenario.years,
    injYears: model.scenario.injYears,
    open: model.p.open,
    zt: Float32Array.from(model.zt),
    zSpill: Float32Array.from(model.traps.zSpill),
    trapId: Int32Array.from(model.traps.trapId),
    traps: model.traps.traps.map(({
      id,
      crestCell,
      spillCell,
      spillDepth,
      capacity,
      cells
    }) => ({
      id,
      crestCell,
      spillCell,
      spillDepth,
      capacity,
      size: cells.length
    })),
    faults: model.scenario.faults.map(fault => ({
      ...fault
    })),
    faultLines: model.faultLines.map(line => line.slice()),
    leakCells: model.leakCells.map(cell => ({
      ...cell
    })),
    well: model.well,
    wellX: model.xc[model.well % model.nx],
    wellY: model.yc[Math.floor(model.well / model.nx)],
    phi: model.p.phi,
    swr: model.p.swr,
    sgr: model.p.sgr,
    rhoG: model.p.rhoG,
    disCapacity: Float32Array.from(model.Hc, H => model.p.disCap * model.p.phi * H)
  });

  // Methane share of the gas in each column, 0 to 1 (0 where there is no gas).
  const methaneShare = state => {
    const share = new Float32Array(state.s.length);
    for (let c = 0; c < share.length; c++) if (state.ch4[c] > 0 && state.s[c] > 0) share[c] = Math.min(1, state.ch4[c] / state.s[c]);
    return share;
  };
  const snapshotOf = (model, state, year) => ({
    year,
    h: Float32Array.from(state.h),
    hMax: Float32Array.from(state.hMax),
    ch4: methaneShare(state),
    md: Float32Array.from(state.md),
    p: Float32Array.from(state.p),
    fx: Float32Array.from(state.fx),
    fy: Float32Array.from(state.fy),
    leaking: Uint8Array.from(state.leaking),
    inv: inventory(model, state),
    kpi: kpis(model, state)
  });

  // Run a scenario from year 0 to scenario.years. History rows every year, field
  // snapshots every `snapshotYears`. Ends early (truncated) if the step budget runs out.
  const run = (rawScenario, options = {}) => {
    const model = buildModel(rawScenario);
    const state = createState(model);
    const modelView = modelViewOf(model);
    const snapshotYears = options.snapshotYears || 5;
    const keepSnapshots = options.keepSnapshots !== false;
    const maxSteps = options.maxSteps || MAX_STEPS;
    options.onModel?.(modelView);
    const history = [];
    const snapshots = [];
    let bhpPeak = 0;
    let truncated = false;
    const record = year => {
      const inv = inventory(model, state);
      const kpi = kpis(model, state);
      bhpPeak = Math.max(bhpPeak, kpi.bhp);
      history.push({
        year,
        ...inv,
        footprint: kpi.footprint,
        maxColumn: kpi.maxColumn,
        migration: kpi.migration,
        bhp: kpi.bhp,
        bhpPeak
      });
      if (year % snapshotYears === 0) {
        const snap = snapshotOf(model, state, year);
        if (keepSnapshots) snapshots.push(snap);
        options.onSnapshot?.(snap, history);
      }
    };
    record(0);
    for (let year = 1; year <= model.scenario.years; year++) {
      advance(model, state, year * YEAR);
      record(year);
      if (state.steps > maxSteps) {
        truncated = true;
        break;
      }
    }
    return {
      modelView,
      snapshots,
      history,
      truncated,
      steps: state.steps,
      scenario: model.scenario
    };
  };

  // ------------------------------------------------------------------ random structures

  // Fault rock from the shale gouge ratio (SGR) of the faulted interval: permeability (mD)
  // and thickness (throw / 66) after Manzocchi et al. (1999), giving the cross-fault
  // multiplier between two 250 m cells (the standard grid), and the CO2 column the fault
  // rock holds from the Bretan et al. (2003) calibration for burial above 3 km.
  const faultSeal = (throwM, sgr, permMd, dRho) => {
    const kf = 10 ** (0.4 - 4 * sgr - 0.25 * Math.log10(Math.max(1, throwM)) * (1 - sgr) ** 5);
    return {
      trans: 1 / (1 + throwM / 66 / 250 * Math.max(0, permMd / kf - 1)),
      sealCap: 10 ** (100 * sgr / 27 - 0.5) * BAR / (dRho * GRAVITY)
    };
  };
  const RANDOM_STYLES = Object.freeze({
    'random-fault-blocks': {
      label: 'Tilted fault blocks',
      description: 'Parallel normal faults tilt the aquifer into blocks. CO₂ rises to the crest of its block, against the fault up-dip.'
    },
    'random-dome': {
      label: 'Faulted dome',
      description: 'A closure elongated along strike, often cut by small crestal faults, with the injector on its down-dip flank.'
    },
    'random-homocline': {
      label: 'Undulating homocline',
      description: 'A dipping aquifer whose caprock undulates along strike. Rising CO₂ fills many small traps on its way up-dip.'
    }
  });

  // A random structure from one geological setting, so that dip, folds, faults and fault
  // rock agree: a fault set shares the regional strike, throw grows with length (D = γL),
  // seals follow the shale gouge ratio and the injector sits down-dip of the main closure.
  const randomStructure = (seed, base = DEFAULTS, style) => {
    const rng = mulberry32(seed);
    const between = (min, max) => min + (max - min) * rng();
    const logBetween = (min, max) => Math.exp(between(Math.log(min), Math.log(max)));
    const round = (value, digits = 1) => +value.toFixed(digits);
    const unit = azimuth => [Math.sin(azimuth * Math.PI / 180), Math.cos(azimuth * Math.PI / 180)];
    const styles = Object.keys(RANDOM_STYLES);
    const drawn = styles[Math.floor(rng() * styles.length)];
    const kind = RANDOM_STYLES[style] ? style : drawn;
    const fault = (x, y, strike, length, gamma) => {
      const throwM = Math.min(150, Math.round(gamma * length * KM));
      const seal = faultSeal(throwM, between(0.12, 0.4), base.permMd, base.rhoBrine - base.rhoCo2);
      return {
        x: round(clamp(x, 0.5, 19.5)),
        y: round(clamp(y, 0.5, 11.5)),
        strike: (Math.round(strike) % 360 + 360) % 360,
        length: round(length),
        throw: throwM,
        trans: round(seal.trans, 2),
        sealCap: Math.min(200, Math.round(seal.sealCap)),
        kf: rng() < 0.3 ? Math.round(logBetween(5, 60)) : 0
      };
    };
    const well = (x, y) => ({
      wellX: round(clamp(x, 1.5, 18.5)),
      wellY: round(clamp(y, 1.5, 10.5))
    });
    if (kind === 'random-fault-blocks') {
      // Domino blocks: the faults dip one way and the beds the other, so each block rises
      // to a footwall crest against the next fault up-dip. The injector sits in the block
      // down-dip of the fault nearest the centre.
      const strike = between(0, 360);
      const along = unit(strike);
      const hanging = unit(strike + 90);
      const spacing = between(5, 7.5);
      const width = Math.abs(hanging[0]) * LX / KM + Math.abs(hanging[1]) * LY / KM;
      const count = Math.min(3, 1 + Math.floor(0.75 * width / spacing));
      const faults = Array.from({
        length: count
      }, (_, k) => {
        const offset = (k - (count - 1) / 2) * spacing + between(-0.5, 0.5);
        const shift = between(-2, 2);
        return fault(10 + offset * hanging[0] + shift * along[0], 6 + offset * hanging[1] + shift * along[1], strike + between(-4, 4), between(8, 16), logBetween(0.007, 0.015));
      });
      const host = faults.reduce((best, f) => Math.hypot(f.x - 10, f.y - 6) < Math.hypot(best.x - 10, best.y - 6) ? f : best);
      const distance = between(2.5, 3.5);
      return {
        preset: kind,
        seed,
        dipDeg: round(between(0.4, 1)),
        dipAz: Math.round(strike + 270 + between(-3, 3)) % 360,
        domes: 0,
        roughness: Math.round(between(1, 4)),
        thicknessVar: Math.round(between(15, 35)),
        faults,
        ...well(host.x - distance * hanging[0], host.y - distance * hanging[1])
      };
    }
    const dipAz = Math.floor(rng() * 360);
    const down = unit(dipAz);
    if (kind === 'random-dome') {
      // Crestal faults strike along the dome with their hanging walls facing the crest: one
      // fault, or a pair bounding a crestal graben.
      const domes = rng() < 0.35 ? 2 : 1;
      const [main] = domeCentres({
        seed,
        domes: 1,
        dipAz
      });
      const crestal = rng();
      const faults = (crestal < 0.3 ? [] : crestal < 0.6 ? [rng() < 0.5 ? -1 : 1] : [-1, 1]).map(side => {
        const offset = side * between(0.3, 1);
        const shift = between(-1, 1);
        return fault(main.x / KM + offset * down[0] + shift * down[1], main.y / KM + offset * down[1] - shift * down[0], dipAz + 90 * side + between(-8, 8), between(3, 7), logBetween(0.002, 0.006));
      });
      const distance = between(2.5, 3.5);
      return {
        preset: kind,
        seed,
        dipDeg: round(between(0.2, 0.8)),
        dipAz,
        domes,
        domeRelief: 5 * Math.round(between(50, 140) / 5),
        roughness: Math.round(between(1, 5)),
        thicknessVar: Math.round(between(10, 30)),
        faults,
        ...well(main.x / KM + distance * down[0], main.y / KM + distance * down[1])
      };
    }

    // Homocline: the injector sits down-dip of the centre so the plume crosses the
    // undulations on its way up.
    const faults = rng() < 0.5 ? [] : [fault(between(5, 15), between(3, 9), dipAz + (rng() < 0.5 ? -90 : 90) + between(-20, 20), between(3, 8), logBetween(0.002, 0.006))];
    const along = between(-3, 3);
    return {
      preset: kind,
      seed,
      dipDeg: round(between(0.5, 1.5)),
      dipAz,
      domes: rng() < 0.3 ? 1 : 0,
      domeRelief: 5 * Math.round(between(15, 40) / 5),
      roughness: Math.round(between(8, 18)),
      thicknessVar: Math.round(between(20, 45)),
      faults,
      ...well(10 + 5 * down[0] + along * down[1], 6 + 5 * down[1] - along * down[0])
    };
  };

  // ------------------------------------------------------------------ uncertainty

  // Inputs the uncertainty study may vary. `fault0.*` addresses the first fault.
  const UQ_PARAMS = Object.freeze([{
    key: 'permMd',
    label: 'Permeability',
    unit: 'mD',
    log: true
  }, {
    key: 'porosity',
    label: 'Porosity',
    unit: '–'
  }, {
    key: 'thickness',
    label: 'Aquifer thickness',
    unit: 'm'
  }, {
    key: 'rateMt',
    label: 'Injection rate',
    unit: 'Mt/yr'
  }, {
    key: 'sgr',
    label: 'Residual gas saturation',
    unit: '–'
  }, {
    key: 'krg',
    label: 'CO₂ relative permeability',
    unit: '–'
  }, {
    key: 'disRate',
    label: 'Dissolution rate',
    unit: 'kg/m²/yr'
  }, {
    key: 'dipDeg',
    label: 'Regional dip',
    unit: '°'
  }, {
    key: 'domeRelief',
    label: 'Dome relief',
    unit: 'm'
  }, {
    key: 'roughness',
    label: 'Top-surface roughness',
    unit: 'm'
  }, {
    key: 'fault0.sealCap',
    label: 'Fault seal capacity',
    unit: 'm'
  }, {
    key: 'fault0.kf',
    label: 'Fault-zone permeability',
    unit: 'mD',
    log: true
  }, {
    key: 'fault0.trans',
    label: 'Cross-fault transmissibility',
    unit: '–'
  }]);
  const mulberry32 = seed => {
    let a = seed >>> 0;
    return () => {
      a = a + 0x6D2B79F5 >>> 0;
      let t = a;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };
  const latinHypercube = (n, dimensions, rng) => {
    const rows = Array.from({
      length: n
    }, () => new Array(dimensions));
    for (let d = 0; d < dimensions; d++) {
      const strata = Array.from({
        length: n
      }, (_, i) => i);
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [strata[i], strata[j]] = [strata[j], strata[i]];
      }
      for (let i = 0; i < n; i++) rows[i][d] = (strata[i] + rng()) / n;
    }
    return rows;
  };
  const ranks = values => {
    const order = values.map((value, index) => [value, index]).sort((a, b) => a[0] - b[0]);
    const result = new Array(values.length);
    for (let i = 0; i < order.length;) {
      let j = i;
      while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j++;
      for (let k = i; k <= j; k++) result[order[k][1]] = (i + j) / 2;
      i = j + 1;
    }
    return result;
  };
  const spearman = (x, y) => {
    const rx = ranks(x);
    const ry = ranks(y);
    const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
    const mx = mean(rx);
    const my = mean(ry);
    let num = 0;
    let dx = 0;
    let dy = 0;
    for (let i = 0; i < rx.length; i++) {
      num += (rx[i] - mx) * (ry[i] - my);
      dx += (rx[i] - mx) ** 2;
      dy += (ry[i] - my) ** 2;
    }
    return dx > 0 && dy > 0 ? num / Math.sqrt(dx * dy) : 0;
  };
  const setScenarioValue = (scenario, key, value) => {
    if (key.startsWith('fault0.')) {
      if (scenario.faults.length) scenario.faults[0] = {
        ...scenario.faults[0],
        [key.slice(7)]: value
      };
    } else {
      scenario[key] = value;
    }
  };
  const sampleBatch = (base, specs, n, seed) => {
    const unit = latinHypercube(n, specs.length, mulberry32(seed));
    return unit.map(row => {
      const scenario = normalizeScenario(base);
      specs.forEach((spec, d) => {
        const value = spec.log ? Math.exp(Math.log(spec.min) + row[d] * (Math.log(spec.max) - Math.log(spec.min))) : spec.min + row[d] * (spec.max - spec.min);
        setScenarioValue(scenario, spec.key, value);
      });
      return normalizeScenario(scenario);
    });
  };
  const summarize = row => {
    const pct = value => row.injected > 0 ? 100 * value / row.injected : 0;
    return {
      freePct: pct(row.free),
      structuralPct: pct(row.structural),
      residualPct: pct(row.residual),
      dissolvedPct: pct(row.dissolved),
      exitedPct: pct(row.exited),
      leakedPct: pct(row.leaked),
      footprintKm2: row.footprint / 1e6,
      migrationKm: row.migration / KM,
      bhpBar: row.bhpPeak / BAR
    };
  };
  const runBatch = (scenarios, onProgress) => scenarios.map((scenario, index) => {
    const result = run(scenario, {
      keepSnapshots: false
    });
    onProgress?.(index + 1, scenarios.length);
    return {
      index,
      scenario: result.scenario,
      summary: summarize(result.history.at(-1)),
      truncated: result.truncated
    };
  });
  return {
    YEAR,
    MT,
    MD,
    BAR,
    KM,
    GRAVITY,
    LX,
    LY,
    GRIDS,
    LIMITS,
    FAULT_LIMITS,
    DOME_LIMITS,
    GAS_CONTACT_LIMITS,
    DEFAULTS,
    PRESETS,
    MAX_FAULTS,
    normalizeScenario,
    topDepth,
    depthField,
    thicknessField,
    buildModel,
    trapAnalysis,
    contourSegments,
    RANDOM_STYLES,
    randomStructure,
    faultSeal,
    createState,
    advance,
    kpis,
    inventory,
    run,
    UQ_PARAMS,
    mulberry32,
    latinHypercube,
    spearman,
    sampleBatch,
    summarize,
    runBatch
  };
});

// File: story-geometry.js
// story-geometry.js — the shared geometry of the story homepage (chapters 2 to 5).
// It describes one depleted gas field: a sandstone dome with a methane gas cap at the crest,
// a fault on the west flank and a CO2 injection well on the east flank. The section drawing,
// the 3D grid and the live VE model all read this one scenario. The module draws nothing.
// Units: map positions in km, depths in m (positive down), gas thickness in m or as a fraction.
(function (root, factory) {
  const VE2D = typeof module === 'object' && module.exports ? require('./ve2d-model.js') : root.VE2D;
  const api = factory(VE2D);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.StoryGeometry = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (VE2D) {
  const KM = VE2D.KM;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // Why these values:
  // - The dome has no regional dip. A dip with a flat gas contact lets the gas cap flood the
  //   up-dip side. The contact is 50 m below the crest, and 40 m above the spill depth.
  // - The fault strikes north-south, along the dome. Its east side is the dome side and goes down.
  //   The fault is 3.25 km from the crest, so the gas cap does not touch it.
  // - The boundary is closed. The injection pressure then moves the gas cap by up to 220 m.
  //   An open boundary moves it by 75 m for the same plume. An open boundary needs 1.5 Mt/yr
  //   for the same push, and then the plume comes within 1 km of the gas cap.
  // - The rate is 0.5 Mt/yr and the permeability is 25 mD. The closest cells of the two gases
  //   stay 2 km apart. At 100 mD they are 1.5 km apart, and at 500 mD they touch.
  // - The residual gas saturation is 0.35, so the inventory shows a clear residual part.
  // - The run is 100 years, the shortest run that VE2D accepts. Injection stops at year 30.
  const STORY_SCENARIO = Object.freeze({
    preset: 'story',
    grid: 'coarse',
    boundary: 'closed',
    years: 100,
    injYears: 30,
    rateMt: 0.5,
    wellX: 16.25,
    wellY: 5.25,
    permMd: 25,
    porosity: 0.2,
    thickness: 100,
    thicknessVar: 0,
    ct: 2,
    sgr: 0.35,
    depth: 2091,
    dipDeg: 0,
    domes: 1,
    domeRelief: 100,
    roughness: 0,
    dome: Object.freeze({
      x: 9.75,
      y: 6.25,
      along: 2.2,
      across: 1.5,
      angle: 80
    }),
    gasContactDepth: 2050,
    faults: Object.freeze([Object.freeze({
      x: 6.5,
      y: 6.25,
      strike: 0,
      length: 14,
      throw: 40,
      trans: 0.5,
      sealCap: 30,
      kf: 20
    })])
  });

  // Map window of the 3D block, in km. Its edges are on cell faces of the coarse model grid.
  const STORY_WINDOW = Object.freeze({
    x0: 4.5,
    x1: 19.5,
    y0: 1.5,
    y1: 10.5
  });

  // Years that the precomputed run stores.
  const STORY_YEARS = Object.freeze([0, 1, 2, 5, 10, 15, 20, 25, 30, 40, 60, 100]);

  // Overburden horizons above the reservoir. Each depth is the depth at the crest. A horizon
  // follows the relief of the reservoir top by the drape fraction. The fault offsets the
  // horizons from the base of the chalk down.
  const OVERBURDEN = Object.freeze([{
    id: 'sea-floor',
    name: 'Sea floor',
    depth: 100,
    drape: 0,
    faulted: false
  }, {
    id: 'sands-base',
    name: 'Base of young sands and clays',
    depth: 800,
    drape: 0.05,
    faulted: false
  }, {
    id: 'mudstone-base',
    name: 'Base of mudstone',
    depth: 1400,
    drape: 0.25,
    faulted: false
  }, {
    id: 'chalk-base',
    name: 'Base of chalk',
    depth: 1800,
    drape: 0.6,
    faulted: true
  }]);
  const LAYER_NAMES = Object.freeze(['Sea', 'Young sands and clays', 'Mudstone', 'Chalk', 'Shale caprock', 'Reservoir sandstone', 'Older rock']);
  let cache = null;

  // The normalised scenario and its VE2D model, built once. Do not change the returned objects.
  // crest is the shallowest model cell (x, y in km, depth in m). spillDepth is the spill depth
  // in m of the trap that holds the crest.
  const storyModel = () => {
    if (cache) return cache;
    const model = VE2D.buildModel(STORY_SCENARIO);
    let crestCell = 0;
    for (let c = 1; c < model.n; c++) if (model.zt[c] < model.zt[crestCell]) crestCell = c;
    const trap = model.traps.traps[model.traps.trapId[crestCell]];
    const i = crestCell % model.nx;
    const j = (crestCell - i) / model.nx;
    cache = {
      scenario: model.scenario,
      model,
      crest: {
        cell: crestCell,
        i,
        j,
        x: model.xc[i] / KM,
        y: model.yc[j] / KM,
        depth: model.zt[crestCell]
      },
      spillDepth: trap ? trap.spillDepth : null
    };
    return cache;
  };

  // The straight map line through the crest and the well, from one model edge to the other.
  // The line starts on the fault side. The value s is the distance along the line in km.
  const storySectionLine = () => {
    const {
      scenario,
      model
    } = storyModel();
    const crest = scenario.dome;
    const well = {
      x: model.xc[model.well % model.nx] / KM,
      y: model.yc[Math.floor(model.well / model.nx)] / KM
    };
    const length = Math.hypot(well.x - crest.x, well.y - crest.y);
    const ux = (well.x - crest.x) / length;
    const uy = (well.y - crest.y) / length;
    // The line leaves the model at the first edge that it reaches in each direction.
    const reach = (step, from, max) => step > 0 ? (max - from) / step : step < 0 ? from / -step : Infinity;
    const forward = Math.min(reach(ux, crest.x, VE2D.LX / KM), reach(uy, crest.y, VE2D.LY / KM));
    const backward = Math.min(reach(-ux, crest.x, VE2D.LX / KM), reach(-uy, crest.y, VE2D.LY / KM));
    return {
      x0: crest.x - ux * backward,
      y0: crest.y - uy * backward,
      x1: crest.x + ux * forward,
      y1: crest.y + uy * forward,
      ux,
      uy,
      length: backward + forward,
      crestS: backward,
      wellS: backward + length,
      well
    };
  };

  // Intersection of the section line with a fault trace [x0, y0, x1, y1] in metres.
  // It returns the distance s along the line in metres and the strike parameter t (-1 to 1).
  const traceCrossing = (line, trace) => {
    const dx = trace[2] - trace[0];
    const dy = trace[3] - trace[1];
    const px = trace[0] - line.x0 * KM;
    const py = trace[1] - line.y0 * KM;
    const determinant = dx * line.uy - line.ux * dy;
    if (Math.abs(determinant) < 1e-12) return null;
    const s = (dx * py - px * dy) / determinant;
    const v = (line.ux * py - line.uy * px) / determinant;
    if (s < 0 || s > line.length * KM || v < 0 || v > 1) return null;
    return {
      s,
      t: 2 * v - 1
    };
  };

  // Depth of the reservoir top along the line, with and without the faults, as functions of
  // the distance s in metres.
  const topFunctions = line => {
    const {
      scenario
    } = storyModel();
    const topAt = VE2D.depthField(scenario);
    const smoothAt = VE2D.depthField({
      ...scenario,
      faults: []
    });
    const place = s => [line.x0 * KM + s * line.ux, line.y0 * KM + s * line.uy];
    return {
      top: s => topAt(...place(s)),
      smooth: s => smoothAt(...place(s))
    };
  };

  // The gas cap along the line, as the interval around the crest where the top is above the
  // contact. A bisection finds each end.
  const capInterval = (top, crestS, length, contact) => {
    if (contact === null || !(top(crestS) < contact)) return null;
    const edge = direction => {
      let inside = crestS;
      let outside = crestS;
      do {
        inside = outside;
        outside += direction * 20;
      } while (outside > 0 && outside < length && top(outside) < contact);
      outside = clamp(outside, 0, length);
      for (let k = 0; k < 40; k++) {
        const middle = (inside + outside) / 2;
        if (top(middle) < contact) inside = middle;else outside = middle;
      }
      return inside / KM;
    };
    return {
      start: edge(-1),
      end: edge(1)
    };
  };

  // The geological cross-section along the line, with `samples` points.
  // - s, x, y: position of each sample in km.
  // - top, base: reservoir top and base in m. Both include the fault offset.
  // - horizons: the six surfaces from the sea floor to the reservoir base, each with depth in m.
  // - layers: the seven layers. Each layer has the index of its top and base horizon, or -1
  //   for the sea surface (top) and for the bottom of the drawing (base).
  // - contact: depth of the flat gas-water contact in m.
  // - cap: the s range of the gas cap in km.
  // - faults: each crossing of the line with a fault. The top just before and after the
  //   crossing gives the step. downSide names the side of the fault that goes down.
  const storySection = (samples = 200) => {
    const count = Math.max(2, Math.round(samples));
    const {
      scenario,
      model,
      spillDepth
    } = storyModel();
    const line = storySectionLine();
    const {
      top: topAt,
      smooth: smoothAt
    } = topFunctions(line);
    const lengthM = line.length * KM;
    const reference = smoothAt(line.crestS * KM);
    const H = scenario.thickness;
    const s = new Float64Array(count);
    const x = new Float64Array(count);
    const y = new Float64Array(count);
    const horizons = [...OVERBURDEN.map(horizon => ({
      id: horizon.id,
      name: horizon.name,
      depth: new Float64Array(count)
    })), {
      id: 'reservoir-top',
      name: 'Reservoir top',
      depth: new Float64Array(count)
    }, {
      id: 'reservoir-base',
      name: 'Reservoir base',
      depth: new Float64Array(count)
    }];
    const reservoirTop = horizons[OVERBURDEN.length].depth;
    const reservoirBase = horizons[OVERBURDEN.length + 1].depth;
    for (let k = 0; k < count; k++) {
      const along = lengthM * k / (count - 1);
      s[k] = along / KM;
      x[k] = line.x0 + line.ux * s[k];
      y[k] = line.y0 + line.uy * s[k];
      const top = topAt(along);
      const smooth = smoothAt(along);
      OVERBURDEN.forEach((horizon, index) => {
        horizons[index].depth[k] = horizon.depth + horizon.drape * (smooth - reference) + (horizon.faulted ? top - smooth : 0);
      });
      reservoirTop[k] = top;
      reservoirBase[k] = top + H;
    }
    const faults = [];
    model.faultLines.forEach((trace, index) => {
      const crossing = traceCrossing(line, trace);
      if (!crossing) return;
      const before = topAt(crossing.s - 1);
      const after = topAt(crossing.s + 1);
      faults.push({
        index,
        s: crossing.s / KM,
        x: line.x0 + line.ux * crossing.s / KM,
        y: line.y0 + line.uy * crossing.s / KM,
        t: crossing.t,
        throw: scenario.faults[index].throw * (1 - crossing.t * crossing.t),
        topBefore: before,
        topAfter: after,
        downSide: after > before ? 'end' : 'start'
      });
    });

    // The crest is the shallowest point within 2 km of the dome centre.
    let crest = {
      s: line.crestS,
      depth: Infinity
    };
    for (let offset = -2000; offset <= 2000; offset += 10) {
      const along = line.crestS * KM + offset;
      const depth = topAt(along);
      if (depth < crest.depth) crest = {
        s: along / KM,
        depth
      };
    }
    const contact = scenario.gasContactDepth;
    const layers = LAYER_NAMES.map((name, index) => ({
      name,
      top: index - 1,
      base: index < LAYER_NAMES.length - 1 ? index : -1
    }));
    return {
      samples: count,
      length: line.length,
      s,
      x,
      y,
      top: reservoirTop,
      base: reservoirBase,
      horizons,
      layers,
      contact,
      spillDepth,
      cap: capInterval(topAt, line.crestS * KM, lengthM, contact),
      faults,
      crest,
      well: {
        s: line.wellS,
        x: line.well.x,
        y: line.well.y,
        topDepth: topAt(line.wellS * KM)
      }
    };
  };

  // Overlap of each grid column with the model cells. Column c covers the model cells
  // cellIndex[cellStart[c] .. cellStart[c + 1] - 1]. The weights of a column sum to 1.
  const mapColumns = (model, xs, ys) => {
    const nx = xs.length - 1;
    const ny = ys.length - 1;
    const cellStart = new Int32Array(nx * ny + 1);
    const centerCell = new Int32Array(nx * ny);
    const cells = [];
    const weights = [];
    const eps = 1e-6;
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const column = j * nx + i;
        const xa = xs[i] * KM;
        const xb = xs[i + 1] * KM;
        const ya = ys[j] * KM;
        const yb = ys[j + 1] * KM;
        const first = cells.length;
        let total = 0;
        for (let cj = clamp(Math.floor(ya / model.dy + eps), 0, model.ny - 1); cj * model.dy < yb - eps && cj < model.ny; cj++) {
          const overlapY = Math.min(yb, (cj + 1) * model.dy) - Math.max(ya, cj * model.dy);
          for (let ci = clamp(Math.floor(xa / model.dx + eps), 0, model.nx - 1); ci * model.dx < xb - eps && ci < model.nx; ci++) {
            const overlap = overlapY * (Math.min(xb, (ci + 1) * model.dx) - Math.max(xa, ci * model.dx));
            if (!(overlap > eps)) continue;
            cells.push(cj * model.nx + ci);
            weights.push(overlap);
            total += overlap;
          }
        }
        for (let k = first; k < weights.length; k++) weights[k] /= total;
        cellStart[column + 1] = cells.length;
        centerCell[column] = clamp(Math.floor((ya + yb) / 2 / model.dy), 0, model.ny - 1) * model.nx + clamp(Math.floor((xa + xb) / 2 / model.dx), 0, model.nx - 1);
      }
    }
    return {
      cellStart,
      cellIndex: Int32Array.from(cells),
      cellWeight: Float32Array.from(weights),
      centerCell
    };
  };

  // A corner-point grid over STORY_WINDOW for the 3D block. Column c = j * nx + i, with i to the
  // east and j to the north. The corners of a column are 0 south-west, 1 south-east,
  // 2 north-east and 3 north-west. top and thickness hold 4 values for each column, in m.
  // A column line lies on the fault, so each column takes the depth of its own side of the fault.
  // The fault then shows as a step. The layer k of a corner has the depth
  // top + thickness * k / nz (see storyNodeDepth).
  const storyGrid = (nx = 30, ny = 18, nz = 5) => {
    const countX = Math.max(2, Math.round(nx));
    const countY = Math.max(1, Math.round(ny));
    const layers = Math.max(1, Math.round(nz));
    const {
      scenario,
      model
    } = storyModel();
    const {
      x0,
      x1,
      y0,
      y1
    } = STORY_WINDOW;
    const xs = new Float64Array(countX + 1);
    const ys = new Float64Array(countY + 1);
    const fault = scenario.faults[0];
    const onLine = fault && fault.strike % 180 === 0 && fault.x > x0 && fault.x < x1;
    const left = onLine ? clamp(Math.round(countX * (fault.x - x0) / (x1 - x0)), 1, countX - 1) : 0;
    for (let i = 0; i <= countX; i++) {
      if (!onLine) xs[i] = x0 + (x1 - x0) * i / countX;else if (i <= left) xs[i] = x0 + (fault.x - x0) * i / left;else xs[i] = fault.x + (x1 - fault.x) * (i - left) / (countX - left);
    }
    for (let j = 0; j <= countY; j++) ys[j] = y0 + (y1 - y0) * j / countY;
    const topAt = VE2D.depthField(scenario);
    const thicknessAt = VE2D.thicknessField(scenario);
    const top = new Float32Array(4 * countX * countY);
    const thickness = new Float32Array(4 * countX * countY);
    const inset = 1;
    for (let j = 0; j < countY; j++) {
      for (let i = 0; i < countX; i++) {
        const column = j * countX + i;
        // Each corner is read 1 m inside its own column, so it is on its own side of the fault.
        const xw = xs[i] * KM + inset;
        const xe = xs[i + 1] * KM - inset;
        const ys0 = ys[j] * KM + inset;
        const ys1 = ys[j + 1] * KM - inset;
        [[xw, ys0], [xe, ys0], [xe, ys1], [xw, ys1]].forEach(([px, py], corner) => {
          top[4 * column + corner] = topAt(px, py);
          thickness[4 * column + corner] = thicknessAt(px, py);
        });
      }
    }
    return {
      nx: countX,
      ny: countY,
      nz: layers,
      columns: countX * countY,
      window: {
        x0,
        x1,
        y0,
        y1
      },
      xs,
      ys,
      faultLine: onLine ? {
        index: left,
        x: fault.x
      } : null,
      top,
      thickness,
      ...mapColumns(model, xs, ys)
    };
  };

  // Depth in m of layer boundary `layer` (0 to nz) at one corner of one column.
  const storyNodeDepth = (grid, column, corner, layer) => grid.top[4 * column + corner] + grid.thickness[4 * column + corner] * layer / grid.nz;

  // The gas of a model snapshot on the columns of a grid. h is the gas thickness as a fraction
  // of the column thickness (0 to 1). ch4 is the methane share of the gas (0 to 1), averaged
  // with the gas thickness of the covered model cells as weight. The snapshot needs h in m, and
  // ch4 as a fraction, on the model grid. A stored run from story-run.json works too.
  const storyColumns = (snapshot, grid) => {
    const {
      model
    } = storyModel();
    const h = new Float32Array(grid.columns);
    const ch4 = new Float32Array(grid.columns);
    for (let column = 0; column < grid.columns; column++) {
      let fraction = 0;
      let gas = 0;
      let methane = 0;
      for (let k = grid.cellStart[column]; k < grid.cellStart[column + 1]; k++) {
        const cell = grid.cellIndex[k];
        const weight = grid.cellWeight[k];
        const thickness = snapshot.h[cell];
        fraction += weight * Math.min(1, thickness / model.Hc[cell]);
        gas += weight * thickness;
        methane += weight * thickness * snapshot.ch4[cell];
      }
      h[column] = fraction;
      ch4[column] = gas > 0 ? methane / gas : 0;
    }
    return {
      h,
      ch4
    };
  };
  return {
    STORY_SCENARIO,
    STORY_WINDOW,
    STORY_YEARS,
    storyModel,
    storySectionLine,
    storySection,
    storyGrid,
    storyNodeDepth,
    storyColumns
  };
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

// File: StoryRock.jsx
// StoryRock.jsx — the art of chapter 2, "Into the rock": a cutaway of a depleted gas field.
// The rock comes from StoryGeometry.storySection(). The CO2 plume comes from assets/story-run.json.
// The renderer API is at the top of StoryStage.jsx.

// ---- story rock helpers (pure; tests/story-rock.test.js evaluates this block)
const ROCK_SAMPLES = 240;
const ROCK_BOTTOM = 2.65;
const ROCK_DOMAIN = {
  lx: 20,
  ly: 12
};
const ROCK_PLUME_YEAR = 10;
const ROCK_FOLLOW_END = 0.5;
const ROCK_OUT_END = 0.8;
const ROCK_NARROW = 640;
const ROCK_RATIO = {
  min: 4,
  max: 12
};
const ROCK_SLANT = {
  x: 0.39,
  y: 0.225
};
const ROCK_STEP = 0.002;
const ROCK_SKIP_BOTTOM = 120;
const rockClamp = (value, lo = 0, hi = 1) => value > lo ? Math.min(value, hi) : lo;
const rockLerp = (a, b, t) => a + (b - a) * t;
const rockSmooth = t => {
  const u = rockClamp(t);
  return u * u * (3 - 2 * u);
};
const rockMix = (a, b, t) => {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
const rockShade = (color, t) => rockMix(color, '#000000', t);

// The screen scales of the block. sx is px per km along the front face. vz is px per km of depth.
// ratio = vz / sx is the true vertical exaggeration. The camera zoom changes both scales by the same factor.
// caption: 'side' keeps the left of the stage clear, 'top' keeps the top band clear, 'none' is a static frame.
const rockLayout = (width, height, options = {}) => {
  const narrow = width <= ROCK_NARROW;
  const caption = options.caption || (narrow ? 'top' : 'side');
  const length = options.length || 20.235;
  const chars = options.captionChars || 127;
  const foot = caption === 'none' ? 10 : narrow ? 28 : 22;
  let x0;
  let y0;
  if (narrow) {
    const lines = Math.ceil(chars * 8.6 / Math.max(120, width - 32));
    x0 = 54;
    y0 = caption === 'top' ? Math.min(height * 0.5, 128 + lines * 25.5 + 14) : 8;
  } else {
    x0 = caption === 'side' ? Math.round(width * 0.295 + 66) : 64;
    y0 = caption === 'none' ? 8 : 72;
  }
  const x1 = narrow ? width - 10 : width - 12;
  const y1 = height - foot;
  const s0 = narrow ? 4.4 : 0;
  const s1 = narrow ? Math.min(length, 19.2) : length;
  const back = narrow ? 3 : 4;
  const plat = narrow ? Math.min(44, height * 0.16) : rockClamp(height * 0.085, 46, 84);
  const pad = 4;
  const span = s1 - s0 + ROCK_SLANT.x * back;
  const oyMin = (caption === 'side' ? ROCK_SKIP_BOTTOM : y0 + 10) + plat;
  const reserve = 6;
  let sx = (x1 - x0 - 2 * pad) / span;
  let vz = Math.max(1, (y1 - reserve - oyMin) / ROCK_BOTTOM);
  const lowest = caption === 'none' ? 3 : ROCK_RATIO.min;
  if (vz / sx < lowest) sx = vz / lowest;
  if (vz / sx > ROCK_RATIO.max) vz = sx * ROCK_RATIO.max;
  const free = Math.max(0, y1 - reserve - oyMin - vz * ROCK_BOTTOM);
  const ox = x0 + pad;
  const oy = oyMin + free / 2;
  const exaggeration = Math.round(vz / sx);
  return {
    narrow,
    caption,
    s0,
    s1,
    back,
    plat,
    pad,
    sx,
    vz,
    ox,
    oy,
    win: {
      x0,
      y0,
      x1,
      y1
    },
    qx: sx * ROCK_SLANT.x,
    qy: sx * ROCK_SLANT.y,
    ratio: vz / sx,
    exaggeration,
    scaleLabel: `Vertical scale × ${exaggeration}`,
    font: rockClamp(width * 0.0095 + 1, 11, 14.5),
    axisX: x0 - 12,
    center: {
      s: (s0 + s1) / 2,
      d: ROCK_BOTTOM / 2,
      x: ox + (s1 - s0) / 2 * sx,
      y: oy + ROCK_BOTTOM / 2 * vz
    }
  };
};

// Where the camera stands, from local 0 to 1. anchors say where the well and the layers are.
const rockCameraSpec = (layout, anchors) => {
  const {
    win,
    narrow
  } = layout;
  return {
    followEnd: ROCK_FOLLOW_END,
    outEnd: ROCK_OUT_END,
    zoomIn: narrow ? 3 : 2.6,
    wellS: anchors.wellS,
    seaFloor: anchors.seaFloor,
    reservoir: anchors.reservoir,
    anchorIn: {
      x: win.x0 + (win.x1 - win.x0) * (narrow ? 0.64 : 0.68),
      y: win.y0 + (win.y1 - win.y0) * (narrow ? 0.42 : 0.46)
    },
    center: layout.center
  };
};

// The camera is a world point (s, d) at a screen point (x, y), with a zoom factor.
// 0 to followEnd: the point goes down the well. followEnd to outEnd: the camera zooms out to the fit view. Then it holds.
const rockCamera = (local, spec) => {
  const t = rockClamp(local);
  const follow = rockSmooth(t / spec.followEnd);
  const out = rockSmooth((t - spec.followEnd) / (spec.outEnd - spec.followEnd));
  return {
    zoom: Math.pow(spec.zoomIn, 1 - out),
    s: rockLerp(spec.wellS, spec.center.s, out),
    d: rockLerp(rockLerp(spec.seaFloor, spec.reservoir, follow), spec.center.d, out),
    x: rockLerp(spec.anchorIn.x, spec.center.x, out),
    y: rockLerp(spec.anchorIn.y, spec.center.y, out)
  };
};

// The map from the block to the screen. s is the distance along the section in km, d the depth in km.
// b is the distance behind the front face in km. It only moves points on the sea surface and the right face.
const rockView = (layout, cam) => ({
  zoom: cam.zoom,
  x: (s, b = 0) => cam.x + cam.zoom * (layout.sx * (s - cam.s) + layout.qx * b),
  y: (d, b = 0) => cam.y + cam.zoom * (layout.vz * (d - cam.d) - layout.qy * b),
  s: x => cam.s + (x - cam.x) / (cam.zoom * layout.sx)
});

// The 8 boundaries of the 7 layers at sample k, in km: the sea surface, six horizons and the bottom.
const rockBands = (section, k) => [0, ...section.horizons.slice(0, 6).map(horizon => horizon.depth[k] / 1000), ROCK_BOTTOM];

// The same boundaries at the distance s in km along the section.
const rockBandsAt = (section, s) => {
  const u = rockClamp(s / section.length) * (section.samples - 1);
  const k = Math.min(section.samples - 2, Math.floor(u));
  const t = u - k;
  const a = rockBands(section, k);
  const b = rockBands(section, k + 1);
  return a.map((value, i) => rockLerp(value, b[i], t));
};

// One boundary as a polyline from s0 to s1. A fault gives a vertical step: two points at the same s.
const rockBoundary = (section, index, s0, s1) => {
  const n = section.samples;
  const s = section.s;
  const depth = k => index === 0 ? 0 : index === 7 ? ROCK_BOTTOM : section.horizons[index - 1].depth[k] / 1000;
  const ss = [];
  const ds = [];
  const push = (a, b) => {
    ss.push(a);
    ds.push(b);
  };
  push(s0, rockBandsAt(section, s0)[index]);
  for (let k = 0; k < n; k++) {
    if (s[k] > s0 && s[k] < s1) push(s[k], depth(k));
    if (k > n - 3) continue;
    for (const fault of section.faults) {
      if (!(fault.s > s[k] && fault.s <= s[k + 1] && fault.s > s0 && fault.s < s1)) continue;
      const left = k > 0 ? depth(k) + (depth(k) - depth(k - 1)) * (fault.s - s[k]) / (s[k] - s[k - 1]) : depth(k);
      const right = depth(k + 1) - (depth(k + 2) - depth(k + 1)) * (s[k + 1] - fault.s) / (s[k + 2] - s[k + 1]);
      if (Math.abs(right - left) > ROCK_STEP) {
        push(fault.s, left);
        push(fault.s, right);
      }
    }
  }
  push(s1, rockBandsAt(section, s1)[index]);
  return {
    s: ss,
    d: ds
  };
};

// A line inside the sandstone at the fraction f of its thickness. Both boundaries must have the same points.
const rockInner = (top, base, f) => ({
  s: top.s.slice(),
  d: top.d.map((value, i) => rockLerp(value, base.d[i], f))
});

// The top edge of the gas cap: the reservoir top between the two ends of the cap. The contact closes it.
const rockCap = section => {
  if (!section.cap) return null;
  const contact = section.contact / 1000;
  const ss = [section.cap.start];
  const ds = [contact];
  for (let k = 0; k < section.samples; k++) {
    if (section.s[k] > section.cap.start && section.s[k] < section.cap.end) {
      ss.push(section.s[k]);
      ds.push(section.top[k] / 1000);
    }
  }
  ss.push(section.cap.end);
  ds.push(contact);
  return {
    s: ss,
    d: ds,
    contact
  };
};

// The gas of one stored frame along the section line. h is the gas thickness in m, share the methane share.
// The 4 nearest cell centres give a bilinear mean. The share has the gas thickness as weight.
const rockGasAlong = (section, frame, grid, domain = ROCK_DOMAIN) => {
  const nx = grid[0];
  const ny = grid[1];
  const dx = domain.lx / nx;
  const dy = domain.ly / ny;
  const h = new Float64Array(section.samples);
  const share = new Float64Array(section.samples);
  for (let k = 0; k < section.samples; k++) {
    const fx = section.x[k] / dx - 0.5;
    const fy = section.y[k] / dy - 0.5;
    const i0 = Math.floor(fx);
    const j0 = Math.floor(fy);
    const tx = fx - i0;
    const ty = fy - j0;
    let gas = 0;
    let methane = 0;
    for (let c = 0; c < 4; c++) {
      const di = c & 1;
      const dj = c >> 1;
      const weight = (di ? tx : 1 - tx) * (dj ? ty : 1 - ty);
      const cell = Math.min(ny - 1, Math.max(0, j0 + dj)) * nx + Math.min(nx - 1, Math.max(0, i0 + di));
      gas += weight * frame.h[cell];
      methane += weight * frame.h[cell] * frame.ch4[cell];
    }
    h[k] = gas;
    share[k] = gas > 0 ? methane / gas : 0;
  }
  return {
    h,
    share
  };
};

// The CO2 plume under the reservoir top: the thickness in m at each sample, with the methane share.
// Gas that is mostly methane is the gas cap. The cap is drawn from the contact, so the plume skips it.
const rockPlume = (section, gas) => {
  const th = new Float64Array(section.samples);
  for (let k = 0; k < section.samples; k++) {
    const room = section.base[k] - section.top[k];
    th[k] = gas.share[k] < 0.5 && gas.h[k] > 0.3 ? Math.min(gas.h[k], room) : 0;
  }
  return {
    th,
    share: gas.share
  };
};

// Short wave marks on the sea surface. They stay at the same place in the block.
const rockWaves = (layout, count = 26) => {
  let seed = 5;
  const next = () => {
    seed = seed * 16807 % 2147483647;
    return seed / 2147483647;
  };
  const waves = [];
  for (let i = 0; i < count; i++) {
    waves.push({
      s: layout.s0 + 0.4 + next() * (layout.s1 - layout.s0 - 1.2),
      b: 0.3 + next() * (layout.back - 0.6)
    });
  }
  return waves;
};

// The box of a label at the fit view, with a rough width for the text. It is null for a band label in a thin layer.
const rockLabelBox = (layout, section, label) => {
  const em = layout.font;
  const size = label.text.length * em * 0.52;
  const px = s => layout.ox + (s - layout.s0) * layout.sx;
  const py = d => layout.oy + d * layout.vz;
  if (label.kind === 'band') {
    const bands = rockBandsAt(section, label.s);
    if ((bands[label.layer + 1] - bands[label.layer]) * layout.vz < em * 1.3) return null;
    const x = px(label.s);
    const y = py(rockLerp(bands[label.layer], bands[label.layer + 1], label.f)) + label.px;
    return {
      x0: x,
      x1: x + size + (layout.narrow ? 16 : 26) + 3,
      y0: y - em * 0.6,
      y1: y + em * 0.6
    };
  }
  const x = px(label.at.s);
  const y = py(label.at.d);
  const x0 = label.align === 'middle' ? x - size / 2 : label.align === 'end' ? x - size : x;
  return {
    x0,
    x1: x0 + size,
    y0: y - em * 0.6,
    y1: y + em * 0.6
  };
};
const rockApart = (a, b) => a.x1 + 2 <= b.x0 || b.x1 + 2 <= a.x0 || a.y1 <= b.y0 || b.y1 <= a.y0;

// The labels, with all places in km. A band label sticks to the left of the window and follows its layer.
// A point label has a dot on the target, a leader and a text at its place. px is a shift in screen pixels.
// A label that has no room at the fit view is dropped. The least important label goes first.
const rockLabels = (layout, section) => {
  const {
    narrow,
    sx,
    vz,
    win
  } = layout;
  const fault = section.faults.length ? section.faults[0].s : null;
  const crest = section.crest.s;
  const well = section.well.s;
  const depthAt = (s, band, f, px = 0) => {
    const bands = rockBandsAt(section, s);
    return rockLerp(bands[band], bands[band + 1], f) + px / vz;
  };
  const band = (id, text, tone, layer, s, f = 0.5, px = 0) => ({
    id,
    kind: 'band',
    text,
    tone,
    layer,
    s,
    f,
    px
  });
  const point = (id, text, align, attach, target, at) => ({
    id,
    kind: 'point',
    text,
    tone: 'cream',
    align,
    attach,
    target: {
      s: target.s,
      d: depthAt(target.s, target.band, target.f)
    },
    at: {
      s: at.s,
      d: depthAt(at.s, at.band, at.f, at.px)
    }
  });
  const older = (ROCK_BOTTOM - rockBandsAt(section, crest)[6]) * vz;
  const row1 = s => ({
    s,
    band: 6,
    f: 0,
    px: rockClamp(older * 0.33, 8, 30)
  });
  const row2 = s => ({
    s,
    band: 6,
    f: 1,
    px: -rockClamp(older * 0.22, 8, 20)
  });
  const options = {};
  const add = (...items) => items.forEach(item => {
    (options[item.id] = options[item.id] || []).push(item);
  });
  if (!narrow) {
    const edge = layout.s0 + 14 / sx;
    add(band('sands', 'Sands and clays', 'ink', 1, edge), band('mud', 'Mudstone', 'ink', 2, edge), band('chalk', 'Chalk', 'ink', 3, edge), band('caprock', 'Shale caprock', 'cream', 4, edge), band('older', 'Older rock', 'cream', 6, edge, 1, -18), point('sandstone', 'Sandstone', 'middle', 'top', {
      s: 3,
      band: 5,
      f: 0.5
    }, row1(3)), point('brine', 'Brine', 'middle', 'top', {
      s: 13.3,
      band: 5,
      f: 0.55
    }, row1(13.3)), point('gas', 'Gas cap (methane)', 'middle', 'top', {
      s: crest,
      band: 5,
      f: 0.25
    }, row1(crest)), point('co2', 'CO₂ from the well', 'middle', 'top', {
      s: well - 0.3,
      band: 5,
      f: 0.2
    }, row1(well + 1.35)));
  } else {
    const edge = (fault === null ? layout.s0 : fault) + 24 / sx;
    add(band('sands', 'Sands and clays', 'ink', 1, edge), band('chalk', 'Chalk', 'ink', 3, edge), band('caprock', 'Shale caprock', 'cream', 4, crest + 20 / sx), point('sandstone', 'Sandstone', 'start', 'top', {
      s: layout.s0 + 0.8,
      band: 5,
      f: 0.5
    }, row2(layout.s0 + 0.2)), point('gas', 'Gas cap (methane)', 'middle', 'top', {
      s: crest,
      band: 5,
      f: 0.25
    }, row1(crest)), point('co2', 'CO₂ from the well', 'middle', 'top', {
      s: well - 0.3,
      band: 5,
      f: 0.2
    }, row1(well + 0.4)));
  }
  if (fault !== null) {
    // The text stands west of the fault line. If it has no room there, it stands east.
    const gap = (narrow ? 8 : 22) / sx;
    const target = {
      s: fault,
      band: 4,
      f: 0.5
    };
    add(point('fault', 'Fault', 'end', 'side', target, {
      s: fault - gap,
      band: 4,
      f: 0.5
    }), point('fault', 'Fault', 'start', 'side', target, {
      s: fault + gap,
      band: 4,
      f: 0.5
    }));
  }
  const chosen = {};
  const boxes = [];
  for (const id of ['gas', 'co2', 'fault', 'sandstone', 'brine', 'caprock', 'chalk', 'sands', 'mud', 'older']) {
    for (const label of options[id] || []) {
      const box = rockLabelBox(layout, section, label);
      if (box === null) {
        chosen[id] = label;
        break;
      }
      const inside = box.x0 >= win.x0 + 4 && box.x1 <= win.x1 - 4 && box.y0 >= win.y0 && box.y1 <= win.y1;
      if (inside && boxes.every(other => rockApart(other, box))) {
        chosen[id] = label;
        boxes.push(box);
        break;
      }
    }
  }
  return Object.keys(options).filter(id => chosen[id]).map(id => chosen[id]);
};
// ---- end story rock helpers

const ROCK_FILLS = [STORY_COLORS.sea, '#d9cfae', '#a39a8b', STORY_COLORS.chalk, '#74695c', STORY_COLORS.sand, '#7d6b5d'];
const ROCK_SIDES = ROCK_FILLS.map(color => rockShade(color, 0.22));
const ROCK_BED = rockShade(ROCK_FILLS[1], 0.12);
const ROCK_SHALE = rockShade(STORY_COLORS.sand, 0.3);
const ROCK_SURFACE = '#3d6c7b';
const ROCK_WAVE = '#5d8a98';
const ROCK_TUBING = '#8fb0ff';
const ROCK_FONT = 'Literata, Georgia, serif';
const rockState = {
  section: null,
  prep: null,
  plume: null,
  load: 'idle',
  last: null
};
const rockSection = () => {
  if (!rockState.section) rockState.section = StoryGeometry.storySection(ROCK_SAMPLES);
  return rockState.section;
};

// The stored run is small. It loads once, when the chapter draws for the first time.
const rockLoad = () => {
  if (rockState.load !== 'idle' || typeof fetch !== 'function') return;
  rockState.load = 'loading';
  fetch('./assets/story-run.json').then(response => response.ok ? response.json() : Promise.reject(new Error(String(response.status)))).then(run => {
    const stored = run.frames.find(item => item.year === ROCK_PLUME_YEAR);
    if (!stored) throw new Error('The stored run has no frame for the plume.');
    const section = rockSection();
    rockState.plume = rockPlume(section, rockGasAlong(section, stored, run.grid));
    rockState.load = 'ready';
    const last = rockState.last;
    if (last && last.frame.reducedMotion) storyPaint(last.ctx, 'rock', last.frame);
  }).catch(() => {
    rockState.load = 'failed';
  });
};

// Everything that depends on the size of the stage but not on the camera.
const rockPrepare = frame => {
  const key = `${frame.width}x${frame.height}${frame.reducedMotion ? 's' : 'p'}`;
  if (rockState.prep && rockState.prep.key === key) return rockState.prep;
  const section = rockSection();
  const captions = typeof SITE_STORY === 'object' && SITE_STORY.captions && SITE_STORY.captions.rock || [];
  const chars = captions.reduce((most, text) => Math.max(most, text.length), 0) || 127;
  const layout = rockLayout(frame.width, frame.height, {
    caption: frame.reducedMotion ? 'none' : undefined,
    length: section.length,
    captionChars: chars
  });
  const spec = rockCameraSpec(layout, {
    wellS: section.well.s,
    seaFloor: section.horizons[0].depth[0] / 1000,
    reservoir: section.well.topDepth / 1000
  });
  const bounds = [0, 1, 2, 3, 4, 5, 6, 7].map(index => rockBoundary(section, index, layout.s0, layout.s1));
  const bandsAtWell = rockBandsAt(section, section.well.s);
  rockState.prep = {
    key,
    section,
    layout,
    spec,
    bounds,
    sides: rockBandsAt(section, layout.s1),
    cap: rockCap(section),
    shales: [0.38, 0.7].map(f => rockInner(bounds[5], bounds[6], f)),
    beds: [0.16, 0.31, 0.5, 0.66, 0.84].map(f => rockInner(bounds[1], bounds[2], f)),
    labels: rockLabels(layout, section),
    waves: rockWaves(layout),
    wellBottom: bandsAtWell[6] - 0.008,
    faultTip: section.faults.length ? rockBandsAt(section, section.faults[0].s)[3] : null
  };
  return rockState.prep;
};
const rockRound = (ctx, x0, y0, x1, y1, r) => {
  ctx.beginPath();
  ctx.moveTo(x0 + r, y0);
  ctx.arcTo(x1, y0, x1, y1, r);
  ctx.arcTo(x1, y1, x0, y1, r);
  ctx.arcTo(x0, y1, x0, y0, r);
  ctx.arcTo(x0, y0, x1, y0, r);
  ctx.closePath();
};
const rockFont = (px, italic = true) => `${italic ? 'italic ' : ''}400 ${px}px ${ROCK_FONT}`;

// A flat shape with a stroke of the same colour. The stroke closes the thin gap between two layers.
const rockPaint = (ctx, color) => {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.lineJoin = 'round';
  ctx.fill();
  ctx.stroke();
};

// One layer on the front face: its top boundary, and its base boundary backwards.
const rockFrontPath = (ctx, view, top, base) => {
  ctx.beginPath();
  for (let i = 0; i < top.s.length; i++) {
    const x = view.x(top.s[i]);
    const y = view.y(top.d[i]);
    if (i) ctx.lineTo(x, y);else ctx.moveTo(x, y);
  }
  for (let i = base.s.length - 1; i >= 0; i--) ctx.lineTo(view.x(base.s[i]), view.y(base.d[i]));
  ctx.closePath();
};
const rockSidePath = (ctx, view, layout, top, base) => {
  ctx.beginPath();
  ctx.moveTo(view.x(layout.s1, 0), view.y(top, 0));
  ctx.lineTo(view.x(layout.s1, layout.back), view.y(top, layout.back));
  ctx.lineTo(view.x(layout.s1, layout.back), view.y(base, layout.back));
  ctx.lineTo(view.x(layout.s1, 0), view.y(base, 0));
  ctx.closePath();
};
const rockLine = (ctx, view, line) => {
  for (let i = 0; i < line.s.length; i++) {
    const x = view.x(line.s[i]);
    const y = view.y(line.d[i]);
    if (i) ctx.lineTo(x, y);else ctx.moveTo(x, y);
  }
};
const rockBlock = (ctx, prep, view) => {
  const {
    layout,
    bounds,
    sides,
    cap,
    shales,
    beds
  } = prep;
  for (let j = 0; j < 7; j++) {
    rockFrontPath(ctx, view, bounds[j], bounds[j + 1]);
    rockPaint(ctx, ROCK_FILLS[j]);
  }
  ctx.strokeStyle = ROCK_BED;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const bed of beds) rockLine(ctx, view, bed);
  ctx.stroke();
  for (let j = 0; j < 7; j++) {
    rockSidePath(ctx, view, layout, sides[j], sides[j + 1]);
    rockPaint(ctx, ROCK_SIDES[j]);
  }
  ctx.beginPath();
  ctx.moveTo(view.x(layout.s0, 0), view.y(0, 0));
  ctx.lineTo(view.x(layout.s1, 0), view.y(0, 0));
  ctx.lineTo(view.x(layout.s1, layout.back), view.y(0, layout.back));
  ctx.lineTo(view.x(layout.s0, layout.back), view.y(0, layout.back));
  ctx.closePath();
  rockPaint(ctx, ROCK_SURFACE);
  const grow = Math.sqrt(view.zoom);
  ctx.strokeStyle = ROCK_WAVE;
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (const wave of prep.waves) {
    const x = view.x(wave.s, wave.b);
    const y = view.y(0, wave.b);
    ctx.moveTo(x, y);
    ctx.lineTo(x + 11 * grow, y + 1.4 * grow);
  }
  ctx.stroke();
  ctx.strokeStyle = ROCK_SHALE;
  ctx.lineWidth = Math.min(2.2, 1.2 * grow);
  ctx.setLineDash([22 * grow, 7 * grow]);
  ctx.lineJoin = 'round';
  for (const shale of shales) {
    ctx.beginPath();
    rockLine(ctx, view, shale);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  if (cap) {
    ctx.fillStyle = STORY_COLORS.ch4;
    ctx.beginPath();
    rockLine(ctx, view, cap);
    ctx.closePath();
    ctx.fill();
  }
  const plume = rockState.plume;
  if (plume) {
    const section = prep.section;
    // The colour of each part comes from the methane share: blue for CO2, red for methane.
    if (!plume.colors) plume.colors = Array.from(plume.th, (_, k) => rockMix(STORY_COLORS.co2, STORY_COLORS.ch4, rockClamp((plume.share[k] + plume.share[Math.min(k + 1, plume.share.length - 1)]) / 2)));
    ctx.lineWidth = 0.8;
    for (let k = 0; k < section.samples - 1; k++) {
      if (!(plume.th[k] > 0 || plume.th[k + 1] > 0)) continue;
      const colour = plume.colors[k];
      const xa = view.x(section.s[k]);
      const xb = view.x(section.s[k + 1]);
      ctx.fillStyle = colour;
      ctx.strokeStyle = colour;
      ctx.beginPath();
      ctx.moveTo(xa, view.y(section.top[k] / 1000));
      ctx.lineTo(xb, view.y(section.top[k + 1] / 1000));
      ctx.lineTo(xb, view.y((section.top[k + 1] + plume.th[k + 1]) / 1000));
      ctx.lineTo(xa, view.y((section.top[k] + plume.th[k]) / 1000));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }
  if (prep.faultTip !== null) {
    const x = view.x(prep.section.faults[0].s);
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x, view.y(prep.faultTip));
    ctx.lineTo(x, view.y(ROCK_BOTTOM));
    ctx.stroke();
  }
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.lineWidth = 1.2;
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  ctx.moveTo(view.x(layout.s0), view.y(0));
  ctx.lineTo(view.x(layout.s1), view.y(0));
  ctx.lineTo(view.x(layout.s1), view.y(ROCK_BOTTOM));
  ctx.lineTo(view.x(layout.s0), view.y(ROCK_BOTTOM));
  ctx.closePath();
  ctx.moveTo(view.x(layout.s1), view.y(0));
  ctx.lineTo(view.x(layout.s1, layout.back), view.y(0, layout.back));
  ctx.lineTo(view.x(layout.s1, layout.back), view.y(ROCK_BOTTOM, layout.back));
  ctx.lineTo(view.x(layout.s1), view.y(ROCK_BOTTOM));
  ctx.moveTo(view.x(layout.s0), view.y(0));
  ctx.lineTo(view.x(layout.s0, layout.back), view.y(0, layout.back));
  ctx.lineTo(view.x(layout.s1, layout.back), view.y(0, layout.back));
  ctx.stroke();
};

// The well: a casing from the platform to the reservoir, perforations in the sandstone, and CO2 dashes in the tubing.
const rockWell = (ctx, prep, view, time) => {
  const {
    section,
    layout
  } = prep;
  const grow = Math.sqrt(view.zoom);
  const x = view.x(section.well.s);
  const top = view.y(0);
  const bottom = view.y(prep.wellBottom);
  const reservoir = section.well.topDepth / 1000;
  ctx.lineCap = 'butt';
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.lineWidth = 3.2 * grow;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, bottom);
  ctx.stroke();
  ctx.lineWidth = 1.5 * grow;
  for (let i = 0; i < 4; i++) {
    const y = view.y(reservoir + 0.018 * (i + 1));
    ctx.beginPath();
    ctx.moveTo(x - 6.5 * grow, y);
    ctx.lineTo(x + 6.5 * grow, y);
    ctx.stroke();
  }
  ctx.strokeStyle = ROCK_TUBING;
  ctx.lineWidth = 1.4 * grow;
  ctx.setLineDash([5 * grow, 7 * grow]);
  ctx.lineDashOffset = -(time / 1000) * 30 * grow;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, view.y(reservoir + 0.009));
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
  const k = layout.plat / 64 * view.zoom;
  const seaLocal = (view.y(section.horizons[0].depth[0] / 1000) - top) / k;
  rockPlatform(ctx, x, top, k, seaLocal, grow);
};

// An offshore platform that stands on (x, y) at the scale k. leg is the length of the legs under the water.
const rockPlatform = (ctx, x, y, k, leg, grow) => {
  const ink = STORY_COLORS.ink;
  const cream = STORY_COLORS.cream;
  const line = grow / k;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.1 * line;
  ctx.beginPath();
  ctx.moveTo(-17, leg);
  ctx.lineTo(-12, -26);
  ctx.moveTo(17, leg);
  ctx.lineTo(12, -26);
  ctx.moveTo(-6, leg);
  ctx.lineTo(-4, -26);
  ctx.moveTo(6, leg);
  ctx.lineTo(4, -26);
  ctx.stroke();
  ctx.lineWidth = 0.9 * line;
  ctx.beginPath();
  const step = (leg + 26) / 3;
  for (let i = 0; i < 3; i++) {
    const a = -26 + i * step;
    const b = a + step;
    ctx.moveTo(-15, b);
    ctx.lineTo(14, a);
    ctx.moveTo(15, b);
    ctx.lineTo(-14, a);
  }
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.fillRect(-26, -33, 52, 7);
  ctx.fillStyle = cream;
  ctx.lineWidth = 0.9 * line;
  ctx.fillRect(-22, -47, 19, 14);
  ctx.strokeRect(-22, -47, 19, 14);
  ctx.fillRect(-1, -42, 15, 9);
  ctx.strokeRect(-1, -42, 15, 9);
  ctx.beginPath();
  ctx.moveTo(26, -36);
  ctx.lineTo(38, -36);
  ctx.lineTo(38, -31);
  ctx.lineTo(26, -31);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 1.1 * line;
  ctx.beginPath();
  ctx.moveTo(15, -33);
  ctx.lineTo(20, -64);
  ctx.lineTo(25, -33);
  ctx.moveTo(16.5, -43);
  ctx.lineTo(23.5, -43);
  ctx.moveTo(18, -53);
  ctx.lineTo(22, -53);
  ctx.moveTo(-12, -47);
  ctx.lineTo(-12, -58);
  ctx.lineTo(-34, -50);
  ctx.stroke();
  ctx.restore();
};

// A tiny dot with a ring, the end of a leader.
const rockDot = (ctx, x, y) => {
  ctx.fillStyle = STORY_COLORS.cream;
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(x, y, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
};
const rockLabels2d = (ctx, prep, view, local) => {
  const {
    layout,
    section
  } = prep;
  const win = layout.win;
  const font = layout.font;
  const reveal = rockSmooth((local - 0.45) / 0.2);
  ctx.font = rockFont(font);
  ctx.textBaseline = 'middle';
  ctx.lineCap = 'round';
  for (const label of prep.labels) {
    const colour = label.tone === 'cream' ? STORY_COLORS.cream : STORY_COLORS.ink;
    if (label.kind === 'band') {
      const x = Math.max(view.x(label.s), win.x0 + layout.pad + 14);
      const bands = rockBandsAt(section, view.s(x));
      const thickness = (bands[label.layer + 1] - bands[label.layer]) * layout.vz * view.zoom;
      const y = view.y(rockLerp(bands[label.layer], bands[label.layer + 1], label.f)) + label.px;
      if (thickness < font * 1.3) continue;
      const width = ctx.measureText(label.text).width;
      const lead = layout.narrow ? 16 : 26;
      // The label fades near the scale tag, near the window edges and where the fault line crosses it.
      let fade = Math.min(rockClamp((y - (win.y0 + font + 24)) / 12), rockClamp((win.y1 - 10 - y) / 10));
      if (prep.faultTip !== null && y > view.y(prep.faultTip)) {
        const line = view.x(section.faults[0].s);
        fade = Math.min(fade, rockClamp(Math.max(x - 6 - line, line - (x + width + lead + 4)) / 16));
      }
      if (fade <= 0.02) continue;
      ctx.globalAlpha = fade;
      ctx.fillStyle = colour;
      ctx.textAlign = 'left';
      ctx.fillText(label.text, x, y);
      ctx.strokeStyle = colour;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + width + 6, y);
      ctx.lineTo(x + width + lead, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + width + lead, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      continue;
    }
    if (reveal <= 0) continue;
    const tx = view.x(label.target.s);
    const ty = view.y(label.target.d);
    const ax = view.x(label.at.s);
    const ay = view.y(label.at.d);
    const inside = (px, py) => px > win.x0 + 6 && px < win.x1 - 6 && py > win.y0 + 6 && py < win.y1 - 4;
    if (!inside(tx, ty) || !inside(ax, ay)) continue;
    const width = ctx.measureText(label.text).width;
    const edge = label.align === 'middle' ? ax - width / 2 : label.align === 'end' ? ax - width : ax;
    if (edge < win.x0 + 4 || edge + width > win.x1 - 4) continue;
    const toX = label.attach === 'top' ? ax : label.align === 'end' ? ax + 5 : ax - 5;
    const toY = label.attach === 'top' ? ay - font * 0.72 : ay;
    ctx.globalAlpha = reveal;
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    rockDot(ctx, tx, ty);
    ctx.fillStyle = colour;
    ctx.textAlign = label.align === 'middle' ? 'center' : label.align;
    ctx.fillText(label.text, ax, ay);
    ctx.globalAlpha = 1;
  }
  ctx.textAlign = 'left';
};

// The depth axis stays on the left of the window. Its ticks follow the camera.
const rockAxis = (ctx, layout, view) => {
  const {
    y0,
    y1
  } = layout.win;
  const x = layout.axisX;
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.fillStyle = STORY_COLORS.ink;
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(x, rockClamp(view.y(0), y0, y1));
  ctx.lineTo(x, rockClamp(view.y(ROCK_BOTTOM), y0, y1));
  for (let d = 0; d <= 2.5001; d += 0.5) {
    const y = view.y(d);
    if (y < y0 + 1 || y > y1 - 1) continue;
    ctx.moveTo(x - (d % 1 === 0 ? 7 : 4), y);
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.font = `400 ${layout.font}px ${ROCK_FONT}`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let d = 0; d <= 2; d++) {
    const y = view.y(d);
    if (y < y0 + 8 || y > y1 - 8) continue;
    ctx.fillText(d ? `${d} km` : '0', x - 11, y);
  }
  ctx.textAlign = 'left';
};

// The vertical scale. It stays in the top left corner of the window.
const rockScaleTag = (ctx, layout) => {
  const font = layout.font;
  ctx.font = rockFont(font);
  const width = ctx.measureText(layout.scaleLabel).width + 18;
  const height = font + 10;
  const x = layout.win.x0 + 10;
  const y = layout.win.y0 + 10;
  rockRound(ctx, x, y, x + width, y + height, height / 2);
  ctx.fillStyle = STORY_COLORS.cream;
  ctx.fill();
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = STORY_COLORS.ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(layout.scaleLabel, x + 9, y + height / 2 + 0.5);
};
const rockDraw = (ctx, frame) => {
  rockLoad();
  const prep = rockPrepare(frame);
  const {
    layout,
    spec
  } = prep;
  const win = layout.win;
  const view = rockView(layout, rockCamera(frame.local, spec));
  rockState.last = {
    ctx,
    frame
  };
  ctx.save();
  rockRound(ctx, win.x0 - 2, win.y0, win.x1, win.y1, 10);
  ctx.clip();
  rockBlock(ctx, prep, view);
  rockWell(ctx, prep, view, frame.time);
  rockLabels2d(ctx, prep, view, frame.local);
  ctx.restore();
  if (view.zoom > 1.005) {
    ctx.globalAlpha = rockClamp((view.zoom - 1) / 0.4);
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.lineWidth = 1.4;
    rockRound(ctx, win.x0 - 2, win.y0, win.x1, win.y1, 10);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  rockAxis(ctx, layout, view);
  rockScaleTag(ctx, layout);
};
STORY_RENDERERS.rock = {
  animated: true,
  draw: rockDraw
};

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

