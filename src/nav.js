// Lightweight grid navigation and 2D visibility helpers for the Dust Protocol map.

export function segmentHitsBox(ax, az, bx, bz, box, pad = 0) {
  const minX = box.minX - pad;
  const maxX = box.maxX + pad;
  const minZ = box.minZ - pad;
  const maxZ = box.maxZ + pad;
  let t0 = 0;
  let t1 = 1;
  const dx = bx - ax;
  const dz = bz - az;
  const clip = (p, q) => {
    if (Math.abs(p) < 1e-9) return q >= 0;
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
    return true;
  };
  if (clip(-dx, ax - minX) && clip(dx, maxX - ax) && clip(-dz, az - minZ) && clip(dz, maxZ - az)) return t1 >= t0;
  return false;
}

export function segmentBlocked(ax, az, bx, bz, colliders, { pad = 0, minHeight = 0 } = {}) {
  for (const c of colliders) {
    if ((c.height ?? 99) < minHeight) continue;
    if (segmentHitsBox(ax, az, bx, bz, c, pad)) return true;
  }
  return false;
}

class Heap {
  constructor() { this.a = []; }
  push(node) {
    const a = this.a;
    a.push(node);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p].f <= a[i].f) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l].f < a[m].f) m = l;
        if (r < a.length && a[r].f < a[m].f) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
  get size() { return this.a.length; }
}

export class NavGrid {
  constructor(colliders, { minX = -29, maxX = 29, minZ = -29, maxZ = 29, cell = 1, pad = 0.5 } = {}) {
    this.minX = minX;
    this.maxX = maxX;
    this.minZ = minZ;
    this.maxZ = maxZ;
    this.cell = cell;
    this.cols = Math.ceil((maxX - minX) / cell) + 1;
    this.rows = Math.ceil((maxZ - minZ) / cell) + 1;
    this.blocked = new Uint8Array(this.cols * this.rows);
    for (let z = 0; z < this.rows; z++) {
      for (let x = 0; x < this.cols; x++) {
        const wx = this.minX + x * cell;
        const wz = this.minZ + z * cell;
        for (const c of colliders) {
          if (wx > c.minX - pad && wx < c.maxX + pad && wz > c.minZ - pad && wz < c.maxZ + pad) {
            this.blocked[z * this.cols + x] = 1;
            break;
          }
        }
      }
    }
  }

  index(x, z) { return z * this.cols + x; }
  inside(x, z) { return x >= 0 && z >= 0 && x < this.cols && z < this.rows; }
  walkable(x, z) { return this.inside(x, z) && this.blocked[this.index(x, z)] === 0; }

  toCell(wx, wz) {
    return {
      x: Math.max(0, Math.min(this.cols - 1, Math.round((wx - this.minX) / this.cell))),
      z: Math.max(0, Math.min(this.rows - 1, Math.round((wz - this.minZ) / this.cell))),
    };
  }
  toWorld(x, z) {
    return { x: this.minX + x * this.cell, z: this.minZ + z * this.cell };
  }

  nearestWalkable(x, z, radius = 8) {
    if (this.walkable(x, z)) return { x, z };
    for (let r = 1; r <= radius; r++) {
      for (let dz = -r; dz <= r; dz++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
          const nx = x + dx;
          const nz = z + dz;
          if (this.walkable(nx, nz)) return { x: nx, z: nz };
        }
      }
    }
    return null;
  }

  lineClear(x0, z0, x1, z1) {
    let dx = Math.abs(x1 - x0);
    let dz = Math.abs(z1 - z0);
    const sx = x0 < x1 ? 1 : -1;
    const sz = z0 < z1 ? 1 : -1;
    let err = dx - dz;
    let x = x0;
    let z = z0;
    for (let guard = 0; guard < 300; guard++) {
      if (!this.walkable(x, z)) return false;
      if (x === x1 && z === z1) return true;
      const e2 = err * 2;
      if (e2 > -dz) { err -= dz; x += sx; }
      if (e2 < dx) { err += dx; z += sz; }
    }
    return false;
  }

  findPath(from, to, { maxIterations = 9000 } = {}) {
    const s = this.nearestWalkable(...Object.values(this.toCell(from.x, from.z)));
    const g = this.nearestWalkable(...Object.values(this.toCell(to.x, to.z)));
    if (!s || !g) return [];
    if (s.x === g.x && s.z === g.z) return [this.toWorld(g.x, g.z)];

    const size = this.cols * this.rows;
    const gScore = new Float32Array(size).fill(Infinity);
    const came = new Int32Array(size).fill(-1);
    const closed = new Uint8Array(size);
    const open = new Heap();
    const start = this.index(s.x, s.z);
    const goal = this.index(g.x, g.z);
    const h = (x, z) => {
      const dx = Math.abs(x - g.x);
      const dz = Math.abs(z - g.z);
      return (dx + dz) + (Math.SQRT2 - 2) * Math.min(dx, dz);
    };
    gScore[start] = 0;
    open.push({ x: s.x, z: s.z, i: start, f: h(s.x, s.z) });
    const dirs = [
      [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
      [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
    ];
    let iterations = 0;
    while (open.size && iterations++ < maxIterations) {
      const cur = open.pop();
      if (closed[cur.i]) continue;
      if (cur.i === goal) {
        const cells = [];
        let c = cur.i;
        while (c !== -1) {
          cells.push(c);
          c = came[c];
        }
        cells.reverse();
        const raw = cells.map((i) => this.toWorld(i % this.cols, (i / this.cols) | 0));
        // string-pull the path
        const out = [];
        let anchor = 0;
        out.push(raw[0]);
        for (let i = 1; i < raw.length; i++) {
          const next = raw[i];
          const last = raw[anchor];
          if (!this.lineClear(this.toCell(last.x, last.z).x, this.toCell(last.x, last.z).z, this.toCell(next.x, next.z).x, this.toCell(next.x, next.z).z)) {
            out.push(raw[i - 1]);
            anchor = i - 1;
          }
        }
        if (out.length === 1 || out[out.length - 1].x !== raw[raw.length - 1].x || out[out.length - 1].z !== raw[raw.length - 1].z) out.push(raw[raw.length - 1]);
        return out;
      }
      closed[cur.i] = 1;
      for (const [dx, dz, cost] of dirs) {
        const nx = cur.x + dx;
        const nz = cur.z + dz;
        if (!this.walkable(nx, nz)) continue;
        if (dx && dz && (!this.walkable(cur.x + dx, cur.z) || !this.walkable(cur.x, cur.z + dz))) continue;
        const ni = this.index(nx, nz);
        if (closed[ni]) continue;
        const ng = gScore[cur.i] + cost;
        if (ng + 1e-4 < gScore[ni]) {
          gScore[ni] = ng;
          came[ni] = cur.i;
          open.push({ x: nx, z: nz, i: ni, f: ng + h(nx, nz) });
        }
      }
    }
    return [];
  }

  randomWalkable() {
    for (let i = 0; i < 400; i++) {
      const x = (Math.random() * this.cols) | 0;
      const z = (Math.random() * this.rows) | 0;
      if (this.walkable(x, z)) return this.toWorld(x, z);
    }
    return { x: 0, z: 0 };
  }
}
