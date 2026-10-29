import * as THREE from 'three';
import { radialTexture, flareTexture } from './textures.js';

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _up = new THREE.Vector3(0, 0, 1);

export class Effects {
  constructor(scene, quality = 'high') {
    this.scene = scene;
    this.quality = quality;
    this.time = 0;
    this.sparkTex = radialTexture('rgba(255,255,255,1)', 'rgba(255,190,90,.55)', 'rgba(255,120,20,0)', 64);
    this.flareTex = flareTexture();
    this.smokeTex = radialTexture('rgba(255,245,225,.7)', 'rgba(215,185,150,.28)', 'rgba(180,150,120,0)', 96);
    this.decalTex = this.makeDecalTexture();

    this.initParticles(quality === 'low' ? 380 : 900);
    this.initTracers(quality === 'low' ? 18 : 38);
    this.initPuffs(quality === 'low' ? 30 : 70);
    this.initShells(quality === 'low' ? 10 : 26);
    this.initDecals(quality === 'low' ? 20 : 50);
    this.initRings(8);
  }

  makeDecalTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 31);
    g.addColorStop(0, 'rgba(16,12,9,.92)');
    g.addColorStop(0.5, 'rgba(22,16,11,.72)');
    g.addColorStop(0.82, 'rgba(30,22,15,.25)');
    g.addColorStop(1, 'rgba(30,22,15,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 2 + Math.random() * 12;
      const x = 32 + Math.cos(a) * r, y = 32 + Math.sin(a) * r;
      ctx.fillStyle = 'rgba(12,9,6,.7)';
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
      ctx.fill();
    }
    const t = new THREE.CanvasTexture(c);
    return t;
  }

  initParticles(max) {
    this.maxParticles = max;
    this.pCount = 0;
    this.pPos = new Float32Array(max * 3);
    this.pCol = new Float32Array(max * 3);
    this.pVel = new Float32Array(max * 3);
    this.pLife = new Float32Array(max);
    this.pMax = new Float32Array(max);
    this.pGrav = new Float32Array(max);
    this.pDrag = new Float32Array(max);
    this.pBaseCol = new Float32Array(max * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pPos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.pCol, 3));
    geo.setDrawRange(0, 0);
    const mat = new THREE.PointsMaterial({
      size: 0.095, map: this.sparkTex, vertexColors: true, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.scene.add(this.points);
  }

  initTracers(n) {
    this.tracers = [];
    for (let i = 0; i < n; i++) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
      const mat = new THREE.LineBasicMaterial({ color: 0xffd58a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const line = new THREE.Line(geo, mat);
      line.frustumCulled = false;
      this.scene.add(line);
      this.tracers.push({ line, life: 0, max: 0.06 });
    }
    this.tracerIdx = 0;
  }

  initPuffs(n) {
    this.puffs = [];
    for (let i = 0; i < n; i++) {
      const mat = new THREE.SpriteMaterial({ map: this.smokeTex, transparent: true, depthWrite: false, opacity: 1, color: 0xffffff });
      const sp = new THREE.Sprite(mat);
      sp.visible = false;
      this.scene.add(sp);
      this.puffs.push({ sp, life: 0, max: 1, vy: 0, size: 1, drag: 0.9, spin: 0 });
    }
    this.puffIdx = 0;
  }

  initShells(n) {
    this.shells = [];
    const geo = new THREE.CylinderGeometry(0.012, 0.014, 0.045, 6);
    const mat = new THREE.MeshStandardMaterial({ color: 0xd4a94d, roughness: 0.34, metalness: 0.86 });
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(geo, mat);
      m.visible = false;
      m.castShadow = false;
      this.scene.add(m);
      this.shells.push({ m, life: 0, vel: new THREE.Vector3(), spin: new THREE.Vector3(), bounced: false });
    }
    this.shellIdx = 0;
  }

  initDecals(n) {
    this.decals = [];
    const geo = new THREE.CircleGeometry(0.15, 10);
    for (let i = 0; i < n; i++) {
      const mat = new THREE.MeshBasicMaterial({ map: this.decalTex, transparent: true, opacity: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      const m = new THREE.Mesh(geo, mat);
      m.visible = false;
      this.scene.add(m);
      this.decals.push({ m, life: 0 });
    }
    this.decalIdx = 0;
  }

  initRings(n) {
    this.rings = [];
    for (let i = 0; i < n; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0xffc06a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false });
      const r = new THREE.Mesh(new THREE.RingGeometry(0.82, 1, 36), mat);
      r.visible = false;
      this.scene.add(r);
      this.rings.push({ m: r, life: 0, max: 0.5 });
    }
    this.ringIdx = 0;
  }

  tracer(from, to, color = 0xffd58a) {
    const t = this.tracers[this.tracerIdx];
    this.tracerIdx = (this.tracerIdx + 1) % this.tracers.length;
    const p = t.line.geometry.attributes.position.array;
    p[0] = from.x; p[1] = from.y; p[2] = from.z;
    p[3] = to.x; p[4] = to.y; p[5] = to.z;
    t.line.geometry.attributes.position.needsUpdate = true;
    t.line.material.color.setHex(color);
    t.line.material.opacity = 0.85;
    t.line.visible = true;
    t.life = t.max = 0.055;
  }

  burst(pos, opts = {}) {
    const count = opts.count || 12;
    const color = new THREE.Color(opts.color || 0xffb45a);
    const speed = opts.speed || 3;
    const life = opts.life || 0.5;
    const gravity = opts.gravity ?? 5;
    const spread = opts.spread || 1;
    const drag = opts.drag ?? 1.4;
    for (let i = 0; i < count; i++) {
      const idx = this.pCount % this.maxParticles;
      this.pCount++;
      const o = idx * 3;
      this.pPos[o] = pos.x + (Math.random() - 0.5) * 0.06;
      this.pPos[o + 1] = pos.y + (Math.random() - 0.5) * 0.06;
      this.pPos[o + 2] = pos.z + (Math.random() - 0.5) * 0.06;
      const dir = _v.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      if (opts.dir) dir.lerp(opts.dir, 0.55).normalize();
      const s = speed * (0.35 + Math.random() * 0.9);
      this.pVel[o] = dir.x * s * spread;
      this.pVel[o + 1] = dir.y * s + (opts.up || 0);
      this.pVel[o + 2] = dir.z * s * spread;
      const c = color.clone().offsetHSL((Math.random() - 0.5) * 0.05, 0, (Math.random() - 0.5) * 0.15);
      this.pBaseCol[o] = c.r; this.pBaseCol[o + 1] = c.g; this.pBaseCol[o + 2] = c.b;
      this.pCol[o] = c.r; this.pCol[o + 1] = c.g; this.pCol[o + 2] = c.b;
      this.pLife[idx] = this.pMax[idx] = life * (0.6 + Math.random() * 0.8);
      this.pGrav[idx] = gravity;
      this.pDrag[idx] = drag;
    }
    this.points.geometry.setDrawRange(0, Math.min(this.pCount, this.maxParticles));
  }

  puff(pos, opts = {}) {
    const p = this.puffs[this.puffIdx];
    this.puffIdx = (this.puffIdx + 1) % this.puffs.length;
    p.sp.position.copy(pos);
    p.sp.material.color.set(opts.color || 0xd7c2a3);
    p.sp.material.opacity = opts.opacity ?? 0.6;
    p.sp.material.blending = opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    p.sp.material.map = opts.flare ? this.flareTex : this.smokeTex;
    p.sp.material.rotation = Math.random() * Math.PI * 2;
    p.sp.visible = true;
    p.size = opts.size || 0.7;
    p.sp.scale.setScalar(p.size * 0.4);
    p.max = p.life = opts.life || 0.8;
    p.vy = opts.rise ?? 0.4;
    p.drag = opts.drag ?? 0.92;
    p.spin = (Math.random() - 0.5) * 1.2;
    p.startOpacity = p.sp.material.opacity;
  }

  impact(pos, normal, color = 0xffb45a) {
    this.burst(pos, { count: 9, color, speed: 3.6, life: 0.32, gravity: 8, dir: normal, spread: 1.2 });
    this.burst(pos, { count: 5, color: 0xbfb09a, speed: 1.4, life: 0.55, gravity: 1.2, dir: normal, spread: 1.5, up: 0.4 });
    this.puff(pos, { color: 0xc4b298, size: 0.55, life: 0.65, opacity: 0.32, rise: 0.7 });
    this.decal(pos, normal);
  }

  furBurst(pos, color = 0xc98c4a) {
    this.burst(pos, { count: 10, color, speed: 2.6, life: 0.8, gravity: 4.5, spread: 1.3 });
    this.puff(pos, { color, size: 0.42, life: 0.45, opacity: 0.45, rise: 0.9 });
  }

  explosion(pos, color = 0xff8a3c) {
    this.puff(pos, { color: 0xffc46a, size: 4.2, life: 0.28, opacity: 0.95, rise: 0.2, additive: true, flare: true });
    this.puff(pos, { color: 0x45372c, size: 5.2, life: 1.5, opacity: 0.7, rise: 1.1, drag: 0.86 });
    this.puff(pos, { color: 0x6f5a47, size: 6.5, life: 2.1, opacity: 0.45, rise: 1.6, drag: 0.9 });
    this.burst(pos, { count: 60, color, speed: 12, life: 0.8, gravity: 7, spread: 2.1, up: 3, drag: 0.6 });
    this.burst(pos, { count: 26, color: 0xffe3a8, speed: 7, life: 0.45, gravity: 3, spread: 1.5, up: 1, drag: 0.9 });
    const ring = this.rings[this.ringIdx];
    this.ringIdx = (this.ringIdx + 1) % this.rings.length;
    ring.m.position.copy(pos);
    ring.m.position.y = 0.35;
    ring.m.rotation.set(-Math.PI / 2, 0, 0);
    ring.m.visible = true;
    ring.m.material.opacity = 0.85;
    ring.life = ring.max = 0.55;
  }

  decal(pos, normal) {
    const d = this.decals[this.decalIdx];
    this.decalIdx = (this.decalIdx + 1) % this.decals.length;
    d.m.position.copy(pos).addScaledVector(normal, 0.012);
    d.m.quaternion.setFromUnitVectors(_up, normal);
    d.m.rotateZ(Math.random() * Math.PI * 2);
    d.m.scale.setScalar(0.55 + Math.random() * 0.5);
    d.m.material.opacity = 0.88;
    d.m.visible = true;
    d.life = 22;
  }

  shell(pos, right) {
    const s = this.shells[this.shellIdx];
    this.shellIdx = (this.shellIdx + 1) % this.shells.length;
    s.m.position.copy(pos);
    s.m.visible = true;
    s.life = 1.6;
    s.vel.set(right.x * 1.6 + (Math.random() - 0.5) * 0.5, 1.5 + Math.random() * 0.9, right.z * 1.6 + (Math.random() - 0.5) * 0.5);
    s.spin.set(Math.random() * 12, Math.random() * 12, Math.random() * 12);
    s.bounced = false;
  }

  update(dt) {
    this.time += dt;

    for (let i = 0; i < this.maxParticles; i++) {
      if (this.pLife[i] <= 0) continue;
      this.pLife[i] -= dt;
      const o = i * 3;
      if (this.pLife[i] <= 0) {
        this.pCol[o] = this.pCol[o + 1] = this.pCol[o + 2] = 0;
        continue;
      }
      this.pVel[o + 1] -= this.pGrav[i] * dt;
      const drag = Math.max(0, 1 - this.pDrag[i] * dt);
      this.pVel[o] *= drag; this.pVel[o + 1] *= drag; this.pVel[o + 2] *= drag;
      this.pPos[o] += this.pVel[o] * dt;
      this.pPos[o + 1] += this.pVel[o + 1] * dt;
      this.pPos[o + 2] += this.pVel[o + 2] * dt;
      if (this.pPos[o + 1] < 0.02) {
        this.pPos[o + 1] = 0.02;
        this.pVel[o + 1] *= -0.28;
        this.pVel[o] *= 0.7; this.pVel[o + 2] *= 0.7;
      }
      const f = Math.min(1, this.pLife[i] / (this.pMax[i] * 0.6));
      this.pCol[o] = this.pBaseCol[o] * f;
      this.pCol[o + 1] = this.pBaseCol[o + 1] * f;
      this.pCol[o + 2] = this.pBaseCol[o + 2] * f;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;

    for (const t of this.tracers) {
      if (t.life <= 0) continue;
      t.life -= dt;
      t.line.material.opacity = Math.max(0, t.life / t.max * 0.9);
      if (t.life <= 0) t.line.visible = false;
    }

    for (const p of this.puffs) {
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life <= 0) { p.sp.visible = false; continue; }
      const k = 1 - p.life / p.max;
      p.sp.position.y += p.vy * dt;
      p.vy *= Math.max(0, 1 - dt * 0.6);
      p.sp.material.rotation += p.spin * dt;
      const s = p.size * (0.4 + k * 1.5);
      p.sp.scale.set(s, s, 1);
      p.sp.material.opacity = p.startOpacity * (1 - k) * (1 - k * 0.3);
    }

    for (const s of this.shells) {
      if (s.life <= 0) continue;
      s.life -= dt;
      if (s.life <= 0) { s.m.visible = false; continue; }
      s.vel.y -= 12 * dt;
      s.m.position.addScaledVector(s.vel, dt);
      s.m.rotation.x += s.spin.x * dt;
      s.m.rotation.y += s.spin.y * dt;
      s.m.rotation.z += s.spin.z * dt;
      if (s.m.position.y < 0.02) {
        s.m.position.y = 0.02;
        s.vel.y = Math.abs(s.vel.y) * 0.32;
        s.vel.x *= 0.6; s.vel.z *= 0.6;
        s.spin.multiplyScalar(0.6);
      }
    }

    for (const d of this.decals) {
      if (d.life <= 0) continue;
      d.life -= dt;
      if (d.life <= 0) { d.m.visible = false; continue; }
      if (d.life < 3) d.m.material.opacity = Math.max(0, d.life / 3) * 0.88;
    }

    for (const r of this.rings) {
      if (r.life <= 0) continue;
      r.life -= dt;
      if (r.life <= 0) { r.m.visible = false; continue; }
      const k = 1 - r.life / r.max;
      r.m.scale.setScalar(1 + k * 7);
      r.m.material.opacity = (1 - k) * 0.85;
    }
  }

  reset() {
    for (let i = 0; i < this.maxParticles; i++) { this.pLife[i] = 0; this.pCol[i * 3] = this.pCol[i * 3 + 1] = this.pCol[i * 3 + 2] = 0; }
    this.points.geometry.attributes.color.needsUpdate = true;
    for (const t of this.tracers) { t.life = 0; t.line.visible = false; }
    for (const p of this.puffs) { p.life = 0; p.sp.visible = false; }
    for (const s of this.shells) { s.life = 0; s.m.visible = false; }
    for (const d of this.decals) { d.life = 0; d.m.visible = false; }
    for (const r of this.rings) { r.life = 0; r.m.visible = false; }
  }
}
