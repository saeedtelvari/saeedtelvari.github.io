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
  linkedinUser: 'stelvari',
};

const SITE_PUBLICATIONS = [
  {
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
}`,
  },
  {
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
}`,
  },
  {
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
}`,
  },
  {
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
}`,
  },
];

const SITE_ACTIVITY = [
  { month: '2026-09', date: 'Sep 2026', title: 'Talk and session co-chair, InterPore UK',
    body: 'Presented “A Compositional Vertical Equilibrium Model for CO₂ Storage in Depleted Gas Reservoirs” at the 9th InterPore UK Chapter Conference in Edinburgh, and co-chaired the Multiphase Phenomena session.' },
  { month: '2026-09', date: 'Sep 2026', title: 'Approved as MSc demonstrator',
    body: 'Formation Evaluation labs and Production Technology tutorials for MSc Petroleum Engineering at Heriot-Watt, from November 2026.' },
  { month: '2026-08', date: 'Aug 2026', title: 'MuPSI field-scale case study',
    body: 'Built vertical-equilibrium models for a field-scale case study of depleted gas fields in the MuPSI CO₂ storage project, and presented the results to the project partners.' },
  { month: '2026-06', date: 'Jun 2026', title: 'Team runner-up, EAGE “The Energy–AI Nexus” Hackathon',
    body: 'Built a Python AI agent that manages an energy grid under growing AI demand, with a team at EAGE Annual 2026 in Aberdeen.' },
  { month: '2026-05', date: 'May 2026', title: 'Talk at InterPore2026; preprint online',
    body: 'Presented “Vertical-Equilibrium Modelling of CO₂ Migration in Depleted Reservoirs” at InterPore2026 in Nantes, and posted the VE model paper as a preprint on EarthArXiv.' },
  { month: '2026-03', date: 'Mar 2026', title: 'Led an MRST rapid-prototyping session',
    body: 'Guided Heriot-Watt PhD students and postdocs through building a single-phase flow simulator from scratch in MRST, in the SET-IT MATLAB/MRST workshop series.' },
  { month: '2026-02', date: 'Feb 2026', title: 'Seminar talk and SPE bursary',
    body: 'Spoke at the IGE GeoEnergy Seminar Series at Heriot-Watt, and was runner-up for the SPE Aberdeen Section Student Bursary (£1,000 awarded).' },
  { month: '2025-10', date: 'Oct 2025', title: 'Poster at EAGE GET 2025',
    body: 'Presented “Three-Phase VE Simulation of CO₂–Methane–Brine Flow in Reservoirs” at the Sixth EAGE Global Energy Transition Conference in Rotterdam.' },
];

const SITE_PROJECTS = [
  {
    id: 'simulator',
    title: 'CO₂ storage simulator',
    body: 'A vertical-equilibrium simulator of CO₂ plume migration, structural, residual and dissolution trapping, fault leakage and pressure build-up in a saline aquifer, in SI units with a visible mass balance and an uncertainty study. It runs in the browser.',
    links: [
      { label: 'Open the simulator', href: './simulator.html' },
      { label: 'Read the method', href: './simulator.html#method' },
    ],
    image: { src: './assets/project-simulator.webp', width: 640, height: 360,
      alt: 'Map view of the CO₂ storage simulator: a plume under a faulted dome, coloured by trapping class.' },
  },
  {
    id: 'mupsi',
    title: 'MuPSI',
    meta: '2026',
    body: 'Multiscale Pressure-Stress Impacts on fault integrity for multi-site regional CO₂ storage, a Clean Energy Transition Partnership project. I built VE models for a field-scale case study of depleted gas fields, with NORCE, TU Delft and IDAEA-CSIC.',
  },
  {
    id: 'fault-detection',
    title: '3D fault detection for MRST',
    body: 'Extended a 2D tool to 3D. It finds fault faces with signed distance fields on Cartesian and unstructured grids, and members of the MuPhi group use it.',
  },
];

const SITE_CV = {
  title: 'PhD Candidate in Petroleum Engineering',
  location: 'Edinburgh, UK',
  interests: 'Reservoir simulation, CO₂ storage, vertical-equilibrium models, multiphase and compositional flow, machine learning for upscaling and digital rock, fractured reservoirs.',
  education: [
    { date: '2024 – present', title: 'PhD in Petroleum Engineering', place: 'Heriot-Watt University, Edinburgh',
      details: ['Thesis: Developing Vertical Equilibrium Models for Simulating CO₂ Storage in Depleted Gas Reservoirs'] },
    { date: '2022 – 2024', title: 'MSc in Petroleum Engineering (Reservoir)', place: 'Amirkabir University of Technology, Tehran',
      details: ['GPA 3.65/4 (17.23/20)', 'Thesis: Machine Learning Methods in Upscaling Fine-scale Discrete Fracture Models'] },
    { date: '2018 – 2022', title: 'BSc in Petroleum Engineering', place: 'Amirkabir University of Technology, Tehran',
      details: ['GPA 17.43/20', 'Thesis: Prediction of two-phase flow properties for digital sandstones using 3D CNNs'] },
  ],
  experience: [
    { date: '2024 – present', title: 'Doctoral research: vertical-equilibrium modelling', place: 'Institute of GeoEnergy Engineering, Heriot-Watt University',
      details: ['Reduced-order models of CO₂–methane–brine migration in depleted gas reservoirs, for screening, uncertainty analysis and field-scale forecasting.'] },
    { date: '2026', title: 'MuPSI: Multiscale Pressure-Stress Impacts on fault integrity for multi-site regional CO₂ storage', place: 'Clean Energy Transition Partnership',
      details: ['VE models for a field-scale case study of depleted gas fields, with NORCE, TU Delft and IDAEA-CSIC.'] },
    { date: '', title: '3D fault-detection tool for MRST', place: 'MuPhi research group, Heriot-Watt University',
      details: ['Extended a 2D code to 3D; it finds fault faces with signed distance fields on Cartesian and unstructured grids and is used by members of the MuPhi group.'] },
    { date: '2022 – 2026', title: 'Machine-learning permeability upscaling', place: 'Amirkabir University of Technology',
      details: ['CNN workflows that estimate effective permeability from heterogeneous fine-scale reservoir models.'] },
    { date: '2021 – 2023', title: 'Two-phase flow prediction for digital sandstones', place: 'Amirkabir University of Technology',
      details: ['3D convolutional neural networks that predict relative permeability and capillary pressure from digital-rock images.'] },
  ],
  presentations: [
    { date: 'Sep 2026', title: 'A Compositional Vertical Equilibrium Model for CO₂ Storage in Depleted Gas Reservoirs', place: 'Oral, 9th InterPore UK Chapter Conference, Edinburgh' },
    { date: 'May 2026', title: 'Vertical-Equilibrium Modelling of CO₂ Migration in Depleted Reservoirs', place: 'Oral, InterPore2026, 18th Annual Meeting, Nantes' },
    { date: 'Feb 2026', title: 'A Vertical Equilibrium Model for CO₂ Migration in Depleted Gas Fields', place: 'Seminar talk, IGE GeoEnergy Seminar Series, Heriot-Watt University' },
    { date: 'Oct 2025', title: 'Three-Phase VE Simulation of CO₂–Methane–Brine Flow in Reservoirs', place: 'Poster, Sixth EAGE Global Energy Transition Conference (GET 2025), Rotterdam' },
  ],
  teaching: [
    { date: '2026 – 2027', title: 'Approved Demonstrator, MSc Petroleum Engineering', place: 'Heriot-Watt University, Edinburgh',
      details: ['Formation Evaluation labs (Nov 2026); Production Technology PipeSim tutorials (Jan – Feb 2027)'] },
    { date: 'Feb – Apr 2026', title: 'Co-organiser and lead instructor, MATLAB/MRST workshop series', place: 'SET-IT, Heriot-Watt University',
      details: ['Led “Simulator Development with MRST’s Rapid Prototyping Framework” for IGE PhD students and postdocs'] },
    { date: 'MSc', title: 'Teaching assistant', place: 'Amirkabir University of Technology, Tehran',
      details: ['Advanced Naturally Fractured Reservoirs; Advanced Enhanced Oil Recovery (Eclipse and Petrel tutorials)'] },
  ],
  service: [
    { date: 'Sep 2026', title: 'Session co-chair, 9th InterPore UK Chapter Conference', place: 'Session 1: Multiphase Phenomena, with Dr Sarah Perez, Edinburgh' },
    { date: '2026', title: 'Co-reviewer, Geophysical Research Letters', place: 'Manuscript review with Prof. Florian Doster' },
    { date: 'May 2026', title: 'Conference volunteer, InterPore2026', place: 'Technical session support for minisymposia MS05 and MS08, Nantes' },
    { date: '2025', title: 'Webmaster, SPE Heriot-Watt University Student Chapter', place: 'SPE officer certificate of appreciation; the chapter won the 2026 SPE Regional Outstanding Student Chapter Award' },
    { date: '', title: 'Web contributor', place: 'SET-IT research community and MuPhi Research Group websites' },
  ],
  training: [
    { date: 'Sep 2026', title: 'SLB Intersect CCS training', place: 'Five-day course' },
    { date: 'Mar 2026', title: 'CMG Carbon Capture Underground Storage Modelling', place: 'Certificate of achievement, CMG CO₂ storage workshop' },
  ],
  skills: [
    ['Programming', 'Python, MATLAB, Julia, Rust, LaTeX'],
    ['Machine learning', 'TensorFlow, PyTorch, scikit-learn, OpenCV, OpenPNM'],
    ['Reservoir simulation', 'MRST, Eclipse, Intersect, CMG, Petrel RE, PipeSim, Saphir, PVTSim'],
    ['CFD and imaging', 'OpenFOAM, PerGeos, SALOME, MeshLab'],
    ['Tools', 'Linux, Docker, Git, Jupyter, VS Code'],
  ],
  recognition: [
    { date: '2024 – present', title: 'James Watt Scholarship', place: 'Full PhD funding, Heriot-Watt University' },
    { date: '2026', title: 'Runner-up, SPE Aberdeen Section Student Bursary', place: '£1,000 awarded' },
    { date: '2026', title: 'Team runner-up, EAGE “The Energy–AI Nexus” Hackathon', place: 'EAGE Annual 2026, Aberdeen' },
    { date: '', title: 'National undergraduate scholarship', place: 'Full tuition waiver' },
  ],
};

// The words of the story at the top of the homepage (docs/superpowers/specs/2026-10-25-homepage-story-design.md).
// A caption has two sentences at most. *h* marks italic text. Chapters with two captions switch at the middle.
const SITE_STORY = {
  label: 'From orbit to a live vertical-equilibrium model',
  name: 'Sa’eed Telvari',
  // The CO₂ numbers of chapter 0. base and baseYear are the start of the count: the level before industry.
  // value and year come from the NOAA Mauna Loa record: the annual mean of the latest complete year, in ppm.
  // To update them, read the last row of the file at url, then write its year and its mean here (see the spec, Rules for the story).
  // The first caption of chapter 0 says "more than 420 ppm". A test fails if value is not above 420.
  co2: {
    base: 280,
    baseYear: 1850,
    value: 427.35,
    year: 2025,
    source: 'NOAA Global Monitoring Laboratory, Mauna Loa annual mean CO₂',
    url: 'https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.txt',
  },
  // The ppm line, from co2: "280 ppm in 1850. 427 ppm in 2025." The value shows as a whole number.
  get ppm() {
    return `${this.co2.base} ppm in ${this.co2.baseYear}. ${Math.round(this.co2.value)} ppm in ${this.co2.year}.`;
  },
  captions: {
    orbit: ['There is more than 420 ppm of CO₂ in the air. I model how rock under the North Sea can hold it for thousands of years.'],
    descent: ['Carbon capture and storage puts CO₂ back into rock, deep under the sea floor.'],
    rock: [
      'The well goes about 2 km down, through clay, chalk and a shale caprock.',
      'The sandstone is a dome that held natural gas for millions of years. Most of the gas is produced, so the dome can now store CO₂.',
    ],
    grid: [
      'A 3D model splits the reservoir into cells that follow the layers and the fault. Field models have millions of cells, and one run can take days.',
      'Faults cut the reservoir and can leak. In the MuPSI project, which studies fault integrity, I apply these models to depleted gas fields.',
    ],
    ve: [
      'Gas is lighter than brine. Both the CO₂ and the methane rise to the top of each column.',
      'The rock stays 3D, but the vertical cells go. VE solves one value per column, the plume thickness *h*, so it runs up to 100× faster.',
    ],
    live: ['This VE model runs in your browser.'],
  },
  // Links under the caption of the last chapter. An entry with an id scrolls to that section of the page.
  actions: [
    { label: 'Open the simulator', href: './simulator.html' },
    { label: 'Read my research', href: './index.html#research', id: 'research' },
  ],
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SITE_LINKS, SITE_PUBLICATIONS, SITE_ACTIVITY, SITE_PROJECTS, SITE_CV, SITE_STORY };
}
