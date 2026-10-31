// Shared math, deterministic noise, and the terrain height field.
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const chance = (p) => Math.random() < p;
export const TAU = Math.PI * 2;

export function hash2(x, y) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

export function noise2(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}

export function fbm(x, y, octaves = 4) {
  let value = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    value += amp * noise2(x * freq, y * freq);
    freq *= 2;
    amp *= 0.5;
  }
  return value;
}

// Landmarks (meters, x/z plane).
export const HUB = { x: 0, z: 74 };
export const REFINERY = { x: -34, z: -26 };
export const ELEVATOR = { x: 52, z: -112 };
export const MAP_HALF = 230;
export const WORLD_FLOOR = -14;

const PADS = [
  { ...HUB, radius: 30, falloff: 46, target: 0.35 },
  { ...REFINERY, radius: 32, falloff: 44, target: 1.1 },
  { ...ELEVATOR, radius: 18, falloff: 34, target: 0.15 },
];

function baseHeight(x, z) {
  let h = 0;
  h += Math.sin(x * 0.028 + 0.9) * Math.cos(z * 0.024 - 0.3) * 2.3;
  h += Math.sin(x * 0.0105 - 1.3) * Math.cos(z * 0.0132 + 2.2) * 6.1;
  h += (fbm(x * 0.017 + 11, z * 0.017 - 7, 4) - 0.5) * 8.4;
  h += (fbm(x * 0.075 + 3, z * 0.075 - 5, 3) - 0.5) * 1.5;

  // A broken ridge line to the east, and a basin rim that hides the map edge.
  h += Math.max(0, 1 - Math.hypot(x - 128, z + 44) / 78) * 13;
  h += Math.max(0, Math.hypot(x, z) - 148) * 0.11;
  return h;
}

export function terrainHeight(x, z) {
  let h = baseHeight(x, z);
  for (const pad of PADS) {
    const d = Math.hypot(x - pad.x, z - pad.z);
    const t = smoothstep(pad.radius, pad.radius + pad.falloff, d);
    h = lerp(pad.target, h, t);
  }
  return h;
}

export function groundNormal(x, z, eps = 1.2) {
  const hL = terrainHeight(x - eps, z), hR = terrainHeight(x + eps, z);
  const hD = terrainHeight(x, z - eps), hU = terrainHeight(x, z + eps);
  return { x: (hL - hR) / (2 * eps), y: 1, z: (hD - hU) / (2 * eps) };
}

export function formatNumber(n) {
  return Math.round(n).toLocaleString('en-US');
}

export function formatAether(n) {
  return (Math.round(n * 100) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
