// ============ BOT SOLDIERS & AI ============
import * as THREE from 'three';
import { BOT_NAMES, WEAPONS, DIFFICULTY, CONTROL_POINTS, SPAWNS, MODES } from './config.js';
import { buildBotGun } from './weapons.js';
import { clamp, damp, lerp, rand, randInt, pick, rayAABB, raySphere, makeTextSprite } from './util.js';
import { audio } from './audio.js';

const WAYPOINTS = [
  [-35, 22], [35, 22], [-35, -20], [35, -20], [-22, 0], [22, 0],
  [0, -14], [0, 8], [-10, 30], [10, 30], [-29, 5], [29, 5],
  [-6, -28], [6, -28], [-38, -8], [38, -8], [-18, 30], [18, 30],
  [-12, -20], [12, -20], [-20, 12], [20, 12], [0, 18], [0, -30]
];

function soldierMaterials(accent) {
  return {
    suit: new THREE.MeshStandardMaterial({ color: 0x1c2226, roughness: 0.85, metalness: 0.15 }),
    plate: new THREE.MeshStandardMaterial({ color: 0x2a3236, roughness: 0.6, metalness: 0.4 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x0d1012, roughness: 0.8, metalness: 0.2 }),
    accent: new THREE.MeshStandardMaterial({ color: accent, emissive: new THREE.Color(accent), emissiveIntensity: 0.7, roughness: 0.4, metalness: 0.3 }),
    visor: new THREE.MeshBasicMaterial({ color: accent }),
    glove: new THREE.MeshStandardMaterial({ color: 0x151a1c, roughness: 0.9 })
  };
}

export function createSoldier(accent, isAlly = false) {
  const mats = soldierMaterials(accent);
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.38, 4, 8), mats.suit);
  torso.position.y = 1.15; torso.scale.z = 1.25; body.add(torso);
  // chest rig
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.35, 0.26), mats.plate);
  chest.position.set(0, 1.18, 0.02); body.add(chest);
  // shoulder pads
  for (const s of [-1, 1]) {
    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), mats.plate);
    pad.position.set(s * 0.25, 1.37, 0); pad.scale.set(1, 0.8, 1.1); body.add(pad);
  }
  // accent chest light
  const light = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.025, 0.02), mats.accent);
  light.position.set(0, 1.22, 0.155); body.add(light);
  const backLight = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.02), mats.accent);
  backLight.position.set(0, 1.2, -0.15); body.add(backLight);

  // head
  const headGroup = new THREE.Group();
  headGroup.position.y = 1.56;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 10, 8), mats.dark);
  head.scale.set(0.92, 1, 0.95); headGroup.add(head);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.152, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), mats.plate);
  helmet.position.y = 0.025; headGroup.add(helmet);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.045, 0.05), mats.visor);
  visor.position.set(0, 0.02, 0.115); headGroup.add(visor);
  // antenna
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.24, 4), mats.dark);
  ant.position.set(0.09, 0.15, -0.04); headGroup.add(ant);
  body.add(headGroup);

  // arms
  const armL = new THREE.Group(); armL.position.set(-0.25, 1.35, 0);
  const upperL = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.24, 4, 6), mats.suit);
  upperL.position.y = -0.16; armL.add(upperL);
  const gloveL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.1, 0.11), mats.glove);
  gloveL.position.set(0.02, -0.36, 0.14); armL.add(gloveL);
  armL.rotation.x = -0.9; body.add(armL);

  const armR = new THREE.Group(); armR.position.set(0.25, 1.35, 0);
  const upperR = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.24, 4, 6), mats.suit);
  upperR.position.y = -0.16; armR.add(upperR);
  const gloveR = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.1, 0.11), mats.glove);
  gloveR.position.set(-0.02, -0.36, 0.1); armR.add(gloveR);
  armR.rotation.x = -0.85; body.add(armR);

  // gun in hands
  const gun = buildBotGun(accent);
  gun.position.set(0.05, 1.22, 0.18);
  gun.rotation.x = 0.02;
  body.add(gun);

  // legs
  const legL = new THREE.Group(); legL.position.set(-0.12, 0.86, 0);
  const legLm = new THREE.Mesh(new THREE.CapsuleGeometry(0.078, 0.5, 4, 6), mats.suit);
  legLm.position.y = -0.3; legL.add(legLm);
  const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.11, 0.25), mats.dark);
  bootL.position.set(0, -0.62, 0.05); legL.add(bootL);
  body.add(legL);

  const legR = new THREE.Group(); legR.position.set(0.12, 0.86, 0);
  const legRm = new THREE.Mesh(new THREE.CapsuleGeometry(0.078, 0.5, 4, 6), mats.suit);
  legRm.position.y = -0.3; legR.add(legRm);
  const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.11, 0.25), mats.dark);
  bootR.position.set(0, -0.62, 0.05); legR.add(bootR);
  body.add(legR);

  // ally marker
  let marker = null;
  if (isAlly) {
    marker = makeTextSprite('▲', '#5ce8d4', 0.5);
    marker.position.y = 2.0;
    group.add(marker);
  }

  group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  group.userData = { body, headGroup, legL, legR, armL, armR, gun, mats, marker, head, torso };
  return group;
}

export class Bots {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.list = [];
    this.nextId = 0;
  }

  setup(mode, difficulty) {
    this.clear();
    const diff = DIFFICULTY[difficulty] || DIFFICULTY.regular;
    const names = [...BOT_NAMES].sort(() => Math.random() - 0.5);
    let count, teams;
    if (mode.ffa) {
      count = mode.teamSize - 1;
      teams = Array.from({ length: count }, (_, i) => ({ team: i % 2 === 0 ? 'red' : 'ffa', accent: [0xff5f52, 0xffb454, 0xb18cff, 0x7dffb0][i % 4] }));
    } else {
      count = (mode.teamSize - 1) + mode.teamSize;
      teams = [];
      for (let i = 0; i < mode.teamSize - 1; i++) teams.push({ team: 'blue', accent: 0x5ce8d4 });
      for (let i = 0; i < mode.teamSize; i++) teams.push({ team: 'red', accent: 0xff5f52 });
    }
    for (let i = 0; i < count; i++) {
      const t = teams[i];
      const bot = this.createBot(names[i % names.length], t.team, t.accent, diff, mode);
      this.list.push(bot);
    }
    // initial placement
    for (const bot of this.list) this.placeAtSpawn(bot);
  }

  createBot(name, team, accent, diff, mode) {
    const ally = !mode.ffa && team === 'blue';
    const mesh = createSoldier(accent, ally);
    this.scene.add(mesh);
    const bot = {
      id: ++this.nextId, name, team, accent, mesh, diff, mode,
      pos: new THREE.Vector3(), vel: new THREE.Vector3(), yaw: 0, aimYaw: 0,
      health: diff.hp, maxHealth: diff.hp, alive: true, respawnAt: 0, deathT: 0,
      target: null, targetSeenAt: 0, reactionAt: 0, state: 'patrol',
      fireTimer: 0, burstLeft: 0, burstCooldown: 0, reloadTimer: 0, ammo: WEAPONS.ar.mag,
      thinkTimer: rand(0, 0.2), strafeDir: Math.random() > 0.5 ? 1 : -1, strafeTimer: 0,
      waypoint: null, kills: 0, deaths: 0, animPhase: rand(0, 10),
      lastSeen: new THREE.Vector3(), lastSeenTime: -99, damageTakenAt: -99,
      accuracy: diff.acc, deadMeshRot: 0
    };
    mesh.userData.bot = bot;
    return bot;
  }

  clear() {
    for (const b of this.list) {
      this.scene.remove(b.mesh);
      b.mesh.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material && !o.isSprite) {
          if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
          else o.material.dispose();
        }
        if (o.isSprite) { o.material.map?.dispose(); o.material.dispose(); }
      });
    }
    this.list = [];
  }

  placeAtSpawn(bot) {
    const mode = this.game.mode;
    let pool;
    if (mode.ffa) pool = SPAWNS.ffa;
    else pool = bot.team === 'blue' ? SPAWNS.blue : SPAWNS.red;
    let best = pool[0], bestScore = -1;
    for (const p of pool) {
      let minDist = 999;
      for (const other of this.list) {
        if (other === bot || !other.alive) continue;
        if (!mode.ffa && other.team === bot.team) continue;
        if (!mode.ffa && other.team !== bot.team) {
          const d = Math.hypot(other.pos.x - p.x, other.pos.z - p.z);
          minDist = Math.min(minDist, d);
        }
      }
      if (this.game.player && this.game.player.alive) {
        const d = Math.hypot(this.game.player.pos.x - p.x, this.game.player.pos.z - p.z);
        if (mode.ffa || bot.team !== 'blue') minDist = Math.min(minDist, d);
      }
      const score = minDist + rand(0, 8);
      if (score > bestScore) { bestScore = score; best = p; }
    }
    const sp = best;
    bot.pos.set(sp.x + rand(-1.4, 1.4), 0, sp.z + rand(-1.4, 1.4));
    bot.yaw = bot.team === 'blue' ? 0 : Math.PI;
    bot.aimYaw = bot.yaw;
    bot.health = bot.maxHealth;
    bot.alive = true;
    bot.respawnAt = 0;
    bot.deathT = 0;
    bot.ammo = WEAPONS.ar.mag;
    bot.reloadTimer = 0;
    bot.target = null;
    bot.mesh.visible = true;
    bot.mesh.rotation.set(0, bot.yaw, 0);
    bot.mesh.userData.body.rotation.set(0, 0, 0);
    bot.mesh.userData.body.position.y = 0;
    bot.mesh.position.copy(bot.pos);
    if (bot.mesh.userData.marker) bot.mesh.userData.marker.visible = true;
  }

  respawn(bot) {
    this.placeAtSpawn(bot);
    this.game.effects.hitBurst(bot.pos.clone().add(new THREE.Vector3(0, 1, 0)), bot.team === 'blue' ? 0x5ce8d4 : 0xff5f52);
    audio.spawn();
  }

  raycast(origin, dir, maxDist, shooterTeam) {
    let best = null;
    for (const b of this.list) {
      if (!b.alive) continue;
      if (!this.game.mode.ffa && b.team === shooterTeam) continue;
      // head
      const headC = new THREE.Vector3(b.pos.x, b.pos.y + 1.58, b.pos.z);
      const th = raySphere(origin, dir, headC, 0.23);
      if (th !== null && th < maxDist && (!best || th < best.dist)) {
        best = { bot: b, dist: th, part: 'head', point: origin.clone().addScaledVector(dir, th) };
      }
      // torso
      const torso = makeBotBox(b, 0.35, 0.28, 1.15, 0.78);
      const tt = rayAABB(origin, dir, torso, best ? best.dist : maxDist);
      if (tt !== null && tt > 0 && tt < (best ? best.dist : maxDist)) {
        best = { bot: b, dist: tt, part: 'body', point: origin.clone().addScaledVector(dir, tt) };
      }
      // legs
      const legs = makeBotBox(b, 0.3, 0.26, 0.45, 0.85);
      const tl = rayAABB(origin, dir, legs, best ? best.dist : maxDist);
      if (tl !== null && tl > 0 && tl < (best ? best.dist : maxDist)) {
        best = { bot: b, dist: tl, part: 'legs', point: origin.clone().addScaledVector(dir, tl) };
      }
    }
    return best;
  }

  nearestEnemy(bot) {
    let best = null, bestD = Infinity;
    const eye = new THREE.Vector3(bot.pos.x, bot.pos.y + 1.55, bot.pos.z);
    const consider = (x, z, y, ref) => {
      const d = Math.hypot(x - bot.pos.x, z - bot.pos.z);
      if (d >= bestD || d > 62) return;
      const target = new THREE.Vector3(x, y, z);
      if (!this.game.world.lineOfSight(eye, target)) return;
      bestD = d; best = ref;
    };
    for (const b of this.list) {
      if (b === bot || !b.alive) continue;
      if (!this.game.mode.ffa && b.team === bot.team) continue;
      // FOV check for acquisition
      const ang = Math.atan2(b.pos.x - bot.pos.x, b.pos.z - bot.pos.z);
      const diffA = Math.abs(Math.atan2(Math.sin(ang - bot.yaw), Math.cos(ang - bot.yaw)));
      if (diffA > 1.9 && bot.target !== b) continue;
      consider(b.pos.x, b.pos.z, 1.1, b);
    }
    const p = this.game.player;
    if (p && p.alive && (this.game.mode.ffa || bot.team !== 'blue')) {
      const ang = Math.atan2(p.pos.x - bot.pos.x, p.pos.z - bot.pos.z);
      const diffA = Math.abs(Math.atan2(Math.sin(ang - bot.yaw), Math.cos(ang - bot.yaw)));
      if (diffA < 1.9 || bot.target === p) {
        const d = Math.hypot(p.pos.x - bot.pos.x, p.pos.z - bot.pos.z);
        if (d < bestD) consider(p.pos.x, p.pos.z, 1.25, p);
      }
    }
    return best;
  }

  update(dt) {
    const g = this.game;
    for (const bot of this.list) {
      if (!bot.alive) {
        this.updateDeath(bot, dt);
        if (bot.respawnAt && g.matchTime >= bot.respawnAt && g.matchState === 'live') this.respawn(bot);
        continue;
      }
      if (g.matchState !== 'live') {
        this.updateAnimation(bot, dt, 0);
        continue;
      }
      bot.thinkTimer -= dt;
      bot.reactionAt -= dt;
      bot.fireTimer -= dt;
      bot.burstCooldown -= dt;
      bot.strafeTimer -= dt;
      if (bot.reloadTimer > 0) {
        bot.reloadTimer -= dt;
        if (bot.reloadTimer <= 0) bot.ammo = WEAPONS.ar.mag;
      }
      if (bot.thinkTimer <= 0) {
        bot.thinkTimer = rand(0.12, 0.24);
        const enemy = this.nearestEnemy(bot);
        if (enemy && enemy !== bot.target) {
          bot.target = enemy;
          bot.targetSeenAt = g.matchTime;
          bot.reactionAt = bot.diff.reaction * rand(0.7, 1.3);
        } else if (!enemy) {
          bot.target = null;
        }
        if (enemy) {
          bot.lastSeen.copy(enemy.pos || enemy.object?.pos || bot.pos);
          if (enemy.pos) bot.lastSeen.copy(enemy.pos);
          bot.lastSeenTime = g.matchTime;
        }
        if (bot.strafeTimer <= 0) {
          bot.strafeTimer = rand(0.9, 2.2);
          bot.strafeDir *= -1;
        }
      }

      this.updateMovement(bot, dt);
      this.updateCombat(bot, dt);
      this.updateAnimation(bot, dt, Math.hypot(bot.vel.x, bot.vel.z));
    }
  }

  updateDeath(bot, dt) {
    bot.deathT += dt;
    const body = bot.mesh.userData.body;
    if (bot.mesh.visible) {
      bot.deadMeshRot = damp(bot.deadMeshRot, Math.PI / 2, 6, dt);
      body.rotation.z = bot.deadMeshRot * (bot.deathDir || 1);
      body.position.y = Math.max(-0.9, body.position.y - dt * 0.4);
      if (bot.deathT > 2.4) bot.mesh.visible = false;
    }
    void body;
  }

  updateMovement(bot, dt) {
    const g = this.game;
    let desired = new THREE.Vector3();
    const eyePos = new THREE.Vector3(bot.pos.x, 1.55, bot.pos.z);
    const target = bot.target;

    if (target) {
      const tpos = target.pos;
      const dist = Math.hypot(tpos.x - bot.pos.x, tpos.z - bot.pos.z);
      const dirTo = new THREE.Vector3(tpos.x - bot.pos.x, 0, tpos.z - bot.pos.z).normalize();
      if (dist > 24) desired.add(dirTo.multiplyScalar(1));
      else if (dist < 8) desired.add(dirTo.multiplyScalar(-1));
      const strafe = new THREE.Vector3(-dirTo.z, 0, dirTo.x).multiplyScalar(bot.strafeDir * 0.7);
      desired.add(strafe);
      // occasional cover crouch walk toward cover is skipped; maintain spacing from allies
    } else {
      // objective / waypoint
      let goal = null;
      if (g.mode.id === 'dom') {
        const points = CONTROL_POINTS.filter(p => g.points[p.id].owner !== bot.team);
        goal = points.length ? pick(points) : pick(CONTROL_POINTS);
      } else if (g.mode.ffa && g.zoneRadius < 46) {
        const ang = Math.random() * Math.PI * 2;
        goal = { x: g.zoneCenter.x + Math.cos(ang) * g.zoneRadius * 0.5, z: g.zoneCenter.z + Math.sin(ang) * g.zoneRadius * 0.5 };
      } else if (bot.lastSeenTime > g.matchTime - 8) {
        goal = { x: bot.lastSeen.x, z: bot.lastSeen.z };
      } else {
        if (!bot.waypoint || Math.hypot(bot.waypoint[0] - bot.pos.x, bot.waypoint[1] - bot.pos.z) < 3) {
          bot.waypoint = pick(WAYPOINTS);
        }
        goal = { x: bot.waypoint[0], z: bot.waypoint[1] };
      }
      desired.set(goal.x - bot.pos.x, 0, goal.z - bot.pos.z);
      if (desired.lengthSq() < 0.01) desired.set(rand(-1, 1), 0, rand(-1, 1));
      desired.normalize();
    }

    // obstacle avoidance
    if (g.world.blocked(bot.pos.x, bot.pos.z, desired.x, desired.z, 2.0)) {
      let found = false;
      for (const ang of [0.6, -0.6, 1.2, -1.2, 2.0, -2.0]) {
        const c = Math.cos(ang), s = Math.sin(ang);
        const nx = desired.x * c - desired.z * s;
        const nz = desired.x * s + desired.z * c;
        if (!g.world.blocked(bot.pos.x, bot.pos.z, nx, nz, 2.0)) {
          desired.set(nx, 0, nz); found = true; break;
        }
      }
      if (!found) desired.multiplyScalar(-1);
    }

    // separation
    for (const other of this.list) {
      if (other === bot || !other.alive) continue;
      const dx = bot.pos.x - other.pos.x, dz = bot.pos.z - other.pos.z;
      const d2 = dx * dx + dz * dz;
      if (d2 < 2.2 && d2 > 0.001) {
        const d = Math.sqrt(d2);
        desired.x += (dx / d) * 0.6;
        desired.z += (dz / d) * 0.6;
      }
    }
    if (desired.lengthSq() > 0) desired.normalize();

    const speed = target ? (Math.hypot(target.pos.x - bot.pos.x, target.pos.z - bot.pos.z) < 14 ? 2.6 : 3.6) : 3.35;
    bot.vel.x = damp(bot.vel.x, desired.x * speed, 7, dt);
    bot.vel.z = damp(bot.vel.z, desired.z * speed, 7, dt);
    bot.pos.x += bot.vel.x * dt;
    bot.pos.z += bot.vel.z * dt;

    // collide with world (simple circle)
    const r = 0.38;
    for (const c of g.world.colliders) {
      if (c.max.y < 0.35 || c.min.y > 1.7) continue;
      const cx = clamp(bot.pos.x, c.min.x, c.max.x);
      const cz = clamp(bot.pos.z, c.min.z, c.max.z);
      const dx = bot.pos.x - cx, dz = bot.pos.z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 < r * r && d2 > 1e-8) {
        const d = Math.sqrt(d2);
        bot.pos.x += (dx / d) * (r - d);
        bot.pos.z += (dz / d) * (r - d);
      } else if (d2 <= 1e-8) {
        bot.pos.x += 0.1;
      }
    }
    bot.pos.x = clamp(bot.pos.x, -45, 45);
    bot.pos.z = clamp(bot.pos.z, -45, 45);
    bot.pos.y = 0;
    bot.mesh.position.copy(bot.pos);

    // facing
    let faceYaw = bot.yaw;
    if (target) faceYaw = Math.atan2(-(target.pos.x - bot.pos.x), -(target.pos.z - bot.pos.z));
    else if (Math.hypot(bot.vel.x, bot.vel.z) > 0.3) faceYaw = Math.atan2(-bot.vel.x, -bot.vel.z);
    let dy = Math.atan2(Math.sin(faceYaw - bot.yaw), Math.cos(faceYaw - bot.yaw));
    bot.yaw += dy * Math.min(1, dt * (target ? 9 : 5));
    bot.aimYaw = bot.yaw;
    bot.mesh.rotation.y = bot.yaw;
    void eyePos;
  }

  updateCombat(bot, dt) {
    const g = this.game;
    const target = bot.target;
    if (!target || !target.alive) return;
    if (bot.reloadTimer > 0 || bot.ammo <= 0) {
      if (bot.ammo <= 0 && bot.reloadTimer <= 0) bot.reloadTimer = 1.6;
      return;
    }
    if (bot.reactionAt > 0) return;
    if (bot.fireTimer > 0) return;

    const tx = target.pos.x, tz = target.pos.z;
    const ty = 1.15 + (target === g.player && !g.player.crouching ? 0 : 0);
    const muzzle = new THREE.Vector3(bot.pos.x, 1.22, bot.pos.z);
    const aimPoint = new THREE.Vector3(tx, ty, tz);
    if (target === g.player) aimPoint.y = g.player.pos.y + g.player.eye * 0.62;
    const dist = muzzle.distanceTo(aimPoint);
    if (dist > 62) return;
    if (!g.world.lineOfSight(new THREE.Vector3(bot.pos.x, 1.55, bot.pos.z), aimPoint)) return;
    if (bot.ammo <= 0) return;

    // aim
    const baseDir = new THREE.Vector3().subVectors(aimPoint, muzzle).normalize();
    const right = new THREE.Vector3().crossVectors(baseDir, new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3().crossVectors(right, baseDir).normalize();
    const spread = 0.006 + (1 - bot.accuracy) * 0.055 + dist * 0.00035;
    const ang = Math.random() * Math.PI * 2;
    const rad = Math.sqrt(Math.random()) * spread;
    const dir = baseDir.clone().addScaledVector(right, Math.cos(ang) * rad).addScaledVector(up, Math.sin(ang) * rad).normalize();

    bot.ammo--;
    bot.fireTimer = 60 / WEAPONS.ar.rpm;
    bot.burstLeft--;
    const hit = g.resolveShot(muzzle, dir, 90, bot.team);
    const end = hit ? hit.point : muzzle.clone().addScaledVector(dir, 70);
    g.effects.tracer(muzzle, end, bot.team === 'blue' ? 0x9fe8de : 0xffa090, 1);
    g.effects.muzzleFlash(muzzle, dir, bot.team === 'blue' ? 0xaef5ea : 0xffb08a);
    audio.shot('ar');
    if (hit) {
      if (hit.bot) {
        g.damageBot(hit.bot, Math.round(rand(8, 13) * bot.diff.damage), false, bot, hit.point, { name: 'VK-7 HAVOC' });
      } else if (hit.player) {
        g.player.takeDamage(Math.round(rand(8, 13) * bot.diff.damage), bot.pos, bot.name, 'VK-7 HAVOC');
        g.effects.hitBurst(hit.point, 0xff5f52);
      } else {
        g.effects.impact(hit.point, hit.normal, 0xffc47a);
      }
    }
    if (bot.burstLeft <= 0) {
      bot.burstLeft = randInt(bot.diff.burst[0], bot.diff.burst[1]);
      bot.fireTimer = bot.burstCooldown = rand(0.7, 1.5) / (bot.diff.acc + 0.5);
    }
    if (bot.ammo <= 0) bot.reloadTimer = 1.5;
  }

  updateAnimation(bot, dt, speed) {
    const u = bot.mesh.userData;
    bot.animPhase += dt * (speed > 0.3 ? 9 : 1.6);
    const swing = Math.min(1, speed / 3.2) * 0.55;
    u.legL.rotation.x = Math.sin(bot.animPhase) * swing;
    u.legR.rotation.x = -Math.sin(bot.animPhase) * swing;
    u.body.position.y = Math.abs(Math.sin(bot.animPhase)) * 0.02 * (speed > 0.3 ? 1 : 0);
    u.body.rotation.x = speed > 0.3 ? 0.03 : 0;
    if (u.marker) {
      u.marker.visible = bot.alive && this.game.player?.alive;
      if (u.marker.visible) {
        const dist = this.game.player.pos.distanceTo(bot.pos);
        u.marker.visible = dist < 55;
        u.marker.material.opacity = clamp(1.2 - dist / 60, 0.15, 0.9);
      }
    }
  }

  reset() {
    for (const b of this.list) {
      this.placeAtSpawn(b);
      b.kills = 0; b.deaths = 0;
      b.mesh.visible = true;
    }
  }
}

function makeBotBox(bot, halfW, halfD, centerY, height) {
  return {
    min: new THREE.Vector3(bot.pos.x - halfW, bot.pos.y + centerY - height / 2, bot.pos.z - halfD),
    max: new THREE.Vector3(bot.pos.x + halfW, bot.pos.y + centerY + height / 2, bot.pos.z + halfD)
  };
}
