import * as THREE from 'three';
import { catFurTexture } from './textures.js';

const TYPES = {
  grunt: {
    scale: 1, health: 110, speed: 3.15, preferred: 11, attackRange: 23,
    cooldown: [1.45, 2.35], damage: 8, score: 100, headScale: 1,
    furs: [['#c07a3c', '#7a421d'], ['#8a8d86', '#4b4b45'], ['#d8c8a5', '#a08a64'], ['#5c5b58', '#333330']],
    accent: 0x334a35, visor: 0x7bc8ff
  },
  scout: {
    scale: 0.84, health: 65, speed: 4.65, preferred: 8.5, attackRange: 18,
    cooldown: [0.85, 1.35], damage: 5, score: 150, headScale: 0.9,
    furs: [['#d0a05e', '#8c6231'], ['#7f7a70', '#4a463f'], ['#d9cbb4', '#9f8b6e']],
    accent: 0x2f4f55, visor: 0x5fffe0
  },
  heavy: {
    scale: 1.32, health: 280, speed: 1.9, preferred: 13.5, attackRange: 26,
    cooldown: [2.1, 2.9], damage: 17, score: 250, headScale: 1.18,
    furs: [['#6a6662', '#3c3936'], ['#8d5b3d', '#55331f'], ['#a19886', '#6a6152']],
    accent: 0x3b342f, visor: 0xff5538
  }
};

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();

function angleLerp(a, b, t) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

function segmentHitsRect(x1, z1, x2, z2, r) {
  const pad = 0.25;
  const minX = r.minX - pad, maxX = r.maxX + pad, minZ = r.minZ - pad, maxZ = r.maxZ + pad;
  let t0 = 0, t1 = 1;
  const dx = x2 - x1, dz = z2 - z1;
  for (let axis = 0; axis < 2; axis++) {
    const p = axis === 0 ? x1 : z1;
    const d = axis === 0 ? dx : dz;
    const lo = axis === 0 ? minX : minZ;
    const hi = axis === 0 ? maxX : maxZ;
    if (Math.abs(d) < 1e-6) { if (p < lo || p > hi) return false; continue; }
    let a = (lo - p) / d, b = (hi - p) / d;
    if (a > b) [a, b] = [b, a];
    t0 = Math.max(t0, a); t1 = Math.min(t1, b);
    if (t0 > t1) return false;
  }
  return true;
}

export class CatManager {
  constructor(scene, world, callbacks = {}) {
    this.scene = scene;
    this.world = world;
    this.callbacks = callbacks;
    this.enemies = [];
    this.hitMeshes = [];
    this.furTextures = new Map();
    this.muzzleTex = null;
    this.time = 0;
  }

  furMaterial(fur) {
    const key = fur.join('|');
    if (!this.furTextures.has(key)) {
      const tex = catFurTexture(fur[0], fur[1]);
      this.furTextures.set(key, tex);
    }
    return new THREE.MeshStandardMaterial({ map: this.furTextures.get(key), color: 0xffffff, roughness: 0.92, metalness: 0 });
  }

  spawn(typeName, pos, facing = 0) {
    const type = TYPES[typeName] || TYPES.grunt;
    const fur = type.furs[(Math.random() * type.furs.length) | 0];
    const furMat = this.furMaterial(fur);
    furMat.emissive.setHex(0x160b05);
    furMat.emissiveIntensity = 1;
    const bellyMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(fur[0]).lerp(new THREE.Color(0xe7d3b2), 0.34), roughness: 0.95 });
    const darkMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(fur[1]).lerp(new THREE.Color(0x10100e), 0.35), roughness: 0.94 });
    const accentMat = new THREE.MeshStandardMaterial({ color: type.accent, roughness: 0.72, metalness: 0.08 });
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x242a28, roughness: 0.42, metalness: 0.66 });
    const gunAccent = new THREE.MeshStandardMaterial({ color: 0xd06a2c, roughness: 0.45, metalness: 0.3 });
    const visorMat = new THREE.MeshStandardMaterial({ color: type.visor, emissive: type.visor, emissiveIntensity: 1.8, roughness: 0.18, metalness: 0.42 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffcf5e, emissive: 0xff9a18, emissiveIntensity: 1.25, roughness: 0.25 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0d0b09 });
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x3a2c1f, roughness: 0.8 });
    const flashMats = [furMat, bellyMat, darkMat];

    const root = new THREE.Group();
    root.position.copy(pos);
    root.rotation.y = facing;
    root.scale.setScalar(type.scale);

    const body = new THREE.Group();
    body.position.y = 0.92;
    root.add(body);

    const torso = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 16), furMat);
    torso.scale.set(0.95, 1.22, 0.78);
    torso.castShadow = true;
    body.add(torso);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 12), bellyMat);
    belly.scale.set(0.82, 1.0, 0.46);
    belly.position.set(0, -0.12, 0.18);
    belly.castShadow = true;
    body.add(belly);

    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.36), accentMat);
    vest.position.set(0, 0.06, 0.02);
    vest.castShadow = true;
    body.add(vest);
    const vestRim = new THREE.Mesh(new THREE.BoxGeometry(0.63, 0.08, 0.4), leatherMat);
    vestRim.position.set(0, 0.34, 0.02);
    body.add(vestRim);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.255, 0.026, 6, 22), new THREE.MeshStandardMaterial({ color: 0xb44b2c, roughness: 0.68 }));
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.48, 0.02);
    body.add(collar);
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), new THREE.MeshStandardMaterial({ color: 0xe5b34e, roughness: 0.28, metalness: 0.75 }));
    bell.position.set(0, 0.44, 0.28);
    body.add(bell);
    for (const s of [-1, 1]) {
      const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.19, 0.12), leatherMat);
      pouch.position.set(s * 0.2, -0.1, 0.23);
      pouch.rotation.z = s * 0.06;
      body.add(pouch);
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.05), leatherMat);
      strap.position.set(s * 0.19, 0.17, 0.24);
      strap.rotation.z = s * 0.16;
      body.add(strap);
    }

    const shoulders = [];
    for (const s of [-1, 1]) {
      const shoulder = new THREE.Group();
      shoulder.position.set(s * 0.35, 0.3, 0.02);
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.38, 4, 8), furMat);
      arm.position.set(0, -0.22, 0.05);
      arm.rotation.x = s === 1 ? -0.65 : -1.15;
      arm.rotation.z = s === 1 ? -0.15 : 0.18;
      arm.castShadow = true;
      shoulder.add(arm);
      const paw = new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 10), furMat);
      paw.scale.set(1, 0.9, 1.1);
      paw.position.set(s === 1 ? -0.11 : 0.12, -0.41, 0.21);
      paw.castShadow = true;
      shoulder.add(paw);
      body.add(shoulder);
      shoulders.push(shoulder);
    }

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.62, 0.04);
    body.add(headGroup);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 22, 18), furMat);
    head.scale.set(1.05, 0.98, 0.96);
    head.castShadow = true;
    headGroup.add(head);

    const cheeks = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), bellyMat);
    cheeks.scale.set(1.1, 0.7, 0.75);
    cheeks.position.set(0, -0.11, 0.16);
    headGroup.add(cheeks);
    const noseMuzzle = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 10), bellyMat);
    noseMuzzle.scale.set(1.25, 0.8, 1);
    noseMuzzle.position.set(0, -0.08, 0.28);
    headGroup.add(noseMuzzle);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.043, 8, 6), new THREE.MeshStandardMaterial({ color: 0xd47b7c, roughness: 0.5 }));
    nose.scale.set(1.25, 0.8, 0.8);
    nose.position.set(0, -0.03, 0.405);
    headGroup.add(nose);
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.055, 0.012), pupilMat);
    mouth.position.set(0, -0.11, 0.398);
    headGroup.add(mouth);

    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), eyeMat);
      eye.scale.set(1.2, 1.05, 0.55);
      eye.position.set(s * 0.132, 0.065, 0.307);
      headGroup.add(eye);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.019, 8, 8), pupilMat);
      pupil.scale.set(0.5, 1.5, 0.4);
      pupil.position.set(s * 0.132, 0.065, 0.348);
      headGroup.add(pupil);

      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.165, 0.38, 4), furMat);
      ear.position.set(s * 0.21, 0.35, -0.01);
      ear.rotation.z = s * -0.33;
      ear.rotation.y = Math.PI / 4;
      ear.castShadow = true;
      headGroup.add(ear);
      const inner = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.23, 4), new THREE.MeshStandardMaterial({ color: 0xc9847e, roughness: 0.8 }));
      inner.position.set(s * 0.21, 0.35, 0.035);
      inner.rotation.z = s * -0.33;
      inner.rotation.y = Math.PI / 4;
      headGroup.add(inner);
    }

    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.335, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.42), accentMat);
    helmet.position.set(0, 0.135, -0.03);
    helmet.castShadow = true;
    headGroup.add(helmet);
    const helmetRim = new THREE.Mesh(new THREE.TorusGeometry(0.326, 0.026, 6, 22), leatherMat);
    helmetRim.rotation.x = Math.PI / 2;
    helmetRim.position.set(0, 0.15, -0.03);
    headGroup.add(helmetRim);
    if (typeName === 'heavy') {
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.09, 0.06), visorMat);
      visor.position.set(0, 0.06, 0.35);
      headGroup.add(visor);
      for (const s of [-1, 1]) {
        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.26, 0.34), accentMat);
        plate.position.set(s * 0.38, 0.31, 0.0);
        plate.rotation.z = s * 0.26;
        plate.castShadow = true;
        body.add(plate);
      }
    } else if (typeName === 'scout') {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.328, 0.018, 5, 22), new THREE.MeshStandardMaterial({ color: 0x242a28, roughness: 0.6 }));
      band.rotation.x = Math.PI / 2;
      band.position.set(0, 0.15, -0.03);
      headGroup.add(band);
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.12, 12), visorMat);
      lens.rotation.z = Math.PI / 2;
      lens.position.set(0.22, 0.17, 0.13);
      headGroup.add(lens);
    } else {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.22), leatherMat);
      cap.position.set(-0.08, 0.38, 0.1);
      cap.rotation.z = 0.15;
      headGroup.add(cap);
    }

    const whiskerMat = new THREE.LineBasicMaterial({ color: 0xf3e3c8, transparent: true, opacity: 0.34 });
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const g = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(s * 0.12, -0.03 + i * 0.035, 0.36),
          new THREE.Vector3(s * (0.43 + i * 0.02), 0.02 + i * 0.05, 0.31)
        ]);
        headGroup.add(new THREE.Line(g, whiskerMat));
      }
    }

    const tailBase = new THREE.Group();
    tailBase.position.set(0.23, 0.04, -0.25);
    body.add(tailBase);
    const tailSegments = [];
    let parent = tailBase;
    for (let i = 0; i < 5; i++) {
      const seg = new THREE.Group();
      seg.position.y = i === 0 ? 0 : 0.17;
      const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.078 - i * 0.008, 0.13, 4, 7), i === 4 ? darkMat : furMat);
      mesh.position.y = 0.06;
      mesh.rotation.x = 0.5;
      mesh.castShadow = true;
      seg.add(mesh);
      if (i === 4) {
        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), darkMat);
        tip.position.y = 0.15;
        seg.add(tip);
      }
      parent.add(seg);
      tailSegments.push(seg);
      parent = seg;
    }
    tailBase.rotation.x = -0.95;
    tailBase.rotation.z = 1.02;

    const legs = [];
    for (const s of [-1, 1]) {
      const leg = new THREE.Group();
      leg.position.set(s * 0.2, -0.3, 0.02);
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.28, 4, 8), furMat);
      thigh.position.y = -0.16;
      thigh.castShadow = true;
      leg.add(thigh);
      const shin = new THREE.Group();
      shin.position.y = -0.37;
      const shinMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.24, 4, 8), darkMat);
      shinMesh.position.y = -0.1;
      shinMesh.castShadow = true;
      shin.add(shinMesh);
      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.12, 0.34), leatherMat);
      boot.position.set(0, -0.27, 0.06);
      boot.castShadow = true;
      shin.add(boot);
      leg.add(shin);
      body.add(leg);
      legs.push({ leg, shin });
    }

    const gun = new THREE.Group();
    gun.position.set(0.3, 0.14, 0.27);
    gun.rotation.set(0.05, 0.12, -0.05);
    body.add(gun);
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.14, 0.54), gunMat);
    receiver.position.z = 0.12;
    receiver.castShadow = true;
    gun.add(receiver);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.037, 0.53, 10), gunMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.015, 0.62);
    barrel.castShadow = true;
    gun.add(barrel);
    const shroud = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.07, 0.26), gunAccent);
    shroud.position.set(0, 0.01, 0.42);
    gun.add(shroud);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.25, 0.13), gunMat);
    mag.position.set(0, -0.16, 0.13);
    mag.rotation.x = 0.16;
    gun.add(mag);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.23), gunMat);
    stock.position.set(0, 0.01, -0.23);
    gun.add(stock);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.09, 8), visorMat);
    core.rotation.x = Math.PI / 2;
    core.position.set(0, 0.035, 0.3);
    gun.add(core);
    const muzzle = new THREE.Object3D();
    muzzle.position.set(0, 0.015, 0.9);
    gun.add(muzzle);
    const muzzleFlash = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.muzzleTexture(), color: type.visor, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    muzzleFlash.scale.set(0.55, 0.55, 1);
    muzzleFlash.position.copy(muzzle.position);
    muzzleFlash.visible = false;
    gun.add(muzzleFlash);

    const hitBody = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 6), invisibleMat());
    hitBody.scale.set(1, 1.35, 0.9);
    hitBody.position.y = 0.05;
    body.add(hitBody);
    const hitHead = new THREE.Mesh(new THREE.SphereGeometry(0.37, 8, 6), invisibleMat());
    hitHead.position.set(0, 0.02, 0.02);
    headGroup.add(hitHead);

    const enemy = {
      type: typeName, typeData: type, root, body, headGroup, legs, shoulders, tailSegments,
      gun, muzzle, muzzleFlash, materialList: [furMat, bellyMat, darkMat, accentMat, gunMat, gunAccent],
      flashMats, visorMat, hitBody, hitHead,
      health: type.health, maxHealth: type.health, speed: type.speed, preferred: type.preferred,
      attackRange: type.attackRange, attackCooldown: 0.8 + Math.random() * 1.2, attackTimer: 0,
      damage: type.damage, score: type.score, headScale: type.headScale,
      dead: false, deathTimer: 0, hitFlash: 0, hurtTimer: 0, stagger: 0,
      walkPhase: Math.random() * 10, bobSeed: Math.random() * 5, strafeDir: Math.random() > 0.5 ? 1 : -1,
      fireCooldownBase: type.cooldown, flashTimer: 0, aimYaw: 0,
      position: root.position, velocity: new THREE.Vector3(), yaw: facing,
      dyingRotation: 0
    };
    hitBody.userData = { enemy, part: 'body' };
    hitHead.userData = { enemy, part: 'head' };
    enemy.hitMeshes = [hitBody, hitHead];
    enemy.spawnScale = type.scale;
    root.scale.setScalar(type.scale * 0.35);

    this.scene.add(root);
    this.enemies.push(enemy);
    for (const h of enemy.hitMeshes) { h.userData.enemy = enemy; this.hitMeshes.push(h); }

    if (this.callbacks.onSpawn) this.callbacks.onSpawn(enemy);
    return enemy;
  }

  muzzleTexture() {
    if (!this.muzzleTex) {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.3, 'rgba(180,240,255,.75)');
      g.addColorStop(1, 'rgba(80,200,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      this.muzzleTex = new THREE.CanvasTexture(c);
    }
    return this.muzzleTex;
  }

  hasLineOfSight(enemy, playerPos) {
    const a = enemy.position, b = playerPos;
    for (const r of this.world.colliders) {
      if (segmentHitsRect(a.x, a.z, b.x, b.z, r)) return false;
    }
    return true;
  }

  damage(enemy, amount, part, point, direction) {
    if (!enemy || enemy.dead) return false;
    const head = part === 'head';
    const dealt = Math.round(amount * (head ? 2.25 * enemy.headScale : 1));
    enemy.health -= dealt;
    enemy.hitFlash = 1;
    enemy.hurtTimer = 0.16;
    enemy.stagger = Math.max(enemy.stagger, head ? 0.28 : 0.14);
    if (direction) {
      enemy.velocity.addScaledVector(direction, head ? 1.6 : 0.8);
    }
    if (this.callbacks.onDamage) this.callbacks.onDamage(enemy, dealt, head, point);
    if (enemy.health <= 0) {
      this.kill(enemy, head, point, direction);
      return { killed: true, dealt, head };
    }
    return { killed: false, dealt, head };
  }

  kill(enemy, head, point, direction) {
    enemy.dead = true;
    enemy.deathTimer = 0;
    enemy.deathSpin = (Math.random() - 0.5) * 2;
    enemy.deathDir = direction ? direction.clone() : new THREE.Vector3(0, 0, 1);
    if (this.callbacks.onKill) this.callbacks.onKill(enemy, head, point);
    const idx = this.hitMeshes.indexOf(enemy.hitHead);
    if (idx >= 0) {
      for (const h of enemy.hitMeshes) {
        const i = this.hitMeshes.indexOf(h);
        if (i >= 0) this.hitMeshes.splice(i, 1);
      }
    }
  }

  update(dt, time, playerPos) {
    this.time = time;
    const alive = this.enemies.filter(e => !e.dead);
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.attackCooldown -= dt;
      e.hurtTimer = Math.max(0, e.hurtTimer - dt);
      e.stagger = Math.max(0, e.stagger - dt);
      e.hitFlash = Math.max(0, e.hitFlash - dt * 5.5);
      e.flashTimer = Math.max(0, e.flashTimer - dt);

      const flashIntensity = e.hitFlash * 2.4;
      for (const m of e.flashMats) {
        if (m.emissive) m.emissive.setRGB(0.055 + flashIntensity * 0.75, 0.028 + flashIntensity * 0.48, 0.012 + flashIntensity * 0.22);
      }
      e.muzzleFlash.visible = e.attackTimer > 0;
      if (e.attackTimer > 0) e.attackTimer -= dt;

      if (e.dead) {
        e.deathTimer += dt;
        const t = Math.min(1, e.deathTimer / 0.55);
        const ease = 1 - Math.pow(1 - t, 3);
        e.root.rotation.z = ease * (1.15 + e.deathSpin * 0.2);
        e.root.rotation.x = ease * -0.25;
        e.body.position.y = 0.92 - ease * 0.5;
        e.root.position.addScaledVector(e.deathDir, dt * 0.8);
        if (e.deathTimer > 1.1) {
          const fade = Math.max(0, 1 - (e.deathTimer - 1.1) / 1.2);
          for (const m of e.materialList) {
            if (!m.transparent && m.opacity === 1) { m.transparent = true; }
            m.opacity = fade;
          }
          e.root.position.y -= dt * 0.28;
        }
        if (e.deathTimer > 2.4) {
          this.scene.remove(e.root);
          this.enemies.splice(i, 1);
          disposeGroup(e.root);
        }
        continue;
      }

      if (e.spawnScale !== undefined && e.root.scale.x < e.spawnScale * 0.999) {
        const s = Math.min(e.spawnScale, e.root.scale.x + dt * 10);
        e.root.scale.setScalar(s);
      }

      const dx = playerPos.x - e.position.x;
      const dz = playerPos.z - e.position.z;
      const dist = Math.hypot(dx, dz) || 0.001;
      const nx = dx / dist, nz = dz / dist;

      if (e.stagger <= 0) {
        let desiredX = 0, desiredZ = 0;
        const los = this.hasLineOfSight(e, playerPos);
        if (!los || dist > e.preferred * 1.12) {
          desiredX += nx; desiredZ += nz;
        } else if (dist < e.preferred * 0.55) {
          desiredX -= nx * 1.1; desiredZ -= nz * 1.1;
        } else {
          desiredX += -nz * e.strafeDir * 0.9;
          desiredZ += nx * e.strafeDir * 0.9;
          desiredX += nx * 0.2; desiredZ += nz * 0.2;
        }
        for (const other of alive) {
          if (other === e) continue;
          const ox = e.position.x - other.position.x;
          const oz = e.position.z - other.position.z;
          const od = Math.hypot(ox, oz);
          if (od > 0.001 && od < 1.35) {
            desiredX += (ox / od) * (1.35 - od) * 1.7;
            desiredZ += (oz / od) * (1.35 - od) * 1.7;
          }
        }
        for (const r of this.world.colliders) {
          const cx = Math.max(r.minX, Math.min(e.position.x, r.maxX));
          const cz = Math.max(r.minZ, Math.min(e.position.z, r.maxZ));
          const ox = e.position.x - cx, oz = e.position.z - cz;
          const od = Math.hypot(ox, oz);
          if (od < 1.35 && od > 0.001) {
            desiredX += (ox / od) * (1.35 - od) * 2.4;
            desiredZ += (oz / od) * (1.35 - od) * 2.4;
          }
        }
        const len = Math.hypot(desiredX, desiredZ) || 1;
        const targetSpeed = e.speed * (e.stagger > 0 ? 0.15 : 1);
        const tvx = (desiredX / len) * targetSpeed;
        const tvz = (desiredZ / len) * targetSpeed;
        e.velocity.x += (tvx - e.velocity.x) * Math.min(1, dt * 5);
        e.velocity.z += (tvz - e.velocity.z) * Math.min(1, dt * 5);
      } else {
        e.velocity.multiplyScalar(Math.max(0, 1 - dt * 7));
      }

      e.position.x += e.velocity.x * dt;
      e.position.z += e.velocity.z * dt;
      const bound = this.world.bounds - 0.7;
      e.position.x = Math.max(-bound, Math.min(bound, e.position.x));
      e.position.z = Math.max(-bound, Math.min(bound, e.position.z));
      for (const r of this.world.colliders) {
        const closestX = Math.max(r.minX, Math.min(e.position.x, r.maxX));
        const closestZ = Math.max(r.minZ, Math.min(e.position.z, r.maxZ));
        let ox = e.position.x - closestX, oz = e.position.z - closestZ;
        let od = Math.hypot(ox, oz);
        if (od < 0.52) {
          if (od < 0.001) {
            const left = Math.abs(e.position.x - r.minX), right = Math.abs(r.maxX - e.position.x);
            const front = Math.abs(e.position.z - r.minZ), back = Math.abs(r.maxZ - e.position.z);
            const m = Math.min(left, right, front, back);
            if (m === left) { e.position.x = r.minX - 0.52; }
            else if (m === right) { e.position.x = r.maxX + 0.52; }
            else if (m === front) { e.position.z = r.minZ - 0.52; }
            else { e.position.z = r.maxZ + 0.52; }
          } else {
            e.position.x = closestX + (ox / od) * 0.52;
            e.position.z = closestZ + (oz / od) * 0.52;
          }
        }
      }

      const targetYaw = Math.atan2(nx, nz);
      e.yaw = angleLerp(e.yaw, targetYaw, Math.min(1, dt * 7));
      e.root.rotation.y = e.yaw;

      const speed2 = Math.hypot(e.velocity.x, e.velocity.z);
      e.walkPhase += dt * (2.4 + speed2 * 2.2);
      const walk = speed2 > 0.4 ? 1 : 0.3;
      const swing = Math.sin(e.walkPhase) * 0.7 * walk;
      e.legs[0].leg.rotation.x = swing;
      e.legs[1].leg.rotation.x = -swing;
      e.legs[0].shin.rotation.x = Math.max(0, -swing) * 0.9;
      e.legs[1].shin.rotation.x = Math.max(0, swing) * 0.9;
      e.shoulders[0].rotation.x = -swing * 0.45;
      e.shoulders[1].rotation.x = swing * 0.3;
      e.body.position.y = 0.92 + Math.abs(Math.sin(e.walkPhase)) * 0.045 * walk;
      e.body.rotation.z = Math.sin(e.walkPhase) * 0.03 * walk;
      const tailSway = Math.sin(time * 2.6 + e.bobSeed) * 0.18;
      e.tailSegments.forEach((s, i) => {
        s.rotation.z = tailSway * (0.5 + i * 0.18);
        s.rotation.x = Math.sin(time * 2 + i * 0.6 + e.bobSeed) * 0.07;
      });
      e.headGroup.rotation.y = Math.sin(time * 1.3 + e.bobSeed) * 0.06;
      e.headGroup.rotation.x = e.hurtTimer > 0 ? -0.18 : Math.sin(time * 1.8 + e.bobSeed) * 0.03;

      if (e.attackCooldown <= 0 && dist < e.attackRange && e.stagger <= 0 && this.hasLineOfSight(e, playerPos)) {
        const spread = 0.045;
        const dir = new THREE.Vector3(nx + (Math.random() - 0.5) * spread, 0, nz + (Math.random() - 0.5) * spread).normalize();
        e.attackCooldown = e.fireCooldownBase[0] + Math.random() * (e.fireCooldownBase[1] - e.fireCooldownBase[0]);
        e.attackTimer = 0.08;
        if (this.callbacks.onShoot) {
          const muzzlePos = new THREE.Vector3();
          e.muzzle.getWorldPosition(muzzlePos);
          this.callbacks.onShoot(e, muzzlePos, dir);
        }
        e.body.rotation.x = -0.05;
      } else {
        e.body.rotation.x += (0 - e.body.rotation.x) * Math.min(1, dt * 6);
      }

      if (Math.random() < dt * 0.15) e.strafeDir *= -1;
    }
  }

  clear() {
    for (const e of this.enemies) {
      this.scene.remove(e.root);
      disposeGroup(e.root);
    }
    this.enemies.length = 0;
    this.hitMeshes.length = 0;
  }

  get aliveCount() {
    let n = 0;
    for (const e of this.enemies) if (!e.dead) n++;
    return n;
  }
}

function invisibleMat() {
  return new THREE.MeshBasicMaterial({ visible: false, colorWrite: false, depthWrite: false });
}

function disposeGroup(group) {
  group.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) m.dispose();
    }
  });
}

export { TYPES };
