// ============ PLAYER CONTROLLER ============
import * as THREE from 'three';
import { WEAPONS, SKINS, OPERATORS } from './config.js';
import { buildWeaponModel } from './weapons.js';
import { clamp, damp, lerp, rand } from './util.js';
import { audio } from './audio.js';

const EYE_STAND = 1.62;
const EYE_CROUCH = 1.03;
const HEIGHT_STAND = 1.78;
const HEIGHT_CROUCH = 1.28;
const RADIUS = 0.34;

export class Player {
  constructor(game) {
    this.game = game;
    this.camera = game.camera;
    this.pos = new THREE.Vector3(0, 0, 38);
    this.vel = new THREE.Vector3();
    this.yaw = 0;
    this.pitch = 0;
    this.lookYaw = 0;
    this.lookPitch = 0;
    this.grounded = true;
    this.crouching = false;
    this.height = HEIGHT_STAND;
    this.eye = EYE_STAND;
    this.stamina = 100;
    this.health = 100;
    this.maxHealth = 100;
    this.alive = true;
    this.deadTime = 0;
    this.sprinting = false;
    this.sliding = false;
    this.slideTime = 0;
    this.slideCooldown = 0;
    this.ads = false;
    this.adsAmount = 0;
    this.bloom = 0;
    this.fireCooldown = 0;
    this.reloading = false;
    this.reloadEnd = 0;
    this.swapEnd = 0;
    this.weaponIndex = 0;
    this.primaryId = 'ar';
    this.camoId = 'camo_standard';
    this.operatorId = 'op_standard';
    this.ammo = {};
    this.grenades = 1;
    this.meleeCooldown = 0;
    this.lastDamage = -99;
    this.lastStep = 0;
    this.bobPhase = 0;
    this.cameraShake = 0;
    this.pitchKick = 0;
    this.yawKick = 0;
    this.gunKick = 0;
    this.viewmodel = null;
    this.kills = 0;
    this.deaths = 0;
    this.headshots = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.damageDealt = 0;
    this.assists = 0;
    this.currentTarget = null;
    this.hurtT = 0;
    this.lastHitAt = 0;
    this.buildViewmodel();
    this.camera.rotation.order = 'YXZ';
  }

  get team() { return 'blue'; }
  get weapon() { return this.weaponIndex === 0 ? WEAPONS[this.primaryId] : WEAPONS.pistol; }
  get weaponLabel() { return this.weapon.name; }

  buildViewmodel() {
    if (this.viewmodel) {
      this.camera.remove(this.viewmodel);
      this.disposeGroup(this.viewmodel);
    }
    const op = OPERATORS[this.operatorId] || OPERATORS.op_standard;
    this.viewmodel = buildWeaponModel(this.weaponIndex === 0 ? this.primaryId : 'pistol', this.camoId, op.accent);
    this.viewmodel.scale.setScalar(0.92);
    this.basePos = new THREE.Vector3(0.235, -0.195, -0.36);
    this.adsPos = new THREE.Vector3(0.0, -0.105, -0.27);
    this.viewmodel.position.copy(this.basePos);
    this.viewmodel.rotation.set(0, 0, 0);
    this.camera.add(this.viewmodel);
    this.muzzleLocal = this.viewmodel.userData.muzzle;
    this.modelMats = this.viewmodel.userData;
  }

  disposeGroup(g) {
    g.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
        else o.material.dispose();
      }
    });
  }

  applyLoadout() {
    const r = this.game.profile;
    this.primaryId = r.primary || 'ar';
    this.camoId = r.equipped?.camo || 'camo_standard';
    this.operatorId = r.equipped?.operator || 'op_standard';
    const op = OPERATORS[this.operatorId] || OPERATORS.op_standard;
    this.maxHealth = 100 + (op.armor || 0);
    this.buildViewmodel();
    this.resetAmmo();
  }

  resetAmmo() {
    this.ammo = {
      [this.primaryId]: { mag: WEAPONS[this.primaryId].mag, reserve: WEAPONS[this.primaryId].reserve },
      pistol: { mag: WEAPONS.pistol.mag, reserve: WEAPONS.pistol.reserve }
    };
    this.reloading = false;
    this.fireCooldown = 0;
    this.weaponIndex = 0;
    this.grenades = 1;
  }

  spawn(pos, yaw = 0) {
    this.pos.set(pos.x, 0, pos.z);
    this.vel.set(0, 0, 0);
    this.yaw = yaw; this.lookYaw = yaw;
    this.pitch = 0; this.lookPitch = 0;
    this.health = this.maxHealth;
    this.alive = true;
    this.deadTime = 0;
    this.stamina = 100;
    this.ads = false;
    this.sliding = false;
    this.crouching = false;
    this.height = HEIGHT_STAND;
    this.eye = EYE_STAND;
    this.sprinting = false;
    this.reloading = false;
    this.swapEnd = 0;
    this.bloom = 0;
    if (!this.ammo[this.primaryId]) this.resetAmmo();
    else {
      this.ammo[this.primaryId].mag = WEAPONS[this.primaryId].mag;
      this.ammo.pistol.mag = WEAPONS.pistol.mag;
      this.weaponIndex = 0;
      this.grenades = 1;
    }
    this.buildViewmodel();
    this.updateCamera(0);
    this.game.ui.hideDeath();
  }

  look(dx, dy, sens) {
    if (!this.alive) return;
    const s = sens * (this.ads ? 0.72 : 1);
    this.lookYaw -= dx * s;
    this.lookPitch -= dy * s;
    this.lookPitch = clamp(this.lookPitch, -1.52, 1.52);
  }

  get aimDir() {
    const v = new THREE.Vector3(0, 0, -1);
    v.applyEuler(new THREE.Euler(this.pitch + this.pitchKick, this.yaw + this.yawKick, 0, 'YXZ'));
    return v;
  }

  update(dt) {
    if (!this.alive) {
      this.deadTime += dt;
      this.updateCamera(dt);
      return;
    }
    const inp = this.game.input;
    this.updateWeaponTimers(dt);
    this.updateMovement(dt, inp);
    this.updateCamera(dt);
    this.updateRegen(dt);

    this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    this.meleeCooldown = Math.max(0, this.meleeCooldown - dt);
    this.bloom = damp(this.bloom, 0, 5.5, dt);
    this.gunKick = damp(this.gunKick, 0, 14, dt);
    this.pitchKick = damp(this.pitchKick, 0, 9, dt);
    this.yawKick = damp(this.yawKick, 0, 9, dt);
    this.game.mouseVelX = damp(this.game.mouseVelX, 0, 16, dt);

    if (inp.fire && !this.game.ui.modalOpen) this.tryFire();
    if (inp.reload) this.reload();
    if (inp.grenade) { inp.grenade = false; this.throwGrenade(); }
    if (inp.melee) { inp.melee = false; this.melee(); }
    if (inp.swap) { inp.swap = false; this.swapWeapon(); }
    if (inp.ads) this.ads = true;
    else if (!this.game.touch?.adsToggle) this.ads = false;

    this.adsAmount = damp(this.adsAmount, this.ads ? 1 : 0, 13, dt);
    const w = this.weapon;
    const targetFov = lerp(this.game.baseFov, w.adsFov, this.adsAmount);
    this.camera.fov = damp(this.camera.fov, targetFov, 14, dt);
    this.game.ui.setScope(w.scope && this.adsAmount > 0.75);
    this.game.ui.setAds(this.adsAmount > 0.5);
    if (this.viewmodel) {
      const modeVisible = !(w.scope && this.adsAmount > 0.8);
      this.viewmodel.visible = modeVisible;
      const tp = this.basePos.clone().lerp(this.adsPos, this.adsAmount);
      const bobAmp = this.grounded ? Math.min(1, this.vel.length() / 7) : 0;
      const bobX = Math.sin(this.bobPhase) * 0.008 * bobAmp * (1 - this.adsAmount);
      const bobY = Math.abs(Math.cos(this.bobPhase)) * 0.006 * bobAmp * (1 - this.adsAmount);
      // reload animation
      let reloadRot = 0, reloadDrop = 0;
      if (this.reloading) {
        const d = this.reloadEnd - this.game.matchTime;
        reloadRot = Math.sin(clamp(1 - d / w.reload, 0, 1) * Math.PI) * 0.5;
        reloadDrop = Math.sin(clamp(1 - d / w.reload, 0, 1) * Math.PI) * 0.09;
      }
      const sway = clamp(-this.game.mouseVelX * 0.0009, -0.05, 0.05) * (1 - this.adsAmount);
      this.viewmodel.position.set(
        tp.x + bobX + sway,
        tp.y + bobY - reloadDrop - this.gunKick * 0.02,
        tp.z + this.gunKick * 0.05
      );
      this.viewmodel.rotation.set(
        this.gunKick * 0.09 + reloadRot,
        sway * 1.4,
        -(bobX * 1.5) + (this.sliding ? 0.08 : 0)
      );
    }
    if (this.game.input.crouchToggle) {
      // handled by keydown events
    }
  }

  updateWeaponTimers(dt) {
    if (this.reloading && this.game.matchTime >= this.reloadEnd) this.finishReload();
    if (this.swapEnd && this.game.matchTime >= this.swapEnd) this.swapEnd = 0;
  }

  updateRegen(dt) {
    const since = this.game.matchTime - this.lastDamage;
    if (since > 5.5 && this.health < this.maxHealth) {
      this.health = Math.min(this.maxHealth, this.health + 30 * dt);
    }
    this.hurtT = Math.max(0, this.hurtT - dt);
    this.cameraShake = Math.max(0, this.cameraShake - dt * 3.2);
  }

  updateMovement(dt, inp) {
    const fwd = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    let moveX = 0, moveZ = 0;
    moveX += (inp.forward ? 1 : 0) - (inp.back ? 1 : 0);
    moveZ += (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    const hasMove = moveX !== 0 || moveZ !== 0;
    const moveDir = new THREE.Vector3().addScaledVector(fwd, moveX).addScaledVector(right, moveZ);
    if (moveDir.lengthSq() > 0) moveDir.normalize();

    const wantSprint = inp.sprint && moveX > 0.1 && !this.ads && !this.crouching && this.grounded && this.stamina > 2;
    this.sprinting = wantSprint;
    if (wantSprint) this.stamina = Math.max(0, this.stamina - 17 * dt);
    else this.stamina = Math.min(100, this.stamina + (this.crouching ? 22 : 13) * dt);

    // crouch / slide
    if (inp.crouch && !this.crouching && this.grounded) {
      if (this.sprinting || this.vel.length() > 5.5) {
        if (this.slideCooldown <= 0) {
          this.sliding = true;
          this.slideTime = 0.62;
          this.slideCooldown = 1.1;
          this.cameraShake = Math.max(this.cameraShake, 0.5);
          audio.footstep(true);
        }
      }
      this.crouching = true;
    } else if (!inp.crouch && this.crouching && !this.sliding) {
      // ensure headroom
      this.crouching = false;
    }
    if (this.sliding) {
      this.slideTime -= dt;
      if (this.slideTime <= 0) { this.sliding = false; this.slideCooldown = 0.8; }
    }
    this.slideCooldown = Math.max(0, this.slideCooldown - dt);

    let targetHeight = this.crouching ? HEIGHT_CROUCH : HEIGHT_STAND;
    this.height = damp(this.height, targetHeight, 12, dt);
    this.eye = damp(this.eye, this.crouching ? EYE_CROUCH : EYE_STAND, 12, dt);

    const w = this.weapon;
    let speed = 4.65 * (w.speedMult || 1);
    if (this.crouching) speed = 2.35;
    if (this.ads) speed = Math.min(speed, 3.15);
    if (this.sprinting) speed = 7.25;
    if (this.sliding) speed = lerp(4, 9.6, clamp(this.slideTime / 0.62, 0, 1));
    if (this.reloading) speed *= 0.92;

    const targetVel = moveDir.clone().multiplyScalar(hasMove ? speed : 0);
    const accel = this.grounded ? (this.sliding ? 5 : 15) : 4.5;
    this.vel.x = damp(this.vel.x, targetVel.x, accel, dt);
    this.vel.z = damp(this.vel.z, targetVel.z, accel, dt);

    // jump
    if (inp.jump && this.grounded && !this.crouching) {
      this.vel.y = 6.6;
      this.grounded = false;
      inp.jump = false;
      this.stamina = Math.max(0, this.stamina - 4);
    }
    this.vel.y -= 21 * dt;

    this.moveAndCollide(dt);

    // footsteps + bob
    const horizSpeed = Math.hypot(this.vel.x, this.vel.z);
    if (this.grounded && horizSpeed > 1.2) {
      this.bobPhase += dt * (this.sprinting ? 12 : this.crouching ? 6 : 8.5) * clamp(horizSpeed / 5, 0.5, 1.4);
      const stepDist = (this.game.matchTime - this.lastStep);
      if (stepDist > (this.sprinting ? 0.3 : 0.42)) {
        this.lastStep = this.game.matchTime;
        audio.footstep(this.sprinting);
        this.cameraShake = Math.max(this.cameraShake, this.sprinting ? 0.22 : 0.12);
      }
    }
    this.sprinting = this.sprinting && horizSpeed > 4.5;
  }

  moveAndCollide(dt) {
    const colliders = this.game.world.colliders;
    const steps = Math.max(1, Math.ceil((Math.abs(this.vel.x) + Math.abs(this.vel.z) + Math.abs(this.vel.y)) * dt / 0.22));
    const sdt = dt / steps;
    for (let s = 0; s < steps; s++) {
      this.pos.x += this.vel.x * sdt;
      this.pos.z += this.vel.z * sdt;
      this.resolveHorizontal(colliders);
      this.pos.y += this.vel.y * sdt;
      this.resolveVertical(colliders);
    }
    this.pos.x = clamp(this.pos.x, -45.8, 45.8);
    this.pos.z = clamp(this.pos.z, -45.8, 45.8);
  }

  resolveHorizontal(colliders) {
    const r = RADIUS;
    const feet = this.pos.y;
    const head = feet + this.height;
    for (const c of colliders) {
      if (head <= c.min.y + 0.02 || feet >= c.max.y - 0.02) continue;
      // step up onto low obstacles
      if (this.grounded && c.max.y - feet > 0 && c.max.y - feet <= 0.44 && c.max.y - c.min.y < 3) {
        const cx = clamp(this.pos.x, c.min.x, c.max.x);
        const cz = clamp(this.pos.z, c.min.z, c.max.z);
        const dx = this.pos.x - cx, dz = this.pos.z - cz;
        if (dx * dx + dz * dz < r * r) {
          this.pos.y = c.max.y;
          continue;
        }
      }
      const cx = clamp(this.pos.x, c.min.x, c.max.x);
      const cz = clamp(this.pos.z, c.min.z, c.max.z);
      let dx = this.pos.x - cx;
      let dz = this.pos.z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 >= r * r) continue;
      if (d2 > 1e-8) {
        const d = Math.sqrt(d2);
        const push = (r - d) + 0.001;
        this.pos.x += (dx / d) * push;
        this.pos.z += (dz / d) * push;
      } else {
        // center inside box — push out along nearest face
        const px = Math.min(this.pos.x - c.min.x, c.max.x - this.pos.x);
        const pz = Math.min(this.pos.z - c.min.z, c.max.z - this.pos.z);
        if (px < pz) this.pos.x += (this.pos.x < (c.min.x + c.max.x) / 2 ? -1 : 1) * (px + r);
        else this.pos.z += (this.pos.z < (c.min.z + c.max.z) / 2 ? -1 : 1) * (pz + r);
      }
    }
  }

  resolveVertical(colliders) {
    const r = RADIUS * 0.9;
    const feet = this.pos.y;
    // ceiling
    if (this.vel.y > 0) {
      const head = feet + this.height;
      for (const c of colliders) {
        if (c.min.y < head && c.min.y > feet) {
          const cx = clamp(this.pos.x, c.min.x, c.max.x);
          const cz = clamp(this.pos.z, c.min.z, c.max.z);
          if ((this.pos.x - cx) ** 2 + (this.pos.z - cz) ** 2 < r * r) {
            this.pos.y = c.min.y - this.height - 0.01;
            this.vel.y = 0;
            break;
          }
        }
      }
    }
    let ground = 0;
    let found = false;
    for (const c of colliders) {
      if (c.max.y > this.pos.y + 0.35) continue;
      const cx = clamp(this.pos.x, c.min.x, c.max.x);
      const cz = clamp(this.pos.z, c.min.z, c.max.z);
      if ((this.pos.x - cx) ** 2 + (this.pos.z - cz) ** 2 < r * r) {
        if (c.max.y > ground) { ground = c.max.y; found = true; }
      }
    }
    if (this.pos.y <= ground + 0.001 && this.vel.y <= 0) {
      this.pos.y = ground;
      if (!this.grounded && this.vel.y < -12) this.cameraShake = Math.max(this.cameraShake, 0.5);
      this.vel.y = 0;
      this.grounded = true;
    } else {
      this.grounded = false;
    }
    if (this.pos.y < 0) { this.pos.y = 0; this.vel.y = 0; this.grounded = true; }
    void found;
  }

  updateCamera(dt) {
    const shake = this.cameraShake * 0.012;
    const bob = this.grounded ? Math.sin(this.bobPhase) * 0.018 * Math.min(1, this.vel.length() / 6) : 0;
    const shakeX = (Math.random() - 0.5) * shake;
    const shakeY = (Math.random() - 0.5) * shake;
    this.camera.position.set(
      this.pos.x + shakeX,
      this.pos.y + this.eye + bob + shakeY,
      this.pos.z
    );
    this.yaw = this.lookYaw;
    this.pitch = this.lookPitch;
    this.camera.rotation.set(this.pitch + this.pitchKick, this.yaw + this.yawKick, Math.sin(this.bobPhase * 0.5) * 0.006 + (this.sliding ? 0.04 : 0));
  }

  getSpread() {
    const w = this.weapon;
    let s = lerp(w.spread, w.adsSpread, this.adsAmount);
    const speed = Math.hypot(this.vel.x, this.vel.z);
    s += w.moveSpread * clamp(speed / 7, 0, 1) * (1 - this.adsAmount * 0.75);
    s += this.bloom * 0.012;
    if (this.crouching) s *= 0.8;
    if (!this.grounded) s *= 1.6;
    return s;
  }

  tryFire() {
    if (!this.alive || this.reloading || this.swapEnd) return;
    if (this.fireCooldown > 0) return;
    const w = this.weapon;
    const ammoState = this.ammo[this.weaponIndex === 0 ? this.primaryId : 'pistol'];
    if (!ammoState || ammoState.mag <= 0) {
      this.reload();
      return;
    }
    if (!w.auto && this.wasFiring && this.game.input.fire) {
      // semi-auto: require release
      return;
    }
    this.wasFiring = true;
    ammoState.mag--;
    this.shotsFired++;
    this.fireCooldown = 60 / w.rpm;
    this.bloom = Math.min(1.6, this.bloom + (w.pellets > 1 ? 0.4 : 0.18));
    const baseDir = this.aimDir;
    const origin = this.camera.position.clone();
    const right = new THREE.Vector3().crossVectors(baseDir, new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3().crossVectors(right, baseDir).normalize();
    const spread = this.getSpread();
    let anyHit = false;
    for (let p = 0; p < w.pellets; p++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.sqrt(Math.random()) * spread;
      const dir = baseDir.clone().addScaledVector(right, Math.cos(ang) * rad).addScaledVector(up, Math.sin(ang) * rad).normalize();
      const hit = this.game.resolveShot(origin, dir, 200, 'blue');
      const end = hit ? hit.point : origin.clone().addScaledVector(dir, 120);
      this.game.effects.tracer(this.muzzleWorld(), end, w.id === 'sniper' ? 0xfff0c0 : 0xffd9a0);
      if (hit) {
        anyHit = true;
        if (hit.bot) {
          const dist = hit.dist;
          const falloff = clamp(1 - (dist / w.range) * w.falloff, w.falloff, 1);
          let dmg = w.damage * falloff;
          const head = hit.part === 'head';
          if (head) dmg *= w.headMult;
          dmg = Math.max(1, Math.round(dmg));
          this.game.damageBot(hit.bot, dmg, head, this, hit.point, w);
          this.shotsHit++;
          this.damageDealt += dmg;
          this.game.ui.hitmarker(head, false);
          this.game.effects.hitBurst(hit.point, head ? 0xffb454 : 0x5ce8d4);
          audio.hit(head);
          if (head) this.headshots++;
        } else {
          this.game.effects.impact(hit.point, hit.normal, 0xffc47a);
        }
      }
      this.game.ui.addBloom(0.15);
    }
    audio.shot(w.id);
    this.game.effects.muzzleFlash(this.muzzleWorld(), baseDir, w.id === 'sniper' ? 0xfff0cf : 0xffc987);
    this.game.effects.shell(this.muzzleWorld().add(new THREE.Vector3(right.x * 0.08, 0, right.z * 0.08)), right);
    this.pitchKick += (w.recoil * 0.012) * (1 - this.adsAmount * 0.3) * rand(0.8, 1.2);
    this.yawKick += rand(-1, 1) * w.recoilYaw * 0.004;
    this.gunKick += 1.2;
    this.cameraShake = Math.max(this.cameraShake, w.id === 'sniper' ? 1.6 : 0.45);
    if (this.game.settings.shake === false) this.cameraShake = 0;
    this.game.ui.updateAmmo();
    if (ammoState.mag <= 0) this.reload();
    void anyHit;
  }

  muzzleWorld() {
    const v = this.muzzleLocal.clone();
    this.viewmodel.updateMatrixWorld(true);
    return this.viewmodel.localToWorld(v);
  }

  reload() {
    if (this.reloading || this.swapEnd) return;
    const key = this.weaponIndex === 0 ? this.primaryId : 'pistol';
    const state = this.ammo[key];
    if (!state || state.mag >= WEAPONS[key === 'pistol' ? 'pistol' : key].mag || state.reserve <= 0) return;
    this.reloading = true;
    this.ads = false;
    this.reloadEnd = this.game.matchTime + this.weapon.reload;
    audio.reload();
    this.game.ui.showReload(true);
  }

  finishReload() {
    const key = this.weaponIndex === 0 ? this.primaryId : 'pistol';
    const w = WEAPONS[key];
    const state = this.ammo[key];
    const need = w.mag - state.mag;
    const take = Math.min(need, state.reserve);
    state.mag += take;
    state.reserve -= take;
    this.reloading = false;
    this.game.ui.showReload(false);
    this.game.ui.updateAmmo();
  }

  swapWeapon() {
    if (this.swapEnd || this.reloading) return;
    this.weaponIndex = this.weaponIndex === 0 ? 1 : 0;
    this.ads = false;
    this.swapEnd = this.game.matchTime + 0.45;
    this.buildViewmodel();
    this.game.ui.updateAmmo();
    this.game.ui.showWeaponName(this.weapon.name);
    audio.ui();
  }

  throwGrenade() {
    if (this.grenades <= 0 || this.swapEnd) return;
    this.grenades--;
    const dir = this.aimDir;
    const origin = this.camera.position.clone().addScaledVector(dir, 0.5);
    this.game.spawnGrenade(origin, dir.clone().multiplyScalar(17).add(new THREE.Vector3(0, 3.5, 0)), this.team, this);
    this.game.ui.updateEquipment();
    audio.ui();
  }

  melee() {
    if (this.meleeCooldown > 0) return;
    this.meleeCooldown = 0.9;
    const origin = this.camera.position.clone();
    const dir = this.aimDir;
    const hit = this.game.resolveShot(origin, dir, 2.6, 'blue');
    if (hit && hit.bot) {
      this.game.damageBot(hit.bot, 90, false, this, hit.point, { name: 'MELEE' });
      this.game.ui.hitmarker(false, true);
      audio.hit(false);
    } else if (hit) {
      this.game.effects.impact(hit.point, hit.normal, 0xffc47a);
    }
    audio.reload();
  }

  takeDamage(amount, fromPos, attacker, weaponName = 'UNKNOWN') {
    if (!this.alive || this.game.matchState !== 'live') return;
    this.health -= amount;
    this.lastDamage = this.game.matchTime;
    this.hurtT = 1;
    this.cameraShake = Math.max(this.cameraShake, 0.9);
    audio.hurt();
    this.game.ui.damageFlash();
    this.game.ui.damageDirection(fromPos, this.pos, this.yaw);
    this.game.ui.updateHealth();
    if (this.health <= 0) {
      this.health = 0;
      this.die(attacker, weaponName);
    }
  }

  die(attacker, weaponName) {
    this.alive = false;
    this.deaths++;
    this.deadTime = 0;
    this.ads = false;
    this.sliding = false;
    this.reloading = false;
    this.game.onPlayerDeath(attacker, weaponName);
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.game.ui.updateHealth();
  }
}
