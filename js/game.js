import * as THREE from '../vendor/three.module.js';
import { createWorld } from './world.js';
import { Player } from './player.js';
import { Drone, Bolt } from './enemies.js';
import { Effects } from './effects.js';
import { Pickup, CrystalNode, Crate, LOOT } from './loot.js';
import { Audio } from './audio.js';
import {
  terrainHeight, HUB, REFINERY, ELEVATOR, clamp, rand, randInt, chance,
  formatAether, formatNumber,
} from './util.js';

const WALLET_KEY = 'aethelgard.wallet.v1';
const CARGO_MAX = 24;
const CORE_VALUE = 25;
const STORM_CLEAR = 70;
const STORM_ACTIVE = 26;
const EXTRACT_TIME = 12;

const DEFAULT_WALLET = { scrap: 0, aether: 0, runs: 0, deaths: 0, best: 0 };

function loadWallet() {
  try {
    const raw = localStorage.getItem(WALLET_KEY);
    if (!raw) return { ...DEFAULT_WALLET };
    const parsed = JSON.parse(raw);
    return {
      scrap: Number(parsed.scrap) || 0,
      aether: Number(parsed.aether) || 0,
      runs: Number(parsed.runs) || 0,
      deaths: Number(parsed.deaths) || 0,
      best: Number(parsed.best) || 0,
    };
  } catch {
    return { ...DEFAULT_WALLET };
  }
}

export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ui = ui;
    this.wallet = loadWallet();
    this.audio = new Audio();
    this.state = 'menu';
    this.time = 0;
    this.menuTime = 0;
    this.deathT = 0;
    this.wasLocked = false;
    this.lastFullToast = -10;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(74, window.innerWidth / window.innerHeight, 0.08, 1200);
    this.camera.rotation.order = 'YXZ';
    this.scene.add(this.camera);

    this.world = createWorld(this.scene, this.renderer);
    this.effects = new Effects(this.scene);
    this.player = new Player({ camera: this.camera, scene: this.scene, game: this });
    this.player.reset();
    this.player.setVisible(false);

    this.enemies = [];
    this.bolts = [];
    this.pickups = [];
    this.crates = this.world.crates.map((d) => new Crate(this.scene, d));
    this.nodes = this.world.crystals.map((d) => new CrystalNode(this.scene, d));
    this.respawnQueue = [];

    this.run = { scrap: 0, cores: 0, mass: 0, kills: 0 };
    this.storm = { active: false, timer: STORM_CLEAR };
    this.extraction = { active: false, timer: 0, total: EXTRACT_TIME, tick: 0 };
    this.hold = { id: null, t: 0 };
    this.interactTarget = null;

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 300;
    this.tmpV = new THREE.Vector3();
    this.ctx = {
      player: this.player,
      effects: this.effects,
      game: this,
      storm: false,
    };

    this.input = {
      forward: 0, strafe: 0, sprint: false, jump: false,
      fire: false, ads: false, interact: false,
    };
    this.keys = new Set();
    this.firing = false;
    this.ads = false;
    this.interactHeld = false;
    this.dragging = false;
    this.locked = false;
    this.touch = { forward: 0, strafe: 0, fire: false, interact: false };

    this.ui.setWallet(this.wallet);
    this.bindInput();
    this.bindResize();

    this.spawnInitialDrones();
    this.updateHUD();

    this.clock = new THREE.Clock();
    this.renderer.setAnimationLoop(() => this.frame());
  }

  /* ---------------------------------------------------------------- */
  /* Wallet                                                            */
  /* ---------------------------------------------------------------- */
  saveWallet() {
    try {
      localStorage.setItem(WALLET_KEY, JSON.stringify(this.wallet));
    } catch { /* storage unavailable */ }
    this.ui.setWallet(this.wallet);
  }

  /* ---------------------------------------------------------------- */
  /* Input                                                             */
  /* ---------------------------------------------------------------- */
  bindInput() {
    const canvas = this.canvas;

    window.addEventListener('keydown', (e) => {
      const k = e.code;
      if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Tab'].includes(k)) e.preventDefault();
      this.keys.add(k);
      if (k === 'KeyR' && this.state === 'playing') this.player.reload();
      if (k === 'Escape') {
        if (this.state === 'playing') this.pause();
        else if (this.state === 'paused') this.resume();
      }
      if (k === 'KeyE') this.interactHeld = true;
      if (k === 'KeyM') this.toggleMute();
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      if (e.code === 'KeyE') this.interactHeld = false;
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
      this.firing = false;
      this.ads = false;
      this.interactHeld = false;
      if (this.state === 'playing') this.pause();
    });

    canvas.addEventListener('mousedown', (e) => {
      if (this.state !== 'playing') return;
      if (e.button === 0) {
        this.firing = true;
        this.dragging = true;
        if (!this.locked) this.requestLock();
      }
      if (e.button === 2) this.ads = true;
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.firing = false;
        this.dragging = false;
      }
      if (e.button === 2) this.ads = false;
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    document.addEventListener('mousemove', (e) => {
      if (this.state !== 'playing') return;
      if (this.locked) {
        this.player.look(e.movementX || 0, e.movementY || 0);
      } else if (this.dragging) {
        this.player.look((e.movementX || 0) * 1.4, (e.movementY || 0) * 1.4);
      }
    });

    document.addEventListener('pointerlockchange', () => {
      const locked = document.pointerLockElement === canvas;
      if (this.locked && !locked && this.state === 'playing') {
        this.pause();
      }
      this.locked = locked;
      this.wasLocked = locked;
    });

    canvas.addEventListener('click', () => {
      if (this.state === 'playing' && !this.locked) this.requestLock();
    });

    // touch controls --------------------------------------------------
    const stickZone = document.getElementById('stick-zone');
    const knob = document.getElementById('stick-knob');
    let stickId = null;
    let stickCenter = { x: 0, y: 0 };

    const setStick = (dx, dy) => {
      const max = 55;
      const len = Math.hypot(dx, dy) || 1;
      const cl = Math.min(1, len / max);
      const nx = (dx / len) * cl;
      const ny = (dy / len) * cl;
      this.touch.strafe = nx;
      this.touch.forward = -ny;
      knob.style.transform = `translate(${nx * 34}px, ${ny * 34}px)`;
    };
    const resetStick = () => {
      stickId = null;
      this.touch.strafe = 0;
      this.touch.forward = 0;
      knob.style.transform = 'translate(0px, 0px)';
    };

    if (stickZone) {
      stickZone.addEventListener('pointerdown', (e) => {
        stickId = e.pointerId;
        stickZone.setPointerCapture(e.pointerId);
        const r = stickZone.getBoundingClientRect();
        stickCenter = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        setStick(e.clientX - stickCenter.x, e.clientY - stickCenter.y);
        e.preventDefault();
      });
      stickZone.addEventListener('pointermove', (e) => {
        if (e.pointerId !== stickId) return;
        setStick(e.clientX - stickCenter.x, e.clientY - stickCenter.y);
      });
      stickZone.addEventListener('pointerup', resetStick);
      stickZone.addEventListener('pointercancel', resetStick);
    }

    let lookId = null;
    let lastX = 0, lastY = 0;
    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch' || this.state !== 'playing') return;
      if (e.clientX < window.innerWidth * 0.35) return;
      lookId = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    canvas.addEventListener('pointermove', (e) => {
      if (e.pointerId !== lookId) return;
      this.player.look((e.clientX - lastX) * 1.5, (e.clientY - lastY) * 1.5);
      lastX = e.clientX;
      lastY = e.clientY;
    });
    const endLook = (e) => { if (e.pointerId === lookId) lookId = null; };
    canvas.addEventListener('pointerup', endLook);
    canvas.addEventListener('pointercancel', endLook);

    for (const btn of document.querySelectorAll('[data-touch]')) {
      const action = btn.dataset.touch;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.audio.resume();
        if (action === 'fire') this.touch.fire = true;
        if (action === 'interact') this.touch.interact = true;
        if (action === 'reload') this.player.reload();
      });
      const release = (e) => {
        e.preventDefault();
        if (action === 'fire') this.touch.fire = false;
        if (action === 'interact') this.touch.interact = false;
      };
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('pointerleave', release);
    }
  }

  requestLock() {
    if (this.locked) return;
    const p = this.canvas.requestPointerLock?.({ unadjustedMovement: true });
    if (p && p.catch) {
      p.catch(() => {
        try { this.canvas.requestPointerLock(); } catch { /* drag-look fallback */ }
      });
    }
  }

  bindResize() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      this.player.layout(window.innerWidth);
    });
  }

  toggleMute() {
    this.audio.setMuted(!this.audio.muted);
    this.ui.setMuted(this.audio.muted);
  }

  /* ---------------------------------------------------------------- */
  /* Run lifecycle                                                     */
  /* ---------------------------------------------------------------- */
  startRun() {
    this.audio.resume();
    this.ui.showStart(false);
    this.ui.showHelp(false);
    this.ui.hideEnd();
    this.ui.showPause(false);
    this.ui.showHUD(true);
    this.ui.setExtraction(false);
    this.ui.setPrompt(null);

    this.state = 'playing';
    this.time = 0;
    this.deathT = 0;
    this.run = { scrap: 0, cores: 0, mass: 0, kills: 0 };
    this.extraction = { active: false, timer: 0, total: EXTRACT_TIME, tick: 0 };
    this.hold = { id: null, t: 0 };
    this.storm = { active: false, timer: STORM_CLEAR };
    this.audio.setStorm(false);
    this.world.lift.called = false;

    this.player.reset();
    this.player.setVisible(true);
    this.clearEntities();
    this.resetLoot();
    this.spawnInitialDrones();

    this.ui.setObjective('REACH LIFT 04 // EXTRACT YOUR CARGO');
    this.ui.setWallet(this.wallet);
    this.updateHUD();
    this.requestLock();
  }

  clearEntities() {
    for (const e of this.enemies) {
      if (e.alive) this.scene.remove(e.group);
      e.alive = false;
    }
    this.enemies.length = 0;
    for (const b of this.bolts) b.kill();
    this.bolts.length = 0;
    for (const p of this.pickups) p.dispose();
    this.pickups.length = 0;
    this.respawnQueue.length = 0;
  }

  resetLoot() {
    for (const c of this.crates) c.reset();
    for (const n of this.nodes) n.reset();
  }

  spawnInitialDrones() {
    const spots = [
      { x: REFINERY.x + 9, z: REFINERY.z + 12, heavy: false },
      { x: REFINERY.x - 13, z: REFINERY.z - 4, heavy: false },
      { x: REFINERY.x + 16, z: REFINERY.z - 10, heavy: true },
      { x: -2, z: -48, heavy: false },
      { x: 26, z: -74, heavy: false },
      { x: -34, z: -98, heavy: false },
      { x: 42, z: -132, heavy: true },
      { x: 66, z: -36, heavy: false },
      { x: ELEVATOR.x - 8, z: ELEVATOR.z + 12, heavy: false },
    ];
    for (const s of spots) this.spawnDrone(s.x, s.z, s.heavy ? 'heavy' : 'scout');
  }

  spawnDrone(x, z, variant = 'scout') {
    const y = terrainHeight(x, z) + rand(2.5, 4.5);
    const drone = new Drone(this.scene, new THREE.Vector3(x, y, z), variant);
    this.enemies.push(drone);
    return drone;
  }

  scheduleRespawn() {
    this.respawnQueue.push({ t: rand(16, 28) });
  }

  randomSpawnPoint() {
    for (let i = 0; i < 24; i++) {
      const x = rand(-180, 180);
      const z = rand(-180, 180);
      if (Math.hypot(x - HUB.x, z - HUB.z) < 34) continue;
      if (Math.hypot(x - this.player.pos.x, z - this.player.pos.z) < 55) continue;
      return { x, z };
    }
    return { x: REFINERY.x + rand(-20, 20), z: REFINERY.z + rand(-20, 20) };
  }

  /* ---------------------------------------------------------------- */
  /* Frame loop                                                        */
  /* ---------------------------------------------------------------- */
  frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.menuTime += dt;

    if (this.state === 'playing') {
      this.time += dt;
      this.updatePlaying(dt);
    } else if (this.state === 'menu') {
      this.updateMenu(dt);
    } else if (this.state === 'dead') {
      this.deathT += dt;
      this.updateDeath(dt);
    } else if (this.state === 'extracted') {
      this.updateAmbient(dt);
    } else if (this.state === 'paused') {
      // hold the frame
    }

    this.ui.update(dt);
    this.renderer.render(this.scene, this.camera);
  }

  updateMenu(dt) {
    const t = this.menuTime;
    const a = t * 0.055;
    const y = terrainHeight(HUB.x, HUB.z);
    this.camera.position.set(
      HUB.x + Math.cos(a) * 31,
      y + 8.6 + Math.sin(t * 0.35) * 0.35,
      HUB.z + 15 + Math.sin(a) * 9
    );
    this.camera.lookAt(REFINERY.x * 0.4, 5.5, REFINERY.z - 34);
    this.camera.rotation.z = 0;

    this.world.update(dt, t, false, null);
    this.effects.update(dt);
    this.ui.updateMarkers(this.camera, false);
    for (const d of this.enemies) d.update(dt, this.ctx);
    for (const c of this.crates) c.update(dt);
    for (const n of this.nodes) n.update(dt);
  }

  updateAmbient(dt) {
    this.world.update(dt, this.time, this.storm.active, null);
    this.effects.update(dt);
    for (const d of this.enemies) d.update(dt, this.ctx);
    for (const c of this.crates) c.update(dt);
    for (const n of this.nodes) n.update(dt);
    this.ui.updateMarkers(this.camera, false);
  }

  updatePlaying(dt) {
    const input = this.input;
    input.forward = (this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0) + this.touch.forward;
    input.strafe = (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0) + this.touch.strafe;
    input.sprint = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    input.jump = this.keys.has('Space');
    input.fire = this.firing || this.touch.fire;
    input.ads = this.ads;
    input.interact = this.interactHeld || this.touch.interact;

    this.player.update(dt, input, this.world.colliders);
    if (this.state !== 'playing') return;

    this.ctx.storm = this.storm.active;
    for (const d of this.enemies) d.update(dt, this.ctx);

    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const b = this.bolts[i];
      b.update(dt, this.ctx);
      if (!b.alive) this.bolts.splice(i, 1);
    }

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.update(dt, this.time, this.player);
      const dx = p.group.position.x - this.player.pos.x;
      const dy = p.group.position.y - (this.player.pos.y + 1.0);
      const dz = p.group.position.z - this.player.pos.z;
      if (dx * dx + dy * dy + dz * dz < 1.6 * 1.6) {
        this.collectPickup(p);
        if (!p.alive) this.pickups.splice(i, 1);
      }
    }

    for (const c of this.crates) c.update(dt);
    for (const n of this.nodes) n.update(dt);

    this.updateStorm(dt);
    this.updateInteraction(dt);
    this.updateExtraction(dt);
    if (this.state !== 'playing') return;

    for (let i = this.respawnQueue.length - 1; i >= 0; i--) {
      const r = this.respawnQueue[i];
      r.t -= dt;
      if (r.t <= 0) {
        this.respawnQueue.splice(i, 1);
        if (this.enemies.filter((e) => e.alive).length < 9) {
          const p = this.randomSpawnPoint();
          this.spawnDrone(p.x, p.z, chance(0.22) ? 'heavy' : 'scout');
        }
      }
    }

    this.effects.update(dt);
    this.world.update(dt, this.time, this.storm.active, this.player.pos);

    this.ui.updateMarkers(this.camera, true);
    this.updateHUD();
  }

  updateDeath(dt) {
    this.world.update(dt, this.time, this.storm.active, null);
    this.effects.update(dt);
    for (const d of this.enemies) d.update(dt, this.ctx);
    this.ui.updateMarkers(this.camera, false);

    const ground = terrainHeight(this.player.pos.x, this.player.pos.z);
    this.camera.position.y = Math.max(ground + 0.35, this.camera.position.y - dt * 1.6);
    this.camera.rotation.z = Math.min(0.5, this.camera.rotation.z + dt * 0.9);
    this.camera.rotation.x = Math.max(-0.5, this.camera.rotation.x - dt * 0.4);
  }

  updateHUD() {
    const p = this.player;
    this.ui.setVitals(p.health, p.stamina);
    this.ui.setAmmo(p.mag, p.reserve, p.reloadT > 0);
    this.ui.setCargo(this.run.scrap, this.run.cores, this.run.mass, CARGO_MAX);
    this.ui.setCrosshair(clamp(p.currentSpread() * 22, 0, 1));
    this.ui.setStorm(this.storm.active, this.storm.timer, !this.storm.active && this.storm.timer < 12);

    if (this.extraction.active) {
      this.ui.setObjective(`HOLD THE PAD // ASCENT ${Math.ceil(this.extraction.timer)}S`);
    } else if (this.run.cores > 0) {
      this.ui.setObjective(`CARGO: ${this.run.cores} CORE${this.run.cores > 1 ? 'S' : ''} // GET TO LIFT 04`);
    } else {
      this.ui.setObjective('REACH LIFT 04 // EXTRACT YOUR CARGO');
    }
  }

  /* ---------------------------------------------------------------- */
  /* Storm                                                             */
  /* ---------------------------------------------------------------- */
  updateStorm(dt) {
    const s = this.storm;
    s.timer -= dt;

    if (!s.active && s.timer <= 0) {
      s.active = true;
      s.timer = STORM_ACTIVE;
      this.audio.setStorm(true);
      this.ui.toast('ETHER-STORM INBOUND // VISIBILITY FALLING', 'danger');
      this.ui.toast('DRONES AGITATED', 'danger');
    } else if (s.active && s.timer <= 0) {
      s.active = false;
      s.timer = STORM_CLEAR;
      this.audio.setStorm(false);
      this.ui.toast('STORM CLEARING // ATMOSPHERE STABLE', 'cyan');
    }
  }

  /* ---------------------------------------------------------------- */
  /* Combat                                                            */
  /* ---------------------------------------------------------------- */
  fireHitscan(origin, dir) {
    let enemyHit = null;
    let enemyDist = Infinity;

    for (const e of this.enemies) {
      if (!e.alive) continue;
      const oc = this.tmpV.copy(e.group.position).sub(origin);
      const t = oc.dot(dir);
      if (t < 0 || t > 300) continue;
      const d2 = oc.lengthSq() - t * t;
      if (d2 <= e.hitRadius * e.hitRadius && t < enemyDist) {
        enemyDist = t;
        enemyHit = e;
      }
    }

    this.raycaster.set(origin, dir);
    this.raycaster.far = Math.min(300, enemyDist);
    const hits = this.raycaster.intersectObjects(this.world.shootables, false);

    if (hits.length) {
      const h = hits[0];
      this.effects.impact(h.point, 0xffc27a, 4);
      this.effects.tracer(origin, h.point);
      return;
    }

    if (enemyHit) {
      const point = origin.clone().addScaledVector(dir, enemyDist);
      const killed = enemyHit.hit(30, this.ctx, point);
      this.effects.tracer(origin, point, 0xfff2cf);
      this.ui.hitmarker(killed);
      this.audio.hit(killed);
      return;
    }

    const end = origin.clone().addScaledVector(dir, 150);
    this.effects.tracer(origin, end);
  }

  spawnBolt(origin, dir, opts) {
    this.bolts.push(new Bolt(this.scene, origin, dir, opts));
  }

  onPlayerShot() {
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (e.group.position.distanceToSquared(this.player.pos) < 70 * 70) {
        e.state = 'engage';
        e.alert = 1;
      }
    }
  }

  onPlayerDamaged(amount) {
    this.ui.damage();
    this.audio.damage();
    if (this.player.health > 0 && this.player.health < 32 && this.time - this.lastFullToast > 8) {
      this.lastFullToast = this.time;
      this.ui.toast('INTEGRITY CRITICAL // BREAK CONTACT', 'danger');
    }
  }

  onPlayerDeath() {
    if (this.state !== 'playing') return;
    this.state = 'dead';
    this.deathT = 0;
    this.audio.death();
    this.audio.setStorm(false);
    this.ui.toast('SIGNAL LOST', 'danger');
    this.ui.setExtraction(false);

    // gear spills into the world (flavour for the extraction pool)
    this.dropCargoAt(this.player.pos);

    this.wallet.runs++;
    this.wallet.deaths++;
    this.saveWallet();

    if (document.pointerLockElement) document.exitPointerLock();
    this.locked = false;

    setTimeout(() => {
      if (this.state !== 'dead') return;
      this.ui.showEnd({
        success: false,
        scrap: 0,
        cores: 0,
        aether: 0,
        total: 0,
      });
      this.ui.setObjective('RUN TERMINATED');
    }, 1200);
  }

  onDroneKilled(drone) {
    this.run.kills++;
    this.audio.hit(true);
    const heavy = drone.heavy;
    this.ui.toast(heavy ? 'HEAVY DRONE DESTROYED' : 'SCOUT DRONE DESTROYED', 'cyan');

    const base = drone.group.position;
    const drops = heavy ? randInt(2, 3) : randInt(1, 2);
    for (let i = 0; i < drops; i++) {
      this.spawnPickup('scrap', new THREE.Vector3(
        base.x + rand(-1.2, 1.2),
        terrainHeight(base.x, base.z) + 0.4,
        base.z + rand(-1.2, 1.2)
      ));
    }
    if (chance(heavy ? 0.85 : 0.16)) {
      this.spawnPickup('core', new THREE.Vector3(
        base.x + rand(-0.6, 0.6),
        terrainHeight(base.x, base.z) + 0.4,
        base.z + rand(-0.6, 0.6)
      ));
    }
    this.scheduleRespawn();
  }

  dropCargoAt(pos) {
    const y = terrainHeight(pos.x, pos.z) + 0.4;
    const scraps = Math.min(5, Math.ceil(this.run.scrap / 12));
    for (let i = 0; i < scraps; i++) {
      this.spawnPickup('scrap', new THREE.Vector3(pos.x + rand(-2, 2), y, pos.z + rand(-2, 2)));
    }
    for (let i = 0; i < Math.min(4, this.run.cores); i++) {
      this.spawnPickup('core', new THREE.Vector3(pos.x + rand(-2.4, 2.4), y, pos.z + rand(-2.4, 2.4)));
    }
  }

  spawnPickup(type, pos) {
    const p = new Pickup(this.scene, type, pos);
    if (type === 'scrap') p.value = randInt(9, 18);
    this.pickups.push(p);
    return p;
  }

  collectPickup(p) {
    if (p.type === 'stim') {
      this.player.heal(35);
      this.audio.heal();
      this.ui.toast('+35 INTEGRITY', 'cyan');
      p.dispose();
      return;
    }

    const def = LOOT[p.type];
    if (this.run.mass + def.mass > CARGO_MAX) {
      if (this.time - this.lastFullToast > 4) {
        this.lastFullToast = this.time;
        this.ui.toast('CARGO FULL // EXTRACT OR DROP', 'danger');
      }
      return;
    }

    if (p.type === 'scrap') {
      const value = p.value || def.value;
      this.run.scrap += value;
      this.run.mass += def.mass;
      this.audio.pickup();
      this.ui.toast(`+${value} SCRAP`);
    } else {
      this.run.cores++;
      this.run.mass += def.mass;
      this.audio.core();
      this.ui.toast('+1 ETHER-CORE', 'cyan');
    }
    p.dispose();
  }

  /* ---------------------------------------------------------------- */
  /* Interaction & extraction                                          */
  /* ---------------------------------------------------------------- */
  findInteractable() {
    const p = this.player.pos;
    const liftDist = Math.hypot(p.x - ELEVATOR.x, p.z - ELEVATOR.z);
    if (liftDist < 8 && !this.extraction.active) {
      return { id: 'lift', label: 'CALL LIFT 04', hold: 2.4, kind: 'lift' };
    }

    let best = null;
    let bestD = Infinity;
    for (const c of this.crates) {
      if (c.opened) continue;
      const d = Math.hypot(p.x - c.x, p.z - c.z);
      if (d < 2.8 && d < bestD) {
        bestD = d;
        best = { id: 'crate' + this.crates.indexOf(c), label: 'CRACK SUPPLY CACHE', hold: 0.9, kind: 'crate', crate: c };
      }
    }
    for (const n of this.nodes) {
      if (!n.alive) continue;
      const d = Math.hypot(p.x - n.x, p.z - n.z);
      if (d < 3.4 && d < bestD) {
        bestD = d;
        best = { id: 'node' + this.nodes.indexOf(n), label: 'MINE ETHER-CORE', hold: 1.5, kind: 'node', node: n };
      }
    }
    return best;
  }

  updateInteraction(dt) {
    const target = this.findInteractable();
    this.interactTarget = target;
    const input = this.input;

    if (!target) {
      this.hold.id = null;
      this.hold.t = 0;
      this.ui.setPrompt(null);
      return;
    }

    if (input.interact) {
      if (this.hold.id !== target.id) {
        this.hold.id = target.id;
        this.hold.t = 0;
      }
      this.hold.t += dt;
      const progress = this.hold.t / target.hold;
      this.ui.setPrompt(target.label, progress);
      if (progress >= 1) {
        this.completeInteract(target);
        this.hold.id = null;
        this.hold.t = 0;
      }
    } else {
      this.hold.id = null;
      this.hold.t = 0;
      this.ui.setPrompt(target.label, 0);
    }
  }

  completeInteract(target) {
    if (target.kind === 'lift') {
      this.startExtraction();
      return;
    }

    if (target.kind === 'crate') {
      const crate = target.crate;
      if (crate.opened) return;
      crate.opened = true;
      this.audio.pickup();
      this.ui.toast('CACHE CRACKED', 'cyan');

      const y = crate.y + 0.9;
      const count = randInt(2, 3);
      for (let i = 0; i < count; i++) {
        this.spawnPickup('scrap', new THREE.Vector3(crate.x + rand(-0.6, 0.6), y + 0.3, crate.z + rand(-0.6, 0.6)));
      }
      if (chance(0.45)) {
        this.spawnPickup('core', new THREE.Vector3(crate.x + rand(-0.4, 0.4), y + 0.4, crate.z + rand(-0.4, 0.4)));
      }
      if (chance(0.3)) {
        this.spawnPickup('stim', new THREE.Vector3(crate.x + rand(-0.5, 0.5), y + 0.4, crate.z + rand(-0.5, 0.5)));
      }
      return;
    }

    if (target.kind === 'node') {
      const node = target.node;
      if (!node.alive) return;
      node.deplete();
      this.spawnPickup('core', new THREE.Vector3(node.x + rand(-0.5, 0.5), node.y + 0.7, node.z + rand(-0.5, 0.5)));
      this.effects.spark(new THREE.Vector3(node.x, node.y + 1, node.z), 0x79f2ff, 10);
      this.audio.core();
      this.ui.toast('CORE EXTRACTED // +25 $AETHER ON ASCENT', 'cyan');
    }
  }

  startExtraction() {
    if (this.extraction.active) return;
    this.extraction = { active: true, timer: EXTRACT_TIME, total: EXTRACT_TIME, tick: 0 };
    this.world.lift.called = true;
    this.audio.extractionCall();
    this.ui.toast('LIFT 04 CALLED // HOLD THE PAD', 'cyan');
    this.ui.setObjective('HOLD THE PAD // ASCENT SEQUENCE');
  }

  updateExtraction(dt) {
    const ex = this.extraction;
    if (!ex.active) {
      this.ui.setExtraction(false);
      return;
    }

    const dist = Math.hypot(
      this.player.pos.x - ELEVATOR.x,
      this.player.pos.z - ELEVATOR.z
    );

    if (dist < 16) {
      ex.timer -= dt;
      ex.tick += dt;
      if (ex.tick >= 1) {
        ex.tick = 0;
        this.audio.extractionTick(ex.timer < 4);
      }
    } else if (this.time - (this.lastAwayToast || 0) > 4) {
      this.lastAwayToast = this.time;
      this.ui.toast('RETURN TO LIFT 04 // ASCENT PAUSED', 'danger');
    }

    this.ui.setExtraction(true, ex.timer, ex.total);

    if (ex.timer <= 0) this.completeExtraction();
  }

  completeExtraction() {
    if (this.state !== 'playing') return;
    this.state = 'extracted';
    this.extraction.active = false;
    this.world.lift.called = false;
    this.audio.success();
    this.audio.setStorm(false);
    this.ui.setExtraction(false);
    this.ui.setPrompt(null);

    const aether = this.run.cores * CORE_VALUE;
    this.wallet.scrap += this.run.scrap;
    this.wallet.aether += aether;
    this.wallet.runs++;
    this.wallet.best = Math.max(this.wallet.best, aether);
    this.saveWallet();

    if (document.pointerLockElement) document.exitPointerLock();
    this.locked = false;

    this.ui.showEnd({
      success: true,
      scrap: this.run.scrap,
      cores: this.run.cores,
      aether,
      total: aether,
    });
    this.ui.setObjective('EXTRACTION COMPLETE // CARGO BANKED');
  }

  /* ---------------------------------------------------------------- */
  /* Pause                                                             */
  /* ---------------------------------------------------------------- */
  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.ui.showPause(true);
    this.audio.setStorm(false);
    if (document.pointerLockElement) document.exitPointerLock();
    this.locked = false;
    this.firing = false;
    this.ads = false;
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.ui.showPause(false);
    this.audio.setStorm(this.storm.active);
    this.requestLock();
  }

  abandon() {
    if (this.state !== 'playing' && this.state !== 'paused') return;
    this.ui.showPause(false);
    this.state = 'dead';
    this.deathT = 0;
    this.ui.setExtraction(false);
    this.dropCargoAt(this.player.pos);
    this.wallet.runs++;
    this.saveWallet();
    this.audio.setStorm(false);
    if (document.pointerLockElement) document.exitPointerLock();
    this.locked = false;
    this.ui.showEnd({ success: false, abandoned: true, scrap: 0, cores: 0, aether: 0, total: 0 });
    this.ui.setObjective('RUN ABANDONED');
  }
}
