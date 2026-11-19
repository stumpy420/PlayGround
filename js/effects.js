// ============ VISUAL EFFECTS ============
import * as THREE from 'three';
import { rand } from './util.js';

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,.85)');
  g.addColorStop(0.55, 'rgba(255,255,255,.18)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function sparkTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.3, 'rgba(255,255,255,.9)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class Effects {
  constructor(scene) {
    this.scene = scene;
    this.glowTex = glowTexture();
    this.sparkTex = sparkTexture();
    this.tracers = [];
    this.flashes = [];
    this.particles = [];
    this.shells = [];
    this.explosions = [];
    this.light = new THREE.PointLight(0xffc47a, 0, 14, 2);
    this.light.castShadow = false;
    this.scene.add(this.light);
    this.lightT = 0;
    this.sparkPool = [];
    this.maxParticles = 260;
    for (let i = 0; i < this.maxParticles; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.sparkTex, color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      s.scale.set(0.12, 0.12, 1);
      s.visible = false;
      this.scene.add(s);
      this.sparkPool.push(s);
    }
  }

  getSpark() {
    return this.sparkPool.find(s => !s.visible) || null;
  }

  tracer(from, to, color = 0xffd9a0, width = 1) {
    const geo = new THREE.BufferGeometry().setFromPoints([from.clone(), to.clone()]);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
    const line = new THREE.Line(geo, mat);
    line.frustumCulled = false;
    this.scene.add(line);
    this.tracers.push({ line, life: 0.09, max: 0.09 });
  }

  impact(point, normal, color = 0xffc47a, sound = true) {
    // spark burst
    const count = 7;
    for (let i = 0; i < count; i++) {
      const s = this.getSpark();
      if (!s) break;
      s.visible = true;
      s.position.copy(point).addScaledVector(normal, 0.04);
      s.material.color.set(color);
      s.material.opacity = 0.95;
      s.scale.setScalar(rand(0.04, 0.11));
      const v = new THREE.Vector3(rand(-1, 1), rand(-0.3, 1.2), rand(-1, 1)).multiplyScalar(rand(1.4, 4.2)).addScaledVector(normal, rand(1, 2.5));
      s.userData = { v, life: rand(0.18, 0.4), max: 0.4 };
      this.particles.push(s);
    }
    // flash sprite
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    sprite.position.copy(point).addScaledVector(normal, 0.06);
    sprite.scale.setScalar(rand(0.25, 0.5));
    this.scene.add(sprite);
    this.flashes.push({ sprite, life: 0.07, max: 0.07, grow: 1.6 });
    // dust puff
    const dust = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0x8a8174, transparent: true, opacity: 0.28, depthWrite: false }));
    dust.position.copy(point).addScaledVector(normal, 0.1);
    dust.scale.setScalar(0.35);
    this.scene.add(dust);
    this.flashes.push({ sprite: dust, life: 0.4, max: 0.4, grow: 2.6, fade: 0.25 });
  }

  muzzleFlash(worldPos, dir, color = 0xffc987) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
    sprite.position.copy(worldPos);
    sprite.scale.setScalar(rand(0.25, 0.45));
    this.scene.add(sprite);
    this.flashes.push({ sprite, life: 0.055, max: 0.055, grow: 1.2 });
    this.light.position.copy(worldPos);
    this.light.color.set(color);
    this.light.intensity = 14;
    this.lightT = 0.06;
  }

  hitBurst(point, color = 0x5ce8d4) {
    for (let i = 0; i < 9; i++) {
      const s = this.getSpark();
      if (!s) break;
      s.visible = true;
      s.position.copy(point);
      s.material.color.set(color);
      s.material.opacity = 1;
      s.scale.setScalar(rand(0.05, 0.13));
      const v = new THREE.Vector3(rand(-2, 2), rand(0.2, 2.4), rand(-2, 2));
      s.userData = { v, life: rand(0.2, 0.45), max: 0.45 };
      this.particles.push(s);
    }
  }

  killBurst(point, color = 0xff5f52) {
    this.hitBurst(point, color);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.28, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    ring.position.copy(point);
    ring.lookAt(point.clone().add(new THREE.Vector3(0, 0, 1)));
    this.scene.add(ring);
    this.explosions.push({ mesh: ring, life: 0.35, max: 0.35, type: 'ring' });
  }

  shell(pos, dir) {
    if (this.shells.length > 26) {
      const old = this.shells.shift();
      this.scene.remove(old.mesh);
      old.mesh.geometry.dispose();
      old.mesh.material.dispose();
    }
    const geo = new THREE.CylinderGeometry(0.012, 0.012, 0.045, 6);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xc8a75a, metalness: 0.9, roughness: 0.3 }));
    m.position.copy(pos);
    const v = new THREE.Vector3(rand(-1.2, 1.2), rand(0.8, 2), rand(-1.2, 1.2)).addScaledVector(dir, 0.8);
    this.scene.add(m);
    this.shells.push({ mesh: m, v, life: 2.2, spin: new THREE.Vector3(rand(-12, 12), rand(-12, 12), rand(-12, 12)) });
  }

  explosion(pos, color = 0xffb454) {
    const light = new THREE.PointLight(color, 90, 30, 2);
    light.position.copy(pos).add(new THREE.Vector3(0, 1, 0));
    this.scene.add(light);
    this.explosions.push({ light, life: 0.4, max: 0.4, type: 'light', base: 90 });

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    sphere.position.copy(pos).add(new THREE.Vector3(0, 0.7, 0));
    this.scene.add(sphere);
    this.explosions.push({ mesh: sphere, life: 0.28, max: 0.28, type: 'sphere', base: 0.4, target: 4.6 });

    const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.8, 32), new THREE.MeshBasicMaterial({ color: 0xffe0b0, transparent: true, opacity: 0.8, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(pos.x, 0.08, pos.z);
    this.scene.add(ring);
    this.explosions.push({ mesh: ring, life: 0.5, max: 0.5, type: 'ring', base: 1, target: 9 });

    for (let i = 0; i < 26; i++) {
      const s = this.getSpark();
      if (!s) break;
      s.visible = true;
      s.position.copy(pos).add(new THREE.Vector3(rand(-0.4, 0.4), rand(0.3, 1.5), rand(-0.4, 0.4)));
      s.material.color.set(i % 3 ? color : 0xfff2d4);
      s.material.opacity = 1;
      s.scale.setScalar(rand(0.08, 0.24));
      const v = new THREE.Vector3(rand(-6, 6), rand(1, 8), rand(-6, 6));
      s.userData = { v, life: rand(0.3, 0.8), max: 0.8 };
      this.particles.push(s);
    }
    // smoke
    for (let i = 0; i < 10; i++) {
      const sm = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0x2a2a28, transparent: true, opacity: 0.35, depthWrite: false }));
      sm.position.set(pos.x + rand(-1.4, 1.4), rand(0.5, 2), pos.z + rand(-1.4, 1.4));
      sm.scale.setScalar(rand(0.8, 1.8));
      this.scene.add(sm);
      this.explosions.push({ smoke: sm, life: rand(0.8, 1.5), max: 1.5, type: 'smoke', vy: rand(0.4, 1.2) });
    }
  }

  update(dt) {
    // light flash
    if (this.lightT > 0) {
      this.lightT -= dt;
      this.light.intensity = Math.max(0, this.light.intensity - dt * 260);
    } else this.light.intensity = 0;

    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.life -= dt;
      t.line.material.opacity = Math.max(0, t.life / t.max) * 0.9;
      if (t.life <= 0) {
        this.scene.remove(t.line);
        t.line.geometry.dispose();
        t.line.material.dispose();
        this.tracers.splice(i, 1);
      }
    }

    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      f.life -= dt;
      const k = 1 - f.life / f.max;
      f.sprite.scale.setScalar(f.sprite.scale.x * (1 + f.grow * dt));
      f.sprite.material.opacity = Math.max(0, (1 - k) * (f.fade || 0.95));
      if (f.life <= 0) {
        this.scene.remove(f.sprite);
        f.sprite.material.dispose();
        this.flashes.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      const u = p.userData;
      u.life -= dt;
      if (u.life <= 0) {
        p.visible = false;
        if (p.isSprite && !this.sparkPool.includes(p)) { this.scene.remove(p); p.material.dispose(); }
        this.particles.splice(i, 1);
        continue;
      }
      u.v.y -= 9.8 * dt * 0.6;
      p.position.addScaledVector(u.v, dt);
      p.material.opacity = Math.min(1, u.life / u.max) * 0.95;
    }

    for (let i = this.shells.length - 1; i >= 0; i--) {
      const s = this.shells[i];
      s.life -= dt;
      s.v.y -= 16 * dt;
      s.mesh.position.addScaledVector(s.v, dt);
      if (s.mesh.position.y < 0.03) { s.mesh.position.y = 0.03; s.v.y *= -0.32; s.v.x *= 0.6; s.v.z *= 0.6; }
      s.mesh.rotation.x += s.spin.x * dt; s.mesh.rotation.y += s.spin.y * dt; s.mesh.rotation.z += s.spin.z * dt;
      if (s.life <= 0) {
        this.scene.remove(s.mesh);
        s.mesh.geometry.dispose(); s.mesh.material.dispose();
        this.shells.splice(i, 1);
      }
    }

    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const e = this.explosions[i];
      e.life -= dt;
      const k = 1 - e.life / e.max;
      if (e.type === 'light') e.light.intensity = e.base * (1 - k) * (1 - k);
      if (e.type === 'sphere') { e.mesh.scale.setScalar(e.base + (e.target - e.base) * k); e.mesh.material.opacity = 0.9 * (1 - k); }
      if (e.type === 'ring') { const s = e.base + (e.target - e.base) * k; e.mesh.scale.setScalar(Math.max(1, s)); e.mesh.material.opacity = 0.8 * (1 - k); }
      if (e.type === 'smoke') { e.smoke.position.y += e.vy * dt; e.smoke.material.opacity = 0.35 * (1 - k); e.smoke.scale.multiplyScalar(1 + dt * 0.6); }
      if (e.life <= 0) {
        if (e.light) this.scene.remove(e.light);
        if (e.mesh) { this.scene.remove(e.mesh); e.mesh.geometry.dispose(); e.mesh.material.dispose(); }
        if (e.smoke) { this.scene.remove(e.smoke); e.smoke.material.dispose(); }
        this.explosions.splice(i, 1);
      }
    }
  }

  clear() {
    for (const t of this.tracers) { this.scene.remove(t.line); t.line.geometry.dispose(); t.line.material.dispose(); }
    this.tracers.length = 0;
    for (const f of this.flashes) { this.scene.remove(f.sprite); f.sprite.material.dispose(); }
    this.flashes.length = 0;
    for (const p of this.particles) { p.visible = false; if (!this.sparkPool.includes(p)) this.scene.remove(p); }
    this.particles.length = 0;
    for (const s of this.shells) { this.scene.remove(s.mesh); s.mesh.geometry.dispose(); s.mesh.material.dispose(); }
    this.shells.length = 0;
    for (const e of this.explosions) {
      if (e.light) this.scene.remove(e.light);
      if (e.mesh) { this.scene.remove(e.mesh); e.mesh.geometry.dispose(); e.mesh.material.dispose(); }
      if (e.smoke) { this.scene.remove(e.smoke); e.smoke.material.dispose(); }
    }
    this.explosions.length = 0;
  }
}
