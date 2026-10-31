import * as THREE from '../vendor/three.module.js';
import { terrainHeight, clamp, damp, rand, lerp, HUB } from './util.js';
import { WEAPON_DEFS } from './weapons.js';

const UP = new THREE.Vector3(0, 1, 0);
const BASE_FOV = 74;

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

    this.reloadT = 0;
    this.reloadTotal = 0;
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

    this.weapons = WEAPON_DEFS.map((def) => ({
      ...def,
      mag: def.magSize,
      reserve: def.reserveMax,
      model: def.build(),
    }));
    this.weaponIndex = 0;
    this.weapon = this.weapons[0];
    this.viewmodel = this.weapon.model.group;

    for (const weapon of this.weapons) {
      weapon.model.group.rotation.set(0, 0.02, 0);
      weapon.model.group.visible = false;
      camera.add(weapon.model.group);
    }

    const fill = new THREE.PointLight(0xffd2a8, 2.3, 3, 2);
    fill.position.set(0.16, 0.08, 0.08);
    camera.add(fill);

    this.basePos = new THREE.Vector3();
    this.adsPos = new THREE.Vector3();
    this.layout(window.innerWidth);
    this.viewmodel.position.copy(this.basePos);
    this.visible = false;

    this.t = 0;
  }

  get mag() { return this.weapon.mag; }
  set mag(v) { this.weapon.mag = v; }
  get reserve() { return this.weapon.reserve; }
  set reserve(v) { this.weapon.reserve = v; }
  get magSize() { return this.weapon.magSize; }
  set magSize(v) { /* per-weapon stat */ }

  reset() {
    const sx = HUB.x;
    const sz = HUB.z - 12;
    this.pos.set(sx, terrainHeight(sx, sz), sz);
    this.vel.set(0, 0, 0);
    this.yaw = 0;
    this.pitch = -0.03;
    this.health = this.maxHealth;
    this.stamina = 100;
    for (const weapon of this.weapons) {
      weapon.mag = weapon.magSize;
      weapon.reserve = weapon.reserveMax;
      weapon.model.group.visible = false;
    }
    this.switchWeapon(0, true);
    this.reloadT = 0;
    this.reloadTotal = 0;
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
    this.visible = true;
    this.viewmodel.visible = true;
  }

  setVisible(v) {
    this.visible = v;
    for (let i = 0; i < this.weapons.length; i++) {
      this.weapons[i].model.group.visible = v && i === this.weaponIndex;
    }
  }

  switchWeapon(index, silent = false) {
    if (index < 0 || index >= this.weapons.length || index === this.weaponIndex) return;
    this.weapon.model.group.visible = false;
    this.weaponIndex = index;
    this.weapon = this.weapons[index];
    this.viewmodel = this.weapon.model.group;
    this.viewmodel.visible = this.visible;
    this.viewmodel.position.copy(this.basePos);
    this.viewmodel.rotation.set(0, 0.02, 0);
    this.reloadT = 0;
    this.reloadTotal = 0;
    this.fireT = 0;
    this.flashT = 0;
    this.bloom = 0;
    this.kick = 0;
    this.ads = false;
    this.layout(window.innerWidth);
    this.viewmodel.position.copy(this.basePos);
    if (!silent) {
      this.game.audio.click();
      this.game.ui.toast(this.weapon.name + ' READY', '');
    }
  }

  cycleWeapon() {
    this.switchWeapon((this.weaponIndex + 1) % this.weapons.length);
  }

  layout(width) {
    const narrow = width < 760;
    const def = this.weapon;
    const modelScale = def.scale * (narrow ? 0.8 : 1);
    const xScale = narrow ? 0.82 : 1;
    const yScale = narrow ? 0.86 : 1;
    const zScale = narrow ? 0.93 : 1;
    this.viewmodel.scale.setScalar(modelScale);
    this.basePos.set(def.base[0] * xScale, def.base[1] * yScale, def.base[2] * zScale);
    this.adsPos.set(def.ads[0], def.ads[1] * (narrow ? 0.82 : 1), def.ads[2] * (narrow ? 0.94 : 1));
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

    const weapon = this.weapon;
    this.mag--;
    this.fireT = weapon.fireDelay;
    this.bloom = Math.min(1.4, this.bloom + weapon.bloomPerShot);
    this.kick = weapon.kick;
    this.flashT = weapon.flashTime;

    const spread = this.currentSpread();
    const baseDir = this.camera.getWorldDirection(new THREE.Vector3());
    this.tmpRight.crossVectors(baseDir, UP).normalize();
    this.tmpUp.crossVectors(this.tmpRight, baseDir).normalize();
    const origin = this.camera.getWorldPosition(new THREE.Vector3());
    const dir = new THREE.Vector3();

    for (let i = 0; i < weapon.pellets; i++) {
      dir.copy(baseDir);
      dir.addScaledVector(this.tmpRight, rand(-1, 1) * spread);
      dir.addScaledVector(this.tmpUp, rand(-1, 1) * spread);
      dir.normalize();
      this.game.fireHitscan(origin, dir, {
        damage: weapon.damage,
        tracer: i === 0,
        color: weapon.tracerColor,
      });
    }

    this.recoilPitch += weapon.recoilPitch + rand(0, weapon.recoilPitch * 0.45);
    this.recoilYaw += rand(-weapon.recoilYaw, weapon.recoilYaw);
    this.roll += rand(-0.004, 0.004);
    this.shake = Math.min(1, this.shake + 0.16 * weapon.kick);
    this.game.audio.shot(weapon.sound);
    this.game.onPlayerShot();
  }

  currentSpread() {
    const weapon = this.weapon;
    const speed = Math.hypot(this.vel.x, this.vel.z);
    let s = weapon.baseSpread + this.bloom * weapon.bloomSpread + Math.min(speed / 10, 1) * 0.006;
    if (this.ads) s *= weapon.adsSpread;
    if (!this.onGround) s *= 1.7;
    return s;
  }

  reload() {
    if (this.reloadT > 0 || this.mag >= this.magSize || this.reserve <= 0) return;
    this.reloadTotal = this.weapon.reloadTime;
    this.reloadT = this.reloadTotal;
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
    const targetFov = this.ads ? this.weapon.adsFov : BASE_FOV;
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
      const p = 1 - this.reloadT / (this.reloadTotal || this.weapon.reloadTime);
      const dip = Math.sin(clamp(p, 0, 1) * Math.PI);
      vm.rotation.x -= dip * 0.7;
      vm.position.y -= dip * 0.12;
      vm.position.z += dip * 0.04;
    }

    // muzzle flash
    const model = this.weapon.model;
    const flashOn = this.flashT > 0;
    model.flash.visible = flashOn;
    if (flashOn) {
      model.flash.material.rotation = rand(0, Math.PI);
      model.flash.scale.setScalar(rand(0.4, 0.62) * (this.weapon.flashScale || 1));
      model.flashLight.intensity = 45;
    } else {
      model.flashLight.intensity = 0;
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
