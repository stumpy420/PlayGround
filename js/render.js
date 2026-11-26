// First-person renderer: textured raycast world, billboard actors, effects and HUD.
//
// The simulation is still 2D and tile based. This renderer turns the operator's
// position and view angle into a Wolfenstein/Doom-style first-person camera with
// per-column depth, textured walls, z-tested sprites and a procedural weapon.

import { TILE, WORLD_W, WORLD_H, GW, GH, T_FLOOR } from './maps.js';
import { clamp, damp, dist, lerp } from './util.js';

const LEVELS = 16;
const EYE = TILE * 0.5;
const FOG_DIST = 1250;

function hexParts(hex, fallback = '#8899aa') {
  if (!hex || hex[0] !== '#') hex = fallback;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return {
    r: parseInt(h.slice(0, 2), 16) || 0,
    g: parseInt(h.slice(2, 4), 16) || 0,
    b: parseInt(h.slice(4, 6), 16) || 0,
  };
}

function hexA(hex, alpha) {
  const c = hexParts(hex);
  return `rgba(${c.r},${c.g},${c.b},${alpha})`;
}

function mixHex(a, b, t) {
  const A = hexParts(a);
  const B = hexParts(b);
  const to = (v) => Math.round(v).toString(16).padStart(2, '0');
  return `#${to(lerp(A.r, B.r, t))}${to(lerp(A.g, B.g, t))}${to(lerp(A.b, B.b, t))}`;
}

function randShake(mag) {
  return (Math.random() * 2 - 1) * mag;
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function canvasTexture(canvas) {
  const w = canvas.width;
  const h = canvas.height;
  const data = canvas.getContext('2d').getImageData(0, 0, w, h).data;
  return { w, h, data: new Uint32Array(data.buffer.slice(0)) };
}

function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export class Renderer {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.ctx = game.ctx;
    this.view = { w: window.innerWidth, h: window.innerHeight };
    this.dpr = 1;
    this.fov = 1.5;
    this.camera = { x: WORLD_W / 2, y: WORLD_H / 2, zoom: 1, shake: 0, sx: 0, sy: 0 };
    this.buf = makeCanvas(1, 1);
    this.bufCtx = this.buf.getContext('2d');
    this.bw = 1;
    this.bh = 1;
    this.image = null;
    this.bufData = null;
    this.zbuf = new Float32Array(1);
    this.tiles = [];
    this.fog = { r: 4, g: 8, b: 14 };
    this.paletteId = null;
    this.tileCache = new Map();
    this.spriteCache = new Map();
    this.card = document.getElementById('card-radar');
    this.cardCtx = this.card ? this.card.getContext('2d') : null;
    this.mini = document.getElementById('minimap');
    this.miniCtx = this.mini ? this.mini.getContext('2d') : null;
    this.resize();
  }

  resize() {
    this.view.w = Math.max(1, window.innerWidth);
    this.view.h = Math.max(1, window.innerHeight);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.view.w * this.dpr);
    this.canvas.height = Math.round(this.view.h * this.dpr);
    this.canvas.style.width = `${this.view.w}px`;
    this.canvas.style.height = `${this.view.h}px`;
    const aspect = this.view.w / this.view.h;
    this.fov = aspect > 1.55 ? 1.58 : aspect > 1.15 ? 1.46 : 1.16;
    const target = this.game?.isTouch ? 560 : 820;
    this.bw = Math.max(320, Math.min(target, Math.round(this.view.w * 0.64)));
    this.bh = Math.max(180, Math.round((this.bw * this.view.h) / this.view.w));
    this.buf.width = this.bw;
    this.buf.height = this.bh;
    this.image = this.bufCtx.createImageData(this.bw, this.bh);
    this.bufData = new Uint32Array(this.image.data.buffer);
    this.zbuf = new Float32Array(this.bw).fill(1e9);
  }

  resetCamera() {
    const g = this.game;
    if (!g.player) return;
    this.camera.x = g.player.x;
    this.camera.y = g.player.y;
    this.camera.shake = 0;
    this.camera.sx = 0;
    this.camera.sy = 0;
  }

  shake(amount) {
    if (!this.game.save?.settings?.shake) return;
    this.camera.shake = Math.min(22, this.camera.shake + amount);
  }

  updateCamera(dt) {
    const g = this.game;
    const cam = this.camera;
    if (g.state === 'menu' || !g.player) return;
    const p = g.player;
    cam.x = p.x;
    cam.y = p.y;
    cam.zoom = 1;
    cam.shake = damp(cam.shake, 0, 9, dt);
    cam.sx = randShake(cam.shake * 0.55);
    cam.sy = randShake(cam.shake * 0.55);
  }

  // Aim-down-sights blend: 0 = hip fire, 1 = fully shouldered.
  aimAmount() {
    const p = this.game?.player;
    return p ? clamp(p.aimT || 0, 0, 1) : 0;
  }

  scopeZoom() {
    const p = this.game?.player;
    if (!p) return 1;
    const def = p.weapons?.[p.slot]?.def;
    return def?.scope || 1.16;
  }

  // Narrow the projection while aiming. Scoped weapons pull in much further.
  viewFov() {
    const k = this.aimAmount();
    const zoom = 1 + (this.scopeZoom() - 1) * k;
    return this.fov / zoom;
  }

  // Screen-space pan for positional audio, relative to where the operator looks.
  panFor(x, y) {
    const p = this.game.player;
    if (!p) return 0;
    const rel = Math.atan2(y - p.y, x - p.x) - p.angle;
    return clamp(Math.sin(rel) * 0.85, -0.85, 0.85);
  }

  // --------------------------------------------------------------- projection
  project(x, y, z = 0) {
    const g = this.game;
    const p = g.player;
    if (!p) return null;
    const vw = this.view.w;
    const vh = this.view.h;
    const dx = x - p.x;
    const dy = y - p.y;
    const cos = Math.cos(p.angle);
    const sin = Math.sin(p.angle);
    const plane = Math.tan(this.viewFov() / 2);
    const depth = cos * dx + sin * dy;
    if (depth <= 2) return null;
    const lateral = -sin * dx + cos * dy;
    const focal = vw / 2 / plane;
    const screeX = vw / 2 + (lateral / depth) * focal + this.camera.sx;
    const horizon = vh / 2 + Math.tan(p.pitch) * focal + this.camera.sy;
    const screeY = horizon + (focal * (EYE - z)) / depth;
    return {
      x: screeX,
      y: screeY,
      depth,
      scale: focal / depth,
      focal,
      horizon,
    };
  }

  depthVisible(pr, pad = 2) {
    if (!pr) return false;
    const col = clamp(Math.floor((pr.x / this.view.w) * this.bw), 0, this.bw - 1);
    return pr.depth <= this.zbuf[col] + pad;
  }

  screenToWorld() {
    return { x: this.game.player?.x || 0, y: this.game.player?.y || 0 };
  }

  worldToScreen(wx, wy) {
    const pr = this.project(wx, wy, 0);
    return pr ? { x: pr.x, y: pr.y } : { x: -9999, y: -9999 };
  }

  // ----------------------------------------------------------------- textures
  shadeVariants(tex) {
    const out = [];
    const fog = this.fog;
    const amb = 0.78 + (this.ambient ?? 0.6) * 0.5;
    for (let l = 0; l < LEVELS; l++) {
      const t = l / (LEVELS - 1);
      const bright = (1 - t * 0.82) * amb;
      const mix = Math.pow(t, 1.45) * 0.92;
      const arr = new Uint32Array(tex.w * tex.h);
      for (let i = 0; i < arr.length; i++) {
        const px = tex.data[i];
        const a = px >>> 24;
        if (!a) continue;
        const r = px & 255;
        const g = (px >>> 8) & 255;
        const b = (px >>> 16) & 255;
        const nr = clamp(Math.round(r * bright * (1 - mix) + fog.r * mix), 0, 255);
        const ng = clamp(Math.round(g * bright * (1 - mix) + fog.g * mix), 0, 255);
        const nb = clamp(Math.round(b * bright * (1 - mix) + fog.b * mix), 0, 255);
        arr[i] = (a << 24) | (nb << 16) | (ng << 8) | nr;
      }
      out.push(arr);
    }
    return out;
  }

  whiteVariant(tex) {
    const arr = new Uint32Array(tex.w * tex.h);
    for (let i = 0; i < arr.length; i++) {
      const a = tex.data[i] >>> 24;
      if (a) arr[i] = (a << 24) | (0xf0 << 16) | (0xf4 << 8) | 248;
    }
    return arr;
  }

  preparePalette(palette) {
    if (!palette || this.paletteId === palette.id) return;
    this.paletteId = palette.id;
    this.fog = hexParts(palette.fog, '#05070b');
    this.ambient = palette.ambient ?? 0.6;
    const cached = this.tileCache.get(palette.id);
    if (cached) {
      this.tiles = cached.tiles;
      this.floorTex = cached.floor;
      this.ceilTex = cached.ceil;
      this.spriteCache.clear();
      return;
    }
    const tiles = [];
    tiles[1] = this.buildWallTex(palette);
    tiles[2] = this.buildCrateTex(palette);
    tiles[3] = this.buildBagsTex(palette);
    tiles[4] = this.buildBarrelTex(palette);
    tiles[5] = this.buildPillarTex(palette);
    this.tiles = tiles;
    this.floorTex = this.buildFloorTex(palette);
    this.ceilTex = this.buildCeilTex(palette);
    this.tileCache.set(palette.id, { tiles, floor: this.floorTex, ceil: this.ceilTex });
    this.spriteCache.clear();
  }

  textureFrom(draw) {
    const c = makeCanvas(64, 64);
    draw(c.getContext('2d'));
    const tex = canvasTexture(c);
    tex.shaded = this.shadeVariants(tex);
    return tex;
  }

  buildWallTex(palette) {
    return this.textureFrom((x) => {
      const rnd = seeded(0x51ab3);
      x.fillStyle = palette.wall;
      x.fillRect(0, 0, 64, 64);
      for (let py = 0; py < 64; py += 32) {
        for (let px = 0; px < 64; px += 32) {
          x.fillStyle = `rgba(255,255,255,${0.018 + rnd() * 0.03})`;
          x.fillRect(px + 1, py + 1, 30, 30);
          x.strokeStyle = hexA(palette.wallEdge, 0.5);
          x.lineWidth = 1;
          x.strokeRect(px + 0.5, py + 0.5, 31, 31);
        }
      }
      // Concrete grain and scratches.
      for (let i = 0; i < 120; i++) {
        x.fillStyle = rnd() > 0.5 ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.04)';
        x.fillRect(rnd() * 64, rnd() * 64, 1 + rnd() * 3, 2 + rnd() * 9);
      }
      x.fillStyle = hexA(palette.wallTop, 0.35);
      x.fillRect(0, 0, 64, 2);
      x.fillStyle = hexA(palette.wallEdge, 0.7);
      x.fillRect(0, 62, 64, 2);
      // Rivets / anchors.
      for (let i = 0; i < 4; i++) {
        x.fillStyle = 'rgba(0,0,0,0.35)';
        x.beginPath();
        x.arc(8 + i * 16, 9, 1.6, 0, Math.PI * 2);
        x.fill();
      }
    });
  }

  buildCrateTex(palette) {
    return this.textureFrom((x) => {
      const rnd = seeded(0x2c8f1);
      x.fillStyle = '#57432d';
      x.fillRect(0, 0, 64, 64);
      for (let i = 0; i < 5; i++) {
        x.fillStyle = i % 2 ? '#5f4a31' : '#4c3a26';
        x.fillRect(0, i * 13, 64, 11);
        x.fillStyle = 'rgba(0,0,0,0.32)';
        x.fillRect(0, i * 13 + 11, 64, 2);
      }
      for (let i = 0; i < 80; i++) {
        x.fillStyle = `rgba(0,0,0,${0.03 + rnd() * 0.07})`;
        x.fillRect(rnd() * 64, rnd() * 64, 1 + rnd() * 6, 1);
      }
      // Diagonal brace + steel corner plates.
      x.strokeStyle = 'rgba(28,20,12,0.75)';
      x.lineWidth = 5;
      x.beginPath();
      x.moveTo(4, 60);
      x.lineTo(60, 4);
      x.stroke();
      x.fillStyle = '#343b42';
      x.fillRect(0, 0, 10, 10);
      x.fillRect(54, 0, 10, 10);
      x.fillRect(0, 54, 10, 10);
      x.fillRect(54, 54, 10, 10);
      x.fillStyle = 'rgba(255,255,255,0.16)';
      x.fillRect(1, 1, 8, 2);
      x.fillRect(55, 1, 8, 2);
      x.fillStyle = palette.accent;
      x.globalAlpha = 0.5;
      x.fillRect(26, 28, 13, 8);
      x.globalAlpha = 1;
    });
  }

  buildBagsTex() {
    return this.textureFrom((x) => {
      const rnd = seeded(0x77a2b);
      x.fillStyle = '#4b4a39';
      x.fillRect(0, 0, 64, 64);
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
          const cx = 10 + col * 22 + (row % 2 ? 10 : 0);
          const cy = 9 + row * 15;
          x.fillStyle = row % 2 ? '#77745a' : '#6c6a52';
          x.beginPath();
          x.ellipse(cx, cy, 12, 8, 0, 0, Math.PI * 2);
          x.fill();
          x.strokeStyle = 'rgba(20,20,14,0.55)';
          x.lineWidth = 1;
          x.stroke();
          x.fillStyle = 'rgba(255,255,255,0.08)';
          x.beginPath();
          x.ellipse(cx - 2, cy - 2, 7, 3.4, 0, 0, Math.PI * 2);
          x.fill();
        }
      }
      for (let i = 0; i < 50; i++) {
        x.fillStyle = `rgba(0,0,0,${0.03 + rnd() * 0.08})`;
        x.fillRect(rnd() * 64, rnd() * 64, 1 + rnd() * 2, 1 + rnd() * 2);
      }
    });
  }

  buildBarrelTex() {
    return this.textureFrom((x) => {
      const rnd = seeded(0x9b11c);
      x.fillStyle = '#693723';
      x.fillRect(0, 0, 64, 64);
      const g = x.createLinearGradient(0, 0, 64, 0);
      g.addColorStop(0, 'rgba(0,0,0,0.45)');
      g.addColorStop(0.35, 'rgba(255,180,130,0.18)');
      g.addColorStop(0.55, 'rgba(255,200,150,0.1)');
      g.addColorStop(1, 'rgba(0,0,0,0.5)');
      x.fillStyle = g;
      x.fillRect(0, 0, 64, 64);
      x.fillStyle = '#3a2016';
      x.fillRect(0, 5, 64, 6);
      x.fillRect(0, 53, 64, 6);
      x.fillStyle = 'rgba(255,255,255,0.09)';
      x.fillRect(0, 7, 64, 1);
      for (let i = 0; i < 40; i++) {
        x.fillStyle = `rgba(30,12,6,${0.1 + rnd() * 0.25})`;
        x.fillRect(rnd() * 64, rnd() * 64, 1 + rnd() * 3, 1 + rnd() * 4);
      }
      x.fillStyle = '#d7a24a';
      x.globalAlpha = 0.7;
      x.fillRect(24, 28, 16, 8);
      x.globalAlpha = 1;
      x.fillStyle = '#111';
      x.font = '700 6px monospace';
      x.textAlign = 'center';
      x.fillText('FUEL', 32, 34);
    });
  }

  buildPillarTex(palette) {
    return this.textureFrom((x) => {
      const rnd = seeded(0x4d72e);
      x.fillStyle = mixHex(palette.wall, palette.wallTop, 0.35);
      x.fillRect(0, 0, 64, 64);
      x.strokeStyle = hexA(palette.wallEdge, 0.55);
      x.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        x.beginPath();
        x.moveTo(8 + i * 16, 0);
        x.lineTo(8 + i * 16, 64);
        x.stroke();
      }
      for (let i = 0; i < 90; i++) {
        x.fillStyle = rnd() > 0.5 ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.04)';
        x.fillRect(rnd() * 64, rnd() * 64, 1 + rnd() * 2, 1 + rnd() * 5);
      }
      x.fillStyle = hexA(palette.wallTop, 0.5);
      x.fillRect(0, 0, 64, 3);
      x.fillStyle = hexA(palette.wallEdge, 0.65);
      x.fillRect(0, 61, 64, 3);
    });
  }

  buildFloorTex(palette) {
    return this.textureFrom((x) => {
      const rnd = seeded(0x1f4c9);
      x.fillStyle = palette.floor2;
      x.fillRect(0, 0, 64, 64);
      // Two-by-two slab grid; one texture repeat covers half a world tile.
      for (let gy = 0; gy < 2; gy++) {
        for (let gx = 0; gx < 2; gx++) {
          const shade = 0.86 + rnd() * 0.2;
          x.fillStyle = mixHex(palette.floor, palette.floor3, shade - 0.5);
          x.fillRect(gx * 32 + 1, gy * 32 + 1, 30, 30);
          x.fillStyle = 'rgba(255,255,255,0.03)';
          x.fillRect(gx * 32 + 2, gy * 32 + 2, 28, 1);
          x.fillStyle = 'rgba(0,0,0,0.22)';
          x.fillRect(gx * 32 + 1, gy * 32 + 29, 30, 2);
        }
      }
      // Grout.
      x.fillStyle = 'rgba(0,0,0,0.4)';
      x.fillRect(0, 0, 64, 1);
      x.fillRect(0, 0, 1, 64);
      x.fillRect(0, 32, 64, 1);
      x.fillRect(32, 0, 1, 64);
      // Wear, grit and hairline cracks.
      for (let i = 0; i < 260; i++) {
        x.fillStyle = rnd() > 0.55 ? `rgba(0,0,0,${0.04 + rnd() * 0.13})` : 'rgba(255,255,255,0.035)';
        const s = 1 + rnd() * 2;
        x.fillRect(rnd() * 64, rnd() * 64, s, s);
      }
      x.strokeStyle = 'rgba(0,0,0,0.3)';
      x.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        let cx = rnd() * 64;
        let cy = rnd() * 64;
        x.beginPath();
        x.moveTo(cx, cy);
        for (let s = 0; s < 4; s++) {
          cx += (rnd() - 0.5) * 12;
          cy += (rnd() - 0.5) * 12;
          x.lineTo(cx, cy);
        }
        x.stroke();
      }
      // Faint palette accent stains.
      x.fillStyle = hexA(palette.accent, 0.05);
      x.fillRect(4, 38, 22, 18);
    });
  }

  buildCeilTex(palette) {
    return this.textureFrom((x) => {
      const rnd = seeded(0x7b2d1);
      x.fillStyle = mixHex(palette.fog, palette.wallEdge, 0.5);
      x.fillRect(0, 0, 64, 64);
      // Panels with seams and a support beam.
      x.fillStyle = 'rgba(0,0,0,0.3)';
      x.fillRect(0, 30, 64, 4);
      x.fillStyle = 'rgba(255,255,255,0.025)';
      x.fillRect(0, 29, 64, 1);
      for (let i = 0; i < 3; i++) {
        x.fillStyle = 'rgba(0,0,0,0.18)';
        x.fillRect(10 + i * 20, 0, 1, 64);
      }
      for (let i = 0; i < 90; i++) {
        x.fillStyle = rnd() > 0.5 ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.02)';
        x.fillRect(rnd() * 64, rnd() * 64, 1 + rnd() * 3, 1 + rnd() * 2);
      }
      // Dim service light.
      const glow = x.createRadialGradient(28, 12, 1, 28, 12, 18);
      glow.addColorStop(0, hexA(palette.accent, 0.22));
      glow.addColorStop(1, hexA(palette.accent, 0));
      x.fillStyle = glow;
      x.fillRect(0, 0, 64, 64);
    });
  }

  spriteTex(key, w, h, draw, flash = false) {
    const cacheKey = `${key}@${this.paletteId}`;
    let tex = this.spriteCache.get(cacheKey);
    if (tex) return tex;
    const c = makeCanvas(w, h);
    draw(c.getContext('2d'));
    tex = canvasTexture(c);
    tex.shaded = this.shadeVariants(tex);
    if (flash) tex.flash = this.whiteVariant(tex);
    this.spriteCache.set(cacheKey, tex);
    return tex;
  }

  enemyTex(e) {
    const color = e.def.color || '#f87171';
    return this.spriteTex(`enemy:${e.type}`, 48, 72, (cx) => {
      const heavy = e.type === 'heavy';
      const marksman = e.type === 'marksman';
      // Legs.
      cx.fillStyle = '#333a2e';
      cx.fillRect(15, 47, 7, 22);
      cx.fillRect(26, 47, 7, 22);
      cx.fillStyle = '#191d16';
      cx.fillRect(13, 65, 11, 5);
      cx.fillRect(25, 65, 11, 5);
      cx.fillStyle = 'rgba(0,0,0,0.35)';
      cx.fillRect(15, 47, 2, 22);
      cx.fillRect(26, 47, 2, 22);
      // Torso and armor.
      const grad = cx.createLinearGradient(0, 22, 0, 50);
      grad.addColorStop(0, '#6a7058');
      grad.addColorStop(1, '#3a4033');
      cx.fillStyle = grad;
      rr(cx, 11, 22, 26, 29, 5);
      cx.fill();
      cx.strokeStyle = 'rgba(206,222,206,0.22)';
      cx.lineWidth = 1.2;
      cx.stroke();
      cx.fillStyle = hexA(color, 0.85);
      cx.fillRect(19, 27, 4, 17);
      cx.fillStyle = 'rgba(8,12,16,0.55)';
      cx.fillRect(11, 46, 26, 4);
      cx.fillStyle = 'rgba(214,232,210,0.16)';
      cx.fillRect(12, 24, 3, 20);
      // Shoulders.
      cx.fillStyle = heavy ? '#7a7f66' : '#5b6149';
      rr(cx, 4, 22, 10, 13, 4);
      cx.fill();
      rr(cx, 34, 22, 10, 13, 4);
      cx.fill();
      if (heavy) {
        cx.fillStyle = hexA(color, 0.7);
        rr(cx, 2, 24, 13, 8, 3);
        cx.fill();
        rr(cx, 33, 24, 13, 8, 3);
        cx.fill();
      }
      // Head + helmet.
      cx.fillStyle = '#4a5040';
      cx.beginPath();
      cx.arc(24, 14, 9, 0, Math.PI * 2);
      cx.fill();
      cx.strokeStyle = 'rgba(214,230,214,0.25)';
      cx.lineWidth = 1.2;
      cx.stroke();
      cx.fillStyle = '#2b3025';
      cx.beginPath();
      cx.arc(24, 13, 7.5, Math.PI, Math.PI * 2);
      cx.fill();
      cx.fillStyle = color;
      cx.globalAlpha = 0.9;
      cx.fillRect(18, 13, 12, 4);
      cx.globalAlpha = 1;
      cx.fillStyle = hexA(color, 0.5);
      cx.fillRect(18, 17, 12, 1);
      // Weapon.
      cx.save();
      cx.translate(24, 38);
      cx.rotate(marksman ? -1.0 : -0.82);
      cx.fillStyle = '#0b1015';
      cx.fillRect(-3, -26, 6, marksman ? 48 : 38);
      cx.fillStyle = '#2e3a45';
      cx.fillRect(-4, -6, 8, 10);
      if (marksman) {
        cx.fillStyle = '#1e293b';
        cx.fillRect(-5, -20, 10, 9);
        cx.fillStyle = '#a78bfa';
        cx.fillRect(-2, -18, 4, 3);
      }
      cx.restore();
      // Amber/red optic dot.
      cx.fillStyle = color;
      cx.shadowColor = color;
      cx.shadowBlur = 5;
      cx.beginPath();
      cx.arc(24, 15, 1.4, 0, Math.PI * 2);
      cx.fill();
      cx.shadowBlur = 0;
    }, true);
  }

  intelTex() {
    return this.spriteTex('intel', 64, 64, (cx) => {
      cx.shadowColor = '#fbbf24';
      cx.shadowBlur = 14;
      cx.fillStyle = '#1f2937';
      rr(cx, 14, 16, 36, 30, 3);
      cx.fill();
      cx.fillStyle = '#fbbf24';
      rr(cx, 17, 19, 30, 20, 2);
      cx.fill();
      cx.fillStyle = '#0f172a';
      cx.fillRect(20, 22, 24, 3);
      cx.fillRect(20, 27, 16, 2);
      cx.fillRect(20, 31, 20, 2);
      cx.shadowBlur = 0;
      cx.strokeStyle = 'rgba(253,230,138,0.8)';
      cx.lineWidth = 2;
      cx.strokeRect(13, 15, 38, 32);
      cx.fillStyle = '#fbbf24';
      cx.font = '700 8px monospace';
      cx.textAlign = 'center';
      cx.fillText('INTEL', 32, 58);
    });
  }

  pickupTex(type) {
    return this.spriteTex(`pickup:${type}`, 64, 64, (cx) => {
      const color = type === 'med' ? '#4ade80' : type === 'armor' ? '#38bdf8' : '#7dd3fc';
      cx.shadowColor = color;
      cx.shadowBlur = 10;
      cx.fillStyle = '#0f1a24';
      rr(cx, 12, 18, 40, 28, 3);
      cx.fill();
      cx.shadowBlur = 0;
      cx.strokeStyle = hexA(color, 0.65);
      cx.lineWidth = 2;
      cx.strokeRect(12, 18, 40, 28);
      if (type === 'med') {
        cx.fillStyle = '#e2e8f0';
        cx.fillRect(14, 20, 36, 24);
        cx.fillStyle = '#dc2626';
        cx.fillRect(29, 23, 6, 18);
        cx.fillRect(23, 29, 18, 6);
      } else if (type === 'armor') {
        cx.fillStyle = hexA(color, 0.85);
        cx.beginPath();
        cx.moveTo(32, 22);
        cx.lineTo(46, 27);
        cx.lineTo(43, 40);
        cx.lineTo(32, 45);
        cx.lineTo(21, 40);
        cx.lineTo(18, 27);
        cx.closePath();
        cx.fill();
        cx.fillStyle = '#0b1119';
        cx.fillRect(30, 27, 4, 11);
        cx.fillRect(26, 31, 12, 4);
      } else {
        cx.fillStyle = '#e0a94a';
        for (let i = 0; i < 4; i++) cx.fillRect(20 + i * 6, 24, 4, 16);
        cx.fillStyle = hexA(color, 0.8);
        cx.fillRect(18, 21, 28, 3);
      }
    });
  }

  grenadeTex() {
    return this.spriteTex('grenade', 32, 32, (cx) => {
      cx.fillStyle = '#27331f';
      cx.beginPath();
      cx.arc(16, 18, 9, 0, Math.PI * 2);
      cx.fill();
      cx.strokeStyle = '#4b5a38';
      cx.lineWidth = 1.5;
      cx.stroke();
      cx.fillStyle = '#64734c';
      cx.fillRect(13, 5, 6, 6);
      cx.fillStyle = '#f87171';
      cx.beginPath();
      cx.arc(16, 18, 2.4, 0, Math.PI * 2);
      cx.fill();
    });
  }

  // ------------------------------------------------------------------- menu
  renderMenu() {
    const g = this.game;
    const ctx = this.ctx;
    const t = g.time;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = '#04070b';
    ctx.fillRect(0, 0, this.view.w, this.view.h);
    if (!g.menuMap) return;
    const cam = {
      x: WORLD_W / 2 + Math.sin(t * 0.035) * 260 + Math.cos(t * 0.017) * 120,
      y: WORLD_H / 2 + Math.cos(t * 0.028) * 150,
      zoom: clamp(Math.max(this.view.w / 1500, this.view.h / 1000) * 1.2, 0.55, 1.5),
    };
    ctx.save();
    ctx.translate(this.view.w / 2, this.view.h / 2);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);
    this.drawLayer(g.menuMap.canvas, cam);
    const sweep = t * 0.55;
    for (const blip of g.menuMap.enemySpawns) {
      const d = dist(cam.x, cam.y, blip.x, blip.y);
      const a = Math.atan2(blip.y - cam.y, blip.x - cam.x);
      const diff = Math.abs(Math.atan2(Math.sin(a - sweep), Math.cos(a - sweep)));
      const alpha = Math.max(0, 1 - diff / 1.4) * 0.55;
      if (alpha > 0.02 && d < 900) {
        ctx.fillStyle = `rgba(248,113,113,${alpha})`;
        ctx.beginPath();
        ctx.arc(blip.x, blip.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = 'rgba(74,222,128,0.55)';
    ctx.beginPath();
    ctx.arc(g.menuMap.extraction.x, g.menuMap.extraction.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, this.view.w, this.view.h);
    grad.addColorStop(0, 'rgba(4,7,11,0.93)');
    grad.addColorStop(0.42, 'rgba(4,7,11,0.62)');
    grad.addColorStop(0.72, 'rgba(4,7,11,0.3)');
    grad.addColorStop(1, 'rgba(4,7,11,0.72)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.view.w, this.view.h);
    const glow = ctx.createRadialGradient(this.view.w * 0.72, this.view.h * 0.36, 0, this.view.w * 0.72, this.view.h * 0.36, this.view.w * 0.5);
    glow.addColorStop(0, 'rgba(240,162,60,0.06)');
    glow.addColorStop(0.5, 'rgba(56,189,248,0.03)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, this.view.w, this.view.h);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 34; i++) {
      const seed = i * 91.7;
      const x = (Math.sin(seed + t * (0.03 + (i % 5) * 0.012)) * 0.5 + 0.5) * this.view.w;
      const y = ((seed * 1.7 + t * (6 + (i % 7) * 2.5)) % (this.view.h + 80)) - 40;
      const alpha = 0.05 + (i % 4) * 0.025;
      ctx.fillStyle = i % 5 === 0 ? `rgba(240,162,60,${alpha})` : `rgba(125,211,252,${alpha})`;
      ctx.fillRect(x, y, 1.4, 1.4);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  drawCardRadar() {
    const g = this.game;
    const ctx = this.cardCtx;
    const c = this.card;
    if (!ctx || !c || g.state !== 'menu' || !g.menuMap) return;
    const w = c.width;
    const h = c.height;
    const mm = g.menuMap.minimap;
    if (mm) {
      const scale = Math.max(w / mm.width, h / mm.height);
      const dw = mm.width * scale;
      const dh = mm.height * scale;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(mm, (w - dw) / 2, (h - dh) / 2, dw, dh);
    }
    ctx.fillStyle = 'rgba(3,9,14,0.56)';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(125,211,252,0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(240,162,60,0.22)';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.31, 0, Math.PI * 2);
    ctx.stroke();
    const cx = w * 0.56;
    const cy = h * 0.48;
    const sweep = g.time * 1.15;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(sweep);
    const rg = ctx.createLinearGradient(0, 0, Math.max(w, h) * 0.6, 0);
    rg.addColorStop(0, 'rgba(125,211,252,0.22)');
    rg.addColorStop(1, 'rgba(125,211,252,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, Math.max(w, h) * 0.6, -0.5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(125,211,252,0.5)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.max(w, h) * 0.6, 0);
    ctx.stroke();
    ctx.restore();
    const toRadar = (wx, wy) => {
      const scale = Math.max(w / WORLD_W, h / WORLD_H);
      const dw = WORLD_W * scale;
      const dh = WORLD_H * scale;
      return { x: (w - dw) / 2 + wx * scale, y: (h - dh) / 2 + wy * scale };
    };
    const blips = [
      ...g.menuMap.intel.map((i) => ({ ...i, color: '#fbbf24' })),
      ...g.menuMap.enemySpawns.map((s) => ({ ...s, color: '#f87171' })),
      { ...g.menuMap.extraction, color: '#4ade80' },
    ];
    for (const b of blips) {
      const p = toRadar(b.x, b.y);
      const ang = Math.atan2(p.y - cy, p.x - cx);
      const diff = Math.abs(Math.atan2(Math.sin(ang - sweep), Math.cos(ang - sweep)));
      const a = Math.max(0.2, 1 - diff / 1.5);
      ctx.globalAlpha = a;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, b.color === '#4ade80' ? 3 : 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = 'rgba(240,162,60,0.5)';
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  }

  drawLayer(canvas, cam) {
    if (!canvas) return;
    const ctx = this.ctx;
    const hw = this.view.w / (2 * cam.zoom);
    const hh = this.view.h / (2 * cam.zoom);
    const x0 = clamp(cam.x - hw - 90, 0, canvas.width);
    const y0 = clamp(cam.y - hh - 90, 0, canvas.height);
    const x1 = clamp(cam.x + hw + 90, 0, canvas.width);
    const y1 = clamp(cam.y + hh + 90, 0, canvas.height);
    const w = x1 - x0;
    const h = y1 - y0;
    if (w <= 0 || h <= 0) return;
    ctx.drawImage(canvas, x0, y0, w, h, x0, y0, w, h);
  }

  // ------------------------------------------------------------------- game
  renderGame() {
    const g = this.game;
    const ctx = this.ctx;
    const vw = this.view.w;
    const vh = this.view.h;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = '#04060a';
    ctx.fillRect(0, 0, vw, vh);
    if (!g.map || !g.player) return;
    this.preparePalette(g.map.palette);
    this.drawBackdrop();
    this.renderScene();
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.buf, 0, 0, this.bw, this.bh, this.camera.sx, this.camera.sy, vw, vh);
    ctx.restore();
    this.drawActorShadows();
    this.drawExtractionBeam();
    this.drawParticles();
    this.drawBullets();
    this.drawTexts();
    this.drawEnemyOverlays();
    this.drawViewmodel();
    this.drawScope();
    this.drawCrosshair();
    this.drawObjectiveMarkers();
    this.drawMinimap();
  }

  // Soft contact shadows so billboard actors sit on the floor instead of floating.
  drawActorShadows() {
    const g = this.game;
    if (!g.map || !g.player) return;
    const ctx = this.ctx;
    const items = [];
    for (const e of g.enemies) if (!e.dead) items.push({ x: e.x, y: e.y, r: e.r * 1.35, a: 0.5 });
    for (const item of g.pickups) items.push({ x: item.x, y: item.y, r: 10, a: 0.34 });
    if (!g.skirmish) for (const item of g.map.intel) if (!item.taken) items.push({ x: item.x, y: item.y, r: 12, a: 0.32 });
    for (const item of items) {
      const pr = this.project(item.x, item.y, 0);
      if (!pr || !this.depthVisible(pr, 0)) continue;
      const rw = clamp(pr.scale * item.r, 3, 220);
      if (pr.x < -rw || pr.x > this.view.w + rw) continue;
      ctx.save();
      ctx.translate(pr.x, pr.y);
      ctx.scale(1, 0.34);
      const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, rw);
      grd.addColorStop(0, `rgba(0,0,0,${item.a})`);
      grd.addColorStop(0.55, `rgba(0,0,0,${item.a * 0.55})`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(0, 0, rw, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawBackdrop() {
    const g = this.game;
    const ctx = this.ctx;
    const pal = g.map.palette;
    const vw = this.view.w;
    const vh = this.view.h;
    const focal = vw / 2 / Math.tan(this.viewFov() / 2);
    const horizon = clamp(vh / 2 + Math.tan(g.player.pitch) * focal, -vh, vh * 2);
    const sky = ctx.createLinearGradient(0, 0, 0, Math.max(1, horizon));
    sky.addColorStop(0, pal.fog);
    sky.addColorStop(0.65, mixHex(pal.fog, pal.wall, 0.22));
    sky.addColorStop(1, mixHex(pal.fog, pal.wallTop, 0.32));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, vw, Math.max(1, horizon));
    const floor = ctx.createLinearGradient(0, Math.max(0, horizon), 0, vh);
    floor.addColorStop(0, pal.fog);
    floor.addColorStop(0.18, pal.floor2);
    floor.addColorStop(0.72, pal.floor);
    floor.addColorStop(1, mixHex(pal.floor, '#000000', 0.35));
    ctx.fillStyle = floor;
    ctx.fillRect(0, Math.max(0, horizon), vw, vh - Math.max(0, horizon));
    // Haze band at the horizon line.
    const haze = ctx.createLinearGradient(0, horizon - vh * 0.08, 0, horizon + vh * 0.08);
    haze.addColorStop(0, 'rgba(0,0,0,0)');
    haze.addColorStop(0.5, hexA(pal.dust, 0.05));
    haze.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, horizon - vh * 0.08, vw, vh * 0.16);
  }

  renderScene() {
    const g = this.game;
    const p = g.player;
    const map = g.map;
    const bw = this.bw;
    const bh = this.bh;
    const data = this.bufData;
    const zbuf = this.zbuf;
    data.fill(0);
    zbuf.fill(1e9);
    const focal = bw / 2 / Math.tan(this.viewFov() / 2);
    const horizon = bh / 2 + Math.tan(p.pitch) * focal;
    const cos = Math.cos(p.angle);
    const sin = Math.sin(p.angle);
    const plane = Math.tan(this.viewFov() / 2);
    const planeX = -sin * plane;
    const planeY = cos * plane;
    this.castPlanes(focal, horizon, cos, sin, planeX, planeY);
    const tiles = this.tiles;
    const px = p.x;
    const py = p.y;
    for (let x = 0; x < bw; x++) {
      const cameraX = (2 * x) / bw - 1;
      const rayX = cos + planeX * cameraX;
      const rayY = sin + planeY * cameraX;
      let mapX = Math.floor(px / TILE);
      let mapY = Math.floor(py / TILE);
      const deltaX = rayX === 0 ? 1e30 : Math.abs(TILE / rayX);
      const deltaY = rayY === 0 ? 1e30 : Math.abs(TILE / rayY);
      const stepX = rayX < 0 ? -1 : 1;
      const stepY = rayY < 0 ? -1 : 1;
      let sideX = rayX === 0 ? 1e30 : rayX < 0 ? (px - mapX * TILE) / -rayX : ((mapX + 1) * TILE - px) / rayX;
      let sideY = rayY === 0 ? 1e30 : rayY < 0 ? (py - mapY * TILE) / -rayY : ((mapY + 1) * TILE - py) / rayY;
      let side = 0;
      let tile = 1;
      let guard = 0;
      for (;;) {
        if (sideX < sideY) {
          sideX += deltaX;
          mapX += stepX;
          side = 0;
        } else {
          sideY += deltaY;
          mapY += stepY;
          side = 1;
        }
        if (mapX < 0 || mapY < 0 || mapX >= GW || mapY >= GH) {
          tile = 1;
          break;
        }
        tile = map.grid[mapY * GW + mapX];
        if (tile !== T_FLOOR) break;
        if (guard++ > 260) {
          tile = 1;
          break;
        }
      }
      const perp = side === 0 ? sideX - deltaX : sideY - deltaY;
      const renderPerp = Math.max(6, perp);
      zbuf[x] = perp;
      const lineH = (focal * TILE) / renderPerp;
      const top = horizon - lineH / 2;
      const bottom = horizon + lineH / 2;
      if (bottom < 0 || top > bh) continue;
      const tex = tiles[tile] || tiles[1];
      const texW = tex.w;
      const texH = tex.h;
      let wallX;
      if (side === 0) wallX = py + perp * rayY;
      else wallX = px + perp * rayX;
      wallX -= Math.floor(wallX / TILE) * TILE;
      let texX = Math.floor((wallX / TILE) * texW);
      if (side === 0 && rayX > 0) texX = texW - texX - 1;
      if (side === 1 && rayY < 0) texX = texW - texX - 1;
      texX = clamp(texX, 0, texW - 1);
      let level = Math.round(Math.pow(clamp(perp / FOG_DIST, 0, 1), 0.72) * (LEVELS - 1));
      if (side === 1) level = Math.min(LEVELS - 1, level + 2);
      const src = tex.shaded[level];
      const inv = texH / (bottom - top);
      const y0 = Math.max(0, Math.ceil(top));
      const y1 = Math.min(bh - 1, Math.floor(bottom));
      for (let y = y0; y <= y1; y++) {
        let ty = ((y - top) * inv) | 0;
        ty = ty < 0 ? 0 : ty >= texH ? texH - 1 : ty;
        data[y * bw + x] = src[ty * texW + texX];
      }
    }
    this.renderSprites(focal, horizon);
    this.bufCtx.putImageData(this.image, 0, 0);
  }

  // Textured floor and ceiling, projected row by row before the walls are cast.
  castPlanes(focal, horizon, cos, sin, planeX, planeY) {
    const bw = this.bw;
    const bh = this.bh;
    const data = this.bufData;
    const p = this.game.player;
    const floorTex = this.floorTex;
    const ceilTex = this.ceilTex;
    if (!floorTex || !ceilTex) return;
    const px = p.x;
    const py = p.y;
    const fw = floorTex.w;
    const fh = floorTex.h;
    const cw = ceilTex.w;
    const ch = ceilTex.h;
    const fs = floorTex.shaded;
    const cs = ceilTex.shaded;
    const far = FOG_DIST * 1.55;
    const fogPx = (255 << 24) | (this.fog.b << 16) | (this.fog.g << 8) | this.fog.r;
    // Floor rows.
    const fy0 = Math.max(0, Math.ceil(horizon) + 1);
    for (let y = fy0; y < bh; y++) {
      const rowDist = (EYE * focal) / (y - horizon);
      const row = y * bw;
      if (rowDist > far) {
        data.fill(fogPx, row, row + bw);
        continue;
      }
      const stepX = (rowDist * 2 * planeX) / bw;
      const stepY = (rowDist * 2 * planeY) / bw;
      let wx = px + rowDist * (cos - planeX);
      let wy = py + rowDist * (sin - planeY);
      const level = clamp(Math.round(Math.pow(clamp(rowDist / FOG_DIST, 0, 1), 0.72) * (LEVELS - 1)), 0, LEVELS - 1);
      const src = fs[level];
      for (let x = 0; x < bw; x++) {
        const tx = (((wx / TILE) * fw) | 0) & (fw - 1);
        const ty = (((wy / TILE) * fh) | 0) & (fh - 1);
        data[row + x] = src[ty * fw + tx];
        wx += stepX;
        wy += stepY;
      }
    }
    // Ceiling rows.
    const cy1 = Math.min(bh - 1, Math.floor(horizon) - 1);
    for (let y = 0; y <= cy1; y++) {
      const rowDist = (EYE * focal) / (horizon - y);
      const row = y * bw;
      if (rowDist > far) {
        data.fill(fogPx, row, row + bw);
        continue;
      }
      const stepX = (rowDist * 2 * planeX) / bw;
      const stepY = (rowDist * 2 * planeY) / bw;
      let wx = px + rowDist * (cos - planeX);
      let wy = py + rowDist * (sin - planeY);
      const level = clamp(Math.round(Math.pow(clamp(rowDist / FOG_DIST, 0, 1), 0.72) * (LEVELS - 1)), 0, LEVELS - 1);
      const src = cs[level];
      for (let x = 0; x < bw; x++) {
        const tx = (((wx / TILE) * cw) | 0) & (cw - 1);
        const ty = (((wy / TILE) * ch) | 0) & (ch - 1);
        data[row + x] = src[ty * cw + tx];
        wx += stepX;
        wy += stepY;
      }
    }
  }

  renderSprites(focal, horizon) {
    const g = this.game;
    const p = g.player;
    const bw = this.bw;
    const bh = this.bh;
    const data = this.bufData;
    const zbuf = this.zbuf;
    const list = [];
    for (const e of g.enemies) {
      if (e.dead) continue;
      list.push({
        x: e.x, y: e.y, z: 0, h: e.type === 'heavy' ? 52 : 46,
        kind: 'enemy', ref: e, tex: this.enemyTex(e),
        flash: e.hitFlash > 0,
      });
    }
    for (const item of g.map.intel) {
      if (item.taken) continue;
      list.push({ x: item.x, y: item.y, z: 22 + Math.sin(g.time * 2 + item.pulse) * 3, h: 17, tex: this.intelTex() });
    }
    for (const item of g.pickups) {
      list.push({ x: item.x, y: item.y, z: 9 + Math.sin(item.bob) * 2, h: 15, tex: this.pickupTex(item.type) });
    }
    for (const gr of g.grenades) {
      const progress = clamp(1 - gr.timer / gr.max, 0, 1);
      list.push({ x: gr.x, y: gr.y, z: 6 + Math.sin(progress * Math.PI) * 18, h: 9, tex: this.grenadeTex() });
    }
    const cos = Math.cos(p.angle);
    const sin = Math.sin(p.angle);
    const plane = Math.tan(this.viewFov() / 2);
    const planeX = -sin * plane;
    const planeY = cos * plane;
    const invDet = 1 / (planeX * sin - cos * planeY);
    for (const sp of list) {
      const dx = sp.x - p.x;
      const dy = sp.y - p.y;
      sp.depth = cos * dx + sin * dy;
      sp.lat = -sin * dx + cos * dy;
    }
    list.sort((a, b) => b.depth - a.depth);
    for (const sp of list) {
      const depth = sp.depth;
      if (depth <= 8) continue;
      const tex = sp.tex;
      const screenX = bw / 2 + (sp.lat / depth) * focal;
      const spriteH = (focal * sp.h) / depth;
      const spriteW = (spriteH * tex.w) / tex.h;
      const baseY = horizon + (focal * (EYE - sp.z)) / depth;
      const topY = baseY - spriteH;
      let left = screenX - spriteW / 2;
      const right = left + spriteW;
      if (right < -4 || left > bw + 4 || baseY < -4 || topY > bh + 4) continue;
      let level = Math.round(Math.pow(clamp(depth / FOG_DIST, 0, 1), 0.72) * (LEVELS - 1));
      level = clamp(level, 0, LEVELS - 1);
      const src = sp.flash ? tex.flash : tex.shaded[level];
      const texStepX = tex.w / spriteW;
      const texStepY = tex.h / spriteH;
      const startX = Math.max(0, Math.ceil(left));
      const endX = Math.min(bw - 1, Math.floor(right));
      const startY = Math.max(0, Math.ceil(topY));
      const endY = Math.min(bh - 1, Math.floor(baseY));
      for (let sx = startX; sx <= endX; sx++) {
        if (depth >= zbuf[sx]) continue;
        let tx = ((sx - left) * texStepX) | 0;
        tx = tx < 0 ? 0 : tx >= tex.w ? tex.w - 1 : tx;
        for (let sy = startY; sy <= endY; sy++) {
          let ty = ((sy - topY) * texStepY) | 0;
          ty = ty < 0 ? 0 : ty >= tex.h ? tex.h - 1 : ty;
          const px = src[ty * tex.w + tx];
          if ((px >>> 24) > 70) data[sy * bw + sx] = px;
        }
      }
      sp.screen = { x: screenX, y: topY, w: spriteW, h: spriteH, depth };
    }
    // Keep the projected rectangles for overlays drawn later this frame.
    this.lastSprites = list;
  }

  // --------------------------------------------------------------- overlays
  drawExtractionBeam() {
    const g = this.game;
    const ex = g.map.extraction;
    const pr = this.project(ex.x, ex.y, 0);
    if (!pr || !this.depthVisible(pr, 12)) return;
    const ctx = this.ctx;
    const active = g.extractionActive;
    const hpx = clamp(pr.scale * 120, 40, 900);
    const wpx = clamp(pr.scale * 34, 8, 240);
    const pulse = 0.55 + Math.sin(g.time * 2.6) * 0.45;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createLinearGradient(0, pr.y, 0, pr.y - hpx);
    const color = active ? '52,211,153' : '100,116,139';
    grad.addColorStop(0, `rgba(${color},${active ? 0.3 + pulse * 0.12 : 0.06})`);
    grad.addColorStop(0.35, `rgba(${color},${active ? 0.14 : 0.03})`);
    grad.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(pr.x - wpx / 2, pr.y - hpx, wpx, hpx);
    // Ground ring.
    if (pr.scale * 60 < 1200) {
      const rw = Math.max(10, pr.scale * 30);
      ctx.strokeStyle = `rgba(${color},${active ? 0.5 + pulse * 0.3 : 0.14})`;
      ctx.lineWidth = clamp(pr.scale * 2, 1, 4);
      ctx.beginPath();
      ctx.ellipse(pr.x, pr.y, rw, rw * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawParticles() {
    const g = this.game;
    const ctx = this.ctx;
    const vw = this.view.w;
    const vh = this.view.h;
    for (const part of g.particles) {
      const z = part.type === 'flash' || part.type === 'spark' ? 24
        : part.type === 'smoke' ? 16
          : part.type === 'ring' ? 2
            : part.type === 'casing' || part.type === 'debris' ? 5 : 13;
      const pr = this.project(part.x, part.y, z);
      if (!pr || !this.depthVisible(pr, 6)) continue;
      const life = clamp(part.life / part.max, 0, 1);
      if (pr.x < -80 || pr.x > vw + 80 || pr.y < -80 || pr.y > vh + 80) continue;
      const size = clamp(part.size * pr.scale, 0.6, 180);
      if (part.type === 'spark') {
        const tail = this.project(part.x - part.vx * 0.02, part.y - part.vy * 0.02, z);
        ctx.strokeStyle = hexA(part.color, life * 0.9);
        ctx.lineWidth = clamp(size * 0.35, 0.7, 3);
        ctx.beginPath();
        ctx.moveTo(pr.x, pr.y);
        ctx.lineTo(tail ? tail.x : pr.x, tail ? tail.y : pr.y);
        ctx.stroke();
      } else if (part.type === 'blood') {
        ctx.fillStyle = hexA(part.color, life * 0.85);
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, Math.max(0.6, size * 0.5), 0, Math.PI * 2);
        ctx.fill();
      } else if (part.type === 'smoke') {
        ctx.fillStyle = hexA(part.color, (part.alpha ?? 0.2) * life);
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, Math.max(1, size), 0, Math.PI * 2);
        ctx.fill();
      } else if (part.type === 'flash') {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const r = clamp(size, 4, 220);
        const fg = ctx.createRadialGradient(pr.x, pr.y, 0, pr.x, pr.y, r);
        fg.addColorStop(0, hexA(part.color, 0.85 * life));
        fg.addColorStop(0.35, hexA(part.color, 0.3 * life));
        fg.addColorStop(1, hexA(part.color, 0));
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (part.type === 'ring') {
        ctx.strokeStyle = hexA(part.color, life * 0.7);
        ctx.lineWidth = clamp(2.5 * life + 0.5, 1, 4);
        ctx.beginPath();
        ctx.ellipse(pr.x, pr.y, Math.max(2, size * (1 - life) + 6), Math.max(1, size * (1 - life) * 0.32 + 2), 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (part.type === 'casing' || part.type === 'debris') {
        ctx.save();
        ctx.translate(pr.x, pr.y);
        ctx.rotate(part.rot || 0);
        ctx.fillStyle = hexA(part.color, life);
        const s = Math.max(1.5, size * 0.5);
        ctx.fillRect(-s, -s * 0.35, s * 2, s * 0.7);
        ctx.restore();
      }
    }
  }

  drawBullets() {
    const g = this.game;
    const ctx = this.ctx;
    for (const b of g.bullets) {
      const pr = this.project(b.x, b.y, 23);
      if (!pr || !this.depthVisible(pr, 4)) continue;
      const len = clamp(b.speed * 0.02, 8, 46);
      const tail = this.project(b.x - Math.cos(b.angle) * len, b.y - Math.sin(b.angle) * len, 23);
      const color = b.owner === 'player' ? '#fff6d8' : b.color;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = hexA(color, 0.22);
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(tail ? tail.x : pr.x, tail ? tail.y : pr.y);
      ctx.lineTo(pr.x, pr.y);
      ctx.stroke();
      ctx.strokeStyle = hexA(color, 0.95);
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(tail ? tail.x : pr.x, tail ? tail.y : pr.y);
      ctx.lineTo(pr.x, pr.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawTexts() {
    const g = this.game;
    const ctx = this.ctx;
    for (const t of g.texts) {
      const pr = this.project(t.x, t.y, 34);
      if (!pr || !this.depthVisible(pr, 20)) continue;
      const life = clamp(t.life / t.max, 0, 1);
      const rise = (1 - life) * 26;
      const size = clamp(t.size * pr.scale * 1.1, 7, 22);
      ctx.globalAlpha = life;
      ctx.font = `700 ${size}px "Bahnschrift", "Arial Narrow", sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.strokeText(t.text, pr.x, pr.y - rise);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, pr.x, pr.y - rise);
      ctx.globalAlpha = 1;
    }
  }

  drawEnemyOverlays() {
    const g = this.game;
    const ctx = this.ctx;
    for (const e of g.enemies) {
      if (e.dead) continue;
      if (e.hp >= e.maxHp && e.alertFlash <= 0) continue;
      const pr = this.project(e.x, e.y, e.type === 'heavy' ? 55 : 49);
      if (!pr || pr.depth > 780 || !this.depthVisible(pr, 0)) continue;
      const w = clamp(pr.scale * 26, 20, 64);
      const y = pr.y - clamp(pr.scale * 8, 6, 20);
      if (pr.x < -w || pr.x > this.view.w + w) continue;
      ctx.fillStyle = 'rgba(0,0,0,0.62)';
      ctx.fillRect(pr.x - w / 2, y, w, 3.4);
      ctx.fillStyle = e.def.color;
      ctx.fillRect(pr.x - w / 2, y, w * clamp(e.hp / e.maxHp, 0, 1), 3.4);
      if (e.alertFlash > 0) {
        ctx.globalAlpha = clamp(e.alertFlash * 2, 0, 1);
        ctx.fillStyle = e.def.color;
        ctx.font = '800 13px "Bahnschrift", "Arial Narrow", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', pr.x, y - 6);
        ctx.globalAlpha = 1;
      }
    }
  }

  aimTarget() {
    const g = this.game;
    const cx = this.view.w / 2;
    const cy = this.view.h / 2;
    let best = null;
    for (const e of g.enemies) {
      if (e.dead) continue;
      const pr = this.project(e.x, e.y, 23);
      if (!pr || !this.depthVisible(pr, -10)) continue;
      const d = Math.hypot(pr.x - cx, pr.y - cy);
      const radius = Math.max(15, e.r * pr.scale * 1.15);
      if (d > radius) continue;
      if (!best || pr.depth < best.depth) best = { enemy: e, depth: pr.depth };
    }
    return best;
  }

  drawCrosshair() {
    const g = this.game;
    const p = g.player;
    if (!p || p.dead) return;
    const ctx = this.ctx;
    const cx = this.view.w / 2;
    const cy = this.view.h / 2;
    const w = p.weapons[p.slot];
    const aim = this.aimAmount();
    // The scope paints its own reticle once the lens is up.
    if ((w.def.scope || 0) > 0 && aim > 0.55) return;
    const target = this.aimTarget();
    const moving = Math.hypot(p.vx, p.vy) > 45;
    const spread = w.def.spread + p.heat * 0.65 + (moving ? 1.6 : 0) + p.recoilKick * 0.4;
    const radius = lerp(clamp(7 + spread * 1.1, 6, 26), 3.5, aim);
    const color = target ? '248,113,113' : p.focusActive > 0 ? '196,181,253' : '226,240,250';
    ctx.save();
    ctx.strokeStyle = `rgba(${color},0.9)`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 2) * i;
      ctx.moveTo(cx + Math.cos(a) * (radius + 2), cy + Math.sin(a) * (radius + 2));
      ctx.lineTo(cx + Math.cos(a) * (radius + 8), cy + Math.sin(a) * (radius + 8));
    }
    ctx.stroke();
    ctx.fillStyle = `rgba(${color},0.95)`;
    ctx.beginPath();
    ctx.arc(cx, cy, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(${color},0.18)`;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 16, 0, Math.PI * 2);
    ctx.stroke();
    if (w.reloading) {
      const prog = 1 - w.reloadT / w.def.reload;
      ctx.strokeStyle = 'rgba(125,211,252,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 12, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
      ctx.stroke();
    }
    if (target) {
      // Bracket the target and show its vitals.
      const pr = this.project(target.enemy.x, target.enemy.y, 23);
      if (pr) {
        const r = clamp(target.enemy.r * pr.scale * 1.2, 14, 70);
        ctx.strokeStyle = 'rgba(248,113,113,0.5)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, r, 0.35, 1.2);
        ctx.arc(pr.x, pr.y, r, 1.95, 2.8);
        ctx.arc(pr.x, pr.y, r, 3.5, 4.35);
        ctx.arc(pr.x, pr.y, r, 5.05, 5.9);
        ctx.stroke();
        ctx.fillStyle = 'rgba(248,113,113,0.9)';
        ctx.font = '600 8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(target.enemy.def.name, pr.x, pr.y - r - 8);
      }
    }
    if (g.hitMarker > 0) {
      const k = 1 - g.hitMarker / 0.16;
      const size = 6 + k * 7;
      ctx.strokeStyle = g.hitMarkerHead ? 'rgba(251,191,36,0.95)' : 'rgba(248,250,252,0.9)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (Math.PI / 2) * i + Math.PI / 4;
        ctx.moveTo(cx + Math.cos(a) * (5 + size * 0.25), cy + Math.sin(a) * (5 + size * 0.25));
        ctx.lineTo(cx + Math.cos(a) * (5 + size), cy + Math.sin(a) * (5 + size));
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  drawObjectiveMarkers() {
    const g = this.game;
    if (!g.map || !g.player) return;
    const ctx = this.ctx;
    const p = g.player;
    if (!g.skirmish) {
      for (const item of g.map.intel) {
        if (item.taken) continue;
        const pr = this.project(item.x, item.y, 24);
        if (!pr || pr.depth > 950 || !this.depthVisible(pr, 14)) continue;
        if (pr.x < 20 || pr.x > this.view.w - 20) continue;
        const d = Math.round(dist(p.x, p.y, item.x, item.y) / 10);
        ctx.fillStyle = 'rgba(251,191,36,0.85)';
        ctx.beginPath();
        ctx.moveTo(pr.x, pr.y - 8);
        ctx.lineTo(pr.x + 5, pr.y);
        ctx.lineTo(pr.x, pr.y + 8);
        ctx.lineTo(pr.x - 5, pr.y);
        ctx.closePath();
        ctx.fill();
        ctx.font = '600 8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(253,230,138,0.8)';
        ctx.fillText(`INTEL ${d}m`, pr.x, pr.y - 14);
      }
    }
    if (!g.extractionActive) return;
    const ex = g.map.extraction;
    const pr = this.project(ex.x, ex.y, 26);
    const d = Math.round(dist(p.x, p.y, ex.x, ex.y) / 10);
    const vw = this.view.w;
    const vh = this.view.h;
    const onScreen = pr && pr.x > 30 && pr.x < vw - 30 && pr.y > 30 && pr.y < vh - 30 && this.depthVisible(pr, 24);
    ctx.save();
    if (onScreen) {
      ctx.fillStyle = 'rgba(52,211,153,0.9)';
      ctx.beginPath();
      ctx.moveTo(pr.x, pr.y - 10);
      ctx.lineTo(pr.x + 7, pr.y);
      ctx.lineTo(pr.x, pr.y + 10);
      ctx.lineTo(pr.x - 7, pr.y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(167,243,208,0.9)';
      ctx.font = '600 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`EXFIL ${d}m`, pr.x, pr.y - 17);
    } else {
      const rel = Math.atan2(Math.sin(Math.atan2(ex.y - p.y, ex.x - p.x) - p.angle), Math.cos(Math.atan2(ex.y - p.y, ex.x - p.x) - p.angle));
      const ax = vw / 2 + Math.sin(rel) * vw * 0.34;
      const ay = clamp(vh * 0.46 - Math.cos(rel) * vh * 0.2, 46, vh - 80);
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(Math.sign(rel) * 0.5 + rel * 0.15);
      ctx.fillStyle = 'rgba(52,211,153,0.9)';
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(8, 6);
      ctx.lineTo(0, 2);
      ctx.lineTo(-8, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = 'rgba(167,243,208,0.85)';
      ctx.font = '600 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`EXFIL ${d}m`, ax, ay + 24);
    }
    ctx.restore();
  }

  drawViewmodel() {
    const g = this.game;
    const p = g.player;
    if (!p || p.dead) return;
    const w = p.weapons[p.slot];
    const def = w.def;
    const cls = def.cls;
    const ctx = this.ctx;
    const vw = this.view.w;
    const vh = this.view.h;
    const moving = Math.hypot(p.vx, p.vy) > 35;
    const bobX = Math.sin(p.walk * 0.9) * (moving ? 5 : 1.4);
    const bobY = Math.abs(Math.cos(p.walk * 0.9)) * (moving ? 4.5 : 1.2);
    const recoil = p.recoilKick;
    const reloadK = w.reloading ? Math.sin(clamp(1 - w.reloadT / def.reload, 0, 1) * Math.PI) : 0;
    const swapK = p.swapT > 0 ? Math.sin((1 - p.swapT / 0.34) * Math.PI) : 0;
    const focus = p.focusActive > 0;
    const pistol = cls === 'PISTOL';
    const aim = this.aimAmount();
    const scoped = (def.scope || 0) > 0;
    // Do not shoulder the weapon mid-reload or mid-swap.
    const ads = aim * (1 - swapK) * (1 - reloadK * 0.7);
    const bobScale = 1 - ads * 0.82;
    const s = clamp(Math.min(vw, vh) / 560, 0.6, 1.45) * (pistol ? 0.85 : 1);
    const muzzleDist = pistol ? 184 : 268;
    const hipX = vw * 0.74;
    const hipY = vh * 0.87;
    const adsX = vw * 0.5;
    const adsY = vh * 0.5 + muzzleDist * s;
    const ox = lerp(hipX, adsX, ads) + bobX * bobScale + this.camera.sx * (0.5 - ads * 0.3);
    const oy = lerp(hipY, adsY, ads) + bobY * bobScale + recoil * 2.2 * (1 - ads * 0.45)
      + reloadK * vh * 0.2 + swapK * vh * 0.36 + this.camera.sy * (0.5 - ads * 0.3);
    ctx.save();
    ctx.globalAlpha = scoped ? 1 - ads * 0.92 : 1;
    ctx.translate(ox, oy);
    // Shouldering rolls the weapon upright so the bore points at the reticle.
    ctx.rotate(lerp(1.02, Math.PI / 2, ads) + recoil * 0.008 + reloadK * 0.26 - swapK * 0.18);
    ctx.scale(s, s);

    const metal = (a, b) => {
      const gr = ctx.createLinearGradient(0, a, 0, b);
      gr.addColorStop(0, '#4b5c69');
      gr.addColorStop(0.28, '#2c3943');
      gr.addColorStop(0.7, '#141c23');
      gr.addColorStop(1, '#080d12');
      return gr;
    };

    // ------------------------------------------------------------- rear forearm
    ctx.fillStyle = '#1b232b';
    ctx.beginPath();
    ctx.moveTo(38, 44);
    ctx.lineTo(146, 168);
    ctx.lineTo(210, 126);
    ctx.lineTo(78, 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#242e37';
    ctx.beginPath();
    ctx.moveTo(46, 44);
    ctx.lineTo(142, 154);
    ctx.lineTo(178, 132);
    ctx.lineTo(74, 28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ------------------------------------------------------------------- stock
    if (!pistol) {
      const stock = ctx.createLinearGradient(0, -30, 0, 34);
      stock.addColorStop(0, '#39454f');
      stock.addColorStop(0.45, '#1d262e');
      stock.addColorStop(1, '#0b1116');
      ctx.fillStyle = stock;
      ctx.beginPath();
      ctx.moveTo(38, -24);
      ctx.lineTo(148, -16);
      ctx.lineTo(152, 28);
      ctx.lineTo(38, 32);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(144, -18, 8, 48);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(44, -20, 100, 2);
    }

    // ---------------------------------------------------------------- magazine
    ctx.save();
    ctx.translate(-14, 24);
    ctx.rotate(pistol ? 0.16 : 0.1);
    ctx.fillStyle = '#101820';
    rr(ctx, -20, 0, pistol ? 30 : 40, pistol ? 54 : 76, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(-14, 8, 18, 2.5);
    ctx.restore();

    // -------------------------------------------------------------------- grip
    ctx.save();
    ctx.translate(pistol ? 8 : 18, 22);
    ctx.rotate(0.34);
    ctx.fillStyle = '#141c23';
    rr(ctx, -14, 0, 30, pistol ? 56 : 66, 7);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < 4; i++) ctx.fillRect(-10, 10 + i * 11, 22, 2);
    ctx.restore();

    // ---------------------------------------------------------------- receiver
    const recX0 = pistol ? -46 : -56;
    const recW = pistol ? 84 : 98;
    ctx.fillStyle = metal(-34, 34);
    rr(ctx, recX0, -34, recW, 68, 7);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.65)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // Ejection port.
    ctx.fillStyle = 'rgba(4,8,12,0.7)';
    rr(ctx, recX0 + recW * 0.5, -22, 26, 18, 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(198,222,240,0.28)';
    rr(ctx, recX0 + recW * 0.5 + 4, -19, 16, 5, 2);
    ctx.fill();
    // Top rail.
    ctx.fillStyle = '#0e151b';
    rr(ctx, recX0 + 4, -44, recW - 8, 10, 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    for (let i = 0; i < 8; i++) ctx.fillRect(recX0 + 10 + i * ((recW - 20) / 8), -42, 2, 6);
    // Highlight along the top edge.
    ctx.fillStyle = 'rgba(214,236,250,0.16)';
    ctx.fillRect(recX0 + 6, -30, recW - 12, 2);

    // --------------------------------------------------------------- handguard
    if (!pistol) {
      const hg = ctx.createLinearGradient(0, -30, 0, 26);
      hg.addColorStop(0, '#41525f');
      hg.addColorStop(0.4, '#25303a');
      hg.addColorStop(1, '#0a1015');
      ctx.fillStyle = hg;
      rr(ctx, -186, -30, 136, 56, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.42)';
      for (let i = 0; i < 4; i++) rr(ctx, -176 + i * 30, -20, 18, 36, 4), ctx.fill();
      ctx.fillStyle = 'rgba(214,236,250,0.12)';
      ctx.fillRect(-180, -27, 126, 2);
    }

    // ------------------------------------------------------------------ barrel
    const barrelStart = pistol ? -100 : -166;
    const muzzleX = pistol ? -184 : -268;
    const bore = pistol ? 15 : 26;
    ctx.fillStyle = '#0c1319';
    ctx.fillRect(muzzleX, -bore / 2, barrelStart - muzzleX + 4, bore);
    ctx.fillStyle = 'rgba(190,214,229,0.16)';
    ctx.fillRect(muzzleX, -bore / 2 + 2, barrelStart - muzzleX, 3);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(muzzleX, bore / 2 - 4, barrelStart - muzzleX, 3);
    // Muzzle brake.
    ctx.fillStyle = '#1a242d';
    rr(ctx, muzzleX - 14, -bore / 2 - 6, 26, bore + 12, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.65)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(muzzleX - 12, -bore / 2 + 1, 22, 2.5);
    ctx.fillRect(muzzleX - 12, bore / 2 - 4, 22, 2.5);
    ctx.fillStyle = '#05090d';
    ctx.beginPath();
    ctx.arc(muzzleX - 11, 0, bore / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    if (!pistol) {
      // Gas block and front sight tower at the muzzle end.
      ctx.fillStyle = '#202a33';
      rr(ctx, -238, -30, 22, 34, 3);
      ctx.fill();
      ctx.fillStyle = '#0a0f14';
      ctx.fillRect(-234, -42, 6, 16);
      ctx.fillStyle = 'rgba(214,236,250,0.16)';
      ctx.fillRect(-236, -28, 4, 28);
      // Sling loop.
      ctx.strokeStyle = 'rgba(140,163,180,0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-120, 30, 7, 0, Math.PI * 1.6);
      ctx.stroke();
    }

    // ------------------------------------------------------------------- optic
    if (!pistol) {
      ctx.fillStyle = '#0b1218';
      rr(ctx, -30, -70, 58, 28, 5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.65)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.fillStyle = '#21303c';
      rr(ctx, -26, -66, 12, 20, 2);
      ctx.fill();
      const lens = ctx.createRadialGradient(-22, -56, 1, -22, -56, 9);
      lens.addColorStop(0, focus ? 'rgba(233,213,255,0.98)' : 'rgba(190,235,255,0.92)');
      lens.addColorStop(0.6, focus ? 'rgba(124,58,237,0.45)' : 'rgba(14,116,144,0.4)');
      lens.addColorStop(1, 'rgba(3,8,12,0.95)');
      ctx.fillStyle = lens;
      ctx.beginPath();
      ctx.arc(-21, -56, 10, 0, Math.PI * 2);
      ctx.fill();
      // Mount posts.
      ctx.fillStyle = '#0e151b';
      ctx.fillRect(-8, -52, 8, 10);
      ctx.fillRect(16, -52, 8, 10);
    } else {
      ctx.fillStyle = '#1c262f';
      ctx.fillRect(-100, -44, 5, 12);
      ctx.fillRect(-58, -44, 5, 12);
      ctx.fillStyle = 'rgba(125,211,252,0.9)';
      ctx.beginPath();
      ctx.arc(-54, -48, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // ------------------------------------------------------------ gloved hands
    const glove = (x, y, w2, h2, rot) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = '#333b31';
      rr(ctx, -w2 / 2, -h2 / 2, w2, h2, 11);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.45)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.fillStyle = '#242b23';
      for (let i = 0; i < 3; i++) {
        rr(ctx, -w2 / 2 + 4 + i * (w2 - 10) / 3, -h2 / 2 + 4, (w2 - 12) / 3, h2 - 8, 4);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      rr(ctx, -w2 / 2 + 3, -h2 / 2 + 3, w2 - 6, 3, 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(-w2 / 2 + 3, h2 / 2 - 10, w2 - 6, 4);
      ctx.fillStyle = 'rgba(190,214,229,0.12)';
      ctx.fillRect(-w2 / 2 + 4, -h2 / 2 + 5, 2, h2 - 12);
      ctx.restore();
    };
    if (!pistol) glove(-118, 26, 46, 50, 0.1);
    glove(pistol ? 0 : 12, 62, 44, 52, 0.42);

    // --------------------------------------------------------- muzzle flash
    if (p.muzzleT > 0) {
      const mx = muzzleX - 22;
      const my = 0;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const flash = ctx.createRadialGradient(mx, my, 0, mx, my, 60);
      flash.addColorStop(0, 'rgba(255,250,225,0.95)');
      flash.addColorStop(0.22, 'rgba(255,196,90,0.72)');
      flash.addColorStop(1, 'rgba(255,120,30,0)');
      ctx.fillStyle = flash;
      ctx.beginPath();
      ctx.arc(mx, my, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,244,210,0.92)';
      ctx.beginPath();
      ctx.moveTo(mx - 14, my);
      ctx.lineTo(mx + 12, my - 26);
      ctx.lineTo(mx + 6, my);
      ctx.lineTo(mx + 12, my + 26);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Muzzle light thrown into the scene.
    if (p.muzzleT > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const glow = ctx.createRadialGradient(vw * 0.56, vh * 0.55, 0, vw * 0.56, vh * 0.55, vh * 0.75);
      glow.addColorStop(0, 'rgba(255,190,110,0.09)');
      glow.addColorStop(1, 'rgba(255,150,60,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, vw, vh);
      ctx.restore();
    }
  }

  // Scope overlay: blacked-out surround, lens vignette, illuminated reticle.
  drawScope() {
    const g = this.game;
    const p = g.player;
    if (!p || p.dead) return;
    const def = p.weapons[p.slot]?.def;
    if (!def?.scope) return;
    const k = this.aimAmount();
    if (k < 0.015) return;
    const ctx = this.ctx;
    const vw = this.view.w;
    const vh = this.view.h;
    const ease = k * k * (3 - 2 * k);
    const radius = Math.min(vw, vh) * lerp(0.8, 0.44, ease);
    const alpha = clamp(ease * 1.5, 0, 1);
    const cx = vw / 2 + Math.sin(g.time * 1.15) * 1.5 * ease;
    const cy = vh / 2 + Math.cos(g.time * 0.9) * 1.1 * ease;
    ctx.save();
    ctx.globalAlpha = alpha;

    // Opaque surround with a circular aperture.
    ctx.beginPath();
    ctx.rect(0, 0, vw, vh);
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#010203';
    ctx.fill('evenodd');

    // Lens tint, edge falloff and glare.
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    const lens = ctx.createRadialGradient(cx, cy, radius * 0.08, cx, cy, radius);
    lens.addColorStop(0, 'rgba(150,205,195,0.015)');
    lens.addColorStop(0.6, 'rgba(20,54,58,0.07)');
    lens.addColorStop(0.86, 'rgba(3,12,16,0.5)');
    lens.addColorStop(1, 'rgba(0,0,0,0.92)');
    ctx.fillStyle = lens;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    const glare = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    glare.addColorStop(0, 'rgba(180,230,255,0.09)');
    glare.addColorStop(0.32, 'rgba(180,230,255,0.02)');
    glare.addColorStop(0.6, 'rgba(180,230,255,0)');
    ctx.fillStyle = glare;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    // Reticle: duplex posts, fine crosshair, mil dots, illuminated center.
    const reticle = 'rgba(198,232,224,0.82)';
    const post = Math.max(12, radius * 0.3);
    const gap = Math.max(5, radius * 0.035);
    ctx.strokeStyle = reticle;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.94, cy);
    ctx.lineTo(cx - gap, cy);
    ctx.moveTo(cx + gap, cy);
    ctx.lineTo(cx + radius * 0.94, cy);
    ctx.moveTo(cx, cy - radius * 0.94);
    ctx.lineTo(cx, cy - gap);
    ctx.moveTo(cx, cy + gap);
    ctx.lineTo(cx, cy + radius * 0.94);
    ctx.stroke();
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.94, cy);
    ctx.lineTo(cx - radius + post, cy);
    ctx.moveTo(cx + radius - post, cy);
    ctx.lineTo(cx + radius * 0.94, cy);
    ctx.moveTo(cx, cy - radius * 0.94);
    ctx.lineTo(cx, cy - radius + post);
    ctx.moveTo(cx, cy + radius - post);
    ctx.lineTo(cx, cy + radius * 0.94);
    ctx.stroke();
    ctx.fillStyle = reticle;
    for (let i = 1; i <= 5; i++) {
      const d = i * radius * 0.09;
      const r = Math.max(1, 1.9 - i * 0.22);
      ctx.beginPath();
      ctx.arc(cx, cy + d, r, 0, Math.PI * 2);
      ctx.arc(cx + d, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,120,90,0.95)';
    ctx.beginPath();
    ctx.arc(cx, cy, 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Machined outer ring and inner shadow.
    ctx.lineWidth = Math.max(3, radius * 0.018);
    ctx.strokeStyle = 'rgba(6,10,12,0.9)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius + ctx.lineWidth * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(148,180,190,0.18)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2);
    ctx.stroke();

    // Magnification readout.
    ctx.fillStyle = 'rgba(170,205,200,0.62)';
    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${def.name}  ·  ${def.scope.toFixed(1)}×`, cx, cy + radius * 0.82);
    ctx.restore();
  }

  drawMinimap() {
    const g = this.game;
    if (!this.miniCtx || !g.map || !g.player) return;
    const c = this.mini;
    const ctx = this.miniCtx;
    ctx.clearRect(0, 0, c.width, c.height);
    g.map.drawMinimap(ctx, c.width, c.height, g.player, g.enemies, g.map.extraction, g.map.intel, g.extractionActive);
  }
}
