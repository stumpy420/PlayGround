// Canvas renderer: atmospheric tactical view, actors, effects, radar and lighting.

import { TILE, WORLD_W, WORLD_H } from './maps.js';
import { clamp, damp, dist, lerp } from './util.js';

export class Renderer {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.ctx = game.ctx;
    this.view = { w: window.innerWidth, h: window.innerHeight };
    this.dpr = 1;
    this.baseZoom = 1;
    this.camera = { x: WORLD_W / 2, y: WORLD_H / 2, zoom: 1, shake: 0, sx: 0, sy: 0 };
    this.light = document.createElement('canvas');
    this.lctx = this.light.getContext('2d');
    this.card = document.getElementById('card-radar');
    this.cardCtx = this.card?.getContext('2d');
    this.mini = document.getElementById('minimap');
    this.miniCtx = this.mini?.getContext('2d');
    this.gridPattern = null;
    this.resize();
  }

  resize() {
    this.view.w = window.innerWidth;
    this.view.h = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.view.w * this.dpr);
    this.canvas.height = Math.round(this.view.h * this.dpr);
    this.canvas.style.width = `${this.view.w}px`;
    this.canvas.style.height = `${this.view.h}px`;
    this.light.width = Math.max(1, Math.ceil(this.view.w / 2));
    this.light.height = Math.max(1, Math.ceil(this.view.h / 2));
    const portrait = this.view.h > this.view.w;
    if (this.game?.isTouch) {
      // Phones need a tighter camera; the desktop framing is unreadable at 6".
      this.baseZoom = portrait
        ? clamp(Math.min(this.view.w / 460, this.view.h / 820), 0.9, 1.25)
        : clamp(Math.min(this.view.w / 900, this.view.h / 520), 0.98, 1.35);
    } else {
      this.baseZoom = portrait
        ? clamp(this.view.w / 700, 0.5, 1.05)
        : clamp(Math.min(this.view.w / 1120, this.view.h / 640), 0.56, 1.4);
    }
    this.camera.zoom = this.baseZoom;
    if (this.game?.state === 'menu' || !this.game?.player) {
      this.camera.x = WORLD_W / 2;
      this.camera.y = WORLD_H / 2;
    }
  }

  resetCamera() {
    const g = this.game;
    if (!g.player) return;
    this.camera.x = g.player.x;
    this.camera.y = g.player.y;
    this.camera.zoom = this.baseZoom;
    this.camera.shake = 0;
    this.camera.sx = 0;
    this.camera.sy = 0;
  }

  shake(amount) {
    if (!this.game.save.settings.shake) return;
    this.camera.shake = Math.min(22, this.camera.shake + amount);
  }

  updateCamera(dt) {
    const g = this.game;
    const cam = this.camera;
    if (g.state === 'menu' || !g.player) return;
    const p = g.player;
    const look = 58;
    let tx = p.x + Math.cos(p.angle) * look;
    let ty = p.y + Math.sin(p.angle) * look;
    cam.x = damp(cam.x, tx, 6.5, dt);
    cam.y = damp(cam.y, ty, 6.5, dt);
    const targetZoom = this.baseZoom * (p.focusActive > 0 ? 1.045 : 1);
    cam.zoom = damp(cam.zoom, targetZoom, 4, dt);
    cam.shake = damp(cam.shake, 0, 8, dt);
    cam.sx = randShake(cam.shake);
    cam.sy = randShake(cam.shake);
    const halfW = this.view.w / (2 * cam.zoom);
    const halfH = this.view.h / (2 * cam.zoom);
    cam.x = WORLD_W <= halfW * 2 ? WORLD_W / 2 : clamp(cam.x, halfW, WORLD_W - halfW);
    cam.y = WORLD_H <= halfH * 2 ? WORLD_H / 2 : clamp(cam.y, halfH, WORLD_H - halfH);
  }

  screenToWorld(sx, sy) {
    const cam = this.camera;
    return {
      x: (sx - this.view.w / 2) / cam.zoom + cam.x,
      y: (sy - this.view.h / 2) / cam.zoom + cam.y,
    };
  }

  worldToScreen(wx, wy) {
    const cam = this.camera;
    return {
      x: (wx - cam.x) * cam.zoom + this.view.w / 2 + cam.sx,
      y: (wy - cam.y) * cam.zoom + this.view.h / 2 + cam.sy,
    };
  }

  aimWorld() {
    const g = this.game;
    const p = g.player;
    if (!p) return { x: 0, y: 0 };
    const aimStick = g.input.sticks.aim;
    const pad = g.input.pad;
    if (aimStick && aimStick.active && aimStick.mag > 0.14) {
      return { x: p.x + Math.cos(Math.atan2(aimStick.dy, aimStick.dx)) * 250, y: p.y + Math.sin(Math.atan2(aimStick.dy, aimStick.dx)) * 250 };
    }
    if (Math.hypot(pad.aimX, pad.aimY) > 0.32) {
      const a = Math.atan2(pad.aimY, pad.aimX);
      return { x: p.x + Math.cos(a) * 250, y: p.y + Math.sin(a) * 250 };
    }
    if (g.input.mouse.type === 'mouse' && !g.isTouch) {
      return this.screenToWorld(g.input.mouse.x, g.input.mouse.y);
    }
    return { x: p.x + Math.cos(p.angle) * 250, y: p.y + Math.sin(p.angle) * 250 };
  }

  inView(x, y, margin = 140) {
    const cam = this.camera;
    const hw = this.view.w / (2 * cam.zoom) + margin;
    const hh = this.view.h / (2 * cam.zoom) + margin;
    return Math.abs(x - cam.x) < hw && Math.abs(y - cam.y) < hh;
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
    // Ambient contacts and sweep add life without simulating a full match.
    const sweep = t * 0.55;
    for (const blip of g.menuMap.enemySpawns) {
      const d = dist(cam.x, cam.y, blip.x, blip.y);
      const a = Math.atan2(blip.y - cam.y, blip.x - cam.x);
      const diff = Math.abs(Math.atan2(Math.sin(a - sweep), Math.cos(a - sweep)));
      const alpha = Math.max(0, 1 - diff / 1.4) * 0.55;
      if (alpha > 0.02) {
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
    // Screen-space atmosphere.
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
    // Drifting embers / dust.
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
    // Grid + crosshair.
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
      const ox = (w - dw) / 2;
      const oy = (h - dh) / 2;
      return { x: ox + wx * scale, y: oy + wy * scale };
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

  // ------------------------------------------------------------------- game
  renderGame() {
    const g = this.game;
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = '#04060a';
    ctx.fillRect(0, 0, this.view.w, this.view.h);
    if (!g.map || !g.player) return;
    const cam = this.camera;
    ctx.save();
    ctx.translate(this.view.w / 2 + cam.sx, this.view.h / 2 + cam.sy);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);
    this.drawLayer(g.map.canvas, cam);
    this.drawLayer(g.decals, cam);
    this.drawExtraction();
    this.drawIntel();
    this.drawPickups();
    this.drawVisionCones();
    this.drawGrenades();
    for (const e of g.enemies) if (!e.dead && this.inView(e.x, e.y)) this.drawEnemy(e);
    if (!g.player.dead) this.drawPlayer();
    this.drawBullets();
    this.drawParticles();
    this.drawTexts();
    this.drawAimLine();
    ctx.restore();
    this.drawLighting();
    if (g.player.focusActive > 0) {
      ctx.fillStyle = 'rgba(125,211,252,0.035)';
      ctx.fillRect(0, 0, this.view.w, this.view.h);
    }
    this.drawObjectiveMarkers();
    this.drawCrosshair();
    this.drawMinimap();
  }

  drawExtraction() {
    const g = this.game;
    const ex = g.map.extraction;
    const ctx = this.ctx;
    const t = g.time;
    const active = g.extractionActive;
    const pulse = 0.5 + Math.sin(t * 2.4) * 0.5;
    ctx.save();
    ctx.translate(ex.x, ex.y);
    if (active) {
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 90);
      grad.addColorStop(0, `rgba(52,211,153,${0.1 + pulse * 0.07})`);
      grad.addColorStop(1, 'rgba(52,211,153,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 90, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = active ? `rgba(52,211,153,${0.55 + pulse * 0.3})` : 'rgba(100,116,139,0.18)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.lineDashOffset = active ? -t * 26 : 0;
    ctx.beginPath();
    ctx.arc(0, 0, 58, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = active ? 'rgba(52,211,153,0.8)' : 'rgba(100,116,139,0.3)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 2) * i + (active ? t * 0.8 : 0);
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 47, Math.sin(a) * 47);
      ctx.lineTo(Math.cos(a) * 66, Math.sin(a) * 66);
      ctx.stroke();
    }
    ctx.fillStyle = active ? `rgba(52,211,153,${0.55 + pulse * 0.35})` : 'rgba(100,116,139,0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, active ? 4 + pulse * 2 : 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '700 9px "Bahnschrift", "Arial Narrow", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    ctx.fillStyle = active ? 'rgba(167,243,208,0.9)' : 'rgba(148,163,184,0.3)';
    ctx.fillText(active ? 'EXFIL' : 'EXFIL LOCKED', 0, -72);
    ctx.restore();
  }

  drawIntel() {
    const g = this.game;
    const ctx = this.ctx;
    for (const item of g.map.intel) {
      if (item.taken || !this.inView(item.x, item.y, 80)) continue;
      const t = g.time + item.pulse;
      const bob = Math.sin(t * 2.2) * 2;
      const pulse = 0.5 + Math.sin(t * 3) * 0.5;
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 7, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      const grad = ctx.createRadialGradient(0, bob, 0, 0, bob, 34);
      grad.addColorStop(0, `rgba(251,191,36,${0.18 + pulse * 0.12})`);
      grad.addColorStop(1, 'rgba(251,191,36,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, bob, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.translate(0, bob);
      ctx.rotate(-0.18);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(-8, -6, 16, 11);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-7, -5, 14, 7);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillRect(-6, -4, 5, 1.2);
      ctx.fillRect(-6, -2, 8, 1.2);
      ctx.strokeStyle = 'rgba(251,191,36,0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-8.5, -6.5, 17, 12);
      ctx.fillStyle = 'rgba(251,191,36,0.8)';
      ctx.font = '600 6px "Bahnschrift", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('INTEL', 0, -13);
      ctx.restore();
    }
  }

  drawPickups() {
    const g = this.game;
    const ctx = this.ctx;
    for (const item of g.pickups) {
      if (!this.inView(item.x, item.y, 40)) continue;
      const bob = Math.sin(item.bob) * 2;
      const fade = item.life < 5 ? 0.4 + Math.sin(item.life * 12) * 0.25 : 1;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(item.x, item.y);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 7, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.translate(0, bob);
      if (item.type === 'ammo') {
        ctx.fillStyle = '#0f1a24';
        ctx.fillRect(-7, -6, 14, 11);
        ctx.strokeStyle = 'rgba(125,211,252,0.55)';
        ctx.strokeRect(-7, -6, 14, 11);
        ctx.fillStyle = '#e0a94a';
        for (let i = 0; i < 3; i++) ctx.fillRect(-4 + i * 4, -3, 2, 6);
      } else if (item.type === 'med') {
        ctx.fillStyle = '#0f1a24';
        ctx.fillRect(-7, -6, 14, 11);
        ctx.strokeStyle = 'rgba(74,222,128,0.55)';
        ctx.strokeRect(-7, -6, 14, 11);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(-1.5, -4, 3, 8);
        ctx.fillRect(-4, -1.5, 8, 3);
      } else {
        ctx.fillStyle = '#0f1a24';
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(7, -4);
        ctx.lineTo(6, 3);
        ctx.lineTo(0, 7);
        ctx.lineTo(-6, 3);
        ctx.lineTo(-7, -4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(56,189,248,0.6)';
        ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-1, -3, 2, 6);
        ctx.fillRect(-3, -1, 6, 2);
      }
      ctx.restore();
    }
  }

  drawVisionCones() {
    const g = this.game;
    const ctx = this.ctx;
    ctx.save();
    for (const e of g.enemies) {
      if (e.dead || e.alert < 0.45 || e.state === 'patrol') continue;
      if (!this.inView(e.x, e.y, e.def.vision)) continue;
      const range = Math.min(e.def.vision, 820);
      const steps = 15;
      const points = [];
      for (let i = 0; i <= steps; i++) {
        const a = e.angle - e.def.cone + (e.def.cone * 2 * i) / steps;
        const ex = e.x + Math.cos(a) * range;
        const ey = e.y + Math.sin(a) * range;
        const hit = g.map.raycast(e.x, e.y, ex, ey, range);
        points.push(hit ? { x: hit.x, y: hit.y } : { x: ex, y: ey });
      }
      const grad = ctx.createRadialGradient(e.x, e.y, 10, e.x, e.y, range);
      const alpha = e.canSee ? 0.09 : 0.045;
      grad.addColorStop(0, hexA(e.def.color, alpha));
      grad.addColorStop(0.7, hexA(e.def.color, alpha * 0.4));
      grad.addColorStop(1, hexA(e.def.color, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      for (const p of points) ctx.lineTo(p.x, p.y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawGrenades() {
    const g = this.game;
    const ctx = this.ctx;
    for (const gr of g.grenades) {
      const progress = 1 - gr.timer / gr.max;
      const z = Math.sin(clamp(progress, 0, 1) * Math.PI) * 13;
      ctx.save();
      ctx.translate(gr.x, gr.y);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 7, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.translate(0, -z);
      ctx.rotate(gr.rot);
      ctx.fillStyle = '#27331f';
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4b5a38';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#64734c';
      ctx.fillRect(-2, -7, 4, 3);
      const blink = Math.sin(g.time * (gr.timer < 0.4 ? 40 : 14)) > 0;
      ctx.fillStyle = blink ? '#f87171' : '#5b1d1d';
      ctx.beginPath();
      ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawPlayer() {
    const g = this.game;
    const p = g.player;
    const ctx = this.ctx;
    const w = p.weapons[p.slot];
    ctx.save();
    ctx.translate(p.x, p.y);
    // Shadow.
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(2, 7, 16, 8, p.angle, 0, Math.PI * 2);
    ctx.fill();
    // Selection ring / focus aura.
    if (p.focusActive > 0) {
      ctx.strokeStyle = `rgba(167,139,250,${0.3 + Math.sin(g.time * 12) * 0.15})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.rotate(p.angle);
    const step = Math.sin(p.walk) * 3;
    // Legs.
    ctx.fillStyle = '#1f2a33';
    ctx.beginPath();
    ctx.ellipse(-5, -5 + step * 0.4, 7, 3.6, 0.25, 0, Math.PI * 2);
    ctx.ellipse(-5, 5 - step * 0.4, 7, 3.6, -0.25, 0, Math.PI * 2);
    ctx.fill();
    // Backpack.
    ctx.fillStyle = '#223039';
    ctx.fillRect(-14, -6, 7, 12);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-13, -2, 2, 4);
    // Torso.
    const grad = ctx.createLinearGradient(-10, 0, 12, 0);
    grad.addColorStop(0, '#33424f');
    grad.addColorStop(1, '#516271');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12.5, 10.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(8,12,16,0.8)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // Shoulder plates.
    ctx.fillStyle = '#5d7181';
    ctx.beginPath();
    ctx.ellipse(-1, -8, 5, 3.5, 0.2, 0, Math.PI * 2);
    ctx.ellipse(-1, 8, 5, 3.5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(56,189,248,0.5)';
    ctx.fillRect(-4, -10, 3, 1.2);
    ctx.fillRect(-4, 9, 3, 1.2);
    // Helmet.
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(3, 0, 6.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(4, 0, 5, -0.8, 0.8);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(7, -2.5, 2, 5);
    // Weapon.
    const len = w.def.cls === 'MARKSMAN' ? 29 : w.def.cls === 'SHOTGUN' ? 23 : w.def.cls === 'PISTOL' ? 14 : w.def.cls === 'LMG' ? 27 : 23;
    ctx.save();
    ctx.translate(-p.recoilKick * 0.5, 0);
    ctx.fillStyle = '#0e151b';
    ctx.fillRect(5, 4.2, len, 3.4);
    ctx.fillStyle = '#42525f';
    ctx.fillRect(9, 3.2, Math.max(6, len - 12), 2.2);
    ctx.fillStyle = '#0e151b';
    ctx.fillRect(10, 6.8, 4, 4.8);
    if (w.def.cls === 'SHOTGUN') {
      ctx.fillStyle = '#6b5236';
      ctx.fillRect(16, 3, 8, 4);
    }
    if (w.def.cls === 'MARKSMAN') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(14, 1.4, 8, 2.2);
      ctx.fillStyle = '#a78bfa';
      ctx.fillRect(17, 1.8, 3, 1.4);
    }
    ctx.restore();
    if (p.muzzleT > 0) {
      ctx.save();
      ctx.translate(5 + len, 5.9);
      ctx.rotate(randShake(0.4));
      const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, 17);
      fg.addColorStop(0, 'rgba(255,248,220,0.95)');
      fg.addColorStop(0.35, 'rgba(255,196,90,0.7)');
      fg.addColorStop(1, 'rgba(255,140,40,0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(0, 0, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,240,200,0.9)';
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(12, 0);
      ctx.lineTo(0, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    // Direction chevron.
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.strokeStyle = 'rgba(125,211,252,0.35)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, 20, -0.35, 0.35);
    ctx.stroke();
    ctx.restore();
  }

  drawEnemy(e) {
    const g = this.game;
    const ctx = this.ctx;
    const def = e.def;
    if (e.type === 'marksman' && e.aimT > 0 && e.canSee) {
      const alpha = 0.18 + (1 - e.aimT / Math.max(0.01, def.aim)) * 0.55;
      ctx.save();
      ctx.strokeStyle = `rgba(248,113,113,${alpha})`;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(e.x + Math.cos(e.angle) * 18, e.y + Math.sin(e.angle) * 18);
      ctx.lineTo(g.player.x, g.player.y);
      ctx.stroke();
      ctx.fillStyle = `rgba(248,113,113,${alpha})`;
      ctx.beginPath();
      ctx.arc(g.player.x, g.player.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(2, 7, e.type === 'heavy' ? 19 : 14, e.type === 'heavy' ? 9 : 7, e.angle, 0, Math.PI * 2);
    ctx.fill();
    if (e.spawnFx > 0) {
      ctx.strokeStyle = hexA(def.color, e.spawnFx / 0.7);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 30 - e.spawnFx * 20, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.rotate(e.angle);
    const r = e.r;
    const step = Math.sin(e.walk) * 3;
    // Contact ring keeps hostiles legible against dark floors.
    ctx.strokeStyle = hexA(def.color, e.canSee ? 0.42 : 0.16);
    ctx.lineWidth = e.canSee ? 2 : 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, r + 3.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#171d23';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.42 + step * 0.35, r * 0.5, r * 0.28, 0.25, 0, Math.PI * 2);
    ctx.ellipse(-r * 0.35, r * 0.42 - step * 0.35, r * 0.5, r * 0.28, -0.25, 0, Math.PI * 2);
    ctx.fill();
    // Torso armor.
    const grad = ctx.createLinearGradient(-r, 0, r, 0);
    grad.addColorStop(0, '#2c3742');
    grad.addColorStop(1, e.hitFlash > 0 ? '#f8fafc' : '#55646f');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hexA(def.color, 0.5);
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(5,8,11,0.75)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = def.color;
    ctx.globalAlpha = 0.75;
    ctx.fillRect(-r * 0.5, -r * 0.55, r * 0.26, r * 1.1);
    ctx.globalAlpha = 1;
    if (e.type === 'heavy') {
      ctx.fillStyle = '#1b2229';
      ctx.beginPath();
      ctx.ellipse(2, -r * 0.72, r * 0.62, r * 0.24, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = hexA(def.color, 0.6);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    // Helmet.
    ctx.fillStyle = e.hitFlash > 0 ? '#f1f5f9' : '#1c242c';
    ctx.beginPath();
    ctx.arc(r * 0.28, 0, r * 0.48, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hexA(def.color, 0.8);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.arc(r * 0.52, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Weapon.
    ctx.fillStyle = '#0c1116';
    const gunLen = e.type === 'marksman' ? 28 : e.type === 'heavy' ? 25 : 20;
    ctx.fillRect(r * 0.4, 4, gunLen, 2.8);
    if (e.type === 'heavy') ctx.fillRect(r * 0.55, 2.4, 10, 5);
    if (e.muzzleT > 0) {
      const fg = ctx.createRadialGradient(r * 0.4 + gunLen, 5.4, 0, r * 0.4 + gunLen, 5.4, 13);
      fg.addColorStop(0, 'rgba(255,240,200,0.95)');
      fg.addColorStop(0.4, hexA(def.color, 0.7));
      fg.addColorStop(1, hexA(def.color, 0));
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(r * 0.4 + gunLen, 5.4, 13, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // Status widgets.
    ctx.save();
    ctx.translate(e.x, e.y);
    if (e.hp < e.maxHp - 0.5) {
      const w = e.type === 'heavy' ? 38 : 28;
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(-w / 2, -e.r - 16, w, 3.5);
      ctx.fillStyle = def.color;
      ctx.fillRect(-w / 2, -e.r - 16, w * clamp(e.hp / e.maxHp, 0, 1), 3.5);
    }
    if (e.alertFlash > 0) {
      ctx.globalAlpha = clamp(e.alertFlash * 2, 0, 1);
      ctx.fillStyle = def.color;
      ctx.font = '800 12px "Bahnschrift", "Arial Narrow", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', 0, -e.r - 20);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  drawBullets() {
    const ctx = this.ctx;
    for (const b of this.game.bullets) {
      if (!this.inView(b.x, b.y, 40)) continue;
      const len = clamp(b.speed * 0.016, 8, 32);
      const dx = b.vx / b.speed;
      const dy = b.vy / b.speed;
      ctx.strokeStyle = hexA(b.color, 0.2);
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(b.x - dx * len, b.y - dy * len);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.strokeStyle = b.owner === 'player' ? 'rgba(255,250,235,0.95)' : hexA(b.color, 0.95);
      ctx.lineWidth = b.owner === 'player' ? 1.3 : 1.1;
      ctx.beginPath();
      ctx.moveTo(b.x - dx * len * 0.55, b.y - dy * len * 0.55);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.fillStyle = hexA(b.color, 0.9);
      ctx.beginPath();
      ctx.arc(b.x, b.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawParticles() {
    const ctx = this.ctx;
    const g = this.game;
    for (const p of g.particles) {
      if (!this.inView(p.x, p.y, 90)) continue;
      const life = clamp(p.life / p.max, 0, 1);
      if (p.type === 'spark') {
        ctx.strokeStyle = hexA(p.color, life * 0.9);
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.022, p.y - p.vy * 0.022);
        ctx.stroke();
      } else if (p.type === 'blood') {
        ctx.fillStyle = hexA(p.color, life * 0.8);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.5 + life * 0.5), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'smoke') {
        ctx.fillStyle = hexA(p.color, (p.alpha ?? 0.2) * life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'flash') {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const fg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        fg.addColorStop(0, hexA(p.color, 0.8 * life));
        fg.addColorStop(0.4, hexA(p.color, 0.28 * life));
        fg.addColorStop(1, hexA(p.color, 0));
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'ring') {
        ctx.strokeStyle = hexA(p.color, life * 0.7);
        ctx.lineWidth = 2.5 * life + 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - life) + 6, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'casing' || p.type === 'debris') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot || 0);
        ctx.fillStyle = hexA(p.color, life);
        ctx.fillRect(-p.size, -p.size * 0.35, p.size * 2, p.size * 0.7);
        ctx.restore();
      }
    }
  }

  drawTexts() {
    const ctx = this.ctx;
    for (const t of this.game.texts) {
      const life = clamp(t.life / t.max, 0, 1);
      ctx.globalAlpha = life;
      ctx.font = `700 ${t.size}px "Bahnschrift", "Arial Narrow", sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
      ctx.globalAlpha = 1;
    }
  }

  drawAimLine() {
    const g = this.game;
    const p = g.player;
    if (!p || p.dead) return;
    const aim = this.aimWorld();
    const dx = aim.x - p.x;
    const dy = aim.y - p.y;
    const d = Math.hypot(dx, dy) || 1;
    const hit = g.map.raycast(p.x, p.y, p.x + (dx / d) * Math.min(d, 420), p.y + (dy / d) * Math.min(d, 420), 420);
    const endX = hit ? hit.x : p.x + (dx / d) * Math.min(d, 420);
    const endY = hit ? hit.y : p.y + (dy / d) * Math.min(d, 420);
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = p.focusActive > 0 ? 'rgba(167,139,250,0.3)' : 'rgba(125,211,252,0.18)';
    ctx.lineWidth = 0.9;
    ctx.setLineDash([2, 7]);
    ctx.beginPath();
    ctx.moveTo(p.x + Math.cos(p.angle) * 20, p.y + Math.sin(p.angle) * 20);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(125,211,252,0.1)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 18.5, -0.3, 0.3);
    ctx.stroke();
    ctx.restore();
  }

  drawLighting() {
    const g = this.game;
    const cam = this.camera;
    const lctx = this.lctx;
    const lw = this.light.width;
    const lh = this.light.height;
    lctx.setTransform(1, 0, 0, 1, 0, 0);
    lctx.clearRect(0, 0, lw, lh);
    lctx.fillStyle = `rgba(2,5,9,${clamp(0.34 + (g.map.palette.ambient || 0.6) * 0.16, 0.34, 0.52)})`;
    lctx.fillRect(0, 0, lw, lh);
    lctx.globalCompositeOperation = 'destination-out';
    const hole = (sx, sy, radius) => {
      if (sx < -radius || sy < -radius || sx > this.view.w + radius || sy > this.view.h + radius) return;
      const x = sx / 2;
      const y = sy / 2;
      const r = radius / 2;
      const grad = lctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(0.46, 'rgba(0,0,0,0.86)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.fillStyle = grad;
      lctx.beginPath();
      lctx.arc(x, y, r, 0, Math.PI * 2);
      lctx.fill();
    };
    const p = g.player;
    if (p) {
      const ps = this.worldToScreen(p.x, p.y);
      hole(ps.x, ps.y, Math.max(280, 480 * cam.zoom));
      if (p.muzzleT > 0) {
        const m = this.worldToScreen(p.x + Math.cos(p.angle) * 26, p.y + Math.sin(p.angle) * 26);
        hole(m.x, m.y, 100 + 170 * cam.zoom);
      }
    }
    for (const part of g.particles) {
      if (part.type !== 'flash') continue;
      const s = this.worldToScreen(part.x, part.y);
      hole(s.x, s.y, part.size * cam.zoom * 1.1);
    }
    for (const e of g.enemies) {
      if (e.dead || e.muzzleT <= 0) continue;
      const s = this.worldToScreen(e.x + Math.cos(e.muzzleAngle) * 22, e.y + Math.sin(e.muzzleAngle) * 22);
      hole(s.x, s.y, 80);
    }
    if (g.extractionActive) {
      const s = this.worldToScreen(g.map.extraction.x, g.map.extraction.y);
      hole(s.x, s.y, 120 * cam.zoom);
    }
    for (const item of g.map.intel) {
      if (item.taken) continue;
      const s = this.worldToScreen(item.x, item.y);
      hole(s.x, s.y, 34);
    }
    lctx.globalCompositeOperation = 'source-over';
    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.drawImage(this.light, 0, 0, this.view.w, this.view.h);
    if (p) {
      const ps = this.worldToScreen(p.x, p.y);
      const grad = ctx.createRadialGradient(ps.x, ps.y, 10, ps.x, ps.y, 270 * cam.zoom);
      grad.addColorStop(0, 'rgba(125,211,252,0.055)');
      grad.addColorStop(0.6, 'rgba(125,211,252,0.018)');
      grad.addColorStop(1, 'rgba(125,211,252,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ps.x, ps.y, 270 * cam.zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawCrosshair() {
    const g = this.game;
    const p = g.player;
    if (!p || p.dead) return;
    const aim = this.aimWorld();
    const s = this.worldToScreen(aim.x, aim.y);
    let hostile = false;
    for (const e of g.enemies) {
      if (e.dead) continue;
      if (dist(aim.x, aim.y, e.x, e.y) < 26 + e.r) {
        hostile = true;
        break;
      }
    }
    const session = p.weapons[p.slot];
    const spread = session.def.spread + p.heat * 0.55;
    const radius = 7 + spread * 1.25;
    const color = hostile ? '241,113,113' : p.focusActive > 0 ? '196,181,253' : '226,240,250';
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = `rgba(${color},0.85)`;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 2) * i + Math.PI / 4;
      ctx.moveTo(s.x + Math.cos(a) * (radius + 2), s.y + Math.sin(a) * (radius + 2));
      ctx.lineTo(s.x + Math.cos(a) * (radius + 7), s.y + Math.sin(a) * (radius + 7));
    }
    ctx.stroke();
    ctx.fillStyle = `rgba(${color},0.95)`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(${color},0.22)`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, radius + 14, 0, Math.PI * 2);
    ctx.stroke();
    if (session.reloading) {
      const prog = 1 - session.reloadT / session.def.reload;
      ctx.strokeStyle = 'rgba(125,211,252,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, radius + 10, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
      ctx.stroke();
    }
    if (g.hitMarker > 0) {
      const k = 1 - g.hitMarker / 0.16;
      const size = 6 + k * 7;
      ctx.strokeStyle = g.hitMarkerHead ? 'rgba(251,191,36,0.95)' : 'rgba(248,250,252,0.9)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (Math.PI / 2) * i + Math.PI / 4;
        ctx.moveTo(s.x + Math.cos(a) * (5 + size * 0.25), s.y + Math.sin(a) * (5 + size * 0.25));
        ctx.lineTo(s.x + Math.cos(a) * (5 + size), s.y + Math.sin(a) * (5 + size));
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  drawObjectiveMarkers() {
    const g = this.game;
    if (!g.extractionActive || !g.map || !g.player) return;
    const s = this.worldToScreen(g.map.extraction.x, g.map.extraction.y);
    const m = 46;
    if (s.x > m && s.x < this.view.w - m && s.y > m && s.y < this.view.h - m) return;
    const cx = this.view.w / 2;
    const cy = this.view.h / 2;
    let dx = s.x - cx;
    let dy = s.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const scale = Math.min((this.view.w / 2 - m) / Math.abs(dx || 0.001), (this.view.h / 2 - m) / Math.abs(dy || 0.001));
    const px = cx + dx * scale;
    const py = cy + dy * scale;
    const d = Math.round(dist(g.player.x, g.player.y, g.map.extraction.x, g.map.extraction.y) / 10);
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.atan2(dy, dx));
    ctx.fillStyle = 'rgba(52,211,153,0.9)';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-5, -7);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-5, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(167,243,208,0.85)';
    ctx.font = '600 9px "JetBrains Mono", "Consolas", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`EXFIL ${d}m`, px, py + 22);
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

function hexA(hex, alpha) {
  if (!hex || hex[0] !== '#') return `rgba(200,220,235,${alpha})`;
  const h = hex.slice(1);
  const full = h.length === 3 ? h.split('').map((ch) => ch + ch).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function randShake(mag) {
  return (Math.random() * 2 - 1) * mag;
}
