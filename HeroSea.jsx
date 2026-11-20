/* =====================================================
   HeroSea - the sea strip of the hero, from the horizon to the cut line.
   Option C: a WebGL shader that draws ripple arcs, flat tone bands, the moon path as short dashes
   and a moonlit horizon line. Option A: an SVG sea with the same look, used when WebGL fails.
   The platform component draws the lamp reflections on top of this strip.
   ===================================================== */

// One place for the weather. The defaults give the approved look.
// wind: m/s, drives the ripple speed, the arc density and the stroke contrast.
// cloud: 0..1, not used by the sea yet. The sky can read it later.
// fog: 0..1, the haze on the horizon.
// moon: 0..1, how visible the moon, its path and the horizon line are.
// rain: 0..1, how much rain the sky draws. waves: wave height in metres, for the swell of the carrier.
// The sky and the carrier read rain and waves. The sea reads rain only through the light on the water.
const HERO_WEATHER_DEFAULT = { wind: 6, cloud: 0.35, fog: 0, moon: 1, rain: 0.5, waves: 1.2 };

// The light on the water, 0.4 to 1. The moon (it already holds cloud and fog) sets it and rain lowers it.
// The ripple arcs and the flat-tone highlights scale with it. The moon path does not.
const heroSeaLight = weather => {
  const moon = weather.moon >= 0 ? weather.moon : 1, rain = weather.rain >= 0 ? weather.rain : 0;
  return Math.min(1, Math.max(0.4, 0.5 + 0.5 * moon - 0.15 * rain));
};

// The shader. Distances are in CSS pixels, so the sea looks the same on every screen width.
const HERO_SEA_VERT = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }';
const HERO_SEA_FRAG = `
  #extension GL_OES_standard_derivatives : enable
  precision highp float;
  uniform vec2 uRes; uniform float uTime; uniform float uMoonX; uniform float uScale;
  uniform float uWind; uniform float uMoon; uniform float uFog; uniform float uLight;
  const float CAM_H = 30.0, TAN_X = 0.58, TAN_BOTTOM = 0.064;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
  // One row of drawn ripples: short arcs. Far arcs are short because s follows the perspective.
  float arcs(float rows, float s, float on, float w, float seed){
    float row = floor(rows);
    float cell = floor(s + hash(vec2(row, seed)) * 7.0);
    float u = fract(s + hash(vec2(row, seed)) * 7.0);
    float h = hash(vec2(cell, row + seed));
    float len = mix(0.45, 0.85, hash(vec2(cell + 3.1, row + seed)));
    float along = 1.0 - smoothstep(len * 0.5 - 0.06, len * 0.5, abs(u - 0.5));
    float hump = 0.16 * (1.0 - pow((u - 0.5) / (len * 0.5), 2.0));
    float d = abs(fract(rows + hump) - 0.5);
    float aa = fwidth(rows);
    float line = 1.0 - smoothstep((w - 0.5) * aa, (w + 0.5) * aa, d);
    float keep = 1.0 - smoothstep(0.32, 0.6, aa);   // rows closer than about 2 px merge into the tone
    return line * along * step(1.0 - on, h) * keep;
  }
  void main(){
    vec2 uv = gl_FragCoord.xy / uRes;
    float v = 1.0 - uv.y;                           // 0 at the horizon, 1 at the cut line
    float cssW = uRes.x / uScale;
    float X = uv.x * cssW;                          // CSS pixels from the left edge
    float sx = (X - cssW * 0.5) / 720.0 * TAN_X;
    float sy = max(v * TAN_BOTTOM, 0.0006);
    float t = CAM_H / sy;
    float px = sx * t;
    float wind = uWind / 6.0;                       // 1.0 for the approved look
    vec3 cHor = vec3(0.169, 0.259, 0.388), cMid = vec3(0.071, 0.133, 0.231), cNear = vec3(0.016, 0.039, 0.082);
    vec3 col = mix(cHor, cMid, smoothstep(0.0, 0.42, v));
    col = mix(col, cNear, smoothstep(0.42, 1.0, v));
    // Rows of crests come towards the viewer. Far rows creep, near rows move faster.
    float r1 = 30.0 * pow(v, 0.556) - uTime * 0.28 * wind;
    float r2 = 19.0 * pow(v, 0.6) - uTime * 0.19 * wind + 0.5;
    float band = step(0.56, noise(vec2(px * 0.0012, r2 * 0.22)));
    col += vec3(0.018, 0.028, 0.045) * band * (1.0 - 0.6 * v) * uLight;
    // The moon path: a soft column. Inside it most cells hold a dash, and the dashes turn moon-white.
    float mw = 8.0 + 72.0 * v;
    // The carrier stands under the moon. The path is weak far away, where it shows above the tanks,
    // and strong on the near water in front of the ship.
    float mc = exp(-pow((X - uMoonX * cssW) / mw, 2.0)) * uMoon * mix(0.25, 1.0, smoothstep(0.3, 0.75, v));
    col += vec3(0.79, 0.85, 0.93) * 0.08 * mc * (1.0 - 0.4 * v);
    float w = mix(0.35, 1.05, v);
    float s1 = px * 0.06, s2 = px * 0.045;
    float density = clamp(0.6 + 0.4 * wind, 0.0, 1.3);
    float on1 = mix(0.5, 0.9, mc) * density, on2 = mix(0.38, 0.8, mc) * density;
    float c1 = arcs(r1, s1, on1, w, 1.0);
    float c2 = arcs(r2, s2, on2, w * 0.8, 9.0) * 0.75;
    float tr = arcs(r1 + 0.2, s1, on1, w * 1.25, 1.0) * smoothstep(0.4, 0.75, v);
    // Ripples catch more light on the moon side. Wind raises the contrast of the strokes.
    float side = mix(0.45, 1.0, smoothstep(0.2, 0.8, uv.x));
    float a = (0.14 + 0.24 * v) * side * (0.7 + 0.3 * wind) * uLight;   // uLight dims the arcs on dark, rainy nights
    vec3 rip = vec3(0.525, 0.651, 0.8);             // #86a6cc
    vec3 cc = mix(rip, vec3(0.93, 0.96, 0.99), mc);
    float ca = mix(a, 0.95, mc * 0.9);
    col = mix(col, vec3(0.008, 0.024, 0.05), tr * 0.5);
    col = mix(col, cc, clamp((c1 + c2) * ca, 0.0, 1.0));
    // A thin moonlit line on the horizon, brightest under the moon.
    float hz = 1.0 - smoothstep(0.0, 0.014, v);
    col = mix(col, vec3(0.78, 0.84, 0.92), hz * mix(0.15, 0.6, smoothstep(0.45, 0.85, uv.x)) * uMoon);
    // Fog: haze over the far water.
    col = mix(col, vec3(0.43, 0.52, 0.63), uFog * (1.0 - 0.7 * v) * 0.7);
    gl_FragColor = vec4(col, 1.0);
  }`;

const HERO_SEA_FRAME_MS = 1000 / 30; // draw at most 30 frames per second
const HERO_SEA_DPR_CAP = 2;
const HERO_SEA_IDLE_MS = 2000; // the longest wait for an idle moment before the shader starts

const heroSeaRandom = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const heroSeaRound = n => Math.round(n * 100) / 100;

// Build the SVG sea: three ripple layers, the moon column and the glints.
// width and height are CSS pixels. moonX is the moon centre in CSS pixels from the left edge.
const heroSeaVector = (width, height, moonX) => {
  const f = heroSeaRound, tile = 360, h = height;
  const rowScale = Math.max(0.6, h / 88);
  const layer = (t0, t1, rows, seed, lenK, riseK, strokeW) => {
    const random = heroSeaRandom(seed);
    let crest = '', trough = '';
    rows = Math.max(4, Math.round(rows * rowScale));
    for (let j = 0; j < rows; j++) {
      const t = t0 + (t1 - t0) * (j + 0.5) / rows, y = h * t ** 1.55, len = 3 + lenK * t * t, rise = 0.2 + riseK * t;
      for (let x = random() * len * 2; x < tile;) {
        const w = len * (0.55 + 0.9 * random());
        if (x + w < tile) {
          const c = y + (random() - 0.5) * rise;
          crest += `M${f(x)} ${f(c)}q${f(w / 2)} ${f(-rise)} ${f(w)} 0`;
          if (t > 0.35) trough += `M${f(x + w * 0.1)} ${f(c + rise * 0.9)}q${f(w * 0.4)} ${f(rise * 0.55)} ${f(w * 0.8)} 0`;
        }
        x += w * (1.3 + 1.9 * random());
      }
    }
    return { trough, crest, strokeW, opacity: f(0.12 + 0.2 * t1) };
  };
  const layers = [
    { ...layer(0, 0.3, 14, 11, 8, 0.4, 0.45), speed: 260 },
    { ...layer(0.3, 0.62, 9, 23, 18, 1.1, 0.7), speed: 170 },
    { ...layer(0.62, 1, 8, 37, 30, 2.2, 1.05), speed: 105 },
  ];
  const random = heroSeaRandom(7);
  const sets = [[], [], [], []];
  for (let j = 0; j < 40; j++) {
    const t = (j + 0.5) / 40, y = h * t ** 1.55, half = 6 + 70 * t;
    for (let k = 0, n = 2 + Math.round(6 * t); k < n; k++) {
      const off = (random() * 2 - 1) * half * (0.3 + 0.7 * random()), w = (1.2 + 10 * t) * (0.4 + random());
      sets[(j + k) % 4].push({
        d: `M${f(moonX + off - w / 2)} ${f(y)}q${f(w / 2)} ${f(-(0.25 + 1.1 * t))} ${f(w)} 0`,
        // Weak far away (above the carrier's tanks), strong on the near water, as in the shader.
        w: f(0.45 + 0.9 * t), o: f((0.25 + 0.7 * (1 - Math.abs(off) / half)) * (0.3 + 0.7 * Math.min(1, Math.max(0, (t - 0.3) / 0.45)))),
      });
    }
  }
  return { layers, sets, tiles: Math.ceil(width / tile) + 1, tile };
};

const HeroSeaSvg = ({ width, height, moonX, weather }) => {
  const sea = useMemo(() => heroSeaVector(width, height, moonX), [width, height, moonX]);
  const glintTimes = [[2.6, 0], [3.4, -1.3], [2.1, -0.7], [2.9, -2]];
  const wind = Math.max(0.1, weather.wind / 6);
  const light = heroSeaLight(weather);
  return (
    <svg className="hero-sea__svg" viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <defs>
        <linearGradient id="hs-sea" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#2b4263" /><stop offset=".12" stopColor="#1a2d4b" /><stop offset=".45" stopColor="#0d1a30" /><stop offset="1" stopColor="#040a15" />
        </linearGradient>
        <linearGradient id="hs-moonline" x1="0" y1="0" x2="1" y2="0">
          <stop offset=".45" stopColor="#9fb8d8" stopOpacity="0" /><stop offset=".82" stopColor="#c7d6ea" stopOpacity=".55" /><stop offset="1" stopColor="#9fb8d8" stopOpacity=".1" />
        </linearGradient>
        <linearGradient id="hs-path" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#c9d8ec" stopOpacity="0" /><stop offset=".5" stopColor="#c9d8ec" stopOpacity=".16" /><stop offset="1" stopColor="#c9d8ec" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hs-side" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#fff" stopOpacity=".45" /><stop offset=".5" stopColor="#fff" stopOpacity=".6" /><stop offset=".8" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity=".8" />
        </linearGradient>
        <linearGradient id="hs-fog" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#6e84a0" stopOpacity=".7" /><stop offset="1" stopColor="#6e84a0" stopOpacity=".2" />
        </linearGradient>
        <mask id="hs-mask"><rect width={width} height={height} fill="url(#hs-side)" /></mask>
      </defs>
      <rect width={width} height={height} fill="url(#hs-sea)" />
      <rect width={width} height="1.2" fill="url(#hs-moonline)" opacity={weather.moon} />
      <g mask="url(#hs-mask)">
        {sea.layers.map((layer, i) => (
          <g key={i} className="hero-sea__drift" style={{ '--sea-speed': `${heroSeaRound(layer.speed / wind)}s` }}>
            <g>
              {Array.from({ length: sea.tiles }, (_, k) => (
                <g key={k} transform={`translate(${k * sea.tile} 0)`} fill="none" strokeLinecap="round">
                  <path d={layer.trough} stroke="#02060d" strokeOpacity=".45" strokeWidth={heroSeaRound(layer.strokeW * 1.4)} />
                  <path d={layer.crest} stroke="#9cb9dd" strokeOpacity={heroSeaRound(layer.opacity * (0.7 + 0.3 * wind) * light)} strokeWidth={layer.strokeW} />
                </g>
              ))}
            </g>
          </g>
        ))}
      </g>
      <g opacity={weather.moon}>
        <path d={`M${moonX - 8} 0H${moonX + 8}L${moonX + 80} ${height}H${moonX - 80}Z`} fill="url(#hs-path)" />
        <g fill="none" stroke="#eef4fc" strokeLinecap="round">
          {sea.sets.map((set, i) => (
            <g key={i} className="hero-sea__glint" style={{ '--glint-time': `${glintTimes[i][0]}s`, '--glint-delay': `${glintTimes[i][1]}s` }}>
              {set.map((glint, k) => <path key={k} d={glint.d} strokeWidth={glint.w} strokeOpacity={glint.o} />)}
            </g>
          ))}
        </g>
      </g>
      {weather.fog > 0 && <rect width={width} height={height} fill="url(#hs-fog)" opacity={heroSeaRound(weather.fog * 0.7)} />}
    </svg>
  );
};

// Start the program. It throws when WebGL or the extension is not available.
// With KHR_parallel_shader_compile the browser compiles on another thread, so this call returns at once.
// Without it, the compile and the link run here, and the first status call waits for them.
const heroSeaBegin = canvas => {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl || !gl.getExtension('OES_standard_derivatives')) throw new Error('WebGL is not available');
  const parallel = gl.getExtension('KHR_parallel_shader_compile');
  const shader = (type, source) => {
    const object = gl.createShader(type);
    gl.shaderSource(object, source);
    gl.compileShader(object);
    return object;
  };
  const state = { gl, parallel, program: gl.createProgram(), vertex: null, fragment: null, buffer: null };
  state.vertex = shader(gl.VERTEX_SHADER, HERO_SEA_VERT);
  state.fragment = shader(gl.FRAGMENT_SHADER, HERO_SEA_FRAG);
  gl.attachShader(state.program, state.vertex);
  gl.attachShader(state.program, state.fragment);
  gl.linkProgram(state.program);
  state.free = () => {
    if (state.buffer) gl.deleteBuffer(state.buffer);
    gl.deleteShader(state.vertex);
    gl.deleteShader(state.fragment);
    gl.deleteProgram(state.program);
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
  };
  return state;
};

// True when the browser has finished the program. Without the extension, the answer is always yes.
const heroSeaDone = state => !state.parallel || state.gl.isContextLost() || !!state.gl.getProgramParameter(state.program, state.parallel.COMPLETION_STATUS_KHR);

// Check the program and set up the buffer and the uniforms. It throws when the program failed.
const heroSeaFinish = state => {
  const { gl, program } = state;
  if (gl.isContextLost()) throw new Error('The WebGL context is lost');
  if (!gl.getShaderParameter(state.vertex, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(state.vertex));
  if (!gl.getShaderParameter(state.fragment, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(state.fragment));
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  state.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, state.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniforms = {};
  ['uRes', 'uTime', 'uMoonX', 'uScale', 'uWind', 'uMoon', 'uFog', 'uLight'].forEach(name => { uniforms[name] = gl.getUniformLocation(program, name); });
  return { gl, uniforms, free: state.free };
};

// Send the weather to the shader.
const heroSeaApplyWeather = (gl, uniforms, weather) => {
  gl.uniform1f(uniforms.uWind, weather.wind);
  gl.uniform1f(uniforms.uMoon, weather.moon);
  gl.uniform1f(uniforms.uFog, weather.fog);
  gl.uniform1f(uniforms.uLight, weather.light === undefined ? 1 : weather.light);
};

// The centre of the moon, in CSS pixels from the left edge of the strip.
const heroSeaMoonX = wrap => {
  const rect = wrap.getBoundingClientRect();
  const sky = wrap.closest('[data-layer="sky"]') || wrap.parentElement;
  const moon = sky && sky.querySelector('.hero-moon');
  if (!moon) return rect.width * 0.955;
  const box = moon.getBoundingClientRect();
  return box.left + box.width / 2 - rect.left;
};

// Link the program on a canvas. The canvas is on the page or it is an OffscreenCanvas in a worker.
// It calls ready(program) or fail(error). It returns a function that cancels the start.
// With the parallel extension it asks on later animation frames if the browser has finished.
const heroSeaStart = (canvas, ready, fail) => {
  const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : fn => setTimeout(() => fn(0), 16);
  const caf = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : clearTimeout;
  let state = null, id = 0, cancelled = false;
  const step = () => {
    id = 0;
    if (cancelled) return;
    if (!heroSeaDone(state)) {
      id = raf(step);
      return;
    }
    let program;
    try {
      program = heroSeaFinish(state);
    } catch (error) {
      state.free();
      state = null;
      fail(error);
      return;
    }
    state = null;
    ready(program);
  };
  try {
    state = heroSeaBegin(canvas);
  } catch (error) {
    fail(error);
    return () => {};
  }
  step();
  return () => {
    cancelled = true;
    if (id) caf(id);
    if (state) state.free();
    state = null;
  };
};

// The draw loop of a ready program. params holds the size in device pixels, the scale, the moon position
// (0..1 of the width) and the weather. set() changes them. run(true) draws at most 30 frames per second.
// run(false) stops the loop and draws one frame.
const heroSeaDriver = (program, canvas) => {
  const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : fn => setTimeout(() => fn(performance.now()), 16);
  const caf = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : clearTimeout;
  const { gl, uniforms } = program;
  const params = { width: 1, height: 1, scale: 1, moonX: 0.955, wind: 6, moon: 1, fog: 0, light: 1 };
  const start = performance.now();
  let frame = 0, last = 0;
  const draw = now => {
    const width = Math.max(1, params.width), height = Math.max(1, params.height);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    gl.uniform2f(uniforms.uRes, width, height);
    gl.uniform1f(uniforms.uScale, params.scale);
    gl.uniform1f(uniforms.uTime, (now - start) / 1000 + 20);
    gl.uniform1f(uniforms.uMoonX, params.moonX);
    heroSeaApplyWeather(gl, uniforms, params);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const loop = now => {
    frame = raf(loop);
    if (now - last < HERO_SEA_FRAME_MS - 1) return;
    last = now;
    draw(now);
  };
  const stop = () => {
    if (frame) caf(frame);
    frame = 0;
  };
  return {
    set: (next, redraw) => {
      Object.assign(params, next);
      if (redraw && !frame) draw(performance.now());
    },
    run: on => {
      if (on && !frame) frame = raf(loop);
      if (!on) {
        stop();
        draw(performance.now());
      }
    },
    stop,
  };
};

// The worker. It owns the context, so the page never waits for the GPU to make it. The page sends
// init (the canvas, the first params, the run flag), set, run and free. The worker answers ready, fail or lost.
const heroSeaWorkerMain = () => {
  let stopStart = null, driver = null, program = null;
  const pending = { params: {}, run: false };
  self.onmessage = event => {
    const message = event.data;
    if (message.type === 'init') {
      const canvas = message.canvas;
      Object.assign(pending.params, message.params);
      pending.run = message.run;
      canvas.addEventListener('webglcontextlost', lost => {
        lost.preventDefault();
        self.postMessage({ type: 'lost' });
      });
      stopStart = heroSeaStart(canvas, ready => {
        program = ready;
        driver = heroSeaDriver(program, canvas);
        driver.set(pending.params, true);
        driver.run(pending.run);
        self.postMessage({ type: 'ready' });
      }, () => self.postMessage({ type: 'fail' }));
    } else if (message.type === 'set') {
      if (driver) driver.set(message.params, message.redraw);
      else Object.assign(pending.params, message.params);
    } else if (message.type === 'run') {
      pending.run = message.on;
      if (driver) driver.run(message.on);
    } else if (message.type === 'free') {
      if (stopStart) stopStart();
      if (driver) driver.stop();
      if (program) program.free();
      self.close();
    }
  };
};

// The source of the worker: the shader, the constants and the functions above, then the worker itself.
const heroSeaWorkerSource = () => [
  `const HERO_SEA_VERT = ${JSON.stringify(HERO_SEA_VERT)};`,
  `const HERO_SEA_FRAG = ${JSON.stringify(HERO_SEA_FRAG)};`,
  `const HERO_SEA_FRAME_MS = ${HERO_SEA_FRAME_MS};`,
  ...[['heroSeaBegin', heroSeaBegin], ['heroSeaDone', heroSeaDone], ['heroSeaFinish', heroSeaFinish],
    ['heroSeaApplyWeather', heroSeaApplyWeather], ['heroSeaStart', heroSeaStart], ['heroSeaDriver', heroSeaDriver]]
    .map(([name, fn]) => `const ${name} = ${fn.toString()};`),
  `(${heroSeaWorkerMain.toString()})();`,
].join('\n');

// A worker that draws to an OffscreenCanvas is used when the browser has it. The context is made in the worker.
const heroSeaCanUseWorker = canvas => typeof Worker === 'function' && typeof Blob === 'function' && typeof OffscreenCanvas === 'function'
  && typeof canvas.transferControlToOffscreen === 'function' && !!window.URL && typeof URL.createObjectURL === 'function';

const HeroSea = ({ weather = HERO_WEATHER_DEFAULT }) => {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const weatherRef = useRef(weather);
  const syncRef = useRef(null);
  weatherRef.current = weather;
  const [mode, setMode] = useState('gl');
  const [size, setSize] = useState({ width: 0, height: 0, moonX: 0 });

  // The SVG sea measures the strip. The shader reads the strip by itself.
  useEffect(() => {
    if (mode !== 'svg') return undefined;
    const wrap = wrapRef.current;
    const measure = () => {
      const rect = wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      setSize({ width: Math.round(rect.width), height: Math.round(rect.height), moonX: Math.round(heroSeaMoonX(wrap)) });
    };
    measure();
    if (!('ResizeObserver' in window)) return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [mode]);

  // A weather change goes to the shader at once. The strip does not build again.
  useEffect(() => {
    if (syncRef.current) syncRef.current(true);
  }, [weather]);

  // The shader starts after the page has loaded and the main thread is idle, so it is never on the critical path.
  // The context is made in a worker when the browser can do it. Until the program is ready, the strip shows the
  // flat tones of the sea (CSS). Then the canvas fades in.
  useEffect(() => {
    if (mode !== 'gl') return undefined;
    const wrap = wrapRef.current, canvas = canvasRef.current;
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let target = null, teardown = null, workerUrl = null, waiting = null;
    let cancelled = false, idleId = null, timerId = null, frameId = 0, onScreen = true;

    // The size in device pixels, the moon position and the weather, for the shader.
    const measure = () => {
      const scale = Math.min(HERO_SEA_DPR_CAP, window.devicePixelRatio || 1);
      const width = wrap.clientWidth, height = wrap.clientHeight, now = weatherRef.current;
      return {
        scale, width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)),
        moonX: width ? heroSeaMoonX(wrap) / width : 0.955, wind: now.wind, moon: now.moon, fog: now.fog, light: heroSeaLight(now),
      };
    };
    // The loop runs only while the hero is on screen, the tab is visible and motion is allowed.
    const wantRun = () => onScreen && !document.hidden && !reduceQuery.matches;
    const fail = () => { if (!cancelled) setMode('svg'); };

    // The program is ready. Watch the page and fade the canvas in.
    const attach = () => {
      if (cancelled) return;
      const update = () => target.run(wantRun());
      document.addEventListener('visibilitychange', update);
      reduceQuery.addEventListener('change', update);
      const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        update();
      }) : null;
      if (observer) observer.observe(wrap);
      // A resize draws one frame at once, also under reduced motion.
      const sizes = 'ResizeObserver' in window ? new ResizeObserver(() => target.set(measure(), true)) : null;
      if (sizes) sizes.observe(wrap);
      syncRef.current = redraw => target.set(measure(), redraw);
      wrap.setAttribute('data-ready', 'true');
      update();
      const free = teardown;
      teardown = () => {
        document.removeEventListener('visibilitychange', update);
        reduceQuery.removeEventListener('change', update);
        if (observer) observer.disconnect();
        if (sizes) sizes.disconnect();
        free();
      };
    };

    // The context is made on the page. It is the path for browsers without OffscreenCanvas.
    const beginLocal = () => {
      const cancelStart = heroSeaStart(canvas, program => {
        // The first frame waits for the next animation frame, so the link check and the draw are two short tasks.
        waiting = program;
        frameId = window.requestAnimationFrame(() => {
          frameId = 0;
          waiting = null;
          const driver = heroSeaDriver(program, canvas);
          const onLost = event => {
            event.preventDefault();
            fail();
          };
          canvas.addEventListener('webglcontextlost', onLost);
          target = driver;
          teardown = () => {
            canvas.removeEventListener('webglcontextlost', onLost);
            driver.stop();
            program.free();
          };
          driver.set(measure(), true);
          attach();
        });
      }, fail);
      teardown = cancelStart;
    };

    // The context is made in a worker. The page only sends small messages.
    const beginWorker = () => {
      let worker;
      try {
        workerUrl = URL.createObjectURL(new Blob([heroSeaWorkerSource()], { type: 'text/javascript' }));
        worker = new Worker(workerUrl);
      } catch (error) {
        return false;
      }
      const offscreen = canvas.transferControlToOffscreen();
      worker.onmessage = event => {
        const type = event.data.type;
        if (type === 'ready') {
          target = {
            set: (params, redraw) => worker.postMessage({ type: 'set', params, redraw }),
            run: on => worker.postMessage({ type: 'run', on }),
          };
          attach();
        } else if (type === 'fail' || type === 'lost') {
          fail();
        }
      };
      worker.onerror = fail;
      teardown = () => {
        worker.postMessage({ type: 'free' });
        worker.terminate();
      };
      worker.postMessage({ type: 'init', canvas: offscreen, params: measure(), run: wantRun() }, [offscreen]);
      return true;
    };

    const begin = () => {
      idleId = null;
      timerId = null;
      if (cancelled) return;
      if (!(heroSeaCanUseWorker(canvas) && beginWorker())) beginLocal();
    };
    const schedule = () => {
      if (cancelled) return;
      if (typeof window.requestIdleCallback === 'function') idleId = window.requestIdleCallback(begin, { timeout: HERO_SEA_IDLE_MS });
      else timerId = window.setTimeout(begin, 200);
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    return () => {
      cancelled = true;
      syncRef.current = null;
      window.removeEventListener('load', schedule);
      if (idleId !== null && window.cancelIdleCallback) window.cancelIdleCallback(idleId);
      if (timerId !== null) window.clearTimeout(timerId);
      if (frameId) window.cancelAnimationFrame(frameId);
      if (waiting) waiting.free();
      if (teardown) teardown();
      if (workerUrl) URL.revokeObjectURL(workerUrl);
    };
  }, [mode]);

  return (
    <div ref={wrapRef} className="hero-sea" data-sea={mode} aria-hidden="true">
      {mode === 'gl'
        ? <canvas ref={canvasRef} className="hero-sea__canvas" aria-hidden="true" />
        : size.width > 0 && <HeroSeaSvg width={size.width} height={size.height} moonX={size.moonX} weather={weather} />}
    </div>
  );
};
