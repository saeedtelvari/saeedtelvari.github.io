// StoryStage.jsx — the story at the top of the homepage: one pinned stage, one canvas, HTML captions.
//
// THE STAGES
//
// The story has seven stages, one for each chapter: orbit, fields, descent, rock, grid, ve, live.
// Each stage owns one screen of scroll in #story. CSS scroll snap holds the page on the screen of one stage.
// One wheel notch, one flick or one key press moves the page by one stage. The scroll position does not draw the art.
// When the scroll settles on a stage, the stage plays by itself. Settle means the scrollend event, or a timer
// in a browser that has no scrollend. The local value of the stage goes from 0 to 1 over the time in
// STORY_DURATIONS, with a gentle ease. The stage live has no time: it is interactive.
//   - The visitor scrolls forward to a stage: the stage plays from local 0.
//   - The visitor scrolls back to a stage: the stage shows its end, local 1. It does not play backward.
//   - The visitor leaves a stage: its playback stops.
//   - A fast scroll through several stages plays only the stage on which the scroll settles.
//   - A hidden tab or an off-screen story pauses the playback. The playback goes on when the story is back.
//   - A wheel that moves the page by less than half of a screen can snap back to its own stage. The story then moves
//     one stage in the direction of the wheel (see storyWheelTarget). The wheel listener is passive and stops nothing.
//
// RENDERER API (the art of each chapter plugs in here)
//
// STORY_RENDERERS is a global object. Its keys are the chapter ids: orbit, fields, descent, rock, grid, ve, live.
// Each value is a renderer: { draw(ctx, frame), animated?, mount?(layer), unmount?() }.
//   draw(ctx, frame)  Draw the chapter. The canvas is cleared before each call.
//                     ctx is a 2D context, already scaled by dpr. Draw in CSS pixels, from (0, 0) to (width, height).
//                     ctx.save() and ctx.restore() surround the call.
//   frame             { local, p, width, height, dpr, time, reducedMotion, requestDraw }
//     local           Playback of this chapter, from 0 to 1. It follows the time of the stage, not the scroll.
//                     It is 0 when the visitor arrives, 1 at the end of the playback, and 1 when the visitor comes back.
//                     In live it is always 1. During a fast scroll, a stage that the visitor passes is drawn at
//                     local 0 (forward) or at local 1 (back).
//     p               Progress in the whole story, from 0 to 1: (stage index + local) / 7.
//     width, height   Size of the stage in CSS pixels.
//     dpr             Pixel ratio of the canvas: the device pixel ratio, with a maximum of 2.
//     time            Milliseconds from the requestAnimationFrame timestamp. It is 0 in a static frame.
//     reducedMotion   true in the seven static frames of the reduced-motion layout. local is 1 in these frames.
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
//                     p changes on each frame while a stage plays, so every stage draws on each frame then.
//                     The stage reads animated before each draw and again after it. A renderer can set it to true
//                     inside draw() or in a getter: the next frame then runs with no other event.
//   mount(layer)      Only the chapter live uses it. layer is an empty div that fills the stage.
//   unmount()         The layer takes pointer events while live is current. mount runs when the scroll settles on live.
//                     unmount runs when the visitor scrolls out of live. Neither runs in a static frame.
// A renderer that throws is reported once in the console. The story then goes on.
//
// Colours: STORY_COLORS has the same values as the --story-* tokens in colors_and_type.css.
// Captions are HTML above the canvas. The words are in SITE_STORY (site-content.js).
// The place of each caption is in colors_and_type.css: .story-chapter[data-chapter="id"].
// To change the caption colour for one chapter, set --story-text on .story-stage[data-chapter="id"].
// The site header covers the top 64 px of the stage. The skip control is at the top right under the header.
// The progress rail is in the bottom 12 px. Below 640 px of width, the captions are at the top: keep that band clear in the art.
// When the stage starts to leave, the rail fades out and the skip link rides up with the stage (see storyLeave).

const { useEffect, useRef, useState } = React;

// ---- story helpers (pure; tests/story-stage.test.js evaluates this block)
const STORY_CHAPTERS = [
  { id: 'orbit', title: 'Orbit' },
  { id: 'fields', title: 'North Sea map' },
  { id: 'descent', title: 'Descent' },
  { id: 'rock', title: 'Into the rock' },
  { id: 'grid', title: 'Rock to grid' },
  { id: 've', title: '3D to VE' },
  { id: 'live', title: 'Live VE' },
].map((chapter, i, all) => ({ ...chapter, from: i / all.length, to: (i + 1) / all.length }));

// One stage for each chapter. Each stage owns one screen of scroll in the story.
const STORY_SCREENS = STORY_CHAPTERS.length;

// The play time of each stage, in seconds. Change a number here to change the speed of a stage.
// The stage live has no time (0): it is interactive, so its local value is 1 as soon as the visitor arrives.
const STORY_DURATIONS = { orbit: 5, fields: 8, descent: 7, rock: 8, grid: 9, ve: 7, live: 0 };

// How many captions each chapter has. A chapter with two captions switches at the middle of the playback.
const STORY_CAPTION_COUNT = { orbit: 1, fields: 1, descent: 1, rock: 2, grid: 2, ve: 2, live: 1 };

// The same values as the --story-* tokens in colors_and_type.css.
const STORY_COLORS = {
  sky: '#c9d6dc', sea: '#2f5866', land: '#c9b26b', sand: '#d8a657', shale: '#8c7f70', chalk: '#ece6d6',
  co2: '#3b6cf0', ch4: '#c8463d', ink: '#1f2a30', grid: '#fff4df', cream: '#f3efe4', muted: '#4a5a62',
};

// A number from lo to hi. NaN gives lo.
const storyClamp = (value, lo = 0, hi = 1) => (value > lo ? Math.min(value, hi) : lo);

// Where the scroll stands, in screens from the top of the story: 0 is the first stage and 6 is the last.
// top is the bounding-rect top of the story. viewport is the height of one screen.
const storyPosition = ({ top, viewport }) => {
  const position = (0 - top) / viewport;
  return Number.isFinite(position) ? position : 0;
};

// The stage that is nearest to a scroll position in screens. A position outside the story gives the first or the last stage.
const storyStageAt = position => storyClamp(Math.round(position), 0, STORY_CHAPTERS.length - 1);

// The play time of a stage in milliseconds. 0 means that the stage does not play.
const storyDuration = id => (STORY_DURATIONS[id] > 0 ? STORY_DURATIONS[id] * 1000 : 0);

// The gentle ease: slow start, slow end, and the speed of a sine wave between them. It is 0 at 0 and 1 at 1.
const storyEase = t => 0.5 - 0.5 * Math.cos(Math.PI * storyClamp(t));

// The local value of a stage ms milliseconds after its playback starts. A stage with no time is always at its end.
const storyLocal = (id, ms) => {
  const total = storyDuration(id);
  return total > 0 ? storyEase(ms / total) : 1;
};

// Progress in the whole story at a stage and a local value.
const storyP = (index, local) => (index + storyClamp(local)) / STORY_CHAPTERS.length;

// Caption times that follow the art of a chapter: [show, switch] in local. Before show, the chapter shows no caption.
// rock starts on the platform scene, so its first caption waits until the cutaway window clears the caption area.
// Its second caption waits until the camera reaches the bottom of the well.
const STORY_CAPTION_TIMES = { rock: [0.1, 0.65] };

// The caption that a chapter shows at a local value: -1 (none yet), 0 or 1.
const storyCaptionIndex = (id, local) => {
  const count = STORY_CAPTION_COUNT[id] || 1;
  const times = STORY_CAPTION_TIMES[id];
  if (times) {
    if (storyClamp(local) < times[0]) return -1;
    return count > 1 && storyClamp(local) >= times[1] ? 1 : 0;
  }
  return Math.min(count - 1, Math.floor(storyClamp(local) * count));
};

// ---- the director: it decides what the stage shows. It has no timer and no DOM, so a test can run it.
// A state is { index, local, ms, mode, parked }.
//   mode 'play'  The scroll settled on the stage. local goes from 0 to 1 while ms grows.
//   mode 'rest'  The stage shows a fixed local: its end, or a stage with no time.
//   mode 'move'  The scroll is not settled. The stage shows its start (forward) or its end (back). Nothing plays.
//                parked is the stage that the visitor left. A visitor who comes back finds it as it was.
const storyPlay = index => {
  const playing = storyDuration(STORY_CHAPTERS[index].id) > 0;
  return { index, local: playing ? 0 : 1, ms: 0, mode: playing ? 'play' : 'rest', parked: null };
};

const storyEnd = index => ({ index, local: 1, ms: 0, mode: 'rest', parked: null });

// The scroll moved to the stage near. The stage that the visitor leaves stops.
// A stage ahead of it shows its start. A stage behind it shows its end. If nothing changes, the same state comes back.
const storyMove = (state, near) => {
  if (state.index === near) return state;
  const { index, local, ms, mode } = state;
  const parked = mode === 'move' ? state.parked : { index, local, ms, mode };
  const shown = near === parked.index ? parked.local : near > parked.index ? 0 : 1;
  return { index: near, local: shown, ms: 0, mode: 'move', parked };
};

// The scroll settled on the stage near. A state that is not 'move' does not change.
//   A stage ahead of the stage that the visitor left plays from its start.
//   A stage behind it shows its end.
//   The same stage goes on from where it stopped. A stage that was at its end stays at its end.
const storySettle = (state, near) => {
  const moved = storyMove(state, near);
  if (moved.mode !== 'move') return moved;
  const { parked } = moved;
  if (near === parked.index) return { ...parked, parked: null };
  return near > parked.index ? storyPlay(near) : storyEnd(near);
};

// The playback goes on by dt milliseconds. At the end of its time the stage rests with local 1.
const storyAdvance = (state, dt) => {
  if (state.mode !== 'play') return state;
  const { id } = STORY_CHAPTERS[state.index];
  const ms = state.ms + Math.max(0, dt);
  if (ms >= storyDuration(id)) return { ...state, ms: storyDuration(id), local: 1, mode: 'rest' };
  return { ...state, ms, local: storyLocal(id, ms) };
};

// The wait after the last scroll event before the story settles. A browser that has scrollend settles on that event,
// and the long wait is only a safety net. A browser with no scrollend uses the short wait. A new scroll event starts the wait again.
const STORY_SETTLE_MS = 150;
const STORY_SETTLE_SAFETY_MS = 800;

// The longest step of the playback clock. A longer gap between two frames is a pause that the page did not report.
const STORY_MAX_STEP_MS = 250;

// How close to a snap point, in screens, the scroll must be to count as at rest on a stage.
const STORY_REST_TOLERANCE = 0.02;

// The stage on which the page rests at a scroll position (in screens). It is -1 between two stages and below the last stage.
const storyRestAt = position => {
  const stage = Math.round(position) + 0;
  return stage >= 0 && stage < STORY_CHAPTERS.length && Math.abs(position - stage) < STORY_REST_TOLERANCE ? stage : -1;
};

// A wheel that moves the page less than half of a screen can snap back to the stage where it began. The wheel was an intent
// to move, so the story must move one stage in the direction of the wheel. This gives the stage to move to, or -1 for no move.
// from is the stage where the page rested before the wheel. direction is 1 (down) or -1 (up). position is where the page rests now.
const storyWheelTarget = (from, direction, position) => {
  const target = from + direction;
  const valid = from >= 0 && direction !== 0 && target >= 0 && target < STORY_CHAPTERS.length;
  return valid && storyRestAt(position) === from ? target : -1;
};
// ---- end the director

// The stage starts to leave when the bottom of the story rises above the bottom of the viewport.
// Then the progress rail fades out. The fade is as long as this share of the viewport height.
const STORY_EXIT_SPAN = 0.2;

// How far the stage has left: 0 while it is pinned, 1 when the fade ends. bottom is the bounding-rect bottom of the story.
const storyExit = ({ bottom, viewport }) => (viewport > 0 ? storyClamp((viewport - bottom) / (viewport * STORY_EXIT_SPAN)) : 0);

// Seven fill fractions for the progress rail. The stages before the current stage are full.
// The current stage fills with its playback. The stages after it are empty.
const storyRail = (index, local) => STORY_CHAPTERS.map((chapter, i) => (i < index ? 1 : i === index ? storyClamp(local) : 0));

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

// What happens to a part of the stage that must not stay on the page when the stage leaves.
// The rail fades (fade is true). The skip link does not fade: it rides up with the stage, and a half-clear
// link would not have enough contrast for a visitor who stops there. At exit 1 both are hidden, so the keyboard
// cannot reach them when they are off screen.
// The change follows the scroll position. It has no timer and no transition, so it needs no rule for reduced motion.
// A visitor with reduced motion gets the static frames, and these never run it.
const storyLeave = (element, exit, fade) => {
  if (!element) return;
  element.style.opacity = fade && exit > 0 ? String(1 - exit) : '';
  element.style.visibility = exit >= 1 ? 'hidden' : '';
};

// The "Skip to research" link. In the pinned stage it is in the stage, so it leaves with the stage.
const StorySkip = ({ onNavigate }) => (
  <a className="story-skip" href="#research" onClick={event => storyGo(event, 'research', onNavigate)}>Skip to research</a>
);

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
      {chapter.id === 'fields' && typeof StoryFieldsList === 'function' && <StoryFieldsList on={on} />}
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

/// The pinned story. One animation frame loop draws the canvas from refs. The scroll only chooses the stage.
// The stage plays by itself when the scroll settles on it (see the director above).
// React state holds only the chapter and the caption that the captions need.
const StoryPinned = ({ sectionRef, onNavigate }) => {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const layerRef = useRef(null);
  const railRef = useRef(null);
  const skipRef = useRef(null);
  const [view, setView] = useState({ index: 0, caption: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const layer = layerRef.current;
    const rail = railRef.current;
    const skip = skipRef.current;
    if (!section || !stage || !canvas || !layer || !rail) return undefined;
    const ctx = canvas.getContext('2d');
    const fills = Array.from(rail.querySelectorAll('i'));
    const hasScrollEnd = 'onscrollend' in window;
    let alive = true;
    let frame = 0;
    let visible = true;
    let dirty = true;
    let wanted = false;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let exit = 0;
    // The stage and the local value of the last draw. The end of one stage and the start of the next stage have the same p.
    let drawn = -1;
    let drawnIndex = -1;
    let director = storyPlay(0);
    // The time of the last frame of the playback. It is null while the playback is paused or not started.
    let clock = null;
    // The settle wait: 0, or the id of the timer.
    let timer = 0;
    let shown = view;
    let mounted = null;
    const filled = [];

    // The layer of the chapter live exists only while the scroll is settled on that chapter.
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

    // The stage that is nearest to the scroll position.
    const nearest = box => storyStageAt(storyPosition({ top: box.top, viewport: height }));

    // A wheel gesture can end where it began, because the page snapped back. Then the story moves one stage by itself,
    // in the direction of the wheel (see storyWheelTarget). A wheel that moved the page already needs no help.
    // The wheel listener is passive: it never stops or changes the wheel.
    // The browser scrolls before the page sees the wheel event. So the stage where the page rested at the last settle
    // is the start of the gesture. rested is -1 when the page was between two stages or below the last stage.
    let rested = -1;
    let wheel = { from: -1, direction: 0 };
    const onWheel = event => {
      if (!visible || event.ctrlKey || event.shiftKey || !event.deltaY) return;
      // A wheel over the list of the map data scrolls the list, not the story.
      if (event.target && event.target.closest && event.target.closest('.story-data__panel')) return;
      wheel = { from: wheel.direction === 0 ? rested : wheel.from, direction: event.deltaY > 0 ? 1 : -1 };
    };
    const helpWheel = position => {
      if (wheel.direction === 0 || storyRestAt(position) < 0) return;
      const { from, direction } = wheel;
      wheel = { from: -1, direction: 0 };
      if (storyWheelTarget(from, direction, position) >= 0) window.scrollBy({ top: direction * height, behavior: 'smooth' });
    };

    // The scroll is at rest. The stage under the viewport plays, or it shows its end (see storySettle).
    const settle = () => {
      clearTimeout(timer);
      timer = 0;
      if (!alive) return;
      const position = storyPosition({ top: section.getBoundingClientRect().top, viewport: height });
      helpWheel(position);
      rested = storyRestAt(position);
      const next = storySettle(director, storyStageAt(position));
      if (next === director) return;
      director = next;
      clock = null;
      schedule();
    };
    // Each scroll event starts the wait again. The event scrollend ends the wait at once.
    const waitForRest = () => {
      clearTimeout(timer);
      timer = setTimeout(settle, hasScrollEnd ? STORY_SETTLE_SAFETY_MS : STORY_SETTLE_MS);
    };
    const onScroll = () => { waitForRest(); schedule(); };

    const tick = now => {
      frame = 0;
      if (!alive) return;
      const box = section.getBoundingClientRect();
      // The rail fades out and the skip link hides while the stage leaves. They do not change while the story is pinned.
      const leaving = storyExit({ bottom: box.top + box.height, viewport: height });
      if (leaving !== exit) {
        exit = leaving;
        storyLeave(skip, exit, false);
        storyLeave(rail, exit, true);
      }
      // The scroll chooses the stage. A change of stage stops the playback of the old stage.
      director = storyMove(director, nearest(box));
      if (director.mode === 'move' && !timer) waitForRest();
      // The playback clock runs only while the stage is on screen and the tab is visible.
      if (director.mode === 'play' && awake()) {
        if (clock !== null) director = storyAdvance(director, Math.min(now - clock, STORY_MAX_STEP_MS));
        clock = now;
      } else {
        clock = null;
      }
      const { index, local } = director;
      const { id } = STORY_CHAPTERS[index];
      const p = storyP(index, local);
      const caption = storyCaptionIndex(id, local);
      if (index !== shown.index || caption !== shown.caption) {
        shown = { index, caption };
        setView(shown);
      }
      // A stage that the visitor passes in a fast scroll does not mount the live layer.
      syncLayer(director.mode === 'move' ? '' : id);
      const entry = STORY_RENDERERS[id];
      // A chapter that is animated runs on each frame, but only while the stage is on screen and the tab is visible.
      // The stage reads animated here and again after the draw, because draw() can turn it on.
      const running = () => !!(entry && entry.animated) && awake();
      if (width && height && (dirty || index !== drawnIndex || p !== drawn || (wanted && awake()) || running())) {
        wanted = false;
        storyPaint(ctx, id, { local, p, width, height, dpr, time: now, reducedMotion: false, requestDraw });
        const fractions = storyRail(index, local);
        fills.forEach((fill, i) => {
          if (filled[i] === fractions[i]) return;
          filled[i] = fractions[i];
          fill.style.transform = `scaleX(${fractions[i]})`;
        });
        drawn = p;
        drawnIndex = index;
        dirty = false;
      }
      if (running() || (director.mode === 'play' && awake())) schedule();
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

    // A pause stops the playback clock. The first frame after the pause does not count the time of the pause.
    const onVisibility = () => { clock = null; if (!document.hidden) schedule(); };
    const sizes = new ResizeObserver(() => { resize(); schedule(); });
    const watcher = new IntersectionObserver(entries => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) { dirty = true; schedule(); } else clock = null;
    });
    sizes.observe(stage);
    watcher.observe(section);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', settle);
    window.addEventListener('wheel', onWheel, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    // The canvas text changes when the web fonts arrive.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { dirty = true; schedule(); });
    resize();
    // The page can open in the middle of the story (a restored scroll). The stage under the viewport plays at once.
    director = storyPlay(nearest(section.getBoundingClientRect()));
    rested = storyRestAt(storyPosition({ top: section.getBoundingClientRect().top, viewport: height }));
    schedule();

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', settle);
      window.removeEventListener('wheel', onWheel);
      document.removeEventListener('visibilitychange', onVisibility);
      sizes.disconnect();
      watcher.disconnect();
      storyLeave(skip, 0, false);
      storyLeave(rail, 0, true);
      syncLayer('');
    };
  }, [sectionRef]);

  return (
    <div ref={stageRef} className="story-stage" data-chapter={STORY_CHAPTERS[view.index].id}>
      <div ref={skipRef} className="story-skip-wrap story-skip-wrap--stage"><StorySkip onNavigate={onNavigate} /></div>
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

// The scroll steps: one empty box of one screen for each stage. Each box is a snap point of the page scroll.
// The boxes are behind the stage and take no pointer events. They are not content, so assistive technology skips them.
const StorySteps = () => (
  <div className="story-steps" aria-hidden="true">
    {STORY_CHAPTERS.map(chapter => <span key={chapter.id} className="story-step" data-step={chapter.id} />)}
  </div>
);

const StoryStage = ({ onNavigate }) => {
  const sectionRef = useRef(null);
  const reduced = useStoryReducedMotion();
  return (
    <section ref={sectionRef} id="story" aria-label={SITE_STORY.label}
      className={reduced ? 'story story--static' : 'story story--pinned'}
      style={reduced ? undefined : { '--story-screens': STORY_SCREENS }}>
      {reduced
        ? (
          <React.Fragment>
            <div className="story-skip-wrap"><StorySkip onNavigate={onNavigate} /></div>
            {STORY_CHAPTERS.map(chapter => <StoryFrame key={chapter.id} chapter={chapter} onNavigate={onNavigate} />)}
          </React.Fragment>
        )
        : (
          <React.Fragment>
            <StoryPinned sectionRef={sectionRef} onNavigate={onNavigate} />
            <StorySteps />
          </React.Fragment>
        )}
    </section>
  );
};

Object.assign(window, { StoryStage, STORY_RENDERERS, STORY_DURATIONS });
