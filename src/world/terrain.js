import * as THREE from 'three';
import { clamp, fbm, ridged, smoothstep, lerp, makeRng } from '../core/noise.js';
import { LANDMARKS } from '../core/data.js';

export const WORLD_SIZE = 1400;
export const WATER_LEVEL = 1.15;

// Landmark plateau data: keeps holds, shrines and dungeon mouths readable.
const FLATS = [
  { id: 'pawsmouth', x: 175, z: 306, r: 42, h: 6.5 },
  { id: 'spawn', x: 178, z: 346, r: 22, h: 6.8 },
  { id: 'shrine', x: -40, z: 170, r: 38, h: 13.5 },
  { id: 'whiskerhold', x: -280, z: -160, r: 108, h: 14 },
  { id: 'highpaw', x: 238, z: -292, r: 76, h: 41 },
  { id: 'hearthwhisker', x: -392, z: 138, r: 62, h: 8.5 },
  { id: 'frostpelt', x: 352, z: 206, r: 56, h: 21 },
  { id: 'pawbarrow', x: -360, z: -344, r: 44, h: 17 },
  { id: 'cinderdeep', x: 392, z: -356, r: 42, h: 28 },
  { id: 'frostfang', x: -40, z: -590, r: 46, h: 44 },
  { id: 'banditcamp', x: 258, z: 72, r: 34, h: 14 },
  { id: 'whispercave', x: -126, z: 336, r: 28, h: 12 },
];

export function riverX(z) {
  return 110 * Math.sin(z * 0.0075) + 45 * Math.sin(z * 0.019 + 1.7);
}

export class Terrain {
  constructor(seed = 91731) {
    this.seed = seed;
    this.half = WORLD_SIZE / 2;
    this.flats = FLATS;
  }

  baseHeight(x, z) {
    const s = this.seed;
    let h = 7.5;
    h += fbm(x * 0.0032 + 11, z * 0.0032 - 7, s, 4) * 16;
    h += fbm(x * 0.011, z * 0.011, s + 41, 4) * 4.2;
    h += (fbm(x * 0.04, z * 0.04, s + 9, 2) - 0.5) * 1.1;
    const r = Math.hypot(x, z) / this.half;
    const mountain = smoothstep(0.56, 1.02, r);
    h += mountain * (34 + ridged(x * 0.006 + 3, z * 0.006 - 2, s + 21, 5) * 104);
    h += smoothstep(0.78, 1.0, r) * ridged(x * 0.018, z * 0.018, s + 77, 3) * 26;
    // Lake in the western lowlands
    const lake = Math.hypot(x + 300, z - 300);
    h -= (1 - smoothstep(62, 155, lake)) * 11;
    // River valley
    const rx = riverX(z);
    const rd = Math.abs(x - rx);
    h -= (1 - smoothstep(3, 30, rd)) * 19;
    h -= (1 - smoothstep(30, 62, rd)) * 2.4;
    return h;
  }

  heightAt(x, z) {
    let h = this.baseHeight(x, z);
    for (const f of this.flats) {
      const d = Math.hypot(x - f.x, z - f.z);
      if (d < f.r * 1.7) {
        const t = 1 - smoothstep(f.r * 0.62, f.r * 1.55, d);
        h = lerp(h, f.h, t * 0.94);
      }
    }
    // River carves through after flats so the water still runs
    const rx = riverX(z);
    const rd = Math.abs(x - rx);
    const riverCut = (1 - smoothstep(4, 26, rd));
    if (riverCut > 0.01) {
      let nearFlat = 0;
      for (const f of this.flats) {
        const d = Math.hypot(x - f.x, z - f.z);
        if (d < f.r * 1.35) nearFlat = Math.max(nearFlat, 1 - smoothstep(f.r * 0.8, f.r * 1.35, d));
      }
      h -= riverCut * 14 * (1 - nearFlat * 0.55);
    }
    return h;
  }

  slopeAt(x, z) {
    const e = 1.4;
    const hx = this.heightAt(x + e, z) - this.heightAt(x - e, z);
    const hz = this.heightAt(x, z + e) - this.heightAt(x, z - e);
    return Math.hypot(hx, hz) / (e * 2);
  }

  isWater(x, z) { return this.heightAt(x, z) < WATER_LEVEL - 0.15; }

  isNearLandmark(x, z, pad = 0) {
    for (const k in LANDMARKS) {
      const l = LANDMARKS[k];
      if (l.radius < 30) continue;
      if (Math.hypot(x - l.x, z - l.z) < l.radius * 0.82 + pad) return true;
    }
    for (const f of this.flats) if (Math.hypot(x - f.x, z - f.z) < f.r * 0.9 + pad) return true;
    return false;
  }

  buildMesh() {
    const seg = 200;
    const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    const snow = new THREE.Color('#e8eef2');
    const snowBlue = new THREE.Color('#c8d8e2');
    const grass = new THREE.Color('#637057');
    const grass2 = new THREE.Color('#7a8262');
    const rock = new THREE.Color('#666d74');
    const rockDark = new THREE.Color('#4b535b');
    const dirt = new THREE.Color('#776b57');
    const mud = new THREE.Color('#5c594c');

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const h = this.heightAt(x, z);
      pos.setY(i, h);
      const slope = this.slopeAt(x, z);
      const n = fbm(x * 0.055, z * 0.055, 313, 3);
      const n2 = fbm(x * 0.014 + 5, z * 0.014, 117, 3);
      const snowy = clamp(0.58 + smoothstep(9, 24, h) * 0.5 + smoothstep(0.22, 0.52, slope) * 0.4 + (n - 0.5) * 0.62, 0, 1);
      const high = smoothstep(38, 80, h);
      c.copy(grass).lerp(grass2, n2);
      c.lerp(dirt, smoothstep(0.3, 0.62, slope) * 0.55);
      c.lerp(mud, smoothstep(3.4, 1.0, h) * 0.9);
      c.lerp(rock, smoothstep(0.42, 0.9, slope) * 0.85);
      c.lerp(rockDark, high * 0.6);
      c.lerp(snowBlue, snowy * 0.65);
      c.lerp(snow, clamp(snowy * 0.9 + high * 0.8, 0, 1));
      // riverbank sand
      const rd = Math.abs(x - riverX(z));
      const bank = (1 - smoothstep(5, 20, rd)) * (1 - smoothstep(2.0, 0.5, h));
      c.lerp(dirt, bank * 0.55);
      // subtle variation
      const v = 0.93 + n * 0.14;
      colors[i * 3] = c.r * v; colors[i * 3 + 1] = c.g * v; colors[i * 3 + 2] = c.b * v;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.97, metalness: 0.0 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    mesh.name = 'terrain';
    return mesh;
  }

  buildWater() {
    const geo = new THREE.PlaneGeometry(WORLD_SIZE + 120, WORLD_SIZE + 120, 1, 1);
    geo.rotateX(-Math.PI / 2);
    // Procedural ripple normal map
    const size = 128;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const nx = Math.sin(x * 0.32 + y * 0.13) * 0.5 + Math.sin(x * 0.11 - y * 0.27) * 0.5;
        const ny = Math.cos(x * 0.17 - y * 0.29) * 0.5 + Math.cos(x * 0.09 + y * 0.21) * 0.5;
        data[i] = 128 + nx * 45; data[i + 1] = 128 + ny * 45; data[i + 2] = 255; data[i + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(60, 60);
    tex.needsUpdate = true;
    const mat = new THREE.MeshStandardMaterial({
      color: 0x2e5b6b, roughness: 0.18, metalness: 0.32, transparent: true, opacity: 0.86,
      normalMap: tex, normalScale: new THREE.Vector2(0.45, 0.45), depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = WATER_LEVEL;
    mesh.receiveShadow = true;
    mesh.name = 'water';
    mesh.renderOrder = 2;
    this.waterMat = mat;
    this.waterTex = tex;
    return mesh;
  }

  buildRoads() {
    const routes = [
      [[175, 306], [120, 270], [40, 220], [-40, 170]],
      [[-40, 170], [-140, 100], [-230, -40], [-280, -160]],
      [[-280, -160], [-350, -40], [-392, 138]],
      [[-280, -160], [-80, -220], [120, -270], [238, -292]],
      [[175, 306], [270, 280], [330, 240], [352, 206]],
      [[352, 206], [390, 60], [410, -150], [392, -356]],
      [[238, -292], [300, -330], [392, -356]],
      [[-40, 170], [-20, 20], [-10, -180], [-25, -400], [-40, -590]],
      [[175, 306], [230, 210], [258, 72]],
      [[-280, -160], [-320, -240], [-360, -344]],
      [[175, 306], [30, 330], [-126, 336]],
      [[238, -292], [190, -380], [40, -470], [-40, -590]],
    ];
    const geos = [];
    const color = new THREE.Color('#6d6250');
    this.roadPoints = [];
    for (const route of routes) {
      const pts = route.map(([x, z]) => new THREE.Vector3(x, 0, z));
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.35);
      const steps = Math.max(30, Math.floor(curve.getLength() / 4));
      const verts = [], cols = [], idx = [];
      const width = 3.2;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const p = curve.getPoint(t);
        if (i % 4 === 0) this.roadPoints.push(p);
        const p2 = curve.getPoint(Math.min(1, t + 0.002));
        const dx = p2.x - p.x, dz = p2.z - p.z;
        const len = Math.hypot(dx, dz) || 1;
        const nx = -dz / len, nz = dx / len;
        for (const s of [-1, 1]) {
          const x = p.x + nx * width * s, z = p.z + nz * width * s;
          const y = this.heightAt(x, z) + 0.1;
          verts.push(x, y, z);
          const shade = 0.9 + (i % 3) * 0.035;
          cols.push(color.r * shade, color.g * shade, color.b * shade);
        }
        if (i < steps) {
          const a = i * 2;
          idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      geos.push(g);
    }
    const merged = mergeGeos(geos);
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    const mesh = new THREE.Mesh(merged, mat);
    mesh.receiveShadow = true;
    mesh.name = 'roads';
    return mesh;
  }
}

function mergeGeos(geos) {
  let total = 0;
  for (const g of geos) total += g.attributes.position.count;
  const pos = new Float32Array(total * 3), col = new Float32Array(total * 3);
  const index = [];
  let off = 0, vOff = 0;
  for (const g of geos) {
    pos.set(g.attributes.position.array, off * 3);
    col.set(g.attributes.color.array, off * 3);
    const gi = g.index.array;
    for (let i = 0; i < gi.length; i++) index.push(gi[i] + vOff);
    off += g.attributes.position.count;
    vOff += g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.setIndex(index);
  out.computeVertexNormals();
  return out;
}

// ---------------------------------------------------------------------------
export function makeSky() {
  const geo = new THREE.SphereGeometry(1600, 32, 20);
  const uniforms = {
    topColor: { value: new THREE.Color('#1c4257') },
    horizonColor: { value: new THREE.Color('#b9cdd6') },
    bottomColor: { value: new THREE.Color('#6d8794') },
    sunColor: { value: new THREE.Color('#ffd9a0') },
    sunDir: { value: new THREE.Vector3(0.4, 0.5, 0.2) },
    night: { value: 0 },
    time: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms,
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      varying vec3 vDir; uniform vec3 topColor,horizonColor,bottomColor,sunColor,sunDir; uniform float night,time;
      void main(){
        float y = clamp(vDir.y*0.5+0.5,0.0,1.0);
        vec3 col = mix(bottomColor,horizonColor,smoothstep(0.38,0.52,y));
        col = mix(col,topColor,smoothstep(0.5,0.92,y));
        float sun = max(dot(normalize(vDir),normalize(sunDir)),0.0);
        col += sunColor*pow(sun,180.0)*1.6;
        col += sunColor*pow(sun,8.0)*0.18;
        // faint moving cloud bands
        float band = sin(vDir.x*6.0+vDir.z*4.0+time*0.03)*0.5+0.5;
        band *= smoothstep(0.35,0.6,y)*(1.0-smoothstep(0.75,0.95,y));
        col = mix(col, vec3(0.82,0.86,0.9), band*0.08*(1.0-night));
        // night blue
        vec3 ncol = mix(vec3(0.02,0.035,0.08),vec3(0.05,0.08,0.14),y);
        col = mix(col,ncol,night*0.92);
        gl_FragColor = vec4(col,1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return { mesh, uniforms };
}

export function makeStars(rng) {
  const count = 1400;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = rng.next() * Math.PI * 2;
    const phi = Math.acos(rng.range(0.05, 1));
    const r = 1200;
    pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
    pos[i * 3 + 1] = Math.cos(phi) * r;
    pos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xdfe9ff, size: 2.2, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: false, fog: false });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = -9;
  return points;
}

export function makeClouds(rng) {
  const group = new THREE.Group();
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(128, 64, 4, 128, 64, 120);
  g.addColorStop(0, 'rgba(255,255,255,.55)');
  g.addColorStop(0.5, 'rgba(255,255,255,.2)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 128);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.55, depthWrite: false, fog: false });
  for (let i = 0; i < 22; i++) {
    const s = new THREE.Sprite(mat);
    const a = rng.next() * Math.PI * 2, r = rng.range(300, 1000);
    s.position.set(Math.cos(a) * r, rng.range(120, 230), Math.sin(a) * r);
    s.scale.set(rng.range(140, 320), rng.range(45, 90), 1);
    group.add(s);
  }
  group.renderOrder = -8;
  return group;
}
