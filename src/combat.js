import * as THREE from '../vendor/three.module.js';
import { BOSSES, STYLES } from './data.js';

const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const lerp = (a,b,t) => a + (b-a)*t;
const TAU = Math.PI * 2;

export class Combat {
  constructor(scene, camera, player, world, npcs, state, ui, audio) {
    this.scene = scene;
    this.camera = camera;
    this.player = player;
    this.world = world;
    this.npcs = npcs;
    this.state = state;
    this.ui = ui;
    this.audio = audio;
    this.active = false;
    this.enemy = null;
    this.boss = null;
    this.enemyHP = 100; this.enemyMax = 100;
    this.playerHP = 100; this.playerMax = 100;
    this.stamina = 100;
    this.special = 0;
    this.combo = 0; this.comboTimer = 0;
    this.cooldowns = { punch:0, kick:0, dodge:0, grapple:0, special:0, env:0 };
    this.enemyState = 'idle';
    this.enemyTimer = 1.2;
    this.enemyAttack = null;
    this.enemyCooldown = 1.5;
    this.enemySpecialCooldown = 7;
    this.enemyHits = 0;
    this.blocking = false;
    this.blockTime = 0;
    this.iframe = 0;
    this.slowmo = 1;
    this.finisherActive = false;
    this.finisherTimer = 0;
    this.endTimer = 0;
    this.endResult = null;
    this.startPos = null;
    this.arenaFight = false;
    this.hitFlash = 0;
    this.impactParticles = [];
    this.rings = [];
    this.lastPlayerAttack = 'punch';
    this.enemyStun = 0;
    this.playerStun = 0;
    this.callout = null;
    this.onEnd = null;
    this.damageNumbers = [];
    this.style = STYLES[state.player.style] || STYLES.street;
    this.streetProp = null;
  }

  get enemyPos() {
    if (!this.enemy) return { x:this.player.x, z:this.player.z };
    return { x:this.enemy.group.position.x, z:this.enemy.group.position.z };
  }

  get distance() {
    if (!this.enemy) return 99;
    return Math.hypot(this.enemy.group.position.x - this.player.x, this.enemy.group.position.z - this.player.z);
  }

  start(npc, opts = {}) {
    if (this.active || !npc) return false;
    this.active = true;
    this.enemy = npc;
    this.boss = opts.boss || null;
    this.arenaFight = !!opts.arena;
    this.onEnd = opts.onEnd || null;
    const boss = this.boss;
    this.enemyMax = boss ? boss.hp : 75 + Math.floor((this.state.player.level || 1) * 7);
    this.enemyHP = this.enemyMax;
    this.playerMax = 100 + ((this.state.player.level || 1) - 1) * 6;
    this.playerHP = clamp(this.state.player.health || this.playerMax, 1, this.playerMax);
    this.state.player.health = this.playerHP;
    this.stamina = this.state.player.stamina || 100;
    this.special = 0;
    this.combo = 0; this.comboTimer = 0;
    this.enemyState = 'approach';
    this.enemyTimer = 1.1;
    this.enemyCooldown = 1.6;
    this.enemySpecialCooldown = 6.5;
    this.enemyHits = 0;
    this.blocking = false; this.blockTime = 0; this.iframe = 0;
    this.slowmo = 1; this.finisherActive = false;
    this.endResult = null; this.endTimer = 0;
    this.enemyStun = 0; this.playerStun = 0;
    this.audio.setFight(true);
    this.ui.setCombat(true);
    this.ui.updateCombat(this.combatData());
    this.ui.showCallout(boss ? boss.title : 'STREET FIGHT');
    this.ui.toast(boss ? `${boss.name} // ${boss.style}` : `${npc.name} wants to throw hands.`, boss ? 'warn' : '');
    this.camera.fov = 66; this.camera.updateProjectionMatrix();
    // position
    const f = this.player.getForward();
    const dist = this.arenaFight ? 4.2 : 3.1;
    let tx = this.player.x + f.x * dist, tz = this.player.z + f.z * dist;
    if (this.world.isBlocked(tx, tz, .5)) { tx = this.player.x - f.x * dist; tz = this.player.z - f.z * dist; }
    npc.group.position.set(tx, 0, tz);
    npc.x = tx; npc.z = tz;
    npc.facing = Math.atan2(this.player.x - tx, this.player.z - tz);
    npc.group.rotation.y = npc.facing;
    npc.combat = true;
    npc.targetX = tx; npc.targetZ = tz;
    this.npcs.faceEachOther(npc, { x:this.player.x, z:this.player.z });
    this.player.yaw = Math.atan2(-(tx - this.player.x), -(tz - this.player.z));
    this.player.pitch = -.04;
    // style-specific
    this.style = STYLES[this.state.player.style] || STYLES.street;
    this.ui.setStyle(this.state.player.style);
    this.spawnRing(new THREE.Vector3(tx, .2, tz), boss ? new THREE.Color(boss.accent) : new THREE.Color(0xffb35c), 1.6, .6);
    this.audio.special();
    return true;
  }

  combatData() {
    return {
      active:this.active, playerHP:this.playerHP, playerMax:this.playerMax,
      enemyHP:this.enemyHP, enemyMax:this.enemyMax, stamina:this.stamina,
      special:this.special, combo:this.combo, enemyName:this.boss ? this.boss.name : (this.enemy?.name || 'UNKNOWN'),
      enemySub:this.boss ? this.boss.style : (this.enemy?.tag || 'STREET'),
      playerName:this.state.player.name || 'ROOKIE',
      style:this.style?.name || 'STREET',
      canFinish:this.enemyHP > 0 && this.enemyHP <= this.enemyMax * .2 && this.special >= 50
    };
  }

  updateUI() { this.ui.updateCombat(this.combatData()); }

  punch() {
    if (!this.active || this.endResult || this.finisherActive) return;
    if (this.cooldowns.punch > 0 || this.stamina < 5 || this.playerStun > 0) return;
    this.cooldowns.punch = .28;
    this.stamina -= 5;
    this.lastPlayerAttack = 'punch';
    this.player.animateAttack('punch');
    this.audio.punch();
    this.tryHit('punch');
  }

  kick() {
    if (!this.active || this.endResult || this.finisherActive) return;
    if (this.cooldowns.kick > 0 || this.stamina < 11 || this.playerStun > 0) return;
    this.cooldowns.kick = .52;
    this.stamina -= 11;
    this.lastPlayerAttack = 'kick';
    this.player.animateAttack('kick');
    this.audio.kick();
    this.tryHit('kick');
  }

  grapple() {
    if (!this.active || this.endResult || this.finisherActive) return;
    if (this.cooldowns.grapple > 0 || this.stamina < 15 || this.playerStun > 0) return;
    this.cooldowns.grapple = 1.1;
    this.stamina -= 15;
    this.player.animateAttack('punch');
    if (this.distance < 2.8) {
      const mult = this.state.player.style === 'wrestling' ? 1.7 : 1;
      this.hitEnemy(15 * mult, 'GRAPPLE', true);
      this.enemyStun = 1.1;
      this.player.addShake(.35);
      this.audio.hit(1.2);
    } else {
      this.ui.showCallout('TOO FAR');
    }
  }

  setBlock(on) {
    if (!this.active || this.endResult) { this.blocking = false; this.player.blocking = false; return; }
    this.blocking = !!on;
    if (on) this.blockTime = 0;
    this.player.blocking = this.blocking;
  }

  dodge() {
    if (!this.active || this.endResult || this.finisherActive) return;
    if (this.cooldowns.dodge > 0 || this.stamina < 9 || this.playerStun > 0) return;
    this.cooldowns.dodge = .85;
    this.stamina -= 9;
    const reflex = this.state.player.reflex || 1;
    this.iframe = .46 + Math.min(.22, reflex * .03);
    this.audio.dodge?.();
    const f = this.player.getForward();
    const side = Math.random() < .5 ? 1 : -1;
    const tries = [
      [this.player.x - f.z * side * 2.3, this.player.z + f.x * side * 2.3],
      [this.player.x + f.z * side * 2.3, this.player.z - f.x * side * 2.3],
      [this.player.x - f.x * 2.1, this.player.z - f.z * 2.1]
    ];
    for (const [nx, nz] of tries) {
      if (!this.world.isBlocked(nx, nz, this.player.radius)) { this.player.x = nx; this.player.z = nz; break; }
    }
    this.ui.showCallout('DODGE');
    this.special = clamp(this.special + 4, 0, 100);
  }

  environment() {
    if (!this.active || this.endResult || this.finisherActive) return;
    if (this.cooldowns.env > 0 || this.stamina < 14) return;
    this.cooldowns.env = 2.4;
    this.stamina -= 14;
    const kind = this.arenaFight ? 'ring post' : ['trash can','loose brick','traffic cone','wet newspaper'][Math.floor(Math.random()*4)];
    this.ui.showCallout('ENVIRONMENT // ' + kind.toUpperCase());
    this.player.animateAttack('punch');
    setTimeout(() => {
      if (!this.active) return;
      if (this.distance < 4.2) {
        this.hitEnemy(11 + Math.floor(Math.random()*7), 'ENVIRONMENT', true);
        this.enemyStun = .7;
        this.audio.impact?.(1); this.audio.hit(1);
        const pos = new THREE.Vector3(this.enemyPos.x, 1.2, this.enemyPos.z);
        this.spawnImpact(pos, new THREE.Color(0xffb35c), 20);
      }
    }, 220);
  }

  tryHit(type) {
    const inRange = type === 'kick' ? this.distance < 3.15 : this.distance < 2.55;
    if (!inRange) return;
    let dmg = type === 'kick' ? 11 : 7;
    dmg += (this.state.player.strength || 1) * 1.4;
    if (this.state.player.style === 'muay' && type === 'kick') dmg *= 1.35;
    if (this.state.player.style === 'street') dmg *= 1.08;
    if (this.enemyStun > 0) dmg *= 1.25;
    if (this.enemyState === 'block') dmg *= .25;
    const comboMult = 1 + Math.min(this.combo, 8) * .055;
    dmg *= comboMult;
    this.hitEnemy(dmg, type.toUpperCase());
    this.special = clamp(this.special + (type === 'kick' ? 8 : 5), 0, 100);
    this.combo++;
    this.comboTimer = 2.2;
    this.player.addShake(type === 'kick' ? .24 : .14);
    this.audio.hit(type === 'kick' ? 1.25 : .8);
    const pos = new THREE.Vector3(this.enemyPos.x, 1.25, this.enemyPos.z);
    this.spawnImpact(pos, new THREE.Color(type === 'kick' ? 0xffb35c : 0x7fe3d2), type === 'kick' ? 16 : 10);
    if (this.combo >= 3) this.ui.showCombo(this.combo);
    if (this.boss?.id === 'student' && this.enemyState === 'counter') {
      this.counterPlayer(9);
      this.ui.showCallout('RED PEN COUNTER');
    }
  }

  hitEnemy(dmg, label, heavy = false) {
    if (!this.active || this.enemyHP <= 0) return;
    const rounded = Math.round(dmg);
    this.enemyHP = Math.max(0, this.enemyHP - rounded);
    this.npcs.playHit(this.enemy);
    this.ui.damageNumber(rounded, this.enemyPos, this.camera);
    if (heavy) this.enemyStun = Math.max(this.enemyStun, .5);
    if (this.enemyHP <= 0) this.win();
  }

  counterPlayer(dmg) {
    this.playerHP = Math.max(0, this.playerHP - dmg);
    this.state.player.health = this.playerHP;
    this.player.addShake(.5);
    this.audio.hit(1.2);
    this.ui.flashHit();
    this.combo = 0;
    if (this.playerHP <= 0) this.lose();
  }

  specialAttack() {
    if (!this.active || this.endResult || this.finisherActive) return;
    if (this.special < 100 || this.cooldowns.special > 0) {
      if (this.special < 100) this.ui.showCallout('SPECIAL NOT READY');
      return;
    }
    this.special = 0;
    this.cooldowns.special = 1.2;
    this.slowmo = .32;
    this.audio.special();
    this.player.animateAttack('special');
    this.player.addShake(.8);
    this.ui.showCallout(this.style.special);
    this.camera.fov = 78; this.camera.updateProjectionMatrix();
    this.spawnRing(new THREE.Vector3(this.player.x, .3, this.player.z), new THREE.Color(this.style.color || '#ff4338'), 1, 1.8);
    setTimeout(() => {
      if (!this.active) return;
      const dmg = (this.style.name === 'MUAY THAI' ? 36 : this.style.name === 'WRESTLING' ? 40 : this.style.name === 'FLOW' ? 32 : 34) + (this.state.player.strength || 1) * 2;
      if (this.distance < 4.5) {
        this.hitEnemy(dmg, this.style.special, true);
        this.enemyStun = 1.2;
        this.spawnImpact(new THREE.Vector3(this.enemyPos.x, 1.3, this.enemyPos.z), new THREE.Color(this.style.color || '#ff4338'), 34);
        this.audio.hit(1.7);
      } else {
        this.enemyHP = Math.max(0, this.enemyHP - 4);
        this.ui.showCallout('GRAZED');
      }
      this.slowmo = 1;
      this.camera.fov = 66; this.camera.updateProjectionMatrix();
      if (this.enemyHP <= 0) this.win();
    }, 600);
  }

  finisher() {
    if (!this.active || this.finisherActive || this.endResult) return;
    if (this.enemyHP > this.enemyMax * .2 || this.special < 50) return;
    this.finisherActive = true;
    this.finisherTimer = 2.5;
    this.slowmo = .18;
    this.special = 0;
    this.player.cinematic = true;
    this.audio.special();
    this.ui.showCallout('FINISH');
    this.ui.showFinisher(false);
    this.camera.fov = 55; this.camera.updateProjectionMatrix();
    this.player.addShake(1.2);
    this.spawnRing(new THREE.Vector3(this.enemyPos.x, .5, this.enemyPos.z), new THREE.Color(0xff4338), 1, 3);
    setTimeout(() => {
      if (!this.active) return;
      this.enemyHP = 0;
      this.npcs.playHit(this.enemy);
      this.spawnImpact(new THREE.Vector3(this.enemyPos.x, 1.2, this.enemyPos.z), new THREE.Color(0xff4338), 50);
      this.audio.ko();
      this.player.addShake(1.5);
      this.ui.flashHit();
      this.win();
      this.finisherActive = false;
      this.player.cinematic = false;
      this.slowmo = 1;
      this.camera.fov = 66; this.camera.updateProjectionMatrix();
    }, 1300);
  }

  win() {
    if (this.endResult) return;
    this.endResult = 'win';
    this.endTimer = 2.1;
    this.enemyState = 'defeated';
    this.enemyHP = 0;
    this.slowmo = .35;
    this.player.cinematic = true;
    this.audio.ko();
    this.ui.showCallout('KNOCKOUT');
    this.ui.updateCombat(this.combatData());
    this.spawnRing(new THREE.Vector3(this.enemyPos.x, .2, this.enemyPos.z), new THREE.Color(0xffb35c), 2, 2.6);
    setTimeout(() => {
      if (!this.enemy) return;
      this.enemy.group.rotation.z = .9;
      this.enemy.group.position.y = .1;
    }, 300);
  }

  lose() {
    if (this.endResult) return;
    this.endResult = 'lose';
    this.endTimer = 2.4;
    this.playerHP = 0;
    this.state.player.health = 0;
    this.slowmo = .3;
    this.audio.ko();
    this.ui.showCallout('KNOCKED OUT');
    this.ui.flashHit();
    this.player.addShake(1.2);
    this.player.cinematic = true;
  }

  finishCombat() {
    const result = this.endResult;
    const enemy = this.enemy;
    const boss = this.boss;
    this.active = false;
    this.enemy = null;
    this.boss = null;
    this.player.cinematic = false;
    this.slowmo = 1;
    this.player.blocking = false;
    this.blocking = false;
    this.camera.fov = 72; this.camera.updateProjectionMatrix();
    this.ui.setCombat(false);
    this.audio.setFight(false);
    if (enemy) {
      enemy.combat = false;
      enemy.group.rotation.z = 0; enemy.group.position.y = 0;
    }
    this.endResult = null;
    this.finisherActive = false;
    this.cleanupEffects();
    if (this.onEnd) { const cb = this.onEnd; this.onEnd = null; cb(result, enemy, boss); }
  }

  cleanupEffects() {
    for (const p of this.impactParticles) { this.scene.remove(p.mesh); p.mesh.geometry.dispose?.(); }
    this.impactParticles = [];
    for (const r of this.rings) { this.scene.remove(r.mesh); r.mesh.geometry.dispose?.(); }
    this.rings = [];
  }

  spawnImpact(pos, color, count = 12) {
    const geo = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { arr[i*3]=0; arr[i*3+1]=0; arr[i*3+2]=0; }
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const mat = new THREE.PointsMaterial({ color, size:.11, transparent:true, opacity:1, depthWrite:false, blending:THREE.AdditiveBlending });
    const mesh = new THREE.Points(geo, mat); mesh.position.copy(pos); this.scene.add(mesh);
    const vel = [];
    for (let i = 0; i < count; i++) vel.push(new THREE.Vector3((Math.random()-.5)*8, Math.random()*6, (Math.random()-.5)*8));
    this.impactParticles.push({ mesh, vel, life:1 });
  }

  spawnRing(pos, color, inner = 1, duration = .7) {
    const geo = new THREE.RingGeometry(.82, 1, 40);
    const mat = new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.8, side:THREE.DoubleSide, depthWrite:false, blending:THREE.AdditiveBlending });
    const mesh = new THREE.Mesh(geo, mat); mesh.rotation.x = -Math.PI/2; mesh.position.copy(pos); this.scene.add(mesh);
    this.rings.push({ mesh, life:duration, max:duration, inner });
  }

  triggerBossSpecial() {
    if (!this.boss || this.endResult) return;
    const b = this.boss;
    const ability = b.abilities[Math.floor(Math.random() * b.abilities.length)];
    this.ui.showCallout(ability.toUpperCase());
    this.audio.special();
    this.spawnRing(new THREE.Vector3(this.enemyPos.x, .3, this.enemyPos.z), new THREE.Color(b.accent), 1, 1.4);
    this.enemyState = 'special';
    this.enemyTimer = 1.15;
    this.enemyAttack = { type:'boss', ability, damage:b.dmg * 1.5 };
    if (b.id === 'raincoat') {
      const f = this.player.getForward();
      this.enemy.group.position.set(this.player.x - f.x * 2.3, 0, this.player.z - f.z * 2.3);
      this.enemy.x = this.enemy.group.position.x; this.enemy.z = this.enemy.group.position.z;
    }
    if (b.id === 'ferryman') {
      const dx = this.enemyPos.x - this.player.x, dz = this.enemyPos.z - this.player.z;
      const d = Math.hypot(dx,dz) || 1;
      this.player.x += dx / d * 1.5; this.player.z += dz / d * 1.5;
      this.player.addShake(.25);
    }
    if (b.id === 'future' && this.enemyHP < this.enemyMax * .6) this.enemyHP = Math.min(this.enemyMax, this.enemyHP + 8);
    if (b.id === 'mayor') this.playerStun = 1.2;
    if (b.id === 'hiker') this.playerStun = .8;
    if (b.id === 'oldman') this.slowmo = .55;
    setTimeout(() => {
      if (!this.active || this.endResult) return;
      const dist = this.distance;
      const blocked = this.blocking;
      if (dist < 5.2 || b.id === 'mayor' || b.id === 'ferryman') {
        let dmg = b.dmg * (1.1 + Math.random() * .6);
        if (blocked) dmg *= .32;
        if (this.iframe > 0) dmg = 0;
        if (b.id === 'mirror' && this.lastPlayerAttack === 'kick') dmg *= 1.2;
        if (b.id === 'student' && this.lastPlayerAttack) dmg *= 1.15;
        if (dmg > 0) {
          this.playerHP = Math.max(0, this.playerHP - Math.round(dmg));
          this.state.player.health = this.playerHP;
          this.player.addShake(.7);
          this.ui.flashHit();
          this.audio.hit(1.2);
          this.spawnImpact(new THREE.Vector3(this.player.x, 1.2, this.player.z), new THREE.Color(b.accent), 22);
          this.combo = 0;
          if (this.playerHP <= 0) this.lose();
        } else this.ui.showCallout('DODGED');
      }
      this.slowmo = 1;
      this.enemyState = 'recover';
      this.enemyTimer = 1.2;
    }, 850);
  }

  update(dt) {
    if (!this.active) return;
    this.updateUI();
    if (this.endResult) {
      this.endTimer -= dt;
      this.slowmo = lerp(this.slowmo, 1, dt * 2);
      this.updateEffects(dt);
      if (this.endTimer <= 0) this.finishCombat();
      return;
    }
    if (this.finisherActive) {
      this.updateEffects(dt * .2);
      return;
    }
    const scaled = dt * this.slowmo;
    for (const k in this.cooldowns) this.cooldowns[k] = Math.max(0, this.cooldowns[k] - dt);
    this.iframe = Math.max(0, this.iframe - dt);
    this.enemyStun = Math.max(0, this.enemyStun - scaled);
    this.playerStun = Math.max(0, this.playerStun - dt);
    this.comboTimer -= dt;
    if (this.comboTimer <= 0) this.combo = 0;
    this.stamina = clamp(this.stamina + dt * 11, 0, 100);
    this.state.player.stamina = this.stamina;
    this.state.player.health = this.playerHP;
    this.special = clamp(this.special + dt * .65, 0, 100);
    this.player.blocking = this.blocking;
    if (this.blocking) this.blockTime += dt; else this.blockTime = 0;

    // player movement is normal; keep facing target when close
    if (this.distance < 5.5) {
      const targetYaw = Math.atan2(-(this.enemyPos.x - this.player.x), -(this.enemyPos.z - this.player.z));
      let diff = ((targetYaw - this.player.yaw + Math.PI * 3) % TAU) - Math.PI;
      if (Math.abs(diff) > .35) this.player.yaw += diff * dt * .8;
    }
    // clamp to arena
    if (this.arenaFight) {
      const a = this.world.arena;
      const d = Math.hypot(this.player.x - a.x, this.player.z - a.z);
      if (d > 11) {
        const ang = Math.atan2(this.player.z - a.z, this.player.x - a.x);
        this.player.x = a.x + Math.cos(ang) * 10.7; this.player.z = a.z + Math.sin(ang) * 10.7;
      }
    }

    // enemy AI
    if (this.enemy && !this.endResult) {
      const npc = this.enemy;
      const ex = npc.group.position.x, ez = npc.group.position.z;
      const dx = this.player.x - ex, dz = this.player.z - ez;
      const dist = Math.hypot(dx, dz) || .001;
      npc.facing = Math.atan2(dx, dz);
      npc.group.rotation.y = npc.facing;
      npc.group.position.y = 0;
      if (this.enemyState !== 'attack' && this.enemyState !== 'special' && this.enemyState !== 'stagger' && this.enemyState !== 'counter') {
        this.enemyTimer -= scaled;
        this.enemyCooldown -= scaled;
        this.enemySpecialCooldown -= scaled;
        // movement
        let moveSpeed = (this.boss ? 2.1 : 1.6) * (this.boss?.speed || 1);
        if (this.boss?.id === 'barista') moveSpeed *= 1.25;
        if (this.boss?.id === 'oldman') moveSpeed *= .7;
        if (dist > 2.7) {
          const nx = ex + dx / dist * moveSpeed * scaled;
          const nz = ez + dz / dist * moveSpeed * scaled;
          if (!this.world.isBlocked(nx, nz, .4)) { npc.group.position.x = nx; npc.group.position.z = nz; }
        } else if (dist < 1.65) {
          npc.group.position.x -= dx / dist * moveSpeed * .55 * scaled;
          npc.group.position.z -= dz / dist * moveSpeed * .55 * scaled;
        } else {
          const side = Math.sin(this.enemyTimer * 1.7) * .55;
          const nx = ex + (-dz / dist) * side * scaled, nz = ez + (dx / dist) * side * scaled;
          if (!this.world.isBlocked(nx, nz, .4)) { npc.group.position.x = nx; npc.group.position.z = nz; }
        }
        npc.x = npc.group.position.x; npc.z = npc.group.position.z;
        if (this.enemySpecialCooldown <= 0 && this.boss) {
          this.enemySpecialCooldown = 6 + Math.random() * 4;
          this.triggerBossSpecial();
        } else if (this.enemyCooldown <= 0 && dist < 3.4) {
          this.enemyState = 'windup';
          this.enemyTimer = .55;
          this.enemyAttack = { type:'strike', damage:this.boss ? this.boss.dmg : 8 + Math.random()*5 };
          this.ui.showCallout('INCOMING');
          this.enemyHits++;
          if (this.boss?.id === 'student' && Math.random() < .28) this.enemyState = 'counter';
        }
      } else if (this.enemyState === 'windup') {
        this.enemyTimer -= scaled;
        // telegraph glow
        npc.model.torso.material.emissive = new THREE.Color(0xff4338);
        npc.model.torso.material.emissiveIntensity = .25 + Math.sin(this.enemyTimer * 30) * .1;
        if (this.enemyTimer <= 0) {
          npc.model.torso.material.emissiveIntensity = 0;
          if (this.enemyAttack?.type === 'strike') {
            const hit = this.distance < 3.0;
            if (hit && this.iframe <= 0) {
              let dmg = this.enemyAttack.damage;
              if (this.blocking) dmg *= .22;
              if (this.blocking && this.blockTime < .25) {
                this.ui.showCallout('COUNTER');
                this.hitEnemy(8 + (this.state.player.strength||1), 'COUNTER', true);
                this.special = clamp(this.special + 15, 0, 100);
                this.audio.block();
                this.enemyStun = .8;
              } else {
                this.playerHP = Math.max(0, this.playerHP - Math.round(dmg));
                this.state.player.health = this.playerHP;
                this.player.addShake(.5);
                this.audio.hit(.9);
                this.ui.flashHit();
                this.spawnImpact(new THREE.Vector3(this.player.x, 1.2, this.player.z), new THREE.Color(0xff4338), 14);
                this.combo = 0;
                if (this.playerHP <= 0) this.lose();
              }
            }
          }
          this.enemyState = 'recover';
          this.enemyTimer = .55 + Math.random() * .5;
          this.enemyCooldown = 1.1 + Math.random() * 1.1;
        }
      } else if (this.enemyState === 'recover' || this.enemyState === 'stagger') {
        this.enemyTimer -= scaled;
        if (this.enemyTimer <= 0) this.enemyState = 'approach';
      } else if (this.enemyState === 'counter') {
        this.enemyTimer -= scaled;
        npc.model.torso.material.emissive = new THREE.Color(0xd9a6ff);
        npc.model.torso.material.emissiveIntensity = .18;
        if (this.enemyTimer <= 0) { npc.model.torso.material.emissiveIntensity = 0; this.enemyState = 'approach'; this.enemyCooldown = .7; }
      } else if (this.enemyState === 'special') {
        this.enemyTimer -= scaled;
        if (this.enemyTimer <= 0) this.enemyState = 'recover';
      }
      // enemy animation
      const m = npc.model;
      if (this.enemyState === 'windup') { m.leftArm.rotation.x = -1.4; m.rightArm.rotation.x = -1.4; }
      else if (this.enemyState === 'attack') { m.rightArm.rotation.x = -.2; }
      else {
        const t = performance.now() * .004;
        m.leftArm.rotation.x = Math.sin(t) * .25; m.rightArm.rotation.x = -Math.sin(t) * .25;
      }
      m.leftLeg.rotation.x *= .9; m.rightLeg.rotation.x *= .9;
    }
    this.updateEffects(dt);
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.hitFlash > 0) this.camera.rotation.z = (Math.random()-.5) * .01;
  }

  updateEffects(dt) {
    for (let i = this.impactParticles.length - 1; i >= 0; i--) {
      const p = this.impactParticles[i];
      p.life -= dt * 2.2;
      const pos = p.mesh.geometry.attributes.position;
      for (let j = 0; j < p.vel.length; j++) {
        p.vel[j].y -= 9 * dt;
        pos.array[j*3] += p.vel[j].x * dt;
        pos.array[j*3+1] += p.vel[j].y * dt;
        pos.array[j*3+2] += p.vel[j].z * dt;
      }
      pos.needsUpdate = true;
      p.mesh.material.opacity = clamp(p.life, 0, 1);
      if (p.life <= 0) { this.scene.remove(p.mesh); p.mesh.geometry.dispose(); p.mesh.material.dispose(); this.impactParticles.splice(i,1); }
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life -= dt;
      const t = 1 - r.life / r.max;
      r.mesh.scale.setScalar(1 + t * 7);
      r.mesh.material.opacity = (1 - t) * .7;
      if (r.life <= 0) { this.scene.remove(r.mesh); r.mesh.geometry.dispose(); r.mesh.material.dispose(); this.rings.splice(i,1); }
    }
  }
}
