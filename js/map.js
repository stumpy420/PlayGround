import {
  TAU, clamp, dist, circleRect, segmentHitsRect, rayRect, mulberry32, pointInRect
} from './util.js';

export const MAP_W = 1800;
export const MAP_H = 1200;
export const AGENT_R = 15;

export const WALLS = [
  // outer
  { x: 0, y: 0, w: 1800, h: 40 },
  { x: 0, y: 1160, w: 1800, h: 40 },
  { x: 0, y: 0, w: 40, h: 1200 },
  { x: 1760, y: 0, w: 40, h: 1200 },
  // left column x=420
  { x: 420, y: 40, w: 40, h: 100 },
  { x: 420, y: 220, w: 40, h: 340 },
  { x: 420, y: 640, w: 40, h: 340 },
  { x: 420, y: 1060, w: 40, h: 100 },
  // right column x=1160
  { x: 1160, y: 40, w: 40, h: 160 },
  { x: 1160, y: 320, w: 40, h: 180 },
  { x: 1160, y: 600, w: 40, h: 100 },
  { x: 1160, y: 800, w: 40, h: 180 },
  { x: 1160, y: 1060, w: 40, h: 100 },
  // office / top divider y=360
  { x: 40, y: 360, w: 120, h: 40 },
  { x: 260, y: 360, w: 160, h: 40 },
  // mid top y=360
  { x: 460, y: 360, w: 140, h: 40 },
  { x: 700, y: 360, w: 200, h: 40 },
  { x: 1000, y: 360, w: 160, h: 40 },
  // A site bottom y=480
  { x: 1200, y: 480, w: 160, h: 40 },
  { x: 1460, y: 480, w: 300, h: 40 },
  // mid bottom y=840
  { x: 460, y: 840, w: 140, h: 40 },
  { x: 700, y: 840, w: 200, h: 40 },
  { x: 1000, y: 840, w: 160, h: 40 },
  // B site top y=840
  { x: 1200, y: 840, w: 160, h: 40 },
  { x: 1460, y: 840, w: 300, h: 40 }
];

export const CRATES = [
  // office
  { x: 90, y: 90, w: 100, h: 55, type: 'desk' },
  { x: 315, y: 60, w: 55, h: 90, type: 'cabinet' },
  // top corridor
  { x: 640, y: 90, w: 90, h: 90, type: 'crate' },
  { x: 1000, y: 230, w: 80, h: 80, type: 'crate' },
  { x: 840, y: 250, w: 60, h: 60, type: 'crate' },
  // mid
  { x: 760, y: 500, w: 120, h: 120, type: 'container' },
  { x: 980, y: 650, w: 100, h: 100, type: 'crate' },
  { x: 600, y: 700, w: 80, h: 80, type: 'crate' },
  { x: 1010, y: 450, w: 70, h: 70, type: 'crate' },
  // tunnels
  { x: 700, y: 940, w: 100, h: 100, type: 'container' },
  { x: 1040, y: 920, w: 80, h: 80, type: 'crate' },
  { x: 880, y: 1060, w: 70, h: 70, type: 'crate' },
  // long
  { x: 1230, y: 560, w: 110, h: 90, type: 'container' },
  { x: 1600, y: 680, w: 100, h: 100, type: 'crate' },
  { x: 1520, y: 790, w: 80, h: 50, type: 'crate' },
  // A site
  { x: 1300, y: 100, w: 110, h: 110, type: 'container' },
  { x: 1580, y: 90, w: 80, h: 80, type: 'crate' },
  { x: 1610, y: 300, w: 90, h: 90, type: 'crate' },
  // B site
  { x: 1240, y: 900, w: 100, h: 100, type: 'container' },
  { x: 1600, y: 1030, w: 110, h: 80, type: 'crate' },
  { x: 1460, y: 1090, w: 70, h: 50, type: 'crate' },
  // left wing
  { x: 120, y: 500, w: 80, h: 80, type: 'crate' },
  { x: 300, y: 700, w: 70, h: 70, type: 'crate' },
  // CT spawn
  { x: 100, y: 940, w: 70, h: 55, type: 'desk' },
  { x: 330, y: 1060, w: 60, h: 60, type: 'crate' }
];

export const ZONES = [
  { x: 40, y: 40, w: 380, h: 320, name: 'OFFICE', tint: 'rgba(70,95,85,.08)' },
  { x: 40, y: 360, w: 380, h: 520, name: 'CONNECTOR', tint: 'rgba(120,100,70,.05)' },
  { x: 40, y: 880, w: 380, h: 280, name: 'CT SPAWN', tint: 'rgba(70,110,130,.10)' },
  { x: 460, y: 40, w: 700, h: 320, name: 'UPPER MID', tint: 'rgba(120,105,75,.06)' },
  { x: 460, y: 360, w: 700, h: 480, name: 'MID', tint: 'rgba(140,115,70,.05)' },
  { x: 460, y: 840, w: 700, h: 320, name: 'TUNNELS', tint: 'rgba(70,85,95,.09)' },
  { x: 1200, y: 40, w: 560, h: 440, name: 'SITE A', tint: 'rgba(145,60,50,.10)' },
  { x: 1200, y: 480, w: 560, h: 360, name: 'LONG', tint: 'rgba(120,100,65,.06)' },
  { x: 1200, y: 840, w: 560, h: 320, name: 'SITE B', tint: 'rgba(90,95,120,.07)' }
];

export const STATION_DEFS = [
  { id: 1, name: 'WIRES', x: 200, y: 180, type: 'wires', zone: 'OFFICE', desc: 'Re-route the comms array.' },
  { id: 2, name: 'DECRYPT', x: 820, y: 180, type: 'sequence', zone: 'UPPER MID', desc: 'Decrypt the planted device telemetry.' },
  { id: 3, name: 'VALVE', x: 920, y: 600, type: 'timing', zone: 'MID', desc: 'Stabilise the coolant pressure.' },
  { id: 4, name: 'SCAN', x: 1520, y: 980, type: 'hold', zone: 'SITE B', desc: 'Run a biometric sweep.' },
  { id: 5, name: 'BREAKER', x: 1460, y: 640, type: 'sequence', zone: 'LONG', desc: 'Restore the site power grid.' }
];

export const BOMB_SITE = { x: 1480, y: 250, r: 150 };
export const EMERGENCY = { x: 250, y: 1115, r: 34 };
export const SPAWNS = [
  { x: 220, y: 960 }, { x: 290, y: 1000 }, { x: 220, y: 1040 },
  { x: 120, y: 1060 }, { x: 260, y: 1100 }, { x: 390, y: 940 }
];

const ALL_RECTS = [...WALLS, ...CRATES];

export class World {
  constructor() {
    this.w = MAP_W; this.h = MAP_H;
    this.rects = ALL_RECTS;
    this.walls = WALLS;
    this.crates = CRATES;
    this.zones = ZONES;
    this.stations = STATION_DEFS;
    this.bombSite = BOMB_SITE;
    this.emergency = EMERGENCY;
    this.spawns = SPAWNS;
    this.grid = null;
    this.staticCanvas = null;
    this.fogPattern = null;
  }

  collides(x, y, r = AGENT_R) {
    if (x < r || y < r || x > this.w - r || y > this.h - r) return true;
    for (const rect of this.rects) if (circleRect(x, y, r, rect)) return true;
    return false;
  }

  moveCircle(ent, dx, dy, r = AGENT_R) {
    let nx = ent.x + dx;
    if (!this.collides(nx, ent.y, r)) ent.x = nx;
    let ny = ent.y + dy;
    if (!this.collides(ent.x, ny, r)) ent.y = ny;
    ent.x = clamp(ent.x, r, this.w - r);
    ent.y = clamp(ent.y, r, this.h - r);
  }

  los(x1, y1, x2, y2, pad = 0) {
    for (const rect of this.rects) {
      if (segmentHitsRect(x1, y1, x2, y2, rect, pad)) return false;
    }
    return true;
  }

  // Farthest visible point along a direction, up to maxDist.
  castRay(ox, oy, dx, dy, maxDist) {
    let best = maxDist;
    for (const rect of this.rects) {
      const t = rayRect(ox, oy, dx, dy, rect, 0);
      if (t < best) best = t;
    }
    return best;
  }

  visibilityPolygon(x, y, radius, rays = 150) {
    const pts = [];
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * TAU;
      const dx = Math.cos(a), dy = Math.sin(a);
      const d = this.castRay(x, y, dx, dy, radius);
      pts.push([x + dx * d, y + dy * d]);
    }
    return pts;
  }

  nearestWalkable(x, y) {
    if (!this.collides(x, y, AGENT_R + 3)) return { x, y };
    for (let r = 12; r <= 120; r += 12) {
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU;
        const nx = x + Math.cos(a) * r, ny = y + Math.sin(a) * r;
        if (!this.collides(nx, ny, AGENT_R + 3)) return { x: nx, y: ny };
      }
    }
    return { x, y };
  }

  buildGrid() {
    const cell = 30;
    const cols = Math.ceil(this.w / cell);
    const rows = Math.ceil(this.h / cell);
    const walk = new Uint8Array(cols * rows);
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const x = gx * cell + cell / 2, y = gy * cell + cell / 2;
        walk[gy * cols + gx] = this.collides(x, y, AGENT_R + 2) ? 0 : 1;
      }
    }
    this.grid = { cell, cols, rows, walk };
  }

  gridIndex(x, y) {
    const g = this.grid;
    const gx = clamp(Math.floor(x / g.cell), 0, g.cols - 1);
    const gy = clamp(Math.floor(y / g.cell), 0, g.rows - 1);
    return { gx, gy, idx: gy * g.cols + gx };
  }

  walkableCell(x, y) {
    const g = this.grid;
    const { gx, gy, idx } = this.gridIndex(x, y);
    if (g.walk[idx]) return { gx, gy, idx };
    for (let r = 1; r <= 5; r++) {
      for (let oy = -r; oy <= r; oy++) {
        for (let ox = -r; ox <= r; ox++) {
          const nx = gx + ox, ny = gy + oy;
          if (nx < 0 || ny < 0 || nx >= g.cols || ny >= g.rows) continue;
          const i = ny * g.cols + nx;
          if (g.walk[i]) return { gx: nx, gy: ny, idx: i };
        }
      }
    }
    return null;
  }

  findPath(sx, sy, tx, ty) {
    if (!this.grid) this.buildGrid();
    const g = this.grid;
    const start = this.walkableCell(sx, sy);
    const goal = this.walkableCell(tx, ty);
    if (!start || !goal) return [];
    if (start.idx === goal.idx) return [{ x: tx, y: ty }];
    const cols = g.cols, rows = g.rows, walk = g.walk;
    const open = [start.idx];
    const openSet = new Set(open);
    const came = new Int32Array(cols * rows).fill(-1);
    const gScore = new Float32Array(cols * rows).fill(Infinity);
    const fScore = new Float32Array(cols * rows).fill(Infinity);
    gScore[start.idx] = 0;
    const h = (idx) => {
      const x = idx % cols, y = (idx / cols) | 0;
      return Math.hypot(x - goal.gx, y - goal.gy);
    };
    fScore[start.idx] = h(start.idx);
    const dirs = [
      [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
      [1, 1, 1.4142], [1, -1, 1.4142], [-1, 1, 1.4142], [-1, -1, 1.4142]
    ];
    let guard = 0;
    while (open.length && guard++ < 6000) {
      let bestI = 0;
      for (let i = 1; i < open.length; i++) if (fScore[open[i]] < fScore[open[bestI]]) bestI = i;
      const cur = open[bestI];
      open.splice(bestI, 1);
      openSet.delete(cur);
      if (cur === goal.idx) {
        const cells = [];
        let n = cur;
        while (n !== -1) { cells.push(n); n = came[n]; }
        cells.reverse();
        const pts = cells.map(idx => ({
          x: (idx % cols) * g.cell + g.cell / 2,
          y: ((idx / cols) | 0) * g.cell + g.cell / 2
        }));
        pts[pts.length - 1] = { x: tx, y: ty };
        return this.smoothPath(sx, sy, pts);
      }
      const cx = cur % cols, cy = (cur / cols) | 0;
      for (const [dx, dy, cost] of dirs) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const ni = ny * cols + nx;
        if (!walk[ni]) continue;
        if (dx && dy && (!walk[cy * cols + nx] || !walk[ny * cols + cx])) continue;
        const tentative = gScore[cur] + cost;
        if (tentative < gScore[ni]) {
          came[ni] = cur;
          gScore[ni] = tentative;
          fScore[ni] = tentative + h(ni);
          if (!openSet.has(ni)) { open.push(ni); openSet.add(ni); }
        }
      }
    }
    return [];
  }

  smoothPath(sx, sy, pts) {
    const out = [];
    let cx = sx, cy = sy, i = 0;
    while (i < pts.length) {
      let far = i;
      for (let j = pts.length - 1; j >= i; j--) {
        if (this.los(cx, cy, pts[j].x, pts[j].y, AGENT_R + 3)) { far = j; break; }
      }
      const p = pts[far];
      out.push(p);
      cx = p.x; cy = p.y;
      i = far + 1;
    }
    return out;
  }

  randomWalkableNear(x, y, minR = 80, maxR = 360) {
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * TAU, r = minR + Math.random() * (maxR - minR);
      const nx = clamp(x + Math.cos(a) * r, 50, this.w - 50);
      const ny = clamp(y + Math.sin(a) * r, 50, this.h - 50);
      if (!this.collides(nx, ny, AGENT_R + 6)) return { x: nx, y: ny };
    }
    const p = this.spawns[Math.floor(Math.random() * this.spawns.length)];
    return { x: p.x, y: p.y };
  }

  zoneAt(x, y) {
    for (const z of ZONES) if (pointInRect(x, y, z)) return z.name;
    return 'THE MAP';
  }

  buildStatic() {
    const c = document.createElement('canvas');
    c.width = MAP_W; c.height = MAP_H;
    const g = c.getContext('2d');
    const rng = mulberry32(0xC5A1);
    // base sand
    g.fillStyle = '#b6a07a';
    g.fillRect(0, 0, MAP_W, MAP_H);
    // broad tonal patches
    for (let i = 0; i < 70; i++) {
      const x = rng() * MAP_W, y = rng() * MAP_H, r = 60 + rng() * 260;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      const warm = rng() > .5;
      grad.addColorStop(0, warm ? 'rgba(196,168,124,.16)' : 'rgba(112,105,88,.12)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }
    // zone tint + labels
    for (const z of ZONES) {
      g.fillStyle = z.tint;
      g.fillRect(z.x, z.y, z.w, z.h);
      g.save();
      g.globalAlpha = .13;
      g.fillStyle = '#3c3428';
      g.font = '800 26px ui-monospace, monospace';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.letterSpacing = '6px';
      g.fillText(z.name, z.x + z.w / 2, z.y + z.h / 2);
      g.restore();
    }
    // tile seams
    g.strokeStyle = 'rgba(64,52,36,.13)';
    g.lineWidth = 1;
    for (let x = 0; x < MAP_W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, MAP_H); g.stroke(); }
    for (let y = 0; y < MAP_H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(MAP_W, y); g.stroke(); }
    // cracks and stains
    for (let i = 0; i < 120; i++) {
      const x = 50 + rng() * (MAP_W - 100), y = 50 + rng() * (MAP_H - 100);
      if (this.collides(x, y, 4)) continue;
      g.strokeStyle = `rgba(70,58,42,${.06 + rng() * .1})`;
      g.lineWidth = .7 + rng();
      g.beginPath(); g.moveTo(x, y);
      let px = x, py = y;
      for (let s = 0; s < 4; s++) { px += (rng() - .5) * 30; py += (rng() - .5) * 30; g.lineTo(px, py); }
      g.stroke();
    }
    // door thresholds
    const doors = [
      [420, 140, 40, 80], [420, 560, 40, 80], [420, 980, 40, 80],
      [160, 360, 100, 40], [600, 360, 100, 40], [900, 360, 100, 40],
      [600, 840, 100, 40], [900, 840, 100, 40],
      [1160, 200, 40, 120], [1160, 500, 40, 100], [1160, 700, 40, 100], [1160, 980, 40, 80],
      [1360, 480, 100, 40], [1360, 840, 100, 40]
    ];
    for (const [x, y, w, h] of doors) {
      g.fillStyle = 'rgba(50,44,34,.18)';
      g.fillRect(x, y, w, h);
      g.strokeStyle = 'rgba(232,199,141,.25)';
      g.setLineDash([5, 5]);
      g.lineWidth = 1.5;
      g.strokeRect(x + 2, y + 2, w - 4, h - 4);
      g.setLineDash([]);
    }
    // bomb site
    g.save();
    g.translate(BOMB_SITE.x, BOMB_SITE.y);
    const bg = g.createRadialGradient(0, 0, 10, 0, 0, BOMB_SITE.r);
    bg.addColorStop(0, 'rgba(210,52,52,.18)');
    bg.addColorStop(1, 'rgba(210,52,52,0)');
    g.fillStyle = bg; g.beginPath(); g.arc(0, 0, BOMB_SITE.r, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(200,52,52,.42)';
    g.lineWidth = 3; g.setLineDash([14, 10]);
    g.beginPath(); g.arc(0, 0, BOMB_SITE.r, 0, TAU); g.stroke();
    g.setLineDash([]);
    g.fillStyle = 'rgba(170,40,40,.2)';
    g.font = '900 150px ui-monospace, monospace';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('A', 0, 8);
    g.fillStyle = 'rgba(220,190,150,.34)';
    g.font = '800 13px ui-monospace, monospace';
    g.letterSpacing = '4px';
    g.fillText('BOMB SITE', 0, BOMB_SITE.r - 22);
    g.restore();
    // CT spawn marking
    g.save();
    g.strokeStyle = 'rgba(95,227,208,.25)';
    g.lineWidth = 2; g.setLineDash([10, 8]);
    g.strokeRect(90, 910, 300, 220);
    g.setLineDash([]);
    g.fillStyle = 'rgba(95,227,208,.24)';
    g.font = '800 14px ui-monospace, monospace';
    g.textAlign = 'left';
    g.fillText('CT DEPLOY', 100, 930);
    g.restore();
    // spawn pads
    for (const s of SPAWNS) {
      g.strokeStyle = 'rgba(95,227,208,.18)';
      g.lineWidth = 1.5;
      g.beginPath(); g.arc(s.x, s.y, 18, 0, TAU); g.stroke();
    }
    // emergency panel
    g.save();
    g.translate(EMERGENCY.x, EMERGENCY.y);
    g.fillStyle = '#2b2f2b'; g.fillRect(-20, -20, 40, 34);
    g.fillStyle = '#5d161c'; g.fillRect(-13, -13, 26, 20);
    g.fillStyle = '#ff4d5e'; g.beginPath(); g.arc(0, -3, 5, 0, TAU); g.fill();
    g.fillStyle = 'rgba(220,210,190,.6)'; g.font = '700 7px ui-monospace, monospace';
    g.textAlign = 'center'; g.fillText('EMERGENCY', 0, 22);
    g.restore();
    // station consoles
    for (const st of STATION_DEFS) {
      g.save();
      g.translate(st.x, st.y);
      g.fillStyle = 'rgba(0,0,0,.32)';
      g.beginPath(); g.ellipse(4, 9, 28, 18, 0, 0, TAU); g.fill();
      g.fillStyle = '#252b2b'; g.fillRect(-26, -17, 52, 34);
      g.strokeStyle = '#4d5858'; g.lineWidth = 2; g.strokeRect(-26, -17, 52, 34);
      g.fillStyle = '#0b1b1c'; g.fillRect(-20, -12, 40, 20);
      const sg = g.createLinearGradient(-20, 0, 20, 0);
      sg.addColorStop(0, 'rgba(95,227,208,.12)');
      sg.addColorStop(.5, 'rgba(95,227,208,.5)');
      sg.addColorStop(1, 'rgba(95,227,208,.12)');
      g.fillStyle = sg; g.fillRect(-18, -10, 36, 16);
      g.fillStyle = '#dffcf6'; g.font = '800 6px ui-monospace, monospace';
      g.textAlign = 'center'; g.fillText(st.name, 0, 0);
      g.fillStyle = 'rgba(220,210,190,.4)'; g.font = '700 7px ui-monospace, monospace';
      g.fillText(String(st.id), 0, 15);
      g.restore();
    }
    // wall shadows
    g.save();
    g.fillStyle = 'rgba(20,16,12,.34)';
    for (const r of WALLS) g.fillRect(r.x + 9, r.y + 11, r.w, r.h);
    for (const r of CRATES) g.fillRect(r.x + 7, r.y + 9, r.w, r.h);
    g.restore();
    // walls
    for (const r of WALLS) drawWall(g, r);
    // crates / props
    for (const r of CRATES) drawProp(g, r);
    // sandbags near A
    drawSandbags(g, 1370, 340, 3);
    drawSandbags(g, 1580, 470, 2);
    drawSandbags(g, 560, 470, 2);
    // scattered debris
    for (let i = 0; i < 160; i++) {
      const x = 50 + rng() * (MAP_W - 100), y = 50 + rng() * (MAP_H - 100);
      if (this.collides(x, y, 3)) continue;
      g.fillStyle = `rgba(60,50,36,${.08 + rng() * .13})`;
      g.fillRect(x, y, 1 + rng() * 3, 1 + rng() * 2);
    }
    this.staticCanvas = c;
  }

  drawStatic(ctx, cam) {
    if (!this.staticCanvas) this.buildStatic();
    ctx.drawImage(this.staticCanvas, 0, 0);
  }
}

function drawWall(g, r) {
  // side
  g.fillStyle = '#4b4133';
  g.fillRect(r.x, r.y, r.w, r.h);
  // top face
  g.fillStyle = '#8b7858';
  g.fillRect(r.x + 3, r.y + 3, r.w - 6, r.h - 6);
  g.fillStyle = 'rgba(255,238,200,.10)';
  g.fillRect(r.x + 3, r.y + 3, r.w - 6, 2);
  g.fillStyle = 'rgba(35,28,20,.20)';
  g.fillRect(r.x + 3, r.y + r.h - 5, r.w - 6, 2);
  // concrete seams
  g.strokeStyle = 'rgba(45,38,28,.22)';
  g.lineWidth = 1;
  if (r.w > r.h) {
    for (let x = r.x + 34; x < r.x + r.w; x += 42) {
      g.beginPath(); g.moveTo(x, r.y + 3); g.lineTo(x, r.y + r.h - 3); g.stroke();
    }
  } else {
    for (let y = r.y + 34; y < r.y + r.h; y += 42) {
      g.beginPath(); g.moveTo(r.x + 3, y); g.lineTo(r.x + r.w - 3, y); g.stroke();
    }
  }
}

function drawProp(g, r) {
  const t = r.type;
  g.save();
  if (t === 'container') {
    g.fillStyle = '#3c4a4a'; g.fillRect(r.x, r.y, r.w, r.h);
    g.fillStyle = '#566868'; g.fillRect(r.x + 3, r.y + 3, r.w - 6, r.h - 6);
    g.strokeStyle = 'rgba(20,26,26,.5)'; g.lineWidth = 2;
    for (let x = r.x + 12; x < r.x + r.w - 6; x += 14) {
      g.beginPath(); g.moveTo(x, r.y + 5); g.lineTo(x, r.y + r.h - 5); g.stroke();
    }
    g.fillStyle = 'rgba(232,199,141,.35)';
    g.font = '800 9px ui-monospace, monospace';
    g.fillText('CARGO', r.x + 8, r.y + r.h - 9);
  } else if (t === 'desk') {
    g.fillStyle = '#4a3b2a'; g.fillRect(r.x, r.y, r.w, r.h);
    g.fillStyle = '#80623c'; g.fillRect(r.x + 3, r.y + 3, r.w - 6, r.h - 6);
    g.fillStyle = 'rgba(20,14,8,.28)'; g.fillRect(r.x + 8, r.y + 8, r.w - 16, r.h - 20);
    g.fillStyle = 'rgba(95,227,208,.35)'; g.fillRect(r.x + 12, r.y + 12, 16, 10);
  } else if (t === 'cabinet') {
    g.fillStyle = '#3b3b34'; g.fillRect(r.x, r.y, r.w, r.h);
    g.fillStyle = '#5c5d4f'; g.fillRect(r.x + 3, r.y + 3, r.w - 6, r.h - 6);
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.strokeRect(r.x + 8, r.y + 8, r.w - 16, r.h - 16);
  } else {
    // wooden crate
    g.fillStyle = '#5c4127'; g.fillRect(r.x, r.y, r.w, r.h);
    g.fillStyle = '#8a6439'; g.fillRect(r.x + 3, r.y + 3, r.w - 6, r.h - 6);
    g.strokeStyle = 'rgba(48,30,15,.5)'; g.lineWidth = 3;
    g.strokeRect(r.x + 7, r.y + 7, r.w - 14, r.h - 14);
    g.beginPath();
    g.moveTo(r.x + 8, r.y + 8); g.lineTo(r.x + r.w - 8, r.y + r.h - 8);
    g.moveTo(r.x + r.w - 8, r.y + 8); g.lineTo(r.x + 8, r.y + r.h - 8);
    g.stroke();
    g.fillStyle = 'rgba(232,199,141,.28)';
    g.fillRect(r.x + 6, r.y + 6, 14, 2);
  }
  g.restore();
}

function drawSandbags(g, x, y, n) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < 2; j++) {
      g.fillStyle = '#8d7b56';
      g.beginPath();
      g.ellipse(x + i * 38, y + j * 17 + (i % 2) * 5, 21, 11, 0, 0, TAU);
      g.fill();
      g.strokeStyle = 'rgba(60,48,30,.4)'; g.lineWidth = 1; g.stroke();
    }
  }
}
