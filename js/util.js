// ============ UTILITIES: MATH, PROCEDURAL TEXTURES, FORMATTING ============
import * as THREE from 'three';

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
export const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const fmt = (n, d = 0) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
export const fmtUsd = (n) => '$' + Number(n).toFixed(2);
export const shortAddr = (a) => a.slice(0, 6) + '…' + a.slice(-4);
export const clampAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export function randomHex(len = 64) {
  const chars = '0123456789abcdef';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}

let seed = 1337;
export function seeded() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

// ---------- AABB / RAY ----------
export function makeAABB(cx, cy, cz, w, h, d, tag = '') {
  return {
    min: new THREE.Vector3(cx - w / 2, cy - h / 2, cz - d / 2),
    max: new THREE.Vector3(cx + w / 2, cy + h / 2, cz + d / 2),
    tag
  };
}

export function rayAABB(origin, dir, box, maxDist = Infinity) {
  let tmin = 0, tmax = maxDist;
  const axes = ['x', 'y', 'z'];
  for (const ax of axes) {
    if (Math.abs(dir[ax]) < 1e-8) {
      if (origin[ax] < box.min[ax] || origin[ax] > box.max[ax]) return null;
    } else {
      const inv = 1 / dir[ax];
      let t1 = (box.min[ax] - origin[ax]) * inv;
      let t2 = (box.max[ax] - origin[ax]) * inv;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }
  }
  return tmin;
}

export function raySphere(origin, dir, center, radius) {
  const oc = new THREE.Vector3().subVectors(origin, center);
  const b = oc.dot(dir);
  const c = oc.lengthSq() - radius * radius;
  const disc = b * b - c;
  if (disc < 0) return null;
  const sq = Math.sqrt(disc);
  let t = -b - sq;
  if (t < 0) t = -b + sq;
  return t >= 0 ? t : null;
}

export function pointInRadius(x, z, p, r) {
  const dx = x - p.x, dz = z - p.z;
  return dx * dx + dz * dz <= r * r;
}

// ---------- PROCEDURAL TEXTURES ----------
const cache = new Map();
function canvasTex(key, w, h, draw, repeat = [1, 1]) {
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
}

function grain(ctx, w, h, amount, alpha = 1) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    d[i] = clamp(d[i] + n, 0, 255);
    d[i + 1] = clamp(d[i + 1] + n, 0, 255);
    d[i + 2] = clamp(d[i + 2] + n, 0, 255);
    d[i + 3] = 255 * alpha;
  }
  ctx.putImageData(img, 0, 0);
}

export function asphaltTexture() {
  return canvasTex('asphalt', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#24282a'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 2400; i++) {
      const g = 28 + Math.random() * 32;
      ctx.fillStyle = `rgba(${g},${g + 2},${g + 1},${0.25 + Math.random() * 0.5})`;
      const s = 1 + Math.random() * 3;
      ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
    }
    for (let i = 0; i < 18; i++) {
      ctx.strokeStyle = `rgba(10,12,12,${0.18 + Math.random() * 0.25})`;
      ctx.lineWidth = 0.8 + Math.random() * 1.4;
      ctx.beginPath();
      let x = Math.random() * w, y = Math.random() * h;
      ctx.moveTo(x, y);
      for (let j = 0; j < 5; j++) {
        x += (Math.random() - 0.5) * 40; y += Math.random() * 26;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (let i = 0; i < 9; i++) {
      const grd = ctx.createRadialGradient(Math.random() * w, Math.random() * h, 2, Math.random() * w, Math.random() * h, 60 + Math.random() * 60);
      grd.addColorStop(0, 'rgba(8,10,10,.22)');
      grd.addColorStop(1, 'rgba(8,10,10,0)');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
    }
    grain(ctx, w, h, 18);
  }, [18, 18]);
}

export function concreteTexture() {
  return canvasTex('concrete', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#6d7374'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1800; i++) {
      const g = 92 + Math.random() * 50;
      ctx.fillStyle = `rgba(${g},${g + 3},${g + 2},${Math.random() * 0.45})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 4, 1 + Math.random() * 4);
    }
    for (let i = 0; i < 12; i++) {
      ctx.strokeStyle = 'rgba(40,44,44,.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      let x = Math.random() * w, y = Math.random() * h;
      ctx.moveTo(x, y);
      for (let j = 0; j < 4; j++) { x += (Math.random() - 0.5) * 30; y += Math.random() * 20; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(30,34,34,.14)';
    for (let i = 0; i < 5; i++) ctx.fillRect(0, Math.random() * h, w, 1 + Math.random() * 2);
    grain(ctx, w, h, 22);
  }, [2, 2]);
}

export function metalPanelTexture() {
  return canvasTex('metalpanel', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#5a6265'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(20,24,26,.6)'; ctx.lineWidth = 3;
    for (let x = 0; x <= w; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.fillStyle = 'rgba(200,215,215,.18)';
    for (let x = 8; x < w; x += 64) for (let y = 8; y < h; y += 64) {
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 48, y, 2, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 20; i++) {
      const g = ctx.createLinearGradient(0, Math.random() * h, 0, Math.random() * h + 60);
      g.addColorStop(0, 'rgba(80,50,30,.16)'); g.addColorStop(1, 'rgba(80,50,30,0)');
      ctx.fillStyle = g; ctx.fillRect(Math.random() * w, 0, 4 + Math.random() * 20, h);
    }
    grain(ctx, w, h, 14);
  }, [2, 2]);
}

const CONTAINER_COLORS = {
  rust: ['#7c3a26', '#5e2a1b', '#a1563a'],
  teal: ['#23615d', '#174743', '#3c8a83'],
  blue: ['#244a70', '#183654', '#3d6c96'],
  yellow: ['#8f7220', '#6b5416', '#b39336'],
  grey: ['#555c5e', '#3d4345', '#767f81']
};

export function containerTexture(key = 'rust') {
  const cols = CONTAINER_COLORS[key] || CONTAINER_COLORS.rust;
  return canvasTex('container_' + key, 512, 512, (ctx, w, h) => {
    ctx.fillStyle = cols[0]; ctx.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 16) {
      const g = ctx.createLinearGradient(x, 0, x + 16, 0);
      g.addColorStop(0, 'rgba(0,0,0,.24)'); g.addColorStop(0.45, 'rgba(255,255,255,.1)');
      g.addColorStop(0.55, 'rgba(255,255,255,.02)'); g.addColorStop(1, 'rgba(0,0,0,.3)');
      ctx.fillStyle = g; ctx.fillRect(x, 0, 16, h);
    }
    ctx.strokeStyle = cols[1]; ctx.lineWidth = 22; ctx.strokeRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 3; ctx.strokeRect(24, 24, w - 48, h - 48);
    for (let i = 0; i < 26; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      const g = ctx.createLinearGradient(x, y, x + rand(-4, 4), y + 30 + Math.random() * 90);
      g.addColorStop(0, 'rgba(94,52,28,.5)'); g.addColorStop(1, 'rgba(94,52,28,0)');
      ctx.fillStyle = g; ctx.fillRect(x, y, 2 + Math.random() * 5, 30 + Math.random() * 90);
    }
    ctx.fillStyle = 'rgba(235,240,235,.72)';
    ctx.font = 'bold 40px monospace';
    ctx.fillText('SPXU 204' + Math.floor(Math.random() * 9), 42, 92);
    ctx.font = 'bold 19px monospace';
    ctx.fillText('MAX GROSS 30,480 KG', 42, 132);
    ctx.fillStyle = 'rgba(255,255,255,.24)';
    ctx.font = 'bold 74px monospace';
    ctx.fillText(key.toUpperCase(), 44, 300);
    grain(ctx, w, h, 24);
  }, [1, 1]);
}

export function crateTexture() {
  return canvasTex('crate', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#6b5638'; ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 64) {
      const g = ctx.createLinearGradient(0, y, 0, y + 64);
      g.addColorStop(0, 'rgba(255,230,190,.12)'); g.addColorStop(1, 'rgba(0,0,0,.18)');
      ctx.fillStyle = g; ctx.fillRect(0, y, w, 64);
      ctx.strokeStyle = 'rgba(30,20,10,.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(40,28,14,.75)'; ctx.lineWidth = 14; ctx.strokeRect(7, 7, w - 14, h - 14);
    ctx.fillStyle = 'rgba(230,220,190,.5)';
    ctx.font = 'bold 30px monospace';
    ctx.fillText('SENTINEL LOGISTICS', 46, 250);
    ctx.font = 'bold 22px monospace';
    ctx.fillText('CLASS 4 // DRY', 46, 286);
    grain(ctx, w, h, 30);
  }, [1, 1]);
}

export function hazardTexture() {
  return canvasTex('hazard', 256, 64, (ctx, w, h) => {
    ctx.fillStyle = '#c9a12c'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#161616';
    for (let x = -h; x < w + h; x += 48) {
      ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + 24, h); ctx.lineTo(x + 24 + h, 0); ctx.lineTo(x + h, 0); ctx.closePath(); ctx.fill();
    }
    grain(ctx, w, h, 20);
  }, [4, 1]);
}

export function neonTexture(text, color = '#5ce8d4') {
  return canvasTex('neon_' + text + color, 512, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.font = 'bold 68px "Barlow Condensed", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = color; ctx.shadowBlur = 32;
    ctx.fillStyle = color;
    ctx.fillText(text, w / 2, h / 2);
    ctx.shadowBlur = 12; ctx.fillStyle = '#ffffff';
    ctx.fillText(text, w / 2, h / 2);
  });
}

export function graffitiTexture() {
  return canvasTex('graffiti', 512, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.font = 'bold 116px "Barlow Condensed", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff4d8d'; ctx.shadowBlur = 18;
    ctx.fillStyle = '#ff4d8d';
    ctx.fillText('NO GODS', w / 2, 110);
    ctx.shadowColor = '#5ce8d4'; ctx.shadowBlur = 14;
    ctx.fillStyle = '#5ce8d4';
    ctx.fillText('ONLY PING', w / 2, 205);
    ctx.shadowBlur = 0;
  });
}

export function warningTexture() {
  return canvasTex('warning', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#d8b23a'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.moveTo(w / 2, 26); ctx.lineTo(w - 24, h - 40); ctx.lineTo(24, h - 40); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d8b23a';
    ctx.font = 'bold 130px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('!', w / 2, h - 72);
    ctx.fillStyle = '#141414'; ctx.font = 'bold 20px monospace';
    ctx.fillText('RESTRICTED', w / 2, h - 12);
    grain(ctx, w, h, 16);
  }, [1, 1]);
}

// ---------- SMALL 3D HELPERS ----------
export function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function disposeObject(obj) {
  obj.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
      else o.material.dispose();
    }
  });
}

export function makeTextSprite(text, color = '#5ce8d4', size = 0.5) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.font = 'bold 38px "Barlow Condensed", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = color; ctx.shadowBlur = 12;
  ctx.fillStyle = color;
  ctx.fillText(text, 128, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.95 });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(size * 4, size, 1);
  return sprite;
}
