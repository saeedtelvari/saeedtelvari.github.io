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
const HERO_WEATHER_DEFAULT = { wind: 6, cloud: 0.35, fog: 0, moon: 1 };

// The shader. Distances are in CSS pixels, so the sea looks the same on every screen width.
const HERO_SEA_VERT = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }';
const HERO_SEA_FRAG = `
  #extension GL_OES_standard_derivatives : enable
  precision highp float;
  uniform vec2 uRes; uniform float uTime; uniform float uMoonX; uniform float uScale;
  uniform float uWind; uniform float uMoon; uniform float uFog;
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
    col += vec3(0.018, 0.028, 0.045) * band * (1.0 - 0.6 * v);
    // The moon path: a soft column. Inside it most cells hold a dash, and the dashes turn moon-white.
    float mw = 8.0 + 72.0 * v;
    float mc = exp(-pow((X - uMoonX * cssW) / mw, 2.0)) * uMoon;
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
    float a = (0.14 + 0.24 * v) * side * (0.7 + 0.3 * wind);
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
        w: f(0.45 + 0.9 * t), o: f(0.25 + 0.7 * (1 - Math.abs(off) / half)),
      });
    }
  }
  return { layers, sets, tiles: Math.ceil(width / tile) + 1, tile };
};

const HeroSeaSvg = ({ width, height, moonX, weather }) => {
  const sea = useMemo(() => heroSeaVector(width, height, moonX), [width, height, moonX]);
  const glintTimes = [[2.6, 0], [3.4, -1.3], [2.1, -0.7], [2.9, -2]];
  const wind = Math.max(0.1, weather.wind / 6);
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
                  <path d={layer.crest} stroke="#9cb9dd" strokeOpacity={heroSeaRound(layer.opacity * (0.7 + 0.3 * wind))} strokeWidth={layer.strokeW} />
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

// Compile the program. It throws when the extension or the program is not available.
const heroSeaProgram = canvas => {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl || !gl.getExtension('OES_standard_derivatives')) throw new Error('WebGL is not available');
  const shader = (type, source) => {
    const object = gl.createShader(type);
    gl.shaderSource(object, source);
    gl.compileShader(object);
    if (!gl.getShaderParameter(object, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(object));
    return object;
  };
  const program = gl.createProgram();
  const vertex = shader(gl.VERTEX_SHADER, HERO_SEA_VERT), fragment = shader(gl.FRAGMENT_SHADER, HERO_SEA_FRAG);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniforms = {};
  ['uRes', 'uTime', 'uMoonX', 'uScale', 'uWind', 'uMoon', 'uFog'].forEach(name => { uniforms[name] = gl.getUniformLocation(program, name); });
  const free = () => {
    gl.deleteBuffer(buffer);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    gl.deleteProgram(program);
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
  };
  return { gl, uniforms, free };
};

// Send the weather to the shader.
const heroSeaApplyWeather = (gl, uniforms, weather) => {
  gl.uniform1f(uniforms.uWind, weather.wind);
  gl.uniform1f(uniforms.uMoon, weather.moon);
  gl.uniform1f(uniforms.uFog, weather.fog);
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

const HeroSea = ({ weather = HERO_WEATHER_DEFAULT }) => {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const weatherRef = useRef(weather);
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

  useEffect(() => {
    if (mode !== 'gl') return undefined;
    const wrap = wrapRef.current, canvas = canvasRef.current;
    let program;
    try {
      program = heroSeaProgram(canvas);
    } catch (error) {
      setMode('svg');
      return undefined;
    }
    const { gl, uniforms } = program;
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const start = performance.now();
    let frame = 0, last = 0, onScreen = true, lost = false;

    const draw = now => {
      const scale = Math.min(HERO_SEA_DPR_CAP, window.devicePixelRatio || 1);
      const width = Math.max(1, Math.round(wrap.clientWidth * scale)), height = Math.max(1, Math.round(wrap.clientHeight * scale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uniforms.uRes, width, height);
      gl.uniform1f(uniforms.uScale, scale);
      gl.uniform1f(uniforms.uTime, (now - start) / 1000 + 20);
      gl.uniform1f(uniforms.uMoonX, wrap.clientWidth ? heroSeaMoonX(wrap) / wrap.clientWidth : 0.955);
      heroSeaApplyWeather(gl, uniforms, weatherRef.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const loop = now => {
      frame = window.requestAnimationFrame(loop);
      if (now - last < HERO_SEA_FRAME_MS - 1) return;
      last = now;
      draw(now);
    };
    const stop = () => { window.cancelAnimationFrame(frame); frame = 0; };
    // The loop runs only while the hero is on screen, the tab is visible and motion is allowed.
    const update = () => {
      const run = onScreen && !document.hidden && !reduceQuery.matches && !lost;
      if (run && !frame) frame = window.requestAnimationFrame(loop);
      if (!run) stop();
      if (!lost && !run) draw(performance.now());
    };
    const onLost = event => {
      event.preventDefault();
      lost = true;
      stop();
      setMode('svg');
    };
    canvas.addEventListener('webglcontextlost', onLost);
    document.addEventListener('visibilitychange', update);
    reduceQuery.addEventListener('change', update);
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      update();
    }) : null;
    if (observer) observer.observe(wrap);
    // A resize draws one frame at once, also under reduced motion.
    const sizes = 'ResizeObserver' in window ? new ResizeObserver(() => { if (!lost) draw(performance.now()); }) : null;
    if (sizes) sizes.observe(wrap);
    update();
    return () => {
      stop();
      canvas.removeEventListener('webglcontextlost', onLost);
      document.removeEventListener('visibilitychange', update);
      reduceQuery.removeEventListener('change', update);
      if (observer) observer.disconnect();
      if (sizes) sizes.disconnect();
      program.free();
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
