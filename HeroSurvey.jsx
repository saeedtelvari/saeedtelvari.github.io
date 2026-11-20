/* =====================================================
   HeroSurvey - the 4D seismic survey of the hero.
   At a survey year a ship crosses the hero, shoots, and a difference image of the CO2 appears behind it.
   The image comes from the model frame of that year. It is not a seismic simulation.
   The canvas exists only while a pass runs. SubsurfaceHero mounts it at the start and removes it after the fade.
   ===================================================== */

// ---- hero survey helpers
const HERO_SURVEY_YEARS = [5, 15, 25, 200, 1000]; // three surveys during injection (years 0 to 30), then fewer
const HERO_SURVEY_CROSS = 4.5;   // pass seconds: the ship crosses the hero and the image appears behind it
const HERO_SURVEY_HOLD = 1.4;    // pass seconds: the image stays
const HERO_SURVEY_FADE = 0.8;    // pass seconds: the image fades
const HERO_SURVEY_TOTAL = HERO_SURVEY_CROSS + HERO_SURVEY_HOLD + HERO_SURVEY_FADE;
const HERO_SURVEY_SHOT = 0.45;   // seconds between two shots
const HERO_SURVEY_SLOW = 0.03;   // the model clock factor during the cross, the hold and most of the fade
const HERO_SURVEY_EASE = 0.2;    // pass seconds to ease the clock factor down
const HERO_SURVEY_RISE = 0.3;    // pass seconds at the end of the fade to ease the clock factor back up
const HERO_SURVEY_JUMP = 30;     // a step of more than this many years is a jump (the same value as HERO_LEAK_JUMP)
const HERO_SURVEY_UNIT = 15;     // section units per solver unit of height (the same value as HERO_UNIT)
const HERO_SURVEY_FRAME_MS = 30; // the loop skips a frame that comes sooner than this (about 30 fps)
const HERO_SURVEY_MAX_WIDTH = 1600;
const HERO_SURVEY_RING = 430;    // px per second
const HERO_SURVEY_RING_MAX = 560; // px, where a shot has faded out

const heroSurveySmooth = t => { const v = Math.max(0, Math.min(1, t)); return v * v * (3 - 2 * v); };

// The factor for the model clock at the pass time u (in pass seconds). It is 1 when idle.
// The clock stays slow until the image has almost gone. Thus a pass moves the year by only about 3.5 years during
// injection, and the pass at year 25 ends before the shut-in at year 30.
const heroSurveyClock = u => {
  if (!(u > 0) || u >= HERO_SURVEY_TOTAL) return 1;
  if (u < HERO_SURVEY_EASE) return 1 - (1 - HERO_SURVEY_SLOW) * heroSurveySmooth(u / HERO_SURVEY_EASE);
  const rise = HERO_SURVEY_TOTAL - HERO_SURVEY_RISE;
  if (u <= rise) return HERO_SURVEY_SLOW;
  return HERO_SURVEY_SLOW + (1 - HERO_SURVEY_SLOW) * heroSurveySmooth((u - rise) / HERO_SURVEY_RISE);
};

// The survey year that playback crosses in one step, or null. A jump (a scrub or a restart) never starts a pass.
// A step that ends at the survey year counts, so each year starts once for each pass of the clock through it.
const heroSurveyCrossing = (prev, next, years = HERO_SURVEY_YEARS) => {
  const step = next - prev;
  if (!(step > 0) || step > HERO_SURVEY_JUMP) return null;
  for (const y of years) if (prev < y && y <= next) return y;
  return null;
};

// The next survey year after this year, or null.
const heroSurveyNext = (year, years = HERO_SURVEY_YEARS) => {
  for (const y of years) if (y > year) return y;
  return null;
};

// The first pass goes left to right (1). The next goes right to left (-1), and so on.
const heroSurveyDirection = count => (count % 2 === 0 ? 1 : -1);

// The opacity of the image: full during the cross and the hold, then a linear fade.
const heroSurveyFade = u => {
  const hold = HERO_SURVEY_CROSS + HERO_SURVEY_HOLD;
  return u <= hold ? 1 : Math.max(0, 1 - (u - hold) / HERO_SURVEY_FADE);
};

// The x of the ship at the pass time u. It starts 60 px outside one edge and ends 80 px outside the other.
const heroSurveyShipX = (u, dir, width) => {
  const p = Math.max(0, Math.min(1, u / HERO_SURVEY_CROSS)), span = width + 140;
  return dir > 0 ? -60 + span * p : width + 60 - span * p;
};

// The left edge of the image: just right of the depth axis. The axis is 96 px wide, and 58 px on a phone.
const heroSurveyLeft = width => (width <= 600 ? 62 : 100);

// The strips of the image to draw. A strip is a solid block and four soft strips at the edge of the reveal.
// edge is the x of the gun point. The reveal goes behind the ship. A finished pass passes an edge outside the hero.
const heroSurveyStrips = (edge, dir, left, width) => {
  const out = [];
  if (dir > 0) {
    out.push({ x: left, w: edge - 24 - left, a: 1 });
    for (let j = 0; j < 4; j++) out.push({ x: edge - 24 + j * 6, w: 6, a: 1 - (j + 1) / 5 });
  } else {
    out.push({ x: edge + 24, w: width - edge - 24, a: 1 });
    for (let j = 0; j < 4; j++) out.push({ x: edge + 24 - (j + 1) * 6, w: 6, a: 1 - (j + 1) / 5 });
  }
  return out.map(s => {
    const x0 = Math.max(left, s.x), x1 = Math.min(width, s.x + s.w);
    return { x: x0, w: x1 - x0, a: s.a };
  }).filter(s => s.w > 0);
};

// The revealed width of the image at the gun point x.
const heroSurveyRevealed = (edge, dir, left, width) => (dir > 0 ? Math.max(0, Math.min(width, edge) - left) : Math.max(0, width - Math.max(left, edge)));

// The chip sits at the top left of the image. It shows only when the image is under it:
// on a left-to-right pass once 240 px of image show, on a right-to-left pass once the solid image reaches the chip.
const heroSurveyChipShown = (edge, dir, left, width) => (dir > 0 ? heroSurveyRevealed(edge, dir, left, width) >= 240 : edge + 24 <= left + 10);

// The Ricker wavelet, 17 samples from -8 px to +8 px, at 0.11 cycles per px.
const heroSurveyWavelet = (() => {
  const out = new Float32Array(17);
  for (let d = -8; d <= 8; d++) { const q = (Math.PI * 0.11 * d) ** 2; out[d + 8] = (1 - 2 * q) * Math.exp(-q); }
  return out;
})();

// One wavelet of amplitude a at the row c of the column x.
const heroSurveyAdd = (amp, width, height, x, c, a) => {
  for (let d = -8; d <= 8; d++) {
    const y = c + d;
    if (y >= 0 && y < height) amp[y * width + x] += a * heroSurveyWavelet[d + 8];
  }
};

// The reflections of one CO2 body from row top to row base. The top is positive, the base is negative.
// Inside the body the sign changes every 7 px. A velocity push-down follows the base when push is true.
const heroSurveyBody = (amp, width, height, x, top, base, scale, push) => {
  heroSurveyAdd(amp, width, height, x, top, scale);
  heroSurveyAdd(amp, width, height, x, base, -0.55 * scale);
  for (let y = top + 7, n = 1; y < base - 3; y += 7, n++) heroSurveyAdd(amp, width, height, x, y, 0.34 * scale * (n % 2 ? -1 : 1));
  if (push) {
    heroSurveyAdd(amp, width, height, x, base + 12, 0.22 * scale);
    heroSurveyAdd(amp, width, height, x, base + 26, -0.15 * scale);
  }
};

// The CO2 of one aquifer in one column: roof, mobile base and residual base in px.
// Mobile CO2 gives the full amplitude. Residual CO2 below it adds a weak base. Residual CO2 alone gives 0.45 of the amplitude.
const heroSurveyColumn = (amp, width, height, x, roof, mobile, swept, strength, push) => {
  const top = Math.round(roof), mb = Math.round(mobile), sb = Math.round(swept);
  if (mb - top >= 2) {
    const below = sb - mb >= 2;
    if (below) {
      heroSurveyBody(amp, width, height, x, top, mb, strength, false);
      heroSurveyAdd(amp, width, height, x, mb, 0.3 * strength); // the residual zone weakens the base reflection of the mobile body
      heroSurveyAdd(amp, width, height, x, sb, -0.3 * strength);
      if (push) { heroSurveyAdd(amp, width, height, x, sb + 12, 0.22 * strength); heroSurveyAdd(amp, width, height, x, sb + 26, -0.15 * strength); }
    } else heroSurveyBody(amp, width, height, x, top, mb, strength, push);
  } else if (sb - top >= 2) heroSurveyBody(amp, width, height, x, top, sb, 0.45 * strength, push);
};

// The amplitude image of one frame, in CSS pixels of the section: width x height values, row by row, in -1 .. 1 and a bit beyond.
// layers = { storage, overlying }: each has roofL, roofR, floorL and floorR (section units, 201 nodes). The section is 580 units high.
// The geometry is the same as in the plume drawing: cell k lies between node k (roofR) and node k + 1 (roofL).
const heroSurveyAmplitude = (frame, layers, width, height, left) => {
  const amp = new Float32Array(width * height), k580 = height / 580;
  const lerp = (a, b, t) => a + (b - a) * t;
  for (let x = Math.max(0, Math.floor(left)); x < width; x++) {
    const pos = (x + 0.5) / width * 200, k = Math.min(199, Math.floor(pos)), t = pos - k;
    const aquifer = (layer, h, hMax, strength, push) => {
      const roof = lerp(layer.roofR[k], layer.roofL[k + 1], t), floor = lerp(layer.floorR[k], layer.floorL[k + 1], t);
      const mobile = Math.min(floor, roof + h[k] * HERO_SURVEY_UNIT), swept = Math.min(floor, roof + hMax[k] * HERO_SURVEY_UNIT);
      if (!(hMax[k] > 0.002 || h[k] > 0.002)) return;
      heroSurveyColumn(amp, width, height, x, roof * k580, mobile * k580, Math.max(mobile, swept) * k580, strength, push);
    };
    aquifer(layers.storage, frame.h, frame.hMax, 1, true);
    aquifer(layers.overlying, frame.h2, frame.h2Max, 0.95, false);
  }
  return amp;
};

// A 128 x 128 tile of faint noise. It tiles without a seam. It replaces a sine formula for each pixel.
const heroSurveyNoise = (() => {
  let tile = null;
  return () => {
    if (tile) return tile;
    tile = new Float32Array(128 * 128);
    let seed = 33;
    const rand = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const w = Math.PI * 2 / 128;
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
      tile[y * 128 + x] = 0.05 * Math.sin(w * 18 * y + 2.2 * Math.sin(w * x + 0.3 * Math.sin(w * y))) * (0.55 + 0.45 * Math.sin(w * x + w * y)) + 0.03 * (rand() - 0.5);
    }
    return tile;
  };
})();

// The colour table: 511 packed RGBA values for the amplitudes -1 .. 1. Dark ground, cream for positive, blue for negative.
const heroSurveyPalette = (() => {
  let table = null;
  return () => {
    if (table) return table;
    const Z = [13, 18, 25], P = [238, 243, 248], N = [63, 127, 217];
    const little = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
    table = new Uint32Array(511);
    for (let i = 0; i < 511; i++) {
      const v = (i - 255) / 255, m = Math.pow(Math.abs(v), 0.8), c = v >= 0 ? P : N;
      const r = Math.round(Z[0] + (c[0] - Z[0]) * m), g = Math.round(Z[1] + (c[1] - Z[1]) * m), b = Math.round(Z[2] + (c[2] - Z[2]) * m);
      table[i] = little ? ((238 << 24) | (b << 16) | (g << 8) | r) >>> 0 : ((r << 24) | (g << 16) | (b << 8) | 238) >>> 0;
    }
    return table;
  };
})();
// ---- end hero survey helpers

// The image of the next survey. The store holds one image at most. The pass takes it, and the pass drops it.
const heroSurveyStore = { run: null, year: null, image: null, w: 0, h: 0 };

// Build the difference image of one survey year at the CSS size of the section. The result is an offscreen canvas.
const heroSurveyBuild = (run, year, width, height, left) => {
  const frame = heroFrameAt(run, year);
  const amp = heroSurveyAmplitude(frame, { storage: heroStorage, overlying: heroOverlying }, width, height, left);
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  const data = ctx.createImageData(width, height), out = new Uint32Array(data.data.buffer);
  const table = heroSurveyPalette(), noise = heroSurveyNoise();
  for (let y = 0; y < height; y++) {
    const row = y * width, nrow = (y & 127) * 128;
    for (let x = Math.floor(left); x < width; x++) {
      const v = amp[row + x] + noise[nrow + (x & 127)];
      out[row + x] = table[Math.round((v < -1 ? -1 : v > 1 ? 1 : v) * 255) + 255];
    }
  }
  ctx.putImageData(data, 0, 0);
  // Wiggle traces: only on the strong reflections, one trace every 16 px, in one stroke.
  ctx.strokeStyle = 'rgba(230,236,244,0.32)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  for (let x0 = Math.floor(left) + 8; x0 < width; x0 += 16) {
    let pen = false;
    for (let y = 0; y < height; y++) {
      const a = amp[y * width + x0];
      if (Math.abs(a) < 0.14) { pen = false; continue; }
      const x = x0 + 6 * (a < -1 ? -1 : a > 1 ? 1 : a);
      if (pen) ctx.lineTo(x, y); else { ctx.moveTo(x, y); pen = true; }
    }
  }
  ctx.stroke();
  return canvas;
};

// The size of the image for one section: whole CSS pixels, and at most 1600 px wide.
const heroSurveySizeOf = section => {
  const rect = section.getBoundingClientRect();
  return { width: Math.min(HERO_SURVEY_MAX_WIDTH, Math.round(rect.width)), height: Math.round(rect.height) };
};

const heroSurveyIdle = fn => {
  if (window.requestIdleCallback) {
    const id = window.requestIdleCallback(fn, { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 250);
  return () => clearTimeout(id);
};

// Build the image of the next survey when the browser is idle. The result stays in the store. A new call replaces it.
// The return value cancels a build that did not start yet.
const heroSurveyPrepare = (run, year, sectionRef) => {
  if (!run || year === null) return undefined;
  if (heroSurveyStore.run === run && heroSurveyStore.year === year && heroSurveyStore.image) return undefined;
  return heroSurveyIdle(() => {
    const section = sectionRef.current;
    if (!section) return;
    const { width, height } = heroSurveySizeOf(section);
    if (!width || !height) return;
    heroSurveyStore.image = heroSurveyBuild(run, year, width, height, heroSurveyLeft(width));
    Object.assign(heroSurveyStore, { run, year, w: width, h: height });
  });
};

// Draw one frame of the pass at the pass time u. The engine owns the image and the sizes. React never sees a frame.
const heroSurveyEngine = (canvas, sectionRef, run, year, reduced) => {
  const ctx = canvas.getContext('2d');
  const size = { w: 0, h: 0, ratio: 1, secTop: 0, secH: 0, left: 100, font: '' };
  let image = null;
  const label = `4D survey · year ${year}`;
  const WATERLINE = 44; // px from the top of the canvas to the sea level
  const SHIP_Y = WATERLINE - 20;

  const ensureImage = () => {
    const section = sectionRef.current;
    if (!section) return;
    const need = heroSurveySizeOf(section);
    if (image && image.width === need.width && image.height === need.height) return;
    const s = heroSurveyStore;
    if (s.image && s.run === run && s.year === year && s.w === need.width && s.h === need.height) image = s.image;
    else if (need.width && need.height) image = heroSurveyBuild(run, year, need.width, need.height, heroSurveyLeft(need.width));
  };

  const chip = (x, y, alpha) => {
    const phone = size.w <= 600, fs = phone ? 8.6 : 11, pad = phone ? 4.5 : 7;
    ctx.font = `500 ${fs}px ${size.font}`;
    const w = ctx.measureText(label).width + pad * 2, h = fs * 1.42 + pad * 1.2;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(8,15,25,0.84)';
    ctx.strokeStyle = 'rgba(232,237,242,0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 5); else ctx.rect(x, y, w, h);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#eef3f8';
    ctx.fillText(label, x + pad, y + pad * 0.6 + fs * 1.0);
    ctx.globalAlpha = 1;
  };

  const ship = (x, dir, now, streamer) => {
    ctx.save();
    ctx.translate(x, SHIP_Y);
    ctx.scale(dir, 1);
    for (let i = 0; i < 5; i++) {
      const y = 0.8 + i * 1.5, len = streamer * (0.93 + i * 0.03);
      ctx.strokeStyle = `rgba(150,170,190,${(0.5 - i * 0.06).toFixed(2)})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(-14, 0.5); ctx.lineTo(-44, y); ctx.lineTo(-14 - len, y); ctx.stroke();
      ctx.fillStyle = Math.sin(now * 4 + i) > 0.2 ? '#ffd27a' : 'rgba(255,210,122,0.35)';
      ctx.beginPath(); ctx.arc(-14 - len, y, 1.2, 0, 6.283); ctx.fill();
    }
    ctx.fillStyle = '#22344a';
    ctx.beginPath(); ctx.moveTo(-16, -3); ctx.lineTo(12, -3); ctx.lineTo(18, -6); ctx.lineTo(14, 1); ctx.lineTo(-15, 1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3a4f69'; ctx.fillRect(2, -10, 10, 7); ctx.fillRect(5, -14, 4, 4);
    ctx.strokeStyle = '#4f6684'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-15, -3); ctx.lineTo(-12, -9); ctx.lineTo(-9, -3); ctx.stroke();
    ctx.fillStyle = '#f0cd8e'; for (const dx of [3.5, 6.5, 9.5]) ctx.fillRect(dx, -8, 1.4, 1.2);
    ctx.fillStyle = '#f6e3b8'; ctx.beginPath(); ctx.arc(7, -15, 0.9, 0, 6.283); ctx.fill();
    ctx.restore();
  };

  return {
    // Fit the canvas to its CSS box and read the place of the section in it.
    resize(ratio) {
      const box = canvas.getBoundingClientRect(), section = sectionRef.current;
      if (!box.width || !section) return false;
      const rect = section.getBoundingClientRect();
      size.w = box.width; size.h = box.height; size.ratio = ratio;
      size.secTop = rect.top - box.top; size.secH = rect.height;
      size.left = heroSurveyLeft(box.width);
      size.font = getComputedStyle(canvas).getPropertyValue('--sim-font-mono').trim() || 'ui-monospace, monospace';
      canvas.width = Math.round(box.width * ratio);
      canvas.height = Math.round(box.height * ratio);
      ensureImage();
      return true;
    },
    paint(s, now) {
      if (!size.w) return;
      const u = s.u, dir = s.dir;
      ctx.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
      ctx.clearRect(0, 0, size.w, size.h);
      if (u < 0 || u > HERO_SURVEY_TOTAL) return;
      const fade = heroSurveyFade(u), { w, left, secTop, secH } = size;
      const gun = heroSurveyShipX(u, dir, w) - 30 * dir;
      const edge = reduced ? (dir > 0 ? w + 24 : -24) : u >= HERO_SURVEY_CROSS ? (dir > 0 ? w + 24 : -24) : gun;
      if (image) {
        ctx.save();
        ctx.beginPath(); ctx.rect(0, secTop, w, secH); ctx.clip();
        for (const strip of heroSurveyStrips(edge, dir, left, w)) {
          ctx.globalAlpha = fade * strip.a;
          ctx.save();
          ctx.beginPath(); ctx.rect(strip.x, secTop, strip.w, secH); ctx.clip();
          ctx.drawImage(image, 0, secTop, w, secH);
          ctx.restore();
        }
        ctx.restore();
        ctx.globalAlpha = 1;
        if (reduced || heroSurveyChipShown(edge, dir, left, w)) chip(left + 10, secTop + 8, fade);
      }
      if (reduced) return;
      // Shots: the wavefronts go down through the sea and the rock from the gun point at the sea level.
      if (u < HERO_SURVEY_CROSS + 1.2) {
        ctx.save();
        ctx.beginPath(); ctx.rect(0, WATERLINE, w, size.h); ctx.clip();
        const last = Math.floor(Math.min(u, HERO_SURVEY_CROSS) / HERO_SURVEY_SHOT);
        ctx.lineWidth = 1;
        for (let n = last; n >= Math.max(0, last - 5); n--) {
          const ts = n * HERO_SURVEY_SHOT, r = (u - ts) * HERO_SURVEY_RING;
          if (r > HERO_SURVEY_RING_MAX || r < 0) continue;
          ctx.strokeStyle = `rgba(214,228,242,${(0.42 * (1 - r / HERO_SURVEY_RING_MAX)).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(heroSurveyShipX(ts, dir, w) - 30 * dir, WATERLINE, r, 0.06, Math.PI - 0.06); ctx.stroke();
        }
        ctx.restore();
      }
      // The ship tows five streamers. The platform has a higher z-index, so the ship passes behind it.
      if (u <= HERO_SURVEY_CROSS + 0.3) ship(heroSurveyShipX(u, dir, w), dir, now, Math.min(270, 0.2 * w));
    },
  };
};

// One canvas over the hero. The loop runs only while the clock runs, the hero is in view and the tab is visible.
// The clock owns the pass time. This component reads it from the shared ref, so React does not render for each frame.
const HeroSurvey = ({ sectionRef, run, surveyRef, year, playing, visible, hidden }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const reduced = useMemo(() => siteReducedMotion(), []);
  const running = heroShouldTick({ playing, visible, hidden });

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = heroSurveyEngine(canvas, sectionRef, run, year, reduced);
    engineRef.current = engine;
    const fit = () => {
      if (engine.resize(Math.min(1.5, window.devicePixelRatio || 1))) engine.paint(surveyRef.current, performance.now() / 1000);
    };
    fit();
    const sizes = 'ResizeObserver' in window ? new ResizeObserver(fit) : null;
    if (sizes) { sizes.observe(canvas); sizes.observe(sectionRef.current); }
    return () => {
      if (sizes) sizes.disconnect();
      engineRef.current = null;
      // The pass is over: drop the image.
      Object.assign(heroSurveyStore, { run: null, year: null, image: null, w: 0, h: 0 });
    };
  }, []);

  useEffect(() => {
    if (!running) {
      if (engineRef.current) engineRef.current.paint(surveyRef.current, performance.now() / 1000);
      return undefined;
    }
    let frameId = 0, last = 0;
    const tick = now => {
      frameId = requestAnimationFrame(tick);
      if (last && now - last < HERO_SURVEY_FRAME_MS) return;
      last = now;
      if (engineRef.current) engineRef.current.paint(surveyRef.current, now / 1000);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [running]);

  return <canvas ref={canvasRef} className="hero-survey" aria-hidden="true" data-survey-year={year} />;
};
