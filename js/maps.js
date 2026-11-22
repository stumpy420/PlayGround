// Procedural tactical compound generation, collision, raycasts, A* and map painting.

import { PALETTES } from './content.js';
import { clamp, mulberry32, rngInt, rngPick } from './util.js';

export const TILE = 40;
export const GW = 50;
export const GH = 34;
export const WORLD_W = GW * TILE;
export const WORLD_H = GH * TILE;

export const T_FLOOR = 0;
export const T_WALL = 1;
export const T_CRATE = 2;
export const T_BAGS = 3;
export const T_BARREL = 4;
export const T_PILLAR = 5;

const ROOM_W = 14;
const ROOM_H = 10;

const ROOM_NAMES = {
  dock: ['PIER 9', 'CARGO BAY', 'MANIFEST OFFICE', 'FUEL DEPOT', 'BERTH 4', 'CRANE CONTROL', 'COLD STORAGE', 'SECURITY', 'EXFIL'],
  desert: ['GATEHOUSE', 'MOTOR POOL', 'RADIO SHACK', 'ARMORY', 'BARRACKS', 'MESS HALL', 'GENERATOR', 'WATCHTOWER', 'EXFIL'],
  arctic: ['AIRLOCK', 'RELAY HALL', 'SERVER FARM', 'BUNK ROOM', 'GENERATOR', 'STORAGE', 'OBSERVATION', 'COMMS', 'EXFIL'],
  jungle: ['COURTYARD', 'WEST WING', 'RELIQUARY', 'BARRACKS', 'ARMORY', 'GARDEN', 'CRYPT', 'SHRINE', 'EXFIL'],
  urban: ['LOBBY', 'ARCHIVE', 'SERVER VAULT', 'LAB', 'SECURITY', 'HOLDING', 'MAINTENANCE', 'AUDIT', 'EXFIL'],
  foundry: ['FURNACE FLOOR', 'CRUCIBLE', 'MOLD HALL', 'CONTROL ROOM', 'SCRAP YARD', 'MACHINE SHOP', 'COOLANT', 'REFINERY', 'EXFIL'],
};

const DOOR_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];

function hash2(x, y, seed) {
  let h = Math.imul(x + 0x7ed55d16, 0x85ebca6b) ^ Math.imul(y + 0xc761c23c, 0xc2b2ae35) ^ Math.imul(seed + 0x165667b1, 0x27d4eb2f);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h ^= h >>> 12;
  return (h >>> 0) / 4294967296;
}

export function tileCenter(tx, ty) {
  return { x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 };
}

export class TacticalMap {
  constructor(mission) {
    this.mission = mission;
    this.palette = PALETTES[mission.palette] || PALETTES.dock;
    this.seed = mission.seed;
    this.grid = new Uint8Array(GW * GH).fill(T_WALL);
    this.hp = new Map();
    this.rooms = [];
    this.doors = [];
    this.decor = [];
    this.lights = [];
    this.floorShade = new Float32Array(GW * GH);
    this.onTileChange = null;
    this.canvas = null;
    this.ctx = null;
    this.minimap = null;
    this.spawn = { x: 0, y: 0 };
    this.extraction = { x: 0, y: 0 };
    this.intel = [];
    this.enemySpawns = [];
    this.playerSpawn = { x: 0, y: 0 };
    this.build();
  }

  idx(tx, ty) {
    return ty * GW + tx;
  }
  inside(tx, ty) {
    return tx >= 0 && ty >= 0 && tx < GW && ty < GH;
  }
  tile(tx, ty) {
    if (!this.inside(tx, ty)) return T_WALL;
    return this.grid[this.idx(tx, ty)];
  }
  setTile(tx, ty, v) {
    if (!this.inside(tx, ty)) return;
    this.grid[this.idx(tx, ty)] = v;
  }
  isSolid(tx, ty) {
    return this.tile(tx, ty) !== T_FLOOR;
  }
  isWall(tx, ty) {
    return this.tile(tx, ty) === T_WALL;
  }
  blocksSight(tx, ty) {
    return this.tile(tx, ty) !== T_FLOOR;
  }
  solidAt(x, y) {
    return this.isSolid(Math.floor(x / TILE), Math.floor(y / TILE));
  }
  roomCenter(room) {
    return { x: (room.x + room.w / 2) * TILE, y: (room.y + room.h / 2) * TILE };
  }

  build() {
    const rng = mulberry32(this.seed);
    const seed = this.seed;
    const rooms = [];
    for (let ry = 0; ry < 3; ry++) {
      for (let rx = 0; rx < 3; rx++) {
        const x = 2 + rx * 16;
        const y = 2 + ry * 12;
        rooms.push({ x, y, w: ROOM_W, h: ROOM_H, rx, ry, index: rooms.length, centerX: x + ROOM_W / 2, centerY: y + ROOM_H / 2 });
      }
    }
    this.rooms = rooms;
    const names = ROOM_NAMES[this.palette.id] || ROOM_NAMES.dock;
    rooms.forEach((room, i) => {
      room.name = names[i] || `SECTOR ${i + 1}`;
      for (let y = room.y + 1; y <= room.y + room.h - 2; y++) {
        for (let x = room.x + 1; x <= room.x + room.w - 2; x++) this.setTile(x, y, T_FLOOR);
      }
    });

    // Connect the room graph: spanning tree plus a few loops for flanking routes.
    const edges = [];
    for (let ry = 0; ry < 3; ry++) {
      for (let rx = 0; rx < 3; rx++) {
        if (rx < 2) edges.push([ry * 3 + rx, ry * 3 + rx + 1]);
        if (ry < 2) edges.push([ry * 3 + rx, (ry + 1) * 3 + rx]);
      }
    }
    const parent = rooms.map((_, i) => i);
    const find = (a) => (parent[a] === a ? a : (parent[a] = find(parent[a])));
    const shuffled = edges.slice().sort(() => rng() - 0.5);
    const chosen = [];
    for (const edge of shuffled) {
      const a = find(edge[0]);
      const b = find(edge[1]);
      if (a !== b) {
        parent[a] = b;
        chosen.push(edge);
      }
    }
    for (const edge of shuffled) {
      if (!chosen.some((e) => e[0] === edge[0] && e[1] === edge[1]) && rng() < 0.42) chosen.push(edge);
    }
    for (const [a, b] of chosen) {
      const ra = rooms[a];
      const rb = rooms[b];
      this.carveCorridor(ra.centerX, ra.centerY, rb.centerX, rb.centerY);
      if (ra.ry === rb.ry) {
        this.doors.push({ x: ra.x + ra.w - 1, y: ra.centerY, dir: 'e', room: ra.index });
        this.doors.push({ x: rb.x, y: rb.centerY, dir: 'w', room: rb.index });
      } else {
        this.doors.push({ x: ra.centerX, y: ra.y + ra.h - 1, dir: 's', room: ra.index });
        this.doors.push({ x: rb.centerX, y: rb.y, dir: 'n', room: rb.index });
      }
    }

    // Room personalities add visual and tactical variety.
    const personalities = ['supply', 'supply', 'open', 'office', 'open', 'supply', 'office', 'open', 'command'];
    rooms.forEach((room, i) => {
      room.personality = personalities[(i + Math.floor(rng() * 3)) % personalities.length];
      this.placeProps(room, rng, i);
    });

    // Guarantee connectivity around props by clearing rooms whose doors got sealed.
    this.clearBlockedDoors();
    this.paintDecor(rng);
    this.chooseObjectives(rng);
    this.computeFloorShades();
    this.renderStatic();
    this.minimap = this.buildMinimap();
  }

  carveCorridor(x1, y1, x2, y2) {
    const ax = Math.round(x1);
    const ay = Math.round(y1);
    const bx = Math.round(x2);
    const by = Math.round(y2);
    if (ay === by) {
      const y0 = ay - 1;
      for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
        this.setTile(x, y0, T_FLOOR);
        this.setTile(x, y0 + 1, T_FLOOR);
      }
    } else if (ax === bx) {
      const x0 = ax - 1;
      for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {
        this.setTile(x0, y, T_FLOOR);
        this.setTile(x0 + 1, y, T_FLOOR);
      }
    } else {
      // L-shaped corridor for the rare diagonal link.
      for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
        this.setTile(x, ay - 1, T_FLOOR);
        this.setTile(x, ay, T_FLOOR);
      }
      for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {
        this.setTile(bx - 1, y, T_FLOOR);
        this.setTile(bx, y, T_FLOOR);
      }
    }
  }

  placeProps(room, rng, roomIndex) {
    const cx = Math.round(room.centerX);
    const cy = Math.round(room.centerY);
    const interior = [];
    for (let y = room.y + 1; y <= room.y + room.h - 2; y++) {
      for (let x = room.x + 1; x <= room.x + room.w - 2; x++) {
        if (Math.abs(x - cx) <= 1 && Math.abs(y - cy) <= 1) continue;
        if (x === cx || y === cy) continue;
        interior.push([x, y]);
      }
    }
    const pieces = roomIndex === 0 ? 1 : rngInt(rng, 2, room.personality === 'supply' ? 6 : 4);
    const kinds = [];
    if (room.personality === 'supply') kinds.push(T_CRATE, T_CRATE, T_CRATE, T_BARREL, T_PILLAR);
    else if (room.personality === 'office') kinds.push(T_CRATE, T_PILLAR, T_BAGS);
    else if (room.personality === 'command') kinds.push(T_CRATE, T_BAGS, T_BARREL, T_PILLAR);
    else kinds.push(T_CRATE, T_BAGS, T_BARREL, T_CRATE, T_PILLAR);
    for (let i = 0; i < pieces; i++) {
      for (let attempt = 0; attempt < 40; attempt++) {
        const [x, y] = interior[Math.floor(rng() * interior.length)];
        const kind = rngPick(rng, kinds);
        if (this.tile(x, y) !== T_FLOOR) continue;
        if (this.isDoorApproach(x, y)) continue;
        let cells = [[x, y]];
        if ((kind === T_CRATE || kind === T_BAGS) && rng() < 0.55) {
          if (rng() < 0.5 && this.tile(x + 1, y) === T_FLOOR) cells.push([x + 1, y]);
          else if (this.tile(x, y + 1) === T_FLOOR) cells.push([x, y + 1]);
        }
        if (cells.some(([px, py]) => this.isDoorApproach(px, py))) continue;
        for (const [px, py] of cells) {
          this.setTile(px, py, kind);
          const hp = kind === T_CRATE ? 65 : kind === T_BAGS ? 130 : kind === T_BARREL ? 28 : 220;
          this.hp.set(this.idx(px, py), { hp, max: hp, type: kind });
        }
        break;
      }
    }
  }

  isDoorApproach(tx, ty) {
    for (const door of this.doors) {
      if (Math.abs(door.x - tx) <= 2 && Math.abs(door.y - ty) <= 2) return true;
    }
    return false;
  }

  clearBlockedDoors() {
    // A prop directly in front of a door is removed rather than risking a sealed route.
    for (const door of this.doors) {
      const dx = door.dir === 'e' ? -1 : door.dir === 'w' ? 1 : 0;
      const dy = door.dir === 's' ? -1 : door.dir === 'n' ? 1 : 0;
      for (let step = 1; step <= 2; step++) {
        const tx = door.x + dx * step;
        const ty = door.y + dy * step;
        if (this.isSolid(tx, ty) && this.tile(tx, ty) !== T_WALL) {
          this.setTile(tx, ty, T_FLOOR);
          this.hp.delete(this.idx(tx, ty));
        }
      }
    }
  }

  paintDecor(rng) {
    const pal = this.palette;
    this.decor = [];
    for (const room of this.rooms) {
      const x0 = room.x * TILE;
      const y0 = room.y * TILE;
      const w = room.w * TILE;
      const h = room.h * TILE;
      this.decor.push({ type: 'label', x: x0 + w / 2, y: y0 + h / 2 + 6, text: room.name, size: 15, rot: -0.06, alpha: 0.1, color: pal.accent });
      this.decor.push({ type: 'label', x: x0 + w / 2, y: y0 + h / 2 + 22, text: `SECTOR ${String(room.index + 1).padStart(2, '0')}`, size: 7, rot: -0.06, alpha: 0.09, color: '#dbeafe' });
      for (let i = 0; i < 10; i++) {
        this.decor.push({
          type: rng() < 0.55 ? 'stain' : 'grime',
          x: x0 + 30 + rng() * (w - 60),
          y: y0 + 30 + rng() * (h - 60),
          r: 4 + rng() * 26,
          alpha: 0.04 + rng() * 0.08,
        });
      }
      for (let i = 0; i < 3; i++) {
        const sx = x0 + 36 + rng() * (w - 72);
        const sy = y0 + 36 + rng() * (h - 72);
        const points = [];
        let px = sx;
        let py = sy;
        const ang = rng() * Math.PI * 2;
        for (let p = 0; p < 4; p++) {
          points.push([px, py]);
          px += Math.cos(ang + rng() * 0.8 - 0.4) * (6 + rng() * 14);
          py += Math.sin(ang + rng() * 0.8 - 0.4) * (6 + rng() * 14);
        }
        this.decor.push({ type: 'crack', points, alpha: 0.16 });
      }
      this.lights.push({ x: x0 + w * (0.25 + rng() * 0.5), y: y0 + h * (0.25 + rng() * 0.5), r: 130 + rng() * 110, color: pal.accent, alpha: 0.06 + rng() * 0.04 });
    }
    // Hazard markings just inside each door.
    for (const door of this.doors) {
      const inward = door.dir === 'e' ? [-1, 0] : door.dir === 'w' ? [1, 0] : door.dir === 's' ? [0, -1] : [0, 1];
      for (let i = 1; i <= 2; i++) {
        const tx = door.x + inward[0] * i;
        const ty = door.y + inward[1] * i;
        this.decor.push({ type: 'hazard', x: tx * TILE, y: ty * TILE, horizontal: door.dir === 'e' || door.dir === 'w', alpha: 0.28 });
      }
    }
    // Painted lane arrows and bay numbers in corridors.
    for (let i = 0; i < 10; i++) {
      const x = 60 + rng() * (WORLD_W - 120);
      const y = 60 + rng() * (WORLD_H - 120);
      if (this.solidAt(x, y)) continue;
      this.decor.push({ type: 'arrow', x, y, rot: Math.floor(rng() * 4) * (Math.PI / 2), alpha: 0.07 });
    }
    for (const light of this.lights) {
      this.decor.push({ type: 'lamp', x: light.x, y: light.y, color: light.color });
    }
  }

  chooseObjectives(rng) {
    const spawnRoom = this.rooms[6];
    const exfilRoom = this.rooms[2];
    const p = this.roomCenter(spawnRoom);
    this.playerSpawn = { x: p.x, y: p.y };
    this.spawn = { ...this.playerSpawn };
    const e = this.roomCenter(exfilRoom);
    this.extraction = { x: e.x, y: e.y };
    const intelRooms = [this.rooms[1], this.rooms[5], this.rooms[7], this.rooms[3], this.rooms[8], this.rooms[4]];
    this.intel = [];
    for (let i = 0; i < this.mission.intel; i++) {
      const room = intelRooms[i % intelRooms.length];
      const pos = this.randomFreeSpot(room, rng);
      this.intel.push({ x: pos.x, y: pos.y, room: room.index, taken: false, pulse: rng() * 6 });
    }
    const enemyRooms = this.rooms.filter((r) => r.index !== spawnRoom.index);
    const totalEnemies = Object.values(this.mission.enemies).reduce((a, b) => a + b, 0);
    this.enemySpawns = [];
    const types = [];
    for (const [type, count] of Object.entries(this.mission.enemies)) for (let i = 0; i < count; i++) types.push(type);
    for (let i = 0; i < totalEnemies; i++) {
      const room = enemyRooms[i % enemyRooms.length];
      let pos = this.randomFreeSpot(room, rng);
      let guard = 0;
      while (pos && Math.hypot(pos.x - p.x, pos.y - p.y) < 520 && guard++ < 20) pos = this.randomFreeSpot(room, rng);
      if (!pos) continue;
      this.enemySpawns.push({ x: pos.x, y: pos.y, type: types[i % types.length], room: room.index });
    }
    this.spawnRoom = spawnRoom;
    this.exfilRoom = exfilRoom;
  }

  randomFreeSpot(room, rng) {
    for (let i = 0; i < 80; i++) {
      const tx = rngInt(rng, room.x + 1, room.x + room.w - 2);
      const ty = rngInt(rng, room.y + 1, room.y + room.h - 2);
      if (this.tile(tx, ty) === T_FLOOR) {
        const c = tileCenter(tx, ty);
        return { x: c.x + (rng() - 0.5) * 14, y: c.y + (rng() - 0.5) * 14 };
      }
    }
    return null;
  }

  computeFloorShades() {
    for (let y = 0; y < GH; y++) {
      for (let x = 0; x < GW; x++) {
        this.floorShade[this.idx(x, y)] = hash2(x, y, this.seed);
      }
    }
  }

  // ---------------------------------------------------------------- collision
  resolveCircle(x, y, r) {
    let hit = false;
    for (let pass = 0; pass < 2; pass++) {
      const minX = Math.floor((x - r) / TILE);
      const maxX = Math.floor((x + r) / TILE);
      const minY = Math.floor((y - r) / TILE);
      const maxY = Math.floor((y + r) / TILE);
      for (let ty = minY; ty <= maxY; ty++) {
        for (let tx = minX; tx <= maxX; tx++) {
          if (!this.isSolid(tx, ty)) continue;
          const rx = tx * TILE;
          const ry = ty * TILE;
          const cx = clamp(x, rx, rx + TILE);
          const cy = clamp(y, ry, ry + TILE);
          const dx = x - cx;
          const dy = y - cy;
          const d2 = dx * dx + dy * dy;
          if (d2 >= r * r) continue;
          hit = true;
          const d = Math.sqrt(d2);
          if (d > 0.0001) {
            x = cx + (dx / d) * r;
            y = cy + (dy / d) * r;
          } else {
            // Center is inside a tile: push out along the shallowest axis.
            const left = x - rx;
            const right = rx + TILE - x;
            const top = y - ry;
            const bottom = ry + TILE - y;
            const min = Math.min(left, right, top, bottom);
            if (min === left) x = rx - r;
            else if (min === right) x = rx + TILE + r;
            else if (min === top) y = ry - r;
            else y = ry + TILE + r;
          }
        }
      }
    }
    return { x, y, hit };
  }

  // Amanatides & Woo grid traversal. Returns the first blocking tile.
  raycast(x1, y1, x2, y2, maxDist = 2600, sightOnly = false) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const full = Math.hypot(dx, dy);
    if (full < 0.0001) return null;
    const nx = dx / full;
    const ny = dy / full;
    const limit = Math.min(full, maxDist);
    let tx = Math.floor(x1 / TILE);
    let ty = Math.floor(y1 / TILE);
    const startTx = tx;
    const startTy = ty;
    const stepX = nx > 0 ? 1 : -1;
    const stepY = ny > 0 ? 1 : -1;
    const deltaX = Math.abs(nx) < 1e-8 ? Infinity : Math.abs(TILE / nx);
    const deltaY = Math.abs(ny) < 1e-8 ? Infinity : Math.abs(TILE / ny);
    let tMaxX = nx > 0 ? ((tx + 1) * TILE - x1) / nx : nx < 0 ? (tx * TILE - x1) / nx : Infinity;
    let tMaxY = ny > 0 ? ((ty + 1) * TILE - y1) / ny : ny < 0 ? (ty * TILE - y1) / ny : Infinity;
    let t = 0;
    let side = 0;
    let guard = 0;
    while (t <= limit && guard++ < 600) {
      if (!(tx === startTx && ty === startTy)) {
        const tile = this.tile(tx, ty);
        const blocks = sightOnly ? tile === T_WALL : tile !== T_FLOOR;
        if (blocks) {
          return {
            x: x1 + nx * t,
            y: y1 + ny * t,
            tx,
            ty,
            tile,
            dist: t,
            nx: side === 0 ? -stepX : 0,
            ny: side === 1 ? -stepY : 0,
            side,
          };
        }
      }
      if (tMaxX < tMaxY) {
        tx += stepX;
        t = tMaxX;
        tMaxX += deltaX;
        side = 0;
      } else {
        ty += stepY;
        t = tMaxY;
        tMaxY += deltaY;
        side = 1;
      }
    }
    return null;
  }

  los(x1, y1, x2, y2, sightOnly = false) {
    const hit = this.raycast(x1, y1, x2, y2, 2600, sightOnly);
    if (!hit) return true;
    return hit.dist >= Math.hypot(x2 - x1, y2 - y1) - 1;
  }

  damageTile(tx, ty, amount) {
    const key = this.idx(tx, ty);
    const prop = this.hp.get(key);
    if (!prop) return null;
    prop.hp -= amount;
    if (prop.hp > 0) return { destroyed: false, type: prop.type };
    const type = prop.type;
    this.setTile(tx, ty, T_FLOOR);
    this.hp.delete(key);
    this.redrawArea(tx, ty);
    return { destroyed: true, type };
  }

  redrawArea(tx, ty) {
    if (!this.ctx) return;
    const pad = 2;
    const x = (tx - pad) * TILE;
    const y = (ty - pad) * TILE;
    const w = (pad * 2 + 1) * TILE;
    const h = (pad * 2 + 1) * TILE;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(x, y, w, h);
    this.ctx.clip();
    for (let py = ty - pad; py <= ty + pad; py++) {
      for (let px = tx - pad; px <= tx + pad; px++) {
        if (!this.inside(px, py)) continue;
        this.drawTile(this.ctx, px, py, true);
      }
    }
    this.ctx.restore();
    if (this.onTileChange) this.onTileChange(tx, ty);
  }

  // ---------------------------------------------------------------- pathfinding
  findPath(x1, y1, x2, y2) {
    let sx = clamp(Math.floor(x1 / TILE), 1, GW - 2);
    let sy = clamp(Math.floor(y1 / TILE), 1, GH - 2);
    let ex = clamp(Math.floor(x2 / TILE), 1, GW - 2);
    let ey = clamp(Math.floor(y2 / TILE), 1, GH - 2);
    if (this.isSolid(sx, sy)) {
      const spot = this.nearestFree(sx, sy);
      if (!spot) return [];
      sx = spot.x;
      sy = spot.y;
    }
    if (this.isSolid(ex, ey)) {
      const spot = this.nearestFree(ex, ey);
      if (!spot) return [];
      ex = spot.x;
      ey = spot.y;
    }
    if (sx === ex && sy === ey) return [{ x: x2, y: y2 }];
    const size = GW * GH;
    const gScore = new Float32Array(size).fill(Infinity);
    const came = new Int32Array(size).fill(-1);
    const closed = new Uint8Array(size);
    const open = [];
    const start = sy * GW + sx;
    const goal = ey * GW + ex;
    const h = (x, y) => {
      const dx = Math.abs(x - ex);
      const dy = Math.abs(y - ey);
      return (dx + dy) + (Math.SQRT2 - 2) * Math.min(dx, dy);
    };
    const push = (node, f) => {
      open.push({ node, f });
      let i = open.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (open[p].f <= open[i].f) break;
        [open[p], open[i]] = [open[i], open[p]];
        i = p;
      }
    };
    const pop = () => {
      const top = open[0];
      const last = open.pop();
      if (open.length) {
        open[0] = last;
        let i = 0;
        for (;;) {
          const l = i * 2 + 1;
          const r = l + 1;
          let m = i;
          if (l < open.length && open[l].f < open[m].f) m = l;
          if (r < open.length && open[r].f < open[m].f) m = r;
          if (m === i) break;
          [open[m], open[i]] = [open[i], open[m]];
          i = m;
        }
      }
      return top;
    };
    gScore[start] = 0;
    push(start, h(sx, sy));
    let guard = 0;
    while (open.length && guard++ < 4000) {
      const { node } = pop();
      if (closed[node]) continue;
      closed[node] = 1;
      if (node === goal) break;
      const cx = node % GW;
      const cy = (node / GW) | 0;
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          if (!ox && !oy) continue;
          const nx = cx + ox;
          const ny = cy + oy;
          if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
          if (this.isSolid(nx, ny)) continue;
          if (ox && oy && (this.isSolid(cx + ox, cy) || this.isSolid(cx, cy + oy))) continue;
          const n = ny * GW + nx;
          if (closed[n]) continue;
          const cost = ox && oy ? Math.SQRT2 : 1;
          const tentative = gScore[node] + cost;
          if (tentative < gScore[n]) {
            gScore[n] = tentative;
            came[n] = node;
            push(n, tentative + h(nx, ny));
          }
        }
      }
    }
    if (came[goal] === -1 && goal !== start) return [];
    const path = [];
    let cur = goal;
    let guard2 = 0;
    while (cur !== start && cur !== -1 && guard2++ < 3000) {
      const cx = cur % GW;
      const cy = (cur / GW) | 0;
      path.push({ x: cx * TILE + TILE / 2, y: cy * TILE + TILE / 2 });
      cur = came[cur];
    }
    path.reverse();
    // String-pull the path using sight checks.
    const smoothed = [];
    let anchor = { x: x1, y: y1 };
    let i = 0;
    while (i < path.length) {
      let best = i;
      for (let j = path.length - 1; j > i; j--) {
        if (this.los(anchor.x, anchor.y, path[j].x, path[j].y, false)) {
          best = j;
          break;
        }
      }
      smoothed.push(path[best]);
      anchor = path[best];
      i = best + 1;
    }
    if (smoothed.length) smoothed[smoothed.length - 1] = { x: x2, y: y2 };
    return smoothed;
  }

  nearestFree(tx, ty) {
    for (let r = 1; r <= 5; r++) {
      for (let oy = -r; oy <= r; oy++) {
        for (let ox = -r; ox <= r; ox++) {
          if (Math.max(Math.abs(ox), Math.abs(oy)) !== r) continue;
          const x = tx + ox;
          const y = ty + oy;
          if (this.inside(x, y) && !this.isSolid(x, y)) return { x, y };
        }
      }
    }
    return null;
  }

  // ---------------------------------------------------------------- painting
  computeRoomAt(x, y) {
    const tx = x / TILE;
    const ty = y / TILE;
    return this.rooms.find((r) => tx >= r.x && tx <= r.x + r.w && ty >= r.y && ty <= r.y + r.h) || null;
  }

  renderStatic() {
    const canvas = document.createElement('canvas');
    canvas.width = WORLD_W;
    canvas.height = WORLD_H;
    const ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.ctx = ctx;
    ctx.fillStyle = this.palette.fog;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    for (let ty = 0; ty < GH; ty++) {
      for (let tx = 0; tx < GW; tx++) {
        if (this.tile(tx, ty) !== T_WALL) this.drawFloorTile(ctx, tx, ty);
      }
    }
    this.drawFloorDecor(ctx);
    // Wall shadows first so they fall onto the floor.
    ctx.save();
    for (let ty = 0; ty < GH; ty++) {
      for (let tx = 0; tx < GW; tx++) {
        if (this.tile(tx, ty) !== T_WALL) continue;
        if (!this.isWall(tx, ty + 1)) continue;
        ctx.fillStyle = 'rgba(0,0,0,0.24)';
        ctx.fillRect(tx * TILE, (ty + 1) * TILE - 4, TILE, 10);
      }
    }
    ctx.restore();
    for (let ty = 0; ty < GH; ty++) {
      for (let tx = 0; tx < GW; tx++) {
        const t = this.tile(tx, ty);
        if (t === T_WALL) this.drawWallTile(ctx, tx, ty);
        else if (t !== T_FLOOR) this.drawProp(ctx, tx, ty, t);
      }
    }
    // Baked ambient light pools.
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const light of this.lights) {
      const g = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.r);
      g.addColorStop(0, this.hexAlpha(light.color, light.alpha));
      g.addColorStop(0.55, this.hexAlpha(light.color, light.alpha * 0.35));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(light.x, light.y, light.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    this.drawVignetteBake(ctx);
  }

  hexAlpha(hex, alpha) {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  drawFloorTile(ctx, tx, ty, local = false) {
    const pal = this.palette;
    const shade = this.floorShade[this.idx(tx, ty)] || 0;
    const x = tx * TILE;
    const y = ty * TILE;
    const color = shade < 0.28 ? pal.floor2 : shade > 0.8 ? pal.floor3 : pal.floor;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = 'rgba(0,0,0,0.16)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
    if (shade > 0.94) {
      ctx.fillStyle = 'rgba(255,255,255,0.025)';
      ctx.fillRect(x + 6, y + 6, TILE - 12, TILE - 12);
    }
    if (shade < 0.08) {
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(x + 3, y + 3, 12, 3);
      ctx.fillRect(x + 20, y + 28, 9, 2);
    }
  }

  drawFloorDecor(ctx) {
    ctx.save();
    for (const d of this.decor) {
      if (d.type === 'stain') {
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r);
        g.addColorStop(0, `rgba(0,0,0,${d.alpha})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (d.type === 'grime') {
        ctx.fillStyle = `rgba(190,210,225,${d.alpha * 0.35})`;
        ctx.beginPath();
        ctx.ellipse(d.x, d.y, d.r * 0.55, d.r * 0.18, d.x * 0.02, 0, Math.PI * 2);
        ctx.fill();
      } else if (d.type === 'crack') {
        ctx.strokeStyle = `rgba(0,0,0,${d.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        d.points.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
        ctx.stroke();
      } else if (d.type === 'label') {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rot);
        ctx.fillStyle = this.hexAlpha(d.color, d.alpha);
        ctx.font = `800 ${d.size}px "Arial Narrow", "Roboto Condensed", sans-serif`;
        ctx.textAlign = 'center';
        ctx.letterSpacing = '3px';
        ctx.fillText(d.text, 0, 0);
        ctx.restore();
      } else if (d.type === 'hazard') {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.globalAlpha = d.alpha;
        if (!d.horizontal) ctx.rotate(Math.PI / 2);
        ctx.fillStyle = this.palette.accent;
        for (let i = -2; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(i * 12, 0);
          ctx.lineTo(i * 12 + 6, 0);
          ctx.lineTo(i * 12 + 6 - 8, TILE);
          ctx.lineTo(i * 12 - 8, TILE);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      } else if (d.type === 'arrow') {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rot);
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = '#dbeafe';
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(8, 4);
        ctx.lineTo(2, 2);
        ctx.lineTo(2, 14);
        ctx.lineTo(-2, 14);
        ctx.lineTo(-2, 2);
        ctx.lineTo(-8, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (d.type === 'lamp') {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(0, 5, 14, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0b1016';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = this.hexAlpha(d.color, 0.85);
        ctx.beginPath();
        ctx.arc(0, 0, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  drawWallTile(ctx, tx, ty) {
    const pal = this.palette;
    const x = tx * TILE;
    const y = ty * TILE;
    const shade = hash2(tx, ty, this.seed + 5);
    const top = this.tile(tx, ty - 1) === T_WALL;
    const left = this.tile(tx - 1, ty) === T_WALL;
    ctx.fillStyle = pal.wallEdge;
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = pal.wall;
    ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
    ctx.fillStyle = top ? pal.wall : pal.wallTop;
    ctx.fillRect(x + 2, y + 2, TILE - 4, top ? 5 : 8);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(x + 2, y + TILE - 6, TILE - 4, 4);
    if (!left) {
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(x + 2, y + 2, 2, TILE - 4);
    }
    // Panel seams / rivets.
    if (shade > 0.45) {
      ctx.strokeStyle = 'rgba(0,0,0,0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 12);
      ctx.lineTo(x + TILE - 8, y + 12);
      ctx.stroke();
    }
    if (shade > 0.86) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(x + 8 + i * 12, y + 30, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Occasional hazard paint on wall base.
    if (shade > 0.72 && shade < 0.78) {
      ctx.fillStyle = this.hexAlpha(pal.accent, 0.35);
      ctx.fillRect(x + 6, y + TILE - 14, 8, 3);
      ctx.fillRect(x + 20, y + TILE - 14, 10, 3);
    }
  }

  drawProp(ctx, tx, ty, type) {
    const x = tx * TILE;
    const y = ty * TILE;
    const cx = x + TILE / 2;
    const cy = y + TILE / 2;
    const pal = this.palette;
    ctx.save();
    if (type === T_CRATE) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(cx + 4, y + TILE - 3, 17, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4a3826';
      ctx.fillRect(x + 4, y + 5, TILE - 8, TILE - 10);
      ctx.fillStyle = '#6b5236';
      ctx.fillRect(x + 5, y + 6, TILE - 10, TILE - 14);
      ctx.fillStyle = '#826542';
      ctx.fillRect(x + 7, y + 7, TILE - 14, 8);
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 5.5, y + 6.5, TILE - 11, TILE - 15);
      ctx.strokeStyle = 'rgba(20,12,6,0.5)';
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 12);
      ctx.lineTo(x + TILE - 8, y + TILE - 9);
      ctx.stroke();
      ctx.fillStyle = this.hexAlpha(pal.accent, 0.55);
      ctx.fillRect(x + 8, y + TILE - 12, 9, 2.5);
      ctx.fillRect(x + 20, y + TILE - 12, 9, 2.5);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(x + 8, y + 8, 6, 2);
    } else if (type === T_BAGS) {
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.beginPath();
      ctx.ellipse(cx + 3, y + TILE - 3, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      const tan = this.palette.id === 'desert' ? '#9c8459' : this.palette.id === 'jungle' ? '#5c6b43' : '#7b735c';
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i === 1 ? '#8d8468' : tan;
        ctx.beginPath();
        ctx.ellipse(x + 8 + (i % 2) * 10, y + 12 + i * 7, 11, 7, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(20,20,14,0.45)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.ellipse(x + 12, y + 11, 6, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === T_BARREL) {
      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      ctx.beginPath();
      ctx.ellipse(cx + 4, y + TILE - 4, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6d3325';
      ctx.beginPath();
      ctx.arc(cx, cy, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2f1a13';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#8a4631';
      ctx.beginPath();
      ctx.arc(cx, cy, 11.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = this.hexAlpha(pal.accent, 0.75);
      ctx.fillRect(cx - 6, cy - 1.5, 12, 3);
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.beginPath();
      ctx.arc(cx - 4, cy - 4, 3.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === T_PILLAR) {
      ctx.fillStyle = 'rgba(0,0,0,0.36)';
      ctx.fillRect(x + 6, y + TILE - 5, TILE - 10, 6);
      ctx.fillStyle = '#3c4147';
      ctx.fillRect(x + 6, y + 4, TILE - 12, TILE - 9);
      ctx.fillStyle = '#565d64';
      ctx.fillRect(x + 8, y + 6, TILE - 16, TILE - 15);
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 8.5, y + 6.5, TILE - 17, TILE - 16);
      ctx.fillStyle = this.hexAlpha(pal.accent, 0.25);
      ctx.fillRect(x + 10, y + 9, TILE - 20, 2);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(x + 9, y + 8, 2, TILE - 18);
    }
    ctx.restore();
  }

  drawVignetteBake(ctx) {
    const g = ctx.createRadialGradient(WORLD_W / 2, WORLD_H / 2, WORLD_W * 0.28, WORLD_W / 2, WORLD_H / 2, WORLD_W * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  }

  buildMinimap() {
    const scale = 4;
    const c = document.createElement('canvas');
    c.width = GW * scale;
    c.height = GH * scale;
    const ctx = c.getContext('2d');
    const pal = this.palette;
    ctx.fillStyle = 'rgba(5,10,16,0.9)';
    ctx.fillRect(0, 0, c.width, c.height);
    for (let ty = 0; ty < GH; ty++) {
      for (let tx = 0; tx < GW; tx++) {
        const t = this.tile(tx, ty);
        if (t === T_FLOOR) {
          ctx.fillStyle = this.hexAlpha(pal.floor3, 0.8);
          ctx.fillRect(tx * scale, ty * scale, scale, scale);
        } else if (t === T_WALL) {
          ctx.fillStyle = this.hexAlpha(pal.wall, 0.9);
          ctx.fillRect(tx * scale, ty * scale, scale, scale);
        } else {
          ctx.fillStyle = this.hexAlpha(pal.accent, 0.55);
          ctx.fillRect(tx * scale, ty * scale, scale, scale);
        }
      }
    }
    return c;
  }

  drawMinimap(ctx, w, h, player, enemies, extraction, intel, active) {
    if (!this.minimap) return;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(this.minimap, 0, 0, w, h);
    const sx = w / WORLD_W;
    const sy = h / WORLD_H;
    for (const item of intel) {
      if (item.taken) continue;
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(item.x * sx - 1.5, item.y * sy - 1.5, 3, 3);
    }
    if (active) {
      const pulse = 0.55 + Math.sin(performance.now() / 260) * 0.35;
      ctx.strokeStyle = `rgba(74,222,128,${pulse})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(extraction.x * sx, extraction.y * sy, 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const e of enemies) {
      if (e.dead) continue;
      const known = e.alert > 0.4;
      ctx.fillStyle = known ? 'rgba(248,113,113,0.95)' : 'rgba(148,163,184,0.4)';
      ctx.beginPath();
      ctx.arc(e.x * sx, e.y * sy, known ? 2 : 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.save();
    ctx.translate(player.x * sx, player.y * sy);
    ctx.rotate(player.angle);
    ctx.fillStyle = '#67e8f9';
    ctx.beginPath();
    ctx.moveTo(4.5, 0);
    ctx.lineTo(-3, 3);
    ctx.lineTo(-3, -3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

export function buildMap(mission) {
  return new TacticalMap(mission);
}
