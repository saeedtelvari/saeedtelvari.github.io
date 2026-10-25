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
// The site variant is clear over the pinned story (ink text on the sky). It is a solid bar in the
// ground colour with an ink hairline after the story, and on the CV page.
// The workbench variant is the simulator's solid 56 px bar. Do not change how it looks.

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
  const [overStory, setOverStory] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const mobileDrawerRef = useRef(null);

  // The pinned stage fills the screen while the story is on. The bar is clear then.
  // The bar turns solid when the stage starts to leave, so the art does not slide under the nav text.
  // Without a stage (the CV, or the static frames for reduced motion) the bar is always solid.
  useEffect(() => {
    if (variant !== 'site') return undefined;
    const onScroll = () => {
      const story = document.getElementById('story');
      const stage = story && story.querySelector('.story-stage');
      setOverStory(!!stage && story.getBoundingClientRect().bottom > stage.offsetHeight - 1);
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
  const classes = ['app-header', `app-header--${variant}`, overStory ? 'is-over-story' : ''].filter(Boolean).join(' ');
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
// It is the base of the page: older rock in flat colour with light text (style C).
const Footer = ({
  onNavigate
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
    className: "site-footer"
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

// File: StoryEarth.jsx
// StoryEarth.jsx — the art of the chapters orbit and descent (art direction C, flat colour).
//
// orbit    The Earth from orbit, with the North Sea near the top of the disc. Over local 0 to 1 the globe turns and
//          grows. A round window opens at the North Sea marker and grows into a map card at the right.
// descent  The map in the card zooms in. Then the card shrinks into the inset at the top right. The side view comes up
//          behind it: sky, sea, platform, pipeline and well. At the end, CO2 moves in the pipeline and down the well.
//
// The land comes from assets/land-110m.json (Natural Earth, TopoJSON). Until the file arrives, the art has no land.
// storyEarthPlatform and storyEarthLayout are global. The chapter rock can use them to start where descent ends.

// ---- story earth helpers (pure; tests/story-earth.test.js evaluates this block)
const STORY_EARTH_RAD = Math.PI / 180;
const STORY_EARTH_TARGET = [2.5, 57.5]; // The North Sea: lon and lat in degrees.
const STORY_EARTH_VIEW0 = [2, 30]; // The view centre of the globe at local 0 of orbit.
const STORY_EARTH_VIEW1 = [3, 41]; // The view centre at local 1 of orbit.
const STORY_EARTH_BOX = [[-5, 50.5], [12, 61.5]]; // The area that the inset shows.
const STORY_EARTH_EDGE = 2; // The longest edge of a land ring, in degrees.
const STORY_EARTH_OPEN = 0.3; // The map window starts to open at this local value of orbit.
const STORY_EARTH_HOLD = 0.7; // From this local value of descent the picture stays.
const STORY_EARTH_ZOOM = 0.4; // Descent: the map zooms until here. Then the card shrinks.

const storyEarthClamp = (v, lo = 0, hi = 1) => v > lo ? Math.min(v, hi) : lo;
const storyEarthMix = (a, b, t) => t >= 1 ? b : t <= 0 ? a : a + (b - a) * t;
const storyEarthGeo = (a, b, t) => t >= 1 ? b : t <= 0 ? a : a * Math.pow(b / a, t);
const storyEarthSmooth = t => {
  const x = storyEarthClamp(t);
  return x * x * (3 - 2 * x);
};
const storyEarthInOut = t => {
  const x = storyEarthClamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const storyEarthWrap = d => d - 360 * Math.round(d / 360);

// A colour mixed toward another colour. Both are '#rrggbb'.
const storyEarthTint = (from, to, t) => {
  if (t <= 0) return from;
  const a = [1, 3, 5].map(i => parseInt(from.slice(i, i + 2), 16));
  const b = [1, 3, 5].map(i => parseInt(to.slice(i, i + 2), 16));
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * Math.min(t, 1))).join(',')})`;
};

// The rings of land from the TopoJSON file, as arrays of [lon, lat]. Rings are closed.
// An arc stores its points as steps. The arc index ~i means the arc i in reverse.
const storyEarthDecode = topology => {
  const {
    scale,
    translate
  } = topology.transform;
  const arcs = topology.arcs.map(arc => {
    let x = 0;
    let y = 0;
    return arc.map(([dx, dy]) => {
      x += dx;
      y += dy;
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
    });
  });
  const rings = [];
  const addRing = indexes => {
    const ring = [];
    indexes.forEach(index => {
      const points = index < 0 ? arcs[~index].slice().reverse() : arcs[index];
      points.forEach((point, k) => {
        if (k > 0 || ring.length === 0) ring.push(point);
      });
    });
    rings.push(ring);
  };
  const visit = geometry => {
    if (geometry.type === 'GeometryCollection') geometry.geometries.forEach(visit);else if (geometry.type === 'Polygon') geometry.arcs.forEach(addRing);else if (geometry.type === 'MultiPolygon') geometry.arcs.forEach(polygon => polygon.forEach(addRing));
  };
  Object.values(topology.objects).forEach(visit);
  return rings;
};
const storyEarthMercY = lat => Math.log(Math.tan(Math.PI / 4 + storyEarthClamp(lat, -85.05, 85.05) * STORY_EARTH_RAD / 2));

// One ring, ready to draw. No edge is longer than maxEdge degrees.
//   lon, lat  in degrees. lon runs on without a jump at 180 degrees.
//   hole      true for a hole in the land. The points of a hole are in reverse order.
//   xyz       unit vectors, for the globe.
//   x, y      longitude in radians and Mercator y, for the map.
//   bbox      [minLon, minLat, maxLon, maxLat] in degrees.
const storyEarthBuildRing = (ring, maxEdge = STORY_EARTH_EDGE) => {
  const closed = ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1];
  const count = closed ? ring.length - 1 : ring.length;
  const lons = [];
  const lats = [];
  let lon = ring[0][0];
  for (let i = 0; i < count; i++) {
    const next = ring[(i + 1) % count];
    const lat = ring[i][1];
    const dlon = storyEarthWrap(next[0] - ring[i][0]);
    const dlat = next[1] - lat;
    lons.push(lon);
    lats.push(lat);
    const pole = Math.abs(lat) > 89.99 && Math.abs(next[1]) > 89.99;
    const steps = pole ? 1 : Math.max(1, Math.ceil(Math.max(Math.abs(dlon), Math.abs(dlat)) / maxEdge));
    for (let k = 1; k < steps; k++) {
      lons.push(lon + dlon * k / steps);
      lats.push(lat + dlat * k / steps);
    }
    lon += dlon;
  }
  // A hole (a lake in the land) goes counter-clockwise in the file. Its points go in reverse order. Then the clip of
  // the ring gives the water of the hole, and the fill rule takes the water out of the land.
  let area = 0;
  for (let i = 0; i < lons.length; i++) {
    const j = (i + 1) % lons.length;
    area += lons[i] * lats[j] - lons[j] * lats[i];
  }
  const hole = Math.abs(lon - lons[0]) < 1e-6 && area > 0;
  if (hole) {
    lons.reverse();
    lats.reverse();
  }
  const n = lons.length;
  const out = {
    count: n,
    hole,
    lon: Float64Array.from(lons),
    lat: Float64Array.from(lats),
    xyz: new Float64Array(n * 3),
    x: new Float64Array(n),
    y: new Float64Array(n),
    bbox: [Infinity, Infinity, -Infinity, -Infinity]
  };
  for (let i = 0; i < n; i++) {
    const l = lons[i] * STORY_EARTH_RAD;
    const p = lats[i] * STORY_EARTH_RAD;
    const c = Math.cos(p);
    out.xyz[3 * i] = c * Math.cos(l);
    out.xyz[3 * i + 1] = c * Math.sin(l);
    out.xyz[3 * i + 2] = Math.sin(p);
    out.x[i] = l;
    out.y[i] = storyEarthMercY(lats[i]);
    out.bbox[0] = Math.min(out.bbox[0], lons[i]);
    out.bbox[1] = Math.min(out.bbox[1], lats[i]);
    out.bbox[2] = Math.max(out.bbox[2], lons[i]);
    out.bbox[3] = Math.max(out.bbox[3], lats[i]);
  }
  return out;
};

// The orthographic view. lon and lat are the point at the centre of the disc.
const storyEarthView = (lon, lat) => {
  const l = lon * STORY_EARTH_RAD;
  const p = lat * STORY_EARTH_RAD;
  return {
    cl: Math.cos(l),
    sl: Math.sin(l),
    cp: Math.cos(p),
    sp: Math.sin(p)
  };
};

// A point on a globe of radius R with its centre at (cx, cy) on the screen (y goes down).
// depth is 1 at the centre of the view and 0 on the limb. A point with depth >= 0 is on the near side.
const storyEarthProject = (view, lon, lat, R = 1, cx = 0, cy = 0) => {
  const l = lon * STORY_EARTH_RAD;
  const p = lat * STORY_EARTH_RAD;
  const c = Math.cos(p);
  const X = c * Math.cos(l);
  const Y = c * Math.sin(l);
  const Z = Math.sin(p);
  const x1 = X * view.cl + Y * view.sl;
  const depth = x1 * view.cp + Z * view.sp;
  return {
    x: cx + R * (Y * view.cl - X * view.sl),
    y: cy - R * (Z * view.cp - x1 * view.sp),
    depth,
    visible: depth >= 0
  };
};
const storyEarthVisible = (view, lon, lat) => storyEarthProject(view, lon, lat).visible;

// The limb clip. A ring goes in as unit vectors (xyz). The land is on the right of the ring.
// The function writes the screen points of the visible land to out, as x, y, x, y, ... A NaN pair ends a closed shape.
// A part of the ring on the far side is cut away. Each piece that stays starts where the ring enters the disc
// and ends where it leaves. The shape goes on along the limb circle, clockwise, to the next entry. So the fill is right
// for any ring, also for a ring with land on the far side of the globe.
// The function returns the number of points that it wrote.
let storyEarthD = new Float64Array(0);
let storyEarthRt = new Float64Array(0);
let storyEarthUp = new Float64Array(0);
const storyEarthTau = 2 * Math.PI;

// The point where the edge from a to b crosses the limb: its angle on the limb circle (y up).
const storyEarthCross = (a, b) => {
  const t = storyEarthD[a] / (storyEarthD[a] - storyEarthD[b]);
  return Math.atan2(storyEarthUp[a] + (storyEarthUp[b] - storyEarthUp[a]) * t, storyEarthRt[a] + (storyEarthRt[b] - storyEarthRt[a]) * t);
};

// The points of the limb circle from one angle to another one, clockwise. The two ends are not in the list.
const storyEarthArc = (from, span, R, cx, cy, out) => {
  const parts = Math.ceil(span / Math.sqrt(2 / Math.max(R, 1)));
  for (let j = 1; j < parts; j++) {
    const angle = from - span * j / parts;
    out.push(cx + R * Math.cos(angle), cy - R * Math.sin(angle));
  }
};
const storyEarthClipRing = (xyz, view, R, cx, cy, out) => {
  const n = xyz.length / 3;
  if (storyEarthD.length < n) {
    storyEarthD = new Float64Array(n);
    storyEarthRt = new Float64Array(n);
    storyEarthUp = new Float64Array(n);
  }
  const D = storyEarthD;
  const Rt = storyEarthRt;
  const Up = storyEarthUp;
  const {
    cl,
    sl,
    cp,
    sp
  } = view;
  let near = 0;
  for (let i = 0; i < n; i++) {
    const X = xyz[3 * i];
    const Y = xyz[3 * i + 1];
    const Z = xyz[3 * i + 2];
    const x1 = X * cl + Y * sl;
    D[i] = x1 * cp + Z * sp;
    Up[i] = Z * cp - x1 * sp;
    Rt[i] = Y * cl - X * sl;
    if (D[i] >= 0) near++;
  }
  if (near === 0) return 0;
  const start = out.length;
  if (near === n) {
    // A ring that goes counter-clockwise on the screen has its land outside. The disc is a shape too, so the fill is right.
    let area = 0;
    for (let i = 0; i < n; i++) {
      const j = i + 1 < n ? i + 1 : 0;
      area -= Rt[i] * Up[j] - Rt[j] * Up[i];
    }
    if (area < 0) {
      const parts = Math.ceil(storyEarthTau / Math.sqrt(2 / Math.max(R, 1)));
      for (let j = 0; j < parts; j++) out.push(cx + R * Math.cos(storyEarthTau * j / parts), cy + R * Math.sin(storyEarthTau * j / parts));
      out.push(NaN, NaN);
    }
    for (let i = 0; i < n; i++) out.push(cx + R * Rt[i], cy - R * Up[i]);
    out.push(NaN, NaN);
    return (out.length - start) / 2;
  }
  // The pieces of the ring in the disc: first and last near point, and the angle of the entry and of the exit.
  const first = [];
  const last = [];
  const entry = [];
  const leave = [];
  for (let i = 0; i < n; i++) {
    const before = (i + n - 1) % n;
    if (!(D[i] >= 0 && D[before] < 0)) continue;
    let end = i;
    while (D[(end + 1) % n] >= 0) end++;
    first.push(i);
    last.push(end);
    entry.push(storyEarthCross(before, i));
    leave.push(storyEarthCross(end % n, (end + 1) % n));
  }
  const used = first.map(() => false);
  for (let s = 0; s < first.length; s++) {
    let k = s;
    while (k >= 0 && !used[k]) {
      used[k] = true;
      out.push(cx + R * Math.cos(entry[k]), cy - R * Math.sin(entry[k]));
      for (let i = first[k]; i <= last[k]; i++) out.push(cx + R * Rt[i % n], cy - R * Up[i % n]);
      out.push(cx + R * Math.cos(leave[k]), cy - R * Math.sin(leave[k]));
      let next = -1;
      let span = Infinity;
      for (let j = 0; j < first.length; j++) {
        let d = (leave[k] - entry[j]) % storyEarthTau;
        if (d < 0) d += storyEarthTau;
        if (d > storyEarthTau - 1e-9) d = 0;
        if (d < span) {
          span = d;
          next = j;
        }
      }
      storyEarthArc(leave[k], span, R, cx, cy, out);
      k = next;
    }
    if (out.length > start && out[out.length - 1] === out[out.length - 1]) out.push(NaN, NaN);
  }
  return (out.length - start) / 2;
};

// Draws the shapes that storyEarthClipRing wrote to out.
const storyEarthTrace = (ctx, out) => {
  let open = false;
  for (let i = 0; i < out.length; i += 2) {
    if (out[i] !== out[i]) {
      if (open) ctx.closePath();
      open = false;
    } else if (open) {
      ctx.lineTo(out[i], out[i + 1]);
    } else {
      ctx.moveTo(out[i], out[i + 1]);
      open = true;
    }
  }
  if (open) ctx.closePath();
};

// The Mercator map. A map is { S, lon, y, mx, my }: the point (lon in radians, y) is at (mx, my) on the screen,
// and S is the number of pixels for one radian.
const storyEarthMapPoint = (map, lon, lat) => ({
  x: map.mx + map.S * (lon * STORY_EARTH_RAD - map.lon),
  y: map.my - map.S * (storyEarthMercY(lat) - map.y)
});

// The scale at which a box of lon and lat (degrees) fits into a w by h rectangle. The centre of the box is mid-rectangle.
const storyEarthFit = (box, w, h) => {
  const [[lon0, lat0], [lon1, lat1]] = box;
  const y0 = storyEarthMercY(lat0);
  const y1 = storyEarthMercY(lat1);
  return {
    S: Math.min(w / ((lon1 - lon0) * STORY_EARTH_RAD), h / (y1 - y0)),
    lon: (lon0 + lon1) / 2 * STORY_EARTH_RAD,
    y: (y0 + y1) / 2
  };
};

// The places of all parts of the art on a stage of width by height pixels. still is true in the static frames of the
// reduced-motion layout: there the captions are not on the canvas. compact is true below 641 px of width and on a
// tall screen: there the captions are in a band at the top, and the globe fills the lower half.
//   globe  The globe at local 0 of orbit: centre and radius.
//   keep   The corner of the caption. The globe stays away from it while it grows.
//   card   The map card at the end of orbit.
//   inset  The map at the end of descent.
//   scene  The map from the side view to the screen: x = ox + s * x, y = oy + s * y. The side view has 800 by 450 units.
//   maps   The scale of the map at the start of the zoom (a), at the end of the zoom (b) and in the inset (i).
const storyEarthLayout = (width, height, still = false) => {
  const W = width;
  const H = height;
  const compact = !still && (W <= 640 || W < 0.9 * H);
  const skip = still ? 0 : 128;
  let globe;
  let keep;
  let card;
  let inset;
  let scene;
  let sun;
  let clouds;
  if (compact) {
    const R = 0.78 * W;
    // The bottom of the caption. In the band at the top (below 641 px) it depends on the number of lines.
    const room = W - 32;
    const bottom = W <= 640 ? 128 + 36 + 11 + 25.5 * Math.ceil(1000 / room) + 11 + 21 * Math.ceil(302 / room) : 340;
    globe = {
      cx: 0.5 * W,
      cy: Math.max(0.46 * H, 360, bottom + 34 * R / 330 + 14) + R,
      R
    };
    keep = {
      x: 0.5 * W,
      y: bottom
    };
    const y = Math.max(0.42 * H, 352);
    card = {
      x: 16,
      y,
      w: W - 32,
      h: H - 24 - y
    };
    const s = storyEarthClamp(W / 260, 1.2, 2);
    scene = {
      s,
      ox: 0.52 * W - 548 * s,
      oy: 0.52 * H - 232 * s
    };
    const iw = storyEarthClamp(0.29 * W, 112, 200);
    // The caption of descent: 25.5 px for each line, below 128 px.
    const below = W <= 640 ? 128 + 25.5 * Math.ceil(640 / room) : 190;
    inset = {
      x: W - 16 - iw,
      y: Math.max(216, below + 12),
      w: iw,
      h: iw * 0.73
    };
    const left = -scene.ox / s;
    sun = {
      x: 0.27 * W,
      y: Math.max(0.34 * H, below + 36),
      r: 20
    };
    clouds = [[left + 4, 204, 96], [left + 118, 190, 112]];
  } else {
    // The globe of frame 0. On a screen that is not wide, it gets smaller, so it stays 28 px away from the caption.
    keep = {
      x: 0.43 * W,
      y: 0.45 * H
    };
    const centre = {
      cx: 0.8 * W,
      cy: H * 470 / 450
    };
    const away = (Math.hypot(centre.cx - keep.x, centre.cy - keep.y) - 28) / 1.103;
    globe = {
      ...centre,
      R: Math.min(H * 330 / 450, 0.52 * W, away)
    };
    const x = 0.46 * W;
    const y = Math.max(skip, 0.16 * H);
    card = {
      x,
      y,
      w: W - Math.max(16, 0.03 * W) - x,
      h: H - 28 - y
    };
    const s = Math.min(W / 800, H / 450);
    scene = {
      s,
      ox: (W - 800 * s) / 2,
      oy: 0.516 * H - 232 * s
    };
    const si = Math.min(s, 1.7);
    inset = {
      x: W - Math.max(16, 24 * si) - 176 * si,
      y: Math.max(scene.oy + 62 * s, skip),
      w: 176 * si,
      h: 128 * si
    };
    sun = {
      x: scene.ox + 410 * s,
      y: scene.oy + 118 * s,
      r: 24 * s
    };
    clouds = [[120, 196, 120], [330, 168, 96], [470, 206, 140]];
  }
  const k = storyEarthClamp(globe.R / 330, 0.9, 1.6);
  card.cx = card.x + card.w / 2;
  card.cy = card.y + card.h / 2;
  card.r = 10 * k;
  inset.r = compact ? 6 : 6 * Math.min(scene.s, 1.7);
  const fit = storyEarthFit(STORY_EARTH_BOX, inset.w, inset.h);
  const Sa = Math.min(card.w / 0.37, card.h / 0.36);
  const target = storyEarthMapPoint({
    S: fit.S,
    lon: fit.lon,
    y: fit.y,
    mx: inset.x + inset.w / 2,
    my: inset.y + inset.h / 2
  }, STORY_EARTH_TARGET[0], STORY_EARTH_TARGET[1]);
  return {
    width: W,
    height: H,
    compact,
    still,
    skip,
    globe,
    keep,
    card,
    inset,
    scene,
    sun,
    clouds,
    k,
    maps: {
      a: Sa,
      b: Sa * 1.45,
      i: fit.S
    },
    insetMarker: target,
    fall: 1.05 * H
  };
};

// Orbit. At local 0 the globe has the view of the first frame. Then the globe turns and grows. A window opens at the
// North Sea marker. It grows into the card. The globe fades out. At local 1 the card shows the map that descent starts with.
const storyEarthOrbitCamera = (local, layout) => {
  const u = storyEarthClamp(local);
  const turn = storyEarthSmooth(u);
  const {
    globe,
    keep,
    card
  } = layout;
  const R = globe.R * (1 + 0.12 * turn);
  const dx = globe.cx - keep.x;
  const dy = globe.cy - keep.y;
  const length = Math.hypot(dx, dy) || 1;
  const cx = globe.cx + dx / length * (R - globe.R);
  const cy = globe.cy + dy / length * (R - globe.R);
  const lon = storyEarthMix(STORY_EARTH_VIEW0[0], STORY_EARTH_VIEW1[0], turn);
  const lat = storyEarthMix(STORY_EARTH_VIEW0[1], STORY_EARTH_VIEW1[1], turn);
  const at = storyEarthProject(storyEarthView(lon, lat), STORY_EARTH_TARGET[0], STORY_EARTH_TARGET[1], R, cx, cy);
  const open = storyEarthInOut((u - STORY_EARTH_OPEN) / (1 - STORY_EARTH_OPEN));
  let lens = null;
  if (open > 0) {
    const w = card.w * open;
    const h = card.h * open;
    const mx = storyEarthMix(at.x, card.cx, open);
    const my = storyEarthMix(at.y, card.cy, open);
    const first = globe.R * 1.05 * Math.cos(STORY_EARTH_TARGET[1] * STORY_EARTH_RAD);
    lens = {
      x: open >= 1 ? card.x : mx - w / 2,
      y: open >= 1 ? card.y : my - h / 2,
      w,
      h,
      r: Math.min(card.r, w / 2, h / 2),
      S: storyEarthGeo(first, layout.maps.a, open),
      mx,
      my
    };
  }
  return {
    lon,
    lat,
    R,
    cx,
    cy,
    marker: {
      x: at.x,
      y: at.y
    },
    alpha: 1 - storyEarthSmooth((u - 0.5) / 0.45),
    lens
  };
};

// Descent. The map zooms in until local 0.4. Then the card shrinks into the inset, and the side view comes up
// (fall goes from its full value to 0). From local 0.7 nothing moves, except the CO2 in the pipe.
const storyEarthDescentCamera = (local, layout) => {
  const u = storyEarthClamp(local);
  const zoom = storyEarthInOut(u / STORY_EARTH_ZOOM);
  const shrink = storyEarthInOut((u - STORY_EARTH_ZOOM) / (STORY_EARTH_HOLD - STORY_EARTH_ZOOM));
  const {
    card,
    inset,
    maps
  } = layout;
  const mx = storyEarthMix(card.cx, layout.insetMarker.x, shrink);
  const my = storyEarthMix(card.cy, layout.insetMarker.y, shrink);
  const lens = {
    x: storyEarthMix(card.x, inset.x, shrink),
    y: storyEarthMix(card.y, inset.y, shrink),
    w: storyEarthMix(card.w, inset.w, shrink),
    h: storyEarthMix(card.h, inset.h, shrink),
    r: storyEarthMix(card.r, inset.r, shrink),
    S: u < STORY_EARTH_ZOOM ? storyEarthGeo(maps.a, maps.b, zoom) : storyEarthGeo(maps.b, maps.i, shrink),
    mx,
    my
  };
  return {
    lens,
    shrink,
    fall: layout.fall * (1 - shrink)
  };
};
// ---- end story earth helpers

const STORY_EARTH_COLORS = {
  ringFar: '#dbe6ea',
  ringNear: '#e7eff2',
  oxygen: '#6e8793',
  night: '#14303a',
  sun: '#f1ead6',
  cloud: '#e9eff1',
  seaTop: '#3d6c7b',
  water: '#264b58',
  wave: '#5d8a98',
  cut: '#7fa4b1',
  young: '#d9cfae',
  deep: '#c0b698',
  white: '#ffffff'
};
const STORY_EARTH_FONT = 'Literata, Georgia, serif';

// ---- the land data: one request, one decode, shared by orbit and descent
const storyEarthLand = {
  state: 'idle',
  rings: [],
  version: 0
};
const storyEarthStills = new Map();

// Wakes the pinned stage. A scroll event makes it plan one frame.
const storyEarthWake = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('scroll'));
};

// The data arrives. The static frames draw again. The pinned stage draws again, because animated is true for one frame.
const storyEarthRefresh = () => {
  storyEarthStills.forEach((entry, canvas) => {
    if (!canvas.isConnected) storyEarthStills.delete(canvas);else storyPaint(entry.ctx, entry.id, entry.frame);
  });
  storyEarthWake();
};
const storyEarthLoad = () => {
  if (storyEarthLand.state !== 'idle') return;
  storyEarthLand.state = 'loading';
  fetch('assets/land-110m.json?v=1').then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }).then(topology => {
    storyEarthLand.rings = storyEarthDecode(topology).filter(ring => ring.length > 3).map(ring => storyEarthBuildRing(ring));
    storyEarthLand.state = 'ready';
    storyEarthLand.version++;
    storyEarthRefresh();
  }).catch(error => {
    storyEarthLand.state = 'failed';
    storyEarthLand.version++;
    console.error('The land data of the story did not load.', error);
  });
};

// A renderer is animated for one frame after the land data changes.
const storyEarthWatch = () => {
  let seen = -1;
  return {
    stale: () => seen !== storyEarthLand.version,
    mark: () => {
      seen = storyEarthLand.version;
    }
  };
};
const storyEarthKeepStill = (ctx, id, frame) => {
  if (frame.reducedMotion) storyEarthStills.set(ctx.canvas, {
    ctx,
    id,
    frame
  });
};

// ---- drawing
const storyEarthRoundRect = (ctx, x, y, w, h, r) => {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};
const storyEarthCloudPaths = new Map();
const storyEarthCloud = w => {
  if (!storyEarthCloudPaths.has(w)) {
    storyEarthCloudPaths.set(w, new Path2D(`M0,0 h${w} a9,9 0 0 0 -9,-9 a14,14 0 0 0 -26,-6 a12,12 0 0 0 -20,4 a9,9 0 0 0 -${w - 55},11 z`));
  }
  return storyEarthCloudPaths.get(w);
};

// The shapes of the platform, one set for each length of the legs.
const storyEarthPlatformShapes = new Map();
const storyEarthShapes = legDepth => {
  if (!storyEarthPlatformShapes.has(legDepth)) {
    const bay = (legDepth + 26) / 3;
    storyEarthPlatformShapes.set(legDepth, {
      legs: new Path2D(`M-17,${legDepth} L-12,-26 M17,${legDepth} L12,-26 M-6,${legDepth} L-4,-26 M6,${legDepth} L4,-26`),
      braces: [0, 1, 2].map(k => new Path2D(`M-15,${-26 + (k + 1) * bay} L14,${-26 + k * bay} M15,${-26 + (k + 1) * bay} L-14,${-26 + k * bay}`)),
      derrick: new Path2D('M15,-33 L20,-64 L25,-33 M16.5,-43 L23.5,-43 M18,-53 L22,-53'),
      crane: new Path2D('M-12,-47 L-12,-58 L-34,-50'),
      pad: new Path2D('M26,-36 L38,-36 L38,-31 L26,-31 Z')
    });
  }
  return storyEarthPlatformShapes.get(legDepth);
};

// The offshore platform that stands on (x, y). s is the scale. legDepth is the length of the legs under y.
const storyEarthPlatform = (ctx, x, y, s = 1, legDepth = 0) => {
  const shapes = storyEarthShapes(legDepth);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.fillStyle = STORY_COLORS.ink;
  ctx.lineWidth = 2.2 / Math.max(s, 1) * 1.4;
  ctx.stroke(shapes.legs);
  ctx.lineWidth = 1;
  shapes.braces.forEach(brace => ctx.stroke(brace));
  ctx.fillRect(-26, -33, 52, 7);
  ctx.fillStyle = STORY_COLORS.cream;
  ctx.fillRect(-22, -47, 19, 14);
  ctx.strokeRect(-22, -47, 19, 14);
  ctx.fillRect(-1, -42, 15, 9);
  ctx.strokeRect(-1, -42, 15, 9);
  ctx.lineWidth = 1.2;
  ctx.stroke(shapes.derrick);
  ctx.lineWidth = 1.4;
  ctx.stroke(shapes.crane);
  ctx.lineWidth = 1;
  ctx.fill(shapes.pad);
  ctx.stroke(shapes.pad);
  ctx.restore();
};
const storyEarthMarker = (ctx, x, y, size, label) => {
  ctx.beginPath();
  ctx.arc(x, y, 7 * size, 0, 2 * Math.PI);
  ctx.fillStyle = STORY_COLORS.co2;
  ctx.fill();
  ctx.lineWidth = 2 * size;
  ctx.strokeStyle = STORY_EARTH_COLORS.white;
  ctx.stroke();
  // At the globe the label is right and above the marker. In the inset it is below the marker, in the middle.
  ctx.font = `italic 400 ${14 * size}px ${STORY_EARTH_FONT}`;
  ctx.fillStyle = STORY_EARTH_COLORS.white;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const width = ctx.measureText('North Sea').width;
  // The label goes down first and then to the middle, so it does not cross the marker.
  ctx.fillText('North Sea', x + storyEarthMix(14 * size, -width / 2, storyEarthSmooth(label * 2 - 1)) + 8 * size * label, y + storyEarthMix(-10 * size, 23 * size, storyEarthSmooth(label * 2)));
};

// The land on the Mercator map, inside the current clip.
const storyEarthMapLand = (ctx, lens) => {
  const rings = storyEarthLand.rings;
  if (!rings.length) return;
  const map = {
    S: lens.S,
    lon: STORY_EARTH_TARGET[0] * STORY_EARTH_RAD,
    y: storyEarthMercY(STORY_EARTH_TARGET[1]),
    mx: lens.mx,
    my: lens.my
  };
  const lonOf = px => (map.lon + (px - map.mx) / map.S) / STORY_EARTH_RAD;
  const latOf = py => Math.atan(Math.sinh(map.y + (map.my - py) / map.S)) / STORY_EARTH_RAD;
  const west = lonOf(lens.x);
  const east = lonOf(lens.x + lens.w);
  const north = latOf(lens.y);
  const south = latOf(lens.y + lens.h);
  ctx.beginPath();
  for (const ring of rings) {
    const [minLon, minLat, maxLon, maxLat] = ring.bbox;
    if (maxLat < south || minLat > north) continue;
    for (let turn = -1; turn <= 1; turn++) {
      const shift = turn * 360;
      if (maxLon + shift < west || minLon + shift > east) continue;
      const offset = turn * 2 * Math.PI - map.lon;
      // The curve goes through the middle of each edge. The corners of the 110 m data become round.
      const n = ring.count;
      let px = map.mx + map.S * (ring.x[n - 1] + offset);
      let py = map.my - map.S * (ring.y[n - 1] - map.y);
      let qx = map.mx + map.S * (ring.x[0] + offset);
      let qy = map.my - map.S * (ring.y[0] - map.y);
      ctx.moveTo((px + qx) / 2, (py + qy) / 2);
      for (let i = 0; i < n; i++) {
        px = qx;
        py = qy;
        const next = (i + 1) % n;
        qx = map.mx + map.S * (ring.x[next] + offset);
        qy = map.my - map.S * (ring.y[next] - map.y);
        ctx.quadraticCurveTo(px, py, (px + qx) / 2, (py + qy) / 2);
      }
      ctx.closePath();
    }
  }
  ctx.fillStyle = STORY_COLORS.land;
  ctx.fill('evenodd');
};

// The map card: sea, land, outline and the North Sea marker.
const storyEarthDrawLens = (ctx, lens, layout, label, size) => {
  if (lens.w < 1 || lens.h < 1) return;
  ctx.save();
  ctx.beginPath();
  storyEarthRoundRect(ctx, lens.x, lens.y, lens.w, lens.h, lens.r);
  ctx.clip();
  ctx.fillStyle = STORY_COLORS.sea;
  ctx.fillRect(lens.x, lens.y, lens.w, lens.h);
  storyEarthMapLand(ctx, lens);
  ctx.restore();
  ctx.beginPath();
  storyEarthRoundRect(ctx, lens.x, lens.y, lens.w, lens.h, lens.r);
  ctx.lineWidth = 1.2 * layout.k;
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.stroke();
  storyEarthMarker(ctx, lens.mx, lens.my, size, label);
};

// The molecules of CO2 in the air. The numbers come from a fixed generator, so the picture is the same each time.
const storyEarthMolecules = (() => {
  let seed = 3;
  const next = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  return Array.from({
    length: 26
  }, () => ({
    angle: Math.PI * (1.06 + next() * 0.88),
    lift: 6 + next() * 24,
    turn: next() * Math.PI
  }));
})();
const storyEarthDrawGlobe = (ctx, layout, camera) => {
  const {
    cx,
    cy,
    R,
    alpha
  } = camera;
  const fade = 1 - alpha;
  const sky = STORY_COLORS.sky;
  const tint = color => storyEarthTint(color, sky, fade);
  const k = R / 330;
  ctx.fillStyle = tint(STORY_EARTH_COLORS.ringFar);
  ctx.beginPath();
  ctx.arc(cx, cy, R + 34 * k, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = tint(STORY_EARTH_COLORS.ringNear);
  ctx.beginPath();
  ctx.arc(cx, cy, R + 16 * k, 0, 2 * Math.PI);
  ctx.fill();
  const size = Math.min(k, 2);
  for (const molecule of storyEarthMolecules) {
    const x = cx + Math.cos(molecule.angle) * (R + molecule.lift * k);
    const y = cy + Math.sin(molecule.angle) * (R + molecule.lift * k);
    if (x < -20 || x > layout.width + 20 || y < -20 || y > layout.height + 20) continue;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(molecule.turn);
    ctx.fillStyle = tint(STORY_EARTH_COLORS.oxygen);
    ctx.beginPath();
    ctx.arc(-4.6 * size, 0, 2.6 * size, 0, 2 * Math.PI);
    ctx.moveTo(7.2 * size, 0);
    ctx.arc(4.6 * size, 0, 2.6 * size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = tint(STORY_COLORS.ink);
    ctx.beginPath();
    ctx.arc(0, 0, 2.9 * size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = tint(STORY_COLORS.sea);
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 2 * Math.PI);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 2 * Math.PI);
  ctx.clip();
  const view = storyEarthView(camera.lon, camera.lat);
  const out = [];
  ctx.beginPath();
  for (const ring of storyEarthLand.rings) {
    out.length = 0;
    if (!storyEarthClipRing(ring.xyz, view, R, cx, cy, out)) continue;
    storyEarthTrace(ctx, out);
  }
  ctx.fillStyle = tint(STORY_COLORS.land);
  ctx.fill('evenodd');
  // The night side: a flat, translucent shape. It is the disc without a circle that is a little to the left.
  ctx.beginPath();
  ctx.rect(cx - R, cy - R, 2 * R, 2 * R);
  ctx.moveTo(cx - 0.35 * R + R, cy);
  ctx.arc(cx - 0.35 * R, cy, R, 0, 2 * Math.PI);
  ctx.fillStyle = `rgba(20, 48, 58, ${0.45 * alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
};
const storyEarthFill = (ctx, layout) => {
  ctx.fillStyle = STORY_COLORS.sky;
  ctx.fillRect(0, 0, layout.width, layout.height);
};
STORY_RENDERERS.orbit = (() => {
  const watch = storyEarthWatch();
  return {
    get animated() {
      return watch.stale();
    },
    draw(ctx, frame) {
      storyEarthLoad();
      watch.mark();
      storyEarthKeepStill(ctx, 'orbit', frame);
      const layout = storyEarthLayout(frame.width, frame.height, frame.reducedMotion);
      const camera = storyEarthOrbitCamera(frame.reducedMotion ? 0 : frame.local, layout);
      storyEarthFill(ctx, layout);
      if (camera.alpha > 0) storyEarthDrawGlobe(ctx, layout, camera);
      if (camera.lens) storyEarthDrawLens(ctx, camera.lens, layout, 0, layout.k);else storyEarthMarker(ctx, camera.marker.x, camera.marker.y, layout.k, 0);
    }
  };
})();

// The side view. Units are the 800 by 450 units of the storyboard. The sea is at y = 232 to 310, the sea floor at 396.
const storyEarthDrawScene = (ctx, layout, state, time) => {
  const {
    s,
    ox,
    oy
  } = layout.scene;
  const W = layout.width;
  const H = layout.height;
  const fall = state.fall;
  const x0 = -ox / s - 4;
  const x1 = (W - ox) / s + 4;
  const bottom = (H - oy - fall) / s + 4;
  const C = STORY_EARTH_COLORS;
  // The sun is far away, so it moves only a little. The high clouds move faster than the scene.
  ctx.fillStyle = C.sun;
  ctx.beginPath();
  ctx.arc(layout.sun.x, layout.sun.y + fall * 0.12, layout.sun.r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = C.cloud;
  [[0.12, -0.1, 120], [0.4, -0.32, 96], [0.18, -0.55, 140], [0.55, -0.74, 110], [0.08, -0.95, 100], [0.7, -0.4, 120]].forEach(([fx, fy, w]) => {
    ctx.save();
    ctx.translate(fx * W, fy * H + fall * 1.2);
    ctx.scale(s, s);
    ctx.fill(storyEarthCloud(w));
    ctx.restore();
  });
  ctx.save();
  ctx.translate(ox, oy + fall);
  ctx.scale(s, s);
  ctx.fillStyle = C.cloud;
  layout.clouds.forEach(([x, y, w]) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.fill(storyEarthCloud(w));
    ctx.restore();
  });
  if (oy + fall + 232 * s < H) {
    ctx.fillStyle = C.seaTop;
    ctx.fillRect(x0, 232, x1 - x0, 78);
    let seed = 9;
    const next = () => (seed = seed * 16807 % 2147483647) / 2147483647;
    ctx.beginPath();
    for (let n = 0, count = Math.round(34 * (x1 - x0) / 800); n < count; n++) {
      const y = 238 + next() * 66;
      const x = x0 + next() * (x1 - x0);
      ctx.moveTo(x, y);
      ctx.lineTo(x + 8 + (y - 232) * 0.35, y);
    }
    ctx.strokeStyle = C.wave;
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.fillStyle = C.water;
    ctx.fillRect(x0, 310, x1 - x0, bottom - 310);
    ctx.fillStyle = C.young;
    ctx.beginPath();
    ctx.moveTo(x0, 396);
    ctx.lineTo(0, 396);
    ctx.bezierCurveTo(120, 390, 240, 400, 400, 394);
    ctx.bezierCurveTo(560, 388, 660, 388, 800, 396);
    ctx.lineTo(x1, 396);
    ctx.lineTo(x1, bottom);
    ctx.lineTo(x0, bottom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.deep;
    ctx.beginPath();
    ctx.moveTo(x0, 424);
    ctx.lineTo(0, 424);
    ctx.bezierCurveTo(160, 420, 300, 428, 460, 422);
    ctx.bezierCurveTo(620, 416, 700, 418, 800, 424);
    ctx.lineTo(x1, 424);
    ctx.lineTo(x1, bottom);
    ctx.lineTo(x0, bottom);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x0, 310);
    ctx.lineTo(x1, 310);
    ctx.strokeStyle = C.cut;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Pipeline from shore, riser up the jacket, well that goes on down. The ink pipe goes first; the CO2 dashes go on top.
    const pipe = () => {
      ctx.beginPath();
      ctx.moveTo(x0, 399);
      ctx.lineTo(0, 399);
      ctx.bezierCurveTo(150, 393, 300, 402, 470, 396);
      ctx.lineTo(520, 396);
    };
    const riser = () => {
      ctx.beginPath();
      ctx.moveTo(520, 396);
      ctx.lineTo(538, 396);
      ctx.lineTo(538, 300);
    };
    const well = () => {
      ctx.beginPath();
      ctx.moveTo(548, 290);
      ctx.lineTo(548, bottom);
    };
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.lineWidth = 5;
    pipe();
    ctx.stroke();
    ctx.lineWidth = 4;
    riser();
    ctx.stroke();
    well();
    ctx.stroke();
    // The dashes move with the time: 28 units in one second.
    const flow = -(time * 0.028);
    ctx.lineCap = 'butt';
    ctx.strokeStyle = STORY_COLORS.co2;
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 7]);
    ctx.lineDashOffset = flow;
    pipe();
    ctx.stroke();
    riser();
    ctx.stroke();
    ctx.lineWidth = 1.6;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = flow;
    well();
    ctx.stroke();
    ctx.setLineDash([]);
    storyEarthPlatform(ctx, 548, 300, 2.3, 42);
    ctx.font = `italic 400 12.5px ${STORY_EARTH_FONT}`;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.fillStyle = STORY_COLORS.cream;
    ctx.fillText(layout.compact ? 'CO₂ pipeline' : 'CO₂ pipeline from shore', layout.compact ? x0 + 14 : 30, 386);
    ctx.fillStyle = STORY_COLORS.ink;
    ctx.fillText('Injection well', 560, 440);
  }
  ctx.restore();
};
STORY_RENDERERS.descent = (() => {
  const watch = storyEarthWatch();
  let running = false;
  return {
    get animated() {
      return running || watch.stale();
    },
    draw(ctx, frame) {
      storyEarthLoad();
      watch.mark();
      storyEarthKeepStill(ctx, 'descent', frame);
      const hold = !frame.reducedMotion && frame.local >= STORY_EARTH_HOLD;
      if (hold && !running) {
        running = true;
        storyEarthWake();
      } else if (!hold) running = false;
      const layout = storyEarthLayout(frame.width, frame.height, frame.reducedMotion);
      const state = storyEarthDescentCamera(frame.local, layout);
      storyEarthFill(ctx, layout);
      if (state.shrink > 0) storyEarthDrawScene(ctx, layout, state, frame.time);
      const size = storyEarthMix(layout.k, 0.8 * (layout.compact ? 1 : Math.min(layout.scene.s, 1.7)), state.shrink);
      storyEarthDrawLens(ctx, state.lens, layout, state.shrink, size);
    }
  };
})();
Object.assign(window, {
  storyEarthPlatform,
  storyEarthLayout
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

// File: StoryBlock.jsx
// StoryBlock.jsx — the art of the chapters grid, ve and live.
// The three chapters draw one 3D corner-point block of the gas field (story-geometry.js):
//   grid  The grid draws onto the rock. Then the 3D run plays from the stored frames, years 0 to 30.
//   ve    The horizontal cell boundaries fade. Each column is one tall cell with a sharp interface at h.
//   live  The same block runs live in story-worker.js. The mount function builds the controls.
// The block is built when the stage size changes. A draw only reads the polygons and changes colours.
// The renderer API is at the top of StoryStage.jsx.

// ---- story block helpers (pure; tests/story-block.test.js evaluates this block)
const STORY_BLOCK_HEADER = 64;
const STORY_BLOCK_NARROW = 640;
const STORY_BLOCK_GRID_YEARS = 30;
const STORY_BLOCK_RUN_MINUTES = 18 * 60 + 40;
const STORY_BLOCK_RATE = 4;
const STORY_BLOCK_KINDS = 5;
const STORY_BLOCK_STEPS = 24;
const STORY_BLOCK_BANDS = 5;
const STORY_BLOCK_BAND_MAX = 0.6;
const STORY_BLOCK_TOPS = 17;
const STORY_BLOCK_TONES = STORY_BLOCK_TOPS + 2;
const STORY_BLOCK_EAST = STORY_BLOCK_TOPS;
const STORY_BLOCK_NORTH = STORY_BLOCK_TOPS + 1;
const STORY_BLOCK_FACE_EAST = 1;
const STORY_BLOCK_FACE_NORTH = 2;
const storyBlockEase = t => {
  const x = storyClamp(t);
  return x * x * (3 - 2 * x);
};

// The colour between two #rrggbb colours.
const storyBlockMix = (from, to, t) => {
  let out = '#';
  for (let i = 1; i < 7; i += 2) {
    const a = parseInt(from.slice(i, i + 2), 16);
    const b = parseInt(to.slice(i, i + 2), 16);
    out += Math.round(a + (b - a) * t).toString(16).padStart(2, '0');
  }
  return out;
};

// A positive amount darkens the colour. A negative amount lightens it.
const storyBlockTint = (hex, amount) => amount >= 0 ? storyBlockMix(hex, '#000000', amount) : storyBlockMix(hex, '#ffffff', -amount);
const storyBlockInt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// Grid size. A phone gets fewer cells.
const storyBlockResolution = width => width <= STORY_BLOCK_NARROW ? {
  nx: 20,
  ny: 12,
  nz: 4
} : {
  nx: 30,
  ny: 18,
  nz: 5
};

// Where the block and the text stand in a stage of width x height pixels.
// - box: the area for the block and its labels. On a wide stage it stays right of the captions
//   (bottom left) and above the controls. On a narrow stage it stays below the caption band.
// - fit: the area for the block itself, inside the box.
// - clock: top left corner of the run clock and the counter.
// - view: angles in radians and the share of the width that the depth takes (see storyBlockExaggeration).
// A reduced-motion frame is a 16:9 canvas with its captions below it, so only the run clock is kept clear.
const storyBlockLayout = (width, height, reduced = false, captions = {
  top: 150,
  bottom: 190
}) => {
  const narrow = width <= STORY_BLOCK_NARROW;
  const scale = narrow ? 0.7 : storyClamp(width / 1280, 0.7, 1.25);
  const fonts = {
    label: narrow ? 12 : storyClamp(width * 0.0105 + 1, 13, 17),
    big: narrow ? reduced ? 17 : 24 : storyClamp(width * 0.034, 28, 52),
    small: narrow ? reduced ? 11 : 13 : storyClamp(width * 0.0125 + 2, 14, 20)
  };
  let box;
  let clock;
  let inset = {
    top: Math.round(58 * scale),
    bottom: Math.round(30 * scale),
    side: Math.round(14 * scale)
  };
  const keeps = [];
  if (reduced && narrow) {
    box = {
      x0: 6,
      y0: 52,
      x1: width - 6,
      y1: height - 4
    };
    clock = {
      x: 10,
      y: 8
    };
    inset = {
      top: 26,
      bottom: 14,
      side: 8
    };
  } else if (reduced) {
    box = {
      x0: Math.round(width * 0.03),
      y0: 6,
      x1: width - Math.round(width * 0.03),
      y1: height - 6
    };
    clock = {
      x: Math.round(width * 0.04),
      y: Math.round(height * 0.07)
    };
    inset = {
      top: Math.round(34 * scale),
      bottom: Math.round(22 * scale),
      side: Math.round(10 * scale)
    };
    keeps.push({
      x0: 0,
      y0: 0,
      x1: clock.x + Math.round(width * 0.3),
      y1: clock.y + fonts.big * 1.18 + fonts.small * 2.8 + 10
    });
  } else if (narrow) {
    const band = STORY_BLOCK_HEADER + 64 + Math.max(captions.top, captions.bottom) + 12;
    box = {
      x0: 12,
      y0: band,
      x1: width - 12,
      y1: height - 118
    };
    clock = {
      x: 16,
      y: height - 104
    };
  } else {
    box = {
      x0: Math.round(width * 0.12),
      y0: STORY_BLOCK_HEADER + 8,
      x1: width - Math.round(width * 0.03),
      y1: height - 104
    };
    clock = {
      x: Math.round(width * 0.055),
      y: Math.max(Math.round(height * 0.09), STORY_BLOCK_HEADER + 16)
    };
    const wordsBottom = Math.max(clock.y + fonts.big * 1.18 + fonts.small * 2.8, clock.y + captions.top) + 12;
    keeps.push({
      x0: 0,
      y0: height - Math.round(height * 0.06) - 12 - captions.bottom - 12,
      x1: Math.round(width * 0.325) + 12,
      y1: height
    });
    keeps.push({
      x0: 0,
      y0: 0,
      x1: Math.round(width * 0.375) + 12,
      y1: wordsBottom
    });
  }
  const fit = {
    x0: box.x0 + inset.side,
    y0: box.y0 + inset.top,
    x1: box.x1 - inset.side,
    y1: box.y1 - inset.bottom
  };
  const view = narrow && !reduced ? {
    theta: 1.15,
    elevation: 0.95,
    zFrac: 0.2
  } : {
    theta: 0.49,
    elevation: 0.72,
    zFrac: 0.15
  };
  return {
    narrow,
    reduced,
    scale,
    fonts,
    box,
    fit,
    keeps,
    clock,
    view,
    line: narrow ? 0.6 : 0.8
  };
};

// The height in px that the captions of the story use, estimated from their length and the caption font of the
// stylesheet. The estimate is a little high, so the art keeps clear of the words. copy is SITE_STORY.captions.
// bottom: the captions of grid and ve (bottom left). top: the captions of live and its buttons (top left).
const storyBlockCaptionHeights = (width, copy) => {
  const narrow = width <= STORY_BLOCK_NARROW;
  const font = storyClamp(width * 0.0145 + 6, 17, 26);
  const perLine = Math.max(8, Math.floor((narrow ? width - 32 : width * 0.27) / (font * 0.55)));
  const lines = ids => Math.max(...ids.map(id => Math.max(...(copy[id] || ['']).map(text => Math.ceil(text.length / perLine)))));
  return {
    bottom: Math.round(lines(['grid', 've']) * font * 1.5),
    top: Math.round(lines(['live']) * font * 1.5 + 64)
  };
};

// True when no point (pu[k], pv[k]) falls inside a keep rectangle after the fit.
const storyBlockClear = (pu, pv, fit, keeps) => {
  for (let k = 0; k < pu.length; k++) {
    const x = fit.ox + pu[k] * fit.scale;
    const y = fit.oy + pv[k] * fit.scale;
    for (let n = 0; n < keeps.length; n++) {
      if (x > keeps[n].x0 && x < keeps[n].x1 && y > keeps[n].y0 && y < keeps[n].y1) return false;
    }
  }
  return true;
};

// The screen vectors of the east axis, the north axis and the vertical axis, in unit lengths.
// The viewer stands north-east of the block and looks down at the angle `elevation`.
const storyBlockAxes = view => ({
  ex: Math.cos(view.theta),
  ey: Math.sin(view.theta) * Math.sin(view.elevation),
  nx: -Math.sin(view.theta),
  ny: Math.cos(view.theta) * Math.sin(view.elevation),
  zy: Math.cos(view.elevation)
});

// The depth is drawn larger than it is. This factor makes the depth span take `zFrac` of the block width.
// windowKm is the size of the map window in km. spanM is the depth span of the grid in m.
const storyBlockExaggeration = (view, windowKm, spanM) => {
  const wide = windowKm.width * Math.abs(Math.cos(view.theta)) + windowKm.height * Math.abs(Math.sin(view.theta));
  return view.zFrac * wide / (Math.max(1, spanM) / 1000);
};

// Scale and offset that fit the bounds { u0, u1, v0, v1 } into the region, centred.
const storyBlockFit = (bounds, region) => {
  const w = Math.max(1e-9, bounds.u1 - bounds.u0);
  const h = Math.max(1e-9, bounds.v1 - bounds.v0);
  const scale = Math.max(1e-6, Math.min((region.x1 - region.x0) / w, (region.y1 - region.y0) / h));
  return {
    scale,
    ox: region.x0 + (region.x1 - region.x0 - w * scale) / 2 - bounds.u0 * scale,
    oy: region.y0 + (region.y1 - region.y0 - h * scale) / 2 - bounds.v0 * scale
  };
};

// The largest fit that keeps clear of the rectangles. The left edge of the region moves right in steps, up to its middle.
const storyBlockPlace = (pu, pv, bounds, region, keeps, steps = 10) => {
  let fit = null;
  for (let s = 0; s <= steps; s++) {
    fit = storyBlockFit(bounds, {
      ...region,
      x0: region.x0 + (region.x1 - region.x0) * 0.5 * s / steps
    });
    if (storyBlockClear(pu, pv, fit, keeps)) break;
  }
  return fit;
};

// The index of the cell interval of the sorted edges that holds the value.
const storyBlockLocate = (edges, value) => {
  let lo = 0;
  let hi = edges.length - 2;
  while (lo < hi) {
    const mid = lo + hi + 1 >> 1;
    if (edges[mid] <= value) lo = mid;else hi = mid - 1;
  }
  return lo;
};
const storyBlockNearest = (edges, value) => {
  let best = 1;
  for (let i = 2; i < edges.length - 1; i++) if (Math.abs(edges[i] - value) < Math.abs(edges[best] - value)) best = i;
  return best;
};

// The cut-away quarter: the columns with i >= icut and j >= jcut are not drawn. The corner is at (x, y) km.
const storyBlockCut = (xs, ys, x, y) => ({
  icut: storyBlockNearest(xs, x),
  jcut: storyBlockNearest(ys, y)
});

// The columns that stay, from the back to the front. The viewer is north-east, so a column hides only columns
// with a smaller i + j.
const storyBlockOrder = (nx, ny, cut) => {
  const order = new Int32Array(nx * ny);
  let n = 0;
  for (let d = 0; d <= nx + ny - 2; d++) {
    for (let i = Math.max(0, d - ny + 1); i <= Math.min(d, nx - 1); i++) {
      const j = d - i;
      if (i >= cut.icut && j >= cut.jcut) continue;
      order[n++] = j * nx + i;
    }
  }
  return order.subarray(0, n);
};

// Which side faces of each column are visible. The east face (bit 1) and the north face (bit 2) show at the
// edge of the block, at the cut and where the depth of the neighbour is different (the fault).
const storyBlockFaces = (top, nx, ny, cut, tolerance = 2) => {
  const flags = new Uint8Array(nx * ny);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      if (i >= cut.icut && j >= cut.jcut) continue;
      const c = j * nx + i;
      let east = i === nx - 1 || i + 1 >= cut.icut && j >= cut.jcut;
      if (!east) {
        const n = 4 * (c + 1);
        east = Math.abs(top[4 * c + 1] - top[n]) > tolerance || Math.abs(top[4 * c + 2] - top[n + 3]) > tolerance;
      }
      let north = j === ny - 1 || j + 1 >= cut.jcut && i >= cut.icut;
      if (!north) {
        const n = 4 * (c + nx);
        north = Math.abs(top[4 * c + 2] - top[n + 1]) > tolerance || Math.abs(top[4 * c + 3] - top[n]) > tolerance;
      }
      flags[c] = (east ? STORY_BLOCK_FACE_EAST : 0) | (north ? STORY_BLOCK_FACE_NORTH : 0);
    }
  }
  return flags;
};

// The light comes from the back left. A top face that rises toward the viewer is lighter. Result: 0 to 16.
const storyBlockTone = slope => storyClamp(Math.round(4 - 6.4 * slope), 0, STORY_BLOCK_TOPS - 1);

// The share of cell k (0 is the top cell) that the gas fills, when the gas is h of the column (0 to 1).
const storyBlockCellFill = (h, k, nz) => storyClamp(h * nz - k);

// 0 for no gas, else 1 to 5: the band of h on the top face.
const storyBlockBand = h => h < 0.02 ? 0 : 1 + Math.min(STORY_BLOCK_BANDS - 1, Math.floor(h / STORY_BLOCK_BAND_MAX * STORY_BLOCK_BANDS));

// The colour of the gas for a methane share from 0 (CO2) to 1 (methane).
const storyBlockKind = share => Math.round(storyClamp(share) * (STORY_BLOCK_KINDS - 1));

// The run clock of a typical field model that takes 18 h 40 min for 30 years.
const storyBlockClock = fraction => {
  const minutes = Math.round(storyClamp(fraction) * STORY_BLOCK_RUN_MINUTES);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min`;
};

// Chapter grid. Local 0 to 0.3 draws the grid: pillars first, then layers. Local 0.3 to 1 plays the years 0 to 30.
const storyBlockGrid = (local, s = {}) => {
  const l = storyClamp(local);
  s.pillars = storyBlockEase(l / 0.15);
  s.layers = storyClamp((l - 0.15) / 0.15);
  s.gas = storyBlockEase((l - 0.3) / 0.05);
  s.labels = storyBlockEase((l - 0.28) / 0.08);
  s.year = l <= 0.3 ? 0 : Math.min(STORY_BLOCK_GRID_YEARS, STORY_BLOCK_GRID_YEARS * (l - 0.3) / 0.7);
  s.sharp = 0;
  s.bands = 0;
  s.bracket = 0;
  s.clockAlpha = storyBlockEase((l - 0.3) / 0.04) * (1 - storyBlockEase((l - 0.96) / 0.04));
  s.counter = 0;
  s.counterAlpha = 0;
  return s;
};

// Chapter ve, at year 30. Local 0 to 0.5: the layer lines fade and each column gets a sharp interface.
// Local 0.5 to 1: the top face shows h as bands, a bracket marks h, and the counter goes from cells to columns.
const storyBlockVe = (local, s = {}) => {
  const l = storyClamp(local);
  s.pillars = 1;
  s.layers = 1;
  s.gas = 1;
  s.labels = 1;
  s.year = STORY_BLOCK_GRID_YEARS;
  s.sharp = storyBlockEase(l / 0.5);
  s.bands = storyBlockEase((l - 0.5) / 0.15);
  s.bracket = storyBlockEase((l - 0.6) / 0.15);
  s.clockAlpha = 0;
  s.counter = l;
  s.counterAlpha = storyBlockEase(l / 0.04);
  return s;
};

// Chapter live. cells is 0 for the VE columns and 1 for the 3D cells. The notes of chapter ve fade out first.
const storyBlockLive = (local, cells, year, s = {}) => {
  const note = 1 - storyBlockEase(storyClamp(local) / 0.1);
  s.pillars = 1;
  s.layers = 1;
  s.gas = 1;
  s.labels = 1;
  s.year = year;
  s.sharp = 1 - cells;
  s.bands = 1 - cells;
  s.bracket = note * (1 - cells);
  s.clockAlpha = 0;
  s.counter = 1;
  s.counterAlpha = note;
  return s;
};

// The counter of chapter ve. At local 0.5 it shows the cells. At local 1 it shows the columns to solve.
const storyBlockCounter = (cells, columns, local) => {
  const t = storyClamp((local - 0.5) / 0.5);
  const e = storyBlockEase(t);
  const count = storyBlockInt(cells + (columns - cells) * e);
  if (t <= 0) return {
    big: `${storyBlockInt(cells)} cells`,
    small: 'in this 3D model'
  };
  if (t >= 1) return {
    big: `${storyBlockInt(columns)} columns`,
    small: `to solve, not ${storyBlockInt(cells)} cells`
  };
  return e < 0.5 ? {
    big: `${count} cells`,
    small: 'in this 3D model'
  } : {
    big: `${count} columns`,
    small: 'to solve in the VE model'
  };
};

// Position of a year among the sorted years of the frames. Fills out with lo, hi and t.
const storyBlockFramePair = (years, year, out = {}) => {
  const last = years.length - 1;
  if (!(year > years[0])) {
    out.lo = 0;
    out.hi = 0;
    out.t = 0;
  } else if (year >= years[last]) {
    out.lo = last;
    out.hi = last;
    out.t = 0;
  } else {
    let i = 0;
    while (years[i + 1] <= year) i++;
    out.lo = i;
    out.hi = i + 1;
    out.t = (year - years[i]) / (years[i + 1] - years[i]);
  }
  return out;
};

// Blend the columns of two frames. The methane share uses the gas thickness as weight.
const storyBlockBlend = (out, a, b, t) => {
  for (let c = 0; c < out.h.length; c++) {
    const ha = a.h[c] * (1 - t);
    const hb = b.h[c] * t;
    out.h[c] = ha + hb;
    out.ch4[c] = ha + hb > 1e-6 ? (ha * a.ch4[c] + hb * b.ch4[c]) / (ha + hb) : 0;
  }
  return out;
};

// Time step of the player in ms. A long gap (a hidden tab) counts as 250 ms.
const storyBlockStep = (time, last) => last === null ? 0 : storyClamp(time - last, 0, 250);
const storyBlockAdvance = (year, dtMs, lastYear, rate = STORY_BLOCK_RATE) => Math.min(lastYear, year + dtMs / 1000 * rate);

// All colours of the block as arrays of strings. A draw only reads them.
// - rock[tone]; fill[(kind * TONES + tone) * (STEPS + 1) + step]; band[(kind * BANDS + band - 1) * TOPS + tone]
// - gas[kind]; edge[kind]; line[i] is the grid line colour with the alpha i / 20.
const storyBlockPalette = colors => {
  const shades = [];
  for (let k = 0; k < STORY_BLOCK_TOPS; k++) shades.push(-0.06 + 0.02 * k);
  shades.push(0.22, 0.1);
  const gas = [];
  for (let k = 0; k < STORY_BLOCK_KINDS; k++) gas.push(storyBlockMix(colors.co2, colors.ch4, k / (STORY_BLOCK_KINDS - 1)));
  const rock = shades.map(shade => storyBlockTint(colors.sand, shade));
  const fill = [];
  const band = [];
  for (let kind = 0; kind < STORY_BLOCK_KINDS; kind++) {
    const light = storyBlockMix(gas[kind], '#ffffff', 0.62);
    for (let tone = 0; tone < STORY_BLOCK_TONES; tone++) {
      for (let step = 0; step <= STORY_BLOCK_STEPS; step++) {
        fill.push(storyBlockTint(step === 0 ? colors.sand : storyBlockMix(light, gas[kind], step / STORY_BLOCK_STEPS), shades[tone]));
      }
    }
    const ramp = [storyBlockMix(gas[kind], '#ffffff', 0.78), storyBlockMix(gas[kind], '#ffffff', 0.55), storyBlockMix(gas[kind], '#ffffff', 0.28), gas[kind], storyBlockTint(gas[kind], 0.38)];
    for (let b = 0; b < STORY_BLOCK_BANDS; b++) for (let tone = 0; tone < STORY_BLOCK_TOPS; tone++) band.push(storyBlockTint(ramp[b], shades[tone]));
  }
  const rgb = [1, 3, 5].map(i => parseInt(colors.grid.slice(i, i + 2), 16));
  const line = [];
  for (let i = 0; i <= 20; i++) line.push(`rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${(i / 20).toFixed(2)})`);
  return {
    gas,
    rock,
    fill,
    band,
    edge: gas.map(color => storyBlockTint(color, 0.45)),
    line
  };
};
// ---- end story block helpers

const STORY_BLOCK_FONT = "'Literata', Georgia, 'Times New Roman', serif";
const STORY_BLOCK_RUN_URL = './assets/story-run.json';
const STORY_BLOCK_WORKER_URL = './story-worker.js?v=1';

// Shared state of the three renderers. They draw one block at a time.
const storyBlockState = {
  block: null,
  builds: 0,
  palette: null,
  scene: {},
  replays: [],
  waiting: []
};

// The model frames. stored comes from assets/story-run.json (years in STORY_YEARS).
// live comes from story-worker.js (one frame for each year). An entry holds the model grid h and ch4,
// and cols, the same data on the columns of the block grid.
const storyBlockData = {
  stored: {
    status: 'idle',
    entries: [],
    years: []
  },
  live: {
    status: 'idle',
    entries: [],
    years: [],
    complete: false,
    worker: null,
    run: 0
  }
};
const storyBlockBind = (entry, block) => {
  entry.cols = StoryGeometry.storyColumns(entry, block.grid);
  entry.colsKey = block.id;
};
const storyBlockBindAll = block => {
  storyBlockData.stored.entries.forEach(entry => storyBlockBind(entry, block));
  storyBlockData.live.entries.forEach(entry => entry && storyBlockBind(entry, block));
};

// The screen position of a point inside a column: fx and fy from 0 to 1 (east and north), depth from 0 (top) to 1 (base).
const storyBlockPoint = (block, column, fx, fy, depth = 0) => {
  const o = 4 * column;
  const w0 = (1 - fx) * (1 - fy);
  const w1 = fx * (1 - fy);
  const w2 = fx * fy;
  const w3 = (1 - fx) * fy;
  const at = xs => xs[o] * w0 + xs[o + 1] * w1 + xs[o + 2] * w2 + xs[o + 3] * w3;
  const top = at(block.YT);
  return [at(block.X), top + (at(block.YB) - top) * depth];
};

// The screen position of the map point (x, y) in km on the top of the block.
const storyBlockAt = (block, x, y) => {
  const {
    grid
  } = block;
  const i = storyBlockLocate(grid.xs, x);
  const j = storyBlockLocate(grid.ys, y);
  const fx = storyClamp((x - grid.xs[i]) / (grid.xs[i + 1] - grid.xs[i]));
  const fy = storyClamp((y - grid.ys[j]) / (grid.ys[j + 1] - grid.ys[j]));
  return storyBlockPoint(block, j * grid.nx + i, fx, fy, 0);
};

// Labels of the art. at is the map point in km. wide and tall give the leader as [dx, dy, align], with dx and dy
// as shares of the block width, for the wide view and for the tall view of a phone. The well has its own height.
const STORY_BLOCK_LABELS = [{
  id: 'cap',
  text: 'Gas cap (methane)',
  short: 'Gas cap',
  at: [9.25, 5.8],
  wide: [0.07, -0.2, 'center'],
  tall: [0.3, -0.17, 'start']
}, {
  id: 'co2',
  text: 'CO₂',
  short: 'CO₂',
  at: [16.9, 4.4],
  wide: [0.07, -0.15, 'start'],
  tall: [0.16, -0.2, 'start']
}, {
  id: 'fault',
  text: 'Fault',
  short: 'Fault',
  at: [6.5, 8.0],
  wide: [-0.08, -0.11, 'end'],
  tall: [-0.08, -0.11, 'end']
}];
const STORY_BLOCK_WELL_UP = {
  wide: 0.2,
  tall: 0.3
};

// Build the polygons of the block for one stage size. The draw loop reads these arrays.
const storyBlockBuild = (width, height, reduced, captions) => {
  const layout = storyBlockLayout(width, height, reduced, captions);
  const {
    nx,
    ny,
    nz
  } = storyBlockResolution(width);
  const grid = StoryGeometry.storyGrid(nx, ny, nz);
  const scenario = StoryGeometry.STORY_SCENARIO;
  const count = grid.columns;
  const cut = storyBlockCut(grid.xs, grid.ys, scenario.dome.x + 0.25, scenario.wellY + 0.25);
  const axes = storyBlockAxes(layout.view);
  const win = grid.window;
  let minTop = Infinity;
  let maxBase = -Infinity;
  for (let c = 0; c < count; c++) {
    for (let k = 0; k < 4; k++) {
      minTop = Math.min(minTop, grid.top[4 * c + k]);
      maxBase = Math.max(maxBase, grid.top[4 * c + k] + grid.thickness[4 * c + k]);
    }
  }
  const exaggeration = storyBlockExaggeration(layout.view, {
    width: win.x1 - win.x0,
    height: win.y1 - win.y0
  }, maxBase - minTop);

  // Unit coordinates in km: u to the right, v down. Then the fit scales them to pixels.
  const U = new Float64Array(4 * count);
  const VT = new Float64Array(4 * count);
  const VB = new Float64Array(4 * count);
  const tone = new Uint8Array(count);
  const bounds = {
    u0: Infinity,
    u1: -Infinity,
    v0: Infinity,
    v1: -Infinity
  };
  const pu = [];
  const pv = [];
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const c = j * nx + i;
      const kept = !(i >= cut.icut && j >= cut.jcut);
      const cx = [grid.xs[i], grid.xs[i + 1], grid.xs[i + 1], grid.xs[i]];
      const cy = [grid.ys[j], grid.ys[j], grid.ys[j + 1], grid.ys[j + 1]];
      const rise = new Array(4);
      for (let k = 0; k < 4; k++) {
        const o = 4 * c + k;
        const east = cx[k] - win.x0;
        const north = cy[k] - win.y0;
        const flat = east * axes.ey + north * axes.ny;
        const dTop = (grid.top[o] - minTop) / 1000 * exaggeration * axes.zy;
        const dBase = (grid.top[o] + grid.thickness[o] - minTop) / 1000 * exaggeration * axes.zy;
        U[o] = east * axes.ex + north * axes.nx;
        VT[o] = flat + dTop;
        VB[o] = flat + dBase;
        rise[k] = -dTop;
        if (kept) {
          bounds.u0 = Math.min(bounds.u0, U[o]);
          bounds.u1 = Math.max(bounds.u1, U[o]);
          bounds.v0 = Math.min(bounds.v0, VT[o]);
          bounds.v1 = Math.max(bounds.v1, VB[o]);
          pu.push(U[o], U[o]);
          pv.push(VT[o], VB[o]);
        }
      }
      const cell = Math.max(1e-6, (grid.xs[i + 1] - grid.xs[i] + (grid.ys[j + 1] - grid.ys[j])) / 2);
      tone[c] = storyBlockTone(((rise[1] - rise[0] + rise[2] - rise[3]) / 2 + (rise[3] - rise[0] + rise[2] - rise[1]) / 2) / cell);
    }
  }
  const fit = storyBlockPlace(pu, pv, bounds, layout.fit, layout.keeps);
  const X = new Float32Array(4 * count);
  const YT = new Float32Array(4 * count);
  const YB = new Float32Array(4 * count);
  for (let o = 0; o < 4 * count; o++) {
    X[o] = fit.ox + U[o] * fit.scale;
    YT[o] = fit.oy + VT[o] * fit.scale;
    YB[o] = fit.oy + VB[o] * fit.scale;
  }
  const flags = storyBlockFaces(grid.top, nx, ny, cut);
  storyBlockState.builds += 1;
  const block = {
    id: storyBlockState.builds,
    key: `${width}x${height}${reduced ? 'r' : ''}`,
    layout,
    grid,
    nz,
    cut,
    flags,
    tone,
    X,
    YT,
    YB,
    order: storyBlockOrder(nx, ny, cut),
    exaggeration,
    edge: {
      left: fit.ox + bounds.u0 * fit.scale,
      right: fit.ox + bounds.u1 * fit.scale,
      top: fit.oy + bounds.v0 * fit.scale,
      bottom: fit.oy + bounds.v1 * fit.scale
    },
    cur: {
      h: new Float32Array(count),
      ch4: new Float32Array(count)
    },
    pair: {
      lo: 0,
      hi: 0,
      t: 0
    },
    bracket: -1,
    scarp: [],
    labels: [],
    well: null,
    fonts: {
      label: `italic 400 ${layout.fonts.label}px ${STORY_BLOCK_FONT}`,
      h: `italic 600 ${Math.round(layout.fonts.label * 1.45)}px ${STORY_BLOCK_FONT}`,
      big: `600 ${Math.round(layout.fonts.big)}px ${STORY_BLOCK_FONT}`,
      small: `italic 400 ${Math.round(layout.fonts.small)}px ${STORY_BLOCK_FONT}`
    },
    clockText: '',
    clockMinute: -1,
    counterStep: -1,
    counterText: '',
    counterNote: [],
    depthNote: `Depth exaggerated ×${Math.round(exaggeration)}`
  };

  // The fault: the faces of the columns west of it, with the line along their top edge.
  if (grid.faultLine) {
    const west = grid.faultLine.index - 1;
    for (let j = 0; j < ny; j++) if (flags[j * nx + west] & STORY_BLOCK_FACE_EAST) block.scarp.push(j * nx + west);
  }
  const tall = layout.narrow && !reduced;
  const span = block.edge.right - block.edge.left;
  block.labels = STORY_BLOCK_LABELS.map(label => {
    const [x, y] = storyBlockAt(block, label.at[0], label.at[1]);
    const [dx, dy, align] = tall ? label.tall : label.wide;
    return {
      id: label.id,
      text: layout.narrow ? label.short : label.text,
      x,
      y,
      dx: dx * span,
      dy: dy * span,
      align
    };
  });
  // The injection well stands on the cut face, in the column that holds the well.
  const wi = storyBlockLocate(grid.xs, scenario.wellX);
  const wc = (cut.jcut - 1) * nx + wi;
  const wt = storyClamp((scenario.wellX - grid.xs[wi]) / (grid.xs[wi + 1] - grid.xs[wi]));
  const wellTop = storyBlockPoint(block, wc, wt, 1, 0);
  const wellEnd = storyBlockPoint(block, wc, wt, 1, 0.72);
  block.well = {
    x: wellTop[0],
    y0: wellTop[1],
    y1: wellEnd[1],
    up: span * (tall ? STORY_BLOCK_WELL_UP.tall : STORY_BLOCK_WELL_UP.wide)
  };
  block.labels.push({
    id: 'well',
    text: layout.narrow ? 'Well' : 'Injection well',
    x: wellTop[0],
    y: wellTop[1] - block.well.up,
    dx: 0,
    dy: 0,
    align: 'center',
    anchor: false
  });
  return block;
};
const storyBlockGet = frame => {
  const key = `${frame.width}x${frame.height}${frame.reducedMotion ? 'r' : ''}`;
  const have = storyBlockState.block;
  if (have && have.key === key) return have;
  const copy = typeof SITE_STORY !== 'undefined' ? SITE_STORY.captions : {};
  const block = storyBlockBuild(frame.width, frame.height, frame.reducedMotion, storyBlockCaptionHeights(frame.width, copy));
  storyBlockState.block = block;
  storyBlockBindAll(block);
  return block;
};

// The methane column on the east cut face with the thickest gas. The bracket of chapter ve marks its h.
const storyBlockPickBracket = block => {
  const {
    cut,
    grid
  } = block;
  const entries = storyBlockData.live.complete ? storyBlockData.live.entries : storyBlockData.stored.entries;
  const entry = entries.find(item => item && item.year === STORY_BLOCK_GRID_YEARS);
  if (!entry || !entry.cols) return -1;
  let best = -1;
  let thickest = 0.05;
  for (let j = cut.jcut; j < grid.ny; j++) {
    const c = j * grid.nx + cut.icut - 1;
    if (entry.cols.ch4[c] >= 0.5 && entry.cols.h[c] > thickest) {
      best = c;
      thickest = entry.cols.h[c];
    }
  }
  return best;
};

// Load the stored run once. A pinned renderer that waits for it runs on each frame. A static frame draws again.
const storyBlockLoad = () => {
  const stored = storyBlockData.stored;
  if (stored.status !== 'idle') return;
  stored.status = 'loading';
  const finish = ok => {
    stored.status = ok ? 'ready' : 'failed';
    storyBlockNotify();
  };
  if (typeof fetch !== 'function') {
    finish(false);
    return;
  }
  fetch(STORY_BLOCK_RUN_URL).then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }).then(run => {
    stored.entries = run.frames.map(frame => ({
      year: frame.year,
      h: Float32Array.from(frame.h),
      ch4: Float32Array.from(frame.ch4),
      cols: null,
      colsKey: 0
    }));
    stored.years = stored.entries.map(entry => entry.year);
    if (storyBlockState.block) storyBlockBindAll(storyBlockState.block);
    finish(true);
  }).catch(error => {
    console.error('The story run could not load.', error);
    finish(false);
  });
};
const storyBlockWake = entry => {
  entry.animated = true;
  if (typeof window !== 'undefined' && window.dispatchEvent && typeof Event === 'function') window.dispatchEvent(new Event('scroll'));
};
const storyBlockNotify = () => {
  storyBlockState.replays.splice(0).forEach(({
    entry,
    id,
    ctx,
    frame
  }) => {
    storyGuard(`${id}.replay`, () => {
      ctx.save();
      ctx.setTransform(frame.dpr, 0, 0, frame.dpr, 0, 0);
      ctx.clearRect(0, 0, frame.width, frame.height);
      entry.draw(ctx, frame);
      ctx.restore();
    });
  });
  storyBlockState.waiting.splice(0).forEach(storyBlockWake);
};

// The columns of the model at a year, blended from the two nearest frames. It returns false when no frame exists.
const storyBlockSample = (block, year) => {
  const data = storyBlockData;
  const source = data.live.complete ? data.live : data.stored;
  if (!source.entries.length) {
    block.cur.h.fill(0);
    block.cur.ch4.fill(0);
    return false;
  }
  const pair = storyBlockFramePair(source.years, year, block.pair);
  const a = source.entries[pair.lo];
  const b = source.entries[pair.hi];
  if (a.colsKey !== block.id) storyBlockBind(a, block);
  if (b.colsKey !== block.id) storyBlockBind(b, block);
  storyBlockBlend(block.cur, a.cols, b.cols, pair.t);
  return true;
};
const storyBlockQuad = (ctx, ax, ta, da, bx, tb, db, f0, f1) => {
  ctx.beginPath();
  ctx.moveTo(ax, ta + da * f0);
  ctx.lineTo(bx, tb + db * f0);
  ctx.lineTo(bx, tb + db * f1);
  ctx.lineTo(ax, ta + da * f1);
  ctx.closePath();
};

// One side face of column c between the corners ia and ib. g is the gas share of the column (0 to 1).
const storyBlockFace = (ctx, block, pal, s, c, ia, ib, tone, g, kind) => {
  const pa = 4 * c + ia;
  const pb = 4 * c + ib;
  const ax = block.X[pa];
  const bx = block.X[pb];
  const ta = block.YT[pa];
  const tb = block.YT[pb];
  const da = block.YB[pa] - ta;
  const db = block.YB[pb] - tb;
  const nz = block.nz;
  const T = STORY_BLOCK_TONES;
  const S = STORY_BLOCK_STEPS;
  const rock = pal.rock[tone];
  const gas = g > 0.0005;
  if (s.sharp < 1) {
    ctx.fillStyle = rock;
    storyBlockQuad(ctx, ax, ta, da, bx, tb, db, 0, 1);
    ctx.fill();
    if (gas) {
      const used = Math.min(nz, Math.ceil(g * nz - 1e-9));
      for (let k = 0; k < used; k++) {
        const step = Math.round(storyBlockCellFill(g, k, nz) * S);
        if (!step) continue;
        ctx.fillStyle = pal.fill[(kind * T + tone) * (S + 1) + step];
        storyBlockQuad(ctx, ax, ta, da, bx, tb, db, k / nz, (k + 1) / nz);
        ctx.fill();
      }
    }
  }
  if (s.sharp > 0) {
    const h = storyClamp(g);
    if (s.sharp < 1) ctx.globalAlpha = s.sharp;
    if (h < 1) {
      ctx.fillStyle = rock;
      storyBlockQuad(ctx, ax, ta, da, bx, tb, db, h, 1);
      ctx.fill();
    }
    if (gas) {
      ctx.fillStyle = pal.fill[(kind * T + tone) * (S + 1) + S];
      storyBlockQuad(ctx, ax, ta, da, bx, tb, db, 0, h);
      ctx.fill();
      ctx.strokeStyle = pal.edge[kind];
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ax, ta + da * h);
      ctx.lineTo(bx, tb + db * h);
      ctx.stroke();
      ctx.lineWidth = block.layout.line;
    }
    ctx.globalAlpha = 1;
  }
  if (s.pillars > 0) {
    ctx.strokeStyle = pal.line[20];
    ctx.beginPath();
    ctx.moveTo(ax, ta);
    ctx.lineTo(ax, ta + da * s.pillars);
    ctx.moveTo(bx, tb);
    ctx.lineTo(bx, tb + db * s.pillars);
    ctx.stroke();
  }
  if (s.layers > 0) {
    // Layer line k grows from the left end of the face. The lines draw one after the other from the top.
    const fade = Math.round((1 - s.sharp) * 20);
    if (fade > 0) {
      ctx.strokeStyle = pal.line[fade];
      ctx.beginPath();
      for (let k = 1; k < nz; k++) {
        const w = storyClamp(s.layers * nz - (k - 1));
        if (w <= 0) break;
        ctx.moveTo(ax, ta + da * k / nz);
        ctx.lineTo(ax + (bx - ax) * w, ta + da * k / nz + (tb + db * k / nz - ta - da * k / nz) * w);
      }
      ctx.stroke();
    }
    const w = storyClamp(s.layers * nz - (nz - 1));
    if (w > 0) {
      ctx.strokeStyle = pal.line[20];
      ctx.beginPath();
      ctx.moveTo(ax, ta + da);
      ctx.lineTo(ax + (bx - ax) * w, ta + da + (tb + db - ta - da) * w);
      ctx.stroke();
    }
  }
};

// The top face of column c.
const storyBlockTop = (ctx, block, pal, s, c, g, kind) => {
  const o = 4 * c;
  const X = block.X;
  const Y = block.YT;
  const tone = block.tone[c];
  const T = STORY_BLOCK_TONES;
  const S = STORY_BLOCK_STEPS;
  const band = g > 0.0005 ? storyBlockBand(g) : 0;
  const bandColor = band > 0 ? pal.band[(kind * STORY_BLOCK_BANDS + band - 1) * STORY_BLOCK_TOPS + tone] : '';
  let color = pal.rock[tone];
  if (g > 0.0005 && s.bands < 1) color = pal.fill[(kind * T + tone) * (S + 1) + Math.round(storyBlockCellFill(g, 0, block.nz) * S)];else if (band > 0) color = bandColor;
  ctx.beginPath();
  ctx.moveTo(X[o], Y[o]);
  ctx.lineTo(X[o + 1], Y[o + 1]);
  ctx.lineTo(X[o + 2], Y[o + 2]);
  ctx.lineTo(X[o + 3], Y[o + 3]);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  if (band > 0 && s.bands > 0 && s.bands < 1) {
    ctx.globalAlpha = s.bands;
    ctx.fillStyle = bandColor;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  // The thin line in the colour of the face closes the gap between two faces.
  if (s.pillars < 0.98) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.lineWidth = block.layout.line;
  }
  if (s.pillars > 0) {
    ctx.strokeStyle = pal.line[Math.round(s.pillars * 20)];
    ctx.stroke();
  }
};

// The text of the run clock or the counter, top left.
const storyBlockHeadline = (ctx, block, big, small, alpha) => {
  if (alpha <= 0.01) return;
  const {
    clock,
    fonts
  } = block.layout;
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = STORY_COLORS.ink;
  ctx.font = block.fonts.big;
  ctx.fillText(big, clock.x, clock.y);
  ctx.fillStyle = STORY_COLORS.muted;
  ctx.font = block.fonts.small;
  for (let k = 0; k < small.length; k++) ctx.fillText(small[k], clock.x, clock.y + fonts.big * 1.18 + k * fonts.small * 1.4);
  ctx.globalAlpha = 1;
};
const storyBlockLabel = (ctx, block, label, alpha) => {
  if (alpha <= 0.01) return;
  const dot = label.anchor === false ? 0 : 2.4;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.fillStyle = STORY_COLORS.ink;
  ctx.lineWidth = 1;
  if (dot) {
    ctx.beginPath();
    ctx.moveTo(label.x, label.y);
    ctx.lineTo(label.x + label.dx, label.y + label.dy);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(label.x, label.y, dot, 0, Math.PI * 2);
    ctx.fill();
  }
  const pad = block.layout.fonts.label * 0.35;
  ctx.font = block.fonts.label;
  ctx.textAlign = label.align;
  ctx.textBaseline = label.anchor === false ? 'bottom' : label.dy < 0 ? 'bottom' : 'top';
  const tx = label.x + label.dx + (label.align === 'end' ? -pad : label.align === 'start' ? pad : 0);
  ctx.fillText(label.text, tx, label.y + label.dy + (label.anchor === false ? -pad : label.dy < 0 ? -pad * 0.3 : pad * 0.3));
  ctx.lineWidth = block.layout.line;
  ctx.globalAlpha = 1;
};

// Paint the whole block. scene says how much of each effect shows (see storyBlockGrid, storyBlockVe and storyBlockLive).
const storyBlockPaint = (ctx, block, pal, s) => {
  const {
    order,
    flags,
    nz
  } = block;
  const cur = block.cur;
  ctx.lineJoin = 'round';
  ctx.lineWidth = block.layout.line;
  for (let n = 0; n < order.length; n++) {
    const c = order[n];
    const g = cur.h[c] * s.gas;
    const kind = g > 0.0005 ? storyBlockKind(cur.ch4[c]) : 0;
    const f = flags[c];
    if (f & STORY_BLOCK_FACE_EAST) storyBlockFace(ctx, block, pal, s, c, 1, 2, STORY_BLOCK_EAST, g, kind);
    if (f & STORY_BLOCK_FACE_NORTH) storyBlockFace(ctx, block, pal, s, c, 2, 3, STORY_BLOCK_NORTH, g, kind);
    storyBlockTop(ctx, block, pal, s, c, g, kind);
  }
  // The fault trace along the top edge of its scarp.
  if (s.pillars > 0.5 && block.scarp.length) {
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let n = 0; n < block.scarp.length; n++) {
      const o = 4 * block.scarp[n];
      ctx.moveTo(block.X[o + 1], block.YT[o + 1]);
      ctx.lineTo(block.X[o + 2], block.YT[o + 2]);
    }
    ctx.stroke();
    ctx.lineWidth = block.layout.line;
  }
  // The injection well.
  const well = block.well;
  ctx.globalAlpha = s.labels;
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.lineWidth = 3 * block.layout.scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(well.x, well.y0 - well.up);
  ctx.lineTo(well.x, well.y1);
  ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.lineWidth = block.layout.line;
  ctx.globalAlpha = 1;
  // The bracket that marks h on a cut face.
  if (s.bracket > 0.01 && block.bracket >= 0) {
    const o = 4 * block.bracket;
    const mx = (block.X[o + 1] + block.X[o + 2]) / 2;
    const y0 = (block.YT[o + 1] + block.YT[o + 2]) / 2;
    const y1 = y0 + (block.YB[o + 1] - block.YT[o + 1] + (block.YB[o + 2] - block.YT[o + 2])) / 2 * cur.h[block.bracket];
    ctx.globalAlpha = s.bracket;
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.fillStyle = STORY_COLORS.cream;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(mx, y0);
    ctx.lineTo(mx, y1);
    ctx.moveTo(mx - 6, y0);
    ctx.lineTo(mx + 6, y0);
    ctx.moveTo(mx - 6, y1);
    ctx.lineTo(mx + 6, y1);
    ctx.stroke();
    ctx.font = block.fonts.h;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('h', mx + 9, (y0 + y1) / 2);
    ctx.lineWidth = block.layout.line;
    ctx.globalAlpha = 1;
  }
};

// The labels, the run clock or counter, and the notes. They stay out of the caption areas (see storyBlockLayout).
const storyBlockAnnotate = (ctx, block, s, id) => {
  const co2 = storyBlockEase((s.year - 3) / 6);
  for (let n = 0; n < block.labels.length; n++) {
    const label = block.labels[n];
    storyBlockLabel(ctx, block, label, s.labels * (label.id === 'co2' ? co2 : 1));
  }
  const minute = Math.round(storyClamp(s.year / STORY_BLOCK_GRID_YEARS) * STORY_BLOCK_RUN_MINUTES);
  if (minute !== block.clockMinute) {
    block.clockMinute = minute;
    block.clockText = storyBlockClock(s.year / STORY_BLOCK_GRID_YEARS);
  }
  storyBlockHeadline(ctx, block, block.clockText, STORY_BLOCK_CLOCK_NOTE, s.clockAlpha);
  if (s.counterAlpha > 0.01) {
    // The text changes only when the counter moves by half a percent, so a draw makes no new strings.
    const step = Math.round(s.counter * 200);
    if (step !== block.counterStep) {
      block.counterStep = step;
      const counter = storyBlockCounter(block.grid.columns * block.nz, block.grid.columns, s.counter);
      block.counterText = counter.big;
      block.counterNote = [counter.small];
    }
    storyBlockHeadline(ctx, block, block.counterText, block.counterNote, s.counterAlpha);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = STORY_COLORS.muted;
  ctx.font = block.fonts.small;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  const note = block.layout.fit.x1;
  const below = block.edge.bottom + block.layout.fonts.label * 0.6;
  ctx.fillText(block.depthNote, note, below);
  if (id === 've' && s.bracket > 0.01) {
    ctx.globalAlpha = s.bracket;
    ctx.fillText('One cell per column; brine below h', note, below + block.layout.fonts.small * 1.35);
    ctx.globalAlpha = 1;
  }
};
const STORY_BLOCK_CLOCK_NOTE = ['3D run time so far, for a typical', 'field model (for illustration)'];

// Draw one frame of the chapter id. entry is the renderer object.
const storyBlockDraw = (entry, id, ctx, frame) => {
  const block = storyBlockGet(frame);
  const stored = storyBlockData.stored;
  if (stored.status === 'idle') storyBlockLoad();
  const loading = stored.status === 'loading';
  if (loading) {
    if (frame.reducedMotion) {
      if (!storyBlockState.replays.some(item => item.ctx === ctx)) storyBlockState.replays.push({
        entry,
        id,
        ctx,
        frame
      });else storyBlockState.replays.find(item => item.ctx === ctx).frame = frame;
    } else if (!entry.animated) {
      storyBlockState.waiting.push(entry);
      storyBlockWake(entry);
    }
  }
  const pal = storyBlockState.palette || (storyBlockState.palette = storyBlockPalette(STORY_COLORS));
  const s = storyBlockState.scene;
  if (id === 'grid') storyBlockGrid(frame.local, s);else if (id === 've') storyBlockVe(frame.local, s);else storyBlockLiveScene(entry, frame, s);
  if (frame.reducedMotion && id === 'grid') s.clockAlpha = 1;
  storyBlockSample(block, s.year);
  if (s.bracket > 0.01 && block.bracket < 0) block.bracket = storyBlockPickBracket(block);
  storyBlockPaint(ctx, block, pal, s);
  storyBlockAnnotate(ctx, block, s, id);
  if (id === 'live') entry.animated = storyBlockLiveBusy(frame) || loading && !frame.reducedMotion;else if (!loading) entry.animated = false;
};

// ---- chapter live: the player, the controls and the worker

const storyLive = {
  entry: null,
  nodes: null,
  mounted: false,
  playing: false,
  resume: false,
  year: STORY_BLOCK_GRID_YEARS,
  lastYear: 100,
  last: null,
  cells: 0,
  target: 0,
  shown: -1,
  shownState: '',
  onVisibility: null
};
const storyBlockReducedNow = () => !!(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

// Write the year and the play state to the controls. It writes only when a value changes.
const storyBlockSyncControls = () => {
  const live = storyLive;
  const n = live.nodes;
  if (!n) return;
  const year = Math.round(live.year);
  if (live.shown !== year) {
    live.shown = year;
    n.range.value = String(year);
    n.range.setAttribute('aria-valuetext', `Year ${year}`);
    n.range.style.setProperty('--fill', `${(year / live.lastYear * 100).toFixed(1)}%`);
    n.year.textContent = `Year ${year}`;
  }
  const state = live.playing ? 'playing' : 'paused';
  if (live.shownState !== state) {
    live.shownState = state;
    n.play.setAttribute('data-state', state);
    n.play.setAttribute('aria-label', live.playing ? 'Pause' : 'Play');
  }
};

// The player advances in the draw call. This returns the scene of the chapter live.
const storyBlockLiveScene = (entry, frame, s) => {
  const live = storyLive;
  const running = live.mounted && !frame.reducedMotion;
  if (running) {
    const dt = storyBlockStep(frame.time, live.last);
    live.last = frame.time;
    if (live.playing) {
      live.year = storyBlockAdvance(live.year, dt, live.lastYear);
      if (live.year >= live.lastYear) {
        live.playing = false;
        live.last = null;
      }
    }
    if (live.cells !== live.target) {
      const move = dt / 350;
      live.cells = live.target > live.cells ? Math.min(live.target, live.cells + move) : Math.max(live.target, live.cells - move);
    }
    storyBlockSyncControls();
  }
  return storyBlockLive(frame.local, running ? live.cells : 0, running ? live.year : STORY_BLOCK_GRID_YEARS, s);
};

// The renderer needs frames while the player runs and while the cells change.
const storyBlockLiveBusy = frame => storyLive.mounted && !frame.reducedMotion && (storyLive.playing || storyLive.cells !== storyLive.target);
const storyBlockVisibility = live => {
  if (document.hidden) {
    if (live.playing) {
      live.playing = false;
      live.resume = true;
      storyBlockSyncControls();
    }
  } else if (live.resume) {
    live.resume = false;
    live.playing = true;
    live.last = null;
    storyBlockSyncControls();
    storyBlockWake(live.entry);
  }
};

// Build the controls in the layer of the stage. The styles are in colors_and_type.css (Story block controls).
const storyBlockControls = (layer, live) => {
  const make = (tag, className, attrs, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    Object.keys(attrs || {}).forEach(name => node.setAttribute(name, attrs[name]));
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const root = make('div', 'story-controls', {
    role: 'group',
    'aria-label': 'Story block controls'
  });
  const play = make('button', 'story-controls__play', {
    type: 'button',
    'data-state': 'paused',
    'aria-label': 'Play'
  });
  play.appendChild(make('span', 'story-controls__icon', {
    'aria-hidden': 'true'
  }));
  const time = make('div', 'story-controls__time');
  const year = make('span', 'story-controls__year', {
    'aria-hidden': 'true'
  }, `Year ${STORY_BLOCK_GRID_YEARS}`);
  const range = make('input', 'story-controls__range', {
    type: 'range',
    min: '0',
    max: String(live.lastYear),
    step: '1',
    value: String(STORY_BLOCK_GRID_YEARS),
    'aria-label': 'Simulation year'
  });
  time.appendChild(year);
  time.appendChild(range);
  const legend = make('ul', 'story-controls__legend', {
    'aria-label': 'Legend'
  });
  legend.appendChild(make('li', 'story-controls__chip story-controls__chip--ch4', {}, 'Methane'));
  legend.appendChild(make('li', 'story-controls__chip story-controls__chip--co2', {}, 'CO₂'));
  const label = make('label', 'story-controls__switch');
  const toggle = make('input', 'story-controls__toggle', {
    type: 'checkbox',
    role: 'switch'
  });
  label.appendChild(toggle);
  label.appendChild(make('span', 'story-controls__track', {
    'aria-hidden': 'true'
  }));
  label.appendChild(make('span', 'story-controls__switch-text', {}, 'Show 3D cells'));
  [play, time, legend, label].forEach(part => root.appendChild(part));
  layer.appendChild(root);
  play.addEventListener('click', () => {
    if (live.playing) {
      live.playing = false;
    } else {
      if (live.year >= live.lastYear) live.year = 0;
      live.playing = true;
      live.last = null;
    }
    live.resume = false;
    storyBlockSyncControls();
    storyBlockWake(live.entry);
  });
  range.addEventListener('input', () => {
    live.year = Number(range.value);
    live.playing = false;
    live.resume = false;
    live.last = null;
    storyBlockSyncControls();
    storyBlockWake(live.entry);
  });
  toggle.addEventListener('change', () => {
    live.target = toggle.checked ? 1 : 0;
    storyBlockWake(live.entry);
  });
  return {
    root,
    play,
    year,
    range,
    toggle
  };
};

// Run the scenario in the worker, once. The page uses the stored frames until all frames arrive.
const storyBlockStartWorker = () => {
  const live = storyBlockData.live;
  if (live.status !== 'idle' || live.complete) return;
  const fail = () => {
    live.status = 'failed';
    if (live.worker) live.worker.terminate();
    live.worker = null;
  };
  if (typeof Worker !== 'function') {
    live.status = 'failed';
    return;
  }
  try {
    const worker = new Worker(STORY_BLOCK_WORKER_URL);
    live.run += 1;
    live.status = 'running';
    live.worker = worker;
    const run = live.run;
    const last = StoryGeometry.STORY_SCENARIO.years;
    worker.onmessage = ({
      data
    }) => {
      if (data.id !== run) return;
      if (data.type === 'frame') {
        const entry = {
          year: data.year,
          h: data.h,
          ch4: data.ch4,
          cols: null,
          colsKey: 0
        };
        if (storyBlockState.block) storyBlockBind(entry, storyBlockState.block);
        live.entries[data.year] = entry;
        live.years[data.year] = data.year;
      } else if (data.type === 'done') {
        live.complete = live.entries.length === last + 1 && live.entries.every(Boolean);
        live.status = live.complete ? 'done' : 'failed';
        live.worker = null;
        worker.terminate();
        if (storyLive.mounted) storyBlockWake(storyLive.entry);
      } else if (data.type === 'error') {
        console.error('The story worker failed.', data.message);
        fail();
      }
    };
    worker.onerror = fail;
    worker.postMessage({
      type: 'run',
      id: run
    });
  } catch (error) {
    fail();
  }
};
const storyBlockRenderer = id => ({
  animated: false,
  draw(ctx, frame) {
    storyBlockDraw(this, id, ctx, frame);
  }
});
STORY_RENDERERS.grid = storyBlockRenderer('grid');
STORY_RENDERERS.ve = storyBlockRenderer('ve');
STORY_RENDERERS.live = {
  ...storyBlockRenderer('live'),
  mount(layer) {
    const live = storyLive;
    live.entry = this;
    live.lastYear = StoryGeometry.STORY_SCENARIO.years;
    live.year = STORY_BLOCK_GRID_YEARS;
    live.cells = 0;
    live.target = 0;
    live.last = null;
    live.resume = false;
    live.shown = -1;
    live.shownState = '';
    live.playing = !storyBlockReducedNow();
    live.nodes = storyBlockControls(layer, live);
    live.mounted = true;
    live.onVisibility = () => storyBlockVisibility(live);
    document.addEventListener('visibilitychange', live.onVisibility);
    storyBlockSyncControls();
    storyBlockStartWorker();
    if (live.playing) storyBlockWake(this);
  },
  unmount() {
    const live = storyLive;
    live.mounted = false;
    live.playing = false;
    live.resume = false;
    document.removeEventListener('visibilitychange', live.onVisibility);
    const root = live.nodes && live.nodes.root;
    if (root && root.parentNode) root.parentNode.removeChild(root);
    live.nodes = null;
    this.animated = false;
  }
};

// File: HomeSections.jsx
// HomeSections.jsx — the homepage below the story: research, projects, publications, contact.
// Facts come from site-content.js, which the CV shares.
// The sections sit on the sky ground of the story (style C). The CSS is in colors_and_type.css.

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

// A thin strip of four rock beds: sandstone, shale, chalk and older rock. It echoes the cutaway of the story.
// Use it once for each section heading. It is decoration only.
const Strata = () => /*#__PURE__*/React.createElement("span", {
  className: "strata",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null));
const SiteSection = ({
  id,
  title,
  children
}) => /*#__PURE__*/React.createElement("section", {
  id: id,
  className: "site-section",
  "aria-labelledby": `${id}-title`
}, /*#__PURE__*/React.createElement("div", {
  className: "site-section__inner"
}, /*#__PURE__*/React.createElement("h2", {
  id: `${id}-title`,
  className: "section-title"
}, title), /*#__PURE__*/React.createElement(Strata, null), children));
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
  }), /*#__PURE__*/React.createElement("span", null, "DOI ", /*#__PURE__*/React.createElement("span", {
    className: "tnum"
  }, pub.doi))), /*#__PURE__*/React.createElement("button", {
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
  Strata,
  siteCopy
});

// File: CVPage.jsx
// CVPage.jsx — the curriculum vitae: a light sheet on the sky ground on screen (style C), black on white in print.
// Facts come from site-content.js, which the homepage shares.
// Strata comes from HomeSections.jsx. The bundle loads that file first.

const CVSection = ({
  id,
  title,
  children
}) => /*#__PURE__*/React.createElement("section", {
  className: "cv-section",
  "aria-labelledby": `cv-${id}`
}, /*#__PURE__*/React.createElement("h2", {
  id: `cv-${id}`
}, title), /*#__PURE__*/React.createElement(Strata, null), children);
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
  className: "tnum",
  href: pub.url
}, pub.doi))))));
const CVPage = () => /*#__PURE__*/React.createElement("article", {
  className: "cv"
}, /*#__PURE__*/React.createElement("div", {
  className: "cv-sheet"
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
}))));
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
  }), /*#__PURE__*/React.createElement("main", {
    id: "main-content",
    tabIndex: -1
  }, /*#__PURE__*/React.createElement(ResearchSection, null), /*#__PURE__*/React.createElement(ProjectsSection, null), /*#__PURE__*/React.createElement(PublicationsSection, null), /*#__PURE__*/React.createElement(ContactSection, null)), /*#__PURE__*/React.createElement(Footer, {
    onNavigate: navigate
  }));
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

