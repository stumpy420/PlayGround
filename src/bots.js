import * as THREE from 'three';
import { segmentBlocked } from './nav.js';

const BOT_DEFS = [
  { name: 'VIPER', color: 0xff5a52, css: '#ff5a52', spawn: { x: 3.6, z: 21.7 } },
  { name: 'ROOK', color: 0x5aa8ff, css: '#5aa8ff', spawn: { x: -4.2, z: 21.9 } },
  { name: 'SABLE', color: 0xc084ff, css: '#c084ff', spawn: { x: 5.4, z: 18.9 } },
  { name: 'MACE', color: 0xffd45e, css: '#ffd45e', spawn: { x: -6.1, z: 19.1 } },
];

function makeTag(name, css) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 96;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 512, 96);
  ctx.fillStyle = 'rgba(5,8,5,.72)';
  ctx.fillRect(96, 16, 330, 64);
  ctx.strokeStyle = 'rgba(242,233,214,.24)';
  ctx.lineWidth = 2;
  ctx.strokeRect(97, 17, 328, 62);
  ctx.fillStyle = css;
  ctx.beginPath();
  ctx.arc(124, 48, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2e9d6';
  ctx.font = 'bold 30px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 148, 50);
  ctx.fillStyle = 'rgba(242,233,214,.45)';
  ctx.font = 'bold 17px monospace';
  ctx.fillText('CT', 372, 50);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function standard(color, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.04, ...extra });
}

export class Bot {
  constructor(scene, def, isImpostor) {
    this.scene = scene;
    this.id = def.name.toLowerCase();
    this.name = def.name;
    this.css = def.css;
    this.color = def.color;
    this.spawn = { ...def.spawn };
    this.isImpostor = isImpostor;
    this.group = new THREE.Group();
    this.group.position.set(this.spawn.x, 0, this.spawn.z);
    this.alive = true;
    this.state = 'wander';
    this.path = [];
    this.pathIndex = 0;
    this.pathTimer = 0;
    this.target = null;
    this.lastTarget = new THREE.Vector2(999, 999);
    this.decide = 0;
    this.walkPhase = Math.random() * 6;
    this.moveSpeed = 0;
    this.facing = 0;
    this.taskTimer = 0;
    this.reportTimer = 0;
    this.attackTimer = 0;
    this.attackTarget = null;
    this.killCooldown = 8 + Math.random() * 4;
    this.ventTimer = 0;
    this.deathT = 0;
    this.bodyPool = null;
    this.witnessTimer = 0;
    this.witnessKiller = null;
    this.stuck = 0;
    this.lastPos = new THREE.Vector2(this.spawn.x, this.spawn.z);
    this.requiredYaw = 0;
    this.sabotageOrder = false;
    this.sabotageDone = false;
    this.seenKillerId = null;
    this.buildModel();
    scene.add(this.group);
  }

  buildModel() {
    const g = this.group;
    const uniform = standard(0x3b412f);
    const uniformDark = standard(0x272b20);
    const vest = standard(0x2a2f25);
    const accent = standard(this.color, { emissive: this.color, emissiveIntensity: 0.08 });
    const glove = standard(0x191b15);
    const boot = standard(0x1c1e17);
    const metal = standard(0x4c5044, { metalness: 0.5, roughness: 0.5 });
    const visor = standard(0x0a0d0b, { metalness: 0.7, roughness: 0.25 });

    const add = (parent, geo, mat, x, y, z) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    };

    // hips
    const hips = new THREE.Group();
    hips.position.y = 0.86;
    g.add(hips);

    const legGeo = new THREE.BoxGeometry(0.19, 0.72, 0.21);
    this.legL = new THREE.Group();
    this.legR = new THREE.Group();
    this.legL.position.set(-0.135, 0, 0);
    this.legR.position.set(0.135, 0, 0);
    hips.add(this.legL, this.legR);
    add(this.legL, legGeo, uniform, 0, -0.36, 0);
    add(this.legR, legGeo, uniform, 0, -0.36, 0);
    add(this.legL, new THREE.BoxGeometry(0.2, 0.16, 0.3), boot, 0, -0.72, 0.05);
    add(this.legR, new THREE.BoxGeometry(0.2, 0.16, 0.3), boot, 0, -0.72, 0.05);
    // knee pads
    add(this.legL, new THREE.BoxGeometry(0.21, 0.14, 0.1), vest, 0, -0.47, 0.12);
    add(this.legR, new THREE.BoxGeometry(0.21, 0.14, 0.1), vest, 0, -0.47, 0.12);

    // torso
    const torsoPivot = new THREE.Group();
    torsoPivot.position.y = 0.84;
    g.add(torsoPivot);
    this.torsoPivot = torsoPivot;
    this.torso = add(torsoPivot, new THREE.BoxGeometry(0.5, 0.58, 0.3), uniform, 0, 0.3, 0);
    this.torso.userData.bot = this;
    this.torso.userData.hit = true;
    add(torsoPivot, new THREE.BoxGeometry(0.55, 0.44, 0.36), vest, 0, 0.34, 0.0);
    add(torsoPivot, new THREE.BoxGeometry(0.42, 0.11, 0.39), accent, 0, 0.53, 0.0);
    // pouches
    for (const x of [-0.16, 0, 0.16]) {
      add(torsoPivot, new THREE.BoxGeometry(0.13, 0.15, 0.1), uniformDark, x, 0.28, 0.21);
    }
    // shoulder pads
    add(torsoPivot, new THREE.BoxGeometry(0.17, 0.12, 0.3), vest, -0.34, 0.54, 0);
    add(torsoPivot, new THREE.BoxGeometry(0.17, 0.12, 0.3), vest, 0.34, 0.54, 0);

    // arms
    const armGeo = new THREE.BoxGeometry(0.135, 0.5, 0.16);
    this.armL = new THREE.Group();
    this.armR = new THREE.Group();
    this.armL.position.set(-0.35, 0.54, 0);
    this.armR.position.set(0.35, 0.54, 0);
    torsoPivot.add(this.armL, this.armR);
    add(this.armL, armGeo, uniform, 0, -0.25, 0);
    add(this.armR, armGeo, uniform, 0, -0.25, 0);
    add(this.armL, new THREE.BoxGeometry(0.14, 0.13, 0.16), glove, 0, -0.53, 0.02);
    add(this.armR, new THREE.BoxGeometry(0.14, 0.13, 0.16), glove, 0, -0.53, 0.02);
    add(this.armL, new THREE.BoxGeometry(0.145, 0.09, 0.17), accent, 0, -0.4, 0);
    add(this.armR, new THREE.BoxGeometry(0.145, 0.09, 0.17), accent, 0, -0.4, 0);

    // head
    const headPivot = new THREE.Group();
    headPivot.position.y = 0.64;
    torsoPivot.add(headPivot);
    this.headPivot = headPivot;
    this.head = add(headPivot, new THREE.BoxGeometry(0.27, 0.29, 0.27), standard(0x9a7c5c), 0, 0.14, 0);
    this.head.userData.bot = this;
    this.head.userData.hit = true;
    add(headPivot, new THREE.BoxGeometry(0.31, 0.12, 0.31), vest, 0, 0.3, 0);
    add(headPivot, new THREE.BoxGeometry(0.28, 0.1, 0.28), accent, 0, 0.37, 0);
    add(headPivot, new THREE.BoxGeometry(0.2, 0.11, 0.05), visor, 0, 0.16, 0.145);
    add(headPivot, new THREE.BoxGeometry(0.05, 0.16, 0.05), metal, 0.16, 0.19, 0.02);
    // radio
    add(torsoPivot, new THREE.BoxGeometry(0.12, 0.2, 0.08), metal, -0.2, 0.56, -0.16);
    add(torsoPivot, new THREE.CylinderGeometry(0.01, 0.01, 0.34, 4), metal, -0.2, 0.8, -0.16);

    // slung rifle on the back
    const rifle = new THREE.Group();
    rifle.position.set(0.1, 0.36, -0.24);
    rifle.rotation.set(0, 0, -0.55);
    add(rifle, new THREE.BoxGeometry(0.07, 0.5, 0.07), metal, 0, 0.05, 0);
    add(rifle, new THREE.BoxGeometry(0.06, 0.22, 0.1), uniformDark, 0, -0.14, 0.02);
    add(rifle, new THREE.BoxGeometry(0.045, 0.18, 0.05), metal, 0, -0.36, 0);
    torsoPivot.add(rifle);

    // backpack
    add(torsoPivot, new THREE.BoxGeometry(0.36, 0.38, 0.14), uniformDark, 0, 0.3, -0.23);

    // knife (impostor tell, hidden by default)
    const knife = new THREE.Group();
    knife.position.set(0, -0.53, 0.04);
    const blade = add(knife, new THREE.BoxGeometry(0.035, 0.46, 0.02), standard(0xb9c0b8, { metalness: 0.8, roughness: 0.25 }), 0, -0.2, 0.02);
    blade.rotation.x = 0.3;
    const handle = add(knife, new THREE.BoxGeometry(0.05, 0.13, 0.05), glove, 0, 0.04, 0);
    handle.rotation.x = 0.3;
    knife.visible = false;
    this.armR.add(knife);
    this.knife = knife;

    // name tag
    this.tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeTag(this.name, this.css), transparent: true, depthWrite: false, opacity: 0.92 }));
    this.tag.scale.set(2.1, 0.4, 1);
    this.tag.position.y = 2.35;
    this.tag.renderOrder = 10;
    g.add(this.tag);

    // body marker
    this.bodyMarker = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeBodyMarker(), transparent: true, depthWrite: false, depthTest: false, opacity: 0.95 }));
    this.bodyMarker.scale.set(1.1, 0.5, 1);
    this.bodyMarker.position.y = 1.4;
    this.bodyMarker.visible = false;
    this.bodyMarker.renderOrder = 30;
    g.add(this.bodyMarker);
  }

  setPosition(x, z) {
    this.group.position.set(x, 0, z);
    this.path = [];
    this.pathIndex = 0;
    this.lastTarget.set(999, 999);
    this.target = null;
    this.state = 'wander';
    this.stuck = 0;
    this.lastPos.set(x, z);
  }

  reset(spawn = this.spawn) {
    this.alive = true;
    this.state = 'wander';
    this.group.visible = true;
    this.group.rotation.set(0, this.facing, 0);
    this.group.position.set(spawn.x, 0, spawn.z);
    this.tag.visible = true;
    this.bodyMarker.visible = false;
    this.deathT = 0;
    this.killCooldown = 9 + Math.random() * 5;
    this.decide = 0;
    this.path = [];
    this.pathIndex = 0;
    this.lastTarget.set(999, 999);
    this.target = null;
    this.attackTimer = 0;
    this.witnessTimer = 0;
    this.reportTimer = 0;
    this.sabotageOrder = false;
    this.sabotageDone = false;
    this.seenKillerId = null;
    if (this.bodyPool) { this.scene.remove(this.bodyPool); this.bodyPool = null; }
    this.knife.visible = false;
    this.group.rotation.z = 0;
    this.group.rotation.x = 0;
    this.legL.rotation.set(0, 0, 0);
    this.legR.rotation.set(0, 0, 0);
    this.armL.rotation.set(0, 0, 0);
    this.armR.rotation.set(0, 0, 0);
  }

  distanceTo(x, z) { return Math.hypot(this.group.position.x - x, this.group.position.z - z); }
  distanceToPlayer(player) { return this.distanceTo(player.position.x, player.position.z); }

  onWitness(killer) {
    if (!this.alive || this.isImpostor) return;
    this.witnessKiller = killer;
    this.state = 'flee';
    this.witnessTimer = 1.6 + Math.random() * 1.2;
    const far = this.game?.nav?.randomWalkable() || { x: 0, z: 0 };
    this.setTarget(far.x, far.z);
  }

  onDiscoverBody(body) {
    if (!this.alive || this.isImpostor || this.state === 'flee') return;
    this.state = 'discover';
    this.discoveredBody = body;
    this.reportTimer = 0.9;
    this.setTarget(body.group.position.x, body.group.position.z);
  }

  setTarget(x, z, force = false) {
    if (!force && this.target && this.path.length && Math.hypot(this.target.x - x, this.target.z - z) < 1.2) return;
    this.target = { x, z };
    this.path = [];
    this.pathIndex = 0;
    this.pathTimer = 0;
    this.lastTarget.set(x, z);
  }

  ensurePath() {
    if (!this.game?.nav) return;
    const tx = this.target?.x ?? this.group.position.x;
    const tz = this.target?.z ?? this.group.position.z;
    if (this.path.length > 0 && this.pathIndex < this.path.length && (this.pathTimer < 3.2)) return;
    if (this.target && this.lastTarget.distanceTo(new THREE.Vector2(tx, tz)) < 0.2 && this.path.length) return;
    this.lastTarget.set(tx, tz);
    this.path = this.game.nav.findPath({ x: this.group.position.x, z: this.group.position.z }, { x: tx, z: tz }) || [];
    this.pathIndex = 0;
    this.pathTimer = 0;
  }

  follow(dt, speed) {
    this.pathTimer += dt;
    this.ensurePath();
    if (!this.path.length) {
      this.moveSpeed = 0;
      return true;
    }
    const p = this.path[this.pathIndex];
    if (!p) { this.moveSpeed = 0; this.target = null; return true; }
    const dx = p.x - this.group.position.x;
    const dz = p.z - this.group.position.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.35) {
      this.pathIndex++;
      if (this.pathIndex >= this.path.length) { this.moveSpeed = 0; this.target = null; return true; }
      return false;
    }
    const step = Math.min(d, speed * dt);
    const nx = this.group.position.x + (dx / d) * step;
    const nz = this.group.position.z + (dz / d) * step;
    this.group.position.x = nx;
    this.group.position.z = nz;
    const yaw = Math.atan2(dx, dz);
    let diff = yaw - this.facing;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.facing += diff * Math.min(1, dt * 8);
    this.group.rotation.y = this.facing;
    this.moveSpeed = speed;
    // stuck detection
    this.stuck += dt;
    if (this.stuck > 0.8) {
      if (this.lastPos.distanceTo(new THREE.Vector2(this.group.position.x, this.group.position.z)) < 0.15) {
        this.path = [];
        this.pathTimer = 4;
      }
      this.lastPos.set(this.group.position.x, this.group.position.z);
      this.stuck = 0;
    }
    return false;
  }

  face(x, z, dt) {
    const yaw = Math.atan2(x - this.group.position.x, z - this.group.position.z);
    let diff = yaw - this.facing;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.facing += diff * Math.min(1, dt * 6);
    this.group.rotation.y = this.facing;
    this.moveSpeed = 0;
  }

  update(dt, elapsed) {
    if (!this.alive) { this.updateDeath(dt); return; }
    this.tag.visible = true;
    if (this.game?.state !== 'playing') {
      this.moveSpeed = 0;
      this.animate(dt, elapsed, false);
      return;
    }
    if (this.isImpostor) this.updateImpostor(dt, elapsed);
    else this.updateCrew(dt, elapsed);
    this.animate(dt, elapsed, this.moveSpeed > 0.15);
    this.updateTag(elapsed);
  }

  updateTag(elapsed) {
    if (!this.game?.camera) return;
    const cam = this.game.camera.position;
    const d = Math.hypot(cam.x - this.group.position.x, cam.z - this.group.position.z);
    this.tag.visible = d < 26 && this.alive;
    this.tag.material.opacity = d < 18 ? 0.92 : Math.max(0, (26 - d) / 8) * 0.92;
    this.bodyMarker.visible = !this.alive && this.group.visible && !this.game?.meeting;
  }

  updateCrew(dt, elapsed) {
    const player = this.game.player;
    if (this.state === 'flee') {
      this.witnessTimer -= dt;
      this.follow(dt, 2.5);
      if (this.witnessTimer <= 0 && !this.game.meeting) {
        this.game.requestMeeting({ reason: 'witness', reporter: this, killer: this.witnessKiller });
        this.state = 'wander';
      }
      return;
    }
    if (this.state === 'discover') {
      this.reportTimer -= dt;
      if (this.discoveredBody?.alive === false) this.face(this.discoveredBody.group.position.x, this.discoveredBody.group.position.z, dt);
      if (this.reportTimer <= 0 && !this.game.meeting) {
        this.game.requestMeeting({ reason: 'body', reporter: this, body: this.discoveredBody });
        this.state = 'wander';
      }
      return;
    }
    if (this.state === 'work') {
      this.taskTimer -= dt;
      this.moveSpeed = 0;
      this.face(this.workStation?.x ?? this.group.position.x, this.workStation?.z ?? this.group.position.z, dt);
      if (this.taskTimer <= 0) {
        this.state = 'wander';
        this.decide = 1.5 + Math.random() * 3;
      }
      return;
    }

    // look for bodies nearby
    if (!this.game.meeting) {
      const body = this.game.nearestBody(this.group.position.x, this.group.position.z, 3.2, this);
      if (body && body !== this.discoveredBody) {
        this.discoveredBody = body;
        this.state = 'discover';
        this.reportTimer = 0.8;
        this.setTarget(body.group.position.x, body.group.position.z);
        return;
      }
    }

    this.decide -= dt;
    if (this.state === 'taskGo') {
      const arrived = this.follow(dt, 1.95);
      if (arrived) {
        this.state = 'work';
        this.taskTimer = 4 + Math.random() * 5;
        this.game.audio?.taskStep();
      }
    } else {
      // wander
      if (this.follow(dt, 1.75)) {
        this.decide -= dt * 2;
        if (this.decide <= 0) {
          this.state = 'wander';
          this.moveSpeed = 0;
          if (Math.random() < 0.55 && this.game.world.stations.length) {
            const st = this.game.world.stations[Math.floor(Math.random() * this.game.world.stations.length)];
            this.workStation = st;
            const ang = Math.random() * Math.PI * 2;
            this.setTarget(st.x + Math.cos(ang) * 1.6, st.z + Math.sin(ang) * 1.6);
            this.state = 'taskGo';
          } else {
            const p = this.game.nav.randomWalkable();
            this.setTarget(p.x, p.z);
          }
          this.decide = 4 + Math.random() * 5;
        }
      }
    }
    // player separation
    if (player && player.alive) {
      const pd = this.distanceToPlayer(player);
      if (pd < 0.85 && pd > 0.01) {
        const dx = this.group.position.x - player.position.x;
        const dz = this.group.position.z - player.position.z;
        this.group.position.x += (dx / pd) * 0.03;
        this.group.position.z += (dz / pd) * 0.03;
      }
    }
  }

  updateImpostor(dt, elapsed) {
    const game = this.game;
    if (this.sabotageOrder && !this.sabotageDone && !game.world.dark) {
      this.state = 'sabotage';
      this.follow(dt, 2.45);
      const d = this.distanceTo(game.world.panel.x, game.world.panel.z);
      if (d < 2.3) {
        this.sabotageDone = true;
        this.sabotageOrder = false;
        game.triggerSabotage(this);
      }
      return;
    }
    if (this.state === 'vent') {
      this.follow(dt, 2.9);
      if (this.target && this.distanceTo(this.target.x, this.target.z) < 1.1) {
        game.useVent(this, this.targetVent);
        this.state = 'wander';
        this.target = null;
      }
      return;
    }
    if (this.state === 'flee') {
      this.follow(dt, 2.8);
      this.ventTimer -= dt;
      if (this.ventTimer <= 0) {
        this.state = 'wander';
        this.killCooldown = Math.min(this.killCooldown, 9);
      }
      return;
    }
    if (this.state === 'attack') {
      this.attackTimer -= dt;
      this.moveSpeed = 0;
      if (this.attackTarget) this.face(this.attackTarget.group.position.x, this.attackTarget.group.position.z, dt);
      this.knife.visible = true;
      this.armR.rotation.x = -1.8 + Math.sin(elapsed * 24) * 0.2;
      if (this.attackTimer <= 0) {
        const victim = this.attackTarget;
        this.attackTarget = null;
        this.knife.visible = false;
        if (victim && victim.alive && this.distanceTo(victim.group.position.x, victim.group.position.z) < 2.6) {
          victim.die(this);
          game.botKilled(victim, this);
          this.killCooldown = 15 + Math.random() * 8;
          if (game.player && this.distanceToPlayer(game.player) < 16) {
            game.revealImpostor(this);
          }
          if (this.distanceToPlayer(game.player) < 13 && Math.random() < 0.65) {
            const vent = game.nearestVent(this.group.position.x, this.group.position.z, 12);
            if (vent) {
              this.state = 'vent';
              this.targetVent = vent;
              this.setTarget(vent.x, vent.z);
              return;
            }
          }
          this.state = 'flee';
          this.ventTimer = 1.2 + Math.random() * 1.2;
          const p = game.nav.randomWalkable();
          this.setTarget(p.x, p.z);
          return;
        }
        this.state = 'wander';
        this.decide = 0;
      }
      return;
    }

    this.killCooldown -= dt * (game.world.dark ? 1.4 : 1);
    this.decide -= dt;
    if (this.killCooldown <= 0) {
      const victim = this.pickVictim();
      if (victim) {
        this.attackTarget = victim;
        this.state = 'attack';
        this.attackTimer = 0.72;
        this.face(victim.group.position.x, victim.group.position.z, dt);
        game.audio?.warn();
        return;
      }
    }
    // move toward a victim if close, otherwise patrol
    const victim = this.pickVictim();
    if (victim && this.distanceTo(victim.group.position.x, victim.group.position.z) < 24) {
      this.setTarget(victim.group.position.x, victim.group.position.z);
      this.follow(dt, game.world.dark ? 2.65 : 2.35);
    } else if (this.follow(dt, 2.25)) {
      if (this.decide <= 0) {
        const p = game.nav.randomWalkable();
        this.setTarget(p.x, p.z);
        this.decide = 5 + Math.random() * 6;
      }
    }
  }

  pickVictim() {
    const game = this.game;
    const player = game.player;
    let best = null;
    let bestScore = Infinity;
    for (const bot of game.bots) {
      if (bot === this || !bot.alive || bot.isImpostor) continue;
      const d = this.distanceTo(bot.group.position.x, bot.group.position.z);
      // isolation: distance from other crew / player
      let isolation = 99;
      for (const other of game.bots) {
        if (other === bot || other === this || !other.alive) continue;
        isolation = Math.min(isolation, Math.hypot(other.group.position.x - bot.group.position.x, other.group.position.z - bot.group.position.z));
      }
      if (player?.alive) isolation = Math.min(isolation, Math.hypot(player.position.x - bot.group.position.x, player.position.z - bot.group.position.z));
      let penalty = 0;
      if (player?.alive) {
        const pd = Math.hypot(player.position.x - bot.group.position.x, player.position.z - bot.group.position.z);
        if (pd < 8) penalty += 22;
        if (pd < 4) penalty += 30;
      }
      const blocked = segmentBlocked(this.group.position.x, this.group.position.z, bot.group.position.x, bot.group.position.z, game.world.colliders, { minHeight: 1.3 });
      const score = d * 0.4 + isolation * 1.15 + penalty + (blocked ? 8 : 0);
      if (score < bestScore) { bestScore = score; best = bot; }
    }
    return best;
  }

  animate(dt, elapsed, moving) {
    if (moving) {
      this.walkPhase += dt * (this.moveSpeed * 3.3 + 2);
      const swing = Math.sin(this.walkPhase) * 0.55;
      this.legL.rotation.x = swing;
      this.legR.rotation.x = -swing;
      this.armL.rotation.x = -swing * 0.75;
      if (this.state !== 'attack') this.armR.rotation.x = swing * 0.75;
      this.torsoPivot.position.y = 0.84 + Math.abs(Math.sin(this.walkPhase)) * 0.025;
    } else {
      this.walkPhase += dt * 1.4;
      const breathe = Math.sin(this.walkPhase) * 0.018;
      this.legL.rotation.x *= 0.9;
      this.legR.rotation.x *= 0.9;
      this.armL.rotation.x *= 0.9;
      if (this.state !== 'attack') this.armR.rotation.x *= 0.9;
      this.torsoPivot.position.y = 0.84 + breathe;
    }
    if (this.state === 'work') {
      const w = Math.sin(elapsed * 7) * 0.5;
      this.armL.rotation.x = -1.1 + w;
      this.armR.rotation.x = -1.1 - w;
      this.headPivot.rotation.x = 0.34;
    } else if (this.state !== 'attack') {
      this.headPivot.rotation.x *= 0.9;
    }
    this.group.position.y = 0;
  }

  die(killer) {
    if (!this.alive) return;
    this.alive = false;
    this.state = 'dead';
    this.deathT = 0;
    this.moveSpeed = 0;
    this.tag.visible = false;
    this.bodyMarker.visible = true;
    this.knife.visible = false;
    this.fallDir = Math.random() > 0.5 ? 1 : -1;
    this.group.rotation.z = 0;
    this.deathYaw = this.facing;
    this.bodyPool = this.makePool();
    this.scene.add(this.bodyPool);
  }

  makePool() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
    g.addColorStop(0, 'rgba(96,8,4,.9)');
    g.addColorStop(0.45, 'rgba(74,6,3,.75)');
    g.addColorStop(1, 'rgba(50,4,2,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(64, 64, 58, 46, 0.4, 0, Math.PI * 2);
    ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.9 });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.7), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = Math.random() * Math.PI;
    mesh.position.set(this.group.position.x, 0.012, this.group.position.z);
    mesh.renderOrder = 2;
    return mesh;
  }

  updateDeath(dt) {
    if (this.deathT < 1) {
      this.deathT = Math.min(1, this.deathT + dt * 2.2);
      const t = this.deathT;
      const ease = 1 - Math.pow(1 - t, 3);
      this.group.rotation.z = (Math.PI / 2) * ease * this.fallDir;
      this.group.position.y = 0.16 * ease;
      this.group.rotation.x = 0.08 * ease;
    }
  }

  clearBody() {
    if (this.bodyPool) { this.scene.remove(this.bodyPool); this.bodyPool = null; }
    this.bodyMarker.visible = false;
  }

  eject() {
    this.alive = false;
    this.state = 'dead';
    this.group.visible = false;
    this.tag.visible = false;
    this.bodyMarker.visible = false;
    if (this.bodyPool) { this.scene.remove(this.bodyPool); this.bodyPool = null; }
  }
}

function makeBodyMarker() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 112;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(10,4,3,.82)';
  ctx.fillRect(20, 12, 216, 88);
  ctx.strokeStyle = 'rgba(255,75,62,.85)';
  ctx.lineWidth = 4;
  ctx.strokeRect(22, 14, 212, 84);
  ctx.fillStyle = '#ff4b3e';
  ctx.font = 'bold 30px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('REPORT', 128, 68);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export { BOT_DEFS };
