// Core simulation: mission flow, player, AI, ballistics, combat and persistence.

import {
  clamp, damp, lerp, dist, angleLerp, angleWrap, rand, randInt, pick,
  loadSave, writeSave, resetSave,
} from './util.js';
import {
  MISSIONS, WEAPONS, SIDEARM, ENEMY_TYPES, PALETTES, UPGRADES,
  playerMods, resolveWeapon,
} from './content.js';
import { buildMap, WORLD_W, WORLD_H } from './maps.js';
import { AudioEngine } from './audio.js';

const $ = (id) => document.getElementById(id);
const deg = (d) => (d * Math.PI) / 180;

function makeWeaponState(def) {
  return { def, mag: def.mag, reserve: def.reserve, reloading: false, reloadT: 0 };
}

// Segment/circle intersection. Returns the earliest normalised t, or -1.
function segCircle(x1, y1, x2, y2, cx, cy, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const fx = x1 - cx;
  const fy = y1 - cy;
  const a = dx * dx + dy * dy;
  if (a < 1e-9) return fx * fx + fy * fy <= r * r ? 0 : -1;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return -1;
  const sq = Math.sqrt(disc);
  const t1 = (-b - sq) / (2 * a);
  if (t1 >= 0 && t1 <= 1) return t1;
  const t2 = (-b + sq) / (2 * a);
  if (t2 >= 0 && t2 <= 1) return t2;
  if (c <= 0) return 0;
  return -1;
}

export class Game {
  constructor() {
    this.canvas = $('game');
    this.ctx = this.canvas.getContext('2d');
    this.save = loadSave();
    this.audio = new AudioEngine();
    this.audio.volume = this.save.settings.volume;
    this.audio.musicVolume = this.save.settings.music;
    this.state = 'menu';
    this.mode = 'campaign';
    this.time = 0;
    this.worldTime = 0;
    this.lastTime = 0;
    this.isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    this.input = {
      keys: new Set(),
      mouse: { x: 0, y: 0, down: false, type: 'mouse', locked: false },
      sticks: { move: null, aim: null },
      pad: { moveX: 0, moveY: 0, aimX: 0, aimY: 0, fire: false, prev: [] },
      touchFire: false,
    };
    this.wasLocked = false;
    this.mouseFallback = false;
    this.lockTimer = 0;
    this.menuMap = null;
    this.menuMission = null;
    this.menuKey = '';
    this.mission = null;
    this.missionIndex = -1;
    this.map = null;
    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.grenades = [];
    this.particles = [];
    this.pickups = [];
    this.texts = [];
    this.chain = [];
    this.decals = null;
    this.extractionActive = false;
    this.skirmish = false;
    this.wave = 1;
    this.wavePending = false;
    this.waveTimer = 0;
    this.run = null;
    this.deployTimer = 0;
    this.deployDuration = 0.9;
    this.damageFlash = 0;
    this.hitMarker = 0;
    this.hitMarkerHead = false;
    this.lastAlertSound = -99;
    this.panelKind = null;
    this.pendingResults = null;
    this.hintsRun = new Set();
    this.aimPoint = { x: 0, y: 0 };
    this.loopBound = this.loop.bind(this);
    this.bindGlobalInput();
    if (this.isTouch) document.body.classList.add('touch');
  }

  init() {
    this.renderer.resize();
    this.ui.init();
    this.refreshMenu();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 200));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') this.pause();
    });
    window.addEventListener('blur', () => {
      this.input.keys.clear();
      this.input.mouse.down = false;
    });
    if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !['localhost', '127.0.0.1'].includes(location.hostname)) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
    this.lastTime = performance.now();
    requestAnimationFrame(this.loopBound);
  }

  resize() {
    this.renderer.resize();
    this.ui.updateRotateHint();
  }

  ensureAudio() {
    this.audio.init();
    this.audio.setVolumes(this.save.settings.volume, this.save.settings.music);
    if (this.state === 'menu') this.audio.startAmbient();
    this.audio.setMusicIntensity(this.state === 'playing' ? 0.8 : 0.3);
  }

  loop(now) {
    const raw = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const dt = clamp(raw, 0, 0.05);
    this.time += dt;
    if (this.state === 'playing') {
      this.update(dt);
    } else if (this.state === 'deploy') {
      this.deployTimer -= dt;
      this.ui.setDeployProgress(1 - Math.max(0, this.deployTimer) / this.deployDuration);
      if (this.deployTimer <= 0) this.beginPlay();
    } else if (this.state === 'menu') {
      this.updateMenu(dt);
    }
    this.renderer.updateCamera(dt);
    if (this.state === 'menu') this.renderer.renderMenu();
    else this.renderer.renderGame();
    if (this.state === 'menu') this.renderer.drawCardRadar();
    this.ui.updateHUD();
    requestAnimationFrame(this.loopBound);
  }

  updateMenu(dt) {
    if (this.menuMap && this.audio.ambientNodes) this.audio.setMusicIntensity(0.25);
  }

  // ------------------------------------------------------------- menu / save
  allComplete() {
    return MISSIONS.every((m) => this.save.completed.includes(m.id));
  }

  nextMissionIndex() {
    if (this.allComplete()) return 5;
    return clamp(this.save.unlocked, 0, 5);
  }

  skirmishPreview() {
    return {
      name: 'HOT ZONE', loc: 'ROTATION // ADAPTIVE', palette: 'urban', seed: 90210,
      threat: 4, enemies: { grunt: 6, scout: 2, marksman: 1 }, intel: 2, par: 0, reward: 0,
      brief: 'Endless assault. Hold the compound, stack the waves, and extract before the operator goes down.',
      tip: 'Ammo and armor drop from every wave. Keep moving.',
    };
  }

  refreshMenu() {
    const allDone = this.allComplete();
    const def = allDone ? this.skirmishPreview() : MISSIONS[this.nextMissionIndex()];
    const key = allDone ? 'skirmish' : def.id;
    if (this.menuKey !== key) {
      this.menuKey = key;
      this.menuMission = def;
      this.menuMap = buildMap({ ...def, seed: allDone ? 90210 : def.seed });
    }
    this.ui.refreshMenu();
  }

  persist() {
    writeSave(this.save);
  }

  addCredits(n) {
    this.save.credits = Math.max(0, Math.round(this.save.credits + n));
    this.persist();
    this.ui.refreshMenu();
  }

  setSetting(key, value) {
    this.save.settings[key] = value;
    this.persist();
    if (key === 'volume') this.audio.setVolumes(value, this.save.settings.music);
    if (key === 'music') this.audio.setVolumes(this.save.settings.volume, value);
  }

  resetProgress() {
    resetSave();
    this.save = loadSave();
    this.menuKey = '';
    this.refreshMenu();
    this.audio.ui();
  }

  buyWeapon(id) {
    const w = WEAPONS[id];
    if (!w || this.save.ownedWeapons.includes(id)) return false;
    if (this.save.credits < w.price) return false;
    this.save.credits -= w.price;
    this.save.ownedWeapons.push(id);
    this.save.loadout.primary = id;
    this.persist();
    this.audio.ui(true);
    this.ui.refreshMenu();
    return true;
  }

  equipWeapon(id) {
    if (!this.save.ownedWeapons.includes(id)) return false;
    this.save.loadout.primary = id;
    this.persist();
    this.audio.ui(true);
    return true;
  }

  buyUpgrade(id) {
    const up = UPGRADES.find((u) => u.id === id);
    if (!up || this.save.upgrades.includes(id)) return false;
    if (this.save.credits < up.price) return false;
    this.save.credits -= up.price;
    this.save.upgrades.push(id);
    this.persist();
    this.audio.ui(true);
    this.ui.refreshMenu();
    return true;
  }

  // --------------------------------------------------------------- mission flow
  playNext() {
    this.ensureAudio();
    if (this.allComplete()) this.startSkirmish();
    else this.startMission(this.nextMissionIndex());
  }

  startMission(index) {
    this.ensureAudio();
    const def = MISSIONS[clamp(index, 0, MISSIONS.length - 1)];
    if (!def) return;
    this.skirmish = false;
    this.setupMission(def, clamp(index, 0, 5), 'campaign');
  }

  startSkirmish() {
    this.ensureAudio();
    const palettes = Object.keys(PALETTES);
    const def = {
      name: 'HOT ZONE', loc: 'ROTATION // ADAPTIVE', palette: pick(palettes),
      seed: 1000 + Math.floor(Math.random() * 900000), threat: 3,
      enemies: { grunt: 4, scout: 1 }, intel: 0, par: 0, reward: 0,
      brief: 'Endless assault. Hold the compound and stack the waves.',
      tip: 'Waves get heavier. Pick up ammo and armor between them.',
    };
    this.skirmish = true;
    this.wave = 1;
    this.setupMission(def, -1, 'skirmish');
  }

  setupMission(def, index, mode) {
    this.mode = mode;
    this.mission = def;
    this.missionIndex = index;
    this.skirmish = mode === 'skirmish';
    this.wave = 1;
    this.wavePending = false;
    this.waveTimer = 0;
    this.chain = [];
    this.state = 'deploy';
    this.deployTimer = this.deployDuration;
    this.extractionActive = false;
    this.bullets = [];
    this.grenades = [];
    this.particles = [];
    this.pickups = [];
    this.texts = [];
    this.enemies = [];
    this.hintsRun = new Set();
    this.map = buildMap(def);
    this.createDecals();
    this.player = this.createPlayer();
    this.enemies = this.map.enemySpawns.map((s) => this.createEnemy(s.type, s.x, s.y, s.room));
    this.run = {
      shots: 0, hits: 0, kills: 0, headshots: 0, intel: 0,
      elapsed: 0, damage: 0, start: this.time, mission: def, index, skirmish: this.skirmish,
    };
    this.renderer.resetCamera();
    this.ui.enterMission(def, this.skirmish);
    this.ui.showDeploy(def, this.skirmish);
    this.ui.updateHUD();
    this.audio.startAmbient();
    this.audio.setMusicIntensity(0.75);
  }

  beginPlay() {
    this.state = 'playing';
    this.ui.hideDeploy();
    this.ui.showToast(this.skirmish ? 'SURVIVE THE ASSAULT' : 'MISSION ACTIVE — ELIMINATE HOSTILES', 'good', 2400);
    this.ui.showTip(this.isTouch
      ? 'LEFT STICK MOVE  //  RIGHT STICK LOOK  //  HOLD FIRE TO SHOOT  //  ACTIONS BELOW'
      : 'WASD MOVE  //  MOUSE LOOK  //  LMB FIRE  //  R RELOAD  //  G FRAG  //  Q FOCUS', 8000);
  }

  restartMission() {
    this.ui.closePanel(true);
    if (this.skirmish) this.startSkirmish();
    else this.startMission(this.missionIndex);
  }

  abortMission() {
    this.ui.closePanel(true);
    this.returnToMenu();
  }

  returnToMenu() {
    this.state = 'menu';
    this.input.touchFire = false;
    this.input.mouse.down = false;
    if (document.pointerLockElement) document.exitPointerLock?.();
    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.grenades = [];
    this.particles = [];
    this.pickups = [];
    this.texts = [];
    this.map = null;
    this.mission = null;
    this.run = null;
    this.extractionActive = false;
    document.body.classList.remove('playing');
    this.ui.exitMission();
    this.menuKey = '';
    this.refreshMenu();
    this.audio.startAmbient();
    this.audio.setMusicIntensity(0.3);
  }

  continueAfterResults() {
    this.ui.closePanel(true);
    if (this.pendingResults?.skirmish) {
      this.returnToMenu();
      return;
    }
    if (this.pendingResults?.success && this.missionIndex >= 0 && this.missionIndex < 5 && this.save.unlocked > this.missionIndex) {
      this.startMission(this.missionIndex + 1);
    } else {
      this.returnToMenu();
    }
  }

  // ------------------------------------------------------------------- player
  createPlayer() {
    const mods = playerMods(this.save);
    const primary = resolveWeapon(this.save.loadout.primary, this.save);
    const p = {
      x: this.map.playerSpawn.x, y: this.map.playerSpawn.y, r: 13,
      angle: -Math.PI / 2, pitch: 0, lookT: 0, vx: 0, vy: 0,
      hp: 100, maxHp: 100, armor: mods.maxArmor, maxArmor: mods.maxArmor,
      speed: 205 * mods.speed, weapons: [makeWeaponState(primary), makeWeaponState({ ...SIDEARM })],
      slot: 0, swapT: 0, fireCd: 0, heat: 0, walk: 0,
      grenades: mods.grenades, maxGrenades: mods.grenades,
      focusActive: 0, focusCd: 0, focusFull: mods.focusCooldown,
      dashCd: 0, dashT: 0, dashX: 0, dashY: 0, invuln: 0,
      muzzleT: 0, muzzleAngle: 0, recoilKick: 0, reloadAuto: false,
      dead: false,
    };
    return p;
  }

  createEnemy(type, x, y, room) {
    const def = ENEMY_TYPES[type] || ENEMY_TYPES.grunt;
    const mag = type === 'marksman' ? 6 : type === 'heavy' ? 60 : type === 'scout' ? 30 : 24;
    return {
      type, def, x, y, r: def.radius, hp: def.hp * (1 + (this.mission?.threat - 1 || 0) * 0.04),
      maxHp: def.hp * (1 + (this.mission?.threat - 1 || 0) * 0.04),
      angle: rand(0, Math.PI * 2), vx: 0, vy: 0, state: 'patrol',
      alert: 0, alertFlash: 0, hitFlash: 0, dead: false,
      homeX: x, homeY: y, room: room ?? 0, lastKnown: null, lastSeen: -99,
      path: [], pathT: 0, pathTarget: null, searchT: 0,
      aimT: 0, burstLeft: 0, shotT: 0, fireCd: rand(0.3, 1.4), reloadT: 0,
      mag, maxMag: mag, strafe: Math.random() < 0.5 ? 1 : -1, strafeT: rand(0.6, 1.8),
      muzzleT: 0, muzzleAngle: 0, canSee: false, walk: rand(0, 6), id: Math.random().toString(36).slice(2),
      spawnFx: 0.6,
    };
  }

  createDecals() {
    const c = document.createElement('canvas');
    c.width = WORLD_W;
    c.height = WORLD_H;
    this.decals = c;
    this.decalCtx = c.getContext('2d');
  }

  markDecal(type, x, y, angle = 0, scale = 1) {
    const ctx = this.decalCtx;
    if (!ctx) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    if (type === 'blood') {
      ctx.fillStyle = `rgba(${Math.round(90 + Math.random() * 40)},${Math.round(10 + Math.random() * 12)},${Math.round(14 + Math.random() * 10)},0.38)`;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(rand(-8, 8), rand(-8, 8), rand(4, 13) * scale, rand(2, 7) * scale, rand(0, 3), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'corpse') {
      ctx.fillStyle = 'rgba(76,12,16,0.34)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 26 * scale, 18 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(24,29,34,0.85)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16 * scale, 9 * scale, angle, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(48,55,62,0.9)';
      ctx.beginPath();
      ctx.arc(-10 * scale, 0, 6 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(39,45,52,0.8)';
      for (let i = 0; i < 2; i++) {
        ctx.save();
        ctx.rotate(angle + (i ? 1.1 : -1.1));
        ctx.fillRect(6 * scale, -3 * scale, 15 * scale, 5 * scale);
        ctx.restore();
      }
      ctx.fillStyle = 'rgba(120,15,20,0.28)';
      ctx.beginPath();
      ctx.ellipse(rand(-10, 10), rand(-8, 8), 5 * scale, 3 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'hole') {
      ctx.fillStyle = 'rgba(4,6,8,0.65)';
      ctx.beginPath();
      ctx.arc(0, 0, rand(1.5, 2.6), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(190,200,210,0.16)';
      ctx.beginPath();
      ctx.arc(-0.7, -0.7, 1.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'scorch') {
      ctx.fillStyle = 'rgba(8,7,6,0.36)';
      ctx.beginPath();
      ctx.arc(0, 0, 34 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(16,12,8,0.22)';
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.ellipse(rand(-28, 28) * scale, rand(-28, 28) * scale, rand(4, 14) * scale, rand(3, 9) * scale, rand(0, 3), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // -------------------------------------------------------------------- input
  bindGlobalInput() {
    window.addEventListener('keydown', (e) => {
      if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const code = e.code;
      if (code === 'Escape') {
        e.preventDefault();
        if (this.ui?.panelKind) {
          if (!['results', 'failed'].includes(this.ui.panelKind)) this.ui.closePanel();
        } else if (this.state === 'playing') this.pause();
        else if (this.state === 'paused') this.resume();
        return;
      }
      if (this.state !== 'playing') return;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(code)) e.preventDefault();
      this.input.keys.add(code);
      if (code === 'KeyR') this.startReload();
      if (code === 'KeyG') this.throwGrenade();
      if (code === 'KeyQ') this.activateFocus();
      if (code === 'Space') this.dash();
      if (code === 'Digit1' || code === 'Digit2') this.swapWeapon();
    });
    window.addEventListener('keyup', (e) => this.input.keys.delete(e.code));
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', (e) => this.onPointerUp(e));
    window.addEventListener('pointercancel', (e) => this.onPointerUp(e));
    document.addEventListener('pointerlockchange', () => {
      const locked = document.pointerLockElement === this.canvas;
      this.input.mouse.locked = locked;
      if (locked) {
        this.wasLocked = true;
        this.mouseFallback = false;
      } else if (this.wasLocked) {
        this.wasLocked = false;
        if (this.state === 'playing' && !this.isTouch) this.pause();
      }
    });
    const fireBtn = $('btn-fire');
    if (fireBtn) {
      const hold = (on) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.ensureAudio();
        this.input.touchFire = on;
        if (on) fireBtn.classList.add('held');
        else fireBtn.classList.remove('held');
      };
      fireBtn.addEventListener('pointerdown', (e) => {
        hold(true)(e);
        fireBtn.setPointerCapture?.(e.pointerId);
      });
      fireBtn.addEventListener('pointerup', hold(false));
      fireBtn.addEventListener('pointercancel', hold(false));
      fireBtn.addEventListener('lostpointercapture', hold(false));
    }
    document.querySelectorAll('#hud [data-action]').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.ensureAudio();
        this.performAction(btn.dataset.action);
      });
    });
    window.addEventListener('gamepadconnected', () => this.ui?.showToast('CONTROLLER LINKED', 'good', 1800));
    document.addEventListener('gesturestart', (e) => e.preventDefault());
  }

  onPointerDown(e) {
    this.ensureAudio();
    if (this.state !== 'playing') return;
    if (e.pointerType === 'mouse') {
      this.input.mouse.type = 'mouse';
      if (e.button === 0 && !this.isTouch && !this.input.mouse.locked && !this.mouseFallback) {
        this.requestLock();
        return;
      }
      this.input.mouse.down = e.button === 0;
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const side = x < this.renderer.view.w * 0.52 ? 'move' : 'aim';
    const stick = {
      id: e.pointerId, side, baseX: e.clientX, baseY: e.clientY,
      dx: 0, dy: 0, mag: 0, active: true, start: performance.now(),
    };
    this.input.sticks[side] = stick;
    this.ui.showJoystick(stick, side);
    this.canvas.setPointerCapture?.(e.pointerId);
  }

  requestLock() {
    if (this.isTouch || document.pointerLockElement === this.canvas) return;
    try {
      const result = this.canvas.requestPointerLock?.();
      if (result && typeof result.catch === 'function') {
        result.catch(() => { this.mouseFallback = true; });
      }
    } catch {
      this.mouseFallback = true;
    }
    // Pointer lock is a progressive enhancement; drag-look still works.
    clearTimeout(this.lockTimer);
    this.lockTimer = setTimeout(() => {
      if (!this.input.mouse.locked) this.mouseFallback = true;
    }, 650);
  }

  lookBy(dx, dy) {
    const p = this.player;
    if (!p || this.state !== 'playing') return;
    const sens = 0.0021 * (0.45 + (this.save.settings.sensitivity ?? 0.55) * 1.7);
    p.angle = angleWrap(p.angle + dx * sens);
    p.pitch = clamp(p.pitch - dy * sens * 0.8, -0.62, 0.62);
    p.lookT = 0.6;
  }

  updateMouse(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.input.mouse.x = e.clientX - rect.left;
    this.input.mouse.y = e.clientY - rect.top;
  }

  onPointerMove(e) {
    if (e.pointerType === 'mouse') {
      this.input.mouse.type = 'mouse';
      if (this.input.mouse.locked || (e.buttons & 1) === 1) this.lookBy(e.movementX || 0, e.movementY || 0);
      this.updateMouse(e);
      return;
    }
    for (const side of ['move', 'aim']) {
      const stick = this.input.sticks[side];
      if (!stick || stick.id !== e.pointerId) continue;
      let dx = e.clientX - stick.baseX;
      let dy = e.clientY - stick.baseY;
      const mag = Math.hypot(dx, dy);
      const max = 62;
      if (mag > max) {
        dx = (dx / mag) * max;
        dy = (dy / mag) * max;
      }
      stick.dx = dx;
      stick.dy = dy;
      stick.mag = Math.min(1, Math.hypot(dx, dy) / max);
      this.ui.updateJoystick(stick, side);
    }
  }

  onPointerUp(e) {
    if (e.pointerType === 'mouse') {
      if (e.button === 0) this.input.mouse.down = false;
      return;
    }
    for (const side of ['move', 'aim']) {
      const stick = this.input.sticks[side];
      if (!stick || stick.id !== e.pointerId) continue;
      this.input.sticks[side] = null;
      this.ui.hideJoystick(side);
    }
  }

  performAction(action) {
    if (this.state === 'paused' && action !== 'pause') return;
    if (action === 'pause') return this.togglePause();
    if (this.state !== 'playing') return;
    if (action === 'reload') this.startReload();
    else if (action === 'grenade') this.throwGrenade();
    else if (action === 'dash') this.dash();
    else if (action === 'focus') this.activateFocus();
    else if (action === 'swap') this.swapWeapon();
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    document.body.classList.remove('playing');
    this.input.mouse.down = false;
    this.input.touchFire = false;
    $('btn-fire')?.classList.remove('held');
    this.input.sticks.move = null;
    this.input.sticks.aim = null;
    this.ui.hideJoystick('move');
    this.ui.hideJoystick('aim');
    if (document.pointerLockElement === this.canvas) document.exitPointerLock?.();
    this.ui.openPanel('pause');
  }

  resume() {
    if (this.state !== 'paused') return;
    this.ui.closePanel(true);
    this.state = 'playing';
    document.body.classList.add('playing');
    this.lastTime = performance.now();
    if (!this.isTouch) setTimeout(() => this.requestLock(), 30);
  }

  togglePause() {
    if (this.state === 'playing') this.pause();
    else if (this.state === 'paused') this.resume();
  }

  activeWeapon() {
    return this.player?.weapons[this.player.slot];
  }

  startReload() {
    const p = this.player;
    if (!p || this.state !== 'playing') return;
    const w = this.activeWeapon();
    if (w.reloading || p.swapT > 0 || w.mag >= w.def.mag || w.reserve <= 0) return;
    w.reloading = true;
    w.reloadT = w.def.reload;
    this.audio.reload();
  }

  finishReload(w) {
    const need = w.def.mag - w.mag;
    const take = Math.min(need, w.reserve);
    w.mag += take;
    w.reserve -= take;
    w.reloading = false;
    w.reloadT = 0;
    this.audio.reloadDone();
    if (w.mag < w.def.mag && w.reserve <= 0) this.ui.showTip('NO RESERVE AMMO — SCAVENGE FROM HOSTILES', 2500);
  }

  swapWeapon() {
    const p = this.player;
    if (!p || this.state !== 'playing' || p.swapT > 0) return;
    const w = this.activeWeapon();
    w.reloading = false;
    w.reloadT = 0;
    p.slot = p.slot === 0 ? 1 : 0;
    p.swapT = 0.34;
    p.fireCd = Math.max(p.fireCd, 0.2);
    this.audio.reload();
    this.ui.showTip(this.activeWeapon().def.name, 1100);
  }

  dash() {
    const p = this.player;
    if (!p || p.dashCd > 0 || p.dashT > 0) return;
    const move = this.getMoveInput();
    const aim = this.getAimInput(0.016, true);
    const dx = Math.abs(move.x) > 0.1 || Math.abs(move.y) > 0.1 ? move.x : Math.cos(aim.angle);
    const dy = Math.abs(move.x) > 0.1 || Math.abs(move.y) > 0.1 ? move.y : Math.sin(aim.angle);
    const len = Math.hypot(dx, dy) || 1;
    p.dashX = dx / len;
    p.dashY = dy / len;
    p.dashT = 0.17;
    p.dashCd = 2.4;
    p.invuln = 0.22;
    this.audio.dash();
    this.renderer.shake(1.5);
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        type: 'smoke', x: p.x + rand(-8, 8), y: p.y + rand(-8, 8),
        vx: -p.dashX * rand(20, 80), vy: -p.dashY * rand(20, 80),
        life: rand(0.25, 0.5), max: 0.5, size: rand(3, 7), color: '#7dd3fc', alpha: 0.2,
      });
    }
  }

  activateFocus() {
    const p = this.player;
    if (!p || p.focusCd > 0 || p.focusActive > 0) return;
    p.focusActive = 2.6;
    p.focusCd = p.focusFull;
    this.audio.focus(true);
    this.ui.showToast('TACTICAL FOCUS', 'good', 1200);
    this.renderer.shake(1);
  }

  throwGrenade() {
    const p = this.player;
    if (!p || p.grenades <= 0) {
      this.audio.empty();
      this.ui.showTip('NO FRAG GRENADES REMAINING', 1600);
      return;
    }
    const aim = this.getAimInput(0.016, true);
    p.grenades--;
    const speed = 520;
    this.grenades.push({
      x: p.x + Math.cos(aim.angle) * 22, y: p.y + Math.sin(aim.angle) * 22,
      vx: Math.cos(aim.angle) * speed + p.vx * 0.35,
      vy: Math.sin(aim.angle) * speed + p.vy * 0.35,
      timer: 1.25, max: 1.25, rot: rand(0, 6), spin: rand(-10, 10),
    });
    this.audio.grenade();
  }

  applyLook(dt) {
    const p = this.player;
    if (!p) return;
    const stick = this.input.sticks.aim;
    const pad = this.input.pad;
    if (stick && stick.active && stick.mag > 0.08) {
      p.angle = angleWrap(p.angle + (stick.dx / 62) * 3.0 * dt);
      p.pitch = clamp(p.pitch - (stick.dy / 62) * 1.7 * dt, -0.62, 0.62);
      p.lookT = 0.6;
    }
    if (Math.hypot(pad.aimX, pad.aimY) > 0.24) {
      p.angle = angleWrap(p.angle + pad.aimX * 2.8 * dt);
      p.pitch = clamp(p.pitch - pad.aimY * 1.6 * dt, -0.62, 0.62);
      p.lookT = 0.6;
    }
  }

  getMoveInput() {
    let forward = 0;
    let strafe = 0;
    const k = this.input.keys;
    if (k.has('KeyW') || k.has('ArrowUp')) forward += 1;
    if (k.has('KeyS') || k.has('ArrowDown')) forward -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) strafe += 1;
    if (k.has('KeyA') || k.has('ArrowLeft')) strafe -= 1;
    const stick = this.input.sticks.move;
    if (stick && stick.active && stick.mag > 0.12) {
      strafe = stick.dx / 62;
      forward = -stick.dy / 62;
    }
    const pad = this.input.pad;
    if (Math.hypot(pad.moveX, pad.moveY) > 0.22) {
      strafe = pad.moveX;
      forward = -pad.moveY;
    }
    const mag = Math.hypot(forward, strafe);
    if (mag > 1) {
      forward /= mag;
      strafe /= mag;
    }
    const p = this.player;
    const angle = p ? p.angle : 0;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // Forward is the view direction; right is 90° clockwise in world space.
    const x = cos * forward - sin * strafe;
    const y = sin * forward + cos * strafe;
    const sprint = k.has('ShiftLeft') || k.has('ShiftRight');
    return { x, y, sprint, moving: mag > 0.1 };
  }

  aimAssistAngle(angle) {
    if (!this.save.settings.aimAssist) return angle;
    let best = null;
    let bestDiff = 0.16;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const d = dist(this.player.x, this.player.y, e.x, e.y);
      if (d > 700) continue;
      const a = Math.atan2(e.y - this.player.y, e.x - this.player.x);
      let diff = Math.atan2(Math.sin(a - angle), Math.cos(a - angle));
      if (Math.abs(diff) < bestDiff) {
        const hit = this.map.raycast(this.player.x, this.player.y, e.x, e.y, d);
        if (hit && hit.dist < d - 8) continue;
        bestDiff = Math.abs(diff);
        best = { angle: a, diff };
      }
    }
    if (!best) return angle;
    const maxPull = 0.075;
    return angle + clamp(best.diff, -maxPull, maxPull);
  }

  getAimInput() {
    const p = this.player;
    if (!p) return { angle: 0, firing: false, mode: 'mouse' };
    let firing = false;
    let mode = 'mouse';
    if (this.input.mouse.down) {
      firing = true;
      mode = 'mouse';
    }
    if (this.input.touchFire) {
      firing = true;
      mode = 'touch';
    }
    if (this.input.pad.fire) {
      firing = true;
      mode = 'pad';
    }
    this.aimPoint.x = p.x + Math.cos(p.angle) * 280;
    this.aimPoint.y = p.y + Math.sin(p.angle) * 280;
    return { angle: p.angle, firing, mode };
  }

  pollGamepad() {
    if (!navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    const gp = Array.from(pads || []).find((p) => p && p.connected);
    this.input.pad.fire = false;
    if (!gp) {
      this.input.pad.moveX = 0;
      this.input.pad.moveY = 0;
      this.input.pad.aimX = 0;
      this.input.pad.aimY = 0;
      return;
    }
    const dead = (v) => (Math.abs(v) > 0.18 ? v : 0);
    this.input.pad.moveX = dead(gp.axes[0] || 0);
    this.input.pad.moveY = dead(gp.axes[1] || 0);
    this.input.pad.aimX = dead(gp.axes[2] || 0);
    this.input.pad.aimY = dead(gp.axes[3] || 0);
    this.input.pad.fire = Boolean(gp.buttons[7]?.pressed || gp.buttons[5]?.pressed);
    const pressed = (i) => Boolean(gp.buttons[i]?.pressed);
    const edge = (i) => pressed(i) && !this.input.pad.prev[i];
    if (edge(2)) this.startReload();
    if (edge(1)) this.throwGrenade();
    if (edge(0)) this.dash();
    if (edge(3)) this.swapWeapon();
    if (edge(6)) this.activateFocus();
    if (edge(9)) this.togglePause();
    this.input.pad.prev = gp.buttons.map((b) => b.pressed);
  }

  // ------------------------------------------------------------------- update
  update(dt) {
    if (!this.player || this.state !== 'playing') return;
    this.pollGamepad();
    const p = this.player;
    const focusScale = p.focusActive > 0 ? 0.42 : 1;
    const wdt = dt * focusScale;
    this.worldTime += wdt;
    this.run.elapsed += wdt;
    p.focusCd = Math.max(0, p.focusCd - dt);
    if (p.focusActive > 0) {
      p.focusActive -= dt;
      if (p.focusActive <= 0) {
        p.focusActive = 0;
        this.audio.focus(false);
      }
    }
    p.dashCd = Math.max(0, p.dashCd - dt);
    p.invuln = Math.max(0, p.invuln - dt);
    p.damageFlash = Math.max(0, (p.damageFlash || 0) - dt);
    this.updatePlayer(wdt, dt);
    if (this.state !== 'playing') return;
    this.updateEnemies(wdt);
    this.updateBullets(wdt);
    this.updateGrenades(wdt);
    this.updateParticles(wdt);
    this.updatePickups(wdt);
    this.updateTexts(wdt);
    this.updateChain(wdt);
    this.checkObjectives(wdt);
    this.damageFlash = Math.max(0, this.damageFlash - dt * 2.4);
    this.hitMarker = Math.max(0, this.hitMarker - dt);
    if (this.wavePending) {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) {
        this.wavePending = false;
        this.spawnWave();
      }
    }
    this.audio.setMusicIntensity(clamp(0.5 + this.aliveCount() * 0.05, 0.4, 1));
  }

  updatePlayer(dt, realDt) {
    const p = this.player;
    if (!p || p.dead) return;
    const w = this.activeWeapon();
    p.swapT = Math.max(0, p.swapT - realDt);
    p.fireCd = Math.max(0, p.fireCd - dt);
    p.recoilKick = damp(p.recoilKick, 0, 16, dt);
    p.heat = damp(p.heat, 0, 3.6, dt);
    p.muzzleT = Math.max(0, p.muzzleT - realDt);
    if (w.reloading) {
      w.reloadT -= dt;
      if (w.reloadT <= 0) this.finishReload(w);
    }
    const move = this.getMoveInput();
    this.applyLook(realDt);
    const aim = this.getAimInput();
    if (aim.firing && (aim.mode === 'pad' || aim.mode === 'touch')) {
      p.angle = angleLerp(p.angle, this.aimAssistAngle(p.angle), 1 - Math.exp(-3.2 * realDt));
    }
    p.lookT = Math.max(0, (p.lookT || 0) - realDt);
    let speed = p.speed * (move.sprint && !this.isTouch ? 1.3 : 1);
    let tx = 0;
    let ty = 0;
    if (p.dashT > 0) {
      p.dashT -= realDt;
      speed = 760;
      tx = p.dashX * speed;
      ty = p.dashY * speed;
      if (Math.random() < 0.6) {
        this.particles.push({
          type: 'smoke', x: p.x, y: p.y, vx: rand(-20, 20), vy: rand(-20, 20),
          life: 0.28, max: 0.28, size: rand(4, 8), color: '#7dd3fc', alpha: 0.16,
        });
      }
    } else if (move.moving) {
      tx = move.x * speed;
      ty = move.y * speed;
      p.walk += dt * speed * 0.055;
      if (Math.random() < 0.09) {
        this.particles.push({
          type: 'smoke', x: p.x + rand(-6, 6), y: p.y + 10, vx: rand(-8, 8), vy: rand(-8, 2),
          life: 0.45, max: 0.45, size: rand(2, 4), color: this.map.palette.dust, alpha: 0.08,
        });
      }
    }
    p.vx = damp(p.vx, tx, p.dashT > 0 ? 30 : 12, dt);
    p.vy = damp(p.vy, ty, p.dashT > 0 ? 30 : 12, dt);
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    const resolved = this.map.resolveCircle(p.x, p.y, p.r);
    p.x = clamp(resolved.x, 20, WORLD_W - 20);
    p.y = clamp(resolved.y, 20, WORLD_H - 20);
    if (resolved.hit && Math.hypot(p.vx, p.vy) > 200) {
      p.vx *= 0.4;
      p.vy *= 0.4;
    }
    if (aim.firing) this.firePlayer();
    if (p.hp <= 0 && !p.dead) this.playerDown();
  }

  firePlayer() {
    const p = this.player;
    if (!p || p.swapT > 0) return;
    const w = this.activeWeapon();
    if (w.reloading || p.fireCd > 0) return;
    if (w.mag <= 0) {
      this.audio.empty();
      if (w.reserve > 0) this.startReload();
      else if (!p.emptyHinted) {
        p.emptyHinted = true;
        this.ui.showTip('OUT OF AMMO — PRESS R OR SCAVENGE', 2200);
      }
      p.fireCd = 0.25;
      return;
    }
    const aim = this.getAimInput(0.016, true);
    const moving = Math.hypot(p.vx, p.vy) > 40;
    let spread = w.def.spread + p.heat * 0.7 + (moving ? 1.1 : 0);
    if (p.focusActive > 0) spread *= 0.72;
    const muzzleX = p.x + Math.cos(p.angle) * 22;
    const muzzleY = p.y + Math.sin(p.angle) * 22;
    const pellets = w.def.pellets || 1;
    for (let i = 0; i < pellets; i++) {
      const a = p.angle + deg((Math.random() - 0.5) * spread * 2);
      const speed = w.def.velocity * rand(0.97, 1.03);
      this.bullets.push({
        x: muzzleX + Math.cos(a) * rand(0, 5), y: muzzleY + Math.sin(a) * rand(0, 5),
        vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, speed,
        dmg: w.def.dmg * rand(0.92, 1.08), pen: w.def.pen,
        owner: 'player', color: w.def.color, life: 2.4, traveled: 0,
        ricochets: 0, tracer: Math.random() < 0.65, angle: a, weaponId: w.def.id,
      });
      this.run.shots++;
    }
    w.mag--;
    p.fireCd = 60 / w.def.rpm;
    p.heat = Math.min(9, p.heat + w.def.recoil * 0.75);
    p.muzzleT = 0.055;
    p.muzzleAngle = p.angle;
    p.recoilKick = 4;
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        type: 'spark', x: muzzleX, y: muzzleY,
        vx: Math.cos(p.angle + rand(-0.35, 0.35)) * rand(100, 300),
        vy: Math.sin(p.angle + rand(-0.35, 0.35)) * rand(100, 300),
        life: rand(0.08, 0.18), max: 0.18, size: rand(1, 2.4), color: '#ffd28a',
      });
    }
    this.particles.push({
      type: 'flash', x: muzzleX, y: muzzleY, vx: 0, vy: 0,
      life: 0.07, max: 0.07, size: 22, color: w.def.color,
    });
    this.particles.push({
      type: 'casing', x: p.x + Math.cos(p.angle + 1.7) * 12, y: p.y + Math.sin(p.angle + 1.7) * 12,
      vx: Math.cos(p.angle + 1.7) * rand(40, 90), vy: Math.sin(p.angle + 1.7) * rand(40, 90),
      life: 1.1, max: 1.1, size: 2.2, rot: rand(0, 6), spin: rand(-14, 14), color: '#e0a94a',
    });
    this.audio.shoot(w.def.sound, { suppressed: Boolean(w.def.suppressed), pan: 0 });
    this.renderer.shake((w.def.recoil + 0.4) * 0.75);
    this.makeNoise(p.x, p.y, w.def.suppressed ? 300 : 760);
    if (w.mag === 0 && w.reserve > 0) this.startReload();
    this.ui.updateHUD();
  }

  // ------------------------------------------------------------------- enemies
  aliveCount() {
    return this.enemies.filter((e) => !e.dead).length;
  }

  enemyCanSee(e) {
    const p = this.player;
    if (!p || p.dead) return false;
    const d = dist(e.x, e.y, p.x, p.y);
    if (d > e.def.vision) return false;
    if (d < 150) return true;
    const a = Math.atan2(p.y - e.y, p.x - e.x);
    const diff = Math.abs(Math.atan2(Math.sin(a - e.angle), Math.cos(a - e.angle)));
    if (diff > e.def.cone) return false;
    return this.map.los(e.x, e.y, p.x, p.y);
  }

  makeNoise(x, y, radius) {
    for (const e of this.enemies) {
      if (e.dead) continue;
      const d = dist(x, y, e.x, e.y);
      if (d > radius) continue;
      e.alert = 1;
      e.alertFlash = Math.max(e.alertFlash, 0.9);
      e.lastKnown = {
        x: x + rand(-90, 90),
        y: y + rand(-90, 90),
      };
      if (e.state === 'patrol') {
        e.state = 'search';
        e.searchT = 0;
        e.pathT = 0;
      }
    }
  }

  alertEnemy(e) {
    if (e.alert < 0.9) {
      e.alert = 1;
      e.alertFlash = 1.1;
      if (this.worldTime - this.lastAlertSound > 2.2) {
        this.lastAlertSound = this.worldTime;
        this.audio.alert();
      }
    }
    e.state = 'engage';
    e.lastKnown = { x: this.player.x, y: this.player.y };
    e.lastSeen = this.worldTime;
  }

  updateEnemies(dt) {
    const p = this.player;
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.hitFlash = Math.max(0, e.hitFlash - dt);
      e.alertFlash = Math.max(0, e.alertFlash - dt);
      e.muzzleT = Math.max(0, e.muzzleT - dt);
      e.spawnFx = Math.max(0, e.spawnFx - dt);
      e.reloadT = Math.max(0, e.reloadT - dt);
      e.alert = Math.max(0, e.alert - dt * 0.03);
      const d = dist(e.x, e.y, p.x, p.y);
      const canSee = this.enemyCanSee(e);
      e.canSee = canSee;
      if (canSee) {
        e.alertFlash = Math.max(e.alertFlash, 0.2);
        if (e.state !== 'engage') this.alertEnemy(e);
        else {
          e.alert = 1;
          e.lastSeen = this.worldTime;
          e.lastKnown = { x: p.x, y: p.y };
        }
      }
      if (e.state === 'patrol') {
        this.updatePatrol(e, dt);
      } else if (e.state === 'engage') {
        if (canSee) this.updateCombatMove(e, d, dt);
        else {
          this.updatePathMove(e, e.lastKnown.x, e.lastKnown.y, e.def.speed * 0.82, dt);
          if (this.worldTime - e.lastSeen > 2.3) {
            e.state = 'search';
            e.searchT = 0;
          }
        }
      } else if (e.state === 'search') {
        e.searchT += dt;
        if (canSee) {
          this.alertEnemy(e);
        } else if (e.lastKnown) {
          this.updatePathMove(e, e.lastKnown.x, e.lastKnown.y, e.def.speed * 0.72, dt);
          const near = dist(e.x, e.y, e.lastKnown.x, e.lastKnown.y) < 50;
          if ((near && e.searchT > 3) || e.searchT > 12) {
            e.state = 'patrol';
            e.path = [];
            e.pathT = 0;
            e.alert = 0.3;
          }
        }
      }
      if (e.state === 'engage' && canSee && d < e.def.range) this.updateEnemyFire(e, d, dt);
      // Resolve against geometry.
      const res = this.map.resolveCircle(e.x, e.y, e.r);
      e.x = res.x;
      e.y = res.y;
    }
    // Soft separation so squads do not stack into one silhouette.
    for (let i = 0; i < this.enemies.length; i++) {
      const a = this.enemies[i];
      if (a.dead) continue;
      for (let j = i + 1; j < this.enemies.length; j++) {
        const b = this.enemies[j];
        if (b.dead) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        const min = a.r + b.r + 4;
        if (d > 0.001 && d < min) {
          const push = (min - d) * 0.5;
          a.x -= (dx / d) * push;
          a.y -= (dy / d) * push;
          b.x += (dx / d) * push;
          b.y += (dy / d) * push;
        }
      }
    }
  }

  updatePatrol(e, dt) {
    e.pathT -= dt;
    if (!e.patrol) {
      e.patrol = { x: e.homeX, y: e.homeY, t: 0 };
    }
    e.patrol.t -= dt;
    if (e.patrol.t <= 0) {
      const room = this.map.rooms[e.room] || this.map.rooms[0];
      const spot = this.map.randomFreeSpot(room, Math.random);
      e.patrol.x = spot ? spot.x : e.homeX;
      e.patrol.y = spot ? spot.y : e.homeY;
      e.patrol.t = rand(3.5, 7);
      e.pathT = 0;
    }
    this.updatePathMove(e, e.patrol.x, e.patrol.y, e.def.speed * 0.42, dt, true);
  }

  updateCombatMove(e, d, dt) {
    const p = this.player;
    const pref = e.type === 'marksman' ? [520, 820] : e.type === 'heavy' ? [200, 340] : e.type === 'scout' ? [100, 230] : [200, 400];
    e.strafeT -= dt;
    if (e.strafeT <= 0) {
      e.strafe *= -1;
      e.strafeT = rand(0.8, 2.2);
    }
    let mx = 0;
    let my = 0;
    if (d > pref[1]) {
      mx = (p.x - e.x) / d;
      my = (p.y - e.y) / d;
    } else if (d < pref[0]) {
      mx = (e.x - p.x) / (d || 1);
      my = (e.y - p.y) / (d || 1);
    } else {
      mx = (-(p.y - e.y) / (d || 1)) * e.strafe;
      my = ((p.x - e.x) / (d || 1)) * e.strafe;
    }
    const speed = e.def.speed * 0.72;
    e.vx = damp(e.vx, mx * speed, 9, dt);
    e.vy = damp(e.vy, my * speed, 9, dt);
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    e.angle = angleLerp(e.angle, Math.atan2(p.y - e.y, p.x - e.x), 1 - Math.exp(-6 * dt));
    e.walk += dt * speed * 0.05;
    e.path = [];
  }

  updatePathMove(e, tx, ty, speed, dt, idle = false) {
    const p = this.player;
    if (!idle && e.canSee && dist(e.x, e.y, tx, ty) < 460) {
      // Clear line: walk directly, which feels far more deliberate than tile paths.
      const a = Math.atan2(ty - e.y, tx - e.x);
      e.vx = damp(e.vx, Math.cos(a) * speed, 8, dt);
      e.vy = damp(e.vy, Math.sin(a) * speed, 8, dt);
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.angle = angleLerp(e.angle, a, 1 - Math.exp(-7 * dt));
      e.walk += dt * speed * 0.05;
      return;
    }
    e.pathT -= dt;
    if (e.pathT <= 0 || !e.pathTarget || dist(e.pathTarget.x, e.pathTarget.y, tx, ty) > 60) {
      e.pathT = 0.55;
      e.pathTarget = { x: tx, y: ty };
      e.path = this.map.findPath(e.x, e.y, tx, ty);
    }
    if (!e.path.length) {
      e.angle = angleLerp(e.angle, Math.atan2(p.y - e.y, p.x - e.x), 1 - Math.exp(-4 * dt));
      return;
    }
    let point = e.path[0];
    if (dist(e.x, e.y, point.x, point.y) < 18) {
      e.path.shift();
      point = e.path[0];
      if (!point) return;
    }
    const a = Math.atan2(point.y - e.y, point.x - e.x);
    e.vx = damp(e.vx, Math.cos(a) * speed, 8, dt);
    e.vy = damp(e.vy, Math.sin(a) * speed, 8, dt);
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    e.angle = angleLerp(e.angle, a, 1 - Math.exp(-7 * dt));
    e.walk += dt * speed * 0.05;
  }

  updateEnemyFire(e, d, dt) {
    const p = this.player;
    if (e.reloadT > 0) return;
    if (e.mag <= 0) {
      e.reloadT = e.type === 'heavy' ? 3.2 : 2.2;
      e.mag = e.maxMag;
      e.aimT = 0;
      return;
    }
    if (e.aimT > 0) {
      e.aimT -= dt;
      e.angle = angleLerp(e.angle, Math.atan2(p.y - e.y, p.x - e.x), 1 - Math.exp(-10 * dt));
      if (e.aimT <= 0) {
        e.burstLeft = e.def.burst;
        e.shotT = 0;
      }
      return;
    }
    if (e.burstLeft > 0) {
      e.shotT -= dt;
      if (e.shotT <= 0) {
        this.enemyShoot(e, d);
        e.burstLeft--;
        e.shotT = 60 / e.def.rpm;
        if (e.burstLeft <= 0) e.fireCd = e.def.burstGap + rand(0.2, 0.7);
      }
      return;
    }
    e.fireCd -= dt;
    if (e.fireCd <= 0) e.aimT = e.def.aim;
  }

  enemyShoot(e, d) {
    const p = this.player;
    e.mag--;
    const moving = Math.hypot(p.vx, p.vy);
    const spread = e.def.spread + moving * 0.006 + (e.type === 'marksman' ? 0.2 : 0.4);
    const a = e.angle + deg((Math.random() - 0.5) * spread * 2);
    const muzzleX = e.x + Math.cos(e.angle) * (e.r + 8);
    const muzzleY = e.y + Math.sin(e.angle) * (e.r + 8);
    const speed = e.def.bulletSpeed;
    this.bullets.push({
      x: muzzleX, y: muzzleY, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, speed,
      dmg: e.def.dmg * rand(0.9, 1.1), pen: 1, owner: 'enemy', color: e.def.color,
      life: 2.2, traveled: 0, ricochets: 0, tracer: true, angle: a, enemyType: e.type,
    });
    e.muzzleT = 0.06;
    e.muzzleAngle = e.angle;
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        type: 'spark', x: muzzleX, y: muzzleY,
        vx: Math.cos(e.angle + rand(-0.4, 0.4)) * rand(60, 180),
        vy: Math.sin(e.angle + rand(-0.4, 0.4)) * rand(60, 180),
        life: rand(0.06, 0.14), max: 0.14, size: rand(1, 2), color: e.def.accent,
      });
    }
    const pan = this.renderer.panFor(muzzleX, muzzleY);
    this.audio.shoot(e.type === 'marksman' ? 'dmr' : e.type === 'heavy' ? 'lmg' : 'rifle', { enemy: true, pan });
  }

  // ------------------------------------------------------------------ bullets
  updateBullets(dt) {
    const p = this.player;
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.life -= dt;
      if (b.life <= 0) {
        this.bullets.splice(i, 1);
        continue;
      }
      const step = b.speed * dt;
      if (step <= 0.01) continue;
      const nx = b.vx / b.speed;
      const ny = b.vy / b.speed;
      const endX = b.x + nx * step;
      const endY = b.y + ny * step;
      const wallHit = this.map.raycast(b.x, b.y, endX, endY, step);
      let actor = null;
      let actorT = 1;
      if (b.owner === 'player') {
        for (const e of this.enemies) {
          if (e.dead) continue;
          const t = segCircle(b.x, b.y, endX, endY, e.x, e.y, e.r + 2);
          if (t >= 0 && t < actorT) {
            actorT = t;
            actor = e;
          }
        }
      } else if (p && !p.dead && p.invuln <= 0) {
        const t = segCircle(b.x, b.y, endX, endY, p.x, p.y, p.r + 1);
        if (t >= 0) {
          actorT = t;
          actor = p;
        }
      }
      const wallT = wallHit ? wallHit.dist / step : 1;
      if (actor && actorT <= wallT) {
        const hx = b.x + nx * step * actorT;
        const hy = b.y + ny * step * actorT;
        if (b.owner === 'player') {
          const head = Math.random() < 0.1;
          this.damageEnemy(actor, b.dmg * (1 + b.traveled / 5000), b.angle, head, hx, hy, true);
          this.run.hits++;
          this.hitMarker = 0.16;
          this.hitMarkerHead = head;
          this.audio.hitmarker(head);
        } else {
          this.damagePlayer(b.dmg, b.angle, hx, hy);
        }
        this.bullets.splice(i, 1);
        continue;
      }
      if (wallHit) {
        this.handleBulletWall(b, wallHit, nx, ny, i);
        continue;
      }
      b.x = endX;
      b.y = endY;
      b.traveled += step;
      if (b.x < 0 || b.y < 0 || b.x > WORLD_W || b.y > WORLD_H) this.bullets.splice(i, 1);
    }
  }

  handleBulletWall(b, hit, nx, ny, index) {
    const thresholds = { 1: 3, 2: 1, 3: 2, 4: 0, 5: 4 };
    const mults = { 1: 0.32, 2: 0.62, 3: 0.45, 4: 0.2, 5: 0.35 };
    const threshold = thresholds[hit.tile] ?? 3;
    const isBarrel = hit.tile === 4;
    const speed = b.speed;
    const dot = (nx * hit.nx + ny * hit.ny);
    const shallow = Math.abs(dot) < 0.62;
    if (!isBarrel && shallow && b.ricochets < 1 && speed > 650 && Math.random() < 0.3) {
      const d = nx * hit.nx + ny * hit.ny;
      const rx = nx - 2 * d * hit.nx;
      const ry = ny - 2 * d * hit.ny;
      b.x = hit.x + hit.nx * 4;
      b.y = hit.y + hit.ny * 4;
      b.vx = rx * speed * 0.62;
      b.vy = ry * speed * 0.62;
      b.speed = speed * 0.62;
      b.dmg *= 0.7;
      b.ricochets++;
      b.pen = Math.max(0, b.pen - 1);
      this.audio.ricochet(this.renderer.panFor(hit.x, hit.y));
      for (let i = 0; i < 4; i++) {
        this.particles.push({
          type: 'spark', x: hit.x, y: hit.y,
          vx: hit.nx * rand(60, 220) + rand(-80, 80), vy: hit.ny * rand(60, 220) + rand(-80, 80),
          life: rand(0.1, 0.25), max: 0.25, size: rand(1, 2), color: '#ffd28a',
        });
      }
      return;
    }
    const prop = this.map.hp.get(hit.ty * 50 + hit.tx);
    if (prop) {
      const res = this.map.damageTile(hit.tx, hit.ty, b.dmg * 1.8);
      if (res?.destroyed) {
        if (res.type === 4) {
          const cxp = hit.tx * 40 + 20;
          const cyp = hit.ty * 40 + 20;
          this.chain.push({ x: cxp, y: cyp, t: 0.06 });
        } else {
          this.debris(hit.tx, hit.ty, res.type);
        }
      }
    }
    if (b.pen >= threshold) {
      b.x = hit.x + nx * 5;
      b.y = hit.y + ny * 5;
      b.dmg *= mults[hit.tile] ?? 0.4;
      b.speed *= 0.82;
      b.vx *= 0.82;
      b.vy *= 0.82;
      b.pen = Math.max(0, b.pen - 1);
      this.particles.push({
        type: 'debris', x: hit.x, y: hit.y, vx: hit.nx * rand(20, 100), vy: hit.ny * rand(20, 100),
        life: 0.4, max: 0.4, size: rand(1, 2.5), color: '#b8c4cf', rot: rand(0, 6), spin: rand(-8, 8),
      });
      return;
    }
    this.markDecal('hole', hit.x, hit.y, rand(0, 6));
    this.bullets.splice(index, 1);
    this.audio.impact(this.renderer.panFor(hit.x, hit.y));
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        type: 'spark', x: hit.x, y: hit.y,
        vx: hit.nx * rand(40, 150) + rand(-60, 60), vy: hit.ny * rand(40, 150) + rand(-60, 60),
        life: rand(0.08, 0.2), max: 0.2, size: rand(1, 2), color: '#ffcf7a',
      });
    }
  }

  damageEnemy(e, amount, angle, head, hx, hy, countHit = false) {
    if (e.dead) return;
    let dmg = amount * (head ? 1.75 : 1);
    if (e.def.armor) dmg *= 1 - e.def.armor;
    e.hp -= dmg;
    e.hitFlash = 0.14;
    e.alertFlash = Math.max(e.alertFlash, 0.3);
    if (e.state === 'patrol') {
      e.state = 'search';
      e.lastKnown = { x: this.player.x, y: this.player.y };
      e.pathT = 0;
    }
    if (countHit) {
      this.texts.push({
        x: hx, y: hy - 14, text: head ? `${Math.round(dmg)}!` : `${Math.round(dmg)}`,
        color: head ? '#fbbf24' : '#f8fafc', life: 0.55, max: 0.55, size: head ? 13 : 10, vy: -34,
      });
    }
    for (let i = 0; i < (head ? 10 : 5); i++) {
      this.particles.push({
        type: 'blood', x: hx, y: hy,
        vx: Math.cos(angle + rand(-0.9, 0.9)) * rand(30, 160),
        vy: Math.sin(angle + rand(-0.9, 0.9)) * rand(30, 160),
        life: rand(0.2, 0.55), max: 0.55, size: rand(1.5, 3.6), color: '#a51d24',
      });
    }
    if (Math.random() < 0.45) this.markDecal('blood', hx + rand(-10, 10), hy + rand(-10, 10), rand(0, 6), rand(0.5, 0.9));
    if (e.hp <= 0) this.killEnemy(e, head, angle);
  }

  killEnemy(e, head, angle) {
    if (e.dead) return;
    e.dead = true;
    this.run.kills++;
    if (head) this.run.headshots++;
    this.save.stats.kills++;
    this.markDecal('corpse', e.x, e.y, angle, e.type === 'heavy' ? 1.3 : 1);
    this.markDecal('blood', e.x, e.y, rand(0, 6), 1.2);
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        type: 'blood', x: e.x, y: e.y,
        vx: rand(-140, 140), vy: rand(-140, 140),
        life: rand(0.25, 0.7), max: 0.7, size: rand(1.5, 4), color: '#8f171d',
      });
    }
    this.ui.addKillfeed(e.def.name, head);
    if (this.skirmish || Math.random() < 0.58) {
      const roll = Math.random();
      let type = 'ammo';
      if (roll > 0.78) type = 'med';
      else if (roll > 0.62) type = 'armor';
      this.pickups.push({ type, x: e.x + rand(-10, 10), y: e.y + rand(-10, 10), life: 28, max: 28, bob: rand(0, 6) });
    }
    e.hp = 0;
  }

  damagePlayer(amount, angle, hx, hy) {
    const p = this.player;
    if (p.dead || p.invuln > 0) return;
    let dmg = amount;
    if (p.armor > 0) {
      const absorbed = Math.min(p.armor, dmg * 0.62);
      p.armor -= absorbed;
      dmg -= absorbed;
    }
    p.hp -= dmg;
    this.run.damage += dmg;
    this.damageFlash = 1;
    this.renderer.shake(4 + dmg * 0.18);
    this.audio.hurt();
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        type: 'blood', x: hx, y: hy, vx: Math.cos(angle) * rand(20, 100), vy: Math.sin(angle) * rand(20, 100),
        life: rand(0.2, 0.4), max: 0.4, size: rand(1, 2.5), color: '#b91c1c',
      });
    }
    if (dmg > 14 && !this.hintsRun.has('cover')) {
      this.hintsRun.add('cover');
      this.ui.showTip('ARMOR ABSORBS DAMAGE — HARD COVER STOPS BULLETS', 3200);
    }
    if (p.hp <= 0 && !p.dead) this.playerDown();
  }

  playerDown() {
    if (this.player.dead) return;
    this.player.dead = true;
    this.state = 'results';
    this.input.mouse.down = false;
    this.input.touchFire = false;
    if (document.pointerLockElement) document.exitPointerLock?.();
    document.body.classList.remove('playing');
    this.audio.fail();
    for (let i = 0; i < 26; i++) {
      this.particles.push({
        type: 'blood', x: this.player.x, y: this.player.y,
        vx: rand(-200, 200), vy: rand(-200, 200), life: rand(0.4, 1), max: 1, size: rand(2, 5), color: '#8f171d',
      });
    }
    this.markDecal('corpse', this.player.x, this.player.y, this.player.angle, 1.1);
    const accuracy = this.run.shots ? this.run.hits / this.run.shots : 0;
    this.save.stats.shots += this.run.shots;
    this.save.stats.hits += this.run.hits;
    this.save.stats.deaths++;
    let credits = 0;
    let xp = 0;
    if (this.skirmish) {
      this.save.stats.bestSurvival = Math.max(this.save.stats.bestSurvival, this.wave - 1);
      credits = Math.max(0, this.wave - 1) * 40;
      xp = Math.round(credits * 0.7);
      this.save.credits += credits;
      this.save.xp += xp;
    }
    this.persist();
    this.pendingResults = {
      success: false, skirmish: this.skirmish, mission: this.mission, wave: this.wave,
      stats: { time: this.run.elapsed, kills: this.run.kills, accuracy, intel: this.run.intel, headshots: this.run.headshots },
      rewards: { credits, xp, base: credits, intel: 0, time: 0, accuracy: 0, kills: 0 },
      rank: '—',
    };
    this.ui.openPanel('failed', this.pendingResults);
    this.ui.refreshMenu();
  }

  debris(tx, ty, type) {
    const colors = type === 4 ? ['#8a4631', '#2f1a13'] : type === 2 ? ['#826542', '#4a3826'] : ['#b8c4cf', '#5a636b'];
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        type: 'debris', x: tx * 40 + 20, y: ty * 40 + 20,
        vx: rand(-160, 160), vy: rand(-160, 160), life: rand(0.3, 0.8), max: 0.8,
        size: rand(2, 5), color: pick(colors), rot: rand(0, 6), spin: rand(-10, 10),
      });
    }
  }

  // --------------------------------------------------------------- explosives
  updateGrenades(dt) {
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i];
      g.timer -= dt;
      g.rot += g.spin * dt;
      const nx = g.x + g.vx * dt;
      if (!this.map.solidAt(nx, g.y)) g.x = nx;
      else {
        g.vx *= -0.42;
        g.vy *= 0.78;
        this.audio.impact(0);
      }
      const ny = g.y + g.vy * dt;
      if (!this.map.solidAt(g.x, ny)) g.y = ny;
      else {
        g.vy *= -0.42;
        g.vx *= 0.78;
      }
      g.vx *= 0.985;
      g.vy *= 0.985;
      if (g.timer <= 0) {
        this.explode(g.x, g.y, 155, 100);
        this.grenades.splice(i, 1);
      }
    }
  }

  updateChain(dt) {
    for (let i = this.chain.length - 1; i >= 0; i--) {
      const c = this.chain[i];
      c.t -= dt;
      if (c.t <= 0) {
        this.explode(c.x, c.y, 145, 85);
        this.chain.splice(i, 1);
      }
    }
  }

  explode(x, y, radius, damage) {
    this.audio.explosion(this.renderer.panFor(x, y));
    this.renderer.shake(16);
    this.markDecal('scorch', x, y, 0, radius / 100);
    this.particles.push({ type: 'ring', x, y, vx: 0, vy: 0, life: 0.42, max: 0.42, size: radius, color: '#ffb36b' });
    this.particles.push({ type: 'flash', x, y, vx: 0, vy: 0, life: 0.28, max: 0.28, size: radius * 1.5, color: '#ffd28a' });
    for (let i = 0; i < 30; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(80, 420);
      this.particles.push({
        type: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: rand(0.2, 0.7), max: 0.7, size: rand(1, 3.2), color: pick(['#ffd28a', '#ff9a3c', '#fff3d6']),
      });
    }
    for (let i = 0; i < 18; i++) {
      this.particles.push({
        type: 'smoke', x: x + rand(-30, 30), y: y + rand(-30, 30),
        vx: rand(-50, 50), vy: rand(-50, 50), life: rand(0.6, 1.4), max: 1.4,
        size: rand(10, 26), color: '#3a3530', alpha: 0.28,
      });
    }
    for (const e of this.enemies) {
      if (e.dead) continue;
      const d = dist(x, y, e.x, e.y);
      if (d > radius + e.r) continue;
      let falloff = 1 - clamp(d / radius, 0, 1);
      const visible = this.map.los(x, y, e.x, e.y);
      if (!visible) falloff *= 0.45;
      if (falloff > 0.04) this.damageEnemy(e, damage * falloff, Math.atan2(e.y - y, e.x - x), false, e.x, e.y, false);
    }
    const p = this.player;
    if (p && !p.dead) {
      const d = dist(x, y, p.x, p.y);
      if (d < 90) this.damagePlayer((1 - d / 90) * 26, Math.atan2(p.y - y, p.x - x), p.x, p.y);
    }
    // Blow apart props, triggering chain reactions for fuel barrels.
    const minTx = Math.floor((x - radius) / 40);
    const maxTx = Math.floor((x + radius) / 40);
    const minTy = Math.floor((y - radius) / 40);
    const maxTy = Math.floor((y + radius) / 40);
    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        if (!this.map.hp.has(ty * 50 + tx)) continue;
        const cx = tx * 40 + 20;
        const cy = ty * 40 + 20;
        const d = Math.hypot(cx - x, cy - y);
        if (d > radius) continue;
        const res = this.map.damageTile(tx, ty, damage * (1 - d / radius) * 2);
        if (res?.destroyed) {
          if (res.type === 4) this.chain.push({ x: cx, y: cy, t: rand(0.08, 0.3) });
          else this.debris(tx, ty, res.type);
        }
      }
    }
  }

  // ---------------------------------------------------------------- particles
  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.type === 'smoke') {
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.size += dt * 8;
      } else if (p.type === 'spark') {
        p.vx *= 0.94;
        p.vy *= 0.94;
      } else if (p.type === 'blood') {
        p.vx *= 0.9;
        p.vy *= 0.9;
      } else if (p.type === 'casing') {
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.rot += p.spin * dt;
      } else if (p.type === 'debris') {
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.rot += p.spin * dt;
      }
    }
    if (this.particles.length > 900) this.particles.splice(0, this.particles.length - 900);
  }

  updateTexts(dt) {
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life -= dt;
      t.y += t.vy * dt;
      t.vy *= 0.96;
      if (t.life <= 0) this.texts.splice(i, 1);
    }
  }

  updatePickups(dt) {
    const p = this.player;
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const item = this.pickups[i];
      item.life -= dt;
      item.bob += dt * 3;
      if (item.life <= 0) {
        this.pickups.splice(i, 1);
        continue;
      }
      if (dist(p.x, p.y, item.x, item.y) < 28) {
        if (item.type === 'ammo') {
          const w = this.player.weapons[0];
          const add = Math.ceil(w.def.reserve * 0.22);
          w.reserve += add;
          this.player.weapons[1].reserve += Math.ceil(SIDEARM.reserve * 0.15);
          this.texts.push({ x: p.x, y: p.y - 22, text: `+${add} AMMO`, color: '#7dd3fc', life: 0.9, max: 0.9, size: 9, vy: -26 });
          this.ui.showTip(`AMMO RESUPPLIED +${add}`, 1300);
          this.audio.pickup('ammo');
        } else if (item.type === 'med') {
          p.hp = Math.min(p.maxHp, p.hp + 30);
          this.texts.push({ x: p.x, y: p.y - 22, text: '+30 VITALS', color: '#4ade80', life: 1, max: 1, size: 10, vy: -26 });
          this.audio.pickup('med');
        } else {
          p.armor = Math.min(p.maxArmor, p.armor + 32);
          this.texts.push({ x: p.x, y: p.y - 22, text: '+32 ARMOR', color: '#38bdf8', life: 1, max: 1, size: 10, vy: -26 });
          this.audio.pickup('med');
        }
        this.pickups.splice(i, 1);
      }
    }
  }

  // --------------------------------------------------------------- objectives
  checkObjectives(dt) {
    const p = this.player;
    if (!p || p.dead) return;
    for (const item of this.map.intel) {
      if (item.taken) continue;
      if (dist(p.x, p.y, item.x, item.y) < 34) {
        item.taken = true;
        this.run.intel++;
        this.audio.pickup('intel');
        this.ui.showToast(`INTEL RECOVERED ${this.run.intel}/${this.mission.intel}`, 'good', 1800);
        this.texts.push({ x: item.x, y: item.y - 26, text: 'INTEL +1', color: '#fbbf24', life: 1.2, max: 1.2, size: 11, vy: -24 });
      }
    }
    const alive = this.aliveCount();
    if (!this.skirmish && !this.extractionActive && alive === 0) {
      this.extractionActive = true;
      this.audio.alert();
      this.ui.showToast('EXTRACTION UNLOCKED — REACH THE GREEN BEACON', 'good', 3200);
      this.ui.showTip('FOLLOW THE MINIMAP TO EXFIL', 4000);
    }
    if (!this.skirmish && this.extractionActive && dist(p.x, p.y, this.map.extraction.x, this.map.extraction.y) < 72) {
      this.finishMission();
      return;
    }
    if (this.skirmish && alive === 0 && !this.wavePending) {
      this.wavePending = true;
      this.waveTimer = 3.4;
      this.ui.showToast(`WAVE ${this.wave} CLEARED — RESUPPLYING`, 'good', 2600);
      this.audio.success();
      p.hp = Math.min(p.maxHp, p.hp + 22);
      p.armor = Math.min(p.maxArmor, p.armor + 24);
      const w = this.player.weapons[0];
      w.reserve += Math.ceil(w.def.reserve * 0.3);
      this.player.grenades = Math.min(this.player.maxGrenades, this.player.grenades + 1);
    }
  }

  spawnWave() {
    this.wave++;
    const n = this.wave;
    const comp = {
      grunt: Math.min(10, 3 + Math.ceil(n * 0.7)),
      scout: Math.min(5, Math.floor(n / 2)),
      marksman: Math.min(4, Math.floor(n / 3)),
      heavy: Math.min(3, Math.floor(n / 4)),
    };
    const types = [];
    for (const [type, count] of Object.entries(comp)) for (let i = 0; i < count; i++) types.push(type);
    const p = this.player;
    const rooms = this.map.rooms.filter((r) => r.index !== this.map.spawnRoom.index);
    for (const type of types) {
      for (let attempt = 0; attempt < 30; attempt++) {
        const room = pick(rooms);
        const spot = this.map.randomFreeSpot(room, Math.random);
        if (!spot) continue;
        if (dist(spot.x, spot.y, p.x, p.y) < 430) continue;
        const e = this.createEnemy(type, spot.x, spot.y, room.index);
        e.state = 'search';
        e.alert = 1;
        e.lastKnown = { x: p.x, y: p.y };
        e.searchT = 0;
        e.spawnFx = 0.7;
        this.enemies.push(e);
        this.particles.push({ type: 'ring', x: spot.x, y: spot.y, vx: 0, vy: 0, life: 0.5, max: 0.5, size: 34, color: e.def.color });
        break;
      }
    }
    this.ui.showToast(`WAVE ${this.wave} INBOUND`, 'bad', 2400);
    this.audio.alert();
  }

  finishMission() {
    if (this.state !== 'playing') return;
    this.state = 'results';
    this.input.touchFire = false;
    this.input.mouse.down = false;
    if (document.pointerLockElement) document.exitPointerLock?.();
    document.body.classList.remove('playing');
    const run = this.run;
    const mission = this.mission;
    const accuracy = run.shots ? run.hits / run.shots : 0;
    const time = run.elapsed;
    const base = mission.reward || 0;
    const intelBonus = run.intel * 45;
    const timeBonus = mission.par > 0 ? clamp(Math.round((mission.par - time) * 1.2), 0, 180) : 0;
    const accuracyBonus = accuracy > 0.45 ? 80 : accuracy > 0.3 ? 40 : 0;
    const killBonus = run.kills * 8;
    const total = Math.max(0, Math.round(base + intelBonus + timeBonus + accuracyBonus + killBonus));
    const xp = Math.round(total * 0.7);
    this.save.credits += total;
    this.save.xp += xp;
    if (!this.save.completed.includes(mission.id)) this.save.completed.push(mission.id);
    this.save.best[mission.id] = Math.min(this.save.best[mission.id] || 9999, time);
    this.save.intel[mission.id] = Math.max(this.save.intel[mission.id] || 0, run.intel);
    if (this.missionIndex === this.save.unlocked && this.missionIndex < 5) this.save.unlocked = this.missionIndex + 1;
    this.save.stats.missions++;
    this.save.stats.shots += run.shots;
    this.save.stats.hits += run.hits;
    this.persist();
    const healthRatio = (this.player.hp + this.player.armor * 0.4) / (this.player.maxHp + this.player.maxArmor * 0.4);
    const score = accuracy * 42 + clamp(1 - time / (mission.par || 240), 0, 1) * 28 + (run.intel / Math.max(1, mission.intel)) * 18 + healthRatio * 12;
    const rank = score >= 86 ? 'S' : score >= 72 ? 'A' : score >= 56 ? 'B' : 'C';
    this.pendingResults = {
      success: true, skirmish: false, mission, wave: 0,
      stats: { time, kills: run.kills, accuracy, intel: run.intel, headshots: run.headshots },
      rewards: { credits: total, xp, base, intel: intelBonus, time: timeBonus, accuracy: accuracyBonus, kills: killBonus },
      rank,
    };
    this.audio.success();
    this.audio.setMusicIntensity(0.3);
    this.ui.openPanel('results', this.pendingResults);
    this.ui.refreshMenu();
  }

  getObjective() {
    if (!this.player || this.skirmish) {
      return {
        kicker: 'SURVIVAL PROTOCOL',
        text: `SURVIVE WAVE ${this.wave}`,
        sub: `${this.aliveCount()} HOSTILES // BEST W${this.save.stats.bestSurvival}`,
        live: this.wavePending,
      };
    }
    if (this.extractionActive) {
      return { kicker: 'PRIMARY OBJECTIVE', text: 'REACH EXTRACTION', sub: 'EXFIL BEACON ACTIVE', live: true };
    }
    const total = Object.values(this.mission?.enemies || {}).reduce((a, b) => a + b, 0);
    return {
      kicker: 'PRIMARY OBJECTIVE',
      text: 'ELIMINATE HOSTILES',
      sub: `${this.run?.kills || 0} / ${total} // INTEL ${this.run?.intel || 0} / ${this.mission?.intel || 0}`,
      live: false,
    };
  }

  // __NEXT__
}
