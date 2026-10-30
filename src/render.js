import {
  TILE, WORLD_W, WORLD_H, GRID, COLS, ROWS, ROOMS, TASKS, VENTS, BOMB_SITES,
  EMERGENCY, centerOf, roomNameAt,
} from "./map.js";

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function hash(x, y) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export class Renderer {
  constructor(canvas, minimap) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.minimap = minimap;
    this.mctx = minimap ? minimap.getContext("2d") : null;
    this.dpr = 1;
    this.w = 1;
    this.h = 1;
    this.zoom = 1;
    this.cam = { x: WORLD_W / 2, y: WORLD_H / 2 };
    this.shakeX = 0;
    this.shakeY = 0;
    this.mapCanvas = this.buildMap();
    this.lastMinimap = 0;
    this.dust = Array.from({ length: 34 }, (_, i) => ({
      x: Math.random(), y: Math.random(), s: 0.3 + Math.random(), p: Math.random() * TAU,
    }));
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, rect.width);
    this.h = Math.max(1, rect.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.baseZoom = clamp(Math.min(this.w / 430, this.h / 335), 0.78, 1.75);
    this.zoom = this.baseZoom;
    if (this.minimap) {
      const mr = this.minimap.getBoundingClientRect();
      this.minimap.width = Math.round(mr.width * this.dpr);
      this.minimap.height = Math.round(mr.height * this.dpr);
    }
  }

  buildMap() {
    const c = document.createElement("canvas");
    c.width = WORLD_W;
    c.height = WORLD_H;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#060b10";
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    // corridor floor texture
    ctx.fillStyle = "#0a1219";
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const v = hash(x, y);
        if (v > 0.72) {
          ctx.fillStyle = `rgba(130,160,180,${0.012 + v * 0.02})`;
          ctx.fillRect(x * TILE + 2, y * TILE + 2, TILE - 4, TILE - 4);
        }
      }
    }

    // rooms
    for (const r of ROOMS) {
      const x = r.x * TILE, y = r.y * TILE, w = r.w * TILE, h = r.h * TILE;
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, r.floor);
      g.addColorStop(1, shade(r.floor, -12));
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);

      // tile grid
      ctx.strokeStyle = "rgba(210,235,245,0.045)";
      ctx.lineWidth = 1;
      for (let gx = r.x; gx <= r.x + r.w; gx++) {
        ctx.beginPath(); ctx.moveTo(gx * TILE, y); ctx.lineTo(gx * TILE, y + h); ctx.stroke();
      }
      for (let gy = r.y; gy <= r.y + r.h; gy++) {
        ctx.beginPath(); ctx.moveTo(x, gy * TILE); ctx.lineTo(x + w, gy * TILE); ctx.stroke();
      }

      // room accent trim
      ctx.strokeStyle = hexA(r.accent, 0.18);
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
      ctx.strokeStyle = hexA(r.accent, 0.07);
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 10, y + 10, w - 20, h - 20);

      // hazard corner marks
      ctx.fillStyle = hexA(r.accent, 0.55);
      const m = 8, s = 10;
      ctx.fillRect(x + 8, y + 8, s, 2);
      ctx.fillRect(x + 8, y + 8, 2, s);
      ctx.fillRect(x + w - 8 - s, y + 8, s, 2);
      ctx.fillRect(x + w - 10, y + 8, 2, s);
      ctx.fillRect(x + 8, y + h - 10, s, 2);
      ctx.fillRect(x + 8, y + h - 8 - s, 2, s);
      ctx.fillRect(x + w - 8 - s, y + h - 10, s, 2);
      ctx.fillRect(x + w - 10, y + h - 8 - s, 2, s);

      // label
      ctx.save();
      ctx.fillStyle = hexA(r.accent, 0.62);
      ctx.font = "700 11px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.letterSpacing = "3px";
      ctx.fillText(r.name, x + 20, y + 28);
      ctx.fillStyle = "rgba(220,240,250,0.2)";
      ctx.font = "500 7px ui-monospace, monospace";
      ctx.letterSpacing = "1px";
      ctx.fillText(`SECTOR ${String(ROOMS.indexOf(r) + 1).padStart(2, "0")}`, x + 21, y + 40);
      ctx.restore();
    }

    // floor decals: lane arrows and hazard strips
    ctx.save();
    ctx.strokeStyle = "rgba(140,190,210,0.12)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 9]);
    ctx.beginPath();
    ctx.moveTo(16 * TILE, 10.5 * TILE); ctx.lineTo(32 * TILE, 10.5 * TILE);
    ctx.moveTo(7.5 * TILE, 11 * TILE); ctx.lineTo(7.5 * TILE, 23 * TILE);
    ctx.moveTo(15.5 * TILE, 12 * TILE); ctx.lineTo(15.5 * TILE, 23 * TILE);
    ctx.moveTo(31.5 * TILE, 9 * TILE); ctx.lineTo(31.5 * TILE, 23 * TILE);
    ctx.stroke();
    ctx.restore();

    // walls
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (GRID[y][x] !== "#") continue;
        const px = x * TILE, py = y * TILE;
        const v = hash(x, y);
        ctx.fillStyle = "#0a1118";
        ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = `rgba(60,82,98,${0.24 + v * 0.16})`;
        ctx.fillRect(px + 1, py + 1, TILE - 2, 5);
        ctx.fillStyle = "rgba(5,9,14,0.6)";
        ctx.fillRect(px + 1, py + TILE - 4, TILE - 2, 3);
        ctx.strokeStyle = "rgba(120,160,180,0.12)";
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
        if (v > 0.82) {
          ctx.fillStyle = "rgba(180,220,240,0.18)";
          ctx.fillRect(px + 6, py + 7, 2, 2);
        }
      }
    }

    // props
    for (const p of props()) drawProp(ctx, p);

    // vents
    for (const v of VENTS) {
      const c = centerOf(v.tx, v.ty);
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.fillStyle = "#101820";
      roundRect(ctx, -12, -9, 24, 18, 4); ctx.fill();
      ctx.strokeStyle = "rgba(150,180,195,0.5)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.strokeStyle = "rgba(150,180,195,0.28)";
      for (let i = -7; i <= 7; i += 4) {
        ctx.beginPath(); ctx.moveTo(i, -5); ctx.lineTo(i, 5); ctx.stroke();
      }
      ctx.restore();
    }

    // bomb site markings
    for (const site of BOMB_SITES) {
      const c = centerOf(site.tx, site.ty);
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.strokeStyle = "rgba(255,90,70,0.28)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.arc(0, 0, 37, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,90,70,0.10)";
      ctx.beginPath(); ctx.arc(0, 0, 34, 0, TAU); ctx.fill();
      ctx.fillStyle = "rgba(255,150,130,0.6)";
      ctx.font = "800 11px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(`SITE ${site.id}`, 0, 4);
      ctx.restore();
    }

    // emergency button pedestal
    {
      const c = centerOf(EMERGENCY.tx, EMERGENCY.ty);
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.fillStyle = "#171f26";
      roundRect(ctx, -14, -14, 28, 28, 5); ctx.fill();
      ctx.strokeStyle = "rgba(255,190,120,0.4)"; ctx.stroke();
      ctx.fillStyle = "#5b1f21";
      ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fill();
      ctx.fillStyle = "#ff5b4a";
      ctx.beginPath(); ctx.arc(-1, -1, 5.5, 0, TAU); ctx.fill();
      ctx.restore();
    }

    // subtle edge vignette baked into the map
    const vg = ctx.createRadialGradient(WORLD_W / 2, WORLD_H / 2, WORLD_H * 0.25, WORLD_W / 2, WORLD_H / 2, WORLD_H * 0.78);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    return c;
  }

  render(game, time, menu = false) {
    const ctx = this.ctx;
    const { w, h, dpr } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#05090d";
    ctx.fillRect(0, 0, w, h);

    const focus = game?.player;
    let targetX = WORLD_W / 2, targetY = WORLD_H / 2;
    let zoom = this.baseZoom;
    if (menu) {
      targetX = WORLD_W / 2 + Math.sin(time * 0.055) * 210;
      targetY = WORLD_H / 2 + Math.cos(time * 0.047) * 90;
      zoom = clamp(Math.min(w / 1100, h / 700), 0.62, 1.0);
    } else if (focus) {
      targetX = focus.x;
      targetY = focus.y;
    }
    this.cam.x += (targetX - this.cam.x) * (menu ? 0.02 : 0.13);
    this.cam.y += (targetY - this.cam.y) * (menu ? 0.02 : 0.13);
    this.zoom += (zoom - this.zoom) * 0.09;

    const halfW = w / (2 * this.zoom), halfH = h / (2 * this.zoom);
    if (halfW * 2 < WORLD_W) this.cam.x = clamp(this.cam.x, halfW + 4, WORLD_W - halfW - 4);
    else this.cam.x = WORLD_W / 2;
    if (halfH * 2 < WORLD_H) this.cam.y = clamp(this.cam.y, halfH + 4, WORLD_H - halfH - 4);
    else this.cam.y = WORLD_H / 2;

    const shake = game?.shake || 0;
    this.shakeX = (Math.random() - 0.5) * shake;
    this.shakeY = (Math.random() - 0.5) * shake;

    ctx.save();
    ctx.translate(w / 2 + this.shakeX, h / 2 + this.shakeY);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.cam.x, -this.cam.y);

    ctx.drawImage(this.mapCanvas, 0, 0);
    if (game) this.drawWorld(ctx, game, time);
    ctx.restore();

    if (menu) {
      this.drawMenuGlow(ctx, time);
    } else if (game) {
      this.drawLighting(ctx, game);
    }
    this.drawDust(ctx, time, menu);

    if (game) {
      if (game.flash > 0) {
        ctx.fillStyle = `rgba(255,70,60,${game.flash * 0.22})`;
        ctx.fillRect(0, 0, w, h);
      }
      if (game.sabotage) this.drawSabotageVignette(ctx, game, time);
      if (game.phase === "playing" || game.phase === "ending") this.drawObjectiveArrow(ctx, game);
    }

    if (game && time - this.lastMinimap > 0.08) {
      this.lastMinimap = time;
      this.drawMinimap(game);
    }
  }

  drawWorld(ctx, game, time) {
    // task consoles
    for (const t of TASKS) {
      const st = game.taskState[t.id];
      const c = centerOf(t.tx, t.ty);
      const pulse = 0.5 + Math.sin(time * 3 + t.tx) * 0.5;
      ctx.save();
      ctx.translate(c.x, c.y);
      if (st.done) {
        ctx.strokeStyle = "rgba(92,225,192,0.75)";
        ctx.fillStyle = "rgba(92,225,192,0.16)";
        ctx.beginPath(); ctx.arc(0, 0, 18, 0, TAU); ctx.fill();
        ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = "#bffdf0";
        ctx.font = "700 12px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText("✓", 0, 4);
      } else {
        ctx.strokeStyle = `rgba(255,214,120,${0.28 + pulse * 0.35})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, 16 + pulse * 4, 0, TAU); ctx.stroke();
        ctx.fillStyle = `rgba(255,196,90,${0.1 + pulse * 0.12})`;
        ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.fill();
        ctx.fillStyle = "#ffd58c";
        ctx.font = "700 11px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText("!", 0, 4);
        if (st.progress > 0) {
          ctx.strokeStyle = "rgba(255,255,255,0.85)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 25, -Math.PI / 2, -Math.PI / 2 + TAU * st.progress);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // emergency glow
    {
      const c = centerOf(EMERGENCY.tx, EMERGENCY.ty);
      const pulse = 0.5 + Math.sin(time * 2.2) * 0.5;
      ctx.fillStyle = `rgba(255,90,70,${0.05 + pulse * 0.06})`;
      ctx.beginPath(); ctx.arc(c.x, c.y, 34, 0, TAU); ctx.fill();
    }

    // sabotage device
    if (game.sabotage) {
      const site = BOMB_SITES.find((s) => s.id === game.sabotage.siteId);
      const c = centerOf(site.tx, site.ty);
      const pulse = 0.5 + Math.sin(time * 9) * 0.5;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.fillStyle = `rgba(255,50,45,${0.12 + pulse * 0.1})`;
      ctx.beginPath(); ctx.arc(0, 0, 46, 0, TAU); ctx.fill();
      ctx.strokeStyle = `rgba(255,80,60,${0.5 + pulse * 0.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 34, 0, TAU); ctx.stroke();
      ctx.fillStyle = "#141014";
      roundRect(ctx, -13, -10, 26, 20, 3); ctx.fill();
      ctx.strokeStyle = "#ff5a4a"; ctx.stroke();
      ctx.fillStyle = pulse > 0.5 ? "#ff5a4a" : "#5b1d1b";
      ctx.beginPath(); ctx.arc(0, -3, 4, 0, TAU); ctx.fill();
      ctx.fillStyle = "#ffd8d0";
      ctx.font = "700 8px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(Math.ceil(game.sabotage.timeLeft).toString().padStart(2, "0"), 0, 16);
      if (game.sabotage.defuse > 0) {
        ctx.strokeStyle = "#7dffdc";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 40, -Math.PI / 2, -Math.PI / 2 + TAU * (game.sabotage.defuse / 100));
        ctx.stroke();
      }
      ctx.restore();
    }

    // bodies
    for (const body of game.bodies) {
      drawBody(ctx, body, time);
    }

    // noise rings
    for (const n of game.noises) {
      const age = 1 - n.life / 2.2;
      ctx.strokeStyle = `rgba(255,200,140,${(1 - age) * 0.22})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(n.x, n.y, 10 + age * 120, 0, TAU); ctx.stroke();
    }

    // players
    const drawList = game.players.filter((p) => !p.ghost || p.isPlayer);
    for (const p of drawList) {
      if (!p.alive && !p.ghost) continue;
      drawBean(ctx, p, game, time);
    }

    // tracers
    for (const t of game.tracers) {
      const a = t.life / 0.1;
      ctx.strokeStyle = hexA(t.color, a * 0.9);
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(t.x1, t.y1); ctx.lineTo(t.x2, t.y2); ctx.stroke();
      ctx.fillStyle = hexA("#fff6cc", a);
      ctx.beginPath(); ctx.arc(t.x2, t.y2, 2.6, 0, TAU); ctx.fill();
    }

    // particles
    for (const p of game.particles) {
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // ghost title / spectate label
    if (game.player?.ghost) {
      const p = game.player;
      ctx.fillStyle = "rgba(160,220,255,0.5)";
      ctx.font = "600 8px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText("GHOST", p.x, p.y - 24);
    }
  }

  drawLighting(ctx, game) {
    const p = game.player;
    if (!p) return;
    const sx = (p.x - this.cam.x) * this.zoom + this.w / 2 + this.shakeX;
    const sy = (p.y - this.cam.y) * this.zoom + this.h / 2 + this.shakeY;
    const radius = Math.max(this.w, this.h) * 0.72;
    const g = ctx.createRadialGradient(sx, sy, radius * 0.16, sx, sy, radius);
    g.addColorStop(0, "rgba(2,5,8,0)");
    g.addColorStop(0.42, "rgba(2,5,8,0.06)");
    g.addColorStop(0.72, "rgba(2,5,8,0.28)");
    g.addColorStop(1, "rgba(2,5,8,0.62)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.w, this.h);
  }

  drawSabotageVignette(ctx, game, time) {
    const pulse = 0.5 + Math.sin(time * 7) * 0.5;
    const g = ctx.createRadialGradient(this.w / 2, this.h / 2, Math.min(this.w, this.h) * 0.22, this.w / 2, this.h / 2, Math.max(this.w, this.h) * 0.72);
    g.addColorStop(0, "rgba(255,40,35,0)");
    g.addColorStop(1, `rgba(255,30,25,${0.18 + pulse * 0.15})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.w, this.h);
  }

  drawObjectiveArrow(ctx, game) {
    if (!game.sabotage) return;
    const site = BOMB_SITES.find((s) => s.id === game.sabotage.siteId);
    if (!site) return;
    const c = centerOf(site.tx, site.ty);
    const p = game.player;
    const sx = (c.x - this.cam.x) * this.zoom + this.w / 2;
    const sy = (c.y - this.cam.y) * this.zoom + this.h / 2;
    const margin = 76;
    if (sx > margin && sx < this.w - margin && sy > margin && sy < this.h - margin) return;
    const cx = this.w / 2, cy = this.h / 2;
    const ang = Math.atan2(sy - cy, sx - cx);
    const rx = this.w / 2 - margin, ry = this.h / 2 - margin;
    const scale = Math.min(rx / Math.max(1, Math.abs(Math.cos(ang))), ry / Math.max(1, Math.abs(Math.sin(ang))));
    const ax = cx + Math.cos(ang) * scale;
    const ay = cy + Math.sin(ang) * scale;
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(ang);
    ctx.fillStyle = "rgba(255,75,65,0.9)";
    ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(-7, 8); ctx.lineTo(-7, -8); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.fillStyle = "rgba(255,160,150,0.85)";
    ctx.font = "700 9px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText(`SABOTAGE ${Math.round(Math.hypot(c.x - p.x, c.y - p.y) / TILE)}m`, ax, ay + 22);
  }

  drawDust(ctx, time, menu) {
    ctx.save();
    for (const d of this.dust) {
      const x = ((d.x + time * 0.006 * d.s) % 1) * this.w;
      const y = (d.y + Math.sin(time * 0.4 + d.p) * 0.01) * this.h;
      ctx.fillStyle = menu ? "rgba(120,210,210,0.32)" : "rgba(190,220,240,0.20)";
      ctx.fillRect(x, y, d.s * 1.4, d.s * 1.4);
    }
    ctx.restore();
  }

  drawMenuGlow(ctx, time) {
    const g = ctx.createLinearGradient(0, 0, 0, this.h);
    g.addColorStop(0, "rgba(4,8,12,0.38)");
    g.addColorStop(0.45, "rgba(4,8,12,0.1)");
    g.addColorStop(1, "rgba(4,8,12,0.8)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.w, this.h);
    const pulse = 0.5 + Math.sin(time * 0.8) * 0.5;
    const rg = ctx.createRadialGradient(this.w * 0.72, this.h * 0.28, 10, this.w * 0.72, this.h * 0.28, this.w * 0.5);
    rg.addColorStop(0, `rgba(255,120,60,${0.07 + pulse * 0.05})`);
    rg.addColorStop(1, "rgba(255,120,60,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, this.w, this.h);
  }

  drawMinimap(game) {
    if (!this.mctx || !this.minimap) return;
    const ctx = this.mctx;
    const w = this.minimap.clientWidth, h = this.minimap.clientHeight;
    if (!w || !h) return;
    if (this.minimap.width !== Math.round(w * this.dpr) || this.minimap.height !== Math.round(h * this.dpr)) {
      this.minimap.width = Math.round(w * this.dpr);
      this.minimap.height = Math.round(h * this.dpr);
    }
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(4,9,13,0.75)";
    ctx.fillRect(0, 0, w, h);
    const scale = Math.min(w / WORLD_W, h / WORLD_H);
    const ox = (w - WORLD_W * scale) / 2, oy = (h - WORLD_H * scale) / 2;
    ctx.globalAlpha = 0.46;
    ctx.drawImage(this.mapCanvas, ox, oy, WORLD_W * scale, WORLD_H * scale);
    ctx.globalAlpha = 1;

    const dot = (x, y, color, r = 2.2) => {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(ox + x * scale, oy + y * scale, r, 0, TAU); ctx.fill();
    };
    for (const t of TASKS) {
      const st = game.taskState[t.id];
      const c = centerOf(t.tx, t.ty);
      dot(c.x, c.y, st.done ? "#5ce1c0" : "#ffd166", st.done ? 1.4 : 1.9);
    }
    if (game.sabotage) {
      const site = BOMB_SITES.find((s) => s.id === game.sabotage.siteId);
      const c = centerOf(site.tx, site.ty);
      ctx.strokeStyle = "rgba(255,70,60,0.85)";
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(ox + c.x * scale, oy + c.y * scale, 4 + Math.sin(performance.now() / 140) * 1.6, 0, TAU); ctx.stroke();
    }
    for (const p of game.players) {
      if (!p.alive) continue;
      if (p.isPlayer) {
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.arc(ox + p.x * scale, oy + p.y * scale, 3.1, 0, TAU); ctx.stroke();
        dot(p.x, p.y, p.color.body, 2.1);
      } else if (game.player?.role === "impostor" && p.role === "impostor") {
        dot(p.x, p.y, "#ff5a5f", 2.1);
      }
    }
    ctx.strokeStyle = "rgba(180,220,235,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  }
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp(((n >> 16) & 255) + amt, 0, 255);
  const g = clamp(((n >> 8) & 255) + amt, 0, 255);
  const b = clamp((n & 255) + amt, 0, 255);
  return `rgb(${r},${g},${b})`;
}

export function hexA(hex, a) {
  if (!hex || !hex.startsWith("#")) return hex;
  let n = parseInt(hex.slice(1), 16);
  if (hex.length === 4) {
    const r = (n >> 8) & 15, g = (n >> 4) & 15, b = n & 15;
    n = (r << 20) | (r << 16) | (g << 12) | (g << 8) | (b << 4) | b;
  }
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

function props() {
  const list = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (GRID[y][x] === "x") list.push({ x, y });
  return list;
}

function drawProp(ctx, t) {
  const px = t.x * TILE + 2, py = t.y * TILE + 2;
  const w = TILE - 4, h = TILE - 4;
  const v = hash(t.x, t.y);
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(px + 2, py + 3, w, h);
  if (v > 0.56) {
    ctx.fillStyle = "#242c31";
    roundRect(ctx, px, py, w, h, 2); ctx.fill();
    ctx.strokeStyle = "rgba(200,225,235,0.18)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.strokeStyle = "rgba(255,170,90,0.22)";
    ctx.beginPath(); ctx.moveTo(px + 4, py + 4); ctx.lineTo(px + w - 4, py + 4); ctx.stroke();
  } else {
    ctx.fillStyle = "#1b242a";
    roundRect(ctx, px, py, w, h, 2); ctx.fill();
    ctx.strokeStyle = "rgba(200,225,235,0.15)"; ctx.stroke();
    ctx.fillStyle = "rgba(255,200,130,0.22)";
    ctx.fillRect(px + 5, py + 5, w - 10, 2);
  }
  ctx.restore();
}

function drawBody(ctx, body, time) {
  ctx.save();
  ctx.translate(body.x, body.y);
  ctx.rotate(0.42);
  ctx.fillStyle = "rgba(120,10,18,0.35)";
  ctx.beginPath(); ctx.ellipse(0, 4, 17, 10, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = body.color.dark;
  roundRect(ctx, -12, -6, 24, 12, 6); ctx.fill();
  ctx.fillStyle = body.color.body;
  roundRect(ctx, -11, -7, 22, 11, 5); ctx.fill();
  ctx.fillStyle = "rgba(15,25,32,0.85)";
  roundRect(ctx, -3, -6, 9, 6, 3); ctx.fill();
  ctx.strokeStyle = "rgba(230,245,250,0.45)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-8, -3); ctx.lineTo(-3, 2); ctx.moveTo(-3, -3); ctx.lineTo(-8, 2); ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "rgba(255,155,150,0.8)";
  ctx.font = "600 7px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.fillText(body.name, body.x, body.y - 16);
  ctx.restore();
}

function drawBean(ctx, p, game, time) {
  const ghost = p.ghost && !p.alive;
  const bob = p.alive ? Math.sin(time * 7 + p.id * 2) * (Math.hypot(p.vx, p.vy) > 10 ? 1.2 : 0.4) : 0;
  const y = p.y + (ghost ? Math.sin(time * 2 + p.id) * 2 - 4 : bob);
  ctx.save();
  ctx.translate(p.x, y);

  if (!ghost) {
    ctx.fillStyle = "rgba(0,0,0,0.42)";
    ctx.beginPath(); ctx.ellipse(0, 9, 11, 5.5, 0, 0, TAU); ctx.fill();
  }

  ctx.globalAlpha = ghost ? 0.55 : 1;

  // backpack
  ctx.save();
  ctx.rotate(p.angle + Math.PI);
  ctx.fillStyle = p.color.dark;
  roundRect(ctx, 9, -6, 7, 12, 3); ctx.fill();
  ctx.restore();

  // body
  const g = ctx.createRadialGradient(-3, -4, 2, 0, 0, 13);
  g.addColorStop(0, p.color.body);
  g.addColorStop(1, p.color.dark);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, 0, 10.5, 12, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = "rgba(4,10,14,0.8)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // visor
  ctx.save();
  ctx.rotate(p.angle);
  ctx.fillStyle = p.color.visor;
  ctx.beginPath(); ctx.ellipse(5.6, 0, 5.6, 4.2, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath(); ctx.ellipse(4.2, -1.3, 2.2, 1.2, -0.3, 0, TAU); ctx.fill();
  ctx.restore();

  // gun
  if (p.alive && !p.reloading && p.ammo > 0) {
    ctx.save();
    ctx.rotate(p.angle);
    ctx.fillStyle = "#1a2229";
    roundRect(ctx, 9, 1.5, 10, 3.4, 1.4); ctx.fill();
    ctx.fillStyle = "#39444d";
    ctx.fillRect(17, 2.1, 4, 2.2);
    if (p.fireCd > 0.22) {
      ctx.fillStyle = "rgba(255,225,150,0.9)";
      ctx.beginPath(); ctx.arc(22, 3.2, 3.5, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  // player marker / impostor teammate
  if (p.isPlayer) {
    ctx.strokeStyle = p.role === "impostor" ? "rgba(255,80,80,0.85)" : "rgba(100,235,220,0.8)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.arc(0, 0, 15.5, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);
  } else if (game.player?.role === "impostor" && p.role === "impostor" && p.alive) {
    ctx.strokeStyle = "rgba(255,70,70,0.5)";
    ctx.lineWidth = 1.4;
    ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);
  }

  // name tag
  ctx.globalAlpha = ghost ? 0.5 : 1;
  ctx.font = "700 8px ui-monospace, SFMono-Regular, Menlo, monospace";
  const label = p.name;
  const tw = ctx.measureText(label).width;
  ctx.fillStyle = "rgba(3,8,12,0.62)";
  roundRect(ctx, -tw / 2 - 3, -25, tw + 6, 11, 3); ctx.fill();
  ctx.fillStyle = p.isPlayer ? "#eafffb" : "rgba(215,235,245,0.85)";
  ctx.textAlign = "center";
  ctx.fillText(label, 0, -17);
  ctx.restore();
}
