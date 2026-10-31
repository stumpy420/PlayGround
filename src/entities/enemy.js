import * as THREE from 'three';
import { createCat } from '../entities/cat.js';
import { createBeast } from '../entities/beast.js';
import { makeGlowTexture } from '../world/buildings.js';
import { dist2d, clamp, angleDelta } from '../core/noise.js';

const TYPES = {
  snowWolf: {
    name: 'Snow Wolf', hp: 55, dmg: 10, speed: 5.2, xp: 50, aggro: 18, range: 2.3, hitHeight: 0.85, hitRadius: 0.8,
    beast: 'wolf', scale: 1.05, loot: [['gold', 8, 18], ['fish', 1, 1]], faction: 'wild',
  },
  frostRat: {
    name: 'Frost Rat', hp: 30, dmg: 6, speed: 4.4, xp: 25, aggro: 13, range: 1.5, hitHeight: 0.5, hitRadius: 0.55,
    beast: 'frostRat', scale: 1.25, loot: [['gold', 3, 8]], faction: 'wild',
  },
  bandit: {
    name: 'Scarwood Bandit', hp: 85, dmg: 14, speed: 4.3, xp: 70, aggro: 19, range: 2.5, hitHeight: 1.1, hitRadius: 0.7,
    cat: { breed: 'tabby', fur: 'ember', eye: 'copper', scale: 1.02, weapon: 'guardSaber', armor: 'leatherArmor', scarf: '#8d3b35' },
    loot: [['gold', 12, 26], ['healthPotion', 1, 1]], faction: 'bandit',
  },
  banditArcher: {
    name: 'Scarwood Archer', hp: 65, dmg: 11, speed: 4.0, xp: 80, aggro: 22, range: 14, hitHeight: 1.1, hitRadius: 0.7, ranged: true,
    cat: { breed: 'snowshoe', fur: 'smoke', eye: 'jade', scale: 1.0, weapon: 'clawWraps', armor: 'leatherArmor', scarf: '#8d3b35' },
    loot: [['gold', 14, 30], ['staminaPotion', 1, 1]], faction: 'bandit',
  },
  hollow: {
    name: 'Hollow Cat', hp: 95, dmg: 16, speed: 4.6, xp: 95, aggro: 20, range: 2.6, hitHeight: 1.1, hitRadius: 0.75,
    cat: { breed: 'sootpaw', fur: 'ink', eye: 'violet', scale: 1.04, weapon: 'clawWraps', armor: 'wardenArmor', scarf: '#3b2a4a' },
    loot: [['gold', 15, 32], ['manaPotion', 1, 1]], faction: 'hollow', aura: 0x8a4dd8,
  },
  frostMage: {
    name: 'Rime Cultist', hp: 75, dmg: 13, speed: 3.8, xp: 110, aggro: 24, range: 16, hitHeight: 1.1, hitRadius: 0.7, ranged: true, magic: true,
    cat: { breed: 'ashpoint', fur: 'frost', eye: 'ice', scale: 1.0, weapon: 'oakStaff', armor: 'mageRobe' },
    loot: [['gold', 18, 36], ['manaPotion', 1, 1]], faction: 'hollow',
  },
  hollowWarden: {
    name: 'The Hollow Warden', hp: 300, dmg: 20, speed: 4.0, xp: 260, aggro: 26, range: 3.0, hitHeight: 1.4, hitRadius: 1.0, boss: true,
    cat: { breed: 'longhair', fur: 'ink', eye: 'violet', scale: 1.45, weapon: 'frostAxe', armor: 'wardenArmor', scarf: '#3b2a4a' },
    loot: [['gold', 80, 120], ['healthPotion', 2, 2], ['emberAmulet', 1, 1]], faction: 'hollow', aura: 0x8a4dd8,
  },
  marrowmaw: {
    name: 'Marrowmaw, the Unfed', hp: 620, dmg: 23, speed: 4.8, xp: 500, aggro: 32, range: 3.4, hitHeight: 1.7, hitRadius: 1.2, boss: true,
    cat: { breed: 'tabby', fur: 'moss', eye: 'amber', scale: 1.85, weapon: 'frostAxe', armor: 'wardenArmor', scarf: '#6b2f24' },
    loot: [['gold', 180, 240], ['healthPotion', 3, 3], ['staminaPotion', 2, 2]], faction: 'hollow', aura: 0xff6a24,
  },
  vaelmaw: {
    name: 'Vaelmaw, the Empty Bowl', hp: 1050, dmg: 28, speed: 4.2, xp: 1200, aggro: 45, range: 3.8, hitHeight: 2.0, hitRadius: 1.5, boss: true,
    cat: { breed: 'chinchilla', fur: 'ink', eye: 'violet', scale: 2.25, weapon: 'oathBlade', armor: 'wardenArmor', scarf: '#3b2a4a' },
    loot: [['gold', 400, 500], ['healthPotion', 3, 3], ['manaPotion', 3, 3]], faction: 'hollow', aura: 0x9b4dff, finalBoss: true,
  },
};

const OUTDOOR_SPAWNS = [
  { type: 'snowWolf', x: 300, z: 360 }, { type: 'snowWolf', x: 330, z: 380 }, { type: 'snowWolf', x: 70, z: -340 },
  { type: 'snowWolf', x: -460, z: 40 }, { type: 'snowWolf', x: -480, z: 70 }, { type: 'snowWolf', x: 440, z: 80 },
  { type: 'snowWolf', x: 400, z: 260 }, { type: 'snowWolf', x: -220, z: 400 },
  { type: 'frostRat', x: -430, z: 178 }, { type: 'frostRat', x: -414, z: 186 }, { type: 'frostRat', x: -446, z: 190 },
  { type: 'frostRat', x: -420, z: 205 }, { type: 'frostRat', x: -400, z: 185 }, { type: 'frostRat', x: -455, z: 160 },
  { type: 'frostRat', x: -386, z: 196 }, { type: 'frostRat', x: -440, z: 215 },
  { type: 'bandit', x: 250, z: 66 }, { type: 'bandit', x: 266, z: 78 }, { type: 'bandit', x: 246, z: 84 },
  { type: 'bandit', x: 272, z: 62 }, { type: 'bandit', x: 258, z: 92 }, { type: 'bandit', x: 238, z: 74 },
  { type: 'banditArcher', x: 278, z: 84 }, { type: 'banditArcher', x: 240, z: 58 },
  { type: 'hollow', x: -330, z: -318 }, { type: 'hollow', x: -344, z: -326 }, { type: 'hollow', x: -320, z: -350 },
  { type: 'frostMage', x: -20, z: -520 }, { type: 'frostMage', x: 20, z: -540 },
  { type: 'snowWolf', x: -120, z: -500 }, { type: 'snowWolf', x: 60, z: -480 },
  { type: 'bandit', x: 120, z: 150 }, { type: 'bandit', x: 150, z: 120 },
];

const INTERIOR_SPAWNS = {
  pawbarrow: [
    { type: 'hollow', x: 0, z: -12 }, { type: 'hollow', x: -7, z: -20 }, { type: 'hollow', x: 7, z: -20 },
    { type: 'hollow', x: 26, z: -16 }, { type: 'hollow', x: -26, z: -14 }, { type: 'hollowWarden', x: 0, z: -50 },
  ],
  cinderdeep: [
    { type: 'hollow', x: -6, z: -12 }, { type: 'hollow', x: 8, z: -20 }, { type: 'hollow', x: 28, z: -14 },
    { type: 'frostMage', x: 28, z: -20 }, { type: 'hollow', x: 0, z: -46 }, { type: 'marrowmaw', x: 0, z: -54 },
  ],
  frostfang: [
    { type: 'hollow', x: -8, z: -14 }, { type: 'hollow', x: 8, z: -18 }, { type: 'frostMage', x: 0, z: -26 },
    { type: 'hollow', x: -8, z: -50 }, { type: 'hollow', x: 8, z: -50 }, { type: 'vaelmaw', x: 0, z: -58 },
  ],
  whispercave: [
    { type: 'hollow', x: 0, z: -16 }, { type: 'hollow', x: -5, z: -21 }, { type: 'hollow', x: 5, z: -20 },
  ],
};

export class EnemyManager {
  constructor(game) {
    this.game = game;
    this.all = [];
    this.spawnedInteriors = new Set();
    this.glowTex = makeGlowTexture();
    this.nextId = 0;
    this.killCounts = new Map();
    this.spawnOutdoor();
  }

  spawnOutdoor() {
    for (const s of OUTDOOR_SPAWNS) this.spawn(s.type, s.x, s.z, null);
  }

  reset() {
    for (const e of this.all) {
      if (e.group && e.group.parent) e.group.parent.remove(e.group);
    }
    this.all = [];
    this.spawnedInteriors.clear();
    this.nextId = 0;
    this.killCounts = new Map();
    this.spawnOutdoor();
  }

  // The manager doubles as an iterable so gameplay code can do `for (const e of game.enemies)`.
  [Symbol.iterator]() { return this.all[Symbol.iterator](); }
  get length() { return this.all.length; }

  setInterior(id) {
    if (id && !this.spawnedInteriors.has(id)) {
      this.spawnedInteriors.add(id);
      const interior = this.game.world.buildInteriorIfNeeded(id);
      for (const s of (INTERIOR_SPAWNS[id] || [])) this.spawn(s.type, s.x, s.z, id, interior.group);
    }
    for (const e of this.all) {
      if (e.interior) e.group.visible = e.interior === id && e.alive;
      else e.group.visible = !id && e.alive;
    }
  }

  spawn(type, x, z, interior = null, parent = null) {
    const def = TYPES[type];
    if (!def) return null;
    let model;
    if (def.beast) model = createBeast(def.beast, def.color);
    else model = createCat(def.cat);
    if (def.scale) model.root.scale.multiplyScalar(def.scale);
    const group = model.root;
    const y = interior ? 0 : this.game.world.terrain.heightAt(x, z);
    group.position.set(x, y, z);
    (parent || this.game.world.group).add(group);
    const enemy = {
      id: 'enemy' + (this.nextId++), type, def, model, group, interior,
      hp: def.hp, maxHp: def.hp, alive: true, dead: false,
      speed: def.speed, damage: def.dmg, xp: def.xp, aggroRange: def.aggro, attackRange: def.range,
      hitHeight: def.hitHeight || 1, hitRadius: def.hitRadius || 0.7,
      home: { x, z }, state: 'idle', facing: Math.random() * 6.28, attackCd: 0, wanderT: 2,
      slowT: 0, hurtT: 0, specialCd: 4, boss: !!def.boss, target: null, aggro: false,
      loot: def.loot || [], faction: def.faction || 'wild',
      name: def.name, ranged: !!def.ranged, magic: !!def.magic,
    };
    // aura for hollows and bosses
    if (def.aura || def.boss) {
      const color = def.aura || 0x8a4dd8;
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color, transparent: true, opacity: def.boss ? 0.35 : 0.2, depthWrite: false, blending: THREE.AdditiveBlending }));
      glow.scale.setScalar(def.boss ? 3.2 : 1.6);
      glow.position.y = def.boss ? 1.4 : 0.9;
      group.add(glow);
      enemy.aura = glow;
      if (def.boss) {
        const light = new THREE.PointLight(color, 8, 18, 2); light.position.y = 1.6; group.add(light); enemy.auraLight = light;
        // horns / crown
        if (type === 'vaelmaw') {
          const hornMat = new THREE.MeshStandardMaterial({ color: 0x2a1838, roughness: 0.5, metalness: 0.3 });
          for (const s of [-1, 1]) {
            const horn = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.8, 5), hornMat);
            horn.position.set(s * 0.32, 2.0, 0); horn.rotation.z = -s * 0.5;
            group.add(horn);
          }
          const crown = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.04, 5, 10), new THREE.MeshStandardMaterial({ color: 0x9b4dff, emissive: 0x5a1d8a, emissiveIntensity: 1.2 }));
          crown.rotation.x = Math.PI / 2; crown.position.y = 1.95; group.add(crown);
        }
      }
    }
    this.all.push(enemy);
    return enemy;
  }

  spawnMinion(type, pos, interior) {
    const e = this.spawn(type, pos.x, pos.z, interior, interior ? this.game.world.interiors.get(interior)?.group : null);
    if (e) {
      e.aggro = true; e.state = 'chase';
      this.game.effects.burst(pos.clone().add(new THREE.Vector3(0, 1, 0)), 0x8a4dd8, 18, 3);
    }
    return e;
  }

  update(dt) {
    const game = this.game;
    const player = game.player;
    for (const e of this.all) {
      if (!e.alive) continue;
      if (e.interior && e.interior !== game.world.activeInteriorId) continue;
      if (!e.interior && game.world.activeInteriorId) continue;
      e.attackCd = Math.max(0, e.attackCd - dt);
      e.specialCd = Math.max(0, e.specialCd - dt);
      e.slowT = Math.max(0, e.slowT - dt);
      e.hurtT = Math.max(0, e.hurtT - dt);
      const target = this.pickTarget(e);
      const dx = target.position.x - e.group.position.x;
      const dz = target.position.z - e.group.position.z;
      const dist = Math.hypot(dx, dz);
      if (!e.aggro && dist < e.aggroRange && this.canSee(e, target)) {
        e.aggro = true;
        e.state = 'chase';
        game.setEnemyTarget(e);
        if (e.boss) {
          game.ui.showArea(e.name, e.def.finalBoss ? 'The Empty Bowl wakes' : 'A hunger stirs');
          game.audio.playBossRoar();
        } else game.audio.playGrowl();
      }
      if (e.aggro) {
        e.facing = Math.atan2(dx, dz);
        const speedMul = e.slowT > 0 ? 0.4 : 1;
        const speed = e.speed * speedMul;
        if (e.ranged) {
          if (dist > e.attackRange) this.moveEnemy(e, dx, dz, dist, speed, dt);
          else if (dist < 5) this.moveEnemy(e, -dx, -dz, dist, speed * 0.7, dt);
          else e.state = 'idle';
          if (e.attackCd <= 0 && dist < e.attackRange + 2) {
            e.attackCd = e.magic ? 2.2 : 1.8;
            e.model.playCast ? e.model.playCast() : e.model.playAttack();
            this.shoot(e, target);
          }
        } else {
          if (dist > e.attackRange) this.moveEnemy(e, dx, dz, dist, speed, dt);
          else {
            e.state = 'attack';
            if (e.attackCd <= 0) {
              e.attackCd = e.boss ? 1.1 : 1.35;
              e.model.playAttack();
              game.audio.playEnemySwing();
              const dmg = Math.round(e.damage * (0.9 + Math.random() * 0.2));
              setTimeout(() => {
                if (!e.alive) return;
                const d2 = Math.hypot(target.position.x - e.group.position.x, target.position.z - e.group.position.z);
                if (d2 < e.attackRange + 1.4) {
                  target.takeDamage(dmg, e);
                  game.effects.spark(target.position.clone().add(new THREE.Vector3(0, 1, 0)), 0xff9a7a);
                }
              }, 180);
            }
          }
        }
        if (e.boss) this.bossSpecials(e, dt, target, dist);
      } else {
        // idle wander
        e.wanderT -= dt;
        if (e.wanderT <= 0) {
          e.wanderT = 2 + Math.random() * 4;
          e.wanderTarget = { x: e.home.x + (Math.random() - 0.5) * 8, z: e.home.z + (Math.random() - 0.5) * 8 };
        }
        if (e.wanderTarget) {
          const wx = e.wanderTarget.x - e.group.position.x, wz = e.wanderTarget.z - e.group.position.z;
          const wd = Math.hypot(wx, wz);
          if (wd > 0.8) {
            e.facing = Math.atan2(wx, wz);
            this.moveEnemy(e, wx, wz, wd, 1.2, dt);
          } else e.model.anim && (e.model.anim.speed = 0);
        }
      }
      e.group.rotation.y += angleDelta(e.group.rotation.y, e.facing) * Math.min(1, dt * 7);
      const speedNow = e.state === 'chase' || e.state === 'attack' ? (e.aggro ? 4 : 1.2) : 0;
      e.model.update(dt, { speed: e.state === 'chase' ? e.speed * (e.slowT > 0 ? 0.4 : 1) : 0, lookYaw: 0 });
      // keep on ground
      if (!e.interior) {
        const gy = game.world.terrain.heightAt(e.group.position.x, e.group.position.z);
        e.group.position.y = gy;
        if (gy < 1.0) { // don't drown
          e.group.position.x -= Math.sin(e.facing) * dt * 2;
          e.group.position.z -= Math.cos(e.facing) * dt * 2;
        }
      }
      if (e.aura) e.aura.material.opacity = 0.18 + Math.sin(performance.now() * 0.002 + e.id.length) * 0.06;
      if (e.auraLight) e.auraLight.intensity = 7 + Math.sin(performance.now() * 0.003) * 2;
      // update health bar if targeted
      if (game.enemyTarget === e) game.ui.updateEnemyBar(e);
    }
  }

  pickTarget(e) {
    const game = this.game;
    let best = game.player, bd = game.player.position.distanceTo(e.group.position);
    for (const c of game.companions) {
      if (!c || c.dead || c.downed > 0) continue;
      const d = c.group.position.distanceTo(e.group.position);
      if (d < bd * 0.7) { bd = d; best = { position: c.group.position, takeDamage: (a) => this.damageCompanion(c, a), isCompanion: true, companion: c }; }
    }
    return best;
  }

  damageCompanion(c, amount) {
    c.hp -= amount;
    this.game.ui.damageNumber(c.group.position, amount, '');
    if (c.hp <= 0) {
      c.hp = 0;
      this.game.npcs.companionDown(c);
    }
  }

  canSee(e, target) {
    if (e.interior) return true;
    return true;
  }

  moveEnemy(e, dx, dz, dist, speed, dt) {
    const game = this.game;
    if (dist < 0.01) return;
    let nx = e.group.position.x + (dx / dist) * speed * dt;
    let nz = e.group.position.z + (dz / dist) * speed * dt;
    if (game.world.collidesCircle(nx, nz, 0.5)) {
      const a = e.facing + Math.PI / 2;
      nx = e.group.position.x + Math.sin(a) * speed * dt;
      nz = e.group.position.z + Math.cos(a) * speed * dt;
      if (game.world.collidesCircle(nx, nz, 0.5)) return;
    }
    e.group.position.x = nx; e.group.position.z = nz;
    e.state = 'chase';
    e.model.anim && (e.model.anim.speed = speed);
  }

  shoot(e, target) {
    const game = this.game;
    const from = e.group.position.clone().add(new THREE.Vector3(0, 1.4, 0));
    const to = target.position.clone().add(new THREE.Vector3(0, 1.0, 0));
    const dir = to.sub(from).normalize();
    if (e.magic) {
      game.effects.spawnProjectile({ pos: from, dir, speed: 18, damage: e.damage, owner: 'enemy', type: 'ice', color: 0x9fd8ff, size: 0.22, slow: 1.5 });
      game.audio.playMagic('ice');
    } else {
      game.effects.spawnProjectile({ pos: from, dir, speed: 30, damage: e.damage, owner: 'enemy', type: 'arrow', color: 0xffe0a0, size: 0.1 });
      game.audio.playBow();
    }
  }

  bossSpecials(e, dt, target, dist) {
    const game = this.game;
    if (e.specialCd > 0) return;
    if (e.type === 'marrowmaw') {
      e.specialCd = 6.5;
      if (dist < 10) {
        game.ui.subtitle(`${e.name}: “MINE.”`, 2);
        game.effects.ring(e.group.position, 0xff6a24, 8, 0.7);
        game.player.cameraShake = 0.5;
        game.audio.playBossSlam();
        if (dist < 8) game.player.takeDamage(18, e);
        setTimeout(() => { if (e.alive) game.effects.burst(e.group.position.clone().add(new THREE.Vector3(0, 1, 0)), 0xff6a24, 30, 7, 0.8); }, 100);
      } else {
        // charge
        game.ui.subtitle(`${e.name} is winding up something unpleasant.`, 1.8);
        e.speed = 7.5;
        setTimeout(() => { if (e.alive) e.speed = e.def.speed; }, 1600);
      }
    } else if (e.type === 'vaelmaw') {
      e.specialCd = 5.5;
      const from = e.group.position.clone().add(new THREE.Vector3(0, 2, 0));
      const base = target.position.clone().add(new THREE.Vector3(0, 1, 0)).sub(from).normalize();
      for (let i = -2; i <= 2; i++) {
        const dir = base.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), i * 0.18);
        game.effects.spawnProjectile({ pos: from.clone(), dir, speed: 15, damage: 14, owner: 'enemy', type: 'dark', color: 0xb47aff, size: 0.28, aoe: 0 });
      }
      game.audio.playBossCast();
      game.ui.subtitle(`${e.name}: “Nine little candles. One empty bowl.”`, 2.5);
      if (e.hp < e.maxHp * 0.5 && !e.summoned) {
        e.summoned = true;
        game.enemies.spawnMinion('hollow', e.group.position.clone().add(new THREE.Vector3(-3, 0, 2)), e.interior);
        game.enemies.spawnMinion('hollow', e.group.position.clone().add(new THREE.Vector3(3, 0, 2)), e.interior);
        game.ui.toast('The Empty Bowl calls its Hollow.', 'bad');
      }
    } else if (e.type === 'hollowWarden') {
      e.specialCd = 7;
      game.effects.ring(e.group.position, 0x8a4dd8, 5.5, 0.6);
      if (dist < 6) game.player.takeDamage(12, e);
    }
  }

  damageEnemy(e, amount, source) {
    if (!e.alive) return;
    const crit = Math.random() < 0.1;
    const dmg = Math.round(amount * (crit ? 1.7 : 1));
    e.hp -= dmg;
    e.aggro = true;
    e.hurtT = 0.2;
    this.game.effects.damageNumber(e.group.position.clone().add(new THREE.Vector3(0, e.hitHeight, 0)), dmg, crit ? 'crit' : '');
    this.game.effects.spark(e.group.position.clone().add(new THREE.Vector3(0, e.hitHeight, 0)), crit ? 0xffd27a : 0xffb27a);
    this.game.audio.playHit(crit);
    this.game.setEnemyTarget(e);
    // knockback
    if (source && source.position) {
      const dx = e.group.position.x - source.position.x, dz = e.group.position.z - source.position.z;
      const d = Math.hypot(dx, dz) || 1;
      e.group.position.x += (dx / d) * 0.35;
      e.group.position.z += (dz / d) * 0.35;
    }
    if (e.model.playHurt) e.model.playHurt();
    if (e.hp <= 0) this.kill(e);
  }

  applySlow(e, seconds) { e.slowT = Math.max(e.slowT, seconds); }

  kill(e) {
    e.alive = false; e.dead = true; e.hp = 0;
    if (e.model.die) e.model.die();
    this.killCounts.set(e.type, (this.killCounts.get(e.type) || 0) + 1);
    this.game.audio.playEnemyDeath();
    this.game.quests.event('kill', e.type, 1);
    this.game.player.addXP(e.xp);
    for (const [item, min, max] of e.loot) {
      const qty = item === 'gold' ? Math.floor(min + Math.random() * (max - min + 1)) : Math.floor(min + Math.random() * (max - min + 1));
      if (qty > 0) this.game.inventory.add(item, qty, item === 'gold');
    }
    this.game.ui.toast(`<b>${e.name}</b> falls. +${e.xp} XP`, 'good');
    this.game.audio.playLoot();
    if (e.boss) {
      this.game.effects.burst(e.group.position.clone().add(new THREE.Vector3(0, 1.5, 0)), e.def.aura || 0xffd27a, 50, 8, 1.2, 0.18);
      this.game.player.cameraShake = 0.7;
      this.game.onBossDefeated(e);
    }
    if (this.game.enemyTarget === e) this.game.setEnemyTarget(null);
  }
}

export { TYPES };
