import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { icon } from '../core/data.js';
import { WATER_LEVEL } from './terrain.js';

export const MATS = {
  stone: new THREE.MeshStandardMaterial({ color: 0x7b8389, roughness: 0.96, flatShading: true }),
  stoneDark: new THREE.MeshStandardMaterial({ color: 0x545c63, roughness: 0.98, flatShading: true }),
  stoneLight: new THREE.MeshStandardMaterial({ color: 0x9aa4aa, roughness: 0.95, flatShading: true }),
  wood: new THREE.MeshStandardMaterial({ color: 0x6b4a2f, roughness: 0.92, flatShading: true }),
  woodDark: new THREE.MeshStandardMaterial({ color: 0x3f2c1d, roughness: 0.95, flatShading: true }),
  woodLight: new THREE.MeshStandardMaterial({ color: 0x8d6742, roughness: 0.92, flatShading: true }),
  plaster: new THREE.MeshStandardMaterial({ color: 0xc9c0aa, roughness: 0.98, flatShading: true }),
  plasterDark: new THREE.MeshStandardMaterial({ color: 0xa89d86, roughness: 0.98, flatShading: true }),
  roof: new THREE.MeshStandardMaterial({ color: 0xdde7ed, roughness: 0.9, flatShading: true }),
  roofDark: new THREE.MeshStandardMaterial({ color: 0x4a3a30, roughness: 0.92, flatShading: true }),
  roofTeal: new THREE.MeshStandardMaterial({ color: 0x3f6a70, roughness: 0.9, flatShading: true }),
  window: new THREE.MeshStandardMaterial({ color: 0x3a2a18, emissive: 0xffb45a, emissiveIntensity: 0.55, roughness: 0.5 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xc9a25c, metalness: 0.65, roughness: 0.35, flatShading: true }),
  iron: new THREE.MeshStandardMaterial({ color: 0x4e585e, metalness: 0.7, roughness: 0.45, flatShading: true }),
  ice: new THREE.MeshStandardMaterial({ color: 0x9fd8ec, transparent: true, opacity: 0.72, roughness: 0.15, metalness: 0.1, flatShading: true }),
  iceDeep: new THREE.MeshStandardMaterial({ color: 0x4d8ca8, transparent: true, opacity: 0.85, roughness: 0.25, flatShading: true }),
  dirt: new THREE.MeshStandardMaterial({ color: 0x5d4b37, roughness: 1, flatShading: true }),
  clothRed: new THREE.MeshStandardMaterial({ color: 0x8d3b35, roughness: 0.98, side: THREE.DoubleSide }),
  clothTeal: new THREE.MeshStandardMaterial({ color: 0x2b6a70, roughness: 0.98, side: THREE.DoubleSide }),
  clothBlue: new THREE.MeshStandardMaterial({ color: 0x365a83, roughness: 0.98, side: THREE.DoubleSide }),
  clothCream: new THREE.MeshStandardMaterial({ color: 0xd8c9a5, roughness: 0.98, side: THREE.DoubleSide }),
  bone: new THREE.MeshStandardMaterial({ color: 0xd6cdb6, roughness: 0.9, flatShading: true }),
  crystal: new THREE.MeshStandardMaterial({ color: 0x79d7e8, emissive: 0x1e6d84, emissiveIntensity: 0.8, roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.88, flatShading: true }),
  lava: new THREE.MeshStandardMaterial({ color: 0xff6a24, emissive: 0xff4a10, emissiveIntensity: 1.4, roughness: 0.6 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x080b0d, roughness: 1 }),
};

export class Batch {
  constructor() { this.buckets = new Map(); this.count = 0; }
  add(geo, matKey, pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1]) {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]));
    m.compose(new THREE.Vector3(pos[0], pos[1], pos[2]), q, new THREE.Vector3(scale[0], scale[1], scale[2]));
    geo.applyMatrix4(m);
    if (!this.buckets.has(matKey)) this.buckets.set(matKey, []);
    this.buckets.get(matKey).push(geo);
    this.count++;
    return geo;
  }
  box(matKey, pos, size, rot = [0, 0, 0]) { return this.add(new THREE.BoxGeometry(size[0], size[1], size[2]), matKey, pos, rot); }
  cyl(matKey, pos, rTop, rBot, h, seg = 8, rot = [0, 0, 0]) { return this.add(new THREE.CylinderGeometry(rTop, rBot, h, seg), matKey, pos, rot); }
  sphere(matKey, pos, r, seg = 8, scale = [1, 1, 1]) { return this.add(new THREE.SphereGeometry(r, seg, Math.max(5, seg - 2)), matKey, pos, [0, 0, 0], scale); }
  cone(matKey, pos, r, h, seg = 8, rot = [0, 0, 0]) { return this.add(new THREE.ConeGeometry(r, h, seg), matKey, pos, rot); }
  build(parent, shadow = true) {
    for (const [key, geos] of this.buckets) {
      if (!geos.length) continue;
      // Mixed indexed / non-indexed primitives (boxes vs dodecahedra) cannot be
      // merged, so normalise the whole bucket to non-indexed first.
      const mixed = geos.some(g => !g.index);
      const prepared = mixed ? geos.map(g => (g.index ? g.toNonIndexed() : g)) : geos;
      const merged = mergeGeometries(prepared, false);
      geos.forEach(g => g.dispose());
      if (mixed) prepared.forEach(g => { if (!geos.includes(g)) g.dispose(); });
      const mesh = new THREE.Mesh(merged, MATS[key] || MATS.stone);
      mesh.castShadow = shadow && key !== 'window';
      mesh.receiveShadow = true;
      mesh.name = 'batch-' + key;
      parent.add(mesh);
    }
    this.buckets.clear();
  }
}

// ---------------------------------------------------------------------------
export function addBox(w, mat, x, y, z, sx, sy, sz, ry = 0, rx = 0, rz = 0) {
  return w.batch.box(mat, [x, y, z], [sx, sy, sz], [rx, ry, rz]);
}

export function gableRoof(w, x, z, width, depth, baseY, rise, ry = 0, mat = 'roof', matEdge = 'roofDark') {
  const half = width / 2;
  const slope = Math.atan2(rise, half);
  const len = Math.hypot(half, rise) + 0.7;
  const c = Math.cos(ry), s = Math.sin(ry);
  for (const side of [-1, 1]) {
    const lx = side * width * 0.25, ly = baseY + rise * 0.5;
    const wx = x + lx * c, wz = z - lx * s;
    w.batch.box(mat, [wx, ly, wz], [len, 0.22, depth + 1.1], [0, ry, side * slope]);
    w.batch.box(matEdge, [wx, ly - 0.16, wz], [len * 0.99, 0.12, depth + 1.02], [0, ry, side * slope]);
  }
  // ridge cap
  w.batch.box('roof', [x, baseY + rise + 0.02, z], [0.36, 0.2, depth + 1.15], [0, ry, 0]);
}

export function makeHouse(w, opts) {
  const { x, z, ry = 0, width = 8, depth = 10, height = 4.2, style = 'wood', door = true, enter = null, name = 'House', chimney = true } = opts;
  const c = Math.cos(ry), s = Math.sin(ry);
  const lx = (dx, dz) => x + dx * c + dz * s;
  const lz = (dx, dz) => z - dx * s + dz * c;
  const wallMat = style === 'plaster' ? 'plaster' : style === 'stone' ? 'stone' : 'wood';
  const trim = style === 'plaster' ? 'woodDark' : 'woodDark';
  // foundation + walls
  w.batch.box('stoneDark', [x, 0.35, z], [width + 0.5, 0.7, depth + 0.5], [0, ry, 0]);
  w.batch.box(wallMat, [x, 0.7 + height / 2, z], [width, height, depth], [0, ry, 0]);
  // corner beams and trim
  for (const dx of [-width / 2 + 0.14, width / 2 - 0.14]) for (const dz of [-depth / 2 + 0.14, depth / 2 - 0.14]) {
    w.batch.box(trim, [lx(dx, dz), 0.7 + height / 2, lz(dx, dz)], [0.24, height, 0.24], [0, ry, 0]);
  }
  w.batch.box(trim, [lx(0, depth / 2 + 0.03), 0.7 + height - 0.18, lz(0, depth / 2 + 0.03)], [width, 0.26, 0.14], [0, ry, 0]);
  w.batch.box(trim, [lx(0, -depth / 2 - 0.03), 0.7 + height - 0.18, lz(0, -depth / 2 - 0.03)], [width, 0.26, 0.14], [0, ry, 0]);
  // roof
  gableRoof(w, x, z, width, depth, 0.7 + height, 2.1 + width * 0.07, ry, 'roof', 'roofDark');
  // door
  if (door) {
    w.batch.box('woodDark', [lx(0, depth / 2 + 0.05), 1.95, lz(0, depth / 2 + 0.05)], [1.7, 2.5, 0.16], [0, ry, 0]);
    w.batch.box('gold', [lx(0.55, depth / 2 + 0.15), 1.9, lz(0.55, depth / 2 + 0.15)], [0.1, 0.1, 0.08], [0, ry, 0]);
    w.batch.box('stoneLight', [lx(0, depth / 2 + 0.5), 0.55, lz(0, depth / 2 + 0.5)], [2.4, 0.3, 1.0], [0, ry, 0]);
  }
  // windows
  for (const side of [-1, 1]) {
    for (const dz of [-depth * 0.22, depth * 0.22]) {
      w.batch.box('window', [lx(side * (width / 2 + 0.05), dz), 0.7 + height * 0.58, lz(side * (width / 2 + 0.05), dz)], [0.1, 1.0, 0.9], [0, ry, 0]);
      w.batch.box('woodDark', [lx(side * (width / 2 + 0.1), dz), 0.7 + height * 0.58, lz(side * (width / 2 + 0.1), dz)], [0.06, 1.15, 1.05], [0, ry, 0]);
    }
  }
  w.batch.box('window', [lx(0, -depth / 2 - 0.05), 0.7 + height * 0.6, lz(0, -depth / 2 - 0.05)], [1.2, 0.9, 0.1], [0, ry, 0]);
  if (chimney) {
    w.batch.box('stone', [lx(width * 0.3, -depth * 0.22), 0.7 + height + 2.6, lz(width * 0.3, -depth * 0.22)], [0.8, 2.2, 0.8], [0, ry, 0]);
    w.batch.box('stoneDark', [lx(width * 0.3, -depth * 0.22), 0.7 + height + 3.7, lz(width * 0.3, -depth * 0.22)], [0.95, 0.2, 0.95], [0, ry, 0]);
  }
  w.addCollider(x, z, width / 2 + 0.3, depth / 2 + 0.3, ry);
  if (enter) {
    const dx = lx(0, depth / 2 + 1.2), dz = lz(0, depth / 2 + 1.2);
    w.addInteractable({ id: 'door_' + enter, x: dx, z: dz, y: w.terrain.heightAt(dx, dz) + 1.2, radius: 2.6, label: name, icon: 'door', action: (g) => g.world.enterInterior(enter, g) });
  }
  return { x, z };
}

export function makeLonghouse(w, opts) {
  const { x, z, ry = 0, width = 12, depth = 16, name = 'Longhouse', enter = null } = opts;
  const c = Math.cos(ry), s = Math.sin(ry);
  const lx = (dx, dz) => x + dx * c + dz * s, lz = (dx, dz) => z - dx * s + dz * c;
  w.batch.box('stoneDark', [x, 0.5, z], [width + 0.8, 1.0, depth + 0.8], [0, ry, 0]);
  w.batch.box('wood', [x, 1 + 4.6, z], [width, 9.2, depth], [0, ry, 0]);
  for (let i = -2; i <= 2; i++) {
    w.batch.box('woodDark', [lx(i * width * 0.2, depth / 2 + 0.04), 1 + 4.6, lz(i * width * 0.2, depth / 2 + 0.04)], [0.3, 9.2, 0.2], [0, ry, 0]);
  }
  for (const y of [3.2, 6.2]) {
    w.batch.box('woodDark', [lx(0, depth / 2 + 0.06), y, lz(0, depth / 2 + 0.06)], [width, 0.24, 0.15], [0, ry, 0]);
  }
  gableRoof(w, x, z, width, depth, 10.2, 3.2, ry, 'roof', 'roofDark');
  // crossed gable boards
  w.batch.box('woodDark', [lx(0, depth / 2 + 0.1), 12.1, lz(0, depth / 2 + 0.1)], [0.22, 2.4, 0.2], [0, ry, 0.55]);
  w.batch.box('woodDark', [lx(0, depth / 2 + 0.1), 12.1, lz(0, depth / 2 + 0.1)], [0.22, 2.4, 0.2], [0, ry, -0.55]);
  // door + windows
  w.batch.box('woodDark', [lx(0, depth / 2 + 0.08), 2.6, lz(0, depth / 2 + 0.08)], [2.2, 3.4, 0.18], [0, ry, 0]);
  w.batch.box('window', [lx(-3.4, depth / 2 + 0.06), 5.4, lz(-3.4, depth / 2 + 0.06)], [1.2, 1.4, 0.1], [0, ry, 0]);
  w.batch.box('window', [lx(3.4, depth / 2 + 0.06), 5.4, lz(3.4, depth / 2 + 0.06)], [1.2, 1.4, 0.1], [0, ry, 0]);
  w.addCollider(x, z, width / 2 + 0.4, depth / 2 + 0.4, ry);
  if (enter) {
    const dx = lx(0, depth / 2 + 1.4), dz = lz(0, depth / 2 + 1.4);
    w.addInteractable({ id: 'door_' + enter, x: dx, z: dz, y: w.terrain.heightAt(dx, dz) + 1.2, radius: 3, label: name, icon: 'door', action: (g) => g.world.enterInterior(enter, g) });
  }
}

export function makeTower(w, x, z, radius = 4, height = 16, roof = true, ry = 0) {
  const y = w.terrain.heightAt(x, z);
  w.batch.cyl('stone', [x, y + height / 2, z], radius * 0.94, radius, height, 10);
  w.batch.cyl('stoneDark', [x, y + 1.2, z], radius + 0.3, radius + 0.45, 2.4, 10);
  // crenellations
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    w.batch.box('stone', [x + Math.cos(a) * radius * 0.9, y + height + 0.55, z + Math.sin(a) * radius * 0.9], [1.1, 1.1, 0.8], [0, -a, 0]);
  }
  if (roof) {
    w.batch.cone('roof', [x, y + height + 2.8, z], radius * 1.15, 4.2, 8, [0, 0, 0]);
    w.batch.cyl('woodDark', [x, y + height + 0.2, z], radius * 0.8, radius * 0.9, 0.4, 10);
  }
  // windows
  for (const yy of [height * 0.45, height * 0.75]) {
    w.batch.box('window', [x + radius * 0.98, y + yy, z], [0.16, 1.1, 0.7], [0, 0, 0]);
  }
  w.addCollider(x, z, radius + 0.2, radius + 0.2, 0, true);
}

export function makeWallSegment(w, x, z, length, ry, height = 8, thickness = 2.6, gate = false) {
  const y = w.terrain.heightAt(x, z);
  if (gate) {
    const half = 4.2;
    w.batch.box('stone', [x - Math.cos(ry) * (length / 2 + 2), y + height / 2, z + Math.sin(ry) * (length / 2 + 2)], [length, height, thickness], [0, ry, 0]);
    return;
  }
  w.batch.box('stone', [x, y + height / 2, z], [length, height, thickness], [0, ry, 0]);
  w.batch.box('stoneDark', [x, y + height + 0.25, z], [length + 0.2, 0.5, thickness + 0.4], [0, ry, 0]);
  // crenellations
  const n = Math.max(2, Math.floor(length / 3.2));
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n - 0.5;
    const dx = Math.cos(ry) * t * length, dz = -Math.sin(ry) * t * length;
    w.batch.box('stone', [x + dx, y + height + 1.0, z + dz], [1.5, 1.4, thickness * 0.9], [0, ry, 0]);
  }
  w.addCollider(x, z, length / 2, thickness / 2, ry);
}

export function makeGatehouse(w, x, z, ry = 0, width = 12, height = 12) {
  const y = w.terrain.heightAt(x, z);
  const c = Math.cos(ry), s = Math.sin(ry);
  const lx = (dx, dz) => x + dx * c + dz * s, lz = (dx, dz) => z - dx * s + dz * c;
  const side = width / 2;
  for (const sgn of [-1, 1]) {
    w.batch.box('stone', [lx(sgn * side, 0), y + height / 2, lz(sgn * side, 0)], [4, height, 5], [0, ry, 0]);
    w.addCollider(lx(sgn * side, 0), lz(sgn * side, 0), 2, 2.5, ry);
  }
  w.batch.box('stone', [x, y + height - 1.2, z], [width + 8, 3.2, 5.2], [0, ry, 0]);
  w.batch.box('stoneDark', [x, y + height + 0.4, z], [width + 8.4, 0.6, 5.6], [0, ry, 0]);
  // arch top
  w.batch.box('stoneDark', [x, y + height - 4.2, z], [width, 1.2, 4.6], [0, ry, 0]);
  // portcullis teeth
  for (let i = -2; i <= 2; i++) {
    w.batch.box('iron', [lx(i * 1.4, 0), y + height - 5.4, lz(i * 1.4, 0)], [0.22, 2.6, 0.3], [0, ry, 0]);
  }
  // banners
  addBanner(w, lx(-4.5, 0), y + 8.2, lz(-4.5, 0), 2.4, 5, 'clothTeal', ry);
  addBanner(w, lx(4.5, 0), y + 8.2, lz(4.5, 0), 2.4, 5, 'clothTeal', ry);
  w.batch.box('window', [lx(0, -2.65), y + height - 2.4, lz(0, -2.65)], [2.2, 1.2, 0.1], [0, ry, 0]);
}

export function addBanner(w, x, y, z, width, height, mat, ry = 0, sigil = true) {
  const geo = new THREE.PlaneGeometry(width, height, 1, 4);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const yy = pos.getY(i);
    pos.setZ(i, Math.sin((yy / height + 0.5) * Math.PI) * 0.12);
  }
  w.batch.add(geo, mat, [x, y, z], [0, ry, 0]);
  if (sigil) {
    const paw = new THREE.CircleGeometry(0.42, 8);
    w.batch.add(paw, 'gold', [x, y + 0.3, z + 0.02], [0, ry, 0]);
  }
}

export function makeMarketStall(w, x, z, ry, color = 'clothRed') {
  const y = w.terrain.heightAt(x, z);
  const c = Math.cos(ry), s = Math.sin(ry);
  w.batch.box('woodDark', [x - 1.5 * c, y + 1.0, z + 1.5 * s], [0.15, 2.2, 0.15], [0, ry, 0]);
  w.batch.box('woodDark', [x + 1.5 * c, y + 1.0, z - 1.5 * s], [0.15, 2.2, 0.15], [0, ry, 0]);
  w.batch.box('wood', [x, y + 1.1, z], [3.6, 0.16, 1.4], [0, ry, 0]);
  // awning
  w.batch.box(color, [x, y + 2.5, z], [3.8, 0.12, 2.4], [0, ry, -0.18]);
  // goods
  for (let i = -1; i <= 1; i++) {
    w.batch.sphere('gold', [x + i * 0.9 * c, y + 1.35, z - i * 0.9 * s], 0.2, 6, [1, 0.7, 1]);
  }
  w.addCollider(x, z, 1.9, 1.1, ry);
}

export function makeWell(w, x, z) {
  const y = w.terrain.heightAt(x, z);
  w.batch.cyl('stone', [x, y + 0.55, z], 2.0, 2.2, 1.1, 10);
  w.batch.cyl('stoneDark', [x, y + 1.15, z], 1.7, 1.7, 0.2, 10);
  w.batch.cyl('dark', [x, y + 1.2, z], 1.5, 1.5, 0.1, 10);
  for (const s of [-1, 1]) w.batch.box('woodDark', [x + s * 1.8, y + 2.3, z], [0.2, 3.0, 0.2]);
  w.batch.box('wood', [x, y + 3.8, z], [4.2, 0.2, 0.25]);
  w.batch.cyl('woodDark', [x, y + 3.6, z], 0.12, 0.12, 4.0, 6, [0, 0, Math.PI / 2]);
  w.addCollider(x, z, 2.2, 2.2, 0, true);
}

export function makeDock(w, x, z, ry = 0, length = 16) {
  const y = w.terrain.heightAt(x, z);
  const c = Math.cos(ry), s = Math.sin(ry);
  for (let i = 0; i < Math.floor(length / 2); i++) {
    w.batch.box('woodLight', [x + c * (i * 2 - length / 2), Math.max(1.4, y + 0.3), z - s * (i * 2 - length / 2)], [2.2, 0.18, 2.0], [0, ry, 0]);
  }
  for (let i = 0; i < 4; i++) {
    const t = i / 3 - 0.5;
    for (const side of [-1, 1]) {
      w.batch.cyl('woodDark', [x + c * t * length + s * side * 1.0, Math.max(0.3, y - 0.4), z - s * t * length + c * side * 1.0], 0.15, 0.18, 3.2, 6);
    }
  }
  // rail posts
  for (let i = 0; i < 4; i++) {
    const t = i / 3 - 0.5;
    w.batch.cyl('woodDark', [x + c * t * length + s * 1.05, y + 1.1, z - s * t * length + c * 1.05], 0.08, 0.1, 1.0, 5);
  }
}

export function makeBoat(w, x, z, ry = 0) {
  const y = WATER_LEVEL + 0.25;
  const hull = new THREE.SphereGeometry(1.6, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2);
  hull.scale(1.6, 0.55, 0.75);
  w.batch.add(hull, 'wood', [x, y, z], [0, ry, 0]);
  w.batch.box('woodDark', [x, y + 0.18, z], [2.8, 0.12, 0.9], [0, ry, 0]);
  w.batch.box('woodDark', [x, y + 1.2, z], [0.1, 2.1, 0.1], [0, ry, 0]);
}

export function makeFence(w, x, z, ry, length = 10) {
  const y = w.terrain.heightAt(x, z);
  const c = Math.cos(ry), s = Math.sin(ry);
  const n = Math.max(2, Math.floor(length / 1.6));
  for (let i = 0; i <= n; i++) {
    const t = i / n - 0.5;
    w.batch.box('woodDark', [x + c * t * length, y + 0.65, z - s * t * length], [0.12, 1.3, 0.12], [0, ry, 0]);
  }
  for (const yy of [0.5, 1.0]) w.batch.box('wood', [x, y + yy, z], [length, 0.1, 0.08], [0, ry, 0]);
}

export function makeBarn(w, x, z, ry = 0) {
  const y = w.terrain.heightAt(x, z);
  const width = 16, depth = 22, height = 8;
  w.batch.box('stoneDark', [x, y + 0.5, z], [width + 0.6, 1.0, depth + 0.6], [0, ry, 0]);
  w.batch.box('wood', [x, y + 1 + height / 2, z], [width, height, depth], [0, ry, 0]);
  gableRoof(w, x, z, width, depth, y + 1 + height, 4.0, ry, 'roof', 'roofDark');
  const c = Math.cos(ry), s = Math.sin(ry);
  w.batch.box('woodDark', [x + s * (depth / 2 + 0.05), y + 3.2, z + c * (depth / 2 + 0.05)], [5, 5.5, 0.2], [0, ry, 0]);
  w.batch.box('woodDark', [x, y + 3.2, z + c * (depth / 2 + 0.1)], [0.3, 5.5, 0.22], [0, ry, 0.5]);
  w.batch.box('woodDark', [x, y + 3.2, z + c * (depth / 2 + 0.1)], [0.3, 5.5, 0.22], [0, ry, -0.5]);
  w.addCollider(x, z, width / 2 + 0.3, depth / 2 + 0.3, ry);
}

export function makeWindmill(w, x, z) {
  const y = w.terrain.heightAt(x, z);
  w.batch.cyl('stone', [x, y + 7, z], 4.2, 6.0, 14, 10);
  w.batch.cone('roof', [x, y + 16.5, z], 4.8, 5, 10);
  w.batch.box('woodDark', [x, y + 11.5, z + 4.4], [2.2, 1.2, 0.2]);
  w.batch.box('window', [x, y + 8, z + 4.8], [1.2, 1.4, 0.2]);
  // blades
  const hub = new THREE.Group();
  hub.position.set(x, y + 13, z + 5.0);
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(1.2, 9, 0.18), MATS.woodLight);
    blade.position.y = 4.5; blade.rotation.z = (i * Math.PI) / 2;
    const arm = new THREE.Group(); arm.add(blade); arm.rotation.z = (i * Math.PI) / 2;
    hub.add(arm);
  }
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.7, 8), MATS.iron);
  cap.rotation.x = Math.PI / 2; hub.add(cap);
  w.group.add(hub);
  w.animated.push({ type: 'windmill', obj: hub });
  w.addCollider(x, z, 5.4, 5.4, 0, true);
}

export function makeShrine(w) {
  const x = -40, z = 170;
  const y = w.terrain.heightAt(x, z);
  // nine monoliths
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 - Math.PI / 2;
    const px = x + Math.cos(a) * 17, pz = z + Math.sin(a) * 17;
    const py = w.terrain.heightAt(px, pz);
    const h = 5.5 + (i % 3) * 1.1;
    w.batch.box('stoneDark', [px, py + h / 2, pz], [1.4, h, 1.0], [0, -a, (i % 2 ? 0.03 : -0.02)]);
    w.batch.box('stone', [px, py + h + 0.1, pz], [1.6, 0.25, 1.2], [0, -a, 0]);
    // glowing rune
    w.batch.box('crystal', [px - Math.sin(a) * 0.52, py + h * 0.62, pz - Math.cos(a) * 0.52], [0.1, 0.9, 0.5], [0, -a, 0]);
    w.addCollider(px, pz, 0.9, 0.7, -a);
  }
  // altar
  w.batch.box('stone', [x, y + 0.55, z], [3.2, 1.1, 2.2]);
  w.batch.box('stoneLight', [x, y + 1.15, z], [2.6, 0.2, 1.7]);
  w.batch.cyl('stoneDark', [x, y + 1.4, z], 0.7, 0.9, 0.5, 8);
  // blue flame
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.8, 6), new THREE.MeshBasicMaterial({ color: 0x8fe4ff, transparent: true, opacity: 0.85 }));
  flame.position.set(x, y + 2.45, z);
  w.group.add(flame);
  const light = new THREE.PointLight(0x8fe4ff, 10, 20, 2);
  light.position.set(x, y + 2.6, z);
  w.group.add(light);
  w.animated.push({ type: 'flame', obj: flame, light, baseY: y + 2.45 });
  w.addInteractable({ id: 'shrine_rest', x, z, y: y + 1.2, radius: 4.2, label: 'Rest at the Shrine of the Nine', icon: 'shrine', action: (g) => g.restAtShrine('Shrine of the Nine', x, z, y) });
  w.addCollider(x, z, 1.8, 1.2, 0);
  // path
  for (let i = 0; i < 12; i++) {
    const a = i * 0.6;
    const px = x + Math.cos(a) * (5 + i * 0.9), pz = z + Math.sin(a) * (5 + i * 0.9);
    w.batch.box('stoneLight', [px, w.terrain.heightAt(px, pz) + 0.05, pz], [1.0, 0.12, 0.8], [0, a, 0]);
  }
}

export function makeRuin(w, x, z, scale = 1) {
  const y = w.terrain.heightAt(x, z);
  // fallen arch and pillars
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const px = x + Math.cos(a) * 10 * scale, pz = z + Math.sin(a) * 10 * scale;
    const py = w.terrain.heightAt(px, pz);
    const h = (i % 2 ? 3 : 7) * scale;
    w.batch.box('stoneDark', [px, py + h / 2, pz], [1.4 * scale, h, 1.4 * scale], [0, a, (i % 3 ? 0.04 : -0.03)]);
    w.batch.box('stone', [px, py + h, pz], [1.7 * scale, 0.3, 1.7 * scale], [0, a, 0]);
  }
  // broken arch
  w.batch.box('stone', [x - 4 * scale, y + 6 * scale, z], [1.2 * scale, 8 * scale, 1.2 * scale], [0, 0.2, 0.05]);
  w.batch.box('stone', [x + 4 * scale, y + 6 * scale, z], [1.2 * scale, 8 * scale, 1.2 * scale], [0, -0.2, -0.05]);
  w.batch.box('stoneDark', [x, y + 10.2 * scale, z], [9.5 * scale, 1.2 * scale, 1.4 * scale], [0, 0, 0.02]);
  // rubble
  for (let i = 0; i < 10; i++) {
    const px = x + (Math.sin(i * 3.1) * 12) * scale, pz = z + (Math.cos(i * 2.7) * 12) * scale;
    w.batch.box('stoneDark', [px, w.terrain.heightAt(px, pz) + 0.3, pz], [1.2, 0.7, 1.0], [0.2, i, 0.1]);
  }
  // stairs down
  for (let i = 0; i < 5; i++) w.batch.box('stone', [x, y + 0.2 - i * 0.25, z + 5 + i * 1.2], [5, 0.5, 1.2]);
}

export function makeMineEntrance(w, x, z, ry = 0) {
  const y = w.terrain.heightAt(x, z);
  const c = Math.cos(ry), s = Math.sin(ry);
  // rock face
  for (let i = 0; i < 8; i++) {
    const px = x + (Math.sin(i * 2.4) * 7), pz = z + (Math.cos(i * 1.7) * 4);
    w.batch.add(new THREE.DodecahedronGeometry(3.2, 0), 'stoneDark', [px, y + 2.2 + (i % 3), pz], [i, i * 0.7, i * 0.3], [1.4, 1.0, 1.1]);
  }
  // timber frame
  for (const side of [-1, 1]) w.batch.box('woodDark', [x + s * side * 3.2, y + 2.6, z + c * side * 3.2], [0.5, 5.2, 0.5], [0, ry, 0]);
  w.batch.box('woodDark', [x, y + 5.1, z], [7.4, 0.6, 0.6], [0, ry, 0]);
  w.batch.box('wood', [x, y + 5.5, z], [8.2, 0.25, 1.1], [0, ry, 0]);
  // dark mouth
  w.batch.box('dark', [x, y + 2.2, z], [5.8, 4.4, 0.4], [0, ry, 0]);
  // rails
  for (const side of [-1, 1]) w.batch.box('iron', [x + s * side * 1.4, y + 0.12, z + c * 6], [0.12, 0.12, 12], [0, ry, 0]);
  // crystals
  for (let i = 0; i < 4; i++) {
    const px = x + Math.sin(i * 3.7) * 8, pz = z + Math.cos(i * 2.2) * 6;
    w.batch.cone('crystal', [px, w.terrain.heightAt(px, pz) + 0.7, pz], 0.4, 1.5, 5, [0.2, i, 0.3]);
  }
  w.addInteractable({ id: 'enter_cinderdeep', x, z, y: y + 1.5, radius: 5, label: 'Enter Cinderdeep Mine', icon: 'mine', action: (g) => g.world.enterInterior('cinderdeep', g) });
}

export function makeCaveMouth(w, x, z) {
  const y = w.terrain.heightAt(x, z);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const px = x + Math.cos(a) * 6, pz = z + Math.sin(a) * 4;
    w.batch.add(new THREE.DodecahedronGeometry(2.6, 0), 'stoneDark', [px, y + 2.4 + (i % 2) * 1.4, pz], [i, a, i * 0.4], [1.3, 1.1, 1.0]);
  }
  w.batch.box('dark', [x, y + 2.0, z], [5.2, 4.0, 0.5]);
  w.batch.cone('crystal', [x + 4.2, y + 0.7, z + 2], 0.3, 1.2, 5, [0.3, 0.4, 0.2]);
  w.batch.cone('crystal', [x - 4.4, y + 0.5, z + 1], 0.25, 1.0, 5, [0.2, 0.8, 0.3]);
  w.addInteractable({ id: 'enter_whispercave', x, z, y: y + 1.4, radius: 4.5, label: 'Enter the Whispering Cave', icon: 'cave', action: (g) => g.world.enterInterior('whispercave', g) });
}

export function makeFrostDoor(w, x, z) {
  const y = w.terrain.heightAt(x, z);
  // mountain wall and icy door
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2;
    const px = x + Math.cos(a) * 12, pz = z + Math.sin(a) * 7;
    w.batch.add(new THREE.DodecahedronGeometry(4.2, 0), 'stoneDark', [px, y + 4 + (i % 3) * 2, pz], [i, a, i * 0.2], [1.2, 1.1, 1.0]);
  }
  w.batch.box('stone', [x, y + 6.2, z], [11, 12.4, 2.4]);
  w.batch.box('stoneDark', [x, y + 12.6, z], [12.5, 0.8, 3.0]);
  w.batch.box('iceDeep', [x, y + 3.2, z - 1.4], [5.6, 6.4, 0.6]);
  for (let i = 0; i < 4; i++) w.batch.cone('crystal', [x - 4 + i * 2.6, y + 9.5, z - 1.8], 0.35, 2.2, 5, [0.1, i, 0.2]);
  // two sockets
  w.batch.sphere('gold', [x - 1.6, y + 3.4, z - 1.85], 0.55, 8, [1, 1, 0.4]);
  w.batch.sphere('gold', [x + 1.6, y + 3.4, z - 1.85], 0.55, 8, [1, 1, 0.4]);
  w.addInteractable({ id: 'frost_door', x, z: z - 2.2, y: y + 2.5, radius: 5, label: 'The Frostfang Door', icon: 'door', action: (g) => g.world.tryFrostDoor(g) });
}

export function makeBanditCamp(w, x, z) {
  const y = w.terrain.heightAt(x, z);
  // palisade
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const px = x + Math.cos(a) * 13, pz = z + Math.sin(a) * 11;
    if (Math.abs(px - x) < 3 && pz > z) continue;
    w.batch.cyl('woodDark', [px, y + 1.6, pz], 0.22, 0.28, 3.2, 5, [0.04, a, 0.06]);
  }
  // tents
  for (const [tx, tz, ry] of [[-5, -3, 0.4], [5, 2, -0.5], [1, -6, 1.1]]) {
    const py = w.terrain.heightAt(x + tx, z + tz);
    w.batch.cone('clothRed', [x + tx, py + 1.9, z + tz], 3.2, 3.8, 4, [0, ry, 0]);
    w.batch.box('woodDark', [x + tx, py + 0.8, z + tz], [0.2, 1.6, 0.2]);
  }
  // campfire
  const fx = x + 1, fz = z + 3;
  const fy = w.terrain.heightAt(fx, fz);
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2;
    w.batch.box('stoneDark', [fx + Math.cos(a) * 1.1, fy + 0.2, fz + Math.sin(a) * 1.1], [0.5, 0.35, 0.5], [0, a, 0]);
  }
  const fire = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.5, 6), new THREE.MeshBasicMaterial({ color: 0xff9b3d, transparent: true, opacity: 0.9 }));
  fire.position.set(fx, fy + 0.9, fz);
  w.group.add(fire);
  const light = new THREE.PointLight(0xff8a3d, 8, 18, 2); light.position.set(fx, fy + 1.6, fz); w.group.add(light);
  w.animated.push({ type: 'flame', obj: fire, light, baseY: fy + 0.9 });
  // cage / chest
  w.batch.box('woodDark', [x + 7, y + 1.2, z - 5], [2.2, 2.4, 2.2]);
  for (let i = 0; i < 4; i++) w.batch.box('iron', [x + 6.2 + i * 0.5, y + 1.3, z - 3.9], [0.08, 2.2, 0.08]);
}

export function makeSignpost(w, x, z, text, ry = 0) {
  const y = w.terrain.heightAt(x, z);
  w.batch.box('woodDark', [x, y + 1.2, z], [0.22, 2.4, 0.22]);
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#5b422b'; ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#2f2115'; ctx.lineWidth = 8; ctx.strokeRect(4, 4, 504, 120);
  ctx.fillStyle = '#eadfc3'; ctx.font = 'bold 52px Georgia'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 68);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.85, 0.12), mat);
  board.position.set(x, y + 2.1, z);
  board.rotation.y = ry;
  w.group.add(board);
  w.batch.box('woodDark', [x, y + 2.1, z], [3.6, 0.95, 0.14], [0, ry, 0]);
  board.position.z += 0.08;
  board.rotation.y = ry;
}

export function makeStatue(w, x, z, ry = 0) {
  const y = w.terrain.heightAt(x, z);
  w.batch.box('stoneDark', [x, y + 0.7, z], [4.0, 1.4, 4.0]);
  w.batch.box('stone', [x, y + 1.5, z], [3.2, 0.4, 3.2]);
  // big seated cat silhouette
  w.batch.sphere('stone', [x, y + 3.4, z], 1.5, 10, [1, 1.4, 1]);
  w.batch.sphere('stone', [x, y + 5.4, z], 1.1, 10, [1, 0.95, 0.95]);
  w.batch.cone('stone', [x - 0.65, y + 6.3, z], 0.42, 1.1, 4, [0, 0, -0.2]);
  w.batch.cone('stone', [x + 0.65, y + 6.3, z], 0.42, 1.1, 4, [0, 0, 0.2]);
  w.batch.sphere('stone', [x, y + 2.2, z - 0.4], 1.2, 8, [1, 0.7, 1.6]);
  w.addCollider(x, z, 2.0, 2.0, 0, true);
  // plaque
  w.batch.box('gold', [x, y + 1.7, z + 2.05], [1.2, 0.5, 0.1]);
}

export function makeBridge(w, x, z, ry = 0, span = 30) {
  const y = WATER_LEVEL + 1.8;
  const c = Math.cos(ry), s = Math.sin(ry);
  for (let i = 0; i < Math.floor(span / 1.8); i++) {
    const t = (i + 0.5) / Math.floor(span / 1.8) - 0.5;
    w.batch.box('woodLight', [x + c * t * span, y, z - s * t * span], [2.6, 0.22, 1.9], [0, ry, 0]);
  }
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const t = (i + 0.5) / 6 - 0.5;
      w.batch.cyl('woodDark', [x + c * t * span + s * side * 1.15, y + 0.8, z - s * t * span + c * side * 1.15], 0.07, 0.09, 1.6, 5);
    }
    w.batch.box('woodDark', [x + s * side * 1.15, y + 1.55, z + c * side * 1.15], [span, 0.12, 0.12], [0, ry, 0]);
  }
  // stone feet
  for (const t of [-0.42, 0.42]) w.batch.box('stoneDark', [x + c * t * span, y - 0.9, z - s * t * span], [3.2, 2.2, 2.4], [0, ry, 0]);
}

export function makeChest(w, x, z, yOverride = null) {
  const y = yOverride ?? w.terrain.heightAt(x, z);
  const group = new THREE.Group();
  group.position.set(x, y, z);
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.7, 0.8), MATS.wood);
  base.position.y = 0.35;
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.7, -0.4);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.28, 0.85), MATS.woodDark);
  lid.position.set(0, 0.14, 0.4);
  lidPivot.add(lid);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.1, 0.9), MATS.gold);
  trim.position.y = 0.04;
  const lock = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, 0.08), MATS.gold);
  lock.position.set(0, 0.5, 0.42);
  group.add(base, lidPivot, trim, lock);
  group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  w.group.add(group);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffd37a, map: makeGlowTexture(), transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.scale.set(2.2, 2.2, 1); glow.position.set(x, y + 1.1, z);
  w.group.add(glow);
  return { group, lidPivot, glow, opened: false, x, y, z };
}

let glowTex = null;
export function makeGlowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,220,150,.7)');
  g.addColorStop(1, 'rgba(255,180,80,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

export function makeLamp(w, x, z, color = 0xffc477) {
  const y = w.terrain.heightAt(x, z);
  w.batch.box('woodDark', [x, y + 2.2, z], [0.16, 4.4, 0.16]);
  w.batch.box('iron', [x, y + 4.3, z], [0.7, 0.12, 0.12]);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshBasicMaterial({ color }));
  bulb.position.set(x, y + 4.1, z + 0.3);
  w.group.add(bulb);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlowTexture(), color, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.position.set(x, y + 4.1, z + 0.3); glow.scale.set(2.4, 2.4, 1);
  w.group.add(glow);
}

export function makeFireplace(w, x, y, z, ry = 0) {
  w.batch.box('stoneDark', [x, y + 1.2, z], [3.4, 2.4, 0.9], [0, ry, 0]);
  w.batch.box('dark', [x, y + 0.9, z + 0.46], [2.0, 1.6, 0.1], [0, ry, 0]);
  const fire = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.2, 6), new THREE.MeshBasicMaterial({ color: 0xffa044, transparent: true, opacity: 0.9 }));
  fire.position.set(x, y + 1.0, z + 0.5);
  w.group.add(fire);
  const light = new THREE.PointLight(0xff9444, 14, 22, 2);
  light.position.set(x, y + 1.6, z + 0.9);
  w.group.add(light);
  w.animated.push({ type: 'flame', obj: fire, light, baseY: y + 1.0 });
}

export function makeTable(w, x, y, z, ry = 0) {
  w.batch.box('wood', [x, y + 0.78, z], [2.2, 0.14, 1.1], [0, ry, 0]);
  for (const sx of [-0.9, 0.9]) for (const sz of [-0.4, 0.4]) {
    const c = Math.cos(ry), s = Math.sin(ry);
    w.batch.box('woodDark', [x + sx * c + sz * s, y + 0.38, z - sx * s + sz * c], [0.12, 0.76, 0.12], [0, ry, 0]);
  }
  for (const [ox, oz] of [[-0.6, 0.7], [0.6, -0.7], [0.7, 0.7]]) {
    const c = Math.cos(ry), s = Math.sin(ry);
    w.batch.box('woodDark', [x + ox * c + oz * s, y + 0.42, z - ox * s + oz * c], [0.42, 0.1, 0.42], [0, ry, 0]);
    w.batch.box('woodDark', [x + ox * c + oz * s, y + 0.22, z - ox * s + oz * c], [0.08, 0.42, 0.08], [0, ry, 0]);
  }
}

export function makeCrate(w, x, y, z, size = 0.7, ry = 0) {
  w.batch.box('woodLight', [x, y + size / 2, z], [size, size, size], [0, ry, 0]);
  w.batch.box('woodDark', [x, y + size / 2, z], [size * 1.02, 0.07, size * 1.02], [0, ry, 0]);
}

export function makeBarrel(w, x, y, z) {
  w.batch.cyl('woodLight', [x, y + 0.55, z], 0.4, 0.45, 1.1, 8);
  w.batch.cyl('iron', [x, y + 0.3, z], 0.43, 0.43, 0.08, 8);
  w.batch.cyl('iron', [x, y + 0.8, z], 0.41, 0.41, 0.08, 8);
}

export function makeBrazier(w, x, y, z) {
  w.batch.cyl('iron', [x, y + 0.9, z], 0.35, 0.25, 1.8, 6);
  w.batch.cyl('iron', [x, y + 1.85, z], 0.55, 0.35, 0.35, 6);
  const fire = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.1, 6), new THREE.MeshBasicMaterial({ color: 0xffa64d, transparent: true, opacity: 0.9 }));
  fire.position.set(x, y + 2.4, z);
  w.group.add(fire);
  const light = new THREE.PointLight(0xff9a4a, 10, 18, 2); light.position.set(x, y + 2.5, z); w.group.add(light);
  w.animated.push({ type: 'flame', obj: fire, light, baseY: y + 2.4 });
}
