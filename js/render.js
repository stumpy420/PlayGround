import { TAU, clamp, dist, lerp, rand } from './util.js';
import { MAP_W, MAP_H, BOMB_SITE } from './map.js';

const mmCanvas = document.getElementById('minimap');
const mmCtx = mmCanvas.getContext('2d');

export function renderGame(g) {
  const ctx = g.ctx;
  const { w, h, dpr } = g.view;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#070a0b';
  ctx.fillRect(0, 0, w, h);

  if (g.phase === 'menu') { renderMenu(g); return; }

  const cam = g.cam;
  const t = g.time;
  ctx.save();
  ctx.translate(w / 2 + cam.sx, h / 2 + cam.sy);
  ctx.scale(cam.zoom, cam.zoom);
  ctx.translate(-cam.x, -cam.y);

  g.world.drawStatic(ctx, cam);
  drawAmbient(g, ctx, t);
  drawBodies(g, ctx);
  drawBomb(g, ctx, t);
  drawBullets(g, ctx);
  drawAgents(g, ctx, t);
  drawParticles(g, ctx);

  ctx.restore();

  drawFog(g);
  drawVignette(g);
  drawMinimap(g);
}

function renderMenu(g) {
  const ctx = g.ctx;
  const { w, h, dpr } = g.view;
  const zoom = clamp(Math.min(w / 1300, h / 850), 0.55, 1.1);
  const cx = MAP_W / 2 + Math.sin(g.titleT * 0.09) * 180;
  const cy = MAP_H / 2 + Math.cos(g.titleT * 0.07) * 110;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-cx, -cy);
  g.world.drawStatic(ctx, null);
  ctx.fillStyle = 'rgba(4,7,9,.38)';
  ctx.fillRect(0, 0, MAP_W, MAP_H);
  const glow = ctx.createRadialGradient(BOMB_SITE.x, BOMB_SITE.y, 10, BOMB_SITE.x, BOMB_SITE.y, 240);
  glow.addColorStop(0, `rgba(255,70,70,${.18 + Math.sin(g.titleT * 2) * .05})`);
  glow.addColorStop(1, 'rgba(255,70,70,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(BOMB_SITE.x, BOMB_SITE.y, 240, 0, TAU); ctx.fill();
  ctx.restore();
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .2, w / 2, h / 2, Math.max(w, h) * .8);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,.72)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
}

function drawAmbient(g, ctx, t) {
  // bomb site pulse
  const bp = .5 + Math.sin(t * 2.2) * .5;
  const bg = ctx.createRadialGradient(BOMB_SITE.x, BOMB_SITE.y, 10, BOMB_SITE.x, BOMB_SITE.y, BOMB_SITE.r + 40);
  bg.addColorStop(0, `rgba(255,70,70,${.03 + bp * .035})`);
  bg.addColorStop(.7, 'rgba(255,70,70,.02)');
  bg.addColorStop(1, 'rgba(255,70,70,0)');
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.arc(BOMB_SITE.x, BOMB_SITE.y, BOMB_SITE.r + 40, 0, TAU); ctx.fill();

  for (const st of g.stations) {
    const pulse = .5 + Math.sin(t * 3 + st.id) * .5;
    const col = st.done ? '95,227,208' : '255,181,69';
    const rad = st.done ? 34 : 44 + pulse * 6;
    const grad = ctx.createRadialGradient(st.x, st.y, 4, st.x, st.y, rad);
    grad.addColorStop(0, `rgba(${col},${st.done ? .1 : .16})`);
    grad.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(st.x, st.y, rad, 0, TAU); ctx.fill();
    if (!st.done && st.progress > 0) {
      ctx.beginPath();
      ctx.arc(st.x, st.y, 30, -Math.PI / 2, -Math.PI / 2 + (st.progress / 100) * TAU);
      ctx.strokeStyle = 'rgba(255,181,69,.8)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    if (st.done) {
      ctx.fillStyle = 'rgba(95,227,208,.85)';
      ctx.font = '800 12px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('✓', st.x, st.y - 26);
    }
  }

  // emergency glow
  const eg = ctx.createRadialGradient(250, 1115, 2, 250, 1115, 55);
  eg.addColorStop(0, 'rgba(255,77,94,.12)');
  eg.addColorStop(1, 'rgba(255,77,94,0)');
  ctx.fillStyle = eg;
  ctx.beginPath(); ctx.arc(250, 1115, 55, 0, TAU); ctx.fill();

  if (g.lightsOut > 0) {
    ctx.fillStyle = 'rgba(2,4,8,.18)';
    ctx.fillRect(0, 0, MAP_W, MAP_H);
  }
}

function isVisible(g, a) {
  if (!g.player) return true;
  if (!g.player.alive) return true;
  if (g.player.isImpostor) return true;
  if (a.isPlayer) return true;
  const vision = g.lightsOut > 0 ? 330 : 640;
  return dist(g.player.x, g.player.y, a.x, a.y) < vision && g.world.los(g.player.x, g.player.y, a.x, a.y);
}

function drawBodies(g, ctx) {
  for (const b of g.bodies) {
    if (b.reported) continue;
    const vis = !g.player || !g.player.alive || g.player.isImpostor ||
      (dist(g.player.x, g.player.y, b.x, b.y) < (g.lightsOut > 0 ? 330 : 640) && g.world.los(g.player.x, g.player.y, b.x, b.y));
    if (!vis) continue;
    ctx.save();
    ctx.translate(b.x, b.y);
    const pool = ctx.createRadialGradient(0, 4, 2, 0, 4, 34);
    pool.addColorStop(0, 'rgba(120,12,24,.5)');
    pool.addColorStop(1, 'rgba(80,8,18,0)');
    ctx.fillStyle = pool;
    ctx.beginPath(); ctx.ellipse(0, 6, 34, 20, 0, 0, TAU); ctx.fill();
    ctx.rotate(b.killerId != null ? 0.7 : 0.2);
    ctx.fillStyle = '#1d2324';
    roundRect(ctx, -17, -8, 34, 16, 7); ctx.fill();
    ctx.fillStyle = b.color;
    roundRect(ctx, -13, -6, 26, 12, 5); ctx.fill();
    ctx.fillStyle = '#0d1112';
    ctx.beginPath(); ctx.arc(17, 0, 6, 0, TAU); ctx.fill();
    ctx.restore();
    if (!g.player || g.player.alive) {
      const near = g.player && dist(g.player.x, g.player.y, b.x, b.y) < 130;
      const pulse = .5 + Math.sin(g.time * 5) * .5;
      ctx.fillStyle = near ? `rgba(255,77,94,${.7 + pulse * .3})` : 'rgba(255,77,94,.55)';
      ctx.font = '900 15px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('!', b.x, b.y - 20);
    }
  }
}

function drawBomb(g, ctx, t) {
  const b = g.bomb;
  if (!b) return;
  if (b.state === 'planted') {
    const pulse = .5 + Math.sin(t * (b.timer < 10 ? 14 : 5)) * .5;
    const glow = ctx.createRadialGradient(b.x, b.y, 4, b.x, b.y, 80);
    glow.addColorStop(0, `rgba(255,60,60,${.18 + pulse * .2})`);
    glow.addColorStop(1, 'rgba(255,60,60,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(b.x, b.y, 80, 0, TAU); ctx.fill();
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.fillStyle = 'rgba(0,0,0,.4)';
    ctx.beginPath(); ctx.ellipse(3, 7, 24, 13, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#202629'; roundRect(ctx, -18, -13, 36, 26, 4); ctx.fill();
    ctx.strokeStyle = '#4a5457'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#0b0f10'; ctx.fillRect(-13, -8, 16, 12);
    ctx.fillStyle = `rgba(255,60,60,${.4 + pulse * .6})`;
    ctx.fillRect(5, -8, 8, 8);
    ctx.fillStyle = '#ffb545';
    ctx.fillRect(-12, 6, 24, 2);
    ctx.strokeStyle = '#b33a3a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-10, 2); ctx.quadraticCurveTo(-2, 14, 8, 4); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,220,220,.9)';
    ctx.font = '800 10px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.ceil(b.timer)}`, b.x, b.y - 24);
    if (b.defuseProgress > 0) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 36, -Math.PI / 2, -Math.PI / 2 + b.defuseProgress * TAU);
      ctx.strokeStyle = 'rgba(139,226,139,.9)';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  }
}

function drawBullets(g, ctx) {
  for (const tr of g.tracers) {
    ctx.strokeStyle = tr.color;
    ctx.globalAlpha = clamp(tr.life * 10, 0, 1);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tr.x1, tr.y1); ctx.lineTo(tr.x2, tr.y2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  for (const b of g.bullets) {
    ctx.fillStyle = '#ffe2a3';
    ctx.beginPath(); ctx.arc(b.x, b.y, 2.2, 0, TAU); ctx.fill();
  }
}

function drawAgents(g, ctx, t) {
  const order = g.agents.filter(a => a.alive).sort((a, b) => a.y - b.y);
  for (const a of order) {
    if (!isVisible(g, a)) continue;
    drawAgent(g, ctx, a, t);
  }
}

function drawAgent(g, ctx, a, t) {
  const isPlayer = a.isPlayer;
  const fellowImp = g.player && g.player.isImpostor && a.isImpostor && !isPlayer;
  const revealed = a.revealedToPlayer && a.isImpostor;
  const accent = a.color;
  const walking = a.moving ? Math.sin(a.walk) : 0;
  ctx.save();
  ctx.translate(a.x, a.y);

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,.36)';
  ctx.beginPath(); ctx.ellipse(2, 7, 16, 9, 0, 0, TAU); ctx.fill();

  // player ring
  if (isPlayer) {
    ctx.strokeStyle = a.isImpostor ? 'rgba(255,77,94,.7)' : 'rgba(95,227,208,.75)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.arc(0, 0, 23, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);
  } else if (revealed) {
    ctx.strokeStyle = `rgba(255,77,94,${.5 + Math.sin(t * 6) * .25})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 21, 0, TAU); ctx.stroke();
  }

  ctx.rotate(a.angle);

  // legs
  ctx.fillStyle = '#22292b';
  ctx.beginPath(); ctx.ellipse(-3, -7 + walking * 2, 5, 3, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-3, 7 - walking * 2, 5, 3, 0, 0, TAU); ctx.fill();

  // gun
  ctx.fillStyle = '#171d1f';
  roundRect(ctx, 5, 3, 23, 4, 1.5); ctx.fill();
  ctx.fillStyle = '#30393b';
  roundRect(ctx, 8, 3.4, 13, 2, 1); ctx.fill();
  ctx.fillStyle = '#111617';
  roundRect(ctx, 9, 5, 6, 5, 1); ctx.fill();

  // torso
  const bodyGrad = ctx.createLinearGradient(-10, -10, 10, 10);
  bodyGrad.addColorStop(0, accent);
  bodyGrad.addColorStop(1, shade(accent, -0.4));
  ctx.fillStyle = bodyGrad;
  roundRect(ctx, -12, -10, 24, 20, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.5; ctx.stroke();

  // vest
  ctx.fillStyle = 'rgba(10,15,16,.72)';
  roundRect(ctx, -8, -8, 13, 16, 4); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.fillRect(-6, -6, 9, 2);
  ctx.fillRect(-6, 1, 9, 2);

  // head / helmet
  ctx.fillStyle = '#b98d68';
  ctx.beginPath(); ctx.arc(4, 0, 6.5, 0, TAU); ctx.fill();
  ctx.fillStyle = shade(accent, -0.5);
  ctx.beginPath(); ctx.arc(3.5, 0, 6.8, Math.PI * .55, Math.PI * 1.45); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  ctx.beginPath(); ctx.arc(3.5, -1.6, 3.6, Math.PI, TAU); ctx.fill();

  // muzzle flash
  if (a.muzzle > 0) {
    ctx.fillStyle = 'rgba(255,210,120,.95)';
    ctx.beginPath();
    ctx.moveTo(29, 5); ctx.lineTo(38, 5); ctx.lineTo(31, 0); ctx.lineTo(38, -5); ctx.lineTo(29, -3);
    ctx.closePath(); ctx.fill();
    const fl = ctx.createRadialGradient(32, 4, 1, 32, 4, 26);
    fl.addColorStop(0, 'rgba(255,220,150,.5)');
    fl.addColorStop(1, 'rgba(255,220,150,0)');
    ctx.fillStyle = fl;
    ctx.beginPath(); ctx.arc(32, 4, 26, 0, TAU); ctx.fill();
  }
  ctx.restore();

  // hit flash
  if (a.hitFlash > 0) {
    ctx.fillStyle = `rgba(255,50,60,${a.hitFlash * 2})`;
    ctx.beginPath(); ctx.arc(a.x, a.y, 20, 0, TAU); ctx.fill();
  }

  // labels
  const label = isPlayer ? 'YOU' : a.name;
  const lx = a.x, ly = a.y - 31;
  ctx.font = '800 9px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = revealed ? '#ff7b87' : fellowImp ? '#ff9aa3' : isPlayer ? '#c8fff8' : 'rgba(232,240,236,.82)';
  ctx.fillText(label, lx, ly);
  if (fellowImp || revealed) {
    ctx.fillStyle = '#ff4d5e';
    ctx.font = '900 10px ui-monospace, monospace';
    ctx.fillText('◆', lx, ly - 11);
  }
  if (isPlayer) {
    ctx.fillStyle = a.isImpostor ? 'rgba(255,77,94,.85)' : 'rgba(95,227,208,.85)';
    ctx.font = '700 7px ui-monospace, monospace';
    ctx.fillText(a.isImpostor ? 'INFILTRATOR' : 'CREW', lx, ly + 9);
  }
  if (a.health < 100 && !isPlayer) {
    const w = 30;
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.fillRect(lx - w / 2, ly + 4, w, 3);
    ctx.fillStyle = a.health > 50 ? '#8be28b' : '#ff4d5e';
    ctx.fillRect(lx - w / 2, ly + 4, w * (a.health / 100), 3);
  }
  if (a.stunned > 0) {
    ctx.fillStyle = '#ffb545';
    ctx.font = '800 9px ui-monospace, monospace';
    ctx.fillText('STUNNED', lx, ly - 22);
  }
  if (g.bomb && g.bomb.state === 'carried' && g.bomb.carrierId === a.id) {
    const pulse = .5 + Math.sin(t * 7) * .5;
    ctx.fillStyle = `rgba(255,77,94,${.6 + pulse * .4})`;
    ctx.font = '900 8px ui-monospace, monospace';
    ctx.fillText('◉ BOMB', lx, ly - 24);
  }
}

function drawParticles(g, ctx) {
  for (const p of g.particles) {
    const a = clamp(p.life / p.max, 0, 1);
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.4 + a * 0.6), 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawReticle(g, ctx) {
  const p = g.player;
  if (!p || !p.alive || g.phase === 'meeting') return;
  const d = 86;
  const x = p.x + Math.cos(p.angle) * d;
  const y = p.y + Math.sin(p.angle) * d;
  ctx.strokeStyle = p.isImpostor ? 'rgba(255,77,94,.8)' : 'rgba(255,255,255,.72)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x - 5, y); ctx.lineTo(x - 2, y);
  ctx.moveTo(x + 2, y); ctx.lineTo(x + 5, y);
  ctx.moveTo(x, y - 5); ctx.lineTo(x, y - 2);
  ctx.moveTo(x, y + 2); ctx.lineTo(x, y + 5);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, 2, 0, TAU); ctx.fillStyle = ctx.strokeStyle; ctx.fill();
}

function drawFog(g) {
  const p = g.player;
  if (!p) return;
  const ctx = g.ctx;
  const { w, h, dpr } = g.view;
  const f = g.fogCtx;
  f.setTransform(dpr, 0, 0, dpr, 0, 0);
  f.clearRect(0, 0, w, h);
  if (!p.alive) {
    f.fillStyle = 'rgba(3,6,8,.35)';
    f.fillRect(0, 0, w, h);
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.drawImage(g.fogCanvas, 0, 0, w, h);
    ctx.restore();
    return;
  }
  const vision = p.isImpostor ? 1000 : (g.lightsOut > 0 ? 330 : 660);
  const darkness = p.isImpostor ? 0.6 : (g.lightsOut > 0 ? 0.95 : 0.88);
  f.fillStyle = `rgba(2,5,7,${darkness})`;
  f.fillRect(0, 0, w, h);
  f.globalCompositeOperation = 'destination-out';
  const cam = g.cam;
  const sx = (p.x - cam.x) * cam.zoom + w / 2 + cam.sx;
  const sy = (p.y - cam.y) * cam.zoom + h / 2 + cam.sy;
  const poly = g.world.visibilityPolygon(p.x, p.y, vision, 150);
  f.save();
  f.beginPath();
  poly.forEach(([wx, wy], i) => {
    const px = (wx - cam.x) * cam.zoom + w / 2 + cam.sx;
    const py = (wy - cam.y) * cam.zoom + h / 2 + cam.sy;
    if (i === 0) f.moveTo(px, py); else f.lineTo(px, py);
  });
  f.closePath();
  f.clip();
  const r = vision * cam.zoom;
  const grad = f.createRadialGradient(sx, sy, r * .15, sx, sy, r);
  grad.addColorStop(0, 'rgba(0,0,0,1)');
  grad.addColorStop(.65, 'rgba(0,0,0,.94)');
  grad.addColorStop(.9, 'rgba(0,0,0,.35)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  f.fillStyle = grad;
  f.fillRect(0, 0, w, h);
  f.restore();
  // soft personal light
  f.globalCompositeOperation = 'destination-out';
  const g2 = f.createRadialGradient(sx, sy, 8, sx, sy, r * .35);
  g2.addColorStop(0, 'rgba(0,0,0,.9)');
  g2.addColorStop(1, 'rgba(0,0,0,0)');
  f.fillStyle = g2;
  f.beginPath(); f.arc(sx, sy, r * .35, 0, TAU); f.fill();
  f.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.drawImage(g.fogCanvas, 0, 0, w, h);
  ctx.restore();
}

function drawVignette(g) {
  const ctx = g.ctx;
  const { w, h } = g.view;
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .28, w / 2, h / 2, Math.max(w, h) * .72);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,.38)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
  if (g.hitFlash > 0) {
    const r = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .2, w / 2, h / 2, Math.max(w, h) * .68);
    r.addColorStop(0, 'rgba(120,0,8,0)');
    r.addColorStop(1, `rgba(150,0,12,${g.hitFlash * .6})`);
    ctx.fillStyle = r; ctx.fillRect(0, 0, w, h);
  }
  if (g.bomb && g.bomb.state === 'planted' && g.bomb.timer < 10) {
    const pulse = .5 + Math.sin(g.time * 10) * .5;
    const r = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.max(w, h) * .75);
    r.addColorStop(0, 'rgba(120,0,8,0)');
    r.addColorStop(1, `rgba(160,0,10,${.12 + pulse * .18})`);
    ctx.fillStyle = r; ctx.fillRect(0, 0, w, h);
  }
}

function drawMinimap(g) {
  if (!mmCtx) return;
  const cw = mmCanvas.width, ch = mmCanvas.height;
  const s = Math.min(cw / MAP_W, ch / MAP_H);
  const ox = (cw - MAP_W * s) / 2, oy = (ch - MAP_H * s) / 2;
  mmCtx.clearRect(0, 0, cw, ch);
  mmCtx.fillStyle = '#080c0e';
  mmCtx.fillRect(0, 0, cw, ch);
  mmCtx.save();
  mmCtx.translate(ox, oy);
  mmCtx.scale(s, s);
  mmCtx.fillStyle = '#7f7157';
  mmCtx.fillRect(0, 0, MAP_W, MAP_H);
  for (const z of g.world.zones) {
    mmCtx.fillStyle = 'rgba(255,255,255,.035)';
    mmCtx.fillRect(z.x, z.y, z.w, z.h);
  }
  mmCtx.fillStyle = '#3b3429';
  for (const r of g.world.walls) mmCtx.fillRect(r.x, r.y, r.w, r.h);
  mmCtx.fillStyle = '#6a5438';
  for (const r of g.world.crates) mmCtx.fillRect(r.x, r.y, r.w, r.h);
  // site
  mmCtx.strokeStyle = 'rgba(255,77,94,.8)';
  mmCtx.lineWidth = 8;
  mmCtx.beginPath(); mmCtx.arc(BOMB_SITE.x, BOMB_SITE.y, BOMB_SITE.r, 0, TAU); mmCtx.stroke();
  // stations
  for (const st of g.stations) {
    mmCtx.fillStyle = st.done ? '#5fe3d0' : '#ffb545';
    mmCtx.beginPath(); mmCtx.arc(st.x, st.y, 14, 0, TAU); mmCtx.fill();
  }
  // bodies
  for (const b of g.bodies) {
    if (b.reported) continue;
    mmCtx.strokeStyle = '#ff4d5e';
    mmCtx.lineWidth = 8;
    mmCtx.beginPath(); mmCtx.moveTo(b.x - 14, b.y - 14); mmCtx.lineTo(b.x + 14, b.y + 14); mmCtx.moveTo(b.x + 14, b.y - 14); mmCtx.lineTo(b.x - 14, b.y + 14); mmCtx.stroke();
  }
  // bomb
  if (g.bomb) {
    mmCtx.fillStyle = g.bomb.state === 'planted' ? '#ff4d5e' : '#ff8a1e';
    mmCtx.beginPath(); mmCtx.arc(g.bomb.x || BOMB_SITE.x, g.bomb.y || BOMB_SITE.y, 20, 0, TAU); mmCtx.fill();
  }
  // agents
  for (const a of g.agents) {
    if (!a.alive) continue;
    if (!a.isPlayer && !(g.player && (g.player.isImpostor || !g.player.alive))) continue;
    mmCtx.fillStyle = a.color;
    mmCtx.beginPath(); mmCtx.arc(a.x, a.y, a.isPlayer ? 22 : 14, 0, TAU); mmCtx.fill();
    if (a.isPlayer) {
      mmCtx.strokeStyle = '#fff';
      mmCtx.lineWidth = 6;
      mmCtx.stroke();
    }
  }
  // sweep
  const ang = g.time * 1.3;
  mmCtx.strokeStyle = 'rgba(95,227,208,.28)';
  mmCtx.lineWidth = 3;
  mmCtx.beginPath(); mmCtx.moveTo(900, 600); mmCtx.lineTo(900 + Math.cos(ang) * 900, 600 + Math.sin(ang) * 900); mmCtx.stroke();
  mmCtx.restore();
  // frame
  mmCtx.strokeStyle = 'rgba(255,255,255,.08)';
  mmCtx.lineWidth = 1;
  mmCtx.strokeRect(.5, .5, cw - 1, ch - 1);
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (amt < 0) { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; }
  else { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}
