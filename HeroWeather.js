// HeroWeather.js - live North Sea weather and the real moon phase for the hero.
// The functions are pure, except for one fetch and the cache in localStorage.
// Data: Open-Meteo (https://open-meteo.com/, licence CC BY 4.0). The hero player shows the source line.
// The weather has a drawn state and the settings that the sea already reads (wind, cloud, fog, moon),
// plus rain (0..1) and waves (m).
//
// Debug override: add "#weather=gale" to the page address to draw one state without the network.
// The names are clear, partly, overcast, rain, fog and gale. Add "&moon=0.25" to set the moon phase
// (0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter). The page reads the hash once, at start.
// The override is harmless: it only changes the drawing of this page, for this visit.

const HERO_WEATHER_PLACE = { lat: 57.5, lon: 2.5 };
const HERO_WEATHER_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast?latitude=57.5&longitude=2.5&current=temperature_2m,precipitation,rain,showers,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,weather_code&wind_speed_unit=ms&timezone=UTC';
const HERO_WEATHER_MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine?latitude=57.5&longitude=2.5&current=wave_height,wave_period,wave_direction,ocean_current_velocity,ocean_current_direction';
const HERO_WEATHER_TIMEOUT_MS = 4000;
const HERO_WEATHER_IDLE_MS = 1500;
const HERO_WEATHER_CACHE_KEY = 'hero-weather-v1';
const HERO_WEATHER_CACHE_MS = 30 * 60 * 1000;
const HERO_WEATHER_SOURCE_URL = 'https://open-meteo.com/';
const HERO_WEATHER_STATES = ['clear', 'partly', 'overcast', 'rain', 'fog', 'gale'];

const heroWeatherClamp = (value, low, high) => Math.min(high, Math.max(low, value));
const heroWeatherNumber = value => (typeof value === 'number' && isFinite(value) ? value : null);

// ---- the moon
const HERO_MOON_SYNODIC_DAYS = 29.530588853;
const HERO_MOON_REFERENCE_MS = Date.UTC(2000, 0, 6, 18, 14); // a new moon

// The phase is 0 at new moon, 0.25 at first quarter, 0.5 at full moon and 0.75 at last quarter.
// lit is the lit fraction of the disc, 0..1. The moon waxes while the phase is below 0.5.
const heroMoonPhase = date => {
  const ms = date instanceof Date ? date.getTime() : Number(date);
  const age = (((ms - HERO_MOON_REFERENCE_MS) / 86400000) % HERO_MOON_SYNODIC_DAYS + HERO_MOON_SYNODIC_DAYS) % HERO_MOON_SYNODIC_DAYS;
  const phase = age / HERO_MOON_SYNODIC_DAYS;
  return { phase, age, lit: (1 - Math.cos(2 * Math.PI * phase)) / 2, waxing: phase < 0.5 };
};

// The SVG path of the lit part of a disc of radius r at (cx, cy): a half disc and a half ellipse.
// The northern hemisphere sees the right side lit when the moon waxes and the left side when it wanes.
// It returns an empty string at new moon.
const heroMoonPath = (phase, cx = 32, cy = 32, r = 29) => {
  const k = Math.cos(2 * Math.PI * phase);
  if ((1 - k) / 2 < 0.004) return '';
  const rx = Math.round(r * Math.abs(k) * 100) / 100;
  const waxing = phase < 0.5, crescent = k > 0;
  const top = `${cx} ${cy - r}`, bottom = `${cx} ${cy + r}`;
  const edge = waxing ? 1 : 0;                       // sweep of the lit limb, from top to bottom
  const terminator = crescent === waxing ? 0 : 1;    // sweep of the terminator, from bottom to top
  return `M${top}A${r} ${r} 0 0 ${edge} ${bottom}A${rx} ${r} 0 0 ${terminator} ${top}Z`;
};

// The moon setting of the sea: the lit fraction, dimmed by cloud, and off in fog.
const heroWeatherMoonSetting = (lit, cloud, fog) => (fog > 0 ? 0 : heroWeatherClamp(lit * (1 - 0.85 * cloud), 0, 1));

// ---- the mapping from the data to a state
const HERO_WEATHER_FOG_CODES = [45, 48];
const heroWeatherRainCode = code => (code >= 51 && code <= 67) || (code >= 80 && code <= 82);

// forecast and marine are the bodies of the two API answers (or objects with a "current" field).
// It returns null when the wind is missing.
const heroWeatherMap = (forecast, marine) => {
  const now = forecast && forecast.current;
  if (!now || heroWeatherNumber(now.wind_speed_10m) === null) return null;
  const sea = marine && marine.current;
  const wind = now.wind_speed_10m;
  const cloud = heroWeatherClamp((heroWeatherNumber(now.cloud_cover) || 0) / 100, 0, 1);
  const visibility = heroWeatherNumber(now.visibility);
  const code = heroWeatherNumber(now.weather_code);
  const rainMm = Math.max(heroWeatherNumber(now.rain) || 0, heroWeatherNumber(now.showers) || 0);
  const waves = sea ? heroWeatherNumber(sea.wave_height) : null;
  const period = sea ? heroWeatherNumber(sea.wave_period) : null;
  const current = sea ? heroWeatherNumber(sea.ocean_current_velocity) : null;
  const currentDir = sea ? heroWeatherNumber(sea.ocean_current_direction) : null;
  const isFog = (visibility !== null && visibility < 2000) || HERO_WEATHER_FOG_CODES.includes(code);
  const isRain = rainMm > 0.1 || heroWeatherRainCode(code);
  const isGale = wind >= 14 || (waves !== null && waves >= 3.5);
  const state = isFog ? 'fog' : isRain ? 'rain' : isGale ? 'gale' : cloud >= 0.7 ? 'overcast' : cloud >= 0.3 ? 'partly' : 'clear';
  const fog = state !== 'fog' ? 0
    : visibility !== null && visibility < 2000 ? heroWeatherClamp(0.35 + 0.65 * (1 - visibility / 2000), 0.35, 1) : 0.7;
  const rain = state === 'rain' ? heroWeatherClamp(rainMm / 4, 0.15, 1) : 0;
  return {
    state, live: true,
    wind: state === 'gale' ? Math.max(wind, 14) : wind, cloud, fog, rain, waves, period, current, currentDir,
    windMs: wind, rainMm, temperature: heroWeatherNumber(now.temperature_2m),
  };
};

// "A typical North Sea night": today's approved look. No random state.
const heroWeatherFallback = () => ({ state: 'typical', live: false, ...HERO_WEATHER_DEFAULT });

// Waves in metres. The marine data can be missing, so the wind gives an estimate.
const heroWeatherWaves = weather => (weather.waves !== null && weather.waves !== undefined ? weather.waves : 0.03 * (weather.windMs || weather.wind) ** 2);

// Wave period in seconds. The marine data can be missing, so the wave height gives an estimate.
const heroWeatherPeriod = weather => (weather.period !== null && weather.period !== undefined ? weather.period : heroWeatherClamp(4 + 1.2 * heroWeatherWaves(weather), 4, 12));

// How strongly the carrier bobs. 1 is the approved look.
const heroWeatherSwell = weather => heroWeatherClamp(heroWeatherWaves(weather) / 1.2, 0.6, 3.5);

// The scene that the sky and the sea draw: the weather and the real moon.
const heroWeatherScene = (weather, moon) => {
  const live = weather.live !== false;
  return {
    ...weather,
    moon: live ? heroWeatherMoonSetting(moon.lit, weather.cloud, weather.fog) : moon.lit,
    moonPath: heroMoonPath(moon.phase),
    moonLit: moon.lit,
    swell: heroWeatherSwell(weather),
    foam: weather.state === 'gale' ? 1.7 : 1,
  };
};

// The line in the hero player. It names the source, as the Open-Meteo licence requires.
const heroWeatherWords = weather => {
  if (weather.state === 'rain') return weather.rainMm >= 2.5 ? 'heavy rain' : weather.rainMm >= 0.5 ? 'rain' : 'light rain';
  return { clear: 'clear sky', partly: 'partly cloudy', overcast: 'overcast', fog: 'fog', gale: 'gale' }[weather.state] || '';
};
const heroWeatherNote = weather => {
  if (weather.live === false) return { text: 'A typical North Sea night. Live weather is not available.', credit: false };
  const parts = [`${Math.round(weather.windMs)} m/s wind`];
  if (weather.waves !== null && weather.waves !== undefined) parts.push(`${weather.waves.toFixed(1)} m waves`);
  parts.push(heroWeatherWords(weather));
  return { text: `North Sea now, ${HERO_WEATHER_PLACE.lat}° N ${HERO_WEATHER_PLACE.lon}° E: ${parts.join(', ')}.`, credit: true };
};

// ---- the cache. Every read and write is in try/catch, because storage can throw.
const heroWeatherReadCache = (storage, now) => {
  try {
    const entry = JSON.parse(storage.getItem(HERO_WEATHER_CACHE_KEY));
    if (entry && now - entry.time >= 0 && now - entry.time < HERO_WEATHER_CACHE_MS && entry.forecast) return { forecast: entry.forecast, marine: entry.marine || null };
  } catch (error) { /* no cache */ }
  return null;
};
const heroWeatherWriteCache = (storage, now, forecast, marine) => {
  try {
    storage.setItem(HERO_WEATHER_CACHE_KEY, JSON.stringify({ time: now, forecast, marine }));
    return true;
  } catch (error) {
    return false;
  }
};

// ---- the debug override
const HERO_WEATHER_SAMPLES = {
  clear: [{ cloud_cover: 8, wind_speed_10m: 5, visibility: 24000, weather_code: 0 }, { wave_height: 1, wave_period: 5.5, ocean_current_velocity: 0.4, ocean_current_direction: 214 }],
  partly: [{ cloud_cover: 45, wind_speed_10m: 7, visibility: 24000, weather_code: 2 }, { wave_height: 1.4, wave_period: 6, ocean_current_velocity: 0.6, ocean_current_direction: 214 }],
  overcast: [{ cloud_cover: 92, wind_speed_10m: 8, visibility: 18000, weather_code: 3 }, { wave_height: 1.8, wave_period: 6.5, ocean_current_velocity: 0.8, ocean_current_direction: 200 }],
  rain: [{ cloud_cover: 90, wind_speed_10m: 9, visibility: 9000, weather_code: 63, rain: 1.8, precipitation: 1.8 }, { wave_height: 1.8, wave_period: 6.5, ocean_current_velocity: 0.7, ocean_current_direction: 190 }],
  fog: [{ cloud_cover: 100, wind_speed_10m: 3, visibility: 600, weather_code: 45 }, { wave_height: 0.6, wave_period: 4.5, ocean_current_velocity: 0.3, ocean_current_direction: 214 }],
  gale: [{ cloud_cover: 80, wind_speed_10m: 17, visibility: 15000, weather_code: 3 }, { wave_height: 4.6, wave_period: 9.5, ocean_current_velocity: 1.4, ocean_current_direction: 230 }],
};
const heroWeatherOverride = hash => {
  const query = String(hash || '').replace(/^#/, '');
  let name = null, moon = null;
  query.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key === 'weather' && HERO_WEATHER_SAMPLES[value]) name = value;
    if (key === 'moon' && value !== '' && isFinite(Number(value))) moon = ((Number(value) % 1) + 1) % 1;
  });
  if (!name && moon === null) return null;
  const sample = name ? HERO_WEATHER_SAMPLES[name] : null;
  return {
    weather: sample ? heroWeatherMap({ current: sample[0] }, { current: sample[1] }) : null,
    moon: moon === null ? null : { phase: moon, age: moon * HERO_MOON_SYNODIC_DAYS, lit: (1 - Math.cos(2 * Math.PI * moon)) / 2, waxing: moon < 0.5 },
  };
};

// ---- the start state and the one fetch
const heroWeatherStorage = win => {
  try { return win.localStorage || null; } catch (error) { return null; }
};

// The first paint never waits for the network: an override, then a fresh cache, then the fallback.
const heroWeatherInitial = (win, now = Date.now()) => {
  const override = heroWeatherOverride(win.location && win.location.hash);
  if (override && override.weather) return override.weather;
  const storage = heroWeatherStorage(win);
  const cached = storage && heroWeatherReadCache(storage, now);
  return (cached && heroWeatherMap({ current: cached.forecast }, { current: cached.marine })) || heroWeatherFallback();
};

// Fetch both answers in parallel. One abort stops both after timeoutMs. The marine data are optional.
const heroWeatherFetch = (fetchFn, win, timeoutMs = HERO_WEATHER_TIMEOUT_MS) => {
  const controller = new win.AbortController();
  const timer = win.setTimeout(() => controller.abort(), timeoutMs);
  const get = url => fetchFn(url, { signal: controller.signal }).then(response => {
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.json();
  });
  return Promise.all([get(HERO_WEATHER_FORECAST_URL), get(HERO_WEATHER_MARINE_URL).catch(() => null)])
    .then(([forecast, marine]) => { win.clearTimeout(timer); return { forecast, marine }; },
      error => { win.clearTimeout(timer); throw error; });
};

// Start the fetch once, after the page has loaded and is idle. It does nothing when the visitor saves data,
// when an override is set or when the cache is fresh. It returns a function that cancels the start.
const heroWeatherStart = (onResult, win = window, now = Date.now()) => {
  const connection = win.navigator && win.navigator.connection;
  if (connection && connection.saveData) return () => {};
  if (heroWeatherOverride(win.location && win.location.hash)) return () => {};
  const storage = heroWeatherStorage(win);
  if (storage && heroWeatherReadCache(storage, now)) return () => {};
  if (typeof win.fetch !== 'function' || !win.AbortController) return () => {};
  let cancelled = false, idle = null, timer = null;
  const fetchNow = () => {
    if (cancelled) return;
    heroWeatherFetch(win.fetch.bind(win), win).then(({ forecast, marine }) => {
      if (cancelled) return;
      const weather = heroWeatherMap(forecast, marine);
      if (!weather) return;
      if (storage) heroWeatherWriteCache(storage, Date.now(), forecast.current, marine ? marine.current : null);
      onResult(weather);
    }).catch(() => {});
  };
  const whenIdle = () => {
    if (cancelled) return;
    if (typeof win.requestIdleCallback === 'function') idle = win.requestIdleCallback(fetchNow, { timeout: 3000 });
    else timer = win.setTimeout(fetchNow, HERO_WEATHER_IDLE_MS);
  };
  const loaded = win.document.readyState === 'complete';
  if (loaded) whenIdle(); else win.addEventListener('load', whenIdle, { once: true });
  return () => {
    cancelled = true;
    if (idle !== null && win.cancelIdleCallback) win.cancelIdleCallback(idle);
    if (timer !== null) win.clearTimeout(timer);
    win.removeEventListener('load', whenIdle);
  };
};
