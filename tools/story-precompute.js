// Run the story scenario once and write assets/story-run.json.
// Usage: node tools/story-precompute.js
// The file holds the gas thickness h (m, step 0.1) and the methane share ch4 (step 0.01) on the
// coarse grid for the years in STORY_YEARS. It also holds the CO2 and methane inventory of
// each stored year in Mt. Chapters 3 and 4 show these frames. Chapter 5 runs the model live.
const fs = require('node:fs');
const path = require('node:path');
const VE2D = require('../ve2d-model.js');
const Story = require('../story-geometry.js');

const OUTPUT = path.join(__dirname, '..', 'assets', 'story-run.json');
const H_STEP = 0.1;
const SHARE_STEP = 0.01;
const MT_STEP = 0.001;
const INVENTORY_KEYS = ['injected', 'free', 'structural', 'residual', 'dissolved', 'exited', 'leaked', 'methane', 'methaneExited', 'methaneLeaked', 'methaneDissolved'];

const round = (value, step) => Math.round(value / step) * step;
// Round to the step, and drop the floating point noise of the product.
const rounded = (value, step) => Number(round(value, step).toFixed(Math.round(-Math.log10(step))));

const precompute = () => {
  const { scenario, model } = Story.storyModel();
  const frames = [];
  VE2D.run(Story.STORY_SCENARIO, {
    snapshotYears: 1,
    keepSnapshots: false,
    onSnapshot: snapshot => {
      if (!Story.STORY_YEARS.includes(snapshot.year)) return;
      const inventoryMt = {};
      for (const key of INVENTORY_KEYS) inventoryMt[key] = rounded(snapshot.inv[key] / VE2D.MT, MT_STEP);
      frames.push({
        year: snapshot.year,
        h: Array.from(snapshot.h, value => rounded(value, H_STEP)),
        ch4: Array.from(snapshot.ch4, value => rounded(value, SHARE_STEP)),
        inventoryMt
      });
    }
  });
  return {
    scenario,
    grid: [model.nx, model.ny],
    steps: { h: H_STEP, ch4: SHARE_STEP, inventoryMt: MT_STEP },
    years: Story.STORY_YEARS.slice(),
    frames
  };
};

module.exports = { precompute, OUTPUT };

if (require.main === module) {
  const text = JSON.stringify(precompute());
  fs.writeFileSync(OUTPUT, text);
  console.log(`Wrote ${path.relative(process.cwd(), OUTPUT)}: ${(text.length / 1024).toFixed(1)} KB, ${Story.STORY_YEARS.length} stored years.`);
}
