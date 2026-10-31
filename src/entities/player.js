// ---------------------------------------------------------------------------
// The Tenth. Third-person movement, climbing, swimming, blade, bow and spell.
// ---------------------------------------------------------------------------
import * as THREE from 'three';
import { createCat } from './cat.js';
import { SPELLS, SKILLS, ITEMS } from '../core/data.js';
import { clamp, damp, angleDelta, dist2d } from '../core/noise.js';

const WALK = 4.4;
const SPRINT = 8.1;
const SWIM = 2.7;
const CLIMB = 2.3;
const GRAVITY = 24;
const JUMP = 8.6;

export class Player {
  constructor(game, opts = {}) {
    this.game = game;
    this.look = opts.look || { breed: 'tabby', fur: 'ember', eye: 'amber' };
    this.cls = opts.cls || 'wayfarer';
    this.name = opts.name || 'Moth';

    this.cat = createCat({ ...this.look, scale: 1, isPlayer: true });
    this.group = this.cat.root;
    game.scene.add(this.group);

    this.position = new THREE.Vector3(178, 0, 346);
    this.velocity = new THREE.Vector3();
    this.yaw = Math.PI;
    this.camYaw = Math.PI;
    this.camPitch = 0.18;
    this.camDist = 6.6;
    this.camTarget = new THREE.Vector3();

    const base = { wayfarer: [110, 105, 85], pyrewitch: [85, 90, 135], prowler: [95, 135, 75] }[this.cls] || [110, 105, 85];
    this.baseHealth = base[0]; this.baseStamina = base[1]; this.baseMana = base[2];
    this.maxHealth = base[0]; this.maxStamina = base[1]; this.maxMana = base[2];
    this.health = this.maxHealth;
    this.stamina = this.maxStamina;
    this.mana = this.maxMana;

    this.level = 1; this.xp = 0; this.xpNext = 100; this.skillPoints = 0;
    this.skills = Object.fromEntries(SKILLS.map(s => [s.id, 0]));

    this.dead = false;
    this.deathTimer = 0;
    this.grounded = true;
    this.swimming = false;
    this.climbing = false;
    this.sprinting = false;
    this.blocking = false;
    this.aiming = false;
    this.invuln = 0;
    this.hurtFlash = 0;
    this.cameraShake = 0;
    this.attackCd = 0;
    this.spellCd = { fireball: 0, lightning: 0, heal: 0, ice: 0 };
    this.combatT = 0;
    this.stepT = 0;
    this.regenT = 0;
    this.footT = 0;
    this.bowCd = 0;
    this.aimBlend = 0;
    this.lastSafe = { x: 178, y: 0, z: 346 };
    this.interactTarget = null;
    this.nearNPC = null;
    this.attackAnimT = 0;
    this.castAnimT = 0;
    this.hitEnemies = new Set();

    this.refreshGear();
    this.teleport(this.position.x, game.world ? game.world.terrain.heightAt(this.position.x, this.position.z) : 6.8, this.position.z, Math.PI);
  }

  // -------------------------------------------------------------------------
  get damageBonus() {
    return this.skills.blade * 3;
  }

  refreshGear() {
    const eq = this.game.inventory?.equipment || {};
    this.cat.setWeapon(eq.weapon || null);
    this.cat.setArmor(eq.armor || null);
    this.cat.setBow(eq.bow || null);
    this.recalcStats();
  }

  recalcStats() {
    const oldMax = { h: this.maxHealth, s: this.maxStamina, m: this.maxMana };
    this.maxHealth = this.baseHealth + this.skills.vitality * 16 + (this.level - 1) * 7;
    this.maxStamina = this.baseStamina + this.skills.endurance * 16 + (this.level - 1) * 4;
    this.maxMana = this.baseMana + this.skills.attunement * 16 + (this.level - 1) * 5;
    const ratio = (cur, old, next) => old > 0 ? cur / old * next : next;
    this.health = clamp(ratio(this.health, oldMax.h, this.maxHealth), 1, this.maxHealth);
    this.stamina = clamp(ratio(this.stamina, oldMax.s, this.maxStamina), 0, this.maxStamina);
    this.mana = clamp(ratio(this.mana, oldMax.m, this.maxMana), 0, this.maxMana);
  }

  get armorValue() {
    const eq = this.game.inventory?.equipment || {};
    const a = ITEMS[eq.armor], t = ITEMS[eq.trinket];
    return (a?.armor || 0) + (t?.armor || 0);
  }

  get weapon() {
    const id = this.game.inventory?.equipment?.weapon;
    return id ? ITEMS[id] : null;
  }

  get bow() {
    const id = this.game.inventory?.equipment?.bow;
    return id ? ITEMS[id] : null;
  }

  // -------------------------------------------------------------------------
  teleport(x, y, z, yaw = this.yaw) {
    this.position.set(x, y, z);
    this.group.position.copy(this.position);
    this.yaw = yaw;
    this.camYaw = yaw;
    this.velocity.set(0, 0, 0);
    this.grounded = true;
    this.climbing = false;
    this.swimming = false;
    this.group.rotation.y = yaw;
    this.snapCamera();
  }

  takeDamage(amount, source) {
    if (this.dead || this.invuln > 0) return;
    let dmg = amount;
    const armor = this.armorValue;
    dmg = dmg * (1 - Math.min(0.62, armor * 0.022));
    if (this.blocking && this.stamina > 4) {
      dmg *= 0.35;
      this.stamina = Math.max(0, this.stamina - 12);
      this.game.audio.playBlock();
      this.game.effects.spark(this.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 0xcfe8ff);
    }
    dmg = Math.max(1, Math.round(dmg));
    this.health -= dmg;
    this.invuln = 0.42;
    this.hurtFlash = 0.5;
    this.combatT = 6;
    this.cameraShake = Math.min(0.6, this.cameraShake + 0.22);
    this.cat.playHurt();
    this.game.ui.damageNumber(this.position.clone().add(new THREE.Vector3(0, 1.9, 0)), dmg, '');
    this.game.ui.hurtFlash();
    this.game.audio.playHurt();
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.deathTimer = 0;
    this.cat.die();
    this.game.audio.playDeath();
    this.game.onPlayerDeath();
  }

  reviveAt(x, y, z) {
    this.dead = false;
    this.health = Math.round(this.maxHealth * 0.65);
    this.stamina = this.maxStamina;
    this.mana = Math.round(this.maxMana * 0.5);
    this.cat.revive();
    this.teleport(x, y, z, Math.PI);
    this.game.ui.hideDeath();
  }

  heal(amount) {
    if (this.dead) return;
    const before = this.health;
    const heal = amount * (1 + this.skills.restoration * 0.2);
    this.health = Math.min(this.maxHealth, this.health + heal);
    const actual = Math.round(this.health - before);
    if (actual > 0) this.game.ui.damageNumber(this.position.clone().add(new THREE.Vector3(0, 2.1, 0)), actual, 'heal');
  }

  restoreMana(amount) {
    this.mana = Math.min(this.maxMana, this.mana + amount);
  }

  restoreStamina(amount) {
    this.stamina = Math.min(this.maxStamina, this.stamina + amount);
  }

  addXP(amount) {
    if (!amount) return;
    this.xp += amount;
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.level++;
      this.xpNext = Math.round(100 * Math.pow(this.level, 1.34));
      this.skillPoints++;
      this.recalcStats();
      this.health = this.maxHealth;
      this.stamina = this.maxStamina;
      this.mana = this.maxMana;
      this.game.ui.toast(`<b>Level ${this.level}</b><br>+1 skill point. The snow notices.`, 'good');
      this.game.audio.playLevelUp();
      this.game.effects.ring(this.position, 0xffd27a, 5, 0.9);
      this.game.ui.showArea(`Level ${this.level}`, 'The Tenth grows');
    }
    this.game.ui.updateHUD();
  }

  spendSkill(id) {
    const def = SKILLS.find(s => s.id === id);
    if (!def || this.skillPoints <= 0) return false;
    if ((this.skills[id] || 0) >= def.max) return false;
    this.skills[id]++;
    this.skillPoints--;
    this.recalcStats();
    this.game.audio.playEquip();
    this.game.ui.toast(`<b>${def.name}</b> rank ${this.skills[id]}`, 'good');
    this.game.ui.refreshSkills();
    this.game.ui.updateHUD();
    return true;
  }

  // -------------------------------------------------------------------------
  get forward() {
    return new THREE.Vector3(Math.sin(this.camYaw), 0, Math.cos(this.camYaw));
  }

  aimDirection() {
    const dir = new THREE.Vector3();
    this.game.camera.getWorldDirection(dir);
    dir.y = 0;
    if (dir.lengthSq() < 0.01) dir.set(Math.sin(this.camYaw), 0, Math.cos(this.camYaw));
    return dir.normalize();
  }

  update(dt) {
    const game = this.game;
    const input = game.input;
    if (this.dead) {
      this.deathTimer += dt;
      this.cat.update(dt, { speed: 0, sleeping: true });
      this.updateCamera(dt);
      return;
    }
    this.invuln = Math.max(0, this.invuln - dt);
    this.hurtFlash = Math.max(0, this.hurtFlash - dt);
    this.attackCd = Math.max(0, this.attackCd - dt);
    this.bowCd = Math.max(0, this.bowCd - dt);
    this.combatT = Math.max(0, this.combatT - dt);
    for (const k in this.spellCd) this.spellCd[k] = Math.max(0, this.spellCd[k] - dt);
    this.cameraShake = Math.max(0, this.cameraShake - dt * 1.8);
    this.blocking = !!input.block && !this.aiming && this.stamina > 2;

    const wish = new THREE.Vector3();
    if (input.keys['w'] || input.keys['arrowup']) wish.z += 1;
    if (input.keys['s'] || input.keys['arrowdown']) wish.z -= 1;
    if (input.keys['a'] || input.keys['arrowleft']) wish.x -= 1;
    if (input.keys['d'] || input.keys['arrowright']) wish.x += 1;
    if (wish.lengthSq() > 0) wish.normalize();

    const forward = new THREE.Vector3(Math.sin(this.camYaw), 0, Math.cos(this.camYaw));
    const right = new THREE.Vector3(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw));
    const move = forward.multiplyScalar(wish.z).add(right.multiplyScalar(wish.x));
    const moving = move.lengthSq() > 0.01;
    if (moving) move.normalize();

    const ground = game.world.groundHeight(this.position.x, this.position.z);
    const waterHere = !game.world.activeInteriorId && game.world.terrain.heightAt(this.position.x, this.position.z) < 1.0;
    this.swimming = waterHere && this.position.y < 1.35;
    this.climbing = !!input.keys['c'] && !this.swimming;

    let speed = WALK;
    this.sprinting = false;
    if (this.swimming) speed = SWIM;
    else if (this.climbing) speed = CLIMB;
    else if (input.keys['shift'] && this.stamina > 1 && moving) {
      speed = SPRINT;
      this.sprinting = true;
      this.stamina = Math.max(0, this.stamina - dt * 15);
    }

    if (this.blocking) {
      speed *= 0.45;
      this.stamina = Math.max(0, this.stamina - dt * 3);
    }
    if (this.aiming) speed *= 0.6;

    if (moving) {
      this.yaw = Math.atan2(move.x, move.z);
    }
    if (this.blocking || (this.attackAnimT > 0 && !moving)) {
      this.yaw = this.aimDirection().lengthSq() > 0 ? Math.atan2(this.aimDirection().x, this.aimDirection().z) : this.yaw;
    }

    const wantSpeed = moving ? speed : 0;
    const accel = this.grounded ? 14 : 5;
    this.velocity.x = damp(this.velocity.x, move.x * wantSpeed, accel, dt);
    this.velocity.z = damp(this.velocity.z, move.z * wantSpeed, accel, dt);

    // jump / gravity
    if (!this.swimming) {
      if ((input.keys[' '] || input.jumpQueued) && this.grounded && !this.climbing) {
        this.velocity.y = JUMP;
        this.grounded = false;
        this.game.audio.playJump();
      }
      input.jumpQueued = false;
      this.velocity.y -= GRAVITY * dt;
    } else {
      this.velocity.y = 0;
      input.jumpQueued = false;
    }

    // horizontal move with collision + slope rules
    const stepX = this.velocity.x * dt;
    const stepZ = this.velocity.z * dt;
    const tryMove = (nx, nz) => {
      if (game.world.collidesCircle(nx, nz, 0.42)) return false;
      if (game.world.activeInteriorId) return true;
      const gh = game.world.terrain.heightAt(nx, nz);
      if (gh < 0.9 && !this.swimming && !this.climbing) return true;
      if (!this.climbing && !this.swimming && gh - this.position.y > 1.05) return false;
      return true;
    };
    if (stepX !== 0 && tryMove(this.position.x + stepX, this.position.z)) this.position.x += stepX;
    if (stepZ !== 0 && tryMove(this.position.x, this.position.z + stepZ)) this.position.z += stepZ;

    // vertical
    const groundNow = game.world.groundHeight(this.position.x, this.position.z);
    if (this.swimming) {
      this.position.y = damp(this.position.y, 0.72, 6, dt);
      this.velocity.y = 0;
      this.grounded = false;
      if (moving) this.stamina = Math.max(0, this.stamina - dt * 2.5);
    } else if (this.climbing && moving) {
      this.position.y = Math.min(groundNow, this.position.y + dt * 2.6);
      this.stamina = Math.max(0, this.stamina - dt * 8);
      this.velocity.y = 0;
      this.grounded = true;
    } else {
      this.position.y += this.velocity.y * dt;
      if (this.position.y <= groundNow) {
        if (!this.grounded && this.velocity.y < -12) this.game.audio.playLand();
        this.position.y = groundNow;
        this.velocity.y = 0;
        this.grounded = true;
      } else {
        this.grounded = false;
      }
    }
    if (!this.swimming && !this.climbing && groundNow > -2) {
      this.lastSafe = { x: this.position.x, y: groundNow, z: this.position.z };
    }

    // stamina / mana regen
    if (!this.sprinting && !this.blocking && !this.climbing) {
      this.stamina = Math.min(this.maxStamina, this.stamina + dt * (this.combatT > 0 ? 9 : 16));
    }
    this.mana = Math.min(this.maxMana, this.mana + dt * 3.2);
    if (this.combatT <= 0 && this.health < this.maxHealth) {
      this.regenT += dt;
      if (this.regenT > 1) { this.regenT = 0; this.health = Math.min(this.maxHealth, this.health + 0.6); }
    } else this.regenT = 0;

    // ground / model
    this.group.position.copy(this.position);
    const turn = angleDelta(this.group.rotation.y, this.yaw);
    this.group.rotation.y += turn * Math.min(1, dt * 14);

    // animation
    const horiz = Math.hypot(this.velocity.x, this.velocity.z);
    this.cat.update(dt, {
      speed: this.swimming ? 1.2 : horiz,
      blocking: this.blocking,
      aiming: this.aiming,
      lookYaw: clamp(this.camYaw - this.group.rotation.y, -0.6, 0.6) * 0.4,
    });

    // footsteps
    if (horiz > 0.6 && this.grounded && !this.swimming) {
      this.footT -= dt * (0.6 + horiz * 0.22);
      if (this.footT <= 0) {
        this.footT = 1;
        this.game.audio.playStep(this.swimming, this.game.world.activeInteriorId ? 'wood' : 'snow');
      }
    }

    // combat timers
    this.attackAnimT = Math.max(0, this.attackAnimT - dt);
    this.castAnimT = Math.max(0, this.castAnimT - dt);

    // interactions
    this.updateInteractions();

    this.updateCamera(dt);
  }

  // -------------------------------------------------------------------------
  updateInteractions() {
    const game = this.game;
    const p = this.position;
    let best = null, bd = 3.2;
    for (const it of game.world.interactables) {
      if (it.used) continue;
      const d = Math.hypot(p.x - it.x, p.z - it.z);
      const dy = Math.abs((it.y || p.y) - (p.y + 1.2));
      if (d < (it.radius || 3) && dy < 3.2 && d < bd) { bd = d; best = it; }
    }
    this.interactTarget = best;
    const npc = game.npcs?.nearestTalkable(p, 3.6);
    this.nearNPC = npc;
    if (npc && (!best || bd > 1.8)) {
      game.ui.showInteract(`Talk to ${npc.name}`);
    } else if (best) {
      game.ui.showInteract(best.label || 'Interact');
    } else {
      game.ui.hideInteract();
    }
  }

  interact() {
    const game = this.game;
    if (this.nearNPC) {
      game.dialogue.start(this.nearNPC);
      return true;
    }
    if (this.interactTarget) {
      const t = this.interactTarget;
      if (t.action) t.action(game);
      return true;
    }
    return false;
  }

  // -------------------------------------------------------------------------
  meleeAttack() {
    if (this.dead || this.attackCd > 0 || this.aiming) return;
    if (this.stamina < 6) { this.game.ui.toast('Too winded. Catch your breath.', 'bad'); return; }
    const w = this.weapon;
    const speed = w?.speed || 1;
    this.attackCd = 0.52 / speed;
    this.attackAnimT = 0.4;
    this.stamina -= 7;
    this.combatT = 6;
    this.cat.playAttack();
    this.game.audio.playSword();
    const dir = this.aimDirection();
    this.yaw = Math.atan2(dir.x, dir.z);
    this.group.rotation.y = this.yaw;
    const origin = this.position.clone().add(new THREE.Vector3(0, 1.1, 0)).addScaledVector(dir, 1.1);
    this.game.effects.slash(this.position.clone().addScaledVector(dir, 1.2), this.yaw, w?.effect === 'ice' ? 0x9fe8ff : 0xfff0cf);

    const dmgBase = (w?.dmg || 4) + this.skills.blade * 3 + (w?.unarmed ? this.skills.claws * 3 : 0) + (this.level - 1) * 0.8;
    const reach = 2.9;
    const hit = [];
    for (const e of this.game.enemies) {
      if (!e.alive) continue;
      if ((e.interior || null) !== (this.game.world.activeInteriorId || null)) continue;
      const dx = e.group.position.x - this.position.x;
      const dz = e.group.position.z - this.position.z;
      const d = Math.hypot(dx, dz);
      if (d > reach + (e.hitRadius || 0)) continue;
      const dot = (dx * dir.x + dz * dir.z) / (d || 1);
      if (dot < 0.35) continue;
      hit.push(e);
    }
    if (!hit.length) return;
    for (const e of hit) {
      let dmg = dmgBase * (0.9 + Math.random() * 0.2);
      // backstab bonus
      const eForward = new THREE.Vector3(Math.sin(e.group.rotation.y), 0, Math.cos(e.group.rotation.y));
      const toPlayer = new THREE.Vector3(this.position.x - e.group.position.x, 0, this.position.z - e.group.position.z).normalize();
      if (eForward.dot(toPlayer) > 0.35) dmg *= 1 + this.skills.prowl * 0.12;
      this.game.enemies.damageEnemy(e, Math.round(dmg), this);
      if (w?.effect === 'ice' && e.applySlow) e.applySlow(1.8);
    }
    this.game.player.cameraShake = Math.max(this.game.player.cameraShake, 0.12);
  }

  toggleAim() {
    if (!this.bow) { this.game.ui.toast('You have no bow equipped.', 'bad'); return; }
    this.aiming = !this.aiming;
    this.game.ui.setAiming(this.aiming);
    if (this.aiming) this.game.ui.toast('Bow drawn. Left-click to loose.', 'magic');
  }

  shootBow() {
    if (!this.bow || this.bowCd > 0) return;
    if (this.stamina < 8) { this.game.ui.toast('Not enough stamina to draw.', 'bad'); return; }
    this.stamina -= 8;
    this.bowCd = 0.7;
    this.combatT = 6;
    this.cat.playAttack();
    this.game.audio.playBow();
    const from = this.position.clone().add(new THREE.Vector3(0, 1.45, 0));
    const dir = this.aimDirection();
    const dmg = (this.bow.dmg || 10) + this.skills.archery * 4 + (this.level - 1) * 0.6;
    this.game.effects.spawnProjectile({ pos: from, dir, speed: 42, damage: Math.round(dmg), owner: 'player', type: 'arrow', color: 0xffe0a0, size: 0.1, life: 1.6 });
    this.aiming = false;
    this.game.ui.setAiming(false);
  }

  castSpell(id) {
    if (this.dead) return;
    const spell = SPELLS[id];
    if (!spell) return;
    if (this.spellCd[id] > 0) return;
    if (this.mana < spell.cost) { this.game.ui.toast('Not enough mana.', 'bad'); this.game.audio.playFail(); return; }
    this.mana -= spell.cost;
    this.spellCd[id] = spell.cooldown;
    this.combatT = 6;
    this.castAnimT = 0.6;
    this.cat.playCast();
    this.game.audio.playMagic(id);
    const dir = this.aimDirection();
    this.yaw = Math.atan2(dir.x, dir.z);
    const from = this.position.clone().add(new THREE.Vector3(0, 1.5, 0));
    const magicMul = (1 + this.skills.destruction * 0.12) * (this.game.inventory.statSummary().magic ? 1 + this.game.inventory.statSummary().magic * 0.012 : 1);

    if (id === 'heal') {
      this.heal(spell.heal);
      this.game.effects.ring(this.position, 0x8ee39b, 3.4, 0.8);
      this.game.effects.burst(this.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 0x8ee39b, 22, 3, 1);
      return;
    }
    if (id === 'lightning') {
      let target = null, bd = 22;
      for (const e of this.game.enemies) {
        if (!e.alive) continue;
        if ((e.interior || null) !== (this.game.world.activeInteriorId || null)) continue;
        const to = e.group.position.clone().sub(this.position);
        const d = to.length();
        if (d > bd) continue;
        to.normalize();
        if (to.dot(dir) < 0.55) continue;
        bd = d; target = e;
      }
      if (!target) {
        const to = this.position.clone().addScaledVector(dir, 16).add(new THREE.Vector3(0, 1, 0));
        this.game.effects.beam(from, to, 0x9fd8ff, 0.25);
        this.game.effects.burst(to, 0x9fd8ff, 12, 4, 0.5);
        return;
      }
      const to = target.group.position.clone().add(new THREE.Vector3(0, target.hitHeight || 1, 0));
      this.game.effects.beam(from, to, 0x9fd8ff, 0.3);
      this.game.enemies.damageEnemy(target, Math.round(spell.damage * magicMul), this);
      // chain
      let chain = null, cd = 10;
      for (const e of this.game.enemies) {
        if (!e.alive || e === target) continue;
        if ((e.interior || null) !== (this.game.world.activeInteriorId || null)) continue;
        const d = e.group.position.distanceTo(target.group.position);
        if (d < cd) { cd = d; chain = e; }
      }
      if (chain) {
        const cto = chain.group.position.clone().add(new THREE.Vector3(0, chain.hitHeight || 1, 0));
        this.game.effects.beam(to, cto, 0xa8d4ff, 0.22);
        this.game.enemies.damageEnemy(chain, Math.round(spell.damage * 0.55 * magicMul), this);
      }
      this.cameraShake = Math.max(this.cameraShake, 0.2);
      return;
    }
    if (id === 'fireball') {
      this.game.effects.spawnProjectile({
        pos: from, dir, speed: 30, damage: Math.round(spell.damage * magicMul), owner: 'player', type: 'fire',
        color: 0xff8b3d, size: 0.28, aoe: 3.4, life: 2.4,
      });
    } else if (id === 'ice') {
      this.game.effects.spawnProjectile({
        pos: from, dir, speed: 34, damage: Math.round(spell.damage * magicMul), owner: 'player', type: 'ice',
        color: 0x8fd9ff, size: 0.22, slow: 2.5, life: 2.2,
        onHit: (t, p) => { t.takeDamage(p.damage, this); if (t.applySlow) t.applySlow(2.5); this.game.effects.burst(p.group.position.clone(), 0x8fd9ff, 16, 3, 0.5); },
      });
    }
  }

  // -------------------------------------------------------------------------
  snapCamera() {
    this.updateCamera(0, true);
  }

  updateCamera(dt, snap = false) {
    const cam = this.game.camera;
    if (!cam) return;
    this.aimBlend = damp(this.aimBlend, this.aiming ? 1 : 0, 10, dt);
    const dist = this.camDist - this.aimBlend * 3.4;
    const pitch = this.camPitch + this.aimBlend * 0.06;
    const targetY = this.position.y + 1.55 + this.aimBlend * 0.25;
    const target = new THREE.Vector3(this.position.x, targetY, this.position.z);
    const side = this.aimBlend * 0.75;
    const right = new THREE.Vector3(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw));
    target.addScaledVector(right, side);
    this.camTarget.lerp(target, snap ? 1 : Math.min(1, dt * 12));
    const offset = new THREE.Vector3(
      -Math.sin(this.camYaw) * Math.cos(pitch),
      Math.sin(pitch),
      -Math.cos(this.camYaw) * Math.cos(pitch)
    ).multiplyScalar(dist);
    const desired = this.camTarget.clone().add(offset);
    const ground = this.game.world.groundHeight(desired.x, desired.z);
    if (desired.y < ground + 0.6) desired.y = ground + 0.6;
    // shake
    if (this.cameraShake > 0.001) {
      const s = this.cameraShake * 0.45;
      desired.x += (Math.random() - 0.5) * s;
      desired.y += (Math.random() - 0.5) * s;
      desired.z += (Math.random() - 0.5) * s;
    }
    cam.position.copy(desired);
    const look = this.camTarget.clone();
    look.y += this.aimBlend * 0.35;
    cam.lookAt(look);
  }

  save() {
    return {
      name: this.name, cls: this.cls, look: this.look,
      position: { x: this.position.x, y: this.position.y, z: this.position.z },
      yaw: this.yaw, health: this.health, stamina: this.stamina, mana: this.mana,
      level: this.level, xp: this.xp, xpNext: this.xpNext, skillPoints: this.skillPoints, skills: this.skills,
      lastSafe: this.lastSafe,
    };
  }

  load(data) {
    if (!data) return;
    this.name = data.name || this.name;
    this.level = data.level || 1;
    this.xp = data.xp || 0;
    this.xpNext = data.xpNext || 100;
    this.skillPoints = data.skillPoints || 0;
    this.skills = { ...this.skills, ...(data.skills || {}) };
    this.recalcStats();
    this.health = data.health ?? this.maxHealth;
    this.stamina = data.stamina ?? this.maxStamina;
    this.mana = data.mana ?? this.maxMana;
    this.lastSafe = data.lastSafe || this.lastSafe;
    const p = data.position || this.position;
    this.teleport(p.x, p.y, p.z, data.yaw || Math.PI);
  }
}
