const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const weatherSource = read('HeroWeather.js');
const seaSource = read('HeroSea.jsx');
const heroSource = read('SubsurfaceHero.jsx');

// Load HeroWeather.js with the default weather of HeroSea.jsx, as the bundle does.
const defaultSource = seaSource.slice(seaSource.indexOf('const HERO_WEATHER_DEFAULT'), seaSource.indexOf('// The shader.'));
const names = ['HERO_WEATHER_DEFAULT', 'HERO_WEATHER_TIMEOUT_MS', 'HERO_WEATHER_CACHE_KEY', 'HERO_WEATHER_CACHE_MS', 'HERO_WEATHER_SOURCE_URL',
  'heroMoonPhase', 'heroMoonPath', 'heroWeatherMoonSetting', 'heroWeatherMap', 'heroWeatherFallback', 'heroWeatherScene', 'heroWeatherNote',
  'heroWeatherReadCache', 'heroWeatherWriteCache', 'heroWeatherOverride', 'heroWeatherInitial', 'heroWeatherFetch', 'heroWeatherStart', 'heroWeatherSwell', 'heroWeatherPeriod', 'heroWeatherWaves', 'HERO_WEATHER_MARINE_URL'];
const load = () => {
  const context = { Date, Promise, JSON, Math, isFinite, Number, String, Array, Error };
  vm.runInNewContext(`${defaultSource}\n${weatherSource}\nthis.api = { ${names.join(', ')} };`, context);
  return context.api;
};
const W = load();

// A sample of the API answers. Each case changes only the fields that it needs.
const forecast = fields => ({ current: { temperature_2m: 9, precipitation: 0, rain: 0, showers: 0, cloud_cover: 10, visibility: 24000, wind_speed_10m: 6, wind_direction_10m: 250, weather_code: 0, ...fields } });
const marine = (height = 1.4) => ({ current: { wave_height: height, wave_period: 6, wave_direction: 260, ocean_current_velocity: 0.6, ocean_current_direction: 214 } });
const stateOf = (fields, height) => W.heroWeatherMap(forecast(fields), marine(height)).state;

test('build.js lists HeroWeather.js before HeroSea.jsx', () => {
  const build = read('build.js');
  assert.ok(build.indexOf("'HeroWeather.js'") > 0 && build.indexOf("'HeroWeather.js'") < build.indexOf("'HeroSea.jsx'"));
});

test('the data map to the six states, first match wins', () => {
  assert.equal(stateOf({ cloud_cover: 5 }), 'clear');
  assert.equal(stateOf({ cloud_cover: 30 }), 'partly');
  assert.equal(stateOf({ cloud_cover: 69 }), 'partly');
  assert.equal(stateOf({ cloud_cover: 70 }), 'overcast');
  assert.equal(stateOf({ cloud_cover: 40, wind_speed_10m: 14 }), 'gale');
  assert.equal(stateOf({ cloud_cover: 40, wind_speed_10m: 8 }, 3.5), 'gale');
  assert.equal(stateOf({ cloud_cover: 90, wind_speed_10m: 8 }, 3.4), 'overcast');
  assert.equal(stateOf({ rain: 0.2 }), 'rain');
  assert.equal(stateOf({ showers: 0.5 }), 'rain');
  assert.equal(stateOf({ rain: 0.1 }), 'clear');
  assert.equal(stateOf({ weather_code: 61 }), 'rain');
  assert.equal(stateOf({ weather_code: 82 }), 'rain');
  assert.equal(stateOf({ weather_code: 68 }), 'clear');
  assert.equal(stateOf({ visibility: 1999 }), 'fog');
  assert.equal(stateOf({ visibility: 2000 }), 'clear');
  assert.equal(stateOf({ weather_code: 45 }), 'fog');
  assert.equal(stateOf({ weather_code: 48 }), 'fog');
});

test('the order of the states: fog, then rain, then gale', () => {
  assert.equal(stateOf({ visibility: 500, rain: 3, wind_speed_10m: 20 }), 'fog');
  assert.equal(stateOf({ rain: 6, wind_speed_10m: 18 }, 5), 'rain', 'heavy rain in a gale is still rain');
  assert.equal(stateOf({ rain: 0, wind_speed_10m: 18, cloud_cover: 100 }), 'gale');
});

test('the mapping gives the settings that the sea reads', () => {
  const rain = W.heroWeatherMap(forecast({ rain: 2, cloud_cover: 80, wind_speed_10m: 9 }), marine(1.8));
  assert.equal(rain.wind, 9);
  assert.equal(rain.cloud, 0.8);
  assert.equal(rain.fog, 0);
  assert.equal(rain.waves, 1.8);
  assert.ok(rain.rain > 0 && rain.rain <= 1);
  const heavy = W.heroWeatherMap(forecast({ rain: 8 }), marine());
  assert.equal(heavy.rain, 1);
  assert.ok(heavy.rain > rain.rain, 'heavier rain draws more');
  const fog = W.heroWeatherMap(forecast({ visibility: 300 }), marine());
  assert.ok(fog.fog > 0.5 && fog.fog <= 1);
  assert.equal(W.heroWeatherMap(forecast({ weather_code: 45, visibility: 9000 }), marine()).fog, 0.7);
  const gale = W.heroWeatherMap(forecast({ wind_speed_10m: 8 }), marine(4));
  assert.ok(gale.wind >= 14, 'a gale raises the wind of the sea');
  assert.equal(W.heroWeatherMap(forecast({ cloud_cover: 10 }), marine()).rain, 0);
});

test('the mapping survives missing data', () => {
  assert.equal(W.heroWeatherMap(null, null), null);
  assert.equal(W.heroWeatherMap({ current: {} }, null), null);
  const noMarine = W.heroWeatherMap(forecast({}), null);
  assert.equal(noMarine.waves, null);
  assert.ok(W.heroWeatherSwell(noMarine) > 0);
  assert.equal(W.heroWeatherMap(forecast({ visibility: null }), marine()).state, 'clear');
});

test('the fallback is the typical North Sea night, which is the approved look', () => {
  const fallback = W.heroWeatherFallback();
  assert.equal(fallback.live, false);
  assert.equal(fallback.state, 'typical');
  for (const key of Object.keys(W.HERO_WEATHER_DEFAULT)) assert.equal(fallback[key], W.HERO_WEATHER_DEFAULT[key], key);
  assert.equal(W.heroWeatherSwell(fallback), 1, 'the swell is the approved bob');
  const note = W.heroWeatherNote(fallback);
  assert.equal(note.text, 'A typical North Sea night. Live weather is not available.');
  assert.equal(note.credit, false);
});

test('the moon is new at the reference date and full about 14.77 days later', () => {
  const reference = W.heroMoonPhase(new Date(Date.UTC(2000, 0, 6, 18, 14)));
  assert.ok(reference.phase < 1e-9 && reference.lit < 1e-9);
  const full = W.heroMoonPhase(new Date(Date.UTC(2000, 0, 6, 18, 14) + 14.765294 * 86400000));
  assert.ok(Math.abs(full.phase - 0.5) < 1e-6 && full.lit > 0.999999);
  assert.equal(W.heroMoonPhase(new Date(Date.UTC(2000, 0, 6, 18, 14) + 7.3826 * 86400000)).waxing, true);
  assert.equal(W.heroMoonPhase(new Date(Date.UTC(2000, 0, 6, 18, 14) + 22.1479 * 86400000)).waxing, false);
  const known = W.heroMoonPhase(new Date(Date.UTC(2024, 3, 8, 18, 21))); // the new moon of 8 April 2024
  assert.ok(Math.min(known.phase, 1 - known.phase) < 0.01, `phase ${known.phase}`);
});

test('the lit fraction is in 0..1 for dates before and after the reference', () => {
  for (let day = -4000; day < 20000; day += 37.3) {
    const moon = W.heroMoonPhase(new Date(Date.UTC(2000, 0, 6) + day * 86400000));
    assert.ok(moon.lit >= 0 && moon.lit <= 1 && moon.phase >= 0 && moon.phase < 1, `day ${day}`);
  }
});

test('the lit path is right when the moon waxes and left when it wanes', () => {
  assert.equal(W.heroMoonPath(0), '', 'no lit part at new moon');
  const xs = d => [...d.matchAll(/A[\d.]+ [\d.]+ 0 0 [01] ([\d.]+) /g)].map(match => Number(match[1]));
  const first = W.heroMoonPath(0.25), last = W.heroMoonPath(0.75);
  assert.match(first, /^M32 3A29 29 0 0 1 32 61A0 29 0 0 [01] 32 3Z$/, 'first quarter: right half, flat terminator');
  assert.match(last, /^M32 3A29 29 0 0 0 32 61A0 29 0 0 [01] 32 3Z$/, 'last quarter: left half');
  assert.ok(xs(first).every(x => x === 32));
  const waxingCrescent = W.heroMoonPath(0.1), waxingGibbous = W.heroMoonPath(0.4);
  assert.match(waxingCrescent, /^M32 3A29 29 0 0 1 32 61A\d+(\.\d+)? 29 0 0 0 32 3Z$/, 'a crescent: the terminator bulges to the lit side');
  assert.match(waxingGibbous, /^M32 3A29 29 0 0 1 32 61A\d+(\.\d+)? 29 0 0 1 32 3Z$/, 'a gibbous moon: the terminator bulges to the dark side');
  assert.match(W.heroMoonPath(0.6), /^M32 3A29 29 0 0 0 32 61A\d+(\.\d+)? 29 0 0 0 32 3Z$/, 'a waning gibbous moon is lit on the left');
  assert.match(W.heroMoonPath(0.9), /^M32 3A29 29 0 0 0 32 61A\d+(\.\d+)? 29 0 0 1 32 3Z$/, 'a waning crescent is lit on the left');
  const full = W.heroMoonPath(0.5);
  assert.match(full, /A29 29 0 0 0 32 3Z$/, 'the full moon is a whole disc');
});

test('the moon setting follows the lit fraction and the cloud, and is off in fog', () => {
  assert.equal(W.heroWeatherMoonSetting(1, 0, 0), 1);
  assert.equal(W.heroWeatherMoonSetting(0, 0, 0), 0);
  assert.ok(Math.abs(W.heroWeatherMoonSetting(1, 1, 0) - 0.15) < 1e-9);
  assert.ok(Math.abs(W.heroWeatherMoonSetting(0.5, 0.4, 0) - 0.5 * (1 - 0.85 * 0.4)) < 1e-9);
  assert.equal(W.heroWeatherMoonSetting(1, 0, 0.7), 0);
  const full = { phase: 0.5, lit: 1, waxing: false }, newMoon = { phase: 0, lit: 0, waxing: true };
  const cloudy = W.heroWeatherMap(forecast({ cloud_cover: 80 }), marine());
  assert.ok(Math.abs(W.heroWeatherScene(cloudy, full).moon - (1 - 0.85 * 0.8)) < 1e-9);
  assert.equal(W.heroWeatherScene(cloudy, newMoon).moon, 0);
  assert.equal(W.heroWeatherScene(cloudy, newMoon).moonPath, '', 'the disc is a dark outline at new moon');
  assert.equal(W.heroWeatherScene(W.heroWeatherFallback(), full).moon, 1, 'the fallback with a full moon is the approved look');
  assert.equal(W.heroWeatherScene(W.heroWeatherMap(forecast({ visibility: 500 }), marine()), full).moon, 0);
});

test('the gale raises the foam and the swell; the other states keep the approved look', () => {
  const full = { phase: 0.5, lit: 1, waxing: false };
  const gale = W.heroWeatherScene(W.heroWeatherMap(forecast({ wind_speed_10m: 17 }), marine(4.6)), full);
  const calm = W.heroWeatherScene(W.heroWeatherMap(forecast({}), marine(1.2)), full);
  assert.ok(gale.foam > 1 && gale.swell > 2);
  assert.equal(calm.foam, 1);
  assert.ok(Math.abs(calm.swell - 1) < 1e-9);
  const css = read('colors_and_type.css');
  assert.match(css, /hero-ship-bob[^}]*\n[^}]*var\(--hero-swell, 1\)/);
  assert.match(css, /--hero-foam, 1/);
});

test('the cache keeps data for 30 minutes and survives a storage that throws', () => {
  const store = {};
  const storage = { getItem: key => (key in store ? store[key] : null), setItem: (key, value) => { store[key] = value; } };
  const now = 1e12;
  assert.equal(W.heroWeatherReadCache(storage, now), null);
  assert.equal(W.heroWeatherWriteCache(storage, now, { wind_speed_10m: 7 }, null), true);
  assert.deepEqual(JSON.parse(JSON.stringify(W.heroWeatherReadCache(storage, now + 29 * 60000))), { forecast: { wind_speed_10m: 7 }, marine: null });
  assert.equal(W.heroWeatherReadCache(storage, now + 31 * 60000), null);
  assert.equal(W.HERO_WEATHER_CACHE_MS, 30 * 60 * 1000);
  const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('full'); } };
  assert.equal(W.heroWeatherReadCache(broken, now), null);
  assert.equal(W.heroWeatherWriteCache(broken, now, {}, null), false);
  assert.equal(W.heroWeatherReadCache({ getItem: () => '{not json' }, now), null);
  assert.equal(W.heroWeatherReadCache(null, now), null);
  assert.match(weatherSource, /localStorage/);
  const win = { get localStorage() { throw new Error('denied'); }, location: { hash: '' } };
  assert.equal(W.heroWeatherInitial(win, now).live, false, 'a blocked storage gives the fallback');
});

// A fake window. The calls are in the log.
const fakeWindow = (options = {}) => {
  const log = { fetches: [], listeners: {}, timers: [], idle: null };
  const win = {
    log,
    location: { hash: options.hash || '' },
    navigator: { connection: options.saveData === undefined ? undefined : { saveData: options.saveData } },
    document: { readyState: options.readyState || 'loading' },
    localStorage: options.storage,
    AbortController,
    setTimeout: (fn, ms) => { log.timers.push([fn, ms]); return log.timers.length; },
    clearTimeout: () => {},
    addEventListener: (name, fn) => { log.listeners[name] = fn; },
    removeEventListener: name => { delete log.listeners[name]; },
    fetch: url => {
      log.fetches.push(url);
      const body = url.includes('marine') ? marine(2) : forecast({ rain: 1.5, wind_speed_10m: 9 });
      return Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
    },
  };
  if (options.idle) win.requestIdleCallback = fn => { log.idle = fn; return 1; };
  return win;
};

test('there is no fetch before the page has loaded', async () => {
  const win = fakeWindow({ readyState: 'loading' });
  const results = [];
  W.heroWeatherStart(weather => results.push(weather), win);
  assert.equal(win.log.fetches.length, 0);
  assert.equal(win.log.timers.length, 0);
  win.log.listeners.load();
  assert.equal(win.log.fetches.length, 0, 'the fetch waits for the idle time');
  assert.equal(win.log.timers[0][1], 1500, 'a 1.5 s timer when there is no idle callback');
  win.log.timers[0][0]();
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(win.log.fetches.length, 2, 'both requests go out together');
  assert.ok(win.log.fetches.some(url => url.startsWith('https://api.open-meteo.com/v1/forecast?latitude=57.5&longitude=2.5')));
  assert.ok(win.log.fetches.some(url => url.startsWith('https://marine-api.open-meteo.com/v1/marine?latitude=57.5&longitude=2.5')));
  assert.equal(results.length, 1);
  assert.equal(results[0].state, 'rain');
});

test('the fetch uses the idle callback when the browser has one, and a loaded page starts at once', async () => {
  const win = fakeWindow({ readyState: 'complete', idle: true });
  W.heroWeatherStart(() => {}, win);
  assert.equal(win.log.fetches.length, 0);
  assert.equal(typeof win.log.idle, 'function');
  win.log.idle();
  assert.equal(win.log.fetches.length, 2);
});

test('there is no fetch when the visitor saves data, when an override is set or when the cache is fresh', () => {
  const saving = fakeWindow({ readyState: 'complete', saveData: true });
  W.heroWeatherStart(() => {}, saving);
  assert.equal(saving.log.timers.length + saving.log.fetches.length, 0);
  assert.deepEqual(Object.keys(saving.log.listeners), []);
  const override = fakeWindow({ readyState: 'complete', hash: '#weather=gale' });
  W.heroWeatherStart(() => {}, override);
  assert.equal(override.log.timers.length + override.log.fetches.length, 0);
  const store = {};
  const storage = { getItem: key => store[key] || null, setItem: (key, value) => { store[key] = value; } };
  W.heroWeatherWriteCache(storage, Date.now(), forecast({ rain: 1 }).current, marine().current);
  const cached = fakeWindow({ readyState: 'complete', storage });
  W.heroWeatherStart(() => {}, cached);
  assert.equal(cached.log.timers.length + cached.log.fetches.length, 0);
  assert.equal(W.heroWeatherInitial(cached).state, 'rain', 'the start state comes from the cache');
});

test('a failed fetch keeps the fallback and writes nothing', async () => {
  const store = {};
  const win = fakeWindow({ readyState: 'complete', storage: { getItem: () => null, setItem: (key, value) => { store[key] = value; } } });
  win.fetch = () => Promise.reject(new Error('offline'));
  const results = [];
  W.heroWeatherStart(weather => results.push(weather), win);
  win.log.timers[0][0]();
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.deepEqual(results, []);
  assert.deepEqual(store, {});
  assert.equal(W.heroWeatherInitial(win).live, false);
});

test('the fetch has a 4 s timeout that aborts the requests', async () => {
  assert.equal(W.HERO_WEATHER_TIMEOUT_MS, 4000);
  assert.match(weatherSource, /new win\.AbortController\(\)/);
  const timers = [];
  const win = { AbortController, setTimeout: (fn, ms) => { timers.push([fn, ms]); return 1; }, clearTimeout: () => {} };
  const never = (url, { signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted'))));
  const pending = W.heroWeatherFetch(never, win);
  assert.equal(timers[0][1], 4000);
  timers[0][0]();
  await assert.rejects(pending, /aborted/);
});

test('the player names the source with a link to open-meteo.com', () => {
  assert.equal(W.HERO_WEATHER_SOURCE_URL, 'https://open-meteo.com/');
  assert.match(heroSource, /Weather by <a href=\{HERO_WEATHER_SOURCE_URL\}/);
  const note = W.heroWeatherNote(W.heroWeatherMap(forecast({ rain: 0.3, wind_speed_10m: 9.2 }), marine(1.84)));
  assert.equal(note.credit, true);
  assert.equal(note.text, 'North Sea now, 57.5° N 2.5° E: 9 m/s wind, 1.8 m waves, light rain.');
  assert.match(read('colors_and_type.css'), /@media \(max-width: 600px\)[\s\S]*\.hero-player__weather,\s*\n\s*\.hero-player__receipt \{ display: none; \}/, 'phones hide the note');
});

test('the debug override reads the page address once', () => {
  assert.equal(W.heroWeatherOverride(''), null);
  assert.equal(W.heroWeatherOverride('#weather=storm'), null);
  assert.equal(W.heroWeatherOverride('#weather=gale').weather.state, 'gale');
  assert.equal(W.heroWeatherOverride('#weather=fog').weather.state, 'fog');
  assert.equal(W.heroWeatherOverride('#weather=rain&moon=0.75').moon.phase, 0.75);
  assert.equal(W.heroWeatherOverride('#moon=0.25').weather, null);
  assert.equal(W.heroWeatherInitial({ location: { hash: '#weather=overcast' } }).state, 'overcast');
  for (const name of ['clear', 'partly', 'overcast', 'rain', 'fog', 'gale']) assert.equal(W.heroWeatherOverride('#weather=' + name).weather.state, name);
});

test('the hero starts with the fallback, then applies the live result', () => {
  assert.match(heroSource, /useState\(\(\) => heroWeatherInitial\(window\)\)/);
  assert.match(heroSource, /useEffect\(\(\) => heroWeatherStart\(setWeather\), \[\]\)/);
  assert.match(heroSource, /<Sky weather=\{scene\}/);
});

test('the marine request asks for the wave period and the ocean current', () => {
  const query = W.HERO_WEATHER_MARINE_URL.split('current=')[1].split('&')[0].split(',');
  ['wave_height', 'wave_period', 'wave_direction', 'ocean_current_velocity', 'ocean_current_direction'].forEach(name => assert.ok(query.includes(name), name));
});

test('the mapping carries the period and the current, and each is null when missing', () => {
  const full = W.heroWeatherMap(forecast({}), marine(1.4));
  assert.equal(full.period, 6);
  assert.equal(full.current, 0.6);
  assert.equal(full.currentDir, 214);
  const none = W.heroWeatherMap(forecast({}), null);
  assert.equal(none.period, null);
  assert.equal(none.current, null);
  assert.equal(none.currentDir, null);
  assert.equal(W.heroWeatherMap(forecast({}), { current: { wave_height: 1, wave_period: null } }).period, null);
});

test('every preset and the fallback have a period and a current', () => {
  ['clear', 'partly', 'overcast', 'rain', 'fog', 'gale'].forEach(name => {
    const weather = W.heroWeatherOverride('#weather=' + name).weather;
    assert.ok(weather.period >= 4 && weather.period <= 10, name + ' period');
    assert.ok(weather.current >= 0.3 && weather.current <= 1.4, name + ' current');
    assert.ok(weather.currentDir >= 0 && weather.currentDir <= 360, name + ' direction');
  });
  assert.equal(W.heroWeatherOverride('#weather=gale').weather.period, 9.5);
  assert.equal(W.heroWeatherOverride('#weather=clear').weather.period, 5.5);
  const fallback = W.heroWeatherFallback();
  assert.equal(typeof fallback.period, 'number');
  assert.equal(typeof fallback.current, 'number');
});

test('the period falls back to an estimate from the wave height, between 4 s and 12 s', () => {
  assert.equal(W.heroWeatherPeriod({ period: 6.25, waves: 1 }), 6.25);
  assert.ok(Math.abs(W.heroWeatherPeriod({ period: null, waves: 1 }) - 5.2) < 1e-9);
  assert.equal(W.heroWeatherPeriod({ period: null, waves: 0 }), 4);
  assert.equal(W.heroWeatherPeriod({ period: null, waves: 20 }), 12);
  assert.ok(Math.abs(W.heroWeatherPeriod({ waves: null, windMs: 10 }) - 7.6) < 1e-9, 'the wind gives the waves when the data is missing');
});
