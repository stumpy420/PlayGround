// Small math, random, and storage helpers shared by the game.

export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (a, b, rate, dt) => lerp(a, b, 1 - Math.exp(-rate * dt));
export const dist2 = (ax, ay, bx, by) => (ax - bx) * (ax - bx) + (ay - by) * (ay - by);
export const dist = (ax, ay, bx, by) => Math.sqrt(dist2(ax, ay, bx, by));
export const smoothstep = (t) => t * t * (3 - 2 * t);
export const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function angleWrap(a) {
  while (a > Math.PI) a -= TAU;
  while (a < -Math.PI) a += TAU;
  return a;
}
export function angleDiff(a, b) {
  return angleWrap(a - b);
}
export function angleLerp(a, b, t) {
  return a + angleDiff(b, a) * t;
}
export function approachAngle(a, b, step) {
  const d = angleDiff(b, a);
  if (Math.abs(d) <= step) return b;
  return a + Math.sign(d) * step;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function rngInt(rng, a, b) {
  return a + Math.floor(rng() * (b - a + 1));
}
export function rngPick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}
export function shuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
export function formatNumber(n) {
  return Math.round(n).toLocaleString('en-US');
}

const SAVE_KEY = 'vanguard.ballistics.save.v2';

export const DEFAULT_SAVE = {
  version: 2,
  credits: 450,
  xp: 0,
  unlocked: 0,
  completed: [],
  best: {},
  intel: {},
  ownedWeapons: ['vector'],
  upgrades: [],
  loadout: { primary: 'vector' },
  settings: {
    volume: 0.8,
    music: 0.55,
    shake: true,
    aimAssist: true,
    hints: true,
  },
  stats: {
    kills: 0,
    shots: 0,
    hits: 0,
    missions: 0,
    deaths: 0,
    bestSurvival: 0,
  },
};

function deepMerge(base, incoming) {
  if (!incoming || typeof incoming !== 'object') return structuredClone(base);
  const out = Array.isArray(base) ? base.slice() : { ...base };
  for (const key of Object.keys(incoming)) {
    const value = incoming[key];
    if (value && typeof value === 'object' && !Array.isArray(value) && base[key] && typeof base[key] === 'object') {
      out[key] = deepMerge(base[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return structuredClone(DEFAULT_SAVE);
    const parsed = JSON.parse(raw);
    const save = deepMerge(DEFAULT_SAVE, parsed);
    save.version = 2;
    if (!Array.isArray(save.ownedWeapons) || !save.ownedWeapons.includes('vector')) save.ownedWeapons = [...new Set(['vector', ...(save.ownedWeapons || [])])];
    if (!save.loadout?.primary || !save.ownedWeapons.includes(save.loadout.primary)) save.loadout = { primary: 'vector' };
    save.unlocked = clamp(Number(save.unlocked) || 0, 0, 5);
    save.credits = Math.max(0, Number(save.credits) || 0);
    return save;
  } catch {
    return structuredClone(DEFAULT_SAVE);
  }
}

export function writeSave(save) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    /* Storage can be unavailable in private mode. */
  }
}

export function resetSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

export function pointSegDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = dx * dx + dy * dy;
  let t = len ? ((px - x1) * dx + (py - y1) * dy) / len : 0;
  t = clamp(t, 0, 1);
  const cx = x1 + dx * t;
  const cy = y1 + dy * t;
  return { d: Math.hypot(px - cx, py - cy), t, cx, cy };
}

export function seededShuffle(seed, arr) {
  return shuffle(mulberry32(seed), arr);
}
