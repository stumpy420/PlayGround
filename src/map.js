export const TILE = 32;
export const COLS = 48;
export const ROWS = 30;
export const WORLD_W = COLS * TILE;
export const WORLD_H = ROWS * TILE;

export const ROOMS = [
  { id: "cafeteria", name: "CAFETERIA", x: 1, y: 1, w: 14, h: 8, floor: "#21303a", accent: "#ff9b5c" },
  { id: "armory", name: "ARMORY", x: 33, y: 1, w: 14, h: 7, floor: "#2a2933", accent: "#ff6b5c" },
  { id: "medbay", name: "MEDBAY", x: 1, y: 13, w: 9, h: 8, floor: "#1c3137", accent: "#5ce1c0" },
  { id: "reactor", name: "REACTOR", x: 1, y: 25, w: 13, h: 4, floor: "#342523", accent: "#ff5a3c" },
  { id: "server", name: "SERVER", x: 38, y: 14, w: 9, h: 8, floor: "#1c2a3e", accent: "#6aa8ff" },
  { id: "storage", name: "STORAGE", x: 18, y: 25, w: 12, h: 4, floor: "#2c2a21", accent: "#e5c36a" },
  { id: "cargo", name: "CARGO", x: 36, y: 25, w: 11, h: 4, floor: "#2b2434", accent: "#c49aff" },
  { id: "hub", name: "CENTRAL HUB", x: 18, y: 11, w: 14, h: 12, floor: "#202e39", accent: "#9fb4c6" },
];

const DOORS = {
  cafeteria: [["right", 4, 2], ["bottom", 6, 2]],
  armory: [["left", 3, 2], ["bottom", 5, 2]],
  medbay: [["top", 3, 2], ["right", 2, 2], ["bottom", 3, 2]],
  reactor: [["top", 5, 2], ["right", 1, 2]],
  server: [["top", 3, 2], ["left", 3, 2], ["bottom", 3, 2]],
  storage: [["top", 5, 2], ["left", 1, 2], ["right", 1, 2]],
  cargo: [["top", 4, 2], ["left", 1, 2]],
};

const PROPS = [
  { type: "counter", x: 4, y: 2, w: 5, h: 1 },
  { type: "table", x: 10, y: 5, w: 3, h: 2 },
  { type: "table", x: 2, y: 6, w: 3, h: 2 },
  { type: "rack", x: 34, y: 2, w: 3, h: 1 },
  { type: "rack", x: 42, y: 2, w: 3, h: 1 },
  { type: "crate", x: 34, y: 6, w: 1, h: 1 },
  { type: "crate", x: 45, y: 7, w: 1, h: 1 },
  { type: "bed", x: 2, y: 15, w: 2, h: 2 },
  { type: "bed", x: 2, y: 18, w: 2, h: 2 },
  { type: "rack", x: 39, y: 15, w: 2, h: 5 },
  { type: "rack", x: 43, y: 15, w: 2, h: 5 },
  { type: "crate", x: 19, y: 25, w: 3, h: 2 },
  { type: "crate", x: 27, y: 25, w: 3, h: 2 },
  { type: "crate", x: 25, y: 27, w: 2, h: 2 },
  { type: "container", x: 37, y: 26, w: 3, h: 2 },
  { type: "container", x: 42, y: 25, w: 3, h: 2 },
  { type: "core", x: 6, y: 26, w: 4, h: 2 },
  { type: "table", x: 23, y: 15, w: 2, h: 2 },
  { type: "crate", x: 18, y: 12, w: 2, h: 2 },
  { type: "crate", x: 29, y: 19, w: 2, h: 2 },
  { type: "console", x: 3, y: 2, w: 1, h: 1 },
  { type: "console", x: 38, y: 6, w: 1, h: 1 },
  { type: "console", x: 8, y: 14, w: 1, h: 1 },
  { type: "console", x: 46, y: 15, w: 1, h: 1 },
  { type: "console", x: 23, y: 27, w: 1, h: 1 },
  { type: "console", x: 12, y: 25, w: 1, h: 1 },
  { type: "console", x: 45, y: 26, w: 1, h: 1 },
  { type: "console", x: 26, y: 13, w: 1, h: 1 },
  { type: "console", x: 19, y: 10, w: 1, h: 1 },
  { type: "console", x: 12, y: 18, w: 1, h: 1 },
  { type: "console", x: 24, y: 22, w: 1, h: 1 },
  { type: "console", x: 33, y: 17, w: 1, h: 1 },
  { type: "emergency", x: 7, y: 4, w: 1, h: 1 },
];

export const TASKS = [
  { id: "brew", name: "Brew Rations", room: "Cafeteria", tx: 3, ty: 2, ax: 3, ay: 3 },
  { id: "audit", name: "Audit Arsenal", room: "Armory", tx: 38, ty: 6, ax: 38, ay: 5 },
  { id: "scan", name: "Scan Samples", room: "Medbay", tx: 8, ty: 14, ax: 8, ay: 15 },
  { id: "upload", name: "Upload Logs", room: "Server", tx: 46, ty: 15, ax: 45, ay: 15 },
  { id: "sort", name: "Sort Cargo", room: "Storage", tx: 23, ty: 27, ax: 23, ay: 26 },
  { id: "coolant", name: "Purge Coolant", room: "Reactor", tx: 12, ty: 25, ax: 12, ay: 26 },
  { id: "freight", name: "Secure Freight", room: "Cargo", tx: 45, ty: 26, ax: 45, ay: 27 },
  { id: "relay", name: "Recalibrate Relay", room: "Hub", tx: 26, ty: 13, ax: 26, ay: 14 },
  { id: "breaker", name: "Reset Breaker", room: "Top Corridor", tx: 19, ty: 10, ax: 19, ay: 11 },
  { id: "filter", name: "Swap Filters", room: "Medbay Corridor", tx: 12, ty: 18, ax: 12, ay: 19 },
  { id: "valve", name: "Seal Valve", room: "Hub Corridor", tx: 24, ty: 22, ax: 24, ay: 21 },
  { id: "uplink", name: "Patch Uplink", room: "Server Corridor", tx: 33, ty: 17, ax: 33, ay: 18 },
];

export const VENTS = [
  { id: 0, tx: 2, ty: 8, pair: 1, room: "Cafeteria" },
  { id: 1, tx: 29, ty: 28, pair: 0, room: "Storage" },
  { id: 2, tx: 9, ty: 16, pair: 3, room: "Medbay" },
  { id: 3, tx: 38, ty: 20, pair: 2, room: "Server" },
];

export const BOMB_SITES = [
  { id: "A", name: "REACTOR CORE", tx: 10, ty: 28, room: "Reactor" },
  { id: "B", name: "CARGO HOLD", tx: 41, ty: 28, room: "Cargo" },
];

export const EMERGENCY = { tx: 7, ty: 4, room: "Cafeteria" };

export const SPAWNS = [
  [5, 4], [6, 4], [8, 4], [9, 4], [12, 4], [13, 6], [12, 8],
];

export const ROOM_BY_ID = Object.fromEntries(ROOMS.map((r) => [r.id, r]));

function makeGrid() {
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill("."));
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1) g[y][x] = "#";
    }
  }
  for (const r of ROOMS) {
    if (!DOORS[r.id]) continue;
    for (let x = r.x - 1; x <= r.x + r.w; x++) {
      g[r.y - 1][x] = "#";
      g[r.y + r.h][x] = "#";
    }
    for (let y = r.y - 1; y <= r.y + r.h; y++) {
      g[y][r.x - 1] = "#";
      g[y][r.x + r.w] = "#";
    }
  }
  for (const r of ROOMS) {
    for (const [side, at, len] of DOORS[r.id] || []) {
      for (let i = 0; i < len; i++) {
        let x = r.x, y = r.y;
        if (side === "top") { x = r.x + at + i; y = r.y - 1; }
        if (side === "bottom") { x = r.x + at + i; y = r.y + r.h; }
        if (side === "left") { x = r.x - 1; y = r.y + at + i; }
        if (side === "right") { x = r.x + r.w; y = r.y + at + i; }
        if (x > 0 && y > 0 && x < COLS - 1 && y < ROWS - 1) g[y][x] = ".";
      }
    }
  }
  for (const p of PROPS) {
    for (let y = p.y; y < p.y + p.h; y++) {
      for (let x = p.x; x < p.x + p.w; x++) {
        if (g[y] && g[y][x] !== undefined) g[y][x] = "x";
      }
    }
  }
  return g;
}

export const GRID = makeGrid();

export function tileAt(cx, cy) {
  if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) return "#";
  return GRID[cy][cx];
}

export function isSolidTile(cx, cy) {
  return tileAt(cx, cy) !== ".";
}

export function isSolidAt(x, y) {
  return isSolidTile(Math.floor(x / TILE), Math.floor(y / TILE));
}

export function circleHitsWorld(x, y, r) {
  const minX = Math.floor((x - r) / TILE);
  const maxX = Math.floor((x + r) / TILE);
  const minY = Math.floor((y - r) / TILE);
  const maxY = Math.floor((y + r) / TILE);
  for (let cy = minY; cy <= maxY; cy++) {
    for (let cx = minX; cx <= maxX; cx++) {
      if (!isSolidTile(cx, cy)) continue;
      const rx = cx * TILE, ry = cy * TILE;
      const nx = Math.max(rx, Math.min(x, rx + TILE));
      const ny = Math.max(ry, Math.min(y, ry + TILE));
      const dx = x - nx, dy = y - ny;
      if (dx * dx + dy * dy < r * r) return true;
    }
  }
  return false;
}

export function lineClear(x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(dist / 10));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (isSolidAt(x1 + dx * t, y1 + dy * t)) return false;
  }
  return true;
}

export function centerOf(tx, ty) {
  return { x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE };
}

export function roomAt(x, y) {
  const tx = x / TILE, ty = y / TILE;
  for (const r of ROOMS) {
    if (tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h) return r;
  }
  return null;
}

export function roomNameAt(x, y) {
  return roomAt(x, y)?.name || "Corridor";
}

// --- A* navigation -------------------------------------------------------
const navW = COLS, navH = ROWS;
const DIRS = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414],
];

function walkable(cx, cy) {
  return cx > 0 && cy > 0 && cx < COLS - 1 && cy < ROWS - 1 && !isSolidTile(cx, cy);
}

class MinHeap {
  constructor() { this.a = []; }
  push(node) {
    const a = this.a; a.push(node);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p].f <= a[i].f) break;
      [a[p], a[i]] = [a[i], a[p]]; i = p;
    }
  }
  pop() {
    const a = this.a;
    if (!a.length) return null;
    const root = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1, r = l + 1;
        let s = i;
        if (l < a.length && a[l].f < a[s].f) s = l;
        if (r < a.length && a[r].f < a[s].f) s = r;
        if (s === i) break;
        [a[s], a[i]] = [a[i], a[s]]; i = s;
      }
    }
    return root;
  }
  get size() { return this.a.length; }
}

export function findPath(sx, sy, ex, ey) {
  let start = [Math.floor(sx / TILE), Math.floor(sy / TILE)];
  let goal = [Math.floor(ex / TILE), Math.floor(ey / TILE)];
  if (!walkable(goal[0], goal[1])) {
    let best = null, bestD = Infinity;
    for (let y = goal[1] - 2; y <= goal[1] + 2; y++) {
      for (let x = goal[0] - 2; x <= goal[0] + 2; x++) {
        if (!walkable(x, y)) continue;
        const d = Math.hypot(x - goal[0], y - goal[1]);
        if (d < bestD) { bestD = d; best = [x, y]; }
      }
    }
    if (!best) return [];
    goal = best;
  }
  const startKey = start[1] * navW + start[0];
  const goalKey = goal[1] * navW + goal[0];
  if (startKey === goalKey) return [{ x: ex, y: ey }];
  const open = new MinHeap();
  const came = new Map();
  const gScore = new Map([[startKey, 0]]);
  open.push({ x: start[0], y: start[1], f: 0 });
  const closed = new Set();
  let iterations = 0;
  while (open.size && iterations++ < 3000) {
    const cur = open.pop();
    const key = cur.y * navW + cur.x;
    if (closed.has(key)) continue;
    closed.add(key);
    if (key === goalKey) break;
    for (const [dx, dy, cost] of DIRS) {
      const nx = cur.x + dx, ny = cur.y + dy;
      if (!walkable(nx, ny)) continue;
      if (dx && dy && (!walkable(cur.x + dx, cur.y) || !walkable(cur.x, cur.y + dy))) continue;
      const nk = ny * navW + nx;
      if (closed.has(nk)) continue;
      const ng = (gScore.get(key) ?? Infinity) + cost;
      if (ng < (gScore.get(nk) ?? Infinity)) {
        gScore.set(nk, ng);
        came.set(nk, key);
        const h = Math.hypot(nx - goal[0], ny - goal[1]);
        open.push({ x: nx, y: ny, f: ng + h * 1.05 });
      }
    }
  }
  const path = [];
  let cur = goalKey;
  if (!came.has(cur) && cur !== startKey) return [];
  while (cur !== startKey) {
    const x = cur % navW, y = Math.floor(cur / navW);
    path.push({ x: (x + 0.5) * TILE, y: (y + 0.5) * TILE });
    cur = came.get(cur);
    if (cur === undefined) return [];
  }
  path.reverse();
  if (path.length) path[path.length - 1] = { x: ex, y: ey };
  return path;
}
