import * as THREE from '../vendor/three.module.js';
import { terrainHeight, clamp, damp, rand, lerp, HUB } from './util.js';

const UP = new THREE.Vector3(0, 1, 0);
const MAG_SIZE = 30;
const RELOAD_TIME = 1.85;
const BASE_FOV = 74;
const ADS_FOV = 52;

// A tapered limb segment running from `from` to `to`. Used to connect the
// viewmodel's gloves back to the player's sleeves so the rifle reads as held.
function addLimb(group, from, to, rFrom, rTo, material) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = dir.length();
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(rTo, rFrom, len, 8, 1),
    material
  );
  mesh.position.copy(from).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
  group.add(mesh);
  return mesh;
}

function flashTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,240,1)');
  g.addColorStop(0.25, 'rgba(255,210,130,0.95)');
  g.addColorStop(0.55, 'rgba(255,120,30,0.5)');
  g.addColorStop(1, 'rgba(255,80,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildRifle() {
  const group = new THREE.Group();

  const gunmetal = new THREE.MeshStandardMaterial({ color: 0x383d44, roughness: 0.5, metalness: 0.3 });
  const polymer = new THREE.MeshStandardMaterial({ color: 0x24262a, roughness: 0.8, metalness: 0.2 });
  const accent = new THREE.MeshStandardMaterial({ color: 0xff8a2b, emissive: 0xb84a08, emissiveIntensity: 0.9, roughness: 0.4, metalness: 0.4 });
  const glove = new THREE.MeshStandardMaterial({ color: 0x241f1b, roughness: 0.95 });
  const knuckle = new THREE.MeshStandardMaterial({ color: 0x9a6533, roughness: 0.7, metalness: 0.2 });
  const sleeve = new THREE.MeshStandardMaterial({ color: 0x45453c, roughness: 0.98, metalness: 0.02 });
  const sleeveDark = new THREE.MeshStandardMaterial({ color: 0x2b2c27, roughness: 1 });
  const cuff = new THREE.MeshStandardMaterial({ color: 0x6d5839, roughness: 0.85 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.12, 0.5), gunmetal);
  body.position.set(0, 0, -0.1);
  group.add(body);

  const upper = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.44), polymer);
  upper.position.set(0, 0.075, -0.13);
  group.add(upper);

  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.018, 0.4), gunmetal);
  rail.position.set(0, 0.108, -0.14);
  group.add(rail);

  const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.075, 0.3), polymer);
  handguard.position.set(0, 0.005, -0.44);
  group.add(handguard);

  for (let i = 0; i < 3; i++) {
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.012, 0.035), gunmetal);
    vent.position.set(0, 0.03, -0.36 - i * 0.075);
    group.add(vent);
  }

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.018, 0.34, 10), gunmetal);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.015, -0.7);
  group.add(barrel);

  const brake = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.045, 0.09), gunmetal);
  brake.position.set(0, 0.015, -0.87);
  group.add(brake);

  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.17, 0.095), polymer);
  mag.position.set(0, -0.135, -0.055);
  mag.rotation.x = -0.14;
  group.add(mag);

  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.065), polymer);
  grip.position.set(0, -0.115, 0.09);
  grip.rotation.x = 0.3;
  group.add(grip);

  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.1), polymer);
  stock.position.set(0, -0.005, 0.19);
  group.add(stock);

  // orange identification stripes
  const stripeL = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.02, 0.16), accent);
  stripeL.position.set(-0.049, 0.01, -0.2);
  group.add(stripeL);
  const stripeR = stripeL.clone();
  stripeR.position.x = 0.049;
  group.add(stripeR);

  const dot = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.02), new THREE.MeshBasicMaterial({ color: 0xff3b46 }));
  dot.position.set(0, 0.075, 0.02);
  group.add(dot);

  // rear sight: two posts with an open notch so ADS lines up on the target
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.045, 0.02), gunmetal);
    post.position.set(side * 0.022, 0.135, 0.02);
    group.add(post);
  }
  const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.055, 0.02), gunmetal);
  frontSight.position.set(0, 0.125, -0.56);
  group.add(frontSight);

  // hands
  const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.08, 0.1), glove);
  rightHand.position.set(0.01, -0.1, 0.07);
  rightHand.rotation.z = -0.12;
  group.add(rightHand);
  const rightKnuckle = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.02, 0.08), knuckle);
  rightKnuckle.position.set(0.01, -0.062, 0.055);
  group.add(rightKnuckle);

  const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.12), glove);
  leftHand.position.set(-0.01, -0.08, -0.44);
  leftHand.rotation.z = 0.18;
  group.add(leftHand);

  // forearms and upper arms, running off the bottom of the frame so the
  // rifle and gloves read as attached to a body instead of floating
  const rightWrist = new THREE.Vector3(0.012, -0.155, 0.075);
  const rightElbow = new THREE.Vector3(0.155, -0.47, 0.35);
  const rightShoulder = new THREE.Vector3(0.36, -0.94, 0.64);
  addLimb(group, rightWrist, rightElbow, 0.042, 0.058, sleeve);
  addLimb(group, rightElbow, rightShoulder, 0.062, 0.082, sleeveDark);
  addLimb(group, rightWrist, rightWrist.clone().lerp(rightElbow, 0.16), 0.049, 0.05, cuff);

  const leftWrist = new THREE.Vector3(-0.012, -0.125, -0.425);
  const leftElbow = new THREE.Vector3(-0.18, -0.45, 0.04);
  const leftShoulder = new THREE.Vector3(-0.42, -0.95, 0.42);
  addLimb(group, leftWrist, leftElbow, 0.04, 0.056, sleeve);
  addLimb(group, leftElbow, leftShoulder, 0.06, 0.08, sleeveDark);
  addLimb(group, leftWrist, leftWrist.clone().lerp(leftElbow, 0.16), 0.047, 0.048, cuff);

  // muzzle flash
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({
    map: flashTexture(),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    toneMapped: false,
  }));
  flash.position.set(0, 0.015, -0.94);
  flash.scale.setScalar(0.5);
  flash.visible = false;
  group.add(flash);

  const flashLight = new THREE.PointLight(0xffb060, 0, 14, 2);
  flashLight.position.set(0, 0.02, -0.9);
  group.add(flashLight);

  return { group, flash, flashLight, mag };
}

export class Player {
  constructor({ camera, scene, game }) {
    this.camera = camera;
    this.scene = scene;
    this.game = game;

    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.yaw = 0;
    this.pitch = 0;
    this.eye = 1.68;
    this.radius = 0.52;

    this.health = 100;
    this.maxHealth = 100;
    this.stamina = 100;
    this.onGround = true;

    this.mag = MAG_SIZE;
    this.reserve = 150;
    this.magSize = MAG_SIZE;
    this.reloadT = 0;
    this.fireT = 0;
    this.bloom = 0;
    this.ads = false;
    this.fov = BASE_FOV;

    this.recoilPitch = 0;
    this.recoilYaw = 0;
    this.kick = 0;
    this.shake = 0;
    this.flashT = 0;
    this.landDip = 0;
    this.bobPhase = 0;
    this.stepPhase = 0;
    this.roll = 0;

    this.aimDir = new THREE.Vector3();
    this.tmpRight = new THREE.Vector3();
    this.tmpUp = new THREE.Vector3();

    const rifle = buildRifle();
    this.rifle = rifle;
    this.viewmodel = rifle.group;
    this.viewmodel.rotation.set(0, 0.02, 0);
    camera.add(this.viewmodel);

    const fill = new THREE.PointLight(0xffd2a8, 1.8, 2.5, 2);
    fill.position.set(0.12, 0.02, 0.15);
    camera.add(fill);

    this.basePos = new THREE.Vector3();
    this.adsPos = new THREE.Vector3();
    this.layout(window.innerWidth);
    this.viewmodel.position.copy(this.basePos);
    this.visible = false;
    this.viewmodel.visible = false;

    this.t = 0;
  }

  reset() {
    const sx = HUB.x;
    const sz = HUB.z - 12;
    this.pos.set(sx, terrainHeight(sx, sz), sz);
    this.vel.set(0, 0, 0);
    this.yaw = 0;
    this.pitch = -0.03;
    this.health = this.maxHealth;
    this.stamina = 100;
    this.mag = this.magSize;
    this.reserve = 150;
    this.reloadT = 0;
    this.fireT = 0;
    this.bloom = 0;
    this.recoilPitch = 0;
    this.recoilYaw = 0;
    this.shake = 0;
    this.onGround = true;
    this.landDip = 0;
    this.fov = BASE_FOV;
    this.camera.fov = BASE_FOV;
    this.camera.updateProjectionMatrix();
    this.viewmodel.visible = true;
  }

  setVisible(v) {
    this.viewmodel.visible = v;
  }

  layout(width) {
    const narrow = width < 760;
    const scale = narrow ? 0.72 : 0.9;
    this.viewmodel.scale.setScalar(scale);
    this.basePos.set(narrow ? 0.26 : 0.32, narrow ? -0.17 : -0.2, narrow ? -0.88 : -0.95);
    this.adsPos.set(0, narrow ? -0.098 : -0.122, narrow ? -0.72 : -0.78);
  }

  look(dx, dy) {
    const sens = 0.0022 * (this.ads ? 0.62 : 1);
    this.yaw -= dx * sens;
    this.pitch -= dy * sens;
    this.pitch = clamp(this.pitch, -1.35, 1.32);
  }

  tryShoot() {
    if (this.fireT > 0 || this.reloadT > 0) return;
    if (this.mag <= 0) {
      if (this.reserve > 0) this.reload();
      else this.game.audio.dryFire();
      return;
    }

    this.mag--;
    this.fireT = 0.098;
    this.bloom = Math.min(1.4, this.bloom + 0.34);
    this.kick = 1;
    this.flashT = 0.055;

    const spread = this.currentSpread();
    const dir = this.camera.getWorldDirection(new THREE.Vector3());
    this.tmpRight.crossVectors(dir, UP).normalize();
    this.tmpUp.crossVectors(this.tmpRight, dir).normalize();
    dir.addScaledVector(this.tmpRight, rand(-1, 1) * spread);
    dir.addScaledVector(this.tmpUp, rand(-1, 1) * spread);
    dir.normalize();

    const origin = this.camera.getWorldPosition(new THREE.Vector3());
    this.game.fireHitscan(origin, dir);

    this.recoilPitch += 0.0072 + rand(0, 0.0032);
    this.recoilYaw += rand(-0.0045, 0.0045);
    this.roll += rand(-0.004, 0.004);
    this.shake = Math.min(1, this.shake + 0.16);
    this.game.audio.shot();
    this.game.onPlayerShot();
  }

  currentSpread() {
    const speed = Math.hypot(this.vel.x, this.vel.z);
    let s = 0.0035 + this.bloom * 0.0032 + Math.min(speed / 10, 1) * 0.006;
    if (this.ads) s *= 0.32;
    if (!this.onGround) s *= 1.7;
    return s;
  }

  reload() {
    if (this.reloadT > 0 || this.mag >= this.magSize || this.reserve <= 0) return;
    this.reloadT = RELOAD_TIME;
    this.game.audio.reload();
  }

  damage(amount) {
    if (this.health <= 0) return;
    this.health = Math.max(0, this.health - amount);
    this.shake = Math.min(1.4, this.shake + 0.55);
    this.game.onPlayerDamaged(amount);
    if (this.health <= 0) this.game.onPlayerDeath();
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  update(dt, input, colliders) {
    this.t += dt;
    this.fireT = Math.max(0, this.fireT - dt);
    this.flashT = Math.max(0, this.flashT - dt);
    this.bloom = damp(this.bloom, 0, 3.6, dt);
    this.kick = damp(this.kick, 0, 12, dt);
    this.shake = damp(this.shake, 0, 7, dt);
    this.landDip = damp(this.landDip, 0, 9, dt);
    this.recoilPitch = damp(this.recoilPitch, 0, 7, dt);
    this.recoilYaw = damp(this.recoilYaw, 0, 7, dt);
    this.roll = damp(this.roll, 0, 6, dt);

    if (this.reloadT > 0) {
      this.reloadT -= dt;
      if (this.reloadT <= 0) {
        const need = this.magSize - this.mag;
        const take = Math.min(need, this.reserve);
        this.mag += take;
        this.reserve -= take;
        this.reloadT = 0;
      }
    }

    this.ads = !!input.ads && this.reloadT <= 0;
    const targetFov = this.ads ? ADS_FOV : BASE_FOV;
    if (Math.abs(this.fov - targetFov) > 0.01) {
      this.fov = damp(this.fov, targetFov, 12, dt);
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }

    // --- movement -------------------------------------------------
    const forward = input.forward || 0;
    const strafe = input.strafe || 0;
    let wishX = 0, wishZ = 0;
    if (forward || strafe) {
      const len = Math.hypot(forward, strafe);
      const f = forward / len;
      const s = strafe / len;
      const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
      wishX = s * cos - f * sin;
      wishZ = -s * sin - f * cos;
    }

    const wantsSprint = input.sprint && forward > 0.1 && this.stamina > 1 && !this.ads;
    const speed = wantsSprint ? 9.6 : 5.5;

    const accel = this.onGround ? 16 : 4.2;
    this.vel.x = damp(this.vel.x, wishX * speed, accel, dt);
    this.vel.z = damp(this.vel.z, wishZ * speed, accel, dt);

    if (this.onGround) {
      if (input.jump) {
        this.vel.y = 7.4;
        this.onGround = false;
        this.game.audio.jump();
      }
    }
    this.vel.y -= 24 * dt;
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.pos.z += this.vel.z * dt;

    // clamp to map
    this.pos.x = clamp(this.pos.x, -220, 220);
    this.pos.z = clamp(this.pos.z, -220, 220);

    // terrain
    const ground = terrainHeight(this.pos.x, this.pos.z);
    if (this.pos.y <= ground) {
      if (!this.onGround && this.vel.y < -6) {
        this.landDip = Math.min(0.16, Math.abs(this.vel.y) * 0.014);
        this.game.audio.land();
      }
      this.pos.y = ground;
      this.vel.y = 0;
      this.onGround = true;
    }

    this.resolveCollisions(colliders);

    // --- stamina --------------------------------------------------
    const movingFast = Math.hypot(this.vel.x, this.vel.z) > 6.4;
    if (wantsSprint && movingFast) {
      this.stamina = Math.max(0, this.stamina - 20 * dt);
    } else {
      this.stamina = Math.min(100, this.stamina + 14 * dt);
    }

    // --- camera ---------------------------------------------------
    const hspeed = Math.hypot(this.vel.x, this.vel.z);
    const speedK = clamp(hspeed / 6, 0, 1.3);
    this.bobPhase += dt * (4.2 + hspeed * 0.9);

    const bobY = this.onGround ? Math.sin(this.bobPhase * 2) * 0.026 * speedK : 0;
    const bobX = this.onGround ? Math.cos(this.bobPhase) * 0.018 * speedK : 0;

    const shakeX = Math.sin(this.t * 91) * this.shake * 0.006;
    const shakeY = Math.cos(this.t * 77) * this.shake * 0.006;

    this.camera.position.set(
      this.pos.x + bobX,
      this.pos.y + this.eye + bobY - this.landDip,
      this.pos.z
    );
    this.camera.rotation.set(
      this.pitch + this.recoilPitch + shakeX,
      this.yaw + this.recoilYaw + shakeY,
      this.roll + bobX * 0.5
    );

    // footsteps
    if (this.onGround && hspeed > 1.6) {
      this.stepPhase += dt * hspeed;
      if (this.stepPhase > 2.5) {
        this.stepPhase = 0;
        this.game.audio.step();
      }
    }

    // --- viewmodel ------------------------------------------------
    const vm = this.viewmodel;
    const adsK = this.ads ? 1 : 0;
    const base = this.basePos;
    const aim = this.adsPos;
    vm.position.x = damp(vm.position.x, lerp(base.x, aim.x, adsK) + bobX * 0.35, 14, dt);
    vm.position.y = damp(vm.position.y, lerp(base.y, aim.y, adsK) + bobY * 0.5, 14, dt);
    vm.position.z = damp(vm.position.z, lerp(base.z, aim.z, adsK) + this.kick * 0.055, 16, dt);
    vm.rotation.x = damp(vm.rotation.x, this.kick * -0.09, 18, dt);
    vm.rotation.y = damp(vm.rotation.y, (this.ads ? 0 : 0.02) + Math.cos(this.bobPhase) * 0.012 * speedK, 10, dt);
    vm.rotation.z = damp(vm.rotation.z, this.ads ? 0 : -bobX * 0.6, 10, dt);

    // reload animation
    if (this.reloadT > 0) {
      const p = 1 - this.reloadT / RELOAD_TIME;
      const dip = Math.sin(clamp(p, 0, 1) * Math.PI);
      vm.rotation.x -= dip * 0.7;
      vm.position.y -= dip * 0.12;
      vm.position.z += dip * 0.04;
    }

    // muzzle flash
    const flashOn = this.flashT > 0;
    this.rifle.flash.visible = flashOn;
    if (flashOn) {
      this.rifle.flash.material.rotation = rand(0, Math.PI);
      this.rifle.flash.scale.setScalar(rand(0.4, 0.62));
      this.rifle.flashLight.intensity = 45;
    } else {
      this.rifle.flashLight.intensity = 0;
    }

    if (input.fire) this.tryShoot();
  }

  resolveCollisions(colliders) {
    const r = this.radius;
    for (const c of colliders) {
      if (this.pos.y + 1.75 < c.minY || this.pos.y > c.maxY) continue;

      if (c.type === 'circle') {
        const dx = this.pos.x - c.x;
        const dz = this.pos.z - c.z;
        const dist = Math.hypot(dx, dz);
        const min = c.r + r;
        if (dist < min && dist > 0.0001) {
          const push = (min - dist) / dist;
          this.pos.x += dx * push;
          this.pos.z += dz * push;
        }
        continue;
      }

      const nx = clamp(this.pos.x, c.minX, c.maxX);
      const nz = clamp(this.pos.z, c.minZ, c.maxZ);
      const dx = this.pos.x - nx;
      const dz = this.pos.z - nz;
      const d2 = dx * dx + dz * dz;
      if (d2 > r * r) continue;

      if (d2 > 0.000001) {
        const dist = Math.sqrt(d2);
        const push = (r - dist) / dist;
        this.pos.x += dx * push;
        this.pos.z += dz * push;
      } else {
        // inside the box: eject along the shallowest axis
        const left = this.pos.x - c.minX;
        const right = c.maxX - this.pos.x;
        const back = this.pos.z - c.minZ;
        const front = c.maxZ - this.pos.z;
        const m = Math.min(left, right, back, front);
        if (m === left) this.pos.x = c.minX - r;
        else if (m === right) this.pos.x = c.maxX + r;
        else if (m === back) this.pos.z = c.minZ - r;
        else this.pos.z = c.maxZ + r;
      }
    }
  }
}
