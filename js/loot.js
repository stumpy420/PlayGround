import * as THREE from '../vendor/three.module.js';
import { rand, TAU, clamp } from './util.js';

export const LOOT = {
  scrap: { mass: 1, value: 12, label: 'SCRAP', color: 0xffb057 },
  core: { mass: 3, value: 25, label: 'ETHER-CORE', color: 0x79f2ff },
  stim: { mass: 0, value: 0, label: 'NANO-STIM', color: 0x8dffb0 },
};

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const GLOW_TEX = glowTexture();

export class Pickup {
  constructor(scene, type, position) {
    this.scene = scene;
    this.type = type;
    this.def = LOOT[type];
    this.alive = true;
    this.age = 0;
    this.baseY = position.y;
    this.magnet = 0;

    const group = new THREE.Group();
    group.position.copy(position);
    this.group = group;

    if (type === 'scrap') {
      const mat = new THREE.MeshStandardMaterial({ color: 0x9d8a72, roughness: 0.55, metalness: 0.7, flatShading: true });
      for (let i = 0; i < 3; i++) {
        const bit = new THREE.Mesh(new THREE.BoxGeometry(rand(0.12, 0.24), rand(0.08, 0.16), rand(0.12, 0.3)), mat);
        bit.position.set(rand(-0.12, 0.12), rand(-0.06, 0.12), rand(-0.12, 0.12));
        bit.rotation.set(rand(0, TAU), rand(0, TAU), rand(0, TAU));
        group.add(bit);
      }
    } else if (type === 'core') {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x0d5560, emissive: 0x3fe6ff, emissiveIntensity: 1.5,
        roughness: 0.15, metalness: 0.2, flatShading: true, transparent: true, opacity: 0.95,
      });
      const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), mat);
      shard.scale.set(0.9, 2.1, 0.9);
      shard.castShadow = true;
      group.add(shard);
      this.spinMesh = shard;
    } else {
      const mat = new THREE.MeshStandardMaterial({ color: 0x163d2a, emissive: 0x39ff9a, emissiveIntensity: 0.5, roughness: 0.5 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.14), mat);
      group.add(body);
      const crossMat = new THREE.MeshBasicMaterial({ color: 0x8dffb0, toneMapped: false });
      const a = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.02), crossMat);
      a.position.z = 0.075;
      group.add(a);
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.02), crossMat);
      b.position.z = 0.075;
      group.add(b);
    }

    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: GLOW_TEX,
      color: this.def.color,
      transparent: true,
      opacity: type === 'core' ? 0.85 : 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }));
    sprite.scale.setScalar(type === 'core' ? 1.6 : 1.0);
    group.add(sprite);
    this.glow = sprite;

    scene.add(group);
  }

  update(dt, t, player) {
    this.age += dt;
    const g = this.group;
    g.rotation.y += dt * 1.6;
    g.position.y = this.baseY + 0.4 + Math.sin(t * 2.2 + this.baseY) * 0.08;

    if (this.type === 'core') {
      this.spinMesh.rotation.x += dt * 0.8;
      this.glow.material.opacity = 0.65 + Math.sin(t * 3) * 0.15;
    }

    if (!player || player.health <= 0) return;
    const dx = player.pos.x - g.position.x;
    const dz = player.pos.z - g.position.z;
    const dy = (player.pos.y + 0.9) - g.position.y;
    const dist = Math.hypot(dx, dy, dz);

    if (dist < 4.2) {
      const pull = clamp((4.2 - dist) / 4.2, 0, 1);
      const speed = 2 + pull * 14;
      const len = Math.hypot(dx, dy, dz) || 1;
      g.position.x += (dx / len) * speed * dt;
      g.position.y += (dy / len) * speed * dt;
      g.position.z += (dz / len) * speed * dt;
      this.baseY = g.position.y;
    }
  }

  dispose() {
    this.alive = false;
    this.scene.remove(this.group);
  }
}

export class CrystalNode {
  constructor(scene, data) {
    this.scene = scene;
    this.x = data.x;
    this.z = data.z;
    this.y = data.y;
    this.charges = data.charges;
    this.maxCharges = data.maxCharges;
    this.shards = data.shards;
    this.base = data.base;
    this.group = data.group;
    this.alive = true;
    this.mining = 0;
    this.t = rand(0, 10);
    this.orig = this.shards.map((s) => ({
      scale: s.scale.clone(),
      material: s.material,
    }));
  }

  reset() {
    this.charges = this.maxCharges;
    this.alive = true;
    for (let i = 0; i < this.shards.length; i++) {
      const s = this.shards[i];
      const o = this.orig[i];
      if (s.material !== o.material) {
        if (s.material && s.material.dispose) s.material.dispose();
        s.material = o.material;
      }
      s.scale.copy(o.scale);
    }
  }

  update(dt) {
    this.t += dt;
    for (let i = 0; i < this.shards.length; i++) {
      const s = this.shards[i];
      s.rotation.y += dt * 0.15;
      s.position.y += Math.sin(this.t * 1.4 + i) * 0.0006;
    }
  }

  deplete() {
    this.charges--;
    for (let i = 0; i < this.shards.length; i++) {
      const s = this.shards[i];
      const target = this.charges > 0 ? 0.82 : 0.25;
      s.scale.y *= target;
      s.scale.x *= target * 0.8 + 0.2;
      s.scale.z *= target * 0.8 + 0.2;
    }
    if (this.charges <= 0) {
      this.alive = false;
      this.group.traverse((o) => {
        if (o.isMesh && o.material && o.material.emissive) {
          o.material = o.material.clone();
          o.material.emissiveIntensity = 0.05;
          o.material.color.setHex(0x2a2a2a);
        }
      });
    }
  }
}

export class Crate {
  constructor(scene, data) {
    this.scene = scene;
    this.x = data.x;
    this.z = data.z;
    this.y = data.y;
    this.group = data.group;
    this.lidPivot = data.lidPivot;
    this.opened = data.opened;
    this.openT = 0;
  }

  reset() {
    this.opened = false;
    this.openT = 0;
    this.lidPivot.rotation.x = 0;
  }

  update(dt) {
    if (this.opened && this.openT < 1) {
      this.openT = Math.min(1, this.openT + dt * 3.2);
      this.lidPivot.rotation.x = -1.35 * (1 - Math.pow(1 - this.openT, 3));
    }
  }
}
