// StoryStage.jsx — the story at the top of the homepage: one pinned stage, one canvas, HTML captions.
//
// RENDERER API (the art of each chapter plugs in here)
//
// STORY_RENDERERS is a global object. Its keys are the chapter ids: orbit, descent, rock, grid, ve, live.
// Each value is a renderer: { draw(ctx, frame), animated?, mount?(layer), unmount?() }.
//   draw(ctx, frame)  Draw the chapter. The canvas is cleared before each call.
//                     ctx is a 2D context, already scaled by dpr. Draw in CSS pixels, from (0, 0) to (width, height).
//                     ctx.save() and ctx.restore() surround the call.
//   frame             { local, p, width, height, dpr, time, reducedMotion, requestDraw }
//     local           Progress in this chapter, from 0 to 1.
//     p               Progress in the whole story, from 0 to 1.
//     width, height   Size of the stage in CSS pixels.
//     dpr             Pixel ratio of the canvas: the device pixel ratio, with a maximum of 2.
//     time            Milliseconds from the requestAnimationFrame timestamp. It is 0 in a static frame.
//     reducedMotion   true in the six static frames of the reduced-motion layout. local is 1 in these frames.
//     requestDraw     requestDraw() asks for one more draw. Call it when late data arrives (a fetch or a worker)
//                     or when a control changes the picture. Do not dispatch a scroll event for this.
//                     In the pinned stage: it draws the current chapter once, on the next animation frame.
//                     Calls that come before that frame make one draw. The stage draws only while it is on screen
//                     and the tab is visible. A call in any other state draws nothing at once. The stage keeps
//                     the call and draws once when the stage returns to the screen or the tab is visible again.
//                     In a static frame: it paints the canvas of that frame again on the next animation frame.
//                     Calls that come before that frame make one paint. A static frame paints also off screen,
//                     because it paints only once otherwise.
//                     A call inside draw() gives a draw on the following animation frame, not on this one.
//                     requestDraw is the same function in every frame of one stage or one static frame.
//                     A renderer can keep it and call it later, for example from an event handler.
//   animated          Set it to true if draw() reads frame.time. Then draw() runs on each animation frame while this
//                     chapter is current, the stage is on screen and the tab is visible.
//                     If it is not true, draw() runs only when p or the stage size changes, or after requestDraw.
//                     The stage reads animated before each draw and again after it. A renderer can set it to true
//                     inside draw() or in a getter: the next frame then runs with no other event.
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

const { useEffect, useRef, useState } = React;

// ---- story helpers (pure; tests/story-stage.test.js evaluates this block)
const STORY_SCREENS = 7;

const STORY_CHAPTERS = [
  { id: 'orbit', title: 'Orbit', from: 0, to: 0.10 },
  { id: 'descent', title: 'Descent', from: 0.10, to: 0.26 },
  { id: 'rock', title: 'Into the rock', from: 0.26, to: 0.44 },
  { id: 'grid', title: 'Rock to grid', from: 0.44, to: 0.60 },
  { id: 've', title: '3D to VE', from: 0.60, to: 0.80 },
  { id: 'live', title: 'Live VE', from: 0.80, to: 1 },
];

// How many captions each chapter has. A chapter with two captions switches at the middle.
const STORY_CAPTION_COUNT = { orbit: 1, descent: 1, rock: 2, grid: 2, ve: 2, live: 1 };

// The same values as the --story-* tokens in colors_and_type.css.
const STORY_COLORS = {
  sky: '#c9d6dc', sea: '#2f5866', land: '#c9b26b', sand: '#d8a657', shale: '#8c7f70', chalk: '#ece6d6',
  co2: '#3b6cf0', ch4: '#c8463d', ink: '#1f2a30', grid: '#fff4df', cream: '#f3efe4', muted: '#4a5a62',
};

// A number from lo to hi. NaN gives lo.
const storyClamp = (value, lo = 0, hi = 1) => (value > lo ? Math.min(value, hi) : lo);

// Story progress from the container's bounding-rect top. The stage is pinned for height - viewport pixels.
const storyProgress = ({ top, height, viewport }) => {
  const span = height - viewport;
  return span > 0 ? storyClamp(-top / span) : 0;
};

// The chapter at progress p, and the progress inside it. p = 1 gives the last chapter with local 1.
const storyChapterAt = p => {
  const at = storyClamp(p);
  const found = STORY_CHAPTERS.findIndex(chapter => at < chapter.to);
  const index = found < 0 ? STORY_CHAPTERS.length - 1 : found;
  const { id, from, to } = STORY_CHAPTERS[index];
  return { index, id, local: storyClamp((at - from) / (to - from)) };
};

const storyCaptionIndex = (id, local) => {
  const count = STORY_CAPTION_COUNT[id] || 1;
  return Math.min(count - 1, Math.floor(storyClamp(local) * count));
};

// Six fill fractions for the progress rail, one for each chapter.
const storyRail = p => STORY_CHAPTERS.map(({ from, to }) => storyClamp((p - from) / (to - from)));

// Splits a caption at the *marks* into plain and italic parts.
const storyInline = text => text.split('*').map((part, i) => ({ text: part, em: i % 2 === 1 })).filter(part => part.text);

// The count-up of the ppm number in chapter 0 takes this long.
const STORY_COUNT_MS = 1200;

// The whole number on the ppm line, ms milliseconds after the count starts. It goes from from to to with an ease-out curve.
const storyCount = (ms, from, to) => {
  const left = 1 - storyClamp(ms / STORY_COUNT_MS);
  return Math.round(from + (to - from) * (1 - left * left * left));
};
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
  if (onNavigate) { onNavigate(id, event); return; }
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
    if (query.addEventListener) query.addEventListener('change', update); else query.addListener(update);
    return () => { if (query.removeEventListener) query.removeEventListener('change', update); else query.removeListener(update); };
  }, []);
  return reduced;
};

const StoryText = ({ text }) => (
  <React.Fragment>
    {storyInline(text).map((part, i) => (part.em ? <em key={i}>{part.text}</em> : <React.Fragment key={i}>{part.text}</React.Fragment>))}
  </React.Fragment>
);

// The ppm line of chapter 0: "280 ppm in 1850. {value} ppm in {year}." (SITE_STORY.co2 holds the numbers).
// The value counts up from 280 once, when the page loads. A visitor with reduced motion sees the final value at once.
// While the number counts, a hidden copy of the final number is in the text, and the counting number is aria-hidden.
// A screen reader reads the final line. When the count ends, the line is plain text again.
const storyPpmPlayed = { done: false };

const StoryPpm = ({ on }) => {
  const { base, baseYear, year, value } = SITE_STORY.co2;
  const end = Math.round(value);
  const reduced = useStoryReducedMotion();
  const [count, setCount] = useState(storyPpmPlayed.done ? end : base);
  const shown = reduced ? end : count;

  useEffect(() => {
    if (reduced || storyPpmPlayed.done) return undefined;
    let id = 0;
    let start = 0;
    let last = base;
    const step = now => {
      if (!start) start = now;
      const next = storyCount(now - start, base, end);
      if (next !== last) { last = next; setCount(next); }
      if (now - start < STORY_COUNT_MS) id = requestAnimationFrame(step); else storyPpmPlayed.done = true;
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [reduced]);

  return (
    <p className="story-note story-fade" data-on={on}>
      {shown === end
        ? SITE_STORY.ppm
        : (
          <React.Fragment>
            {`${base} ppm in ${baseYear}. `}
            <span className="story-count" aria-hidden="true">{shown}</span>
            <span className="visually-hidden">{end}</span>
            {` ppm in ${year}.`}
          </React.Fragment>
        )}
    </p>
  );
};

// The words of one chapter. In the pinned story, on and caption say which parts the visitor sees now.
// A caption of null means that all captions are on.
const StoryWords = ({ chapter, on, caption, onNavigate }) => {
  const copy = SITE_STORY.captions[chapter.id] || [];
  const actions = chapter.id === 'live' ? SITE_STORY.actions : [];
  return (
    <React.Fragment>
      {chapter.id === 'orbit' && <h1 className="story-name story-fade" data-on={on}>{SITE_STORY.name}</h1>}
      <div className="story-stack">
        {copy.map((text, k) => (
          <p key={k} className="story-caption story-fade" data-on={on && (caption === null || k === caption)}><StoryText text={text} /></p>
        ))}
      </div>
      {chapter.id === 'orbit' && <StoryPpm on={on} />}
      {actions.length > 0 && (
        <div className="story-actions story-fade" data-on={on}>
          {actions.map((action, i) => (
            <a key={action.href} className={i === 0 ? 'story-btn story-btn--primary' : 'story-btn'} href={action.href}
              tabIndex={on ? undefined : -1}
              onClick={action.id ? event => storyGo(event, action.id, onNavigate) : undefined}>{action.label}</a>
          ))}
        </div>
      )}
    </React.Fragment>
  );
};

// The pinned story. One scroll listener and one animation frame loop draw the canvas from refs.
// React state holds only the chapter and the caption that the captions need.
const StoryPinned = ({ sectionRef, onNavigate }) => {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const layerRef = useRef(null);
  const railRef = useRef(null);
  const [view, setView] = useState({ index: 0, caption: 0 });

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
    let wanted = false;
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
      p = storyProgress({ top: box.top, height: box.height, viewport: height });
      current = storyChapterAt(p);
      const caption = storyCaptionIndex(current.id, current.local);
      if (current.index !== shown.index || caption !== shown.caption) {
        shown = { index: current.index, caption };
        setView(shown);
      }
      syncLayer(current.id);
      const entry = STORY_RENDERERS[current.id];
      // A chapter that is animated runs on each frame, but only while the stage is on screen and the tab is visible.
      // The stage reads animated here and again after the draw, because draw() can turn it on.
      const running = () => !!(entry && entry.animated) && awake();
      if (width && height && (dirty || p !== drawn || (wanted && awake()) || running())) {
        wanted = false;
        storyPaint(ctx, current.id, { local: current.local, p, width, height, dpr, time: now, reducedMotion: false, requestDraw });
        const fractions = storyRail(p);
        fills.forEach((fill, i) => { fill.style.transform = `scaleX(${fractions[i]})`; });
        drawn = p;
        dirty = false;
      }
      if (running()) schedule();
    };
    const schedule = () => { if (alive && !frame) frame = requestAnimationFrame(tick); };
    const awake = () => visible && !document.hidden;

    // The renderers call this one function, in each frame, to ask for one more draw of the current chapter.
    // Calls before the next animation frame make one draw. Off screen or in a hidden tab, the stage keeps the
    // call and draws when it is on screen again.
    const requestDraw = () => {
      wanted = true;
      if (awake()) schedule();
    };

    const onVisibility = () => { if (!document.hidden) schedule(); };
    const sizes = new ResizeObserver(() => { resize(); schedule(); });
    const watcher = new IntersectionObserver(entries => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) { dirty = true; schedule(); }
    });
    sizes.observe(stage);
    watcher.observe(section);
    window.addEventListener('scroll', schedule, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    // The canvas text changes when the web fonts arrive.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { dirty = true; schedule(); });
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

  return (
    <div ref={stageRef} className="story-stage" data-chapter={STORY_CHAPTERS[view.index].id}>
      <canvas ref={canvasRef} className="story-canvas" aria-hidden="true" />
      <div ref={layerRef} className="story-layer" />
      <div className="story-captions">
        {STORY_CHAPTERS.map((chapter, i) => (
          <div key={chapter.id} className="story-chapter" data-chapter={chapter.id} data-active={i === view.index}>
            <StoryWords chapter={chapter} on={i === view.index} caption={view.caption} onNavigate={onNavigate} />
          </div>
        ))}
      </div>
      <div ref={railRef} className="story-rail" aria-hidden="true">
        {STORY_CHAPTERS.map(chapter => <span key={chapter.id}><i /></span>)}
      </div>
    </div>
  );
};

// One static frame for the reduced-motion layout: a 16:9 canvas drawn once with local = 1, and its captions below.
const StoryFrame = ({ chapter, onNavigate }) => {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let alive = true;
    let queued = 0;
    // The renderer calls this in the frame to paint the canvas again, for example when late data arrives.
    // Calls before the next animation frame make one paint. The frame paints also while it is off screen.
    const requestDraw = () => {
      if (!alive || queued) return;
      queued = requestAnimationFrame(() => { queued = 0; paint(); });
    };
    const paint = () => {
      const width = box.clientWidth;
      const height = box.clientHeight;
      if (!alive || !width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, STORY_MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      storyPaint(ctx, chapter.id, { local: 1, p: chapter.to, width, height, dpr, time: 0, reducedMotion: true, requestDraw });
    };
    const sizes = new ResizeObserver(paint);
    sizes.observe(box);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint);
    paint();
    return () => { alive = false; if (queued) cancelAnimationFrame(queued); sizes.disconnect(); };
  }, [chapter]);

  return (
    <div className="story-frame" role="group" aria-label={chapter.title} data-chapter={chapter.id}>
      <div ref={boxRef} className="story-frame__art">
        <canvas ref={canvasRef} aria-hidden="true" />
      </div>
      <div className="story-frame__words">
        <StoryWords chapter={chapter} on caption={null} onNavigate={onNavigate} />
      </div>
    </div>
  );
};

const StoryStage = ({ onNavigate }) => {
  const sectionRef = useRef(null);
  const reduced = useStoryReducedMotion();
  return (
    <section ref={sectionRef} id="story" aria-label={SITE_STORY.label}
      className={reduced ? 'story story--static' : 'story story--pinned'}
      style={reduced ? undefined : { '--story-screens': STORY_SCREENS }}>
      <div className="story-skip-wrap">
        <a className="story-skip" href="#research" onClick={event => storyGo(event, 'research', onNavigate)}>Skip to research</a>
      </div>
      {reduced
        ? STORY_CHAPTERS.map(chapter => <StoryFrame key={chapter.id} chapter={chapter} onNavigate={onNavigate} />)
        : <StoryPinned sectionRef={sectionRef} onNavigate={onNavigate} />}
    </section>
  );
};

Object.assign(window, { StoryStage, STORY_RENDERERS });
