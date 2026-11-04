// story-content.js — the words and the numbers of the story page (ve-story.html).
// It is in story-bundle.js. The homepage does not load it.
// The spec is docs/superpowers/specs/2026-10-25-homepage-story-design.md.
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
    fields: ['Hundreds of gas fields under the North Sea no longer produce. Projects in the UK, the Netherlands and Denmark plan to store CO₂ in some of them.'],
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
  // Links under the caption of the last chapter. An entry with an id scrolls to that element of the page. The links here go to other pages.
  actions: [
    { label: 'Open the VE simulator', href: './simulator.html' },
    { label: 'Read my research', href: './index.html#research' },
  ],
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SITE_STORY };
}
